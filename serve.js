#!/usr/bin/env node
// Zero-dependency static file server for the built app
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, 'app_build');
const PORT = 3000;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.map': 'application/json',
};

const server = createServer((req, res) => {
    const url = req.url.split('?')[0].replace(/\/+/g, '/');
    let filePath = resolve(ROOT, '.' + url);

    // Security: prevent path traversal
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    // Try to serve the file, fall back to index.html for SPA routing
    let stat;
    try {
        stat = statSync(filePath);
        if (stat.isDirectory()) filePath = join(filePath, 'index.html');
    } catch {
        filePath = join(ROOT, 'index.html');
    }

    const ext = extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', ext === '.html' ? 'no-cache' : 'max-age=31536000,immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const stream = createReadStream(filePath);
    stream.on('error', (err) => {
        if (!res.headersSent) {
            res.writeHead(404);
            res.end(`Not found: ${url}`);
        }
    });
    stream.pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ✅ Workflow Studio running at:`);
    console.log(`     http://localhost:${PORT}\n`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Kill it with: lsof -ti:${PORT} | xargs kill -9`);
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});
