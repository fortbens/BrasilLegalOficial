import React, { useState } from 'react';
import { Deal, Contact, FinancialRecord, ConfigSplitBancario } from '../types';
import { initialConfigSplitBancario } from '../mockData';
import { ModuloGestaoFinanceiraDRE } from './ModuloGestaoFinanceiraDRE';
import { 
  DollarSign, 
  Award, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Calculator, 
  ShieldCheck, 
  FileCheck, 
  Building,
  AlertCircle,
  BarChart3,
  PieChart
} from 'lucide-react';

interface PainelFinanceiroProps {
  deals?: Deal[];
  contacts?: Contact[];
  onApproveDeal?: (dealId: string) => void;
  onPayCommission?: (dealId: string) => void;
  onCalculateB2bCommission?: (dealId: string, parceiroId: string, honorarios: number, percentual: number) => void;
  records?: FinancialRecord[];
  configSplit?: ConfigSplitBancario;
  onSaveRecord?: (record: FinancialRecord) => Promise<void> | void;
  onUpdateRecord?: (id: string, updates: Partial<FinancialRecord>) => Promise<void> | void;
  onSaveConfigSplit?: (config: ConfigSplitBancario) => Promise<void> | void;
}

export const PainelFinanceiro: React.FC<PainelFinanceiroProps> = ({
  deals = [],
  contacts = [],
  onApproveDeal = (_id?: string) => {},
  onPayCommission = (_id?: string) => {},
  onCalculateB2bCommission = (_dealId?: string, _parceiroId?: string, _honorarios?: number, _percentual?: number) => {},
  records = [],
  configSplit = initialConfigSplitBancario,
  onSaveRecord,
  onUpdateRecord,
  onSaveConfigSplit
}) => {
  const [activeTab, setActiveTab] = useState<'dre_fluxo' | 'comissoes_b2b'>('dre_fluxo');
  const [calcModalOpen, setCalcModalOpen] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState(deals?.[0]?.id || '');
  const [parceiroId, setParceiroId] = useState('PARC-B2B-88');
  const [honorariosInput, setHonorariosInput] = useState('20000');
  const [percentualInput, setPercentualInput] = useState('5.0');

  // Aggregated metrics with defensive chaining
  const totalHonorarios = (deals || []).reduce((acc, d) => acc + (d?.valor_honorarios_liquido || 0), 0);
  const totalComissoes = (deals || []).reduce((acc, d) => acc + (d?.comissao_b2b_valor || 0), 0);
  const comissoesHomologadas = (deals || [])
    .filter(d => d?.homologado_diretoria)
    .reduce((acc, d) => acc + (d?.comissao_b2b_valor || 0), 0);
  const comissoesPagas = (deals || [])
    .filter(d => d?.comissao_paga)
    .reduce((acc, d) => acc + (d?.comissao_b2b_valor || 0), 0);

  const handleRunCommissionCalculation = (e: React.FormEvent) => {
    e.preventDefault();
    const honorarios = parseFloat(honorariosInput) || 0;
    const percent = Math.min(parseFloat(percentualInput) || 5.0, 5.0);
    onCalculateB2bCommission(selectedDealId, parceiroId, honorarios, percent);
    setCalcModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Abas Superiores do Módulo Financeiro */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('dre_fluxo')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'dre_fluxo'
                ? 'bg-white text-[#2E3192] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#2E3192]" />
            <span>DRE, Fluxo de Caixa & Distribuição de Lucros</span>
          </button>

          <button
            onClick={() => setActiveTab('comissoes_b2b')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'comissoes_b2b'
                ? 'bg-white text-[#2E3192] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>Homologação & Comissões Indique e Ganhe B2B</span>
            {deals.filter(d => !d.homologado_diretoria).length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                {deals.filter(d => !d.homologado_diretoria).length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'comissoes_b2b' && (
          <button
            onClick={() => setCalcModalOpen(true)}
            className="px-3.5 py-2 bg-[#2E3192] hover:bg-[#1E216B] text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5 border-b-2 border-[#F2EC00]"
          >
            <Calculator className="w-4 h-4 text-[#F2EC00]" />
            Lançar Comissão B2B
          </button>
        )}
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL DA ABA ATIVA */}
      {activeTab === 'dre_fluxo' ? (
        <ModuloGestaoFinanceiraDRE
          records={records || []}
          configSplit={configSplit || initialConfigSplitBancario}
          onSaveRecord={onSaveRecord || (() => {})}
          onUpdateRecord={onUpdateRecord || (() => {})}
          onSaveConfigSplit={onSaveConfigSplit || (() => {})}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Banner Comissões */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#2E3192] text-white text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Módulo Financeiro & Controladoria
                </span>
                <span className="bg-amber-50 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  Programa Indique e Ganhe B2B: Até 5% de Comissão
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                Homologação de Fechamentos & Liquidação de Comissões B2B
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Acesso exclusivo da Diretoria: auditoria de honorários líquidos de regularização, liberação e repasse de comissões.
              </p>
            </div>
          </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Honorários Contratados</span>
            <DollarSign className="w-4 h-4 text-[#2E3192]" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">
            R$ {totalHonorarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {deals.length} processos em carteira
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Comissões B2B Totais</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-[#2E3192] mt-2">
            R$ {totalComissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Média de 5% sobre honorários líquidos
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Homologadas pela Diretoria</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-2">
            R$ {comissoesHomologadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Liberadas para pagamento
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Comissões Já Liquidadas</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-700 mt-2">
            R$ {comissoesPagas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Repassadas aos parceiros
          </div>
        </div>
      </div>

      {/* Deals & Commissions Ledger Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#2E3192]" />
              Extrato Geral de Fechamentos & Programa Indique e Ganhe
            </h3>
            <p className="text-xs text-slate-500">
              Controle de honorários, homologação da Diretoria e pagamento ao corretor/indicador parceiro.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Processo / Objeto</th>
                <th className="px-4 py-3">Cliente Requerente</th>
                <th className="px-4 py-3">Honorários Líquidos</th>
                <th className="px-4 py-3">Parceiro B2B</th>
                <th className="px-4 py-3">Comissão (5%)</th>
                <th className="px-4 py-3">Homologação Diretoria</th>
                <th className="px-4 py-3">Status Pagamento</th>
                <th className="px-4 py-3 text-right">Ações da Diretoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deals.map(deal => {
                const contact = contacts.find(c => c.id === deal.contact_id);

                return (
                  <tr key={deal.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 leading-tight">{deal.titulo}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{deal.cartorio_comarca}</div>
                      <span className="inline-block text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded mt-1">
                        {deal.tipo_procedimento}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">
                        {contact ? contact.nome_completo : 'Cliente Geral'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {contact ? contact.cpf_cnpj : ''}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      R$ {deal.valor_honorarios_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="px-4 py-3.5">
                      {deal.parceiro_id ? (
                        <div className="flex items-center gap-1.5 text-amber-800 font-semibold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          <span>{deal.parceiro_id}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Venda Direta</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {deal.comissao_b2b_valor > 0 ? (
                        <div>
                          <div className="font-bold text-[#2E3192]">
                            R$ {deal.comissao_b2b_valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Taxa: {deal.comissao_b2b_percentual}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {deal.homologado_diretoria ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Homologado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pendente Diretoria
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {deal.comissao_paga ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          Pago / Liquidado
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-500">
                          {deal.homologado_diretoria ? 'Aguardando TED/PIX' : 'Em aprovação'}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right space-y-1">
                      {!deal.homologado_diretoria && (
                        <button
                          onClick={() => onApproveDeal(deal.id)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold transition-colors shadow-xs"
                        >
                          Homologar
                        </button>
                      )}

                      {deal.homologado_diretoria && !deal.comissao_paga && deal.comissao_b2b_valor > 0 && (
                        <button
                          onClick={() => onPayCommission(deal.id)}
                          className="px-2.5 py-1 bg-[#2E3192] hover:bg-[#1E216B] text-white rounded text-[11px] font-bold transition-colors shadow-xs"
                        >
                          Liquidar Comissão
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to simulate/launch B2B commission */}
      {calcModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#2E3192] p-4 text-white flex items-center justify-between border-b-2 border-[#F2EC00]">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#F2EC00]" />
                <div>
                  <h3 className="text-sm font-bold">Calcular Comissão B2B (`calcular_comissao_b2b`)</h3>
                  <p className="text-[11px] text-white/80">Regra de Negócio: Até 5% sobre Honorários Líquidos</p>
                </div>
              </div>
              <button
                onClick={() => setCalcModalOpen(false)}
                className="text-white hover:text-white/80 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRunCommissionCalculation} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vincular ao Processo / Negócio (deal_id)
                </label>
                <select
                  value={selectedDealId}
                  onChange={e => setSelectedDealId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
                >
                  {deals.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.titulo} (R$ {d.valor_honorarios_liquido.toLocaleString('pt-BR')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Código do Parceiro Indicador (parceiro_id)
                </label>
                <input
                  type="text"
                  required
                  value={parceiroId}
                  onChange={e => setParceiroId(e.target.value)}
                  placeholder="Ex: PARC-B2B-88"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Honorários Líquidos (R$)
                  </label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={honorariosInput}
                    onChange={e => setHonorariosInput(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Percentual (Máx 5%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    max="5.0"
                    min="0.5"
                    required
                    value={percentualInput}
                    onChange={e => setPercentualInput(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
                  />
                </div>
              </div>

              {/* Preview calculation */}
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  Comissão Calculada a Lançar:
                </div>
                <div className="text-base font-extrabold text-[#2E3192] mt-0.5">
                  R$ {(((parseFloat(honorariosInput) || 0) * Math.min(parseFloat(percentualInput) || 5, 5)) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="pt-2 border-t flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCalcModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#2E3192] hover:bg-[#1E216B] text-white rounded-lg shadow-md border-b-2 border-[#F2EC00] flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#F2EC00]" />
                  Lançar no Financeiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};
