/**
 * middleware/logger.js — Request logger middleware
 * Logs method, URL, status code, and response time for every request.
 */

const logger = (req, res, next) => {
  const start = Date.now();

  // Hook into the 'finish' event so we can log the final status code
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const { method, originalUrl } = req;
    const { statusCode } = res;

    // Color-code status for readability in terminals that support ANSI
    const color =
      statusCode >= 500
        ? '\x1b[31m' // red
        : statusCode >= 400
        ? '\x1b[33m' // yellow
        : '\x1b[32m'; // green
    const reset = '\x1b[0m';

    console.log(
      `[${timestamp}] ${method} ${originalUrl} → ${color}${statusCode}${reset} (${duration}ms)`
    );
  });

  next();
};

export default logger;
