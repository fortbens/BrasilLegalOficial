import React, { useState, useEffect } from 'react';
import { SiteSettings, AppSettings, Contact, Usuario, ArtigoBlog } from '../types';
import { AreaClientePortal } from './AreaClientePortal';
import { getEmbedVideoUrl } from '../utils/videoHelper';
import { RaioXImovel } from './RaioXImovel';
import { SecaoProblemas } from './SecaoProblemas';
import { SecaoTransformacao } from './SecaoTransformacao';
import { SecaoComoFunciona } from './SecaoComoFunciona';
import { SecaoDiferenciaisValorizacao } from './SecaoDiferenciaisValorizacao';
import { SecaoCasosReais } from './SecaoCasosReais';
import { SecaoGaleriaVideos } from './SecaoGaleriaVideos';
import { RedesSociaisLinks } from './RedesSociaisLinks';
import { ModalPopupPromocional } from './ModalPopupPromocional';
import { 
  Shield, 
  CheckCircle2, 
  Phone, 
  Send, 
  FileCheck, 
  Building2, 
  Award, 
  Users, 
  Clock, 
  ArrowRight, 
  Star, 
  Play, 
  ChevronDown, 
  AlertTriangle, 
  ExternalLink,
  MessageCircle,
  Compass,
  FileText,
  MapPin,
  HelpCircle,
  X,
  Sparkles,
  SearchCheck,
  Lock,
  LogIn,
  BookOpen,
  Calendar,
  User,
  Tag,
  Menu,
  Gift,
  Share2,
  DollarSign,
  Search,
  Loader2,
  Mail
} from 'lucide-react';
import { buscarEnderecoPorCep, formatarCep } from '../services/cepService';

interface PaginaVendasPublicaProps {
  siteSettings: SiteSettings;
  appSettings: AppSettings;
  onNovoLead?: (lead: Partial<Contact>) => void;
  onVoltarPainel?: () => void;
  onAcessarSistema?: () => void;
  usuarioLogado?: Usuario | null;
  isStandaloneView?: boolean;
}

