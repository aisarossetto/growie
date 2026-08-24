import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Search, 
  Filter, 
  Flame, 
  Moon, 
  Sun, 
  UserCheck, 
  CheckSquare, 
  Square, 
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowUpDown,
  Download,
  Plus,
  UserPlus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  CheckCircle2,
  CheckSquare2,
  XSquare,
  FolderPlus,
  Star
} from 'lucide-react';
import { DEFAULT_USER_AVATAR } from '../../types';

import { Lead, LeadSource, LeadGroup } from '../../types';
import { apiService } from '../../services/api';
import { LeadFilters } from './LeadFilters';
import { LeadDetailDrawer } from './LeadDetailDrawer';
import { BulkEditLeadsModal } from './BulkEditLeadsModal';
import { MassLeadImportModal } from './MassLeadImportModal';
import { SingleLeadModal } from './SingleLeadModal';
import { LeadGroupManagerModal } from './LeadGroupManagerModal';

interface LeadsViewProps {
  leads: Lead[];
  onAddLeads: (newLeads: Partial<Lead>[]) => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onBulkUpdateLeads: (leadIds: string[], updates: Partial<Lead>) => void;
  onDeleteLeads?: (ids: string[]) => void;
  onNavigateTab: (tab: any) => void;
  users?: { name: string }[];
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  onAddLeads,
  onUpdateLead,
  onBulkUpdateLeads,
  onDeleteLeads,
  onNavigateTab,
  users = [{ name: 'Isadora Rossetto' }, { name: 'Carlos Silva' }]
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'featured' | 'sleeping'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isFollowUpFilter, setIsFollowUpFilter] = useState(false);

  // Modals & Selection State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [isMassImportOpen, setIsMassImportOpen] = useState(false);
  const [isSingleLeadOpen, setIsSingleLeadOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [preselectedFolderForImport, setPreselectedFolderForImport] = useState<string | undefined>(undefined);
  const [leadGroups, setLeadGroups] = useState<LeadGroup[]>(() => apiService.getLeadGroups());
  const [notification, setNotification] = useState<string | null>(null);

  // Synchronized Dual Scrollbar Refs for Horizontal Navigation at ANY Height
  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  const handleTopScroll = () => {
    if (topScrollRef.current && tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const handleTableScroll = () => {
    if (topScrollRef.current && tableScrollRef.current) {
      topScrollRef.current.scrollLeft = tableScrollRef.current.scrollLeft;
    }
  };

  const scrollLeftBy = (amount: number) => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSource('');
    setSelectedStatus('');
    setSelectedTag('');
    setSelectedGroup('');
    setScoreFilter('all');
    setIsFollowUpFilter(false);
  };

  // Filtered & Engagement-sorted leads list
  const filteredLeads = leads
    .filter((lead) => {
      // Tab filter
      if (activeTab === 'active' && lead.isSleeping) return false;
      if (activeTab === 'featured' && (!lead.isFeatured || lead.isSleeping)) return false;
      if (activeTab === 'sleeping' && !lead.isSleeping) return false;

      // Group / Folder filter
      if (selectedGroup) {
        const grpObj = leadGroups.find(g => g.id === selectedGroup || g.name === selectedGroup);
        const isInGroup = (lead.groups && (lead.groups.includes(selectedGroup) || lead.groups.includes(grpObj?.name || ''))) ||
                          (lead.tags && (lead.tags.includes(selectedGroup) || lead.tags.includes(grpObj?.name || ''))) ||
                          (grpObj && grpObj.leadIds && grpObj.leadIds.includes(lead.id));
        if (!isInGroup) return false;
      }

      // Follow-up filter (leads waiting response)
      if (isFollowUpFilter && lead.timeline.whatsappSent && lead.timeline.whatsappResponded) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = lead.name.toLowerCase().includes(q);
        const matchesCompany = lead.company.toLowerCase().includes(q);
        const matchesEmail = lead.email.toLowerCase().includes(q);
        const matchesResp = lead.responsibleName.toLowerCase().includes(q);
        if (!matchesName && !matchesCompany && !matchesEmail && !matchesResp) return false;
      }

      // Score filter
      if (scoreFilter === 'hot' && lead.score < 70) return false;
      if (scoreFilter === 'warm' && (lead.score < 40 || lead.score >= 70)) return false;
      if (scoreFilter === 'cold' && lead.score >= 40) return false;

      // Dropdown Source filter
      if (selectedSource && lead.source !== selectedSource) return false;

      // Dropdown Status filter
      if (selectedStatus && lead.status !== selectedStatus) return false;

      // Tag filter
      if (selectedTag && !lead.tags.includes(selectedTag)) return false;

      return true;
    })
    .sort((a, b) => b.score - a.score);

  const handleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedLeadIds.length === 0) return;
    if (onDeleteLeads) {
      onDeleteLeads(selectedLeadIds);
      setNotification(`${selectedLeadIds.length} leads foram excluídos permanentemente.`);
      setTimeout(() => setNotification(null), 3500);
      setSelectedLeadIds([]);
    }
  };

  const handleDeleteSingleLead = (id: string, name: string) => {
    if (onDeleteLeads) {
      onDeleteLeads([id]);
      setNotification(`Lead "${name}" foi excluído.`);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="space-y-6 font-sans relative">
      {notification && (
        <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between text-xs font-bold animate-in fade-in">
          <span>{notification}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-growie-dark font-sans tracking-tight">
            Base Central de Leads & Inteligência 360°
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestão completa de contatos, importação em massa (CSV/Excel/PDF) e edição em lote.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsSingleLeadOpen(true)}
            aria-label="Cadastrar Novo Lead"
            className="px-3.5 py-2.5 rounded-xl bg-gradient-cta text-white text-xs font-extrabold shadow-glow-lilac hover:opacity-95 transition-opacity flex items-center gap-1.5"
          >
            <UserPlus size={15} /> + Cadastrar Lead
          </button>

          <button
            onClick={() => setIsMassImportOpen(true)}
            aria-label="Importar Leads em Massa"
            className="px-4 py-2.5 rounded-xl bg-growie-purple text-white text-xs font-extrabold shadow-glow-lilac hover:bg-purple-800 transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet size={15} /> Importar Leads em Massa (CSV / Excel / PDF)
          </button>

          <button
            onClick={() => setIsGroupModalOpen(true)}
            aria-label="Gerenciar Pastas de Leads"
            className="px-3.5 py-2.5 rounded-xl bg-purple-50 text-growie-purple text-xs font-extrabold border border-purple-200 hover:bg-purple-100 transition-colors flex items-center gap-1.5"
          >
            <FolderPlus size={15} /> Gerenciar Pastas
          </button>
        </div>
      </div>

      {/* Primary Tabs: Leads Ativos vs Destacados vs Leads Adormecidos */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('active');
              setSelectedLeadIds([]);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-growie-purple text-white shadow-glow-lilac'
                : 'bg-white text-slate-600 hover:text-growie-dark border border-slate-200'
            }`}
          >
            <Flame size={15} className="text-growie-cyan" /> Base Principal ({leads.filter(l => !l.isSleeping).length})
          </button>

          <button
            onClick={() => {
              setActiveTab('featured');
              setSelectedLeadIds([]);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-2 ${
              activeTab === 'featured'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-white text-slate-600 hover:text-growie-dark border border-slate-200'
            }`}
          >
            <Star size={15} className="fill-amber-500 text-amber-500" /> Leads Destacados ({leads.filter(l => l.isFeatured && !l.isSleeping).length})
          </button>

          <button
            onClick={() => {
              setActiveTab('sleeping');
              setSelectedLeadIds([]);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-2 ${
              activeTab === 'sleeping'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-growie-dark border border-slate-200'
            }`}
          >
            <Moon size={15} className="text-amber-400" /> Leads Adormecidos ({leads.filter(l => l.isSleeping).length})
          </button>
        </div>

        <span className="text-[11px] font-semibold text-emerald-700 font-mono hidden md:flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shrink-0" /> Linha Inteira Verde Claro = Lead Quente
        </span>
      </div>

      {/* Filter Toolbar */}
      <LeadFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        leadGroups={leadGroups}
        scoreFilter={scoreFilter}
        setScoreFilter={setScoreFilter}
        isFollowUpFilter={isFollowUpFilter}
        setIsFollowUpFilter={setIsFollowUpFilter}
        onReset={handleResetFilters}
      />

      {/* PROMINENT BULK SELECTION CONTROLS BAR ABOVE TABLE */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <CheckSquare2 size={15} className="text-growie-cyan" />
            {selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0
              ? 'Desmarcar Todos'
              : `Selecionar Todos (${filteredLeads.length} Leads)`}
          </button>

          {selectedLeadIds.length > 0 && (
            <button
              onClick={() => setSelectedLeadIds([])}
              className="text-xs text-slate-400 hover:text-white underline flex items-center gap-1"
            >
              <XSquare size={13} /> Limpar Seleção ({selectedLeadIds.length})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBulkEditOpen(true)}
            disabled={selectedLeadIds.length === 0}
            className="px-4 py-2 rounded-xl bg-growie-purple hover:bg-purple-800 disabled:opacity-40 text-white font-extrabold text-xs shadow-glow-lilac transition-all flex items-center gap-1.5"
          >
            <Edit2 size={14} /> Editar em Massa {selectedLeadIds.length > 0 ? `(${selectedLeadIds.length})` : ''}
          </button>

          <button
            onClick={handleBulkDelete}
            disabled={selectedLeadIds.length === 0}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5"
          >
            <Trash2 size={14} /> Excluir Selecionados {selectedLeadIds.length > 0 ? `(${selectedLeadIds.length})` : ''}
          </button>
        </div>
      </div>

      {/* Main Leads Table Card with Synchronized Sticky Horizontal Scrollbar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card-soft overflow-hidden relative">
        {/* Sticky Top Horizontal Scrollbar Control (Visible at ANY height of the leads list) */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-purple-50 via-white to-purple-50 border-b border-purple-200/80 px-4 py-2 flex items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="font-extrabold text-growie-purple text-[11px] flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal size={14} className="text-growie-purple" /> ↔️ Rolagem Horizontal (Disponível em Qualquer Altura da Lista):
            </span>
            {/* Top Synchronized Scrollbar Container */}
            <div
              ref={topScrollRef}
              onScroll={handleTopScroll}
              className="overflow-x-auto overflow-y-hidden flex-1 h-3 scrollbar-thin scrollbar-thumb-growie-purple scrollbar-track-purple-100 rounded-full"
            >
              <div className="h-full min-w-[1250px]" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => scrollLeftBy(-250)}
              className="px-2.5 py-1 rounded-xl bg-white border border-purple-200 text-growie-purple hover:bg-purple-100 font-extrabold text-[11px] shadow-xs flex items-center gap-1 transition-all"
              title="Rolar colunas para a esquerda"
            >
              <ChevronLeft size={14} /> Esquerda
            </button>
            <button
              type="button"
              onClick={() => scrollLeftBy(250)}
              className="px-2.5 py-1 rounded-xl bg-white border border-purple-200 text-growie-purple hover:bg-purple-100 font-extrabold text-[11px] shadow-xs flex items-center gap-1 transition-all"
              title="Rolar colunas para a direita"
            >
              Direita <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div
          ref={tableScrollRef}
          onScroll={handleTableScroll}
          className="overflow-x-auto"
        >
          <table className="w-full text-left border-collapse text-xs min-w-[1250px]">
            <thead>
              <tr className="bg-growie-bg border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedLeadIds.length > 0 && selectedLeadIds.length === filteredLeads.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-growie-purple focus:ring-growie-purple cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4 min-w-[220px]">Lead / Empresa / Contato</th>
                <th className="py-3.5 px-4 min-w-[150px]">Telefone / WhatsApp</th>
                <th className="py-3.5 px-4 min-w-[160px]">Pastas / Grupos</th>
                <th className="py-3.5 px-4 min-w-[130px]">Setores</th>
                <th className="py-3.5 px-4 min-w-[140px]">Responsável (SDR)</th>
                <th className="py-3.5 px-4 min-w-[110px]">Origem</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Temperatura</th>
                <th className="py-3.5 px-4 text-center min-w-[180px]">Etapa / Jornada</th>
                <th className="py-3.5 px-4 text-right min-w-[120px]">Ação</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs font-semibold">
                    Nenhum lead encontrado. Clique em "📥 Importar Leads em Massa" para carregar arquivos CSV/Excel/PDF.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  const isResponded = lead.timeline?.whatsappResponded || lead.timeline?.conversationContinued || lead.status === 'Em Negociação' || lead.status === 'Convertido';
                  const isEmailOpened = lead.timeline?.emailOpened;

                  let temperature: '🔥 Quente' | '⛅ Morno' | '❄️ Frio' = '❄️ Frio';
                  let tempBadgeClass = 'bg-slate-100 text-slate-700 border-slate-300 font-bold';

                  if (isResponded) {
                    temperature = '🔥 Quente';
                    tempBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black shadow-xs';
                  } else if (isEmailOpened) {
                    temperature = '⛅ Morno';
                    tempBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300 font-bold shadow-xs';
                  } else {
                    temperature = '❄️ Frio';
                    tempBadgeClass = 'bg-slate-100 text-slate-700 border-slate-300 font-bold';
                  }

                  let stage = 'Cadastrado (Frio)';
                  let stageColor = 'bg-slate-100 text-slate-600 border-slate-200';

                  if (lead.status === 'Convertido' || lead.timeline?.conclusion === 'Ganhos') {
                    stage = 'Lead Fechado / Convertido';
                    stageColor = 'bg-emerald-600 text-white font-extrabold shadow-xs';
                  } else if (lead.status === 'Em Negociação' || lead.timeline?.counterProposal) {
                    stage = 'Negociação em Andamento';
                    stageColor = 'bg-purple-600 text-white font-extrabold shadow-xs';
                  } else if (lead.timeline?.proposalSent) {
                    stage = 'Proposta Enviada';
                    stageColor = 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
                  } else if (lead.timeline?.meetingScheduled) {
                    stage = 'Reunião Agendada';
                    stageColor = 'bg-cyan-100 text-cyan-900 border-cyan-300 font-bold';
                  } else if (lead.timeline?.whatsappResponded || lead.timeline?.conversationContinued) {
                    stage = 'Conversa Iniciada (Respondeu)';
                    stageColor = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold';
                  } else if (lead.timeline?.whatsappSent) {
                    stage = 'WhatsApp Enviado';
                    stageColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  } else if (lead.timeline?.emailOpened) {
                    stage = 'E-mail Aberto';
                    stageColor = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
                  } else if (lead.timeline?.emailReceived || lead.lastEmailModelSent) {
                    stage = 'E-mail Enviado';
                    stageColor = 'bg-blue-50 text-blue-800 border-blue-200';
                  } else {
                    stage = 'Cadastrado (Frio)';
                    stageColor = 'bg-slate-100 text-slate-600 border-slate-200';
                  }

                  return (
                    <tr
                      key={lead.id}
                      className={`transition-colors ${
                        temperature === '🔥 Quente'
                          ? 'bg-emerald-50/70 border-l-4 border-l-emerald-500 hover:bg-emerald-100/80'
                          : isSelected
                          ? 'bg-purple-100/70 border-l-4 border-l-growie-purple'
                          : 'hover:bg-growie-bg/60'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(lead.id)}
                          className="rounded border-slate-300 text-growie-purple focus:ring-growie-purple cursor-pointer"
                        />
                      </td>

                      {/* Lead / Empresa / Contato */}
                      <td className="py-3.5 px-4">
                        <div 
                          onClick={() => setDetailLead(lead)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <img
                            src={lead.avatar || DEFAULT_USER_AVATAR}
                            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_USER_AVATAR; }}
                            alt={lead.name}
                            className={`w-9 h-9 rounded-full object-cover ring-2 transition-all ${
                              temperature === '🔥 Quente' ? 'ring-emerald-500' : 'ring-growie-purple/20'
                            }`}
                          />
                          <div>
                            <p className="font-extrabold text-growie-dark group-hover:text-growie-purple transition-colors flex items-center gap-1.5 text-xs">
                              🏢 {lead.company || 'Empresa Sem Nome'}
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide border ${tempBadgeClass}`}>
                                {temperature}
                              </span>
                            </p>

                            <p className="text-[11px] text-slate-600 font-semibold flex items-center gap-1">
                              <span>👤 {lead.name}</span>
                              <span className="text-slate-400 font-normal">({lead.role})</span>
                              {lead.city && (
                                <span className="text-[10px] text-cyan-700 font-bold bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200">
                                  🏙️ {lead.city}
                                </span>
                              )}
                              {lead.ramo && (
                                <span className="text-[10px] text-purple-800 font-bold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                                  🏢 {lead.ramo}
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">{lead.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Telefone / WhatsApp com Link Direto */}
                      <td className="py-3.5 px-4">
                        {lead.phone ? (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-mono font-bold hover:bg-emerald-100 transition-colors"
                            title="Abrir WhatsApp Web Direct"
                          >
                            📱 {lead.phone}
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Sem telefone</span>
                        )}
                      </td>

                      {/* Pastas / Grupos do Lead */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {lead.groups && lead.groups.length > 0 ? (
                            lead.groups.map((gId, gIdx) => (
                              <span key={gIdx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-growie-purple border border-purple-200">
                                📁 {gId}
                              </span>
                            ))
                          ) : lead.tags && lead.tags.length > 0 ? (
                            lead.tags.map((tId, tIdx) => (
                              <span key={tIdx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-growie-purple border border-purple-200">
                                🏷️ {tId}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Geral (Sem Pasta)</span>
                          )}
                        </div>
                      </td>

                      {/* Setores */}
                      <td className="py-3.5 px-4">
                        {lead.sectorContacts && lead.sectorContacts.length > 0 ? (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-900 border border-cyan-200" title={lead.sectorContacts.map(s => `${s.sectorName}: ${s.contactName} (${s.email})`).join('\n')}>
                            🏢 {lead.sectorContacts.length} Setores
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">0 setores</span>
                        )}
                      </td>

                      {/* Responsible SDR */}
                      <td className="py-3.5 px-4 font-semibold text-growie-purple">
                        {lead.responsibleName}
                      </td>

                      {/* Source Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-xs">
                          {lead.source}
                        </span>
                      </td>

                      {/* Temperatura */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block text-[11px] font-extrabold px-3 py-1 rounded-full border ${tempBadgeClass}`}>
                          {temperature}
                        </span>
                      </td>

                      {/* Etapa / Jornada */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block text-[10px] px-2.5 py-1 rounded-full border ${stageColor}`}>
                          {stage}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailLead(lead)}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 font-bold text-[11px] text-growie-purple transition-colors border border-slate-200 flex items-center gap-1"
                          >
                            <Edit2 size={12} /> Ver / Editar
                          </button>
                          <button
                            onClick={() => handleDeleteSingleLead(lead.id, lead.name)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                            title="Excluir Lead"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FLOATING FIXED BOTTOM ACTION PILL WHEN LEADS ARE SELECTED */}
      {selectedLeadIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-6 py-3 rounded-full border border-growie-cyan/50 shadow-2xl flex items-center gap-4 animate-in fade-in">
          <span className="font-extrabold text-growie-cyan text-xs">
            ⚡ {selectedLeadIds.length} leads selecionados
          </span>

          <div className="h-4 w-px bg-slate-700" />

          <button
            onClick={() => setIsBulkEditOpen(true)}
            className="px-4 py-1.5 rounded-full bg-growie-purple hover:bg-purple-800 text-white font-extrabold text-xs shadow-glow-lilac transition-all flex items-center gap-1"
          >
            <Edit2 size={13} /> Editar em Massa
          </button>

          <button
            onClick={handleBulkDelete}
            className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm transition-all flex items-center gap-1"
          >
            <Trash2 size={13} /> Excluir Selecionados
          </button>
        </div>
      )}

      {/* 360° Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={detailLead}
        isOpen={!!detailLead}
        availableGroups={leadGroups}
        onClose={() => setDetailLead(null)}
        onUpdateLead={(updated) => {
          onUpdateLead(updated);
          setDetailLead(updated);
        }}
      />

      {/* Bulk Edit Modal */}
      <BulkEditLeadsModal
        isOpen={isBulkEditOpen}
        onClose={() => setIsBulkEditOpen(false)}
        selectedCount={selectedLeadIds.length}
        users={users}
        availableGroups={leadGroups}
        onConfirmBulkEdit={(updates) => {
          onBulkUpdateLeads(selectedLeadIds, updates);
          setSelectedLeadIds([]);
          setNotification(`${selectedLeadIds.length} leads foram atualizados com sucesso!`);
          setTimeout(() => setNotification(null), 3500);
        }}
      />

      {/* Mass Import Modal */}
      <MassLeadImportModal
        isOpen={isMassImportOpen}
        onClose={() => {
          setIsMassImportOpen(false);
          setPreselectedFolderForImport(undefined);
        }}
        availableGroups={leadGroups}
        existingLeads={leads}
        defaultFolderName={preselectedFolderForImport}
        onImportLeads={(importedLeads) => {
          onAddLeads(importedLeads);

          const latestGroups = apiService.getLeadGroups();
          const updatedGroups = [...latestGroups];

          // Associate imported lead IDs to specified folders
          importedLeads.forEach((l) => {
            if (!l.id) return;
            const leadIdStr: string = l.id;

            (l.groups || []).forEach((gName) => {
              if (!gName) return;

              let existingGroup = updatedGroups.find((g) => g.name === gName || g.id === gName);
              if (existingGroup) {
                const combined = Array.from(new Set([...(existingGroup.leadIds || []), leadIdStr]));
                existingGroup.leadIds = combined;
              } else {
                const newGroup: LeadGroup = {
                  id: 'lg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
                  name: gName,
                  description: 'Pasta criada durante Importação em Massa de Leads',
                  color: 'purple',
                  leadIds: [leadIdStr]
                };
                updatedGroups.push(newGroup);
              }
            });
          });

          setLeadGroups(updatedGroups);
          apiService.saveLeadGroups(updatedGroups);

          setNotification(`${importedLeads.length} novos leads foram importados com sucesso e vinculados à pasta selecionada!`);
          setTimeout(() => setNotification(null), 4000);
          setPreselectedFolderForImport(undefined);
        }}
      />

      {/* Single Lead Modal */}
      <SingleLeadModal
        isOpen={isSingleLeadOpen}
        onClose={() => setIsSingleLeadOpen(false)}
        availableGroups={leadGroups}
        existingLeads={leads}
        onAddLead={(newLead) => onAddLeads([newLead])}
        currentUser="Isadora Rossetto"
      />

      {/* Lead Group Manager Modal */}
      <LeadGroupManagerModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        leads={leads}
        leadGroups={leadGroups}
        onSaveGroup={(groupToSave) => {
          // Update Lead Groups State & LocalStorage
          const existingGroup = leadGroups.find((g) => g.id === groupToSave.id);
          const oldName = existingGroup ? existingGroup.name : null;

          const updatedGroupsList = leadGroups.some((g) => g.id === groupToSave.id)
            ? leadGroups.map((g) => (g.id === groupToSave.id ? groupToSave : g))
            : [...leadGroups, groupToSave];

          setLeadGroups(updatedGroupsList);
          apiService.saveLeadGroups(updatedGroupsList);

          // Synchronize lead.groups array on ALL leads
          leads.forEach((l) => {
            const isAssigned = (groupToSave.leadIds || []).includes(l.id);
            let currentGroups = l.groups || [];

            // Remove old name if renamed
            if (oldName && oldName !== groupToSave.name) {
              currentGroups = currentGroups.filter((gName) => gName !== oldName);
            }

            if (isAssigned) {
              if (!currentGroups.includes(groupToSave.name)) {
                onUpdateLead({ ...l, groups: [...currentGroups, groupToSave.name] });
              } else if (oldName && oldName !== groupToSave.name) {
                onUpdateLead({ ...l, groups: currentGroups });
              }
            } else {
              if (currentGroups.includes(groupToSave.name)) {
                onUpdateLead({ ...l, groups: currentGroups.filter((gName) => gName !== groupToSave.name) });
              }
            }
          });

          setNotification(`Pasta "${groupToSave.name}" salva e vinculada a ${groupToSave.leadIds?.length || 0} lead(s) com sucesso!`);
          setTimeout(() => setNotification(null), 3000);
        }}
        onDeleteGroup={(groupId) => {
          const targetGroup = leadGroups.find((g) => g.id === groupId);
          const updatedGroups = leadGroups.filter((g) => g.id !== groupId);

          setLeadGroups(updatedGroups);
          apiService.saveLeadGroups(updatedGroups);

          if (selectedGroup === groupId || (targetGroup && selectedGroup === targetGroup.name)) {
            setSelectedGroup('');
          }

          setNotification(`Pasta "${targetGroup?.name || 'selecionada'}" excluída com sucesso!`);
          setTimeout(() => setNotification(null), 3000);
        }}
        onOpenMassImportForFolder={(folderName) => {
          setPreselectedFolderForImport(folderName);
          setIsGroupModalOpen(false);
          setIsMassImportOpen(true);
        }}
      />
    </div>
  );
};
