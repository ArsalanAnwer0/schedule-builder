import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../hooks/useApi'
import MarkdownEditor from '../components/MarkdownEditor'

const CATEGORY_COLORS = [
  '#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
]

function getCategoryColor(index) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
}

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

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#ffffff',
    color: 'rgba(0, 0, 0, 0.87)',
    border: '1px solid rgba(0, 0, 0, 0.15)',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  }

  const handleFocus = (e) => {
    e.currentTarget.style.borderColor = '#14b8a6'
    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(20, 184, 166, 0.1)'
  }

  const handleBlur = (e) => {
    e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)'
    e.currentTarget.style.boxShadow = 'none'
  }

  if (authLoading || loading) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <div className="spinner spinner-lg" />
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
        color: 'rgba(0, 0, 0, 0.45)',
        fontSize: '0.8125rem',
      }}>
        Redirecting to sign in...
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to="/"
            style={{ fontSize: '0.8125rem', color: 'rgba(0, 0, 0, 0.45)', transition: 'color 0.15s' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#14b8a6'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.45)'}
          >
            Forum
          </Link>
          <span style={{ color: 'rgba(0, 0, 0, 0.3)', margin: '0 0.5rem', fontSize: '0.75rem' }}>/</span>
          <span style={{ fontSize: '0.8125rem', color: 'rgba(0, 0, 0, 0.55)' }}>
            New Topic
          </span>
        </div>

        <h1 style={{
          fontSize: '1.375rem',
          fontWeight: '600',
          color: 'rgba(0, 0, 0, 0.87)',
          marginBottom: '1.5rem',
        }}>
          Create New Topic
        </h1>

        {error && (
          <div style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            color: '#dc2626',
            borderRadius: '6px',
            marginBottom: '1rem',
            fontSize: '0.8125rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Category */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(0, 0, 0, 0.55)',
              marginBottom: '0.375rem',
              fontWeight: '500',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}>
              Category
            </label>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {categories.map((cat, idx) => {
                const isSelected = categoryId === cat._id
                const color = getCategoryColor(idx)
                return (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => setCategoryId(cat._id)}
                    className="btn-press"
                    style={{
                      padding: '0.3125rem 0.75rem',
                      backgroundColor: isSelected ? color : 'transparent',
                      color: isSelected ? '#fff' : 'rgba(0, 0, 0, 0.55)',
                      border: isSelected ? 'none' : '1px solid rgba(0, 0, 0, 0.15)',
                      borderRadius: '100px',
                      fontSize: '0.8125rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(0, 0, 0, 0.55)',
              marginBottom: '0.375rem',
              fontWeight: '500',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question or topic?"
              required
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Content */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(0, 0, 0, 0.55)',
              marginBottom: '0.375rem',
              fontWeight: '500',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}>
              Content
            </label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Provide details, context, or code examples..."
            />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: 'rgba(0, 0, 0, 0.55)',
              marginBottom: '0.375rem',
              fontWeight: '500',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}>
              Tags
              <span style={{ fontWeight: '400', textTransform: 'none', letterSpacing: '0', marginLeft: '0.375rem', color: 'rgba(0, 0, 0, 0.35)' }}>
                comma-separated
              </span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="bug, feature, mobile"
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="submit"
              disabled={submitting}
              className="btn-press"
              style={{
                padding: '0.5rem 1.25rem',
                backgroundColor: submitting ? 'rgba(20, 184, 166, 0.5)' : '#14b8a6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                fontWeight: '500',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseOver={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#0d9488' }}
              onMouseOut={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#14b8a6' }}
            >
              {submitting ? 'Creating...' : 'Create Topic'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-press"
              style={{
                padding: '0.5rem 1.25rem',
                backgroundColor: 'transparent',
                color: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(0, 0, 0, 0.15)',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                fontWeight: '500',
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
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
