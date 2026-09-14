import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { ImageUploadInput } from './ImageUploadInput';
import { 
  Palette, 
  Sun, 
  Moon, 
  Globe, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Sliders,
  Eye,
  Info,
  Type,
  Video,
  Play,
  Film
} from 'lucide-react';

interface ConfiguracaoIdentidadeVisualProps {
  appSettings: AppSettings;
  onSaveAppSettings: (settings: AppSettings) => Promise<void>;
}

interface ColorPreset {
  id: string;
  name: string;
  category: string;
  primaria: string;
  secundaria: string;
  destaque: string;
  fundo: string;
  texto: string;
  previewBg: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'brasil_legal',
    name: 'Brasil Legal Oficial',
    category: 'Identidade Padrão',
    primaria: '#2E3192', // Azul Profundo
    secundaria: '#F2EC00', // Amarelo Ouro
    destaque: '#1C1E63',
    fundo: '#F8FAFC',
    texto: '#0F172A',
    previewBg: '#2E3192'
  },
  {
    id: 'safira_ouro',
    name: 'Safira Real & Ouro Nobre',
    category: 'Corporativo Premium',
    primaria: '#0F172A', // Slate Marinho Profundo
    secundaria: '#EAB308', // Ouro Reluzente
    destaque: '#1E293B',
    fundo: '#F8FAFC',
    texto: '#020617',
    previewBg: '#0F172A'
  },
  {
    id: 'esmeralda_registral',
    name: 'Esmeralda Registral',
    category: 'Ambiental & Fundiário',
    primaria: '#064E3B', // Verde Floresta
    secundaria: '#34D399', // Menta Refrescante
    destaque: '#022C22',
    fundo: '#F0FDF4',
    texto: '#064E3B',
    previewBg: '#064E3B'
  },
  {
    id: 'bordeaux_juridico',
    name: 'Bordeaux & Bronze Jurídico',
    category: 'Advocacia Registral',
    primaria: '#701A75', // Vinho / Magenta Profundo
    secundaria: '#F59E0B', // Âmbar Cartorário
    destaque: '#4A044E',
    fundo: '#FDF4FF',
    texto: '#3B0764',
    previewBg: '#701A75'
  },
  {
    id: 'ardosia_tech',
    name: 'Ardósia & Índigo Tech',
    category: 'Modern SaaS',
    primaria: '#1E1B4B', // Índigo Noturno
    secundaria: '#818CF8', // Índigo Claro
    destaque: '#312E81',
    fundo: '#F8FAFC',
    texto: '#0F172A',
    previewBg: '#1E1B4B'
  }
];

