import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

// ──────────────────────────────────────
//  Initialize database table
// ──────────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      subtitle TEXT,
      content TEXT NOT NULL DEFAULT '',
      cover_image TEXT,
      tags TEXT[] DEFAULT '{}',
      author TEXT NOT NULL DEFAULT 'Anonymous',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft')),
      likes INTEGER DEFAULT 0
    );
  `);
  console.log('✅ Database table ready');
}

// ──────────────────────────────────────
//  GET /api/posts — List all posts
// ──────────────────────────────────────
app.get('/api/posts', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM posts ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/posts error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
//  GET /api/posts/:id — Get single post
// ──────────────────────────────────────
app.get('/api/posts/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM posts WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/posts/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
//  POST /api/posts — Create a new post
// ──────────────────────────────────────
app.post('/api/posts', async (req, res) => {
  try {
    const { title, subtitle, content, cover_image, tags, author, status } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO posts (title, subtitle, content, cover_image, tags, author, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        title,
        subtitle || null,
        content || '',
        cover_image || null,
        tags || [],
        author || 'Anonymous',
        status || 'published',
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/posts error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
//  PUT /api/posts/:id — Update a post
// ──────────────────────────────────────
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { title, subtitle, content, cover_image, tags, author, status, likes } = req.body;
    const { rows } = await pool.query(
      `UPDATE posts SET
        title = COALESCE($1, title),
        subtitle = COALESCE($2, subtitle),
        content = COALESCE($3, content),
        cover_image = COALESCE($4, cover_image),
        tags = COALESCE($5, tags),
        author = COALESCE($6, author),
        status = COALESCE($7, status),
        likes = COALESCE($8, likes),
        updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [title, subtitle, content, cover_image, tags, author, status, likes, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('PUT /api/posts/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
//  PATCH /api/posts/:id/like — Increment likes
// ──────────────────────────────────────
app.patch('/api/posts/:id/like', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE posts SET likes = likes + 1, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('PATCH /api/posts/:id/like error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
//  DELETE /api/posts/:id — Delete a post
// ──────────────────────────────────────
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM posts WHERE id = $1',
      [req.params.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('DELETE /api/posts/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
//  Start server
// ──────────────────────────────────────
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Inkwell API running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
