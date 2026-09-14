import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initAutoUpdateListener } from './utils/versionManager.ts';

// Gerenciamento de Service Worker com Auto-Update Imediato e Bypass de Cache
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  // Listener crítico: recarrega a página no momento exato em que o novo SW assume o controle (clients.claim)
  let isRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!isRefreshing) {
      isRefreshing = true;
      console.log('[Brasil Legal] Novo Service Worker assumiu o controle. Recarregando página para nova versão...');
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    // updateViaCache: 'none' força o navegador a nunca usar cache HTTP para o arquivo sw.js
    navigator.serviceWorker
      .register('/sw.js', { updateViaCache: 'none' })
      .then((registration) => {
        console.log('[Brasil Legal] Service Worker registrado com updateViaCache: none');

        // Se já houver um worker em espera (waiting), força ele a pular a espera imediatamente
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        // Monitora novas versões detectadas durante o download
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Nova versão instalada com sucesso; envia ordem para assumir imediatamente
                  console.log('[Brasil Legal] Nova versão de Service Worker detectada, forçando ativação...');
                  installingWorker.postMessage({ type: 'SKIP_WAITING' });
                }
              }
            });
          }
        });

        // Força checagem de nova versão imediatamente ao abrir a página
        registration.update().catch(() => {});

        // Força checagem quando o usuário volta para a aba ou desbloqueia o celular
        window.addEventListener('focus', () => {
          registration.update().catch(() => {});
        });

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch(() => {});
          }
        });

        // Checagem periódica em segundo plano a cada 3 minutos
        setInterval(() => {
          registration.update().catch(() => {});
        }, 3 * 60 * 1000);
      })
      .catch((err) => {
        console.warn('[Brasil Legal] Falha ao registrar Service Worker:', err);
      });
  });
}

// Inicia monitoramento de versão (/version.json) para deploys no Firebase
initAutoUpdateListener();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
