import mongoose from 'mongoose';

const ScheduleHistorySchema = new mongoose.Schema({
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true,
    index: true,
  },
  organizationName: {
    type: String,
    required: true,
    index: true,
  },
  version: {
    type: Number,
    required: true,
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  publishedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  scheduleSnapshot: {
    type: Object,
    required: true, // Full schedule data at time of publish
  },
  changeDescription: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
ScheduleHistorySchema.index({ organizationName: 1, publishedAt: -1 });
ScheduleHistorySchema.index({ scheduleId: 1, version: -1 });

export default mongoose.models.ScheduleHistory || mongoose.model('ScheduleHistory', ScheduleHistorySchema);
