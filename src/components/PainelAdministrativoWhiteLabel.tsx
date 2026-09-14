import React, { useState, useEffect } from 'react';
import { 
  AppSettings, 
  RoleConfig, 
  Usuario, 
  RoleUsuario, 
  PermissionCode, 
  ReferralProgramSettings,
  ParceiroB2B,
  ServicoCatalogo,
  Contact,
  Deal,
  Documento,
  CobrancaBoleto,
  SiteSettings,
  FluxoEmailMarketing,
  EnvioEmailLog,
  ConfigEmailMarketing
} from '../types';
import { ConfiguracaoIdentidadeVisual } from './ConfiguracaoIdentidadeVisual';
import { GerenciadorLogosSistema } from './admin/GerenciadorLogosSistema';
import { GerenciadorUsuariosSistema } from './admin/GerenciadorUsuariosSistema';
import { GerenciadorParceirosB2B } from './admin/GerenciadorParceirosB2B';
import { GerenciadorCatalogoServicos } from './admin/GerenciadorCatalogoServicos';
import { GerenciadorNotificacoesPushAdmin } from './admin/GerenciadorNotificacoesPushAdmin';
import { ModuloEmailMarketing } from './ModuloEmailMarketing';
import { PainelParceiroB2B } from './PainelParceiroB2B';
import { AreaClientePortal } from './AreaClientePortal';
import { MetaAdsManager } from './MetaAdsManager';
import { ModuloRelatorios } from './ModuloRelatorios';
import { ImageUploadInput } from './ImageUploadInput';
import { 
  Building, 
  Palette, 
  ShieldCheck, 
  Users, 
  Save, 
  CheckCircle2, 
  RefreshCw, 
  Code, 
  Lock, 
  UserPlus, 
  Clock, 
  Award, 
  Sparkles, 
  Sliders, 
  Briefcase,
  Layers,
  SearchCheck,
  Share2,
  BarChart3,
  Image as ImageIcon,
  BellRing,
  Mail
} from 'lucide-react';

interface PainelAdministrativoWhiteLabelProps {
  appSettings: AppSettings;
  onSaveAppSettings: (settings: AppSettings) => Promise<void>;
  roleConfigs: RoleConfig[];
  onUpdateRolePermissions: (role: RoleUsuario, permissions: PermissionCode[]) => Promise<void>;
  users: Usuario[];
  onAddUser: (user: Partial<Usuario>) => Promise<void>;
  onUpdateUser?: (userId: string, updatedData: Partial<Usuario>) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
  referralSettings: ReferralProgramSettings;
  onSaveReferralSettings: (settings: ReferralProgramSettings) => Promise<void>;
  parceiros?: ParceiroB2B[];
  onSaveParceiro?: (parceiro: ParceiroB2B) => Promise<void>;
  onDeleteParceiro?: (parceiroId: string) => Promise<void>;
  servicosCatalogo?: ServicoCatalogo[];
  onSaveServico?: (servico: ServicoCatalogo) => Promise<void>;
  onDeleteServico?: (servicoId: string) => Promise<void>;
  currentUser?: Usuario;
  contacts?: Contact[];
  deals?: Deal[];
  documents?: Documento[];
  cobrancas?: CobrancaBoleto[];
  siteSettings?: SiteSettings;
  onSaveSiteSettings?: (settings: SiteSettings) => Promise<void>;
  onOpenNovoLeadModal?: () => void;
  onAddLeadToCrm?: (contact: Partial<Contact>) => void;
  onRefreshData?: () => void;
  onVisualizarSite?: () => void;
  fluxosEmailMarketing?: FluxoEmailMarketing[];
  onSaveFluxoEmailMarketing?: (fluxo: FluxoEmailMarketing) => void;
  logsEmailMarketing?: EnvioEmailLog[];
  onAddLogEmailMarketing?: (log: EnvioEmailLog) => void;
  configEmailMarketing?: ConfigEmailMarketing;
  onSaveConfigEmailMarketing?: (config: ConfigEmailMarketing) => void;
}

