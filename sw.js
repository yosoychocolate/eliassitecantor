const CACHE = 'ministerio-v4.1';

const PRECACHE = [
  './css/style.css',
  './css/platform.css',
  './css/videoteca.css',
  './css/home-viva.css',
  './content/config.json',
  './content/eventos.json',
  './content/musicas.json',
  './content/videos.json',
  './content/historia-dia.json',
  './content/testemunhos.json',
  './content/timeline.json',
  './content/biografia.json'
];

async function precacheAssets() {
  const cache = await caches.open(CACHE);
  await Promise.all(
    PRECACHE.map(async (url) => {
      try {
        const res = await fetch(url, { redirect: 'follow' });
        if (res.ok && res.status < 300) await cache.put(url, res);
      } catch {
        /* ignora falha individual no precache */
      }
    })
  );
}

self.addEventListener('install', (e) => {
  e.waitUntil(precacheAssets().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  /* Páginas HTML: não interceptar — evita ERR_FAILED com redirects do servidor */
  if (e.request.mode === 'navigate' || e.request.destination === 'document') return;

  /* JSON: rede primeiro */
  if (url.pathname.includes('/content/')) {
    e.respondWith(
      fetch(e.request, { redirect: 'follow' })
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  /* JS: rede primeiro — garante correções imediatas */
  if (/\.js$/i.test(url.pathname)) {
    e.respondWith(
      fetch(e.request, { redirect: 'follow' })
        .then(res => {
          if (res.ok && res.status < 300) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  /* CSS / imagens: cache primeiro */
  if (/\.(css|png|jpe?g|svg|webp|woff2?|ico)$/i.test(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request, { redirect: 'follow' }).then(res => {
          if (res.ok && res.status < 300) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
  }
});
