export type TipoPessoa = 'PF' | 'PJ';

export type StatusCadastro = 'Lead (Novo)' | 'Em Qualificacao' | 'Cliente Ativo' | 'Inativo';

export type OrigemLead = 'Google Ads' | 'Meta Ads' | 'Indique e Ganhe B2B' | 'Site Organico' | 'Balcao' | string;

export type QualificacaoSdr = 
  | 'Lead'
  | 'Qualificado'
  | 'Oportunidade'
  | 'Entrevista'
  | 'Proposta'
  | 'Ganho'
  | 'Perdido'
  | 'Novo'
  | 'Em Triagem'
  | 'MQL (Qualificado)'
  | 'Disqualificado';

export interface Endereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface FollowUpItem {
  id: string;
  data_hora: string;
  autor: string;
  tipo: 'WhatsApp' | 'Ligação' | 'Reunião' | 'E-mail' | 'Visita' | 'Nota Interna';
  conteudo: string;
  status_lead?: QualificacaoSdr;
  proximo_contato?: string;
}

export interface Contact {
  id: string;
  nome_completo: string;
  tipo_pessoa: TipoPessoa;
  cpf_cnpj: string;
  rg_ie?: string;
  telefone_whatsapp: string;
  email?: string;
  status_cadastro: StatusCadastro;
  endereco: Endereco;
  origem_lead?: OrigemLead;
  indicador_id?: string;
  qualificacao_sdr?: QualificacaoSdr;
  tempo_primeira_resposta_minutos?: number;
  created_at?: string;
  tipo_imovel?: string;
  servico_pretendido?: string;
  observacoes?: string;
  valor_estimado?: number;
  valor_honorarios_estimado?: number;
  custodia_liberada?: boolean;
  data_entrevista?: string;
  valor_proposta?: number;
  motivo_perda?: string;
  parecer_previo?: string;
  data_parecer_previo?: string;
  autor_parecer_previo?: string;
  historico_followup?: FollowUpItem[];
  tags?: string[];
}

export type TipoDocumento =
  | 'RG_CPF_CNH'
  | 'Comprovante_Endereco'
  | 'Matricula_Atualizada'
  | 'IPTU'
  | 'Contrato_Gaveta'
  | 'Planta_Topografica'
  | 'ART_RRT'
  | 'Nota_Devolucao';

export type StatusValidacaoDocumento = 'Pendente' | 'Aprovado' | 'Rejeitado_Solicitar_Reenvio';

export interface Documento {
  id: string;
  contact_id: string;
  deal_id?: string;
  cliente_nome?: string;
  tipo_documento: TipoDocumento;
  file_url: string;
  upload_na_qualificacao: boolean;
  status_validacao: StatusValidacaoDocumento;
  nome_arquivo?: string;
  tamanho_bytes?: number;
  data_upload?: string;
  parecer_observacao?: string;
  validado_por?: string;
  ocr_resumo?: string;
}

export type StatusDeal =
  | 'Triagem'
  | 'Auditoria Documental'
  | 'Parecer Técnico/Jurídico'
  | 'Protocolado Cartório/Prefeitura'
  | 'Regularizado / Concluído';

export interface Deal {
  id: string;
  contact_id: string;
  titulo: string;
  cliente_nome?: string;
  cartorio_comarca: string;
  tipo_procedimento: string;
  status: StatusDeal;
  valor_honorarios_liquido: number;
  valor_honorarios?: number;
  parceiro_id?: string;
  comissao_b2b_percentual: number; // Livre caso a caso acordado com o parceiro
  comissao_b2b_valor: number;
  comissao_paga: boolean;
  homologado_diretoria: boolean;
  data_fechamento: string;
  parecer_tecnico?: string;
  responsavel_tecnico?: string;
  historico_followup?: FollowUpItem[];
}

export type CategoriaServico =
  | 'Regularização Fundiária'
  | 'Direito Sucessório / Família'
  | 'Engenharia & Topografia'
  | 'Auditoria & Cartórios'
  | 'Outros';

export interface ServicoCatalogo {
  id: string;
  nome: string;
  categoria?: CategoriaServico | string;
  descricao: string;
  icone: string;
  prazo_medio?: string;
  honorarios_referencia?: number;
  documentos_exigidos?: string[];
  ativo?: boolean;
  exibir_no_site?: boolean;
  exibir_no_sistema?: boolean;
}

export interface PaletaCores {
  primaria: string;
  secundaria: string;
  fundo: string;
}

