'use client';

import { useState, useEffect } from 'react';
import './ConfigurationLibrary.css';

export default function ConfigurationLibrary({ isOpen, onSelectConfig, onEditConfig, onDeleteConfig, onClose }) {
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [settingDefault, setSettingDefault] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadConfigurations();
    }
  }, [isOpen]);

  const loadConfigurations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/schedules/configurations');

      // Don't treat authentication errors as failures - just show empty state
      if (!response.ok) {
        // For 401/403/500 (auth errors or server errors during auth), silently use empty configurations
        if (response.status === 401 || response.status === 403 || response.status === 500) {
          console.warn('Authentication issue or server error, showing empty state for localhost');
          setConfigurations([]);
          setLoading(false);
          return;
        }
        // For other errors, show error message
        throw new Error('Failed to load configurations');
      }

      const data = await response.json();
      setConfigurations(data.configurations || []);
    } catch (err) {
      // Only show error for genuine network failures
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Unable to connect to server. Please check your connection.');
        setConfigurations([]);
      } else if (err.message === 'Failed to load configurations') {
        // This shouldn't happen now, but just in case
        console.error('Unexpected error loading configurations:', err);
        setConfigurations([]);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (configId) => {
    setSettingDefault(configId);
    try {
      const response = await fetch(`/api/schedules/configurations/${configId}/set-default`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to set default configuration');
      }

      // Reload configurations to update default status
      await loadConfigurations();
    } catch (err) {
      setError(err.message);
    } finally {
      setSettingDefault(null);
    }
  };

  const handleDelete = async (configId) => {
    try {
      const response = await fetch(`/api/schedules/configurations/${configId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete configuration');
      }

      // Call parent handler and reload
      if (onDeleteConfig) {
        onDeleteConfig(configId);
      }
      await loadConfigurations();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUse = async (config) => {
    // Track usage
    try {
      await fetch(`/api/schedules/configurations/${config._id}/use`, {
        method: 'PUT'
      });
    } catch (err) {
      console.error('Failed to track usage:', err);
    }

    if (onSelectConfig) {
      onSelectConfig(config);
    }
    onClose();
  };

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getOpenDaysCount = (config) => {
    if (!config.businessHours || typeof config.businessHours !== 'object') {
      return 0;
    }
    return Object.values(config.businessHours).filter(day => day && day.isOpen).length;
  };

  const filteredConfigurations = configurations.filter(config => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      config.name.toLowerCase().includes(query) ||
      (config.description && config.description.toLowerCase().includes(query))
    );
  });

  const defaultConfig = configurations.find(c => c.isDefault);
  const mostUsedConfig = configurations.reduce((prev, current) =>
    (current.timesUsed || 0) > (prev.timesUsed || 0) ? current : prev
  , configurations[0]);
  const migratedCount = configurations.filter(c => c.migratedAt).length;

  return (
    <div className="config-library-overlay" onClick={onClose}>
      <div className="config-library-modal" onClick={(e) => e.stopPropagation()}>
        <div className="config-library-header">
          <h2>Configuration Library</h2>
          <button className="config-library-close" onClick={onClose}>×</button>
        </div>

        <div className="config-library-content">
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Quick Stats */}
          {!loading && configurations.length > 0 && (
            <div className="quick-stats">
              <div className="stat-card">
                <div className="stat-number">{configurations.length}</div>
                <div className="stat-label">Total Configurations</div>
              </div>
              {defaultConfig && (
                <div className="stat-card stat-highlight">
                  <div className="stat-number">Default</div>
                  <div className="stat-label">{defaultConfig.name}</div>
                </div>
              )}
              {mostUsedConfig && (
                <div className="stat-card">
                  <div className="stat-number">{mostUsedConfig.timesUsed || 0}x</div>
                  <div className="stat-label">Most Used: {mostUsedConfig.name}</div>
                </div>
              )}
              {migratedCount > 0 && (
                <div className="stat-card stat-info">
                  <div className="stat-number">{migratedCount}</div>
                  <div className="stat-label">Migrated from Templates</div>
                </div>
              )}
            </div>
          )}

          {/* Search Bar */}
          {!loading && configurations.length > 0 && (
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search configurations by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading configurations...</p>
            </div>
          ) : configurations.length === 0 ? (
            <div className="empty-state">
              <h3>No Configurations Yet</h3>
              <p>Create your first custom configuration to get started.</p>
            </div>
          ) : filteredConfigurations.length === 0 ? (
            <div className="empty-state">
              <h3>No Results Found</h3>
              <p>No configurations match your search: "{searchQuery}"</p>
              <button className="btn-secondary" onClick={() => setSearchQuery('')}>
                Clear Search
              </button>
            </div>
          ) : (
            <div className="configs-grid">
              {filteredConfigurations.map(config => (
                <div key={config._id} className="config-card">
                  <div className="config-badges">
                    {config.isDefault && (
                      <div className="default-badge">Default</div>
                    )}
                    {config.migratedAt && (
                      <div className="migrated-badge">Migrated</div>
                    )}
                  </div>

                  <div className="config-card-header">
                    <h3>{config.name}</h3>
                    {config.description && (
                      <p className="config-description">{config.description}</p>
                    )}
                  </div>

                  <div className="config-card-body">
                    <div className="config-stats">
                      <div className="stat-item">
                        <span className="stat-label">{getOpenDaysCount(config)} days open</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">
                          {config.shiftPreferences?.minWorkersPerShift || 1}-
                          {config.shiftPreferences?.maxWorkersPerShift || 5} workers
                        </span>
                      </div>
                      {config.breakTimes && config.breakTimes.length > 0 && (
                        <div className="stat-item">
                          <span className="stat-label">{config.breakTimes.length} break(s)</span>
                        </div>
                      )}
                      {config.prioritySlots && config.prioritySlots.length > 0 && (
                        <div className="stat-item">
                          <span className="stat-label">{config.prioritySlots.length} priority slot(s)</span>
                        </div>
                      )}
                    </div>

                    <div className="config-meta">
                      <div className="meta-item">
                        <span className="meta-label">Used:</span>
                        <span className="meta-value">{config.timesUsed || 0} times</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Last used:</span>
                        <span className="meta-value">{formatDate(config.lastUsedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="config-card-actions">
                    <button
                      className="btn-use"
                      onClick={() => handleUse(config)}
                    >
                      Use
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => {
                        if (onEditConfig) onEditConfig(config);
                        onClose();
                      }}
                    >
                      Edit
                    </button>
                    {!config.isDefault && (
                      <button
                        className="btn-default"
                        onClick={() => handleSetDefault(config._id)}
                        disabled={settingDefault === config._id}
                      >
                        {settingDefault === config._id ? 'Setting...' : 'Set Default'}
                      </button>
                    )}
                    {!config.isDefault && (
                      <button
                        className="btn-delete"
                        onClick={() => setDeleteConfirm(config._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="config-library-footer">
          <p className="footer-text">
            {configurations.length} configuration{configurations.length !== 1 ? 's' : ''} available
          </p>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="confirm-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Delete Configuration?</h3>
              <p>
                Are you sure you want to delete this configuration?
                This action cannot be undone.
              </p>
              <div className="confirm-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
