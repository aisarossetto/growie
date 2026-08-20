import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Sparkles, 
  ChevronDown, 
  Building2, 
  User as UserIcon, 
  LogOut, 
  Sliders, 
  Layers,
  UserPlus,
  ShieldCheck,
  Menu
} from 'lucide-react';

import { User, Tenant } from '../../types';
import { apiService } from '../../services/api';
import { NotificationDrawer, AppNotification } from './NotificationDrawer';
import { UserManagementModal } from '../auth/UserManagementModal';
import { WorkspaceManagerModal } from '../auth/WorkspaceManagerModal';

interface HeaderProps {
  user: User;
  tenants: Tenant[];
  currentTenant: Tenant;
  onSelectTenant: (tenant: Tenant) => void;
  isCollapsed: boolean;
  onOpenAuthModal: () => void;
  onToggleCopilotWidget: () => void;
  onOpenNewLeadModal: () => void;
  onLogout?: () => void;
  users?: User[];
  onAddUser?: (user: User) => void;
  onUpdateUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  onAddTenant?: (tenant: Tenant) => void;
  onUpdateTenant?: (tenant: Tenant) => void;
  onDeleteTenant?: (tenantId: string) => void;
  onOpenWorkspaceManager?: () => void;
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  tenants,
  currentTenant,
  onSelectTenant,
  isCollapsed,
  onOpenAuthModal,
  onToggleCopilotWidget,
  onOpenNewLeadModal,
  onLogout = () => {},
  users = [],
  onAddUser = () => {},
  onUpdateUser = () => {},
  onDeleteUser = () => {},
  onAddTenant = () => {},
  onUpdateTenant = () => {},
  onDeleteTenant = () => {},
  onOpenWorkspaceManager,
  onOpenMobileSidebar,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);
  const [isWorkspaceMgmtOpen, setIsWorkspaceMgmtOpen] = useState(false);

  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    apiService.getNotifications(currentTenant.id)
  );

  React.useEffect(() => {
    setNotifications(apiService.getNotifications(currentTenant.id));
  }, [currentTenant.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      apiService.saveNotifications(updated, currentTenant.id);
      return updated;
    });
  };

  const handleClearAll = () => {
    setNotifications([]);
    apiService.saveNotifications([], currentTenant.id);
  };

  return (
    <header className={`fixed top-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-20 transition-all duration-300 flex items-center justify-between px-3 md:px-6 left-0 ${
      isCollapsed ? 'md:left-20' : 'md:left-64'
    }`}>
      {/* Mobile Hamburger + Search Input Bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl bg-growie-bg text-slate-700 md:hidden hover:bg-slate-200 shrink-0"
          title="Abrir Menu Mobile"
        >
          <Menu size={20} />
        </button>

        <div className="relative w-32 sm:w-64 md:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-9 pr-3 py-1.5 md:py-2 bg-growie-bg border border-slate-200/80 rounded-xl text-xs font-medium text-growie-dark focus:outline-none focus:border-growie-purple"
          />
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        {/* Workspace Tenant Switcher Trigger */}
        <button
          onClick={onOpenWorkspaceManager ? onOpenWorkspaceManager : () => setIsWorkspaceMgmtOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-growie-bg hover:bg-slate-200 border border-slate-200/80 text-xs font-bold text-growie-dark transition-colors shadow-sm"
        >
          <Building2 size={15} className="text-growie-purple" />
          <span className="max-w-[130px] truncate">{currentTenant.name}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>

        {/* Quick New Lead Button */}
        <button
          onClick={onOpenNewLeadModal}
          className="px-3 py-1.5 rounded-xl bg-growie-purple text-white font-extrabold text-xs shadow-sm hover:bg-purple-800 transition-colors flex items-center gap-1.5"
        >
          <Plus size={14} /> Novo Lead
        </button>

        {/* Floating Copilot AI Trigger */}
        <button
          onClick={onToggleCopilotWidget}
          className="p-2 rounded-xl bg-gradient-to-tr from-growie-dark to-growie-purple text-white shadow-glow-lilac hover:opacity-90 transition-opacity"
          title="Abrir IA Copilot"
        >
          <Sparkles size={16} className="text-growie-cyan" />
        </button>

        {/* Notifications Bell & Dropdown Popover */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-xl bg-growie-bg hover:bg-slate-200 border border-slate-200 text-slate-600 relative transition-colors"
            title="Notificações Comerciais"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Card opening DOWNWARDS */}
          <NotificationDrawer
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onClearAll={handleClearAll}
          />
        </div>

        {/* Active User Profile Avatar */}
        <div 
          onClick={() => setIsUserMgmtOpen(true)}
          className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer group"
          title="Gerenciar Usuários da Equipe"
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user?.name || 'Usuário'}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
            }}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-growie-purple/30 group-hover:ring-growie-purple transition-all"
          />
          <div className="hidden sm:block">
            <span className="text-xs font-extrabold text-growie-dark block group-hover:text-growie-purple transition-colors">
              {user?.name || 'Usuário'}
            </span>
            <span className="text-[10px] text-growie-purple font-mono font-bold block">
              {user?.role || 'Admin'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
          title="Sair do Sistema / Logout"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* User Management Modal */}
      <UserManagementModal
        isOpen={isUserMgmtOpen}
        onClose={() => setIsUserMgmtOpen(false)}
        users={users.length > 0 ? users : [user]}
        onAddUser={onAddUser}
        onUpdateUser={onUpdateUser}
        onDeleteUser={onDeleteUser}
      />

      {/* Workspace Manager Modal */}
      <WorkspaceManagerModal
        isOpen={isWorkspaceMgmtOpen}
        onClose={() => setIsWorkspaceMgmtOpen(false)}
        tenants={tenants}
        currentTenant={currentTenant}
        onSelectTenant={onSelectTenant}
        onAddTenant={onAddTenant}
        onUpdateTenant={onUpdateTenant}
        onDeleteTenant={onDeleteTenant}
      />
    </header>
  );
};
