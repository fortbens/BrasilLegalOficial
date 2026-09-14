import React, { useState } from 'react';
import { Contact, Deal, Usuario } from '../types';
import { 
  Award, 
  DollarSign, 
  Users, 
  Copy, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  FileText, 
  ShieldCheck, 
  UserPlus,
  Share2,
  Globe,
  MessageCircle,
  Sparkles,
  Gift
} from 'lucide-react';

interface PainelParceiroB2BProps {
  currentUser: Usuario;
  contacts: Contact[];
  deals: Deal[];
  onOpenNovoLeadModal: () => void;
  onVisualizarSite?: () => void;
}

export const PainelParceiroB2B: React.FC<PainelParceiroB2BProps> = ({
  currentUser,
  contacts,
  deals,
  onOpenNovoLeadModal,
  onVisualizarSite
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSiteUrl, setCopiedSiteUrl] = useState(false);
  const [copiedMensagem, setCopiedMensagem] = useState(false);

  const partnerCode = currentUser.parceiro_id || 'PARC-B2B-88';
  
  // Obter a URL de origem pública do ambiente atual
  const publicBaseUrl = typeof window !== 'undefined' && window.location.origin 
    ? window.location.origin 
    : 'https://brasillegalimoveis.com.br';

  const partnerLink = `${publicBaseUrl}/?ref=${encodeURIComponent(partnerCode)}`;
  const cleanSiteUrl = `${publicBaseUrl}/`;

  const mensagemPronta = `Olá! Se você tem um imóvel sem escritura definitiva, posse antiga, contrato de gaveta ou pendência em cartório, recomendo a Brasil Legal Regularização Imobiliária. Eles oferecem análise técnica e jurídica gratuita de viabilidade registral. Faça seu diagnóstico online pelo link: ${partnerLink}`;

  // Filter ONLY deals and contacts that belong to this partner
  const myContacts = contacts.filter(c => c.indicador_id === partnerCode);
  const myDeals = deals.filter(d => d.parceiro_id === partnerCode);

  const totalComissoes = myDeals.reduce((acc, d) => acc + (d.comissao_b2b_valor || 0), 0);
  const totalRecebidas = myDeals
    .filter(d => d.comissao_paga)
    .reduce((acc, d) => acc + (d.comissao_b2b_valor || 0), 0);
  const totalEmAndamento = myDeals
    .filter(d => !d.comissao_paga)
    .reduce((acc, d) => acc + (d.comissao_b2b_valor || 0), 0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(partnerLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopySiteUrl = () => {
    navigator.clipboard.writeText(cleanSiteUrl);
    setCopiedSiteUrl(true);
    setTimeout(() => setCopiedSiteUrl(false), 2500);
  };

  const handleCopyMensagem = () => {
    navigator.clipboard.writeText(mensagemPronta);
    setCopiedMensagem(true);
    setTimeout(() => setCopiedMensagem(false), 2500);
  };

  const handleOpenWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagemPronta)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAbrirSite = () => {
    if (onVisualizarSite) {
      onVisualizarSite();
    } else if (typeof window !== 'undefined') {
      window.location.href = partnerLink;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Partner */}
      <div className="bg-gradient-to-r from-[#2E3192] to-[#1C1E63] text-white rounded-2xl p-6 shadow-md border-b-4 border-[#F2EC00]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#F2EC00] text-[#2E3192] text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
                Portal Parceiro B2B
              </span>
              <span className="text-xs text-white/80 font-medium">
                Código Exclusivo: <strong className="text-white font-mono">{partnerCode}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-bold font-display mt-1 text-white">
              Programa Indique e Ganhe — Brasil Legal
            </h1>
            <p className="text-xs text-white/85 max-w-2xl mt-1">
              Monitore seus clientes indicados, o andamento da regularização registral em cartório e o extrato de comissionamento de 5% sobre honorários líquidos contratuais.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleAbrirSite}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-lg border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Abrir a página pública do site oficial"
            >
              <Globe className="w-3.5 h-3.5 text-[#F2EC00]" />
              Ver Site Oficial
            </button>

            <button
              onClick={onOpenNovoLeadModal}
              className="px-4 py-2 bg-[#F2EC00] hover:bg-[#D6D000] text-[#2E3192] text-xs font-bold rounded-lg shadow transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Indicar Novo Imóvel / Cliente
            </button>
          </div>
        </div>

        {/* Shareable Link Box & Public URL Controls */}
        <div className="mt-5 space-y-3 bg-white/10 p-4 rounded-xl border border-white/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs min-w-0">
              <Share2 className="w-4 h-4 text-[#F2EC00] shrink-0" />
              <span className="text-white/80 font-medium shrink-0">Seu Link Público de Divulgação:</span>
              <span className="font-mono text-white bg-black/30 px-2 py-1 rounded text-[11px] truncate select-all border border-white/10">
                {partnerLink}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-white text-[#2E3192] hover:bg-slate-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Link Copiado!' : 'Copiar Link de Divulgação'}
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsAppShare}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Compartilhar link pelo WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Divulgar no WhatsApp
              </button>

              <button
                type="button"
                onClick={handleAbrirSite}
                className="px-3 py-1.5 bg-black/30 hover:bg-black/40 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
                title="Visualizar a página de vendas como o cliente verá"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#F2EC00]" />
                Testar Link
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-2 text-[11px] text-white/70">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F2EC00] shrink-0" />
              <span>
                Quando o cliente acessar pelo seu link, o cadastro entra com o código <strong>{partnerCode}</strong> e comissão de 5% a 10% vinculada a você.
              </span>
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyMensagem}
                className="text-white hover:text-[#F2EC00] font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
              >
                {copiedMensagem ? 'Mensagem Copiada!' : 'Copiar Mensagem Pronta'}
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleCopySiteUrl}
                className="text-white hover:text-[#F2EC00] font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                title="Copiar URL geral sem código"
              >
                {copiedSiteUrl ? 'URL Copiada!' : 'Copiar URL Principal do Site'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards for Partner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Imóveis Indicados</span>
            <Users className="w-4 h-4 text-[#2E3192]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {myContacts.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {myDeals.length} convertidos em contratos
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Comissões a Receber (Em Andamento)</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            R$ {totalEmAndamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            5% em fase de regularização / cartório
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Comissões Já Recebidas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            R$ {totalRecebidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Liquidadas via PIX/Transferência
          </div>
        </div>
      </div>

      {/* Extrato Restrito de Comissões e Processos */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#2E3192]" />
            Extrato Detalhado de Comissões (Visão do Parceiro)
          </h3>
          <p className="text-xs text-slate-500">
            Acompanhamento transparente das indicações vinculadas ao código <strong>{partnerCode}</strong>.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Cliente Indicado</th>
                <th className="px-4 py-3">Procedimento</th>
                <th className="px-4 py-3">Cartório / Órgão</th>
                <th className="px-4 py-3">Fase do Processo</th>
                <th className="px-4 py-3">Honorários Contratuais</th>
                <th className="px-4 py-3">Sua Comissão (5%)</th>
                <th className="px-4 py-3 text-right">Status do Repasse</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myDeals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                    Nenhum negócio faturado ainda para seu código de parceiro.
                  </td>
                </tr>
              ) : (
                myDeals.map(deal => {
                  const contact = contacts.find(c => c.id === deal.contact_id);

                  return (
                    <tr key={deal.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">
                          {contact ? contact.nome_completo : 'Cliente Indicado'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {contact?.endereco.cidade}/{contact?.endereco.uf}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800">{deal.tipo_procedimento}</span>
                        <div className="text-[10px] text-slate-500">{deal.titulo}</div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-600">
                        {deal.cartorio_comarca}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#2E3192] border border-blue-200">
                          {deal.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        R$ {deal.valor_honorarios_liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-[#2E3192]">
                        R$ {deal.comissao_b2b_valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        <span className="text-[10px] text-slate-400 font-normal block">(5% líquido)</span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        {deal.comissao_paga ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Pago
                          </span>
                        ) : deal.homologado_diretoria ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                            <Clock className="w-3 h-3 text-blue-600" />
                            Liberado para Pagamento
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Em Regularização
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