export const PainelAdministrativoWhiteLabel: React.FC<PainelAdministrativoWhiteLabelProps> = ({
  appSettings,
  onSaveAppSettings,
  roleConfigs,
  onUpdateRolePermissions,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  referralSettings,
  onSaveReferralSettings,
  parceiros = [],
  onSaveParceiro = async () => {},
  onDeleteParceiro = async () => {},
  servicosCatalogo = [],
  onSaveServico = async () => {},
  onDeleteServico = async () => {},
  currentUser,
  contacts = [],
  deals = [],
  documents = [],
  cobrancas = [],
  siteSettings,
  onSaveSiteSettings,
  onOpenNovoLeadModal = () => {},
  onAddLeadToCrm,
  onRefreshData,
  onVisualizarSite,
  fluxosEmailMarketing = [],
  onSaveFluxoEmailMarketing = () => {},
  logsEmailMarketing = [],
  onAddLogEmailMarketing = () => {},
  configEmailMarketing = {
    remetente_nome: 'Brasil Legal - Atendimento',
    remetente_email: 'atendimento@brasillegal.com.br',
    servidor_smtp: 'smtp.brasillegal.com.br',
    porta_smtp: 587,
    disparar_apos_diagnostico_ia: true,
    notificar_push_ao_enviar: true,
    notificar_push_ao_abrir: true,
    link_custodia_padrao: 'https://brasillegal.com.br/portal/custodia/'
  },
  onSaveConfigEmailMarketing = () => {}
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'usuarios_sistema' | 'logos_sistema' | 'notificacoes_push' | 'email_marketing' | 'parceiros_b2b' | 'area_cliente' | 'meta_ads' | 'relatorios_kpi' | 'catalogo_servicos' | 'identidade' | 'whitelabel' | 'regras_b2b'
  >('usuarios_sistema');
  const [parceiroViewMode, setParceiroViewMode] = useState<'gerenciador' | 'portal_view'>('gerenciador');
  
  // White-label state
  const [settingsForm, setSettingsForm] = useState<AppSettings>(appSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Sync settingsForm with appSettings when database loads
  useEffect(() => {
    if (appSettings) {
      setSettingsForm(appSettings);
    }
  }, [appSettings]);

  // Referral Settings State
  const [refSettingsForm, setRefSettingsForm] = useState<ReferralProgramSettings>(referralSettings);
  const [isSavingReferral, setIsSavingReferral] = useState(false);

  useEffect(() => {
    setSettingsForm(appSettings);
  }, [appSettings]);

  useEffect(() => {
    setRefSettingsForm(referralSettings);
  }, [referralSettings]);

  const handleSaveWhiteLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await onSaveAppSettings(settingsForm);
      setSaveSuccessMsg('Configurações White-Label salvas com sucesso!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('Deseja restaurar as cores e nome originais da Brasil Legal?')) return;
    const defaultSettings: AppSettings = {
      ...settingsForm,
      app_name: 'Brasil Legal',
      app_tagline: 'Regularização Imobiliária & Gestão de Ativos',
      razao_social: 'Brasil Legal Regularização Fundiária & Negócios Imobiliários Ltda.',
      cnpj_empresa: '48.912.450/0001-90',
      cor_primaria: '#2E3192',
      cor_secundaria: '#F2EC00',
      cor_destaque: '#1C1E63',
      logo_header_url: '',
      logo_light_url: '',
      logo_dark_url: '',
      favicon_url: ''
    };
    setSettingsForm(defaultSettings);
    await onSaveAppSettings(defaultSettings);
    setSaveSuccessMsg('Branding padrão da Brasil Legal restaurado com sucesso!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleSaveReferralProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingReferral(true);
    try {
      await onSaveReferralSettings(refSettingsForm);
      setSaveSuccessMsg('Regras de compliance e liquidação B2B atualizadas com sucesso!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingReferral(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card with Sub-Navigation */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-[#2E3192]">
                Controle Master
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Administração & White-Label
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1">
              Painel de Governança, Equipe, Parceiros & Serviços
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Controle central de colaboradores internos, parceiros indicadores B2B (com login/senha e PIX), cardápio de serviços, logotipos e parâmetros corporativos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Empresa ativa:
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
              {appSettings.app_name || 'Brasil Legal'}
            </span>
          </div>
        </div>

        {/* Sub-Navigation Buttons */}
        <div className="flex items-center gap-1.5 mt-4 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('usuarios_sistema')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'usuarios_sistema'
                ? 'bg-white text-[#2E3192] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-[#2E3192]" />
            Usuários
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('logos_sistema')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'logos_sistema'
                ? 'bg-white text-[#2E3192] shadow-xs ring-1 ring-[#2E3192]/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#2E3192]" />
            <span>Logos do Sistema</span>
            <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-1.5 py-0.2 rounded-md">
              Novo
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('notificacoes_push')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'notificacoes_push'
                ? 'bg-white text-amber-800 shadow-xs ring-1 ring-amber-400/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BellRing className="w-4 h-4 text-amber-600" />
            <span>Notificações Push (Sininho)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('email_marketing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'email_marketing'
                ? 'bg-white text-[#2E3192] shadow-xs ring-1 ring-[#2E3192]/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4 text-[#2E3192]" />
            <span>E-mail Marketing & Automações</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('parceiros_b2b')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'parceiros_b2b'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            Portal Indique e Ganha
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('area_cliente')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'area_cliente'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <SearchCheck className="w-4 h-4 text-blue-600" />
            Área do Cliente
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('meta_ads')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'meta_ads'
                ? 'bg-white text-pink-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-4 h-4 text-pink-600" />
            Meta Ads
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('relatorios_kpi')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'relatorios_kpi'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            Relatórios KPIs
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('catalogo_servicos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'catalogo_servicos'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            Produtos & Serviços
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('identidade')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'identidade'
                ? 'bg-white text-[#2E3192] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-4 h-4 text-[#2E3192]" />
            Logotipos & Cores
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('whitelabel')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'whitelabel'
                ? 'bg-white text-[#2E3192] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4 text-slate-700" />
            Dados Institucionais
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('regras_b2b')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'regras_b2b'
                ? 'bg-white text-[#2E3192] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-slate-700" />
            Parâmetros B2B
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. USUÁRIOS DO SISTEMA (EQUIPE INTERNA & HIERARQUIA) */}
      {/* ======================================================== */}
      {activeSubTab === 'usuarios_sistema' && (
        <GerenciadorUsuariosSistema
          users={users}
          roleConfigs={roleConfigs}
          onAddUser={onAddUser}
          onUpdateUser={onUpdateUser}
          onDeleteUser={onDeleteUser}
          onUpdateRolePermissions={onUpdateRolePermissions}
        />
      )}

      {/* ======================================================== */}
      {/* 2. PORTAL INDIQUE E GANHA (GESTÃO + VISUALIZAÇÃO DO PORTAL) */}
      {/* ======================================================== */}
      {activeSubTab === 'parceiros_b2b' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              Portal Indique e Ganha B2B:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setParceiroViewMode('gerenciador')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  parceiroViewMode === 'gerenciador'
                    ? 'bg-white text-[#2E3192] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gerenciar Parceiros ({parceiros.length})
              </button>
              <button
                type="button"
                onClick={() => setParceiroViewMode('portal_view')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  parceiroViewMode === 'portal_view'
                    ? 'bg-white text-amber-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Visualizar Portal do Indicador
              </button>
            </div>
          </div>

          {parceiroViewMode === 'gerenciador' ? (
            <GerenciadorParceirosB2B
              parceiros={parceiros}
              onSaveParceiro={onSaveParceiro}
              onDeleteParceiro={onDeleteParceiro}
            />
          ) : (
            <PainelParceiroB2B
              currentUser={currentUser || users[0]}
              contacts={contacts}
              deals={deals}
              onOpenNovoLeadModal={onOpenNovoLeadModal}
              onVisualizarSite={onVisualizarSite}
            />
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ÁREA DO CLIENTE (PORTAL DE ACOMPANHAMENTO) */}
      {/* ======================================================== */}
      {activeSubTab === 'area_cliente' && (
        <AreaClientePortal
          deals={deals}
          contacts={contacts}
          documents={documents}
          appSettings={appSettings}
          siteSettings={siteSettings}
          onVoltarPainel={() => setActiveSubTab('usuarios_sistema')}
        />
      )}

      {/* ======================================================== */}
      {/* 4. META ADS (CAMPANHAS & TRÁFEGO PAGO) */}
      {/* ======================================================== */}
      {activeSubTab === 'meta_ads' && (
        <MetaAdsManager
          onAddLeadToCrm={onAddLeadToCrm}
          onRefreshLeads={onRefreshData}
        />
      )}

      {/* ======================================================== */}
      {/* 5. RELATÓRIOS KPIS & BUSINESS INTELLIGENCE */}
      {/* ======================================================== */}
      {activeSubTab === 'relatorios_kpi' && (
        <ModuloRelatorios
          contacts={contacts}
          deals={deals}
          documents={documents}
          cobrancas={cobrancas}
        />
      )}

      {/* ======================================================== */}
      {/* 3. PRODUTOS & CATÁLOGO DE SERVIÇOS (SITE E SISTEMA) */}
      {/* ======================================================== */}
      {activeSubTab === 'catalogo_servicos' && (
        <GerenciadorCatalogoServicos
          servicos={servicosCatalogo}
          onSaveServico={onSaveServico}
          onDeleteServico={onDeleteServico}
        />
      )}

      {/* ======================================================== */}
      {/* 2. GERENCIADOR DE LOGOTIPOS DEFINITIVOS DO SISTEMA */}
      {/* ======================================================== */}
      {activeSubTab === 'logos_sistema' && (
        <GerenciadorLogosSistema
          appSettings={appSettings}
          siteSettings={siteSettings}
          onSaveAppSettings={onSaveAppSettings}
          onSaveSiteSettings={onSaveSiteSettings}
          onVisualizarSite={onVisualizarSite}
        />
      )}

      {/* ======================================================== */}
      {/* NOTIFICAÇÕES PUSH (DISPARO & SININHO ADM) */}
      {/* ======================================================== */}
      {activeSubTab === 'notificacoes_push' && (
        <GerenciadorNotificacoesPushAdmin
          currentUser={currentUser}
        />
      )}

      {/* ======================================================== */}
      {/* E-MAIL MARKETING INTEGRADO & AUTOMAÇÕES WHITE-LABEL */}
      {/* ======================================================== */}
      {activeSubTab === 'email_marketing' && (
        <ModuloEmailMarketing
          fluxos={fluxosEmailMarketing}
          onSaveFluxo={onSaveFluxoEmailMarketing}
          logs={logsEmailMarketing}
          onAddLog={onAddLogEmailMarketing}
          config={configEmailMarketing}
          onSaveConfig={onSaveConfigEmailMarketing}
          contacts={contacts}
          deals={deals}
          appSettings={appSettings}
          currentUser={currentUser}
        />
      )}

      {/* ======================================================== */}
      {/* 4. IDENTIDADE VISUAL & LOGOTIPOS (LIGHT, DARK, HEADER, FAVICON) */}
      {/* ======================================================== */}
      {activeSubTab === 'identidade' && (
        <ConfiguracaoIdentidadeVisual
          appSettings={appSettings}
          onSaveAppSettings={onSaveAppSettings}
        />
      )}

      {/* ======================================================== */}
      {/* 5. DADOS INSTITUCIONAIS & WHITE-LABEL */}
      {/* ======================================================== */}
      {activeSubTab === 'whitelabel' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#2E3192]" />
                  Configuração White-Label & Razão Social
                </h2>
                <p className="text-xs text-slate-500">Defina o nome da plataforma, dados cadastrais e telefones corporativos</p>
              </div>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs text-[#2E3192] hover:underline font-semibold flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1.5 rounded-lg cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restaurar Padrão
              </button>
            </div>

            <form onSubmit={handleSaveWhiteLabel} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome do SaaS / Escritório *</label>
                  <input
                    type="text"
                    value={settingsForm.app_name}
                    onChange={e => setSettingsForm({ ...settingsForm, app_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="Brasil Legal"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Slogan / Tagline Institucional</label>
                  <input
                    type="text"
                    value={settingsForm.app_tagline}
                    onChange={e => setSettingsForm({ ...settingsForm, app_tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="Regularização Imobiliária & Gestão de Ativos"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Razão Social Operacional</label>
                  <input
                    type="text"
                    value={settingsForm.razao_social}
                    onChange={e => setSettingsForm({ ...settingsForm, razao_social: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CNPJ da Empresa Operadora</label>
                  <input
                    type="text"
                    value={settingsForm.cnpj_empresa}
                    onChange={e => setSettingsForm({ ...settingsForm, cnpj_empresa: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>

              {/* Suporte & Contato */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Canais de Atendimento & Suporte
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">WhatsApp de Suporte</label>
                    <input
                      type="text"
                      value={settingsForm.whatsapp_suporte}
                      onChange={e => setSettingsForm({ ...settingsForm, whatsapp_suporte: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">E-mail de Suporte</label>
                    <input
                      type="email"
                      value={settingsForm.email_suporte}
                      onChange={e => setSettingsForm({ ...settingsForm, email_suporte: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Meta de Atendimento (min)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={settingsForm.sla_meta_minutos}
                      onChange={e => setSettingsForm({ ...settingsForm, sla_meta_minutos: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Custom CSS for SaaS */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-[#2E3192]" />
                  CSS Customizado do Sistema
                </label>
                <textarea
                  rows={4}
                  value={settingsForm.css_customizado_saas}
                  onChange={e => setSettingsForm({ ...settingsForm, css_customizado_saas: e.target.value })}
                  className="w-full px-3 py-2 font-mono rounded-xl border border-slate-300 bg-slate-900 text-emerald-400"
                  placeholder="/* Regras de CSS adicionais */"
                />
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="flex items-center gap-2 bg-[#2E3192] text-white px-5 py-2.5 rounded-xl font-bold shadow-xs hover:bg-[#252877] transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#F2EC00]" />
                  {isSavingSettings ? 'Salvando...' : 'Salvar Dados Institucionais'}
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Live Preview: Branding Aplicado
              </h3>

              <div 
                className="p-4 rounded-xl text-white shadow-md mb-4 border-b-4"
                style={{ 
                  backgroundColor: settingsForm.cor_primaria || '#2E3192',
                  borderColor: settingsForm.cor_secundaria || '#F2EC00'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                      <Building className="w-5 h-5" style={{ color: settingsForm.cor_primaria || '#2E3192' }} />
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-tight">{settingsForm.app_name}</div>
                      <div className="text-[10px] text-white/80 line-clamp-1">{settingsForm.app_tagline}</div>
                    </div>
                  </div>
                  <span 
                    className="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase"
                    style={{ 
                      backgroundColor: settingsForm.cor_secundaria || '#F2EC00',
                      color: settingsForm.cor_primaria || '#2E3192'
                    }}
                  >
                    Enterprise
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-medium text-slate-500">Razão Social:</span>
                  <span className="font-bold text-slate-900 text-right truncate max-w-[170px]">
                    {settingsForm.razao_social}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-medium text-slate-500">CNPJ:</span>
                  <span className="font-mono text-slate-800">{settingsForm.cnpj_empresa}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="font-medium text-slate-500">Meta Atendimento:</span>
                  <span className="font-bold text-emerald-600">&lt; {settingsForm.sla_meta_minutos} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. PARÂMETROS & REGRAS B2B (COMPLIANCE & HOMOLOGAÇÃO) */}
      {/* ======================================================== */}
      {activeSubTab === 'regras_b2b' && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
          <div className="pb-4 border-b border-slate-100 mb-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#2E3192]" />
              Parâmetros e Compliance do Programa B2B
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Defina as regras de homologação jurídica e financeira e prazos de liquidação das comissões aos parceiros.
            </p>
          </div>

          <form onSubmit={handleSaveReferralProgram} className="space-y-4 max-w-2xl text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Percentual Sugerido de Entrada (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={refSettingsForm.percentual_padrao}
                  onChange={e => setRefSettingsForm({ ...refSettingsForm, percentual_padrao: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Apenas como sugestão inicial; os parceiros têm percentuais livres caso a caso.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Prazo de Liquidação após Homologação (dias)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={refSettingsForm.dias_payout}
                  onChange={e => setRefSettingsForm({ ...refSettingsForm, dias_payout: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={refSettingsForm.exigir_homologacao_diretoria}
                  onChange={e => setRefSettingsForm({ ...refSettingsForm, exigir_homologacao_diretoria: e.target.checked })}
                  className="rounded text-[#2E3192] focus:ring-[#2E3192]"
                />
                <span className="font-bold text-slate-900">
                  Exigir Homologação da Diretoria antes de liberar pagamento de comissão
                </span>
              </label>
              <p className="text-[11px] text-slate-500 pl-6">
                Previne repasses prematuros antes da compensação bancária dos honorários contratuais e validação registral da entrada.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingReferral}
                className="flex items-center gap-2 bg-[#2E3192] text-white px-5 py-2.5 rounded-xl font-bold shadow-xs hover:bg-[#252877] cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#F2EC00]" />
                {isSavingReferral ? 'Salvando...' : 'Salvar Parâmetros B2B'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
