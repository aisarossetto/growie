import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { LeadsView } from './components/leads/LeadsView';
import { EmailBuilder } from './components/campanhas/EmailBuilder';
import { MetaAdsPanel } from './components/campanhas/MetaAdsPanel';
import { KanbanBoard } from './components/business/KanbanBoard';
import { AutomationBuilder } from './components/business/AutomationBuilder';
import { ContentStudioView } from './components/social/ContentStudioView';
import { GeminiCopilot } from './components/copilot/GeminiCopilot';
import { FloatingCopilotWidget } from './components/copilot/FloatingCopilotWidget';
import { SettingsView, updateAppFavicon } from './components/settings/SettingsView';
import { AuthModal } from './components/auth/AuthModal';
import { CalendarView } from './components/calendar/CalendarView';
import { FinancialView } from './components/financial/FinancialView';
import { ClientsView } from './components/clients/ClientsView';
import { AuthScreen } from './components/auth/AuthScreen';
import { WorkspaceManagerModal } from './components/auth/WorkspaceManagerModal';
import { SingleLeadModal } from './components/leads/SingleLeadModal';

import { 
  TabType, 
  Tenant, 
  User, 
  Lead, 
  ClientItem,
  EmailCampaign, 
  MetaAdCampaign, 
  DealCard, 
  KanbanStageId,
  AutomationFlow,
  WaitingClient,
  TaskItem,
  ContentPost,
  BrandGuidelines,
  GoogleIntegrations,
  CalendarEvent,
  RevenueEntry,
  ExpenseEntry,
  PartnerProfitSplit
} from './types';

import { 
  mockTenants, 
  mockUser, 
  mockMetrics, 
  mockStages, 
  mockAutomationFlows,
  mockWaitingClients
} from './data/mockData';

