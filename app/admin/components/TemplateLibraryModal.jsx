import React, { useState, useEffect } from 'react';
import './TemplateLibraryModal.css';

export default function TemplateLibraryModal({
  isOpen,
  onSelectTemplate,
  onCancel
}) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/schedules/templates');
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load templates');
        return;
      }

      setTemplates(data.templates || []);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (template) => {
    try {
      // Mark as used
      await fetch(`/api/schedules/templates/${template._id}/use`, {
        method: 'PUT'
      });

      onSelectTemplate(template.config);
    } catch (err) {
      console.error('Failed to record template usage:', err);
      // Still select the template even if recording fails
      onSelectTemplate(template.config);
    }
  };

  const handleDeleteTemplate = async (templateId, templateName) => {
    if (!confirm(`Delete template "${templateName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    setDeletingId(templateId);

    try {
      const response = await fetch(`/api/schedules/templates/${templateId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to delete template');
        return;
      }

      // Refresh template list
      await fetchTemplates();
    } catch (err) {
      alert('Something went wrong. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onCancel}></div>
      <div className="template-library-modal">
        <div className="template-library-header">
          <h2>📚 Template Library</h2>
          <button className="modal-close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="template-library-body">
          <p className="modal-description">
            Select a template to pre-fill the schedule form with saved configurations.
          </p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No templates saved yet</h3>
              <p>Generate a schedule and click &quot;Save as Template&quot; to create one.</p>
            </div>
          ) : (
            <div className="template-grid">
              {templates.map(template => (
                <div key={template._id} className="template-card">
                  <div className="template-card-header">
                    <h3>{template.name}</h3>
                    <span className="template-usage">
                      Used {template.timesUsed} {template.timesUsed === 1 ? 'time' : 'times'}
                    </span>
                  </div>

                  {template.description && (
                    <p className="template-description">{template.description}</p>
                  )}

                  <div className="template-config">
                    <div className="config-item">
                      <strong>Office:</strong> {template.config.officeStartTime} - {template.config.officeEndTime}
                    </div>
                    <div className="config-item">
                      <strong>Hours/Worker:</strong> {template.config.hoursPerWorkerPerWeek}/week
                    </div>
                    {template.config.minShiftLength && (
                      <div className="config-item">
                        <strong>Shift:</strong> {template.config.minShiftLength}h - {template.config.maxShiftLength}h
                      </div>
                    )}
                  </div>

                  <div className="template-footer">
                    <small>
                      Created by {template.createdBy?.name || 'Unknown'} on{' '}
                      {new Date(template.createdAt).toLocaleDateString()}
                    </small>
                  </div>

                  <div className="template-actions">
                    <button
                      onClick={() => handleSelectTemplate(template)}
                      className="btn-primary"
                      disabled={deletingId === template._id}
                    >
                      Use Template
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template._id, template.name)}
                      className="btn-danger"
                      disabled={deletingId === template._id}
                    >
                      {deletingId === template._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onCancel} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </>
  );
}
