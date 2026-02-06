'use client';

import { useState, useEffect } from 'react';
import './AuditLogViewer.css';

const ACTION_TYPES = [
  { value: '', label: 'All Actions' },
  { value: 'schedule_created', label: 'Schedule Created' },
  { value: 'schedule_published', label: 'Schedule Published' },
  { value: 'schedule_reverted', label: 'Schedule Reverted' },
  { value: 'schedule_deleted', label: 'Schedule Deleted' },
  { value: 'student_added', label: 'Student Added' },
  { value: 'student_edited', label: 'Student Edited' },
  { value: 'student_deleted', label: 'Student Deleted' },
  { value: 'students_bulk_deleted', label: 'Students Bulk Deleted' },
  { value: 'availability_requested', label: 'Availability Requested' },
  { value: 'availability_reset', label: 'Availability Reset' },
  { value: 'admin_invited', label: 'Admin Invited' },
  { value: 'admin_removed', label: 'Admin Removed' },
];

const RESOURCE_TYPES = [
  { value: '', label: 'All Resources' },
  { value: 'schedule', label: 'Schedule' },
  { value: 'student', label: 'Student' },
  { value: 'admin', label: 'Admin' },
  { value: 'settings', label: 'Settings' },
  { value: 'configuration', label: 'Configuration' },
];

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    action: '',
    resourceType: '',
    startDate: '',
    endDate: '',
    page: 1
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.resourceType) params.append('resourceType', filters.resourceType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('page', filters.page.toString());

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load audit logs');
      }

      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);

      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.resourceType) params.append('resourceType', filters.resourceType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await fetch(`/api/audit-logs/export?${params.toString()}`);

      if (!res.ok) {
        throw new Error('Failed to export audit logs');
      }

      // Download the CSV
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatActionLabel = (action) => {
    return action.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="audit-log-viewer">
      <header className="audit-header">
        <div>
          <h2>Audit Logs</h2>
          <p>Track all administrative actions and changes</p>
        </div>
        <button
          className="btn-export"
          onClick={handleExport}
          disabled={exporting || loading}
        >
          {exporting ? 'Exporting...' : '↓ Export CSV'}
        </button>
      </header>

      {/* Filters */}
      <div className="audit-filters">
        <div className="filter-group">
          <label>Action Type</label>
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
          >
            {ACTION_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Resource Type</label>
          <select
            value={filters.resourceType}
            onChange={(e) => setFilters({ ...filters, resourceType: e.target.value, page: 1 })}
          >
            {RESOURCE_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
          />
        </div>

        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value, page: 1 })}
          />
        </div>

        <button
          className="btn-clear-filters"
          onClick={() => setFilters({ action: '', resourceType: '', startDate: '', endDate: '', page: 1 })}
        >
          Clear Filters
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>✕</span> {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading audit logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <p>No audit logs found</p>
        </div>
      ) : (
        <>
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="timestamp">{formatDate(log.createdAt)}</td>
                    <td>
                      <div className="user-info">
                        <strong>{log.userName}</strong>
                        <small>{log.userEmail}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`action-badge action-${log.action.split('_')[0]}`}>
                        {formatActionLabel(log.action)}
                      </span>
                    </td>
                    <td>
                      <div className="resource-info">
                        <span className="resource-type">{log.resourceType}</span>
                        {log.resourceName && <span className="resource-name">{log.resourceName}</span>}
                      </div>
                    </td>
                    <td className="details">
                      {log.ipAddress && <div className="ip">IP: {log.ipAddress}</div>}
                      {log.metadata?.studentCount && (
                        <div className="meta">Count: {log.metadata.studentCount}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <div className="pagination-info">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} logs
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={!pagination.hasPrev}
              >
                ← Previous
              </button>
              <span className="page-number">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={!pagination.hasNext}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
