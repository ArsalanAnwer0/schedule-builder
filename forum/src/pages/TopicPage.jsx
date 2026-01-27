import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../hooks/useApi'
import MarkdownRenderer from '../components/MarkdownRenderer'
import MarkdownEditor from '../components/MarkdownEditor'

export default function TopicPage() {
  const { categorySlug, topicId } = useParams()
  const navigate = useNavigate()
  const { user, login } = useAuth()

  const [topic, setTopic] = useState(null)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

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
    if (!user) {
      login()
      return
    }

    try {
      await api(`/api/forum/topics/${topicId}/upvote`, { method: 'POST' })
      fetchTopic()
    } catch (error) {
      console.error('Error upvoting topic:', error)
    }
  }

  const handleUpvoteReply = async (replyId) => {
    if (!user) {
      login()
      return
    }

    try {
      await api(`/api/forum/replies/${replyId}/upvote`, { method: 'POST' })
      fetchReplies()
    } catch (error) {
      console.error('Error upvoting reply:', error)
    }
  }

  const handleSubmitReply = async (e) => {
    e.preventDefault()

    if (!user) {
      login()
      return
    }

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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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

  if (!topic) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <div style={{ color: 'rgba(0, 0, 0, 0.65)' }}>Topic not found</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '3rem 2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.5)' }}>
          <Link
            to="/"
            style={{ color: '#14b8a6' }}
            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Forum
          </Link>
          <span> / </span>
          <Link
            to={`/${categorySlug}`}
            style={{ color: '#14b8a6' }}
            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            {topic.categoryId?.name}
          </Link>
        </div>

        {/* Topic */}
        <div style={{
          padding: '2rem',
          backgroundColor: '#f9fafb',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '12px',
          marginBottom: '2rem',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Upvote */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <button
                onClick={handleUpvoteTopic}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.75rem',
                  color: topic.upvotes?.includes(user?._id) ? '#14b8a6' : 'rgba(0, 0, 0, 0.4)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'color 0.15s ease',
                }}
              >
                &#9650;
              </button>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: 'rgba(0, 0, 0, 0.87)' }}>
                {topic.upvoteCount}
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                {topic.isPinned && (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: '#14b8a6',
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                  }}>Pinned</span>
                )}
                <h1 style={{
                  fontSize: '1.75rem',
                  fontWeight: '600',
                  color: 'rgba(0, 0, 0, 0.87)',
                  margin: 0,
                  fontFamily: 'Georgia, serif',
                  letterSpacing: '-0.02em'
                }}>
                  {topic.title}
                </h1>
                {topic.isLocked && (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    color: 'rgba(0, 0, 0, 0.5)',
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                  }}>Locked</span>
                )}
              </div>

              {/* Tags */}
              {topic.tags && topic.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {topic.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: 'rgba(20, 184, 166, 0.1)',
                        color: '#14b8a6',
                        borderRadius: '12px',
                        fontSize: '0.8125rem',
                        fontWeight: '500',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.5)', marginBottom: '1.5rem' }}>
                Posted by <span style={{ color: 'rgba(0, 0, 0, 0.65)', fontWeight: '500' }}>{topic.userId?.name || 'Anonymous'}</span>
                {' \u2022 '}
                {formatDate(topic.createdAt)}
                {' \u2022 '}
                {topic.viewCount} views
              </div>

              {/* Body */}
              <div style={{ marginBottom: '1.25rem' }}>
                <MarkdownRenderer content={topic.content} />
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'rgba(0, 0, 0, 0.87)', marginBottom: '1rem' }}>
            {topic.replyCount} {topic.replyCount === 1 ? 'Reply' : 'Replies'}
          </h2>

          {replies.map((reply) => (
            <div
              key={reply._id}
              style={{
                padding: '1.5rem',
                backgroundColor: '#f9fafb',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '12px',
                marginBottom: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem' }}>
                {/* Upvote */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  <button
                    onClick={() => handleUpvoteReply(reply._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.25rem',
                      color: reply.upvotes?.includes(user?._id) ? '#14b8a6' : 'rgba(0, 0, 0, 0.4)',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'color 0.15s ease',
                    }}
                  >
                    &#9650;
                  </button>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'rgba(0, 0, 0, 0.87)' }}>
                    {reply.upvoteCount}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(0, 0, 0, 0.5)', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'rgba(0, 0, 0, 0.65)', fontWeight: '500' }}>{reply.userId?.name || 'Anonymous'}</span>
                    {' \u2022 '}
                    {formatDate(reply.createdAt)}
                    {reply.isEdited && <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}> (edited)</span>}
                  </div>
                  <MarkdownRenderer content={reply.content} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Form */}
        {topic.isLocked ? (
          <div style={{
            padding: '1.25rem',
            backgroundColor: '#f9fafb',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            textAlign: 'center',
            color: 'rgba(0, 0, 0, 0.5)',
          }}>
            This topic is locked and cannot receive new replies
          </div>
        ) : user ? (
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f9fafb',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'rgba(0, 0, 0, 0.87)', marginBottom: '1rem' }}>
              Post a Reply
            </h3>

            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#dc2626',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.875rem',
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
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 2rem',
                  backgroundColor: submitting ? 'rgba(20, 184, 166, 0.5)' : '#14b8a6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9375rem',
                  fontWeight: '500',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
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
            padding: '1.25rem',
            backgroundColor: '#f9fafb',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <p style={{ color: 'rgba(0, 0, 0, 0.5)', marginBottom: '1rem' }}>
              You must be signed in to reply
            </p>
            <button
              onClick={login}
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
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
