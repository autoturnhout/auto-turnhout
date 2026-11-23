// Tiny static preview server, no dependencies.  Run:  node dev-server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = process.env.PORT || 5173;
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
};

http.createServer((req, res) => {
  // Odd addresses (like "//" or a broken %-code) get a 400 instead of stopping the server
  let p;
  try { p = decodeURIComponent(new URL(req.url.replace(/^\/+/, '/'), 'http://x').pathname); }
  catch { res.writeHead(400); return res.end('Bad request'); }
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, path.normalize(p));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {
      'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}).on('clientError', (err, socket) => socket.destroy())
  .listen(port, () => console.log(`Preview: http://localhost:${port}`));
