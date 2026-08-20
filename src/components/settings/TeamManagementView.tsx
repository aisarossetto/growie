import React, { useState } from 'react';
import { Users, UserPlus, Edit2, Trash2, Save, Shield, CheckCircle2, X, Upload, Key, Lock } from 'lucide-react';
import { User } from '../../types';

interface TeamManagementViewProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const TeamManagementView: React.FC<TeamManagementViewProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<User['role']>('Gestor Comercial');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');

  const [notification, setNotification] = useState<string | null>(null);

  const startEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword(u.password || '');
    setRole(u.role);
    setAvatar(u.avatar);
    setIsAddFormOpen(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('Gestor Comercial');
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
    setIsAddFormOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        avatar
      });
      setNotification(`Dados do usuário "${name}" atualizados com sucesso!`);
    } else {
      const newUser: User = {
        id: 'u_' + Date.now(),
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        avatar
      };
      onAddUser(newUser);
      setNotification(`Novo usuário "${name}" cadastrado com sucesso! Agora pode logar.`);
    }

    setTimeout(() => setNotification(null), 3500);
    resetForm();
  };

  return (
    <div className="space-y-6 font-sans">
      {notification && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-growie-dark font-sans tracking-tight flex items-center gap-2">
            <Users className="text-growie-purple" /> Central de Gestão de Equipe & Usuários
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre novos usuários com e-mail, senha e atribua permissões de acesso (Admin ou Gestor Comercial).
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAddFormOpen(!isAddFormOpen);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-cta text-white font-extrabold text-xs shadow-glow-lilac hover:opacity-95 transition-opacity flex items-center gap-1.5 shrink-0"
        >
          <UserPlus size={15} /> {isAddFormOpen ? 'Fechar Formulário' : '+ Adicionar Novo Usuário'}
        </button>
      </div>

      {/* Add / Edit Form Panel */}
      {isAddFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card-soft space-y-4 animate-in fade-in text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-growie-dark text-sm">
              {editingUser ? `Editar Dados de: ${editingUser.name}` : 'Cadastrar Novo Usuário (com Login e Senha)'}
            </h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-700">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Silva"
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">E-mail de Login *</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="carlos@empresa.com"
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Senha de Acesso *</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Defina a senha..."
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cargo / Nível de Acesso</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
              >
                <option value="Admin">Admin (Acesso Total)</option>
                <option value="Gestor Comercial">Gestor Comercial (Sem Financeiro/Config)</option>
                <option value="Closer">Closer (Fechamento)</option>
                <option value="SDR">SDR (Pré-Vendas)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Foto de Perfil do Usuário</label>
              <div className="flex items-center gap-2">
                <img
                  src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt="Preview"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                  }}
                  className="w-10 h-10 rounded-full object-cover border-2 border-growie-purple shrink-0 shadow-xs"
                />
                
                <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-growie-purple border border-purple-200 font-extrabold text-xs cursor-pointer transition-colors shadow-xs">
                  <Upload size={14} /> Fazer Upload de Foto...
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

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-growie-purple text-white font-extrabold shadow hover:bg-purple-800 flex items-center gap-1.5"
            >
              <Save size={14} /> {editingUser ? 'Salvar Alterações do Usuário' : 'Cadastrar Novo Usuário'}
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-growie-dark text-xs uppercase tracking-wider">
            Membros Cadastrados no Time ({users.length})
          </h3>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-growie-bg border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Membro / Perfil</th>
              <th className="py-3.5 px-4">E-mail de Login</th>
              <th className="py-3.5 px-4">Senha Registrada</th>
              <th className="py-3.5 px-4">Cargo & Permissões</th>
              <th className="py-3.5 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={u.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                      }}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-growie-purple/20"
                    />
                    <div>
                      <p className="font-extrabold text-growie-dark text-xs">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono font-bold">ID: {u.id}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                  {u.email}
                </td>

                <td className="py-3.5 px-4 font-mono text-slate-500">
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold">
                    <Lock size={11} className="text-slate-400" /> {u.password ? '••••••••' : '$chirmerS20'}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded ${
                    u.role === 'Admin'
                      ? 'bg-purple-100 text-growie-purple border border-purple-200'
                      : u.role === 'Gestor Comercial'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {u.role} {u.role === 'Gestor Comercial' ? '(Sem Fin./Config)' : ''}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => startEdit(u)}
                      className="px-3 py-1 rounded-lg bg-growie-purple/10 text-growie-purple font-extrabold text-xs hover:bg-growie-purple hover:text-white transition-colors flex items-center gap-1"
                    >
                      <Edit2 size={13} /> Editar
                    </button>

                    <button
                      onClick={() => onDeleteUser(u.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white font-bold text-xs transition-colors"
                      title="Excluir Usuário"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
