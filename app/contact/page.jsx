'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Contact() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    // Simulate form submission (you can integrate with an email service later)
    setTimeout(() => {
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      {/* Navigation */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
        padding: "1rem 2rem"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <Link href="/" style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            <span style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "rgba(0, 0, 0, 0.87)",
              fontFamily: "Georgia, serif"
            }}>Schedule Builder</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "4rem 2rem"
      }}>
        <Link
          href="/"
          style={{
            color: "#14b8a6",
            textDecoration: "none",
            fontSize: "0.9375rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "2.5rem",
            fontWeight: "400"
          }}
          onMouseOver={(e) => e.currentTarget.style.color = "#0d9488"}
          onMouseOut={(e) => e.currentTarget.style.color = "#14b8a6"}
        >
          ← Back to Home
        </Link>
        <div style={{ marginBottom: "4rem" }}>
          <h1 style={{
            fontFamily: "Georgia, serif",
            fontSize: "2.5rem",
            fontWeight: "400",
            color: "rgba(0, 0, 0, 0.87)",
            marginBottom: "1rem",
            letterSpacing: "-0.02em"
          }}>
            Get in Touch
          </h1>
          <p style={{
            fontSize: "1.125rem",
            color: "rgba(0, 0, 0, 0.65)",
            fontWeight: "300",
            lineHeight: "1.6"
          }}>
            Have a question, suggestion, or feedback? We'd love to hear from you.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          marginBottom: "4rem"
        }}>
          {/* GitHub */}
          <div style={{
            padding: "2rem",
            backgroundColor: "#f9fafb",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: "12px"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              backgroundColor: "rgba(20, 184, 166, 0.1)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#14b8a6">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <h3 style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "rgba(0, 0, 0, 0.87)",
              marginBottom: "0.5rem"
            }}>
              GitHub
            </h3>
            <p style={{
              fontSize: "0.9375rem",
              color: "rgba(0, 0, 0, 0.65)",
              marginBottom: "1rem",
              lineHeight: "1.6",
              fontWeight: "400"
            }}>
              View the source code, report issues, or contribute to the project.
            </p>
            <a
              href="https://github.com/ArsalanAnwer0/schedule-builder"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#14b8a6",
                fontSize: "0.9375rem",
                textDecoration: "none",
                fontWeight: "500"
              }}
            >
              Visit Repository →
            </a>
          </div>

          {/* Developer */}
          <div style={{
            padding: "2rem",
            backgroundColor: "#f9fafb",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: "12px"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              backgroundColor: "rgba(20, 184, 166, 0.1)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3 style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "rgba(0, 0, 0, 0.87)",
              marginBottom: "0.5rem"
            }}>
              Developer
            </h3>
            <p style={{
              fontSize: "0.9375rem",
              color: "rgba(0, 0, 0, 0.65)",
              marginBottom: "1rem",
              lineHeight: "1.6",
              fontWeight: "400"
            }}>
              Connect with the developer for collaboration or questions.
            </p>
            <a
              href="https://arsalan-portfolio-umber.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#14b8a6",
                fontSize: "0.9375rem",
                textDecoration: "none",
                fontWeight: "500"
              }}
            >
              Visit Portfolio →
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{
          backgroundColor: "#f9fafb",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          borderRadius: "12px",
          padding: "3rem"
        }}>
          <h2 style={{
            fontFamily: "Georgia, serif",
            fontSize: "1.75rem",
            fontWeight: "400",
            color: "rgba(0, 0, 0, 0.87)",
            marginBottom: "2rem"
          }}>
            Send us a message
          </h2>

          {success && (
            <div style={{
              padding: "1rem 1.25rem",
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "8px",
              marginBottom: "2rem"
            }}>
              <p style={{
                color: "#22c55e",
                fontSize: "0.9375rem",
                margin: 0
              }}>
                Thank you for your message! We'll get back to you soon.
              </p>
            </div>
          )}

          {error && (
            <div style={{
              padding: "1rem 1.25rem",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              marginBottom: "2rem"
            }}>
              <p style={{
                color: "#ef4444",
                fontSize: "0.9375rem",
                margin: 0
              }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
              marginBottom: "1.5rem"
            }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "rgba(0, 0, 0, 0.65)",
                  marginBottom: "0.5rem"
                }}>
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem",
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(0, 0, 0, 0.2)",
                    borderRadius: "8px",
                    color: "rgba(0, 0, 0, 0.87)",
                    fontSize: "0.9375rem",
                    outline: "none",
                    fontWeight: "400",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#14b8a6";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(20, 184, 166, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.2)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "rgba(0, 0, 0, 0.65)",
                  marginBottom: "0.5rem"
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem",
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(0, 0, 0, 0.2)",
                    borderRadius: "8px",
                    color: "rgba(0, 0, 0, 0.87)",
                    fontSize: "0.9375rem",
                    outline: "none",
                    fontWeight: "400",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#14b8a6";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(20, 184, 166, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.2)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "rgba(0, 0, 0, 0.65)",
                marginBottom: "0.5rem"
              }}>
                Subject *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                  color: "rgba(0, 0, 0, 0.87)",
                  fontSize: "0.9375rem",
                  outline: "none",
                  fontWeight: "400",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#14b8a6";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(20, 184, 166, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.2)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "rgba(0, 0, 0, 0.65)",
                marginBottom: "0.5rem"
              }}>
                Message *
              </label>
              <textarea
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                  color: "rgba(0, 0, 0, 0.87)",
                  fontSize: "0.9375rem",
                  resize: "vertical",
                  outline: "none",
                  fontFamily: "inherit",
                  fontWeight: "400",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#14b8a6";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(20, 184, 166, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.2)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "0.875rem 1.75rem",
                backgroundColor: submitting ? "rgba(20, 184, 166, 0.5)" : "#14b8a6",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: submitting ? "not-allowed" : "pointer",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                if (!submitting) e.currentTarget.style.backgroundColor = "#0d9488";
              }}
              onMouseOut={(e) => {
                if (!submitting) e.currentTarget.style.backgroundColor = "#14b8a6";
              }}
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
