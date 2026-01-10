import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'availability_request',
      'availability_submitted',
      'availability_reset',
      'schedule_published',
      'edit_request_approved',
      'edit_request_rejected',
      'student_added',
      'general',
    ],
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
  actionUrl: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for efficient queries
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
