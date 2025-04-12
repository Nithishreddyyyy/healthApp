import cv2
import mediapipe as mp
import numpy as np
import pyttsx3
import threading
import time
from exercise_data import EXERCISE_LIBRARY
from celebration import Celebration

class PhysioARApp:
    def __init__(self):
        # Initialize MediaPipe Holistic with improved sensitivity settings:
        self.mp_holistic = mp.solutions.holistic
        self.holistic = self.mp_holistic.Holistic(
            static_image_mode=False,
            model_complexity=2,             # Increased from 1 to 2 for better accuracy
            smooth_landmarks=True,
            enable_segmentation=True,       # Enable segmentation for better body part isolation
            min_detection_confidence=0.5,   # Slightly lowered for higher sensitivity
            min_tracking_confidence=0.7     # Kept the same for smooth tracking
        )
        self.mp_drawing = mp.solutions.drawing_utils
        self.cap = cv2.VideoCapture(0)
        self.exercises = EXERCISE_LIBRARY
        self.current_exercise = "Straight Leg Raises"  # Default to make sure it's not None
        self.reference_landmarks = self.exercises["Straight Leg Raises"]["reference_pose"]  # Set default reference
        self.menu_active = True
        self.show_skeleton = True
        self.silent_mode = False
        self.voice_engine = pyttsx3.init()
        self.voice_engine.setProperty('rate', 150)
        self.voice_lock = threading.Lock()
        self.last_voice_time = 0
        self.last_instructions = set()
        self.instruction_cooldown = 5
        self.current_step = 0
        self.alignment_threshold = 70.0  # Increased threshold for harder success
        self.aligned_duration = 0
        self.time_required = 3.0  # Increased hold time requirement
        self.last_alignment_check = time.time()
        self.sidebar_width = 250
        self.show_sidebar = False
        self.smoothed_score = 0  # Initialize smoothed score
        
        # Enhanced body part tracking sensitivity for 3D tracking
        # Higher values = more importance in accuracy calculation
        self.leg_sensitivity = 2.0      # Increased weight for leg movements (most important)
        self.torso_sensitivity = 1.5    # Increased weight for torso (important for stability)
        self.arm_sensitivity = 1.2      # Increased weight for arms (more strict overall)
        
        # Improved smoothing for more consistent feedback
        self.alignment_scores_history = []
        self.smoothing_window = 8       # Increased window for smoother transitions

        # --- Added for demo image functionality (if used) ---
        self.pose_demo_images = []    # List to store demo images (if any)
        self.demo_cycle_period = 7.0  # Total time (seconds) to cycle through the animation
        
        # --- Added for celebration animation ---
        self.celebration = Celebration()  # Initialize celebration object
        self.celebration_triggered = False  # Flag to track if celebration has been triggered
        self.should_restart = False  # Flag to indicate if program should restart

    # --- Demo Image Loader Function (unchanged) ---
    def load_pose_demo_images(self, exercise_name):
        if exercise_name == "Straight Leg Raises":
            self.pose_demo_images = [
                cv2.imread("straight_leg_raises_step1.png", cv2.IMREAD_UNCHANGED),
                cv2.imread("straight_leg_raises_step2.png", cv2.IMREAD_UNCHANGED),
                cv2.imread("straight_leg_raises_step3.png", cv2.IMREAD_UNCHANGED)
            ]
        else:
            self.pose_demo_images = []

    # --- Overlay functions (unchanged) ---
    def overlay_transparent(self, background, overlay, x, y):
        h, w = overlay.shape[:2]
        if x + w > background.shape[1] or y + h > background.shape[0]:
            return background  # Avoid boundary issues
        if overlay.shape[2] == 4:
            alpha = overlay[:, :, 3] / 255.0
            for c in range(3):
                background[y:y+h, x:x+w, c] = (alpha * overlay[:, :, c] +
                                               (1 - alpha) * background[y:y+h, x:x+w, c])
        else:
            background[y:y+h, x:x+w] = overlay
        return background

    def overlay_image_top_left(self, background, overlay):
        scale_factor = 0.5
        overlay_resized = cv2.resize(overlay, (0, 0), fx=scale_factor, fy=scale_factor)
        x, y = 20, 20
        return self.overlay_transparent(background, overlay_resized, x, y)

    def generate_silhouette_contour(self, ref_landmarks, frame_shape):
        height, width = frame_shape[:2]
        outline_indices = [0, 11, 13, 15, 27, 25, 23, 24, 26, 28, 16, 14, 12]
        contour = []
        for idx in outline_indices:
            if idx in ref_landmarks:
                x = int(ref_landmarks[idx][0] * width)
                y = int(ref_landmarks[idx][1] * height)
                contour.append((x, y))
        return np.array(contour, dtype=np.int32)

    def display_menu(self, frame):
        height, width, _ = frame.shape
        menu_frame = frame.copy()
        overlay = menu_frame.copy()
        cv2.rectangle(overlay, (0, 0), (width, height), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.7, menu_frame, 0.3, 0, menu_frame)
        cv2.putText(menu_frame, "AR Physiotherapy", (width//2 - 150, 80),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, (255, 255, 255), 2)
        cv2.putText(menu_frame, "Select Exercise:", (width//2 - 100, 130),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)

        y_pos = 180
        for i, exercise in enumerate(self.exercises.keys()):
            cv2.putText(menu_frame, f"{i+1}. {exercise}",
                        (width//2 - 150, y_pos), cv2.FONT_HERSHEY_SIMPLEX,
                        0.7, (255, 255, 255), 2)
            y_pos += 40

        controls = ["ESC: Exit", "H: Toggle skeleton", "V: Toggle voice", "S: Toggle sidebar", "M: Return to menu"]
        y_pos = height - 180
        for control in controls:
            cv2.putText(menu_frame, control, (width//2 - 150, y_pos),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
            y_pos += 30

        return menu_frame

    def load_exercise(self, exercise_name):
        if exercise_name in self.exercises:
            self.current_exercise = exercise_name
            self.reference_landmarks = self.exercises[exercise_name]["reference_pose"]
            self.menu_active = False
            self.current_step = 0
            self.speak(f"Starting {exercise_name}. Get ready.")
            self.load_pose_demo_images(exercise_name)
            self.alignment_scores_history = []  # Reset score history
            return True
        return False

    def process_frame(self, frame):
        # Create a copy to avoid modifying the original frame
        image_rgb = cv2.cvtColor(frame.copy(), cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe Holistic - add try/except to handle potential errors
        try:
            results = self.holistic.process(image_rgb)
        except Exception as e:
            print(f"Error processing frame: {e}")
            results = None
            
        image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

        # Overlay the repeating demo image animation (if any) in the top left corner.
        if self.pose_demo_images:
            elapsed = time.time() % self.demo_cycle_period
            frame_index = int((elapsed / self.demo_cycle_period) * len(self.pose_demo_images))
            frame_index = min(frame_index, len(self.pose_demo_images) - 1)
            demo_overlay = self.pose_demo_images[frame_index]
            image = self.overlay_image_top_left(image, demo_overlay)

        # Run live pose alignment logic
        if results and results.pose_landmarks and self.current_exercise:
            # Debug visualization - draw a green box to indicate pose is detected
            cv2.rectangle(image, (10, 10), (30, 30), (0, 255, 0), -1)
            
            # Extract landmarks and calculate alignment
            alignment_score, misaligned_joints = self.calculate_alignment(results.pose_landmarks)
            
            # Apply smoothing to alignment score
            self.alignment_scores_history.append(alignment_score)
            if len(self.alignment_scores_history) > self.smoothing_window:
                self.alignment_scores_history.pop(0)
            
            # Ensure we have at least one score before calculating average
            if self.alignment_scores_history:
                self.smoothed_score = sum(self.alignment_scores_history) / len(self.alignment_scores_history)
            else:
                self.smoothed_score = 0
            
            # Process feedback based on alignment
            self.process_feedback(self.smoothed_score, misaligned_joints)
            
            # Display the accuracy score with high visibility

            # Draw side progress bar showing real-time accuracy (%)
            image = self.draw_side_progress_bar(image, self.smoothed_score)
            
            # Apply celebration animation if it's active
            if self.celebration.is_celebrating:
                image = self.celebration.update_celebration(image)
                # Add success message when celebration is active
                if self.celebration.video_paused:
                    # This message will be shown along with the options in celebration.py
                    pass

            # Show "Pose Matched!" message if high accuracy is maintained
            if self.smoothed_score > 85:  # Lowered threshold for success message
                cv2.putText(image, "✅ Pose Matched!", (30, 50), cv2.FONT_HERSHEY_SIMPLEX,
                            1.0, (0, 255, 0), 3)
        elif results and not results.pose_landmarks and self.current_exercise:
            # If we're in exercise mode but no pose is detected, show a warning
            cv2.putText(image, "No pose detected - please stand in frame", (50, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        if results and results.pose_landmarks:
            if self.show_skeleton:
                # Enhanced visualization for better feedback
                # Draw connections with thicker lines and brighter colors for legs
                custom_connections = {}
                custom_landmark_style = mp.solutions.drawing_styles.get_default_pose_landmarks_style()
                
                # Enhance visibility of leg landmarks (23-32)
                for idx in range(23, 33):
                    custom_landmark_style[idx] = mp.solutions.drawing_utils.DrawingSpec(
                        color=(0, 255, 0), thickness=2, circle_radius=4)
                
                self.mp_drawing.draw_landmarks(
                    image, results.pose_landmarks, self.mp_holistic.POSE_CONNECTIONS,
                    landmark_drawing_spec=custom_landmark_style
                )
                
                # Draw hands if detected
                if results.left_hand_landmarks:
                    self.mp_drawing.draw_landmarks(
                        image, results.left_hand_landmarks, self.mp_holistic.HAND_CONNECTIONS,
                        landmark_drawing_spec=mp.solutions.drawing_styles.get_default_hand_landmarks_style()
                    )
                if results.right_hand_landmarks:
                    self.mp_drawing.draw_landmarks(
                        image, results.right_hand_landmarks, self.mp_holistic.HAND_CONNECTIONS,
                        landmark_drawing_spec=mp.solutions.drawing_styles.get_default_hand_landmarks_style()
                    )
            
            # Show detailed sidebar if enabled
            if self.show_sidebar:
                image = self.add_sidebar(image, self.smoothed_score, misaligned_joints)
        
        return image, results.pose_landmarks if results else None

    def calculate_alignment(self, detected_landmarks):
        if not self.reference_landmarks:
            return 0, {}
        
        misaligned_joints = {}
        total_distance = 0
        total_weight = 0
        
        # Ensure we have valid landmarks before processing
        if not detected_landmarks or not detected_landmarks.landmark:
            print("Warning: No valid landmarks detected")
            return 0, {}
            
        # Extract current landmarks with error handling
        try:
            current_landmarks = {i: [lm.x, lm.y, lm.z] for i, lm in enumerate(detected_landmarks.landmark)}
        except Exception as e:
            print(f"Error extracting landmarks: {e}")
            return 0, {}
        
        # Body part indices for different sensitivity levels
        # Legs (higher sensitivity) - most important for straight leg raises
        leg_indices = [23, 24, 25, 26, 27, 28, 29, 30, 31, 32]
        # Torso (medium sensitivity)
        torso_indices = [11, 12, 13, 14, 23, 24]
        # Arms (normal sensitivity)
        arm_indices = [15, 16, 17, 18, 19, 20, 21, 22]
        
        # Specific key joints for straight leg raises (based on user-provided coordinates)
        key_straight_leg_joints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]
        
        # Slightly decreased weights for an easier challenge
        self.leg_sensitivity = 4.5      # Decreased for easier leg movement matching
        self.torso_sensitivity = 4.0    # Decreased for more forgiving torso stability
        self.arm_sensitivity = 3.5      # Decreased for easier arm positioning
        
        # Calculate the position differences with appropriate weighting
        for idx, ref_pos in self.reference_landmarks.items():
            if idx in current_landmarks:
                cur = current_landmarks[idx]
                
                # Full 3D Euclidean distance calculation (using all x, y, z coordinates)
                # Note: Z-coordinate is depth from camera (important for 3D accuracy)
                dist_3d = np.sqrt((ref_pos[0] - cur[0])**2 + 
                                  (ref_pos[1] - cur[1])**2 + 
                                  (ref_pos[2] - cur[2])**2 * 0.7)  # Z-coordinate weighted at 70%
                
                # Also calculate 2D distance for directional feedback
                dist_2d = np.sqrt((ref_pos[0] - cur[0])**2 + (ref_pos[1] - cur[1])**2)
                
                # Use the 3D distance for accuracy calculation
                dist = dist_3d * 0.35  # Make matching slightly easier (65% more forgiving)
                
                # Apply appropriate weights based on body part with stricter thresholds
                if idx in leg_indices:
                    weight = self.leg_sensitivity * 1.5  # Increased weight for legs
                    # Give extra importance to the raised leg (left leg in our reference)
                    if idx in [25, 27]:  # Left knee and ankle (raised leg)
                        weight *= 1.5  # 50% more importance for key raised leg joints
                elif idx in torso_indices:
                    weight = self.torso_sensitivity * 1.3  # Increased weight for torso
                elif idx in arm_indices:
                    weight = self.arm_sensitivity * 1.2  # Increased weight for arms
                else:
                    weight = 1.2
                
                # Give extra importance to all key joints for straight leg raises
                if idx in key_straight_leg_joints:
                    weight *= 1.35  # 35% boost for all key joints
                
                total_distance += weight * dist
                total_weight += weight
                
                # Track misalignments for feedback (using appropriate threshold)
                # More specific feedback for straight leg raises
                if dist_2d > 0.06:  # Slightly more forgiving threshold
                    # Map joint indices to human-readable names
                    joint_names = {
                        11: "Left Shoulder", 12: "Right Shoulder",
                        13: "Left Elbow", 14: "Right Elbow",
                        15: "Left Wrist", 16: "Right Wrist",
                        23: "Left Hip", 24: "Right Hip",
                        25: "Left Knee", 26: "Right Knee",
                        27: "Left Ankle", 28: "Right Ankle"
                    }
                    
                    joint_name = joint_names.get(idx, f"Joint {idx}")
                    
                    # Enhanced 3D directional feedback
                    if abs(ref_pos[2] - cur[2]) > 0.1:  # Significant depth difference
                        if ref_pos[2] < cur[2]:
                            direction = "forward"
                        else:
                            direction = "backward"
                    elif ref_pos[1] < cur[1]:
                        direction = "higher"
                    elif ref_pos[1] > cur[1]:
                        direction = "lower"
                    elif ref_pos[0] < cur[0]:
                        direction = "more to your right"
                    else:
                        direction = "more to your left"
                    
                    misaligned_joints[joint_name] = direction
        
        if total_weight == 0:
            print("Warning: No matching landmarks found between reference and current pose")
            return 40, {}  # Return a baseline score of 40% instead of 0
            
        avg_distance = total_distance / total_weight
        
        # Convert to a similarity percentage (inversely related to distance)
        # Using a stricter scale factor for more challenge
        similarity = max(0, min(100, 100 * (1 - avg_distance * 2.3)))  # More forgiving scale
        
        # No baseline minimum score - make users work from 0%
        similarity = max(similarity, 0)
        
        # Cap at 100% without any boost
        similarity = min(similarity, 100)
        
        # Print debug info
        print(f"3D Alignment score: {similarity:.2f}%, Avg distance: {avg_distance:.4f}, Misaligned joints: {len(misaligned_joints)}")
        
        return similarity, misaligned_joints

    def draw_side_progress_bar(self, image, accuracy):
        """Draw an enhanced vertical progress bar showing real-time 3D accuracy %."""
        height, width, _ = image.shape
        bar_x = width - 60  # Bar placed 60 pixels from the right edge (slightly more space)
        bar_y = 50          # Starting 50 pixels from the top
        bar_width = 40      # Wider for better visibility
        bar_height = height - 100  # Leave margin at bottom
        
        # Draw decorative container with 3D effect
        cv2.rectangle(image, (bar_x - 8, bar_y - 8), 
                     (bar_x + bar_width + 8, bar_y + bar_height + 8), 
                     (50, 50, 50), -1)  # Darker outer shadow
        cv2.rectangle(image, (bar_x - 5, bar_y - 5), 
                     (bar_x + bar_width + 5, bar_y + bar_height + 5), 
                     (80, 80, 80), -1)  # Dark gray background
        
        # Draw background for the progress bar with gradient
        cv2.rectangle(image, (bar_x, bar_y), 
                     (bar_x + bar_width, bar_y + bar_height), 
                     (30, 30, 30), -1)  # Darker inner background
        
        # Compute fill height (vertical bar grows from bottom up)
        fill_height = int((accuracy / 100.0) * bar_height)
        
        # Enhanced color gradient based on accuracy with smoother transitions
        if accuracy < 40:
            color = (0, 0, 255)  # Red for very low accuracy
        elif accuracy < 60:
            # Gradient from red to orange
            blue = 255
            green = int(165 * (accuracy - 40) / 20)
            color = (0, green, blue)
        elif accuracy < 80:
            # Gradient from orange to green
            blue = int(255 * (1 - (accuracy - 60) / 20))
            green = int(165 + (255 - 165) * (accuracy - 60) / 20)
            color = (0, green, blue)
        else:
            color = (0, 255, 0)  # Green for high accuracy
        
        # Fill bar from bottom up with 3D effect
        # Main fill
        cv2.rectangle(image, 
                     (bar_x, bar_y + bar_height - fill_height), 
                     (bar_x + bar_width, bar_y + bar_height), 
                     color, -1)
                     
        # Check if accuracy is above 70% and trigger celebration if not already triggered
        if accuracy > 70 and not self.celebration_triggered:
            self.celebration.start_celebration()
            self.celebration_triggered = True
            self.speak("Great job! You've completed the exercise successfully.")
            print("Exercise completed successfully! Press 1 to play again or 2 to exit.")
        # Reset celebration trigger if accuracy drops below 65% (with a buffer)
        elif accuracy < 65 and self.celebration_triggered:
            self.celebration_triggered = False
        
        # Highlight edge for 3D effect
        highlight_color = (min(color[0] + 50, 255), min(color[1] + 50, 255), min(color[2] + 50, 255))
        cv2.rectangle(image, 
                     (bar_x, bar_y + bar_height - fill_height), 
                     (bar_x + 5, bar_y + bar_height), 
                     highlight_color, -1)
        
        # Add percentage marks on the bar with improved visibility
        for i in range(25, 101, 25):  # 25%, 50%, 75%, 100%
            mark_y = bar_y + bar_height - int((i / 100.0) * bar_height)
            # Thicker line for better visibility
            cv2.line(image, (bar_x - 5, mark_y), (bar_x + bar_width + 5, mark_y), (200, 200, 200), 2)
            cv2.putText(image, f"{i}%", (bar_x - 40, mark_y + 5),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (220, 220, 220), 1)
        
        # Put accuracy percentage text with dynamic color and shadow for better readability
        text_x = bar_x - 50
        text_y = bar_y + bar_height // 2
        # Text shadow
        cv2.putText(image, f"{int(accuracy)}%", (text_x+2, text_y+2),
                   cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 0), 2)
        # Main text
        cv2.putText(image, f"{int(accuracy)}%", (text_x, text_y),
                   cv2.FONT_HERSHEY_SIMPLEX, 1.0, color, 2)
        
        # Add "3D Accuracy" label with shadow for better visibility
        label_x = text_x - 20
        label_y = text_y - 35
        # Shadow
        cv2.putText(image, "3D Accuracy", (label_x+1, label_y+1),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 1)
        # Main text
        cv2.putText(image, "3D Accuracy", (label_x, label_y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (220, 220, 220), 1)
        
        # Add threshold indicator line
        threshold_y = bar_y + bar_height - int((self.alignment_threshold / 100.0) * bar_height)
        cv2.line(image, (bar_x - 10, threshold_y), (bar_x + bar_width + 10, threshold_y), 
                (0, 255, 255), 2)  # Yellow line
        cv2.putText(image, "Target", (bar_x + bar_width + 15, threshold_y + 5),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
                   
        return image

    def process_feedback(self, alignment_score, misaligned_joints):
        current_time = time.time()
        if alignment_score >= self.alignment_threshold:
            if self.aligned_duration == 0:
                self.aligned_duration = current_time
                self.speak("Good position, hold it.")
            elif (current_time - self.aligned_duration) >= self.time_required:
                self.current_step += 1
                self.aligned_duration = 0
                self.speak("Perfect! Moving to next position.")
        else:
            self.aligned_duration = 0
            if (current_time - self.last_voice_time) > self.instruction_cooldown and misaligned_joints:
                priority_joints = [
                    "left tibiofemoral joint (knee)", "right tibiofemoral joint",
                    "left sacroiliac joint (hip)", "right sacroiliac joint",
                    "left acromioclavicular joint (shoulder)", "right acromioclavicular joint",
                    # Added more specific joint names for better feedback
                    "Joint 23", "Joint 24", "Joint 25", "Joint 26", "Joint 27", "Joint 28",
                    "Joint 29", "Joint 30", "Joint 31", "Joint 32"
                ]
                for joint in priority_joints:
                    if joint in misaligned_joints:
                        if "Joint" in joint:
                            # For numerical joints, provide more descriptive feedback
                            if joint in ["Joint 23", "Joint 24"]:
                                simple_name = "hip"
                            elif joint in ["Joint 25", "Joint 26"]:
                                simple_name = "knee"
                            elif joint in ["Joint 27", "Joint 28"]:
                                simple_name = "ankle"
                            elif joint in ["Joint 29", "Joint 30", "Joint 31", "Joint 32"]:
                                simple_name = "foot"
                            else:
                                simple_name = "body position"
                        else:
                            simple_name = joint.split('(')[-1].replace(')', '')  # e.g., "knee"
                            
                        instruction = f"Move your {simple_name} {misaligned_joints[joint]}"
                        instruction_key = f"{joint}_{misaligned_joints[joint]}"
                        if instruction_key not in self.last_instructions:
                            self.speak(instruction)
                            self.last_instructions.add(instruction_key)
                            self.last_instructions = set(list(self.last_instructions)[-5:])
                            break

    def add_sidebar(self, image, accuracy, misaligned_joints):
        """Add a detailed sidebar with exercise information and feedback."""
        height, width, _ = image.shape
        
        # Create sidebar background
        sidebar = np.zeros((height, self.sidebar_width, 3), dtype=np.uint8)
        sidebar[:, :] = (30, 30, 30)  # Dark gray background
        
        # Add exercise name
        cv2.putText(sidebar, "Exercise:", (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
        cv2.putText(sidebar, f"{self.current_exercise}", (10, 60), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 1)
        
        # Add current accuracy
        color = (0, 0, 255) if accuracy < 60 else (0, 165, 255) if accuracy < 85 else (0, 255, 0)
        cv2.putText(sidebar, "Accuracy:", (10, 100), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
        cv2.putText(sidebar, f"{int(accuracy)}%", (120, 100), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
        # Add step counter
        cv2.putText(sidebar, f"Step: {self.current_step + 1}", (10, 140), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
        
        # Show misaligned joints feedback
        y_pos = 190
        cv2.putText(sidebar, "Feedback:", (10, y_pos), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
        y_pos += 30
        
        if accuracy >= 90:
            cv2.putText(sidebar, "Perfect position!", (10, y_pos), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 1)
        elif misaligned_joints:
            max_joints = 3  # Limit the number of feedback items
            count = 0
            for joint, direction in misaligned_joints.items():
                if count >= max_joints:
                    break
                    
                # Convert joint number to readable name
                if "Joint" in joint:
                    if joint in ["Joint 23", "Joint 24"]:
                        joint_name = "Hip"
                    elif joint in ["Joint 25", "Joint 26"]:
                        joint_name = "Knee"
                    elif joint in ["Joint 27", "Joint 28"]:
                        joint_name = "Ankle"
                    elif joint in ["Joint 29", "Joint 30", "Joint 31", "Joint 32"]:
                        joint_name = "Foot"
                    else:
                        joint_name = joint
                else:
                    joint_name = joint.split('(')[-1].replace(')', '').title()
                
                feedback = f"• {joint_name}: Move {direction}"
                cv2.putText(sidebar, feedback, (10, y_pos), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 200, 100), 1)
                y_pos += 25
                count += 1
        else:
            cv2.putText(sidebar, "Move to match pose", (10, y_pos), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 200, 100), 1)
        
        # Add mini progress bar in sidebar
        y_pos = 340
        cv2.putText(sidebar, "Progress:", (10, y_pos), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
        y_pos += 20
        
        progress_width = self.sidebar_width - 20
        cv2.rectangle(sidebar, (10, y_pos), (10 + progress_width, y_pos + 15), (50, 50, 50), -1)
        fill_width = int((accuracy / 100.0) * progress_width)
        cv2.rectangle(sidebar, (10, y_pos), (10 + fill_width, y_pos + 15), color, -1)
        
        # Add timestamp
        time_str = time.strftime("%H:%M:%S", time.localtime())
        cv2.putText(sidebar, time_str, (10, height - 20), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (150, 150, 150), 1)
        
        # Combine sidebar with main image
        combined = np.hstack((sidebar, image))
        return combined

    def speak(self, text):
        if self.silent_mode:
            return
        self.last_voice_time = time.time()
        def speak_thread():
            with self.voice_lock:
                self.voice_engine.say(text)
                self.voice_engine.runAndWait()
        threading.Thread(target=speak_thread).start()

    def run(self):
        self.speak("Welcome to AR Physiotherapy. Press a number key to select an exercise.")
        while True:
            try:
                # Check if we should restart the program
                if self.should_restart:
                    self.should_restart = False
                    self.celebration.is_celebrating = False
                    self.celebration.video_paused = False
                    self.celebration_triggered = False
                    self.menu_active = True
                    self.speak("Welcome back to AR Physiotherapy. Press a number key to select an exercise.")
                    continue
                    
                # Only grab a new frame if video is not paused
                if not (self.celebration.is_celebrating and self.celebration.video_paused):
                    ret, frame = self.cap.read()
                    if not ret:
                        print("Failed to grab frame")
                        break
                    frame = cv2.flip(frame, 1)
                    frame = cv2.resize(frame, (960, 540))
                    
                # Process the frame
                if self.menu_active:
                    display_frame = self.display_menu(frame)
                else:
                    # If celebration is active and video is paused, we keep using the same frame
                    display_frame = self.process_frame(frame)[0]
                
                cv2.imshow('AR Physiotherapy', display_frame)
            except KeyboardInterrupt:
                print("Program interrupted by user")
                break
            except Exception as e:
                print(f"Error processing frame: {e}")
                continue
                
            # Process key presses with improved handling
            key = cv2.waitKey(1) & 0xFF
            
            # Check if celebration is active for handling special keys
            if self.celebration.is_celebrating and self.celebration.video_paused:
                # Play again (restart exercise)
                if key == ord('1'):
                    print("Restarting exercise...")
                    self.celebration.is_celebrating = False
                    self.celebration.video_paused = False
                    self.celebration_triggered = False
                    self.load_exercise(self.current_exercise)  # Reload the same exercise
                
                # Exit program
                elif key == ord('2'):
                    print("Exiting program...")
                    break
            else:
                # Regular key handling when not in celebration mode
                # Exit application
                if key == 27: 
                    break
                    
                # Toggle skeleton visualization
                elif key == ord('h'): 
                    self.show_skeleton = not self.show_skeleton
                    print(f"Skeleton display: {'ON' if self.show_skeleton else 'OFF'}")
                    
                # Toggle voice feedback
                elif key == ord('v'): 
                    self.silent_mode = not self.silent_mode
                    print(f"Voice feedback: {'OFF' if self.silent_mode else 'ON'}")
                    if not self.silent_mode:
                        self.speak("Voice feedback enabled")
                        
                # Toggle sidebar
                elif key == ord('s'): 
                    self.show_sidebar = not self.show_sidebar
                    print(f"Sidebar: {'ON' if self.show_sidebar else 'OFF'}")
                    
                # Return to menu
                elif key == ord('m'):
                    self.menu_active = True
                    print("Returned to main menu")
                    self.speak("Returned to main menu")
                    
                # Exercise selection via number keys (1-9)
                elif ord('1') <= key <= ord('9') and self.menu_active:  # Only process number keys when menu is active
                    exercise_idx = key - ord('1')
                    if exercise_idx < len(self.exercises):
                        exercise_name = list(self.exercises.keys())[exercise_idx]
                        print(f"Selected exercise: {exercise_name}")
                        self.load_exercise(exercise_name)
        self.cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    app = PhysioARApp()
    app.run()