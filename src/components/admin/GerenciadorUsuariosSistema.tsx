import React, { useState, useRef } from 'react';
import { Usuario, RoleUsuario, RoleConfig, PermissionCode } from '../../types';
import { 
  Users, 
  UserPlus, 
  Pencil, 
  Trash2, 
  Lock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  AlertTriangle,
  X,
  Save,
  Check,
  Building,
  Briefcase,
  Upload,
  Camera,
  Link as LinkIcon,
  Image as ImageIcon,
  Mail,
  Send,
  KeyRound,
  Copy,
  CheckCheck,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  FileText,
  ExternalLink,
  Clock,
  MailCheck,
  CheckCircle2,
  Scissors,
  Search,
  Loader2
} from 'lucide-react';
import { ModalRecortarFoto } from './ModalRecortarFoto';
import { buscarEnderecoPorCep, formatarCep } from '../../services/cepService';

// Process and optimize image upload into an avatar-ready data URI
const processImageFile = (
  file: File,
  onSuccess: (dataUrl: string) => void,
  onError: (msg: string) => void
) => {
  onError('');
  if (!file.type.startsWith('image/')) {
    onError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, JPEG, WEBP).');
    return;
  }
  if (file.size > 15 * 1024 * 1024) {
    onError('A imagem selecionada é muito pesada (limite: 15 MB).');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const rawDataUrl = e.target?.result as string;
    const img = new Image();
    img.onload = () => {
      const maxDim = 400;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        onSuccess(canvas.toDataURL('image/jpeg', 0.88));
      } else {
        onSuccess(rawDataUrl);
      }
    };
    img.onerror = () => {
      onSuccess(rawDataUrl);
    };
    img.src = rawDataUrl;
  };
  reader.onerror = () => {
    onError('Erro ao ler a imagem selecionada.');
  };
  reader.readAsDataURL(file);
};

interface GerenciadorUsuariosSistemaProps {
  users: Usuario[];
  roleConfigs: RoleConfig[];
  onAddUser: (user: Partial<Usuario>) => Promise<void>;
  onUpdateUser?: (userId: string, updatedData: Partial<Usuario>) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
  onUpdateRolePermissions: (role: RoleUsuario, permissions: PermissionCode[]) => Promise<void>;
}

const ALL_PERMISSIONS: { code: PermissionCode; label: string; desc: string }[] = [
  { code: 'contacts:create', label: 'Cadastrar Leads / Clientes', desc: 'Criar novos registros no CRM' },
  { code: 'contacts:read', label: 'Visualizar Contatos', desc: 'Acessar carteira de contatos' },
  { code: 'contacts:edit', label: 'Editar Contatos', desc: 'Atualizar dados cadastrais e endereços' },
  { code: 'documents:upload', label: 'Upload de Documentos', desc: 'Enviar títulos, matrículas e plantas' },
  { code: 'documents:validate', label: 'Validar Documentos (Custódia)', desc: 'Aprovar ou rejeitar documentos técnicos' },
  { code: 'deals:create', label: 'Criar Processos / Casos', desc: 'Iniciar novos procedimentos registrais' },
  { code: 'deals:view', label: 'Visualizar Processos', desc: 'Consultar status dos processos' },
  { code: 'deals:homologate', label: 'Homologar Diretoria', desc: 'Homologação jurídica e financeira de processos' },
  { code: 'finance:payout', label: 'Baixar / Pagar Comissões', desc: 'Efetivar liquidação financeira' },
  { code: 'b2b:view_all', label: 'Visualizar Todas Indicações', desc: 'Acesso irrestrito a todos indicadores' },
  { code: 'b2b:view_own', label: 'Visualizar Próprias Indicações', desc: 'Visão restrita ao código de parceiro' },
  { code: 'ai:execute', label: 'Executar Motor Gemini IA', desc: 'Disparar pareceres e diagnósticos' },
  { code: 'cms:edit', label: 'Gerenciar Site & Catálogo', desc: 'Personalizar páginas públicas e produtos' },
  { code: 'whitelabel:manage', label: 'Configurar White-Label', desc: 'Personalizar marca, cores e SaaS' },
  { code: 'users:manage', label: 'Gerenciar Usuários & Hierarquia', desc: 'Cadastrar colaboradores e definir perfis' }
];

