import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSignature, 
  Sparkles, 
  Send, 
  User, 
  DollarSign, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Users, 
  Smartphone, 
  Mail,
  ShieldAlert
} from 'lucide-react';
import { 
  Contact, 
  Deal, 
  AppSettings, 
  TipoContratoTemplate, 
  ContratoAssinatura, 
  Signatario,
  ProvedorAssinatura 
} from '../types';
import { generateContractText, generateSha256 } from '../utils/contractTemplates';

interface ModalNovoContratoAssinaturaProps {
  contacts: Contact[];
  deals: Deal[];
  appSettings: AppSettings;
  defaultContactId?: string;
  onClose: () => void;
  onCriarContrato: (novoContrato: ContratoAssinatura) => void;
}

export const ModalNovoContratoAssinatura: React.FC<ModalNovoContratoAssinaturaProps> = ({
  contacts,
  deals,
  appSettings,
  defaultContactId,
  onClose,
  onCriarContrato
}) => {
  const [template, setTemplate] = useState<TipoContratoTemplate>('PRESTACAO_SERVICOS_REURB');
  const [selectedContactId, setSelectedContactId] = useState<string>(
    defaultContactId || contacts[0]?.id || ''
  );
  const [selectedDealId, setSelectedDealId] = useState<string>(deals[0]?.id || '');
  
  // Custom contract terms
  const [valorHonorarios, setValorHonorarios] = useState<number>(18500);
  const [condicoesPagamento, setCondicoesPagamento] = useState<string>(
    'Entrada de 30% via Pix na assinatura e saldo em 10 parcelas mensais via boleto bancário.'
  );
  const [objetoImovel, setObjetoImovel] = useState<string>('');
  const [prazoMeses, setPrazoMeses] = useState<number>(6);

  // Dispatch options
  const [notificarWhatsapp, setNotificarWhatsapp] = useState(true);
  const [notificarEmail, setNotificarEmail] = useState(true);
  const [incluirTestemunhas, setIncluirTestemunhas] = useState(true);
  const [provedor, setProvedor] = useState<ProvedorAssinatura>('Brasil Legal e-Sign');

  // Preview generated text
  const [contractPreview, setContractPreview] = useState<{ titulo: string; conteudo: string }>({ titulo: '', conteudo: '' });

  const currentContact = contacts.find(c => c.id === selectedContactId) || contacts[0];
  const currentDeal = deals.find(d => d.id === selectedDealId);

  // When contact or deal changes, update default values
  useEffect(() => {
    if (currentContact) {
      if (currentContact.valor_estimado) {
        setValorHonorarios(currentContact.valor_estimado);
      }
      if (currentContact.tipo_imovel) {
        setObjetoImovel(`Imóvel tipo ${currentContact.tipo_imovel} - Comarca de ${currentContact.endereco?.cidade || 'São Paulo'}/${currentContact.endereco?.uf || 'SP'}`);
      }
    }
  }, [selectedContactId]);

  useEffect(() => {
    if (currentDeal) {
      if (currentDeal.valor_honorarios_liquido) {
        setValorHonorarios(currentDeal.valor_honorarios_liquido);
      }
      if (currentDeal.titulo) {
        setObjetoImovel(currentDeal.titulo);
      }
    }
  }, [selectedDealId]);

  // Regenerate contract preview whenever inputs change
  useEffect(() => {
    if (!currentContact) return;
    const generated = generateContractText(
      template,
      currentContact,
      currentDeal,
      appSettings,
      {
        valor: valorHonorarios,
        condicoes: condicoesPagamento,
        objeto: objetoImovel || undefined,
        prazoMeses
      }
    );
    setContractPreview(generated);
  }, [template, selectedContactId, selectedDealId, valorHonorarios, condicoesPagamento, objetoImovel, prazoMeses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentContact) return;

    const contractId = `CTR-${new Date().getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;
    const tokenVerificacao = `BL-SIGN-${Math.floor(100000 + Math.random() * 900000)}-VALID`;
    const nowIso = new Date().toISOString();
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 30);

    const signatarios: Signatario[] = [
      {
        id: `sig-${Date.now()}-1`,
        nome: currentContact.nome_completo,
        email: currentContact.email || 'cliente@email.com.br',
        telefone_whatsapp: currentContact.telefone_whatsapp,
        cpf: currentContact.cpf_cnpj,
        papel: 'Contratante',
        status: 'Pendente'
      },
      {
        id: `sig-${Date.now()}-2`,
        nome: 'Dr. Roberto Carneiro — Diretor Jurídico',
        email: 'diretoria@brasillegalimoveis.com.br',
        telefone_whatsapp: '(11) 98765-4321',
        cpf: '042.819.330-91',
        papel: 'Contratada',
        status: 'Pendente'
      }
    ];

    if (incluirTestemunhas) {
      signatarios.push({
        id: `sig-${Date.now()}-3`,
        nome: 'Fernanda Lima (Testemunha 1)',
        email: 'fernanda.lima@brasillegalimoveis.com.br',
        telefone_whatsapp: '(11) 99112-4455',
        cpf: '320.198.441-20',
        papel: 'Testemunha 1',
        status: 'Pendente'
      });
    }

    const shaOriginal = generateSha256(contractPreview.conteudo, contractId);

    const novoContrato: ContratoAssinatura = {
      id: contractId,
      titulo: contractPreview.titulo,
      template_tipo: template,
      contact_id: currentContact.id,
      contact_nome: currentContact.nome_completo,
      contact_cpf_cnpj: currentContact.cpf_cnpj,
      contact_email: currentContact.email,
      contact_telefone: currentContact.telefone_whatsapp,
      deal_id: currentDeal?.id,
      deal_titulo: currentDeal?.titulo,
      status: 'Aguardando Assinaturas',
      data_criacao: nowIso,
      data_expiracao: expDate.toISOString(),
      valor_contrato: valorHonorarios,
      condicoes_pagamento: condicoesPagamento,
      objeto_imovel: objetoImovel,
      conteudo_contrato: contractPreview.conteudo,
      hash_sha256_original: shaOriginal,
      token_verificacao: tokenVerificacao,
      link_assinatura_publico: `https://brasillegalimoveis.com.br/assinar/sec_${contractId.toLowerCase()}`,
      provedor_assinatura: provedor,
      signatarios,
      audit_trail: [
        {
          id: `aud-${Date.now()}-01`,
          data_hora: nowIso,
          evento: 'Envelope de Assinatura Criado',
          autor: 'Sistema Brasil Legal / Automação de Contratos',
          ip: '187.54.12.9',
          geolocalizacao: 'São Paulo, SP - Brasil',
          dispositivo: 'Web App Desktop — Protocolo Digital',
          detalhes: `Contrato do tipo ${template} gerado com variáveis dinâmicas vinculadas ao cliente ${currentContact.nome_completo}.`,
          hash_integridade: shaOriginal
        },
        ...(notificarWhatsapp ? [{
          id: `aud-${Date.now()}-02`,
          data_hora: new Date(Date.now() + 2000).toISOString(),
          evento: 'Link de Assinatura Disparado via WhatsApp',
          autor: 'WhatsApp Gateway Bot',
          ip: '10.0.0.12',
          geolocalizacao: 'São Paulo, SP',
          dispositivo: 'API WhatsApp Business',
          detalhes: `Mensagem com link seguro enviada para o número ${currentContact.telefone_whatsapp}.`
        }] : []),
        ...(notificarEmail && currentContact.email ? [{
          id: `aud-${Date.now()}-03`,
          data_hora: new Date(Date.now() + 3000).toISOString(),
          evento: 'Notificação Enviada por E-mail',
          autor: 'SMTP / SendGrid Mailer',
          ip: '10.0.0.12',
          geolocalizacao: 'São Paulo, SP',
          dispositivo: 'Email Gateway',
          detalhes: `Convite de assinatura encaminhado para ${currentContact.email}.`
        }] : [])
      ],
      metadados_juridicos: {
        base_legal: 'Lei Federal nº 14.063/2020 e Medida Provisória nº 2.200-2/2001',
        carimbo_tempo: `${nowIso} — Observatório Nacional / ACT`,
        certificado_id: `CERT-ICP-BR-${Date.now()}`
      }
    };

    onCriarContrato(novoContrato);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/30">
              <FileSignature className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Gerar Contrato para Assinatura Digital</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Automação Jurídica
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Preenchimento automático de cláusulas com dados do CRM, cálculo de honorários e envio multicanal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Model Selection */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-2">
              1. Selecione o Modelo Jurídico do Documento
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'PRESTACAO_SERVICOS_REURB' as TipoContratoTemplate,
                  title: 'Regularização Imobiliária (REURB)',
                  desc: 'Lei 13.465/2017 — Reurb-S ou Reurb-E'
                },
                {
                  id: 'USUCAPIAO_EXTRAJUDICIAL' as TipoContratoTemplate,
                  title: 'Usucapião Extrajudicial',
                  desc: 'Provimento 65/CNJ e Art. 216-A LRP'
                },
                {
                  id: 'PROCURACAO_AD_NEGOTIA' as TipoContratoTemplate,
                  title: 'Procuração Ad Negotia Notarial',
                  desc: 'Poderes para Cartórios de RI e Notas'
                },
                {
                  id: 'DECLARACAO_POSSE_MANSA' as TipoContratoTemplate,
                  title: 'Declaração de Posse Mansa',
                  desc: 'Justo título e confrontações fáticas'
                },
                {
                  id: 'TERMO_CONFIDENCIALIDADE_LGPD' as TipoContratoTemplate,
                  title: 'Termo de Custódia e LGPD',
                  desc: 'Sigilo e proteção de certidões e RG/CPF'
                }
              ].map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setTemplate(item.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    template === item.id
                      ? 'border-blue-700 bg-blue-50/70 ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs text-slate-900 block">{item.title}</span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Client and Deal Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                2. Cliente / Contratante (do CRM)
              </label>
              <select
                value={selectedContactId}
                onChange={(e) => setSelectedContactId(e.target.value)}
                className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome_completo} ({c.cpf_cnpj}) — {c.telefone_whatsapp}
                  </option>
                ))}
              </select>
              {currentContact && (
                <div className="mt-1.5 p-2 bg-slate-100/70 rounded-lg text-[11px] text-slate-600 flex items-center justify-between">
                  <span>WhatsApp: <strong>{currentContact.telefone_whatsapp}</strong></span>
                  <span>E-mail: <strong>{currentContact.email || 'Não informado'}</strong></span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Processo / Negócio Vinculado
              </label>
              <select
                value={selectedDealId}
                onChange={(e) => setSelectedDealId(e.target.value)}
                className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value="">-- Sem vínculo direto a processo --</option>
                {deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.titulo} ({d.cartorio_comarca}) — R$ {d.valor_honorarios_liquido.toLocaleString('pt-BR')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 3: Financial & Property Terms */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Valor dos Honorários (R$)
              </label>
              <input
                type="number"
                value={valorHonorarios}
                onChange={(e) => setValorHonorarios(Number(e.target.value))}
                className="w-full p-2.5 text-xs font-bold text-slate-800 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Prazo Estimado (Meses)
              </label>
              <input
                type="number"
                value={prazoMeses}
                onChange={(e) => setPrazoMeses(Number(e.target.value))}
                className="w-full p-2.5 text-xs font-medium text-slate-800 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Provedor de Assinatura
              </label>
              <select
                value={provedor}
                onChange={(e) => setProvedor(e.target.value as ProvedorAssinatura)}
                className="w-full p-2.5 text-xs font-semibold text-slate-800 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Brasil Legal e-Sign">Brasil Legal e-Sign (Nativo / MP 2.200)</option>
                <option value="Clicksign">Clicksign API</option>
                <option value="DocuSign">DocuSign eSignature</option>
                <option value="ZapSign">ZapSign Webhook</option>
                <option value="D4Sign">D4Sign SafeWeb</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Condições de Pagamento e Parcelamento
            </label>
            <input
              type="text"
              value={condicoesPagamento}
              onChange={(e) => setCondicoesPagamento(e.target.value)}
              className="w-full p-2.5 text-xs text-slate-800 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 30% de entrada via Pix e 10 parcelas mensais via boleto"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
              Objeto / Imóvel a Regularizar
            </label>
            <input
              type="text"
              value={objetoImovel}
              onChange={(e) => setObjetoImovel(e.target.value)}
              className="w-full p-2.5 text-xs text-slate-800 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
              placeholder="Descrição completa do lote, gleba, confrontações ou endereço"
            />
          </div>

          {/* Dispatch Channels & Signers Options */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Notificação e Quadro de Signatários Automáticos
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificarWhatsapp}
                  onChange={(e) => setNotificarWhatsapp(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  Notificar via WhatsApp
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificarEmail}
                  onChange={(e) => setNotificarEmail(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  Notificar via E-mail
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirTestemunhas}
                  onChange={(e) => setIncluirTestemunhas(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Incluir Testemunhas Brasil Legal</span>
              </label>
            </div>
          </div>

          {/* Live Preview Accordion */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 p-3 flex items-center justify-between border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Prévia do Instrumento Contratual com Variáveis Inseridas
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {contractPreview.conteudo.length} caracteres
              </span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-700 bg-white max-h-52 overflow-y-auto whitespace-pre-wrap leading-relaxed border-0">
              {contractPreview.conteudo}
            </pre>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Envelope será autenticado com hash SHA-256 e selo MP 2.200-2/2001.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              Gerar & Enviar para Assinatura
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
