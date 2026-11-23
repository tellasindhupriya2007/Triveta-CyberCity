import express from 'express';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const htmlPath = path.join(__dirname, 'code.html');
const thankYouPath = path.join(__dirname, 'thank-you.html');

function sendHtmlFile(req, res, filePath) {
  const html = fs.readFileSync(filePath);
  const acceptEncoding = req.headers['accept-encoding'] || '';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Vary', 'Accept-Encoding');

  if (acceptEncoding.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
    return res.send(zlib.gzipSync(html));
  }
  return res.send(html);
}

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nSitemap: /sitemap.xml\n');
});

app.get('/sitemap.xml', (req, res) => {
  const origin = `${req.protocol}://${req.get('host')}`;
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
});

app.use(
  '/assets/images',
  express.static(path.join(__dirname, 'assets', 'images'), {
    maxAge: '365d',
    immutable: true,
  })
);

app.get('/thank-you', (req, res) => sendHtmlFile(req, res, thankYouPath));
app.get('/thank-you.html', (req, res) => sendHtmlFile(req, res, thankYouPath));
app.get('/code.html', (req, res) => sendHtmlFile(req, res, htmlPath));
app.get('/', (req, res) => sendHtmlFile(req, res, htmlPath));
app.use(express.static(__dirname, { index: false }));
app.use((req, res) => sendHtmlFile(req, res, htmlPath));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
