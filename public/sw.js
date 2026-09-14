// Service Worker Brasil Legal - Cache Buster & Immediate Auto-Update
const SW_VERSION = 'bl-sw-2026.09.14-v1';

// 1. Instalação: força a nova versão a assumir imediatamente (skipWaiting)
self.addEventListener('install', (event) => {
  console.log('[SW] Novo Service Worker instalado. Executando self.skipWaiting()...');
  self.skipWaiting();
});

// 2. Ativação: limpa TODOS os caches antigos e assume controle imediato de todas as abas (clients.claim)
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker ativado. Limpando caches e executando clients.claim()...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Excluindo cache anterior:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. Ouvir mensagens do app para skipWaiting ou limpeza manual de cache
self.addEventListener('message', (event) => {
  if (event.data) {
    if (event.data.type === 'SKIP_WAITING' || event.data === 'skipWaiting') {
      console.log('[SW] Mensagem SKIP_WAITING recebida.');
      self.skipWaiting();
    }
    if (event.data.type === 'CLEAR_ALL_CACHES') {
      event.waitUntil(
        caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
      );
    }
  }
});

// 4. Estratégia de requisições de rede
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Para navegações (HTML): SEMPRE busca fresco da rede com cache: 'no-cache'
  // evitando que usuários fiquem presos na versão anterior do index.html
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request, { cache: 'no-cache' }).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // Endpoints que NUNCA devem ser cacheados pelo Service Worker
  const url = request.url;
  if (
    url.includes('/api/') ||
    url.includes('sw.js') ||
    url.includes('version.json') ||
    url.includes('firestore.googleapis.com') ||
    url.includes('identitytoolkit.googleapis.com')
  ) {
    event.respondWith(fetch(request, { cache: 'no-cache' }));
    return;
  }

  // Para assets versionados (com hash do Vite) e demais recursos estáticos
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
