import React, { useState } from 'react';
import { X, Workflow, Save, CheckCircle2, Zap, Clock, Mail, MessageSquare, Sparkles } from 'lucide-react';
import { AutomationNode } from '../../types';

interface NodeConfigDrawerProps {
  node: AutomationNode | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNode: (updatedNode: AutomationNode) => void;
}

export const NodeConfigDrawer: React.FC<NodeConfigDrawerProps> = ({
  node,
  isOpen,
  onClose,
  onUpdateNode,
}) => {
  if (!isOpen || !node) return null;

  const [title, setTitle] = useState(node.title);
  const [description, setDescription] = useState(node.description);
  const [delayMinutes, setDelayMinutes] = useState(node.config.delayMinutes || 10);
  const [templateName, setTemplateName] = useState(node.config.templateName || 'Mensagem Inicial WhatsApp');
  const [customWhatsAppMessage, setCustomWhatsAppMessage] = useState(
    node.config.customWhatsAppMessage || 'Olá {nome}, vi que você abriu nosso e-mail da empresa {empresa}! Podemos agendar uma reunião rápida de 15 minutos?'
  );
  const [customPrompt, setCustomPrompt] = useState(
    node.config.customPrompt || 'Aja como um consultor comercial sênior da Growie e gere uma abordagem personalizada para este lead.'
  );
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateNode({
      ...node,
      title,
      description,
      config: {
        ...node.config,
        delayMinutes,
        templateName,
        customWhatsAppMessage,
        customPrompt
      }
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-growie-dark/70 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-dark-purple p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Workflow size={18} className="text-growie-cyan" />
              <div>
                <h3 className="font-extrabold text-sm">Configurar Nó de Automação & Prompts</h3>
                <p className="text-[11px] text-slate-300">Tipo: {node.type.toUpperCase()}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            {isSaved && (
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 font-bold flex items-center gap-2">
                <CheckCircle2 size={16} /> Parâmetros e Prompts salvos com sucesso!
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Título da Ação/Gatilho *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-bold text-growie-dark"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Descrição detalhada</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-medium"
              />
            </div>

            {/* Custom WhatsApp Web Message Field */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <h4 className="font-extrabold text-emerald-900 uppercase text-[11px] flex items-center gap-1.5">
                <MessageSquare size={14} className="text-emerald-600" /> Mensagem Customizada para Envio no WhatsApp Web
              </h4>
              <p className="text-[10px] text-emerald-700 font-medium">
                Digite o texto exato que a automação disparará no WhatsApp Web. Utilize as variáveis abaixo:
              </p>
              <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">{'{nome}'}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">{'{empresa}'}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">{'{cargo}'}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">{'{telefone}'}</span>
              </div>
              <textarea
                rows={4}
                value={customWhatsAppMessage}
                onChange={(e) => setCustomWhatsAppMessage(e.target.value)}
                placeholder="Ex: Olá {nome}, vi que você abriu nosso e-mail da empresa {empresa}! Podemos agendar uma reunião rápida de 15 min?"
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-sans text-xs text-slate-800 focus:border-emerald-500 font-medium"
              />
            </div>

            {/* Custom AI Prompt Section */}
            <div className="p-4 bg-gradient-to-br from-growie-purple/10 to-growie-cyan/10 rounded-2xl border border-growie-purple/30 space-y-2">
              <h4 className="font-extrabold text-growie-purple uppercase text-[11px] flex items-center gap-1.5">
                <Sparkles size={14} className="text-growie-cyan" /> Prompt Personalizado da IA (Mensagem/Copy)
              </h4>
              <p className="text-[10px] text-slate-500">
                Escreva a instrução para a IA gerar ou adaptar a mensagem enviada nesta etapa da automação.
              </p>
              <textarea
                rows={3}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ex: Aja como um especialista de vendas e crie uma abordagem persuasiva no WhatsApp oferecendo um bônus especial..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 focus:border-growie-purple"
              />
            </div>

            <div className="p-4 bg-growie-purple/10 rounded-2xl border border-growie-purple/20 space-y-3">
              <h4 className="font-extrabold text-growie-purple uppercase text-[11px]">Parâmetros de Regra & Tempo:</h4>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tempo de Espera / Atraso (Minutos)</label>
                <input
                  type="number"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-growie-dark"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Template de Mensagem / E-mail</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-cta text-white font-extrabold shadow-glow-lilac hover:opacity-95 flex items-center gap-1.5"
              >
                <Save size={14} /> Salvar Configuração do Nó
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
