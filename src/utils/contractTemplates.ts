import { 
  Contact, 
  Deal, 
  AppSettings, 
  TipoContratoTemplate, 
  ContratoAssinatura, 
  Signatario, 
  EventoAuditoria,
  ConfigAssinaturaEletronica,
  ModeloContratoPadrao
} from '../types';

export interface ParametroMinuta {
  tag: string;
  label: string;
  descricao: string;
  exemplo: string;
}

export const PARAMETROS_MINUTAS_PADRAO: ParametroMinuta[] = [
  { tag: '{NOME_CLIENTE}', label: 'Nome do Cliente', descricao: 'Nome completo ou Razão Social do contratante', exemplo: 'Carlos Eduardo Silveira' },
  { tag: '{CPF_CNPJ}', label: 'CPF / CNPJ', descricao: 'Documento oficial formatado', exemplo: '189.442.908-11' },
  { tag: '{TELEFONE_WHATSAPP}', label: 'WhatsApp', descricao: 'Telefone para contato e notificações', exemplo: '(11) 98741-2099' },
  { tag: '{EMAIL_CLIENTE}', label: 'E-mail', descricao: 'E-mail para envio do envelope eletrônico', exemplo: 'carlos.silveira@gmail.com' },
  { tag: '{ENDERECO_CLIENTE}', label: 'Endereço Cliente', descricao: 'Logradouro, número, bairro, cidade, UF e CEP', exemplo: 'Rua das Figueiras, 450, Jd. Alvorada, Campinas/SP' },
  { tag: '{RAZAO_SOCIAL}', label: 'Razão Social', descricao: 'Nome empresarial da contratada', exemplo: 'Brasil Legal Soluções Imobiliárias e Registrais Ltda' },
  { tag: '{CNPJ_EMPRESA}', label: 'CNPJ Empresa', descricao: 'CNPJ oficial da contratada', exemplo: '38.491.820/0001-55' },
  { tag: '{ENDERECO_EMPRESA}', label: 'Sede da Empresa', descricao: 'Endereço institucional da matriz', exemplo: 'Av. Brigadeiro Faria Lima, 3477 - Itaim Bibi, São Paulo/SP' },
  { tag: '{OBJETO_IMOVEL}', label: 'Objeto / Imóvel', descricao: 'Descrição pormenorizada do imóvel a ser regularizado', exemplo: 'Lote 14, Quadra B, com 320m², situado em Campinas/SP' },
  { tag: '{VALOR_HONORARIOS}', label: 'Valor Honorários', descricao: 'Valor total dos serviços em Reais (R$)', exemplo: 'R$ 18.500,00' },
  { tag: '{CONDICOES_PAGAMENTO}', label: 'Condições Pagamento', descricao: 'Formas de liquidação acordadas (Pix, Boleto, Parcelamento)', exemplo: 'Entrada de 30% via Pix e 10 parcelas mensais via boleto' },
  { tag: '{PRAZO_MESES}', label: 'Prazo Estimado', descricao: 'Duração técnica estimada em meses', exemplo: '6 (seis) meses' },
  { tag: '{FORO_COMARCA}', label: 'Foro / Comarca', descricao: 'Comarca de eleição contratual', exemplo: 'Comarca de Campinas/SP' },
  { tag: '{DATA_EXTENSO}', label: 'Data Atual', descricao: 'Data de formalização por extenso', exemplo: '6 de setembro de 2026' }
];

export function substituirParametrosMinuta(texto: string, mapa: Record<string, string>): string {
  let resultado = texto;
  for (const [tag, val] of Object.entries(mapa)) {
    resultado = resultado.split(tag).join(val || '');
  }
  return resultado;
}

export const initialModelosContratosPadrao: ModeloContratoPadrao[] = [
  {
    id: 'mod-reurb',
    codigo: 'PRESTACAO_SERVICOS_REURB',
    titulo: 'Contrato Padrão de Regularização Fundiária Urbana (REURB - Lei 13.465/2017)',
    descricao: 'Minuta oficial para procedimentos de REURB-S e REURB-E perante comissões municipais e CRIs.',
    categoria: 'Regularização Fundiária',
    versao: 'v3.2 Padronizada',
    ativo: true,
    ultima_modificacao: '2026-09-06T10:00:00Z',
    autor_modificacao: 'Dr. Eduardo Carneiro',
    variaveis_suportadas: [
      '{RAZAO_SOCIAL}', '{CNPJ_EMPRESA}', '{ENDERECO_EMPRESA}',
      '{NOME_CLIENTE}', '{CPF_CNPJ}', '{TELEFONE_WHATSAPP}', '{EMAIL_CLIENTE}', '{ENDERECO_CLIENTE}',
      '{OBJETO_IMOVEL}', '{VALOR_HONORARIOS}', '{CONDICOES_PAGAMENTO}', '{PRAZO_MESES}',
      '{FORO_COMARCA}', '{DATA_EXTENSO}'
    ],
    conteudo_minuta: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS TÉCNICOS E JURÍDICOS DE REGULARIZAÇÃO FUNDIÁRIA URBANA (REURB - LEI FEDERAL Nº 13.465/2017)

Pelo presente instrumento particular, de um lado:

CONTRATADA: {RAZAO_SOCIAL}, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº {CNPJ_EMPRESA}, com sede em {ENDERECO_EMPRESA}, doravante denominada simplesmente CONTRATADA;

E de outro lado:

CONTRATANTE: {NOME_CLIENTE}, inscrito(a) no CPF/MF sob o nº {CPF_CNPJ}, contato WhatsApp {TELEFONE_WHATSAPP}, e-mail {EMAIL_CLIENTE}, residente e domiciliado(a) em {ENDERECO_CLIENTE}, doravante denominado(a) simplesmente CONTRATANTE.

Têm entre si, justo e contratado, o que mutuamente aceitam e outorgam mediante as seguintes cláusulas e condições:

CLÁUSULA PRIMEIRA – DO OBJETO
1.1. O presente instrumento tem por objeto a prestação de serviços técnicos de engenharia legal, topografia e assessoria jurídica especializada pela CONTRATADA visando à regularização fundiária urbana (REURB-S ou REURB-E, conforme aplicável) do imóvel individualizado a seguir:
"{OBJETO_IMOVEL}".

CLÁUSULA SEGUNDA – DAS ATRIBUIÇÕES DA CONTRATADA
2.1. Constituem obrigações da CONTRATADA:
a) Realização de levantamento topográfico planialtimétrico georreferenciado ao Sistema Geodésico Brasileiro (SIRGAS 2000);
b) Elaboração de memorial descritivo, planta de situação e Anotação de Responsabilidade Técnica (ART/RRT);
c) Coleta e auditoria de documentos probatórios da posse mansa, pacífica e ininterrupta;
d) Montagem do dossiê técnico e formalização do requerimento administrativo perante a Comissão Municipal de REURB e Prefeitura Competente;
e) Acompanhamento da expedição da Certidão de Regularização Fundiária (CRF) e respectivo registro junto ao Cartório de Registro de Imóveis (CRI) competente.

CLÁUSULA TERCEIRA – DAS OBRIGAÇÕES DO CONTRATANTE
3.1. O CONTRATANTE obriga-se a fornecer à CONTRATADA todos os títulos, recibos de compra e venda, carnês de IPTU, contas de concessionárias públicas de energia e água, e demais elementos necessários à comprovação da titularidade da posse.
3.2. Custear diretamente os emolumentos cartorários e taxas municipais caso não seja beneficiário de gratuidade pela modalidade REURB-S.

