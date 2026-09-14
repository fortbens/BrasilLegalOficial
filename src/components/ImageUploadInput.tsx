import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  X, 
  Check, 
  AlertCircle,
  Eye,
  Sparkles,
  Crop
} from 'lucide-react';
import { ModalRecortarFoto } from './ModalRecortarFoto';

interface PresetOption {
  label: string;
  url: string;
}

interface ImageUploadInputProps {
  id?: string;
  label?: string;
  description?: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  accept?: string;
  maxSizeMB?: number;
  presets?: PresetOption[];
  aspectHint?: string;
  className?: string;
  required?: boolean;
  enableCrop?: boolean;
  cropTitle?: string;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  id,
  label,
  description,
  helperText,
  value,
  onChange,
  placeholder = 'https://...',
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,.ico',
  maxSizeMB = 5,
  presets,
  aspectHint,
  className = '',
  required = false,
  enableCrop = true,
  cropTitle
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>(value && value.startsWith('data:') ? 'upload' : 'upload');
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);

    // Check file type
    if (!file.type.startsWith('image/') && !file.name.endsWith('.ico')) {
      setErrorMsg('Por favor selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP, ICO).');
      return;
    }

    // Check size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setErrorMsg(`A imagem excede o tamanho máximo de ${maxSizeMB}MB (tamanho atual: ${sizeMB.toFixed(1)}MB).`);
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Erro ao ler o arquivo. Tente novamente ou use uma URL.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const isDataUrl = value && value.startsWith('data:');
  const hasValue = Boolean(value && value.trim().length > 0);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label htmlFor={id} className="block text-xs font-bold text-slate-800">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        
        {/* Toggle between Upload and URL */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              mode === 'upload' 
                ? 'bg-white text-[#2E3192] shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3 h-3" />
            Upload Arquivo
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-0.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              mode === 'url' 
                ? 'bg-white text-[#2E3192] shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            Colar URL
          </button>
        </div>
      </div>

      {(description || helperText) && (
        <p className="text-[11px] text-slate-500 leading-tight">
          {description || helperText}
          {aspectHint && <span className="text-slate-400 ml-1">({aspectHint})</span>}
        </p>
      )}

      {/* Mode 1: File Upload (Drag & Drop + File Explorer) */}
      {mode === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            id={id}
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
          />

          {!hasValue ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                dragActive 
                  ? 'border-[#2E3192] bg-indigo-50/50 scale-[1.01]' 
                  : 'border-slate-300 hover:border-[#2E3192] bg-slate-50 hover:bg-white'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-[#2E3192]">
                <Upload className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800">
                  Clique para selecionar ou arraste sua imagem
                </p>
                <p className="text-[10px] text-slate-500">
                  Formatos suportados: PNG, JPG, SVG, WebP, ICO (até {maxSizeMB}MB)
                </p>
              </div>
            </div>
          ) : (
            /* Uploaded Preview State */
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs p-1">
                  <img
                    src={value}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {isDataUrl ? 'Imagem Carregada do Dispositivo' : 'Imagem Vinculada'}
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Ativo
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate font-mono">
                    {isDataUrl ? 'Armazenada localmente em base64' : value}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {enableCrop && (
                  <button
                    type="button"
                    onClick={() => setIsCropModalOpen(true)}
                    className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
                    title="Recortar e enquadrar foto"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>Recortar</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs font-semibold text-[#2E3192] bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs cursor-pointer"
                >
                  Trocar
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Remover imagem"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: External URL Input */}
      {mode === 'url' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-8 pr-8 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-[#2E3192] focus:border-[#2E3192]"
                required={required}
              />
              {hasValue && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Mini preview for URL */}
          {hasValue && (
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <div className="w-8 h-8 rounded bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-[11px] text-slate-600 truncate flex-1 font-mono">
                {value}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Quick Presets (if provided) */}
      {presets && presets.length > 0 && (
        <div className="pt-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#2E3192]" /> Exemplos / Presets Rápidos:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(preset.url)}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-[#2E3192] text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Recorte de Foto Interativo */}
      {enableCrop && (
        <ModalRecortarFoto
          isOpen={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
          imageUrl={value}
          onCropComplete={(croppedUrl) => {
            onChange(croppedUrl);
            setIsCropModalOpen(false);
          }}
          title={cropTitle || `Recortar ${label || 'Foto'}`}
        />
      )}
    </div>
  );
};
