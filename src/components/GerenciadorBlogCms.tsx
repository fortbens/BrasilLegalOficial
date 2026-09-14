import React, { useState } from 'react';
import { SiteSettings, ArtigoBlog } from '../types';
import { ImageUploadInput } from './ImageUploadInput';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  CheckCircle2, 
  Save, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  Sparkles, 
  X, 
  Layers, 
  Check, 
  Star,
  FileText,
  Search,
  ExternalLink
} from 'lucide-react';

interface GerenciadorBlogCmsProps {
  settings: SiteSettings;
  onUpdateBlogSettings: (updated: Partial<SiteSettings>) => void;
}

export const GerenciadorBlogCms: React.FC<GerenciadorBlogCmsProps> = ({
  settings,
  onUpdateBlogSettings
}) => {
  const [artigos, setArtigos] = useState<ArtigoBlog[]>(settings.artigos_blog || []);
  const [blogAtivo, setBlogAtivo] = useState<boolean>(settings.blog_exibir !== false);
  const [blogTitulo, setBlogTitulo] = useState<string>(settings.blog_titulo || 'Blog & Conhecimento Notarial');
  const [blogSubtitulo, setBlogSubtitulo] = useState<string>(
    settings.blog_subtitulo || 'Artigos técnicos, novidades regulatórias e guias práticos sobre regularização imobiliária, usucapião e direito registral.'
  );

  // Modal / Form state for article
  const [editingArticle, setEditingArticle] = useState<ArtigoBlog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [readingArticle, setReadingArticle] = useState<ArtigoBlog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const handleToggleBlogAtivo = (ativo: boolean) => {
    setBlogAtivo(ativo);
    onUpdateBlogSettings({
      blog_exibir: ativo,
      blog_titulo: blogTitulo,
      blog_subtitulo: blogSubtitulo,
      artigos_blog: artigos
    });
  };

  const handleSaveHeader = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBlogSettings({
      blog_exibir: blogAtivo,
      blog_titulo: blogTitulo,
      blog_subtitulo: blogSubtitulo,
      artigos_blog: artigos
    });
    setSaveSuccessMsg('Cabeçalho do Blog salvo com sucesso!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
  };

  const handleOpenNewArticle = () => {
    setEditingArticle({
      id: `art-${Date.now()}`,
      titulo: '',
      slug: '',
      resumo: '',
      conteudo: '',
      categoria: 'Regularização Imobiliária',
      autor: {
        nome: 'Dra. Gabriela Albuquerque',
        cargo: 'Advogada Notarial & Especialista Registral',
        foto_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      imagem_capa: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80',
      data_publicacao: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date()),
      tempo_leitura_min: 5,
      tags: ['Regularização', 'Cartório'],
      destaque: false,
      publicado: true
    });
    setIsModalOpen(true);
  };

  const handleEditArticle = (artigo: ArtigoBlog) => {
    setEditingArticle({ ...artigo });
    setIsModalOpen(true);
  };

  const handleDeleteArticle = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este artigo do blog?')) return;
    const novos = artigos.filter(a => a.id !== id);
    setArtigos(novos);
    onUpdateBlogSettings({ artigos_blog: novos });
  };

  const handleTogglePublish = (id: string) => {
    const novos = artigos.map(a => a.id === id ? { ...a, publicado: !a.publicado } : a);
    setArtigos(novos);
    onUpdateBlogSettings({ artigos_blog: novos });
  };

  const handleToggleDestaque = (id: string) => {
    const novos = artigos.map(a => a.id === id ? { ...a, destaque: !a.destaque } : a);
    setArtigos(novos);
    onUpdateBlogSettings({ artigos_blog: novos });
  };

  const handleSaveModalArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.titulo.trim()) return;

    // Generate auto slug if empty
    const slugFinal = editingArticle.slug.trim() || editingArticle.titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const articleToSave: ArtigoBlog = {
      ...editingArticle,
      slug: slugFinal
    };

    const exists = artigos.some(a => a.id === articleToSave.id);
    let novos: ArtigoBlog[];
    if (exists) {
      novos = artigos.map(a => a.id === articleToSave.id ? articleToSave : a);
    } else {
      novos = [articleToSave, ...artigos];
    }

    setArtigos(novos);
    onUpdateBlogSettings({ artigos_blog: novos });
    setIsModalOpen(false);
    setEditingArticle(null);
  };

  const filteredArticles = artigos.filter(a => 
    a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.resumo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Card: Blog Status & Section Texts */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#2E3192] flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-[#2E3192]" />
                CMS Blog & Artigos
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Portal de Conteúdo Institucional
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Configurações do Blog & Gestão de Publicações
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Publique matérias orientativas sobre usucapião, REURB e direito notarial para captar leads orgânicos e educar clientes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={blogAtivo}
                onChange={e => handleToggleBlogAtivo(e.target.checked)}
                className="rounded text-[#2E3192] focus:ring-[#2E3192] w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-800">
                {blogAtivo ? 'Blog Exibido no Site' : 'Blog Oculto no Site'}
              </span>
            </label>

            <button
              type="button"
              onClick={handleOpenNewArticle}
              className="flex items-center gap-2 bg-[#2E3192] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-[#252877] cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#F2EC00]" />
              Novo Artigo
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mt-4 bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {saveSuccessMsg}
          </div>
        )}

        <form onSubmit={handleSaveHeader} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Título da Seção de Blog no Site
            </label>
            <input
              type="text"
              value={blogTitulo}
              onChange={e => setBlogTitulo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
              placeholder="Ex: Blog & Conhecimento Notarial"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Subtítulo / Descrição da Seção
            </label>
            <input
              type="text"
              value={blogSubtitulo}
              onChange={e => setBlogSubtitulo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300"
              placeholder="Ex: Artigos técnicos e guias práticos sobre regularização fundiária..."
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-[#2E3192]" />
              Salvar Cabeçalho da Seção
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar artigo por título, categoria ou assunto..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#2E3192]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <span>Total de artigos: <strong className="text-slate-900">{artigos.length}</strong></span>
          <span>•</span>
          <span>Publicados: <strong className="text-emerald-600">{artigos.filter(a => a.publicado).length}</strong></span>
          <span>•</span>
          <span>Em Destaque: <strong className="text-amber-600">{artigos.filter(a => a.destaque).length}</strong></span>
        </div>
      </div>

      {/* Articles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map(artigo => (
          <div
            key={artigo.id}
            className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between shadow-xs ${
              artigo.publicado ? 'border-slate-200 hover:border-slate-300' : 'border-dashed border-amber-300 bg-amber-50/20'
            }`}
          >
            <div>
              {/* Cover Image & Badges */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={artigo.imagem_capa || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80'}
                  alt={artigo.titulo}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                  <span className="bg-[#2E3192] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded shadow-sm">
                    {artigo.categoria}
                  </span>
                  {artigo.destaque && (
                    <span className="bg-[#F2EC00] text-[#2E3192] text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      Destaque
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-xs ${
                    artigo.publicado ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {artigo.publicado ? 'Publicado' : 'Rascunho'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {artigo.data_publicacao}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {artigo.tempo_leitura_min} min de leitura
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-[#2E3192] transition-colors">
                  {artigo.titulo}
                </h3>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                  {artigo.resumo}
                </p>

                {/* Tags */}
                {artigo.tags && artigo.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-3">
                    {artigo.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer with Author & Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {artigo.autor.foto_url ? (
                  <img
                    src={artigo.autor.foto_url}
                    alt={artigo.autor.nome}
                    className="w-7 h-7 rounded-full object-cover border border-slate-300 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="truncate text-left">
                  <p className="text-[11px] font-bold text-slate-800 truncate">{artigo.autor.nome}</p>
                  <p className="text-[9px] text-slate-400 truncate">{artigo.autor.cargo}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  title="Pré-visualizar Artigo"
                  onClick={() => setReadingArticle(artigo)}
                  className="p-1.5 text-slate-500 hover:text-[#2E3192] hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title="Editar Artigo"
                  onClick={() => handleEditArticle(artigo)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title={artigo.destaque ? "Remover Destaque" : "Marcar como Destaque"}
                  onClick={() => handleToggleDestaque(artigo.id)}
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    artigo.destaque ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-amber-500'
                  }`}
                >
                  <Star className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title="Excluir Artigo"
                  onClick={() => handleDeleteArticle(artigo.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">Nenhum artigo encontrado</h3>
          <p className="text-xs text-slate-500 mt-1">Crie o primeiro artigo para educar seus clientes e turbinar as buscas.</p>
          <button
            type="button"
            onClick={handleOpenNewArticle}
            className="mt-4 inline-flex items-center gap-2 bg-[#2E3192] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#F2EC00]" />
            Criar Artigo Agora
          </button>
        </div>
      )}

      {/* MODAL: EDIT / CREATE ARTICLE */}
      {isModalOpen && editingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2E3192]" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  {artigos.some(a => a.id === editingArticle.id) ? 'Editar Artigo' : 'Novo Artigo do Blog'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModalArticle} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Título da Matéria / Artigo *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingArticle.titulo}
                    onChange={e => setEditingArticle({ ...editingArticle, titulo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm text-slate-900"
                    placeholder="Ex: Como Regularizar Imóvel de Herança em Cartório sem Processo Judicial"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Categoria *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingArticle.categoria}
                    onChange={e => setEditingArticle({ ...editingArticle, categoria: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="Ex: Usucapião, REURB, Direito Notarial"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tempo Estimado de Leitura (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={editingArticle.tempo_leitura_min}
                    onChange={e => setEditingArticle({ ...editingArticle, tempo_leitura_min: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Resumo / Lead da Notícia (Exibido no card e redes sociais) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editingArticle.resumo}
                    onChange={e => setEditingArticle({ ...editingArticle, resumo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800"
                    placeholder="Breve resumo atraente de 1 a 2 parágrafos..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <ImageUploadInput
                    label="Imagem de Capa do Artigo (URL ou Upload)"
                    value={editingArticle.imagem_capa}
                    onChange={url => setEditingArticle({ ...editingArticle, imagem_capa: url })}
                    placeholder="https://images.unsplash.com/..."
                    helperText="Recomendado: 1200x630px para visualização otimizada no Google e WhatsApp"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nome do Autor
                  </label>
                  <input
                    type="text"
                    value={editingArticle.autor.nome}
                    onChange={e => setEditingArticle({
                      ...editingArticle,
                      autor: { ...editingArticle.autor, nome: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cargo / Especialidade do Autor
                  </label>
                  <input
                    type="text"
                    value={editingArticle.autor.cargo}
                    onChange={e => setEditingArticle({
                      ...editingArticle,
                      autor: { ...editingArticle.autor, cargo: e.target.value }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Conteúdo Completo do Artigo (Markdown ou Texto Estruturado) *
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={editingArticle.conteudo}
                    onChange={e => setEditingArticle({ ...editingArticle, conteudo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs leading-relaxed"
                    placeholder="Escreva os tópicos do artigo aqui. Você pode usar títulos (###), tópicos (-) e negrito (**)."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={(editingArticle.tags || []).join(', ')}
                    onChange={e => setEditingArticle({
                      ...editingArticle,
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="Usucapião, Cartório, Matrícula"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Data de Publicação
                  </label>
                  <input
                    type="text"
                    value={editingArticle.data_publicacao}
                    onChange={e => setEditingArticle({ ...editingArticle, data_publicacao: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-3 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingArticle.publicado}
                    onChange={e => setEditingArticle({ ...editingArticle, publicado: e.target.checked })}
                    className="rounded text-[#2E3192] focus:ring-[#2E3192] w-4 h-4"
                  />
                  <span className="font-bold text-slate-800">Publicar imediatamente no site</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingArticle.destaque}
                    onChange={e => setEditingArticle({ ...editingArticle, destaque: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                  />
                  <span className="font-bold text-slate-800">Destacar no topo da página</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#2E3192] text-white px-5 py-2 rounded-xl font-bold hover:bg-[#252877] shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#F2EC00]" />
                  Salvar Artigo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW / READING ARTICLE */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="relative h-64 w-full bg-slate-100">
              <img
                src={readingArticle.imagem_capa}
                alt={readingArticle.titulo}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setReadingArticle(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4">
                <span className="bg-[#2E3192] text-white text-xs font-bold px-3 py-1 rounded shadow">
                  {readingArticle.categoria}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{readingArticle.data_publicacao}</span>
                <span>•</span>
                <span>{readingArticle.tempo_leitura_min} min de leitura</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {readingArticle.titulo}
              </h2>

              <p className="text-sm font-semibold text-slate-700 border-l-4 border-[#2E3192] pl-3 py-1 bg-slate-50 rounded-r-lg">
                {readingArticle.resumo}
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-3 py-3 border-y border-slate-100">
                {readingArticle.autor.foto_url && (
                  <img
                    src={readingArticle.autor.foto_url}
                    alt={readingArticle.autor.nome}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{readingArticle.autor.nome}</h4>
                  <p className="text-[11px] text-slate-500">{readingArticle.autor.cargo}</p>
                </div>
              </div>

              {/* Body */}
              <div className="prose prose-sm max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {readingArticle.conteudo}
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(readingArticle.tags || []).map((t, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2.5 py-1 rounded-full font-semibold">
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setReadingArticle(null)}
                  className="bg-[#2E3192] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#252877] cursor-pointer"
                >
                  Fechar Visualização
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
