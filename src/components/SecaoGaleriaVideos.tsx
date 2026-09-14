import React, { useState } from 'react';
import { VideoItem } from '../types';
import { Play, Video, Sparkles, Filter } from 'lucide-react';

interface SecaoGaleriaVideosProps {
  videos?: VideoItem[];
  onOpenVideo: (url: string, titulo: string) => void;
}

export const SecaoGaleriaVideos: React.FC<SecaoGaleriaVideosProps> = ({ videos = [], onOpenVideo }) => {
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('Todos');

  const videosAtivos = videos.filter(v => v.ativo !== false);
  if (videosAtivos.length === 0) return null;

  const categorias = ['Todos', ...Array.from(new Set(videosAtivos.map(v => v.categoria || 'Geral')))];

  const videosFiltrados = categoriaAtiva === 'Todos'
    ? videosAtivos
    : videosAtivos.filter(v => (v.categoria || 'Geral') === categoriaAtiva);

  return (
    <section id="galeria-videos" className="py-20 px-4 sm:px-6 bg-slate-900 text-white scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#F2EC00] text-xs font-bold uppercase tracking-wider mb-3">
            <Video className="w-3.5 h-3.5" />
            Conteúdo em vídeo e orientações
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Vídeos explicativos da Brasil Legal
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-3 leading-relaxed">
            Aprenda como funciona a regularização na prática com os nossos especialistas e entenda como resolver seu caso.
          </p>

          {/* Filtros de Categoria */}
          {categorias.length > 2 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {categorias.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategoriaAtiva(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    categoriaAtiva === cat
                      ? 'bg-[#F2EC00] text-slate-950 shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videosFiltrados.map((vid) => (
            <div
              key={vid.id}
              className="bg-slate-800/90 border border-white/10 rounded-2xl overflow-hidden hover:border-[#F2EC00]/40 transition-all flex flex-col group cursor-pointer"
              onClick={() => onOpenVideo(vid.url, vid.titulo)}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-slate-950 overflow-hidden">
                <img
                  src={vid.thumbnail || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'}
                  alt={vid.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.src.includes('unsplash')) {
                      target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';
                    }
                  }}
                />
                <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center group-hover:bg-slate-950/20 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-[#F2EC00] text-slate-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>

                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-950/80 text-white border border-white/20 backdrop-blur-xs">
                    {vid.categoria}
                  </span>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#F2EC00] transition-colors leading-snug line-clamp-2">
                    {vid.titulo}
                  </h3>
                  {vid.descricao && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {vid.descricao}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-[#F2EC00] font-semibold text-[11px]">
                    <Play className="w-3 h-3 fill-[#F2EC00]" />
                    Assistir Agora
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
