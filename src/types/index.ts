export const DEFAULT_USER_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='%236366f1'/><circle cx='50' cy='38' r='20' fill='%23ffffff'/><path d='M20 86c0-16.569 13.431-30 30-30s30 13.431 30 30' fill='%23ffffff'/></svg>";

export type TabType = 
  | 'dashboard' 
  | 'leads' 
  | 'clientes'
  | 'campanhas' 
  | 'business' 
  | 'agenda'
  | 'financeiro'
  | 'content' 
  | 'copilot' 
  | 'configuracoes';

export interface Tenant {
  id: string;
  name: string;
  plan: 'Growth' | 'Enterprise' | 'Scale';
  logo?: string;
  membersCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Gestor Comercial' | 'Closer' | 'SDR';
  avatar: string;
  password?: string;
}

export interface SmtpAccount {
  id: string;
  name: string;
  email: string;
  host: string;
  port: string;
  security: 'ssl' | 'tls' | 'none';
  user: string;
  pass: string;
  isDefault?: boolean;
}

export type LeadSource = 
  | 'Meta Ads' 
  | 'Google Ads' 
  | 'LinkedIn Ads' 
  | 'LinkedIn Outbound'
  | 'Landing Page'
  | 'Prospecção Fria' 
  | 'Lista Enviada' 
  | 'Importação em Massa'
  | 'Orgânico' 
  | 'Indicação';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: 'email_opened' | 'whatsapp_reply' | 'lead_advanced' | 'task_overdue' | 'meeting_reminder' | 'system';
}

export interface LeadInteractionTimeline {
  emailReceived: boolean;
  emailOpened: boolean;
  whatsappSent: boolean;
  whatsappResponded: boolean;
  conversationContinued: boolean;
  callMade: boolean;
  inPersonVisit: boolean;
  meetingScheduled: boolean;
  proposalSent: boolean;
  counterProposal: boolean;
  justification?: string;
  conclusion: 'Em Andamento' | 'Ganhos' | 'Recusado' | 'Sem Resposta';
}

export interface LeadCompanySectorContact {
  id: string;
  sectorName: string; // 'Marketing' | 'RH' | 'Compras' | 'Decisor / CEO' | 'Proprietário' | 'Financeiro' | 'TI' | 'Outro'
  contactName: string;
  email: string;
  phone: string;
  role?: string;
}

export interface LeadGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  leadIds: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
  tenantId: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  responsibleName: string;
  initiatorName: string;
  interestLevel: 'Muito Alto' | 'Alto' | 'Médio' | 'Baixo';
  interestCategory: string;
  tags: string[];
  status: 'Novo' | 'Qualificado' | 'Em Negociação' | 'Convertido' | 'Inativo';
  source: LeadSource;
  score: number;
  scoreLabel: 'Hot' | 'Warm' | 'Cold';
  value: number;
  createdAt: string;
  lastInteraction: string;
  avatar: string;
  isSleeping: boolean;
  isFeatured?: boolean;
  notes: string;
  timeline: LeadInteractionTimeline;
  city?: string;
  ramo?: string;
  duplicateWarning?: string;
  lastEmailModelSent?: string;
  groups?: string[];
  sectorContacts?: LeadCompanySectorContact[];
}

export interface ClientItem {
  id: string;
  company: string;
  document: string;
  contactName: string;
  email: string;
  phone: string;
  service: string;
  monthlyValue: number;
  status: 'Ativo' | 'Inativo' | 'Em Pausa';
  startDate: string;
}

export interface ColumnMapping {
  csvHeader: string;
  targetField: keyof Lead | 'ignore';
}

export interface EmailOpener {
  leadId: string;
  leadName: string;
  email: string;
  opened: boolean;
  openedAt?: string;
  clicked: boolean;
  clickedAt?: string;
  clickedUrl?: string;
  clicksCount: number;
  status: 'enviado' | 'aberto' | 'clicou';
}

export interface EmailCampaign {
  id: string;
  title: string;
  subject: string;
  status: 'Rascunho' | 'Agendada' | 'Enviada' | 'Em Andamento';
  sentCount: number;
  openRate: number;
  clickRate: number;
  scheduledFor?: string;
  content: string;
  signature?: string;
  attachments?: string[];
  openers?: EmailOpener[];
  recipientLeads?: EmailOpener[];
  folderName?: string;
  groupName?: string;
  sentByUserId?: string;
  sentByUserName?: string;
  sentAtFormatted?: string;
}

export interface MetaAdCampaign {
  id: string;
  name: string;
  status: 'Ativa' | 'Pausada' | 'Concluída';
  budget: number;
  spent: number;
  cpl: number;
  leadsGenerated: number;
  ctr: number;
  roas: number;
  customPrompt?: string;
  creativeAnalysis?: string;
  descriptionAnalysis?: string;
  headlineAnalysis?: string;
  audienceAnalysis?: string;
  leadQualityScore?: number;
}

export type KanbanStageId = 
  | 'lead_recebido' 
  | 'email_enviado' 
  | 'engajado' 
  | 'contato_whatsapp' 
  | 'reuniao_agendada' 
  | 'proposta' 
  | 'fechado_pausado_perdido';

export interface DealCard {
  id: string;
  title: string;
  company: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  leadId?: string;
  value: number;
  stageId: KanbanStageId;
  status: 'ganho' | 'pausado' | 'perdido' | 'em_andamento';
  tags: string[];
  priority: 'Baixa' | 'Média' | 'Alta';
  updatedAt: string;
}

