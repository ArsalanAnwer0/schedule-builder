import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../hooks/useApi'
import MarkdownEditor from '../components/MarkdownEditor'

export default function NewTopicPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading, login } = useAuth()

  const [categories, setCategories] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [tags, setTags] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      login()
    }
  }, [authLoading, user])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await api('/api/forum/categories')
      setCategories(data.categories || [])
      if (data.categories && data.categories.length > 0) {
        setCategoryId(data.categories[0]._id)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters')
      return
    }

    if (content.trim().length < 10) {
      setError('Content must be at least 10 characters')
      return
    }

    if (!categoryId) {
      setError('Please select a category')
      return
    }

    setSubmitting(true)

    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t)

      const data = await api('/api/forum/topics', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          categoryId,
          tags: tagsArray,
        }),
      })

      navigate(`/${data.topic.categoryId.slug}/${data.topic._id}`)
    } catch (error) {
      setError(error.message)
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <div style={{ color: 'rgba(0, 0, 0, 0.65)' }}>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <div style={{ color: 'rgba(0, 0, 0, 0.65)' }}>Redirecting to sign in...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '600',
          color: 'rgba(0, 0, 0, 0.87)',
          marginBottom: '2rem',
          fontFamily: 'Georgia, serif',
          letterSpacing: '-0.02em'
        }}>
          Create New Topic
        </h1>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#dc2626',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Category */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'rgba(0, 0, 0, 0.65)', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#ffffff',
                color: 'rgba(0, 0, 0, 0.87)',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#14b8a6'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'rgba(0, 0, 0, 0.65)', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question or topic?"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#ffffff',
                color: 'rgba(0, 0, 0, 0.87)',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#14b8a6'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Content */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: 'rgba(0, 0, 0, 0.65)', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Content *
            </label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Provide details, context, or code examples..."
            />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'rgba(0, 0, 0, 0.65)', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="bug, feature, mobile, etc."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: '#ffffff',
                color: 'rgba(0, 0, 0, 0.87)',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#14b8a6'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: submitting ? 'rgba(20, 184, 166, 0.5)' : '#14b8a6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#0d9488' }}
              onMouseOut={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#14b8a6' }}
            >
              {submitting ? 'Creating...' : 'Create Topic'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: 'transparent',
                color: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
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
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
