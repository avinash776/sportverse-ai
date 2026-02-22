// ==================================================
// SportVerse AI - Direct Message Model
// ==================================================

const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema({
  conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'feed_share', 'video_call'], default: 'text' },
  shared_post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  read: { type: Boolean, default: false },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
  toObject: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
});

module.exports = mongoose.model('DirectMessage', directMessageSchema);
