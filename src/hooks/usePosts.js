import { useState, useEffect, useCallback, useRef } from 'react';
import {
  initSupabaseClient,
  getSupabaseCredentials,
  mapFromDb,
  mapToDb,
} from '../lib/supabase';

const STORAGE_KEY = 'inkwell_posts';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const initialMockPosts = [
  {
    id: 'mock-1',
    title: 'The Art of Minimalist Engineering',
    subtitle: 'Why doing less is often the best approach to building scalable software.',
    content: `## The Burden of Complexity\nIn modern software development, there's a strong temptation to adopt the latest tools, microservices architectures, and state management libraries before truly needing them.\n\n> "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away." - Antoine de Saint-Exupéry\n\n### What is Minimalist Engineering?\n1. **Solve only the current problem.** Don't over-abstract.\n2. **Choose boring technology.** Predictability over hype.\n3. **Delete code relentlessly.** Code is a liability, not an asset.\n\n\`\`\`python\ndef process_data(data):\n    return (item * 2 for item in data if item > 0)\n\`\`\`\n\nWhen building your next project, ask yourself: *What is the absolute minimum required to ship this value to the user?*`,
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200',
    tags: ['engineering', 'minimalism', 'architecture'],
    author: 'Alice Chen',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'published',
    likes: 42,
  },
  {
    id: 'mock-2',
    title: 'CSS Variables in the Real World',
    subtitle: 'A practical guide to implementing robust theming with pure CSS.',
    content: `CSS variables (custom properties) have revolutionized how we write styles.\n\n## The Basics\n\n\`\`\`css\n:root {\n  --primary-color: #E8A838;\n  --bg-color: #1a1a1a;\n}\n\`\`\`\n\n## Dark Mode Implementation\n\n\`\`\`css\nbody.light-theme {\n  --primary-color: #C0392B;\n  --bg-color: #FAF7F2;\n}\n\`\`\`\n\n*That's it.* All components using these variables automatically update.`,
    coverImage: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=1200',
    tags: ['css', 'frontend', 'design'],
    author: 'Bob Smith',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'published',
    likes: 128,
  },
  {
    id: 'mock-3',
    title: 'Writing Readable Code is a Superpower',
    subtitle: 'The craft of writing code that humans — not just machines — can understand.',
    content: `## Code is Communication\n\nWe spend far more time reading code than writing it.\n\n> "Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler\n\n### 1. Naming is Everything\n\n\`\`\`javascript\n// Bad\nconst d = new Date();\nconst u = users.filter(x => x.a);\n\n// Good\nconst currentDate = new Date();\nconst activeUsers = users.filter(user => user.isActive);\n\`\`\`\n\n### 2. Functions Should Do One Thing\n\nThe Single Responsibility Principle applies to functions too.\n\n### 3. Comments Explain Why, Not What\n\nWrite code for the person who comes next — it might be you, six months from now.`,
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=1200',
    tags: ['clean-code', 'best-practices', 'engineering'],
    author: 'Marcus Webb',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    status: 'published',
    likes: 203,
  },
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('local'); // 'connected' | 'connecting' | 'local' | 'error'
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const supabaseClientRef = useRef(null);
  const channelRef = useRef(null);

  // Sync state to localStorage as offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
      console.warn('localStorage quota warning', e);
    }
  }, [posts]);

  // Fetch posts from database
  const fetchPosts = useCallback(async (client) => {
    if (!client) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchErr } = await client
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      if (data && data.length > 0) {
        const mapped = data.map(mapFromDb);
        setPosts(mapped);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch posts from Supabase:', err);
      setError(err.message || 'Database fetch failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Connect to Supabase and subscribe to Realtime updates
  const connectDatabase = useCallback(() => {
    // Cleanup any existing channel
    if (channelRef.current && supabaseClientRef.current) {
      supabaseClientRef.current.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const { isConfigured } = getSupabaseCredentials();

    if (!isConfigured) {
      supabaseClientRef.current = null;
      setConnectionStatus('local');
      return;
    }

    const client = initSupabaseClient();
    supabaseClientRef.current = client;

    if (!client) {
      setConnectionStatus('error');
      return;
    }

    setConnectionStatus('connecting');

    // 1. Initial query from Supabase
    fetchPosts(client);

    // 2. Set up Realtime listener on 'posts' table
    try {
      const channel = client
        .channel('realtime:public:posts')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'posts' },
          (payload) => {
            console.log('[Realtime] Database event received:', payload.eventType, payload);
            setLastSyncTime(new Date());

            if (payload.eventType === 'INSERT') {
              const newPost = mapFromDb(payload.new);
              setPosts((prev) => {
                const exists = prev.some((p) => p.id === newPost.id);
                if (exists) {
                  return prev.map((p) => (p.id === newPost.id ? newPost : p));
                }
                return [newPost, ...prev];
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedPost = mapFromDb(payload.new);
              setPosts((prev) =>
                prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
              );
            } else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old?.id;
              if (deletedId) {
                setPosts((prev) => prev.filter((p) => p.id !== deletedId));
              }
            }
          }
        )
        .subscribe((status, err) => {
          console.log('[Realtime] Channel status:', status, err || '');
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected');
          } else if (status === 'CHANNEL_ERROR') {
            setConnectionStatus('error');
            console.warn('[Realtime] Subscription failed. Please verify that `ALTER PUBLICATION supabase_realtime ADD TABLE posts;` was executed.');
          } else if (status === 'CLOSED') {
            setConnectionStatus('connecting');
          }
        });

      channelRef.current = channel;
    } catch (subErr) {
      console.error('[Realtime] Error subscribing:', subErr);
      setConnectionStatus('error');
    }
  }, [fetchPosts]);

  // Initial connect and listen for config changes
  useEffect(() => {
    const timer = window.setTimeout(connectDatabase, 0);

    const handleConfigChange = () => {
      connectDatabase();
    };

    window.addEventListener('supabase-config-changed', handleConfigChange);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('supabase-config-changed', handleConfigChange);
      if (channelRef.current && supabaseClientRef.current) {
        supabaseClientRef.current.removeChannel(channelRef.current);
      }
    };
  }, [connectDatabase]);

  // Actions
  const addPost = async (post) => {
    const client = supabaseClientRef.current;
    if (client) {
      try {
        const payload = mapToDb(post);
        // Supabase will generate the UUID and timestamps
        const { data, error: insertErr } = await client
          .from('posts')
          .insert([payload])
          .select()
          .single();

        if (insertErr) throw insertErr;

        const created = mapFromDb(data);
        setPosts((prev) => {
          if (prev.some((p) => p.id === created.id)) return prev;
          return [created, ...prev];
        });
        return created.id;
      } catch (err) {
        console.error('Failed to create post on Supabase:', err);
        throw err;
      }
    } else {
      // Local fallback
      const newPost = {
        ...post,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
      };
      setPosts((prev) => [newPost, ...prev]);
      return newPost.id;
    }
  };

  const updatePost = async (id, updates) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );

    const client = supabaseClientRef.current;
    if (client && !String(id).startsWith('mock-')) {
      try {
        const payload = mapToDb(updates);
        delete payload.id; // Avoid mutating primary key

        const { data, error: updateErr } = await client
          .from('posts')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (updateErr) throw updateErr;

        if (data) {
          const mapped = mapFromDb(data);
          setPosts((prev) => prev.map((p) => (p.id === id ? mapped : p)));
        }
      } catch (err) {
        console.error('Failed to update post on Supabase:', err);
      }
    }
  };

  const deletePost = async (id) => {
    // Optimistic UI update
    setPosts((prev) => prev.filter((p) => p.id !== id));

    const client = supabaseClientRef.current;
    if (client && !String(id).startsWith('mock-')) {
      try {
        const { error: delErr } = await client
          .from('posts')
          .delete()
          .eq('id', id);

        if (delErr) throw delErr;
      } catch (err) {
        console.error('Failed to delete post on Supabase:', err);
      }
    }
  };

  const toggleLike = async (id) => {
    const post = posts.find((p) => p.id === id);
    const newLikes = (post?.likes || 0) + 1;

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: newLikes } : p))
    );

    const client = supabaseClientRef.current;
    if (client && !String(id).startsWith('mock-')) {
      try {
        const { error: likeErr } = await client
          .from('posts')
          .update({ likes: newLikes, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (likeErr) throw likeErr;
      } catch (err) {
        console.error('Failed to like post on Supabase:', err);
      }
    }
  };

  const refreshPosts = () => {
    if (supabaseClientRef.current) {
      fetchPosts(supabaseClientRef.current);
    }
  };

  return {
    posts,
    loading,
    error,
    connectionStatus,
    isRealtime: connectionStatus === 'connected',
    lastSyncTime,
    addPost,
    updatePost,
    deletePost,
    toggleLike,
    refreshPosts,
  };
}