export interface AppSettings {
  app_name: string;
  app_tagline: string;
  razao_social: string;
  cnpj_empresa: string;
  endereco_empresa?: string;
  logo_header_url: string;
  logo_light_url: string; // Versão para fundos claros (Light Theme)
  logo_dark_url: string;  // Versão para fundos escuros (Dark Theme)
  logo_icon_url: string;  // Ícone / Símbolo isolado
  logo_sidebar_url?: string; // Logo específico do Menu Lateral (Sidebar)
  logo_login_url?: string;   // Logo específico da Tela de Login
  favicon_url: string;    // Favicon do navegador (.ico ou .png)
  cor_primaria: string;   // Cor principal (ex: #2E3192 Azul Profundo)
  cor_secundaria: string; // Cor secundária/acento (ex: #F2EC00 Amarelo Ouro)
  cor_destaque: string;   // Cor de realce/hover
  cor_fundo_painel?: string; // Fundo geral do painel (#F8FAFC)
  cor_texto_principal?: string; // Cor do texto base (#0F172A)
  whatsapp_suporte: string;
  email_suporte: string;
  sla_meta_minutos: number;
  css_customizado_saas: string;
  fonte_titulo?: string; // Ex: 'Plus Jakarta Sans', 'Montserrat', 'Playfair Display', 'Poppins'
  fonte_corpo?: string;  // Ex: 'Inter', 'Roboto', 'Open Sans', 'Lato'
  video_url?: string;    // URL Vídeo institucional / vendas
  video_secundario_url?: string;
  video_poster_url?: string;
  video_url_apresentacao?: string;
  video_depoimento_url?: string;
}

export interface DepoimentoCliente {
  id: string;
  nome: string;
  cidade_uf: string;
  tipo_imovel: string;
  texto: string;
  estrelas: number;
  foto_url: string;
  valorizacao?: string;
  prazo_meses?: number;
}

export interface FaqItem {
  id: string;
  pergunta: string;
  resposta: string;
}

export interface MembroEquipe {
  id: string;
  nome: string;
  cargo: string;
  oab_crea?: string;
  foto_url: string;
  bio?: string;
  email?: string;
  linkedin?: string;
  destaque?: boolean;
}

export interface RedeSocialItem {
  id: string;
  nome: string; // TikTok, Instagram, Facebook, YouTube
  username: string;
  url: string;
  icone: string; // tiktok, instagram, facebook, youtube, etc.
  ordem: number;
  ativo: boolean;
}

export interface VideoItem {
  id: string;
  titulo: string;
  descricao?: string;
  thumbnail?: string;
  url: string;
  categoria: 'Institucional' | 'Regularização' | 'Casos reais' | 'Dúvidas' | 'Depoimentos' | string;
  ordem: number;
  ativo: boolean;
}

export interface CasoRealItem {
  id: string;
  titulo: string;
  cliente_ou_tipo?: string;
  cidade?: string;
  problema: string;
  desafio: string;
  solucao: string;
  resultado: string;
  tempo_meses?: number | string;
  valorizacao_estimada?: string;
  imagem_url?: string;
  ordem: number;
  destaque?: boolean;
  ativo: boolean;
}

export interface RaioXImovelLead {
  problema_principal: string;
  objetivo_pretendido: string;
  cidade: string;
  uf?: string;
  construcao_averbada: 'Sim' | 'Não' | 'Não sei' | string;
  nome: string;
  whatsapp: string;
  email: string;
}

export interface SiteSettings {
  titulo_site: string;
  subtitulo_site: string;
  logo_principal_url: string;
  logo_footer_url: string;
  css_customizado: string;
  paleta_cores: PaletaCores;
  cor_primaria?: string;
  cor_secundaria?: string;
  nome_empresa?: string;
  fonte_titulo?: string; // Ex: 'Plus Jakarta Sans', 'Montserrat', 'Playfair Display', 'Poppins'
  fonte_corpo?: string;  // Ex: 'Inter', 'Roboto', 'Open Sans', 'Lato'
  secao_hero_titulo: string;
  secao_hero_subtitulo: string;
  banner_hero_url?: string;
  video_url?: string;
  video_titulo?: string;
  video_subtitulo?: string;
  video_poster_url?: string;
  video_secundario_url?: string;
  video_secundario_titulo?: string;
  galeria_videos?: VideoItem[];
  banner_alerta_titulo?: string;
  banner_alerta_subtitulo?: string;
  quem_somos_exibir?: boolean;
  quem_somos_titulo?: string;
  quem_somos_subtitulo?: string;
  quem_somos_descricao?: string;
  quem_somos_imagem_url?: string;
  autoridade_nome?: string;
  autoridade_cargo?: string;
  autoridade_experiencia?: string;
  autoridade_bio?: string;
  autoridade_foto_url?: string;
  autoridade_credenciais?: string[];
  equipe_exibir?: boolean;
  equipe_titulo?: string;
  equipe_subtitulo?: string;
  equipe_membros?: MembroEquipe[];
  depoimentos?: DepoimentoCliente[];
  casos_reais?: CasoRealItem[];
  faq_itens?: FaqItem[];
  whatsapp_vendas?: string;
  mensagem_padrao_whatsapp?: string;
  servicos_catalogo: ServicoCatalogo[];
  redes_sociais?: RedeSocialItem[];
  // Área do Cliente (Portal de Acompanhamento)
  area_cliente_ativo?: boolean;
  area_cliente_titulo?: string;
  area_cliente_subtitulo?: string;
  area_cliente_aviso?: string;
  area_cliente_whatsapp_suporte?: string;
  // Personalização do Topo / Header & Logotipo
  topo_exibir_texto?: boolean;
  topo_texto_titulo?: string;
  topo_texto_tag?: string;
  topo_texto_subtitulo?: string;
  logo_altura_px?: number;
  faixa_topo_ativa?: boolean;
  faixa_topo_texto?: string;
  faixa_topo_link_texto?: string;
  // Personalização do Rodapé / Footer
  rodape_exibir?: boolean;
  rodape_titulo?: string;
  rodape_tag?: string;
  rodape_razao_social?: string;
  rodape_cnpj?: string;
  rodape_descricao?: string;
  rodape_telefone?: string;
  rodape_email?: string;
  rodape_endereco?: string;
  rodape_horario_atendimento?: string;
  rodape_texto_seguranca?: string;
  rodape_copyright?: string;
  rodape_termos_uso?: string;
  rodape_politica_privacidade?: string;
  responsavel_tecnico?: string; // Informações do Responsável Técnico / Engenharia / Direito (editável pelo CMS)
  // Blog & Artigos do Site
  blog_exibir?: boolean;
  blog_titulo?: string;
  blog_subtitulo?: string;
  artigos_blog?: ArtigoBlog[];
}

