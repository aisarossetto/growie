import React, { useState } from 'react';
import { X, CheckSquare, Calendar, PhoneCall, Users, FileText, MessageSquare, Plus, Save, UserCheck, Clock } from 'lucide-react';
import { TaskItem, Lead, User } from '../../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  users?: User[];
  taskToEdit?: TaskItem | null;
  onAddTask: (task: TaskItem) => void;
  onUpdateTask?: (task: TaskItem) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  leads,
  users = [],
  taskToEdit,
  onAddTask,
  onUpdateTask,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [leadName, setLeadName] = useState(taskToEdit?.leadName || '');
  const [assignedUserId, setAssignedUserId] = useState(taskToEdit?.assignedUserId || '');
  const [dueDate, setDueDate] = useState(taskToEdit?.dueDate || todayStr);
  const [dueTime, setDueTime] = useState(taskToEdit?.dueTime || '15:00');
  const [type, setType] = useState<TaskItem['type']>(taskToEdit?.type || 'call');
  const [priority, setPriority] = useState<TaskItem['priority']>(taskToEdit?.priority || 'Alta');

  const selectedUser = users.find(u => u.id === assignedUserId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (taskToEdit && onUpdateTask) {
      onUpdateTask({
        ...taskToEdit,
        title: title.trim(),
        leadName: leadName || 'Geral / Sem Lead',
        dueDate,
        dueTime,
        type,
        priority,
        assignedUserId,
        assignedUserName: selectedUser?.name || taskToEdit.assignedUserName || 'Isadora Rossetto'
      });
    } else {
      const task: TaskItem = {
        id: 't_' + Date.now(),
        title: title.trim(),
        leadName: leadName || 'Geral / Sem Lead',
        dueDate,
        dueTime,
        type,
        priority,
        completed: false,
        status: 'em_espera',
        assignedUserId,
        assignedUserName: selectedUser?.name || 'Isadora Rossetto'
      };
      onAddTask(task);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in text-xs font-sans">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-dark-purple p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare size={18} className="text-growie-cyan" />
            <h3 className="font-extrabold text-sm">{taskToEdit ? 'Editar Tarefa Comercial' : 'Adicionar Nova Tarefa Comercial'}</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Descrição da Tarefa *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Realizar ligação de retorno após envio de proposta"
              className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-medium text-growie-dark focus:border-growie-purple"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <UserCheck size={14} className="text-growie-purple" /> Membro da Equipe Responsável:
            </label>
            <select
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-bold text-growie-purple focus:border-growie-purple"
            >
              <option value="">-- Isadora Rossetto (Sua Conta) --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  👤 {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Lead / Cliente Relacionado</label>
            <select
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-medium text-growie-dark focus:border-growie-purple"
            >
              <option value="">-- Selecionar Lead (Opcional) --</option>
              {leads.map((l) => (
                <option key={l.id} value={`${l.name} (${l.company})`}>
                  {l.name} - {l.company}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo de Ação</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
              >
                <option value="call">Ligação Telefônica</option>
                <option value="meeting">Reunião Agendada</option>
                <option value="proposal">Envio de Proposta</option>
                <option value="whatsapp">Mensagem WhatsApp</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
              >
                <option value="Alta">Alta Prioridade</option>
                <option value="Média">Média Prioridade</option>
                <option value="Baixa">Baixa Prioridade</option>
              </select>
            </div>
          </div>

          {/* Date & Time Picker */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar size={13} className="text-growie-purple" /> Data de Vencimento *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock size={13} className="text-growie-purple" /> Horário Limite *
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-cta text-white font-extrabold text-xs shadow-glow-lilac hover:opacity-95 flex items-center justify-center gap-1.5"
          >
            <Save size={14} /> Salvar Tarefa com Data
          </button>
        </form>
      </div>
    </div>
  );
};
