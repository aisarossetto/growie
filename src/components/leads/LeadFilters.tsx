import React from 'react';
import { Search, Filter, RefreshCw, Flame, SlidersHorizontal, Folder } from 'lucide-react';
import { LeadSource } from '../../types';

interface LeadFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedSource: string;
  setSelectedSource: (source: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  leadGroups?: { id: string; name: string }[];
  scoreFilter: 'all' | 'hot' | 'warm' | 'cold';
  setScoreFilter: (score: 'all' | 'hot' | 'warm' | 'cold') => void;
  isFollowUpFilter: boolean;
  setIsFollowUpFilter: (val: boolean) => void;
  onReset: () => void;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedSource,
  setSelectedSource,
  selectedStatus,
  setSelectedStatus,
  selectedTag,
  setSelectedTag,
  selectedGroup,
  setSelectedGroup,
  leadGroups = [],
  scoreFilter,
  setScoreFilter,
  isFollowUpFilter,
  setIsFollowUpFilter,
  onReset,
}) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card-soft space-y-3">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar Input */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por nome, empresa, e-mail, telefone ou responsável..."
            className="w-full pl-9 pr-3 py-2 bg-growie-bg border border-slate-200 rounded-xl text-xs text-growie-dark focus:outline-none focus:border-growie-purple"
          />
        </div>

        {/* Quick Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Flame size={14} className="text-rose-500" /> Temperatura:
          </span>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'hot', label: 'Quente' },
            { id: 'warm', label: 'Morno' },
            { id: 'cold', label: 'Frio' },
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => setScoreFilter(sc.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                scoreFilter === sc.id
                  ? 'bg-growie-purple text-white shadow-sm'
                  : 'bg-growie-bg text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sc.label}
            </button>
          ))}

          <button
            onClick={() => setIsFollowUpFilter(!isFollowUpFilter)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors border ${
              isFollowUpFilter
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                : 'bg-growie-bg text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            Filtro de Follow-up (Pendente)
          </button>
        </div>
      </div>

      {/* Dynamic Folder Quick Selector Bar */}
      {leadGroups.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100 font-sans">
          <span className="text-[11px] font-extrabold text-growie-purple uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Folder size={14} className="text-growie-purple" /> Pastas Ativas:
          </span>
          <button
            type="button"
            onClick={() => setSelectedGroup('')}
            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all border ${
              !selectedGroup
                ? 'bg-growie-purple text-white border-growie-purple shadow-xs font-extrabold'
                : 'bg-purple-50/50 text-slate-600 border-slate-200 hover:bg-purple-100'
            }`}
          >
            Todas as Pastas ({leadGroups.length})
          </button>

          {leadGroups.map((g) => {
            const isSelected = selectedGroup === g.id || selectedGroup === g.name;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGroup(isSelected ? '' : g.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-growie-purple text-white border-growie-purple shadow-xs font-extrabold'
                    : 'bg-purple-50/70 text-growie-purple border-purple-200 hover:bg-purple-100'
                }`}
              >
                <span>📁 {g.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Advanced Select Filters Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-[10px] font-bold text-growie-purple uppercase tracking-wider mb-1">
            Pasta / Grupo
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full py-1.5 px-2 bg-purple-50/70 border border-purple-200 rounded-lg text-xs font-bold text-growie-purple focus:outline-none focus:border-growie-purple"
          >
            <option value="">Todas as Pastas ({leadGroups.length})</option>
            {leadGroups.map((g) => (
              <option key={g.id} value={g.id}>
                📁 {g.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Origem / Canal do Lead
          </label>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full py-1.5 px-2 bg-growie-bg border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-growie-purple"
          >
            <option value="">Todas as Origens</option>
            <option value="Meta Ads">Meta Ads</option>
            <option value="Google Ads">Google Ads</option>
            <option value="LinkedIn Ads">LinkedIn Ads</option>
            <option value="Prospecção Fria">Prospecção Fria</option>
            <option value="Lista Enviada">Lista Enviada (CSV)</option>
            <option value="Orgânico">Orgânico</option>
            <option value="Indicação">Indicação</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Status Comercial
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full py-1.5 px-2 bg-growie-bg border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-growie-purple"
          >
            <option value="">Todos os Status</option>
            <option value="Novo">Novo</option>
            <option value="Qualificado">Qualificado</option>
            <option value="Em Negociação">Em Negociação</option>
            <option value="Convertido">Convertido</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Tag de Segmento
          </label>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full py-1.5 px-2 bg-growie-bg border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-growie-purple"
          >
            <option value="">Todas as Tags</option>
            <option value="Decisor">Decisor</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Meta Ads">Meta Ads</option>
            <option value="Parceiro">Parceiro</option>
          </select>
        </div>

        <div className="flex items-end col-span-2 sm:col-span-1">
          <button
            onClick={onReset}
            className="w-full py-1.5 px-3 bg-growie-bg hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 flex items-center justify-center gap-1 transition-colors"
          >
            <RefreshCw size={12} /> Limpar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};
