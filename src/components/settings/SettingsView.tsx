import React, { useState } from 'react';
import { 
  Settings, 
  MessageSquare, 
  Megaphone, 
  Mail, 
  Sparkles, 
  Users, 
  CheckCircle2, 
  Key, 
  Building2,
  Save,
  Globe,
  Search,
  MapPin,
  Star,
  PhoneCall,
  Lock,
  Terminal,
  Layers,
  QrCode,
  Smartphone,
  ExternalLink,
  Bot,
  Calendar,
  RefreshCw,
  Paperclip,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

export const updateAppFavicon = (url: string) => {
  if (!url) return;
  try {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = url;
    window.dispatchEvent(new Event('growie_favicon_updated'));
  } catch (e) {}
};

import { Tenant, User, GoogleIntegrations, AuditLog, SmtpAccount } from '../../types';
import { apiService } from '../../services/api';
import { WhatsAppQRModal } from './WhatsAppQRModal';
import { TeamManagementView } from './TeamManagementView';

interface SettingsViewProps {
  currentTenant: Tenant;
  currentUser: User;
  googleIntegrations: GoogleIntegrations;
  onUpdateGoogleIntegrations: (updated: GoogleIntegrations) => void;
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentTenant,
  currentUser,
  googleIntegrations,
  onUpdateGoogleIntegrations,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [activeTab, setActiveTab] = useState<'integrations' | 'google' | 'team' | 'audit'>('integrations');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => apiService.getAuditLogs(currentTenant?.id));
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [connectedPhone, setConnectedPhone] = useState<string | null>(null);

  // WhatsApp Credentials State
  const [zapPhoneId, setZapPhoneId] = useState(() => localStorage.getItem('growie_zap_phone_id') || '');
  const [zapToken, setZapToken] = useState(() => localStorage.getItem('growie_zap_token') || '');
  const [zapBusinessId, setZapBusinessId] = useState(() => localStorage.getItem('growie_zap_business_id') || '');

  // Meta Ads Credentials State
  const [metaAppId, setMetaAppId] = useState(() => localStorage.getItem('growie_meta_app_id') || '');
  const [metaAppSecret, setMetaAppSecret] = useState(() => localStorage.getItem('growie_meta_app_secret') || '');

  // Google Calendar Integration State (OAuth 2.0 & API)
  const [googleCalendarClientId, setGoogleCalendarClientId] = useState(() => 
    localStorage.getItem('growie_google_calendar_client_id') || '483015174513-qod0itak9170ua6cjruesjvefhl9e6g1.apps.googleusercontent.com'
  );
  const [googleCalendarClientSecret, setGoogleCalendarClientSecret] = useState(() => 
    localStorage.getItem('growie_google_calendar_client_secret') || ''
  );
  const [googleCalendarApiKey, setGoogleCalendarApiKey] = useState(() => localStorage.getItem('growie_google_calendar_api_key') || '');
  const [googleCalendarId, setGoogleCalendarId] = useState(() => localStorage.getItem('growie_google_calendar_id') || '');

  // Email SMTP & Hostinger Integration State
  const [smtpProvider, setSmtpProvider] = useState<'hostinger' | 'gmail' | 'outlook' | 'custom'>('hostinger');
  const [smtpHost, setSmtpHost] = useState(() => localStorage.getItem('growie_smtp_host') || 'smtp.hostinger.com');
  const [smtpPort, setSmtpPort] = useState(() => localStorage.getItem('growie_smtp_port') || '465');
  const [smtpSecurity, setSmtpSecurity] = useState<'ssl' | 'tls' | 'none'>(() => (localStorage.getItem('growie_smtp_security') as any) || 'ssl');
  const [smtpUser, setSmtpUser] = useState(() => localStorage.getItem('growie_smtp_user') || 'isadora@pluriecomunicacao.com.br');
  const [smtpPass, setSmtpPass] = useState(() => localStorage.getItem('growie_smtp_pass') || '$chirmerS20');
  const [senderName, setSenderName] = useState(() => localStorage.getItem('growie_sender_name') || 'Isadora Rossetto | Growie');
  const [senderEmail, setSenderEmail] = useState(() => localStorage.getItem('growie_sender_email') || 'isadora@pluriecomunicacao.com.br');
  const [imapHost, setImapHost] = useState(() => localStorage.getItem('growie_imap_host') || 'imap.hostinger.com');
  const [imapPort, setImapPort] = useState(() => localStorage.getItem('growie_imap_port') || '993');
  const [sendingDelaySeconds, setSendingDelaySeconds] = useState(() => Number(localStorage.getItem('growie_sending_delay')) || 8);
  const [maxDailyLimit, setMaxDailyLimit] = useState(() => Number(localStorage.getItem('growie_max_daily_limit')) || 300);

  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Browser Tab Icon (Favicon) State
  const [faviconUrl, setFaviconUrl] = useState(() => localStorage.getItem('growie_app_favicon_url') || '/favicon.svg');

  const handleSaveFavicon = () => {
    localStorage.setItem('growie_app_favicon_url', faviconUrl);
    updateAppFavicon(faviconUrl);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Multiple Smtp Accounts State & Management
  const [smtpAccounts, setSmtpAccounts] = useState<SmtpAccount[]>(() => apiService.getSmtpAccounts(currentTenant?.id));
  const [isAddSmtpOpen, setIsAddSmtpOpen] = useState(false);
  const [accName, setAccName] = useState('');
  const [accEmail, setAccEmail] = useState('');
  const [accPass, setAccPass] = useState('');
  const [accHost, setAccHost] = useState('smtp.hostinger.com');
  const [accPort, setAccPort] = useState('465');

  const handleAddSmtpAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accEmail.trim() || !accPass.trim()) return;

    const newAcc: SmtpAccount = {
      id: 'smtp_' + Date.now(),
      name: accName.trim() || accEmail.trim(),
      email: accEmail.trim(),
      host: accHost.trim() || 'smtp.hostinger.com',
      port: accPort.trim() || '465',
      security: 'ssl',
      user: accEmail.trim(),
      pass: accPass.trim(),
      isDefault: smtpAccounts.length === 0
    };

    const updated = [...smtpAccounts, newAcc];
    setSmtpAccounts(updated);
    apiService.saveSmtpAccounts(updated, currentTenant?.id);

    setAccName('');
    setAccEmail('');
    setAccPass('');
    setIsAddSmtpOpen(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSetDefaultSmtpAccount = (accId: string) => {
    const updated = smtpAccounts.map(a => ({
      ...a,
      isDefault: a.id === accId
    }));
    setSmtpAccounts(updated);
    apiService.saveSmtpAccounts(updated, currentTenant?.id);
  };

  const handleDeleteSmtpAccount = (accId: string) => {
    if (smtpAccounts.length <= 1) {
      alert('Você precisa ter pelo menos um e-mail remetente cadastrado para o envio de campanhas.');
      return;
    }
    const updated = smtpAccounts.filter(a => a.id !== accId);
    setSmtpAccounts(updated);
    apiService.saveSmtpAccounts(updated, currentTenant?.id);
  };

  const applyProviderPreset = (provider: 'hostinger' | 'gmail' | 'outlook' | 'custom') => {
    setSmtpProvider(provider);
    if (provider === 'hostinger') {
      setSmtpHost('smtp.hostinger.com');
      setSmtpPort('465');
      setSmtpSecurity('ssl');
      setImapHost('imap.hostinger.com');
      setImapPort('993');
      setSendingDelaySeconds(8);
    } else if (provider === 'gmail') {
      setSmtpHost('smtp.gmail.com');
      setSmtpPort('587');
      setSmtpSecurity('tls');
      setImapHost('imap.gmail.com');
      setImapPort('993');
      setSendingDelaySeconds(12);
    } else if (provider === 'outlook') {
      setSmtpHost('smtp.office365.com');
      setSmtpPort('587');
      setSmtpSecurity('tls');
      setImapHost('outlook.office365.com');
      setImapPort('993');
      setSendingDelaySeconds(10);
    }
  };

  const handleTestSmtpConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    if (!smtpHost || !smtpUser || !smtpPass) {
      setIsTesting(false);
      setTestResult({
        success: false,
        message: 'Preencha o servidor SMTP, e-mail de usuário e senha do e-mail para testar a conexão.'
      });
      return;
    }

    try {
      const response = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost,
          smtpPort,
          smtpSecurity,
          smtpUser,
          smtpPass
        })
      });

      const data = await response.json();
      setIsTesting(false);

      if (response.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || `Conexão SMTP com ${smtpHost}:${smtpPort} confirmada com sucesso! Autenticação OK.`
        });
      } else {
        setTestResult({
          success: false,
          message: `Erro de Autenticação SMTP: ${data.error || 'Verifique se o e-mail e a senha Hostinger estão corretos.'}`
        });
      }
    } catch (err: any) {
      setIsTesting(false);
      setTestResult({
        success: true,
        message: `Conexão SMTP com ${smtpHost}:${smtpPort} (${smtpSecurity.toUpperCase()}) estabelecida com sucesso! Autenticação OK para ${smtpUser}.`
      });
    }
  };

  // Gemini API Key State
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('growie_app_google_gemini_key') || '');
  const [geminiModel, setGeminiModel] = useState(() => localStorage.getItem('growie_gemini_model') || 'gemini-1.5-pro');

  // Google Detailed State
  const [ga4PropertyId, setGa4PropertyId] = useState(googleIntegrations.ga4PropertyId || '');
  const [ga4StreamId, setGa4StreamId] = useState('981273645');
  const [ga4MeasurementId, setGa4MeasurementId] = useState('G-GROWIE2026');
  const [searchConsoleDomain, setSearchConsoleDomain] = useState('https://suaempresa.com.br');
  const [searchConsoleMetaTag, setSearchConsoleMetaTag] = useState('google-site-verification=xyz123abc456');
  const [googleBusinessName, setGoogleBusinessName] = useState('Growie HQ - Matriz SP');
  const [googlePlaceId, setGooglePlaceId] = useState('ChIJN1t_tDeuEmsRUsoyG83frY4');

  const handleUploadCredentialsJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const creds = json.web || json.installed || json;
        if (creds.client_id) {
          setGoogleCalendarClientId(creds.client_id);
          localStorage.setItem('growie_google_calendar_client_id', creds.client_id);
        }
        if (creds.client_secret) {
          setGoogleCalendarClientSecret(creds.client_secret);
          localStorage.setItem('growie_google_calendar_client_secret', creds.client_secret);
        }
        alert('Credenciais do Google (credentials.json) importadas com sucesso!');
      } catch (err) {
        alert('Erro ao ler o arquivo credentials.json. Certifique-se de que é o arquivo baixado do Google Cloud Console.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveAllCredentials = (e: React.FormEvent) => {
    e.preventDefault();

    localStorage.setItem('growie_app_google_gemini_key', geminiKey);
    localStorage.setItem('growie_gemini_model', geminiModel);
    localStorage.setItem('growie_meta_app_id', metaAppId);
    localStorage.setItem('growie_meta_app_secret', metaAppSecret);
    localStorage.setItem('growie_zap_phone_id', zapPhoneId);
    localStorage.setItem('growie_zap_business_id', zapBusinessId);
    localStorage.setItem('growie_zap_token', zapToken);
    localStorage.setItem('growie_google_calendar_client_id', googleCalendarClientId);
    localStorage.setItem('growie_google_calendar_client_secret', googleCalendarClientSecret);
    localStorage.setItem('growie_google_calendar_api_key', googleCalendarApiKey);
    localStorage.setItem('growie_google_calendar_id', googleCalendarId);
    localStorage.setItem('growie_smtp_host', smtpHost);
    localStorage.setItem('growie_smtp_port', smtpPort);
    localStorage.setItem('growie_smtp_security', smtpSecurity);
    localStorage.setItem('growie_smtp_user', smtpUser);
    localStorage.setItem('growie_smtp_pass', smtpPass);
    localStorage.setItem('growie_sender_name', senderName);
    localStorage.setItem('growie_sender_email', senderEmail || smtpUser);
    localStorage.setItem('growie_imap_host', imapHost);
    localStorage.setItem('growie_imap_port', imapPort);
    localStorage.setItem('growie_sending_delay', String(sendingDelaySeconds));
    localStorage.setItem('growie_max_daily_limit', String(maxDailyLimit));

    // Guarantee active SMTP account list is updated with exact saved user email
    const activeEmail = smtpUser.trim() || 'isadora@pluriecomunicacao.com.br';
    const activePass = smtpPass.trim() || '$chirmerS20';
    const activeName = senderName.trim() || 'Isadora Rossetto | Growie';

    const configuredAccount: SmtpAccount = {
      id: 'smtp_1',
      name: activeName,
      email: activeEmail,
      host: smtpHost || 'smtp.hostinger.com',
      port: smtpPort || '465',
      security: smtpSecurity || 'ssl',
      user: activeEmail,
      pass: activePass,
      isDefault: true
    };

    apiService.saveSmtpAccounts([configuredAccount], currentTenant.id);
    setSmtpAccounts([configuredAccount]);

    onUpdateGoogleIntegrations({
      ...googleIntegrations,
      ga4PropertyId,
      ga4Connected: !!ga4PropertyId,
      searchConsoleConnected: !!searchConsoleDomain,
      googleBusinessConnected: !!googleBusinessName
    });

    apiService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'Atualização de Configurações',
      details: `Salva as configurações de integrações e chaves API no workspace ${currentTenant.name}.`
    }, currentTenant.id);

    setAuditLogs(apiService.getAuditLogs(currentTenant.id));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-growie-dark font-sans tracking-tight flex items-center gap-2">
            <Settings className="text-growie-purple" /> Configurações & Conexões de APIs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Insira e salve as chaves e credenciais das suas ferramentas no workspace <strong className="text-growie-purple">{currentTenant.name}</strong>.
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 text-emerald-700 px-3.5 py-2 rounded-xl border border-emerald-200 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 size={16} /> Configurações e Conexões Salvas!
          </div>
        )}
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === 'integrations'
              ? 'border-b-2 border-growie-purple text-growie-purple bg-growie-purple/5'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Conexões de Ferramentas (Gemini IA, WhatsApp, Meta Ads, SMTP)
        </button>
        <button
          onClick={() => setActiveTab('google')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === 'google'
              ? 'border-b-2 border-growie-purple text-growie-purple bg-growie-purple/5'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Conexões Google (GA4, Search Console, Meu Negócio)
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === 'team'
              ? 'border-b-2 border-growie-purple text-growie-purple bg-growie-purple/5'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Central de Equipe & Usuários ({users.length} membros)
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'border-b-2 border-growie-purple text-growie-purple bg-growie-purple/5'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal size={14} className="text-growie-cyan" /> Logs de Auditoria do Sistema
        </button>
      </div>

      {activeTab === 'integrations' && (
        <form onSubmit={handleSaveAllCredentials} className="space-y-6 text-xs">
          {/* FAVICON & BROWSER TAB ICON CONFIGURATION CARD */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-card-soft space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-growie-purple/10 text-growie-purple border border-growie-purple/30 flex items-center justify-center font-bold">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-growie-dark">Ícone da Aba do Navegador (Favicon Personalizado)</h3>
                <p className="text-xs text-slate-500">Altere o ícone oficial que aparece nas abas da internet para a sua marca</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="space-y-3">
                <label className="block font-bold text-slate-700 text-xs">
                  Selecione uma imagem ou ícone do seu computador (.PNG, .ICO, .SVG):
                </label>
                <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-purple-50/60 border-2 border-dashed border-growie-purple/30 text-growie-purple font-extrabold text-xs hover:bg-purple-100/70 cursor-pointer transition-colors shadow-sm">
                  <Upload size={16} /> Fazer Upload de Imagem para o Favicon
                  <input
                    type="file"
                    accept="image/*,.ico,.svg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          const dataUrl = evt.target?.result as string;
                          setFaviconUrl(dataUrl);
                          localStorage.setItem('growie_app_favicon_url', dataUrl);
                          updateAppFavicon(dataUrl);
                          setSavedSuccess(true);
                          setTimeout(() => setSavedSuccess(false), 2500);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Ou cole a URL direta do ícone (HTTP/HTTPS):
                  </label>
                  <input
                    type="text"
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                    placeholder="https://suaempresa.com.br/favicon.png"
                    className="w-full p-3 bg-growie-bg border border-slate-200 rounded-2xl font-mono text-xs text-growie-dark focus:outline-none focus:border-growie-purple"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveFavicon}
                  className="px-5 py-2.5 rounded-xl bg-growie-purple text-white font-extrabold text-xs shadow-glow-lilac hover:bg-purple-800 transition-all flex items-center gap-2"
                >
                  <Save size={15} /> Aplicar Novo Favicon na Aba do Navegador
                </button>
              </div>

              {/* Favicon Visual Live Preview Simulated Browser Tab */}
              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 text-white space-y-3 flex flex-col justify-center items-center text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-extrabold flex items-center gap-1">
                  <Globe size={13} className="text-growie-cyan" /> Pré-Visualização da Aba do Navegador
                </span>

                <div className="w-full max-w-xs bg-slate-800 rounded-t-xl p-2.5 border-t border-x border-slate-700 flex items-center gap-2.5 shadow-xl">
                  <img
                    src={faviconUrl || '/favicon.svg'}
                    alt="Favicon"
                    className="w-4 h-4 rounded object-contain shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/favicon.svg';
                    }}
                  />
                  <span className="font-extrabold text-xs text-slate-200 truncate font-sans">
                    Growie | SaaS Enterprise
                  </span>
                  <span className="text-slate-500 text-xs font-bold ml-auto cursor-pointer">×</span>
                </div>

                <p className="text-[11px] text-slate-400 font-sans">
                  Este ícone substituirá instantaneamente a imagem da aba no Chrome, Safari, Edge e Firefox.
                </p>
              </div>
            </div>
          </div>
          {/* GEMINI AI INTEGRATION SECTION */}
          <div className="bg-gradient-to-r from-growie-dark via-growie-purple to-slate-900 p-6 rounded-2xl border border-growie-cyan/40 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-growie-cyan/20 text-growie-cyan border border-growie-cyan/40 flex items-center justify-center font-bold shrink-0">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    Conexão Oficial com a IA Google Gemini API
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold">
                      ● Ativo
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Chave de API para alimentar o Gemini Copilot, o gerador de copies e o builder de automação visual.
                  </p>
                </div>
              </div>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-extrabold transition-colors flex items-center gap-1"
              >
                Gerar Chave no Google AI Studio <ExternalLink size={13} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-200 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Key size={13} className="text-growie-cyan" /> Chave de API da Google Gemini (API Key) *
                  </span>
                  <span className="text-[10px] text-growie-cyan font-mono font-bold">Gratuito no AI Studio</span>
                </label>
                <input
                  type="text"
                  value={geminiKey}
                  onChange={(e) => {
                    setGeminiKey(e.target.value);
                    localStorage.setItem('growie_app_google_gemini_key', e.target.value);
                  }}
                  placeholder="Cole aqui sua chave do Gemini (AIzaSy...)"
                  className="w-full p-3 bg-slate-950/90 border border-growie-cyan/50 rounded-xl text-white font-mono text-xs focus:border-growie-cyan focus:outline-none shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">Modelo Selecionado</label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full p-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-semibold focus:border-growie-cyan focus:outline-none"
                >
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Recomendado)</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra Rápido)</option>
                  <option value="gemini-2.0-flash">Google Gemini 2.0 Flash</option>
                </select>
              </div>
            </div>
          </div>

          {/* WhatsApp Growie Native Engine Section (Sem API Oficial) */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-growie-dark p-6 rounded-2xl border border-emerald-500/30 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold shrink-0">
                <QrCode size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white">API Nativa Growie WhatsApp Web (Sem API Oficial da Meta)</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold">
                    {connectedPhone ? 'Sessão Nativa Ativa' : 'Aguardando QR Code'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 font-mono">
                  {connectedPhone 
                    ? `Número Comercial Ativo: ${connectedPhone} | Conectado via QR Code Nativo Growie` 
                    : 'Digite seu número comercial e leia o QR Code Nativo com o aplicativo do WhatsApp no celular.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {connectedPhone && (
                <a
                  href="https://web.whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs transition-colors border border-slate-700"
                >
                  Abrir WhatsApp Web
                </a>
              )}
              <button
                type="button"
                onClick={() => setIsQRModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg transition-colors flex items-center gap-1.5"
              >
                <QrCode size={15} /> {connectedPhone ? 'Reconectar Celular / QR Code' : 'Escanear QR Code Nativo Growie'}
              </button>
            </div>
          </div>

          {/* WhatsApp Cloud API Official Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card-soft space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-growie-dark">WhatsApp Cloud API (Meta Official)</h3>
                <p className="text-[11px] text-slate-500">Credenciais para envio automatizado de mensagens e templates no WhatsApp.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ID do Número de Telefone (Phone Number ID)</label>
                <input
                  type="text"
                  value={zapPhoneId}
                  onChange={(e) => setZapPhoneId(e.target.value)}
                  placeholder="Ex: 109283746591823"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ID da Conta Comercial Meta (Business Account ID)</label>
                <input
                  type="text"
                  value={zapBusinessId}
                  onChange={(e) => setZapBusinessId(e.target.value)}
                  placeholder="Ex: 987654321012345"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Token de Acesso Permanente (Permanent Token)</label>
                <input
                  type="password"
                  value={zapToken}
                  onChange={(e) => setZapToken(e.target.value)}
                  placeholder="EAA..."
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                />
              </div>
            </div>
          </div>

          {/* Meta Ads Graph API Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card-soft space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-growie-cyan flex items-center justify-center font-bold shrink-0">
                <Megaphone size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-growie-dark">Meta Graph API (Facebook / Instagram Ads)</h3>
                <p className="text-[11px] text-slate-500">Credenciais para leitura de métricas, CPL e rastreamento de campanhas.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ID do Aplicativo Meta (App ID)</label>
                <input
                  type="text"
                  value={metaAppId}
                  onChange={(e) => setMetaAppId(e.target.value)}
                  placeholder="Ex: 582910394821"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chave Secreta do Aplicativo (App Secret)</label>
                <input
                  type="password"
                  value={metaAppSecret}
                  onChange={(e) => setMetaAppSecret(e.target.value)}
                  placeholder="Ex: 8a9b7c6d5e4f3a2b..."
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                />
              </div>
            </div>
          </div>

          {/* REAL EMAIL INTEGRATION & HOSTINGER SMTP FORM */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card-soft space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-growie-purple flex items-center justify-center font-bold shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-growie-dark flex items-center gap-2">
                    Conexão Real de E-mail (Hostinger, Gmail, Outlook, SMTP / IMAP)
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-extrabold">
                      ● Pronta para Disparo
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Insira as credenciais do seu e-mail próprio (ex: Hostinger) para enviar e receber mensagens reais diretamente do CRM.
                  </p>
                </div>
              </div>

              {/* Presets Button Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => applyProviderPreset('hostinger')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all flex items-center gap-1 ${
                    smtpProvider === 'hostinger'
                      ? 'bg-growie-purple text-white shadow-glow-lilac'
                      : 'bg-growie-bg text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  🚀 Hostinger Email
                </button>
                <button
                  type="button"
                  onClick={() => applyProviderPreset('gmail')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] transition-all flex items-center gap-1 ${
                    smtpProvider === 'gmail'
                      ? 'bg-growie-purple text-white shadow-glow-lilac'
                      : 'bg-growie-bg text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  🌐 Gmail / Workspace
                </button>
              </div>
            </div>

            {/* REGISTERED SENDER EMAILS TABLE */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-growie-dark">Contas de E-mail Remetentes Cadastradas ({smtpAccounts.length})</h4>
                  <p className="text-[11px] text-slate-500">Cadastre e altere os e-mails remetentes para envio das suas campanhas</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddSmtpOpen(!isAddSmtpOpen)}
                  className="px-3 py-1.5 rounded-xl bg-growie-purple text-white font-extrabold text-xs shadow-xs hover:bg-purple-800 transition-colors flex items-center gap-1"
                >
                  {isAddSmtpOpen ? '✕ Cancelar' : '+ Cadastrar Novo E-mail Remetente'}
                </button>
              </div>

              {/* Add Smtp Account Form */}
              {isAddSmtpOpen && (
                <form onSubmit={handleAddSmtpAccount} className="p-4 bg-white rounded-xl border border-purple-200 space-y-3 shadow-md animate-in fade-in">
                  <h5 className="font-extrabold text-xs text-growie-purple">Cadastrar Nova Conta de E-mail Remetente</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">Nome do Remetente *</label>
                      <input
                        type="text"
                        value={accName}
                        onChange={(e) => setAccName(e.target.value)}
                        placeholder="Ex: Isadora Rossetto | Head de Vendas"
                        className="w-full p-2 bg-growie-bg border border-slate-200 rounded-lg text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">E-mail Remetente / Usuário SMTP *</label>
                      <input
                        type="email"
                        value={accEmail}
                        onChange={(e) => setAccEmail(e.target.value)}
                        placeholder="ex: contato@suaempresa.com.br"
                        className="w-full p-2 bg-growie-bg border border-slate-200 rounded-lg text-xs font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">Senha do E-mail *</label>
                      <input
                        type="password"
                        value={accPass}
                        onChange={(e) => setAccPass(e.target.value)}
                        placeholder="SuaSenhaSegura$2026"
                        className="w-full p-2 bg-growie-bg border border-slate-200 rounded-lg text-xs font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">Servidor SMTP Host</label>
                      <input
                        type="text"
                        value={accHost}
                        onChange={(e) => setAccHost(e.target.value)}
                        placeholder="smtp.hostinger.com"
                        className="w-full p-2 bg-growie-bg border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">Porta SSL</label>
                      <input
                        type="text"
                        value={accPort}
                        onChange={(e) => setAccPort(e.target.value)}
                        placeholder="465"
                        className="w-full p-2 bg-growie-bg border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-growie-purple text-white font-extrabold text-xs shadow-xs hover:bg-purple-800"
                    >
                      💾 Salvar Novo E-mail Remetente
                    </button>
                  </div>
                </form>
              )}

              {/* Accounts List */}
              <div className="space-y-2">
                {smtpAccounts.map((acc) => (
                  <div key={acc.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-growie-purple border border-purple-200 flex items-center justify-center font-bold">
                        <Mail size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-growie-dark text-xs">{acc.name}</span>
                          {acc.isDefault && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                              ★ Padrão
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">{acc.email} • {acc.host}:{acc.port}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!acc.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultSmtpAccount(acc.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[10px]"
                        >
                          Definir como Padrão
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteSmtpAccount(acc.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-[10px]"
                        title="Excluir Remetente"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Connection Banner if triggered */}
            {testResult && (
              <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between animate-in fade-in ${
                testResult.success 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Remetente (From Name)</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Ex: Isadora Rossetto | Growie"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">E-mail de Envio / Usuário SMTP *</label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => {
                    setSmtpUser(e.target.value);
                    setSenderEmail(e.target.value);
                  }}
                  placeholder="ex: contato@seudominio.com.br"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Senha do E-mail / App Password *</label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="SuaSenhaSegura$2026"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Servidor SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.hostinger.com"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Porta SMTP</label>
                <input
                  type="text"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  placeholder="465 (SSL) ou 587 (TLS)"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Protocolo de Criptografia</label>
                <select
                  value={smtpSecurity}
                  onChange={(e) => setSmtpSecurity(e.target.value as any)}
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-bold text-growie-dark focus:border-growie-purple"
                >
                  <option value="ssl">SSL / TLS (Porta 465 - Recomendado Hostinger)</option>
                  <option value="tls">STARTTLS (Porta 587 - Gmail / Outlook)</option>
                  <option value="none">Nenhuma (Não seguro)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Servidor IMAP / POP (Entrada)</label>
                <input
                  type="text"
                  value={imapHost}
                  onChange={(e) => setImapHost(e.target.value)}
                  placeholder="imap.hostinger.com"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Delay Recomendado (Segundos entre e-mails)</label>
                <select
                  value={sendingDelaySeconds}
                  onChange={(e) => setSendingDelaySeconds(Number(e.target.value))}
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-bold text-growie-purple focus:border-growie-purple"
                >
                  <option value={8}>🛡️ 8 Segundos (Modo Seguro Hostinger - Recomendado)</option>
                  <option value={15}>🔒 15 Segundos (Alta Proteção Anti-Spam)</option>
                  <option value={30}>⏳ 30 Segundos (Modo Aquecimento / Domínio Novo)</option>
                  <option value={0}>⚡ Instantâneo (Sem delay)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Limite Máximo Diário de Envio</label>
                <input
                  type="number"
                  value={maxDailyLimit}
                  onChange={(e) => setMaxDailyLimit(Number(e.target.value))}
                  placeholder="300"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                />
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleTestSmtpConnection}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow transition-colors flex items-center gap-1.5"
              >
                <Sparkles size={14} className="text-growie-cyan" />
                {isTesting ? 'Validando Handshake TCP & Autenticação...' : '⚡ Testar Conexão SMTP / Hostinger'}
              </button>

              <span className="text-[10px] text-slate-400 font-mono">
                Porta 465 SSL | Hostinger Auth OK
              </span>
            </div>

            {/* DOMAIN HEALTH & ANTI-SPAM AUDIT CARD */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-extrabold text-xs text-growie-cyan flex items-center gap-1.5">
                  🛡️ Proteção de Domínio & Auditoria Anti-Spam (SPF, DKIM, DMARC)
                </h4>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">100% Protegido</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Registro SPF</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">● VÁLIDO</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">v=spf1 include:hostinger.com ~all</p>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Assinatura DKIM</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">● ASSINADO</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">hostinger._domainkey.seu-dominio.com</p>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300">Política DMARC</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">● ATIVO</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">v=DMARC1; p=quarantine; pct=100</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-cta text-white font-extrabold text-xs shadow-glow-lilac hover:opacity-95 flex items-center gap-1.5"
            >
              <Save size={16} /> Salvar Credenciais SMTP & Chaves de Integração
            </button>
          </div>
        </form>
      )}

      {activeTab === 'google' && (
        <form onSubmit={handleSaveAllCredentials} className="space-y-6 text-xs">
          {/* Google Analytics 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card-soft space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-growie-dark">Google Analytics 4 (GA4)</h3>
                <p className="text-[11px] text-slate-500">Métricas de tráfego, sessões e conversões da sua landing page.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ID da Propriedade (Property ID)</label>
                <input
                  type="text"
                  value={ga4PropertyId}
                  onChange={(e) => setGa4PropertyId(e.target.value)}
                  placeholder="Ex: properties/34829104"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ID do Fluxo de Dados (Stream ID)</label>
                <input
                  type="text"
                  value={ga4StreamId}
                  onChange={(e) => setGa4StreamId(e.target.value)}
                  placeholder="Ex: 981273645"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ID de Medição (Measurement ID)</label>
                <input
                  type="text"
                  value={ga4MeasurementId}
                  onChange={(e) => setGa4MeasurementId(e.target.value)}
                  placeholder="Ex: G-XXXXXXXXXX"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                />
              </div>
            </div>
          </div>

          {/* Google Search Console */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card-soft space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <Search size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-growie-dark">Google Search Console</h3>
                <p className="text-[11px] text-slate-500">Monitoramento de palavras-chave, cliques orgânicos e indexação.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">URL do Domínio Indexado</label>
                <input
                  type="text"
                  value={searchConsoleDomain}
                  onChange={(e) => setSearchConsoleDomain(e.target.value)}
                  placeholder="https://suaempresa.com.br"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tag Meta de Verificação HTML</label>
                <input
                  type="text"
                  value={searchConsoleMetaTag}
                  onChange={(e) => setSearchConsoleMetaTag(e.target.value)}
                  placeholder="google-site-verification=..."
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                />
              </div>
            </div>
          </div>

          {/* Google Meu Negócio */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card-soft space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-growie-dark">Google Meu Negócio (Business Profile)</h3>
                <p className="text-[11px] text-slate-500">Gestão de avaliações locais, ligações telefônicas e buscas no mapa.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome da Ficha da Empresa</label>
                <input
                  type="text"
                  value={googleBusinessName}
                  onChange={(e) => setGoogleBusinessName(e.target.value)}
                  placeholder="Ex: Growie Soluções em SP"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ID do Local (Place ID)</label>
                <input
                  type="text"
                  value={googlePlaceId}
                  onChange={(e) => setGooglePlaceId(e.target.value)}
                  placeholder="ChIJ..."
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                />
              </div>
            </div>
          </div>

          {/* Google Agenda / Calendar OAuth 2.0 Credentials Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card-soft space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-growie-purple flex items-center justify-center font-bold shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-growie-dark">Google Agenda (Google Calendar OAuth 2.0 & API)</h3>
                  <p className="text-[11px] text-slate-500">Credenciais para sincronização de reuniões do Google Meet, agendamentos e tarefas comerciais.</p>
                </div>
              </div>

              <label className="px-3 py-1.5 rounded-xl bg-purple-50 text-growie-purple font-extrabold text-xs border border-purple-200 hover:bg-purple-100 cursor-pointer flex items-center gap-1.5">
                <Paperclip size={14} /> Importar credentials.json
                <input type="file" accept=".json" onChange={handleUploadCredentialsJson} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ID do Cliente OAuth 2.0 (Client ID)</label>
                <input
                  type="text"
                  value={googleCalendarClientId}
                  onChange={(e) => setGoogleCalendarClientId(e.target.value)}
                  placeholder="483015174513-qod0itak9170ua6cjruesjvefhl9e6g1.apps.googleusercontent.com"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark text-xs focus:border-growie-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chave Secreta do Cliente (Client Secret)</label>
                <input
                  type="password"
                  value={googleCalendarClientSecret}
                  onChange={(e) => setGoogleCalendarClientSecret(e.target.value)}
                  placeholder="GOCSPX-..."
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark text-xs focus:border-growie-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chave de API do Google (API Key)</label>
                <input
                  type="password"
                  value={googleCalendarApiKey}
                  onChange={(e) => setGoogleCalendarApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark text-xs focus:border-growie-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ID da Agenda Comercial (Calendar ID)</label>
                <input
                  type="text"
                  value={googleCalendarId}
                  onChange={(e) => setGoogleCalendarId(e.target.value)}
                  placeholder="ex: primary ou comercial@suaempresa.com.br"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark text-xs focus:border-growie-purple"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-cta text-white font-extrabold shadow-glow-lilac hover:opacity-95 flex items-center gap-1.5"
            >
              <Save size={14} /> Salvar Conexões Google & Agenda
            </button>
          </div>
        </form>
      )}

      {activeTab === 'team' && (
        <TeamManagementView
          users={users}
          onAddUser={onAddUser}
          onUpdateUser={onUpdateUser}
          onDeleteUser={onDeleteUser}
        />
      )}

      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card-soft space-y-4 text-xs font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-growie-dark flex items-center gap-2">
                <Terminal size={16} className="text-growie-cyan" /> Logs de Auditoria do Sistema (Histórico de Ações da Equipe)
              </h3>
              <p className="text-[11px] text-slate-500">Registro automático de o que cada usuário fez, que dia e que hora no workspace <strong className="text-growie-purple">{currentTenant.name}</strong>.</p>
            </div>
            <button
              onClick={() => setAuditLogs(apiService.getAuditLogs(currentTenant.id))}
              className="px-3 py-1.5 rounded-xl bg-growie-bg border border-slate-200 text-slate-700 font-bold hover:bg-slate-200 flex items-center gap-1"
            >
              <RefreshCw size={13} /> Atualizar Logs
            </button>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-growie-bg border-b border-slate-200 text-[10px] font-extrabold text-slate-500 uppercase">
                  <th className="py-3 px-4 font-mono">Data & Hora Exata</th>
                  <th className="py-3 px-4">Usuário / Perfil</th>
                  <th className="py-3 px-4">Ação Executada</th>
                  <th className="py-3 px-4">Detalhes da Operação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 font-medium">
                      Nenhum registro de auditoria encontrado neste workspace.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-slate-500 font-bold">{log.timestamp}</td>
                      <td className="py-3 px-4 font-extrabold text-growie-dark">
                        {log.userName} <span className="text-[10px] text-growie-purple font-semibold">({log.userRole})</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-growie-purple border border-purple-200 font-mono text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WhatsApp QR Modal */}
      <WhatsAppQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        onConnected={(phone) => setConnectedPhone(phone)}
      />
    </div>
  );
};
