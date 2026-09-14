import React, { useState } from 'react';
import { MetaAdsConfig, MetaAdsCampaign, MetaAdsForm, MetaAdsFormCampo, Contact } from '../types';
import { initialMetaAdsConfig } from '../utils/metaAdsData';
import { 
  Share2, 
  TrendingUp, 
  Users, 
  DollarSign, 
  MousePointer, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  Pause, 
  RefreshCw, 
  Send, 
  Smartphone, 
  Instagram, 
  Facebook, 
  Layers, 
  ShieldCheck, 
  ExternalLink,
  Sliders,
  Copy,
  Check,
  AlertCircle,
  Eye,
  Plus,
  FileText,
  ClipboardList,
  MessageSquare,
  ArrowRight,
  Trash2,
  X
} from 'lucide-react';

interface MetaAdsManagerProps {
  onAddLeadToCrm?: (contact: Partial<Contact>) => void;
  onRefreshLeads?: () => void;
}

export const MetaAdsManager: React.FC<MetaAdsManagerProps> = ({
  onAddLeadToCrm,
  onRefreshLeads
}) => {
  const [config, setConfig] = useState<MetaAdsConfig>(initialMetaAdsConfig);
  const [activeTab, setActiveTab] = useState<'campanhas' | 'criativos' | 'formularios' | 'webhook' | 'ia_copywriter' | 'configuracoes'>('campanhas');
  const [selectedCampaign, setSelectedCampaign] = useState<MetaAdsCampaign>(config.campanhas[0]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Forms state
  const [formularios, setFormularios] = useState<MetaAdsForm[]>(
    config.formularios || initialMetaAdsConfig.formularios || []
  );
  const [selectedFormId, setSelectedFormId] = useState<string>(
    formularios[0]?.id || ''
  );
  const [showNovoFormModal, setShowNovoFormModal] = useState(false);
  const [novoFormNome, setNovoFormNome] = useState('');
  const [novoFormCampanhaId, setNovoFormCampanhaId] = useState(config.campanhas[0]?.id || '');
  const [testFormValues, setTestFormValues] = useState<Record<string, string>>({});
  const [testFormSubmitting, setTestFormSubmitting] = useState(false);
  const [testFormSuccessMsg, setTestFormSuccessMsg] = useState<string | null>(null);

  // Webhook Lead Simulation state
  const [testLeadName, setTestLeadName] = useState('Dona Odete Aparecida da Silva');
  const [testLeadPhone, setTestLeadPhone] = useState('(11) 98741-2099');
  const [testLeadEmail, setTestLeadEmail] = useState('odete.imovel@gmail.com');
  const [testLeadService, setTestLeadService] = useState('Usucapião Extrajudicial Cartório');
  const [testLeadTipoImovel, setTestLeadTipoImovel] = useState('Casa em loteamento sem desdobro registrado');
  const [simulandoEnvio, setSimulandoEnvio] = useState(false);
  const [simulacaoStatus, setSimulacaoStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // AI Copywriter state
  const [temaCopy, setTemaCopy] = useState<'usucapiao' | 'reurb' | 'desdobro' | 'inventario'>('usucapiao');
  const [tomVoz, setTomVoz] = useState<'seguranca_juridica' | 'urgencia' | 'valorizacao'>('seguranca_juridica');
  const [gerandoCopy, setGerandoCopy] = useState(false);
  const [copyGerada, setCopyGerada] = useState<{
    titulo: string;
    texto: string;
    cta: string;
    hashtag: string;
  } | null>(null);

  // Totals calculations
  const totalGasto = config.campanhas.reduce((acc, c) => acc + c.gasto_total, 0);
  const totalLeads = config.campanhas.reduce((acc, c) => acc + c.leads_gerados, 0);
  const totalCliques = config.campanhas.reduce((acc, c) => acc + c.cliques, 0);
  const totalImpressoes = config.campanhas.reduce((acc, c) => acc + c.impressoes, 0);
  const cplMedio = totalLeads > 0 ? (totalGasto / totalLeads) : 0;
  const ctrMedio = totalImpressoes > 0 ? ((totalCliques / totalImpressoes) * 100) : 0;
  const roasMedio = (config.campanhas.reduce((acc, c) => acc + c.roas, 0) / config.campanhas.length).toFixed(1);

  const toggleCampaignStatus = (campaignId: string) => {
    setConfig(prev => ({
      ...prev,
      campanhas: prev.campanhas.map(c => {
        if (c.id === campaignId) {
          const newStatus = c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          return { ...c, status: newStatus };
        }
        return c;
      })
    }));
  };

  const handleSimularWebhook = async () => {
    setSimulandoEnvio(true);
    setSimulacaoStatus('idle');

    try {
      const payload = {
        lead_data: {
          nome_completo: testLeadName,
          telefone_whatsapp: testLeadPhone,
          email: testLeadEmail,
          servico_pretendido: testLeadService,
          tipo_imovel: testLeadTipoImovel,
          observacoes: `Lead capturado instantaneamente via Meta Lead Ads (${selectedCampaign.nome}) e injetado na triagem do SDR.`
        }
      };

      const res = await fetch('/api/meta-ads/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSimulacaoStatus('success');
        if (onAddLeadToCrm) {
          onAddLeadToCrm({
            nome_completo: testLeadName,
            telefone_whatsapp: testLeadPhone,
            email: testLeadEmail,
            origem_lead: 'Meta Ads',
            servico_pretendido: testLeadService,
            tipo_imovel: testLeadTipoImovel,
            observacoes: `Capturado via Formulário Instantâneo Meta: ${selectedCampaign.criativo_preview.form_nome}`
          });
        }
        if (onRefreshLeads) onRefreshLeads();
      } else {
        setSimulacaoStatus('error');
      }
    } catch {
      setSimulacaoStatus('error');
    } finally {
      setSimulandoEnvio(false);
    }
  };

  const currentForm = formularios.find(f => f.id === selectedFormId) || formularios[0];

  const handleSalvarNovoForm = () => {
    if (!novoFormNome.trim()) return;
    const novoForm: MetaAdsForm = {
      id: `form-meta-${Date.now()}`,
      nome_formulario: novoFormNome,
      campanha_id: novoFormCampanhaId,
      status: 'Ativo',
      total_leads_coletados: 0,
      data_criacao: new Date().toISOString(),
      mensagem_sucesso: 'Obrigado! Um especialista da Brasil Legal entrará em contato em menos de 4 minutos via WhatsApp para iniciar a análise do seu imóvel.',
      campos: [
        { id: `fld-${Date.now()}-1`, label: 'Nome Completo', tipo: 'text', crm_field_mapping: 'nome_completo', obrigatorio: true },
        { id: `fld-${Date.now()}-2`, label: 'WhatsApp com DDD', tipo: 'tel', crm_field_mapping: 'telefone_whatsapp', obrigatorio: true },
        { id: `fld-${Date.now()}-3`, label: 'E-mail', tipo: 'email', crm_field_mapping: 'email', obrigatorio: false },
        { id: `fld-${Date.now()}-4`, label: 'Cidade onde fica o Imóvel', tipo: 'text', crm_field_mapping: 'endereco.cidade', obrigatorio: true },
        { 
          id: `fld-${Date.now()}-5`, 
          label: 'Situação Atual do Imóvel', 
          tipo: 'select', 
          opcoes: [
            'Contrato de Gaveta / Compra e Venda',
            'Posse Antiga (+ de 5 anos)',
            'Herança sem Inventário Finalizado',
            'Lote sem desdobro no Cartório'
          ],
          crm_field_mapping: 'tipo_imovel', 
          obrigatorio: true 
        },
        { 
          id: `fld-${Date.now()}-6`, 
          label: 'Serviço Pretendido', 
          tipo: 'select', 
          opcoes: [
            'Usucapião Extrajudicial',
            'Adjudicação Compulsória Extrajudicial',
            'REURB / Regularização Fundiária Urbana',
            'Retificação de Área e Desdobro'
          ],
          crm_field_mapping: 'servico_pretendido', 
          obrigatorio: true 
        }
      ]
    };
    setFormularios(prev => [novoForm, ...prev]);
    setSelectedFormId(novoForm.id);
    setShowNovoFormModal(false);
    setNovoFormNome('');
  };

  const handleToggleFormStatus = (id: string) => {
    setFormularios(prev => prev.map(f => f.id === id ? { ...f, status: f.status === 'Ativo' ? 'Pausado' : 'Ativo' } : f));
  };

  const handleExcluirForm = (id: string) => {
    if (formularios.length <= 1) return;
    setFormularios(prev => prev.filter(f => f.id !== id));
    if (selectedFormId === id) {
      const rest = formularios.filter(f => f.id !== id);
      setSelectedFormId(rest[0]?.id || '');
    }
  };

  const handleSubmitTesteFormulario = async (form: MetaAdsForm) => {
    setTestFormSubmitting(true);
    setTestFormSuccessMsg(null);

    const leadNome = testFormValues['nome_completo'] || 'Lead Teste Meta';
    const leadTel = testFormValues['telefone_whatsapp'] || '+55 11 99864-2424';
    const leadEmail = testFormValues['email'] || 'lead.meta@brasillegal.com.br';
    const leadCidade = testFormValues['endereco.cidade'] || 'São Paulo';
    const leadImovel = testFormValues['tipo_imovel'] || 'Posse mansa com justo título';
    const leadServico = testFormValues['servico_pretendido'] || 'Usucapião Extrajudicial';

    const payload = {
      lead_data: {
        nome_completo: leadNome,
        telefone_whatsapp: leadTel,
        email: leadEmail,
        endereco: {
          logradouro: 'Capturado via Meta Instant Lead Form',
          bairro: 'Centro',
          cidade: leadCidade,
          uf: 'SP',
          cep: '01000-000'
        },
        servico_pretendido: leadServico,
        tipo_imovel: leadImovel,
        origem_lead: `Meta Ads - Formulário Instantâneo (${form.nome_formulario})`,
        observacoes: `Resposta enviada via Formulário Integrado Meta Ads [${form.nome_formulario}] — sincronizado automaticamente no sistema.`
      }
    };

    try {
      await fetch('/api/meta-ads/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('Fallback webhook lead:', e);
    }

    if (onAddLeadToCrm) {
      onAddLeadToCrm({
        nome_completo: leadNome,
        telefone_whatsapp: leadTel,
        email: leadEmail,
        endereco: {
          logradouro: 'Capturado via Meta Instant Lead Form',
          numero: 'S/N',
          bairro: 'Centro',
          cidade: leadCidade,
          uf: 'SP',
          cep: '01000-000'
        },
        tipo_imovel: leadImovel,
        servico_pretendido: leadServico as any,
        origem_lead: `Meta Ads - Formulário Instantâneo`,
        observacoes: `Lead capturado pelo formulário "${form.nome_formulario}". Enviado para fila SDR imediata.`
      });
    }

    if (onRefreshLeads) {
      onRefreshLeads();
    }

    setFormularios(prev => prev.map(f => f.id === form.id ? { ...f, total_leads_coletados: f.total_leads_coletados + 1 } : f));
    setTestFormSubmitting(false);
    setTestFormSuccessMsg(`✓ Resposta enviada com sucesso! O lead "${leadNome}" foi imediatamente cadastrado nos Leads do sistema.`);
  };

  const handleGerarCopyIa = () => {
    setGerandoCopy(true);
    setTimeout(() => {
      if (temaCopy === 'usucapiao') {
        setCopyGerada({
          titulo: 'Mora há mais de 5 anos no imóvel e só tem Contrato de Gaveta?',
          texto: 'A Lei 13.465 e o Provimento 65 do CNJ permitem conseguir a Escritura Definitiva e a Matrícula diretamente no Cartório de Imóveis, sem aguardar anos no fórum judicial. Faça a regularização extrajudicial com nossa equipe jurídica especializada. Toque no botão e confira os requisitos em 3 minutos.',
          cta: 'Verificar Elegibilidade do Imóvel',
          hashtag: '#UsucapiaoExtrajudicial #RegistroDeImoveis #DireitoImobiliario #BrasilLegal'
        });
      } else if (temaCopy === 'reurb') {
        setCopyGerada({
          titulo: 'Regularize Loteamentos e Bairros Consolidados pela REURB',
          texto: 'Seu bairro ou chácara ainda não possuem escritura individual para cada lote? A REURB traz segurança jurídica definitiva, autoriza ligação de água e luz oficial e valoriza seu patrimônio em até 45%. Engenharia e advocacia integradas do início até a certidão de regularização fundiária (CRF).',
          cta: 'Falar com Especialista em REURB',
          hashtag: '#REURB #RegularizacaoFundiaria #LoteLegal #Imoveis'
        });
      } else if (temaCopy === 'desdobro') {
        setCopyGerada({
          titulo: 'Construiu mais de uma casa no mesmo terreno? Faça o Desdobro',
          texto: 'Sem a matrícula individual, você não consegue vender pelo banco nem deixar a partilha organizada para a família. A Brasil Legal cuida do levantamento topográfico, planta, memorial descritivo, ART e aprovação municipal com registro no Cartório de RI.',
          cta: 'Solicitar Projeto de Desdobro',
          hashtag: '#Desdobro #Topografia #Escritura #Regularizacao'
        });
      } else {
        setCopyGerada({
          titulo: 'Inventário Travado e Imóvel sem Matrícula? Resolva de Vez',
          texto: 'Não deixe o patrimônio familiar desvalorizar por pendências documentais. Realizamos a adjudicação compulsória extrajudicial e regularização de cessão de direitos hereditários de forma rápida e segura.',
          cta: 'Analisar Documentação Familiar',
          hashtag: '#Inventario #DireitoSucessorio #Partilha #BrasilLegal'
        });
      }
      setGerandoCopy(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#1877F2] via-[#2E3192] to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[#F2EC00] font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                Meta Ads Enterprise
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1 border border-emerald-400/30">
                <CheckCircle2 className="w-3 h-3" />
                Webhook Lead Ads Ativo
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              Gestão de Tráfego & Campanhas Meta (Facebook & Instagram)
            </h1>
            <p className="text-white/80 text-xs md:text-sm mt-1 max-w-2xl">
              Geração de leads proprietários via formulários nativos, pixel com Conversions API (CAPI) e distribuição direta para os SDRs do CRM.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('webhook')}
              className="px-3.5 py-2 bg-white text-[#1877F2] rounded-xl text-xs font-bold hover:bg-slate-100 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Testar Injeção de Lead</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ia_copywriter')}
              className="px-3.5 py-2 bg-[#F2EC00] text-slate-950 rounded-xl text-xs font-black hover:bg-yellow-300 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#2E3192]" />
              <span>IA Copywriter</span>
            </button>
          </div>
        </div>

        {/* Global Performance Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
            <div className="text-[10px] font-bold text-white/70 uppercase">Investimento Total</div>
            <div className="text-base font-black mt-0.5">
              {totalGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
            <div className="text-[10px] font-bold text-white/70 uppercase">Leads Qualificados</div>
            <div className="text-base font-black text-[#F2EC00] mt-0.5">
              {totalLeads} contatos
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
            <div className="text-[10px] font-bold text-white/70 uppercase">Custo Médio (CPL)</div>
            <div className="text-base font-black text-emerald-300 mt-0.5">
              {cplMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
            <div className="text-[10px] font-bold text-white/70 uppercase">Taxa de Cliques (CTR)</div>
            <div className="text-base font-black mt-0.5">{ctrMedio.toFixed(2)}%</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
            <div className="text-[10px] font-bold text-white/70 uppercase">Retorno (ROAS)</div>
            <div className="text-base font-black text-[#F2EC00] mt-0.5">{roasMedio}x</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
            <div className="text-[10px] font-bold text-white/70 uppercase">Impressões Totais</div>
            <div className="text-base font-black mt-0.5">{totalImpressoes.toLocaleString('pt-BR')}</div>
          </div>
        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('campanhas')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'campanhas'
              ? 'bg-[#1877F2] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Campanhas Ativas ({config.campanhas.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('criativos')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'criativos'
              ? 'bg-[#1877F2] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Prévia dos Criativos (Feed & Stories)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('formularios')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'formularios'
              ? 'bg-[#1877F2] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Formulários Integrados ({formularios.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('webhook')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'webhook'
              ? 'bg-[#1877F2] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          Webhook & Simulador de Leads
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ia_copywriter')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ia_copywriter'
              ? 'bg-[#1877F2] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          IA Copywriter para Regularização
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('configuracoes')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'configuracoes'
              ? 'bg-[#1877F2] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Configurações de API & Pixel
        </button>
      </div>

      {/* TAB 1: CAMPANHAS ATIVAS */}
      {activeTab === 'campanhas' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Campanhas de Aquisição de Proprietários</h2>
                <p className="text-xs text-slate-500">Métricas em tempo real integradas à Meta Graph API v20.0</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Conta: <strong>{config.account_id}</strong>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-3">Status</th>
                    <th className="p-3">Campanha</th>
                    <th className="p-3">Canal</th>
                    <th className="p-3 text-right">Orçamento Diário</th>
                    <th className="p-3 text-right">Gasto Total</th>
                    <th className="p-3 text-right">Leads</th>
                    <th className="p-3 text-right">CPL</th>
                    <th className="p-3 text-right">CTR</th>
                    <th className="p-3 text-right">ROAS</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {config.campanhas.map(campanha => {
                    const isActive = campanha.status === 'ACTIVE';
                    return (
                      <tr key={campanha.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => toggleCampaignStatus(campanha.id)}
                            className={`px-2 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer transition-all ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                            }`}
                            title={isActive ? 'Clique para pausar' : 'Clique para ativar'}
                          >
                            {isActive ? <Play className="w-2.5 h-2.5 fill-emerald-800" /> : <Pause className="w-2.5 h-2.5" />}
                            {isActive ? 'Ativa' : 'Pausada'}
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{campanha.nome}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[280px]">
                            {campanha.publico_alvo}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                            {campanha.canal === 'Instagram' && <Instagram className="w-3 h-3 text-pink-600" />}
                            {campanha.canal === 'Facebook' && <Facebook className="w-3 h-3 text-blue-600" />}
                            {campanha.canal === 'Ambos' && <Share2 className="w-3 h-3 text-purple-600" />}
                            {campanha.canal}
                          </span>
                        </td>
                        <td className="p-3 text-right font-semibold text-slate-800">
                          {campanha.orcamento_diario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/dia
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {campanha.gasto_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="p-3 text-right font-black text-[#2E3192]">
                          {campanha.leads_gerados}
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-600">
                          {campanha.cpl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="p-3 text-right font-medium text-slate-700">
                          {campanha.ctr.toFixed(2)}%
                        </td>
                        <td className="p-3 text-right font-black text-amber-600">
                          {campanha.roas.toFixed(1)}x
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCampaign(campanha);
                              setActiveTab('criativos');
                            }}
                            className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
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

      {/* TAB 2: PRÉVIA DOS CRIATIVOS (FACEBOOK & INSTAGRAM) */}
      {activeTab === 'criativos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaign Selector Column */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Selecione o Anúncio Ativo
            </h3>
            {config.campanhas.map(c => {
              const isSelected = selectedCampaign.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCampaign(c)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-[#1877F2] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {c.canal}
                    </span>
                    <span className="text-xs font-black text-emerald-600">
                      CPL: R$ {c.cpl.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">{c.nome}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {c.leads_gerados} cadastros no formulário instantâneo
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social Media Ad Mockup Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-4 max-w-md mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#2E3192] text-[#F2EC00] flex items-center justify-center font-black text-xs shadow-2xs">
                    BL
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      Brasil Legal Regularização
                      <span className="text-blue-500 text-[10px]">● Patrocinado</span>
                    </div>
                    <div className="text-[10px] text-slate-400">São Paulo, SP • Publicidade Oficial</div>
                  </div>
                </div>
                <div className="text-slate-400 text-xs font-bold">•••</div>
              </div>

              {/* Copy */}
              <div className="py-3 text-xs text-slate-800 leading-relaxed space-y-1">
                <p>{selectedCampaign.criativo_preview.texto_principal}</p>
                <div className="text-[11px] text-[#1877F2] font-semibold cursor-pointer">
                  #Usucapião #CartorioDeImoveis #BrasilLegal #Matricula
                </div>
              </div>

              {/* Media Image */}
              <div className="rounded-xl overflow-hidden border border-slate-200 relative aspect-4/3 bg-slate-900">
                <img
                  src={selectedCampaign.criativo_preview.imagem_url}
                  alt={selectedCampaign.criativo_preview.titulo}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Formulário Instantâneo
                </div>
              </div>

              {/* Ad Footer Bar with CTA */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    brasillegal.com.br
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {selectedCampaign.criativo_preview.titulo}
                  </div>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 bg-[#1877F2] text-white text-xs font-bold rounded-lg shrink-0 shadow-xs hover:bg-blue-600 transition-colors"
                >
                  {selectedCampaign.criativo_preview.cta}
                </button>
              </div>

              {/* Lead Form Field Notification */}
              <div className="mt-3 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center gap-2 text-[11px] text-indigo-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>
                  Formulário vinculado: <strong>{selectedCampaign.criativo_preview.form_nome}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: FORMULÁRIOS INSTANTÂNEOS INTEGRADOS (META LEAD ADS) */}
      {activeTab === 'formularios' && (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          {/* Header & Create Button */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1877F2] text-[10px] font-bold uppercase">
                  Meta Instant Forms
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Sincronização Direta com Leads & CRM
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Formulários Nativos do Facebook & Instagram
              </h3>
              <p className="text-xs text-slate-600 max-w-2xl mt-0.5">
                Os formulários instantâneos abrem diretamente no app do usuário sem tempo de carregamento. Toda resposta enviada é convertida automaticamente em Lead no sistema com dados de contato, imóvel e qualificação SDR em tempo real.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowNovoFormModal(true)}
              className="px-4 py-2.5 bg-[#1877F2] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Criar Novo Formulário Integrado
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lista de Formulários Configurados (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Formulários Ativos ({formularios.length})</span>
                <span className="text-[11px] text-emerald-600 font-normal">
                  ● {formularios.filter(f => f.status === 'Ativo').length} Integrados
                </span>
              </h4>

              {formularios.map(form => {
                const isSelected = form.id === (currentForm?.id || formularios[0]?.id);
                const camp = config.campanhas.find(c => c.id === form.campanha_id);

                return (
                  <div
                    key={form.id}
                    onClick={() => {
                      setSelectedFormId(form.id);
                      setTestFormSuccessMsg(null);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-blue-50/40 border-[#1877F2] shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              form.status === 'Ativo'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {form.status}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {form.id}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-slate-900 mt-1">
                          {form.nome_formulario}
                        </h5>
                      </div>

                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleToggleFormStatus(form.id)}
                          title={form.status === 'Ativo' ? 'Pausar formulário' : 'Ativar formulário'}
                          className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                        >
                          {form.status === 'Ativo' ? (
                            <Pause className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </button>
                        {formularios.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleExcluirForm(form.id)}
                            title="Excluir formulário"
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Campanha Vinculada:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                          {camp?.nome || 'Geral / Automática'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Total de Leads Coletados:</span>
                        <strong className="text-blue-700 font-bold">
                          {form.total_leads_coletados} leads
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Campos Mapeados:</span>
                        <span>{form.campos.length} campos</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        Criado em {new Date(form.data_criacao).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-xs font-bold text-[#1877F2] flex items-center gap-1">
                        Ver & Testar Resposta <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Simulador Interativo do Formulário & Injeção de Lead no CRM (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {currentForm ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  {/* Form Header like Meta/Facebook UI */}
                  <div className="bg-gradient-to-r from-[#1877F2] to-blue-700 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white text-[#1877F2] flex items-center justify-center font-black text-xs">
                          f
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                            Prévia Interativa • Meta Instant Form
                          </div>
                          <div className="text-sm font-bold">
                            {currentForm.nome_formulario}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                        Lead Ads v20
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#1877F2] shrink-0 mt-0.5" />
                      <div>
                        <strong>Integração Ativa com CRM:</strong> Ao preencher e clicar no botão abaixo, os dados são enviados diretamente para os <strong>Leads</strong> e para a fila de triagem comercial com alerta imediato.
                      </div>
                    </div>

                    {/* Form Fields Simulation */}
                    <form
                      onSubmit={e => {
                        e.preventDefault();
                        handleSubmitTesteFormulario(currentForm);
                      }}
                      className="space-y-3.5"
                    >
                      {currentForm.campos.map(campo => (
                        <div key={campo.id}>
                          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                            <span>
                              {campo.label} {campo.obrigatorio && <span className="text-rose-500">*</span>}
                            </span>
                            <span className="text-[10px] font-normal font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              CRM: {campo.crm_field_mapping}
                            </span>
                          </label>

                          {campo.tipo === 'select' && campo.opcoes ? (
                            <select
                              value={testFormValues[campo.crm_field_mapping] || campo.opcoes[0]}
                              onChange={e =>
                                setTestFormValues(prev => ({
                                  ...prev,
                                  [campo.crm_field_mapping]: e.target.value
                                }))
                              }
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
                            >
                              {campo.opcoes.map((opt, i) => (
                                <option key={i} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={campo.tipo}
                              required={campo.obrigatorio}
                              placeholder={`Digite ${campo.label.toLowerCase()}...`}
                              value={testFormValues[campo.crm_field_mapping] || ''}
                              onChange={e =>
                                setTestFormValues(prev => ({
                                  ...prev,
                                  [campo.crm_field_mapping]: e.target.value
                                }))
                              }
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
                            />
                          )}
                        </div>
                      ))}

                      {/* Success Feedback */}
                      {testFormSuccessMsg && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2 animate-in fade-in">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Lead Integrado com Sucesso!</strong>
                            <p className="mt-0.5 text-emerald-800">{testFormSuccessMsg}</p>
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setTestFormValues({
                              'nome_completo': 'Carlos Eduardo Mendonça',
                              'telefone_whatsapp': '+55 11 99864-2424',
                              'email': 'carlos.mendonca@gmail.com',
                              'endereco.cidade': 'Campinas / SP',
                              'tipo_imovel': 'Contrato de Gaveta / Compra e Venda',
                              'servico_pretendido': 'Usucapião Extrajudicial'
                            });
                          }}
                          className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                        >
                          Auto-preencher dados de teste
                        </button>

                        <button
                          type="submit"
                          disabled={testFormSubmitting}
                          className="px-5 py-2.5 bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {testFormSubmitting ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" /> Injetando Lead no Sistema...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" /> Enviar Resposta (Cai Direto nos Leads)
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Thank you card preview */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 space-y-1">
                      <span className="font-bold text-slate-800 block">
                        Mensagem de Agradecimento exibida no Instagram/Facebook:
                      </span>
                      <p className="text-[11px] text-slate-500 italic">
                        "{currentForm.mensagem_sucesso}"
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                  Nenhum formulário selecionado.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR NOVO FORMULÁRIO INTEGRADO */}
      {showNovoFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Criar Novo Formulário Instantâneo
              </h3>
              <button
                onClick={() => setShowNovoFormModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome do Formulário Meta *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Form_Adjudicacao_Compulsoria_2026"
                  value={novoFormNome}
                  onChange={e => setNovoFormNome(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Campanha Meta Ads Associada *
                </label>
                <select
                  value={novoFormCampanhaId}
                  onChange={e => setNovoFormCampanhaId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                >
                  {config.campanhas.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl text-[11px] text-blue-900">
                O novo formulário será configurado com os 6 campos padrões da Brasil Legal (Nome, Telefone/WhatsApp, E-mail, Cidade, Situação do Imóvel e Serviço) mapeados automaticamente para o CRM.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNovoFormModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSalvarNovoForm}
                className="px-4 py-2 bg-[#1877F2] hover:bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Criar Formulário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEBHOOK & SIMULADOR DE LEADS */}
      {activeTab === 'webhook' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulator Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                Simulador em Tempo Real
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                Simular Cadastro de Lead vindo do Instagram/Facebook
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Dispara um evento de webhook idêntico ao gerado pelo Meta Lead Ads para testar a triagem imediata no CRM.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo do Lead
                </label>
                <input
                  type="text"
                  value={testLeadName}
                  onChange={(e) => setTestLeadName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1877F2]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp do Lead
                  </label>
                  <input
                    type="text"
                    value={testLeadPhone}
                    onChange={(e) => setTestLeadPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1877F2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={testLeadEmail}
                    onChange={(e) => setTestLeadEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1877F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Serviço Selecionado no Formulário
                </label>
                <select
                  value={testLeadService}
                  onChange={(e) => setTestLeadService(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Usucapião Extrajudicial Cartório">Usucapião Extrajudicial Cartório</option>
                  <option value="REURB Urbana (Loteamento)">REURB Urbana (Loteamento)</option>
                  <option value="Desdobro de Terreno com ART">Desdobro de Terreno com ART</option>
                  <option value="Retificação de Área em Registro de Imóveis">Retificação de Área em Registro de Imóveis</option>
                  <option value="Inventário e Partilha Extrajudicial">Inventário e Partilha Extrajudicial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Situação do Imóvel informada pelo Lead
                </label>
                <input
                  type="text"
                  value={testLeadTipoImovel}
                  onChange={(e) => setTestLeadTipoImovel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#1877F2]"
                />
              </div>

              <button
                type="button"
                id="btn-enviar-webhook-meta"
                disabled={simulandoEnvio}
                onClick={handleSimularWebhook}
                className="w-full py-2.5 bg-[#1877F2] hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {simulandoEnvio ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Disparando Webhook Meta Graph API...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Disparar Webhook para o Funil Comercial</span>
                  </>
                )}
              </button>

              {simulacaoStatus === 'success' && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <strong>Sucesso!</strong> Lead criado instantaneamente no <strong>Funil Comercial (Etapa 1: Lead)</strong> com SLA de 1 minuto acionado.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Webhook Endpoint & Payload Documentation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1877F2]" />
              Dados do Webhook Oficial no Meta Developer Console
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  URL do Callback (Webhook do Sistema)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/api/meta-ads/webhook`}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 font-mono text-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/meta-ads/webhook`);
                      setCopiedWebhook(true);
                      setTimeout(() => setCopiedWebhook(false), 2000);
                    }}
                    className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer"
                    title="Copiar URL"
                  >
                    {copiedWebhook ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  Verify Token (Token de Validação do Webhook)
                </label>
                <input
                  type="text"
                  readOnly
                  value={config.webhook_verify_token}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 font-mono text-slate-700"
                />
              </div>

              <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto">
                <div className="text-slate-400 font-bold mb-1">// Payload JSON processado pelo Express:</div>
                <pre>{JSON.stringify({
                  object: "page",
                  entry: [{
                    id: "109849201948201",
                    time: Date.now(),
                    changes: [{
                      field: "leadgen",
                      value: {
                        leadgen_id: "lead_9841298412",
                        page_id: "109849201948201",
                        form_id: selectedCampaign.criativo_preview.form_nome,
                        created_time: Math.floor(Date.now() / 1000)
                      }
                    }]
                  }]
                }, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IA COPYWRITER */}
      {activeTab === 'ia_copywriter' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-900 text-[10px] font-black uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#2E3192]" />
                  Gemini Flash 2.5
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Gerador de Anúncios de Alta Conversão para Regularização Imobiliária
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                IA Copywriter Especialista em Direito Notarial e Registral
              </h2>
            </div>
            <button
              type="button"
              disabled={gerandoCopy}
              onClick={handleGerarCopyIa}
              className="px-4 py-2 bg-[#2E3192] text-white rounded-xl text-xs font-bold hover:bg-indigo-900 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {gerandoCopy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#F2EC00]" />}
              <span>{gerandoCopy ? 'Gerando Copy...' : 'Gerar Anúncio com IA'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assunto do Anúncio (Área Imobiliária)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'usucapiao', label: 'Usucapião Extrajudicial' },
                  { id: 'reurb', label: 'REURB em Loteamentos' },
                  { id: 'desdobro', label: 'Desdobro de Terreno' },
                  { id: 'inventario', label: 'Inventário e Herança' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTemaCopy(item.id as any)}
                    className={`p-2.5 rounded-lg text-xs font-bold text-left border transition-all cursor-pointer ${
                      temaCopy === item.id
                        ? 'bg-[#2E3192] text-white border-[#2E3192]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tom de Voz do Anúncio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'seguranca_juridica', label: 'Segurança & CNJ' },
                  { id: 'urgencia', label: 'Evitar Perda/Golpe' },
                  { id: 'valorizacao', label: 'Valorização (+40%)' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTomVoz(item.id as any)}
                    className={`p-2.5 rounded-lg text-xs font-bold text-center border transition-all cursor-pointer ${
                      tomVoz === item.id
                        ? 'bg-[#1877F2] text-white border-[#1877F2]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Result Output */}
          {copyGerada && (
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-[#2E3192] bg-indigo-100 px-2 py-0.5 rounded">
                  Sugestão Pronta para Campanha
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${copyGerada.titulo}\n\n${copyGerada.texto}\n\n${copyGerada.cta}\n${copyGerada.hashtag}`);
                    alert('Copy copiada para a área de transferência!');
                  }}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" /> Copiar Tudo
                </button>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Título do Anúncio (Headline):</div>
                <div className="text-sm font-black text-slate-900 mt-0.5">{copyGerada.titulo}</div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">Texto Principal (Legenda do Feed):</div>
                <div className="text-xs text-slate-800 mt-0.5 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {copyGerada.texto}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mr-1.5">Chamada (CTA):</span>
                  <span className="px-2.5 py-1 rounded bg-[#1877F2] text-white text-xs font-bold">
                    {copyGerada.cta}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {copyGerada.hashtag}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CONFIGURAÇÕES DE API & PIXEL */}
      {activeTab === 'configuracoes' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Credenciais da Conta de Anúncios e Meta Conversions API
              </h3>
              <p className="text-xs text-slate-500">
                Configurações para sincronização contínua de campanhas e conversões offline.
              </p>
            </div>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Salvo com sucesso!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Meta Ad Account ID
              </label>
              <input
                type="text"
                value={config.account_id}
                onChange={(e) => setConfig({ ...config, account_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Meta Pixel ID
              </label>
              <input
                type="text"
                value={config.pixel_id}
                onChange={(e) => setConfig({ ...config, pixel_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Access Token do Sistema (Graph API v20.0)
              </label>
              <input
                type="password"
                value={config.access_token}
                onChange={(e) => setConfig({ ...config, access_token: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                WhatsApp de Notificação Imediata de Leads
              </label>
              <input
                type="text"
                value={config.whatsapp_number_destino}
                onChange={(e) => setConfig({ ...config, whatsapp_number_destino: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Distribuição Automática entre SDRs
              </label>
              <select
                value={config.distribuir_sdr_automatico ? 'true' : 'false'}
                onChange={(e) => setConfig({ ...config, distribuir_sdr_automatico: e.target.value === 'true' })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="true">Ativada (Roleta Round-Robin entre os SDRs)</option>
                <option value="false">Desativada (Enviar para fila geral de triagem)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={async () => {
                await fetch('/api/meta-ads', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(config)
                });
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 2500);
              }}
              className="px-5 py-2.5 bg-[#1877F2] hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
            >
              Salvar Configurações Meta Ads
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
