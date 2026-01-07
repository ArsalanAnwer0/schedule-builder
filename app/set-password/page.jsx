'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { validatePasswordStrength, getStrengthDisplay } from '../../lib/utils/passwordStrength';

export default function SetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Check password strength when password changes
  useEffect(() => {
    if (formData.password) {
      const strength = validatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password strength
    const strength = validatePasswordStrength(formData.password);
    if (!strength.isValid) {
      setError(strength.errors[0]);
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to set password');
        setLoading(false);
        return;
      }

      // Auto-login successful - redirect to email verification
      window.location.href = `/verify-email?email=${encodeURIComponent(formData.email)}&type=primary`;
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#ffffff", margin: 0 }}>
              Schedule Builder
            </h1>
          </div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "500", color: "#ffffff", margin: "0 0 0.5rem 0" }}>
            Create Your Password
          </h2>
          <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)", margin: 0 }}>
            For students only - Make sure your admin has registered you first
          </p>
        </div>

        {/* Info Banner */}
        <div style={{
          padding: "1rem 1.25rem",
          backgroundColor: "rgba(20, 184, 166, 0.1)",
          border: "1px solid rgba(20, 184, 166, 0.3)",
          borderRadius: "8px",
          marginBottom: "2rem"
        }}>
          <p style={{
            fontSize: "0.875rem",
            color: "#14b8a6",
            margin: 0,
            lineHeight: "1.5"
          }}>
            Your admin must add your email to the system before you can create a password. If you haven't been added yet, please contact your admin.
          </p>
        </div>

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
              fontSize: "0.875rem",
              color: "#ef4444",
              margin: 0
            }}>
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "rgba(255, 255, 255, 0.9)",
              marginBottom: "0.5rem"
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="student@university.edu"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                fontSize: "0.9375rem",
                color: "#ffffff",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#14b8a6"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "rgba(255, 255, 255, 0.9)",
              marginBottom: "0.5rem"
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
              placeholder="At least 8 characters with uppercase, number, and special character"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                fontSize: "0.9375rem",
                color: "#ffffff",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#14b8a6"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
            />

            {/* Password Strength Indicator */}
            {passwordStrength && formData.password && (
              <div style={{ marginTop: "0.75rem" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem"
                }}>
                  <span style={{
                    fontSize: "0.75rem",
                    color: "rgba(255, 255, 255, 0.6)"
                  }}>
                    Password Strength:
                  </span>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    color: getStrengthDisplay(passwordStrength.strength).color
                  }}>
                    {getStrengthDisplay(passwordStrength.strength).label}
                  </span>
                </div>

                {/* Strength Bar */}
                <div style={{
                  height: "4px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: "2px",
                  overflow: "hidden",
                  marginBottom: "0.75rem"
                }}>
                  <div style={{
                    height: "100%",
                    width: `${(passwordStrength.score / 6) * 100}%`,
                    backgroundColor: getStrengthDisplay(passwordStrength.strength).color,
                    transition: "all 0.3s ease"
                  }}></div>
                </div>

                {/* Requirement Checklist */}
                {passwordStrength.errors.length > 0 && (
                  <div style={{
                    padding: "0.75rem",
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                    borderRadius: "6px",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                  }}>
                    <ul style={{
                      margin: 0,
                      paddingLeft: "1.25rem",
                      fontSize: "0.75rem",
                      color: "rgba(255, 255, 255, 0.6)",
                      lineHeight: "1.6"
                    }}>
                      {passwordStrength.errors.map((err, idx) => (
                        <li key={idx} style={{ marginBottom: idx < passwordStrength.errors.length - 1 ? "0.25rem" : 0 }}>
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "2rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "rgba(255, 255, 255, 0.9)",
              marginBottom: "0.5rem"
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
              placeholder="Re-enter your password"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                fontSize: "0.9375rem",
                color: "#ffffff",
                outline: "none",
                transition: "all 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#14b8a6"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.875rem",
              backgroundColor: loading ? "#0d9488" : "#14b8a6",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.9375rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
              opacity: loading ? 0.7 : 1
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#0d9488";
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = "#14b8a6";
            }}
          >
            {loading ? 'Creating Password...' : 'Create Password & Login'}
          </button>
        </form>

        {/* Footer Links */}
        <div style={{
          marginTop: "2rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          textAlign: "center"
        }}>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(255, 255, 255, 0.5)",
            marginBottom: "1rem"
          }}>
            Already have a password?{' '}
            <button
              onClick={() => router.push('/login')}
              style={{
                background: "none",
                border: "none",
                color: "#14b8a6",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "0.875rem",
                padding: 0
              }}
            >
              Login here
            </button>
          </p>
          <p style={{
            fontSize: "0.875rem",
            color: "rgba(255, 255, 255, 0.5)",
            margin: 0
          }}>
            Are you an admin?{' '}
            <button
              onClick={() => router.push('/register')}
              style={{
                background: "none",
                border: "none",
                color: "#14b8a6",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "0.875rem",
                padding: 0
              }}
            >
              Create admin account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
