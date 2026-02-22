// ==================================================
// SportVerse AI - Video Model (MongoDB/Mongoose)
// ==================================================

const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  filename: { type: String, required: true },
  original_name: { type: String, default: '' },
  sport: { type: String, default: 'general' },
  file_path: { type: String, required: true },
  file_size: { type: Number, default: 0 },
  status: { type: String, enum: ['uploaded', 'processing', 'analyzed', 'error'], default: 'uploaded' },
  analysis_result: { type: mongoose.Schema.Types.Mixed, default: null },
  feedback: { type: mongoose.Schema.Types.Mixed, default: null },
  training_plan: { type: mongoose.Schema.Types.Mixed, default: null },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
  toObject: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
});

module.exports = mongoose.model('Video', videoSchema);
