const CACHE_NAME = "parcelamento-v3";

const FILES_TO_CACHE = [
  "index.html",
  "manifest.json",
  "taxas.js",
  "produtos.js"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  return self.clients.claim();
});

self.addEventListener("fetch", event => {

  // 🔒 Só intercepta requisições http e https
  if (!event.request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {

        // Só faz cache se for requisição válida
        if (event.request.method === "GET") {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
        }

        return response;

      })
      .catch(() => caches.match(event.request))
  );
});
