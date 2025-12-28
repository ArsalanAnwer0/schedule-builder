import mongoose from 'mongoose';

const VerificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Auto-delete after 10 minutes (MongoDB TTL index)
  },
});

// Index for quick lookups and cleanup
VerificationCodeSchema.index({ email: 1, expiresAt: 1 });
VerificationCodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

const VerificationCode = mongoose.models.VerificationCode || mongoose.model('VerificationCode', VerificationCodeSchema);

export default VerificationCode;
