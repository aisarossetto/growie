import React, { useState } from 'react';
import { X, Users, UserPlus, Edit2, Trash2, Save, Shield, CheckCircle2, Upload } from 'lucide-react';
import { User } from '../../types';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  if (!isOpen) return null;

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('SDR');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  const startEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setAvatar(u.avatar);
  };

  const resetForm = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('SDR');
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        name,
        email,
        role,
        avatar
      });
    } else {
      onAddUser({
        id: 'u_' + Date.now(),
        name,
        email,
        role,
        avatar
      });
    }

    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-dark-purple p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users size={20} className="text-growie-cyan" />
            <div>
              <h3 className="font-extrabold text-base">Gerenciador Completo de Usuários da Equipe</h3>
              <p className="text-xs text-slate-300">Adicione, edite dados/fotos ou remova membros do sistema</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs max-h-[500px] overflow-y-auto">
          {/* Add / Edit Form */}
          <form onSubmit={handleSubmit} className="p-4 bg-growie-bg rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-growie-dark uppercase text-[11px] flex items-center justify-between">
              <span>{editingUser ? `Editar Usuário: ${editingUser.name}` : '+ Cadastrar Novo Membro'}</span>
              {editingUser && (
                <button type="button" onClick={resetForm} className="text-[10px] text-growie-purple font-bold underline">
                  Cancelar Edição
                </button>
              )}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Roberto Mendes"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">E-mail Profissional</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="roberto@empresa.io"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cargo / Função</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Admin">Admin (Acesso Total)</option>
                  <option value="Gestor Comercial">Gestor Comercial</option>
                  <option value="Closer">Closer</option>
                  <option value="SDR">SDR</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Foto de Perfil do Usuário</label>
                <div className="flex items-center gap-2">
                  <img src={avatar} alt="Preview" className="w-9 h-9 rounded-full object-cover border-2 border-growie-purple shrink-0 shadow-xs" />
                  
                  <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-growie-purple border border-purple-200 font-extrabold text-xs cursor-pointer transition-colors shadow-xs">
                    <Upload size={14} /> Fazer Upload de Foto do Computador...
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
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-growie-purple text-white font-extrabold shadow hover:bg-purple-800 flex items-center gap-1.5"
              >
                <Save size={14} /> {editingUser ? 'Atualizar Dados do Usuário' : 'Salvar Novo Usuário'}
              </button>
            </div>
          </form>

          {/* Existing Users Table */}
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-700 uppercase text-[11px]">Usuários Cadastrados no Sistema ({users.length}):</h4>

            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-growie-purple/20" />
                    <div>
                      <p className="font-extrabold text-growie-dark">{u.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-growie-purple/10 text-growie-purple font-extrabold text-[10px]">
                      {u.role}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(u)}
                        className="p-1.5 text-slate-500 hover:text-growie-purple hover:bg-growie-bg rounded-lg"
                        title="Editar Usuário"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteUser(u.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Excluir Usuário"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