CLÁUSULA QUARTA – DO PREÇO E CONDIÇÕES DE PAGAMENTO
4.1. Pelos serviços contratados, o CONTRATANTE pagará à CONTRATADA o valor global e líquido de {VALOR_HONORARIOS}.
4.2. Condições de liquidação acordadas: {CONDICOES_PAGAMENTO}.

CLÁUSULA QUINTA – DO PRAZO ESTIMADO
5.1. O prazo técnico estimado para montagem e protocolo do dossiê perante os órgãos competentes é de aproximadamente {PRAZO_MESES}, ressalvados prazos recursais e exigências de notas devolutivas emitidas pelo Ofício Registral.

CLÁUSULA SEXTA – DA VALIDADE JURÍDICA DA ASSINATURA ELETRÔNICA
6.1. As partes reconhecem expressamente a veracidade, validade, autenticidade e plena eficácia jurídica deste instrumento assinado por meio eletrônico, na forma da Medida Provisória nº 2.200-2/2001 e do art. 5º da Lei Federal nº 14.063/2020 (Assinatura Eletrônica Avançada), aceitando o registro de auditoria, geolocalização e carimbo de tempo como prova cabal de sua manifestação de vontade.

CLÁUSULA SÉTIMA – DA LGPD E PROTEÇÃO DE DADOS
7.1. A CONTRATADA compromete-se a tratar os dados pessoais e documentais do CONTRATANTE estritamente para a finalidade de execução deste contrato e do procedimento registral, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

CLÁUSULA OITAVA – DO FORO
8.1. Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o foro da {FORO_COMARCA}, com renúncia expressa a qualquer outro.

E, por estarem justas e acordadas, as partes assinam eletronicamente o presente instrumento.

