import React, { useState } from 'react';
import { Contact, TipoDocumento, Documento } from '../types';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

interface ModalUploadDocumentosProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onUploadSuccess: (newDoc: Partial<Documento>) => void;
}

export const ModalUploadDocumentos: React.FC<ModalUploadDocumentosProps> = ({
  isOpen,
  onClose,
  contact,
  onUploadSuccess
}) => {
  const [selectedTipo, setSelectedTipo] = useState<TipoDocumento>('Matricula_Atualizada');
  const [copiedLink, setCopiedLink] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen || !contact) return null;

  const secureLink = `https://brasillegal.app/custodia/${contact.id}/token_${Math.random().toString(36).substring(2, 9)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(secureLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleConfirmUpload = () => {
    if (!uploadedFile) {
      alert('Selecione ou arraste um arquivo para upload.');
      return;
    }

    setIsUploading(true);
    setTimeout(() => {
      onUploadSuccess({
        contact_id: contact.id,
        tipo_documento: selectedTipo,
        file_url: `https://cdn.brasillegal.internal/docs/${uploadedFile.name}`,
        nome_arquivo: uploadedFile.name,
        tamanho_bytes: uploadedFile.size,
        upload_na_qualificacao: true,
        status_validacao: 'Pendente',
        data_upload: new Date().toISOString()
      });
      setIsUploading(false);
      setUploadedFile(null);
      onClose();
    }, 800);
  };

  const docTypes: { type: TipoDocumento; label: string; desc: string }[] = [
    { type: 'Matricula_Atualizada', label: 'Matrícula Atualizada (CRI)', desc: 'Expedida pelo Cartório de Registro de Imóveis competente há menos de 30 dias' },
    { type: 'RG_CPF_CNH', label: 'RG / CPF / CNH do Titular', desc: 'Documento oficial de identidade nítido com filiação e foto' },
    { type: 'IPTU', label: 'Carnê ou Espelho do IPTU', desc: 'Espelho cadastral municipal com inscrição e histórico de lançamentos' },
    { type: 'Contrato_Gaveta', label: 'Contrato de Gaveta / Cessão', desc: 'Instrumento particular de compra e venda ou cessão de posse com firmas reconhecidas' },
    { type: 'Planta_Topografica', label: 'Planta & Memorial Descritivo', desc: 'Levantamento topográfico georreferenciado com coordenadas UTM' },
    { type: 'ART_RRT', label: 'ART / RRT de Engenharia', desc: 'Anotação ou Registro de Responsabilidade Técnica quitada no CREA/CAU' },
    { type: 'Comprovante_Endereco', label: 'Comprovante de Endereço', desc: 'Contas de concessionárias de água/luz demonstrando posse contínua' },
    { type: 'Nota_Devolucao', label: 'Nota de Devolução / Exigências', desc: 'Nota de devolução expedida pelo oficial de registro para saneamento de dúvidas' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#2E3192] px-6 py-4 flex items-center justify-between text-white border-b-2 border-[#F2EC00]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#F2EC00]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Link Seguro de Custódia Documental</h2>
              <p className="text-xs text-white/80">Função: `solicitar_upload_documentos` (Qualificação SDR)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Target Client info */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase font-bold text-slate-500">Requerente Selecionado</div>
              <div className="text-sm font-bold text-[#2E3192]">{contact.nome_completo}</div>
              <div className="text-xs text-slate-600">WhatsApp: {contact.telefone_whatsapp} | CPF: {contact.cpf_cnpj}</div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-100 text-[#2E3192]">
              {contact.qualificacao_sdr || 'Em Triagem'}
            </span>
          </div>

          {/* Generated Shareable Link with WhatsApp Dispatch */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Link Seguro Gerado para o Cliente (WhatsApp)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={secureLink}
                className="w-full text-xs font-mono px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#2E3192] text-white hover:bg-[#1E216B]'
                }`}
              >
                {copiedLink ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copiado!' : 'Copiar Link'}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Token com validade de 48h com criptografia de ponta a ponta para saneamento cadastral.
            </p>
          </div>

          {/* Simulação Direta de Upload pela Equipe Interna ou Teste */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Ou faça a anexação direta do arquivo no CRM:
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo do Documento (`DocumentSchema`)
              </label>
              <select
                value={selectedTipo}
                onChange={e => setSelectedTipo(e.target.value as TipoDocumento)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
              >
                {docTypes.map(d => (
                  <option key={d.type} value={d.type}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 hover:border-[#2E3192] rounded-xl p-5 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <UploadCloud className="w-8 h-8 text-[#2E3192] mx-auto mb-2 opacity-80" />
              <div className="text-xs font-bold text-slate-700">
                Arraste o documento aqui ou clique para selecionar
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Formatos aceitos: PDF, JPG, PNG, DWG (Máx: 25MB)
              </p>
              <input
                type="file"
                id="file-upload-input"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.dwg"
              />
              <label
                htmlFor="file-upload-input"
                className="inline-block mt-3 px-3.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[#2E3192] hover:bg-slate-100 cursor-pointer shadow-2xs"
              >
                Selecionar Arquivo do Computador
              </label>

              {uploadedFile && (
                <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold truncate">{uploadedFile.name}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 shrink-0">
                    {(uploadedFile.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Fechar
          </button>
          <button
            type="button"
            disabled={!uploadedFile || isUploading}
            onClick={handleConfirmUpload}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              !uploadedFile || isUploading
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-[#2E3192] hover:bg-[#1E216B] text-white shadow-md border-b-2 border-[#F2EC00]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#F2EC00]" />
            {isUploading ? 'Salvando na Custódia...' : 'Vincular Documento à Custódia'}
          </button>
        </div>
      </div>
    </div>
  );
};
