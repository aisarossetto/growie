import React, { useState } from 'react';
import { 
  X, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Tag, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  MessageSquare, 
  PhoneCall, 
  MapPin, 
  Briefcase, 
  Save, 
  Moon, 
  Sun,
  Flame,
  Star,
  Plus,
  Trash2
} from 'lucide-react';
import { Lead, LeadSource, LeadCompanySectorContact, LeadGroup, DEFAULT_USER_AVATAR } from '../../types';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateLead: (updatedLead: Lead) => void;
  availableGroups?: LeadGroup[];
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  isOpen,
  onClose,
  onUpdateLead,
  availableGroups = [
    { id: 'g1', name: '📂 Leads B2B', leadIds: [] },
    { id: 'g2', name: '📂 Campanha Meta Ads', leadIds: [] },
    { id: 'g3', name: '📂 Prospectos VIP', leadIds: [] }
  ],
}) => {
  if (!isOpen || !lead) return null;

  const [formData, setFormData] = useState<Lead>({ ...lead });
  const [isSaved, setIsSaved] = useState(false);
  const [newGroupInput, setNewGroupInput] = useState('');

  React.useEffect(() => {
    if (lead) {
      setFormData({
        ...lead,
        sectorContacts: lead.sectorContacts || []
      });
    }
  }, [lead]);

  const handleChange = (field: keyof Lead, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSectorContact = () => {
    const current = formData.sectorContacts || [];
    const newSector: LeadCompanySectorContact = {
      id: 'sec_' + Date.now(),
      sectorName: 'Compras',
      contactName: '',
      email: '',
      phone: '',
      role: ''
    };
    setFormData((prev) => ({
      ...prev,
      sectorContacts: [...current, newSector]
    }));
  };

  const handleRemoveSectorContact = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      sectorContacts: (prev.sectorContacts || []).filter((s) => s.id !== id)
    }));
  };

  const handleSectorChange = (id: string, field: keyof LeadCompanySectorContact, val: string) => {
    setFormData((prev) => ({
      ...prev,
      sectorContacts: (prev.sectorContacts || []).map((s) =>
        s.id === id ? { ...s, [field]: val } : s
      )
    }));
  };

  const handleTimelineChange = (timelineKey: keyof Lead['timeline'], value: any) => {
    setFormData((prev) => ({
      ...prev,
      timeline: {
        ...prev.timeline,
        [timelineKey]: value
      }
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateLead(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-growie-dark/70 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Drawer Header */}
          <div className="bg-gradient-dark-purple p-6 text-white flex items-center justify-between border-b border-growie-purple/30">
            <div className="flex items-center gap-3">
              <img
                src={formData.avatar || DEFAULT_USER_AVATAR}
                onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_USER_AVATAR; }}
                alt={formData.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-growie-cyan"
              />
              <div>
                {/* NOME PRINCIPAL: NOME DA EMPRESA */}
                <h3 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
                  🏢 {formData.company || 'Empresa Sem Nome'}
                  {formData.isFeatured && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400 text-growie-dark font-bold flex items-center gap-1">
                      <Star size={11} className="fill-growie-dark" /> Destaque Inicial
                    </span>
                  )}
                  {formData.isSleeping && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono flex items-center gap-1 border border-amber-500/30">
                      <Moon size={11} /> Adormecido
                    </span>
                  )}
                </h3>
                {/* SEGUNDO NOME: NOME DA PESSOA */}
                <p className="text-xs text-slate-300 font-medium">
                  👤 Contato Principal: <strong className="text-growie-cyan font-extrabold">{formData.name}</strong> ({formData.role})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const updated = { ...formData, isFeatured: !formData.isFeatured };
                  setFormData(updated);
                  onUpdateLead(updated);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  formData.isFeatured
                    ? 'bg-amber-400 text-growie-dark shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
                title={formData.isFeatured ? "Remover do Destaque" : "Destacar Lead"}
              >
                <Star size={14} className={formData.isFeatured ? 'fill-growie-dark' : ''} />
                {formData.isFeatured ? '⭐ Destacado' : '☆ Destacar'}
              </button>

              <button
                type="button"
                onClick={() => {
                  const updated = { ...formData, isSleeping: !formData.isSleeping };
                  setFormData(updated);
                  onUpdateLead(updated);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  formData.isSleeping
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                {formData.isSleeping ? <Sun size={14} /> : <Moon size={14} />}
                {formData.isSleeping ? '☀️ Reativar' : '🌙 Adormecer'}
              </button>

              <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Drawer Form Content */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {isSaved && (
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 font-bold flex items-center gap-2">
                <CheckCircle2 size={16} /> Dados do Lead atualizados no banco de dados com sucesso!
              </div>
            )}

            {/* General Info Grid */}
            <div className="bg-growie-bg p-4 rounded-2xl border border-slate-200/80 space-y-4">
              <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <User size={14} className="text-growie-purple" /> Informações Principais
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold focus:border-growie-purple"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">E-mail Profissional</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono focus:border-growie-purple"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono focus:border-growie-purple"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Nome da Empresa</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold focus:border-growie-purple"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Cidade / Estado (UF)</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Ex: São Paulo - SP"
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold focus:border-growie-purple text-cyan-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Ramo de Atuação / Ramo (Escrito)</label>
                  <input
                    type="text"
                    list="drawer-ramo-list"
                    value={formData.ramo || ''}
                    onChange={(e) => handleChange('ramo', e.target.value)}
                    placeholder="Ex: Tecnologia, Saúde, Varejo..."
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold focus:border-growie-purple text-purple-900"
                  />
                  <datalist id="drawer-ramo-list">
                    <option value="Tecnologia / Software" />
                    <option value="Saúde & Medicina" />
                    <option value="Varejo & E-commerce" />
                    <option value="Serviços Financeiros & Fintech" />
                    <option value="Indústria & Manufatura" />
                    <option value="Logística & Transportes" />
                    <option value="Educação & Cursos" />
                    <option value="Imobiliário & Construção" />
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Responsável (SDR/Closer)</label>
                  <input
                    type="text"
                    value={formData.responsibleName}
                    onChange={(e) => handleChange('responsibleName', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-growie-purple focus:border-growie-purple"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Iniciador / Captador</label>
                  <input
                    type="text"
                    value={formData.initiatorName}
                    onChange={(e) => handleChange('initiatorName', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium focus:border-growie-purple"
                  />
                </div>
              </div>
            </div>

            {/* Contatos por Setores da Empresa */}
            <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-growie-purple uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  🏢 Contatos por Setores da Empresa ({formData.company})
                </h4>
                <button
                  type="button"
                  onClick={handleAddSectorContact}
                  className="px-2.5 py-1 rounded-xl bg-growie-purple text-white font-extrabold text-[10px] shadow hover:bg-purple-800 flex items-center gap-1"
                >
                  <Plus size={12} /> + Adicionar Setor
                </button>
              </div>

              {(!formData.sectorContacts || formData.sectorContacts.length === 0) ? (
                <div className="p-4 text-center bg-white rounded-xl border border-purple-100 text-slate-500 font-medium text-xs">
                  Nenhum setor da empresa adicionado. Clique no botão <strong>"+ Adicionar Setor"</strong> acima para registrar contatos de Compras, RH, Financeiro, TI, etc.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.sectorContacts.map((sc) => (
                    <div key={sc.id} className="p-3 bg-white rounded-xl border border-purple-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={sc.sectorName}
                          onChange={(e) => handleSectorChange(sc.id, 'sectorName', e.target.value)}
                          className="p-1.5 bg-purple-50 border border-purple-200 rounded-lg font-extrabold text-growie-purple text-xs"
                        >
                          <option value="Compras">Compras</option>
                          <option value="RH">RH</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Decisor / CEO">Decisor / CEO</option>
                          <option value="Proprietário">Proprietário</option>
                          <option value="Financeiro">Financeiro</option>
                          <option value="TI">TI</option>
                          <option value="Outro">Outro</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveSectorContact(sc.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Remover Setor"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={sc.contactName}
                          onChange={(e) => handleSectorChange(sc.id, 'contactName', e.target.value)}
                          placeholder="Nome do Contato do Setor"
                          className="p-1.5 bg-growie-bg border border-slate-200 rounded-lg text-xs font-semibold"
                        />

                        <input
                          type="text"
                          value={sc.role || ''}
                          onChange={(e) => handleSectorChange(sc.id, 'role', e.target.value)}
                          placeholder="Cargo (ex: Gerente de Compras)"
                          className="p-1.5 bg-growie-bg border border-slate-200 rounded-lg text-xs"
                        />

                        <input
                          type="email"
                          value={sc.email}
                          onChange={(e) => handleSectorChange(sc.id, 'email', e.target.value)}
                          placeholder="E-mail do Setor"
                          className="p-1.5 bg-growie-bg border border-slate-200 rounded-lg text-xs font-mono"
                        />

                        <input
                          type="text"
                          value={sc.phone}
                          onChange={(e) => handleSectorChange(sc.id, 'phone', e.target.value)}
                          placeholder="Telefone / WhatsApp do Setor"
                          className="p-1.5 bg-growie-bg border border-slate-200 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MULTI-FOLDER / GROUP ASSIGNMENT EDITOR */}
            <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 space-y-2">
              <h4 className="font-extrabold text-growie-purple uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                📁 Pastas / Grupos do Lead (Pode selecionar mais de uma pasta)
              </h4>
              <p className="text-[10px] text-slate-500 font-medium">
                Vincule este lead a uma ou múltiplas pastas simultaneamente para organização avançada:
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {availableGroups.map((g) => {
                  const currentGroups = formData.groups || [];
                  const isSelected = currentGroups.includes(g.name) || currentGroups.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        let updated: string[];
                        if (isSelected) {
                          updated = currentGroups.filter((n) => n !== g.name && n !== g.id);
                        } else {
                          updated = [...currentGroups, g.name];
                        }
                        const newLead = { ...formData, groups: updated };
                        setFormData(newLead);
                        onUpdateLead(newLead);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 border shadow-xs ${
                        isSelected
                          ? 'bg-growie-purple text-white border-purple-800 shadow-glow-lilac'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-growie-purple'
                      }`}
                    >
                      <span>{g.name}</span>
                      {isSelected && <CheckCircle2 size={13} className="text-growie-cyan" />}
                    </button>
                  );
                })}

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newGroupInput}
                    onChange={(e) => setNewGroupInput(e.target.value)}
                    placeholder="+ Nova Pasta"
                    className="px-2 py-1 bg-white border border-slate-300 rounded-xl text-xs font-semibold w-28 focus:border-growie-purple focus:outline-none"
                  />
                  {newGroupInput.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        const formatted = newGroupInput.startsWith('📂') ? newGroupInput.trim() : `📂 ${newGroupInput.trim()}`;
                        const current = formData.groups || [];
                        if (!current.includes(formatted)) {
                          const updated = [...current, formatted];
                          const newLead = { ...formData, groups: updated };
                          setFormData(newLead);
                          onUpdateLead(newLead);
                        }
                        setNewGroupInput('');
                      }}
                      className="p-1 rounded-xl bg-growie-purple text-white font-bold text-xs"
                    >
                      <Plus size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Interest & Source Grid */}
            <div className="bg-growie-bg p-4 rounded-2xl border border-slate-200/80 space-y-4">
              <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Briefcase size={14} className="text-growie-cyan" /> Origem & Nível de Interesse
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Origem do Lead</label>
                  <select
                    value={formData.source}
                    onChange={(e) => handleChange('source', e.target.value as LeadSource)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold focus:border-growie-purple"
                  >
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="LinkedIn Ads">LinkedIn Ads</option>
                    <option value="Landing Page">Landing Page</option>
                    <option value="Prospecção Fria">Prospecção Fria</option>
                    <option value="Lista Enviada">Lista Enviada (CSV)</option>
                    <option value="Orgânico">Orgânico</option>
                    <option value="Indicação">Indicação</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Nível de Interesse</label>
                  <select
                    value={formData.interestLevel}
                    onChange={(e) => handleChange('interestLevel', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold focus:border-growie-purple"
                  >
                    <option value="Muito Alto">Muito Alto 🔥</option>
                    <option value="Alto">Alto</option>
                    <option value="Médio">Médio</option>
                    <option value="Baixo">Baixo ❄️</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-600 mb-1">Categoria de Interesse / Solução</label>
                  <input
                    type="text"
                    value={formData.interestCategory}
                    onChange={(e) => handleChange('interestCategory', e.target.value)}
                    placeholder="Ex: CRM Enterprise + WhatsApp API"
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium focus:border-growie-purple"
                  />
                </div>
              </div>
            </div>

            {/* Complete 360 Interaction Milestones Timeline */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card-soft space-y-3">
              <h4 className="font-extrabold text-growie-dark uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Clock size={14} className="text-growie-purple" /> Linha do Tempo & Marcos de Interação (360°)
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'emailReceived', label: 'E-mail Recebido' },
                  { key: 'emailOpened', label: 'E-mail Aberto' },
                  { key: 'whatsappSent', label: 'WhatsApp Enviado' },
                  { key: 'whatsappResponded', label: 'WhatsApp Respondido' },
                  { key: 'conversationContinued', label: 'Conversa Continuada' },
                  { key: 'callMade', label: 'Ligação Realizada' },
                  { key: 'inPersonVisit', label: 'Visita Presencial' },
                  { key: 'meetingScheduled', label: 'Reunião Agendada' },
                  { key: 'proposalSent', label: 'Proposta Enviada' },
                  { key: 'counterProposal', label: 'Contraproposta' },
                ].map((item) => {
                  const isChecked = (formData.timeline as any)[item.key];
                  return (
                    <label
                      key={item.key}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-[11px] font-semibold cursor-pointer transition-all ${
                        isChecked
                          ? 'border-growie-purple bg-growie-purple/10 text-growie-purple'
                          : 'border-slate-200 bg-growie-bg text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleTimelineChange(item.key as any, e.target.checked)}
                        className="rounded border-slate-300 text-growie-purple focus:ring-growie-purple"
                      />
                      <span className="truncate">{item.label}</span>
                    </label>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Status de Conclusão</label>
                  <select
                    value={formData.timeline.conclusion}
                    onChange={(e) => handleTimelineChange('conclusion', e.target.value)}
                    className="w-full p-2 bg-growie-bg border border-slate-200 rounded-xl font-bold focus:border-growie-purple"
                  >
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Ganhos">Fechado / Ganho</option>
                    <option value="Recusado">Recusado</option>
                    <option value="Sem Resposta">Sem Resposta</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Justificativa / Motivo</label>
                  <input
                    type="text"
                    value={formData.timeline.justification || ''}
                    onChange={(e) => handleTimelineChange('justification', e.target.value)}
                    placeholder="Ex: Ajuste de condições comerciais"
                    className="w-full p-2 bg-growie-bg border border-slate-200 rounded-xl font-medium focus:border-growie-purple"
                  />
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Observações & Anotações Comerciais</label>
              <textarea
                rows={4}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Insira detalhes adicionais sobre o comportamento e histórico do lead..."
                className="w-full p-3 bg-growie-bg border border-slate-200 rounded-xl font-medium text-slate-800 leading-relaxed focus:border-growie-purple"
              />
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-cta text-white font-extrabold text-xs shadow-glow-lilac hover:opacity-95 flex items-center gap-1.5"
              >
                <Save size={14} /> Salvar Alterações 360°
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
