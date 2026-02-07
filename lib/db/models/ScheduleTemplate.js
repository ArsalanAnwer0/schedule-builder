import mongoose from 'mongoose';

const scheduleTemplateSchema = new mongoose.Schema({
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
  organizationName: {
    type: String,
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  configurationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScheduleConfiguration',
    default: null
  },

  // Template Configuration (mirrors form data)
  config: {
    officeStartTime: {
      type: String,
      required: true,
      default: '08:00'
    },
    officeEndTime: {
      type: String,
      required: true,
      default: '16:30'
    },
    totalHoursPerWeek: {
      type: String,
      default: '40'
    },
    hoursPerWorkerPerWeek: {
      type: String,
      default: '6'
    },
    minShiftLength: {
      type: String,
      default: ''
    },
    maxShiftLength: {
      type: String,
      default: ''
    }
  },

  // Metadata
  timesUsed: {
    type: Number,
    default: 0
  },
  lastUsedAt: {
    type: Date,
    default: null
  },
  isDefault: {
    type: Boolean,
    default: false
  },

  // Migration tracking
  migratedAt: {
    type: Date,
    default: null
  },
  migratedToConfigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScheduleConfiguration',
    default: null
  }
}, { timestamps: true });

// Compound index for efficient org queries
scheduleTemplateSchema.index({ organizationName: 1, createdAt: -1 });
scheduleTemplateSchema.index({ organizationName: 1, isDefault: 1 });

export default mongoose.models.ScheduleTemplate || mongoose.model('ScheduleTemplate', scheduleTemplateSchema);
