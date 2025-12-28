import mongoose from 'mongoose';

const SchedulePeriodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  officeHours: {
    start: {
      type: String,
      required: true,
    },
    end: {
      type: String,
      required: true,
    },
  },
  weeklyHourTarget: {
    type: Number,
    required: true,
    min: 1,
    max: 40,
  },
  submissionDeadline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['collecting', 'generating', 'published', 'archived'],
    default: 'collecting',
  },
  minShiftLength: {
    type: Number,
    default: 2,
  },
  maxShiftLength: {
    type: Number,
    default: 8,
  },
}, {
  timestamps: true,
});

export default mongoose.models.SchedulePeriod || mongoose.model('SchedulePeriod', SchedulePeriodSchema);
