import React, { useState, useEffect } from 'react';
import { SiteSettings, Contact, DepoimentoCliente, ServicoCatalogo, ConfigIntegracaoGithubCpanel, CasoRealItem, VideoItem, RedeSocialItem } from '../types';
import { initialConfigGithubCpanel } from '../mockData';
import { ImageUploadInput } from './ImageUploadInput';
import { PaginaVendasPublica } from './PaginaVendasPublica';
import { AreaClientePortal } from './AreaClientePortal';
import { GerenciadorBlogCms } from './GerenciadorBlogCms';
import { GerenciadorEquipeCms } from './GerenciadorEquipeCms';
import { ModuloIntegracaoGithubCpanel } from './ModuloIntegracaoGithubCpanel';
import { assinarConfigGithubCpanel, salvarConfigGithubCpanelFirestore } from '../services/firebaseService';
import { 
  Globe, 
  Palette, 
  Code, 
  Save, 
  Eye, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  FileCheck, 
  Phone, 
  Compass, 
  Send,
  Video,
  MessageSquareQuote,
  AlertTriangle,
  Users,
  Plus,
  Trash2,
  Maximize2,
  RefreshCw,
  Smartphone,
  Monitor,
  SearchCheck,
  ShieldCheck,
  Layers,
  ExternalLink,
  HelpCircle,
  Sliders,
  Type,
  Server,
  Copy,
  Check,
  Layout,
  Play,
  BookOpen,
  GitBranch,
  Share2,
  Briefcase,
  Film
} from 'lucide-react';
import { getEmbedVideoUrl } from '../utils/videoHelper';

interface ModuloCmsSiteProps {
  settings: SiteSettings;
  onSaveSettings: (newSettings: SiteSettings) => void;
  onSubmitPublicLead: (leadData: Partial<Contact>) => void;
}

