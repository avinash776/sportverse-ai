// ==================================================
// SportVerse AI - User Profile Routes (MongoDB)
// ==================================================

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Video = require('../models/Video');
const TrainingPlan = require('../models/TrainingPlan');
const { authenticateToken } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

// Get current user's full profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [user, videoCount, planCount] = await Promise.all([
      User.findById(req.user._id),
      Video.countDocuments({ user_id: req.user._id }),
      TrainingPlan.countDocuments({ user_id: req.user._id }),
    ]);

    const profile = user.toJSON();
    profile.videoCount = videoCount;
    profile.trainingPlanCount = planCount;

    res.json({ profile });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update current user's profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, sport, position, skill_level, bio, location, achievements, skills } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (sport) updates.sport = sport;
    if (position !== undefined) updates.position = position;
    if (skill_level) updates.skill_level = skill_level;
    if (bio !== undefined) updates.bio = bio;
    if (location !== undefined) updates.location = location;
    if (achievements) updates.achievements = achievements;
    if (skills) updates.skills = skills;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ message: 'Profile updated', profile: updated.toJSON() });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload profile avatar
router.post('/avatar', authenticateToken, uploadImage.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const avatarUrl = `/uploads/images/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });

    res.json({ message: 'Avatar updated', avatar: avatarUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Get a public user profile by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = user.toJSON();
    const videoCount = await Video.countDocuments({ user_id: user._id, status: 'analyzed' });
    profile.analyzedVideos = videoCount;

    res.json({ profile });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Search users
router.get('/', async (req, res) => {
  try {
    const { sport, role, skill_level, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (sport) filter.sport = sport;
    if (role) filter.role = role;
    if (skill_level) filter.skill_level = skill_level;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      users: users.map(u => u.toJSON()),
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Update performance stats
router.put('/stats', authenticateToken, async (req, res) => {
  try {
    const { performance_stats } = req.body;
    await User.findByIdAndUpdate(req.user._id, { performance_stats });
    res.json({ message: 'Stats updated' });
  } catch (error) {
    console.error('Stats update error:', error);
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

module.exports = router;
