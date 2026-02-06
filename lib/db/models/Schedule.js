import mongoose from 'mongoose';

const ShiftSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  hours: {
    type: Number,
    required: true,
  },
}, { _id: false });

const ScheduleSchema = new mongoose.Schema({
  periodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchedulePeriod',
    required: true,
  },
  organizationName: {
    type: String,
    required: true,
    index: true, // Index for efficient queries
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  strategyName: {
    type: String,
    enum: ['long', 'medium', 'short'],
    required: true,
  },
  shifts: [ShiftSchema],
  totalHoursByStudent: {
    type: Map,
    of: Number,
    default: () => new Map(),
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  publishedAt: {
    type: Date,
  },
  scheduleConfig: {
    startDate: String,
    endDate: String,
    officeStartTime: String,
    officeEndTime: String,
  },
  // Version tracking fields
  version: {
    type: Number,
    default: 1,
    index: true,
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  isCurrentVersion: {
    type: Boolean,
    default: false,
    index: true,
  },
  previousVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    default: null,
  },
  changeDescription: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Compound index for efficient version queries
ScheduleSchema.index({ organizationName: 1, status: 1, version: -1 });

export default mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
