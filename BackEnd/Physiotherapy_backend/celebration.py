import numpy as np
import cv2
import time

class Celebration:
    def __init__(self):
        # Initialize celebration parameters
        self.is_celebrating = False
        self.celebration_start_time = 0
        self.celebration_duration = 5.0  # Celebration lasts for 5 seconds
        self.confetti_particles = []
        self.max_particles = 150
        self.message_shown = False
        self.message_displayed = False
        self.video_paused = False  # Flag to indicate if video is paused
        self.should_exit = False   # Flag to indicate if program should exit
        self.should_restart = False  # Flag to indicate if program should restart
        
    def start_celebration(self):
        """Start the celebration animation"""
        if not self.is_celebrating:
            self.is_celebrating = True
            self.video_paused = True  # Set video to paused when celebration starts
            self.celebration_start_time = time.time()
            self.message_shown = False
            self.message_displayed = False
            
            # Create confetti particles
            self.confetti_particles = []
            for _ in range(self.max_particles):
                self.confetti_particles.append({
                    'x': np.random.randint(0, 960),  # Random x position
                    'y': np.random.randint(-100, 0),  # Start above the screen
                    'size': np.random.randint(5, 15),  # Random size
                    'speed': np.random.uniform(2, 8),  # Random falling speed
                    'color': (np.random.randint(0, 255), 
                              np.random.randint(0, 255), 
                              np.random.randint(0, 255)),  # Random color
                    'rotation': np.random.uniform(0, 360),  # Random rotation
                    'rotation_speed': np.random.uniform(-5, 5)  # Random rotation speed
                })
    
    def update_celebration(self, frame):
        """Update and render the celebration animation on the frame"""
        if not self.is_celebrating:
            return frame
        
        # Set video_paused to True when celebration starts
        self.video_paused = True
        
        # Check if celebration should end
        current_time = time.time()
        if current_time - self.celebration_start_time > self.celebration_duration:
            # Don't end celebration automatically - wait for user input
            # self.is_celebrating = False
            pass
        
        # Create a copy of the frame to avoid modifying the original
        celebration_frame = frame.copy()
        height, width = celebration_frame.shape[:2]
        
        # Update and draw confetti particles
        for particle in self.confetti_particles:
            # Update position
            particle['y'] += particle['speed']
            particle['rotation'] += particle['rotation_speed']
            
            # Draw the confetti particle as a rotated rectangle
            size = particle['size']
            x, y = int(particle['x']), int(particle['y'])
            
            # Skip if particle is outside the frame
            if y < 0 or y >= height or x < 0 or x >= width:
                continue
                
            # Create a small colored rectangle
            rect = np.zeros((size, size, 3), dtype=np.uint8)
            rect[:] = particle['color']
            
            # Get rotation matrix
            angle = particle['rotation']
            center = (size // 2, size // 2)
            rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
            
            # Apply rotation
            rotated_rect = cv2.warpAffine(rect, rotation_matrix, (size, size))
            try:
                # Calculate the region where the particle will be placed
                y1, y2 = max(0, y), min(height, y + size)
                x1, x2 = max(0, x), min(width, x + size)
                
                # Calculate the region of the rotated rectangle to use
                rect_y1, rect_y2 = max(0, 0 - y), min(size, height - y)
                rect_x1, rect_x2 = max(0, 0 - x), min(size, width - x)
                
                # Ensure dimensions match before copying
                if (y2 - y1 == rect_y2 - rect_y1) and (x2 - x1 == rect_x2 - rect_x1):
                    # Blend the particle with the frame using alpha blending
                    alpha = 0.7  # Transparency factor
                    celebration_frame[y1:y2, x1:x2] = cv2.addWeighted(
                        celebration_frame[y1:y2, x1:x2], 1 - alpha,
                        rotated_rect[rect_y1:rect_y2, rect_x1:rect_x2], alpha, 0
                    )
            except Exception as e:
                # Skip this particle if there's an error
                continue
            
            # Reset particles that fall off the bottom of the screen
            if y > height:
                particle['y'] = np.random.randint(-100, 0)
                particle['x'] = np.random.randint(0, width)
        
        # Display congratulatory message with options
        # Create a semi-transparent overlay for the message
        overlay = celebration_frame.copy()
        cv2.rectangle(overlay, (width//2 - 300, height//2 - 150), 
                     (width//2 + 300, height//2 + 150), (0, 0, 0), -1)
        
        # Add the message with a shadow effect for better visibility
        message = "You've successfully completed this exercise!"
        
        # Shadow text (slightly offset)
        cv2.putText(overlay, message, (width//2 - 295, height//2 - 100),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 0), 2)
        
        # Main text
        cv2.putText(overlay, message, (width//2 - 298, height//2 - 103),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
        
        # Add a celebratory emoji
        cv2.putText(overlay, "🎉", (width//2 - 320, height//2 - 100),
                   cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 2)
        cv2.putText(overlay, "🎉", (width//2 + 280, height//2 - 100),
                   cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 2)
        
        # Add options text
        options_text = "Press 1 to play again or 2 to exit"
        cv2.putText(overlay, options_text, (width//2 - 200, height//2),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        
        # Add key instructions
        cv2.putText(overlay, "1: Play Again", (width//2 - 200, height//2 + 50),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        cv2.putText(overlay, "2: Exit", (width//2 - 200, height//2 + 100),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
        
        # Blend the overlay with the original frame
        alpha = 0.8  # Transparency factor
        cv2.addWeighted(overlay, alpha, celebration_frame, 1 - alpha, 0, celebration_frame)
        
        self.message_displayed = True
        
        return celebration_frame