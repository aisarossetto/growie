import { 
  Tenant, 
  User, 
  Lead, 
  EmailCampaign, 
  MetaAdCampaign, 
  DealCard, 
  StageInfo, 
  AutomationFlow, 
  MetricCardData,
  TaskItem,
  WaitingClient,
  ContentPost,
  BrandGuidelines,
  GoogleIntegrations,
  ReferenceTemplate
} from '../types';

export const mockTenants: Tenant[] = [
  { id: '1', name: 'Growie Enterprise - Matriz', plan: 'Enterprise', membersCount: 2 }
];

export const defaultUsersList: User[] = [
  {
    id: 'u_1786660498707',
    name: 'Isadora Rossetto',
    email: 'isadoragschirmer@gmail.com',
    password: '20042011',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'u_1787061362033',
    name: 'Ciany Schirmer',
    email: 'cianyschirmer@gmail.com',
    password: '20042011',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  }
];

export const mockUser: User = defaultUsersList[0];

export const mockReferenceTemplates: ReferenceTemplate[] = [
  {
    id: 'rt1',
    title: 'Modelo Carrossel Campeão: Estudo de Caso SaaS',
    format: 'carousel',
    sampleText: 'Slide 1: Como a empresa X aumentou o faturamento em 340%\nSlide 2: O problema: atritos de atendimento no WhatsApp\nSlide 3: A solução Growie CRM com IA preditiva\nSlide 4: Resultados em 30 dias de uso\nSlide 5: Link na bio para teste exclusivo',
    structureDescription: 'Estrutura em 5 slides com Hook de Alto Impacto, Problema Agitado, Solução Growie, Prova Social e CTA direta.',
    performanceBadge: '+340% Conversão'
  }
];

export const mockBrandGuidelines: BrandGuidelines = {
  logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
  toneOfVoice: 'Profissional & Persuasivo B2B',
  forbiddenWords: ['milagre', 'garantido 100%', 'fácil demais', 'barato'],
  mandatoryWords: ['Growie CRM', 'IA Preditiva', 'Alta Conversão', 'WhatsApp API Cloud'],
  contentPillars: ['Autoridade Comercial', 'Quebra de Objeções B2B', 'Estudo de Caso & Prova Social', 'Tutoriais Práticos'],
  masterCreativePrompt: `Você é o Diretor de Criação da Growie. Sempre estruture os criativos e posts seguindo a identidade visual da empresa (cores #050021 e #463d94 com acentos em #00afef e #8A70D6).
Foque em entregar conteúdos B2B de alto valor para decisores comerciais, utilizando linguagem clara, sem enrolação e focada em retorno sobre investimento (ROI).`,
  referenceTemplates: mockReferenceTemplates
};

// Campos de credenciais limpos/em branco para o usuário preencher com os dados reais
export const mockGoogleIntegrations: GoogleIntegrations = {
  ga4PropertyId: '', // Em branco para preenchimento real
  ga4Connected: false,
  ga4UsersMonth: 0,
  searchConsoleConnected: false,
  searchConsoleAvgPosition: 0,
  searchConsoleClicks: 0,
  googleBusinessConnected: false,
  googleBusinessRating: 0,
  googleBusinessReviewsCount: 0,
  googleBusinessCallsCount: 0
};

export const mockMetrics: MetricCardData[] = [
  {
    title: 'MRR (Receita Recorrente)',
    value: 'R$ 0,00',
    change: '0.0%',
    isPositive: true,
    icon: 'TrendingUp',
    description: 'Aguardando primeiros contratos'
  },
  {
    title: 'ROI de Campanhas',
    value: '0%',
    change: '0.0%',
    isPositive: true,
    icon: 'Zap',
    description: 'Conecte o Meta Ads e Email'
  },
  {
    title: 'CAC Estimado',
    value: 'R$ 0,00',
    change: '0.0%',
    isPositive: true,
    icon: 'DollarSign',
    description: 'Custo de Aquisição por Cliente'
  },
  {
    title: 'Taxa Abertura E-mail',
    value: '0.0%',
    change: '0.0%',
    isPositive: true,
    icon: 'Mail',
    description: 'Dispare sua primeira campanha'
  },
  {
    title: 'Resposta WhatsApp',
    value: '0.0%',
    change: '0.0%',
    isPositive: true,
    icon: 'MessageSquare',
    description: 'Conecte o WhatsApp Cloud API'
  }
];

