/**
 * Service Worker PWA - Emberton Group
 * Cache hors-ligne & résilience réseau pour auditeurs mystères
 */

const CACHE_NAME = "emberton-pwa-v1";
const OFFLINE_URL = "/offline.html";

const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.svg",
  "/icons/icon-512x512.svg"
];

// Installation : pré-mise en cache des fichiers critiques
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("⚡ [PWA SW] Pré-mise en cache des ressources hors-ligne...");
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activation : purge des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("⚡ [PWA SW] Suppression ancien cache:", name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interception des requêtes réseau
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET et les requêtes WebSocket
  if (request.method !== "GET" || url.protocol === "ws:" || url.protocol === "wss:") {
    return;
  }

  // 1. Requêtes API : Network-First avec timeout
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: "Vous êtes actuellement hors-ligne. Vos réponses sont enregistrées dans votre brouillon local.",
            offline: true
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 503
          }
        );
      })
    );
    return;
  }

  // 2. Requêtes de navigation de page (HTML) : Network-First avec fallback page Offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Copier dans le cache si valide
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 3. Ressources statiques (scripts, CSS, images) : Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
