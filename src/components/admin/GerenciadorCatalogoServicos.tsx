import React, { useState } from 'react';
import { ServicoCatalogo, CategoriaServico } from '../../types';
import { 
  Building2, 
  Plus, 
  Pencil, 
  Trash2, 
  Globe, 
  LayoutGrid, 
  Clock, 
  DollarSign, 
  FileText, 
  Check, 
  Search, 
  Filter, 
  AlertTriangle, 
  X, 
  ExternalLink,
  ShieldCheck,
  Tag,
  BookOpen,
  Sparkles,
  Layers
} from 'lucide-react';

interface GerenciadorCatalogoServicosProps {
  servicos: ServicoCatalogo[];
  onSaveServico: (servico: ServicoCatalogo) => Promise<void>;
  onDeleteServico: (servicoId: string) => Promise<void>;
}

const CATEGORIAS_LISTA: CategoriaServico[] = [
  'Regularização Fundiária',
  'Direito Sucessório / Família',
  'Engenharia & Topografia',
  'Auditoria & Cartórios',
  'Outros'
];

export const GerenciadorCatalogoServicos: React.FC<GerenciadorCatalogoServicosProps> = ({
  servicos,
  onSaveServico,
  onDeleteServico
}) => {
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<ServicoCatalogo | null>(null);
  const [deletingServico, setDeletingServico] = useState<ServicoCatalogo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState<{
    id: string;
    nome: string;
    categoria: CategoriaServico | string;
    descricao: string;
    icone: string;
    prazo_medio: string;
    honorarios_referencia: number;
    documentos_exigidos: string;
    ativo: boolean;
    exibir_no_site: boolean;
    exibir_no_sistema: boolean;
  }>({
    id: '',
    nome: '',
    categoria: 'Regularização Fundiária',
    descricao: '',
    icone: 'FileCheck',
    prazo_medio: '30 a 90 dias',
    honorarios_referencia: 8500,
    documentos_exigidos: 'Matrícula Atualizada, IPTU, RG/CPF, Contrato de Compra e Venda',
    ativo: true,
    exibir_no_site: true,
    exibir_no_sistema: true
  });

  const handleOpenNovo = () => {
    const nextId = `srv-${Date.now()}`;
    setEditingServico(null);
    setFormData({
      id: nextId,
      nome: '',
      categoria: 'Regularização Fundiária',
      descricao: '',
      icone: 'FileCheck',
      prazo_medio: '30 a 90 dias',
      honorarios_referencia: 8500,
      documentos_exigidos: 'Matrícula Atualizada, IPTU, RG/CPF',
      ativo: true,
      exibir_no_site: true,
      exibir_no_sistema: true
    });
    setModalOpen(true);
  };

  const handleOpenEditar = (servico: ServicoCatalogo) => {
    setEditingServico(servico);
    setFormData({
      id: servico.id,
      nome: servico.nome,
      categoria: servico.categoria || 'Regularização Fundiária',
      descricao: servico.descricao,
      icone: servico.icone || 'FileCheck',
      prazo_medio: servico.prazo_medio || '30 a 90 dias',
      honorarios_referencia: servico.honorarios_referencia || 0,
      documentos_exigidos: servico.documentos_exigidos ? servico.documentos_exigidos.join(', ') : '',
      ativo: servico.ativo !== false,
      exibir_no_site: servico.exibir_no_site !== false,
      exibir_no_sistema: servico.exibir_no_sistema !== false
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.descricao.trim()) return;

    setIsSaving(true);
    try {
      const docsArray = formData.documentos_exigidos
        .split(',')
        .map(d => d.trim())
        .filter(Boolean);

      const servicoFinal: ServicoCatalogo = {
        id: editingServico ? editingServico.id : formData.id,
        nome: formData.nome.trim(),
        categoria: formData.categoria,
        descricao: formData.descricao.trim(),
        icone: formData.icone,
        prazo_medio: formData.prazo_medio,
        honorarios_referencia: Number(formData.honorarios_referencia) || 0,
        documentos_exigidos: docsArray,
        ativo: formData.ativo,
        exibir_no_site: formData.exibir_no_site,
        exibir_no_sistema: formData.exibir_no_sistema
      };

      await onSaveServico(servicoFinal);
      setModalOpen(false);
      setFeedbackMsg(
        editingServico
          ? 'Serviço atualizado com sucesso!'
          : 'Novo serviço criado no catálogo com sucesso!'
      );
      setTimeout(() => setFeedbackMsg(''), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingServico) return;
    setIsDeleting(true);
    try {
      await onDeleteServico(deletingServico.id);
      setDeletingServico(null);
      setFeedbackMsg('Serviço removido do catálogo com sucesso!');
      setTimeout(() => setFeedbackMsg(''), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const servicosFiltrados = servicos.filter(s => {
    const matchBusca = 
      s.nome.toLowerCase().includes(busca.toLowerCase()) ||
      s.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      (s.categoria && s.categoria.toLowerCase().includes(busca.toLowerCase()));
    const matchCat = filtroCategoria === 'todas' || s.categoria === filtroCategoria;
    return matchBusca && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-blue-100 text-blue-900 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#2E3192]" />
                Catálogo de Produtos & Serviços
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {servicos.length} Procedimentos Registrais
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              Menu dos Nossos Serviços (Site & Sistema)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Crie, edite e personalize os serviços oferecidos pela Brasil Legal. As alterações sincronizam automaticamente com a página de vendas pública (site) e com a esteira do CRM/ERP (sistema).
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenNovo}
            className="flex items-center gap-2 bg-[#2E3192] hover:bg-[#252877] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#F2EC00]" />
            Criar Novo Serviço / Produto
          </button>
        </div>

        {feedbackMsg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            {feedbackMsg}
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar serviço por nome, palavras-chave ou categoria..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={filtroCategoria}
              onChange={e => setFiltroCategoria(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium"
            >
              <option value="todas">Todas as Categorias</option>
              {CATEGORIAS_LISTA.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicosFiltrados.map(servico => (
            <div
              key={servico.id}
              className="border border-slate-200 hover:border-[#2E3192]/50 hover:shadow-md transition-all rounded-2xl p-5 bg-slate-50/60 hover:bg-white flex flex-col justify-between gap-4 group"
            >
              <div>
                {/* Category and Visibilities */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-[#2E3192] border border-indigo-100">
                    {servico.categoria || 'Geral'}
                  </span>

                  <div className="flex items-center gap-1">
                    {servico.exibir_no_site && (
                      <span 
                        className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-0.5"
                        title="Exibido na Página de Vendas Pública"
                      >
                        <Globe className="w-2.5 h-2.5" /> Site
                      </span>
                    )}
                    {servico.exibir_no_sistema && (
                      <span 
                        className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 flex items-center gap-0.5"
                        title="Habilitado no Sistema Interno / CRM"
                      >
                        <LayoutGrid className="w-2.5 h-2.5" /> Sistema
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#2E3192] transition-colors">
                  {servico.nome}
                </h3>

                <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                  {servico.descricao}
                </p>

                {/* Prazo and Honorários */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/80 text-[11px]">
                  {servico.prazo_medio && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Prazo: <strong>{servico.prazo_medio}</strong></span>
                    </div>
                  )}

                  {servico.honorarios_referencia ? (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>A partir de <strong>R$ {servico.honorarios_referencia.toLocaleString('pt-BR')}</strong></span>
                    </div>
                  ) : null}
                </div>

                {/* Required Documents checklist preview */}
                {servico.documentos_exigidos && servico.documentos_exigidos.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Docs Exigidos:
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {servico.documentos_exigidos.slice(0, 3).map((d, dIdx) => (
                        <span key={dIdx} className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-600">
                          {d}
                        </span>
                      ))}
                      {servico.documentos_exigidos.length > 3 && (
                        <span className="text-[9px] font-bold text-slate-400">
                          +{servico.documentos_exigidos.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500">
                  ID: <code className="font-mono text-[9px]">{servico.id}</code>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditar(servico)}
                    className="p-1.5 text-slate-600 hover:text-[#2E3192] hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingServico(servico)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: CRIAR OU EDITAR PRODUTO / SERVIÇO */}
      {/* ======================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingServico ? 'Editar Serviço / Produto' : 'Cadastrar Novo Serviço'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configuração para publicação tanto no site como no sistema.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome do Serviço * (Ex: Usucapião, Inventário Judicial, Averbação...)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Usucapião Extrajudicial"
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoria *</label>
                  <select
                    value={formData.categoria}
                    onChange={e => setFormData({ ...formData, categoria: e.target.value as CategoriaServico })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {CATEGORIAS_LISTA.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prazo Médio de Execução</label>
                  <input
                    type="text"
                    placeholder="Ex: 30 a 90 dias, 60 a 120 dias"
                    value={formData.prazo_medio}
                    onChange={e => setFormData({ ...formData, prazo_medio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição Comercial & Jurídica *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva o procedimento e para quem é indicado..."
                  value={formData.descricao}
                  onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Honorários de Referência (R$)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="8500"
                    value={formData.honorarios_referencia}
                    onChange={e => setFormData({ ...formData, honorarios_referencia: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ícone</label>
                  <input
                    type="text"
                    placeholder="FileCheck, Building2, Scale..."
                    value={formData.icone}
                    onChange={e => setFormData({ ...formData, icone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Documentos Exigidos (Separados por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Matrícula Atualizada, IPTU, RG/CPF, Contrato de Compra e Venda"
                  value={formData.documentos_exigidos}
                  onChange={e => setFormData({ ...formData, documentos_exigidos: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              {/* Visibilities Checklist */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-700 block">Onde este serviço será exibido:</span>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.exibir_no_site}
                      onChange={e => setFormData({ ...formData, exibir_no_site: e.target.checked })}
                      className="rounded text-[#2E3192] focus:ring-[#2E3192]"
                    />
                    <span className="font-semibold text-slate-800">Página de Vendas (Site)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.exibir_no_sistema}
                      onChange={e => setFormData({ ...formData, exibir_no_sistema: e.target.checked })}
                      className="rounded text-[#2E3192] focus:ring-[#2E3192]"
                    />
                    <span className="font-semibold text-slate-800">Sistema Operacional / CRM</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#2E3192] text-white rounded-xl font-bold shadow-xs hover:bg-[#252877] cursor-pointer"
                >
                  {isSaving ? 'Salvando...' : editingServico ? 'Atualizar Serviço' : 'Publicar Serviço'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRMAR EXCLUSÃO DE SERVIÇO */}
      {/* ======================================================== */}
      {deletingServico && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Excluir Serviço do Catálogo?
                </h3>
                <p className="text-xs text-slate-500">
                  Ele deixará de ser exibido no site e nos formulários do sistema.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800">{deletingServico.nome}</div>
              <div className="text-slate-500">{deletingServico.categoria}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingServico(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
