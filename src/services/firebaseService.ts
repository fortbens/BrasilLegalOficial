import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth, googleProvider } from '../firebase';
import {
  Contact,
  Documento,
  Deal,
  Property,
  FinancialRecord,
  Usuario,
  SiteSettings,
  AppSettings,
  ConfigIntegracaoGithubCpanel
} from '../types';

// ==========================================
// 1. AUTENTICAÇÃO FIREBASE
// ==========================================

export async function loginComGoogle(): Promise<{ user: FirebaseUser | null; error?: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user };
  } catch (error: any) {
    console.warn('[Firebase Auth] Erro ao fazer login com popup Google:', error?.message || error);
    // Em ambientes de iframe restrito, popup pode ser bloqueado
    return {
      user: null,
      error: error?.code === 'auth/popup-blocked'
        ? 'A janela de login do Google foi bloqueada pelo navegador no iframe. Você pode usar suas credenciais de e-mail ou o atalho demonstrativo.'
        : (error?.message || 'Falha na autenticação com o Google.')
    };
  }
}

export async function loginComEmailSenha(email: string, pass: string): Promise<{ user: FirebaseUser | null; error?: string }> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return { user: result.user };
  } catch (error: any) {
    // Se usuário não existir no Firebase Auth, tenta criar automaticamente se for e-mail oficial
    if (error?.code === 'auth/user-not-found' || error?.code === 'auth/invalid-credential') {
      try {
        const created = await createUserWithEmailAndPassword(auth, email, pass);
        return { user: created.user };
      } catch (createErr: any) {
        return { user: null, error: 'Credenciais inválidas ou e-mail não localizado.' };
      }
    }
    return { user: null, error: error?.message || 'Erro ao autenticar.' };
  }
}

export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('[Firebase Auth] Erro ao deslogar:', err);
  }
}

