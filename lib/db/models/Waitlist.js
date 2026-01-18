import mongoose from 'mongoose';

const WaitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'invited', 'converted'],
    default: 'pending',
  },
  source: {
    type: String,
    default: 'landing_page',
  },
}, {
  timestamps: true,
});

// Indexes
WaitlistSchema.index({ email: 1 }, { unique: true });
WaitlistSchema.index({ status: 1 });

export default mongoose.models.Waitlist || mongoose.model('Waitlist', WaitlistSchema);
