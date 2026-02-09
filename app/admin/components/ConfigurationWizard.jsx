'use client';

import { useState, useEffect } from 'react';
import './ConfigurationWizard.css';

const TABS = [
  { id: 'basic', name: 'Basic Info' },
  { id: 'hours', name: 'Business Hours' },
  { id: 'shifts', name: 'Shifts & Hours' },
  { id: 'advanced', name: 'Advanced Options' },
  { id: 'review', name: 'Review Configuration' }
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

const DEFAULT_CONFIG = {
  name: '',
  description: '',
  isDefault: false,
  businessHours: {
    monday: { isOpen: true, startTime: '08:00', endTime: '16:30' },
    tuesday: { isOpen: true, startTime: '08:00', endTime: '16:30' },
    wednesday: { isOpen: true, startTime: '08:00', endTime: '16:30' },
    thursday: { isOpen: true, startTime: '08:00', endTime: '16:30' },
    friday: { isOpen: true, startTime: '08:00', endTime: '16:30' },
    saturday: { isOpen: false, startTime: '08:00', endTime: '16:30' },
    sunday: { isOpen: false, startTime: '08:00', endTime: '16:30' }
  },
  shiftPreferences: {
    minWorkersPerShift: 1,
    maxWorkersPerShift: 5,
    idealShiftLength: 3,
    minShiftLength: 2,
    maxShiftLength: 4,
    allowSplitShifts: false
  },
  breakTimes: [],
  overtimeRules: {
    maxHoursPerDay: 8,
    maxHoursPerWeek: 40,
    warnOnOvertime: true,
    allowOvertime: false
  },
  prioritySlots: []
};

const deepMerge = (target, source) => {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
};

function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <div className="toggle-row">
      <div className="toggle-text">
        <span className="toggle-label">{label}</span>
        {description && <span className="toggle-description">{description}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle-switch ${checked ? 'active' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-knob" />
      </button>
    </div>
  );
}

export default function ConfigurationWizard({ isOpen, initialConfig, mode = 'create', onSave, onCancel }) {
  const [currentTab, setCurrentTab] = useState(0);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [validationErrors, setValidationErrors] = useState({});
  const [completedTabs, setCompletedTabs] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [showBreaks, setShowBreaks] = useState(false);
  const [showPriority, setShowPriority] = useState(false);
  const [tabErrorFlags, setTabErrorFlags] = useState({});

  useEffect(() => {
    if (initialConfig) {
      const { _id, __v, createdAt, updatedAt, organizationName, createdBy, lastUsedAt, timesUsed, ...configData } = initialConfig;
      setConfig(deepMerge(DEFAULT_CONFIG, configData));
      setShowBreaks(initialConfig.breakTimes?.length > 0);
      setShowPriority(initialConfig.prioritySlots?.length > 0);
    } else {
      setConfig({ ...DEFAULT_CONFIG });
      setShowBreaks(false);
      setShowPriority(false);
    }
    setCurrentTab(0);
    setValidationErrors({});
    setCompletedTabs(new Set());
    setTabErrorFlags({});
  }, [isOpen, initialConfig]);

  if (!isOpen) return null;

  const updateConfig = (path, value) => {
    setConfig(prev => {
      const keys = path.split('.');
      const result = { ...prev };
      let current = result;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        current[key] = Array.isArray(current[key])
          ? [...current[key]]
          : { ...current[key] };
        current = current[key];
      }
      current[keys[keys.length - 1]] = value;
      return result;
    });
  };

  const getTabErrors = (tabIndex) => {
    const errors = {};

    switch (tabIndex) {
      case 0: // Basic Info
        if (!config.name || config.name.trim() === '') {
          errors.name = 'Configuration name is required';
        }
        break;

      case 1: { // Business Hours
        const hasOpenDay = DAYS.some(day => config.businessHours[day].isOpen);
        if (!hasOpenDay) {
          errors.businessHours = 'At least one day must be open';
        }
        DAYS.forEach(day => {
          const hours = config.businessHours[day];
          if (hours.isOpen && hours.startTime >= hours.endTime) {
            errors[`hours_${day}`] = `${DAY_LABELS[day]}: Start time must be before end time`;
          }
        });
        break;
      }

      case 2: // Shifts & Hours (combined)
        if (config.shiftPreferences.minWorkersPerShift > config.shiftPreferences.maxWorkersPerShift) {
          errors.workers = 'Minimum workers cannot be greater than maximum workers';
        }
        if (config.shiftPreferences.minShiftLength > config.shiftPreferences.maxShiftLength) {
          errors.shiftLength = 'Minimum shift length cannot be greater than maximum';
        }
        if (config.shiftPreferences.idealShiftLength < config.shiftPreferences.minShiftLength ||
            config.shiftPreferences.idealShiftLength > config.shiftPreferences.maxShiftLength) {
          errors.idealShift = 'Ideal shift length must be between min and max';
        }
        if (config.overtimeRules.maxHoursPerDay <= 0) {
          errors.maxDay = 'Max hours per day must be positive';
        }
        if (config.overtimeRules.maxHoursPerWeek <= 0) {
          errors.maxWeek = 'Max hours per week must be positive';
        }
        break;

      case 3: // Advanced (breaks + priority)
        config.breakTimes.forEach((breakTime, index) => {
          const days = breakTime.day === 'all' ? DAYS : [breakTime.day];
          days.forEach(day => {
            const businessHours = config.businessHours[day];
            if (businessHours.isOpen) {
              if (breakTime.startTime < businessHours.startTime || breakTime.endTime > businessHours.endTime) {
                errors[`break_${index}`] = `Break time must be within business hours for ${DAY_LABELS[day]}`;
              }
            }
          });
        });
        config.prioritySlots.forEach((slot, index) => {
          if (slot.minWorkers < 1) {
            errors[`slot_${index}`] = 'Minimum workers must be at least 1';
          }
        });
        break;
    }

    return errors;
  };

  const validateTab = (tabIndex) => {
    const errors = getTabErrors(tabIndex);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateTab(currentTab)) {
      setCompletedTabs(prev => new Set([...prev, currentTab]));
      if (currentTab < TABS.length - 1) {
        setCurrentTab(currentTab + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentTab > 0) {
      setCurrentTab(currentTab - 1);
    }
  };

  const handleTabClick = (index) => {
    setValidationErrors({});
    setTabErrorFlags({});
    setCurrentTab(index);
  };

  const handleSave = async () => {
    // Validate all tabs and collect all errors
    const allErrors = {};
    const errorFlags = {};
    let firstFailingTab = -1;

    for (let i = 0; i <= 3; i++) {
      const tabErrors = getTabErrors(i);
      const hasErrors = Object.keys(tabErrors).length > 0;
      errorFlags[i] = hasErrors;
      if (hasErrors) {
        Object.assign(allErrors, tabErrors);
        if (firstFailingTab === -1) firstFailingTab = i;
      }
    }

    setTabErrorFlags(errorFlags);
    setValidationErrors(allErrors);

    if (firstFailingTab !== -1) {
      setCurrentTab(firstFailingTab);
      return;
    }

    setSaving(true);
    try {
      await onSave(config);
    } catch (error) {
      console.error('Error saving configuration:', error);
      setValidationErrors({ save: error.message || 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const copyMondayToAllDays = () => {
    const mondayHours = config.businessHours.monday;
    setConfig(prev => ({
      ...prev,
      businessHours: DAYS.reduce((acc, day) => ({
        ...acc,
        [day]: {
          ...prev.businessHours[day],
          startTime: mondayHours.startTime,
          endTime: mondayHours.endTime
        }
      }), {})
    }));
  };

  const addBreakTime = () => {
    setConfig(prev => ({
      ...prev,
      breakTimes: [...prev.breakTimes, {
        day: 'all',
        startTime: '12:00',
        endTime: '13:00',
        reason: ''
      }]
    }));
  };

  const removeBreakTime = (index) => {
    setConfig(prev => ({
      ...prev,
      breakTimes: prev.breakTimes.filter((_, i) => i !== index)
    }));
  };

  const addPrioritySlot = () => {
    setConfig(prev => ({
      ...prev,
      prioritySlots: [...prev.prioritySlots, {
        day: 'all',
        startTime: '11:00',
        endTime: '14:00',
        minWorkers: 2,
        reason: ''
      }]
    }));
  };

  const removePrioritySlot = (index) => {
    setConfig(prev => ({
      ...prev,
      prioritySlots: prev.prioritySlots.filter((_, i) => i !== index)
    }));
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return <BasicInfoTab config={config} updateConfig={updateConfig} errors={validationErrors} />;
      case 1:
        return <BusinessHoursTab config={config} updateConfig={updateConfig} errors={validationErrors} copyMondayToAllDays={copyMondayToAllDays} />;
      case 2:
        return <ShiftsAndHoursTab config={config} updateConfig={updateConfig} errors={validationErrors} />;
      case 3:
        return <AdvancedOptionsTab
          config={config}
          updateConfig={updateConfig}
          errors={validationErrors}
          showBreaks={showBreaks}
          setShowBreaks={setShowBreaks}
          showPriority={showPriority}
          setShowPriority={setShowPriority}
          addBreakTime={addBreakTime}
          removeBreakTime={removeBreakTime}
          addPrioritySlot={addPrioritySlot}
          removePrioritySlot={removePrioritySlot}
        />;
      case 4:
        return renderPreview();
      default:
        return null;
    }
  };

  const renderPreview = () => {
    const openDays = DAYS.filter(day => config.businessHours[day].isOpen);
    const closedDays = DAYS.filter(day => !config.businessHours[day].isOpen);

    return (
      <div className="wizard-review">
        <h3>Review Configuration</h3>
        <p className="tab-description">Review all settings before saving.</p>

        {/* Basic Info */}
        <div className="review-section">
          <div className="section-header">
            <h4>Basic Information</h4>
            <button className="btn-link" onClick={() => setCurrentTab(0)}>Edit</button>
          </div>
          <div className="section-content">
            <div className="review-item">
              <span className="label">Name</span>
              <span className="value">{config.name || '(not set)'}</span>
            </div>
            <div className="review-item">
              <span className="label">Description</span>
              <span className="value">{config.description || '(none)'}</span>
            </div>
            <div className="review-item">
              <span className="label">Default Configuration</span>
              <span className="value">{config.isDefault ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="review-section">
          <div className="section-header">
            <h4>Business Hours</h4>
            <button className="btn-link" onClick={() => setCurrentTab(1)}>Edit</button>
          </div>
          <div className="section-content">
            {openDays.map(day => (
              <div key={day} className="review-item">
                <span className="label">{DAY_LABELS[day]}</span>
                <span className="value">
                  {config.businessHours[day].startTime} - {config.businessHours[day].endTime}
                </span>
              </div>
            ))}
            {closedDays.length > 0 && (
              <div className="review-item">
                <span className="label">Closed</span>
                <span className="value">{closedDays.map(d => DAY_LABELS[d]).join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Shift Preferences */}
        <div className="review-section">
          <div className="section-header">
            <h4>Shift Preferences</h4>
            <button className="btn-link" onClick={() => setCurrentTab(2)}>Edit</button>
          </div>
          <div className="section-content">
            <div className="review-item">
              <span className="label">Workers per Shift</span>
              <span className="value">{config.shiftPreferences.minWorkersPerShift} - {config.shiftPreferences.maxWorkersPerShift}</span>
            </div>
            <div className="review-item">
              <span className="label">Shift Length</span>
              <span className="value">{config.shiftPreferences.minShiftLength} - {config.shiftPreferences.maxShiftLength}h (ideal: {config.shiftPreferences.idealShiftLength}h)</span>
            </div>
            <div className="review-item">
              <span className="label">Split Shifts</span>
              <span className="value">{config.shiftPreferences.allowSplitShifts ? 'Allowed' : 'Not allowed'}</span>
            </div>
          </div>
        </div>

        {/* Overtime Rules */}
        <div className="review-section">
          <div className="section-header">
            <h4>Overtime Rules</h4>
            <button className="btn-link" onClick={() => setCurrentTab(2)}>Edit</button>
          </div>
          <div className="section-content">
            <div className="review-item">
              <span className="label">Daily Limit</span>
              <span className="value">{config.overtimeRules.maxHoursPerDay} hours</span>
            </div>
            <div className="review-item">
              <span className="label">Weekly Limit</span>
              <span className="value">{config.overtimeRules.maxHoursPerWeek} hours</span>
            </div>
            <div className="review-item">
              <span className="label">Warn on Overtime</span>
              <span className="value">{config.overtimeRules.warnOnOvertime ? 'Yes' : 'No'}</span>
            </div>
            <div className="review-item">
              <span className="label">Allow Overtime</span>
              <span className="value">{config.overtimeRules.allowOvertime ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {/* Break Times */}
        {config.breakTimes.length > 0 && (
          <div className="review-section">
            <div className="section-header">
              <h4>Break Times ({config.breakTimes.length})</h4>
              <button className="btn-link" onClick={() => setCurrentTab(3)}>Edit</button>
            </div>
            <div className="section-content">
              {config.breakTimes.map((bt, i) => (
                <div key={i} className="review-item">
                  <span className="label">
                    {bt.day === 'all' ? 'All Days' : DAY_LABELS[bt.day]}
                    {bt.reason ? ` — ${bt.reason}` : ''}
                  </span>
                  <span className="value">{bt.startTime} - {bt.endTime}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Priority Slots */}
        {config.prioritySlots.length > 0 && (
          <div className="review-section">
            <div className="section-header">
              <h4>Priority Slots ({config.prioritySlots.length})</h4>
              <button className="btn-link" onClick={() => setCurrentTab(3)}>Edit</button>
            </div>
            <div className="section-content">
              {config.prioritySlots.map((ps, i) => (
                <div key={i} className="review-item">
                  <span className="label">
                    {ps.day === 'all' ? 'All Days' : DAY_LABELS[ps.day]}
                    {ps.reason ? ` — ${ps.reason}` : ''} (min {ps.minWorkers} workers)
                  </span>
                  <span className="value">{ps.startTime} - {ps.endTime}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="config-wizard-overlay" onClick={onCancel}>
      <div className="config-wizard-modal-large" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="config-wizard-header">
          <div>
            <h2>{mode === 'edit' ? 'Edit Configuration' : 'Create New Configuration'}</h2>
            <p className="config-wizard-subtitle">
              {mode === 'edit' ? 'Update your schedule configuration settings.' : 'Set up scheduling rules for your organization.'}
            </p>
          </div>
          <button className="config-wizard-close" onClick={onCancel}>&times;</button>
        </div>

        {/* Tab Navigation */}
        <div className="config-wizard-tabs">
              {TABS.map((tab, index) => (
                <button
                  key={tab.id}
                  className={`config-wizard-tab ${currentTab === index ? 'active' : ''} ${completedTabs.has(index) ? 'completed' : ''} ${tabErrorFlags[index] ? 'has-errors' : ''}`}
                  onClick={() => handleTabClick(index)}
                >
                  <span className="tab-step-number">
                    {tabErrorFlags[index] ? '!' : completedTabs.has(index) ? '✓' : index + 1}
                  </span>
                  <span className="tab-name">{tab.name}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="config-wizard-content">
              {renderTabContent()}
            </div>

            {/* Validation Errors */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="config-wizard-errors-inline">
                {Object.values(validationErrors).map((error, index) => (
                  <div key={index} className="error-message-inline">{error}</div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="config-wizard-footer">
              <div className="footer-left">
                {currentTab > 0 ? (
                  <button className="btn-secondary" onClick={handlePrevious}>
                    Previous
                  </button>
                ) : (
                  <button className="btn-secondary" onClick={onCancel}>
                    Cancel
                  </button>
                )}
              </div>
              <span className="footer-step-label">Step {currentTab + 1} of {TABS.length}</span>
              <div className="footer-right">
                {currentTab < TABS.length - 1 ? (
                  <button className="btn-primary" onClick={handleNext}>
                    Continue
                  </button>
                ) : (
                  <button
                    className="btn-primary btn-save"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Configuration'}
                  </button>
                )}
              </div>
            </div>
      </div>
    </div>
  );
}

// Tab 1: Basic Info
function BasicInfoTab({ config, updateConfig, errors }) {
  return (
    <div className="tab-content">
      <h3>Basic Information</h3>
      <p className="tab-description">Provide a name and description for your configuration.</p>

      <div className="form-group">
        <label>Configuration Name <span className="required">*</span></label>
        <input
          type="text"
          value={config.name}
          onChange={(e) => updateConfig('name', e.target.value)}
          placeholder="e.g., Standard Weekday Schedule"
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          value={config.description}
          onChange={(e) => updateConfig('description', e.target.value)}
          placeholder="Describe when and how this configuration should be used..."
          rows={4}
        />
      </div>

      <ToggleSwitch
        checked={config.isDefault}
        onChange={(val) => updateConfig('isDefault', val)}
        label="Set as default configuration"
        description="This configuration will be pre-selected when generating new schedules."
      />
    </div>
  );
}

// Tab 2: Business Hours
function BusinessHoursTab({ config, updateConfig, errors, copyMondayToAllDays }) {
  return (
    <div className="tab-content">
      <h3>Business Hours</h3>
      <p className="tab-description">Set your operating hours for each day of the week.</p>

      <div className="business-hours-actions">
        <button className="btn-secondary" onClick={copyMondayToAllDays}>
          Copy Monday Hours to All Days
        </button>
      </div>

      <div className="business-hours-table">
        <div className="table-header">
          <div className="col-day">Day</div>
          <div className="col-status">Status</div>
          <div className="col-time">Start Time</div>
          <div className="col-time">End Time</div>
        </div>
        {DAYS.map(day => {
          const hours = config.businessHours[day];
          return (
            <div key={day} className={`table-row ${!hours.isOpen ? 'closed' : ''}`}>
              <div className="col-day">
                <span className={`day-indicator ${hours.isOpen ? 'open' : 'closed'}`}></span>
                {DAY_LABELS[day]}
              </div>
              <div className="col-status">
                <button
                  type="button"
                  role="switch"
                  aria-checked={hours.isOpen}
                  className={`toggle-switch toggle-sm ${hours.isOpen ? 'active' : ''}`}
                  onClick={() => updateConfig(`businessHours.${day}.isOpen`, !hours.isOpen)}
                >
                  <span className="toggle-knob" />
                </button>
                <span className={`status-label ${hours.isOpen ? 'open' : 'closed'}`}>
                  {hours.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="col-time">
                <input
                  type="time"
                  value={hours.startTime}
                  onChange={(e) => updateConfig(`businessHours.${day}.startTime`, e.target.value)}
                  disabled={!hours.isOpen}
                />
              </div>
              <div className="col-time">
                <input
                  type="time"
                  value={hours.endTime}
                  onChange={(e) => updateConfig(`businessHours.${day}.endTime`, e.target.value)}
                  disabled={!hours.isOpen}
                />
              </div>
            </div>
          );
        })}
      </div>
      {errors.businessHours && <span className="field-error">{errors.businessHours}</span>}
    </div>
  );
}

// Tab 3: Shifts & Hours (COMBINED)
function ShiftsAndHoursTab({ config, updateConfig, errors }) {
  const prefs = config.shiftPreferences;
  const rules = config.overtimeRules;

  return (
    <div className="tab-content">
      <h3>Shifts & Hours Configuration</h3>
      <p className="tab-description">Configure shift requirements and overtime limits.</p>

      <div className="two-column-layout">
        {/* Left Column: Shift Preferences */}
        <div className="column">
          <h4 className="section-title">Shift Preferences</h4>

          <div className="form-grid">
            <div className="form-group">
              <label>Minimum Workers Per Shift</label>
              <input
                type="number"
                min="1"
                max="10"
                value={prefs.minWorkersPerShift}
                onChange={(e) => updateConfig('shiftPreferences.minWorkersPerShift', parseInt(e.target.value))}
              />
              <p className="help-text">At least this many workers per shift.</p>
            </div>

            <div className="form-group">
              <label>Maximum Workers Per Shift</label>
              <input
                type="number"
                min="1"
                max="10"
                value={prefs.maxWorkersPerShift}
                onChange={(e) => updateConfig('shiftPreferences.maxWorkersPerShift', parseInt(e.target.value))}
              />
              <p className="help-text">No more than this many per shift.</p>
            </div>
          </div>
          {errors.workers && <span className="field-error">{errors.workers}</span>}

          <div className="form-group">
            <label>Ideal Shift Length</label>
            <div className="stepper-control">
              <button
                type="button"
                className="stepper-btn"
                onClick={() => updateConfig('shiftPreferences.idealShiftLength', Math.max(1, prefs.idealShiftLength - 0.5))}
                disabled={prefs.idealShiftLength <= 1}
              >
                −
              </button>
              <span className="stepper-value">{prefs.idealShiftLength} hrs</span>
              <button
                type="button"
                className="stepper-btn"
                onClick={() => updateConfig('shiftPreferences.idealShiftLength', Math.min(8, prefs.idealShiftLength + 0.5))}
                disabled={prefs.idealShiftLength >= 8}
              >
                +
              </button>
            </div>
            <p className="help-text">Algorithm will target this length (1–8 hours, 0.5 hr steps).</p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Min Shift Length (hours)</label>
              <input
                type="number"
                min="1"
                max="8"
                step="0.5"
                value={prefs.minShiftLength}
                onChange={(e) => updateConfig('shiftPreferences.minShiftLength', parseFloat(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Max Shift Length (hours)</label>
              <input
                type="number"
                min="1"
                max="8"
                step="0.5"
                value={prefs.maxShiftLength}
                onChange={(e) => updateConfig('shiftPreferences.maxShiftLength', parseFloat(e.target.value))}
              />
            </div>
          </div>
          {errors.shiftLength && <span className="field-error">{errors.shiftLength}</span>}
          {errors.idealShift && <span className="field-error">{errors.idealShift}</span>}

          <ToggleSwitch
            checked={prefs.allowSplitShifts}
            onChange={(val) => updateConfig('shiftPreferences.allowSplitShifts', val)}
            label="Allow split shifts"
            description="Workers can have multiple shifts per day."
          />
        </div>

        {/* Right Column: Overtime Rules */}
        <div className="column">
          <h4 className="section-title">Overtime Rules</h4>

          <div className="form-grid">
            <div className="form-group">
              <label>Max Hours Per Day</label>
              <input
                type="number"
                min="1"
                max="24"
                value={rules.maxHoursPerDay}
                onChange={(e) => updateConfig('overtimeRules.maxHoursPerDay', parseInt(e.target.value))}
              />
              {errors.maxDay && <span className="field-error">{errors.maxDay}</span>}
            </div>

            <div className="form-group">
              <label>Max Hours Per Week</label>
              <input
                type="number"
                min="1"
                max="168"
                value={rules.maxHoursPerWeek}
                onChange={(e) => updateConfig('overtimeRules.maxHoursPerWeek', parseInt(e.target.value))}
              />
              {errors.maxWeek && <span className="field-error">{errors.maxWeek}</span>}
            </div>
          </div>

          <ToggleSwitch
            checked={rules.warnOnOvertime}
            onChange={(val) => updateConfig('overtimeRules.warnOnOvertime', val)}
            label="Warn when approaching limits"
            description="Get notified before workers exceed their hour caps."
          />

          <ToggleSwitch
            checked={rules.allowOvertime}
            onChange={(val) => updateConfig('overtimeRules.allowOvertime', val)}
            label="Allow overtime scheduling"
            description={rules.allowOvertime ? 'Workers may be scheduled beyond limits.' : 'Workers exceeding limits will not be scheduled for additional shifts.'}
          />
        </div>
      </div>
    </div>
  );
}

// Tab 4: Advanced Options (COLLAPSIBLE)
function AdvancedOptionsTab({
  config,
  updateConfig,
  errors,
  showBreaks,
  setShowBreaks,
  showPriority,
  setShowPriority,
  addBreakTime,
  removeBreakTime,
  addPrioritySlot,
  removePrioritySlot
}) {
  return (
    <div className="tab-content">
      <h3>Advanced Options</h3>
      <p className="tab-description">Optional settings for break times and priority coverage periods.</p>

      {/* Break Times Accordion */}
      <div className="accordion-section">
        <button
          className="accordion-header"
          onClick={() => setShowBreaks(!showBreaks)}
        >
          <span>Break Times ({config.breakTimes.length})</span>
          <span className="accordion-icon">{showBreaks ? '−' : '+'}</span>
        </button>

        {showBreaks && (
          <div className="accordion-content">
            <p className="section-description">Define periods when no workers should be scheduled.</p>

            <button className="btn-primary btn-sm" onClick={addBreakTime}>
              + Add Break Time
            </button>

            {config.breakTimes.length === 0 ? (
              <div className="empty-state">
                <p>No break times configured.</p>
              </div>
            ) : (
              <div className="break-times-list">
                {config.breakTimes.map((breakTime, index) => (
                  <div key={index} className="break-time-card">
                    <div className="card-header">
                      <span>Break #{index + 1}</span>
                      <button className="btn-icon btn-danger" onClick={() => removeBreakTime(index)}>
                        Delete
                      </button>
                    </div>
                    <div className="card-body">
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Day</label>
                          <select
                            value={breakTime.day}
                            onChange={(e) => {
                              const newBreaks = config.breakTimes.map((b, i) =>
                                i === index ? { ...b, day: e.target.value } : b
                              );
                              updateConfig('breakTimes', newBreaks);
                            }}
                          >
                            <option value="all">All Days</option>
                            {DAYS.map(day => (
                              <option key={day} value={day}>{DAY_LABELS[day]}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Start Time</label>
                          <input
                            type="time"
                            value={breakTime.startTime}
                            onChange={(e) => {
                              const newBreaks = config.breakTimes.map((b, i) =>
                                i === index ? { ...b, startTime: e.target.value } : b
                              );
                              updateConfig('breakTimes', newBreaks);
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>End Time</label>
                          <input
                            type="time"
                            value={breakTime.endTime}
                            onChange={(e) => {
                              const newBreaks = config.breakTimes.map((b, i) =>
                                i === index ? { ...b, endTime: e.target.value } : b
                              );
                              updateConfig('breakTimes', newBreaks);
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Reason</label>
                        <input
                          type="text"
                          value={breakTime.reason}
                          onChange={(e) => {
                            const newBreaks = config.breakTimes.map((b, i) =>
                              i === index ? { ...b, reason: e.target.value } : b
                            );
                            updateConfig('breakTimes', newBreaks);
                          }}
                          placeholder="Lunch Break, Staff Meeting, etc."
                        />
                      </div>
                      {errors[`break_${index}`] && <span className="field-error">{errors[`break_${index}`]}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Priority Slots Accordion */}
      <div className="accordion-section">
        <button
          className="accordion-header"
          onClick={() => setShowPriority(!showPriority)}
        >
          <span>Priority Slots ({config.prioritySlots.length})</span>
          <span className="accordion-icon">{showPriority ? '−' : '+'}</span>
        </button>

        {showPriority && (
          <div className="accordion-content">
            <p className="section-description">Define peak hours requiring additional worker coverage.</p>

            <button className="btn-primary btn-sm" onClick={addPrioritySlot}>
              + Add Priority Slot
            </button>

            {config.prioritySlots.length === 0 ? (
              <div className="empty-state">
                <p>No priority slots configured.</p>
              </div>
            ) : (
              <div className="priority-slots-list">
                {config.prioritySlots.map((slot, index) => (
                  <div key={index} className="priority-slot-card">
                    <div className="card-header">
                      <span>Priority Slot #{index + 1}</span>
                      <button className="btn-icon btn-danger" onClick={() => removePrioritySlot(index)}>
                        Delete
                      </button>
                    </div>
                    <div className="card-body">
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Day</label>
                          <select
                            value={slot.day}
                            onChange={(e) => {
                              const newSlots = config.prioritySlots.map((s, i) =>
                                i === index ? { ...s, day: e.target.value } : s
                              );
                              updateConfig('prioritySlots', newSlots);
                            }}
                          >
                            <option value="all">All Days</option>
                            {DAYS.map(day => (
                              <option key={day} value={day}>{DAY_LABELS[day]}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Start Time</label>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => {
                              const newSlots = config.prioritySlots.map((s, i) =>
                                i === index ? { ...s, startTime: e.target.value } : s
                              );
                              updateConfig('prioritySlots', newSlots);
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>End Time</label>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => {
                              const newSlots = config.prioritySlots.map((s, i) =>
                                i === index ? { ...s, endTime: e.target.value } : s
                              );
                              updateConfig('prioritySlots', newSlots);
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Min Workers</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={slot.minWorkers}
                            onChange={(e) => {
                              const newSlots = config.prioritySlots.map((s, i) =>
                                i === index ? { ...s, minWorkers: parseInt(e.target.value) } : s
                              );
                              updateConfig('prioritySlots', newSlots);
                            }}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Reason</label>
                        <input
                          type="text"
                          value={slot.reason}
                          onChange={(e) => {
                            const newSlots = config.prioritySlots.map((s, i) =>
                              i === index ? { ...s, reason: e.target.value } : s
                            );
                            updateConfig('prioritySlots', newSlots);
                          }}
                          placeholder="Rush Hour, Peak Traffic, etc."
                        />
                      </div>
                      {errors[`slot_${index}`] && <span className="field-error">{errors[`slot_${index}`]}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
