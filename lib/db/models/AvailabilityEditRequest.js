import mongoose from 'mongoose';

const AvailabilityEditRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reason: {
    type: String,
    required: true,
  },
  oldAvailability: {
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
  newAvailability: {
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
  oldNotes: {
    type: String,
    default: '',
  },
  newNotes: {
    type: String,
    default: '',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for faster queries
AvailabilityEditRequestSchema.index({ userId: 1, status: 1 });

export default mongoose.models.AvailabilityEditRequest || mongoose.model('AvailabilityEditRequest', AvailabilityEditRequestSchema);
