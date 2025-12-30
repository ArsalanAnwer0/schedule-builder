'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

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
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1d29 0%, #2d3748 100%)',
      padding: '3rem 2rem',
      paddingTop: '5vh'
    }}>
      <div style={{ width: '100%', maxWidth: '550px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            color: 'white',
            fontSize: '3.5rem',
            fontWeight: '700',
            letterSpacing: '-0.02em',
            marginBottom: '1rem'
          }}>
            Schedule Builder
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '1.15rem',
            fontWeight: '400'
          }}>
            Sign in to continue
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '3rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Error Messages */}
          {urlError && (
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
              <div>
                {urlError === 'invalid_token' && 'Invalid login link'}
                {urlError === 'expired_or_invalid' && 'Login link expired or invalid'}
                {urlError === 'server_error' && 'Server error. Please try again.'}
              </div>
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


          {/* Success Message */}
          {message && (
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
              <div>{message}</div>
            </div>
          )}

          {/* Form - Email Step */}
          {!codeSent && (
            <form onSubmit={handleRequestCode}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '0.625rem'
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
                  disabled={loading}
                  placeholder="you@example.com"
                  style={{
                    width: '100%',
                    fontSize: '1.05rem',
                    padding: '1rem 1.125rem',
                    borderRadius: '8px',
                    border: '1.5px solid #475569',
                    color: 'white',
                    background: '#0f172a',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#475569'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  fontWeight: '600',
                  fontSize: '1.05rem',
                  padding: '1.125rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: loading ? '#475569' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
                  transition: 'opacity 0.2s',
                  marginTop: '0.5rem'
                }}
                onMouseEnter={(e) => !loading && (e.target.style.opacity = '0.9')}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>

              <p style={{
                marginTop: '1.5rem',
                textAlign: 'center',
                fontSize: '0.8rem',
                color: '#94a3b8'
              }}>
                We'll send a 6-digit code to your email
              </p>

              <div style={{
                marginTop: '1.5rem',
                textAlign: 'center',
                paddingTop: '1.5rem',
                borderTop: '1px solid #334155'
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#94a3b8',
                  marginBottom: '0.5rem'
                }}>
                  First time setting up?
                </p>
                <Link
                  href="/register"
                  style={{
                    color: '#3b82f6',
                    fontSize: '0.875rem',
                    textDecoration: 'underline',
                    fontWeight: '500'
                  }}
                >
                  Register as Primary Admin
                </Link>
              </div>
            </form>
          )}

          {/* Form - Verification Code Step */}
          {codeSent && (
            <form onSubmit={handleVerifyCode}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    color: '#cbd5e1',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}
                >
                  Signing in as: <strong style={{ color: '#e2e8f0' }}>{email}</strong>
                </label>
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline'
                  }}
                >
                  Change email
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  htmlFor="code"
                  style={{
                    display: 'block',
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    marginBottom: '0.625rem'
                  }}
                >
                  Verification Code
                </label>
                <input
                  id="code"
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
                    fontSize: '1.5rem',
                    padding: '1rem 1.125rem',
                    borderRadius: '8px',
                    border: '1.5px solid #475569',
                    color: 'white',
                    background: '#0f172a',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    letterSpacing: '0.5rem',
                    textAlign: 'center',
                    fontFamily: 'monospace'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#475569'}
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                style={{
                  width: '100%',
                  fontWeight: '600',
                  fontSize: '1.05rem',
                  padding: '1.125rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: (loading || code.length !== 6) ? '#475569' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  color: 'white',
                  cursor: (loading || code.length !== 6) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
                  transition: 'opacity 0.2s',
                  marginTop: '0.5rem'
                }}
                onMouseEnter={(e) => !loading && code.length === 6 && (e.target.style.opacity = '0.9')}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              <p style={{
                marginTop: '1.5rem',
                textAlign: 'center',
                fontSize: '0.8rem',
                color: '#94a3b8'
              }}>
                Enter the 6-digit code sent to your email. Code expires in 10 minutes.
              </p>

              <div style={{
                marginTop: '1.5rem',
                textAlign: 'center',
                paddingTop: '1.5rem',
                borderTop: '1px solid #334155'
              }}>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      fontSize: '0.875rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                      fontWeight: '500'
                    }}
                  >
                    Resend verification code
                  </button>
                ) : (
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    margin: 0
                  }}>
                    Resend code in {resendCountdown}s
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1d29 0%, #2d3748 100%)',
      }}>
        <div style={{ color: 'white', fontSize: '1.25rem' }}>Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
