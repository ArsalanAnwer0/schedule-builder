import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout({ children }) {
  const { user, loading, login, logout } = useAuth()

  const getMainAppUrl = () => {
    if (import.meta.env.DEV) {
      return 'http://localhost:3000'
    }
    const hostname = window.location.hostname
    if (hostname.startsWith('forum.')) {
      return `https://${hostname.replace('forum.', '')}`
    }
    return ''
  }

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
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link
              to="/"
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'rgba(0, 0, 0, 0.87)',
                fontFamily: 'Georgia, serif',
                letterSpacing: '-0.02em',
              }}
            >
              Schedule Builder Forum
            </Link>
            <nav style={{ display: 'flex', gap: '1.5rem' }}>
              <a
                href={getMainAppUrl()}
                style={{
                  fontSize: '0.9375rem',
                  color: 'rgba(0, 0, 0, 0.6)',
                  transition: 'color 0.15s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#14b8a6'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.6)'}
              >
                Main Site
              </a>
              <a
                href={`${getMainAppUrl().replace('://', '://docs.').replace(/^https:\/\//, 'https://docs.')}`}
                style={{
                  fontSize: '0.9375rem',
                  color: 'rgba(0, 0, 0, 0.6)',
                  transition: 'color 0.15s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#14b8a6'}
                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.6)'}
              >
                Docs
              </a>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {loading ? (
              <span style={{ color: 'rgba(0, 0, 0, 0.5)', fontSize: '0.875rem' }}>...</span>
            ) : user ? (
              <>
                <span style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: '0.875rem' }}>
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    color: 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={login}
                style={{
                  padding: '0.5rem 1.25rem',
                  backgroundColor: '#14b8a6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#14b8a6'}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        padding: '2rem',
        marginTop: '4rem',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          color: 'rgba(0, 0, 0, 0.5)',
          fontSize: '0.875rem',
        }}>
          Schedule Builder Forum
        </div>
      </footer>
    </div>
  )
}
