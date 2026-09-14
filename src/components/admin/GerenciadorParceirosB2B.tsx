import React, { useState } from 'react';
import { ParceiroB2B, TipoParceiro, TipoChavePix } from '../../types';
import { 
  Award, 
  UserPlus, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Lock, 
  Check, 
  Search, 
  Filter, 
  ShieldCheck, 
  CreditCard, 
  Briefcase, 
  Mail, 
  Phone, 
  DollarSign, 
  Percent, 
  AlertTriangle, 
  X,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface GerenciadorParceirosB2BProps {
  parceiros: ParceiroB2B[];
  onSaveParceiro: (parceiro: ParceiroB2B) => Promise<void>;
  onDeleteParceiro: (parceiroId: string) => Promise<void>;
}

const TIPOS_PARCEIROS_LISTA: TipoParceiro[] = [
  'Arquitetos',
  'Engenheiros',
  'Corretores',
  'Imobiliarias',
  'Amigos',
  'Advogados',
  'Servidor Publico',
  'Outros'
];

const TIPOS_CHAVE_PIX_LISTA: TipoChavePix[] = [
  'CPF',
  'CNPJ',
  'Email',
  'Telefone',
  'Chave_Aleatoria'
];

export const GerenciadorParceirosB2B: React.FC<GerenciadorParceirosB2BProps> = ({
  parceiros,
  onSaveParceiro,
  onDeleteParceiro
}) => {
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [mostrarSenhas, setMostrarSenhas] = useState<{ [id: string]: boolean }>({});

  // Modals state
  const [modalParceiroOpen, setModalParceiroOpen] = useState(false);
  const [editingParceiro, setEditingParceiro] = useState<ParceiroB2B | null>(null);
  const [deletingParceiro, setDeletingParceiro] = useState<ParceiroB2B | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState<{
    id: string;
    nome: string;
    tipo: TipoParceiro;
    email_login: string;
    senha: string;
    telefone: string;
    cpf_cnpj: string;
    registro_profissional: string;
    percentual_comissao: number;
    chave_pix: string;
    tipo_chave_pix: TipoChavePix;
    banco_titular: string;
    ativo: boolean;
    observacoes: string;
  }>({
    id: '',
    nome: '',
    tipo: 'Corretores',
    email_login: '',
    senha: '',
    telefone: '',
    cpf_cnpj: '',
    registro_profissional: '',
    percentual_comissao: 5.0,
    chave_pix: '',
    tipo_chave_pix: 'Telefone',
    banco_titular: '',
    ativo: true,
    observacoes: ''
  });

  const toggleMostrarSenha = (id: string) => {
    setMostrarSenhas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenNovo = () => {
    const nextIdNum = parceiros.length + 10;
    setEditingParceiro(null);
    setFormData({
      id: `PARC-B2B-${nextIdNum}`,
      nome: '',
      tipo: 'Corretores',
      email_login: '',
      senha: 'brasillegal' + Math.floor(1000 + Math.random() * 9000),
      telefone: '',
      cpf_cnpj: '',
      registro_profissional: '',
      percentual_comissao: 5.0, // Livre para ajuste
      chave_pix: '',
      tipo_chave_pix: 'Telefone',
      banco_titular: '',
      ativo: true,
      observacoes: ''
    });
    setModalParceiroOpen(true);
  };

  const handleOpenEditar = (p: ParceiroB2B) => {
    setEditingParceiro(p);
    setFormData({
      id: p.id,
      nome: p.nome,
      tipo: p.tipo,
      email_login: p.email_login,
      senha: p.senha || 'parceiro2026',
      telefone: p.telefone,
      cpf_cnpj: p.cpf_cnpj || '',
      registro_profissional: p.registro_profissional || '',
      percentual_comissao: p.percentual_comissao,
      chave_pix: p.chave_pix,
      tipo_chave_pix: p.tipo_chave_pix,
      banco_titular: p.banco_titular || '',
      ativo: p.ativo,
      observacoes: p.observacoes || ''
    });
    setModalParceiroOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.email_login.trim() || !formData.senha.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const parceiroFinal: ParceiroB2B = {
        ...formData,
        id: editingParceiro ? editingParceiro.id : formData.id,
        data_cadastro: editingParceiro ? editingParceiro.data_cadastro : new Date().toISOString().split('T')[0],
        total_indicacoes: editingParceiro ? editingParceiro.total_indicacoes : 0,
        total_comissoes_geradas: editingParceiro ? editingParceiro.total_comissoes_geradas : 0
      };

      await onSaveParceiro(parceiroFinal);
      setModalParceiroOpen(false);
      setFeedbackMsg(
        editingParceiro 
          ? 'Parceiro atualizado com sucesso!' 
          : 'Novo parceiro cadastrado com sucesso!'
      );
      setTimeout(() => setFeedbackMsg(''), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingParceiro) return;
    setIsDeleting(true);
    try {
      await onDeleteParceiro(deletingParceiro.id);
      setDeletingParceiro(null);
      setFeedbackMsg('Parceiro excluído com sucesso!');
      setTimeout(() => setFeedbackMsg(''), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtering
  const parceirosFiltrados = parceiros.filter(p => {
    const matchBusca = 
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.email_login.toLowerCase().includes(busca.toLowerCase()) ||
      p.id.toLowerCase().includes(busca.toLowerCase()) ||
      (p.registro_profissional && p.registro_profissional.toLowerCase().includes(busca.toLowerCase()));
    const matchTipo = filtroTipo === 'todos' || p.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || (filtroStatus === 'ativos' ? p.ativo : !p.ativo);
    return matchBusca && matchTipo && matchStatus;
  });

  // Calculate stats
  const totalParceiros = parceiros.length;
  const mediaComissao = parceiros.length > 0
    ? (parceiros.reduce((acc, p) => acc + p.percentual_comissao, 0) / parceiros.length).toFixed(1)
    : '5.0';
  const totalIndicacoes = parceiros.reduce((acc, p) => acc + (p.total_indicacoes || 0), 0);
  const totalComissoes = parceiros.reduce((acc, p) => acc + (p.total_comissoes_geradas || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                Programa Indique e Ganhe B2B
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {totalParceiros} Parceiros Cadastrados
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              Parceiros & Indicadores Comerciais
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestão de parcerias com advogados, engenheiros, arquitetos, corretores e imobiliárias. Acesso ao painel do parceiro protegido por <strong>Login e Senha</strong> (evitando vulnerabilidade de telefone), comissões customizadas caso a caso e chave PIX cadastrada.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenNovo}
            className="flex items-center gap-2 bg-[#2E3192] hover:bg-[#252877] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 text-[#F2EC00]" />
            Cadastrar Novo Parceiro
          </button>
        </div>

        {feedbackMsg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            {feedbackMsg}
          </div>
        )}

        {/* KPI Mini Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500">Total de Parceiros</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{totalParceiros}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Indicadores ativos</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500">Média de Comissão</div>
            <div className="text-xl font-bold text-[#2E3192] mt-1">{mediaComissao}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Livre por negociação</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500">Total de Indicações</div>
            <div className="text-xl font-bold text-emerald-700 mt-1">{totalIndicacoes}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Imóveis encaminhados</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] font-semibold text-slate-500">Comissões Pagas/Geradas</div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              R$ {totalComissoes.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Repassadas via PIX</div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar parceiro por nome, e-mail, código ou registro profissional..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium"
            >
              <option value="todos">Todos os Tipos</option>
              {TIPOS_PARCEIROS_LISTA.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium"
            >
              <option value="todos">Todos Status</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
          </div>
        </div>

        {/* Partners Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Código / Parceiro</th>
                <th className="px-4 py-3">Tipo & Registro</th>
                <th className="px-4 py-3">Acesso Seguro (Login & Senha)</th>
                <th className="px-4 py-3">Comissão Negociada</th>
                <th className="px-4 py-3">Chave PIX & Banco</th>
                <th className="px-4 py-3">Desempenho</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {parceirosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                    Nenhum parceiro encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                parceirosFiltrados.map(p => {
                  const isSenhaVisivel = !!mostrarSenhas[p.id];
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name and Code */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <span>{p.nome}</span>
                          {!p.ativo && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                              Inativo
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-[#2E3192] font-semibold mt-0.5">
                          {p.id}
                        </div>
                        {p.telefone && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{p.telefone}</span>
                          </div>
                        )}
                      </td>

                      {/* Type and Professional Registration */}
                      <td className="px-4 py-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 inline-block mb-1">
                          {p.tipo}
                        </span>
                        {p.registro_profissional && (
                          <div className="text-[10px] font-mono text-emerald-800 font-semibold">
                            {p.registro_profissional}
                          </div>
                        )}
                        {p.cpf_cnpj && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {p.cpf_cnpj}
                          </div>
                        )}
                      </td>

                      {/* Login and Password Credentials */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          <div className="text-[11px] font-semibold text-slate-800 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="font-mono text-[10px]">{p.email_login}</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                            <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {isSenhaVisivel ? p.senha || 'parceiro2026' : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleMostrarSenha(p.id)}
                              className="text-slate-400 hover:text-slate-700 p-0.5"
                              title={isSenhaVisivel ? 'Ocultar senha' : 'Exibir senha'}
                            >
                              {isSenhaVisivel ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                          <span className="text-[9px] text-emerald-700 font-medium block">
                            ✓ Login seguro ativado
                          </span>
                        </div>
                      </td>

                      {/* Custom Commission Percentage */}
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-black text-[#2E3192] flex items-center gap-1">
                          <span>{p.percentual_comissao}%</span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          sobre honorários líquidos
                        </span>
                      </td>

                      {/* PIX Key and Bank */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <div className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-emerald-600" />
                            <span>{p.tipo_chave_pix}:</span>
                            <strong className="font-mono text-slate-900">{p.chave_pix}</strong>
                          </div>
                          {p.banco_titular && (
                            <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                              {p.banco_titular}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Performance */}
                      <td className="px-4 py-3.5">
                        <div className="text-[11px] font-bold text-slate-800">
                          {p.total_indicacoes || 0} indicações
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          R$ {(p.total_comissoes_geradas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditar(p)}
                            className="p-1.5 text-slate-500 hover:text-[#2E3192] hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar parceiro"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingParceiro(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir parceiro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: CRIAR / EDITAR PARCEIRO */}
      {/* ======================================================== */}
      {modalParceiroOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingParceiro ? 'Editar Parceiro B2B' : 'Cadastrar Novo Parceiro & Indicador'}
                </h3>
                <p className="text-xs text-slate-500">
                  Preencha os dados cadastrais, comissão negociada e credenciais de acesso seguro ao painel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalParceiroOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome Completo / Razão Social *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Mendes Imóveis"
                    value={formData.nome}
                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Parceiro *</label>
                  <select
                    value={formData.tipo}
                    onChange={e => setFormData({ ...formData, tipo: e.target.value as TipoParceiro })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800"
                  >
                    {TIPOS_PARCEIROS_LISTA.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Login Credentials (Secure Email and Password) */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-[#2E3192]">
                  <KeyRound className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase tracking-wide">
                    Credenciais de Acesso ao Painel do Parceiro (Seguro)
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  O parceiro utilizará este e-mail e senha para visualizar seu extrato de comissões e clientes indicados de forma segura.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">E-mail de Login *</label>
                    <input
                      type="email"
                      required
                      placeholder="parceiro@escritorio.com.br"
                      value={formData.email_login}
                      onChange={e => setFormData({ ...formData, email_login: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Senha de Acesso *</label>
                    <input
                      type="text"
                      required
                      placeholder="Defina uma senha segura"
                      value={formData.senha}
                      onChange={e => setFormData({ ...formData, senha: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Phone, CPF/CNPJ, Professional Registration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefone WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={formData.telefone}
                    onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">CPF ou CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={formData.cpf_cnpj}
                    onChange={e => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registro (OAB/CREA/CRECI/CAU)</label>
                  <input
                    type="text"
                    placeholder="Ex: CRECI 148.910-J"
                    value={formData.registro_profissional}
                    onChange={e => setFormData({ ...formData, registro_profissional: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Dynamic Commission Percentage and PIX Details */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Comissão & Dados Financeiros (PIX)
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Percentual liberado caso a caso
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Comissão Negociada (%) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="50"
                        required
                        value={formData.percentual_comissao}
                        onChange={e => setFormData({ ...formData, percentual_comissao: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-[#2E3192]"
                      />
                      <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      Não padronizado em 5%
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipo da Chave PIX</label>
                    <select
                      value={formData.tipo_chave_pix}
                      onChange={e => setFormData({ ...formData, tipo_chave_pix: e.target.value as TipoChavePix })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      {TIPOS_CHAVE_PIX_LISTA.map(tp => (
                        <option key={tp} value={tp}>{tp}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Chave PIX *</label>
                    <input
                      type="text"
                      required
                      placeholder="Chave para repasse das comissões"
                      value={formData.chave_pix}
                      onChange={e => setFormData({ ...formData, chave_pix: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Banco / Titular da Conta</label>
                  <input
                    type="text"
                    placeholder="Ex: Banco Itaú (341) - Agência 0123 / CC 45678-9 - Carlos Mendes"
                    value={formData.banco_titular}
                    onChange={e => setFormData({ ...formData, banco_titular: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              {/* Status and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Observações do Acordo</label>
                  <input
                    type="text"
                    placeholder="Ex: Escritório com foco em inventários na comarca de Campinas."
                    value={formData.observacoes}
                    onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status do Parceiro</label>
                  <select
                    value={formData.ativo ? 'ativo' : 'inativo'}
                    onChange={e => setFormData({ ...formData, ativo: e.target.value === 'ativo' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold"
                  >
                    <option value="ativo">Ativo (Pode Indicar)</option>
                    <option value="inativo">Inativo / Pausado</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalParceiroOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#2E3192] text-white rounded-xl font-bold shadow-xs hover:bg-[#252877] cursor-pointer"
                >
                  {isSaving ? 'Salvando...' : editingParceiro ? 'Atualizar Parceiro' : 'Salvar Parceiro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRMAR EXCLUSÃO DE PARCEIRO */}
      {/* ======================================================== */}
      {deletingParceiro && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Excluir Parceiro B2B?
                </h3>
                <p className="text-xs text-slate-500">
                  Esta ação removerá as credenciais de login e desvinculará novos cadastros.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800">{deletingParceiro.nome}</div>
              <div className="text-slate-500">{deletingParceiro.tipo} • Código: {deletingParceiro.id}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                E-mail: {deletingParceiro.email_login} • Comissão: {deletingParceiro.percentual_comissao}%
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingParceiro(null)}
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