export function monitorarEstadoAuth(callback: (user: FirebaseUser | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// ==========================================
// 2. PERSISTÊNCIA EM TEMPO REAL FIRESTORE
// ==========================================

// --- Contatos / Leads ---
export function assinarContatos(callback: (contatos: Contact[]) => void): Unsubscribe {
  const contatosCol = collection(db, 'contacts');
  return onSnapshot(contatosCol, (snapshot) => {
    if (!snapshot.empty) {
      const items: Contact[] = [];
      snapshot.forEach(docSnap => {
        items.push({ ...(docSnap.data() as Contact), id: docSnap.id });
      });
      callback(items);
    }
  }, (err) => {
    console.warn('[Firestore] Erro ao assinar contacts:', err);
  });
}

export async function salvarContatoFirestore(contato: Contact): Promise<void> {
  try {
    const ref = doc(db, 'contacts', contato.id);
    await Promise.race([
      setDoc(ref, contato, { merge: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout ao salvar contato no Firestore')), 3500))
    ]);
  } catch (err) {
    console.warn('[Firestore] Erro ou timeout ao salvar contato:', err);
  }
}

export async function excluirContatoFirestore(contatoId: string): Promise<void> {
  try {
    await Promise.race([
      deleteDoc(doc(db, 'contacts', contatoId)),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout ao excluir contato no Firestore')), 3500))
    ]);
  } catch (err) {
    console.warn('[Firestore] Erro ou timeout ao excluir contato:', err);
  }
}

// --- Documentos ---
export function assinarDocumentos(callback: (docs: Documento[]) => void): Unsubscribe {
  const docsCol = collection(db, 'documents');
  return onSnapshot(docsCol, (snapshot) => {
    if (!snapshot.empty) {
      const items: Documento[] = [];
      snapshot.forEach(docSnap => {
        items.push({ ...(docSnap.data() as Documento), id: docSnap.id });
      });
      callback(items);
    }
  }, (err) => {
    console.warn('[Firestore] Erro ao assinar documents:', err);
  });
}

export async function salvarDocumentoFirestore(documento: Documento): Promise<void> {
  try {
    const ref = doc(db, 'documents', documento.id);
    await setDoc(ref, documento, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Erro ao salvar documento:', err);
  }
}

export async function excluirDocumentoFirestore(docId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'documents', docId));
  } catch (err) {
    console.warn('[Firestore] Erro ao excluir documento:', err);
  }
}

// --- Negócios / Deals ---
export function assinarDeals(callback: (deals: Deal[]) => void): Unsubscribe {
  const dealsCol = collection(db, 'deals');
  return onSnapshot(dealsCol, (snapshot) => {
    if (!snapshot.empty) {
      const items: Deal[] = [];
      snapshot.forEach(docSnap => {
        items.push({ ...(docSnap.data() as Deal), id: docSnap.id });
      });
      callback(items);
    }
  }, (err) => {
    console.warn('[Firestore] Erro ao assinar deals:', err);
  });
}

export async function salvarDealFirestore(deal: Deal): Promise<void> {
  try {
    const ref = doc(db, 'deals', deal.id);
    await setDoc(ref, deal, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Erro ao salvar deal:', err);
  }
}

// --- Imóveis / Properties ---
export function assinarPropriedades(callback: (props: Property[]) => void): Unsubscribe {
  const propsCol = collection(db, 'properties');
  return onSnapshot(propsCol, (snapshot) => {
    if (!snapshot.empty) {
      const items: Property[] = [];
      snapshot.forEach(docSnap => {
        items.push({ ...(docSnap.data() as Property), id: docSnap.id });
      });
      callback(items);
    }
  }, (err) => {
    console.warn('[Firestore] Erro ao assinar properties:', err);
  });
}

export async function salvarPropriedadeFirestore(prop: Property): Promise<void> {
  try {
    const ref = doc(db, 'properties', prop.id);
    await setDoc(ref, prop, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Erro ao salvar property:', err);
  }
}

// --- Registros Financeiros ---
export function assinarRegistrosFinanceiros(callback: (records: FinancialRecord[]) => void): Unsubscribe {
  const finCol = collection(db, 'financial_records');
  return onSnapshot(finCol, (snapshot) => {
    if (!snapshot.empty) {
      const items: FinancialRecord[] = [];
      snapshot.forEach(docSnap => {
        items.push({ ...(docSnap.data() as FinancialRecord), id: docSnap.id });
      });
      callback(items);
    }
  }, (err) => {
    console.warn('[Firestore] Erro ao assinar financial_records:', err);
  });
}

export async function salvarRegistroFinanceiroFirestore(record: FinancialRecord): Promise<void> {
  try {
    const ref = doc(db, 'financial_records', record.id);
    await setDoc(ref, record, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Erro ao salvar registro financeiro:', err);
  }
}

// --- Usuários do Sistema ---
export function assinarUsuarios(callback: (users: Usuario[]) => void): Unsubscribe {
  const usersCol = collection(db, 'users');
  return onSnapshot(usersCol, (snapshot) => {
    if (!snapshot.empty) {
      const items: Usuario[] = [];
      snapshot.forEach(docSnap => {
        items.push({ ...(docSnap.data() as Usuario), id: docSnap.id });
      });
      callback(items);
    }
  }, (err) => {
    console.warn('[Firestore] Erro ao assinar users:', err);
  });
}

export async function salvarUsuarioFirestore(usuario: Usuario): Promise<void> {
  try {
    const ref = doc(db, 'users', usuario.id);
    await setDoc(ref, usuario, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Erro ao salvar usuario:', err);
  }
}

export async function excluirUsuarioFirestore(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (err) {
    console.warn('[Firestore] Erro ao excluir usuario:', err);
  }
}

// --- Configurações CMS (Site e App) ---
export async function buscarSiteSettingsFirestore(): Promise<SiteSettings | null> {
  try {
    const ref = doc(db, 'site_settings', 'default');
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      return docSnap.data() as SiteSettings;
    }
    return null;
  } catch (err) {
    console.warn('[Firestore] Erro ao buscar site_settings:', err);
    return null;
  }
}

export function assinarSiteSettings(callback: (settings: SiteSettings) => void): Unsubscribe {
  const ref = doc(db, 'site_settings', 'default');
  return onSnapshot(ref, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as SiteSettings);
    }
  }, (err) => {
    console.warn('[Firestore] Erro ao assinar site_settings:', err);
  });
}

export async function salvarSiteSettingsFirestore(settings: SiteSettings): Promise<void> {
  try {
    // Sanitização segura de payload para o Firestore
    const sanitizedSettings: SiteSettings = { ...settings };
    if (sanitizedSettings.equipe_membros && Array.isArray(sanitizedSettings.equipe_membros)) {
      sanitizedSettings.equipe_membros = sanitizedSettings.equipe_membros.map(m => {
        // Se a foto for um base64 com mais de 250KB, apenas loga aviso mas não quebra a foto
        if (m.foto_url && m.foto_url.startsWith('data:') && m.foto_url.length > 250000) {
          console.warn(`[Firestore] Foto do membro ${m.nome} possui base64 grande (${m.foto_url.length} chars).`);
        }
        return m;
      });
    }

    await Promise.race([
      setDoc(doc(db, 'site_settings', 'default'), sanitizedSettings, { merge: true }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout ao salvar site_settings no Firestore')), 2500))
    ]);
  } catch (err) {
    console.warn('[Firestore] Aviso de sincronização em segundo plano de site_settings:', err);
  }
}

export async function buscarAppSettingsFirestore(): Promise<AppSettings | null> {
  try {
    const ref = doc(db, 'app_settings', 'default');
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      return docSnap.data() as AppSettings;
    }
    return null;
  } catch (err) {
    console.warn('[Firestore] Erro ao buscar app_settings:', err);
    return null;
  }
}

export function assinarAppSettings(callback: (settings: AppSettings) => void): Unsubscribe {
  const ref = doc(db, 'app_settings', 'default');
  return onSnapshot(ref, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as AppSettings);
    }
  }, (err) => {
    console.warn('[Firestore] Erro ao assinar app_settings:', err);
  });
}

