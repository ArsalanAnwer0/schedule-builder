import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function SearchIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

const MAIN_APP_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://schedule-builder.xyz')

export default function Layout({ children }) {
  const { user, loading, login, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        backgroundColor: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Left: Logo + Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link
              to="/"
              style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'rgba(0, 0, 0, 0.87)',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              Schedule Builder Forum
            </Link>

            {/* Desktop nav */}
            <nav className="desktop-only" style={{ display: 'flex', gap: '1rem' }}>
              <a
                href={MAIN_APP_URL}
                style={{
                  fontSize: '0.8125rem',
                  color: 'rgba(0, 0, 0, 0.5)',
                  transition: 'color 0.15s',
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#14b8a6'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.5)'}
              >
                Main Site
              </a>
            </nav>
          </div>

          {/* Right: Search + Auth + Mobile toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Search icon */}
            <button
              onClick={() => navigate('/?search=1')}
              className="btn-press"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.375rem',
                color: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s',
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.7)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.45)'}
              title="Search topics"
            >
              <SearchIcon size={18} />
            </button>

            {/* Desktop auth */}
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {loading ? (
                <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
              ) : user ? (
                <>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#14b8a6',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                  }}>
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span style={{ color: 'rgba(0, 0, 0, 0.6)', fontSize: '0.8125rem' }}>
                    {user.name}
                  </span>
                  <button
                    onClick={logout}
                    className="btn-press"
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'transparent',
                      color: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(0, 0, 0, 0.15)',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.3)'
                      e.currentTarget.style.color = 'rgba(0, 0, 0, 0.7)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)'
                      e.currentTarget.style.color = 'rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={login}
                  className="btn-press"
                  style={{
                    padding: '0.375rem 1rem',
                    backgroundColor: '#14b8a6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#14b8a6'}
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="mobile-only btn-press"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{
                display: 'block',
                width: '20px',
                height: '2px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                transition: 'all 0.2s',
                transform: mobileMenuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
              }} />
              <span style={{
                display: 'block',
                width: '20px',
                height: '2px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                transition: 'all 0.2s',
                opacity: mobileMenuOpen ? 0 : 1,
              }} />
              <span style={{
                display: 'block',
                width: '20px',
                height: '2px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                transition: 'all 0.2s',
                transform: mobileMenuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
              }} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div style={{
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            padding: '0.75rem 1.5rem 1rem',
            backgroundColor: '#ffffff',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href={MAIN_APP_URL}
                style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)', padding: '0.25rem 0' }}
              >
                Main Site
              </a>
              {loading ? null : user ? (
                <>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.6)', padding: '0.25rem 0' }}>
                    Signed in as {user.name}
                  </div>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.6)',
                      cursor: 'pointer',
                      padding: '0.25rem 0',
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { login(); setMobileMenuOpen(false); }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#14b8a6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    width: 'fit-content',
                  }}
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main style={{ minHeight: 'calc(100vh - 56px - 80px)' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        padding: '1.5rem',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'rgba(0, 0, 0, 0.4)',
        }}>
          <span>Schedule Builder Forum</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a
              href={MAIN_APP_URL}
              style={{ color: 'rgba(0, 0, 0, 0.4)', transition: 'color 0.15s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.6)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.4)'}
            >
              Home
            </a>
            <Link
              to="/"
              style={{ color: 'rgba(0, 0, 0, 0.4)', transition: 'color 0.15s' }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.6)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.4)'}
            >
              Categories
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