{DATA_EXTENSO}.`
  },
  {
    id: 'mod-usucapiao',
    codigo: 'USUCAPIAO_EXTRAJUDICIAL',
    titulo: 'Contrato de Honorários para Usucapião Extrajudicial (Prov. 65/CNJ)',
    descricao: 'Modelo padrão para processo extrajudicial perante Tabelionato de Notas e CRI (art. 216-A da LRP).',
    categoria: 'Usucapião',
    versao: 'v2.8 Padronizada',
    ativo: true,
    ultima_modificacao: '2026-09-06T10:00:00Z',
    autor_modificacao: 'Dra. Vanessa Monteiro',
    variaveis_suportadas: [
      '{RAZAO_SOCIAL}', '{CNPJ_EMPRESA}', '{ENDERECO_EMPRESA}',
      '{NOME_CLIENTE}', '{CPF_CNPJ}', '{TELEFONE_WHATSAPP}', '{EMAIL_CLIENTE}', '{ENDERECO_CLIENTE}',
      '{OBJETO_IMOVEL}', '{VALOR_HONORARIOS}', '{CONDICOES_PAGAMENTO}', '{PRAZO_MESES}',
      '{FORO_COMARCA}', '{DATA_EXTENSO}'
    ],
    conteudo_minuta: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS TÉCNICOS E ASSESSORIA JURÍDICA PARA PROCESSO DE USUCAPIÃO EXTRAJUDICIAL (ART. 216-A DA LEI 6.015/73 E PROVIMENTO Nº 65/CNJ)

CONTRATADA: {RAZAO_SOCIAL}, CNPJ: {CNPJ_EMPRESA}, com sede em {ENDERECO_EMPRESA}.
CONTRATANTE: {NOME_CLIENTE}, CPF: {CPF_CNPJ}, WhatsApp: {TELEFONE_WHATSAPP}, e-mail: {EMAIL_CLIENTE}, domiciliado(a) em {ENDERECO_CLIENTE}.

As partes identificadas celebram o presente contrato para prestação de assessoria técnico-jurídica notarial e registral:

CLÁUSULA PRIMEIRA – DO OBJETO
1.1. O presente contrato tem por escopo a condução do procedimento de USUCAPIÃO EXTRAJUDICIAL perante o Tabelionato de Notas e o Oficial de Registro de Imóveis competente, objetivando a aquisição originária da propriedade do imóvel:
"{OBJETO_IMOVEL}".

CLÁUSULA SEGUNDA – DOS SERVIÇOS INCLUSOS
2.1. A CONTRATADA executará:
a) Análise e saneamento da cadeia possessória ininterrupta com ânimo de dono (animus domini);
b) Levantamento topográfico pericial com memorial descritivo assinado por profissional habilitado com ART/RRT;
c) Lavratura de Ata Notarial de Constatação de Posse perante o Tabelião de Notas;
d) Obtenção das certidões vintenárias e negativas de distribuidores cíveis e federais;
e) Notificação dos confrontantes e das Fazendas Públicas (União, Estado e Município);
f) Protocolo do pedido e atendimento a eventuais notas de exigência registrais.

CLÁUSULA TERCEIRA – DOS HONORÁRIOS
3.1. Pelos serviços ajustados, o CONTRATANTE pagará os honorários contratuais de {VALOR_HONORARIOS}.
3.2. Forma de pagamento: {CONDICOES_PAGAMENTO}.

CLÁUSULA QUARTA – PRAZO E DILIGÊNCIAS
4.1. Prazo estimado para instrução da Ata Notarial e protocolo no Registro de Imóveis: {PRAZO_MESES}.
4.2. Foro de eleição: {FORO_COMARCA}.

CLÁUSULA QUINTA – ASSINATURA ELETRÔNICA E VALIDADE
5.1. Este contrato é celebrado e firmado eletronicamente com garantia de integridade probatória pelo hash SHA-256 e logs auditados, nos termos da Lei 14.063/2020 e Provimento CNJ correspondente.

{DATA_EXTENSO}.`
  },
  {
    id: 'mod-adjudicacao',
    codigo: 'ADJUDICACAO_COMPULSORIA',
    titulo: 'Contrato de Prestação de Serviços para Adjudicação Compulsória Extrajudicial',
    descricao: 'Minuta padronizada com fulcro no art. 216-B da Lei 6.015/73 (Lei 14.382/2022) para promessas de compra quitadas.',
    categoria: 'Regularização Fundiária',
    versao: 'v2.1 Padronizada',
    ativo: true,
    ultima_modificacao: '2026-09-06T10:00:00Z',
    autor_modificacao: 'Dr. Eduardo Carneiro',
    variaveis_suportadas: [
      '{RAZAO_SOCIAL}', '{CNPJ_EMPRESA}', '{ENDERECO_EMPRESA}',
      '{NOME_CLIENTE}', '{CPF_CNPJ}', '{TELEFONE_WHATSAPP}', '{EMAIL_CLIENTE}', '{ENDERECO_CLIENTE}',
      '{OBJETO_IMOVEL}', '{VALOR_HONORARIOS}', '{CONDICOES_PAGAMENTO}', '{PRAZO_MESES}',
      '{FORO_COMARCA}', '{DATA_EXTENSO}'
    ],
    conteudo_minuta: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS E REGISTRAIS PARA ADJUDICAÇÃO COMPULSÓRIA EXTRAJUDICIAL (ART. 216-B DA LEI DE REGISTROS PÚBLICOS - LEI FEDERAL Nº 14.382/2022)

CONTRATADA: {RAZAO_SOCIAL}, inscrita no CNPJ sob o nº {CNPJ_EMPRESA}, sediada em {ENDERECO_EMPRESA}.
CONTRATANTE: {NOME_CLIENTE}, inscrito(a) no CPF/MF sob o nº {CPF_CNPJ}, domiciliado(a) em {ENDERECO_CLIENTE}, WhatsApp {TELEFONE_WHATSAPP}, e-mail {EMAIL_CLIENTE}.

CLÁUSULA PRIMEIRA – DO OBJETO
1.1. Prestação de serviços jurídicos e registrais para a realização do procedimento de ADJUDICAÇÃO COMPULSÓRIA EXTRAJUDICIAL perante o Oficial de Registro de Imóveis competente, objetivando a transferência definitiva do domínio do imóvel:
"{OBJETO_IMOVEL}", em razão da recusa, inércia ou impossibilidade do promitente vendedor em outorgar a escritura definitiva após a quitação integral do preço.

CLÁUSULA SEGUNDA – DAS ETAPAS
2.1. Notificação extrajudicial do vendedor através do Oficial de Registro de Títulos e Documentos (RTD);
2.2. Apresentação das certidões de quitação do ITBI e comprovação do adimplemento do preço;
2.3. Instrução do requerimento conclusivo perante o Registro Imobiliário para abertura ou transferência da matrícula.

CLÁUSULA TERCEIRA – DO PREÇO E LIQUIDAÇÃO
3.1. Honorários profissionais no importe de {VALOR_HONORARIOS}, a serem satisfeitos nas seguintes condições: {CONDICOES_PAGAMENTO}.
3.2. Prazo técnico estimado: {PRAZO_MESES}.
3.3. Foro competente: {FORO_COMARCA}.

{DATA_EXTENSO}.`
  },
  {
    id: 'mod-honorarios-exito',
    codigo: 'HONORARIOS_COM_EXITO',
    titulo: 'Contrato de Honorários com Cláusula Mista (Entrada + Êxito Cartorário)',
    descricao: 'Modelo seguro para honorários vinculados ao êxito da abertura/abertura da matrícula imobiliária.',
    categoria: 'Contratos de Honorários',
    versao: 'v1.9 Padronizada',
    ativo: true,
    ultima_modificacao: '2026-09-06T10:00:00Z',
    autor_modificacao: 'Diretoria Executiva',
    variaveis_suportadas: [
      '{RAZAO_SOCIAL}', '{CNPJ_EMPRESA}', '{ENDERECO_EMPRESA}',
      '{NOME_CLIENTE}', '{CPF_CNPJ}', '{TELEFONE_WHATSAPP}', '{EMAIL_CLIENTE}', '{ENDERECO_CLIENTE}',
      '{OBJETO_IMOVEL}', '{VALOR_HONORARIOS}', '{CONDICOES_PAGAMENTO}', '{PRAZO_MESES}',
      '{FORO_COMARCA}', '{DATA_EXTENSO}'
    ],
    conteudo_minuta: `CONTRATO DE HONORÁRIOS ADVOCATÍCIOS E ENGENHARIA LEGAL COM CLÁUSULA DE ÊXITO REGISTRAL (QUOTA LITIS PARCIAL)

CONTRATADA: {RAZAO_SOCIAL}, CNPJ: {CNPJ_EMPRESA}, endereço: {ENDERECO_EMPRESA}.
CONTRATANTE: {NOME_CLIENTE}, CPF: {CPF_CNPJ}, endereço: {ENDERECO_CLIENTE}, contato: {TELEFONE_WHATSAPP}.

CLÁUSULA PRIMEIRA – DO OBJETO
1.1. O presente contrato tem como objeto a prestação de serviços integrais para obtenção da matrícula e título definitivo do imóvel:
"{OBJETO_IMOVEL}".

CLÁUSULA SEGUNDA – DOS HONORÁRIOS DE ÊXITO E PARCELAMENTO
2.1. O valor total convencionado é de {VALOR_HONORARIOS}, estruturado sob o critério de honorários de instrução inicial e parcela substancial condicionada ao efetivo registro imobiliário com emissão da matrícula definitiva (cláusula de êxito).
2.2. Condições: {CONDICOES_PAGAMENTO}.
2.3. Prazo estimado para cumprimento das etapas técnicas: {PRAZO_MESES}.

CLÁUSULA TERCEIRA – DA ASSINATURA ELETRÔNICA
3.1. Este contrato é assinado eletronicamente com garantia de integridade ICP-Brasil e MP 2.200-2/2001.

Foro eleito: {FORO_COMARCA}.
{DATA_EXTENSO}.`
  },
  {
    id: 'mod-procuracao',
    codigo: 'PROCURACAO_AD_NEGOTIA',
    titulo: 'Procuração Notarial e Registral Ad Negotia et Extrajudicia',
    descricao: 'Mandato expresso para representação do cliente perante CRIs, Tabelionatos, Prefeituras e INCRA.',
    categoria: 'Mandato & Procuração',
    versao: 'v3.0 Padronizada',
    ativo: true,
    ultima_modificacao: '2026-09-06T10:00:00Z',
    autor_modificacao: 'Dr. Eduardo Carneiro',
    variaveis_suportadas: [
      '{RAZAO_SOCIAL}', '{CNPJ_EMPRESA}', '{ENDERECO_EMPRESA}',
      '{NOME_CLIENTE}', '{CPF_CNPJ}', '{ENDERECO_CLIENTE}',
      '{FORO_COMARCA}', '{DATA_EXTENSO}'
    ],
    conteudo_minuta: `PROCURAÇÃO NOTARIAL E REGISTRAL "AD NEGOTIA ET EXTRAJUDICIA"

OUTORGANTE: {NOME_CLIENTE}, inscrito(a) no CPF sob nº {CPF_CNPJ}, residente em {ENDERECO_CLIENTE}.

OUTORGADOS: {RAZAO_SOCIAL}, inscrita no CNPJ sob o nº {CNPJ_EMPRESA}, com sede em {ENDERECO_EMPRESA}, e seus advogados e engenheiros credenciados.

PODERES:
Pelo presente instrumento particular, o(a) OUTORGANTE nomeia e constitui os OUTORGADOS seus bastantes procuradores, conferindo-lhes amplos poderes para representar o(a) Outorgante perante quaisquer Cartórios de Registro de Imóveis, Tabelionatos de Notas, Prefeituras Municipais, Secretarias de Habitação e Urbanismo, INCRA e órgãos ambientais competentes.
Especialmente para: requerer e acompanhar procedimentos de Regularização Fundiária Urbana (REURB), Usucapião Extrajudicial, Retificação Administrativa de Área, Desdobro, Unificação e Averbações, requerer certidões, assinar termos de anuência e declarações de confrontação, juntar e desentranhar documentos técnicos, plantas, memoriais descritivos e ART/RRT, prestar esclarecimentos e satisfazer notas de devolução registrais, praticando todos os atos necessários ao fiel e integral cumprimento deste mandato.

Validade: Por prazo determinado de 24 (vinte e quatro) meses a contar da data de sua assinatura digital.
Comarca de referência: {FORO_COMARCA}.

Autenticação Digital: Validação garantida por assinatura eletrônica avançada com carimbo de tempo inviolável (MP 2.200-2/2001 e Lei 14.063/2020).

{DATA_EXTENSO}.`
  },
  {
    id: 'mod-posse-mansa',
    codigo: 'DECLARACAO_POSSE_MANSA',
    titulo: 'Declaração Unilateral de Posse Mansa, Pacífica e Justo Título',
    descricao: 'Declaração sob as penas da lei para instrução de usucapião ou REURB perante o oficial registrador.',
    categoria: 'Declarações',
    versao: 'v2.5 Padronizada',
    ativo: true,
    ultima_modificacao: '2026-09-06T10:00:00Z',
    autor_modificacao: 'Dra. Vanessa Monteiro',
    variaveis_suportadas: [
      '{NOME_CLIENTE}', '{CPF_CNPJ}', '{OBJETO_IMOVEL}', '{DATA_EXTENSO}'
    ],
    conteudo_minuta: `DECLARAÇÃO UNILATERAL DE POSSE MANSA, PACÍFICA E JUSTO TÍTULO COM DECLARAÇÃO DE CONFRONTANTES

Eu, {NOME_CLIENTE}, portador(a) do CPF nº {CPF_CNPJ}, declaro para os devidos fins de direito, sob as penas da Lei (art. 299 do Código Penal), que exerço a posse mansa, pacífica, contínua e incontestada, com ânimo de dono (animus domini), há mais de 10 (dez) anos, sobre o imóvel localizado em:
"{OBJETO_IMOVEL}".

Declaro ainda:
1. Que sobre a referida área nunca existiu litígio, oposição judicial ou contestação de terceiros ou herdeiros;
2. Que resido e/ou realizo melhorias, obras de manutenção, conservação e pagamento dos tributos que incidem sobre o bem;
3. Que todas as informações e documentos por mim apresentados à CONTRATADA são verídicos e autênticos.

Declaração firmada eletronicamente nos moldes da Lei Federal nº 14.063/2020.

{DATA_EXTENSO}.`
  },
  {
    id: 'mod-lgpd',
    codigo: 'TERMO_CONFIDENCIALIDADE_LGPD',
    titulo: 'Termo de Custódia Documental e Proteção de Dados (LGPD)',
    descricao: 'Termo de compliance com a Lei Federal 13.709/2018 para guarda segura de documentos pessoais e cartorários.',
    categoria: 'Compliance & LGPD',
    versao: 'v2.0 Padronizada',
    ativo: true,
    ultima_modificacao: '2026-09-06T10:00:00Z',
    autor_modificacao: 'DPO / Compliance',
    variaveis_suportadas: [
      '{RAZAO_SOCIAL}', '{CNPJ_EMPRESA}', '{NOME_CLIENTE}', '{CPF_CNPJ}', '{DATA_EXTENSO}'
    ],
    conteudo_minuta: `TERMO DE CUSTÓDIA DOCUMENTAL, TRATAMENTO DE DADOS PESSOAIS E SIGILO PROFISSIONAL (LGPD - LEI Nº 13.709/2018)

ENTRE:
CUSTODIANTE / OPERADORA: {RAZAO_SOCIAL}, CNPJ: {CNPJ_EMPRESA}.
TITULAR DOS DADOS: {NOME_CLIENTE}, CPF: {CPF_CNPJ}.

O presente termo regula a recepção, custódia e tratamento de documentos cartorários e pessoais do TITULAR:

1. Finalidade Específica: Todos os documentos (RG, CPF, Certidões de Casamento/Nascimento, Escrituras, Contratos de Gaveta, Matrículas e IPTU) serão utilizados exclusivamente para instrução de processos de regularização imobiliária registral.
2. Segurança da Informação: Armazenamento em repositório criptografado com acesso restrito e logs de auditoria invioláveis.
3. Não Compartilhamento Comercial: É expressamente vedada a cessão, venda ou compartilhamento de dados com terceiros que não sejam os órgãos públicos e serventias extrajudiciais intervenientes.

{DATA_EXTENSO}.`
  }
];

// Helper to generate a realistic SHA-256 representation
export function generateSha256(content: string, salt: string = ''): string {
  let hash = 0;
  const str = content + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852${hex}`.substring(0, 64);
}

