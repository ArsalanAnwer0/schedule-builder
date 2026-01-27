import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../hooks/useApi'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [recentTopics, setRecentTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesData, topicsData] = await Promise.all([
        api('/api/forum/categories'),
        api('/api/forum/topics?limit=10'),
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
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '600',
            color: 'rgba(0, 0, 0, 0.87)',
            marginBottom: '1rem',
            fontFamily: 'Georgia, serif',
            letterSpacing: '-0.02em',
          }}>
            Community Forum
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: 'rgba(0, 0, 0, 0.6)',
            maxWidth: '600px',
            margin: '0 auto',
            fontWeight: '300',
          }}>
            Ask questions, share tips, and connect with other Schedule Builder users.
          </p>
        </div>

        {/* New Topic Button */}
        {user && (
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <button
              onClick={() => navigate('/new')}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#14b8a6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#14b8a6'}
            >
              Start a New Topic
            </button>
          </div>
        )}

        {/* Categories */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'rgba(0, 0, 0, 0.87)',
            marginBottom: '1.5rem',
            fontFamily: 'Georgia, serif',
          }}>
            Categories
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/${category.slug}`}
                style={{
                  padding: '1.5rem',
                  backgroundColor: '#f9fafb',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '12px',
                  transition: 'all 0.15s ease',
                  display: 'block',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{category.icon}</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: 'rgba(0, 0, 0, 0.87)',
                      marginBottom: '0.5rem',
                    }}>
                      {category.name}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'rgba(0, 0, 0, 0.6)',
                      marginBottom: '0.75rem',
                      lineHeight: '1.5',
                    }}>
                      {category.description}
                    </p>
                    <div style={{
                      fontSize: '0.8125rem',
                      color: 'rgba(0, 0, 0, 0.5)',
                    }}>
                      {category.topicCount || 0} topics
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Topics */}
        <section>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'rgba(0, 0, 0, 0.87)',
            marginBottom: '1.5rem',
            fontFamily: 'Georgia, serif',
          }}>
            Recent Discussions
          </h2>
          {recentTopics.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              backgroundColor: '#f9fafb',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '12px',
              color: 'rgba(0, 0, 0, 0.5)',
            }}>
              No topics yet. Be the first to start a discussion!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentTopics.map((topic) => (
                <Link
                  key={topic._id}
                  to={`/${topic.categoryId?.slug}/${topic._id}`}
                  style={{
                    padding: '1.25rem',
                    backgroundColor: '#f9fafb',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '12px',
                    transition: 'background 0.15s ease',
                    display: 'block',
                    borderLeft: topic.isPinned ? '4px solid #14b8a6' : '4px solid transparent',
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
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
                        <h3 style={{
                          fontSize: '1.0625rem',
                          fontWeight: '600',
                          color: 'rgba(0, 0, 0, 0.87)',
                          margin: 0,
                        }}>
                          {topic.title}
                        </h3>
                      </div>

                      {/* Category Badge */}
                      <div style={{
                        display: 'inline-block',
                        padding: '0.125rem 0.5rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        color: 'rgba(0, 0, 0, 0.6)',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        marginBottom: '0.5rem',
                      }}>
                        {topic.categoryId?.name}
                      </div>

                      {/* Meta */}
                      <div style={{
                        fontSize: '0.8125rem',
                        color: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap',
                      }}>
                        <span>By {topic.userId?.name || 'Anonymous'}</span>
                        <span>{topic.replyCount} {topic.replyCount === 1 ? 'reply' : 'replies'}</span>
                        <span>{formatDate(topic.lastActivityAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
