import { useState, useEffect, createContext, useContext } from 'react'

const AuthContext = createContext(null)

// Get the main app URL based on environment
const getMainAppUrl = () => {
  // Use environment variable if set (production builds)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // Local development
  if (import.meta.env.DEV) {
    return 'http://localhost:3000'
  }
  // Fallback: derive from current hostname
  const hostname = window.location.hostname
  if (hostname.startsWith('forum.')) {
    return `https://${hostname.replace('forum.', '')}`
  }
  return ''
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const mainAppUrl = getMainAppUrl()
      const response = await fetch(`${mainAppUrl}/api/auth/session`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user || null)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    const mainAppUrl = getMainAppUrl()
    const returnUrl = window.location.href
    window.location.href = `${mainAppUrl}/login?redirect=${encodeURIComponent(returnUrl)}`
  }

  const logout = async () => {
    try {
      const mainAppUrl = getMainAppUrl()
      await fetch(`${mainAppUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