export const mockWaitingClients: WaitingClient[] = [];
export const mockTasks: TaskItem[] = [];

// Base de Leads inicial LIMPA (zerada) pronta para produção
export const mockLeads: Lead[] = [];

// Função auxiliar para carregar leads de teste se o usuário desejar
export const getSampleDemoLeads = (): Lead[] => [
  {
    id: 'l1',
    name: 'Carolina Mendes',
    email: 'carolina.mendes@fintechx.com.br',
    phone: '+55 11 98844-1234',
    company: 'FintechX Brasil',
    role: 'Head de Marketing',
    responsibleName: 'Gabriel Ribeiro',
    initiatorName: 'Meta Ads Campaign #01',
    interestLevel: 'Muito Alto',
    interestCategory: 'CRM Enterprise + API WhatsApp',
    tags: ['Decisor', 'Meta Ads', 'Alta Renda'],
    status: 'Em Negociação',
    source: 'Meta Ads',
    score: 94,
    scoreLabel: 'Hot',
    value: 35000,
    createdAt: '2026-08-10',
    lastInteraction: 'Há 12 min via WhatsApp',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isSleeping: false,
    isFeatured: true, // Lead em Destaque
    notes: 'Cliente demonstrou alto interesse na funcionalidade de IA Copilot e busca migração em até 15 dias.',
    timeline: {
      emailReceived: true,
      emailOpened: true,
      whatsappSent: true,
      whatsappResponded: true,
      conversationContinued: true,
      callMade: true,
      inPersonVisit: false,
      meetingScheduled: true,
      proposalSent: true,
      counterProposal: true,
      justification: 'Ajuste de condições comerciais em andamento',
      conclusion: 'Em Andamento'
    }
  },
  {
    id: 'l2',
    name: 'Rodrigo Albuquerque',
    email: 'rodrigo@logisticafuturo.com',
    phone: '+55 41 99781-5544',
    company: 'Logística do Futuro',
    role: 'CEO & Founder',
    responsibleName: 'Juliana Costa',
    initiatorName: 'Outbound Prospecção SDR',
    interestLevel: 'Alto',
    interestCategory: 'Automação Comercial B2B',
    tags: ['Enterprise', 'B2B', 'Inbound'],
    status: 'Qualificado',
    source: 'Google Ads',
    score: 86,
    scoreLabel: 'Hot',
    value: 28000,
    createdAt: '2026-08-11',
    lastInteraction: 'Abriu e-mail comercial',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    isSleeping: false,
    isFeatured: true, // Lead em Destaque
    notes: 'Empresa com time de 12 SDRs necessitando de acompanhamento de funil visual.',
    timeline: {
      emailReceived: true,
      emailOpened: true,
      whatsappSent: true,
      whatsappResponded: true,
      conversationContinued: true,
      callMade: true,
      inPersonVisit: false,
      meetingScheduled: true,
      proposalSent: false,
      counterProposal: false,
      conclusion: 'Em Andamento'
    }
  }
];

export const mockStages: StageInfo[] = [
  { id: 'lead_recebido', title: '1. Lead Recebido', color: 'border-slate-300 bg-slate-50', conversionRate: 85 },
  { id: 'email_enviado', title: '2. E-mail Enviado', color: 'border-indigo-200 bg-indigo-50/40', conversionRate: 68 },
  { id: 'engajado', title: '3. Engajado (Abriu E-mail)', color: 'border-purple-300 bg-purple-50/40', conversionRate: 52 },
  { id: 'contato_whatsapp', title: '4. Contato WhatsApp', color: 'border-emerald-300 bg-emerald-50/40', conversionRate: 44 },
  { id: 'reuniao_agendada', title: '5. Reunião Agendada', color: 'border-cyan-300 bg-cyan-50/40', conversionRate: 35 },
  { id: 'proposta', title: '6. Proposta Enviada', color: 'border-amber-300 bg-amber-50/40', conversionRate: 28 },
  { id: 'fechado_pausado_perdido', title: '7. Fechado / Pausado', color: 'border-growie-lilac bg-purple-100/50', conversionRate: 22 },
];

export const mockDeals: DealCard[] = [];
export const mockEmailCampaigns: EmailCampaign[] = [];
export const mockMetaCampaigns: MetaAdCampaign[] = [];
export const mockAutomationFlows: AutomationFlow[] = [];
export const mockContentPosts: ContentPost[] = [];
