import React, { useState, useEffect } from 'react';
import { Usuario, RoleUsuario, AppSettings } from '../types';
import { BRASIL_LEGAL_LOGO_PRESETS } from '../utils/logoPresets';
import { 
  Building, 
  ShieldCheck, 
  Clock, 
  Users, 
  FileText, 
  DollarSign, 
  Globe, 
  Bot,
  ChevronDown,
  Sliders,
  X,
  PlusCircle,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Eye,
  ExternalLink,
  Layers,
  CreditCard,
  BarChart3,
  FileSignature,
  SearchCheck,
  Share2,
  MessageSquare,
  LogOut,
  PieChart as PieChartIcon,
  CalendarCheck,
  Mail
} from 'lucide-react';

interface SidebarProps {
  currentUser: Usuario;
  allUsers: Usuario[];
  onSelectUser: (user: Usuario) => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  slaMetric: { totalLeads: number; inSlaPercent: number; avgResponseMin: number };
  appSettings?: AppSettings;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenNovoLeadModal?: () => void;
  onVisualizarSite?: () => void;
  onSaveAppSettings?: (newSettings: AppSettings) => Promise<void> | void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  activeTab,
  onSelectTab,
  slaMetric,
  appSettings,
  isOpenMobile,
  onCloseMobile,
  onOpenNovoLeadModal,
  onVisualizarSite,
  onSaveAppSettings,
  onLogout
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoImgError, setLogoImgError] = useState(false);

  // Reset logo error when settings change
  useEffect(() => {
    setLogoImgError(false);
  }, [appSettings?.logo_dark_url, appSettings?.logo_light_url, appSettings?.logo_header_url]);

  // Synchronize Favicon and Document Title
  React.useEffect(() => {
    if (appSettings?.favicon_url) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = appSettings.favicon_url;
    }
    if (appSettings?.app_name) {
      document.title = `${appSettings.app_name} | Regularização Imobiliária`;
    }
  }, [appSettings?.favicon_url, appSettings?.app_name]);

  const tabs = [
    {
      id: 'comercial',
      label: 'Leads',
      description: 'Funil Comercial & SLA < 4 min',
      icon: Users,
      allowedRoles: ['ADMIN', 'SDR'],
      badge: 'SLA < 4m'
    },
    {
      id: 'esteira_clientes',
      label: 'Clientes',
      description: 'Esteira de Clientes & Regularização',
      icon: Layers,
      allowedRoles: ['ADMIN', 'TECNICO', 'SDR'],
      badge: 'Esteira'
    },
    {
      id: 'tecnico',
      label: 'Oportunidades',
      description: 'CRM Técnico & Casos Registrais',
      icon: FileText,
      allowedRoles: ['ADMIN', 'TECNICO'],
      badge: 'CNJ 65'
    },
    {
      id: 'atividades',
      label: 'Atividades & Agenda',
      description: 'Gestão de Tarefas, Vistorias e Google Agenda',
      icon: CalendarCheck,
      allowedRoles: ['ADMIN', 'TECNICO', 'SDR', 'PARCEIRO'],
      badge: 'Agenda'
    },
    {
      id: 'omnichannel',
      label: 'Multi-atendimento',
      description: 'Central Omnichannel (WhatsApp, Webchat & IA)',
      icon: MessageSquare,
      allowedRoles: ['ADMIN', 'SDR', 'TECNICO'],
      badge: 'Omni IA'
    },
    {
      id: 'meta_ads',
      label: 'Marketing',
      description: 'Meta Ads & Campanhas de Tráfego',
      icon: Share2,
      allowedRoles: ['ADMIN', 'SDR'],
      badge: 'Tráfego'
    },
    {
      id: 'email_marketing',
      label: 'E-mail Marketing',
      description: 'Régua de E-mails, Automação IA & Custódia',
      icon: Mail,
      allowedRoles: ['ADMIN', 'SDR', 'TECNICO'],
      badge: 'Régua IA'
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      description: 'Split Bancário, Comissões, Cobrança & Boletos',
      icon: DollarSign,
      allowedRoles: ['ADMIN'],
      badge: 'Unificado'
    },
    {
      id: 'assinaturas_digitais',
      label: 'Assinatura Digital',
      description: 'Contratos, Envelopes & Auditoria MP 2.200',
      icon: FileSignature,
      allowedRoles: ['ADMIN', 'TECNICO', 'SDR'],
      badge: 'MP 2.200'
    },
    {
      id: 'cms_site',
      label: 'Site & Blog',
      description: 'Portal Público, Artigos de Blog & CMS',
      icon: Globe,
      allowedRoles: ['ADMIN'],
      badge: 'Site/Blog'
    },
    {
      id: 'admin_whitelabel',
      label: 'Painel ADM',
      description: 'Usuários, Indique e Ganha, Área do Cliente & KPIs',
      icon: Sliders,
      allowedRoles: ['ADMIN'],
      badge: 'Gestão'
    },
    ...(['PARCEIRO_B2B', 'ADMIN'].includes(currentUser.role) ? [{
      id: 'parceiro_portal',
      label: 'Portal Indique e Ganha',
      description: 'Extrato B2B & Links de Indicação',
      icon: ShieldCheck,
      allowedRoles: ['PARCEIRO_B2B', 'ADMIN'],
      badge: '5% Split'
    }] : [])
  ];

  const visibleTabs = tabs.filter(t => t.allowedRoles.includes(currentUser.role));

  const primaryColor = appSettings?.cor_primaria || '#2E3192';
  const secondaryColor = appSettings?.cor_secundaria || '#F2EC00';
  const destaqueColor = appSettings?.cor_destaque || '#1C1E63';
  const appName = appSettings?.app_name || 'BRASIL LEGAL';
  const appTagline = appSettings?.app_tagline || 'Regularização Imobiliária & Gestão de Ativos';

  const getRoleBadge = (role: RoleUsuario) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Administrador / Diretor', bg: 'bg-[#2E3192] text-white' };
      case 'TECNICO':
        return { label: 'Coord. Jurídico & Engenheiro', bg: 'bg-emerald-700 text-white' };
      case 'SDR':
        return { label: 'SDR / Atendimento Comercial', bg: 'bg-blue-700 text-white' };
      case 'PARCEIRO_B2B':
        return { label: 'Parceiro B2B (Indique e Ganhe)', bg: 'bg-amber-600 text-white' };
    }
  };

  const handleTabClick = (tabId: string) => {
    onSelectTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Lateral Menu / Sidebar Container */}
      <aside
        id="sidebar-navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto shadow-2xl lg:shadow-none border-r border-slate-800 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ 
          backgroundColor: destaqueColor || '#1C1E63'
        }}
      >
        {/* Brand Header */}
        <div 
          className="p-4 border-b border-white/10 flex items-center justify-between shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-3">
            {/* Logo Display */}
            <div 
              className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-md border overflow-hidden p-1 shrink-0"
              style={{ borderColor: secondaryColor }}
            >
              <img 
                src={
                  (!logoImgError && (
                    appSettings?.logo_sidebar_url ||
                    appSettings?.logo_icon_url ||
                    appSettings?.logo_header_url ||
                    appSettings?.logo_light_url
                  )) ||
                  '/assets/logo-brasil-legal-oficial.png'
                } 
                alt={appName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('/assets/logo-brasil-legal-oficial.png')) {
                    target.src = '/assets/logo-brasil-legal-oficial.png';
                  } else {
                    setLogoImgError(true);
                  }
                }}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-base font-black tracking-tight text-white uppercase truncate max-w-[130px]">
                  {appName}
                </span>
                <span 
                  className="text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase shadow-xs"
                  style={{ backgroundColor: secondaryColor, color: primaryColor }}
                >
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-white/70 font-medium truncate max-w-[160px]">
                {appTagline}
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Fechar menu lateral"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Lead Button (visible to SDR & Admin) */}
        {['ADMIN', 'SDR', 'PARCEIRO_B2B'].includes(currentUser.role) && onOpenNovoLeadModal && (
          <div className="px-4 pt-4 pb-2 shrink-0">
            <button
              onClick={() => {
                onOpenNovoLeadModal();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-slate-900 shadow-md transition-all hover:brightness-105 active:scale-[0.98] cursor-pointer"
              style={{ backgroundColor: secondaryColor }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Lead / Matrícula</span>
            </button>
          </div>
        )}

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin scrollbar-thumb-white/20">
          <div className="px-3 pt-2 pb-1 text-[10px] uppercase font-bold tracking-wider text-white/50 flex items-center justify-between">
            <span>Módulos do Sistema</span>
            <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-white/70">
              {visibleTabs.length} ativos
            </span>
          </div>

          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`sidebar-tab-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left relative ${
                  isActive
                    ? 'text-white shadow-md font-bold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: primaryColor,
                        boxShadow: `0 4px 12px ${primaryColor}40`
                      }
                    : undefined
                }
              >
                {/* Active Indicator Bar on left */}
                {isActive && (
                  <span 
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                    style={{ backgroundColor: secondaryColor }}
                  />
                )}

                <div className="flex items-center gap-3 overflow-hidden">
                  <div 
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/80 group-hover:text-white group-hover:bg-white/15'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="truncate font-medium">{tab.label}</div>
                    <div className="text-[10px] text-white/60 truncate font-normal">{tab.description}</div>
                  </div>
                </div>

                {tab.badge && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ml-1.5"
                    style={
                      isActive
                        ? { backgroundColor: secondaryColor, color: primaryColor }
                        : { backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)' }
                    }
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action: Visualizar Site (Página de Vendas) */}
        {onVisualizarSite && (
          <div className="px-3 mb-2 shrink-0">
            <button
              type="button"
              id="sidebar-btn-visualizar-site"
              onClick={onVisualizarSite}
              className="w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-all shadow-md group cursor-pointer hover:opacity-95"
              style={{ backgroundColor: secondaryColor, color: primaryColor }}
              title="Abrir pré-visualização completa da página de vendas pública"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#2E3192]" />
                <span>Visualizar Site</span>
              </div>
              <span className="text-[10px] bg-black/10 px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5">
                Live <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </button>
          </div>
        )}

        {/* SLA Live Monitor Widget in Sidebar */}
        <div className="p-3 mx-3 mb-3 bg-white/5 border border-white/10 rounded-xl shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-white/70">
              <Clock className="w-3.5 h-3.5 animate-pulse" style={{ color: secondaryColor }} />
              <span>SLA 1º Contato</span>
            </div>
            <span 
              className="text-[10px] font-extrabold px-1.5 py-0.2 rounded"
              style={{ backgroundColor: secondaryColor, color: primaryColor }}
            >
              &lt; {appSettings?.sla_meta_minutos || 4}m
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/80">Meta cumprida:</span>
              <span className="font-bold text-emerald-400">{slaMetric.inSlaPercent}%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(slaMetric.inSlaPercent, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/60 pt-0.5">
              <span>Média da equipe:</span>
              <strong className="text-white">{slaMetric.avgResponseMin} min</strong>
            </div>
          </div>
        </div>

        {/* User Profile & Role Switcher Section (Footer) */}
        <div className="p-3 border-t border-white/10 bg-black/20 shrink-0 relative">
          <div className="flex items-center justify-between">
            <button
              id="sidebar-btn-role-switcher"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex-1 flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-left overflow-hidden cursor-pointer"
            >
              <img
                src={currentUser.foto_url}
                alt={currentUser.nome}
                className="w-9 h-9 rounded-full object-cover border-2 shrink-0"
                style={{ borderColor: secondaryColor }}
              />
              <div className="overflow-hidden flex-1">
                <div className="text-xs font-bold text-white truncate flex items-center justify-between">
                  <span>{currentUser.nome}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} style={{ color: secondaryColor }} />
                </div>
                <div className="text-[10px] text-white/70 truncate">{currentUser.cargo}</div>
                <div className="mt-0.5">
                  <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${getRoleBadge(currentUser.role).bg}`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Role Switcher Dropdown Menu */}
          {dropdownOpen && (
            <div 
              id="sidebar-role-dropdown-menu"
              className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 text-slate-800 z-50 animate-in fade-in slide-in-from-bottom-2"
            >
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-600 flex items-center justify-between">
                <span>Alternar Perfil (RBAC)</span>
                <span className="text-[10px] text-[#2E3192] font-semibold">Simulação</span>
              </div>
              <div className="max-h-56 overflow-y-auto">
                {allUsers.map(user => {
                  const isCurrent = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      id={`sidebar-select-role-${user.role.toLowerCase()}`}
                      onClick={() => {
                        onSelectUser(user);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                        isCurrent ? 'bg-indigo-50/80 border-l-4 border-[#2E3192]' : ''
                      }`}
                    >
                      <img
                        src={user.foto_url}
                        alt={user.nome}
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-300"
                      />
                      <div className="overflow-hidden flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">{user.nome}</div>
                        <div className="text-[10px] text-slate-600 truncate">{user.cargo}</div>
                        <span className="inline-block mt-0.5 text-[8px] font-bold px-1 py-0.2 rounded bg-slate-100 text-slate-700">
                          {user.role}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {onLogout && (
                <div className="pt-1 border-t border-slate-100 px-1">
                  <button
                    id="sidebar-btn-logout-menu"
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 rounded-lg hover:bg-red-50 text-red-600 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Encerrar Sessão (Logout)</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
