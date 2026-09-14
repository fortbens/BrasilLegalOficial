import { Contact, Deal, AppSettings, EnvioEmailLog, FluxoEmailMarketing } from '../types';

export interface EmailVariables {
  nome_cliente: string;
  email_cliente: string;
  cidade: string;
  status_imovel: string;
  link_portal_cliente: string;
  valor_proposta: string;
  parecer_ia: string;
  link_custodia: string;
  app_name: string;
}

export function buildEmailVariables(
  contact?: Contact | null,
  deal?: Deal | null,
  appSettings?: AppSettings,
  parecerIaCustom?: string
): EmailVariables {
  const nome = contact?.nome_completo || 'Carlos Eduardo Souza Prado';
  const email = contact?.email || 'carlos.prado@gmail.com';
  const cidade = contact?.endereco?.cidade 
    ? `${contact.endereco.cidade}/${contact.endereco.uf || 'SP'}` 
    : 'Franco da Rocha/SP';
  const statusImovel = deal?.titulo 
    ? `${deal.titulo} (Fase: ${deal.status || 'Diagnóstico Registral'})`
    : 'Usucapião Extrajudicial — Matrícula sob Análise Notarial';
  
  const portalUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/#area_cliente?c=${contact?.id || 'demo'}`
    : 'https://brasillegal.com.br/portal-do-cliente';

  const linkCustodia = typeof window !== 'undefined'
    ? `${window.location.origin}/#custodia?c=${contact?.id || 'demo'}&h=sha256-bl-${(contact?.id || 'custodia').slice(0,6)}`
    : 'https://brasillegal.com.br/custodia-segura';

  const dealVal = deal?.valor_honorarios_liquido || deal?.valor_honorarios;
  const valor = dealVal 
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dealVal)
    : 'R$ 8.500,00';

  const defaultParecer = parecerIaCustom || (deal?.parecer_tecnico && deal.parecer_tecnico.length > 20
    ? deal.parecer_tecnico
    : 'Diagnóstico preliminar favorável (94% de viabilidade). Imóvel preenche os requisitos do Provimento 65/CNJ e Art. 216-A da Lei de Registros Públicos para via extrajudicial sem litígio.');

  return {
    nome_cliente: nome,
    email_cliente: email,
    cidade,
    status_imovel: statusImovel,
    link_portal_cliente: portalUrl,
    valor_proposta: valor,
    parecer_ia: defaultParecer,
    link_custodia: linkCustodia,
    app_name: appSettings?.app_name || 'Brasil Legal'
  };
}

export function renderEmailTemplate(template: string, vars: EmailVariables): string {
  if (!template) return '';
  return template
    .replace(/\{\{nome_cliente\}\}/g, vars.nome_cliente)
    .replace(/\{\{email_cliente\}\}/g, vars.email_cliente)
    .replace(/\{\{cidade\}\}/g, vars.cidade)
    .replace(/\{\{status_imovel\}\}/g, vars.status_imovel)
    .replace(/\{\{link_portal_cliente\}\}/g, vars.link_portal_cliente)
    .replace(/\{\{valor_proposta\}\}/g, vars.valor_proposta)
    .replace(/\{\{parecer_ia\}\}/g, vars.parecer_ia)
    .replace(/\{\{link_custodia\}\}/g, vars.link_custodia)
    .replace(/\{\{app_name\}\}/g, vars.app_name);
}