// Generate legal contract text based on template and dynamic variables
export function generateContractText(
  template: TipoContratoTemplate | string,
  client: Partial<Contact>,
  deal?: Partial<Deal>,
  appSettings?: Partial<AppSettings>,
  customValues?: {
    valor?: number;
    condicoes?: string;
    objeto?: string;
    prazoMeses?: number;
    foroComarca?: string;
  },
  modelosCustomizados?: ModeloContratoPadrao[]
): { titulo: string; conteudo: string } {
  const empresaNome = appSettings?.razao_social || 'Brasil Legal Soluções Imobiliárias e Registrais Ltda';
  const empresaCnpj = appSettings?.cnpj_empresa || '38.491.820/0001-55';
  const empresaEndereco = 'Av. Brigadeiro Faria Lima, 3477 - Itaim Bibi, São Paulo/SP - CEP 04538-133';
  
  const clienteNome = client.nome_completo || 'NOME DO CLIENTE / CONTRATANTE';
  const clienteCpfCnpj = client.cpf_cnpj || '000.000.000-00';
  const clienteTel = client.telefone_whatsapp || '(11) 99999-9999';
  const clienteEmail = client.email || 'cliente@email.com.br';
  const clienteEndereco = client.endereco 
    ? `${client.endereco.logradouro}, nº ${client.endereco.numero}${client.endereco.complemento ? ' - ' + client.endereco.complemento : ''}, ${client.endereco.bairro}, ${client.endereco.cidade}/${client.endereco.uf} - CEP ${client.endereco.cep}`
    : 'Endereço residencial completo do Contratante';

  const valorHonorarios = customValues?.valor ?? deal?.valor_honorarios_liquido ?? 18500;
  const valorFormatado = valorHonorarios.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const condicoesPagamento = customValues?.condicoes || 'Entrada de 30% na assinatura do contrato via Pix/Boleto e o saldo remanescente parcelado em até 10x mensais sucessivas.';
  const objetoImovel = customValues?.objeto || deal?.titulo || (client.tipo_imovel ? `Imóvel urbano do tipo ${client.tipo_imovel} situado na comarca do cliente.` : 'Imóvel para procedimento de regularização fundiária e titulação registral definitiva.');
  const prazoMeses = customValues?.prazoMeses || 6;
  const foroComarca = customValues?.foroComarca || (client.endereco?.cidade ? `Comarca de ${client.endereco.cidade}/${client.endereco.uf || 'SP'}` : 'Comarca de São Paulo/SP');
  const dataHoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // Verificar se há minuta padronizada correspondente
  const pool = modelosCustomizados && modelosCustomizados.length > 0 
    ? modelosCustomizados 
    : (typeof initialModelosContratosPadrao !== 'undefined' ? initialModelosContratosPadrao : []);
  
  const modeloEncontrado = pool.find(m => m.codigo === template || m.id === template);
  if (modeloEncontrado && modeloEncontrado.conteudo_minuta) {
    const mapaSubstituicao: Record<string, string> = {
      '{RAZAO_SOCIAL}': empresaNome,
      '{CNPJ_EMPRESA}': empresaCnpj,
      '{ENDERECO_EMPRESA}': empresaEndereco,
      '{NOME_CLIENTE}': clienteNome,
      '{CPF_CNPJ}': clienteCpfCnpj,
      '{TELEFONE_WHATSAPP}': clienteTel,
      '{EMAIL_CLIENTE}': clienteEmail,
      '{ENDERECO_CLIENTE}': clienteEndereco,
      '{OBJETO_IMOVEL}': objetoImovel,
      '{VALOR_HONORARIOS}': valorFormatado,
      '{CONDICOES_PAGAMENTO}': condicoesPagamento,
      '{PRAZO_MESES}': `${prazoMeses} (${prazoMeses === 1 ? 'um' : prazoMeses === 6 ? 'seis' : prazoMeses === 12 ? 'doze' : prazoMeses}) meses`,
      '{FORO_COMARCA}': foroComarca,
      '{DATA_EXTENSO}': `São Paulo/SP, ${dataHoje}`
    };

    return {
      titulo: modeloEncontrado.titulo,
      conteudo: substituirParametrosMinuta(modeloEncontrado.conteudo_minuta, mapaSubstituicao)
    };
  }

  if (template === 'PRESTACAO_SERVICOS_REURB') {
    return {
      titulo: 'Contrato de Prestação de Serviços de Regularização Imobiliária (REURB)',
      conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS TÉCNICOS E JURÍDICOS DE REGULARIZAÇÃO FUNDIÁRIA URBANA (REURB - LEI FEDERAL Nº 13.465/2017)

Pelo presente instrumento particular, de um lado:

CONTRATADA: ${empresaNome}, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº ${empresaCnpj}, com sede em ${empresaEndereco}, doravante denominada simplesmente CONTRATADA;

E de outro lado:

CONTRATANTE: ${clienteNome}, inscrito(a) no CPF/MF sob o nº ${clienteCpfCnpj}, contato WhatsApp ${clienteTel}, e-mail ${clienteEmail}, residente e domiciliado(a) em ${clienteEndereco}, doravante denominado(a) simplesmente CONTRATANTE.

Têm entre si, justo e contratado, o que mutuamente aceitam e outorgam mediante as seguintes cláusulas e condições:

CLÁUSULA PRIMEIRA – DO OBJETO
1.1. O presente instrumento tem por objeto a prestação de serviços técnicos de engenharia legal, topografia e assessoria jurídica especializada pela CONTRATADA visando à regularização fundiária urbana (REURB-S ou REURB-E, conforme aplicável) do imóvel individualizado a seguir:
"${objetoImovel}".

CLÁUSULA SEGUNDA – DAS ATRIBUIÇÕES DA CONTRATADA
2.1. Constituem obrigações da CONTRATADA:
a) Realização de levantamento topográfico planialtimétrico georreferenciado ao Sistema Geodésico Brasileiro (SIRGAS 2000);
b) Elaboração de memorial descritivo, planta de situação e Anotação de Responsabilidade Técnica (ART/RRT);
c) Coleta e auditoria de documentos probatórios da posse mansa, pacífica e ininterrupta;
d) Montagem do dossiê técnico e formalização do requerimento administrativo perante a Comissão Municipal de REURB e Prefeitura Competente;
e) Acompanhamento da expedição da Certidão de Regularização Fundiária (CRF) e respectivo registro junto ao Cartório de Registro de Imóveis (CRI) competente.

