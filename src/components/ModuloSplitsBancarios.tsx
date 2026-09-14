import React, { useState } from 'react';
import { 
  ConfigSplitBancario, 
  RegistroSplitExecutado, 
  CobrancaBoleto, 
  SocioSplit, 
  AppSettings,
  TipoChavePix
} from '../types';
import { 
  DollarSign, 
  Building2, 
  Users, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  Receipt, 
  FileText, 
  ShieldCheck, 
  Clock, 
  Send, 
  Sliders, 
  ExternalLink,
  ChevronRight,
  Info,
  QrCode,
  X
} from 'lucide-react';

interface ModuloSplitsBancariosProps {
  config: ConfigSplitBancario;
  registros: RegistroSplitExecutado[];
  cobrancas: CobrancaBoleto[];
  onSaveConfig: (cfg: ConfigSplitBancario) => Promise<void> | void;
  onLiquidarCobrancaComSplit: (cobrancaId: string) => Promise<void> | void;
  appSettings?: AppSettings;
}

export const ModuloSplitsBancarios: React.FC<ModuloSplitsBancariosProps> = ({
  config,
  registros,
  cobrancas,
  onSaveConfig,
  onLiquidarCobrancaComSplit,
  appSettings
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'extrato' | 'pendentes'>('config');
  const [formData, setFormData] = useState<ConfigSplitBancario>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedRegistroModal, setSelectedRegistroModal] = useState<RegistroSplitExecutado | null>(null);
  const [liquidandoId, setLiquidandoId] = useState<string | null>(null);

  // Modal para adicionar novo sócio
  const [isAddSocioOpen, setIsAddSocioOpen] = useState(false);
  const [newSocio, setNewSocio] = useState<Partial<SocioSplit>>({
    nome: '',
    cargo: 'Sócio Participante',
    cpf: '',
    chave_pix: '',
    tipo_chave_pix: 'CPF',
    banco: 'Banco Santander (033)',
    agencia_conta: 'Ag. 0001 / CC 00000-0',
    percentual: 10,
    ativo: true,
    email_notificacao: ''
  });

  const primaryColor = appSettings?.cor_primaria || '#2E3192';

  // Cálculos de métricas
  const totalArrecadado = registros.reduce((acc, r) => acc + r.valor_total_pago, 0);
  const totalEmpresaPj = registros.reduce((acc, r) => {
    const item = r.distribuicao.find(d => d.tipo === 'EMPRESA');
    return acc + (item ? item.valor_liquido : 0);
  }, 0);
  const totalSocios = registros.reduce((acc, r) => {
    const sociosItems = r.distribuicao.filter(d => d.tipo === 'SOCIO');
    return acc + sociosItems.reduce((sAcc, s) => sAcc + s.valor_liquido, 0);
  }, 0);

  // Validação de percentual: Empresa + Sócios ativos = 100%
  const somaPercentualSocios = formData.socios
    .filter(s => s.ativo)
    .reduce((acc, s) => acc + Number(s.percentual || 0), 0);
  const somaTotal = Number(formData.empresa_percentual || 0) + somaPercentualSocios;
  const isPercentualValido = Math.abs(somaTotal - 100) < 0.01;

  // Boletos pendentes elegíveis para split
  const boletosPendentes = cobrancas.filter(c => c.status === 'Pendente');

  const handleUpdateEmpresaPercent = (val: number) => {
    setFormData(prev => ({
      ...prev,
      empresa_percentual: val
    }));
  };

  const handleUpdateSocioPercent = (socioId: string, val: number) => {
    setFormData(prev => ({
      ...prev,
      socios: prev.socios.map(s => s.id === socioId ? { ...s, percentual: val } : s)
    }));
  };

  const handleToggleSocioAtivo = (socioId: string) => {
    setFormData(prev => ({
      ...prev,
      socios: prev.socios.map(s => s.id === socioId ? { ...s, ativo: !s.ativo } : s)
    }));
  };

  const handleRemoveSocio = (socioId: string) => {
    setFormData(prev => ({
      ...prev,
      socios: prev.socios.filter(s => s.id !== socioId)
    }));
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await onSaveConfig(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSocioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocio.nome || !newSocio.chave_pix) return;

    const socioCreated: SocioSplit = {
      id: `socio-${Date.now()}`,
      nome: newSocio.nome,
      cargo: newSocio.cargo || 'Sócio Participante',
      cpf: newSocio.cpf || '',
      chave_pix: newSocio.chave_pix,
      tipo_chave_pix: (newSocio.tipo_chave_pix as TipoChavePix) || 'CPF',
      banco: newSocio.banco || 'Banco Santander (033)',
      agencia_conta: newSocio.agencia_conta || '',
      percentual: Number(newSocio.percentual || 10),
      ativo: true,
      email_notificacao: newSocio.email_notificacao
    };

    setFormData(prev => ({
      ...prev,
      socios: [...prev.socios, socioCreated]
    }));

    setIsAddSocioOpen(false);
    setNewSocio({
      nome: '',
      cargo: 'Sócio Participante',
      cpf: '',
      chave_pix: '',
      tipo_chave_pix: 'CPF',
      banco: 'Banco Santander (033)',
      agencia_conta: 'Ag. 0001 / CC 00000-0',
      percentual: 10,
      ativo: true,
      email_notificacao: ''
    });
  };

  const handleLiquidar = async (cobrancaId: string) => {
    setLiquidandoId(cobrancaId);
    try {
      await onLiquidarCobrancaComSplit(cobrancaId);
      setActiveTab('extrato');
    } finally {
      setLiquidandoId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#1C1E63] via-[#2E3192] to-indigo-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#F2EC00] mb-2 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sistema Bancário de Splits Automatizados • Resolução Bacen 3.954</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Distribuição de Honorários entre Sócios & Empresa</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
            Quando o cliente efetua o pagamento do boleto ou Pix, o gateway bancário divide automaticamente o valor líquido entre a conta PJ da Brasil Legal e as contas dos sócios.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('pendentes')}
            className="px-4 py-2.5 rounded-xl bg-[#F2EC00] hover:bg-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <DollarSign className="w-4 h-4" />
            <span>Liquidar Boleto & Ratear ({boletosPendentes.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Liquidado & Rateado</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-[#2E3192]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {totalArrecadado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> {registros.length} rateio{registros.length > 1 ? 's' : ''} executado{registros.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conta PJ (Empresa)</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {totalEmpresaPj.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            Cota Operacional / Caixa PJ ({formData.empresa_percentual}%)
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Repassado aos Sócios</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {totalSocios.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Distribuído via Pix direto ({somaPercentualSocios}%)
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Boletos Aguardando Pagamento</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {boletosPendentes.length}
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            Split engatilhado na liquidação
          </span>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'config'
              ? 'bg-[#2E3192] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Regras de Rateio & Sócios</span>
        </button>

        <button
          onClick={() => setActiveTab('extrato')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'extrato'
              ? 'bg-[#2E3192] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Extrato de Splits Executados ({registros.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pendentes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'pendentes'
              ? 'bg-[#2E3192] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Simulador de Liquidação ({boletosPendentes.length})</span>
        </button>
      </div>

      {/* TAB 1: CONFIGURAÇÃO DE REGRAS & SÓCIOS */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Status e Validação da Soma de Percentuais */}
          <div className={`p-4 rounded-2xl border ${
            isPercentualValido ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
          } flex flex-col md:flex-row md:items-center md:justify-between gap-3`}>
            <div className="flex items-start gap-3">
              {isPercentualValido ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Distribuição Total: {somaTotal.toFixed(1)}% de 100.0%
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {isPercentualValido
                    ? 'A soma entre a cota da Empresa e os sócios fecha exatamente em 100%. As regras estão em conformidade.'
                    : `Atenção: A soma dos percentuais precisa fechar em 100% para evitar divergência de caixa. Ajuste os percentuais abaixo.`}
                </p>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full md:w-64">
              <div className="h-3 rounded-full bg-slate-200 overflow-hidden flex">
                <div 
                  className="bg-[#2E3192] h-full" 
                  style={{ width: `${Math.min(100, formData.empresa_percentual)}%` }} 
                  title={`Empresa: ${formData.empresa_percentual}%`}
                />
                {formData.socios.filter(s => s.ativo).map((s, idx) => (
                  <div
                    key={s.id}
                    className={idx % 2 === 0 ? 'bg-emerald-500 h-full' : 'bg-amber-500 h-full'}
                    style={{ width: `${s.percentual}%` }}
                    title={`${s.nome}: ${s.percentual}%`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                <span>Empresa: {formData.empresa_percentual}%</span>
                <span>Sócios: {somaPercentualSocios}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Box Conta PJ da Empresa */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-[#2E3192]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">Conta da Empresa (PJ)</h3>
                </div>
                <span className="text-xs font-black text-[#2E3192] bg-indigo-50 px-2.5 py-1 rounded-lg">
                  {formData.empresa_percentual}%
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Percentual da Empresa (Caixa/Operacional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={formData.empresa_percentual}
                    onChange={e => handleUpdateEmpresaPercent(Number(e.target.value))}
                    className="w-24 px-3 py-2 text-xs border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                  <span className="text-xs text-slate-500">% do total líquido recebido</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Razão Social da Empresa
                </label>
                <input
                  type="text"
                  value={formData.empresa_razao_social}
                  onChange={e => setFormData({ ...formData, empresa_razao_social: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  CNPJ da Conta PJ
                </label>
                <input
                  type="text"
                  value={formData.empresa_cnpj}
                  onChange={e => setFormData({ ...formData, empresa_cnpj: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Chave Pix Operacional PJ
                </label>
                <input
                  type="text"
                  value={formData.empresa_chave_pix}
                  onChange={e => setFormData({ ...formData, empresa_chave_pix: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Banco & Agência PJ
                </label>
                <input
                  type="text"
                  value={formData.empresa_banco}
                  onChange={e => setFormData({ ...formData, empresa_banco: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl text-slate-800"
                />
              </div>
            </div>

            {/* Lista e Configuração de Sócios */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Sócios Beneficiários do Split</h3>
                    <p className="text-[10px] text-slate-500">Distribuição automática via Pix com autenticação Bacen</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddSocioOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Sócio</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {formData.socios.map(socio => (
                  <div key={socio.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{socio.nome}</span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {socio.cargo}
                        </span>
                        {!socio.ativo && (
                          <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded">
                            Inativo
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 font-mono">
                        <span>Chave Pix: <strong className="text-slate-800">{socio.chave_pix}</strong> ({socio.tipo_chave_pix})</span>
                        <span>{socio.banco}</span>
                        <span>CPF: {socio.cpf}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] text-slate-600 font-bold">Cota:</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          value={socio.percentual}
                          onChange={e => handleUpdateSocioPercent(socio.id, Number(e.target.value))}
                          className="w-16 px-2 py-1 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg text-center"
                        />
                        <span className="text-xs font-bold text-slate-700">%</span>
                      </div>

                      <button
                        onClick={() => handleToggleSocioAtivo(socio.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer ${
                          socio.ativo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {socio.ativo ? 'Ativo' : 'Pausado'}
                      </button>

                      <button
                        onClick={() => handleRemoveSocio(socio.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg cursor-pointer"
                        title="Remover sócio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Parâmetros Operacionais de Repasse */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Quem absorve a taxa bancária do Gateway?
                  </label>
                  <select
                    value={formData.taxa_gateway_quem_paga}
                    onChange={e => setFormData({ ...formData, taxa_gateway_quem_paga: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-800"
                  >
                    <option value="PROPORCIONAL">Dedução Proporcional (Cada um paga sua cota)</option>
                    <option value="EMPRESA">Empresa Absorve 100% da Tarifa (Sócios recebem bruto integral)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Momento do Repasse Pix
                  </label>
                  <select
                    value={formData.momento_repasse}
                    onChange={e => setFormData({ ...formData, momento_repasse: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white text-slate-800"
                  >
                    <option value="IMEDIATO_LIQUIDACAO">Instantâneo (No momento que o cliente paga)</option>
                    <option value="D_PLUS_1">D+1 (Consolidado no dia útil seguinte)</option>
                    <option value="D_PLUS_14">D+14 (Quinzenal com fechamento contábil)</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes adicionais */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notificar_socios_pix}
                    onChange={e => setFormData({ ...formData, notificar_socios_pix: e.target.checked })}
                    className="w-4 h-4 rounded text-[#2E3192]"
                  />
                  <span className="text-slate-700 font-medium">Disparar comprovante de rateio por e-mail aos sócios</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notificar_push_desktop}
                    onChange={e => setFormData({ ...formData, notificar_push_desktop: e.target.checked })}
                    className="w-4 h-4 rounded text-[#2E3192]"
                  />
                  <span className="text-slate-700 font-medium">Alertar via Notificação Desktop quando o cliente pagar</span>
                </label>
              </div>

              {/* Botão Salvar */}
              <div className="pt-4 flex items-center justify-end gap-3">
                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Configurações de Split salvas com sucesso!
                  </span>
                )}
                <button
                  id="btn-salvar-split-config"
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Salvando...' : 'Salvar Regras de Split'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXTRATO DE SPLITS EXECUTADOS */}
      {activeTab === 'extrato' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#2E3192]" />
                <span>Extrato Geral de Splits Bancários Executados</span>
              </h3>
              <p className="text-xs text-slate-500">
                Histórico detalhado de pagamentos liquidados e transferências Pix efetuadas aos sócios e à empresa.
              </p>
            </div>
          </div>

          {registros.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="font-bold text-slate-700">Nenhum split bancário executado ainda</p>
              <p className="text-xs text-slate-400 mt-1">
                Acesse a aba "Simulador de Liquidação" para liquidar um boleto pendente e ver o rateio automático.
              </p>
              <button
                onClick={() => setActiveTab('pendentes')}
                className="mt-3 px-4 py-2 bg-[#2E3192] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Ver Boletos Elegíveis
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Protocolo / Data</th>
                    <th className="py-2.5 px-3">Cliente / Imóvel</th>
                    <th className="py-2.5 px-3">Valor Total Pago</th>
                    <th className="py-2.5 px-3">Empresa (PJ)</th>
                    <th className="py-2.5 px-3">Sócios Participantes</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {registros.map(reg => {
                    const empresaItem = reg.distribuicao.find(d => d.tipo === 'EMPRESA');
                    const sociosItems = reg.distribuicao.filter(d => d.tipo === 'SOCIO');

                    return (
                      <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-slate-900">{reg.id}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(reg.data_split).toLocaleDateString('pt-BR')} às {new Date(reg.data_split).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{reg.cliente_nome}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-xs">{reg.deal_titulo || 'Serviços Registrais'}</div>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {reg.valor_total_pago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          <div className="text-[10px] text-slate-400 font-normal">
                            Taxa gateway: R$ {reg.tarifa_gateway.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-blue-900">
                            {empresaItem ? empresaItem.valor_liquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}
                          </div>
                          <div className="text-[10px] text-blue-600 font-medium">
                            {empresaItem ? `${empresaItem.percentual}% Caixa PJ` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            {sociosItems.map((socio, idx) => (
                              <div key={idx} className="text-[11px] flex items-center justify-between gap-2">
                                <span className="text-slate-600 truncate max-w-[140px]">{socio.beneficiario_nome.split(' ')[0]} {socio.beneficiario_nome.split(' ')[1] || ''}:</span>
                                <strong className="text-emerald-700">
                                  {socio.valor_liquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </strong>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> {reg.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => setSelectedRegistroModal(reg)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <FileText className="w-3 h-3 text-[#2E3192]" />
                            <span>Comprovante</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SIMULADOR DE LIQUIDAÇÃO & RATEIO */}
      {activeTab === 'pendentes' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Boletos Prontos para Pagamento & Execução de Split</span>
              </h3>
              <p className="text-xs text-slate-500">
                Ao registrar ou simular o pagamento pelo cliente, a rotina distribuirá os fundos imediatamente para os sócios e para a empresa, disparando o alerta desktop.
              </p>
            </div>
          </div>

          {boletosPendentes.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 stroke-1" />
              <p className="font-bold text-slate-700">Todos os boletos emitidos já foram liquidados!</p>
              <p className="text-xs text-slate-400 mt-1">
                Novas cobranças emitidas no módulo de Cobranças Bancárias aparecerão aqui automaticamente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {boletosPendentes.map(boleto => {
                const valor = boleto.valor;
                const tarifa = 3.49;
                const valorLiquido = valor - tarifa;
                const valorEmpresa = (valorLiquido * formData.empresa_percentual) / 100;

                return (
                  <div key={boleto.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{boleto.gateway} • {boleto.nosso_numero}</span>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5">{boleto.contact_nome}</h4>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">{boleto.deal_titulo || boleto.descricao}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-slate-900">
                          {valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <div className="text-[10px] text-amber-700 font-semibold">Pendente de Pagamento</div>
                      </div>
                    </div>

                    {/* Prévia da Distribuição do Split */}
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] space-y-1 mb-3">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Previsão de Rateio Automático:</span>
                        <span>Líq: R$ {valorLiquido.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-blue-900 font-semibold">
                        <span>Empresa Brasil Legal ({formData.empresa_percentual}%):</span>
                        <span>R$ {valorEmpresa.toFixed(2)}</span>
                      </div>
                      {formData.socios.filter(s => s.ativo).map(socio => {
                        const valSocio = (valorLiquido * socio.percentual) / 100;
                        return (
                          <div key={socio.id} className="flex justify-between text-emerald-800">
                            <span className="truncate max-w-[200px]">{socio.nome} ({socio.percentual}%):</span>
                            <strong>R$ {valSocio.toFixed(2)}</strong>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handleLiquidar(boleto.id)}
                      disabled={liquidandoId === boleto.id}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all disabled:opacity-70"
                    >
                      {liquidandoId === boleto.id ? (
                        <span>Processando liquidação & rateio Pix...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Simular Pagamento do Cliente & Executar Split</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal para Adicionar Novo Sócio */}
      {isAddSocioOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2E3192]" />
                <span>Cadastrar Sócio Beneficiário</span>
              </h3>
              <button onClick={() => setIsAddSocioOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSocioSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo do Sócio</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Fulano de Tal"
                  value={newSocio.nome}
                  onChange={e => setNewSocio({ ...newSocio, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cargo / Atribuição</label>
                <input
                  type="text"
                  placeholder="Ex: Sócio Diretor / Engenheiro Responsável"
                  value={newSocio.cargo}
                  onChange={e => setNewSocio({ ...newSocio, cargo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={newSocio.cpf}
                    onChange={e => setNewSocio({ ...newSocio, cpf: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Percentual (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    step={0.5}
                    value={newSocio.percentual}
                    onChange={e => setNewSocio({ ...newSocio, percentual: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Chave Pix</label>
                  <select
                    value={newSocio.tipo_chave_pix}
                    onChange={e => setNewSocio({ ...newSocio, tipo_chave_pix: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="CPF">CPF</option>
                    <option value="Email">E-mail</option>
                    <option value="Telefone">Telefone</option>
                    <option value="Aleatória">Chave Aleatória (EVP)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chave Pix</label>
                  <input
                    type="text"
                    required
                    placeholder="Chave para depósito Pix"
                    value={newSocio.chave_pix}
                    onChange={e => setNewSocio({ ...newSocio, chave_pix: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Banco / Agência e Conta</label>
                <input
                  type="text"
                  placeholder="Ex: Santander (033) - Ag. 1205 CC 48291-0"
                  value={newSocio.banco}
                  onChange={e => setNewSocio({ ...newSocio, banco: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSocioOpen(false)}
                  className="px-3 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Comprovante Oficial de Split */}
      {selectedRegistroModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-[#2E3192]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Comprovante de Rateio & Split Bancário</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Autenticação: {selectedRegistroModal.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRegistroModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Header do Recibo */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Origem do Recebimento</div>
                  <div className="font-bold text-slate-900">{selectedRegistroModal.cliente_nome}</div>
                  <div className="text-[11px] text-slate-500">{selectedRegistroModal.deal_titulo}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Valor Total Recebido</div>
                  <div className="text-base font-black text-slate-900">
                    {selectedRegistroModal.valor_total_pago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="text-[10px] text-slate-500">Tarifa do Gateway: R$ {selectedRegistroModal.tarifa_gateway.toFixed(2)}</div>
                </div>
              </div>

              {/* Detalhamento dos Repasses */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wider">
                  Beneficiários & Autenticações PIX
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {selectedRegistroModal.distribuicao.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white hover:bg-slate-50 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{item.beneficiario_nome}</span>
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                            item.tipo === 'EMPRESA' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.percentual}%
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Pix: {item.chave_pix} • {item.banco}
                        </div>
                        <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                          Hash Bacen: {item.autenticacao_bancaria}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold text-slate-900">
                          {item.valor_liquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-0.5 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Liquidado
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#2E3192] shrink-0 mt-0.5" />
                <span>
                  Comprovante gerado em conformidade com as regras de subcontas e liquidação direta autorizadas pelo Banco Central do Brasil. Os fundos não transitam por conta de custódia não autorizada.
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedRegistroModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Fechar Comprovante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
