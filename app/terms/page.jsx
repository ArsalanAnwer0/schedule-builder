'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TermsOfUse() {
  const router = useRouter();

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
        <h1 style={{
          fontFamily: "Georgia, serif",
          fontSize: "2.5rem",
          fontWeight: "400",
          color: "rgba(0, 0, 0, 0.87)",
          marginBottom: "1rem",
          letterSpacing: "-0.02em"
        }}>
          Terms of Use
        </h1>
        <p style={{
          fontSize: "0.9375rem",
          color: "rgba(0, 0, 0, 0.4)",
          marginBottom: "3rem",
          fontWeight: "400"
        }}>
          Last updated: January 2026
        </p>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
          color: "rgba(0, 0, 0, 0.65)",
          fontSize: "1rem",
          lineHeight: "1.8",
          fontWeight: "400"
        }}>
          <section>
            <h2 style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: "400",
              color: "rgba(0, 0, 0, 0.87)",
              marginBottom: "1rem"
            }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using Schedule Builder, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.
            </p>
          </section>

          <section>
            <h2 style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: "400",
              color: "rgba(0, 0, 0, 0.87)",
              marginBottom: "1rem"
            }}>
              2. Description of Service
            </h2>
            <p>
              Schedule Builder provides a web-based platform for organizations to collect availability from team members and generate work schedules. The service includes features for user authentication, availability submission, schedule generation, and team management.
            </p>
          </section>

          <section>
            <h2 style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: "400",
              color: "rgba(0, 0, 0, 0.87)",
              marginBottom: "1rem"
            }}>
              3. User Accounts
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              To use Schedule Builder, you must:
            </p>
            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
              <li style={{ marginBottom: "0.5rem" }}>Provide accurate and complete registration information</li>
              <li style={{ marginBottom: "0.5rem" }}>Maintain the security of your account credentials</li>
              <li style={{ marginBottom: "0.5rem" }}>Notify us immediately of any unauthorized use</li>
              <li style={{ marginBottom: "0.5rem" }}>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: "400",
              color: "rgba(0, 0, 0, 0.87)",
              marginBottom: "1rem"
            }}>
              4. Acceptable Use
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              You agree not to:
            </p>
            <ul style={{ paddingLeft: "1.5rem", marginBottom: "1rem" }}>
              <li style={{ marginBottom: "0.5rem" }}>Use the service for any illegal purpose</li>
              <li style={{ marginBottom: "0.5rem" }}>Attempt to gain unauthorized access to our systems</li>
              <li style={{ marginBottom: "0.5rem" }}>Interfere with or disrupt the service</li>
              <li style={{ marginBottom: "0.5rem" }}>Upload malicious code or viruses</li>
              <li style={{ marginBottom: "0.5rem" }}>Violate any applicable laws or regulations</li>
              <li style={{ marginBottom: "0.5rem" }}>Harass, abuse, or harm other users</li>
            </ul>
          </section>

          <section>
            <h2 style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: "400",
              color: "rgba(0, 0, 0, 0.87)",
              marginBottom: "1rem"
            }}>
              5. Data and Privacy
            </h2>
            <p>
              Your use of Schedule Builder is also governed by our{' '}
              <Link href="/privacy" style={{ color: "#14b8a6", textDecoration: "none" }}>
                Privacy Policy
              </Link>. By using the service, you consent to the collection and use of information as described in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: "400",
              color: "rgba(0, 0, 0, 0.87)",
              marginBottom: "1rem"
            }}>
              6. Intellectual Property
            </h2>
            <p>
              The service and its original content, features, and functionality are owned by Schedule Builder and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: "400",
              color: "rgba(0, 0, 0, 0.87)",
              marginBottom: "1rem"
            }}>
              7. Service Availability
            </h2>
            <p>
              We strive to provide reliable service but do not guarantee that the service will be uninterrupted, timely, secure, or error-free. We reserve the right to modify or discontinue the service at any time without notice.
            </p>
          </section>

          <section>
            <h2 style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: "400",
              color: "rgba(0, 0, 0, 0.87)",
              marginBottom: "1rem"
            }}>
              8. Limitation of Liability
            </h2>
            <p>
              Schedule Builder shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. This is provided as-is without warranties of any kind.
            </p>
          </section>

          <section>
            <h2 style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: "400",
              color: "rgba(0, 0, 0, 0.87)",
              marginBottom: "1rem"
            }}>
              9. Termination
            </h2>
            <p>
              We reserve the right to terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms of Use or is harmful to other users, us, or third parties.
            </p>
          </section>

          <section>
            <h2 style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: "400",
              color: "rgba(0, 0, 0, 0.87)",
              marginBottom: "1rem"
            }}>
              10. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Use on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: "400",
              color: "rgba(0, 0, 0, 0.87)",
              marginBottom: "1rem"
            }}>
              11. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.75rem",
              fontWeight: "400",
              color: "rgba(0, 0, 0, 0.87)",
              marginBottom: "1rem"
            }}>
              12. Contact
            </h2>
            <p>
              If you have questions about these Terms of Use, please contact us at{' '}
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
