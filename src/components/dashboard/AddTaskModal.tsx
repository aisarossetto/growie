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
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(() => {
    if (taskToEdit?.assignedUserIds && taskToEdit.assignedUserIds.length > 0) return taskToEdit.assignedUserIds;
    if (taskToEdit?.assignedUserId) return [taskToEdit.assignedUserId];
    return [];
  });
  const [dueDate, setDueDate] = useState(taskToEdit?.dueDate || todayStr);
  const [dueTime, setDueTime] = useState(taskToEdit?.dueTime || '15:00');
  const [type, setType] = useState<TaskItem['type']>(taskToEdit?.type || 'call');
  const [priority, setPriority] = useState<TaskItem['priority']>(taskToEdit?.priority || 'Alta');

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const getAssignedNames = () => {
    if (selectedUserIds.length === 0) return 'Isadora Rossetto (Sua Conta)';
    const names = users.filter(u => selectedUserIds.includes(u.id)).map(u => u.name);
    return names.length > 0 ? names.join(', ') : 'Isadora Rossetto';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedNames = getAssignedNames();
    const primaryUserId = selectedUserIds[0] || '';

    if (taskToEdit && onUpdateTask) {
      onUpdateTask({
        ...taskToEdit,
        title: title.trim(),
        leadName: leadName || 'Geral / Sem Lead',
        dueDate,
        dueTime,
        type,
        priority,
        assignedUserId: primaryUserId,
        assignedUserIds: selectedUserIds,
        assignedUserName: assignedNames,
        assignedUserNames: selectedUserIds.map(id => users.find(u => u.id === id)?.name || '')
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
        assignedUserId: primaryUserId,
        assignedUserIds: selectedUserIds,
        assignedUserName: assignedNames,
        assignedUserNames: selectedUserIds.map(id => users.find(u => u.id === id)?.name || '')
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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

          {/* Multi-user Assignment */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <UserCheck size={14} className="text-growie-purple" /> Membros da Equipe Responsáveis:
              </span>
              <span className="text-[10px] text-growie-purple font-mono font-bold">
                {selectedUserIds.length} selecionado(s)
              </span>
            </label>
            <div className="p-2.5 bg-growie-bg border border-slate-200 rounded-xl space-y-1.5 max-h-32 overflow-y-auto">
              <label className="flex items-center gap-2 text-xs font-bold text-growie-purple cursor-pointer p-1 rounded hover:bg-purple-50">
                <input
                  type="checkbox"
                  checked={selectedUserIds.length === 0}
                  onChange={() => setSelectedUserIds([])}
                  className="rounded accent-growie-purple"
                />
                <span>-- Isadora Rossetto (Sua Conta) --</span>
              </label>
              {users.map((u) => (
                <label key={u.id} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer p-1 rounded hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(u.id)}
                    onChange={() => toggleUserSelection(u.id)}
                    className="rounded accent-growie-purple"
                  />
                  <span>👤 {u.name} ({u.role})</span>
                </label>
              ))}
            </div>
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
              <label className="block font-bold text-slate-700 mb-1">Tipo de Ação / Categoria</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple cursor-pointer"
              >
                <option value="demanda_interna">⚙️ Demanda Interna</option>
                <option value="resolucao_pepinos">🔥 Resolução de Pepinos</option>
                <option value="cobranca">💰 Cobrança / Financeiro</option>
                <option value="follow_up">📞 Follow-up Comercial</option>
                <option value="call">📞 Ligação Telefônica</option>
                <option value="meeting">🤝 Reunião Agendada</option>
                <option value="proposal">📄 Envio de Proposta</option>
                <option value="whatsapp">💬 Mensagem WhatsApp</option>
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
