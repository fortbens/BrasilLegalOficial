import React from 'react';
import { ShieldCheck, Award, CheckCircle2, Play, MessageCircle, ArrowRight, UserCheck } from 'lucide-react';

interface SecaoAutoridadeProps {
  nome?: string;
  cargo?: string;
  experiencia?: string;
  bio?: string;
  fotoUrl?: string;
  credenciais?: string[];
  onOpenVideo?: (url: string, titulo: string) => void;
  videoUrl?: string;
  whatsappUrl?: string;
}

export const SecaoAutoridade: React.FC<SecaoAutoridadeProps> = ({
  nome = 'Emerson Carneiro',
  cargo = 'Fundador & Diretor Comercial',
  experiencia = 'Mais de duas décadas de experiência no mercado imobiliário.',
  bio = 'A Brasil Legal nasceu da experiência prática do mercado imobiliário e da necessidade de transformar processos complexos de regularização em caminhos mais claros, organizados e seguros para o proprietário.',
  fotoUrl = '/team/emerson-carneiro.jpg',
  credenciais = [
    'Mais de 20 anos de experiência prática no mercado imobiliário e loteamentos',
    'Especialista em destravar processos cartorários e regularizações fundiárias',
    'Pioneiro na integração entre engenharia de precisão, documentação e direito registral',
    'Coordenação de centenas de casos de sucesso em cartórios de SP e prefeituras'
  ],
  onOpenVideo,
  videoUrl = 'https://youtu.be/9uRifSbfweA?si=0UzSL42AuAF3IaGS',
  whatsappUrl
}) => {
  return (
    <section id="autoridade" className="py-20 px-4 sm:px-6 bg-slate-900 text-white relative overflow-hidden scroll-mt-20">
      <div className="absolute inset-0 bg-[radial-gradient(#2E3192_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Coluna da Imagem / Card de Autoridade */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl bg-slate-800 group">
              <img
                src={fotoUrl}
                alt={nome}
                className="w-full h-96 sm:h-[28rem] object-cover object-top transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.includes('unsplash')) {
                    target.src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/15">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2EC00] block">
                  Liderança & Estratégia
                </span>
                <h4 className="text-lg font-black text-white">{nome}</h4>
                <p className="text-xs text-slate-300">{cargo}</p>
              </div>
            </div>
          </div>

          {/* Coluna do Conteúdo / Proposta */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#F2EC00] text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
              <Award className="w-3.5 h-3.5" />
              Experiência Imobiliária Aplicada à Regularização
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {nome}
            </h2>

            <p className="text-sm sm:text-base font-semibold text-[#F2EC00]">
              {experiencia}
            </p>

            <p className="text-sm text-slate-300 leading-relaxed">
              {bio}
            </p>

            {/* Credenciais e Diferenciais Práticos */}
            <div className="space-y-3 pt-2">
              {credenciais.map((cred, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/5 border border-white/10 p-3 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm text-slate-200">{cred}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
                >
                  <MessageCircle className="w-4 h-4 text-slate-950" />
                  <span>Falar com o Emerson no WhatsApp</span>
                </a>
              )}

              {onOpenVideo && videoUrl && (
                <button
                  type="button"
                  onClick={() => onOpenVideo(videoUrl, 'Apresentação Institucional Brasil Legal')}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all border border-white/20 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-[#F2EC00] fill-[#F2EC00]" />
                  <span>Assistir Vídeo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
