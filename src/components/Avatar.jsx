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
  return `hsl(${hue}, 50%, 45%)`;
}

export function Avatar({ name, size = 40 }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  const color = name ? getColor(name) : 'var(--muted)';

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: size * 0.4,
        fontFamily: 'var(--font-body)',
        flexShrink: 0,
        userSelect: 'none'
      }}
      title={name}
    >
      {initials}
    </div>
  );
}