import { apiService } from './services/api';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const savedAuth = localStorage.getItem('growie_is_authenticated');
      if (savedAuth === 'true') return true;
      if (savedAuth === 'false') return false;
      // Default to false on first visit so AuthScreen loads cleanly
      return false;
    } catch (e) {
      return false;
    }
  });
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // App State loaded from API / Local Storage Service for 100% Persistence
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const list = apiService.getTenants();
    return (Array.isArray(list) && list.length > 0) ? list : mockTenants;
  });
  const [currentTenant, setCurrentTenant] = useState<Tenant>(() => tenants[0] || mockTenants[0]);
  const [userList, setUserList] = useState<User[]>(() => apiService.getUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const savedUserId = localStorage.getItem('growie_logged_user_id');
      const users = apiService.getUsers();
      if (savedUserId) {
        const found = users.find((u) => u && u.id === savedUserId);
        if (found) return found;
      }
      return users[0] || mockUser;
    } catch (e) {
      return mockUser;
    }
  });

  const [leads, setLeads] = useState<Lead[]>(() => apiService.getLeads(currentTenant?.id || 't1'));
  const [clients, setClients] = useState<ClientItem[]>(() => apiService.getClients(currentTenant?.id || 't1'));
  const [tasks, setTasks] = useState<TaskItem[]>(() => apiService.getTasks(currentTenant?.id || 't1'));
  const [deals, setDeals] = useState<DealCard[]>(() => apiService.getDeals(currentTenant?.id || 't1'));
  const [contentPosts, setContentPosts] = useState<ContentPost[]>(() => apiService.getPosts(currentTenant?.id || 't1'));
  const [brandGuidelines, setBrandGuidelines] = useState<BrandGuidelines>(() => apiService.getBrandGuidelines(currentTenant?.id || 't1'));
  const [googleIntegrations, setGoogleIntegrations] = useState<GoogleIntegrations>(() => apiService.getGoogleIntegrations(currentTenant?.id || 't1'));

  const [events, setEvents] = useState<CalendarEvent[]>(() => apiService.getEvents(currentTenant?.id || 't1'));
  const [revenues, setRevenues] = useState<RevenueEntry[]>(() => apiService.getRevenues(currentTenant?.id || 't1'));
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(() => apiService.getExpenses(currentTenant?.id || 't1'));
  const [profitSplit, setProfitSplit] = useState<PartnerProfitSplit>(() => apiService.getProfitSplit(currentTenant?.id || 't1'));

  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>(() => apiService.getEmailCampaigns(currentTenant?.id || 't1'));
  const [metaCampaigns, setMetaCampaigns] = useState<MetaAdCampaign[]>([]);
  const [automationFlows, setAutomationFlows] = useState<AutomationFlow[]>(mockAutomationFlows);
  const [waitingClients, setWaitingClients] = useState<WaitingClient[]>(mockWaitingClients);

  // Modals & Floating State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWorkspaceManagerOpen, setIsWorkspaceManagerOpen] = useState(false);
  const [isFloatingCopilotOpen, setIsFloatingCopilotOpen] = useState(false);
  const [isSingleLeadModalOpen, setIsSingleLeadModalOpen] = useState(false);
  const [businessSubTab, setBusinessSubTab] = useState<'kanban' | 'automation'>('kanban');
  const [campaignsSubTab, setCampaignsSubTab] = useState<'email' | 'meta'>('email');

  // Sync ALL state updates to API Service / LocalStorage automatically by Tenant ID!
  useEffect(() => {
    apiService.saveUsers(userList);
  }, [userList]);

  useEffect(() => {
    apiService.saveTenants(tenants);
  }, [tenants]);

  // Apply saved favicon on startup
  useEffect(() => {
    try {
      const savedFavicon = localStorage.getItem('growie_app_favicon_url');
      if (savedFavicon) {
        updateAppFavicon(savedFavicon);
      }
    } catch (e) {}
  }, []);

  // Reload tenant-isolated state whenever currentTenant changes
  useEffect(() => {
    if (currentTenant?.id) {
      setLeads(apiService.getLeads(currentTenant.id));
      setClients(apiService.getClients(currentTenant.id));
      setTasks(apiService.getTasks(currentTenant.id));
      setDeals(apiService.getDeals(currentTenant.id));
      setRevenues(apiService.getRevenues(currentTenant.id));
      setExpenses(apiService.getExpenses(currentTenant.id));
      setEvents(apiService.getEvents(currentTenant.id));
      setContentPosts(apiService.getPosts(currentTenant.id));
      setEmailCampaigns(apiService.getEmailCampaigns(currentTenant.id));
    }
  }, [currentTenant?.id]);

  useEffect(() => {
    if (currentTenant?.id) apiService.saveEmailCampaigns(emailCampaigns, currentTenant.id);
  }, [emailCampaigns, currentTenant?.id]);

  useEffect(() => {
    if (currentTenant?.id) apiService.saveLeads(leads, currentTenant.id);
  }, [leads, currentTenant?.id]);

  useEffect(() => {
    if (currentTenant?.id) apiService.saveClients(clients, currentTenant.id);
  }, [clients, currentTenant?.id]);

  useEffect(() => {
    if (currentTenant?.id) apiService.saveTasks(tasks, currentTenant.id);
  }, [tasks, currentTenant?.id]);

  useEffect(() => {
    if (currentTenant?.id) apiService.saveDeals(deals, currentTenant.id);
  }, [deals, currentTenant?.id]);

  useEffect(() => {
    if (currentTenant?.id) apiService.saveRevenues(revenues, currentTenant.id);
  }, [revenues, currentTenant?.id]);

  useEffect(() => {
    if (currentTenant?.id) apiService.saveExpenses(expenses, currentTenant.id);
  }, [expenses, currentTenant?.id]);

  useEffect(() => {
    if (currentTenant?.id) apiService.saveProfitSplit(profitSplit, currentTenant.id);
  }, [profitSplit, currentTenant?.id]);

  useEffect(() => {
    if (currentTenant?.id) apiService.saveEvents(events, currentTenant.id);
  }, [events, currentTenant?.id]);

  useEffect(() => {
    if (currentTenant?.id) apiService.savePosts(contentPosts, currentTenant.id);
  }, [contentPosts, currentTenant?.id]);

  useEffect(() => {
    if (currentTenant?.id) apiService.saveBrandGuidelines(brandGuidelines, currentTenant.id);
  }, [brandGuidelines, currentTenant?.id]);

  useEffect(() => {
    if (currentTenant?.id) apiService.saveGoogleIntegrations(googleIntegrations, currentTenant.id);
  }, [googleIntegrations, currentTenant?.id]);

  useEffect(() => {
    apiService.saveUsers(userList);
  }, [userList]);

  // Real-Time Email Open & Click Tracking Event Poller
  const processedEventIdsRef = useRef<Set<string>>(new Set());
  const [liveToastNotification, setLiveToastNotification] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/track/events');
        if (!res.ok) return;

        const data = await res.json();
        if (!data.success || !Array.isArray(data.events) || data.events.length === 0) return;

        data.events.forEach((evt: any) => {
          if (!evt.id || processedEventIdsRef.current.has(evt.id)) return;
          processedEventIdsRef.current.add(evt.id);

          const targetEmail = (evt.email || '').toLowerCase().trim();
          const targetCmpId = evt.campaignId;

          if (evt.type === 'open') {
            // 1. Resolve Lead Name
            const leadMatch = leads.find((l) => l.email && l.email.toLowerCase().trim() === targetEmail);
            const leadDisplayName = leadMatch?.name ? `${leadMatch.name} <${targetEmail}>` : targetEmail || 'Destinatário';

            // 2. Trigger System Notification & Floating Toast
            const notifMsg = `O lead ${leadDisplayName} acabou de abrir a sua campanha de e-mail (${evt.timeFormatted || new Date().toLocaleTimeString('pt-BR').slice(0, 5)})!`;
            apiService.addNotification({
              title: '👁️ E-mail Marketing Aberto!',
              description: notifMsg,
              type: 'email_opened'
            }, currentTenant?.id);

            setLiveToastNotification({
              title: '👁️ Nova Abertura de E-mail Detectada!',
              message: notifMsg
            });
            setTimeout(() => setLiveToastNotification(null), 7000);

            // 2. Update EmailCampaigns state & persist to LocalStorage
            setEmailCampaigns((prevCampaigns) => {
              const updatedList = prevCampaigns.map((cmp) => {
                const matchesId = targetCmpId && cmp.id === targetCmpId;
                const hasRecipient = (cmp.recipientLeads || []).some((r) => targetEmail && r.email.toLowerCase().trim() === targetEmail);

                if (!matchesId && !hasRecipient) return cmp;

                const updatedRecipients = (cmp.recipientLeads || []).map((r) => {
                  const isTarget = targetEmail && r.email.toLowerCase().trim() === targetEmail;
                  if (isTarget) {
                    return {
                      ...r,
                      opened: evt.type === 'open' ? true : r.opened,
                      openedAt: evt.type === 'open' ? (r.openedAt || evt.timestamp || new Date().toISOString()) : r.openedAt,
                      clicked: evt.type === 'click' ? true : r.clicked,
                      clickedAt: evt.type === 'click' ? (r.clickedAt || evt.timestamp || new Date().toISOString()) : r.clickedAt,
                      status: 'aberto' as const
                    };
                  }
                  return r;
                });

                const openedCount = updatedRecipients.filter((r) => r.opened).length;
                const clickedCount = updatedRecipients.filter((r) => r.clicked).length;
                const openRate = updatedRecipients.length > 0 ? Math.round((openedCount / updatedRecipients.length) * 100) : cmp.openRate;
                const clickRate = updatedRecipients.length > 0 ? Math.round((clickedCount / updatedRecipients.length) * 100) : cmp.clickRate;

                return {
                  ...cmp,
                  recipientLeads: updatedRecipients,
                  openRate,
                  clickRate
                };
              });

              apiService.saveEmailCampaigns(updatedList, currentTenant?.id);
              return updatedList;
            });

            // 3. Update Lead timeline state
            setLeads((prevLeads) =>
              prevLeads.map((l) => {
                if (targetEmail && l.email.toLowerCase().trim() === targetEmail) {
                  return {
                    ...l,
                    timeline: {
                      ...l.timeline,
                      emailOpened: true,
                      emailOpenedAt: evt.timestamp || new Date().toISOString()
                    }
                  };
                }
                return l;
              })
            );
          }
        });
      } catch (e) {}
    }, 4000);

    return () => clearInterval(interval);
  }, [isAuthenticated, currentTenant?.id]);

  // Auth Gate check
  if (!isAuthenticated) {
    return (
      <AuthScreen
        onLoginSuccess={(user, tenant) => {
          setUserList((prev) => {
            if (!prev.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
              return [...prev, user];
            }
            return prev;
          });
          setCurrentUser(user);
          setCurrentTenant(tenant);
          setIsAuthenticated(true);
        }}
        tenants={tenants}
        users={userList}
      />
    );
  }

  // User Handlers
  const handleAddUser = (newUser: User) => {
    setUserList((prev) => {
      const next = [...prev, newUser];
      apiService.saveUsers(next);
      return next;
    });
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUserList((prev) => {
      const next = prev.map((u) => (u.id === updatedUser.id ? updatedUser : u));
      apiService.saveUsers(next);
      return next;
    });
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUserList((prev) => {
      const next = prev.filter((u) => u.id !== userId);
      apiService.saveUsers(next);
      return next;
    });
  };

  // Helper to create / sync Revenue Entry from Client Contract
  const createOrUpdateRevenueFromClient = (client: ClientItem): RevenueEntry => {
    const today = new Date();
    const currentMonthStr = today.toISOString().slice(0, 7);

    let formattedPaymentDate = '';
    let dueDate = '';

    if (!client.billingFrequency || client.billingFrequency === 'mensal') {
      const day = client.paymentDay || 20;
      formattedPaymentDate = `Todo dia ${day}`;
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      dueDate = `${currentMonthStr}-${dayStr}`;
    } else {
      dueDate = client.exactPaymentDate || new Date().toISOString().split('T')[0];
      const dateParts = dueDate.split('-');
      const day = dateParts[2] || '01';
      const month = dateParts[1] || '01';
      const freqLabel = client.billingFrequency === 'anual' ? 'Anual' : client.billingFrequency === 'semestral' ? 'Semestral' : 'Pontual';
      formattedPaymentDate = `Dia ${day}/${month} (${freqLabel})`;
    }

    return {
      id: 'rev_cli_' + client.id,
      clientName: client.company,
      serviceName: `${client.service || 'Contrato Recorrente'} (${client.billingFrequency === 'anual' ? 'Anual' : client.billingFrequency === 'semestral' ? 'Semestral' : client.billingFrequency === 'pontual' ? 'Pontual' : 'Mensal'})`,
      amount: client.monthlyValue,
      paymentDate: formattedPaymentDate,
      paymentMethod: 'Boleto',
      status: client.status === 'Ativo' ? 'Em Espera' : 'Pago',
      month: currentMonthStr,
      dueDate,
      isBoletoGenerated: true
    };
  };

  // Client Handlers
  const handleAddClient = (newClient: ClientItem) => {
    setClients((prev) => {
      const next = [newClient, ...prev];
      if (currentTenant?.id) apiService.saveClients(next, currentTenant.id);
      return next;
    });

    // Auto-launch Revenue Entry into Financeiro
    const revEntry = createOrUpdateRevenueFromClient(newClient);
    setRevenues((prev) => {
      const filtered = prev.filter((r) => r.id !== revEntry.id);
      const nextRevenues = [revEntry, ...filtered];
      if (currentTenant?.id) apiService.saveRevenues(nextRevenues, currentTenant.id);
      return nextRevenues;
    });
  };

  const handleUpdateClient = (updatedClient: ClientItem) => {
    setClients((prev) => {
      const next = prev.map((c) => (c.id === updatedClient.id ? updatedClient : c));
      if (currentTenant?.id) apiService.saveClients(next, currentTenant.id);
      return next;
    });

    // Auto-sync Revenue Entry in Financeiro
    const revEntry = createOrUpdateRevenueFromClient(updatedClient);
    setRevenues((prev) => {
      const filtered = prev.filter((r) => r.id !== revEntry.id);
      const nextRevenues = [revEntry, ...filtered];
      if (currentTenant?.id) apiService.saveRevenues(nextRevenues, currentTenant.id);
      return nextRevenues;
    });
  };

  const handleDeleteClient = (id: string) => {
    setClients((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (currentTenant?.id) apiService.saveClients(next, currentTenant.id);
      return next;
    });

    // Remove associated Revenue entry
    setRevenues((prev) => {
      const nextRevenues = prev.filter((r) => r.id !== 'rev_cli_' + id);
      if (currentTenant?.id) apiService.saveRevenues(nextRevenues, currentTenant.id);
      return nextRevenues;
    });
  };

  // Workspace / Tenant Handlers
  const handleAddTenant = (newTenant: Tenant) => {
    setTenants((prev) => [...prev, newTenant]);
  };

  const handleUpdateTenant = (updatedTenant: Tenant) => {
    setTenants((prev) => prev.map((t) => (t.id === updatedTenant.id ? updatedTenant : t)));
    if (currentTenant.id === updatedTenant.id) {
      setCurrentTenant(updatedTenant);
    }
  };

  const handleDeleteTenant = (tenantId: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== tenantId));
  };

  // Lead handlers
  const handleAddLeads = (newLeads: Partial<Lead>[]) => {
    const createdList: Lead[] = newLeads.map((nl, idx) => ({
      id: 'l_new_' + (leads.length + idx + 1) + '_' + Date.now(),
      name: nl.name || 'Novo Lead',
      email: nl.email || 'lead@empresa.com',
      phone: nl.phone || '+55 11 99999-0000',
      company: nl.company || 'Empresa Exemplo',
      role: nl.role || 'Gerente Comercial',
      responsibleName: nl.responsibleName || currentUser.name,
      initiatorName: nl.initiatorName || 'Meta Ads',
      interestLevel: nl.interestLevel || 'Alto',
      interestCategory: nl.interestCategory || 'CRM Enterprise',
      tags: nl.tags || ['Novo Lead'],
      status: nl.status || 'Novo',
      source: nl.source || 'Meta Ads',
      score: nl.score || 80,
      scoreLabel: (nl.score || 80) >= 80 ? 'Hot' : 'Warm',
      value: nl.value || 15000,
      createdAt: new Date().toISOString().split('T')[0],
      lastInteraction: 'Recém adicionado',
      avatar: nl.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isSleeping: false,
      isFeatured: nl.isFeatured || false,
      notes: nl.notes || 'Novo contato cadastrado.',
      timeline: nl.timeline || {
        emailReceived: true,
        emailOpened: false,
        whatsappSent: false,
        whatsappResponded: false,
        conversationContinued: false,
        callMade: false,
        inPersonVisit: false,
        meetingScheduled: false,
        proposalSent: false,
        counterProposal: false,
        conclusion: 'Em Andamento'
      }
    }));

    setLeads((prev) => {
      const next = [...createdList, ...prev];
      if (currentTenant?.id) apiService.saveLeads(next, currentTenant.id);
      return next;
    });
  };

  const handleUpdateLead = (updated: Lead) => {
    setLeads((prev) => {
      const next = prev.map((l) => (l.id === updated.id ? updated : l));
      if (currentTenant?.id) apiService.saveLeads(next, currentTenant.id);
      return next;
    });

    // Auto sync to Calendar if meeting scheduled!
    if (updated.timeline.meetingScheduled) {
      const newEvt: CalendarEvent = {
        id: 'cal_' + Date.now(),
        title: `Reunião Agendada com ${updated.name}`,
        date: new Date().toISOString().split('T')[0],
        time: '15:00',
        leadName: updated.name,
        company: updated.company,
        meetUrl: `https://meet.google.com/grw-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`,
        syncedWithGoogle: true,
        type: 'reuniao'
      };
      setEvents((prev) => {
        const next = [newEvt, ...prev];
        if (currentTenant?.id) apiService.saveEvents(next, currentTenant.id);
        return next;
      });
    }
  };

  const handleBulkUpdateLeads = (leadIds: string[], updates: Partial<Lead>) => {
    setLeads((prev) => {
      const next = prev.map((l) => (leadIds.includes(l.id) ? { ...l, ...updates } : l));
      if (currentTenant?.id) apiService.saveLeads(next, currentTenant.id);
      return next;
    });
  };

  const handleDeleteLeads = (ids: string[]) => {
    setLeads((prev) => {
      const next = prev.filter((l) => !ids.includes(l.id));
      if (currentTenant?.id) apiService.saveLeads(next, currentTenant.id);
      return next;
    });
  };

  const handleSyncLeadOpenedEmail = (leadId: string) => {
    setLeads((prev) => {
      const next = prev.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            timeline: {
              ...l.timeline,
              emailOpened: true
            },
            status: l.status === 'Novo' ? 'Qualificado' : l.status
          };
        }
        return l;
      });
      if (currentTenant?.id) apiService.saveLeads(next, currentTenant.id);
      return next;
    });
  };

  // Dashboard Task Handlers
  const handleToggleTaskComplete = (id: string) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, completed: !t.completed, status: (!t.completed ? 'concluida' : 'em_espera') as any } : t));
      if (currentTenant?.id) apiService.saveTasks(next, currentTenant.id);
      return next;
    });
  };

  const handleAddTask = (task: TaskItem) => {
    setTasks((prev) => {
      const next = [task, ...prev];
      if (currentTenant?.id) apiService.saveTasks(next, currentTenant.id);
      return next;
    });
  };

  // Kanban Handlers
  const handleMoveDeal = (dealId: string, newStageId: KanbanStageId) => {
    setDeals((prev) => {
      const next = prev.map((d) => (d.id === dealId ? { ...d, stageId: newStageId } : d));
      if (currentTenant?.id) apiService.saveDeals(next, currentTenant.id);
      return next;
    });
  };

  const handleAddDeal = (deal: DealCard) => {
    setDeals((prev) => {
      const next = [deal, ...prev];
      if (currentTenant?.id) apiService.saveDeals(next, currentTenant.id);
      return next;
    });
  };

  // Campaign Handlers
  const handleAddEmailCampaign = (c: EmailCampaign) => {
    setEmailCampaigns((prev) => {
      const next = [c, ...prev];
      if (currentTenant?.id) apiService.saveEmailCampaigns(next, currentTenant.id);
      return next;
    });
  };

  const handleToggleMetaStatus = (id: string) => {
    setMetaCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'Ativa' ? 'Pausada' : 'Ativa' }
          : c
      )
    );
  };

  const handleUpdateCampaignPrompt = (id: string, newPrompt: string) => {
    setMetaCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, customPrompt: newPrompt } : c))
    );
  };

  // Automation Handlers
  const handleToggleFlowActive = (id: string) => {
    setAutomationFlows((prev) =>
      prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f))
    );
  };

  const handleUpdateFlow = (updated: AutomationFlow) => {
    setAutomationFlows((prev) =>
      prev.map((f) => (f.id === updated.id ? updated : f))
    );
  };

  // Content Studio Handlers
  const handleAddPost = (post: ContentPost) => {
    setContentPosts((prev) => [post, ...prev]);
  };

  const handleUpdatePostStatus = (id: string, status: ContentPost['status']) => {
    setContentPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  React.useEffect(() => {
    try {
      if (isAuthenticated) {
        localStorage.setItem('growie_is_authenticated', 'true');
        if (currentUser?.id) {
          localStorage.setItem('growie_logged_user_id', currentUser.id);
          localStorage.setItem('growie_current_user_obj', JSON.stringify(currentUser));
        }
      }
    } catch (e) {}
  }, [isAuthenticated, currentUser]);

  const handleLogout = () => {
    try {
      localStorage.setItem('growie_is_authenticated', 'false');
      localStorage.removeItem('growie_logged_user_id');
      localStorage.removeItem('growie_current_user_obj');
    } catch (e) {}
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <AuthScreen
        onLoginSuccess={(user, tenant) => {
          const safeUser = user || userList[0] || mockUser;
          const safeTenant = tenant || tenants[0] || mockTenants[0];

          setUserList((prev) => {
            const list = Array.isArray(prev) ? prev : [];
            if (!list.some(u => u && u.id === safeUser.id)) {
              const next = [...list, safeUser];
              apiService.saveUsers(next);
              return next;
            }
            return list;
          });

          setCurrentUser(safeUser);
          setCurrentTenant(safeTenant);
          setIsAuthenticated(true);

          try {
            localStorage.setItem('growie_is_authenticated', 'true');
            localStorage.setItem('growie_logged_user_id', safeUser.id);
            localStorage.setItem('growie_current_user_obj', JSON.stringify(safeUser));
          } catch (e) {}
        }}
        tenants={tenants}
        users={userList}
      />
    );
  }

  return (
    <div className="min-h-screen bg-growie-bg text-growie-dark font-sans flex antialiased">
      {/* Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        currentTenant={currentTenant}
        currentUser={currentUser}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Wrapper */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
      }`}>
        {/* Top Header */}
        <Header
          user={currentUser}
          tenants={tenants}
          currentTenant={currentTenant}
          onSelectTenant={setCurrentTenant}
          isCollapsed={isSidebarCollapsed}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenWorkspaceManager={() => setIsWorkspaceManagerOpen(true)}
          onToggleCopilotWidget={() => setIsFloatingCopilotOpen(!isFloatingCopilotOpen)}
          onOpenNewLeadModal={() => {
            setIsSingleLeadModalOpen(true);
            setActiveTab('leads');
          }}
          onLogout={handleLogout}
          users={userList}
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onAddTenant={handleAddTenant}
          onUpdateTenant={handleUpdateTenant}
          onDeleteTenant={handleDeleteTenant}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Content Area */}
        <main className="flex-1 p-3 sm:p-6 pb-20 mt-16 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              metrics={mockMetrics}
              leads={leads}
              deals={deals}
              waitingClients={waitingClients}
              tasks={tasks}
              users={userList}
              onToggleTaskComplete={handleToggleTaskComplete}
              onAddTask={handleAddTask}
              onAddLeads={handleAddLeads}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsView
              leads={leads}
              onAddLeads={handleAddLeads}
              onUpdateLead={handleUpdateLead}
              onBulkUpdateLeads={handleBulkUpdateLeads}
              onDeleteLeads={handleDeleteLeads}
              onNavigateTab={setActiveTab}
              users={userList}
            />
          )}

          {activeTab === 'clientes' && (
            <ClientsView
              clients={clients}
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
            />
          )}

          {activeTab === 'campanhas' && (
            <div className="space-y-6">
              {/* Module Sub-tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setCampaignsSubTab('email')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                    campaignsSubTab === 'email'
                      ? 'bg-growie-purple text-white shadow-glow-lilac'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  E-mail Marketing Integration & Rastreio
                </button>
                <button
                  onClick={() => setCampaignsSubTab('meta')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                    campaignsSubTab === 'meta'
                      ? 'bg-growie-purple text-white shadow-glow-lilac'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  Painel Meta Ads & Prompts de Público
                </button>
              </div>

              {campaignsSubTab === 'email' ? (
                <EmailBuilder
                  campaigns={emailCampaigns}
                  leads={leads}
                  currentUser={currentUser}
                  currentTenant={currentTenant}
                  onAddCampaign={handleAddEmailCampaign}
                  onUpdateCampaign={(updated) => setEmailCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))}
                  onDeleteCampaign={(id) => setEmailCampaigns((prev) => prev.filter((c) => c.id !== id))}
                  onSyncLeadOpenedEmail={handleSyncLeadOpenedEmail}
                />
              ) : (
                <MetaAdsPanel
                  metaCampaigns={metaCampaigns}
                  onToggleCampaignStatus={handleToggleMetaStatus}
                  onUpdateCampaignPrompt={handleUpdateCampaignPrompt}
                  onNavigateTab={setActiveTab}
                />
              )}
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-6">
              {/* Module Sub-tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setBusinessSubTab('kanban')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                    businessSubTab === 'kanban'
                      ? 'bg-growie-purple text-white shadow-glow-lilac'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  Visão Kanban de Negócios (7 Estágios)
                </button>
                <button
                  onClick={() => setBusinessSubTab('automation')}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                    businessSubTab === 'automation'
                      ? 'bg-growie-purple text-white shadow-glow-lilac'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  Builder de Automação Visual (Gatilho → Ação)
                </button>
              </div>

              {businessSubTab === 'kanban' ? (
                <KanbanBoard
                  stages={mockStages}
                  deals={deals}
                  leads={leads}
                  onMoveDeal={handleMoveDeal}
                  onAddDeal={handleAddDeal}
                />
              ) : (
                <AutomationBuilder
                  flows={automationFlows}
                  onToggleFlowActive={handleToggleFlowActive}
                  onUpdateFlow={handleUpdateFlow}
                />
              )}
            </div>
          )}

          {activeTab === 'agenda' && (
            <CalendarView
              currentUser={currentUser}
              leads={leads}
              clients={clients}
              events={events}
              onAddEvent={(evt) => setEvents((prev) => [evt, ...prev])}
              onUpdateEvent={(updatedEvt) => setEvents((prev) => prev.map(e => e.id === updatedEvt.id ? updatedEvt : e))}
              onDeleteEvent={(id) => setEvents((prev) => prev.filter(e => e.id !== id))}
            />
          )}

          {activeTab === 'financeiro' && (
            currentUser.role === 'Gestor Comercial' ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-card-soft text-center space-y-4 max-w-xl mx-auto my-12 animate-in fade-in">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto text-2xl font-bold">
                  🔒
                </div>
                <h2 className="text-xl font-extrabold text-growie-dark font-sans">Acesso Restrito a Administradores</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Seu perfil de usuário está definido como <strong>{currentUser.role}</strong>. Você tem acesso livre a Leads, Clientes, Campanhas, Vendas, Agenda, Conteúdos e Copilot IA, mas o módulo Financeiro é exclusivo para Administradores.
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-5 py-2.5 rounded-xl bg-growie-purple text-white font-extrabold text-xs shadow-glow-lilac hover:bg-purple-800"
                >
                  Voltar para o Dashboard
                </button>
              </div>
            ) : (
              <FinancialView
                revenues={revenues}
                expenses={expenses}
                profitSplit={profitSplit}
                clients={clients}
                onAddRevenue={(rev) => setRevenues((prev) => [rev, ...prev])}
                onUpdateRevenue={(updatedRev) => setRevenues((prev) => prev.map(r => r.id === updatedRev.id ? updatedRev : r))}
                onDeleteRevenue={(id) => setRevenues((prev) => prev.filter(r => r.id !== id))}
                onAddExpense={(exp) => setExpenses((prev) => [exp, ...prev])}
                onUpdateExpense={(updatedExp) => setExpenses((prev) => prev.map(e => e.id === updatedExp.id ? updatedExp : e))}
                onDeleteExpense={(id) => setExpenses((prev) => prev.filter(e => e.id !== id))}
                onUpdateProfitSplit={setProfitSplit}
              />
            )
          )}

          {/* Conteudos tab disabled por enquanto */}

          {activeTab === 'copilot' && (
            <GeminiCopilot onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'configuracoes' && (
            currentUser.role === 'Gestor Comercial' ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-card-soft text-center space-y-4 max-w-xl mx-auto my-12 animate-in fade-in">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto text-2xl font-bold">
                  🔒
                </div>
                <h2 className="text-xl font-extrabold text-growie-dark font-sans">Acesso Restrito a Administradores</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Seu perfil de usuário está definido como <strong>{currentUser.role}</strong>. As Configurações Globais e Chaves de Integrações da plataforma são restritas aos Administradores.
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-5 py-2.5 rounded-xl bg-growie-purple text-white font-extrabold text-xs shadow-glow-lilac hover:bg-purple-800"
                >
                  Voltar para o Dashboard
                </button>
              </div>
            ) : (
              <SettingsView
                currentTenant={currentTenant}
                currentUser={currentUser}
                googleIntegrations={googleIntegrations}
                onUpdateGoogleIntegrations={setGoogleIntegrations}
                users={userList}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
              />
            )
          )}
        </main>
      </div>

      {/* Floating Gemini Copilot Drawer */}
      <FloatingCopilotWidget
        isOpen={isFloatingCopilotOpen}
        onToggle={() => setIsFloatingCopilotOpen(!isFloatingCopilotOpen)}
      />

      {/* Auth & Multi-tenant Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={setCurrentUser}
        tenants={tenants}
        currentTenant={currentTenant}
        onSelectTenant={setCurrentTenant}
        userList={userList}
        onAddUser={handleAddUser}
      />

      {/* Root Floating Workspace Manager Modal */}
      <WorkspaceManagerModal
        isOpen={isWorkspaceManagerOpen}
        onClose={() => setIsWorkspaceManagerOpen(false)}
        tenants={tenants}
        currentTenant={currentTenant}
        onSelectTenant={setCurrentTenant}
        onAddTenant={handleAddTenant}
        onUpdateTenant={handleUpdateTenant}
        onDeleteTenant={handleDeleteTenant}
      />

      {/* Live Email Open Toast Notification Banner */}
      {liveToastNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-growie-dark text-white p-4 rounded-2xl shadow-2xl border border-growie-purple/50 flex items-center gap-3 animate-in slide-in-from-bottom-5 max-w-sm font-sans">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-growie-cyan flex items-center justify-center font-bold shrink-0 text-lg">
            👁️
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-growie-cyan">{liveToastNotification.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{liveToastNotification.message}</p>
          </div>
          <button
            onClick={() => setLiveToastNotification(null)}
            className="text-slate-400 hover:text-white p-1 ml-auto font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
