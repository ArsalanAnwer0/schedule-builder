import mongoose from 'mongoose';

const scheduleConfigSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },

  // Business Hours (per day)
  businessHours: {
    monday: {
      isOpen: { type: Boolean, default: true },
      startTime: { type: String, default: '08:00' },
      endTime: { type: String, default: '16:30' }
    },
    tuesday: {
      isOpen: { type: Boolean, default: true },
      startTime: { type: String, default: '08:00' },
      endTime: { type: String, default: '16:30' }
    },
    wednesday: {
      isOpen: { type: Boolean, default: true },
      startTime: { type: String, default: '08:00' },
      endTime: { type: String, default: '16:30' }
    },
    thursday: {
      isOpen: { type: Boolean, default: true },
      startTime: { type: String, default: '08:00' },
      endTime: { type: String, default: '16:30' }
    },
    friday: {
      isOpen: { type: Boolean, default: true },
      startTime: { type: String, default: '08:00' },
      endTime: { type: String, default: '16:30' }
    },
    saturday: {
      isOpen: { type: Boolean, default: false },
      startTime: { type: String, default: '08:00' },
      endTime: { type: String, default: '16:30' }
    },
    sunday: {
      isOpen: { type: Boolean, default: false },
      startTime: { type: String, default: '08:00' },
      endTime: { type: String, default: '16:30' }
    }
  },

  // Shift Preferences
  shiftPreferences: {
    minWorkersPerShift: { type: Number, default: 1, min: 1 },
    maxWorkersPerShift: { type: Number, default: 5, min: 1 },
    idealShiftLength: { type: Number, default: 3, min: 1, max: 8 }, // hours
    minShiftLength: { type: Number, default: 2, min: 1, max: 8 },
    maxShiftLength: { type: Number, default: 4, min: 1, max: 8 },
    allowSplitShifts: { type: Boolean, default: false }
  },

  // Break Times (no one scheduled during breaks)
  breakTimes: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'all'],
      required: true
    },
    startTime: { type: String, required: true },  // "12:00"
    endTime: { type: String, required: true },    // "13:00"
    reason: { type: String, default: '' }         // "Lunch Break", "Staff Meeting", etc.
  }],

  // Overtime Rules
  overtimeRules: {
    maxHoursPerDay: { type: Number, default: 8, min: 1 },
    maxHoursPerWeek: { type: Number, default: 40, min: 1 },
    warnOnOvertime: { type: Boolean, default: true },
    allowOvertime: { type: Boolean, default: false }
  },

  // Priority Time Slots (need more workers)
  prioritySlots: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'all'],
      required: true
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    minWorkers: { type: Number, required: true, min: 1 },  // Minimum workers during this period
    reason: { type: String, default: '' }                   // "Peak Hours", "Rush Period", etc.
  }],

  // Metadata
  isDefault: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastUsedAt: { type: Date },
  timesUsed: { type: Number, default: 0 }
}, { timestamps: true });

// Indexes for performance
scheduleConfigSchema.index({ organizationName: 1, name: 1 });
scheduleConfigSchema.index({ organizationName: 1, isDefault: 1 });

// Validation: Ensure only one default per organization
scheduleConfigSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Remove default from other configs in same organization
    await this.constructor.updateMany(
      {
        organizationName: this.organizationName,
        _id: { $ne: this._id },
        isDefault: true
      },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Validation: Shift length constraints
scheduleConfigSchema.pre('save', function(next) {
  const { minShiftLength, maxShiftLength, idealShiftLength } = this.shiftPreferences;

  if (minShiftLength > maxShiftLength) {
    return next(new Error('minShiftLength cannot be greater than maxShiftLength'));
  }

  if (idealShiftLength < minShiftLength || idealShiftLength > maxShiftLength) {
    return next(new Error('idealShiftLength must be between minShiftLength and maxShiftLength'));
  }

  next();
});

// Validation: Worker count constraints
scheduleConfigSchema.pre('save', function(next) {
  const { minWorkersPerShift, maxWorkersPerShift } = this.shiftPreferences;

  if (minWorkersPerShift > maxWorkersPerShift) {
    return next(new Error('minWorkersPerShift cannot be greater than maxWorkersPerShift'));
  }

  next();
});

const ScheduleConfiguration = mongoose.models.ScheduleConfiguration ||
  mongoose.model('ScheduleConfiguration', scheduleConfigSchema);

export default ScheduleConfiguration;
