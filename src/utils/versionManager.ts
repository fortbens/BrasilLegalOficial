// Utilitário de monitoramento de versão e invalidação de cache
export interface AppVersionInfo {
  version: string;
  buildDate: string;
  buildTime?: number;
}

// Data da compilação injetada pelo Vite (ou fallback de data atual)
export const CURRENT_BUILD_TIME: string = 
  (import.meta.env.VITE_APP_BUILD_TIME as string) || new Date().toISOString();

export const CURRENT_APP_VERSION: string = 
  (import.meta.env.VITE_APP_VERSION as string) || '1.0.0';

let isChecking = false;

/**
 * Força limpeza total de caches do navegador (CacheStorage)
 */
export async function clearAllAppCaches(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cacheNames = await window.caches.keys();
    await Promise.all(cacheNames.map((name) => window.caches.delete(name)));
    console.log('[CacheBuster] Todos os caches do navegador foram limpos com sucesso.');
  } catch (err) {
    console.warn('[CacheBuster] Erro ao limpar caches:', err);
  }
}

/**
 * Consulta version.json no servidor para verificar se houve novo deploy
 */
export async function checkServerVersion(): Promise<{ hasUpdate: boolean; serverVersion?: string }> {
  if (typeof window === 'undefined' || isChecking) {
    return { hasUpdate: false };
  }

  isChecking = true;
  try {
    // Adiciona timestamp na query para furar cache de intermediários/proxies
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!res.ok) {
      return { hasUpdate: false };
    }

    const data: AppVersionInfo = await res.json();
    const storedVersion = localStorage.getItem('bl_app_version');

    // Se não há versão salva ainda, salva a atual
    if (!storedVersion) {
      localStorage.setItem('bl_app_version', data.version || CURRENT_APP_VERSION);
      return { hasUpdate: false };
    }

    // Se a versão do servidor for diferente da armazenada localmente
    if (data.version && data.version !== storedVersion) {
      console.log(`[CacheBuster] Novo deploy detectado! Versão anterior: ${storedVersion} -> Nova versão: ${data.version}`);
      return { hasUpdate: true, serverVersion: data.version };
    }

    return { hasUpdate: false };
  } catch {
    return { hasUpdate: false };
  } finally {
    isChecking = false;
  }
}

/**
 * Aplica a atualização: limpa caches, atualiza storage e recarrega a página
 */
export async function applyUpdate(newVersion?: string): Promise<void> {
  if (newVersion) {
    localStorage.setItem('bl_app_version', newVersion);
  }
  await clearAllAppCaches();

  // Se houver service worker, solicita que ele pule a espera
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }

  // Recarrega do servidor
  window.location.reload();
}

/**
 * Inicia monitoramento automático de versões em segundo plano
 */
export function initAutoUpdateListener(): void {
  if (typeof window === 'undefined') return;

  // Salva a versão atual na inicialização
  localStorage.setItem('bl_app_version', CURRENT_APP_VERSION);

  const performCheck = async () => {
    const { hasUpdate, serverVersion } = await checkServerVersion();
    if (hasUpdate) {
      console.log('[CacheBuster] Atualizando automaticamente para a versão mais recente...');
      await applyUpdate(serverVersion);
    }
  };

  // Checa 5 segundos após carregar
  setTimeout(performCheck, 5000);

  // Checa quando o usuário volta à aba do navegador ou desbloqueia o celular
  window.addEventListener('focus', performCheck);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      performCheck();
    }
  });

  // Checagem periódica a cada 5 minutos
  setInterval(performCheck, 5 * 60 * 1000);
}