export interface ArtigoBlog {
  id: string;
  titulo: string;
  slug: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  autor: {
    nome: string;
    cargo: string;
    foto_url?: string;
  };
  imagem_capa: string;
  data_publicacao: string;
  tempo_leitura_min: number;
  tags?: string[];
  destaque?: boolean;
  publicado?: boolean;
}

// Tipos de Parceiros Indicadores Homologados
export type TipoParceiro =
  | 'Arquitetos'
  | 'Engenheiros'
  | 'Corretores'
  | 'Imobiliarias'
  | 'Amigos'
  | 'Advogados'
  | 'Servidor Publico'
  | 'Outros';

export type TipoChavePix = 'CPF' | 'CNPJ' | 'Email' | 'Telefone' | 'Chave_Aleatoria';

export interface ParceiroB2B {
  id: string; // Ex: PARC-B2B-88
  nome: string;
  tipo: TipoParceiro;
  email_login: string;
  senha?: string;
  telefone: string;
  cpf_cnpj?: string;
  registro_profissional?: string; // CAU, CREA, CRECI, OAB, etc.
  percentual_comissao: number; // Percentual liberado caso a caso (não fixado em 5%)
  chave_pix: string;
  tipo_chave_pix: TipoChavePix;
  banco_titular?: string;
  ativo: boolean;
  data_cadastro: string;
  total_indicacoes?: number;
  total_comissoes_geradas?: number;
  observacoes?: string;
}

export type PermissionCode =
  | 'contacts:create'
  | 'contacts:read'
  | 'contacts:edit'
  | 'documents:upload'
  | 'documents:validate'
  | 'deals:create'
  | 'deals:view'
  | 'deals:homologate'
  | 'finance:payout'
  | 'b2b:view_all'
  | 'b2b:view_own'
  | 'ai:execute'
  | 'cms:edit'
  | 'whitelabel:manage'
  | 'users:manage'
  | 'reports:view'
  | 'billing:manage'
  | 'signatures:manage'
  | 'marketing:manage'
  | 'whatsapp:manage'
  | 'activities:manage';

export type RoleUsuario = 'ADMIN' | 'TECNICO' | 'SDR' | 'PARCEIRO_B2B' | 'FINANCEIRO';

export interface RoleConfig {
  role: RoleUsuario;
  nome_exibicao: string;
  descricao: string;
  permissions_json: PermissionCode[];
}

export interface Usuario {
  id: string;
  nome: string;
  cargo: string;
  role: RoleUsuario;
  email: string;
  senha?: string;
  foto_url: string;
  parceiro_id?: string; // Para Parceiro B2B se aplicável
  oab_crea?: string;
  telefone?: string;
  cpf?: string;
  endereco?: Endereco;
  custom_permissions?: PermissionCode[];
  primeiro_acesso?: boolean;
  convite_enviado_em?: string;
  status_convite?: 'Pendente' | 'Enviado' | 'Acessado';
  ativo?: boolean;
}

export interface Property {
  id: string;
  contact_id: string;
  deal_id?: string;
  matricula_numero: string;
  cartorio_ri: string;
  inscricao_municipal_iptu: string;
  area_total_m2: number;
  area_construida_m2?: number;
  tipo_imovel: string;
  situacao_posse: 'Posse Mansa e Pacífica' | 'Cessão de Direitos Hereditários' | 'Contrato de Gaveta' | 'Loteamento Irregular' | 'Sobreposição de Área';
  endereco: Endereco;
  confrontantes?: string;
  observacoes?: string;
}

