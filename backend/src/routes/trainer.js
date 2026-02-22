// ==================================================
// SportVerse AI - AI Trainer Routes (MongoDB)
// ==================================================

const express = require('express');
const router = express.Router();
const axios = require('axios');
const TrainingPlan = require('../models/TrainingPlan');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// Generate a new AI training plan
router.post('/generate-plan', authenticateToken, async (req, res) => {
  try {
    const { sport, skill_level, goal, additional_info } = req.body;

    if (!sport || !skill_level || !goal) {
      return res.status(400).json({ error: 'Sport, skill level, and goal are required' });
    }

    let planData;
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/generate-training-plan`, {
        sport,
        skill_level,
        goal,
        additional_info,
        user_name: req.user.name,
        duration_weeks: req.body.duration_weeks || 4,
      }, { timeout: 60000 });
      planData = response.data;
    } catch (aiError) {
      console.error('AI service unavailable:', aiError.message);
      return res.status(502).json({
        error: 'AI microservice is unavailable. Please ensure the Python AI service is running on port 8000.',
        details: aiError.message,
      });
    }

    const plan = await TrainingPlan.create({
      user_id: req.user._id,
      sport,
      skill_level,
      goal,
      plan_data: planData,
      weekly_timetable: planData.weekly_schedule || planData.weekly_timetable || {},
      drills: planData.drills || [],
      resources: planData.resources || [],
      warmup_cooldown: planData.warmup_cooldown || {},
    });

    // Add to user training history
    const user = await User.findById(req.user._id);
    const history = user.training_history || [];
    history.push({
      date: new Date().toISOString(),
      type: 'ai_plan',
      planId: plan._id.toString(),
      sport,
      goal,
    });
    user.training_history = history.slice(-50);
    await user.save();

    res.status(201).json({
      message: 'Training plan generated',
      plan: { id: plan._id, ...planData },
    });
  } catch (error) {
    console.error('Plan generation error:', error);
    res.status(500).json({ error: 'Failed to generate training plan' });
  }
});

// Get all training plans for current user
router.get('/my-plans', authenticateToken, async (req, res) => {
  try {
    const plans = await TrainingPlan.find({ user_id: req.user._id }).sort({ created_at: -1 });
    res.json({ plans });
  } catch (error) {
    console.error('Plans fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch training plans' });
  }
});

// Get single training plan
router.get('/plan/:planId', authenticateToken, async (req, res) => {
  try {
    const plan = await TrainingPlan.findOne({ _id: req.params.planId, user_id: req.user._id });
    if (!plan) {
      return res.status(404).json({ error: 'Training plan not found' });
    }
    res.json({ plan });
  } catch (error) {
    console.error('Plan fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch training plan' });
  }
});

// Delete a training plan
router.delete('/plan/:planId', authenticateToken, async (req, res) => {
  try {
    const result = await TrainingPlan.findOneAndDelete({ _id: req.params.planId, user_id: req.user._id });
    if (!result) {
      return res.status(404).json({ error: 'Training plan not found' });
    }
    res.json({ message: 'Training plan deleted' });
  } catch (error) {
    console.error('Plan delete error:', error);
    res.status(500).json({ error: 'Failed to delete training plan' });
  }
});

module.exports = router;
