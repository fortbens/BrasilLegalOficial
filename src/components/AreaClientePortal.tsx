import React, { useState } from 'react';
import { Deal, Contact, Documento, AppSettings, SiteSettings } from '../types';
import { initialDeals, initialContacts } from '../mockData';
import { 
  Search, 
  ShieldCheck, 
  FileText, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Download, 
  Building2, 
  User, 
  ChevronRight,
  ExternalLink,
  Sparkles,
  Layers,
  ArrowRight,
  HelpCircle,
  FileCheck
} from 'lucide-react';

interface AreaClientePortalProps {
  deals?: Deal[];
  contacts?: Contact[];
  documents?: Documento[];
  appSettings?: AppSettings;
  siteSettings?: SiteSettings;
  onVoltarPainel?: () => void;
  isStandaloneView?: boolean;
}

export const AreaClientePortal: React.FC<AreaClientePortalProps> = ({
  deals = initialDeals,
  contacts = initialContacts,
  documents = [],
  appSettings,
  siteSettings,
  onVoltarPainel,
  isStandaloneView = false
}) => {
  const effectiveDeals = deals.length > 0 ? deals : initialDeals;
  const effectiveContacts = contacts.length > 0 ? contacts : initialContacts;
  const [buscaTerm, setBuscaTerm] = useState('PR-2026-001');
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(effectiveDeals[0] || null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(
    effectiveContacts.find(c => c.id === effectiveDeals[0]?.contact_id) || effectiveContacts[0] || null
  );
  const [buscaRealizada, setBuscaRealizada] = useState(true);
  const [erroNaoEncontrado, setErroNaoEncontrado] = useState(false);

  const primaryColor = siteSettings?.cor_primaria || appSettings?.cor_primaria || '#2E3192';
  const secondaryColor = siteSettings?.cor_secundaria || appSettings?.cor_secundaria || '#F2EC00';
  const appName = siteSettings?.nome_empresa || appSettings?.app_name || 'Brasil Legal';

  const handleBuscar = (termoParaBuscar?: string) => {
    const query = (termoParaBuscar || buscaTerm).trim().toLowerCase().replace(/[^\w]/gi, '');
    setErroNaoEncontrado(false);

    if (!query) {
      setErroNaoEncontrado(true);
      return;
    }

    // 1. Procurar por ID do Deal ou título
    let dealFound = effectiveDeals.find(d => {
      const cleanId = d.id.toLowerCase().replace(/[^\w]/gi, '');
      const cleanTitulo = d.titulo.toLowerCase();
      return cleanId.includes(query) || cleanTitulo.includes(query);
    });

    // 2. Se não achou, procurar por CPF ou Telefone do Contato
    if (!dealFound) {
      const contactFound = effectiveContacts.find(c => {
        const cleanCpf = c.cpf_cnpj.replace(/\D/g, '');
        const cleanTel = c.telefone_whatsapp.replace(/\D/g, '');
        const cleanNome = c.nome_completo.toLowerCase();
        return cleanCpf.includes(query) || cleanTel.includes(query) || cleanNome.includes(query);
      });

      if (contactFound) {
        dealFound = effectiveDeals.find(d => d.contact_id === contactFound.id) || effectiveDeals[0];
      }
    }

    if (dealFound) {
      setSelectedDeal(dealFound);
      const contact = effectiveContacts.find(c => c.id === dealFound?.contact_id) || null;
      setSelectedContact(contact);
      setBuscaRealizada(true);
    } else {
      setErroNaoEncontrado(true);
    }
  };

  const stepsList = [
    { 
      number: 1, 
      statusId: 'Triagem', 
      title: 'Triagem & Levantamento', 
      desc: 'Qualificação da posse e análise territorial' 
    },
    { 
      number: 2, 
      statusId: 'Auditoria Documental', 
      title: 'Auditoria & Topografia', 
      desc: 'Levantamento georreferenciado e certidões' 
    },
    { 
      number: 3, 
      statusId: 'Parecer Técnico/Jurídico', 
      title: 'Parecer Jurídico & ART/RRT', 
      desc: 'Elaboração da peça técnica do Prov. 65 CNJ' 
    },
    { 
      number: 4, 
      statusId: 'Protocolado Cartório/Prefeitura', 
      title: 'Protocolado no Cartório de RI', 
      desc: 'Prenotação registral e notificação de confrontantes' 
    },
    { 
      number: 5, 
      statusId: 'Regularizado / Concluído', 
      title: 'Matrícula & Escritura Registrada', 
      desc: 'Documento 100% legalizado e registrado' 
    }
  ];

  const getStepStatus = (stepId: string) => {
    if (!selectedDeal) return 'pendente';
    const currentStepIndex = stepsList.findIndex(s => s.statusId === selectedDeal.status);
    const thisStepIndex = stepsList.findIndex(s => s.statusId === stepId);

    if (thisStepIndex < currentStepIndex) return 'concluido';
    if (thisStepIndex === currentStepIndex) return 'atual';
    return 'pendente';
  };

  const dealDocs = documents.filter(d => d.contact_id === selectedContact?.id || d.deal_id === selectedDeal?.id);

  // LGPD Masking functions to protect personal data (Name, CPF, Address)
  const maskName = (name?: string): string => {
    if (!name) return 'Clien***';
    return name.split(' ').map((part) => {
      if (part.length <= 2) return part;
      return `${part.slice(0, 2)}${'*'.repeat(Math.max(part.length - 2, 3))}`;
    }).join(' ');
  };

  const maskCpfCnpj = (doc?: string): string => {
    if (!doc) return '***.***.***-**';
    const clean = doc.replace(/\D/g, '');
    if (clean.length === 11) {
      return `***.${clean.slice(3, 6)}.***-**`;
    } else if (clean.length === 14) {
      return `**.***.${clean.slice(5, 8)}/****-**`;
    }
    return '***.***.***-**';
  };

  const maskAddress = (endereco?: any): string => {
    if (!endereco || !endereco.logradouro) return 'Endereço sob sigilo registral (LGPD)';
    const ruaParts = (endereco.logradouro || '').split(' ');
    const maskedRua = ruaParts.map((p: string, i: number) => {
      if (i === 0) return p; // Rua, Av, Alameda
      if (p.length <= 2) return p;
      return `${p.slice(0, 2)}${'*'.repeat(Math.max(p.length - 2, 4))}`;
    }).join(' ');
    const maskedBairro = endereco.bairro ? `${endereco.bairro.slice(0, 3)}****` : '***';
    return `${maskedRua}, nº *** - ${maskedBairro}`;
  };

  const handleOpenWhatsAppSuporte = () => {
    const whatsNum = (appSettings?.whatsapp_suporte || siteSettings?.whatsapp_vendas || '+55 11 99864-2424').replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Olá! Gostaria de falar com o Coordenador Técnico sobre o andamento do meu processo de regularização na Brasil Legal (Protocolo: ${selectedDeal?.id}).`
    );
    window.open(`https://wa.me/${whatsNum}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Portal Header Banner */}
      <div 
        className="rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor} 0%, #15184B 100%)` 
        }}
      >
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span 
              className="text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider text-slate-950"
              style={{ backgroundColor: secondaryColor }}
            >
              Área do Cliente • Portal de Acompanhamento
            </span>
            <span className="text-xs bg-white/15 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-white/90 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Conexão Segura & Consulta Pública
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Acompanhe a Tramitação do seu Imóvel em Tempo Real
          </h1>
          <p className="text-xs sm:text-sm text-white/80 mt-1 leading-relaxed">
            Consulte o avanço perante o Cartório de Registro de Imóveis, veja notas técnicas do coordenador jurídico, certidões expedidas e a linha do tempo do seu processo.
          </p>

          {/* Search Box */}
          <div className="mt-5 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={buscaTerm}
                onChange={(e) => setBuscaTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                placeholder="Digite o número de Protocolo (ex: PR-2026-001) ou seu CPF..."
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 bg-white text-slate-900 rounded-xl shadow-md focus:outline-hidden focus:ring-3 focus:ring-[#F2EC00]"
              />
            </div>
            <button
              onClick={() => handleBuscar()}
              className="px-6 py-3 font-bold text-xs sm:text-sm rounded-xl text-slate-950 shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              style={{ backgroundColor: secondaryColor }}
            >
              <Search className="w-4 h-4" />
              Consultar Status
            </button>
          </div>

          {/* Quick Click Search Badges */}
          <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-white/80">
            <span className="text-[11px] font-bold text-white/60">Exemplos rápidos:</span>
            {deals.slice(0, 3).map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setBuscaTerm(d.id);
                  handleBuscar(d.id);
                }}
                className="text-[11px] bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors border border-white/20 text-white cursor-pointer"
              >
                Processo #{d.id.replace('deal-0', 'REG-2026-00').replace('deal-', 'REG-2026-')} • {d.tipo_procedimento} ({d.cartorio_comarca})
              </button>
            ))}
          </div>
        </div>

        {/* Decorative background watermark */}
        <Building2 className="w-64 h-64 text-white/5 absolute -right-10 -bottom-10 pointer-events-none" />
      </div>

      {/* Error State */}
      {erroNaoEncontrado && (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-5 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold">Nenhum processo localizado para "{buscaTerm}"</h3>
            <p className="text-xs text-rose-700 mt-1">
              Verifique se digitou corretamente o número do protocolo (ex: PR-2026-001) ou o CPF do titular cadastrado. Se o processo foi cadastrado recentemente, pode levar até 1 hora para constar na consulta pública.
            </p>
            <div className="mt-3">
              <button
                onClick={handleOpenWhatsAppSuporte}
                className="text-xs font-bold text-rose-900 underline flex items-center gap-1 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Falar com o suporte para localizar meu processo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Process Details */}
      {selectedDeal && !erroNaoEncontrado && (
        <div className="space-y-6">
          {/* Top Process Identification Card */}
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-[#2E3192] text-white">
                    Protocolo: {selectedDeal.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {selectedDeal.tipo_procedimento}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                    Comarca: {selectedDeal.cartorio_comarca}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> LGPD Ativa (Dados Mascarados)
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedDeal.titulo.includes('—') 
                    ? `${maskName(selectedContact?.nome_completo || selectedDeal.titulo.split('—')[0].trim())} — ${selectedDeal.tipo_procedimento}`
                    : selectedDeal.titulo}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Titular / Requerente: <strong className="text-slate-800 font-semibold">{maskName(selectedContact?.nome_completo)}</strong> 
                  <span className="text-slate-400 font-mono text-[11px]">({maskCpfCnpj(selectedContact?.cpf_cnpj)})</span>
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={handleOpenWhatsAppSuporte}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-100" />
                  Falar com Coordenador
                </button>
              </div>
            </div>

            {/* Stepper / Timeline of Progress */}
            <div className="pt-6">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Evolução Registral do Processo</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Status Atual: {selectedDeal.status}
                </span>
              </div>

              {/* Progress Steps Grid / Stepper */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {stepsList.map((step) => {
                  const state = getStepStatus(step.statusId);
                  return (
                    <div
                      key={step.number}
                      className={`p-4 rounded-xl border transition-all ${
                        state === 'concluido'
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : state === 'atual'
                          ? 'bg-indigo-50/90 border-[#2E3192] text-indigo-950 shadow-md ring-2 ring-[#2E3192]/20'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div 
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            state === 'concluido'
                              ? 'bg-emerald-600 text-white'
                              : state === 'atual'
                              ? 'bg-[#2E3192] text-[#F2EC00]'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {state === 'concluido' ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider">
                          {state === 'concluido' ? 'Concluído' : state === 'atual' ? 'Em Andamento' : 'Futuro'}
                        </span>
                      </div>
                      <div className="text-xs font-bold leading-tight">
                        {step.title}
                      </div>
                      <div className="text-[10px] mt-1 line-clamp-2 opacity-80">
                        {step.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Technical Note & Dispatch */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Latest Technical Report & Notes */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#2E3192]" />
                  Parecer Técnico & Notas do Procedimento
                </h3>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Atualizado recentemente
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                <p>
                  {selectedDeal.parecer_tecnico || 
                    `Procedimento cadastrado e sob custódia da equipe técnica da Brasil Legal. Levantamento de confrontações e certidões cíveis e fiscais em andamento na comarca de ${selectedDeal.cartorio_comarca}. Todas as exigências legais estão sendo cumpridas conforme o Provimento 65 do CNJ e a Lei Federal 13.465/2017.`}
                </p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Responsável Técnico: {selectedDeal.responsavel_tecnico || 'Equipe Técnica Especializada em Regularização Fundiária'}</span>
                  <span className="font-semibold text-emerald-700">✓ Em conformidade cartorária</span>
                </div>
              </div>

              {/* Real Estate Property Data */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Localização e Dados do Imóvel
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Endereço (Ofuscado LGPD):</span>
                    <strong className="text-slate-800">
                      {maskAddress(selectedContact?.endereco)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Município / UF:</span>
                    <strong className="text-slate-800">
                      {selectedContact?.endereco ? `${selectedContact.endereco.cidade} / ${selectedContact.endereco.uf}` : selectedDeal.cartorio_comarca}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Circunscrição Registral:</span>
                    <strong className="text-slate-800">{selectedDeal.cartorio_comarca}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Tipo de Posse / Aquisição:</span>
                    <strong className="text-slate-800">{selectedContact?.tipo_imovel || 'Posse mansa com justo título'}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Documents & Certidões */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Documentos Liberados
                  </h3>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">
                    {dealDocs.length} itens
                  </span>
                </div>

                <div className="space-y-2">
                  {dealDocs.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">
                      <FileText className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      Documentos técnicos em fase de compilação cartorária.
                    </div>
                  ) : (
                    dealDocs.map(doc => (
                      <div 
                        key={doc.id}
                        className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">
                            {doc.tipo_documento.replace(/_/g, ' ')}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Validado pela Diretoria Técnica
                          </div>
                        </div>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-white hover:bg-[#2E3192] hover:text-white text-slate-700 rounded-lg border border-slate-200 shadow-2xs transition-colors shrink-0"
                          title="Baixar Certidão ou Planta"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Direct Support Card */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
                <div className="text-xs font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Precisa enviar documentos complementares?
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed mb-3">
                  Caso o oficial do cartório tenha solicitado alguma certidão atualizada, envie diretamente ao nosso plantão registral.
                </p>
                <button
                  onClick={handleOpenWhatsAppSuporte}
                  className="w-full py-2 bg-[#2E3192] hover:bg-[#1E216B] text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#F2EC00]" />
                  Enviar ao Plantão Registral
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