export type NaturezaFinanceira = 'RECEITA' | 'DESPESA';

export type CategoriaFinanceira =
  | 'HONORARIOS_ENTRADA'
  | 'HONORARIOS_PARCELA'
  | 'HONORARIOS_EXITO'
  | 'CONSULTORIA_REGISTRAL'
  | 'EMOLUMENTOS_CARTORIO'
  | 'TOPOGRAFIA_GEO'
  | 'PERICIA_TECNICA'
  | 'COMISSAO_B2B'
  | 'DESPESA_ADMINISTRATIVA'
  | 'TRAFEGO_MARKETING'
  | 'SOFTWARE_TI'
  | 'IMPOSTOS_SIMPLES'
  | 'PRO_LABORE'
  | 'DISTRIBUICAO_LUCROS'
  | 'OUTROS'
  | string;

export type TipoLancamentoFinanceiro = 
  | 'HONORARIOS' 
  | 'COMISSAO_B2B' 
  | 'TAXA_CARTORARIA' 
  | 'CUSTAS_TOPOGRAFIA'
  | 'DESPESA_OPERACIONAL'
  | 'SERVICO_EXTRAJUDICIAL'
  | 'IMPOSTOS_DEDUCOES'
  | 'DISTRIBUICAO_RESULTADOS';

export type StatusLancamentoFinanceiro = 'Pendente' | 'Homologado' | 'Pago' | 'Cancelado';

export interface DistribuicaoResultadoSocio {
  socio_id: string;
  socio_nome: string;
  nome?: string;
  percentual: number;
  valor: number;
  chave_pix?: string;
  banco?: string;
  pago?: boolean;
  status?: string;
  data_repasse?: string;
}

export interface DistribuicaoResultadoRegistro {
  empresa_percentual: number;
  empresa_valor: number;
  socios: DistribuicaoResultadoSocio[];
  executado_em?: string;
  calculado_em?: string;
  honorario_total?: number;
}

export interface FinancialRecord {
  id: string;
  deal_id?: string;
  contact_id?: string;
  natureza?: NaturezaFinanceira;
  categoria?: CategoriaFinanceira | string;
  tipo: TipoLancamentoFinanceiro;
  descricao: string;
  valor: number;
  beneficiario: string;
  favorecido?: string;
  pagador?: string;
  data?: string;
  data_vencimento: string;
  data_pagamento?: string;
  status: StatusLancamentoFinanceiro | 'pago' | 'pendente';
  homologado_por?: string;
  observacoes?: string;
  comprovante_url?: string;
  distribuicao_resultado?: DistribuicaoResultadoRegistro;
  created_at: string;
}

export interface ReferralProgramSettings {
  percentual_padrao: number;
  teto_maximo_percentual: number;
  regra_homologacao: string;
  sla_pagamento_dias: number;
  termos_adesao_b2b: string;
  dias_payout?: number;
  exigir_homologacao_diretoria?: boolean;
}

export interface ToolExecutionResult {
  tool_name: string;
  parameters: Record<string, unknown>;
  output: Record<string, unknown>;
  timestamp: string;
  status: 'sucesso' | 'erro';
}

export type StatusCobranca = 'Pendente' | 'Pago' | 'Vencido' | 'Cancelado';
export type TipoCobranca = 'HONORARIOS_ENTRADA' | 'HONORARIOS_PARCELA' | 'EMOLUMENTOS_CARTORIO' | 'TAXA_TOPOGRAFIA';
export type GatewayFintech = 'Asaas' | 'Banco Inter' | 'Cora' | 'Iugu' | 'Stone' | 'Mercado Pago';

export interface CobrancaBoleto {
  id: string;
  contact_id: string;
  contact_nome: string;
  contact_cpf_cnpj: string;
  contact_email?: string;
  contact_telefone?: string;
  contact_endereco?: Endereco;
  deal_id?: string;
  deal_titulo?: string;
  tipo: TipoCobranca;
  descricao: string;
  valor: number;
  data_emissao: string;
  data_vencimento: string;
  data_pagamento?: string;
  status: StatusCobranca;
  gateway: GatewayFintech;
  linha_digitavel: string;
  codigo_barras: string;
  nosso_numero: string;
  pix_copia_cola: string;
  qr_code_pix_url?: string;
  multa_percentual: number;
  juros_mensal_percentual: number;
  instrucoes_caixa?: string[];
  split_b2b?: {
    parceiro_id: string;
    parceiro_nome: string;
    percentual: number;
    valor_comissao: number;
  };
  split_executado?: RegistroSplitExecutado;
}

export interface FintechConfig {
  id: GatewayFintech;
  nome: string;
  tipo: 'SaaS' | 'Banco Digital' | 'Gateway';
  ativo: boolean;
  ambiente: 'sandbox' | 'producao';
  api_key: string;
  client_id?: string;
  client_secret?: string;
  webhook_url: string;
  tarifa_boleto: number;
  dias_compensacao: string;
  suporta_split: boolean;
  suporta_pix_hibrido: boolean;
  icone: string;
  descricao: string;
}

