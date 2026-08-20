import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  GitPullRequest, 
  Sparkles, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  Building2,
  Workflow,
  Share2,
  Calendar,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { TabType, Tenant } from '../../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  currentTenant: Tenant;
  currentUser?: { name: string; role: string };
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  currentTenant,
  currentUser,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [appFaviconUrl, setAppFaviconUrl] = React.useState<string | null>(() => {
    try {
      return localStorage.getItem('growie_app_favicon_url');
    } catch (e) {
      return null;
    }
  });

  React.useEffect(() => {
    const handleFaviconChange = () => {
      try {
        setAppFaviconUrl(localStorage.getItem('growie_app_favicon_url'));
      } catch (e) {}
    };

    window.addEventListener('storage', handleFaviconChange);
    window.addEventListener('growie_favicon_updated', handleFaviconChange);
    return () => {
      window.removeEventListener('storage', handleFaviconChange);
      window.removeEventListener('growie_favicon_updated', handleFaviconChange);
    };
  }, []);

  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'leads', label: 'Leads', icon: Users, badge: '360°' },
    { id: 'clientes', label: 'Clientes', icon: Building2, badge: 'Ativos' },
    { id: 'business', label: 'Vendas & Funil', icon: GitPullRequest, badge: null },
    { id: 'campanhas', label: 'Campanhas', icon: Megaphone, badge: null },
    { id: 'agenda', label: 'Agenda', icon: Calendar, badge: 'Google' },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign, badge: 'Sócias' },
    { id: 'content', label: 'Conteúdos', icon: Share2, badge: 'Studio' },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, badge: null },
  ];

  // Gestor Comercial has access to everything EXCEPT Financeiro & Configurações
  const isGestorComercial = currentUser?.role === 'Gestor Comercial';
  const menuItems = allMenuItems.filter((item) => {
    if (isGestorComercial && (item.id === 'financeiro' || item.id === 'configuracoes')) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-growie-dark/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen bg-growie-dark text-white transition-all duration-300 z-50 flex flex-col justify-between border-r border-growie-purple/30 shadow-2xl ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen 
            ? 'translate-x-0' 
            : '-translate-x-full md:translate-x-0'
        }`}
      >
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-growie-purple/20">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-transparent flex items-center justify-center font-bold text-white shrink-0 overflow-hidden">
              {appFaviconUrl ? (
                <img src={appFaviconUrl} alt="Favicon" className="w-full h-full object-contain rounded-xl" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-growie-purple to-growie-cyan flex items-center justify-center shadow-glow-lilac">
                  <Zap size={22} className="text-white" />
                </div>
              )}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <span className="font-extrabold text-sm tracking-tight text-white font-sans block leading-tight">
                  Growie
                </span>
                <span className="text-[9px] text-growie-cyan font-mono tracking-tight block uppercase font-extrabold">
                  SAAS Plurie Comunicação
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title={isCollapsed ? "Expandir Menu" : "Recolher Menu"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Current Workspace Tenant Badge */}
        {!isCollapsed && (
          <div className="p-3 mx-3 my-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <Building2 size={16} className="text-growie-cyan shrink-0" />
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-slate-200 block truncate">
                  {currentTenant?.name || 'Growie SaaS Enterprise'}
                </span>
                <span className="text-[10px] text-growie-lilac font-mono block">
                  Plano: {currentTenant?.plan || 'Enterprise'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as TabType);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-dark-purple text-white shadow-glow-lilac border border-growie-purple/50'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  size={18}
                  className={`shrink-0 ${
                    isActive ? 'text-growie-cyan' : 'text-slate-400'
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-growie-purple/30 text-growie-cyan font-bold border border-growie-purple/40">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-growie-purple/20">
        {!isCollapsed ? (
          <div className="text-[10px] text-slate-400 font-mono text-center">
            Growie OS v2.4 • Gemini 3.6
          </div>
        ) : (
          <div className="w-2 h-2 rounded-full bg-emerald-500 mx-auto" />
        )}
      </div>
    </aside>
  </>
);
};
