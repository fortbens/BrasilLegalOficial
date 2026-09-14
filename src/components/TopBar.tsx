import React from 'react';
import { Usuario, AppSettings, AppNotification } from '../types';
import { NotificationCenter } from './NotificationCenter';
import { 
  Menu, 
  PlusCircle, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  FileText, 
  DollarSign, 
  Globe, 
  Bot, 
  Sliders,
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
  CalendarCheck,
  Mail
} from 'lucide-react';

interface TopBarProps {
  currentUser: Usuario;
  activeTab: string;
  onOpenMobileMenu: () => void;
  onOpenNovoLeadModal?: () => void;
  onVisualizarSite?: () => void;
  slaMetric: { totalLeads: number; inSlaPercent: number; avgResponseMin: number };
  appSettings?: AppSettings;
  notifications?: AppNotification[];
  onMarcarLida?: (id: string) => void;
  onLimparNotificacoes?: () => void;
  onSolicitarPermissaoPush?: () => Promise<boolean>;
  onEnviarNotificacaoTeste?: () => void;
  onSelectTab?: (tabId: string) => void;
  onLogout?: () => void;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string; icon: React.ElementType }> = {
  atividades: {
    title: 'Atividades & Agenda',
    subtitle: 'Gestão de Compromissos, Vistorias Técnicas, Diligências em Cartório e Google Agenda',
    icon: CalendarCheck
  },
  comercial: {
    title: 'Leads',
    subtitle: 'Funil Comercial, Triagem Rápida e SLA < 4 minutos',
    icon: Users
  },
  esteira_clientes: {
    title: 'Clientes',
    subtitle: 'Esteira de Clientes, Regularização e Gestão de Etapas',
    icon: Layers
  },
  tecnico: {
    title: 'Oportunidades',
    subtitle: 'CRM Técnico, Custódia Documental e Análise Provimento 65 CNJ',
    icon: FileText
  },
  omnichannel: {
    title: 'Multi-atendimento',
    subtitle: 'Central Omnichannel com WhatsApp, Webchat, E-mail e Atendimento com IA',
    icon: MessageSquare
  },
  meta_ads: {
    title: 'Marketing',
    subtitle: 'Meta Ads, Gestão de Anúncios Facebook & Instagram, Criativos e Captação',
    icon: Share2
  },
  email_marketing: {
    title: 'E-mail Marketing & Automações White-Label',
    subtitle: 'Régua de Relacionamento Automatizada com Gatilhos de CRM, Links Seguros de Custódia e Relatórios de Entrega',
    icon: Mail
  },
  financeiro: {
    title: 'Financeiro',
    subtitle: 'Split Bancário, Honorários, Comissões B2B, Cobrança e Boletos Híbridos com Pix',
    icon: DollarSign
  },
  cobranca_boletos: {
    title: 'Cobrança & Boletos Bancários',
    subtitle: 'Emissão de Boletos Híbridos com Pix, Febraban e Gateways Fintechs SaaS',
    icon: CreditCard
  },
  splits_bancarios: {
    title: 'Splits Bancários & Sócios',
    subtitle: 'Distribuição Automática de Receitas entre Sócios com Conciliação Pix',
    icon: DollarSign
  },
  assinaturas_digitais: {
    title: 'Assinatura Digital',
    subtitle: 'Contratos Digitais com Validade Jurídica MP 2.200-2 e Log de Auditoria',
    icon: FileSignature
  },
  cms_site: {
    title: 'Site & Blog',
    subtitle: 'CMS do Portal Público, Gestão de Artigos de Blog e Identidade Visual',
    icon: Globe
  },
  admin_whitelabel: {
    title: 'Painel ADM',
    subtitle: 'Administração Geral: Usuários, Indique e Ganha, Área do Cliente, Meta Ads e KPIs',
    icon: Sliders
  },
  relatorios: {
    title: 'Relatórios KPIs',
    subtitle: 'Indicadores de Conversão, SLA e Performance Financeira',
    icon: BarChart3
  },
  parceiro_portal: {
    title: 'Portal Indique e Ganha B2B',
    subtitle: 'Painel do Corretor/Advogado, Links de Indicação e Extrato de Comissões',
    icon: ShieldCheck
  },
  ai_engine: {
    title: 'Motor AI Studio (Gemini)',
    subtitle: 'Auditoria Inteligente de Matrículas e Assistente Registral',
    icon: Bot
  },
  area_cliente: {
    title: 'Área do Cliente',
    subtitle: 'Linha do Tempo Registral e Consulta de Processo para o Proprietário',
    icon: SearchCheck
  }
};

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  activeTab,
  onOpenMobileMenu,
  onOpenNovoLeadModal,
  onVisualizarSite,
  slaMetric,
  appSettings,
  notifications = [],
  onMarcarLida = () => {},
  onLimparNotificacoes = () => {},
  onSolicitarPermissaoPush = async () => true,
  onEnviarNotificacaoTeste = () => {},
  onSelectTab,
  onLogout
}) => {
  const currentTabInfo = TAB_TITLES[activeTab] || {
    title: 'Painel Operacional',
    subtitle: 'Gestão de Regularização Imobiliária',
    icon: Sparkles
  };

  const Icon = currentTabInfo.icon;
  const primaryColor = appSettings?.cor_primaria || '#2E3192';
  const secondaryColor = appSettings?.cor_secundaria || '#F2EC00';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Tab Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Menu Button */}
            <button
              id="btn-open-sidebar"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Abrir menu lateral"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Current View Icon & Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate flex items-center gap-2">
                  {currentTabInfo.title}
                </h1>
                <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                  {currentTabInfo.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick Actions, Notifications & Status */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* SLA Status Pill */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="text-slate-600 font-medium">SLA:</span>
              <span className="font-bold text-emerald-700">{slaMetric.inSlaPercent}% em dia</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">&lt; {appSettings?.sla_meta_minutos || 4}m</span>
            </div>

            {/* Notification Center (Desktop Push + In-App Alerts) */}
            <NotificationCenter
              currentUser={currentUser}
              notifications={notifications}
              onMarcarLida={onMarcarLida}
              onLimparTodas={onLimparNotificacoes}
              onSolicitarPermissaoPush={onSolicitarPermissaoPush}
              onEnviarNotificacaoTeste={onEnviarNotificacaoTeste}
              onNavegarPara={(link) => onSelectTab && onSelectTab(link)}
            />

            {/* Action Button: Visualizar Site (Página de Vendas) */}
            {onVisualizarSite && (
              <button
                id="btn-topbar-visualizar-site"
                onClick={onVisualizarSite}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-800 bg-amber-300 hover:bg-amber-400 border border-amber-400 shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Abrir pré-visualização completa da página de vendas pública"
              >
                <Eye className="w-3.5 h-3.5 text-slate-950" />
                <span className="hidden sm:inline">Visualizar Site</span>
                <span className="sm:hidden">Site</span>
                <ExternalLink className="w-3 h-3 text-slate-700 hidden md:inline" />
              </button>
            )}

            {/* Quick Action Button: Novo Lead */}
            {['ADMIN', 'SDR', 'PARCEIRO_B2B'].includes(currentUser.role) && onOpenNovoLeadModal && (
              <button
                id="btn-topbar-novo-lead"
                onClick={onOpenNovoLeadModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs transition-all hover:opacity-95 active:scale-95 cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                <PlusCircle className="w-3.5 h-3.5" style={{ color: secondaryColor }} />
                <span className="hidden xs:inline">Novo Lead</span>
              </button>
            )}

            {/* Current User Quick Avatar & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <img
                src={currentUser.foto_url}
                alt={currentUser.nome}
                className="w-8 h-8 rounded-full object-cover border border-slate-300"
              />
              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                  {currentUser.nome}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">{currentUser.role}</div>
              </div>

              {onLogout && (
                <button
                  id="topbar-btn-logout"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Sair do Sistema (Logout)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
