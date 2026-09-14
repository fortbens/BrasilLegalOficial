import React from 'react';
import { Search, Compass, Cog, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const SecaoComoFunciona: React.FC = () => {
  const passos = [
    {
      numero: '01',
      titulo: 'Diagnóstico',
      subtitulo: 'Entendemos a situação do imóvel',
      descricao: 'Realizamos uma auditoria minuciosa da documentação existente, certidões da matrícula, espelho de IPTU e situação fática no local para identificar exatamente onde o imóvel está travado.',
      icone: Search,
      badge: 'Fase inicial'
    },
    {
      numero: '02',
      titulo: 'Estratégia',
      subtitulo: 'Identificamos o caminho adequado',
      descricao: 'Desenhamos a rota mais econômica, segura e ágil, dando prioridade absoluta à via extrajudicial em cartório (Lei 13.465/17 e Provimento 65 do CNJ), eliminando anos de espera judicial.',
      icone: Compass,
      badge: 'Planejamento'
    },
    {
      numero: '03',
      titulo: 'Regularização',
      subtitulo: 'Coordenamos todas as etapas',
      descricao: 'Nossa equipe multidisciplinar assume o processo: topografia RTK de alta precisão, projetos as-built na prefeitura, CIB e certidão do INSS na Receita e protocolo direto no cartório de imóveis.',
      icone: Cog,
      badge: 'Execução técnica'
    },
    {
      numero: '04',
      titulo: 'Patrimônio organizado',
      subtitulo: 'Preparado para novas possibilidades',
      descricao: 'Você recebe a matrícula definitiva com a titularidade em seu nome e a construção averbada. Seu imóvel passa a valer até 40% mais e fica 100% apto para venda rápida ou financiamento Caixa.',
      icone: ShieldCheck,
      badge: 'Conclusão'
    }
  ];

  return (
    <section id="como-funciona" className="py-20 px-4 sm:px-6 bg-slate-50 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2E3192] text-xs font-bold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5" />
            Método estruturado e transparente
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Como funciona o processo de regularização
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Sem termos jurídicos complicados e sem você precisar pegar filas em cartórios e prefeituras. Cuidamos de ponta a ponta.
          </p>
        </div>

        {/* 4-Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {passos.map((passo, idx) => {
            const Icon = passo.icone;

            return (
              <div
                key={passo.numero}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-[#2E3192]/30 group-hover:text-[#2E3192] transition-colors font-mono">
                      {passo.numero}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {passo.badge}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#2E3192] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 mb-1">
                    {passo.titulo}
                  </h3>
                  <h4 className="text-xs font-bold text-[#2E3192] mb-3">
                    {passo.subtitulo}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {passo.descricao}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Acompanhamento em tempo real</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Link */}
        <div className="mt-12 text-center">
          <a
            href="#raio-x"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#2E3192] hover:text-[#1C1E63] hover:underline"
          >
            <span>Quer saber qual é o primeiro passo para o seu imóvel específico? Faça o Raio-X</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
