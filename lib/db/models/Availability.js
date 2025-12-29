import mongoose from 'mongoose';

const AvailabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  availability: {
    Monday: {
      type: [String],
      default: [],
    },
    Tuesday: {
      type: [String],
      default: [],
    },
    Wednesday: {
      type: [String],
      default: [],
    },
    Thursday: {
      type: [String],
      default: [],
    },
    Friday: {
      type: [String],
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
