/**
 * Sorwathe DPT — Electron Desktop App
 * Embeds the local HTTP server and opens the app in a
 * proper desktop window. No browser needed.
 */
const { app, BrowserWindow, shell } = require('electron');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const PORT = 8091; // dedicated desktop port (won't clash with start.bat)
const ROOT = __dirname;

/* ── Embedded HTTP server (same logic as server.js) ── */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.css':  'text/css; charset=utf-8',
  '.ico':  'image/x-icon',
};

function startServer() {
  const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    try { urlPath = decodeURIComponent(urlPath); } catch (e) {}
    if (!urlPath || urlPath === '/') urlPath = '/index.html';

    const filePath = path.join(ROOT, urlPath);
    if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
      res.writeHead(403); res.end('Forbidden'); return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const ct  = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        fs.readFile(path.join(ROOT, 'index.html'), (e2, d2) => {
          if (e2) { res.writeHead(404); res.end('Not found'); return; }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(d2);
        });
        return;
      }
      res.writeHead(200, { 'Content-Type': ct });
      res.end(data);
    });
  });

  return new Promise((resolve, reject) => {
    server.listen(PORT, '127.0.0.1', () => resolve(server));
    server.on('error', reject);
  });
}

/* ── Electron window ── */
let mainWindow;
let httpServer;

app.whenReady().then(async () => {
  // Start embedded server
  try {
    httpServer = await startServer();
  } catch (err) {
    console.error('Could not start embedded server:', err.message);
    app.quit();
    return;
  }

  mainWindow = new BrowserWindow({
    width:    1300,
    height:   860,
    minWidth: 900,
    minHeight: 600,
    title: 'Sorwathe DPT — Daily Production Tracker',
    icon: path.join(__dirname, 'icon.svg'),
    backgroundColor: '#fafcf5',
    webPreferences: {
      nodeIntegration:  false,
      contextIsolation: true,
      // Allow service worker to run on localhost
      allowRunningInsecureContent: false,
    },
    show: false, // wait for page to load before showing
  });

  // Remove default menu bar
  mainWindow.setMenuBarVisibility(false);

  // Load the app
  mainWindow.loadURL(`http://localhost:${PORT}/index.html`);

  // Show window once content is ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Open external links in system browser, not in app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });
});

// Shut down embedded server when app closes
app.on('before-quit', () => {
  if (httpServer) httpServer.close();
});

app.on('window-all-closed', () => {
  app.quit();
});
