'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function Verify2FAForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get('userId');

  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userIdParam) {
      router.push('/login');
    }
  }, [userIdParam, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/2fa/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userIdParam,
          code: code,
          isBackupCode: useBackupCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to verify code');
        setLoading(false);
        return;
      }

      // Login successful - redirect
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }

    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#0a0a0a",
      padding: "1rem"
    }}>
      <div style={{
        backgroundColor: "#1a1a1a",
        padding: "2.5rem",
        borderRadius: "12px",
        maxWidth: "450px",
        width: "100%",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "64px",
            height: "64px",
            backgroundColor: "rgba(20, 184, 166, 0.1)",
            border: "2px solid #14b8a6",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            fontSize: "1.5rem"
          }}>
            🔒
          </div>
          <h1 style={{
            color: "#ffffff",
            fontSize: "1.875rem",
            fontWeight: "600",
            marginBottom: "0.5rem"
          }}>
            Two-Factor Authentication
          </h1>
          <p style={{
            color: "#9ca3af",
            fontSize: "0.9375rem"
          }}>
            Enter the code from your authenticator app
          </p>
        </div>

        {error && (
          <div style={{
            padding: "0.875rem 1rem",
            backgroundColor: "#2d1517",
            border: "1px solid #5c2d30",
            borderLeft: "4px solid #dc2626",
            borderRadius: "6px",
            marginBottom: "1.5rem"
          }}>
            <p style={{ color: "#ff6b6b", margin: 0, fontSize: "0.875rem" }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#d1d5db",
              fontSize: "0.875rem",
              marginBottom: "1rem",
              cursor: "pointer"
            }}>
              <input
                type="checkbox"
                checked={useBackupCode}
                onChange={(e) => {
                  setUseBackupCode(e.target.checked);
                  setCode('');
                }}
                style={{ cursor: "pointer" }}
              />
              Using a backup code
            </label>
          </div>

          <input
            type="text"
            value={code}
            onChange={(e) => {
              if (useBackupCode) {
                setCode(e.target.value.toUpperCase().slice(0, 8));
              } else {
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              }
            }}
            required
            placeholder={useBackupCode ? "ABCD1234" : "000000"}
            maxLength={useBackupCode ? 8 : 6}
            autoFocus
            style={{
              width: "100%",
              padding: "1rem",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              fontSize: useBackupCode ? "1.25rem" : "2rem",
              color: "#ffffff",
              outline: "none",
              textAlign: "center",
              letterSpacing: useBackupCode ? "0.3em" : "0.5em",
              fontFamily: "'Courier New', monospace",
              marginBottom: "1.5rem",
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

          <button
            type="submit"
            disabled={loading || (useBackupCode ? code.length !== 8 : code.length !== 6)}
            style={{
              width: "100%",
              padding: "0.875rem 1.5rem",
              backgroundColor: (loading || (useBackupCode ? code.length !== 8 : code.length !== 6)) ? "rgba(255, 255, 255, 0.1)" : "#14b8a6",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.9375rem",
              fontWeight: "500",
              cursor: (loading || (useBackupCode ? code.length !== 8 : code.length !== 6)) ? "not-allowed" : "pointer",
              marginBottom: "1rem",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              if (!loading && (useBackupCode ? code.length === 8 : code.length === 6)) {
                e.currentTarget.style.backgroundColor = "#0d9488";
              }
            }}
            onMouseOut={(e) => {
              if (!loading && (useBackupCode ? code.length === 8 : code.length === 6)) {
                e.currentTarget.style.backgroundColor = "#14b8a6";
              }
            }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>

          <div style={{
            textAlign: "center",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <Link
              href="/login"
              style={{
                color: "#9ca3af",
                fontSize: "0.875rem",
                textDecoration: "none",
                transition: "color 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.color = "#14b8a6"}
              onMouseOut={(e) => e.currentTarget.style.color = "#9ca3af"}
            >
              ← Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0a"
      }}>
        <p style={{ color: "#9ca3af" }}>Loading...</p>
      </div>
    }>
      <Verify2FAForm />
    </Suspense>
  );
}
