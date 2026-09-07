// =====================================================================
// Da Despensa — Service Worker
// Estratégia: "app shell" em cache (funciona offline / instala como PWA),
// chamadas à API do TheMealDB sempre vão para a rede (dados precisam
// estar atualizados; cair para o cache só serve para o casco da app).
// =====================================================================

const CACHE_NAME = "da-despensa-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./manifest.json",
  "./assets/favicon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Chamadas à API: sempre rede. Se falhar (offline), não há dado válido
  // para servir do cache, então deixamos o app tratar o erro normalmente.
  if (url.hostname.includes("themealdb.com")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Recursos do próprio app: cache-first, com atualização em segundo plano.
  if (event.request.method === "GET" && url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const network = fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
