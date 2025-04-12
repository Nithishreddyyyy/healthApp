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
            "Keep your leg comfortable and as straight as possible while lifting it upward. "
            "This modified version is designed for post-surgery rehabilitation, "
            "allowing for gentle movement and gradual improvement."
        ),
        "reference_pose": {
            # Upper Body Landmarks (for overall posture & arm positioning)
            11: [0.70, 0.38, 0],    # Left shoulder: positioned slightly to the right with moderate vertical location
            12: [0.65, 0.38, 0],    # Right shoulder: mirroring the left shoulder to maintain symmetry
            13: [0.80, 0.50, 0],    # Left elbow: a bit lower than the shoulder, showing a natural bend
            14: [0.60, 0.50, 0],    # Right elbow: mirrors the left elbow position
            15: [0.85, 0.62, 0],    # Left wrist: indicates the arm is relaxed by the side
            16: [0.55, 0.62, 0],    # Right wrist: mirrors left wrist position
            
            # Lower Body Landmarks (key for leg raise)
            23: [0.70, 0.62, 0],    # Left hip: acts as the pivot for the raised leg
            24: [0.65, 0.62, 0],    # Right hip: remains stationary on the ground
            25: [0.70, 0.45, 0],    # Left knee: raised leg, positioned higher relative to the hip
            26: [0.65, 0.75, 0],    # Right knee: remains in a slightly lower position (stationary leg)
            27: [0.70, 0.35, 0],    # Left ankle: even higher vertically, showing leg is fully extended and raised
            28: [0.65, 0.90, 0]     # Right ankle: remains near the ground, indicating the leg is stationary
        },
        "target_joints": [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28],
        "variations": ["left_leg_raised", "right_leg_raised"],
        "key_alignment_points": [23, 24, 25, 26, 27, 28],  # Focus primarily on leg positioning
        "steps": [
            "Stand sideways to the camera with a comfortable posture",
            "Keep your arms relaxed for balance and support",
            "Slowly raise one leg in front of you",
            "Raise to a comfortable height - no need to force it",
            "Try to keep the leg extended, but slight bending is okay",
            "Hold the raised position for 2 seconds",
            "Repeat 3 times, resting between repetitions"
        ],
        "common_errors": [
            "Raising the leg too high causing strain",
            "Leaning back excessively when raising the leg",
            "Moving too quickly without control",
            "Not resting between repetitions"
        ],
        "difficulty": "Beginner/Rehabilitation",
        "muscle_groups": ["Hip flexors", "Quadriceps", "Core stabilizers"],
        "min_hold_time": 2.0,  # Seconds to hold the correct pose (reduced from 3.0)
        "reps_required": 3     # Number of successful holds required
    }
}