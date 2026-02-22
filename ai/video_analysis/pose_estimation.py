# ==================================================
# SportVerse AI – Real Pose Estimation (MediaPipe)
# ==================================================
# Processes video files frame-by-frame with MediaPipe Pose.
# Returns structured landmark + angle data for every
# sampled frame.  NO synthetic / mock data.
# ==================================================

import math
import numpy as np

try:
    import cv2
    from mediapipe.python.solutions import pose as mp_pose
    from mediapipe.python.solutions import drawing_utils as mp_drawing
    MEDIAPIPE_AVAILABLE = True
    print("✅ MediaPipe & OpenCV loaded successfully")
except ImportError as e:
    MEDIAPIPE_AVAILABLE = False
    print(f"⚠️  MediaPipe / OpenCV not installed – pose detection unavailable: {e}")


class PoseEstimator:
    """Real MediaPipe-based pose estimator."""

    # Landmark indices (MediaPipe Pose 33-point model)
    LANDMARKS = {
        "nose": 0,
        "left_shoulder": 11, "right_shoulder": 12,
        "left_elbow": 13,    "right_elbow": 14,
        "left_wrist": 15,    "right_wrist": 16,
        "left_hip": 23,      "right_hip": 24,
        "left_knee": 25,     "right_knee": 26,
        "left_ankle": 27,    "right_ankle": 28,
    }

    def __init__(self):
        if MEDIAPIPE_AVAILABLE:
            self.pose = mp_pose.Pose(
                static_image_mode=False,
                model_complexity=1,          # balanced accuracy/speed
                smooth_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5,
            )
            print("✅ MediaPipe Pose initialised (complexity=1)")
        else:
            self.pose = None

    # ------------------------------------------------------------------
    def process_video(self, video_path: str) -> dict:
        """
        Run pose estimation on a video file.
        Returns structured dict with per-frame landmarks, angles, and
        aggregate statistics.
        """
        if not MEDIAPIPE_AVAILABLE:
            raise RuntimeError("MediaPipe is not installed. Cannot analyse video.")

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise FileNotFoundError(f"Cannot open video: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps

        # Sample ~5 fps for efficiency
        sample_interval = max(1, int(fps / 5))

        frames = []
        frame_idx = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame_idx += 1
            if frame_idx % sample_interval != 0:
                continue

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = self.pose.process(rgb)

            if result.pose_landmarks:
                lm = result.pose_landmarks.landmark
                landmarks = {
                    name: {
                        "x": round(lm[idx].x, 4),
                        "y": round(lm[idx].y, 4),
                        "z": round(lm[idx].z, 4),
                        "visibility": round(lm[idx].visibility, 4),
                    }
                    for name, idx in self.LANDMARKS.items()
                }
                angles = self._compute_angles(lm)
                frames.append({
                    "frame": frame_idx,
                    "timestamp": round(frame_idx / fps, 2),
                    "landmarks": landmarks,
                    "angles": angles,
                })

        cap.release()

        if not frames:
            raise ValueError("No human pose detected in any frame of the video.")

        return {
            "video_info": {
                "fps": round(fps, 1),
                "total_frames": total_frames,
                "duration_seconds": round(duration, 2),
                "frames_analysed": len(frames),
            },
            "frames": frames,
            "summary": self._summarise(frames),
        }

    # ------------------------------------------------------------------
    def _compute_angles(self, lm) -> dict:
        """Compute key joint angles from landmarks."""
        def angle(a, b, c):
            """Angle at joint b formed by segments a-b and b-c."""
            ax, ay = lm[a].x, lm[a].y
            bx, by = lm[b].x, lm[b].y
            cx, cy = lm[c].x, lm[c].y
            ba = (ax - bx, ay - by)
            bc = (cx - bx, cy - by)
            dot = ba[0] * bc[0] + ba[1] * bc[1]
            mag = math.sqrt(ba[0]**2 + ba[1]**2) * math.sqrt(bc[0]**2 + bc[1]**2)
            if mag == 0:
                return 0.0
            cos_angle = max(-1, min(1, dot / mag))
            return round(math.degrees(math.acos(cos_angle)), 1)

        return {
            "left_elbow":     angle(11, 13, 15),
            "right_elbow":    angle(12, 14, 16),
            "left_shoulder":  angle(13, 11, 23),
            "right_shoulder": angle(14, 12, 24),
            "left_hip":       angle(11, 23, 25),
            "right_hip":      angle(12, 24, 26),
            "left_knee":      angle(23, 25, 27),
            "right_knee":     angle(24, 26, 28),
        }

    # ------------------------------------------------------------------
    def _summarise(self, frames: list) -> dict:
        """Aggregate statistics over all analysed frames."""
        all_angles = {}
        for f in frames:
            for name, val in f["angles"].items():
                all_angles.setdefault(name, []).append(val)

        stats = {}
        for name, vals in all_angles.items():
            arr = np.array(vals)
            stats[name] = {
                "mean": round(float(arr.mean()), 1),
                "std": round(float(arr.std()), 1),
                "min": round(float(arr.min()), 1),
                "max": round(float(arr.max()), 1),
            }

        # Visibility-weighted body detection confidence
        vis_scores = []
        for f in frames:
            vis = [v["visibility"] for v in f["landmarks"].values()]
            vis_scores.append(np.mean(vis))

        return {
            "angle_statistics": stats,
            "avg_detection_confidence": round(float(np.mean(vis_scores)), 3),
            "total_pose_detections": len(frames),
        }
