# ==================================================
# SportVerse AI - Video Analysis API Routes
# ==================================================
# Real AI pipeline: MediaPipe pose → feature extraction
# → Gemini coaching feedback.  NO hardcoded responses.
# ==================================================

import os
import traceback
from flask import Blueprint, request, jsonify

from video_analysis.pose_estimation import PoseEstimator, MEDIAPIPE_AVAILABLE
from video_analysis.feature_extractor import extract_features
from agents.coach_agent import generate_coaching_feedback, generate_video_training_plan

video_bp = Blueprint('video', __name__)

# Initialise the pose estimator once
_estimator = PoseEstimator()


@video_bp.route('/health', methods=['GET'])
def video_health():
    """Check if video analysis pipeline is ready."""
    return jsonify({
        'mediapipe_available': MEDIAPIPE_AVAILABLE,
        'status': 'ready' if MEDIAPIPE_AVAILABLE else 'mediapipe_not_installed',
    })


@video_bp.route('/analyze-video', methods=['POST'])
def analyze_video():
    """
    Full AI video analysis pipeline.

    Body JSON:
      video_id, video_path, sport, user_skill_level

    Returns:
      performance_analysis  – scores & detected issues
      coaching_feedback     – Gemini-generated coaching report with emoji/symbols
      training_plan         – Gemini-generated follow-up plan with schedule
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        video_path = data.get('video_path', '')
        sport = data.get('sport', 'cricket')
        skill_level = data.get('user_skill_level', 'beginner')
        video_id = data.get('video_id', '')

        # --- Step 1: Pose estimation (MediaPipe) ---
        print(f"🎬 Analyzing video: {video_id}  sport={sport}")
        if not video_path or not os.path.exists(video_path):
            return jsonify({'error': f'Video file not found: {video_path}'}), 400

        pose_data = _estimator.process_video(video_path)
        n_frames = len(pose_data.get('frames', []))
        video_info = pose_data.get('video_info', {})
        print(f"✅ Pose detection complete – {n_frames} frames analysed ({video_info.get('duration_seconds', 0)}s video)")

        # --- Step 2: Feature extraction (scores) ---
        features = extract_features(pose_data, sport)
        print(f"✅ Feature extraction complete – overall score {features['overall_score']}")

        # Add video info to features for richer AI context
        features['video_info'] = video_info
        features['detection_confidence'] = pose_data.get('summary', {}).get('avg_detection_confidence', 0)

        # --- Step 3: Gemini coaching feedback ---
        coaching = generate_coaching_feedback(features, sport, skill_level)
        print("✅ Gemini coaching feedback generated")

        # --- Step 4: Gemini training plan ---
        plan = generate_video_training_plan(features, sport, skill_level)
        print("✅ Gemini training plan generated")

        return jsonify({
            'video_id': video_id,
            'performance_analysis': features,
            'coaching_feedback': coaching,
            'training_plan': plan,
        })

    except Exception as e:
        print(f"❌ Video analysis error: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500


@video_bp.route('/detect-pose', methods=['POST'])
def detect_pose():
    """Quick pose detection on a single image."""
    try:
        data = request.get_json()
        image_path = data.get('image_path', '')
        if not image_path or not os.path.exists(image_path):
            return jsonify({'error': 'Image not found'}), 400

        pose_data = _estimator.process_video(image_path)
        return jsonify(pose_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
