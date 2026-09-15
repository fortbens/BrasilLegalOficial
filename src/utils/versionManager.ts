// Utilitário de monitoramento de versão e invalidação de cache (Rotinas automáticas desativadas para estabilidade)
export interface AppVersionInfo {
  version: string;
  buildDate: string;
  buildTime?: number;
}

export const CURRENT_BUILD_TIME: string = 
  (import.meta.env.VITE_APP_BUILD_TIME as string) || new Date().toISOString();

export const CURRENT_APP_VERSION: string = 
  (import.meta.env.VITE_APP_VERSION as string) || '1.0.0';

/**
 * Limpeza segura de caches do navegador (CacheStorage) sob demanda
 */
export async function clearAllAppCaches(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cacheNames = await window.caches.keys();
    await Promise.all(cacheNames.map((name) => window.caches.delete(name)));
  } catch {
    // Falha silenciosa
  }
}

/**
 * Consulta version.json no servidor tratando respostas não-JSON de forma silenciosa
 */
export async function checkServerVersion(): Promise<{ hasUpdate: boolean; serverVersion?: string }> {
  if (typeof window === 'undefined') {
    return { hasUpdate: false };
  }

  try {
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

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { hasUpdate: false };
    }

    const data: AppVersionInfo = await res.json();
    if (!data || typeof data.version !== 'string') {
      return { hasUpdate: false };
    }

    const storedVersion = localStorage.getItem('bl_app_version');
    if (!storedVersion) {
      localStorage.setItem('bl_app_version', data.version);
      return { hasUpdate: false };
    }

    if (data.version !== storedVersion) {
      return { hasUpdate: true, serverVersion: data.version };
    }

    return { hasUpdate: false };
  } catch {
    return { hasUpdate: false };
  }
}

/**
 * Atualização manual e segura (sem reload forçado automático)
 */
export async function applyUpdate(newVersion?: string): Promise<void> {
  if (newVersion && typeof window !== 'undefined') {
    localStorage.setItem('bl_app_version', newVersion);
  }
  await clearAllAppCaches();
}

/**
 * Rotina desativada: não dispara loops de recarregamento
 */
export function initAutoUpdateListener(): void {
  // Desativado intencionalmente para evitar loops de reload e cintilação de tela
}

