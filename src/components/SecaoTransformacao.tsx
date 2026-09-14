import React from 'react';
import { XCircle, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Building2, TrendingUp, KeyRound } from 'lucide-react';

export const SecaoTransformacao: React.FC = () => {
  return (
    <section id="transformacao" className="py-20 px-4 sm:px-6 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Evolução Patrimonial
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Do problema documental ao patrimônio organizado.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Veja a transformação prática que ocorre quando aplicamos engenharia de precisão e advocacia registral integrada ao seu imóvel.
          </p>
        </div>

        {/* 3-Column Visual Transformation Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* 1. ANTES (O Cenário Irregular) */}
          <div className="lg:col-span-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded bg-rose-200/80 text-rose-900">
                  ANTES
                </span>
                <span className="text-xs font-bold text-rose-700">Imóvel Vulnerável</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Incerteza & Desvalorização
              </h3>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Imóvel Irregular:</strong> Pendências na Prefeitura e Cartório de Imóveis.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Documentação Incompleta:</strong> Apenas contratos de gaveta, recibos ou posse.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Insegurança Jurídica:</strong> Risco de disputas, penhoras de terceiros e herança travada.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>Dificuldade de Negociação:</strong> Bancos não financiam e compradores exigem deságio.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-rose-200 text-[11px] font-semibold text-rose-800 bg-rose-100/50 p-2.5 rounded-xl text-center">
              Deságio de até 40% no valor real do imóvel
            </div>
          </div>

          {/* 2. BRASIL LEGAL (A Ponte de Resolução) */}
          <div className="lg:col-span-4 bg-gradient-to-b from-[#1C1E63] to-[#2E3192] text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F2EC00]/10 rounded-full blur-xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded bg-[#F2EC00] text-slate-950">
                  MÉTODO BRASIL LEGAL
                </span>
                <span className="text-xs font-semibold text-[#F2EC00]">Integração Total</span>
              </div>

              <h3 className="text-lg font-bold text-white mb-4">
                Coordenação Especializada
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-slate-200">
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs">
                  <strong className="block text-white font-bold text-xs">1. Diagnóstico Registral Completo</strong>
                  <span className="text-[11px] text-slate-300">Auditoria técnica de certidões, cadeia de posse e riscos.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs">
                  <strong className="block text-white font-bold text-xs">2. Estratégia Extrajudicial</strong>
                  <span className="text-[11px] text-slate-300">Caminho mais rápido e econômico direto em cartório.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs">
                  <strong className="block text-white font-bold text-xs">3. Engenharia & Topografia RTK</strong>
                  <span className="text-[11px] text-slate-300">Plantas as-built, memoriais descritivos e Habite-se.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs">
                  <strong className="block text-white font-bold text-xs">4. Advocacia & Saneamento</strong>
                  <span className="text-[11px] text-slate-300">CIB, Receita Federal (SERO), ITCMD e registro definitivo.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/20 text-center">
              <a
                href="#raio-x"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F2EC00] hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Iniciar Minha Transformação</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 3. DEPOIS (O Patrimônio Consolidado) */}
          <div className="lg:col-span-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-200/80 text-emerald-900">
                  DEPOIS
                </span>
                <span className="text-xs font-bold text-emerald-700">100% Legalizado</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-4">
                Segurança & Valor Máximo
              </h3>

              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Patrimônio Organizado:</strong> Matrícula individualizada no Cartório de Imóveis.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Documentação Regularizada:</strong> Habite-se, CIB e CND da obra averbados.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Máxima Segurança Jurídica:</strong> Blindagem patrimonial e tranquilidade para a família.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Novas Possibilidades:</strong> Aceita financiamento bancário, consórcio e venda imediata.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-200 text-[11px] font-bold text-emerald-800 bg-emerald-100/60 p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Valorização patrimonial média de 30% a 40%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
