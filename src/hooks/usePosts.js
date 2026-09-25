import { useState, useEffect } from 'react';

const STORAGE_KEY = 'inkwell_posts';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const initialMockPosts = [
  {
    id: generateId(),
    title: 'The Art of Minimalist Engineering',
    subtitle: 'Why doing less is often the best approach to building scalable software.',
    content: `## The Burden of Complexity\nIn modern software development, there's a strong temptation to adopt the latest tools, microservices architectures, and state management libraries before truly needing them.\n\n> "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away." - Antoine de Saint-Exupéry\n\n### What is Minimalist Engineering?\n1. **Solve only the current problem.** Don't over-abstract.\n2. **Choose boring technology.** Predictability over hype.\n3. **Delete code relentlessly.** Code is a liability, not an asset.\n\n\`\`\`python\ndef process_data(data):\n    return (item * 2 for item in data if item > 0)\n\`\`\`\n\nWhen building your next project, ask yourself: *What is the absolute minimum required to ship this value to the user?*`,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
    tags: ['engineering', 'minimalism', 'architecture'],
    author: 'Alice Chen',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'published',
    likes: 42
  },
  {
    id: generateId(),
    title: 'CSS Variables in the Real World',
    subtitle: 'A practical guide to implementing robust theming with pure CSS.',
    content: `CSS variables (custom properties) have revolutionized how we write styles.\n\n## The Basics\n\n\`\`\`css\n:root {\n  --primary-color: #E8A838;\n  --bg-color: #1a1a1a;\n}\n\`\`\`\n\n## Dark Mode Implementation\n\n\`\`\`css\nbody.light-theme {\n  --primary-color: #C0392B;\n  --bg-color: #FAF7F2;\n}\n\`\`\`\n\n*That's it.* All components using these variables automatically update.`,
    coverImage: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=1200',
    tags: ['css', 'frontend', 'design'],
    author: 'Bob Smith',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'published',
    likes: 128
  },
  {
    id: generateId(),
    title: 'Writing Readable Code is a Superpower',
    subtitle: 'The craft of writing code that humans — not just machines — can understand.',
    content: `## Code is Communication\n\nWe spend far more time reading code than writing it.\n\n> "Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler\n\n### 1. Naming is Everything\n\n\`\`\`javascript\n// Bad\nconst d = new Date();\nconst u = users.filter(x => x.a);\n\n// Good\nconst currentDate = new Date();\nconst activeUsers = users.filter(user => user.isActive);\n\`\`\`\n\n### 2. Functions Should Do One Thing\n\nThe Single Responsibility Principle applies to functions too.\n\n### 3. Comments Explain Why, Not What\n\nWrite code for the person who comes next — it might be you, six months from now.`,
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=1200',
    tags: ['clean-code', 'best-practices', 'engineering'],
    author: 'Marcus Webb',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    status: 'published',
    likes: 203
  }
];

export function usePosts() {
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse posts from localStorage', e);
    }
    return initialMockPosts;
  });

  const [loading] = useState(false);
  const [error] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.error('localStorage quota exceeded', e);
    }
  }, [posts]);

  const addPost = (post) => {
    const newPost = {
      ...post,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0
    };
    setPosts(prev => [newPost, ...prev]);
    return newPost.id;
  };

  const updatePost = (id, updates) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
  };

  const deletePost = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const toggleLike = (id) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, likes: (p.likes || 0) + 1 } : p
    ));
  };

  return { posts, loading, error, addPost, updatePost, deletePost, toggleLike };
}
