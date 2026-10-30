import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { EditorToolbar } from '../components/EditorToolbar';

const DRAFT_KEY = 'inkwell_draft';

function getEditorDraft(initialPost) {
  if (initialPost) return { title: initialPost.title || '', subtitle: initialPost.subtitle || '', coverImage: initialPost.coverImage || '', content: initialPost.content || '', author: initialPost.author || '', tagsInput: initialPost.tags?.join(', ') || '' };

  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return {};
    const draft = JSON.parse(saved);
    return {
      title: draft.title || '', subtitle: draft.subtitle || '', coverImage: draft.coverImage || '',
      content: draft.content || '', author: draft.author || '', tagsInput: draft.tagsInput || '',
    };
  } catch (error) {
    console.warn('Failed to restore the editor draft', error);
    return {};
  }
}

export function MarkdownEditor({ initialPost, onSave, setRoute }) {
  const isEditing = !!initialPost;
  const [initialDraft] = useState(() => getEditorDraft(initialPost));

  const [title, setTitle] = useState(initialDraft.title || '');
  const [subtitle, setSubtitle] = useState(initialDraft.subtitle || '');
  const [coverImage, setCoverImage] = useState(initialDraft.coverImage || '');
  const [content, setContent] = useState(initialDraft.content || '');
  const [author, setAuthor] = useState(initialDraft.author || '');
  const [tagsInput, setTagsInput] = useState(initialDraft.tagsInput || '');
  const [viewMode, setViewMode] = useState('split');
  const [saveLabel, setSaveLabel] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.ceil(wordCount / 200);
  const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

  // Auto-save draft
  useEffect(() => {
    if (!isEditing) {
      const timer = setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, subtitle, coverImage, content, author, tagsInput }));
        setSaveLabel(`Saved at ${new Date().toLocaleTimeString()}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [title, subtitle, coverImage, content, author, tagsInput, isEditing]);


  const insertSyntax = (syntax) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart, end = el.selectionEnd;
    const newContent = content.substring(0, start) + syntax + content.substring(end);
    setContent(newContent);
    setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = start + syntax.length; }, 0);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCoverImage(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      alert("Failed to read the file.");
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = (status) => {
    if (!title.trim() || !content.trim() || !author.trim()) {
      alert('Title, author, and content are required.'); return;
    }
    const post = { ...(initialPost || {}), title, subtitle, coverImage, content, author, tags, status };
    onSave(post);
    localStorage.removeItem(DRAFT_KEY);
    setRoute('myposts');
  };

  const handleClear = () => {
    if (window.confirm('Clear all content?')) {
      setTitle(''); setSubtitle(''); setCoverImage(''); setContent(''); setAuthor(''); setTagsInput('');
      localStorage.removeItem(DRAFT_KEY);
    }
  };

  const editorPane = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <EditorToolbar onInsert={insertSyntax} />
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your story in markdown..."
        spellCheck={false}
        style={{
          flex: 1, resize: 'none', padding: '1.5rem', fontFamily: 'var(--font-mono)',
          fontSize: '0.95rem', lineHeight: 1.7, backgroundColor: '#1e1e2e',
          color: '#cdd6f4', border: 'none', outline: 'none', overflowY: 'auto'
        }}
      />
    </div>
  );

  const previewPane = (
    <div style={{ overflowY: 'auto', padding: '2rem 2.5rem', backgroundColor: 'var(--bg)', height: '100%' }}>
      {title && (
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '0.75rem' }}>{title}</h1>
      )}
      {subtitle && (
        <p style={{ color: 'var(--muted)', fontStyle: 'italic', marginBottom: '1.5rem', fontSize: '1.1rem' }}>{subtitle}</p>
      )}
      {coverImage && (
        <img src={coverImage} alt="Cover" style={{ width: '100%', height: 'auto', borderRadius: '8px', marginBottom: '1.5rem', display: 'block' }} />
      )}
      <div className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {content || '*Nothing to preview yet...*'}
        </ReactMarkdown>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg)' }}>
      {/* Top bar */}
      <div style={{
        backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', flexShrink: 0
      }}>
        <button onClick={() => setRoute('home')} style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>← Back</button>
        <input
          type="text" placeholder="Post title..." value={title} onChange={e => setTitle(e.target.value)}
          style={{
            flex: 1, border: 'none', background: 'transparent', fontFamily: 'var(--font-display)',
            fontSize: '1.4rem', fontWeight: 'bold', padding: '0', color: 'var(--text)', minWidth: '200px'
          }}
        />
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
          {saveLabel && <span style={{ color: 'var(--accent)' }}>✓ {saveLabel}</span>}
          <span>{wordCount} words · {readTime} min read</span>
        </div>
        <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem' }} onClick={handleClear}>Clear</button>
        <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem' }} onClick={() => handleSave('draft')}>Save Draft</button>
        <button className="btn btn-primary" style={{ padding: '0.4rem 0.9rem' }} onClick={() => handleSave('published')}>
          {isEditing ? 'Update' : 'Publish'}
        </button>
      </div>

      {/* Meta fields row */}
      <div style={{
        backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0.6rem 1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', flexShrink: 0
      }}>
        <input type="text" placeholder="Subtitle / excerpt..." value={subtitle} onChange={e => setSubtitle(e.target.value)}
          style={{ flex: 2, minWidth: '160px', fontSize: '0.9rem' }} />
        <input type="text" placeholder="Author name..." value={author} onChange={e => setAuthor(e.target.value)}
          style={{ flex: 1, minWidth: '120px', fontSize: '0.9rem' }} />
        <div style={{ display: 'flex', gap: '0.4rem', flex: 2, minWidth: '200px' }}>
          <input type="text" placeholder="Cover image URL..." value={coverImage} onChange={e => setCoverImage(e.target.value)}
            style={{ flex: 1, fontSize: '0.9rem' }} />
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
          <button
            className="btn btn-outline"
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.82rem', whiteSpace: 'nowrap', flexShrink: 0 }}
            onClick={() => fileInputRef.current?.click()}
            title="Upload cover image"
          >
            📷 Upload
          </button>
        </div>
        <input type="text" placeholder="Tags (comma-separated)..." value={tagsInput} onChange={e => setTagsInput(e.target.value)}
          style={{ flex: 2, minWidth: '160px', fontSize: '0.9rem' }} />

        {/* View mode toggle */}
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
          {['editor', 'split', 'preview'].map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              padding: '0.3rem 0.65rem', fontSize: '0.78rem', textTransform: 'capitalize',
              backgroundColor: viewMode === mode ? 'var(--accent)' : 'transparent',
              color: viewMode === mode ? '#1a1a1a' : 'var(--text)',
              fontWeight: viewMode === mode ? '600' : 'normal'
            }}>{mode}</button>
          ))}
        </div>
      </div>

      {/* Editor / Preview panes */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
            borderRight: viewMode === 'split' ? '1px solid #313244' : 'none'
          }}>
            {editorPane}
          </div>
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {previewPane}
          </div>
        )}
      </div>
    </div>
  );
}
