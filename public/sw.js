// Service Worker desativado para evitar loops de reload e conflitos de cache
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      return caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
    })
  );
});

