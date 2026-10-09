// PWA Service Worker for LifeKnowledge.
// HTML is intentionally never cached: an old HTML shell can reference stale
// Next.js chunks, which leaves links working while all hydrated buttons stop.
const CACHE_NAME = "lk-static-v3";
const PRECACHE_URLS = ["/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  // Navigation must always come from the network. This prevents an old build
  // from being restored on a phone and breaking React hydration.
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request));
    return;
  }

  const isImmutableAsset =
    requestUrl.pathname.startsWith("/_next/static/") ||
    /\.(?:css|js|woff2?|png|jpg|jpeg|webp|svg|ico)$/i.test(requestUrl.pathname);

  if (!isImmutableAsset) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache))
        );
        return networkResponse;
      });
    })
  );
});
