import React, { useState, useMemo, useEffect } from 'react';
import { 
  FinancialRecord, 
  ConfigSplitBancario, 
  NaturezaFinanceira, 
  CategoriaFinanceira,
  DistribuicaoResultadoRegistro
} from '../types';
import { initialConfigSplitBancario } from '../mockData';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  Calendar, 
  Filter, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Users, 
  Building, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  X, 
  Save, 
  Percent, 
  Receipt,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

interface ModuloGestaoFinanceiraDREProps {
  records?: FinancialRecord[];
  configSplit?: ConfigSplitBancario;
  onSaveRecord?: (record: FinancialRecord) => Promise<void> | void;
  onUpdateRecord?: (id: string, updates: Partial<FinancialRecord>) => Promise<void> | void;
  onSaveConfigSplit?: (config: ConfigSplitBancario) => Promise<void> | void;
}

export const ModuloGestaoFinanceiraDRE: React.FC<ModuloGestaoFinanceiraDREProps> = ({
  records = [],
  configSplit = initialConfigSplitBancario,
  onSaveRecord = (_record?: FinancialRecord) => {},
  onUpdateRecord = (_id?: string, _updates?: Partial<FinancialRecord>) => {},
  onSaveConfigSplit = (_config?: ConfigSplitBancario) => {}
}) => {
  const [subTab, setSubTab] = useState<'fluxo' | 'dre' | 'extrato_socios' | 'config_split'>('fluxo');
  
  // Filters
  const [filtroNatureza, setFiltroNatureza] = useState<'TODAS' | NaturezaFinanceira>('TODAS');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'pago' | 'pendente'>('TODOS');
  const [filtroPeriodo, setFiltroPeriodo] = useState<'2026-03' | '2026-02' | '2026' | 'TODOS'>('2026-03');
  
  // Modal Novo Lançamento
  const [showNovoLancamentoModal, setShowNovoLancamentoModal] = useState(false);
  const [novoNatureza, setNovoNatureza] = useState<NaturezaFinanceira>('RECEITA');
  const [novoCategoria, setNovoCategoria] = useState<CategoriaFinanceira>('Honorários Advocatícios');
  const [novoDescricao, setNovoDescricao] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [novoData, setNovoData] = useState(new Date().toISOString().split('T')[0]);
  const [novoFavorecido, setNovoFavorecido] = useState('');
  const [novoStatus, setNovoStatus] = useState<'pago' | 'pendente'>('pago');
  const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);

  // Config Split State with safe fallback
  const [splitForm, setSplitForm] = useState<ConfigSplitBancario>(configSplit || initialConfigSplitBancario);
  const [isSavingSplit, setIsSavingSplit] = useState(false);
  const [splitFeedback, setSplitFeedback] = useState<string | null>(null);

  // Sync splitForm when configSplit updates
  useEffect(() => {
    if (configSplit) {
      setSplitForm(configSplit);
    }
  }, [configSplit]);

  // Filtered Records with defensive array fallback
  const filteredRecords = useMemo(() => {
    const list = Array.isArray(records) ? records : [];
    return list.filter(r => {
      if (!r) return false;
      if (filtroNatureza !== 'TODAS' && r.natureza !== filtroNatureza) return false;
      if (filtroStatus !== 'TODOS' && r.status !== filtroStatus) return false;
      if (filtroPeriodo === '2026-03' && !r.data?.startsWith('2026-03')) return false;
      if (filtroPeriodo === '2026-02' && !r.data?.startsWith('2026-02')) return false;
      if (filtroPeriodo === '2026' && !r.data?.startsWith('2026')) return false;
      return true;
    });
  }, [records, filtroNatureza, filtroStatus, filtroPeriodo]);

  // Totais & Métricas
  const totalReceitas = useMemo(() => {
    return (records || [])
      .filter(r => r?.natureza === 'RECEITA' && r?.status === 'pago')
      .reduce((acc, r) => acc + (r?.valor || 0), 0);
  }, [records]);

  const totalDespesas = useMemo(() => {
    return (records || [])
      .filter(r => r?.natureza === 'DESPESA' && r?.status === 'pago')
      .reduce((acc, r) => acc + (r?.valor || 0), 0);
  }, [records]);

  const resultadoLiquidoTotal = totalReceitas - totalDespesas;

  // DRE Calculations (baseado no período filtrado ou todos os pagos)
  const dreData = useMemo(() => {
    const list = Array.isArray(records) ? records : [];
    const periodRecords = list.filter(r => {
      if (!r) return false;
      if (filtroPeriodo === '2026-03') return r.data?.startsWith('2026-03');
      if (filtroPeriodo === '2026-02') return r.data?.startsWith('2026-02');
      if (filtroPeriodo === '2026') return r.data?.startsWith('2026');
      return true;
    });

    const receitaBruta = periodRecords
      .filter(r => r?.natureza === 'RECEITA' && r?.status === 'pago')
      .reduce((acc, r) => acc + (r?.valor || 0), 0);

    const impostos = periodRecords
      .filter(r => r?.categoria === 'Impostos e Tributos' && r?.status === 'pago')
      .reduce((acc, r) => acc + (r?.valor || 0), 0);

    const receitaLiquida = receitaBruta - impostos;

    const custosServicos = periodRecords
      .filter(r => (r.categoria === 'Custas e Emolumentos' || r.categoria === 'Topografia e Engenharia') && r.status === 'pago')
      .reduce((acc, r) => acc + r.valor, 0);

    const lucroBruto = receitaLiquida - custosServicos;

    const despesasOperacionais = periodRecords
      .filter(r => [
        'Comissão Parceiro B2B',
        'Marketing e Tráfego',
        'Software e TI',
        'Despesas Administrativas'
      ].includes(r.categoria) && r.status === 'pago')
      .reduce((acc, r) => acc + r.valor, 0);

    const lucroLiquidoExercicio = lucroBruto - despesasOperacionais;

    // Distribuição de Resultados
    const totalDistribuidoEmpresa = periodRecords
      .filter(r => r.distribuicao_resultado?.empresa_valor)
      .reduce((acc, r) => acc + (r.distribuicao_resultado?.empresa_valor || 0), 0);

    const repassesPorSocio: Record<string, number> = {};
    configSplit.socios.forEach(s => {
      repassesPorSocio[s.nome] = 0;
    });

    periodRecords.forEach(r => {
      if (r.distribuicao_resultado?.socios) {
        r.distribuicao_resultado.socios.forEach(s => {
          repassesPorSocio[s.nome] = (repassesPorSocio[s.nome] || 0) + s.valor;
        });
      }
    });

    const totalDistribuidoSocios = Object.values(repassesPorSocio).reduce((acc, v) => acc + v, 0);

    return {
      receitaBruta,
      impostos,
      receitaLiquida,
      custosServicos,
      lucroBruto,
      despesasOperacionais,
      lucroLiquidoExercicio,
      totalDistribuidoEmpresa,
      totalDistribuidoSocios,
      repassesPorSocio
    };
  }, [records, filtroPeriodo, configSplit]);

  // Chart Data for monthly comparison
  const monthlyComparisonData = useMemo(() => {
    const months = ['2026-01', '2026-02', '2026-03'];
    return months.map(m => {
      const mLabel = m === '2026-01' ? 'Jan/26' : m === '2026-02' ? 'Fev/26' : 'Mar/26';
      const rec = records
        .filter(r => r.natureza === 'RECEITA' && r.status === 'pago' && r.data.startsWith(m))
        .reduce((acc, r) => acc + r.valor, 0);
      const desp = records
        .filter(r => r.natureza === 'DESPESA' && r.status === 'pago' && r.data.startsWith(m))
        .reduce((acc, r) => acc + r.valor, 0);
      return {
        mes: mLabel,
        Receitas: rec,
        Despesas: desp,
        Lucro: rec - desp
      };
    });
  }, [records]);

  // Donut chart for split distribution
  const splitChartData = useMemo(() => {
    return [
      { name: 'Caixa Empresa (Reserva)', value: configSplit.percentual_empresa_caixa, color: '#2E3192' },
      ...configSplit.socios.map((s, idx) => ({
        name: s.nome,
        value: s.percentual,
        color: idx === 0 ? '#10B981' : idx === 1 ? '#8B5CF6' : '#F59E0B'
      }))
    ];
  }, [configSplit]);

  // Action: Quitar e Distribuir Resultado Automaticamente
  const handleQuitarComDistribuicao = async (record: FinancialRecord) => {
    const valor = record.valor;
    const percEmpresa = configSplit.percentual_empresa_caixa;
    const valorEmpresa = (valor * percEmpresa) / 100;

    const sociosDistribuicao = configSplit.socios.map(s => ({
      socio_id: s.id,
      socio_nome: s.nome,
      nome: s.nome,
      percentual: s.percentual,
      valor: (valor * s.percentual) / 100,
      chave_pix: s.chave_pix,
      status: 'Transferido' as const
    }));

    const distribuicao: DistribuicaoResultadoRegistro = {
      calculado_em: new Date().toISOString(),
      executado_em: new Date().toISOString(),
      honorario_total: valor,
      empresa_percentual: percEmpresa,
      empresa_valor: valorEmpresa,
      socios: sociosDistribuicao
    };

    await onUpdateRecord(record.id, {
      status: 'pago',
      distribuicao_resultado: distribuicao
    });
  };

  // Submit Novo Lançamento
  const handleCriarLancamento = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(novoValor);
    if (!val || val <= 0) return;

    setIsSubmittingRecord(true);
    try {
      let dist: DistribuicaoResultadoRegistro | undefined = undefined;

      // Se for receita paga, já calcula distribuição automática de resultados
      if (novoNatureza === 'RECEITA' && novoStatus === 'pago') {
        const percEmpresa = configSplit.percentual_empresa_caixa;
        const valorEmpresa = (val * percEmpresa) / 100;
        const sociosDistribuicao = configSplit.socios.map(s => ({
          socio_id: s.id,
          socio_nome: s.nome,
          nome: s.nome,
          percentual: s.percentual,
          valor: (val * s.percentual) / 100,
          chave_pix: s.chave_pix,
          status: 'Transferido' as const
        }));

        dist = {
          calculado_em: new Date().toISOString(),
          executado_em: new Date().toISOString(),
          honorario_total: val,
          empresa_percentual: percEmpresa,
          empresa_valor: valorEmpresa,
          socios: sociosDistribuicao
        };
      }

      const newRecord: FinancialRecord = {
        id: `REC-${Date.now()}`,
        data: novoData,
        data_vencimento: novoData,
        data_pagamento: novoStatus === 'pago' ? novoData : undefined,
        descricao: novoDescricao.trim(),
        valor: val,
        natureza: novoNatureza,
        categoria: novoCategoria,
        tipo: novoNatureza === 'RECEITA' ? 'HONORARIOS' : 'DESPESA_OPERACIONAL',
        beneficiario: novoFavorecido.trim() || (novoNatureza === 'RECEITA' ? 'Brasil Legal PJ' : 'Fornecedor'),
        status: novoStatus,
        favorecido: novoFavorecido.trim() || undefined,
        distribuicao_resultado: dist,
        created_at: new Date().toISOString()
      };

      await onSaveRecord(newRecord);
      setShowNovoLancamentoModal(false);
      // Reset form
      setNovoDescricao('');
      setNovoValor('');
      setNovoFavorecido('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingRecord(false);
    }
  };

  // Save Split Configuration with 100% check
  const handleSaveSplitConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalPerc = splitForm.percentual_empresa_caixa + splitForm.socios.reduce((acc, s) => acc + s.percentual, 0);
    if (Math.abs(totalPerc - 100) > 0.01) {
      setSplitFeedback(`A soma de todas as porcentagens deve ser exatamente 100%! Atual: ${totalPerc}%`);
      return;
    }

    setIsSavingSplit(true);
    try {
      await onSaveConfigSplit(splitForm);
      setSplitFeedback('Regra de divisão e porcentagens salvas com sucesso!');
      setTimeout(() => setSplitFeedback(null), 4000);
    } catch (err) {
      console.error(err);
      setSplitFeedback('Erro ao salvar configuração.');
    } finally {
      setIsSavingSplit(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Navigation */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Wallet className="w-3 h-3 text-emerald-600" />
                Controladoria PJ
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Fluxo de Caixa, DRE & Divisão de Honorários
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#2E3192]" />
              Gestão Financeira & Distribuição de Resultados
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 max-w-3xl">
              Acompanhamento completo de receitas, custas cartorárias e despesas operacionais. Rateio automático de honorários quitados entre a reserva da empresa e o repasse aos sócios com DRE contábil por competência.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl px-3 py-2 shrink-0">
              <span className="text-[10px] text-emerald-800 uppercase font-bold block">Receita Bruta Paga</span>
              <span className="text-xs sm:text-sm font-black text-emerald-900">
                {totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 rounded-xl px-3 py-2 shrink-0">
              <span className="text-[10px] text-rose-800 uppercase font-bold block">Despesas Pagas</span>
              <span className="text-xs sm:text-sm font-black text-rose-900">
                {totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl px-3 py-2 shrink-0">
              <span className="text-[10px] text-[#2E3192] uppercase font-bold block">Resultado Líquido</span>
              <span className="text-xs sm:text-sm font-black text-[#2E3192]">
                {resultadoLiquidoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center justify-between gap-3 mt-4 pt-1 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setSubTab('fluxo')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                subTab === 'fluxo'
                  ? 'bg-white text-[#2E3192] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-[#2E3192]" />
              <span>Fluxo de Caixa & Lançamentos</span>
              <span className="text-[10px] bg-indigo-50 text-[#2E3192] px-1.5 py-0.2 rounded font-bold">
                {records.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('dre')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                subTab === 'dre'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>DRE Demonstrativo de Resultados</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('extrato_socios')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                subTab === 'extrato_socios'
                  ? 'bg-white text-purple-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-purple-600" />
              <span>Extrato & Repasse aos Sócios</span>
            </button>

            <button
              type="button"
              onClick={() => setSubTab('config_split')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                subTab === 'config_split'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Percent className="w-4 h-4 text-amber-600" />
              <span>Regras de Porcentagens</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowNovoLancamentoModal(true)}
            className="px-4 py-2 bg-[#2E3192] hover:bg-[#1E216B] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#F2EC00]" />
            <span>Novo Lançamento Financeiro</span>
          </button>
        </div>
      </div>

      {/* 1. FLUXO DE CAIXA */}
      {subTab === 'fluxo' && (
        <div className="space-y-6">
          {/* Comparative Graph */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Evolução Comparativa: Receitas vs. Despesas vs. Lucro Líquido
                </h3>
                <p className="text-xs text-slate-500">
                  Desempenho financeiro consolidado por competência mensal
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Margem Líquida Média: {totalReceitas > 0 ? ((resultadoLiquidoTotal / totalReceitas) * 100).toFixed(1) : 0}%
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={v => `R$ ${(v / 1000)}k`} />
                  <Tooltip 
                    formatter={(value: any) => [Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), '']}
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Receitas" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Despesas" fill="#F43F5E" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Lucro" fill="#2E3192" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Filtros:
              </span>

              {/* Natureza */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFiltroNatureza('TODAS')}
                  className={`px-2.5 py-1 rounded cursor-pointer ${filtroNatureza === 'TODAS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroNatureza('RECEITA')}
                  className={`px-2.5 py-1 rounded cursor-pointer ${filtroNatureza === 'RECEITA' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'}`}
                >
                  Receitas
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroNatureza('DESPESA')}
                  className={`px-2.5 py-1 rounded cursor-pointer ${filtroNatureza === 'DESPESA' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600'}`}
                >
                  Despesas
                </button>
              </div>

              {/* Status */}
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as any)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 outline-none"
              >
                <option value="TODOS">Status: Todos</option>
                <option value="pago">Quitados / Recebidos</option>
                <option value="pendente">Pendentes / A Vencer</option>
              </select>

              {/* Periodo */}
              <select
                value={filtroPeriodo}
                onChange={(e) => setFiltroPeriodo(e.target.value as any)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 outline-none"
              >
                <option value="2026-03">Mês Vigente (Março/2026)</option>
                <option value="2026-02">Fevereiro/2026</option>
                <option value="2026">Ano Todo (2026)</option>
                <option value="TODOS">Todo o Histórico</option>
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Exibindo <strong>{filteredRecords.length}</strong> de {records.length} lançamentos
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Descrição & Favorecido</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Natureza</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Distribuição Automática</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                        Nenhum lançamento encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => {
                      const isReceita = r.natureza === 'RECEITA';
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                            {new Date(r.data).toLocaleDateString('pt-BR')}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{r.descricao}</div>
                            {r.favorecido && (
                              <div className="text-[11px] text-slate-500">{r.favorecido}</div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                              {r.categoria}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              isReceita
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}>
                              {isReceita ? <ArrowUpRight className="w-3 h-3 text-emerald-600" /> : <ArrowDownRight className="w-3 h-3 text-rose-600" />}
                              {r.natureza}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-bold whitespace-nowrap">
                            <span className={isReceita ? 'text-emerald-800' : 'text-rose-800'}>
                              {isReceita ? '+' : '-'} {r.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              r.status === 'pago'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {r.status === 'pago' ? 'Quitado' : 'Pendente'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {r.distribuicao_resultado ? (
                              <div className="text-[11px] space-y-0.5">
                                <span className="text-emerald-800 font-bold block">
                                  ✓ Rateado ({r.distribuicao_resultado.empresa_percentual}% Caixa PJ)
                                </span>
                                <span className="text-slate-500 text-[10px]">
                                  {r.distribuicao_resultado.socios.map(s => `${s.nome.split(' ')[0]}: R$ ${s.valor.toLocaleString('pt-BR')}`).join(' | ')}
                                </span>
                              </div>
                            ) : isReceita && r.status === 'pago' ? (
                              <button
                                type="button"
                                onClick={() => handleQuitarComDistribuicao(r)}
                                className="text-[11px] font-bold text-[#2E3192] hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3 text-[#2E3192]" />
                                Calcular Divisão
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {r.status === 'pendente' && isReceita && (
                              <button
                                type="button"
                                onClick={() => handleQuitarComDistribuicao(r)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                              >
                                Quitar & Distribuir
                              </button>
                            )}
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

      {/* 2. DRE DEMONSTRATIVO DE RESULTADOS */}
      {subTab === 'dre' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Demonstrativo Contábil Oficial
                </span>
                <h2 className="text-lg font-black text-slate-900">
                  DRE — Demonstrativo do Resultado do Exercício
                </h2>
                <p className="text-xs text-slate-500">
                  Competência: {filtroPeriodo === '2026-03' ? 'Março de 2026' : filtroPeriodo === '2026-02' ? 'Fevereiro de 2026' : 'Ano de 2026'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filtroPeriodo}
                  onChange={(e) => setFiltroPeriodo(e.target.value as any)}
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 outline-none"
                >
                  <option value="2026-03">Março/2026 (Atual)</option>
                  <option value="2026-02">Fevereiro/2026</option>
                  <option value="2026">Exercício 2026 Completo</option>
                </select>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Imprimir DRE</span>
                </button>
              </div>
            </div>

            {/* DRE Structure */}
            <div className="mt-6 font-mono text-xs sm:text-sm divide-y divide-slate-100">
              {/* (+) Receita Bruta */}
              <div className="py-3 flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center gap-2">
                  <span className="text-emerald-600 text-base">(+)</span>
                  RECEITA OPERACIONAL BRUTA
                </span>
                <span className="text-emerald-700">
                  {dreData.receitaBruta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              {/* (-) Deduções & Impostos */}
              <div className="py-2.5 pl-6 flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="text-rose-600">(-)</span>
                  Deduções da Receita Bruta (Simples Nacional / ISS)
                </span>
                <span className="text-rose-700 font-semibold">
                  - {dreData.impostos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              {/* (=) Receita Líquida */}
              <div className="py-3 flex items-center justify-between font-bold text-slate-900 bg-slate-50/70 px-2 rounded-lg">
                <span className="flex items-center gap-2">
                  <span className="text-[#2E3192] text-base">(=)</span>
                  RECEITA OPERACIONAL LÍQUIDA
                </span>
                <span className="text-[#2E3192]">
                  {dreData.receitaLiquida.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              {/* (-) Custos Notariais e Técnicos */}
              <div className="py-2.5 pl-6 flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="text-rose-600">(-)</span>
                  Custos dos Serviços (Custas Cartorárias, RI & Topografia)
                </span>
                <span className="text-rose-700 font-semibold">
                  - {dreData.custosServicos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              {/* (=) Lucro Bruto */}
              <div className="py-3 flex items-center justify-between font-bold text-slate-900 bg-slate-50/70 px-2 rounded-lg">
                <span className="flex items-center gap-2">
                  <span className="text-indigo-600 text-base">(=)</span>
                  LUCRO BRUTO OPERACIONAL
                </span>
                <span className="text-indigo-900">
                  {dreData.lucroBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              {/* (-) Despesas Operacionais */}
              <div className="py-2.5 pl-6 flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="text-rose-600">(-)</span>
                  Despesas Operacionais (Comissões B2B, Marketing, TI & ADM)
                </span>
                <span className="text-rose-700 font-semibold">
                  - {dreData.despesasOperacionais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              {/* (=) Resultado Líquido / Lucro */}
              <div className="py-4 flex items-center justify-between font-black text-sm sm:text-base bg-emerald-50 text-emerald-950 px-3 rounded-xl border border-emerald-200">
                <span className="flex items-center gap-2">
                  <span className="text-emerald-700 text-lg">(=)</span>
                  RESULTADO LÍQUIDO DO EXERCÍCIO (LUCRO A DISTRIBUIR)
                </span>
                <span className="text-emerald-800">
                  {dreData.lucroLiquidoExercicio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              {/* Breakdown de Distribuição */}
              <div className="pt-4 space-y-2">
                <div className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                  Distribuição Automática de Resultados aos Sócios & Empresa:
                </div>

                <div className="py-2 pl-4 flex items-center justify-between text-slate-700 bg-indigo-50/40 rounded px-2">
                  <span className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#2E3192]" />
                    Retido Caixa Brasil Legal ({configSplit.percentual_empresa_caixa}%)
                  </span>
                  <strong className="text-[#2E3192]">
                    {((dreData.lucroLiquidoExercicio * configSplit.percentual_empresa_caixa) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </strong>
                </div>

                {configSplit.socios.map(s => (
                  <div key={s.id} className="py-2 pl-4 flex items-center justify-between text-slate-700 bg-purple-50/40 rounded px-2">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      Repasse Sócio: {s.nome} ({s.percentual}%)
                    </span>
                    <strong className="text-purple-900">
                      {((dreData.lucroLiquidoExercicio * s.percentual) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. EXTRATO ANALÍTICO DE REPASSE AOS SÓCIOS */}
      {subTab === 'extrato_socios' && (
        <div className="space-y-6">
          {/* Header Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Empresa */}
            <div className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                  Reserva Corporativa ({configSplit.percentual_empresa_caixa}%)
                </span>
                <Building className="w-5 h-5 text-[#2E3192]" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mt-2">
                Caixa Brasil Legal
              </h3>
              <p className="text-xs text-slate-500">
                Fundo de reserva e reinvestimento da sociedade
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Acumulado</span>
                <span className="text-xl font-black text-[#2E3192]">
                  {dreData.totalDistribuidoEmpresa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            {/* Sócios */}
            {configSplit.socios.map((s) => {
              const repasseSocio = dreData.repassesPorSocio[s.nome] || 0;
              return (
                <div key={s.id} className="bg-white rounded-2xl p-5 border border-purple-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 bg-purple-50 px-2 py-0.5 rounded">
                      Cota Sócio ({s.percentual}%)
                    </span>
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-2">
                    {s.nome}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    Chave Pix: <strong>{s.chave_pix}</strong>
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Repasse do Período</span>
                    <span className="text-xl font-black text-purple-950">
                      {repasseSocio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Receipts Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#2E3192]" />
              Extrato Detalhado de Honorários e Divisão Efetivada
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Honorário / Procedimento</th>
                    <th className="py-3 px-4">Valor Total</th>
                    <th className="py-3 px-4">Caixa Empresa ({configSplit.percentual_empresa_caixa}%)</th>
                    {configSplit.socios.map(s => (
                      <th key={s.id} className="py-3 px-4">{s.nome.split(' ')[0]} ({s.percentual}%)</th>
                    ))}
                    <th className="py-3 px-4 text-right">Status Repasse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {records
                    .filter(r => r.natureza === 'RECEITA' && r.status === 'pago')
                    .map((r) => {
                      const dist = r.distribuicao_resultado;
                      const empresaVal = dist?.empresa_valor ?? ((r.valor * configSplit.percentual_empresa_caixa) / 100);

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {new Date(r.data).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{r.descricao}</div>
                            {r.favorecido && <div className="text-[11px] text-slate-500">{r.favorecido}</div>}
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-800">
                            {r.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#2E3192]">
                            {empresaVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          {configSplit.socios.map(s => {
                            const socioDist = dist?.socios?.find(item => item.socio_id === s.id);
                            const val = socioDist?.valor ?? ((r.valor * s.percentual) / 100);
                            return (
                              <td key={s.id} className="py-3 px-4 font-semibold text-purple-900">
                                {val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </td>
                            );
                          })}
                          <td className="py-3 px-4 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              ✓ Liquidado
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. CONFIGURAÇÃO DE REGRAS DE DISTRIBUIÇÃO */}
      {subTab === 'config_split' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 max-w-4xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Percent className="w-5 h-5 text-[#2E3192]" />
                Regras de Porcentagens de Distribuição de Resultados
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Defina a porcentagem exata que será retida para a empresa e distribuída aos sócios em cada honorário recebido. A soma deve ser sempre 100%.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSplitConfig} className="mt-6 space-y-6">
            {splitFeedback && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                splitFeedback.includes('sucesso')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {splitFeedback}
              </div>
            )}

            {/* Porcentagem da Empresa */}
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#2E3192]" />
                  <span className="text-xs font-bold text-slate-900 uppercase">
                    Porcentagem da Empresa (Caixa PJ / Reserva)
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={splitForm.percentual_empresa_caixa}
                    onChange={(e) => setSplitForm(prev => ({
                      ...prev,
                      percentual_empresa_caixa: parseFloat(e.target.value) || 0
                    }))}
                    className="w-20 px-3 py-1.5 text-sm font-extrabold text-center bg-white border border-indigo-300 rounded-lg text-[#2E3192]"
                  />
                  <span className="text-xs font-bold text-slate-600">%</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Valor destinado à conta corrente PJ da Brasil Legal para custeio de infraestrutura, salários e reserva operacional.
              </p>
            </div>

            {/* Porcentagem dos Sócios */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Porcentagem Devida aos Sócios
                </h4>
              </div>

              {splitForm.socios.map((socio, idx) => (
                <div key={socio.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        Nome do Sócio
                      </label>
                      <input
                        type="text"
                        value={socio.nome}
                        onChange={(e) => {
                          const updated = [...splitForm.socios];
                          updated[idx].nome = e.target.value;
                          setSplitForm(prev => ({ ...prev, socios: updated }));
                        }}
                        className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        Chave Pix de Repasse
                      </label>
                      <input
                        type="text"
                        value={socio.chave_pix}
                        onChange={(e) => {
                          const updated = [...splitForm.socios];
                          updated[idx].chave_pix = e.target.value;
                          setSplitForm(prev => ({ ...prev, socios: updated }));
                        }}
                        className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white"
                        placeholder="CPF, e-mail ou aleatória"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        Porcentagem (%)
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={socio.percentual}
                          onChange={(e) => {
                            const updated = [...splitForm.socios];
                            updated[idx].percentual = parseFloat(e.target.value) || 0;
                            setSplitForm(prev => ({ ...prev, socios: updated }));
                          }}
                          className="w-20 px-3 py-1.5 text-xs font-extrabold text-center border border-slate-300 rounded-lg bg-white text-purple-900"
                        />
                        <span className="text-xs font-bold text-slate-600">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Balance Check */}
            <div className="flex items-center justify-between p-3.5 bg-slate-100 rounded-xl">
              <span className="text-xs font-bold text-slate-700">Soma Total das Porcentagens:</span>
              <span className={`text-sm font-black ${
                Math.abs(splitForm.percentual_empresa_caixa + splitForm.socios.reduce((acc, s) => acc + s.percentual, 0) - 100) < 0.01
                  ? 'text-emerald-700'
                  : 'text-rose-700'
              }`}>
                {(splitForm.percentual_empresa_caixa + splitForm.socios.reduce((acc, s) => acc + s.percentual, 0)).toFixed(1)}% / 100%
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSavingSplit}
                className="px-5 py-2.5 bg-[#2E3192] hover:bg-[#1E216B] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-[#F2EC00]" />
                <span>{isSavingSplit ? 'Salvando...' : 'Salvar Regras de Porcentagens'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Novo Lançamento */}
      {showNovoLancamentoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#2E3192] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#F2EC00]" />
                <h3 className="text-base font-bold">Novo Lançamento Financeiro</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNovoLancamentoModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarLancamento} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Natureza *
                  </label>
                  <select
                    value={novoNatureza}
                    onChange={(e) => setNovoNatureza(e.target.value as NaturezaFinanceira)}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white outline-none"
                  >
                    <option value="RECEITA">Receita (Entrada)</option>
                    <option value="DESPESA">Despesa (Saída)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={novoCategoria}
                    onChange={(e) => setNovoCategoria(e.target.value as CategoriaFinanceira)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white outline-none"
                  >
                    {novoNatureza === 'RECEITA' ? (
                      <>
                        <option value="Honorários Advocatícios">Honorários Advocatícios</option>
                        <option value="Consultoria Registral">Consultoria Registral</option>
                        <option value="Taxa de Diligência Notarial">Taxa de Diligência Notarial</option>
                        <option value="Outras Receitas">Outras Receitas</option>
                      </>
                    ) : (
                      <>
                        <option value="Custas e Emolumentos">Custas e Emolumentos Cartorários</option>
                        <option value="Topografia e Engenharia">Topografia e Engenharia</option>
                        <option value="Comissão Parceiro B2B">Comissão Parceiro B2B</option>
                        <option value="Marketing e Tráfego">Marketing e Tráfego</option>
                        <option value="Software e TI">Software e TI</option>
                        <option value="Impostos e Tributos">Impostos e Tributos (Simples)</option>
                        <option value="Despesas Administrativas">Despesas Administrativas</option>
                        <option value="Outras Despesas">Outras Despesas</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição do Lançamento *
                </label>
                <input
                  type="text"
                  required
                  value={novoDescricao}
                  onChange={(e) => setNovoDescricao(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none"
                  placeholder="Ex: Honorários Usucapião - Caso Carlos Mendes"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg outline-none text-emerald-800"
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={novoData}
                    onChange={(e) => setNovoData(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cliente / Favorecido
                  </label>
                  <input
                    type="text"
                    value={novoFavorecido}
                    onChange={(e) => setNovoFavorecido(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none"
                    placeholder="Nome do cliente ou fornecedor"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status de Quitação
                  </label>
                  <select
                    value={novoStatus}
                    onChange={(e) => setNovoStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white outline-none"
                  >
                    <option value="pago">Quitado / Pago</option>
                    <option value="pendente">Pendente / A Vencer</option>
                  </select>
                </div>
              </div>

              {novoNatureza === 'RECEITA' && novoStatus === 'pago' && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-[11px] text-[#2E3192] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2E3192] shrink-0" />
                  <span>
                    Ao salvar como quitado, o sistema calculará automaticamente o rateio de <strong>{configSplit.percentual_empresa_caixa}%</strong> para a empresa e repassará aos sócios.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNovoLancamentoModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRecord}
                  className="px-5 py-2.5 bg-[#2E3192] hover:bg-[#1E216B] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#F2EC00]" />
                  <span>{isSubmittingRecord ? 'Salvando...' : 'Salvar Lançamento'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
