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
    { label: 'B', title: 'Bold', action: () => insertMarkdown('**', '**'), style: { fontWeight: '700' } },
    { label: 'I', title: 'Italic', action: () => insertMarkdown('*', '*'), style: { fontStyle: 'italic' } },
    { label: 'Link', title: 'Insert Link', action: () => insertMarkdown('[', '](url)') },
    { label: 'Code', title: 'Code', action: () => insertMarkdown('`', '`') },
    { label: 'List', title: 'Bullet List', action: () => insertMarkdown('\n- ', '') },
  ]

  return (
    <div style={{
      width: '100%',
      border: '1px solid rgba(0, 0, 0, 0.15)',
      borderRadius: '6px',
      overflow: 'hidden',
      transition: 'border-color 0.15s',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        padding: '0.375rem',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        backgroundColor: '#fafafa',
      }}>
        {toolbarButtons.map((btn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={btn.action}
            title={btn.title}
            className="btn-press"
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'transparent',
              color: 'rgba(0, 0, 0, 0.55)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              transition: 'all 0.1s',
              ...btn.style,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)'
              e.currentTarget.style.color = 'rgba(0, 0, 0, 0.8)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'rgba(0, 0, 0, 0.55)'
            }}
          >
            {btn.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="btn-press"
          style={{
            padding: '0.25rem 0.5rem',
            backgroundColor: showPreview ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
            color: showPreview ? '#14b8a6' : 'rgba(0, 0, 0, 0.45)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: '500',
            transition: 'all 0.1s',
          }}
          onMouseOver={(e) => {
            if (!showPreview) {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)'
              e.currentTarget.style.color = 'rgba(0, 0, 0, 0.65)'
            }
          }}
          onMouseOut={(e) => {
            if (!showPreview) {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'rgba(0, 0, 0, 0.45)'
            }
          }}
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div style={{
          padding: '0.75rem',
          backgroundColor: '#ffffff',
          minHeight: '160px',
          color: 'rgba(0, 0, 0, 0.87)',
          lineHeight: '1.6',
          fontSize: '0.8125rem',
          whiteSpace: 'pre-wrap',
        }}>
          {value || <span style={{ color: 'rgba(0, 0, 0, 0.3)' }}>Nothing to preview</span>}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            minHeight: '160px',
            padding: '0.75rem',
            backgroundColor: '#ffffff',
            color: 'rgba(0, 0, 0, 0.87)',
            border: 'none',
            fontSize: '0.8125rem',
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
