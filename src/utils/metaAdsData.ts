import { MetaAdsConfig } from '../types';

export const initialMetaAdsConfig: MetaAdsConfig = {
  account_id: 'act_48291049182301',
  pixel_id: '849201948201938',
  access_token: 'EAAOx8ZAZC1...Token-Graph-API-v20-Meta-Ads-Enterprise',
  app_secret: '9f8a7b6c5d4e3f2a1b0c987654321fed',
  webhook_verify_token: 'brasil_legal_meta_lead_webhook_token_2026',
  auto_sync_leads: true,
  conversao_api_ativo: true,
  whatsapp_number_destino: '+55 11 99864-2424',
  distribuir_sdr_automatico: true,
  campanhas: [
    {
      id: 'cmp-meta-01',
      nome: 'Usucapião Extrajudicial Direto no Cartório (Lead Ads)',
      objetivo: 'LEADS',
      status: 'ACTIVE',
      orcamento_diario: 150.0,
      gasto_total: 4250.0,
      impressoes: 84320,
      cliques: 3120,
      leads_gerados: 142,
      cpl: 29.92,
      ctr: 3.7,
      roas: 7.8,
      publico_alvo: 'Proprietários de Imóveis (35-65 anos), Regiões Metropolitanas de SP/Campinas, Interesses em Escrituras e Cartórios',
      canal: 'Ambos',
      criativo_preview: {
        titulo: 'Seu Imóvel com Escritura Registrada sem Processo Judicial',
        texto_principal: 'Tem contrato de gaveta ou posse há anos? A Lei 13.465 e o Provimento 65 do CNJ autorizam a regularização direta no Cartório de Registro de Imóveis. Receba uma análise técnica preliminar em menos de 4 minutos.',
        imagem_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
        cta: 'Cadastre-se para Análise Gratuita',
        form_nome: 'Form_Usucapiao_Extrajudicial_BrasilLegal_2026'
      }
    },
    {
      id: 'cmp-meta-02',
      nome: 'REURB Urbana — Moradores de Loteamentos e Núcleos Consolidados',
      objetivo: 'LEADS',
      status: 'ACTIVE',
      orcamento_diario: 110.0,
      gasto_total: 2420.0,
      impressoes: 56900,
      cliques: 2040,
      leads_gerados: 94,
      cpl: 25.74,
      ctr: 3.58,
      roas: 6.9,
      publico_alvo: 'Associações de Moradores, Possuidores em Bairros e Chácaras, Cidades do Interior Paulista',
      canal: 'Instagram',
      criativo_preview: {
        titulo: 'Regularize seu lote ou condomínio pela REURB Social e Específica',
        texto_principal: 'Seu loteamento ainda não tem matrícula individual? Evite riscos e valorize seu patrimônio em até 40%. A Brasil Legal realiza o levantamento topográfico por drone e aprovação municipal completa.',
        imagem_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        cta: 'Falar com Coordenador Técnico',
        form_nome: 'Form_REURB_Condominios_Lotes'
      }
    },
    {
      id: 'cmp-meta-03',
      nome: 'Retificação de Área e Desdobro de Terrenos Urbanos',
      objetivo: 'CONVERSIONS',
      status: 'PAUSED',
      orcamento_diario: 80.0,
      gasto_total: 1120.0,
      impressoes: 24800,
      cliques: 790,
      leads_gerados: 31,
      cpl: 36.12,
      ctr: 3.18,
      roas: 5.2,
      publico_alvo: 'Proprietários de imóveis geminados, herdeiros em inventário, construtores e engenheiros',
      canal: 'Facebook',
      criativo_preview: {
        titulo: 'Desdobro e Abertura de Matrículas em Cartório de RI',
        texto_principal: 'Construiu mais de uma casa no mesmo terreno? Faça o desdobro legalizado e venda cada unidade com financiamento pela Caixa ou bancos privados.',
        imagem_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
        cta: 'Simular Orçamento de Desdobro',
        form_nome: 'Form_Desdobro_Topografia_ART'
      }
    }
  ],
  formularios: [
    {
      id: 'form-meta-01',
      nome_formulario: 'Formulário Usucapião Extrajudicial no Cartório (Instant Lead)',
      campanha_id: 'cmp-meta-01',
      status: 'Ativo',
      total_leads_coletados: 142,
      data_criacao: '2026-01-15T10:00:00Z',
      mensagem_sucesso: 'Obrigado! Um especialista da Brasil Legal entrará em contato em menos de 4 minutos via WhatsApp para iniciar a análise do seu imóvel.',
      campos: [
        { id: 'fld-1', label: 'Nome Completo', tipo: 'text', crm_field_mapping: 'nome_completo', obrigatorio: true },
        { id: 'fld-2', label: 'WhatsApp com DDD', tipo: 'tel', crm_field_mapping: 'telefone_whatsapp', obrigatorio: true },
        { id: 'fld-3', label: 'E-mail', tipo: 'email', crm_field_mapping: 'email', obrigatorio: false },
        { id: 'fld-4', label: 'Cidade onde fica o Imóvel', tipo: 'text', crm_field_mapping: 'endereco.cidade', obrigatorio: true },
        { 
          id: 'fld-5', 
          label: 'Situação Atual do Imóvel', 
          tipo: 'select', 
          opcoes: [
            'Contrato de Gaveta / Compra e Venda',
            'Posse Antiga (+ de 5 anos)',
            'Herança sem Inventário Finalizado',
            'Lote sem desdobro no Cartório',
            'Construção não averbada na matrícula'
          ],
          crm_field_mapping: 'tipo_imovel', 
          obrigatorio: true 
        },
        { 
          id: 'fld-6', 
          label: 'Serviço Pretendido', 
          tipo: 'select', 
          opcoes: [
            'Usucapião Extrajudicial',
            'Adjudicação Compulsória Extrajudicial',
            'REURB / Regularização Fundiária Urbana',
            'Retificação de Área e Desdobro'
          ],
          crm_field_mapping: 'servico_pretendido', 
          obrigatorio: true 
        }
      ]
    },
    {
      id: 'form-meta-02',
      nome_formulario: 'Formulário REURB & Loteamentos Consolidados',
      campanha_id: 'cmp-meta-02',
      status: 'Ativo',
      total_leads_coletados: 94,
      data_criacao: '2026-01-20T14:30:00Z',
      mensagem_sucesso: 'Excelente! Recebemos seus dados. Nosso departamento de engenharia e topografia iniciará o pré-levantamento cadastral.',
      campos: [
        { id: 'fld-21', label: 'Nome Completo', tipo: 'text', crm_field_mapping: 'nome_completo', obrigatorio: true },
        { id: 'fld-22', label: 'WhatsApp', tipo: 'tel', crm_field_mapping: 'telefone_whatsapp', obrigatorio: true },
        { id: 'fld-23', label: 'Município / Bairro', tipo: 'text', crm_field_mapping: 'endereco.cidade', obrigatorio: true },
        { 
          id: 'fld-24', 
          label: 'Tipo de Ocupação / Núcleo', 
          tipo: 'select', 
          opcoes: [
            'Loteamento Urbano Consolidado',
            'Chácara / Condomínio de Fato',
            'Associação de Moradores',
            'Terreno individual com posse mansa'
          ],
          crm_field_mapping: 'tipo_imovel', 
          obrigatorio: true 
        }
      ]
    }
  ]
};