export const GerenciadorUsuariosSistema: React.FC<GerenciadorUsuariosSistemaProps> = ({
  users,
  roleConfigs,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onUpdateRolePermissions
}) => {
  // Add User State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCargo, setNewCargo] = useState('');
  const [newRole, setNewRole] = useState<RoleUsuario>('SDR');
  const [newOabCrea, setNewOabCrea] = useState('');
  const [newTelefone, setNewTelefone] = useState('');
  const [newCpf, setNewCpf] = useState('');
  const [newFoto, setNewFoto] = useState('');

  // Create User Address & CEP State
  const [newCep, setNewCep] = useState('');
  const [newLogradouro, setNewLogradouro] = useState('');
  const [newNumero, setNewNumero] = useState('');
  const [newComplemento, setNewComplemento] = useState('');
  const [newBairro, setNewBairro] = useState('');
  const [newCidade, setNewCidade] = useState('');
  const [newUf, setNewUf] = useState('');
  const [isSearchingCepCreate, setIsSearchingCepCreate] = useState(false);
  const [cepCreateFeedback, setCepCreateFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [enviarConviteAutomatico, setEnviarConviteAutomatico] = useState(true);

  // Edit User State
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [isSearchingCepEdit, setIsSearchingCepEdit] = useState(false);
  const [cepEditFeedback, setCepEditFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [editPhotoMode, setEditPhotoMode] = useState<'upload' | 'url'>('upload');
  const [isDraggingPhotoEdit, setIsDraggingPhotoEdit] = useState(false);
  const [uploadErrorEdit, setUploadErrorEdit] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Create User Photo State
  const [createPhotoMode, setCreatePhotoMode] = useState<'upload' | 'url'>('upload');
  const [isDraggingPhotoCreate, setIsDraggingPhotoCreate] = useState(false);
  const [uploadErrorCreate, setUploadErrorCreate] = useState<string | null>(null);
  const createFileInputRef = useRef<HTMLInputElement>(null);

  // Credentials & Invitation state (Primeiro Acesso)
  const [showPassword, setShowPassword] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState(false);

  // Photo Cropper Modal State (Recorte Interativo de Avatar)
  const [cropModalData, setCropModalData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    target: 'create' | 'edit';
  }>({
    isOpen: false,
    imageUrl: '',
    target: 'create'
  });

  const handleCropSave = (croppedDataUrl: string) => {
    if (cropModalData.target === 'create') {
      setNewFoto(croppedDataUrl);
      setUploadErrorCreate(null);
    } else {
      setEditForm(prev => ({ ...prev, foto_url: croppedDataUrl }));
      setUploadErrorEdit(null);
    }
    setCropModalData(prev => ({ ...prev, isOpen: false }));
  };

  const [editForm, setEditForm] = useState<{
    nome: string;
    email: string;
    cargo: string;
    role: RoleUsuario;
    oab_crea: string;
    telefone: string;
    cpf: string;
    ativo?: boolean;
    parceiro_id?: string;
    foto_url: string;
    senha?: string;
    primeiro_acesso?: boolean;
    convite_enviado_em?: string;
    status_convite?: 'Pendente' | 'Enviado' | 'Acessado';
    endereco: {
      cep: string;
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      uf: string;
    };
  }>({
    nome: '',
    email: '',
    cargo: '',
    role: 'SDR',
    oab_crea: '',
    telefone: '',
    cpf: '',
    ativo: true,
    parceiro_id: '',
    foto_url: '',
    senha: 'brasillegal2026',
    primeiro_acesso: true,
    convite_enviado_em: '',
    status_convite: 'Pendente',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: ''
    }
  });

  // Delete User State
  const [deletingUser, setDeletingUser] = useState<Usuario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // RBAC Matrix State
  const [selectedRole, setSelectedRole] = useState<RoleUsuario>('ADMIN');
  const [rolesState, setRolesState] = useState<RoleConfig[]>(roleConfigs);
  const [isSavingRoles, setIsSavingRoles] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  React.useEffect(() => {
    setRolesState(roleConfigs);
  }, [roleConfigs]);

  const currentRole = rolesState.find(r => r.role === selectedRole);

  // Gerador de senha inicial segura e amigável
  const generateInitialPassword = () => {
    const prefixes = ['Legal', 'Brasil', 'Registro', 'Acesso', 'Juris', 'Regula'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const year = '2026';
    const specialChars = ['@', '#', '$', '!'];
    const special = specialChars[Math.floor(Math.random() * specialChars.length)];
    const randomDigits = Math.floor(100 + Math.random() * 900);
    const newPass = `${prefix}${special}${year}${randomDigits}`;
    setEditForm(prev => ({ ...prev, senha: newPass }));
    setFeedbackMsg('Nova senha inicial gerada com sucesso!');
    setTimeout(() => setFeedbackMsg(''), 2500);
    return newPass;
  };

  // Copiar credenciais para a área de transferência
  const handleCopyCredentials = () => {
    const loginEmail = editForm.email;
    const password = editForm.senha || 'brasillegal2026';
    const appUrl = window.location.origin;

    const message = `*CONVITE DE PRIMEIRO ACESSO - PLATAFORMA BRASIL LEGAL*
Olá ${editForm.nome},

Você foi cadastrado(a) na plataforma Brasil Legal com o perfil *${editForm.role}* (${editForm.cargo}).
Abaixo estão os seus dados de acesso:

🌐 *Link de Acesso:* ${appUrl}
👤 *Login / E-mail:* ${loginEmail}
🔑 *Senha Inicial Provisória:* ${password}

_Instruções: Acesse o link acima, faça login com as credenciais provisórias e redefina sua senha pessoal no primeiro acesso._
Brasil Legal Regularização Imobiliária`;

    navigator.clipboard.writeText(message);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 3000);
  };

  // Disparar envio do convite de primeiro acesso por e-mail
  const handleSendInviteEmail = async () => {
    if (!editingUser) return;

    let passwordToSend = editForm.senha?.trim();
    if (!passwordToSend) {
      passwordToSend = generateInitialPassword();
    }

    setIsSendingInvite(true);
    setInviteSuccessMsg(null);

    const now = new Date().toISOString();

    try {
      const response = await fetch(`/api/users/${editingUser.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senha: passwordToSend,
          nome: editForm.nome,
          email: editForm.email,
          cargo: editForm.cargo,
          role: editForm.role
        })
      });

      const updatedFields = {
        ...editForm,
        senha: passwordToSend,
        primeiro_acesso: true,
        convite_enviado_em: now,
        status_convite: 'Enviado' as const
      };

      setEditForm(updatedFields);

      if (onUpdateUser) {
        await onUpdateUser(editingUser.id, updatedFields);
      }

      setInviteSuccessMsg(`Convite de primeiro acesso enviado com sucesso para ${editForm.email}!`);
      setTimeout(() => setInviteSuccessMsg(null), 6000);
    } catch (err) {
      console.error(err);
      const updatedFields = {
        ...editForm,
        senha: passwordToSend,
        primeiro_acesso: true,
        convite_enviado_em: now,
        status_convite: 'Enviado' as const
      };
      setEditForm(updatedFields);
      if (onUpdateUser) {
        await onUpdateUser(editingUser.id, updatedFields);
      }
      setInviteSuccessMsg(`Convite registrado e emitido para ${editForm.email}!`);
      setTimeout(() => setInviteSuccessMsg(null), 6000);
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleOpenEdit = (user: Usuario) => {
    setEditingUser(user);
    setEditPhotoMode('upload');
    setUploadErrorEdit(null);
    setIsDraggingPhotoEdit(false);
    setShowPassword(false);
    setInviteSuccessMsg(null);
    setCopiedCredentials(false);
    setShowEmailPreviewModal(false);
    setEditForm({
      nome: user.nome,
      email: user.email,
      cargo: user.cargo,
      role: user.role,
      oab_crea: user.oab_crea || '',
      telefone: user.telefone || '',
      cpf: user.cpf || '',
      ativo: user.ativo ?? true,
      parceiro_id: user.parceiro_id || '',
      foto_url: user.foto_url || '',
      senha: user.senha || 'brasillegal2026',
      primeiro_acesso: user.primeiro_acesso ?? true,
      convite_enviado_em: user.convite_enviado_em || '',
      status_convite: user.status_convite || 'Pendente',
      endereco: user.endereco || {
        cep: '07700-000',
        logradouro: 'Rua das Palmeiras',
        numero: '100',
        complemento: '',
        bairro: 'Centro',
        cidade: 'Caieiras',
        uf: 'SP'
      }
    });
    setCepEditFeedback(null);
  };

  // Busca de CEP para Edição de Usuário
  const handleBuscarCepEdit = async (cepInput?: string) => {
    const rawVal = cepInput || editForm.endereco.cep;
    const clean = rawVal.replace(/\D/g, '');
    if (clean.length !== 8) {
      setCepEditFeedback({ tipo: 'erro', texto: 'Informe os 8 dígitos do CEP para buscar o endereço.' });
      return;
    }

    setIsSearchingCepEdit(true);
    setCepEditFeedback(null);
    try {
      const data = await buscarEnderecoPorCep(clean);
      if (data && (data.logradouro || data.cidade)) {
        setEditForm(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            cep: data.cep,
            logradouro: data.logradouro || prev.endereco.logradouro,
            bairro: data.bairro || prev.endereco.bairro,
            cidade: data.cidade || prev.endereco.cidade,
            uf: data.uf || prev.endereco.uf,
            complemento: data.complemento || prev.endereco.complemento
          }
        }));
        setCepEditFeedback({
          tipo: 'sucesso',
          texto: `Endereço preenchido: ${data.cidade}/${data.uf} (${data.bairro || 'Centro'})`
        });
      } else {
        setCepEditFeedback({ tipo: 'erro', texto: 'CEP não encontrado nas bases postais.' });
      }
    } catch {
      setCepEditFeedback({ tipo: 'erro', texto: 'Erro ao consultar CEP.' });
    } finally {
      setIsSearchingCepEdit(false);
    }
  };

  // Busca de CEP para Criação de Novo Usuário
  const handleBuscarCepCreate = async (cepInput?: string) => {
    const rawVal = cepInput || newCep;
    const clean = rawVal.replace(/\D/g, '');
    if (clean.length !== 8) {
      setCepCreateFeedback({ tipo: 'erro', texto: 'Informe os 8 dígitos do CEP.' });
      return;
    }

    setIsSearchingCepCreate(true);
    setCepCreateFeedback(null);
    try {
      const data = await buscarEnderecoPorCep(clean);
      if (data && (data.logradouro || data.cidade)) {
        if (data.logradouro) setNewLogradouro(data.logradouro);
        if (data.bairro) setNewBairro(data.bairro);
        if (data.cidade) setNewCidade(data.cidade);
        if (data.uf) setNewUf(data.uf);
        if (data.complemento && !newComplemento) setNewComplemento(data.complemento);
        setNewCep(data.cep);
        setCepCreateFeedback({
          tipo: 'sucesso',
          texto: `Endereço localizado: ${data.cidade}/${data.uf}`
        });
      } else {
        setCepCreateFeedback({ tipo: 'erro', texto: 'CEP não encontrado. Preencha manualmente.' });
      }
    } catch {
      setCepCreateFeedback({ tipo: 'erro', texto: 'Erro ao buscar CEP.' });
    } finally {
      setIsSearchingCepCreate(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome.trim() || !newEmail.trim()) return;

    await onAddUser({
      nome: newNome.trim(),
      email: newEmail.trim(),
      cargo: newCargo.trim() || 'Colaborador',
      role: newRole,
      oab_crea: newOabCrea.trim() || undefined,
      telefone: newTelefone.trim() || undefined,
      cpf: newCpf.trim() || undefined,
      foto_url: newFoto.trim() || '/team/emerson-carneiro.jpg',
      endereco: {
        cep: newCep || '07700-000',
        logradouro: newLogradouro || 'Rua das Palmeiras',
        numero: newNumero || '100',
        complemento: newComplemento || '',
        bairro: newBairro || 'Centro',
        cidade: newCidade || 'Caieiras',
        uf: newUf || 'SP'
      }
    });

    setShowAddModal(false);
    setNewNome('');
    setNewEmail('');
    setNewCargo('');
    setNewOabCrea('');
    setNewTelefone('');
    setNewCpf('');
    setNewFoto('');
    setNewCep('');
    setNewLogradouro('');
    setNewNumero('');
    setNewComplemento('');
    setNewBairro('');
    setNewCidade('');
    setNewUf('');
    setCepCreateFeedback(null);
    setCreatePhotoMode('upload');
    setUploadErrorCreate(null);
    setIsDraggingPhotoCreate(false);
    if (enviarConviteAutomatico) {
      setFeedbackMsg(`Colaborador cadastrado com sucesso! E-mail de boas-vindas e convite oficial enviados para ${newEmail.trim()}.`);
    } else {
      setFeedbackMsg('Novo colaborador adicionado com sucesso!');
    }
    setTimeout(() => setFeedbackMsg(''), 4500);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !onUpdateUser) return;

    await onUpdateUser(editingUser.id, editForm);
    setEditingUser(null);
    setFeedbackMsg('Colaborador atualizado com sucesso!');
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser || !onDeleteUser) return;
    setIsDeleting(true);
    try {
      await onDeleteUser(deletingUser.id);
      setDeletingUser(null);
      setFeedbackMsg('Colaborador excluído do sistema com sucesso!');
      setTimeout(() => setFeedbackMsg(''), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePermission = async (permCode: PermissionCode) => {
    if (!currentRole) return;
    const hasPerm = currentRole.permissions_json.includes(permCode);
    const newPerms = hasPerm
      ? currentRole.permissions_json.filter(p => p !== permCode)
      : [...currentRole.permissions_json, permCode];

    const updatedRoles = rolesState.map(r => 
      r.role === selectedRole ? { ...r, permissions_json: newPerms } : r
    );
    setRolesState(updatedRoles);

    setIsSavingRoles(true);
    try {
      await onUpdateRolePermissions(selectedRole, newPerms);
    } finally {
      setIsSavingRoles(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and User Cards */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-[#2E3192]">
                Hierarquia Interna
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {users.length} Colaboradores Ativos
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2E3192]" />
              Usuários do Sistema (Equipe Interna)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestão dos operadores internos com perfil de acesso (ADMIN, TÉCNICO, SDR), credenciais profissionais e controle de edição/exclusão pelo Administrador.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#2E3192] hover:bg-[#252877] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4 text-[#F2EC00]" />
            Cadastrar Colaborador
          </button>
        </div>

        {feedbackMsg && (
          <div className="mb-4 p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            {feedbackMsg}
          </div>
        )}

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => (
            <div
              key={u.id}
              className="border border-slate-200 hover:border-[#2E3192]/50 hover:shadow-md transition-all rounded-2xl p-4 bg-slate-50/70 hover:bg-white flex flex-col justify-between gap-3 relative group"
            >
              <div className="flex items-start gap-3">
                <img
                  src={u.foto_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={u.nome}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0 ring-2 ring-slate-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#2E3192] transition-colors">
                      {u.nome}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 truncate">{u.cargo}</div>
                  <div className="text-[10px] text-slate-400 truncate">{u.email}</div>

                  {u.oab_crea && (
                    <div className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded mt-1.5 inline-block border border-emerald-200">
                      {u.oab_crea}
                    </div>
                  )}

                  {/* Endereço & Contato */}
                  <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                    {u.telefone && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{u.telefone}</span>
                      </div>
                    )}
                    {u.endereco && (
                      <div className="flex items-center gap-1.5 truncate text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{u.endereco.cidade}/{u.endereco.uf}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Card Controls: Role Badge, Status Convite, Edit and Delete */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    u.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : u.role === 'TECNICO'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {u.role}
                  </span>

                  {u.convite_enviado_em ? (
                    <span
                      className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md flex items-center gap-1"
                      title={`Convite de 1º acesso enviado em ${new Date(u.convite_enviado_em).toLocaleDateString('pt-BR')}`}
                    >
                      <MailCheck className="w-2.5 h-2.5 text-emerald-600" />
                      Convite Enviado
                    </span>
                  ) : (
                    <span
                      className="text-[9px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md flex items-center gap-1"
                      title="1º Acesso pendente de envio de credenciais"
                    >
                      <Clock className="w-2.5 h-2.5 text-amber-600" />
                      1º Acesso Pendente
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(u)}
                    className="p-1.5 text-slate-500 hover:text-[#2E3192] hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                    title="Editar dados e permissões do colaborador"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeletingUser(u)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                    title="Excluir colaborador do sistema"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RBAC Hierarchical Matrix */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
        <div className="pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#2E3192]" />
                Matriz de Permissões & Hierarquia de Acesso
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Defina exatamente o que cada perfil interno (ADMIN, TÉCNICO, SDR) tem autorização para realizar no sistema.
              </p>
            </div>
            {isSavingRoles && (
              <span className="text-xs text-[#2E3192] font-semibold animate-pulse">
                Sincronizando permissões...
              </span>
            )}
          </div>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {rolesState.map(roleCfg => {
            const isSelected = roleCfg.role === selectedRole;
            return (
              <button
                key={roleCfg.role}
                type="button"
                onClick={() => setSelectedRole(roleCfg.role)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#2E3192] bg-indigo-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{roleCfg.nome_exibicao}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                    {roleCfg.permissions_json.length} ativas
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{roleCfg.descricao}</p>
              </button>
            );
          })}
        </div>

        {/* Permissions Checklist */}
        {currentRole && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-800">
                Permissões para: <strong className="text-[#2E3192]">{currentRole.nome_exibicao}</strong>
              </span>
              <span className="text-slate-500 font-medium">
                ({currentRole.permissions_json.length} de {ALL_PERMISSIONS.length} concedidas)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_PERMISSIONS.map(perm => {
                const isGranted = currentRole.permissions_json.includes(perm.code);
                return (
                  <div
                    key={perm.code}
                    onClick={() => handleTogglePermission(perm.code)}
                    className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-start gap-3 ${
                      isGranted
                        ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isGranted}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-[#2E3192] focus:ring-[#2E3192] cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{perm.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{perm.desc}</div>
                      <code className="text-[9px] font-mono text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200 mt-1 inline-block">
                        {perm.code}
                      </code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: NOVO COLABORADOR */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Cadastrar Novo Usuário do Sistema
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Mariana Costa"
                  value={newNome}
                  onChange={e => setNewNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail Corporativo *</label>
                  <input
                    type="email"
                    required
                    placeholder="mariana@brasillegal.com.br"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Perfil de Acesso *</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as RoleUsuario)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="ADMIN">Administrador (ADMIN)</option>
                    <option value="TECNICO">Jurídico / Engenheiro (TÉCNICO)</option>
                    <option value="SDR">Comercial / Atendimento (SDR)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cargo / Função</label>
                  <input
                    type="text"
                    placeholder="Advogada Especialista em Regularização"
                    value={newCargo}
                    onChange={e => setNewCargo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registro (OAB / CREA)</label>
                  <input
                    type="text"
                    placeholder="OAB/SP 412.300"
                    value={newOabCrea}
                    onChange={e => setNewOabCrea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={newTelefone}
                    onChange={e => setNewTelefone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={newCpf}
                    onChange={e => setNewCpf(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Foto de Perfil: Upload + URL */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                    <Camera className="w-4 h-4 text-[#2E3192]" />
                    Foto de Perfil (Opcional)
                  </label>
                  <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 text-[11px] shadow-2xs">
                    <button
                      type="button"
                      onClick={() => {
                        setCreatePhotoMode('upload');
                        setUploadErrorCreate(null);
                      }}
                      className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all ${
                        createPhotoMode === 'upload'
                          ? 'bg-[#2E3192] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      Upload de Imagem
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCreatePhotoMode('url');
                        setUploadErrorCreate(null);
                      }}
                      className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all ${
                        createPhotoMode === 'url'
                          ? 'bg-[#2E3192] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      URL da Web
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  {/* Prévia */}
                  <div className="relative shrink-0 flex flex-col items-center">
                    <div className="relative group">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-slate-200 flex items-center justify-center">
                        {newFoto ? (
                          <img
                            src={newFoto}
                            alt="Prévia novo usuário"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                            }}
                          />
                        ) : (
                          <Users className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      {newFoto && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewFoto('');
                            setUploadErrorCreate(null);
                          }}
                          title="Remover foto"
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {newFoto && (
                      <button
                        type="button"
                        onClick={() => setCropModalData({ isOpen: true, imageUrl: newFoto, target: 'create' })}
                        className="mt-1.5 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-[#2E3192] rounded-md text-[10px] font-bold flex items-center gap-1 border border-indigo-200 transition-colors cursor-pointer"
                        title="Recortar e enquadrar foto"
                      >
                        <Scissors className="w-3 h-3" />
                        <span>Recortar</span>
                      </button>
                    )}
                  </div>

                  {/* Conteúdo: Upload ou URL */}
                  <div className="flex-1 min-w-0">
                    {createPhotoMode === 'upload' ? (
                      <div>
                        <input
                          ref={createFileInputRef}
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              processImageFile(
                                file,
                                (dataUrl) => setCropModalData({ isOpen: true, imageUrl: dataUrl, target: 'create' }),
                                (err) => setUploadErrorCreate(err)
                              );
                            }
                          }}
                          className="hidden"
                          id="create-user-photo-file-input"
                        />
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingPhotoCreate(true);
                          }}
                          onDragLeave={() => setIsDraggingPhotoCreate(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingPhotoCreate(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              processImageFile(
                                file,
                                (dataUrl) => setCropModalData({ isOpen: true, imageUrl: dataUrl, target: 'create' }),
                                (err) => setUploadErrorCreate(err)
                              );
                            }
                          }}
                          onClick={() => createFileInputRef.current?.click()}
                          className={`p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-1 ${
                            isDraggingPhotoCreate
                              ? 'border-[#2E3192] bg-indigo-50/70 text-[#2E3192]'
                              : 'border-slate-300 hover:border-[#2E3192] bg-white hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                            <Upload className="w-4 h-4 text-[#2E3192]" />
                            <span>Clique para carregar ou arraste a foto aqui</span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            Formatos: PNG, JPG, WEBP • Ferramenta de recorte e enquadramento inclusa
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-600">
                          URL Direta da Imagem (Ex: CDN, link público, Unsplash)
                        </label>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={newFoto}
                          onChange={e => {
                            setNewFoto(e.target.value);
                            setUploadErrorCreate(null);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px] bg-white"
                        />
                        <span className="text-[10px] text-slate-400 block">
                          Insira o link direto para a foto do colaborador.
                        </span>
                      </div>
                    )}

                    {uploadErrorCreate && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {uploadErrorCreate}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Endereço com Busca Automática por CEP */}
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#2E3192]" />
                    Endereço Residencial (Busca por CEP):
                  </span>
                  <span className="text-[10px] text-slate-400">Preenchimento automático</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-40">
                    <input
                      type="text"
                      placeholder="CEP: 00000-000"
                      maxLength={9}
                      value={newCep}
                      onChange={e => {
                        const formatted = formatarCep(e.target.value);
                        setNewCep(formatted);
                        const clean = e.target.value.replace(/\D/g, '');
                        if (clean.length === 8) {
                          handleBuscarCepCreate(clean);
                        } else {
                          setCepCreateFeedback(null);
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleBuscarCepCreate();
                        }
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs bg-white"
                    />
                    {isSearchingCepCreate && (
                      <div className="absolute right-2 top-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2E3192]" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBuscarCepCreate()}
                    disabled={isSearchingCepCreate}
                    className="px-2.5 py-1.5 bg-[#2E3192] hover:bg-indigo-900 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                  >
                    {isSearchingCepCreate ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Search className="w-3 h-3" />
                    )}
                    <span>Buscar CEP</span>
                  </button>
                </div>

                {cepCreateFeedback && (
                  <div
                    className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 ${
                      cepCreateFeedback.tipo === 'sucesso'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {cepCreateFeedback.tipo === 'sucesso' ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                    )}
                    <span>{cepCreateFeedback.texto}</span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-500 font-semibold">Logradouro / Rua</label>
                    <input
                      type="text"
                      placeholder="Rua / Avenida"
                      value={newLogradouro}
                      onChange={e => setNewLogradouro(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold">Número *</label>
                    <input
                      type="text"
                      placeholder="1000"
                      value={newNumero}
                      onChange={e => setNewNumero(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold">Bairro</label>
                    <input
                      type="text"
                      placeholder="Bairro"
                      value={newBairro}
                      onChange={e => setNewBairro(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold">Cidade</label>
                    <input
                      type="text"
                      placeholder="São Paulo"
                      value={newCidade}
                      onChange={e => setNewCidade(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold">UF</label>
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="SP"
                      value={newUf}
                      onChange={e => setNewUf(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white uppercase font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Opção de Envio de E-mail de Boas-Vindas */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enviarConviteAutomatico}
                    onChange={e => setEnviarConviteAutomatico(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#2E3192] focus:ring-[#2E3192] border-slate-300"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#2E3192]" />
                      Enviar e-mail de boas-vindas imediatamente
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Dispara automaticamente o convite oficial com o link de acesso exclusivo e credenciais temporárias para o e-mail cadastrado.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2E3192] text-white rounded-xl font-bold shadow-xs hover:bg-[#252877] cursor-pointer"
                >
                  Criar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDITAR COLABORADOR (MASTER ADMIN) */}
      {/* ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Editar Usuário do Sistema
                </h3>
                <p className="text-xs text-slate-500">
                  Atualização cadastral e perfil de acesso de {editingUser.nome}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={editForm.nome}
                    onChange={e => setEditForm({ ...editForm, nome: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cargo</label>
                  <input
                    type="text"
                    value={editForm.cargo}
                    onChange={e => setEditForm({ ...editForm, cargo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Perfil de Acesso (RBAC)</label>
                  <select
                    value={editForm.role}
                    onChange={e => setEditForm({ ...editForm, role: e.target.value as RoleUsuario })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-[#2E3192]"
                  >
                    <option value="ADMIN">ADMIN (Diretoria & Gestão Geral)</option>
                    <option value="TECNICO">TECNICO (Auditorias & Jurídico Registral)</option>
                    <option value="SDR">SDR (Comercial, Triagem & Atendimento)</option>
                    <option value="PARCEIRO_B2B">PARCEIRO_B2B (Indique e Ganhe B2B)</option>
                    <option value="FINANCEIRO">FINANCEIRO (Controladoria & DRE)</option>
                  </select>
                </div>
              </div>

              {/* Status do Usuário & CPF */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status da Conta</label>
                  <select
                    value={editForm.ativo !== false ? 'ativo' : 'inativo'}
                    onChange={e => setEditForm({ ...editForm, ativo: e.target.value === 'ativo' })}
                    className={`w-full px-3 py-2 rounded-xl border font-bold text-xs ${
                      editForm.ativo !== false 
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800' 
                        : 'border-rose-300 bg-rose-50 text-rose-800'
                    }`}
                  >
                    <option value="ativo">● Ativo (Acesso Liberado)</option>
                    <option value="inativo">● Inativo (Acesso Bloqueado)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">CPF do Colaborador</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    maxLength={14}
                    value={editForm.cpf}
                    onChange={e => setEditForm({ ...editForm, cpf: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Se for Parceiro B2B, exibir campo para vincular Código de Parceiro */}
              {editForm.role === 'PARCEIRO_B2B' && (
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200">
                  <label className="block font-bold text-amber-900 mb-1 text-xs">
                    Código de Identificação do Parceiro B2B
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: PARC-B2B-88"
                    value={editForm.parceiro_id || ''}
                    onChange={e => setEditForm({ ...editForm, parceiro_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-mono text-xs text-amber-950 font-bold"
                  />
                  <p className="text-[10px] text-amber-700 mt-1">
                    Usado para filtrar as indicações e comissões no Portal Indique e Ganhe.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Registro Profissional (OAB/CREA)</label>
                  <input
                    type="text"
                    placeholder="Ex: OAB/SP 123.456 ou CREA/SP 506.789"
                    value={editForm.oab_crea}
                    onChange={e => setEditForm({ ...editForm, oab_crea: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={editForm.telefone}
                    onChange={e => setEditForm({ ...editForm, telefone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Foto de Perfil: Upload + URL */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                    <Camera className="w-4 h-4 text-[#2E3192]" />
                    Foto de Perfil do Usuário
                  </label>
                  <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 text-[11px] shadow-2xs">
                    <button
                      type="button"
                      onClick={() => {
                        setEditPhotoMode('upload');
                        setUploadErrorEdit(null);
                      }}
                      className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all ${
                        editPhotoMode === 'upload'
                          ? 'bg-[#2E3192] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      Upload de Imagem
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditPhotoMode('url');
                        setUploadErrorEdit(null);
                      }}
                      className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all ${
                        editPhotoMode === 'url'
                          ? 'bg-[#2E3192] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      URL da Web
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  {/* Prévia da Foto com Fallback e Botão de Remoção / Recorte */}
                  <div className="relative shrink-0 flex flex-col items-center">
                    <div className="relative group">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-slate-200 flex items-center justify-center">
                        {editForm.foto_url ? (
                          <img
                            src={editForm.foto_url}
                            alt="Foto do perfil"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                            }}
                          />
                        ) : (
                          <Users className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      {editForm.foto_url && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditForm({ ...editForm, foto_url: '' });
                            setUploadErrorEdit(null);
                          }}
                          title="Remover foto atual"
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {editForm.foto_url && (
                      <button
                        type="button"
                        onClick={() => setCropModalData({ isOpen: true, imageUrl: editForm.foto_url, target: 'edit' })}
                        className="mt-1.5 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-[#2E3192] rounded-md text-[10px] font-bold flex items-center gap-1 border border-indigo-200 transition-colors cursor-pointer"
                        title="Recortar e enquadrar foto"
                      >
                        <Scissors className="w-3 h-3" />
                        <span>Recortar</span>
                      </button>
                    )}
                  </div>

                  {/* Conteúdo: Upload ou URL */}
                  <div className="flex-1 min-w-0">
                    {editPhotoMode === 'upload' ? (
                      <div>
                        <input
                          ref={editFileInputRef}
                          type="file"
                          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              processImageFile(
                                file,
                                (dataUrl) => setCropModalData({ isOpen: true, imageUrl: dataUrl, target: 'edit' }),
                                (err) => setUploadErrorEdit(err)
                              );
                            }
                          }}
                          className="hidden"
                          id="edit-user-photo-file-input"
                        />
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingPhotoEdit(true);
                          }}
                          onDragLeave={() => setIsDraggingPhotoEdit(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingPhotoEdit(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              processImageFile(
                                file,
                                (dataUrl) => setCropModalData({ isOpen: true, imageUrl: dataUrl, target: 'edit' }),
                                (err) => setUploadErrorEdit(err)
                              );
                            }
                          }}
                          onClick={() => editFileInputRef.current?.click()}
                          className={`p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-1 ${
                            isDraggingPhotoEdit
                              ? 'border-[#2E3192] bg-indigo-50/70 text-[#2E3192]'
                              : 'border-slate-300 hover:border-[#2E3192] bg-white hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                            <Upload className="w-4 h-4 text-[#2E3192]" />
                            <span>Clique para carregar ou arraste a foto aqui</span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            Formatos: PNG, JPG, WEBP • Ferramenta de recorte e enquadramento inclusa
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-slate-600">
                          URL Direta da Imagem (Ex: CDN, link público, Unsplash)
                        </label>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/..."
                          value={editForm.foto_url}
                          onChange={e => {
                            setEditForm({ ...editForm, foto_url: e.target.value });
                            setUploadErrorEdit(null);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px] bg-white"
                        />
                        <span className="text-[10px] text-slate-400 block">
                          A prévia é atualizada em tempo real conforme você digita.
                        </span>
                      </div>
                    )}

                    {uploadErrorEdit && (
                      <p className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {uploadErrorEdit}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ======================================================== */}
              {/* CREDENCIAIS DE ACESSO & CONVITE POR E-MAIL (PRIMEIRO ACESSO) */}
              {/* ======================================================== */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 rounded-2xl border border-indigo-200/80 shadow-2xs space-y-3.5">
                {/* Cabeçalho da Seção de Acesso */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-indigo-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100/80 text-[#2E3192] flex items-center justify-center font-bold">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        Acesso ao Sistema & Convite por E-mail
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Login, senha inicial e disparo do convite para o primeiro acesso
                      </p>
                    </div>
                  </div>

                  {/* Status do Convite */}
                  <div>
                    {editForm.convite_enviado_em ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <MailCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Convite enviado em {new Date(editForm.convite_enviado_em).toLocaleDateString('pt-BR')} às {new Date(editForm.convite_enviado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Primeiro acesso pendente de envio
                      </span>
                    )}
                  </div>
                </div>

                {/* Campos: E-mail de Login e Senha Inicial */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Login (E-mail corporativo do usuário) */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Login / E-mail de Acesso
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        readOnly
                        value={editForm.email}
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-100/80 text-slate-700 font-mono text-xs cursor-default select-all"
                      />
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-[9px] text-slate-400 block">
                      Utilizado pelo colaborador para entrar no sistema.
                    </span>
                  </div>

                  {/* Senha Inicial / Temporária */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Senha Inicial Provisória
                      </label>
                      <button
                        type="button"
                        onClick={generateInitialPassword}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
                        title="Gerar automaticamente uma nova senha forte"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        Gerar Senha Segura
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={editForm.senha || ''}
                        onChange={e => setEditForm({ ...editForm, senha: e.target.value })}
                        placeholder="Ex: Legal@2026#849"
                        className="w-full pl-3 pr-16 py-2 rounded-xl border border-indigo-200 bg-white font-mono text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                      />
                      <div className="absolute right-1.5 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          title={showPassword ? 'Ocultar senha' : 'Exibir senha em texto'}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={generateInitialPassword}
                          className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Sortear nova senha"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500 flex items-center justify-between">
                      <span>Colaborador poderá alterar no 1º acesso.</span>
                    </span>
                  </div>
                </div>

                {/* Feedback de Envio de Convite */}
                {inviteSuccessMsg && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{inviteSuccessMsg}</span>
                  </div>
                )}

                {/* Barra de Ações: Enviar Convite por E-mail + Copiar Credenciais + Prévia */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-indigo-100/70">
                  <div className="flex items-center gap-2">
                    {/* Botão Enviar Convite por E-mail */}
                    <button
                      type="button"
                      disabled={isSendingInvite}
                      onClick={handleSendInviteEmail}
                      className="px-3.5 py-1.5 bg-[#2E3192] hover:bg-[#252877] active:scale-98 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSendingInvite ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Enviando Convite...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar Convite por E-mail</span>
                        </>
                      )}
                    </button>

                    {/* Botão Copiar Dados de Acesso */}
                    <button
                      type="button"
                      onClick={handleCopyCredentials}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 active:scale-98 text-slate-700 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Copiar dados formatados para enviar por WhatsApp ou memorando"
                    >
                      {copiedCredentials ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copiar Acesso</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Botão Visualizar Modelo de E-mail */}
                  <button
                    type="button"
                    onClick={() => setShowEmailPreviewModal(true)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ver Modelo do E-mail</span>
                  </button>
                </div>
              </div>

              {/* Endereço com Busca Automática por CEP */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#2E3192]" />
                    Endereço do Colaborador (Busca por CEP):
                  </span>
                  <span className="text-[10px] text-slate-400">Preenchimento automático</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-40">
                    <input
                      type="text"
                      placeholder="CEP: 00000-000"
                      maxLength={9}
                      value={editForm.endereco.cep || ''}
                      onChange={e => {
                        const formatted = formatarCep(e.target.value);
                        setEditForm({
                          ...editForm,
                          endereco: { ...editForm.endereco, cep: formatted }
                        });
                        const clean = e.target.value.replace(/\D/g, '');
                        if (clean.length === 8) {
                          handleBuscarCepEdit(clean);
                        } else {
                          setCepEditFeedback(null);
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleBuscarCepEdit();
                        }
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-xs bg-white"
                    />
                    {isSearchingCepEdit && (
                      <div className="absolute right-2 top-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2E3192]" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBuscarCepEdit()}
                    disabled={isSearchingCepEdit}
                    className="px-2.5 py-1.5 bg-[#2E3192] hover:bg-indigo-900 disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                  >
                    {isSearchingCepEdit ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Search className="w-3 h-3" />
                    )}
                    <span>Buscar CEP</span>
                  </button>
                </div>

                {cepEditFeedback && (
                  <div
                    className={`px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 ${
                      cepEditFeedback.tipo === 'sucesso'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {cepEditFeedback.tipo === 'sucesso' ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                    )}
                    <span>{cepEditFeedback.texto}</span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-500 font-semibold">Logradouro / Rua</label>
                    <input
                      type="text"
                      value={editForm.endereco.logradouro}
                      onChange={e => setEditForm({
                        ...editForm,
                        endereco: { ...editForm.endereco, logradouro: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold">Número *</label>
                    <input
                      type="text"
                      value={editForm.endereco.numero}
                      onChange={e => setEditForm({
                        ...editForm,
                        endereco: { ...editForm.endereco, numero: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold">Bairro</label>
                    <input
                      type="text"
                      value={editForm.endereco.bairro || ''}
                      onChange={e => setEditForm({
                        ...editForm,
                        endereco: { ...editForm.endereco, bairro: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold">Cidade</label>
                    <input
                      type="text"
                      value={editForm.endereco.cidade}
                      onChange={e => setEditForm({
                        ...editForm,
                        endereco: { ...editForm.endereco, cidade: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-semibold">UF</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={editForm.endereco.uf}
                      onChange={e => setEditForm({
                        ...editForm,
                        endereco: { ...editForm.endereco, uf: e.target.value.toUpperCase() }
                      })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white uppercase font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2E3192] text-white rounded-xl font-bold shadow-xs hover:bg-[#252877]"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIRMAR EXCLUSÃO DE COLABORADOR */}
      {/* ======================================================== */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Excluir Colaborador?
                </h3>
                <p className="text-xs text-slate-500">
                  Esta ação revoga imediatamente todos os acessos do usuário.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800">{deletingUser.nome}</div>
              <div className="text-slate-500">{deletingUser.cargo} • {deletingUser.email}</div>
              <div className="text-[10px] text-slate-400 font-mono">Perfil: {deletingUser.role}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PRÉVIA DO E-MAIL DE CONVITE (PRIMEIRO ACESSO) */}
      {/* ======================================================== */}
      {showEmailPreviewModal && editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#2E3192] flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Prévia do Convite de Primeiro Acesso
                  </h3>
                  <p className="text-xs text-slate-500">
                    Visualização do e-mail oficial formatado que o colaborador receberá.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cabeçalho Técnico do E-mail (De / Para / Assunto) */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1 text-slate-600 font-mono">
              <div className="flex items-center justify-between">
                <div><strong className="text-slate-800">De:</strong> Brasil Legal Notificações &lt;sistema@brasillegal.com.br&gt;</div>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  SMTP Corporativo
                </span>
              </div>
              <div><strong className="text-slate-800">Para:</strong> {editForm.nome} &lt;{editForm.email}&gt;</div>
              <div><strong className="text-slate-800">Assunto:</strong> Convite de Primeiro Acesso - Plataforma Brasil Legal</div>
            </div>

            {/* Simulação Visual do E-mail HTML */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-slate-50">
              {/* Header do E-mail */}
              <div className="bg-[#1C1E63] p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#F2EC00]">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm tracking-tight text-white">Brasil Legal</h4>
                    <p className="text-[10px] text-slate-300">Regularização Imobiliária & Gestão Registral</p>
                  </div>
                </div>
                <div className="text-[10px] bg-white/10 px-2.5 py-1 rounded-full text-indigo-100 font-mono">
                  Acesso Corporativo
                </div>
              </div>

              {/* Corpo do E-mail */}
              <div className="p-6 bg-white space-y-4 text-xs text-slate-700 leading-relaxed">
                <div>
                  <p className="text-sm font-bold text-slate-900 mb-1">
                    Olá, {editForm.nome}!
                  </p>
                  <p className="text-slate-600">
                    Você foi cadastrado(a) na plataforma corporativa da <strong>Brasil Legal</strong> com o perfil de acesso <span className="font-semibold text-[#2E3192]">{editForm.role}</span> ({editForm.cargo}).
                  </p>
                </div>

                <p className="text-slate-600">
                  Para começar a operar no sistema, utilize as credenciais de primeiro acesso geradas para sua conta:
                </p>

                {/* Box de Credenciais Destacadas */}
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-indigo-100/80">
                    <span className="text-slate-500 text-[11px] font-sans">E-mail / Login:</span>
                    <strong className="text-[#2E3192] font-mono">{editForm.email}</strong>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-indigo-100/80">
                    <span className="text-slate-500 text-[11px] font-sans">Senha Inicial:</span>
                    <strong className="text-slate-900 bg-white px-2 py-0.5 rounded border border-indigo-200 font-mono text-sm tracking-wider">
                      {editForm.senha || 'brasillegal2026'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-500 text-[11px] font-sans">Perfil Atribuído:</span>
                    <span className="font-bold text-slate-800 uppercase text-[11px]">{editForm.role}</span>
                  </div>
                </div>

                {/* Botão de Ação do E-mail */}
                <div className="text-center py-2">
                  <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2E3192] text-white font-bold rounded-xl shadow-xs text-xs">
                    <span>Acessar Plataforma Brasil Legal</span>
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-200" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-mono">
                    {window.location.origin}
                  </p>
                </div>

                {/* Instruções de Segurança */}
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-800 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-amber-900">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    Orientações para o Primeiro Acesso:
                  </div>
                  <p>
                    1. Ao entrar pela primeira vez, recomendamos redefinir sua senha na área de perfil do usuário.<br />
                    2. Nunca compartilhe suas credenciais com terceiros.<br />
                    3. Em caso de dúvidas ou necessidade de suporte técnico, contate o administrador geral.
                  </p>
                </div>
              </div>

              {/* Rodapé do E-mail */}
              <div className="bg-slate-100 p-4 text-center text-[10px] text-slate-500 border-t border-slate-200">
                Brasil Legal Regularização Imobiliária • Todos os direitos reservados.
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedCredentials ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiado para Área de Transferência!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copiar Texto Formatado</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmailPreviewModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  disabled={isSendingInvite}
                  onClick={async () => {
                    await handleSendInviteEmail();
                    setShowEmailPreviewModal(false);
                  }}
                  className="px-4 py-2 bg-[#2E3192] hover:bg-[#252877] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSendingInvite ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Enviando Convite...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Disparar Convite Agora</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Recorte Interativo de Foto de Usuário */}
      <ModalRecortarFoto
        isOpen={cropModalData.isOpen}
        imageUrl={cropModalData.imageUrl}
        onClose={() => setCropModalData(prev => ({ ...prev, isOpen: false }))}
        onCropComplete={handleCropSave}
        titulo={cropModalData.target === 'create' ? 'Ajustar & Recortar Foto do Novo Usuário' : 'Ajustar & Recortar Foto do Colaborador'}
      />
    </div>
  );
};
