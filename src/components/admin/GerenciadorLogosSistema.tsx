import React, { useState, useEffect } from 'react';
import { AppSettings, SiteSettings } from '../../types';
import { ImageUploadInput } from '../ImageUploadInput';
import { BRASIL_LEGAL_LOGO_PRESETS } from '../../utils/logoPresets';
import { 
  ImageIcon, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Layout, 
  Lock, 
  Sun, 
  Moon, 
  Globe, 
  Sparkles, 
  Database, 
  HardDrive, 
  Layers, 
  ShieldCheck,
  Eye,
  Sliders,
  Check,
  ExternalLink
} from 'lucide-react';

interface GerenciadorLogosSistemaProps {
  appSettings: AppSettings;
  siteSettings?: SiteSettings;
  onSaveAppSettings: (settings: AppSettings) => Promise<void>;
  onSaveSiteSettings?: (settings: SiteSettings) => Promise<void>;
  onVisualizarSite?: () => void;
}

export const GerenciadorLogosSistema: React.FC<GerenciadorLogosSistemaProps> = ({
  appSettings,
  siteSettings,
  onSaveAppSettings,
  onSaveSiteSettings,
  onVisualizarSite
}) => {
  const [form, setForm] = useState<AppSettings>({
    ...appSettings,
    logo_sidebar_url: appSettings.logo_sidebar_url || appSettings.logo_icon_url || '/assets/logo-brasil-legal-oficial.png',
    logo_login_url: appSettings.logo_login_url || appSettings.logo_header_url || '/assets/logo-brasil-legal-oficial.png',
    logo_header_url: appSettings.logo_header_url || '/assets/logo-brasil-legal-oficial.png',
    logo_light_url: appSettings.logo_light_url || '/assets/logo-brasil-legal-oficial.png',
    logo_dark_url: appSettings.logo_dark_url || '/assets/logo-brasil-legal-dark.svg',
    logo_icon_url: appSettings.logo_icon_url || '/assets/logo-icon-brasil-legal.svg',
    favicon_url: appSettings.favicon_url || '/assets/logo-icon-brasil-legal.svg'
  });

  const [sincronizarSite, setSincronizarSite] = useState(true);
  const [sidebarBgMode, setSidebarBgMode] = useState<'white' | 'transparent' | 'navy'>('white');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'todos' | 'sidebar' | 'login' | 'header' | 'favicon'>('todos');

  useEffect(() => {
    setForm({
      ...appSettings,
      logo_sidebar_url: appSettings.logo_sidebar_url || appSettings.logo_icon_url || '/assets/logo-brasil-legal-oficial.png',
      logo_login_url: appSettings.logo_login_url || appSettings.logo_header_url || '/assets/logo-brasil-legal-oficial.png',
      logo_header_url: appSettings.logo_header_url || '/assets/logo-brasil-legal-oficial.png',
      logo_light_url: appSettings.logo_light_url || '/assets/logo-brasil-legal-oficial.png',
      logo_dark_url: appSettings.logo_dark_url || '/assets/logo-brasil-legal-dark.svg',
      logo_icon_url: appSettings.logo_icon_url || '/assets/logo-icon-brasil-legal.svg',
      favicon_url: appSettings.favicon_url || '/assets/logo-icon-brasil-legal.svg'
    });
  }, [appSettings]);

  // Upload permanentemente qualquer imagem data:base64 para o servidor
  const uploadPermanentFile = async (dataUrl: string, prefix: string): Promise<string> => {
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      return dataUrl;
    }
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl,
          filename: `${prefix}_${Date.now()}`
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) return data.url;
      }
    } catch (e) {
      console.warn('[Upload] Falha ao enviar imagem, mantendo URI:', e);
    }
    return dataUrl;
  };

  const handleSaveDefinitivo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');

    try {
      // 1. Converter uploads em arquivos persistentes no servidor
      const [
        savedSidebar,
        savedLogin,
        savedHeader,
        savedLight,
        savedDark,
        savedIcon,
        savedFavicon
      ] = await Promise.all([
        uploadPermanentFile(form.logo_sidebar_url || '', 'logo_sidebar'),
        uploadPermanentFile(form.logo_login_url || '', 'logo_login'),
        uploadPermanentFile(form.logo_header_url || '', 'logo_header'),
        uploadPermanentFile(form.logo_light_url || '', 'logo_light'),
        uploadPermanentFile(form.logo_dark_url || '', 'logo_dark'),
        uploadPermanentFile(form.logo_icon_url || '', 'logo_icon'),
        uploadPermanentFile(form.favicon_url || '', 'favicon')
      ]);

      const finalSettings: AppSettings = {
        ...form,
        logo_sidebar_url: savedSidebar,
        logo_login_url: savedLogin,
        logo_header_url: savedHeader,
        logo_light_url: savedLight,
        logo_dark_url: savedDark,
        logo_icon_url: savedIcon,
        favicon_url: savedFavicon
      };

      // 2. Salvar AppSettings (atualiza React state, localStorage, backend db_store.json e Firestore)
      await onSaveAppSettings(finalSettings);

      // 3. Se marcado, sincronizar com o Site Oficial Público
      if (sincronizarSite && siteSettings && onSaveSiteSettings) {
        const updatedSite: SiteSettings = {
          ...siteSettings,
          logo_principal_url: savedHeader || savedLight || siteSettings.logo_principal_url,
          logo_footer_url: savedDark || siteSettings.logo_footer_url
        };
        await onSaveSiteSettings(updatedSite);
      }

      setSuccessMessage('Logotipos salvos com sucesso e persistidos de forma definitiva no sistema!');
      setTimeout(() => setSuccessMessage(''), 5500);
    } catch (err) {
      console.error('Erro ao salvar logotipos definitivamente:', err);
      alert('Ocorreu um erro ao salvar os logotipos. Verifique a conexão.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPadroes = () => {
    if (!confirm('Deseja restaurar todos os logotipos para a identidade oficial padrão da Brasil Legal?')) return;
    
    setForm(prev => ({
      ...prev,
      logo_sidebar_url: '/assets/logo-brasil-legal-oficial.png',
      logo_login_url: '/assets/logo-brasil-legal-oficial.png',
      logo_header_url: '/assets/logo-brasil-legal-oficial.png',
      logo_light_url: '/assets/logo-brasil-legal-oficial.png',
      logo_dark_url: '/assets/logo-brasil-legal-dark.svg',
      logo_icon_url: '/assets/logo-icon-brasil-legal.svg',
      favicon_url: '/assets/logo-icon-brasil-legal.svg'
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Principal de Logotipos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-[#2E3192] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                <ImageIcon className="w-3.5 h-3.5" />
                Gestão Oficial de Logos
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                Persistência Definitiva Multi-Camada
              </span>
              <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Menu Lateral, Login & Topo
              </span>
            </div>

            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Gerenciador de Logotipos do Sistema
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Personalize com precisão cirúrgica os logotipos exibidos no <strong>Menu Lateral (Sidebar)</strong>, na <strong>Tela de Login</strong>, no <strong>Cabeçalho Principal</strong> e na <strong>Aba do Navegador (Favicon)</strong>. As alterações são gravadas de forma definitiva no servidor, na nuvem Firestore e no cache local.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleResetPadroes}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-[#2E3192] bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Padrões
            </button>

            <button
              type="button"
              onClick={() => handleSaveDefinitivo()}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#2E3192] hover:bg-[#1C1E63] active:scale-98 shadow-md rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              <span>{isSaving ? 'Salvando Definitivamente...' : 'Salvar Todos os Logos Definitivamente'}</span>
            </button>
          </div>
        </div>

        {/* Camadas de Persistência Garantida */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-600">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <HardDrive className="w-4 h-4 text-[#2E3192] shrink-0" />
            <span><strong>Servidor Local:</strong> Salvo em <code className="font-mono text-slate-800">data/db_store.json</code></span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <Database className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Nuvem:</strong> Firestore <code className="font-mono text-slate-800">app_settings</code></span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
            <Layers className="w-4 h-4 text-amber-600 shrink-0" />
            <span><strong>Navegador:</strong> Carregamento instantâneo via Cache</span>
          </div>
        </div>
      </div>

      {/* Alerta de Sucesso */}
      {successMessage && (
        <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-900 px-5 py-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">Persistência Concluída com Êxito!</h4>
              <p className="text-xs text-emerald-800">{successMessage}</p>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-emerald-200 text-emerald-900 px-2.5 py-1 rounded-md shrink-0">
            100% Permanente
          </span>
        </div>
      )}

      {/* Filtro Rápido / Abas das Seções */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('todos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'todos' 
              ? 'bg-[#2E3192] text-white shadow-xs' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Visualizar Todos os 5 Logotipos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sidebar')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'sidebar' 
              ? 'bg-[#2E3192] text-white shadow-xs' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          1. Menu Lateral (Sidebar)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'login' 
              ? 'bg-[#2E3192] text-white shadow-xs' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          2. Tela de Login
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('header')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'header' 
              ? 'bg-[#2E3192] text-white shadow-xs' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          3. Cabeçalho / Topo & Modo Escuro
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('favicon')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
            activeTab === 'favicon' 
              ? 'bg-[#2E3192] text-white shadow-xs' 
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          4. Favicon do Navegador
        </button>
      </div>

      <div className="space-y-8">
        {/* CARD 1: LOGO DO MENU LATERAL (SIDEBAR) */}
        {(activeTab === 'todos' || activeTab === 'sidebar') && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2E3192] text-[#F2EC00] flex items-center justify-center font-bold text-sm shadow-xs border border-white/10">
                  <Layout className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      1. Logo do Menu Lateral (Sidebar / Topo do Menu)
                    </h3>
                    <span className="text-[10px] bg-[#F2EC00] text-[#1C1E63] font-black px-2 py-0.5 rounded uppercase">
                      Exibição Principal
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Controla o logotipo exibido no topo do menu lateral (ícone quadrado com borda dourada).
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded text-slate-300 shrink-0">
                appSettings.logo_sidebar_url
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Lado Esquerdo: Formulário de Upload e Presets */}
              <div className="lg:col-span-7 space-y-4">
                <ImageUploadInput
                  id="input-logo-sidebar"
                  label="Imagem do Logotipo / Símbolo do Menu Lateral"
                  description="Selecione uma imagem (PNG transparente recomendado, SVG ou JPG) ou insira a URL."
                  value={form.logo_sidebar_url || ''}
                  onChange={(val) => setForm(prev => ({ ...prev, logo_sidebar_url: val }))}
                  placeholder="/assets/logo-brasil-legal-oficial.png"
                  presets={[
                    { label: 'Brasil Legal Oficial (Dourado)', url: '/assets/logo-brasil-legal-oficial.png' },
                    { label: 'Símbolo Documentos Notariais', url: '/assets/logo-icon-brasil-legal.svg' },
                    { label: 'Monograma BL Corporativo', url: BRASIL_LEGAL_LOGO_PRESETS[3].dataUri },
                    { label: 'Brazão Notarial & Registral', url: BRASIL_LEGAL_LOGO_PRESETS[2].dataUri },
                    { label: 'Selo Oficial REURB & Cartório', url: BRASIL_LEGAL_LOGO_PRESETS[4].dataUri }
                  ]}
                />

                {/* Opções de Estilo do Box */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Fundo do Box no Menu Lateral:
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSidebarBgMode('white')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                        sidebarBgMode === 'white' 
                          ? 'border-[#2E3192] bg-indigo-50 text-[#2E3192]' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-white border border-slate-300" />
                      Fundo Branco (Padrão Oficial)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSidebarBgMode('navy')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                        sidebarBgMode === 'navy' 
                          ? 'border-[#2E3192] bg-indigo-50 text-[#2E3192]' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-[#1C1E63] border border-slate-400" />
                      Fundo Azul Noturno
                    </button>
                    <button
                      type="button"
                      onClick={() => setSidebarBgMode('transparent')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                        sidebarBgMode === 'transparent' 
                          ? 'border-[#2E3192] bg-indigo-50 text-[#2E3192]' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full bg-slate-300" />
                      Transparente
                    </button>
                  </div>
                </div>
              </div>

              {/* Lado Direito: Preview REAL Idêntico ao Menu Lateral */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <span className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#2E3192]" />
                  Preview Exato no Menu Lateral (Sidebar):
                </span>

                <div className="rounded-2xl bg-[#0F102B] border border-slate-800 p-4 shadow-xl overflow-hidden text-white">
                  {/* Top Header Mockup */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[#2E3192]/80 border border-white/10">
                    <div 
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md border overflow-hidden p-1 shrink-0 transition-colors ${
                        sidebarBgMode === 'white' ? 'bg-white' : sidebarBgMode === 'navy' ? 'bg-[#0F102B]' : 'bg-transparent'
                      }`}
                      style={{ borderColor: form.cor_secundaria || '#F2EC00' }}
                    >
                      <img 
                        src={form.logo_sidebar_url || '/assets/logo-brasil-legal-oficial.png'} 
                        alt="Logo Sidebar"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src = '/assets/logo-brasil-legal-oficial.png';
                        }}
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-sm font-black tracking-tight text-white uppercase truncate">
                          {form.app_name || 'BRASIL LEGAL'}
                        </span>
                        <span 
                          className="text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase shadow-xs shrink-0"
                          style={{ backgroundColor: form.cor_secundaria || '#F2EC00', color: form.cor_primaria || '#2E3192' }}
                        >
                          ENTERPRISE
                        </span>
                      </div>
                      <p className="text-[10px] text-white/70 truncate mt-0.5">
                        {form.app_tagline || 'Plataforma Integrada de Regularização...'}
                      </p>
                    </div>
                  </div>

                  {/* Mini-mockup de itens do menu */}
                  <div className="mt-3 space-y-1.5 opacity-60 text-xs px-1">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/10 text-white font-medium">
                      <div className="w-2 h-2 rounded-full bg-[#F2EC00]" />
                      <span>Leads & Triagem Rápida</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300">
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      <span>Clientes & Esteira</span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 text-center">
                  Renderizado com borda secundária dourada de alto contraste.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CARD 2: LOGO DA TELA DE LOGIN */}
        {(activeTab === 'todos' || activeTab === 'login') && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2E3192] text-[#F2EC00] flex items-center justify-center font-bold text-sm shadow-xs border border-white/10">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      2. Logo da Tela de Login & Acesso
                    </h3>
                    <span className="text-[10px] bg-indigo-500 text-white font-black px-2 py-0.5 rounded uppercase">
                      Autenticação
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Exibido no cartão central da tela de login para colaboradores, diretores e parceiros.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded text-slate-300 shrink-0">
                appSettings.logo_login_url
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Lado Esquerdo: Formulário */}
              <div className="lg:col-span-7 space-y-4">
                <ImageUploadInput
                  id="input-logo-login"
                  label="Logotipo da Tela de Login"
                  description="Selecione uma imagem de alta resolução (PNG com fundo transparente recomendado)."
                  value={form.logo_login_url || ''}
                  onChange={(val) => setForm(prev => ({ ...prev, logo_login_url: val }))}
                  placeholder="/assets/logo-brasil-legal-oficial.png"
                  presets={[
                    { label: 'Brasil Legal Oficial (Recomendado)', url: '/assets/logo-brasil-legal-oficial.png' },
                    { label: 'Brasil Legal Modo Noturno', url: '/assets/logo-brasil-legal-dark.svg' },
                    { label: 'Símbolo Documentos Dourados', url: '/assets/logo-icon-brasil-legal.svg' }
                  ]}
                />
              </div>

              {/* Lado Direito: Preview REAL Idêntico à Tela de Login */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <span className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#2E3192]" />
                  Preview Exato na Tela de Login:
                </span>

                <div className="rounded-2xl bg-gradient-to-br from-[#0B0C1E] via-[#141838] to-[#1C1E63] p-6 text-center border border-slate-700 shadow-xl relative overflow-hidden">
                  <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-3">
                    <img 
                      src={form.logo_login_url || '/assets/logo-brasil-legal-oficial.png'} 
                      alt="Logo Login"
                      className="h-12 sm:h-14 w-auto max-w-[200px] object-contain drop-shadow-md"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = '/assets/logo-brasil-legal-oficial.png';
                      }}
                    />
                  </div>

                  <h4 className="text-lg font-extrabold text-white tracking-tight">
                    {form.app_name || 'Brasil Legal'}
                  </h4>
                  <p className="mt-1 text-[11px] text-slate-300 max-w-xs mx-auto">
                    {form.app_tagline || 'Plataforma Integrada de Regularização Imobiliária & Gestão Registral'}
                  </p>
                  <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-semibold text-emerald-300">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Acesso Seguro com Criptografia TLS 256-bit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CARD 3 & 4: CABEÇALHO PRINCIPAL (LIGHT) & MODO ESCURO */}
        {(activeTab === 'todos' || activeTab === 'header') && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2E3192] text-[#F2EC00] flex items-center justify-center font-bold text-sm shadow-xs border border-white/10">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    3. Logotipo Principal do Topo / Header & Modo Escuro
                  </h3>
                  <p className="text-xs text-slate-300">
                    Logotipo oficial aplicado no site público, relatórios em PDF, contratos impressos e cabeçalhos diurnos/noturnos.
                  </p>
                </div>
              </div>

              {/* Toggle Sincronizar Site */}
              <label className="flex items-center gap-2 cursor-pointer bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/15 transition-all shrink-0">
                <input
                  type="checkbox"
                  checked={sincronizarSite}
                  onChange={(e) => setSincronizarSite(e.target.checked)}
                  className="rounded text-[#2E3192] focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-white">
                  Sincronizar com Site Público (CMS)
                </span>
              </label>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Light / Principal */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    Logo para Fundo Claro (Header / Site / Impressos)
                  </span>
                  <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    logo_header_url
                  </span>
                </div>

                <ImageUploadInput
                  id="input-logo-header"
                  label="Logotipo Header / Modo Claro"
                  description="Ideal para fundos brancos e claros."
                  value={form.logo_header_url || ''}
                  onChange={(val) => setForm(prev => ({ ...prev, logo_header_url: val, logo_light_url: val }))}
                  placeholder="/assets/logo-brasil-legal-oficial.png"
                  presets={[
                    { label: 'Brasil Legal Oficial', url: '/assets/logo-brasil-legal-oficial.png' },
                    { label: 'Brasil Legal Light Vetorial', url: '/assets/logo-brasil-legal-light.svg' }
                  ]}
                />

                {/* Preview Claro */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">Preview em Fundo Claro:</span>
                  <div className="h-20 rounded-xl bg-white border border-slate-300 flex items-center justify-center p-3 shadow-inner">
                    <img
                      src={form.logo_header_url || '/assets/logo-brasil-legal-oficial.png'}
                      alt="Preview Light"
                      className="max-h-12 w-auto object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = '/assets/logo-brasil-legal-oficial.png';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Logo Dark */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-indigo-500" />
                    Logo para Fundo Escuro (Dark Mode / Rodapé Noturno)
                  </span>
                  <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    logo_dark_url
                  </span>
                </div>

                <ImageUploadInput
                  id="input-logo-dark"
                  label="Logotipo Modo Escuro"
                  description="Ideal para fundos azuis profundos e pretos."
                  value={form.logo_dark_url || ''}
                  onChange={(val) => setForm(prev => ({ ...prev, logo_dark_url: val }))}
                  placeholder="/assets/logo-brasil-legal-dark.svg"
                  presets={[
                    { label: 'Brasil Legal Dark Oficial', url: '/assets/logo-brasil-legal-dark.svg' },
                    { label: 'Brasil Legal Oficial', url: '/assets/logo-brasil-legal-oficial.png' }
                  ]}
                />

                {/* Preview Escuro */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">Preview em Fundo Noturno:</span>
                  <div 
                    className="h-20 rounded-xl border border-slate-800 flex items-center justify-center p-3 shadow-inner"
                    style={{ backgroundColor: form.cor_primaria || '#2E3192' }}
                  >
                    <img
                      src={form.logo_dark_url || '/assets/logo-brasil-legal-dark.svg'}
                      alt="Preview Dark"
                      className="max-h-12 w-auto object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = '/assets/logo-brasil-legal-oficial.png';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CARD 5: FAVICON DO NAVEGADOR */}
        {(activeTab === 'todos' || activeTab === 'favicon') && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2E3192] text-[#F2EC00] flex items-center justify-center font-bold text-sm shadow-xs border border-white/10">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    4. Favicon do Navegador (Ícone da Aba)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Ícone que aparece na aba do navegador, na barra de favoritos e em notificações PWA.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded text-slate-300 shrink-0">
                appSettings.favicon_url
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <ImageUploadInput
                  id="input-favicon"
                  label="Arquivo do Favicon"
                  description="Envie um ícone quadrado (.ico, .png 32x32, 64x64 ou .svg)."
                  value={form.favicon_url || ''}
                  onChange={(val) => setForm(prev => ({ ...prev, favicon_url: val, logo_icon_url: val }))}
                  placeholder="/assets/logo-icon-brasil-legal.svg"
                  aspectHint="1:1 Quadrado"
                  presets={[
                    { label: 'Símbolo Oficial Brasil Legal', url: '/assets/logo-icon-brasil-legal.svg' }
                  ]}
                />
              </div>

              <div className="lg:col-span-5 flex flex-col justify-center">
                <span className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#2E3192]" />
                  Simulação da Aba do Navegador:
                </span>

                <div className="bg-slate-200 p-2.5 rounded-t-xl border border-slate-300">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>

                  <div className="bg-white rounded-t-lg px-3 py-1.5 flex items-center gap-2 text-xs text-slate-800 font-bold shadow-xs border-t border-x border-slate-300 max-w-sm">
                    <img 
                      src={form.favicon_url || '/assets/logo-icon-brasil-legal.svg'} 
                      alt="Favicon" 
                      className="w-4 h-4 object-contain"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src = '/assets/logo-icon-brasil-legal.svg';
                      }}
                    />
                    <span className="truncate text-xs font-semibold">
                      {form.app_name || 'Brasil Legal'} | Regularização Imobiliária
                    </span>
                  </div>
                </div>
                <div className="bg-white p-2.5 text-[10px] font-mono text-slate-500 border-x border-b border-slate-300 rounded-b-xl flex items-center justify-between">
                  <span>https://app.brasillegal.com.br</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Conexão Segura
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barra de Ação Fixa / Inferior */}
      <div className="sticky bottom-4 z-20 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Pronto para salvar de forma permanente?</h4>
            <p className="text-xs text-slate-300">
              Os logotipos serão gravados em disco, nuvem Firestore e aplicados em tempo real na interface.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleResetPadroes}
            className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer"
          >
            Cancelar / Restaurar
          </button>

          <button
            type="button"
            onClick={() => handleSaveDefinitivo()}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-[#0B0C1E] bg-[#F2EC00] hover:bg-[#FFE600] active:scale-98 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Gravando no Servidor & Nuvem...' : 'Salvar Logotipos Definitivamente'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
