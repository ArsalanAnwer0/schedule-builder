import { useState, useRef } from 'react'

export default function MarkdownEditor({ value, onChange, placeholder = 'Write your content here...' }) {
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef(null)

  const insertMarkdown = (before, after = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const toolbarButtons = [
    { label: 'B', title: 'Bold', action: () => insertMarkdown('**', '**'), style: { fontWeight: '600' } },
    { label: 'I', title: 'Italic', action: () => insertMarkdown('*', '*'), style: { fontStyle: 'italic' } },
    { label: 'Link', title: 'Insert Link', action: () => insertMarkdown('[', '](url)') },
    { label: 'Code', title: 'Code', action: () => insertMarkdown('`', '`') },
    { label: 'List', title: 'Bullet List', action: () => insertMarkdown('\n- ', '') },
  ]

  return (
    <div style={{ width: '100%', border: '1px solid rgba(0, 0, 0, 0.2)', borderRadius: '8px', overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.5rem',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      }}>
        {toolbarButtons.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={btn.action}
            title={btn.title}
            style={{
              padding: '0.375rem 0.75rem',
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              color: 'rgba(0, 0, 0, 0.7)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'background 0.15s ease',
              ...btn.style,
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
          >
            {btn.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          style={{
            padding: '0.375rem 0.75rem',
            backgroundColor: showPreview ? '#14b8a6' : 'rgba(0, 0, 0, 0.05)',
            color: showPreview ? '#ffffff' : 'rgba(0, 0, 0, 0.7)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'background 0.15s ease',
          }}
          onMouseOver={(e) => { if (!showPreview) e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)' }}
          onMouseOut={(e) => { if (!showPreview) e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)' }}
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div style={{
          padding: '1rem',
          backgroundColor: '#ffffff',
          minHeight: '200px',
          color: 'rgba(0, 0, 0, 0.87)',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
        }}>
          {value || <span style={{ color: 'rgba(0, 0, 0, 0.4)' }}>Nothing to preview</span>}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            minHeight: '200px',
            padding: '1rem',
            backgroundColor: '#ffffff',
            color: 'rgba(0, 0, 0, 0.87)',
            border: 'none',
            fontSize: '0.9375rem',
            lineHeight: '1.6',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      )}
    </div>
  )
}
