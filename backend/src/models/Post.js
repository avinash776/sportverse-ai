// ==================================================
// SportVerse AI - Post Model (MongoDB/Mongoose)
// ==================================================

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: ['general', 'looking_for_players', 'event', 'announcement', 'tournament'],
    default: 'general',
  },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  sport: { type: String, default: null },
  location: { type: String, default: null },
  event_date: { type: Date, default: null },
  max_players: { type: Number, default: null },
  image: { type: String, default: null },
  likes: { type: Number, default: 0 },
  liked_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
  toObject: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
});

// Virtual for comment count (populated at query time)
postSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post_id',
});

module.exports = mongoose.model('Post', postSchema);
