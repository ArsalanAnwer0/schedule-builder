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

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          loadStudents();
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

  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch('/api/students');
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
      loadStudents();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });

      if (res.ok) {
        setSuccess('Student deleted successfully');
        loadStudents();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete student');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
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
      <div className="max-w-6xl mx-auto">
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
            padding: '0.875rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '1.5rem'
          }}>
            ✓ {success}
          </div>
        )}

        {error && (
          <div style={{
            background: '#7f1d1d',
            border: '1px solid #991b1b',
            color: '#fecaca',
            padding: '0.875rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        {/* Student Management */}
        <div className="p-8 rounded-2xl shadow-xl mb-6" style={{
          background: '#1e293b',
          border: '1px solid #334155'
        }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'white' }}>
              Students
            </h2>
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

          {loadingStudents ? (
            <p style={{ color: '#94a3b8' }}>Loading students...</p>
          ) : students.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No students yet. Add your first student to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#94a3b8', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#94a3b8', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'right', color: '#94a3b8', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '16px', color: 'white' }}>{student.name}</td>
                      <td style={{ padding: '16px', color: '#cbd5e1' }}>{student.email}</td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="px-4 py-2 rounded-lg font-medium mr-2 transition-all hover:opacity-80"
                          style={{
                            background: '#1e3a5f',
                            border: '1px solid #3b82f6',
                            color: '#60a5fa',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                          style={{
                            background: '#7f1d1d',
                            border: '1px solid #991b1b',
                            color: '#fecaca',
                          }}
                        >
                          Delete
                        </button>
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
      </div>
    </div>
  );
}
