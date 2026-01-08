'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          newPassword: formData.newPassword
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit password reset request');
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
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0a0f1a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "450px",
        backgroundColor: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        padding: "3rem",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
              <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#ffffff", margin: 0 }}>
                Schedule Builder
              </h1>
            </div>
          </Link>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "500", color: "#ffffff", margin: "0 0 0.5rem 0" }}>
            Request Password Reset
          </h2>
          <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)", margin: 0 }}>
            Enter your email and new password. An admin will approve your request.
          </p>
        </div>

        {success ? (
          <div>
            <div style={{
              padding: "1rem",
              backgroundColor: "#064e3b",
              border: "1px solid #10b981",
              borderRadius: "8px",
              marginBottom: "1.5rem"
            }}>
              <p style={{ color: "#10b981", margin: 0, fontSize: "0.875rem" }}>
                ✓ Password reset request submitted! An admin will review and approve your request.
              </p>
            </div>
            <Link href="/login" style={{
              display: "block",
              textAlign: "center",
              color: "#14b8a6",
              textDecoration: "none",
              fontSize: "0.875rem"
            }}>
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                padding: "1rem",
                backgroundColor: "#2d1517",
                border: "1px solid #dc2626",
                borderRadius: "8px",
                marginBottom: "1.5rem"
              }}>
                <p style={{ color: "#ff6b6b", margin: 0, fontSize: "0.875rem" }}>{error}</p>
              </div>
            )}

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#c9d1d9",
                marginBottom: "0.5rem"
              }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="your@email.com"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  color: "#ffffff",
                  outline: "none",
                  transition: "border-color 0.15s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#14b8a6"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#c9d1d9",
                marginBottom: "0.5rem"
              }}>
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
                placeholder="Enter new password"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  color: "#ffffff",
                  outline: "none",
                  transition: "border-color 0.15s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#14b8a6"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#c9d1d9",
                marginBottom: "0.5rem"
              }}>
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                placeholder="Confirm new password"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  color: "#ffffff",
                  outline: "none",
                  transition: "border-color 0.15s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#14b8a6"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: loading ? "#0d9488" : "#14b8a6",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.15s ease",
                opacity: loading ? 0.7 : 1
              }}
              onMouseOver={(e) => !loading && (e.target.style.backgroundColor = "#0d9488")}
              onMouseOut={(e) => !loading && (e.target.style.backgroundColor = "#14b8a6")}
            >
              {loading ? 'Submitting...' : 'Submit Reset Request'}
            </button>

            <div style={{
              marginTop: "1.5rem",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "rgba(255, 255, 255, 0.5)"
            }}>
              Remember your password?{' '}
              <Link href="/login" style={{ color: "#14b8a6", textDecoration: "none" }}>
                Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
