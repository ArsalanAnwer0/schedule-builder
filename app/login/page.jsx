'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [usePasswordLogin, setUsePasswordLogin] = useState(true);

  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0 && codeSent) {
      setCanResend(true);
    }
  }, [resendCountdown, codeSent]);

  const startResendCountdown = () => {
    setCanResend(false);
    setResendCountdown(90); // 90 seconds to match rate limit
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Check if 2FA is required
      if (data.requires2FA) {
        window.location.href = `/verify-2fa?userId=${data.userId}`;
        return;
      }

      // Login successful - redirect based on role
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }

    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send code');
        setLoading(false);
        return;
      }

      setCodeSent(true);
      setMessage('Verification code sent! Check your email.');
      setLoading(false);
      startResendCountdown();

    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid verification code');
        setLoading(false);
        return;
      }

      // Login successful - redirect based on role
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }

    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setCodeSent(false);
    setCode('');
    setError('');
    setMessage('');
    setCanResend(false);
    setResendCountdown(0);
  };

  const handleResendCode = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to resend code');
        setLoading(false);
        return;
      }

      setMessage('New verification code sent!');
      setLoading(false);
      startResendCountdown();

    } catch (err) {
      setError('Failed to resend code. Please try again.');
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

        {/* Responsive styles will be added via <style> tag below */}
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
              {codeSent ? 'Enter verification code' : 'Sign in to your account'}
            </h2>
            <p style={{
              fontSize: '16px',
              color: 'rgba(0, 0, 0, 0.5)',
              fontWeight: '300',
              margin: '0.5rem 0 0 0'
            }}>
              {!codeSent && 'Welcome back to Schedule Builder'}
            </p>
          </div>

          {/* URL Error */}
          {urlError && (
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
                {urlError === 'invalid_token' && 'Invalid login link'}
                {urlError === 'expired_or_invalid' && 'Login link expired or invalid'}
                {urlError === 'server_error' && 'Server error. Please try again.'}
              </p>
            </div>
          )}

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

          {/* Success Message */}
          {message && (
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
                {message}
              </p>
            </div>
          )}

          {/* Password Login Step */}
          {!codeSent && usePasswordLogin && (
            <form onSubmit={handlePasswordLogin}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
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

              <div style={{ marginBottom: '1rem' }}>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your password"
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

              {/* Forgot Password Link */}
              <div style={{
                textAlign: 'right',
                marginBottom: '1.5rem'
              }}>
                <Link
                  href="/forgot-password"
                  style={{
                    fontSize: '0.875rem',
                    color: '#14b8a6',
                    textDecoration: 'none',
                    fontWeight: '400',
                    transition: 'color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#0d9488'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#14b8a6'}
                >
                  Forgot Password?
                </Link>
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
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Alternative Login Option */}
              <div style={{
                textAlign: 'center',
                marginBottom: '1.5rem'
              }}>
                <button
                  type="button"
                  onClick={() => setUsePasswordLogin(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#14b8a6',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'none',
                    fontWeight: '400'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Use verification code instead
                </button>
              </div>

              {/* Register/Set Password Links */}
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
                  First time here?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link
                    href="/set-password"
                    style={{
                      color: '#14b8a6',
                      fontSize: '0.9375rem',
                      textDecoration: 'none',
                      fontWeight: '400'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Set your password (Students)
                  </Link>
                  <Link
                    href="/register"
                    style={{
                      color: 'rgba(0, 0, 0, 0.5)',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      fontWeight: '400'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.7)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.5)'}
                  >
                    Register as Admin
                  </Link>
                </div>
              </div>
            </form>
          )}

          {/* Email Step for Verification Code */}
          {!codeSent && !usePasswordLogin && (
            <form onSubmit={handleRequestCode}>
              <div style={{ marginBottom: '2rem' }}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
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
                {loading ? 'Sending code...' : 'Send Verification Code'}
              </button>

              {/* Info */}
              <div style={{
                padding: '1rem 1.25rem',
                backgroundColor: 'rgba(20, 184, 166, 0.05)',
                border: '1px solid rgba(20, 184, 166, 0.2)',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <p style={{
                  color: 'rgba(0, 0, 0, 0.6)',
                  fontSize: '0.875rem',
                  margin: 0,
                  lineHeight: '1.6',
                  fontWeight: '400'
                }}>
                  We'll send a 6-digit code to your email. Code expires in 10 minutes.
                </p>
              </div>

              {/* School Email Warning */}
              <div style={{
                padding: '1rem 1.25rem',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <p style={{
                  color: 'rgba(220, 38, 38, 0.8)',
                  fontSize: '0.875rem',
                  margin: 0,
                  lineHeight: '1.6',
                  fontWeight: '400'
                }}>
                  Note: Accounts with school/work email addresses may not receive email notifications due to spam filtering. Please use password login instead.
                </p>
              </div>

              {/* Alternative Login Option */}
              <div style={{
                textAlign: 'center',
                marginBottom: '1.5rem'
              }}>
                <button
                  type="button"
                  onClick={() => setUsePasswordLogin(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#14b8a6',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'none',
                    fontWeight: '400'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Use password instead
                </button>
              </div>

              {/* Register/Set Password Links */}
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
                  First time here?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <Link
                    href="/set-password"
                    style={{
                      color: '#14b8a6',
                      fontSize: '0.9375rem',
                      textDecoration: 'none',
                      fontWeight: '400'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Set your password (Students)
                  </Link>
                  <Link
                    href="/register"
                    style={{
                      color: 'rgba(0, 0, 0, 0.5)',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      fontWeight: '400'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.7)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.5)'}
                  >
                    Register as Admin
                  </Link>
                </div>
              </div>
            </form>
          )}

          {/* Verification Code Step */}
          {codeSent && (
            <form onSubmit={handleVerifyCode}>
              {/* Email Display */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'rgba(0, 0, 0, 0.6)',
                  margin: '0 0 0.5rem 0',
                  fontWeight: '400'
                }}>
                  Signing in as: <strong style={{ color: '#14b8a6', fontWeight: '500' }}>{email}</strong>
                </p>
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#14b8a6',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'none',
                    fontWeight: '400'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Change email
                </button>
              </div>

              {/* Code Input */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'rgba(0, 0, 0, 0.65)',
                  marginBottom: '0.5rem'
                }}>
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  disabled={loading}
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="off"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    fontSize: '1.5rem',
                    color: 'rgba(0, 0, 0, 0.87)',
                    outline: 'none',
                    fontWeight: '400',
                    transition: 'all 0.2s',
                    letterSpacing: '0.5rem',
                    textAlign: 'center',
                    fontFamily: 'monospace',
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
                disabled={loading || code.length !== 6}
                style={{
                  width: '100%',
                  padding: '0.875rem 1.5rem',
                  backgroundColor: (loading || code.length !== 6) ? 'rgba(20, 184, 166, 0.5)' : '#14b8a6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: (loading || code.length !== 6) ? 'not-allowed' : 'pointer',
                  marginBottom: '1.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (!loading && code.length === 6) e.currentTarget.style.backgroundColor = '#0d9488';
                }}
                onMouseOut={(e) => {
                  if (!loading && code.length === 6) e.currentTarget.style.backgroundColor = '#14b8a6';
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
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
                  margin: '0 0 0.5rem 0',
                  lineHeight: '1.6',
                  fontWeight: '400'
                }}>
                  Check your email for the 6-digit code. Code expires in 10 minutes.
                </p>
              </div>

              {/* Resend */}
              <div style={{
                textAlign: 'center',
                paddingTop: '1.5rem',
                borderTop: '1px solid rgba(0, 0, 0, 0.1)'
              }}>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#14b8a6',
                      fontSize: '0.9375rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      padding: 0,
                      textDecoration: 'none',
                      fontWeight: '400'
                    }}
                    onMouseOver={(e) => {
                      if (!loading) e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Resend verification code
                  </button>
                ) : (
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.4)',
                    margin: 0,
                    fontWeight: '400'
                  }}>
                    Resend code in {resendCountdown}s
                  </p>
                )}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          color: 'rgba(0, 0, 0, 0.6)',
          fontSize: '1rem',
          fontWeight: '400'
        }}>
          Loading...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
