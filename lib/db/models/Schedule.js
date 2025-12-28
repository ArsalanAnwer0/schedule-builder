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
}, {
  timestamps: true,
});

export default mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
