// ==================================================
// SportVerse AI - Conversation Model (Direct Messages)
// ==================================================

const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  last_message: { type: String, default: null },
  last_message_at: { type: Date, default: null },
  last_sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
  toObject: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
});

// Compound index for finding conversations between two users
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
