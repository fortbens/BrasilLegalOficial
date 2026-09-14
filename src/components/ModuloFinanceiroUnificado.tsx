import React, { useState } from 'react';
import { 
  Deal, 
  Contact, 
  CobrancaBoleto, 
  FintechConfig, 
  ConfigSplitBancario, 
  RegistroSplitExecutado, 
  AppSettings,
  StatusCobranca
} from '../types';
import { PainelFinanceiro } from './PainelFinanceiro';
import { ModuloCobrancasBancarias } from './ModuloCobrancasBancarias';
import { ModuloSplitsBancarios } from './ModuloSplitsBancarios';
import { 
  DollarSign, 
  CreditCard, 
  PieChart, 
  Wallet, 
  CheckCircle2, 
  TrendingUp,
  Receipt,
  ArrowUpRight
} from 'lucide-react';

interface ModuloFinanceiroUnificadoProps {
  deals: Deal[];
  contacts: Contact[];
  onApproveDeal?: (dealId: string) => void;
  onPayCommission?: (dealId: string) => void;
  onCalculateB2bCommission?: (dealId: string, parceiroId: string, honorarios: number, percentual: number) => void;
  // Cobranças & Boletos
  cobrancas: CobrancaBoleto[];
  fintechs: FintechConfig[];
  onEmitirBoleto: (boletoData: Partial<CobrancaBoleto>) => Promise<void>;
  onUpdateBoletoStatus: (id: string, status: StatusCobranca) => Promise<void>;
  onUpdateFintech: (fintech: FintechConfig) => Promise<void>;
  // Split Bancário
  configSplit: ConfigSplitBancario;
  registrosSplits: RegistroSplitExecutado[];
  onSaveConfigSplit: (config: ConfigSplitBancario) => Promise<void> | void;
  onLiquidarCobrancaComSplit: (cobrancaId: string, observacao?: string) => Promise<void> | void;
  appSettings?: AppSettings;
  defaultSubTab?: 'comissoes' | 'cobrancas' | 'splits';
}

export const ModuloFinanceiroUnificado: React.FC<ModuloFinanceiroUnificadoProps> = ({
  deals,
  contacts,
  onApproveDeal,
  onPayCommission,
  onCalculateB2bCommission,
  cobrancas,
  fintechs,
  onEmitirBoleto,
  onUpdateBoletoStatus,
  onUpdateFintech,
  configSplit,
  registrosSplits,
  onSaveConfigSplit,
  onLiquidarCobrancaComSplit,
  appSettings,
  defaultSubTab = 'comissoes'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'comissoes' | 'cobrancas' | 'splits'>(defaultSubTab);

  // Quick aggregate metrics
  const totalHonorariosPrevistos = deals.reduce((acc, d) => acc + (d.valor_honorarios || d.valor_honorarios_liquido || 0), 0);
  const totalBoletosEmitidos = cobrancas.reduce((acc, c) => acc + (c.valor || 0), 0);
  const totalSplitsExecutados = registrosSplits.reduce((acc, r) => acc + (r.valor_total || r.valor_total_pago || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header Card with Financial Sub-Navigation */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Wallet className="w-3 h-3 text-emerald-600" />
                Módulo Unificado
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Gestão Financeira Integral
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#2E3192]" />
              Financeiro, Cobranças & Split Bancário
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Central única de controle de honorários, homologação de comissões B2B, emissão de boletos bancários com Pix e divisão automatizada de receitas entre sócios.
            </p>
          </div>

          {/* Quick Financial KPIs */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 shrink-0">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Honorários Contratados</span>
              <span className="text-xs sm:text-sm font-extrabold text-[#2E3192]">
                {totalHonorariosPrevistos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl px-3 py-2 shrink-0">
              <span className="text-[10px] text-emerald-800 uppercase font-bold block">Boletos & Cobranças</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-900">
                {totalBoletosEmitidos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl px-3 py-2 shrink-0">
              <span className="text-[10px] text-indigo-800 uppercase font-bold block">Splits Liquidados</span>
              <span className="text-xs sm:text-sm font-extrabold text-indigo-900">
                {totalSplitsExecutados.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Buttons */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('comissoes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'comissoes'
                ? 'bg-white text-[#2E3192] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-[#2E3192]" />
            <span>Financeiro & Comissões</span>
            <span className="text-[10px] bg-indigo-50 text-[#2E3192] px-1.5 py-0.5 rounded font-bold">
              {deals.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('cobrancas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'cobrancas'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Cobrança & Boletos</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              {cobrancas.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('splits')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'splits'
                ? 'bg-white text-purple-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-4 h-4 text-purple-600" />
            <span>Split Bancário & Sócios</span>
            <span className="text-[10px] bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded font-bold">
              {configSplit.socios.length} Sócios
            </span>
          </button>
        </div>
      </div>

      {/* Render Active Sub-View */}
      {activeSubTab === 'comissoes' && (
        <PainelFinanceiro
          deals={deals}
          contacts={contacts}
          onApproveDeal={onApproveDeal}
          onPayCommission={onPayCommission}
          onCalculateB2bCommission={onCalculateB2bCommission}
        />
      )}

      {activeSubTab === 'cobrancas' && (
        <ModuloCobrancasBancarias
          cobrancas={cobrancas}
          fintechs={fintechs}
          contacts={contacts}
          deals={deals}
          onEmitirBoleto={onEmitirBoleto}
          onUpdateBoletoStatus={onUpdateBoletoStatus}
          onUpdateFintech={onUpdateFintech}
        />
      )}

      {activeSubTab === 'splits' && (
        <ModuloSplitsBancarios
          config={configSplit}
          registros={registrosSplits}
          cobrancas={cobrancas}
          onSaveConfig={onSaveConfigSplit}
          onLiquidarCobrancaComSplit={onLiquidarCobrancaComSplit}
          appSettings={appSettings}
        />
      )}
    </div>
  );
};
