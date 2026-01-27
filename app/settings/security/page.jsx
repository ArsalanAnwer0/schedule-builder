'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SecuritySettings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2FA Setup State
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [setupStep, setSetupStep] = useState(1); // 1: QR Code, 2: Verify, 3: Backup Codes
  const [verificationCode, setVerificationCode] = useState('');
  const [setupError, setSetupError] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);

  // Disable 2FA State
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [disableError, setDisableError] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
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

  const handleEnable2FA = async () => {
    setSetupLoading(true);
    setSetupError('');

    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        setSetupError(data.error || 'Failed to initialize 2FA setup');
        setSetupLoading(false);
        return;
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setShowSetup2FA(true);
      setSetupStep(1);
      setSetupLoading(false);

    } catch (err) {
      setSetupError('Something went wrong. Please try again.');
      setSetupLoading(false);
    }
  };

  const handleVerifySetup = async (e) => {
    e.preventDefault();
    setSetupLoading(true);
    setSetupError('');

    try {
      const res = await fetch('/api/auth/2fa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSetupError(data.error || 'Failed to verify code');
        setSetupLoading(false);
        return;
      }

      setSetupStep(3);
      setSetupLoading(false);
      setVerificationCode('');

    } catch (err) {
      setSetupError('Something went wrong. Please try again.');
      setSetupLoading(false);
    }
  };

  const handleFinishSetup = () => {
    setShowSetup2FA(false);
    setSetupStep(1);
    setQrCode('');
    setSecret('');
    setBackupCodes([]);
    // Refresh user data
    window.location.reload();
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setDisableLoading(true);
    setDisableError('');

    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: disableCode,
          isBackupCode: useBackupCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDisableError(data.error || 'Failed to disable 2FA');
        setDisableLoading(false);
        return;
      }

      setShowDisable2FA(false);
      setDisableCode('');
      setUseBackupCode(false);
      setDisableLoading(false);
      // Refresh user data
      window.location.reload();

    } catch (err) {
      setDisableError('Something went wrong. Please try again.');
      setDisableLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const text = `Schedule Builder - 2FA Backup Codes\n\nIMPORTANT: Save these codes in a secure location.\nEach code can only be used once.\n\n${backupCodes.join('\n')}\n\nGenerated: ${new Date().toLocaleString()}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule-builder-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5"
      }}>
        <p style={{ color: "rgba(0, 0, 0, 0.5)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      padding: "2rem"
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto"
      }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <Link
            href="/dashboard"
            style={{
              color: "#14b8a6",
              textDecoration: "none",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem"
            }}
          >
            ← Back to Dashboard
          </Link>
          <h1 style={{
            fontSize: "2rem",
            fontWeight: "600",
            color: "rgba(0, 0, 0, 0.87)",
            marginBottom: "0.5rem"
          }}>
            Security Settings
          </h1>
          <p style={{
            color: "rgba(0, 0, 0, 0.5)",
            fontSize: "0.9375rem"
          }}>
            Manage your account security and two-factor authentication
          </p>
        </div>

        {/* 2FA Section */}
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          borderRadius: "12px",
          padding: "2rem"
        }}>
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "1.5rem"
          }}>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: "1.25rem",
                fontWeight: "500",
                color: "rgba(0, 0, 0, 0.87)",
                marginBottom: "0.5rem"
              }}>
                Two-Factor Authentication (2FA)
              </h2>
              <p style={{
                color: "rgba(0, 0, 0, 0.5)",
                fontSize: "0.875rem",
                lineHeight: "1.5"
              }}>
                Add an extra layer of security to your account by requiring a code from your authenticator app when signing in.
              </p>
            </div>
            <div style={{
              padding: "0.5rem 1rem",
              backgroundColor: user?.twoFactorEnabled ? "rgba(34, 197, 94, 0.1)" : "rgba(156, 163, 175, 0.1)",
              border: `1px solid ${user?.twoFactorEnabled ? "rgba(34, 197, 94, 0.3)" : "rgba(156, 163, 175, 0.3)"}`,
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: user?.twoFactorEnabled ? "#22c55e" : "#9ca3af",
              whiteSpace: "nowrap"
            }}>
              {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>

          {user?.twoFactorEnabled ? (
            <button
              onClick={() => setShowDisable2FA(true)}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "transparent",
                color: "#dc2626",
                border: "1px solid rgba(220, 38, 38, 0.4)",
                borderRadius: "8px",
                fontSize: "0.9375rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.08)";
                e.currentTarget.style.borderColor = "#dc2626";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "rgba(220, 38, 38, 0.4)";
              }}
            >
              Disable 2FA
            </button>
          ) : (
            <button
              onClick={handleEnable2FA}
              disabled={setupLoading}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "transparent",
                color: setupLoading ? "rgba(0, 0, 0, 0.3)" : "#14b8a6",
                border: "1px solid",
                borderColor: setupLoading ? "rgba(0, 0, 0, 0.1)" : "rgba(20, 184, 166, 0.4)",
                borderRadius: "8px",
                fontSize: "0.9375rem",
                fontWeight: "500",
                cursor: setupLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                if (!setupLoading) {
                  e.currentTarget.style.backgroundColor = "rgba(20, 184, 166, 0.08)";
                  e.currentTarget.style.borderColor = "#14b8a6";
                }
              }}
              onMouseOut={(e) => {
                if (!setupLoading) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = "rgba(20, 184, 166, 0.4)";
                }
              }}
            >
              {setupLoading ? 'Setting up...' : 'Enable 2FA'}
            </button>
          )}

          {setupError && (
            <div style={{
              marginTop: "1rem",
              padding: "0.75rem 1rem",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderLeft: "4px solid #dc2626",
              borderRadius: "6px"
            }}>
              <p style={{ color: "#dc2626", margin: 0, fontSize: "0.875rem" }}>{setupError}</p>
            </div>
          )}
        </div>

        {/* 2FA Setup Modal */}
        {showSetup2FA && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
          }} onClick={() => {
            if (setupStep === 3) {
              setShowSetup2FA(false);
              setSetupStep(1);
            }
          }}>
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              border: "1px solid rgba(0, 0, 0, 0.1)"
            }} onClick={(e) => e.stopPropagation()}>
              {/* Step 1: Scan QR Code */}
              {setupStep === 1 && (
                <div style={{ padding: "2rem" }}>
                  <h3 style={{
                    fontSize: "1.5rem",
                    fontWeight: "500",
                    color: "rgba(0, 0, 0, 0.87)",
                    marginBottom: "1.5rem"
                  }}>
                    Set Up Two-Factor Authentication
                  </h3>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <p style={{
                      color: "rgba(0, 0, 0, 0.6)",
                      fontSize: "0.875rem",
                      marginBottom: "1rem",
                      lineHeight: "1.5"
                    }}>
                      1. Download Microsoft Authenticator or any TOTP authenticator app
                    </p>
                    <p style={{
                      color: "rgba(0, 0, 0, 0.6)",
                      fontSize: "0.875rem",
                      marginBottom: "1rem",
                      lineHeight: "1.5"
                    }}>
                      2. Scan this QR code with your authenticator app:
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: "#ffffff",
                    padding: "1rem",
                    borderRadius: "8px",
                    textAlign: "center",
                    marginBottom: "1.5rem"
                  }}>
                    <img src={qrCode} alt="2FA QR Code" style={{ maxWidth: "100%" }} />
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <p style={{
                      color: "rgba(0, 0, 0, 0.5)",
                      fontSize: "0.875rem",
                      marginBottom: "0.5rem"
                    }}>
                      Or enter this code manually:
                    </p>
                    <div style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "6px",
                      padding: "0.75rem",
                      fontFamily: "'Courier New', monospace",
                      fontSize: "0.875rem",
                      color: "#14b8a6",
                      letterSpacing: "0.1em",
                      textAlign: "center"
                    }}>
                      {secret}
                    </div>
                  </div>

                  <button
                    onClick={() => setSetupStep(2)}
                    style={{
                      width: "100%",
                      padding: "0.875rem",
                      backgroundColor: "transparent",
                      color: "#14b8a6",
                      border: "1px solid rgba(20, 184, 166, 0.4)",
                      borderRadius: "8px",
                      fontSize: "0.9375rem",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(20, 184, 166, 0.08)";
                      e.currentTarget.style.borderColor = "#14b8a6";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "rgba(20, 184, 166, 0.4)";
                    }}
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Step 2: Verify Code */}
              {setupStep === 2 && (
                <div style={{ padding: "2rem" }}>
                  <h3 style={{
                    fontSize: "1.5rem",
                    fontWeight: "500",
                    color: "rgba(0, 0, 0, 0.87)",
                    marginBottom: "1.5rem"
                  }}>
                    Verify Your Authenticator
                  </h3>

                  <p style={{
                    color: "rgba(0, 0, 0, 0.6)",
                    fontSize: "0.875rem",
                    marginBottom: "1.5rem",
                    lineHeight: "1.5"
                  }}>
                    Enter the 6-digit code from your authenticator app to verify the setup:
                  </p>

                  {setupError && (
                    <div style={{
                      marginBottom: "1rem",
                      padding: "0.75rem 1rem",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      borderLeft: "4px solid #dc2626",
                      borderRadius: "6px"
                    }}>
                      <p style={{ color: "#dc2626", margin: 0, fontSize: "0.875rem" }}>{setupError}</p>
                    </div>
                  )}

                  <form onSubmit={handleVerifySetup}>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      placeholder="000000"
                      maxLength={6}
                      style={{
                        width: "100%",
                        padding: "0.875rem",
                        backgroundColor: "#ffffff",
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        borderRadius: "8px",
                        fontSize: "1.5rem",
                        color: "rgba(0, 0, 0, 0.87)",
                        outline: "none",
                        textAlign: "center",
                        letterSpacing: "0.5em",
                        fontFamily: "'Courier New', monospace",
                        marginBottom: "1.5rem"
                      }}
                    />

                    <div style={{ display: "flex", gap: "1rem" }}>
                      <button
                        type="button"
                        onClick={() => setSetupStep(1)}
                        style={{
                          flex: 1,
                          padding: "0.875rem",
                          backgroundColor: "#ffffff",
                          color: "rgba(0, 0, 0, 0.6)",
                          border: "1px solid rgba(0, 0, 0, 0.1)",
                          borderRadius: "8px",
                          fontSize: "0.9375rem",
                          fontWeight: "500",
                          cursor: "pointer"
                        }}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={setupLoading || verificationCode.length !== 6}
                        style={{
                          flex: 1,
                          padding: "0.875rem",
                          backgroundColor: "transparent",
                          color: (setupLoading || verificationCode.length !== 6) ? "rgba(0, 0, 0, 0.3)" : "#14b8a6",
                          border: "1px solid",
                          borderColor: (setupLoading || verificationCode.length !== 6) ? "rgba(0, 0, 0, 0.1)" : "rgba(20, 184, 166, 0.4)",
                          borderRadius: "8px",
                          fontSize: "0.9375rem",
                          fontWeight: "500",
                          cursor: (setupLoading || verificationCode.length !== 6) ? "not-allowed" : "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        {setupLoading ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Step 3: Backup Codes */}
              {setupStep === 3 && (
                <div style={{ padding: "2rem" }}>
                  <div style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: "#14b8a6",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    fontSize: "2rem"
                  }}>
                    ✓
                  </div>

                  <h3 style={{
                    fontSize: "1.5rem",
                    fontWeight: "500",
                    color: "rgba(0, 0, 0, 0.87)",
                    marginBottom: "0.5rem",
                    textAlign: "center"
                  }}>
                    2FA Enabled Successfully!
                  </h3>

                  <p style={{
                    color: "rgba(0, 0, 0, 0.5)",
                    fontSize: "0.875rem",
                    marginBottom: "1.5rem",
                    textAlign: "center"
                  }}>
                    Save these backup codes in a secure location
                  </p>

                  <div style={{
                    backgroundColor: "rgba(251, 191, 36, 0.1)",
                    border: "1px solid rgba(251, 191, 36, 0.3)",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginBottom: "1rem"
                  }}>
                    <p style={{
                      color: "#fbbf24",
                      fontSize: "0.875rem",
                      margin: 0,
                      lineHeight: "1.5"
                    }}>
                      <strong>Important:</strong> Each backup code can only be used once. Store them safely - you'll need them if you lose access to your authenticator app.
                    </p>
                  </div>

                  <div style={{
                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginBottom: "1.5rem"
                  }}>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.5rem",
                      fontFamily: "'Courier New', monospace",
                      fontSize: "0.875rem",
                      color: "#14b8a6"
                    }}>
                      {backupCodes.map((code, index) => (
                        <div key={index} style={{ padding: "0.25rem" }}>
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                      onClick={downloadBackupCodes}
                      style={{
                        flex: 1,
                        padding: "0.875rem",
                        backgroundColor: "transparent",
                        color: "rgba(0, 0, 0, 0.6)",
                        border: "1px solid rgba(0, 0, 0, 0.2)",
                        borderRadius: "8px",
                        fontSize: "0.9375rem",
                        fontWeight: "500",
                        cursor: "pointer"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.03)"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      Download Codes
                    </button>
                    <button
                      onClick={handleFinishSetup}
                      style={{
                        flex: 1,
                        padding: "0.875rem",
                        backgroundColor: "transparent",
                        color: "#14b8a6",
                        border: "1px solid rgba(20, 184, 166, 0.4)",
                        borderRadius: "8px",
                        fontSize: "0.9375rem",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(20, 184, 166, 0.08)";
                        e.currentTarget.style.borderColor = "#14b8a6";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.borderColor = "rgba(20, 184, 166, 0.4)";
                      }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disable 2FA Modal */}
        {showDisable2FA && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
          }} onClick={() => setShowDisable2FA(false)}>
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              maxWidth: "450px",
              width: "100%",
              padding: "2rem",
              border: "1px solid rgba(0, 0, 0, 0.1)"
            }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{
                fontSize: "1.5rem",
                fontWeight: "500",
                color: "rgba(0, 0, 0, 0.87)",
                marginBottom: "1.5rem"
              }}>
                Disable Two-Factor Authentication
              </h3>

              <p style={{
                color: "rgba(0, 0, 0, 0.6)",
                fontSize: "0.875rem",
                marginBottom: "1.5rem",
                lineHeight: "1.5"
              }}>
                Enter a code from your authenticator app or use a backup code to disable 2FA:
              </p>

              {disableError && (
                <div style={{
                  marginBottom: "1rem",
                  padding: "0.75rem 1rem",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderLeft: "4px solid #dc2626",
                  borderRadius: "6px"
                }}>
                  <p style={{ color: "#dc2626", margin: 0, fontSize: "0.875rem" }}>{disableError}</p>
                </div>
              )}

              <form onSubmit={handleDisable2FA}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "rgba(0, 0, 0, 0.6)",
                    fontSize: "0.875rem",
                    marginBottom: "0.75rem",
                    cursor: "pointer"
                  }}>
                    <input
                      type="checkbox"
                      checked={useBackupCode}
                      onChange={(e) => setUseBackupCode(e.target.checked)}
                      style={{ cursor: "pointer" }}
                    />
                    Using a backup code
                  </label>
                </div>

                <input
                  type="text"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  required
                  placeholder={useBackupCode ? "Enter backup code" : "000000"}
                  maxLength={useBackupCode ? 8 : 6}
                  style={{
                    width: "100%",
                    padding: "0.875rem",
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                    fontSize: useBackupCode ? "1rem" : "1.5rem",
                    color: "rgba(0, 0, 0, 0.87)",
                    outline: "none",
                    textAlign: "center",
                    letterSpacing: useBackupCode ? "0.2em" : "0.5em",
                    fontFamily: "'Courier New', monospace",
                    marginBottom: "1.5rem"
                  }}
                />

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisable2FA(false);
                      setDisableCode('');
                      setUseBackupCode(false);
                      setDisableError('');
                    }}
                    style={{
                      flex: 1,
                      padding: "0.875rem",
                      backgroundColor: "#ffffff",
                      color: "rgba(0, 0, 0, 0.6)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "8px",
                      fontSize: "0.9375rem",
                      fontWeight: "500",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={disableLoading}
                    style={{
                      flex: 1,
                      padding: "0.875rem",
                      backgroundColor: "transparent",
                      color: disableLoading ? "rgba(0, 0, 0, 0.3)" : "#dc2626",
                      border: "1px solid",
                      borderColor: disableLoading ? "rgba(0, 0, 0, 0.1)" : "rgba(220, 38, 38, 0.4)",
                      borderRadius: "8px",
                      fontSize: "0.9375rem",
                      fontWeight: "500",
                      cursor: disableLoading ? "not-allowed" : "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {disableLoading ? 'Disabling...' : 'Disable 2FA'}
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
