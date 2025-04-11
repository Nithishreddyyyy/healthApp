import cv2
import mediapipe as mp
import numpy as np
import time

class PoseRecorder:
    def __init__(self):
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

        self.cap = cv2.VideoCapture(0)

        # Adjusted for more accurate detection
        self.similarity_threshold = 75.0
        self.hold_duration_required = 3.0
        self.hold_start = 0
        self.success_time = 0
        self.show_success = False
        self.success_count = 0

        # Focus on key points for straight leg raises
        self.key_points = [23, 24, 25, 26, 27, 28]  # Hip, knee, ankle points
        
        # Reference pose - normalized coordinates (0-1 range)
        self.reference_pose = {
            # Upper body
            11: [0.70, 0.25, 0],    # Left shoulder
            12: [0.65, 0.25, 0],    # Right shoulder
            13: [0.70, 0.35, 0],    # Left elbow
            14: [0.65, 0.35, 0],    # Right elbow
            15: [0.70, 0.45, 0],    # Left wrist
            16: [0.65, 0.45, 0],    # Right wrist
            
            # Lower body - the key points for leg raise exercise
            23: [0.70, 0.60, 0],    # Left hip
            24: [0.65, 0.60, 0],    # Right hip
            25: [0.70, 0.45, 0],    # Left knee (raised)
            26: [0.65, 0.75, 0],    # Right knee (supporting)
            27: [0.70, 0.35, 0],    # Left ankle (raised)
            28: [0.65, 0.90, 0],    # Right ankle (supporting)
        }

    def process_frame(self, frame):
        image_rgb = cv2.cvtColor(frame.copy(), cv2.COLOR_BGR2RGB)
        results = self.pose.process(image_rgb)
        image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

        if results.pose_landmarks:
            self.mp_drawing.draw_landmarks(
                image, results.pose_landmarks, self.mp_pose.POSE_CONNECTIONS,
                landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style()
            )
            
            # Draw reference pose visualization
            self.draw_reference_pose(image)
            
        return image, results.pose_landmarks

    def draw_reference_pose(self, image):
        h, w, _ = image.shape
        
        # Draw stick figure on the top right corner
        offset_x, offset_y = w - 180, 100
        scale = 150
        
        # Draw box background
        cv2.rectangle(image, 
                     (int(offset_x - 20), int(offset_y - 40)), 
                     (int(offset_x + 120), int(offset_y + scale + 10)), 
                     (0, 0, 0), -1)
        cv2.rectangle(image, 
                     (int(offset_x - 20), int(offset_y - 40)), 
                     (int(offset_x + 120), int(offset_y + scale + 10)), 
                     (0, 255, 0), 2)
        
        # Draw reference stick figure
        cv2.line(image, 
                (int(offset_x), int(offset_y)), 
                (int(offset_x), int(offset_y + scale * 0.3)), 
                (0, 255, 0), 2)  # Torso
        
        # Left leg raised
        cv2.line(image, 
                (int(offset_x), int(offset_y + scale * 0.3)), 
                (int(offset_x + scale * 0.3), int(offset_y)), 
                (0, 255, 0), 2)  # Raised leg
        
        # Right leg down
        cv2.line(image, 
                (int(offset_x), int(offset_y + scale * 0.3)), 
                (int(offset_x), int(offset_y + scale * 0.8)), 
                (0, 255, 0), 2)  # Standing leg
        
        cv2.putText(image, "Target Pose", (w - 180, 70),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    def calculate_similarity(self, landmarks):
        if not landmarks:
            return 0, {}
            
        # Extract current landmarks
        current = {i: [landmarks.landmark[i].x, landmarks.landmark[i].y, landmarks.landmark[i].z] 
                  for i in range(33) if i < len(landmarks.landmark)}
        
        # Check if we have all the necessary landmarks
        if not all(k in current for k in self.key_points):
            return 0, {"issue": "position_camera"}
            
        # Check for leg raise position
        left_hip = current[23]
        left_knee = current[25]
        left_ankle = current[27]
        right_hip = current[24]
        right_knee = current[26]
        right_ankle = current[28]
        
        # Check if either leg is raised
        left_leg_raised = left_knee[1] < left_hip[1] - 0.05  # knee is higher than hip
        right_leg_raised = right_knee[1] < right_hip[1] - 0.05
        
        # Check for leg straightness
        leg_extended = False
        feedback = {}
        
        if left_leg_raised:
            # Check if left leg is straight (knee and ankle aligned)
            knee_ankle_aligned = abs(left_knee[0] - left_ankle[0]) < 0.1
            hip_knee_aligned = abs(left_hip[0] - left_knee[0]) < 0.1
            leg_extended = knee_ankle_aligned and hip_knee_aligned
            feedback["leg"] = "left"
            if not knee_ankle_aligned or not hip_knee_aligned:
                feedback["issue"] = "straighten_leg"
        elif right_leg_raised:
            # Check if right leg is straight
            knee_ankle_aligned = abs(right_knee[0] - right_ankle[0]) < 0.1
            hip_knee_aligned = abs(right_hip[0] - right_knee[0]) < 0.1
            leg_extended = knee_ankle_aligned and hip_knee_aligned
            feedback["leg"] = "right"
            if not knee_ankle_aligned or not hip_knee_aligned:
                feedback["issue"] = "straighten_leg"
        else:
            feedback["issue"] = "raise_leg"
        
        # Calculate overall similarity score - check all relevant joints
        total_distance = 0
        point_count = 0
        
        # If left leg is raised, use the left leg reference points
        if left_leg_raised:
            reference_points = {
                23: self.reference_pose[23],  # Left hip
                25: self.reference_pose[25],  # Left knee
                27: self.reference_pose[27],  # Left ankle
            }
        # If right leg is raised, mirror the reference points
        elif right_leg_raised:
            reference_points = {
                24: self.reference_pose[23],  # Right hip (using left hip reference)
                26: self.reference_pose[25],  # Right knee (using left knee reference)
                28: self.reference_pose[27],  # Right ankle (using left ankle reference)
            }
        else:
            # No leg raised, use minimal points
            reference_points = {
                23: self.reference_pose[23],
                24: self.reference_pose[24],
            }
            
        # Calculate distance for these points
        for idx, ref in reference_points.items():
            if idx in current:
                cur = current[idx]
                dist = np.sqrt((ref[0] - cur[0])**2 + (ref[1] - cur[1])**2)
                total_distance += dist
                point_count += 1
                
        if point_count == 0:
            base_similarity = 0
        else:
            base_similarity = max(0, min(100, 100 * (1 - total_distance / point_count * 5)))
            
        # Bonus for correct leg positioning
        if leg_extended and (left_leg_raised or right_leg_raised):
            similarity = min(100, base_similarity + 15)  # Bonus for correct form
        elif left_leg_raised or right_leg_raised:
            similarity = min(100, base_similarity + 5)   # Some bonus just for raising leg
        else:
            similarity = base_similarity
            
        return similarity, feedback

    def draw_progress_bar(self, image, value, y_pos):
        w = image.shape[1]
        bar_width = int(w * 0.3)
        bar_height = 20
        bar_x = 20
        
        # Draw empty bar
        cv2.rectangle(image, (bar_x, y_pos), (bar_x + bar_width, y_pos + bar_height), (50, 50, 50), -1)
        
        # Draw filled portion
        filled_width = int(bar_width * (value / 100))
        cv2.rectangle(image, (bar_x, y_pos), (bar_x + filled_width, y_pos + bar_height), 
                      (0, 255, 0) if value >= self.similarity_threshold else (0, 165, 255), -1)
        
        # Draw border
        cv2.rectangle(image, (bar_x, y_pos), (bar_x + bar_width, y_pos + bar_height), (200, 200, 200), 1)
        
        # Draw text
        cv2.putText(image, f"{int(value)}%", (bar_x + bar_width + 10, y_pos + 15),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

    def run(self):
        print("▶️ Straight Leg Raises detector started")
        print("📋 Instructions:")
        print("  1. Stand sideways to the camera")
        print("  2. Raise one leg straight out in front of you")
        print("  3. Hold the position for 3 seconds")
        print("⏳ Complete 3 successful holds to finish the exercise.")
        print("❌ Press ESC to exit.")

        while True:
            ret, frame = self.cap.read()
            if not ret:
                print("❌ Failed to grab frame.")
                break

            frame = cv2.flip(frame, 1)
            frame = cv2.resize(frame, (960, 540))
            processed_image, landmarks = self.process_frame(frame)

            # Create header bar
            cv2.rectangle(processed_image, (0, 0), (processed_image.shape[1], 60), (50, 50, 50), -1)
            cv2.putText(processed_image, "Straight Leg Raises Exercise", (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)
            
            # Draw progress indicators for successful holds
            for i in range(3):
                color = (0, 255, 0) if i < self.success_count else (100, 100, 100)
                cv2.circle(processed_image, (processed_image.shape[1] - 100 + i*30, 30), 10, color, -1)

            if landmarks:
                similarity, feedback = self.calculate_similarity(landmarks)
                
                # Display progress bar
                self.draw_progress_bar(processed_image, similarity, 90)
                
                # Display feedback
                feedback_text = ""
                if "issue" in feedback:
                    if feedback["issue"] == "position_camera":
                        feedback_text = "Position yourself sideways to the camera"
                    elif feedback["issue"] == "raise_leg":
                        feedback_text = "Raise one leg straight out in front of you"
                    elif feedback["issue"] == "straighten_leg":
                        leg = "left" if feedback.get("leg") == "left" else "right"
                        feedback_text = f"Straighten your {leg} leg"
                
                if feedback_text:
                    cv2.putText(processed_image, feedback_text, (20, 130),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 120, 255), 2)

                # Check if pose is held correctly
                if similarity >= self.similarity_threshold:
                    if self.hold_start == 0:
                        self.hold_start = time.time()
                    
                    hold_time = time.time() - self.hold_start
                    if hold_time < self.hold_duration_required:
                        # Show hold progress bar
                        hold_percent = (hold_time / self.hold_duration_required) * 100
                        bar_width = int(300 * (hold_percent / 100))
                        cv2.rectangle(processed_image, (20, 160), (20 + 300, 180), (50, 50, 50), -1)
                        cv2.rectangle(processed_image, (20, 160), (20 + bar_width, 180), (0, 255, 0), -1)
                        cv2.rectangle(processed_image, (20, 160), (20 + 300, 180), (255, 255, 255), 1)
                        cv2.putText(processed_image, f"Hold: {seconds_left:.1f}s", (330, 175),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
                        
                        # Show countdown
                        seconds_left = max(0, self.hold_duration_required - hold_time)
                        cv2.putText(processed_image, f"Hold: {seconds_left:.1f}s", (20, 210),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 165, 255), 2)
                    elif not self.show_success:
                        self.success_time = time.time()
                        self.show_success = True
                        self.success_count += 1
                        print(f"🎉 SUCCESS #{self.success_count}: Straight leg raise held correctly for 3 seconds!")
                else:
                    self.hold_start = 0
                
                # Show success message for 3 seconds
                if self.show_success:
                    if time.time() - self.success_time < 3.0:
                        cv2.rectangle(processed_image, 
                                     (int(processed_image.shape[1]/2)-200, 30), 
                                     (int(processed_image.shape[1]/2)+200, 80), 
                                     (0, 100, 0), -1)
                        cv2.putText(processed_image, "✅ Perfect form!", (int(processed_image.shape[1]/2)-150, 65),
                                    cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)
                    else:
                        self.show_success = False
                        if self.success_count >= 3:
                            cv2.putText(processed_image, "🎉 Exercise Complete! Great job!", 
                                       (int(processed_image.shape[1]/2)-250, 65),
                                       cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)
                            print("🏆 EXERCISE COMPLETE: You've successfully completed 3 leg raises!")
                            cv2.imshow('Straight Leg Raises Exercise', processed_image)
                            cv2.waitKey(3000)  # Show completion message for 3 seconds
                            break

            # Add help text at bottom
            cv2.rectangle(processed_image, (0, processed_image.shape[0]-40), 
                         (processed_image.shape[1], processed_image.shape[0]), (50, 50, 50), -1)
            cv2.putText(processed_image, "Stand sideways, raise & straighten one leg straight out", 
                       (20, processed_image.shape[0] - 15), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

            cv2.imshow('Straight Leg Raises Exercise', processed_image)
            if cv2.waitKey(1) & 0xFF == 27:
                break

        self.cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    PoseRecorder().run()