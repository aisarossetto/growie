import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Video, CheckCircle2, Clock, Building2, User, Globe, ChevronLeft, ChevronRight, Save, Edit2, Trash2, Mail, Check, Power, LogOut } from 'lucide-react';
import { CalendarEvent, Lead, ClientItem, User as UserType } from '../../types';
import { GmailOAuthModal } from './GmailOAuthModal';

interface CalendarViewProps {
  currentUser?: UserType;
  leads?: Lead[];
  clients?: ClientItem[];
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onUpdateEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  currentUser = { id: 'u1', name: 'Isadora Rossetto', email: 'isadoragschirmer', role: 'Admin', avatar: '' },
  leads = [],
  clients = [],
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
}) => {
  // Multi-user Agenda State
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');
  const [teamUsers] = useState([
    { id: 'u1', name: 'Isadora Rossetto', email: 'isadora.rossetto@gmail.com', avatar: '' },
    { id: 'u2', name: 'Carlos Silva', email: 'carlos.silva.growie@gmail.com', avatar: '' },
    { id: 'u3', name: 'Mariana Costa', email: 'mariana.costa.growie@gmail.com', avatar: '' }
  ]);

  const [userGmailMap, setUserGmailMap] = useState<Record<string, string>>({
    'u1': 'isadora.rossetto@gmail.com',
    'u2': 'carlos.silva.growie@gmail.com',
    'u3': 'mariana.costa.growie@gmail.com'
  });

  const [isGmailConnected, setIsGmailConnected] = useState(true);
  const [connectedGmail, setConnectedGmail] = useState<string | null>('isadora.rossetto@gmail.com');
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-08-15');
  const [time, setTime] = useState('14:30');
  const [endTime, setEndTime] = useState('15:30');
  const [assignedUserId, setAssignedUserId] = useState('u1');
  const [leadName, setLeadName] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('reuniao');
  const [attendeesInput, setAttendeesInput] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Google Meet (Online)');
  const [reminderMinutes, setReminderMinutes] = useState(15);

  const startEdit = (evt: CalendarEvent) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setDate(evt.date);
    setTime(evt.time);
    setEndTime(evt.endTime || '15:30');
    setAssignedUserId(evt.assignedUserId || 'u1');
    setLeadName(evt.leadName || '');
    setCompany(evt.company || '');
    setType(evt.type);
    setAttendeesInput(evt.attendeesEmails ? evt.attendeesEmails.join(', ') : '');
    setDescription(evt.description || '');
    setLocation(evt.location || 'Google Meet (Online)');
    setReminderMinutes(evt.reminderMinutes || 15);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingEvent(null);
    setTitle('');
    setDate('2026-08-15');
    setTime('14:30');
    setEndTime('15:30');
    setAssignedUserId('u1');
    setLeadName('');
    setCompany('');
    setType('reuniao');
    setAttendeesInput('');
    setDescription('');
    setLocation('Google Meet (Online)');
    setReminderMinutes(15);
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedUser = teamUsers.find(u => u.id === assignedUserId) || teamUsers[0];
    const attendeesList = attendeesInput
      .split(',')
      .map(e => e.trim())
      .filter(e => e.includes('@'));

    if (editingEvent) {
      onUpdateEvent({
        ...editingEvent,
        title,
        date,
        time,
        endTime,
        leadName,
        company,
        type,
        assignedUserId: assignedUser.id,
        assignedUserName: assignedUser.name,
        assignedUserEmail: assignedUser.email,
        attendeesEmails: attendeesList,
        description,
        location,
        reminderMinutes,
        syncedWithGoogle: true
      });
    } else {
      const newEvt: CalendarEvent = {
        id: 'cal_' + Date.now(),
        title,
        date,
        time,
        endTime,
        leadName: leadName || 'Cliente / Lead',
        company: company || 'Empresa Exemplo',
        meetUrl: `https://meet.google.com/grw-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`,
        syncedWithGoogle: true,
        type,
        assignedUserId: assignedUser.id,
        assignedUserName: assignedUser.name,
        assignedUserEmail: assignedUser.email,
        attendeesEmails: attendeesList,
        description,
        location,
        reminderMinutes
      };
      onAddEvent(newEvt);
    }

    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Google Gmail Calendar Sync */}
      <div className="bg-gradient-to-r from-blue-950 via-growie-dark to-growie-purple p-6 rounded-2xl border border-blue-400/30 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center justify-center font-bold shrink-0">
            <Mail size={24} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white font-sans tracking-tight flex items-center gap-2">
              <CalendarIcon size={20} className="text-blue-300" /> Agenda Comercial Google & Gmail
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {isGmailConnected && connectedGmail
                ? `Conectado via Gmail OAuth: ${connectedGmail} (Sincronização individual ativa)`
                : 'Conecte sua conta do Gmail para agendar reuniões diretamente no seu Google Calendar.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isGmailConnected && connectedGmail ? (
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-2 rounded-xl bg-emerald-600/90 text-white border border-emerald-400 font-bold text-xs flex items-center gap-1.5 shadow">
                <CheckCircle2 size={15} /> Gmail Conectado: {connectedGmail}
              </span>
              <button
                onClick={() => {
                  setIsGmailConnected(false);
                  setConnectedGmail(null);
                }}
                className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-colors"
                title="Desconectar Conta do Gmail"
              >
                <Power size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsOAuthModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs shadow-lg transition-colors flex items-center gap-1.5"
            >
              <Mail size={15} className="text-blue-600" /> Conectar Conta Gmail do Usuário
            </button>
          )}

          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg transition-colors flex items-center gap-1.5"
          >
            <Plus size={15} /> + Agendar Nova Reunião
          </button>
        </div>
      </div>

      {/* Multi-User Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-slate-700 flex items-center gap-1.5 shrink-0">
            <User size={15} className="text-growie-purple" /> Filtrar Agenda por Usuário:
          </span>
          <select
            value={selectedUserFilter}
            onChange={(e) => setSelectedUserFilter(e.target.value)}
            className="p-2 bg-growie-bg border border-slate-200 rounded-xl font-bold text-growie-purple focus:border-growie-purple focus:outline-none"
          >
            <option value="all">🌐 Todas as Agendas da Equipe</option>
            {teamUsers.map(u => (
              <option key={u.id} value={u.id}>
                👤 Agenda de {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
          <CheckCircle2 size={13} /> Sincronização em Tempo Real Ativa com o Google Calendar
        </div>
      </div>

      {/* Main Grid: Calendar View & Events Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-card-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-growie-dark text-sm flex items-center gap-2">
              <CalendarIcon size={16} className="text-growie-purple" /> Agosto de 2026
            </h3>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg bg-growie-bg text-slate-600 hover:bg-slate-200">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1.5 rounded-lg bg-growie-bg text-slate-600 hover:bg-slate-200">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-extrabold text-slate-400 uppercase">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-xs">
            {Array.from({ length: 31 }).map((_, idx) => {
              const dayNum = idx + 1;
              const hasEvent = events.some(e => {
                if (selectedUserFilter !== 'all' && e.assignedUserId && e.assignedUserId !== selectedUserFilter) return false;
                return e.date.endsWith(`-${dayNum < 10 ? '0' + dayNum : dayNum}`);
              });

              return (
                <div
                  key={idx}
                  className={`min-h-[64px] p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                    hasEvent
                      ? 'bg-blue-50/70 border-blue-200 ring-2 ring-blue-400/30'
                      : 'bg-growie-bg/50 border-slate-200 hover:bg-white'
                  }`}
                >
                  <span className={`font-bold text-[11px] ${hasEvent ? 'text-blue-900' : 'text-slate-700'}`}>
                    {dayNum}
                  </span>

                  {hasEvent && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono truncate">
                      Reunião
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Interactive Events List with Edit & Delete */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card-soft space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="font-extrabold text-growie-dark text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={15} className="text-growie-purple" /> Compromissos ({events.filter(e => selectedUserFilter === 'all' || e.assignedUserId === selectedUserFilter).length})
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
              ● Google Sync Ativo
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {events.filter(e => selectedUserFilter === 'all' || e.assignedUserId === selectedUserFilter).length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                Nenhum compromisso nesta agenda. Clique em "+ Agendar Nova Reunião" para adicionar.
              </div>
            ) : (
              events
                .filter(e => selectedUserFilter === 'all' || e.assignedUserId === selectedUserFilter)
                .map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 bg-growie-bg rounded-2xl border border-slate-200 space-y-2 hover:bg-slate-100/80 transition-colors shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-growie-dark text-xs">{evt.title}</h4>
                        {evt.assignedUserName && (
                          <span className="text-[10px] font-bold text-blue-700 font-mono block">
                            👤 Agenda: {evt.assignedUserName} ({evt.assignedUserEmail})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(evt)}
                          className="p-1 text-slate-500 hover:text-growie-purple hover:bg-white rounded"
                          title="Editar Reunião"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteEvent(evt.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Excluir Reunião"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1">
                      <p className="flex items-center gap-1 font-semibold">
                        <User size={12} className="text-growie-purple" /> Cliente: {evt.leadName} ({evt.company})
                      </p>
                      <p className="flex items-center gap-1 font-medium text-slate-500 font-mono">
                        <Clock size={12} className="text-blue-600" /> <strong className="text-blue-800">{evt.date}</strong> das <strong>{evt.time}</strong> até <strong>{evt.endTime || '15:30'}</strong>
                      </p>

                      {evt.attendeesEmails && evt.attendeesEmails.length > 0 && (
                        <div className="p-2 bg-blue-50/80 rounded-xl border border-blue-100 text-[10px] font-mono text-blue-900">
                          <strong className="block font-bold mb-0.5">👥 Convidados (Google Calendar):</strong>
                          {evt.attendeesEmails.join(', ')}
                        </div>
                      )}

                      {evt.description && (
                        <p className="text-[10px] text-slate-600 italic bg-white p-2 rounded-xl border border-slate-200">
                          "{evt.description}"
                        </p>
                      )}
                    </div>

                    {evt.meetUrl && (
                      <a
                        href={evt.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-[10px] hover:bg-emerald-700 transition-colors shadow mt-1"
                      >
                        <Video size={13} /> Entrar no Google Meet
                      </a>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Gmail OAuth Login Modal */}
      <GmailOAuthModal
        isOpen={isOAuthModalOpen}
        onClose={() => setIsOAuthModalOpen(false)}
        currentUser={currentUser}
        onConnectSuccess={(email) => {
          setIsGmailConnected(true);
          setConnectedGmail(email);
        }}
      />

      {/* Add / Edit Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden font-sans">
            <div className="bg-gradient-dark-purple p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon size={18} className="text-growie-cyan" />
                <h3 className="font-extrabold text-sm">
                  {editingEvent ? 'Editar Reunião no Google Calendar' : 'Agendar Reunião Comercial & Google Calendar'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs max-h-[540px] overflow-y-auto">
              {/* Responsible User Account */}
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 space-y-1">
                <label className="block font-bold text-blue-900 text-[11px]">Agenda do Usuário Responsável (Gmail OAuth)</label>
                <select
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                  className="w-full p-2 bg-white border border-blue-300 rounded-lg font-bold text-growie-purple focus:outline-none"
                >
                  {teamUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      👤 {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Título do Compromisso / Reunião *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Alinhamento Comercial & Demonstração SaaS Growie"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead / Cliente</label>
                  <input
                    type="text"
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Ex: Carolina Mendes"
                    className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Empresa</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ex: FintechX Brasil Ltda"
                    className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              {/* Attendees Emails Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Convidados / Participantes (E-mails separados por vírgula)</span>
                  <span className="text-[10px] text-blue-600 font-bold">Dispara convites pelo Google Calendar</span>
                </label>
                <input
                  type="text"
                  value={attendeesInput}
                  onChange={(e) => setAttendeesInput(e.target.value)}
                  placeholder="Ex: cliente@empresa.com, diretor@empresa.com, vendas@growie.com"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              {/* Date & Time Range */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 bg-growie-bg border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Início</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="14:30"
                    className="w-full p-2 bg-growie-bg border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Término</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="15:30"
                    className="w-full p-2 bg-growie-bg border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Location & Reminder */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Localização / Videochamada</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Google Meet ou Endereço Presencial"
                    className="w-full p-2 bg-growie-bg border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notificação de Lembrete</label>
                  <select
                    value={reminderMinutes}
                    onChange={(e) => setReminderMinutes(parseInt(e.target.value))}
                    className="w-full p-2 bg-growie-bg border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value={10}>10 minutos antes</option>
                    <option value={15}>15 minutos antes</option>
                    <option value={30}>30 minutos antes</option>
                    <option value={60}>1 hora antes</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pauta & Descrição da Reunião</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Insira detalhes da pauta, objetivos e informações adicionais para os participantes..."
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-medium text-[11px]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Save size={14} /> {editingEvent ? 'Salvar Alterações na Agenda' : '📅 Criar Reunião & Disparar Convites no Google Calendar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
