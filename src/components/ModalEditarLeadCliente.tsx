import React, { useState } from 'react';
import { Contact, QualificacaoSdr } from '../types';
import { 
  X, 
  Save, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  DollarSign, 
  Search, 
  CheckCircle2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { buscarEnderecoPorCep, formatarCep } from '../services/cepService';

interface ModalEditarLeadClienteProps {
  isOpen?: boolean;
  contact: Contact | null;
  onClose: () => void;
  onSave: (contactId: string, updates: Partial<Contact>) => Promise<void> | void;
  onDelete?: (contactId: string) => Promise<void> | void;
}

export const ModalEditarLeadCliente: React.FC<ModalEditarLeadClienteProps> = ({
  isOpen = true,
  contact,
  onClose,
  onSave,
  onDelete
}) => {
  if (!isOpen || !contact) return null;

  const [nome, setNome] = useState(contact.nome_completo || '');
  const [cpfCnpj, setCpfCnpj] = useState(contact.cpf_cnpj || '');
  const [telefone, setTelefone] = useState(contact.telefone_whatsapp || '');
  const [email, setEmail] = useState(contact.email || '');
  const [status, setStatus] = useState<QualificacaoSdr>(contact.qualificacao_sdr || 'Lead');
  const [servico, setServico] = useState(contact.servico_pretendido || 'Usucapião Extrajudicial');
  const [tipoImovel, setTipoImovel] = useState(contact.tipo_imovel || 'Casa Urbana');
  const [valorHonorarios, setValorHonorarios] = useState<number | string>(contact.valor_honorarios_estimado || '');
  const [observacoes, setObservacoes] = useState(contact.observacoes || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Endereço
  const [cep, setCep] = useState(contact.endereco?.cep || '');
  const [logradouro, setLogradouro] = useState(contact.endereco?.logradouro || '');
  const [numero, setNumero] = useState(contact.endereco?.numero || '');
  const [complemento, setComplemento] = useState(contact.endereco?.complemento || '');
  const [bairro, setBairro] = useState(contact.endereco?.bairro || '');
  const [cidade, setCidade] = useState(contact.endereco?.cidade || '');
  const [uf, setUf] = useState(contact.endereco?.uf || 'SP');

  // Sync state whenever contact changes
  React.useEffect(() => {
    if (contact) {
      setNome(contact.nome_completo || '');
      setCpfCnpj(contact.cpf_cnpj || '');
      setTelefone(contact.telefone_whatsapp || '');
      setEmail(contact.email || '');
      setStatus(contact.qualificacao_sdr || 'Lead');
      setServico(contact.servico_pretendido || 'Usucapião Extrajudicial');
      setTipoImovel(contact.tipo_imovel || 'Casa Urbana');
      setValorHonorarios(contact.valor_honorarios_estimado || '');
      setObservacoes(contact.observacoes || '');
      setCep(contact.endereco?.cep || '');
      setLogradouro(contact.endereco?.logradouro || '');
      setNumero(contact.endereco?.numero || '');
      setComplemento(contact.endereco?.complemento || '');
      setBairro(contact.endereco?.bairro || '');
      setCidade(contact.endereco?.cidade || '');
      setUf(contact.endereco?.uf || 'SP');
    }
  }, [contact]);

  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleBuscarCep = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setCepFeedback('CEP deve conter 8 dígitos.');
      return;
    }
    await handleBuscarCepAuto(cleanCep);
  };

  const handleBuscarCepAuto = async (cleanCep: string) => {
    setIsSearchingCep(true);
    setCepFeedback(null);
    try {
      const res = await buscarEnderecoPorCep(cleanCep);
      if (res && res.logradouro !== undefined) {
        setLogradouro(res.logradouro || '');
        setBairro(res.bairro || '');
        setCidade(res.cidade || '');
        setUf(res.uf || 'SP');
        setCep(formatarCep(cleanCep));
      } else {
        setCepFeedback('CEP não encontrado na base dos Correios.');
      }
    } catch {
      setCepFeedback('Erro ao consultar CEP.');
    } finally {
      setIsSearchingCep(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updates: Partial<Contact> = {
        nome_completo: nome.trim(),
        cpf_cnpj: cpfCnpj.trim(),
        telefone_whatsapp: telefone.trim(),
        email: email.trim(),
        qualificacao_sdr: status,
        servico_pretendido: servico,
        tipo_imovel: tipoImovel,
        valor_honorarios_estimado: valorHonorarios ? Number(valorHonorarios) : undefined,
        observacoes: observacoes.trim(),
        endereco: {
          cep: cep.trim(),
          logradouro: logradouro.trim(),
          numero: numero.trim(),
          complemento: complemento.trim(),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          uf: uf.trim()
        }
      };

      await onSave(contact.id, updates);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 600);
    } catch (err) {
      console.error('Erro ao atualizar contato:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#2E3192] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <User className="w-5 h-5 text-[#F2EC00]" />
            </div>
            <div>
              <h3 className="text-base font-bold">Edição Completa de Lead / Cliente</h3>
              <p className="text-xs text-indigo-200">
                Atualize os dados cadastrais, endereço e status no CRM em tempo real
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              Alterações salvas e sincronizadas com sucesso!
            </div>
          )}

          {/* Dados Pessoais */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#2E3192]" />
              Dados Principais do Titular
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent outline-none"
                  placeholder="Nome do cliente ou razão social"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CPF ou CNPJ
                </label>
                <input
                  type="text"
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent outline-none font-mono"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefone / WhatsApp *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent outline-none"
                    placeholder="(11) 99864-2424"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent outline-none"
                    placeholder="cliente@exemplo.com.br"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status no Funil / Qualificação
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as QualificacaoSdr)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent outline-none bg-white font-medium"
                >
                  <option value="Lead">Lead Inicial (Sem contato)</option>
                  <option value="Contatado">Contatado / Em Atendimento</option>
                  <option value="Qualificado">Qualificado (Documentos em Análise)</option>
                  <option value="Reunião Agendada">Reunião Agendada</option>
                  <option value="Proposta Enviada">Proposta de Honorários Enviada</option>
                  <option value="Negociação">Em Negociação</option>
                  <option value="Ganho">Contrato Fechado (Cliente)</option>
                  <option value="Perdido">Arquivado / Perdido</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dados do Imóvel & Serviço */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#2E3192]" />
              Dados do Imóvel & Procedimento Registral
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Serviço Pretendido
                </label>
                <select
                  value={servico}
                  onChange={(e) => setServico(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent outline-none bg-white"
                >
                  <option value="Usucapião Extrajudicial">Usucapião Extrajudicial (Prov. 65 CNJ)</option>
                  <option value="Usucapião Judicial">Usucapião Judicial</option>
                  <option value="Inventário Extrajudicial">Inventário Extrajudicial</option>
                  <option value="Inventário Judicial">Inventário Judicial</option>
                  <option value="Retificação de Área">Retificação de Área</option>
                  <option value="Desdobro / Desmembramento">Desdobro / Desmembramento</option>
                  <option value="Reurb">Regularização Fundiária (Reurb)</option>
                  <option value="Adjudicação Compulsória Extrajudicial">Adjudicação Compulsória Extrajudicial</option>
                  <option value="Assessoria Notarial & Registral">Assessoria Notarial & Registral</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Imóvel
                </label>
                <input
                  type="text"
                  value={tipoImovel}
                  onChange={(e) => setTipoImovel(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent outline-none"
                  placeholder="Casa, Lote, Chácara, Galpão"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Honorários Estimados (R$)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={valorHonorarios}
                    onChange={(e) => setValorHonorarios(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent outline-none font-semibold text-emerald-800"
                    placeholder="0,00"
                  />
                  <DollarSign className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Endereço do Imóvel / Requerente */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2E3192]" />
              Endereço do Imóvel a Regularizar
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CEP
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCep(val);
                      const clean = val.replace(/\D/g, '');
                      if (clean.length === 8) {
                        handleBuscarCepAuto(clean);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent outline-none font-mono"
                    placeholder="00000-000"
                  />
                  <button
                    type="button"
                    onClick={handleBuscarCep}
                    disabled={isSearchingCep}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer border border-slate-300"
                  >
                    <Search className="w-3.5 h-3.5" />
                    {isSearchingCep ? '...' : 'Buscar'}
                  </button>
                </div>
                {cepFeedback && (
                  <span className="text-[11px] text-amber-700 mt-1 block">{cepFeedback}</span>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Logradouro (Rua, Avenida)
                </label>
                <input
                  type="text"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent outline-none"
                  placeholder="Nome da rua ou rodovia"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent outline-none"
                  placeholder="123 ou S/N"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Complemento / Gleba
                </label>
                <input
                  type="text"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent outline-none"
                  placeholder="Apto, Lote, Quadra"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent outline-none"
                  placeholder="Bairro"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cidade / UF
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent outline-none"
                    placeholder="Cidade"
                  />
                  <input
                    type="text"
                    maxLength={2}
                    value={uf}
                    onChange={(e) => setUf(e.target.value.toUpperCase())}
                    className="w-14 px-2 py-2 text-sm border border-slate-300 rounded-lg text-center uppercase font-bold focus:ring-2 focus:ring-[#2E3192] focus:border-transparent outline-none"
                    placeholder="UF"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações Técnicas / Anotações do Lead
            </label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2E3192] focus:border-transparent outline-none resize-none"
              placeholder="Anotações sobre a cadeia de posse, contrato de gaveta, herdeiros ou certidões do cartório..."
            />
          </div>

          {/* Delete Confirmation Alert */}
          {showDeleteConfirm && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Confirmar exclusão de lead fake ou curioso?</span>
              </div>
              <p className="text-xs text-red-600">
                Esta ação removerá <strong>{contact.nome_completo}</strong> definitivamente do CRM e de todos os relatórios.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={async () => {
                    if (onDelete) {
                      setIsDeleting(true);
                      await onDelete(contact.id);
                      setIsDeleting(false);
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Excluindo...' : 'Sim, Excluir Lead Fake'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <div>
              {onDelete && !showDeleteConfirm && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir Lead Fake / Curioso</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#2E3192] hover:bg-[#1E216B] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-[#F2EC00]" />
                <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
