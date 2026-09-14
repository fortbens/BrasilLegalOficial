import React, { useState, useEffect } from 'react';
import { AppNotification, TipoNotificacao, Usuario } from '../types';
import { 
  getStoredNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  clearAllNotifications,
  getNotificationPermission,
  requestNotificationPermission,
  isSoundEnabled,
  setSoundEnabled,
  sendDesktopNotification
} from '../services/notificationService';
import { ModalCriarPushAdmin } from './ModalCriarPushAdmin';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  AlertCircle, 
  FileCheck2, 
  Layers, 
  DollarSign, 
  Sparkles, 
  X,
  ExternalLink,
  Laptop,
  Send
} from 'lucide-react';

export interface NotificationCenterProps {
  currentUser?: Usuario;
  onNavigateTab?: (tabId: string) => void;
  onNavegarPara?: (tabId: string) => void;
  notifications?: AppNotification[];
  onMarcarLida?: (id: string) => void;
  onLimparTodas?: () => void;
  onSolicitarPermissaoPush?: () => Promise<boolean> | boolean;
  onEnviarNotificacaoTeste?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  currentUser,
  onNavigateTab,
  onNavegarPara,
  notifications: externalNotifications,
  onMarcarLida: externalOnMarcarLida,
  onLimparTodas: externalOnLimparTodas,
  onSolicitarPermissaoPush: externalOnSolicitarPermissaoPush,
  onEnviarNotificacaoTeste: externalOnEnviarNotificacaoTeste
}) => {
  const [internalNotifications, setInternalNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalAdminPushOpen, setIsModalAdminPushOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [soundActive, setSoundActive] = useState(true);
  const [floatingToast, setFloatingToast] = useState<AppNotification | null>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const notifications = (externalNotifications && externalNotifications.length > 0)
    ? externalNotifications
    : internalNotifications;

  const navigateFn = onNavegarPara || onNavigateTab;

  // Initialize and listen for new notifications
  useEffect(() => {
    setInternalNotifications(getStoredNotifications());
    setPermission(getNotificationPermission());
    setSoundActive(isSoundEnabled());

    const handleNewNotif = (e: Event) => {
      const customEvent = e as CustomEvent<AppNotification>;
      if (customEvent.detail) {
        setInternalNotifications(prev => [customEvent.detail, ...prev.slice(0, 49)]);
        setFloatingToast(customEvent.detail);
        setTimeout(() => {
          setFloatingToast(prev => (prev?.id === customEvent.detail.id ? null : prev));
        }, 5000);
      }
    };

    window.addEventListener('app:notification', handleNewNotif);
    return () => window.removeEventListener('app:notification', handleNewNotif);
  }, []);

  const unreadCount = notifications.filter(n => !n.lida).length;

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);
    if (perm === 'granted') {
      sendDesktopNotification({
        tipo: 'GERAL',
        titulo: '🔔 Notificações Desktop Ativadas!',
        mensagem: 'Você agora receberá alertas instantâneos sobre validação de documentos e movimentações na esteira.'
      });
    }
  };

  const handleTestNotification = () => {
    sendDesktopNotification({
      tipo: 'LEAD_AVANCOU_ESTEIRA',
      titulo: '🚀 Teste de Notificação Desktop',
      mensagem: 'O processo "Usucapião Extrajudicial — Maria Fernandes" avançou para "Auditoria Documental"!',
      link_aba: 'esteira_clientes'
    });
  };

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
  };

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsAsRead();
    setInternalNotifications(updated);
    if (externalOnLimparTodas) externalOnLimparTodas();
  };

  const handleClear = () => {
    clearAllNotifications();
    setInternalNotifications([]);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    const updated = markNotificationAsRead(notif.id);
    setInternalNotifications(updated);
    if (externalOnMarcarLida) externalOnMarcarLida(notif.id);
    if (notif.link_aba && navigateFn) {
      navigateFn(notif.link_aba);
      setIsOpen(false);
    }
  };

  const getIconForType = (tipo: TipoNotificacao) => {
    switch (tipo) {
      case 'DOCUMENTO_VALIDADO':
        return <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'LEAD_AVANCOU_ESTEIRA':
        return <Layers className="w-4 h-4 text-[#2E3192] shrink-0" />;
      case 'PAGAMENTO_SPLIT_EXECUTADO':
        return <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'OMNICHANNEL_LEAD_QUALIFICADO':
        return <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600 shrink-0" />;
    }
  };

  return (
    <>
      {/* Floating Toast Alert in corner */}
      {floatingToast && (
        <div 
          className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full bg-white rounded-xl shadow-2xl border-2 border-[#2E3192] p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300"
          role="alert"
        >
          <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100">
            {getIconForType(floatingToast.tipo)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {floatingToast.titulo}
              </h4>
              <button 
                onClick={() => setFloatingToast(null)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
              {floatingToast.mensagem}
            </p>
            {floatingToast.link_aba && (
              <button
                onClick={() => {
                  if (onNavigateTab) onNavigateTab(floatingToast.link_aba!);
                  setFloatingToast(null);
                }}
                className="mt-2 text-[10px] font-bold text-[#2E3192] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Acessar no sistema</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bell Trigger Button in Header */}
      <div className="relative" ref={popoverRef}>
        <button
          id="btn-topbar-notificacoes"
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Central de Notificações Push & Alertas"
          aria-label="Abrir notificações"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-extrabold text-white animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Backdrop for mobile */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 sm:hidden animate-in fade-in"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Dropdown Popover */}
        {isOpen && (
          <div 
            id="popover-notificacoes"
            className="fixed inset-x-2 top-16 max-w-sm mx-auto sm:max-w-none sm:mx-0 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="p-3.5 bg-gradient-to-r from-[#2E3192] to-[#1C1E63] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#F2EC00]" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Notificações Push</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-[#F2EC00] text-slate-950 font-extrabold px-1.5 py-0.2 rounded-full">
                    {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleToggleSound}
                  className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10"
                  title={soundActive ? 'Desativar som de alerta' : 'Ativar som de alerta'}
                >
                  {soundActive ? <Volume2 className="w-3.5 h-3.5 text-[#F2EC00]" /> : <VolumeX className="w-3.5 h-3.5 text-white/60" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Desktop Push Banner Status */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-[#2E3192]" />
                  <div>
                    <div className="font-bold text-slate-800 text-[11px]">Desktop Push</div>
                    <div className="text-[10px] text-slate-500">
                      {permission === 'granted' ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Ativado no Navegador
                        </span>
                      ) : permission === 'denied' ? (
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Bloqueado pelo Navegador
                        </span>
                      ) : (
                        <span className="text-slate-600 font-medium">Aguardando autorização</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {permission !== 'granted' && (
                    <button
                      onClick={handleRequestPermission}
                      className="px-2.5 py-1 bg-[#2E3192] text-white rounded-lg text-[10px] font-bold hover:bg-indigo-900 transition-all cursor-pointer shadow-xs"
                    >
                      Ativar
                    </button>
                  )}
                  <button
                    onClick={handleTestNotification}
                    className="px-2 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-100 transition-all cursor-pointer"
                    title="Enviar notificação push de teste com som"
                  >
                    Testar
                  </button>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            {notifications.length > 0 && (
              <div className="px-3 py-1.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-[10px]">
                <button
                  onClick={handleMarkAllRead}
                  className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3 h-3" /> Marcar lidas
                </button>
                <button
                  onClick={handleClear}
                  className="text-slate-500 hover:text-red-600 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Limpar tudo
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-[60vh] sm:max-h-72 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                  <p className="font-medium text-slate-600">Nenhuma notificação no momento</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Alertas sobre validação de documentos e mudança de etapa na esteira aparecerão aqui.
                  </p>
                  <button
                    onClick={handleTestNotification}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-[#2E3192]" /> Simular Alerta de Teste
                  </button>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3 flex items-start gap-2.5 transition-colors cursor-pointer hover:bg-slate-50 ${
                      !n.lida ? 'bg-indigo-50/50' : 'bg-white'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                      {getIconForType(n.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {n.titulo}
                        </span>
                        <span className="text-[9px] text-slate-400 whitespace-nowrap">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {n.mensagem}
                      </p>
                      {n.link_aba && (
                        <div className="mt-1 text-[10px] font-bold text-[#2E3192] flex items-center gap-1">
                          <span>Ver no sistema</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    {!n.lida && (
                      <span className="w-2 h-2 rounded-full bg-[#2E3192] shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Admin Broadcast CTA Button */}
            {(!currentUser || currentUser.role === 'ADMIN') && (
              <div className="p-2 bg-indigo-50/80 border-t border-indigo-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalAdminPushOpen(true);
                    setIsOpen(false);
                  }}
                  className="w-full py-1.5 px-3 bg-[#2E3192] hover:bg-[#1C1E63] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5 text-[#F2EC00]" />
                  <span>Criar Notificação Push (ADM)</span>
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="p-2 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500">
              Notificações em tempo real com Web Audio API & Desktop Push
            </div>
          </div>
        )}
      </div>

      {/* Modal para o Administrador Criar e Disparar Notificações Push */}
      <ModalCriarPushAdmin
        isOpen={isModalAdminPushOpen}
        onClose={() => setIsModalAdminPushOpen(false)}
        currentUser={currentUser}
        onNavigateTab={navigateFn}
      />
    </>
  );
};
