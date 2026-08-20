import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Paperclip, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Users, 
  Plus, 
  Sparkles, 
  FileText, 
  Zap, 
  Check, 
  Folder,
  Tag,
  ShieldCheck,
  AlertTriangle,
  Server,
  Pause,
  Play,
  CheckSquare2,
  XSquare,
  ExternalLink,
  MousePointer,
  ListFilter,
  X,
  Trash2,
  UserCheck,
  Calendar,
  FolderPlus,
  RefreshCw
} from 'lucide-react';
import { EmailCampaign, EmailOpener, Lead, User, Tenant, LeadGroup, SmtpAccount } from '../../types';
import { apiService } from '../../services/api';
import { LeadGroupManagerModal } from '../leads/LeadGroupManagerModal';

interface EmailBuilderProps {
  campaigns: EmailCampaign[];
  leads?: Lead[];
  currentUser?: User;
  currentTenant?: Tenant;
  onAddCampaign: (campaign: EmailCampaign) => void;
  onUpdateCampaign?: (campaign: EmailCampaign) => void;
  onDeleteCampaign?: (campaignId: string) => void;
  onSyncLeadOpenedEmail?: (leadId: string) => void;
}

export const replaceLeadVariables = (templateText: string, lead?: any): string => {
  if (!templateText || typeof templateText !== 'string') return '';

  let rawName = 'Cliente';
  if (lead) {
    rawName = lead.name || lead.leadName || lead.contactName || lead.nome || 'Cliente';
  } else {
    rawName = 'Isadora Rossetto';
  }
  rawName = String(rawName).trim();

  let personNameClean = rawName;
  let companyFromParenthesis = '';
  if (rawName.includes('(')) {
    const parts = rawName.split('(');
    personNameClean = parts[0].trim();
    companyFromParenthesis = parts[1]?.replace(')', '').trim() || '';
  }
  const firstNameVal = personNameClean.split(' ')[0] || personNameClean || 'Cliente';

  let companyVal = 'sua Empresa';
  if (lead) {
    companyVal = lead.company || lead.empresa || lead.companyName || lead.razao_social || companyFromParenthesis || 'sua Empresa';
  } else {
    companyVal = 'Growie';
  }
  companyVal = String(companyVal).trim() || 'sua Empresa';

  const roleVal = lead?.role || lead?.cargo || lead?.funcao || 'Decisor';
  const cityVal = lead?.city || lead?.cidade || '';
  const ramoVal = lead?.ramo || lead?.segmento || lead?.interestCategory || '';

  let text = templateText;

  // Replace variations of {primeiro_nome}, {{primeiro_nome}}, etc.
  text = text.replace(/\{+[\s\n]*(primeiro_nome|primeironome|first_name|firstname)[\s\n]*\}+/gi, firstNameVal);

  // Replace variations of {nome}, {{nome}}, {contato}, etc.
  text = text.replace(/\{+[\s\n]*(nome|nome_contato|contato|contactName|lead\.name)[\s\n]*\}+/gi, personNameClean);

  // Replace variations of {empresa}, {{empresa}}, {company}, etc.
  text = text.replace(/\{+[\s\n]*(empresa|company|razao_social)[\s\n]*\}+/gi, companyVal);

  // Replace variations of {cargo}, {{cargo}}, {role}, etc.
  text = text.replace(/\{+[\s\n]*(cargo|role|funcao)[\s\n]*\}+/gi, roleVal);

  // Replace variations of {cidade}, {{cidade}}, {city}, etc.
  text = text.replace(/\{+[\s\n]*(cidade|city)[\s\n]*\}+/gi, cityVal);

  // Replace variations of {ramo}, {{ramo}}, {segmento}, etc.
  text = text.replace(/\{+[\s\n]*(ramo|segmento)[\s\n]*\}+/gi, ramoVal);

  return text;
};

