import React, { useState } from 'react';
import { 
  Flame, 
  Clock, 
  GitPullRequest, 
  CheckSquare, 
  Plus, 
  ChevronRight, 
  Star, 
  ArrowUpRight, 
  Sparkles,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  Zap,
  PhoneCall,
  Video,
  FileText,
  MessageSquare,
  UserCheck,
  Edit2,
  Trash2
} from 'lucide-react';

import { Lead, DealCard, WaitingClient, TaskItem, MetricCardData, TaskStatus, User } from '../../types';
import { AddTaskModal } from './AddTaskModal';
import { ConversionStrategyReport } from './ConversionStrategyReport';

interface DashboardViewProps {
  metrics: MetricCardData[];
  leads: Lead[];
  deals: DealCard[];
  waitingClients: WaitingClient[];
  tasks: TaskItem[];
  users?: User[];
  onToggleTaskComplete: (id: string) => void;
  onAddTask: (task: TaskItem) => void;
  onAddLeads: (leads: Partial<Lead>[]) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  leads,
  deals,
  waitingClients,
  tasks,
  users = [],
  onToggleTaskComplete,
  onAddTask,
  onAddLeads,
  onNavigateTab,
}) => {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskMemberFilter, setTaskMemberFilter] = useState<string>('all');
  const [taskTab, setTaskTab] = useState<'active' | 'archived'>('active');
  const [taskList, setTaskList] = useState<TaskItem[]>(tasks);

  const handleDeleteTask = (taskId: string) => {
    setTaskList((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleUpdateTask = (updatedTask: TaskItem) => {
    setTaskList((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  // Compute Real-time Lead Metrics
  const coldLeadsCount = leads.filter((l) => !l.isSleeping && (!l.timeline?.emailOpened && !l.timeline?.whatsappResponded && !l.timeline?.conversationContinued && l.status !== 'Em Negociação' && l.status !== 'Convertido')).length;
  const warmLeadsCount = leads.filter((l) => !l.isSleeping && (l.timeline?.emailOpened && !l.timeline?.whatsappResponded && !l.timeline?.conversationContinued && l.status !== 'Em Negociação' && l.status !== 'Convertido')).length;
  const hotLeadsCount = leads.filter((l) => !l.isSleeping && (l.timeline?.whatsappResponded || l.timeline?.conversationContinued || l.status === 'Em Negociação' || l.status === 'Convertido' || l.score >= 70)).length;
  const needsCallCount = leads.filter((l) => !l.isSleeping && (l.timeline?.whatsappResponded || l.timeline?.conversationContinued || l.timeline?.meetingScheduled || l.timeline?.proposalSent || l.timeline?.whatsappSent)).length;

  // Auto-generate follow-up task for 30-day adormecido leads
  React.useEffect(() => {
    const sleepingLeads = leads.filter((l) => l.isSleeping);
    sleepingLeads.forEach((lead) => {
      const taskTitle = `📞 Follow-up Comercial (30 dias Adormecido): ${lead.company || lead.name}`;
      if (!taskList.some((t) => t.title.includes(lead.company || lead.name) && t.title.includes('Follow-up'))) {
        const newTask: TaskItem = {
          id: 'task_sleep_' + lead.id,
          title: taskTitle,
          leadName: lead.name,
          company: lead.company,
          dueDate: new Date().toISOString().split('T')[0],
          dueTime: '10:00',
          priority: 'Alta',
          status: 'em_espera',
          assignedUserId: lead.responsibleName || 'user_admin',
          assignedUserName: lead.responsibleName || 'Isadora Rossetto',
          completed: false,
          type: 'call',
        };
        setTaskList((prev) => [newTask, ...prev]);
        onAddTask(newTask);
      }
    });
  }, [leads]);

  const featuredLeads = leads.filter((l) => l.isFeatured);

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTaskList((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isCompleted = newStatus === 'concluida';
          return { ...t, status: newStatus, completed: isCompleted };
        }
        return t;
      })
    );
  };

  const activeTasks = taskList.filter((t) => {
    const matchesUser = taskMemberFilter === 'all' || t.assignedUserId === taskMemberFilter;
    return matchesUser && t.status !== 'concluida' && !t.completed;
  });

  const archivedTasks = taskList.filter((t) => {
    const matchesUser = taskMemberFilter === 'all' || t.assignedUserId === taskMemberFilter;
    return matchesUser && (t.status === 'concluida' || t.completed);
  });

  const displayTasks = taskTab === 'active' ? activeTasks : archivedTasks;

  return (
    <div className="space-y-6">
      {/* Real-time Lead Intelligence KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Leads */}
        <div
          onClick={() => onNavigateTab('leads')}
          className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card-soft hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Leads</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-growie-purple flex items-center justify-center font-bold">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-growie-dark mt-2">{leads.length}</p>
          <span className="text-[10px] text-growie-purple font-extrabold block mt-1 group-hover:underline">Base Completa &rarr;</span>
        </div>

        {/* Leads Frios */}
        <div
          onClick={() => onNavigateTab('leads')}
          className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card-soft hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Leads Frios</span>
            <span className="text-base">❄️</span>
          </div>
          <p className="text-2xl font-black text-slate-700 mt-2">{coldLeadsCount}</p>
          <span className="text-[10px] text-slate-400 font-bold block mt-1">Entrada Recente</span>
        </div>

        {/* Leads Mornos */}
        <div
          onClick={() => onNavigateTab('leads')}
          className="bg-white p-4 rounded-2xl border border-amber-100 shadow-card-soft hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">Leads Mornos</span>
            <span className="text-base">⛅</span>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{warmLeadsCount}</p>
          <span className="text-[10px] text-amber-600 font-bold block mt-1">E-mail Aberto</span>
        </div>

        {/* Leads Quentes */}
        <div
          onClick={() => onNavigateTab('leads')}
          className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-card-soft hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">Leads Quentes</span>
            <span className="text-base">🔥</span>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{hotLeadsCount}</p>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">Respondeu / Negociação</span>
        </div>

        {/* Leads Para Ligar */}
        <div
          onClick={() => onNavigateTab('leads')}
          className="bg-gradient-to-br from-growie-purple via-purple-800 to-growie-dark p-4 rounded-2xl text-white shadow-glow-lilac hover:opacity-95 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-growie-cyan uppercase tracking-wider">Precisa Ligar</span>
            <PhoneCall size={16} className="text-growie-cyan" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{needsCallCount}</p>
          <span className="text-[10px] text-cyan-200 font-bold block mt-1">Follow-up Pendente &rarr;</span>
        </div>
      </div>

      {/* Financial & ROI Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card-soft hover:shadow-md transition-shadow space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {metric.title}
              </span>
              <div className="w-8 h-8 rounded-xl bg-growie-purple/10 text-growie-purple flex items-center justify-center font-bold">
                <Zap size={16} />
              </div>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-extrabold text-growie-dark font-sans">
                {metric.value}
              </span>
              <span className={`text-[11px] font-extrabold font-mono px-2 py-0.5 rounded ${
                metric.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {metric.change}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: Featured Leads & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Featured Leads & Funnel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Leads Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card-soft space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-emerald-500" />
                <h3 className="font-extrabold text-xs text-growie-dark uppercase tracking-wider">
                  ⭐ Leads Destacados no Radar ({featuredLeads.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('leads')}
                className="text-xs font-extrabold text-growie-purple hover:underline flex items-center gap-1"
              >
                Ver todos <ChevronRight size={14} />
              </button>
            </div>

            {featuredLeads.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center font-medium">
                Nenhum lead em destaque no momento. Clique na estrela ⭐ no painel de leads para destacar empresas prioritárias.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featuredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => onNavigateTab('leads')}
                    className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 cursor-pointer transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-xs text-growie-dark flex items-center gap-1">
                          🏢 {lead.company}
                        </h4>
                        <p className="text-[11px] text-slate-600 font-semibold pt-0.5">
                          👤 {lead.name} <span className="text-slate-400 font-normal">({lead.role})</span>
                        </p>
                      </div>
                      <Star size={16} className="text-amber-400 fill-amber-400" />
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-emerald-100/80">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <PhoneCall size={11} className="text-growie-purple" />
                        <span>{lead.phone || 'Sem telefone'}</span>
                      </div>
                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-600 text-white uppercase">
                        🔥 Quente
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Funnel Diagnostic Report */}
          <ConversionStrategyReport
            leads={leads}
            emailCampaigns={[]}
            metaCampaigns={[]}
            onNavigateTab={onNavigateTab}
          />
        </div>

        {/* Right Col: Interactive Tasks & Archiving Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare size={18} className="text-growie-purple" />
              <h3 className="font-extrabold text-xs text-growie-dark uppercase tracking-wider">
                Tarefas & Arquivo
              </h3>
            </div>

            <button
              onClick={() => setIsAddTaskModalOpen(true)}
              className="p-1 rounded-lg bg-growie-purple text-white hover:bg-purple-800 transition-colors"
              title="Adicionar Nova Tarefa"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Tasks Sub-Tabs: Pendentes vs Arquivadas */}
          <div className="flex items-center gap-1 p-1 bg-growie-bg rounded-xl border border-slate-200">
            <button
              onClick={() => setTaskTab('active')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 ${
                taskTab === 'active'
                  ? 'bg-white text-growie-purple shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-growie-dark'
              }`}
            >
              ⚡ Pendentes ({activeTasks.length})
            </button>

            <button
              onClick={() => setTaskTab('archived')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 ${
                taskTab === 'archived'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-growie-dark'
              }`}
            >
              📁 Arquivo ({archivedTasks.length})
            </button>
          </div>

          {/* Filter Tasks by Team Member */}
          <div className="flex items-center justify-between text-xs bg-growie-bg p-2 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-600 flex items-center gap-1 text-[11px]">
              <UserCheck size={13} className="text-growie-purple" /> Membro:
            </span>
            <select
              value={taskMemberFilter}
              onChange={(e) => setTaskMemberFilter(e.target.value)}
              className="p-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-growie-purple focus:border-growie-purple"
            >
              <option value="all">Todos os Membros</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Tasks List */}
          <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
            {displayTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center font-semibold">
                {taskTab === 'active' 
                  ? 'Nenhuma tarefa pendente no momento. Clique no + para criar uma ação.'
                  : 'Nenhuma tarefa concluída no arquivo ainda.'}
              </p>
            ) : (
              displayTasks.map((t) => {
                const todayStr = new Date().toISOString().split('T')[0];
                const isOverdue = t.dueDate && t.dueDate < todayStr && t.status !== 'concluida';
                const isToday = t.dueDate === todayStr;

                return (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-xl border space-y-2 transition-colors text-xs ${
                      t.status === 'concluida' || t.completed
                        ? 'bg-emerald-50/50 border-emerald-200 opacity-90'
                        : isOverdue
                        ? 'bg-rose-50/80 border-rose-200 shadow-xs'
                        : isToday
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-growie-bg border-slate-200 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className={`font-extrabold text-xs ${t.status === 'concluida' ? 'line-through text-slate-500' : 'text-growie-dark'}`}>
                            {t.title}
                          </h4>
                          {t.type === 'demanda_interna' && <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold text-[9px] border border-blue-200">⚙️ Demanda Interna</span>}
                          {t.type === 'resolucao_pepinos' && <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-extrabold text-[9px] border border-rose-200">🔥 Pepinos</span>}
                          {t.type === 'cobranca' && <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[9px] border border-emerald-200">💰 Cobrança</span>}
                          {t.type === 'follow_up' && <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-extrabold text-[9px] border border-indigo-200">📞 Follow-up</span>}
                          {t.type === 'call' && <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-extrabold text-[9px]">📞 Ligação</span>}
                          {t.type === 'meeting' && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold text-[9px]">🤝 Reunião</span>}
                          {t.type === 'proposal' && <span className="px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 font-extrabold text-[9px]">📄 Proposta</span>}
                          {t.type === 'whatsapp' && <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-800 font-extrabold text-[9px]">💬 WhatsApp</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium pt-0.5">
                          Responsável(eis): <strong className="text-growie-purple">{t.assignedUserName || 'Isadora Rossetto'}</strong> • {t.leadName}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingTask(t);
                              setIsAddTaskModalOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-growie-purple hover:bg-white rounded border border-slate-200 shadow-xs"
                            title="Editar Tarefa"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(t.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded border border-slate-200 shadow-xs"
                            title="Excluir Tarefa"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {t.status === 'concluida' ? (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded font-extrabold bg-emerald-600 text-white">
                            📁 Arquivada (Concluída)
                          </span>
                        ) : (
                          <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-extrabold ${
                            isOverdue
                              ? 'bg-rose-600 text-white'
                              : isToday
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {isOverdue ? '⚠️ Atrasada' : isToday ? '⏰ Hoje' : '📅 No Prazo'}
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-slate-400">
                          {t.dueDate} {t.dueTime ? `às ${t.dueTime}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Status Selector Dropdown */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                      <span className="text-[10px] font-bold text-slate-500">Status da Ação:</span>

                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value as TaskStatus)}
                        className={`p-1 rounded text-[10px] font-extrabold border cursor-pointer ${
                          t.status === 'concluida'
                            ? 'bg-emerald-600 text-white border-emerald-700 font-black'
                            : t.status === 'aguardando_retorno'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : t.status === 'aguardando_alteracao'
                            ? 'bg-purple-100 text-growie-purple border-purple-300'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="em_espera">Em Espera (Pendente)</option>
                        <option value="aguardando_retorno">Aguardando Retorno</option>
                        <option value="aguardando_alteracao">Aguardando Alteração</option>
                        <option value="concluida">Concluída ✅ (Mover para Arquivo)</option>
                      </select>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => {
          setIsAddTaskModalOpen(false);
          setEditingTask(null);
        }}
        leads={leads}
        users={users}
        taskToEdit={editingTask}
        onAddTask={(task) => {
          setTaskList((prev) => [task, ...prev]);
          onAddTask(task);
        }}
        onUpdateTask={(updated) => {
          handleUpdateTask(updated);
        }}
      />
    </div>
  );
};
