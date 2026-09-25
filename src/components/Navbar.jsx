import React from 'react';

export function Navbar({ currentRoute, setRoute, toggleTheme, isLight }) {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      zIndex: 100,
      padding: '1rem 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <div 
          onClick={() => setRoute('home')}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ color: 'var(--accent)' }}>✒️</span> Inkwell
        </div>

        {/* Links & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={() => setRoute('home')}
            style={{ 
              color: currentRoute === 'home' ? 'var(--accent)' : 'var(--text)',
              fontWeight: currentRoute === 'home' ? 'bold' : 'normal'
            }}
          >
            Feed
          </button>
          <button 
            onClick={() => setRoute('myposts')}
            style={{ 
              color: currentRoute === 'myposts' ? 'var(--accent)' : 'var(--text)',
              fontWeight: currentRoute === 'myposts' ? 'bold' : 'normal'
            }}
          >
            My Posts
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setRoute('write')}
          >
            Write
          </button>
          
          <button 
            onClick={toggleTheme}
            style={{ 
              fontSize: '1.2rem',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: 'var(--bg)'
            }}
            title="Toggle theme"
          >
            {isLight ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
}
