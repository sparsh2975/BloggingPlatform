import { createClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'inkwell_supabase_url';
const STORAGE_ANON_KEY = 'inkwell_supabase_anon_key';

export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_ANON_KEY) || '' : '';

  const url = (storedUrl || envUrl).trim();
  const anonKey = (storedKey || envKey).trim();

  const isConfigured = Boolean(
    url &&
    anonKey &&
    (url.startsWith('http://') || url.startsWith('https://')) &&
    !url.includes('placeholder') &&
    !url.includes('your-project')
  );

  return { url, anonKey, isConfigured, isFromEnv: Boolean(envUrl && envKey) };
}

export function saveSupabaseCredentials(url, anonKey) {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_URL_KEY, url.trim());
    else localStorage.removeItem(STORAGE_URL_KEY);

    if (anonKey) localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
    else localStorage.removeItem(STORAGE_ANON_KEY);

    window.dispatchEvent(new Event('supabase-config-changed'));
  }
}

export function clearSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_ANON_KEY);
    window.dispatchEvent(new Event('supabase-config-changed'));
  }
}

export function initSupabaseClient() {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  try {
    return createClient(url, anonKey, {
      auth: {
        persistSession: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}

export let supabase = initSupabaseClient();

export function updateSupabaseInstance() {
  supabase = initSupabaseClient();
  return supabase;
}

export function mapFromDb(dbPost) {
  if (!dbPost) return null;
  return {
    id: dbPost.id,
    title: dbPost.title || '',
    subtitle: dbPost.subtitle || '',
    content: dbPost.content || '',
    coverImage: dbPost.cover_image || dbPost.coverImage || '',
    tags: Array.isArray(dbPost.tags) ? dbPost.tags : [],
    author: dbPost.author || 'Anonymous',
    status: dbPost.status || 'published',
    likes: typeof dbPost.likes === 'number' ? dbPost.likes : 0,
    createdAt: dbPost.created_at || dbPost.createdAt || new Date().toISOString(),
    updatedAt: dbPost.updated_at || dbPost.updatedAt || new Date().toISOString(),
  };
}

export function mapToDb(post) {
  const payload = {
    title: post.title,
    subtitle: post.subtitle || '',
    content: post.content || '',
    cover_image: post.coverImage || '',
    tags: Array.isArray(post.tags) ? post.tags : [],
    author: post.author || 'Anonymous',
    status: post.status || 'published',
    updated_at: new Date().toISOString(),
  };
  if (post.likes !== undefined) payload.likes = post.likes;
  if (post.id && !String(post.id).startsWith('temp-')) payload.id = post.id;
  return payload;
}
