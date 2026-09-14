import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck, 
  Copy, 
  Check, 
  PenTool,
  ExternalLink
} from 'lucide-react';
import { ContratoAssinatura } from '../types';

interface ModalVerContratoCompletoProps {
  contrato: ContratoAssinatura;
  onClose: () => void;
  onOpenAuditoria: () => void;
  onOpenAssinar: () => void;
}

export const ModalVerContratoCompleto: React.FC<ModalVerContratoCompletoProps> = ({
  contrato,
  onClose,
  onOpenAuditoria,
  onOpenAssinar
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(contrato.link_assinatura_publico);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const hasPendingSignatures = contrato.signatarios.some(s => s.status === 'Pendente');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{contrato.titulo}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  contrato.status === 'Concluído' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                  contrato.status === 'Assinado Parcialmente' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                  'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                }`}>
                  {contrato.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-mono">
                Identificador: {contrato.id} • Provedor: {contrato.provedor_assinatura}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-medium text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Link Copiado!' : 'Copiar Link de Assinatura'}
            </button>
            <button
              onClick={onOpenAuditoria}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg font-medium text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Ver Dossiê de Auditoria
            </button>
          </div>

          <div className="flex items-center gap-2">
            {hasPendingSignatures && (
              <button
                onClick={onOpenAssinar}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <PenTool className="w-3.5 h-3.5" />
                Assinar Agora
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
          </div>
        </div>

        {/* Paper Contract View */}
        <div className="p-8 max-h-[65vh] overflow-y-auto bg-slate-100 flex justify-center">
          <div className="bg-white shadow-md border border-slate-200 rounded-xl p-8 max-w-2xl w-full text-slate-800 leading-relaxed text-xs">
            {/* Header / Logo Simulation */}
            <div className="text-center border-b border-slate-200 pb-4 mb-6">
              <span className="font-extrabold text-sm tracking-wider text-blue-950 block">BRASIL LEGAL</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">
                Regularização Imobiliária & Gestão Registral
              </span>
              <span className="text-[9px] text-slate-400 block mt-1 font-mono">
                Autenticação Digital: {contrato.token_verificacao} • SHA-256: {contrato.hash_sha256_original.substring(0, 16)}...
              </span>
            </div>

            {/* Document Body */}
            <div className="whitespace-pre-wrap font-sans text-justify text-slate-700 space-y-4">
              {contrato.conteudo_contrato}
            </div>

            {/* Signature Blocks in Document */}
            <div className="mt-10 pt-6 border-t border-slate-300">
              <span className="font-bold text-xs text-slate-800 block mb-4 uppercase tracking-wide">
                Assinaturas Eletrônicas Registradas:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contrato.signatarios.map((s) => (
                  <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{s.nome}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.status === 'Assinado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">{s.papel} • CPF {s.cpf}</span>
                    {s.status === 'Assinado' && (
                      <div className="mt-2 text-[10px] text-emerald-700 space-y-0.5 border-t border-slate-200 pt-1.5">
                        <span>Assinado eletronicamente via {s.metodo_assinatura}</span>
                        <span className="block font-mono text-[9px] text-slate-500">
                          Data: {new Date(s.data_assinatura || '').toLocaleString('pt-BR')} • IP: {s.ip_origem || '187.54.12.9'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Certificate Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
              Documento assinado eletronicamente em conformidade com a MP nº 2.200-2/2001 e a Lei nº 14.063/2020.
              Verificação pública: https://brasillegalimoveis.com.br/validar
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
};
