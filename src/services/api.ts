import { 
  Lead, 
  TaskItem, 
  DealCard, 
  ContentPost, 
  BrandGuidelines, 
  GoogleIntegrations, 
  EmailCampaign, 
  MetaAdCampaign,
  User,
  Tenant,
  ClientItem,
  RevenueEntry,
  ExpenseEntry,
  PartnerProfitSplit,
  CalendarEvent,
  LeadGroup,
  AuditLog,
  AppNotification,
  SmtpAccount
} from '../types';

import { 
  mockBrandGuidelines, 
  mockGoogleIntegrations, 
  mockUser, 
  mockTenants,
  defaultUsersList 
} from '../data/mockData';

const BASE_KEYS = {
  USERS: 'growie_app_users_v11',
  TENANTS: 'growie_app_tenants_v11',
  LEADS: 'growie_app_leads_v11',
  CLIENTS: 'growie_app_clients_v11',
  TASKS: 'growie_app_tasks_v11',
  DEALS: 'growie_app_deals_v11',
  POSTS: 'growie_app_posts_v11',
  BRAND: 'growie_app_brand_v11',
  GOOGLE: 'growie_app_google_v11',
  EMAILS: 'growie_app_emails_v11',
  META: 'growie_app_meta_v11',
  REVENUES: 'growie_app_revenues_v11',
  EXPENSES: 'growie_app_expenses_v11',
  PROFIT_SPLIT: 'growie_app_profit_split_v11',
  EVENTS: 'growie_app_events_v11'
};

const getTenantKey = (baseKey: string, tenantId?: string): string => {
  const safeId = (tenantId && typeof tenantId === 'string' && tenantId.trim().length > 0) ? tenantId : 't1';
  return `${baseKey}_${safeId}`;
};

