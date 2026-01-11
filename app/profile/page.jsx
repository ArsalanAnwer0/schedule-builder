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
      <div style={{ minHeight: "100vh", backgroundColor: "#0f1b2a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#8b949e" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f1b2a", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "400", color: "#ffffff", marginBottom: "0.5rem" }}>
              Profile & Settings
            </h1>
            <p style={{ fontSize: "1rem", color: "#aab7b8" }}>
              Manage your account settings
            </p>
          </div>
          <Link
            href="/admin"
            style={{
              padding: "0.625rem 1.25rem",
              backgroundColor: "#16191f",
              color: "#ffffff",
              border: "1px solid #414d5c",
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
        <div style={{ backgroundColor: "#16191f", border: "1px solid #30363d", borderRadius: "8px", marginBottom: "2rem", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "500", color: "#ffffff", marginBottom: "1.5rem" }}>
            Account Information
          </h2>

          <div style={{ display: "grid", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", color: "#8b949e", marginBottom: "0.5rem" }}>
                Name
              </label>
              <p style={{ fontSize: "1rem", color: "#ffffff", margin: 0 }}>
                {user?.name}
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", color: "#8b949e", marginBottom: "0.5rem" }}>
                Email Address
              </label>
              <p style={{ fontSize: "1rem", color: "#ffffff", margin: 0 }}>
                {user?.email}
              </p>
            </div>

            {user?.organizationName && (
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", color: "#8b949e", marginBottom: "0.5rem" }}>
                  Organization
                </label>
                <p style={{ fontSize: "1rem", color: "#ffffff", margin: 0 }}>
                  {user.organizationName}
                </p>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", color: "#8b949e", marginBottom: "0.5rem" }}>
                Role
              </label>
              <p style={{ fontSize: "1rem", color: "#ffffff", margin: 0 }}>
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
        <div style={{ backgroundColor: "#16191f", border: "1px solid #5c2d30", borderRadius: "8px", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: "500", color: "#ff6b6b", marginBottom: "0.5rem" }}>
            Danger Zone
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#8b949e", marginBottom: "1.5rem", lineHeight: "1.5" }}>
            Once you delete your account, there is no going back. All your data will be permanently removed.
          </p>

          {error && (
            <div style={{
              padding: "0.75rem 1rem",
              backgroundColor: "#2d1517",
              border: "1px solid #5c2d30",
              borderRadius: "6px",
              marginBottom: "1rem"
            }}>
              <p style={{ color: "#ff6b6b", fontSize: "0.875rem", margin: 0 }}>
                {error}
              </p>
            </div>
          )}

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: "0.625rem 1.25rem",
                backgroundColor: "#2d1517",
                color: "#ff6b6b",
                border: "1px solid #5c2d30",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#3d1f21";
                e.currentTarget.style.borderColor = "#7c3d40";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#2d1517";
                e.currentTarget.style.borderColor = "#5c2d30";
              }}
            >
              Delete Account
            </button>
          ) : (
            <div style={{
              padding: "1.5rem",
              backgroundColor: "#2d1517",
              border: "1px solid #5c2d30",
              borderRadius: "6px"
            }}>
              <p style={{ fontSize: "0.875rem", color: "#ff6b6b", marginBottom: "1rem", fontWeight: "500" }}>
                Are you absolutely sure?
              </p>
              <p style={{ fontSize: "0.875rem", color: "#c9d1d9", marginBottom: "1rem", lineHeight: "1.5" }}>
                This action cannot be undone. This will permanently delete your admin account and remove all associated data from our servers.
              </p>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  color: "#c9d1d9",
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
                    backgroundColor: "#0d1117",
                    border: "1px solid #30363d",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    color: "#ffffff",
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
                    backgroundColor: "#0d1117",
                    color: "#ffffff",
                    border: "1px solid #30363d",
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
                    backgroundColor: (deleting || confirmText !== 'DELETE') ? "#5c2d30" : "#dc2626",
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
