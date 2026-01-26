'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send reset link');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          flexDirection: 'row'
        }}
      >
        {/* LEFT PANEL */}
        <div
          className="left-panel"
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            padding: '2rem 3rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid rgba(0, 0, 0, 0.1)',
            boxSizing: 'border-box'
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1
              style={{
                color: 'rgba(0, 0, 0, 0.87)',
                fontFamily: 'Georgia, serif',
                fontSize: '24px',
                fontWeight: '400',
                margin: 0,
                letterSpacing: '-0.01em'
              }}
            >
              Schedule Builder
            </h1>
          </Link>

          {/* Quote */}
          <div>
            <p
              style={{
                fontSize: '20px',
                fontStyle: 'italic',
                color: 'rgba(0, 0, 0, 0.87)',
                lineHeight: '1.6',
                margin: 0,
                marginBottom: '1.5rem'
              }}
            >
              "Make and manage schedules and shifts."
            </p>
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.5)',
                margin: 0
              }}
            >
              — Schedule Builder Team
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div
          className="right-panel"
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            padding: '2rem 3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ width: '100%', maxWidth: '420px' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: '600',
                  color: 'rgba(0, 0, 0, 0.87)',
                  marginBottom: '0.5rem',
                  margin: 0
                }}
              >
                Reset your password
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  color: 'rgba(0, 0, 0, 0.5)',
                  fontWeight: '300',
                  margin: '0.25rem 0 0 0'
                }}
              >
                We'll send you a link to reset your password
              </p>
            </div>

            {success ? (
              /* Success State */
              <div>
                {/* Success Alert */}
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    border: '1px solid rgba(20, 184, 166, 0.3)',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}
                >
                  <p
                    style={{
                      color: '#14b8a6',
                      fontSize: '0.9375rem',
                      margin: 0,
                      fontWeight: '500'
                    }}
                  >
                    Password reset link sent! Check your email for instructions.
                  </p>
                </div>

                {/* Info Message */}
                <div
                  style={{
                    padding: '1rem 1.25rem',
                    backgroundColor: 'rgba(20, 184, 166, 0.05)',
                    border: '1px solid rgba(20, 184, 166, 0.2)',
                    borderRadius: '8px',
                    marginBottom: '2rem'
                  }}
                >
                  <p
                    style={{
                      color: 'rgba(0, 0, 0, 0.6)',
                      fontSize: '0.875rem',
                      margin: 0,
                      lineHeight: '1.6',
                      fontWeight: '400'
                    }}
                  >
                    The reset link will expire in 1 hour. If you don't receive the email, check your spam folder.
                  </p>
                </div>

                {/* Back to Login Link */}
                <div style={{ textAlign: 'center' }}>
                  <Link
                    href="/login"
                    style={{
                      color: '#14b8a6',
                      textDecoration: 'none',
                      fontSize: '0.9375rem',
                      fontWeight: '400'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    ← Back to login
                  </Link>
                </div>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit}>
                {/* Error Alert */}
                {error && (
                  <div
                    style={{
                      padding: '1rem 1.25rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      marginBottom: '1.5rem'
                    }}
                  >
                    <p
                      style={{
                        color: '#dc2626',
                        fontSize: '0.9375rem',
                        margin: 0,
                        fontWeight: '400'
                      }}
                    >
                      {error}
                    </p>
                  </div>
                )}

                {/* Email Field */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label
                    htmlFor="email"
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'rgba(0, 0, 0, 0.65)',
                      marginBottom: '0.5rem'
                    }}
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

                {/* Submit Button */}
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
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                {/* Footer Links */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.5)',
                    marginTop: '2rem'
                  }}
                >
                  <Link
                    href="/login"
                    style={{
                      color: '#14b8a6',
                      textDecoration: 'none',
                      fontWeight: '400'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    Remember your password?
                  </Link>
                  <Link
                    href="/"
                    style={{
                      color: '#14b8a6',
                      textDecoration: 'none',
                      fontWeight: '400'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    Back to home
                  </Link>
                </div>
              </form>
            )}
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
    </>
  );
}
