import { 
  Contact, 
  Documento, 
  Deal, 
  SiteSettings, 
  Usuario, 
  AppSettings, 
  RoleConfig, 
  Property, 
  FinancialRecord, 
  ReferralProgramSettings, 
  CobrancaBoleto, 
  FintechConfig,
  ParceiroB2B,
  ServicoCatalogo,
  ConversaWhatsApp,
  InstanciaWhatsAppConfig,
  OmnichannelConfig,
  ConfigSplitBancario,
  RegistroSplitExecutado,
  ConfigIntegracaoGithubCpanel,
  Atividade,
  FluxoEmailMarketing,
  EnvioEmailLog,
  ConfigEmailMarketing
} from './types';

export const initialAppSettings: AppSettings = {
  app_name: 'Brasil Legal',
  app_tagline: 'Plataforma Integrada de Regularização Imobiliária & Gestão de Ativos',
  razao_social: 'Brasil Legal Soluções Imobiliárias e Registrais Ltda',
  cnpj_empresa: '00.000.000/0001-00',
  endereco_empresa: 'Caieiras, São Paulo - SP',
  logo_header_url: '/assets/logo-brasil-legal-oficial.png',
  logo_light_url: '/assets/logo-brasil-legal-oficial.png',
  logo_dark_url: '/assets/logo-brasil-legal-dark.svg',
  logo_icon_url: '/assets/logo-icon-brasil-legal.svg',
  logo_sidebar_url: '/assets/logo-brasil-legal-oficial.png',
  logo_login_url: '/assets/logo-brasil-legal-oficial.png',
  favicon_url: '/assets/logo-icon-brasil-legal.svg',
  cor_primaria: '#2E3192', // Azul Profundo
  cor_secundaria: '#F2EC00', // Amarelo Ouro
  cor_destaque: '#1C1E63',
  cor_fundo_painel: '#F8FAFC',
  cor_texto_principal: '#0F172A',
  whatsapp_suporte: '+55 11 99864-2424',
  email_suporte: 'atendimento@brasillegal.com.br',
  sla_meta_minutos: 4,
  css_customizado_saas: `/* White-Label SaaS Custom Rules */
:root {
  --primary-saas: #2E3192;
  --secondary-saas: #F2EC00;
}
.saas-brand-border {
  border-color: #2E3192;
}`
};

export const initialRoleConfigs: RoleConfig[] = [
  {
    role: 'ADMIN',
    nome_exibicao: 'Administrador / Diretor Geral',
    descricao: 'Acesso irrestrito ao sistema, homologação financeira, gestão de usuários, white-label e CMS.',
    permissions_json: [
      'contacts:create',
      'contacts:read',
      'contacts:edit',
      'documents:upload',
      'documents:validate',
      'deals:create',
      'deals:view',
      'deals:homologate',
      'finance:payout',
      'b2b:view_all',
      'ai:execute',
      'cms:edit',
      'whitelabel:manage',
      'users:manage',
      'signatures:manage'
    ]
  },
  {
    role: 'TECNICO',
    nome_exibicao: 'Coord. Jurídico & Engenheiro Legal',
    descricao: 'Análise de títulos, custódia e validação documental de acordo com o Prov. 65/CNJ e emissão de pareceres.',
    permissions_json: [
      'contacts:read',
      'documents:upload',
      'documents:validate',
      'deals:create',
      'deals:view',
      'ai:execute',
      'signatures:manage'
    ]
  },
  {
    role: 'SDR',
    nome_exibicao: 'SDR / Atendimento Comercial & Triagem',
    descricao: 'Atendimento prioritário de leads (SLA < 4min), cadastro com CEP, upload de documentos na qualificação.',
    permissions_json: [
      'contacts:create',
      'contacts:read',
      'contacts:edit',
      'documents:upload',
      'deals:create',
      'deals:view',
      'ai:execute',
      'signatures:manage'
    ]
  },
  {
    role: 'PARCEIRO_B2B',
    nome_exibicao: 'Parceiro B2B (Indique e Ganhe)',
    descricao: 'Painel restrito para indicação de clientes e acompanhamento de comissões de até 5% sobre honorários líquidos.',
    permissions_json: [
      'contacts:create',
      'b2b:view_own'
    ]
  }
];

export const mockUsers: Usuario[] = [
  {
    id: 'usr-admin-1',
    nome: 'Emerson Carneiro',
    cargo: 'Diretor Comercial e Mkt',
    role: 'ADMIN',
    email: 'atendimento@brasillegal.com.br',
    senha: 'brasillegal2026',
    foto_url: '/team/emerson-carneiro.jpg',
    oab_crea: 'Diretoria Comercial & Marketing',
    endereco: {
      cep: '07700-000',
      logradouro: 'Rua das Palmeiras',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Caieiras',
      uf: 'SP'
    }
  },
  {
    id: 'usr-fin-1',
    nome: 'Talita Hernandez',
    cargo: 'Diretora Financeira',
    role: 'FINANCEIRO',
    email: 'financeiro@brasillegal.com.br',
    senha: 'brasillegal2026',
    foto_url: '/team/talita-hernandez.jpg',
    oab_crea: 'Controladoria & Finanças',
    endereco: {
      cep: '07700-000',
      logradouro: 'Rua das Palmeiras',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Caieiras',
      uf: 'SP'
    }
  },
  {
    id: 'usr-op-1',
    nome: 'Elisangela da Cruz',
    cargo: 'Diretora de Operações e Compliance',
    role: 'TECNICO',
    email: 'operacoes@brasillegal.com.br',
    senha: 'brasillegal2026',
    foto_url: '/team/elisangela-cruz.jpg',
    oab_crea: 'Governança & Processos',
    endereco: {
      cep: '07700-000',
      logradouro: 'Rua das Palmeiras',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Caieiras',
      uf: 'SP'
    }
  },
  {
    id: 'usr-jur-1',
    nome: 'Dr. Rafael Barbosa',
    cargo: 'Diretor Jurídico',
    role: 'TECNICO',
    email: 'juridico@brasillegal.com.br',
    senha: 'brasillegal2026',
    foto_url: '/team/dr-rafael-barbosa.jpg',
    oab_crea: 'OAB/SP 345.120',
    endereco: {
      cep: '07700-000',
      logradouro: 'Rua das Palmeiras',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Caieiras',
      uf: 'SP'
    }
  },
  {
    id: 'usr-b2b-1',
    nome: 'Carlos Mendes Imóveis',
    cargo: 'Parceiro B2B (Indique e Ganhe)',
    role: 'PARCEIRO_B2B',
    email: 'carlos.corretor@mendesimoveis.com.br',
    senha: 'brasillegal2026',
    foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    parceiro_id: 'PARC-B2B-88'
  }
];

