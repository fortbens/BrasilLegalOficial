import React, { useState } from 'react';
import { Contact, Deal, Documento, CobrancaBoleto, QualificacaoSdr } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  Users, 
  FileText, 
  Calendar, 
  Download, 
  Printer, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  Percent,
  ArrowUpRight,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';

interface ModuloRelatoriosProps {
  contacts: Contact[];
  deals: Deal[];
  documents: Documento[];
  cobrancas?: CobrancaBoleto[];
}

export const ModuloRelatorios: React.FC<ModuloRelatoriosProps> = ({
  contacts,
  deals,
  documents,
  cobrancas = []
}) => {
  const [periodFilter, setPeriodFilter] = useState<'7d' | '30d' | '90d' | 'ano' | 'todos'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<'geral' | 'comercial' | 'custodia' | 'financeiro'>('geral');

  // Calculate funnel numbers across requested pipeline stages:
  // Lead -> Qualificado -> Oportunidade -> Entrevista -> Proposta -> Ganho -> Perdido
  const stageCounts: Record<string, number> = {
    Lead: contacts.filter(c => ['Lead', 'Novo'].includes(c.qualificacao_sdr || 'Lead')).length,
    Qualificado: contacts.filter(c => ['Qualificado', 'Em Triagem'].includes(c.qualificacao_sdr || '')).length,
    Oportunidade: contacts.filter(c => ['Oportunidade', 'MQL (Qualificado)'].includes(c.qualificacao_sdr || '')).length,
    Entrevista: contacts.filter(c => c.qualificacao_sdr === 'Entrevista').length,
    Proposta: contacts.filter(c => c.qualificacao_sdr === 'Proposta').length,
    Ganho: contacts.filter(c => c.qualificacao_sdr === 'Ganho').length,
    Perdido: contacts.filter(c => ['Perdido', 'Disqualificado'].includes(c.qualificacao_sdr || '')).length
  };

  const totalContacts = contacts.length || 1;
  const totalGanhos = stageCounts.Ganho;
  const taxaConversaoGlobal = ((totalGanhos / totalContacts) * 100).toFixed(1);

  // SLA Metrics
  const leadsWithSla = contacts.filter(c => (c.tempo_primeira_resposta_minutos ?? 0) > 0);
  const leadsWithinSla = contacts.filter(c => (c.tempo_primeira_resposta_minutos ?? 0) > 0 && (c.tempo_primeira_resposta_minutos ?? 0) <= 4);
  const slaCompliancePercent = leadsWithSla.length > 0
    ? Math.round((leadsWithinSla.length / leadsWithSla.length) * 100)
    : 100;
  const avgSlaMinutes = leadsWithSla.length > 0
    ? (leadsWithSla.reduce((acc, c) => acc + (c.tempo_primeira_resposta_minutos ?? 0), 0) / leadsWithSla.length).toFixed(1)
    : '2.4';

  // Custody Document Metrics
  const totalDocs = documents.length;
  const approvedDocs = documents.filter(d => d.status_validacao === 'Aprovado').length;
  const pendingDocs = documents.filter(d => d.status_validacao === 'Pendente').length;
  const rejectedDocs = documents.filter(d => d.status_validacao === 'Rejeitado_Solicitar_Reenvio').length;
  const docApprovalRate = totalDocs > 0 ? Math.round((approvedDocs / totalDocs) * 100) : 0;

  // Financial & Deals Metrics
  const totalHonorariosFechados = deals
    .filter(d => d.homologado_diretoria || d.status === 'Regularizado / Concluído')
    .reduce((acc, d) => acc + (d.valor_honorarios_liquido || 0), 0);

  const totalPipelineEstimado = deals
    .reduce((acc, d) => acc + (d.valor_honorarios_liquido || 0), 0);

  const totalComissoesB2B = deals
    .filter(d => d.parceiro_id)
    .reduce((acc, d) => acc + (d.comissao_b2b_valor || 0), 0);

  // Cobranças Metrics
  const totalCobrado = cobrancas.reduce((acc, c) => acc + c.valor, 0);
  const totalLiquidado = cobrancas
    .filter(c => c.status === 'Pago')
    .reduce((acc, c) => acc + c.valor, 0);
  const totalPendente = cobrancas
    .filter(c => c.status === 'Pendente')
    .reduce((acc, c) => acc + c.valor, 0);
  const taxaLiquidacao = totalCobrado > 0 ? Math.round((totalLiquidado / totalCobrado) * 100) : 0;

  // By Origem
  const origemMap: Record<string, number> = {};
  contacts.forEach(c => {
    const o = c.origem_lead || 'Outros';
    origemMap[o] = (origemMap[o] || 0) + 1;
  });

  // By Procedimento
  const procMap: Record<string, number> = {};
  contacts.forEach(c => {
    const p = c.servico_pretendido || 'Usucapião Extrajudicial';
    procMap[p] = (procMap[p] || 0) + 1;
  });

  const handleExportCSV = () => {
    const headers = 'ID,Nome,CPF/CNPJ,Telefone,Cidade,UF,Origem,Etapa,Tempo_SLA_Min,Servico\n';
    const rows = contacts.map(c => 
      `"${c.id}","${c.nome_completo}","${c.cpf_cnpj}","${c.telefone_whatsapp}","${c.endereco.cidade}","${c.endereco.uf}","${c.origem_lead || ''}","${c.qualificacao_sdr || ''}",${c.tempo_primeira_resposta_minutos || 0},"${c.servico_pretendido || ''}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_brasil_legal_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="bg-[#2E3192] text-white text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Relatórios & BI Executivo
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              Atualização em Tempo Real
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Painel Analítico de Vendas, Custódia & Financeiro
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de conversão do funil comercial, conformidade de SLA &lt; 4 min, validação de títulos Prov. 65 e liquidação bancária.
          </p>
        </div>

        {/* Action Controls & Export */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            {(['7d', '30d', '90d', 'ano', 'todos'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriodFilter(p)}
                className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                  periodFilter === p 
                    ? 'bg-white text-[#2E3192] shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p === '7d' ? '7 dias' : p === '30d' ? '30 dias' : p === '90d' ? '3 meses' : p === 'ano' ? 'Ano 2026' : 'Todos'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Exportar dados brutos em planilha CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            CSV
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-[#2E3192] hover:bg-[#1E216B] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Imprimir relatório executivo"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir Relatório
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Leads & Conversão */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Leads & Conversão</span>
            <Users className="w-4 h-4 text-[#2E3192]" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">{contacts.length}</div>
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {taxaConversaoGlobal}% Ganho
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            {stageCounts.Ganho} contratos fechados de {contacts.length} leads totais.
          </p>
        </div>

        {/* Card 2: SLA 1º Contato */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">SLA Comercial (&lt; 4 min)</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">{slaCompliancePercent}%</div>
            <div className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              Méd: {avgSlaMinutes} min
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            {leadsWithinSla.length} de {leadsWithSla.length || 1} atendimentos no prazo legal.
          </p>
        </div>

        {/* Card 3: Custódia Documental Prov. 65 */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Custódia Registral</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">{totalDocs} docs</div>
            <div className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              {docApprovalRate}% Aprovados
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            {approvedDocs} validados • {pendingDocs} em análise • {rejectedDocs} correções.
          </p>
        </div>

        {/* Card 4: Faturamento & Comissões B2B */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Honorários & B2B</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-black text-[#2E3192]">
              R$ {(totalHonorariosFechados / 1000).toFixed(0)}k
            </div>
            <div className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              R$ {totalComissoesB2B.toLocaleString('pt-BR')} B2B
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Pipeline estimado total: R$ {totalPipelineEstimado.toLocaleString('pt-BR')}.
          </p>
        </div>
      </div>

      {/* Visual Pipeline Funnel Progression (Lead -> Qualificado -> Oportunidade -> Entrevista -> Proposta -> Ganho -> Perdido) */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2E3192]" />
              Taxa de Conversão por Etapa do Funil Sequencial
            </h2>
            <p className="text-xs text-slate-500">
              Acompanhamento de volume e retenção através dos 7 estágios operacionais
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Total em Trânsito: {contacts.length} casos
          </span>
        </div>

        {/* Funnel Steps */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
          {[
            { id: 'Lead', label: '1. Lead', count: stageCounts.Lead, color: 'bg-blue-600', textCol: 'text-blue-700', bgCol: 'bg-blue-50' },
            { id: 'Qualificado', label: '2. Qualificado', count: stageCounts.Qualificado, color: 'bg-cyan-600', textCol: 'text-cyan-700', bgCol: 'bg-cyan-50' },
            { id: 'Oportunidade', label: '3. Oportunidade (Custódia)', count: stageCounts.Oportunidade, color: 'bg-indigo-600', textCol: 'text-indigo-700', bgCol: 'bg-indigo-50', highlight: true },
            { id: 'Entrevista', label: '4. Entrevista', count: stageCounts.Entrevista, color: 'bg-amber-600', textCol: 'text-amber-700', bgCol: 'bg-amber-50' },
            { id: 'Proposta', label: '5. Proposta', count: stageCounts.Proposta, color: 'bg-purple-600', textCol: 'text-purple-700', bgCol: 'bg-purple-50' },
            { id: 'Ganho', label: '6. Ganho', count: stageCounts.Ganho, color: 'bg-emerald-600', textCol: 'text-emerald-700', bgCol: 'bg-emerald-50' },
            { id: 'Perdido', label: '7. Perdido', count: stageCounts.Perdido, color: 'bg-slate-500', textCol: 'text-slate-600', bgCol: 'bg-slate-100' }
          ].map((stage, idx) => {
            const pct = Math.round((stage.count / totalContacts) * 100);

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  stage.highlight
                    ? 'border-indigo-400 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-200'
                    : 'border-slate-200 bg-slate-50/70'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-700 truncate">{stage.label}</span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">{pct}%</span>
                  </div>
                  <div className="text-xl font-black text-slate-900 my-1">{stage.count}</div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stage.color}`}
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>

                {stage.highlight && (
                  <div className="mt-2 pt-2 border-t border-indigo-200 text-[10px] font-bold text-indigo-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-600 shrink-0" />
                    Custódia Docs
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Analytics: Origens de Tráfego & Procedimentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Origens de Captação */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2E3192]" />
              Origens de Captação & Canais B2B
            </h3>
            <span className="text-xs text-slate-500 font-semibold">{Object.keys(origemMap).length} Canais</span>
          </div>

          <div className="space-y-3">
            {Object.entries(origemMap).map(([origem, count]) => {
              const pct = Math.round((count / totalContacts) * 100);
              const isB2B = origem === 'Indique e Ganhe B2B';

              return (
                <div key={origem} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      {isB2B && <Award className="w-3.5 h-3.5 text-amber-500" />}
                      {origem}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isB2B ? 'bg-amber-500' : 'bg-[#2E3192]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tipos de Procedimentos Registrais */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Procedimentos Imobiliários Mais Demandados
            </h3>
            <span className="text-xs text-slate-500 font-semibold">{Object.keys(procMap).length} Serviços</span>
          </div>

          <div className="space-y-3">
            {Object.entries(procMap).map(([proc, count]) => {
              const pct = Math.round((count / totalContacts) * 100);

              return (
                <div key={proc} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[240px]">{proc}</span>
                    <span className="font-mono font-bold text-slate-900">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Financial & Boletos Summary in Reports */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Extrato Consolidado de Cobranças & Boletos Bancários
          </h3>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            {taxaLiquidacao}% de Liquidação Efetuada
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Emitido em Boletos</span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              R$ {totalCobrado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-500">{cobrancas.length} boletos registrados</span>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Total Liquidado (Caixa)</span>
            <span className="text-xl font-black text-emerald-800 mt-1 block">
              R$ {totalLiquidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-emerald-600">Disponível para custas e repasses</span>
          </div>

          <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Em Aberto / A Vencer</span>
            <span className="text-xl font-black text-amber-900 mt-1 block">
              R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-amber-700">Aguardando compensação</span>
          </div>
        </div>
      </div>
    </div>
  );
};
