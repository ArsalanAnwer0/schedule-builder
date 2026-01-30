'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function RegisterForm() {
  const searchParams = useSearchParams();
  const step = searchParams.get('step');
  const dataParam = searchParams.get('data');
  const urlError = searchParams.get('error');

  const [googleData, setGoogleData] = useState(null);
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Parse Google data if returning from OAuth
  useEffect(() => {
    if (step === 'org' && dataParam) {
      try {
        const parsed = JSON.parse(Buffer.from(dataParam, 'base64url').toString());
        if (parsed.email && parsed.name && parsed.googleId) {
          setGoogleData(parsed);
        } else {
          setError('Invalid registration data. Please try again.');
        }
      } catch {
        setError('Invalid registration data. Please try again.');
      }
    }
  }, [step, dataParam]);

  const getErrorMessage = (err) => {
    switch (err) {
      case 'oauth_denied':
        return 'Google sign-up was cancelled. Please try again.';
      case 'oauth_error':
        return 'Something went wrong with Google sign-up. Please try again.';
      case 'already_exists':
        return 'An account with this email already exists. Please sign in instead.';
      case 'gmail_only':
        return 'Only Gmail accounts (@gmail.com) are supported. Please use a Gmail account.';
      case 'no_email':
        return 'Could not retrieve your email from Google. Please try again.';
      default:
        return err ? 'An error occurred. Please try again.' : null;
    }
  };

  const errorFromUrl = getErrorMessage(urlError);

  const handleGoogleSignUp = () => {
    window.location.href = '/api/auth/google?mode=register';
  };

  const handleSubmitOrg = async (e) => {
    e.preventDefault();
    if (!googleData) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/google/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleData.email,
          name: googleData.name,
          googleId: googleData.googleId,
          organizationName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Registration successful - redirect to admin dashboard
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // Step 2: Organization name form (after Google auth)
  const isOrgStep = step === 'org' && googleData;

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
        padding: '2rem 3rem',
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
        padding: '2rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      className="right-panel">

        {/* Login link top right */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '2rem'
        }}>
          <Link
            href="/login"
            style={{
              color: 'rgba(0, 0, 0, 0.87)',
              fontSize: '0.9375rem',
              textDecoration: 'none',
              fontWeight: '400'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#14b8a6'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.87)'}
          >
            Login
          </Link>
        </div>

        {/* Centered content */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ maxWidth: '420px', width: '100%' }}>

            {!isOrgStep ? (
              <>
                {/* Step 1: Google Sign Up */}
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: '600',
                    color: 'rgba(0, 0, 0, 0.87)',
                    margin: 0
                  }}>
                    Create an account
                  </h2>
                </div>

                {/* Error Message */}
                {(errorFromUrl || error) && (
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
                      fontWeight: '400',
                      textAlign: 'center'
                    }}>
                      {errorFromUrl || error}
                    </p>
                  </div>
                )}

                {/* Continue with Google Button */}
                <button
                  onClick={handleGoogleSignUp}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1.5rem',
                    backgroundColor: '#ffffff',
                    color: 'rgba(0, 0, 0, 0.87)',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s',
                    marginBottom: '1.5rem'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)';
                  }}
                >
                  {/* Google Icon */}
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Terms of Service */}
                <p style={{
                  fontSize: '0.8125rem',
                  color: 'rgba(0, 0, 0, 0.45)',
                  textAlign: 'center',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  By clicking continue, you agree to our{' '}
                  <a
                    href="https://schedule-builder-docs.vercel.app/legal/terms.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'rgba(0, 0, 0, 0.6)',
                      textDecoration: 'underline'
                    }}
                  >
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a
                    href="https://schedule-builder-docs.vercel.app/legal/privacy.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'rgba(0, 0, 0, 0.6)',
                      textDecoration: 'underline'
                    }}
                  >
                    Privacy Policy
                  </a>.
                </p>
              </>
            ) : (
              <>
                {/* Step 2: Organization Name */}
                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: '600',
                    color: 'rgba(0, 0, 0, 0.87)',
                    margin: 0,
                    marginBottom: '0.5rem'
                  }}>
                    Set up your organization
                  </h2>
                  <p style={{
                    fontSize: '15px',
                    color: 'rgba(0, 0, 0, 0.5)',
                    fontWeight: '300',
                    margin: 0
                  }}>
                    One last step to complete your admin account
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
                      color: '#dc2626',
                      fontSize: '0.9375rem',
                      margin: 0,
                      fontWeight: '400',
                      textAlign: 'center'
                    }}>
                      {error}
                    </p>
                  </div>
                )}

                {/* Google Account Info */}
                <div style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: 'rgba(20, 184, 166, 0.05)',
                  border: '1px solid rgba(20, 184, 166, 0.2)',
                  borderRadius: '8px',
                  marginBottom: '1.5rem'
                }}>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.6)',
                    margin: 0,
                    lineHeight: '1.6'
                  }}>
                    Signing up as <strong style={{ color: 'rgba(0, 0, 0, 0.87)' }}>{googleData.name}</strong>
                    <br />
                    <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{googleData.email}</span>
                  </p>
                </div>

                <form onSubmit={handleSubmitOrg}>
                  <div style={{ marginBottom: '2rem' }}>
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
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      required
                      disabled={loading}
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

                  <button
                    type="submit"
                    disabled={loading || !organizationName.trim()}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1.5rem',
                      backgroundColor: (loading || !organizationName.trim()) ? 'rgba(20, 184, 166, 0.5)' : '#14b8a6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: (loading || !organizationName.trim()) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      if (!loading && organizationName.trim()) e.currentTarget.style.backgroundColor = '#0d9488';
                    }}
                    onMouseOut={(e) => {
                      if (!loading && organizationName.trim()) e.currentTarget.style.backgroundColor = '#14b8a6';
                    }}
                  >
                    {loading ? 'Creating account...' : 'Complete Registration'}
                  </button>
                </form>
              </>
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
    </div>
  );
}

export default function RegisterPage() {
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
      <RegisterForm />
    </Suspense>
  );
}
