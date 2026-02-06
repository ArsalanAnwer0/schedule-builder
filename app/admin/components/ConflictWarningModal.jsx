import React from 'react';
import './ConflictWarningModal.css';

export default function ConflictWarningModal({
  isOpen,
  onClose,
  onConfirm,
  conflicts,
  conflictCount,
  scheduleId
}) {
  if (!isOpen) return null;

  // Extract unique student names
  const uniqueStudents = [...new Set(conflicts.map(c => c.studentName))];

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="conflict-modal">
        <div className="conflict-modal-header">
          <h2>⚠️ Availability Conflicts Detected</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="conflict-modal-body">
          <p className="conflict-message">
            <strong>{conflictCount}</strong> student{conflictCount > 1 ? 's have' : ' has'} changed their availability
            since this schedule was generated.
          </p>

          <div className="conflict-details-list">
            <h3>Conflict Details:</h3>
            {conflicts.map((conflict, index) => (
              <div key={index} className="conflict-item">
                <div className="conflict-header">
                  <strong>{conflict.studentName}</strong>
                  <span className="conflict-badge">{conflict.conflictType.replace('_', ' ')}</span>
                </div>
                <div className="conflict-info">
                  <div className="conflict-day">📅 {conflict.details?.day || 'N/A'}</div>
                  {conflict.details?.scheduledShift && (
                    <div className="scheduled-shift">
                      <span className="label">Scheduled:</span>
                      <span className="time-slot conflicting">
                        {conflict.details.scheduledShift.start} - {conflict.details.scheduledShift.end}
                      </span>
                    </div>
                  )}
                  {conflict.details?.reason && (
                    <div className="conflict-reason">
                      <span className="label">Reason:</span> {conflict.details.reason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="warning-text">
            ⚠️ Publishing may result in students being scheduled when unavailable.
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-warning">
            Publish Anyway
          </button>
        </div>
      </div>
    </>
  );
}
