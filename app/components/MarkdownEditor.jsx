'use client';

import { useState } from 'react';

export default function MarkdownEditor({ value, onChange, placeholder = 'Write your content here...' }) {
  const [showPreview, setShowPreview] = useState(false);

  const insertMarkdown = (before, after = '') => {
    const textarea = document.getElementById('markdown-textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const toolbarButtons = [
    { label: 'B', title: 'Bold', action: () => insertMarkdown('**', '**') },
    { label: 'I', title: 'Italic', action: () => insertMarkdown('*', '*') },
    { label: 'Link', title: 'Insert Link', action: () => insertMarkdown('[', '](url)') },
    { label: 'Code', title: 'Code', action: () => insertMarkdown('`', '`') },
    { label: '• List', title: 'Bullet List', action: () => insertMarkdown('\n- ', '') },
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '8px',
        backgroundColor: '#1a1d29',
        borderRadius: '8px 8px 0 0',
        borderBottom: '1px solid #2d3748',
      }}>
        {toolbarButtons.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={btn.action}
            title={btn.title}
            style={{
              padding: '6px 12px',
              backgroundColor: '#2d3748',
              color: '#e5e7eb',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: btn.label === 'B' ? '600' : '400',
              fontStyle: btn.label === 'I' ? 'italic' : 'normal',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#374151'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2d3748'}
          >
            {btn.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          style={{
            padding: '6px 12px',
            backgroundColor: showPreview ? '#14b8a6' : '#2d3748',
            color: '#e5e7eb',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
          onMouseOver={(e) => !showPreview && (e.currentTarget.style.backgroundColor = '#374151')}
          onMouseOut={(e) => !showPreview && (e.currentTarget.style.backgroundColor = '#2d3748')}
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div style={{
          padding: '16px',
          backgroundColor: '#1a1d29',
          borderRadius: '0 0 8px 8px',
          minHeight: '200px',
          color: '#e5e7eb',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
        }}>
          {value || <span style={{ color: '#6b7280' }}>Nothing to preview</span>}
        </div>
      ) : (
        <textarea
          id="markdown-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            minHeight: '200px',
            padding: '16px',
            backgroundColor: '#1a1d29',
            color: '#e5e7eb',
            border: 'none',
            borderRadius: '0 0 8px 8px',
            fontSize: '15px',
            lineHeight: '1.6',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
          }}
        />
      )}
    </div>
  );
}
