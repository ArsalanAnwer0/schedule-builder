'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validatePasswordStrength, getStrengthDisplay } from '../../lib/utils/passwordStrength';

export default function SetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Check password strength when password changes
  useEffect(() => {
    if (formData.password) {
      const strength = validatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password strength
    const strength = validatePasswordStrength(formData.password);
    if (!strength.isValid) {
      setError(strength.errors[0]);
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to set password');
        setLoading(false);
        return;
      }

      // Auto-login successful - redirect to appropriate dashboard
      window.location.href = data.redirectUrl || '/login';
    } catch (err) {
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
            "Make and manage schedules and shifts."
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
              Create Your Password
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'rgba(0, 0, 0, 0.5)',
              fontWeight: '300',
              margin: '0.5rem 0 0 0'
            }}>
              For students and secondary admins
            </p>
          </div>

          {/* Info Banner */}
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(20, 184, 166, 0.05)',
            border: '1px solid rgba(20, 184, 166, 0.2)',
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(0, 0, 0, 0.6)',
              margin: 0,
              lineHeight: '1.5',
              fontWeight: '400'
            }}>
              Your email must be added to the system before you can create a password. Students: contact your admin. Secondary admins: make sure the primary admin has invited you.
            </p>
          </div>

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
                fontSize: '0.875rem',
                color: '#dc2626',
                margin: 0,
                fontWeight: '400'
              }}>
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
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
                onChange={handleChange}
                required
                placeholder="your.email@university.edu"
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

            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: 'rgba(0, 0, 0, 0.65)',
                marginBottom: '0.5rem'
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="8"
                placeholder="At least 8 characters with uppercase, number, and special character"
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

              {/* Password Strength Indicator */}
              {passwordStrength && formData.password && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'rgba(0, 0, 0, 0.6)',
                      fontWeight: '400'
                    }}>
                      Password Strength:
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: getStrengthDisplay(passwordStrength.strength).color
                    }}>
                      {getStrengthDisplay(passwordStrength.strength).label}
                    </span>
                  </div>

                  {/* Strength Bar */}
                  <div style={{
                    height: '4px',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(passwordStrength.score / 6) * 100}%`,
                      backgroundColor: getStrengthDisplay(passwordStrength.strength).color,
                      transition: 'all 0.3s ease'
                    }}></div>
                  </div>

                  {/* Requirement Checklist */}
                  {passwordStrength.errors.length > 0 && (
                    <div style={{
                      padding: '0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.03)',
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 0, 0, 0.1)'
                    }}>
                      <ul style={{
                        margin: 0,
                        paddingLeft: '1.25rem',
                        fontSize: '0.75rem',
                        color: 'rgba(0, 0, 0, 0.6)',
                        lineHeight: '1.6'
                      }}>
                        {passwordStrength.errors.map((err, idx) => (
                          <li key={idx} style={{ marginBottom: idx < passwordStrength.errors.length - 1 ? '0.25rem' : 0 }}>
                            {err}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: 'rgba(0, 0, 0, 0.65)',
                marginBottom: '0.5rem'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="Re-enter your password"
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
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#0d9488';
              }}
              onMouseOut={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#14b8a6';
              }}
            >
              {loading ? 'Creating Password...' : 'Create Password & Login'}
            </button>
          </form>

          {/* Footer Links */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(0, 0, 0, 0.5)',
              marginBottom: '1rem'
            }}>
              Already have a password?{' '}
              <Link
                href="/login"
                style={{
                  color: '#14b8a6',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '400'
                }}
                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Login here
              </Link>
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(0, 0, 0, 0.5)',
              margin: 0
            }}>
              Are you an admin?{' '}
              <Link
                href="/register"
                style={{
                  color: '#14b8a6',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '400'
                }}
                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Create admin account
              </Link>
            </p>
          </div>

          {/* Back to home */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
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
