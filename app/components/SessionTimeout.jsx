'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before timeout

export default function SessionTimeout() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const intervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    setShowWarning(false);

    // Set warning timer (25 minutes)
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeRemaining(WARNING_TIME);

      // Start countdown interval
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - lastActivityRef.current;
        const remaining = SESSION_TIMEOUT - elapsed;

        if (remaining <= 0) {
          handleLogout();
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);
    }, SESSION_TIMEOUT - WARNING_TIME);

    // Set logout timer (30 minutes)
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, SESSION_TIMEOUT);
  }, []);

  const handleLogout = async () => {
    // Clear all timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Call logout API
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // Continue with redirect even if logout fails
    }

    // Redirect to login
    router.push('/login?timeout=true');
  };

  const handleStayLoggedIn = () => {
    resetTimers();
  };

  useEffect(() => {
    // Activity events to monitor
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;

      // Only reset if it's been more than 1 minute since last activity
      // This prevents excessive timer resets
      if (timeSinceLastActivity > 60000) {
        resetTimers();
      }
    };

    // Set up initial timers
    resetTimers();

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resetTimers]);

  // Format time remaining
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning) return null;

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 9998,
        backdropFilter: 'blur(4px)'
      }}></div>

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#1a1f2e',
        border: '1px solid rgba(251, 191, 36, 0.5)',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '450px',
        width: '90%',
        zIndex: 9999,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Warning Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 1.5rem',
          backgroundColor: 'rgba(251, 191, 36, 0.15)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
            <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          Session Expiring Soon
        </h2>

        {/* Message */}
        <p style={{
          fontSize: '0.9375rem',
          color: 'rgba(255, 255, 255, 0.7)',
          textAlign: 'center',
          marginBottom: '1.5rem',
          lineHeight: '1.6'
        }}>
          Your session will expire in <strong style={{ color: '#fbbf24' }}>{formatTime(timeRemaining)}</strong> due to inactivity. You'll be automatically logged out to protect your account.
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexDirection: 'column'
        }}>
          <button
            onClick={handleStayLoggedIn}
            style={{
              padding: '0.875rem 1.5rem',
              backgroundColor: '#fbbf24',
              color: '#1a1a1a',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '100%'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fbbf24'}
          >
            Stay Logged In
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: '0.875rem 1.5rem',
              backgroundColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '100%'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            Log Out Now
          </button>
        </div>
      </div>
    </>
  );
}
