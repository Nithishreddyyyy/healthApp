from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import numpy as np
import cv2
import mediapipe as mp
import time
import threading
import atexit
import os
import csv
import datetime
import random
from firebase_admin import db
import firebase_admin
from firebase_admin import credentials
from threading import Lock

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allow frontend to call this API

# ===== MEDICAL CHATBOT CONFIGURATION =====
# Hardcoded API Key (Note: This is not secure for production!)
GEMINI_API_KEY = "AIzaSyCD-dMInPnDnO6ATzpj7hiQUqUC-BF_Vi0"

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)
medical_model = genai.GenerativeModel("gemini-1.5-pro")

# System prompt to ensure medical accuracy
MEDICAL_PROMPT = """
You are a medical assistant chatbot. Follow these rules:
- Provide **accurate, evidence-based** medical information.
- Keep your response crisp
- Be concise but thorough.
- Never diagnose; suggest consulting a doctor.
- If unsure, say "I recommend checking with a healthcare professional."
- For medications, mention:
  - Common side effects
  - Typical dosages (but clarify it varies)
  - Major contraindications
"""

# ===== FIREBASE CONFIGURATION =====
cred = credentials.Certificate("bgsce-c64ca-firebase-adminsdk-fbsvc-789243b400.json")
firebase_admin.initialize_app(cred,
                              {
                                  'databaseURL':'https://bgsce-c64ca-default-rtdb.asia-southeast1.firebasedatabase.app/'
                              })

ref = db.reference('/')

# ===== EXERCISE TRACKING CONFIGURATION =====
REPS_DATA_FILE = 'total_reps_data.csv'

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Shared data with thread-safe locking
data_lock = Lock()
shared_data = {
    'movement_counter': 0,
    'session_id': None,
    'last_positions': [],
    'last_movement_time': 0,
    'camera_active': True,
    'total_reps': 0  # Will be updated in load_total_reps
}

# Camera configuration
movement_cooldown = 0.5  # seconds between counting movements

# ===== HELPER FUNCTIONS =====

def load_total_reps():
    """Load total reps from CSV file"""
    total_reps = 0
    
    # Create file with headers if it doesn't exist
    if not os.path.exists(REPS_DATA_FILE):
        with open(REPS_DATA_FILE, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['date', 'time', 'total_reps'])
    else:
        # Read the last row to get current total
        try:
            with open(REPS_DATA_FILE, 'r') as file:
                reader = csv.reader(file)
                rows = list(reader)
                if len(rows) > 1:  # If there's data beyond the header
                    total_reps = int(rows[-1][2])  # Get the last recorded total
        except (IndexError, ValueError):
            # If there's an error reading, start from 0
            total_reps = 0
            
    return total_reps

