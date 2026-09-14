import React, { useState, useMemo } from 'react';
import { 
  FluxoEmailMarketing, 
  EnvioEmailLog, 
  ConfigEmailMarketing, 
  Contact, 
  Deal, 
  AppSettings, 
  Usuario 
} from '../types';
import { 
  buildEmailVariables, 
  renderEmailTemplate, 
  EmailVariables 
} from '../utils/emailMarketingUtils';
import { sendAdminPushNotification, playNotificationSound } from '../services/notificationService';
import { 
  Mail, 
  Sparkles, 
  Send, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  FileText, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  RotateCcw, 
  ExternalLink, 
  Settings, 
  Check, 
  AlertCircle, 
  Filter, 
  Search, 
  BarChart3, 
  Layers, 
  Bot, 
  Smartphone, 
  Monitor, 
  Copy,
  Info
} from 'lucide-react';

interface ModuloEmailMarketingProps {
  fluxos: FluxoEmailMarketing[];
  onSaveFluxo: (fluxo: FluxoEmailMarketing) => void;
  logs: EnvioEmailLog[];
  onAddLog: (log: EnvioEmailLog) => void;
  config: ConfigEmailMarketing;
  onSaveConfig: (config: ConfigEmailMarketing) => void;
  contacts: Contact[];
  deals: Deal[];
  appSettings?: AppSettings;
  currentUser?: Usuario;
  onNavigateTab?: (tab: string) => void;
}

