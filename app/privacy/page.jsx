'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <div style={{ backgroundColor: "#0a0f1a", minHeight: "100vh" }}>
      {/* Navigation */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "#0a0f1a",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
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
            <span style={{ fontSize: "1.25rem", fontWeight: "600", color: "#ffffff" }}>Schedule Builder</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "4rem 2rem"
      }}>
        <h1 style={{
          fontSize: "2.5rem",
          fontWeight: "600",
          color: "#ffffff",
          marginBottom: "1rem"
        }}>
          Privacy Policy
        </h1>
        <p style={{
          fontSize: "0.9375rem",
          color: "rgba(255, 255, 255, 0.5)",
          marginBottom: "3rem"
        }}>
          Last updated: January 2026
        </p>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: "1rem",
          lineHeight: "1.8"
        }}>
          <section>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem"
            }}>
              1. Information We Collect
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              We collect information you provide directly to us when you:
            </p>
            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
              <li style={{ marginBottom: "0.5rem" }}>Create an account (name, email address, organization name)</li>
              <li style={{ marginBottom: "0.5rem" }}>Submit availability schedules</li>
              <li style={{ marginBottom: "0.5rem" }}>Use two-factor authentication (encrypted secrets and backup codes)</li>
              <li style={{ marginBottom: "0.5rem" }}>Communicate with us (contact forms, support emails)</li>
            </ul>
          </section>

          <section>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem"
            }}>
              2. How We Use Your Information
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              We use the information we collect to:
            </p>
            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
              <li style={{ marginBottom: "0.5rem" }}>Provide, maintain, and improve our scheduling services</li>
              <li style={{ marginBottom: "0.5rem" }}>Send you verification codes and notifications</li>
              <li style={{ marginBottom: "0.5rem" }}>Respond to your comments and questions</li>
              <li style={{ marginBottom: "0.5rem" }}>Protect against unauthorized access and abuse</li>
              <li style={{ marginBottom: "0.5rem" }}>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem"
            }}>
              3. Information Sharing
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
              <li style={{ marginBottom: "0.5rem" }}>With your organization's administrators (as necessary for scheduling)</li>
              <li style={{ marginBottom: "0.5rem" }}>With service providers who assist in our operations (email delivery, hosting)</li>
              <li style={{ marginBottom: "0.5rem" }}>When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem"
            }}>
              4. Data Security
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              We take data security seriously and implement industry-standard measures including:
            </p>
            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
              <li style={{ marginBottom: "0.5rem" }}>Password hashing with bcrypt</li>
              <li style={{ marginBottom: "0.5rem" }}>Two-factor authentication support</li>
              <li style={{ marginBottom: "0.5rem" }}>Session timeout after 30 minutes of inactivity</li>
              <li style={{ marginBottom: "0.5rem" }}>Account lockout after failed login attempts</li>
              <li style={{ marginBottom: "0.5rem" }}>Encrypted database connections</li>
              <li style={{ marginBottom: "0.5rem" }}>Rate limiting on sensitive operations</li>
            </ul>
          </section>

          <section>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem"
            }}>
              5. Data Retention
            </h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data by contacting us.
            </p>
          </section>

          <section>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem"
            }}>
              6. Cookies and Tracking
            </h2>
            <p>
              We use session cookies to maintain your login state. These cookies are essential for the service to function and expire after 7 days or 30 minutes of inactivity.
            </p>
          </section>

          <section>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem"
            }}>
              7. Your Rights
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              You have the right to:
            </p>
            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
              <li style={{ marginBottom: "0.5rem" }}>Access your personal information</li>
              <li style={{ marginBottom: "0.5rem" }}>Correct inaccurate data</li>
              <li style={{ marginBottom: "0.5rem" }}>Request deletion of your data</li>
              <li style={{ marginBottom: "0.5rem" }}>Opt-out of non-essential communications</li>
            </ul>
          </section>

          <section>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem"
            }}>
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#ffffff",
              marginBottom: "1rem"
            }}>
              9. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <Link href="/contact" style={{ color: "#14b8a6", textDecoration: "none" }}>
                our contact page
              </Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
