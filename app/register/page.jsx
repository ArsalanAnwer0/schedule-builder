'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePasswordValidation } from '@/lib/hooks/usePasswordValidation';
import PasswordRequirementsDisplay from '@/components/auth/PasswordRequirementsDisplay';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organizationName: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Use password validation hook
  const { validation: passwordValidation, isValid: isPasswordValid } = usePasswordValidation(formData.password);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          organizationName: formData.organizationName,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Registration successful - redirect to login
      window.location.href = '/login';
      setLoading(false);

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
              Create your admin account
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'rgba(0, 0, 0, 0.5)',
              fontWeight: '300',
              margin: '0.5rem 0 0 0'
            }}>
              Set up your organization on Schedule Builder
            </p>
          </div>

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

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1.5rem auto',
                backgroundColor: 'rgba(20, 184, 166, 0.15)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>

              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '400',
                color: 'rgba(0, 0, 0, 0.87)',
                marginBottom: '0.75rem',
                fontFamily: 'Georgia, serif'
              }}>
                Account created successfully
              </h2>

              <p style={{
                color: 'rgba(0, 0, 0, 0.6)',
                fontSize: '0.9375rem',
                margin: '0 0 2rem 0',
                lineHeight: '1.6',
                fontWeight: '400'
              }}>
                You can now login with your email and password.
              </p>

              <Link
                href="/login"
                style={{
                  display: 'inline-block',
                  padding: '0.875rem 2rem',
                  backgroundColor: '#14b8a6',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#14b8a6'}
              >
                Continue to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Info Banner */}
              <div style={{
                padding: '1rem 1.25rem',
                backgroundColor: 'rgba(20, 184, 166, 0.05)',
                border: '1px solid rgba(20, 184, 166, 0.2)',
                borderRadius: '8px',
                marginBottom: '2rem'
              }}>
                <p style={{
                  color: 'rgba(0, 0, 0, 0.6)',
                  fontSize: '0.875rem',
                  margin: 0,
                  lineHeight: '1.6',
                  fontWeight: '400'
                }}>
                  Create a primary admin account for your organization
                </p>
              </div>

              {/* Form Fields */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'rgba(0, 0, 0, 0.65)',
                  marginBottom: '0.5rem'
                }}>
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
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
                  Organization Name
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  required
                  placeholder="e.g., ABC University"
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
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
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
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="12"
                  placeholder="12+ characters required"
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

                {/* Password Requirements Display */}
                <PasswordRequirementsDisplay
                  password={formData.password}
                  validation={passwordValidation}
                  showStrengthBar={true}
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
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="12"
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
                {loading ? 'Creating account...' : 'Create Admin Account'}
              </button>

              {/* Login Link */}
              <div style={{ textAlign: 'center' }}>
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
                  Already have an account? Login
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
