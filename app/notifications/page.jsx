'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [unreadCount, setUnreadCount] = useState(0);

  // Check authentication
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
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

  // Fetch notifications
  const fetchNotifications = async (filterType = 'all') => {
    try {
      const res = await fetch(`/api/notifications?filter=${filterType}&limit=100`);
      const data = await res.json();

      if (res.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications(filter);
    }
  }, [user, filter]);

  // Mark notification as read
  const markAsRead = async (notificationId, actionUrl) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      // Update local state
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Navigate if there's an action URL
      if (actionUrl) {
        router.push(actionUrl);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0a0f1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", fontWeight: "300" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f1a", padding: "2rem 1.5rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{
              fontSize: "1.875rem",
              fontWeight: "400",
              color: "#ffffff",
              marginBottom: "0.5rem",
              letterSpacing: "-0.02em",
              fontFamily: "Georgia, 'Times New Roman', serif"
            }}>
              Notifications
            </h1>
            <p style={{
              fontSize: "1rem",
              color: "rgba(255, 255, 255, 0.6)",
              lineHeight: "1.6",
              fontWeight: "300"
            }}>
              Stay updated with your latest activity
            </p>
          </div>

          <button
            onClick={() => router.push(user.role === 'admin' ? '/admin' : '/dashboard')}
            style={{
              padding: "0.625rem 1.25rem",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Filter Tabs and Actions */}
        <div style={{
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px 12px 0 0",
          padding: "1rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                background: "none",
                border: "none",
                color: filter === 'all' ? '#14b8a6' : 'rgba(255, 255, 255, 0.5)',
                fontSize: "0.9375rem",
                cursor: "pointer",
                padding: "0.5rem 0",
                fontWeight: "500",
                borderBottom: filter === 'all' ? '2px solid #14b8a6' : 'none',
                transition: "color 0.2s"
              }}
              onMouseOver={(e) => {
                if (filter !== 'all') e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              }}
              onMouseOut={(e) => {
                if (filter !== 'all') e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
              }}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              style={{
                background: "none",
                border: "none",
                color: filter === 'unread' ? '#14b8a6' : 'rgba(255, 255, 255, 0.5)',
                fontSize: "0.9375rem",
                cursor: "pointer",
                padding: "0.5rem 0",
                fontWeight: "500",
                borderBottom: filter === 'unread' ? '2px solid #14b8a6' : 'none',
                transition: "color 0.2s"
              }}
              onMouseOver={(e) => {
                if (filter !== 'unread') e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              }}
              onMouseOut={(e) => {
                if (filter !== 'unread') e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
              }}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              style={{
                background: "none",
                border: "none",
                color: filter === 'read' ? '#14b8a6' : 'rgba(255, 255, 255, 0.5)',
                fontSize: "0.9375rem",
                cursor: "pointer",
                padding: "0.5rem 0",
                fontWeight: "500",
                borderBottom: filter === 'read' ? '2px solid #14b8a6' : 'none',
                transition: "color 0.2s"
              }}
              onMouseOver={(e) => {
                if (filter !== 'read') e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              }}
              onMouseOut={(e) => {
                if (filter !== 'read') e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
              }}
            >
              Read
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                background: "none",
                border: "none",
                color: "#14b8a6",
                fontSize: "0.875rem",
                cursor: "pointer",
                padding: "0.5rem 0",
                fontWeight: "500"
              }}
              onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div style={{
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          overflow: "hidden"
        }}>
          {notifications.length === 0 ? (
            <div style={{
              padding: "4rem 2rem",
              textAlign: "center"
            }}>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1.5"
                style={{ margin: "0 auto 1.5rem auto" }}
              >
                <path d="M18 8A6 6 6 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p style={{
                color: "rgba(255, 255, 255, 0.4)",
                fontSize: "1rem",
                margin: 0
              }}>
                {filter === 'unread' ? 'No unread notifications' : filter === 'read' ? 'No read notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <button
                key={notification._id}
                onClick={() => markAsRead(notification._id, notification.actionUrl)}
                style={{
                  width: "100%",
                  padding: "1.25rem 1.5rem",
                  backgroundColor: notification.read ? 'transparent' : 'rgba(20, 184, 166, 0.05)',
                  border: "none",
                  borderBottom: index === notifications.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: notification.actionUrl ? 'pointer' : 'default',
                  textAlign: "left",
                  transition: "background-color 0.2s"
                }}
                onMouseOver={(e) => {
                  if (notification.actionUrl) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = notification.read ? 'transparent' : 'rgba(20, 184, 166, 0.05)';
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  {!notification.read && (
                    <div style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#14b8a6",
                      marginTop: "0.5rem",
                      flexShrink: 0
                    }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: "0.9375rem",
                      color: "#ffffff",
                      margin: "0 0 0.5rem 0",
                      lineHeight: "1.6",
                      fontWeight: notification.read ? "300" : "400"
                    }}>
                      {notification.message}
                    </p>
                    <p style={{
                      fontSize: "0.8125rem",
                      color: "rgba(255, 255, 255, 0.4)",
                      margin: 0
                    }}>
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
