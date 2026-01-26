'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user.role === 'admin') {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to delete account');
        setDeleting(false);
        return;
      }

      // Account deleted successfully - redirect to login
      window.location.href = '/login';

    } catch (err) {
      setError('Something went wrong. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(0, 0, 0, 0.5)" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "400", color: "rgba(0, 0, 0, 0.87)", marginBottom: "0.5rem" }}>
              Profile & Settings
            </h1>
            <p style={{ fontSize: "1rem", color: "rgba(0, 0, 0, 0.5)" }}>
              Manage your account settings
            </p>
          </div>
          <Link
            href="/admin"
            style={{
              padding: "0.625rem 1.25rem",
              backgroundColor: "transparent",
              color: "rgba(0, 0, 0, 0.6)",
              border: "1px solid rgba(0, 0, 0, 0.2)",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: "500",
              textDecoration: "none",
              display: "inline-block"
            }}
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Account Information */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid rgba(0, 0, 0, 0.1)", borderRadius: "8px", marginBottom: "2rem", padding: "2rem", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "500", color: "rgba(0, 0, 0, 0.87)", marginBottom: "1.5rem" }}>
            Account Information
          </h2>

          <div style={{ display: "grid", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.5)", marginBottom: "0.5rem" }}>
                Name
              </label>
              <p style={{ fontSize: "1rem", color: "rgba(0, 0, 0, 0.87)", margin: 0 }}>
                {user?.name}
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.5)", marginBottom: "0.5rem" }}>
                Email Address
              </label>
              <p style={{ fontSize: "1rem", color: "rgba(0, 0, 0, 0.87)", margin: 0 }}>
                {user?.email}
              </p>
            </div>

            {user?.organizationName && (
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.5)", marginBottom: "0.5rem" }}>
                  Organization
                </label>
                <p style={{ fontSize: "1rem", color: "rgba(0, 0, 0, 0.87)", margin: 0 }}>
                  {user.organizationName}
                </p>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.5)", marginBottom: "0.5rem" }}>
                Role
              </label>
              <p style={{ fontSize: "1rem", color: "rgba(0, 0, 0, 0.87)", margin: 0 }}>
                {user?.role === 'student'
                  ? 'Student'
                  : user?.adminType === 'primary'
                    ? 'Primary Admin'
                    : user?.adminType === 'secondary'
                      ? 'Secondary Admin'
                      : 'Admin'}
              </p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", padding: "2rem", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "500", color: "#dc2626", marginBottom: "0.5rem" }}>
            Danger Zone
          </h2>
          <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.5)", marginBottom: "1.5rem", lineHeight: "1.5" }}>
            Once you delete your account, there is no going back. All your data will be permanently removed.
          </p>

          {error && (
            <div style={{
              padding: "0.75rem 1rem",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "6px",
              marginBottom: "1rem"
            }}>
              <p style={{ color: "#dc2626", fontSize: "0.875rem", margin: 0 }}>
                {error}
              </p>
            </div>
          )}

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: "0.625rem 1.25rem",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "#dc2626",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
              }}
            >
              Delete Account
            </button>
          ) : (
            <div style={{
              padding: "1.5rem",
              backgroundColor: "rgba(239, 68, 68, 0.05)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "6px"
            }}>
              <p style={{ fontSize: "0.875rem", color: "#dc2626", marginBottom: "1rem", fontWeight: "500" }}>
                Are you absolutely sure?
              </p>
              <p style={{ fontSize: "0.875rem", color: "rgba(0, 0, 0, 0.6)", marginBottom: "1rem", lineHeight: "1.5" }}>
                This action cannot be undone. This will permanently delete your admin account and remove all associated data from our servers.
              </p>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  color: "rgba(0, 0, 0, 0.6)",
                  marginBottom: "0.5rem"
                }}>
                  Type <strong>DELETE</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  style={{
                    width: "100%",
                    padding: "0.625rem 0.875rem",
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(0, 0, 0, 0.2)",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    color: "rgba(0, 0, 0, 0.87)",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setConfirmText('');
                    setError('');
                  }}
                  disabled={deleting}
                  style={{
                    padding: "0.625rem 1.25rem",
                    backgroundColor: "transparent",
                    color: "rgba(0, 0, 0, 0.6)",
                    border: "1px solid rgba(0, 0, 0, 0.2)",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor: deleting ? "not-allowed" : "pointer",
                    opacity: deleting ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || confirmText !== 'DELETE'}
                  style={{
                    padding: "0.625rem 1.25rem",
                    backgroundColor: (deleting || confirmText !== 'DELETE') ? "rgba(239, 68, 68, 0.3)" : "#dc2626",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor: (deleting || confirmText !== 'DELETE') ? "not-allowed" : "pointer",
                    opacity: (deleting || confirmText !== 'DELETE') ? 0.6 : 1
                  }}
                >
                  {deleting ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
