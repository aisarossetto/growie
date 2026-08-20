import React, { useState } from 'react';
import { X, Mail, ShieldCheck, Key, CheckCircle2, Lock, ArrowRight, ExternalLink, Globe } from 'lucide-react';
import { User } from '../../types';

interface GmailOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onConnectSuccess: (connectedEmail: string, clientId?: string) => void;
}

export const GmailOAuthModal: React.FC<GmailOAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onConnectSuccess,
}) => {
  if (!isOpen) return null;

  const [inputEmail, setInputEmail] = useState(currentUser.email);
  const [googleClientId, setGoogleClientId] = useState(() => 
    localStorage.getItem('growie_google_calendar_client_id') || '483015174513-qod0itak9170ua6cjruesjvefhl9e6g1.apps.googleusercontent.com'
  );
  const [googleClientSecret, setGoogleClientSecret] = useState(() => 
    localStorage.getItem('growie_google_calendar_client_secret') || ''
  );
  const [step, setStep] = useState<'form' | 'authenticating' | 'success'>('form');

  const handleSimulateOAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim()) return;

    if (googleClientId) localStorage.setItem('growie_google_calendar_client_id', googleClientId.trim());
    if (googleClientSecret) localStorage.setItem('growie_google_calendar_client_secret', googleClientSecret.trim());

    setStep('authenticating');

    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onConnectSuccess(inputEmail.trim(), googleClientId);
        onClose();
        setStep('form');
      }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-gradient-dark-purple p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center justify-center font-bold">
              <Mail size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Conectar Conta Gmail / Google Workspace</h3>
              <p className="text-[11px] text-slate-300">Autenticação individual via Google OAuth 2.0</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {step === 'form' && (
            <form onSubmit={handleSimulateOAuth} className="space-y-4">
              {/* Google Security Badge */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 flex items-center gap-2 font-semibold">
                <ShieldCheck size={16} className="text-blue-600 shrink-0" />
                <span>
                  Cada usuário da equipe conecta a sua própria conta de e-mail do Google para sincronização individual da agenda.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Seu E-mail do Gmail ou Google Workspace *
                </label>
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="seuemail@gmail.com ou voce@empresa.com"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
                  required
                />
              </div>

              {/* Optional Cloud Credentials */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Key size={14} className="text-growie-purple" /> Configuração de API Google Cloud (Opcional)
                </h4>
                <p className="text-[10px] text-slate-500">
                  Insira o Client ID do seu projeto no Google Cloud Console se desejar conexão direta de API.
                </p>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Google OAuth Client ID</label>
                  <input
                    type="text"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder="9876543210-abc.apps.googleusercontent.com"
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Google OAuth Client Secret</label>
                  <input
                    type="password"
                    value={googleClientSecret}
                    onChange={(e) => setGoogleClientSecret(e.target.value)}
                    placeholder="GOCSPX-..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow flex items-center gap-1.5"
                >
                  Autorizar & Conectar Gmail <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {step === 'authenticating' && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto" />
              <h4 className="font-extrabold text-growie-dark text-sm">Autenticando via Google OAuth 2.0...</h4>
              <p className="text-slate-500 text-xs">Conectando com os servidores do Gmail para {inputEmail}</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 text-center space-y-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <CheckCircle2 size={32} className="text-emerald-600 mx-auto" />
              <h4 className="font-extrabold text-emerald-950 text-sm">Conta Gmail Conectada com Sucesso!</h4>
              <p className="text-emerald-700 text-xs font-mono font-bold">{inputEmail}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
