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

export default function ConfigurationWizard({ isOpen, initialConfig, mode = 'create', onSave, onCancel }) {
  const [currentTab, setCurrentTab] = useState(0);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [validationErrors, setValidationErrors] = useState({});
  const [completedTabs, setCompletedTabs] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [showBreaks, setShowBreaks] = useState(false);
  const [showPriority, setShowPriority] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setConfig({ ...DEFAULT_CONFIG, ...initialConfig });
      setShowBreaks(initialConfig.breakTimes?.length > 0);
      setShowPriority(initialConfig.prioritySlots?.length > 0);
    } else {
      setConfig(DEFAULT_CONFIG);
      setShowBreaks(false);
      setShowPriority(false);
    }
    setCurrentTab(0);
    setValidationErrors({});
    setCompletedTabs(new Set());
  }, [isOpen, initialConfig]);

  if (!isOpen) return null;

  const updateConfig = (path, value) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const validateTab = (tabIndex) => {
    const errors = {};

    switch (tabIndex) {
      case 0: // Basic Info
        if (!config.name || config.name.trim() === '') {
          errors.name = 'Configuration name is required';
        }
        break;

      case 1: // Business Hours
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
    setCurrentTab(index);
  };

  const handleSave = async () => {
    // Validate all tabs
    let allValid = true;
    for (let i = 0; i < TABS.length; i++) {
      if (!validateTab(i)) {
        allValid = false;
        break;
      }
    }

    if (!allValid) return;

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
        [day]: { ...mondayHours }
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

    return (
      <div className="wizard-preview">
        <h4>Configuration Summary</h4>

        {config.name && (
          <div className="preview-section">
            <strong>Name</strong>
            <p>{config.name}</p>
          </div>
        )}

        {openDays.length > 0 && (
          <div className="preview-section">
            <strong>Business Hours</strong>
            {openDays.map(day => (
              <div key={day} className="preview-item">
                <span className="day">{DAY_LABELS[day]}:</span>
                <span className="time">
                  {config.businessHours[day].startTime} - {config.businessHours[day].endTime}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="preview-section">
          <strong>Workers per Shift</strong>
          <p>{config.shiftPreferences.minWorkersPerShift} - {config.shiftPreferences.maxWorkersPerShift}</p>
        </div>

        <div className="preview-section">
          <strong>Shift Length</strong>
          <p>{config.shiftPreferences.minShiftLength} - {config.shiftPreferences.maxShiftLength} hours</p>
          <small>Ideal: {config.shiftPreferences.idealShiftLength}h</small>
        </div>

        <div className="preview-section">
          <strong>Overtime Limits</strong>
          <p>{config.overtimeRules.maxHoursPerDay}h/day, {config.overtimeRules.maxHoursPerWeek}h/week</p>
        </div>

        {config.breakTimes.length > 0 && (
          <div className="preview-section">
            <strong>Break Times</strong>
            <p>{config.breakTimes.length} configured</p>
          </div>
        )}

        {config.prioritySlots.length > 0 && (
          <div className="preview-section">
            <strong>Priority Slots</strong>
            <p>{config.prioritySlots.length} configured</p>
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
          <h2>{mode === 'edit' ? 'Edit Configuration' : 'Create Custom Configuration'}</h2>
          <button className="config-wizard-close" onClick={onCancel}>&times;</button>
        </div>

        {/* Tab Navigation */}
        <div className="config-wizard-tabs">
              {TABS.map((tab, index) => (
                <button
                  key={tab.id}
                  className={`config-wizard-tab ${currentTab === index ? 'active' : ''} ${completedTabs.has(index) ? 'completed' : ''}`}
                  onClick={() => handleTabClick(index)}
                >
                  <span className="tab-name">{tab.name}</span>
                  {completedTabs.has(index) && <span className="tab-check">✓</span>}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="config-wizard-content">
              {renderTabContent()}
            </div>

            {/* Footer */}
            <div className="config-wizard-footer">
              <div className="footer-left">
                {currentTab > 0 && (
                  <button className="btn-secondary" onClick={handlePrevious}>
                    Previous
                  </button>
                )}
              </div>
              <div className="footer-right">
                {currentTab < TABS.length - 1 ? (
                  <button className="btn-primary" onClick={handleNext}>
                    Next
                  </button>
                ) : (
                  <>
                    <button className="btn-secondary" onClick={onCancel}>
                      Cancel
                    </button>
                    <button
                      className="btn-primary"
                      onClick={handleSave}
                      disabled={saving || Object.keys(validationErrors).length > 0}
                    >
                      {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Validation Errors */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="config-wizard-errors">
            {Object.values(validationErrors).map((error, index) => (
              <div key={index} className="error-message">{error}</div>
            ))}
          </div>
        )}
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

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={config.isDefault}
            onChange={(e) => updateConfig('isDefault', e.target.checked)}
          />
          <span>Set as default configuration for my organization</span>
        </label>
        <p className="help-text">The default configuration will be pre-selected when generating new schedules.</p>
      </div>
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
          Copy Monday to All Days
        </button>
      </div>

      <div className="business-hours-table">
        <div className="table-header">
          <div className="col-day">Day</div>
          <div className="col-open">Open</div>
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
              <div className="col-open">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={hours.isOpen}
                    onChange={(e) => updateConfig(`businessHours.${day}.isOpen`, e.target.checked)}
                  />
                </label>
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
            <label>Ideal Shift Length: {prefs.idealShiftLength} hours</label>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={prefs.idealShiftLength}
              onChange={(e) => updateConfig('shiftPreferences.idealShiftLength', parseFloat(e.target.value))}
              className="slider"
            />
            <p className="help-text">Algorithm will target this length.</p>
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

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={prefs.allowSplitShifts}
                onChange={(e) => updateConfig('shiftPreferences.allowSplitShifts', e.target.checked)}
              />
              <span>Allow split shifts</span>
            </label>
            <p className="help-text">Workers can have multiple shifts per day.</p>
          </div>
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

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rules.warnOnOvertime}
                onChange={(e) => updateConfig('overtimeRules.warnOnOvertime', e.target.checked)}
              />
              <span>Warn when approaching limits</span>
            </label>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rules.allowOvertime}
                onChange={(e) => updateConfig('overtimeRules.allowOvertime', e.target.checked)}
              />
              <span>Allow overtime scheduling</span>
            </label>
            {!rules.allowOvertime && (
              <p className="help-text warning">
                Workers exceeding limits will not be scheduled for additional shifts.
              </p>
            )}
          </div>

          <p className="help-text">These limits help prevent worker burnout and ensure compliance.</p>
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
                              const newBreaks = [...config.breakTimes];
                              newBreaks[index].day = e.target.value;
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
                              const newBreaks = [...config.breakTimes];
                              newBreaks[index].startTime = e.target.value;
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
                              const newBreaks = [...config.breakTimes];
                              newBreaks[index].endTime = e.target.value;
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
                            const newBreaks = [...config.breakTimes];
                            newBreaks[index].reason = e.target.value;
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
                              const newSlots = [...config.prioritySlots];
                              newSlots[index].day = e.target.value;
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
                              const newSlots = [...config.prioritySlots];
                              newSlots[index].startTime = e.target.value;
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
                              const newSlots = [...config.prioritySlots];
                              newSlots[index].endTime = e.target.value;
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
                              const newSlots = [...config.prioritySlots];
                              newSlots[index].minWorkers = parseInt(e.target.value);
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
                            const newSlots = [...config.prioritySlots];
                            newSlots[index].reason = e.target.value;
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
