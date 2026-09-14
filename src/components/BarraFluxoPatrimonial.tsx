import React from 'react';
import { Home, Compass, Building, Receipt, FileCheck2, Scale, ShieldCheck, ChevronRight } from 'lucide-react';

export const BarraFluxoPatrimonial: React.FC = () => {
  const etapas = [
    { nome: 'IMÓVEL', desc: 'Diagnóstico', icone: Home, cor: 'text-amber-400 bg-amber-400/10' },
    { nome: 'ENGENHARIA', desc: 'Topografia & RTK', icone: Compass, cor: 'text-blue-400 bg-blue-400/10' },
    { nome: 'PREFEITURA', desc: 'Habite-se & Anistia', icone: Building, cor: 'text-indigo-400 bg-indigo-400/10' },
    { nome: 'RECEITA', desc: 'CIB & INSS Obra', icone: Receipt, cor: 'text-emerald-400 bg-emerald-400/10' },
    { nome: 'CARTÓRIO', desc: 'Prov. 65 / CNJ', icone: FileCheck2, cor: 'text-violet-400 bg-violet-400/10' },
    { nome: 'JURÍDICO', desc: 'Advocacia Registral', icone: Scale, cor: 'text-cyan-400 bg-cyan-400/10' },
    { nome: 'PATRIMÔNIO', desc: '100% Legalizado', icone: ShieldCheck, cor: 'text-[#F2EC00] bg-[#F2EC00]/15' }
  ];

  return (
    <div className="w-full bg-[#14163E] border-y border-white/10 py-4 px-3 sm:px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-3">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#F2EC00]">
            Visão Integrada de Ponta a Ponta
          </span>
          <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
            O fluxo completo da regularização imobiliária sem burocracia
          </p>
        </div>

        {/* Desktop / Tablet Flow */}
        <div className="hidden md:flex items-center justify-between gap-1 overflow-x-auto pb-1">
          {etapas.map((etapa, idx) => {
            const Icon = etapa.icone;
            const isLast = idx === etapas.length - 1;

            return (
              <React.Fragment key={etapa.nome}>
                <div className="flex flex-col items-center text-center p-2 rounded-xl transition-all hover:bg-white/5 min-w-[100px] flex-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${etapa.cor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[11px] font-black tracking-wider ${isLast ? 'text-[#F2EC00]' : 'text-white'}`}>
                    {etapa.nome}
                  </span>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {etapa.desc}
                  </span>
                </div>
                {!isLast && (
                  <div className="text-slate-600 shrink-0 px-0.5">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile Compact Horizontal Scroll */}
        <div className="flex md:hidden items-center gap-2 overflow-x-auto no-scrollbar py-1 text-xs">
          {etapas.map((etapa, idx) => {
            const Icon = etapa.icone;
            const isLast = idx === etapas.length - 1;

            return (
              <div
                key={etapa.nome}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shrink-0 border ${
                  isLast
                    ? 'bg-[#F2EC00]/10 border-[#F2EC00]/30 text-[#F2EC00]'
                    : 'bg-white/5 border-white/10 text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="font-bold text-[11px]">{etapa.nome}</span>
                {idx < etapas.length - 1 && <span className="text-slate-500 text-[10px]">→</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
