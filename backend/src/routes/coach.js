// ==================================================
// SportVerse AI - Coach Portal Routes (MongoDB)
// ==================================================

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Event = require('../models/Event');
const Post = require('../models/Post');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { uploadCertificate } = require('../middleware/upload');

// ---- Coach Verification ----

router.post('/apply', authenticateToken, uploadCertificate.single('certificate'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Certificate/ID image required' });
    }

    const certPath = `/uploads/certificates/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, {
      role: 'coach',
      coach_certificate: certPath,
      coach_verified: false,
    });

    res.json({ message: 'Coach application submitted. Verification pending.', certificate: certPath });
  } catch (error) {
    console.error('Coach apply error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

router.post('/verify/:userId', authenticateToken, async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.params.userId, role: 'coach' },
      { coach_verified: true }
    );
    res.json({ message: 'Coach verified successfully' });
  } catch (error) {
    console.error('Verify coach error:', error);
    res.status(500).json({ error: 'Failed to verify coach' });
  }
});

router.post('/self-verify', authenticateToken, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      role: 'coach',
      coach_verified: true,
    });
    res.json({ message: 'Coach role activated (demo mode)' });
  } catch (error) {
    console.error('Self verify error:', error);
    res.status(500).json({ error: 'Failed to activate coach role' });
  }
});

// ---- Tournaments ----

router.post('/tournaments', authenticateToken, async (req, res) => {
  try {
    // Auto-set role to coach if not already
    if (req.user.role !== 'coach' && req.user.role !== 'admin') {
      await User.findByIdAndUpdate(req.user._id, { role: 'coach', coach_verified: true });
      req.user.role = 'coach';
    }
    const { name, description, sport, location, start_date, end_date, max_teams } = req.body;
    if (!name || !sport) {
      return res.status(400).json({ error: 'Tournament name and sport are required' });
    }

    const tournament = await Tournament.create({
      coach_id: req.user._id,
      name,
      description: description || '',
      sport,
      location: location || '',
      start_date: start_date || null,
      end_date: end_date || null,
      max_teams: max_teams || 8,
    });

    // Create a community post for the tournament
    await Post.create({
      user_id: req.user._id,
      type: 'tournament',
      title: `🏆 Tournament: ${name}`,
      content: description || `New ${sport} tournament! Join now!`,
      sport,
      location: location || '',
      event_date: start_date || null,
    });

    res.status(201).json({ message: 'Tournament created', tournament });
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

router.get('/tournaments', async (req, res) => {
  try {
    const { sport, status } = req.query;
    const filter = {};
    if (sport) filter.sport = sport;
    if (status) filter.status = status;

    const tournaments = await Tournament.find(filter)
      .populate('coach_id', 'name avatar')
      .sort({ created_at: -1 })
      .lean();

    const result = tournaments.map(t => ({
      ...t,
      id: t._id,
      coach_name: t.coach_id?.name,
      coach_avatar: t.coach_id?.avatar,
    }));

    res.json({ tournaments: result });
  } catch (error) {
    console.error('Fetch tournaments error:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

// ---- Events ----

router.post('/events', authenticateToken, async (req, res) => {
  try {
    // Auto-set role to coach if not already
    if (req.user.role !== 'coach' && req.user.role !== 'admin') {
      await User.findByIdAndUpdate(req.user._id, { role: 'coach', coach_verified: true });
      req.user.role = 'coach';
    }
    const { title, description, sport, location, event_date, event_type, max_participants } = req.body;
    if (!title) return res.status(400).json({ error: 'Event title is required' });

    const event = await Event.create({
      coach_id: req.user._id,
      title,
      description: description || '',
      sport: sport || null,
      location: location || '',
      event_date: event_date || null,
      event_type: event_type || 'training',
      max_participants: max_participants || 30,
    });

    await Post.create({
      user_id: req.user._id,
      type: 'event',
      title: `📅 ${title}`,
      content: description || `Join this ${event_type || 'training'} event!`,
      sport: sport || null,
      location: location || '',
      event_date: event_date || null,
    });

    res.status(201).json({ message: 'Event created', event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.get('/events', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('coach_id', 'name avatar')
      .sort({ event_date: 1 })
      .lean();

    const result = events.map(e => ({
      ...e,
      id: e._id,
      coach_name: e.coach_id?.name,
      coach_avatar: e.coach_id?.avatar,
    }));

    res.json({ events: result });
  } catch (error) {
    console.error('Fetch events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.post('/events/:eventId/join', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (event.participants.some(id => id.toString() === req.user._id.toString())) {
      return res.status(409).json({ error: 'Already registered for this event' });
    }
    if (event.participants.length >= event.max_participants) {
      return res.status(400).json({ error: 'Event is full' });
    }

    event.participants.push(req.user._id);
    await event.save();

    res.json({ message: 'Joined event successfully' });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ error: 'Failed to join event' });
  }
});

// ---- Coach Dashboard Data ----

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const [tournamentCount, eventCount, postCount, recentPlayers, upcomingEvents] = await Promise.all([
      Tournament.countDocuments({ coach_id: req.user._id }),
      Event.countDocuments({ coach_id: req.user._id }),
      Post.countDocuments({ user_id: req.user._id }),
      User.find({ role: 'player' })
        .select('name avatar sport skill_level')
        .sort({ created_at: -1 })
        .limit(10)
        .lean(),
      Event.find({ coach_id: req.user._id, event_date: { $gte: new Date() } })
        .sort({ event_date: 1 })
        .limit(5)
        .lean(),
    ]);

    res.json({
      stats: {
        tournamentsCreated: tournamentCount,
        eventsHosted: eventCount,
        postsCount: postCount,
      },
      tournaments_count: tournamentCount,
      events_count: eventCount,
      total_players: recentPlayers.length,
      recentPlayers: recentPlayers.map(p => ({ ...p, id: p._id })),
      upcomingEvents: upcomingEvents.map(e => ({ ...e, id: e._id })),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

router.get('/players', authenticateToken, async (req, res) => {
  try {
    const { sport, skill_level, search } = req.query;
    const filter = { role: 'player' };
    if (sport) filter.sport = sport;
    if (skill_level) filter.skill_level = skill_level;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    const players = await User.find(filter)
      .select('name avatar sport position skill_level bio location achievements skills performance_stats')
      .sort({ created_at: -1 })
      .lean();

    res.json({ players: players.map(p => ({ ...p, id: p._id })) });
  } catch (error) {
    console.error('Fetch players error:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

router.post('/announcements', authenticateToken, async (req, res) => {
  try {
    const { title, content, sport } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

    const post = await Post.create({
      user_id: req.user._id,
      type: 'announcement',
      title: `📢 ${title}`,
      content,
      sport: sport || null,
    });

    const populated = await Post.findById(post._id)
      .populate('user_id', 'name avatar')
      .lean();

    res.status(201).json({
      message: 'Announcement posted',
      post: {
        ...populated,
        id: populated._id,
        author_name: populated.user_id?.name,
        author_avatar: populated.user_id?.avatar,
      },
    });
  } catch (error) {
    console.error('Announcement error:', error);
    res.status(500).json({ error: 'Failed to post announcement' });
  }
});

module.exports = router;
