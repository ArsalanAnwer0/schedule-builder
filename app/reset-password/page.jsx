'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { usePasswordValidation } from '@/lib/hooks/usePasswordValidation';
import PasswordRequirementsDisplay from '@/components/auth/PasswordRequirementsDisplay';

function ResetPasswordForm() {
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

  // Use password validation hook
  const { validation: passwordValidation, isValid: isPasswordValid } = usePasswordValidation(formData.password);

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
      backgroundColor: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "450px",
        backgroundColor: "#ffffff",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        borderRadius: "12px",
        padding: "3rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
              <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "rgba(0, 0, 0, 0.87)", margin: 0 }}>
                Schedule Builder
              </h1>
            </div>
          </Link>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", margin: "0 0 0.5rem 0" }}>
            Create New Password
          </h2>
          <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.6)", margin: 0 }}>
            Enter your new password below
          </p>
        </div>

        {success ? (
          <div>
            <div style={{
              padding: "1rem 1.25rem",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "8px",
              marginBottom: "1.5rem"
            }}>
              <p style={{ color: "#10b981", margin: 0, fontSize: "0.9375rem", fontWeight: "400" }}>
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
                padding: "1rem 1.25rem",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                marginBottom: "1.5rem"
              }}>
                <p style={{ color: "#dc2626", margin: 0, fontSize: "0.9375rem", fontWeight: "400" }}>{error}</p>
              </div>
            )}

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "rgba(0, 0, 0, 0.65)",
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
                minLength={12}
                placeholder="12+ characters required"
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                  fontSize: "0.9375rem",
                  color: "rgba(0, 0, 0, 0.87)",
                  outline: "none",
                  fontWeight: "400",
                  transition: "all 0.2s",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#14b8a6";
                  e.target.style.boxShadow = "0 0 0 3px rgba(20, 184, 166, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0, 0, 0, 0.2)";
                  e.target.style.boxShadow = "none";
                }}
              />

              {/* Password Requirements Display */}
              <PasswordRequirementsDisplay
                password={formData.password}
                validation={passwordValidation}
                showStrengthBar={true}
              />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "rgba(0, 0, 0, 0.65)",
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
                minLength={12}
                placeholder="Re-enter your password"
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                  fontSize: "0.9375rem",
                  color: "rgba(0, 0, 0, 0.87)",
                  outline: "none",
                  fontWeight: "400",
                  transition: "all 0.2s",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#14b8a6";
                  e.target.style.boxShadow = "0 0 0 3px rgba(20, 184, 166, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0, 0, 0, 0.2)";
                  e.target.style.boxShadow = "none";
                }}
              />

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div style={{
                  marginTop: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  backgroundColor: formData.password === formData.confirmPassword
                    ? "rgba(16, 185, 129, 0.1)"
                    : "rgba(220, 38, 38, 0.1)",
                  border: `1px solid ${formData.password === formData.confirmPassword
                    ? "rgba(16, 185, 129, 0.3)"
                    : "rgba(220, 38, 38, 0.3)"}`,
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s ease"
                }}>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    color: formData.password === formData.confirmPassword
                      ? "#10b981"
                      : "#dc2626"
                  }}>
                    {formData.password === formData.confirmPassword
                      ? "✓ Passwords match"
                      : "✗ Passwords do not match"}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !token || !isPasswordValid || formData.password !== formData.confirmPassword}
              style={{
                width: "100%",
                padding: "0.875rem 1.5rem",
                backgroundColor: (loading || !token || !isPasswordValid || formData.password !== formData.confirmPassword)
                  ? "rgba(20, 184, 166, 0.5)"
                  : "#14b8a6",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: (loading || !token || !isPasswordValid || formData.password !== formData.confirmPassword)
                  ? "not-allowed"
                  : "pointer",
                marginBottom: "1.5rem",
                transition: "all 0.2s",
                opacity: (loading || !token || !isPasswordValid || formData.password !== formData.confirmPassword) ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!loading && token && isPasswordValid && formData.password === formData.confirmPassword) {
                  e.target.style.backgroundColor = "#0d9488";
                }
              }}
              onMouseOut={(e) => {
                if (!loading && token && isPasswordValid && formData.password === formData.confirmPassword) {
                  e.target.style.backgroundColor = "#14b8a6";
                }
              }}
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

export default function ResetPasswordPage() {
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
      <ResetPasswordForm />
    </Suspense>
  );
}
