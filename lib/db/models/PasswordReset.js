import mongoose from 'mongoose';

const PasswordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: false, // Optional for admin-assisted requests
    unique: true,
    sparse: true, // Allow null values to be non-unique
    index: true,
  },
  newPasswordHash: {
    type: String,
    required: false, // Only for admin-assisted requests
  },
  requiresAdminApproval: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied', 'used'],
    default: 'pending',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  approvedAt: {
    type: Date,
    required: false,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-delete expired tokens after 1 hour
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.models.PasswordReset || mongoose.model('PasswordReset', PasswordResetSchema);
