'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// TODO: Email verification disabled for now
export default function VerifyEmailPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

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
            Email verification is currently disabled
          </p>
        </div>

        {/* Main Card */}
        <div style={{
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          padding: "2.5rem",
          backdropFilter: "blur(10px)",
          textAlign: "center"
        }}>
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
              Email verification is temporarily disabled. You can access your account immediately after registration.
            </p>
          </div>

          <p style={{
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "0.9375rem",
            margin: "0 0 2rem 0",
            lineHeight: "1.6",
            fontWeight: "300"
          }}>
            Redirecting to your dashboard...
          </p>

          <Link
            href="/dashboard"
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
            Go to Dashboard
          </Link>
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
