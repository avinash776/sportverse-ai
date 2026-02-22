// ==================================================
// SportVerse AI - Video Upload & Analysis Routes (MongoDB)
// ==================================================

const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const Video = require('../models/Video');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { uploadVideo } = require('../middleware/upload');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Upload a video for analysis
router.post('/upload', authenticateToken, uploadVideo.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { sport = 'general' } = req.body;

    const video = await Video.create({
      user_id: req.user._id,
      filename: req.file.filename,
      original_name: req.file.originalname,
      sport,
      file_path: req.file.path,
      file_size: req.file.size,
      status: 'uploaded',
    });

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        id: video._id,
        filename: video.filename,
        originalName: video.original_name,
        sport,
        status: 'uploaded',
        size: video.file_size,
      },
    });
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Trigger video analysis via AI microservice
router.post('/analyze/:videoId', authenticateToken, async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.videoId, user_id: req.user._id });
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    video.status = 'processing';
    await video.save();

    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/analyze-video`, {
        video_id: video._id.toString(),
        video_path: video.file_path,
        sport: video.sport,
        user_skill_level: req.user.skill_level || 'beginner',
      }, { timeout: 120000 });

      const analysisResult = response.data;

      video.status = 'analyzed';
      video.analysis_result = analysisResult.performance_analysis || analysisResult.analysis;
      video.feedback = analysisResult.coaching_feedback || analysisResult.feedback;
      video.training_plan = analysisResult.training_plan;
      await video.save();

      // Update user performance stats
      const user = await User.findById(req.user._id);
      const currentStats = user.performance_stats || {};
      const score = analysisResult.performance_analysis?.overall_score
        || analysisResult.analysis?.overall_score || 0;

      user.performance_stats = {
        ...currentStats,
        lastAnalysis: new Date().toISOString(),
        totalAnalyses: (currentStats.totalAnalyses || 0) + 1,
        latestScore: score,
        sport: video.sport,
      };

      const history = user.training_history || [];
      history.push({
        date: new Date().toISOString(),
        videoId: video._id.toString(),
        sport: video.sport,
        score,
      });
      user.training_history = history.slice(-50);
      await user.save();

      res.json({ message: 'Video analysis complete', analysis: analysisResult });
    } catch (aiError) {
      console.error('AI service error:', aiError.message);
      video.status = 'error';
      await video.save();

      res.status(502).json({
        error: 'AI microservice is unavailable. Please ensure the Python AI service is running on port 8000.',
        details: aiError.message,
      });
    }
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze video' });
  }
});

// Get all videos for current user
router.get('/my-videos', authenticateToken, async (req, res) => {
  try {
    const videos = await Video.find({ user_id: req.user._id }).sort({ created_at: -1 });
    res.json({ videos });
  } catch (error) {
    console.error('Videos fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get single video analysis result
router.get('/:videoId', authenticateToken, async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.videoId, user_id: req.user._id });
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json({ video });
  } catch (error) {
    console.error('Video fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Delete a video
router.delete('/:videoId', authenticateToken, async (req, res) => {
  try {
    const video = await Video.findOne({ _id: req.params.videoId, user_id: req.user._id });
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (fs.existsSync(video.file_path)) {
      fs.unlinkSync(video.file_path);
    }

    await video.deleteOne();
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Video delete error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

module.exports = router;