export interface StageInfo {
  id: KanbanStageId;
  title: string;
  color: string;
  conversionRate: number;
}

export type NodeType = 'trigger' | 'action' | 'condition';

export interface AutomationNode {
  id: string;
  type: NodeType;
  title: string;
  description: string;
  iconName: string;
  config: Record<string, any>;
  nextId?: string;
  alternateNextId?: string;
}

export interface AutomationFlow {
  id: string;
  name: string;
  description: string;
  active: boolean;
  triggerCount: number;
  nodes: AutomationNode[];
  trigger?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  category?: 'conversion' | 'copy' | 'meta_ads' | 'general';
  suggestedActions?: string[];
}

export interface MetricCardData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
  description: string;
}

export interface SmtpConfig {
  provider: 'hostinger' | 'gmail' | 'outlook' | 'custom';
  host: string;
  port: number;
  security: 'ssl' | 'tls' | 'none';
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  imapHost?: string;
  imapPort?: number;
  sendingDelaySeconds: number;
  maxDailyLimit: number;
  spfVerified?: boolean;
  dkimVerified?: boolean;
  dmarcVerified?: boolean;
}

export type TaskStatus = 'concluida' | 'aguardando_retorno' | 'aguardando_alteracao' | 'em_espera';

export interface TaskItem {
  id: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  completed: boolean;
  status: TaskStatus;
  leadName: string;
  company?: string;
  type: 'call' | 'meeting' | 'proposal' | 'whatsapp';
  assignedUserId?: string;
  assignedUserName?: string;
}

export interface WaitingClient {
  id: string;
  leadName: string;
  company: string;
  waitTime: string;
  reason: string;
  avatar: string;
  responsibleName: string;
}

export interface SlideVisual {
  title: string;
  subtitle: string;
  bgGradient: string;
  imageUrl?: string;
}

export interface ContentPost {
  id: string;
  type: 'story' | 'feed' | 'carousel' | 'script';
  title: string;
  content: string;
  headlineText?: string;
  bodyText?: string;
  callToAction?: string;
  backgroundColor?: string;
  carouselSlides?: string[];
  carouselSlidesVisual?: SlideVisual[];
  status: 'rascunho' | 'pendente_aprovacao' | 'aprovado' | 'publicado';
  scheduledFor?: string;
  mediaUrl?: string;
  targetAudiencePrompt?: string;
  scriptStyle?: string;
  scriptGuidelines?: string;
  slidesCount?: number;
  batchIndex?: number;
  batchTotal?: number;
}

export interface ReferenceTemplate {
  id: string;
  title: string;
  folderName?: string;
  format: 'carousel' | 'story' | 'feed' | 'script';
  sampleText: string;
  structureDescription: string;
  customPrompt?: string;
  scriptStyle?: string;
  scriptGuidelines?: string;
  defaultSlidesCount?: number;
  referenceImages?: string[];
  performanceBadge?: string;
  intervalDays?: number;
}

export interface BrandGuidelines {
  logoUrl: string;
  toneOfVoice: 'Profissional & Persuasivo B2B' | 'Descontraído & Educativo' | 'Direto & Focado em ROI' | 'Técnico Especialista';
  forbiddenWords: string[];
  mandatoryWords: string[];
  contentPillars: string[];
  masterCreativePrompt: string;
  referenceTemplates: ReferenceTemplate[];
}

export interface GoogleIntegrations {
  ga4PropertyId: string;
  ga4Connected: boolean;
  ga4UsersMonth: number;
  searchConsoleConnected: boolean;
  searchConsoleAvgPosition: number;
  searchConsoleClicks: number;
  googleBusinessConnected: boolean;
  googleBusinessRating: number;
  googleBusinessReviewsCount: number;
  googleBusinessCallsCount: number;
}

export interface StrategicRecommendation {
  step: number;
  title: string;
  description: string;
  expectedLift: string;
}

export interface ConversionReport {
  overallConversionRate: number;
  funnelBottleneck: string;
  emailPerformanceSummary: string;
  whatsappPerformanceSummary: string;
  strategicRecommendations: StrategicRecommendation[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  leadName?: string;
  company?: string;
  meetUrl?: string;
  syncedWithGoogle: boolean;
  type: 'reuniao' | 'demo' | 'fechamento';
  assignedUserId?: string;
  assignedUserName?: string;
  assignedUserEmail?: string;
  attendeesEmails?: string[];
  description?: string;
  location?: string;
  reminderMinutes?: number;
}

export interface RevenueEntry {
  id: string;
  clientName: string;
  serviceName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Pix' | 'Cartão' | 'Boleto' | 'Transferência';
  status: 'Pago' | 'Em Espera' | 'Atrasado';
  isOneTime?: boolean;
  month: string;
  isBoletoGenerated?: boolean;
  barcode?: string;
  dueDate?: string;
  instructions?: string;
}

export interface ExpenseEntry {
  id: string;
  category: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'Pago' | 'Em Espera';
  month: string;
  clientName?: string;
}

export interface PartnerProfitSplit {
  partner1Name: string;
  partner1Percentage: number;
  partner1Amount: number;
  partner2Name: string;
  partner2Percentage: number;
  partner2Amount: number;
  withdrawalDate: string;
  totalNetProfit: number;
}
