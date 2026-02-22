// ==================================================
// SportVerse AI - Game Request Routes (Find Players)
// ==================================================

const express = require('express');
const router = express.Router();
const GameRequest = require('../models/GameRequest');
const { authenticateToken } = require('../middleware/auth');

// Create a game request
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { game_name, sport, location, date, time, players_required, skill_level, description, contact_info } = req.body;
    if (!game_name || !sport || !location || !date || !time || !players_required) {
      return res.status(400).json({ error: 'Game name, sport, location, date, time, and players required are mandatory' });
    }

    const request = await GameRequest.create({
      creator_id: req.user._id,
      game_name,
      sport,
      location,
      date,
      time,
      players_required: parseInt(players_required),
      skill_level: skill_level || 'any',
      description: description || '',
      contact_info: contact_info || '',
      players_joined: [req.user._id], // Creator auto-joins
    });

    const populated = await GameRequest.findById(request._id)
      .populate('creator_id', 'name avatar sport skill_level')
      .populate('players_joined', 'name avatar sport');

    res.status(201).json({ message: 'Game request created', request: populated });
  } catch (error) {
    console.error('Create game request error:', error);
    res.status(500).json({ error: 'Failed to create game request' });
  }
});

// Get all open game requests
router.get('/', async (req, res) => {
  try {
    const { sport, location, page = 1, limit = 20 } = req.query;
    const filter = { status: 'open', date: { $gte: new Date() } };
    if (sport) filter.sport = { $regex: sport, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [requests, total] = await Promise.all([
      GameRequest.find(filter)
        .populate('creator_id', 'name avatar sport skill_level')
        .populate('players_joined', 'name avatar')
        .sort({ date: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      GameRequest.countDocuments(filter),
    ]);

    const result = requests.map(r => ({
      ...r,
      id: r._id,
      creator_name: r.creator_id?.name,
      creator_avatar: r.creator_id?.avatar,
      spots_left: Math.max(0, r.players_required - (r.players_joined?.length || 0)),
    }));

    res.json({ requests: result, total });
  } catch (error) {
    console.error('Fetch game requests error:', error);
    res.status(500).json({ error: 'Failed to fetch game requests' });
  }
});

// Get my game requests
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const requests = await GameRequest.find({
      $or: [
        { creator_id: req.user._id },
        { players_joined: req.user._id },
      ]
    })
      .populate('creator_id', 'name avatar sport')
      .populate('players_joined', 'name avatar sport')
      .sort({ date: 1 })
      .lean();

    const result = requests.map(r => ({
      ...r,
      id: r._id,
      creator_name: r.creator_id?.name,
      spots_left: Math.max(0, r.players_required - (r.players_joined?.length || 0)),
    }));

    res.json({ requests: result });
  } catch (error) {
    console.error('Fetch my requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Join a game request
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const request = await GameRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Game request not found' });
    if (request.status !== 'open') return res.status(400).json({ error: 'This game is no longer open' });

    const already = request.players_joined.some(id => id.toString() === req.user._id.toString());
    if (already) return res.status(409).json({ error: 'You have already joined this game' });

    if (request.players_joined.length >= request.players_required) {
      return res.status(400).json({ error: 'Game is full' });
    }

    request.players_joined.push(req.user._id);
    if (request.players_joined.length >= request.players_required) {
      request.status = 'full';
    }
    await request.save();

    const populated = await GameRequest.findById(request._id)
      .populate('creator_id', 'name avatar sport')
      .populate('players_joined', 'name avatar sport');

    res.json({ message: 'Joined game successfully!', request: populated });
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({ error: 'Failed to join game' });
  }
});

// Leave a game request
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const request = await GameRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Game request not found' });

    if (request.creator_id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Creator cannot leave. Cancel the request instead.' });
    }

    request.players_joined = request.players_joined.filter(id => id.toString() !== req.user._id.toString());
    if (request.status === 'full') request.status = 'open';
    await request.save();

    res.json({ message: 'Left game successfully' });
  } catch (error) {
    console.error('Leave game error:', error);
    res.status(500).json({ error: 'Failed to leave game' });
  }
});

// Cancel a game request (creator only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await GameRequest.findOneAndDelete({
      _id: req.params.id,
      creator_id: req.user._id,
    });
    if (!result) return res.status(404).json({ error: 'Not found or unauthorized' });
    res.json({ message: 'Game request cancelled' });
  } catch (error) {
    console.error('Cancel game request error:', error);
    res.status(500).json({ error: 'Failed to cancel request' });
  }
});

module.exports = router;
