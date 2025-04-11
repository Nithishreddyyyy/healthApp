# exercise_data.py

# This file contains the reference poses for exercises.
# Coordinates are normalized [x, y, z] values (range: 0–1)
# Adapted for side-view camera positioning.
#
# Landmark indices reference (ignoring the head):
# 11: left shoulder, 12: right shoulder
# 13: left elbow, 14: right elbow, 15: left wrist, 16: right wrist
# 23: left hip, 24: right hip
# 25: left knee, 26: right knee
# 27: left ankle, 28: right ankle

EXERCISE_LIBRARY = {
    "Straight Leg Raises": {
        "description": (
            "Perform straight leg raises by standing sideways to the camera. "
            "Keep your leg completely straight and controlled while lifting it upward, "
            "engaging the hip flexors and quadriceps. Follow the step-by-step guide to "
            "ensure your alignment is correct."
        ),
        "reference_pose": {
            # Upper Body Landmarks (for overall posture & arm positioning)
            11: [0.70, 0.25, 0],    # Left shoulder: slight downward angle indicates relaxed shoulders.
            12: [0.65, 0.25, 0],    # Right shoulder: maintains symmetry with left.
            13: [0.70, 0.35, 0],    # Left elbow: moderately bent, comfortably relaxed.
            14: [0.65, 0.35, 0],    # Right elbow: mirrors left elbow position.
            15: [0.70, 0.45, 0],    # Left wrist: positioned for natural arm resting.
            16: [0.65, 0.45, 0],    # Right wrist: in line with left wrist.
            
            # Lower Body Landmarks (key for leg raise)
            23: [0.70, 0.60, 0],    # Left hip: central position where the raised leg pivots.
            24: [0.65, 0.60, 0],    # Right hip: remains planted on the ground.
            25: [0.70, 0.45, 0],    # Left knee: shows the position when the leg is extended and raised.
            26: [0.65, 0.75, 0],    # Right knee: remains relaxed and stationary.
            27: [0.70, 0.35, 0],    # Left ankle: elevated higher to indicate the raised leg.
            28: [0.65, 0.90, 0]     # Right ankle: stays in the original, grounded position.
        },
        "target_joints": [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28],
        "variations": ["left_leg_raised", "right_leg_raised"],
        "key_alignment_points": [23, 24, 25, 26, 27, 28],  # Focus primarily on leg positioning
        "steps": [
            "Stand sideways to the camera with your back straight",
            "Keep your arms comfortably at your sides for balance",
            "Raise one leg straight out in front of you",
            "Keep your leg fully extended without bending the knee",
            "Hold the raised position for 3 seconds",
            "Repeat 3 times to complete the exercise"
        ],
        "common_errors": [
            "Bending the knee of the raised leg",
            "Leaning back when raising the leg",
            "Not raising the leg high enough",
            "Moving too quickly without control"
        ],
        "difficulty": "Beginner",
        "muscle_groups": ["Hip flexors", "Quadriceps", "Core stabilizers"],
        "min_hold_time": 3.0,  # Seconds to hold the correct pose
        "reps_required": 3     # Number of successful holds required
    }
}