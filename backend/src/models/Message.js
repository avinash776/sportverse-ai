// ==================================================
// SportVerse AI - Message Model (MongoDB/Mongoose)
// ==================================================

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  room_id: { type: String, required: true, index: true },      // Group _id as string
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'system'], default: 'text' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
  toObject: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
});

module.exports = mongoose.model('Message', messageSchema);
