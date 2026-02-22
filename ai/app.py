# ==================================================
# SportVerse AI - Python AI Microservice (Main Entry)
# ==================================================
# Flask application exposing REST API endpoints for:
# - Video analysis with real MediaPipe pose estimation
# - Gemini-powered coaching feedback
# - Gemini-powered personalised training plans
# ==================================================

import os
from flask import Flask, jsonify
from flask_cors import CORS

# Import route blueprints
from routes.video_routes import video_bp
from routes.training_routes import training_bp


def create_app():
    """Factory function to create and configure the Flask application"""
    app = Flask(__name__)

    # Enable CORS for frontend/backend communication
    CORS(app, origins=["http://localhost:5173", "http://localhost:5000"])

    # Configuration
    app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max upload
    app.config['UPLOAD_FOLDER'] = os.path.join(
        os.path.dirname(__file__), '..', 'backend', 'uploads', 'videos'
    )

    # Register blueprints
    app.register_blueprint(video_bp, url_prefix='/api')
    app.register_blueprint(training_bp, url_prefix='/api')

    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        gemini_key = os.environ.get(
            'GEMINI_API_KEY',
            'AIzaSyBft3DyGUADPx3Gl_ZbuaL83ZyKxsW63dE',
        )
        return jsonify({
            'status': 'ok',
            'service': 'SportVerse AI – Python Microservice',
            'gemini_configured': bool(gemini_key),
            'capabilities': [
                'real_pose_estimation_mediapipe',
                'gemini_coaching_feedback',
                'gemini_training_plans',
                'video_performance_analysis',
            ],
        })

    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            'message': 'SportVerse AI Microservice is running!',
            'docs': '/api/health for service info',
        })

    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 8000))
    print(f"\n🤖 SportVerse AI Microservice running on http://localhost:{port}")
    print(f"📡 API available at http://localhost:{port}/api")
    print("🔬 Real AI: MediaPipe Pose + Gemini LLM coaching\n")
    app.run(host='0.0.0.0', port=port, debug=True)
