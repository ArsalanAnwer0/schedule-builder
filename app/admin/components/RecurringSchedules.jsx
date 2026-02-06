'use client';

import { useState, useEffect } from 'react';
import RecurringScheduleModal from './RecurringScheduleModal';
import './RecurringSchedules.css';

export default function RecurringSchedules({ user, configurations }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/recurring-schedules');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load rules');
      }

      setRules(data.rules || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (ruleId, currentStatus) => {
    try {
      const res = await fetch(`/api/recurring-schedules/${ruleId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to toggle rule');
      }

      setSuccess(`Rule ${!currentStatus ? 'activated' : 'paused'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
      loadRules();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDelete = async (ruleId, ruleName) => {
    if (!confirm(`Are you sure you want to delete "${ruleName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/recurring-schedules/${ruleId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete rule');
      }

      setSuccess('Rule deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      loadRules();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleRunNow = async (ruleId, ruleName) => {
    if (!confirm(`Generate schedule now for "${ruleName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/recurring-schedules/${ruleId}/run-now`, {
        method: 'POST'
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate schedule');
      }

      const data = await res.json();
      setSuccess(`Schedule generated successfully! Status: ${data.status}`);
      setTimeout(() => setSuccess(''), 5000);
      loadRules();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getFrequencyBadge = (frequency) => {
    const badges = {
      weekly: { label: 'Weekly', color: '#14b8a6' },
      biweekly: { label: 'Biweekly', color: '#8b5cf6' },
      monthly: { label: 'Monthly', color: '#f59e0b' }
    };
    const badge = badges[frequency] || { label: frequency, color: '#6b7280' };

    return (
      <span
        className="frequency-badge"
        style={{ backgroundColor: badge.color }}
      >
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return (
      <span
        className={`status-badge ${isActive ? 'active' : 'paused'}`}
      >
        {isActive ? 'Active' : 'Paused'}
      </span>
    );
  };

  const handleSaveRule = async (formData) => {
    try {
      const method = selectedRule ? 'PATCH' : 'POST';
      const url = selectedRule
        ? `/api/recurring-schedules/${selectedRule._id}`
        : '/api/recurring-schedules';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save rule');
      }

      setSuccess(`Rule ${selectedRule ? 'updated' : 'created'} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
      loadRules();
      setShowModal(false);
      setSelectedRule(null);
    } catch (err) {
      throw err;
    }
  };

  const formatNextRun = (date) => {
    if (!date) return 'Not scheduled';

    const now = new Date();
    const next = new Date(date);
    const diffMs = next - now;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 0) return 'Overdue';
    if (diffMins < 60) return `in ${diffMins}min`;
    if (diffHours < 24) return `in ${diffHours}h`;
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `in ${diffDays}d`;

    return next.toLocaleDateString();
  };

  if (loading && rules.length === 0) {
    return (
      <div className="recurring-schedules">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading recurring schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recurring-schedules">
      <header className="recurring-header">
        <div>
          <h2>Recurring Schedules</h2>
          <p>Auto-generate schedules on weekly, biweekly, or monthly intervals</p>
        </div>
        <button className="btn-create" onClick={() => { setSelectedRule(null); setShowModal(true); }}>
          + Create Recurring Rule
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

      {rules.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <h3>No Recurring Schedules</h3>
          <p>Create your first recurring schedule to automate schedule generation</p>
          <button className="btn-primary" onClick={() => { setSelectedRule(null); setShowModal(true); }}>
            Create Recurring Rule
          </button>
        </div>
      ) : (
        <div className="rules-table-container">
          <table className="rules-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Frequency</th>
                <th>Configuration</th>
                <th>Status</th>
                <th>Next Run</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule._id}>
                  <td>
                    <div className="rule-name">
                      <strong>{rule.name}</strong>
                      {rule.description && <small>{rule.description}</small>}
                    </div>
                  </td>
                  <td>{getFrequencyBadge(rule.frequency)}</td>
                  <td>
                    {rule.configurationId ? (
                      <span className="config-name">{rule.configurationId.name}</span>
                    ) : (
                      <span className="config-deleted">Deleted</span>
                    )}
                  </td>
                  <td>{getStatusBadge(rule.isActive)}</td>
                  <td className="next-run">{formatNextRun(rule.nextRunAt)}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleToggle(rule._id, rule.isActive)}
                        title={rule.isActive ? 'Pause' : 'Activate'}
                      >
                        {rule.isActive ? '⏸' : '▶'}
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleRunNow(rule._id, rule.name)}
                        title="Run Now"
                      >
                        ▶️
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDelete(rule._id, rule.name)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <RecurringScheduleModal
          rule={selectedRule}
          configurations={configurations}
          onSave={handleSaveRule}
          onClose={() => { setShowModal(false); setSelectedRule(null); }}
        />
      )}
    </div>
  );
}
