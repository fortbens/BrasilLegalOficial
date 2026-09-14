import React, { useState, useMemo } from 'react';
import { 
  Atividade, 
  TipoAtividade, 
  StatusAtividade, 
  PrioridadeAtividade, 
  Contact, 
  Deal, 
  Usuario 
} from '../types';
import { 
  getGoogleCalendarUrl, 
  getGoogleCalendarDayUrl, 
  downloadIcsFile 
} from '../utils/calendarUtils';
import { sendDesktopNotification } from '../services/notificationService';
import { ModalCriarPushAdmin } from './ModalCriarPushAdmin';
import { 
  Calendar, 
  CalendarCheck, 
  Clock, 
  MapPin, 
  Video, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  CheckSquare, 
  User, 
  Building, 
  ExternalLink, 
  Download, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  BellRing, 
  Eye, 
  FileText, 
  Compass, 
  Send,
  CalendarDays,
  ListFilter,
  Columns3,
  List,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

interface ModuloAtividadesAgendaProps {
  atividades: Atividade[];
  contacts: Contact[];
  deals: Deal[];
  allUsers: Usuario[];
  currentUser: Usuario;
  onSaveAtividade: (atividade: Atividade) => void;
  onDeleteAtividade: (id: string) => void;
  onNavigateTab?: (tabId: string) => void;
}

export const ModuloAtividadesAgenda: React.FC<ModuloAtividadesAgendaProps> = ({
  atividades,
  contacts,
  deals,
  allUsers,
  currentUser,
  onSaveAtividade,
  onDeleteAtividade,
  onNavigateTab
}) => {
  // Estados de Filtros e Busca
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('TODOS');
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>('TODOS');
  const [modoVisualizacao, setModoVisualizacao] = useState<'LISTA' | 'SEMANAL' | 'KANBAN'>('LISTA');

  // Modal de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAtividade, setEditingAtividade] = useState<Atividade | null>(null);

  // Modal de Confirmação de Exclusão Interativa (substitui window.confirm restrito por iframe)
  const [atividadeParaExcluir, setAtividadeParaExcluir] = useState<Atividade | null>(null);
  const [feedbackMensagem, setFeedbackMensagem] = useState<string | null>(null);

  // Modal de Push do Administrador
  const [isPushAdminModalOpen, setIsPushAdminModalOpen] = useState(false);

  // Estado do Formulário
  const [formData, setFormData] = useState<Partial<Atividade>>({
    tipo: 'REUNIAO',
    status: 'PENDENTE',
    prioridade: 'MEDIA',
    data_inicio: new Date().toISOString().split('T')[0],
    hora_inicio: '10:00',
    hora_fim: '11:00',
    notificar_minutos_antes: 30,
    sincronizado_google: true
  });

  // Métricas
  const metricas = useMemo(() => {
    const total = atividades.length;
    const pendentes = atividades.filter(a => a.status === 'PENDENTE' || a.status === 'EM_ANDAMENTO').length;
    const concluidas = atividades.filter(a => a.status === 'CONCLUIDA').length;
    const vistoriasCartorio = atividades.filter(a => 
      a.tipo === 'VISTORIA_TECNICA' || a.tipo === 'DILIGENCIA_CARTORIO'
    ).length;
    const urgentes = atividades.filter(a => a.prioridade === 'URGENTE' && a.status !== 'CONCLUIDA').length;

    return { total, pendentes, concluidas, vistoriasCartorio, urgentes };
  }, [atividades]);

  // Lista Filtrada
  const atividadesFiltradas = useMemo(() => {
    return atividades.filter(item => {
      const matchBusca = 
        item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        (item.descricao && item.descricao.toLowerCase().includes(busca.toLowerCase())) ||
        (item.cliente_nome && item.cliente_nome.toLowerCase().includes(busca.toLowerCase())) ||
        (item.local && item.local.toLowerCase().includes(busca.toLowerCase())) ||
        (item.deal_titulo && item.deal_titulo.toLowerCase().includes(busca.toLowerCase()));

      const matchTipo = filtroTipo === 'TODOS' || item.tipo === filtroTipo;
      const matchStatus = filtroStatus === 'TODOS' || item.status === filtroStatus;
      const matchPrioridade = filtroPrioridade === 'TODOS' || item.prioridade === filtroPrioridade;
      const matchResponsavel = filtroResponsavel === 'TODOS' || item.responsavel_id === filtroResponsavel;

      return matchBusca && matchTipo && matchStatus && matchPrioridade && matchResponsavel;
    }).sort((a, b) => {
      // Ordena por data e hora de início
      const dataA = `${a.data_inicio} ${a.hora_inicio}`;
      const dataB = `${b.data_inicio} ${b.hora_inicio}`;
      return dataA.localeCompare(dataB);
    });
  }, [atividades, busca, filtroTipo, filtroStatus, filtroPrioridade, filtroResponsavel]);

  // Handlers
  const handleOpenNovo = () => {
    setEditingAtividade(null);
    setFormData({
      titulo: '',
      descricao: '',
      tipo: 'REUNIAO',
      status: 'PENDENTE',
      prioridade: 'MEDIA',
      data_inicio: new Date().toISOString().split('T')[0],
      hora_inicio: '10:00',
      hora_fim: '11:00',
      local: '',
      link_meet: '',
      cliente_id: '',
      cliente_nome: '',
      deal_id: '',
      deal_titulo: '',
      responsavel_id: currentUser?.id || allUsers[0]?.id || '',
      responsavel_nome: currentUser?.nome || allUsers[0]?.nome || '',
      notificar_minutos_antes: 30,
      sincronizado_google: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Atividade) => {
    setEditingAtividade(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleToggleStatus = (item: Atividade) => {
    const novoStatus: StatusAtividade = item.status === 'CONCLUIDA' ? 'PENDENTE' : 'CONCLUIDA';
    const atualizada: Atividade = {
      ...item,
      status: novoStatus,
      atualizado_em: new Date().toISOString()
    };
    onSaveAtividade(atualizada);

    if (novoStatus === 'CONCLUIDA') {
      sendDesktopNotification({
        tipo: 'GERAL',
        titulo: '✅ Atividade Concluída!',
        mensagem: `A atividade "${item.titulo}" foi marcada como realizada por ${currentUser?.nome || 'Usuário'}.`,
        link_aba: 'atividades'
      });
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo?.trim() || !formData.data_inicio) return;

    // Resgata nome do cliente e do deal se selecionados
    let clienteNome = formData.cliente_nome;
    if (formData.cliente_id) {
      const c = contacts.find(contact => contact.id === formData.cliente_id);
      if (c) clienteNome = c.nome_completo;
    }

    let dealTitulo = formData.deal_titulo;
    if (formData.deal_id) {
      const d = deals.find(deal => deal.id === formData.deal_id);
      if (d) dealTitulo = d.titulo;
    }

    let responsavelNome = formData.responsavel_nome;
    if (formData.responsavel_id) {
      const u = allUsers.find(user => user.id === formData.responsavel_id);
      if (u) responsavelNome = u.nome;
    }

    const payload: Atividade = {
      id: editingAtividade?.id || `ativ-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      titulo: formData.titulo.trim(),
      descricao: formData.descricao || '',
      tipo: formData.tipo || 'REUNIAO',
      status: formData.status || 'PENDENTE',
      prioridade: formData.prioridade || 'MEDIA',
      data_inicio: formData.data_inicio,
      hora_inicio: formData.hora_inicio || '09:00',
      data_fim: formData.data_fim || formData.data_inicio,
      hora_fim: formData.hora_fim || '10:00',
      local: formData.local || '',
      link_meet: formData.link_meet || '',
      cliente_id: formData.cliente_id || undefined,
      cliente_nome: clienteNome,
      deal_id: formData.deal_id || undefined,
      deal_titulo: dealTitulo,
      responsavel_id: formData.responsavel_id || undefined,
      responsavel_nome: responsavelNome,
      notificar_minutos_antes: formData.notificar_minutos_antes || 30,
      sincronizado_google: formData.sincronizado_google ?? true,
      criado_em: editingAtividade?.criado_em || new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    };

    onSaveAtividade(payload);
    setIsModalOpen(false);

    // Disparar Notificação Push In-App + Som
    sendDesktopNotification({
      tipo: 'GERAL',
      titulo: editingAtividade ? '📝 Atividade Atualizada' : '📅 Nova Atividade Agendada',
      mensagem: `${payload.titulo} marcada para ${payload.data_inicio} às ${payload.hora_inicio}.`,
      link_aba: 'atividades'
    });
  };

  const handleConfirmarExclusao = () => {
    if (!atividadeParaExcluir) return;
    const id = atividadeParaExcluir.id;
    const titulo = atividadeParaExcluir.titulo;
    onDeleteAtividade(id);
    setAtividadeParaExcluir(null);
    setIsModalOpen(false);
    setFeedbackMensagem(`Atividade "${titulo}" foi excluída com sucesso.`);
    setTimeout(() => setFeedbackMensagem(null), 4000);
    sendDesktopNotification({
      tipo: 'GERAL',
      titulo: '🗑️ Atividade Excluída',
      mensagem: `A atividade "${titulo}" foi removida da agenda.`,
      link_aba: 'atividades'
    });
  };

  const getTipoBadge = (tipo: TipoAtividade) => {
    switch (tipo) {
      case 'VISTORIA_TECNICA':
        return { label: 'Vistoria Técnica', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'DILIGENCIA_CARTORIO':
        return { label: 'Cartório / Prenotação', bg: 'bg-indigo-50 text-[#2E3192] border-indigo-200' };
      case 'REUNIAO':
        return { label: 'Reunião', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'PRAZO_PROCESSUAL':
        return { label: 'Prazo / Nota Devolutiva', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'ASSINATURA_CONTRATO':
        return { label: 'Assinatura Contrato', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'AUDIENCIA_MEDIACAO':
        return { label: 'Audiência Mediação', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: 'Atendimento', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getPrioridadeBadge = (prioridade: PrioridadeAtividade) => {
    switch (prioridade) {
      case 'URGENTE':
        return 'bg-red-50 text-red-700 border-red-200 font-bold';
      case 'ALTA':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
      case 'MEDIA':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. Header com Título e Ações Globais */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2E3192]/10 text-[#2E3192] flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Atividades & Google Agenda
                <span className="text-xs bg-indigo-50 text-[#2E3192] font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
                  Sincronização 1-Clique
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Planejamento de vistorias técnicas com drone, diligências cartorárias e prazos registrais
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Botão de Disparo de Notificações Push do ADM */}
          {currentUser.role === 'ADMIN' && (
            <button
              type="button"
              onClick={() => setIsPushAdminModalOpen(true)}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Disparar aviso ou notificação push para toda a equipe ou cargos específicos"
            >
              <BellRing className="w-4 h-4" />
              <span>Notificações Push (ADM)</span>
            </button>
          )}

          {/* Botão Google Agenda do Dia */}
          <a
            href={getGoogleCalendarDayUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            title="Abrir o Google Agenda em nova aba"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>Abrir Google Agenda</span>
          </a>

          {/* Botão Nova Atividade */}
          <button
            type="button"
            onClick={handleOpenNovo}
            className="px-4 py-2 bg-[#2E3192] hover:bg-[#1C1E63] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Atividade</span>
          </button>
        </div>
      </div>

      {/* Feedback de Ação */}
      {feedbackMensagem && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between gap-2 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMensagem}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMensagem(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-xs p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Cards de Métricas em Tempo Real */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Total</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metricas.total}</div>
          <div className="text-[10px] text-slate-500 mt-1">Registradas no módulo</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Pendentes</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-700">{metricas.pendentes}</div>
          <div className="text-[10px] text-slate-500 mt-1">Aguardando execução</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Vistorias & Cartório</span>
            <Compass className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{metricas.vistoriasCartorio}</div>
          <div className="text-[10px] text-slate-500 mt-1">Atividades de campo</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">Prazos Urgentes</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600">{metricas.urgentes}</div>
          <div className="text-[10px] text-slate-500 mt-1">Notas devolutivas</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Concluídas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">{metricas.concluidas}</div>
          <div className="text-[10px] text-slate-500 mt-1">Executadas com sucesso</div>
        </div>
      </div>

      {/* 3. Barra de Filtros, Pesquisa e Seletor de Modo */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Busca por Texto */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por título, cliente, endereço ou processo..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 focus:border-[#2E3192]"
            />
          </div>

          {/* Seletor de Modos de Exibição */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setModoVisualizacao('LISTA')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                modoVisualizacao === 'LISTA'
                  ? 'bg-white text-[#2E3192] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabela</span>
            </button>
            <button
              type="button"
              onClick={() => setModoVisualizacao('SEMANAL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                modoVisualizacao === 'SEMANAL'
                  ? 'bg-white text-[#2E3192] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Semana</span>
            </button>
            <button
              type="button"
              onClick={() => setModoVisualizacao('KANBAN')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                modoVisualizacao === 'KANBAN'
                  ? 'bg-white text-[#2E3192] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>
        </div>

        {/* Dropdowns de Filtro */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Tipo de Atividade
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#2E3192]"
            >
              <option value="TODOS">Todos os Tipos</option>
              <option value="VISTORIA_TECNICA">Vistoria Técnica (Drone/RTK)</option>
              <option value="DILIGENCIA_CARTORIO">Diligência em Cartório</option>
              <option value="REUNIAO">Reunião / Atendimento</option>
              <option value="PRAZO_PROCESSUAL">Prazo / Nota Devolutiva</option>
              <option value="ASSINATURA_CONTRATO">Assinatura de Contrato</option>
              <option value="AUDIENCIA_MEDIACAO">Audiência de Mediação</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#2E3192]"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="CONCLUIDA">Concluída</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Prioridade
            </label>
            <select
              value={filtroPrioridade}
              onChange={(e) => setFiltroPrioridade(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#2E3192]"
            >
              <option value="TODOS">Todas as Prioridades</option>
              <option value="URGENTE">Urgente</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Média</option>
              <option value="BAIXA">Baixa</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Responsável Técnico
            </label>
            <select
              value={filtroResponsavel}
              onChange={(e) => setFiltroResponsavel(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#2E3192]"
            >
              <option value="TODOS">Toda a Equipe</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({u.cargo || u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Corpo Principal de Acordo com o Modo Selecionado */}
      {atividadesFiltradas.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
          <h3 className="text-sm font-bold text-slate-700">Nenhuma atividade encontrada</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Não existem compromissos correspondentes aos filtros selecionados. Crie uma nova atividade ou limpe os filtros para visualizar os agendamentos.
          </p>
          <button
            type="button"
            onClick={handleOpenNovo}
            className="px-4 py-2 bg-[#2E3192] hover:bg-[#1C1E63] text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Primeira Atividade
          </button>
        </div>
      ) : modoVisualizacao === 'LISTA' ? (
        /* ================= MODO 1: TABELA OPERACIONAL ================= */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">Status</th>
                  <th className="py-3 px-4">Atividade & Escopo</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Cliente / Processo</th>
                  <th className="py-3 px-4">Data & Horário</th>
                  <th className="py-3 px-4">Responsável</th>
                  <th className="py-3 px-4">Prioridade</th>
                  <th className="py-3 px-4 text-right">Integração & Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {atividadesFiltradas.map((item) => {
                  const tipoInfo = getTipoBadge(item.tipo);
                  const isConcluida = item.status === 'CONCLUIDA';

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isConcluida ? 'bg-slate-50/40 opacity-75' : ''
                      }`}
                    >
                      {/* Checkbox de Conclusão Rápida */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                            isConcluida
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-[#2E3192] text-transparent'
                          }`}
                          title={isConcluida ? 'Marcar como pendente' : 'Marcar como concluída'}
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                        </button>
                      </td>

                      {/* Título & Descrição / Local */}
                      <td className="py-3 px-4 min-w-[220px]">
                        <div className="font-bold text-slate-900 line-clamp-1">
                          {item.titulo}
                        </div>
                        {item.descricao && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.descricao}
                          </div>
                        )}
                        {item.local && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{item.local}</span>
                          </div>
                        )}
                        {item.link_meet && (
                          <a
                            href={item.link_meet}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-1 font-medium"
                          >
                            <Video className="w-3 h-3 text-blue-500 shrink-0" />
                            <span>Entrar na Reunião (Meet)</span>
                          </a>
                        )}
                      </td>

                      {/* Badge Tipo */}
                      <td className="py-3 px-4 shrink-0">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border font-medium ${tipoInfo.bg}`}>
                          {tipoInfo.label}
                        </span>
                      </td>

                      {/* Cliente e Processo */}
                      <td className="py-3 px-4 min-w-[160px]">
                        {item.cliente_nome ? (
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{item.cliente_nome}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                        {item.deal_titulo && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            <span className="truncate">{item.deal_titulo}</span>
                          </div>
                        )}
                      </td>

                      {/* Data e Horário */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{item.data_inicio.split('-').reverse().join('/')}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{item.hora_inicio} {item.hora_fim ? `às ${item.hora_fim}` : ''}</span>
                        </div>
                      </td>

                      {/* Responsável */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-medium text-[11px]">
                          {item.responsavel_nome || 'Equipe Geral'}
                        </div>
                      </td>

                      {/* Prioridade */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] border ${getPrioridadeBadge(item.prioridade)}`}>
                          {item.prioridade}
                        </span>
                      </td>

                      {/* Ações com Google Agenda & ICS */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Sincronizar Google Agenda com 1 clique */}
                          <a
                            href={getGoogleCalendarUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg text-[10px] font-bold transition-all shadow-2xs flex items-center gap-1"
                            title="Adicionar evento diretamente na sua conta do Google Agenda"
                          >
                            <Calendar className="w-3 h-3 text-blue-600" />
                            <span>Google Agenda</span>
                          </a>

                          {/* Baixar ICS */}
                          <button
                            type="button"
                            onClick={() => downloadIcsFile(item)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Exportar arquivo .ics (Outlook, Apple Calendar)"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {/* Editar */}
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-[#2E3192] hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar Atividade"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={() => setAtividadeParaExcluir(item)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir Atividade"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : modoVisualizacao === 'SEMANAL' ? (
        /* ================= MODO 2: VISÃO SEMANAL / CALENDÁRIO ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {atividadesFiltradas.map((item) => {
            const tipoInfo = getTipoBadge(item.tipo);
            const isConcluida = item.status === 'CONCLUIDA';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between ${
                  isConcluida ? 'border-slate-200 opacity-80' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] border font-semibold ${tipoInfo.bg}`}>
                      {tipoInfo.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] border ${getPrioridadeBadge(item.prioridade)}`}>
                      {item.prioridade}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2">
                    {item.titulo}
                  </h4>

                  {item.descricao && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {item.descricao}
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100 mb-4">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-[#2E3192]" />
                      <span>{item.data_inicio.split('-').reverse().join('/')} às {item.hora_inicio}</span>
                    </div>

                    {item.local && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.local}</span>
                      </div>
                    )}

                    {item.cliente_nome && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Cliente: {item.cliente_nome}</span>
                      </div>
                    )}

                    {item.responsavel_nome && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Resp: {item.responsavel_nome}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                      isConcluida
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>{isConcluida ? 'Concluída' : 'Concluir'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <a
                      href={getGoogleCalendarUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all"
                      title="Adicionar ao Google Agenda"
                    >
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="p-2 text-slate-500 hover:text-[#2E3192] hover:bg-slate-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAtividadeParaExcluir(item)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Atividade"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= MODO 3: KANBAN POR STATUS ================= */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'] as StatusAtividade[]).map((statusCol) => {
            const colItems = atividadesFiltradas.filter(a => a.status === statusCol);
            const colTitles: Record<StatusAtividade, { label: string; bg: string; text: string }> = {
              PENDENTE: { label: 'A Fazer / Pendentes', bg: 'bg-amber-100', text: 'text-amber-900' },
              EM_ANDAMENTO: { label: 'Em Andamento / Campo', bg: 'bg-blue-100', text: 'text-blue-900' },
              CONCLUIDA: { label: 'Concluídas / Protocoladas', bg: 'bg-emerald-100', text: 'text-emerald-900' },
              CANCELADA: { label: 'Canceladas', bg: 'bg-slate-100', text: 'text-slate-800' }
            };

            return (
              <div key={statusCol} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col min-h-[450px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${colTitles[statusCol].bg} ${colTitles[statusCol].text}`}>
                    {colTitles[statusCol].label} ({colItems.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenNovo}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colItems.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      Nenhuma atividade
                    </div>
                  ) : (
                    colItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getTipoBadge(item.tipo).bg}`}>
                            {getTipoBadge(item.tipo).label}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-md border ${getPrioridadeBadge(item.prioridade)}`}>
                            {item.prioridade}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-xs line-clamp-2">
                          {item.titulo}
                        </h4>

                        <div className="text-[10px] text-slate-500 space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            <Clock className="w-3 h-3 text-[#2E3192]" />
                            <span>{item.data_inicio.split('-').reverse().join('/')} às {item.hora_inicio}</span>
                          </div>
                          {item.cliente_nome && (
                            <div className="truncate">Cliente: {item.cliente_nome}</div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <a
                            href={getGoogleCalendarUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                          >
                            <Calendar className="w-3 h-3 text-blue-500" />
                            <span>+ Google Agenda</span>
                          </a>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                              title="Editar Atividade"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item)}
                              className="p-1 text-slate-400 hover:text-emerald-600 rounded-md transition-colors cursor-pointer"
                              title="Avançar status"
                            >
                              <CheckSquare className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setAtividadeParaExcluir(item)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                              title="Excluir Atividade"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Modal de Cadastro / Edição de Atividade */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div 
            className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2E3192] flex items-center justify-center text-white">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {editingAtividade ? 'Editar Atividade' : 'Cadastrar Nova Atividade'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Sincronizável com o Google Agenda e notificação push instantânea
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Título */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Título da Atividade *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo || ''}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Vistoria Técnica com Drone na Fazenda São Bento"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 focus:border-[#2E3192]"
                />
              </div>

              {/* Tipo e Prioridade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Tipo de Atividade *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoAtividade })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 bg-white"
                  >
                    <option value="REUNIAO">Reunião / Alinhamento</option>
                    <option value="VISTORIA_TECNICA">Vistoria Técnica (Drone/RTK)</option>
                    <option value="DILIGENCIA_CARTORIO">Diligência em Cartório</option>
                    <option value="PRAZO_PROCESSUAL">Prazo / Nota Devolutiva</option>
                    <option value="ASSINATURA_CONTRATO">Assinatura de Contrato</option>
                    <option value="ATENDIMENTO_CLIENTE">Atendimento ao Cliente</option>
                    <option value="AUDIENCIA_MEDIACAO">Audiência de Mediação</option>
                    <option value="OUTRO">Outro Compromisso</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as PrioridadeAtividade })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 bg-white"
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente (Prazo Fatal)</option>
                  </select>
                </div>
              </div>

              {/* Data e Hora */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-800 block mb-1">
                    Data Início *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.data_inicio || ''}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-800 block mb-1">
                    Hora Início *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.hora_inicio || '09:00'}
                    onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-800 block mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={formData.data_fim || formData.data_inicio || ''}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-800 block mb-1">
                    Hora Fim
                  </label>
                  <input
                    type="time"
                    value={formData.hora_fim || '10:00'}
                    onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              {/* Vínculo de Cliente e Processo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Cliente / Proprietário Vinculado
                  </label>
                  <select
                    value={formData.cliente_id || ''}
                    onChange={(e) => {
                      const cId = e.target.value;
                      const c = contacts.find(item => item.id === cId);
                      setFormData({ 
                        ...formData, 
                        cliente_id: cId, 
                        cliente_nome: c ? c.nome_completo : '' 
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 bg-white"
                  >
                    <option value="">Nenhum cliente vinculado</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome_completo} ({c.endereco?.cidade || 'Brasil'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Processo / Negócio (Esteira)
                  </label>
                  <select
                    value={formData.deal_id || ''}
                    onChange={(e) => {
                      const dId = e.target.value;
                      const d = deals.find(item => item.id === dId);
                      setFormData({ 
                        ...formData, 
                        deal_id: dId, 
                        deal_titulo: d ? d.titulo : '' 
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 bg-white"
                  >
                    <option value="">Nenhum processo vinculado</option>
                    {deals.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.titulo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Responsável e Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Responsável pela Execução
                  </label>
                  <select
                    value={formData.responsavel_id || ''}
                    onChange={(e) => {
                      const uId = e.target.value;
                      const u = allUsers.find(item => item.id === uId);
                      setFormData({ 
                        ...formData, 
                        responsavel_id: uId, 
                        responsavel_nome: u ? u.nome : '' 
                      });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 bg-white"
                  >
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome} ({u.cargo || u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Status Atual
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusAtividade })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 bg-white"
                  >
                    <option value="PENDENTE">Pendente</option>
                    <option value="EM_ANDAMENTO">Em Andamento</option>
                    <option value="CONCLUIDA">Concluída</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>
              </div>

              {/* Local / Endereço */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Local / Endereço (Vistoria ou Cartório)
                </label>
                <input
                  type="text"
                  value={formData.local || ''}
                  onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                  placeholder="Ex: Av. Paulista, 1000 ou 1º Cartório de Registro de Imóveis"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20"
                />
              </div>

              {/* Link do Google Meet */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center justify-between">
                  <span>Link da Reunião Virtual (Google Meet / Zoom)</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, link_meet: 'https://meet.google.com/new' })}
                    className="text-[10px] text-blue-600 hover:underline font-bold"
                  >
                    Gerar link Google Meet
                  </button>
                </label>
                <input
                  type="url"
                  value={formData.link_meet || ''}
                  onChange={(e) => setFormData({ ...formData, link_meet: e.target.value })}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20"
                />
              </div>

              {/* Descrição / Pauta */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Descrição & Instruções Técnicas
                </label>
                <textarea
                  rows={3}
                  value={formData.descricao || ''}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Instruções para a equipe de campo ou pauta da reunião com o cliente..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20"
                />
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Sincronização com o Google Agenda é gerada automaticamente ao salvar.</span>
                </div>
              </div>

              {/* Footer de Ações do Modal */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200">
                {editingAtividade ? (
                  <button
                    type="button"
                    onClick={() => setAtividadeParaExcluir(editingAtividade)}
                    className="px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Atividade</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#2E3192] hover:bg-[#1C1E63] rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingAtividade ? 'Salvar Alterações' : 'Salvar Atividade'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal de Confirmação de Exclusão de Atividade */}
      {atividadeParaExcluir && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 p-6"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Excluir Atividade da Agenda?
                </h3>
                <p className="text-xs text-slate-500">
                  Esta operação removerá o agendamento permanentemente.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 mb-4 space-y-2 text-xs">
              <div className="font-bold text-slate-800 line-clamp-2">
                {atividadeParaExcluir.titulo}
              </div>
              <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-[#2E3192] shrink-0" />
                <span>
                  {atividadeParaExcluir.data_inicio.split('-').reverse().join('/')} às {atividadeParaExcluir.hora_inicio}
                  {atividadeParaExcluir.hora_fim ? ` - ${atividadeParaExcluir.hora_fim}` : ''}
                </span>
              </div>
              {atividadeParaExcluir.cliente_nome && (
                <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Cliente: {atividadeParaExcluir.cliente_nome}</span>
                </div>
              )}
              {atividadeParaExcluir.responsavel_nome && (
                <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                  <Compass className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">Responsável: {atividadeParaExcluir.responsavel_nome}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Tem certeza que deseja remover este compromisso? Caso esteja vinculado a uma vistoria técnica ou diligência de cartório, a tarefa não constará mais na grade da equipe.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAtividadeParaExcluir(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarExclusao}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Atividade</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal de Gestão de Notificações Push do Administrador */}
      <ModalCriarPushAdmin
        isOpen={isPushAdminModalOpen}
        onClose={() => setIsPushAdminModalOpen(false)}
        currentUser={currentUser}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
