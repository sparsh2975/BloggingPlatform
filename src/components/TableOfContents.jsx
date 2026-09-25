import React, { useEffect, useState } from 'react';

export function TableOfContents({ markdown }) {
  const [headings, setHeadings] = useState([]);

  useEffect(() => {
    const headingRegex = /^##\s+(.+)$/gm;
    const matches = [];
    let match;
    while ((match = headingRegex.exec(markdown)) !== null) {
      matches.push({
        id: match[1].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        text: match[1]
      });
    }
    setHeadings(matches);
  }, [markdown]);

  if (headings.length === 0) return null;

  return (
    <div style={{
      position: 'sticky', top: '100px', padding: '1.5rem',
      backgroundColor: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)'
    }}>
      <h4 style={{
        fontFamily: 'var(--font-display)', marginBottom: '1rem',
        textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.08em', color: 'var(--muted)'
      }}>
        Table of Contents
      </h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {headings.map((h, i) => (
          <li key={i}>
            <a
              href={`#${h.id}`}
              style={{ color: 'var(--text)', fontSize: '0.9rem', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text)'}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
