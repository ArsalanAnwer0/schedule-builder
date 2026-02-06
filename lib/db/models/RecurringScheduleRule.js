import mongoose from 'mongoose';

const recurringScheduleRuleSchema = new mongoose.Schema({
  // Organization scoping
  organizationName: {
    type: String,
    required: true,
    index: true
  },

  // Basic information
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },

  // Recurrence settings
  frequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly'],
    required: true
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6,
    default: null  // null for monthly, 0-6 for weekly/biweekly (0=Sunday, 6=Saturday)
  },
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31,
    default: null  // null for weekly/biweekly, 1-31 for monthly
  },
  timezone: {
    type: String,
    required: true,
    default: 'America/New_York'
  },

  // Generation settings
  configurationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScheduleConfiguration',
    required: true
  },
  autoPublish: {
    type: Boolean,
    default: false
  },
  scheduleWeeksAhead: {
    type: Number,
    default: 1,
    min: 1,
    max: 4
  },
  semesterEndDate: {
    type: Date,
    default: null
  },

  // Status tracking
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastRunAt: {
    type: Date,
    default: null
  },
  nextRunAt: {
    type: Date,
    required: true,
    index: true
  },
  lastGeneratedScheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    default: null
  },

  // Notification settings
  notifyOnConflict: {
    type: Boolean,
    default: true
  },
  notifyOnGeneration: {
    type: Boolean,
    default: true
  },

  // Availability change tracking
  lastAvailabilityHash: {
    type: String,
    default: null
  },
  availabilityChangeThreshold: {
    type: Number,
    default: 20,  // Percentage (0-100)
    min: 0,
    max: 100
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
recurringScheduleRuleSchema.index({ organizationName: 1, isActive: 1, nextRunAt: 1 });
recurringScheduleRuleSchema.index({ organizationName: 1, createdAt: -1 });

const RecurringScheduleRule = mongoose.models.RecurringScheduleRule ||
  mongoose.model('RecurringScheduleRule', recurringScheduleRuleSchema);

export default RecurringScheduleRule;
