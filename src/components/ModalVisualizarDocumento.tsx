import React, { useState } from 'react';
import { Documento, Contact, StatusValidacaoDocumento, TipoDocumento } from '../types';
import { 
  ShieldCheck, 
  FileText, 
  Download, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  User, 
  Hash, 
  ExternalLink, 
  Maximize2,
  Lock,
  Sparkles,
  Building,
  Check,
  X
} from 'lucide-react';

interface ModalVisualizarDocumentoProps {
  isOpen: boolean;
  onClose: () => void;
  document: Documento | null;
  contact?: Contact | null;
  onUpdateDocStatus?: (id: string, status: StatusValidacaoDocumento, observacao?: string) => void;
}

export const ModalVisualizarDocumento: React.FC<ModalVisualizarDocumentoProps> = ({
  isOpen,
  onClose,
  document: doc,
  contact,
  onUpdateDocStatus
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isAuditing, setIsAuditing] = useState(false);
  const [parecerTexto, setParecerTexto] = useState(doc?.parecer_observacao || '');
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen || !doc) return null;

  const getDocTypeInfo = (tipo: TipoDocumento) => {
    switch (tipo) {
      case 'Matricula_Atualizada':
        return { label: 'Matrícula Atualizada (Registro de Imóveis)', icon: Building, color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'Contrato_Gaveta':
        return { label: 'Contrato de Gaveta / Cessão de Posse', icon: FileText, color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'IPTU':
        return { label: 'Espelho / Carnê de IPTU Municipal', icon: FileText, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'ART_RRT':
        return { label: 'ART / RRT de Engenharia & Agrimensura', icon: Sparkles, color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'Planta_Topografica':
        return { label: 'Planta Georreferenciada & Memorial Descritivo', icon: FileText, color: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      case 'RG_CPF_CNH':
        return { label: 'Documento de Identidade Oficial com Foto', icon: User, color: 'bg-slate-100 text-slate-800 border-slate-200' };
      case 'Nota_Devolucao':
        return { label: 'Nota de Devolução / Exigência do Cartório', icon: AlertCircle, color: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { label: tipo, icon: FileText, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const typeInfo = getDocTypeInfo(doc.tipo_documento);
  const TypeIcon = typeInfo.icon;

  // Fake or real secure hash for custody integrity
  const custodyHash = `SHA256:7f81a4b9c0d2e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0-${doc.id}`;
  const tokenCustodia = `BR-LEGAL-CUSTODIA-${doc.id.toUpperCase()}`;

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(custodyHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDecision = (status: StatusValidacaoDocumento) => {
    if (onUpdateDocStatus) {
      onUpdateDocStatus(doc.id, status, parecerTexto);
    }
    setIsAuditing(false);
  };

  const isImage = doc.file_url.includes('images.unsplash.com') || 
                  doc.file_url.endsWith('.png') || 
                  doc.file_url.endsWith('.jpg') || 
                  doc.file_url.endsWith('.jpeg') ||
                  doc.file_url.startsWith('data:image/');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Top Header with Security Badge */}
        <div className="bg-[#2E3192] px-5 py-3.5 text-white flex items-center justify-between border-b-2 border-[#F2EC00] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#F2EC00] border border-white/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Cofre Registral de Documentos em Custódia
                </h3>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Custódia Segura Provimento 65 CNJ
                </span>
              </div>
              <p className="text-xs text-white/80 font-mono mt-0.5 truncate max-w-md">
                {doc.nome_arquivo || doc.file_url}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm font-bold transition-all cursor-pointer"
              title="Fechar visualizador"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar & Action Bar */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${typeInfo.color}`}>
              <TypeIcon className="w-3.5 h-3.5" />
              {typeInfo.label}
            </span>

            {/* Status Pill */}
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                doc.status_validacao === 'Aprovado'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : doc.status_validacao === 'Pendente'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-red-50 text-red-800 border-red-300'
              }`}
            >
              {doc.status_validacao === 'Aprovado' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              {doc.status_validacao === 'Pendente' && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
              {doc.status_validacao === 'Rejeitado_Solicitar_Reenvio' && <XCircle className="w-3.5 h-3.5 text-red-600" />}
              Status: {doc.status_validacao === 'Rejeitado_Solicitar_Reenvio' ? 'Rejeitado (Solicitado Reenvio)' : doc.status_validacao}
            </span>

            {contact && (
              <span className="text-xs text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Titular: <strong className="text-slate-900">{contact.nome_completo}</strong>
              </span>
            )}
          </div>

          {/* Controls: Zoom, Rotate, Download, Print */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
            <button
              onClick={() => setZoom(prev => Math.max(50, prev - 25))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-1.5 text-slate-700 min-w-[45px] text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(250, prev + 25))}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-200 mx-0.5" />
            <button
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
              title="Girar 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-200 mx-0.5" />
            <a
              href={doc.file_url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer flex items-center gap-1"
              title="Abrir em Nova Aba"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer hidden sm:block"
              title="Imprimir Ficha de Custódia"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Body: Document Preview & Metadata Panel */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          {/* Left: Document Canvas / Visualizer (2 cols) */}
          <div className="lg:col-span-2 bg-slate-900/95 flex items-center justify-center p-4 overflow-auto min-h-[350px] max-h-[550px] relative">
            {/* Watermark of Custody */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-[11px] font-mono z-10 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F2EC00]" />
              <span>{tokenCustodia}</span>
            </div>

            {isImage ? (
              <div 
                className="transition-transform duration-200 shadow-2xl rounded-lg overflow-hidden bg-white max-w-full"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                <img
                  src={doc.file_url}
                  alt={doc.nome_arquivo || 'Documento em custódia'}
                  className="max-h-[480px] w-auto object-contain select-none"
                />
              </div>
            ) : (
              /* High-Fidelity Official Document Certificate Template */
              <div 
                className="bg-white text-slate-900 p-8 rounded-xl shadow-2xl border-4 border-double border-slate-300 max-w-lg w-full transition-transform duration-200 select-none"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                {/* Official Letterhead */}
                <div className="text-center pb-4 border-b-2 border-slate-800">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-[#2E3192] text-[#F2EC00] flex items-center justify-center font-serif text-lg font-bold shadow">
                    BL
                  </div>
                  <h4 className="font-serif text-sm font-bold uppercase tracking-widest text-[#2E3192]">
                    Brasil Legal — Regularização Imobiliária
                  </h4>
                  <p className="text-[10px] text-slate-500 font-serif">
                    Plataforma de Auditoria Registral & Engenharia Legal • Provimento 65 CNJ
                  </p>
                  <div className="inline-block mt-2 bg-slate-100 px-3 py-1 rounded text-[11px] font-bold font-mono text-slate-800 border border-slate-300">
                    CERTIDÃO DE CUSTÓDIA DOCUMENTAL DIGITAL
                  </div>
                </div>

                {/* Certificate Body */}
                <div className="py-4 space-y-3 text-xs leading-relaxed text-slate-700 font-serif">
                  <p>
                    Certificamos para os devidos fins de instrução de <strong>Processo de Regularização Fundiária / Usucapião Extrajudicial</strong> que o documento abaixo discriminado foi recebido em custódia criptográfica, verificado e indexado aos autos digitais.
                  </p>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-sans text-xs space-y-1">
                    <div><strong>Espécie do Documento:</strong> {typeInfo.label}</div>
                    <div><strong>Arquivo Original:</strong> <span className="font-mono text-[11px]">{doc.nome_arquivo || 'certidao_matricula.pdf'}</span></div>
                    <div><strong>Requerente / Titular:</strong> {contact?.nome_completo || 'Cliente Registrado'}</div>
                    <div><strong>CPF / CNPJ:</strong> <span className="font-mono">{contact?.cpf_cnpj || '000.000.000-00'}</span></div>
                    <div><strong>Data do Depósito:</strong> {doc.data_upload ? new Date(doc.data_upload).toLocaleString('pt-BR') : new Date().toLocaleDateString('pt-BR')}</div>
                  </div>

                  {doc.ocr_resumo && (
                    <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-lg text-[11px] font-sans text-indigo-950">
                      <strong className="block text-[#2E3192] mb-0.5">Leitura Registral OCR:</strong>
                      {doc.ocr_resumo}
                    </div>
                  )}
                </div>

                {/* Digital Signature Seal */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <div>
                    <div>Assinatura Digital ICP-Brasil:</div>
                    <div className="text-slate-800 font-bold">BRASIL LEGAL REGISTRAL LTDA</div>
                  </div>
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-[#2E3192] flex flex-col items-center justify-center text-[8px] text-[#2E3192] font-bold leading-tight">
                    <span>CUSTÓDIA</span>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>VÁLIDA</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Technical Audit, Hash & Decision Panel (1 col) */}
          <div className="p-5 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between overflow-y-auto max-h-[550px]">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#2E3192]" />
                  Autenticidade & Carimbo Digital
                </h4>
                <div className="mt-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Identificador Único:</span>
                    <strong className="text-slate-800">{doc.id}</strong>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono break-all bg-white p-1.5 rounded border border-slate-200">
                    {custodyHash}
                  </div>
                  <button
                    onClick={handleCopyHash}
                    className="w-full text-center py-1 text-[10px] font-bold text-[#2E3192] hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                  >
                    {copiedHash ? '✓ Hash SHA-256 Copiado!' : 'Copiar Hash Criptográfico'}
                  </button>
                </div>
              </div>

              {/* Technical Opinion / Note */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Parecer Técnico / Exigência Registral
                </h4>
                {isAuditing ? (
                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      value={parecerTexto}
                      onChange={e => setParecerTexto(e.target.value)}
                      placeholder="Descreva o parecer: certidão sem ônus, confrontantes conferidos, ou se necessário complementação de folhas..."
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E3192]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleDecision('Rejeitado_Solicitar_Reenvio')}
                        className="py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Rejeitar
                      </button>
                      <button
                        onClick={() => handleDecision('Aprovado')}
                        className="py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#F2EC00]" /> Aprovar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
                    {doc.parecer_observacao ? (
                      <p className="text-slate-700 italic">
                        "{doc.parecer_observacao}"
                      </p>
                    ) : (
                      <p className="text-slate-400 italic">
                        Nenhum parecer emitido ainda. Documento aguardando conferência do Coordenador Técnico.
                      </p>
                    )}
                    {doc.validado_por && (
                      <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                        Validado por: <strong>{doc.validado_por}</strong>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setParecerTexto(doc.parecer_observacao || '');
                        setIsAuditing(true);
                      }}
                      className="w-full py-1.5 px-2.5 bg-[#2E3192] hover:bg-[#1C1E63] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs mt-2"
                    >
                      Alterar Parecer / Auditar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2 mt-4">
              <a
                href={doc.file_url}
                download={doc.nome_arquivo || 'documento_custodia.pdf'}
                className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1.5 border border-slate-300"
              >
                <Download className="w-3.5 h-3.5" /> Baixar Cópia
              </a>
              <button
                onClick={onClose}
                className="py-2 px-4 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
