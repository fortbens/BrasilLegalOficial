import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Code2, 
  Play, 
  CheckCircle2, 
  Sliders, 
  Terminal, 
  FileJson, 
  ShieldCheck, 
  Send,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRightLeft,
  FileSearch,
  Scale
} from 'lucide-react';
import { Deal, Contact, Documento } from '../types';
import { ComparadorDocumentosImovel } from './ComparadorDocumentosImovel';

interface AiStudioEngineProps {
  onRefreshData?: () => void;
  deals?: Deal[];
  contacts?: Contact[];
  documents?: Documento[];
}

export const AiStudioEngine: React.FC<AiStudioEngineProps> = ({ 
  onRefreshData,
  deals = [],
  contacts = [],
  documents = []
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [temperature, setTemperature] = useState(0.2);
  const [topP, setTopP] = useState(0.95);
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [loading, setLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'comparador' | 'playground' | 'tools' | 'schemas'>('comparador');

  const presetTemplates = [
    {
      label: 'Comparar Matrícula vs Contrato Particular (Divergências)',
      prompt: 'Confrontar a Certidão de Matrícula nº 48.910 (250m², proprietário solteiro, hipoteca ativa) com o Contrato de Compra e Venda de 2019 (312,50m², vendedor casado sem outorga da esposa) e destacar discrepâncias perimetrais e cláusulas conflitantes.'
    },
    {
      label: 'Cadastrar Lead via AI (cadastrar_lead_completo)',
      prompt: 'Cadastrar lead: Roberto Silveira Braga, CPF 312.455.980-11, WhatsApp (19) 98122-3344, cidade de Paulínia/SP, indicado pelo parceiro PARC-B2B-88 para regularização de loteamento.'
    },
    {
      label: 'Solicitar Custódia de Documentos (solicitar_upload_documentos)',
      prompt: 'O cliente ct-101 precisa enviar os documentos faltantes para o Usucapião Extrajudicial. Gerar o link seguro solicitando Matrícula Atualizada, RG/CNH e IPTU.'
    },
    {
      label: 'Calcular Comissão B2B 5% (calcular_comissao_b2b)',
      prompt: 'Calcular e lançar a comissão B2B de 5% sobre os honorários líquidos de R$ 25.000,00 para o parceiro PARC-B2B-88 no processo deal-01.'
    },
    {
      label: 'Análise de Viabilidade Usucapião (Prov. 65 CNJ)',
      prompt: 'Analise a viabilidade registral de posse mansa e pacífica de 22 anos comprovada com contrato particular de cessão de direitos de 2004 e carnês de IPTU sem oposição.'
    }
  ];

  const handleRunPrompt = async (textToRun?: string) => {
    const text = textToRun || promptInput;
    if (!text.trim()) return;

    setLoading(true);
    setResponseResult(null);

    try {
      const res = await fetch('/api/gemini/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          customTemperature: temperature,
          customTopP: topP,
          model: selectedModel
        })
      });

      const data = await res.json();
      setResponseResult(data);
      if (onRefreshData && data.executed_tool) {
        onRefreshData();
      }
    } catch (err) {
      console.error(err);
      setResponseResult({
        error: 'Erro ao comunicar com a rota de inteligência do Gemini.'
      });
    } finally {
      setLoading(false);
    }
  };

  const functionDefinitions = [
    {
      name: 'cadastrar_lead_completo',
      desc: 'Registra um novo lead ou cliente com endereço, CPF/CNPJ e dados de origem.',
      params: {
        nome_completo: 'STRING (obrigatório)',
        cpf_cnpj: 'STRING (obrigatório)',
        whatsapp: 'STRING (obrigatório)',
        codigo_indicacao_b2b: 'STRING (opcional)',
        endereco_cidade: 'STRING (opcional)'
      }
    },
    {
      name: 'solicitar_upload_documentos',
      desc: 'Gera um link seguro para o cliente enviar RG, CPF, IPTU e matrículas na etapa de qualificação.',
      params: {
        contact_id: 'STRING (obrigatório)',
        tipos_documentos_pendentes: 'ARRAY de STRING (obrigatório)'
      }
    },
    {
      name: 'calcular_comissao_b2b',
      desc: 'Calcula a comissão de até 5% para o parceiro indicador do programa Indique e Ganhe e lança no financeiro.',
      params: {
        deal_id: 'STRING (obrigatório)',
        parceiro_id: 'STRING (obrigatório)',
        valor_honorarios_liquido: 'NUMBER (obrigatório)',
        percentual: 'NUMBER (padrão: 5.0)'
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#2E3192] text-white text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
              Google AI Studio • Central de Inteligência
            </span>
            <span className="bg-[#F2EC00] text-[#2E3192] text-xs font-extrabold px-2.5 py-0.5 rounded flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" />
              Engine: {selectedModel} (Fast & Structured)
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Motor de Inteligência e Automação Brasil Legal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuração com `temperature: 0.2`, `top_p: 0.95`, comparador documental inteligente e ferramentas homologadas.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg flex-wrap">
          <button
            onClick={() => setActiveTab('comparador')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'comparador'
                ? 'bg-[#2E3192] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-white/60'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#F2EC00]" />
            Comparador de Documentos
            <span className="text-[10px] bg-[#F2EC00] text-[#2E3192] font-black px-1.5 py-0.2 rounded-full">
              Novo
            </span>
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'playground'
                ? 'bg-white text-[#2E3192] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Playground & Execução
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'tools'
                ? 'bg-white text-[#2E3192] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ferramentas (Tools)
          </button>
          <button
            onClick={() => setActiveTab('schemas')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'schemas'
                ? 'bg-white text-[#2E3192] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            JSON Schemas
          </button>
        </div>
      </div>

      {activeTab === 'comparador' && (
        <ComparadorDocumentosImovel
          deals={deals}
          contacts={contacts}
          documents={documents}
        />
      )}

      {activeTab === 'playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls & Prompt Input */}
          <div className="lg:col-span-6 space-y-4">
            {/* Parameters card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#2E3192]" />
                Parâmetros Globais do Sistema (Blueprint)
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Temperature:</span>
                    <span className="font-mono text-[#2E3192] font-bold">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={e => setTemperature(parseFloat(e.target.value))}
                    className="w-full mt-1 accent-[#2E3192]"
                  />
                  <span className="text-[10px] text-slate-400">0.2: Baixa variabilidade para respostas técnicas</span>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Top_P:</span>
                    <span className="font-mono text-[#2E3192] font-bold">{topP}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={topP}
                    onChange={e => setTopP(parseFloat(e.target.value))}
                    className="w-full mt-1 accent-[#2E3192]"
                  />
                  <span className="text-[10px] text-slate-400">0.95: Amostragem precisa de tokens</span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Templates de Automação Rápida
              </div>
              <div className="space-y-1.5">
                {presetTemplates.map((tpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPromptInput(tpl.prompt);
                      handleRunPrompt(tpl.prompt);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 text-xs font-semibold text-slate-800 hover:text-[#2E3192] transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">{tpl.label}</span>
                    <Play className="w-3 h-3 text-slate-400 group-hover:text-[#2E3192] shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt Box */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Prompt do Usuário / Sistema
              </label>
              <textarea
                rows={4}
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
                placeholder="Digite uma instrução técnica para o Gemini ou solicite disparo de ferramenta..."
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192] font-sans"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Respostas estruturadas via Webhook / Function Calling
                </span>
                <button
                  disabled={loading || !promptInput.trim()}
                  onClick={() => handleRunPrompt()}
                  className={`px-4 py-2 text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 border-b-2 border-[#F2EC00] ${
                    loading || !promptInput.trim()
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-[#2E3192] hover:bg-[#1E216B] text-white'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#F2EC00]" />
                      Executar no Gemini
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Output Viewer */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900 text-slate-100 rounded-xl shadow-lg border border-slate-800 overflow-hidden flex flex-col min-h-[480px]">
              {/* Terminal Header */}
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#F2EC00]" />
                  <span className="text-xs font-bold font-mono text-slate-300">
                    Console de Saída • Gemini AI Studio
                  </span>
                </div>
                {responseResult?.executed_tool && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                    TOOL: {responseResult.executed_tool.name}
                  </span>
                )}
              </div>

              {/* Terminal Body */}
              <div className="p-4 font-mono text-xs overflow-y-auto max-h-[580px] space-y-4 flex-1">
                {!responseResult && !loading && (
                  <div className="text-slate-500 py-16 text-center italic">
                    Nenhuma execução pendente. Selecione um template à esquerda ou envie um prompt.
                  </div>
                )}

                {loading && (
                  <div className="py-16 text-center space-y-3">
                    <RefreshCw className="w-6 h-6 text-[#F2EC00] animate-spin mx-auto" />
                    <div className="text-xs text-slate-400">
                      Processando com Gemini (temperature: {temperature}, top_p: {topP})...
                    </div>
                  </div>
                )}

                {responseResult && !loading && (
                  <div className="space-y-4 animate-in fade-in">
                    {/* Notice if local simulation */}
                    {responseResult.notice && (
                      <div className="bg-amber-950/40 border border-amber-800/50 p-2.5 rounded text-[11px] text-amber-300">
                        {responseResult.notice}
                      </div>
                    )}

                    {/* Tool Execution Box if present */}
                    {responseResult.executed_tool && (
                      <div className="bg-slate-950/80 p-3 rounded-lg border border-emerald-500/30 space-y-2">
                        <div className="text-emerald-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Function Calling Disparado: {responseResult.executed_tool.name}
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Argumentos Recebidos:</div>
                          <pre className="text-[11px] text-indigo-300 bg-slate-900 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(responseResult.executed_tool.args, null, 2)}
                          </pre>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400 uppercase">Resultado da Execução:</div>
                          <pre className="text-[11px] text-emerald-300 bg-slate-900 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(responseResult.executed_tool.result, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Textual / Technical Response */}
                    {responseResult.response_text && (
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          Resposta Registral / Síntese:
                        </div>
                        <div className="text-slate-200 font-sans leading-relaxed whitespace-pre-line bg-slate-950/50 p-3 rounded border border-slate-800 text-xs">
                          {responseResult.response_text}
                        </div>
                      </div>
                    )}

                    {/* Raw Metadata */}
                    <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800 flex justify-between items-center">
                      <span>Modelo: {responseResult.model}</span>
                      <span>SLA Registro: &lt; 400ms</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Tools Specification */}
      {activeTab === 'tools' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Declarações de Ferramentas Homologadas (Function Calling)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Integração nativa entre o modelo Gemini e os módulos de cadastro, custódia documental e repasse financeiro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {functionDefinitions.map((tool, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#2E3192]" />
                  <span className="font-mono text-xs font-bold text-[#2E3192]">{tool.name}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{tool.desc}</p>
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Parâmetros:</div>
                  <div className="space-y-1">
                    {Object.entries(tool.params).map(([param, type]) => (
                      <div key={param} className="text-[11px] font-mono flex justify-between bg-white px-2 py-1 rounded border border-slate-200">
                        <span className="text-slate-800 font-semibold">{param}</span>
                        <span className="text-indigo-600 text-[10px]">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: JSON Schemas Specification */}
      {activeTab === 'schemas' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Definições Estruturadas de Esquemas (JSON Schemas)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Esquemas formais aplicados no backend e nas saídas estruturadas da inteligência artificial.
            </p>
          </div>

          <div className="space-y-4">
            <details className="group border border-slate-200 rounded-xl overflow-hidden" open>
              <summary className="bg-slate-50 px-4 py-3 cursor-pointer text-xs font-bold text-slate-900 flex items-center justify-between hover:bg-slate-100">
                <span>2.1. ContactSchema — Cadastro Completo de Lead & Cliente</span>
                <span className="text-slate-400 text-xs group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-4 bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
                <pre>{`{
  "title": "ContactSchema",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "nome_completo": { "type": "string" },
    "tipo_pessoa": { "type": "string", "enum": ["PF", "PJ"] },
    "cpf_cnpj": { "type": "string" },
    "rg_ie": { "type": "string" },
    "telefone_whatsapp": { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "status_cadastro": { "type": "string", "enum": ["Lead (Novo)", "Em Qualificacao", "Cliente Ativo", "Inativo"] },
    "endereco": { "type": "object", "required": ["logradouro", "numero", "bairro", "cidade", "uf", "cep"] },
    "origem_lead": { "type": "string", "enum": ["Google Ads", "Meta Ads", "Indique e Ganhe B2B", "Site Organico", "Balcao"] },
    "indicador_id": { "type": "string" },
    "qualificacao_sdr": { "type": "string", "enum": ["Novo", "Em Triagem", "MQL (Qualificado)", "Disqualificado"] },
    "tempo_primeira_resposta_minutos": { "type": "integer" }
  },
  "required": ["nome_completo", "tipo_pessoa", "cpf_cnpj", "telefone_whatsapp", "status_cadastro"]
}`}</pre>
              </div>
            </details>

            <details className="group border border-slate-200 rounded-xl overflow-hidden">
              <summary className="bg-slate-50 px-4 py-3 cursor-pointer text-xs font-bold text-slate-900 flex items-center justify-between hover:bg-slate-100">
                <span>2.2. DocumentSchema — Gestão e Custódia Documental</span>
                <span className="text-slate-400 text-xs group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-4 bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
                <pre>{`{
  "title": "DocumentSchema",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "contact_id": { "type": "string", "format": "uuid" },
    "deal_id": { "type": "string", "format": "uuid" },
    "tipo_documento": { 
      "type": "string", 
      "enum": ["RG_CPF_CNH", "Comprovante_Endereco", "Matricula_Atualizada", "IPTU", "Contrato_Gaveta", "Planta_Topografica", "ART_RRT", "Nota_Devolucao"] 
    },
    "file_url": { "type": "string", "format": "uri" },
    "upload_na_qualificacao": { "type": "boolean" },
    "status_validacao": { "type": "string", "enum": ["Pendente", "Aprovado", "Rejeitado_Solicitar_Reenvio"] }
  },
  "required": ["contact_id", "tipo_documento", "file_url", "status_validacao"]
}`}</pre>
              </div>
            </details>

            <details className="group border border-slate-200 rounded-xl overflow-hidden">
              <summary className="bg-slate-50 px-4 py-3 cursor-pointer text-xs font-bold text-slate-900 flex items-center justify-between hover:bg-slate-100">
                <span>2.3. SiteSettingsSchema — Módulo CMS & Configuração Geral do Site</span>
                <span className="text-slate-400 text-xs group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-4 bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
                <pre>{`{
  "title": "SiteSettingsSchema",
  "type": "object",
  "properties": {
    "titulo_site": { "type": "string" },
    "subtitulo_site": { "type": "string" },
    "logo_principal_url": { "type": "string", "format": "uri" },
    "logo_footer_url": { "type": "string", "format": "uri" },
    "css_customizado": { "type": "string" },
    "paleta_cores": {
      "type": "object",
      "properties": {
        "primaria": { "type": "string", "default": "#2E3192" },
        "secundaria": { "type": "string", "default": "#F2EC00" },
        "fundo": { "type": "string", "default": "#FFFFFF" }
      }
    },
    "secao_hero_titulo": { "type": "string" },
    "secao_hero_subtitulo": { "type": "string" },
    "servicos_catalogo": { "type": "array" }
  }
}`}</pre>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};
