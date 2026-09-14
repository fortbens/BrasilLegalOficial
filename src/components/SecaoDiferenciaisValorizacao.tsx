import React from 'react';
import { Layers, Eye, Cpu, Award, TrendingUp, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const SecaoDiferenciaisValorizacao: React.FC = () => {
  const diferenciais = [
    {
      titulo: 'Integração técnica',
      subtitulo: 'Engenharia, documentação e jurídico',
      descricao: 'Diferente de escritórios isolados, unimos topografia, engenharia civil e advocacia registral sob a mesma gestão. Nenhum documento fica perdido.',
      icone: Layers,
      cor: 'text-[#2E3192] bg-indigo-50'
    },
    {
      titulo: 'Visão patrimonial',
      subtitulo: 'Olhamos para o seu patrimônio real',
      descricao: 'Não tratamos seu caso como mero trâmite burocrático. Estudamos como a regularização vai gerar valor, proteger sua família e destravar negócios.',
      icone: Eye,
      cor: 'text-amber-700 bg-amber-50'
    },
    {
      titulo: 'Tecnologia avançada',
      subtitulo: 'Processos estruturados e precisão',
      descricao: 'Uso de georreferenciamento GNSS RTK, mapeamento por drone e acompanhamento digital transparente em todas as fases do processo.',
      icone: Cpu,
      cor: 'text-emerald-700 bg-emerald-50'
    },
    {
      titulo: 'Experiência prática',
      subtitulo: 'Vivência prática no mercado',
      descricao: 'Mais de duas décadas conhecendo na prática o funcionamento de cartórios de registro de imóveis, tabelionatos de notas e prefeituras da região.',
      icone: Award,
      cor: 'text-purple-700 bg-purple-50'
    }
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      {/* 1. SEÇÃO DE DIFERENCIAIS */}
      <section id="diferenciais" className="py-20 px-4 sm:px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E3192]" />
              Por que a Brasil Legal
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Os 4 pilares da nossa atuação
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              O modelo tradicional de regularização é fragmentado e demorado. Nós integramos todas as competências para resolver de forma definitiva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {diferenciais.map((dif) => {
              const Icon = dif.icone;
              return (
                <div
                  key={dif.titulo}
                  className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${dif.cor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#2E3192] block mb-1">
                      {dif.titulo}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mb-2">
                      {dif.subtitulo}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {dif.descricao}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. SEÇÃO DE VALORIZAÇÃO */}
      <section id="valorizacao" className="py-16 px-4 sm:px-6 bg-gradient-to-r from-[#1C1E63] via-[#2E3192] to-[#1C1E63] text-white relative overflow-hidden scroll-mt-20">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F2EC00]/20 border border-[#F2EC00]/40 text-[#F2EC00] text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <TrendingUp className="w-4 h-4" />
            Impacto no valor de mercado
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug max-w-3xl mx-auto">
            Regularizar é mais do que colocar documentos em ordem.
          </h2>

          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            É aumentar a segurança do patrimônio e ampliar as possibilidades de utilização, negociação e transferência do imóvel.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-3xl mx-auto text-left">
            <div className="bg-white/10 border border-white/15 p-4 rounded-xl backdrop-blur-xs">
              <strong className="text-[#F2EC00] text-xl font-black block">+30% a 40%</strong>
              <span className="text-xs text-slate-200 mt-1 block">
                Valorização média imediata sobre o valor de mercado de imóveis irregulares.
              </span>
            </div>

            <div className="bg-white/10 border border-white/15 p-4 rounded-xl backdrop-blur-xs">
              <strong className="text-[#F2EC00] text-xl font-black block">100% financiável</strong>
              <span className="text-xs text-slate-200 mt-1 block">
                Permite venda por crédito imobiliário Caixa, Itaú, Bradesco e consórcios.
              </span>
            </div>

            <div className="bg-white/10 border border-white/15 p-4 rounded-xl backdrop-blur-xs">
              <strong className="text-[#F2EC00] text-xl font-black block">Herança segura</strong>
              <span className="text-xs text-slate-200 mt-1 block">
                Evita processos judiciais de partilha travados e protege seus herdeiros.
              </span>
            </div>
          </div>

          <div className="pt-4">
            <a
              href="#raio-x"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#F2EC00] hover:bg-yellow-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              <span>Avaliar a valorização do meu imóvel com o Raio-X</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
