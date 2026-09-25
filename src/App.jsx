import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './views/HomePage';
import { PostReader } from './views/PostReader';
import { MarkdownEditor } from './views/MarkdownEditor';
import { MyPosts } from './views/MyPosts';
import { usePosts } from './hooks/usePosts';

export default function App() {
  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem('inkwell_theme') === 'light';
  });
  const [route, setRouteState] = useState('home');
  const [routeParams, setRouteParams] = useState({});

  const { posts, loading, addPost, updatePost, deletePost, toggleLike } = usePosts();

  useEffect(() => {
    document.body.classList.toggle('light', isLight);
    localStorage.setItem('inkwell_theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  const setRoute = (newRoute, params = {}) => {
    setRouteState(newRoute);
    setRouteParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSavePost = async (postData) => {
    if (postData.id) {
      await updatePost(postData.id, postData);
    } else {
      await addPost(postData);
    }
  };

  const currentPost = routeParams.id ? posts.find((p) => p.id === routeParams.id) : null;
  const editPost = route === 'write' && routeParams.id ? currentPost : null;

  // Full-screen editor (no navbar)
  if (route === 'write') {
    return (
      <div style={{ height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        <MarkdownEditor
          initialPost={editPost}
          onSave={handleSavePost}
          setRoute={setRoute}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)', transition: 'background-color 0.3s, color 0.3s' }}>
      <Navbar
        currentRoute={route}
        setRoute={setRoute}
        toggleTheme={() => setIsLight((l) => !l)}
        isLight={isLight}
      />

      <main style={{ opacity: 1, transition: 'opacity 0.3s ease' }}>
        {route === 'home' && (
          <HomePage posts={posts} loading={loading} setRoute={setRoute} />
        )}
        {route === 'post' && currentPost && (
          <PostReader
            post={currentPost}
            posts={posts}
            setRoute={setRoute}
            onLike={toggleLike}
          />
        )}
        {route === 'post' && !currentPost && (
          <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔍</div>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Post not found</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>This post may have been removed or the link is invalid.</p>
            <button className="btn btn-primary" onClick={() => setRoute('home')}>← Back to Feed</button>
          </div>
        )}
        {route === 'myposts' && (
          <MyPosts posts={posts} loading={loading} setRoute={setRoute} onDelete={deletePost} />
        )}
      </main>

      {route !== 'write' && (
        <footer style={{
          borderTop: '1px solid var(--border)', padding: '2rem 0', marginTop: '4rem',
          textAlign: 'center', color: 'var(--muted)', fontSize: '0.9rem'
        }}>
          <div className="container">
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'bold', color: 'var(--text)' }}>Inkwell</span>
            {' '}— An editorial publishing experience.
          </div>
        </footer>
      )}
    </div>
  );
}
