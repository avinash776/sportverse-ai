// ==================================================
// SportVerse AI - Group Model (MongoDB/Mongoose)
// ==================================================

const mongoose = require('mongoose');

const groupMemberSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['member', 'admin', 'moderator'], default: 'member' },
  joined_at: { type: Date, default: Date.now },
}, { _id: false });

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  sport: { type: String, default: null },
  creator_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String, default: null },
  is_public: { type: Boolean, default: true },
  max_members: { type: Number, default: 50 },
  members: [groupMemberSchema],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
  toObject: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
});

// Virtual member count
groupSchema.virtual('member_count').get(function () {
  return this.members ? this.members.length : 0;
});

module.exports = mongoose.model('Group', groupSchema);
