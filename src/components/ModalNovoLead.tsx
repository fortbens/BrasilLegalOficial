import React, { useState, useRef } from 'react';
import { Contact, TipoPessoa, StatusCadastro, OrigemLead, QualificacaoSdr } from '../types';
import { X, UserPlus, MapPin, Building, Phone, Mail, FileText, CheckCircle2, Search, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { buscarEnderecoPorCep, formatarCep } from '../services/cepService';

interface ModalNovoLeadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Partial<Contact>) => void;
}

export const ModalNovoLead: React.FC<ModalNovoLeadProps> = ({ isOpen, onClose, onSave }) => {
  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>('PF');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [rgIe, setRgIe] = useState('');
  const [telefoneWhatsapp, setTelefoneWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [statusCadastro, setStatusCadastro] = useState<StatusCadastro>('Lead (Novo)');
  const [origemLead, setOrigemLead] = useState<OrigemLead>('Indique e Ganhe B2B');
  const [indicadorId, setIndicadorId] = useState('PARC-B2B-88');
  const [qualificacaoSdr, setQualificacaoSdr] = useState<QualificacaoSdr>('Novo');
  const [servicoPretendido, setServicoPretendido] = useState('Usucapião Extrajudicial');
  const [tipoImovel, setTipoImovel] = useState('Casa em loteamento irregular');

  // Address
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('SP');
  const [cep, setCep] = useState('');

  // CEP Lookup State
  const [isBuscandoCep, setIsBuscandoCep] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const numeroInputRef = useRef<HTMLInputElement>(null);

  const handleConsultarCep = async (cepParaBuscar?: string) => {
    const alvoCep = cepParaBuscar || cep;
    const clean = alvoCep.replace(/\D/g, '');
    if (clean.length !== 8) {
      setCepFeedback({ tipo: 'erro', texto: 'Informe o CEP com 8 dígitos para busca automática.' });
      return;
    }

    setIsBuscandoCep(true);
    setCepFeedback(null);

    try {
      const dados = await buscarEnderecoPorCep(clean);
      if (dados && (dados.logradouro || dados.cidade)) {
        if (dados.logradouro) setLogradouro(dados.logradouro);
        if (dados.bairro) setBairro(dados.bairro);
        if (dados.cidade) setCidade(dados.cidade);
        if (dados.uf) setUf(dados.uf);
        if (dados.complemento && !complemento) setComplemento(dados.complemento);
        setCep(dados.cep);
        setCepFeedback({
          tipo: 'sucesso',
          texto: `Endereço localizado: ${dados.cidade}/${dados.uf} (${dados.bairro || 'Centro'})`
        });
        // Focar no número do imóvel
        setTimeout(() => {
          numeroInputRef.current?.focus();
        }, 150);
      } else {
        setCepFeedback({
          tipo: 'erro',
          texto: 'CEP não localizado nas bases de dados. Preencha os dados manualmente.'
        });
      }
    } catch {
      setCepFeedback({
        tipo: 'erro',
        texto: 'Não foi possível consultar o CEP. Preencha os dados manualmente.'
      });
    } finally {
      setIsBuscandoCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatarCep(rawVal);
    setCep(formatted);
    const clean = rawVal.replace(/\D/g, '');
    if (clean.length === 8) {
      handleConsultarCep(clean);
    } else {
      setCepFeedback(null);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCompleto || !cpfCnpj || !telefoneWhatsapp) {
      alert('Por favor, preencha os campos obrigatórios: Nome, CPF/CNPJ e Telefone WhatsApp.');
      return;
    }

    const newContactData: Partial<Contact> = {
      nome_completo: nomeCompleto,
      tipo_pessoa: tipoPessoa,
      cpf_cnpj: cpfCnpj,
      rg_ie: rgIe || undefined,
      telefone_whatsapp: telefoneWhatsapp,
      email: email || undefined,
      status_cadastro: statusCadastro,
      origem_lead: origemLead,
      indicador_id: indicadorId || undefined,
      qualificacao_sdr: qualificacaoSdr,
      servico_pretendido: servicoPretendido,
      tipo_imovel: tipoImovel,
      tempo_primeira_resposta_minutos: 0,
      endereco: {
        logradouro: logradouro || 'Rua das Palmeiras',
        numero: numero || '100',
        complemento: complemento || undefined,
        bairro: bairro || 'Centro',
        cidade: cidade || 'São Paulo',
        uf: uf || 'SP',
        cep: cep || '01000-000'
      }
    };

    onSave(newContactData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#2E3192] px-6 py-4 flex items-center justify-between text-white border-b-2 border-[#F2EC00]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#F2EC00]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Cadastrar Lead Completo (ContactSchema)</h2>
              <p className="text-xs text-white/80">Entrada na fila de triagem comercial e SLA &lt; 4 minutos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {/* Persona selector: PF / PJ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tipo de Pessoa
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoPessoa('PF')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  tipoPessoa === 'PF'
                    ? 'bg-indigo-50 border-[#2E3192] text-[#2E3192] shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${tipoPessoa === 'PF' ? 'text-[#2E3192]' : 'opacity-0'}`} />
                Pessoa Física (PF)
              </button>
              <button
                type="button"
                onClick={() => setTipoPessoa('PJ')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                  tipoPessoa === 'PJ'
                    ? 'bg-indigo-50 border-[#2E3192] text-[#2E3192] shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${tipoPessoa === 'PJ' ? 'text-[#2E3192]' : 'opacity-0'}`} />
                Pessoa Jurídica (PJ)
              </button>
            </div>
          </div>

          {/* Identification fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo / Razão Social *
              </label>
              <input
                type="text"
                required
                value={nomeCompleto}
                onChange={e => setNomeCompleto(e.target.value)}
                placeholder={tipoPessoa === 'PF' ? 'Ex: José da Silva Ramos' : 'Ex: Incorporadora União Ltda'}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {tipoPessoa === 'PF' ? 'CPF *' : 'CNPJ *'}
              </label>
              <input
                type="text"
                required
                value={cpfCnpj}
                onChange={e => setCpfCnpj(e.target.value)}
                placeholder={tipoPessoa === 'PF' ? '000.000.000-00' : '00.000.000/0001-00'}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>
          </div>

          {/* Contact fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                WhatsApp *
              </label>
              <input
                type="text"
                required
                value={telefoneWhatsapp}
                onChange={e => setTelefoneWhatsapp(e.target.value)}
                placeholder="(11) 99999-8888"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {tipoPessoa === 'PF' ? 'RG / Órgão Exp.' : 'Inscrição Estadual'}
              </label>
              <input
                type="text"
                value={rgIe}
                onChange={e => setRgIe(e.target.value)}
                placeholder={tipoPessoa === 'PF' ? '12.345.678-9 SSP/SP' : 'Isento ou número'}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>
          </div>

          {/* Acquisition origin and B2B referral */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Origem do Lead
              </label>
              <select
                value={origemLead}
                onChange={e => setOrigemLead(e.target.value as OrigemLead)}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
              >
                <option value="Indique e Ganhe B2B">Indique e Ganhe B2B</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Meta Ads">Meta Ads</option>
                <option value="Site Organico">Site Orgânico</option>
                <option value="Balcao">Balcão / Cartório</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Código Parceiro B2B
              </label>
              <input
                type="text"
                value={indicadorId}
                onChange={e => setIndicadorId(e.target.value)}
                placeholder="Ex: PARC-B2B-88"
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Qualificação SDR
              </label>
              <select
                value={qualificacaoSdr}
                onChange={e => setQualificacaoSdr(e.target.value as QualificacaoSdr)}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
              >
                <option value="Novo">Novo (Aguardando SLA &lt; 4m)</option>
                <option value="Em Triagem">Em Triagem</option>
                <option value="MQL (Qualificado)">MQL (Qualificado)</option>
                <option value="Disqualificado">Desqualificado</option>
              </select>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#2E3192]" />
                Endereço do Imóvel / Requerente
              </h3>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Digite o CEP para preenchimento automático
              </span>
            </div>

            {/* CEP Search Row */}
            <div>
              <div className="flex items-center gap-2">
                <div className="relative w-44">
                  <input
                    type="text"
                    value={cep}
                    onChange={handleCepChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleConsultarCep();
                      }
                    }}
                    placeholder="CEP: 00000-000"
                    maxLength={9}
                    className="w-full text-xs font-mono font-bold px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192] bg-white text-slate-900"
                  />
                  {isBuscandoCep && (
                    <div className="absolute right-2.5 top-2.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2E3192]" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleConsultarCep()}
                  disabled={isBuscandoCep}
                  className="px-3 py-2 text-xs font-bold text-white bg-[#2E3192] hover:bg-indigo-900 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isBuscandoCep ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Buscar CEP</span>
                    </>
                  )}
                </button>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  (Busca automática imediata ao digitar 8 números)
                </span>
              </div>

              {/* CEP Feedback */}
              {cepFeedback && (
                <div
                  className={`mt-2 px-2.5 py-1.5 rounded-md text-[11px] flex items-center gap-1.5 font-medium animate-in fade-in ${
                    cepFeedback.tipo === 'sucesso'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {cepFeedback.tipo === 'sucesso' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  )}
                  <span>{cepFeedback.texto}</span>
                </div>
              )}
            </div>

            {/* Street and Number */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Logradouro / Rua</label>
                <input
                  type="text"
                  value={logradouro}
                  onChange={e => setLogradouro(e.target.value)}
                  placeholder="Rua, Avenida, Estrada ou Travessa"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Número *</label>
                <input
                  ref={numeroInputRef}
                  type="text"
                  value={numero}
                  onChange={e => setNumero(e.target.value)}
                  placeholder="Nº / Lote"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192] font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Complemento, Bairro, Cidade, UF */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Complemento</label>
                <input
                  type="text"
                  value={complemento}
                  onChange={e => setComplemento(e.target.value)}
                  placeholder="Apto, Bloco, Quadra"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Bairro</label>
                <input
                  type="text"
                  value={bairro}
                  onChange={e => setBairro(e.target.value)}
                  placeholder="Bairro"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">Cidade</label>
                <input
                  type="text"
                  value={cidade}
                  onChange={e => setCidade(e.target.value)}
                  placeholder="Cidade (ex: Campinas)"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">UF (Estado)</label>
                <input
                  type="text"
                  value={uf}
                  maxLength={2}
                  onChange={e => setUf(e.target.value.toUpperCase())}
                  placeholder="SP"
                  className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192] uppercase"
                />
              </div>
            </div>
          </div>

          {/* Legal / Engineering Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Serviço de Regularização Pretendido
              </label>
              <select
                value={servicoPretendido}
                onChange={e => setServicoPretendido(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
              >
                <option value="Usucapião Extrajudicial">Usucapião Extrajudicial (Prov. 65 CNJ / LRP)</option>
                <option value="REURB Urbana (REURB-S e REURB-E)">REURB Urbana (Lei 13.465/17)</option>
                <option value="Retificação Administrativa de Área">Retificação de Registro Imobiliário (Art. 213 LRP)</option>
                <option value="Desdobro e Desmembramento">Desdobro e Fracionamento de Lote</option>
                <option value="Saneamento de Matrícula">Auditoria de Ônus & Baixa de Gravames</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Característica do Imóvel / Posse
              </label>
              <input
                type="text"
                value={tipoImovel}
                onChange={e => setTipoImovel(e.target.value)}
                placeholder="Ex: Terreno com posse mansa há 18 anos"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192]"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#2E3192] hover:bg-[#1E216B] text-white rounded-lg transition-all shadow-md flex items-center gap-2 border-b-2 border-[#F2EC00]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#F2EC00]" />
              Gravar Cadastro no CRM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
