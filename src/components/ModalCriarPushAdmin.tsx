import React, { useState, useEffect } from 'react';
import { 
  TipoNotificacao, 
  Usuario 
} from '../types';
import { 
  sendAdminPushNotification, 
  getAdminPushHistory, 
  deleteAdminPushFromHistory, 
  AdminPushPayload,
  playNotificationSound,
  isNotificationSupported,
  requestNotificationPermission,
  getNotificationPermission
} from '../services/notificationService';
import { 
  BellRing, 
  Send, 
  X, 
  Volume2, 
  Users, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  Trash2, 
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Radio,
  ExternalLink
} from 'lucide-react';

interface ModalCriarPushAdminProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: Usuario;
  onNavigateTab?: (tabId: string) => void;
}

const PRESET_MESSAGES = [
  {
    titulo: '⚠️ Atenção: Prazo de Exigência Cartorária Próximo do Vencimento',
    mensagem: 'Verifique os processos na esteira técnica com nota devolutiva pendente para evitar preclusão dos 30 dias.',
    tipo: 'ALERTA' as TipoNotificacao,
    destinatario: 'TECNICOS' as const,
    link_aba: 'tecnico'
  },
  {
    titulo: '🚀 Meta Batida! Parabéns à Equipe Comercial',
    mensagem: 'Ultrapassamos a meta semanal de agendamentos de diagnósticos registrais com SLA médio inferior a 3 minutos.',
    tipo: 'SUCESSO' as TipoNotificacao,
    destinatario: 'TODOS' as const,
    link_aba: 'comercial'
  },
  {
    titulo: '📅 Reunião Geral de Alinhamento Técnico & Notarial',
    mensagem: 'Alinhamento geral sobre aplicação do Provimento 65/CNJ e novidades do registro de imóveis hoje às 17h.',
    tipo: 'GERAL' as TipoNotificacao,
    destinatario: 'TODOS' as const,
    link_aba: 'atividades'
  },
  {
    titulo: '📢 Novo Lote de Matrículas e Laudos Disponíveis para Auditoria',
    mensagem: 'Cinco novos memoriais descritivos e certidões imobiliárias foram inseridos para validação técnica.',
    tipo: 'DOCUMENTO_ENVIADO' as TipoNotificacao,
    destinatario: 'TECNICOS' as const,
    link_aba: 'esteira_clientes'
  }
];

