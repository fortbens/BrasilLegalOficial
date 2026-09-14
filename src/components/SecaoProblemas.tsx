import React from 'react';
import { 
  Building2, 
  FileWarning, 
  FileQuestion, 
  Receipt, 
  Landmark, 
  FileText, 
  AlertOctagon, 
  DollarSign, 
  CreditCard, 
  ArrowRightLeft, 
  Hammer, 
  Search, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface SecaoProblemasProps {
  onSelecionarProblema?: (problema: string) => void;
}

export const SecaoProblemas: React.FC<SecaoProblemasProps> = ({ onSelecionarProblema }) => {
  const problemas = [
    {
      id: 'const_irregular',
      titulo: 'Construção irregular',
      descricao: 'Edificação levantada sem projeto arquitetônico aprovado ou alvará prévio da prefeitura.',
      icone: Hammer,
      risco: 'Risco de multas e embargo municipal',
      tag: 'Engenharia'
    },
    {
      id: 'const_nao_averbada',
      titulo: 'Construção não averbada',
      descricao: 'O imóvel físico existe, mas na matrícula do Cartório de Registro consta apenas o lote ou terreno nu.',
      icone: Building2,
      risco: 'Impede financiamento bancário Caixa/Bancos',
      tag: 'Cartório'
    },
    {
      id: 'falta_habite_se',
      titulo: 'Falta de Habite-se',
      descricao: 'Prefeitura não expediu o Auto de Conclusão de Obra por pendências cadastrais ou de recuo.',
      icone: FileWarning,
      risco: 'Impossibilita registro da construção',
      tag: 'Prefeitura'
    },
    {
      id: 'problemas_matricula',
      titulo: 'Problemas na matrícula',
      descricao: 'Matrícula bloqueada, ausente, com divergência de medidas perimétricas ou penhora antiga de terceiros.',
      icone: FileQuestion,
      risco: 'Insegurança patrimonial crítica',
      tag: 'Jurídico'
    },
    {
      id: 'cib_pendente',
      titulo: 'CIB (Cadastro Imobiliário Brasileiro)',
      descricao: 'Código federal ausente ou com divergência de titularidade na base unificada da Receita Federal.',
      icone: Landmark,
      risco: 'Trava emissão de certidões federais',
      tag: 'Receita Federal'
    },
    {
      id: 'inss_obra',
      titulo: 'INSS da obra / DISO / SERO',
      descricao: 'Falta da Certidão Negativa de Débitos (CND) previdenciária sobre a mão de obra da construção.',
      icone: Receipt,
      risco: 'Cartório recusa averbação sem CND',
      tag: 'Tributário'
    },
    {
      id: 'iptu_divergente',
      titulo: 'IPTU divergente ou atrasado',
      descricao: 'Metragem ou titular no carnê do IPTU não batem com a realidade fática do terreno e construção.',
      icone: FileText,
      risco: 'Inconsistência cadastral na prefeitura',
      tag: 'Cadastro'
    },
    {
      id: 'doc_incompleta',
      titulo: 'Documentação incompleta ou posse',
      descricao: 'Posse mantida apenas por contrato de gaveta, cessão de direitos hereditários ou recibos simples.',
      icone: AlertOctagon,
      risco: 'Proprietário legal ainda é o antigo dono',
      tag: 'Titularidade'
    },
    {
      id: 'problemas_loteadora',
      titulo: 'Problemas com loteadora',
      descricao: 'Loteadora faliu, encerrou atividades ou sumiu sem outorgar a escritura definitiva ao comprador.',
      icone: Building2,
      risco: 'Lote sem matrícula individualizada',
      tag: 'Adjudicação'
    },
    {
      id: 'dificuldade_vender',
      titulo: 'Dificuldade para vender',
      descricao: 'Compradores desistem ao descobrir irregularidades ou exigem deságio agressivo de 30% a 50%.',
      icone: DollarSign,
      risco: 'Perda de patrimônio e liquidez',
      tag: 'Comercial'
    },
    {
      id: 'dificuldade_financiar',
      titulo: 'Dificuldade para financiar',
      descricao: 'Bancos (Caixa, Santander, Itaú, Bradesco) reprovam a avaliação do imóvel por falta de averbação.',
      icone: CreditCard,
      risco: 'Exclui 85% dos compradores potenciais',
      tag: 'Bancário'
    },
    {
      id: 'dificuldade_transferir',
      titulo: 'Dificuldade para transferir ou inventário',
      descricao: 'Herdeiros não conseguem partilhar bens, registrar doação ou lavrar escritura definitiva.',
      icone: ArrowRightLeft,
      risco: 'Bens travados por gerações',
      tag: 'Sucessão'
    }
  ];

  return (
    <section id="problemas" className="py-20 px-4 sm:px-6 bg-slate-50 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[#2E3192] text-xs font-bold uppercase tracking-wider mb-3">
            <Search className="w-3.5 h-3.5" />
            Diagnóstico Patrimonial Preventivo
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Seu imóvel apresenta algum desses problemas?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Mais de 60% dos imóveis urbanos e rurais no Brasil possuem alguma pendência documental ou construtiva. Identificar a causa exata é o primeiro passo para destravar seu patrimônio.
          </p>
        </div>

        {/* 12 Problem Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {problemas.map((item) => {
            const Icon = item.icone;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-[#2E3192]/40 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-50 text-slate-700 group-hover:text-[#2E3192] flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#2E3192] transition-colors leading-snug">
                    {item.titulo}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {item.descricao}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-rose-600 truncate flex items-center gap-1">
                    <FileWarning className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                    <span className="truncate">{item.risco}</span>
                  </span>
                  <a
                    href="#raio-x"
                    onClick={() => onSelecionarProblema && onSelecionarProblema(item.titulo)}
                    className="text-[11px] font-bold text-[#2E3192] hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Sanar</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section Bottom CTA */}
        <div className="mt-12 text-center">
          <a
            href="#raio-x"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#2E3192] hover:bg-[#1C1E63] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#F2EC00]" />
            Descobrir o que está errado no meu imóvel
          </a>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Diagnóstico confidencial em 7 etapas rápidas. Sem compromisso.
          </p>
        </div>
      </div>
    </section>
  );
};
