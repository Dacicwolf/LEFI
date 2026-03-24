// Lefi offline shell service worker
// Cache-first for shell assets; network-first for API calls.

const CACHE_NAME = "lefi-shell-v1";

// Core app shell assets to precache on install
const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept cross-origin API / Supabase / Stripe requests
  if (url.origin !== self.location.origin) return;
  // Never intercept non-GET requests
  if (request.method !== "GET") return;

  // For navigation requests (HTML) serve shell from cache, fallback to network
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match("/index.html").then((cached) => cached || fetch(request))
    );
    return;
  }

  // For JS/CSS/image assets: stale-while-revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request).then((response) => {
        if (response.ok) cache.put(request, response.clone());
        return response;
      }).catch(() => null);
      return cached || networkFetch;
    })
  );
});
