import React, { useState } from 'react';
import { 
  FileSignature, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  PenTool, 
  Send, 
  Copy, 
  Check, 
  FileText, 
  Eye, 
  ExternalLink, 
  Smartphone, 
  Mail, 
  Settings, 
  Sparkles, 
  AlertCircle,
  Hash,
  Download,
  Key,
  Users,
  Building2,
  RefreshCw
} from 'lucide-react';
import { 
  ContratoAssinatura, 
  Contact, 
  Deal, 
  AppSettings, 
  StatusAssinaturaDocumento,
  ConfigAssinaturaEletronica,
  ProvedorAssinatura 
} from '../types';
import { ModalVisualizarAuditoria } from './ModalVisualizarAuditoria';
import { ModalAssinarDocumento } from './ModalAssinarDocumento';
import { ModalNovoContratoAssinatura } from './ModalNovoContratoAssinatura';
import { ModalVerContratoCompleto } from './ModalVerContratoCompleto';

interface ModuloAssinaturaDigitalProps {
  contratos: ContratoAssinatura[];
  contacts: Contact[];
  deals: Deal[];
  appSettings: AppSettings;
  configAssinatura: ConfigAssinaturaEletronica;
  onCriarContrato: (novoContrato: ContratoAssinatura) => void;
  onConfirmarAssinatura: (
    contratoId: string, 
    signatarioId: string, 
    dadosAssinatura: {
      metodo: 'Desenho em Tela' | 'Certificado Digital Token/Hash' | 'Assinatura Eletrônica Avançada';
      assinaturaBase64?: string;
      ip: string;
      geolocalizacao: string;
      dispositivo: string;
    }
  ) => void;
  onReenviarNotificacao: (contratoId: string, canal: 'whatsapp' | 'email') => void;
  onSalvarConfiguracao?: (novaConfig: ConfigAssinaturaEletronica) => void;
}

