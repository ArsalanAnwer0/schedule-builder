import mongoose from 'mongoose';

const AvailabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  availability: {
    Monday: {
      type: [Number],
      default: [],
    },
    Tuesday: {
      type: [Number],
      default: [],
    },
    Wednesday: {
      type: [Number],
      default: [],
    },
    Thursday: {
      type: [Number],
      default: [],
    },
    Friday: {
      type: [Number],
      default: [],
    },
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Create unique index on userId to ensure one availability record per user
AvailabilitySchema.index({ userId: 1 }, { unique: true });

export default mongoose.models.Availability || mongoose.model('Availability', AvailabilitySchema);
