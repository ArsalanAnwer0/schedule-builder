import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    index: true,
    enum: [
      // Schedule actions
      'schedule_created',
      'schedule_published',
      'schedule_reverted',
      'schedule_deleted',
      // Student actions
      'student_added',
      'student_edited',
      'student_deleted',
      'students_bulk_deleted',
      'availability_requested',
      'availability_reset',
      'availability_bulk_requested',
      // Admin actions
      'admin_invited',
      'admin_removed',
      // Edit request actions
      'edit_request_approved',
      'edit_request_denied',
      // Password reset actions
      'password_reset_approved',
      'password_reset_denied',
      // Settings actions
      'organization_settings_updated',
      'schedule_configuration_created',
      'schedule_configuration_updated',
      'schedule_configuration_deleted',
      // Recurring schedule actions
      'recurring_schedule_created',
      'recurring_schedule_updated',
      'recurring_schedule_deleted',
      'recurring_schedule_toggled'
    ]
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['schedule', 'student', 'admin', 'edit_request', 'password_reset', 'settings', 'configuration', 'recurring_schedule']
  },
  resourceId: {
    type: String,
    index: true
  },
  resourceName: {
    type: String
  },
  beforeState: {
    type: mongoose.Schema.Types.Mixed
  },
  afterState: {
    type: mongoose.Schema.Types.Mixed
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
auditLogSchema.index({ organizationName: 1, createdAt: -1 });
auditLogSchema.index({ organizationName: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ organizationName: 1, userId: 1, createdAt: -1 });
auditLogSchema.index({ organizationName: 1, resourceType: 1, createdAt: -1 });

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
