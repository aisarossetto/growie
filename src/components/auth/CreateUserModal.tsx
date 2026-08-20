import React, { useState } from 'react';
import { X, UserPlus, Shield, Mail, User as UserIcon, Save, Upload } from 'lucide-react';
import { User } from '../../types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: User) => void;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onAddUser,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('SDR');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const created: User = {
      id: 'u_' + Date.now(),
      name,
      email,
      role,
      avatar
    };

    onAddUser(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-dark-purple p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-growie-cyan" />
            <h3 className="font-extrabold text-sm">Adicionar Novo Membro da Equipe</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome Completo do Usuário</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Juliana Costa"
              className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold focus:border-growie-purple"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">E-mail de Acesso</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juliana@empresa.io"
              className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono focus:border-growie-purple"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Função / Perfil de Permissão</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold focus:border-growie-purple"
            >
              <option value="Admin">Admin (Acesso Total ao Sistema)</option>
              <option value="Gestor Comercial">Gestor Comercial (Relatórios & Metas)</option>
              <option value="Closer">Closer (Fechamento & Propostas)</option>
              <option value="SDR">SDR (Pré-Vendas & Qualificação)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Foto de Perfil do Usuário</label>
            <div className="flex items-center gap-3">
              <img src={avatar} alt="Preview" className="w-11 h-11 rounded-full object-cover border-2 border-growie-purple shrink-0 shadow-md" />
              
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-growie-purple border border-purple-200 font-extrabold text-xs cursor-pointer transition-colors shadow-xs">
                <Upload size={15} /> Carregar Foto do Computador...
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        const dataUrl = evt.target?.result as string;
                        setAvatar(dataUrl);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-cta text-white font-extrabold text-xs shadow-glow-lilac hover:opacity-95 flex items-center justify-center gap-1.5"
          >
            <Save size={14} /> Cadastrar Usuário no Workspace
          </button>
        </form>
      </div>
    </div>
  );
};
