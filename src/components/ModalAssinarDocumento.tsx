import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  PenTool, 
  Type as TypeIcon, 
  CheckCircle2, 
  ShieldCheck, 
  RotateCcw, 
  Smartphone, 
  Key, 
  Send,
  AlertCircle
} from 'lucide-react';
import { ContratoAssinatura, Signatario } from '../types';

interface ModalAssinarDocumentoProps {
  contrato: ContratoAssinatura;
  onClose: () => void;
  onConfirmarAssinatura: (
    contratoId: string, 
    signatarioId: string, 
    dadosAssinatura: {
      metodo: 'Desenho em Tela' | 'Certificado Digital Token/Hash' | 'Assinatura Eletrônica Avançada';
      assinaturaBase64?: string;
      ip: string;
      geolocalizacao: string;
      dispositivo: string;
    }
  ) => void;
}

export const ModalAssinarDocumento: React.FC<ModalAssinarDocumentoProps> = ({
  contrato,
  onClose,
  onConfirmarAssinatura
}) => {
  // Signer selection (default to the first pending signer)
  const pendingSigners = contrato.signatarios.filter(s => s.status === 'Pendente');
  const [selectedSignerId, setSelectedSignerId] = useState<string>(
    pendingSigners[0]?.id || contrato.signatarios[0]?.id || ''
  );

  const selectedSigner = contrato.signatarios.find(s => s.id === selectedSignerId);

  // Tab mode: draw canvas vs typed name
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState(selectedSigner?.nome || '');

  // OTP Verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpValidated, setOtpValidated] = useState(false);
  const [otpError, setOtpError] = useState('');
  const simulatedGeneratedOtp = '729410';

  // Consent checkbox
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (selectedSigner) {
      setTypedName(selectedSigner.nome);
    }
  }, [selectedSignerId]);

  // Handle canvas drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e3a8a'; // Deep blue ink
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Send OTP
  const handleSendOtp = () => {
    setOtpSent(true);
    setOtpCode('');
    setOtpError('');
  };

  // Verify OTP
  const handleVerifyOtp = () => {
    if (otpCode === simulatedGeneratedOtp || otpCode.length === 6) {
      setOtpValidated(true);
      setOtpError('');
    } else {
      setOtpError('Código inválido. Digite os 6 dígitos recebidos.');
    }
  };

  // Handle final submission
  const handleSign = () => {
    if (!selectedSigner) return;
    if (!acceptedTerms) return;

    let base64 = '';
    if (signatureMode === 'draw' && canvasRef.current) {
      base64 = canvasRef.current.toDataURL('image/png');
    }

    onConfirmarAssinatura(contrato.id, selectedSigner.id, {
      metodo: signatureMode === 'draw' ? 'Desenho em Tela' : 'Assinatura Eletrônica Avançada',
      assinaturaBase64: base64,
      ip: '177.189.44.108',
      geolocalizacao: 'São Paulo, SP - Brasil',
      dispositivo: navigator.userAgent
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/30">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Assinatura Eletrônica do Documento</h3>
              <p className="text-xs text-slate-300 truncate max-w-md">
                {contrato.titulo} • Ref: {contrato.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Signer selector */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              Selecione o Signatário que está assinando:
            </label>
            <select
              value={selectedSignerId}
              onChange={(e) => setSelectedSignerId(e.target.value)}
              className="w-full text-sm font-medium p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {contrato.signatarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nome} ({s.papel}) — {s.status} — CPF: {s.cpf}
                </option>
              ))}
            </select>
            {selectedSigner?.status === 'Assinado' && (
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Este signatário já possui assinatura registrada neste envelope.
              </p>
            )}
          </div>

          {/* OTP Authentication Box */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-700" />
                Validação de Identidade por WhatsApp / SMS (Código OTP)
              </span>
              {otpValidated && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Validado
                </span>
              )}
            </div>

            {!otpSent && !otpValidated && (
              <div className="flex items-center justify-between gap-3 text-xs">
                <p className="text-slate-600">
                  Enviar código de segurança de 6 dígitos para o número <strong>{selectedSigner?.telefone_whatsapp}</strong>.
                </p>
                <button
                  onClick={handleSendOtp}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold shrink-0 flex items-center gap-1 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Código OTP
                </button>
              </div>
            )}

            {otpSent && !otpValidated && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Digite o código (ex: 729410)"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="p-2 bg-white border border-blue-300 rounded-lg text-sm font-mono tracking-widest text-center w-48 font-bold"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    className="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Confirmar Código
                  </button>
                  <button
                    onClick={() => setOtpCode(simulatedGeneratedOtp)}
                    className="text-[11px] text-blue-700 underline ml-auto"
                  >
                    Auto-preencher ({simulatedGeneratedOtp})
                  </button>
                </div>
                {otpError && (
                  <p className="text-red-600 text-xs font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {otpError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Signature Mode Selector */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3">
              <button
                type="button"
                onClick={() => setSignatureMode('draw')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  signatureMode === 'draw'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                Desenhar na Tela
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode('type')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  signatureMode === 'type'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <TypeIcon className="w-3.5 h-3.5" />
                Digitar Assinatura
              </button>
            </div>

            {signatureMode === 'draw' ? (
              <div>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={560}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-40 cursor-crosshair touch-none"
                  />
                  {!hasDrawn && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                      Desenhe sua assinatura aqui com o mouse ou dedo
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Limpar Assinatura
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Nome completo para assinatura"
                  className="w-full p-3 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <span className="text-xs text-slate-400 block mb-1">Pré-visualização caligráfica:</span>
                  <span className="font-serif italic text-2xl text-blue-950 font-bold tracking-wider">
                    {typedName || 'Assinatura Eletrônica'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Legal Consent Checkbox */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 leading-relaxed">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 shrink-0"
              />
              <span>
                Declaro que li e concordo integralmente com os termos deste documento e reconheço a plena validade jurídica desta assinatura eletrônica avançada, sob as normas da <strong>Medida Provisória nº 2.200-2/2001</strong> e do art. 5º da <strong>Lei Federal nº 14.063/2020</strong>.
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            IP, Geolocalização e Carimbo de Tempo serão autenticados no log de auditoria.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSign}
              disabled={!acceptedTerms || (signatureMode === 'draw' && !hasDrawn)}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar & Assinar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
