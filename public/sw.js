const CACHE_NAME = 'trendimovies-v4';
const STATIC_CACHE = 'trendimovies-static-v4';
const DYNAMIC_CACHE = 'trendimovies-dynamic-v4';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/movies',
  '/series',
  '/offline',
  '/images/no-poster.svg',
  '/images/logo.svg'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // cache.addAll() is all-or-nothing -- one failed request (a transient
      // blip on a weak connection, most likely exactly on a visitor's very
      // first load) silently failed the ENTIRE static cache, including
      // '/offline'. That left the fetch handler's offline fallback below
      // with nothing to serve, which crashed as "FetchEvent.respondWith
      // received an error: Returned response is null." Cache each asset on
      // its own instead, so one miss doesn't take the rest down with it.
      return Promise.all(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.log(`Failed to cache ${url}:`, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate and clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch strategy: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API requests and admin pages from caching
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) {
    return;
  }

  // Build assets (/_astro/*) are content-hashed. Always fetch them fresh from
  // the network and never serve a stale cached copy — this prevents old CSS/JS
  // (e.g. an outdated header style) from sticking around after a deploy.
  if (url.origin === self.location.origin && url.pathname.startsWith('/_astro/')) {
    event.respondWith(fetch(request));
    return;
  }

  // For TMDB images, use cache-first strategy
  if (url.hostname === 'image.tmdb.org') {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // For pages, use network-first strategy
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // If it's a page request, show offline page -- but '/offline'
          // itself might not be cached (see the install handler above), so
          // this must never resolve to nothing. respondWith() receiving an
          // undefined/null response is what crashes the page with
          // "Returned response is null", not a graceful offline screen.
          if (request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/offline').then((offlinePage) => {
              return offlinePage || new Response(
                '<html><body style="font-family:sans-serif;text-align:center;padding:60px 20px;"><h1>You\'re offline</h1><p>Check your connection and try again.</p></body></html>',
                { status: 503, headers: { 'Content-Type': 'text/html' } }
              );
            });
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});
