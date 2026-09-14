import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Save, 
  Sparkles, 
  Plus, 
  RotateCcw, 
  Check, 
  Copy, 
  Eye, 
  Edit3, 
  Layers, 
  Tag, 
  ShieldCheck, 
  HelpCircle,
  FileCheck2,
  Trash2,
  Building2,
  Scale
} from 'lucide-react';
import { ModeloContratoPadrao } from '../types';
import { 
  PARAMETROS_MINUTAS_PADRAO, 
  ParametroMinuta, 
  substituirParametrosMinuta,
  initialModelosContratosPadrao 
} from '../utils/contractTemplates';

interface GerenciadorMinutasPadraoProps {
  modelos: ModeloContratoPadrao[];
  onSalvarModelo: (modeloAtualizado: ModeloContratoPadrao) => void;
  onCriarNovoModelo?: (novoModelo: ModeloContratoPadrao) => void;
  onExcluirModelo?: (id: string) => void;
}

export const GerenciadorMinutasPadrao: React.FC<GerenciadorMinutasPadraoProps> = ({
  modelos,
  onSalvarModelo,
  onCriarNovoModelo,
  onExcluirModelo
}) => {
  const [selectedId, setSelectedId] = useState<string>(modelos[0]?.id || 'mod-reurb');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas');
  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'simulador' | 'parametros'>('editor');
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentModelo = modelos.find(m => m.id === selectedId) || modelos[0];

  // Local state for editing the active model
  const [titulo, setTitulo] = useState(currentModelo?.titulo || '');
  const [descricao, setDescricao] = useState(currentModelo?.descricao || '');
  const [versao, setVersao] = useState(currentModelo?.versao || 'v1.0');
  const [conteudo, setConteudo] = useState(currentModelo?.conteudo_minuta || '');

  // Keep local state in sync when selection changes
  const handleSelectModelo = (m: ModeloContratoPadrao) => {
    setSelectedId(m.id);
    setTitulo(m.titulo);
    setDescricao(m.descricao);
    setVersao(m.versao);
    setConteudo(m.conteudo_minuta);
    setFeedback(null);
  };

  // Insert parameter tag at cursor position
  const handleInsertTag = (tag: string) => {
    if (!textareaRef.current) {
      setConteudo(prev => prev + ' ' + tag);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = conteudo;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);

    setConteudo(before + tag + after);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);

    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  // Mock values for the live simulator
  const mockSimulatorValues: Record<string, string> = {
    '{RAZAO_SOCIAL}': 'Brasil Legal Soluções Imobiliárias e Registrais Ltda',
    '{CNPJ_EMPRESA}': '38.491.820/0001-55',
    '{ENDERECO_EMPRESA}': 'Av. Brigadeiro Faria Lima, 3477 - Itaim Bibi, São Paulo/SP - CEP 04538-133',
    '{NOME_CLIENTE}': 'Carlos Eduardo Silveira & Esposa',
    '{CPF_CNPJ}': '189.442.908-11',
    '{TELEFONE_WHATSAPP}': '(19) 98741-2099',
    '{EMAIL_CLIENTE}': 'carlos.silveira@gmail.com',
    '{ENDERECO_CLIENTE}': 'Rua das Figueiras, nº 450, Jardim Alvorada, Campinas/SP - CEP 13088-210',
    '{OBJETO_IMOVEL}': 'Imóvel residencial urbano com área de 320,50 m² e 184,20 m² de área construída, situado no Lote 14, Quadra B, Jardim Alvorada, Comarca de Campinas/SP.',
    '{VALOR_HONORARIOS}': 'R$ 18.500,00 (dezoito mil e quinhentos reais)',
    '{CONDICOES_PAGAMENTO}': 'Entrada de R$ 5.550,00 (30%) via Pix no ato da assinatura e o saldo de R$ 12.950,00 dividido em 10 parcelas mensais de R$ 1.295,00 via boleto bancário.',
    '{PRAZO_MESES}': '6 (seis) meses para protocolo e saneamento registral',
    '{FORO_COMARCA}': 'Comarca de Campinas/SP',
    '{DATA_EXTENSO}': `Campinas/SP, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`
  };

  const simulatedText = substituirParametrosMinuta(conteudo, mockSimulatorValues);

  const handleSalvar = async () => {
    if (!currentModelo) return;
    setSalvando(true);

    try {
      const modeloAtualizado: ModeloContratoPadrao = {
        ...currentModelo,
        titulo,
        descricao,
        versao,
        conteudo_minuta: conteudo,
        ultima_modificacao: new Date().toISOString(),
        autor_modificacao: 'Administrador / Jurídico'
      };

      // Call server endpoint
      try {
        await fetch(`/api/contratos-templates/${currentModelo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(modeloAtualizado)
        });
      } catch (err) {
        console.warn('API de templates indisponível, persistindo em memória:', err);
      }

      onSalvarModelo(modeloAtualizado);
      setFeedback('Minuta padrão salva e padronizada com sucesso em todo o sistema!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar minuta:', err);
    } finally {
      setSalvando(false);
    }
  };

  const handleRestaurarPadrao = () => {
    const original = initialModelosContratosPadrao.find(m => m.id === currentModelo.id || m.codigo === currentModelo.codigo);
    if (original) {
      setConteudo(original.conteudo_minuta);
      setTitulo(original.titulo);
      setDescricao(original.descricao);
      setFeedback('Minuta restaurada para o padrão jurídico oficial.');
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  const categorias = ['Todas', 'Regularização Fundiária', 'Usucapião', 'Mandato & Procuração', 'Declarações', 'Compliance & LGPD', 'Contratos de Honorários'];

  const modelosFiltrados = categoriaFiltro === 'Todas' 
    ? modelos 
    : modelos.filter(m => m.categoria === categoriaFiltro);

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
              <Scale className="w-3.5 h-3.5" />
              Padronização Jurídica & Compliance Registral
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Gerenciador de Minutas e Parâmetros Contratuais
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Edite as cláusulas padrão da Brasil Legal e use parâmetros dinâmicos (tags como <code className="text-emerald-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded text-xs">{'{NOME_CLIENTE}'}</code>). Os novos contratos gerados pelo SDR e advogados adotarão essa redação automaticamente.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const novoId = `mod-custom-${Date.now()}`;
                const novoMod: ModeloContratoPadrao = {
                  id: novoId,
                  codigo: `CUSTOM_${Date.now()}`,
                  titulo: 'Novo Modelo Contratual Customizado',
                  descricao: 'Minuta customizada criada pelo usuário.',
                  categoria: 'Contratos de Honorários',
                  versao: 'v1.0 Custom',
                  ativo: true,
                  ultima_modificacao: new Date().toISOString(),
                  variaveis_suportadas: PARAMETROS_MINUTAS_PADRAO.map(p => p.tag),
                  conteudo_minuta: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS TÉCNICOS E JURÍDICOS\n\nCONTRATADA: {RAZAO_SOCIAL}, CNPJ: {CNPJ_EMPRESA}.\nCONTRATANTE: {NOME_CLIENTE}, CPF: {CPF_CNPJ}.\n\nCLÁUSULA PRIMEIRA – DO OBJETO\nO presente instrumento tem por objeto: {OBJETO_IMOVEL}.\n\nHonorários: {VALOR_HONORARIOS}.\nCondições: {CONDICOES_PAGAMENTO}.\n\n{DATA_EXTENSO}.`
                };
                if (onCriarNovoModelo) onCriarNovoModelo(novoMod);
                handleSelectModelo(novoMod);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs md:text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Criar Novo Modelo
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in duration-200">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-medium">{feedback}</span>
        </div>
      )}

      {/* Main Grid: Sidebar of Templates + Editor Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Modelos de Contratos ({modelosFiltrados.length})
              </h3>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    categoriaFiltro === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {modelosFiltrados.map(m => {
                const isSelected = m.id === selectedId;
                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectModelo(m)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                        {m.titulo}
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        isSelected ? 'bg-emerald-200/80 text-emerald-900' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {m.versao}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {m.descricao}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-medium text-slate-600">{m.categoria}</span>
                      <span>Atualizado: {new Date(m.ultima_modificacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Editor & Simulator */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Header / Sub-tabs */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveSubTab('editor')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeSubTab === 'editor'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editor da Minuta
                </button>
                <button
                  onClick={() => setActiveSubTab('simulador')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeSubTab === 'simulador'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Simulador / Pré-visualização Real
                </button>
                <button
                  onClick={() => setActiveSubTab('parametros')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeSubTab === 'parametros'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  Dicionário de Parâmetros ({PARAMETROS_MINUTAS_PADRAO.length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestaurarPadrao}
                  title="Restaurar padrão jurídico original"
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar Padrão
                </button>
                <button
                  onClick={handleSalvar}
                  disabled={salvando}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {salvando ? 'Salvando...' : 'Salvar e Padronizar'}
                </button>
              </div>
            </div>

            {/* Model Metadata Form */}
            <div className="p-6 border-b border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/30">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Nome do Modelo Oficial
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Versão Registrada
                </label>
                <input
                  type="text"
                  value={versao}
                  onChange={(e) => setVersao(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Descrição e Finalidade Registral
                </label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            </div>

            {/* Parameter Insertion Toolbar */}
            {activeSubTab === 'editor' && (
              <div className="px-6 py-3 border-b border-slate-100 bg-slate-100/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-600" />
                    Inserir Parâmetro Dinâmico na Posição do Cursor (Clique para Inserir):
                  </span>
                  {copiedTag && (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Tag {copiedTag} inserida!
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto py-1">
                  {PARAMETROS_MINUTAS_PADRAO.map(param => (
                    <button
                      key={param.tag}
                      type="button"
                      onClick={() => handleInsertTag(param.tag)}
                      title={`${param.label}: ${param.descricao}`}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/60 text-slate-700 hover:text-emerald-900 font-mono text-[11px] flex items-center gap-1 transition-all"
                    >
                      <span>{param.tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Body Tabs */}
            <div className="p-6 flex-1">
              {activeSubTab === 'editor' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Cláusulas do Instrumento (formato texto com tags)</span>
                    <span>{conteudo.length} caracteres • {conteudo.split(/\n/).length} linhas</span>
                  </div>
                  <textarea
                    ref={textareaRef}
                    rows={18}
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed text-slate-800 bg-slate-50/30 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all resize-y"
                  />
                </div>
              )}

              {activeSubTab === 'simulador' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
                    <Eye className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-950 mb-0.5">Simulação em Tempo Real com Dados Reais</h4>
                      <p className="text-blue-800 leading-relaxed">
                        Este é o resultado que o cliente e os cartórios receberão quando o contrato for emitido pelo sistema, substituindo as tags pelos dados de cadastro do cliente, do imóvel e do escritório.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-inner max-h-[500px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800">
                      {simulatedText}
                    </pre>
                  </div>
                </div>
              )}

              {activeSubTab === 'parametros' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Tabela de Variáveis e Campos Mapeados no Sistema
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                          <th className="p-3 font-semibold">Parâmetro / Tag</th>
                          <th className="p-3 font-semibold">Campo / Significado</th>
                          <th className="p-3 font-semibold">Descrição</th>
                          <th className="p-3 font-semibold">Exemplo Gerado</th>
                          <th className="p-3 font-semibold text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {PARAMETROS_MINUTAS_PADRAO.map(param => (
                          <tr key={param.tag} className="hover:bg-slate-50/70">
                            <td className="p-3 font-mono font-bold text-emerald-700">{param.tag}</td>
                            <td className="p-3 font-medium text-slate-900">{param.label}</td>
                            <td className="p-3 text-slate-500">{param.descricao}</td>
                            <td className="p-3 font-mono text-[11px] text-slate-600">{param.exemplo}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleInsertTag(param.tag)}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-medium text-[11px] transition-colors"
                              >
                                Inserir
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
