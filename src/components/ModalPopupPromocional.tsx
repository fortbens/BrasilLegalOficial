import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Sparkles, 
  Copy, 
  Check, 
  MessageCircle, 
  Tag, 
  ArrowRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { SiteSettings } from '../types';

interface ModalPopupPromocionalProps {
  settings: SiteSettings;
  whatsappNumero: string;
  isOpen: boolean;
  onClose: () => void;
  isPreview?: boolean;
}

export const ModalPopupPromocional: React.FC<ModalPopupPromocionalProps> = ({
  settings,
  whatsappNumero,
  isOpen,
  onClose,
  isPreview = false
}) => {
  const [copied, setCopied] = useState(false);
  const totalMinutos = settings.popup_promo_minutos_cronometro || 15;
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(totalMinutos * 60);

  // Inicializa o relógio quando abre
  useEffect(() => {
    if (isOpen) {
      setTimeLeftSeconds(totalMinutos * 60);
      setCopied(false);
    }
  }, [isOpen, totalMinutos]);

  // Contagem regressiva de segundos
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  const cupom = settings.popup_promo_cupom || 'REGULARIZA20';
  const tagDesconto = settings.popup_promo_tag_desconto || 'CONDIÇÃO ESPECIAL';
  const titulo = settings.popup_promo_titulo || 'Condição Especial de Plantão Notarial';
  const subtitulo = settings.popup_promo_subtitulo || 'Garanta até 20% de desconto nos honorários de regularização para requerimentos iniciados hoje!';
  const textoBotao = settings.popup_promo_texto_botao || 'Resgatar Desconto no WhatsApp';
  const textoRodape = settings.popup_promo_texto_rodape || 'Condição especial limitada ao encerramento do cronômetro. Atendimento oficial.';
  
  const cleanPhone = whatsappNumero.replace(/\D/g, '') || '5511998642424';
  const defaultMsg = settings.popup_promo_mensagem_whatsapp || `Olá! Vi a campanha no site com o cupom ${cupom} e quero garantir a condição especial para regularizar meu imóvel.`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMsg)}`;

  const handleCopyCupom = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cupom);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl sm:rounded-3xl border border-amber-400/30 p-5 sm:p-7 shadow-2xl z-10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#2E3192]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer z-20"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Banner Tag / Destaque */}
        <div className="flex items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wider uppercase">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{tagDesconto}</span>
          </div>
          {isPreview && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Modo Teste / CMS
            </span>
          )}
        </div>

        {/* Título & Subtítulo */}
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
          {titulo}
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
          {subtitulo}
        </p>

        {/* Cronômetro Digital Regressivo */}
        <div className="mt-5 p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Oferta expira em:</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {timeLeftSeconds === 0 ? 'Tempo esgotado!' : 'Plantão ao vivo'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            {/* Bloco Minutos */}
            <div className="flex flex-col items-center">
              <div className="w-16 sm:w-20 h-14 sm:h-16 rounded-xl bg-slate-950 border border-amber-400/30 flex items-center justify-center shadow-lg">
                <span className="text-2xl sm:text-3xl font-mono font-black text-amber-300 tracking-wider">
                  {pad(minutes)}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">Minutos</span>
            </div>

            <span className="text-2xl font-black text-amber-400/80 -mt-4">:</span>

            {/* Bloco Segundos */}
            <div className="flex flex-col items-center">
              <div className="w-16 sm:w-20 h-14 sm:h-16 rounded-xl bg-slate-950 border border-amber-400/30 flex items-center justify-center shadow-lg">
                <span className="text-2xl sm:text-3xl font-mono font-black text-amber-300 tracking-wider">
                  {pad(seconds)}
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">Segundos</span>
            </div>
          </div>
        </div>

        {/* Código do Cupom com Copiar */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
              <Tag className="w-4 h-4 text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Código do Cupom</p>
              <p className="text-sm font-mono font-bold text-white tracking-widest truncate">{cupom}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyCupom}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              copied 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Botão de Ação CTA para WhatsApp */}
        <div className="mt-5 space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/25 transition-all cursor-pointer group"
          >
            <MessageCircle className="w-5 h-5 text-emerald-100" />
            <span>{textoBotao}</span>
            <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer text-center"
          >
            Não quero aproveitar agora, continuar navegando
          </button>
        </div>

        {/* Aviso de Rodapé */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{textoRodape}</span>
        </div>
      </div>
    </div>
  );
};
