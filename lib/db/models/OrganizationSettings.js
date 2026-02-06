import mongoose from 'mongoose';

const organizationSettingsSchema = new mongoose.Schema({
  // Primary Key - one settings document per organization
  organizationName: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // General Settings
  displayName: {
    type: String,
    required: true,
    default: function() { return this.organizationName; }
  },
  description: {
    type: String,
    default: ''
  },
  timezone: {
    type: String,
    default: 'America/New_York',
    enum: [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Phoenix',
      'America/Anchorage',
      'Pacific/Honolulu',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Dubai',
      'Australia/Sydney',
      'UTC'
    ]
  },

  // Branding (Optional for customization)
  branding: {
    logoUrl: {
      type: String,
      default: ''
    },
    primaryColor: {
      type: String,
      default: '#14b8a6'  // Current teal color
    },
    secondaryColor: {
      type: String,
      default: '#f3f4f6'  // Light gray
    }
  },

  // Scheduling Defaults
  scheduling: {
    defaultConfigurationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ScheduleConfiguration',
      default: null
    },
    allowEditRequests: {
      type: Boolean,
      default: true
    },
    autoApproveEdits: {
      type: Boolean,
      default: false
    },
    notifyStudentsOnPublish: {
      type: Boolean,
      default: true
    }
  },

  // Notifications
  notifications: {
    emailNotificationsEnabled: {
      type: Boolean,
      default: true
    },
    ccAdminOnNotifications: {
      type: Boolean,
      default: false
    },
    notificationFrequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'immediate'
    }
  },

  // Feature Toggles (for future use)
  features: {
    twoFactorAuthEnabled: {
      type: Boolean,
      default: false
    },
    passwordlessLoginEnabled: {
      type: Boolean,
      default: false
    },
    googleOAuthEnabled: {
      type: Boolean,
      default: false
    },
    teamsIntegrationEnabled: {
      type: Boolean,
      default: false
    }
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure unique organization (explicit index)
organizationSettingsSchema.index({ organizationName: 1 }, { unique: true });

const OrganizationSettings = mongoose.models.OrganizationSettings || mongoose.model('OrganizationSettings', organizationSettingsSchema);

export default OrganizationSettings;
