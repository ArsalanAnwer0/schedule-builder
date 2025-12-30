import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    required: true,
    default: 'student',
  },
  adminType: {
    type: String,
    enum: ['primary', 'secondary'],
    // Only set for admin users
  },
  organizationName: {
    type: String,
    // Set by primary admin, shared by all admins
  },
  availabilityRequested: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
