'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownEditor from '../../components/MarkdownEditor';

export default function NewTopicPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchCategories();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (!response.ok) {
        router.push('/login?redirect=/forum/new');
      }
    } catch (error) {
      router.push('/login?redirect=/forum/new');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum/categories');
      const data = await response.json();
      setCategories(data.categories || []);
      if (data.categories && data.categories.length > 0) {
        setCategoryId(data.categories[0]._id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }

    if (content.trim().length < 10) {
      setError('Content must be at least 10 characters');
      return;
    }

    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    setSubmitting(true);

    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);

      const response = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          categoryId,
          tags: tagsArray,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create topic');
      }

      router.push(`/forum/${data.topic.categoryId.slug}/${data.topic._id}`);
    } catch (error) {
      setError(error.message);
      setSubmitting(false);
    }
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
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#e5e7eb', marginBottom: '32px' }}>
          Create New Topic
        </h1>

        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#7f1d1d',
            color: '#fecaca',
            borderRadius: '8px',
            marginBottom: '24px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Category */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#e5e7eb', marginBottom: '8px', fontWeight: '500' }}>
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1a1d29',
                color: '#e5e7eb',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                fontSize: '15px',
              }}
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#e5e7eb', marginBottom: '8px', fontWeight: '500' }}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question or topic?"
              required
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1a1d29',
                color: '#e5e7eb',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                fontSize: '15px',
              }}
            />
          </div>

          {/* Content */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#e5e7eb', marginBottom: '8px', fontWeight: '500' }}>
              Content *
            </label>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="Provide details, context, or code examples..."
            />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', color: '#e5e7eb', marginBottom: '8px', fontWeight: '500' }}>
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="bug, feature, mobile, etc."
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1a1d29',
                color: '#e5e7eb',
                border: '1px solid #2d3748',
                borderRadius: '8px',
                fontSize: '15px',
              }}
            />
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '12px 32px',
                backgroundColor: submitting ? '#6b7280' : '#14b8a6',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Creating...' : 'Create Topic'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              style={{
                padding: '12px 32px',
                backgroundColor: '#2d3748',
                color: '#e5e7eb',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
