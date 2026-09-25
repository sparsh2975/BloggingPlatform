/**
 * routes/visitors.js — All /visitors endpoints
 *
 * GET    /visitors/count  → total active visitor count  (bonus)
 * GET    /visitors        → list all visitors
 * GET    /visitors/:id    → get one visitor by ID
 * POST   /visitors        → check in a new visitor
 * DELETE /visitors/:id    → check out (remove) a visitor
 *
 * NOTE: /visitors/count MUST be declared before /visitors/:id so Express
 * does not try to interpret "count" as a numeric ID parameter.
 */

import { Router } from 'express';
import store from '../store/visitors.js';

const router = Router();

/* ─── Helper ──────────────────────────────────────────────────── */

/**
 * Parse and validate a visitor ID from a route parameter.
 * Throws a structured error that errorHandler can forward to the client.
 * @param {string} param  Raw string from req.params.id
 * @returns {number}      Validated positive integer
 */
const parseId = (param) => {
  const id = Number(param);
  if (!Number.isInteger(id) || id < 1) {
    const err = new Error(`Invalid ID "${param}". ID must be a positive integer.`);
    err.statusCode = 400;
    throw err;
  }
  return id;
};

/* ─── Routes ──────────────────────────────────────────────────── */

/**
 * GET /visitors/count
 * Returns the total number of visitors currently checked in.
 */
router.get('/count', (req, res) => {
  res.json({
    success: true,
    count: store.count(),
  });
});

/**
 * GET /visitors
 * Returns all current visitors.
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    total: store.count(),
    visitors: store.getAll(),
  });
});

/**
 * GET /visitors/:id
 * Returns a single visitor identified by their ID.
 */
router.get('/:id', (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const visitor = store.getById(id);

    if (!visitor) {
      const err = new Error(`Visitor with ID ${id} not found.`);
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, visitor });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /visitors
 * Check in a new visitor.
 * Body: { "name": "Alice" }
 */
router.post('/', (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      const err = new Error('Field "name" is required and must be a non-empty string.');
      err.statusCode = 400;
      return next(err);
    }

    const visitor = store.add(name);
    res.status(201).json({ success: true, visitor });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /visitors/:id
 * Check out (remove) a visitor by ID.
 */
router.delete('/:id', (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const removed = store.remove(id);

    if (!removed) {
      const err = new Error(`Visitor with ID ${id} not found.`);
      err.statusCode = 404;
      return next(err);
    }

    res.json({
      success: true,
      message: `Visitor "${removed.name}" has been checked out.`,
      visitor: removed,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
