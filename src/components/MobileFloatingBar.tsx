import React from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';

interface MobileFloatingBarProps {
  whatsappUrl: string;
}

export const MobileFloatingBar: React.FC<MobileFloatingBarProps> = ({ whatsappUrl }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 shadow-2xl flex items-center gap-2">
      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md active:scale-95 transition-all"
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Main CTA: ANALISAR MEU IMÓVEL */}
      <a
        href="#raio-x"
        className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#2E3192] to-[#1C1E63] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
      >
        <Sparkles className="w-4 h-4 text-[#F2EC00]" />
        <span>ANALISAR MEU IMÓVEL</span>
      </a>
    </div>
  );
};
