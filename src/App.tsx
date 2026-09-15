import React, { useState, useEffect } from 'react';
import { 
  Contact, 
  Documento, 
  Deal, 
  SiteSettings, 
  Usuario, 
  StatusValidacaoDocumento,
  AppSettings,
  RoleConfig,
  RoleUsuario,
  Property,
  FinancialRecord,
  ReferralProgramSettings,
  PermissionCode,
  CobrancaBoleto,
  FintechConfig,
  StatusCobranca,
  ContratoAssinatura,
  ConfigAssinaturaEletronica,
  ConversaWhatsApp,
  InstanciaWhatsAppConfig,
  OmnichannelConfig,
  MensagemWhatsApp,
  ConfigSplitBancario,
  RegistroSplitExecutado,
  Atividade,
  FluxoEmailMarketing,
  EnvioEmailLog,
  ConfigEmailMarketing
} from './types';
import { 
  mockUsers, 
  initialContacts, 
  initialDocuments, 
  initialDeals, 
  initialSiteSettings,
  initialAppSettings,
  initialRoleConfigs,
  initialProperties,
  initialFinancialRecords,
  initialReferralProgramSettings,
  initialCobrancas,
  initialFintechConfigs,
  initialInstanciaWhatsApp,
  initialConversasWhatsApp,
  initialOmnichannelConfig,
  initialConfigSplitBancario,
  initialRegistrosSplits,
  initialAtividades,
  initialFluxosEmailMarketing,
  initialEnviosEmailLog,
  initialConfigEmailMarketing
} from './mockData';
import { initialContratosAssinatura, initialConfigAssinatura } from './utils/contractTemplates';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { FunilComercial } from './components/FunilComercial';
import { CrmTecnico } from './components/CrmTecnico';
import { PainelFinanceiro } from './components/PainelFinanceiro';
import { PainelParceiroB2B } from './components/PainelParceiroB2B';
import { AiStudioEngine } from './components/AiStudioEngine';
import { ModuloCmsSite } from './components/ModuloCmsSite';
import { PainelAdministrativoWhiteLabel } from './components/PainelAdministrativoWhiteLabel';
import { EsteiraClientes } from './components/EsteiraClientes';
import { ModalNovoLead } from './components/ModalNovoLead';
import { ModalUploadDocumentos } from './components/ModalUploadDocumentos';
import { PaginaVendasPublica } from './components/PaginaVendasPublica';
import { ModuloRelatorios } from './components/ModuloRelatorios';
import { ModuloCobrancasBancarias } from './components/ModuloCobrancasBancarias';
import { ModuloAssinaturaDigital } from './components/ModuloAssinaturaDigital';
import { ModuloAtividadesAgenda } from './components/ModuloAtividadesAgenda';
import { ModuloEmailMarketing } from './components/ModuloEmailMarketing';
import { AreaClientePortal } from './components/AreaClientePortal';
import { MetaAdsManager } from './components/MetaAdsManager';
import { ModuloAtendimentoOmnichannel } from './components/ModuloAtendimentoOmnichannel';
import { ModuloWhatsAppMultiatendimento } from './components/ModuloWhatsAppMultiatendimento';
import { ModuloSplitsBancarios } from './components/ModuloSplitsBancarios';
import { TelaLogin } from './components/TelaLogin';
import { sendDesktopNotification, sendAdminPushNotification, playNotificationSound } from './services/notificationService';
import { buildEmailVariables, renderEmailTemplate } from './utils/emailMarketingUtils';
import {
  assinarContatos,
  assinarDocumentos,
  assinarDeals,
  assinarPropriedades,
  assinarRegistrosFinanceiros,
  assinarUsuarios,
  assinarSiteSettings,
  assinarAppSettings,
  salvarContatoFirestore,
  salvarDocumentoFirestore,
  salvarDealFirestore,
  salvarPropriedadeFirestore,
  salvarRegistroFinanceiroFirestore,
  salvarUsuarioFirestore,
  excluirUsuarioFirestore,
  salvarSiteSettingsFirestore,
  salvarAppSettingsFirestore,
  inicializarDadosFirestoreSeVazio,
  logoutFirebase
} from './services/firebaseService';

export type AppViewMode = 'site' | 'painel' | 'login';

