// ==================================================
// SportVerse AI - Event Model (MongoDB/Mongoose)
// ==================================================

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  coach_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  sport: { type: String, default: null },
  location: { type: String, default: '' },
  event_date: { type: Date, default: null },
  event_type: { type: String, enum: ['training', 'tournament', 'meetup', 'workshop'], default: 'training' },
  max_participants: { type: Number, default: 30 },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
  toObject: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
});

module.exports = mongoose.model('Event', eventSchema);
