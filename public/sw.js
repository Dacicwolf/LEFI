// Service Worker — network-first for all assets to avoid stale React chunks
const CACHE_NAME = 'lefi-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Network-first: always try network, fall back to cache only for non-JS assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isHttpRequest = url.protocol === 'http:' || url.protocol === 'https:';

  // Cache API only supports GET requests on http(s) schemes.
  if (event.request.method !== 'GET' || !isHttpRequest) {
    return;
  }

  // Never cache JS/JSX chunks — they change on every build
  if (url.pathname.match(/\.(js|jsx|mjs|ts|tsx)(\?.*)?$/)) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For everything else: network first, cache as fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// Handle preload messages from the app
self.addEventListener('message', (event) => {
  if (event.data?.type === 'PRELOAD_ASSETS') {
    const urls = event.data.urls || [];
    caches.open(CACHE_NAME).then((cache) => {
      urls.forEach((url) => {
        fetch(url)
          .then((res) => {
            const reqUrl = new URL(url, self.location.origin);
            const isHttp = reqUrl.protocol === 'http:' || reqUrl.protocol === 'https:';
            if (res.ok && isHttp) cache.put(url, res);
          })
          .catch(() => {});
      });
    });
  }
});
