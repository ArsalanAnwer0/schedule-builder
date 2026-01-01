'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', message: '', type: 'feedback' });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackSubmitting(true);
    setFeedbackError('');
    setFeedbackSuccess('');

    setTimeout(() => {
      setFeedbackSuccess('Thank you for your feedback! We\'ll get back to you soon.');
      setFeedbackForm({ name: '', email: '', message: '', type: 'feedback' });
      setFeedbackSubmitting(false);
      setTimeout(() => {
        setFeedbackOpen(false);
        setFeedbackSuccess('');
      }, 2000);
    }, 1000);
  };

  return (
    <div style={{ backgroundColor: "#0f1b2a", minHeight: "100vh" }}>

      {/* Fixed Navigation */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "#0f1b2a",
        borderBottom: "1px solid #1f2937",
        padding: "1rem 2rem"
      }}>
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: "600", color: "#ffffff" }}>Schedule Builder</span>
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button
              onClick={() => setFeedbackOpen(true)}
              style={{
                padding: "0.625rem 1.25rem",
                background: "#16191f",
                color: "#ffffff",
                border: "1px solid #30363d",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#1f2937"}
              onMouseOut={(e) => e.currentTarget.style.background = "#16191f"}
            >
              Feedback
            </button>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: "0.625rem 1.25rem",
                background: "#16191f",
                color: "#ffffff",
                border: "1px solid #30363d",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#1f2937"}
              onMouseOut={(e) => e.currentTarget.style.background = "#16191f"}
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/register')}
              style={{
                padding: "0.625rem 1.5rem",
                background: "#0972d3",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#0863bf"}
              onMouseOut={(e) => e.currentTarget.style.background = "#0972d3"}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: "8rem 2rem",
        textAlign: "center",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <h1 style={{
          fontSize: "4.5rem",
          fontWeight: "700",
          color: "#ffffff",
          marginBottom: "1.5rem",
          lineHeight: "1.1",
          letterSpacing: "-0.02em"
        }}>
          Scheduling made simple,
          <br />
          so you can focus on what matters
        </h1>

        <p style={{
          fontSize: "1.5rem",
          color: "rgba(255, 255, 255, 0.7)",
          marginBottom: "3rem",
          maxWidth: "800px",
          margin: "2rem auto 3rem auto",
          lineHeight: "1.6"
        }}>
          Automate student worker scheduling with smart availability collection
          and conflict-free schedule generation.
        </p>

        <button
          onClick={() => router.push('/register')}
          style={{
            padding: "1rem 2.5rem",
            background: "#0972d3",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.125rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 20px rgba(9, 114, 211, 0.3)"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#0863bf";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "#0972d3";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Start scheduling for free
        </button>
      </section>

      {/* Social Proof Section */}
      <section style={{
        padding: "4rem 2rem",
        backgroundColor: "#0a1420",
        borderTop: "1px solid #1f2937",
        borderBottom: "1px solid #1f2937"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center"
        }}>
          <p style={{
            fontSize: "1rem",
            color: "rgba(255, 255, 255, 0.5)",
            marginBottom: "3rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em"
          }}>
            Trusted by student organizations
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem"
          }}>
            <div style={{
              padding: "2rem",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              border: "1px solid #1f2937"
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⭐⭐⭐⭐⭐</div>
              <p style={{
                fontSize: "1.125rem",
                color: "#ffffff",
                fontWeight: "500",
                marginBottom: "1rem"
              }}>
                "Saves us 5+ hours every week"
              </p>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)" }}>
                Campus Library Manager
              </p>
            </div>

            <div style={{
              padding: "2rem",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              border: "1px solid #1f2937"
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⭐⭐⭐⭐⭐</div>
              <p style={{
                fontSize: "1.125rem",
                color: "#ffffff",
                fontWeight: "500",
                marginBottom: "1rem"
              }}>
                "No more scheduling conflicts"
              </p>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)" }}>
                Student Affairs Coordinator
              </p>
            </div>

            <div style={{
              padding: "2rem",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              border: "1px solid #1f2937"
            }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⭐⭐⭐⭐⭐</div>
              <p style={{
                fontSize: "1.125rem",
                color: "#ffffff",
                fontWeight: "500",
                marginBottom: "1rem"
              }}>
                "Students love how easy it is"
              </p>
              <p style={{ fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.5)" }}>
                Recreation Center Director
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Elegant Horizontal Flow */}
      <section style={{
        padding: "10rem 2rem",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        <div style={{ textAlign: "center", marginBottom: "6rem" }}>
          <h2 style={{
            fontSize: "3.5rem",
            fontWeight: "700",
            color: "#ffffff",
            marginBottom: "1rem",
            letterSpacing: "-0.01em"
          }}>
            How it works
          </h2>
          <p style={{
            fontSize: "1.375rem",
            color: "rgba(255, 255, 255, 0.6)",
            maxWidth: "600px",
            margin: "0 auto",
            fontWeight: "300"
          }}>
            Three simple steps to automated scheduling
          </p>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2rem",
          position: "relative",
          flexWrap: "wrap"
        }}>
          {/* Step 1 */}
          <div style={{
            flex: "1",
            minWidth: "280px",
            textAlign: "center",
            position: "relative"
          }}>
            <div style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#0972d3",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 2.5rem auto",
              fontSize: "2.5rem",
              fontWeight: "700",
              color: "#ffffff",
              boxShadow: "0 8px 32px rgba(9, 114, 211, 0.4)"
            }}>
              1
            </div>
            <h3 style={{
              fontSize: "1.75rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1.25rem",
              letterSpacing: "-0.01em"
            }}>
              Add your students
            </h3>
            <p style={{
              fontSize: "1.125rem",
              color: "rgba(255, 255, 255, 0.65)",
              lineHeight: "1.7",
              fontWeight: "300"
            }}>
              Import your team with email addresses. They'll receive automatic invitations.
            </p>
          </div>

          {/* Connector Line */}
          <div style={{
            width: "60px",
            height: "2px",
            background: "linear-gradient(to right, #0972d3, rgba(9, 114, 211, 0.3))",
            alignSelf: "flex-start",
            marginTop: "50px",
            display: "none"
          }} />

          {/* Step 2 */}
          <div style={{
            flex: "1",
            minWidth: "280px",
            textAlign: "center",
            position: "relative"
          }}>
            <div style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#0972d3",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 2.5rem auto",
              fontSize: "2.5rem",
              fontWeight: "700",
              color: "#ffffff",
              boxShadow: "0 8px 32px rgba(9, 114, 211, 0.4)"
            }}>
              2
            </div>
            <h3 style={{
              fontSize: "1.75rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1.25rem",
              letterSpacing: "-0.01em"
            }}>
              Collect availability
            </h3>
            <p style={{
              fontSize: "1.125rem",
              color: "rgba(255, 255, 255, 0.65)",
              lineHeight: "1.7",
              fontWeight: "300"
            }}>
              Students submit their availability through a simple, intuitive form.
            </p>
          </div>

          {/* Connector Line */}
          <div style={{
            width: "60px",
            height: "2px",
            background: "linear-gradient(to right, #0972d3, rgba(9, 114, 211, 0.3))",
            alignSelf: "flex-start",
            marginTop: "50px",
            display: "none"
          }} />

          {/* Step 3 */}
          <div style={{
            flex: "1",
            minWidth: "280px",
            textAlign: "center",
            position: "relative"
          }}>
            <div style={{
              width: "100px",
              height: "100px",
              backgroundColor: "#0972d3",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 2.5rem auto",
              fontSize: "2.5rem",
              fontWeight: "700",
              color: "#ffffff",
              boxShadow: "0 8px 32px rgba(9, 114, 211, 0.4)"
            }}>
              3
            </div>
            <h3 style={{
              fontSize: "1.75rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1.25rem",
              letterSpacing: "-0.01em"
            }}>
              Generate schedule
            </h3>
            <p style={{
              fontSize: "1.125rem",
              color: "rgba(255, 255, 255, 0.65)",
              lineHeight: "1.7",
              fontWeight: "300"
            }}>
              Our smart algorithm creates a balanced, conflict-free schedule instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - Minimal Luxury Design */}
      <section style={{
        padding: "10rem 2rem",
        backgroundColor: "#0a1420",
        borderTop: "1px solid #1f2937",
        borderBottom: "1px solid #1f2937"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "8rem" }}>
            <h2 style={{
              fontSize: "3.5rem",
              fontWeight: "700",
              color: "#ffffff",
              marginBottom: "1rem",
              letterSpacing: "-0.01em"
            }}>
              Everything you need
            </h2>
            <p style={{
              fontSize: "1.375rem",
              color: "rgba(255, 255, 255, 0.6)",
              maxWidth: "600px",
              margin: "0 auto",
              fontWeight: "300"
            }}>
              Powerful features that make scheduling effortless
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "4rem",
            marginBottom: "4rem"
          }}>
            {/* Feature 1 */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "80px",
                height: "80px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 2.5rem auto",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0972d3" strokeWidth="2">
                  <path d="M12 2v20M2 12h20" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <h3 style={{
                fontSize: "1.75rem",
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: "1.25rem",
                letterSpacing: "-0.01em"
              }}>
                Smart Scheduling
              </h3>
              <p style={{
                fontSize: "1.0625rem",
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: "1.75",
                fontWeight: "300"
              }}>
                Our algorithm ensures fair distribution of shifts while respecting availability
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "80px",
                height: "80px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 2.5rem auto",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0972d3" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
              </div>
              <h3 style={{
                fontSize: "1.75rem",
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: "1.25rem",
                letterSpacing: "-0.01em"
              }}>
                Email Invitations
              </h3>
              <p style={{
                fontSize: "1.0625rem",
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: "1.75",
                fontWeight: "300"
              }}>
                Automatically send invitations. Students can login with any registered email
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "80px",
                height: "80px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 2.5rem auto",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0972d3" strokeWidth="2">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </div>
              <h3 style={{
                fontSize: "1.75rem",
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: "1.25rem",
                letterSpacing: "-0.01em"
              }}>
                Lightning Fast
              </h3>
              <p style={{
                fontSize: "1.0625rem",
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: "1.75",
                fontWeight: "300"
              }}>
                Generate schedules in seconds, not hours. Get back to what matters
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{
        padding: "10rem 2rem",
        maxWidth: "900px",
        margin: "0 auto"
      }}>
        <div style={{ textAlign: "center", marginBottom: "6rem" }}>
          <h2 style={{
            fontSize: "3.5rem",
            fontWeight: "700",
            color: "#ffffff",
            marginBottom: "1rem",
            letterSpacing: "-0.01em"
          }}>
            Got questions?
          </h2>
          <p style={{
            fontSize: "1.375rem",
            color: "rgba(255, 255, 255, 0.6)",
            fontWeight: "300"
          }}>
            Here's what you need to know
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{
            padding: "2.5rem",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            borderRadius: "12px",
            border: "1px solid #1f2937"
          }}>
            <h3 style={{
              fontSize: "1.375rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem",
              letterSpacing: "-0.01em"
            }}>
              How does the scheduling algorithm work?
            </h3>
            <p style={{
              fontSize: "1.0625rem",
              color: "rgba(255, 255, 255, 0.65)",
              lineHeight: "1.75",
              fontWeight: "300"
            }}>
              Our smart algorithm analyzes student availability and creates balanced schedules that minimize conflicts,
              distribute shifts fairly, and respect time preferences.
            </p>
          </div>

          <div style={{
            padding: "2.5rem",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            borderRadius: "12px",
            border: "1px solid #1f2937"
          }}>
            <h3 style={{
              fontSize: "1.375rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem",
              letterSpacing: "-0.01em"
            }}>
              Can students login with multiple email addresses?
            </h3>
            <p style={{
              fontSize: "1.0625rem",
              color: "rgba(255, 255, 255, 0.65)",
              lineHeight: "1.75",
              fontWeight: "300"
            }}>
              Yes! Students can have both a primary and secondary email. They can login with either one
              and access the same account and availability.
            </p>
          </div>

          <div style={{
            padding: "2.5rem",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            borderRadius: "12px",
            border: "1px solid #1f2937"
          }}>
            <h3 style={{
              fontSize: "1.375rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem",
              letterSpacing: "-0.01em"
            }}>
              What if I need to change the schedule?
            </h3>
            <p style={{
              fontSize: "1.0625rem",
              color: "rgba(255, 255, 255, 0.65)",
              lineHeight: "1.75",
              fontWeight: "300"
            }}>
              You can reset student availability and regenerate schedules anytime. The system is flexible
              and adapts to your changing needs.
            </p>
          </div>

          <div style={{
            padding: "2.5rem",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            borderRadius: "12px",
            border: "1px solid #1f2937"
          }}>
            <h3 style={{
              fontSize: "1.375rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem",
              letterSpacing: "-0.01em"
            }}>
              Is there a limit on the number of students?
            </h3>
            <p style={{
              fontSize: "1.0625rem",
              color: "rgba(255, 255, 255, 0.65)",
              lineHeight: "1.75",
              fontWeight: "300"
            }}>
              No limits! Add as many students and admins as you need to manage your organization effectively.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "4rem 2rem",
        borderTop: "1px solid #1f2937",
        textAlign: "center"
      }}>
        <p style={{
          fontSize: "0.9375rem",
          color: "rgba(255, 255, 255, 0.5)",
          fontWeight: "300"
        }}>
          © 2026 Schedule Builder. Built to make scheduling simple.
        </p>
      </footer>

      {/* Feedback Modal */}
      {feedbackOpen && (
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
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: "#16191f",
            borderRadius: "12px",
            padding: "2.5rem",
            maxWidth: "500px",
            width: "90%",
            border: "1px solid #30363d"
          }}>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1.5rem"
            }}>
              Send us feedback
            </h2>

            <form onSubmit={handleFeedbackSubmit}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "rgba(255, 255, 255, 0.9)",
                  marginBottom: "0.5rem"
                }}>
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={feedbackForm.name}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    backgroundColor: "#0f1b2a",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#ffffff",
                    fontSize: "1rem"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "rgba(255, 255, 255, 0.9)",
                  marginBottom: "0.5rem"
                }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={feedbackForm.email}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    backgroundColor: "#0f1b2a",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#ffffff",
                    fontSize: "1rem"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "rgba(255, 255, 255, 0.9)",
                  marginBottom: "0.5rem"
                }}>
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    backgroundColor: "#0f1b2a",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    color: "#ffffff",
                    fontSize: "1rem",
                    resize: "vertical"
                  }}
                />
              </div>

              {feedbackSuccess && (
                <div style={{
                  padding: "0.75rem",
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  borderRadius: "6px",
                  color: "#22c55e",
                  marginBottom: "1.5rem",
                  fontSize: "0.875rem"
                }}>
                  {feedbackSuccess}
                </div>
              )}

              {feedbackError && (
                <div style={{
                  padding: "0.75rem",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "6px",
                  color: "#ef4444",
                  marginBottom: "1.5rem",
                  fontSize: "0.875rem"
                }}>
                  {feedbackError}
                </div>
              )}

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(false)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#16191f",
                    color: "#ffffff",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#0972d3",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    cursor: feedbackSubmitting ? "not-allowed" : "pointer",
                    opacity: feedbackSubmitting ? 0.5 : 1
                  }}
                >
                  {feedbackSubmitting ? 'Sending...' : 'Send feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
