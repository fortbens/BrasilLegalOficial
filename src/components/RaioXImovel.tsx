import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Search, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  HelpCircle,
  MessageCircle,
  HardHat,
  Landmark,
  Receipt,
  Layers,
  Briefcase,
  FileSignature,
  TrendingUp,
  Coins,
  Users2,
  AlertCircle
} from 'lucide-react';
import { Contact } from '../types';
import { buscarEnderecoPorCep } from '../services/cepService';

interface RaioXImovelProps {
  onConcluirLead?: (leadData: Partial<Contact>) => void;
  whatsappNumero?: string;
  mensagemPadraoWhatsapp?: string;
  className?: string;
  id?: string;
}

export const RaioXImovel: React.FC<RaioXImovelProps> = ({
  onConcluirLead,
  whatsappNumero = '+55 11 99864-2424',
  className = '',
  id = 'raio-x'
}) => {
  const [etapa, setEtapa] = useState<number>(1);
  const totalEtapas = 7;

  // Form State
  const [problema, setProblema] = useState<string>('');
  const [objetivo, setObjetivo] = useState<string>('');
  const [cep, setCep] = useState<string>('');
  const [cidade, setCidade] = useState<string>('');
  const [uf, setUf] = useState<string>('SP');
  const [bairro, setBairro] = useState<string>('');
  const [construcaoAverbada, setConstrucaoAverbada] = useState<'Sim' | 'Não' | 'Não sei' | ''>('');
  const [nome, setNome] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // Auxiliary State
  const [isBuscandoCep, setIsBuscandoCep] = useState<boolean>(false);
  const [cepMensagem, setCepMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [erroValidacao, setErroValidacao] = useState<string>('');
  const [concluido, setConcluido] = useState<boolean>(false);
  const [isEnviando, setIsEnviando] = useState<boolean>(false);

  // Sincronização com o botão Voltar do navegador para não sair da página
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (etapa > 1 && !concluido) {
      window.history.pushState({ raioXEtapa: etapa }, '', window.location.href);
    }

    const handlePopState = () => {
      setEtapa((prev) => {
        if (prev > 1) {
          setErroValidacao('');
          return prev - 1;
        }
        return 1;
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [etapa, concluido]);

  const opcoesProblema = [
    { 
      id: 'construcao_irregular', 
      label: 'Construção irregular ou sem projeto aprovado', 
      icon: HardHat 
    },
    { 
      id: 'matricula_travada', 
      label: 'Problemas na matrícula ou falta de escritura', 
      icon: FileText 
    },
    { 
      id: 'habite_se', 
      label: 'Falta de Habite-se da prefeitura', 
      icon: Landmark 
    },
    { 
      id: 'iptu', 
      label: 'IPTU divergente, desatualizado ou com dívida', 
      icon: Receipt 
    },
    { 
      id: 'cib', 
      label: 'CIB (Cadastro Imobiliário Brasileiro) pendente', 
      icon: Layers 
    },
    { 
      id: 'inss_obra', 
      label: 'INSS da obra / DISO / SERO sem CND', 
      icon: Briefcase 
    },
    { 
      id: 'documentacao_posse', 
      label: 'Contrato de gaveta ou posse antiga', 
      icon: FileSignature 
    },
    { 
      id: 'loteadora', 
      label: 'Loteamento irregular ou loteadora ausente', 
      icon: AlertTriangle 
    },
    { 
      id: 'nao_sei', 
      label: 'Não sei exatamente (quero análise técnica)', 
      icon: Search 
    }
  ];

  const opcoesObjetivo = [
    { 
      id: 'vender', 
      label: 'Vender o imóvel sem deságio', 
      desc: 'Destravar compradores e exigências de certidão',
      icon: TrendingUp
    },
    { 
      id: 'financiar', 
      label: 'Aprovar financiamento bancário', 
      desc: 'Bancos exigem matrícula regularizada',
      icon: Landmark
    },
    { 
      id: 'transferir', 
      label: 'Transferir, doar ou fazer inventário', 
      desc: 'Proteger herdeiros e evitar disputas',
      icon: Users2
    },
    { 
      id: 'regularizar', 
      label: 'Ter a escritura definitiva registrada', 
      desc: 'Dormir tranquilo com o imóvel no seu nome',
      icon: ShieldCheck
    },
    { 
      id: 'valorizar', 
      label: 'Valorizar o patrimônio (até +40%)', 
      desc: 'Imóvel regularizado vale significativamente mais',
      icon: Coins
    },
    { 
      id: 'entender', 
      label: 'Apenas entender a situação atual', 
      desc: 'Diagnóstico preliminar sem compromisso',
      icon: HelpCircle
    }
  ];

  const opcoesConstrucao = [
    {
      val: 'Sim',
      titulo: 'Sim, a construção consta na matrícula',
      desc: 'A metragem construída já está descrita na certidão do Registro de Imóveis.',
      icon: CheckCircle2
    },
    {
      val: 'Não',
      titulo: 'Não está averbada (só consta o lote/terreno)',
      desc: 'A casa ou prédio foi construído, mas nunca foi tirado o Habite-se ou averbado no cartório.',
      icon: AlertCircle
    },
    {
      val: 'Não sei',
      titulo: 'Não sei informar',
      desc: 'A Brasil Legal pode emitir a certidão da matrícula e conferir para você.',
      icon: HelpCircle
    }
  ];

  const handleConsultarCep = async (cepValue: string) => {
    const clean = cepValue.replace(/\D/g, '');
    if (clean.length !== 8) return;

    setIsBuscandoCep(true);
    setCepMensagem(null);
    try {
      const data = await buscarEnderecoPorCep(clean);
      if (data && (data.cidade || data.bairro)) {
        if (data.cidade) setCidade(data.cidade);
        if (data.uf) setUf(data.uf);
        if (data.bairro) setBairro(data.bairro);
        setCepMensagem({
          tipo: 'sucesso',
          texto: `Localizado: ${data.cidade} / ${data.uf} (${data.bairro || 'Região central'})`
        });
      } else {
        setCepMensagem({ tipo: 'erro', texto: 'CEP não encontrado. Digite a cidade manualmente abaixo.' });
      }
    } catch {
      setCepMensagem({ tipo: 'erro', texto: 'Não foi possível consultar o CEP agora. Preencha a cidade.' });
    } finally {
      setIsBuscandoCep(false);
    }
  };

  const handleProximaEtapa = () => {
    setErroValidacao('');

    if (etapa === 1) {
      if (!problema) {
        setErroValidacao('Selecione a situação ou problema principal do imóvel.');
        return;
      }
      setEtapa(2);
    } else if (etapa === 2) {
      if (!objetivo) {
        setErroValidacao('Selecione o seu principal objetivo com o imóvel.');
        return;
      }
      setEtapa(3);
    } else if (etapa === 3) {
      if (!cidade.trim()) {
        setErroValidacao('Por favor, informe a cidade onde o imóvel está localizado.');
        return;
      }
      setEtapa(4);
    } else if (etapa === 4) {
      if (!construcaoAverbada) {
        setErroValidacao('Informe se a construção já está averbada na matrícula.');
        return;
      }
      setEtapa(5);
    } else if (etapa === 5) {
      if (!nome.trim() || nome.trim().length < 3) {
        setErroValidacao('Informe seu nome completo para identificação.');
        return;
      }
      setEtapa(6);
    } else if (etapa === 6) {
      const cleanPhone = whatsapp.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        setErroValidacao('Informe um número de WhatsApp válido com DDD.');
        return;
      }
      setEtapa(7);
    }
  };

  const handleFinalizarRaioX = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroValidacao('');

    if (!email.trim() || !email.includes('@')) {
      setErroValidacao('Informe um e-mail válido para envio do resumo.');
      return;
    }

    setIsEnviando(true);

    const observacoesRaioX = `[RAIO-X DO IMÓVEL]
• Problema Principal: ${problema}
• Objetivo: ${objetivo}
• Localização: ${cidade}/${uf} (Bairro: ${bairro || 'Não inf.'}, CEP: ${cep || 'Não inf.'})
• Construção Averbada: ${construcaoAverbada}
• E-mail do Proprietário: ${email}`;

    const leadData: Partial<Contact> = {
      nome_completo: nome.trim(),
      telefone_whatsapp: whatsapp.trim(),
      email: email.trim(),
      tipo_pessoa: 'PF',
      status_cadastro: 'Em Qualificacao',
      qualificacao_sdr: 'Lead',
      origem_lead: 'Raio-X do Imóvel',
      tags: ['Raio-X Imóvel', objetivo, problema.slice(0, 25)],
      observacoes: observacoesRaioX,
      endereco: {
        logradouro: '',
        numero: '',
        bairro: bairro || '',
        cidade: cidade.trim(),
        uf: uf || 'SP',
        cep: cep || ''
      }
    };

    try {
      if (onConcluirLead) {
        onConcluirLead(leadData);
      } else {
        await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData)
        });
      }

      setConcluido(true);
    } catch (err) {
      console.warn('Erro ao submeter Raio-X:', err);
      setConcluido(true);
    } finally {
      setIsEnviando(false);
    }
  };

  const cleanWhatsappNumber = whatsappNumero.replace(/\D/g, '');
  const textoWhatsappFormatado = encodeURIComponent(
    `Olá, Brasil Legal! Acabei de preencher o Raio-X do Imóvel no site.
Nome: ${nome}
Cidade: ${cidade}/${uf}
Problema: ${problema}
Objetivo: ${objetivo}
Construção Averbada: ${construcaoAverbada}
Gostaria de receber a análise com um especialista.`
  );
  const linkWhatsappDireto = `https://wa.me/${cleanWhatsappNumber}?text=${textoWhatsappFormatado}`;

  return (
    <div id={id} className={`w-full max-w-4xl mx-auto text-slate-900 ${className}`}>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden text-slate-900">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#1C1E63] via-[#2E3192] to-[#1C1E63] text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#F2EC00]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F2EC00]" />
            Diagnóstico inteligente e gratuito
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
            Raio-X do Imóvel
          </h3>
          <p className="text-sm sm:text-base text-slate-200 mt-2 max-w-xl mx-auto">
            Descubra quais pontos podem estar impedindo seu imóvel de estar regularizado, seguro e valorizado para venda ou financiamento.
          </p>

          {!concluido && (
            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('raio-x-form-body');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F2EC00] hover:bg-[#ffe600] text-[#1C1E63] font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Clicar para avançar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Progress Indicator */}
          {!concluido && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold mb-2">
                <span>Etapa {etapa} de {totalEtapas}</span>
                <span>{Math.round((etapa / totalEtapas) * 100)}% concluído</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#F2EC00] h-full transition-all duration-300 rounded-full shadow-xs"
                  style={{ width: `${(etapa / totalEtapas) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div id="raio-x-form-body" className="p-6 sm:p-8 text-slate-900 scroll-mt-24">
          {concluido ? (
            <div className="py-8 text-center max-w-lg mx-auto space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-2xl font-black text-slate-900">
                  Raio-X Concluído com Sucesso, {nome.split(' ')[0]}!
                </h4>
                <p className="text-sm text-slate-600 mt-2">
                  Recebemos seus dados e nosso time técnico já identificou os pontos críticos para a regularização do seu imóvel em <strong>{cidade}/{uf}</strong>.
                </p>
              </div>

              {/* Resumo do Diagnóstico Preliminar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900">Situação Principal:</span>
                  <span className="text-[#2E3192] font-semibold text-right">{problema}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900">Objetivo Pretendido:</span>
                  <span className="text-right">{objetivo}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900">Construção Averbada:</span>
                  <span className="font-semibold text-right">{construcaoAverbada}</span>
                </div>
                <div className="flex items-center justify-between pt-1 text-emerald-700 font-bold">
                  <span>Parecer Técnico Inicial:</span>
                  <span>Caso Plenamente Regularizável</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={linkWhatsappDireto}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-200" />
                  Receber Diagnóstico Detalhado no WhatsApp
                </a>

                <p className="text-xs text-slate-400">
                  Um especialista da Brasil Legal entrará em contato em horário comercial para orientar as etapas sem burocracia.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {erroValidacao && (
                <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{erroValidacao}</span>
                </div>
              )}

              {/* ETAPA 1: Problema */}
              {etapa === 1 && (
                <div className="space-y-4">
                  <div className="text-center sm:text-left mb-4">
                    <span className="text-xs font-bold text-[#2E3192] uppercase tracking-wider">Etapa 1 de 7</span>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                      Qual é o principal problema ou situação do seu imóvel?
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Selecione a opção que melhor descreve a sua pendência atual:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {opcoesProblema.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = problema === opt.label;
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => {
                            setProblema(opt.label);
                            setErroValidacao('');
                            setTimeout(() => {
                              setEtapa(2);
                            }, 120);
                          }}
                          className={`group p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'border-[#2E3192] bg-indigo-50/70 shadow-xs ring-1 ring-[#2E3192]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-[#2E3192] text-white shadow-xs'
                                : 'bg-slate-100 text-[#2E3192] group-hover:bg-indigo-100'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 pt-0.5">
                              <p className={`text-xs sm:text-sm font-semibold leading-snug ${
                                isSelected ? 'text-[#1C1E63]' : 'text-slate-800'
                              }`}>
                                {opt.label}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-slate-100 w-full flex items-center justify-end">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2E3192] group-hover:text-indigo-900">
                              Clicar para avançar
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ETAPA 2: Objetivo */}
              {etapa === 2 && (
                <div className="space-y-4">
                  <div className="text-center sm:text-left mb-4">
                    <span className="text-xs font-bold text-[#2E3192] uppercase tracking-wider">Etapa 2 de 7</span>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                      O que você pretende fazer com o imóvel após a regularização?
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Isso define a prioridade de prazos e o roteiro cartorário mais econômico:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {opcoesObjetivo.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = objetivo === opt.label;
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => {
                            setObjetivo(opt.label);
                            setErroValidacao('');
                            setTimeout(() => {
                              setEtapa(3);
                            }, 120);
                          }}
                          className={`group p-4 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'border-[#2E3192] bg-indigo-50/70 shadow-xs ring-1 ring-[#2E3192]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start gap-3 w-full">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-[#2E3192] text-white shadow-xs'
                                : 'bg-slate-100 text-[#2E3192] group-hover:bg-indigo-100'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-sm font-bold ${isSelected ? 'text-[#1C1E63]' : 'text-slate-900'}`}>
                                {opt.label}
                              </p>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-100 w-full flex items-center justify-end">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2E3192] group-hover:text-indigo-900">
                              Clicar para avançar
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ETAPA 3: Localização */}
              {etapa === 3 && (
                <div className="space-y-5 max-w-lg mx-auto">
                  <div className="text-center mb-4">
                    <span className="text-xs font-bold text-[#2E3192] uppercase tracking-wider">Etapa 3 de 7</span>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                      Onde o seu imóvel está localizado?
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Cartórios e legislações municipais de Habite-se variam por cidade.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      CEP do imóvel (opcional para busca automática)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={cep}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCep(val);
                            if (val.replace(/\D/g, '').length === 8) {
                              handleConsultarCep(val);
                            }
                          }}
                          placeholder="00000-000"
                          maxLength={9}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleConsultarCep(cep)}
                        disabled={isBuscandoCep}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isBuscandoCep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                        Buscar
                      </button>
                    </div>

                    {cepMensagem && (
                      <p className={`text-xs mt-1.5 font-medium ${cepMensagem.tipo === 'sucesso' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {cepMensagem.texto}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Cidade do imóvel <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={cidade}
                          onChange={(e) => {
                            setCidade(e.target.value);
                            setErroValidacao('');
                          }}
                          placeholder="Ex: Franco da Rocha, Caieiras, São Paulo..."
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Estado (UF)
                      </label>
                      <select
                        value={uf}
                        onChange={(e) => setUf(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
                      >
                        <option value="SP">SP</option>
                        <option value="MG">MG</option>
                        <option value="RJ">RJ</option>
                        <option value="PR">PR</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                  </div>

                  {/* Sugestões Rápidas de Cidades Atendidas em SP */}
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">
                      Cidades com atuação frequente:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Caieiras', 'Franco da Rocha', 'Francisco Morato', 'Cajamar', 'Mairiporã', 'Perus / Pirituba', 'São Paulo'].map((cid) => (
                        <button
                          type="button"
                          key={cid}
                          onClick={() => {
                            setCidade(cid);
                            setUf('SP');
                            setErroValidacao('');
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            cidade === cid
                              ? 'bg-[#2E3192] text-white border-[#2E3192]'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {cid}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA 4: A Construção está Averbada? */}
              {etapa === 4 && (
                <div className="space-y-4 max-w-lg mx-auto">
                  <div className="text-center mb-4">
                    <span className="text-xs font-bold text-[#2E3192] uppercase tracking-wider">Etapa 4 de 7</span>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                      A construção (edificação) está averbada na matrícula?
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Ou na certidão do cartório ainda consta apenas terreno / lote vago?
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {opcoesConstrucao.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = construcaoAverbada === opt.val;
                      return (
                        <button
                          type="button"
                          key={opt.val}
                          onClick={() => {
                            setConstrucaoAverbada(opt.val as any);
                            setErroValidacao('');
                            setTimeout(() => {
                              setEtapa(5);
                            }, 120);
                          }}
                          className={`group w-full p-4 rounded-xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'border-[#2E3192] bg-indigo-50/70 shadow-xs ring-1 ring-[#2E3192]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start gap-3.5 w-full">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-[#2E3192] text-white shadow-xs'
                                : 'bg-slate-100 text-[#2E3192] group-hover:bg-indigo-100'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-sm font-bold ${isSelected ? 'text-[#1C1E63]' : 'text-slate-900'}`}>
                                {opt.titulo}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                            </div>
                          </div>
                          <div className="mt-2.5 pt-2 border-t border-slate-100 w-full flex items-center justify-end">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2E3192] group-hover:text-indigo-900">
                              Clicar para avançar
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ETAPA 5: Nome */}
              {etapa === 5 && (
                <div className="space-y-4 max-w-md mx-auto text-center sm:text-left">
                  <div className="mb-4 text-center">
                    <span className="text-xs font-bold text-[#2E3192] uppercase tracking-wider">Etapa 5 de 7</span>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                      Como podemos te chamar?
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Informe o seu nome completo para personalizarmos seu diagnóstico:
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 text-left">
                      Seu nome completo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => {
                          setNome(e.target.value);
                          setErroValidacao('');
                        }}
                        placeholder="Ex: Carlos Eduardo de Oliveira"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 bg-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ETAPA 6: WhatsApp */}
              {etapa === 6 && (
                <div className="space-y-4 max-w-md mx-auto text-center sm:text-left">
                  <div className="mb-4 text-center">
                    <span className="text-xs font-bold text-[#2E3192] uppercase tracking-wider">Etapa 6 de 7</span>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                      Qual o seu WhatsApp para contato?
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Enviaremos o resumo e o parecer técnico diretamente no seu WhatsApp:
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 text-left">
                      Número de WhatsApp com DDD <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => {
                          setWhatsapp(e.target.value);
                          setErroValidacao('');
                        }}
                        placeholder="(11) 99999-9999"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 bg-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 text-left">
                      Não enviamos spam. Seus dados são protegidos sob sigilo patrimonial e LGPD.
                    </p>
                  </div>
                </div>
              )}

              {/* ETAPA 7: E-mail & Finalização */}
              {etapa === 7 && (
                <form onSubmit={handleFinalizarRaioX} className="space-y-4 max-w-md mx-auto text-center sm:text-left">
                  <div className="mb-4 text-center">
                    <span className="text-xs font-bold text-[#2E3192] uppercase tracking-wider">Última etapa</span>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                      Para onde enviamos o resumo do seu Raio-X?
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Informe seu e-mail principal para receber a cópia oficial da análise:
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 text-left">
                      Seu melhor e-mail <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErroValidacao('');
                        }}
                        placeholder="seuemail@exemplo.com.br"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-slate-900 bg-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3192]"
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isEnviando}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#2E3192] to-[#1C1E63] hover:from-[#1C1E63] hover:to-[#2E3192] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isEnviando ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processando seu Raio-X...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#F2EC00]" />
                        Receber meu Raio-X gratuito
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Navigation Controls (Voltar / Avançar) */}
              {etapa < 7 && (
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                  {etapa > 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEtapa(etapa - 1);
                        setErroValidacao('');
                      }}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Voltar
                    </button>
                  ) : (
                    <div />
                  )}

                  {/* Mostra botão de avançar apenas nas etapas que exigem digitação de dados (3, 5 e 6) */}
                  {[3, 5, 6].includes(etapa) && (
                    <button
                      type="button"
                      onClick={handleProximaEtapa}
                      className="px-6 py-2.5 rounded-xl bg-[#2E3192] hover:bg-[#1C1E63] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer ml-auto"
                    >
                      <span>Avançar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
