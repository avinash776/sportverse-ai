# ==================================================
# SportVerse AI - Pose Detection Module (MediaPipe)
# ==================================================
# Uses Google's MediaPipe library for human pose estimation.
# Extracts body keypoints, calculates joint angles, and
# measures movement quality for sports analysis.
# ==================================================

import math
import random
import numpy as np

try:
    import cv2
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    print("⚠️ MediaPipe/OpenCV not available. Using synthetic pose data.")


class PoseDetector:
    """
    Detects human body poses from video frames using MediaPipe.
    Falls back to synthetic data generation if MediaPipe is not installed.
    """
    
    def __init__(self):
        if MEDIAPIPE_AVAILABLE:
            self.mp_pose = mp.solutions.pose
            self.mp_drawing = mp.solutions.drawing_utils
            self.pose = self.mp_pose.Pose(
                static_image_mode=False,
                model_complexity=1,
                smooth_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            print("✅ MediaPipe pose detector initialized")
        else:
            self.pose = None
            print("📦 Running in synthetic mode (install mediapipe for real analysis)")
    
    def detect_poses(self, video_path: str) -> dict:
        """
        Process a video file and extract pose keypoints for each frame.
        
        Args:
            video_path: Path to the video file
            
        Returns:
            Dictionary containing frame-by-frame pose data
        """
        if not MEDIAPIPE_AVAILABLE:
            return self.generate_synthetic_data('general')
        
        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                print(f"⚠️ Cannot open video: {video_path}")
                return self.generate_synthetic_data('general')
            
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = total_frames / fps if fps > 0 else 0
            
            frames_data = []
            frame_count = 0
            sample_rate = max(1, int(fps / 5))  # Sample ~5 frames per second
            
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_count += 1
                
                # Only process every Nth frame for performance
                if frame_count % sample_rate != 0:
                    continue
                
                # Convert BGR to RGB for MediaPipe
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = self.pose.process(rgb_frame)
                
                if results.pose_landmarks:
                    landmarks = []
                    for lm in results.pose_landmarks.landmark:
                        landmarks.append({
                            'x': round(lm.x, 4),
                            'y': round(lm.y, 4),
                            'z': round(lm.z, 4),
                            'visibility': round(lm.visibility, 4)
                        })
                    
                    # Calculate key angles
                    angles = self._calculate_angles(landmarks)
                    
                    frames_data.append({
                        'frame_number': frame_count,
                        'timestamp': round(frame_count / fps, 2),
                        'landmarks': landmarks,
                        'angles': angles,
                        'pose_detected': True
                    })
            
            cap.release()
            
            return {
                'total_frames': total_frames,
                'analyzed_frames': len(frames_data),
                'fps': fps,
                'duration': round(duration, 2),
                'frames': frames_data,
                'summary': self._summarize_poses(frames_data)
            }
            
        except Exception as e:
            print(f"⚠️ Video processing error: {e}")
            return self.generate_synthetic_data('general')
    
    def detect_single_image(self, image_path: str) -> dict:
        """Detect pose in a single image."""
        if not MEDIAPIPE_AVAILABLE:
            return {'error': 'MediaPipe not available', 'pose_detected': False}
        
        try:
            image = cv2.imread(image_path)
            if image is None:
                return {'error': 'Cannot read image', 'pose_detected': False}
            
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.pose.process(rgb_image)
            
            if results.pose_landmarks:
                landmarks = []
                for lm in results.pose_landmarks.landmark:
                    landmarks.append({
                        'x': round(lm.x, 4),
                        'y': round(lm.y, 4),
                        'z': round(lm.z, 4),
                        'visibility': round(lm.visibility, 4)
                    })
                
                angles = self._calculate_angles(landmarks)
                
                return {
                    'pose_detected': True,
                    'landmarks': landmarks,
                    'angles': angles,
                    'landmark_count': len(landmarks)
                }
            
            return {'pose_detected': False, 'message': 'No pose detected in image'}
            
        except Exception as e:
            return {'error': str(e), 'pose_detected': False}
    
    def _calculate_angles(self, landmarks: list) -> dict:
        """
        Calculate key body joint angles from pose landmarks.
        MediaPipe landmark indices:
            11 = left shoulder, 12 = right shoulder
            13 = left elbow, 14 = right elbow
            15 = left wrist, 16 = right wrist
            23 = left hip, 24 = right hip
            25 = left knee, 26 = right knee
            27 = left ankle, 28 = right ankle
        """
        try:
            angles = {}
            
            # Right elbow angle (shoulder-elbow-wrist)
            angles['right_elbow'] = self._calc_angle(
                landmarks[12], landmarks[14], landmarks[16]
            )
            
            # Left elbow angle
            angles['left_elbow'] = self._calc_angle(
                landmarks[11], landmarks[13], landmarks[15]
            )
            
            # Right shoulder angle (hip-shoulder-elbow)
            angles['right_shoulder'] = self._calc_angle(
                landmarks[24], landmarks[12], landmarks[14]
            )
            
            # Left shoulder angle
            angles['left_shoulder'] = self._calc_angle(
                landmarks[23], landmarks[11], landmarks[13]
            )
            
            # Right knee angle (hip-knee-ankle)
            angles['right_knee'] = self._calc_angle(
                landmarks[24], landmarks[26], landmarks[28]
            )
            
            # Left knee angle
            angles['left_knee'] = self._calc_angle(
                landmarks[23], landmarks[25], landmarks[27]
            )
            
            # Right hip angle
            angles['right_hip'] = self._calc_angle(
                landmarks[12], landmarks[24], landmarks[26]
            )
            
            # Left hip angle
            angles['left_hip'] = self._calc_angle(
                landmarks[11], landmarks[23], landmarks[25]
            )
            
            return {k: round(v, 1) for k, v in angles.items()}
            
        except (IndexError, KeyError):
            return {}
    
    def _calc_angle(self, point_a: dict, point_b: dict, point_c: dict) -> float:
        """Calculate angle at point_b formed by points a-b-c in degrees."""
        try:
            a = np.array([point_a['x'], point_a['y']])
            b = np.array([point_b['x'], point_b['y']])
            c = np.array([point_c['x'], point_c['y']])
            
            ba = a - b
            bc = c - b
            
            cosine = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-8)
            angle = np.degrees(np.arccos(np.clip(cosine, -1.0, 1.0)))
            
            return float(angle)
        except:
            return 0.0
    
    def _summarize_poses(self, frames_data: list) -> dict:
        """Generate a summary of pose data across all frames."""
        if not frames_data:
            return {}
        
        all_angles = {}
        for frame in frames_data:
            for key, value in frame.get('angles', {}).items():
                if key not in all_angles:
                    all_angles[key] = []
                all_angles[key].append(value)
        
        summary = {}
        for key, values in all_angles.items():
            summary[key] = {
                'min': round(min(values), 1),
                'max': round(max(values), 1),
                'mean': round(np.mean(values), 1),
                'std': round(np.std(values), 1)
            }
        
        return {
            'angle_ranges': summary,
            'frames_with_pose': len(frames_data),
            'consistency_score': round(self._calculate_consistency(all_angles), 1)
        }
    
    def _calculate_consistency(self, all_angles: dict) -> float:
        """Calculate movement consistency score (lower std = more consistent)."""
        if not all_angles:
            return 50.0
        
        stds = []
        for values in all_angles.values():
            if len(values) > 1:
                stds.append(np.std(values))
        
        if not stds:
            return 50.0
        
        avg_std = np.mean(stds)
        # Convert to 0-100 score (lower variability = higher consistency)
        score = max(0, min(100, 100 - (avg_std * 2)))
        return float(score)
    
    def generate_synthetic_data(self, sport: str) -> dict:
        """
        Generate realistic synthetic pose data for demo/testing purposes.
        Used when video file is not available or MediaPipe is not installed.
        """
        num_frames = random.randint(20, 40)
        frames_data = []
        
        # Sport-specific angle ranges
        sport_ranges = {
            'cricket': {
                'right_elbow': (80, 170), 'left_elbow': (85, 165),
                'right_shoulder': (30, 150), 'left_shoulder': (25, 140),
                'right_knee': (100, 175), 'left_knee': (95, 170),
                'right_hip': (130, 175), 'left_hip': (125, 170)
            },
            'football': {
                'right_elbow': (90, 160), 'left_elbow': (95, 155),
                'right_shoulder': (20, 120), 'left_shoulder': (25, 115),
                'right_knee': (60, 175), 'left_knee': (65, 170),
                'right_hip': (100, 175), 'left_hip': (105, 170)
            },
            'badminton': {
                'right_elbow': (45, 175), 'left_elbow': (90, 160),
                'right_shoulder': (40, 175), 'left_shoulder': (30, 140),
                'right_knee': (90, 175), 'left_knee': (85, 170),
                'right_hip': (120, 175), 'left_hip': (115, 170)
            }
        }
        
        ranges = sport_ranges.get(sport, sport_ranges['cricket'])
        
        for i in range(num_frames):
            angles = {}
            for joint, (low, high) in ranges.items():
                # Add some natural progression/variation
                base = random.uniform(low, high)
                noise = random.gauss(0, 3)  # Small random variation
                angles[joint] = round(max(low, min(high, base + noise)), 1)
            
            frames_data.append({
                'frame_number': i * 6,
                'timestamp': round(i * 0.2, 2),
                'angles': angles,
                'pose_detected': True
            })
        
        return {
            'total_frames': num_frames * 6,
            'analyzed_frames': num_frames,
            'fps': 30.0,
            'duration': round(num_frames * 0.2, 2),
            'frames': frames_data,
            'summary': self._summarize_poses(frames_data),
            'synthetic': True
        }
