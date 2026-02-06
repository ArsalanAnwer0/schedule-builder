import mongoose from 'mongoose';

const recurringScheduleLogSchema = new mongoose.Schema({
  // Reference to the rule that generated this log
  ruleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringScheduleRule',
    required: true,
    index: true
  },

  // Organization scoping
  organizationName: {
    type: String,
    required: true,
    index: true
  },

  // Execution details
  runAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  // Result status
  status: {
    type: String,
    enum: ['success', 'failed', 'skipped', 'conflict_detected', 'availability_changed'],
    required: true
  },

  // Reference to generated schedule (if successful)
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    default: null
  },

  // Schedule period that was generated
  schedulePeriod: {
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    }
  },

  // Additional metadata about the generation
  metadata: {
    conflictCount: {
      type: Number,
      default: 0
    },
    availabilityChangePercent: {
      type: Number,
      default: 0
    },
    studentsAffected: {
      type: Number,
      default: 0
    },
    autoPublished: {
      type: Boolean,
      default: false
    }
  },

  // Error message if failed
  errorMessage: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
recurringScheduleLogSchema.index({ organizationName: 1, runAt: -1 });
recurringScheduleLogSchema.index({ ruleId: 1, runAt: -1 });

const RecurringScheduleLog = mongoose.models.RecurringScheduleLog ||
  mongoose.model('RecurringScheduleLog', recurringScheduleLogSchema);

export default RecurringScheduleLog;
