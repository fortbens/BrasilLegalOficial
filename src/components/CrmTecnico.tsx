import React, { useState } from 'react';
import { Documento, Deal, Contact, StatusValidacaoDocumento, TipoDocumento } from '../types';
import { 
  FileCheck2, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Sparkles, 
  Building2, 
  Scale, 
  Compass, 
  ExternalLink,
  Bot,
  Filter,
  Search,
  Eye,
  Mail,
  Send
} from 'lucide-react';
import { ModalVisualizarDocumento } from './ModalVisualizarDocumento';

interface CrmTecnicoProps {
  documents: Documento[];
  deals: Deal[];
  contacts: Contact[];
  onUpdateDocStatus: (id: string, status: StatusValidacaoDocumento, observacao?: string) => void;
  onGenerateAiOpinion: (deal: Deal, contact: Contact) => void;
  aiLoading: boolean;
  onNavigateToAiComparator?: () => void;
  onSendEmailMarketingDiagnostic?: (deal: Deal, contact: Contact, parecer: string) => void;
}

export const CrmTecnico: React.FC<CrmTecnicoProps> = ({
  documents,
  deals,
  contacts,
  onUpdateDocStatus,
  onGenerateAiOpinion,
  aiLoading,
  onNavigateToAiComparator,
  onSendEmailMarketingDiagnostic
}) => {
  const [selectedDealId, setSelectedDealId] = useState<string>(deals[0]?.id || '');
  const [filterDocStatus, setFilterDocStatus] = useState<string>('todos');
  const [validatingDoc, setValidatingDoc] = useState<Documento | null>(null);
  const [viewingDoc, setViewingDoc] = useState<Documento | null>(null);
  const [parecerTexto, setParecerTexto] = useState('');
  const [sentEmailSuccessMsg, setSentEmailSuccessMsg] = useState('');

  const currentDeal = deals.find(d => d.id === selectedDealId) || deals[0];
  const currentContact = contacts.find(c => c.id === currentDeal?.contact_id);

  // Documents for the selected deal/contact or general
  const dealDocuments = documents.filter(d => {
    const matchesContact = currentContact ? d.contact_id === currentContact.id : true;
    const matchesStatus = filterDocStatus === 'todos' || d.status_validacao === filterDocStatus;
    return matchesContact && matchesStatus;
  });

  const getDocTypeBadge = (tipo: TipoDocumento) => {
    switch (tipo) {
      case 'Matricula_Atualizada':
        return { label: 'Matrícula Atualizada', color: 'bg-blue-100 text-blue-800' };
      case 'Contrato_Gaveta':
        return { label: 'Contrato de Gaveta / Cessão', color: 'bg-amber-100 text-amber-800' };
      case 'IPTU':
        return { label: 'Espelho / Carnê IPTU', color: 'bg-emerald-100 text-emerald-800' };
      case 'ART_RRT':
        return { label: 'ART / RRT Engenharia', color: 'bg-purple-100 text-purple-800' };
      case 'Planta_Topografica':
        return { label: 'Planta Georreferenciada', color: 'bg-cyan-100 text-cyan-800' };
      case 'RG_CPF_CNH':
        return { label: 'Identidade Oficial (RG/CNH)', color: 'bg-slate-100 text-slate-800' };
      case 'Nota_Devolucao':
        return { label: 'Nota de Devolução do Cartório', color: 'bg-red-100 text-red-800' };
      default:
        return { label: tipo, color: 'bg-slate-100 text-slate-800' };
    }
  };

  const handleOpenValidateModal = (doc: Documento) => {
    setValidatingDoc(doc);
    setParecerTexto(doc.parecer_observacao || '');
  };

  const handleConfirmDecision = (decision: StatusValidacaoDocumento) => {
    if (!validatingDoc) return;
    onUpdateDocStatus(validatingDoc.id, decision, parecerTexto);
    setValidatingDoc(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#2E3192] text-white text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
              CRM Técnico & Engenharia Legal
            </span>
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" />
              Conformidade com Provimento 65 CNJ & Lei 13.465/17
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Custódia Documental & Emissão de Pareceres Registrais
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Validação técnica de matrículas, medições topográficas, contratos de posse e auditoria de exigências cartorárias.
          </p>
        </div>

        {/* Case selector & AI shortcut */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider shrink-0">
            Processo Ativo:
          </label>
          <select
            value={selectedDealId}
            onChange={e => setSelectedDealId(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
          >
            {deals.map(deal => (
              <option key={deal.id} value={deal.id}>
                {deal.titulo}
              </option>
            ))}
          </select>
          {onNavigateToAiComparator && (
            <button
              onClick={onNavigateToAiComparator}
              className="text-xs font-bold px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#2E3192] border border-indigo-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Abrir o comparador de documentos da IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Comparar com IA
            </button>
          )}
        </div>
      </div>

      {/* Case Summary Card */}
      {currentDeal && currentContact && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 border-r border-slate-100 pr-4">
            <div className="text-[11px] uppercase font-bold text-[#2E3192] flex items-center gap-1.5">
              <Building2 className="w-4 h-4" />
              {currentDeal.tipo_procedimento}
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1">{currentDeal.titulo}</h2>
            <p className="text-xs text-slate-600 mt-1">
              Cartório / Comarca: <strong>{currentDeal.cartorio_comarca}</strong>
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs text-slate-600">
              <div>Requerente: <strong className="text-slate-900">{currentContact.nome_completo}</strong></div>
              <div>•</div>
              <div>CPF/CNPJ: <span className="font-mono">{currentContact.cpf_cnpj}</span></div>
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase font-bold text-slate-500">Status Procedimental</div>
            <div className="mt-1">
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2E3192] border border-blue-200">
                {currentDeal.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Honorários Contratuais: <strong className="text-slate-900">R$ {currentDeal.valor_honorarios_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div className="text-[11px] uppercase font-bold text-slate-500">Parecer com Inteligência Gemini</div>
            <button
              onClick={() => onGenerateAiOpinion(currentDeal, currentContact)}
              disabled={aiLoading}
              className="mt-2 w-full py-2.5 px-3 bg-linear-to-r from-[#2E3192] to-[#1C1E63] text-white text-xs font-bold rounded-lg shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 border-b-2 border-[#F2EC00]"
            >
              <Sparkles className="w-4 h-4 text-[#F2EC00] animate-pulse" />
              {aiLoading ? 'Analisando Custódia...' : 'Gerar Parecer Prévio (IA)'}
            </button>
            <div className="text-[10px] text-slate-500 text-center mt-1">
              Provimento 65 CNJ & Art. 216-A LRP
            </div>
          </div>
        </div>
      )}

      {/* Technical Opinion Box if present */}
      {currentDeal?.parecer_tecnico && (
        <div className="bg-linear-to-r from-blue-50/70 to-indigo-50/70 border border-[#2E3192]/30 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#2E3192]/20">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#2E3192]" />
              <span className="text-xs font-bold text-[#2E3192] uppercase tracking-wider">
                Parecer Registral & Engenharia Legal Homologado
              </span>
            </div>
            <span className="text-[10px] font-bold bg-white text-emerald-700 px-2 py-0.5 rounded border border-emerald-300">
              Viabilidade Positiva
            </span>
          </div>
          <p className="text-xs text-slate-800 font-sans leading-relaxed mt-2 whitespace-pre-line">
            {currentDeal.parecer_tecnico}
          </p>

          {/* Automação de E-mail Marketing do Diagnóstico Prévio */}
          <div className="mt-3 pt-3 border-t border-[#2E3192]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-[11px] text-slate-600">
              🔒 <strong>Régua de Relacionamento:</strong> Encaminhe este parecer por e-mail com link auditado de custódia.
            </div>

            {onSendEmailMarketingDiagnostic && currentContact && (
              <button
                type="button"
                onClick={() => {
                  onSendEmailMarketingDiagnostic(currentDeal, currentContact, currentDeal.parecer_tecnico || '');
                  setSentEmailSuccessMsg(`E-mail com parecer e custódia enviado para ${currentContact.email}!`);
                  setTimeout(() => setSentEmailSuccessMsg(''), 5000);
                }}
                className="px-3 py-1.5 bg-[#2E3192] hover:bg-[#1C1E63] text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Mail className="w-3.5 h-3.5 text-[#F2EC00]" />
                <span>Enviar Parecer por E-mail (Fluxo 5)</span>
              </button>
            )}
          </div>

          {sentEmailSuccessMsg && (
            <div className="mt-2 p-2 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{sentEmailSuccessMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Custody Document Listing & Audit Panel */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2E3192]" />
              Módulo de Custódia Documental (`DocumentSchema`)
            </h3>
            <p className="text-xs text-slate-500">
              Documentos anexados para o cliente <strong>{currentContact?.nome_completo || 'Geral'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filtrar:</span>
            {['todos', 'Pendente', 'Aprovado', 'Rejeitado_Solicitar_Reenvio'].map(st => (
              <button
                key={st}
                onClick={() => setFilterDocStatus(st)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterDocStatus === st
                    ? 'bg-[#2E3192] text-white font-bold'
                    : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st === 'Rejeitado_Solicitar_Reenvio' ? 'Rejeitado' : st}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {dealDocuments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs italic">
              Nenhum documento encontrado com os filtros atuais.
            </div>
          ) : (
            dealDocuments.map(doc => {
              const badge = getDocTypeBadge(doc.tipo_documento);

              return (
                <div key={doc.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${badge.color}`}>
                        {badge.label}
                      </span>
                      {doc.upload_na_qualificacao && (
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          Upload na Qualificação
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {doc.data_upload ? new Date(doc.data_upload).toLocaleDateString('pt-BR') : ''}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{doc.nome_arquivo || doc.file_url}</span>
                    </div>

                    {doc.parecer_observacao && (
                      <div className="text-[11px] text-slate-600 bg-amber-50/70 border border-amber-200/60 p-2 rounded-md mt-1">
                        <strong>Nota Técnica:</strong> {doc.parecer_observacao}
                        {doc.validado_por && (
                          <span className="text-slate-500 block text-[10px] mt-0.5">
                            Validado por: {doc.validado_por}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Document Status & Validation Buttons */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                          doc.status_validacao === 'Aprovado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status_validacao === 'Pendente'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {doc.status_validacao === 'Aprovado' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {doc.status_validacao === 'Pendente' && <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                        {doc.status_validacao === 'Rejeitado_Solicitar_Reenvio' && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                        {doc.status_validacao === 'Rejeitado_Solicitar_Reenvio' ? 'Rejeitado (Reenvio)' : doc.status_validacao}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingDoc(doc)}
                        className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-[#2E3192] hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Visualizar documento em custódia e conferir carimbos notariais"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Visualizar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenValidateModal(doc)}
                        className="px-3 py-1.5 text-xs font-bold bg-[#2E3192] text-white hover:bg-[#1E216B] rounded-lg transition-colors shadow-2xs cursor-pointer"
                      >
                        Auditar / Parecer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Custody Full Visualizer Modal */}
      {viewingDoc && (
        <ModalVisualizarDocumento
          isOpen={Boolean(viewingDoc)}
          onClose={() => setViewingDoc(null)}
          document={viewingDoc}
          contact={currentContact}
          onUpdateDocStatus={onUpdateDocStatus}
        />
      )}

      {/* Audit & Decision Modal */}
      {validatingDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#2E3192] p-4 text-white flex items-center justify-between border-b-2 border-[#F2EC00]">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#F2EC00]" />
                <div>
                  <h3 className="text-sm font-bold">Auditoria Documental & Validação Registral</h3>
                  <p className="text-[11px] text-white/80">{validatingDoc.nome_arquivo}</p>
                </div>
              </div>
              <button
                onClick={() => setValidatingDoc(null)}
                className="text-white hover:text-white/80 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Parecer Técnico / Exigência Registral
                </label>
                <textarea
                  rows={4}
                  value={parecerTexto}
                  onChange={e => setParecerTexto(e.target.value)}
                  placeholder="Ex: Matrícula legível, sem gravames impeditivos. Ou: Imagem cortada, certidão vencida há mais de 30 dias..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg text-[11px] text-slate-600 border border-slate-200">
                A aprovação habilitará o documento para instrução da Ata Notarial e protocolo no Cartório de Registro de Imóveis competente.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  onClick={() => setValidatingDoc(null)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleConfirmDecision('Rejeitado_Solicitar_Reenvio')}
                  className="px-3 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Rejeitar e Solicitar Reenvio
                </button>
                <button
                  onClick={() => handleConfirmDecision('Aprovado')}
                  className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg flex items-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#F2EC00]" />
                  Aprovar Documento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
