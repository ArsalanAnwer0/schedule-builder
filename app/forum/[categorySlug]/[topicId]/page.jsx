'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MarkdownRenderer from '../../../components/MarkdownRenderer';
import MarkdownEditor from '../../../components/MarkdownEditor';

export default function TopicDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { categorySlug, topicId } = params;

  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
    fetchTopic();
    fetchReplies();
  }, [topicId]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchTopic = async () => {
    try {
      const response = await fetch(`/api/forum/topics/${topicId}`);
      const data = await response.json();
      setTopic(data.topic);
    } catch (error) {
      console.error('Error fetching topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/forum/topics/${topicId}/replies`);
      const data = await response.json();
      setReplies(data.replies || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleUpvoteTopic = async () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      const response = await fetch(`/api/forum/topics/${topicId}/upvote`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchTopic();
      }
    } catch (error) {
      console.error('Error upvoting topic:', error);
    }
  };

  const handleUpvoteReply = async (replyId) => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      const response = await fetch(`/api/forum/replies/${replyId}/upvote`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchReplies();
      }
    } catch (error) {
      console.error('Error upvoting reply:', error);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();

    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    if (replyContent.trim().length < 5) {
      setError('Reply must be at least 5 characters');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/forum/topics/${topicId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post reply');
      }

      setReplyContent('');
      fetchTopic();
      fetchReplies();
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canEdit = (authorId) => {
    return user && (user._id === authorId || user.role === 'admin');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0f1a',
        padding: '80px 20px 40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <div style={{ color: '#e5e7eb' }}>Loading...</div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0f1a',
        padding: '80px 20px 40px',
        textAlign: 'center',
      }}>
        <div style={{ color: '#e5e7eb' }}>Topic not found</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0f1a',
      padding: '80px 20px 40px',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '24px', fontSize: '14px', color: '#6b7280' }}>
          <button
            onClick={() => router.push('/forum')}
            style={{
              background: 'none',
              border: 'none',
              color: '#14b8a6',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Forum
          </button>
          <span> / </span>
          <button
            onClick={() => router.push(`/forum/${categorySlug}`)}
            style={{
              background: 'none',
              border: 'none',
              color: '#14b8a6',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {topic.categoryId?.name}
          </button>
        </div>

        {/* Topic */}
        <div style={{
          padding: '32px',
          backgroundColor: '#1a1d29',
          borderRadius: '12px',
          marginBottom: '32px',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
            {/* Upvote */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}>
              <button
                onClick={handleUpvoteTopic}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  color: topic.upvotes?.includes(user?._id) ? '#14b8a6' : '#6b7280',
                  cursor: user ? 'pointer' : 'default',
                  padding: 0,
                }}
              >
                ▲
              </button>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#e5e7eb' }}>
                {topic.upvoteCount}
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {topic.isPinned && (
                  <span style={{ fontSize: '16px' }}>📌</span>
                )}
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#e5e7eb', margin: 0 }}>
                  {topic.title}
                </h1>
                {topic.isLocked && (
                  <span style={{ fontSize: '16px' }}>🔒</span>
                )}
              </div>

              {/* Tags */}
              {topic.tags && topic.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {topic.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#2d3748',
                        color: '#14b8a6',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '500',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta */}
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                Posted by <span style={{ color: '#9ca3af', fontWeight: '500' }}>{topic.userId?.name || 'Anonymous'}</span>
                {' • '}
                {formatDate(topic.createdAt)}
                {' • '}
                {topic.viewCount} views
              </div>

              {/* Body */}
              <div style={{ marginBottom: '20px' }}>
                <MarkdownRenderer content={topic.content} />
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#e5e7eb', marginBottom: '16px' }}>
            {topic.replyCount} {topic.replyCount === 1 ? 'Reply' : 'Replies'}
          </h2>

          {replies.map((reply) => (
            <div
              key={reply._id}
              style={{
                padding: '24px',
                backgroundColor: '#1a1d29',
                borderRadius: '12px',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '16px' }}>
                {/* Upvote */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <button
                    onClick={() => handleUpvoteReply(reply._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '20px',
                      color: reply.upvotes?.includes(user?._id) ? '#14b8a6' : '#6b7280',
                      cursor: user ? 'pointer' : 'default',
                      padding: 0,
                    }}
                  >
                    ▲
                  </button>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#e5e7eb' }}>
                    {reply.upvoteCount}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                    <span style={{ color: '#9ca3af', fontWeight: '500' }}>{reply.userId?.name || 'Anonymous'}</span>
                    {' • '}
                    {formatDate(reply.createdAt)}
                    {reply.isEdited && <span style={{ color: '#6b7280' }}> (edited)</span>}
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
            padding: '20px',
            backgroundColor: '#1a1d29',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#9ca3af',
          }}>
            This topic is locked and cannot receive new replies
          </div>
        ) : user ? (
          <div style={{
            padding: '24px',
            backgroundColor: '#1a1d29',
            borderRadius: '12px',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#e5e7eb', marginBottom: '16px' }}>
              Post a Reply
            </h3>

            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#7f1d1d',
                color: '#fecaca',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
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
                  marginTop: '16px',
                  padding: '12px 32px',
                  backgroundColor: submitting ? '#6b7280' : '#14b8a6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Posting...' : 'Post Reply'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{
            padding: '20px',
            backgroundColor: '#1a1d29',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#9ca3af', marginBottom: '16px' }}>
              You must be logged in to reply
            </p>
            <button
              onClick={() => router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))}
              style={{
                padding: '10px 24px',
                backgroundColor: '#14b8a6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
