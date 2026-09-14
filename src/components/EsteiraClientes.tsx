import React, { useState } from 'react';
import { Deal, Contact, Documento, StatusDeal, StatusValidacaoDocumento } from '../types';
import { 
  Building2, 
  MapPin, 
  User, 
  FileText, 
  DollarSign, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  MessageSquare, 
  Search, 
  Filter, 
  Eye, 
  Move,
  Award,
  AlertCircle,
  Plus,
  Pencil,
  Edit3,
  Trash2,
  X,
  AlertTriangle
} from 'lucide-react';
import { ModalVisualizarDocumento } from './ModalVisualizarDocumento';
import { ModalEditarLeadCliente } from './ModalEditarLeadCliente';

interface EsteiraClientesProps {
  deals: Deal[];
  contacts: Contact[];
  documents: Documento[];
  onUpdateDealStatus: (dealId: string, newStatus: StatusDeal) => void;
  onUpdateDocStatus?: (id: string, status: StatusValidacaoDocumento, observacao?: string) => void;
  onOpenNovoLeadModal?: () => void;
  onUpdateContact?: (id: string, updates: Partial<Contact>) => void;
  onDeleteContact?: (contactId: string) => Promise<void> | void;
  onDeleteDeal?: (dealId: string) => Promise<void> | void;
}

const ESTEIRA_COLUMNS: {
  id: StatusDeal;
  title: string;
  subtitle: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  {
    id: 'Triagem',
    title: '1. Triagem & Levantamento',
    subtitle: 'Qualificação inicial e dados da comarca',
    accentColor: 'border-blue-500',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700'
  },
  {
    id: 'Auditoria Documental',
    title: '2. Auditoria Documental',
    subtitle: 'Conferência de matrículas, IPTU e certidões',
    accentColor: 'border-amber-500',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700'
  },
  {
    id: 'Parecer Técnico/Jurídico',
    title: '3. Parecer Jurídico & Técnico',
    subtitle: 'Laudo de agrimensura e OAB CNJ 65',
    accentColor: 'border-purple-500',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700'
  },
  {
    id: 'Protocolado Cartório/Prefeitura',
    title: '4. Protocolado em Cartório',
    subtitle: 'Prenotação no RI e tramitação registral',
    accentColor: 'border-cyan-500',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-700'
  },
  {
    id: 'Regularizado / Concluído',
    title: '5. Regularizado & Matrícula',
    subtitle: 'Escritura registrada e matrícula emitida',
    accentColor: 'border-emerald-500',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700'
  }
];

