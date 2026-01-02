'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organizationName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          organizationName: formData.organizationName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Registration successful - show success message
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
            Create your admin account
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

          {success ? (
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 1.5rem auto",
                backgroundColor: "rgba(20, 184, 166, 0.15)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>

              <h2 style={{
                fontSize: "1.5rem",
                fontWeight: "400",
                color: "#ffffff",
                marginBottom: "0.75rem",
                fontFamily: "Georgia, 'Times New Roman', serif"
              }}>
                Account created successfully
              </h2>

              <p style={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: "0.9375rem",
                margin: "0 0 2rem 0",
                lineHeight: "1.6",
                fontWeight: "300"
              }}>
                Check your email for a verification code to login.
              </p>

              <Link
                href="/login"
                style={{
                  display: "inline-block",
                  padding: "0.875rem 2rem",
                  backgroundColor: "#14b8a6",
                  color: "#ffffff",
                  borderRadius: "8px",
                  fontSize: "0.9375rem",
                  fontWeight: "500",
                  textDecoration: "none",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#0d9488"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#14b8a6"}
              >
                Continue to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Info Banner */}
              <div style={{
                padding: "1rem 1.25rem",
                backgroundColor: "rgba(20, 184, 166, 0.1)",
                border: "1px solid rgba(20, 184, 166, 0.2)",
                borderRadius: "8px",
                marginBottom: "2rem"
              }}>
                <p style={{
                  color: "#14b8a6",
                  fontSize: "0.875rem",
                  margin: 0,
                  lineHeight: "1.6",
                  fontWeight: "300"
                }}>
                  Passwordless authentication • We'll send you a verification code via email
                </p>
              </div>

              {/* Form Fields */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "400",
                  color: "rgba(255, 255, 255, 0.8)",
                  marginBottom: "0.5rem"
                }}>
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
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
                  fontSize: "0.875rem",
                  fontWeight: "400",
                  color: "rgba(255, 255, 255, 0.8)",
                  marginBottom: "0.5rem"
                }}>
                  Organization Name
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  required
                  placeholder="e.g., ABC University"
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
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
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

              {/* Submit Button */}
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
                {loading ? 'Creating account...' : 'Create Admin Account'}
              </button>

              {/* Login Link */}
              <div style={{ textAlign: "center" }}>
                <Link
                  href="/login"
                  style={{
                    color: "#14b8a6",
                    fontSize: "0.9375rem",
                    textDecoration: "none",
                    fontWeight: "300"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.textDecoration = "underline"}
                  onMouseOut={(e) => e.currentTarget.style.textDecoration = "none"}
                >
                  Already have an account? Login
                </Link>
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