export const ConfiguracaoIdentidadeVisual: React.FC<ConfiguracaoIdentidadeVisualProps> = ({
  appSettings,
  onSaveAppSettings
}) => {
  const [form, setForm] = useState<AppSettings>({
    ...appSettings,
    logo_sidebar_url: appSettings.logo_sidebar_url || appSettings.logo_icon_url || '/assets/logo-brasil-legal-oficial.png',
    logo_login_url: appSettings.logo_login_url || appSettings.logo_header_url || '/assets/logo-brasil-legal-oficial.png',
    logo_light_url: appSettings.logo_light_url || '/assets/logo-brasil-legal-oficial.png',
    logo_dark_url: appSettings.logo_dark_url || '/assets/logo-brasil-legal-dark.svg',
    cor_fundo_painel: appSettings.cor_fundo_painel || '#F8FAFC',
    cor_texto_principal: appSettings.cor_texto_principal || '#0F172A'
  });

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      ...appSettings,
      logo_sidebar_url: appSettings.logo_sidebar_url || prev.logo_sidebar_url,
      logo_login_url: appSettings.logo_login_url || prev.logo_login_url,
      logo_light_url: appSettings.logo_light_url || prev.logo_light_url,
      logo_dark_url: appSettings.logo_dark_url || prev.logo_dark_url
    }));
  }, [appSettings]);

  const [activePreviewMode, setActivePreviewMode] = useState<'light' | 'dark'>('light');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>('brasil_legal');

  const handleApplyPreset = (preset: ColorPreset) => {
    setActivePreset(preset.id);
    setForm(prev => ({
      ...prev,
      cor_primaria: preset.primaria,
      cor_secundaria: preset.secundaria,
      cor_destaque: preset.destaque,
      cor_fundo_painel: preset.fundo,
      cor_texto_principal: preset.texto,
      css_customizado_saas: `:root {\n  --primary-saas: ${preset.primaria};\n  --secondary-saas: ${preset.secundaria};\n}`
    }));
  };

  const handleResetDefaults = () => {
    const defaultPreset = COLOR_PRESETS[0];
    setActivePreset('brasil_legal');
    setForm(prev => ({
      ...prev,
      logo_sidebar_url: '/assets/logo-brasil-legal-oficial.png',
      logo_login_url: '/assets/logo-brasil-legal-oficial.png',
      logo_header_url: '/assets/logo-brasil-legal-oficial.png',
      logo_light_url: '/assets/logo-brasil-legal-oficial.png',
      logo_dark_url: '/assets/logo-brasil-legal-dark.svg',
      logo_icon_url: '/assets/logo-icon-brasil-legal.svg',
      favicon_url: '/assets/logo-icon-brasil-legal.svg',
      cor_primaria: defaultPreset.primaria,
      cor_secundaria: defaultPreset.secundaria,
      cor_destaque: defaultPreset.destaque,
      cor_fundo_painel: defaultPreset.fundo,
      cor_texto_principal: defaultPreset.texto
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveAppSettings(form);
      setSuccessMessage('Identidade visual e esquema de cores salvos com sucesso na entidade app_settings!');
      setTimeout(() => setSuccessMessage(''), 4500);
    } catch (err) {
      console.error('Erro ao salvar app_settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#2E3192] text-white text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Identidade Visual & Branding
            </span>
            <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              White-Label Engine
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-2">
            Configuração de Logos (Light / Dark), Favicon e Esquema de Cores
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl">
            Personalize os ativos gráficos da sua operação imobiliária para temas claros e escuros, defina o favicon do navegador e altere a paleta de cores institucional com persistência garantida na entidade <code className="font-mono text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded">app_settings</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#2E3192] bg-slate-100 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Brasil Legal
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: LOGOS E FAVICON */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-5">
            <ImageIcon className="w-5 h-5 text-[#2E3192]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ativos Visuais: Logos Light/Dark, Sidebar, Login & Favicon</h3>
              <p className="text-xs text-slate-500">Defina as imagens otimizadas para contrastar perfeitamente sobre fundos claros, escuros e menus</p>
            </div>
          </div>

          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-amber-50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2E3192] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                <Sparkles className="w-4 h-4 text-[#F2EC00]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Gerenciador Dedicado de Logos do Sistema Ativo!
                </h4>
                <p className="text-[11px] text-slate-600">
                  Você também pode usar a aba exclusiva <strong>"Logos do Sistema"</strong> no topo para gerenciar e visualizar em tempo real os logotipos com persistência definitiva.
                </p>
              </div>
            </div>
          </div>

          {/* NOVOS CAMPOS: LOGO SIDEBAR & LOGO LOGIN */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* LOGO SIDEBAR */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#2E3192]" />
                    Logo do Menu Lateral (Sidebar)
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                    logo_sidebar_url
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Logotipo quadrado exibido no topo do menu lateral fixo da aplicação.
                </p>

                <ImageUploadInput
                  id="input-logo-sidebar-url"
                  label="Logo do Menu Lateral"
                  description="PNG transparente, SVG ou JPG."
                  value={form.logo_sidebar_url || ''}
                  onChange={(val) => setForm({ ...form, logo_sidebar_url: val })}
                  placeholder="/assets/logo-brasil-legal-oficial.png"
                  presets={[
                    { label: 'Brasil Legal Oficial', url: '/assets/logo-brasil-legal-oficial.png' },
                    { label: 'Símbolo Documentos', url: '/assets/logo-icon-brasil-legal.svg' }
                  ]}
                />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 block mb-1">Preview na Sidebar:</span>
                <div className="h-16 rounded-xl bg-[#0F102B] border border-slate-700 flex items-center gap-3 px-3 shadow-inner">
                  <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center border border-[#F2EC00] shrink-0 overflow-hidden">
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
                    <div className="text-xs font-bold text-white uppercase truncate">{form.app_name || 'Brasil Legal'}</div>
                    <div className="text-[9px] text-[#F2EC00] font-bold uppercase tracking-wider">Enterprise</div>
                  </div>
                </div>
              </div>
            </div>

            {/* LOGO LOGIN */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Logo da Tela de Login
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                    logo_login_url
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Logotipo em destaque no cartão de autenticação para usuários e diretores.
                </p>

                <ImageUploadInput
                  id="input-logo-login-url"
                  label="Logo da Tela de Login"
                  description="Imagem de alta resolução para a tela de autenticação."
                  value={form.logo_login_url || ''}
                  onChange={(val) => setForm({ ...form, logo_login_url: val })}
                  placeholder="/assets/logo-brasil-legal-oficial.png"
                  presets={[
                    { label: 'Brasil Legal Oficial', url: '/assets/logo-brasil-legal-oficial.png' },
                    { label: 'Brasil Legal Modo Noturno', url: '/assets/logo-brasil-legal-dark.svg' }
                  ]}
                />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 block mb-1">Preview no Login:</span>
                <div className="h-16 rounded-xl bg-gradient-to-r from-[#0F102B] to-[#1C1E63] border border-slate-700 flex items-center justify-center p-2 shadow-inner">
                  <img
                    src={form.logo_login_url || '/assets/logo-brasil-legal-oficial.png'}
                    alt="Logo Login"
                    className="max-h-12 w-auto object-contain drop-shadow"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src = '/assets/logo-brasil-legal-oficial.png';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LOGO LIGHT (Fundo Claro) */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    Logo Modo Claro (Light Mode)
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                    logo_light_url
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Aplicada sobre fundos claros (brancos, cabeçalho diurno ou impressos de regularização).
                </p>

                <ImageUploadInput
                  id="input-logo-light-url"
                  label="Logo Modo Claro (Upload ou URL)"
                  description="Selecione um arquivo de imagem (PNG/SVG transparente) ou cole a URL externa."
                  value={form.logo_light_url}
                  onChange={(val) => setForm({ ...form, logo_light_url: val })}
                  placeholder="https://... ou faça upload do seu arquivo"
                  presets={[
                    { label: 'Brasil Legal Oficial', url: '/assets/logo-brasil-legal.svg' },
                    { label: 'Brasil Legal Light', url: '/assets/logo-brasil-legal-light.svg' },
                    { label: 'Ícone Símbolo', url: '/assets/logo-icon-brasil-legal.svg' }
                  ]}
                  required
                />
              </div>

              {/* Box Preview Light */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5">Preview em Fundo Claro:</span>
                <div className="h-24 rounded-lg bg-white border border-slate-300 flex items-center justify-center p-3 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2E3192_1px,transparent_1px)] [background-size:12px_12px]" />
                  {form.logo_light_url ? (
                    <div className="relative flex items-center gap-3">
                      <img
                        src={form.logo_light_url}
                        alt="Logo Light Preview"
                        className="max-h-14 max-w-[180px] object-contain"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-10 h-10 rounded-lg bg-[#2E3192] items-center justify-center text-white font-bold text-xs shadow-xs">
                        BL
                      </div>
                      <div>
                        <div className="font-display font-extrabold text-slate-900 text-sm tracking-tight">
                          {form.app_name || 'BRASIL LEGAL'}
                        </div>
                        <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">
                          {form.app_tagline || 'Regularização Imobiliária'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">Nenhuma logo informada</span>
                  )}
                </div>
              </div>
            </div>

            {/* LOGO DARK (Fundo Escuro) */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-indigo-500" />
                    Logo Modo Escuro (Dark Mode / Header Primário)
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                    logo_dark_url
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Aplicada sobre o cabeçalho primário, barra de navegação noturna e telas escuras.
                </p>

                <ImageUploadInput
                  id="input-logo-dark-url"
                  label="Logo Modo Escuro (Upload ou URL)"
                  description="Selecione um arquivo de imagem (PNG/SVG claro com fundo transparente) ou cole a URL."
                  value={form.logo_dark_url}
                  onChange={(val) => setForm({ ...form, logo_dark_url: val })}
                  placeholder="https://... ou faça upload do seu arquivo"
                  presets={[
                    { label: 'Brasil Legal Dark Oficial', url: '/assets/logo-brasil-legal-dark.svg' },
                    { label: 'Brasil Legal Oficial', url: '/assets/logo-brasil-legal.svg' }
                  ]}
                  required
                />
              </div>

              {/* Box Preview Dark */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5">Preview em Fundo Escuro / Primário:</span>
                <div 
                  className="h-24 rounded-lg border flex items-center justify-center p-3 shadow-inner relative overflow-hidden transition-colors"
                  style={{ backgroundColor: form.cor_primaria, borderColor: form.cor_destaque }}
                >
                  <div className="relative flex items-center gap-3">
                    {form.logo_dark_url ? (
                      <img
                        src={form.logo_dark_url}
                        alt="Logo Dark Preview"
                        className="max-h-14 max-w-[180px] object-contain brightness-110"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`${form.logo_dark_url ? 'hidden' : 'flex'} w-10 h-10 rounded-lg bg-white items-center justify-center font-bold text-xs shadow-xs`}
                      style={{ color: form.cor_primaria }}
                    >
                      BL
                    </div>
                    <div>
                      <div className="font-display font-extrabold text-white text-sm tracking-tight flex items-center gap-1.5">
                        {form.app_name || 'BRASIL LEGAL'}
                        <span 
                          className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider"
                          style={{ backgroundColor: form.cor_secundaria, color: form.cor_primaria }}
                        >
                          SaaS
                        </span>
                      </div>
                      <div className="text-[9px] font-medium text-white/80 uppercase tracking-wider">
                        {form.app_tagline || 'Regularização & Gestão de Ativos'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAVICON & ICON COMPACTO */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <ImageUploadInput
                      id="input-favicon-url"
                      label="Favicon do Navegador (Upload ou URL)"
                      description="Exibido na aba do navegador e na lista de favoritos (.ico ou .png 32x32)."
                      value={form.favicon_url}
                      onChange={(val) => setForm({ ...form, favicon_url: val })}
                      placeholder="/assets/logo-icon-brasil-legal.svg"
                      aspectHint="32x32px ou SVG"
                      presets={[
                        { label: 'Ícone Oficial Brasil Legal', url: '/assets/logo-icon-brasil-legal.svg' }
                      ]}
                    />
                  </div>

                  <div>
                    <ImageUploadInput
                      id="input-logo-icon-url"
                      label="Ícone / Símbolo Isolado da Marca (Upload ou URL)"
                      description="Símbolo compacto para avatares, favicon retina e botões recolhidos."
                      value={form.logo_icon_url}
                      onChange={(val) => setForm({ ...form, logo_icon_url: val })}
                      placeholder="/assets/logo-icon-brasil-legal.svg"
                      aspectHint="1:1 Quadrado"
                      presets={[
                        { label: 'Símbolo Oficial BL', url: '/assets/logo-icon-brasil-legal.svg' }
                      ]}
                    />
                  </div>
                </div>

                {/* Simulador de Aba de Navegador */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                    Simulação: Aba do Navegador
                  </span>
                  <div className="bg-slate-200 p-2 rounded-t-lg border border-slate-300 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>

                    <div className="bg-white rounded-t-md px-3 py-1 flex items-center gap-2 text-xs text-slate-800 font-semibold shadow-xs border-t border-x border-slate-300 max-w-xs">
                      {/* Mini Favicon Circle */}
                      <div 
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 border overflow-hidden"
                        style={{ backgroundColor: form.cor_primaria, borderColor: form.cor_secundaria }}
                      >
                        <img src="/assets/logo-icon-brasil-legal.svg" alt="BL" className="w-full h-full object-contain" />
                      </div>
                      <span className="truncate text-[11px]">
                        {form.app_name} | {form.app_tagline}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-2 text-[10px] font-mono text-slate-500 border-x border-b border-slate-300 rounded-b-lg flex items-center justify-between">
                    <span>https://app.brasillegal.com.br/dashboard</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> SSL Seguro
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ESQUEMA DE CORES CORPORATIVO */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-[#2E3192]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Esquema de Cores da Aplicação (Theming)</h3>
                <p className="text-xs text-slate-500">
                  Aplique paletas pré-formatadas ou personalize as matrizes cromáticas hexadecimais
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded">
              app_settings.cor_*
            </span>
          </div>

          {/* PALETAS / PRESETS */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              Paletas Recomendadas & Presets Empresariais
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {COLOR_PRESETS.map(preset => {
                const isSelected = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-[#2E3192] bg-indigo-50/50 ring-2 ring-[#2E3192]/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#2E3192] text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 mb-2">
                      <div 
                        className="w-5 h-5 rounded-md shadow-xs border border-white"
                        style={{ backgroundColor: preset.primaria }}
                      />
                      <div 
                        className="w-5 h-5 rounded-md shadow-xs border border-white"
                        style={{ backgroundColor: preset.secundaria }}
                      />
                      <div 
                        className="w-5 h-5 rounded-md shadow-xs border border-white"
                        style={{ backgroundColor: preset.destaque }}
                      />
                    </div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-1">{preset.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{preset.category}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COLOR PICKERS INDIVIDUAIS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-slate-100">
            {/* Cor Primária */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Cor Primária
              </label>
              <p className="text-[10px] text-slate-500 mb-2">Cabeçalho, botões primários e guias ativas</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="color-primaria"
                  value={form.cor_primaria}
                  onChange={e => {
                    setActivePreset(null);
                    setForm({ ...form, cor_primaria: e.target.value });
                  }}
                  className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={form.cor_primaria}
                  onChange={e => {
                    setActivePreset(null);
                    setForm({ ...form, cor_primaria: e.target.value });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-md border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Cor Secundária */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Cor Secundária (Acento)
              </label>
              <p className="text-[10px] text-slate-500 mb-2">Borda inferior do cabeçalho e badges</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="color-secundaria"
                  value={form.cor_secundaria}
                  onChange={e => {
                    setActivePreset(null);
                    setForm({ ...form, cor_secundaria: e.target.value });
                  }}
                  className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={form.cor_secundaria}
                  onChange={e => {
                    setActivePreset(null);
                    setForm({ ...form, cor_secundaria: e.target.value });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-md border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Cor Destaque */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Cor de Destaque
              </label>
              <p className="text-[10px] text-slate-500 mb-2">Hovers, bordas ativas e estados de foco</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="color-destaque"
                  value={form.cor_destaque}
                  onChange={e => {
                    setActivePreset(null);
                    setForm({ ...form, cor_destaque: e.target.value });
                  }}
                  className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={form.cor_destaque}
                  onChange={e => {
                    setActivePreset(null);
                    setForm({ ...form, cor_destaque: e.target.value });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-md border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Cor Fundo Painel */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Fundo do Painel
              </label>
              <p className="text-[10px] text-slate-500 mb-2">Background de fundo das telas do SaaS</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="color-fundo"
                  value={form.cor_fundo_painel || '#F8FAFC'}
                  onChange={e => {
                    setActivePreset(null);
                    setForm({ ...form, cor_fundo_painel: e.target.value });
                  }}
                  className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={form.cor_fundo_painel || '#F8FAFC'}
                  onChange={e => {
                    setActivePreset(null);
                    setForm({ ...form, cor_fundo_painel: e.target.value });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-md border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Cor Texto Principal */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Texto Principal
              </label>
              <p className="text-[10px] text-slate-500 mb-2">Cor tipográfica dos títulos e elementos</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="color-texto"
                  value={form.cor_texto_principal || '#0F172A'}
                  onChange={e => {
                    setActivePreset(null);
                    setForm({ ...form, cor_texto_principal: e.target.value });
                  }}
                  className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={form.cor_texto_principal || '#0F172A'}
                  onChange={e => {
                    setActivePreset(null);
                    setForm({ ...form, cor_texto_principal: e.target.value });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded-md border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: TIPOGRAFIA & FONTES DO SITE */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-[#2E3192]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tipografia & Fontes do Site e Plataforma</h3>
                <p className="text-xs text-slate-500">
                  Defina as famílias tipográficas utilizadas nos títulos de alto impacto e no corpo de texto
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded">
              app_settings.fonte_*
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fonte dos Títulos */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Fonte para Títulos (Headings / H1-H3)
              </label>
              <select
                value={form.fonte_titulo || 'Plus Jakarta Sans'}
                onChange={(e) => setForm({ ...form, fonte_titulo: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-[#2E3192] cursor-pointer"
              >
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Moderna, Elegante & Corporativa)</option>
                <option value="Montserrat">Montserrat (Geométrica, Forte & Impactante)</option>
                <option value="Outfit">Outfit (Tecnológica & Minimalista)</option>
                <option value="Playfair Display">Playfair Display (Serifada, Jurídica & Tradicional)</option>
                <option value="Poppins">Poppins (Arredondada & Amigável)</option>
                <option value="Inter">Inter (Ultra Legível & Neutra)</option>
              </select>

              {/* Preview Box Título */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Prévia do Título</span>
                <div 
                  className="text-lg font-extrabold text-slate-900 leading-tight"
                  style={{ fontFamily: form.fonte_titulo || 'Plus Jakarta Sans' }}
                >
                  Regularização Imobiliária com Escritura Definitiva
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Fonte selecionada: <strong className="text-[#2E3192]">{form.fonte_titulo || 'Plus Jakarta Sans'}</strong>
                </p>
              </div>
            </div>

            {/* Fonte do Corpo de Texto */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Fonte para Corpo de Texto (Parágrafos & UI)
              </label>
              <select
                value={form.fonte_corpo || 'Inter'}
                onChange={(e) => setForm({ ...form, fonte_corpo: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-[#2E3192] cursor-pointer"
              >
                <option value="Inter">Inter (Padrão de Ouro para UI & Sistemas)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Harmonia com Títulos)</option>
                <option value="DM Sans">DM Sans (Clean & Moderna)</option>
                <option value="Open Sans">Open Sans (Alta Acessibilidade & Contraste)</option>
                <option value="Roboto">Roboto (Clássica do Google)</option>
              </select>

              {/* Preview Box Corpo */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <span className="text-[10px] text-slate-400 font-mono uppercase block mb-1">Prévia do Corpo</span>
                <p 
                  className="text-xs text-slate-700 leading-relaxed"
                  style={{ fontFamily: form.fonte_corpo || 'Inter' }}
                >
                  A segurança jurídica do seu patrimônio depende de um processo notarial célere. Nosso time de especialistas analisa certidões, contratos e plantas com total conformidade ao Provimento 65 do CNJ.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Fonte selecionada: <strong className="text-[#2E3192]">{form.fonte_corpo || 'Inter'}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: URLs DOS VÍDEOS INSTITUCIONAIS & APRESENTAÇÃO */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-[#2E3192]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Mídia Institucional & URLs de Vídeos</h3>
                <p className="text-xs text-slate-500">
                  Configure os links de vídeo de apresentação, vendas e depoimentos exibidos no site e portais
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded">
              app_settings.video_*
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vídeo 1: Apresentação Institucional / Vendas */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>URL do Vídeo Principal de Apresentação (Pitch / Vendas)</span>
                <span className="text-[10px] text-slate-400 font-mono lowercase">YouTube, Vimeo ou MP4</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.video_url_apresentacao || ''}
                  onChange={(e) => setForm({ ...form, video_url_apresentacao: e.target.value })}
                  placeholder="Ex: https://www.youtube.com/embed/dQw4w9WgXcQ ou link direto .mp4"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                />
              </div>

              {/* Player Preview */}
              {form.video_url_apresentacao ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-black flex items-center justify-center relative shadow-xs">
                  {form.video_url_apresentacao.includes('youtube.com') || form.video_url_apresentacao.includes('youtu.be') ? (
                    <iframe
                      src={form.video_url_apresentacao.includes('embed') ? form.video_url_apresentacao : `https://www.youtube-nocookie.com/embed/${form.video_url_apresentacao.split('v=')[1]?.split('&')[0] || ''}`}
                      title="Vídeo de Apresentação"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={form.video_url_apresentacao}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-slate-400 bg-slate-50/50">
                  <Play className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="text-xs">Insira a URL do vídeo de apresentação para habilitar a pré-visualização</p>
                </div>
              )}
            </div>

            {/* Vídeo 2: Depoimento / Caso de Sucesso */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>URL do Vídeo de Depoimento / Caso de Sucesso</span>
                <span className="text-[10px] text-slate-400 font-mono lowercase">Casos Reais</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.video_depoimento_url || ''}
                  onChange={(e) => setForm({ ...form, video_depoimento_url: e.target.value })}
                  placeholder="Ex: https://www.youtube.com/embed/... ou link direto .mp4"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                />
              </div>

              {/* Player Preview Depoimento */}
              {form.video_depoimento_url ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-black flex items-center justify-center relative shadow-xs">
                  {form.video_depoimento_url.includes('youtube.com') || form.video_depoimento_url.includes('youtu.be') ? (
                    <iframe
                      src={form.video_depoimento_url.includes('embed') ? form.video_depoimento_url : `https://www.youtube-nocookie.com/embed/${form.video_depoimento_url.split('v=')[1]?.split('&')[0] || ''}`}
                      title="Vídeo de Depoimento"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={form.video_depoimento_url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-slate-400 bg-slate-50/50">
                  <Play className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="text-xs">Insira a URL de depoimento em vídeo para pré-visualização</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 5: SIMULADOR AO VIVO (LIVE PREVIEW INTERATIVO) */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-5 gap-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Live Preview Interativo da Aplicação</h3>
                <p className="text-xs text-slate-500">Veja exatamente como os colaboradores e clientes verão o sistema</p>
              </div>
            </div>

            {/* Toggle Light / Dark Mode Preview */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setActivePreviewMode('light')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
                  activePreviewMode === 'light'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                Light Preview
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewMode('dark')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
                  activePreviewMode === 'dark'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                Dark Preview
              </button>
            </div>
          </div>

          {/* SIMULADOR CONTAINER COM MENU LATERAL */}
          <div className="border border-slate-300 rounded-xl overflow-hidden shadow-md flex flex-col md:flex-row min-h-[280px]">
            {/* Mini Sidebar Lateral Mockup */}
            <div 
              className="w-full md:w-60 p-3 text-white flex flex-col justify-between shrink-0 transition-colors duration-200 border-r border-slate-700"
              style={{ 
                backgroundColor: activePreviewMode === 'dark' ? '#0F172A' : (form.cor_destaque || '#1C1E63')
              }}
            >
              <div>
                {/* Brand Header */}
                <div 
                  className="p-2.5 rounded-lg flex items-center gap-2 mb-3 shadow-xs"
                  style={{ backgroundColor: form.cor_primaria }}
                >
                  <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center shrink-0">
                    <span className="font-extrabold text-xs" style={{ color: form.cor_primaria }}>BL</span>
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-display font-bold text-xs tracking-tight text-white uppercase truncate">
                      {form.app_name}
                    </div>
                    <div className="text-[9px] text-white/70 truncate">{form.app_tagline}</div>
                  </div>
                </div>

                {/* Nav Items */}
                <div className="space-y-1 text-xs">
                  <div 
                    className="px-2.5 py-1.5 rounded-md font-bold flex items-center justify-between shadow-xs"
                    style={{ backgroundColor: form.cor_primaria }}
                  >
                    <span>Funil Comercial</span>
                    <span 
                      className="text-[8px] font-black px-1 py-0.2 rounded uppercase"
                      style={{ backgroundColor: form.cor_secundaria, color: form.cor_primaria }}
                    >
                      &lt; 4m
                    </span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-md text-white/75 hover:bg-white/5 flex items-center justify-between">
                    <span>CRM Técnico</span>
                    <span className="text-[8px] text-white/50">CNJ 65</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-md text-white/75 hover:bg-white/5 flex items-center justify-between">
                    <span>Financeiro B2B</span>
                    <span className="text-[8px] text-white/50">5%</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-md text-white/75 hover:bg-white/5 flex items-center justify-between">
                    <span>Painel White-Label</span>
                    <span className="text-[8px] text-white/50">SaaS</span>
                  </div>
                </div>
              </div>

              {/* Mini SLA Box in Sidebar */}
              <div className="mt-3 p-2 rounded-lg bg-white/5 border border-white/10 text-[10px]">
                <div className="flex items-center justify-between text-white/80">
                  <span>SLA 1º Atendimento:</span>
                  <span className="font-bold text-emerald-400">&lt; {form.sla_meta_minutos}m</span>
                </div>
              </div>
            </div>

            {/* Content Area Mockup */}
            <div 
              className="flex-1 p-5 transition-colors duration-200 flex flex-col justify-between"
              style={{ 
                backgroundColor: activePreviewMode === 'dark' ? '#1E293B' : (form.cor_fundo_painel || '#F8FAFC'),
                color: activePreviewMode === 'dark' ? '#F8FAFC' : (form.cor_texto_principal || '#0F172A')
              }}
            >
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/40">
                  <div>
                    <h4 className="font-bold text-sm">Processo #48.219 — Usucapião Extrajudicial Cartório Campinas</h4>
                    <p className="text-xs opacity-75">{form.razao_social} • CNPJ: {form.cnpj_empresa}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs"
                      style={{ backgroundColor: form.cor_primaria }}
                    >
                      Validar Matrícula (Custódia)
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border"
                      style={{ 
                        borderColor: form.cor_secundaria,
                        backgroundColor: activePreviewMode === 'dark' ? '#334155' : '#FFFFFF',
                        color: activePreviewMode === 'dark' ? '#F2EC00' : form.cor_primaria
                      }}
                    >
                      Parecer Prov. 65 CNJ
                    </button>
                  </div>
                </div>

                {/* Status Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  <div className="p-3 rounded-lg border border-slate-200/50 bg-white/70 shadow-xs text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500">SLA 1º Atendimento</span>
                    <div className="font-bold text-sm mt-0.5" style={{ color: form.cor_primaria }}>
                      &lt; {form.sla_meta_minutos} minutos
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200/50 bg-white/70 shadow-xs text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Comissão B2B (Indique & Ganhe)</span>
                    <div className="font-bold text-sm mt-0.5 text-emerald-700">
                      Até 5.0% Homologado
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200/50 bg-white/70 shadow-xs text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Suporte Institucional</span>
                    <div className="font-bold text-sm mt-0.5 text-slate-800">
                      {form.whatsapp_suporte}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SAVE BUTTON */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Info className="w-4 h-4 text-[#2E3192]" />
            <span>
              Ao salvar, as alterações são gravadas na entidade <strong className="text-[#2E3192]">app_settings</strong> e propagadas em todo o ecossistema.
            </span>
          </div>

          <button
            type="submit"
            id="btn-save-identidade-visual"
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#2E3192] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-opacity-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Salvando na entidade app_settings...' : 'Salvar Identidade Visual (app_settings)'}
          </button>
        </div>
      </form>
    </div>
  );
};
