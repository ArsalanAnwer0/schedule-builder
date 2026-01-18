'use client';

export default function MarkdownRenderer({ content }) {
  // Simple markdown rendering without external dependencies
  // This is a basic implementation - can be enhanced with markdown-to-jsx later

  const renderMarkdown = (text) => {
    if (!text) return '';

    let html = text;

    // Escape HTML to prevent XSS
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Code
    html = html.replace(/`(.+?)`/g, '<code style="background-color: #2d3748; padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>');

    // Links
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: #14b8a6; text-decoration: underline;" target="_blank" rel="noopener noreferrer">$1</a>');

    // Bullet lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul style="margin-left: 20px;">$1</ul>');

    // Line breaks
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  return (
    <div
      style={{
        color: '#e5e7eb',
        lineHeight: '1.6',
        fontSize: '15px',
      }}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
