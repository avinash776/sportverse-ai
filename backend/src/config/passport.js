// ==================================================
// SportVerse AI - Passport.js Google OAuth (MongoDB)
// ==================================================

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

function initPassport() {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const name = profile.displayName;
      const avatar = profile.photos[0]?.value || '';
      const googleId = profile.id;

      // Check if user already exists by google_id
      let user = await User.findOne({ google_id: googleId });

      if (!user) {
        // Check if email exists (user might have registered differently)
        user = await User.findOne({ email });

        if (user) {
          // Link Google account to existing user
          user.google_id = googleId;
          if (avatar) user.avatar = avatar;
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            google_id: googleId,
            email,
            name,
            avatar,
            role: 'player',
          });
        }
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  passport.serializeUser((user, done) => done(null, user._id || user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}

module.exports = { initPassport };