export type TipoContratoTemplate =
  | 'PRESTACAO_SERVICOS_REURB'
  | 'USUCAPIAO_EXTRAJUDICIAL'
  | 'ADJUDICACAO_COMPULSORIA'
  | 'HONORARIOS_COM_EXITO'
  | 'PROCURACAO_AD_NEGOTIA'
  | 'DECLARACAO_POSSE_MANSA'
  | 'TERMO_CONFIDENCIALIDADE_LGPD';

export interface ModeloContratoPadrao {
  id: string;
  codigo: TipoContratoTemplate | string;
  titulo: string;
  descricao: string;
  categoria: 'Regularização Fundiária' | 'Usucapião' | 'Mandato & Procuração' | 'Declarações' | 'Compliance & LGPD' | 'Contratos de Honorários';
  conteudo_minuta: string;
  variaveis_suportadas: string[];
  ativo: boolean;
  versao: string;
  ultima_modificacao: string;
  autor_modificacao?: string;
}

export type StatusAssinaturaDocumento =
  | 'Rascunho'
  | 'Aguardando Assinaturas'
  | 'Assinado Parcialmente'
  | 'Concluído'
  | 'Cancelado';

export type PapelSignatario =
  | 'Contratante'
  | 'Contratada'
  | 'Testemunha 1'
  | 'Testemunha 2'
  | 'Responsável Técnico';

export type StatusSignatario = 'Pendente' | 'Assinado' | 'Recusado';

export interface Signatario {
  id: string;
  nome: string;
  email: string;
  telefone_whatsapp: string;
  cpf: string;
  papel: PapelSignatario;
  status: StatusSignatario;
  data_assinatura?: string;
  metodo_assinatura?: 'Desenho em Tela' | 'Certificado Digital Token/Hash' | 'Assinatura Eletrônica Avançada';
  ip_origem?: string;
  geolocalizacao?: string;
  dispositivo_user_agent?: string;
  assinatura_imagem_base64?: string;
  hash_autenticacao?: string;
  codigo_otp_validado?: boolean;
}

export interface EventoAuditoria {
  id: string;
  data_hora: string;
  evento: string;
  autor: string;
  ip: string;
  geolocalizacao: string;
  dispositivo: string;
  detalhes?: string;
  hash_integridade?: string;
}

export type ProvedorAssinatura = 'Brasil Legal e-Sign' | 'Clicksign' | 'DocuSign' | 'ZapSign' | 'D4Sign' | 'Autentique';

export interface ContratoAssinatura {
  id: string;
  titulo: string;
  template_tipo: TipoContratoTemplate;
  contact_id: string;
  contact_nome: string;
  contact_cpf_cnpj: string;
  contact_email?: string;
  contact_telefone?: string;
  deal_id?: string;
  deal_titulo?: string;
  status: StatusAssinaturaDocumento;
  data_criacao: string;
  data_conclusao?: string;
  data_expiracao: string;
  valor_contrato?: number;
  valor_total?: number;
  condicoes_pagamento?: string;
  objeto_imovel?: string;
  conteudo_contrato: string;
  conteudo_documento_texto?: string;
  hash_sha256_original: string;
  hash_sha256_assinado?: string;
  token_verificacao: string;
  link_assinatura_publico: string;
  provedor_assinatura: ProvedorAssinatura;
  signatarios: Signatario[];
  audit_trail: EventoAuditoria[];
  metadados_juridicos: {
    base_legal: string;
    carimbo_tempo: string;
    certificado_id: string;
  };
}

export interface ConfigAssinaturaEletronica {
  provedor_ativo: ProvedorAssinatura;
  ambiente: 'sandbox' | 'producao';
  api_key?: string;
  webhook_url?: string;
  notificar_whatsapp_auto: boolean;
  notificar_email_auto: boolean;
  exigir_otp_sms_whatsapp: boolean;
  validade_padrao_dias: number;
}

export interface MetaAdsCampaign {
  id: string;
  nome: string;
  objetivo: 'LEADS' | 'CONVERSIONS' | 'TRAFFIC' | 'MESSAGES';
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  orcamento_diario: number;
  gasto_total: number;
  impressoes: number;
  cliques: number;
  leads_gerados: number;
  cpl: number; // Custo por Lead em R$
  ctr: number; // Click-through rate (%)
  roas: number; // Return on Ad Spend
  publico_alvo: string;
  canal: 'Instagram' | 'Facebook' | 'Ambos';
  criativo_preview: {
    titulo: string;
    texto_principal: string;
    imagem_url: string;
    cta: string;
    form_nome: string;
  };
}

export interface MetaAdsFormCampo {
  id: string;
  label: string;
  tipo: 'text' | 'tel' | 'email' | 'select';
  opcoes?: string[];
  crm_field_mapping: 'nome_completo' | 'telefone_whatsapp' | 'email' | 'endereco.cidade' | 'tipo_imovel' | 'servico_pretendido';
  obrigatorio: boolean;
}

