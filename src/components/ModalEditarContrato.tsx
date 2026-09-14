import React, { useState } from 'react';
import { 
  X, 
  Save, 
  FileSignature, 
  DollarSign, 
  Calendar, 
  Building2, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  Hash,
  CheckCircle2,
  FileText,
  RotateCcw
} from 'lucide-react';
import { ContratoAssinatura, Signatario } from '../types';
import { generateSha256 } from '../utils/contractTemplates';

interface ModalEditarContratoProps {
  contrato: ContratoAssinatura;
  onClose: () => void;
  onSalvar: (contratoAtualizado: ContratoAssinatura) => void;
}

export const ModalEditarContrato: React.FC<ModalEditarContratoProps> = ({
  contrato,
  onClose,
  onSalvar
}) => {
  const [titulo, setTitulo] = useState(contrato.titulo);
  const [objetoImovel, setObjetoImovel] = useState(contrato.objeto_imovel);
  const [valorTotal, setValorTotal] = useState<number>(contrato.valor_total || 0);
  const [condicoesPagamento, setCondicoesPagamento] = useState(contrato.condicoes_pagamento || '');
  const [conteudoTexto, setConteudoTexto] = useState(contrato.conteudo_documento_texto || '');
  const [signatarios, setSignatarios] = useState<Signatario[]>([...contrato.signatarios]);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Calculate live hash
  const currentHash = generateSha256(conteudoTexto, contrato.id);

  const handleUpdateSignatario = (index: number, campo: keyof Signatario, valor: string) => {
    const updated = [...signatarios];
    updated[index] = { ...updated[index], [campo]: valor };
    setSignatarios(updated);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const contratoAtualizado: ContratoAssinatura = {
        ...contrato,
        titulo,
        objeto_imovel: objetoImovel,
        valor_total: valorTotal,
        condicoes_pagamento: condicoesPagamento,
        conteudo_documento_texto: conteudoTexto,
        signatarios,
        hash_sha256_original: currentHash
      };

      // Call API if available
      try {
        await fetch(`/api/contratos-assinatura/${contrato.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contratoAtualizado)
        });
      } catch (err) {
        console.warn('API offline, atualizando localmente:', err);
      }

      onSalvar(contratoAtualizado);
      setSucesso(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Erro ao salvar contrato:', err);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-slate-200 text-slate-700">
                  {contrato.id}
                </span>
                <h3 className="text-lg font-semibold text-slate-900">Editar e Reparametrizar Contrato</h3>
              </div>
              <p className="text-xs text-slate-500">
                Ajuste os termos contratuais, cláusulas da minuta e dados das partes com integridade jurídica.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSalvar} className="flex-1 overflow-y-auto p-6 space-y-6">
          {sucesso && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm font-medium">Contrato atualizado e reparametrizado com sucesso! Hash criptográfico renovado.</p>
            </div>
          )}

          {/* Dados Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Título do Contrato / Instrumento
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm text-slate-900 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Valor Total dos Honorários (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                <input
                  type="number"
                  step="100"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm font-medium text-slate-900 outline-none transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Individualização do Imóvel / Objeto Registral
              </label>
              <input
                type="text"
                value={objetoImovel}
                onChange={(e) => setObjetoImovel(e.target.value)}
                placeholder="Ex: Lote 14, Quadra B, com 320m², situado em Campinas/SP..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm text-slate-900 outline-none transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Condições de Pagamento e Parcelamento
              </label>
              <input
                type="text"
                value={condicoesPagamento}
                onChange={(e) => setCondicoesPagamento(e.target.value)}
                placeholder="Ex: Entrada de 30% via Pix e saldo em 10 parcelas via boleto bancário..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 text-sm text-slate-900 outline-none transition-all"
              />
            </div>
          </div>

          {/* Minuta Textual / Cláusulas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Texto Completo da Minuta Contratual (Cláusulas Legais)
              </label>
              <span className="text-xs text-slate-400">
                {conteudoTexto.length} caracteres • {conteudoTexto.split(/\s+/).filter(Boolean).length} palavras
              </span>
            </div>
            <textarea
              rows={12}
              value={conteudoTexto}
              onChange={(e) => setConteudoTexto(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed text-slate-800 bg-slate-50/50 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition-all"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
              <span className="flex items-center gap-1.5 font-mono">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                Hash SHA-256 Calculado: <strong className="text-slate-700">{currentHash.substring(0, 20)}...</strong>
              </span>
              <span className="text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Conformidade MP 2.200-2 & Lei 14.063/2020
              </span>
            </div>
          </div>

          {/* Signatários */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Signatários Cadastrados ({signatarios.length})
              </h4>
            </div>

            <div className="space-y-3">
              {signatarios.map((s, idx) => (
                <div key={s.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Papel</label>
                    <span className="inline-block px-2 py-1 rounded bg-slate-200 text-slate-700 font-medium">
                      {s.papel}
                    </span>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={s.nome}
                      onChange={(e) => handleUpdateSignatario(idx, 'nome', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">CPF</label>
                    <input
                      type="text"
                      value={s.cpf}
                      onChange={(e) => handleUpdateSignatario(idx, 'cpf', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-medium mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={s.telefone_whatsapp}
                      onChange={(e) => handleUpdateSignatario(idx, 'telefone_whatsapp', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
          >
            Cancelar
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {salvando ? 'Salvando...' : 'Salvar Alterações do Contrato'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
