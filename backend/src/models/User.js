// ==================================================
// SportVerse AI - User Model (MongoDB/Mongoose)
// ==================================================

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  google_id: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  password_hash: { type: String, default: null },          // bcrypt hash for local auth
  avatar: { type: String, default: null },
  role: { type: String, enum: ['player', 'coach', 'admin'], default: 'player' },
  sport: { type: String, default: null },
  position: { type: String, default: null },
  skill_level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  achievements: { type: [String], default: [] },
  skills: { type: [String], default: [] },
  training_history: { type: [mongoose.Schema.Types.Mixed], default: [] },
  performance_stats: { type: mongoose.Schema.Types.Mixed, default: {} },
  coach_verified: { type: Boolean, default: false },
  coach_certificate: { type: String, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, transform: sanitize },
  toObject: { virtuals: true, transform: sanitize },
});

// Remove sensitive fields when converting to JSON
function sanitize(doc, ret) {
  ret.id = ret._id;
  delete ret.password_hash;
  delete ret.__v;
  return ret;
}

// Index for search
userSchema.index({ name: 'text', bio: 'text', location: 'text' });

module.exports = mongoose.model('User', userSchema);
