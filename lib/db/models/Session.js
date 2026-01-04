import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    // Expires 7 days from creation
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
}, {
  timestamps: true,
});

// Indexes
SessionSchema.index({ token: 1 }, { unique: true });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
