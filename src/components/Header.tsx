import React from 'react';
import { Usuario, RoleUsuario, AppSettings } from '../types';
import { 
  Building, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Users, 
  FileText, 
  DollarSign, 
  Globe, 
  Bot,
  ChevronDown,
  Sliders
} from 'lucide-react';

interface HeaderProps {
  currentUser: Usuario;
  allUsers: Usuario[];
  onSelectUser: (user: Usuario) => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  slaMetric: { totalLeads: number; inSlaPercent: number; avgResponseMin: number };
  appSettings?: AppSettings;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  activeTab,
  onSelectTab,
  slaMetric,
  appSettings
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [logoImgError, setLogoImgError] = React.useState(false);

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

  // Define accessible tabs based on RBAC matrix:
  // Administrador / Diretor: Acesso irrestrito (funis, gestão de usuários, injetor CSS, homologação financeira, white-label)
  // Coordenador Jurídico / Engenheiro: CRM técnico, validação de documentos, pareceres
  // SDR / Atendimento Comercial: Funil Comercial, qualificação leads, upload documentos, dados cadastrais
  // Parceiro B2B: Visão restrita de indicados e extrato comissionamento
  const tabs = [
    {
      id: 'comercial',
      label: 'Funil Comercial (SDR)',
      icon: Users,
      allowedRoles: ['ADMIN', 'SDR'],
      badge: 'SLA < 4min'
    },
    {
      id: 'tecnico',
      label: 'CRM Técnico & Custódia',
      icon: FileText,
      allowedRoles: ['ADMIN', 'TECNICO'],
      badge: 'Prov. 65 CNJ'
    },
    {
      id: 'financeiro',
      label: 'Financeiro & Comissões B2B',
      icon: DollarSign,
      allowedRoles: ['ADMIN'],
      badge: 'Diretoria'
    },
    {
      id: 'parceiro_portal',
      label: 'Portal Indique e Ganhe B2B',
      icon: ShieldCheck,
      allowedRoles: ['ADMIN', 'PARCEIRO_B2B'],
      badge: '5% Comissão'
    },
    {
      id: 'ai_engine',
      label: 'Motor AI Studio (Gemini)',
      icon: Bot,
      allowedRoles: ['ADMIN', 'TECNICO', 'SDR'],
      badge: 'Tools'
    },
    {
      id: 'cms_site',
      label: 'Portal Público & CMS',
      icon: Globe,
      allowedRoles: ['ADMIN'],
      badge: 'Injetor CSS'
    },
    {
      id: 'admin_whitelabel',
      label: 'Administração & White-Label',
      icon: Sliders,
      allowedRoles: ['ADMIN'],
      badge: 'RBAC'
    }
  ];

  const visibleTabs = tabs.filter(t => t.allowedRoles.includes(currentUser.role));

  const primaryColor = appSettings?.cor_primaria || '#2E3192';
  const secondaryColor = appSettings?.cor_secundaria || '#F2EC00';
  const appName = appSettings?.app_name || 'BRASIL LEGAL';
  const appTagline = appSettings?.app_tagline || 'Regularização Imobiliária & Gestão de Ativos Fundiários';

  const getRoleBadge = (role: RoleUsuario) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Administrador / Diretor', bg: 'bg-[#2E3192] text-white' };
      case 'TECNICO':
        return { label: 'Coord. Jurídico & Engenheiro', bg: 'bg-emerald-800 text-emerald-100' };
      case 'SDR':
        return { label: 'SDR / Atendimento Comercial', bg: 'bg-blue-800 text-blue-100' };
      case 'PARCEIRO_B2B':
        return { label: 'Parceiro B2B (Indique e Ganhe)', bg: 'bg-amber-800 text-amber-100' };
    }
  };

  return (
    <header 
      className="text-white shadow-md sticky top-0 z-40 border-b-4 transition-colors duration-300"
      style={{ backgroundColor: primaryColor, borderBottomColor: secondaryColor }}
    >
      {/* Top Banner with SLA Status and Brand */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 border-b border-white/10 gap-4">
          {/* Logo & Corporate Identity */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-inner border overflow-hidden p-1 shrink-0"
              style={{ borderColor: secondaryColor }}
            >
              {appSettings?.logo_dark_url && !logoImgError ? (
                <img 
                  src={appSettings.logo_dark_url} 
                  alt={appName}
                  className="w-full h-full object-contain"
                  onError={() => setLogoImgError(true)}
                />
              ) : (
                <Building className="w-6 h-6" style={{ color: primaryColor }} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-tight text-white uppercase">
                  {appName}
                </span>
                <span 
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wider uppercase"
                  style={{ backgroundColor: secondaryColor, color: primaryColor }}
                >
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium">{appTagline}</p>
            </div>
          </div>

          {/* SLA < 4 min Live Metric Monitor */}
          <div className="hidden md:flex items-center gap-4 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/15">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 animate-pulse" style={{ color: secondaryColor }} />
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-white/70">SLA 1º Contato</div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <span style={{ color: secondaryColor }}>&lt; {appSettings?.sla_meta_minutos || 4} min</span>
                  <span className="text-emerald-300 font-bold">({slaMetric.inSlaPercent}% em dia)</span>
                </div>
              </div>
            </div>
            <div className="h-6 w-px bg-white/20"></div>
            <div className="text-[11px] text-white/80">
              Média atual: <strong className="text-white">{slaMetric.avgResponseMin} min</strong>
            </div>
          </div>

          {/* RBAC Role Switcher */}
          <div className="relative">
            <button
              id="btn-role-switcher"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 bg-white/15 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/20 transition-all text-left"
            >
              <img
                src={currentUser.foto_url}
                alt={currentUser.nome}
                className="w-8 h-8 rounded-full object-cover border"
                style={{ borderColor: secondaryColor }}
              />
              <div className="hidden sm:block">
                <div className="text-xs font-bold leading-tight text-white flex items-center gap-1">
                  {currentUser.nome}
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: secondaryColor }} />
                </div>
                <div className="text-[10px] text-white/80">{getRoleBadge(currentUser.role).label}</div>
              </div>
            </button>

            {/* Dropdown Menu to test RBAC roles */}
            {dropdownOpen && (
              <div 
                id="role-dropdown-menu"
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2"
              >
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-600">
                  Alternar Perfil (Matriz RBAC)
                </div>
                {allUsers.map(user => {
                  const isCurrent = user.id === currentUser.id;
                  return (
                    <button
                      key={user.id}
                      id={`select-role-${user.role.toLowerCase()}`}
                      onClick={() => {
                        onSelectUser(user);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                        isCurrent ? 'bg-indigo-50/70 border-l-4 border-[#2E3192]' : ''
                      }`}
                    >
                      <img
                        src={user.foto_url}
                        alt={user.nome}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-300"
                      />
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-900 truncate">{user.nome}</div>
                        <div className="text-[10px] text-slate-700 truncate">{user.cargo}</div>
                        <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                          {user.role}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs Filtered by RBAC */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'shadow font-bold'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
                style={isActive ? { backgroundColor: secondaryColor, color: primaryColor } : undefined}
              >
                <Icon className="w-4 h-4" style={isActive ? { color: primaryColor } : { color: 'rgba(255,255,255,0.8)' }} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                    style={
                      isActive
                        ? { backgroundColor: primaryColor, color: '#ffffff' }
                        : { backgroundColor: 'rgba(255,255,255,0.15)', color: secondaryColor }
                    }
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
