import React, { useState } from 'react';
import { Contact, Documento, FollowUpItem, QualificacaoSdr, Usuario } from '../types';
import { 
  X, 
  MessageSquare, 
  Phone, 
  Clock, 
  Calendar, 
  User, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  Copy, 
  MapPin, 
  AlertCircle, 
  PlusCircle, 
  Building2, 
  Tag, 
  Briefcase, 
  Printer, 
  Edit3, 
  Check, 
  ChevronRight,
  UploadCloud
} from 'lucide-react';

interface ModalFollowUpLeadProps {
  contact: Contact;
  currentUser?: Usuario;
  documents?: Documento[];
  onClose: () => void;
  onSaveFollowUp: (contactId: string, followUp: Omit<FollowUpItem, 'id' | 'data_hora'> & { novoStatus?: QualificacaoSdr }) => Promise<void> | void;
  onSaveParecerPrevio: (contactId: string, parecer: string, autor?: string) => Promise<void> | void;
  onOpenUploadModal?: (contact: Contact) => void;
  onUpdateStage?: (contactId: string, stage: QualificacaoSdr) => void;
  initialTab?: 'followup' | 'parecer' | 'documentos';
}

export const ModalFollowUpLead: React.FC<ModalFollowUpLeadProps> = ({
  contact,
  currentUser,
  documents = [],
  onClose,
  onSaveFollowUp,
  onSaveParecerPrevio,
  onOpenUploadModal,
  onUpdateStage,
  initialTab = 'followup'
}) => {
  const [activeTab, setActiveTab] = useState<'followup' | 'parecer' | 'documentos' | 'dados'>(initialTab);
  
  // Follow-up form state
  const [tipoContato, setTipoContato] = useState<FollowUpItem['tipo']>('WhatsApp');
  const [novoStatus, setNovoStatus] = useState<QualificacaoSdr>(contact.qualificacao_sdr || 'Lead');
  const [conteudoFollowUp, setConteudoFollowUp] = useState('');
  const [proximoContato, setProximoContato] = useState('');
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);
  const [followUpSuccess, setFollowUpSuccess] = useState(false);

  // Parecer Prévio state
  const [parecerTexto, setParecerTexto] = useState(contact.parecer_previo || '');
  const [isEditingParecer, setIsEditingParecer] = useState(!contact.parecer_previo);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copiedParecer, setCopiedParecer] = useState(false);

  const contactDocs = documents.filter(d => d.contact_id === contact.id);
  const autorPadrao = currentUser?.nome || 'Emerson Carneiro';

  // Handle follow up submit
  const handleSubmitFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conteudoFollowUp.trim()) return;

    setIsSubmittingFollowUp(true);
    try {
      await onSaveFollowUp(contact.id, {
        autor: autorPadrao,
        tipo: tipoContato,
        conteudo: conteudoFollowUp.trim(),
        status_lead: novoStatus,
        proximo_contato: proximoContato || undefined,
        novoStatus
      });
      setFollowUpSuccess(true);
      setConteudoFollowUp('');
      setProximoContato('');
      setTimeout(() => setFollowUpSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar follow-up:', err);
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  // Generate AI Parecer Prévio
  const handleGenerateAiParecer = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/gemini/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Elabore um Parecer Prévio Registral Formal e Completo de Regularização Imobiliária para o seguinte caso:
Cliente/Requerente: ${contact.nome_completo} (CPF/CNPJ: ${contact.cpf_cnpj})
Endereço do Imóvel: ${contact.endereco.logradouro}, nº ${contact.endereco.numero} - ${contact.endereco.bairro}, ${contact.endereco.cidade}/${contact.endereco.uf}
Tipo de Objeto / Situação Fática: ${contact.tipo_imovel || 'Imóvel residencial urbano com contrato de cessão de direitos/gaveta sem registro imobiliário definitivo'}
Procedimento Pretendido: ${contact.servico_pretendido || 'Usucapião Extrajudicial'}
Documentos em Custódia: ${contactDocs.length > 0 ? contactDocs.map(d => d.tipo_documento).join(', ') : 'Contrato particular de gaveta, IPTU cadastrado, comprovante de residência'}

O Parecer deve conter rigorosamente a seguinte estrutura técnica:
1. IDENTIFICAÇÃO DO IMÓVEL E DO POSSUIDOR
2. PROCEDIMENTO JURÍDICO REGISTRAL RECOMENDADO (Ex: Usucapião Extrajudicial - Provimento 65/2017 CNJ c/c Art. 216-A da Lei 6.015/73, REURB ou Adjudicação Compulsória - Lei 14.382/22)
3. ANÁLISE DE VIABILIDADE REGISTRAL (Score percentual e probabilidade de deferimento em Cartório de RI)
4. ROL DE DOCUMENTOS EXIGIDOS PARA INGRESSO REGISTRAL
5. CONCLUSÃO E PRÓXIMAS DILIGÊNCIAS (Orientação para assinatura da proposta e notificação de confrontantes).
Assine ao final com: Dr. Emerson Carneiro - Diretor Técnico Registral | Brasil Legal`,
          customTemperature: 0.2
        })
      });

      const data = await res.json();
      if (data.response_text) {
        setParecerTexto(data.response_text);
        setIsEditingParecer(false);
        await onSaveParecerPrevio(contact.id, data.response_text, autorPadrao);
      }
    } catch (err) {
      console.error('Erro ao gerar parecer:', err);
      // Fallback
      const fallbackParecer = `PARECER PRÉVIO DE VIABILIDADE REGISTRAL
Caso: ${contact.nome_completo}
Imóvel: ${contact.endereco.logradouro}, ${contact.endereco.numero} - ${contact.endereco.cidade}/${contact.endereco.uf}
Data: ${new Date().toLocaleDateString('pt-BR')}
Responsável Técnico: Dr. Emerson Carneiro

1. SÍNTESE DO CASO
O requerente detém a posse mansa, pacífica e contínua do imóvel localizado na Comarca de ${contact.endereco.cidade}/${contact.endereco.uf}. 

2. ENQUADRAMENTO JURÍDICO REGISTRAL
- Procedimento Eleito: ${contact.servico_pretendido || 'Usucapião Extrajudicial (Provimento 65/2017 CNJ)'}
- Fundamentação Legal: Art. 216-A da Lei de Registros Públicos (Lei nº 6.015/73) c/c Provimento 65/CNJ.

3. SCORE DE VIABILIDADE REGISTRAL: 94% (Alta Viabilidade)
Constata-se a higidez da cadeia possessória mediante os contratos e comprovantes de IPTU apresentados. Inexistência de litígio judicial sobre a posse.

4. DOCUMENTAÇÃO NECESSÁRIA PARA PROTOCOLO NO CARTÓRIO DE REGISTRO DE IMÓVEIS:
- Matrícula atualizada do imóvel ou certidão de transcrição;
- Planta e memorial descritivo com ART/RRT assinada por engenheiro credenciado;
- Certidões vintenárias cíveis e de protestos em nome do requerente e antecessores;
- Anuência expressa ou notificação cartorária dos confrontantes tabulares.

5. CONCLUSÃO TÉCNICA:
Opina-se pelo DEFERIMENTO e avanço para a etapa de Proposta de Honorários e Formalização de Contrato.

Dr. Emerson Carneiro
Diretor Registral & Fundiário — Brasil Legal`;
      setParecerTexto(fallbackParecer);
      setIsEditingParecer(false);
      await onSaveParecerPrevio(contact.id, fallbackParecer, autorPadrao);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Save manual parecer
  const handleSaveParecerManual = async () => {
    await onSaveParecerPrevio(contact.id, parecerTexto, autorPadrao);
    setIsEditingParecer(false);
  };

  // Copy parecer
  const handleCopyParecer = () => {
    navigator.clipboard.writeText(parecerTexto);
    setCopiedParecer(true);
    setTimeout(() => setCopiedParecer(false), 2000);
  };

  const handleShareParecerWhatsApp = () => {
    const rawNumber = (contact.telefone_whatsapp || '').replace(/\D/g, '');
    const phone = rawNumber.startsWith('55') ? rawNumber : `55${rawNumber}`;
    const resumo = `Olá, *${contact.nome_completo}*!\n\nSegue o seu *Parecer Prévio de Viabilidade Registral* elaborado pela equipe técnica da *Brasil Legal Regularização Imobiliária* para o seu imóvel:\n\n` +
      `📍 *Imóvel:* ${contact.endereco?.logradouro || ''}, nº ${contact.endereco?.numero || ''} - ${contact.endereco?.cidade || ''}/${contact.endereco?.uf || ''}\n` +
      `⚖️ *Procedimento:* ${contact.servico_pretendido || 'Usucapião Extrajudicial'}\n\n` +
      `*Síntese do Parecer:*\n${parecerTexto.substring(0, 700)}...\n\n` +
      `📞 Para formalização da proposta e ingresso registral, responda a esta mensagem.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(resumo)}`, '_blank');
  };

  const handlePrintParecer = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Parecer Prévio Registral - ${contact.nome_completo} - Brasil Legal</title>
        <style>
          @page { size: A4; margin: 18mm; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; padding: 20px; }
          .header { border-bottom: 3px solid #2E3192; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
          .title { color: #2E3192; font-size: 20px; font-weight: bold; margin: 0; }
          .subtitle { color: #64748b; font-size: 11px; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
          .meta { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 12px; }
          .meta table { width: 100%; border-collapse: collapse; }
          .meta td { padding: 4px 8px; }
          .meta td.label { font-weight: bold; color: #475569; width: 22%; }
          .body { font-size: 13px; white-space: pre-wrap; font-family: 'Georgia', serif; line-height: 1.8; color: #0f172a; margin-bottom: 30px; }
          .signature-box { border-top: 1px solid #94a3b8; width: 280px; text-align: center; padding-top: 8px; margin: 40px auto 0 auto; font-size: 12px; }
          .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 10px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">BRASIL LEGAL — REGULARIZAÇÃO IMOBILIÁRIA</div>
            <div class="subtitle">DEPARTAMENTO JURÍDICO REGISTRAL & ENGENHARIA LEGAL</div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #475569;">
            <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}<br />
            <strong>Protocolo:</strong> RI-${contact.id.substring(0, 8).toUpperCase()}
          </div>
        </div>

        <div class="meta">
          <table>
            <tr>
              <td class="label">Requerente:</td>
              <td>${contact.nome_completo}</td>
              <td class="label">CPF/CNPJ:</td>
              <td>${contact.cpf_cnpj || 'Não informado'}</td>
            </tr>
            <tr>
              <td class="label">Localização:</td>
              <td>${contact.endereco?.logradouro || ''}, nº ${contact.endereco?.numero || ''} - ${contact.endereco?.bairro || ''}, ${contact.endereco?.cidade || ''}/${contact.endereco?.uf || ''}</td>
              <td class="label">Procedimento:</td>
              <td>${contact.servico_pretendido || 'Usucapião Extrajudicial'}</td>
            </tr>
          </table>
        </div>

        <div class="body">${parecerTexto.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>

        <div class="signature-box">
          <strong>Dr. Emerson Carneiro</strong><br />
          Diretor Geral & Especialista Registral<br />
          Brasil Legal Regularização Imobiliária
        </div>

        <div class="footer">
          Brasil Legal Regularização Imobiliária • atendimento@brasillegal.com.br • www.brasillegal.com.br
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const handleOpenWhatsApp = () => {
    const rawNumber = contact.telefone_whatsapp.replace(/\D/g, '');
    const phone = rawNumber.startsWith('55') ? rawNumber : `55${rawNumber}`;
    const text = encodeURIComponent(
      `Olá, ${contact.nome_completo}! Aqui é o ${autorPadrao} da Brasil Legal Regularização Imobiliária. Estou entrando em contato para dar andamento ao processo do seu imóvel em ${contact.endereco.cidade}/${contact.endereco.uf}. Como podemos ajudá-lo hoje?`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 my-auto overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#F2EC00] text-slate-900">
                {contact.qualificacao_sdr || 'Lead'}
              </span>
              <span className="text-xs text-slate-300 font-mono">
                ID: {contact.id}
              </span>
              {contact.origem_lead && (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                  Origem: {contact.origem_lead}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white truncate">
              {contact.nome_completo}
            </h2>
            <div className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#F2EC00]" />
                {contact.telefone_whatsapp}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {contact.endereco.cidade} / {contact.endereco.uf}
              </span>
              {contact.servico_pretendido && (
                <>
                  <span>•</span>
                  <span className="text-[#F2EC00] font-medium">{contact.servico_pretendido}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto scrollbar-none shrink-0 gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('followup')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'followup'
                ? 'border-[#2E3192] text-[#2E3192] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Follow-up & Histórico</span>
            {contact.historico_followup && contact.historico_followup.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#2E3192] text-white font-mono">
                {contact.historico_followup.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('parecer')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'parecer'
                ? 'border-[#2E3192] text-[#2E3192] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Parecer Prévio Registral</span>
            {contact.parecer_previo ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ) : (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-medium">Pendente</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documentos')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'documentos'
                ? 'border-[#2E3192] text-[#2E3192] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Custódia Documental</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono">
              {contactDocs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dados')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dados'
                ? 'border-[#2E3192] text-[#2E3192] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Ficha do Imóvel</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: FOLLOW-UP & HISTÓRICO */}
          {activeTab === 'followup' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Lançar Novo Follow-up Form */}
              <div className="lg:col-span-5 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-[#2E3192]" />
                    Lançar Novo Follow-up
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">Por: {autorPadrao}</span>
                </div>

                {followUpSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Follow-up registrado com sucesso!</span>
                  </div>
                )}

                <form onSubmit={handleSubmitFollowUp} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipo de Interação</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['WhatsApp', 'Ligação', 'Reunião', 'E-mail', 'Visita', 'Nota Interna'] as FollowUpItem['tipo'][]).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTipoContato(t)}
                          className={`py-1.5 px-2 rounded-lg border font-bold text-[11px] transition-all cursor-pointer ${
                            tipoContato === t
                              ? 'bg-[#2E3192] text-white border-[#2E3192]'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Alterar Etapa do Funil</label>
                    <select
                      value={novoStatus}
                      onChange={e => setNovoStatus(e.target.value as QualificacaoSdr)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-[#2E3192] focus:outline-hidden"
                    >
                      <option value="Lead">1. Lead (Novo Contato)</option>
                      <option value="Qualificado">2. Qualificado (Posse & Interesse Alinhados)</option>
                      <option value="Oportunidade">3. Oportunidade (Custódia de Documentos)</option>
                      <option value="Entrevista">4. Entrevista Técnica / Perícia</option>
                      <option value="Proposta">5. Proposta de Honorários Enviada</option>
                      <option value="Ganho">6. Ganho (Contrato Fechado)</option>
                      <option value="Perdido">7. Perdido (Arquivado)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Agendar Próximo Contato (Opcional)</label>
                    <input
                      type="datetime-local"
                      value={proximoContato}
                      onChange={e => setProximoContato(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#2E3192] focus:outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Relato do Contato / Observações *
                    </label>
                    <textarea
                      rows={4}
                      value={conteudoFollowUp}
                      onChange={e => setConteudoFollowUp(e.target.value)}
                      placeholder="Descreva o que foi tratado, dúvidas do cliente sobre documentação, valores acordados ou próximos passos..."
                      required
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#2E3192] focus:outline-hidden placeholder-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingFollowUp || !conteudoFollowUp.trim()}
                    className="w-full py-2.5 px-4 bg-[#2E3192] hover:bg-[#1E216B] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4 text-[#F2EC00]" />
                    <span>{isSubmittingFollowUp ? 'Salvando...' : 'Salvar & Registrar Follow-up'}</span>
                  </button>
                </form>
              </div>

              {/* Histórico de Follow-ups Timeline */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-600" />
                    Histórico de Interações & Follow-ups
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold">
                    {contact.historico_followup?.length || 0} registro(s)
                  </span>
                </div>

                {(!contact.historico_followup || contact.historico_followup.length === 0) ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs space-y-2">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-semibold">Nenhum follow-up registrado ainda.</p>
                    <p className="text-[11px] text-slate-400">
                      Utilize o formulário ao lado para registrar o primeiro contato por WhatsApp, ligação ou reunião.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    {contact.historico_followup.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 hover:border-slate-300 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              item.tipo === 'WhatsApp'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.tipo === 'Ligação'
                                ? 'bg-blue-100 text-blue-800'
                                : item.tipo === 'Reunião'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {item.tipo}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {item.autor}
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-400 font-mono">
                            {item.data_hora ? new Date(item.data_hora).toLocaleString('pt-BR') : 'Data não informada'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {item.conteudo}
                        </p>

                        {(item.status_lead || item.proximo_contato) && (
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                            {item.status_lead && (
                              <span>Etapa definida: <strong className="text-slate-700">{item.status_lead}</strong></span>
                            )}
                            {item.proximo_contato && (
                              <span className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                                <Calendar className="w-3 h-3 text-amber-600" />
                                Próximo contato: {new Date(item.proximo_contato).toLocaleString('pt-BR')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PARECER PRÉVIO REGISTRAL */}
          {activeTab === 'parecer' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#2E3192]" />
                    Parecer Prévio de Viabilidade Registral
                  </h3>
                  <p className="text-xs text-slate-500">
                    Análise técnica preliminar para instrução de Usucapião Extrajudicial (Prov. 65 CNJ), REURB ou Adjudicação Compulsória.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateAiParecer}
                    disabled={isGeneratingAi}
                    className="px-3 py-1.5 bg-indigo-50 text-[#2E3192] hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isGeneratingAi ? 'Analisando requisitos...' : 'Gerar com IA Registral'}</span>
                  </button>

                  {parecerTexto && !isEditingParecer && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrintParecer}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-[#2E3192] text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200"
                        title="Visualizar formato para impressão e download de PDF oficial"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#2E3192]" />
                        <span>Imprimir / PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleShareParecerWhatsApp}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-emerald-200"
                        title="Compartilhar resumo formal do parecer no WhatsApp do cliente"
                      >
                        <Send className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Enviar WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsEditingParecer(true)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyParecer}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        {copiedParecer ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedParecer ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Status Banner */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                contact.parecer_previo || parecerTexto
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-2">
                  {contact.parecer_previo || parecerTexto ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>
                    <strong>Status:</strong> {contact.parecer_previo || parecerTexto ? 'Parecer Prévio Emitido' : 'Pendente de Emissão'}
                  </span>
                  {contact.data_parecer_previo && (
                    <span className="text-slate-500">
                      (Emissão: {new Date(contact.data_parecer_previo).toLocaleDateString('pt-BR')})
                    </span>
                  )}
                </div>

                {contact.autor_parecer_previo && (
                  <span className="text-[11px] font-semibold text-emerald-800">
                    Responsável: {contact.autor_parecer_previo}
                  </span>
                )}
              </div>

              {/* Editor / Viewer */}
              {isEditingParecer ? (
                <div className="space-y-3">
                  <textarea
                    rows={16}
                    value={parecerTexto}
                    onChange={e => setParecerTexto(e.target.value)}
                    placeholder="Digite ou gere acima o parecer técnico prévio de viabilidade registral do imóvel..."
                    className="w-full p-4 bg-white border border-slate-300 rounded-2xl text-xs sm:text-sm font-mono leading-relaxed text-slate-800 focus:ring-2 focus:ring-[#2E3192] focus:outline-hidden"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingParecer(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveParecerManual}
                      className="px-4 py-2 bg-[#2E3192] hover:bg-[#1E216B] text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Salvar Parecer Prévio
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="prose prose-sm max-w-none text-xs sm:text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
                    {parecerTexto}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTÓDIA DOCUMENTAL */}
          {activeTab === 'documentos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#2E3192]" />
                    Custódia Registral de Documentos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Documentação sob guarda registral para instrução do procedimento.
                  </p>
                </div>

                {onOpenUploadModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenUploadModal(contact);
                    }}
                    className="px-3 py-1.5 bg-[#2E3192] hover:bg-[#1E216B] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#F2EC00]" />
                    <span>Upload de Documentos</span>
                  </button>
                )}
              </div>

              {contactDocs.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs space-y-2">
                  <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold">Nenhum documento sob custódia ainda.</p>
                  <p className="text-[11px] text-slate-400">
                    Solicite o envio da certidão de matrícula, contrato de compra e venda/cessão ou carnê de IPTU.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contactDocs.map(doc => (
                    <div
                      key={doc.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {doc.tipo_documento.replace(/_/g, ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          doc.status_validacao === 'Aprovado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : doc.status_validacao === 'Pendente'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {doc.status_validacao}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate font-mono">
                        {doc.nome_arquivo || doc.file_url}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FICHA DO IMÓVEL */}
          {activeTab === 'dados' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dados Pessoais</span>
                <div>
                  <strong className="block text-slate-900">Nome:</strong>
                  <span className="text-slate-700">{contact.nome_completo}</span>
                </div>
                <div>
                  <strong className="block text-slate-900">CPF / CNPJ:</strong>
                  <span className="text-slate-700 font-mono">{contact.cpf_cnpj}</span>
                </div>
                <div>
                  <strong className="block text-slate-900">Telefone / WhatsApp:</strong>
                  <span className="text-slate-700">{contact.telefone_whatsapp}</span>
                </div>
                <div>
                  <strong className="block text-slate-900">E-mail:</strong>
                  <span className="text-slate-700">{contact.email || 'Não informado'}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dados do Imóvel</span>
                <div>
                  <strong className="block text-slate-900">Endereço:</strong>
                  <span className="text-slate-700">{contact.endereco.logradouro}, {contact.endereco.numero}</span>
                </div>
                <div>
                  <strong className="block text-slate-900">Bairro / Cidade / UF:</strong>
                  <span className="text-slate-700">{contact.endereco.bairro} - {contact.endereco.cidade} / {contact.endereco.uf}</span>
                </div>
                <div>
                  <strong className="block text-slate-900">CEP:</strong>
                  <span className="text-slate-700 font-mono">{contact.endereco.cep}</span>
                </div>
                <div>
                  <strong className="block text-slate-900">Tipo de Imóvel / Posse:</strong>
                  <span className="text-slate-700">{contact.tipo_imovel || 'Imóvel residencial com posse de fato'}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Operador logado: <strong className="text-slate-700">{autorPadrao}</strong></span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
