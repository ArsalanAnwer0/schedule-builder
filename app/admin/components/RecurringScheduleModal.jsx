'use client';

import { useState, useEffect } from 'react';
import './RecurringScheduleModal.css';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
];

export default function RecurringScheduleModal({ rule, configurations, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'weekly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    timezone: 'America/New_York',
    configurationId: '',
    autoPublish: false,
    scheduleWeeksAhead: 1,
    semesterEndDate: '',
    notifyOnConflict: true,
    notifyOnGeneration: true,
    availabilityChangeThreshold: 20
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (rule) {
      setFormData({
        name: rule.name || '',
        description: rule.description || '',
        frequency: rule.frequency || 'weekly',
        dayOfWeek: rule.dayOfWeek !== null ? rule.dayOfWeek : 1,
        dayOfMonth: rule.dayOfMonth || 1,
        timezone: rule.timezone || 'America/New_York',
        configurationId: rule.configurationId?._id || '',
        autoPublish: rule.autoPublish || false,
        scheduleWeeksAhead: rule.scheduleWeeksAhead || 1,
        semesterEndDate: rule.semesterEndDate ? new Date(rule.semesterEndDate).toISOString().split('T')[0] : '',
        notifyOnConflict: rule.notifyOnConflict !== undefined ? rule.notifyOnConflict : true,
        notifyOnGeneration: rule.notifyOnGeneration !== undefined ? rule.notifyOnGeneration : true,
        availabilityChangeThreshold: rule.availabilityChangeThreshold || 20
      });
    }
  }, [rule]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.configurationId) {
      setError('Name and configuration are required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{rule ? 'Edit' : 'Create'} Recurring Schedule</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}

            {/* Basic Info */}
            <div className="form-section">
              <h3>Basic Information</h3>

              <div className="form-field">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Weekly Lab Schedule"
                  required
                />
              </div>

              <div className="form-field">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={2}
                />
              </div>
            </div>

            {/* Recurrence Settings */}
            <div className="form-section">
              <h3>Recurrence Settings</h3>

              <div className="form-field">
                <label>Frequency *</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {(formData.frequency === 'weekly' || formData.frequency === 'biweekly') && (
                <div className="form-field">
                  <label>Day of Week *</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.frequency === 'monthly' && (
                <div className="form-field">
                  <label>Day of Month *</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dayOfMonth}
                    onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
                  />
                </div>
              )}

              <div className="form-field">
                <label>Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                >
                  {TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Schedule Configuration */}
            <div className="form-section">
              <h3>Schedule Configuration</h3>

              <div className="form-field">
                <label>Configuration *</label>
                <select
                  value={formData.configurationId}
                  onChange={(e) => setFormData({ ...formData, configurationId: e.target.value })}
                  required
                >
                  <option value="">Select configuration...</option>
                  {configurations.map(config => (
                    <option key={config._id} value={config._id}>
                      {config.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Semester End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.semesterEndDate}
                  onChange={(e) => setFormData({ ...formData, semesterEndDate: e.target.value })}
                />
                <small>Rule will auto-deactivate when this date is reached</small>
              </div>

              <div className="form-field checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.autoPublish}
                    onChange={(e) => setFormData({ ...formData, autoPublish: e.target.checked })}
                  />
                  <span>Auto-publish schedules (if no conflicts)</span>
                </label>
                <small>If disabled, schedules will be saved as drafts for review</small>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="form-section">
              <h3>Notifications</h3>

              <div className="form-field checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.notifyOnGeneration}
                    onChange={(e) => setFormData({ ...formData, notifyOnGeneration: e.target.checked })}
                  />
                  <span>Notify me when schedule is generated</span>
                </label>
              </div>

              <div className="form-field checkbox-field">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.notifyOnConflict}
                    onChange={(e) => setFormData({ ...formData, notifyOnConflict: e.target.checked })}
                  />
                  <span>Notify me if conflicts are detected</span>
                </label>
              </div>

              <div className="form-field">
                <label>Availability Change Threshold: {formData.availabilityChangeThreshold}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.availabilityChangeThreshold}
                  onChange={(e) => setFormData({ ...formData, availabilityChangeThreshold: parseInt(e.target.value) })}
                />
                <small>Alert me if student availability changes by more than this percentage</small>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving...' : (rule ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
