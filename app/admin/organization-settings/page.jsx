'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './organization-settings.css';

const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  { value: 'UTC', label: 'UTC' }
];

export default function OrganizationSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [configurations, setConfigurations] = useState([]);

  useEffect(() => {
    loadUserAndSettings();
  }, []);

  const loadUserAndSettings = async () => {
    try {
      // Check auth
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();

      if (!userData.user || userData.user.role !== 'admin') {
        router.push('/login');
        return;
      }
      setUser(userData.user);

      // Load settings
      const settingsRes = await fetch('/api/organizations/settings');
      const settingsData = await settingsRes.json();
      setSettings(settingsData.settings);

      // Load configurations for default selection
      const configsRes = await fetch('/api/schedules/configurations');
      const configsData = await configsRes.json();
      setConfigurations(configsData.configurations || []);

      setLoading(false);
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/organizations/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save settings');
      }

      const data = await res.json();
      setSettings(data.settings);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <h1>Organization Settings</h1>
          <p>Configure your organization's preferences and defaults</p>
        </div>
        <button
          type="button"
          className="btn-back"
          onClick={() => router.push('/admin')}
        >
          ← Back to Dashboard
        </button>
      </header>

      {success && (
        <div className="alert alert-success">
          <span>✓</span> {success}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>✕</span> {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* General Information */}
        <section className="settings-section">
          <h2>General Information</h2>
          <div className="settings-fields">
            <div className="form-field">
              <label htmlFor="displayName">
                Organization Display Name <span className="required">*</span>
              </label>
              <input
                id="displayName"
                type="text"
                required
                value={settings?.displayName || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  displayName: e.target.value
                }))}
                placeholder="My Organization"
              />
            </div>

            <div className="form-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows={3}
                value={settings?.description || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Brief description of your organization..."
              />
            </div>

            <div className="form-field">
              <label htmlFor="timezone">Timezone</label>
              <select
                id="timezone"
                value={settings?.timezone || 'America/New_York'}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  timezone: e.target.value
                }))}
              >
                {TIMEZONE_OPTIONS.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Scheduling Preferences */}
        <section className="settings-section">
          <h2>Scheduling Preferences</h2>
          <div className="settings-fields">
            <div className="form-field">
              <label htmlFor="defaultConfig">Default Schedule Configuration</label>
              <select
                id="defaultConfig"
                value={settings?.scheduling?.defaultConfigurationId || ''}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  scheduling: {
                    ...prev?.scheduling,
                    defaultConfigurationId: e.target.value || null
                  }
                }))}
              >
                <option value="">-- No Default --</option>
                {configurations.map(config => (
                  <option key={config._id} value={config._id}>
                    {config.name}{config.isDefault ? ' (Default)' : ''}
                  </option>
                ))}
              </select>
              <small>Select a default configuration to use when creating new schedules</small>
            </div>

            <div className="form-field checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={settings?.scheduling?.allowEditRequests || false}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    scheduling: {
                      ...prev?.scheduling,
                      allowEditRequests: e.target.checked
                    }
                  }))}
                />
                <span>Allow students to request schedule edits</span>
              </label>
            </div>

            <div className="form-field checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={settings?.scheduling?.notifyStudentsOnPublish || false}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    scheduling: {
                      ...prev?.scheduling,
                      notifyStudentsOnPublish: e.target.checked
                    }
                  }))}
                />
                <span>Notify students when schedule is published</span>
              </label>
            </div>
          </div>
        </section>

        {/* Notification Settings */}
        <section className="settings-section">
          <h2>Notifications</h2>
          <div className="settings-fields">
            <div className="form-field checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={settings?.notifications?.emailNotificationsEnabled || false}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: {
                      ...prev?.notifications,
                      emailNotificationsEnabled: e.target.checked
                    }
                  }))}
                />
                <span>Enable email notifications</span>
              </label>
            </div>

            <div className="form-field checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={settings?.notifications?.ccAdminOnNotifications || false}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: {
                      ...prev?.notifications,
                      ccAdminOnNotifications: e.target.checked
                    }
                  }))}
                />
                <span>CC admin on all student notifications</span>
              </label>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="settings-footer">
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
