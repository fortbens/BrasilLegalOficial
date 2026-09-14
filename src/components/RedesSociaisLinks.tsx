import React from 'react';
import { RedeSocialItem } from '../types';
import { Instagram, Facebook, Youtube, Share2 } from 'lucide-react';

interface RedesSociaisLinksProps {
  redes?: RedeSocialItem[];
  tamanho?: 'sm' | 'md' | 'lg';
  estilo?: 'header' | 'footer' | 'cards';
  className?: string;
}

export const RedesSociaisLinks: React.FC<RedesSociaisLinksProps> = ({
  redes,
  tamanho = 'md',
  estilo = 'header',
  className = ''
}) => {
  const redesPadrao: RedeSocialItem[] = [
    {
      id: 'rede-tiktok',
      nome: 'TikTok',
      username: '@brasillegaloficial',
      url: 'https://www.tiktok.com/@brasillegaloficial',
      icone: 'tiktok',
      ordem: 1,
      ativo: true
    },
    {
      id: 'rede-instagram',
      nome: 'Instagram',
      username: '@brasillegalodicial',
      url: 'https://www.instagram.com/brasillegalodicial',
      icone: 'instagram',
      ordem: 2,
      ativo: true
    },
    {
      id: 'rede-facebook',
      nome: 'Facebook',
      username: '@brasillegaloficial',
      url: 'https://www.facebook.com/brasillegaloficial',
      icone: 'facebook',
      ordem: 3,
      ativo: true
    },
    {
      id: 'rede-youtube',
      nome: 'YouTube',
      username: '@brasillegaloficial',
      url: 'https://www.youtube.com/@brasillegaloficial',
      icone: 'youtube',
      ordem: 4,
      ativo: true
    }
  ];

  const itens = (redes && redes.length > 0 ? redes : redesPadrao).filter(r => r.ativo !== false);

  const getIcone = (nome: string) => {
    const n = nome.toLowerCase();
    if (n.includes('instagram')) return <Instagram className="w-4 h-4" />;
    if (n.includes('facebook')) return <Facebook className="w-4 h-4" />;
    if (n.includes('youtube')) return <Youtube className="w-4 h-4" />;
    // TikTok custom SVG
    return (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.41a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.08a8.31 8.31 0 0 0 4.76 1.48V7.1a4.88 4.88 0 0 1-1-.41z" />
      </svg>
    );
  };

  if (estilo === 'footer') {
    return (
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        {itens.map((r) => (
          <a
            key={r.id || r.nome}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${r.nome}: ${r.username}`}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#F2EC00] text-white hover:text-slate-950 flex items-center justify-center transition-all border border-white/15"
          >
            {getIcone(r.nome)}
          </a>
        ))}
      </div>
    );
  }

  // Header / Inline Style
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {itens.map((r) => (
        <a
          key={r.id || r.nome}
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          title={`${r.nome}: ${r.username}`}
          className="p-1.5 rounded-lg text-slate-500 hover:text-[#2E3192] hover:bg-slate-100 transition-colors"
        >
          {getIcone(r.nome)}
        </a>
      ))}
    </div>
  );
};