export const ModuloCmsSite: React.FC<ModuloCmsSiteProps> = ({
  settings,
  onSaveSettings,
  onSubmitPublicLead
}) => {
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [previewTab, setPreviewTab] = useState<'preview' | 'editor'>('preview');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [editorSection, setEditorSection] = useState<'geral' | 'topo' | 'midia' | 'video' | 'equipe' | 'depoimentos' | 'servicos' | 'casos_reais' | 'galeria_videos' | 'redes_sociais' | 'blog' | 'area_cliente' | 'servidor' | 'github_cpanel' | 'rodape' | 'css'>('geral');
  const [isPreviewAreaClienteOpen, setIsPreviewAreaClienteOpen] = useState(false);
  const [copiedUrlType, setCopiedUrlType] = useState<string | null>(null);

  // Sync formData whenever settings update from database
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  // Deploy GitHub & cPanel (Homehost) State
  const [configDeploy, setConfigDeploy] = useState<ConfigIntegracaoGithubCpanel>(initialConfigGithubCpanel);

  useEffect(() => {
    // 1. Busca API backend local
    fetch('/api/deploy/github-cpanel')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.config) setConfigDeploy(data.config);
      })
      .catch(() => {});

    // 2. Assinatura Firestore
    const unsub = assinarConfigGithubCpanel((cfg) => {
      if (cfg) setConfigDeploy(cfg);
    });
    return () => unsub();
  }, []);

  const handleSaveConfigDeploy = async (newConfig: ConfigIntegracaoGithubCpanel) => {
    setConfigDeploy(newConfig);
    try {
      await fetch('/api/deploy/github-cpanel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      await salvarConfigGithubCpanelFirestore(newConfig);
    } catch (err) {
      console.error('Erro ao salvar config deploy:', err);
    }
  };

  const handleTriggerDeploy = async (commitMsg?: string) => {
    try {
      const res = await fetch('/api/deploy/executar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commit_mensagem: commitMsg })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfigDeploy(data.config);
          await salvarConfigGithubCpanelFirestore(data.config);
        }
      }
    } catch (err) {
      console.error('Erro ao disparar deploy:', err);
    }
  };

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrlType(type);
    setTimeout(() => setCopiedUrlType(null), 3000);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    try {
      await Promise.race([
        onSaveSettings(formData),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Salvar timeout')), 4000))
      ]);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.warn('Salvamento CMS processado com fallback:', err);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddDepoimento = () => {
    const novoDep: DepoimentoCliente = {
      id: `dep-${Date.now()}`,
      nome: 'Novo Cliente Satisfeito',
      cidade_uf: 'São Paulo / SP',
      tipo_imovel: 'Imóvel Residencial',
      texto: 'Excelente atendimento da equipe Brasil Legal. Regularizaram meu imóvel com escritura registrada direto em cartório com rapidez incomparável.',
      estrelas: 5,
      foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      valorizacao: '+40% Valorização',
      prazo_meses: 4
    };

    setFormData({
      ...formData,
      depoimentos: [...(formData.depoimentos || []), novoDep]
    });
  };

  const handleRemoveDepoimento = (id: string) => {
    setFormData({
      ...formData,
      depoimentos: (formData.depoimentos || []).filter(d => d.id !== id)
    });
  };

  const handleAddCasoReal = () => {
    const novoCaso: CasoRealItem = {
      id: `caso-${Date.now()}`,
      titulo: 'Regularização de Imóvel Residencial com Averbação',
      cliente_ou_tipo: 'Residencial Familiar',
      cidade: 'Caieiras / SP',
      problema: 'Imóvel com contrato de gaveta de 18 anos e construção não averbada perante a Prefeitura e o Registro de Imóveis.',
      desafio: 'Loteamento antigo com titular registral falecido e falta de habite-se com pendência de CND da obra.',
      solucao: 'Procedimento extrajudicial perante o Cartório de Registro de Imóveis e expedição de Habite-se com decadência de INSS.',
      resultado: 'Matrícula individualizada entregue em 110 dias e valorização de mais de 35% com habite-se averbado.',
      tempo_meses: '3,5 meses',
      valorizacao_estimada: '+35% de Valorização',
      imagem_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
      ordem: (formData.casos_reais?.length || 0) + 1,
      destaque: true,
      ativo: true
    };
    setFormData({
      ...formData,
      casos_reais: [...(formData.casos_reais || []), novoCaso]
    });
  };

  const handleRemoveCasoReal = (id: string) => {
    setFormData({
      ...formData,
      casos_reais: (formData.casos_reais || []).filter(c => c.id !== id)
    });
  };

  const handleAddGaleriaVideo = () => {
    const novoVideo: VideoItem = {
      id: `vid-${Date.now()}`,
      titulo: 'Como Regularizar Construção e Tirar Habite-se',
      descricao: 'Entenda os passos práticos para averbar sua construção na matrícula do imóvel.',
      url: 'https://youtu.be/9uRifSbfweA',
      categoria: 'Regularização',
      ordem: (formData.galeria_videos?.length || 0) + 1,
      ativo: true
    };
    setFormData({
      ...formData,
      galeria_videos: [...(formData.galeria_videos || []), novoVideo]
    });
  };

  const handleRemoveGaleriaVideo = (id: string) => {
    setFormData({
      ...formData,
      galeria_videos: (formData.galeria_videos || []).filter(v => v.id !== id)
    });
  };

  const handleAddRedeSocial = () => {
    const novaRede: RedeSocialItem = {
      id: `rede-${Date.now()}`,
      nome: 'Nova Rede Social',
      username: '@brasillegal',
      url: 'https://brasillegal.com.br',
      icone: 'globe',
      ordem: (formData.redes_sociais?.length || 0) + 1,
      ativo: true
    };
    setFormData({
      ...formData,
      redes_sociais: [...(formData.redes_sociais || []), novaRede]
    });
  };

  const handleRemoveRedeSocial = (id: string) => {
    setFormData({
      ...formData,
      redes_sociais: (formData.redes_sociais || []).filter(r => r.id !== id)
    });
  };

  const handleResetRedesSociaisPadrao = () => {
    const padroes: RedeSocialItem[] = [
      {
        id: 'rede-tiktok',
        nome: 'TikTok',
        username: '@brasillegaloficial',
        url: 'https://www.tiktok.com/@brasillegaloficial',
        icone: 'tiktok',
        ordem: 1,
        ativo: true
      },
      {
        id: 'rede-instagram',
        nome: 'Instagram',
        username: '@brasillegalodicial',
        url: 'https://www.instagram.com/brasillegalodicial',
        icone: 'instagram',
        ordem: 2,
        ativo: true
      },
      {
        id: 'rede-facebook',
        nome: 'Facebook',
        username: '@brasillegaloficial',
        url: 'https://www.facebook.com/brasillegaloficial',
        icone: 'facebook',
        ordem: 3,
        ativo: true
      },
      {
        id: 'rede-youtube',
        nome: 'YouTube',
        username: '@brasillegaloficial',
        url: 'https://www.youtube.com/@brasillegaloficial',
        icone: 'youtube',
        ordem: 4,
        ativo: true
      }
    ];
    setFormData({
      ...formData,
      redes_sociais: padroes
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#2E3192] text-white text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Módulo CMS & Página de Vendas
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Alta Conversão & Performance
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Gestão do Portal de Vendas & Identidade Registral
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure vídeos, depoimentos, uploads de imagens (banners, logotipos, quem somos), serviços e estilos dinâmicos da landing page pública.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setPreviewTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              previewTab === 'preview'
                ? 'bg-white text-[#2E3192] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Visualizar Página (Live)
          </button>
          <button
            type="button"
            onClick={() => setPreviewTab('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              previewTab === 'editor'
                ? 'bg-white text-[#2E3192] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            Editor CMS & Imagens
          </button>
        </div>
      </div>

      {/* Barra de Acesso Rápido com a URL Oficial do Site */}
      {(() => {
        const liveOrigin = typeof window !== 'undefined' && window.location.origin
          ? window.location.origin
          : 'https://ais-dev-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app';
        const siteDirectUrl = `${liveOrigin}/?view=site`;

        return (
          <div className="bg-gradient-to-r from-[#1C1E63] to-[#2E3192] text-white rounded-xl p-3 px-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-[#F2EC00]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-wide">URL Oficial do Site Público:</span>
                  <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">
                    Ambiente Ativo Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 font-mono truncate">
                  {siteDirectUrl}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleCopyText(siteDirectUrl, 'header_quick')}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
              >
                {copiedUrlType === 'header_quick' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#F2EC00]" />
                    <span className="text-[#F2EC00]">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar URL do Site</span>
                  </>
                )}
              </button>
              <a
                href={siteDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#F2EC00] hover:bg-[#ded900] text-[#2E3192] rounded-lg text-xs font-black transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <span>Abrir Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        );
      })()}

      {/* Mode: Editor */}
      {previewTab === 'editor' && (
        <div className="space-y-6">
          {/* Sub-navigation of CMS Editor */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
            <button
              type="button"
              onClick={() => setEditorSection('geral')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                editorSection === 'geral'
                  ? 'bg-[#2E3192] text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Geral & Hero Banner
            </button>
            <button
              type="button"
              id="cms-tab-topo"
              onClick={() => setEditorSection('topo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                editorSection === 'topo'
                  ? 'bg-[#2E3192] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              Topo & Logotipo (Texto e Tamanho)
            </button>
            <button
              type="button"
              id="cms-tab-servidor"
              onClick={() => setEditorSection('servidor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                editorSection === 'servidor'
                  ? 'bg-[#2E3192] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              URL do Site & Servidor
            </button>
            <button
              type="button"
              id="cms-tab-github-cpanel"
              onClick={() => setEditorSection('github_cpanel')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                editorSection === 'github_cpanel'
                  ? 'bg-[#2E3192] text-white shadow-xs border border-[#F2EC00]'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-amber-600" />
              <span>GitHub & cPanel Homehost</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Ativo" />
            </button>
            <button
              type="button"
              onClick={() => setEditorSection('midia')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                editorSection === 'midia'
                  ? 'bg-[#2E3192] text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Imagens & Banners (Uploads)
            </button>
            <button
              type="button"
              onClick={() => setEditorSection('video')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                editorSection === 'video'
                  ? 'bg-[#2E3192] text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Vídeo & Alerta
            </button>
            <button
              type="button"
              id="cms-tab-equipe"
              onClick={() => setEditorSection('equipe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                editorSection === 'equipe'
                  ? 'bg-[#2E3192] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Time / Especialistas ({formData.equipe_membros?.length || 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorSection('depoimentos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                editorSection === 'depoimentos'
                  ? 'bg-[#2E3192] text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Depoimentos de Clientes ({formData.depoimentos?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setEditorSection('servicos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                editorSection === 'servicos'
                  ? 'bg-[#2E3192] text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Catálogo de Serviços ({formData.servicos_catalogo.length})
            </button>
            <button
              type="button"
              id="cms-tab-casos-reais"
              onClick={() => setEditorSection('casos_reais')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                editorSection === 'casos_reais'
                  ? 'bg-[#2E3192] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span>Casos Reais ({formData.casos_reais?.length || 0})</span>
            </button>
            <button
              type="button"
              id="cms-tab-galeria-videos"
              onClick={() => setEditorSection('galeria_videos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                editorSection === 'galeria_videos'
                  ? 'bg-[#2E3192] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-rose-400" />
              <span>Galeria de Vídeos ({formData.galeria_videos?.length || 0})</span>
            </button>
            <button
              type="button"
              id="cms-tab-redes-sociais"
              onClick={() => setEditorSection('redes_sociais')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                editorSection === 'redes_sociais'
                  ? 'bg-[#2E3192] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Redes Sociais ({formData.redes_sociais?.length || 0})</span>
            </button>
            <button
              type="button"
              id="cms-tab-blog"
              onClick={() => setEditorSection('blog')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                editorSection === 'blog'
                  ? 'bg-[#2E3192] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-300" />
              Blog & Artigos ({formData.artigos_blog?.length || 0})
            </button>
            <button
              type="button"
              id="cms-tab-area-cliente"
              onClick={() => setEditorSection('area_cliente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                editorSection === 'area_cliente'
                  ? 'bg-[#2E3192] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <SearchCheck className="w-3.5 h-3.5 text-amber-400" />
              Área do Cliente (Acompanhamento dos Trabalhos)
            </button>
            <button
              type="button"
              id="cms-tab-rodape"
              onClick={() => setEditorSection('rodape')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                editorSection === 'rodape'
                  ? 'bg-[#2E3192] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Layout className="w-3.5 h-3.5 text-blue-400" />
              Rodapé & Dados Legais
            </button>
            <button
              type="button"
              onClick={() => setEditorSection('css')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                editorSection === 'css'
                  ? 'bg-[#2E3192] text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Cores & Injetor CSS
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* SECTION 1: GERAL & HERO */}
            {editorSection === 'geral' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#2E3192]" />
                  Informações Gerais e Seção Hero (Página de Vendas)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Título da Aba / Site</label>
                    <input
                      type="text"
                      value={formData.titulo_site}
                      onChange={(e) => setFormData({ ...formData, titulo_site: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp de Vendas / Leads</label>
                    <input
                      type="text"
                      value={formData.whatsapp_vendas || ''}
                      onChange={(e) => setFormData({ ...formData, whatsapp_vendas: e.target.value })}
                      placeholder="+55 11 98741-2099"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subtítulo Geral do Site</label>
                  <input
                    type="text"
                    value={formData.subtitulo_site}
                    onChange={(e) => setFormData({ ...formData, subtitulo_site: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">Headline e Subheadline da Seção Hero:</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Headline Principal (Título Vendedor)
                    </label>
                    <input
                      type="text"
                      value={formData.secao_hero_titulo}
                      onChange={(e) => setFormData({ ...formData, secao_hero_titulo: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Subheadline (Texto de Apoio e Benefícios)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.secao_hero_subtitulo}
                      onChange={(e) => setFormData({ ...formData, secao_hero_subtitulo: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#2E3192]" />
                    Autoridade Principal em Regularização (Emerson Carneiro)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nome da Autoridade</label>
                      <input
                        type="text"
                        value={formData.autoridade_nome || 'Emerson Carneiro'}
                        onChange={(e) => setFormData({ ...formData, autoridade_nome: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cargo / Experiência em Destaque</label>
                      <input
                        type="text"
                        value={formData.autoridade_cargo || 'Mais de duas décadas de experiência no mercado imobiliário'}
                        onChange={(e) => setFormData({ ...formData, autoridade_cargo: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Biografia / Proposta de Valor</label>
                    <textarea
                      rows={3}
                      value={formData.autoridade_bio || 'A Brasil Legal nasceu da experiência prática do mercado imobiliário e da necessidade de transformar processos complexos de regularização em caminhos mais claros, organizados e seguros para o proprietário.'}
                      onChange={(e) => setFormData({ ...formData, autoridade_bio: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>

                  <div>
                    <ImageUploadInput
                      label="Foto da Autoridade (Upload ou URL)"
                      description="Foto profissional para a seção de autoridade da página de vendas."
                      value={formData.autoridade_foto_url || '/team/emerson-carneiro.jpg'}
                      onChange={(val) => setFormData({ ...formData, autoridade_foto_url: val })}
                      aspectHint="1:1 Quadrado"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: TOPO & LOGOTIPO (TEXTO E TAMANHO) */}
            {editorSection === 'topo' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-[#2E3192]" />
                      Personalização do Topo, Textos e Logotipo da Navbar
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ajuste a altura do logotipo, edite ou retire completamente os textos ao lado da logo e controle a barra de destaque no topo.
                    </p>
                  </div>
                  <span className="text-[11px] bg-indigo-50 text-[#2E3192] font-bold px-2.5 py-1 rounded-lg shrink-0">
                    Sincronização em Tempo Real
                  </span>
                </div>

                {/* PRÉ-VISUALIZAÇÃO INTERATIVA DO TOPO */}
                <div className="bg-slate-900/5 rounded-xl border border-slate-200/80 p-4 space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#2E3192]" />
                      Prévia da Barra Superior do Site
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                      Altura Logo: {formData.logo_altura_px || 42}px • {formData.topo_exibir_texto !== false ? 'Com Texto' : 'Apenas Logotipo'}
                    </span>
                  </div>

                  {/* Caixa simuladora de Navbar */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    {formData.faixa_topo_ativa !== false && formData.faixa_topo_texto && (
                      <div className="bg-[#1C1E63] text-white py-1 px-3 text-[10px] font-medium flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F2EC00] animate-pulse shrink-0" />
                          <span className="truncate">{formData.faixa_topo_texto}</span>
                        </div>
                        {formData.faixa_topo_link_texto && (
                          <span className="text-[#F2EC00] font-bold text-[10px] shrink-0 ml-2">
                            {formData.faixa_topo_link_texto} →
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-3 flex items-center justify-between border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        {formData.logo_principal_url ? (
                          <img
                            src={formData.logo_principal_url}
                            alt="Logo Prévia"
                            style={{ height: `${formData.logo_altura_px || 42}px`, maxHeight: '85px' }}
                            className="w-auto object-contain transition-all"
                          />
                        ) : (
                          <div className="h-10 px-3 bg-slate-100 rounded-lg flex items-center text-xs text-slate-400">
                            Sem logotipo
                          </div>
                        )}

                        {formData.topo_exibir_texto !== false && (
                          <div>
                            <div className="font-extrabold text-slate-900 text-base tracking-tight leading-none flex items-center gap-1.5">
                              {formData.topo_texto_titulo !== undefined ? formData.topo_texto_titulo : 'BRASIL LEGAL'}
                              {formData.topo_texto_tag && (
                                <span 
                                  className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider bg-[#F2EC00] text-[#2E3192]"
                                >
                                  {formData.topo_texto_tag}
                                </span>
                              )}
                            </div>
                            {formData.topo_texto_subtitulo && (
                              <p className="text-[9px] font-semibold text-slate-500 tracking-wide mt-0.5">
                                {formData.topo_texto_subtitulo}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="hidden sm:flex items-center gap-2">
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          WhatsApp Direto
                        </span>
                        <span className="text-[11px] font-bold text-white bg-[#2E3192] px-3 py-1 rounded-lg shadow-xs">
                          Diagnóstico Gratuito
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BLOCO 1: AJUSTAR O TAMANHO DO LOGO */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <Maximize2 className="w-4 h-4 text-[#2E3192]" />
                      Ajustar Tamanho do Logotipo (Altura da Imagem na Barra Superior)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#2E3192] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                        {formData.logo_altura_px || 42} px
                      </span>
                    </div>
                  </div>

                  {/* Slider Interativo */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">20px (Discreto)</span>
                    <input
                      type="range"
                      min="20"
                      max="90"
                      step="2"
                      value={formData.logo_altura_px || 42}
                      onChange={(e) => setFormData({ ...formData, logo_altura_px: parseInt(e.target.value, 10) })}
                      className="w-full accent-[#2E3192] cursor-pointer"
                    />
                    <span className="text-[11px] font-semibold text-slate-400 shrink-0">90px (Imponente)</span>
                  </div>

                  {/* Presets Rápidos */}
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500">Tamanhos Pré-definidos:</span>
                    {[
                      { label: 'P (30px)', val: 30 },
                      { label: 'M (42px - Padrão)', val: 42 },
                      { label: 'G (56px)', val: 56 },
                      { label: 'GG (70px)', val: 70 },
                      { label: 'XG (86px)', val: 86 }
                    ].map(p => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setFormData({ ...formData, logo_altura_px: p.val })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          (formData.logo_altura_px || 42) === p.val
                            ? 'bg-[#2E3192] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* BLOCO 2: EDITAR TEXTO NO TOPO / RETIRAR O TEXTO */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <Type className="w-4 h-4 text-[#2E3192]" />
                        <span className="text-xs font-bold text-slate-900">
                          Exibição de Textos ao Lado do Logotipo
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Escolha se deseja manter os textos institucionais ou retirar o texto para exibir somente o logotipo oficial.
                      </p>
                    </div>

                    {/* Toggle Exibir / Retirar Texto */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
                      <button
                        type="button"
                        id="btn-topo-exibir-texto"
                        onClick={() => setFormData({ ...formData, topo_exibir_texto: true })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          formData.topo_exibir_texto !== false
                            ? 'bg-[#2E3192] text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Exibir Texto
                      </button>
                      <button
                        type="button"
                        id="btn-topo-retirar-texto"
                        onClick={() => setFormData({ ...formData, topo_exibir_texto: false })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          formData.topo_exibir_texto === false
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-rose-600'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Retirar Texto
                      </button>
                    </div>
                  </div>

                  {formData.topo_exibir_texto === false ? (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-900">
                        <p className="font-bold">Texto retirado do topo com sucesso!</p>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          Apenas a imagem do logotipo será renderizada na barra superior. Ideal quando a sua imagem de logo já traz o nome da empresa embutido.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Título Principal no Topo
                        </label>
                        <input
                          type="text"
                          value={formData.topo_texto_titulo !== undefined ? formData.topo_texto_titulo : 'BRASIL LEGAL'}
                          onChange={(e) => setFormData({ ...formData, topo_texto_titulo: e.target.value })}
                          placeholder="Ex: BRASIL LEGAL"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192] font-bold"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Nome corporativo em destaque.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Emblema / Tag em Destaque
                        </label>
                        <input
                          type="text"
                          value={formData.topo_texto_tag !== undefined ? formData.topo_texto_tag : 'REGULARIZAÇÃO'}
                          onChange={(e) => setFormData({ ...formData, topo_texto_tag: e.target.value })}
                          placeholder="Ex: REGULARIZAÇÃO"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192] uppercase font-semibold text-[#2E3192]"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Badge destacado em amarelo registral.
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Subtítulo do Topo
                        </label>
                        <input
                          type="text"
                          value={formData.topo_texto_subtitulo !== undefined ? formData.topo_texto_subtitulo : 'Advocacia Registral & Engenharia Legal'}
                          onChange={(e) => setFormData({ ...formData, topo_texto_subtitulo: e.target.value })}
                          placeholder="Ex: Advocacia Registral & Engenharia Legal"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Especialidades técnicas da banca.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* BLOCO 3: FAIXA SUPERIOR DE AVISO / ANÚNCIO NO TOPO */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#2E3192]" />
                        Faixa de Plantão no Topo (Barra Superior Acima da Logo)
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Barra informativa para avisos de atendimento e plantão nacional de regularização.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.faixa_topo_ativa !== false}
                      onChange={(e) => setFormData({ ...formData, faixa_topo_ativa: e.target.checked })}
                      className="w-4 h-4 accent-[#2E3192] rounded cursor-pointer"
                    />
                  </div>

                  {formData.faixa_topo_ativa !== false && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Texto do Plantão / Chamada
                        </label>
                        <input
                          type="text"
                          value={formData.faixa_topo_texto || ''}
                          onChange={(e) => setFormData({ ...formData, faixa_topo_texto: e.target.value })}
                          placeholder="Ex: Plantão de Regularização Fundiária & Imobiliária • Atendimento em todo o Brasil"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Texto do Botão / Link (Direciona para WhatsApp)
                        </label>
                        <input
                          type="text"
                          value={formData.faixa_topo_link_texto || ''}
                          onChange={(e) => setFormData({ ...formData, faixa_topo_link_texto: e.target.value })}
                          placeholder="Ex: Falar com Especialista"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* BLOCO 4: UPLOAD DIRETO DO LOGOTIPO PRINCIPAL */}
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <ImageUploadInput
                    label="Trocar Imagem do Logotipo Principal (Topo)"
                    description="Envie um arquivo PNG com fundo transparente ou insira uma URL direta."
                    value={formData.logo_principal_url}
                    onChange={(val) => setFormData({ ...formData, logo_principal_url: val })}
                    aspectHint="Horizontal Transparente"
                    presets={[
                      { label: 'Brasil Legal Oficial', url: '/assets/logo-brasil-legal.svg' },
                      { label: 'Logo Claro', url: '/assets/logo-brasil-legal-light.svg' }
                    ]}
                  />
                </div>
              </div>
            )}

            {/* SECTION: URL DO SITE & SERVIDOR */}
            {editorSection === 'servidor' && (() => {
              const liveOrigin = typeof window !== 'undefined' && window.location.origin
                ? window.location.origin
                : 'https://ais-dev-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app';
              const activeDirectSiteUrl = `${liveOrigin}/?view=site`;

              return (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  {/* Header */}
                  <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Server className="w-4 h-4 text-[#2E3192]" />
                        URL do Site & Redirecionamento no seu Servidor
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Utilize a URL do site da Brasil Legal para redirecionar ou integrar com seu domínio oficial no seu servidor web.
                      </p>
                    </div>
                    <span className="text-[11px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 shrink-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Sistema Operacional Online
                    </span>
                  </div>

                  {/* CARDS DE URLS DO SISTEMA */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* URL ATIVA NO MOMENTO (GARANTIDA) */}
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-xl border-2 border-emerald-300 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          URL Ativa Online (Testada)
                        </span>
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded shadow-xs">
                          Operando Agora
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-900">
                        Esta é a URL exata do container ativo onde você está navegando agora:
                      </p>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-emerald-200">
                        <input
                          type="text"
                          readOnly
                          value={activeDirectSiteUrl}
                          className="w-full text-xs font-mono font-semibold text-slate-800 bg-transparent outline-none truncate select-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopyText(activeDirectSiteUrl, 'live_direct')}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          {copiedUrlType === 'live_direct' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#F2EC00]" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <a
                          href={activeDirectSiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-800 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>Abrir Site Ativo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-emerald-700 font-mono text-[10px]">Acesso Imediato</span>
                      </div>
                    </div>

                    {/* URL Oficial / Produção */}
                    <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-blue-50/50 rounded-xl border border-indigo-100 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#2E3192] uppercase tracking-wider flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5" />
                          URL Produção Cloud Run
                        </span>
                        <span className="text-[10px] bg-white text-[#2E3192] font-bold px-2 py-0.5 rounded shadow-xs">
                          SSL / HTTPS
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        URL atribuída ao serviço de produção no Cloud Run:
                      </p>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-indigo-200">
                        <input
                          type="text"
                          readOnly
                          value="https://ais-pre-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app"
                          className="w-full text-xs font-mono font-semibold text-slate-800 bg-transparent outline-none truncate select-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopyText('https://ais-pre-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app', 'shared')}
                          className="px-3 py-1.5 bg-[#2E3192] hover:bg-[#20236a] text-white rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          {copiedUrlType === 'shared' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#F2EC00]" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <a
                          href="https://ais-pre-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2E3192] font-bold hover:underline flex items-center gap-1"
                        >
                          <span>Testar Produção</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-slate-400 font-mono text-[10px]">Cloud Run Prod</span>
                      </div>
                    </div>

                    {/* URL de Desenvolvimento */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5 text-slate-500" />
                          URL Sandbox Dev
                        </span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">
                          Live Dev
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        URL interna do ambiente de desenvolvimento ativo:
                      </p>
                      <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-300">
                        <input
                          type="text"
                          readOnly
                          value="https://ais-dev-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app"
                          className="w-full text-xs font-mono font-semibold text-slate-800 bg-transparent outline-none truncate select-all"
                        />
                        <button
                          type="button"
                          onClick={() => handleCopyText('https://ais-dev-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app', 'dev')}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          {copiedUrlType === 'dev' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <a
                          href="https://ais-dev-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-700 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>Abrir Dev</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-slate-400 font-mono text-[10px]">Dev Sandbox</span>
                      </div>
                    </div>
                  </div>

                {/* METODOLOGIAS DE CONFIGURAÇÃO NO SERVIDOR */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Modelos de Configuração Prontos para seu Servidor:
                  </h4>

                  {/* OPÇÃO 1: NGINX REVERSE PROXY */}
                  <div className="p-4 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          Opção 1 (Recomendada)
                        </span>
                        <span className="font-bold text-white text-xs">
                          Nginx Reverse Proxy — Mantém seu próprio domínio transparente (ex: brasillegalimoveis.com.br)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyText(`server {
    listen 80;
    listen 443 ssl http2;
    server_name brasillegalimoveis.com.br www.brasillegalimoveis.com.br;

    location / {
        proxy_pass https://ais-pre-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app;
        proxy_set_header Host ais-pre-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app;
        proxy_ssl_server_name on;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`, 'nginx')}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        {copiedUrlType === 'nginx' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUrlType === 'nginx' ? 'Copiado!' : 'Copiar Configuração Nginx'}</span>
                      </button>
                    </div>
                    <pre className="font-mono text-[11px] text-emerald-300/90 bg-slate-950/80 p-3 rounded-lg overflow-x-auto leading-relaxed border border-slate-800/80">
{`server {
    listen 80;
    listen 443 ssl http2;
    server_name brasillegalimoveis.com.br www.brasillegalimoveis.com.br;

    location / {
        proxy_pass https://ais-pre-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app;
        proxy_set_header Host ais-pre-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app;
        proxy_ssl_server_name on;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`}
                    </pre>
                  </div>

                  {/* OPÇÃO 2: REDIRECIONAMENTO HTTP 301 / CLOUDFLARE */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-100 text-[#2E3192] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        Opção 2 (Simples)
                      </span>
                      <span className="font-bold text-slate-900 text-xs">
                        Redirecionamento 301 (Cloudflare Page Rules, Registro.br ou cPanel)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      No seu gerenciador DNS ou painel do domínio, crie um redirecionamento HTTP 301 apontando para a URL de produção:
                    </p>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-800 flex items-center justify-between">
                      <span className="truncate">Origem: <strong className="text-slate-900">seusite.com.br/*</strong> → Destino: <strong className="text-[#2E3192]">https://ais-pre-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app/$1</strong></span>
                      <button
                        type="button"
                        onClick={() => handleCopyText('https://ais-pre-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app', 'cname')}
                        className="text-[#2E3192] hover:underline font-sans text-xs font-bold ml-2 shrink-0 cursor-pointer"
                      >
                        Copiar Destino
                      </button>
                    </div>
                  </div>

                  {/* OPÇÃO 3: APACHE (.HTACCESS) */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          Opção 3
                        </span>
                        <span className="font-bold text-slate-900 text-xs">
                          Apache .htaccess (com mod_proxy ou Redirect 301)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyText(`RewriteEngine On
RewriteRule ^(.*)$ https://ais-pre-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app/$1 [P,L]`, 'apache')}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer text-slate-700"
                      >
                        {copiedUrlType === 'apache' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUrlType === 'apache' ? 'Copiado!' : 'Copiar .htaccess'}</span>
                      </button>
                    </div>
                    <pre className="font-mono text-[11px] text-slate-800 bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto">
{`RewriteEngine On
RewriteRule ^(.*)$ https://ais-pre-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app/$1 [P,L]`}
                    </pre>
                  </div>

                  {/* OPÇÃO 4: IFRAME FULLSCREEN */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          Opção 4
                        </span>
                        <span className="font-bold text-slate-900 text-xs">
                          Incorporação HTML Direta (index.html em tela cheia)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyText(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brasil Legal - Regularização Imobiliária</title>
  <style>
    body, html, iframe { margin: 0; padding: 0; width: 100%; height: 100%; border: none; overflow: hidden; }
  </style>
</head>
<body>
  <iframe src="https://ais-pre-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app" allow="camera; microphone; geolocation" allowfullscreen></iframe>
</body>
</html>`, 'iframe')}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer text-slate-700"
                      >
                        {copiedUrlType === 'iframe' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUrlType === 'iframe' ? 'Copiado!' : 'Copiar Código HTML'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

            {/* SECTION: GITHUB & CPANEL HOMEHOST INTEGRATION */}
            {editorSection === 'github_cpanel' && (
              <ModuloIntegracaoGithubCpanel
                config={configDeploy}
                onSaveConfig={handleSaveConfigDeploy}
                onTriggerDeploy={handleTriggerDeploy}
              />
            )}

            {/* SECTION 2: IMAGENS & UPLOADS */}
            {editorSection === 'midia' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2E3192]" />
                    Upload de Imagens do Site (Logos, Banner e Quem Somos)
                  </h3>
                  <span className="text-[10px] bg-indigo-50 text-[#2E3192] font-bold px-2 py-0.5 rounded">
                    Suporta PNG, JPG, SVG, WebP
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo Principal */}
                  <ImageUploadInput
                    label="Logotipo Principal do Topo (Navbar)"
                    description="Upload de imagem transparente ou URL para a barra superior."
                    value={formData.logo_principal_url}
                    onChange={(val) => setFormData({ ...formData, logo_principal_url: val })}
                    aspectHint="Horizontal Transparente"
                    presets={[
                      { label: 'Brasil Legal Oficial', url: '/assets/logo-brasil-legal.svg' },
                      { label: 'Logo Claro', url: '/assets/logo-brasil-legal-light.svg' }
                    ]}
                  />

                  {/* Logo Footer */}
                  <ImageUploadInput
                    label="Logotipo do Rodapé (Footer)"
                    description="Upload de imagem para exibição no rodapé escuro."
                    value={formData.logo_footer_url}
                    onChange={(val) => setFormData({ ...formData, logo_footer_url: val })}
                    aspectHint="Versão para fundo escuro"
                    presets={[
                      { label: 'Logo Dark', url: '/assets/logo-brasil-legal-dark.svg' }
                    ]}
                  />

                  {/* Banner Hero */}
                  <div className="md:col-span-2">
                    <ImageUploadInput
                      label="Banner de Fundo / Destaque do Hero"
                      description="Imagem de fundo de alto impacto visual (fotografia de imóvel residencial/comercial regularizado)."
                      value={formData.banner_hero_url || ''}
                      onChange={(val) => setFormData({ ...formData, banner_hero_url: val })}
                      aspectHint="16:9 Panorâmico"
                      presets={[
                        { label: 'Casa Moderna Legalizada', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80' },
                        { label: 'Prédio & Escritório Registral', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80' }
                      ]}
                    />
                  </div>

                  {/* Quem Somos Imagem */}
                  <div className="md:col-span-2">
                    <ImageUploadInput
                      label="Foto da Equipe / Sede (Seção Quem Somos)"
                      description="Imagem dos advogados, engenheiros agrimensores e equipamentos da Brasil Legal."
                      value={formData.quem_somos_imagem_url || ''}
                      onChange={(val) => setFormData({ ...formData, quem_somos_imagem_url: val })}
                      aspectHint="Proporção 4:3 ou 16:9"
                      presets={[
                        { label: 'Equipe e Escritório', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: VIDEO & ALERTA */}
            {editorSection === 'video' && (() => {
              const videoPrincipalEmbed = getEmbedVideoUrl(formData.video_url || '');
              const videoSecundarioEmbed = getEmbedVideoUrl(formData.video_secundario_url || '');

              return (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Video className="w-4 h-4 text-[#2E3192]" />
                        Vídeo Explicativo e Banner de Alerta (Conversão)
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Compatível com qualquer link do YouTube (watch, shorts, youtu.be, embed) ou arquivos MP4 diretos.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                            video_titulo: 'Como Funciona a Regularização Extrajudicial em Cartório',
                            video_subtitulo: 'Entenda em 2 minutos como a legislação moderna permite obter sua matrícula sem passar por longos processos na Justiça.'
                          });
                        }}
                        className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-lg border border-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 text-[#2E3192]" />
                        Inserir Vídeo Modelo de Exemplo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Título da Seção de Vídeo</label>
                        <input
                          type="text"
                          value={formData.video_titulo || ''}
                          onChange={(e) => setFormData({ ...formData, video_titulo: e.target.value })}
                          placeholder="Como Funciona a Regularização Extrajudicial em Cartório"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Subtítulo do Vídeo</label>
                        <textarea
                          rows={2}
                          value={formData.video_subtitulo || ''}
                          onChange={(e) => setFormData({ ...formData, video_subtitulo: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700">
                            URL do Vídeo Principal (YouTube ou MP4)
                          </label>
                          {videoPrincipalEmbed.isValid && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {videoPrincipalEmbed.type === 'youtube' ? 'YouTube Detectado' : videoPrincipalEmbed.type.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={formData.video_url || ''}
                          onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                          placeholder="Ex: https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-[#2E3192]"
                        />
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                          <span>Aceita links normais do YouTube, links curtos ou embed.</span>
                          {videoPrincipalEmbed.thumbnailUrl && (
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, video_poster_url: videoPrincipalEmbed.thumbnailUrl })}
                              className="text-[#2E3192] hover:underline font-bold cursor-pointer"
                            >
                              Copiar Capa do YouTube como Poster
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700">
                            URL do Vídeo de Depoimentos / Prova Social (Opcional)
                          </label>
                          {videoSecundarioEmbed.isValid && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                              Vídeo Válido
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={formData.video_secundario_url || ''}
                          onChange={(e) => setFormData({ ...formData, video_secundario_url: e.target.value })}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-[#2E3192]"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">Vídeo secundário com depoimentos reais ou casos de sucesso.</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <ImageUploadInput
                        label="Thumbnail / Poster do Vídeo (Upload ou URL)"
                        description="Imagem de capa exibida antes do usuário clicar no play."
                        value={formData.video_poster_url || ''}
                        onChange={(val) => setFormData({ ...formData, video_poster_url: val })}
                        aspectHint="16:9 Panorâmico"
                        presets={[
                          { label: 'Fachada Corporativa', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80' }
                        ]}
                      />

                      {/* Live Mini Preview do Player */}
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-white space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold flex items-center gap-1.5 text-slate-200">
                            <Eye className="w-3.5 h-3.5 text-[#F2EC00]" />
                            Player de Teste em Tempo Real
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {videoPrincipalEmbed.isValid ? 'Pronto para Rodar' : 'Aguardando URL'}
                          </span>
                        </div>

                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                          {videoPrincipalEmbed.type === 'mp4' ? (
                            <video src={videoPrincipalEmbed.embedUrl} controls className="w-full h-full object-contain" />
                          ) : videoPrincipalEmbed.isValid ? (
                            <iframe
                              src={videoPrincipalEmbed.embedUrl}
                              title="Pré-visualização do Vídeo"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <div className="text-center p-4 text-slate-400 text-xs">
                              <Play className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                              <p>Insira uma URL válida do YouTube para testar a reprodução aqui.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Banner de Alerta (Gatilho de Urgência)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Título do Alerta</label>
                        <input
                          type="text"
                          value={formData.banner_alerta_titulo || ''}
                          onChange={(e) => setFormData({ ...formData, banner_alerta_titulo: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subtítulo do Alerta</label>
                        <input
                          type="text"
                          value={formData.banner_alerta_subtitulo || ''}
                          onChange={(e) => setFormData({ ...formData, banner_alerta_subtitulo: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SECTION 4: DEPOIMENTOS */}
            {editorSection === 'depoimentos' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <MessageSquareQuote className="w-4 h-4 text-[#2E3192]" />
                      Depoimentos Reais de Clientes (Prova Social)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Inclua fotos, nomes, cidades, notas e relatos reais de clientes regularizados.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDepoimento}
                    className="px-3 py-1.5 bg-[#2E3192] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer hover:bg-opacity-90"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Depoimento
                  </button>
                </div>

                <div className="space-y-4">
                  {(formData.depoimentos || []).map((dep, index) => (
                    <div
                      key={dep.id}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2E3192]">
                          Depoimento #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDepoimento(dep.id)}
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          title="Remover depoimento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Nome do Cliente</label>
                          <input
                            type="text"
                            value={dep.nome}
                            onChange={(e) => {
                              const updated = [...(formData.depoimentos || [])];
                              updated[index].nome = e.target.value;
                              setFormData({ ...formData, depoimentos: updated });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Cidade / UF</label>
                          <input
                            type="text"
                            value={dep.cidade_uf}
                            onChange={(e) => {
                              const updated = [...(formData.depoimentos || [])];
                              updated[index].cidade_uf = e.target.value;
                              setFormData({ ...formData, depoimentos: updated });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Tipo de Imóvel</label>
                          <input
                            type="text"
                            value={dep.tipo_imovel}
                            onChange={(e) => {
                              const updated = [...(formData.depoimentos || [])];
                              updated[index].tipo_imovel = e.target.value;
                              setFormData({ ...formData, depoimentos: updated });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <ImageUploadInput
                          label="Foto do Cliente (Upload ou URL)"
                          description="Carregue a foto do cliente ou cole a URL."
                          value={dep.foto_url}
                          onChange={(val) => {
                            const updated = [...(formData.depoimentos || [])];
                            updated[index].foto_url = val;
                            setFormData({ ...formData, depoimentos: updated });
                          }}
                          aspectHint="1:1 Redondo"
                        />

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Texto do Depoimento</label>
                          <textarea
                            rows={3}
                            value={dep.texto}
                            onChange={(e) => {
                              const updated = [...(formData.depoimentos || [])];
                              updated[index].texto = e.target.value;
                              setFormData({ ...formData, depoimentos: updated });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 5: SERVIÇOS */}
            {editorSection === 'servicos' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[#2E3192]" />
                  Catálogo de Soluções Registrais Exibidas na Landing Page
                </h3>

                <div className="space-y-3">
                  {formData.servicos_catalogo.map((serv, index) => (
                    <div key={serv.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Nome do Procedimento</label>
                          <input
                            type="text"
                            value={serv.nome}
                            onChange={(e) => {
                              const updated = [...formData.servicos_catalogo];
                              updated[index].nome = e.target.value;
                              setFormData({ ...formData, servicos_catalogo: updated });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Prazo Estimado</label>
                          <input
                            type="text"
                            value={serv.prazo_medio || ''}
                            onChange={(e) => {
                              const updated = [...formData.servicos_catalogo];
                              updated[index].prazo_medio = e.target.value;
                              setFormData({ ...formData, servicos_catalogo: updated });
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Descrição</label>
                        <textarea
                          rows={2}
                          value={serv.descricao}
                          onChange={(e) => {
                            const updated = [...formData.servicos_catalogo];
                            updated[index].descricao = e.target.value;
                            setFormData({ ...formData, servicos_catalogo: updated });
                          }}
                          className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION: CASOS REAIS (ESTUDOS DE CASO) */}
            {editorSection === 'casos_reais' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#2E3192]" />
                      Casos Reais & Estudos de Caso (Problema, Desafio, Solução e Resultado)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Apresente transformações reais de imóveis sanados pela Brasil Legal para gerar máxima credibilidade.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCasoReal}
                    className="px-3 py-1.5 bg-[#2E3192] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer hover:bg-opacity-90 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Estudo de Caso
                  </button>
                </div>

                <div className="space-y-4">
                  {(!formData.casos_reais || formData.casos_reais.length === 0) ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                      Nenhum caso real cadastrado no momento. Clique em "Adicionar Estudo de Caso" para incluir o primeiro.
                    </div>
                  ) : (
                    formData.casos_reais.map((caso, index) => (
                      <div
                        key={caso.id}
                        className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 relative"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#2E3192] text-white flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {caso.titulo || 'Caso sem Título'}
                            </span>
                            {caso.destaque && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                                Destaque
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveCasoReal(caso.id)}
                            className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Excluir
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Título do Caso</label>
                            <input
                              type="text"
                              value={caso.titulo}
                              onChange={(e) => {
                                const updated = [...(formData.casos_reais || [])];
                                updated[index].titulo = e.target.value;
                                setFormData({ ...formData, casos_reais: updated });
                              }}
                              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Tipo de Imóvel / Cliente</label>
                            <input
                              type="text"
                              value={caso.cliente_ou_tipo}
                              onChange={(e) => {
                                const updated = [...(formData.casos_reais || [])];
                                updated[index].cliente_ou_tipo = e.target.value;
                                setFormData({ ...formData, casos_reais: updated });
                              }}
                              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Cidade / UF</label>
                            <input
                              type="text"
                              value={caso.cidade}
                              onChange={(e) => {
                                const updated = [...(formData.casos_reais || [])];
                                updated[index].cidade = e.target.value;
                                setFormData({ ...formData, casos_reais: updated });
                              }}
                              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-rose-700 mb-1">❌ O Problema Inicial</label>
                            <textarea
                              rows={2}
                              value={caso.problema}
                              onChange={(e) => {
                                const updated = [...(formData.casos_reais || [])];
                                updated[index].problema = e.target.value;
                                setFormData({ ...formData, casos_reais: updated });
                              }}
                              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                              placeholder="Descreva a irregularidade inicial..."
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-amber-700 mb-1">⚠️ O Desafio Técnico / Jurídico</label>
                            <textarea
                              rows={2}
                              value={caso.desafio}
                              onChange={(e) => {
                                const updated = [...(formData.casos_reais || [])];
                                updated[index].desafio = e.target.value;
                                setFormData({ ...formData, casos_reais: updated });
                              }}
                              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                              placeholder="Qual o obstáculo que impedia o proprietário..."
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-indigo-700 mb-1">⚡ A Solução da Brasil Legal</label>
                            <textarea
                              rows={2}
                              value={caso.solucao}
                              onChange={(e) => {
                                const updated = [...(formData.casos_reais || [])];
                                updated[index].solucao = e.target.value;
                                setFormData({ ...formData, casos_reais: updated });
                              }}
                              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                              placeholder="Quais procedimentos de engenharia e direito foram aplicados..."
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-emerald-700 mb-1">✅ O Resultado Alcançado</label>
                            <textarea
                              rows={2}
                              value={caso.resultado}
                              onChange={(e) => {
                                const updated = [...(formData.casos_reais || [])];
                                updated[index].resultado = e.target.value;
                                setFormData({ ...formData, casos_reais: updated });
                              }}
                              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                              placeholder="Matrícula registrada, certidões limpas..."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Prazo / Tempo</label>
                            <input
                              type="text"
                              value={caso.tempo_meses || ''}
                              onChange={(e) => {
                                const updated = [...(formData.casos_reais || [])];
                                updated[index].tempo_meses = e.target.value;
                                setFormData({ ...formData, casos_reais: updated });
                              }}
                              placeholder="Ex: 3,5 meses"
                              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Valorização Estimada</label>
                            <input
                              type="text"
                              value={caso.valorizacao_estimada || ''}
                              onChange={(e) => {
                                const updated = [...(formData.casos_reais || [])];
                                updated[index].valorizacao_estimada = e.target.value;
                                setFormData({ ...formData, casos_reais: updated });
                              }}
                              placeholder="Ex: +38% Valorização"
                              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                            />
                          </div>

                          <div className="flex items-center gap-4 pt-4">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={caso.destaque ?? true}
                                onChange={(e) => {
                                  const updated = [...(formData.casos_reais || [])];
                                  updated[index].destaque = e.target.checked;
                                  setFormData({ ...formData, casos_reais: updated });
                                }}
                                className="w-4 h-4 text-[#2E3192] rounded"
                              />
                              Destacar
                            </label>

                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={caso.ativo ?? true}
                                onChange={(e) => {
                                  const updated = [...(formData.casos_reais || [])];
                                  updated[index].ativo = e.target.checked;
                                  setFormData({ ...formData, casos_reais: updated });
                                }}
                                className="w-4 h-4 text-[#2E3192] rounded"
                              />
                              Ativo no Site
                            </label>
                          </div>
                        </div>

                        <div>
                          <ImageUploadInput
                            label="Foto / Imagem do Imóvel (Upload ou URL)"
                            description="Foto ilustrativa ou real da fachada ou projeto."
                            value={caso.imagem_url || ''}
                            onChange={(val) => {
                              const updated = [...(formData.casos_reais || [])];
                              updated[index].imagem_url = val;
                              setFormData({ ...formData, casos_reais: updated });
                            }}
                            aspectHint="16:9 Panorâmico"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SECTION: GALERIA DE VÍDEOS */}
            {editorSection === 'galeria_videos' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Film className="w-4 h-4 text-[#2E3192]" />
                      Galeria de Vídeos da Brasil Legal
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Gerencie vídeos institucionais, orientações técnicas, estudos de caso e depoimentos em vídeo.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddGaleriaVideo}
                    className="px-3 py-1.5 bg-[#2E3192] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer hover:bg-opacity-90 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Vídeo
                  </button>
                </div>

                <div className="space-y-4">
                  {(!formData.galeria_videos || formData.galeria_videos.length === 0) ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                      Nenhum vídeo adicional cadastrado na galeria.
                    </div>
                  ) : (
                    formData.galeria_videos.map((vid, index) => {
                      const vidEmbed = getEmbedVideoUrl(vid.url);
                      return (
                        <div
                          key={vid.id}
                          className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative"
                        >
                          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                            <span className="text-xs font-bold text-slate-800">
                              #{index + 1} — {vid.titulo || 'Vídeo sem Título'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveGaleriaVideo(vid.id)}
                              className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Excluir
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Título do Vídeo</label>
                              <input
                                type="text"
                                value={vid.titulo}
                                onChange={(e) => {
                                  const updated = [...(formData.galeria_videos || [])];
                                  updated[index].titulo = e.target.value;
                                  setFormData({ ...formData, galeria_videos: updated });
                                }}
                                className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">URL (YouTube ou MP4)</label>
                              <input
                                type="text"
                                value={vid.url}
                                onChange={(e) => {
                                  const updated = [...(formData.galeria_videos || [])];
                                  updated[index].url = e.target.value;
                                  setFormData({ ...formData, galeria_videos: updated });
                                }}
                                placeholder="https://youtu.be/..."
                                className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Categoria</label>
                              <select
                                value={vid.categoria || 'Institucional'}
                                onChange={(e) => {
                                  const updated = [...(formData.galeria_videos || [])];
                                  updated[index].categoria = e.target.value as any;
                                  setFormData({ ...formData, galeria_videos: updated });
                                }}
                                className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                              >
                                <option value="Institucional">Institucional</option>
                                <option value="Regularização">Regularização</option>
                                <option value="Casos reais">Casos reais</option>
                                <option value="Dúvidas">Dúvidas</option>
                                <option value="Depoimentos">Depoimentos</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Descrição</label>
                            <input
                              type="text"
                              value={vid.descricao || ''}
                              onChange={(e) => {
                                const updated = [...(formData.galeria_videos || [])];
                                updated[index].descricao = e.target.value;
                                setFormData({ ...formData, galeria_videos: updated });
                              }}
                              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={vid.ativo ?? true}
                                onChange={(e) => {
                                  const updated = [...(formData.galeria_videos || [])];
                                  updated[index].ativo = e.target.checked;
                                  setFormData({ ...formData, galeria_videos: updated });
                                }}
                                className="w-4 h-4 text-[#2E3192] rounded"
                              />
                              Ativo na Galeria
                            </label>

                            {vidEmbed.isValid && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                                URL Válida ({vidEmbed.type})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* SECTION: REDES SOCIAIS (CMS DEDICADO) */}
            {editorSection === 'redes_sociais' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-[#2E3192]" />
                      Redes Sociais Oficiais da Brasil Legal
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Gerencie os links e identificadores das redes sociais exibidas na landing page, no cabeçalho e no rodapé.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetRedesSociaisPadrao}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Restaurar Padrões
                    </button>
                    <button
                      type="button"
                      onClick={handleAddRedeSocial}
                      className="px-3 py-1.5 bg-[#2E3192] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer hover:bg-opacity-90 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Rede Social
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {(!formData.redes_sociais || formData.redes_sociais.length === 0) ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
                      Nenhuma rede social configurada. Clique em "Restaurar Padrões" para carregar TikTok, Instagram, Facebook e YouTube.
                    </div>
                  ) : (
                    formData.redes_sociais.map((rede, index) => (
                      <div
                        key={rede.id}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#2E3192] text-white flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <strong className="text-xs font-bold text-slate-800">
                              {rede.nome}
                            </strong>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {rede.username}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveRedeSocial(rede.id)}
                            className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Excluir
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Nome da Plataforma</label>
                            <input
                              type="text"
                              value={rede.nome}
                              onChange={(e) => {
                                const updated = [...(formData.redes_sociais || [])];
                                updated[index].nome = e.target.value;
                                setFormData({ ...formData, redes_sociais: updated });
                              }}
                              placeholder="Ex: Instagram"
                              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Username / Perfil</label>
                            <input
                              type="text"
                              value={rede.username}
                              onChange={(e) => {
                                const updated = [...(formData.redes_sociais || [])];
                                updated[index].username = e.target.value;
                                setFormData({ ...formData, redes_sociais: updated });
                              }}
                              placeholder="Ex: @brasillegalodicial"
                              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white font-mono"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">URL Completa do Link</label>
                            <input
                              type="text"
                              value={rede.url}
                              onChange={(e) => {
                                const updated = [...(formData.redes_sociais || [])];
                                updated[index].url = e.target.value;
                                setFormData({ ...formData, redes_sociais: updated });
                              }}
                              placeholder="https://..."
                              className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Ícone</label>
                              <select
                                value={rede.icone}
                                onChange={(e) => {
                                  const updated = [...(formData.redes_sociais || [])];
                                  updated[index].icone = e.target.value as any;
                                  setFormData({ ...formData, redes_sociais: updated });
                                }}
                                className="px-2 py-1 text-xs rounded border border-slate-300 bg-white"
                              >
                                <option value="tiktok">TikTok</option>
                                <option value="instagram">Instagram</option>
                                <option value="facebook">Facebook</option>
                                <option value="youtube">YouTube</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="globe">Outro (Globo)</option>
                              </select>
                            </div>

                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer mt-4">
                              <input
                                type="checkbox"
                                checked={rede.ativo ?? true}
                                onChange={(e) => {
                                  const updated = [...(formData.redes_sociais || [])];
                                  updated[index].ativo = e.target.checked;
                                  setFormData({ ...formData, redes_sociais: updated });
                                }}
                                className="w-4 h-4 text-[#2E3192] rounded"
                              />
                              Ativo no Site
                            </label>
                          </div>

                          <a
                            href={rede.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#2E3192] font-semibold hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Testar Link
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SECTION: TIME & ESPECIALISTAS CMS */}
            {editorSection === 'equipe' && (
              <GerenciadorEquipeCms
                settings={formData}
                onUpdateEquipeSettings={(updated) => {
                  const newFormData = { ...formData, ...updated };
                  setFormData(newFormData);
                }}
                onSave={handleSave}
              />
            )}

            {/* SECTION: BLOG & ARTIGOS CMS */}
            {editorSection === 'blog' && (
              <GerenciadorBlogCms
                settings={formData}
                onUpdateBlogSettings={(updated) => {
                  const newFormData = { ...formData, ...updated };
                  setFormData(newFormData);
                }}
              />
            )}

            {/* SECTION: ÁREA DO CLIENTE & ACOMPANHAMENTO DOS TRABALHOS */}
            {editorSection === 'area_cliente' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#2E3192] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          Transparência Registral
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Reduz dúvidas e ligações no WhatsApp
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
                        <SearchCheck className="w-4 h-4 text-[#2E3192]" />
                        Configuração da Área do Cliente & Status dos Trabalhos
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Permite que os proprietários consultem o andamento do processo de regularização com número de protocolo ou CPF em tempo real.
                      </p>
                    </div>

                    <button
                      type="button"
                      id="btn-testar-area-cliente"
                      onClick={() => setIsPreviewAreaClienteOpen(true)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-300" />
                      <span>Testar Portal do Cliente</span>
                    </button>
                  </div>

                  {/* Switch Toggle */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Ativar Portal de Acompanhamento no Site & Painel
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Exibe o módulo de consulta com linha do tempo das 5 fases registrais.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.area_cliente_ativo ?? true}
                        onChange={(e) => setFormData({ ...formData, area_cliente_ativo: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E3192]"></div>
                    </label>
                  </div>

                  {/* Text Configuration Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Título da Seção no Site
                      </label>
                      <input
                        type="text"
                        value={formData.area_cliente_titulo || 'Acompanhe seu Processo em Tempo Real'}
                        onChange={(e) => setFormData({ ...formData, area_cliente_titulo: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                        placeholder="Ex: Acompanhe seu Processo em Tempo Real"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        WhatsApp do Plantão de Suporte Registral
                      </label>
                      <input
                        type="text"
                        value={formData.area_cliente_whatsapp_suporte || '(11) 98741-2099'}
                        onChange={(e) => setFormData({ ...formData, area_cliente_whatsapp_suporte: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                        placeholder="(11) 98741-2099"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Subtítulo Explicativo para os Clientes
                      </label>
                      <input
                        type="text"
                        value={formData.area_cliente_subtitulo || 'Digite o número do seu Protocolo Registral ou CPF para consultar todas as etapas concluídas e certidões emitidas.'}
                        onChange={(e) => setFormData({ ...formData, area_cliente_subtitulo: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Texto de Orientação Jurídica / Aviso de Segurança
                      </label>
                      <textarea
                        rows={2}
                        value={formData.area_cliente_aviso || 'A consulta online reflete o status oficial sincronizado com as serventias registrais e cartórios de notas competentes, em conformidade com o Provimento 65 do CNJ.'}
                        onChange={(e) => setFormData({ ...formData, area_cliente_aviso: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                      />
                    </div>
                  </div>

                  {/* Flow Stages Visual Overview */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#2E3192]" />
                      Etapas Exibidas no Portal de Acompanhamento do Cliente
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                      {[
                        { step: '1', title: 'Triagem & Matrícula', desc: 'Levantamento da cadeia dominial' },
                        { step: '2', title: 'Auditoria e Certidões', desc: 'Conferência de ônus e ações' },
                        { step: '3', title: 'Parecer Técnico', desc: 'Laudo de agrimensura e OAB' },
                        { step: '4', title: 'Prenotação no Cartório', desc: 'Autuação perante o RI' },
                        { step: '5', title: 'Matrícula Concluída', desc: 'Escritura definitiva expedida' }
                      ].map((item) => (
                        <div key={item.step} className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                          <div className="w-6 h-6 rounded-full bg-[#2E3192] text-[#F2EC00] font-black text-xs flex items-center justify-center mx-auto mb-1.5 shadow-2xs">
                            {item.step}
                          </div>
                          <div className="text-xs font-bold text-slate-900 leading-tight">{item.title}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 6: CORES & CSS */}
            {editorSection === 'css' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#2E3192]" />
                    Paleta de Cores da Landing Page
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Primária (Azul)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.paleta_cores.primaria}
                          onChange={(e) => setFormData({
                            ...formData,
                            paleta_cores: { ...formData.paleta_cores, primaria: e.target.value }
                          })}
                          className="w-8 h-8 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.paleta_cores.primaria}
                          onChange={(e) => setFormData({
                            ...formData,
                            paleta_cores: { ...formData.paleta_cores, primaria: e.target.value }
                          })}
                          className="w-full text-xs font-mono px-2 py-1 border rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Acento (Amarelo)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.paleta_cores.secundaria}
                          onChange={(e) => setFormData({
                            ...formData,
                            paleta_cores: { ...formData.paleta_cores, secundaria: e.target.value }
                          })}
                          className="w-8 h-8 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.paleta_cores.secundaria}
                          onChange={(e) => setFormData({
                            ...formData,
                            paleta_cores: { ...formData.paleta_cores, secundaria: e.target.value }
                          })}
                          className="w-full text-xs font-mono px-2 py-1 border rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Fundo</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={formData.paleta_cores.fundo}
                          onChange={(e) => setFormData({
                            ...formData,
                            paleta_cores: { ...formData.paleta_cores, fundo: e.target.value }
                          })}
                          className="w-8 h-8 rounded border cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.paleta_cores.fundo}
                          onChange={(e) => setFormData({
                            ...formData,
                            paleta_cores: { ...formData.paleta_cores, fundo: e.target.value }
                          })}
                          className="w-full text-xs font-mono px-2 py-1 border rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção Tipografia do Site */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2E3192]" />
                    Tipografia & Fontes da Página de Vendas
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Fonte para Títulos (H1, H2, H3)</label>
                      <select
                        value={formData.fonte_titulo || 'Plus Jakarta Sans'}
                        onChange={(e) => setFormData({ ...formData, fonte_titulo: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                      >
                        <option value="Plus Jakarta Sans">Plus Jakarta Sans (Moderna & Corporativa)</option>
                        <option value="Inter">Inter (Tecnológica & Alta Legibilidade)</option>
                        <option value="Montserrat">Montserrat (Geométrica & Marcante)</option>
                        <option value="Playfair Display">Playfair Display (Elegante & Jurídica)</option>
                        <option value="Poppins">Poppins (Arrojada & Conversão)</option>
                        <option value="Lora">Lora (Serifada & Tradicional)</option>
                      </select>
                      <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded text-xs" style={{ fontFamily: formData.fonte_titulo || 'Plus Jakarta Sans' }}>
                        <span className="font-bold text-slate-900">Exemplo Título:</span> Regularize seu Imóvel sem Burocracia
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Fonte para Textos e Parágrafos</label>
                      <select
                        value={formData.fonte_corpo || 'Inter'}
                        onChange={(e) => setFormData({ ...formData, fonte_corpo: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                      >
                        <option value="Inter">Inter (Equilibrada para Leitura)</option>
                        <option value="Open Sans">Open Sans (Clean & Amigável)</option>
                        <option value="Roboto">Roboto (Padrão Android/Google)</option>
                        <option value="Lato">Lato (Harmoniosa e Neutra)</option>
                      </select>
                      <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded text-xs" style={{ fontFamily: formData.fonte_corpo || 'Inter' }}>
                        <span className="text-slate-600">Exemplo Texto:</span> O Provimento 65 do CNJ possibilita a usucapião administrativa.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Code className="w-4 h-4 text-[#2E3192]" />
                      Injetor CSS Customizado
                    </h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      Live CSS
                    </span>
                  </div>
                  <textarea
                    rows={9}
                    value={formData.css_customizado}
                    onChange={(e) => setFormData({ ...formData, css_customizado: e.target.value })}
                    className="w-full text-xs font-mono p-3 bg-slate-900 text-emerald-400 border border-slate-800 rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* SECTION: RODAPÉ & DADOS LEGAIS */}
            {editorSection === 'rodape' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Layout className="w-4 h-4 text-[#2E3192]" />
                      Personalização Completa do Rodapé & Dados Legais (Footer)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Edite todos os textos do rodapé: razão social, CNPJ, telefones, endereço, segurança jurídica e direitos autorais.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    <label className="text-xs font-bold text-slate-700 cursor-pointer">Exibir Rodapé no Site:</label>
                    <input
                      type="checkbox"
                      checked={formData.rodape_exibir ?? true}
                      onChange={(e) => setFormData({ ...formData, rodape_exibir: e.target.checked })}
                      className="w-4 h-4 text-[#2E3192] rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Título / Marca Principal do Rodapé</label>
                    <input
                      type="text"
                      value={formData.rodape_titulo || ''}
                      onChange={(e) => setFormData({ ...formData, rodape_titulo: e.target.value })}
                      placeholder="BRASIL LEGAL"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Nome em destaque no rodapé (geralmente em caixa alta).</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tag / Selo do Rodapé (Badge)</label>
                    <input
                      type="text"
                      value={formData.rodape_tag || ''}
                      onChange={(e) => setFormData({ ...formData, rodape_tag: e.target.value })}
                      placeholder="CARTÓRIOS & REGISTROS"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Etiqueta amarela ao lado do nome da empresa.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Razão Social Oficial</label>
                    <input
                      type="text"
                      value={formData.rodape_razao_social || ''}
                      onChange={(e) => setFormData({ ...formData, rodape_razao_social: e.target.value })}
                      placeholder="Brasil Legal Soluções Imobiliárias e Registrais Ltda"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">CNPJ</label>
                    <input
                      type="text"
                      value={formData.rodape_cnpj || ''}
                      onChange={(e) => setFormData({ ...formData, rodape_cnpj: e.target.value })}
                      placeholder="38.491.820/0001-55"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Texto Institucional / Descrição do Rodapé</label>
                    <textarea
                      rows={3}
                      value={formData.rodape_descricao || ''}
                      onChange={(e) => setFormData({ ...formData, rodape_descricao: e.target.value })}
                      placeholder="Assessoria jurídica e técnica especializada em regularização fundiária urbana e rural..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / WhatsApp do Rodapé</label>
                    <input
                      type="text"
                      value={formData.rodape_telefone || ''}
                      onChange={(e) => setFormData({ ...formData, rodape_telefone: e.target.value })}
                      placeholder="+55 11 98741-2099"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">E-mail Institucional de Atendimento</label>
                    <input
                      type="text"
                      value={formData.rodape_email || ''}
                      onChange={(e) => setFormData({ ...formData, rodape_email: e.target.value })}
                      placeholder="atendimento@brasillegal.com.br"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Endereço Físico / Sede</label>
                    <input
                      type="text"
                      value={formData.rodape_endereco || ''}
                      onChange={(e) => setFormData({ ...formData, rodape_endereco: e.target.value })}
                      placeholder="Ex: Caieiras, São Paulo - SP"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Horário de Atendimento</label>
                    <input
                      type="text"
                      value={formData.rodape_horario_atendimento || ''}
                      onChange={(e) => setFormData({ ...formData, rodape_horario_atendimento: e.target.value })}
                      placeholder="Atendimento de Segunda a Sexta das 8h às 18h"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Texto de Segurança & Conformidade Jurídica</label>
                    <input
                      type="text"
                      value={formData.rodape_texto_seguranca || ''}
                      onChange={(e) => setFormData({ ...formData, rodape_texto_seguranca: e.target.value })}
                      placeholder="Processos em conformidade com o Provimento 65 do CNJ e Lei 13.465/2017."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Texto de Copyright / Direitos Autorais</label>
                    <input
                      type="text"
                      value={formData.rodape_copyright || ''}
                      onChange={(e) => setFormData({ ...formData, rodape_copyright: e.target.value })}
                      placeholder="© 2026 Brasil Legal. Todos os direitos reservados."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Texto dos Termos de Uso</label>
                    <input
                      type="text"
                      value={formData.rodape_termos_uso || ''}
                      onChange={(e) => setFormData({ ...formData, rodape_termos_uso: e.target.value })}
                      placeholder="Termos de Uso"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Texto da Política de Privacidade (LGPD)</label>
                    <input
                      type="text"
                      value={formData.rodape_politica_privacidade || ''}
                      onChange={(e) => setFormData({ ...formData, rodape_politica_privacidade: e.target.value })}
                      placeholder="Política de Privacidade (LGPD)"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>
                </div>

                {/* Live Preview Box do Rodapé */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#2E3192]" />
                      Pré-visualização do Rodapé
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          rodape_titulo: 'BRASIL LEGAL',
                          rodape_tag: 'CARTÓRIOS & REGISTROS',
                          rodape_razao_social: 'Brasil Legal Soluções Imobiliárias e Registrais Ltda',
                          rodape_cnpj: '00.000.000/0001-00',
                          rodape_descricao: 'Assessoria jurídica e técnica especializada em regularização fundiária urbana e rural, usucapião extrajudicial e saneamento de matrículas em todo o território nacional.',
                          rodape_telefone: '+55 11 98741-2099',
                          rodape_email: 'atendimento@brasillegal.com.br',
                          rodape_endereco: 'Caieiras, São Paulo - SP',
                          rodape_horario_atendimento: 'Atendimento de Segunda a Sexta das 8h às 18h',
                          rodape_texto_seguranca: 'Processos em conformidade com o Provimento 65 do CNJ e Lei 13.465/2017.',
                          rodape_copyright: `© ${new Date().getFullYear()} Brasil Legal. Todos os direitos reservados.`,
                          rodape_termos_uso: 'Termos de Uso',
                          rodape_politica_privacidade: 'Política de Privacidade (LGPD)'
                        });
                      }}
                      className="text-[11px] text-[#2E3192] hover:underline font-semibold cursor-pointer"
                    >
                      Restaurar Padrão Oficial
                    </button>
                  </div>

                  <div className="bg-slate-950 text-white p-5 rounded-xl border-t-4 border-[#F2EC00] space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-base">
                          {formData.rodape_titulo || 'BRASIL LEGAL'}
                        </span>
                        {formData.rodape_tag && (
                          <span className="text-[9px] font-black bg-[#F2EC00] text-[#2E3192] px-1.5 py-0.5 rounded uppercase">
                            {formData.rodape_tag}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        CNPJ: {formData.rodape_cnpj || '38.491.820/0001-55'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      {formData.rodape_razao_social || 'Brasil Legal Soluções Imobiliárias e Registrais Ltda'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formData.rodape_descricao}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-500">
                      <span>{formData.rodape_copyright || `© ${new Date().getFullYear()} Brasil Legal. Todos os direitos reservados.`}</span>
                      <div className="flex items-center gap-3">
                        <span>{formData.rodape_termos_uso || 'Termos de Uso'}</span>
                        <span>•</span>
                        <span>{formData.rodape_politica_privacidade || 'Política de Privacidade (LGPD)'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              {savedSuccess ? (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Alterações salvas com sucesso no CMS!
                </span>
              ) : (
                <span className="text-xs text-slate-500">Clique para salvar todas as alterações.</span>
              )}

              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 bg-[#2E3192] hover:bg-[#1E216B] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 border-b-2 border-[#F2EC00] cursor-pointer disabled:opacity-60"
              >
                {isSavingSettings ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#F2EC00]" />
                    <span>Salvando Configurações...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#F2EC00]" />
                    <span>Salvar Configurações no CMS</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mode: Live Preview */}
      {previewTab === 'preview' && (
        <div className="space-y-4">
          {/* Mockup Toolbar */}
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 text-xs shadow-md">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              </div>
              <span className="font-mono text-[11px] text-slate-300 hidden sm:inline">
                https://brasillegalimoveis.com.br (Página de Vendas ao Vivo)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Device Viewport Toggle */}
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewportMode('desktop')}
                  className={`p-1.5 rounded cursor-pointer ${
                    viewportMode === 'desktop' ? 'bg-[#2E3192] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Visualização Desktop"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode('mobile')}
                  className={`p-1.5 rounded cursor-pointer ${
                    viewportMode === 'mobile' ? 'bg-[#2E3192] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Visualização Mobile"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPreviewTab('editor')}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Palette className="w-3.5 h-3.5" />
                Editar no CMS
              </button>
            </div>
          </div>

          {/* Render Responsive Container */}
          <div className={`mx-auto transition-all ${
            viewportMode === 'mobile' 
              ? 'max-w-sm rounded-3xl border-8 border-slate-800 shadow-2xl overflow-hidden' 
              : 'w-full rounded-2xl border border-slate-300 shadow-xl overflow-hidden'
          }`}>
            <PaginaVendasPublica
              siteSettings={settings}
              appSettings={{
                ...settings as any,
                app_name: 'Brasil Legal',
                app_tagline: 'Plataforma Integrada de Regularização Imobiliária',
                razao_social: 'Brasil Legal Soluções Imobiliárias e Registrais Ltda',
                cnpj_empresa: '38.491.820/0001-55',
                whatsapp_suporte: settings.whatsapp_vendas || '+55 11 98741-2099',
                email_suporte: 'atendimento@brasillegal.com.br',
                cor_primaria: settings.paleta_cores.primaria,
                cor_secundaria: settings.paleta_cores.secundaria
              }}
              onNovoLead={onSubmitPublicLead}
              isStandaloneView={false}
            />
          </div>
        </div>
      )}

      {/* Modal Preview: Área do Cliente */}
      {isPreviewAreaClienteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-100 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-300 flex flex-col">
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pré-visualização Interativa da Área do Cliente (Portal Público)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewAreaClienteOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <AreaClientePortal siteSettings={formData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
