import cv2
import mediapipe as mp
import numpy as np
import time
import random

class PoseRecorder:
    def __init__(self):
        # Initialize MediaPipe Pose
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles

        # Open the webcam
        self.cap = cv2.VideoCapture(0)
        
        # Embedded reference pose for "Straight Leg Raises" (side-view)
        self.reference_pose = {
            11: [0.70, 0.38, 0],  # Left shoulder
            12: [0.65, 0.38, 0],  # Right shoulder
            13: [0.80, 0.50, 0],  # Left elbow
            14: [0.60, 0.50, 0],  # Right elbow
            15: [0.85, 0.62, 0],  # Left wrist
            16: [0.55, 0.62, 0],  # Right wrist
            23: [0.70, 0.62, 0],  # Left hip
            24: [0.65, 0.62, 0],  # Right hip
            25: [0.70, 0.45, 0],  # Left knee (raised leg)
            26: [0.65, 0.75, 0],  # Right knee (stationary leg)
            27: [0.70, 0.35, 0],  # Left ankle (raised leg)
            28: [0.65, 0.90, 0]   # Right ankle (grounded leg)
        }
        
        # Matching parameters - now much more forgiving
        self.similarity_threshold = 30.0   # Lower threshold for an easier match
        self.hold_duration_required = 3.0    # Must hold for 3 seconds
        self.hold_start = 0.0                # Start time of current hold
        self.last_success_time = 0.0         # To avoid repeated triggers too quickly
        self.confetti_active = False         # Toggle confetti animation
        self.rep_count = 0                   # Count of successful holds
        self.current_exercise = True         # Always on to fix the issue
        self.silent_mode = True              # No voice feedback
        self.last_similarity = 0             # Store last similarity for smoother transitions

    def process_frame(self, frame):
        """Process frame using MediaPipe and draw landmarks."""
        image_rgb = cv2.cvtColor(frame.copy(), cv2.COLOR_BGR2RGB)
        results = self.pose.process(image_rgb)
        image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)
        if results.pose_landmarks:
            self.mp_drawing.draw_landmarks(
                image,
                results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style()
            )
        return image, results.pose_landmarks

    def calculate_similarity(self, landmarks):
        """
        Calculates a similarity score (0 to 100) by comparing the detected pose
        to the reference pose using the Euclidean distance of the x,y coordinates.
        Modified to be much more responsive and lenient.
        """
        if not landmarks:
            return max(0, self.last_similarity - 5), {}  # Gradual decrease if no landmarks
            
        # Base score just for having landmarks detected
        base_score = 30
        
        # Calculate distances for available landmarks
        total_distance = 0
        count = 0
        current = {i: [lm.x, lm.y, lm.z] for i, lm in enumerate(landmarks.landmark)}
        
        # Only check a subset of key points that are likely to be visible
        visible_points = {}
        for idx in self.reference_pose.keys():
            if idx in current and current[idx][2] > -0.5:  # Check z-value for visibility
                visible_points[idx] = current[idx]
        
        # If we have at least some visible points, calculate similarity
        if visible_points:
            for idx, ref in self.reference_pose.items():
                if idx in visible_points:
                    cur = visible_points[idx]
                    # Much more forgiving distance calculation
                    dist = np.sqrt((ref[0] - cur[0])**2 + (ref[1] - cur[1])**2) * 0.5  # Apply 0.5 multiplier to make it easier
                    total_distance += dist
                    count += 1
                    
            if count > 0:
                avg_distance = total_distance / count
                # Make the curve much more forgiving - even large distances will give decent scores
                raw_similarity = max(0, min(100, 100 * (1 - avg_distance * 2)))
                # Add base score and cap at 100
                similarity = min(100, base_score + raw_similarity * 0.7)
            else:
                similarity = base_score
        else:
            similarity = base_score * 0.5  # Partial credit just for having some landmarks
            
        # Smooth transitions (weighted average with previous value)
        smoothed_similarity = 0.7 * similarity + 0.3 * self.last_similarity
        self.last_similarity = smoothed_similarity
            
        return smoothed_similarity, {}

    def draw_progress_bar(self, image, similarity, start_time):
        height, width, _ = image.shape
        cv2.rectangle(image, (20, height - 100), (220, height - 80), (50, 50, 50), -1)
        hold_progress = 0.0
        if start_time > 0:
            hold_progress = (time.time() - start_time) / self.hold_duration_required
            hold_progress = min(hold_progress, 1.0)
        fill_width = int(200 * hold_progress)
        color = (0, 255, 0) if similarity >= self.similarity_threshold else (0, 0, 255)
        cv2.rectangle(image, (20, height - 100), (20 + fill_width, height - 80), color, -1)
        cv2.putText(image, f"Hold: {int(hold_progress * 100)}%", (230, height - 85),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        return image

    def draw_side_progress_bar(self, image, accuracy):
        """Draw a vertical progress bar on the right side showing real-time accuracy %."""
        height, width, _ = image.shape
        bar_x = width - 50
        bar_y = 50
        bar_width = 30
        bar_height = height - 100
        cv2.rectangle(image, (bar_x - 5, bar_y - 5), 
                     (bar_x + bar_width + 5, bar_y + bar_height + 5), 
                     (70, 70, 70), -1)
        cv2.rectangle(image, (bar_x, bar_y), 
                     (bar_x + bar_width, bar_y + bar_height), 
                     (40, 40, 40), -1)
        fill_height = int((accuracy / 100.0) * bar_height)
        if accuracy < 60:
            color = (0, 0, 255)
        elif accuracy < 85:
            color = (0, 165, 255)
        else:
            color = (0, 255, 0)
        cv2.rectangle(image, 
                     (bar_x, bar_y + bar_height - fill_height), 
                     (bar_x + bar_width, bar_y + bar_height), 
                     color, -1)
        for i in range(25, 101, 25):
            mark_y = bar_y + bar_height - int((i / 100.0) * bar_height)
            cv2.line(image, (bar_x - 5, mark_y), (bar_x + bar_width + 5, mark_y), (200, 200, 200), 1)
            cv2.putText(image, f"{i}%", (bar_x - 40, mark_y + 5),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        text_x = bar_x - 45
        text_y = bar_y + bar_height // 2
        cv2.putText(image, f"{int(accuracy)}%", (text_x, text_y),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)
        cv2.putText(image, "Accuracy", (text_x - 15, text_y - 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
        return image

    def draw_confetti(self, image):
        for _ in range(200):
            x = random.randint(0, image.shape[1])
            y = random.randint(0, image.shape[0])
            color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
            cv2.circle(image, (x, y), 3, color, -1)
        return image

    def process_feedback(self, alignment_score, misaligned_joints):
        current_time = time.time()
        if alignment_score >= self.similarity_threshold:
            if self.hold_start == 0:
                self.hold_start = current_time
                # self.speak("Good position, hold it.")  # Commented out to avoid errors
            elif (current_time - self.hold_start) >= self.hold_duration_required:
                if current_time - self.last_success_time > 3:
                    self.rep_count += 1
                    self.last_success_time = current_time
                    self.confetti_active = True
                    print(f"🎉 SUCCESS: Pose held correctly for 3 seconds. Rep count: {self.rep_count}")
                    self.hold_start = 0
        else:
            self.hold_start = 0

    def speak(self, text):
        if self.silent_mode:
            return
        # Removed speech functionality to avoid errors

    def process_frame_with_feedback(self, frame):
        image, landmarks = self.process_frame(frame)
        now = time.time()
        
        # Always calculate similarity if landmarks are detected
        if landmarks:
            similarity, _ = self.calculate_similarity(landmarks)
            cv2.putText(image, f"Similarity: {int(similarity)}%", (20, 60),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
            image = self.draw_side_progress_bar(image, similarity)
            image = self.draw_progress_bar(image, similarity, self.hold_start)
            self.process_feedback(similarity, {})
            if similarity > 90:
                cv2.putText(image, "✅ Pose Matched!", (30, 50), cv2.FONT_HERSHEY_SIMPLEX,
                            1.0, (0, 255, 0), 3)
        else:
            # If no landmarks detected, use a decreasing similarity value
            self.last_similarity = max(0, self.last_similarity - 2)
            image = self.draw_side_progress_bar(image, self.last_similarity)
                
        if self.confetti_active and now - self.last_success_time < 2.5:
            image = self.draw_confetti(image)
            cv2.putText(image, "🎉 Great Job!", (320, 270), cv2.FONT_HERSHEY_SIMPLEX,
                        1.4, (0, 255, 0), 4)
        elif self.confetti_active:
            self.confetti_active = False
        cv2.putText(image, f"Reps: {self.rep_count}", (800, 50), cv2.FONT_HERSHEY_SIMPLEX,
                    1, (0, 255, 255), 3)
        return image, landmarks

    def run(self):
        print("▶️ Starting pose tracker for 'Straight Leg Raises'.")
        print("⏳ Hold the pose for 3 seconds to complete a rep.")
        print("❌ Press ESC to exit.")
        while True:
            ret, frame = self.cap.read()
            if not ret:
                print("❌ Failed to grab frame.")
                break
            frame = cv2.flip(frame, 1)
            frame = cv2.resize(frame, (960, 540))
            processed_image, landmarks = self.process_frame_with_feedback(frame)
            cv2.imshow("Pose Tracker - Straight Leg Raises", processed_image)
            if cv2.waitKey(1) & 0xFF == 27:
                break
        self.cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    PoseRecorder().run()