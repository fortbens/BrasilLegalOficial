import { AppNotification, TipoNotificacao } from '../types';

const STORAGE_KEY = 'brasil_legal_notifications_history';
const SOUND_ENABLED_KEY = 'brasil_legal_notification_sound_enabled';

// In-Memory AudioContext for Web Audio API Chimes
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playNotificationSound(): void {
  try {
    const soundEnabled = isSoundEnabled();
    if (!soundEnabled) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Dual-tone high-pitch professional notification chime
    // Tone 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2: A5 (880.00 Hz) slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.22, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.48);
  } catch (err) {
    console.warn('Erro ao tocar áudio de notificação:', err);
  }
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const val = localStorage.getItem(SOUND_ENABLED_KEY);
  return val === null ? true : val === 'true';
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_ENABLED_KEY, enabled ? 'true' : 'false');
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Erro ao solicitar permissão de notificação desktop:', err);
    return Notification.permission;
  }
}

export function getStoredNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

export function saveNotification(notif: AppNotification): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getStoredNotifications();
    const updated = [notif, ...list.slice(0, 49)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Erro ao salvar notificação localmente:', err);
  }
}

export function markNotificationAsRead(id: string): AppNotification[] {
  if (typeof window === 'undefined') return [];
  const list = getStoredNotifications();
  const updated = list.map(n => n.id === id ? { ...n, lida: true } : n);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function markAllNotificationsAsRead(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  const list = getStoredNotifications();
  const updated = list.map(n => ({ ...n, lida: true }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearAllNotifications(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export interface SendNotificationOptions {
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  link_aba?: string;
  metadados?: Record<string, any>;
  onClick?: () => void;
}

/**
 * Dispara notificação push desktop + chime de áudio + registro in-app
 */
export function sendDesktopNotification(options: SendNotificationOptions): AppNotification {
  const { tipo, titulo, mensagem, link_aba, metadados, onClick } = options;

  // 1. Toca chime suave
  playNotificationSound();

  // 2. Cria objeto de notificação
  const notificationObj: AppNotification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    tipo,
    titulo,
    mensagem,
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    lida: false,
    link_aba,
    metadados
  };

  // 3. Salva no histórico in-app
  saveNotification(notificationObj);

  // 4. Dispara browser desktop notification se permitido
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const desktopNotif = new Notification(titulo, {
        body: mensagem,
        icon: 'https://brasillegalimoveis.com.br/assets/favicon.ico',
        badge: 'https://brasillegalimoveis.com.br/assets/favicon.ico',
        tag: tipo,
        requireInteraction: false
      });

      desktopNotif.onclick = () => {
        window.focus();
        if (onClick) onClick();
        desktopNotif.close();
      };
    } catch (err) {
      console.warn('Falha ao instanciar Notification desktop (ambiente iframe ou restrito):', err);
    }
  }

  // 5. Dispara evento DOM para sincronizar UI e toasts imediatamente
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('app:notification', { detail: notificationObj });
    window.dispatchEvent(event);
  }

  return notificationObj;
}

const ADMIN_PUSH_STORAGE_KEY = 'brasil_legal_admin_push_history';

export interface AdminPushPayload {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: TipoNotificacao;
  destinatario: 'TODOS' | 'ADMINS' | 'TECNICOS' | 'SDRS' | 'PARCEIROS';
  link_aba?: string;
  autor_nome?: string;
  data_hora: string;
  enviado_desktop: boolean;
  total_destinatarios_estimado: number;
}

export function getAdminPushHistory(): AdminPushPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ADMIN_PUSH_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

export function saveAdminPushToHistory(item: AdminPushPayload): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getAdminPushHistory();
    const updated = [item, ...list.slice(0, 49)];
    localStorage.setItem(ADMIN_PUSH_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Erro ao salvar histórico de push admin:', err);
  }
}

export function deleteAdminPushFromHistory(id: string): AdminPushPayload[] {
  if (typeof window === 'undefined') return [];
  const list = getAdminPushHistory();
  const updated = list.filter(item => item.id !== id);
  localStorage.setItem(ADMIN_PUSH_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function sendAdminPushNotification(
  payload: Omit<AdminPushPayload, 'id' | 'data_hora' | 'enviado_desktop' | 'total_destinatarios_estimado'>
): { notification: AppNotification; adminLog: AdminPushPayload } {
  const isDesktopGranted = isNotificationSupported() && Notification.permission === 'granted';

  const notification = sendDesktopNotification({
    tipo: payload.tipo,
    titulo: payload.titulo,
    mensagem: payload.mensagem,
    link_aba: payload.link_aba,
    metadados: {
      origem: 'ADMIN_BROADCAST',
      destinatario: payload.destinatario,
      autor: payload.autor_nome || 'Administrador do Sistema'
    }
  });

  const adminLog: AdminPushPayload = {
    id: `admin-push-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...payload,
    data_hora: new Date().toLocaleString('pt-BR'),
    enviado_desktop: isDesktopGranted,
    total_destinatarios_estimado: payload.destinatario === 'TODOS' ? 12 : 4
  };

  saveAdminPushToHistory(adminLog);

  return { notification, adminLog };
}
