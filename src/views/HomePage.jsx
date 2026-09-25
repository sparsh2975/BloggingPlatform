import React, { useState } from 'react';
import { PostCard } from '../components/PostCard';
import { TagBadge } from '../components/TagBadge';

function SkeletonCard() {
  return (
    <div style={{
      borderRadius: '12px', border: '1px solid var(--border)',
      overflow: 'hidden', backgroundColor: 'var(--surface)',
    }}>
      <div style={{ height: '180px', backgroundColor: 'var(--border)', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ height: '14px', width: '60%', borderRadius: '6px', backgroundColor: 'var(--border)', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: '22px', width: '90%', borderRadius: '6px', backgroundColor: 'var(--border)', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: '14px', width: '75%', borderRadius: '6px', backgroundColor: 'var(--border)', animation: 'shimmer 1.5s infinite' }} />
      </div>
      <style>{`@keyframes shimmer { 0%{opacity:1} 50%{opacity:0.4} 100%{opacity:1} }`}</style>
    </div>
  );
}

export function HomePage({ posts, loading, setRoute }) {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);

  const publishedPosts = posts.filter((p) => p.status === 'published');
  const allTags = Array.from(new Set(publishedPosts.flatMap((p) => p.tags)));

  const filteredPosts = publishedPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.content.toLowerCase().includes(search.toLowerCase());
    const matchesTag = activeTag ? post.tags.includes(activeTag) : true;
    return matchesSearch && matchesTag;
  });

  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  return (
    <div>
      {/* Hero */}
      <section style={{
        padding: '4rem 0',
        borderBottom: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Inkwell</h1>
        <p style={{
          fontSize: '1.2rem', color: 'var(--muted)',
          maxWidth: '600px', margin: '0 auto', fontStyle: 'italic',
        }}>
          A premium editorial magazine — refined, minimal, and deeply focused on the reading experience.
        </p>
      </section>

      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '3rem',
        padding: '3rem 1.5rem',
      }}>
        {/* Main Content */}
        <main>
          {activeTag && (
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>Showing posts tagged:</span>
              <TagBadge tag={activeTag} />
              <button onClick={() => setActiveTag(null)} style={{ color: 'var(--muted)', textDecoration: 'underline', fontSize: '0.9rem' }}>
                Clear filter
              </button>
            </div>
          )}

          {loading ? (
            <>
              <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Featured</h2>
              <div style={{ marginBottom: '3rem' }}><SkeletonCard /></div>
              <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Latest Stories</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
              </div>
            </>
          ) : (
            <>
              {featuredPost && !activeTag && !search && (
                <div style={{ marginBottom: '3rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Featured</h2>
                  <PostCard post={featuredPost} onClick={(id) => setRoute('post', { id })} />
                </div>
              )}

              <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Latest Stories</h2>
              {gridPosts.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                  {gridPosts.map((post, i) => (
                    <PostCard key={post.id} post={post} index={i} onClick={(id) => setRoute('post', { id })} />
                  ))}
                </div>
              ) : (
                <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                  <p>No posts found matching your criteria.</p>
                </div>
              )}
            </>
          )}
        </main>

        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Search
            </h4>
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Topics
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {allTags.map((tag) => (
                <TagBadge
                  key={tag}
                  tag={tag}
                  onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                />
              ))}
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--surface)', padding: '1.5rem',
            borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center',
          }}>
            <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Share your story</h4>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Have something interesting to say? Write it down.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setRoute('write')}>
              Write a Post
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
