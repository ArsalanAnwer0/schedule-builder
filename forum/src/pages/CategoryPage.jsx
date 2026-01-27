import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../hooks/useApi'

export default function CategoryPage() {
  const { categorySlug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [category, setCategory] = useState(null)
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('latest')

  useEffect(() => {
    fetchCategoryAndTopics()
  }, [categorySlug, filter])

  const fetchCategoryAndTopics = async () => {
    try {
      // Fetch categories to find the one with matching slug
      const categoriesData = await api('/api/forum/categories')
      const foundCategory = categoriesData.categories.find(c => c.slug === categorySlug)

      if (!foundCategory) {
        navigate('/')
        return
      }

      setCategory(foundCategory)

      // Fetch topics for this category
      const queryParams = new URLSearchParams({
        category: foundCategory._id,
        sort: filter,
      })

      const topicsData = await api(`/api/forum/topics?${queryParams}`)
      setTopics(topicsData.topics || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
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

  return (
    <div style={{ padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              marginBottom: '1.5rem',
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
            &#8592; Back to Forum
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '3rem' }}>{category?.icon}</span>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: '600',
                color: 'rgba(0, 0, 0, 0.87)',
                margin: 0,
                fontFamily: 'Georgia, serif',
                letterSpacing: '-0.02em'
              }}>
                {category?.name}
              </h1>
              <p style={{ color: 'rgba(0, 0, 0, 0.65)', fontSize: '1rem', marginTop: '0.25rem', fontWeight: '300' }}>
                {category?.description}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {user && (
              <button
                onClick={() => navigate('/new')}
                style={{
                  padding: '0.625rem 1.5rem',
                  backgroundColor: '#14b8a6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#14b8a6'}
              >
                New Topic
              </button>
            )}

            <div style={{ flex: 1 }} />

            {/* Filter buttons */}
            <button
              onClick={() => setFilter('latest')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: filter === 'latest' ? '#14b8a6' : 'rgba(0, 0, 0, 0.5)',
                border: filter === 'latest' ? '1px solid rgba(20, 184, 166, 0.4)' : '1px solid rgba(0, 0, 0, 0.15)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                if (filter !== 'latest') {
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.3)'
                }
              }}
              onMouseOut={(e) => {
                if (filter !== 'latest') {
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              Latest
            </button>
            <button
              onClick={() => setFilter('top')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: filter === 'top' ? '#14b8a6' : 'rgba(0, 0, 0, 0.5)',
                border: filter === 'top' ? '1px solid rgba(20, 184, 166, 0.4)' : '1px solid rgba(0, 0, 0, 0.15)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                if (filter !== 'top') {
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.3)'
                }
              }}
              onMouseOut={(e) => {
                if (filter !== 'top') {
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              Top
            </button>
          </div>
        </div>

        {/* Topics List */}
        {topics.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3.75rem 1.25rem',
            backgroundColor: '#f9fafb',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            color: 'rgba(0, 0, 0, 0.5)',
          }}>
            No topics yet. Be the first to start a discussion!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topics.map((topic) => (
              <Link
                key={topic._id}
                to={`/${categorySlug}/${topic._id}`}
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#f9fafb',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '12px',
                  borderLeft: topic.isPinned ? '4px solid #14b8a6' : '4px solid transparent',
                  transition: 'background 0.15s ease',
                  display: 'block',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              >
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {/* Upvotes */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    minWidth: '50px',
                  }}>
                    <div style={{ fontSize: '1.25rem', color: '#14b8a6' }}>&#9650;</div>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: 'rgba(0, 0, 0, 0.87)' }}>
                      {topic.upvoteCount}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      {topic.isPinned && (
                        <span style={{
                          fontSize: '0.6875rem',
                          fontWeight: '500',
                          color: '#14b8a6',
                          backgroundColor: 'rgba(20, 184, 166, 0.1)',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em',
                        }}>Pinned</span>
                      )}
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'rgba(0, 0, 0, 0.87)', margin: 0 }}>
                        {topic.title}
                      </h3>
                    </div>

                    {/* Tags */}
                    {topic.tags && topic.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                        {topic.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: 'rgba(20, 184, 166, 0.1)',
                              color: '#14b8a6',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div style={{ fontSize: '0.8125rem', color: 'rgba(0, 0, 0, 0.5)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>By {topic.userId?.name || 'Anonymous'}</span>
                      <span>{topic.replyCount} {topic.replyCount === 1 ? 'reply' : 'replies'}</span>
                      <span>{topic.viewCount} {topic.viewCount === 1 ? 'view' : 'views'}</span>
                      <span>Last activity {formatDate(topic.lastActivityAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
