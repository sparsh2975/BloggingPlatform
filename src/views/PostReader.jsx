import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { TagBadge } from '../components/TagBadge';
import { Avatar } from '../components/Avatar';
import { TableOfContents } from '../components/TableOfContents';
import { PostCard } from '../components/PostCard';

export function PostReader({ post, posts, setRoute, onLike }) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const readTime = Math.ceil(post.content.split(/\s+/).length / 200);
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  const relatedPosts = posts
    .filter(p => p.id !== post.id && p.status === 'published' && p.tags.some(t => post.tags.includes(t)))
    .slice(0, 3);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const progress = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    if (!liked) { onLike(post.id); setLiked(true); }
  };

  return (
    <div>
      {/* Progress Bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, height: '3px',
        width: `${scrollProgress}%`, backgroundColor: 'var(--accent)',
        transition: 'width 0.1s ease', zIndex: 999
      }} />

      {/* Header */}
      <div style={{ paddingTop: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <button onClick={() => setRoute('home')} style={{
            color: 'var(--muted)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            ← Back to feed
          </button>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {post.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', lineHeight: 1.2, marginBottom: '1rem' }}>
            {post.title}
          </h1>
          {post.subtitle && (
            <p style={{ fontSize: '1.25rem', color: 'var(--muted)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
              {post.subtitle}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Avatar name={post.author} size={44} />
              <div>
                <div style={{ fontWeight: '600' }}>{post.author}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{formattedDate} · {readTime} min read</div>
              </div>
            </div>

            {/* Action bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={handleLike} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem',
                borderRadius: '999px', border: '1px solid var(--border)',
                color: liked ? 'var(--accent)' : 'var(--text)',
                borderColor: liked ? 'var(--accent)' : 'var(--border)'
              }}>
                {liked ? '❤️' : '🤍'} {post.likes + (liked ? 1 : 0)}
              </button>
              <button onClick={() => setBookmarked(b => !b)} style={{
                padding: '0.4rem 0.75rem', borderRadius: '999px', border: '1px solid var(--border)',
                color: bookmarked ? 'var(--accent)' : 'var(--text)',
                borderColor: bookmarked ? 'var(--accent)' : 'var(--border)'
              }}>
                {bookmarked ? '🔖' : '🏷️'}
              </button>
              <button onClick={handleShare} style={{
                padding: '0.4rem 0.75rem', borderRadius: '999px', border: '1px solid var(--border)'
              }}>
                {copied ? '✅ Copied!' : '🔗 Share'}
              </button>
              <button className="btn btn-outline" onClick={() => setRoute('write', { id: post.id })}>
                ✏️ Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cover image */}
      {post.coverImage && (
        <div style={{ width: '100%', position: 'relative' }}>
          <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
            background: 'linear-gradient(to top, var(--bg), transparent)'
          }} />
        </div>
      )}

      {/* Main content with TOC sidebar */}
      <div className="container" style={{
        display: 'grid', gridTemplateColumns: '1fr 260px', gap: '3rem',
        padding: '3rem 1.5rem', maxWidth: '1100px'
      }}>
        <article className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {post.content}
          </ReactMarkdown>
        </article>
        <aside>
          <TableOfContents markdown={post.content} />
        </aside>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '3rem 0' }}>
          <div className="container">
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '2rem', fontSize: '1.6rem' }}>
              Related Stories
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {relatedPosts.map((p, i) => (
                <PostCard key={p.id} post={p} index={i} onClick={(id) => setRoute('post', { id })} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
