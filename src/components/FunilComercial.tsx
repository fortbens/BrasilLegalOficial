import React, { useState } from 'react';
import { Contact, QualificacaoSdr, OrigemLead, Documento, Usuario, FollowUpItem } from '../types';
import { ModalFollowUpLead } from './ModalFollowUpLead';
import { ModalEditarLeadCliente } from './ModalEditarLeadCliente';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Clock, 
  MessageSquare, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  ChevronRight, 
  ChevronLeft,
  MapPin, 
  Sparkles,
  Award,
  Move,
  FileCheck2,
  FileText,
  DollarSign,
  Briefcase,
  ShieldCheck,
  XCircle,
  HelpCircle,
  Calendar,
  Edit3,
  Pencil,
  Trash2,
  User,
  X
} from 'lucide-react';

interface FunilComercialProps {
  contacts: Contact[];
  onUpdateContact: (id: string, updates: Partial<Contact>) => void;
  onDeleteContact?: (id: string) => Promise<void> | void;
  onOpenNovoLeadModal: () => void;
  onOpenUploadModal: (contact: Contact) => void;
  documents?: Documento[];
  currentUser?: Usuario;
  onSaveFollowUp?: (contactId: string, followUp: Omit<FollowUpItem, 'id' | 'data_hora'> & { novoStatus?: QualificacaoSdr }) => Promise<void> | void;
  onSaveParecerPrevio?: (contactId: string, parecer: string, autor?: string) => Promise<void> | void;
}

interface ColumnDef {
  id: QualificacaoSdr;
  aliasIds: QualificacaoSdr[];
  number: number;
  title: string;
  subtitle: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  isCustodiaStage?: boolean;
}

