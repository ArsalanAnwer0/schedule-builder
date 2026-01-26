'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRead, setShowRead] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Fetch notifications
  const fetchNotifications = async (filter = 'unread') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications?filter=${filter}&limit=50`);
      const data = await res.json();

      if (res.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on mount and when dropdown opens
  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(showRead ? 'all' : 'unread');
    }
  }, [isOpen, showRead]);

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
        setIsOpen(false);
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
    return date.toLocaleDateString();
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'transparent',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          padding: '0.625rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
          e.currentTarget.style.borderColor = '#14b8a6';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={unreadCount > 0 ? '#14b8a6' : 'rgba(0, 0, 0, 0.5)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 6 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontSize: '0.6875rem',
            fontWeight: '600',
            borderRadius: '10px',
            padding: '0.125rem 0.375rem',
            minWidth: '18px',
            textAlign: 'center',
            lineHeight: '1.2'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 0.5rem)',
          right: 0,
          width: '380px',
          maxWidth: '90vw',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: 'rgba(0, 0, 0, 0.87)',
              margin: 0
            }}>
              Notifications
            </h3>
            {unreadCount > 0 && !showRead && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#14b8a6',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  padding: 0,
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            padding: '0.75rem 1.25rem',
            gap: '1rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <button
              onClick={() => setShowRead(false)}
              style={{
                background: 'none',
                border: 'none',
                color: !showRead ? '#14b8a6' : 'rgba(0, 0, 0, 0.4)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.25rem 0',
                fontWeight: '500',
                borderBottom: !showRead ? '2px solid #14b8a6' : 'none'
              }}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setShowRead(true)}
              style={{
                background: 'none',
                border: 'none',
                color: showRead ? '#14b8a6' : 'rgba(0, 0, 0, 0.4)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                padding: '0.25rem 0',
                fontWeight: '500',
                borderBottom: showRead ? '2px solid #14b8a6' : 'none'
              }}
            >
              All
            </button>
          </div>

          {/* Notifications List */}
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {loading ? (
              <div style={{
                padding: '3rem 1.25rem',
                textAlign: 'center',
                color: 'rgba(0, 0, 0, 0.4)',
                fontSize: '0.875rem'
              }}>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{
                padding: '3rem 1.25rem',
                textAlign: 'center',
                color: 'rgba(0, 0, 0, 0.4)',
                fontSize: '0.875rem'
              }}>
                {showRead ? 'No notifications yet' : 'No unread notifications'}
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  onClick={() => markAsRead(notification._id, notification.actionUrl)}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    backgroundColor: notification.read ? 'transparent' : 'rgba(20, 184, 166, 0.05)',
                    border: 'none',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.03)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = notification.read ? 'transparent' : 'rgba(20, 184, 166, 0.05)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    {!notification.read && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#14b8a6',
                        marginTop: '0.375rem',
                        flexShrink: 0
                      }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '0.875rem',
                        color: 'rgba(0, 0, 0, 0.87)',
                        margin: '0 0 0.375rem 0',
                        lineHeight: '1.5'
                      }}>
                        {notification.message}
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        color: 'rgba(0, 0, 0, 0.4)',
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

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '0.75rem 1.25rem',
              borderTop: '1px solid rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <button
                onClick={() => {
                  router.push('/notifications');
                  setIsOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#14b8a6',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
