import React, { useState } from 'react';
import './SaveTemplateModal.css';

export default function SaveTemplateModal({
  isOpen,
  currentConfig,
  onSave,
  onCancel
}) {
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!templateName.trim()) {
      setError('Template name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/schedules/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          description: description || '',
          config: currentConfig
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to save template');
        return;
      }

      // Reset form and close
      setTemplateName('');
      setDescription('');
      onSave(data.template);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setTemplateName('');
    setDescription('');
    setError('');
    onCancel();
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleClose}></div>
      <div className="save-template-modal">
        <div className="save-template-modal-header">
          <h2>💾 Save as Template</h2>
          <button className="modal-close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="save-template-modal-body">
          <p className="modal-description">
            Save this configuration to reuse for future schedules.
          </p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="template-name">Template Name *</label>
            <input
              id="template-name"
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Spring Semester Template"
              maxLength={50}
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="template-description">Description (Optional)</label>
            <textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe when to use this template..."
              rows={3}
              maxLength={200}
              disabled={saving}
            />
          </div>

          <div className="config-preview">
            <h4>Configuration Preview:</h4>
            <ul>
              <li>
                <strong>Office Hours:</strong> {currentConfig.officeStartTime} - {currentConfig.officeEndTime}
              </li>
              <li>
                <strong>Hours per Worker:</strong> {currentConfig.hoursPerWorkerPerWeek}/week
              </li>
              <li>
                <strong>Total Hours:</strong> {currentConfig.totalHoursPerWeek}/week
              </li>
              {currentConfig.minShiftLength && (
                <li>
                  <strong>Min Shift:</strong> {currentConfig.minShiftLength}h
                </li>
              )}
              {currentConfig.maxShiftLength && (
                <li>
                  <strong>Max Shift:</strong> {currentConfig.maxShiftLength}h
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={handleClose}
            className="btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={saving || !templateName.trim()}
          >
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </>
  );
}
