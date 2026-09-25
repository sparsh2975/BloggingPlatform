import React from 'react';
import { TagBadge } from './TagBadge';
import { Avatar } from './Avatar';

export function PostCard({ post, onClick, index = 0 }) {
  const readTime = Math.ceil(post.content.split(/\s+/).length / 200);
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div
      className="fade-in"
      onClick={() => onClick(post.id)}
      style={{
        animationDelay: `${index * 0.08}s`,
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)';
        e.currentTarget.style.borderColor = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {post.coverImage && (
        <div style={{ height: '200px', width: '100%', overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={post.coverImage}
            alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          {post.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
        </div>

        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.3rem',
          marginBottom: '0.5rem', lineHeight: '1.3'
        }}>
          {post.title}
        </h3>

        <p style={{
          color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {post.subtitle || post.content.replace(/[#*`>\[\]_~]/g, '').substring(0, 120) + '…'}
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Avatar name={post.author} size={32} />
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{post.author}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'right' }}>
            <div>{formattedDate}</div>
            <div>{readTime} min read</div>
          </div>
        </div>
      </div>
    </div>
  );
}