export const ModuloEmailMarketing: React.FC<ModuloEmailMarketingProps> = ({
  fluxos,
  onSaveFluxo,
  logs,
  onAddLog,
  config,
  onSaveConfig,
  contacts,
  deals,
  appSettings,
  currentUser,
  onNavigateTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'regua_templates' | 'gatilhos_automacoes' | 'relatorio_entregas' | 'config_smtp'>('regua_templates');
  const [selectedFluxoId, setSelectedFluxoId] = useState<string>(fluxos[0]?.id || 'fluxo-1');
  const [selectedContactId, setSelectedContactId] = useState<string>(contacts[0]?.id || '');
  const [isTestSending, setIsTestSending] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [searchTermLog, setSearchTermLog] = useState('');
  const [statusFilterLog, setStatusFilterLog] = useState<string>('TODOS');
  const [modalLogVisualizar, setModalLogVisualizar] = useState<EnvioEmailLog | null>(null);

  // Active Flow object
  const currentFluxo = useMemo(() => {
    return fluxos.find(f => f.id === selectedFluxoId) || fluxos[0];
  }, [fluxos, selectedFluxoId]);

  // Selected contact for simulation
  const selectedContact = useMemo(() => {
    return contacts.find(c => c.id === selectedContactId) || contacts[0] || null;
  }, [contacts, selectedContactId]);

  // Associated deal
  const selectedDeal = useMemo(() => {
    if (!selectedContact) return deals[0] || null;
    return deals.find(d => d.contact_id === selectedContact.id) || deals[0] || null;
  }, [deals, selectedContact]);

  // Calculated variables
  const emailVars: EmailVariables = useMemo(() => {
    return buildEmailVariables(selectedContact, selectedDeal, appSettings);
  }, [selectedContact, selectedDeal, appSettings]);

  // Rendered subject and body
  const renderedSubject = useMemo(() => {
    if (!currentFluxo) return '';
    return renderEmailTemplate(currentFluxo.assunto, emailVars);
  }, [currentFluxo, emailVars]);

  const renderedBodyHtml = useMemo(() => {
    if (!currentFluxo) return '';
    return renderEmailTemplate(currentFluxo.corpo_html, emailVars);
  }, [currentFluxo, emailVars]);

  // Total dispatch metric
  const totalDisparos = useMemo(() => {
    return fluxos.reduce((acc, f) => acc + (f.envios_total || 0), 0) + logs.length;
  }, [fluxos, logs]);

  // Insert variable tag into current flow HTML or subject
  const handleInsertVariable = (varTag: string) => {
    if (!currentFluxo) return;
    const updated = {
      ...currentFluxo,
      corpo_html: currentFluxo.corpo_html + ` ${varTag}`
    };
    onSaveFluxo(updated);
  };

  // Change subject or HTML
  const handleChangeSubject = (newSubject: string) => {
    if (!currentFluxo) return;
    onSaveFluxo({ ...currentFluxo, assunto: newSubject });
  };

  const handleChangeHtml = (newHtml: string) => {
    if (!currentFluxo) return;
    onSaveFluxo({ ...currentFluxo, corpo_html: newHtml });
  };

  const handleToggleAtivo = (checked: boolean) => {
    if (!currentFluxo) return;
    onSaveFluxo({ ...currentFluxo, ativo: checked });
  };

  // Trigger test dispatch
  const handleDispararTeste = () => {
    if (!currentFluxo) return;
    setIsTestSending(true);

    setTimeout(() => {
      const newLog: EnvioEmailLog = {
        id: `log-${Date.now()}`,
        fluxo_id: currentFluxo.id,
        fluxo_nome: currentFluxo.titulo,
        destinatario_nome: emailVars.nome_cliente,
        destinatario_email: emailVars.email_cliente,
        assunto: renderedSubject,
        corpo_renderizado: renderedBodyHtml,
        data_envio: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
        status: 'ENTREGUE',
        origem_gatilho: 'Disparo Manual de Teste',
        cliente_id: selectedContact?.id,
        deal_id: selectedDeal?.id,
        link_custodia: emailVars.link_custodia
      };

      onAddLog(newLog);

      // Increment flow stats
      onSaveFluxo({
        ...currentFluxo,
        envios_total: (currentFluxo.envios_total || 0) + 1
      });

      // Play sound and trigger push notification
      playNotificationSound();
      if (config.notificar_push_ao_enviar) {
        sendAdminPushNotification({
          titulo: `📧 E-mail Disparado: ${currentFluxo.badge}`,
          mensagem: `E-mail enviado para ${emailVars.nome_cliente} (${emailVars.email_cliente}). Assunto: "${renderedSubject}"`,
          tipo: 'EMAIL_MARKETING_DISPARADO',
          destinatario: 'TODOS',
          link_aba: 'email_marketing',
          autor_nome: currentUser?.nome || 'Automação de E-mail'
        });
      }

      setIsTestSending(false);
      setTestSuccessMessage(`E-mail de teste disparado com sucesso para ${emailVars.email_cliente}! Registro gravado no log.`);
      setTimeout(() => setTestSuccessMessage(''), 5000);
    }, 600);
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = 
        log.destinatario_nome.toLowerCase().includes(searchTermLog.toLowerCase()) ||
        log.destinatario_email.toLowerCase().includes(searchTermLog.toLowerCase()) ||
        log.assunto.toLowerCase().includes(searchTermLog.toLowerCase()) ||
        log.fluxo_nome.toLowerCase().includes(searchTermLog.toLowerCase());

      const matchStatus = statusFilterLog === 'TODOS' || log.status === statusFilterLog;
      return matchSearch && matchStatus;
    });
  }, [logs, searchTermLog, statusFilterLog]);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Banner exactly following screenshot styling */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2E3192] flex items-center justify-center shrink-0 border border-blue-100">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
              Módulo de E-mail Marketing Integrado & Automações White-Label
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Régua de relacionamento automatizada com gatilhos de CRM, links seguros de custódia e relatórios de entrega.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-xs text-slate-400 block font-medium">Total de Disparos:</span>
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {totalDisparos} envios
          </span>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('regua_templates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'regua_templates'
              ? 'bg-[#2E3192] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Régua de Automações & Templates</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('gatilhos_automacoes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'gatilhos_automacoes'
              ? 'bg-[#2E3192] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Gatilhos do CRM & Diagnóstico IA</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('relatorio_entregas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'relatorio_entregas'
              ? 'bg-[#2E3192] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Relatório de Entregas & Logs ({logs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('config_smtp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeSubTab === 'config_smtp'
              ? 'bg-[#2E3192] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Servidor SMTP & Remetente</span>
        </button>
      </div>

      {testSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between animate-in slide-in-from-top-2">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {testSuccessMessage}
          </span>
          <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-full font-mono">OK</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ABA: RÉGUA DE AUTOMAÇÕES & TEMPLATES (MATCHING USER SCREENSHOT)        */}
      {/* ========================================================================= */}
      {activeSubTab === 'regua_templates' && (
        <div className="space-y-6">
          {/* Top Fluxos Carousel / Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {fluxos.map((fluxo) => {
              const isSelected = fluxo.id === selectedFluxoId;
              return (
                <button
                  key={fluxo.id}
                  type="button"
                  onClick={() => setSelectedFluxoId(fluxo.id)}
                  className={`p-4 rounded-2xl text-left transition-all border cursor-pointer relative flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-blue-50/40 border-[#2E3192] ring-2 ring-[#2E3192]/20 shadow-xs' 
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase ${
                        isSelected 
                          ? 'bg-[#2E3192] text-white' 
                          : 'bg-blue-100 text-[#2E3192]'
                      }`}>
                        {fluxo.badge}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {fluxo.envios_total} envios
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 line-clamp-2">
                      {fluxo.titulo}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 italic mt-3 pt-2 border-t border-slate-100">
                    {fluxo.subtitulo}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Main 2-column Layout: Editor on the Left, Live Preview on the Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Editor (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <span className="text-slate-400 font-mono">&lt;&gt;</span>
                  Editor de Régua: {currentFluxo.titulo}
                </h2>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentFluxo.ativo}
                    onChange={(e) => handleToggleAtivo(e.target.checked)}
                    className="w-4 h-4 text-[#2E3192] rounded-md focus:ring-0 cursor-pointer"
                  />
                  <span>Ativo</span>
                </label>
              </div>

              {/* Assunto do E-mail */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Assunto do E-mail
                </label>
                <input
                  type="text"
                  value={currentFluxo.assunto}
                  onChange={(e) => handleChangeSubject(e.target.value)}
                  placeholder="Digite o assunto do e-mail..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 focus:border-[#2E3192] text-slate-800 font-medium"
                />
              </div>

              {/* Variáveis Dinâmicas */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Variáveis Dinâmicas Disponíveis (Clique para Inserir)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '{{nome_cliente}}',
                    '{{cidade}}',
                    '{{status_imovel}}',
                    '{{link_portal_cliente}}',
                    '{{valor_proposta}}',
                    '{{parecer_ia}}',
                    '{{link_custodia}}'
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleInsertVariable(tag)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-[#2E3192] text-slate-700 text-xs font-mono rounded-lg transition-all border border-slate-200 flex items-center gap-1 cursor-pointer"
                    >
                      <span className="text-blue-600 font-bold">+</span>
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Corpo do E-mail (HTML Parametrizado) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Corpo do E-mail (HTML Parametrizado)
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {currentFluxo.corpo_html.length} caracteres
                  </span>
                </div>
                <textarea
                  rows={14}
                  value={currentFluxo.corpo_html}
                  onChange={(e) => handleChangeHtml(e.target.value)}
                  className="w-full p-3 text-xs font-mono rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 focus:border-[#2E3192] leading-relaxed resize-y"
                  spellCheck={false}
                />
              </div>

              {/* Simular Disparo Imediato */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block">
                    Simular Disparo Imediato
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Gera registro no log em tempo real
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 max-w-[260px]"
                  >
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome_completo} ({c.email || 'sem email'})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={isTestSending}
                    onClick={handleDispararTeste}
                    className="px-4 py-2 bg-[#2E3192] hover:bg-[#1C1E63] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isTestSending ? 'Enviando...' : 'Disparar Teste'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Preview (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Pré-visualização ao Vivo (Caixa de Entrada do Cliente)
                </h2>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1 rounded-md text-xs cursor-pointer ${
                      previewDevice === 'desktop' ? 'bg-white shadow-2xs text-[#2E3192]' : 'text-slate-400'
                    }`}
                    title="Visão Desktop"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1 rounded-md text-xs cursor-pointer ${
                      previewDevice === 'mobile' ? 'bg-white shadow-2xs text-[#2E3192]' : 'text-slate-400'
                    }`}
                    title="Visão Mobile"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Envelope Header info */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span><strong>De:</strong> {config.remetente_email || 'atendimento@brasillegal.com.br'}</span>
                  <span><strong>Para:</strong> {emailVars.email_cliente}</span>
                </div>
                <div className="pt-1 border-t border-slate-200/60 text-slate-900 font-bold line-clamp-1">
                  Assunto: {renderedSubject}
                </div>
              </div>

              {/* Email Content Box */}
              <div className={`mx-auto transition-all ${
                previewDevice === 'mobile' ? 'max-w-[340px]' : 'w-full'
              }`}>
                <div 
                  className="rounded-xl border border-slate-200 overflow-hidden shadow-xs bg-white text-slate-800"
                  dangerouslySetInnerHTML={{ __html: renderedBodyHtml }}
                />
              </div>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  O template é responsivo e compatível com Gmail, Outlook, Apple Mail e navegadores web, preservando a identidade White-Label da Brasil Legal.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ABA: GATILHOS DO CRM & AUTOMAÇÃO IA                                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'gatilhos_automacoes' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Gatilhos de Automação & Régua Inteligente do CRM
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure os gatilhos que disparam os e-mails e notificações push automaticamente conforme o cliente avança na jornada jurídica e técnica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gatilho 1: AI Diagnóstico */}
            <div className="p-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  ⭐ Destaque IA Notarial
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">
                1. Diagnóstico Prévio da IA Concluído (Custódia Documental)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Assim que a Inteligência Notarial emitir o parecer prévio sobre os documentos do imóvel em custódia, o <strong>Fluxo 5</strong> é disparado imediatamente para o e-mail do cliente contendo o resumo da viabilidade e link criptografado.
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-indigo-100 text-xs text-slate-500">
                <span>Fluxo Associado: <strong>Fluxo 5</strong></span>
                <span className="text-[#2E3192] font-bold">100% Automatizado</span>
              </div>
            </div>

            {/* Gatilho 2: Novo Lead */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  Funil Comercial
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">
                2. Entrada de Novo Lead no Site ou WhatsApp
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dispara o <strong>Fluxo 1 (Boas-Vindas)</strong> apresentando a autoridade da Brasil Legal e fornecendo as primeiras instruções de acesso ao Portal do Cliente.
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
                <span>Fluxo Associado: <strong>Fluxo 1</strong></span>
                <span className="text-slate-700 font-bold">SLA &lt; 2 min</span>
              </div>
            </div>

            {/* Gatilho 3: Custódia Iniciada */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  Segurança Documental
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">
                3. Confirmação de Upload & Custódia de Matrículas
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dispara o <strong>Fluxo 2 (Confirmação de Custódia)</strong> com protocolo criptografado SHA-256 e recibo de salvaguarda dos arquivos anexados.
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
                <span>Fluxo Associado: <strong>Fluxo 2</strong></span>
                <span className="text-slate-700 font-bold">Protocolo Hash</span>
              </div>
            </div>

            {/* Gatilho 4: Proposta e Acompanhamento */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  Esteira Notarial
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">
                4. Mudança de Etapa Cartorária ou Proposta Comercial
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dispara os <strong>Fluxos 3 e 4</strong> informando notas de exigência devolutiva, agendamento de vistoria técnica ou emissão de boletos de entrada.
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
                <span>Fluxos Associados: <strong>Fluxos 3 e 4</strong></span>
                <span className="text-slate-700 font-bold">Tempo Real</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ABA: RELATÓRIO DE ENTREGAS & LOGS                                     */}
      {/* ========================================================================= */}
      {activeSubTab === 'relatorio_entregas' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#2E3192]" />
                Relatório de Entregabilidade & Registro de Auditoria
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Acompanhe o status de abertura, cliques em links de custódia e histórico de envios automáticos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTermLog}
                  onChange={(e) => setSearchTermLog(e.target.value)}
                  placeholder="Buscar destinatário ou assunto..."
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20 w-48 sm:w-64"
                />
              </div>

              <select
                value={statusFilterLog}
                onChange={(e) => setStatusFilterLog(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20"
              >
                <option value="TODOS">Todos os Status</option>
                <option value="ENTREGUE">Entregue</option>
                <option value="ABERTO">Aberto</option>
                <option value="CLICADO">Clicado</option>
                <option value="FALHA">Falha</option>
              </select>
            </div>
          </div>

          {/* Cards com Métricas Rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Taxa de Entrega</span>
              <p className="text-xl font-black text-slate-900 mt-1">99.4%</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Alta reputação SPF/DKIM</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Taxa de Abertura</span>
              <p className="text-xl font-black text-blue-700 mt-1">68.5%</p>
              <span className="text-[10px] text-slate-500">Média superior ao mercado</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Cliques na Custódia</span>
              <p className="text-xl font-black text-indigo-700 mt-1">52.1%</p>
              <span className="text-[10px] text-slate-500">Acessos ao parecer</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Registrado</span>
              <p className="text-xl font-black text-slate-900 mt-1">{logs.length}</p>
              <span className="text-[10px] text-slate-500">No período atual</span>
            </div>
          </div>

          {/* Tabela de Logs */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Destinatário</th>
                  <th className="py-3 px-4">Fluxo / Assunto</th>
                  <th className="py-3 px-4">Origem do Gatilho</th>
                  <th className="py-3 px-4">Data & Horário</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Nenhum envio registrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-all">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{log.destinatario_nome}</div>
                        <div className="text-[11px] text-slate-400">{log.destinatario_email}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[260px]">
                        <div className="font-bold text-[#2E3192] line-clamp-1">{log.fluxo_nome}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{log.assunto}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {log.origem_gatilho}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {log.data_envio}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'CLICADO' 
                            ? 'bg-purple-100 text-purple-800' 
                            : log.status === 'ABERTO' 
                            ? 'bg-blue-100 text-blue-800' 
                            : log.status === 'ENTREGUE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setModalLogVisualizar(log)}
                          className="px-2.5 py-1 text-xs font-bold text-[#2E3192] hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                        >
                          Ver E-mail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ABA: CONFIGURAÇÕES SMTP & REMETENTE                                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'config_smtp' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-3xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#2E3192]" />
              Parâmetros do Servidor de E-mail & Assinatura Digital
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Defina os dados oficiais do remetente corporativo e comportamento das notificações.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nome do Remetente Oficial
                </label>
                <input
                  type="text"
                  value={config.remetente_nome}
                  onChange={(e) => onSaveConfig({ ...config, remetente_nome: e.target.value })}
                  placeholder="Ex: Brasil Legal Regularização"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  E-mail do Remetente (SPF/DKIM)
                </label>
                <input
                  type="email"
                  value={config.remetente_email}
                  onChange={(e) => onSaveConfig({ ...config, remetente_email: e.target.value })}
                  placeholder="Ex: atendimento@brasillegal.com.br"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Servidor SMTP
                </label>
                <input
                  type="text"
                  value={config.servidor_smtp || 'smtp.brasillegal.com.br'}
                  onChange={(e) => onSaveConfig({ ...config, servidor_smtp: e.target.value })}
                  placeholder="smtp.seudominio.com.br"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Porta SMTP
                </label>
                <input
                  type="number"
                  value={config.porta_smtp || 587}
                  onChange={(e) => onSaveConfig({ ...config, porta_smtp: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2E3192]/20"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.disparar_apos_diagnostico_ia}
                  onChange={(e) => onSaveConfig({ ...config, disparar_apos_diagnostico_ia: e.target.checked })}
                  className="w-4 h-4 text-[#2E3192] rounded-md focus:ring-0 cursor-pointer"
                />
                <span>Disparar e-mail automaticamente quando a IA finalizar a análise de documentos em custódia</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notificar_push_ao_enviar}
                  onChange={(e) => onSaveConfig({ ...config, notificar_push_ao_enviar: e.target.checked })}
                  className="w-4 h-4 text-[#2E3192] rounded-md focus:ring-0 cursor-pointer"
                />
                <span>Enviar notificação no sininho (Push in-app) para a equipe ao concluir cada disparo</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notificar_push_ao_abrir}
                  onChange={(e) => onSaveConfig({ ...config, notificar_push_ao_abrir: e.target.checked })}
                  className="w-4 h-4 text-[#2E3192] rounded-md focus:ring-0 cursor-pointer"
                />
                <span>Alertar quando o cliente clicar no link seguro da custódia documental</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Visualizar E-mail do Log */}
      {modalLogVisualizar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xs font-bold text-slate-900">{modalLogVisualizar.fluxo_nome}</h3>
                <p className="text-[11px] text-slate-500">
                  Enviado para: {modalLogVisualizar.destinatario_nome} ({modalLogVisualizar.destinatario_email}) em {modalLogVisualizar.data_envio}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalLogVisualizar(null)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold p-1 cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-slate-100/50">
              <div 
                className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden"
                dangerouslySetInnerHTML={{ __html: modalLogVisualizar.corpo_renderizado }}
              />
            </div>

            <div className="p-3 border-t border-slate-200 bg-white flex justify-end">
              <button
                type="button"
                onClick={() => setModalLogVisualizar(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
