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
  const [expandedFaq, setExpandedFaq] = useState(null);

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

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{ backgroundColor: "#0a0f1a", minHeight: "100vh" }}>

      {/* Fixed Navigation */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "#0a0f1a",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "1rem 2rem"
      }}>
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            <span style={{ fontSize: "1.25rem", fontWeight: "600", color: "#ffffff" }}>Schedule Builder</span>
          </div>

          <div style={{ display: "flex", gap: "2.5rem", alignItems: "center" }}>
            <button
              onClick={() => scrollToSection('how-it-works')}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.9375rem",
                cursor: "pointer",
                padding: "0.5rem 0",
                transition: "color 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"}
              onMouseOut={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"}
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.9375rem",
                cursor: "pointer",
                padding: "0.5rem 0",
                transition: "color 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"}
              onMouseOut={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.9375rem",
                cursor: "pointer",
                padding: "0.5rem 0",
                transition: "color 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.color = "#ffffff"}
              onMouseOut={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"}
            >
              FAQ
            </button>
            <button
              onClick={() => router.push('/register')}
              style={{
                padding: "0.625rem 1.5rem",
                background: "#14b8a6",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.9375rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#0d9488"}
              onMouseOut={(e) => e.currentTarget.style.background = "#14b8a6"}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: "8rem 2rem 4rem 2rem",
        textAlign: "center",
        maxWidth: "1200px",
        margin: "0 auto",
        position: "relative"
      }}>
        {/* Beta Badge */}
        <div style={{
          display: "inline-block",
          padding: "0.5rem 1rem",
          backgroundColor: "rgba(20, 184, 166, 0.1)",
          border: "1px solid rgba(20, 184, 166, 0.3)",
          borderRadius: "20px",
          color: "#14b8a6",
          fontSize: "0.8125rem",
          fontWeight: "500",
          marginBottom: "2rem",
          letterSpacing: "0.05em"
        }}>
          Now in Beta
        </div>

        <h1 style={{
          fontSize: "5rem",
          fontWeight: "400",
          color: "#ffffff",
          marginBottom: "1.5rem",
          lineHeight: "1.1",
          letterSpacing: "-0.02em",
          fontFamily: "Georgia, 'Times New Roman', serif"
        }}>
          Scheduling office hours is broken.
          <br />
          We fixed it.
        </h1>

        <p style={{
          fontSize: "1.25rem",
          color: "rgba(255, 255, 255, 0.6)",
          marginBottom: "3rem",
          maxWidth: "750px",
          margin: "2rem auto 3rem auto",
          lineHeight: "1.7",
          fontWeight: "300"
        }}>
          Collect availability, create schedules, and manage changes automatically without the chaos.
        </p>

        {/* Schedule Interface Preview */}
        <div style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          padding: "4rem",
          background: "linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(6, 78, 59, 0.1) 100%)",
          borderRadius: "16px",
          border: "1px solid rgba(20, 184, 166, 0.2)",
          position: "relative",
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 1.5rem auto",
              background: "rgba(20, 184, 166, 0.2)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p style={{
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "0.9375rem",
              fontWeight: "300"
            }}>
              Schedule Interface Preview
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        padding: "8rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <h2 style={{
            fontSize: "3.5rem",
            fontWeight: "400",
            color: "#ffffff",
            marginBottom: "1rem",
            fontFamily: "Georgia, 'Times New Roman', serif"
          }}>
            How it works
          </h2>
          <p style={{
            fontSize: "1.125rem",
            color: "rgba(255, 255, 255, 0.5)",
            fontWeight: "300"
          }}>
            Three steps to transform your scheduling workflow
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "2rem"
        }}>
          {/* Step 1 */}
          <div style={{
            padding: "3rem 2rem",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            position: "relative"
          }}>
            <div style={{
              fontSize: "3.5rem",
              fontWeight: "300",
              color: "#14b8a6",
              marginBottom: "2rem",
              fontFamily: "monospace"
            }}>
              01
            </div>
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem"
            }}>
              Admin requests availability
            </h3>
            <p style={{
              fontSize: "1rem",
              color: "rgba(255, 255, 255, 0.6)",
              lineHeight: "1.7",
              fontWeight: "300"
            }}>
              Add your students and send automated availability requests. Students receive email invitations instantly.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{
            padding: "3rem 2rem",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            position: "relative"
          }}>
            <div style={{
              fontSize: "3.5rem",
              fontWeight: "300",
              color: "#14b8a6",
              marginBottom: "2rem",
              fontFamily: "monospace"
            }}>
              02
            </div>
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem"
            }}>
              Students submit availability
            </h3>
            <p style={{
              fontSize: "1rem",
              color: "rgba(255, 255, 255, 0.6)",
              lineHeight: "1.7",
              fontWeight: "300"
            }}>
              Students fill out a simple form with their available hours. No back-and-forth emails or phone calls needed.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{
            padding: "3rem 2rem",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            position: "relative"
          }}>
            <div style={{
              fontSize: "3.5rem",
              fontWeight: "300",
              color: "#14b8a6",
              marginBottom: "2rem",
              fontFamily: "monospace"
            }}>
              03
            </div>
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem"
            }}>
              Tool generates schedule
            </h3>
            <p style={{
              fontSize: "1rem",
              color: "rgba(255, 255, 255, 0.6)",
              lineHeight: "1.7",
              fontWeight: "300"
            }}>
              Our algorithm creates conflict-free schedules in seconds. Review, adjust, and share with your team.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: "8rem 2rem",
        backgroundColor: "rgba(20, 184, 166, 0.02)",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <h2 style={{
              fontSize: "3.5rem",
              fontWeight: "400",
              color: "#ffffff",
              marginBottom: "1rem",
              fontFamily: "Georgia, 'Times New Roman', serif"
            }}>
              Everything you need
            </h2>
            <p style={{
              fontSize: "1.125rem",
              color: "rgba(255, 255, 255, 0.5)",
              fontWeight: "300"
            }}>
              Comprehensive tools designed for modern scheduling
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2.5rem"
          }}>
            {/* Feature 1 */}
            <div style={{
              padding: "2.5rem",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "rgba(20, 184, 166, 0.15)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: "0.75rem"
              }}>
                Passwordless email login
              </h3>
              <p style={{
                fontSize: "0.9375rem",
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: "1.7",
                fontWeight: "300"
              }}>
                No passwords to remember. Admins and students login with email verification codes sent instantly. Secure and simple.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              padding: "2.5rem",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "rgba(20, 184, 166, 0.15)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: "0.75rem"
              }}>
                Multi-admin support
              </h3>
              <p style={{
                fontSize: "0.9375rem",
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: "1.7",
                fontWeight: "300"
              }}>
                Primary admins can invite secondary admins to help manage scheduling. Perfect for teams with multiple managers.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              padding: "2.5rem",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "rgba(20, 184, 166, 0.15)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
              </div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: "0.75rem"
              }}>
                Automated email invitations
              </h3>
              <p style={{
                fontSize: "0.9375rem",
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: "1.7",
                fontWeight: "300"
              }}>
                Students automatically receive email invitations when added. Support for both primary and secondary email addresses.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{
              padding: "2.5rem",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "rgba(20, 184, 166, 0.15)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: "0.75rem"
              }}>
                Simple availability form
              </h3>
              <p style={{
                fontSize: "0.9375rem",
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: "1.7",
                fontWeight: "300"
              }}>
                Students select their available hours on an intuitive weekly calendar. Takes less than 2 minutes to complete.
              </p>
            </div>

            {/* Feature 5 */}
            <div style={{
              padding: "2.5rem",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "rgba(20, 184, 166, 0.15)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: "0.75rem"
              }}>
                Instant schedule generation
              </h3>
              <p style={{
                fontSize: "0.9375rem",
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: "1.7",
                fontWeight: "300"
              }}>
                Our algorithm creates balanced, conflict-free schedules in seconds based on student availability. No manual work required.
              </p>
            </div>

            {/* Feature 6 */}
            <div style={{
              padding: "2.5rem",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "rgba(20, 184, 166, 0.15)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#ffffff",
                marginBottom: "0.75rem"
              }}>
                Reset and regenerate anytime
              </h3>
              <p style={{
                fontSize: "0.9375rem",
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: "1.7",
                fontWeight: "300"
              }}>
                Need to make changes? Reset student availability and request new submissions. Generate fresh schedules whenever needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{
        padding: "8rem 2rem",
        maxWidth: "900px",
        margin: "0 auto"
      }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{
            display: "inline-block",
            padding: "0.5rem 1rem",
            backgroundColor: "rgba(20, 184, 166, 0.1)",
            border: "1px solid rgba(20, 184, 166, 0.3)",
            borderRadius: "20px",
            color: "#14b8a6",
            fontSize: "0.75rem",
            fontWeight: "500",
            marginBottom: "2rem",
            letterSpacing: "0.1em"
          }}>
            FAQs
          </div>
          <h2 style={{
            fontSize: "3rem",
            fontWeight: "400",
            color: "#ffffff",
            marginBottom: "1rem",
            fontFamily: "Georgia, 'Times New Roman', serif"
          }}>
            Got questions?
            <br />
            Here's the answers.
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "4rem" }}>
          {[
            { q: "How do admins register and login?", a: "Admins register with their organization name and email. After registration, they receive a verification code via email. Simply enter the code to access your admin portal. You can login anytime using your email - we'll send you a new code each time." },
            { q: "How do students register and login?", a: "Students don't register themselves - admins add them to the system. When an admin adds a student, they automatically receive an email invitation with a login link. Students click the link, enter the verification code from their email, and access their dashboard." },
            { q: "How does the invite admin feature work?", a: "Primary admins can invite secondary admins to help manage scheduling. Just add their name and email in the Invite Admin section. They'll receive an invitation email and can login immediately. Secondary admins have the same access as primary admins." },
            { q: "How do I add students to my organization?", a: "In your admin portal, use the Add Student section. Enter the student's name, primary email, and optionally a secondary email (like a school email). Click Request Availability, and they'll instantly receive an invitation email to submit their hours." },
            { q: "Can students use multiple email addresses?", a: "Yes! When adding a student, you can provide both a primary and secondary email. Students receive invitations at both addresses and can login using either email - both access the same account and availability." },
            { q: "What happens after students submit availability?", a: "Once students submit their available hours, you'll see their status change to \"Submitted\" in your admin portal. You can then generate a schedule using the scheduling tool, which creates a balanced, conflict-free schedule automatically based on all submitted availability." }
          ].map((faq, index) => (
            <div
              key={index}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                overflow: "hidden"
              }}
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                style={{
                  width: "100%",
                  padding: "1.5rem",
                  background: "none",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "1.0625rem",
                  fontWeight: "500",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span>{faq.q}</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  style={{
                    transform: expandedFaq === index ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s"
                  }}
                >
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {expandedFaq === index && (
                <div style={{
                  padding: "0 1.5rem 1.5rem 1.5rem",
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "0.9375rem",
                  lineHeight: "1.7",
                  fontWeight: "300"
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "3rem 2rem",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        textAlign: "center"
      }}>
        <p style={{
          fontSize: "0.875rem",
          color: "rgba(255, 255, 255, 0.4)",
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
            backgroundColor: "#0f1419",
            borderRadius: "12px",
            padding: "2.5rem",
            maxWidth: "500px",
            width: "90%",
            border: "1px solid rgba(255, 255, 255, 0.1)"
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
                    backgroundColor: "#0a0f1a",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
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
                    backgroundColor: "#0a0f1a",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
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
                    backgroundColor: "#0a0f1a",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
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
                    background: "transparent",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
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
                    background: "#14b8a6",
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
