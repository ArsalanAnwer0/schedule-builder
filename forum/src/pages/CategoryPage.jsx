import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../hooks/useApi'

const CATEGORY_COLORS = [
  '#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
]

function getCategoryColor(index) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length]
}

function UserAvatar({ name, size = 24 }) {
  const initial = (name || 'U').charAt(0).toUpperCase()
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: '#e5e7eb',
      color: 'rgba(0, 0, 0, 0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.45,
      fontWeight: '600',
      flexShrink: 0,
    }}>
      {initial}
    </div>
  )
}

export default function CategoryPage() {
  const { categorySlug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [category, setCategory] = useState(null)
  const [categories, setCategories] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('latest')

  useEffect(() => {
    fetchCategoryAndTopics()
  }, [categorySlug, filter])

  const fetchCategoryAndTopics = async () => {
    try {
      const categoriesData = await api('/api/forum/categories')
      const allCategories = categoriesData.categories || []
      setCategories(allCategories)

      const foundCategory = allCategories.find(c => c.slug === categorySlug)

      if (!foundCategory) {
        navigate('/')
        return
      }

      setCategory(foundCategory)

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

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 30) return `${diffDays}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const catIndex = categories.findIndex(c => c._id === category?._id)
  const catColor = getCategoryColor(catIndex >= 0 ? catIndex : 0)

  if (loading) {
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

  return (
    <div style={{ padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.25rem' }}>
          <Link
            to="/"
            style={{
              fontSize: '0.8125rem',
              color: 'rgba(0, 0, 0, 0.45)',
              transition: 'color 0.15s',
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#14b8a6'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.45)'}
          >
            Forum
          </Link>
          <span style={{ color: 'rgba(0, 0, 0, 0.3)', margin: '0 0.5rem', fontSize: '0.75rem' }}>/</span>
          <span style={{
            fontSize: '0.8125rem',
            color: catColor,
            fontWeight: '500',
          }}>
            {category?.name}
          </span>
        </div>

        {/* Category header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
              <div style={{
                width: '4px',
                height: '24px',
                backgroundColor: catColor,
                borderRadius: '2px',
                flexShrink: 0,
              }} />
              <h1 style={{
                fontSize: '1.375rem',
                fontWeight: '600',
                color: 'rgba(0, 0, 0, 0.87)',
                margin: 0,
              }}>
                {category?.name}
              </h1>
            </div>
            {category?.description && (
              <p style={{
                color: 'rgba(0, 0, 0, 0.5)',
                fontSize: '0.8125rem',
                margin: '0.25rem 0 0 0',
                paddingLeft: 'calc(4px + 0.625rem)',
                lineHeight: '1.5',
              }}>
                {category.description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Filter toggles */}
            <div style={{
              display: 'flex',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              borderRadius: '6px',
              overflow: 'hidden',
            }}>
              {['latest', 'top'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="btn-press"
                  style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: filter === f ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                    color: filter === f ? 'rgba(0, 0, 0, 0.87)' : 'rgba(0, 0, 0, 0.45)',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textTransform: 'capitalize',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {user && (
              <button
                onClick={() => navigate('/new')}
                className="btn-press"
                style={{
                  padding: '0.5rem 1rem',
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
                + New Topic
              </button>
            )}
          </div>
        </div>

        {/* Topic table header */}
        <div className="desktop-only" style={{
          display: 'flex',
          padding: '0 0.75rem 0.5rem',
          fontSize: '0.6875rem',
          fontWeight: '600',
          color: 'rgba(0, 0, 0, 0.4)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          <div style={{ flex: 1 }}>Topic</div>
          <div style={{ width: '60px', textAlign: 'center' }}>Replies</div>
          <div style={{ width: '60px', textAlign: 'center' }}>Views</div>
          <div style={{ width: '80px', textAlign: 'right' }}>Activity</div>
        </div>

        {/* Topic rows */}
        {topics.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'rgba(0, 0, 0, 0.4)',
            fontSize: '0.875rem',
          }}>
            No topics yet. Be the first to start a discussion!
          </div>
        ) : (
          <div>
            {topics.map((topic) => (
              <Link
                key={topic._id}
                to={`/${categorySlug}/${topic._id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                  transition: 'background 0.1s',
                  borderLeft: topic.isPinned ? `3px solid ${catColor}` : '3px solid transparent',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Topic info */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                  <UserAvatar name={topic.userId?.name} size={28} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                      {topic.isPinned && (
                        <span style={{
                          fontSize: '0.625rem',
                          fontWeight: '600',
                          color: catColor,
                          backgroundColor: `${catColor}15`,
                          padding: '0.0625rem 0.3125rem',
                          borderRadius: '3px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.03em',
                        }}>Pinned</span>
                      )}
                      <span style={{
                        fontSize: '0.9375rem',
                        fontWeight: '500',
                        color: 'rgba(0, 0, 0, 0.87)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {topic.title}
                      </span>
                    </div>

                    {/* Meta row */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '0.25rem',
                      flexWrap: 'wrap',
                    }}>
                      {/* Tags */}
                      {topic.tags && topic.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.6875rem',
                            color: 'rgba(0, 0, 0, 0.45)',
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            padding: '0.0625rem 0.375rem',
                            borderRadius: '3px',
                          }}
                        >
                          {tag}
                        </span>
                      ))}

                      <span style={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.4)' }}>
                        {topic.userId?.name || 'Anonymous'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="desktop-only" style={{ width: '60px', textAlign: 'center', fontSize: '0.8125rem', color: 'rgba(0, 0, 0, 0.55)', fontWeight: '500' }}>
                  {topic.replyCount || 0}
                </div>
                <div className="tablet-hide" style={{ width: '60px', textAlign: 'center', fontSize: '0.8125rem', color: 'rgba(0, 0, 0, 0.4)' }}>
                  {topic.viewCount || 0}
                </div>
                <div style={{ width: '80px', textAlign: 'right', fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.4)' }}>
                  {formatDate(topic.lastActivityAt)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
