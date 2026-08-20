import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Flame, 
  Mail, 
  MessageSquare, 
  ArrowRight, 
  Check, 
  Trash2, 
  Sparkles,
  Clock,
  Calendar,
  AlertTriangle,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { AppNotification } from '../../types';
export type { AppNotification };

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAll,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'leads' | 'tasks'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filterTab === 'leads') return n.type === 'email_opened' || n.type === 'whatsapp_reply' || n.type === 'lead_advanced';
    if (filterTab === 'tasks') return n.type === 'task_overdue' || n.type === 'meeting_reminder';
    return true;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'email_opened':
        return <Mail size={15} className="text-growie-cyan" />;
      case 'whatsapp_reply':
        return <MessageSquare size={15} className="text-emerald-400" />;
      case 'lead_advanced':
        return <Zap size={15} className="text-growie-lilac" />;
      case 'task_overdue':
        return <AlertTriangle size={15} className="text-rose-400" />;
      case 'meeting_reminder':
        return <Calendar size={15} className="text-amber-400" />;
      default:
        return <Bell size={15} className="text-growie-purple" />;
    }
  };

  const getBadgeStyle = (type: AppNotification['type']) => {
    switch (type) {
      case 'email_opened':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'whatsapp_reply':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'lead_advanced':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'task_overdue':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'meeting_reminder':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <>
      {/* Backdrop overlay to close popover when clicking outside */}
      <div 
        className="fixed inset-0 z-40 bg-transparent" 
        onClick={onClose} 
      />

      {/* Dropdown Popover Card opening DOWNWARDS directly below Bell icon */}
      <div className="absolute right-0 top-full mt-3 w-80 sm:w-[420px] bg-slate-900 border border-growie-purple/50 rounded-2xl shadow-2xl z-50 overflow-hidden font-sans text-white animate-in fade-in duration-150 flex flex-col max-h-[520px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-growie-dark via-growie-purple to-slate-900 p-3.5 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-growie-cyan/20 text-growie-cyan border border-growie-cyan/30 flex items-center justify-center font-bold shrink-0">
              <Bell size={16} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-xs text-white">Central de Notificações Comerciais</h3>
              <p className="text-[10px] text-slate-300">E-mails lidos, WhatsApp, avanços e tarefas em atraso</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Tab Filters & Action Bar */}
        <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                filterTab === 'all' ? 'bg-growie-purple text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilterTab('leads')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                filterTab === 'leads' ? 'bg-growie-purple text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Leads
            </button>
            <button
              onClick={() => setFilterTab('tasks')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                filterTab === 'tasks' ? 'bg-growie-purple text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tarefas
            </button>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[10px] font-extrabold text-rose-400 hover:underline flex items-center gap-1 shrink-0"
            >
              <Trash2 size={11} /> Limpar
            </button>
          )}
        </div>

        {/* Notifications List Feed */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold space-y-2">
              <Bell size={24} className="mx-auto text-slate-600 mb-2 opacity-50" />
              <p className="font-extrabold text-slate-300">Nenhuma notificação no momento.</p>
              <p className="text-[11px] text-slate-500 font-normal max-w-xs mx-auto">
                Notificações 100% reais de e-mails lidos, agendamentos e tarefas serão exibidas aqui em tempo real à medida que ocorrerem.
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkAsRead(n.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 relative ${
                  !n.read 
                    ? 'bg-slate-800/90 border-growie-purple/60 shadow-md ring-1 ring-growie-purple/30' 
                    : 'bg-slate-900/60 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-[11px] text-white leading-tight">{n.title}</h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-growie-cyan animate-pulse shrink-0" />
                        )}
                      </div>
                      <span className={`inline-block text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold mt-0.5 ${getBadgeStyle(n.type)}`}>
                        {n.type === 'email_opened' ? 'E-mail Visto' : n.type === 'whatsapp_reply' ? 'WhatsApp Respondeu' : n.type === 'lead_advanced' ? 'Evolução Funil' : n.type === 'task_overdue' ? 'Tarefa Atrasada' : 'Reunião'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[9px] text-slate-400 font-mono shrink-0">{n.time}</span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed font-sans pl-9">
                  {n.description}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 text-center font-mono shrink-0">
          Eventos em tempo real da equipe comercial Growie
        </div>
      </div>
    </>
  );
};