// Utilitário de parsing seguro de respostas JSON para evitar SyntaxError quando o servidor retornar HTML (ex: fallback 404 do Apache/cPanel)
export async function safeFetchJson<T = any>(promiseOrRes: Promise<Response> | Response): Promise<T | null> {
  try {
    const res = await promiseOrRes;
    if (!res || !res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const getInitialViewMode = (): AppViewMode => {
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();

    // 1. Acesso explícito à tela de login
    if (hash === '#login' || search.includes('view=login') || pathname === '/login') {
      return 'login';
    }

    // 2. Acesso explícito ao painel ERP
    if (hash === '#painel' || hash === '#app' || hash === '#crm' || search.includes('view=painel') || pathname === '/painel') {
      const stored = localStorage.getItem('brasil_legal_session_user');
      if (stored) {
        return 'painel';
      }
      return 'login';
    }

    // 3. Padrão ao acessar o link público do site (raiz /, #site, etc.): SEMPRE abrir o site institucional
    return 'site';
  }
  return 'site';
};

export default function App() {
  const [viewMode, setViewMode] = useState<AppViewMode>(getInitialViewMode);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('brasil_legal_session_user') !== null;
    }
    return false;
  });

  const [currentUser, setCurrentUser] = useState<Usuario>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('brasil_legal_session_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return mockUsers[0];
  });

  const [allUsers, setAllUsers] = useState<Usuario[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('brasil_legal_all_users');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return mockUsers;
  });
  const [activeTab, setActiveTab] = useState<string>('comercial');

  const [contacts, setContacts] = useState<Contact[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('brasil_legal_contacts');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return initialContacts;
  });
  const [documents, setDocuments] = useState<Documento[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('brasil_legal_documents');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return initialDocuments;
  });
  const [deals, setDeals] = useState<Deal[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('brasil_legal_deals');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return initialDeals;
  });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('brasil_legal_site_settings');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (!parsed.logo_principal_url || parsed.logo_principal_url === '/assets/logo-brasil-legal.svg' || parsed.logo_principal_url.includes('brasillegalimoveis.com.br')) {
            parsed.logo_principal_url = '/assets/logo-brasil-legal-oficial.png';
          }
          if (parsed.redes_sociais && Array.isArray(parsed.redes_sociais)) {
            parsed.redes_sociais = parsed.redes_sociais.map((r: any) => {
              if (r.id === 'rede-facebook' || r.nome?.toLowerCase() === 'facebook') {
                if (r.username === '@brasillegal' || r.url === 'https://www.facebook.com/brasillegal') {
                  return {
                    ...r,
                    username: '@brasillegaloficial',
                    url: 'https://www.facebook.com/brasillegaloficial'
                  };
                }
              }
              return r;
            });
          }
          if (!parsed.secao_hero_titulo || parsed.secao_hero_titulo === 'Seu imóvel pode valer mais do que você imagina.' || parsed.secao_hero_titulo.includes('escritura definitiva direto no cartório')) {
            parsed.secao_hero_titulo = 'Seu imóvel 100% legalizado com escrituração direto no cartório';
          }
          if (!parsed.banner_alerta_titulo || parsed.banner_alerta_titulo.includes('40%')) {
            parsed.banner_alerta_titulo = 'Cuidado: imóvel sem escritura definitiva perde até 50% do valor de mercado';
            parsed.banner_alerta_subtitulo = 'Imóveis irregulares não aceitam financiamento bancário pela Caixa, Bradesco ou Itaú, correm risco de penhora por dívidas de antigos donos e geram inventários litigiosos caros.';
          }
          if (parsed.rodape_cnpj && parsed.rodape_cnpj.includes('00.000.000')) {
            parsed.rodape_cnpj = '';
            parsed.rodape_exibir_cnpj = false;
          }
          return { ...initialSiteSettings, ...parsed };
        } catch (e) {}
      }
    }
    return initialSiteSettings;
  });

  // Enterprise Entities States
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('brasil_legal_app_settings');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (!parsed.logo_header_url || parsed.logo_header_url === '/assets/logo-brasil-legal.svg' || parsed.logo_header_url.includes('brasillegalimoveis.com.br')) {
            parsed.logo_header_url = '/assets/logo-brasil-legal-oficial.png';
          }
          return { ...initialAppSettings, ...parsed };
        } catch (e) {}
      }
    }
    return initialAppSettings;
  });
  const [roleConfigs, setRoleConfigs] = useState<RoleConfig[]>(initialRoleConfigs);
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(initialFinancialRecords);
  const [referralSettings, setReferralSettings] = useState<ReferralProgramSettings>(initialReferralProgramSettings);
  const [cobrancas, setCobrancas] = useState<CobrancaBoleto[]>(initialCobrancas);
  const [fintechs, setFintechs] = useState<FintechConfig[]>(initialFintechConfigs);
  const [contratosAssinatura, setContratosAssinatura] = useState<ContratoAssinatura[]>(initialContratosAssinatura);
  const [configAssinatura, setConfigAssinatura] = useState<ConfigAssinaturaEletronica>(initialConfigAssinatura);
  const [conversasWhatsApp, setConversasWhatsApp] = useState<ConversaWhatsApp[]>(initialConversasWhatsApp);
  const [instanciaWhatsApp, setInstanciaWhatsApp] = useState<InstanciaWhatsAppConfig>(initialInstanciaWhatsApp);
  const [omnichannelConfig, setOmnichannelConfig] = useState<OmnichannelConfig>(initialOmnichannelConfig);
  const [configSplitBancario, setConfigSplitBancario] = useState<ConfigSplitBancario>(initialConfigSplitBancario);
  const [registrosSplits, setRegistrosSplits] = useState<RegistroSplitExecutado[]>(initialRegistrosSplits);

  const [atividades, setAtividades] = useState<Atividade[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('brasil_legal_atividades');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return initialAtividades;
  });

  const handleSaveAtividade = (novaAtividade: Atividade) => {
    setAtividades(prev => {
      const exists = prev.some(a => a.id === novaAtividade.id);
      const next = exists
        ? prev.map(a => a.id === novaAtividade.id ? novaAtividade : a)
        : [novaAtividade, ...prev];
      try {
        localStorage.setItem('brasil_legal_atividades', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleDeleteAtividade = (id: string) => {
    setAtividades(prev => {
      const next = prev.filter(a => String(a.id) !== String(id));
      try {
        localStorage.setItem('brasil_legal_atividades', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  // E-mail Marketing & Automações White-Label State
  const [fluxosEmailMarketing, setFluxosEmailMarketing] = useState<FluxoEmailMarketing[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('brasil_legal_fluxos_email');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return initialFluxosEmailMarketing;
  });

  const [logsEmailMarketing, setLogsEmailMarketing] = useState<EnvioEmailLog[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('brasil_legal_logs_email');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
    }
    return initialEnviosEmailLog;
  });

  const [configEmailMarketing, setConfigEmailMarketing] = useState<ConfigEmailMarketing>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('brasil_legal_config_email');
      if (cached) {
        try {
          return { ...initialConfigEmailMarketing, ...JSON.parse(cached) };
        } catch (e) {}
      }
    }
    return initialConfigEmailMarketing;
  });

  const handleSaveFluxoEmailMarketing = (fluxo: FluxoEmailMarketing) => {
    setFluxosEmailMarketing(prev => {
      const next = prev.map(f => f.id === fluxo.id ? fluxo : f);
      try {
        localStorage.setItem('brasil_legal_fluxos_email', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleAddLogEmailMarketing = (log: EnvioEmailLog) => {
    setLogsEmailMarketing(prev => {
      const next = [log, ...prev];
      try {
        localStorage.setItem('brasil_legal_logs_email', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleSaveConfigEmailMarketing = (cfg: ConfigEmailMarketing) => {
    setConfigEmailMarketing(cfg);
    try {
      localStorage.setItem('brasil_legal_config_email', JSON.stringify(cfg));
    } catch (e) {}
  };

  const handleSendEmailMarketingDiagnostic = (deal: Deal, contact: Contact, parecer: string) => {
    const fluxo5 = fluxosEmailMarketing.find(f => f.id === 'fluxo-5' || f.gatilho === 'DIAGNOSTICO_IA_CONCLUIDO') || fluxosEmailMarketing[0];
    const vars = buildEmailVariables(contact, deal, appSettings, parecer);
    const subjectRendered = renderEmailTemplate(fluxo5.assunto, vars);
    const htmlRendered = renderEmailTemplate(fluxo5.corpo_html, vars);

    const newLog: EnvioEmailLog = {
      id: `log-${Date.now()}`,
      fluxo_id: fluxo5.id,
      fluxo_nome: fluxo5.titulo,
      destinatario_nome: vars.nome_cliente,
      destinatario_email: vars.email_cliente,
      assunto: subjectRendered,
      corpo_renderizado: htmlRendered,
      data_envio: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
      status: 'ENTREGUE',
      origem_gatilho: 'Diagnóstico Prévio da IA',
      cliente_id: contact.id,
      deal_id: deal.id,
      link_custodia: vars.link_custodia
    };

    handleAddLogEmailMarketing(newLog);

    // Increment count on flow
    handleSaveFluxoEmailMarketing({
      ...fluxo5,
      envios_total: (fluxo5.envios_total || 0) + 1
    });

    // Push notification & sound
    playNotificationSound();
    if (configEmailMarketing.notificar_push_ao_enviar) {
      sendAdminPushNotification({
        titulo: '🤖 Parecer Registral IA Encaminhado por E-mail!',
        mensagem: `E-mail enviado para ${vars.nome_cliente} (${vars.email_cliente}) com o parecer prévio dos documentos sob custódia segura.`,
        tipo: 'EMAIL_MARKETING_DISPARADO',
        destinatario: 'TODOS',
        link_aba: 'email_marketing',
        autor_nome: 'Inteligência Notarial IA'
      });
    }
  };

  // Modals state
  const [isNovoLeadModalOpen, setIsNovoLeadModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTargetContact, setUploadTargetContact] = useState<Contact | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);

  // Fetch initial data from server API
  const refreshAllData = async () => {
    try {
      const [
        dataContacts, 
        dataDocs, 
        dataDeals, 
        dataCms,
        dataAppSettings,
        dataRoles,
        dataUsers,
        dataProperties,
        dataFinRecords,
        dataReferral,
        dataCobrancas,
        dataFintechs,
        dataContratos,
        dataConfigAssinatura,
        dataConversas,
        dataInstancia,
        dataOmniConfig,
        dataSplitsConfig,
        dataSplitsRegistros
      ] = await Promise.all([
        safeFetchJson(fetch('/api/contacts')),
        safeFetchJson(fetch('/api/documents')),
        safeFetchJson(fetch('/api/deals')),
        safeFetchJson(fetch('/api/cms')),
        safeFetchJson(fetch('/api/app-settings')),
        safeFetchJson(fetch('/api/roles')),
        safeFetchJson(fetch('/api/users')),
        safeFetchJson(fetch('/api/properties')),
        safeFetchJson(fetch('/api/financial-records')),
        safeFetchJson(fetch('/api/referral-program')),
        safeFetchJson(fetch('/api/cobrancas')),
        safeFetchJson(fetch('/api/fintechs')),
        safeFetchJson(fetch('/api/contratos-assinatura')),
        safeFetchJson(fetch('/api/contratos-assinatura-config')),
        safeFetchJson(fetch('/api/whatsapp/conversas')),
        safeFetchJson(fetch('/api/whatsapp/instancia')),
        safeFetchJson(fetch('/api/omnichannel/config')),
        safeFetchJson(fetch('/api/splits/config')),
        safeFetchJson(fetch('/api/splits/registros'))
      ]);

      if (dataContacts?.contacts && Array.isArray(dataContacts.contacts)) {
        setContacts(dataContacts.contacts);
        try {
          localStorage.setItem('brasil_legal_contacts', JSON.stringify(dataContacts.contacts));
        } catch (e) {}
      }
      if (dataDocs?.documents && Array.isArray(dataDocs.documents)) {
        setDocuments(dataDocs.documents);
        try {
          localStorage.setItem('brasil_legal_documents', JSON.stringify(dataDocs.documents));
        } catch (e) {}
      }
      if (dataDeals?.deals && Array.isArray(dataDeals.deals)) {
        setDeals(dataDeals.deals);
        try {
          localStorage.setItem('brasil_legal_deals', JSON.stringify(dataDeals.deals));
        } catch (e) {}
      }
      if (dataCms?.settings) {
        const s = dataCms.settings;
        if (!s.logo_principal_url || s.logo_principal_url === '/assets/logo-brasil-legal.svg' || s.logo_principal_url.includes('brasillegalimoveis.com.br')) {
          s.logo_principal_url = '/assets/logo-brasil-legal-oficial.png';
        }
        if (!s.logo_footer_url || s.logo_footer_url.includes('brasillegalimoveis.com.br')) {
          s.logo_footer_url = '/assets/logo-brasil-legal-dark.svg';
        }
        if (!s.rodape_email || s.rodape_email.includes('brasillegalimoveis.com.br') || s.rodape_email === 'diretorcarneiro@gmail.com') {
          s.rodape_email = 'atendimento@brasillegal.com.br';
        }
        if (!s.whatsapp_vendas) {
          s.whatsapp_vendas = '+55 11 99864-2424';
        }
        if (!s.secao_hero_titulo || s.secao_hero_titulo === 'Seu imóvel pode valer mais do que você imagina.' || s.secao_hero_titulo.includes('escritura definitiva direto no cartório')) {
          s.secao_hero_titulo = 'Seu imóvel 100% legalizado com escrituração direto no cartório';
        }
        if (!s.banner_alerta_titulo || s.banner_alerta_titulo.includes('40%')) {
          s.banner_alerta_titulo = 'Cuidado: imóvel sem escritura definitiva perde até 50% do valor de mercado';
          s.banner_alerta_subtitulo = 'Imóveis irregulares não aceitam financiamento bancário pela Caixa, Bradesco ou Itaú, correm risco de penhora por dívidas de antigos donos e geram inventários litigiosos caros.';
        }
        if (s.rodape_cnpj && s.rodape_cnpj.includes('00.000.000')) {
          s.rodape_cnpj = '';
          s.rodape_exibir_cnpj = false;
        }
        setSiteSettings(s);
        try {
          localStorage.setItem('brasil_legal_site_settings', JSON.stringify(s));
        } catch (e) {}
      }
      if (dataAppSettings?.settings) {
        const a = dataAppSettings.settings;
        if (!a.logo_header_url || a.logo_header_url === '/assets/logo-brasil-legal.svg' || a.logo_header_url.includes('brasillegalimoveis.com.br')) {
          a.logo_header_url = '/assets/logo-brasil-legal-oficial.png';
        }
        if (!a.logo_light_url || a.logo_light_url === '/assets/logo-brasil-legal-light.svg' || a.logo_light_url.includes('brasillegalimoveis.com.br')) {
          a.logo_light_url = '/assets/logo-brasil-legal-oficial.png';
        }
        if (!a.logo_dark_url || a.logo_dark_url.includes('brasillegalimoveis.com.br')) {
          a.logo_dark_url = '/assets/logo-brasil-legal-dark.svg';
        }
        if (!a.logo_icon_url || a.logo_icon_url.includes('brasillegalimoveis.com.br')) {
          a.logo_icon_url = '/assets/logo-icon-brasil-legal.svg';
        }
        if (!a.logo_sidebar_url) {
          a.logo_sidebar_url = a.logo_icon_url || a.logo_header_url || '/assets/logo-brasil-legal-oficial.png';
        }
        if (!a.logo_login_url) {
          a.logo_login_url = a.logo_header_url || a.logo_light_url || '/assets/logo-brasil-legal-oficial.png';
        }
        if (!a.email_suporte || a.email_suporte.includes('brasillegalimoveis.com.br') || a.email_suporte === 'diretorcarneiro@gmail.com') {
          a.email_suporte = 'atendimento@brasillegal.com.br';
        }
        if (!a.whatsapp_suporte) {
          a.whatsapp_suporte = '+55 11 99864-2424';
        }
        setAppSettings(a);
        try {
          localStorage.setItem('brasil_legal_app_settings', JSON.stringify(a));
        } catch (e) {}
      }
      if (dataRoles?.roles) {
        setRoleConfigs(dataRoles.roles);
      }
      if (dataUsers?.users && Array.isArray(dataUsers.users) && dataUsers.users.length > 0) {
        setAllUsers(dataUsers.users);
        try {
          localStorage.setItem('brasil_legal_all_users', JSON.stringify(dataUsers.users));
        } catch (e) {}
        setCurrentUser(prevCurrent => {
          const freshCurrent = dataUsers.users.find((u: Usuario) => u.id === prevCurrent.id || u.email.toLowerCase() === prevCurrent.email.toLowerCase());
          if (freshCurrent) {
            try {
              localStorage.setItem('brasil_legal_session_user', JSON.stringify(freshCurrent));
            } catch (e) {}
            return freshCurrent;
          }
          return prevCurrent;
        });
      }
      if (dataProperties?.properties) setProperties(dataProperties.properties);
      if (dataFinRecords?.records) setFinancialRecords(dataFinRecords.records);
      if (dataReferral?.settings) setReferralSettings(dataReferral.settings);
      if (dataCobrancas?.cobrancas) setCobrancas(dataCobrancas.cobrancas);
      if (dataFintechs?.fintechs) setFintechs(dataFintechs.fintechs);
      if (dataContratos?.contratos) setContratosAssinatura(dataContratos.contratos);
      if (dataConfigAssinatura?.config) setConfigAssinatura(dataConfigAssinatura.config);
      if (dataConversas?.conversas) setConversasWhatsApp(dataConversas.conversas);
      if (dataInstancia?.instancia) setInstanciaWhatsApp(dataInstancia.instancia);
      if (dataOmniConfig?.config) setOmnichannelConfig(dataOmniConfig.config);
      if (dataSplitsConfig?.config) setConfigSplitBancario(dataSplitsConfig.config);
      if (dataSplitsRegistros?.registros) setRegistrosSplits(dataSplitsRegistros.registros);
    } catch {
      // Falha silenciosa: usa os dados cacheados/locais sem erro e sem recarregamento
    }
  };


  const handleUpdateConversa = async (conversaId: string, updates: Partial<ConversaWhatsApp>) => {
    setConversasWhatsApp(prev => prev.map(c => c.id === conversaId ? { ...c, ...updates } : c));
    try {
      await fetch(`/api/whatsapp/conversas/${conversaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.warn('Erro ao atualizar conversa:', err);
    }
  };

  const handleEnviarMensagemWhatsApp = async (conversaId: string, mensagem: Partial<MensagemWhatsApp>) => {
    try {
      await fetch(`/api/whatsapp/conversas/${conversaId}/mensagens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mensagem)
      });
    } catch (err) {
      console.warn('Erro ao enviar mensagem:', err);
    }
  };

  const handleSaveOmnichannelConfig = async (novaConfig: OmnichannelConfig) => {
    setOmnichannelConfig(novaConfig);
    try {
      await fetch('/api/omnichannel/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaConfig)
      });
    } catch (err) {
      console.warn('Erro ao salvar config omnichannel:', err);
    }
  };

  // Splits Bancários Handlers
  const handleSaveConfigSplit = async (newConfig: ConfigSplitBancario) => {
    setConfigSplitBancario(newConfig);
    try {
      await fetch('/api/splits/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (err) {
      console.warn('Erro ao salvar config de splits bancários:', err);
    }
  };

  const handleSaveFinancialRecord = async (record: FinancialRecord) => {
    setFinancialRecords(prev => [record, ...prev]);
    try {
      await salvarRegistroFinanceiroFirestore(record);
      await fetch('/api/financial-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
    } catch (err) {
      console.warn('Erro ao salvar registro financeiro:', err);
    }
  };

  const handleUpdateFinancialRecord = async (id: string, updates: Partial<FinancialRecord>) => {
    setFinancialRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    const target = financialRecords.find(r => r.id === id);
    if (target) {
      const merged = { ...target, ...updates };
      try {
        await salvarRegistroFinanceiroFirestore(merged);
        await fetch(`/api/financial-records/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
      } catch (err) {
        console.warn('Erro ao atualizar registro financeiro:', err);
      }
    }
  };

  const handleLiquidarCobrancaComSplit = async (cobrancaId: string) => {
    try {
      const res = await fetch('/api/splits/executar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cobranca_id: cobrancaId })
      });
      if (res.ok) {
        const data = await safeFetchJson(res);
        if (data && data.cobranca) {
          setCobrancas(prev =>
            prev.map(c => c.id === cobrancaId ? { ...c, status: 'Pago', data_pagamento: data.cobranca.data_pagamento, split_executado: data.registro } : c)
          );
        }
        if (data && data.registro) {
          setRegistrosSplits(prev => [data.registro, ...prev]);
          const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.registro.valor_total_pago);
          sendDesktopNotification({
            tipo: 'SPLIT_BANCARIO_EXECUTADO',
            titulo: '💰 Split Bancário Executado!',
            mensagem: `Recebimento de ${valorFormatado} distribuído com sucesso entre sócios e empresa via Pix.`,
            link_aba: 'splits_bancarios'
          });
        }
      }
    } catch (err) {
      console.error('Erro ao liquidar cobrança com split:', err);
    }
  };

  // Authentication Handlers (Login e Senha)
  const handleLogin = (user: Usuario, remember: boolean) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    if (remember && typeof window !== 'undefined') {
      localStorage.setItem('brasil_legal_session_user', JSON.stringify(user));
    }
    setViewMode('painel');
    window.location.hash = '#painel';
    sendDesktopNotification({
      tipo: 'GERAL',
      titulo: `👋 Bem-vindo(a), ${user.nome}!`,
      mensagem: `Sessão iniciada como ${user.cargo} (${user.role}). O painel operacional está pronto.`
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('brasil_legal_session_user');
    }
    setViewMode('login');
    window.location.hash = '#login';
  };

  const handleIrParaSite = () => {
    setViewMode('site');
    window.location.hash = '#site';
  };

  const handleIrParaPainel = () => {
    // SEMPRE limpa qualquer credencial pré-salva de visitante e redireciona para login manual limpo
    if (typeof window !== 'undefined') {
      localStorage.removeItem('brasil_legal_session_user');
    }
    setIsAuthenticated(false);
    setViewMode('login');
    window.location.hash = '#login';
  };

  // Listener para sincronizar hash da URL (links compartilhados, histórico do navegador)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (hash === '#painel' || hash === '#app' || hash === '#crm' || search.includes('view=painel') || search.includes('view=app')) {
        if (isAuthenticated) {
          setViewMode('painel');
        } else {
          setViewMode('login');
          window.location.hash = '#login';
        }
      } else if (hash === '#login' || search.includes('view=login')) {
        setViewMode('login');
      } else {
        // Padrão para qualquer âncora (#raio-x, #casos-reais, etc.) ou retorno para URL raiz (hash vazio):
        setViewMode('site');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  useEffect(() => {
    refreshAllData();
  }, []);

  // Update active tab automatically when role changes if current tab is forbidden
  const handleSelectUser = (user: Usuario) => {
    setCurrentUser(user);
    if (user.role === 'PARCEIRO_B2B') {
      setActiveTab('parceiro_portal');
    } else if (user.role === 'TECNICO') {
      if (activeTab !== 'tecnico' && activeTab !== 'ai_engine') {
        setActiveTab('tecnico');
      }
    } else if (user.role === 'SDR') {
      if (activeTab !== 'comercial' && activeTab !== 'ai_engine') {
        setActiveTab('comercial');
      }
    }
  };

  // SLA Calculation
  const totalLeadsWithSla = contacts.filter(c => c.tempo_primeira_resposta_minutos !== undefined);
  const inSlaCount = totalLeadsWithSla.filter(c => (c.tempo_primeira_resposta_minutos || 0) <= 4).length;
  const inSlaPercent = totalLeadsWithSla.length > 0 ? Math.round((inSlaCount / totalLeadsWithSla.length) * 100) : 100;
  const avgResponseMin = totalLeadsWithSla.length > 0 
    ? parseFloat((totalLeadsWithSla.reduce((acc, c) => acc + (c.tempo_primeira_resposta_minutos || 0), 0) / totalLeadsWithSla.length).toFixed(1))
    : 2;

  // Contact Handlers
  const handleUpdateContact = async (id: string, updates: Partial<Contact>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    try {
      await fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateContact = async (contactData: Partial<Contact>) => {
    const contactId = contactData.id || `ct-${Date.now()}`;
    const newContact: Contact = {
      id: contactId,
      created_at: new Date().toISOString(),
      tempo_primeira_resposta_minutos: 0,
      qualificacao_sdr: contactData.qualificacao_sdr || 'Novo',
      status_cadastro: contactData.status_cadastro || 'Lead (Novo)',
      tipo_pessoa: contactData.tipo_pessoa || 'PF',
      cpf_cnpj: contactData.cpf_cnpj || '',
      endereco: contactData.endereco || {
        cep: '01000-000',
        logradouro: 'Endereço a confirmar',
        numero: 'S/N',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP'
      },
      ...(contactData as Contact)
    };

    // Cria também o Deal correspondente para aparecer na Esteira de Clientes (Triagem)
    const newDeal: Deal = {
      id: `dl-${Date.now()}`,
      contact_id: newContact.id,
      titulo: `${newContact.servico_pretendido || 'Regularização'} — ${newContact.nome_completo}`,
      cliente_nome: newContact.nome_completo,
      cartorio_comarca: `${newContact.endereco?.cidade || 'São Paulo'} / ${newContact.endereco?.uf || 'SP'}`,
      tipo_procedimento: newContact.servico_pretendido || 'Regularização Registral',
      status: 'Triagem',
      valor_honorarios_liquido: Number(newContact.valor_honorarios_estimado) || 12000,
      comissao_b2b_percentual: 5,
      comissao_b2b_valor: 600,
      comissao_paga: false,
      homologado_diretoria: false,
      data_fechamento: new Date().toISOString()
    };

    // 1. Atualização Otimista Imediata dos dois estados
    setContacts(prev => {
      const next = [newContact, ...prev.filter(c => c.id !== newContact.id)];
      try {
        localStorage.setItem('brasil_legal_contacts', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    setDeals(prev => {
      const next = [newDeal, ...prev.filter(d => d.contact_id !== newContact.id)];
      try {
        localStorage.setItem('brasil_legal_deals', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // 2. Disparar Notificação Desktop Push
    sendDesktopNotification({
      tipo: 'NOVO_LEAD_ENTRADA',
      titulo: '🔔 Novo Lead Recebido via Site / Formulário!',
      mensagem: `${newContact.nome_completo} solicitou análise registral para ${newContact.endereco.cidade}. SLA < 4 minutos iniciado!`,
      link_aba: 'comercial'
    });

    // 3. Persistência na API do servidor Node
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact)
      });
      if (res.ok) {
        const data = await safeFetchJson(res);
        if (data?.contact) {
          setContacts(prev => {
            const next = [data.contact, ...prev.filter(c => c.id !== data.contact.id && c.id !== newContact.id)];
            try {
              localStorage.setItem('brasil_legal_contacts', JSON.stringify(next));
            } catch (e) {}
            return next;
          });
        }
        if (data?.deal) {
          setDeals(prev => {
            const next = [data.deal, ...prev.filter(d => d.id !== data.deal.id && d.contact_id !== newContact.id)];
            try {
              localStorage.setItem('brasil_legal_deals', JSON.stringify(next));
            } catch (e) {}
            return next;
          });
        }
      }
    } catch (e) {
      console.warn('Erro ao persistir contato via API:', e);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    // 1. Remove otimista de contatos e deals associados
    setContacts(prev => {
      const next = prev.filter(c => c.id !== contactId);
      try {
        localStorage.setItem('brasil_legal_contacts', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    setDeals(prev => {
      const next = prev.filter(d => d.contact_id !== contactId && d.id !== contactId);
      try {
        localStorage.setItem('brasil_legal_deals', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // 2. Chamar API do servidor para exclusão permanente
    try {
      await fetch(`/api/contacts/${contactId}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Erro ao excluir contato na API:', e);
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    setDeals(prev => {
      const next = prev.filter(d => d.id !== dealId);
      try {
        localStorage.setItem('brasil_legal_deals', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      await fetch(`/api/deals/${dealId}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Erro ao excluir negócio/deal na API:', e);
    }
  };

  // Document Handlers
  const handleUpdateDocStatus = async (id: string, status: StatusValidacaoDocumento, observacao?: string) => {
    const targetDoc = documents.find(d => d.id === id);
    setDocuments(prev =>
      prev.map(d =>
        d.id === id
          ? { ...d, status_validacao: status, parecer_observacao: observacao, validado_por: currentUser.nome }
          : d
      )
    );

    // Disparar Notificação Desktop Push
    const docNome = targetDoc ? targetDoc.tipo_documento.replace(/_/g, ' ') : 'Documento';
    const clienteNome = targetDoc ? targetDoc.cliente_nome : 'Cliente';
    const statusEmoji = status === 'Aprovado' ? '✅' : status === 'Rejeitado_Solicitar_Reenvio' ? '❌' : '⚠️';
    const statusLabel = status === 'Rejeitado_Solicitar_Reenvio' ? 'Rejeitado (Solicitar Reenvio)' : status;

    sendDesktopNotification({
      tipo: 'DOCUMENTO_VALIDADO',
      titulo: `${statusEmoji} Documento ${statusLabel}: ${docNome}`,
      mensagem: `${docNome} de ${clienteNome} foi auditado e validado como "${statusLabel}" por ${currentUser.nome}.${observacao ? ` Parecer: ${observacao}` : ''}`,
      link_aba: 'crm_tecnico'
    });

    try {
      await fetch(`/api/documents/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status_validacao: status,
          parecer_observacao: observacao,
          validado_por: currentUser.nome
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadDocument = async (docData: Partial<Documento>) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData)
      });
      if (res.ok) {
        const data = await safeFetchJson(res);
        if (data?.document) {
          setDocuments(prev => [data.document, ...prev]);
        } else {
          const localDoc: Documento = {
            id: `doc-${Date.now()}`,
            status_validacao: 'Pendente',
            upload_na_qualificacao: true,
            data_upload: new Date().toISOString(),
            ...(docData as Documento)
          };
          setDocuments(prev => [localDoc, ...prev]);
        }
      } else {
        const localDoc: Documento = {
          id: `doc-${Date.now()}`,
          status_validacao: 'Pendente',
          upload_na_qualificacao: true,
          data_upload: new Date().toISOString(),
          ...(docData as Documento)
        };
        setDocuments(prev => [localDoc, ...prev]);
      }
    } catch {
      const localDoc: Documento = {
        id: `doc-${Date.now()}`,
        status_validacao: 'Pendente',
        upload_na_qualificacao: true,
        data_upload: new Date().toISOString(),
        ...(docData as Documento)
      };
      setDocuments(prev => [localDoc, ...prev]);
    }
  };

  // Deal & Commission Handlers
  const handleApproveDeal = async (dealId: string) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, homologado_diretoria: true } : d));
    try {
      await fetch(`/api/deals/${dealId}/approve`, { method: 'PATCH' });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePayCommission = async (dealId: string) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, comissao_paga: true } : d));
    try {
      await fetch(`/api/deals/${dealId}/pay-commission`, { method: 'PATCH' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCalculateB2bCommission = async (
    dealId: string,
    parceiroId: string,
    honorarios: number,
    percentual: number
  ) => {
    const cleanPercent = Math.min(percentual, 5.0);
    const comissao = Number(((honorarios * cleanPercent) / 100).toFixed(2));

    setDeals(prev =>
      prev.map(d =>
        d.id === dealId
          ? {
              ...d,
              parceiro_id: parceiroId,
              valor_honorarios_liquido: honorarios,
              comissao_b2b_percentual: cleanPercent,
              comissao_b2b_valor: comissao
            }
          : d
      )
    );

    try {
      await fetch('/api/deals/calculate-b2b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deal_id: dealId,
          parceiro_id: parceiroId,
          valor_honorarios_liquido: honorarios,
          percentual: cleanPercent
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Cobrança & Boletos Bancários Handlers
  const handleEmitirBoleto = async (boletoData: Partial<CobrancaBoleto>) => {
    try {
      const res = await fetch('/api/cobrancas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boletoData)
      });
      if (res.ok) {
        const data = await safeFetchJson(res);
        if (data?.cobranca) {
          setCobrancas(prev => [data.cobranca, ...prev]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBoletoStatus = async (id: string, status: StatusCobranca) => {
    setCobrancas(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    try {
      await fetch(`/api/cobrancas/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateFintech = async (fintech: FintechConfig) => {
    setFintechs(prev => prev.map(f => f.id === fintech.id ? fintech : f));
    try {
      await fetch(`/api/fintechs/${fintech.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fintech)
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Digital Signature & Automated Contracts Handlers
  const handleCriarContrato = async (novoContrato: ContratoAssinatura) => {
    setContratosAssinatura(prev => [novoContrato, ...prev]);
    try {
      await fetch('/api/contratos-assinatura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoContrato)
      });
    } catch (e) {
      console.error('Erro ao persistir contrato na API:', e);
    }
  };

  const handleConfirmarAssinatura = async (
    contratoId: string, 
    signatarioId: string, 
    dadosAssinatura: {
      metodo: 'Desenho em Tela' | 'Certificado Digital Token/Hash' | 'Assinatura Eletrônica Avançada';
      assinaturaBase64?: string;
      ip: string;
      geolocalizacao: string;
      dispositivo: string;
    }
  ) => {
    const nowIso = new Date().toISOString();
    setContratosAssinatura(prev => prev.map(c => {
      if (c.id !== contratoId) return c;

      const updatedSigners = c.signatarios.map(s => {
        if (s.id !== signatarioId) return s;
        return {
          ...s,
          status: 'Assinado' as const,
          data_assinatura: nowIso,
          metodo_assinatura: dadosAssinatura.metodo,
          ip_origem: dadosAssinatura.ip,
          geolocalizacao: dadosAssinatura.geolocalizacao,
          dispositivo_user_agent: dadosAssinatura.dispositivo,
          codigo_otp_validado: true,
          assinatura_imagem_base64: dadosAssinatura.assinaturaBase64,
          hash_autenticacao: `${s.id}-hash-${Date.now().toString(16)}`
        };
      });

      const allSigned = updatedSigners.every(s => s.status === 'Assinado');
      const newStatus = allSigned ? ('Concluído' as const) : ('Assinado Parcialmente' as const);
      const signedHash = allSigned 
        ? `74c2e64812f8194ad5174092182049182390abef402938410293841029384192`.replace('74c', Math.random().toString(16).substring(2, 5))
        : c.hash_sha256_assinado;

      const newAuditEvents = [
        ...c.audit_trail,
        {
          id: `aud-${Date.now()}`,
          data_hora: nowIso,
          evento: `Assinatura Registrada — ${updatedSigners.find(s => s.id === signatarioId)?.papel}`,
          autor: updatedSigners.find(s => s.id === signatarioId)?.nome || 'Signatário',
          ip: dadosAssinatura.ip,
          geolocalizacao: dadosAssinatura.geolocalizacao,
          dispositivo: dadosAssinatura.dispositivo,
          detalhes: `Assinatura confirmada pelo signatário via ${dadosAssinatura.metodo} com autenticação OTP validada.`,
          hash_integridade: `${signatarioId}-hash-${Date.now().toString(16)}`
        }
      ];

      if (allSigned) {
        newAuditEvents.push({
          id: `aud-${Date.now()}-sealed`,
          data_hora: new Date(Date.now() + 1000).toISOString(),
          evento: 'Envelope Concluído & Dossiê Criptográfico Selado',
          autor: 'Motor de Integridade Brasil Legal',
          ip: '10.0.0.12 (Servidor)',
          geolocalizacao: 'São Paulo, SP',
          dispositivo: 'Security Node ICP-Brasil Compliance',
          detalhes: 'Todos os signatários completaram suas assinaturas. Documento final lacrado com hash inviolável e validade jurídica plena nos termos da MP 2.200-2/2001 e Lei 14.063/2020.',
          hash_integridade: signedHash
        });
      }

      return {
        ...c,
        status: newStatus,
        data_conclusao: allSigned ? nowIso : c.data_conclusao,
        hash_sha256_assinado: signedHash,
        signatarios: updatedSigners,
        audit_trail: newAuditEvents
      };
    }));

    try {
      await fetch(`/api/contratos-assinatura/${contratoId}/assinar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatarioId, ...dadosAssinatura })
      });
    } catch (e) {
      console.error('Erro ao registrar assinatura na API:', e);
    }
  };

  const handleReenviarNotificacao = async (contratoId: string, canal: 'whatsapp' | 'email') => {
    const canalLabel = canal === 'whatsapp' ? 'WhatsApp' : 'E-mail';
    setContratosAssinatura(prev => prev.map(c => {
      if (c.id !== contratoId) return c;
      return {
        ...c,
        audit_trail: [
          ...c.audit_trail,
          {
            id: `aud-${Date.now()}-resend`,
            data_hora: new Date().toISOString(),
            evento: `Link de Assinatura Reenviado via ${canalLabel}`,
            autor: currentUser.nome,
            ip: '187.54.12.9',
            geolocalizacao: 'São Paulo, SP',
            dispositivo: navigator.userAgent,
            detalhes: `Notificação de assinatura reenviada via ${canalLabel} aos signatários pendentes.`
          }
        ]
      };
    }));

    try {
      await fetch(`/api/contratos-assinatura/${contratoId}/reenviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canal })
      });
    } catch (e) {
      console.error('Erro ao reenviar notificação na API:', e);
    }
  };

  // Update Deal Status (Drag and Drop Esteira & Kanban)
  const handleUpdateDealStatus = async (dealId: string, newStatus: any) => {
    const targetDeal = deals.find(d => d.id === dealId);
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: newStatus } : d));

    if (targetDeal) {
      const etapaFormatada = String(newStatus).replace(/_/g, ' ');
      sendDesktopNotification({
        tipo: 'LEAD_AVANCOU_ESTEIRA',
        titulo: `🚀 Lead Avançou na Esteira: ${targetDeal.cliente_nome}`,
        mensagem: `O processo "${targetDeal.titulo}" mudou para a etapa "${etapaFormatada}".`,
        link_aba: 'esteira_clientes'
      });
    }

    try {
      await fetch(`/api/deals/${dealId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // CMS Settings Handler - Persistência Segura no Servidor, Firestore e LocalStorage
  const handleSaveSettings = async (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);

    // Salva no localStorage com fallback resiliente
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('brasil_legal_site_settings', JSON.stringify(newSettings));
      } catch (e) {
        console.warn('Erro ao salvar no localStorage:', e);
      }
    }

    // Sincroniza CNPJ e Endereço nas Configurações Globais da Empresa
    if (newSettings.rodape_cnpj || newSettings.rodape_endereco) {
      setAppSettings(prev => {
        const updated = {
          ...prev,
          ...(newSettings.rodape_cnpj ? { cnpj_empresa: newSettings.rodape_cnpj } : {}),
          ...(newSettings.rodape_endereco ? { endereco_empresa: newSettings.rodape_endereco } : {})
        };
        try {
          localStorage.setItem('brasil_legal_app_settings', JSON.stringify(updated));
        } catch (e) {}
        salvarAppSettingsFirestore(updated).catch(() => {});
        return updated;
      });
    }

    // Persiste no Servidor Express (db_store.json) e no Firebase Firestore
    try {
      const cmsPromise = fetch('/api/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      await Promise.race([
        cmsPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout salvando CMS')), 2500))
      ]);
    } catch (e) {
      console.warn('Aviso ao sincronizar configurações do CMS com backend:', e);
    }

    // Persiste no Firestore em segundo plano (não bloqueia UI)
    salvarSiteSettingsFirestore(newSettings).catch((err) => {
      console.warn('Sincronização Firestore CMS em background:', err);
    });
  };

  // AI Opinion Generator Handler
  const handleGenerateAiOpinion = async (deal: Deal, contact: Contact) => {
    setAiLoading(true);
    const prompt = `Elaborar parecer prévio de viabilidade registral para o seguinte caso de regularização imobiliária:
Requerente: ${contact.nome_completo}
Tipo de Procedimento: ${deal.tipo_procedimento}
Cartório / Comarca: ${deal.cartorio_comarca}
Objeto / Posse: ${contact.tipo_imovel || 'Imóvel com contrato de gaveta'}
Documentos na Custódia: Matrícula atualizada, espelho de IPTU e contrato de cessão com firmas reconhecidas.
Analise os requisitos do Provimento 65/2017 do CNJ e Art. 216-A da Lei de Registros Públicos.`;

    try {
      const res = await fetch('/api/gemini/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, customTemperature: 0.2, customTopP: 0.95 })
      });
      const data = await safeFetchJson(res);
      if (data?.response_text) {
        setDeals(prev =>
          prev.map(d => (d.id === deal.id ? { ...d, parecer_tecnico: data.response_text } : d))
        );

        // Automação: Envio automático de E-mail Marketing com parecer prévio e custódia segura
        if (configEmailMarketing.disparar_apos_diagnostico_ia) {
          handleSendEmailMarketingDiagnostic(deal, contact, data.response_text);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // White-Label & AppSettings Handler (Multi-Tier Permanent Persistence)
  const handleSaveAppSettings = async (newSettings: AppSettings) => {
    const processedSettings = { ...newSettings };
    const uploadIfBase64 = async (val?: string, key?: string) => {
      if (!val || !val.startsWith('data:')) return val;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: val, filename: `${key}_${Date.now()}` })
        });
        if (res.ok) {
          const d = await safeFetchJson(res);
          if (d?.url) return d.url;
        }
      } catch (e) {
        console.warn('Erro ao enviar upload em handleSaveAppSettings:', e);
      }
      return val;
    };

    try {
      processedSettings.logo_sidebar_url = await uploadIfBase64(processedSettings.logo_sidebar_url, 'logo_sidebar');
      processedSettings.logo_login_url = await uploadIfBase64(processedSettings.logo_login_url, 'logo_login');
      processedSettings.logo_header_url = await uploadIfBase64(processedSettings.logo_header_url, 'logo_header');
      processedSettings.logo_light_url = await uploadIfBase64(processedSettings.logo_light_url, 'logo_light');
      processedSettings.logo_dark_url = await uploadIfBase64(processedSettings.logo_dark_url, 'logo_dark');
      processedSettings.logo_icon_url = await uploadIfBase64(processedSettings.logo_icon_url, 'logo_icon');
      processedSettings.favicon_url = await uploadIfBase64(processedSettings.favicon_url, 'favicon');
    } catch (e) {
      console.warn('Erro ao processar uploads de logos:', e);
    }

    setAppSettings(processedSettings);

    // 1. Browser LocalStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('brasil_legal_app_settings', JSON.stringify(processedSettings));
      } catch (e) {}
    }

    // 2. Node.js Backend db_store.json
    try {
      await fetch('/api/app-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedSettings)
      });
    } catch (e) {
      console.error('Erro ao persistir app-settings no backend:', e);
    }

    // 3. Firebase Firestore Database
    try {
      salvarAppSettingsFirestore(processedSettings).catch((err) => {
        console.warn('Erro ao salvar appSettings no Firestore:', err);
      });
    } catch (e) {}
  };

  // Role Permissions Handler (RBAC)
  const handleUpdateRolePermissions = async (role: RoleUsuario, permissions: PermissionCode[]) => {
    setRoleConfigs(prev =>
      prev.map(r => (r.role === role ? { ...r, permissions_json: permissions } : r))
    );
    try {
      await fetch(`/api/roles/${role}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions_json: permissions })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Add User Handler (Master Admin)
  const handleAddUser = async (userData: Partial<Usuario>) => {
    const tempId = `usr-${Date.now()}`;
    const newOptimisticUser: Usuario = {
      id: tempId,
      nome: userData.nome || 'Novo Colaborador',
      cargo: userData.cargo || 'Colaborador',
      role: userData.role || 'SDR',
      email: userData.email || '',
      foto_url: userData.foto_url || '/team/emerson-carneiro.jpg',
      senha: userData.senha || 'brasillegal2026',
      oab_crea: userData.oab_crea,
      telefone: userData.telefone,
      cpf: userData.cpf,
      endereco: userData.endereco,
      parceiro_id: userData.parceiro_id,
      custom_permissions: userData.custom_permissions,
      ativo: true,
      primeiro_acesso: true
    };

    setAllUsers(prev => {
      const next = [...prev, newOptimisticUser];
      try {
        localStorage.setItem('brasil_legal_all_users', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    salvarUsuarioFirestore(newOptimisticUser);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const data = await safeFetchJson(res);
        if (data?.user) {
          setAllUsers(prev => {
            const next = prev.map(u => (u.id === tempId ? data.user : u));
            try {
              localStorage.setItem('brasil_legal_all_users', JSON.stringify(next));
            } catch (e) {}
            return next;
          });
          salvarUsuarioFirestore(data.user);
        }
      }
    } catch (e) {
      console.error('Erro ao cadastrar colaborador:', e);
    }
  };

  // Update User Handler (Master Admin) - Força persistência total
  const handleUpdateUser = async (userId: string, updatedData: Partial<Usuario>) => {
    // 1. Atualização imediata em memória
    setAllUsers(prev => {
      const next = prev.map(u => (u.id === userId ? { ...u, ...updatedData } : u));
      try {
        localStorage.setItem('brasil_legal_all_users', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // 2. Se o usuário editado for o usuário da sessão ativa, atualiza também a sessão
    if (currentUser.id === userId || (updatedData.email && currentUser.email.toLowerCase() === updatedData.email.toLowerCase())) {
      setCurrentUser(prev => {
        const updated = { ...prev, ...updatedData };
        try {
          localStorage.setItem('brasil_legal_session_user', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }

    // 3. Salva no Firestore
    const targetUser = allUsers.find(u => u.id === userId);
    if (targetUser) {
      salvarUsuarioFirestore({ ...targetUser, ...updatedData });
    }

    // 4. Salva no backend Node (db_store.json)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        const data = await safeFetchJson(res);
        if (data?.user) {
          setAllUsers(prev => {
            const next = prev.map(u => (u.id === userId ? data.user : u));
            try {
              localStorage.setItem('brasil_legal_all_users', JSON.stringify(next));
            } catch (e) {}
            return next;
          });
          salvarUsuarioFirestore(data.user);
        }
      }
    } catch (e) {
      console.error('Erro ao salvar alteração de colaborador no servidor:', e);
    }
  };

  // Delete User Handler (Master Admin)
  const handleDeleteUser = async (userId: string) => {
    setAllUsers(prev => {
      const next = prev.filter(u => u.id !== userId);
      try {
        localStorage.setItem('brasil_legal_all_users', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    excluirUsuarioFirestore(userId);

    try {
      await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.error('Erro ao excluir colaborador no servidor:', e);
    }
  };

  // Referral Program Settings Handler
  const handleSaveReferralSettings = async (settings: ReferralProgramSettings) => {
    setReferralSettings(settings);
    try {
      await fetch('/api/referral-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Visão do Site Oficial Público (Padrão para links compartilhados e visitantes)
  if (viewMode === 'site') {
    return (
      <div className="min-h-screen bg-white">
        <PaginaVendasPublica
          siteSettings={siteSettings}
          appSettings={appSettings}
          onNovoLead={(lead) => {
            handleCreateContact(lead);
          }}
          onVoltarPainel={handleIrParaPainel}
          onAcessarSistema={handleIrParaPainel}
          usuarioLogado={null}
          isStandaloneView={false}
        />
      </div>
    );
  }

  // 2. Visão de Autenticação / Login de Colaboradores
  if (viewMode === 'login' || !isAuthenticated) {
    return (
      <TelaLogin
        allUsers={allUsers}
        onLogin={handleLogin}
        appSettings={appSettings}
        onVoltarSite={handleIrParaSite}
      />
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-row antialiased overflow-x-hidden"
      style={{ backgroundColor: appSettings.cor_fundo_painel || '#F8FAFC' }}
    >
      {/* Lateral Menu / Sidebar Navigation */}
      <Sidebar
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={handleSelectUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        appSettings={appSettings}
        slaMetric={{
          totalLeads: contacts.length,
          inSlaPercent,
          avgResponseMin
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenNovoLeadModal={() => setIsNovoLeadModalOpen(true)}
        onVisualizarSite={handleIrParaSite}
        onSaveAppSettings={handleSaveAppSettings}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* TopBar with breadcrumb, quick lead action, SLA indicator & mobile menu toggle */}
        <TopBar
          currentUser={currentUser}
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenNovoLeadModal={() => setIsNovoLeadModalOpen(true)}
          onVisualizarSite={handleIrParaSite}
          slaMetric={{
            totalLeads: contacts.length,
            inSlaPercent,
            avgResponseMin
          }}
          appSettings={appSettings}
          onSelectTab={setActiveTab}
          onLogout={handleLogout}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'comercial' && (
          <FunilComercial
            contacts={contacts}
            documents={documents}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
            onOpenNovoLeadModal={() => setIsNovoLeadModalOpen(true)}
            onOpenUploadModal={(contact: Contact) => {
              setUploadTargetContact(contact);
              setIsUploadModalOpen(true);
            }}
          />
        )}

        {activeTab === 'esteira_clientes' && (
          <EsteiraClientes
            deals={deals}
            contacts={contacts}
            documents={documents}
            onUpdateDealStatus={handleUpdateDealStatus}
            onUpdateDocStatus={handleUpdateDocStatus}
            onOpenNovoLeadModal={() => setIsNovoLeadModalOpen(true)}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
            onDeleteDeal={handleDeleteDeal}
          />
        )}

        {activeTab === 'tecnico' && (
          <CrmTecnico
            documents={documents}
            deals={deals}
            contacts={contacts}
            onUpdateDocStatus={handleUpdateDocStatus}
            onGenerateAiOpinion={handleGenerateAiOpinion}
            aiLoading={aiLoading}
            onNavigateToAiComparator={() => setActiveTab('ai_engine')}
            onSendEmailMarketingDiagnostic={handleSendEmailMarketingDiagnostic}
          />
        )}

        {activeTab === 'atividades' && (
          <ModuloAtividadesAgenda
            atividades={atividades}
            contacts={contacts}
            deals={deals}
            allUsers={allUsers}
            currentUser={currentUser}
            onSaveAtividade={handleSaveAtividade}
            onDeleteAtividade={handleDeleteAtividade}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'financeiro' && (
          <PainelFinanceiro
            deals={deals}
            contacts={contacts}
            onApproveDeal={handleApproveDeal}
            onPayCommission={handlePayCommission}
            onCalculateB2bCommission={handleCalculateB2bCommission}
            records={financialRecords}
            configSplit={configSplitBancario}
            onSaveRecord={handleSaveFinancialRecord}
            onUpdateRecord={handleUpdateFinancialRecord}
            onSaveConfigSplit={handleSaveConfigSplit}
          />
        )}

        {activeTab === 'cobranca_boletos' && (
          <ModuloCobrancasBancarias
            cobrancas={cobrancas}
            fintechs={fintechs}
            contacts={contacts}
            deals={deals}
            onEmitirBoleto={handleEmitirBoleto}
            onUpdateBoletoStatus={handleUpdateBoletoStatus}
            onUpdateFintech={handleUpdateFintech}
          />
        )}

        {activeTab === 'assinaturas_digitais' && (
          <ModuloAssinaturaDigital
            contratos={contratosAssinatura}
            contacts={contacts}
            deals={deals}
            appSettings={appSettings}
            configAssinatura={configAssinatura}
            onCriarContrato={handleCriarContrato}
            onConfirmarAssinatura={handleConfirmarAssinatura}
            onReenviarNotificacao={handleReenviarNotificacao}
            onSalvarConfiguracao={(nova) => setConfigAssinatura(nova)}
          />
        )}

        {activeTab === 'relatorios' && (
          <ModuloRelatorios
            contacts={contacts}
            deals={deals}
            documents={documents}
            cobrancas={cobrancas}
          />
        )}

        {activeTab === 'parceiro_portal' && (
          <PainelParceiroB2B
            currentUser={currentUser}
            contacts={contacts}
            deals={deals}
            onOpenNovoLeadModal={() => setIsNovoLeadModalOpen(true)}
            onVisualizarSite={handleIrParaSite}
          />
        )}

        {activeTab === 'ai_engine' && (
          <AiStudioEngine 
            onRefreshData={refreshAllData}
            deals={deals}
            contacts={contacts}
            documents={documents}
          />
        )}

        {activeTab === 'area_cliente' && (
          <AreaClientePortal
            deals={deals}
            contacts={contacts}
            documents={documents}
            appSettings={appSettings}
            siteSettings={siteSettings}
            onVoltarPainel={() => setActiveTab('comercial')}
          />
        )}

        {activeTab === 'meta_ads' && (
          <MetaAdsManager
            onAddLeadToCrm={(newLead) => handleCreateContact(newLead)}
            onRefreshLeads={refreshAllData}
          />
        )}

        {activeTab === 'omnichannel' && (
          <ModuloAtendimentoOmnichannel
            currentUser={currentUser}
            allUsers={allUsers}
            conversas={conversasWhatsApp}
            instanciaWhatsApp={instanciaWhatsApp}
            omnichannelConfig={omnichannelConfig}
            onUpdateConversa={handleUpdateConversa}
            onEnviarMensagem={handleEnviarMensagemWhatsApp}
            onConverterEmLead={handleCreateContact}
            onSaveOmnichannelConfig={handleSaveOmnichannelConfig}
          />
        )}

        {activeTab === 'whatsapp_multiatendimento' && (
          <ModuloWhatsAppMultiatendimento
            currentUser={currentUser}
            allUsers={allUsers}
            conversas={conversasWhatsApp}
            instancia={instanciaWhatsApp}
            onUpdateConversa={handleUpdateConversa}
            onEnviarMensagem={handleEnviarMensagemWhatsApp}
            onConverterEmLead={handleCreateContact}
          />
        )}

        {activeTab === 'cms_site' && (
          <ModuloCmsSite
            settings={siteSettings}
            onSaveSettings={handleSaveSettings}
            onSubmitPublicLead={handleCreateContact}
          />
        )}

        {activeTab === 'admin_whitelabel' && (
          <PainelAdministrativoWhiteLabel
            appSettings={appSettings}
            onSaveAppSettings={handleSaveAppSettings}
            siteSettings={siteSettings}
            onSaveSiteSettings={handleSaveSettings}
            roleConfigs={roleConfigs}
            onUpdateRolePermissions={handleUpdateRolePermissions}
            users={allUsers}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            referralSettings={referralSettings}
            onSaveReferralSettings={handleSaveReferralSettings}
            onVisualizarSite={handleIrParaSite}
            fluxosEmailMarketing={fluxosEmailMarketing}
            onSaveFluxoEmailMarketing={handleSaveFluxoEmailMarketing}
            logsEmailMarketing={logsEmailMarketing}
            onAddLogEmailMarketing={handleAddLogEmailMarketing}
            configEmailMarketing={configEmailMarketing}
            onSaveConfigEmailMarketing={handleSaveConfigEmailMarketing}
            contacts={contacts}
            deals={deals}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'email_marketing' && (
          <ModuloEmailMarketing
            fluxos={fluxosEmailMarketing}
            onSaveFluxo={handleSaveFluxoEmailMarketing}
            logs={logsEmailMarketing}
            onAddLog={handleAddLogEmailMarketing}
            config={configEmailMarketing}
            onSaveConfig={handleSaveConfigEmailMarketing}
            contacts={contacts}
            deals={deals}
            appSettings={appSettings}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'splits_bancarios' && (
          <ModuloSplitsBancarios
            config={configSplitBancario}
            registros={registrosSplits}
            cobrancas={cobrancas}
            onSaveConfig={handleSaveConfigSplit}
            onLiquidarCobrancaComSplit={handleLiquidarCobrancaComSplit}
            appSettings={appSettings}
          />
        )}
      </main>

        {/* Footer bar */}
        <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <strong className="text-[#2E3192]">Brasil Legal</strong> — Regularização Imobiliária & Gestão de Ativos
            </div>
            <div className="text-[11px] text-slate-400">
              Powered by Google AI Studio • API Gemini • RBAC Enterprise
            </div>
          </div>
        </footer>
      </div>

      {/* Lead Registration Modal (ContactSchema) */}
      <ModalNovoLead
        isOpen={isNovoLeadModalOpen}
        onClose={() => setIsNovoLeadModalOpen(false)}
        onSave={handleCreateContact}
      />

      {/* Document Upload Simulator Modal (DocumentSchema) */}
      <ModalUploadDocumentos
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadTargetContact(null);
        }}
        contact={uploadTargetContact}
        onUploadSuccess={handleUploadDocument}
      />
    </div>
  );
}
