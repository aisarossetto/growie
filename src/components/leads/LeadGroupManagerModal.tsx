import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Folder, Edit2, Trash2, Save, Search, CheckSquare, Square, Users, Check, Plus, Tag, Upload } from 'lucide-react';
import { Lead, LeadGroup } from '../../types';

interface LeadGroupManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  leadGroups: LeadGroup[];
  onSaveGroup: (group: LeadGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onOpenMassImportForFolder?: (folderName: string) => void;
}

export const LeadGroupManagerModal: React.FC<LeadGroupManagerModalProps> = ({
  isOpen,
  onClose,
  leads = [],
  leadGroups = [],
  onSaveGroup,
  onDeleteGroup,
  onOpenMassImportForFolder,
}) => {
  if (!isOpen) return null;

  const [activeSubTab, setActiveSubTab] = useState<'list' | 'create'>('list');
  const [editingGroup, setEditingGroup] = useState<LeadGroup | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const startCreate = () => {
    setEditingGroup(null);
    setName('');
    setDescription('');
    setSelectedLeadIds([]);
    setSearchTerm('');
    setActiveSubTab('create');
  };

  const startEdit = (g: LeadGroup) => {
    setEditingGroup(g);
    setName(g.name);
    setDescription(g.description || '');
    // Find all leads that have g.id in their group or in g.leadIds
    const groupLeadIds = leads
      .filter((l) => (g.leadIds || []).includes(l.id) || (l.groups || []).includes(g.id))
      .map((l) => l.id);
    setSelectedLeadIds(groupLeadIds);
    setSearchTerm('');
    setActiveSubTab('create');
  };

  const filteredLeads = leads.filter((l) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
  });

  const handleToggleLead = (leadId: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const groupToSave: LeadGroup = {
      id: editingGroup ? editingGroup.id : 'lg_' + Date.now(),
      name: name.trim(),
      description: description.trim() || 'Pasta de leads customizada',
      color: editingGroup?.color || 'purple',
      leadIds: selectedLeadIds
    };

    onSaveGroup(groupToSave);
    setActiveSubTab('list');
    setEditingGroup(null);
  };

  // Helper to find groups a lead belongs to
  const getLeadGroupNames = (lead: Lead) => {
    const groupNames: string[] = [];
    leadGroups.forEach((g) => {
      if ((g.leadIds || []).includes(lead.id) || (lead.groups || []).includes(g.id)) {
        groupNames.push(g.name);
      }
    });
    return groupNames;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-growie-dark/85 backdrop-blur-md animate-in fade-in overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-growie-dark via-growie-purple to-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-growie-cyan/20 text-growie-cyan border border-growie-cyan/40 flex items-center justify-center font-bold">
              <FolderPlus size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Gerenciador de Pastas & Grupos de Leads</h3>
              <p className="text-xs text-slate-300">Crie, edite, adicione ou exclua pastas e selecione os destinatários</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-3 bg-growie-bg border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('list')}
              className={`px-4 py-1.5 rounded-xl font-extrabold text-xs transition-colors ${
                activeSubTab === 'list' ? 'bg-growie-purple text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              📁 Pastas Cadastradas ({leadGroups.length})
            </button>

            <button
              onClick={startCreate}
              className={`px-4 py-1.5 rounded-xl font-extrabold text-xs transition-colors flex items-center gap-1 ${
                activeSubTab === 'create' && !editingGroup ? 'bg-growie-purple text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Plus size={14} /> + Nova Pasta
            </button>
          </div>

          {editingGroup && activeSubTab === 'create' && (
            <span className="text-xs font-extrabold text-growie-purple bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
              Editando: {editingGroup.name}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {activeSubTab === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-growie-dark uppercase text-[11px] tracking-wider">
                  Pastas e Grupos de Leads no Workspace:
                </h4>
                <button
                  onClick={startCreate}
                  className="px-3.5 py-1.5 rounded-xl bg-growie-purple text-white font-extrabold text-xs shadow hover:bg-purple-800 flex items-center gap-1"
                >
                  <Plus size={13} /> Criar Nova Pasta
                </button>
              </div>

              {leadGroups.length === 0 ? (
                <div className="p-8 text-center bg-growie-bg rounded-2xl border border-slate-200 text-slate-500 font-medium">
                  Nenhuma pasta personalizada criada ainda. Clique em "+ Nova Pasta" para organizar seus leads.
                </div>
              ) : (
                <div className="space-y-3">
                  {leadGroups.map((g) => {
                    const groupLeadCount = leads.filter(
                      (l) => (g.leadIds || []).includes(l.id) || (l.groups || []).includes(g.id)
                    ).length;

                    return (
                      <div
                        key={g.id}
                        className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs hover:border-growie-purple/40 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-growie-purple flex items-center justify-center font-bold shrink-0">
                            <Folder size={20} />
                          </div>
                          <div>
                            <h5 className="font-extrabold text-growie-dark text-xs">{g.name}</h5>
                            <p className="text-[11px] text-slate-500 mt-0.5">{g.description || 'Sem descrição'}</p>
                            <span className="inline-block mt-1 font-mono text-[10px] font-bold text-growie-purple bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              {groupLeadCount} leads vinculados
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(g)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] shadow-xs flex items-center gap-1"
                          >
                            <Edit2 size={13} /> Editar Pasta / Selecionar Leads
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Deseja excluir permanentemente a pasta "${g.name}"?`)) {
                                onDeleteGroup(g.id);
                              }
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                            title="Excluir Pasta"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'create' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome da Pasta ou Grupo *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Decisores de Compras Q3"
                    className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-extrabold text-growie-dark focus:border-growie-purple"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Descrição (Opcional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Diretores e Gerentes qualificados"
                    className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-medium focus:border-growie-purple"
                  />
                </div>
              </div>

              {/* Import Mass Leads directly into this folder */}
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                    <Upload size={16} />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-emerald-900 text-xs">Carregar Base de Leads em Massa para esta Pasta</h5>
                    <p className="text-[11px] text-emerald-700">Importe arquivos PDF, Excel, Google Sheets, CSV ou JSON vinculando diretamente a esta pasta</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenMassImportForFolder) {
                      onOpenMassImportForFolder(name || 'Nova Pasta');
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow transition-colors shrink-0 flex items-center gap-1"
                >
                  <Upload size={13} /> 📥 Carregar Arquivo / Planilha
                </button>
              </div>

              {/* Lead Selection Panel */}
              <div className="p-4 bg-growie-bg rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-growie-purple" />
                    <span className="font-extrabold text-growie-dark text-xs">
                      Selecionar Leads desta Pasta ({selectedLeadIds.length} selecionados)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-[11px] font-extrabold text-growie-purple hover:underline"
                  >
                    {selectedLeadIds.length === filteredLeads.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar leads por nome, empresa ou e-mail..."
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                  />
                </div>

                {/* Leads List with Checkboxes & Existing Group Badges */}
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {filteredLeads.length === 0 ? (
                    <div className="p-4 text-center text-slate-400 font-medium">
                      Nenhum lead encontrado com essa busca.
                    </div>
                  ) : (
                    filteredLeads.map((l) => {
                      const isChecked = selectedLeadIds.includes(l.id);
                      const existingGroups = getLeadGroupNames(l);

                      return (
                        <div
                          key={l.id}
                          onClick={() => handleToggleLead(l.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-purple-50/80 border-growie-purple/50 shadow-xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded border-slate-300 text-growie-purple focus:ring-growie-purple cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-extrabold text-growie-dark">{l.name}</p>
                                <span className="text-[10px] font-bold text-slate-500 font-mono">
                                  ({l.company})
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-mono">{l.email}</p>

                              {/* Badges showing which existing groups this lead ALREADY belongs to */}
                              {existingGroups.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {existingGroups.map((gName, gIdx) => (
                                    <span key={gIdx} className="px-1.5 py-0.2 bg-purple-100 text-growie-purple rounded font-mono text-[9px] font-extrabold border border-purple-200">
                                      🏷️ Já na pasta: {gName}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] font-extrabold text-slate-600 bg-growie-bg px-2 py-0.5 rounded border border-slate-200">
                            {l.role}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('list')}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-growie-purple hover:bg-purple-800 text-white font-extrabold shadow flex items-center gap-1.5"
                >
                  <Save size={14} /> {editingGroup ? 'Salvar Alterações da Pasta' : 'Criar Pasta de Leads'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
