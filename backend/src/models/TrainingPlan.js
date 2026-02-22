// ==================================================
// SportVerse AI - Training Plan Model (MongoDB/Mongoose)
// ==================================================

const mongoose = require('mongoose');

const trainingPlanSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sport: { type: String, required: true },
  skill_level: { type: String, required: true },
  goal: { type: String, required: true },
  plan_data: { type: mongoose.Schema.Types.Mixed, required: true },
  weekly_timetable: { type: mongoose.Schema.Types.Mixed, default: {} },
  drills: { type: [mongoose.Schema.Types.Mixed], default: [] },
  resources: { type: [mongoose.Schema.Types.Mixed], default: [] },
  warmup_cooldown: { type: mongoose.Schema.Types.Mixed, default: {} },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
  toObject: { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; return ret; } },
});

module.exports = mongoose.model('TrainingPlan', trainingPlanSchema);
