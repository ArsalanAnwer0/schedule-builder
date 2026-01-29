import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../hooks/useApi'
import MarkdownRenderer from '../components/MarkdownRenderer'
import MarkdownEditor from '../components/MarkdownEditor'

function UserAvatar({ name, size = 32 }) {
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
      fontSize: size * 0.42,
      fontWeight: '600',
      flexShrink: 0,
    }}>
      {initial}
    </div>
  )
}

export default function TopicPage() {
  const { categorySlug, topicId } = useParams()
  const { user, login } = useAuth()

  const [topic, setTopic] = useState(null)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [upvoteAnimating, setUpvoteAnimating] = useState(null)

  useEffect(() => {
    fetchTopic()
    fetchReplies()
  }, [topicId])

  const fetchTopic = async () => {
    try {
      const data = await api(`/api/forum/topics/${topicId}`)
      setTopic(data.topic)
    } catch (error) {
      console.error('Error fetching topic:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReplies = async () => {
    try {
      const data = await api(`/api/forum/topics/${topicId}/replies`)
      setReplies(data.replies || [])
    } catch (error) {
      console.error('Error fetching replies:', error)
    }
  }

  const handleUpvoteTopic = async () => {
    if (!user) { login(); return }
    try {
      setUpvoteAnimating('topic')
      await api(`/api/forum/topics/${topicId}/upvote`, { method: 'POST' })
      fetchTopic()
      setTimeout(() => setUpvoteAnimating(null), 300)
    } catch (error) {
      console.error('Error upvoting topic:', error)
      setUpvoteAnimating(null)
    }
  }

  const handleUpvoteReply = async (replyId) => {
    if (!user) { login(); return }
    try {
      setUpvoteAnimating(replyId)
      await api(`/api/forum/replies/${replyId}/upvote`, { method: 'POST' })
      fetchReplies()
      setTimeout(() => setUpvoteAnimating(null), 300)
    } catch (error) {
      console.error('Error upvoting reply:', error)
      setUpvoteAnimating(null)
    }
  }

  const handleSubmitReply = async (e) => {
    e.preventDefault()
    if (!user) { login(); return }
    if (replyContent.trim().length < 5) {
      setError('Reply must be at least 5 characters')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await api(`/api/forum/topics/${topicId}/replies`, {
        method: 'POST',
        body: JSON.stringify({ content: replyContent }),
      })
      setReplyContent('')
      fetchTopic()
      fetchReplies()
    } catch (error) {
      setError(error.message)
    } finally {
      setSubmitting(false)
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

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

  if (!topic) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'rgba(0, 0, 0, 0.5)',
        fontSize: '0.875rem',
      }}>
        Topic not found
      </div>
    )
  }

  const hasUpvoted = topic.upvotes?.includes(user?._id)

  return (
    <div style={{ padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
          <Link
            to={`/${categorySlug}`}
            style={{ fontSize: '0.8125rem', color: 'rgba(0, 0, 0, 0.45)', transition: 'color 0.15s' }}
            onMouseOver={(e) => e.currentTarget.style.color = '#14b8a6'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(0, 0, 0, 0.45)'}
          >
            {topic.categoryId?.name}
          </Link>
        </div>

        {/* Topic post */}
        <article style={{
          paddingBottom: '1.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'rgba(0, 0, 0, 0.87)',
            margin: '0 0 0.75rem 0',
            lineHeight: '1.35',
          }}>
            {topic.isPinned && (
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: '600',
                color: '#14b8a6',
                backgroundColor: 'rgba(20, 184, 166, 0.1)',
                padding: '0.125rem 0.375rem',
                borderRadius: '3px',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                marginRight: '0.5rem',
                verticalAlign: 'middle',
              }}>Pinned</span>
            )}
            {topic.title}
            {topic.isLocked && (
              <span style={{
                fontSize: '0.6875rem',
                fontWeight: '500',
                color: 'rgba(0, 0, 0, 0.45)',
                backgroundColor: 'rgba(0, 0, 0, 0.06)',
                padding: '0.125rem 0.375rem',
                borderRadius: '3px',
                marginLeft: '0.5rem',
                verticalAlign: 'middle',
              }}>Locked</span>
            )}
          </h1>

          {/* Tags */}
          {topic.tags && topic.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {topic.tags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.6875rem',
                    color: 'rgba(0, 0, 0, 0.45)',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '3px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            marginBottom: '1.25rem',
          }}>
            <UserAvatar name={topic.userId?.name} size={32} />
            <div>
              <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: 'rgba(0, 0, 0, 0.87)' }}>
                {topic.userId?.name || 'Anonymous'}
              </span>
              <div style={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.4)' }}>
                {formatDate(topic.createdAt)}
                <span style={{ margin: '0 0.375rem' }}>&middot;</span>
                {topic.viewCount} views
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ marginBottom: '1.25rem', lineHeight: '1.6' }}>
            <MarkdownRenderer content={topic.content} />
          </div>

          {/* Upvote bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            paddingTop: '0.75rem',
          }}>
            <button
              onClick={handleUpvoteTopic}
              className={`btn-press${upvoteAnimating === 'topic' ? ' upvote-pop' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.375rem 0.75rem',
                backgroundColor: hasUpvoted ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                color: hasUpvoted ? '#14b8a6' : 'rgba(0, 0, 0, 0.45)',
                border: `1px solid ${hasUpvoted ? 'rgba(20, 184, 166, 0.3)' : 'rgba(0, 0, 0, 0.12)'}`,
                borderRadius: '6px',
                fontSize: '0.8125rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseOver={(e) => {
                if (!hasUpvoted) {
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.25)'
                  e.currentTarget.style.color = 'rgba(0, 0, 0, 0.65)'
                }
              }}
              onMouseOut={(e) => {
                if (!hasUpvoted) {
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)'
                  e.currentTarget.style.color = 'rgba(0, 0, 0, 0.45)'
                }
              }}
            >
              <span style={{ fontSize: '0.75rem' }}>&#9650;</span>
              {topic.upvoteCount}
            </button>

            <span style={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.35)' }}>
              {topic.replyCount} {topic.replyCount === 1 ? 'reply' : 'replies'}
            </span>
          </div>
        </article>

        {/* Replies */}
        {replies.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'rgba(0, 0, 0, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}>
              {topic.replyCount} {topic.replyCount === 1 ? 'Reply' : 'Replies'}
            </div>

            {replies.map((reply) => {
              const replyUpvoted = reply.upvotes?.includes(user?._id)
              return (
                <div
                  key={reply._id}
                  style={{
                    padding: '1rem 0',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                  }}
                >
                  {/* Author */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                  }}>
                    <UserAvatar name={reply.userId?.name} size={26} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: '500', color: 'rgba(0, 0, 0, 0.87)' }}>
                      {reply.userId?.name || 'Anonymous'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.35)' }}>
                      {formatDate(reply.createdAt)}
                    </span>
                    {reply.isEdited && (
                      <span style={{ fontSize: '0.6875rem', color: 'rgba(0, 0, 0, 0.3)', fontStyle: 'italic' }}>
                        edited
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ paddingLeft: 'calc(26px + 0.5rem)', lineHeight: '1.6' }}>
                    <MarkdownRenderer content={reply.content} />

                    {/* Upvote */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <button
                        onClick={() => handleUpvoteReply(reply._id)}
                        className={`btn-press${upvoteAnimating === reply._id ? ' upvote-pop' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: replyUpvoted ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                          color: replyUpvoted ? '#14b8a6' : 'rgba(0, 0, 0, 0.35)',
                          border: `1px solid ${replyUpvoted ? 'rgba(20, 184, 166, 0.3)' : 'rgba(0, 0, 0, 0.08)'}`,
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        onMouseOver={(e) => {
                          if (!replyUpvoted) {
                            e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'
                            e.currentTarget.style.color = 'rgba(0, 0, 0, 0.55)'
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!replyUpvoted) {
                            e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.08)'
                            e.currentTarget.style.color = 'rgba(0, 0, 0, 0.35)'
                          }
                        }}
                      >
                        <span style={{ fontSize: '0.625rem' }}>&#9650;</span>
                        {reply.upvoteCount}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Reply Form */}
        {topic.isLocked ? (
          <div style={{
            padding: '1rem',
            textAlign: 'center',
            color: 'rgba(0, 0, 0, 0.4)',
            fontSize: '0.8125rem',
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          }}>
            This topic is locked and cannot receive new replies.
          </div>
        ) : user ? (
          <div style={{
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            paddingTop: '1.5rem',
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'rgba(0, 0, 0, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
            }}>
              Post a Reply
            </div>

            {error && (
              <div style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: '#dc2626',
                borderRadius: '6px',
                marginBottom: '0.75rem',
                fontSize: '0.8125rem',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitReply}>
              <MarkdownEditor
                value={replyContent}
                onChange={setReplyContent}
                placeholder="Write your reply..."
              />

              <button
                type="submit"
                disabled={submitting}
                className="btn-press"
                style={{
                  marginTop: '0.75rem',
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
                {submitting ? 'Posting...' : 'Post Reply'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            paddingTop: '1.5rem',
            textAlign: 'center',
          }}>
            <p style={{ color: 'rgba(0, 0, 0, 0.45)', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
              Sign in to reply to this topic.
            </p>
            <button
              onClick={login}
              className="btn-press"
              style={{
                padding: '0.5rem 1.25rem',
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
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
