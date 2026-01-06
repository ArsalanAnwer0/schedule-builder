'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  const typeParam = searchParams.get('type') || 'primary'; // 'primary' or 'secondary'

  const [formData, setFormData] = useState({
    email: emailParam || '',
    code: '',
    type: typeParam,
  });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Auto-fill email from URL parameter
  useEffect(() => {
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
    }
  }, [emailParam]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          type: formData.type,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send verification code');
        setSending(false);
        return;
      }

      setCountdown(60); // 60 second cooldown before resend
      setSending(false);
      setError('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setSending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to verify email');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
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
          maxWidth: "500px",
          width: "100%",
          textAlign: "center",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}>
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
          <h2 style={{
            color: "#ffffff",
            fontSize: "1.5rem",
            marginBottom: "1rem",
            fontWeight: "500"
          }}>
            Email Verified Successfully!
          </h2>
          <p style={{
            color: "#9ca3af",
            marginBottom: "1.5rem"
          }}>
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

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
        maxWidth: "500px",
        width: "100%",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{
            color: "#ffffff",
            fontSize: "1.875rem",
            fontWeight: "600",
            marginBottom: "0.5rem"
          }}>
            Verify Your Email
          </h1>
          <p style={{
            color: "#9ca3af",
            fontSize: "0.9375rem"
          }}>
            Enter the verification code sent to your email
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
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              color: "#d1d5db",
              fontSize: "0.875rem",
              fontWeight: "500",
              marginBottom: "0.5rem"
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={loading || sending}
              placeholder="your.email@example.com"
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

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              color: "#d1d5db",
              fontSize: "0.875rem",
              fontWeight: "500",
              marginBottom: "0.5rem"
            }}>
              Verification Code
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              disabled={loading || sending}
              placeholder="Enter 6-digit code"
              maxLength={6}
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
                transition: "all 0.2s",
                letterSpacing: "0.2em",
                textAlign: "center",
                fontFamily: "'Courier New', monospace"
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
            disabled={loading || sending}
            style={{
              width: "100%",
              padding: "0.875rem 1.5rem",
              backgroundColor: (loading || sending) ? "rgba(255, 255, 255, 0.1)" : "#14b8a6",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.9375rem",
              fontWeight: "500",
              cursor: (loading || sending) ? "not-allowed" : "pointer",
              marginBottom: "1rem",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              if (!loading && !sending) e.currentTarget.style.backgroundColor = "#0d9488";
            }}
            onMouseOut={(e) => {
              if (!loading && !sending) e.currentTarget.style.backgroundColor = "#14b8a6";
            }}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <div style={{
            textAlign: "center",
            marginBottom: "1.5rem"
          }}>
            <button
              type="button"
              onClick={handleSendCode}
              disabled={sending || countdown > 0}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: (sending || countdown > 0) ? "#6b7280" : "#14b8a6",
                fontSize: "0.875rem",
                cursor: (sending || countdown > 0) ? "not-allowed" : "pointer",
                textDecoration: "underline",
                fontWeight: "400"
              }}
            >
              {sending ? 'Sending code...' : countdown > 0 ? `Resend code in ${countdown}s` : "Don't have a code? Send one"}
            </button>
          </div>

          <div style={{
            textAlign: "center",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <Link
              href="/dashboard"
              style={{
                color: "#9ca3af",
                fontSize: "0.875rem",
                textDecoration: "none",
                transition: "color 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.color = "#14b8a6"}
              onMouseOut={(e) => e.currentTarget.style.color = "#9ca3af"}
            >
              Skip for now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
