/* ═══════════════════════════════════════════
   Sorwathe DPT — Service Worker
   Caches the app and all CDN assets on first
   load so it works fully offline after that.
═══════════════════════════════════════════ */
const CACHE = 'sorwathe-dpt-v1';

/* Resources to grab immediately on install */
const PRE_CACHE = [
  './index.html',
  './manifest.json',
  './icon.svg',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&family=Nunito:wght@400;500;600;700;800&display=swap',
];

/* ── Install: pre-cache everything ───────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      /* allSettled so one CDN failure doesn't break the whole install */
      Promise.allSettled(PRE_CACHE.map(url => cache.add(url)))
    ).then(() => self.skipWaiting())
  );
});

/* ── Activate: delete old cache versions ─── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: cache-first strategy ─────────── */
self.addEventListener('fetch', event => {
  /* Only handle GET requests */
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        /* Serve from cache; refresh cache in background */
        fetch(event.request)
          .then(fresh => {
            if (fresh && fresh.status === 200) {
              caches.open(CACHE).then(c => c.put(event.request, fresh));
            }
          })
          .catch(() => {/* offline — that's fine, we served from cache */});
        return cached;
      }

      /* Not in cache yet — fetch, cache, and return */
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(event.request, clone));
        return response;
      }).catch(() => {
        /* Offline and not cached: return the app shell for navigation requests */
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
