import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Bot, Minimize2, Maximize2 } from 'lucide-react';
import { callRealGeminiAPI } from '../../services/geminiService';
import { TypewriterText } from './TypewriterText';

interface FloatingCopilotWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const FloatingCopilotWidget: React.FC<FloatingCopilotWidgetProps> = ({
  isOpen,
  onToggle,
}) => {
  const [messages, setMessages] = useState([
    { id: 'm0', sender: 'gemini', text: 'Olá! Sou o Gemini Copilot Comercial. Como posso ajudar com suas vendas, copies ou análise de leads hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const widgetEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    widgetEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-2 right-4 z-40 px-3 py-1.5 rounded-full bg-gradient-to-r from-growie-lilac to-growie-purple text-white font-extrabold text-[11px] shadow-lg flex items-center gap-1.5 hover:scale-105 transition-transform opacity-90 hover:opacity-100"
        title="Abrir Gemini IA Copilot Flutuante"
      >
        <Sparkles size={14} className="text-growie-cyan animate-pulse" />
        <span>Gemini Copilot IA</span>
      </button>
    );
  }

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    const userText = input;
    const uId = 'u_' + Date.now();
    setMessages((prev) => [...prev, { id: uId, sender: 'user', text: userText }]);
    setInput('');
    setIsGenerating(true);

    try {
      const response = await callRealGeminiAPI({ prompt: userText });
      const gId = 'g_' + Date.now();
      setMessages((prev) => [...prev, { id: gId, sender: 'gemini', text: response }]);
    } catch (err) {
      const eId = 'g_' + Date.now();
      setMessages((prev) => [
        ...prev,
        { id: eId, sender: 'gemini', text: '⚠️ Desculpe, ocorreu uma instabilidade ao conectar com a IA Gemini. Verifique sua conexão ou chave API em Configurações.' }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed bottom-3 right-4 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[420px] animate-in slide-in-from-bottom-5 font-sans">
      {/* Widget Header */}
      <div className="bg-gradient-dark-purple p-3.5 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-growie-cyan/20 text-growie-cyan flex items-center justify-center font-bold">
            <Sparkles size={14} className="animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-extrabold tracking-tight block text-white">Gemini Copilot Comercial</span>
            <span className="text-[9px] text-emerald-400 font-mono font-bold block">● Google Gemini IA Conectada</span>
          </div>
        </div>
        <button onClick={onToggle} className="text-slate-300 hover:text-white p-1 rounded-lg">
          <X size={16} />
        </button>
      </div>

      {/* Widget Chat Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-growie-bg/50 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-2xl leading-relaxed ${
              m.sender === 'user'
                ? 'bg-growie-purple text-white ml-6 text-right rounded-tr-none shadow-sm font-medium whitespace-pre-line'
                : 'bg-white text-growie-dark border border-slate-200/80 mr-6 rounded-tl-none shadow-sm'
            }`}
          >
            {m.sender === 'gemini' ? (
              <TypewriterText
                text={m.text}
                speed={10}
                onCharacterTyped={scrollToBottom}
                animate={m.id === messages[messages.length - 1]?.id}
              />
            ) : (
              m.text
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="p-2 text-[11px] font-bold text-growie-purple animate-pulse flex items-center gap-1.5">
            <Bot size={15} className="animate-spin" /> Gemini IA está escrevendo a resposta...
          </div>
        )}

        <div ref={widgetEndRef} />
      </div>

      {/* Widget Input */}
      <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Pergunte à IA Gemini..."
          disabled={isGenerating}
          className="flex-1 p-2.5 bg-growie-bg border border-slate-200 rounded-xl text-xs text-growie-dark font-medium focus:outline-none focus:border-growie-purple"
        />
        <button
          onClick={handleSend}
          disabled={isGenerating || !input.trim()}
          className="p-2.5 rounded-xl bg-growie-purple hover:bg-purple-800 text-white disabled:opacity-50 transition-colors"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
};
