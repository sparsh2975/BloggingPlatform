import React from 'react';

function stringToHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function getColor(str) {
  const hash = stringToHash(str);
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 60%, 40%)`;
}

export function TagBadge({ tag, onClick }) {
  const color = getColor(tag);
  return (
    <span
      onClick={onClick}
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        color: color,
        padding: '0.2rem 0.6rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-block',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}
    >
      {tag}
    </span>
  );
}
