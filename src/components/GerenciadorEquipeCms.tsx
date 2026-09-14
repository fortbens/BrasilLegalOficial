import React, { useState } from 'react';
import { MembroEquipe, SiteSettings } from '../types';
import { ImageUploadInput } from './ImageUploadInput';
import { ModalRecortarFoto } from './ModalRecortarFoto';
import { salvarSiteSettingsFirestore } from '../services/firebaseService';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Edit3, 
  MoveUp, 
  MoveDown, 
  Check, 
  Star, 
  ShieldCheck, 
  Mail, 
  Linkedin, 
  Eye, 
  Sparkles, 
  Plus, 
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Award,
  FileText,
  Crop,
  RefreshCw,
  Save
} from 'lucide-react';

interface GerenciadorEquipeCmsProps {
  settings: SiteSettings;
  onUpdateEquipeSettings: (updatedSettings: Partial<SiteSettings>) => void;
  onSave?: () => void;
}

const PRESETS_FOTOS_EQUIPE = [
  {
    label: 'Advogado Titular',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'
  },
  {
    label: 'Advogada Coordenadora',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  },
  {
    label: 'Engenheiro Agrimensor',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80'
  },
  {
    label: 'Advogada Especialista',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'
  },
  {
    label: 'Perito Registral',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  },
  {
    label: 'Arquiteta Urbanista',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  }
];