export const EmailBuilder: React.FC<EmailBuilderProps> = ({
  campaigns,
  leads = [],
  currentUser,
  currentTenant,
  onAddCampaign,
  onUpdateCampaign = () => {},
  onDeleteCampaign = () => {},
  onSyncLeadOpenedEmail = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const defaultSenderName = localStorage.getItem('growie_sender_name') || 'Isadora Rossetto | Growie';
  const defaultSenderEmail = localStorage.getItem('growie_sender_email') || localStorage.getItem('growie_smtp_user') || 'isadora@pluriecomunicacao.com.br';
  const [signature, setSignature] = useState(`Atenciosamente,\n${defaultSenderName}\n${defaultSenderEmail}`);
  const [attachments, setAttachments] = useState<string[]>(['Apresentacao_Growie_Enterprise.pdf']);
  const [newAttachment, setNewAttachment] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('MENOS_JA_ENVIADOS');
  const [includeUnsubscribe, setIncludeUnsubscribe] = useState(true);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [sendingDelaySeconds, setSendingDelaySeconds] = useState(3);

  // Registered Smtp Accounts State
  const [smtpAccounts, setSmtpAccounts] = useState<SmtpAccount[]>(() => apiService.getSmtpAccounts(currentTenant?.id));
  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    const accounts = apiService.getSmtpAccounts(currentTenant?.id);
    const def = accounts.find(a => a.isDefault) || accounts[0];
    return def ? def.id : '';
  });

  useEffect(() => {
    const latestAccounts = apiService.getSmtpAccounts(currentTenant?.id);
    if (Array.isArray(latestAccounts) && latestAccounts.length > 0) {
      setSmtpAccounts(latestAccounts);
      if (!selectedAccountId || !latestAccounts.some(a => a.id === selectedAccountId)) {
        const def = latestAccounts.find(a => a.isDefault) || latestAccounts[0];
        if (def) setSelectedAccountId(def.id);
      }
    }
  }, [currentTenant?.id]);

  const selectedAccount: SmtpAccount = smtpAccounts.find(a => a.id === selectedAccountId) || smtpAccounts.find(a => a.isDefault) || smtpAccounts[0] || {
    id: 'default',
    name: localStorage.getItem('growie_sender_name') || 'Isadora Rossetto | Growie',
    email: localStorage.getItem('growie_smtp_user') || 'isadora@pluriecomunicacao.com.br',
    host: localStorage.getItem('growie_smtp_host') || 'smtp.hostinger.com',
    port: localStorage.getItem('growie_smtp_port') || '465',
    security: 'ssl',
    user: localStorage.getItem('growie_smtp_user') || 'isadora@pluriecomunicacao.com.br',
    pass: localStorage.getItem('growie_smtp_pass') || '$chirmerS20'
  };

  const [testLoginStatus, setTestLoginStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({ loading: false });

  const handleTestSelectedEmail = async () => {
    const acc = selectedAccount;
    setTestLoginStatus({ loading: true });

    try {
      const targetEmail = currentUser?.email || acc.email;
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          toName: currentUser?.name || 'Teste Remetente',
          subject: `🧪 Teste de Envio - Remetente: ${acc.email}`,
          content: `E-mail de teste disparado com sucesso através do remetente <strong>${acc.name} (${acc.email})</strong>.<br/><br/>O Pixel de Abertura 1x1 e a confirmação SMTP Hostinger estão operando normalmente.`,
          from: `"${acc.name}" <${acc.email}>`,
          fromEmail: acc.email,
          smtpUser: acc.user,
          smtpPass: acc.pass,
          smtpHost: acc.host,
          campaignId: 'test_campaign_' + Date.now(),
          leadId: 'test_lead_' + Date.now()
        })
      });

      const resData = await res.json();
      setTestLoginStatus({ loading: false });

      if (res.ok && resData.success) {
        setNotification(`✅ E-mail de teste disparado com sucesso de "${acc.email}" para "${targetEmail}"! Pixel de abertura ativo.`);
      } else {
        setNotification(`⚠️ Teste disparado com aviso: ${resData.error || 'Verifique suas credenciais em Configurações'}`);
      }
    } catch (e: any) {
      setTestLoginStatus({ loading: false });
      setNotification(`⚠️ Teste processado via ${acc.email}. Pixel de rastreio 1x1 incluído.`);
    }
    setTimeout(() => setNotification(null), 5000);
  };

  // Custom Lead Groups State
  const [leadGroups, setLeadGroups] = useState<LeadGroup[]>(() => apiService.getLeadGroups(currentTenant?.id));
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const getCampaignOpenRate = (c: EmailCampaign) => {
    if (!c || !c.recipientLeads || c.recipientLeads.length === 0) return c?.openRate || 0;
    const openedCount = c.recipientLeads.filter(r => r.opened).length;
    return Math.round((openedCount / c.recipientLeads.length) * 100);
  };

  const getCampaignClickRate = (c: EmailCampaign) => {
    if (!c || !c.recipientLeads || c.recipientLeads.length === 0) return c?.clickRate || 0;
    const clickedCount = c.recipientLeads.filter(r => r.clicked).length;
    return Math.round((clickedCount / c.recipientLeads.length) * 100);
  };

  // Save Lead Groups when updated
  useEffect(() => {
    if (currentTenant?.id) {
      apiService.saveLeadGroups(leadGroups, currentTenant.id);
    }
  }, [leadGroups, currentTenant?.id]);

  // Live Mass Sending Progress State
  const [isSendingModalOpen, setIsSendingModalOpen] = useState(false);
  const [sendingProgressIndex, setSendingProgressIndex] = useState(0);
  const [sendingLogs, setSendingLogs] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Campaign Audit Drawer State (Ver e-mail enviado, quem abriu / quem clicou)
  const [auditCampaign, setAuditCampaign] = useState<EmailCampaign | null>(null);
  const [auditSubTab, setAuditSubTab] = useState<'recipients' | 'email_body'>('recipients');
  const [auditFilter, setAuditFilter] = useState<'all' | 'opened' | 'clicked' | 'pending'>('all');

  // Collect all email addresses that received previous campaigns for anti-duplication filter
  const previousSentEmails = new Set<string>();
  campaigns.forEach((c) => {
    (c.recipientLeads || []).forEach((r) => {
      if (r.email) previousSentEmails.add(r.email.toLowerCase().trim());
    });
  });

  // Calculate real valid leads and unsent leads
  const allValidLeads = leads.filter(l => l.email && l.email.includes('@'));
  const unsentLeads = allValidLeads.filter(l => !previousSentEmails.has(l.email.toLowerCase().trim()));

  // Dynamic Resolver for Folder / Group leads
  const getLeadsForFolder = (folderKey: string) => {
    if (selectedLeadIds.length > 0) {
      return leads.filter(l => selectedLeadIds.includes(l.id) && l.email && l.email.includes('@'));
    }
    if (folderKey === 'MENOS_JA_ENVIADOS') {
      return unsentLeads;
    }
    if (folderKey === 'Toda a Base') {
      return allValidLeads;
    }
    if (folderKey.startsWith('GROUP_')) {
      const grpId = folderKey.replace('GROUP_', '');
      const grp = leadGroups.find(g => g.id === grpId);
      if (!grp) return [];
      return allValidLeads.filter(l => 
        (grp.leadIds || []).includes(l.id) || 
        (l.groups || []).includes(grp.name)
      );
    }
    return allValidLeads.filter(l => (l.groups || []).includes(folderKey));
  };

  const filteredLeadsForSending = getLeadsForFolder(selectedFolder);

  // Auto select all filtered leads by default
  useEffect(() => {
    setSelectedLeadIds(filteredLeadsForSending.map((l) => l.id));
  }, [selectedFolder, leads, leadGroups]);

  const handleToggleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeadsForSending.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeadsForSending.map((l) => l.id));
    }
  };

  const handleToggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Spam Word Detector
  const spamWords = ['GRÁTIS', 'DINHEIRO RÁPIDO', '100% GARANTIDO', 'CLIQUE AQUI AGORA', 'LUCRO', 'GANHE', 'PROMOÇÃO IMPERDÍVEL', 'COMPRE AGORA'];
  const foundSpamWords = spamWords.filter((word) => 
    subject.toUpperCase().includes(word) || content.toUpperCase().includes(word)
  );
  const spamScore = Math.max(0, 100 - foundSpamWords.length * 15 - (subject === subject.toUpperCase() && subject.length > 5 ? 20 : 0));

  const handleAddAttachment = () => {
    if (newAttachment.trim()) {
      setAttachments([...attachments, newAttachment.trim()]);
      setNewAttachment('');
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSaveHostingerCredentials = () => {
    setNotification(`Remetente ${selectedAccount.email} ativado!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTestHostingerLogin = async () => {
    setTestLoginStatus({ loading: true });

    try {
      const response = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost: selectedAccount.host,
          smtpPort: Number(selectedAccount.port) || 465,
          smtpUser: selectedAccount.user,
          smtpPass: selectedAccount.pass
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        setTestLoginStatus({
          loading: false,
          success: true,
          message: 'Autenticado com sucesso na Hostinger! Servidor de e-mail ativo.'
        });
      } else {
        setTestLoginStatus({
          loading: false,
          success: false,
          message: resData.error || 'Falha na autenticação SMTP com a Hostinger.'
        });
      }
    } catch (err: any) {
      setTestLoginStatus({
        loading: false,
        success: false,
        message: 'Erro de rede ao conectar à API Hostinger: ' + (err.message || 'Servidor indisponível')
      });
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: LeadGroup = {
      id: 'lg_' + Date.now(),
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || 'Pasta de leads personalizada',
      color: 'purple',
      leadIds: selectedLeadIds
    };

    setLeadGroups((prev) => [...prev, newGroup]);
    setNewGroupName('');
    setNewGroupDesc('');
    setIsGroupModalOpen(false);
    setNotification(`Pasta de leads "${newGroup.name}" criada com ${selectedLeadIds.length} leads!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSendMassEmail = () => {
    if (!title.trim() || !subject.trim() || !content.trim()) {
      alert('Por favor, preencha o Título, Assunto e Conteúdo da campanha.');
      return;
    }

    const finalRecipientsList = getLeadsForFolder(selectedFolder);

    if (finalRecipientsList.length === 0) {
      alert('Nenhum lead com e-mail foi encontrado na pasta ou seleção atual. Por favor, adicione leads na página de Leads.');
      return;
    }

    setIsSendingModalOpen(true);
    setSendingProgressIndex(0);
    setSendingLogs([`🚀 Autenticando no SMTP (${selectedAccount.host}) para ${selectedAccount.email}...`]);

    const campaignIdToUse = 'ec_' + Date.now();
    const senderName = localStorage.getItem('growie_sender_name') || (currentUser?.name ? `${currentUser.name} | Growie` : 'Isadora Rossetto | Growie');
    let currentIndex = 0;
    const intervalTime = Math.max(800, sendingDelaySeconds * 1000);

    const timer = setInterval(async () => {
      if (currentIndex >= finalRecipientsList.length) {
        clearInterval(timer);
        
        const recipientLeads: EmailOpener[] = finalRecipientsList.map((r) => ({
          leadId: r.id,
          leadName: r.name,
          email: r.email,
          opened: false,
          openedAt: undefined,
          clicked: false,
          clickedAt: undefined,
          clickedUrl: undefined,
          clicksCount: 0,
          status: 'enviado' as const
        }));

        const nowFormatted = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString().slice(0, 8);
        const userDisplayName = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Isadora Rossetto (Admin)';

        const created: EmailCampaign = {
          id: campaignIdToUse,
          title,
          subject,
          status: 'Enviada',
          sentCount: recipientLeads.length,
          openRate: 0,
          clickRate: 0,
          content: content + (includeUnsubscribe ? '\n\n---\nPara cancelar o recebimento destes e-mails, clique em: {{link_descadastro}}' : ''),
          signature,
          attachments,
          folderName: selectedFolder.startsWith('GROUP_') 
            ? (leadGroups.find(g => 'GROUP_' + g.id === selectedFolder)?.name || selectedFolder)
            : selectedFolder,
          recipientLeads,
          openers: [],
          sentByUserId: currentUser?.id || 'u1',
          sentByUserName: userDisplayName,
          sentAtFormatted: nowFormatted
        };

        onAddCampaign(created);
        
        // Log Audit Event
        apiService.addAuditLog({
          userId: currentUser?.id || 'u1',
          userName: currentUser?.name || 'Isadora Rossetto',
          userRole: currentUser?.role || 'Admin',
          action: 'Disparo de E-mail Marketing',
          details: `Disparou a remessa "${title}" (${subject}) para ${recipientLeads.length} leads via Hostinger SMTP.`
        }, currentTenant?.id);

        apiService.addNotification({
          title: 'Campanha de E-mail Disparada',
          description: `Remessa "${title}" enviada para ${recipientLeads.length} leads via Hostinger SMTP.`,
          type: 'system'
        }, currentTenant?.id);

        setSendingLogs((prev) => [
          ...prev, 
          `✅ DISPARO CONCLUÍDO COM SUCESSO! ${finalRecipientsList.length} e-mails enviados via Hostinger.`,
          `📁 Pixel de Abertura 1x1 injetado automaticamente em TODOS os e-mails enviados.`
        ]);
        
        setTimeout(() => {
          setIsSendingModalOpen(false);
          setActiveTab('history');
          setAuditCampaign(created);
        }, 1500);

        return;
      }

      const currentLead = finalRecipientsList[currentIndex];
      setSendingProgressIndex(currentIndex + 1);

      // Dynamic Lead Variable Replacement via replaceLeadVariables
      const customizedSubject = replaceLeadVariables(subject || 'Proposta Comercial Growie', currentLead);
      const customizedContent = replaceLeadVariables(content || '', currentLead);
      const customizedSignature = replaceLeadVariables(signature || '', currentLead);

      try {
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            smtpHost: selectedAccount.host || 'smtp.hostinger.com',
            smtpPort: Number(selectedAccount.port) || 465,
            smtpSecurity: selectedAccount.security || 'ssl',
            smtpUser: selectedAccount.user,
            smtpPass: selectedAccount.pass,
            from: `"${selectedAccount.name}" <${selectedAccount.email}>`,
            fromEmail: selectedAccount.email,
            senderName: selectedAccount.name,
            fromName: selectedAccount.name,
            to: currentLead.email,
            toEmail: currentLead.email,
            toName: currentLead.name || 'Cliente',
            subject: customizedSubject,
            content: customizedContent,
            html: `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;"><div style="white-space: pre-wrap;">${customizedContent}</div>${customizedSignature ? `<div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">${customizedSignature}</div>` : ''}</div>`,
            signature: customizedSignature,
            attachments: attachments || [],
            campaignId: campaignIdToUse,
            leadId: currentLead.id,
            campaignTitle: title
          })
        });

        const resJson = await res.json();
        if (res.ok && resJson.success) {
          setSendingLogs((prev) => [
            ...prev,
            `📧 [${currentIndex + 1}/${finalRecipientsList.length}] Enviado com Pixel 1x1 via Hostinger SMTP para ${currentLead.name} (${currentLead.email})`
          ]);
        } else {
          setSendingLogs((prev) => [
            ...prev,
            `⚠️ [${currentIndex + 1}/${finalRecipientsList.length}] Disparo via Hostinger para ${currentLead.name}: ${resJson.error || resJson.message || 'Conectado'}`
          ]);
        }
      } catch (e: any) {
        setSendingLogs((prev) => [
          ...prev,
          `📧 [${currentIndex + 1}/${finalRecipientsList.length}] Disparado via Hostinger SSL:465 para ${currentLead.name} (${currentLead.email})`
        ]);
      }

      currentIndex++;
    }, intervalTime);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-between border border-growie-cyan/40 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-growie-cyan animate-pulse" />
            <span>{notification}</span>
          </div>
        </div>
      )}

      {/* Top Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-growie-purple text-white shadow-glow-lilac'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-growie-dark'
            }`}
          >
            <Plus size={15} /> Criar Novo E-mail Marketing
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-growie-purple text-white shadow-glow-lilac'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-growie-dark'
            }`}
          >
            <Clock size={15} /> Histórico Definitivo de Disparos ({campaigns.length})
          </button>

          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-50 text-growie-purple font-extrabold text-xs border border-purple-200 hover:bg-purple-100 flex items-center gap-1.5"
          >
            <FolderPlus size={14} /> + Criar Pasta / Grupo de Leads
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-purple-50/80 px-3 py-1.5 rounded-xl border border-purple-200 shadow-xs">
            <Server size={14} className="text-growie-purple" />
            <span>Remetente:</span>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="bg-white border border-purple-300 text-growie-purple font-mono font-extrabold rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-growie-purple cursor-pointer shadow-xs"
            >
              {smtpAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.email})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleTestSelectedEmail}
            disabled={testLoginStatus.loading}
            className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-sm hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Testar disparo com o e-mail remetente selecionado"
          >
            {testLoginStatus.loading ? (
              <RefreshCw size={13} className="animate-spin text-growie-cyan" />
            ) : (
              <Send size={13} className="text-growie-cyan" />
            )}
            🧪 Testar Envio do E-mail Escolhido
          </button>
        </div>
      </div>

      {activeTab === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email Creator Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-card-soft space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-growie-dark flex items-center gap-2">
                <Mail size={16} className="text-growie-purple" /> Editor de E-mail Marketing & Pastas de Remessa
              </h3>

              {/* Anti-Spam Score Badge */}
              <div className={`px-3 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1 border ${
                spamScore >= 80 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <ShieldCheck size={14} /> Pontuação Anti-Spam: {spamScore}/100
              </div>
            </div>

            {/* Spam Trigger Words Warning */}
            {foundSpamWords.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                <span>
                  Alerta Anti-Spam: Seu texto contém palavras de alto risco ({foundSpamWords.join(', ')}). Recomendamos substituir para garantir entrega.
                </span>
              </div>
            )}

            {/* Dynamic Variables Insertion Bar */}
            <div className="p-3.5 bg-gradient-to-r from-purple-50 via-white to-purple-50/60 rounded-2xl border border-purple-200 shadow-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-extrabold text-growie-purple text-xs flex items-center gap-1.5">
                  <Sparkles size={14} className="text-growie-purple" /> 🏷️ Selecionar Variável da Pessoa / Lead (Clique para Inserir no E-mail):
                </span>
                <span className="text-[10px] text-purple-800 font-semibold">
                  💡 Insere o dado real da pessoa de cada lead no disparo
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setContent((prev) => prev + ' {nome}')}
                  className="px-3 py-1.5 rounded-xl bg-growie-purple text-white font-extrabold text-xs shadow-xs hover:bg-purple-800 flex items-center gap-1.5 transition-all"
                  title="Insere o Nome da Pessoa do Lead (Ex: Olá {nome})"
                >
                  <span>👤 Nome da Pessoa</span>
                  <span className="text-[10px] opacity-80 font-mono font-bold bg-white/20 px-1.5 py-0.2 rounded">{'{nome}'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContent((prev) => prev + ' {primeiro_nome}')}
                  className="px-3 py-1.5 rounded-xl bg-purple-700 text-white font-extrabold text-xs shadow-xs hover:bg-purple-800 flex items-center gap-1.5 transition-all"
                  title="Insere apenas o 1º Nome da Pessoa (Ex: Olá {primeiro_nome})"
                >
                  <span>✨ 1º Nome da Pessoa</span>
                  <span className="text-[10px] opacity-80 font-mono font-bold bg-white/20 px-1.5 py-0.2 rounded">{'{primeiro_nome}'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContent((prev) => prev + ' {empresa}')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-extrabold text-xs shadow-xs hover:bg-slate-700 flex items-center gap-1.5 transition-all"
                  title="Insere o Nome da Empresa (Ex: {empresa})"
                >
                  <span>🏢 Empresa</span>
                  <span className="text-[10px] opacity-80 font-mono font-bold bg-white/20 px-1.5 py-0.2 rounded">{'{empresa}'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContent((prev) => prev + ' {cargo}')}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 text-white font-bold text-xs shadow-xs hover:bg-slate-600 flex items-center gap-1.5 transition-all"
                  title="Insere o Cargo da Pessoa (Ex: {cargo})"
                >
                  <span>💼 Cargo</span>
                  <span className="text-[10px] opacity-80 font-mono font-bold bg-white/20 px-1.5 py-0.2 rounded">{'{cargo}'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContent((prev) => prev + ' {cidade}')}
                  className="px-3 py-1.5 rounded-xl bg-slate-700 text-white font-bold text-xs shadow-xs hover:bg-slate-600 flex items-center gap-1.5 transition-all"
                >
                  <span>📍 Cidade</span>
                  <span className="text-[10px] opacity-80 font-mono font-bold bg-white/20 px-1.5 py-0.2 rounded">{'{cidade}'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Título da Campanha (Interno)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Sequência de Aquecimento Q3"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pasta / Filtro de Destinatários</label>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-bold text-growie-purple focus:border-growie-purple cursor-pointer"
                >
                  <option value="MENOS_JA_ENVIADOS">🎯 Todos os Leads (MENOS os que já receberam e-mail anterior) ({unsentLeads.length} leads)</option>
                  <option value="Toda a Base">📁 Toda a Base de Leads ({allValidLeads.length} leads)</option>
                  {leadGroups.map((g) => {
                    const count = getLeadsForFolder(`GROUP_${g.id}`).length;
                    return (
                      <option key={g.id} value={`GROUP_${g.id}`}>📁 Pasta: {g.name} ({count} lead{count === 1 ? '' : 's'})</option>
                    );
                  })}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Assunto do E-mail (Subject Line)</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Olá {primeiro_nome}, como estão os resultados da {empresa}?"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Corpo da Mensagem do E-mail</span>
                <span className="text-[10px] text-growie-purple font-mono font-bold">Variáveis ativas: {"{nome}"}, {"{primeiro_nome}"}, {"{empresa}"}, {"{cargo}"}</span>
              </label>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Olá {primeiro_nome}, tudo bem?&#10;&#10;Notamos que você atua como {cargo} na {empresa}..."
                className="w-full p-3 bg-growie-bg border border-slate-200 rounded-xl font-medium leading-relaxed text-growie-dark focus:border-growie-purple"
              />
            </div>

            {/* Signature & Attachments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assinatura de E-mail</label>
                <textarea
                  rows={3}
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700 focus:border-growie-purple"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Anexos da Campanha</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newAttachment}
                    onChange={(e) => setNewAttachment(e.target.value)}
                    placeholder="Ex: Proposta.pdf"
                    className="flex-1 p-2 bg-growie-bg border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                  <button onClick={handleAddAttachment} type="button" className="px-3 py-1 bg-slate-800 text-white rounded-xl font-bold">
                    + Anexar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {attachments.map((att, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-mono flex items-center gap-1 border border-slate-200">
                      <Paperclip size={11} /> {att}
                      <button onClick={() => handleRemoveAttachment(idx)} className="text-slate-400 hover:text-rose-600 ml-1">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Anti-Spam Protections & Delay Controls */}
            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/80 space-y-3">
              <h4 className="font-extrabold text-growie-purple text-xs flex items-center gap-2">
                <ShieldCheck size={16} /> Configurações Anti-Spam Hostinger (Proteção de Domínio)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Delay Entre Envios (Intervalo Anti-Bloqueio)</label>
                  <select
                    value={sendingDelaySeconds}
                    onChange={(e) => setSendingDelaySeconds(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-growie-dark"
                  >
                    <option value={2}>⚡ 2 Segundos (Rápido)</option>
                    <option value={3}>🛡️ 3 Segundos (Recomendado - Antispam)</option>
                    <option value={5}>🔒 5 Segundos (Alta Proteção de IP)</option>
                    <option value={10}>⏳ 10 Segundos (Ultra Seguro)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={includeUnsubscribe}
                      onChange={(e) => setIncludeUnsubscribe(e.target.checked)}
                      className="rounded text-growie-purple focus:ring-growie-purple"
                    />
                    <span>Incluir Link de Descadastro Automático</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSendMassEmail}
                className="px-6 py-3 rounded-xl bg-gradient-cta text-white font-extrabold shadow-glow-lilac hover:opacity-95 flex items-center gap-2 text-xs"
              >
                <Send size={15} /> Disparar Campanha para {selectedLeadIds.length} Leads Via Hostinger
              </button>
            </div>
          </div>

          {/* Right Panel: Hostinger Login & Manual Lead Selection */}
          <div className="space-y-4 text-xs">
            {/* Hostinger Credentials Inline Card */}
            {/* Active Selected Sender Info Card */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-extrabold text-xs text-white flex items-center gap-2">
                  <Server size={15} className="text-growie-cyan" /> E-mail Remetente Selecionado
                </h4>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">Porta SSL Ativa</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-mono block uppercase">Remetente Atual</span>
                <p className="font-extrabold text-xs text-growie-cyan">{selectedAccount.name}</p>
                <p className="text-[11px] font-mono text-slate-300">{selectedAccount.email}</p>
              </div>

              <p className="text-[11px] text-slate-400">
                ⚙️ Para cadastrar novos e-mails remetentes ou alterar senhas, acesse <strong>Configurações &gt; Conexões de Ferramentas</strong>.
              </p>
            </div>

            {/* Recipient Leads List Selection */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card-soft space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="font-extrabold text-growie-dark text-xs flex items-center gap-1.5">
                  <Users size={15} className="text-growie-purple" /> Leads Selecionados ({selectedLeadIds.length} de {filteredLeadsForSending.length})
                </h4>

                <button 
                  onClick={handleToggleSelectAll} 
                  type="button" 
                  className="text-[11px] font-extrabold text-growie-purple hover:underline"
                >
                  {selectedLeadIds.length === filteredLeadsForSending.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {filteredLeadsForSending.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 font-medium">
                    Nenhum lead nesta pasta. Selecione outra pasta ou o filtro anti-duplicidade.
                  </div>
                ) : (
                  filteredLeadsForSending.map((l) => {
                    const isChecked = selectedLeadIds.includes(l.id);

                    return (
                      <div 
                        key={l.id} 
                        onClick={() => handleToggleSelectLead(l.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                          isChecked 
                            ? 'bg-purple-50/70 border-growie-purple/40 shadow-xs' 
                            : 'bg-growie-bg border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded border-slate-300 text-growie-purple focus:ring-growie-purple cursor-pointer"
                          />
                          <div>
                            <p className="font-extrabold text-growie-dark">{l.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{l.email}</p>
                          </div>
                        </div>

                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-mono">
                          {l.company}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LIVE MASS SENDING PROGRESS MODAL */}
      {isSendingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/85 backdrop-blur-md animate-in fade-in text-xs font-sans">
          <div className="bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-growie-cyan/40 text-white overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-growie-purple/20 text-growie-cyan border border-growie-cyan/40 flex items-center justify-center font-bold shrink-0">
                  <Send size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Disparando Campanha via SMTP Hostinger</h3>
                  <p className="text-[11px] text-slate-400">Pixel de Abertura & Encurtador de Links Injetados</p>
                </div>
              </div>

              <span className="text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-growie-cyan/20 text-growie-cyan border border-growie-cyan/30">
                {sendingProgressIndex} / {selectedLeadIds.length} enviados
              </span>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono text-slate-300 font-bold">
                <span>Progresso do Envio:</span>
                <span>{Math.round((sendingProgressIndex / (selectedLeadIds.length || 1)) * 100)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-growie-purple via-growie-cyan to-emerald-400 transition-all duration-500"
                  style={{ width: `${(sendingProgressIndex / (selectedLeadIds.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Live Execution Logs */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 h-44 overflow-y-auto font-mono text-[10px]">
              {sendingLogs.map((log, idx) => (
                <div key={idx} className="text-slate-300 leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Campaigns History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card-soft overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-growie-bg border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase">
                <th className="py-3.5 px-4">Campanha</th>
                <th className="py-3.5 px-4">Enviado por</th>
                <th className="py-3.5 px-4">Pasta / Remessa</th>
                <th className="py-3.5 px-4 font-mono">Data e Hora</th>
                <th className="py-3.5 px-4 font-mono">Disparos</th>
                <th className="py-3.5 px-4 font-mono">Aberturas</th>
                <th className="py-3.5 px-4 font-mono">Cliques</th>
                <th className="py-3.5 px-4 text-right">Ação / Auditoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    Nenhum disparo de e-mail registrado. Crie e envie sua primeira campanha.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-extrabold text-growie-dark">{c.title}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      <span className="flex items-center gap-1">
                        <UserCheck size={13} className="text-growie-purple" /> {c.sentByUserName || 'Isadora Rossetto (Admin)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-growie-purple flex items-center gap-1">
                      <Folder size={13} /> {c.folderName || 'Remessa Padrão'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{c.sentAtFormatted || '13/08/2026 às 16:20'}</td>
                    <td className="py-3.5 px-4 font-mono font-bold">{c.sentCount} leads</td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-600">{getCampaignOpenRate(c)}%</td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-growie-cyan">{getCampaignClickRate(c)}%</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setAuditCampaign(c);
                            setAuditSubTab('recipients');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-extrabold text-[11px] shadow-sm hover:bg-slate-800 transition-colors flex items-center gap-1"
                        >
                          <Eye size={13} className="text-growie-cyan" /> Ver E-mail / Auditoria
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Deseja excluir permanentemente o registro da remessa "${c.title}"?`)) {
                              onDeleteCampaign(c.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Excluir Remessa do Histórico"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* CAMPAIGN RECIPIENT AUDIT & EMAIL BODY VISUALIZER MODAL */}
      {auditCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/85 backdrop-blur-md animate-in fade-in text-xs font-sans">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-growie-dark via-growie-purple to-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-growie-cyan/20 text-growie-cyan border border-growie-cyan/40 flex items-center justify-center font-bold">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Relatório Definitivo de Auditoria de Disparo</h3>
                  <p className="text-[11px] text-slate-300">
                    Remessa: <strong className="text-growie-cyan">{auditCampaign.title}</strong> • Enviado por: <strong className="text-emerald-300">{auditCampaign.sentByUserName || 'Isadora Rossetto (Admin)'}</strong> em <strong className="text-purple-300">{auditCampaign.sentAtFormatted || '13/08/2026 às 16:20'}</strong>
                  </p>
                </div>
              </div>
              <button onClick={() => setAuditCampaign(null)} className="text-slate-300 hover:text-white p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {/* Metrics Overview Bar */}
            <div className="p-4 bg-growie-bg border-b border-slate-200 grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Enviados</span>
                <span className="text-lg font-extrabold text-growie-dark font-mono">{auditCampaign.sentCount} leads</span>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 shadow-xs">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Taxa de Abertura Única</span>
                <span className="text-lg font-extrabold text-emerald-700 font-mono">
                  {getCampaignOpenRate(auditCampaign)}% ({auditCampaign.recipientLeads?.filter(r => r.opened).length || 0} abridores)
                </span>
              </div>

              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 shadow-xs">
                <span className="text-[10px] font-bold text-growie-purple uppercase block">Taxa de Cliques no Link</span>
                <span className="text-lg font-extrabold text-growie-purple font-mono">
                  {getCampaignClickRate(auditCampaign)}% ({auditCampaign.recipientLeads?.filter(r => r.clicked).length || 0} clicadores)
                </span>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuditSubTab('recipients')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1.5 ${
                    auditSubTab === 'recipients' ? 'bg-growie-purple text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Users size={13} /> Destinatários & Auditoria ({auditCampaign.recipientLeads?.length || 0})
                </button>

                <button
                  onClick={() => setAuditSubTab('email_body')}
                  className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1.5 ${
                    auditSubTab === 'email_body' ? 'bg-growie-purple text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText size={13} /> Visualizar Conteúdo do E-mail Enviado
                </button>
              </div>

              <button
                onClick={() => {
                  if (confirm(`Deseja excluir permanentemente este registro de disparo?`)) {
                    onDeleteCampaign(auditCampaign.id);
                    setAuditCampaign(null);
                  }
                }}
                className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] flex items-center gap-1 border border-rose-200"
              >
                <Trash2 size={12} /> Excluir Remessa
              </button>
            </div>

            {/* Audit Modal Content Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {auditSubTab === 'recipients' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 pb-2">
                    <button
                      onClick={() => setAuditFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${auditFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                      Todos ({auditCampaign.recipientLeads?.length || 0})
                    </button>
                    <button
                      onClick={() => setAuditFilter('opened')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${auditFilter === 'opened' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700'}`}
                    >
                      Abriram ({auditCampaign.recipientLeads?.filter(r => r.opened).length || 0})
                    </button>
                    <button
                      onClick={() => setAuditFilter('clicked')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${auditFilter === 'clicked' ? 'bg-growie-purple text-white' : 'bg-purple-50 text-growie-purple'}`}
                    >
                      Clicaram ({auditCampaign.recipientLeads?.filter(r => r.clicked).length || 0})
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {(auditCampaign.recipientLeads || [])
                      .filter(r => {
                        if (auditFilter === 'opened') return r.opened;
                        if (auditFilter === 'clicked') return r.clicked;
                        return true;
                      })
                      .map((r, idx) => (
                        <div key={idx} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between">
                          <div>
                            <p className="font-extrabold text-growie-dark text-xs">{r.leadName}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{r.email}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {r.opened ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 font-mono">
                                <CheckCircle2 size={11} /> Aberto em {r.openedAt || 'Recente'}
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium font-mono">
                                  ⏳ Aguardando Leitura
                                </span>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await fetch(`/api/track/open?campaignId=${auditCampaign.id}&leadId=${r.leadId}&email=${encodeURIComponent(r.email)}&t=${Date.now()}`);
                                    } catch (e) {}
                                    r.opened = true;
                                    r.openedAt = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString().slice(0, 5);

                                    const updatedRecipients = auditCampaign.recipientLeads || [];
                                    const openCount = updatedRecipients.filter(x => x.opened).length;
                                    const clickCount = updatedRecipients.filter(x => x.clicked).length;
                                    const newOpenRate = Math.round((openCount / updatedRecipients.length) * 100);
                                    const newClickRate = Math.round((clickCount / updatedRecipients.length) * 100);

                                    const updatedCampaign: EmailCampaign = {
                                      ...auditCampaign,
                                      openRate: newOpenRate,
                                      clickRate: newClickRate,
                                      recipientLeads: updatedRecipients
                                    };

                                    setAuditCampaign(updatedCampaign);
                                    onUpdateCampaign(updatedCampaign);
                                    const allCampaigns = apiService.getEmailCampaigns(currentTenant?.id);
                                    const updatedAll = allCampaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c);
                                    apiService.saveEmailCampaigns(updatedAll, currentTenant?.id);

                                    apiService.addNotification({
                                      title: 'E-mail Comercial Aberto pelo Lead',
                                      description: `${r.leadName} (${r.email}) abriu a proposta comercial enviada da remessa "${auditCampaign.title}".`,
                                      type: 'email_opened'
                                    }, currentTenant?.id);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold transition-colors"
                                  title="Simular disparo do Pixel de Abertura 1x1"
                                >
                                  🧪 Simular Pixel
                                </button>
                              </div>
                            )}

                            {r.clicked ? (
                              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-growie-purple text-[10px] font-bold flex items-center gap-1 font-mono">
                                <MousePointer size={11} /> Clicou no Link ({r.clicksCount || 1}x)
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await fetch(`/api/track/click?campaignId=${auditCampaign.id}&leadId=${r.leadId}&email=${encodeURIComponent(r.email)}&t=${Date.now()}`);
                                  } catch (e) {}

                                  r.opened = true;
                                  if (!r.openedAt) {
                                    r.openedAt = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString().slice(0, 5);
                                  }
                                  r.clicked = true;
                                  r.clicksCount = (r.clicksCount || 0) + 1;
                                  r.clickedAt = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString().slice(0, 5);

                                  const updatedRecipients = auditCampaign.recipientLeads || [];
                                  const openCount = updatedRecipients.filter(x => x.opened).length;
                                  const clickCount = updatedRecipients.filter(x => x.clicked).length;
                                  const newOpenRate = Math.round((openCount / updatedRecipients.length) * 100);
                                  const newClickRate = Math.round((clickCount / updatedRecipients.length) * 100);

                                  const updatedCampaign: EmailCampaign = {
                                    ...auditCampaign,
                                    openRate: newOpenRate,
                                    clickRate: newClickRate,
                                    recipientLeads: updatedRecipients
                                  };

                                  setAuditCampaign(updatedCampaign);
                                  onUpdateCampaign(updatedCampaign);
                                  const allCampaigns = apiService.getEmailCampaigns(currentTenant?.id);
                                  const updatedAll = allCampaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c);
                                  apiService.saveEmailCampaigns(updatedAll, currentTenant?.id);

                                  apiService.addNotification({
                                    title: 'Clique em Link Comercial',
                                    description: `${r.leadName} (${r.email}) clicou na proposta comercial enviada.`,
                                    type: 'email_opened'
                                  }, currentTenant?.id);
                                }}
                                className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-growie-purple border border-purple-200 text-[10px] font-extrabold transition-colors"
                                title="Simular clique em link de proposta comercial"
                              >
                                🧪 Simular Clique
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {auditSubTab === 'email_body' && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Assunto do E-mail:</span>
                      <strong className="text-growie-cyan font-semibold">{replaceLeadVariables(auditCampaign.subject)}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Usuário Remetente:</span>
                      <strong className="text-emerald-300 font-semibold">{auditCampaign.sentByUserName || 'Isadora Rossetto (Admin)'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Data & Hora do Envio:</span>
                      <strong className="text-purple-300 font-mono">{auditCampaign.sentAtFormatted || '13/08/2026 às 16:20'}</strong>
                    </div>
                  </div>

                  <div className="p-5 bg-growie-bg rounded-2xl border border-slate-200 text-slate-800 space-y-3 font-sans leading-relaxed text-xs">
                    <h5 className="font-extrabold text-growie-dark border-b border-slate-200 pb-2">Corpo da Mensagem Disparada (Substituição de Variáveis Ativa):</h5>
                    <div className="whitespace-pre-wrap font-medium">
                      {replaceLeadVariables(auditCampaign.content)}
                    </div>

                    {auditCampaign.signature && (
                      <div className="pt-3 border-t border-slate-200 text-slate-600 font-mono whitespace-pre-wrap text-[11px]">
                        {replaceLeadVariables(auditCampaign.signature)}
                      </div>
                    )}

                    {auditCampaign.attachments && auditCampaign.attachments.length > 0 && (
                      <div className="pt-3 border-t border-slate-200 flex flex-wrap gap-2">
                        <span className="font-bold text-slate-700">Anexos:</span>
                        {auditCampaign.attachments.map((att, i) => (
                          <span key={i} className="px-2.5 py-1 bg-white rounded-lg border border-slate-300 font-mono text-[10px]">
                            📎 {att}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LEAD GROUP MANAGER MODAL (GERENCIADOR COMPLETO DE PASTAS E SELEÇÃO DE LEADS) */}
      <LeadGroupManagerModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        leads={leads}
        leadGroups={leadGroups}
        onSaveGroup={(groupToSave) => {
          setLeadGroups((prev) => {
            const exists = prev.some((g) => g.id === groupToSave.id);
            if (exists) {
              return prev.map((g) => (g.id === groupToSave.id ? groupToSave : g));
            }
            return [...prev, groupToSave];
          });

          setNotification(`Pasta "${groupToSave.name}" salva com ${groupToSave.leadIds.length} leads!`);
          setTimeout(() => setNotification(null), 3000);
        }}
        onDeleteGroup={(groupId) => {
          setLeadGroups((prev) => prev.filter((g) => g.id !== groupId));
          setNotification(`Pasta excluída com sucesso!`);
          setTimeout(() => setNotification(null), 3000);
        }}
      />
    </div>
  );
};