CLÁUSULA TERCEIRA – DAS OBRIGAÇÕES DO CONTRATANTE
3.1. O CONTRATANTE obriga-se a fornecer à CONTRATADA todos os títulos, recibos de compra e venda, carnês de IPTU, contas de concessionárias públicas de energia e água, e demais elementos necessários à comprovação da titularidade da posse.
3.2. Custear diretamente os emolumentos cartorários e taxas municipais caso não seja beneficiário de gratuidade pela modalidade REURB-S.

CLÁUSULA QUARTA – DO PREÇO E CONDIÇÕES DE PAGAMENTO
4.1. Pelos serviços contratados, o CONTRATANTE pagará à CONTRATADA o valor global e líquido de ${valorFormatado} (${valorHonorarios.toLocaleString('pt-BR')} reais).
4.2. Condições de liquidação acordadas: ${condicoesPagamento}.

CLÁUSULA QUINTA – DO PRAZO ESTIMADO
5.1. O prazo técnico estimado para montagem e protocolo do dossiê perante os órgãos competentes é de aproximadamente ${prazoMeses} (seis) meses, ressalvados prazos recursais e exigências de notas devolutivas emitidas pelo Ofício Registral.

CLÁUSULA SEXTA – DA VALIDADE JURÍDICA DA ASSINATURA ELETRÔNICA
6.1. As partes reconhecem expressamente a veracidade, validade, autenticidade e plena eficácia jurídica deste instrumento assinado por meio eletrônico, na forma da Medida Provisória nº 2.200-2/2001 e do art. 5º da Lei Federal nº 14.063/2020 (Assinatura Eletrônica Avançada), aceitando o registro de auditoria, geolocalização e carimbo de tempo como prova cabal de sua manifestação de vontade.

CLÁUSULA SÉTIMA – DA LGPD E PROTEÇÃO DE DADOS
7.1. A CONTRATADA compromete-se a tratar os dados pessoais e documentais do CONTRATANTE estritamente para a finalidade de execução deste contrato e do procedimento registral, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

CLÁUSULA OITAVA – DO FORO
8.1. Para dirimir quaisquer controvérsias oriundas do presente contrato, as partes elegem o foro da Comarca do imóvel ou da sede da Contratada, com renúncia expressa a qualquer outro.

E, por estarem justas e acordadas, as partes assinam eletronicamente o presente instrumento na presença das testemunhas virtuais abaixo indicadas.

