import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: '4rem',
        fontWeight: '600',
        color: 'rgba(0, 0, 0, 0.2)',
        marginBottom: '1rem',
        fontFamily: 'Georgia, serif',
      }}>
        404
      </h1>
      <p style={{
        fontSize: '1.25rem',
        color: 'rgba(0, 0, 0, 0.6)',
        marginBottom: '2rem',
      }}>
        Page not found
      </p>
      <Link
        to="/"
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#14b8a6',
          color: '#ffffff',
          borderRadius: '8px',
          fontSize: '0.9375rem',
          fontWeight: '500',
          transition: 'background 0.2s',
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#14b8a6'}
      >
        Back to Forum
      </Link>
    </div>
  )
}
