import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false, // Optional - some users may use passwordless login
    select: false,   // Don't include password in queries by default
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values (not all users will have googleId)
  },
  secondaryEmail: {
    type: String,
    lowercase: true,
    trim: true,
    default: null,
    // Optional secondary email (e.g., school email)
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
  emailVerified: {
    type: Boolean,
    default: false,
  },
  secondaryEmailVerified: {
    type: Boolean,
    default: false,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
    select: false, // Don't include secret in queries by default
  },
  twoFactorBackupCodes: {
    type: [String],
    select: false, // Don't include backup codes in queries by default
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockedUntil: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, organizationName: 1 }); // Compound index for efficient queries
UserSchema.index({ organizationName: 1, email: 1 }); // For lookups within organization

export default mongoose.models.User || mongoose.model('User', UserSchema);