São Paulo/SP, ${dataHoje}.`
    };
  }

  if (template === 'USUCAPIAO_EXTRAJUDICIAL') {
    return {
      titulo: 'Contrato de Honorários para Usucapião Extrajudicial (Prov. 65/CNJ)',
      conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS TÉCNICOS E ASSESSORIA JURÍDICA PARA PROCESSO DE USUCAPIÃO EXTRAJUDICIAL (ART. 216-A DA LEI 6.015/73 E PROVIMENTO Nº 65/CNJ)

CONTRATADA: ${empresaNome}, CNPJ: ${empresaCnpj}, com sede em ${empresaEndereco}.
CONTRATANTE: ${clienteNome}, CPF: ${clienteCpfCnpj}, WhatsApp: ${clienteTel}, e-mail: ${clienteEmail}, domiciliado(a) em ${clienteEndereco}.

As partes identificadas celebram o presente contrato para prestação de assessoria técnico-jurídica notarial e registral:

CLÁUSULA PRIMEIRA – DO OBJETO
1.1. O presente contrato tem por escopo a condução do procedimento de USUCAPIÃO EXTRAJUDICIAL perante o Tabelionato de Notas e o Oficial de Registro de Imóveis competente, objetivando a aquisição originária da propriedade do imóvel:
"${objetoImovel}".

CLÁUSULA SEGUNDA – DOS SERVIÇOS INCLUSOS
2.1. A CONTRATADA executará:
a) Análise e saneamento da cadeia possessória ininterrupta com ânimo de dono (animus domini);
b) Levantamento topográfico pericial com memorial descritivo assinado por profissional habilitado com ART/RRT;
c) Lavratura de Ata Notarial de Constatação de Posse perante o Tabelião de Notas;
d) Obtenção das certidões vintenárias e negativas de distribuidores cíveis e federais;
e) Notificação dos confrontantes e das Fazendas Públicas (União, Estado e Município);
f) Protocolo do pedido e atendimento a eventuais notas de exigência registrais.

CLÁUSULA TERCEIRA – DOS HONORÁRIOS
3.1. Pelos serviços ajustados, o CONTRATANTE pagará os honorários contratuais de ${valorFormatado}.
3.2. Forma de pagamento: ${condicoesPagamento}.

CLÁUSULA QUARTA – ASSINATURA ELETRÔNICA E VALIDADE
4.1. Este contrato é celebrado e firmado eletronicamente com garantia de integridade probatória pelo hash SHA-256 e logs auditados, nos termos da Lei 14.063/2020 e Provimento CNJ correspondente.

São Paulo/SP, ${dataHoje}.`
    };
  }

  if (template === 'PROCURACAO_AD_NEGOTIA') {
    return {
      titulo: 'Procuração Notarial e Registral Ad Negotia',
      conteudo: `PROCURAÇÃO NOTARIAL E REGISTRAL "AD NEGOTIA ET EXTRAJUDICIA"

OUTORGANTE: ${clienteNome}, inscrito(a) no CPF sob nº ${clienteCpfCnpj}, residente em ${clienteEndereco}.

OUTORGADOS: ${empresaNome}, inscrita no CNPJ sob o nº ${empresaCnpj}, com sede em ${empresaEndereco}, e seus advogados e engenheiros credenciados.

PODERES:
Pelo presente instrumento particular, o(a) OUTORGANTE nomeia e constitui os OUTORGADOS seus bastantes procuradores, conferindo-lhes amplos poderes para representar o(a) Outorgante perante quaisquer Cartórios de Registro de Imóveis, Tabelionatos de Notas, Prefeituras Municipais, Secretarias de Habitação e Urbanismo, INCRA e órgãos ambientais competentes.
Especialmente para: requerer e acompanhar procedimentos de Regularização Fundiária Urbana (REURB), Usucapião Extrajudicial, Retificação Administrativa de Área, Desdobro, Unificação e Averbações, requerer certidões, assinar termos de anuência e declarações de confrontação, juntar e desentranhar documentos técnicos, plantas, memoriais descritivos e ART/RRT, prestar esclarecimentos e satisfazer notas de devolução registrais, praticando todos os atos necessários ao fiel e integral cumprimento deste mandato.

Validade: Por prazo determinado de 24 (vinte e quatro) meses a contar da data de sua assinatura digital.

Autenticação Digital: Validação garantida por assinatura eletrônica avançada com carimbo de tempo inviolável (MP 2.200-2/2001).

São Paulo/SP, ${dataHoje}.`
    };
  }

  if (template === 'DECLARACAO_POSSE_MANSA') {
    return {
      titulo: 'Declaração de Posse Mansa, Pacífica e Justo Título',
      conteudo: `DECLARAÇÃO UNILATERAL DE POSSE MANSA, PACÍFICA E JUSTO TÍTULO COM DECLARAÇÃO DE CONFRONTANTES

Eu, ${clienteNome}, portador(a) do CPF nº ${clienteCpfCnpj}, declaro para os devidos fins de direito, sob as penas da Lei (art. 299 do Código Penal), que exerço a posse mansa, pacífica, contínua e incontestada, com ânimo de dono (animus domini), há mais de 10 (dez) anos, sobre o imóvel localizado em:
"${objetoImovel}".

Declaro ainda:
1. Que sobre a referida área nunca existiu litígio, oposição judicial ou contestação de terceiros ou herdeiros;
2. Que resido e/ou realizo melhorias, obras de manutenção, conservação e pagamento dos tributos que incidem sobre o bem;
3. Que todas as informações e documentos por mim apresentados à CONTRATADA são verídicos e autênticos.

Declaração firmada eletronicamente nos moldes da Lei Federal nº 14.063/2020.

São Paulo/SP, ${dataHoje}.`
    };
  }

  // TERMO_CONFIDENCIALIDADE_LGPD
  return {
    titulo: 'Termo de Custódia Documental e Proteção de Dados (LGPD)',
    conteudo: `TERMO DE CUSTÓDIA DOCUMENTAL, TRATAMENTO DE DADOS PESSOAIS E SIGILO PROFISSIONAL (LGPD - LEI Nº 13.709/2018)

ENTRE:
CUSTODIANTE / OPERADORA: ${empresaNome}, CNPJ: ${empresaCnpj}.
TITULAR DOS DADOS: ${clienteNome}, CPF: ${clienteCpfCnpj}.

O presente termo regula a recepção, custódia e tratamento de documentos cartorários e pessoais do TITULAR:

1. Finalidade Específica: Todos os documentos (RG, CPF, Certidões de Casamento/Nascimento, Escrituras, Contratos de Gaveta, Matrículas e IPTU) serão utilizados exclusivamente para instrução de processos de regularização imobiliária registral.
2. Segurança da Informação: Armazenamento em repositório criptografado com acesso restrito e logs de auditoria invioláveis.
3. Não Compartilhamento Comercial: É expressamente vedada a cessão, venda ou compartilhamento de dados com terceiros que não sejam os órgãos públicos e serventias extrajudiciais intervenientes.

São Paulo/SP, ${dataHoje}.`
  };
}

