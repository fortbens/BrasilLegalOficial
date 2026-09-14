import React, { useState } from 'react';
import { MetaAdsConfig, MetaAdsCampaign, Contact, AppSettings } from '../types';
import { 
  Megaphone, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Sparkles, 
  Smartphone, 
  Share2, 
  CheckCircle2, 
  Plus, 
  Play, 
  Pause, 
  ExternalLink, 
  Copy, 
  Sliders, 
  ShieldCheck, 
  Send,
  Eye,
  MessageSquare,
  RefreshCw,
  HelpCircle,
  Instagram,
  Facebook,
  AlertCircle
} from 'lucide-react';

interface ModuloMetaAdsProps {
  metaConfig: MetaAdsConfig;
  onSaveConfig: (novaConfig: MetaAdsConfig) => void;
  onSimularLeadMeta: (leadData: Partial<Contact>) => void;
  appSettings?: AppSettings;
}

export const ModuloMetaAds: React.FC<ModuloMetaAdsProps> = ({
  metaConfig,
  onSaveConfig,
  onSimularLeadMeta,
  appSettings
}) => {
  const [configState, setConfigState] = useState<MetaAdsConfig>(metaConfig);
  const [activeTab, setActiveTab] = useState<'campanhas' | 'criativos' | 'integracao'>('campanhas');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(configState.campanhas[0]?.id || '');
  const [previewChannel, setPreviewChannel] = useState<'Instagram' | 'Facebook'>('Instagram');
  const [copiedPixel, setCopiedPixel] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSimulatingLead, setIsSimulatingLead] = useState(false);

  // New Campaign Modal
  const [showNovaCampanhaModal, setShowNovaCampanhaModal] = useState(false);
  const [novaCampanhaNome, setNovaCampanhaNome] = useState('');
  const [novaCampanhaOrcamento, setNovaCampanhaOrcamento] = useState('120.00');
  const [novaCampanhaCanal, setNovaCampanhaCanal] = useState<'Instagram' | 'Facebook' | 'Ambos'>('Ambos');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const selectedCampaign = configState.campanhas.find(c => c.id === selectedCampaignId) || configState.campanhas[0];

  // Totals
  const totalGasto = configState.campanhas.reduce((acc, c) => acc + c.gasto_total, 0);
  const totalLeads = configState.campanhas.reduce((acc, c) => acc + c.leads_gerados, 0);
  const totalImpressoes = configState.campanhas.reduce((acc, c) => acc + c.impressoes, 0);
  const totalCliques = configState.campanhas.reduce((acc, c) => acc + c.cliques, 0);
  const avgCpl = totalLeads > 0 ? (totalGasto / totalLeads) : 0;
  const avgCtr = totalImpressoes > 0 ? ((totalCliques / totalImpressoes) * 100) : 0;

  const handleToggleStatus = (campanhaId: string) => {
    const updated = {
      ...configState,
      campanhas: configState.campanhas.map(c => {
        if (c.id !== campanhaId) return c;
        const newStatus = c.status === 'ACTIVE' ? ('PAUSED' as const) : ('ACTIVE' as const);
        return { ...c, status: newStatus };
      })
    };
    setConfigState(updated);
    onSaveConfig(updated);
    showToast(`Status da campanha atualizado com sucesso no Meta Ads Manager!`);
  };

  const handleUpdateOrcamento = (campanhaId: string, novoValor: number) => {
    const updated = {
      ...configState,
      campanhas: configState.campanhas.map(c => {
        if (c.id !== campanhaId) return c;
        return { ...c, orcamento_diario: novoValor };
      })
    };
    setConfigState(updated);
    onSaveConfig(updated);
    showToast(`Orçamento diário atualizado para R$ ${novoValor.toFixed(2)}/dia!`);
  };

  const handleCriarCampanha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCampanhaNome.trim()) return;

    const nova: MetaAdsCampaign = {
      id: `cmp-meta-${Date.now().toString().slice(-4)}`,
      nome: novaCampanhaNome,
      objetivo: 'LEADS',
      status: 'ACTIVE',
      orcamento_diario: parseFloat(novaCampanhaOrcamento) || 100,
      gasto_total: 0,
      impressoes: 0,
      cliques: 0,
      leads_gerados: 0,
      cpl: 0,
      ctr: 0,
      roas: 0,
      publico_alvo: 'Proprietários de Imóveis, Famílias, Compradores de Loteamento',
      canal: novaCampanhaCanal,
      criativo_preview: {
        titulo: 'Regularize seu Imóvel sem Ação Judicial Demorada',
        texto_principal: 'Conquiste a escritura registrada direto no Cartório de Registro de Imóveis. Análise preliminar em 4 minutos com advogados e agrimensores da Brasil Legal.',
        imagem_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        cta: 'Cadastre-se para Análise Gratuita',
        form_nome: `Form_${novaCampanhaNome.replace(/\s+/g, '_')}`
      }
    };

    const updated = {
      ...configState,
      campanhas: [nova, ...configState.campanhas]
    };
    setConfigState(updated);
    onSaveConfig(updated);
    setSelectedCampaignId(nova.id);
    setShowNovaCampanhaModal(false);
    setNovaCampanhaNome('');
    showToast('Nova campanha criada e sincronizada com Meta Ads Manager!');
  };

  const handleSimularLead = () => {
    setIsSimulatingLead(true);
    const mockNames = [
      'Valdemar Antunes Ribeiro',
      'Rosana de Souza Mendonça',
      'José Carlos Fagundes',
      'Luciana Brandão Alencar',
      'Geraldo Peixoto de Vasconcelos'
    ];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const randomPhone = `(11) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomCpf = `${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}-${Math.floor(10 + Math.random() * 89)}`;

    setTimeout(() => {
      onSimularLeadMeta({
        nome_completo: randomName,
        cpf_cnpj: randomCpf,
        telefone_whatsapp: randomPhone,
        origem_lead: 'Meta Ads',
        qualificacao_sdr: 'Lead',
        tipo_imovel: `Imóvel via ${selectedCampaign.nome}`,
        servico_pretendido: selectedCampaign.nome.includes('REURB') ? 'REURB Urbana' : 'Usucapião Extrajudicial',
        observacoes: `Lead capturado instantaneamente via Meta Lead Ads (${previewChannel}). Campanha: ${selectedCampaign.nome}. Formulário: ${selectedCampaign.criativo_preview.form_nome}. Aguardando 1º contato (SLA < 4 min).`
      });

      // Update lead count on current campaign
      const updated = {
        ...configState,
        campanhas: configState.campanhas.map(c => {
          if (c.id !== selectedCampaign.id) return c;
          const leads = c.leads_gerados + 1;
          const cpl = leads > 0 ? (c.gasto_total / leads) : c.cpl;
          return { ...c, leads_gerados: leads, cpl: Math.round(cpl * 100) / 100 };
        })
      };
      setConfigState(updated);
      onSaveConfig(updated);
      setIsSimulatingLead(false);
      showToast(`🎯 Sucesso! Lead "${randomName}" capturado do Meta Ads e inserido no Funil Comercial (SDR)!`);
    }, 600);
  };

  const copyToClipboard = (text: string, type: 'pixel' | 'webhook') => {
    navigator.clipboard.writeText(text);
    if (type === 'pixel') {
      setCopiedPixel(true);
      setTimeout(() => setCopiedPixel(false), 2500);
    } else {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2E3192] text-white px-4 py-3 rounded-xl shadow-2xl border-2 border-[#F2EC00] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-[#F2EC00] shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              Meta Ads Suite • Facebook & Instagram
            </span>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Graph API v20.0 Conectada
            </span>
            <span className="bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Captura Automática no Funil (SDR)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Campanhas de Tráfego Pago & Captação de Leads Imobiliários
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie campanhas de regularização fundiária no Instagram e Facebook, simule criativos de alta conversão e sincronize leads diretamente com a esteira comercial.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowNovaCampanhaModal(true)}
            className="px-4 py-2.5 bg-[#2E3192] hover:bg-[#1E216B] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 border-b-2 border-[#F2EC00] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F2EC00]" />
            Nova Campanha Meta
          </button>
        </div>
      </div>

      {/* KPI Performance Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
            <span>Total Investido</span>
            <DollarSign className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
            R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Orçamento sob controle</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
            <span>Leads Gerados</span>
            <Users className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-base sm:text-lg font-extrabold text-emerald-700 mt-1">
            {totalLeads}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Captura Instantânea</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
            <span>Custo Médio / Lead (CPL)</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-base sm:text-lg font-extrabold text-indigo-700 mt-1">
            R$ {avgCpl.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">-14% vs. média do setor</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
            <span>Impressões</span>
            <Eye className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
            {totalImpressoes.toLocaleString('pt-BR')}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Alcance qualificado</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
            <span>CTR Médio</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-base sm:text-lg font-extrabold text-purple-700 mt-1">
            {avgCtr.toFixed(2)}%
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Alta atratividade</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-between">
            <span>ROAS Estimado</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-base sm:text-lg font-extrabold text-emerald-700 mt-1">
            7.1x
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Retorno expressivo</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-2 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('campanhas')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'campanhas'
              ? 'bg-[#2E3192] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Campanhas Ativas & Orçamentos ({configState.campanhas.length})
        </button>

        <button
          onClick={() => setActiveTab('criativos')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'criativos'
              ? 'bg-[#2E3192] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Smartphone className="w-4 h-4 text-amber-400" />
          Simulador de Criativos (Instagram & Facebook)
        </button>

        <button
          onClick={() => setActiveTab('integracao')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'integracao'
              ? 'bg-[#2E3192] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Pixel, Webhook & Conversões CAPI
        </button>
      </div>

      {/* TAB 1: Campanhas */}
      {activeTab === 'campanhas' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 min-w-[760px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Campanha / Canal</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Orçamento Diário</th>
                    <th className="py-3.5 px-3">Leads Gerados</th>
                    <th className="py-3.5 px-3">Custo / Lead (CPL)</th>
                    <th className="py-3.5 px-3">Gasto Total</th>
                    <th className="py-3.5 px-3">ROAS</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {configState.campanhas.map(campanha => {
                    const isActive = campanha.status === 'ACTIVE';
                    return (
                      <tr 
                        key={campanha.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          selectedCampaignId === campanha.id ? 'bg-indigo-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                            {campanha.canal === 'Instagram' && <Instagram className="w-3.5 h-3.5 text-pink-600 shrink-0" />}
                            {campanha.canal === 'Facebook' && <Facebook className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                            {campanha.canal === 'Ambos' && <Share2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                            <span>{campanha.nome}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                            {campanha.publico_alvo}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleStatus(campanha.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold cursor-pointer transition-all ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {isActive ? <Play className="w-3 h-3 fill-emerald-800" /> : <Pause className="w-3 h-3" />}
                            {isActive ? 'Ativa' : 'Pausada'}
                          </button>
                        </td>

                        <td className="py-3 px-3 font-semibold text-slate-800">
                          <div className="flex items-center gap-1">
                            <span>R$</span>
                            <input
                              type="number"
                              defaultValue={campanha.orcamento_diario}
                              onBlur={(e) => handleUpdateOrcamento(campanha.id, parseFloat(e.target.value) || campanha.orcamento_diario)}
                              className="w-20 px-2 py-1 text-xs border border-slate-200 rounded-md bg-slate-50 font-bold focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#2E3192]"
                            />
                            <span className="text-[10px] text-slate-500">/dia</span>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-xs">
                            {campanha.leads_gerados}
                          </span>
                        </td>

                        <td className="py-3 px-3 font-bold text-slate-900">
                          R$ {campanha.cpl.toFixed(2)}
                        </td>

                        <td className="py-3 px-3 text-slate-600 font-medium">
                          R$ {campanha.gasto_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-bold text-emerald-700 text-xs">
                            {campanha.roas}x
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedCampaignId(campanha.id);
                              setActiveTab('criativos');
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-[#2E3192] hover:text-white text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Ver Criativo
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Criativos Mockup & Simulador */}
      {activeTab === 'criativos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls & Campaign Details */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selecione a Campanha para Pré-Visualização
                </label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
                >
                  {configState.campanhas.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.canal}) — {c.leads_gerados} leads gerados
                    </option>
                  ))}
                </select>
              </div>

              {/* Format Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Canal de Exibição do Anúncio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPreviewChannel('Instagram')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      previewChannel === 'Instagram'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-transparent shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Instagram className="w-4 h-4" /> Feed Instagram
                  </button>
                  <button
                    onClick={() => setPreviewChannel('Facebook')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      previewChannel === 'Facebook'
                        ? 'bg-blue-600 text-white border-transparent shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Facebook className="w-4 h-4" /> Feed Facebook
                  </button>
                </div>
              </div>

              {/* Creative Copy Details */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block text-[10px]">Título do Anúncio:</span>
                  <strong className="text-slate-800">{selectedCampaign.criativo_preview.titulo}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block text-[10px]">Texto Principal (Copywriting):</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">{selectedCampaign.criativo_preview.texto_principal}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block text-[10px]">Chamada para Ação (CTA):</span>
                  <span className="bg-[#2E3192] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {selectedCampaign.criativo_preview.cta}
                  </span>
                </div>
              </div>

              {/* Action Button: Simulate Lead */}
              <div className="pt-2">
                <button
                  onClick={handleSimularLead}
                  disabled={isSimulatingLead}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-105 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 border-b-2 border-emerald-400 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-emerald-200" />
                  {isSimulatingLead ? 'Simulando e Disparando Webhook...' : 'Simular Disparo de Lead Teste do Meta para o CRM'}
                </button>
                <p className="text-[11px] text-slate-500 text-center mt-1.5">
                  Ao clicar, um novo lead fictício qualificado é injetado instantaneamente no <strong>Funil Comercial (SDR)</strong> com origem "Meta Ads".
                </p>
              </div>
            </div>
          </div>

          {/* Realistic Mobile Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[340px] bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-800 relative">
              {/* Phone Speaker Notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

              {/* Phone Screen */}
              <div className="bg-white rounded-[28px] overflow-hidden shadow-inner text-slate-900 flex flex-col">
                {/* Social App Header */}
                <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#2E3192] text-[#F2EC00] flex items-center justify-center font-black text-xs">
                      BL
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight flex items-center gap-1">
                        brasillegal.imoveis
                        <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500" />
                      </div>
                      <div className="text-[9px] text-slate-500">Patrocinado • Anúncio</div>
                    </div>
                  </div>
                  <span className="text-slate-400 text-xs">•••</span>
                </div>

                {/* Creative Image */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={selectedCampaign.criativo_preview.imagem_url}
                    alt="Anúncio Meta Ads"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-[#2E3192]/90 backdrop-blur-xs text-white text-[9px] font-extrabold px-2 py-0.5 rounded">
                    Lei 13.465/17 & Prov. 65 CNJ
                  </div>
                </div>

                {/* CTA Bar */}
                <div className="bg-[#2E3192] text-white px-3.5 py-2 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold text-[#F2EC00]">Regularização Extrajudicial</div>
                    <div className="text-[11px] font-bold truncate">{selectedCampaign.criativo_preview.titulo}</div>
                  </div>
                  <button className="px-2.5 py-1 bg-[#F2EC00] text-slate-950 font-extrabold text-[10px] rounded-md shrink-0">
                    Cadastrar
                  </button>
                </div>

                {/* Post Copy & Engagement */}
                <div className="p-3 bg-white text-xs space-y-1.5">
                  <p className="text-[11px] text-slate-700 line-clamp-3 leading-relaxed">
                    <strong>brasillegal.imoveis</strong> {selectedCampaign.criativo_preview.texto_principal}
                  </p>
                  <div className="text-[10px] text-slate-400">Ver todos os 48 comentários</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Integração & Webhook */}
      {activeTab === 'integracao' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Pixel Configuration */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Share2 className="w-4 h-4 text-[#2E3192]" />
              <h3 className="text-sm font-bold text-slate-900">Configuração do Meta Pixel & CAPI</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ID da Conta de Anúncios (Ad Account ID)
              </label>
              <input
                type="text"
                value={configState.account_id}
                onChange={(e) => setConfigState({ ...configState, account_id: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Meta Pixel ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={configState.pixel_id}
                  onChange={(e) => setConfigState({ ...configState, pixel_id: e.target.value })}
                  className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
                />
                <button
                  onClick={() => copyToClipboard(configState.pixel_id, 'pixel')}
                  className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedPixel ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPixel ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Snippet para Injetor de CSS/JS do Site:
              </div>
              <pre className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg text-[10px] overflow-x-auto font-mono">
{`<!-- Meta Pixel Code Brasil Legal -->
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${configState.pixel_id}');
fbq('track', 'PageView');
<!-- End Meta Pixel Code -->`}
              </pre>
            </div>
          </div>

          {/* Right: Webhook Lead Ads */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Webhook de Lead Ads & SLA Automático</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                URL de Callback do Webhook (Endpoint do Backend)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://brasillegalimoveis.com.br/api/meta-ads/webhook"
                  className="flex-1 text-xs px-3 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg"
                />
                <button
                  onClick={() => copyToClipboard('https://brasillegalimoveis.com.br/api/meta-ads/webhook', 'webhook')}
                  className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedWebhook ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedWebhook ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Token de Verificação do Webhook (Verify Token)
              </label>
              <input
                type="text"
                value={configState.webhook_verify_token}
                onChange={(e) => setConfigState({ ...configState, webhook_verify_token: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Distribuir Automaticamente para o SDR</div>
                  <div className="text-[11px] text-slate-500">Inicia cronômetro do SLA (&lt; 4 minutos) imediatamente</div>
                </div>
                <input
                  type="checkbox"
                  checked={configState.distribuir_sdr_automatico}
                  onChange={(e) => {
                    const updated = { ...configState, distribuir_sdr_automatico: e.target.checked };
                    setConfigState(updated);
                    onSaveConfig(updated);
                  }}
                  className="w-4 h-4 text-[#2E3192] rounded-md cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">API de Conversões Meta (CAPI)</div>
                  <div className="text-[11px] text-slate-500">Dispara evento de compra na homologação do contrato</div>
                </div>
                <input
                  type="checkbox"
                  checked={configState.conversao_api_ativo}
                  onChange={(e) => {
                    const updated = { ...configState, conversao_api_ativo: e.target.checked };
                    setConfigState(updated);
                    onSaveConfig(updated);
                  }}
                  className="w-4 h-4 text-[#2E3192] rounded-md cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova Campanha */}
      {showNovaCampanhaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 bg-[#2E3192] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#F2EC00]" /> Nova Campanha no Meta Ads
              </h3>
              <button
                onClick={() => setShowNovaCampanhaModal(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCriarCampanha} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome da Campanha
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Usucapião Extrajudicial - Donos sem Escritura"
                  value={novaCampanhaNome}
                  onChange={(e) => setNovaCampanhaNome(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Orçamento Diário (R$/dia)
                </label>
                <input
                  type="number"
                  required
                  step="10"
                  value={novaCampanhaOrcamento}
                  onChange={(e) => setNovaCampanhaOrcamento(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Canal de Veiculação
                </label>
                <select
                  value={novaCampanhaCanal}
                  onChange={(e) => setNovaCampanhaCanal(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                >
                  <option value="Ambos">Instagram & Facebook (Recomendado)</option>
                  <option value="Instagram">Somente Instagram Feed/Stories</option>
                  <option value="Facebook">Somente Facebook Feed</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNovaCampanhaModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2E3192] text-white rounded-lg text-xs font-bold shadow-md hover:bg-[#1E216B]"
                >
                  Criar e Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
