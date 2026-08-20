import React, { useState } from 'react';
import { Edit2, Users, Save, X, CheckCircle2, Zap, FolderPlus } from 'lucide-react';
import { Lead, LeadGroup } from '../../types';

interface BulkEditLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirmBulkEdit: (updates: Partial<Lead>) => void;
  users: { name: string }[];
  availableGroups?: LeadGroup[];
}

export const BulkEditLeadsModal: React.FC<BulkEditLeadsModalProps> = ({
  isOpen,
  onClose,
  selectedCount,
  onConfirmBulkEdit,
  users,
  availableGroups = [
    { id: 'g1', name: '📂 Leads B2B', leadIds: [] },
    { id: 'g2', name: '📂 Campanha Meta Ads', leadIds: [] },
    { id: 'g3', name: '📂 Prospectos VIP', leadIds: [] }
  ],
}) => {
  const [responsibleName, setResponsibleName] = useState('');
  const [status, setStatus] = useState<Lead['status'] | ''>('');
  const [source, setSource] = useState<Lead['source'] | ''>('');
  const [interestLevel, setInterestLevel] = useState<Lead['interestLevel'] | ''>('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: Partial<Lead> = {};
    if (responsibleName) updates.responsibleName = responsibleName;
    if (status) updates.status = status;
    if (source) updates.source = source;
    if (interestLevel) updates.interestLevel = interestLevel;
    if (selectedGroups.length > 0) updates.groups = selectedGroups;

    if (Object.keys(updates).length === 0) return;

    onConfirmBulkEdit(updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in text-xs font-sans">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-dark-purple p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit2 size={18} className="text-growie-cyan" />
            <h3 className="font-extrabold text-sm">Editar em Massa ({selectedCount} Leads Selecionados)</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-growie-purple font-semibold text-[11px]">
            Selecione apenas os campos que deseja alterar simultaneamente nos <strong>{selectedCount} leads selecionados</strong>:
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Alterar Responsável Comercial</label>
            <select
              value={responsibleName}
              onChange={(e) => setResponsibleName(e.target.value)}
              className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
            >
              <option value="">-- Não alterar responsável --</option>
              {users.map((u, i) => (
                <option key={i} value={u.name}>{u.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Alterar Status no Funil</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
            >
              <option value="">-- Não alterar status --</option>
              <option value="Novo">Novo</option>
              <option value="Em Qualificação">Em Qualificação</option>
              <option value="Proposta Enviada">Proposta Enviada</option>
              <option value="Em Negociação">Em Negociação</option>
              <option value="Convertido">Convertido (Ganho)</option>
              <option value="Perdido">Perdido</option>
            </select>
          </div>

          {/* MULTI-FOLDER SELECTION IN BULK EDIT */}
          <div className="p-3.5 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2">
            <label className="block font-bold text-growie-purple text-xs flex items-center gap-1.5">
              <FolderPlus size={14} /> Atribuir Pastas (Pode marcar mais de uma)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableGroups.map((g) => {
                const isSelected = selectedGroups.includes(g.name);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedGroups(selectedGroups.filter((n) => n !== g.name));
                      } else {
                        setSelectedGroups([...selectedGroups, g.name]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-xl font-extrabold text-[11px] transition-all flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-growie-purple text-white border-purple-800 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-growie-purple'
                    }`}
                  >
                    <span>{g.name}</span>
                    {isSelected && <span>✓</span>}
                  </button>
                );
              })}
            </div>
            {selectedGroups.length > 0 && (
              <p className="text-[10px] text-growie-purple font-mono font-bold">
                ✓ Atribuindo a {selectedGroups.length} pasta(s): {selectedGroups.join(', ')}
              </p>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Alterar Origem / Canal</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as any)}
              className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
            >
              <option value="">-- Não alterar origem --</option>
              <option value="Meta Ads">Meta Ads (Facebook / Insta)</option>
              <option value="Google Ads">Google Ads</option>
              <option value="LinkedIn Outbound">LinkedIn Outbound</option>
              <option value="Indicação">Indicação</option>
              <option value="Importação em Massa">Importação em Massa</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Alterar Nível de Interesse</label>
            <select
              value={interestLevel}
              onChange={(e) => setInterestLevel(e.target.value as any)}
              className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
            >
              <option value="">-- Não alterar interesse --</option>
              <option value="Alto">Alto (Hot)</option>
              <option value="Médio">Médio (Warm)</option>
              <option value="Baixo">Baixo (Cold)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-growie-purple text-white font-extrabold shadow hover:bg-purple-800 flex items-center gap-1.5"
            >
              <Save size={15} /> Aplicar Alterações nos {selectedCount} Leads
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
