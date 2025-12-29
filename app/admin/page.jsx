'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          loadStudentsWithAvailability();
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const loadStudentsWithAvailability = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch('/api/students/availability');
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleAddStudent = () => {
    setFormData({ name: '', email: '' });
    setEditingStudent(null);
    setShowAddModal(true);
    setError('');
    setSuccess('');
  };

  const handleEditStudent = (student) => {
    setFormData({ name: student.name, email: student.email });
    setEditingStudent(student);
    setShowAddModal(true);
    setError('');
    setSuccess('');
  };

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingStudent
        ? `/api/students/${editingStudent.id}`
        : '/api/students';
      const method = editingStudent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save student');
        return;
      }

      setSuccess(editingStudent ? 'Student updated successfully' : 'Student added successfully');
      setShowAddModal(false);
      loadStudentsWithAvailability();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  const handleDeleteClick = (student) => {
    setDeletingStudent(student);
    setShowDeleteModal(true);
    setError('');
    setSuccess('');
  };

  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;

    try {
      const res = await fetch(`/api/students/${deletingStudent.id}`, { method: 'DELETE' });

      if (res.ok) {
        setSuccess('Student deleted successfully');
        setShowDeleteModal(false);
        setDeletingStudent(null);
        loadStudentsWithAvailability();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete student');
        setShowDeleteModal(false);
        setDeletingStudent(null);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setShowDeleteModal(false);
      setDeletingStudent(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingStudent(null);
  };

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const handleRequestAvailability = async () => {
    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/availability/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedStudents }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send availability requests');
        return;
      }

      setSuccess(data.message);
      setSelectedStudents([]);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  const handleRequestSingleAvailability = async (studentId) => {
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/availability/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: [studentId] }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send availability request');
        return;
      }

      setSuccess(data.message);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  const handleRequestAllAvailability = async () => {
    if (students.length === 0) {
      setError('No students available');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const allStudentIds = students.map(s => s.id);
      const res = await fetch('/api/availability/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: allStudentIds }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send availability requests');
        return;
      }

      setSuccess(data.message);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  const handleViewAvailability = (student) => {
    setViewingStudent(student);
    setShowAvailabilityModal(true);
  };

  const formatAvailability = (availability) => {
    if (!availability) return [];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const formatted = [];

    days.forEach(day => {
      if (availability[day] && availability[day].length > 0) {
        formatted.push({
          day,
          slots: availability[day],
        });
      }
    });

    return formatted;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #1a1d29 0%, #2d3748 100%)'
      }}>
        <p style={{ color: '#94a3b8' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{
      background: 'linear-gradient(135deg, #1a1d29 0%, #2d3748 100%)'
    }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold" style={{ color: 'white' }}>
              Admin Dashboard
            </h1>
            <p className="mt-3 text-lg" style={{ color: '#94a3b8' }}>
              Welcome back, {user?.name}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-80"
            style={{
              background: '#1e293b',
              border: '1.5px solid #475569',
              color: 'white',
            }}
          >
            Logout
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div style={{
            background: '#065f46',
            border: '1px solid #059669',
            color: '#86efac',
            padding: '1rem 1.125rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem'
          }}>
            <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>✓</span>
            <div>{success}</div>
          </div>
        )}

        {error && (
          <div style={{
            background: '#7f1d1d',
            border: '1px solid #991b1b',
            color: '#fecaca',
            padding: '1rem 1.125rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.625rem'
          }}>
            <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>✕</span>
            <div>{error}</div>
          </div>
        )}

        {/* Student Management */}
        <div className="p-8 rounded-2xl shadow-xl mb-6" style={{
          background: '#1e293b',
          border: '1px solid #334155'
        }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'white' }}>
                Students & Availability
              </h2>
              <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
                {students.filter(s => s.hasSubmitted).length} of {students.length} students have submitted availability
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleRequestAllAvailability}
                disabled={students.length === 0}
                className="px-5 py-2.5 rounded-lg font-semibold transition-all hover:opacity-90"
                style={{
                  background: students.length === 0 ? '#475569' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none',
                  cursor: students.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: students.length === 0 ? 0.6 : 1,
                }}
              >
                Request All
              </button>
              <button
                onClick={handleRequestAvailability}
                disabled={selectedStudents.length === 0}
                className="px-5 py-2.5 rounded-lg font-semibold transition-all hover:opacity-90"
                style={{
                  background: selectedStudents.length === 0 ? '#475569' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  cursor: selectedStudents.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: selectedStudents.length === 0 ? 0.6 : 1,
                }}
              >
                Request Selected ({selectedStudents.length})
              </button>
              <button
                onClick={handleAddStudent}
                className="px-5 py-2.5 rounded-lg font-semibold transition-all hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                }}
              >
                + Add Student
              </button>
            </div>
          </div>

          {loadingStudents ? (
            <p style={{ color: '#94a3b8' }}>Loading students...</p>
          ) : students.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No students yet. Add your first student to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '12px', textAlign: 'left', width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === students.length && students.length > 0}
                        onChange={handleSelectAll}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#94a3b8', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#94a3b8', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#94a3b8', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleSelectStudent(student.id)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '16px', color: 'white', fontWeight: '500' }}>{student.name}</td>
                      <td style={{ padding: '16px', color: '#cbd5e1' }}>{student.email}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {student.hasSubmitted ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: '#065f46',
                            color: '#86efac',
                          }}>
                            Submitted
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: '#7f1d1d',
                            color: '#fecaca',
                          }}>
                            Pending
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {student.hasSubmitted && (
                            <button
                              onClick={() => handleViewAvailability(student)}
                              className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                              style={{
                                background: '#064e3b',
                                border: '1px solid #10b981',
                                color: '#6ee7b7',
                              }}
                            >
                              View
                            </button>
                          )}
                          {!student.hasSubmitted && (
                            <button
                              onClick={() => handleRequestSingleAvailability(student.id)}
                              className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                              style={{
                                background: '#7c2d12',
                                border: '1px solid #f59e0b',
                                color: '#fbbf24',
                              }}
                            >
                              Request
                            </button>
                          )}
                          <button
                            onClick={() => handleEditStudent(student)}
                            className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                            style={{
                              background: '#1e3a5f',
                              border: '1px solid #3b82f6',
                              color: '#60a5fa',
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(student)}
                            className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                            style={{
                              background: '#7f1d1d',
                              border: '1px solid #991b1b',
                              color: '#fecaca',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Student Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}>
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
            }}>
              <h3 className="text-2xl font-bold mb-6" style={{ color: 'white' }}>
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>

              <form onSubmit={handleSubmitStudent}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      fontSize: '1rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1.5px solid #475569',
                      color: 'white',
                      background: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      fontSize: '1rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1.5px solid #475569',
                      color: 'white',
                      background: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 rounded-lg font-semibold transition-all hover:opacity-80"
                    style={{
                      background: '#1e293b',
                      border: '1.5px solid #475569',
                      color: 'white',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg font-semibold transition-all hover:opacity-90"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: 'white',
                      border: 'none',
                    }}
                  >
                    {editingStudent ? 'Update' : 'Add'} Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Availability Modal */}
        {showAvailabilityModal && viewingStudent && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            overflow: 'auto',
            padding: '2rem',
          }}>
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                <div>
                  <h3 className="text-2xl font-bold" style={{ color: 'white' }}>
                    {viewingStudent.name}'s Availability
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Submitted: {new Date(viewingStudent.availability.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0',
                    lineHeight: '1',
                  }}
                >
                  ×
                </button>
              </div>

              {viewingStudent.availability.notes && (
                <div style={{
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Notes:
                  </p>
                  <p style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                    {viewingStudent.availability.notes}
                  </p>
                </div>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                {formatAvailability(viewingStudent.availability.availability).length === 0 ? (
                  <p style={{ color: '#94a3b8' }}>No availability submitted</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {formatAvailability(viewingStudent.availability.availability).map(({ day, slots }) => (
                      <div key={day} style={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '1rem',
                      }}>
                        <h4 style={{ color: 'white', fontWeight: '600', marginBottom: '0.75rem' }}>
                          {day}
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {slots.map((slot, idx) => (
                            <span key={idx} style={{
                              display: 'inline-block',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              background: '#1e3a5f',
                              color: '#60a5fa',
                              border: '1px solid #3b82f6',
                            }}>
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAvailabilityModal(false)}
                  className="px-5 py-2.5 rounded-lg font-semibold transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingStudent && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}>
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '450px',
              width: '90%',
            }}>
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'white' }}>
                Delete Student
              </h3>

              <p style={{ color: '#cbd5e1', fontSize: '1rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Are you sure you want to delete <strong style={{ color: 'white' }}>{deletingStudent.name}</strong>?
              </p>

              <div style={{
                background: '#7f1d1d',
                border: '1px solid #991b1b',
                borderRadius: '8px',
                padding: '0.875rem',
                marginBottom: '1.5rem',
              }}>
                <p style={{ color: '#fecaca', fontSize: '0.875rem', margin: 0, lineHeight: '1.5' }}>
                  This will permanently delete the student and their availability data. This action cannot be undone.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCancelDelete}
                  className="px-5 py-2.5 rounded-lg font-semibold transition-all hover:opacity-80"
                  style={{
                    background: '#1e293b',
                    border: '1.5px solid #475569',
                    color: 'white',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-lg font-semibold transition-all hover:opacity-90"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                    color: 'white',
                    border: 'none',
                  }}
                >
                  Delete Student
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
