import React, { useState } from 'react';
import { 
  ConversaWhatsApp, 
  InstanciaWhatsAppConfig, 
  FilaAtendimentoWhatsApp, 
  StatusAtendimentoWhatsApp, 
  MensagemWhatsApp,
  Usuario,
  Contact
} from '../types';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  CheckCheck, 
  Clock, 
  Sparkles, 
  Phone, 
  ShieldCheck, 
  Search, 
  Paperclip, 
  FileText, 
  Layers, 
  Tag, 
  Wifi, 
  WifiOff, 
  QrCode, 
  RefreshCw, 
  UserCheck, 
  ChevronRight, 
  Building2, 
  Volume2, 
  Plus, 
  X,
  Check,
  Award,
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface ModuloWhatsAppMultiatendimentoProps {
  currentUser: Usuario;
  allUsers: Usuario[];
  conversas: ConversaWhatsApp[];
  instancia: InstanciaWhatsAppConfig;
  onUpdateConversa?: (conversaId: string, updates: Partial<ConversaWhatsApp>) => Promise<void> | void;
  onEnviarMensagem?: (conversaId: string, mensagem: Partial<MensagemWhatsApp>) => Promise<void> | void;
  onConverterEmLead?: (lead: Partial<Contact>) => Promise<void> | void;
  onUpdateInstancia?: (updates: Partial<InstanciaWhatsAppConfig>) => Promise<void> | void;
}

const FILAS_DISPONIVEIS: FilaAtendimentoWhatsApp[] = [
  'Triagem Comercial (SDR)',
  'Jurídico & Regularização',
  'Engenharia & Topografia',
  'Financeiro & Boletos'
];

const RESPOSTAS_RAPIDAS = [
  'Olá! Somos da Brasil Legal. Como podemos ajudar na regularização do seu imóvel hoje?',
  'Poderia nos informar se o seu imóvel possui escritura registrada ou contrato de gaveta/posse?',
  'Há quantos anos você e sua família exercem a posse mansa e pacífica desse imóvel?',
  'O IPTU do imóvel está emitido no seu nome ou no nome de terceiros/antigo proprietário?',
  'Recebemos suas informações. Nossa inteligência jurídica registral está calculando a viabilidade do seu processo.',
  'Excelente! Vamos agendar o parecer técnico preliminar com nosso coordenador jurídico.'
];