export const EsteiraClientes: React.FC<EsteiraClientesProps> = ({
  deals,
  contacts,
  documents,
  onUpdateDealStatus,
  onUpdateDocStatus,
  onOpenNovoLeadModal,
  onUpdateContact,
  onDeleteContact,
  onDeleteDeal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<StatusDeal | null>(null);
  const [selectedMobileStage, setSelectedMobileStage] = useState<string>('todos');
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const kanbanScrollRef = React.useRef<HTMLDivElement>(null);

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
    const targetCol = document.getElementById(`esteira-col-${stageId}`);
    if (targetCol && kanbanScrollRef.current) {
      const offset = targetCol.offsetLeft - 16;
      kanbanScrollRef.current.scrollTo({ left: offset, behavior: 'smooth' });
    }
  };
  
  // Document viewer modal state
  const [selectedDocToView, setSelectedDocToView] = useState<Documento | null>(null);
  const [selectedDocContact, setSelectedDocContact] = useState<Contact | null>(null);
  const [filterNomeCliente, setFilterNomeCliente] = useState('');
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter deals
  const filteredDeals = deals.filter(deal => {
    const contact = contacts.find(c => c.id === deal.contact_id);
    const term = searchTerm.toLowerCase().trim();
    const nomeTerm = filterNomeCliente.toLowerCase().trim();

    if (term) {
      const matchesTitle = deal.titulo.toLowerCase().includes(term);
      const matchesComarca = deal.cartorio_comarca.toLowerCase().includes(term);
      const matchesContact = (contact?.nome_completo || '').toLowerCase().includes(term) ||
                             (contact?.cpf_cnpj || '').includes(term) ||
                             (contact?.telefone_whatsapp || '').includes(term) ||
                             (deal.cliente_nome || '').toLowerCase().includes(term);
      if (!matchesTitle && !matchesComarca && !matchesContact) return false;
    }

    if (nomeTerm) {
      const nomeCliente = (deal.cliente_nome || contact?.nome_completo || '').toLowerCase();
      if (!nomeCliente.includes(nomeTerm)) return false;
    }

    return true;
  });

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedDealId(dealId);
  };

  const handleDragEnd = () => {
    setDraggedDealId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e: React.DragEvent, colId: StatusDeal) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: StatusDeal) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
    if (dealId) {
      onUpdateDealStatus(dealId, targetStatus);
    }
    setDraggedDealId(null);
    setDragOverCol(null);
  };

  const handleAdvance = (deal: Deal) => {
    const currentIndex = ESTEIRA_COLUMNS.findIndex(c => c.id === deal.status);
    if (currentIndex < ESTEIRA_COLUMNS.length - 1) {
      const nextStatus = ESTEIRA_COLUMNS[currentIndex + 1].id;
      onUpdateDealStatus(deal.id, nextStatus);
    }
  };

  const handleRecede = (deal: Deal) => {
    const currentIndex = ESTEIRA_COLUMNS.findIndex(c => c.id === deal.status);
    if (currentIndex > 0) {
      const prevStatus = ESTEIRA_COLUMNS[currentIndex - 1].id;
      onUpdateDealStatus(deal.id, prevStatus);
    }
  };

  const handleOpenDocViewer = (doc: Documento, contact?: Contact) => {
    setSelectedDocToView(doc);
    setSelectedDocContact(contact || null);
  };

  const handleSimulateWhatsAppUpdate = (deal: Deal, contact?: Contact) => {
    if (!contact) return;
    const phoneClean = contact.telefone_whatsapp.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Olá ${contact.nome_completo}! Temos uma atualização no seu processo de regularização imobiliária ("${deal.titulo}"). O procedimento avançou para a etapa: *${deal.status}* no ${deal.cartorio_comarca}. Qualquer dúvida, nossa assessoria registral está à disposição!`
    );
    window.open(`https://wa.me/55${phoneClean}?text=${msg}`, '_blank');
  };

  // Metrics
  const totalHonorarios = deals.reduce((acc, d) => acc + (d.valor_honorarios_liquido || 0), 0);
  const totalConcluidos = deals.filter(d => d.status === 'Regularizado / Concluído').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#2E3192] text-white text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Esteira de Clientes & Processos
            </span>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded flex items-center gap-1 border border-amber-200">
              <Move className="w-3.5 h-3.5" />
              Recurso: Clica e Arrasta (Drag & Drop)
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded flex items-center gap-1 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {totalConcluidos} Concluídos com Sucesso
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Esteira Operacional de Regularização dos Clientes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Arraste os cards de clientes entre as etapas para atualizar a tramitação registral em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Valor Total em Carteira</div>
            <div className="text-sm font-bold text-[#2E3192]">
              R$ {totalHonorarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {onOpenNovoLeadModal && (
            <button
              onClick={onOpenNovoLeadModal}
              className="px-4 py-2.5 bg-[#2E3192] hover:bg-[#1E216B] text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-2 border-b-2 border-[#F2EC00] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#F2EC00]" />
              Novo Processo
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1">
          {/* General Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Busca geral (comarca, processo, CPF...)"
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
              value={filterNomeCliente}
              onChange={e => setFilterNomeCliente(e.target.value)}
              className="w-full text-xs pl-9 pr-7 py-2 bg-indigo-50/40 border border-indigo-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192] focus:bg-white font-medium text-slate-900 placeholder:text-indigo-400"
            />
            {filterNomeCliente && (
              <button
                type="button"
                onClick={() => setFilterNomeCliente('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-700 cursor-pointer"
                title="Limpar filtro de nome"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {filterNomeCliente && (
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md shrink-0 whitespace-nowrap">
              {filteredDeals.length} {filteredDeals.length === 1 ? 'processo encontrado' : 'processos encontrados'}
            </span>
          )}
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2 shrink-0">
          <span>Dica: <strong>Clique e arraste</strong> qualquer card para a coluna desejada.</span>
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
            Todas ({ESTEIRA_COLUMNS.length})
          </button>
          {ESTEIRA_COLUMNS.map(col => {
            const count = filteredDeals.filter(d => d.status === col.id).length;
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
                <span>{col.title}</span>
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
              id="btn-scroll-esteira-left"
              onClick={handleScrollLeft}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Rolar colunas para a esquerda"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[11px]">Esquerda</span>
            </button>
            <button
              type="button"
              id="btn-scroll-esteira-right"
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

      {/* Kanban Board Container with Smooth Horizontal Scroll */}
      <div 
        ref={kanbanScrollRef}
        className="overflow-x-auto pb-4 scrollbar-thin scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex gap-4 items-start min-w-[1400px]">
          {ESTEIRA_COLUMNS.map(column => {
            const columnDeals = filteredDeals.filter(d => d.status === column.id);
            const isColumnHovered = dragOverCol === column.id;

            return (
              <div
                key={column.id}
                id={`esteira-col-${column.id}`}
                onDragOver={e => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, column.id)}
                className={`w-[290px] shrink-0 rounded-2xl p-3 border transition-all flex flex-col min-h-[580px] ${
                  isColumnHovered
                    ? 'bg-indigo-50/80 border-dashed border-2 border-[#2E3192] shadow-lg scale-[1.01]'
                    : 'bg-slate-100/90 border-slate-200'
                }`}
              >
                {/* Column Header */}
                <div className={`border-t-4 ${column.accentColor} bg-white p-3 rounded-xl shadow-2xs mb-3`}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      {column.title}
                    </h3>
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold flex items-center justify-center">
                      {columnDeals.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    {column.subtitle}
                  </p>
                </div>

                {/* Drop Target Indicator */}
                {isColumnHovered && (
                  <div className="mb-3 py-2 px-3 bg-[#2E3192]/10 border-2 border-dashed border-[#2E3192] rounded-xl text-center text-xs font-bold text-[#2E3192] animate-pulse">
                    Solte aqui para mover para esta etapa
                  </div>
                )}

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[640px] pr-1">
                  {columnDeals.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs italic bg-white/40 rounded-xl border border-dashed border-slate-200">
                      Nenhum processo nesta etapa.
                    </div>
                  ) : (
                    columnDeals.map(deal => {
                      const contact = contacts.find(c => c.id === deal.contact_id);
                      const dealDocs = documents.filter(d => d.contact_id === deal.contact_id || d.deal_id === deal.id);
                      const isBeingDragged = draggedDealId === deal.id;

                      return (
                        <div
                          key={deal.id}
                          draggable={true}
                          onDragStart={e => handleDragStart(e, deal.id)}
                          onDragEnd={handleDragEnd}
                          className={`bg-white rounded-xl p-3.5 shadow-xs border transition-all cursor-grab active:cursor-grabbing space-y-3 select-none ${
                            isBeingDragged
                              ? 'opacity-40 border-[#2E3192] scale-95 shadow-md'
                              : 'hover:shadow-md hover:border-slate-300 border-slate-200'
                          }`}
                        >
                          {/* Card Header: Procedure badge & Protocol */}
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-[#2E3192] border border-indigo-100 truncate max-w-[170px]">
                              {deal.tipo_procedimento}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[10px] font-mono text-slate-400">
                                #{deal.id.replace('deal-', '').replace('dl-', '')}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDealToDelete(deal);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Excluir Lead Fake ou Curioso deste Processo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Deal Title */}
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 leading-snug">
                              {deal.titulo}
                            </h4>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                              <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{deal.cartorio_comarca}</span>
                            </div>
                          </div>

                          {/* Client Information */}
                          {contact && (
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-800 truncate flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  {contact.nome_completo}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setContactToEdit(contact);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-[#2E3192] hover:bg-indigo-50 transition-colors"
                                  title="Editar dados cadastrais do cliente"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span>CPF: <strong className="font-mono">{contact.cpf_cnpj}</strong></span>
                                <span>{contact.endereco.cidade}/{contact.endereco.uf}</span>
                              </div>
                            </div>
                          )}

                          {/* Documents in Custody Pill & Action */}
                          <div className="flex items-center justify-between pt-1 text-xs">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span className="text-[11px] font-semibold">
                                {dealDocs.length} {dealDocs.length === 1 ? 'documento' : 'documentos'}
                              </span>
                            </div>

                            {dealDocs.length > 0 ? (
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleOpenDocViewer(dealDocs[0], contact);
                                }}
                                className="px-2 py-1 text-[11px] font-bold text-[#2E3192] bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                                title="Visualizar documento em custódia com carimbo e pré-visualização"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Visualizar</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Sem docs</span>
                            )}
                          </div>

                          {/* Financial Value & B2B split */}
                          <div className="flex items-center justify-between text-[11px] border-t border-slate-100 pt-2 text-slate-600">
                            <div>
                              Honorários: <strong className="text-slate-900">R$ {deal.valor_honorarios_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</strong>
                            </div>
                            {deal.comissao_b2b_valor > 0 && (
                              <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                B2B: R$ {deal.comissao_b2b_valor}
                              </span>
                            )}
                          </div>

                          {/* Card Action Controls: Advance/Recede & WhatsApp */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            {/* WhatsApp update button */}
                            {contact && (
                              <button
                                type="button"
                                onClick={() => handleSimulateWhatsAppUpdate(deal, contact)}
                                title="Avisar cliente no WhatsApp sobre a etapa"
                                className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 text-xs flex items-center gap-1 cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[10px] font-bold hidden sm:inline">WhatsApp</span>
                              </button>
                            )}

                            <div className="flex items-center gap-1 ml-auto">
                              {column.id !== 'Triagem' && (
                                <button
                                  type="button"
                                  onClick={() => handleRecede(deal)}
                                  title="Voltar etapa anterior"
                                  className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-xs cursor-pointer"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {column.id !== 'Regularizado / Concluído' && (
                                <button
                                  type="button"
                                  onClick={() => handleAdvance(deal)}
                                  title="Avançar para próxima etapa"
                                  className="px-2.5 py-1.5 bg-[#2E3192] hover:bg-[#1C1E63] text-white rounded-lg transition-colors text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                                >
                                  <span>Avançar</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
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

      {/* Custody Document Viewer Modal */}
      {selectedDocToView && (
        <ModalVisualizarDocumento
          isOpen={Boolean(selectedDocToView)}
          onClose={() => setSelectedDocToView(null)}
          document={selectedDocToView}
          contact={selectedDocContact}
          onUpdateDocStatus={onUpdateDocStatus}
        />
      )}

      {/* Modal de Confirmação para Exclusão de Processo / Lead Fake */}
      {dealToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-6 border border-slate-200 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Excluir Processo / Lead Fake</h3>
                <p className="text-xs text-slate-500">Limpeza cadastral definitiva</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-700 leading-relaxed bg-red-50 p-3 rounded-xl border border-red-200">
              Tem certeza de que deseja excluir o processo <strong>{dealToDelete.titulo}</strong> (#{dealToDelete.id})? Este registro será removido permanentemente da esteira operacional e do banco de dados.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDealToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  if (onDeleteDeal) {
                    await onDeleteDeal(dealToDelete.id);
                  }
                  if (dealToDelete.contact_id && onDeleteContact) {
                    await onDeleteContact(dealToDelete.contact_id);
                  }
                  setIsDeleting(false);
                  setDealToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Excluindo...' : 'Sim, Excluir Definitivamente'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Cadastro de Cliente */}
      {contactToEdit && (
        <ModalEditarLeadCliente
          isOpen={true}
          contact={contactToEdit}
          onClose={() => setContactToEdit(null)}
          onDelete={onDeleteContact ? async (contactId) => {
            await onDeleteContact(contactId);
            if (onDeleteDeal) {
              const relatedDeals = deals.filter(d => d.contact_id === contactId);
              for (const rd of relatedDeals) {
                await onDeleteDeal(rd.id);
              }
            }
            setContactToEdit(null);
          } : undefined}
          onSave={async (contactId, updates) => {
            if (onUpdateContact) {
              onUpdateContact(contactId, updates);
            }
            setContactToEdit(null);
          }}
        />
      )}
    </div>
  );
};
