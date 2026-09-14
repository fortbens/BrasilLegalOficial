import React, { useState, useEffect } from 'react';
import { Usuario, TipoNotificacao } from '../../types';
import { 
  sendAdminPushNotification, 
  getAdminPushHistory, 
  deleteAdminPushFromHistory, 
  AdminPushPayload,
  playNotificationSound,
  isNotificationSupported,
  requestNotificationPermission,
  getNotificationPermission
} from '../../services/notificationService';
import { 
  BellRing, 
  Send, 
  Volume2, 
  Sparkles, 
  Clock, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Users, 
  ShieldCheck, 
  Layers
} from 'lucide-react';

interface GerenciadorNotificacoesPushAdminProps {
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

export const GerenciadorNotificacoesPushAdmin: React.FC<GerenciadorNotificacoesPushAdminProps> = ({
  currentUser,
  onNavigateTab
}) => {
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipo, setTipo] = useState<TipoNotificacao>('GERAL');
  const [destinatario, setDestinatario] = useState<'TODOS' | 'ADMINS' | 'TECNICOS' | 'SDRS' | 'PARCEIROS'>('TODOS');
  const [linkAba, setLinkAba] = useState<string>('atividades');
  const [enviando, setEnviando] = useState(false);
  const [sucessoMsg, setSucessoMsg] = useState(false);
  const [pushHistory, setPushHistory] = useState<AdminPushPayload[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    setPushHistory(getAdminPushHistory());
    setPermissionStatus(getNotificationPermission());
  }, []);

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
      }, 4000);
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
    <div className="space-y-6">
      {/* Banner Principal */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-700 flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Central de Notificações Push & Alertas de Sininho (ADM)
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full uppercase">
                Administração
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Dispare avisos imediatos com áudio chime e notificações na barra de tarefas para os colaboradores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={playNotificationSound}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#2E3192] bg-white border border-slate-300 rounded-xl hover:border-slate-400 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Tocar o som de alerta que os colaboradores ouvirão"
          >
            <Volume2 className="w-4 h-4 text-[#2E3192]" />
            <span>Testar Chime</span>
          </button>

          {isNotificationSupported() && permissionStatus !== 'granted' && (
            <button
              type="button"
              onClick={handleSolicitarPermissao}
              className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Ativar Desktop</span>
            </button>
          )}
        </div>
      </div>

      {sucessoMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between animate-in slide-in-from-top-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Notificação disparada com sucesso! O sininho tocará em tempo real na tela dos colaboradores.
          </span>
          <span className="text-[10px] text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded-full font-mono">
            Disparado
          </span>
        </div>
      )}

      {/* Grid com Formulário e Histórico */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Esquerdo: Criação e Presets (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Modelos Rápidos de Disparo:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_MESSAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAplicarPreset(preset)}
                  className="text-left p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/70 hover:border-indigo-300 transition-all text-xs group cursor-pointer"
                >
                  <p className="font-bold text-slate-800 group-hover:text-[#2E3192] line-clamp-1">
                    {preset.titulo}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {preset.mensagem}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleEnviar} className="space-y-3.5 pt-3 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Título do Alerta *
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: 🔔 Aviso Urgente: Prazo de Exigência Cartorária"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 focus:border-[#2E3192]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Conteúdo da Mensagem *
              </label>
              <textarea
                required
                rows={3}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Descreva as instruções claras para os colaboradores que receberão o push..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 focus:border-[#2E3192]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Público Alvo
                </label>
                <select
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 bg-white"
                >
                  <option value="TODOS">👥 Toda a Equipe</option>
                  <option value="TECNICOS">📐 Técnicos / Engenheiros</option>
                  <option value="SDRS">📞 Comercial / SDRs</option>
                  <option value="ADMINS">🛡️ Administradores</option>
                  <option value="PARCEIROS">🤝 Parceiros B2B</option>
                </select>
              </div>

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
                  <option value="ALERTA">Aviso / Atenção</option>
                  <option value="SUCESSO">Sucesso / Meta</option>
                  <option value="DOCUMENTO_ENVIADO">Documento / Laudo</option>
                  <option value="SLA_CRITICO">SLA / Prioritário</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Aba de Destino
                </label>
                <select
                  value={linkAba}
                  onChange={(e) => setLinkAba(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 bg-white"
                >
                  <option value="atividades">📅 Atividades & Agenda</option>
                  <option value="comercial">👥 Funil Comercial</option>
                  <option value="esteira_clientes">🗂️ Esteira de Clientes</option>
                  <option value="tecnico">⚖️ CRM Técnico</option>
                  <option value="financeiro">💰 Financeiro</option>
                  <option value="cobranca_boletos">🏦 Boletos Bancários</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
              <span>
                Notificação enviada em tempo real com evento CustomEvent in-app, gravação no sininho e som Web Audio API.
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={enviando || !titulo.trim() || !mensagem.trim()}
                className="px-6 py-2.5 bg-[#2E3192] hover:bg-[#1C1E63] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{enviando ? 'Disparando Notificação...' : 'Disparar Notificação Imediata'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Lado Direito: Histórico de Envios (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#2E3192]" />
              Histórico de Disparos ({pushHistory.length})
            </h3>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] pr-1">
            {pushHistory.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <BellRing className="w-8 h-8 mx-auto opacity-30 stroke-1" />
                <p className="text-xs font-medium">Nenhuma notificação foi enviada pelo ADM ainda.</p>
              </div>
            ) : (
              pushHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">{item.titulo}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-[#2E3192] font-bold rounded-md shrink-0">
                      {item.destinatario}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {item.mensagem}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-400">
                    <span>{item.data_hora}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleReenviar(item)}
                        className="text-[#2E3192] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        title="Reenviar agora"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reenviar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExcluirHistorico(item.id)}
                        className="text-slate-400 hover:text-red-600 p-0.5 cursor-pointer"
                        title="Excluir do histórico"
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
      </div>
    </div>
  );
};