export const ModuloWhatsAppMultiatendimento: React.FC<ModuloWhatsAppMultiatendimentoProps> = ({
  currentUser,
  allUsers,
  conversas: initialConversas,
  instancia: initialInstancia,
  onUpdateConversa,
  onEnviarMensagem,
  onConverterEmLead,
  onUpdateInstancia
}) => {
  const [conversas, setConversas] = useState<ConversaWhatsApp[]>(initialConversas);
  const [instancia, setInstancia] = useState<InstanciaWhatsAppConfig>(initialInstancia);
  const [selectedConversaId, setSelectedConversaId] = useState<string>(
    initialConversas[0]?.id || ''
  );
  const [busca, setBusca] = useState('');
  const [filtroFila, setFiltroFila] = useState<string>('todas');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [textoMensagem, setTextoMensagem] = useState('');
  const [isQualificandoIa, setIsQualificandoIa] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showNovaConversaModal, setShowNovaConversaModal] = useState(false);
  const [novoClienteNome, setNovoClienteNome] = useState('');
  const [novoClienteNumero, setNovoClienteNumero] = useState('');
  const [novaFila, setNovaFila] = useState<FilaAtendimentoWhatsApp>('Triagem Comercial (SDR)');
  const [novaNota, setNovaNota] = useState('');
  const [conversaoSucessoMsg, setConversaoSucessoMsg] = useState('');

  // Sync state if props change
  React.useEffect(() => {
    setConversas(initialConversas);
  }, [initialConversas]);

  React.useEffect(() => {
    setInstancia(initialInstancia);
  }, [initialInstancia]);

  const selectedConversa = conversas.find(c => c.id === selectedConversaId) || conversas[0];

  // Filtering
  const conversasFiltradas = conversas.filter(c => {
    const matchBusca = 
      c.cliente_nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.cliente_numero.includes(busca) ||
      (c.cliente_cidade_uf && c.cliente_cidade_uf.toLowerCase().includes(busca.toLowerCase()));
    const matchFila = filtroFila === 'todas' || c.fila === filtroFila;
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus;
    return matchBusca && matchFila && matchStatus;
  });

  // Handle Send Message
  const handleEnviarMensagem = async (texto?: string) => {
    const conteudo = (texto || textoMensagem).trim();
    if (!conteudo || !selectedConversa) return;

    const novaMsg: MensagemWhatsApp = {
      id: `msg-${Date.now()}`,
      remetente: 'atendente',
      autor_nome: currentUser.nome,
      conteudo,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'entregue',
      tipo: 'texto'
    };

    const updatedConversas = conversas.map(c => {
      if (c.id === selectedConversa.id) {
        return {
          ...c,
          ultima_mensagem: conteudo,
          ultima_mensagem_hora: novaMsg.timestamp,
          mensagens_nao_lidas: 0,
          status: (c.status === 'Aguardando' ? 'Em_Atendimento' : c.status) as StatusAtendimentoWhatsApp,
          atendente_id: c.atendente_id || currentUser.id,
          atendente_nome: c.atendente_nome || currentUser.nome,
          mensagens: [...c.mensagens, novaMsg]
        };
      }
      return c;
    });

    setConversas(updatedConversas);
    setTextoMensagem('');

    if (onEnviarMensagem) {
      await onEnviarMensagem(selectedConversa.id, novaMsg);
    }
  };

  // Toggle IA Agent active
  const handleToggleIa = async () => {
    if (!selectedConversa) return;
    const novoValor = !selectedConversa.ia_agente_ativo;
    setConversas(prev => prev.map(c => 
      c.id === selectedConversa.id ? { ...c, ia_agente_ativo: novoValor } : c
    ));
    if (onUpdateConversa) {
      await onUpdateConversa(selectedConversa.id, { ia_agente_ativo: novoValor });
    }
  };

  // Trigger Gemini AI Qualification
  const handleQualificarComIa = async () => {
    if (!selectedConversa) return;
    setIsQualificandoIa(true);
    try {
      const res = await fetch('/api/whatsapp/ia-qualificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversaId: selectedConversa.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.qualificacao) {
          setConversas(prev => prev.map(c => 
            c.id === selectedConversa.id ? { ...c, ia_qualificacao: data.qualificacao } : c
          ));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsQualificandoIa(false);
    }
  };

  // Transfer queue
  const handleMudarFila = async (novaFilaEscolhida: FilaAtendimentoWhatsApp) => {
    if (!selectedConversa) return;
    setConversas(prev => prev.map(c => 
      c.id === selectedConversa.id ? { ...c, fila: novaFilaEscolhida } : c
    ));
    if (onUpdateConversa) {
      await onUpdateConversa(selectedConversa.id, { fila: novaFilaEscolhida });
    }
  };

  // Change status
  const handleMudarStatus = async (novoStatus: StatusAtendimentoWhatsApp) => {
    if (!selectedConversa) return;
    setConversas(prev => prev.map(c => 
      c.id === selectedConversa.id ? { ...c, status: novoStatus } : c
    ));
    if (onUpdateConversa) {
      await onUpdateConversa(selectedConversa.id, { status: novoStatus });
    }
  };

  // Add private note
  const handleAdicionarNota = () => {
    if (!novaNota.trim() || !selectedConversa) return;
    const notaFormatada = `[${currentUser.nome} - ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}] ${novaNota.trim()}`;
    const novasNotas = [...(selectedConversa.notas_internas || []), notaFormatada];
    setConversas(prev => prev.map(c => 
      c.id === selectedConversa.id ? { ...c, notas_internas: novasNotas } : c
    ));
    setNovaNota('');
    if (onUpdateConversa) {
      onUpdateConversa(selectedConversa.id, { notas_internas: novasNotas });
    }
  };

  // Convert to CRM Lead
  const handleConverterLead = async () => {
    if (!selectedConversa) return;
    const qual = selectedConversa.ia_qualificacao;
    const novoLead: Partial<Contact> = {
      nome_completo: selectedConversa.cliente_nome,
      telefone_whatsapp: selectedConversa.cliente_numero,
      servico_pretendido: qual?.servico_sugerido || 'Regularização Imobiliária',
      qualificacao_sdr: (qual && qual.score_viabilidade_percentual >= 70) ? 'MQL (Qualificado)' : 'Qualificado',
      status_cadastro: 'Em Qualificacao',
      origem_lead: 'Meta Ads',
      observacoes: `Lead pré-qualificado via WhatsApp com IA.\nScore de Viabilidade: ${qual?.score_viabilidade_percentual || 80}%\nParecer da IA: ${qual?.parecer_resumo || 'Sem parecer.'}`
    };

    if (onConverterEmLead) {
      await onConverterEmLead(novoLead);
    }

    setConversas(prev => prev.map(c => {
      if (c.id === selectedConversa.id) {
        return {
          ...c,
          tags: Array.from(new Set([...c.tags, 'Lead Criado', 'CRM'])),
          ia_qualificacao: c.ia_qualificacao ? { ...c.ia_qualificacao, gerou_lead_crm: true } : undefined
        };
      }
      return c;
    }));

    setConversaoSucessoMsg('Lead criado no CRM com sucesso!');
    setTimeout(() => setConversaoSucessoMsg(''), 4000);
  };

  // Create new conversation
  const handleCriarNovaConversa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoClienteNome.trim() || !novoClienteNumero.trim()) return;

    const novaConversa: ConversaWhatsApp = {
      id: `wpp-${Date.now()}`,
      cliente_nome: novoClienteNome.trim(),
      cliente_numero: novoClienteNumero.trim(),
      cliente_cidade_uf: 'São Paulo, SP',
      fila: novaFila,
      status: 'Aguardando',
      ultima_mensagem: 'Conversa iniciada pela equipe.',
      ultima_mensagem_hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      mensagens_nao_lidas: 0,
      tags: ['Manual', 'Novo'],
      ia_agente_ativo: true,
      mensagens: [
        {
          id: `msg-ini-${Date.now()}`,
          remetente: 'ia_agente',
          autor_nome: 'Assistente Brasil Legal (IA)',
          conteudo: 'Olá! Sou a assistente inteligente da Brasil Legal. Como podemos auxiliar na regularização do seu imóvel hoje?',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: 'entregue',
          tipo: 'texto'
        }
      ]
    };

    setConversas([novaConversa, ...conversas]);
    setSelectedConversaId(novaConversa.id);
    setShowNovaConversaModal(false);
    setNovoClienteNome('');
    setNovoClienteNumero('');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Instance Connection Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 font-display">
                  WhatsApp Multi-Atendimento (Whaticket Style)
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Triagem IA Gemini
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Atendimento simultâneo multi-operadores, filas setoriais e pré-qualificação jurídica automatizada de imóveis.
              </p>
            </div>
          </div>

          {/* Instance Status Badge & Quick Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              {instancia.status === 'Conectado' ? (
                <Wifi className="w-4 h-4 text-emerald-600 animate-pulse" />
              ) : (
                <WifiOff className="w-4 h-4 text-rose-500" />
              )}
              <div>
                <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <span>{instancia.nome_instancia}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-emerald-700 font-semibold">{instancia.status}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {instancia.numero_vinculado} • Bateria {instancia.bateria_percentual}%
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-slate-600" />
              QR Code Conexão
            </button>

            <button
              onClick={() => setShowNovaConversaModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#2E3192] hover:bg-[#252877] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#F2EC00]" />
              Novo Atendimento
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Whaticket Layout */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        {/* ======================================================== */}
        {/* COLUMN 1: LEFT CONVERSATION LIST (lg:col-span-4) */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          {/* Search and Filters */}
          <div className="p-3 border-b border-slate-200 space-y-2 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente, número ou cidade..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={filtroFila}
                onChange={e => setFiltroFila(e.target.value)}
                className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
              >
                <option value="todas">Todas as Filas ({conversas.length})</option>
                {FILAS_DISPONIVEIS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>

              <select
                value={filtroStatus}
                onChange={e => setFiltroStatus(e.target.value)}
                className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
              >
                <option value="todos">Todos Status</option>
                <option value="Aguardando">Aguardando</option>
                <option value="Em_Atendimento">Em Atendimento</option>
                <option value="Finalizado">Finalizados</option>
              </select>
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[600px]">
            {conversasFiltradas.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Nenhum atendimento localizado com os filtros atuais.
              </div>
            ) : (
              conversasFiltradas.map(conversa => {
                const isSelected = selectedConversa?.id === conversa.id;
                const score = conversa.ia_qualificacao?.score_viabilidade_percentual;
                return (
                  <button
                    key={conversa.id}
                    onClick={() => setSelectedConversaId(conversa.id)}
                    className={`w-full text-left p-3 flex items-start gap-3 transition-colors cursor-pointer border-l-4 ${
                      isSelected
                        ? 'bg-white border-[#2E3192] shadow-xs'
                        : 'hover:bg-slate-100/70 border-transparent'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs overflow-hidden border border-slate-300">
                        {conversa.foto_url ? (
                          <img src={conversa.foto_url} alt={conversa.cliente_nome} className="w-full h-full object-cover" />
                        ) : (
                          conversa.cliente_nome.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      {conversa.ia_agente_ativo && (
                        <div 
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#2E3192] text-white flex items-center justify-center shadow-xs"
                          title="IA Ativa nesta conversa"
                        >
                          <Bot className="w-2.5 h-2.5 text-[#F2EC00]" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {conversa.cliente_nome}
                        </div>
                        <div className="text-[10px] text-slate-400 whitespace-nowrap">
                          {conversa.ultima_mensagem_hora}
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        {conversa.cliente_numero}
                      </div>

                      <div className="text-xs text-slate-600 truncate mt-1">
                        {conversa.ultima_mensagem}
                      </div>

                      {/* Badges & Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-[#2E3192] border border-indigo-100">
                          {conversa.fila.split(' ')[0]}
                        </span>

                        {score !== undefined && (
                          <span 
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                              score >= 75
                                ? 'bg-emerald-100 text-emerald-800'
                                : score >= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            Viab: {score}%
                          </span>
                        )}

                        {conversa.status === 'Aguardando' && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                            Aguardando
                          </span>
                        )}

                        {conversa.mensagens_nao_lidas > 0 && (
                          <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">
                            {conversa.mensagens_nao_lidas}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUMN 2: CENTER ACTIVE CHAT STREAM (lg:col-span-5) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 flex flex-col bg-slate-100/60 border-r border-slate-200">
          {selectedConversa ? (
            <>
              {/* Chat Header */}
              <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 overflow-hidden border border-slate-300 shrink-0">
                    {selectedConversa.foto_url ? (
                      <img src={selectedConversa.foto_url} alt={selectedConversa.cliente_nome} className="w-full h-full object-cover" />
                    ) : (
                      selectedConversa.cliente_nome.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                      <span>{selectedConversa.cliente_nome}</span>
                      {selectedConversa.cliente_cidade_uf && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          • {selectedConversa.cliente_cidade_uf}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {selectedConversa.cliente_numero}
                    </div>
                  </div>
                </div>

                {/* Status and IA Toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleToggleIa}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedConversa.ia_agente_ativo
                        ? 'bg-[#2E3192] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Alternar piloto automático com IA Gemini"
                  >
                    <Bot className={`w-3.5 h-3.5 ${selectedConversa.ia_agente_ativo ? 'text-[#F2EC00]' : ''}`} />
                    <span>IA {selectedConversa.ia_agente_ativo ? 'Ativa' : 'Pausada'}</span>
                  </button>

                  <select
                    value={selectedConversa.status}
                    onChange={e => handleMudarStatus(e.target.value as StatusAtendimentoWhatsApp)}
                    className="text-[11px] px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700"
                  >
                    <option value="Aguardando">Aguardando</option>
                    <option value="Em_Atendimento">Em Atendimento</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[380px] max-h-[500px]">
                {selectedConversa.mensagens.map(msg => {
                  const isCliente = msg.remetente === 'cliente';
                  const isIa = msg.remetente === 'ia_agente';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCliente ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 shadow-xs text-xs space-y-1 ${
                          isCliente
                            ? 'bg-white text-slate-900 border border-slate-200 rounded-tl-none'
                            : isIa
                            ? 'bg-indigo-950 text-white border border-indigo-900 rounded-tr-none'
                            : 'bg-[#2E3192] text-white rounded-tr-none'
                        }`}
                      >
                        {/* Message Sender Header */}
                        <div className="flex items-center justify-between gap-2 text-[10px] opacity-80 border-b pb-1 mb-1 border-white/10">
                          <span className="font-bold flex items-center gap-1">
                            {isIa && <Bot className="w-3 h-3 text-[#F2EC00]" />}
                            {msg.autor_nome}
                          </span>
                          <span>{msg.timestamp}</span>
                        </div>

                        {/* Message Body */}
                        <p className="whitespace-pre-line leading-relaxed">
                          {msg.conteudo}
                        </p>

                        {/* Read status for outgoing */}
                        {!isCliente && (
                          <div className="flex items-center justify-end text-[10px] text-white/70 pt-0.5">
                            <CheckCheck className="w-3 h-3 text-[#F2EC00]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Responses Library */}
              <div className="p-2 bg-slate-50 border-t border-slate-200 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
                <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0 pl-1">
                  Respostas Rápidas:
                </span>
                {RESPOSTAS_RAPIDAS.map((resp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleEnviarMensagem(resp)}
                    className="text-[10px] px-2.5 py-1 bg-white border border-slate-200 hover:border-[#2E3192] hover:text-[#2E3192] rounded-full whitespace-nowrap text-slate-600 transition-colors shrink-0 cursor-pointer"
                  >
                    {resp.slice(0, 35)}...
                  </button>
                ))}
              </div>

              {/* Message Input Box */}
              <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Digite sua mensagem ou selecione uma resposta rápida..."
                  value={textoMensagem}
                  onChange={e => setTextoMensagem(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleEnviarMensagem()}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
                />
                <button
                  onClick={() => handleEnviarMensagem()}
                  disabled={!textoMensagem.trim()}
                  className="p-2.5 rounded-xl bg-[#2E3192] hover:bg-[#252877] disabled:opacity-40 text-white shadow-xs transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs">
              Selecione uma conversa ao lado para visualizar os atendimentos.
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* COLUMN 3: RIGHT AI QUALIFICATION & NOTES PANEL (lg:col-span-3) */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 flex flex-col bg-white overflow-y-auto max-h-[680px]">
          {selectedConversa ? (
            <div className="p-4 space-y-4">
              {/* AI Diagnostic Header */}
              <div className="bg-linear-to-br from-[#2E3192] to-[#1C1E63] text-white p-4 rounded-xl shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider bg-[#F2EC00] text-[#2E3192]">
                    Qualificação Jurídica IA
                  </span>
                  <button
                    onClick={handleQualificarComIa}
                    disabled={isQualificandoIa}
                    className="text-[10px] text-white/90 hover:text-white flex items-center gap-1 underline cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isQualificandoIa ? 'animate-spin' : ''}`} />
                    {isQualificandoIa ? 'Analisando...' : 'Reavaliar'}
                  </button>
                </div>

                {selectedConversa.ia_qualificacao ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[11px] text-white/70">Score de Viabilidade:</div>
                        <div className="text-2xl font-black font-display text-white">
                          {selectedConversa.ia_qualificacao.score_viabilidade_percentual}%
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-[#F2EC00] flex items-center justify-center font-bold text-xs">
                        {selectedConversa.ia_qualificacao.score_viabilidade_percentual >= 70 ? 'ALTA' : 'MÉDIA'}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <div className="text-[11px] font-bold text-[#F2EC00]">
                        Procedimento Recomendado:
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {selectedConversa.ia_qualificacao.servico_sugerido}
                      </div>
                    </div>

                    <p className="text-[11px] text-white/80 leading-relaxed italic bg-black/20 p-2 rounded-lg">
                      "{selectedConversa.ia_qualificacao.parecer_resumo}"
                    </p>
                  </>
                ) : (
                  <div className="space-y-2 py-2">
                    <p className="text-xs text-white/80">
                      Aguardando respostas do cliente para calcular viabilidade registral automática.
                    </p>
                    <button
                      onClick={handleQualificarComIa}
                      disabled={isQualificandoIa}
                      className="w-full py-1.5 px-2 bg-[#F2EC00] text-[#2E3192] text-xs font-bold rounded-lg shadow cursor-pointer"
                    >
                      {isQualificandoIa ? 'Processando com Gemini...' : 'Executar Análise IA'}
                    </button>
                  </div>
                )}
              </div>

              {/* Conversion Action */}
              {selectedConversa.ia_qualificacao && !selectedConversa.ia_qualificacao.gerou_lead_crm && (
                <button
                  onClick={handleConverterLead}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  Converter em Lead no CRM
                </button>
              )}

              {conversaoSucessoMsg && (
                <div className="p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  {conversaoSucessoMsg}
                </div>
              )}

              {/* Qualification Checklist Details */}
              {selectedConversa.ia_qualificacao && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Dados Extraídos da Conversa:
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500">Documento Inicial:</span>
                      <span className="font-semibold text-slate-900">
                        {selectedConversa.ia_qualificacao.tem_escritura_ou_posse || 'Pendente'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500">Tempo de Posse:</span>
                      <span className="font-semibold text-slate-900">
                        {selectedConversa.ia_qualificacao.tempo_posse_anos || '10+ anos'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500">IPTU / Lançamento:</span>
                      <span className="font-semibold text-slate-900">
                        {selectedConversa.ia_qualificacao.tem_iptu || 'Sim'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-500">Benfeitoria:</span>
                      <span className="font-semibold text-slate-900">
                        {selectedConversa.ia_qualificacao.construcao_averbada || 'Averbada'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Queue Assignment and Attendant */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Fila & Responsável:
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Fila de Atendimento</label>
                    <select
                      value={selectedConversa.fila}
                      onChange={e => handleMudarFila(e.target.value as FilaAtendimentoWhatsApp)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-medium"
                    >
                      {FILAS_DISPONIVEIS.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Atendente Designado</label>
                    <div className="text-xs font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#2E3192]" />
                      <span>{selectedConversa.atendente_nome || 'Aguardando Operador'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Private Notes Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Notas Internas da Equipe:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Privado</span>
                </h4>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {(selectedConversa.notas_internas && selectedConversa.notas_internas.length > 0) ? (
                    selectedConversa.notas_internas.map((nota, nIdx) => (
                      <div key={nIdx} className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-snug">
                        {nota}
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] text-slate-400 italic p-1">
                      Nenhuma nota interna cadastrada.
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="Adicionar nota interna..."
                    value={novaNota}
                    onChange={e => setNovaNota(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAdicionarNota()}
                    className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                  <button
                    onClick={handleAdicionarNota}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-xs text-slate-400">
              Nenhuma conversa selecionada.
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: QR CODE INSTÂNCIA WHATSAPP (WHATICKET SIMULATOR) */}
      {/* ======================================================== */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Conexão WhatsApp (QR Code)
                </h3>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <p className="text-xs text-slate-600">
                Abra o WhatsApp no seu smartphone, vá em <strong>Aparelhos Conectados</strong> e aponte para o QR Code abaixo para sincronizar as mensagens.
              </p>

              {/* QR Code display mockup */}
              <div className="p-4 bg-slate-50 border-2 border-dashed border-emerald-300 rounded-2xl inline-block mx-auto shadow-inner">
                <div className="w-48 h-48 bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center p-2 text-center">
                  <QrCode className="w-36 h-36 text-slate-900" />
                  <span className="text-[10px] text-emerald-700 font-mono font-bold mt-1">
                    Status: {instancia.status}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                <span>Número Vinculado:</span>
                <strong className="font-mono">{instancia.numero_vinculado}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const novoStatus = instancia.status === 'Conectado' ? 'Desconectado' : 'Conectado';
                  setInstancia({ ...instancia, status: novoStatus });
                  if (onUpdateInstancia) onUpdateInstancia({ status: novoStatus });
                }}
                className="text-xs font-semibold text-[#2E3192] hover:underline"
              >
                Simular {instancia.status === 'Conectado' ? 'Desconexão' : 'Reconexão'}
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: NOVO ATENDIMENTO MANUAL */}
      {/* ======================================================== */}
      {showNovaConversaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Iniciar Novo Atendimento WhatsApp
              </h3>
              <button
                onClick={() => setShowNovaConversaModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarNovaConversa} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Ferreira Lima"
                  value={novoClienteNome}
                  onChange={e => setNovoClienteNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefone WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="(11) 98765-4321"
                  value={novoClienteNumero}
                  onChange={e => setNovoClienteNumero(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fila Inicial</label>
                <select
                  value={novaFila}
                  onChange={e => setNovaFila(e.target.value as FilaAtendimentoWhatsApp)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  {FILAS_DISPONIVEIS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNovaConversaModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2E3192] text-white rounded-xl font-bold shadow-xs hover:bg-[#252877]"
                >
                  Criar Atendimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
