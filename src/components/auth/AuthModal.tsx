import React, { useState } from 'react';
import { X, Users, Building2, Shield, Plus, CheckCircle2, UserCheck, Key, Lock, UserPlus } from 'lucide-react';
import { User, Tenant } from '../../types';
import { CreateUserModal } from './CreateUserModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (user: User) => void;
  tenants: Tenant[];
  currentTenant: Tenant;
  onSelectTenant: (tenant: Tenant) => void;
  userList?: User[];
  onAddUser?: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  tenants,
  currentTenant,
  onSelectTenant,
  userList = [],
  onAddUser
}) => {
  if (!isOpen) return null;

  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'tenant'>('profile');

  const defaultUsers: User[] = [
    currentUser,
    { id: 'u2', name: 'Juliana Costa', email: 'juliana.costa@growie.io', role: 'Gestor Comercial', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80' },
    { id: 'u3', name: 'Lucas Mendes', email: 'lucas.mendes@growie.io', role: 'Closer', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80' },
    { id: 'u4', name: 'Beatriz Fonseca', email: 'beatriz.sdr@growie.io', role: 'SDR', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
  ];

  const allUsers = [...userList, ...defaultUsers.filter(d => !userList.some(u => u.id === d.id))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-dark-purple p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-growie-cyan/20 border border-growie-cyan/40 flex items-center justify-center text-growie-cyan">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">Gerenciador de Usuários & Multi-Tenant</h3>
              <p className="text-xs text-slate-300">Alterne perfis de membros ou troque a organização de trabalho</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="flex border-b border-slate-100 bg-growie-bg">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              activeTab === 'profile'
                ? 'border-b-2 border-growie-purple text-growie-purple bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Perfil de Usuário Ativo
          </button>

          <button
            onClick={() => setActiveTab('tenant')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              activeTab === 'tenant'
                ? 'border-b-2 border-growie-purple text-growie-purple bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Empresas / Workspace
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 text-xs max-h-[440px] overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Selecione um Perfil para Alternar:</span>
                <button
                  type="button"
                  onClick={() => setIsCreateUserOpen(true)}
                  className="px-3 py-1 bg-growie-purple text-white font-extrabold rounded-lg hover:bg-purple-800 flex items-center gap-1 text-[11px]"
                >
                  <UserPlus size={13} /> + Adicionar Usuário
                </button>
              </div>

              <div className="space-y-2">
                {allUsers.map((u) => {
                  const isActive = currentUser.id === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        onUpdateUser(u);
                        onClose();
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isActive
                          ? 'border-growie-purple bg-growie-purple/10 shadow-sm'
                          : 'border-slate-200 bg-growie-bg hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-growie-dark">{u.name}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          u.role === 'Admin' ? 'bg-purple-100 text-growie-purple' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role}
                        </span>
                        {isActive && (
                          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">● Ativo Agora</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'tenant' && (
            <div className="space-y-4">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">Organizações do Workspace:</span>

              <div className="space-y-2">
                {tenants.map((t) => {
                  const isActive = currentTenant.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        onSelectTenant(t);
                        onClose();
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isActive
                          ? 'border-growie-purple bg-growie-purple/10 shadow-sm'
                          : 'border-slate-200 bg-growie-bg hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-growie-purple text-white font-extrabold flex items-center justify-center">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-growie-dark">{t.name}</p>
                          <p className="text-[11px] text-slate-500">Plano: {t.plan} • {t.membersCount} membros</p>
                        </div>
                      </div>

                      {isActive && (
                        <span className="text-[10px] text-emerald-600 font-bold">● Workspace Ativo</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        onAddUser={(user) => {
          if (onAddUser) onAddUser(user);
          onUpdateUser(user);
        }}
      />
    </div>
  );
};
