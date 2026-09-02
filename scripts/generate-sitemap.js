/**
 * Gera sitemap.xml e robots.txt a partir de content/eventos.json
 * Uso: node scripts/generate-sitemap.js [siteUrl]
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const siteUrl = (process.argv[2] || 'https://ministerioeliassilva.com.br').replace(/\/$/, '');
const eventos = JSON.parse(fs.readFileSync(path.join(root, 'content/eventos.json'), 'utf8')).eventos;

const staticPages = ['', '/memoriais.html', '/tv.html', '/videoteca.html', '/discografia.html'];
const memorialPages = eventos
  .filter(e => e.slug && e.data)
  .map(e => `/memorial/${e.slug}`);

const urls = [...staticPages, ...memorialPages];
const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${siteUrl}${u || '/'}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq></url>`).join('\n')}
</urlset>`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(root, 'robots.txt'), robots);
console.log(`OK — ${urls.length} URLs em sitemap.xml`);
