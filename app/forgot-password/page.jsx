'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit password reset request');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      flexDirection: 'row'
    }}>

      {/* LEFT PANEL - White */}
      <div style={{
        flex: 1,
        backgroundColor: '#ffffff',
        padding: '4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        borderRight: '1px solid rgba(0, 0, 0, 0.1)'
      }}
      className="left-panel">
        {/* Logo */}
        <div>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{
              color: 'rgba(0, 0, 0, 0.87)',
              fontFamily: 'Georgia, serif',
              fontSize: '24px',
              fontWeight: '400',
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              Schedule Builder
            </h1>
          </Link>
        </div>

        {/* Quote */}
        <div>
          <p style={{
            fontSize: '20px',
            fontStyle: 'italic',
            color: 'rgba(0, 0, 0, 0.87)',
            lineHeight: '1.6',
            margin: 0,
            marginBottom: '1.5rem'
          }}>
            &ldquo;Make and manage schedules and shifts.&rdquo;
          </p>
          <p style={{
            fontSize: '14px',
            color: 'rgba(0, 0, 0, 0.5)',
            margin: 0
          }}>
            Schedule Builder Team
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - White */}
      <div style={{
        flex: 1,
        backgroundColor: '#ffffff',
        padding: '4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto'
      }}
      className="right-panel">
        <div style={{ maxWidth: '420px', width: '100%' }}>

          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: 'rgba(0, 0, 0, 0.87)',
              marginBottom: '0.5rem',
              margin: 0
            }}>
              Request Password Reset
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'rgba(0, 0, 0, 0.5)',
              fontWeight: '300',
              margin: '0.5rem 0 0 0'
            }}>
              Enter your email and new password. An admin will approve your request.
            </p>
          </div>

          {success ? (
            <div>
              <div style={{
                padding: '1rem 1.25rem',
                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <p style={{
                  color: '#14b8a6',
                  fontSize: '0.9375rem',
                  margin: 0,
                  fontWeight: '400'
                }}>
                  Password reset request submitted! An admin will review and approve your request.
                </p>
              </div>
              <Link href="/login" style={{
                display: 'block',
                textAlign: 'center',
                color: '#14b8a6',
                textDecoration: 'none',
                fontSize: '0.9375rem',
                fontWeight: '400'
              }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  marginBottom: '1.5rem'
                }}>
                  <p style={{
                    color: '#dc2626',
                    fontSize: '0.9375rem',
                    margin: 0,
                    fontWeight: '400'
                  }}>
                    {error}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'rgba(0, 0, 0, 0.65)',
                  marginBottom: '0.5rem'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="you@example.com"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    color: 'rgba(0, 0, 0, 0.87)',
                    outline: 'none',
                    fontWeight: '400',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#14b8a6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'rgba(0, 0, 0, 0.65)',
                  marginBottom: '0.5rem'
                }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                  placeholder="Enter new password"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    color: 'rgba(0, 0, 0, 0.87)',
                    outline: 'none',
                    fontWeight: '400',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#14b8a6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'rgba(0, 0, 0, 0.65)',
                  marginBottom: '0.5rem'
                }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  placeholder="Confirm new password"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    fontSize: '0.9375rem',
                    color: 'rgba(0, 0, 0, 0.87)',
                    outline: 'none',
                    fontWeight: '400',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#14b8a6';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem 1.5rem',
                  backgroundColor: loading ? 'rgba(20, 184, 166, 0.5)' : '#14b8a6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '1.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#0d9488';
                }}
                onMouseOut={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#14b8a6';
                }}
              >
                {loading ? 'Submitting...' : 'Submit Reset Request'}
              </button>

              {/* Info */}
              <div style={{
                padding: '1rem 1.25rem',
                backgroundColor: 'rgba(20, 184, 166, 0.05)',
                border: '1px solid rgba(20, 184, 166, 0.2)',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <p style={{
                  color: 'rgba(0, 0, 0, 0.6)',
                  fontSize: '0.875rem',
                  margin: 0,
                  lineHeight: '1.6',
                  fontWeight: '400'
                }}>
                  Your request will be reviewed by an admin. You will receive an email notification once approved.
                </p>
              </div>

              {/* Back to Login */}
              <div style={{
                textAlign: 'center',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(0, 0, 0, 0.1)'
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.5)',
                  marginBottom: '0.75rem',
                  fontWeight: '400'
                }}>
                  Remember your password?
                </p>
                <Link
                  href="/login"
                  style={{
                    color: '#14b8a6',
                    fontSize: '0.9375rem',
                    textDecoration: 'none',
                    fontWeight: '400'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Sign in
                </Link>
              </div>
            </form>
          )}

          {/* Footer */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link
              href="/"
              style={{
                color: 'rgba(0, 0, 0, 0.4)',
                fontSize: '0.875rem',
                textDecoration: 'none',
                fontWeight: '400'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.6)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.4)'}
            >
              Back to home
            </Link>
          </div>

        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .left-panel {
            display: none !important;
          }
          .right-panel {
            padding: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
