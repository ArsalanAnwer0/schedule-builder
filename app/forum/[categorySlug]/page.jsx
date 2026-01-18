'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function CategoryTopicsPage() {
  const router = useRouter();
  const params = useParams();
  const categorySlug = params.categorySlug;

  const [category, setCategory] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('latest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCategoryAndTopics();
  }, [categorySlug, filter, search]);

  const fetchCategoryAndTopics = async () => {
    try {
      // Fetch categories to find the one with matching slug
      const categoriesResponse = await fetch('/api/forum/categories');
      const categoriesData = await categoriesResponse.json();
      const foundCategory = categoriesData.categories.find(c => c.slug === categorySlug);

      if (!foundCategory) {
        router.push('/forum');
        return;
      }

      setCategory(foundCategory);

      // Fetch topics for this category
      const queryParams = new URLSearchParams({
        category: foundCategory._id,
        sort: filter,
      });

      if (search) {
        queryParams.append('search', search);
      }

      const topicsResponse = await fetch(`/api/forum/topics?${queryParams}`);
      const topicsData = await topicsResponse.json();
      setTopics(topicsData.topics || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0f1a',
      padding: '80px 20px 40px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => router.push('/forum')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2d3748',
              color: '#e5e7eb',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '16px',
            }}
          >
            ← Back to Forum
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <span style={{ fontSize: '48px' }}>{category?.icon}</span>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#e5e7eb', margin: 0 }}>
                {category?.name}
              </h1>
              <p style={{ color: '#9ca3af', fontSize: '16px', marginTop: '4px' }}>
                {category?.description}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => router.push('/forum/new')}
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
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#14b8a6'}
            >
              New Topic
            </button>

            <div style={{ flex: 1 }} />

            {/* Filter buttons */}
            <button
              onClick={() => setFilter('latest')}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === 'latest' ? '#14b8a6' : '#2d3748',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Latest
            </button>
            <button
              onClick={() => setFilter('top')}
              style={{
                padding: '8px 16px',
                backgroundColor: filter === 'top' ? '#14b8a6' : '#2d3748',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
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
            padding: '60px 20px',
            backgroundColor: '#1a1d29',
            borderRadius: '12px',
            color: '#9ca3af',
          }}>
            No topics yet. Be the first to start a discussion!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topics.map((topic) => (
              <div
                key={topic._id}
                onClick={() => router.push(`/forum/${categorySlug}/${topic._id}`)}
                style={{
                  padding: '20px',
                  backgroundColor: '#1a1d29',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  borderLeft: topic.isPinned ? '4px solid #14b8a6' : '4px solid transparent',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#242938'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1a1d29'}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  {/* Upvotes */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    minWidth: '50px',
                  }}>
                    <div style={{ fontSize: '20px', color: '#14b8a6' }}>▲</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#e5e7eb' }}>
                      {topic.upvoteCount}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      {topic.isPinned && (
                        <span style={{ fontSize: '14px', color: '#14b8a6' }}>📌</span>
                      )}
                      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#e5e7eb', margin: 0 }}>
                        {topic.title}
                      </h3>
                    </div>

                    {/* Tags */}
                    {topic.tags && topic.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        {topic.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#2d3748',
                              color: '#14b8a6',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span>By {topic.userId?.name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{topic.replyCount} {topic.replyCount === 1 ? 'reply' : 'replies'}</span>
                      <span>•</span>
                      <span>{topic.viewCount} {topic.viewCount === 1 ? 'view' : 'views'}</span>
                      <span>•</span>
                      <span>Last activity {formatDate(topic.lastActivityAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
