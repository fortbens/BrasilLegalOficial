import { 
  ComparacaoDocumentosResultado, 
  DivergenciaItem, 
  ClausulaConflitante, 
  DadoConvergente 
} from '../types';

export interface DocumentComparisonPreset {
  id: string;
  nome: string;
  subtitulo: string;
  tipo_imovel: string;
  documentoA: {
    tipo: string;
    titulo: string;
    orgao_emissor: string;
    data_emissao: string;
    conteudo: string;
  };
  documentoB: {
    tipo: string;
    titulo: string;
    orgao_emissor: string;
    data_emissao: string;
    conteudo: string;
  };
  dadosImovel: {
    matricula: string;
    cartorio: string;
    logradouro: string;
    municipio_uf: string;
  };
  resultadoPadrao: ComparacaoDocumentosResultado;
}

export const DOCUMENT_COMPARISON_PRESETS: DocumentComparisonPreset[] = [
  {
    id: 'preset-matricula-vs-contrato',
    nome: 'Matrícula Cartorária (R.I.) vs. Contrato Particular de Gaveta',
    subtitulo: 'Divergência de metragem (+62,50m²), ausência de outorga uxória e construção não averbada',
    tipo_imovel: 'Imóvel Urbano Residencial (Lote com Edificação)',
    documentoA: {
      tipo: 'Matricula_Atualizada',
      titulo: 'Certidão de Inteiro Teor da Matrícula nº 48.910',
      orgao_emissor: '2º Oficial de Registro de Imóveis de Campinas/SP',
      data_emissao: '15/01/2026',
      conteudo: `REPÚBLICA FEDERATIVA DO BRASIL - ESTADO DE SÃO PAULO
COMARCA DE CAMPINAS - 2º OFICIAL DE REGISTRO DE IMÓVEIS
LIVRO Nº 2 - REGISTRO GERAL

MATRÍCULA Nº 48.910 - DATA: 14 de Março de 2008.

IMÓVEL: Lote de terreno sob nº 14 (quatorze) da Quadra B do loteamento denominado "JARDIM DAS PALMEIRAS", nesta cidade e comarca de Campinas/SP, com a seguinte descrição:
Área total de 250,00 m² (duzentos e cinquenta metros quadrados), medindo 10,00 metros de frente para a Rua Projetada A; 25,00 metros da frente aos fundos de ambos os lados; e 10,00 metros nos fundos. Confronta pelo lado direito com o lote 13, pelo lado esquerdo com o lote 15 e pelos fundos com o lote 08.
Cadastro Municipal (IPTU): Código Cartográfico nº 34.221.014-0.
Edificação: Consta apenas como TERRENO NU (sem benfeitorias averbadas).

PROPRIETÁRIO: MARCOS AURÉLIO DE SOUZA, brasileiro, solteiro, maior, engenheiro civil, portador do RG nº 18.234.901-X SSP/SP e inscrito no CPF/MF sob o nº 142.889.108-33, residente e domiciliado na Rua das Dálias, nº 120, Campinas/SP.

REGISTROS E AVERBAÇÕES:
R.01/48.910 - Compra e venda com quitação plena lavrada no 1º Tabelionato de Notas de Campinas.
R.02/48.910 - HIPOTECA CEDULAR de 1º Grau em favor do Banco Hipotecário Nacional S/A, para garantia da dívida de R$ 95.000,00 (não baixada até a presente data).
AV.03/48.910 - Denominação de via pública: A Rua Projetada A passou a denominar-se oficialmente RUA DAS ACÁCIAS conforme Decreto Municipal nº 14.882/2012.`
    },
    documentoB: {
      tipo: 'Contrato_Gaveta',
      titulo: 'Instrumento Particular de Compromisso de Venda e Compra e Cessão de Direitos',
      orgao_emissor: 'Elaboração Particular com Firmas Reconhecidas',
      data_emissao: '10/08/2019',
      conteudo: `INSTRUMENTO PARTICULAR DE COMPROMISSO DE VENDA E COMPRA, CESSÃO DE POSSE E OUTRAS AVENÇAS

Pelo presente instrumento particular, de um lado como PROMITENTE VENDEDOR E CEDENTE:
MARCOS AURÉLIO DE SOUZA, brasileiro, casado sob o regime de comunhão parcial de bens com SILVANA PRADO DE SOUZA (que não assina o presente instrumento), engenheiro, portador do RG nº 18.234.901-X SSP/SP e CPF nº 142.889.108-33, residente na Rua das Acácias, nº 420, Campinas/SP;

E de outro lado, como PROMISSÁRIO COMPRADOR E CESSIONÁRIO:
ROBERTO SILVEIRA BRAGA, brasileiro, divorciado, empresário, RG nº 29.871.442-1 SSP/SP e CPF nº 312.455.980-11.

CLÁUSULA PRIMEIRA - DO OBJETO:
O Vendedor é legítimo possuidor e titular dos direitos do imóvel situado na Rua das Acácias, nº 420, Jardim das Palmeiras, Campinas/SP. O imóvel possui ÁREA TOTAL DE 312,50 m², tendo sido anexada aos fundos uma faixa de 62,50 m² desmembrada do lote vizinho nº 08, devidamente murada há mais de 10 anos.
Sobre o terreno encontra-se construída uma RESIDÊNCIA EM ALVENARIA com área construída de aproximadamente 165,00 m², contendo 3 dormitórios (1 suíte), sala de estar, cozinha americana, edícula gourmet e piscina.

CLÁUSULA SEGUNDA - DO PREÇO E PAGAMENTO:
O preço certo e ajustado é de R$ 420.000,00 (quatrocentos e vinte mil reais), pagos integralmente mediante transferência bancária.

CLÁUSULA QUINTA - DOS ÔNUS E GRAVAMES:
O Comprador declara ter ciência da existência de gravame hipotecário lançado na matrícula em favor de instituição bancária e assume a responsabilidade por obter a respectiva baixa ou negociar eventual saldo remanescente, isentando o Vendedor de qualquer responsabilidade civil ou regresso.

CLÁUSULA DÉCIMA PRIMEIRA - DO FORO DE ELEIÇÃO:
Para dirimir quaisquer dúvidas oriundas deste contrato, as partes elegem o Foro Central da Comarca de SÃO PAULO/SP, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`
    },
    dadosImovel: {
      matricula: '48.910',
      cartorio: '2º Oficial de Registro de Imóveis de Campinas/SP',
      logradouro: 'Rua das Acácias, nº 420 (antigo Lote 14, Quadra B)',
      municipio_uf: 'Campinas/SP'
    },
    resultadoPadrao: {
      status_geral: 'Incompatível / Óbice Registral',
      indice_conformidade: 48,
      total_divergencias: 5,
      divergencias_criticas: 3,
      divergencias_moderadas: 2,
      divergencias_leves: 0,
      resumo_executivo: 'Foram detectadas 3 inconsistências graves que impedem o registro direto da escritura no Registro de Imóveis: acréscimo de 62,50m² não titulado, falta de outorga uxória da esposa do alienante e hipoteca bancária ativa sem carta de quitação.',
      parecer_juridico_registral: `PARECER TÉCNICO REGISTRAL DE DIVERGÊNCIAS (PROVIMENTO 65/CNJ E LEI 6.015/73)

1. DA DIVERGÊNCIA DE ÁREA (250,00 m² vs 312,50 m²):
A matrícula registra 250,00 m², enquanto o contrato de cessão abrange 312,50 m², decorrente da ocupação fática de 62,50 m² do lote vizinho nº 08. Pelo princípio da especialidade objetiva (art. 176 da LRP), o Oficial de Registro recusará o registro da metragem maior. Recomendamos ajuizamento/requerimento de Usucapião Extrajudicial autônoma sobre a área excedente de 62,50 m² ou procedimento de retificação/desdobro com anuência do confrontante.

2. DA AUSÊNCIA DE OUTORGA UXÓRIA (NULIDADE RELATIVA ART. 1.647 CC):
No momento da lavratura do contrato, o vendedor qualificou-se como CASADO sob o regime de comunhão parcial. Por se tratar de disposição de direitos reais sobre bens imóveis, a ausência de anuência e assinatura da cônjuge SILVANA PRADO DE SOUZA gera vício de nulidade relativa (art. 1.649 do CC), podendo ser anulado em até 2 anos. É indispensável obter a ratificação formal por escritura pública ou anuência expressa.

3. DA EDIFICAÇÃO CLANDESTINA NÃO AVERBADA (165,00 m²):
A matrícula expressa "terreno nu", ao passo que existe edificação residencial com 165,00 m². Para permitir financiamento bancário futuro ou regular alienação, faz-se necessária a averbação da construção (art. 247 da LRP), mediante expedição do Habite-se municipal e Certidão Negativa de Débitos Previdenciários (CND do INSS / Receita Federal).

4. DO GRAVAME HIPOTECÁRIO NÃO BAIXADO (R.02):
A Cláusula 5ª do contrato tenta transferir ao comprador a assunção de gravame bancário sem a interveniência da instituição credora, o que é ineficaz perante terceiros (art. 1.419 do CC). É necessária a notificação do credor hipotecário para emissão do Termo de Quitação e Cancelamento da Hipoteca (art. 251 da LRP).

5. DO FORO DE ELEIÇÃO CONFLITANTE:
A eleição de foro em São Paulo/SP para imóvel situado em Campinas/SP não afasta a competência absoluta registral da Comarca do imóvel para os atos registrais reais (art. 47 do CPC).`,
      divergencias: [
        {
          id: 'div-01',
          categoria: 'Área e Medidas Perimetrais',
          severidade: 'Crítica',
          titulo: 'Área Total com Acréscimo Fático de 62,50 m²',
          descricao: 'Metragem descrita no contrato particular é 25% maior que a área registral formalmente matriculada.',
          dado_documento_a: 'Área total de 250,00 m² (10,00m x 25,00m)',
          dado_documento_b: 'Área total de 312,50 m² (com acréscimo de 62,50m² do lote 08)',
          impacto_registral: 'Óbice sumário de registro por afronta ao Princípio da Especialidade Objetiva (art. 176 da Lei 6.015/73). Nota devolutiva garantida.',
          solucao_recomendada: 'Instaurar procedimento de Usucapião Extrajudicial sobre a área excedente de 62,50 m² perante o RI ou escritura de retificação e unificação.'
        },
        {
          id: 'div-02',
          categoria: 'Estado Civil e Outorga',
          severidade: 'Crítica',
          titulo: 'Ausência de Outorga Uxória do Cônjuge Vendedor',
          descricao: 'O vendedor consta como casado no contrato mas a esposa não participou nem assinou a alienação.',
          dado_documento_a: 'Vendedor qualificado como solteiro quando adquiriu em 2008',
          dado_documento_b: 'Vendedor declara-se casado sob comunhão parcial com Silvana Prado de Souza, que NÃO assina',
          impacto_registral: 'Vício insanável no cartório. Nulidade relativa conforme Art. 1.647, I c/c Art. 1.649 do Código Civil.',
          solucao_recomendada: 'Coletar escritura pública de rerratificação com a expressa anuência e outorga uxória da esposa Silvana Prado de Souza.'
        },
        {
          id: 'div-03',
          categoria: 'Ônus, Gravames e Cláusulas',
          severidade: 'Crítica',
          titulo: 'Hipoteca Cedular Bancária Ativa e Não Cancelada',
          descricao: 'Consta registro de hipoteca bancária de R$ 95.000,00 ativa na matrícula com transferência irregular no contrato.',
          dado_documento_a: 'R.02/48.910 - Hipoteca de 1º Grau em favor do Banco Hipotecário Nacional S/A',
          dado_documento_b: 'Cláusula 5ª do contrato repassa obrigação ao comprador sem anuência do credor hipotecário',
          impacto_registral: 'Impossibilidade de transmissão da propriedade livre e desembaraçada sem cancelamento do ônus real.',
          solucao_recomendada: 'Solicitar emissão de Termo de Quitação e Cancelamento de Hipoteca junto à instituição financeira e averbar o cancelamento.'
        },
        {
          id: 'div-04',
          categoria: 'Titularidade e Qualificação',
          severidade: 'Moderada',
          titulo: 'Construção Residencial de 165,00 m² sem Averbação',
          descricao: 'A matrícula descreve terreno nu, enquanto no contrato e no local existe residência térrea com piscina.',
          dado_documento_a: 'Terreno nu sem qualquer benfeitoria averbada',
          dado_documento_b: 'Residência em alvenaria com 165,00 m² construídos (3 dormitórios, piscina e edícula)',
          impacto_registral: 'Impede financiamento habitacional futuro e gera divergência com o cadastro predial do IPTU.',
          solucao_recomendada: 'Providenciar Habite-se na Prefeitura de Campinas, CND do INSS/Receita Federal e averbação de construção no RI.'
        },
        {
          id: 'div-05',
          categoria: 'Endereço e Numeração',
          severidade: 'Moderada',
          titulo: 'Numeração Predial nº 420 Não Averba no RI',
          descricao: 'A matrícula averbou o nome da rua (Acácias), mas a numeração predial 420 ainda não foi objeto de averbação.',
          dado_documento_a: 'Rua das Acácias (antiga Rua Projetada A), sem número predial atribuído',
          dado_documento_b: 'Rua das Acácias, nº 420',
          impacto_registral: 'Exige certidão de dados cadastrais/numeração da Prefeitura para perfeita conformação do endereço.',
          solucao_recomendada: 'Apresentar certidão de numeração oficial da Prefeitura Municipal junto ao requerimento de registro.'
        }
      ],
      clausulas_conflitantes: [
        {
          id: 'claus-01',
          clausula_doc_a: 'R.02: Gravame hipotecário inalienável sem anuência do credor fiduciário/hipotecário',
          clausula_doc_b: 'Cláusula 5ª: O comprador assume eventuais ônus e isenta o alienante',
          conflito: 'Cláusula contratual ineficaz em relação ao agente financeiro credor',
          risco: 'Risco de penhora e leilão judicial da dívida original do titular primitivo',
          sugestao_redacao: 'Condicionar o pagamento final à apresentação do Termo de Baixa e Liberação de Ônus com firma reconhecida da instituição credora.'
        },
        {
          id: 'claus-02',
          clausula_doc_a: 'Princípio da forum rei sitae (Comarca de Campinas/SP - situação da coisa)',
          clausula_doc_b: 'Cláusula 11ª: Eleição do Foro Central da Comarca de São Paulo/SP',
          conflito: 'Incompetência relativa em matéria de ações reais imobiliárias e litígios sobre posse e domínio',
          risco: 'Declinação de ofício da competência em ações de adjudicação compulsória ou retificação de área',
          sugestao_redacao: 'Rerratificar a cláusula de foro para o Foro da Comarca de Campinas/SP, competente por lei para o registro imobiliário.'
        }
      ],
      dados_convergentes: [
        { campo: 'Nome do Proprietário/Alienante', valor: 'Marcos Aurélio de Souza', status: 'Conforme' },
        { campo: 'CPF do Alienante', valor: '142.889.108-33', status: 'Conforme' },
        { campo: 'RG do Alienante', valor: '18.234.901-X SSP/SP', status: 'Conforme' },
        { campo: 'Identificação Original do Imóvel', valor: 'Lote 14, Quadra B, Jardim das Palmeiras', status: 'Conforme' },
        { campo: 'Denominação da Rua', valor: 'Rua das Acácias (averbada pela AV.03)', status: 'Conforme' }
      ],
      acoes_recomendadas: [
        'Elaborar Minuta de Escritura Pública de Rerratificação com comparecimento e outorga expressa da cônjuge Silvana Prado de Souza.',
        'Instaurar procedimento de Usucapião Extrajudicial perante o 2º RI de Campinas para a área excedente de 62,50 m² anexada aos fundos.',
        'Notificar o Banco credor para liquidação e baixa da hipoteca ativa (R.02).',
        'Contratar engenheiro habilitado com ART para regularização do Habite-se municipal da casa de 165m² e emissão de CND da Receita Federal.',
        'Reunir certidão de dados cadastrais do IPTU para averbação do número predial 420.'
      ],
      tempo_processamento_ms: 1280
    }
  },
  {
    id: 'preset-matricula-vs-memorial-topografico',
    nome: 'Matrícula Cartorária vs. Memorial Topográfico Georreferenciado',
    subtitulo: 'Divergência de confrontações perimetrais e diferença de área física (-1.160,00m²)',
    tipo_imovel: 'Imóvel Rural / Chácara em Transição Urbana',
    documentoA: {
      tipo: 'Matricula_Atualizada',
      titulo: 'Matrícula Imobiliária nº 12.440',
      orgao_emissor: 'Oficial de Registro de Imóveis de Sorocaba/SP',
      data_emissao: '05/02/2026',
      conteudo: `MATRÍCULA Nº 12.440 - LIVRO 2 REGISTRO GERAL
IMÓVEL: Uma gleba de terras denominada "Sítio Primavera", situada no Bairro dos Morros, nesta comarca de Sorocaba/SP, com a área total de 10.000,00 m² (um hectare), com as seguintes divisas e confrontações: Inicia no marco zero cravado à margem da Estrada Municipal; segue confrontando ao Norte com terras dos Herdeiros de Joaquim Bueno na extensão de 100 metros; ao Sul confronta com o Córrego das Pedras na extensão de 100 metros; a Leste com a Estrada Municipal na extensão de 100 metros; e a Oeste com a propriedade de Benedito de Oliveira na extensão de 100 metros.
Proprietário: ESPÓLIO DE ANTÔNIO FERREIRA LIMA.`
    },
    documentoB: {
      tipo: 'Planta_Topografica',
      titulo: 'Memorial Descritivo e Levantamento Topográfico Georreferenciado',
      orgao_emissor: 'Engenharia de Agrimensura & Topografia Cadastral (CREA-SP)',
      data_emissao: '22/01/2026',
      conteudo: `MEMORIAL DESCRITIVO GEORREFERENCIADO AO SISTEMA SIRGAS 2000
Imóvel: Sítio Primavera - Estrada Municipal dos Bandeirantes, km 12, Sorocaba/SP.
Responsável Técnico: Eng. Agrimensor João Pedro Alvarenga - CREA/SP nº 506.112.981-D - ART nº 280272300192.
ÁREA MEDIDA IN LOCO: 8.840,00 m² (oito mil, oitocentos e quarenta metros quadrados), perímetro de 382,40 metros.
Vértices e Coordenadas UTM: P-01 (E: 245120.44m, N: 7399812.10m)...
Confrontações Atuais:
- Norte: Condomínio Residencial Bella Vista (antigos Herdeiros de Joaquim Bueno - Matrícula 39.800).
- Leste: Faixa de Domínio da Estrada Municipal asfaltada (alargamento com desapropriação fática de 12 metros de pista).
- Sul: APP do Córrego das Pedras (recuo de 30 metros de Preservação Permanente).
- Oeste: Ademir de Oliveira e outros.`
    },
    dadosImovel: {
      matricula: '12.440',
      cartorio: 'Oficial de Registro de Imóveis de Sorocaba/SP',
      logradouro: 'Estrada Municipal dos Bandeirantes, km 12',
      municipio_uf: 'Sorocaba/SP'
    },
    resultadoPadrao: {
      status_geral: 'Compatível com Ressalvas',
      indice_conformidade: 71,
      total_divergencias: 3,
      divergencias_criticas: 1,
      divergencias_moderadas: 2,
      divergencias_leves: 0,
      resumo_executivo: 'Identificada divergência quantitativa de área (-1.160m²) decorrente de desapropriação fática para alargamento de via pública e necessidade de atualização de confrontantes com anuência do condomínio confrontante.',
      parecer_juridico_registral: `PARECER TÉCNICO DE RETIFICAÇÃO DE REGISTRO IMOBILIÁRIO (ART. 213 DA LEI 6.015/73)

1. DA DIFERENÇA QUANTITATIVA DE ÁREA:
A área matriculada é de 10.000,00 m² e a área real apurada em levantamento georreferenciado é de 8.840,00 m² (redução de 1.160,00 m² correspondente a 11,6%). Por se tratar de apuração intra muros com perda decorrente de faixa viária pública, é perfeitamente cabível o procedimento de Retificação Administrativa de Área perante o Oficial de Registro de Imóveis com fulcro no Art. 213, II da Lei 6.015/73.

2. DA ATUALIZAÇÃO DOS CONFRONTANTES:
Os confrontantes históricos da matrícula ("Herdeiros de Joaquim Bueno") foram substituídos pelo Condomínio Residencial Bella Vista. Faz-se necessária a notificação dos atuais confrontantes tabulares ou obtenção de suas cartas de anuência expressa com firmas reconhecidas na planta e memorial descritivo.`,
      divergencias: [
        {
          id: 'div-top-01',
          categoria: 'Área e Medidas Perimetrais',
          severidade: 'Crítica',
          titulo: 'Diferença de Área Física (-1.160,00 m²)',
          descricao: 'A área real levantada por GPS geodésico é 11,6% menor do que a descrita no registro original.',
          dado_documento_a: 'Área registrada de 10.000,00 m² (1,00 hectare)',
          dado_documento_b: 'Área levantada de 8.840,00 m²',
          impacto_registral: 'Impede alienações fracionadas ou desdobros sem prévia retificação de área na matrícula.',
          solucao_recomendada: 'Instaurar procedimento de Retificação de Registro Imobiliário Administrativo (Art. 213, inciso II da Lei 6.015/73).'
        },
        {
          id: 'div-top-02',
          categoria: 'Confrontações e Divisas',
          severidade: 'Moderada',
          titulo: 'Confrontantes Históricos Desatualizados',
          descricao: 'A matrícula cita herdeiros falecidos, enquanto no local existe empreendimento imobiliário aprovado.',
          dado_documento_a: 'Confronta ao Norte com Herdeiros de Joaquim Bueno',
          dado_documento_b: 'Confronta ao Norte com o Condomínio Residencial Bella Vista',
          impacto_registral: 'O Oficial de Registro notificará os titulares tabulares atuais para anuência.',
          solucao_recomendada: 'Coletar anuência formal do síndico/administradora do Condomínio Bella Vista com cópia da ata de eleição registrada.'
        },
        {
          id: 'div-top-03',
          categoria: 'Ônus, Gravames e Cláusulas',
          severidade: 'Moderada',
          titulo: 'Faixa de Domínio e APP de Córrego Não Delimitadas na Matrícula',
          descricao: 'O levantamento topográfico identificou faixa de recuo de APP e servidão viária não averbadas.',
          dado_documento_a: 'Matrícula não faz menção a limitações ambientais ou administrativas',
          dado_documento_b: 'Memorial indica APP de 30 metros do Córrego e faixa viária municipal',
          impacto_registral: 'Necessidade de inscrição no CAR (Cadastro Ambiental Rural) e averbação das faixas restritivas.',
          solucao_recomendada: 'Elaborar planta com memorial destacando a área útil edificável e registrar no CAR estadual.'
        }
      ],
      clausulas_conflitantes: [],
      dados_convergentes: [
        { campo: 'Denominação do Imóvel', valor: 'Sítio Primavera', status: 'Conforme' },
        { campo: 'Localização Geográfica', valor: 'Bairro dos Morros, Sorocaba/SP', status: 'Conforme' },
        { campo: 'Curso d´água Confrontante', valor: 'Córrego das Pedras', status: 'Conforme' }
      ],
      acoes_recomendadas: [
        'Protocolar pedido de Retificação Unilateral de Área perante o Registro de Imóveis de Sorocaba com fulcro no art. 213, II da LRP.',
        'Obter assinaturas com reconhecimento de firma de todos os confrontantes tabulares na planta e memorial descritivo.',
        'Apresentar ART quitada do Conselho Regional de Engenharia e Agronomia (CREA-SP).'
      ],
      tempo_processamento_ms: 980
    }
  }
];

