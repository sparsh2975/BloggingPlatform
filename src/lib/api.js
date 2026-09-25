const API_BASE = 'http://localhost:3001/api';

export const api = {
  // Fetch all posts
  async getPosts() {
    const res = await fetch(`${API_BASE}/posts`);
    if (!res.ok) throw new Error(`Failed to fetch posts: ${res.statusText}`);
    return res.json();
  },

  // Fetch single post
  async getPost(id) {
    const res = await fetch(`${API_BASE}/posts/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch post: ${res.statusText}`);
    return res.json();
  },

  // Create a new post
  async createPost(post) {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    });
    if (!res.ok) throw new Error(`Failed to create post: ${res.statusText}`);
    return res.json();
  },

  // Update a post
  async updatePost(id, updates) {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error(`Failed to update post: ${res.statusText}`);
    return res.json();
  },

  // Like a post
  async likePost(id) {
    const res = await fetch(`${API_BASE}/posts/${id}/like`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error(`Failed to like post: ${res.statusText}`);
    return res.json();
  },

  // Delete a post
  async deletePost(id) {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete post: ${res.statusText}`);
    return res.json();
  },
};
