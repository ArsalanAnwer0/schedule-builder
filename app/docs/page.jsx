'use client';

import Link from 'next/link';

export default function DocsPage() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#ffffff",
      padding: "4rem 2rem"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Header */}
        <div style={{ marginBottom: "4rem" }}>
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
          <h1 style={{
            fontFamily: "Georgia, serif",
            fontSize: "2.5rem",
            fontWeight: "400",
            color: "rgba(0, 0, 0, 0.87)",
            marginBottom: "1rem",
            letterSpacing: "-0.02em"
          }}>
            Documentation
          </h1>
          <p style={{
            color: "rgba(0, 0, 0, 0.65)",
            fontSize: "1.125rem",
            fontWeight: "300",
            lineHeight: "1.6"
          }}>
            Everything you need to know about Schedule Builder
          </p>
        </div>

        {/* Getting Started */}
        <section style={{ marginBottom: "4rem" }}>
          <h2 style={{
            fontFamily: "Georgia, serif",
            fontSize: "1.75rem",
            fontWeight: "400",
            color: "rgba(0, 0, 0, 0.87)",
            marginBottom: "1.5rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)"
          }}>
            Getting Started
          </h2>

          <div style={{ marginBottom: "2.5rem" }}>
            <h3 style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#14b8a6",
              marginBottom: "1rem"
            }}>
              For Managers
            </h3>
            <ol style={{
              color: "rgba(0, 0, 0, 0.65)",
              lineHeight: "1.8",
              paddingLeft: "1.5rem",
              fontWeight: "400"
            }}>
              <li style={{ marginBottom: "0.75rem" }}>Create an account and sign in as a manager</li>
              <li style={{ marginBottom: "0.75rem" }}>Add your team members via the admin dashboard</li>
              <li style={{ marginBottom: "0.75rem" }}>Configure office hours and schedule dates</li>
              <li style={{ marginBottom: "0.75rem" }}>Send availability requests to your team</li>
              <li style={{ marginBottom: "0.75rem" }}>Review submissions and generate optimized schedules</li>
              <li style={{ marginBottom: "0.75rem" }}>Publish schedules for your team to view</li>
            </ol>
          </div>

          <div>
            <h3 style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#14b8a6",
              marginBottom: "1rem"
            }}>
              For Team Members
            </h3>
            <ol style={{
              color: "rgba(0, 0, 0, 0.65)",
              lineHeight: "1.8",
              paddingLeft: "1.5rem",
              fontWeight: "400"
            }}>
              <li style={{ marginBottom: "0.75rem" }}>Receive email invitation from your manager</li>
              <li style={{ marginBottom: "0.75rem" }}>Set your password using the invitation link</li>
              <li style={{ marginBottom: "0.75rem" }}>Wait for availability request notification</li>
              <li style={{ marginBottom: "0.75rem" }}>Submit your available hours through the dashboard</li>
              <li style={{ marginBottom: "0.75rem" }}>View your published work schedule</li>
            </ol>
          </div>
        </section>

        {/* Key Features */}
        <section style={{ marginBottom: "4rem" }}>
          <h2 style={{
            fontFamily: "Georgia, serif",
            fontSize: "1.75rem",
            fontWeight: "400",
            color: "rgba(0, 0, 0, 0.87)",
            marginBottom: "1.5rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)"
          }}>
            Key Features
          </h2>

          <div style={{
            display: "grid",
            gap: "2rem"
          }}>
            <div>
              <h3 style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "rgba(0, 0, 0, 0.87)",
                marginBottom: "0.75rem"
              }}>
                Smart Schedule Generation
              </h3>
              <p style={{
                color: "rgba(0, 0, 0, 0.65)",
                lineHeight: "1.8",
                fontWeight: "400"
              }}>
                Our algorithm automatically creates optimal schedules based on team availability, ensuring fair distribution of hours and coverage.
              </p>
            </div>

            <div>
              <h3 style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "rgba(0, 0, 0, 0.87)",
                marginBottom: "0.75rem"
              }}>
                Email Notifications
              </h3>
              <p style={{
                color: "rgba(0, 0, 0, 0.65)",
                lineHeight: "1.8",
                fontWeight: "400"
              }}>
                Automated email notifications keep everyone informed about invitations, availability requests, and published schedules.
              </p>
            </div>

            <div>
              <h3 style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "rgba(0, 0, 0, 0.87)",
                marginBottom: "0.75rem"
              }}>
              CSV Export
              </h3>
              <p style={{
                color: "rgba(0, 0, 0, 0.65)",
                lineHeight: "1.8",
                fontWeight: "400"
              }}>
                Export schedules to CSV format for easy integration with other tools and record keeping.
              </p>
            </div>

            <div>
              <h3 style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "rgba(0, 0, 0, 0.87)",
                marginBottom: "0.75rem"
              }}>
                Two-Factor Authentication
              </h3>
              <p style={{
                color: "rgba(0, 0, 0, 0.65)",
                lineHeight: "1.8",
                fontWeight: "400"
              }}>
                Enhanced security with 2FA support using authenticator apps, plus recovery codes for account safety.
              </p>
            </div>
          </div>
        </section>

        {/* Support */}
        <section>
          <h2 style={{
            fontFamily: "Georgia, serif",
            fontSize: "1.75rem",
            fontWeight: "400",
            color: "rgba(0, 0, 0, 0.87)",
            marginBottom: "1.5rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid rgba(0, 0, 0, 0.08)"
          }}>
            Need Help?
          </h2>
          <p style={{
            color: "rgba(0, 0, 0, 0.65)",
            lineHeight: "1.8",
            marginBottom: "1.5rem",
            fontWeight: "400"
          }}>
            If you have questions or need assistance, please reach out through our contact page.
          </p>
          <Link
            href="/contact"
            style={{
              display: "inline-block",
              padding: "0.875rem 1.75rem",
              background: "#14b8a6",
              color: "#ffffff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "500",
              transition: "background 0.2s",
              fontSize: "1rem"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#0d9488"}
            onMouseOut={(e) => e.currentTarget.style.background = "#14b8a6"}
          >
            Contact Support
          </Link>
        </section>
      </div>
    </div>
  );
}