export const ModalCriarPushAdmin: React.FC<ModalCriarPushAdminProps> = ({
  isOpen,
  onClose,
  currentUser,
  onNavigateTab
}) => {
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipo, setTipo] = useState<TipoNotificacao>('GERAL');
  const [destinatario, setDestinatario] = useState<'TODOS' | 'ADMINS' | 'TECNICOS' | 'SDRS' | 'PARCEIROS'>('TODOS');
  const [linkAba, setLinkAba] = useState<string>('comercial');
  const [enviando, setEnviando] = useState(false);
  const [sucessoMsg, setSucessoMsg] = useState(false);
  const [pushHistory, setPushHistory] = useState<AdminPushPayload[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<'NOVO' | 'HISTORICO'>('NOVO');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    if (isOpen) {
      setPushHistory(getAdminPushHistory());
      setPermissionStatus(getNotificationPermission());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSolicitarPermissao = async () => {
    const res = await requestNotificationPermission();
    setPermissionStatus(res);
  };

  const handleAplicarPreset = (preset: typeof PRESET_MESSAGES[0]) => {
    setTitulo(preset.titulo);
    setMensagem(preset.mensagem);
    setTipo(preset.tipo);
    setDestinatario(preset.destinatario);
    setLinkAba(preset.link_aba);
  };

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !mensagem.trim()) return;

    setEnviando(true);
    try {
      const { adminLog } = sendAdminPushNotification({
        titulo: titulo.trim(),
        mensagem: mensagem.trim(),
        tipo,
        destinatario,
        link_aba: linkAba,
        autor_nome: currentUser?.nome || 'Diretoria Brasil Legal'
      });

      setPushHistory(prev => [adminLog, ...prev]);
      setSucessoMsg(true);
      setTitulo('');
      setMensagem('');

      setTimeout(() => {
        setSucessoMsg(false);
      }, 3500);
    } catch (err) {
      console.error('Erro ao enviar push admin:', err);
    } finally {
      setEnviando(false);
    }
  };

  const handleReenviar = (item: AdminPushPayload) => {
    sendAdminPushNotification({
      titulo: item.titulo,
      mensagem: item.mensagem,
      tipo: item.tipo,
      destinatario: item.destinatario,
      link_aba: item.link_aba,
      autor_nome: currentUser?.nome || 'Diretoria Brasil Legal'
    });
    setPushHistory(getAdminPushHistory());
    setSucessoMsg(true);
    setTimeout(() => setSucessoMsg(false), 3000);
  };

  const handleExcluirHistorico = (id: string) => {
    const updated = deleteAdminPushFromHistory(id);
    setPushHistory(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header do Modal */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-[#F2EC00] flex items-center justify-center">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Central de Notificações Push (ADM)
                <span className="text-[10px] bg-amber-400/20 text-[#F2EC00] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Diretoria & Gestão
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Dispare alertas imediatos com som e push desktop para colaboradores e parceiros
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas Superiores */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAbaAtiva('NOVO')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                abaAtiva === 'NOVO'
                  ? 'bg-[#2E3192] text-white shadow-xs'
                  : 'bg-transparent text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Criar Novo Disparo
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva('HISTORICO')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                abaAtiva === 'HISTORICO'
                  ? 'bg-[#2E3192] text-white shadow-xs'
                  : 'bg-transparent text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Histórico Enviado ({pushHistory.length})
            </button>
          </div>

          <button
            type="button"
            onClick={playNotificationSound}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-[#2E3192] bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all flex items-center gap-1 shadow-2xs"
            title="Testar o sinal sonoro das notificações"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#2E3192]" />
            Testar Chime
          </button>
        </div>

        {/* Mensagem de Confirmação Sucesso */}
        {sucessoMsg && (
          <div className="mx-5 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between animate-in slide-in-from-top-2">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Notificação push disparada e sincronizada no sininho de todos os destinatários!
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
              Enviado com Sucesso
            </span>
          </div>
        )}

        {/* Corpo com Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {abaAtiva === 'NOVO' ? (
            <>
              {/* Alerta de Permissão Desktop */}
              {isNotificationSupported() && permissionStatus !== 'granted' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Notificações desktop no navegador ainda não estão autorizadas nesta janela.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSolicitarPermissao}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
                  >
                    Ativar no Navegador
                  </button>
                </div>
              )}

              {/* Modelos / Presets Rápidos */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Modelos Prontos de Disparo Imediato:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_MESSAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAplicarPreset(preset)}
                      className="text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-all text-xs group cursor-pointer"
                    >
                      <p className="font-bold text-slate-800 group-hover:text-[#2E3192] line-clamp-1">
                        {preset.titulo}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {preset.mensagem}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formulário Principal */}
              <form onSubmit={handleEnviar} className="space-y-3.5 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Título da Notificação *
                  </label>
                  <input
                    type="text"
                    required
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: 🔔 Reunião Geral de Regularização Notarial"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 focus:border-[#2E3192]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Mensagem Detalhada *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Escreva a mensagem clara e objetiva para os colaboradores..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 focus:border-[#2E3192]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Destinatário */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Destinatários
                    </label>
                    <select
                      value={destinatario}
                      onChange={(e) => setDestinatario(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 bg-white"
                    >
                      <option value="TODOS">👥 Toda a Equipe (Geral)</option>
                      <option value="TECNICOS">📐 Técnicos & Engenheiros</option>
                      <option value="SDRS">📞 Comercial & SDRs</option>
                      <option value="ADMINS">🛡️ Apenas Administradores</option>
                      <option value="PARCEIROS">🤝 Corretores & Parceiros B2B</option>
                    </select>
                  </div>

                  {/* Tipo / Estilo Visual */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Tipo de Alerta
                    </label>
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as TipoNotificacao)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 bg-white"
                    >
                      <option value="GERAL">Informativo Geral</option>
                      <option value="ALERTA">Aviso / Alerta Urgente</option>
                      <option value="SUCESSO">Sucesso / Conquista</option>
                      <option value="DOCUMENTO_ENVIADO">Documento / Laudo</option>
                      <option value="SLA_CRITICO">SLA / Atenção Prioritária</option>
                    </select>
                  </div>

                  {/* Link / Redirecionamento da Aba */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Aba de Destino (Clique)
                    </label>
                    <select
                      value={linkAba}
                      onChange={(e) => setLinkAba(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 bg-white"
                    >
                      <option value="atividades">📅 Atividades & Agenda</option>
                      <option value="comercial">👥 Funil Comercial (Leads)</option>
                      <option value="esteira_clientes">🗂️ Esteira de Clientes</option>
                      <option value="tecnico">⚖️ CRM Técnico & Cartório</option>
                      <option value="financeiro">💰 Financeiro & Split</option>
                      <option value="cobranca_boletos">🏦 Cobrança & Boletos</option>
                      <option value="assinaturas_digitais">✍️ Assinaturas Digitais</option>
                      <option value="cms_site">🌐 CMS Site & Blog</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
                  <span>
                    Ao enviar, o sininho tocará o chime em tempo real na tela dos colaboradores e a notificação será gravada no histórico de avisos in-app.
                  </span>
                </div>

                {/* Ações do Formulário */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviando || !titulo.trim() || !mensagem.trim()}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#2E3192] hover:bg-[#1C1E63] disabled:opacity-50 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {enviando ? 'Disparando...' : 'Disparar Push Imediato'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Visualização do Histórico de Envios */
            <div className="space-y-3">
              {pushHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <BellRing className="w-8 h-8 mx-auto opacity-40" />
                  <p className="text-xs font-medium">Nenhuma notificação foi enviada pelo ADM ainda.</p>
                </div>
              ) : (
                pushHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{item.titulo}</span>
                        <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-[#2E3192] font-bold rounded-md">
                          {item.destinatario}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.data_hora}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {item.mensagem}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                        <span>Autor: {item.autor_nome || 'Diretoria'}</span>
                        {item.link_aba && <span>Aba: #{item.link_aba}</span>}
                        {item.enviado_desktop && (
                          <span className="text-emerald-600 font-medium">✓ Desktop ativado</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReenviar(item)}
                        className="p-1.5 text-xs font-bold text-[#2E3192] hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
                        title="Reenviar agora com 1 clique"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reenviar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExcluirHistorico(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir do histórico"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
