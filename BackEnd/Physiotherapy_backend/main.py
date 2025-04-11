import cv2
import mediapipe as mp
import numpy as np
import pyttsx3
import threading
import time
from exercise_data import EXERCISE_LIBRARY

class PhysioARApp:
    def __init__(self):
        self.mp_holistic = mp.solutions.holistic
        self.holistic = self.mp_holistic.Holistic(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        self.cap = cv2.VideoCapture(0)
        self.exercises = EXERCISE_LIBRARY
        self.current_exercise = None
        self.reference_landmarks = None
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
        self.alignment_threshold = 85.0
        self.aligned_duration = 0
        self.time_required = 2.0
        self.last_alignment_check = time.time()
        self.sidebar_width = 250
        self.show_sidebar = False

        # --- Added for demo image functionality ---
        self.pose_demo_images = []    # List to store demo images
        self.demo_cycle_period = 7.0  # Total time (seconds) to cycle through the animation

    # --- Demo Image Loader Function ---
    def load_pose_demo_images(self, exercise_name):
        if exercise_name == "Straight Leg Raises":
            self.pose_demo_images = [
                cv2.imread("straight_leg_raises_step1.png", cv2.IMREAD_UNCHANGED),
                cv2.imread("straight_leg_raises_step2.png", cv2.IMREAD_UNCHANGED),
                cv2.imread("straight_leg_raises_step3.png", cv2.IMREAD_UNCHANGED)
            ]
        else:
            self.pose_demo_images = []
        
    # --- Overlay functions for transparent images ---
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
        # Resize overlay to 50% of its original size (adjust scale factor as needed)
        scale_factor = 0.5
        overlay_resized = cv2.resize(overlay, (0, 0), fx=scale_factor, fy=scale_factor)
        # Place overlay with a margin (e.g., 20 pixels from top and left)
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
            return True
        return False

    def process_frame(self, frame):
        image_rgb = cv2.cvtColor(frame.copy(), cv2.COLOR_BGR2RGB)
        results = self.holistic.process(image_rgb)
        image = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

        # --- Overlay the repeating demo image animation in the top left corner ---
        if self.pose_demo_images:
            # Use modulo arithmetic to create a repeating cycle every demo_cycle_period seconds.
            elapsed = time.time() % self.demo_cycle_period
            frame_index = int((elapsed / self.demo_cycle_period) * len(self.pose_demo_images))
            frame_index = min(frame_index, len(self.pose_demo_images) - 1)
            demo_overlay = self.pose_demo_images[frame_index]
            image = self.overlay_image_top_left(image, demo_overlay)

        # --- Run live pose alignment logic ---
        if results.pose_landmarks and self.current_exercise:
            alignment_score, misaligned_joints = self.calculate_alignment(results.pose_landmarks)
            self.process_feedback(alignment_score, misaligned_joints)
            if alignment_score > 90:
                cv2.putText(image, "✅ Pose Matched!", (30, 50), cv2.FONT_HERSHEY_SIMPLEX,
                            1.0, (0, 255, 0), 3)

        if results.pose_landmarks:
            if self.show_skeleton:
                self.mp_drawing.draw_landmarks(
                    image, results.pose_landmarks, self.mp_holistic.POSE_CONNECTIONS,
                    landmark_drawing_spec=mp.solutions.drawing_styles.get_default_pose_landmarks_style())
                if results.left_hand_landmarks:
                    self.mp_drawing.draw_landmarks(
                        image, results.left_hand_landmarks, self.mp_holistic.HAND_CONNECTIONS,
                        landmark_drawing_spec=mp.solutions.drawing_styles.get_default_hand_landmarks_style())
                if results.right_hand_landmarks:
                    self.mp_drawing.draw_landmarks(
                        image, results.right_hand_landmarks, self.mp_holistic.HAND_CONNECTIONS,
                        landmark_drawing_spec=mp.solutions.drawing_styles.get_default_hand_landmarks_style())
            if self.show_sidebar:
                image = self.add_sidebar(image, alignment_score, misaligned_joints)

        return image, results.pose_landmarks

    def calculate_alignment(self, detected_landmarks):
        if not self.reference_landmarks:
            return 0, {}
        misaligned_joints = {}
        total_distance = 0
        landmark_count = 0
        current_landmarks = {}
        for idx, landmark in enumerate(detected_landmarks.landmark):
            current_landmarks[idx] = [landmark.x, landmark.y, landmark.z]
        for idx, ref_pos in self.reference_landmarks.items():
            if idx in current_landmarks:
                current_pos = current_landmarks[idx]
                distance = np.sqrt((ref_pos[0] - current_pos[0])**2 + (ref_pos[1] - current_pos[1])**2)
                total_distance += distance
                landmark_count += 1
                if distance > 0.05:
                    joint_name = self.get_joint_name(idx)
                    direction = self.get_correction_direction(ref_pos, current_pos)
                    misaligned_joints[joint_name] = direction
        alignment_score = max(0, min(100, 100 * (1 - (total_distance / landmark_count * 10)))) if landmark_count > 0 else 0
        contour = self.generate_silhouette_contour(self.reference_landmarks, (540, 960))
        inside_count = 0
        for idx in self.exercises[self.current_exercise]["target_joints"]:
            if idx in current_landmarks:
                x = int(current_landmarks[idx][0] * 960)
                y = int(current_landmarks[idx][1] * 540)
                if cv2.pointPolygonTest(contour, (x, y), False) >= 0:
                    inside_count += 1
        if inside_count / len(self.exercises[self.current_exercise]["target_joints"]) > 0.9:
            alignment_score = min(100, alignment_score + 10)
        return alignment_score, misaligned_joints

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
                    "left acromioclavicular joint (shoulder)", "right acromioclavicular joint"
                ]
                for joint in priority_joints:
                    if joint in misaligned_joints:
                        simple_name = joint.split('(')[-1].replace(')', '')
                        instruction = f"Move your {simple_name} {misaligned_joints[joint]}"
                        instruction_key = f"{joint}_{misaligned_joints[joint]}"
                        if instruction_key not in self.last_instructions:
                            self.speak(instruction)
                            self.last_instructions.add(instruction_key)
                            self.last_instructions = set(list(self.last_instructions)[-5:])
                            break

    def get_joint_name(self, idx):
        joint_names = {
            0: "glabella (forehead)", 1: "left medial canthus (inner eye)",
            2: "left pupil", 3: "left lateral canthus (outer eye)",
            4: "right medial canthus", 5: "right pupil",
            6: "right lateral canthus", 7: "left tragus (ear)",
            8: "right tragus", 9: "left oral commissure (mouth corner)",
            10: "right oral commissure",
            11: "left acromioclavicular joint (shoulder)",
            12: "right acromioclavicular joint",
            13: "left humeroulnar joint (elbow)",
            14: "right humeroulnar joint",
            15: "left radiocarpal joint (wrist)",
            16: "right radiocarpal joint",
            17: "left 5th metacarpophalangeal (pinky base)",
            18: "right 5th metacarpophalangeal",
            19: "left 2nd metacarpophalangeal (index base)",
            20: "right 2nd metacarpophalangeal",
            21: "left 1st carpometacarpal (thumb base)",
            22: "right 1st carpometacarpal",
            23: "left sacroiliac joint (hip)",
            24: "right sacroiliac joint",
            25: "left tibiofemoral joint (knee)",
            26: "right tibiofemoral joint",
            27: "left talocrural joint (ankle)",
            28: "right talocrural joint",
            29: "left calcaneus (heel)",
            30: "right calcaneus",
            31: "left metatarsophalangeal (foot index)",
            32: "right metatarsophalangeal",
            33: "left DIP joint - thumb",
            34: "left PIP joint - index",
        }
        return joint_names.get(idx, f"Landmark_{idx}")

    def get_correction_direction(self, ref_pos, current_pos):
        dx = ref_pos[0] - current_pos[0]
        dy = ref_pos[1] - current_pos[1]
        if abs(dx) > abs(dy):
            return "forward" if dx > 0.03 else "back" if dx < -0.03 else "slightly"
        else:
            return "down" if dy > 0.03 else "up" if dy < -0.03 else "slightly"

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
            ret, frame = self.cap.read()
            if not ret:
                print("Failed to grab frame")
                break
            frame = cv2.flip(frame, 1)
            frame = cv2.resize(frame, (960, 540))
            display_frame = self.display_menu(frame) if self.menu_active else self.process_frame(frame)[0]
            cv2.imshow('AR Physiotherapy', display_frame)
            key = cv2.waitKey(1) & 0xFF
            if key == 27: break
            elif key == ord('h'): self.show_skeleton = not self.show_skeleton
            elif key == ord('v'): self.silent_mode = not self.silent_mode
            elif key == ord('s'): self.show_sidebar = not self.show_sidebar
            elif key == ord('m'):
                self.menu_active = True
                self.speak("Returned to main menu")
            elif ord('1') <= key <= ord('9'):
                exercise_idx = key - ord('1')
                if exercise_idx < len(self.exercises):
                    exercise_name = list(self.exercises.keys())[exercise_idx]
                    self.load_exercise(exercise_name)
        self.cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    app = PhysioARApp()
    app.run()