export interface MetaAdsForm {
  id: string;
  nome_formulario: string;
  campanha_id: string;
  status: 'Ativo' | 'Pausado';
  total_leads_coletados: number;
  data_criacao: string;
  mensagem_sucesso: string;
  campos: MetaAdsFormCampo[];
}

export interface MetaAdsConfig {
  account_id: string;
  pixel_id: string;
  access_token: string;
  app_secret?: string;
  webhook_verify_token: string;
  auto_sync_leads: boolean;
  conversao_api_ativo: boolean;
  whatsapp_number_destino: string;
  distribuir_sdr_automatico: boolean;
  campanhas: MetaAdsCampaign[];
  formularios?: MetaAdsForm[];
}

// TIPOS PARA O COMPARADOR DE DOCUMENTOS DE IMÓVEIS (IA GEMINI)
export type CategoriaDivergencia =
  | 'Área e Medidas Perimetrais'
  | 'Titularidade e Qualificação'
  | 'Estado Civil e Outorga'
  | 'Endereço e Numeração'
  | 'Ônus, Gravames e Cláusulas'
  | 'Valores e Tributos'
  | 'Confrontações e Divisas';

export type SeveridadeDivergencia = 'Crítica' | 'Moderada' | 'Leve';

export interface DivergenciaItem {
  id: string;
  categoria: CategoriaDivergencia;
  severidade: SeveridadeDivergencia;
  titulo: string;
  descricao: string;
  dado_documento_a: string;
  dado_documento_b: string;
  impacto_registral: string;
  solucao_recomendada: string;
}

export interface ClausulaConflitante {
  id: string;
  clausula_doc_a: string;
  clausula_doc_b: string;
  conflito: string;
  risco: string;
  sugestao_redacao: string;
}

export interface DadoConvergente {
  campo: string;
  valor: string;
  status: 'Conforme';
}

export interface ComparacaoDocumentosResultado {
  status_geral: 'Aprovado sem Ressalvas' | 'Compatível com Ressalvas' | 'Alto Risco de Divergência' | 'Incompatível / Óbice Registral';
  indice_conformidade: number; // 0 a 100
  total_divergencias: number;
  divergencias_criticas: number;
  divergencias_moderadas: number;
  divergencias_leves: number;
  divergencias: DivergenciaItem[];
  clausulas_conflitantes: ClausulaConflitante[];
  dados_convergentes: DadoConvergente[];
  resumo_executivo: string;
  parecer_juridico_registral: string;
  acoes_recomendadas: string[];
  tempo_processamento_ms: number;
  simulated?: boolean;
}

// ==========================================
// WHATSAPP MULTI-ATENDIMENTO (WHATICKET STYLE)
// ==========================================
export type StatusInstanciaWhatsApp = 'Conectado' | 'Desconectado' | 'Aguardando_QR';

export type StatusAtendimentoWhatsApp = 'Aguardando' | 'Em_Atendimento' | 'Finalizado';

export type FilaAtendimentoWhatsApp =
  | 'Triagem Comercial (SDR)'
  | 'Jurídico & Regularização'
  | 'Engenharia & Topografia'
  | 'Financeiro & Boletos';

export interface MensagemWhatsApp {
  id: string;
  remetente: 'cliente' | 'atendente' | 'ia_agente';
  autor_nome: string;
  conteudo: string;
  timestamp: string;
  status: 'enviada' | 'entregue' | 'lida';
  tipo?: 'texto' | 'audio' | 'documento' | 'imagem';
  arquivo_url?: string;
  arquivo_nome?: string;
  duracao_audio_seg?: number;
}

export interface IaQualificacaoImovel {
  etapa_atual: number; // 1 a 5
  concluida: boolean;
  tem_escritura_ou_posse?: 'Escritura Registrada' | 'Contrato de Gaveta / Posse' | 'Cessão Hereditária' | 'Não sabe informar';
  tempo_posse_anos?: string;
  tem_iptu?: 'Sim, no meu nome' | 'Sim, no nome de terceiros' | 'Não possui IPTU / Incra';
  construcao_averbada?: 'Sim, averbada' | 'Não averbada / Precisa regularizar' | 'Lote sem benfeitoria';
  tipo_e_local?: string;
  score_viabilidade_percentual: number;
  servico_sugerido: string;
  parecer_resumo: string;
  gerou_lead_crm: boolean;
}

export type CanalAtendimento = 'WhatsApp' | 'Webchat' | 'Email';

export type TomDeVozIa =
  | 'Consultivo & Técnico Especialista'
  | 'Formal & Jurídico Registral'
  | 'Ágil, Comercial & Direto'
  | 'Empático, Didático & Acolhedor';

