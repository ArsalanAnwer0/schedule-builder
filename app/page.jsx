'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ScreenshotGrid from './components/ScreenshotCarousel';
import SplashScreen from './components/SplashScreen';
import FadeInSection from './components/FadeInSection';
import HeroAnimation from './components/HeroAnimation';

export default function LandingPage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', message: '', type: 'feedback' });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState('');
  const [waitlistError, setWaitlistError] = useState('');

  // Screenshot data for Admin Portal
  const adminScreenshots = [
    {
      image: '/screenshots/admin-1.png',
      alt: 'Admin Dashboard Overview',
      caption: 'Manage students, track availability submissions, and generate optimal schedules from a centralized dashboard.'
    },
    {
      image: '/screenshots/admin-2.png',
      alt: 'Admin Invite Interface',
      caption: 'Invite and manage multiple administrators with different permission levels to collaborate on schedule management.'
    },
    {
      image: '/screenshots/admin-3.png',
      alt: 'Student Management',
      caption: 'Easily add students, request availability, and monitor submission status in real-time.'
    }
  ];

  // Screenshot data for Student Portal
  const studentScreenshots = [
    {
      image: '/screenshots/student-1.png',
      alt: 'Student Dashboard',
      caption: 'Students receive notifications and can quickly access their availability submission form from a clean, intuitive dashboard.'
    },
    {
      image: '/screenshots/student-2.png',
      alt: 'Availability Grid',
      caption: 'Submit available hours using an interactive weekly grid. Students can easily select time blocks and add notes.'
    },
    {
      image: '/screenshots/student-3.png',
      alt: 'Availability Submission',
      caption: 'Students can easily submit their available hours using an intuitive interface with time selection and notes.'
    }
  ];

  // Check if user has already seen intro in this session
  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  };

  // Theme colors - Light mode
  const theme = {
    background: '#ffffff',
    text: '#000000',
    textSecondary: 'rgba(0, 0, 0, 0.65)',
    textMuted: 'rgba(0, 0, 0, 0.4)',
    navBackground: 'rgba(255, 255, 255, 0.95)',
    border: 'rgba(0, 0, 0, 0.08)',
    cardBackground: '#f9fafb',
    accent: '#14b8a6'
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackSubmitting(true);
    setFeedbackError('');
    setFeedbackSuccess('');

    setTimeout(() => {
      setFeedbackSuccess('Thank you for your feedback! We\'ll get back to you soon.');
      setFeedbackForm({ name: '', email: '', message: '', type: 'feedback' });
      setFeedbackSubmitting(false);
      setTimeout(() => {
        setFeedbackOpen(false);
        setFeedbackSuccess('');
      }, 2000);
    }, 1000);
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    setWaitlistSubmitting(true);
    setWaitlistError('');
    setWaitlistSuccess('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(waitlistEmail)) {
      setWaitlistError('Please enter a valid email address');
      setWaitlistSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/waitlist/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setWaitlistError(data.error || 'Failed to join waitlist');
        setWaitlistSubmitting(false);
        return;
      }

      setWaitlistSuccess(data.message || 'Successfully joined the waitlist!');
      setWaitlistEmail('');
      setWaitlistSubmitting(false);
    } catch (err) {
      setWaitlistError('Something went wrong. Please try again.');
      setWaitlistSubmitting(false);
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{
      backgroundColor: theme.background,
      minHeight: "100vh",
      position: "relative",
    }}>
      {/* Splash Screen - Fades in and out */}
      {showIntro && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}

      {/* Homepage content - only show after intro completes */}
      {!showIntro && (
        <>
      {/* Fixed Navigation */}
      <nav className="nav-padding" style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: theme.navBackground,
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${theme.border}`,
        padding: "1rem 2rem",
      }}>
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          {/* Logo/Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2.5">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            <span style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              color: theme.text,
              letterSpacing: "-0.01em",
              transition: "color 0.6s ease"
            }}>Schedule Builder</span>
          </div>

          {/* Desktop Navigation */}
          <div className="desktop-nav" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <button
              onClick={() => scrollToSection('how-it-works')}
              style={{
                background: "none",
                border: "none",
                color: theme.textSecondary,
                fontSize: "0.9375rem",
                cursor: "pointer",
                padding: "0.5rem 0",
                fontWeight: "400",
                transition: "color 0.6s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.color = theme.text}
              onMouseOut={(e) => e.currentTarget.style.color = theme.textSecondary}
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              style={{
                background: "none",
                border: "none",
                color: theme.textSecondary,
                fontSize: "0.9375rem",
                cursor: "pointer",
                padding: "0.5rem 0",
                fontWeight: "400",
                transition: "color 0.6s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.color = theme.text}
              onMouseOut={(e) => e.currentTarget.style.color = theme.textSecondary}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              style={{
                background: "none",
                border: "none",
                color: theme.textSecondary,
                fontSize: "0.9375rem",
                cursor: "pointer",
                padding: "0.5rem 0",
                fontWeight: "400",
                transition: "color 0.6s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.color = theme.text}
              onMouseOut={(e) => e.currentTarget.style.color = theme.textSecondary}
            >
              FAQ
            </button>
            <button
              onClick={() => router.push('/forum')}
              style={{
                background: "none",
                border: "none",
                color: theme.textSecondary,
                fontSize: "0.9375rem",
                cursor: "pointer",
                padding: "0.5rem 0",
                fontWeight: "400",
                transition: "color 0.6s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.color = theme.text}
              onMouseOut={(e) => e.currentTarget.style.color = theme.textSecondary}
            >
              Forum
            </button>
            <button
              onClick={() => router.push('/docs')}
              style={{
                background: "none",
                border: "none",
                color: theme.textSecondary,
                fontSize: "0.9375rem",
                cursor: "pointer",
                padding: "0.5rem 0",
                fontWeight: "400",
                transition: "color 0.6s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.color = theme.text}
              onMouseOut={(e) => e.currentTarget.style.color = theme.textSecondary}
            >
              Docs
            </button>
            <button
              onClick={() => router.push('/login')}
              style={{
                background: "none",
                border: "none",
                color: theme.textSecondary,
                fontSize: "0.9375rem",
                cursor: "pointer",
                padding: "0.5rem 0",
                fontWeight: "400",
                transition: "color 0.6s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.color = theme.text}
              onMouseOut={(e) => e.currentTarget.style.color = theme.textSecondary}
            >
              Login
            </button>
            <button
              onClick={() => router.push('/register')}
              style={{
                padding: "0.5rem 1.25rem",
                background: theme.accent,
                color: theme.text,
                border: "none",
                borderRadius: "6px",
                fontSize: "0.9375rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#0d9488"}
              onMouseOut={(e) => e.currentTarget.style.background = theme.accent}
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: theme.text,
              cursor: "pointer",
              padding: "0.5rem",
              transition: "color 0.6s ease"
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu" style={{
          position: "fixed",
          top: "64px",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.background,
          zIndex: 40,
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
            }}>
          <button
            onClick={() => {
              scrollToSection('how-it-works');
              setMobileMenuOpen(false);
            }}
            style={{
              background: "none",
              border: "none",
              color: theme.textSecondary,
              fontSize: "1.125rem",
              cursor: "pointer",
              padding: "1rem 0",
              textAlign: "left",
              transition: "color 0.6s ease"
            }}
          >
            How it works
          </button>
          <button
            onClick={() => {
              scrollToSection('features');
              setMobileMenuOpen(false);
            }}
            style={{
              background: "none",
              border: "none",
              color: theme.textSecondary,
              fontSize: "1.125rem",
              cursor: "pointer",
              padding: "1rem 0",
              textAlign: "left",
              transition: "color 0.6s ease"
            }}
          >
            Features
          </button>
          <button
            onClick={() => {
              scrollToSection('faq');
              setMobileMenuOpen(false);
            }}
            style={{
              background: "none",
              border: "none",
              color: theme.textSecondary,
              fontSize: "1.125rem",
              cursor: "pointer",
              padding: "1rem 0",
              textAlign: "left",
              transition: "color 0.6s ease"
            }}
          >
            FAQ
          </button>
          <button
            onClick={() => {
              router.push('/forum');
              setMobileMenuOpen(false);
            }}
            style={{
              background: "none",
              border: "none",
              color: theme.textSecondary,
              fontSize: "1.125rem",
              cursor: "pointer",
              padding: "1rem 0",
              textAlign: "left",
              transition: "color 0.6s ease"
            }}
          >
            Forum
          </button>
          <button
            onClick={() => {
              router.push('/docs');
              setMobileMenuOpen(false);
            }}
            style={{
              background: "none",
              border: "none",
              color: theme.textSecondary,
              fontSize: "1.125rem",
              cursor: "pointer",
              padding: "1rem 0",
              textAlign: "left",
              transition: "color 0.6s ease"
            }}
          >
            Docs
          </button>
          <button
            onClick={() => {
              router.push('/login');
              setMobileMenuOpen(false);
            }}
            style={{
              background: "none",
              border: "none",
              color: theme.textSecondary,
              fontSize: "1.125rem",
              cursor: "pointer",
              padding: "1rem 0",
              textAlign: "left",
              transition: "color 0.6s ease"
            }}
          >
            Login
          </button>
          <button
            onClick={() => {
              router.push('/register');
              setMobileMenuOpen(false);
            }}
            style={{
              padding: "0.875rem 1.5rem",
              background: theme.accent,
              color: theme.text,
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              marginTop: "1rem"
            }}
          >
            Get Started
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-section" style={{
        textAlign: "center",
        maxWidth: "1200px",
        margin: "0 auto",
        position: "relative"
      }}>
        <HeroAnimation delay={100}>
          {/* Beta Badge */}
          <div style={{
            display: "inline-block",
            padding: "0.5rem 1rem",
            backgroundColor: "rgba(20, 184, 166, 0.1)",
            border: "1px solid rgba(20, 184, 166, 0.3)",
            borderRadius: "20px",
            color: "#14b8a6",
            fontSize: "0.8125rem",
            fontWeight: "500",
            marginBottom: "2rem",
            letterSpacing: "0.05em"
          }}>
            Now in Beta
          </div>

          <h1 className="hero-title" style={{
            fontWeight: "400",
            color: theme.text,
            marginBottom: "1.5rem",
            letterSpacing: "-0.02em",
            fontFamily: "Georgia, 'Times New Roman', serif",
            transition: "color 0.6s ease"
          }}>
            Scheduling office hours is broken.
            <br />
            We fixed it.
          </h1>

          <p style={{
            fontSize: "1.25rem",
            color: theme.textSecondary,
            marginBottom: "3rem",
            maxWidth: "750px",
            margin: "2rem auto 3rem auto",
            lineHeight: "1.7",
            fontWeight: "300",
            transition: "color 0.6s ease"
          }}>
            Collect availability, create schedules, and manage changes automatically without the chaos.
          </p>
        </HeroAnimation>

      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section-padding" style={{
        maxWidth: "1200px",
        margin: "0 auto",
        paddingTop: "8rem"
      }}>
        <FadeInSection>
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <h2 className="section-title" style={{
              fontWeight: "400",
              color: theme.text,
              marginBottom: "1rem",
              fontFamily: "Georgia, 'Times New Roman', serif",
              transition: "color 0.6s ease"
            }}>
              How it works
            </h2>
            <p style={{
              fontSize: "1.125rem",
              color: theme.textMuted,
              fontWeight: "300",
              transition: "color 0.6s ease"
            }}>
              Three steps to transform your scheduling workflow
            </p>
          </div>
        </FadeInSection>

        <div className="grid-3-cols" style={{
          display: "grid",
          gap: "2rem"
        }}>
          {/* Step 1 */}
          <div style={{
            padding: "3rem 2rem",
            background: "rgba(0, 0, 0, 0.03)",
            borderRadius: "12px",
            border: `1px solid ${theme.border}`,
            position: "relative"
          }}>
            <div className="step-number" style={{
              fontWeight: "300",
              color: "#14b8a6",
              marginBottom: "2rem",
              fontFamily: "monospace"
            }}>
              01
            </div>
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: theme.text,
              marginBottom: "1rem"
            }}>
              Admin requests availability
            </h3>
            <p style={{
              fontSize: "1rem",
              color: theme.textSecondary,
                lineHeight: "1.7",
              fontWeight: "300"
            }}>
              Add your students and send automated availability requests. Students receive email invitations instantly.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{
            padding: "3rem 2rem",
            background: "rgba(0, 0, 0, 0.03)",
            borderRadius: "12px",
            border: `1px solid ${theme.border}`,
            position: "relative"
          }}>
            <div className="step-number" style={{
              fontWeight: "300",
              color: "#14b8a6",
              marginBottom: "2rem",
              fontFamily: "monospace"
            }}>
              02
            </div>
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: theme.text,
              marginBottom: "1rem"
            }}>
              Students submit availability
            </h3>
            <p style={{
              fontSize: "1rem",
              color: theme.textSecondary,
                lineHeight: "1.7",
              fontWeight: "300"
            }}>
              Students fill out a simple form with their available hours. No back-and-forth emails or phone calls needed.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{
            padding: "3rem 2rem",
            background: "rgba(0, 0, 0, 0.03)",
            borderRadius: "12px",
            border: `1px solid ${theme.border}`,
            position: "relative"
          }}>
            <div className="step-number" style={{
              fontWeight: "300",
              color: "#14b8a6",
              marginBottom: "2rem",
              fontFamily: "monospace"
            }}>
              03
            </div>
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: theme.text,
              marginBottom: "1rem"
            }}>
              Tool generates schedule
            </h3>
            <p style={{
              fontSize: "1rem",
              color: theme.textSecondary,
                lineHeight: "1.7",
              fontWeight: "300"
            }}>
              Our algorithm creates conflict-free schedules in seconds. Review, adjust, and share with your team.
            </p>
          </div>
        </div>
      </section>

      {/* Screenshot Carousel Section */}
      <section className="section-padding" style={{
        maxWidth: "1200px",
        margin: "0 auto",
        paddingTop: "8rem",
        paddingBottom: "8rem"
      }}>
        <FadeInSection>
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <h2 className="section-title" style={{
              fontWeight: "400",
              color: theme.text,
              marginBottom: "1rem",
              fontFamily: "Georgia, 'Times New Roman', serif"
            }}>
              See it in action
            </h2>
            <p style={{
              fontSize: "1.125rem",
              color: theme.textMuted,
              fontWeight: "300"
            }}>
              Explore the admin and student interfaces
            </p>
          </div>
        </FadeInSection>

        {/* Admin Portal Screenshots */}
        <FadeInSection delay={100}>
          <div style={{ marginBottom: "8rem" }}>
            <ScreenshotGrid screenshots={adminScreenshots} sectionTitle="Admin Portal" />
          </div>
        </FadeInSection>

        {/* Student Portal Screenshots */}
        <FadeInSection delay={200}>
          <div style={{ marginBottom: "4rem" }}>
            <ScreenshotGrid screenshots={studentScreenshots} sectionTitle="Student Portal" />
          </div>
        </FadeInSection>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding" style={{
        backgroundColor: "rgba(20, 184, 166, 0.02)"
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <FadeInSection>
            <div style={{ textAlign: "center", marginBottom: "5rem" }}>
              <h2 className="section-title" style={{
                fontWeight: "400",
                color: theme.text,
                marginBottom: "1rem",
                fontFamily: "Georgia, 'Times New Roman', serif"
              }}>
                Everything you need
              </h2>
              <p style={{
                fontSize: "1.125rem",
                color: theme.textMuted,
                fontWeight: "300"
              }}>
                Comprehensive tools designed for modern scheduling
              </p>
            </div>
          </FadeInSection>

          <div className="grid-3-cols" style={{
            display: "grid",
            gap: "2rem"
          }}>
            {/* Feature 1 */}
            <div style={{
              padding: "2rem",
              background: "rgba(0, 0, 0, 0.03)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "rgba(20, 184, 166, 0.15)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: theme.text,
                marginBottom: "0.75rem"
              }}>
                Flexible authentication
              </h3>
              <p style={{
                fontSize: "0.9375rem",
                color: theme.textSecondary,
                  lineHeight: "1.7",
                fontWeight: "300"
              }}>
                Choose passwordless email verification or secure password-based login. Add two-factor authentication for extra security. Includes forgot password recovery and email verification.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              padding: "2rem",
              background: "rgba(0, 0, 0, 0.03)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "rgba(20, 184, 166, 0.15)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: theme.text,
                marginBottom: "0.75rem"
              }}>
                Multi-admin support
              </h3>
              <p style={{
                fontSize: "0.9375rem",
                color: theme.textSecondary,
                  lineHeight: "1.7",
                fontWeight: "300"
              }}>
                Primary admins can invite secondary admins to help manage scheduling. Perfect for teams with multiple managers.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              padding: "2rem",
              background: "rgba(0, 0, 0, 0.03)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "rgba(20, 184, 166, 0.15)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
              </div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: theme.text,
                marginBottom: "0.75rem"
              }}>
                Automated email invitations
              </h3>
              <p style={{
                fontSize: "0.9375rem",
                color: theme.textSecondary,
                  lineHeight: "1.7",
                fontWeight: "300"
              }}>
                Students automatically receive email invitations when added. Support for both primary and secondary email addresses.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{
              padding: "2rem",
              background: "rgba(0, 0, 0, 0.03)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "rgba(20, 184, 166, 0.15)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: theme.text,
                marginBottom: "0.75rem"
              }}>
                Simple availability form
              </h3>
              <p style={{
                fontSize: "0.9375rem",
                color: theme.textSecondary,
                  lineHeight: "1.7",
                fontWeight: "300"
              }}>
                Students select their available hours on an intuitive weekly calendar. Takes less than 2 minutes to complete.
              </p>
            </div>

            {/* Feature 5 */}
            <div style={{
              padding: "2rem",
              background: "rgba(0, 0, 0, 0.03)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "rgba(20, 184, 166, 0.15)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: theme.text,
                marginBottom: "0.75rem"
              }}>
                Instant schedule generation
              </h3>
              <p style={{
                fontSize: "0.9375rem",
                color: theme.textSecondary,
                  lineHeight: "1.7",
                fontWeight: "300"
              }}>
                Our algorithm creates balanced, conflict-free schedules in seconds based on student availability. No manual work required.
              </p>
            </div>

            {/* Feature 6 */}
            <div style={{
              padding: "2rem",
              background: "rgba(0, 0, 0, 0.03)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                background: "rgba(20, 184, 166, 0.15)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem"
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </div>
              <h3 style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: theme.text,
                marginBottom: "0.75rem"
              }}>
                Reset and regenerate anytime
              </h3>
              <p style={{
                fontSize: "0.9375rem",
                color: theme.textSecondary,
                  lineHeight: "1.7",
                fontWeight: "300"
              }}>
                Need to make changes? Reset student availability and request new submissions. Generate fresh schedules whenever needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="section-padding" style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "6rem 2rem"
      }}>
        <FadeInSection>
          <div style={{ textAlign: "center" }}>
            {/* Small tagline at top */}
            <div style={{
              fontSize: "0.8125rem",
              fontFamily: "monospace",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: theme.textMuted,
              marginBottom: "1.5rem",
              fontWeight: "400"
            }}>
              Get Early Access
            </div>

            {/* Thin dividing line */}
            <div style={{
              width: "60px",
              height: "1px",
              backgroundColor: theme.border,
              margin: "0 auto 2.5rem auto"
            }} />

            {/* Large headline in serif */}
            <h2 style={{
              fontSize: "3rem",
              fontWeight: "300",
              color: theme.text,
              marginBottom: "3rem",
              fontFamily: "Georgia, 'Times New Roman', serif",
              letterSpacing: "-0.02em",
              lineHeight: "1.2"
            }}>
              Join the Waitlist
            </h2>

          <form onSubmit={handleWaitlistSubmit} style={{
            maxWidth: "500px",
            margin: "0 auto"
          }}>
            {/* Email input with arrow button */}
            <div style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              borderBottom: `2px solid ${theme.border}`,
              paddingBottom: "0.75rem"
            }}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
                disabled={waitlistSubmitting}
                required
                style={{
                  flex: 1,
                  padding: "0.5rem 0",
                  backgroundColor: "transparent",
                  border: "none",
                  color: theme.text,
                  fontSize: "1rem",
                  outline: "none",
                  fontFamily: "inherit"
                }}
              />
              <button
                type="submit"
                disabled={waitlistSubmitting}
                style={{
                  padding: "0.5rem",
                  backgroundColor: "transparent",
                  color: theme.text,
                  border: "none",
                  cursor: waitlistSubmitting ? "not-allowed" : "pointer",
                  fontSize: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: waitlistSubmitting ? 0.5 : 1,
                  transition: "opacity 0.2s"
                }}
                onMouseOver={(e) => {
                  if (!waitlistSubmitting) {
                    e.target.style.opacity = "0.6";
                  }
                }}
                onMouseOut={(e) => {
                  if (!waitlistSubmitting) {
                    e.target.style.opacity = "1";
                  }
                }}
              >
                {waitlistSubmitting ? '...' : '→'}
              </button>
            </div>

            {waitlistSuccess && (
              <div style={{
                marginTop: "1.5rem",
                padding: "1rem",
                color: "#10b981",
                fontSize: "0.875rem",
                textAlign: "center",
                fontFamily: "inherit"
              }}>
                {waitlistSuccess}
              </div>
            )}

            {waitlistError && (
              <div style={{
                marginTop: "1.5rem",
                padding: "1rem",
                color: "#ef4444",
                fontSize: "0.875rem",
                textAlign: "center",
                fontFamily: "inherit"
              }}>
                {waitlistError}
              </div>
            )}
          </form>
          </div>
        </FadeInSection>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section-padding" style={{
        maxWidth: "900px",
        margin: "0 auto"
      }}>
        <FadeInSection>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              backgroundColor: "rgba(20, 184, 166, 0.1)",
              border: "1px solid rgba(20, 184, 166, 0.3)",
              borderRadius: "20px",
              color: "#14b8a6",
              fontSize: "0.75rem",
              fontWeight: "500",
              marginBottom: "2rem",
              letterSpacing: "0.1em"
            }}>
              FAQs
            </div>
            <h2 className="section-title" style={{
              fontWeight: "400",
              color: theme.text,
              marginBottom: "1rem",
              fontFamily: "Georgia, 'Times New Roman', serif"
            }}>
              Got questions?
              <br />
              Here's the answers.
            </h2>
          </div>
        </FadeInSection>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "4rem" }}>
          {[
            { q: "How do admins register and login?", a: "Admins register with their organization name and email. After registration, they receive a verification code via email. Simply enter the code to access your admin portal. You can login anytime using your email - we'll send you a new code each time." },
            { q: "How do students register and login?", a: "Students don't register themselves - admins add them to the system. When an admin adds a student, they automatically receive an email invitation with a login link. Students click the link, enter the verification code from their email, and access their dashboard." },
            { q: "What if a student forgets their password or can't access their account?", a: "Students can request a password reset from the login page. The request is sent to all admins for approval. Once an admin approves it, the student receives a secure link to set a new password. This ensures account security while giving students an easy recovery option." },
            { q: "How does the invite admin feature work?", a: "Primary admins can invite secondary admins to help manage scheduling. Just add their name and email in the Invite Admin section. They'll receive an invitation email and can login immediately. Secondary admins have the same access as primary admins." },
            { q: "How do I add students to my organization?", a: "In your admin portal, use the Add Student section. Enter the student's name, primary email, and optionally a secondary email (like a school email). Click Request Availability, and they'll instantly receive an invitation email to submit their hours." },
            { q: "Can students use multiple email addresses?", a: "Yes! When adding a student, you can provide both a primary and secondary email. Students receive invitations at both addresses and can login using either email - both access the same account and availability." },
            { q: "What happens after students submit availability?", a: "Once students submit their available hours, you'll see their status change to \"Submitted\" in your admin portal. You'll also receive a notification when all students have submitted. You can then generate a schedule using the scheduling tool, which creates a balanced, conflict-free schedule automatically based on all submitted availability." }
          ].map((faq, index) => (
            <div
              key={index}
              style={{
                background: "rgba(0, 0, 0, 0.03)",
                border: `1px solid ${theme.border}`,
                borderRadius: "8px",
                overflow: "hidden"
              }}
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                style={{
                  width: "100%",
                  padding: "1.5rem",
                  background: "none",
                  border: "none",
                  color: theme.text,
                  fontSize: "1.0625rem",
                  fontWeight: "500",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span>{faq.q}</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  style={{
                    transform: expandedFaq === index ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s"
                  }}
                >
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {expandedFaq === index && (
                <div style={{
                  padding: "0 1.5rem 1.5rem 1.5rem",
                  color: theme.textSecondary,
                    fontSize: "0.9375rem",
                  lineHeight: "1.7",
                  fontWeight: "300"
                }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "80px 20px 0"
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {/* Top Section - Link Columns */}
          <div className="footer-columns" style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr",
            gap: "80px",
            marginBottom: "60px"
          }}>

            {/* Brand Column */}
            <div>
              <h3 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: theme.text,
                  marginBottom: "12px",
                letterSpacing: "-0.02em"
              }}>
                Schedule Builder
              </h3>
              <p style={{
                fontSize: "16px",
                color: theme.textMuted,
                fontWeight: "300",
                lineHeight: "1.6",
                margin: 0
              }}>
                Simplify team scheduling
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h4 style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: "20px"
              }}>
                Product
              </h4>
              <nav style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                <button
                  onClick={() => scrollToSection('features')}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.textSecondary,
                      fontSize: "15px",
                    fontWeight: "400",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                    lineHeight: "1.8",
                    transition: "color 0.2s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = "#14b8a6"}
                  onMouseOut={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"}
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.textSecondary,
                      fontSize: "15px",
                    fontWeight: "400",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                    lineHeight: "1.8",
                    transition: "color 0.2s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = "#14b8a6"}
                  onMouseOut={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"}
                >
                  How It Works
                </button>
                <button
                  onClick={() => router.push('/forum')}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.textSecondary,
                      fontSize: "15px",
                    fontWeight: "400",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                    lineHeight: "1.8",
                    transition: "color 0.2s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = "#14b8a6"}
                  onMouseOut={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"}
                >
                  Forum
                </button>
                <button
                  onClick={() => router.push('/docs')}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.textSecondary,
                      fontSize: "15px",
                    fontWeight: "400",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                    lineHeight: "1.8",
                    transition: "color 0.2s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = "#14b8a6"}
                  onMouseOut={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"}
                >
                  Docs
                </button>
              </nav>
            </div>

            {/* Support Column */}
            <div>
              <h4 style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                marginBottom: "20px"
              }}>
                Support
              </h4>
              <nav style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                <button
                  onClick={() => router.push('/contact')}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.textSecondary,
                      fontSize: "15px",
                    fontWeight: "400",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                    lineHeight: "1.8",
                    transition: "color 0.2s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = "#14b8a6"}
                  onMouseOut={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"}
                >
                  Contact
                </button>
                <button
                  onClick={() => scrollToSection('faq')}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.textSecondary,
                      fontSize: "15px",
                    fontWeight: "400",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                    lineHeight: "1.8",
                    transition: "color 0.2s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = "#14b8a6"}
                  onMouseOut={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"}
                >
                  FAQ
                </button>
                <button
                  onClick={() => router.push('/privacy')}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.textSecondary,
                      fontSize: "15px",
                    fontWeight: "400",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                    lineHeight: "1.8",
                    transition: "color 0.2s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = "#14b8a6"}
                  onMouseOut={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"}
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => router.push('/terms')}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.textSecondary,
                      fontSize: "15px",
                    fontWeight: "400",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                    lineHeight: "1.8",
                    transition: "color 0.2s ease"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = "#14b8a6"}
                  onMouseOut={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"}
                >
                  Terms of Use
                </button>
              </nav>
            </div>

          </div>

          {/* Divider */}
          <div style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "30px"
          }} />

          {/* Bottom Bar */}
          <div className="footer-bottom" style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "30px"
          }}>
            <p style={{
              fontSize: "14px",
              color: theme.textMuted,
              fontWeight: "300",
              margin: 0
            }}>
              © 2026 Schedule Builder
            </p>

            {/* Social Links */}
            <div style={{
              display: "flex",
              gap: "24px",
              alignItems: "center"
            }}>
              <a
                href="https://github.com/ArsalanAnwer0/schedule-builder"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: theme.textMuted,
                  fontSize: "14px",
                  textDecoration: "none",
                  fontWeight: "400",
                  transition: "color 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
                onMouseOver={(e) => e.currentTarget.style.color = "#14b8a6"}
                onMouseOut={(e) => e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)"}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* Feedback Modal */}
      {feedbackOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "2.5rem",
            maxWidth: "500px",
            width: "90%",
            border: `1px solid ${theme.border}`,
              }}>
            <h2 style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: theme.text,
              marginBottom: "1.5rem"
            }}>
              Send us feedback
            </h2>

            <form onSubmit={handleFeedbackSubmit}>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: theme.text,
                    marginBottom: "0.5rem"
                }}>
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={feedbackForm.name}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    backgroundColor: "#f9fafb",
                    border: `1px solid ${theme.border}`,
                    borderRadius: "6px",
                    color: theme.text,
                    fontSize: "1rem"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: theme.text,
                    marginBottom: "0.5rem"
                }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={feedbackForm.email}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    backgroundColor: "#f9fafb",
                    border: `1px solid ${theme.border}`,
                    borderRadius: "6px",
                    color: theme.text,
                    fontSize: "1rem"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: theme.text,
                    marginBottom: "0.5rem"
                }}>
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    backgroundColor: "#f9fafb",
                    border: `1px solid ${theme.border}`,
                    borderRadius: "6px",
                    color: theme.text,
                    fontSize: "1rem",
                    resize: "vertical"
                  }}
                />
              </div>

              {feedbackSuccess && (
                <div style={{
                  padding: "0.75rem",
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  borderRadius: "6px",
                  color: "#22c55e",
                  marginBottom: "1.5rem",
                  fontSize: "0.875rem"
                }}>
                  {feedbackSuccess}
                </div>
              )}

              {feedbackError && (
                <div style={{
                  padding: "0.75rem",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "6px",
                  color: "#ef4444",
                  marginBottom: "1.5rem",
                  fontSize: "0.875rem"
                }}>
                  {feedbackError}
                </div>
              )}

              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(false)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "transparent",
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#14b8a6",
                    color: theme.text,
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    cursor: feedbackSubmitting ? "not-allowed" : "pointer",
                    opacity: feedbackSubmitting ? 0.5 : 1
                  }}
                >
                  {feedbackSubmitting ? 'Sending...' : 'Send feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
