"use client";

import { useState, useEffect } from 'react';
import './ScheduleHistoryModal.css';

export default function ScheduleHistoryModal({ isOpen, onClose, onRevert }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showRevertConfirm, setShowRevertConfirm] = useState(false);
  const [revertDescription, setRevertDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/schedules/history');
      const data = await response.json();

      if (response.ok) {
        setHistory(data.history || []);
      } else {
        setError(data.error || 'Failed to load history');
      }
    } catch (err) {
      setError('Failed to load schedule history');
      console.error('Fetch history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevertClick = (version) => {
    setSelectedVersion(version);
    setRevertDescription(`Reverted to version ${version.version}`);
    setShowRevertConfirm(true);
  };

  const handleConfirmRevert = async () => {
    try {
      const response = await fetch(`/api/schedules/history/revert/${selectedVersion.version}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeDescription: revertDescription }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowRevertConfirm(false);
        onRevert && onRevert();
        onClose();
      } else {
        alert(data.error || 'Failed to revert schedule');
      }
    } catch (err) {
      alert('Failed to revert schedule');
      console.error('Revert error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="history-modal">
        <div className="history-modal-header">
          <h2>📜 Schedule History</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="history-modal-body">
          {loading ? (
            <div className="loading-state">Loading history...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <p>No schedule history yet.</p>
              <p>History will appear here after you publish schedules.</p>
            </div>
          ) : (
            <div className="history-timeline">
              {history.map((entry, index) => (
                <div
                  key={entry._id}
                  className={`history-entry ${index === 0 ? 'current' : ''}`}
                >
                  <div className="history-marker">
                    {index === 0 ? '●' : '○'}
                  </div>
                  <div className="history-content">
                    <div className="history-header">
                      <h3>
                        Version {entry.version}
                        {index === 0 && <span className="current-badge">Current</span>}
                      </h3>
                      <span className="history-date">
                        {new Date(entry.publishedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="history-details">
                      <p className="published-by">
                        Published by <strong>{entry.publishedBy.name}</strong>
                      </p>
                      {entry.changeDescription && (
                        <p className="change-description">
                          "{entry.changeDescription}"
                        </p>
                      )}
                      <p className="schedule-meta">
                        Strategy: {entry.strategyName} • {entry.totalWorkers} shifts
                      </p>
                    </div>
                    {index !== 0 && (
                      <div className="history-actions">
                        <button
                          onClick={() => handleRevertClick(entry)}
                          className="revert-button"
                        >
                          Revert to This Version
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showRevertConfirm && (
        <>
          <div className="modal-overlay" onClick={() => setShowRevertConfirm(false)}></div>
          <div className="confirm-modal">
            <h3>Confirm Revert</h3>
            <p>
              Are you sure you want to revert to <strong>Version {selectedVersion?.version}</strong>?
            </p>
            <p className="warning-text">
              This will unpublish the current schedule and replace it with the selected version.
            </p>
            <div className="form-group">
              <label>Change Description (Optional)</label>
              <input
                type="text"
                value={revertDescription}
                onChange={(e) => setRevertDescription(e.target.value)}
                placeholder="e.g., Fixing errors in current schedule"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleConfirmRevert} className="btn-primary">
                Confirm Revert
              </button>
              <button onClick={() => setShowRevertConfirm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
