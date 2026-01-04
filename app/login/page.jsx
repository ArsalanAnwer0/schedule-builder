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
      minHeight: "100vh",
      backgroundColor: "#0a0f1a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "520px"
      }}>
        {/* Header */}
        <div style={{ marginBottom: "3rem", textAlign: "center" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <h1 style={{
              fontSize: "2rem",
              fontWeight: "400",
              color: "#ffffff",
              marginBottom: "0.75rem",
              fontFamily: "Georgia, 'Times New Roman', serif",
              letterSpacing: "-0.01em"
            }}>
              Schedule Builder
            </h1>
          </Link>
          <p style={{
            fontSize: "1rem",
            color: "rgba(255, 255, 255, 0.5)",
            fontWeight: "300"
          }}>
            {codeSent ? 'Enter verification code' : 'Sign in to your account'}
          </p>
        </div>

        {/* Main Card */}
        <div style={{
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          padding: "2.5rem",
          backdropFilter: "blur(10px)"
        }}>
          {/* URL Error */}
          {urlError && (
            <div style={{
              padding: "1rem 1.25rem",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              marginBottom: "1.5rem"
            }}>
              <p style={{
                color: "#fca5a5",
                fontSize: "0.9375rem",
                margin: 0,
                fontWeight: "300"
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
              padding: "1rem 1.25rem",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              marginBottom: "1.5rem"
            }}>
              <p style={{
                color: "#fca5a5",
                fontSize: "0.9375rem",
                margin: 0,
                fontWeight: "300"
              }}>
                {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div style={{
              padding: "1rem 1.25rem",
              backgroundColor: "rgba(20, 184, 166, 0.1)",
              border: "1px solid rgba(20, 184, 166, 0.3)",
              borderRadius: "8px",
              marginBottom: "1.5rem"
            }}>
              <p style={{
                color: "#14b8a6",
                fontSize: "0.9375rem",
                margin: 0,
                fontWeight: "300"
              }}>
                {message}
              </p>
            </div>
          )}

          {/* Password Login Step */}
          {!codeSent && usePasswordLogin && (
            <form onSubmit={handlePasswordLogin}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "400",
                  color: "rgba(255, 255, 255, 0.8)",
                  marginBottom: "0.5rem"
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
                    width: "100%",
                    padding: "0.875rem 1rem",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    fontSize: "0.9375rem",
                    color: "#ffffff",
                    outline: "none",
                    fontWeight: "300",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#14b8a6";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                  }}
                />
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "400",
                  color: "rgba(255, 255, 255, 0.8)",
                  marginBottom: "0.5rem"
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
                    width: "100%",
                    padding: "0.875rem 1rem",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    fontSize: "0.9375rem",
                    color: "#ffffff",
                    outline: "none",
                    fontWeight: "300",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#14b8a6";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.875rem 1.5rem",
                  backgroundColor: loading ? "rgba(255, 255, 255, 0.1)" : "#14b8a6",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.9375rem",
                  fontWeight: "500",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginBottom: "1.5rem",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = "#0d9488";
                }}
                onMouseOut={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = "#14b8a6";
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              {/* Alternative Login Option */}
              <div style={{
                textAlign: "center",
                marginBottom: "1.5rem"
              }}>
                <button
                  type="button"
                  onClick={() => setUsePasswordLogin(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#14b8a6",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "none",
                    fontWeight: "300"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
                >
                  Use verification code instead
                </button>
              </div>

              {/* Register/Set Password Links */}
              <div style={{
                textAlign: "center",
                paddingTop: "1.5rem",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                <p style={{
                  fontSize: "0.875rem",
                  color: "rgba(255, 255, 255, 0.5)",
                  marginBottom: "0.75rem",
                  fontWeight: "300"
                }}>
                  First time here?
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <Link
                    href="/set-password"
                    style={{
                      color: "#14b8a6",
                      fontSize: "0.9375rem",
                      textDecoration: "none",
                      fontWeight: "300"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
                    onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
                  >
                    Set your password (Students)
                  </Link>
                  <Link
                    href="/register"
                    style={{
                      color: "rgba(255, 255, 255, 0.5)",
                      fontSize: "0.875rem",
                      textDecoration: "none",
                      fontWeight: "300"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"}
                    onMouseOut={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)"}
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
              <div style={{ marginBottom: "2rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "400",
                  color: "rgba(255, 255, 255, 0.8)",
                  marginBottom: "0.5rem"
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
                    width: "100%",
                    padding: "0.875rem 1rem",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    fontSize: "0.9375rem",
                    color: "#ffffff",
                    outline: "none",
                    fontWeight: "300",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#14b8a6";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.875rem 1.5rem",
                  backgroundColor: loading ? "rgba(255, 255, 255, 0.1)" : "#14b8a6",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.9375rem",
                  fontWeight: "500",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginBottom: "1.5rem",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = "#0d9488";
                }}
                onMouseOut={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = "#14b8a6";
                }}
              >
                {loading ? 'Sending code...' : 'Send Verification Code'}
              </button>

              {/* Info */}
              <div style={{
                padding: "1rem 1.25rem",
                backgroundColor: "rgba(20, 184, 166, 0.05)",
                border: "1px solid rgba(20, 184, 166, 0.15)",
                borderRadius: "8px",
                marginBottom: "1rem"
              }}>
                <p style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "0.875rem",
                  margin: 0,
                  lineHeight: "1.6",
                  fontWeight: "300"
                }}>
                  We'll send a 6-digit code to your email. Code expires in 10 minutes.
                </p>
              </div>

              {/* School Email Warning */}
              <div style={{
                padding: "1rem 1.25rem",
                backgroundColor: "rgba(239, 68, 68, 0.05)",
                border: "1px solid rgba(239, 68, 68, 0.15)",
                borderRadius: "8px",
                marginBottom: "1.5rem"
              }}>
                <p style={{
                  color: "rgba(255, 152, 152, 0.8)",
                  fontSize: "0.875rem",
                  margin: 0,
                  lineHeight: "1.6",
                  fontWeight: "300"
                }}>
                  Note: Accounts with school/work email addresses may not receive email notifications due to spam filtering. Please use password login instead.
                </p>
              </div>

              {/* Alternative Login Option */}
              <div style={{
                textAlign: "center",
                marginBottom: "1.5rem"
              }}>
                <button
                  type="button"
                  onClick={() => setUsePasswordLogin(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#14b8a6",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "none",
                    fontWeight: "300"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
                >
                  Use password instead
                </button>
              </div>

              {/* Register/Set Password Links */}
              <div style={{
                textAlign: "center",
                paddingTop: "1.5rem",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                <p style={{
                  fontSize: "0.875rem",
                  color: "rgba(255, 255, 255, 0.5)",
                  marginBottom: "0.75rem",
                  fontWeight: "300"
                }}>
                  First time here?
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <Link
                    href="/set-password"
                    style={{
                      color: "#14b8a6",
                      fontSize: "0.9375rem",
                      textDecoration: "none",
                      fontWeight: "300"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
                    onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
                  >
                    Set your password (Students)
                  </Link>
                  <Link
                    href="/register"
                    style={{
                      color: "rgba(255, 255, 255, 0.5)",
                      fontSize: "0.875rem",
                      textDecoration: "none",
                      fontWeight: "300"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"}
                    onMouseOut={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)"}
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
              <div style={{ marginBottom: "1.5rem" }}>
                <p style={{
                  fontSize: "0.875rem",
                  color: "rgba(255, 255, 255, 0.6)",
                  margin: "0 0 0.5rem 0",
                  fontWeight: "300"
                }}>
                  Signing in as: <strong style={{ color: "#14b8a6", fontWeight: "400" }}>{email}</strong>
                </p>
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#14b8a6",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "none",
                    fontWeight: "300"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
                >
                  Change email
                </button>
              </div>

              {/* Code Input */}
              <div style={{ marginBottom: "2rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "400",
                  color: "rgba(255, 255, 255, 0.8)",
                  marginBottom: "0.5rem"
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
                    width: "100%",
                    padding: "0.875rem 1rem",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    fontSize: "1.5rem",
                    color: "#ffffff",
                    outline: "none",
                    fontWeight: "300",
                    transition: "all 0.2s",
                    letterSpacing: "0.5rem",
                    textAlign: "center",
                    fontFamily: "monospace"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#14b8a6";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                style={{
                  width: "100%",
                  padding: "0.875rem 1.5rem",
                  backgroundColor: (loading || code.length !== 6) ? "rgba(255, 255, 255, 0.1)" : "#14b8a6",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.9375rem",
                  fontWeight: "500",
                  cursor: (loading || code.length !== 6) ? "not-allowed" : "pointer",
                  marginBottom: "1.5rem",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => {
                  if (!loading && code.length === 6) e.currentTarget.style.backgroundColor = "#0d9488";
                }}
                onMouseOut={(e) => {
                  if (!loading && code.length === 6) e.currentTarget.style.backgroundColor = "#14b8a6";
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              {/* Info */}
              <div style={{
                padding: "1rem 1.25rem",
                backgroundColor: "rgba(20, 184, 166, 0.05)",
                border: "1px solid rgba(20, 184, 166, 0.15)",
                borderRadius: "8px",
                marginBottom: "1.5rem"
              }}>
                <p style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "0.875rem",
                  margin: "0 0 0.5rem 0",
                  lineHeight: "1.6",
                  fontWeight: "300"
                }}>
                  Check your email for the 6-digit code. Code expires in 10 minutes.
                </p>
              </div>

              {/* Resend */}
              <div style={{
                textAlign: "center",
                paddingTop: "1.5rem",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={loading}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#14b8a6",
                      fontSize: "0.9375rem",
                      cursor: loading ? "not-allowed" : "pointer",
                      padding: 0,
                      textDecoration: "none",
                      fontWeight: "300"
                    }}
                    onMouseOver={(e) => {
                      if (!loading) e.currentTarget.style.textDecoration = "underline";
                    }}
                    onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
                  >
                    Resend verification code
                  </button>
                ) : (
                  <p style={{
                    fontSize: "0.875rem",
                    color: "rgba(255, 255, 255, 0.4)",
                    margin: 0,
                    fontWeight: "300"
                  }}>
                    Resend code in {resendCountdown}s
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <Link
            href="/"
            style={{
              color: "rgba(255, 255, 255, 0.4)",
              fontSize: "0.875rem",
              textDecoration: "none",
              fontWeight: "300"
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"}
            onMouseOut={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)"}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        backgroundColor: "#0a0f1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          color: "rgba(255, 255, 255, 0.6)",
          fontSize: "1rem",
          fontWeight: "300"
        }}>
          Loading...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