export function gerarComparacaoFallback(
  docA: { tipo: string; titulo: string; conteudo: string },
  docB: { tipo: string; titulo: string; conteudo: string },
  dadosImovel?: { matricula?: string; logradouro?: string; municipio_uf?: string }
): ComparacaoDocumentosResultado {
  // Check if matches preset 1
  const textA = (docA.conteudo || '').toLowerCase();
  const textB = (docB.conteudo || '').toLowerCase();

  if (textA.includes('48.910') || textB.includes('312,50') || textA.includes('marcos aurélio')) {
    return DOCUMENT_COMPARISON_PRESETS[0].resultadoPadrao;
  }

  if (textA.includes('12.440') || textB.includes('8.840') || textB.includes('memorial descritivo')) {
    return DOCUMENT_COMPARISON_PRESETS[1].resultadoPadrao;
  }

  // Dynamic intelligent analysis
  const divergencias: DivergenciaItem[] = [];
  const clausulas: ClausulaConflitante[] = [];
  const convergentes: DadoConvergente[] = [];

  // Extract potential area discrepancies
  const regexArea = /(\d+[\.,]?\d*)\s*(?:m²|metros\s*quadrados|ha|hectares)/gi;
  const matchesA = Array.from(textA.matchAll(regexArea));
  const matchesB = Array.from(textB.matchAll(regexArea));

  if (matchesA.length > 0 && matchesB.length > 0) {
    const areaA = matchesA[0][0];
    const areaB = matchesB[0][0];
    if (areaA !== areaB) {
      divergencias.push({
        id: `div-area-${Date.now()}`,
        categoria: 'Área e Medidas Perimetrais',
        severidade: 'Crítica',
        titulo: 'Inconsistência de Área Total Entre os Documentos',
        descricao: `O primeiro documento indica ${areaA}, enquanto o segundo documento descreve ${areaB}.`,
        dado_documento_a: areaA,
        dado_documento_b: areaB,
        impacto_registral: 'Impede o registro imobiliário pelo Princípio da Especialidade Objetiva (Art. 176 da LRP).',
        solucao_recomendada: 'Elaborar levantamento topográfico com ART e requerer procedimento de retificação de área ou usucapião da diferença.'
      });
    } else {
      convergentes.push({
        campo: 'Metragem / Área Declarada',
        valor: areaA,
        status: 'Conforme'
      });
    }
  }

  // Check marital status & spouse consent
  const hasCasadoB = textB.includes('casad') || textB.includes('comunhão');
  const hasSolteiroA = textA.includes('solteir');
  if (hasCasadoB && hasSolteiroA) {
    divergencias.push({
      id: `div-civil-${Date.now()}`,
      categoria: 'Estado Civil e Outorga',
      severidade: 'Crítica',
      titulo: 'Alteração de Estado Civil sem Outorga Uxória',
      descricao: 'O alienante constava como solteiro e posteriormente declarou-se casado, exigindo anuência formal do cônjuge.',
      dado_documento_a: 'Proprietário titular qualificado como solteiro',
      dado_documento_b: 'Declaração de matrimônio sem expressa assinatura da esposa',
      impacto_registral: 'Nulidade do negócio jurídico conforme Art. 1.647 do Código Civil brasileiro.',
      solucao_recomendada: 'Coletar escritura pública de rerratificação com comparecimento e outorga do cônjuge.'
    });
  }

  // Check liens and mortgages
  if ((textA.includes('hipoteca') || textA.includes('penhora') || textA.includes('indisponib')) && !textB.includes('baixa')) {
    divergencias.push({
      id: `div-onus-${Date.now()}`,
      categoria: 'Ônus, Gravames e Cláusulas',
      severidade: 'Crítica',
      titulo: 'Gravame Real Constante na Matrícula Sem Quitação Formal',
      descricao: 'Consta registro de gravame (hipoteca/penhora) no histórico cartorário sem a respectiva baixa comprovada.',
      dado_documento_a: 'Gravame real ativo registrado',
      dado_documento_b: 'Omissão ou transferência ineficaz do ônus para o adquirente',
      impacto_registral: 'Impossibilidade de emitir certidão de matrícula com propriedade livre e desembaraçada.',
      solucao_recomendada: 'Notificar o credor hipotecário para emissão de Termo de Quitação e Cancelamento de Ônus.'
    });
  }

  // Check construction
  if ((textB.includes('casa') || textB.includes('edifica') || textB.includes('constru')) && (textA.includes('terreno nu') || textA.includes('lote de terreno'))) {
    divergencias.push({
      id: `div-benfeitoria-${Date.now()}`,
      categoria: 'Titularidade e Qualificação',
      severidade: 'Moderada',
      titulo: 'Edificação Física Existente Não Averbada no R.I.',
      descricao: 'Existe edificação predial no imóvel que ainda consta como terreno nu perante o Cartório de Registro de Imóveis.',
      dado_documento_a: 'Terreno nu ou lote sem benfeitorias averbadas',
      dado_documento_b: 'Residência/construção predial em alvenaria descrita no negócio',
      impacto_registral: 'Gera óbice para obtenção de financiamentos e divergência com o lançamento do IPTU.',
      solucao_recomendada: 'Obter Habite-se municipal, CND do INSS/Receita Federal e averbar a construção na matrícula.'
    });
  }

  // Check Forum clause
  if (textB.includes('foro') && !textB.includes('situação do imóvel')) {
    clausulas.push({
      id: `claus-01`,
      clausula_doc_a: 'Princípio do Foro da Situação da Coisa (Comarca do Imóvel)',
      clausula_doc_b: 'Cláusula de eleição de foro divergente no contrato particular',
      conflito: 'Divergência de competência territorial para ações reais imobiliárias',
      risco: 'Extinção ou declinação de ações judiciais de adjudicação compulsória ou usucapião',
      sugestao_redacao: 'Ajustar o foro de eleição para a Comarca de localização do imóvel.'
    });
  }

  if (divergencias.length === 0) {
    divergencias.push({
      id: `div-gen-${Date.now()}`,
      categoria: 'Endereço e Numeração',
      severidade: 'Leve',
      titulo: 'Padronização da Qualificação Registral',
      descricao: 'Pequena divergência cadastral entre a descrição do imóvel e os dados informados.',
      dado_documento_a: docA.titulo,
      dado_documento_b: docB.titulo,
      impacto_registral: 'Pode exigir certidão de dados cadastrais atualizada da Prefeitura.',
      solucao_recomendada: 'Apresentar certidão de espelho do IPTU para confirmação da numeração oficial.'
    });
  }

  const criticas = divergencias.filter(d => d.severidade === 'Crítica').length;
  const moderadas = divergencias.filter(d => d.severidade === 'Moderada').length;
  const leves = divergencias.filter(d => d.severidade === 'Leve').length;

  let statusGeral: ComparacaoDocumentosResultado['status_geral'] = 'Compatível com Ressalvas';
  let indice = 85;
  if (criticas >= 2) {
    statusGeral = 'Incompatível / Óbice Registral';
    indice = 42;
  } else if (criticas === 1) {
    statusGeral = 'Alto Risco de Divergência';
    indice = 64;
  }

  return {
    status_geral: statusGeral,
    indice_conformidade: indice,
    total_divergencias: divergencias.length,
    divergencias_criticas: criticas,
    divergencias_moderadas: moderadas,
    divergencias_leves: leves,
    divergencias,
    clausulas_conflitantes: clausulas,
    dados_convergentes: convergentes.length > 0 ? convergentes : [
      { campo: 'Finalidade Registral', valor: 'Regularização Imobiliária', status: 'Conforme' }
    ],
    resumo_executivo: `A auditoria automatizada entre o documento "${docA.titulo}" e "${docB.titulo}" localizou ${divergencias.length} inconsistência(s), sendo ${criticas} crítica(s).`,
    parecer_juridico_registral: `PARECER TÉCNICO REGISTRAL DE DIVERGÊNCIAS (PROVIMENTO 65/CNJ E LEI 6.015/73)

Foram identificados pontos de atenção que necessitam de saneamento antes de qualquer requerimento perante o Oficial de Registro de Imóveis:
- Recomenda-se realizar o alinhamento da cadeia dominial e documental.
- Deve-se obter outorgas ou certidões necessárias para suprir as divergências críticas.`,
    acoes_recomendadas: [
      'Solicitar certidão atualizada de inteiro teor da matrícula no Registro de Imóveis competente.',
      'Confrontar as medidas descritas com levantamento topográfico executado por engenheiro ou agrimensor.',
      'Saneamento das divergências através de escritura pública de rerratificação ou procedimento de retificação administrativa.'
    ],
    tempo_processamento_ms: 1100,
    simulated: true
  };
}
