/**
 * app.js — Express application factory
 * Separating the app configuration from the HTTP server makes the app
 * independently testable without actually binding to a port.
 */

import express from 'express';
import logger from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import visitorRoutes from './routes/visitors.js';

const app = express();

/* ─── Global Middleware ───────────────────────────────────────── */

// Parse incoming JSON bodies
app.use(express.json());

// Log every request with timestamp & response time
app.use(logger);

/* ─── Routes ──────────────────────────────────────────────────── */

app.use('/visitors', visitorRoutes);

// Health-check / root
app.get('/', (req, res) => {
  res.json({
    message: 'Visitor Management API is running 🚀',
    version: '1.0.0',
    endpoints: {
      'GET    /visitors':        'List all current visitors',
      'GET    /visitors/count':  'Get total visitor count',
      'GET    /visitors/:id':    'Get a visitor by ID',
      'POST   /visitors':        'Check in a new visitor  { name }',
      'DELETE /visitors/:id':    'Check out a visitor',
    },
  });
});

// 404 catch-all for unrecognised routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

/* ─── Centralised Error Handler (must be last) ────────────────── */
app.use(errorHandler);

export default app;
