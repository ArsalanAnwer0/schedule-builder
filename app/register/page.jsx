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
      backgroundColor: "#0d1117",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "450px",
        backgroundColor: "#161b22",
        border: "1px solid #30363d",
        borderRadius: "8px",
        padding: "2rem"
      }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h1 style={{
            fontSize: "1.875rem",
            fontWeight: "600",
            color: "#ffffff",
            marginBottom: "0.5rem"
          }}>
            Schedule Builder
          </h1>
          <p style={{
            fontSize: "1rem",
            color: "#8b949e",
            marginBottom: "0.75rem"
          }}>
            Register as Primary Admin
          </p>
          <div style={{
            padding: "0.875rem 1rem",
            backgroundColor: "#0d1f17",
            border: "1px solid #1e4d2b",
            borderRadius: "6px"
          }}>
            <p style={{ color: "#10b981", fontSize: "0.8125rem", margin: 0, lineHeight: "1.5" }}>
              <strong style={{ color: "#34d399" }}>First time here?</strong> Register to create your organization account and start managing student worker schedules.
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#2d1517",
            border: "1px solid #5c2d30",
            borderRadius: "6px",
            marginBottom: "1.5rem"
          }}>
            <p style={{ color: "#ff6b6b", fontSize: "0.875rem", margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {success && (
          <div style={{
            padding: "1rem 1.5rem",
            backgroundColor: "#0d1f17",
            border: "1px solid #1e4d2b",
            borderRadius: "6px",
            marginBottom: "1.5rem"
          }}>
            <p style={{ color: "#10b981", fontSize: "0.875rem", margin: 0, marginBottom: "0.5rem", fontWeight: "600" }}>
              Registration successful!
            </p>
            <p style={{ color: "#10b981", fontSize: "0.875rem", margin: 0, marginBottom: "1rem" }}>
              Your admin account has been created. You can now login using the verification code sent to your email.
            </p>
            <Link
              href="/login"
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                backgroundColor: "#0972d3",
                color: "#ffffff",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "500",
                textDecoration: "none"
              }}
            >
              Go to Login
            </Link>
          </div>
        )}

        {!success && <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#c9d1d9",
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
                padding: "0.625rem 0.875rem",
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: "6px",
                fontSize: "0.875rem",
                color: "#ffffff",
                outline: "none"
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "#58a6ff"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#30363d"}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "500",
              color: "#c9d1d9",
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
                padding: "0.625rem 0.875rem",
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: "6px",
                fontSize: "0.875rem",
                color: "#ffffff",
                outline: "none"
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "#58a6ff"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#30363d"}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
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
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.625rem 0.875rem",
                backgroundColor: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: "6px",
                fontSize: "0.875rem",
                color: "#ffffff",
                outline: "none"
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = "#58a6ff"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#30363d"}
            />
          </div>

          <div style={{
            padding: "1rem",
            backgroundColor: "#0d1f17",
            border: "1px solid #1e4d2b",
            borderRadius: "6px",
            marginBottom: "1.5rem"
          }}>
            <p style={{ color: "#10b981", fontSize: "0.875rem", margin: 0, marginBottom: "0.75rem", lineHeight: "1.6" }}>
              <strong style={{ color: "#34d399" }}>Passwordless login</strong>
            </p>
            <ul style={{
              fontSize: "0.8125rem",
              color: "#6ee7b7",
              margin: 0,
              paddingLeft: "1.25rem",
              lineHeight: "1.6"
            }}>
              <li>No password required - we use email verification codes</li>
              <li>After registration, you'll receive a verification code to login</li>
              <li>Each time you sign in, we'll send a new code to your email</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem 1.5rem",
              backgroundColor: loading ? "#414d5c" : "#0972d3",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "1rem"
            }}
          >
            {loading ? 'Creating Account...' : 'Register as Primary Admin'}
          </button>

          <div style={{ textAlign: "center" }}>
            <Link
              href="/login"
              style={{
                color: "#58a6ff",
                fontSize: "0.875rem",
                textDecoration: "none"
              }}
            >
              Already have an account? Login
            </Link>
          </div>
        </form>}
      </div>
    </div>
  );
}
