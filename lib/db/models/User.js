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
    required: true, // Required for all users (admins and students)
    index: true,    // Index for fast lookups
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
UserSchema.index({ role: 1, organizationName: 1 }); // Compound index for efficient queries
UserSchema.index({ organizationName: 1, email: 1 }); // For lookups within organization

export default mongoose.models.User || mongoose.model('User', UserSchema);