export const initialSiteSettings: SiteSettings = {
  titulo_site: 'Brasil Legal — Regularização Imobiliária & Gestão de Ativos',
  subtitulo_site: 'Engenharia legal, advocacia registral e saneamento fundiário ágil para proprietários, incorporadores e prefeituras.',
  logo_principal_url: '/assets/logo-brasil-legal-oficial.png',
  logo_footer_url: '/assets/logo-brasil-legal-dark.svg',
  css_customizado: `/* CSS Injetado do Módulo CMS Brasil Legal */
.brasil-legal-brand-badge {
  box-shadow: 0 4px 20px -2px rgba(46, 49, 146, 0.25);
  border-left: 4px solid #F2EC00;
}
.hero-gradient-overlay {
  background: linear-gradient(135deg, rgba(46, 49, 146, 0.96) 0%, rgba(28, 30, 99, 0.98) 100%);
}`,
  paleta_cores: {
    primaria: '#2E3192',
    secundaria: '#F2EC00',
    fundo: '#FFFFFF'
  },
  secao_hero_titulo: 'Seu imóvel 100% legalizado com escrituração direto no cartório',
  secao_hero_subtitulo: 'Descubra o que está impedindo seu imóvel de estar regularizado, valorizado e pronto para vender, financiar ou transferir.',
  banner_hero_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
  video_url: 'https://youtu.be/9uRifSbfweA?si=0UzSL42AuAF3IaGS',
  video_titulo: 'Como funciona a regularização extrajudicial em cartório',
  video_subtitulo: 'Entenda em 2 minutos como a Lei 13.465/17 e o Provimento 65 do CNJ permitem obter sua escritura registrada sem precisar ingressar com ação demorada na Justiça.',
  video_poster_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  banner_alerta_titulo: 'Cuidado: imóvel sem escritura definitiva perde até 50% do valor de mercado',
  banner_alerta_subtitulo: 'Imóveis irregulares não aceitam financiamento bancário pela Caixa, Bradesco ou Itaú, correm risco de penhora por dívidas de antigos donos e geram inventários litigiosos caros.',
  quem_somos_exibir: true,
  quem_somos_titulo: 'Autoridade técnica em advocacia registral e engenharia fundiária',
  quem_somos_subtitulo: 'Conheça o corpo jurídico e engenheiros especialistas da Brasil Legal',
  equipe_titulo: 'Conheça os especialistas que cuidam do seu imóvel',
  equipe_subtitulo: 'Advogados pós-graduados em direito notarial e engenheiros agrimensores credenciados pelo INCRA.',
  responsavel_tecnico: 'Corpo Técnico Especializado • Engenharia Legal & Direito Registral • Membro do IRIB',
  quem_somos_descricao: 'A Brasil Legal nasceu da integração de advogados especialistas em Direito Notarial e Registral e engenheiros agrimensores credenciados pelo INCRA e CREA. Operamos uma infraestrutura de ponta com drones de aerofotogrametria, receptores GNSS RTK milimétricos e inteligência artificial para auditoria imediata de matrículas, garantindo tramitação ágil e segura perante Cartórios de Registro de Imóveis e Prefeituras em todo o território nacional.',
  quem_somos_imagem_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
  autoridade_nome: 'Emerson Carneiro',
  autoridade_cargo: 'Mais de duas décadas de experiência no mercado imobiliário',
  autoridade_experiencia: 'Mais de 20 anos no mercado imobiliário',
  autoridade_bio: 'A Brasil Legal nasceu da experiência prática do mercado imobiliário e da necessidade de transformar processos complexos de regularização em caminhos mais claros, organizados e seguros para o proprietário.',
  autoridade_foto_url: '/team/emerson-carneiro.jpg',
  autoridade_credenciais: [
    'Mais de 20 anos de experiência prática no mercado imobiliário',
    'Especialista em Gestão e Estratégia de Regularização Integrada',
    'Coordenação de equipes multidisciplinares de engenharia e direito registral',
    'Foco em saneamento documental, segurança jurídica e valorização patrimonial'
  ],
  equipe_membros: [
    {
      id: 'eq-1',
      nome: 'Emerson Carneiro',
      cargo: 'Diretor Comercial e Mkt',
      oab_crea: 'Gestão Comercial & Expansão',
      foto_url: '/team/emerson-carneiro.jpg',
      bio: 'Diretor Comercial e de Marketing. Especialista em estratégias de mercado imobiliário, inteligência de negócios, parcerias B2B com corretores e aceleração de saneamento patrimonial.',
      email: 'comercial@brasillegal.com.br',
      linkedin: 'https://linkedin.com',
      destaque: true
    },
    {
      id: 'eq-2',
      nome: 'Talita Hernandez',
      cargo: 'Diretora Financeira',
      oab_crea: 'Controladoria & Finanças',
      foto_url: '/team/talita-hernandez.jpg',
      bio: 'Diretora Financeira. Responsável pela controladoria estratégica, planejamento orçamentário, viabilidade econômico-tributária de incorporações e gestão financeira da Brasil Legal.',
      email: 'financeiro@brasillegal.com.br',
      linkedin: 'https://linkedin.com',
      destaque: true
    },
    {
      id: 'eq-3',
      nome: 'Elisangela da Cruz',
      cargo: 'Diretora de Operações e Compliance',
      oab_crea: 'Governança & Processos',
      foto_url: '/team/elisangela-cruz.jpg',
      bio: 'Diretora de Operações e Compliance. Responsável pela governança dos fluxos registrais e cartorários, conformidade regulatória, garantia de prazos e excelência no atendimento ao cliente.',
      email: 'operacoes@brasillegal.com.br',
      linkedin: 'https://linkedin.com',
      destaque: true
    },
    {
      id: 'eq-4',
      nome: 'Dr. Rafael Barbosa',
      cargo: 'Diretor Jurídico',
      oab_crea: 'Direito Notarial & Registral',
      foto_url: '/team/dr-rafael-barbosa.jpg',
      bio: 'Diretor Jurídico. Especialista em Direito Notarial e Registral, com vasta vivência prática em rotinas de Cartórios de Registro de Imóveis, Usucapião Extrajudicial, REURB e Incorporações.',
      email: 'juridico@brasillegal.com.br',
      linkedin: 'https://linkedin.com',
      destaque: true
    }
  ],
  whatsapp_vendas: '+55 11 99864-2424',
  depoimentos: [
    {
      id: 'dep-1',
      nome: 'Marcelo Augusto de Oliveira',
      cidade_uf: 'Campinas / SP',
      tipo_imovel: 'Casa Residencial (Posse mansa 18 anos)',
      texto: 'Comprei com contrato de gaveta em 2005. Todos os advogados que procurei diziam que demoraria 7 anos na Justiça. A equipe da Brasil Legal fez todo o processo de Usucapião Extrajudicial no cartório e em 5 meses eu estava com a matrícula em mãos! Meu imóvel valorizou mais de 45%.',
      estrelas: 5,
      foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      valorizacao: '+48% Valorização',
      prazo_meses: 5
    },
    {
      id: 'dep-2',
      nome: 'Dra. Helena Valente & Irmãos',
      cidade_uf: 'São Paulo / SP',
      tipo_imovel: 'Gleba Urbana com Construção Geminada',
      texto: 'Nosso inventário estava travado há mais de 10 anos porque o imóvel não tinha desdobro nem habite-se averbado. A Brasil Legal cuidou da planta com drone, aprovação na Prefeitura e certidão do cartório. Profissionais de confiança rara.',
      estrelas: 5,
      foto_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      valorizacao: '+62% Valorização',
      prazo_meses: 4
    },
    {
      id: 'dep-3',
      nome: 'Carlos Eduardo Guimarães',
      cidade_uf: 'Sorocaba / SP',
      tipo_imovel: 'Chácara em Condomínio Chancelado',
      texto: 'Comprei fração ideal sem saber que não tinha matrícula individual. Não conseguia sequer ligar energia bifásica sem escritura. O georreferenciamento e o saneamento registral resolveram tudo. Recomendo de olhos fechados!',
      estrelas: 5,
      foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      valorizacao: '+35% Valorização',
      prazo_meses: 3
    }
  ],
  faq_itens: [
    {
      id: 'faq-1',
      pergunta: 'Todo imóvel pode ser regularizado?',
      resposta: 'A grande maioria dos imóveis urbanos e rurais possui instrumentos jurídicos e técnicos para regularização (como Usucapião Extrajudicial, REURB, Adjudicação Compulsória, anistia edilícia, retificação de área ou desdobro). O primeiro passo é o nosso diagnóstico inicial para identificar a situação física, fiscal e registral da propriedade.'
    },
    {
      id: 'faq-2',
      pergunta: 'Quanto custa regularizar um imóvel?',
      resposta: 'Os custos são proporcionais à complexidade da situação e englobam taxas municipais, certidões e emolumentos do Cartório de Registro de Imóveis, além dos honorários de engenharia e advocacia. Realizamos um diagnóstico prévio com orçamento detalhado e condições de pagamento parceladas para viabilizar o saneamento integral do seu patrimônio.'
    },
    {
      id: 'faq-3',
      pergunta: 'Quanto tempo demora para obter a matrícula regularizada?',
      resposta: 'Enquanto uma ação judicial tradicional costuma demorar entre 5 a 10 anos nos tribunais, o procedimento extrajudicial conduzido pela Brasil Legal perante os Cartórios e Prefeituras é muito mais ágil, levando habitualmente entre 90 a 180 dias após a conclusão dos levantamentos técnicos e certidões.'
    },
    {
      id: 'faq-4',
      pergunta: 'Minha construção é antiga. Preciso regularizar?',
      resposta: 'Sim. Mesmo edificações com décadas de existência precisam constar averbadas na matrícula para possibilitar venda financiada, inventário limpo ou doação formal. A vantagem é que construções concluídas há mais de 5 anos se beneficiam da decadência tributária do INSS de obra perante a Receita Federal, gerando expressiva economia.'
    },
    {
      id: 'faq-5',
      pergunta: 'Posso vender um imóvel irregular?',
      resposta: 'A venda pode até ocorrer por contrato de gaveta ou cessão de direitos, mas com perda severa de até 50% do valor comercial e exclusão total de compradores que dependem de financiamento bancário pela Caixa, Itaú, Bradesco ou Santander. A regularização prévia recupera a liquidez e o valor de mercado.'
    },
    {
      id: 'faq-6',
      pergunta: 'Posso financiar depois da regularização?',
      resposta: 'Sim, imediatamente! Uma vez registrada a matrícula com a construção averbada e CND expedida, o imóvel fica 100% elegível para qualquer linha de crédito imobiliário, consórcio ou financiamento bancário de todas as instituições financeiras do país.'
    },
    {
      id: 'faq-7',
      pergunta: 'O que é CIB?',
      resposta: 'O CIB (Cadastro Imobiliário Brasileiro) é o código identificador federal único instituído pela Receita Federal para unificar as informações cadastrais e fiscais de cada imóvel em território nacional. É fundamental para a emissão de certidões negativas e transações imobiliárias regulares.'
    },
    {
      id: 'faq-8',
      pergunta: 'O que é INSS da obra?',
      resposta: 'É a contribuição previdenciária devida sobre a mão de obra utilizada na construção ou reforma. Para que a Prefeitura e o Cartório de Registro de Imóveis averbem a edificação na matrícula, é obrigatória a emissão da CND da obra (Certidão Negativa de Débitos) via sistema SERO da Receita Federal.'
    },
    {
      id: 'faq-9',
      pergunta: 'O que acontece quando a construção não está averbada?',
      resposta: 'Na certidão do Cartório de Registro de Imóveis, consta apenas o terreno nu, como se a construção não existisse. Isso impossibilita financiamento bancário, trava heranças e partilhas em inventário, impede desdobros e gera insegurança quanto à propriedade da benfeitoria.'
    },
    {
      id: 'faq-10',
      pergunta: 'Comprei um terreno e ele ainda está no nome da loteadora. O que faço?',
      resposta: 'Se o loteamento estiver consolidado e você possuir o contrato de compra e venda e comprovantes de quitação, utilizamos instrumentos como a Adjudicação Compulsória Extrajudicial em cartório (Lei 14.382/22) ou Usucapião Administrativa, obtendo a matrícula sem depender da loteadora.'
    },
    {
      id: 'faq-11',
      pergunta: 'Preciso contratar advogado?',
      resposta: 'Na Brasil Legal, você não precisa contratar profissionais avulsos. Nossa assessoria é integrada: disponibilizamos nosso corpo jurídico especialista em Direito Notarial e Registral juntamente com os engenheiros credenciados, coordenando tudo em um único contrato.'
    },
    {
      id: 'faq-12',
      pergunta: 'Preciso de engenheiro?',
      resposta: 'Sim, qualquer regularização perante Prefeitura e Cartório exige laudos técnicos, levantamentos topográficos e plantas com ART/CREA recolhida. A Brasil Legal possui equipe de engenharia própria com drones e receptores GNSS de alta precisão.'
    }
  ],
  servicos_catalogo: [
    {
      id: 'srv-1',
      nome: 'Usucapião Extrajudicial',
      categoria: 'Regularização Fundiária',
      descricao: 'Regularização célere direta no Cartório de Registro de Imóveis (Lei 13.465/17 e Prov. 65 CNJ), sem litígio judicial.',
      icone: 'FileCheck2',
      prazo_medio: '90 a 180 dias',
      honorarios_referencia: 18000,
      documentos_exigidos: ['Matrícula Atualizada', 'Contrato de Gaveta ou Cessão', 'Espelho IPTU', 'Planta e Memorial com ART/RRT'],
      ativo: true,
      exibir_no_site: true,
      exibir_no_sistema: true
    },
    {
      id: 'srv-2',
      nome: 'Usucapião Judicial',
      categoria: 'Regularização Fundiária',
      descricao: 'Ação judicial de usucapião para áreas com litígio, confinantes ausentes ou óbices documentais complexos.',
      icone: 'Scale',
      prazo_medio: '12 a 24 meses',
      honorarios_referencia: 22000,
      documentos_exigidos: ['Certidões Vintenárias', 'Comprovantes de Posse Mansa', 'Certidões de Distribuição Cível'],
      ativo: true,
      exibir_no_site: true,
      exibir_no_sistema: true
    },
    {
      id: 'srv-3',
      nome: 'Inventário Judicial',
      categoria: 'Direito Sucessório / Família',
      descricao: 'Abertura e processamento judicial de partilha quando há herdeiros menores, incapazes ou desacordo sucessório.',
      icone: 'FileText',
      prazo_medio: '6 a 18 meses',
      honorarios_referencia: 25000,
      documentos_exigidos: ['Certidão de Óbito', 'Certidão de Casamento/Nascimento', 'Matrículas de Imóveis', 'Certidões Negativas Fiscais'],
      ativo: true,
      exibir_no_site: true,
      exibir_no_sistema: true
    },
    {
      id: 'srv-4',
      nome: 'Inventário Extrajudicial',
      categoria: 'Direito Sucessório / Família',
      descricao: 'Inventário em Cartório de Notas por escritura pública rápida, para herdeiros maiores, capazes e acordes.',
      icone: 'FileCheck',
      prazo_medio: '15 a 45 dias',
      honorarios_referencia: 15000,
      documentos_exigidos: ['Certidão de Óbito', 'Documentos Pessoais dos Herdeiros', 'Certidão de Inexistência de Testamento (CENSEC)'],
      ativo: true,
      exibir_no_site: true,
      exibir_no_sistema: true
    },
    {
      id: 'srv-5',
      nome: 'Averbação de Construção',
      categoria: 'Engenharia & Topografia',
      descricao: 'Regularização da edificação na matrícula do imóvel perante a Prefeitura e INSS/Receita Federal (CND e Habite-se).',
      icone: 'Home',
      prazo_medio: '30 a 60 dias',
      honorarios_referencia: 9500,
      documentos_exigidos: ['Habite-se / Auto de Conclusão', 'CND da Receita Federal (DISO/SERO)', 'Planta Aprovada'],
      ativo: true,
      exibir_no_site: true,
      exibir_no_sistema: true
    },
    {
      id: 'srv-6',
      nome: 'Desdobro, Unificação & Fracionamento de Lotes',
      categoria: 'Engenharia & Topografia',
      descricao: 'Aprovação municipal e abertura de matrículas individualizadas para construções geminadas, unificação ou parcelamento.',
      icone: 'Grid3X3',
      prazo_medio: '60 a 120 dias',
      honorarios_referencia: 14000,
      documentos_exigidos: ['Certidão de Diretrizes Municipais', 'Planta de Desdobro/Unificação', 'Memorial Descritivo'],
      ativo: true,
      exibir_no_site: true,
      exibir_no_sistema: true
    },
    {
      id: 'srv-7',
      nome: 'Retificação de Área',
      categoria: 'Engenharia & Topografia',
      descricao: 'Ajuste consensual ou cartorário de medidas perimétricas, confrontações e área real com georreferenciamento.',
      icone: 'Compass',
      prazo_medio: '45 a 90 dias',
      honorarios_referencia: 16000,
      documentos_exigidos: ['Levantamento Topográfico GNSS', 'ART/RRT Quitado', 'Anuência de Confinantes'],
      ativo: true,
      exibir_no_site: true,
      exibir_no_sistema: true
    },
    {
      id: 'srv-8',
      nome: 'REURB Urbana (REURB-S e REURB-E)',
      categoria: 'Regularização Fundiária',
      descricao: 'Regularização fundiária de núcleos urbanos informais consolidados, loteamentos irregulares e associações comunitárias.',
      icone: 'Building2',
      prazo_medio: '120 a 240 dias',
      honorarios_referencia: 35000,
      documentos_exigidos: ['Levantamento Socioeconômico', 'Projeto Urbanístico de Regularização', 'Certidão de Regularização Fundiária (CRF)'],
      ativo: true,
      exibir_no_site: true,
      exibir_no_sistema: true
    },
    {
      id: 'srv-9',
      nome: 'Auditoria de Matrícula & Saneamento Registral',
      categoria: 'Auditoria & Cartórios',
      descricao: 'Exame minucioso da cadeia dominial, cancelamento de penhoras/hipotecas caducas e saneamento pré-venda.',
      icone: 'SearchCheck',
      prazo_medio: '15 a 30 dias',
      honorarios_referencia: 4500,
      documentos_exigidos: ['Certidão de Matrícula Vintenária Inteiro Teor', 'Certidão de Ônus e Ações'],
      ativo: true,
      exibir_no_site: true,
      exibir_no_sistema: true
    }
  ],
  // Personalização do Topo & Logotipo
  topo_exibir_texto: true,
  topo_texto_titulo: 'BRASIL LEGAL',
  topo_texto_tag: 'REGULARIZAÇÃO',
  topo_texto_subtitulo: 'Advocacia Registral & Engenharia Legal',
  logo_altura_px: 42,
  faixa_topo_ativa: true,
  faixa_topo_texto: 'Plantão de Regularização Fundiária & Imobiliária • Atendimento em todo o Brasil',
  faixa_topo_link_texto: 'Falar com Especialista',
  // Personalização do Rodapé / Footer
  rodape_exibir: true,
  rodape_exibir_cnpj: false,
  rodape_titulo: 'BRASIL LEGAL',
  rodape_tag: 'CARTÓRIOS & REGISTROS',
  rodape_razao_social: 'Brasil Legal Soluções Imobiliárias e Registrais Ltda',
  rodape_cnpj: '',
  rodape_descricao: 'Assessoria especializada em regularização fundiária urbana e rural, usucapião extrajudicial e saneamento de matrículas em todo o território nacional.',
  rodape_telefone: '+55 11 99864-2424',
  rodape_email: 'atendimento@brasillegal.com.br',
  rodape_endereco: 'Caieiras, São Paulo - SP',
  rodape_horario_atendimento: 'Atendimento de Segunda a Sexta das 8h às 18h',
  rodape_texto_seguranca: 'Processos em conformidade com o Provimento 65 do CNJ e Lei 13.465/2017.',
  rodape_copyright: '© 2026 Brasil Legal. Todos os direitos reservados.',
  rodape_termos_uso: 'Termos de Uso',
  rodape_politica_privacidade: 'Política de Privacidade (LGPD)',
  // Blog & Artigos do Site
  blog_exibir: true,
  blog_titulo: 'Blog & Conhecimento Notarial',
  blog_subtitulo: 'Artigos técnicos, novidades regulatórias e guias práticos sobre regularização imobiliária, usucapião extrajudicial e direito registral.',
  artigos_blog: [
    {
      id: 'art-1',
      titulo: 'Como Regularizar Imóvel sem Escritura Direto no Cartório em 2026',
      slug: 'como-regularizar-imovel-sem-escritura-cartorio',
      resumo: 'Entenda como o Provimento 65 do CNJ e a Lei 13.465/17 tornaram a usucapião extrajudicial um procedimento rápido, sem necessidade de audiências demoradas na Justiça.',
      categoria: 'Usucapião Extrajudicial',
      autor: {
        nome: 'Dra. Gabriela Albuquerque',
        cargo: 'Advogada Notarial & Especialista Registral',
        foto_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      imagem_capa: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80',
      data_publicacao: '15 de Janeiro de 2026',
      tempo_leitura_min: 5,
      tags: ['Usucapião', 'Cartório de Imóveis', 'Provimento 65 CNJ', 'Escritura'],
      destaque: true,
      publicado: true,
      conteudo: `Ter apenas o contrato de gaveta ou um recibo antigo de compra e venda coloca seu patrimônio em constante insegurança jurídica. Sem a matrícula atualizada no Cartório de Registro de Imóveis (CRI), o imóvel perde até 50% do seu valor comercial de mercado e você fica impedido de vendê-lo através de financiamento bancário pela Caixa, Bradesco, Itaú ou Santander.

### 1. A Revolução do Procedimento Extrajudicial
Historicamente, qualquer regularização de posse exigia ajuizar uma Ação de Usucapião na Justiça Estadual, cujo tempo médio de tramitação variava entre 5 e 10 anos. Com o Código de Processo Civil de 2015 e a edição do **Provimento nº 65/2017 do Conselho Nacional de Justiça (CNJ)**, todo o trâmite passou a ser admitido diretamente perante o Oficial do Registro de Imóveis.

### 2. Documentos Essenciais para o Processo
Para dar entrada no Cartório de Imóveis, os requisitos principais são:
- **Ata Notarial de Constatação:** Lavrada em Cartório de Notas, atestando o tempo de posse ininterrupta e mansa.
- **Planta e Memorial Descritivo:** Elaborados por engenheiro credenciado pelo CREA com Anotação de Responsabilidade Técnica (ART) e levantamento topográfico georreferenciado.
- **Justo Título:** O próprio contrato de gaveta, promessa de compra e venda ou recibos que demonstrem a origem da posse.
- **Certidões Negativas:** Certidões vintenárias dos distribuidores cíveis e fiscais para comprovar inexistência de litígios.

### 3. Prazos e Conclusão
O procedimento em cartório leva em média entre **90 e 180 dias**. Uma vez notificadas as fazendas públicas (União, Estado e Município) e os vizinhos confrontantes sem oposição, o Oficial registra imediatamente a nova matrícula em seu nome, conferindo propriedade plena e inviolável.`
    },
    {
      id: 'art-2',
      titulo: 'REURB: Como Regularizar Loteamentos Informais e Núcleos Urbanos',
      slug: 'reurb-como-regularizar-loteamentos-informais',
      resumo: 'Saiba como associações de moradores, condomínios fechados e bairros consolidados podem emitir a Certidão de Regularização Fundiária (CRF).',
      categoria: 'Regularização Urbana (REURB)',
      autor: {
        nome: 'Eng. Renato Siqueira',
        cargo: 'Engenheiro Agrimensor & Perito Fundiário',
        foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      },
      imagem_capa: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
      data_publicacao: '28 de Janeiro de 2026',
      tempo_leitura_min: 6,
      tags: ['REURB', 'Loteamento', 'Prefeitura', 'Topografia RTK'],
      destaque: false,
      publicado: true,
      conteudo: `A Lei Federal nº 13.465/2017 instituiu a **REURB (Regularização Fundiária Urbana)**, um marco legal que permite aos municípios e associações legalizar núcleos urbanos informais consolidados.

### REURB-S vs REURB-E: Qual a diferença?
- **REURB-S (Social):** Destinada a famílias de baixa renda com isenção total de custas cartorárias e emolumentos.
- **REURB-E (Específica):** Aplicável a loteamentos de padrão médio ou alto, chácaras urbanas e parcelamentos clandestinos onde os próprios adquirentes arcam com os estudos técnicos e urbanísticos.

### O papel da tecnologia moderna
O uso de drones equipados com aerofotogrametria de alta precisão e receptores GNSS RTK milimétricos permite mapear 500 lotes em menos de 15 dias, reduzindo os custos de engenharia em mais de 60% e acelerando a aprovação municipal.`
    },
    {
      id: 'art-3',
      titulo: 'Contrato de Gaveta: Principais Riscos e Como Blindar seu Patrimônio',
      slug: 'contrato-de-gaveta-riscos-e-solucoes',
      resumo: 'Quem não registra não é dono. Veja os perigos reais de manter o imóvel no nome do antigo proprietário e como resolver com segurança.',
      categoria: 'Direito Imobiliário',
      autor: {
        nome: 'Dr. Lucas Silveira',
        cargo: 'Consultor Jurídico Imobiliário',
        foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
      },
      imagem_capa: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
      data_publicacao: '03 de Fevereiro de 2026',
      tempo_leitura_min: 4,
      tags: ['Contrato de Gaveta', 'Segurança Jurídica', 'Penhora', 'Matrícula'],
      destaque: false,
      publicado: true,
      conteudo: `O ditado popular *'Quem não registra não é dono'* é uma regra imperativa do artigo 1.245 do Código Civil Brasileiro. A simples assinatura em cartório com firma reconhecida no contrato particular de compra e venda não transfere a propriedade jurídica do imóvel.

### Riscos Críticos do Contrato de Gaveta:
1. **Penhora por Dívidas do Antigo Dono:** Se o vendedor sofrer execução fiscal, trabalhista ou de empréstimo bancário, o juiz ordenará a penhora da matrícula ainda registrada em nome dele.
2. **Falecimento do Vendedor:** Se o proprietário que consta na certidão falecer, o imóvel será arrolado no inventário dele junto aos herdeiros dele, podendo ser bloqueado por anos.
3. **Venda em Duplicidade:** Terceiros de má-fé podem vender novamente o mesmo imóvel a outra pessoa que registre primeiro no cartório.

A solução definitiva é o saneamento registral imediato via Usucapião Extrajudicial ou Adjudicação Compulsória em Cartório.`
    },
    {
      id: 'art-4',
      titulo: 'Inventário Extrajudicial em Cartório: Economize Tempo e Custos',
      slug: 'inventario-extrajudicial-cartorio-beneficios',
      resumo: 'Passo a passo para concluir a partilha de bens e regularização dos imóveis herdados em até 30 dias com escritura pública notarial.',
      categoria: 'Direito Sucessório',
      autor: {
        nome: 'Dra. Gabriela Albuquerque',
        cargo: 'Advogada Notarial & Especialista Registral',
        foto_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      imagem_capa: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=80',
      data_publicacao: '10 de Fevereiro de 2026',
      tempo_leitura_min: 5,
      tags: ['Inventário', 'Herança', 'Partilha de Bens', 'Cartório de Notas'],
      destaque: false,
      publicado: true,
      conteudo: `A perda de um familiar traz grande desgaste emocional que pode ser agravado por um inventário judicial conturbado. Desde a vigência da Lei 11.441/2007 e recentes resoluções do CNJ, o inventário pode ser feito diretamente no Cartório de Notas.

### Pré-requisitos para o Inventário Extrajudicial:
- Todos os herdeiros devem ser maiores e civilmente capazes (ou emancipados);
- Deve haver consenso unânime sobre a divisão do patrimônio;
- Acompanhamento obrigatório por advogado legalmente constituído;
- Pagamento do imposto estadual sobre herança (ITCMD).

Ao final, a escritura pública é lavrada em poucos dias e encaminhada aos Cartórios de Registro de Imóveis para transferência definitiva da titularidade aos herdeiros.`
    }
  ],
  mensagem_padrao_whatsapp: 'Olá, Brasil Legal. Quero entender como regularizar meu imóvel.',
  redes_sociais: [
    {
      id: 'rede-tiktok',
      nome: 'TikTok',
      username: '@brasillegaloficial',
      url: 'https://www.tiktok.com/@brasillegaloficial',
      icone: 'tiktok',
      ordem: 1,
      ativo: true
    },
    {
      id: 'rede-instagram',
      nome: 'Instagram',
      username: '@brasillegalodicial',
      url: 'https://www.instagram.com/brasillegalodicial',
      icone: 'instagram',
      ordem: 2,
      ativo: true
    },
    {
      id: 'rede-facebook',
      nome: 'Facebook',
      username: '@brasillegaloficial',
      url: 'https://www.facebook.com/brasillegaloficial',
      icone: 'facebook',
      ordem: 3,
      ativo: true
    },
    {
      id: 'rede-youtube',
      nome: 'YouTube',
      username: '@brasillegaloficial',
      url: 'https://www.youtube.com/@brasillegaloficial',
      icone: 'youtube',
      ordem: 4,
      ativo: true
    }
  ],
  galeria_videos: [
    {
      id: 'vid-1',
      titulo: 'Como Funciona a Regularização Extrajudicial em Cartório',
      descricao: 'Entenda em 2 minutos como a Lei 13.465/17 e o Provimento 65 do CNJ permitem obter sua escritura registrada sem processo demorado na Justiça.',
      url: 'https://youtu.be/9uRifSbfweA?si=0UzSL42AuAF3IaGS',
      thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Institucional',
      ordem: 1,
      ativo: true
    },
    {
      id: 'vid-2',
      titulo: 'Contrato de Gaveta e Posse: Os Riscos de não Averbar',
      descricao: 'Descubra por que quem não registra não é dono perante a lei e como blindar seu patrimônio contra penhoras de antigos proprietários.',
      url: 'https://youtu.be/9uRifSbfweA?si=0UzSL42AuAF3IaGS',
      thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Regularização',
      ordem: 2,
      ativo: true
    },
    {
      id: 'vid-3',
      titulo: 'Habite-se, CIB e INSS de Obra: Como Destravar a Venda',
      descricao: 'Casos reais de obras que impediam financiamento bancário pela Caixa e foram saneadas em prazo recorde.',
      url: 'https://youtu.be/9uRifSbfweA?si=0UzSL42AuAF3IaGS',
      thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      categoria: 'Casos reais',
      ordem: 3,
      ativo: true
    }
  ],
  casos_reais: [
    {
      id: 'caso-1',
      titulo: 'Construção Residencial de 280m² sem Habite-se e INSS Pendente',
      cliente_ou_tipo: 'Imóvel Residencial Familiar',
      cidade: 'Caieiras / SP',
      problema: 'Imóvel concluído há 12 anos sem averbação da edificação na matrícula. Ao tentar vender por R$ 850.000, o financiamento da Caixa foi reprovado por falta do Habite-se e certidão do INSS da obra.',
      desafio: 'Aprovação de projeto as-built na Prefeitura sem demolir acréscimos e reconhecimento da decadência do INSS de obra junto à Receita Federal para afastar encargos retroativos.',
      solucao: 'Nossa equipe de engenharia realizou levantamento topográfico e projeto as-built em 48 horas. O jurídico comprovou a decadência previdenciária e emitiu a CND/SERO da Receita Federal, protocolando averbação direta no Registro de Imóveis.',
      resultado: 'Matrícula averbada com construção regularizada em 68 dias úteis. Financiamento liberado e venda concluída com sucesso.',
      tempo_meses: '2,5 meses',
      valorizacao_estimada: '+38% Valorização Real',
      imagem_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
      ordem: 1,
      destaque: true,
      ativo: true
    },
    {
      id: 'caso-2',
      titulo: 'Loteamento Antigo com Cadeia Sucessória de Contrato de Gaveta',
      cliente_ou_tipo: 'Proprietário Familiar',
      cidade: 'Franco da Rocha / SP',
      problema: 'Família residia há mais de duas décadas em lote adquirido por contrato de gaveta. A loteadora original faliu e os herdeiros do titular registral não eram localizados para outorga de escritura pública.',
      desafio: 'Reconstituir a cadeia documental ininterrupta, delimitar perfeitamente o lote com coordenadas georreferenciadas e notificar confrontantes conforme Provimento 65 do CNJ.',
      solucao: 'Procedimento completo de Usucapião Extrajudicial direto no Cartório de Registro de Imóveis: levantamento GNSS RTK milimétrico, ata notarial de constatação de posse e anuência cartorária dos vizinhos.',
      resultado: 'Emissão de matrícula própria individualizada em nome da família, transformando posse precária em patrimônio 100% legalizado e transmissível por herança.',
      tempo_meses: '5 meses',
      valorizacao_estimada: '+55% Valor de Mercado',
      imagem_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      ordem: 2,
      destaque: true,
      ativo: true
    },
    {
      id: 'caso-3',
      titulo: 'Galpão Comercial com Divergência de Área, CIB e Alvará Travado',
      cliente_ou_tipo: 'Pessoa Jurídica / Logística',
      cidade: 'Cajamar / SP',
      problema: 'Empresa necessitava renovar alvará de funcionamento e contratar financiamento com o imóvel em garantia fiduciária, mas havia discrepância de 14% na área construída e ausência de CIB vinculado.',
      desafio: 'Retificação administrativa de área consensual sem ação judicial e saneamento cadastral unificado perante a Receita Federal e Prefeitura.',
      solucao: 'Agrimensura e laudo perimétrico de alta precisão com ART recolhida, termo de anuência dos confrontantes e atualização simultânea do CIB e espelho municipal.',
      resultado: 'Imóvel regularizado em 4 meses, alvará definitivo emitido e crédito bancário liberado com juros reduzidos.',
      tempo_meses: '4 meses',
      valorizacao_estimada: 'Crédito e Alvará Destravados',
      imagem_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      ordem: 3,
      destaque: true,
      ativo: true
    }
  ],
  // Pop-up Promocional / Campanha de Desconto com Cronômetro
  popup_promo_ativo: false,
  popup_promo_titulo: 'Condição Especial de Plantão Notarial',
  popup_promo_subtitulo: 'Garanta até 20% de desconto nos honorários de regularização para requerimentos iniciados hoje!',
  popup_promo_tag_desconto: '20% OFF EXCLUSIVO',
  popup_promo_cupom: 'REGULARIZA20',
  popup_promo_minutos_cronometro: 15,
  popup_promo_segundos_delay: 6,
  popup_promo_texto_botao: 'Resgatar Desconto no WhatsApp',
  popup_promo_texto_rodape: 'Condição especial por tempo limitado ao encerramento do cronômetro oficial.',
  popup_promo_mensagem_whatsapp: 'Olá! Vi o pop-up com o cupom REGULARIZA20 e quero solicitar a condição especial com 20% de desconto nos honorários.',
  popup_promo_imagem_url: ''
};

export const initialServicosCatalogo: ServicoCatalogo[] = initialSiteSettings.servicos_catalogo;

export const initialContacts: Contact[] = [
  {
    id: 'ct-101',
    nome_completo: 'Marcelo Augusto de Oliveira',
    tipo_pessoa: 'PF',
    cpf_cnpj: '284.912.738-44',
    rg_ie: '34.819.201-X SSP/SP',
    telefone_whatsapp: '(11) 99864-2424',
    email: 'marcelo.oliveira@gmail.com',
    status_cadastro: 'Em Qualificacao',
    endereco: {
      logradouro: 'Rua das Figueiras',
      numero: '450',
      complemento: 'Lote 14 Quadra B',
      bairro: 'Jardim Alvorada',
      cidade: 'Campinas',
      uf: 'SP',
      cep: '13088-210'
    },
    origem_lead: 'Indique e Ganhe B2B',
    indicador_id: 'PARC-B2B-88',
    qualificacao_sdr: 'MQL (Qualificado)',
    tempo_primeira_resposta_minutos: 2, // SLA cumprido (< 4 min)
    created_at: '2026-08-30T10:15:00Z',
    tipo_imovel: 'Casa com Contrato de Gaveta (22 anos de posse mansa)',
    servico_pretendido: 'Usucapião Extrajudicial',
    observacoes: 'Posse ininterrupta comprovada por IPTU desde 2004. Indicado pelo corretor Carlos Mendes.'
  },
  {
    id: 'ct-102',
    nome_completo: 'Construtora & Incorporadora Horizonte Sul Ltda',
    tipo_pessoa: 'PJ',
    cpf_cnpj: '18.492.019/0001-82',
    rg_ie: '109.821.334.110',
    telefone_whatsapp: '(11) 97123-8844',
    email: 'diretoria@horizontesul.com.br',
    status_cadastro: 'Cliente Ativo',
    endereco: {
      logradouro: 'Avenida Engenheiro Luís Carlos Berrini',
      numero: '1200',
      complemento: 'Conjunto 81',
      bairro: 'Brooklin',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '04571-010'
    },
    origem_lead: 'Google Ads',
    qualificacao_sdr: 'MQL (Qualificado)',
    tempo_primeira_resposta_minutos: 3, // SLA cumprido (< 4 min)
    created_at: '2026-08-28T14:20:00Z',
    tipo_imovel: 'Gleba urbana de 42.000m² para condomínio fechado',
    servico_pretendido: 'Retificação de Área e Desdobro',
    observacoes: 'Divergência entre memorial descritivo da matrícula e levantamento GNSS RTK.'
  },
  {
    id: 'ct-103',
    nome_completo: 'Dona Neide de Lurdes Santos',
    tipo_pessoa: 'PF',
    cpf_cnpj: '119.382.478-01',
    telefone_whatsapp: '(11) 96554-1122',
    email: 'neide.santos@yahoo.com.br',
    status_cadastro: 'Lead (Novo)',
    endereco: {
      logradouro: 'Travessa Bela Vista',
      numero: '88',
      bairro: 'Vila Esperança',
      cidade: 'Guarulhos',
      uf: 'SP',
      cep: '07110-090'
    },
    origem_lead: 'Meta Ads',
    qualificacao_sdr: 'Novo',
    tempo_primeira_resposta_minutos: 1, // SLA cumprido (< 4 min)
    created_at: '2026-09-02T11:45:00Z',
    tipo_imovel: 'Sobrado em loteamento irregular da década de 90',
    servico_pretendido: 'REURB Urbana',
    observacoes: 'Lead acabou de entrar via formulário do Instagram. Aguardando triagem documental.'
  },
  {
    id: 'ct-104',
    nome_completo: 'Helena Beatriz Prado',
    tipo_pessoa: 'PF',
    cpf_cnpj: '342.118.990-21',
    telefone_whatsapp: '(19) 99881-3311',
    email: 'helena.prado@outlook.com',
    status_cadastro: 'Em Qualificacao',
    endereco: {
      logradouro: 'Rua General Osório',
      numero: '920',
      bairro: 'Centro',
      cidade: 'Sorocaba',
      uf: 'SP',
      cep: '18010-120'
    },
    origem_lead: 'Indique e Ganhe B2B',
    indicador_id: 'PARC-B2B-88',
    qualificacao_sdr: 'Em Triagem',
    tempo_primeira_resposta_minutos: 5, // SLA excedeu um pouco
    created_at: '2026-09-01T09:10:00Z',
    tipo_imovel: 'Chácara periurbana de 3.500m²',
    servico_pretendido: 'Usucapião Extrajudicial',
    observacoes: 'Posse herdada do pai. Falta localizar certidões vintenárias.'
  }
];

export const initialDocuments: Documento[] = [
  {
    id: 'doc-001',
    contact_id: 'ct-101',
    deal_id: 'deal-01',
    tipo_documento: 'Matricula_Atualizada',
    file_url: 'https://cdn.brasillegal.internal/docs/matricula_48219_2cri_campinas.pdf',
    upload_na_qualificacao: true,
    status_validacao: 'Aprovado',
    nome_arquivo: 'matricula_48219_2cri_campinas.pdf',
    tamanho_bytes: 2450000,
    data_upload: '2026-08-30T11:00:00Z',
    parecer_observacao: 'Matrícula expedida há menos de 30 dias. Imóvel originário perfeitamente delimitado.',
    validado_por: 'Dra. Vanessa Monteiro'
  },
  {
    id: 'doc-002',
    contact_id: 'ct-101',
    deal_id: 'deal-01',
    tipo_documento: 'Contrato_Gaveta',
    file_url: 'https://cdn.brasillegal.internal/docs/instrumento_particular_compra_venda_2004.pdf',
    upload_na_qualificacao: true,
    status_validacao: 'Aprovado',
    nome_arquivo: 'instrumento_particular_compra_venda_2004.pdf',
    tamanho_bytes: 1820000,
    data_upload: '2026-08-30T11:05:00Z',
    parecer_observacao: 'Reconhecimento de firma dos alienantes originais datado de maio/2004. Prova documental robusta de justo título.',
    validado_por: 'Dra. Vanessa Monteiro'
  },
  {
    id: 'doc-003',
    contact_id: 'ct-101',
    deal_id: 'deal-01',
    tipo_documento: 'IPTU',
    file_url: 'https://cdn.brasillegal.internal/docs/espelho_iptu_2026_pmc.pdf',
    upload_na_qualificacao: true,
    status_validacao: 'Aprovado',
    nome_arquivo: 'espelho_iptu_2026_pmc.pdf',
    tamanho_bytes: 650000,
    data_upload: '2026-08-30T11:08:00Z',
    parecer_observacao: 'Inscrição cadastral municipal em dia. Nome do contribuinte atualizado.',
    validado_por: 'Eng. Roberto Castro'
  },
  {
    id: 'doc-004',
    contact_id: 'ct-101',
    deal_id: 'deal-01',
    tipo_documento: 'ART_RRT',
    file_url: 'https://cdn.brasillegal.internal/docs/art_crea_levantamento_topografico.pdf',
    upload_na_qualificacao: false,
    status_validacao: 'Pendente',
    nome_arquivo: 'art_crea_levantamento_topografico.pdf',
    tamanho_bytes: 980000,
    data_upload: '2026-09-01T15:20:00Z',
    parecer_observacao: 'Aguardando validação da assinatura eletrônica do responsável técnico no sistema CREA.',
    validado_por: undefined
  },
  {
    id: 'doc-005',
    contact_id: 'ct-104',
    tipo_documento: 'RG_CPF_CNH',
    file_url: 'https://cdn.brasillegal.internal/docs/cnh_helena_prado.pdf',
    upload_na_qualificacao: true,
    status_validacao: 'Rejeitado_Solicitar_Reenvio',
    nome_arquivo: 'cnh_helena_prado.jpg',
    tamanho_bytes: 420000,
    data_upload: '2026-09-01T09:40:00Z',
    parecer_observacao: 'Imagem cortada e com reflexo impossibilitando a leitura do número de segurança e filiação. Necessário reenvio em PDF ou foto aberta.',
    validado_por: 'Lucas Sales (SDR)'
  }
];

export const initialDeals: Deal[] = [
  {
    id: 'deal-01',
    contact_id: 'ct-101',
    titulo: 'Usucapião Extrajudicial — Imóvel Residencial Jd. Alvorada',
    cartorio_comarca: '2º Oficial de Registro de Imóveis de Campinas/SP',
    tipo_procedimento: 'Usucapião Extrajudicial (Art. 216-A LRP)',
    status: 'Parecer Técnico/Jurídico',
    valor_honorarios_liquido: 18500.00,
    parceiro_id: 'PARC-B2B-88',
    comissao_b2b_percentual: 5.0, // 5% do programa Indique e Ganhe
    comissao_b2b_valor: 925.00,
    comissao_paga: false,
    homologado_diretoria: true,
    data_fechamento: '2026-08-31',
    parecer_tecnico: 'Parecer favorável. Posse pacífica superior a 15 anos sem oposição comprovada por 22 carnês de IPTU e quitação de escritura de cessão.'
  },
  {
    id: 'deal-02',
    contact_id: 'ct-102',
    titulo: 'Retificação de Registro & Desdobro Gleba Berrini Sul',
    cartorio_comarca: '11º Cartório de Registro de Imóveis da Capital/SP',
    tipo_procedimento: 'Retificação Administrativa de Área (Art. 213, II LRP)',
    status: 'Protocolado Cartório/Prefeitura',
    valor_honorarios_liquido: 54000.00,
    comissao_b2b_percentual: 0,
    comissao_b2b_valor: 0,
    comissao_paga: false,
    homologado_diretoria: true,
    data_fechamento: '2026-08-29',
    parecer_tecnico: 'Levantamento GNSS e memoriais descritivos concluídos. Notificação dos confinantes cumprida sem impugnações.'
  },
  {
    id: 'deal-03',
    contact_id: 'ct-104',
    titulo: 'Usucapião Extrajudicial — Chácara Sorocaba',
    cartorio_comarca: '1º Registro de Imóveis de Sorocaba/SP',
    tipo_procedimento: 'Usucapião Ordinária Extrajudicial',
    status: 'Auditoria Documental',
    valor_honorarios_liquido: 14000.00,
    parceiro_id: 'PARC-B2B-88',
    comissao_b2b_percentual: 5.0,
    comissao_b2b_valor: 700.00,
    comissao_paga: false,
    homologado_diretoria: false,
    data_fechamento: '2026-09-01',
    parecer_tecnico: 'Aguardando complemento de documentos (certidões de distribuição cível e CNH nítida).'
  }
];

export const initialProperties: Property[] = [
  {
    id: 'prop-01',
    contact_id: 'ct-101',
    deal_id: 'deal-01',
    matricula_numero: '48.219',
    cartorio_ri: '2º Oficial de Registro de Imóveis de Campinas/SP',
    inscricao_municipal_iptu: '3412.89.04.0120.000',
    area_total_m2: 320.50,
    area_construida_m2: 184.20,
    tipo_imovel: 'Casa Residencial em Loteamento Urbano',
    situacao_posse: 'Posse Mansa e Pacífica',
    endereco: {
      logradouro: 'Rua das Figueiras',
      numero: '450',
      complemento: 'Lote 14 Quadra B',
      bairro: 'Jardim Alvorada',
      cidade: 'Campinas',
      uf: 'SP',
      cep: '13088-210'
    },
    confrontantes: 'Norte: Lote 15 (Sr. Paulo Rocha); Sul: Lote 13 (Espólio de Silva); Leste: Rua das Figueiras; Oeste: Área Institucional Municipal.',
    observacoes: 'Posse ininterrupta exercida com animus domini desde 2004 comprovada por faturas e certidões.'
  },
  {
    id: 'prop-02',
    contact_id: 'ct-102',
    deal_id: 'deal-02',
    matricula_numero: '112.440',
    cartorio_ri: '11º Cartório de Registro de Imóveis da Capital/SP',
    inscricao_municipal_iptu: '089.231.0044-1',
    area_total_m2: 42000.00,
    tipo_imovel: 'Gleba Urbana para Condomínio Fechado',
    situacao_posse: 'Sobreposição de Área',
    endereco: {
      logradouro: 'Avenida Engenheiro Luís Carlos Berrini',
      numero: '1200',
      complemento: 'Gleba Sul A',
      bairro: 'Brooklin',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '04571-010'
    },
    confrontantes: 'Confrontações consolidadas com memorial georreferenciado e ART/RRT quitada.',
    observacoes: 'Procedimento de retificação consensual em andamento para posterior parcelamento do solo.'
  }
];

export const initialFinancialRecords: FinancialRecord[] = [
  {
    id: 'fin-001',
    deal_id: 'deal-01',
    natureza: 'RECEITA',
    categoria: 'HONORARIOS_ENTRADA',
    tipo: 'HONORARIOS',
    descricao: 'Honorários Contratuais — Usucapião Extrajudicial Campinas (Entrada)',
    valor: 9250.00,
    beneficiario: 'Brasil Legal Soluções Imobiliárias Ltda',
    pagador: 'Carlos Eduardo Silveira',
    data_vencimento: '2026-08-31',
    data_pagamento: '2026-08-31',
    status: 'Pago',
    homologado_por: 'Dr. Emerson Carneiro',
    created_at: '2026-08-30T10:30:00Z',
    distribuicao_resultado: {
      honorario_total: 9250.00,
      empresa_percentual: 50,
      empresa_valor: 4625.00,
      executado_em: '2026-08-31T10:45:00Z',
      socios: [
        {
          socio_id: 'socio-1',
          socio_nome: 'Dr. Emerson Carneiro',
          percentual: 25,
          valor: 2312.50,
          chave_pix: '123.456.789-00',
          banco: 'Banco Santander (033)',
          pago: true,
          data_repasse: '2026-08-31'
        },
        {
          socio_id: 'socio-2',
          socio_nome: 'Dra. Vanessa Monteiro & Eng. Roberto',
          percentual: 25,
          valor: 2312.50,
          chave_pix: 'vanessa.juridico@brasillegal.com.br',
          banco: 'Banco Itaú (341)',
          pago: true,
          data_repasse: '2026-08-31'
        }
      ]
    }
  },
  {
    id: 'fin-002',
    deal_id: 'deal-01',
    natureza: 'DESPESA',
    categoria: 'COMISSAO_B2B',
    tipo: 'COMISSAO_B2B',
    descricao: 'Comissão Programa Indique e Ganhe (5%) — Carlos Mendes Imóveis',
    valor: 462.50,
    beneficiario: 'Carlos Mendes Imóveis (PARC-B2B-88)',
    data_vencimento: '2026-09-05',
    data_pagamento: '2026-09-05',
    status: 'Pago',
    homologado_por: 'Dr. Emerson Carneiro',
    created_at: '2026-08-31T16:00:00Z'
  },
  {
    id: 'fin-003',
    deal_id: 'deal-02',
    natureza: 'RECEITA',
    categoria: 'HONORARIOS_PARCELA',
    tipo: 'HONORARIOS',
    descricao: 'Honorários 1ª Parcela — Retificação & Desdobro Gleba Berrini',
    valor: 27000.00,
    beneficiario: 'Brasil Legal Soluções Imobiliárias Ltda',
    pagador: 'Marcos Vinícius de Andrade',
    data_vencimento: '2026-08-29',
    data_pagamento: '2026-08-29',
    status: 'Pago',
    homologado_por: 'Dr. Emerson Carneiro',
    created_at: '2026-08-28T14:30:00Z',
    distribuicao_resultado: {
      honorario_total: 27000.00,
      empresa_percentual: 50,
      empresa_valor: 13500.00,
      executado_em: '2026-08-29T15:00:00Z',
      socios: [
        {
          socio_id: 'socio-1',
          socio_nome: 'Dr. Emerson Carneiro',
          percentual: 25,
          valor: 6750.00,
          chave_pix: '123.456.789-00',
          banco: 'Banco Santander (033)',
          pago: true,
          data_repasse: '2026-08-29'
        },
        {
          socio_id: 'socio-2',
          socio_nome: 'Dra. Vanessa Monteiro & Eng. Roberto',
          percentual: 25,
          valor: 6750.00,
          chave_pix: 'vanessa.juridico@brasillegal.com.br',
          banco: 'Banco Itaú (341)',
          pago: true,
          data_repasse: '2026-08-29'
        }
      ]
    }
  },
  {
    id: 'fin-004',
    deal_id: 'deal-01',
    natureza: 'DESPESA',
    categoria: 'EMOLUMENTOS_CARTORIO',
    tipo: 'TAXA_CARTORARIA',
    descricao: 'Ata Notarial de Posse & Notificações — 2º Tabelionato de Notas de Campinas',
    valor: 1850.00,
    beneficiario: '2º Tabelionato de Notas de Campinas/SP',
    data_vencimento: '2026-09-02',
    data_pagamento: '2026-09-02',
    status: 'Pago',
    homologado_por: 'Dr. Emerson Carneiro',
    created_at: '2026-09-01T09:00:00Z'
  },
  {
    id: 'fin-005',
    deal_id: 'deal-02',
    natureza: 'DESPESA',
    categoria: 'TOPOGRAFIA_GEO',
    tipo: 'CUSTAS_TOPOGRAFIA',
    descricao: 'Levantamento Topográfico RTK & Memorial Georreferenciado INCRA',
    valor: 3200.00,
    beneficiario: 'Geometria Topografia & Geodésia Ltda',
    data_vencimento: '2026-09-03',
    data_pagamento: '2026-09-03',
    status: 'Pago',
    homologado_por: 'Dr. Emerson Carneiro',
    created_at: '2026-09-01T14:00:00Z'
  },
  {
    id: 'fin-006',
    natureza: 'DESPESA',
    categoria: 'TRAFEGO_MARKETING',
    tipo: 'DESPESA_OPERACIONAL',
    descricao: 'Investimento em Campanhas Google Ads & Meta Ads (Campinas e RMC)',
    valor: 2450.00,
    beneficiario: 'Meta Platforms & Google Brasil',
    data_vencimento: '2026-09-05',
    data_pagamento: '2026-09-05',
    status: 'Pago',
    homologado_por: 'Dr. Emerson Carneiro',
    created_at: '2026-09-01T10:00:00Z'
  },
  {
    id: 'fin-007',
    natureza: 'DESPESA',
    categoria: 'SOFTWARE_TI',
    tipo: 'DESPESA_OPERACIONAL',
    descricao: 'Servidores em Nuvem, Assinaturas Digitais ICP-Brasil e APIs WhatsApp',
    valor: 890.00,
    beneficiario: 'Cloud & Tech Infra',
    data_vencimento: '2026-09-10',
    data_pagamento: '2026-09-08',
    status: 'Pago',
    homologado_por: 'Dr. Emerson Carneiro',
    created_at: '2026-09-02T11:00:00Z'
  },
  {
    id: 'fin-008',
    natureza: 'DESPESA',
    categoria: 'IMPOSTOS_SIMPLES',
    tipo: 'IMPOSTOS_DEDUCOES',
    descricao: 'DAS Simples Nacional (Anexo IV — Advocacia & Engenharia)',
    valor: 2175.00,
    beneficiario: 'Receita Federal do Brasil',
    data_vencimento: '2026-09-20',
    status: 'Pendente',
    created_at: '2026-09-05T08:00:00Z'
  },
  {
    id: 'fin-009',
    deal_id: 'deal-03',
    natureza: 'RECEITA',
    categoria: 'HONORARIOS_ENTRADA',
    tipo: 'HONORARIOS',
    descricao: 'Honorários Entrada Contratual — Inventário Extrajudicial Vila Mariana',
    valor: 14000.00,
    beneficiario: 'Brasil Legal Soluções Imobiliárias Ltda',
    pagador: 'Patrícia Helena Lemos',
    data_vencimento: '2026-09-12',
    status: 'Pendente',
    created_at: '2026-09-06T15:30:00Z'
  },
  {
    id: 'fin-010',
    deal_id: 'deal-03',
    natureza: 'DESPESA',
    categoria: 'COMISSAO_B2B',
    tipo: 'COMISSAO_B2B',
    descricao: 'Comissão Prevista Indique e Ganhe (5%) — Carlos Mendes Imóveis',
    valor: 700.00,
    beneficiario: 'Carlos Mendes Imóveis (PARC-B2B-88)',
    data_vencimento: '2026-09-15',
    status: 'Pendente',
    created_at: '2026-09-06T16:00:00Z'
  }
];

export const initialReferralProgramSettings: ReferralProgramSettings = {
  percentual_padrao: 5.0,
  teto_maximo_percentual: 5.0,
  regra_homologacao: 'A comissão é liberada exclusivamente após a homologação formal da Diretoria e o efetivo recebimento dos honorários contratuais.',
  sla_pagamento_dias: 5,
  termos_adesao_b2b: 'O Parceiro B2B declara ciência de que as indicações são submetidas à triagem e auditoria jurídica prévia. Comissões limitadas a 5% sobre honorários líquidos contratuais.'
};

export const initialFintechConfigs: FintechConfig[] = [
  {
    id: 'Asaas',
    nome: 'Asaas Gestão Financeira PJ',
    tipo: 'SaaS',
    ativo: true,
    ambiente: 'producao',
    api_key: 'prod_asaas_sec_89231849102830192',
    webhook_url: 'https://brasillegalimoveis.com.br/api/webhooks/asaas',
    tarifa_boleto: 1.99,
    dias_compensacao: 'D+0 (Pix) / D+1 (Boleto)',
    suporta_split: true,
    suporta_pix_hibrido: true,
    icone: 'CreditCard',
    descricao: 'Conta Digital PJ com emissão de boleto híbrido (código de barras + Pix QR Code), régua de cobrança automática e webhooks de baixa instantânea.'
  },
  {
    id: 'Banco Inter',
    nome: 'Banco Inter Empresas (API Banking)',
    tipo: 'Banco Digital',
    ativo: true,
    ambiente: 'producao',
    api_key: 'inter_client_id_74910283',
    client_id: 'cli-inter-brasil-legal-01',
    client_secret: 'sec-inter-super-key-99',
    webhook_url: 'https://brasillegalimoveis.com.br/api/webhooks/inter',
    tarifa_boleto: 0.00,
    dias_compensacao: 'D+1',
    suporta_split: false,
    suporta_pix_hibrido: true,
    icone: 'Building2',
    descricao: 'API Oficial de Cobrança do Banco Inter para PJ. Boletos registrados gratuitos com Pix QR Code e liquidação na conta corrente.'
  },
  {
    id: 'Cora',
    nome: 'Cora Banco PJ & Gestão',
    tipo: 'Banco Digital',
    ativo: false,
    ambiente: 'sandbox',
    api_key: 'cora_sandbox_key_1120938',
    client_id: 'cora-app-brasil-legal',
    webhook_url: 'https://brasillegalimoveis.com.br/api/webhooks/cora',
    tarifa_boleto: 0.00,
    dias_compensacao: 'D+1',
    suporta_split: false,
    suporta_pix_hibrido: true,
    icone: 'Landmark',
    descricao: 'Conta digital sem anuidade para PMEs. Emissão de boletos em lote com notificações automáticas via e-mail e WhatsApp.'
  },
  {
    id: 'Iugu',
    nome: 'Iugu Instituição de Pagamento',
    tipo: 'SaaS',
    ativo: true,
    ambiente: 'producao',
    api_key: 'iugu_live_api_token_4892019481029',
    webhook_url: 'https://brasillegalimoveis.com.br/api/webhooks/iugu',
    tarifa_boleto: 2.50,
    dias_compensacao: 'D+1',
    suporta_split: true,
    suporta_pix_hibrido: true,
    icone: 'Zap',
    descricao: 'Infraestrutura robusta de pagamentos com split automatizado no momento do recebimento (Honorários Escritório + 5% Parceiro B2B).'
  },
  {
    id: 'Stone',
    nome: 'Stone / Pagar.me Gateway',
    tipo: 'Gateway',
    ativo: false,
    ambiente: 'sandbox',
    api_key: 'stone_sk_test_849201948190',
    webhook_url: 'https://brasillegalimoveis.com.br/api/webhooks/stone',
    tarifa_boleto: 2.10,
    dias_compensacao: 'D+2',
    suporta_split: true,
    suporta_pix_hibrido: false,
    icone: 'Coins',
    descricao: 'Gateway financeiro completo com antecipação de recebíveis, conciliação e split multi-contas de alta volumetria.'
  },
  {
    id: 'Mercado Pago',
    nome: 'Mercado Pago Enterprise',
    tipo: 'Gateway',
    ativo: false,
    ambiente: 'sandbox',
    api_key: 'APP_USR-74910283019284-090212',
    webhook_url: 'https://brasillegalimoveis.com.br/api/webhooks/mercadopago',
    tarifa_boleto: 3.49,
    dias_compensacao: 'D+0',
    suporta_split: false,
    suporta_pix_hibrido: true,
    icone: 'Wallet',
    descricao: 'Checkout transparente e cobrança via link de pagamento rápido com aprovação instantânea.'
  }
];

export const initialCobrancas: CobrancaBoleto[] = [
  {
    id: 'bol-1001',
    contact_id: 'ct-101',
    contact_nome: 'Marcelo Augusto de Oliveira',
    contact_cpf_cnpj: '284.912.738-44',
    contact_email: 'marcelo.oliveira@gmail.com',
    contact_telefone: '(11) 99864-2424',
    contact_endereco: {
      logradouro: 'Rua das Figueiras',
      numero: '450',
      complemento: 'Lote 14 Quadra B',
      bairro: 'Jardim Alvorada',
      cidade: 'Campinas',
      uf: 'SP',
      cep: '13088-210'
    },
    deal_id: 'deal-01',
    deal_titulo: 'Usucapião Extrajudicial — Imóvel Residencial Jd. Alvorada',
    tipo: 'HONORARIOS_ENTRADA',
    descricao: 'Honorários Iniciais — Usucapião Extrajudicial Cartório Campinas/SP',
    valor: 9250.00,
    data_emissao: '2026-08-30',
    data_vencimento: '2026-09-08',
    status: 'Pendente',
    gateway: 'Asaas',
    linha_digitavel: '07790.00116 21000.123456 78000.123456 1 98760000925000',
    codigo_barras: '07791987600009250000011621000123456780001234',
    nosso_numero: '077/2026/000189',
    pix_copia_cola: '00020126580014br.gov.bcb.pix01363849182000015552040000530398654079250.005802BR5925BRASIL LEGAL SOLUCOES6009SAO PAULO62070503***63041D2E',
    qr_code_pix_url: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014br.gov.bcb.pix01363849182000015552040000530398654079250.005802BR5925BRASIL%20LEGAL',
    multa_percentual: 2.0,
    juros_mensal_percentual: 1.0,
    instrucoes_caixa: [
      'Não receber após 30 dias do vencimento.',
      'Após o vencimento, cobrar multa de 2,0% e juros de mora de 1,0% ao mês.',
      'Pagável em qualquer agência bancária ou internet banking até o vencimento.',
      'Pagamento instantâneo via Pix disponível pelo QR Code ao lado.'
    ],
    split_b2b: {
      parceiro_id: 'PARC-B2B-88',
      parceiro_nome: 'Carlos Mendes Imóveis',
      percentual: 5.0,
      valor_comissao: 462.50
    }
  },
  {
    id: 'bol-1002',
    contact_id: 'ct-102',
    contact_nome: 'Construtora & Incorporadora Horizonte Sul Ltda',
    contact_cpf_cnpj: '18.492.019/0001-82',
    contact_email: 'diretoria@horizontesul.com.br',
    contact_telefone: '(11) 97123-8844',
    contact_endereco: {
      logradouro: 'Avenida Engenheiro Luís Carlos Berrini',
      numero: '1200',
      complemento: 'Conjunto 81',
      bairro: 'Brooklin',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '04571-010'
    },
    deal_id: 'deal-02',
    deal_titulo: 'Retificação de Registro & Desdobro Gleba Berrini Sul',
    tipo: 'HONORARIOS_PARCELA',
    descricao: 'Honorários 1ª Parcela — Retificação Administrativa & Desdobro Gleba',
    valor: 27000.00,
    data_emissao: '2026-08-25',
    data_vencimento: '2026-08-29',
    data_pagamento: '2026-08-29',
    status: 'Pago',
    gateway: 'Banco Inter',
    linha_digitavel: '07790.00228 34000.654321 89000.987654 2 98720002700000',
    codigo_barras: '07792987200027000000022834000654321890009876',
    nosso_numero: '077/2026/000190',
    pix_copia_cola: '00020126580014br.gov.bcb.pix013638491820000155520400005303986540827000.005802BR5925BRASIL LEGAL SOLUCOES6009SAO PAULO62070503***63044E3F',
    multa_percentual: 2.0,
    juros_mensal_percentual: 1.0,
    instrucoes_caixa: [
      'Título Liquidado via compensação Pix D+0.',
      'Autenticação Mecânica / Comprovante Eletrônico de Quitação emitido.'
    ]
  },
  {
    id: 'bol-1003',
    contact_id: 'ct-104',
    contact_nome: 'Helena Beatriz Prado',
    contact_cpf_cnpj: '342.118.990-21',
    contact_email: 'helena.prado@outlook.com',
    contact_telefone: '(19) 99881-3311',
    contact_endereco: {
      logradouro: 'Rua General Osório',
      numero: '920',
      bairro: 'Centro',
      cidade: 'Sorocaba',
      uf: 'SP',
      cep: '18010-120'
    },
    deal_id: 'deal-03',
    deal_titulo: 'Usucapião Extrajudicial — Chácara Sorocaba',
    tipo: 'EMOLUMENTOS_CARTORIO',
    descricao: 'Adiantamento de Emolumentos Cartorários e Prenotação (1º RI Sorocaba)',
    valor: 1450.00,
    data_emissao: '2026-09-01',
    data_vencimento: '2026-09-10',
    status: 'Pendente',
    gateway: 'Iugu',
    linha_digitavel: '33690.00118 45000.789123 12000.456789 3 98780000145000',
    codigo_barras: '33693987800001450000011845000789123120004567',
    nosso_numero: '336/2026/000205',
    pix_copia_cola: '00020126580014br.gov.bcb.pix01363849182000015552040000530398654071450.005802BR5925BRASIL LEGAL SOLUCOES6009SAO PAULO62070503***63048B9A',
    multa_percentual: 2.0,
    juros_mensal_percentual: 1.0,
    instrucoes_caixa: [
      'Cobrança referente a taxas de prenoação registral.',
      'Compensação imediata via Pix integrada ao sistema cartorário.'
    ]
  }
];

// ============================================================
// PARCEIROS INDICADORES B2B (SEM SIGLA RBAC - COM PIX E LOGIN/SENHA)
// Tipos: Arquitetos, Engenheiros, Corretores, Imobiliarias, Amigos, Advogados, Servidor Publico, Outros
// Percentual livre caso a caso
// ============================================================
export const initialParceirosB2B: ParceiroB2B[] = [
  {
    id: 'PARC-B2B-88',
    nome: 'Carlos Mendes Imóveis',
    tipo: 'Imobiliarias',
    email_login: 'carlos.corretor@mendesimoveis.com.br',
    senha: 'mendes2026!',
    telefone: '(11) 98765-4321',
    cpf_cnpj: '18.912.450/0001-90',
    registro_profissional: 'CRECI 148.910-J',
    percentual_comissao: 5.0, // 5% negociado
    chave_pix: '11987654321',
    tipo_chave_pix: 'Telefone',
    banco_titular: 'Banco Itaú Unibanco (341)',
    ativo: true,
    data_cadastro: '2026-06-15',
    total_indicacoes: 14,
    total_comissoes_geradas: 23450.00,
    observacoes: 'Parceiro imobiliário atuante na zona leste e grande SP com alto fluxo de imóveis herdados.'
  },
  {
    id: 'PARC-B2B-12',
    nome: 'Dra. Renata Vasconcellos & Associados',
    tipo: 'Advogados',
    email_login: 'renata.adv@vasconcellos.com.br',
    senha: 'renata2026@law',
    telefone: '(11) 99876-1122',
    cpf_cnpj: '24.118.902/0001-44',
    registro_profissional: 'OAB/SP 412.300',
    percentual_comissao: 7.5, // 7.5% negociado
    chave_pix: 'renata.adv@vasconcellos.com.br',
    tipo_chave_pix: 'Email',
    banco_titular: 'Banco Bradesco (237)',
    ativo: true,
    data_cadastro: '2026-07-02',
    total_indicacoes: 8,
    total_comissoes_geradas: 18200.00,
    observacoes: 'Escritório de direito de família. Encaminha clientes de inventários com pendências registrais.'
  },
  {
    id: 'PARC-B2B-44',
    nome: 'Eng. Marcelo Vianna & Arq. Paula',
    tipo: 'Engenheiros',
    email_login: 'marcelo.eng@creasp.org.br',
    senha: 'engenharia2026',
    telefone: '(19) 97123-5566',
    cpf_cnpj: '142.889.108-33',
    registro_profissional: 'CREA 506.912-D',
    percentual_comissao: 6.0, // 6% negociado
    chave_pix: '142.889.108-33',
    tipo_chave_pix: 'CPF',
    banco_titular: 'Banco do Brasil (001)',
    ativo: true,
    data_cadastro: '2026-07-20',
    total_indicacoes: 11,
    total_comissoes_geradas: 15400.00,
    observacoes: 'Engenheiro e topógrafo em Campinas. Parceria com permuta de levantamentos e memoriais.'
  },
  {
    id: 'PARC-B2B-33',
    nome: 'Juliana Siqueira Arquitetura',
    tipo: 'Arquitetos',
    email_login: 'juliana@siqueiraarq.com.br',
    senha: 'arqjuliana26',
    telefone: '(11) 99344-7788',
    cpf_cnpj: '329.814.708-22',
    registro_profissional: 'CAU A128.455-9',
    percentual_comissao: 8.0, // 8% negociado
    chave_pix: '329.814.708-22',
    tipo_chave_pix: 'CPF',
    banco_titular: 'Nubank (260)',
    ativo: true,
    data_cadastro: '2026-08-01',
    total_indicacoes: 5,
    total_comissoes_geradas: 9800.00,
    observacoes: 'Atua em projetos de reforma e desdobro em loteamentos consolidados.'
  },
  {
    id: 'PARC-B2B-77',
    nome: 'Lucas Almeida (Indicação Pessoal)',
    tipo: 'Amigos',
    email_login: 'lucas.amigo@gmail.com',
    senha: 'amigo123!lucas',
    telefone: '(11) 98112-3344',
    cpf_cnpj: '401.992.118-05',
    percentual_comissao: 10.0, // 10% acordado para amigos próximos
    chave_pix: 'lucas.amigo@gmail.com',
    tipo_chave_pix: 'Email',
    banco_titular: 'Inter (077)',
    ativo: true,
    data_cadastro: '2026-08-10',
    total_indicacoes: 3,
    total_comissoes_geradas: 5200.00,
    observacoes: 'Indica vizinhos e conhecidos com lotes e casas antigas sem escritura.'
  },
  {
    id: 'PARC-B2B-90',
    nome: 'Dr. Marcos Valério (Oficial Substituto)',
    tipo: 'Servidor Publico',
    email_login: 'marcos.cartorio@gmail.com',
    senha: 'cartorio2026marcos',
    telefone: '(19) 98877-4411',
    cpf_cnpj: '189.441.229-50',
    percentual_comissao: 5.0,
    chave_pix: 'e927c9b8-410a-4811-9a74-d4b9981290fa',
    tipo_chave_pix: 'Chave_Aleatoria',
    banco_titular: 'Caixa Econômica (104)',
    ativo: true,
    data_cadastro: '2026-08-18',
    total_indicacoes: 2,
    total_comissoes_geradas: 2400.00,
    observacoes: 'Orienta requerentes com dúvidas de regularização que procuram o balcão.'
  }
];

// ============================================================
// WHATSAPP MULTI-ATENDIMENTO (ESTILO WHATICKET COM IA DE PRÉ-QUALIFICAÇÃO)
// ============================================================
export const initialOmnichannelConfig: OmnichannelConfig = {
  canais: {
    WhatsApp: {
      canal: 'WhatsApp',
      nome_canal: 'WhatsApp Business Cloud API / QR',
      ativo: true,
      status_conexao: 'Conectado',
      identificador: '+55 11 99864-2424',
      tom_de_voz: 'Ágil, Comercial & Direto',
      diretrizes_prompt: 'Atendimento ágil via WhatsApp. Responda em parágrafos concisos de 2 a 3 linhas. Use emojis pontuais (1 ou 2 por mensagem). Conduza o roteiro de 5 perguntas de qualificação registral (posse mansa, documento existente, IPTU em dia, benfeitorias, município). Nunca prometa prazos exatos de cartório nem estipule honorários finais; convide para agendamento com especialista após diagnosticar viabilidade.',
      mensagem_saudacao: 'Olá! Bem-vindo à Brasil Legal Regularização Imobiliária. Sou o Assistente IA de Triagem Registral. Gostaria de fazer 5 perguntas rápidas para verificar se o seu imóvel tem viabilidade de regularização em cartório?',
      auto_resposta_ativa: true,
      encaminhar_apos_qualificacao: true,
      score_minimo_transbordo: 75
    },
    Webchat: {
      canal: 'Webchat',
      nome_canal: 'Webchat Widget do Portal de Vendas',
      ativo: true,
      status_conexao: 'Online',
      identificador: 'widget_site_oficial_v1',
      tom_de_voz: 'Consultivo & Técnico Especialista',
      diretrizes_prompt: 'Atendimento consultivo e didático para visitantes da landing page. Explique de forma clara as diferenças entre Usucapião Extrajudicial (Provimento 65 CNJ), Adjudicação Compulsória e Regularização de Posse. Demonstre autoridade técnica, faça o pré-diagnóstico do imóvel e solicite o WhatsApp ou telefone do visitante para envio do parecer preliminar.',
      mensagem_saudacao: 'Olá! Está buscando regularizar a escritura definitiva do seu imóvel? Estou online para analisar a viabilidade do seu caso em tempo real e tirar suas dúvidas.',
      auto_resposta_ativa: true,
      encaminhar_apos_qualificacao: true,
      score_minimo_transbordo: 70
    },
    Email: {
      canal: 'Email',
      nome_canal: 'Gateway de E-mail Corporativo Triagem',
      ativo: true,
      status_conexao: 'Online',
      identificador: 'triagem@brasillegalimoveis.com.br',
      tom_de_voz: 'Formal & Jurídico Registral',
      diretrizes_prompt: 'Comunicação jurídica formal e protocolar. Inicie sempre com "Prezado(a) Senhor(a)". Estruture as orientações em tópicos claros (Documentação Inicial Necessária, Requisitos de Legitimidade da Posse, Próximos Passos). Solicite o envio digitalizado do contrato de compra e venda e certidões imobiliárias. Finalize com assinatura institucional do Núcleo de Análise Registral da Brasil Legal.',
      mensagem_saudacao: 'Prezado(a), acusamos o recebimento de sua solicitação de diagnóstico imobiliário. Para que nossa assessoria registral realize a triagem preliminar de viabilidade, solicitamos a gentileza de responder às perguntas a seguir.',
      auto_resposta_ativa: true,
      encaminhar_apos_qualificacao: true,
      score_minimo_transbordo: 80
    }
  },
  modelo_ia: 'gemini-2.5-flash',
  notificar_humano_novo_lead: true,
  trocar_tag_automatica: true
};

export const initialInstanciaWhatsApp: InstanciaWhatsAppConfig = {
  id: 'inst-01',
  nome_instancia: 'WhatsApp Comercial & Jurídico Brasil Legal',
  numero_vinculado: '+55 11 99864-2424',
  status: 'Conectado',
  bateria_percentual: 96,
  webhook_url: 'https://brasillegalimoveis.com.br/api/whatsapp/webhook',
  auto_resposta_ia: true,
  mensagem_saudacao: 'Olá! Bem-vindo à Brasil Legal Regularização Imobiliária. Nosso assistente inteligente vai fazer algumas perguntas rápidas para checar a viabilidade do seu imóvel e transferir você ao nosso especialista.',
  filas_habilitadas: [
    'Triagem Comercial (SDR)',
    'Jurídico & Regularização',
    'Engenharia & Topografia',
    'Financeiro & Boletos'
  ]
};

export const initialConversasWhatsApp: ConversaWhatsApp[] = [
  {
    id: 'chat-01',
    canal: 'WhatsApp',
    canal_origem_detalhe: 'WhatsApp API (+55 11 99864-2424)',
    cliente_nome: 'Geraldo Peçanha',
    cliente_numero: '+55 11 97452-9910',
    cliente_cidade_uf: 'Campinas / SP',
    foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    fila: 'Triagem Comercial (SDR)',
    status: 'Em_Atendimento',
    atendente_id: 'usr-sdr-1',
    atendente_nome: 'Lucas Sales (SDR)',
    ultima_mensagem: 'Perfeito Sr. Geraldo! A IA calculou 94% de viabilidade para Usucapião Extrajudicial no 2º Cartório de Campinas.',
    ultima_mensagem_hora: '10:42',
    mensagens_nao_lidas: 0,
    tags: ['Atendimento Humano', 'Usucapião', 'Contrato de Gaveta', 'Viabilidade 94%'],
    ia_agente_ativo: false,
    ia_qualificacao: {
      etapa_atual: 5,
      concluida: true,
      tem_escritura_ou_posse: 'Contrato de Gaveta / Posse',
      tempo_posse_anos: '19 anos ininterruptos (desde 2007)',
      tem_iptu: 'Sim, no meu nome',
      construcao_averbada: 'Não averbada / Precisa regularizar',
      tipo_e_local: 'Casa térrea de alvenaria em Campinas/SP (Jd. Alvorada)',
      score_viabilidade_percentual: 94,
      servico_sugerido: 'Usucapião Extrajudicial (Provimento 65 CNJ)',
      parecer_resumo: 'Atende com excelência os requisitos do Art. 216-A da LRP. Posse superior a 15 anos comprovada por IPTU em nome próprio e contrato de gaveta original com firmas reconhecidas.',
      gerou_lead_crm: true
    },
    notas_internas: [
      'Cliente muito cooperativo. Possui cópia do contrato de 2007 e carnês de IPTU guardados desde 2010.',
      'SDR já enviou link de agendamento presencial com a Dra. Vanessa.'
    ],
    mensagens: [
      {
        id: 'msg-101',
        remetente: 'cliente',
        autor_nome: 'Geraldo Peçanha',
        conteudo: 'Olá, bom dia! Vi o site de vocês sobre regularização de imóvel sem processo judicial. Queria saber se meu caso tem jeito.',
        timestamp: '10:30',
        status: 'lida',
        tipo: 'texto'
      },
      {
        id: 'msg-102',
        remetente: 'ia_agente',
        autor_nome: 'Agente IA Brasil Legal (WhatsApp)',
        conteudo: 'Olá, Geraldo! Seja muito bem-vindo à Brasil Legal. Sou o Assistente Inteligente de Triagem Registral. Vou fazer 5 perguntas rápidas para checar a viabilidade do seu caso:\n\n1️⃣ Você possui escritura definitiva registrada em Cartório de Imóveis, ou seu documento é Contrato de Gaveta / Posse / Cessão?',
        timestamp: '10:30',
        status: 'lida',
        tipo: 'texto'
      },
      {
        id: 'msg-103',
        remetente: 'cliente',
        autor_nome: 'Geraldo Peçanha',
        conteudo: 'É contrato de gaveta particular de compra e venda feito em 2007 no cartório com firma reconhecida na época.',
        timestamp: '10:32',
        status: 'lida',
        tipo: 'texto'
      },
      {
        id: 'msg-104',
        remetente: 'ia_agente',
        autor_nome: 'Agente IA Brasil Legal (WhatsApp)',
        conteudo: 'Excelente, contrato com firma reconhecida de 2007 é um fortíssimo indício de Justo Título!\n\n2️⃣ Há quantos anos você ou sua família estão na posse mansa e ininterrupta do imóvel?',
        timestamp: '10:32',
        status: 'lida',
        tipo: 'texto'
      },
      {
        id: 'msg-105',
        remetente: 'cliente',
        autor_nome: 'Geraldo Peçanha',
        conteudo: 'Já faz 19 anos, moro lá desde maio de 2007 sem interrupção nem litígio com ninguém.',
        timestamp: '10:34',
        status: 'lida',
        tipo: 'texto'
      },
      {
        id: 'msg-106',
        remetente: 'ia_agente',
        autor_nome: 'Agente IA Brasil Legal (WhatsApp)',
        conteudo: '3️⃣ O carnê de IPTU municipal está cadastrado no seu nome ou ainda consta nome de terceiros?',
        timestamp: '10:34',
        status: 'lida',
        tipo: 'texto'
      },
      {
        id: 'msg-107',
        remetente: 'cliente',
        autor_nome: 'Geraldo Peçanha',
        conteudo: 'Está no meu nome na Prefeitura de Campinas há mais de 12 anos, tudo em dia sem débitos.',
        timestamp: '10:36',
        status: 'lida',
        tipo: 'texto'
      },
      {
        id: 'msg-108',
        remetente: 'ia_agente',
        autor_nome: 'Agente IA Brasil Legal (WhatsApp)',
        conteudo: '4️⃣ O imóvel possui casa ou construção? Ela já tem habite-se averbado na matrícula?',
        timestamp: '10:36',
        status: 'lida',
        tipo: 'texto'
      },
      {
        id: 'msg-109',
        remetente: 'cliente',
        autor_nome: 'Geraldo Peçanha',
        conteudo: 'Tem uma casa térrea de 140 metros quadrados que eu mesmo construí aos poucos. Não tem habite-se averbado.',
        timestamp: '10:38',
        status: 'lida',
        tipo: 'texto'
      },
      {
        id: 'msg-110',
        remetente: 'ia_agente',
        autor_nome: 'Agente IA Brasil Legal (WhatsApp)',
        conteudo: '5️⃣ Por fim, qual o município e bairro do imóvel?',
        timestamp: '10:38',
        status: 'lida',
        tipo: 'texto'
      },
      {
        id: 'msg-111',
        remetente: 'cliente',
        autor_nome: 'Geraldo Peçanha',
        conteudo: 'É no Jardim Alvorada em Campinas/SP.',
        timestamp: '10:39',
        status: 'lida',
        tipo: 'texto'
      },
      {
        id: 'msg-112',
        remetente: 'ia_agente',
        autor_nome: 'Agente IA Brasil Legal (WhatsApp)',
        conteudo: '🎯 **ANÁLISE DE PRÉ-QUALIFICAÇÃO CONCLUÍDA:**\n• Score de Viabilidade: **94% (Altíssima Probabilidade)**\n• Procedimento Recomendado: **Usucapião Extrajudicial (Provimento 65 CNJ) + Averbação de Construção**\n• Cartório Competente: 2º Oficial de Registro de Imóveis de Campinas/SP.\n\nEncaminhando agora para nosso atendente humano especialista **Lucas Sales (SDR)** para apresentação da proposta!',
        timestamp: '10:40',
        status: 'lida',
        tipo: 'texto'
      },
      {
        id: 'msg-113',
        remetente: 'atendente',
        autor_nome: 'Lucas Sales (SDR)',
        conteudo: 'Perfeito Sr. Geraldo! A IA calculou 94% de viabilidade para Usucapião Extrajudicial no 2º Cartório de Campinas. Prazer, sou o Lucas e vou cuidar do seu caso!',
        timestamp: '10:42',
        status: 'lida',
        tipo: 'texto'
      }
    ]
  },
  {
    id: 'chat-02',
    canal: 'Webchat',
    canal_origem_detalhe: 'Widget Landing Page (/portal-vendas)',
    cliente_nome: 'Carla Beatriz Mendonça',
    cliente_numero: '+55 11 98334-1122',
    cliente_cidade_uf: 'São Paulo / SP',
    foto_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    fila: 'Triagem Comercial (SDR)',
    status: 'Aguardando',
    ultima_mensagem: 'Gostaria de saber se consigo regularizar a escritura de um apartamento sem o vendedor original.',
    ultima_mensagem_hora: '11:15',
    mensagens_nao_lidas: 1,
    tags: ['Pré-qualificação', 'Adjudicação Compulsória', 'Webchat'],
    ia_agente_ativo: true,
    ia_qualificacao: {
      etapa_atual: 2,
      concluida: false,
      tem_escritura_ou_posse: 'Contrato de Gaveta / Posse',
      tempo_posse_anos: '11 anos',
      score_viabilidade_percentual: 82,
      servico_sugerido: 'Adjudicação Compulsória Extrajudicial (Lei 14.382/22)',
      parecer_resumo: 'Quitou o imóvel integralmente porém a construtora / vendedor faleceu ou encerrou atividades.',
      gerou_lead_crm: false
    },
    notas_internas: [
      'Entrou pelo botão "Diagnóstico Grátis" no site institucional.'
    ],
    mensagens: [
      {
        id: 'msg-201',
        remetente: 'ia_agente',
        autor_nome: 'Assistente IA (Webchat)',
        conteudo: 'Olá Carla! Seja bem-vinda ao atendimento online da Brasil Legal. Sou o especialista virtual de pré-atendimento registral. Como posso ajudar com a documentação do seu imóvel hoje?',
        timestamp: '11:12',
        status: 'lida',
        tipo: 'texto'
      },
      {
        id: 'msg-202',
        remetente: 'cliente',
        autor_nome: 'Carla Beatriz Mendonça',
        conteudo: 'Olá! Gostaria de saber se consigo regularizar a escritura de um apartamento sem o vendedor original. Comprei quitado e ele sumiu.',
        timestamp: '11:15',
        status: 'lida',
        tipo: 'texto'
      }
    ]
  },
  {
    id: 'chat-03',
    canal: 'WhatsApp',
    canal_origem_detalhe: 'WhatsApp API (+55 11 99864-2424)',
    cliente_nome: 'Fernando Rocha',
    cliente_numero: '+55 19 99120-7733',
    cliente_cidade_uf: 'Sorocaba / SP',
    foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    fila: 'Triagem Comercial (SDR)',
    status: 'Aguardando',
    ultima_mensagem: 'Sim, já cerquei, coloquei portão e estou pagando o condomínio há 8 anos certinho.',
    ultima_mensagem_hora: '11:02',
    mensagens_nao_lidas: 1,
    tags: ['Pré-qualificação', 'Loteamento Fechado', 'Desdobro'],
    ia_agente_ativo: true,
    ia_qualificacao: {
      etapa_atual: 2,
      concluida: false,
      tem_escritura_ou_posse: 'Contrato de Gaveta / Posse',
      tempo_posse_anos: '8 anos',
      score_viabilidade_percentual: 88,
      servico_sugerido: 'Desdobro de Lote / Usucapião de Fração Ideal',
      parecer_resumo: 'Aguardando confirmação sobre desmembramento aprovado na Prefeitura de Sorocaba.',
      gerou_lead_crm: false
    },
    notas_internas: [
      'Lead recente originado do anúncio de Meta Ads sobre Chácaras e Lotes.'
    ],
    mensagens: [
      {
        id: 'msg-301',
        remetente: 'cliente',
        autor_nome: 'Fernando Rocha',
        conteudo: 'Boa tarde, comprei um lote de 1.000m² em condomínio fechado em Sorocaba, mas só tenho contrato de compra e venda.',
        timestamp: '11:00',
        status: 'lida',
        tipo: 'texto'
      },
      {
        id: 'msg-302',
        remetente: 'ia_agente',
        autor_nome: 'Agente IA Brasil Legal (WhatsApp)',
        conteudo: 'Olá Fernando! Bem-vindo. Vamos avaliar a viabilidade registral do seu lote em Sorocaba. Você já possui posse física do lote ou iniciou alguma obra?',
        timestamp: '11:01',
        status: 'entregue',
        tipo: 'texto'
      },
      {
        id: 'msg-303',
        remetente: 'cliente',
        autor_nome: 'Fernando Rocha',
        conteudo: 'Sim, já cerquei, coloquei portão e estou pagando o condomínio há 8 anos certinho.',
        timestamp: '11:02',
        status: 'entregue',
        tipo: 'texto'
      }
    ]
  },
  {
    id: 'chat-04',
    canal: 'Email',
    canal_origem_detalhe: 'triagem@brasillegalimoveis.com.br',
    assunto: 'Consulta de Inventário com Herdeiros e Imóvel Sem Registro',
    cliente_nome: 'Dr. Eduardo Vasconcelos',
    cliente_numero: 'eduardo.adv@vasconceloslaw.com.br',
    cliente_cidade_uf: 'Ribeirão Preto / SP',
    foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    fila: 'Jurídico & Regularização',
    status: 'Em_Atendimento',
    atendente_id: 'usr-tec-1',
    atendente_nome: 'Dra. Vanessa Monteiro',
    ultima_mensagem: 'Prezado Colega, recebemos a certidão vintenária do imóvel e estamos elaborando o plano de partilha.',
    ultima_mensagem_hora: '09:50',
    mensagens_nao_lidas: 0,
    tags: ['Atendimento Humano', 'Inventário Extrajudicial', 'E-mail Corporativo'],
    ia_agente_ativo: false,
    ia_qualificacao: {
      etapa_atual: 5,
      concluida: true,
      tem_escritura_ou_posse: 'Cessão Hereditária',
      tempo_posse_anos: '22 anos',
      tem_iptu: 'Sim, no meu nome',
      construcao_averbada: 'Sim, averbada',
      tipo_e_local: 'Fazenda Santa Rita / Ribeirão Preto',
      score_viabilidade_percentual: 95,
      servico_sugerido: 'Inventário Extrajudicial + Georreferenciamento Rural',
      parecer_resumo: 'Herdeiros acordes, sem testamento. Procedimento célere via Tabelionato de Notas de Ribeirão Preto.',
      gerou_lead_crm: true
    },
    notas_internas: [
      'Parceiro B2B advogado solicitando apoio técnico registral.'
    ],
    mensagens: [
      {
        id: 'msg-401',
        remetente: 'cliente',
        autor_nome: 'Dr. Eduardo Vasconcelos',
        conteudo: 'Prezados, envio a certidão da matrícula 45.120 com o formal de partilha antigo pendente de registro. Necessitamos de parecer de retificação.',
        timestamp: '09:20',
        status: 'lida',
        tipo: 'texto'
      },
      {
        id: 'msg-402',
        remetente: 'atendente',
        autor_nome: 'Dra. Vanessa Monteiro',
        conteudo: 'Prezado Colega, recebemos a certidão vintenária do imóvel e estamos elaborando o plano de partilha e requerimento ao cartório.',
        timestamp: '09:50',
        status: 'lida',
        tipo: 'texto'
      }
    ]
  },
  {
    id: 'chat-05',
    canal: 'Webchat',
    canal_origem_detalhe: 'Widget Landing Page (/servicos)',
    cliente_nome: 'Solange Silveira',
    cliente_numero: '+55 11 97118-3344',
    cliente_cidade_uf: 'Santos / SP',
    foto_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    fila: 'Triagem Comercial (SDR)',
    status: 'Aguardando',
    ultima_mensagem: 'Tenho uma casa em Santos que herdei do meu pai, mas ele comprou por recibo em 1998.',
    ultima_mensagem_hora: '11:40',
    mensagens_nao_lidas: 1,
    tags: ['Pré-qualificação', 'Webchat', 'Usucapião Ordinária'],
    ia_agente_ativo: true,
    ia_qualificacao: {
      etapa_atual: 1,
      concluida: false,
      tem_escritura_ou_posse: 'Contrato de Gaveta / Posse',
      tempo_posse_anos: '26 anos',
      score_viabilidade_percentual: 90,
      servico_sugerido: 'Usucapião Extrajudicial com Soma de Posse (Acessio Possessionis)',
      parecer_resumo: 'Posse longeva herdada com justo título. Requisitos plenos para regularização em cartório.',
      gerou_lead_crm: false
    },
    mensagens: [
      {
        id: 'msg-501',
        remetente: 'cliente',
        autor_nome: 'Solange Silveira',
        conteudo: 'Olá, bom dia! Tenho uma casa em Santos que herdei do meu pai, mas ele comprou por recibo em 1998. Gostaria de saber se consigo colocar no meu nome.',
        timestamp: '11:40',
        status: 'entregue',
        tipo: 'texto'
      }
    ]
  }
];

// ==========================================
// CONFIGURAÇÃO INICIAL DO SISTEMA DE SPLITS BANCÁRIOS
// ==========================================
export const initialConfigSplitBancario: ConfigSplitBancario = {
  habilitado: true,
  empresa_razao_social: 'Brasil Legal Soluções Imobiliárias e Registrais Ltda',
  empresa_cnpj: '38.491.820/0001-55',
  empresa_banco: 'Banco Santander (033) / Ag. 4102 / CC 0019283-4',
  empresa_chave_pix: '38.491.820/0001-55',
  empresa_tipo_chave_pix: 'CNPJ',
  empresa_percentual: 50, // 50% para a Empresa Brasil Legal (Caixa PJ / Operacional)
  socios: [
    {
      id: 'socio-1',
      nome: 'Dr. Emerson Carneiro',
      cargo: 'Diretor Geral & Sócio Administrador',
      cpf: '123.456.789-00',
      chave_pix: '123.456.789-00',
      tipo_chave_pix: 'CPF',
      banco: 'Banco Santander (033) - Agência 1205 Conta 48291-0',
      agencia_conta: 'Ag. 1205 / CC 48291-0',
      percentual: 25, // 25% para o Sócio Dr. Emerson Carneiro
      ativo: true,
      email_notificacao: 'atendimento@brasillegal.com.br'
    },
    {
      id: 'socio-2',
      nome: 'Dra. Vanessa Monteiro & Eng. Roberto',
      cargo: 'Sócia Diretora & Coordenação Jurídica/Técnica',
      cpf: '987.654.321-11',
      chave_pix: 'vanessa.juridico@brasillegalimoveis.com.br',
      tipo_chave_pix: 'Email',
      banco: 'Banco Itaú Unibanco (341) - Agência 0912 Conta 33109-8',
      agencia_conta: 'Ag. 0912 / CC 33109-8',
      percentual: 25, // 25% para o Núcleo Técnico/Jurídico
      ativo: true,
      email_notificacao: 'juridico@brasillegalimoveis.com.br'
    }
  ],
  taxa_gateway_quem_paga: 'PROPORCIONAL',
  momento_repasse: 'IMEDIATO_LIQUIDACAO',
  notificar_socios_pix: true,
  notificar_push_desktop: true
};

export const initialRegistrosSplits: RegistroSplitExecutado[] = [
  {
    id: 'split-2026-001',
    cobranca_id: 'bol-002',
    nosso_numero: '033/2026/004819',
    cliente_nome: 'Marcos Vinícius de Andrade',
    cliente_cpf_cnpj: '382.910.482-10',
    deal_titulo: 'Retificação de Área & Desdobro — Fazenda Esperança',
    valor_total_pago: 7500.00,
    tarifa_gateway: 3.49,
    valor_liquido_total: 7496.51,
    data_pagamento: '2026-03-28',
    data_split: '2026-03-28T14:35:10',
    gateway: 'Asaas',
    status: 'Transferido',
    distribuicao: [
      {
        beneficiario_id: 'empresa-pj',
        beneficiario_nome: 'Brasil Legal Soluções Imobiliárias (Conta Operacional PJ)',
        tipo: 'EMPRESA',
        cargo_ou_descricao: 'Caixa da Empresa (50%)',
        percentual: 50,
        valor_bruto: 3750.00,
        taxa_gateway_deduzida: 1.75,
        valor_liquido: 3748.25,
        chave_pix: '38.491.820/0001-55',
        banco: 'Banco Santander (033)',
        status_repasse: 'Transferido',
        autenticacao_bancaria: 'PIX-E0033-20260328-9842109283-PJ'
      },
      {
        beneficiario_id: 'socio-1',
        beneficiario_nome: 'Dr. Eduardo Carneiro',
        tipo: 'SOCIO',
        cargo_ou_descricao: 'Diretor Geral & Sócio (25%)',
        percentual: 25,
        valor_bruto: 1875.00,
        taxa_gateway_deduzida: 0.87,
        valor_liquido: 1874.13,
        chave_pix: '123.456.789-00',
        banco: 'Banco Santander (033)',
        status_repasse: 'Transferido',
        autenticacao_bancaria: 'PIX-E0033-20260328-1182740192-EC'
      },
      {
        beneficiario_id: 'socio-2',
        beneficiario_nome: 'Dra. Vanessa Monteiro & Eng. Roberto',
        tipo: 'SOCIO',
        cargo_ou_descricao: 'Coordenação Jurídica/Técnica (25%)',
        percentual: 25,
        valor_bruto: 1875.00,
        taxa_gateway_deduzida: 0.87,
        valor_liquido: 1874.13,
        chave_pix: 'vanessa.juridico@brasillegalimoveis.com.br',
        banco: 'Banco Itaú (341)',
        status_repasse: 'Transferido',
        autenticacao_bancaria: 'PIX-E0341-20260328-7729183011-VM'
      }
    ]
  }
];

// ==========================================
// CONFIGURAÇÃO INICIAL DE DEPLOY GITHUB & CPANEL (HOMEHOST)
// ==========================================
export const initialConfigGithubCpanel: ConfigIntegracaoGithubCpanel = {
  habilitado: true,
  servidor_provedor: 'HOMEHOST',
  nome_servidor: 'Homehost Cloud (Servidor cPanel)',
  github_repo_url: 'https://github.com/diretorcarneiro/brasil-legal-regularizacao.git',
  github_branch: 'main',
  github_usuario: 'diretorcarneiro',
  github_token_pat: 'ghp_homehost_deploy_token_brasillegal',
  github_webhook_secret: 'hl_sec_cpanel_wh_88192',
  cpanel_url: 'https://cpanel.brasillegalimoveis.com.br:2083',
  cpanel_usuario: 'brasilleg',
  cpanel_token_api: 'cpanel_api_token_brasilleg_sec',
  cpanel_diretorio_deploy: '/home/brasilleg/public_html',
  cpanel_repositorio_path: '/home/brasilleg/repositories/brasil-legal',
  modo_deploy: 'BUILD_ESTATICO_SPA',
  versao_node: '20.x',
  arquivo_inicial_node: 'dist/server.cjs',
  porta_app: 3000,
  webhook_ativo: true,
  webhook_payload_url: 'https://ais-dev-j6ex53jyuleo5ocs7ysosv-858092762556.us-east1.run.app/api/deploy/webhook',
  ultimo_deploy_status: 'SUCESSO',
  ultimo_deploy_data: '08/09/2026 18:42:15',
  ultimo_deploy_commit: 'e79b4a1 - chore: release build com DRE e módulo Homehost',
  ultimo_deploy_log: '[Git Pull] Repositório sincronizado com sucesso a partir da branch main.\n[NPM Build] Arquivos estáticos gerados em dist/.\n[cPanel Deploy] Arquivos sincronizados para /home/brasilleg/public_html/.\n[SSL/Apache] Cache limpo e regras .htaccess atualizadas.',
  historico_logs: [
    {
      id: 'deploy-log-1',
      data_hora: '08/09/2026 18:42:15',
      commit_hash: 'e79b4a1',
      commit_mensagem: 'chore: release build com DRE e módulo Homehost',
      autor: 'Dr. Emerson Carneiro',
      branch: 'main',
      status: 'SUCESSO',
      mensagem: 'Deploy concluído com sucesso em /home/brasilleg/public_html',
      detalhes: '45 arquivos sincronizados. Index.html atualizado. Certificado SSL Let\'s Encrypt ativo.'
    },
    {
      id: 'deploy-log-2',
      data_hora: '05/09/2026 14:10:02',
      commit_hash: '8a12bc9',
      commit_mensagem: 'feat: atualização do catálogo de serviços e cálculo de honorários',
      autor: 'Dr. Emerson Carneiro',
      branch: 'main',
      status: 'SUCESSO',
      mensagem: 'Deploy concluído via GitHub Webhook automático',
      detalhes: 'Trigger automático recebido via push event.'
    }
  ]
};

export const initialAtividades: Atividade[] = [
  {
    id: 'ativ-001',
    titulo: 'Vistoria Técnica com Drone e Levantamento RTK',
    descricao: 'Execução de voo com drone para geração de ortomosaico georreferenciado e levantamento topográfico planialtimétrico cadastral para instrução de usucapião extrajudicial.',
    tipo: 'VISTORIA_TECNICA',
    status: 'PENDENTE',
    prioridade: 'ALTA',
    data_inicio: '2026-09-15',
    hora_inicio: '09:00',
    data_fim: '2026-09-15',
    hora_fim: '12:00',
    local: 'Rua das Palmeiras, 1420 - Chácara Boa Vista, Sorocaba/SP',
    link_meet: '',
    cliente_id: 'c1',
    cliente_nome: 'Maria Aparecida da Silva',
    deal_id: 'd1',
    deal_titulo: 'Usucapião Extrajudicial - Jardim Esperança',
    responsavel_id: 'u2',
    responsavel_nome: 'Eng. Lucas Mendonça',
    criado_em: '2026-09-12T10:00:00Z',
    notificar_minutos_antes: 60,
    sincronizado_google: true
  },
  {
    id: 'ativ-002',
    titulo: 'Diligência no 1º Cartório de Registro de Imóveis (Prenotação)',
    descricao: 'Protocolar memorial descritivo assinado pelo responsável técnico e certidões vintenárias perante o oficial registrador de imóveis.',
    tipo: 'DILIGENCIA_CARTORIO',
    status: 'PENDENTE',
    prioridade: 'URGENTE',
    data_inicio: '2026-09-16',
    hora_inicio: '14:30',
    data_fim: '2026-09-16',
    hora_fim: '16:00',
    local: '1º Oficial de Registro de Imóveis - Praça da Sé, 380, Centro',
    link_meet: '',
    cliente_id: 'c2',
    cliente_nome: 'João Batista de Oliveira',
    deal_id: 'd2',
    deal_titulo: 'Desmembramento e Regularização de Lote Urbano',
    responsavel_id: 'u1',
    responsavel_nome: 'Dr. Emerson Carneiro',
    criado_em: '2026-09-13T11:20:00Z',
    notificar_minutos_antes: 30,
    sincronizado_google: true
  },
  {
    id: 'ativ-003',
    titulo: 'Reunião de Alinhamento de Minuta com Herdeiros e Confrontantes',
    descricao: 'Alinhamento virtual dos termos da declaração de anuência dos confinantes e apresentação do parecer técnico de viabilidade registral.',
    tipo: 'REUNIAO',
    status: 'PENDENTE',
    prioridade: 'MEDIA',
    data_inicio: '2026-09-17',
    hora_inicio: '10:00',
    data_fim: '2026-09-17',
    hora_fim: '11:00',
    local: 'Google Meet (Sala Brasil Legal)',
    link_meet: 'https://meet.google.com/blg-imob-reun',
    cliente_id: 'c3',
    cliente_nome: 'Carlos Eduardo Pereira',
    deal_id: 'd3',
    deal_titulo: 'Inventário Extrajudicial com Adjudicação de Fração Ideal',
    responsavel_id: 'u1',
    responsavel_nome: 'Dr. Emerson Carneiro',
    criado_em: '2026-09-14T08:15:00Z',
    notificar_minutos_antes: 15,
    sincronizado_google: true
  },
  {
    id: 'ativ-004',
    titulo: 'Prazo Limite para Resposta de Nota Devolutiva Cartorária',
    descricao: 'Data fatal para atendimento das exigências formuladas na nota de devolução da matrícula 48.219 (retificação de confrontações e averbação de CND).',
    tipo: 'PRAZO_PROCESSUAL',
    status: 'EM_ANDAMENTO',
    prioridade: 'URGENTE',
    data_inicio: '2026-09-18',
    hora_inicio: '17:00',
    data_fim: '2026-09-18',
    hora_fim: '18:00',
    local: 'Protocolo Eletrônico ONR / SAEC',
    link_meet: '',
    cliente_id: 'c1',
    cliente_nome: 'Maria Aparecida da Silva',
    deal_id: 'd1',
    deal_titulo: 'Usucapião Extrajudicial - Jardim Esperança',
    responsavel_id: 'u2',
    responsavel_nome: 'Eng. Lucas Mendonça',
    criado_em: '2026-09-10T15:00:00Z',
    notificar_minutos_antes: 120,
    sincronizado_google: true
  },
  {
    id: 'ativ-005',
    titulo: 'Assinatura Digital de Contrato de Honorários e Procuração',
    descricao: 'Coleta de assinatura eletrônica qualificada ICP-Brasil ou token ZapSign para início imediato do processo de adjudicação compulsória.',
    tipo: 'ASSINATURA_CONTRATO',
    status: 'CONCLUIDA',
    prioridade: 'ALTA',
    data_inicio: '2026-09-14',
    hora_inicio: '11:00',
    data_fim: '2026-09-14',
    hora_fim: '11:30',
    local: 'Portal de Assinaturas Brasil Legal',
    link_meet: '',
    cliente_id: 'c2',
    cliente_nome: 'João Batista de Oliveira',
    deal_id: 'd2',
    deal_titulo: 'Desmembramento e Regularização de Lote Urbano',
    responsavel_id: 'u3',
    responsavel_nome: 'Fernanda Lima (SDR)',
    criado_em: '2026-09-14T09:00:00Z',
    notificar_minutos_antes: 30,
    sincronizado_google: false
  }
];

export const initialFluxosEmailMarketing: FluxoEmailMarketing[] = [
  {
    id: 'fluxo-1',
    numero: 1,
    badge: 'BOAS VINDAS',
    titulo: 'Fluxo 1 — Boas-Vindas & Apresentação Institucional',
    subtitulo: '"Olá {{nome_cliente}}, recebemos seu pedido na Brasil..."',
    assunto: 'Olá {{nome_cliente}}, recebemos seu pedido na Brasil Legal!',
    ativo: true,
    envios_total: 148,
    aberturas_total: 112,
    cliques_total: 64,
    gatilho: 'BOAS_VINDAS',
    corpo_html: `<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="background-color: #2E3192; padding: 28px 20px; text-align: center;">
    <h1 style="color: #F2EC00; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 0.5px;">BRASIL LEGAL</h1>
    <p style="color: #ffffff; margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Inteligência Imobiliária & Regularização de Ativos</p>
  </div>
  <div style="padding: 32px 24px;">
    <p style="font-size: 16px; font-weight: bold; margin-bottom: 16px;">Prezado(a) {{nome_cliente}},</p>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 14px;">
      Seja muito bem-vindo(a) à Brasil Legal. Recebemos seu interesse na regularização do seu imóvel localizado em <strong>{{cidade}}</strong>.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 24px;">
      Nosso compromisso é destravar o valor total do seu patrimônio com a máxima segurança jurídica e velocidade cartorária.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{link_portal_cliente}}" style="background-color: #2E3192; color: #ffffff; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block;">Acessar Portal do Cliente</a>
    </div>
    <p style="font-size: 13px; color: #64748b; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
      Nossa equipe técnica já está com o caso aberto. Qualquer dúvida, responda diretamente este e-mail ou acione nosso WhatsApp.
    </p>
  </div>
</div>`
  },
  {
    id: 'fluxo-2',
    numero: 2,
    badge: 'CONFIRMACAO DOCUMENTOS',
    titulo: 'Fluxo 2 — Triagem e Confirmação de Documentos (MQL)',
    subtitulo: '"Custódia Documental Iniciada: Envio de Documentos..."',
    assunto: 'Custódia Documental Iniciada: Confirmação de Recebimento de Documentos — {{nome_cliente}}',
    ativo: true,
    envios_total: 92,
    aberturas_total: 81,
    cliques_total: 58,
    gatilho: 'CUSTODIA_DOCUMENTOS',
    corpo_html: `<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="background-color: #2E3192; padding: 28px 20px; text-align: center;">
    <h1 style="color: #F2EC00; margin: 0; font-size: 24px; font-weight: 900;">BRASIL LEGAL</h1>
    <p style="color: #ffffff; margin: 6px 0 0 0; font-size: 13px;">Custódia Segura & Auditoria Notarial</p>
  </div>
  <div style="padding: 32px 24px;">
    <p style="font-size: 16px; font-weight: bold; margin-bottom: 16px;">Olá, {{nome_cliente}}!</p>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 14px;">
      Seus documentos relativos ao imóvel em <strong>{{cidade}}</strong> foram recebidos com sucesso e já estão sob <strong>custódia criptografada segura</strong>.
    </p>
    <div style="background-color: #f8fafc; border-left: 4px solid #2E3192; padding: 14px; margin: 20px 0; border-radius: 0 6px 6px 0;">
      <p style="margin: 0; font-size: 13px; color: #334155;"><strong>Status da Custódia:</strong> {{status_imovel}}</p>
      <p style="margin: 6px 0 0 0; font-size: 12px; color: #64748b;">Protocolo Notarial Blindado em Conformidade com a LGPD e Provimento 65/CNJ.</p>
    </div>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{{link_custodia}}" style="background-color: #2E3192; color: #ffffff; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block;">Ver Comprovante de Custódia</a>
    </div>
    <p style="font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 16px;">
      Nossa Inteligência Registral já está processando a matrícula e confrontações para gerar seu diagnóstico prévio.
    </p>
  </div>
</div>`
  },
  {
    id: 'fluxo-3',
    numero: 3,
    badge: 'PROPOSTA ENVIADA',
    titulo: 'Fluxo 3 — Envio de Proposta & Diagnóstico Express',
    subtitulo: '"Diagnóstico Técnico & Proposta de Regularização..."',
    assunto: 'Diagnóstico Técnico & Proposta de Regularização Definitiva — {{nome_cliente}}',
    ativo: true,
    envios_total: 67,
    aberturas_total: 59,
    cliques_total: 42,
    gatilho: 'PROPOSTA_ENVIADA',
    corpo_html: `<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="background-color: #2E3192; padding: 28px 20px; text-align: center;">
    <h1 style="color: #F2EC00; margin: 0; font-size: 24px; font-weight: 900;">BRASIL LEGAL</h1>
    <p style="color: #ffffff; margin: 6px 0 0 0; font-size: 13px;">Solução Jurídica Definitiva</p>
  </div>
  <div style="padding: 32px 24px;">
    <p style="font-size: 16px; font-weight: bold; margin-bottom: 16px;">Prezado(a) {{nome_cliente}},</p>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 16px;">
      Concluímos a montagem do plano técnico de regularização para o seu imóvel em <strong>{{cidade}}</strong>.
    </p>
    <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 1px solid #86efac; border-radius: 8px; padding: 18px; margin: 20px 0; text-align: center;">
      <span style="font-size: 12px; color: #166534; font-weight: bold; text-transform: uppercase;">Investimento Estimado de Honorários</span>
      <h2 style="font-size: 28px; color: #15803d; margin: 6px 0; font-weight: 900;">{{valor_proposta}}</h2>
      <p style="font-size: 12px; color: #166534; margin: 0;">Opções facilitadas via Boleto Bancário, Cartão ou Pix com Split Notarial.</p>
    </div>
    <div style="text-align: center; margin: 26px 0;">
      <a href="{{link_portal_cliente}}" style="background-color: #2E3192; color: #ffffff; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block;">Aprovar Proposta e Iniciar Procedimento</a>
    </div>
    <p style="font-size: 13px; color: #64748b;">
      Esta proposta contempla toda a assessoria cartorária até a expedição da Matrícula Definitiva no Registro Geral de Imóveis (RGI).
    </p>
  </div>
</div>`
  },
  {
    id: 'fluxo-4',
    numero: 4,
    badge: 'ACOMPANHAMENTO',
    titulo: 'Fluxo 4 — Acompanhamento e Notificação de Exigência Cartorária',
    subtitulo: '"Atualização da Esteira Técnica: Nota de Andamento..."',
    assunto: 'Atualização da Esteira Registral: Notificação de Andamento Cartorário',
    ativo: true,
    envios_total: 110,
    aberturas_total: 98,
    cliques_total: 51,
    gatilho: 'ACOMPANHAMENTO_CARTORARIO',
    corpo_html: `<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="background-color: #2E3192; padding: 28px 20px; text-align: center;">
    <h1 style="color: #F2EC00; margin: 0; font-size: 24px; font-weight: 900;">BRASIL LEGAL</h1>
    <p style="color: #ffffff; margin: 6px 0 0 0; font-size: 13px;">Acompanhamento da Esteira Cartorária</p>
  </div>
  <div style="padding: 32px 24px;">
    <p style="font-size: 16px; font-weight: bold; margin-bottom: 16px;">Prezado(a) {{nome_cliente}},</p>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 14px;">
      Temos uma nova atualização sobre o andamento do seu processo de regularização imobiliária em <strong>{{cidade}}</strong>.
    </p>
    <div style="background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <strong style="color: #854d0e; font-size: 13px; display: block; margin-bottom: 4px;">Última Movimentação:</strong>
      <p style="color: #713f12; font-size: 13px; margin: 0; line-height: 1.5;">{{status_imovel}}</p>
    </div>
    <div style="text-align: center; margin: 26px 0;">
      <a href="{{link_portal_cliente}}" style="background-color: #2E3192; color: #ffffff; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block;">Ver Detalhes no Portal do Cliente</a>
    </div>
    <p style="font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 16px;">
      Nossos engenheiros e advogados continuam acompanhando os prazos diretamente junto ao Ofício de Registro de Imóveis.
    </p>
  </div>
</div>`
  },
  {
    id: 'fluxo-5',
    numero: 5,
    badge: 'DIAGNOSTICO IA',
    titulo: 'Fluxo 5 — Diagnóstico Prévio da IA & Parecer Registral',
    subtitulo: '"Análise de Inteligência Artificial Concluída: Raio-X e Custódia..."',
    assunto: 'Seu Diagnóstico Inteligente está Pronto! Parecer Prévio dos Documentos em Custódia — {{nome_cliente}}',
    ativo: true,
    envios_total: 155,
    aberturas_total: 142,
    cliques_total: 119,
    gatilho: 'DIAGNOSTICO_IA_CONCLUIDO',
    corpo_html: `<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
  <div style="background-color: #2E3192; padding: 28px 20px; text-align: center;">
    <h1 style="color: #F2EC00; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 0.5px;">BRASIL LEGAL</h1>
    <p style="color: #ffffff; margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Inteligência Notarial & Diagnóstico Registral Prévio</p>
  </div>
  <div style="padding: 32px 24px;">
    <div style="display: inline-block; background-color: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; margin-bottom: 14px;">
      🤖 DIAGNÓSTICO PRÉVIO VIA INTELIGÊNCIA ARTIFICIAL REGISTRAL
    </div>
    <p style="font-size: 16px; font-weight: bold; margin-bottom: 14px;">Prezado(a) {{nome_cliente}},</p>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 14px;">
      Nossa Inteligência Notarial concluiu a análise técnica prévia dos documentos mantidos em <strong>custódia digital criptografada</strong> referentes ao seu imóvel em <strong>{{cidade}}</strong>.
    </p>

    <!-- Caixa de Destaque do Parecer da IA -->
    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px; margin: 20px 0;">
      <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #1e293b; font-weight: bold;">
        📋 Resumo do Parecer Prévio Emitido:
      </h3>
      <p style="font-size: 13px; line-height: 1.6; color: #475569; margin: 0;">
        {{parecer_ia}}
      </p>
      <div style="margin-top: 12px; padding-top: 10px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #64748b;">
        <strong>Enquadramento Sugerido:</strong> Provimento nº 65/CNJ e Art. 216-A da Lei 6.015/73.
      </div>
    </div>

    <!-- Botão de Ação Seguro -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{link_custodia}}" style="background-color: #2E3192; color: #ffffff; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(46, 49, 146, 0.2);">
        Acessar Parecer Completo & Custódia Segura
      </a>
    </div>

    <p style="font-size: 12px; color: #64748b; line-height: 1.5; background: #f1f5f9; padding: 12px; border-radius: 6px;">
      🔒 <strong>Garantia de Custódia:</strong> Todos os arquivos e certidões recebidos estão salvaguardados com chave hash SHA-256 e visualização auditada.
    </p>
  </div>
</div>`
  }
];

export const initialConfigEmailMarketing: ConfigEmailMarketing = {
  remetente_nome: 'Brasil Legal - Atendimento',
  remetente_email: 'atendimento@brasillegal.com.br',
  servidor_smtp: 'smtp.brasillegal.com.br',
  porta_smtp: 587,
  disparar_apos_diagnostico_ia: true,
  notificar_push_ao_enviar: true,
  notificar_push_ao_abrir: true,
  link_custodia_padrao: 'https://brasillegal.com.br/portal/custodia/'
};

export const initialEnviosEmailLog: EnvioEmailLog[] = [
  {
    id: 'log-101',
    fluxo_id: 'fluxo-5',
    fluxo_nome: 'Fluxo 5 — Diagnóstico Prévio da IA & Parecer Registral',
    destinatario_nome: 'Carlos Eduardo Souza Prado',
    destinatario_email: 'carlos.prado@gmail.com',
    assunto: 'Seu Diagnóstico Inteligente está Pronto! Parecer Prévio dos Documentos em Custódia — Carlos Eduardo Souza Prado',
    corpo_renderizado: 'Diagnóstico prévio concluído com viabilidade favorável de 94% para Usucapião Extrajudicial.',
    data_envio: '2026-09-14 10:20',
    status: 'ABERTO',
    aberto_em: '2026-09-14 10:28',
    clicado_em: '2026-09-14 10:30',
    origem_gatilho: 'Diagnóstico Prévio da IA',
    cliente_id: 'ct-101',
    deal_id: 'deal-01',
    link_custodia: 'https://brasillegal.com.br/portal/custodia/deal-01'
  },
  {
    id: 'log-102',
    fluxo_id: 'fluxo-1',
    fluxo_nome: 'Fluxo 1 — Boas-Vindas & Apresentação Institucional',
    destinatario_nome: 'Carlos Eduardo Souza Prado',
    destinatario_email: 'carlos.prado@gmail.com',
    assunto: 'Olá Carlos Eduardo Souza Prado, recebemos seu pedido na Brasil Legal!',
    corpo_renderizado: 'Seja muito bem-vindo(a) à Brasil Legal...',
    data_envio: '2026-09-14 09:15',
    status: 'CLICADO',
    aberto_em: '2026-09-14 09:18',
    clicado_em: '2026-09-14 09:20',
    origem_gatilho: 'Entrada de Lead no Funil Comercial'
  },
  {
    id: 'log-103',
    fluxo_id: 'fluxo-2',
    fluxo_nome: 'Fluxo 2 — Triagem e Confirmação de Documentos (MQL)',
    destinatario_nome: 'Maria Aparecida da Silva',
    destinatario_email: 'maria.aparecida@outlook.com',
    assunto: 'Custódia Documental Iniciada: Confirmação de Recebimento de Documentos — Maria Aparecida da Silva',
    corpo_renderizado: 'Seus documentos relativos ao imóvel em Campinas foram recebidos com sucesso...',
    data_envio: '2026-09-13 16:40',
    status: 'ENTREGUE',
    origem_gatilho: 'Upload de Documentos na Custódia'
  },
  {
    id: 'log-104',
    fluxo_id: 'fluxo-5',
    fluxo_nome: 'Fluxo 5 — Diagnóstico Prévio da IA & Parecer Registral',
    destinatario_nome: 'João Batista de Oliveira',
    destinatario_email: 'joao.batista@uol.com.br',
    assunto: 'Seu Diagnóstico Inteligente está Pronto! Parecer Prévio dos Documentos em Custódia — João Batista de Oliveira',
    corpo_renderizado: 'Diagnóstico prévio concluído com viabilidade para Desmembramento e Adjudicação Compulsória.',
    data_envio: '2026-09-13 14:10',
    status: 'ABERTO',
    aberto_em: '2026-09-13 14:35',
    origem_gatilho: 'Diagnóstico Prévio da IA'
  },
  {
    id: 'log-105',
    fluxo_id: 'fluxo-3',
    fluxo_nome: 'Fluxo 3 — Envio de Proposta & Diagnóstico Express',
    destinatario_nome: 'Luciana Martins Guimarães',
    destinatario_email: 'luciana.martins@empresa.com.br',
    assunto: 'Diagnóstico Técnico & Proposta de Regularização Definitiva — Luciana Martins Guimarães',
    corpo_renderizado: 'Concluímos a montagem do plano técnico de regularização...',
    data_envio: '2026-09-12 11:30',
    status: 'CLICADO',
    aberto_em: '2026-09-12 11:42',
    clicado_em: '2026-09-12 11:45',
    origem_gatilho: 'Proposta Comercial Aprovada pelo SDR'
  }
];





