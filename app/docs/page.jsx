'use client';

import Link from 'next/link';

export default function DocsPage() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0a0f1a",
      padding: "2rem"
    }}>
      <div style={{
        maxWidth: "900px",
        margin: "0 auto"
      }}>
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <Link
            href="/"
            style={{
              color: "#14b8a6",
              textDecoration: "none",
              fontSize: "0.9375rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "2rem"
            }}
          >
            ← Back to Home
          </Link>
          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: "600",
            color: "#ffffff",
            marginBottom: "0.75rem"
          }}>
            Documentation
          </h1>
          <p style={{
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "1.125rem",
            fontWeight: "300"
          }}>
            Everything you need to know about Schedule Builder
          </p>
        </div>

        {/* Getting Started */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{
            fontSize: "1.75rem",
            fontWeight: "600",
            color: "#ffffff",
            marginBottom: "1rem",
            paddingBottom: "0.5rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            Getting Started
          </h2>

          <div style={{ marginBottom: "1.5rem" }}>
            <h3 style={{
              fontSize: "1.25rem",
              fontWeight: "500",
              color: "#14b8a6",
              marginBottom: "0.75rem"
            }}>
              For Managers
            </h3>
            <ol style={{
              color: "rgba(255, 255, 255, 0.7)",
              lineHeight: "1.8",
              paddingLeft: "1.5rem"
            }}>
              <li style={{ marginBottom: "0.5rem" }}>Create an account and sign in as a manager</li>
              <li style={{ marginBottom: "0.5rem" }}>Add your team members via the admin dashboard</li>
              <li style={{ marginBottom: "0.5rem" }}>Configure office hours and schedule dates</li>
              <li style={{ marginBottom: "0.5rem" }}>Send availability requests to your team</li>
              <li style={{ marginBottom: "0.5rem" }}>Review submissions and generate optimized schedules</li>
              <li style={{ marginBottom: "0.5rem" }}>Publish schedules for your team to view</li>
            </ol>
          </div>

          <div>
            <h3 style={{
              fontSize: "1.25rem",
              fontWeight: "500",
              color: "#14b8a6",
              marginBottom: "0.75rem"
            }}>
              For Team Members
            </h3>
            <ol style={{
              color: "rgba(255, 255, 255, 0.7)",
              lineHeight: "1.8",
              paddingLeft: "1.5rem"
            }}>
              <li style={{ marginBottom: "0.5rem" }}>Receive email invitation from your manager</li>
              <li style={{ marginBottom: "0.5rem" }}>Set your password using the invitation link</li>
              <li style={{ marginBottom: "0.5rem" }}>Wait for availability request notification</li>
              <li style={{ marginBottom: "0.5rem" }}>Submit your available hours through the dashboard</li>
              <li style={{ marginBottom: "0.5rem" }}>View your published work schedule</li>
            </ol>
          </div>
        </section>

        {/* Key Features */}
        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{
            fontSize: "1.75rem",
            fontWeight: "600",
            color: "#ffffff",
            marginBottom: "1rem",
            paddingBottom: "0.5rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            Key Features
          </h2>

          <div style={{
            display: "grid",
            gap: "1.5rem"
          }}>
            <div>
              <h3 style={{
                fontSize: "1.125rem",
                fontWeight: "500",
                color: "#ffffff",
                marginBottom: "0.5rem"
              }}>
                Smart Schedule Generation
              </h3>
              <p style={{
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: "1.7"
              }}>
                Our algorithm automatically creates optimal schedules based on team availability, ensuring fair distribution of hours and coverage.
              </p>
            </div>

            <div>
              <h3 style={{
                fontSize: "1.125rem",
                fontWeight: "500",
                color: "#ffffff",
                marginBottom: "0.5rem"
              }}>
                Email Notifications
              </h3>
              <p style={{
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: "1.7"
              }}>
                Automated email notifications keep everyone informed about invitations, availability requests, and published schedules.
              </p>
            </div>

            <div>
              <h3 style={{
                fontSize: "1.125rem",
                fontWeight: "500",
                color: "#ffffff",
                marginBottom: "0.5rem"
              }}>
              CSV Export
              </h3>
              <p style={{
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: "1.7"
              }}>
                Export schedules to CSV format for easy integration with other tools and record keeping.
              </p>
            </div>

            <div>
              <h3 style={{
                fontSize: "1.125rem",
                fontWeight: "500",
                color: "#ffffff",
                marginBottom: "0.5rem"
              }}>
                Two-Factor Authentication
              </h3>
              <p style={{
                color: "rgba(255, 255, 255, 0.6)",
                lineHeight: "1.7"
              }}>
                Enhanced security with 2FA support using authenticator apps, plus recovery codes for account safety.
              </p>
            </div>
          </div>
        </section>

        {/* Support */}
        <section>
          <h2 style={{
            fontSize: "1.75rem",
            fontWeight: "600",
            color: "#ffffff",
            marginBottom: "1rem",
            paddingBottom: "0.5rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            Need Help?
          </h2>
          <p style={{
            color: "rgba(255, 255, 255, 0.6)",
            lineHeight: "1.7",
            marginBottom: "1rem"
          }}>
            If you have questions or need assistance, please reach out through our contact page.
          </p>
          <Link
            href="/contact"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              background: "#14b8a6",
              color: "#ffffff",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "500",
              transition: "background 0.2s"
            }}
          >
            Contact Support
          </Link>
        </section>
      </div>
    </div>
  );
}