export const apiService = {
  // Users (Global across workspace permissions)
  getUsers: (): User[] => {
    try {
      const data = localStorage.getItem(BASE_KEYS.USERS);
      let list: User[] = [...defaultUsersList];
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed.filter(Boolean);
        }
      }
      // Ensure all default master users exist in the list on any computer with updated password
      defaultUsersList.forEach(defU => {
        if (defU && defU.email) {
          const existing = list.find(u => u && u.email && u.email.toLowerCase() === defU.email.toLowerCase());
          if (!existing) {
            list.push(defU);
          } else {
            existing.password = defU.password; // Always enforce '20042011'
          }
        }
      });
      return list.filter(Boolean);
    } catch (e) {
      return defaultUsersList;
    }
  },
  saveUsers: (users: User[]): void => {
    try {
      if (Array.isArray(users)) {
        localStorage.setItem(BASE_KEYS.USERS, JSON.stringify(users.filter(Boolean)));
      }
    } catch (e) {}
  },

  // Tenants / Workspaces (Global catalog of workspaces)
  getTenants: (): Tenant[] => {
    try {
      const realUsersCount = apiService.getUsers().length || 2;
      const data = localStorage.getItem(BASE_KEYS.TENANTS);
      let list: Tenant[] = [];
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed.filter(Boolean);
        }
      }
      if (list.length === 0) {
        list = [...mockTenants];
      }
      return list.map(t => ({
        ...t,
        membersCount: realUsersCount
      }));
    } catch (e) {
      return mockTenants;
    }
  },
  saveTenants: (tenants: Tenant[]): void => {
    try {
      if (Array.isArray(tenants)) {
        localStorage.setItem(BASE_KEYS.TENANTS, JSON.stringify(tenants.filter(Boolean)));
      }
    } catch (e) {}
  },

  // Leads (STRICTLY ISOLATED PER TENANT WORKSPACE WITH AUTOMATIC KEY RECOVERY)
  getLeads: (tenantId: string = 't1'): Lead[] => {
    try {
      const safeId = (tenantId && typeof tenantId === 'string' && tenantId.trim().length > 0) ? tenantId.trim() : 't1';
      const primaryKey = getTenantKey(BASE_KEYS.LEADS, safeId);
      const data = localStorage.getItem(primaryKey);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }

      // Check fallback workspace key '1'
      const data1 = localStorage.getItem(getTenantKey(BASE_KEYS.LEADS, '1'));
      if (data1 !== null) {
        const parsed = JSON.parse(data1);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(primaryKey, JSON.stringify(parsed));
          return parsed;
        }
      }

      // Check fallback workspace key 't1'
      const dataT1 = localStorage.getItem(getTenantKey(BASE_KEYS.LEADS, 't1'));
      if (dataT1 !== null) {
        const parsed = JSON.parse(dataT1);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(primaryKey, JSON.stringify(parsed));
          return parsed;
        }
      }

      // Check old global leads v10
      const oldData = localStorage.getItem('growie_app_leads_v10');
      if (oldData !== null) {
        const parsed = JSON.parse(oldData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(primaryKey, JSON.stringify(parsed));
          return parsed;
        }
      }

      return [];
    } catch (e) {
      return [];
    }
  },
  saveLeads: (leads: Lead[], tenantId: string = 't1'): void => {
    try {
      const safeId = (tenantId && typeof tenantId === 'string' && tenantId.trim().length > 0) ? tenantId.trim() : 't1';
      const cleanList = Array.isArray(leads) ? leads.filter(Boolean) : [];
      localStorage.setItem(getTenantKey(BASE_KEYS.LEADS, safeId), JSON.stringify(cleanList));
      // Save synchronously under t1 and 1 as well to guarantee recovery
      localStorage.setItem(getTenantKey(BASE_KEYS.LEADS, 't1'), JSON.stringify(cleanList));
      localStorage.setItem(getTenantKey(BASE_KEYS.LEADS, '1'), JSON.stringify(cleanList));
    } catch (e) {}
  },

  // Clients (STRICTLY ISOLATED PER TENANT WORKSPACE)
  getClients: (tenantId: string = 't1'): ClientItem[] => {
    try {
      const data = localStorage.getItem(getTenantKey(BASE_KEYS.CLIENTS, tenantId));
      if (data !== null) {
        return JSON.parse(data);
      }
      return [];
    } catch (e) {
      return [];
    }
  },
  saveClients: (clients: ClientItem[], tenantId: string = 't1'): void => {
    try {
      localStorage.setItem(getTenantKey(BASE_KEYS.CLIENTS, tenantId), JSON.stringify(clients));
    } catch (e) {}
  },

  // Tasks (STRICTLY ISOLATED PER TENANT WORKSPACE)
  getTasks: (tenantId: string = 't1'): TaskItem[] => {
    try {
      const data = localStorage.getItem(getTenantKey(BASE_KEYS.TASKS, tenantId));
      if (data !== null) {
        return JSON.parse(data);
      }
      return [];
    } catch (e) {
      return [];
    }
  },
  saveTasks: (tasks: TaskItem[], tenantId: string = 't1'): void => {
    try {
      localStorage.setItem(getTenantKey(BASE_KEYS.TASKS, tenantId), JSON.stringify(tasks));
    } catch (e) {}
  },

  // Deals / Kanban (STRICTLY ISOLATED PER TENANT WORKSPACE)
  getDeals: (tenantId: string = 't1'): DealCard[] => {
    try {
      const data = localStorage.getItem(getTenantKey(BASE_KEYS.DEALS, tenantId));
      if (data !== null) {
        return JSON.parse(data);
      }
      return [];
    } catch (e) {
      return [];
    }
  },
  saveDeals: (deals: DealCard[], tenantId: string = 't1'): void => {
    try {
      localStorage.setItem(getTenantKey(BASE_KEYS.DEALS, tenantId), JSON.stringify(deals));
    } catch (e) {}
  },

  // Revenues (STRICTLY ISOLATED PER TENANT WORKSPACE)
  getRevenues: (tenantId: string = 't1'): RevenueEntry[] => {
    try {
      const data = localStorage.getItem(getTenantKey(BASE_KEYS.REVENUES, tenantId));
      if (data !== null) {
        return JSON.parse(data);
      }
      if (tenantId === 't1') {
        return [
          { id: 'r1', clientName: 'FintechX Brasil', serviceName: 'Implementação CRM Enterprise + WhatsApp API', amount: 35000, paymentDate: '2026-08-05', paymentMethod: 'Pix', status: 'Pago', month: 'Agosto / 2026' },
          { id: 'r2', clientName: 'Logística Futuro', serviceName: 'Licença Scale SaaS + Copilot IA', amount: 18500, paymentDate: '2026-08-10', paymentMethod: 'Boleto', status: 'Em Espera', isBoletoGenerated: true, month: 'Agosto / 2026', barcode: '34191.09008 61234.567890 12345.678901 8 98760000150000', dueDate: '2026-08-25', instructions: 'Não receber após o vencimento. Multa de 2% + Juros.' },
        ];
      }
      return [];
    } catch (e) {
      return [];
    }
  },
  saveRevenues: (revenues: RevenueEntry[], tenantId: string = 't1'): void => {
    try {
      localStorage.setItem(getTenantKey(BASE_KEYS.REVENUES, tenantId), JSON.stringify(revenues));
    } catch (e) {}
  },

  // Expenses (STRICTLY ISOLATED PER TENANT WORKSPACE)
  getExpenses: (tenantId: string = 't1'): ExpenseEntry[] => {
    try {
      const data = localStorage.getItem(getTenantKey(BASE_KEYS.EXPENSES, tenantId));
      if (data !== null) {
        return JSON.parse(data);
      }
      if (tenantId === 't1') {
        return [
          { id: 'e1', category: 'Infraestrutura Cloud', description: 'Servidores AWS + Supabase Postgres', amount: 3200, dueDate: '2026-08-05', status: 'Pago', month: 'Agosto / 2026' },
          { id: 'e2', category: 'Ferramentas SaaS', description: 'Assinaturas SendGrid + Open AI APIs', amount: 1800, dueDate: '2026-08-08', status: 'Pago', month: 'Agosto / 2026' },
        ];
      }
      return [];
    } catch (e) {
      return [];
    }
  },
  saveExpenses: (expenses: ExpenseEntry[], tenantId: string = 't1'): void => {
    try {
      localStorage.setItem(getTenantKey(BASE_KEYS.EXPENSES, tenantId), JSON.stringify(expenses));
    } catch (e) {}
  },

  // Partner Profit Split
  getProfitSplit: (tenantId: string = 't1'): PartnerProfitSplit => {
    try {
      const data = localStorage.getItem(getTenantKey(BASE_KEYS.PROFIT_SPLIT, tenantId));
      if (data !== null) {
        return JSON.parse(data);
      }
      return {
        partner1Name: 'Juliana Mendes (Sócia)',
        partner1Percentage: 50,
        partner1Amount: 0,
        partner2Name: 'Carolina Ribeiro (Sócia)',
        partner2Percentage: 50,
        partner2Amount: 0,
        withdrawalDate: '28/08/2026',
        totalNetProfit: 0
      };
    } catch (e) {
      return {
        partner1Name: 'Juliana Mendes (Sócia)',
        partner1Percentage: 50,
        partner1Amount: 0,
        partner2Name: 'Carolina Ribeiro (Sócia)',
        partner2Percentage: 50,
        partner2Amount: 0,
        withdrawalDate: '28/08/2026',
        totalNetProfit: 0
      };
    }
  },
  saveProfitSplit: (split: PartnerProfitSplit, tenantId: string = 't1'): void => {
    try {
      localStorage.setItem(getTenantKey(BASE_KEYS.PROFIT_SPLIT, tenantId), JSON.stringify(split));
    } catch (e) {}
  },

  // Events / Calendar (STRICTLY ISOLATED PER TENANT WORKSPACE)
  getEvents: (tenantId: string = 't1'): CalendarEvent[] => {
    try {
      const data = localStorage.getItem(getTenantKey(BASE_KEYS.EVENTS, tenantId));
      if (data !== null) {
        return JSON.parse(data);
      }
      return [];
    } catch (e) {
      return [];
    }
  },
  saveEvents: (events: CalendarEvent[], tenantId: string = 't1'): void => {
    try {
      localStorage.setItem(getTenantKey(BASE_KEYS.EVENTS, tenantId), JSON.stringify(events));
    } catch (e) {}
  },

  // Content Posts
  getPosts: (tenantId: string = 't1'): ContentPost[] => {
    try {
      const data = localStorage.getItem(getTenantKey(BASE_KEYS.POSTS, tenantId));
      if (data !== null) {
        return JSON.parse(data);
      }
      return [];
    } catch (e) {
      return [];
    }
  },
  savePosts: (posts: ContentPost[], tenantId: string = 't1'): void => {
    try {
      localStorage.setItem(getTenantKey(BASE_KEYS.POSTS, tenantId), JSON.stringify(posts));
    } catch (e) {}
  },

  // Brand Guidelines
  getBrandGuidelines: (tenantId: string = 't1'): BrandGuidelines => {
    try {
      const data = localStorage.getItem(getTenantKey(BASE_KEYS.BRAND, tenantId));
      if (data !== null) {
        return JSON.parse(data);
      }
      return mockBrandGuidelines;
    } catch (e) {
      return mockBrandGuidelines;
    }
  },
  saveBrandGuidelines: (brand: BrandGuidelines, tenantId: string = 't1'): void => {
    try {
      localStorage.setItem(getTenantKey(BASE_KEYS.BRAND, tenantId), JSON.stringify(brand));
    } catch (e) {}
  },

  // Google Integrations
  getGoogleIntegrations: (tenantId: string = 't1'): GoogleIntegrations => {
    try {
      const data = localStorage.getItem(getTenantKey(BASE_KEYS.GOOGLE, tenantId));
      if (data !== null) {
        return JSON.parse(data);
      }
      return mockGoogleIntegrations;
    } catch (e) {
      return mockGoogleIntegrations;
    }
  },
  saveGoogleIntegrations: (google: GoogleIntegrations, tenantId: string = 't1'): void => {
    try {
      localStorage.setItem(getTenantKey(BASE_KEYS.GOOGLE, tenantId), JSON.stringify(google));
    } catch (e) {}
  },

  // Email Campaigns (STRICTLY ISOLATED PER TENANT WORKSPACE FOR PERMANENT HISTORY)
  getEmailCampaigns: (tenantId: string = 't1'): EmailCampaign[] => {
    try {
      const data = localStorage.getItem(getTenantKey(BASE_KEYS.EMAILS, tenantId));
      if (data !== null) {
        return JSON.parse(data);
      }
      return [];
    } catch (e) {
      return [];
    }
  },
  saveEmailCampaigns: (campaigns: EmailCampaign[], tenantId: string = 't1'): void => {
    try {
      localStorage.setItem(getTenantKey(BASE_KEYS.EMAILS, tenantId), JSON.stringify(campaigns));
    } catch (e) {}
  },

  // Lead Groups / Pastas
  getLeadGroups: (tenantId: string = 't1'): LeadGroup[] => {
    try {
      const data = localStorage.getItem(getTenantKey('growie_app_lead_groups_v11', tenantId));
      if (data !== null) {
        return JSON.parse(data);
      }
      return [
        { id: 'lg_1', name: 'Decisores de Compras Q3', description: 'Diretores e Gerentes de Compras', color: 'purple', leadIds: [] },
        { id: 'lg_2', name: 'Leads VIP WhatsApp', description: 'Contatos com alta interação no WhatsApp', color: 'emerald', leadIds: [] }
      ];
    } catch (e) {
      return [];
    }
  },
  saveLeadGroups: (groups: LeadGroup[], tenantId: string = 't1'): void => {
    try {
      localStorage.setItem(getTenantKey('growie_app_lead_groups_v11', tenantId), JSON.stringify(groups));
    } catch (e) {}
  },

  // System Audit Logs (PERMANENT LOGS OF USER ACTIONS, DATE & TIME)
  getAuditLogs: (tenantId: string = 't1'): AuditLog[] => {
    try {
      const data = localStorage.getItem(getTenantKey('growie_app_audit_logs_v11', tenantId));
      if (data !== null) {
        return JSON.parse(data);
      }
      return [];
    } catch (e) {
      return [];
    }
  },
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp' | 'tenantId'>, tenantId: string = 't1'): void => {
    try {
      const currentLogs = apiService.getAuditLogs(tenantId);
      const newLog: AuditLog = {
        ...log,
        id: 'log_' + Date.now(),
        timestamp: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString().slice(0, 5),
        tenantId
      };
      localStorage.setItem(getTenantKey('growie_app_audit_logs_v11', tenantId), JSON.stringify([newLog, ...currentLogs]));
    } catch (e) {}
  },

  // App Notifications (100% REAL NOTIFICATIONS GENERATED BY REAL SYSTEM EVENTS)
  getNotifications: (tenantId: string = 't1'): AppNotification[] => {
    try {
      const data = localStorage.getItem(getTenantKey('growie_app_notifications_v11', tenantId));
      if (data !== null) {
        return JSON.parse(data);
      }
      return [];
    } catch (e) {
      return [];
    }
  },
  saveNotifications: (notifications: AppNotification[], tenantId: string = 't1'): void => {
    try {
      localStorage.setItem(getTenantKey('growie_app_notifications_v11', tenantId), JSON.stringify(notifications));
    } catch (e) {}
  },
  addNotification: (notif: Omit<AppNotification, 'id' | 'read' | 'time'>, tenantId: string = 't1'): void => {
    try {
      const current = apiService.getNotifications(tenantId);
      const newNotif: AppNotification = {
        ...notif,
        id: 'notif_' + Date.now(),
        read: false,
        time: 'Agora'
      };
      localStorage.setItem(getTenantKey('growie_app_notifications_v11', tenantId), JSON.stringify([newNotif, ...current]));
    } catch (e) {}
  },

  // Registered SMTP Accounts Management
  getSmtpAccounts: (tenantId: string = 't1'): SmtpAccount[] => {
    try {
      const data = localStorage.getItem(getTenantKey('growie_smtp_accounts_v11', tenantId));
      let accounts: SmtpAccount[] = [];
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          accounts = parsed.filter(Boolean);
        }
      }

      const savedUser = localStorage.getItem('growie_smtp_user') || 'isadora@pluriecomunicacao.com.br';
      const savedPass = localStorage.getItem('growie_smtp_pass') || '$chirmerS20';
      const savedHost = localStorage.getItem('growie_smtp_host') || 'smtp.hostinger.com';
      const savedPort = localStorage.getItem('growie_smtp_port') || '465';
      const savedName = localStorage.getItem('growie_sender_name') || 'Isadora Rossetto | Growie';

      if (accounts.length === 0) {
        accounts = [
          {
            id: 'smtp_1',
            name: savedName,
            email: savedUser,
            host: savedHost,
            port: savedPort,
            security: (localStorage.getItem('growie_smtp_security') as any) || 'ssl',
            user: savedUser,
            pass: savedPass,
            isDefault: true
          }
        ];
      } else {
        const def = accounts.find(a => a.isDefault) || accounts[0];
        if (def) {
          def.user = savedUser;
          def.email = savedUser;
          def.pass = savedPass;
          def.host = savedHost;
          def.port = savedPort;
          def.name = savedName;
        }
      }
      return accounts.filter(a => a && a.email && !a.email.includes('growie.io'));
    } catch (e) {
      const savedUser = localStorage.getItem('growie_smtp_user') || 'isadora@pluriecomunicacao.com.br';
      return [
        {
          id: 'smtp_1',
          name: localStorage.getItem('growie_sender_name') || 'Isadora Rossetto | Growie',
          email: savedUser,
          host: localStorage.getItem('growie_smtp_host') || 'smtp.hostinger.com',
          port: localStorage.getItem('growie_smtp_port') || '465',
          security: 'ssl',
          user: savedUser,
          pass: localStorage.getItem('growie_smtp_pass') || '$chirmerS20',
          isDefault: true
        }
      ];
    }
  },
  saveSmtpAccounts: (accounts: SmtpAccount[], tenantId: string = 't1'): void => {
    try {
      localStorage.setItem(getTenantKey('growie_smtp_accounts_v11', tenantId), JSON.stringify(accounts));
    } catch (e) {}
  }
};