export const ModuloAssinaturaDigital: React.FC<ModuloAssinaturaDigitalProps> = ({
  contratos,
  contacts,
  deals,
  appSettings,
  configAssinatura,
  onCriarContrato,
  onConfirmarAssinatura,
  onReenviarNotificacao,
  onSalvarConfiguracao
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'contratos' | 'provedores'>('contratos');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Modals state
  const [isNovoContratoOpen, setIsNovoContratoOpen] = useState(false);
  const [selectedContratoAuditoria, setSelectedContratoAuditoria] = useState<ContratoAssinatura | null>(null);
  const [selectedContratoAssinar, setSelectedContratoAssinar] = useState<ContratoAssinatura | null>(null);
  const [selectedContratoVisualizar, setSelectedContratoVisualizar] = useState<ContratoAssinatura | null>(null);

  // Toast / feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyLink = (contrato: ContratoAssinatura) => {
    navigator.clipboard.writeText(contrato.link_assinatura_publico);
    setCopiedId(contrato.id);
    showToast(`Link de assinatura do contrato ${contrato.id} copiado para a área de transferência!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleReenviar = (contrato: ContratoAssinatura, canal: 'whatsapp' | 'email') => {
    onReenviarNotificacao(contrato.id, canal);
    showToast(`Notificação reenviada com sucesso via ${canal === 'whatsapp' ? 'WhatsApp' : 'E-mail'} para os signatários!`);
  };

  // KPIs
  const totalContratos = contratos.length;
  const aguardandoContratos = contratos.filter(c => c.status === 'Aguardando Assinaturas').length;
  const parciaisContratos = contratos.filter(c => c.status === 'Assinado Parcialmente').length;
  const concluidosContratos = contratos.filter(c => c.status === 'Concluído').length;
  const taxaConclusao = totalContratos > 0 ? Math.round((concluidosContratos / totalContratos) * 100) : 0;

  // Filter contracts
  const filteredContratos = contratos.filter(c => {
    const matchesSearch = 
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact_cpf_cnpj.includes(searchTerm) ||
      (c.deal_titulo && c.deal_titulo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'todos' || 
      c.status.toLowerCase().replace(/\s+/g, '_') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Envelopes</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">{totalContratos}</span>
            <span className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <FileSignature className="w-4 h-4" />
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Contratos e procurações</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Aguardando Assinatura</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-amber-700">{aguardandoContratos}</span>
            <span className="p-2 bg-amber-50 text-amber-700 rounded-xl">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <span className="text-[11px] text-amber-600/80 mt-1 block">Notificações enviadas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Parcialmente Assinados</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-blue-700">{parciaisContratos}</span>
            <span className="p-2 bg-blue-50 text-blue-700 rounded-xl">
              <PenTool className="w-4 h-4" />
            </span>
          </div>
          <span className="text-[11px] text-blue-600/80 mt-1 block">Faltam signatários</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Concluídos & Selados</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-emerald-700">{concluidosContratos}</span>
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <span className="text-[11px] text-emerald-600/80 mt-1 block">Hash SHA-256 e validade MP 2.200</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Taxa de Conclusão</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-purple-700">{taxaConclusao}%</span>
            <span className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <span className="text-[11px] text-purple-600/80 mt-1 block">SLA médio: ~18 horas</span>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('contratos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'contratos'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            Envelopes & Contratos ({contratos.length})
          </button>

          <button
            onClick={() => setActiveSubTab('provedores')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'provedores'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            Provedores & Integração APIs
          </button>
        </div>

        {activeSubTab === 'contratos' && (
          <button
            onClick={() => setIsNovoContratoOpen(true)}
            className="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Gerar Contrato para Assinatura Digital
          </button>
        )}
      </div>

      {/* SUB-TAB: CONTRATOS */}
      {activeSubTab === 'contratos' && (
        <div className="space-y-4">
          {/* Filters and search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[280px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cliente, CPF, título, ID (CTR-...) ou processo..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'aguardando_assinaturas', label: 'Aguardando' },
                { id: 'assinado_parcialmente', label: 'Parcial' },
                { id: 'concluído', label: 'Concluídos' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === filter.id
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contracts List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            {filteredContratos.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <FileSignature className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-700">Nenhum contrato encontrado</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Gere um novo contrato automaticamente utilizando modelos jurídicos de regularização fundiária e REURB.
                </p>
                <button
                  onClick={() => setIsNovoContratoOpen(true)}
                  className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800 transition-colors"
                >
                  Gerar Novo Contrato Agora
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredContratos.map((contrato) => {
                  const hasPending = contrato.signatarios.some(s => s.status === 'Pendente');
                  const signedCount = contrato.signatarios.filter(s => s.status === 'Assinado').length;
                  const totalSigners = contrato.signatarios.length;

                  return (
                    <div key={contrato.id} className="p-5 hover:bg-slate-50/70 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Title and ID */}
                        <div className="space-y-1 max-w-xl">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                              {contrato.id}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              contrato.status === 'Concluído' ? 'bg-emerald-100 text-emerald-800' :
                              contrato.status === 'Assinado Parcialmente' ? 'bg-amber-100 text-amber-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {contrato.status}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Provedor: <strong className="text-slate-600">{contrato.provedor_assinatura}</strong>
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 hover:text-blue-900 cursor-pointer" onClick={() => setSelectedContratoVisualizar(contrato)}>
                            {contrato.titulo}
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span>Cliente: <strong className="text-slate-700">{contrato.contact_nome}</strong> (CPF: {contrato.contact_cpf_cnpj})</span>
                            {contrato.deal_titulo && (
                              <span>• Negócio: <span className="text-slate-700 font-medium">{contrato.deal_titulo}</span></span>
                            )}
                            {contrato.valor_contrato ? (
                              <span>• Valor: <strong className="text-emerald-700">R$ {contrato.valor_contrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></span>
                            ) : null}
                          </div>
                        </div>

                        {/* Signers indicators */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 px-3 text-xs space-y-1 min-w-[200px]">
                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold mb-1">
                              <span>Progresso de Assinaturas:</span>
                              <span className="font-mono font-bold text-slate-700">{signedCount}/{totalSigners}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {contrato.signatarios.map((sig) => (
                                <span 
                                  key={sig.id}
                                  title={`${sig.nome} (${sig.papel}) — ${sig.status}`}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                    sig.status === 'Assinado'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                                  }`}
                                >
                                  {sig.status === 'Assinado' ? (
                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                  ) : (
                                    <Clock className="w-2.5 h-2.5 text-amber-600" />
                                  )}
                                  {sig.papel}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Quick Actions Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {hasPending && (
                              <button
                                onClick={() => setSelectedContratoAssinar(contrato)}
                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                                title="Assinar como cliente ou representante"
                              >
                                <PenTool className="w-3.5 h-3.5" />
                                Assinar
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedContratoVisualizar(contrato)}
                              className="p-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                              title="Ver Contrato Completo"
                            >
                              <FileText className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setSelectedContratoAuditoria(contrato)}
                              className="p-1.5 border border-slate-200 hover:bg-slate-100 text-blue-700 rounded-lg transition-colors"
                              title="Ver Dossiê de Auditoria (Logs & Hashes)"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleCopyLink(contrato)}
                              className="p-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
                              title="Copiar Link de Assinatura"
                            >
                              {copiedId === contrato.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>

                            {hasPending && (
                              <button
                                onClick={() => handleReenviar(contrato, 'whatsapp')}
                                className="p-1.5 border border-emerald-200 hover:bg-emerald-50 text-emerald-700 rounded-lg transition-colors"
                                title="Reenviar link por WhatsApp"
                              >
                                <Smartphone className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Hash pill footer */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Hash className="w-3 h-3 text-slate-400" />
                          <span>SHA-256:</span>
                          <span className="text-slate-600">{contrato.hash_sha256_original.substring(0, 32)}...</span>
                        </div>
                        <div>
                          <span>Criado em: {new Date(contrato.data_criacao).toLocaleDateString('pt-BR')} • Expira em: {new Date(contrato.data_expiracao).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB: PROVEDORES & INTEGRAÇÃO APIS */}
      {activeSubTab === 'provedores' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Configuração de Provedores de Assinatura Eletrônica
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Conecte a plataforma nativa ou integre gateways de assinatura de terceiros para cumprimento legal e webhooks.
              </p>
            </div>

            {/* Provider Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: 'Brasil Legal e-Sign' as ProvedorAssinatura,
                  name: 'Brasil Legal e-Sign (Nativo)',
                  desc: 'Motor próprio de assinatura com validade jurídica pela MP 2.200-2/2001 e Lei 14.063/2020. Sem custo por envelope.',
                  badge: 'Ativo / Homologado',
                  active: configAssinatura.provedor_ativo === 'Brasil Legal e-Sign'
                },
                {
                  id: 'Clicksign' as ProvedorAssinatura,
                  name: 'Clicksign API v3',
                  desc: 'Integração oficial Clicksign para envio de envelopes e assinatura por WhatsApp com token SMS.',
                  badge: 'Gateway Externo',
                  active: configAssinatura.provedor_ativo === 'Clicksign'
                },
                {
                  id: 'DocuSign' as ProvedorAssinatura,
                  name: 'DocuSign eSignature',
                  desc: 'Padrão internacional com conformidade cartorária e integração REST API OAuth.',
                  badge: 'Enterprise',
                  active: configAssinatura.provedor_ativo === 'DocuSign'
                },
                {
                  id: 'ZapSign' as ProvedorAssinatura,
                  name: 'ZapSign WhatsApp API',
                  desc: 'Assinatura rápida diretamente no aplicativo WhatsApp do cliente com selfie de validação.',
                  badge: 'WhatsApp Native',
                  active: configAssinatura.provedor_ativo === 'ZapSign'
                },
                {
                  id: 'D4Sign' as ProvedorAssinatura,
                  name: 'D4Sign SafeWeb',
                  desc: 'Pioneira em certificação digital ICP-Brasil e carimbo de tempo do Observatório Nacional.',
                  badge: 'ICP-Brasil',
                  active: configAssinatura.provedor_ativo === 'D4Sign'
                },
                {
                  id: 'Autentique' as ProvedorAssinatura,
                  name: 'Autentique GraphQL',
                  desc: 'Plataforma brasileira de gestão de contratos com assinaturas eletrônicas seguras.',
                  badge: 'SaaS',
                  active: configAssinatura.provedor_ativo === 'Autentique'
                }
              ].map((prov) => (
                <div 
                  key={prov.id}
                  className={`p-4 rounded-xl border transition-all ${
                    prov.active
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-900">{prov.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      prov.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {prov.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{prov.desc}</p>
                  <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {prov.active ? 'Provedor Ativo' : 'Disponível'}
                    </span>
                    {!prov.active && (
                      <button
                        onClick={() => {
                          if (onSalvarConfiguracao) {
                            onSalvarConfiguracao({
                              ...configAssinatura,
                              provedor_ativo: prov.id
                            });
                          }
                          showToast(`Provedor alternado para ${prov.name}!`);
                        }}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900"
                      >
                        Ativar Provedor
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Security & Audit Policies */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Políticas de Segurança e Prova Técnica (Conformidade MP 2.200-2/2001)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="space-y-1">
                  <span className="font-semibold block">Geração Automática de Hash SHA-256</span>
                  <p className="text-slate-500 text-[11px]">
                    Cada documento gerado recebe um resumo criptográfico de 256 bits antes e após as assinaturas, impedindo qualquer adulteração de cláusulas.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold block">Captura de Metadados Probatórios</span>
                  <p className="text-slate-500 text-[11px]">
                    Registro inviolável de endereço IP público, geolocalização estimada, carimbo de tempo oficial e identificador do dispositivo móvel do signatário.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold block">Autenticação em Dois Fatores (OTP WhatsApp)</span>
                  <p className="text-slate-500 text-[11px]">
                    Envio de token de 6 dígitos ao número cadastrado no CRM antes de liberar a assinatura na tela.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold block">Certificado de Autenticidade & QR Code</span>
                  <p className="text-slate-500 text-[11px]">
                    Folha de rosto com chave pública de validação para cartórios e partes contratantes verificarem a integridade do arquivo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO CONTRATO AUTOMATIZADO */}
      {isNovoContratoOpen && (
        <ModalNovoContratoAssinatura
          contacts={contacts}
          deals={deals}
          appSettings={appSettings}
          onClose={() => setIsNovoContratoOpen(false)}
          onCriarContrato={(novo) => {
            onCriarContrato(novo);
            showToast(`Contrato ${novo.id} gerado e enviado para assinaturas com sucesso!`);
          }}
        />
      )}

      {/* MODAL: VER AUDITORIA / DOSSIÊ */}
      {selectedContratoAuditoria && (
        <ModalVisualizarAuditoria
          contrato={selectedContratoAuditoria}
          onClose={() => setSelectedContratoAuditoria(null)}
        />
      )}

      {/* MODAL: ASSINAR DOCUMENTO */}
      {selectedContratoAssinar && (
        <ModalAssinarDocumento
          contrato={selectedContratoAssinar}
          onClose={() => setSelectedContratoAssinar(null)}
          onConfirmarAssinatura={(contratoId, signatarioId, dados) => {
            onConfirmarAssinatura(contratoId, signatarioId, dados);
            showToast('Assinatura registrada e log de auditoria gerado com sucesso!');
          }}
        />
      )}

      {/* MODAL: VER CONTRATO COMPLETO */}
      {selectedContratoVisualizar && (
        <ModalVerContratoCompleto
          contrato={selectedContratoVisualizar}
          onClose={() => setSelectedContratoVisualizar(null)}
          onOpenAuditoria={() => {
            setSelectedContratoAuditoria(selectedContratoVisualizar);
            setSelectedContratoVisualizar(null);
          }}
          onOpenAssinar={() => {
            setSelectedContratoAssinar(selectedContratoVisualizar);
            setSelectedContratoVisualizar(null);
          }}
        />
      )}
    </div>
  );
};
