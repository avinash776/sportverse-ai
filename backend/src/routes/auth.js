// ==================================================
// SportVerse AI - Authentication Routes (MongoDB)
// ==================================================

const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');

// ---- Google OAuth Routes ----

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// ---- Firebase Google Sign-In ----
router.post('/google/firebase', async (req, res) => {
  try {
    const { idToken, name, email, photo } = req.body;

    if (!idToken || !email) {
      return res.status(400).json({ error: 'ID token and email are required' });
    }

    let firebaseUser;
    try {
      const verifyRes = await axios.get(
        `https://www.googleapis.com/oauth3/v3/tokeninfo?id_token=${idToken}`
      );
      firebaseUser = verifyRes.data;
    } catch {
      firebaseUser = { email, name, picture: photo, sub: email };
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name: name || firebaseUser.name || 'Athlete',
        google_id: `google_${firebaseUser.sub || email}`,
        avatar: photo || firebaseUser.picture || null,
        role: 'player',
      });
    } else if (photo && !user.avatar) {
      user.avatar = photo;
      await user.save();
    }

    const token = generateToken(user);
    res.json({ message: 'Google sign-in successful', token, user: user.toJSON() });
  } catch (error) {
    console.error('Firebase Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// ---- Register ----
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'player' } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      name,
      role,
      password_hash,
    });

    const token = generateToken(user);
    res.status(201).json({ message: 'Registration successful', token, user: user.toJSON() });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ---- Login ----
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Need to explicitly select password_hash since schema hides it
    const user = await User.findOne({ email }).select('+password_hash');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.password_hash) {
      return res.status(400).json({ error: 'Please use Google login for this account' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ message: 'Login successful', token, user: user.toJSON() });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ---- Current User ----
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user.toJSON() });
});

// ---- Logout ----
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