export interface DiretrizCanalIa {
  canal: CanalAtendimento;
  nome_canal: string;
  ativo: boolean;
  status_conexao: 'Conectado' | 'Online' | 'Aguardando_Config';
  identificador: string;
  tom_de_voz: TomDeVozIa;
  diretrizes_prompt: string;
  prompt_diretrizes?: string;
  mensagem_saudacao: string;
  saudacao_inicial?: string;
  auto_resposta_ativa: boolean;
  encaminhar_apos_qualificacao: boolean;
  score_minimo_transbordo: number;
}

export interface OmnichannelConfig {
  canais: Record<CanalAtendimento, DiretrizCanalIa>;
  modelo_ia: string;
  notificar_humano_novo_lead: boolean;
  trocar_tag_automatica: boolean;
  ia_geral?: {
    nome_agente?: string;
    objetivo_principal?: string;
    limite_turnos?: number;
    temperatura?: number;
    auto_qualificacao_ia?: boolean;
    score_minimo_transbordo?: number;
  };
}

export interface ConversaWhatsApp {
  id: string;
  canal?: CanalAtendimento;
  assunto?: string;
  canal_origem_detalhe?: string;
  cliente_nome: string;
  cliente_numero: string;
  cliente_cidade_uf?: string;
  foto_url?: string;
  fila: FilaAtendimentoWhatsApp;
  status: StatusAtendimentoWhatsApp;
  atendente_id?: string;
  atendente_nome?: string;
  ultima_mensagem: string;
  ultima_mensagem_hora: string;
  mensagens_nao_lidas: number;
  tags: string[]; // Suporte especial a 'Pré-qualificação' e 'Atendimento Humano'
  ia_agente_ativo: boolean;
  ia_qualificacao?: IaQualificacaoImovel;
  notas_internas?: string[];
  mensagens: MensagemWhatsApp[];
}

export type ConversaOmnichannel = ConversaWhatsApp;

export interface InstanciaWhatsAppConfig {
  id: string;
  nome_instancia: string;
  numero_vinculado: string;
  status: StatusInstanciaWhatsApp;
  bateria_percentual: number;
  qr_code_base64?: string;
  webhook_url: string;
  auto_resposta_ia: boolean;
  mensagem_saudacao: string;
  filas_habilitadas: FilaAtendimentoWhatsApp[];
}

// ==========================================
// SISTEMA DE SPLITS BANCÁRIOS (SÓCIOS & EMPRESA)
// ==========================================
export interface SocioSplit {
  id: string;
  nome: string;
  cargo: string;
  cpf: string;
  chave_pix: string;
  tipo_chave_pix: TipoChavePix;
  banco: string;
  agencia_conta: string;
  percentual: number; // Ex: 25%
  ativo: boolean;
  email_notificacao?: string;
}

export interface ConfigSplitBancario {
  habilitado: boolean;
  empresa_razao_social: string;
  empresa_cnpj: string;
  empresa_banco: string;
  empresa_chave_pix: string;
  empresa_tipo_chave_pix: TipoChavePix;
  empresa_percentual: number; // Ex: 50%
  percentual_empresa_caixa?: number;
  socios: SocioSplit[]; // Soma dos sócios + empresa = 100%
  taxa_gateway_quem_paga: 'EMPRESA' | 'PROPORCIONAL';
  momento_repasse: 'IMEDIATO_LIQUIDACAO' | 'D_PLUS_1' | 'D_PLUS_14';
  notificar_socios_pix: boolean;
  notificar_push_desktop: boolean;
}

export interface ItemDistribuicaoSplit {
  beneficiario_id: string;
  beneficiario_nome: string;
  tipo: 'EMPRESA' | 'SOCIO';
  cargo_ou_descricao: string;
  percentual: number;
  valor_bruto: number;
  taxa_gateway_deduzida: number;
  valor_liquido: number;
  chave_pix: string;
  banco: string;
  status_repasse: 'Transferido' | 'Agendado_D1' | 'Pendente';
  autenticacao_bancaria: string;
}

export interface RegistroSplitExecutado {
  id: string;
  cobranca_id: string;
  nosso_numero: string;
  cliente_nome: string;
  cliente_cpf_cnpj: string;
  deal_titulo?: string;
  valor_total_pago: number;
  valor_total?: number;
  tarifa_gateway: number;
  valor_liquido_total: number;
  data_pagamento: string;
  data_split: string;
  gateway: GatewayFintech;
  status: 'Liquidado' | 'Em_Processamento' | 'Transferido';
  distribuicao: ItemDistribuicaoSplit[];
}

// ==========================================
// NOTIFICAÇÕES PUSH DESKTOP & IN-APP
// ==========================================
export type TipoNotificacao = 
  | 'NOVO_LEAD_ENTRADA'
  | 'DOCUMENTO_VALIDADO'
  | 'LEAD_AVANCOU_ESTEIRA'
  | 'PAGAMENTO_SPLIT_EXECUTADO'
  | 'SPLIT_BANCARIO_EXECUTADO'
  | 'OMNICHANNEL_LEAD_QUALIFICADO'
  | 'EMAIL_MARKETING_DISPARADO'
  | 'GERAL';

