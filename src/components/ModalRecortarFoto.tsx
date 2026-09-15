import React, { useState, useRef, useEffect } from 'react';
import { 
  Crop, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Check, 
  X, 
  Move, 
  Sparkles, 
  RefreshCw, 
  Sliders,
  CheckCircle2,
  Upload
} from 'lucide-react';

interface ModalRecortarFotoProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedUrl: string) => void;
  title?: string;
  aspectRatio?: number; // 1 for 1:1 square/circular
}

export const ModalRecortarFoto: React.FC<ModalRecortarFotoProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
  title = 'Recortar & Enquadrar Foto do Especialista',
  aspectRatio = 1
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCircularGuide, setShowCircularGuide] = useState(true);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({ width: 280, height: 280 });

  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentImageSrc, setCurrentImageSrc] = useState(imageUrl);

  useEffect(() => {
    setCurrentImageSrc(imageUrl);
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setErrorMessage(null);
  }, [imageUrl, isOpen]);

  // Handle new file selection inside crop modal
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCurrentImageSrc(event.target.result as string);
          setZoom(1);
          setRotation(0);
          setOffset({ x: 0, y: 0 });
          setErrorMessage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Dragging / Panning handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile/tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Proporções base da imagem para cobrir a viewport de 280x280
  const aspect = (naturalDimensions.width && naturalDimensions.height)
    ? (naturalDimensions.width / naturalDimensions.height)
    : 1;
  const baseWidth = aspect >= 1 ? 280 * aspect : 280;
  const baseHeight = aspect >= 1 ? 280 : 280 / aspect;

  // Execute Crop & Render to High-DPI Canvas
  const handleApplyCrop = async () => {
    if (!currentImageSrc) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Helper para carregar a imagem de forma segura e sem 'tainted canvas'
      const loadSafeImage = async (src: string): Promise<HTMLImageElement> => {
        // Se já for data URL ou blob URL, carrega diretamente
        if (src.startsWith('data:') || src.startsWith('blob:')) {
          return new Promise((resolve, reject) => {
            const i = new Image();
            i.onload = () => resolve(i);
            i.onerror = () => reject(new Error('Falha ao processar arquivo de imagem local.'));
            i.src = src;
          });
        }

        // Se for URL relativa da mesma aplicação (ex: /team/..., /uploads/...)
        if (src.startsWith('/')) {
          return new Promise((resolve, reject) => {
            const i = new Image();
            i.crossOrigin = 'anonymous';
            i.onload = () => resolve(i);
            i.onerror = () => {
              const i2 = new Image();
              i2.onload = () => resolve(i2);
              i2.onerror = () => reject(new Error('Não foi possível carregar o arquivo da imagem.'));
              i2.src = src;
            };
            i.src = src;
          });
        }

        // URLs remotas: tenta buscar via proxy para contornar CORS
        try {
          const fetchUrl = `/api/proxy-image?url=${encodeURIComponent(src)}`;
          const resp = await Promise.race([
            fetch(fetchUrl),
            new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Timeout proxy')), 3500))
          ]);
          if (resp.ok) {
            const blob = await resp.blob();
            const blobUrl = URL.createObjectURL(blob);
            return new Promise((resolve, reject) => {
              const i = new Image();
              i.onload = () => resolve(i);
              i.onerror = () => reject(new Error('Falha ao renderizar foto remota.'));
              i.src = blobUrl;
            });
          }
        } catch (fetchErr) {
          console.warn('Proxy de imagem indisponível, tentando carregamento direto:', fetchErr);
        }

        // Fallback: carregar diretamente com crossOrigin anonymous
        return new Promise((resolve, reject) => {
          const i = new Image();
          i.crossOrigin = 'anonymous';
          i.onload = () => resolve(i);
          i.onerror = () => {
            const i2 = new Image();
            i2.onload = () => resolve(i2);
            i2.onerror = () => reject(new Error('Não foi possível carregar a imagem externa para recorte. Faça o envio da foto do seu computador usando "Trocar Imagem".'));
            i2.src = src;
          };
          i.src = src;
        });
      };

      const img = await loadSafeImage(currentImageSrc);

      const targetSize = 400; // 400x400 para nitidez máxima e peso leve (~30KB)
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context não suportado pelo navegador.');
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // 1. Move a origem para o centro do canvas
      ctx.translate(targetSize / 2, targetSize / 2);

      // 2. Aplica offset proporcional da tela (280px viewport -> 400px canvas)
      const scaleFactor = targetSize / 280;
      ctx.translate(offset.x * scaleFactor, offset.y * scaleFactor);

      // 3. Aplica zoom e rotação em torno do centro
      ctx.scale(zoom, zoom);
      ctx.rotate((rotation * Math.PI) / 180);

      // 4. Desenha a imagem centrada com base nas proporções exatas da tela
      const drawW = baseWidth * scaleFactor;
      const drawH = baseHeight * scaleFactor;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

      // Exporta em JPEG otimizado (400x400 ~30KB) que é 100% persistível no Firestore e nunca expira
      let dataUrl = '';
      try {
        dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      } catch (canvasErr) {
        console.warn('Canvas export protegido, usando foto original:', canvasErr);
        onCropComplete(currentImageSrc);
        onClose();
        return;
      }

      // Mantém a foto em dataUrl otimizada diretamente para que o Firebase Firestore sincronize
      // instantaneamente em todos os celulares, tablets e cPanel sem depender de upload em disco local.
      // Opcionalmente tenta enviar ao servidor Express em segundo plano se disponível.
      try {
        fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataUrl,
            filename: `especialista_${Date.now()}`
          })
        }).catch(() => {});
      } catch (uploadErr) {
        // Ignora silenciosamente
      }

      onCropComplete(dataUrl);
      onClose();
    } catch (err: any) {
      console.error('Erro ao recortar imagem:', err);
      setErrorMessage(err?.message || 'Erro ao processar o recorte da foto. Tente carregar o arquivo do seu computador.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#2E3192] to-[#1E216B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-white/10 text-[#F2EC00]">
              <Crop className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold leading-tight">{title}</h3>
              <p className="text-[11px] text-indigo-200">
                Arraste para posicionar, use o zoom e rotacione para o enquadramento perfeito.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body / Interactive Crop Stage */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {errorMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start justify-between gap-2">
              <p>{errorMessage}</p>
              <button
                type="button"
                onClick={() => {
                  onCropComplete(currentImageSrc);
                  onClose();
                }}
                className="underline font-bold text-amber-900 shrink-0 cursor-pointer"
              >
                Usar foto original
              </button>
            </div>
          )}

          {/* Viewport Box (280x280) */}
          <div className="flex flex-col items-center">
            <div 
              ref={containerRef}
              className="relative w-[280px] h-[280px] bg-slate-900 rounded-2xl overflow-hidden shadow-inner cursor-grab active:cursor-grabbing select-none border-2 border-slate-300"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Image element being transformed */}
              {currentImageSrc ? (
                <div
                  className="w-full h-full flex items-center justify-center pointer-events-none relative overflow-hidden"
                >
                  <img
                    ref={imageRef}
                    src={currentImageSrc}
                    alt="Preview"
                    className="transition-transform duration-75 select-none"
                    style={{
                      width: `${baseWidth}px`,
                      height: `${baseHeight}px`,
                      minWidth: `${baseWidth}px`,
                      minHeight: `${baseHeight}px`,
                      maxWidth: 'none',
                      maxHeight: 'none',
                      transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: 'center center'
                    }}
                    draggable={false}
                    onLoad={(e) => {
                      const target = e.currentTarget;
                      if (target.naturalWidth && target.naturalHeight) {
                        setNaturalDimensions({
                          width: target.naturalWidth,
                          height: target.naturalHeight
                        });
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <Upload className="w-8 h-8 mb-2" />
                  <p className="text-xs">Nenhuma foto carregada</p>
                </div>
              )}

              {/* Mask overlay: Circular avatar cutout or square cutout */}
              <div className="absolute inset-0 pointer-events-none">
                {showCircularGuide ? (
                  <div className="w-full h-full relative">
                    {/* Darkened corners around circular aperture */}
                    <svg className="w-full h-full" viewBox="0 0 280 280">
                      <defs>
                        <mask id="circle-mask">
                          <rect width="280" height="280" fill="white" />
                          <circle cx="140" cy="140" r="125" fill="black" />
                        </mask>
                      </defs>
                      <rect 
                        width="280" 
                        height="280" 
                        fill="rgba(15, 23, 42, 0.65)" 
                        mask="url(#circle-mask)" 
                      />
                      <circle 
                        cx="140" 
                        cy="140" 
                        r="125" 
                        fill="none" 
                        stroke="#F2EC00" 
                        strokeWidth="2" 
                        strokeDasharray="4 4"
                      />
                    </svg>
                  </div>
                ) : (
                  <div className="w-full h-full border-2 border-dashed border-[#F2EC00] pointer-events-none" />
                )}
              </div>

              {/* Move hint badge */}
              <div className="absolute bottom-2 left-2 pointer-events-none bg-slate-950/75 text-white px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1">
                <Move className="w-3 h-3 text-[#F2EC00]" />
                Arraste para ajustar
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-2 text-center">
              {showCircularGuide ? 'O círculo amarelo delimita o formato final do card no site.' : 'Enquadramento quadrado (1:1).'}
            </p>
          </div>

          {/* Controls Bar */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((prev) => Math.max(0.6, parseFloat((prev - 0.1).toFixed(2))))}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-[#2E3192]" /> Zoom
                  </span>
                  <span className="font-mono text-[#2E3192]">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="3.0"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-[#2E3192] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>

              <button
                type="button"
                onClick={() => setZoom((prev) => Math.min(3.0, parseFloat((prev + 0.1).toFixed(2))))}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Tool buttons: Rotate, Toggle Mask, Upload alternative, Reset */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  title="Girar 90 graus"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#2E3192]" />
                  <span>Girar 90°</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCircularGuide(!showCircularGuide)}
                  className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1 cursor-pointer transition-colors ${
                    showCircularGuide
                      ? 'bg-indigo-50 border-indigo-200 text-[#2E3192]'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Alternar guia redonda / quadrada"
                >
                  <span>{showCircularGuide ? 'Máscara Redonda' : 'Máscara Quadrada'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                  title="Redefinir enquadramento"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resetar</span>
                </button>
              </div>

              {/* Upload different file button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Trocar Imagem</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={isProcessing || !currentImageSrc}
            className="px-5 py-2 text-xs font-bold text-white bg-[#2E3192] hover:bg-[#1E216B] disabled:opacity-50 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all border-b-2 border-[#F2EC00]"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#F2EC00]" />
                <span>Processando Recorte...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-[#F2EC00]" />
                <span>Aplicar Recorte &amp; Usar Foto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
