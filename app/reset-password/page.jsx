'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
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
            Create New Password
          </h2>
          <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)", margin: 0 }}>
            Enter your new password below
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
                ✓ Password reset successful! Redirecting to login...
              </p>
            </div>
            <Link href="/login" style={{
              display: "block",
              textAlign: "center",
              color: "#14b8a6",
              textDecoration: "none",
              fontSize: "0.875rem"
            }}>
              Click here if not redirected
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
                New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
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
              <small style={{
                display: "block",
                fontSize: "0.75rem",
                color: "#8b949e",
                marginTop: "0.25rem"
              }}>
                At least 6 characters
              </small>
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
                onChange={handleChange}
                required
                minLength={6}
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
              disabled={loading || !token}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: (loading || !token) ? "#0d9488" : "#14b8a6",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: (loading || !token) ? "not-allowed" : "pointer",
                transition: "background-color 0.15s ease",
                opacity: (loading || !token) ? 0.7 : 1
              }}
              onMouseOver={(e) => !(loading || !token) && (e.target.style.backgroundColor = "#0d9488")}
              onMouseOut={(e) => !(loading || !token) && (e.target.style.backgroundColor = "#14b8a6")}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
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
