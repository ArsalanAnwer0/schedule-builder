import mongoose from 'mongoose';

const MagicLinkSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    // Expires 15 minutes from creation
    default: () => new Date(Date.now() + 15 * 60 * 1000),
  },
  used: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
MagicLinkSchema.index({ token: 1 }, { unique: true });
MagicLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export default mongoose.models.MagicLink || mongoose.model('MagicLink', MagicLinkSchema);
