import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../hooks/useApi'

// Category accent colors for visual scanning
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

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [recentTopics, setRecentTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesData, topicsData] = await Promise.all([
        api('/api/forum/categories'),
        api('/api/forum/topics?limit=20'),
      ])
      setCategories(categoriesData.categories || [])
      setRecentTopics(topicsData.topics || [])
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

  const filteredTopics = activeCategory
    ? recentTopics.filter(t => t.categoryId?._id === activeCategory)
    : recentTopics

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
        {/* Header bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}>
          <h1 style={{
            fontSize: '1.375rem',
            fontWeight: '600',
            color: 'rgba(0, 0, 0, 0.87)',
          }}>
            Latest
          </h1>

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

        {/* Category pills */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        }}>
          <button
            onClick={() => setActiveCategory(null)}
            className="btn-press"
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: !activeCategory ? 'rgba(0, 0, 0, 0.87)' : 'transparent',
              color: !activeCategory ? '#fff' : 'rgba(0, 0, 0, 0.55)',
              border: !activeCategory ? 'none' : '1px solid rgba(0, 0, 0, 0.15)',
              borderRadius: '100px',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontWeight: '500',
            }}
          >
            All
          </button>
          {categories.map((cat, idx) => {
            const isActive = activeCategory === cat._id
            const color = getCategoryColor(idx)
            return (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(isActive ? null : cat._id)}
                className="btn-press"
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: isActive ? color : 'transparent',
                  color: isActive ? '#fff' : 'rgba(0, 0, 0, 0.55)',
                  border: isActive ? 'none' : '1px solid rgba(0, 0, 0, 0.15)',
                  borderRadius: '100px',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontWeight: '500',
                }}
              >
                {cat.name}
              </button>
            )
          })}
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
        {filteredTopics.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'rgba(0, 0, 0, 0.4)',
            fontSize: '0.875rem',
          }}>
            {activeCategory ? 'No topics in this category yet.' : 'No topics yet. Be the first to start a discussion!'}
          </div>
        ) : (
          <div>
            {filteredTopics.map((topic, idx) => {
              const catIndex = categories.findIndex(c => c._id === topic.categoryId?._id)
              const catColor = getCategoryColor(catIndex >= 0 ? catIndex : 0)

              return (
                <Link
                  key={topic._id}
                  to={`/${topic.categoryId?.slug}/${topic._id}`}
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
                        {/* Category pill */}
                        <span style={{
                          fontSize: '0.6875rem',
                          fontWeight: '600',
                          color: catColor,
                          backgroundColor: `${catColor}12`,
                          padding: '0.0625rem 0.375rem',
                          borderRadius: '3px',
                        }}>
                          {topic.categoryId?.name}
                        </span>

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
              )
            })}
          </div>
        )}

        {/* Categories section at bottom */}
        <section style={{ marginTop: '3rem' }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: 'rgba(0, 0, 0, 0.87)',
            marginBottom: '1rem',
          }}>
            Categories
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '0.75rem',
          }}>
            {categories.map((category, idx) => {
              const color = getCategoryColor(idx)
              return (
                <Link
                  key={category._id}
                  to={`/${category.slug}`}
                  style={{
                    padding: '1rem',
                    borderLeft: `3px solid ${color}`,
                    backgroundColor: '#fafafa',
                    transition: 'background 0.15s',
                    display: 'block',
                    borderRadius: '0 6px 6px 0',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                >
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: 'rgba(0, 0, 0, 0.87)',
                    marginBottom: '0.25rem',
                  }}>
                    {category.name}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineHeight: '1.4',
                    marginBottom: '0.375rem',
                  }}>
                    {category.description}
                  </div>
                  <div style={{
                    fontSize: '0.6875rem',
                    color: 'rgba(0, 0, 0, 0.4)',
                  }}>
                    {category.topicCount || 0} topics
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
