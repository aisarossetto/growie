import React, { useState } from 'react';
import { 
  Workflow, 
  Plus, 
  Play, 
  CheckCircle2, 
  MailCheck, 
  MessageSquare, 
  Clock, 
  Filter, 
  ArrowDown, 
  Zap, 
  Settings2,
  Power,
  Sparkles,
  ChevronRight,
  Bot,
  Trash2,
  Layers,
  Edit2,
  Save,
  QrCode,
  X
} from 'lucide-react';

import { AutomationFlow, AutomationNode } from '../../types';
import { NodeConfigDrawer } from './NodeConfigDrawer';

interface AutomationBuilderProps {
  flows: AutomationFlow[];
  onToggleFlowActive: (id: string) => void;
  onUpdateFlow: (flow: AutomationFlow) => void;
  onAddFlow?: (flow: AutomationFlow) => void;
}

export const AutomationBuilder: React.FC<AutomationBuilderProps> = ({
  flows,
  onToggleFlowActive,
  onUpdateFlow,
}) => {
  const [localFlows, setLocalFlows] = useState<AutomationFlow[]>(() => {
    if (flows && flows.length > 0) return flows;
    return [
      {
        id: 'f1',
        name: 'Nutrição Automática de Leads via WhatsApp API',
        description: 'Disparos sequenciais automatizados para novos leads capturados.',
        trigger: 'Novo Lead Cadastrado via Form / Meta Ads',
        active: true,
        triggerCount: 42,
        nodes: [
          {
            id: 'n1',
            type: 'trigger',
            title: 'Lead Criado no Meta Ads',
            description: 'Recebe novos contatos capturados pelas campanhas.',
            iconName: 'Zap',
            config: { delayMinutes: 0 }
          },
          {
            id: 'n2',
            type: 'action',
            title: 'Disparar Boas-Vindas no WhatsApp API',
            description: 'Envia mensagem inicial com link da apresentação institucional.',
            iconName: 'MessageSquare',
            config: { delayMinutes: 2, templateName: 'Template Boas-Vindas WhatsApp', customPrompt: 'Aja como consultor comercial sênior e ofereça atendimento personalizado.' }
          },
          {
            id: 'n3',
            type: 'condition',
            title: 'Aguardar 15 Minutos & Checar Resposta',
            description: 'Se o lead não respondeu, prepara envio de e-mail auxiliar.',
            iconName: 'Clock',
            config: { delayMinutes: 15, templateName: 'Verificação de Engajamento' }
          }
        ]
      }
    ];
  });

  const [selectedFlowId, setSelectedFlowId] = useState<string>(localFlows[0]?.id || 'f1');
  const [selectedNode, setSelectedNode] = useState<AutomationNode | null>(null);

  // Folder / Lead Group Scoping Filter
  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('all');

  // WhatsApp Web Session State (Sem API Oficial)
  const [whatsAppWebConnected, setWhatsAppWebConnected] = useState<boolean>(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  // AI WhatsApp Conversation Meeting Detector State
  const [aiChatInput, setAiChatInput] = useState<string>('Perfeito! Podemos agendar a reunião para quinta-feira às 15:00h.');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{ meetingDetected: boolean; dateStr?: string; summary?: string } | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);

  // Simulation State
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationActiveNodeId, setSimulationActiveNodeId] = useState<string | null>(null);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // New Flow Modal State
  const [isNewFlowModalOpen, setIsNewFlowModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowTrigger, setNewFlowTrigger] = useState('Novo Lead Cadastrado no Sistema');

  const activeFlow = localFlows.find((f) => f.id === selectedFlowId) || localFlows[0];

  const handleAnalyzeWhatsAppResponseWithAI = () => {
    if (!aiChatInput.trim()) return;
    setIsAiAnalyzing(true);
    setAiAnalysisResult(null);

    setTimeout(() => {
      setIsAiAnalyzing(false);
      const lower = aiChatInput.toLowerCase();
      const hasMeetingTime = lower.includes('às') || lower.includes('as ') || lower.includes('15:00') || lower.includes('14h') || lower.includes('10h') || lower.includes('quinta') || lower.includes('amanhã') || lower.includes('agendar') || lower.includes('confirmado');

      if (hasMeetingTime) {
        setAiAnalysisResult({
          meetingDetected: true,
          dateStr: 'Quinta-feira às 15:00h',
          summary: '✨ IA Detectou Agendamento de Reunião! O lead teve o estágio alterado para "Reunião Agendada", temperatura promovida para "🔥 Quente" e o compromisso foi criado na Agenda do Google Calendar.'
        });
      } else {
        setAiAnalysisResult({
          meetingDetected: false,
          summary: 'ℹ️ IA analisou a conversa: Lead interessado, porém ainda não confirmou dia/horário exato de reunião.'
        });
      }
    }, 1200);
  };

  const handleCreateNewFlow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlowName.trim()) return;

    const createdFlow: AutomationFlow = {
      id: 'f_' + Date.now(),
      name: newFlowName.trim(),
      description: 'Régua de automação criada pelo usuário.',
      trigger: newFlowTrigger,
      active: true,
      triggerCount: 0,
      nodes: [
        {
          id: 'n_trig_' + Date.now(),
          type: 'trigger',
          title: newFlowTrigger,
          description: 'Gatilho que inicia a execução automática desta régua.',
          iconName: 'Zap',
          config: { delayMinutes: 0 }
        },
        {
          id: 'n_act_' + Date.now(),
          type: 'action',
          title: 'Primeiro Disparo WhatsApp API / IA',
          description: 'Mensagem gerada com IA para engajamento rápido.',
          iconName: 'MessageSquare',
          config: { delayMinutes: 5, templateName: 'Template de Apresentação', customPrompt: 'Gere uma saudação direta e convidativa.' }
        }
      ]
    };

    setLocalFlows((prev) => [...prev, createdFlow]);
    setSelectedFlowId(createdFlow.id);
    setNewFlowName('');
    setIsNewFlowModalOpen(false);

    setNotification(`Nova Automação "${createdFlow.name}" criada com sucesso!`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAddTemplateFlow = (templateType: 'whatsapp' | 'proposta' | 'meet') => {
    let templateFlow: AutomationFlow;

    if (templateType === 'whatsapp') {
      templateFlow = {
        id: 'f_tpl_wa_' + Date.now(),
        name: 'Régua de Boas-Vindas & Qualificação WhatsApp',
        description: 'Qualificação automatizada com mensagens e e-mail PDF.',
        trigger: 'Lead Recebido no CRM',
        active: true,
        triggerCount: 15,
        nodes: [
          { id: 't1', type: 'trigger', title: 'Lead Entrou no Funil', description: 'Ativação instantânea ao receber o lead.', iconName: 'Zap', config: {} },
          { id: 't2', type: 'action', title: 'Enviar Saudação WhatsApp API', description: 'Envia mensagem personalizada.', iconName: 'MessageSquare', config: { delayMinutes: 2, templateName: 'Saudação Inicial' } },
          { id: 't3', type: 'condition', title: 'Aguardar 30 min sem resposta', description: 'Verifica interação do lead.', iconName: 'Clock', config: { delayMinutes: 30 } },
          { id: 't4', type: 'action', title: 'Disparar E-mail com Apresentação PDF', description: 'Envia o material comercial.', iconName: 'MailCheck', config: { delayMinutes: 0, templateName: 'Material Comercial PDF' } }
        ]
      };
    } else if (templateType === 'proposta') {
      templateFlow = {
        id: 'f_tpl_prop_' + Date.now(),
        name: 'Recuperação de Proposta Comercial (24h)',
        description: 'Follow-up automático no WhatsApp para propostas enviadas.',
        trigger: 'Proposta Enviada no Kanban',
        active: true,
        triggerCount: 8,
        nodes: [
          { id: 'p1', type: 'trigger', title: 'Proposta Criada no Kanban', description: 'Monitora oportunidade em proposta.', iconName: 'Zap', config: {} },
          { id: 'p2', type: 'condition', title: 'Aguardar 24h de Análise', description: 'Dá tempo para o cliente analisar os valores.', iconName: 'Clock', config: { delayMinutes: 1440 } },
          { id: 'p3', type: 'action', title: 'WhatsApp de Tira-Dúvidas Comercial', description: 'Mensagem amigável oferecendo reunião curta.', iconName: 'MessageSquare', config: { delayMinutes: 0, templateName: 'Follow-up de Proposta' } }
        ]
      };
    } else {
      templateFlow = {
        id: 'f_tpl_meet_' + Date.now(),
        name: 'Lembrete Automático de Reunião Google Meet',
        description: 'Notificação automática com link da reunião.',
        trigger: 'Reunião Agendada na Agenda',
        active: true,
        triggerCount: 23,
        nodes: [
          { id: 'm1', type: 'trigger', title: 'Reunião Marcada na Agenda', description: 'Detecta evento no Google Calendar.', iconName: 'Zap', config: {} },
          { id: 'm2', type: 'condition', title: 'Aguardar 1h antes da Reunião', description: 'Alerta prévio.', iconName: 'Clock', config: { delayMinutes: 60 } },
          { id: 'm3', type: 'action', title: 'Lembrete WhatsApp com Link do Meet', description: 'Envia link da sala de conferência.', iconName: 'MessageSquare', config: { delayMinutes: 0, templateName: 'Lembrete Meet' } }
        ]
      };
    }

    setLocalFlows((prev) => [...prev, templateFlow]);
    setSelectedFlowId(templateFlow.id);
    setNotification(`Template "${templateFlow.name}" adicionado e ativado!`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAddNode = (type: 'action' | 'condition') => {
    if (!activeFlow) return;

    const newNode: AutomationNode = {
      id: 'n_' + Date.now(),
      type,
      title: type === 'action' ? 'Nova Ação: Mensagem / Copy de IA' : 'Nova Condição / Regra de Espera',
      description: type === 'action' ? 'Dispara mensagem no WhatsApp ou E-mail com prompt de IA.' : 'Aguardar tempo determinado para checar resposta.',
      iconName: type === 'action' ? 'MessageSquare' : 'Clock',
      config: { delayMinutes: 10, templateName: 'Template Personalizado', customPrompt: 'Aja como consultor e ofereça ajuda.' }
    };

    const updatedNodes = [...activeFlow.nodes, newNode];
    const updatedFlow = { ...activeFlow, nodes: updatedNodes };
    
    setLocalFlows((prev) => prev.map(f => f.id === updatedFlow.id ? updatedFlow : f));
    onUpdateFlow(updatedFlow);

    setNotification(`Novo nó (${type.toUpperCase()}) adicionado!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSimulateExecution = () => {
    if (!activeFlow || activeFlow.nodes.length === 0) return;

    setIsSimulationRunning(true);
    setSimulationLog(['🚀 Iniciando simulação de execução...']);
    let index = 0;

    const interval = setInterval(() => {
      if (index < activeFlow.nodes.length) {
        const currentNode = activeFlow.nodes[index];
        setSimulationActiveNodeId(currentNode.id);
        setSimulationLog((prev) => [
          ...prev,
          `⚡ Executando nó ${index + 1}: "${currentNode.title}" (${currentNode.type.toUpperCase()})`
        ]);
        index++;
      } else {
        clearInterval(interval);
        setIsSimulationRunning(false);
        setSimulationActiveNodeId(null);
        setSimulationLog((prev) => [...prev, `✅ Fluxo "${activeFlow.name}" concluído com 100% de sucesso!`]);
        setNotification(`Simulação do fluxo "${activeFlow.name}" concluída!`);
        setTimeout(() => setNotification(null), 4000);
      }
    }, 1200);
  };

  const handleUpdateNode = (updatedNode: AutomationNode) => {
    if (!activeFlow) return;

    const updatedNodes = activeFlow.nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n));
    const updatedFlow = { ...activeFlow, nodes: updatedNodes };

    setLocalFlows((prev) => prev.map(f => f.id === updatedFlow.id ? updatedFlow : f));
    onUpdateFlow(updatedFlow);
  };

  return (
    <div className="space-y-6">
      {/* Top Notification */}
      {notification && (
        <div className="bg-growie-dark text-white p-3.5 rounded-xl border border-growie-cyan shadow-xl flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-growie-cyan animate-pulse" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-growie-dark font-sans tracking-tight flex items-center gap-2">
            <Workflow className="text-growie-purple" /> Builder de Automação Visual (Gatilho &rarr; Ação)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Crie réguas de nutrição multicanal (E-mail + WhatsApp API), configure prompts de IA e simule disparos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsNewFlowModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-growie-purple text-white text-xs font-extrabold shadow-glow-lilac hover:bg-purple-800 transition-colors flex items-center gap-1.5"
          >
            <Plus size={15} /> + Criar Nova Automação
          </button>

          {activeFlow && (
            <button
              onClick={() => onToggleFlowActive(activeFlow.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 ${
                activeFlow.active
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              <Power size={14} /> {activeFlow.active ? 'Fluxo Ativo' : 'Fluxo Pausado'}
            </button>
          )}

          <button
            onClick={handleSimulateExecution}
            disabled={isSimulationRunning}
            className="px-4 py-2.5 rounded-xl bg-gradient-cta text-white text-xs font-extrabold shadow-glow-lilac hover:opacity-95 flex items-center gap-1.5"
          >
            <Play size={15} className={isSimulationRunning ? 'animate-spin text-growie-cyan' : ''} />
            {isSimulationRunning ? 'Simulando Disparos...' : '▶ Simular Execução do Fluxo'}
          </button>
        </div>
      </div>

      {/* WhatsApp Web Non-API Active Session Engine Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 p-4 rounded-2xl border border-emerald-500/40 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-lg shrink-0">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">WhatsApp Web Direct Engine (Sessão Sem API Oficial)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[10px] font-mono font-bold">
                Sessão Web Ativa
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Conectado ao celular (+55 11 98844-1234) via QR Code do WhatsApp Web. Disparos automáticos diretamente da sua conta.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setNotification('Reaberto leitor de QR Code para reautenticar WhatsApp Web...');
              setTimeout(() => setNotification(null), 3000);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <QrCode size={14} /> Reconectar QR Code
          </button>
        </div>
      </div>

      {/* Scoping by Folder & AI WhatsApp Response Analyzer Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Lead Folder / Group Selector */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card-soft space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-extrabold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
              Escopo por Pasta / Grupo de Leads
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-growie-purple border border-purple-200">
              Filtragem por Grupo
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            Selecione qual pasta de leads esta automação deve monitorar (ex: quando e-mail for aberto via pixel):
          </p>

          <select
            value={selectedFolderFilter}
            onChange={(e) => setSelectedFolderFilter(e.target.value)}
            className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-extrabold text-growie-purple text-xs focus:border-growie-purple"
          >
            <option value="all">Todas as Pastas & Grupos (Base Geral)</option>
            <option value="imobiliarias">Imobiliárias & Construtoras</option>
            <option value="vip">Clientes VIP / High Ticket</option>
            <option value="ecommerce">E-commerce & Varejo</option>
            <option value="b2b">B2B SaaS & Tecnologia</option>
          </select>
        </div>

        {/* Card 2: AI WhatsApp Conversation Meeting Detector */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-card-soft space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-extrabold text-growie-purple text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={15} className="text-growie-cyan" /> IA Leitora de Respostas (Detecção de Reunião)
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              IA Gemini Ativa
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            A IA analisa as respostas no WhatsApp para identificar se o lead confirmou dia/horário de reunião e avança a etapa comercial:
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={aiChatInput}
              onChange={(e) => setAiChatInput(e.target.value)}
              placeholder="Digite ou simule a resposta do lead..."
              className="flex-1 p-2 bg-growie-bg border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            />
            <button
              onClick={handleAnalyzeWhatsAppResponseWithAI}
              disabled={isAiAnalyzing}
              className="px-3.5 py-2 bg-growie-purple hover:bg-purple-800 text-white font-extrabold rounded-xl text-xs shrink-0 flex items-center gap-1 transition-colors"
            >
              {isAiAnalyzing ? 'Analisando IA...' : '⚡ Analisar com IA'}
            </button>
          </div>

          {aiAnalysisResult && (
            <div className={`p-3 rounded-xl border text-xs space-y-1 animate-in fade-in ${
              aiAnalysisResult.meetingDetected
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                : 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
            }`}>
              <p>{aiAnalysisResult.summary}</p>
              {aiAnalysisResult.meetingDetected && (
                <div className="flex items-center gap-2 pt-1 font-mono text-[11px] font-bold text-emerald-800">
                  <span>📅 Horário Extraído: {aiAnalysisResult.dateStr}</span>
                  <span>|</span>
                  <span>🔥 Avançado para "Reunião Agendada"</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ready Automation Templates Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card-soft space-y-3">
        <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Zap size={15} className="text-growie-purple" /> Automações Prontas (Clique para Ativar Instantaneamente):
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleAddTemplateFlow('whatsapp')}
            className="p-3 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-xl text-left transition-all space-y-1 group"
          >
            <span className="text-[10px] font-bold text-growie-purple uppercase block">Template 1</span>
            <h5 className="font-extrabold text-growie-dark text-xs group-hover:text-growie-purple">Nutrição WhatsApp Web / API</h5>
            <p className="text-[11px] text-slate-500">Novo Lead &rarr; Msg WhatsApp &rarr; E-mail PDF se não responder</p>
          </button>

          <button
            onClick={() => handleAddTemplateFlow('proposta')}
            className="p-3 bg-cyan-50 hover:bg-cyan-100/80 border border-cyan-200 rounded-xl text-left transition-all space-y-1 group"
          >
            <span className="text-[10px] font-bold text-cyan-900 uppercase block">Template 2</span>
            <h5 className="font-extrabold text-growie-dark text-xs group-hover:text-cyan-900">Recuperação de Proposta (24h)</h5>
            <p className="text-[11px] text-slate-500">Proposta no Kanban &rarr; Esperar 24h &rarr; WhatsApp tira-dúvidas</p>
          </button>

          <button
            onClick={() => handleAddTemplateFlow('meet')}
            className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl text-left transition-all space-y-1 group"
          >
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Template 3</span>
            <h5 className="font-extrabold text-growie-dark text-xs group-hover:text-emerald-800">Lembrete Google Meet</h5>
            <p className="text-[11px] text-slate-500">Reunião Marcada &rarr; Lembrete 1h antes com Link do Meet</p>
          </button>
        </div>
      </div>

      {/* Select Flow Tabs Bar */}
      {localFlows.length > 0 && (
        <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-100 shadow-card-soft text-xs overflow-x-auto">
          <span className="font-bold text-slate-400 shrink-0">Suas Automações:</span>
          {localFlows.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFlowId(f.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                selectedFlowId === f.id
                  ? 'bg-growie-purple text-white shadow-glow-lilac'
                  : 'bg-growie-bg text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.name} ({f.nodes.length} etapas)
            </button>
          ))}
        </div>
      )}

      {/* Simulation Feed Drawer (if running or completed) */}
      {simulationLog.length > 0 && (
        <div className="p-4 bg-slate-950 text-white rounded-2xl border border-growie-cyan/50 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-growie-cyan flex items-center gap-1.5">
              <Bot size={15} /> Console de Simulação em Tempo Real
            </span>
            <button onClick={() => setSimulationLog([])} className="text-slate-400 hover:text-white text-[11px]">
              Limpar Console
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {simulationLog.map((log, i) => (
              <p key={i} className="text-[11px] text-slate-300">{log}</p>
            ))}
          </div>
        </div>
      )}

      {/* Visual Canvas Area */}
      {activeFlow && (
        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative min-h-[500px] flex flex-col items-center justify-start space-y-6">
          {/* Canvas Background Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none rounded-3xl" />

          {/* Node Add Bar */}
          <div className="relative z-10 flex items-center gap-2 bg-slate-800/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-lg text-xs">
            <span className="text-slate-300 font-extrabold px-3">Espaço de Adicionar:</span>
            <button
              onClick={() => handleAddNode('action')}
              className="px-3.5 py-1.5 rounded-xl bg-growie-purple hover:bg-purple-800 text-white font-bold flex items-center gap-1 transition-colors"
            >
              <Plus size={14} /> + Ação WhatsApp / E-mail / IA
            </button>
            <button
              onClick={() => handleAddNode('condition')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center gap-1 transition-colors"
            >
              <Plus size={14} /> + Condição / Atraso
            </button>
          </div>

          {/* Nodes Sequence */}
          <div className="relative z-10 flex flex-col items-center space-y-4 w-full max-w-lg">
            {activeFlow.nodes.map((node, idx) => {
              const isSimActive = simulationActiveNodeId === node.id;

              return (
                <React.Fragment key={node.id}>
                  {/* Connector Arrow */}
                  {idx > 0 && (
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-6 bg-slate-700" />
                      <ArrowDown size={14} className="text-slate-500 -mt-1" />
                    </div>
                  )}

                  {/* Node Card */}
                  <div
                    onClick={() => setSelectedNode(node)}
                    className={`w-full p-4 rounded-2xl border transition-all cursor-pointer shadow-lg space-y-2 relative ${
                      isSimActive
                        ? 'bg-growie-purple border-growie-cyan ring-4 ring-growie-cyan/50 scale-105 shadow-glow-cyan'
                        : node.type === 'trigger'
                        ? 'bg-slate-800 border-growie-purple text-white hover:border-growie-cyan'
                        : node.type === 'condition'
                        ? 'bg-amber-950/40 border-amber-500/50 text-white hover:border-amber-400'
                        : 'bg-slate-800/80 border-slate-700 text-white hover:border-growie-purple'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          node.type === 'trigger'
                            ? 'bg-growie-cyan text-growie-dark'
                            : node.type === 'condition'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-growie-purple text-white'
                        }`}>
                          {node.type === 'trigger' ? <Zap size={16} /> : node.type === 'condition' ? <Clock size={16} /> : <MessageSquare size={16} />}
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-growie-cyan block">
                            {node.type === 'trigger' ? 'Gatilho Inicial' : node.type === 'condition' ? 'Regra / Atraso' : 'Ação com IA'}
                          </span>
                          <h4 className="font-extrabold text-xs text-white leading-tight">
                            {node.title}
                          </h4>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode(node);
                        }}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                        title="Configurar Parâmetros e Prompts da IA"
                      >
                        <Settings2 size={15} />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                      {node.description}
                    </p>

                    {node.config.customPrompt && (
                      <div className="p-2 bg-slate-950/70 rounded-lg border border-slate-700/80 font-mono text-[10px] text-growie-cyan">
                        <span className="font-bold text-slate-400 block uppercase">Prompt da IA:</span>
                        "{node.config.customPrompt}"
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Create New Flow Modal */}
      {isNewFlowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in text-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden font-sans">
            <div className="bg-gradient-dark-purple p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow size={18} className="text-growie-cyan" />
                <h3 className="font-extrabold text-sm">Criar Nova Automação Comercial</h3>
              </div>
              <button onClick={() => setIsNewFlowModalOpen(false)} className="text-slate-300 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewFlow} className="p-6 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome da Automação / Régua *</label>
                <input
                  type="text"
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  placeholder="Ex: Régua de Boas-Vindas WhatsApp + Email"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gatilho Inicial de Disparo</label>
                <select
                  value={newFlowTrigger}
                  onChange={(e) => setNewFlowTrigger(e.target.value)}
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Novo Lead Cadastrado no Sistema">Novo Lead Cadastrado no Sistema</option>
                  <option value="Lead Movido para Proposta no Kanban">Lead Movido para Proposta no Kanban</option>
                  <option value="Reunião Agendada no Google Calendar">Reunião Agendada no Google Calendar</option>
                  <option value="E-mail Comercial Aberto pelo Lead">E-mail Comercial Aberto pelo Lead</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-cta text-white font-extrabold text-xs shadow-glow-lilac hover:opacity-95 flex items-center justify-center gap-1.5 mt-2"
              >
                <Plus size={15} /> Criar Automação & Abrir Builder Visual
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Node Config Drawer */}
      <NodeConfigDrawer
        node={selectedNode}
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        onUpdateNode={handleUpdateNode}
      />
    </div>
  );
};
