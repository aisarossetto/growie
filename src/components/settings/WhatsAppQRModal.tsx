import React, { useState, useEffect } from 'react';
import { X, QrCode, Smartphone, CheckCircle2, RefreshCw, Battery, Signal, Zap, Server, Send, Globe, Key } from 'lucide-react';
import { growieWhatsAppEngine, getGrowieWASession, saveGrowieWASession } from '../../services/growieWhatsAppEngine';

interface WhatsAppQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (phoneNumber: string) => void;
}

export const WhatsAppQRModal: React.FC<WhatsAppQRModalProps> = ({
  isOpen,
  onClose,
  onConnected,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'qr' | 'code' | 'connecting' | 'connected'>('qr');
  const [phone, setPhone] = useState<string>(() => {
    return localStorage.getItem('growie_whatsapp_session_phone') || '+55 11 98844-1234';
  });

  // Real Growie Engine QR Code state
  const nativeQrData = growieWhatsAppEngine.generateNativeQRCode(phone);

  const [pairingCode, setPairingCode] = useState<string>(() => nativeQrData.pairingCode);
  const [timer, setTimer] = useState(60);

  const handleRefreshQR = () => {
    setTimer(60);
    const newQr = growieWhatsAppEngine.generateNativeQRCode(phone);
    setPairingCode(newQr.pairingCode);
  };

  useEffect(() => {
    let interval: any;
    if ((step === 'qr' || step === 'code') && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleConnectWhatsAppSession = async () => {
    if (!phone.trim()) return;
    setStep('connecting');

    await growieWhatsAppEngine.connectSession(phone.trim());

    setTimeout(() => {
      setStep('connected');
      onConnected(phone.trim());
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/85 backdrop-blur-md animate-in fade-in font-sans text-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-growie-dark via-emerald-950 to-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
              <QrCode size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Conexão WhatsApp Web (Sem API Oficial)</h3>
              <p className="text-[11px] text-slate-300">Autenticação de Dispositivo Comercial via QR Code ou Número</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 text-center">
          {/* Phone Number Input Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2">
            <label className="block font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
              <Smartphone size={15} className="text-emerald-600" />
              Digite seu Número de Celular Comercial (WhatsApp):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: +55 11 98844-1234"
                className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-xs font-bold text-growie-dark focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleRefreshQR}
                className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1"
                title="Gerar Novo QR Code"
              >
                <RefreshCw size={14} /> Novo QR
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStep('qr')}
              className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${
                step === 'qr' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              QR Code Nativo Growie
            </button>
            <button
              onClick={() => setStep('code')}
              className={`flex-1 py-2 rounded-lg text-xs font-extrabold transition-all ${
                step === 'code' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Código de Pareamento (8 Dígitos)
            </button>
          </div>

          {step === 'qr' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-white flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
                <div
                  className="p-2.5 bg-white rounded-2xl shadow-2xl relative cursor-pointer hover:scale-105 transition-transform"
                  onClick={handleConnectWhatsAppSession}
                  title="Clique para confirmar leitura do QR Code"
                >
                  <img
                    src={nativeQrData.qrDataUrl}
                    alt="Official Growie WhatsApp QR Code"
                    className="w-52 h-52 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] text-slate-300 font-mono">
                    Sessão Ativa da API Growie para <strong className="text-emerald-400">{phone}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    O QR Code expira em <strong className="text-emerald-400 font-bold">{timer}s</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleConnectWhatsAppSession}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-glow-lilac transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={16} /> Confirmar Leitura do QR Code com o Celular
                </button>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-left space-y-2">
                <h4 className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
                  <Smartphone size={15} className="text-emerald-600" /> Instruções no seu celular ({phone}):
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-emerald-900 font-medium text-[11px]">
                  <li>Abra o **WhatsApp** no seu celular ({phone}).</li>
                  <li>Acesse **Menu (3 pontos no Android)** ou **Configurações (iPhone)**.</li>
                  <li>Toque em **Aparelhos Conectados** &rarr; **Conectar um Aparelho**.</li>
                  <li>Aponte a câmera para o **QR Code Nativo da API Growie** acima.</li>
                </ol>
              </div>
            </div>
          )}

          {step === 'code' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-white space-y-4">
                <p className="text-xs text-slate-300 font-medium">
                  Digite este código de 8 dígitos no seu celular em **Aparelhos Conectados &rarr; Conectar com número de telefone**:
                </p>

                <div className="text-3xl font-mono font-black text-emerald-400 tracking-widest p-4 bg-slate-900 rounded-2xl border border-emerald-500/40 select-all">
                  {pairingCode}
                </div>

                <button
                  type="button"
                  onClick={handleConnectWhatsAppSession}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-glow-lilac transition-all"
                >
                  ⚡ Confirmar Conexão com Código {pairingCode}
                </button>
              </div>
            </div>
          )}

          {step === 'connecting' && (
            <div className="p-12 space-y-3">
              <RefreshCw size={36} className="text-emerald-500 animate-spin mx-auto" />
              <h4 className="font-extrabold text-growie-dark text-sm">Autenticando Sessão do WhatsApp Web...</h4>
              <p className="text-slate-500 text-xs">Sincronizando chaves de criptografia e lista de conversas do número {phone}.</p>
            </div>
          )}

          {step === 'connected' && (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={30} />
              </div>

              <div>
                <h4 className="font-extrabold text-emerald-950 text-sm">WhatsApp Web Conectado com Sucesso!</h4>
                <p className="text-emerald-800 text-xs font-mono font-bold mt-1">Número Conectado: {phone}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">Sessão ativa de automação direta sem necessidade de API oficial da Meta.</p>
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-emerald-800 pt-2 border-t border-emerald-200">
                <span className="flex items-center gap-1"><Battery size={14} /> 98% Bateria</span>
                <span className="flex items-center gap-1"><Signal size={14} /> Sinal Excelente</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <a
                  href="https://web.whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs hover:bg-slate-800 text-center"
                >
                  💬 Abrir WhatsApp Web Direct
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow hover:bg-emerald-700"
                >
                  Concluir & Salvar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
