import React, { useState, useRef } from 'react';
import { AppSettings } from '../types';
import { BRASIL_LEGAL_LOGO_PRESETS } from '../utils/logoPresets';
import { 
  X, 
  UploadCloud, 
  Link2, 
  Check, 
  Sparkles, 
  Image as ImageIcon,
  Building,
  AlertCircle
} from 'lucide-react';

interface ModalTrocarLogoMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogoUrl?: string;
  appSettings: AppSettings;
  onSaveLogo: (novoLogoUrl: string) => Promise<void> | void;
}

export const ModalTrocarLogoMenu: React.FC<ModalTrocarLogoMenuProps> = ({
  isOpen,
  onClose,
  currentLogoUrl,
  appSettings,
  onSaveLogo
}) => {
  const currentInitial = currentLogoUrl || appSettings.logo_dark_url || appSettings.logo_light_url || appSettings.logo_header_url || BRASIL_LEGAL_LOGO_PRESETS[0].dataUri;
  const [selectedLogo, setSelectedLogo] = useState<string>(currentInitial);
  const [urlInput, setUrlInput] = useState<string>(currentInitial.startsWith('http') ? currentInitial : '');
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG ou WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('O arquivo deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        setSelectedLogo(e.target.result);
        setUrlInput('');
      }
    };
    reader.onerror = () => {
      setUploadError('Erro ao ler a imagem. Tente novamente.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setSelectedLogo(urlInput.trim());
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveLogo(selectedLogo);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar logo:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1C1E63] to-[#2E3192] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-[#F2EC00]" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                Alterar Logotipo do Menu
                <span className="text-[10px] bg-[#F2EC00] text-slate-900 font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Ao Vivo
                </span>
              </h2>
              <p className="text-xs text-white/80">
                Personalize o emblema exibido no topo do menu lateral e na plataforma
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Live Preview Bar */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Pré-visualização em Tempo Real</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Pronto para aplicar
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Dark Preview (Sidebar style) */}
              <div 
                className="rounded-xl p-3 flex items-center gap-3 shadow-inner border border-white/10"
                style={{ backgroundColor: appSettings.cor_destaque || '#1C1E63' }}
              >
                <div 
                  className="w-11 h-11 rounded-xl bg-white flex items-center justify-center p-1 shrink-0 shadow-md border"
                  style={{ borderColor: appSettings.cor_secundaria || '#F2EC00' }}
                >
                  {selectedLogo ? (
                    <img 
                      src={selectedLogo} 
                      alt="Logo Preview" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building className="w-6 h-6 text-[#2E3192]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {appSettings.app_name || 'BRASIL LEGAL'}
                  </div>
                  <div className="text-[10px] text-white/70 truncate">Menu Lateral</div>
                </div>
              </div>

              {/* Light Preview */}
              <div className="rounded-xl p-3 bg-white border border-slate-300 flex items-center gap-3 shadow-2xs">
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center p-1 shrink-0 border border-slate-200">
                  {selectedLogo ? (
                    <img 
                      src={selectedLogo} 
                      alt="Logo Preview Light" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building className="w-6 h-6 text-slate-700" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    Fundo Claro
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">Documentos & Relatórios</div>
                </div>
              </div>
            </div>
          </div>

          {/* Selector Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'border-[#2E3192] text-[#2E3192]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              Upload do Dispositivo
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'border-[#2E3192] text-[#2E3192]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Emblemas Oficiais
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 pb-2.5 text-xs font-bold text-center border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'url'
                  ? 'border-[#2E3192] text-[#2E3192]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Link2 className="w-4 h-4" />
              Inserir Link URL
            </button>
          </div>

          {/* TAB 1: File Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-[#2E3192] bg-indigo-50/60 scale-[1.01]' 
                    : 'border-slate-300 hover:border-[#2E3192] hover:bg-slate-50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-[#2E3192] flex items-center justify-center mx-auto mb-2.5">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-800">
                  Clique para selecionar ou arraste sua imagem
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Formatos suportados: PNG, SVG, JPG ou WEBP (até 5MB)
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 inline-block px-2 py-0.5 rounded-full mt-2">
                  ✓ Converte direto para Base64 (salva localmente sem depender de links externos)
                </div>
              </div>

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Official Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-2">
              <div className="text-xs text-slate-500 mb-2">
                Selecione um dos emblemas oficiais vetorizados de alta definição com as cores da Brasil Legal:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {BRASIL_LEGAL_LOGO_PRESETS.map((preset) => {
                  const isSelected = selectedLogo === preset.dataUri;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedLogo(preset.dataUri)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#2E3192] bg-indigo-50/60 shadow-xs ring-2 ring-[#2E3192]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs">
                        <img 
                          src={preset.dataUri} 
                          alt={preset.nome}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {preset.nome}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                          {preset.descricao}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#2E3192] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: URL Link */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL da Imagem Online
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://suaempresa.com.br/logo.png"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#2E3192] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 cursor-pointer"
                  >
                    Carregar
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Cole um link direto que aponte para um arquivo de imagem público acessível via HTTPS.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !selectedLogo}
            className="px-5 py-2.5 bg-[#2E3192] hover:bg-[#1E216B] text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2 border-b-2 border-[#F2EC00] cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <span>Salvando...</span>
            ) : (
              <>
                <Check className="w-4 h-4 text-[#F2EC00]" />
                <span>Aplicar Logotipo Agora</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