export const PaginaVendasPublica: React.FC<PaginaVendasPublicaProps> = ({
  siteSettings,
  appSettings,
  onNovoLead,
  onVoltarPainel,
  onAcessarSistema,
  usuarioLogado,
  isStandaloneView = false
}) => {
  const [formNome, setFormNome] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCep, setFormCep] = useState('');
  const [formLogradouro, setFormLogradouro] = useState('');
  const [formNumero, setFormNumero] = useState('');
  const [formBairro, setFormBairro] = useState('');
  const [formCidade, setFormCidade] = useState('');
  const [formTipoImovel, setFormTipoImovel] = useState('Contrato de Gaveta (Sem Escritura)');
  const [formServico, setFormServico] = useState('Usucapião Extrajudicial');
  const [formObservacoes, setFormObservacoes] = useState('');
  const [enviadoSucesso, setEnviadoSucesso] = useState(false);
  const [isBuscandoCep, setIsBuscandoCep] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const handleConsultarCepPublico = async (cepInput?: string) => {
    const rawVal = cepInput || formCep;
    const clean = rawVal.replace(/\D/g, '');
    if (clean.length !== 8) {
      setCepFeedback({ tipo: 'erro', texto: 'Informe os 8 dígitos do CEP.' });
      return;
    }

    setIsBuscandoCep(true);
    setCepFeedback(null);
    try {
      const data = await buscarEnderecoPorCep(clean);
      if (data && (data.cidade || data.logradouro)) {
        if (data.cidade) setFormCidade(`${data.cidade}/${data.uf || 'SP'}`);
        if (data.bairro) setFormBairro(data.bairro);
        if (data.logradouro) setFormLogradouro(data.logradouro);
        setFormCep(data.cep);
        setCepFeedback({
          tipo: 'sucesso',
          texto: `Endereço localizado: ${data.cidade}/${data.uf} (${data.bairro || 'Centro'})`
        });
      } else {
        setCepFeedback({ tipo: 'erro', texto: 'CEP não localizado. Preencha a cidade manualmente.' });
      }
    } catch {
      setCepFeedback({ tipo: 'erro', texto: 'Erro ao buscar CEP. Preencha a cidade manualmente.' });
    } finally {
      setIsBuscandoCep(false);
    }
  };
  
  // Video player modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [modalVideoUrl, setModalVideoUrl] = useState<string>('');
  const [modalVideoTitulo, setModalVideoTitulo] = useState<string>('');
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [artigoLeitura, setArtigoLeitura] = useState<ArtigoBlog | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [indicadorRef, setIndicadorRef] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('indicador');
      if (ref) {
        setIndicadorRef(ref);
      }
    }
  }, []);

  const fonteTitulo = siteSettings.fonte_titulo || appSettings.fonte_titulo || 'Plus Jakarta Sans';
  const fonteCorpo = siteSettings.fonte_corpo || appSettings.fonte_corpo || 'Inter';

  const handleOpenVideo = (url: string, titulo: string) => {
    setModalVideoUrl(url);
    setModalVideoTitulo(titulo);
    setIsVideoModalOpen(true);
  };

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome.trim() || !formTelefone.trim()) return;

    const obsFinal = formObservacoes
      ? (indicadorRef ? `${formObservacoes} [Ref Indicador: ${indicadorRef}]` : formObservacoes)
      : (indicadorRef ? `[Ref Indicador: ${indicadorRef}]` : undefined);

    const cidadeUfParts = formCidade.split('/');
    const cidadeNome = cidadeUfParts[0]?.trim() || formCidade.trim() || 'São Paulo';
    const ufNome = (cidadeUfParts[1]?.trim() || 'SP').toUpperCase().slice(0, 2);

    const leadPayload: Partial<Contact> = {
      id: `ct-${Date.now()}`,
      nome_completo: formNome.trim(),
      telefone_whatsapp: formTelefone.trim(),
      email: formEmail.trim() || undefined,
      tipo_imovel: `${formTipoImovel} - ${cidadeNome}`,
      servico_pretendido: formServico,
      observacoes: obsFinal,
      origem_lead: indicadorRef ? `Indique e Ganhe B2B (${indicadorRef})` : 'Site Oficial (Página de Vendas)',
      indicador_id: indicadorRef || undefined,
      qualificacao_sdr: 'Novo',
      status_cadastro: 'Lead (Novo)',
      endereco: {
        cep: formCep || '01000-000',
        logradouro: formLogradouro || 'Endereço informado no contato comercial',
        numero: formNumero || 'S/N',
        complemento: '',
        bairro: formBairro || '',
        cidade: cidadeNome,
        uf: ufNome
      }
    };

    if (onNovoLead) {
      onNovoLead(leadPayload);
    }

    // Persistência direta redundante no backend Express do ERP
    try {
      fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      }).catch(err => console.warn('Envio redundante api/contacts:', err));

      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('brasil_legal_contacts');
          const list = raw ? JSON.parse(raw) : [];
          list.unshift(leadPayload);
          localStorage.setItem('brasil_legal_contacts', JSON.stringify(list));

          const newDeal = {
            id: `dl-${Date.now()}`,
            contact_id: leadPayload.id,
            titulo: `${leadPayload.servico_pretendido || 'Regularização'} — ${leadPayload.nome_completo}`,
            cliente_nome: leadPayload.nome_completo,
            cartorio_comarca: `${leadPayload.endereco?.cidade || 'São Paulo'} / ${leadPayload.endereco?.uf || 'SP'}`,
            tipo_procedimento: leadPayload.servico_pretendido || 'Regularização Registral',
            status: 'Triagem',
            valor_honorarios_liquido: 12000,
            comissao_b2b_percentual: 5,
            comissao_b2b_valor: 600,
            comissao_paga: false,
            homologado_diretoria: false,
            criado_em: new Date().toISOString()
          };

          const rawDeals = localStorage.getItem('brasil_legal_deals');
          const dealsList = rawDeals ? JSON.parse(rawDeals) : [];
          dealsList.unshift(newDeal);
          localStorage.setItem('brasil_legal_deals', JSON.stringify(dealsList));

          window.dispatchEvent(new CustomEvent('brasil_legal_lead_criado', { detail: leadPayload }));
        } catch (e) {}
      }
    } catch (e) {}

    setEnviadoSucesso(true);
  };

  const handleConcluirRaioX = (leadData: Partial<Contact>) => {
    if (onNovoLead) {
      onNovoLead(leadData);
    }
  };

  // Pop-up Promocional / Campanha de Desconto com Cronômetro
  const [isPopupPromoOpen, setIsPopupPromoOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!siteSettings.popup_promo_ativo) return;

    // Se o visitante já fechou o pop-up nesta sessão, respeita a decisão
    const jaFechou = sessionStorage.getItem('brasil_legal_popup_promo_dismissed');
    if (jaFechou) return;

    const delayMs = Math.max(2, (siteSettings.popup_promo_segundos_delay ?? 6)) * 1000;
    const timer = setTimeout(() => {
      setIsPopupPromoOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [siteSettings.popup_promo_ativo, siteSettings.popup_promo_segundos_delay]);

  const handleClosePopupPromo = () => {
    setIsPopupPromoOpen(false);
    try {
      sessionStorage.setItem('brasil_legal_popup_promo_dismissed', 'true');
    } catch (e) {}
  };

  const corPrimaria = siteSettings.paleta_cores?.primaria || appSettings.cor_primaria || '#2E3192';
  const corSecundaria = siteSettings.paleta_cores?.secundaria || appSettings.cor_secundaria || '#F2EC00';

  const formatWhatsAppUrl = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const whatsappNumber = siteSettings.whatsapp_vendas || appSettings?.whatsapp_suporte || '+55 11 99864-2424';
  const whatsappUrl = formatWhatsAppUrl(
    whatsappNumber,
    'Olá! Acessei o site da Brasil Legal e gostaria de solicitar um diagnóstico gratuito da matrícula do meu imóvel.'
  );

  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#2E3192] selection:text-white" style={{ fontFamily: `"${fonteCorpo}", sans-serif` }}>
      {/* Injeção Dinâmica de Fontes e CSS do CMS */}
      <style>{`
        h1, h2, h3, h4, .font-display {
          font-family: "${fonteTitulo}", sans-serif !important;
        }
        body, p, span, label, input, button {
          font-family: "${fonteCorpo}", sans-serif;
        }
        ${siteSettings.css_customizado || ''}
      `}</style>
      {/* Top Banner if logged in or in standalone preview */}
      {usuarioLogado ? (
        <div className="bg-slate-900 text-white px-3 sm:px-4 py-1.5 text-xs flex items-center justify-between gap-2 border-b border-slate-800 sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2 text-slate-300 text-[11px] sm:text-xs truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">Sessão ativa: <strong>{usuarioLogado.nome}</strong> ({usuarioLogado.cargo})</span>
          </div>
          <button
            type="button"
            onClick={onVoltarPainel || onAcessarSistema}
            className="px-3 py-1 bg-amber-300 hover:bg-amber-400 text-slate-950 font-bold rounded-md text-[11px] flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span>Ir para Painel ERP</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      ) : isStandaloneView && onVoltarPainel ? (
        <div className="bg-slate-950 text-white px-3 sm:px-4 py-2 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-800 sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-semibold text-slate-200 text-[11px] sm:text-xs">
              Modo Visualização ao Vivo da Página de Vendas (Site Público)
            </span>
          </div>
          <button
            type="button"
            onClick={onVoltarPainel}
            className="w-full sm:w-auto px-3 py-1 bg-[#2E3192] hover:bg-[#1E216B] text-[#F2EC00] font-bold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs shrink-0"
          >
            ← Voltar ao Painel Interno
          </button>
        </div>
      ) : null}

      {/* Faixa / Barra Superior de Anúncio no Topo (Opcional & Editável) */}
      {siteSettings.faixa_topo_ativa !== false && siteSettings.faixa_topo_texto && (
        <div className="bg-[#1C1E63] text-white py-1.5 px-3 sm:px-4 text-xs font-medium border-b border-indigo-950/40">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2EC00] animate-pulse shrink-0" />
              <span className="truncate">{siteSettings.faixa_topo_texto}</span>
            </div>
            {siteSettings.faixa_topo_link_texto && (
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-[#F2EC00] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>{siteSettings.faixa_topo_link_texto}</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            )}

            <div className="flex items-center gap-3">
              <RedesSociaisLinks redes={siteSettings.redes_sociais} estilo="header" className="hidden md:flex text-white/80" />
              <a 
                href="#indique-e-ganhe"
                className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1 shrink-0 bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-0.5 rounded-full border border-amber-400/30 transition-colors"
              >
                <Gift className="w-3 h-3 text-amber-300" />
                <span>Indique e Ganhe</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 1. HEADER / NAVBAR DE ALTA CONVERSÃO */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-[4rem] sm:min-h-[4.5rem] py-2 flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo & Marca Superior */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 select-none">
            <a href="#" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
              {siteSettings.logo_principal_url ? (
                <img
                  src={siteSettings.logo_principal_url}
                  alt={siteSettings.topo_texto_titulo || appSettings.app_name || 'Brasil Legal'}
                  style={{ height: `${siteSettings.logo_altura_px || 46}px` }}
                  className="h-10 sm:h-11 md:h-12 w-auto max-w-[180px] sm:max-w-[220px] object-contain block shrink-0 transition-transform group-hover:scale-[1.02]"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.src.includes('/assets/logo-brasil-legal-oficial.png')) {
                      target.src = '/assets/logo-brasil-legal-oficial.png';
                    }
                  }}
                />
              ) : (
                <img
                  src="/assets/logo-brasil-legal-oficial.png"
                  alt="Brasil Legal"
                  className="h-10 sm:h-11 md:h-12 w-auto max-w-[180px] sm:max-w-[220px] object-contain block shrink-0"
                />
              )}

              {/* Texto ao Lado do Logo */}
              {siteSettings.topo_exibir_texto !== false && (siteSettings.topo_texto_titulo !== '' || siteSettings.topo_texto_subtitulo !== '') && (
                <div className="min-w-0 hidden sm:block">
                  <div className="font-extrabold text-slate-900 text-sm sm:text-base lg:text-lg tracking-tight leading-none flex items-center gap-1 sm:gap-1.5 truncate">
                    <span className="truncate">{siteSettings.topo_texto_titulo !== undefined ? siteSettings.topo_texto_titulo : (appSettings.app_name || 'BRASIL LEGAL')}</span>
                    {(siteSettings.topo_texto_tag !== undefined ? siteSettings.topo_texto_tag : 'REGULARIZAÇÃO') && (
                      <span 
                        className="hidden md:inline-block text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0"
                        style={{ backgroundColor: corSecundaria, color: corPrimaria }}
                      >
                        {siteSettings.topo_texto_tag !== undefined ? siteSettings.topo_texto_tag : 'REGULARIZAÇÃO'}
                      </span>
                    )}
                  </div>
                  {(siteSettings.topo_texto_subtitulo !== undefined ? siteSettings.topo_texto_subtitulo : 'Advocacia Registral & Engenharia Legal') && (
                    <p className="text-[9px] sm:text-[10px] font-semibold text-slate-500 tracking-wide mt-0.5 hidden md:block truncate">
                      {siteSettings.topo_texto_subtitulo !== undefined ? siteSettings.topo_texto_subtitulo : 'Advocacia Registral & Engenharia Legal'}
                    </p>
                  )}
                </div>
              )}
            </a>
          </div>

          {/* Nav Links (Desktop) - Moderno, Harmônico e Responsivo */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-[13px] font-medium text-slate-600 shrink-0">
            <a 
              href="#raio-x" 
              className="px-2.5 py-1.5 rounded-lg font-semibold text-[#2E3192] hover:text-[#1C1E63] hover:bg-indigo-50/70 transition-all shrink-0"
            >
              Raio-X
            </a>
            <a 
              href="#servicos" 
              className="px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-[#2E3192] hover:bg-slate-100/80 transition-all shrink-0"
            >
              Serviços
            </a>
            <a 
              href="#casos-reais" 
              className="px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-[#2E3192] hover:bg-slate-100/80 transition-all shrink-0"
            >
              Casos Reais
            </a>
            <a 
              href="#faq" 
              className="px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-[#2E3192] hover:bg-slate-100/80 transition-all shrink-0"
            >
              Dúvidas
            </a>
            <a 
              href="#galeria-videos" 
              className="px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-[#2E3192] hover:bg-slate-100/80 transition-all shrink-0"
            >
              Vídeos
            </a>
            <a 
              href="#depoimentos" 
              className="px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-[#2E3192] hover:bg-slate-100/80 transition-all shrink-0"
            >
              Depoimentos
            </a>
            <a 
              href="#blog" 
              className="px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-[#2E3192] hover:bg-slate-100/80 transition-all shrink-0"
            >
              Blog
            </a>
            <a 
              href="#area-cliente" 
              className="hidden 2xl:inline-block px-2.5 py-1.5 rounded-lg text-[#2E3192] font-semibold hover:bg-indigo-50/80 transition-all shrink-0"
            >
              Área do Cliente
            </a>
          </nav>

          {/* Quick CTA Actions & Mobile Button */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200/80 px-3 py-2 rounded-xl transition-all shrink-0"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="hidden xl:inline">WhatsApp</span>
            </a>

            {/* Botão de Acesso ao Sistema / Área Restrita */}
            {usuarioLogado ? (
              <button
                type="button"
                onClick={onVoltarPainel || onAcessarSistema}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-slate-700 active:scale-95 shrink-0"
                title="Acessar o Painel Operacional ERP"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Painel</span>
                <span>ERP</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
              </button>
            ) : onAcessarSistema ? (
              <button
                type="button"
                onClick={onAcessarSistema}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer border border-slate-200 shadow-2xs active:scale-95 shrink-0"
                title="Acesso Restrito a Colaboradores e Parceiros"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="hidden sm:inline">Acesso ERP</span>
                <span className="sm:hidden">Login</span>
              </button>
            ) : null}

            <a
              href="#diagnostico"
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold rounded-xl text-white shadow-xs hover:opacity-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
              style={{ backgroundColor: corPrimaria }}
            >
              <span className="hidden sm:inline">Diagnóstico Gratuito</span>
              <span className="sm:hidden">Diagnóstico</span>
            </a>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-800" />
              ) : (
                <Menu className="w-5 h-5 text-slate-800" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 shadow-xl space-y-3 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 text-sm text-slate-700 font-medium">
              <a
                href="#raio-x"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-50/70 text-[#2E3192] font-semibold hover:bg-indigo-100/70 transition-colors flex items-center justify-between"
              >
                <span>Raio-X</span>
                <ArrowRight className="w-4 h-4 text-[#2E3192]" />
              </a>
              <a
                href="#servicos"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <span>Serviços</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#casos-reais"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <span>Casos Reais</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <span>Dúvidas</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#galeria-videos"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <span>Vídeos</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#depoimentos"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <span>Depoimentos</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#blog"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <span>Blog</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#indique-e-ganhe"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl text-amber-800 hover:bg-amber-50/70 transition-colors flex items-center justify-between font-semibold"
              >
                <span>Indique e Ganhe</span>
                <ArrowRight className="w-4 h-4 text-amber-700" />
              </a>
              <a
                href="#area-cliente"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3.5 py-2.5 rounded-xl text-[#2E3192] hover:bg-indigo-50/70 transition-colors flex items-center justify-between font-semibold"
              >
                <span>Área do Cliente</span>
                <ArrowRight className="w-4 h-4 text-[#2E3192]" />
              </a>
            </nav>

            <div className="pt-2 border-t border-slate-200 space-y-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Atendimento via WhatsApp</span>
              </a>

              <a
                href="#diagnostico"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer text-white shadow-xs"
                style={{ backgroundColor: corPrimaria }}
              >
                <span>Diagnóstico Registral Gratuito</span>
              </a>

              {usuarioLogado ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onVoltarPainel) onVoltarPainel();
                    else if (onAcessarSistema) onAcessarSistema();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Painel Administrativo ERP</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ) : onAcessarSistema ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onAcessarSistema();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer bg-slate-50"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Acesso Restrito ERP</span>
                </button>
              ) : null}
            </div>
          </div>
        )}
      </header>

      {/* Banner Informativo quando acessado via link de indicação do parceiro */}
      {indicadorRef && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-inner border-b border-amber-600">
          <Gift className="w-4 h-4 text-slate-900 shrink-0" />
          <span>
            Indicação Especial de Parceiro Homologado: <strong className="font-mono bg-white/40 px-1.5 py-0.5 rounded">{indicadorRef}</strong>. Seu diagnóstico registral terá prioridade na análise cartorária!
          </span>
        </div>
      )}

      {/* 2. HERO SECTION VENDEDORA COM PROVA SOCIAL E CAPTURA IMEDIATA */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-[#1c1e63] text-white pt-12 pb-20 px-4 sm:px-6">
        {/* Background Image Overlay */}
        {siteSettings.banner_hero_url && (
          <div 
            className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none mix-blend-luminosity"
            style={{ backgroundImage: `url(${siteSettings.banner_hero_url})` }}
          />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(#F2EC00_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold text-slate-200 mb-6">
            <span className="flex text-amber-400">
              {'★★★★★'}
            </span>
            <span>Milhares de imóveis regularizados • Resposta rápida em até 4 minutos</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Sales Copy */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight font-display text-white">
                {siteSettings.secao_hero_titulo || 'Seu imóvel 100% legalizado com escrituração direto no cartório'}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
                {siteSettings.secao_hero_subtitulo || 'Transforme contrato de gaveta, posse antiga ou lote irregular em matrícula registrada. Procedimento 100% extrajudicial perante o Cartório de Registro de Imóveis, sem processos judiciais lentos.'}
              </p>

              {/* High-Converting Benefit Bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-xs text-white font-bold">Direto no cartório (CNJ 65)</strong>
                    <span className="text-[11px] text-slate-300">Sem audiências judiciais e sem anos de espera.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-xs text-white font-bold">Valorização de até 50%</strong>
                    <span className="text-[11px] text-slate-300">Aceita financiamento Caixa, Itaú e Bradesco.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-xs text-white font-bold">Topografia e drone RTK</strong>
                    <span className="text-[11px] text-slate-300">Medição milimétrica com emissão de ART/CREA.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-xs text-white font-bold">Auditoria de matrícula por IA</strong>
                    <span className="text-[11px] text-slate-300">Diagnóstico de viabilidade em poucos minutos.</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
                <a
                  href="#raio-x"
                  className="px-6 py-3.5 text-sm font-bold rounded-xl text-slate-950 text-center shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer font-display"
                  style={{ backgroundColor: corSecundaria }}
                >
                  <Sparkles className="w-4 h-4 text-slate-900" />
                  Fazer Raio-X do imóvel (diagnóstico)
                </a>

                <a
                  href="#diagnostico"
                  className="px-5 py-3.5 text-sm font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xs"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Contato direto com advogado
                </a>

                <button
                  type="button"
                  onClick={() => handleOpenVideo(
                    siteSettings.video_url || '',
                    siteSettings.video_titulo || 'Vídeo Explicativo: Regularização Extrajudicial em Cartório'
                  )}
                  className="px-4 py-3.5 text-sm font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xs"
                >
                  <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Ver Vídeo (2 min)
                </button>
              </div>

              {/* Cidades com Atendimento Prioritário (SEO Local) */}
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300">
                <span className="font-semibold text-amber-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Atendimento Especializado:
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded-full border border-white/15">Caieiras</span>
                <span className="bg-white/10 px-2 py-0.5 rounded-full border border-white/15">Franco da Rocha</span>
                <span className="bg-white/10 px-2 py-0.5 rounded-full border border-white/15">Francisco Morato</span>
                <span className="bg-white/10 px-2 py-0.5 rounded-full border border-white/15">Cajamar</span>
                <span className="bg-white/10 px-2 py-0.5 rounded-full border border-white/15">Mairiporã</span>
                <span className="bg-white/10 px-2 py-0.5 rounded-full border border-white/15">Grande SP & Litoral</span>
              </div>

              {/* Link Direto para o Programa Indique e Ganhe no Hero */}
              <div className="pt-1">
                <a
                  href="#indique-e-ganhe"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 hover:text-amber-200 text-xs font-semibold transition-all shadow-xs"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  <span>Conheça nosso <strong>Programa Indique e Ganhe</strong>: comissão de até 10% por imóvel regularizado →</span>
                </a>
              </div>
            </div>

            {/* Right Column: Mini Lead Capture Box */}
            <div className="lg:col-span-5" id="diagnostico-hero">
              <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-7 shadow-2xl border-4 border-amber-300/30 relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E3192]">
                    Diagnóstico Registral Preliminar
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 leading-snug">
                  Descubra a viabilidade de escriturar seu imóvel
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Nossos advogados analisam a documentação do seu imóvel sem custo.
                </p>

                {enviadoSucesso ? (
                  <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-5 rounded-xl space-y-3 text-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm">Solicitação recebida com sucesso!</h4>
                    <p className="text-xs text-slate-600">
                      Nosso time comercial e técnico entrará em contato via WhatsApp em até <strong>4 minutos</strong>.
                    </p>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Falar imediatamente no WhatsApp
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitLead} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Seu nome completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formNome}
                        onChange={(e) => setFormNome(e.target.value)}
                        placeholder="Ex: João Roberto da Silva"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192] bg-slate-50"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          WhatsApp (DDD) *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formTelefone}
                          onChange={(e) => setFormTelefone(e.target.value)}
                          placeholder="(11) 99999-9999"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192] bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>CEP do imóvel</span>
                          {isBuscandoCep && <Loader2 className="w-3 h-3 animate-spin text-[#2E3192]" />}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            maxLength={9}
                            value={formCep}
                            onChange={(e) => {
                              const formatted = formatarCep(e.target.value);
                              setFormCep(formatted);
                              const clean = e.target.value.replace(/\D/g, '');
                              if (clean.length === 8) {
                                handleConsultarCepPublico(clean);
                              } else {
                                setCepFeedback(null);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleConsultarCepPublico();
                              }
                            }}
                            placeholder="00000-000"
                            className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192] bg-slate-50"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Cidade / UF
                        </label>
                        <input
                          type="text"
                          value={formCidade}
                          onChange={(e) => setFormCidade(e.target.value)}
                          placeholder="Ex: Campinas/SP"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192] bg-slate-50"
                        />
                      </div>
                    </div>

                    {cepFeedback && (
                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-medium flex items-center gap-1.5 animate-in fade-in ${
                        cepFeedback.tipo === 'sucesso'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {cepFeedback.tipo === 'sucesso' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                        <span>{cepFeedback.texto}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Qual a situação atual do imóvel?
                      </label>
                      <select
                        value={formTipoImovel}
                        onChange={(e) => setFormTipoImovel(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192] bg-slate-50"
                      >
                        <option value="Contrato de Gaveta (Sem Escritura)">Contrato de gaveta (sem escritura registrada)</option>
                        <option value="Posse Antiga (+5 ou +10 anos)">Posse mansa antiga (+5 ou +10 anos)</option>
                        <option value="Loteamento / Gleba Irregular">Loteamento ou gleba não desmembrada</option>
                        <option value="Inventário Travado / Falecimento">Inventário travado por falta de escritura</option>
                        <option value="Construção não Averbada (Habite-se)">Construção / reforma não averbada na matrícula</option>
                        <option value="Outra Pendência Registral">Outra situação cartorária</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-display"
                      style={{ backgroundColor: corPrimaria }}
                    >
                      <Send className="w-3.5 h-3.5" style={{ color: corSecundaria }} />
                      Analisar meu imóvel gratuitamente
                    </button>

                    <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      Sigilo e proteção total de dados patrimoniais sob confidencialidade e LGPD.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Mini Stats Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                Milhares
              </div>
              <div className="text-xs text-slate-400 mt-0.5">De imóveis legalizados</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold font-display" style={{ color: corSecundaria }}>
                Milhões
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Em patrimônio protegido</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                &lt; 4 min
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Tempo médio de atendimento</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
                100%
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Procedimento extrajudicial</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BANNER DE ALERTA (DOR & URGÊNCIA) */}
      <section className="bg-amber-500 text-slate-950 py-5 px-4 sm:px-6 shadow-inner border-y border-amber-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                {siteSettings.banner_alerta_titulo || 'Cuidado: imóvel sem escritura definitiva perde até 50% do valor de mercado'}
              </h4>
              <p className="text-xs text-slate-900 font-medium">
                {siteSettings.banner_alerta_subtitulo || 'Imóveis irregulares não aceitam financiamento bancário pela Caixa, Bradesco ou Itaú, correm risco de penhora por dívidas de antigos donos e geram inventários litigiosos caros.'}
              </p>
            </div>
          </div>

          <a
            href="#diagnostico"
            className="px-4 py-2 bg-slate-950 text-white hover:bg-slate-900 font-bold text-xs rounded-xl shadow transition-all shrink-0 flex items-center gap-1.5"
          >
            Regularizar agora
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </a>
        </div>
      </section>

      {/* SEÇÃO RAIO-X DO IMÓVEL (DIAGNÓSTICO INTERATIVO MULTI-ETAPAS) */}
      <section id="raio-x" className="py-20 px-4 sm:px-6 bg-slate-900 text-white relative overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 bg-[radial-gradient(#F2EC00_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Diagnóstico inteligente e gratuito
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-display">
              Raio-X do Imóvel
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Faça um diagnóstico inteligente em 7 etapas rápidas e descubra a rota exata para obter a escritura definitiva do seu imóvel.
            </p>
          </div>
          <RaioXImovel 
            id="raio-x-form"
            onConcluirLead={handleConcluirRaioX}
            whatsappNumero={whatsappNumber}
            mensagemPadraoWhatsapp={siteSettings.mensagem_padrao_whatsapp}
          />
        </div>
      </section>

      {/* SEÇÃO DE DORES & SITUAÇÕES COMUNS */}
      <SecaoProblemas 
        onSelecionarProblema={(prob) => {
          setFormTipoImovel(prob);
          const el = document.getElementById('raio-x');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* SEÇÃO DE TRANSFORMAÇÃO (ANTES VS DEPOIS) */}
      <SecaoTransformacao />

      {/* SEÇÃO COMO FUNCIONA (O MÉTODO INTEGRADO) */}
      <SecaoComoFunciona />

      {/* SEÇÃO DIFERENCIAIS & VALORIZAÇÃO */}
      <SecaoDiferenciaisValorizacao />

      {/* SEÇÃO CASOS REAIS DE SUCESSO (CMS) */}
      <SecaoCasosReais casos={siteSettings.casos_reais} />

      {/* 4. SEÇÃO DE VÍDEO EXPLICATIVO (COMO FUNCIONA) */}
      <section id="video-explicativo" className="py-16 px-4 sm:px-6 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E3192] bg-indigo-50 px-3 py-1 rounded-full">
              Vídeo Explicativo
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              {siteSettings.video_titulo || 'Como funciona a regularização extrajudicial em cartório'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {siteSettings.video_subtitulo || 'Entenda em 2 minutos como a legislação moderna permite obter sua matrícula sem passar por longos processos na Justiça.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Video Player Card */}
            <div className="lg:col-span-7">
              {(() => {
                const videoEmbedData = getEmbedVideoUrl(siteSettings.video_url || '');
                const posterImg = siteSettings.video_poster_url || videoEmbedData.thumbnailUrl;
                return (
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 aspect-video bg-slate-950 group">
                    {posterImg ? (
                      <img
                        src={posterImg}
                        alt="Vídeo Explicativo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-indigo-950 flex items-center justify-center">
                        <Play className="w-16 h-16 text-[#F2EC00]/40" />
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    <div 
                      onClick={() => handleOpenVideo(
                        siteSettings.video_url || '',
                        siteSettings.video_titulo || 'Vídeo Explicativo: Regularização Extrajudicial'
                      )}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 hover:bg-black/30 transition-colors cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#2E3192] text-[#F2EC00] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 fill-[#F2EC00] ml-1" />
                      </div>
                      <span className="mt-3 text-xs font-bold text-white tracking-wide uppercase bg-black/60 px-3 py-1 rounded-full">
                        Assistir Apresentação (2:30 min)
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Steps Guide alongside Video */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#2E3192]" />
                Os 3 Passos da Regularização Ágil
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#2E3192] text-white text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <strong className="text-xs text-slate-900">Auditoria Documental & IA Registral</strong>
                  </div>
                  <p className="text-[11px] text-slate-600 pl-7">
                    Levantamos a certidão vintenária e a cadeia dominial para atestar a viabilidade e escolher o rito ideal (Usucapião ou Adjudicação).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#2E3192] text-white text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <strong className="text-xs text-slate-900">Topografia GNSS RTK & Planta Cadastral</strong>
                  </div>
                  <p className="text-[11px] text-slate-600 pl-7">
                    Nossos engenheiros produzem o memorial descritivo com georreferenciamento milimétrico e coletam as anuências de confrontantes.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#2E3192] text-white text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <strong className="text-xs text-slate-900">Protocolo & Registro no Cartório de Imóveis</strong>
                  </div>
                  <p className="text-[11px] text-slate-600 pl-7">
                    Acompanhamento diário das notas de exigência até a abertura ou retificação da sua matrícula definitiva.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="#diagnostico"
                  className="w-full py-2.5 px-4 bg-[#2E3192] hover:bg-[#1E216B] text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2 transition-all"
                >
                  Quero Iniciar o Meu Passo 1
                  <ArrowRight className="w-3.5 h-3.5 text-[#F2EC00]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO GALERIA DE VÍDEOS (CMS) */}
      <SecaoGaleriaVideos 
        videos={siteSettings.galeria_videos} 
        onOpenVideo={handleOpenVideo} 
      />

      {/* 5. QUEM SOMOS & AUTORIDADE INSTITUCIONAL */}
      <section id="quem-somos" className="py-16 px-4 sm:px-6 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Image / Credentials Grid */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-white">
                {siteSettings.quem_somos_imagem_url ? (
                  <img
                    src={siteSettings.quem_somos_imagem_url}
                    alt="Corpo Técnico Brasil Legal"
                    className="w-full h-80 object-cover"
                  />
                ) : (
                  <div className="w-full h-80 bg-slate-200 flex items-center justify-center text-slate-400">
                    Foto da Sede & Equipe
                  </div>
                )}
              </div>

              {/* Floating Credential Card */}
              <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:right-4 bg-white p-4 rounded-xl shadow-lg border border-slate-200 w-full sm:max-w-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-5 h-5 text-[#2E3192]" />
                  <span className="text-xs font-extrabold text-slate-900">Credenciamento Oficial</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {siteSettings.responsavel_tecnico || 'Corpo Técnico Especializado • Engenharia Legal & Direito Registral • Membro do IRIB.'}
                </p>
              </div>
            </div>

            {/* Copy / Mission */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E3192] bg-indigo-50 px-3 py-1 rounded-full">
                Quem Somos & Infraestrutura
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                {siteSettings.quem_somos_titulo || 'Autoridade técnica em advocacia registral e engenharia fundiária'}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {siteSettings.quem_somos_descricao || 'A Brasil Legal nasceu da integração de juristas especialistas em Direito Notarial e Registral e engenheiros agrimensores credenciados pelo INCRA e CREA. Operamos com tecnologia de ponta perante os Cartórios de Registro de Imóveis.'}
              </p>

              {/* 4 Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <Shield className="w-4 h-4 text-[#2E3192]" />
                    Segurança Jurídica Total
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Peças técnicas e memoriais rigorosamente em conformidade com as Normas da Corregedoria Geral da Justiça.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <Compass className="w-4 h-4 text-[#2E3192]" />
                    Tecnologia Topográfica RTK
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Levantamentos aéreos com drones e estações totais com tolerância milimétrica.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <Clock className="w-4 h-4 text-[#2E3192]" />
                    Pontualidade & Agilidade
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Cumprimento rigoroso de prazos cartorários para evitar preclusão ou atraso na entrega da matrícula.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                    <Users className="w-4 h-4 text-[#2E3192]" />
                    Rede B2B Integrada
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Parceria com mais de 350 corretores e imobiliárias em todo o território paulista.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Galeria do Nosso Time & Especialistas */}
          {siteSettings.equipe_exibir !== false && siteSettings.equipe_membros && siteSettings.equipe_membros.length > 0 && (
            <div className="mt-14 pt-10 border-t border-slate-200/80">
              <div className="text-center max-w-2xl mx-auto mb-8 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E3192] bg-indigo-50 px-3 py-1 rounded-full">
                  Nosso Corpo Técnico
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                  {siteSettings.equipe_titulo || 'Conheça os especialistas que cuidam do seu imóvel'}
                </h3>
                <p className="text-xs text-slate-500">
                  {siteSettings.equipe_subtitulo || 'Advogados pós-graduados em direito notarial e engenheiros agrimensores credenciados pelo INCRA.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {siteSettings.equipe_membros.map((membro) => (
                  <div
                    key={membro.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col group"
                  >
                    <div className="flex items-center gap-3.5 mb-3.5">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-indigo-100 shadow-xs bg-slate-100">
                        <img
                          src={membro.foto_url || (
                            membro.id === 'eq-2' ? '/team/talita-hernandez.jpg' :
                            membro.id === 'eq-3' ? '/team/elisangela-cruz.jpg' :
                            membro.id === 'eq-4' ? '/team/dr-rafael-barbosa.jpg' :
                            '/team/emerson-carneiro.jpg'
                          )}
                          alt={membro.nome}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            const fallback = membro.id === 'eq-2' ? '/team/talita-hernandez.jpg' :
                              membro.id === 'eq-3' ? '/team/elisangela-cruz.jpg' :
                              membro.id === 'eq-4' ? '/team/dr-rafael-barbosa.jpg' :
                              '/team/emerson-carneiro.jpg';
                            if (!target.src.endsWith(fallback)) {
                              target.src = fallback;
                            }
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">
                          {membro.nome}
                        </h4>
                        <p className="text-xs text-[#2E3192] font-semibold mt-0.5 line-clamp-2">
                          {membro.cargo}
                        </p>
                        {membro.oab_crea && (
                          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-[#2E3192] border border-indigo-100">
                            {membro.oab_crea}
                          </span>
                        )}
                      </div>
                    </div>

                    {membro.bio && (
                      <p className="text-xs text-slate-600 leading-relaxed flex-1 italic mb-3">
                        "{membro.bio}"
                      </p>
                    )}

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                      {membro.email ? (
                        <div className="flex items-center gap-1.5 font-mono truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{membro.email}</span>
                        </div>
                      ) : <span />}
                      {membro.linkedin && (
                        <a
                          href={membro.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2E3192] hover:underline shrink-0 text-[10px] font-bold"
                          title="Ver Perfil"
                        >
                          LinkedIn →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. CATÁLOGO DE SERVIÇOS VENDEDORES */}
      <section id="servicos" className="py-16 px-4 sm:px-6 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E3192] bg-indigo-50 px-3 py-1 rounded-full">
              Nossas Soluções Registrais
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Soluções sob medida para a situação do seu imóvel
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clique no procedimento desejado para simular o diagnóstico com nossos especialistas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {siteSettings.servicos_catalogo.map((servico) => (
              <div
                key={servico.id}
                className="bg-slate-50 hover:bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#2E3192]/40 hover:shadow-lg transition-all space-y-3 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#2E3192] text-[#F2EC00] flex items-center justify-center font-bold mb-3 shadow-xs">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#2E3192] transition-colors">
                    {servico.nome}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    {servico.descricao}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  {servico.prazo_medio && (
                    <span className="text-[11px] text-slate-500 font-medium">
                      Prazo: <strong className="text-slate-800">{servico.prazo_medio}</strong>
                    </span>
                  )}
                  <a
                    href="#diagnostico"
                    onClick={() => {
                      setFormServico(servico.nome);
                    }}
                    className="text-xs font-bold text-[#2E3192] hover:underline flex items-center gap-1"
                  >
                    Consultar
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. DEPOIMENTOS REAIS / PROVA SOCIAL */}
      <section id="depoimentos" className="py-16 px-4 sm:px-6 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Prova Social & Casos Reais
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              O que dizem nossos clientes regularizados
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Depoimentos reais de proprietários que transformaram posse em escritura registrada.
            </p>
            {siteSettings.video_secundario_url && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenVideo(
                    siteSettings.video_secundario_url || '',
                    'Depoimentos em Vídeo: Histórias de Sucesso'
                  )}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#2E3192] text-white text-xs font-bold rounded-full shadow hover:bg-opacity-90 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-[#F2EC00] text-[#F2EC00]" />
                  Assistir Depoimentos em Vídeo
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(siteSettings.depoimentos || []).map((dep) => (
              <div
                key={dep.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Rating Stars and Valorization Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400">
                      {'★'.repeat(dep.estrelas)}
                    </div>
                    {dep.valorizacao && (
                      <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {dep.valorizacao}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    "{dep.texto}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    {dep.foto_url ? (
                      <img
                        src={dep.foto_url}
                        alt={dep.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-xs">
                        {dep.nome.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{dep.nome}</div>
                    <div className="text-[10px] text-slate-500">{dep.cidade_uf}</div>
                    <div className="text-[10px] text-[#2E3192] font-semibold">{dep.tipo_imovel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7.5 SEÇÃO INDIQUE E GANHE — PROGRAMA DE PARCERIA B2B */}
      <section id="indique-e-ganhe" className="py-16 px-4 sm:px-6 bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
        <div className="max-w-6xl mx-auto space-y-10 relative z-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span 
              className="text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm"
              style={{ backgroundColor: corSecundaria, color: corPrimaria }}
            >
              <Gift className="w-3.5 h-3.5" />
              Programa Indique e Ganhe B2B
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display leading-tight">
              Indique imóveis irregulares e ganhe até <span style={{ color: corSecundaria }}>5% a 10%</span> de comissão
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Você é corretor de imóveis, imobiliária, engenheiro, arquiteto, advogado ou conhece proprietários com imóveis sem escritura? Torne-se um parceiro credenciado e monetize suas indicações com total transparência jurídica.
            </p>
          </div>

          {/* 4 Cards de Perfis de Parceiros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-xs p-5 rounded-2xl border border-white/15 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Corretores & Imobiliárias</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Desbloqueie imóveis com pendência de inventário, promessa antiga ou falta de habite-se para fechar vendas que estavam travadas.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-5 rounded-2xl border border-white/15 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-400/20 text-blue-400 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Engenheiros & Arquitetos</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Una seus projetos, plantas e laudos topográficos ao nosso suporte notarial em cartório, recebendo comissões diretas.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-5 rounded-2xl border border-white/15 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Advogados & Parceiros</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Atuação em parceria para usucapião extrajudicial e regularizações com divisão transparente de honorários.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-5 rounded-2xl border border-white/15 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-400/20 text-purple-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Amigos & Síndicos</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Conhece vizinhos com imóveis em posse ou lotes irregulares? Indique e acompanhe tudo online com Pix garantido.
              </p>
            </div>
          </div>

          {/* 3 Passos do Fluxo */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
            <h3 className="text-base sm:text-lg font-bold text-center text-white mb-6">
              Como Funciona o Programa de Indicação:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div 
                  className="w-9 h-9 rounded-full font-black flex items-center justify-center mx-auto text-sm"
                  style={{ backgroundColor: corSecundaria, color: corPrimaria }}
                >
                  1
                </div>
                <h4 className="font-bold text-sm text-white">Link Exclusivo ou Indicação</h4>
                <p className="text-xs text-slate-300">
                  Receba seu link personalizado ou envie o contato do cliente pelo formulário para vincular o lead ao seu cadastro.
                </p>
              </div>

              <div className="space-y-2">
                <div 
                  className="w-9 h-9 rounded-full font-black flex items-center justify-center mx-auto text-sm"
                  style={{ backgroundColor: corSecundaria, color: corPrimaria }}
                >
                  2
                </div>
                <h4 className="font-bold text-sm text-white">Análise & Regularização em Cartório</h4>
                <p className="text-xs text-slate-300">
                  Nossa equipe de advogados e engenheiros faz a triagem gratuita, elabora a peça técnica e protocola o processo registral.
                </p>
              </div>

              <div className="space-y-2">
                <div 
                  className="w-9 h-9 rounded-full font-black flex items-center justify-center mx-auto text-sm"
                  style={{ backgroundColor: corSecundaria, color: corPrimaria }}
                >
                  3
                </div>
                <h4 className="font-bold text-sm text-white">Comissão Paga via Pix</h4>
                <p className="text-xs text-slate-300">
                  Com o contrato homologado e honorários recebidos, o repasse de 5% a 10% é creditado diretamente na sua chave Pix com extrato online.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: corSecundaria, color: corPrimaria }}
              >
                <Gift className="w-4 h-4" />
                Quero ser um Parceiro Indicador
              </a>

              {onAcessarSistema && (
                <button
                  type="button"
                  onClick={onAcessarSistema}
                  className="w-full sm:w-auto px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#F2EC00]" />
                  Já sou Parceiro: Acessar Portal B2B
                </button>
              )}

              <a
                href="#diagnostico"
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                Indicar um Imóvel Agora
                <ArrowRight className="w-4 h-4 text-[#2E3192]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FORMULÁRIO DE DIAGNÓSTICO INTEGRADO */}
      <section id="diagnostico" className="py-16 px-4 sm:px-6 bg-gradient-to-br from-[#1C1E63] to-[#2E3192] text-white">
        <div className="max-w-4xl mx-auto text-center space-y-3 mb-8">
          <span 
            className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full inline-block"
            style={{ backgroundColor: corSecundaria, color: corPrimaria }}
          >
            Avaliação Gratuita da Matrícula
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
            Solicite sua análise registral em menos de 4 minutos
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto">
            Preencha os dados abaixo. Nossos especialistas jurídicos e engenheiros farão a triagem preliminar e responderão com o diagnóstico da viabilidade do seu registro.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl">
          {enviadoSucesso ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Diagnóstico Solicitado com Sucesso!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Nossa equipe técnica já recebeu as informações e está consultando a base de dados cartorária. O retorno ocorrerá no número informado.
              </p>
              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  Abrir Conversa Direta no WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitLead} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={formTelefone}
                    onChange={(e) => setFormTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail (opcional)</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>CEP do Imóvel</span>
                    {isBuscandoCep && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2E3192]" />}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={9}
                      value={formCep}
                      onChange={(e) => {
                        const formatted = formatarCep(e.target.value);
                        setFormCep(formatted);
                        const clean = e.target.value.replace(/\D/g, '');
                        if (clean.length === 8) {
                          handleConsultarCepPublico(clean);
                        } else {
                          setCepFeedback(null);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleConsultarCepPublico();
                        }
                      }}
                      placeholder="00000-000"
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cidade e Bairro do Imóvel</label>
                  <input
                    type="text"
                    value={formCidade}
                    onChange={(e) => setFormCidade(e.target.value)}
                    placeholder="Ex: Campinas - Jd. Alvorada"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                  />
                </div>
              </div>

              {cepFeedback && (
                <div className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 animate-in fade-in ${
                  cepFeedback.tipo === 'sucesso'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {cepFeedback.tipo === 'sucesso' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{cepFeedback.texto}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Situação do Imóvel</label>
                  <select
                    value={formTipoImovel}
                    onChange={(e) => setFormTipoImovel(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                  >
                    <option value="Contrato de Gaveta">Contrato de Gaveta</option>
                    <option value="Posse Mansa Antiga">Posse Mansa Antiga</option>
                    <option value="Lote sem Escritura Individual">Lote sem Escritura Individual</option>
                    <option value="Inventário Familiar">Inventário Familiar</option>
                    <option value="Construção não Averbada">Construção não Averbada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Serviço de Interesse</label>
                  <select
                    value={formServico}
                    onChange={(e) => setFormServico(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                  >
                    <option value="Usucapião Extrajudicial">Usucapião Extrajudicial</option>
                    <option value="Adjudicação Compulsória">Adjudicação Compulsória</option>
                    <option value="Desdobro ou Remembramento">Desdobro ou Remembramento</option>
                    <option value="Retificação de Área e Georreferenciamento">Retificação de Área e Georreferenciamento</option>
                    <option value="Regularização Fundiária (REURB)">Regularização Fundiária (REURB)</option>
                    <option value="Averbação de Construção (Habite-se)">Averbação de Construção (Habite-se)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detalhes adicionais (tempo de posse, nome do loteador, etc.)
                </label>
                <textarea
                  rows={3}
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  placeholder="Conte resumidamente a história do imóvel..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#2E3192]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl text-slate-950 font-bold text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer font-display"
                style={{ backgroundColor: corSecundaria }}
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                Receber Diagnóstico Registral Gratuito
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 9. PERGUNTAS FREQUENTES (FAQ ACCORDION) */}
      <section id="faq" className="py-16 px-4 sm:px-6 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E3192] bg-indigo-50 px-3 py-1 rounded-full">
              Dúvidas Comuns
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
              Perguntas frequentes sobre regularização em cartório
            </h2>
          </div>

          <div className="space-y-3">
            {(siteSettings.faq_itens || []).map((faq) => {
              const isOpen = activeFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-slate-50"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#2E3192] shrink-0" />
                      {faq.pergunta}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="p-4 pt-1 text-xs text-slate-600 bg-white border-t border-slate-200 leading-relaxed">
                      {faq.resposta}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. ÁREA DO CLIENTE - ACOMPANHAMENTO DO PROCESSO */}
      {(siteSettings.area_cliente_ativo ?? true) && (
        <section id="area-cliente" className="py-16 px-4 sm:px-6 bg-slate-100 border-b border-slate-200">
          <div className="max-w-5xl mx-auto">
            <AreaClientePortal siteSettings={siteSettings} />
          </div>
        </section>
      )}

      {/* 10.5. BLOG & CONHECIMENTO REGISTRAL */}
      {(siteSettings.blog_exibir !== false && (siteSettings.artigos_blog || []).filter(a => a.publicado).length > 0) && (
        <section id="blog" className="py-16 px-4 sm:px-6 bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#2E3192] bg-indigo-50 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#2E3192]" />
                Blog & Conhecimento Notarial
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
                {siteSettings.blog_titulo || 'Blog e conhecimento notarial'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {siteSettings.blog_subtitulo || 'Artigos técnicos, novidades regulatórias e guias práticos sobre regularização imobiliária, usucapião e direito registral.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(siteSettings.artigos_blog || []).filter(a => a.publicado).map((artigo) => (
                <div
                  key={artigo.id}
                  onClick={() => setArtigoLeitura(artigo)}
                  className="bg-slate-50 rounded-2xl border border-slate-200 hover:border-[#2E3192]/40 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="relative h-48 w-full bg-slate-200 overflow-hidden">
                      <img
                        src={artigo.imagem_capa || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80'}
                        alt={artigo.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-[#2E3192] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded shadow-sm">
                          {artigo.categoria}
                        </span>
                        {artigo.destaque && (
                          <span className="bg-[#F2EC00] text-[#2E3192] text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Destaque
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {artigo.data_publicacao}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {artigo.tempo_leitura_min} min de leitura
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-[#2E3192] transition-colors leading-snug line-clamp-2 font-display">
                        {artigo.titulo}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {artigo.resumo}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white border-t border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {artigo.autor.foto_url ? (
                        <img
                          src={artigo.autor.foto_url}
                          alt={artigo.autor.nome}
                          className="w-7 h-7 rounded-full object-cover border border-slate-300 shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-[11px] font-bold text-slate-800 truncate">{artigo.autor.nome}</p>
                        <p className="text-[9px] text-slate-400 truncate">{artigo.autor.cargo}</p>
                      </div>
                    </div>

                    <span className="text-xs font-bold text-[#2E3192] flex items-center gap-1 shrink-0 group-hover:translate-x-1 transition-transform">
                      Ler <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 11. FOOTER INSTITUCIONAL CONFIGURÁVEL */}
      {(siteSettings.rodape_exibir ?? true) && (
        <footer className="bg-slate-950 text-white pt-12 pb-8 px-4 sm:px-6 border-t-4" style={{ borderColor: corSecundaria }}>
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  {siteSettings.logo_footer_url ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={siteSettings.logo_footer_url}
                        alt={siteSettings.rodape_titulo || appSettings.app_name || 'Brasil Legal'}
                        className="h-10 sm:h-11 w-auto max-w-[210px] object-contain"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          if (!target.src.includes('/assets/logo-brasil-legal-oficial.png')) {
                            target.src = '/assets/logo-brasil-legal-oficial.png';
                          }
                        }}
                      />
                      {(siteSettings.rodape_tag || 'CARTÓRIOS & REGISTROS') && (
                        <span 
                          className="text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0"
                          style={{ backgroundColor: corSecundaria, color: corPrimaria }}
                        >
                          {siteSettings.rodape_tag || 'CARTÓRIOS & REGISTROS'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <img
                        src="/assets/logo-icon-brasil-legal.svg"
                        alt="Ícone Brasil Legal"
                        className="h-8 w-8 object-contain"
                      />
                      <div className="font-display font-extrabold text-lg text-white tracking-wide flex items-center gap-2">
                        {siteSettings.rodape_titulo || appSettings.app_name || 'BRASIL LEGAL'}
                        {(siteSettings.rodape_tag || 'CARTÓRIOS & REGISTROS') && (
                          <span 
                            className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider"
                            style={{ backgroundColor: corSecundaria, color: corPrimaria }}
                          >
                            {siteSettings.rodape_tag || 'CARTÓRIOS & REGISTROS'}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {siteSettings.rodape_razao_social || appSettings.razao_social || 'Brasil Legal Soluções Imobiliárias e Registrais Ltda'}
                </p>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                  {siteSettings.rodape_descricao || 'Assessoria jurídica e técnica especializada em regularização fundiária urbana e rural, usucapião extrajudicial e saneamento de matrículas em todo o território nacional.'}
                </p>
                <div className="space-y-1 text-[11px] text-slate-400 font-mono pt-1">
                  {siteSettings.rodape_exibir_cnpj && siteSettings.rodape_cnpj && !siteSettings.rodape_cnpj.includes('00.000.000') && (
                    <p>CNPJ: {siteSettings.rodape_cnpj}</p>
                  )}
                  {siteSettings.rodape_endereco && (
                    <p className="flex items-center gap-1.5 text-slate-400 font-sans">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{siteSettings.rodape_endereco}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Canais de Contato</h4>
                <p className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{siteSettings.rodape_telefone || appSettings?.whatsapp_suporte || '+55 11 99864-2424'}</span>
                </p>
                <p className="text-slate-400 truncate flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <a 
                    href={`mailto:${siteSettings.rodape_email || appSettings.email_suporte || 'atendimento@brasillegal.com.br'}`}
                    className="hover:text-amber-400 transition-colors underline-offset-2 hover:underline"
                  >
                    {siteSettings.rodape_email || appSettings.email_suporte || 'atendimento@brasillegal.com.br'}
                  </a>
                </p>
                <p className="text-slate-500 text-[11px] mt-2">
                  {siteSettings.rodape_horario_atendimento || 'Atendimento de Segunda a Sexta das 8h às 18h'}
                </p>

                <div className="pt-3 border-t border-slate-800">
                  <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Redes Sociais Oficiais
                  </h5>
                  <RedesSociaisLinks redes={siteSettings.redes_sociais} estilo="footer" />
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Segurança & Atendimento</h4>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Atendimento ágil e qualificado
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  {siteSettings.rodape_texto_seguranca || 'Processos em conformidade com o Provimento 65 do CNJ e Lei 13.465/2017.'}
                </div>
                
                {/* Link para Programa Indique e Ganhe no Footer */}
                <div className="pt-2">
                  <a
                    href="#indique-e-ganhe"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    <span>Programa Indique e Ganhe B2B</span>
                  </a>
                </div>

                {/* Acesso ao Sistema ERP via Footer */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={onAcessarSistema || onVoltarPainel}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-[#F2EC00] transition-colors cursor-pointer"
                  >
                    <Lock className="w-3 h-3 text-[#F2EC00]" />
                    <span>{usuarioLogado ? 'Ir para Painel Administrativo ERP' : 'Acesso Restrito / Área de Colaboradores'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div>
                {siteSettings.rodape_copyright || `© ${new Date().getFullYear()} ${appSettings.app_name || 'Brasil Legal'}. Todos os direitos reservados.`}
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="hover:text-slate-300">
                  {siteSettings.rodape_termos_uso || 'Termos de Uso'}
                </span>
                <span>•</span>
                <span className="hover:text-slate-300">
                  {siteSettings.rodape_politica_privacidade || 'Política de Privacidade (LGPD)'}
                </span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* 11. FLOATING WHATSAPP BUTTON (ALTA CONVERSÃO) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl hover:scale-105 transition-all group"
        title="Fale com nosso especialista"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
        </span>
        <MessageCircle className="w-5 h-5" />
        <span className="text-xs font-bold hidden sm:inline">
          Dúvidas? Fale no WhatsApp
        </span>
      </a>

      {/* 12. VIDEO MODAL PLAYER ROBUSTO */}
      {isVideoModalOpen && (() => {
        const activeVideoEmbed = getEmbedVideoUrl(modalVideoUrl || siteSettings.video_url || '');
        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative">
              <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white">
                <span className="text-xs sm:text-sm font-bold flex items-center gap-2">
                  <Play className="w-4 h-4 text-[#F2EC00] fill-[#F2EC00]" />
                  {modalVideoTitulo || siteSettings.video_titulo || 'Vídeo Explicativo: Regularização Extrajudicial'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-video w-full bg-black flex items-center justify-center relative">
                {activeVideoEmbed.type === 'mp4' ? (
                  <video
                    src={activeVideoEmbed.embedUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                ) : activeVideoEmbed.isValid ? (
                  <iframe
                    src={activeVideoEmbed.embedUrl}
                    title={modalVideoTitulo || siteSettings.video_titulo || "Vídeo Institucional Brasil Legal"}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center p-8 space-y-3 text-white max-w-md mx-auto">
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto text-[#F2EC00]">
                      <Play className="w-7 h-7 fill-[#F2EC00]" />
                    </div>
                    <p className="text-base font-bold text-white">Vídeo Informativo</p>
                    <p className="text-xs text-slate-400">
                      Cole qualquer link do YouTube (vídeo normal, shorts ou compartilhado) no Módulo CMS para reprodução imediata.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-900 text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{appSettings.app_name || 'Brasil Legal'} • Soluções Fundiárias e Registrais</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white text-xs cursor-pointer"
                  >
                    Fechar
                  </button>
                  <a
                    href="#diagnostico"
                    onClick={() => setIsVideoModalOpen(false)}
                    className="px-4 py-1.5 bg-[#2E3192] text-[#F2EC00] font-bold rounded-lg hover:bg-opacity-90 transition-colors text-xs"
                  >
                    Fazer Diagnóstico Agora
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 13. MODAL DE LEITURA DO ARTIGO DO BLOG */}
      {artigoLeitura && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            {/* Header with category and close */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="bg-[#2E3192] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded">
                  {artigoLeitura.categoria}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {artigoLeitura.tempo_leitura_min} min de leitura
                </span>
              </div>
              <button
                type="button"
                onClick={() => setArtigoLeitura(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg cursor-pointer transition-colors"
                aria-label="Fechar artigo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Article Body */}
            <div className="p-5 sm:p-8 overflow-y-auto space-y-6">
              {artigoLeitura.imagem_capa && (
                <div className="rounded-xl overflow-hidden aspect-video w-full bg-slate-100 max-h-64 shadow-xs">
                  <img
                    src={artigoLeitura.imagem_capa}
                    alt={artigoLeitura.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 font-display leading-snug">
                  {artigoLeitura.titulo}
                </h2>

                <div className="flex items-center gap-3 py-3 border-y border-slate-100">
                  {artigoLeitura.autor.foto_url ? (
                    <img
                      src={artigoLeitura.autor.foto_url}
                      alt={artigoLeitura.autor.nome}
                      className="w-10 h-10 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#2E3192] text-white flex items-center justify-center font-bold text-xs">
                      {artigoLeitura.autor.nome.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-900">{artigoLeitura.autor.nome}</p>
                    <p className="text-[11px] text-slate-500">{artigoLeitura.autor.cargo} • {artigoLeitura.data_publicacao}</p>
                  </div>
                </div>
              </div>

              {artigoLeitura.resumo && (
                <div className="p-4 bg-indigo-50/70 border-l-4 border-[#2E3192] rounded-r-xl text-xs sm:text-sm text-slate-700 font-medium italic leading-relaxed">
                  {artigoLeitura.resumo}
                </div>
              )}

              <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line space-y-4">
                {artigoLeitura.conteudo}
              </div>

              {/* In-article CTA banner */}
              <div className="p-5 bg-gradient-to-br from-[#1C1E63] to-[#2E3192] text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 shadow-lg">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-sm sm:text-base font-bold text-white font-display">Tem dúvidas sobre a regularização do seu imóvel?</h4>
                  <p className="text-xs text-slate-300">
                    Solicite uma triagem registral gratuita com nossos especialistas em cartório e engenharia legal.
                  </p>
                </div>
                <a
                  href="#diagnostico"
                  onClick={() => setArtigoLeitura(null)}
                  className="px-4 py-2.5 bg-[#F2EC00] text-[#2E3192] font-extrabold rounded-xl text-xs hover:scale-105 transition-all shadow-md shrink-0 text-center"
                >
                  Fazer Diagnóstico Gratuito
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400">
                {appSettings.app_name || 'Brasil Legal'} • Artigo Técnico Registral
              </span>
              <button
                type="button"
                onClick={() => setArtigoLeitura(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pop-up Promocional / Campanha de Desconto com Cronômetro */}
      <ModalPopupPromocional
        settings={siteSettings}
        whatsappNumero={whatsappNumber}
        isOpen={isPopupPromoOpen}
        onClose={handleClosePopupPromo}
      />
    </div>
  );
};
