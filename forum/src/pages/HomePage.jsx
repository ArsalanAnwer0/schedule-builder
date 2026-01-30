import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../hooks/useApi'

function UserAvatar({ name, size = 36 }) {
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
      fontSize: size * 0.4,
      fontWeight: '600',
      flexShrink: 0,
    }}>
      {initial}
    </div>
  )
}

function SpeechBubbleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

const TOPICS_PER_PAGE = 6

export default function HomePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()

  const [categories, setCategories] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, limit: TOPICS_PER_PAGE, total: 0, pages: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef(null)

  // Open search if navigated with ?search=1
  useEffect(() => {
    if (searchParams.get('search')) {
      setSearchOpen(true)
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [searchParams])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchTopics()
  }, [activeFilter, currentPage, searchQuery])

  const fetchCategories = async () => {
    try {
      const data = await api('/api/forum/categories')
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchTopics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: TOPICS_PER_PAGE,
      })

      if (activeFilter === 'top') {
        params.set('sort', 'top')
      } else {
        params.set('sort', 'latest')
      }

      if (activeFilter === 'unanswered') {
        params.set('filter', 'unanswered')
      }

      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim())
      }

      const data = await api(`/api/forum/topics?${params}`)
      setTopics(data.topics || [])
      setPagination(data.pagination || { page: 1, limit: TOPICS_PER_PAGE, total: 0, pages: 0 })
    } catch (error) {
      console.error('Error fetching topics:', error)
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
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 30) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const totalReplies = topics.reduce((sum, t) => sum + (t.replyCount || 0), 0)

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'latest', label: 'Latest' },
    { key: 'top', label: 'Top' },
    { key: 'unanswered', label: 'Unanswered' },
  ]

  if (loading && topics.length === 0) {
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
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'flex',
        gap: '2.5rem',
        alignItems: 'flex-start',
      }}>
        {/* Left column — main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Heading */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: 'rgba(0, 0, 0, 0.87)',
              margin: '0 0 0.25rem 0',
            }}>
              Latest
            </h1>
            <p style={{
              fontSize: '0.875rem',
              color: 'rgba(0, 0, 0, 0.45)',
              margin: 0,
            }}>
              Join the conversation with the community
            </p>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div style={{ marginBottom: '1rem' }}>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search topics..."
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid rgba(0, 0, 0, 0.15)',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#14b8a6'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)'}
              />
            </div>
          )}

          {/* Filter tabs + New Topic */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {filterTabs.map(({ key, label }) => {
                const isActive = activeFilter === key
                return (
                  <button
                    key={key}
                    onClick={() => handleFilterChange(key)}
                    className="btn-press"
                    style={{
                      padding: '0.375rem 0.875rem',
                      backgroundColor: isActive ? 'rgba(0, 0, 0, 0.87)' : 'transparent',
                      color: isActive ? '#fff' : 'rgba(0, 0, 0, 0.5)',
                      border: isActive ? 'none' : '1px solid rgba(0, 0, 0, 0.15)',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
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
                  whiteSpace: 'nowrap',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#14b8a6'}
              >
                + New Topic
              </button>
            )}
          </div>

          {/* Table header */}
          <div className="desktop-only" style={{
            display: 'flex',
            padding: '0 0.75rem 0.5rem',
            fontSize: '0.6875rem',
            fontWeight: '600',
            color: 'rgba(0, 0, 0, 0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          }}>
            <div style={{ flex: 1 }}>Topic</div>
            <div style={{ width: '70px', textAlign: 'center' }}>Replies</div>
            <div style={{ width: '70px', textAlign: 'center' }}>Views</div>
            <div style={{ width: '80px', textAlign: 'right' }}>Activity</div>
          </div>

          {/* Topic rows */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
              <div className="spinner spinner-lg" />
            </div>
          ) : topics.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: 'rgba(0, 0, 0, 0.4)',
              fontSize: '0.875rem',
            }}>
              {searchQuery ? 'No topics match your search.' : 'No topics yet. Be the first to start a discussion!'}
            </div>
          ) : (
            <div>
              {topics.map((topic) => (
                <Link
                  key={topic._id}
                  to={`/${topic.categoryId?.slug}/${topic._id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.875rem 0.75rem',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                    transition: 'background 0.1s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Topic info */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <UserAvatar name={topic.userId?.name} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Title row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {topic.isPinned && (
                          <span style={{ fontSize: '0.875rem', lineHeight: 1, flexShrink: 0 }} title="Pinned">
                            &#128204;
                          </span>
                        )}
                        {topic.isLocked && (
                          <span style={{ fontSize: '0.75rem', lineHeight: 1, flexShrink: 0 }} title="Locked">
                            &#128274;
                          </span>
                        )}
                        <span style={{
                          fontSize: '0.9375rem',
                          fontWeight: '600',
                          color: 'rgba(0, 0, 0, 0.87)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {topic.title}
                        </span>
                      </div>

                      {/* Author in Category */}
                      <div style={{
                        fontSize: '0.8125rem',
                        color: 'rgba(0, 0, 0, 0.45)',
                        marginTop: '0.1875rem',
                      }}>
                        {topic.userId?.name || 'Anonymous'}
                        <span style={{ margin: '0 0.25rem' }}>in</span>
                        <span style={{ color: 'rgba(0, 0, 0, 0.55)', fontWeight: '500' }}>
                          {topic.categoryId?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats columns */}
                  <div className="desktop-only" style={{
                    width: '70px',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.55)',
                    fontWeight: '500',
                  }}>
                    {topic.replyCount || 0}
                  </div>
                  <div className="tablet-hide" style={{
                    width: '70px',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: 'rgba(0, 0, 0, 0.4)',
                  }}>
                    {topic.viewCount || 0}
                  </div>
                  <div style={{
                    width: '80px',
                    textAlign: 'right',
                    fontSize: '0.8125rem',
                    color: 'rgba(0, 0, 0, 0.4)',
                  }}>
                    {formatDate(topic.lastActivityAt)}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 0.75rem 0',
              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
              marginTop: '0.25rem',
            }}>
              <span style={{
                fontSize: '0.8125rem',
                color: 'rgba(0, 0, 0, 0.45)',
              }}>
                Showing {topics.length} of {pagination.total} topics
              </span>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="btn-press"
                  style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: 'transparent',
                    color: currentPage <= 1 ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.55)',
                    border: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    cursor: currentPage <= 1 ? 'default' : 'pointer',
                    transition: 'color 0.15s',
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={currentPage >= pagination.pages}
                  className="btn-press"
                  style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: 'transparent',
                    color: currentPage >= pagination.pages ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.55)',
                    border: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    cursor: currentPage >= pagination.pages ? 'default' : 'pointer',
                    transition: 'color 0.15s',
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column — sidebar (desktop only) */}
        <aside className="desktop-only" style={{
          width: '260px',
          flexShrink: 0,
          position: 'sticky',
          top: '72px',
        }}>
          {/* Categories */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              fontSize: '0.6875rem',
              fontWeight: '600',
              color: 'rgba(0, 0, 0, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}>
              Categories
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/${cat.slug}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                    transition: 'color 0.15s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.querySelector('.cat-name').style.color = '#14b8a6'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.querySelector('.cat-name').style.color = 'rgba(0, 0, 0, 0.75)'
                  }}
                >
                  <span
                    className="cat-name"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'rgba(0, 0, 0, 0.75)',
                      transition: 'color 0.15s',
                    }}
                  >
                    {cat.name}
                  </span>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8125rem',
                    color: 'rgba(0, 0, 0, 0.35)',
                  }}>
                    <SpeechBubbleIcon />
                    {cat.topicCount || 0}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div>
            <div style={{
              fontSize: '0.6875rem',
              fontWeight: '600',
              color: 'rgba(0, 0, 0, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}>
              Statistics
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Topics', value: pagination.total },
                { label: 'Replies', value: totalReplies > 0 ? totalReplies : '--' },
                { label: 'Members', value: '--' },
                { label: 'Online', value: '--' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.25rem 0',
                  }}
                >
                  <span style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.55)' }}>
                    {label}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'rgba(0, 0, 0, 0.75)' }}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
