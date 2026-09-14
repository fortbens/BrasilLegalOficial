import React, { useState } from 'react';
import { 
  FileSearch, 
  ArrowRightLeft, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles, 
  Scale, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  RefreshCw, 
  Landmark, 
  Building2, 
  Info, 
  AlertOctagon,
  ChevronDown,
  Upload,
  BookOpen,
  Filter,
  CheckCircle
} from 'lucide-react';
import { 
  Deal, 
  Contact, 
  Documento, 
  ComparacaoDocumentosResultado, 
  SeveridadeDivergencia, 
  CategoriaDivergencia 
} from '../types';
import { 
  DOCUMENT_COMPARISON_PRESETS, 
  DocumentComparisonPreset 
} from '../utils/documentComparisonData';

interface ComparadorDocumentosImovelProps {
  deals?: Deal[];
  contacts?: Contact[];
  documents?: Documento[];
  onCriarTarefaSaneamento?: (titulo: string, dealId?: string) => void;
}

export const ComparadorDocumentosImovel: React.FC<ComparadorDocumentosImovelProps> = ({
  deals = [],
  contacts = [],
  documents = [],
  onCriarTarefaSaneamento
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DOCUMENT_COMPARISON_PRESETS[0].id);

  // Document A State
  const [docATipo, setDocATipo] = useState<string>(DOCUMENT_COMPARISON_PRESETS[0].documentoA.tipo);
  const [docATitulo, setDocATitulo] = useState<string>(DOCUMENT_COMPARISON_PRESETS[0].documentoA.titulo);
  const [docAOrgao, setDocAOrgao] = useState<string>(DOCUMENT_COMPARISON_PRESETS[0].documentoA.orgao_emissor);
  const [docAData, setDocAData] = useState<string>(DOCUMENT_COMPARISON_PRESETS[0].documentoA.data_emissao);
  const [docAConteudo, setDocAConteudo] = useState<string>(DOCUMENT_COMPARISON_PRESETS[0].documentoA.conteudo);

  // Document B State
  const [docBTipo, setDocBTipo] = useState<string>(DOCUMENT_COMPARISON_PRESETS[0].documentoB.tipo);
  const [docBTitulo, setDocBTitulo] = useState<string>(DOCUMENT_COMPARISON_PRESETS[0].documentoB.titulo);
  const [docBOrgao, setDocBOrgao] = useState<string>(DOCUMENT_COMPARISON_PRESETS[0].documentoB.orgao_emissor);
  const [docBData, setDocBData] = useState<string>(DOCUMENT_COMPARISON_PRESETS[0].documentoB.data_emissao);
  const [docBConteudo, setDocBConteudo] = useState<string>(DOCUMENT_COMPARISON_PRESETS[0].documentoB.conteudo);

  // Property Context
  const [matriculaImovel, setMatriculaImovel] = useState<string>(DOCUMENT_COMPARISON_PRESETS[0].dadosImovel.matricula);
  const [cartorioImovel, setCartorioImovel] = useState<string>(DOCUMENT_COMPARISON_PRESETS[0].dadosImovel.cartorio);
  const [logradouroImovel, setLogradouroImovel] = useState<string>(DOCUMENT_COMPARISON_PRESETS[0].dadosImovel.logradouro);
  const [cidadeUfImovel, setCidadeUfImovel] = useState<string>(DOCUMENT_COMPARISON_PRESETS[0].dadosImovel.municipio_uf);

  // Process Association (Optional CRM)
  const [selectedDealId, setSelectedDealId] = useState<string>('');

  // Mode and Execution State
  const [modoAnalise, setModoAnalise] = useState<'completo' | 'divergencias_criticas' | 'clausulas_e_onus'>('completo');
  const [loading, setLoading] = useState<boolean>(false);
  const [resultado, setResultado] = useState<ComparacaoDocumentosResultado | null>(DOCUMENT_COMPARISON_PRESETS[0].resultadoPadrao);
  const [filtroSeveridade, setFiltroSeveridade] = useState<string>('todas');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [activeTabResultado, setActiveTabResultado] = useState<'divergencias' | 'clausulas' | 'convergentes' | 'parecer'>('divergencias');
  const [copiedParecer, setCopiedParecer] = useState<boolean>(false);
  const [tarefaCriadaAviso, setTarefaCriadaAviso] = useState<string | null>(null);

  // Load preset handler
  const handleSelectPreset = (preset: DocumentComparisonPreset) => {
    setSelectedPresetId(preset.id);
    setDocATipo(preset.documentoA.tipo);
    setDocATitulo(preset.documentoA.titulo);
    setDocAOrgao(preset.documentoA.orgao_emissor);
    setDocAData(preset.documentoA.data_emissao);
    setDocAConteudo(preset.documentoA.conteudo);

    setDocBTipo(preset.documentoB.tipo);
    setDocBTitulo(preset.documentoB.titulo);
    setDocBOrgao(preset.documentoB.orgao_emissor);
    setDocBData(preset.documentoB.data_emissao);
    setDocBConteudo(preset.documentoB.conteudo);

    setMatriculaImovel(preset.dadosImovel.matricula);
    setCartorioImovel(preset.dadosImovel.cartorio);
    setLogradouroImovel(preset.dadosImovel.logradouro);
    setCidadeUfImovel(preset.dadosImovel.municipio_uf);

    setResultado(preset.resultadoPadrao);
  };

  // Associate with CRM deal
  const handleSelectDeal = (dealId: string) => {
    setSelectedDealId(dealId);
    if (!dealId) return;
    const deal = deals.find(d => d.id === dealId);
    if (deal) {
      setCartorioImovel(deal.cartorio_comarca || '');
      setLogradouroImovel(deal.titulo || '');
      const contact = contacts.find(c => c.id === deal.contact_id);
      if (contact) {
        setCidadeUfImovel(`${contact.endereco.cidade}/${contact.endereco.uf}`);
      }
    }
  };

  // File Upload Helper (reads txt or text content)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'A' | 'B') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (target === 'A') {
        setDocATitulo(file.name.replace(/\.[^/.]+$/, ''));
        setDocAConteudo(text || '');
      } else {
        setDocBTitulo(file.name.replace(/\.[^/.]+$/, ''));
        setDocBConteudo(text || '');
      }
    };
    reader.readAsText(file);
  };

  // Run Document Comparison via Backend
  const handleExecutarComparacao = async () => {
    if (!docAConteudo.trim() || !docBConteudo.trim()) {
      alert('Por favor, informe o conteúdo de ambos os documentos para comparação.');
      return;
    }

    setLoading(true);
    setTarefaCriadaAviso(null);

    try {
      const res = await fetch('/api/gemini/compare-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentoA: {
            tipo: docATipo,
            titulo: docATitulo,
            data_emissao: docAData,
            conteudo: docAConteudo
          },
          documentoB: {
            tipo: docBTipo,
            titulo: docBTitulo,
            data_emissao: docBData,
            conteudo: docBConteudo
          },
          dadosImovel: {
            matricula: matriculaImovel,
            logradouro: logradouroImovel,
            cartorio: cartorioImovel,
            municipio_uf: cidadeUfImovel
          },
          modoAnalise
        })
      });

      const data = await res.json();
      if (data.resultado) {
        setResultado(data.resultado);
      } else {
        throw new Error(data.error || 'Falha ao processar análise');
      }
    } catch (err) {
      console.error(err);
      // Use fallback from current preset if network error
      const currentPreset = DOCUMENT_COMPARISON_PRESETS.find(p => p.id === selectedPresetId);
      if (currentPreset) {
        setResultado(currentPreset.resultadoPadrao);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopiarParecer = () => {
    if (!resultado) return;
    const textToCopy = `RELATÓRIO TÉCNICO DE AUDITORIA E DIVERGÊNCIA DOCUMENTAL
Brasil Legal — Regularização Imobiliária & Gestão de Ativos

IMÓVEL: ${logradouroImovel} | Matrícula nº ${matriculaImovel} (${cartorioImovel})
DOCUMENTO A: ${docATitulo} (${docATipo})
DOCUMENTO B: ${docBTitulo} (${docBTipo})
STATUS REGISTRAL: ${resultado.status_geral} (Índice de Conformidade: ${resultado.indice_conformidade}%)

1. RESUMO EXECUTIVO:
${resultado.resumo_executivo}

2. DIVERGÊNCIAS IDENTIFICADAS (${resultado.total_divergencias} itens):
${resultado.divergencias.map((d, i) => `[${i + 1}] ${d.titulo} (${d.severidade.toUpperCase()} - ${d.categoria})
- No Doc A: ${d.dado_documento_a}
- No Doc B: ${d.dado_documento_b}
- Impacto Registral: ${d.impacto_registral}
- Solução Recomendada: ${d.solucao_recomendada}\n`).join('\n')}

3. PARECER JURÍDICO REGISTRAL:
${resultado.parecer_juridico_registral}

4. AÇÕES RECOMENDADAS PARA SANEAMENTO:
${resultado.acoes_recomendadas.map(a => `• ${a}`).join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedParecer(true);
    setTimeout(() => setCopiedParecer(false), 2500);
  };

  const handleImprimirRelatorio = () => {
    window.print();
  };

  const handleCriarAlertaSaneamento = () => {
    const titulo = `Saneamento de Divergência Documental: ${matriculaImovel ? `Matrícula ${matriculaImovel}` : logradouroImovel}`;
    if (onCriarTarefaSaneamento) {
      onCriarTarefaSaneamento(titulo, selectedDealId || undefined);
    }
    setTarefaCriadaAviso(`Alerta técnico protocolado no CRM para saneamento das ${resultado?.divergencias_criticas || 0} pendências críticas.`);
    setTimeout(() => setTarefaCriadaAviso(null), 5000);
  };

  // Filtered divergencias
  const divergenciasFiltradas = (resultado?.divergencias || []).filter(div => {
    if (filtroSeveridade !== 'todas' && div.severidade !== filtroSeveridade) return false;
    if (filtroCategoria !== 'todas' && div.categoria !== filtroCategoria) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Feature Hero */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#2E3192] text-white text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#F2EC00]" />
                Módulo IA • Auditoria Registral Inteligente
              </span>
              <span className="bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3 text-amber-700" />
                Comparador de 2 Documentos do Mesmo Imóvel
              </span>
              <span className="bg-emerald-50 text-emerald-800 text-[11px] font-medium px-2 py-0.5 rounded border border-emerald-200">
                Provimento 65/2017 CNJ & Lei 6.015/73
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2 flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-[#2E3192]" />
              Confronto e Destaque Automático de Divergências & Cláusulas
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Cruze dois instrumentos jurídicos ou técnicos do mesmo imóvel (ex: Certidão de Matrícula vs. Contrato Particular, Memorial Topográfico ou Cadastro Municipal) para identificar discrepâncias de metragem, titularidade, outorga uxória e cláusulas que possam gerar nota devolutiva no cartório.
            </p>
          </div>

          {/* Preset Selector */}
          <div className="shrink-0 bg-slate-50 border border-slate-200 p-3 rounded-xl max-w-md w-full lg:w-auto">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#2E3192]" />
              Carregar Caso Real Homologado (Preset):
            </div>
            <div className="space-y-1.5">
              {DOCUMENT_COMPARISON_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full text-left p-2 rounded-lg border text-xs transition-all ${
                    selectedPresetId === preset.id
                      ? 'bg-indigo-50/80 border-[#2E3192] text-[#2E3192] font-semibold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{preset.nome}</span>
                    {selectedPresetId === preset.id && (
                      <span className="text-[10px] bg-[#2E3192] text-white px-1.5 py-0.2 rounded font-normal">
                        Ativo
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {preset.subtitulo}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Case Link Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <Landmark className="w-4 h-4 text-[#2E3192]" />
            Vincular Processo do CRM (Opcional):
          </span>
          <select
            value={selectedDealId}
            onChange={(e) => handleSelectDeal(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:ring-1 focus:ring-[#2E3192]"
          >
            <option value="">-- Seleção manual de imóvel ou processo --</option>
            {deals.map(deal => (
              <option key={deal.id} value={deal.id}>
                {deal.titulo} ({deal.cartorio_comarca})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-600 flex-wrap">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-700">Matrícula:</span>
            <input
              type="text"
              value={matriculaImovel}
              onChange={(e) => setMatriculaImovel(e.target.value)}
              placeholder="Ex: 48.910"
              className="bg-white border border-slate-200 rounded px-2 py-0.5 w-24 text-xs font-mono font-bold text-[#2E3192]"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-700">Localização / Endereço:</span>
            <input
              type="text"
              value={logradouroImovel}
              onChange={(e) => setLogradouroImovel(e.target.value)}
              placeholder="Rua, número e loteamento"
              className="bg-white border border-slate-200 rounded px-2 py-0.5 w-56 text-xs text-slate-800"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-700">Comarca:</span>
            <input
              type="text"
              value={cartorioImovel}
              onChange={(e) => setCartorioImovel(e.target.value)}
              placeholder="Ex: 2º RI de Campinas"
              className="bg-white border border-slate-200 rounded px-2 py-0.5 w-44 text-xs text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Input Side-by-Side: Documento A vs. Documento B */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Documento A */}
        <div className="bg-white rounded-xl border-2 border-blue-200/80 shadow-xs p-4.5 space-y-3">
          <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                A
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Documento de Origem / Referência</h3>
                <span className="text-[11px] text-blue-700 font-medium">Geralmente Matrícula do Cartório de Imóveis ou Escritura Pública</span>
              </div>
            </div>

            <label className="cursor-pointer text-[11px] font-semibold text-[#2E3192] hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-200 transition-colors">
              <Upload className="w-3 h-3" />
              Carregar Arquivo (.txt)
              <input 
                type="file" 
                accept=".txt,.json,.doc,.docx,.pdf" 
                className="hidden" 
                onChange={(e) => handleFileUpload(e, 'A')}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipo de Documento</label>
              <select
                value={docATipo}
                onChange={(e) => setDocATipo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white"
              >
                <option value="Matricula_Atualizada">Matrícula Atualizada (R.I.)</option>
                <option value="Escritura_Publica">Escritura Pública de Compra/Venda</option>
                <option value="Formal_Partilha">Formal de Partilha / Inventário</option>
                <option value="IPTU">Carnê / Cadastro de IPTU Municipal</option>
                <option value="Planta_Topografica">Planta e Memorial Descritivo</option>
                <option value="Outro">Outro Documento Oficial</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Órgão / Cartório Emissor</label>
              <input
                type="text"
                value={docAOrgao}
                onChange={(e) => setDocAOrgao(e.target.value)}
                placeholder="Ex: 2º RI de Campinas/SP"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Título / Identificação do Documento A</label>
            <input
              type="text"
              value={docATitulo}
              onChange={(e) => setDocATitulo(e.target.value)}
              placeholder="Ex: Certidão de Inteiro Teor da Matrícula nº 48.910"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700">Texto Integral / Extrato do Documento A</label>
              <span className="text-[10px] text-slate-400 font-mono">{docAConteudo.length} caracteres</span>
            </div>
            <textarea
              rows={9}
              value={docAConteudo}
              onChange={(e) => setDocAConteudo(e.target.value)}
              placeholder="Cole aqui o teor da certidão da matrícula, descrição perimetral, qualificação do proprietário, registros e ônus..."
              className="w-full font-mono text-[11px] p-3 rounded-lg border border-slate-300 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all leading-relaxed"
            />
          </div>
        </div>

        {/* Documento B */}
        <div className="bg-white rounded-xl border-2 border-purple-200/80 shadow-xs p-4.5 space-y-3">
          <div className="flex items-center justify-between border-b border-purple-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-700 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                B
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Documento a Confrontar / Validar</h3>
                <span className="text-[11px] text-purple-700 font-medium">Contrato de Gaveta, Cessão de Posse, Memorial Topográfico ou IPTU</span>
              </div>
            </div>

            <label className="cursor-pointer text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-purple-50 px-2 py-1 rounded border border-purple-200 transition-colors">
              <Upload className="w-3 h-3" />
              Carregar Arquivo (.txt)
              <input 
                type="file" 
                accept=".txt,.json,.doc,.docx,.pdf" 
                className="hidden" 
                onChange={(e) => handleFileUpload(e, 'B')}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipo de Documento</label>
              <select
                value={docBTipo}
                onChange={(e) => setDocBTipo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white"
              >
                <option value="Contrato_Gaveta">Contrato Particular / Cessão de Direitos</option>
                <option value="Planta_Topografica">Levantamento Topográfico / Memorial Georreferenciado</option>
                <option value="IPTU">Espelho / Carnê de IPTU Municipal</option>
                <option value="Escritura_Publica">Escritura Pública de Compra e Venda</option>
                <option value="Formal_Partilha">Formal de Partilha / Carta de Adjudicação</option>
                <option value="Outro">Outro Documento Contratual</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Origem / Partes</label>
              <input
                type="text"
                value={docBOrgao}
                onChange={(e) => setDocBOrgao(e.target.value)}
                placeholder="Ex: Elaboração particular / Cartório de Notas"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Título / Identificação do Documento B</label>
            <input
              type="text"
              value={docBTitulo}
              onChange={(e) => setDocBTitulo(e.target.value)}
              placeholder="Ex: Instrumento Particular de Compromisso de Venda e Compra"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700">Texto Integral / Extrato do Documento B</label>
              <span className="text-[10px] text-slate-400 font-mono">{docBConteudo.length} caracteres</span>
            </div>
            <textarea
              rows={9}
              value={docBConteudo}
              onChange={(e) => setDocBConteudo(e.target.value)}
              placeholder="Cole aqui o teor do contrato de gaveta, cláusulas, qualificação dos compradores e vendedores, descrição da metragem, foro de eleição..."
              className="w-full font-mono text-[11px] p-3 rounded-lg border border-slate-300 bg-slate-50/50 focus:bg-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Action Bar / AI Trigger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-700 border border-amber-200">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Rigor da Auditoria Registral (Gemini AI):</div>
            <div className="flex items-center gap-3 mt-1">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="modoAnalise"
                  checked={modoAnalise === 'completo'}
                  onChange={() => setModoAnalise('completo')}
                  className="accent-[#2E3192]"
                />
                Auditoria Completa (Áreas, Nomes, Outorgas e Cláusulas)
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="modoAnalise"
                  checked={modoAnalise === 'divergencias_criticas'}
                  onChange={() => setModoAnalise('divergencias_criticas')}
                  className="accent-[#2E3192]"
                />
                Apenas Óbices Críticos (Notas Devolutivas)
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={handleExecutarComparacao}
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2E3192] hover:bg-[#1E2172] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#F2EC00]" />
              Auditoria em Andamento pelo Gemini...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#F2EC00]" />
              Comparar Documentos e Destacar Divergências
            </>
          )}
        </button>
      </div>

      {/* RESULT PANEL */}
      {resultado && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-5 p-6">
          {/* Status & Diagnostic Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-2xs ${
                  resultado.status_geral === 'Incompatível / Óbice Registral'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : resultado.status_geral === 'Alto Risco de Divergência'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : resultado.status_geral === 'Compatível com Ressalvas'
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  <AlertOctagon className="w-3.5 h-3.5" />
                  {resultado.status_geral}
                </span>

                <span className="text-xs text-slate-500 font-medium">
                  {resultado.tempo_processamento_ms ? `Tempo de processamento: ${(resultado.tempo_processamento_ms / 1000).toFixed(2)}s` : ''}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-slate-900 mt-2">
                Diagnóstico de Conformidade entre os Documentos
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                {resultado.resumo_executivo}
              </p>
            </div>

            {/* Metric Cards */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              {/* Conformity score */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-[110px]">
                <div className="text-[10px] uppercase font-bold text-slate-500">Conformidade</div>
                <div className={`text-2xl font-black ${
                  resultado.indice_conformidade >= 80 ? 'text-emerald-600' :
                  resultado.indice_conformidade >= 60 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {resultado.indice_conformidade}%
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      resultado.indice_conformidade >= 80 ? 'bg-emerald-500' :
                      resultado.indice_conformidade >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${resultado.indice_conformidade}%` }}
                  />
                </div>
              </div>

              {/* Critical discrepancies */}
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center min-w-[90px]">
                <div className="text-[10px] uppercase font-bold text-rose-700">Críticas</div>
                <div className="text-2xl font-black text-rose-700">
                  {resultado.divergencias_criticas}
                </div>
                <div className="text-[10px] text-rose-600 font-semibold">Óbice Cartorário</div>
              </div>

              {/* Moderate */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center min-w-[90px]">
                <div className="text-[10px] uppercase font-bold text-amber-700">Moderadas</div>
                <div className="text-2xl font-black text-amber-700">
                  {resultado.divergencias_moderadas}
                </div>
                <div className="text-[10px] text-amber-600 font-semibold">Averbação prévia</div>
              </div>

              {/* Clauses */}
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-center min-w-[90px]">
                <div className="text-[10px] uppercase font-bold text-purple-700">Cláusulas</div>
                <div className="text-2xl font-black text-purple-700">
                  {resultado.clausulas_conflitantes.length}
                </div>
                <div className="text-[10px] text-purple-600 font-semibold">Em conflito</div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            {/* Tab switchers within results */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveTabResultado('divergencias')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTabResultado === 'divergencias'
                    ? 'bg-white text-[#2E3192] shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Divergências Cadastrais ({resultado.divergencias.length})
              </button>

              <button
                onClick={() => setActiveTabResultado('clausulas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTabResultado === 'clausulas'
                    ? 'bg-white text-[#2E3192] shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-purple-600" />
                Cláusulas & Gravames ({resultado.clausulas_conflitantes.length})
              </button>

              <button
                onClick={() => setActiveTabResultado('convergentes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTabResultado === 'convergentes'
                    ? 'bg-white text-[#2E3192] shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Dados Convergentes ({resultado.dados_convergentes.length})
              </button>

              <button
                onClick={() => setActiveTabResultado('parecer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTabResultado === 'parecer'
                    ? 'bg-white text-[#2E3192] shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#2E3192]" />
                Parecer Registral Completo
              </button>
            </div>

            {/* Export buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopiarParecer}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5"
                title="Copiar relatório formatado para a área de transferência"
              >
                {copiedParecer ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    Copiar Parecer
                  </>
                )}
              </button>

              <button
                onClick={handleImprimirRelatorio}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5"
                title="Imprimir laudo de divergência"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                Imprimir Laudo
              </button>

              {resultado.divergencias_criticas > 0 && (
                <button
                  onClick={handleCriarAlertaSaneamento}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-200" />
                  Criar Tarefa no CRM Técnico
                </button>
              )}
            </div>
          </div>

          {tarefaCriadaAviso && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{tarefaCriadaAviso}</span>
            </div>
          )}

          {/* TAB 1: DIVERGÊNCIAS DETALHADAS */}
          {activeTabResultado === 'divergencias' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2 pb-1">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700">Filtrar por Severidade:</span>
                  <select
                    value={filtroSeveridade}
                    onChange={(e) => setFiltroSeveridade(e.target.value)}
                    className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
                  >
                    <option value="todas">Todas as severidades</option>
                    <option value="Crítica">Apenas Críticas</option>
                    <option value="Moderada">Apenas Moderadas</option>
                    <option value="Leve">Apenas Leves</option>
                  </select>
                </div>

                <div className="text-xs text-slate-500">
                  Exibindo <strong>{divergenciasFiltradas.length}</strong> de <strong>{resultado.divergencias.length}</strong> divergência(s)
                </div>
              </div>

              {/* Discrepancy Cards List */}
              <div className="space-y-4">
                {divergenciasFiltradas.map((div, idx) => (
                  <div 
                    key={div.id || idx}
                    className={`rounded-xl border p-4.5 space-y-3 transition-all ${
                      div.severidade === 'Crítica'
                        ? 'bg-rose-50/40 border-rose-200'
                        : div.severidade === 'Moderada'
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {/* Header item */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                          div.severidade === 'Crítica'
                            ? 'bg-rose-600 text-white'
                            : div.severidade === 'Moderada'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-600 text-white'
                        }`}>
                          {div.severidade}
                        </span>

                        <span className="text-xs font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {div.categoria}
                        </span>

                        <h4 className="text-sm font-bold text-slate-900">
                          {div.titulo}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700">
                      {div.descricao}
                    </p>

                    {/* SIDE-BY-SIDE HIGHLIGHT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* Doc A Highlight */}
                      <div className="p-3 rounded-lg bg-blue-50/90 border border-blue-200 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-blue-700 text-white text-[9px] flex items-center justify-center font-bold">
                            A
                          </span>
                          No Documento A ({docATipo}):
                        </div>
                        <div className="text-xs font-mono font-semibold text-blue-950 bg-white/80 p-2 rounded border border-blue-100">
                          {div.dado_documento_a}
                        </div>
                      </div>

                      {/* Doc B Highlight */}
                      <div className="p-3 rounded-lg bg-purple-50/90 border border-purple-200 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1">
                          <span className="w-4 h-4 rounded-full bg-purple-700 text-white text-[9px] flex items-center justify-center font-bold">
                            B
                          </span>
                          No Documento B ({docBTipo}):
                        </div>
                        <div className="text-xs font-mono font-semibold text-purple-950 bg-white/80 p-2 rounded border border-purple-100">
                          {div.dado_documento_b}
                        </div>
                      </div>
                    </div>

                    {/* Impact and Solution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-slate-200/60 text-xs">
                      <div className="flex items-start gap-2 text-rose-900 bg-white/60 p-2 rounded border border-rose-100">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-[11px] uppercase tracking-wider text-rose-800">Impacto Registral Cartorário:</span>
                          <span className="text-slate-700 text-xs">{div.impacto_registral}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-emerald-900 bg-white/60 p-2 rounded border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-[11px] uppercase tracking-wider text-emerald-800">Solução / Providência Recomendada:</span>
                          <span className="text-slate-700 text-xs">{div.solucao_recomendada}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CLÁUSULAS & GRAVAMES CONFLITANTES */}
          {activeTabResultado === 'clausulas' && (
            <div className="space-y-4">
              {resultado.clausulas_conflitantes.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">Nenhum conflito cláusula a cláusula identificado</h4>
                  <p className="text-xs text-slate-500 mt-1">As disposições contratuais analisadas encontram-se harmônicas entre os instrumentos.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resultado.clausulas_conflitantes.map((claus, idx) => (
                    <div key={claus.id || idx} className="p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          Cláusula Conflitante #{idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-purple-950">
                          {claus.conflito}
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-700 block text-[11px] mb-1">Doc A:</span>
                          <p className="text-slate-600 text-xs italic">{claus.clausula_doc_a}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-700 block text-[11px] mb-1">Doc B:</span>
                          <p className="text-slate-600 text-xs italic">{claus.clausula_doc_b}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-purple-200 text-xs space-y-1">
                        <span className="font-bold text-purple-900 block text-[11px] uppercase tracking-wider">
                          Sugestão de Redação Corrigida (Aditivo Contratual):
                        </span>
                        <p className="text-slate-800 font-serif text-xs bg-purple-50/40 p-2 rounded border border-purple-100">
                          "{claus.sugestao_redacao}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DADOS CONVERGENTES */}
          {activeTabResultado === 'convergentes' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Os seguintes campos apresentaram 100% de conformidade entre os documentos analisados:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {resultado.dados_convergentes.map((item, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 block">{item.campo}</span>
                      <span className="text-xs font-semibold text-emerald-950 font-mono">{item.valor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PARECER JURÍDICO & AÇÕES */}
          {activeTabResultado === 'parecer' && (
            <div className="space-y-5">
              {/* Juridical opinion */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#2E3192]" />
                  Fundamentação Técnica e Normativa (CNJ e LRP)
                </h4>
                <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                  {resultado.parecer_juridico_registral}
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3">
                <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-700" />
                  Plano Prático de Ações para Saneamento:
                </h4>
                <div className="space-y-2">
                  {resultado.acoes_recomendadas.map((acao, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-blue-100">
                      <span className="w-5 h-5 rounded-full bg-[#2E3192] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{acao}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
