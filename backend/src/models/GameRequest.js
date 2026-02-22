// ==================================================
// SportVerse AI - Game Request Model (Looking for Players)
// ==================================================

const mongoose = require('mongoose');

const gameRequestSchema = new mongoose.Schema({
  creator_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  game_name: { type: String, required: true, trim: true },
  sport: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  players_required: { type: Number, required: true, min: 1 },
  players_joined: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  skill_level: { type: String, enum: ['any', 'beginner', 'intermediate', 'advanced'], default: 'any' },
  description: { type: String, default: '' },
  contact_info: { type: String, default: '' },
  status: { type: String, enum: ['open', 'full', 'completed', 'cancelled'], default: 'open' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
  toObject: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
});

gameRequestSchema.virtual('spots_left').get(function () {
  return Math.max(0, this.players_required - (this.players_joined ? this.players_joined.length : 0));
});

module.exports = mongoose.model('GameRequest', gameRequestSchema);
