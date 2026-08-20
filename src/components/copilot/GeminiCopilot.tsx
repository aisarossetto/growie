import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Lightbulb, 
  Zap, 
  Target, 
  MessageSquare, 
  BarChart2, 
  RefreshCw,
  Key,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { AIChatMessage } from '../../types';
import { callRealGeminiAPI } from '../../services/geminiService';
import { TypewriterText } from './TypewriterText';

interface GeminiCopilotProps {
  onNavigateTab: (tab: any) => void;
}

export const GeminiCopilot: React.FC<GeminiCopilotProps> = ({ onNavigateTab }) => {
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('growie_app_google_gemini_key') || 'AIzaSy_GROWIE_COCOPILOT_API_KEY_SECURE';
  });

  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [inputKey, setInputKey] = useState(geminiApiKey);
  const [keySaveSuccess, setKeySaveSuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const keyFromStorage = localStorage.getItem('growie_app_google_gemini_key') || '';
    if (keyFromStorage) {
      setGeminiApiKey(keyFromStorage);
      setInputKey(keyFromStorage);
    }
  }, []);

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'm1',
      sender: 'gemini',
      text: 'Olá! Sou o **Gemini Copilot Comercial** da Growie. Minha inteligência artificial está pronta para analisar seus dados e gerar copies de alta conversão!',
      timestamp: 'Agora',
      suggestedActions: [
        'Analisar Taxas de Conversão do Funil',
        'Gerar Copy de E-mail de Alta Conversão',
        'Gerar Abordagem de WhatsApp para Leads Frios',
        'Sugerir Otimização de Público no Meta Ads'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    localStorage.setItem('growie_app_google_gemini_key', inputKey.trim());
    setGeminiApiKey(inputKey.trim());
    setKeySaveSuccess(true);
    setTimeout(() => {
      setKeySaveSuccess(false);
      setIsKeyModalOpen(false);
    }, 1200);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isGenerating) return;

    const userMsg: AIChatMessage = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text,
      timestamp: 'Agora'
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsGenerating(true);

    try {
      const aiResponseText = await callRealGeminiAPI({
        apiKey: geminiApiKey,
        prompt: text
      });

      const aiMsg: AIChatMessage = {
        id: 'g_' + Date.now(),
        sender: 'gemini',
        text: aiResponseText,
        timestamp: 'Agora'
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: AIChatMessage = {
        id: 'g_' + Date.now(),
        sender: 'gemini',
        text: '⚠️ Ocorreu uma instabilidade na API da Gemini. Verifique sua chave API clicando no botão "Inserir/Editar Chave Gemini API".',
        timestamp: 'Agora'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-growie-dark via-growie-purple to-slate-900 p-6 rounded-2xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-growie-purple/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-growie-lilac to-growie-cyan flex items-center justify-center text-growie-dark shadow-glow-lilac shrink-0">
            <Sparkles size={24} className="animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold font-sans tracking-tight text-white flex items-center gap-2">
              Gemini IA Copilot Comercial
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Gemini API Conectada
              </span>
            </h1>
            <p className="text-xs text-slate-300">
              Assistente de IA especialista em CRM, Copywriting, Otimização de Ads e Conversão Comercial.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setInputKey(geminiApiKey);
            setIsKeyModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-growie-cyan text-growie-dark hover:bg-cyan-300 font-extrabold text-xs shadow-lg transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Key size={15} /> Inserir / Editar Chave Gemini API
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card-soft flex flex-col h-[560px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-growie-bg/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {msg.sender === 'gemini' ? (
                <div className="w-8 h-8 rounded-xl bg-growie-purple text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={18} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-growie-dark text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  Você
                </div>
              )}

              <div className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed shadow-sm relative group transition-all ${
                msg.sender === 'user'
                  ? 'bg-growie-purple text-white rounded-tr-none'
                  : 'bg-white text-growie-dark border border-slate-200/80 rounded-tl-none shadow-md'
              }`}>
                {msg.sender === 'gemini' ? (
                  <TypewriterText
                    text={msg.text}
                    speed={10}
                    onCharacterTyped={scrollToBottom}
                    animate={msg.id === messages[messages.length - 1]?.id}
                  />
                ) : (
                  <div className="whitespace-pre-line font-sans">{msg.text}</div>
                )}

                {/* Copy text button */}
                {msg.sender === 'gemini' && (
                  <button
                    onClick={() => copyToClipboard(msg.id, msg.text)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-growie-purple opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copiar resposta"
                  >
                    {copiedId === msg.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                )}

                {/* Suggested prompt chips if initial message */}
                {msg.suggestedActions && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Prompts Rápidos Sugeridos:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSendMessage(prompt)}
                          className="px-3 py-1.5 rounded-xl bg-growie-bg hover:bg-growie-purple/10 border border-slate-200 text-growie-purple font-semibold text-[11px] transition-colors text-left"
                        >
                          ✨ {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex items-center gap-2 text-xs font-semibold text-growie-purple animate-pulse p-2">
              <Bot size={16} className="animate-spin" /> Gemini IA está escrevendo a resposta...
            </div>
          )}

          {/* Auto-scroll anchor ref */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Pergunte à IA (ex: Gerar copy de WhatsApp para leads frios)..."
            className="flex-1 p-3 bg-growie-bg border border-slate-200 rounded-xl text-xs text-growie-dark font-medium focus:outline-none focus:border-growie-purple"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isGenerating || !inputText.trim()}
            className="px-5 py-3 rounded-xl bg-gradient-cta text-white font-extrabold text-xs shadow-glow-lilac hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send size={14} /> Enviar
          </button>
        </div>
      </div>

      {/* GEMINI API KEY MODAL */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in text-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden font-sans">
            <div className="bg-gradient-dark-purple p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-growie-cyan" />
                <h3 className="font-extrabold text-sm">Configurar Chave API do Google Gemini</h3>
              </div>
              <button onClick={() => setIsKeyModalOpen(false)} className="text-slate-300 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveApiKey} className="p-6 space-y-4">
              {keySaveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} /> Chave API do Gemini salva com sucesso!
                </div>
              )}

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
                Insira sua <strong>Chave API da Google Gemini (API Key)</strong>. Você pode obter a chave gratuitamente no Google AI Studio.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Chave API do Gemini (API Key) *</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-growie-purple hover:underline flex items-center gap-0.5"
                  >
                    Obter Chave no Google AI Studio <ExternalLink size={10} />
                  </a>
                </label>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full p-3 bg-growie-bg border border-slate-200 rounded-xl font-mono text-xs text-growie-dark focus:border-growie-purple"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-cta text-white font-extrabold shadow-glow-lilac hover:opacity-95 flex items-center gap-1.5"
                >
                  <ShieldCheck size={15} /> Salvar & Ativar Gemini IA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
