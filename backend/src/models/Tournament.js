// ==================================================
// SportVerse AI - Tournament Model (MongoDB/Mongoose)
// ==================================================

const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  coach_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  sport: { type: String, required: true },
  location: { type: String, default: '' },
  start_date: { type: Date, default: null },
  end_date: { type: Date, default: null },
  max_teams: { type: Number, default: 8 },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  teams: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
  toObject: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
});

module.exports = mongoose.model('Tournament', tournamentSchema);
