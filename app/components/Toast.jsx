'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const hideToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message, duration) => showToast(message, 'success', duration), [showToast]);
  const error = useCallback((message, duration) => showToast(message, 'error', duration), [showToast]);
  const info = useCallback((message, duration) => showToast(message, 'info', duration), [showToast]);
  const warning = useCallback((message, duration) => showToast(message, 'warning', duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '400px'
    }}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }) {
  const { id, message, type } = toast;
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 200);
  };

  const colors = {
    success: {
      bg: 'rgba(16, 185, 129, 0.15)',
      border: '#10b981',
      text: '#10b981',
      icon: '✓'
    },
    error: {
      bg: 'rgba(239, 68, 68, 0.15)',
      border: '#ef4444',
      text: '#ef4444',
      icon: '✕'
    },
    warning: {
      bg: 'rgba(251, 191, 36, 0.15)',
      border: '#fbbf24',
      text: '#fbbf24',
      icon: '⚠'
    },
    info: {
      bg: 'rgba(20, 184, 166, 0.15)',
      border: '#14b8a6',
      text: '#14b8a6',
      icon: 'ℹ'
    }
  };

  const style = colors[type] || colors.info;

  return (
    <div
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderLeft: `4px solid ${style.border}`,
        borderRadius: '8px',
        padding: '1rem 1.25rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        minWidth: '300px',
        maxWidth: '400px',
        animation: isExiting ? 'slideOut 0.2s ease-out' : 'slideIn 0.3s ease-out',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'translateX(100%)' : 'translateX(0)'
      }}
    >
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>

      <div style={{
        fontSize: '1.25rem',
        color: style.text,
        fontWeight: '600',
        flexShrink: 0,
        marginTop: '-2px'
      }}>
        {style.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          color: '#ffffff',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          margin: 0,
          wordBreak: 'break-word'
        }}>
          {message}
        </p>
      </div>

      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '1.25rem',
          cursor: 'pointer',
          padding: 0,
          lineHeight: 1,
          flexShrink: 0,
          transition: 'color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
        onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
      >
        ×
      </button>
    </div>
  );
}
