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
        backgroundColor: '#ffffff',
        padding: '80px 20px 40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <div style={{ color: 'rgba(0, 0, 0, 0.65)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      padding: '4rem 2rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '4rem' }}>
          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: '2.5rem',
            fontWeight: '400',
            color: 'rgba(0, 0, 0, 0.87)',
            marginBottom: '1rem',
            letterSpacing: '-0.02em'
          }}>
            Forum
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: 'rgba(0, 0, 0, 0.65)',
            marginBottom: '2rem',
            fontWeight: '300',
            lineHeight: '1.6'
          }}>
            Join the discussion, ask questions, and share ideas
          </p>
          <button
            onClick={() => router.push('/forum/new')}
            style={{
              padding: '0.875rem 1.75rem',
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
            Ask a Question
          </button>
        </div>

        {/* Categories */}
        {categories.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3.75rem 1.25rem',
            backgroundColor: '#f9fafb',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '12px',
            color: 'rgba(0, 0, 0, 0.5)',
          }}>
            No categories available yet
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
          }}>
            {categories.map((category) => (
              <div
                key={category._id}
                onClick={() => router.push(`/forum/${category.slug}`)}
                style={{
                  padding: '2rem',
                  backgroundColor: '#f9fafb',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  borderLeft: `4px solid ${category.color}`,
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>{category.icon}</span>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: 'rgba(0, 0, 0, 0.87)',
                    margin: 0
                  }}>
                    {category.name}
                  </h3>
                </div>
                <p style={{
                  color: 'rgba(0, 0, 0, 0.65)',
                  fontSize: '0.875rem',
                  marginBottom: '1rem',
                  lineHeight: '1.6',
                  fontWeight: '400'
                }}>
                  {category.description}
                </p>
                <div style={{
                  fontSize: '0.8125rem',
                  color: 'rgba(0, 0, 0, 0.5)',
                  fontWeight: '400'
                }}>
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