// Initial mock contracts for demonstration
export const initialContratosAssinatura: ContratoAssinatura[] = [
  {
    id: 'CTR-2026-081',
    titulo: 'Contrato de Prestação de Serviços de Regularização Imobiliária (REURB)',
    template_tipo: 'PRESTACAO_SERVICOS_REURB',
    contact_id: 'ct-101',
    contact_nome: 'Carlos Eduardo Silveira',
    contact_cpf_cnpj: '189.442.908-11',
    contact_email: 'carlos.silveira@gmail.com',
    contact_telefone: '(11) 98741-2099',
    deal_id: 'deal-01',
    deal_titulo: 'Regularização REURB-E — Residencial Jardim das Flores',
    status: 'Concluído',
    data_criacao: '2026-08-20T14:30:00Z',
    data_conclusao: '2026-08-21T10:15:22Z',
    data_expiracao: '2026-09-20T23:59:59Z',
    valor_contrato: 18500,
    condicoes_pagamento: 'Entrada de R$ 5.550,00 via Pix e 10 parcelas de R$ 1.295,00 via boleto bancário.',
    objeto_imovel: 'Lote 14, Quadra B do loteamento desmembrado em Campinas/SP, com área total de 360m².',
    conteudo_contrato: generateContractText('PRESTACAO_SERVICOS_REURB', {
      nome_completo: 'Carlos Eduardo Silveira',
      cpf_cnpj: '189.442.908-11',
      telefone_whatsapp: '(11) 98741-2099',
      email: 'carlos.silveira@gmail.com',
      endereco: {
        logradouro: 'Rua das Camélias',
        numero: '340',
        bairro: 'Jardim das Flores',
        cidade: 'Campinas',
        uf: 'SP',
        cep: '13087-000'
      }
    }, {
      titulo: 'Regularização REURB-E — Residencial Jardim das Flores',
      valor_honorarios_liquido: 18500
    }).conteudo,
    hash_sha256_original: 'a8f5b169a53d9e48c0812739812731823901bcae412093849102839410293841',
    hash_sha256_assinado: '74c2e64812f8194ad5174092182049182390abef402938410293841029384192',
    token_verificacao: 'BL-SIGN-849201-VALID',
    link_assinatura_publico: 'https://brasillegalimoveis.com.br/assinar/sec_c8f1029a8d',
    provedor_assinatura: 'Brasil Legal e-Sign',
    signatarios: [
      {
        id: 'sig-01',
        nome: 'Carlos Eduardo Silveira',
        email: 'carlos.silveira@gmail.com',
        telefone_whatsapp: '(11) 98741-2099',
        cpf: '189.442.908-11',
        papel: 'Contratante',
        status: 'Assinado',
        data_assinatura: '2026-08-20T17:42:10Z',
        metodo_assinatura: 'Assinatura Eletrônica Avançada',
        ip_origem: '177.136.241.88',
        geolocalizacao: 'Campinas, SP - Brasil',
        dispositivo_user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Mobile/15E148 Safari/604.1',
        hash_autenticacao: 'c8f1029a-8491-4c12-9842-182903841901',
        codigo_otp_validado: true
      },
      {
        id: 'sig-02',
        nome: 'Dr. Roberto Carneiro — Diretor Jurídico',
        email: 'diretoria@brasillegalimoveis.com.br',
        telefone_whatsapp: '(11) 98765-4321',
        cpf: '042.819.330-91',
        papel: 'Contratada',
        status: 'Assinado',
        data_assinatura: '2026-08-21T10:15:22Z',
        metodo_assinatura: 'Certificado Digital Token/Hash',
        ip_origem: '187.54.12.9',
        geolocalizacao: 'São Paulo, SP - Brasil',
        dispositivo_user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/128.0.0.0',
        hash_autenticacao: '91823901-bcae-4120-9384-910283941029',
        codigo_otp_validado: true
      },
      {
        id: 'sig-03',
        nome: 'Fernanda Lima (Testemunha 1)',
        email: 'fernanda.lima@brasillegalimoveis.com.br',
        telefone_whatsapp: '(11) 99112-4455',
        cpf: '320.198.441-20',
        papel: 'Testemunha 1',
        status: 'Assinado',
        data_assinatura: '2026-08-21T10:18:05Z',
        metodo_assinatura: 'Desenho em Tela',
        ip_origem: '187.54.12.9',
        geolocalizacao: 'São Paulo, SP - Brasil',
        dispositivo_user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        hash_autenticacao: 'test-1-sig-849182049182',
        codigo_otp_validado: true
      }
    ],
    audit_trail: [
      {
        id: 'aud-001',
        data_hora: '2026-08-20T14:30:00Z',
        evento: 'Envelope de Assinatura Criado',
        autor: 'SDR / Atendimento Comercial',
        ip: '187.54.12.9',
        geolocalizacao: 'São Paulo, SP',
        dispositivo: 'Web App Desktop — Chrome 128',
        detalhes: 'Contrato gerado automaticamente a partir dos dados do Lead ct-101 e Deal deal-01.',
        hash_integridade: 'a8f5b169a53d9e48c0812739812731823901bcae412093849102839410293841'
      },
      {
        id: 'aud-002',
        data_hora: '2026-08-20T14:31:12Z',
        evento: 'Disparo de Notificação Multicanal',
        autor: 'Sistema Brasil Legal Sign Bot',
        ip: '10.0.0.12 (Servidor Interno)',
        geolocalizacao: 'São Paulo, SP',
        dispositivo: 'API Gateway / Webhook',
        detalhes: 'Mensagem enviada com link criptografado para o WhatsApp (+55 11 98741-2099) e e-mail (carlos.silveira@gmail.com).'
      },
      {
        id: 'aud-003',
        data_hora: '2026-08-20T17:38:40Z',
        evento: 'Documento Aberto e Visualizado',
        autor: 'Carlos Eduardo Silveira',
        ip: '177.136.241.88',
        geolocalizacao: 'Campinas, SP',
        dispositivo: 'iPhone iOS 17.5 / Mobile Safari',
        detalhes: 'O signatário abriu a visualização completa do contrato e das 8 cláusulas.'
      },
      {
        id: 'aud-004',
        data_hora: '2026-08-20T17:40:02Z',
        evento: 'Autenticação por OTP Confirmada',
        autor: 'Carlos Eduardo Silveira',
        ip: '177.136.241.88',
        geolocalizacao: 'Campinas, SP',
        dispositivo: 'iPhone iOS 17.5 / Mobile Safari',
        detalhes: 'Código de 6 dígitos enviado ao WhatsApp validado com sucesso (Token #984210).'
      },
      {
        id: 'aud-005',
        data_hora: '2026-08-20T17:42:10Z',
        evento: 'Assinatura Registrada — Contratante',
        autor: 'Carlos Eduardo Silveira',
        ip: '177.136.241.88',
        geolocalizacao: 'Campinas, SP (Latitude: -22.9056, Longitude: -47.0608)',
        dispositivo: 'iPhone iOS 17.5 / Mobile Safari',
        detalhes: 'Assinatura digitalizada manuscrita capturada em tela com coordenadas de pressão e carimbo temporal UTC.',
        hash_integridade: 'c8f1029a84914c129842182903841901'
      },
      {
        id: 'aud-006',
        data_hora: '2026-08-21T10:15:22Z',
        evento: 'Assinatura Registrada — Contratada',
        autor: 'Dr. Roberto Carneiro',
        ip: '187.54.12.9',
        geolocalizacao: 'São Paulo, SP',
        dispositivo: 'Desktop macOS / Chrome 128',
        detalhes: 'Assinatura eletrônica institucional com token e senha de diretoria validada.'
      },
      {
        id: 'aud-007',
        data_hora: '2026-08-21T10:18:05Z',
        evento: 'Assinatura Registrada — Testemunha',
        autor: 'Fernanda Lima',
        ip: '187.54.12.9',
        geolocalizacao: 'São Paulo, SP',
        dispositivo: 'Windows PC / Chrome 128',
        detalhes: 'Testemunha qualificada com CPF 320.198.441-20 validada.'
      },
      {
        id: 'aud-008',
        data_hora: '2026-08-21T10:18:06Z',
        evento: 'Envelope Concluído & Dossiê Criptográfico Selado',
        autor: 'Motor de Integridade Brasil Legal',
        ip: '10.0.0.12 (Servidor)',
        geolocalizacao: 'São Paulo, SP',
        dispositivo: 'Security Node ICP-Brasil Compliance',
        detalhes: 'Documento final lacrado com hash inviolável SHA-256 (74c2e64812f8194ad5174092182049182390abef402938410293841029384192) e validade jurídica plena nos termos da MP 2.200-2/2001 e Lei 14.063/2020.',
        hash_integridade: '74c2e64812f8194ad5174092182049182390abef402938410293841029384192'
      }
    ],
    metadados_juridicos: {
      base_legal: 'Lei Federal nº 14.063/2020 e Medida Provisória nº 2.200-2/2001',
      carimbo_tempo: '2026-08-21T10:18:06.120Z — Observatório Nacional / ACT',
      certificado_id: 'CERT-ICP-BR-2026-99410'
    }
  },
  {
    id: 'CTR-2026-082',
    titulo: 'Contrato de Honorários para Usucapião Extrajudicial (Prov. 65/CNJ)',
    template_tipo: 'USUCAPIAO_EXTRAJUDICIAL',
    contact_id: 'ct-104',
    contact_nome: 'Helena Beatriz Prado',
    contact_cpf_cnpj: '342.118.990-21',
    contact_email: 'helena.prado@outlook.com',
    contact_telefone: '(19) 99881-3311',
    deal_id: 'deal-03',
    deal_titulo: 'Usucapião Extrajudicial — Chácara Sorocaba',
    status: 'Aguardando Assinaturas',
    data_criacao: '2026-09-02T11:00:00Z',
    data_expiracao: '2026-10-02T23:59:59Z',
    valor_contrato: 32000,
    condicoes_pagamento: 'R$ 8.000,00 de entrada e 12 parcelas mensais de R$ 2.000,00.',
    objeto_imovel: 'Área rural de 5.200 m² localizada no Bairro Brigadeiro Tobias, Sorocaba/SP.',
    conteudo_contrato: generateContractText('USUCAPIAO_EXTRAJUDICIAL', {
      nome_completo: 'Helena Beatriz Prado',
      cpf_cnpj: '342.118.990-21',
      telefone_whatsapp: '(19) 99881-3311',
      email: 'helena.prado@outlook.com',
      endereco: {
        logradouro: 'Rua General Osório',
        numero: '920',
        bairro: 'Centro',
        cidade: 'Sorocaba',
        uf: 'SP',
        cep: '18010-120'
      }
    }, {
      titulo: 'Usucapião Extrajudicial — Chácara Sorocaba',
      valor_honorarios_liquido: 32000
    }).conteudo,
    hash_sha256_original: 'bf91029410293810293849102839410293841029384102938410293841029384',
    token_verificacao: 'BL-SIGN-910283-PEND',
    link_assinatura_publico: 'https://brasillegalimoveis.com.br/assinar/sec_bf910294',
    provedor_assinatura: 'Brasil Legal e-Sign',
    signatarios: [
      {
        id: 'sig-04',
        nome: 'Helena Beatriz Prado',
        email: 'helena.prado@outlook.com',
        telefone_whatsapp: '(19) 99881-3311',
        cpf: '342.118.990-21',
        papel: 'Contratante',
        status: 'Pendente'
      },
      {
        id: 'sig-05',
        nome: 'Dr. Roberto Carneiro — Diretor Jurídico',
        email: 'diretoria@brasillegalimoveis.com.br',
        telefone_whatsapp: '(11) 98765-4321',
        cpf: '042.819.330-91',
        papel: 'Contratada',
        status: 'Pendente'
      }
    ],
    audit_trail: [
      {
        id: 'aud-010',
        data_hora: '2026-09-02T11:00:00Z',
        evento: 'Envelope de Assinatura Criado',
        autor: 'Coord. Jurídico & Engenheiro Legal',
        ip: '187.54.12.9',
        geolocalizacao: 'São Paulo, SP',
        dispositivo: 'Web App Desktop — Chrome 128',
        detalhes: 'Minuta gerada com base no Provimento 65/CNJ e Lei 6.015/73.',
        hash_integridade: 'bf91029410293810293849102839410293841029384102938410293841029384'
      },
      {
        id: 'aud-011',
        data_hora: '2026-09-02T11:01:05Z',
        evento: 'Link de Assinatura Enviado por WhatsApp',
        autor: 'Sistema Brasil Legal Sign Bot',
        ip: '10.0.0.12',
        geolocalizacao: 'São Paulo, SP',
        dispositivo: 'API WhatsApp Business',
        detalhes: 'Mensagem com link criptografado entregue ao número (19) 99881-3311.'
      }
    ],
    metadados_juridicos: {
      base_legal: 'Lei Federal nº 14.063/2020 e Provimento nº 65/CNJ',
      carimbo_tempo: '2026-09-02T11:00:00.000Z',
      certificado_id: 'CERT-ICP-BR-2026-10294'
    }
  },
  {
    id: 'CTR-2026-083',
    titulo: 'Procuração Notarial e Registral Ad Negotia',
    template_tipo: 'PROCURACAO_AD_NEGOTIA',
    contact_id: 'ct-102',
    contact_nome: 'Mariana Albuquerque',
    contact_cpf_cnpj: '219.004.811-92',
    contact_email: 'mariana.albuquerque@gmail.com',
    contact_telefone: '(11) 97722-1088',
    deal_id: 'deal-02',
    deal_titulo: 'Retificação de Registro & Desdobro Gleba Berrini Sul',
    status: 'Assinado Parcialmente',
    data_criacao: '2026-09-03T16:00:00Z',
    data_expiracao: '2026-10-03T23:59:59Z',
    valor_contrato: 0,
    objeto_imovel: 'Gleba de 12.000m² com matrícula individualizada junto ao 14º CRI de São Paulo.',
    conteudo_contrato: generateContractText('PROCURACAO_AD_NEGOTIA', {
      nome_completo: 'Mariana Albuquerque',
      cpf_cnpj: '219.004.811-92',
      telefone_whatsapp: '(11) 97722-1088',
      email: 'mariana.albuquerque@gmail.com',
      endereco: {
        logradouro: 'Avenida Engenheiro Luís Carlos Berrini',
        numero: '1200',
        complemento: 'Conjunto 81',
        bairro: 'Brooklin',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '04571-010'
      }
    }, {
      titulo: 'Retificação de Registro & Desdobro Gleba Berrini Sul'
    }).conteudo,
    hash_sha256_original: 'c910283941029384102938410293841029384102938410293841029384102938',
    token_verificacao: 'BL-SIGN-771920-PART',
    link_assinatura_publico: 'https://brasillegalimoveis.com.br/assinar/sec_c9102839',
    provedor_assinatura: 'Brasil Legal e-Sign',
    signatarios: [
      {
        id: 'sig-06',
        nome: 'Mariana Albuquerque',
        email: 'mariana.albuquerque@gmail.com',
        telefone_whatsapp: '(11) 97722-1088',
        cpf: '219.004.811-92',
        papel: 'Contratante',
        status: 'Assinado',
        data_assinatura: '2026-09-03T18:20:15Z',
        metodo_assinatura: 'Assinatura Eletrônica Avançada',
        ip_origem: '189.120.44.12',
        geolocalizacao: 'São Paulo, SP',
        dispositivo_user_agent: 'Safari / iPad OS 17',
        hash_autenticacao: 'mariana-proc-sig-99120',
        codigo_otp_validado: true
      },
      {
        id: 'sig-07',
        nome: 'Dr. Roberto Carneiro — Diretor Jurídico',
        email: 'diretoria@brasillegalimoveis.com.br',
        telefone_whatsapp: '(11) 98765-4321',
        cpf: '042.819.330-91',
        papel: 'Contratada',
        status: 'Pendente'
      }
    ],
    audit_trail: [
      {
        id: 'aud-020',
        data_hora: '2026-09-03T16:00:00Z',
        evento: 'Envelope de Procuração Criado',
        autor: 'SDR / Atendimento Comercial',
        ip: '187.54.12.9',
        geolocalizacao: 'São Paulo, SP',
        dispositivo: 'Web App Desktop',
        detalhes: 'Procuração Notarial Ad Negotia para representação junto ao 14º CRI.'
      },
      {
        id: 'aud-021',
        data_hora: '2026-09-03T18:20:15Z',
        evento: 'Assinatura Registrada — Outorgante',
        autor: 'Mariana Albuquerque',
        ip: '189.120.44.12',
        geolocalizacao: 'São Paulo, SP',
        dispositivo: 'iPadOS Safari',
        detalhes: 'Assinatura realizada após validação de token e biometria facial.'
      }
    ],
    metadados_juridicos: {
      base_legal: 'Lei Federal nº 14.063/2020 e Código Civil Brasileiro Art. 653 e seguintes',
      carimbo_tempo: '2026-09-03T16:00:00.000Z',
      certificado_id: 'CERT-ICP-BR-2026-33910'
    }
  }
];

export const initialConfigAssinatura: ConfigAssinaturaEletronica = {
  provedor_ativo: 'Brasil Legal e-Sign',
  ambiente: 'sandbox',
  api_key: 'bl_sec_key_live_99418290381920',
  webhook_url: 'https://brasillegalimoveis.com.br/api/webhooks/assinatura-digital',
  notificar_whatsapp_auto: true,
  notificar_email_auto: true,
  exigir_otp_sms_whatsapp: true,
  validade_padrao_dias: 30
};
