/**
 * middleware/errorHandler.js — Centralised error-handling middleware
 * Must be registered LAST (after all routes) in server.js.
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${err.message}`);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};

export default errorHandler;
