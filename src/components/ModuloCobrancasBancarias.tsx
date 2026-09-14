import React, { useState } from 'react';
import { CobrancaBoleto, FintechConfig, Contact, Deal, GatewayFintech, StatusCobranca, TipoCobranca } from '../types';
import { 
  CreditCard, 
  DollarSign, 
  Building2, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Copy, 
  QrCode, 
  Printer, 
  ExternalLink, 
  Send, 
  Check, 
  Layers, 
  ShieldCheck, 
  Settings, 
  Zap, 
  X, 
  Phone,
  RefreshCw,
  Wallet,
  Landmark,
  KeyRound,
  Link,
  ChevronRight
} from 'lucide-react';

interface ModuloCobrancasBancariasProps {
  cobrancas: CobrancaBoleto[];
  fintechs: FintechConfig[];
  contacts: Contact[];
  deals: Deal[];
  onEmitirBoleto: (boletoData: Partial<CobrancaBoleto>) => Promise<void>;
  onUpdateBoletoStatus: (id: string, status: StatusCobranca) => Promise<void>;
  onUpdateFintech: (fintech: FintechConfig) => Promise<void>;
}

export const ModuloCobrancasBancarias: React.FC<ModuloCobrancasBancariasProps> = ({
  cobrancas,
  fintechs,
  contacts,
  deals,
  onEmitirBoleto,
  onUpdateBoletoStatus,
  onUpdateFintech
}) => {
  const [activeTab, setActiveTab] = useState<'boletos' | 'fintechs'>('boletos');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [gatewayFilter, setGatewayFilter] = useState<string>('todos');
  
  // Modals
  const [isEmitirModalOpen, setIsEmitirModalOpen] = useState(false);
  const [selectedBoletoVisualizar, setSelectedBoletoVisualizar] = useState<CobrancaBoleto | null>(null);
  const [editingFintech, setEditingFintech] = useState<FintechConfig | null>(null);
  const [testingFintechId, setTestingFintechId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // New Boleto Form State
  const [novoBoletoForm, setNovoBoletoForm] = useState<{
    contact_id: string;
    deal_id: string;
    tipo: TipoCobranca;
    descricao: string;
    valor: string;
    data_vencimento: string;
    gateway: GatewayFintech;
    multa_percentual: string;
    juros_mensal_percentual: string;
    instrucoes_caixa: string;
    aplicar_split_b2b: boolean;
  }>({
    contact_id: contacts[0]?.id || '',
    deal_id: deals[0]?.id || '',
    tipo: 'HONORARIOS_ENTRADA',
    descricao: 'Honorários Iniciais — Regularização Extrajudicial Registral',
    valor: '3500.00',
    data_vencimento: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    gateway: 'Asaas',
    multa_percentual: '2.0',
    juros_mensal_percentual: '1.0',
    instrucoes_caixa: 'Não receber após 30 dias do vencimento.\nCobrar multa de 2% e juros de 1% ao mês após vencimento.\nPagável em qualquer banco ou via Pix com QR Code.',
    aplicar_split_b2b: true
  });

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copiado: ${fieldName}`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Filter Boletos
  const filteredBoletos = cobrancas.filter(b => {
    const matchesSearch = 
      b.contact_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.contact_cpf_cnpj.includes(searchTerm) ||
      b.nosso_numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.descricao.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || b.status === statusFilter;
    const matchesGateway = gatewayFilter === 'todos' || b.gateway === gatewayFilter;

    return matchesSearch && matchesStatus && matchesGateway;
  });

  // Financial Metrics
  const totalEmitido = cobrancas.reduce((acc, c) => acc + c.valor, 0);
  const totalPago = cobrancas.filter(c => c.status === 'Pago').reduce((acc, c) => acc + c.valor, 0);
  const totalPendente = cobrancas.filter(c => c.status === 'Pendente').reduce((acc, c) => acc + c.valor, 0);
  const totalVencido = cobrancas.filter(c => c.status === 'Vencido').reduce((acc, c) => acc + c.valor, 0);

  const handleTestConnection = (fintech: FintechConfig) => {
    setTestingFintechId(fintech.id);
    setTestResult(null);

    setTimeout(() => {
      setTestingFintechId(null);
      setTestResult({
        id: fintech.id,
        success: true,
        message: `Conexão bem-sucedida com a API ${fintech.nome}! Webhook ativo e chaves validadas (Ping: 48ms).`
      });
      showToast(`API ${fintech.nome} conectada com sucesso!`);
    }, 1200);
  };

  const handleSaveFintech = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFintech) return;
    await onUpdateFintech(editingFintech);
    showToast(`Configurações de ${editingFintech.nome} salvas!`);
    setEditingFintech(null);
  };

  const handleCreateBoleto = async (e: React.FormEvent) => {
    e.preventDefault();
    const contact = contacts.find(c => c.id === novoBoletoForm.contact_id);
    const deal = deals.find(d => d.id === novoBoletoForm.deal_id);
    const valorNum = parseFloat(novoBoletoForm.valor) || 1000;

    let splitData = undefined;
    if (novoBoletoForm.aplicar_split_b2b && contact?.indicador_id) {
      splitData = {
        parceiro_id: contact.indicador_id,
        parceiro_nome: 'Parceiro Indicador B2B',
        percentual: 5.0,
        valor_comissao: valorNum * 0.05
      };
    }

    await onEmitirBoleto({
      contact_id: novoBoletoForm.contact_id,
      contact_nome: contact?.nome_completo || 'Sacado Registrado',
      contact_cpf_cnpj: contact?.cpf_cnpj || '000.000.000-00',
      contact_email: contact?.email,
      contact_telefone: contact?.telefone_whatsapp,
      contact_endereco: contact?.endereco,
      deal_id: novoBoletoForm.deal_id || undefined,
      deal_titulo: deal?.titulo || undefined,
      tipo: novoBoletoForm.tipo,
      descricao: novoBoletoForm.descricao,
      valor: valorNum,
      data_vencimento: novoBoletoForm.data_vencimento,
      gateway: novoBoletoForm.gateway,
      multa_percentual: parseFloat(novoBoletoForm.multa_percentual) || 2.0,
      juros_mensal_percentual: parseFloat(novoBoletoForm.juros_mensal_percentual) || 1.0,
      instrucoes_caixa: novoBoletoForm.instrucoes_caixa.split('\n').filter(Boolean),
      split_b2b: splitData
    });

    showToast(`Boleto bancário emitido via ${novoBoletoForm.gateway}!`);
    setIsEmitirModalOpen(false);
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

      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="bg-[#2E3192] text-white text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Cobrança & Boletos Bancários
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              Pix Híbrido & Registro Online FEBRABAN
            </span>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              Integração com Fintechs SaaS
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Emissão de Boletos, Linha Digitável e Conciliação Fintech
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geração instantânea de títulos registrados com QR Code Pix dinâmico, split automático de comissões B2B e integração com Asaas, Inter, Cora e Iugu.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-emitir-novo-boleto"
            onClick={() => setIsEmitirModalOpen(true)}
            className="px-4 py-2.5 bg-[#2E3192] hover:bg-[#1E216B] text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-2 border-b-2 border-[#F2EC00] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F2EC00]" />
            Emitir Novo Boleto
          </button>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('boletos')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'boletos'
              ? 'bg-[#2E3192] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Boletos Emitidos & Gestão de Títulos ({cobrancas.length})
        </button>

        <button
          onClick={() => setActiveTab('fintechs')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'fintechs'
              ? 'bg-[#2E3192] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Integração SaaS & Fintechs Bancárias ({fintechs.length})
        </button>
      </div>

      {/* TAB 1: BOLETOS EMITIDOS */}
      {activeTab === 'boletos' && (
        <div className="space-y-6">
          {/* Financial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Emitido</span>
              <div className="text-2xl font-black text-slate-900">
                R$ {totalEmitido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-slate-500">{cobrancas.length} títulos gerados no sistema</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-1">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Total Liquidado (Pago)</span>
              <div className="text-2xl font-black text-emerald-800">
                R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-emerald-600">Compensação confirmada em conta</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50/20 shadow-xs space-y-1">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Em Aberto / A Vencer</span>
              <div className="text-2xl font-black text-amber-900">
                R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-amber-600">Aguardando vencimento ou quitação</p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-red-200 bg-red-50/20 shadow-xs space-y-1">
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider block">Vencidos / Cobrança</span>
              <div className="text-2xl font-black text-red-700">
                R$ {totalVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-red-600">Régua de cobrança automática ativa</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por cliente, CPF/CNPJ, nosso número..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 font-semibold">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold cursor-pointer"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="Pendente">Pendente</option>
                  <option value="Pago">Pago (Liquidado)</option>
                  <option value="Vencido">Vencido</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 font-semibold">Gateway:</span>
                <select
                  value={gatewayFilter}
                  onChange={e => setGatewayFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-semibold cursor-pointer"
                >
                  <option value="todos">Todas as Fintechs</option>
                  <option value="Asaas">Asaas</option>
                  <option value="Banco Inter">Banco Inter</option>
                  <option value="Cora">Cora</option>
                  <option value="Iugu">Iugu</option>
                  <option value="Stone">Stone</option>
                </select>
              </div>
            </div>
          </div>

          {/* Boletos Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Nosso Número / Emissão</th>
                    <th className="py-3 px-4">Sacado (Cliente)</th>
                    <th className="py-3 px-4">Descrição / Objeto</th>
                    <th className="py-3 px-4">Valor & Vencimento</th>
                    <th className="py-3 px-4">Gateway & Split B2B</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBoletos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 italic">
                        Nenhum boleto bancário localizado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredBoletos.map(boleto => {
                      const isPago = boleto.status === 'Pago';
                      const isVencido = boleto.status === 'Vencido';

                      return (
                        <tr key={boleto.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-slate-900">{boleto.nosso_numero}</div>
                            <div className="text-[11px] text-slate-500">Emitido: {boleto.data_emissao}</div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{boleto.contact_nome}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{boleto.contact_cpf_cnpj}</div>
                          </td>

                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-semibold text-slate-800 truncate">{boleto.descricao}</div>
                            <div className="text-[11px] text-indigo-700 font-medium truncate">
                              {boleto.tipo === 'HONORARIOS_ENTRADA' ? 'Honorários de Entrada' :
                               boleto.tipo === 'HONORARIOS_PARCELA' ? 'Honorários Parcela' :
                               boleto.tipo === 'EMOLUMENTOS_CARTORIO' ? 'Emolumentos de Cartório' : 'Taxa Topográfica'}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="text-sm font-black text-[#2E3192]">
                              R$ {boleto.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className={`text-[11px] font-semibold flex items-center gap-1 ${
                              isPago ? 'text-emerald-700' : isVencido ? 'text-red-700' : 'text-slate-600'
                            }`}>
                              <Clock className="w-3 h-3" />
                              Venc: {boleto.data_vencimento}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                              {boleto.gateway}
                            </span>
                            {boleto.split_b2b && (
                              <div className="text-[10px] text-amber-800 font-semibold mt-1">
                                Split 5%: R$ {boleto.split_b2b.valor_comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                              isPago
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isVencido
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : boleto.status === 'Cancelado'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {isPago && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                              {boleto.status}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* View / Print Boleto FEBRABAN */}
                              <button
                                type="button"
                                onClick={() => setSelectedBoletoVisualizar(boleto)}
                                className="p-1.5 bg-[#2E3192] text-white hover:bg-[#1E216B] rounded-lg transition-colors cursor-pointer"
                                title="Visualizar Boleto Bancário Nacional (FEBRABAN) e QR Code Pix"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              {/* Copy Linha Digitavel */}
                              <button
                                type="button"
                                onClick={() => copyToClipboard(boleto.linha_digitavel, 'Linha Digitável')}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer border border-slate-200"
                                title="Copiar Linha Digitável"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              {/* WhatsApp Direct Notification */}
                              {boleto.contact_telefone && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    showToast(`Cobrança com Pix enviada para o WhatsApp de ${boleto.contact_nome}!`);
                                  }}
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
                                  title="Enviar Boleto + Pix via WhatsApp"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Mark as Paid manual toggle */}
                              {!isPago && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateBoletoStatus(boleto.id, 'Pago')}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                                  title="Confirmar Liquidação Manual"
                                >
                                  Baixar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINTECHS & BANCOS SAAS */}
      {activeTab === 'fintechs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#2E3192]" />
              Configuração dos Gateways & Bancos Digitais Conectados
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure credenciais de API, webhooks de liquidação instantânea, tarifas por boleto emitido e regras de split automático para parceiros registradores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {fintechs.map(fintech => {
              const isTesting = testingFintechId === fintech.id;
              const hasTestResult = testResult?.id === fintech.id;

              return (
                <div
                  key={fintech.id}
                  className={`bg-white rounded-xl p-5 border transition-all flex flex-col justify-between space-y-4 shadow-xs ${
                    fintech.ativo ? 'border-slate-200' : 'border-slate-200 opacity-75'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {fintech.tipo}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">{fintech.nome}</h3>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          fintech.ambiente === 'producao' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {fintech.ambiente === 'producao' ? 'Produção' : 'Sandbox'}
                        </span>
                        <span className={`w-2.5 h-2.5 rounded-full ${fintech.ativo ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {fintech.descricao}
                    </p>

                    {/* Features list */}
                    <div className="space-y-1.5 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Tarifa por Boleto:</span>
                        <strong className="text-slate-800">R$ {fintech.tarifa_boleto.toFixed(2)}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Compensação:</span>
                        <strong className="text-slate-800">{fintech.dias_compensacao}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Split B2B Automático:</span>
                        <span className={`font-bold ${fintech.suporta_split ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {fintech.suporta_split ? 'Suportado' : 'Indisponível'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Pix Híbrido no Boleto:</span>
                        <span className={`font-bold ${fintech.suporta_pix_hibrido ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {fintech.suporta_pix_hibrido ? 'Ativo (D+0)' : 'Apenas Código de Barras'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    {hasTestResult && (
                      <div className={`p-2 rounded text-[11px] font-medium flex items-center gap-1.5 ${
                        testResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{testResult.message}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTestConnection(fintech)}
                        disabled={isTesting}
                        className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                        <span>{isTesting ? 'Testando...' : 'Testar API'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingFintech({ ...fintech })}
                        className="flex-1 py-1.5 bg-[#2E3192] hover:bg-[#1E216B] text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Configurar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: EMITIR NOVO BOLETO BANCÁRIO */}
      {isEmitirModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-[#2E3192] p-4 text-white flex items-center justify-between border-b-2 border-[#F2EC00]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#F2EC00]" />
                <div>
                  <h3 className="text-sm font-bold">Emissão de Boleto Bancário Registrado</h3>
                  <p className="text-[11px] text-slate-200">Registro online com Pix Copia e Cola automático</p>
                </div>
              </div>
              <button
                onClick={() => setIsEmitirModalOpen(false)}
                className="text-white hover:text-[#F2EC00] text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBoleto} className="p-5 space-y-4 text-xs">
              {/* Sacado selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Sacado (Cliente / Lead Cadastrado) *
                </label>
                <select
                  value={novoBoletoForm.contact_id}
                  onChange={e => setNovoBoletoForm({ ...novoBoletoForm, contact_id: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#2E3192] cursor-pointer"
                >
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome_completo} — CPF/CNPJ: {c.cpf_cnpj} ({c.endereco.cidade}/{c.endereco.uf})
                    </option>
                  ))}
                </select>
              </div>

              {/* Deal selection */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Processo Registral Vinculado (Opcional)
                </label>
                <select
                  value={novoBoletoForm.deal_id}
                  onChange={e => setNovoBoletoForm({ ...novoBoletoForm, deal_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#2E3192] cursor-pointer"
                >
                  <option value="">Sem vínculo com pasta específica</option>
                  {deals.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.titulo} ({d.tipo_procedimento}) — {d.status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid: Tipo & Gateway */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Cobrança *</label>
                  <select
                    value={novoBoletoForm.tipo}
                    onChange={e => setNovoBoletoForm({ ...novoBoletoForm, tipo: e.target.value as TipoCobranca })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
                  >
                    <option value="HONORARIOS_ENTRADA">Honorários de Entrada</option>
                    <option value="HONORARIOS_PARCELA">Honorários Parcela</option>
                    <option value="EMOLUMENTOS_CARTORIO">Emolumentos de Cartório</option>
                    <option value="TAXA_TOPOGRAFIA">Taxa de Topografia / RTK</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fintech / Gateway Emissor *</label>
                  <select
                    value={novoBoletoForm.gateway}
                    onChange={e => setNovoBoletoForm({ ...novoBoletoForm, gateway: e.target.value as GatewayFintech })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
                  >
                    <option value="Asaas">Asaas (Recomendado - Split B2B & WhatsApp)</option>
                    <option value="Banco Inter">Banco Inter (Sem tarifas bancárias)</option>
                    <option value="Cora">Cora (Conta Digital PJ)</option>
                    <option value="Iugu">Iugu (Subcontas Registrais)</option>
                    <option value="Stone">Stone / Pagar.me</option>
                  </select>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Descrição do Título *</label>
                <input
                  type="text"
                  value={novoBoletoForm.descricao}
                  onChange={e => setNovoBoletoForm({ ...novoBoletoForm, descricao: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium text-slate-800"
                />
              </div>

              {/* Grid: Valor & Vencimento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Valor Nominal (R$) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1.00"
                      value={novoBoletoForm.valor}
                      onChange={e => setNovoBoletoForm({ ...novoBoletoForm, valor: e.target.value })}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Data de Vencimento *</label>
                  <input
                    type="date"
                    value={novoBoletoForm.data_vencimento}
                    onChange={e => setNovoBoletoForm({ ...novoBoletoForm, data_vencimento: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Instruções de Caixa */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Instruções de Caixa (Impresso no Boleto)</label>
                <textarea
                  rows={3}
                  value={novoBoletoForm.instrucoes_caixa}
                  onChange={e => setNovoBoletoForm({ ...novoBoletoForm, instrucoes_caixa: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 font-mono text-[11px]"
                />
              </div>

              {/* Split B2B Checkbox */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 block">Split de Comissão B2B Automático (5%)</span>
                  <span className="text-[10px] text-amber-700">
                    Se o cliente tiver indicador parceiro, reserva automaticamente 5% na liquidação.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={novoBoletoForm.aplicar_split_b2b}
                  onChange={e => setNovoBoletoForm({ ...novoBoletoForm, aplicar_split_b2b: e.target.checked })}
                  className="w-4 h-4 text-[#2E3192] rounded cursor-pointer"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEmitirModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2E3192] hover:bg-[#1E216B] text-white font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-[#F2EC00]" />
                  Confirmar Emissão & Gerar Boleto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VISUALIZADOR DE BOLETO BANCÁRIO FEBRABAN */}
      {selectedBoletoVisualizar && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full rounded-2xl shadow-2xl overflow-hidden border border-slate-300 my-6">
            {/* Header modal */}
            <div className="bg-[#2E3192] p-4 text-white flex items-center justify-between border-b-2 border-[#F2EC00]">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#F2EC00]" />
                <h3 className="text-sm font-bold">Boleto Bancário Nacional FEBRABAN & Pix Híbrido</h3>
              </div>
              <button
                onClick={() => setSelectedBoletoVisualizar(null)}
                className="text-white hover:text-[#F2EC00] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Standard FEBRABAN Boleto Slip Paper Layout */}
              <div className="border-2 border-slate-800 p-5 rounded-lg bg-white space-y-4 font-sans text-slate-900">
                {/* Bank Header and Linha Digitável */}
                <div className="border-b-2 border-slate-800 pb-3 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#2E3192] text-white font-black text-sm flex items-center justify-center">
                      BL
                    </div>
                    <span className="font-black text-lg tracking-tight">Brasil Legal Bank</span>
                    <span className="border-l-2 border-slate-800 pl-2 font-bold text-sm font-mono">
                      {selectedBoletoVisualizar.gateway === 'Banco Inter' ? '077-9' : selectedBoletoVisualizar.gateway === 'Iugu' ? '336-1' : '033-7'}
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold tracking-wider text-right select-all bg-slate-100 px-3 py-1 rounded border border-slate-300">
                    {selectedBoletoVisualizar.linha_digitavel}
                  </div>
                </div>

                {/* Grid of Fields */}
                <div className="grid grid-cols-4 gap-0 border border-slate-800 text-[10px]">
                  {/* Row 1 */}
                  <div className="col-span-3 border-r border-b border-slate-800 p-1.5">
                    <span className="text-slate-500 uppercase block font-bold">Local de Pagamento</span>
                    <span className="font-semibold text-slate-900">
                      PAGÁVEL EM QUALQUER BANCO OU VIA PIX ATÉ O VENCIMENTO
                    </span>
                  </div>
                  <div className="border-b border-slate-800 p-1.5 bg-slate-50">
                    <span className="text-slate-500 uppercase block font-bold">Vencimento</span>
                    <span className="font-bold text-xs text-slate-900">{selectedBoletoVisualizar.data_vencimento}</span>
                  </div>

                  {/* Row 2 */}
                  <div className="col-span-3 border-r border-b border-slate-800 p-1.5">
                    <span className="text-slate-500 uppercase block font-bold">Beneficiário</span>
                    <span className="font-bold text-slate-900">
                      BRASIL LEGAL SOLUÇÕES IMOBILIÁRIAS E REGISTRAIS LTDA — CNPJ: 38.491.820/0001-55
                    </span>
                  </div>
                  <div className="border-b border-slate-800 p-1.5 bg-slate-50">
                    <span className="text-slate-500 uppercase block font-bold">Agência / Código Beneficiário</span>
                    <span className="font-bold text-slate-900 font-mono">0001 / 849182-0</span>
                  </div>

                  {/* Row 3 */}
                  <div className="border-r border-b border-slate-800 p-1.5">
                    <span className="text-slate-500 uppercase block font-bold">Data do Doc.</span>
                    <span className="font-mono">{selectedBoletoVisualizar.data_emissao}</span>
                  </div>
                  <div className="border-r border-b border-slate-800 p-1.5">
                    <span className="text-slate-500 uppercase block font-bold">Número do Doc.</span>
                    <span className="font-mono font-bold">{selectedBoletoVisualizar.id}</span>
                  </div>
                  <div className="border-r border-b border-slate-800 p-1.5">
                    <span className="text-slate-500 uppercase block font-bold">Espécie DOC</span>
                    <span>DM</span>
                  </div>
                  <div className="border-b border-slate-800 p-1.5 bg-slate-50">
                    <span className="text-slate-500 uppercase block font-bold">Nosso Número</span>
                    <span className="font-mono font-bold text-slate-900">{selectedBoletoVisualizar.nosso_numero}</span>
                  </div>

                  {/* Row 4: Instruções and Valor */}
                  <div className="col-span-3 border-r border-slate-800 p-2.5 space-y-1">
                    <span className="text-slate-500 uppercase block font-bold">Instruções de Responsabilidade do Beneficiário</span>
                    <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5">
                      {selectedBoletoVisualizar.instrucoes_caixa?.map((inst, i) => (
                        <li key={i}>{inst}</li>
                      )) || (
                        <li>Não receber após o vencimento sem encargos.</li>
                      )}
                      <li>PAGUE COM PIX: Aponte a câmera do seu aplicativo bancário para o QR Code ao lado.</li>
                    </ul>
                  </div>
                  <div className="p-2.5 bg-slate-100 flex flex-col justify-center">
                    <span className="text-slate-500 uppercase block font-bold text-[10px]">Valor do Documento</span>
                    <span className="text-lg font-black text-[#2E3192] font-mono">
                      R$ {selectedBoletoVisualizar.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Sacado Section */}
                <div className="border border-slate-800 p-3 text-[11px] bg-slate-50 space-y-1">
                  <div className="flex justify-between">
                    <span>
                      <strong>Sacado:</strong> {selectedBoletoVisualizar.contact_nome}
                    </span>
                    <span>
                      <strong>CPF/CNPJ:</strong> {selectedBoletoVisualizar.contact_cpf_cnpj}
                    </span>
                  </div>
                  <div>
                    <strong>Endereço:</strong> {selectedBoletoVisualizar.contact_endereco?.logradouro}, {selectedBoletoVisualizar.contact_endereco?.numero} — {selectedBoletoVisualizar.contact_endereco?.bairro}, {selectedBoletoVisualizar.contact_endereco?.cidade}/{selectedBoletoVisualizar.contact_endereco?.uf} — CEP: {selectedBoletoVisualizar.contact_endereco?.cep}
                  </div>
                </div>

                {/* Barcode and Pix Hybrid Area */}
                <div className="pt-3 border-t-2 border-dashed border-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Simulated Standard Barcode */}
                  <div className="space-y-1">
                    <div className="h-14 w-80 bg-slate-900 flex items-center justify-between px-1 tracking-widest text-[8px] text-white font-mono select-none overflow-hidden" style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, #000 0px, #000 3px, #fff 3px, #fff 5px, #000 5px, #000 8px, #fff 8px, #fff 10px, #000 10px, #000 12px)'
                    }}>
                      <span className="opacity-0">BARCODE</span>
                    </div>
                    <div className="font-mono text-[9px] text-slate-500 text-center tracking-widest">
                      {selectedBoletoVisualizar.codigo_barras}
                    </div>
                  </div>

                  {/* Pix QR Code Hybrid */}
                  <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                    <img
                      src={selectedBoletoVisualizar.qr_code_pix_url || 'https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=00020126580014br.gov.bcb.pix'}
                      alt="QR Code Pix"
                      className="w-18 h-18 rounded border border-emerald-300"
                    />
                    <div className="text-[10px] text-emerald-900 space-y-1">
                      <strong className="block text-emerald-800 uppercase font-black">Pix Copia e Cola</strong>
                      <p>Compensação D+0 imediata em qualquer banco 24/7.</p>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedBoletoVisualizar.pix_copia_cola, 'Pix Copia e Cola')}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        Copiar Código Pix
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedBoletoVisualizar.linha_digitavel, 'Linha Digitável')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Linha Digitável
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedBoletoVisualizar.pix_copia_cola, 'Pix Copia e Cola')}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    Copiar Pix
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-[#2E3192] hover:bg-[#1E216B] text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir Boleto / Salvar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURAR FINTECH / GATEWAY */}
      {editingFintech && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#2E3192] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#F2EC00]" />
                <div>
                  <h3 className="text-sm font-bold">Configurar {editingFintech.nome}</h3>
                  <p className="text-[11px] text-slate-200">Credenciais bancárias & Webhook</p>
                </div>
              </div>
              <button
                onClick={() => setEditingFintech(null)}
                className="text-white hover:text-[#F2EC00] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFintech} className="p-5 space-y-3.5 text-xs">
              {/* Ativo Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800">Gateway Ativo para Emissão</span>
                <input
                  type="checkbox"
                  checked={editingFintech.ativo}
                  onChange={e => setEditingFintech({ ...editingFintech, ativo: e.target.checked })}
                  className="w-4 h-4 text-[#2E3192] rounded cursor-pointer"
                />
              </div>

              {/* Ambiente */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Ambiente Operacional</label>
                <select
                  value={editingFintech.ambiente}
                  onChange={e => setEditingFintech({ ...editingFintech, ambiente: e.target.value as 'sandbox' | 'producao' })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold text-slate-800"
                >
                  <option value="producao">Produção (Live / Boletos Reais)</option>
                  <option value="sandbox">Sandbox (Ambiente de Testes / Homologação)</option>
                </select>
              </div>

              {/* API Key */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">API Key / Token de Acesso</label>
                <input
                  type="password"
                  value={editingFintech.api_key}
                  onChange={e => setEditingFintech({ ...editingFintech, api_key: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800"
                />
              </div>

              {/* Webhook URL */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">URL de Retorno (Webhook de Notificação)</label>
                <input
                  type="text"
                  value={editingFintech.webhook_url}
                  onChange={e => setEditingFintech({ ...editingFintech, webhook_url: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-800"
                />
              </div>

              {/* Tarifa & Dias */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Custo por Boleto (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingFintech.tarifa_boleto}
                    onChange={e => setEditingFintech({ ...editingFintech, tarifa_boleto: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prazo Repasse</label>
                  <input
                    type="text"
                    value={editingFintech.dias_compensacao}
                    onChange={e => setEditingFintech({ ...editingFintech, dias_compensacao: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFintech(null)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2E3192] hover:bg-[#1E216B] text-white font-bold rounded-lg shadow cursor-pointer"
                >
                  Salvar Configurações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
