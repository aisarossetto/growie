import React, { useState } from 'react';
import { 
  GitPullRequest, 
  Plus, 
  DollarSign, 
  Calendar, 
  Tag, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Building2,
  TrendingUp,
  X,
  Save,
  ChevronRight,
  ArrowRight,
  UserCheck
} from 'lucide-react';

import { DealCard, StageInfo, KanbanStageId, Lead } from '../../types';

interface KanbanBoardProps {
  stages: StageInfo[];
  deals: DealCard[];
  leads?: Lead[];
  onMoveDeal: (dealId: string, newStageId: KanbanStageId) => void;
  onAddDeal: (deal: DealCard) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  stages,
  deals,
  leads = [],
  onMoveDeal,
  onAddDeal,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [value, setValue] = useState('25000');
  const [stageId, setStageId] = useState<KanbanStageId>('lead_recebido');
  const [priority, setPriority] = useState<DealCard['priority']>('Alta');

  const totalValue = deals.reduce((acc, d) => acc + d.value, 0);

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    const found = leads.find(l => l.id === leadId);
    if (found) {
      setTitle(`Oportunidade - ${found.company}`);
      setCompany(found.company);
      setContactName(found.name);
      setContactEmail(found.email);
      setContactPhone(found.phone);
      setValue(found.value ? found.value.toString() : '25000');
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;

    const newDeal: DealCard = {
      id: 'd_' + Date.now(),
      title,
      company,
      contactName,
      contactEmail,
      contactPhone: contactPhone || '+55 11 99999-0000',
      leadId: selectedLeadId || undefined,
      value: parseFloat(value) || 0,
      stageId,
      status: 'em_andamento',
      tags: ['Novo Negócio'],
      priority,
      updatedAt: 'Agora mesmo'
    };

    onAddDeal(newDeal);
    setIsAddModalOpen(false);
    setSelectedLeadId('');
    setTitle('');
    setCompany('');
    setContactName('');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-growie-dark font-sans tracking-tight flex items-center gap-2">
            <GitPullRequest className="text-growie-purple" /> Funil Visual de Vendas (Kanban 7 Estágios)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Arraste ou mova os cartões de negócios entre os estágios comerciais. Rolagem horizontal ativada.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-growie-purple/10 border border-growie-purple/20 text-xs">
            <span className="text-slate-500 font-bold">Pipeline Total:</span>{' '}
            <strong className="text-growie-purple font-extrabold font-sans">
              R$ {totalValue.toLocaleString('pt-BR')}
            </strong>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-cta text-white text-xs font-extrabold shadow-glow-lilac hover:opacity-95 transition-opacity flex items-center gap-1.5"
          >
            <Plus size={15} /> + Novo Negócio
          </button>
        </div>
      </div>

      {/* Kanban Board Container with Smooth Horizontal Scroll */}
      <div className="w-full overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-growie-purple/30 scrollbar-track-slate-100">
        <div className="flex gap-4 min-w-max px-1">
          {stages.map((stage) => {
            const stageDeals = deals.filter((d) => d.stageId === stage.id);
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

            return (
              <div
                key={stage.id}
                className="w-[310px] shrink-0 bg-white rounded-2xl border border-slate-200/80 shadow-card-soft flex flex-col max-h-[650px] overflow-hidden"
              >
                {/* Stage Header */}
                <div className={`p-4 border-b ${stage.color} space-y-1`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-xs text-growie-dark tracking-wide truncate">
                      {stage.title}
                    </h3>
                    <span className="text-[10px] font-extrabold font-mono px-2 py-0.5 rounded bg-white text-growie-dark shadow-xs border border-slate-200">
                      {stageDeals.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
                    <span>Taxa Conv: <strong>{stage.conversionRate}%</strong></span>
                    <span className="font-bold text-growie-purple">
                      R$ {stageTotal.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Cards List in Stage */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {stageDeals.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl">
                      Nenhum negócio nesta etapa
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="bg-growie-bg p-4 rounded-xl border border-slate-200 shadow-card-soft hover:border-growie-purple/40 hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-extrabold text-xs text-growie-dark font-sans leading-tight">
                              {deal.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <Building2 size={12} className="text-growie-purple" /> {deal.company}
                            </p>
                          </div>

                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            deal.priority === 'Alta' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {deal.priority}
                          </span>
                        </div>

                        <div className="text-xs font-extrabold text-growie-purple font-sans">
                          R$ {deal.value.toLocaleString('pt-BR')}
                        </div>

                        {/* Card Footer & Stage Mover */}
                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-mono">{deal.updatedAt}</span>

                          {/* Fast Move Dropdown */}
                          <select
                            value={deal.stageId}
                            onChange={(e) => onMoveDeal(deal.id, e.target.value as KanbanStageId)}
                            className="p-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-growie-dark focus:border-growie-purple cursor-pointer"
                          >
                            {stages.map((s) => (
                              <option key={s.id} value={s.id}>
                                Mover &rarr; {s.title.slice(0, 15)}...
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Deal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-dark-purple p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitPullRequest size={18} className="text-growie-cyan" />
                <h3 className="font-extrabold text-sm">Adicionar Novo Negócio no Kanban</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-300 hover:text-white p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
              {/* Select Existing Lead */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <UserCheck size={14} className="text-growie-purple" /> Vincular Lead Existente da Base (Opcional)
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => handleSelectLead(e.target.value)}
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-purple focus:border-growie-purple"
                >
                  <option value="">-- Criar Negócio Avulso --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      📌 {l.name} ({l.company}) - R$ {l.value?.toLocaleString('pt-BR')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Título da Oportunidade *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Implementação CRM Enterprise"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome da Empresa *</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ex: FintechX Brasil"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor do Contrato (R$)</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estágio Inicial</label>
                  <select
                    value={stageId}
                    onChange={(e) => setStageId(e.target.value as any)}
                    className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold"
                  >
                    {stages.map((s) => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-cta text-white font-extrabold text-xs shadow-glow-lilac hover:opacity-95 flex items-center justify-center gap-1.5"
              >
                <Save size={14} /> Salvar no Funil Kanban
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
