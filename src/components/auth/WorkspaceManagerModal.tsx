import React, { useState } from 'react';
import { X, Building2, Plus, Edit2, Trash2, Save, CheckCircle2, ArrowRight, Check } from 'lucide-react';
import { Tenant } from '../../types';

interface WorkspaceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: Tenant[];
  currentTenant?: Tenant;
  onSelectTenant?: (tenant: Tenant) => void;
  onAddTenant: (tenant: Tenant) => void;
  onUpdateTenant: (tenant: Tenant) => void;
  onDeleteTenant: (tenantId: string) => void;
}

export const WorkspaceManagerModal: React.FC<WorkspaceManagerModalProps> = ({
  isOpen,
  onClose,
  tenants,
  currentTenant,
  onSelectTenant = () => {},
  onAddTenant,
  onUpdateTenant,
  onDeleteTenant,
}) => {
  if (!isOpen) return null;

  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [name, setName] = useState('');
  const [plan, setPlan] = useState<Tenant['plan']>('Enterprise');

  const startEdit = (t: Tenant) => {
    setEditingTenant(t);
    setName(t.name);
    setPlan(t.plan);
  };

  const resetForm = () => {
    setEditingTenant(null);
    setName('');
    setPlan('Enterprise');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingTenant) {
      onUpdateTenant({
        ...editingTenant,
        name,
        plan
      });
    } else {
      const created: Tenant = {
        id: 't_' + Date.now(),
        name,
        plan,
        membersCount: 1
      };
      onAddTenant(created);
      onSelectTenant(created);
    }

    resetForm();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-growie-dark/85 backdrop-blur-md animate-in fade-in overflow-y-auto font-sans">
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh] my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-growie-dark via-growie-purple to-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-growie-cyan/20 text-growie-cyan border border-growie-cyan/40 flex items-center justify-center font-bold">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Central de Workspaces & Empresas</h3>
              <p className="text-xs text-slate-300">Alterne entre organizações ou crie novos ambientes 100% isolados</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs overflow-y-auto flex-1">
          {/* Add / Edit Form */}
          <form onSubmit={handleSubmit} className="p-4 bg-growie-bg rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-growie-dark uppercase text-[11px] flex items-center justify-between">
              <span>{editingTenant ? `Editar Workspace: ${editingTenant.name}` : '+ Criar Nova Organização (Workspace Isolado)'}</span>
              {editingTenant && (
                <button type="button" onClick={resetForm} className="text-[10px] text-growie-purple font-bold underline">
                  Cancelar Edição
                </button>
              )}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome da Empresa / Workspace</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: SaaS Accelerate Brasil"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Plano da Licença</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple cursor-pointer"
                >
                  <option value="Enterprise">Enterprise Plan</option>
                  <option value="Scale">Scale Plan</option>
                  <option value="Growth">Growth Plan</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-growie-purple text-white font-extrabold shadow hover:bg-purple-800 flex items-center gap-1.5"
              >
                <Save size={14} /> {editingTenant ? 'Atualizar Workspace' : 'Criar Workspace Isolado'}
              </button>
            </div>
          </form>

          {/* Existing Tenants List */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-700 uppercase text-[11px] tracking-wider">
              Workspaces Cadastrados na Plataforma:
            </h4>

            <div className="space-y-2.5">
              {tenants.map((t) => {
                const isActive = currentTenant?.id === t.id;

                return (
                  <div 
                    key={t.id} 
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                      isActive 
                        ? 'bg-purple-50/80 border-growie-purple/40 shadow-sm' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold ${
                        isActive ? 'bg-growie-purple text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-growie-dark text-xs">{t.name}</p>
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold flex items-center gap-0.5">
                              <Check size={10} /> Ativo Agora
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Plano {t.plan} • {t.membersCount || 2} { (t.membersCount || 2) === 1 ? 'membro' : 'membros'} • Leads Isolados</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTenant(t);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] shadow-xs flex items-center gap-1"
                        >
                          Entrar <ArrowRight size={12} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => startEdit(t)}
                        className="p-1.5 text-slate-500 hover:text-growie-purple hover:bg-white rounded-lg"
                        title="Editar Workspace"
                      >
                        <Edit2 size={14} />
                      </button>

                      {tenants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteTenant(t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Excluir Workspace"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-900 text-white border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Isolamento de Banco de Dados por Workspace Ativo
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-growie-purple text-white font-extrabold text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