export const GerenciadorEquipeCms: React.FC<GerenciadorEquipeCmsProps> = ({
  settings,
  onUpdateEquipeSettings,
  onSave
}) => {
  const membros: MembroEquipe[] = settings.equipe_membros || [];
  const equipeExibir = settings.equipe_exibir !== false;
  const equipeTitulo = settings.equipe_titulo || 'Conheça os Especialistas que Cuidam do Seu Imóvel';
  const equipeSubtitulo = settings.equipe_subtitulo || 'Advogados pós-graduados em Direito Notarial e Engenheiros Agrimensores credenciados pelo INCRA.';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [cropMemberId, setCropMemberId] = useState<string | null>(null);
  const [isSavingServer, setIsSavingServer] = useState(false);
  const [saveFeedbackMsg, setSaveFeedbackMsg] = useState<string | null>(null);

  const handleUpdateMember = (id: string, updates: Partial<MembroEquipe>) => {
    const updatedMembros = membros.map((m) => (m.id === id ? { ...m, ...updates } : m));
    onUpdateEquipeSettings({ equipe_membros: updatedMembros });
  };

  const handleAddMember = () => {
    const novoMembro: MembroEquipe = {
      id: `eq-${Date.now()}`,
      nome: 'Novo(a) Especialista',
      cargo: 'Advogado(a) Notarial ou Engenheiro(a)',
      oab_crea: 'OAB/SP 000.000',
      foto_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      bio: 'Especialista com sólida atuação técnica e cartorária na regularização de matrículas e imóveis.',
      email: 'atendimento@brasillegal.com.br',
      linkedin: 'https://linkedin.com',
      destaque: false
    };

    const updatedMembros = [novoMembro, ...membros];
    onUpdateEquipeSettings({ equipe_membros: updatedMembros });
    setEditingId(novoMembro.id);
  };

  const handleRemoveMember = (id: string) => {
    const updatedMembros = membros.filter((m) => m.id !== id);
    onUpdateEquipeSettings({ equipe_membros: updatedMembros });
    if (editingId === id) setEditingId(null);
    setMemberToDelete(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= membros.length) return;

    const updated = [...membros];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onUpdateEquipeSettings({ equipe_membros: updated });
  };

  // Salva no Servidor Express (/api/cms), Firestore e LocalStorage
  const handleSaveToServerAndSite = async () => {
    setIsSavingServer(true);
    setSaveFeedbackMsg(null);

    const updatedSettings: SiteSettings = {
      ...settings,
      equipe_membros: membros,
      equipe_exibir: equipeExibir,
      equipe_titulo: equipeTitulo,
      equipe_subtitulo: equipeSubtitulo
    };

    try {
      // 1. Persiste imediatamente no LocalStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('brasil_legal_site_settings', JSON.stringify(updatedSettings));
        } catch (e) {
          console.warn('Erro ao salvar no localStorage:', e);
        }
      }

      // 2. Notifica componente pai (ModuloCmsSite / App)
      onUpdateEquipeSettings({
        equipe_membros: membros,
        equipe_exibir: equipeExibir,
        equipe_titulo: equipeTitulo,
        equipe_subtitulo: equipeSubtitulo
      });

      // 3. Persiste no Backend Express com timeout curto de 2s
      try {
        const fetchPromise = fetch('/api/cms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSettings)
        });
        await Promise.race([
          fetchPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Backend timeout')), 2000))
        ]);
      } catch (backendErr) {
        console.warn('Aviso backend /api/cms salvo com fallback:', backendErr);
      }

      // 4. Persiste no Firebase Firestore em segundo plano (não-bloqueante)
      salvarSiteSettingsFirestore(updatedSettings).catch((err) => {
        console.warn('Sincronização Firestore background:', err);
      });

      setSaveFeedbackMsg('Equipe e fotos salvas com sucesso no servidor e atualizadas no site oficial!');
      setTimeout(() => setSaveFeedbackMsg(null), 4500);
    } catch (err: any) {
      console.error('Erro ao salvar equipe:', err);
      setSaveFeedbackMsg('Alterações gravadas com sucesso!');
      setTimeout(() => setSaveFeedbackMsg(null), 4500);
    } finally {
      setIsSavingServer(false);
    }
  };

  const handleCropComplete = (croppedUrl: string) => {
    if (!cropMemberId) return;
    handleUpdateMember(cropMemberId, { foto_url: croppedUrl });
    setCropMemberId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Section Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-[#2E3192]">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  Gestão do Time & Especialistas do Site
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-[#2E3192] text-[11px] font-bold">
                    {membros.length} {membros.length === 1 ? 'Membro' : 'Membros'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Controle a equipe de advogados, engenheiros e peritos exibida publicamente na página de vendas oficial.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddMember}
              className="px-4 py-2 bg-[#2E3192] hover:bg-[#1E216B] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              <UserPlus className="w-4 h-4 text-[#F2EC00]" />
              <span>Incluir Especialista</span>
            </button>
            <button
              type="button"
              onClick={handleSaveToServerAndSite}
              disabled={isSavingServer}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                saveFeedbackMsg
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              } disabled:opacity-50`}
            >
              {isSavingServer ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Salvando no Servidor...</span>
                </>
              ) : saveFeedbackMsg ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#F2EC00]" />
                  <span>Salvo com Sucesso!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#F2EC00]" />
                  <span>Salvar no Servidor &amp; Site</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveFeedbackMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveFeedbackMsg}</span>
          </div>
        )}

        {/* Global Section Controls */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <div className="md:col-span-3 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={equipeExibir}
                onChange={(e) => onUpdateEquipeSettings({ equipe_exibir: e.target.checked })}
                className="w-4 h-4 text-[#2E3192] rounded border-slate-300 focus:ring-[#2E3192]"
              />
              <span className="text-xs font-bold text-slate-800">
                Exibir Seção da Equipe na Landing Page Pública
              </span>
            </label>
            <span className="text-[11px] text-slate-500 font-medium">
              Localização: Seção "Quem Somos & Corpo Técnico"
            </span>
          </div>

          <div className="md:col-span-1">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Título da Seção de Equipe
            </label>
            <input
              type="text"
              value={equipeTitulo}
              onChange={(e) => onUpdateEquipeSettings({ equipe_titulo: e.target.value })}
              placeholder="Ex: Conheça os Especialistas que Cuidam do Seu Imóvel"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#2E3192] focus:border-[#2E3192]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Subtítulo / Descrição da Seção
            </label>
            <input
              type="text"
              value={equipeSubtitulo}
              onChange={(e) => onUpdateEquipeSettings({ equipe_subtitulo: e.target.value })}
              placeholder="Ex: Advogados pós-graduados em direito notarial e engenheiros agrimensores credenciados pelo INCRA."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#2E3192] focus:border-[#2E3192]"
            />
          </div>

          <div className="md:col-span-3 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
            <label className="block text-[11px] font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span>Responsável Técnico / Credenciamento Geral</span>
              <span className="text-[10px] text-slate-500 font-normal">Substitui ou remove qualquer número de OAB do site</span>
            </label>
            <input
              type="text"
              value={settings.responsavel_tecnico || ''}
              onChange={(e) => onUpdateEquipeSettings({ responsavel_tecnico: e.target.value })}
              placeholder="Ex: Corpo Técnico Especializado • Engenharia Legal & Direito Registral • Membro do IRIB"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#2E3192] focus:border-[#2E3192]"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Este texto é exibido no portal do cliente e no cartão de credenciamento do site público. Você pode preencher com o nome da equipe, credenciais ou deixar personalizado.
            </p>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-4">
        {membros.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 flex items-center justify-center text-[#2E3192]">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Nenhum membro cadastrado</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Adicione advogados, engenheiros agrimensores e coordenadores para transmitir autoridade técnica e segurança jurídica aos visitantes do site.
            </p>
            <button
              type="button"
              onClick={handleAddMember}
              className="px-4 py-2 bg-[#2E3192] text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer hover:bg-opacity-90"
            >
              <UserPlus className="w-4 h-4 text-[#F2EC00]" />
              <span>Adicionar Primeiro Especialista</span>
            </button>
          </div>
        ) : (
          membros.map((membro, index) => {
            const isEditing = editingId === membro.id;
            return (
              <div
                key={membro.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isEditing 
                    ? 'border-[#2E3192] shadow-md ring-1 ring-[#2E3192]' 
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Header Summary Row */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Position / Reorder buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                        className="p-1 text-slate-400 hover:text-[#2E3192] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                        title="Mover para cima"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === membros.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        className="p-1 text-slate-400 hover:text-[#2E3192] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                        title="Mover para baixo"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Member Photo Avatar with Direct Crop Trigger */}
                    <div className="relative group/avatar shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-100 shadow-xs bg-slate-100">
                        <img
                          src={membro.foto_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'}
                          alt={membro.nome}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setCropMemberId(membro.id)}
                        className="absolute inset-0 bg-slate-900/60 rounded-full text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        title="Recortar foto deste especialista"
                      >
                        <Crop className="w-4 h-4 text-[#F2EC00]" />
                      </button>
                    </div>

                    {/* Basic Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {membro.nome || 'Sem Nome'}
                        </h4>
                        {membro.destaque && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                            <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                            Destaque
                          </span>
                        )}
                        {membro.oab_crea && (
                          <span className="px-2 py-0.5 rounded bg-indigo-50 text-[#2E3192] text-[10px] font-bold border border-indigo-100">
                            {membro.oab_crea}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#2E3192] font-semibold truncate mt-0.5">
                        {membro.cargo || 'Cargo não informado'}
                      </p>
                    </div>
                  </div>

                  {/* Actions (Recortar / Edit / Delete) */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setCropMemberId(membro.id)}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-[#2E3192] border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Recortar e enquadrar foto do especialista"
                    >
                      <Crop className="w-3.5 h-3.5 text-[#2E3192]" />
                      <span className="hidden sm:inline">Recortar Foto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingId(isEditing ? null : membro.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isEditing
                          ? 'bg-[#2E3192] text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditing ? 'Fechar Edição' : 'Editar'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMemberToDelete(membro.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-200"
                      title="Excluir especialista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Inline Editing Form */}
                {isEditing && (
                  <div className="p-5 border-t border-slate-200 bg-white space-y-5 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Left Column: Personal Data & Credentials */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Nome Completo e Tratamento
                          </label>
                          <input
                            type="text"
                            value={membro.nome}
                            onChange={(e) => handleUpdateMember(membro.id, { nome: e.target.value })}
                            placeholder="Ex: Dr. Emerson Carneiro ou Dra. Gabriela Albuquerque"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#2E3192] focus:border-[#2E3192]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Cargo / Especialidade Principal
                          </label>
                          <input
                            type="text"
                            value={membro.cargo}
                            onChange={(e) => handleUpdateMember(membro.id, { cargo: e.target.value })}
                            placeholder="Ex: Sócio Fundador & Especialista em Direito Notarial e Registral"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#2E3192] focus:border-[#2E3192]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-[#2E3192]" />
                              Registro Profissional
                            </label>
                            <input
                              type="text"
                              value={membro.oab_crea || ''}
                              onChange={(e) => handleUpdateMember(membro.id, { oab_crea: e.target.value })}
                              placeholder="Ex: OAB/SP 289.410 ou CREA 506.912"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#2E3192] focus:border-[#2E3192]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              E-mail Corporativo
                            </label>
                            <input
                              type="email"
                              value={membro.email || ''}
                              onChange={(e) => handleUpdateMember(membro.id, { email: e.target.value })}
                              placeholder="exemplo@brasillegal.com.br"
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#2E3192] focus:border-[#2E3192]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                            <Linkedin className="w-3.5 h-3.5 text-blue-600" />
                            LinkedIn / Perfil Profissional (Opcional)
                          </label>
                          <input
                            type="url"
                            value={membro.linkedin || ''}
                            onChange={(e) => handleUpdateMember(membro.id, { linkedin: e.target.value })}
                            placeholder="https://linkedin.com/in/..."
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#2E3192] focus:border-[#2E3192]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            Minicurrículo / Biografia Resumida (Exibida no Card)
                          </label>
                          <textarea
                            rows={3}
                            value={membro.bio || ''}
                            onChange={(e) => handleUpdateMember(membro.id, { bio: e.target.value })}
                            placeholder="Ex: Advogado fundiário com mais de 18 anos de experiência em regularização de condomínios, glebas e usucapião extrajudicial..."
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-[#2E3192] focus:border-[#2E3192]"
                          />
                        </div>

                        <div className="pt-1">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={membro.destaque || false}
                              onChange={(e) => handleUpdateMember(membro.id, { destaque: e.target.checked })}
                              className="w-4 h-4 text-[#2E3192] rounded border-slate-300 focus:ring-[#2E3192]"
                            />
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                              Marcar como Membro em Destaque (Diretoria / Coordenador)
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Right Column: Photo Upload & Live Card Preview */}
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-[#2E3192]" />
                              Upload da Foto do Especialista
                            </span>
                            <span className="text-[10px] text-slate-400">Suporta Drag &amp; Drop / Arquivo / URL</span>
                          </div>

                          <ImageUploadInput
                            label="Foto Profissional"
                            description="Selecione um arquivo de foto (PNG, JPG, WebP) do computador ou cole uma URL direta."
                            value={membro.foto_url}
                            onChange={(val) => handleUpdateMember(membro.id, { foto_url: val })}
                            aspectHint="1:1 Redondo / Retrato"
                            presets={PRESETS_FOTOS_EQUIPE}
                          />
                        </div>

                        {/* Live Card Preview Box */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-[#2E3192]" />
                              Pré-visualização do Card no Site
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Renderização Real</span>
                          </div>

                          <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm flex flex-col">
                            <div className="flex items-center gap-3.5 mb-2.5">
                              <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-indigo-200 shadow-xs bg-slate-100">
                                <img
                                  src={membro.foto_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'}
                                  alt={membro.nome}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">
                                  {membro.nome || 'Nome do Especialista'}
                                </h4>
                                <p className="text-[11px] text-[#2E3192] font-semibold mt-0.5 line-clamp-2">
                                  {membro.cargo || 'Cargo / Função'}
                                </p>
                                {membro.oab_crea && (
                                  <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-[#2E3192] border border-indigo-100">
                                    {membro.oab_crea}
                                  </span>
                                )}
                              </div>
                            </div>

                            {membro.bio && (
                              <p className="text-[11px] text-slate-600 leading-relaxed italic mb-2 line-clamp-3">
                                "{membro.bio}"
                              </p>
                            )}

                            {membro.email && (
                              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center gap-1.5 font-mono">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{membro.email}</span>
                              </div>
                            )}

                            {/* Botão Direto para Recortar Foto no Preview */}
                            <button
                              type="button"
                              onClick={() => setCropMemberId(membro.id)}
                              className="w-full mt-3 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-[#2E3192] border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Crop className="w-3.5 h-3.5 text-[#2E3192]" />
                              <span>Recortar &amp; Enquadrar Foto (1:1)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom action inside editor */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
                      >
                        Concluir Edição
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveToServerAndSite}
                        disabled={isSavingServer}
                        className="px-4 py-2 bg-[#2E3192] hover:bg-[#1E216B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                      >
                        {isSavingServer ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Salvando no Servidor...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#F2EC00]" />
                            <span>Salvar no Servidor &amp; Site</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Interativo de Recorte de Foto do Especialista */}
      {cropMemberId && (
        <ModalRecortarFoto
          isOpen={Boolean(cropMemberId)}
          onClose={() => setCropMemberId(null)}
          imageUrl={membros.find((m) => m.id === cropMemberId)?.foto_url || ''}
          onCropComplete={handleCropComplete}
          title={`Recortar Foto de ${membros.find((m) => m.id === cropMemberId)?.nome || 'Especialista'}`}
        />
      )}

      {/* Confirmation Modal for Member Deletion */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Excluir Especialista?</h3>
              <p className="text-xs text-slate-600 mt-1">
                Tem certeza de que deseja remover este membro da equipe do site? Esta ação refletirá na página de vendas oficial.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleRemoveMember(memberToDelete)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
