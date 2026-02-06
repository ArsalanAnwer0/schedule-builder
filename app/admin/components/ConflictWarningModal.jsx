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

          <div className="conflict-student-list">
            <h3>Affected Students:</h3>
            <ul>
              {uniqueStudents.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
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
