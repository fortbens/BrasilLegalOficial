import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Move, 
  Check, 
  Sparkles, 
  Maximize2,
  RefreshCcw,
  Scissors
} from 'lucide-react';

interface ModalRecortarFotoProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
  titulo?: string;
}

export const ModalRecortarFoto: React.FC<ModalRecortarFotoProps> = ({
  isOpen,
  imageUrl,
  onClose,
  onCropComplete,
  titulo = 'Ajustar & Recortar Foto do Usuário'
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [shape, setShape] = useState<'circle' | 'square'>('circle');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Reset controls when a new image is loaded
  useEffect(() => {
    if (isOpen && imageUrl) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(false);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setImageLoaded(true);
      };
      img.src = imageUrl;
    }
  }, [isOpen, imageUrl]);

  // Handle Drag / Pan with mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle Touch Drag
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Live Canvas Thumbnail Preview Update
  useEffect(() => {
    if (!imageLoaded || !imgRef.current || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 120;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    ctx.save();
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    // Translate to center
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate normalized aspect ratio draw
    const img = imgRef.current;
    const aspect = img.naturalWidth / img.naturalHeight;
    let drawW = size;
    let drawH = size;
    if (aspect > 1) {
      drawW = size * aspect;
    } else {
      drawH = size / aspect;
    }

    // Scale position relative to preview size vs crop frame size (crop frame is 260px)
    const ratio = size / 260;
    ctx.drawImage(img, -drawW / 2 + (position.x * ratio) / zoom, -drawH / 2 + (position.y * ratio) / zoom, drawW, drawH);
    ctx.restore();
  }, [imageLoaded, zoom, rotation, position, shape]);

  // Execute Final High-Resolution Crop (400x400)
  const handleApplyCrop = () => {
    if (!imgRef.current) return;

    const img = imgRef.current;
    const exportSize = 400;
    const canvas = document.createElement('canvas');
    canvas.width = exportSize;
    canvas.height = exportSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      onCropComplete(imageUrl);
      onClose();
      return;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.save();
    // Center origin
    ctx.translate(exportSize / 2, exportSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const aspect = img.naturalWidth / img.naturalHeight;
    let drawW = exportSize;
    let drawH = exportSize;
    if (aspect > 1) {
      drawW = exportSize * aspect;
    } else {
      drawH = exportSize / aspect;
    }

    // Normalize crop frame (260px in view to 400px output)
    const viewSize = 260;
    const scaleFactor = exportSize / viewSize;
    const offsetX = (position.x * scaleFactor) / zoom;
    const offsetY = (position.y * scaleFactor) / zoom;

    ctx.drawImage(img, -drawW / 2 + offsetX, -drawH / 2 + offsetY, drawW, drawH);
    ctx.restore();

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onCropComplete(croppedDataUrl);
    onClose();
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 border border-slate-200">
        {/* Header do Modal */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-[#2E3192] flex items-center justify-center font-bold">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{titulo}</h3>
              <p className="text-[10px] text-slate-500">
                Arraste para posicionar e use os controles de zoom e rotação
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo: Área de Enquadramento Interativo */}
        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            {/* Viewport de Enquadramento */}
            <div 
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              className="relative w-[260px] h-[260px] rounded-2xl overflow-hidden bg-slate-900 cursor-grab active:cursor-grabbing select-none shadow-inner border border-slate-700 flex items-center justify-center"
            >
              {/* Imagem a ser manipulada */}
              {imageUrl && (
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Recorte de Usuário"
                  draggable={false}
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    maxWidth: 'none',
                    maxHeight: 'none',
                    userSelect: 'none'
                  }}
                  className="pointer-events-none origin-center"
                />
              )}

              {/* Máscara de Recorte com Guia Visual */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {shape === 'circle' ? (
                  <div className="w-[220px] h-[220px] rounded-full border-2 border-white/90 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] relative">
                    {/* Grade de Enquadramento */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
                      <div className="border-r border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-b border-white" />
                      <div className="border-r border-white" />
                      <div className="border-r border-white" />
                      <div />
                    </div>
                  </div>
                ) : (
                  <div className="w-[220px] h-[220px] rounded-2xl border-2 border-white/90 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] relative">
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30">
                      <div className="border-r border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-r border-b border-white" />
                      <div className="border-b border-white" />
                      <div className="border-r border-white" />
                      <div className="border-r border-white" />
                      <div />
                    </div>
                  </div>
                )}
              </div>

              {/* Dica de arraste */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 pointer-events-none font-medium">
                <Move className="w-2.5 h-2.5" />
                <span>Arraste para mover</span>
              </div>
            </div>

            {/* Painel Lateral: Miniatura de Resultado Final */}
            <div className="flex flex-col items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Pré-visualização
              </span>
              <canvas
                ref={previewCanvasRef}
                className="w-24 h-24 rounded-full border-2 border-indigo-500 shadow-md bg-white object-cover"
              />
              <div className="flex items-center gap-1 mt-1">
                <button
                  type="button"
                  onClick={() => setShape('circle')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                    shape === 'circle' ? 'bg-[#2E3192] text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  Circular
                </button>
                <button
                  type="button"
                  onClick={() => setShape('square')}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
                    shape === 'square' ? 'bg-[#2E3192] text-white' : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  Quadrado
                </button>
              </div>
            </div>
          </div>

          {/* Controles: Zoom Slider e Botões */}
          <div className="space-y-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom(prev => Math.max(0.6, +(prev - 0.15).toFixed(2)))}
                className="p-1 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0.6"
                max="3"
                step="0.05"
                value={zoom}
                onChange={e => setZoom(parseFloat(e.target.value))}
                className="w-full accent-[#2E3192] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoom(prev => Math.min(3, +(prev + 0.15).toFixed(2)))}
                className="p-1 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-slate-700 w-12 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Ações de Rotação e Reset */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Girar 90° ({rotation}°)</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCcw className="w-3 h-3 text-slate-400" />
                  <span>Recentralizar</span>
                </button>
              </div>

              <span className="text-[10px] text-slate-400 hidden sm:inline">
                Dimensões: {imageDimensions.width} × {imageDimensions.height}px
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé: Cancelar / Concluir */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-5 py-2 bg-[#2E3192] hover:bg-[#232675] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 text-[#F2EC00]" />
            <span>Aplicar Recorte & Inserir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
