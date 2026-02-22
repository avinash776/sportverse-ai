// ==================================================
// SportVerse AI - Comment Model (MongoDB/Mongoose)
// ==================================================

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
  toObject: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
});

module.exports = mongoose.model('Comment', commentSchema);
