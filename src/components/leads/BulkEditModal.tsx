import React, { useState } from 'react';
import { X, CheckSquare, Save, Users, Moon, Sun } from 'lucide-react';
import { Lead, LeadSource } from '../../types';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeadIds: string[];
  onApplyBulkEdit: (updates: {
    status?: Lead['status'];
    responsibleName?: string;
    source?: LeadSource;
    isSleeping?: boolean;
  }) => void;
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  isOpen,
  onClose,
  selectedLeadIds,
  onApplyBulkEdit,
}) => {
  if (!isOpen) return null;

  const [status, setStatus] = useState<Lead['status'] | ''>('');
  const [responsibleName, setResponsibleName] = useState('');
  const [source, setSource] = useState<LeadSource | ''>('');
  const [isSleepingOption, setIsSleepingOption] = useState<'keep' | 'sleep' | 'activate'>('keep');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: any = {};
    if (status) updates.status = status;
    if (responsibleName) updates.responsibleName = responsibleName;
    if (source) updates.source = source;
    if (isSleepingOption === 'sleep') updates.isSleeping = true;
    if (isSleepingOption === 'activate') updates.isSleeping = false;

    onApplyBulkEdit(updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-dark-purple p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare size={18} className="text-growie-cyan" />
            <h3 className="font-extrabold text-sm">Edição em Massa ({selectedLeadIds.length} leads)</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Novo Status Comercial</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full p-2 bg-growie-bg border border-slate-200 rounded-xl font-medium focus:border-growie-purple"
            >
              <option value="">-- Não alterar status --</option>
              <option value="Novo">Novo</option>
              <option value="Qualificado">Qualificado</option>
              <option value="Em Negociação">Em Negociação</option>
              <option value="Convertido">Convertido</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Novo Responsável (SDR/Closer)</label>
            <input
              type="text"
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
              placeholder="Deixe em branco para não alterar"
              className="w-full p-2 bg-growie-bg border border-slate-200 rounded-xl font-medium focus:border-growie-purple"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nova Origem / Canal</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as any)}
              className="w-full p-2 bg-growie-bg border border-slate-200 rounded-xl font-medium focus:border-growie-purple"
            >
              <option value="">-- Não alterar origem --</option>
              <option value="Meta Ads">Meta Ads</option>
              <option value="Google Ads">Google Ads</option>
              <option value="LinkedIn Ads">LinkedIn Ads</option>
              <option value="Prospecção Fria">Prospecção Fria</option>
              <option value="Lista Enviada">Lista Enviada</option>
              <option value="Orgânico">Orgânico</option>
              <option value="Indicação">Indicação</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Status de Arquivamento / Pasta</label>
            <select
              value={isSleepingOption}
              onChange={(e) => setIsSleepingOption(e.target.value as any)}
              className="w-full p-2 bg-growie-bg border border-slate-200 rounded-xl font-medium focus:border-growie-purple"
            >
              <option value="keep">-- Manter localização atual --</option>
              <option value="sleep">Mover para Pasta de Adormecidos / Arquivados</option>
              <option value="activate">Mover para Lista de Leads Ativos</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-cta text-white font-extrabold text-xs shadow-glow-lilac hover:opacity-95 flex items-center justify-center gap-1.5"
          >
            <Save size={14} /> Aplicar Alterações em {selectedLeadIds.length} Leads
          </button>
        </form>
      </div>
    </div>
  );
};