export interface AppNotification {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  timestamp: string;
  lida: boolean;
  link_aba?: string;
  metadados?: Record<string, any>;
}

// ==========================================
// INTEGRAÇÃO GITHUB & CPANEL (SERVIDOR HOMEHOST)
// ==========================================
export interface LogDeployItem {
  id: string;
  data_hora: string;
  commit_hash?: string;
  commit_mensagem?: string;
  autor?: string;
  branch: string;
  status: 'SUCESSO' | 'EM_PROGRESSO' | 'FALHA';
  mensagem: string;
  detalhes?: string;
}

export interface ConfigIntegracaoGithubCpanel {
  habilitado: boolean;
  servidor_provedor: 'HOMEHOST' | 'CPANEL_OUTRO';
  nome_servidor: string;
  
  // Repositório GitHub
  github_repo_url: string;
  github_branch: string;
  github_usuario: string;
  github_token_pat?: string;
  github_webhook_secret?: string;

  // Servidor cPanel (Homehost)
  cpanel_url: string;
  cpanel_usuario: string;
  cpanel_token_api?: string;
  cpanel_diretorio_deploy: string;
  cpanel_repositorio_path: string;
  
  // Modo de Hospedagem / Deploy
  modo_deploy: 'BUILD_ESTATICO_SPA' | 'NODEJS_APP_FULLSTACK';
  versao_node?: string;
  arquivo_inicial_node?: string;
  porta_app?: number;
  
  // Webhook automático
  webhook_ativo: boolean;
  webhook_payload_url: string;
  
  // Status & Histórico
  ultimo_deploy_status: 'SUCESSO' | 'PENDENTE' | 'ERRO' | 'NUNCA_EXECUTADO';
  ultimo_deploy_data?: string;
  ultimo_deploy_commit?: string;
  ultimo_deploy_log?: string;
  historico_logs: LogDeployItem[];
}

// ==========================================
// MÓDULO DE ATIVIDADES & GOOGLE AGENDA
// ==========================================
export type TipoAtividade =
  | 'REUNIAO'
  | 'VISTORIA_TECNICA'
  | 'DILIGENCIA_CARTORIO'
  | 'ASSINATURA_CONTRATO'
  | 'ATENDIMENTO_CLIENTE'
  | 'AUDIENCIA_MEDIACAO'
  | 'PRAZO_PROCESSUAL'
  | 'OUTRO';

export type StatusAtividade = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';

export type PrioridadeAtividade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export interface Atividade {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: TipoAtividade;
  status: StatusAtividade;
  prioridade: PrioridadeAtividade;
  data_inicio: string; // YYYY-MM-DD
  hora_inicio: string; // HH:mm
  data_fim?: string;
  hora_fim?: string;
  local?: string;
  link_meet?: string;
  cliente_id?: string;
  cliente_nome?: string;
  deal_id?: string;
  deal_titulo?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  google_event_id?: string;
  sincronizado_google?: boolean;
  criado_em: string;
  atualizado_em?: string;
  notificar_minutos_antes?: number;
}

// ==========================================
// E-MAIL MARKETING & AUTOMAÇÕES WHITE-LABEL
// ==========================================

export type GatilhoEmailAutomacao = 
  | 'BOAS_VINDAS' 
  | 'CUSTODIA_DOCUMENTOS' 
  | 'PROPOSTA_ENVIADA' 
  | 'ACOMPANHAMENTO_CARTORARIO' 
  | 'DIAGNOSTICO_IA_CONCLUIDO' 
  | 'MANUAL';

export interface FluxoEmailMarketing {
  id: string;
  numero: number;
  badge: string;
  titulo: string;
  subtitulo: string;
  assunto: string;
  corpo_html: string;
  ativo: boolean;
  envios_total: number;
  aberturas_total: number;
  cliques_total: number;
  gatilho: GatilhoEmailAutomacao;
}

export type StatusEntregaEmail = 'ENTREGUE' | 'ABERTO' | 'CLICADO' | 'FALHA';

export interface EnvioEmailLog {
  id: string;
  fluxo_id: string;
  fluxo_nome: string;
  destinatario_nome: string;
  destinatario_email: string;
  assunto: string;
  corpo_renderizado: string;
  data_envio: string;
  status: StatusEntregaEmail;
  aberto_em?: string;
  clicado_em?: string;
  origem_gatilho: string;
  cliente_id?: string;
  deal_id?: string;
  link_custodia?: string;
}

export interface ConfigEmailMarketing {
  remetente_nome: string;
  remetente_email: string;
  servidor_smtp?: string;
  porta_smtp?: number;
  disparar_apos_diagnostico_ia: boolean;
  notificar_push_ao_enviar: boolean;
  notificar_push_ao_abrir: boolean;
  link_custodia_padrao?: string;
}

