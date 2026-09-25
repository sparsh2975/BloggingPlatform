const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// ─────────────────────────────────────────────
//  In-Memory Store
// ─────────────────────────────────────────────
let visitors = [];
let nextId = 1;

// ─────────────────────────────────────────────
//  Middleware
// ─────────────────────────────────────────────
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────
//  API Routes
// ─────────────────────────────────────────────

// GET /visitors → all visitors
app.get('/visitors', (req, res) => {
  res.json(visitors);
});

// GET /visitors/count → total count
app.get('/visitors/count', (req, res) => {
  res.json({ count: visitors.length });
});

// GET /visitors/:id → single visitor
app.get('/visitors/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const visitor = visitors.find((v) => v.id === id);
  if (!visitor) {
    return res.status(404).json({ error: `Visitor with id ${id} not found.` });
  }
  res.json(visitor);
});

// POST /visitors → add a visitor { name }
app.post('/visitors', (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'A non-empty "name" field is required.' });
  }

  const visitor = {
    id: nextId++,
    name: name.trim(),
    checkInTime: new Date().toISOString(),
  };

  visitors.push(visitor);
  res.status(201).json(visitor);
});

// DELETE /visitors/:id → remove a visitor
app.delete('/visitors/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = visitors.findIndex((v) => v.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Visitor with id ${id} not found.` });
  }

  const [removed] = visitors.splice(index, 1);
  res.json({ message: `Visitor "${removed.name}" removed successfully.`, visitor: removed });
});

// ─────────────────────────────────────────────
//  404 catch-all for unknown API routes
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─────────────────────────────────────────────
//  Start Server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Visitor Manager running at http://localhost:${PORT}\n`);
});
