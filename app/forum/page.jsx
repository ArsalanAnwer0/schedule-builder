'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForumPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
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
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#e5e7eb', marginBottom: '16px' }}>
            Forum
          </h1>
          <p style={{ fontSize: '18px', color: '#9ca3af', marginBottom: '24px' }}>
            Join the discussion, ask questions, and share ideas
          </p>
          <button
            onClick={() => router.push('/forum/new')}
            style={{
              padding: '12px 32px',
              backgroundColor: '#14b8a6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0d9488'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#14b8a6'}
          >
            Ask a Question
          </button>
        </div>

        {/* Categories */}
        {categories.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#1a1d29',
            borderRadius: '12px',
            color: '#9ca3af',
          }}>
            No categories available yet
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {categories.map((category) => (
              <div
                key={category._id}
                onClick={() => router.push(`/forum/${category.slug}`)}
                style={{
                  padding: '24px',
                  backgroundColor: '#1a1d29',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  borderLeft: `4px solid ${category.color}`,
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#242938'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1a1d29'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '32px' }}>{category.icon}</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#e5e7eb', margin: 0 }}>
                    {category.name}
                  </h3>
                </div>
                <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>
                  {category.description}
                </p>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>
                  {category.topicCount || 0} {category.topicCount === 1 ? 'topic' : 'topics'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