export const FunilComercial: React.FC<FunilComercialProps> = ({
  contacts,
  onUpdateContact,
  onDeleteContact,
  onOpenNovoLeadModal,
  onOpenUploadModal,
  documents = [],
  currentUser,
  onSaveFollowUp,
  onSaveParecerPrevio
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNome, setFilterNome] = useState('');
  const [filterOrigem, setFilterOrigem] = useState<string>('todos');
  const [selectedContactForMsg, setSelectedContactForMsg] = useState<Contact | null>(null);
  const [selectedContactForFollowUp, setSelectedContactForFollowUp] = useState<Contact | null>(null);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [isDeletingLead, setIsDeletingLead] = useState(false);
  const [followUpInitialTab, setFollowUpInitialTab] = useState<'followup' | 'parecer' | 'documentos'>('followup');
  const [draggedContactId, setDraggedContactId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<QualificacaoSdr | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [selectedMobileStage, setSelectedMobileStage] = useState<string>('todos');
  const kanbanScrollRef = React.useRef<HTMLDivElement>(null);

  const handleSaveFollowUpInternal = async (contactId: string, followUpData: any) => {
    if (onSaveFollowUp) {
      await onSaveFollowUp(contactId, followUpData);
    } else {
      const now = new Date().toISOString();
      const newFollowUp = {
        id: `fu-${Date.now()}`,
        data_hora: now,
        autor: followUpData.autor || 'Emerson Carneiro',
        tipo: followUpData.tipo,
        conteudo: followUpData.conteudo,
        status_lead: followUpData.novoStatus,
        proximo_contato: followUpData.proximo_contato
      };
      const contact = contacts.find(c => c.id === contactId);
      const updatedHistory = [newFollowUp, ...(contact?.historico_followup || [])];
      onUpdateContact(contactId, {
        historico_followup: updatedHistory,
        ...(followUpData.novoStatus ? { qualificacao_sdr: followUpData.novoStatus } : {})
      });
    }
    showToast('Follow-up registrado com sucesso!');
  };

  const handleSaveParecerPrevioInternal = async (contactId: string, parecer: string, autor?: string) => {
    if (onSaveParecerPrevio) {
      await onSaveParecerPrevio(contactId, parecer, autor);
    } else {
      onUpdateContact(contactId, {
        parecer_previo: parecer,
        data_parecer_previo: new Date().toISOString(),
        autor_parecer_previo: autor || 'Dr. Emerson Carneiro'
      });
    }
    showToast('Parecer Prévio atualizado com sucesso!');
  };

  const handleScrollLeft = () => {
    if (kanbanScrollRef.current) {
      kanbanScrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (kanbanScrollRef.current) {
      kanbanScrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const scrollToStage = (stageId: string) => {
    setSelectedMobileStage(stageId);
    if (stageId === 'todos') {
      if (kanbanScrollRef.current) {
        kanbanScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
      return;
    }
    const targetCol = document.getElementById(`kanban-funil-col-${stageId}`);
    if (targetCol && kanbanScrollRef.current) {
      const offset = targetCol.offsetLeft - 16;
      kanbanScrollRef.current.scrollTo({ left: offset, behavior: 'smooth' });
    }
  };

  // Pipeline columns strictly adhering to requested flow:
  // Lead -> Qualificado -> Oportunidade (custódia de documentos) -> Entrevista -> Proposta -> Ganho -> Perdido
  const columns: ColumnDef[] = [
    {
      id: 'Lead',
      aliasIds: ['Lead', 'Novo'],
      number: 1,
      title: 'Lead',
      subtitle: 'SLA 1º Contato (< 4 min)',
      color: 'border-blue-500',
      badgeBg: 'bg-blue-100 text-blue-800',
      badgeText: 'Entrada & Triagem'
    },
    {
      id: 'Qualificado',
      aliasIds: ['Qualificado', 'Em Triagem'],
      number: 2,
      title: 'Qualificado',
      subtitle: 'Interesse & Posse Alinhados',
      color: 'border-cyan-500',
      badgeBg: 'bg-cyan-100 text-cyan-800',
      badgeText: 'SDR Aprovado'
    },
    {
      id: 'Oportunidade',
      aliasIds: ['Oportunidade', 'MQL (Qualificado)'],
      number: 3,
      title: 'Oportunidade',
      subtitle: 'Custódia de Documentos (Prov. 65)',
      color: 'border-indigo-600',
      badgeBg: 'bg-indigo-100 text-indigo-800 font-black',
      badgeText: 'Custódia de Documentos',
      isCustodiaStage: true
    },
    {
      id: 'Entrevista',
      aliasIds: ['Entrevista'],
      number: 4,
      title: 'Entrevista',
      subtitle: 'Reunião Técnica / Jurídica',
      color: 'border-amber-500',
      badgeBg: 'bg-amber-100 text-amber-800',
      badgeText: 'Alinhamento Posse'
    },
    {
      id: 'Proposta',
      aliasIds: ['Proposta'],
      number: 5,
      title: 'Proposta',
      subtitle: 'Honorários & Minuta Registral',
      color: 'border-purple-500',
      badgeBg: 'bg-purple-100 text-purple-800',
      badgeText: 'Minuta Enviada'
    },
    {
      id: 'Ganho',
      aliasIds: ['Ganho'],
      number: 6,
      title: 'Ganho',
      subtitle: 'Contrato Fechado & Assinado',
      color: 'border-emerald-600',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      badgeText: 'Negócio Fechado'
    },
    {
      id: 'Perdido',
      aliasIds: ['Perdido', 'Disqualificado'],
      number: 7,
      title: 'Perdido',
      subtitle: 'Sem Viabilidade / Recusado',
      color: 'border-slate-400',
      badgeBg: 'bg-slate-200 text-slate-700',
      badgeText: 'Arquivado'
    }
  ];

  // Map contact to column
  const getContactColumnId = (contact: Contact): QualificacaoSdr => {
    const raw = contact.qualificacao_sdr || 'Lead';
    const match = columns.find(col => col.aliasIds.includes(raw));
    return match ? match.id : 'Lead';
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const term = searchTerm.toLowerCase().trim();
    const nome = contact.nome_completo?.toLowerCase() || '';
    const cpf = contact.cpf_cnpj || '';
    const tel = contact.telefone_whatsapp || '';
    const email = contact.email?.toLowerCase() || '';
    const cidade = contact.endereco?.cidade?.toLowerCase() || '';

    const matchesSearch = !term ||
      nome.includes(term) ||
      cpf.includes(term) ||
      tel.includes(term) ||
      email.includes(term) ||
      cidade.includes(term);
    
    const matchesNome = !filterNome.trim() || nome.includes(filterNome.toLowerCase().trim());

    const matchesOrigem = filterOrigem === 'todos' || contact.origem_lead === filterOrigem;

    return matchesSearch && matchesNome && matchesOrigem;
  });

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, contactId: string) => {
    e.dataTransfer.setData('text/plain', contactId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedContactId(contactId);
  };

  const handleDragEnd = () => {
    setDraggedContactId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: QualificacaoSdr) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: QualificacaoSdr) => {
    e.preventDefault();
    const contactId = e.dataTransfer.getData('text/plain') || draggedContactId;
    if (contactId) {
      onUpdateContact(contactId, {
        qualificacao_sdr: targetStage,
        status_cadastro: targetStage === 'Ganho' ? 'Cliente Ativo' : 'Em Qualificacao'
      });
      showToast(`Lead movido para a etapa "${targetStage}" com sucesso!`);
    }
    setDraggedContactId(null);
    setDragOverCol(null);
  };

  const handleAdvanceStage = (contact: Contact) => {
    const currentStage = getContactColumnId(contact);
    const currentIndex = columns.findIndex(c => c.id === currentStage);
    if (currentIndex >= 0 && currentIndex < columns.length - 2) {
      // Advance to next sequential stage (Lead -> Qualificado -> Oportunidade -> Entrevista -> Proposta -> Ganho)
      const nextCol = columns[currentIndex + 1];
      onUpdateContact(contact.id, {
        qualificacao_sdr: nextCol.id,
        status_cadastro: nextCol.id === 'Ganho' ? 'Cliente Ativo' : 'Em Qualificacao'
      });
      showToast(`${contact.nome_completo} avançado para "${nextCol.title}"!`);
    }
  };

  const handleRetrocedeStage = (contact: Contact) => {
    const currentStage = getContactColumnId(contact);
    const currentIndex = columns.findIndex(c => c.id === currentStage);
    if (currentIndex > 0 && currentIndex !== columns.length - 1) {
      const prevCol = columns[currentIndex - 1];
      onUpdateContact(contact.id, {
        qualificacao_sdr: prevCol.id
      });
      showToast(`${contact.nome_completo} retrocedido para "${prevCol.title}"!`);
    }
  };

  const handleDirectStageChange = (contactId: string, newStage: QualificacaoSdr) => {
    onUpdateContact(contactId, {
      qualificacao_sdr: newStage,
      status_cadastro: newStage === 'Ganho' ? 'Cliente Ativo' : 'Em Qualificacao'
    });
    showToast(`Etapa alterada para "${newStage}"!`);
  };

  const handleSimulateWhatsApp = (contact: Contact) => {
    setSelectedContactForMsg(contact);
    if (!contact.tempo_primeira_resposta_minutos || contact.tempo_primeira_resposta_minutos === 0) {
      onUpdateContact(contact.id, { tempo_primeira_resposta_minutos: 2 });
    }
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2E3192] text-white px-4 py-3 rounded-xl shadow-2xl border-2 border-[#F2EC00] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-[#F2EC00] shrink-0" />
          <span className="text-xs font-bold">{feedbackToast}</span>
        </div>
      )}

      {/* Top Banner with SLA Focus and Actions */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="bg-[#2E3192] text-white text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Funil Comercial Completo
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              SLA Máximo 1º Contato: &lt; 4 Minutos
            </span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Etapa 3: Custódia de Documentos Prov. 65/CNJ
            </span>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
              <Move className="w-3.5 h-3.5 text-amber-600" />
              Clica e Arrasta Ativo
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Pipeline de Regularização Extrajudicial & Oportunidades
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fluxo sequencial: <strong>Lead → Qualificado → Oportunidade (Custódia de Documentos) → Entrevista → Proposta → Ganho e Perdido</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-cadastrar-novo-lead"
            onClick={onOpenNovoLeadModal}
            className="px-4 py-2.5 bg-[#2E3192] hover:bg-[#1E216B] text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-2 border-b-2 border-[#F2EC00] cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#F2EC00]" />
            Novo Lead Completo
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1">
          {/* General Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Busca geral (CPF, tel, cidade...)"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192] focus:bg-white"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dedicated Filter by Client Name */}
          <div className="relative w-full sm:w-72">
            <User className="w-4 h-4 text-[#2E3192] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar por nome do cliente..."
              value={filterNome}
              onChange={e => setFilterNome(e.target.value)}
              className="w-full text-xs pl-9 pr-7 py-2 bg-indigo-50/40 border border-indigo-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192] focus:bg-white font-medium text-slate-900 placeholder:text-indigo-400"
            />
            {filterNome && (
              <button
                type="button"
                onClick={() => setFilterNome('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-700 cursor-pointer"
                title="Limpar filtro de nome"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {filterNome && (
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md shrink-0 whitespace-nowrap">
              {filteredContacts.length} {filteredContacts.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Origem:
          </span>
          {['todos', 'Indique e Ganhe B2B', 'Google Ads', 'Meta Ads', 'Site Oficial (Página de Vendas)'].map(origem => (
            <button
              key={origem}
              onClick={() => setFilterOrigem(origem)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filterOrigem === origem
                  ? 'bg-[#2E3192] text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {origem === 'todos' ? 'Todos os Canais' : origem.replace('Site Oficial (Página de Vendas)', 'Site')}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Stage Selector & Horizontal Scroll Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Etapas:
          </span>
          <button
            type="button"
            onClick={() => scrollToStage('todos')}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedMobileStage === 'todos'
                ? 'bg-[#2E3192] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todas (7)
          </button>
          {columns.map(col => {
            const count = filteredContacts.filter(c => getContactColumnId(c) === col.id).length;
            const isSelected = selectedMobileStage === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => scrollToStage(col.id)}
                className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-[#2E3192] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{col.number}. {col.title}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700 font-semibold'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Pan / Scroll Buttons for Touch Screens & Desktops */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium">
            Rolar colunas:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="btn-scroll-funil-left"
              onClick={handleScrollLeft}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Rolar colunas para a esquerda"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[11px]">Esquerda</span>
            </button>
            <button
              type="button"
              id="btn-scroll-funil-right"
              onClick={handleScrollRight}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Rolar colunas para a direita"
            >
              <span className="text-[11px]">Direita</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board of All 7 Stages with Horizontal Scroll */}
      <div 
        ref={kanbanScrollRef}
        className="overflow-x-auto pb-4 scrollbar-thin scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex gap-4 items-start min-w-[2100px]">
          {columns.map(column => {
            const columnContacts = filteredContacts.filter(
              c => getContactColumnId(c) === column.id
            );
            const isColumnHovered = dragOverCol === column.id;

            return (
              <div
                key={column.id}
                id={`kanban-funil-col-${column.id}`}
                onDragOver={e => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, column.id)}
                className={`w-[290px] shrink-0 rounded-2xl p-3 border transition-all flex flex-col min-h-[580px] ${
                  isColumnHovered
                    ? 'bg-indigo-50/80 border-dashed border-2 border-[#2E3192] shadow-lg'
                    : column.isCustodiaStage
                    ? 'bg-indigo-50/30 border-indigo-200'
                    : 'bg-slate-100/90 border-slate-200'
                }`}
              >
                {/* Column Header */}
                <div className={`border-t-4 ${column.color} bg-white p-3 rounded-xl shadow-2xs mb-3`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#2E3192] text-white font-black text-[10px] flex items-center justify-center">
                        {column.number}
                      </span>
                      <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        {column.title}
                      </h2>
                    </div>
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center">
                      {columnContacts.length}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 leading-tight mb-2">{column.subtitle}</div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded text-center uppercase tracking-wider ${column.badgeBg}`}>
                    {column.badgeText}
                  </div>
                </div>

                {/* Drop Zone Alert when dragging */}
                {isColumnHovered && (
                  <div className="mb-3 py-2 px-3 bg-[#2E3192]/10 border-2 border-dashed border-[#2E3192] rounded-xl text-center text-xs font-bold text-[#2E3192] animate-pulse">
                    Solte aqui para mover para {column.title}
                  </div>
                )}

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[660px] pr-1">
                  {columnContacts.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs italic bg-white/40 rounded-xl border border-dashed border-slate-200">
                      Nenhum contato nesta etapa.
                    </div>
                  ) : (
                    columnContacts.map(contact => {
                      const responseMin = contact.tempo_primeira_resposta_minutos ?? 0;
                      const isWithinSla = responseMin <= 4;
                      const isBeingDragged = draggedContactId === contact.id;
                      const contactDocs = documents.filter(d => d.contact_id === contact.id);
                      const approvedDocs = contactDocs.filter(d => d.status_validacao === 'Aprovado');

                      return (
                        <div
                          key={contact.id}
                          draggable={true}
                          onDragStart={e => handleDragStart(e, contact.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => {
                            setSelectedContactForFollowUp(contact);
                            setFollowUpInitialTab('followup');
                          }}
                          className={`bg-white rounded-xl p-3.5 shadow-xs transition-all border space-y-3 select-none cursor-pointer hover:border-indigo-300 ${
                            isBeingDragged
                              ? 'opacity-40 border-[#2E3192] scale-95 shadow-md'
                              : column.isCustodiaStage
                              ? 'hover:shadow-md border-indigo-200 bg-white ring-1 ring-indigo-50'
                              : 'hover:shadow-md hover:border-slate-300 border-slate-200'
                          }`}
                        >
                          {/* Header card with Type & SLA Badge */}
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase tracking-wider">
                              {contact.tipo_pessoa} • {contact.origem_lead || 'Direto'}
                            </span>

                            {/* Actions & SLA Timer Indicator */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setContactToEdit(contact);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-[#2E3192] hover:bg-indigo-50 transition-colors"
                                title="Editar Cadastro do Lead / Cliente"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setContactToDelete(contact);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Excluir Lead Fake ou Curioso"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                              {/* SLA Timer Indicator */}
                              <div
                                className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shrink-0 ${
                                  isWithinSla
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                                }`}
                              >
                                <Clock className="w-3 h-3 shrink-0" />
                                {responseMin === 0 ? (
                                  <span className="text-amber-600 font-bold">&lt; 1m (Novo)</span>
                                ) : (
                                  <span>{responseMin}m</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Contact Name & Location */}
                          <div className="space-y-0.5">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug break-words">
                              {contact.nome_completo}
                            </h4>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                              <span className="truncate">{contact.endereco.cidade} / {contact.endereco.uf}</span>
                            </div>
                          </div>

                          {/* Procedural Goal */}
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                              Procedimento:
                            </div>
                            <div className="text-xs font-semibold text-[#2E3192] leading-snug break-words">
                              {contact.servico_pretendido || 'Usucapião Extrajudicial'}
                            </div>
                            {contact.tipo_imovel && (
                              <div className="text-[11px] text-slate-600 break-words pt-0.5 border-t border-slate-200/60">
                                {contact.tipo_imovel}
                              </div>
                            )}
                          </div>

                          {/* SPECIAL SECTION: CUSTÓDIA DE DOCUMENTOS (Especially highlighted on Oportunidade) */}
                          <div className={`p-2.5 rounded-lg border text-xs space-y-1.5 ${
                            column.isCustodiaStage 
                              ? 'bg-indigo-50/80 border-indigo-200' 
                              : 'bg-slate-50 border-slate-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-900 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#2E3192]" />
                                Custódia Registral
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                contactDocs.length > 0
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {contactDocs.length} doc{contactDocs.length !== 1 ? 's' : ''}
                              </span>
                            </div>

                            {contactDocs.length > 0 ? (
                              <div className="space-y-1">
                                <div className="text-[11px] text-slate-700 flex items-center justify-between">
                                  <span>Validados:</span>
                                  <strong className="text-emerald-700">{approvedDocs.length} de {contactDocs.length}</strong>
                                </div>
                                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-[#2E3192] h-full transition-all"
                                    style={{ width: `${Math.min(100, Math.round((approvedDocs.length / contactDocs.length) * 100))}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-500 italic">
                                Aguardando envio de matrícula, IPTU ou contrato de posse.
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenUploadModal(contact);
                              }}
                              className="w-full mt-1 px-2.5 py-1.5 bg-[#2E3192] text-white hover:bg-[#1E216B] rounded text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            >
                              <UploadCloud className="w-3.5 h-3.5 text-[#F2EC00]" />
                              <span>{contactDocs.length > 0 ? 'Gerenciar Custódia' : 'Receber Documentos'}</span>
                            </button>
                          </div>

                          {/* Quick Parecer Prévio & Follow-up Access */}
                          <div className="space-y-1.5 pt-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedContactForFollowUp(contact);
                                setFollowUpInitialTab('parecer');
                              }}
                              className={`w-full px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                                contact.parecer_previo
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-indigo-50 text-[#2E3192] border border-indigo-200 hover:bg-indigo-100'
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5 text-[#2E3192]" />
                              <span>{contact.parecer_previo ? '✓ Parecer Prévio (Emitido)' : 'Acessar / Ver Parecer Prévio'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedContactForFollowUp(contact);
                                setFollowUpInitialTab('followup');
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#2E3192]" />
                              <span>Abrir & Lançar Follow-up</span>
                              {contact.historico_followup && contact.historico_followup.length > 0 && (
                                <span className="ml-auto text-[10px] px-1.5 py-0.2 bg-[#2E3192] text-white rounded-full font-mono">
                                  {contact.historico_followup.length}
                                </span>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setContactToEdit(contact);
                              }}
                              className="w-full px-2.5 py-1.5 bg-indigo-50/70 hover:bg-indigo-100 text-[#2E3192] rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-indigo-200 shadow-2xs"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#2E3192]" />
                              <span>Editar Cadastro Completo</span>
                            </button>
                          </div>

                          {/* Indicator details if B2B */}
                          {contact.indicador_id && (
                            <div className="flex items-center gap-1.5 text-[10px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 font-medium">
                              <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="truncate">Indicador B2B: <strong>{contact.indicador_id}</strong> (5%)</span>
                            </div>
                          )}

                          {/* Stage selector quick dropdown */}
                          <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                            <span className="text-[10px] text-slate-500 font-medium">Mover p/:</span>
                            <select
                              value={getContactColumnId(contact)}
                              onChange={e => handleDirectStageChange(contact.id, e.target.value as QualificacaoSdr)}
                              className="text-[10px] font-bold bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700 focus:ring-1 focus:ring-[#2E3192] cursor-pointer"
                            >
                              {columns.map(c => (
                                <option key={c.id} value={c.id}>
                                  {c.number}. {c.title}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quick action buttons */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                            {/* WhatsApp contact */}
                            <button
                              type="button"
                              onClick={() => handleSimulateWhatsApp(contact)}
                              title="Disparar Contato no WhatsApp"
                              className="px-2 py-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="text-[11px]">WhatsApp</span>
                            </button>

                            {/* Navigation advance buttons */}
                            <div className="flex items-center gap-1 ml-auto">
                              {column.id !== 'Lead' && column.id !== 'Perdido' && (
                                <button
                                  type="button"
                                  onClick={() => handleRetrocedeStage(contact)}
                                  title="Voltar Etapa Anterior"
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {column.id !== 'Ganho' && column.id !== 'Perdido' && (
                                <button
                                  type="button"
                                  onClick={() => handleAdvanceStage(contact)}
                                  title="Avançar para Próxima Etapa no Funil"
                                  className="px-2.5 py-1.5 bg-[#2E3192] text-white hover:bg-[#1E216B] rounded-lg transition-colors text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                                >
                                  <span>Avançar</span>
                                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WhatsApp Message Preview Drawer / Modal */}
      {selectedContactForMsg && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-emerald-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="text-sm font-bold">Disparo WhatsApp SLA &lt; 4 min</h3>
                  <p className="text-[11px] text-emerald-100">{selectedContactForMsg.nome_completo}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedContactForMsg(null)}
                className="text-white hover:text-emerald-200 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-slate-800 space-y-2 font-sans">
                <p>
                  Olá, <strong>{selectedContactForMsg.nome_completo}</strong>! Tudo bem?
                </p>
                <p>
                  Aqui é da equipe técnica da <strong>Brasil Legal — Regularização Imobiliária</strong>. Recebemos seu pedido de análise para o seu imóvel em {selectedContactForMsg.endereco.cidade}.
                </p>
                <p>
                  Já estamos prontos para receber sua documentação em nossa <strong>Custódia Registral Segura</strong> (Matrícula, IPTU ou Contrato de Posse) para auditar a viabilidade extrajudicial perante o Cartório de Registro de Imóveis (Provimento 65 do CNJ).
                </p>
                <p>
                  Podemos dar andamento agora?
                </p>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Disparo registrado dentro do SLA contratual de atendimento rápido (&lt; 4min).
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedContactForMsg(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Disparo WhatsApp enviado para ${selectedContactForMsg.telefone_whatsapp}! SLA registrado.`);
                    setSelectedContactForMsg(null);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Confirmar Envio (WhatsApp)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes, Parecer Prévio e Histórico de Follow-up */}
      {selectedContactForFollowUp && (
        <ModalFollowUpLead
          contact={selectedContactForFollowUp}
          currentUser={currentUser}
          documents={documents}
          initialTab={followUpInitialTab}
          onClose={() => setSelectedContactForFollowUp(null)}
          onSaveFollowUp={handleSaveFollowUpInternal}
          onSaveParecerPrevio={handleSaveParecerPrevioInternal}
          onOpenUploadModal={(c) => {
            setSelectedContactForFollowUp(null);
            onOpenUploadModal(c);
          }}
          onUpdateStage={(contactId, stage) => {
            onUpdateContact(contactId, { qualificacao_sdr: stage });
          }}
        />
      )}

      {/* Modal de Confirmação para Exclusão de Lead Fake / Curioso */}
      {contactToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Excluir Lead Fake / Curioso</h3>
                <p className="text-xs text-slate-500">Limpeza cadastral definitiva do CRM</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-700 leading-relaxed bg-red-50 p-3 rounded-xl border border-red-200">
              Tem certeza de que deseja excluir o lead <strong>{contactToDelete.nome_completo}</strong> ({contactToDelete.telefone_whatsapp})? Este contato e suas referências serão removidos permanentemente de todas as esteiras e do banco de dados do ERP.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setContactToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingLead}
                onClick={async () => {
                  if (onDeleteContact && contactToDelete) {
                    setIsDeletingLead(true);
                    await onDeleteContact(contactToDelete.id);
                    setIsDeletingLead(false);
                    setContactToDelete(null);
                    showToast('Lead fake/curioso excluído com sucesso!');
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingLead ? 'Excluindo...' : 'Sim, Excluir Definitivamente'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Cadastro de Lead / Cliente */}
      {contactToEdit && (
        <ModalEditarLeadCliente
          isOpen={true}
          contact={contactToEdit}
          onClose={() => setContactToEdit(null)}
          onDelete={onDeleteContact ? async (contactId) => {
            await onDeleteContact(contactId);
            setContactToEdit(null);
            showToast('Lead fake/curioso excluído com sucesso!');
          } : undefined}
          onSave={async (contactId, updates) => {
            onUpdateContact(contactId, updates);
            setContactToEdit(null);
            showToast('Cadastro do cliente atualizado com sucesso!');
          }}
        />
      )}
    </div>
  );
};
