import React from 'react';

export function EditorToolbar({ onInsert }) {
  const tools = [
    { label: 'B', syntax: '**text**', title: 'Bold', style: { fontWeight: 'bold' } },
    { label: 'I', syntax: '*text*', title: 'Italic', style: { fontStyle: 'italic' } },
    { label: 'H2', syntax: '## ', title: 'Heading 2', style: {} },
    { label: 'H3', syntax: '### ', title: 'Heading 3', style: {} },
    { label: '🔗', syntax: '[text](url)', title: 'Link', style: {} },
    { label: '🖼️', syntax: '![alt](url)', title: 'Image', style: {} },
    { label: '</>', syntax: '\n```javascript\ncode\n```\n', title: 'Code Block', style: { fontFamily: 'var(--font-mono)' } },
    { label: '"', syntax: '> ', title: 'Blockquote', style: {} },
    { label: '•', syntax: '- ', title: 'Bullet List', style: {} },
    { label: '1.', syntax: '1. ', title: 'Numbered List', style: {} },
    { label: '—', syntax: '\n---\n', title: 'Divider', style: {} },
  ];

  return (
    <div style={{
      display: 'flex', gap: '0.35rem', padding: '0.5rem 0.75rem',
      backgroundColor: '#181825', borderBottom: '1px solid #313244', flexWrap: 'wrap'
    }}>
      {tools.map(tool => (
        <button
          key={tool.title}
          onClick={() => onInsert(tool.syntax)}
          title={tool.title}
          style={{
            minWidth: '32px', height: '28px', padding: '0 6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
            color: '#cdd6f4', backgroundColor: 'transparent',
            border: '1px solid transparent', transition: 'all 0.15s ease',
            ...tool.style
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#313244';
            e.currentTarget.style.borderColor = '#E8A838';
            e.currentTarget.style.color = '#E8A838';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.color = '#cdd6f4';
          }}
        >
          {tool.label}
        </button>
      ))}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#6c7086', fontFamily: 'var(--font-mono)' }}>
          Ctrl+B Bold &nbsp;·&nbsp; Ctrl+I Italic
        </span>
      </div>
    </div>
  );
}
