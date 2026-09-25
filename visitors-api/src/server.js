/**
 * server.js — HTTP server entry point
 * Imports the configured Express app and binds it to a port.
 */

import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║      Visitor Management API v1.0.0       ║');
  console.log('  ╠══════════════════════════════════════════╣');
  console.log(`  ║  Server   →  http://localhost:${PORT}         ║`);
  console.log(`  ║  Started  →  ${new Date().toLocaleTimeString()}                  ║`);
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
});
