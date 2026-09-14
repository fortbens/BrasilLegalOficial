import React from 'react';
import { CasoRealItem } from '../types';
import { CheckCircle2, TrendingUp, Clock, MapPin, Building2, Sparkles, ArrowRight } from 'lucide-react';

interface SecaoCasosReaisProps {
  casos?: CasoRealItem[];
}

export const SecaoCasosReais: React.FC<SecaoCasosReaisProps> = ({ casos }) => {
  const casosAtivos = (casos && casos.length > 0 ? casos : []).filter(c => c.ativo !== false);

  if (casosAtivos.length === 0) return null;

  return (
    <section id="casos-reais" className="py-20 px-4 sm:px-6 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[#2E3192] text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#2E3192]" />
            Resultados comprovados em cartório
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Casos reais de regularização
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Veja como destravamos situações complexas em cartórios e prefeituras da Grande São Paulo e interior com a nossa metodologia integrada.
          </p>
        </div>

        <div className="space-y-8">
          {casosAtivos.map((caso, idx) => (
            <div
              key={caso.id || `caso-${idx}`}
              className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-all"
            >
              {/* Header do Caso */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {caso.cidade && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3 text-[#2E3192]" />
                        {caso.cidade}
                      </span>
                    )}
                    {caso.cliente_ou_tipo && (
                      <span className="text-xs font-semibold text-slate-500">
                        {caso.cliente_ou_tipo}
                      </span>
                    )}
                    {caso.tempo_meses && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Prazo: {caso.tempo_meses}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                    {caso.titulo}
                  </h3>
                </div>

                {caso.valorizacao_estimada && (
                  <div className="shrink-0 bg-emerald-100 text-emerald-800 border border-emerald-300/80 px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 self-start sm:self-center shadow-2xs">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>{caso.valorizacao_estimada}</span>
                  </div>
                )}
              </div>

              {/* Estrutura de 4 Fases: PROBLEMA → DESAFIO → SOLUÇÃO → RESULTADO */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. PROBLEMA */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded block w-fit mb-2">
                    1. Problema
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {caso.problema}
                  </p>
                </div>

                {/* 2. DESAFIO */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded block w-fit mb-2">
                    2. Desafio
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {caso.desafio}
                  </p>
                </div>

                {/* 3. SOLUÇÃO */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#2E3192] bg-indigo-50 px-2 py-0.5 rounded block w-fit mb-2">
                    3. Solução Brasil Legal
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {caso.solucao}
                  </p>
                </div>

                {/* 4. RESULTADO */}
                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200/80 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded block w-fit mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    4. Resultado
                  </span>
                  <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                    {caso.resultado}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#raio-x"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
          >
            <span>Verificar se meu imóvel se enquadra em solução semelhante</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F2EC00]" />
          </a>
        </div>
      </div>
    </section>
  );
};
