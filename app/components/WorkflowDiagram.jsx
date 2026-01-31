'use client';

import { useEffect, useRef, useState } from 'react';

const workflowSteps = [
  {
    title: 'Admin signs up, creates an organization',
    icon: 'admin-signup',
  },
  {
    title: 'Admin adds students in the organization',
    icon: 'add-students',
  },
  {
    title: 'Admin requests availability from students',
    icon: 'request-availability',
  },
  {
    title: 'Email notification gets sent to students to sign in',
    icon: 'email-notify',
  },
  {
    title: 'Students sign in, fill out and submit availability',
    icon: 'student-submit',
  },
  {
    title: 'Once all students have submitted, admin generates the schedule',
    icon: 'generate-schedule',
  },
  {
    title: 'Admin reviews the generated schedule, and shares with students',
    icon: 'review-share',
  },
  {
    title: 'Admin and students view final shifts',
    icon: 'view-shifts',
  },
];

function StepIcon({ type, color = '#14b8a6' }) {
  const size = 40;
  switch (type) {
    case 'admin-signup':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="14" r="6" stroke={color} strokeWidth="2" fill="none" />
          <path d="M10 34c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M28 8l2 2 4-4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'add-students':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <circle cx="15" cy="12" r="5" stroke={color} strokeWidth="2" fill="none" />
          <path d="M6 32c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="28" cy="14" r="4" stroke={color} strokeWidth="1.5" fill="none" />
          <path d="M22 30c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M33 10v6M36 13h-6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'request-availability':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect x="6" y="8" width="22" height="24" rx="3" stroke={color} strokeWidth="2" fill="none" />
          <path d="M12 16h10M12 21h10M12 26h6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M30 18l6 4-6 4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'email-notify':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect x="4" y="10" width="32" height="20" rx="3" stroke={color} strokeWidth="2" fill="none" />
          <path d="M4 13l16 10 16-10" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="32" cy="10" r="5" fill={color} />
          <path d="M30 10h4M32 8v4" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'student-submit':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect x="8" y="4" width="24" height="32" rx="3" stroke={color} strokeWidth="2" fill="none" />
          <path d="M14 14h12M14 20h12M14 26h8" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M14 9l2 2 4-4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'generate-schedule':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="14" stroke={color} strokeWidth="2" fill="none" />
          <circle cx="20" cy="20" r="4" stroke={color} strokeWidth="2" fill="none" />
          <path d="M20 6v4M20 30v4M6 20h4M30 20h4M10.1 10.1l2.8 2.8M27.1 27.1l2.8 2.8M10.1 29.9l2.8-2.8M27.1 12.9l2.8-2.8" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'review-share':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <circle cx="16" cy="20" r="10" stroke={color} strokeWidth="2" fill="none" />
          <path d="M24 28l8 8" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M13 20l2 2 4-4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'view-shifts':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect x="4" y="6" width="32" height="28" rx="3" stroke={color} strokeWidth="2" fill="none" />
          <path d="M4 14h32" stroke={color} strokeWidth="2" fill="none" />
          <path d="M12 6V2M28 6V2" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="10" y="19" width="6" height="4" rx="1" fill={color} opacity="0.3" />
          <rect x="17" y="19" width="6" height="4" rx="1" fill={color} opacity="0.3" />
          <rect x="24" y="19" width="6" height="4" rx="1" fill={color} opacity="0.3" />
          <rect x="10" y="26" width="6" height="4" rx="1" fill={color} opacity="0.3" />
          <rect x="17" y="26" width="6" height="4" rx="1" fill={color} opacity="0.3" />
        </svg>
      );
    default:
      return null;
  }
}

function ArrowRight({ color = 'rgba(0,0,0,0.2)' }) {
  return (
    <svg width="40" height="20" viewBox="0 0 40 20" fill="none" style={{ flexShrink: 0 }}>
      <line x1="0" y1="10" x2="30" y2="10" stroke={color} strokeWidth="2" />
      <path d="M28 4l8 6-8 6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeft({ color = 'rgba(0,0,0,0.2)' }) {
  return (
    <svg width="40" height="20" viewBox="0 0 40 20" fill="none" style={{ flexShrink: 0 }}>
      <line x1="10" y1="10" x2="40" y2="10" stroke={color} strokeWidth="2" />
      <path d="M12 4l-8 6 8 6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowDown({ color = 'rgba(0,0,0,0.2)' }) {
  return (
    <svg width="20" height="40" viewBox="0 0 20 40" fill="none">
      <line x1="10" y1="0" x2="10" y2="30" stroke={color} strokeWidth="2" />
      <path d="M4 28l6 8 6-8" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WorkflowNode({ step, index, isVisible, theme }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem',
        width: '160px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${index * 0.12}s, transform 0.5s ease ${index * 0.12}s`,
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '16px',
          border: `1.5px solid ${theme.border}`,
          background: theme.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <StepIcon type={step.icon} color={theme.accent} />
      </div>
      <p
        style={{
          fontSize: '0.8125rem',
          color: theme.textSecondary,
          textAlign: 'center',
          lineHeight: '1.5',
          fontWeight: '400',
          margin: 0,
          maxWidth: '160px',
        }}
      >
        {step.title}
      </p>
    </div>
  );
}

export default function WorkflowDiagram({ theme }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const row1 = workflowSteps.slice(0, 4);
  const row2 = workflowSteps.slice(4, 8).reverse(); // right to left

  const arrowColor = 'rgba(0, 0, 0, 0.2)';

  return (
    <div ref={sectionRef}>
      {/* Desktop Layout */}
      <div className="workflow-desktop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        {/* Row 1: Left to Right */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          {row1.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <WorkflowNode step={step} index={i} isVisible={isVisible} theme={theme} />
              {i < row1.length - 1 && (
                <div style={{ paddingTop: '28px', opacity: isVisible ? 1 : 0, transition: `opacity 0.5s ease ${(i + 0.5) * 0.12}s` }}>
                  <ArrowRight color={arrowColor} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Connector: Row 1 to Row 2 (down arrow on the right side) */}
        <div
          style={{
            alignSelf: 'flex-end',
            marginRight: '70px',
            opacity: isVisible ? 1 : 0,
            transition: `opacity 0.5s ease ${4 * 0.12}s`,
          }}
        >
          <ArrowDown color={arrowColor} />
        </div>

        {/* Row 2: Right to Left */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          {row2.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <WorkflowNode step={step} index={i + 4} isVisible={isVisible} theme={theme} />
              {i < row2.length - 1 && (
                <div style={{ paddingTop: '28px', opacity: isVisible ? 1 : 0, transition: `opacity 0.5s ease ${(i + 4.5) * 0.12}s` }}>
                  <ArrowLeft color={arrowColor} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Layout: Vertical */}
      <div className="workflow-mobile" style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        {workflowSteps.map((step, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <WorkflowNode step={step} index={i} isVisible={isVisible} theme={theme} />
            {i < workflowSteps.length - 1 && (
              <div style={{ padding: '0.25rem 0', opacity: isVisible ? 1 : 0, transition: `opacity 0.5s ease ${(i + 0.5) * 0.12}s` }}>
                <ArrowDown color={arrowColor} />
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .workflow-desktop {
            display: none !important;
          }
          .workflow-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
