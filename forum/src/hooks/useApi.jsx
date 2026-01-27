// API utility for making requests to the main app

const getApiUrl = () => {
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

export async function api(endpoint, options = {}) {
  const baseUrl = getApiUrl()
  const url = `${baseUrl}${endpoint}`

  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(url, config)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

export function useApi() {
  return {
    get: (endpoint) => api(endpoint),
    post: (endpoint, body) => api(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => api(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => api(endpoint, { method: 'DELETE' }),
  }
}
