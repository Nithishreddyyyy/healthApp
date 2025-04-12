import numpy as np
import cv2
import time
import math

class Celebration:
    def __init__(self):
        # Initialize celebration parameters
        self.is_celebrating = False
        self.celebration_start_time = 0
        self.celebration_duration = 5.0  # Celebration lasts for 5 seconds
        self.confetti_particles = []
        self.max_particles = 200  # Increased number of particles
        self.message_shown = False
        self.message_displayed = False
        self.video_paused = False  # Flag to indicate if video is paused
        self.should_exit = False   # Flag to indicate if program should exit
        self.should_restart = False  # Flag to indicate if program should restart
        self.animation_time = 0  # For animations that need time-based effects
        
    def start_celebration(self):
        """Start the celebration animation"""
        if not self.is_celebrating:
            self.is_celebrating = True
            self.video_paused = True  # Set video to paused when celebration starts
            self.celebration_start_time = time.time()
            self.message_shown = False
            self.message_displayed = False
            self.animation_time = 0
            
            # Create confetti particles with more variety
            self.confetti_particles = []
            
            # Define celebratory colors
            colors = [
                (255, 223, 0),    # Gold
                (255, 0, 127),    # Pink
                (0, 191, 255),    # Deep Sky Blue
                (255, 140, 0),    # Dark Orange
                (138, 43, 226),   # Blue Violet
                (50, 205, 50),    # Lime Green
                (255, 215, 0),    # Gold
                (255, 255, 255),  # White
            ]
            
            # Create different types of particles
            for i in range(self.max_particles):
                particle_type = np.random.choice(['confetti', 'star', 'circle'], p=[0.7, 0.2, 0.1])
                
                particle = {
                    'x': np.random.randint(0, 960),  # Random x position
                    'y': np.random.randint(-200, 0),  # Start above the screen
                    'size': np.random.randint(8, 20),  # Larger size range
                    'speed': np.random.uniform(3, 10),  # Faster falling speed
                    'color': colors[np.random.randint(0, len(colors))],  # Select from palette
                    'rotation': np.random.uniform(0, 360),  # Random rotation
                    'rotation_speed': np.random.uniform(-8, 8),  # Random rotation speed
                    'type': particle_type,  # Type of particle
                    'horizontal_drift': np.random.uniform(-1.5, 1.5),  # Side-to-side movement
                    'scale_factor': np.random.uniform(0.8, 1.2),  # For pulsing effect
                    'alpha': np.random.uniform(0.6, 1.0)  # Transparency
                }
                self.confetti_particles.append(particle)
    
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
        
        # Update animation time
        self.animation_time += 0.016  # Approx 60fps
        
        # Create a copy of the frame to avoid modifying the original
        celebration_frame = frame.copy()
        height, width = celebration_frame.shape[:2]
        
        # Update and draw confetti particles
        for particle in self.confetti_particles:
            # Update position with some horizontal drift for realism
            particle['y'] += particle['speed']
            particle['x'] += particle['horizontal_drift'] * math.sin(self.animation_time * 2)
            particle['rotation'] += particle['rotation_speed']
            
            # Pulse effect for size
            pulse = 1 + 0.2 * math.sin(self.animation_time * 3 + particle['rotation'])
            current_size = int(particle['size'] * particle['scale_factor'] * pulse)
            
            # Draw different particle types
            x, y = int(particle['x']), int(particle['y'])
            
            # Skip if particle is outside the frame
            if y < 0 or y >= height or x < 0 or x >= width:
                continue
                
            if particle['type'] == 'confetti':
                # Create a small colored rectangle
                rect = np.zeros((current_size, current_size, 3), dtype=np.uint8)
                rect[:] = particle['color']
                
                # Get rotation matrix
                angle = particle['rotation']
                center = (current_size // 2, current_size // 2)
                rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
                
                # Apply rotation
                rotated_rect = cv2.warpAffine(rect, rotation_matrix, (current_size, current_size))
                
            elif particle['type'] == 'star':
                # Create a star shape
                star = np.zeros((current_size, current_size, 3), dtype=np.uint8)
                center = (current_size // 2, current_size // 2)
                radius = current_size // 2 - 1
                
                for i in range(5):  # 5-pointed star
                    angle = i * (2 * math.pi / 5) + particle['rotation'] * math.pi / 180
                    outer_x = int(center[0] + radius * math.cos(angle))
                    outer_y = int(center[1] + radius * math.sin(angle))
                    
                    inner_angle = angle + math.pi / 5
                    inner_radius = radius * 0.4
                    inner_x = int(center[0] + inner_radius * math.cos(inner_angle))
                    inner_y = int(center[1] + inner_radius * math.sin(inner_angle))
                    
                    next_angle = (i + 1) * (2 * math.pi / 5) + particle['rotation'] * math.pi / 180
                    next_x = int(center[0] + radius * math.cos(next_angle))
                    next_y = int(center[1] + radius * math.sin(next_angle))
                    
                    next_inner_angle = next_angle - math.pi / 5
                    next_inner_x = int(center[0] + inner_radius * math.cos(next_inner_angle))
                    next_inner_y = int(center[1] + inner_radius * math.sin(next_inner_angle))
                    
                    pts = np.array([[outer_x, outer_y], [inner_x, inner_y], 
                                   [center[0], center[1]], 
                                   [next_inner_x, next_inner_y], [next_x, next_y]], np.int32)
                    pts = pts.reshape((-1, 1, 2))
                    
                    cv2.fillPoly(star, [pts], particle['color'])
                
                rotated_rect = star
                
            else:  # Circle
                # Create a circle
                circle = np.zeros((current_size, current_size, 3), dtype=np.uint8)
                cv2.circle(circle, (current_size // 2, current_size // 2), 
                          current_size // 2 - 1, particle['color'], -1)
                rotated_rect = circle
            
            try:
                # Calculate the region where the particle will be placed
                y1, y2 = max(0, y), min(height, y + current_size)
                x1, x2 = max(0, x), min(width, x + current_size)
                
                # Calculate the region of the rotated rectangle to use
                rect_y1, rect_y2 = max(0, 0 - y), min(current_size, height - y)
                rect_x1, rect_x2 = max(0, 0 - x), min(current_size, width - x)
                
                # Ensure dimensions match before copying
                if (y2 - y1 == rect_y2 - rect_y1) and (x2 - x1 == rect_x2 - rect_x1):
                    # Blend the particle with the frame using alpha blending
                    alpha = particle['alpha']  # Dynamic transparency
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
        
        # Create a modern celebration card overlay
        # First add a subtle gradient background
        overlay = celebration_frame.copy()
        
        # Improved overlay with gradient effect
        card_width, card_height = 700, 400
        card_x1, card_y1 = width//2 - card_width//2, height//2 - card_height//2
        card_x2, card_y2 = width//2 + card_width//2, height//2 + card_height//2
        
        # Create gradient overlay
        gradient = np.zeros((card_height, card_width, 3), dtype=np.uint8)
        gradient.fill(0)  # Set all pixels to black
        
        # Apply the solid black background to the overlay region
        overlay[card_y1:card_y2, card_x1:card_x2] = cv2.addWeighted(
            overlay[card_y1:card_y2, card_x1:card_x2], 0,  # Set original image weight to 0
            gradient, 1.0, 1.0  # Set gradient weight to 1.0 for full opacity
        )
        for y in range(card_height):
            for x in range(card_width):
                # Create a radial gradient
                dx, dy = x - card_width//2, y - card_height//2
                distance = math.sqrt(dx*dx + dy*dy) / (card_width//2)
                intensity = max(0, 1 - distance)
                # Dark blue to purple gradient with darker background
                gradient[y, x] = (
                    int(10 + 30 * intensity),  # B
                    int(5 + 20 * intensity),   # G
                    int(25 + 40 * intensity)   # R
                )
        
        # Apply the gradient to the overlay region
        overlay[card_y1:card_y2, card_x1:card_x2] = cv2.addWeighted(
            overlay[card_y1:card_y2, card_x1:card_x2], 0.2,
            gradient, 1.0, 0
        )
        
        # Add a border to the card
        border_color = (0, 0, 0)  # Black
        border_thickness = 3
        cv2.rectangle(overlay, (card_x1, card_y1), (card_x2, card_y2), border_color, border_thickness)
        
        # Create a glowing effect around the border
        glow_iterations = 5
        for i in range(glow_iterations):
            thickness = 1
            offset = i + 1
            glow_alpha = 0.3 - (i * 0.05)
            temp = overlay.copy()
            cv2.rectangle(temp, 
                         (card_x1-offset, card_y1-offset), 
                         (card_x2+offset, card_y2+offset), 
                         border_color, thickness)
            overlay = cv2.addWeighted(overlay, 1-glow_alpha, temp, glow_alpha, 0)
        
        # Add a pulsing effect to the congratulatory message
        pulse_scale = 1 + 0.05 * math.sin(self.animation_time * 2)
        
        # Add celebratory header with shadow
        header = "CONGRATULATIONS!"
        font_scale = 1.2 * pulse_scale
        thickness = 2
        font = cv2.FONT_HERSHEY_DUPLEX
        
        # Calculate text size for centering
        text_size = cv2.getTextSize(header, font, font_scale, thickness)[0]
        text_x = width//2 - text_size[0]//2
        text_y = card_y1 + 80
        
        # Shadow text
        shadow_offset = 2
        cv2.putText(overlay, header, (text_x + shadow_offset, text_y + shadow_offset),
                   font, font_scale, (0, 0, 0), thickness+1)
        
        # Main text with gradient color
        cv2.putText(overlay, header, (text_x, text_y),
                   font, font_scale, (0, 215, 255), thickness)
        
        # Add the message
        message = "You've successfully completed this exercise!"
        font_scale = 0.9
        text_size = cv2.getTextSize(message, font, font_scale, thickness)[0]
        text_x = width//2 - text_size[0]//2
        text_y = text_y + 60
        
        # Shadow
        cv2.putText(overlay, message, (text_x + 1, text_y + 1),
                   font, font_scale, (0, 0, 0), thickness)
        
        # Main text
        cv2.putText(overlay, message, (text_x, text_y),
                   font, font_scale, (255, 255, 255), thickness)
        
        # Add decorative elements
        trophy_y = text_y + 40
        
        
        # Add animated button options
        button_y = trophy_y + 100
        button_height = 50
        button_width = 200
        button_gap = 40
        
        # Play Again button
        play_x1 = width//2 - button_width - button_gap//2
        play_x2 = play_x1 + button_width
        
        # Button animation effect
        button_pulse = 1 + 0.05 * math.sin(self.animation_time * 3)
        button_glow = int(128 + 64 * math.sin(self.animation_time * 2))
        
        # Play button background
        play_button_color = (180, 105, 255)  # Pink
        cv2.rectangle(overlay, (play_x1, button_y), (play_x2, button_y + button_height), 
                     play_button_color, -1, cv2.LINE_AA)
        
        # Play button border
        cv2.rectangle(overlay, (play_x1, button_y), (play_x2, button_y + button_height), 
                     (255, 255, 255), 2, cv2.LINE_AA)
        
        # Play text
        play_text = "1: Play Again"
        text_size = cv2.getTextSize(play_text, font, 0.7, 2)[0]
        play_text_x = play_x1 + (button_width - text_size[0])//2
        play_text_y = button_y + (button_height + text_size[1])//2
        
        cv2.putText(overlay, play_text, (play_text_x, play_text_y),
                   font, 0.7, (255, 255, 255), 2)
        
        # Exit button
        exit_x1 = width//2 + button_gap//2
        exit_x2 = exit_x1 + button_width
        
        # Exit button background
        exit_button_color = (128, 0, 128)  # Purple
        cv2.rectangle(overlay, (exit_x1, button_y), (exit_x2, button_y + button_height), 
                     exit_button_color, -1, cv2.LINE_AA)
        
        # Exit button border
        cv2.rectangle(overlay, (exit_x1, button_y), (exit_x2, button_y + button_height), 
                     (255, 255, 255), 2, cv2.LINE_AA)
        
        # Exit text
        exit_text = "2: Exit"
        text_size = cv2.getTextSize(exit_text, font, 0.7, 2)[0]
        exit_text_x = exit_x1 + (button_width - text_size[0])//2
        exit_text_y = button_y + (button_height + text_size[1])//2
        
        cv2.putText(overlay, exit_text, (exit_text_x, exit_text_y),
                   font, 0.7, (255, 255, 255), 2)
        
        # Blend the overlay with the original frame
        alpha = 0.9  # Slightly more opaque for better readability
        cv2.addWeighted(overlay, alpha, celebration_frame, 1 - alpha, 0, celebration_frame)
        
        self.message_displayed = True
        
        return celebration_frame