def save_total_reps(total_reps):
    """Save total reps to CSV file with timestamp"""
    now = datetime.datetime.now()
    date_str = now.strftime('%Y-%m-%d')
    time_str = now.strftime('%H:%M:%S')
    
    with open(REPS_DATA_FILE, 'a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([date_str, time_str, total_reps])

def get_medical_response(user_query):
    """Get a safe, medically-reviewed response from Gemini."""
    try:
        response = medical_model.generate_content(
            MEDICAL_PROMPT + user_query,
            safety_settings={
                'HARM_CATEGORY_HARASSMENT': 'BLOCK_MEDIUM_AND_ABOVE',
            }
        )
        return response.text
    except Exception as e:
        return f"Error: {str(e)}"

def camera_processing():
    """Process camera feed for exercise tracking"""
    cap = cv2.VideoCapture(0)  # Use 0 for default camera
    if not cap.isOpened():
        print("Error: Could not open camera")
        return

    print("Camera started...")
    
    while shared_data['camera_active']:
        ret, frame = cap.read()
        if not ret:
            continue
            
        # Process frame with MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)
        
        with data_lock:
            if results.multi_hand_landmarks:
                hand_landmarks = results.multi_hand_landmarks[0]
                wrist = hand_landmarks.landmark[mp_hands.HandLandmark.WRIST]
                
                h, w = frame.shape[:2]
                x = int(wrist.x * w)
                y = int(wrist.y * h)
                
                # Track positions
                shared_data['last_positions'].append((x, y))
                if len(shared_data['last_positions']) > 15:
                    shared_data['last_positions'].pop(0)
                
                # Movement detection logic
                current_time = time.time()
                if (len(shared_data['last_positions']) >= 10 and 
                    current_time - shared_data['last_movement_time'] > movement_cooldown):
                    
                    y_positions = [pos[1] for pos in shared_data['last_positions'][-10:]]
                    max_y = max(y_positions)
                    min_y = min(y_positions)
                    range_y = max_y - min_y
                    
                    direction_changes = 0
                    for i in range(2, len(y_positions)):
                        prev_diff = y_positions[i-1] - y_positions[i-2]
                        curr_diff = y_positions[i] - y_positions[i-1]
                        if (prev_diff > 0 and curr_diff < 0) or (prev_diff < 0 and curr_diff > 0):
                            direction_changes += 1
                    
                    if range_y > 50 and direction_changes >= 2:
                        shared_data['movement_counter'] += 1
                        shared_data['total_reps'] += 1
                        shared_data['last_movement_time'] = current_time
                        shared_data['last_positions'] = []
                        save_total_reps(shared_data['total_reps'])
            
        time.sleep(0.1)  # Reduce CPU usage
        
    cap.release()
    print("Camera released")

def cleanup():
    """Cleanup function for camera thread"""
    with data_lock:
        shared_data['camera_active'] = False

# ===== API ENDPOINTS =====

# ----- Medical Chatbot Endpoints -----
@app.route('/ask', methods=['POST'])
def ask_medical_question():
    """API endpoint for medical queries."""
    data = request.json
    user_input = data.get('query', '').strip()
    
    if not user_input:
        return jsonify({"error": "Please enter a question."}), 400
    
    answer = get_medical_response(user_input)
    return jsonify({"response": answer})

# ----- Exercise Tracking Endpoints -----
@app.route('/reset_counter', methods=['POST'])
def reset_counter():
    """Reset the exercise counter for a new session"""
    data = request.json
    with data_lock:
        shared_data['session_id'] = data.get('session_id', '')
        shared_data['movement_counter'] = 0
        shared_data['last_positions'] = []
        shared_data['last_movement_time'] = 0
        
    return jsonify({
        'success': True,
        'movement_count': shared_data['movement_counter'],
        'session_id': shared_data['session_id']
    })

@app.route('/get_counter', methods=['GET'])
def get_counter():
    """Get the current exercise counter value"""
    with data_lock:
        return jsonify({
            'success': True,
            'movement_count': shared_data['movement_counter'],
            'session_id': shared_data['session_id']
        })

@app.route('/reset_total_reps', methods=['POST'])
def reset_total_reps():
    """Reset the total repetitions counter"""
    with data_lock:
        shared_data['total_reps'] = 0
        # Save the reset to CSV
        save_total_reps(0)
        return jsonify({
        'success': True,
        'total_reps': 0
    })

# ----- Firebase Database Endpoints -----
@app.route('/add_reminder', methods=['POST'])
def add_reminder():
    """Add a reminder to Firebase"""
    try:
        reminder_data = request.json
        new_reminder_ref = ref.child('reminders').push()
        new_reminder_ref.set(reminder_data)
        return jsonify({'message': 'Reminder added successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_reminders', methods=['GET'])
def get_reminders():
    """Get all reminders from Firebase"""
    try:
        reminders = ref.child('reminders').get()
        return jsonify(reminders)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/get_quote', methods=['GET'])
def get_quote():
    """Get a random motivational quote"""
    try:
        quotes = [
            "The body heals with time, the mind heals with love, and the soul heals with hope",
            "Every day you wake up is a victory. You are healing even if it is slow.",
            "Your body fought hard. Now it is time to nourish it with kindness and peace",
            "This scar? It is a badge of honor — a sign you battled and overcame"
        ]
        
        random_integer = random.randint(0, len(quotes) - 1)
        
        return jsonify({"quote": quotes[random_integer]})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500  


# ===== MAIN APPLICATION =====
if __name__ == '__main__':
    # Initialize total reps from saved data
    initial_total_reps = load_total_reps()
    print(f"Loaded initial total reps: {initial_total_reps}")
    shared_data['total_reps'] = initial_total_reps
    
    # Start camera thread
    camera_thread = threading.Thread(target=camera_processing)
    camera_thread.daemon = False
    camera_thread.start()
    
    # Register cleanup
    atexit.register(cleanup)
    
    # Start Flask app
    app.run(host='0.0.0.0', port=5000, debug=False)
