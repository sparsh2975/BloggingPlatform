import React, { useState } from 'react';
import { TagBadge } from '../components/TagBadge';

function SkeletonRow() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto auto auto',
      alignItems: 'center', gap: '1rem', padding: '1rem',
      border: '1px solid var(--border)', backgroundColor: 'var(--surface)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ height: '16px', width: '50%', borderRadius: '4px', backgroundColor: 'var(--border)', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: '12px', width: '30%', borderRadius: '4px', backgroundColor: 'var(--border)', animation: 'shimmer 1.5s infinite' }} />
      </div>
      <div style={{ height: '22px', width: '70px', borderRadius: '999px', backgroundColor: 'var(--border)', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ height: '14px', width: '80px', borderRadius: '4px', backgroundColor: 'var(--border)', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: '30px', width: '50px', borderRadius: '4px', backgroundColor: 'var(--border)', animation: 'shimmer 1.5s infinite' }} />
        ))}
      </div>
      <style>{`@keyframes shimmer { 0%{opacity:1} 50%{opacity:0.4} 100%{opacity:1} }`}</style>
    </div>
  );
}

export function MyPosts({ posts, loading, setRoute, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const myPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleDelete = (id) => { onDelete(id); setConfirmDelete(null); };

  const tableHeader = (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto auto auto',
      padding: '0.75rem 1rem', backgroundColor: 'var(--surface)',
      borderRadius: '8px 8px 0 0', border: '1px solid var(--border)',
      borderBottom: 'none', color: 'var(--muted)', fontSize: '0.85rem',
      fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      <span>Title</span><span>Status</span><span>Date</span><span>Actions</span>
    </div>
  );

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem' }}>My Posts</h1>
        <button className="btn btn-primary" onClick={() => setRoute('write')}>+ Write New Post</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {tableHeader}
          {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
        </div>
      ) : myPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>No posts yet</h3>
          <p style={{ marginBottom: '1.5rem' }}>Your published and draft posts will appear here.</p>
          <button className="btn btn-primary" onClick={() => setRoute('write')}>Write your first post</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {tableHeader}
          {myPosts.map((post, i) => {
            const readTime = Math.ceil(post.content.split(/\s+/).length / 200);
            const date = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <div key={post.id} style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto auto',
                alignItems: 'center', gap: '1rem', padding: '1rem',
                border: '1px solid var(--border)',
                borderBottom: i === myPosts.length - 1 ? '1px solid var(--border)' : 'none',
                backgroundColor: 'var(--surface)',
                borderRadius: i === myPosts.length - 1 ? '0 0 8px 8px' : '0',
              }}>
                <div>
                  <div style={{ fontWeight: '600', fontFamily: 'var(--font-display)', marginBottom: '0.35rem' }}>{post.title}</div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {post.tags.map(t => <TagBadge key={t} tag={t} />)}
                    <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{readTime} min read</span>
                  </div>
                </div>
                <span style={{
                  padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600',
                  backgroundColor: post.status === 'published' ? 'rgba(72,199,142,0.2)' : 'rgba(232,168,56,0.15)',
                  color: post.status === 'published' ? '#48c78e' : 'var(--accent)',
                }}>{post.status === 'published' ? 'Published' : 'Draft'}</span>
                <span style={{ color: 'var(--muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{date}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }} onClick={() => setRoute('post', { id: post.id })}>View</button>
                  <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem' }} onClick={() => setRoute('write', { id: post.id })}>Edit</button>
                  <button style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid rgba(255,80,80,0.3)', color: '#ff6b6b', backgroundColor: 'transparent' }} onClick={() => setConfirmDelete(post.id)}>Delete</button>
                </div>
                {confirmDelete === post.id && (
                  <div style={{ gridColumn: '1 / -1', padding: '0.75rem 1rem', backgroundColor: 'rgba(255,80,80,0.08)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Delete "<strong>{post.title}</strong>"?</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleDelete(post.id)} style={{ padding: '0.3rem 0.75rem', borderRadius: '4px', backgroundColor: '#ff6b6b', color: '#fff', fontWeight: '600' }}>Yes, delete</button>
                      <button className="btn btn-outline" style={{ padding: '0.3rem 0.75rem' }} onClick={() => setConfirmDelete(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