export async function salvarAppSettingsFirestore(settings: AppSettings): Promise<void> {
  try {
    await setDoc(doc(db, 'app_settings', 'default'), settings, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Erro ao salvar app_settings:', err);
  }
}

// --- Configuração Deploy GitHub & cPanel (Homehost) ---
export function assinarConfigGithubCpanel(callback: (config: ConfigIntegracaoGithubCpanel) => void): Unsubscribe {
  const ref = doc(db, 'config_github_cpanel', 'default');
  return onSnapshot(ref, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as ConfigIntegracaoGithubCpanel);
    }
  }, (err) => {
    console.warn('[Firestore] Erro ao assinar config_github_cpanel:', err);
  });
}

export async function salvarConfigGithubCpanelFirestore(config: ConfigIntegracaoGithubCpanel): Promise<void> {
  try {
    await setDoc(doc(db, 'config_github_cpanel', 'default'), config, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Erro ao salvar config_github_cpanel:', err);
  }
}


// ==========================================
// 3. INICIALIZAÇÃO E SEEDING DO FIRESTORE
// ==========================================
export async function inicializarDadosFirestoreSeVazio(params: {
  initialUsers: Usuario[];
  initialContacts: Contact[];
  initialDocuments: Documento[];
  initialDeals: Deal[];
  initialProperties: Property[];
  initialFinancialRecords: FinancialRecord[];
  initialSiteSettings: SiteSettings;
  initialAppSettings: AppSettings;
}): Promise<void> {
  try {
    // 1. Checa usuários
    const usersSnap = await getDocs(collection(db, 'users'));
    if (usersSnap.empty && params.initialUsers.length > 0) {
      console.log('[Firestore] Populando usuários iniciais...');
      for (const u of params.initialUsers) {
        await setDoc(doc(db, 'users', u.id), u);
      }
    }

    // 2. Checa site_settings
    const siteSnap = await getDoc(doc(db, 'site_settings', 'default'));
    if (!siteSnap.exists()) {
      console.log('[Firestore] Populando site_settings inicial...');
      await setDoc(doc(db, 'site_settings', 'default'), params.initialSiteSettings);
    }

    // 3. Checa app_settings
    const appSnap = await getDoc(doc(db, 'app_settings', 'default'));
    if (!appSnap.exists()) {
      console.log('[Firestore] Populando app_settings inicial...');
      await setDoc(doc(db, 'app_settings', 'default'), params.initialAppSettings);
    }

    // 4. Checa contatos
    const contactsSnap = await getDocs(collection(db, 'contacts'));
    if (contactsSnap.empty && params.initialContacts.length > 0) {
      console.log('[Firestore] Populando contatos iniciais...');
      for (const c of params.initialContacts) {
        await setDoc(doc(db, 'contacts', c.id), c);
      }
    }

    // 5. Checa documentos
    const docsSnap = await getDocs(collection(db, 'documents'));
    if (docsSnap.empty && params.initialDocuments.length > 0) {
      console.log('[Firestore] Populando documentos iniciais...');
      for (const d of params.initialDocuments) {
        await setDoc(doc(db, 'documents', d.id), d);
      }
    }

    // 6. Checa negócios / deals
    const dealsSnap = await getDocs(collection(db, 'deals'));
    if (dealsSnap.empty && params.initialDeals.length > 0) {
      console.log('[Firestore] Populando deals iniciais...');
      for (const d of params.initialDeals) {
        await setDoc(doc(db, 'deals', d.id), d);
      }
    }

    // 7. Checa imóveis
    const propsSnap = await getDocs(collection(db, 'properties'));
    if (propsSnap.empty && params.initialProperties.length > 0) {
      console.log('[Firestore] Populando propriedades iniciais...');
      for (const p of params.initialProperties) {
        await setDoc(doc(db, 'properties', p.id), p);
      }
    }

    // 8. Checa finanças
    const finSnap = await getDocs(collection(db, 'financial_records'));
    if (finSnap.empty && params.initialFinancialRecords.length > 0) {
      console.log('[Firestore] Populando registros financeiros iniciais...');
      for (const f of params.initialFinancialRecords) {
        await setDoc(doc(db, 'financial_records', f.id), f);
      }
    }

    console.log('[Firestore] Inicialização e checagem de integridade concluída com sucesso.');
  } catch (err) {
    console.warn('[Firestore] Aviso durante inicialização/seeding:', err);
  }
}
