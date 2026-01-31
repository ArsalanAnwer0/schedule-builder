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
  const size = 36;
  switch (type) {
    case 'admin-signup':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <circle cx="16" cy="12" r="5" stroke={color} strokeWidth="2" fill="none" />
          <path d="M7 30c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M26 8l2 2 4-4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'add-students':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <circle cx="14" cy="12" r="5" stroke={color} strokeWidth="2" fill="none" />
          <path d="M5 30c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M28 10v8M32 14h-8" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      );
    case 'request-availability':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <rect x="6" y="4" width="20" height="28" rx="3" stroke={color} strokeWidth="2" fill="none" />
          <path d="M11 12h10M11 18h10M11 24h6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M28 14l5 4-5 4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'email-notify':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <rect x="3" y="8" width="30" height="20" rx="3" stroke={color} strokeWidth="2" fill="none" />
          <path d="M3 11l15 9 15-9" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="30" cy="8" r="4" stroke={color} strokeWidth="2" fill="none" />
          <circle cx="30" cy="8" r="1.5" fill={color} />
        </svg>
      );
    case 'student-submit':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <rect x="6" y="2" width="24" height="32" rx="3" stroke={color} strokeWidth="2" fill="none" />
          <path d="M12 14h12M12 20h12M12 26h8" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M12 8l2 2 4-4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'generate-schedule':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <rect x="4" y="6" width="28" height="26" rx="3" stroke={color} strokeWidth="2" fill="none" />
          <path d="M4 14h28" stroke={color} strokeWidth="2" />
          <path d="M12 6V2M24 6V2" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx="18" cy="24" r="4" stroke={color} strokeWidth="2" fill="none" />
          <path d="M18 18v2M18 28v2M12 24h2M22 24h2" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'review-share':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="10" stroke={color} strokeWidth="2" fill="none" />
          <path d="M24 24l8 8" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M13 16l2 2 4-4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'view-shifts':
      return (
        <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="30" height="28" rx="3" stroke={color} strokeWidth="2" fill="none" />
          <path d="M3 12h30" stroke={color} strokeWidth="2" />
          <path d="M11 4V0M25 4V0" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <rect x="8" y="17" width="6" height="4" rx="1" fill={color} opacity="0.3" />
          <rect x="15" y="17" width="6" height="4" rx="1" fill={color} opacity="0.3" />
          <rect x="22" y="17" width="6" height="4" rx="1" fill={color} />
          <rect x="8" y="24" width="6" height="4" rx="1" fill={color} opacity="0.3" />
          <rect x="15" y="24" width="6" height="4" rx="1" fill={color} opacity="0.3" />
        </svg>
      );
    default:
      return null;
  }
}

function ArrowRight({ color = 'rgba(0,0,0,0.25)' }) {
  return (
    <svg width="40" height="20" viewBox="0 0 40 20" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
      <line x1="0" y1="10" x2="30" y2="10" stroke={color} strokeWidth="2" />
      <path d="M28 4l8 6-8 6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowLeft({ color = 'rgba(0,0,0,0.25)' }) {
  return (
    <svg width="40" height="20" viewBox="0 0 40 20" fill="none" style={{ flexShrink: 0 }} aria-hidden="true">
      <line x1="10" y1="10" x2="40" y2="10" stroke={color} strokeWidth="2" />
      <path d="M12 4l-8 6 8 6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowDown({ color = 'rgba(0,0,0,0.25)' }) {
  return (
    <svg width="20" height="40" viewBox="0 0 20 40" fill="none" aria-hidden="true">
      <line x1="10" y1="0" x2="10" y2="30" stroke={color} strokeWidth="2" />
      <path d="M4 28l6 8 6-8" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WorkflowNode({ step, stepNumber, animationDelay, isVisible, theme }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.625rem',
        width: '160px',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${animationDelay}s, transform 0.5s ease ${animationDelay}s`,
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
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          position: 'relative',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            left: '-8px',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: theme.accent || '#14b8a6',
            color: '#fff',
            fontSize: '0.6875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${theme.background}`,
          }}
        >
          {stepNumber}
        </div>
        <StepIcon type={step.icon} color={theme.accent || '#14b8a6'} />
      </div>
      <p
        style={{
          fontSize: '0.875rem',
          color: theme.text,
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
  const row2 = workflowSteps.slice(4, 8).reverse(); // right to left display

  const arrowColor = theme.textMuted || 'rgba(0, 0, 0, 0.3)';

  return (
    <div ref={sectionRef} role="list" aria-label="8-step workflow diagram">
      {/* Desktop Layout */}
      <div className="workflow-desktop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        {/* Row 1: Left to Right (steps 1-4) */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          {row1.map((step, i) => (
            <div key={i} role="listitem" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <WorkflowNode
                step={step}
                stepNumber={i + 1}
                animationDelay={i * 0.12}
                isVisible={isVisible}
                theme={theme}
              />
              {i < row1.length - 1 && (
                <div style={{ paddingTop: '28px', opacity: isVisible ? 1 : 0, transition: `opacity 0.5s ease ${(i + 0.5) * 0.12}s` }}>
                  <ArrowRight color={arrowColor} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Connector: Row 1 to Row 2 — invisible spacer row for pixel-perfect alignment */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '160px' }} />
              <div style={{ width: '40px' }} />
            </div>
          ))}
          <div
            style={{
              width: '160px',
              display: 'flex',
              justifyContent: 'center',
              opacity: isVisible ? 1 : 0,
              transition: `opacity 0.5s ease ${4 * 0.12}s`,
            }}
          >
            <ArrowDown color={arrowColor} />
          </div>
        </div>

        {/* Row 2: Right to Left (steps 5-8, displayed as 8,7,6,5 left-to-right) */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          {row2.map((step, i) => {
            // row2 = [step8, step7, step6, step5] (reversed)
            // Animation flows right-to-left: step5 first (i=3), step8 last (i=0)
            const actualStepNumber = 8 - i; // step8=i0, step7=i1, step6=i2, step5=i3
            const animDelay = (5 + (3 - i)) * 0.12; // step5 animates first after down arrow

            return (
              <div key={i} role="listitem" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <WorkflowNode
                  step={step}
                  stepNumber={actualStepNumber}
                  animationDelay={animDelay}
                  isVisible={isVisible}
                  theme={theme}
                />
                {i < row2.length - 1 && (
                  <div style={{ paddingTop: '28px', opacity: isVisible ? 1 : 0, transition: `opacity 0.5s ease ${(5 + (2.5 - i)) * 0.12}s` }}>
                    <ArrowLeft color={arrowColor} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Layout: Vertical */}
      <div className="workflow-mobile" style={{ display: 'none', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        {workflowSteps.map((step, i) => (
          <div key={i} role="listitem" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <WorkflowNode
              step={step}
              stepNumber={i + 1}
              animationDelay={i * 0.1}
              isVisible={isVisible}
              theme={theme}
            />
            {i < workflowSteps.length - 1 && (
              <div style={{ padding: '0.5rem 0', opacity: isVisible ? 1 : 0, transition: `opacity 0.5s ease ${(i + 0.5) * 0.1}s` }}>
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
