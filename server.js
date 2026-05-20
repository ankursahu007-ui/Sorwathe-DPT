/**
 * Sorwathe DPT — Local HTTP Server
 * Runs on Node.js (no extra packages needed).
 * Start via start.bat or:  node server.js
 */
const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const PORT = 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.css':  'text/css; charset=utf-8',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  // Strip query string and decode URI
  let urlPath = req.url.split('?')[0];
  try { urlPath = decodeURIComponent(urlPath); } catch (e) {}

  // Default to index.html
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  // Prevent directory traversal
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Fall back to index.html so PWA navigation works
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(ROOT, 'index.html'), (e2, d2) => {
          if (e2) { res.writeHead(404); res.end('Not found'); return; }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(d2);
        });
      } else {
        res.writeHead(500); res.end('Server error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

function getLocalIP() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return null;
}

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  const line = '='.repeat(44);
  console.log('');
  console.log('  ' + line);
  console.log('   SORWATHE DAILY PRODUCTION TRACKER');
  console.log('  ' + line);
  console.log('');
  console.log('  Server is running!');
  console.log('');
  console.log('  On this computer:');
  console.log('    http://localhost:' + PORT);
  if (ip) {
    console.log('');
    console.log('  On your phone / tablet (same WiFi):');
    console.log('    http://' + ip + ':' + PORT);
    console.log('');
    console.log('  To install on phone: open the link in Chrome,');
    console.log('  tap the 3-dot menu, then "Add to Home Screen".');
  }
  console.log('');
  console.log('  Press Ctrl+C to stop.');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('  ERROR: Port ' + PORT + ' is already in use.');
    console.error('  Close any other server using that port and try again.');
  } else {
    console.error('  Server error:', err.message);
  }
  process.exit(1);
});
