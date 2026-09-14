import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileCheck, 
  Clock, 
  MapPin, 
  Smartphone, 
  Copy, 
  Check, 
  Printer, 
  Download, 
  QrCode, 
  ExternalLink,
  Lock,
  UserCheck
} from 'lucide-react';
import { ContratoAssinatura } from '../types';

interface ModalVisualizarAuditoriaProps {
  contrato: ContratoAssinatura;
  onClose: () => void;
}

export const ModalVisualizarAuditoria: React.FC<ModalVisualizarAuditoriaProps> = ({
  contrato,
  onClose
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const copyToClipboard = (text: string, type: 'hash' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'hash') {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-300">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold tracking-tight">Dossiê Probatório & Log de Auditoria</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    MP 2.200-2/2001 & Lei 14.063/2020
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-0.5">
                  Certificado de Autenticidade, Rastreabilidade e Integridade Criptográfica do Documento
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Meta Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Identificador do Envelope</span>
              <span className="font-mono font-bold text-white text-sm">{contrato.id}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Status Atual</span>
              <span className={`inline-block font-semibold mt-0.5 ${
                contrato.status === 'Concluído' ? 'text-emerald-400' :
                contrato.status === 'Assinado Parcialmente' ? 'text-amber-400' :
                'text-blue-400'
              }`}>
                {contrato.status.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Provedor Homologado</span>
              <span className="text-slate-200 font-medium">{contrato.provedor_assinatura}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Token de Validação</span>
              <div className="flex items-center gap-1.5 font-mono text-amber-300">
                <span>{contrato.token_verificacao}</span>
                <button 
                  onClick={() => copyToClipboard(contrato.token_verificacao, 'token')}
                  className="hover:text-white"
                  title="Copiar token"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
          {/* Criptografia & Hashes */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              Integridade Criptográfica (SHA-256 Checksum)
            </h4>
            
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Hash SHA-256 do Documento Original (Minuta Gerada):</span>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-300 font-mono text-slate-700 break-all">
                  <span>{contrato.hash_sha256_original}</span>
                  <button 
                    onClick={() => copyToClipboard(contrato.hash_sha256_original, 'hash')}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 ml-auto"
                    title="Copiar Hash SHA-256"
                  >
                    {copiedHash ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {contrato.hash_sha256_assinado && (
                <div>
                  <span className="text-slate-500 font-medium block">Hash SHA-256 Selado Pós-Assinaturas:</span>
                  <div className="flex items-center gap-2 bg-emerald-50/70 p-2 rounded-lg border border-emerald-300 font-mono text-emerald-900 break-all">
                    <span>{contrato.hash_sha256_assinado}</span>
                    <span className="text-[10px] font-bold uppercase bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded ml-auto shrink-0">
                      Inviolável
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200">
              <span>Base Legal: <strong>{contrato.metadados_juridicos.base_legal}</strong></span>
              <span>Carimbo de Tempo: <strong>{contrato.metadados_juridicos.carimbo_tempo}</strong></span>
            </div>
          </div>

          {/* Signatários */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Quadro de Signatários & Evidências de Autenticação
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contrato.signatarios.map((sig) => (
                <div 
                  key={sig.id}
                  className={`p-4 rounded-xl border transition-all ${
                    sig.status === 'Assinado' 
                      ? 'bg-emerald-50/50 border-emerald-200' 
                      : 'bg-amber-50/40 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{sig.nome}</span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded-md">
                          {sig.papel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">CPF: {sig.cpf} • {sig.email}</p>
                      <p className="text-xs text-slate-500">WhatsApp: {sig.telefone_whatsapp}</p>
                    </div>

                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      sig.status === 'Assinado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sig.status === 'Assinado' ? 'Assinado' : 'Pendente'}
                    </span>
                  </div>

                  {sig.status === 'Assinado' && (
                    <div className="mt-3 pt-3 border-t border-emerald-200/70 text-xs space-y-1.5 text-slate-600">
                      <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Assinado em {new Date(sig.data_assinatura || '').toLocaleString('pt-BR')}</span>
                      </div>
                      {sig.metodo_assinatura && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Método:</span>
                          <span className="font-medium text-slate-700">{sig.metodo_assinatura}</span>
                        </div>
                      )}
                      {sig.ip_origem && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">IP de Conexão:</span>
                          <span className="font-mono text-slate-700">{sig.ip_origem}</span>
                        </div>
                      )}
                      {sig.geolocalizacao && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{sig.geolocalizacao}</span>
                        </div>
                      )}
                      {sig.dispositivo_user_agent && (
                        <div className="flex items-center gap-1.5 truncate" title={sig.dispositivo_user_agent}>
                          <Smartphone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-500">{sig.dispositivo_user_agent}</span>
                        </div>
                      )}
                      {sig.codigo_otp_validado && (
                        <div className="text-[11px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded font-medium inline-block mt-1">
                          Código OTP validado com sucesso via WhatsApp
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline de Auditoria */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Linha do Tempo de Rastreabilidade (Audit Trail Completo)
            </h4>

            <div className="relative border-l-2 border-slate-200 ml-4 pl-4 space-y-4">
              {contrato.audit_trail.map((evento, idx) => (
                <div key={evento.id || idx} className="relative">
                  {/* Dot */}
                  <div className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    idx === contrato.audit_trail.length - 1 && contrato.status === 'Concluído'
                      ? 'bg-emerald-600 ring-4 ring-emerald-100'
                      : 'bg-blue-600'
                  }`} />

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 text-sm">{evento.evento}</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(evento.data_hora).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    {evento.detalhes && (
                      <p className="text-xs text-slate-600 mt-1">
                        {evento.detalhes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span><strong>Autor:</strong> {evento.autor}</span>
                      <span><strong>IP:</strong> {evento.ip}</span>
                      <span><strong>Local:</strong> {evento.geolocalizacao}</span>
                      <span><strong>Dispositivo:</strong> {evento.dispositivo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <QrCode className="w-4 h-4 text-slate-600" />
            <span>Validação de conformidade disponível publicamente via Token <strong>{contrato.token_verificacao}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimir Dossiê
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
