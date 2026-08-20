import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, Plus, Calendar, CheckCircle2, AlertCircle, Save, Filter, PieChart, CreditCard, Edit2, Trash2, X, FileText, Clock, Building2, Copy, Check } from 'lucide-react';
import { RevenueEntry, ExpenseEntry, PartnerProfitSplit, ClientItem } from '../../types';

interface FinancialViewProps {
  revenues: RevenueEntry[];
  expenses: ExpenseEntry[];
  profitSplit: PartnerProfitSplit;
  clients?: ClientItem[];
  onAddRevenue: (entry: RevenueEntry) => void;
  onUpdateRevenue: (entry: RevenueEntry) => void;
  onDeleteRevenue: (id: string) => void;
  onAddExpense: (entry: ExpenseEntry) => void;
  onUpdateExpense: (entry: ExpenseEntry) => void;
  onDeleteExpense: (id: string) => void;
  onUpdateProfitSplit: (split: PartnerProfitSplit) => void;
}

export const FinancialView: React.FC<FinancialViewProps> = ({
  revenues,
  expenses,
  profitSplit,
  clients = [],
  onAddRevenue,
  onUpdateRevenue,
  onDeleteRevenue,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onUpdateProfitSplit,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'monthly' | 'all' | 'quarterly' | 'semester'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState('Agosto / 2026');
  const [activeTab, setActiveTab] = useState<'revenues' | 'expenses' | 'receivables'>('revenues');

  // Revenue & Boleto Modal State
  const [isRevModalOpen, setIsRevModalOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<RevenueEntry | null>(null);
  const [clientName, setClientName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [revAmount, setRevAmount] = useState('15000');
  const [paymentMethod, setPaymentMethod] = useState<RevenueEntry['paymentMethod']>('Boleto');
  const [revStatus, setRevStatus] = useState<RevenueEntry['status']>('Em Espera');
  const [isBoletoGenerated, setIsBoletoGenerated] = useState(true);
  const [barcode, setBarcode] = useState('');
  const [dueDate, setDueDate] = useState('2026-08-25');
  const [instructions, setInstructions] = useState('');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Expense Modal State
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);
  const [category, setCategory] = useState('Infraestrutura Cloud');
  const [description, setDescription] = useState('');
  const [expAmount, setExpAmount] = useState('2500');
  const [expStatus, setExpStatus] = useState<ExpenseEntry['status']>('Pago');
  const [expClientName, setExpClientName] = useState('');

  // Partners Modal State
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [partner1Name, setPartner1Name] = useState(profitSplit.partner1Name);
  const [partner1Percentage, setPartner1Percentage] = useState(profitSplit.partner1Percentage);
  const [partner2Name, setPartner2Name] = useState(profitSplit.partner2Name);
  const [partner2Percentage, setPartner2Percentage] = useState(profitSplit.partner2Percentage);
  const [withdrawalDate, setWithdrawalDate] = useState(profitSplit.withdrawalDate);

  // Filter Logic
  const filteredRevenues = revenues.filter(r => {
    if (periodFilter === 'monthly') return r.month === selectedMonth;
    return true;
  });

  const filteredExpenses = expenses.filter(e => {
    if (periodFilter === 'monthly') return e.month === selectedMonth;
    return true;
  });

  // Calculations
  const totalPaidRevenue = filteredRevenues.filter(r => r.status === 'Pago').reduce((sum, r) => sum + r.amount, 0);
  const totalPendingReceivables = filteredRevenues.filter(r => r.status === 'Em Espera' || r.status === 'Atrasado').reduce((sum, r) => sum + r.amount, 0);
  const totalPaidExpenses = filteredExpenses.filter(e => e.status === 'Pago').reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalPaidRevenue - totalPaidExpenses;

  const partner1Amount = Math.max(0, netProfit * (partner1Percentage / 100));
  const partner2Amount = Math.max(0, netProfit * (partner2Percentage / 100));

  // Handlers
  const startEditRevenue = (rev: RevenueEntry) => {
    setEditingRevenue(rev);
    setClientName(rev.clientName);
    setServiceName(rev.serviceName);
    setRevAmount(rev.amount.toString());
    setPaymentMethod(rev.paymentMethod);
    setRevStatus(rev.status);
    setIsBoletoGenerated(!!rev.isBoletoGenerated);
    setBarcode(rev.barcode || '34191.09008 61234.567890 12345.678901 8 98760000150000');
    setDueDate(rev.dueDate || rev.paymentDate || '2026-08-25');
    setInstructions(rev.instructions || 'Não receber após o vencimento. Multa de 2% + Juros 1% a.m.');
    setIsRevModalOpen(true);
  };

  const resetRevForm = () => {
    setEditingRevenue(null);
    setClientName('');
    setServiceName('');
    setRevAmount('15000');
    setPaymentMethod('Boleto');
    setRevStatus('Em Espera');
    setIsBoletoGenerated(true);
    setBarcode('34191.09008 61234.567890 12345.678901 8 98760000150000');
    setDueDate('2026-08-25');
    setInstructions('Não receber após o vencimento. Multa de 2% + Juros 1% a.m.');
    setIsRevModalOpen(false);
  };

  const handleRevenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    if (editingRevenue) {
      onUpdateRevenue({
        ...editingRevenue,
        clientName,
        serviceName,
        amount: parseFloat(revAmount) || 0,
        paymentMethod,
        status: revStatus,
        isBoletoGenerated,
        barcode,
        dueDate,
        instructions
      });
    } else {
      onAddRevenue({
        id: 'rev_' + Date.now(),
        clientName,
        serviceName: serviceName || 'Serviço Comercial',
        amount: parseFloat(revAmount) || 0,
        paymentDate: dueDate || new Date().toISOString().split('T')[0],
        paymentMethod,
        status: revStatus,
        isBoletoGenerated,
        month: selectedMonth,
        barcode,
        dueDate,
        instructions
      });
    }

    resetRevForm();
  };

  const startEditExpense = (exp: ExpenseEntry) => {
    setEditingExpense(exp);
    setCategory(exp.category);
    setDescription(exp.description);
    setExpAmount(exp.amount.toString());
    setExpStatus(exp.status);
    setExpClientName(exp.clientName || '');
    setIsExpModalOpen(true);
  };

  const resetExpForm = () => {
    setEditingExpense(null);
    setCategory('Infraestrutura Cloud');
    setDescription('');
    setExpAmount('2500');
    setExpStatus('Pago');
    setExpClientName('');
    setIsExpModalOpen(false);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    if (editingExpense) {
      onUpdateExpense({
        ...editingExpense,
        category,
        description,
        amount: parseFloat(expAmount) || 0,
        status: expStatus,
        clientName: expClientName || undefined
      });
    } else {
      onAddExpense({
        id: 'exp_' + Date.now(),
        category,
        description,
        amount: parseFloat(expAmount) || 0,
        dueDate: new Date().toISOString().split('T')[0],
        status: expStatus,
        clientName: expClientName || undefined,
        month: selectedMonth
      });
    }

    resetExpForm();
  };

  const handleSavePartners = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfitSplit({
      partner1Name,
      partner1Percentage,
      partner1Amount,
      partner2Name,
      partner2Percentage,
      partner2Amount,
      withdrawalDate,
      totalNetProfit: netProfit
    });
    setIsPartnerModalOpen(false);
  };

  const handleCopyBarcode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Financial Header & Period Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-growie-dark font-sans tracking-tight flex items-center gap-2">
            <DollarSign className="text-growie-purple" /> Gestão Financeira, Boletos & Sócias
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Edite boletos dos clientes, controle cobranças, despesas operacionais e divisão de lucros.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as any)}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-growie-purple shadow-sm"
          >
            <option value="monthly">Filtro: Mensal ({selectedMonth})</option>
            <option value="quarterly">Filtro: Trimestral (Q3 / 2026)</option>
            <option value="semester">Filtro: Semestral (2º Semestre 2026)</option>
            <option value="all">Filtro: Todos os Meses</option>
          </select>

          <button
            onClick={() => {
              resetRevForm();
              setIsRevModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-600 text-white font-extrabold text-xs shadow hover:bg-amber-700 transition-colors flex items-center gap-1"
          >
            <CreditCard size={14} /> + Gerar / Emitir Boleto
          </button>

          <button
            onClick={() => {
              resetRevForm();
              setIsRevModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow hover:bg-emerald-700 transition-colors flex items-center gap-1"
          >
            <Plus size={14} /> + Lançar Receita
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Pago */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card-soft space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Receita Confirmada</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-emerald-600 font-sans block">
            R$ {totalPaidRevenue.toLocaleString('pt-BR')}
          </span>
          <p className="text-[10px] text-slate-400 font-mono">Entradas pagas no período</p>
        </div>

        {/* Contas a Receber (Boletos Emitidos) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card-soft space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase">Boletos a Receber</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <CreditCard size={18} />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-amber-600 font-sans block">
            R$ {totalPendingReceivables.toLocaleString('pt-BR')}
          </span>
          <p className="text-[10px] text-slate-400 font-mono">Boletos & cobranças pendentes</p>
        </div>

        {/* Despesas Pagas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-card-soft space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Despesas Pagas</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown size={18} />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-rose-600 font-sans block">
            R$ {totalPaidExpenses.toLocaleString('pt-BR')}
          </span>
          <p className="text-[10px] text-slate-400 font-mono">Saídas do período</p>
        </div>

        {/* Lucro Líquido */}
        <div className="bg-gradient-to-br from-growie-dark via-growie-purple to-growie-dark p-5 rounded-2xl text-white shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-growie-cyan uppercase">Lucro Líquido</span>
            <div className="p-2 rounded-xl bg-white/10 text-white">
              <PieChart size={18} />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-white font-sans block">
            R$ {netProfit.toLocaleString('pt-BR')}
          </span>
          <p className="text-[10px] text-slate-300 font-mono">Lucro líquido distribuível</p>
        </div>
      </div>

      {/* Sub Tabs: Receitas vs Despesas vs Boletos Pendentes */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('receivables')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === 'receivables'
              ? 'border-b-2 border-amber-500 text-amber-700 bg-amber-50/50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Boletos Emitidos & Contas a Receber ({filteredRevenues.filter(r => r.status !== 'Pago').length})
        </button>

        <button
          onClick={() => setActiveTab('revenues')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === 'revenues'
              ? 'border-b-2 border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Todas as Receitas ({filteredRevenues.length})
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === 'expenses'
              ? 'border-b-2 border-rose-600 text-rose-700 bg-rose-50/50'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Lançamentos de Despesas ({filteredExpenses.length})
        </button>
      </div>

      {/* RECEIVABLES / BOLETOS VIEW WITH FULL EDITING */}
      {activeTab === 'receivables' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card-soft p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-growie-dark text-sm flex items-center gap-2">
                <CreditCard size={18} className="text-amber-600" /> Gestão de Boletos dos Clientes
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Edite os valores, vencimentos, códigos de barras e instruções dos boletos lançados para seus clientes.
              </p>
            </div>

            <button
              onClick={() => {
                resetRevForm();
                setIsRevModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-extrabold text-xs hover:bg-amber-700"
            >
              + Novo Boleto
            </button>
          </div>

          <div className="space-y-3">
            {filteredRevenues.filter(r => r.status !== 'Pago').length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                Nenhum boleto ou valor pendente no momento. Clique em "+ Novo Boleto" para emitir uma cobrança.
              </div>
            ) : (
              filteredRevenues.filter(r => r.status !== 'Pago').map((rev) => (
                <div key={rev.id} className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">
                        Boleto • Vencimento: {rev.dueDate || rev.paymentDate}
                      </span>
                      <h4 className="font-extrabold text-growie-dark text-sm mt-1">{rev.clientName}</h4>
                      <p className="text-[11px] text-slate-600">{rev.serviceName}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-amber-900 text-base">
                        R$ {rev.amount.toLocaleString('pt-BR')}
                      </span>

                      <button
                        onClick={() => startEditRevenue(rev)}
                        className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 font-extrabold rounded-xl hover:bg-amber-100 flex items-center gap-1"
                        title="Editar Boleto e Cobrança"
                      >
                        <Edit2 size={13} /> Editar Boleto
                      </button>

                      <button
                        onClick={() => onUpdateRevenue({ ...rev, status: 'Pago' })}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-extrabold hover:bg-emerald-700 shadow flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} /> Marcar como Pago
                      </button>
                    </div>
                  </div>

                  {/* Boleto Barcode & Instructions Box */}
                  <div className="bg-white p-3 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Linha Digitável / Código de Barras:</span>
                      <span className="font-mono font-bold text-growie-dark">
                        {rev.barcode || '34191.09008 61234.567890 12345.678901 8 98760000150000'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyBarcode(rev.id, rev.barcode || '34191.09008 61234.567890 12345.678901 8 98760000150000')}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1 shrink-0"
                    >
                      {copiedId === rev.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{copiedId === rev.id ? 'Copiado!' : 'Copiar Código'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* REVENUES TABLE */}
      {activeTab === 'revenues' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card-soft overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-growie-bg border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase">
                <th className="py-3.5 px-4">Cliente / Origem</th>
                <th className="py-3.5 px-4">Serviço / Produto</th>
                <th className="py-3.5 px-4">Formato</th>
                <th className="py-3.5 px-4 font-mono">Valor (R$)</th>
                <th className="py-3.5 px-4">Vencimento / Pagamento</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRevenues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-semibold">
                    Nenhuma receita lançada no período. Clique em "+ Lançar Receita" para adicionar.
                  </td>
                </tr>
              ) : (
                filteredRevenues.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-extrabold text-growie-dark">{rev.clientName}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{rev.serviceName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {rev.paymentMethod} {rev.isBoletoGenerated ? '(Boleto Emitido)' : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-600">
                      R$ {rev.amount.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{rev.dueDate || rev.paymentDate}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                        rev.status === 'Pago'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {rev.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEditRevenue(rev)}
                          className="p-1.5 text-slate-500 hover:text-growie-purple hover:bg-purple-50 rounded"
                          title="Editar Receita / Boleto"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteRevenue(rev.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Excluir Receita"
                        >
                          <Trash2 size={13} />
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

      {/* EXPENSES TABLE */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card-soft overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-growie-bg border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase">
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Descrição da Despesa</th>
                <th className="py-3.5 px-4 font-mono">Valor (R$)</th>
                <th className="py-3.5 px-4">Vencimento</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 font-semibold">
                    Nenhuma despesa lançada no período. Clique em "+ Lançar Despesa" para adicionar.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-growie-dark">{exp.category}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{exp.description}</td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-rose-600">
                      R$ {exp.amount.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{exp.dueDate}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                        exp.status === 'Pago'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEditExpense(exp)}
                          className="p-1.5 text-slate-500 hover:text-growie-purple hover:bg-purple-50 rounded"
                          title="Editar Despesa"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Excluir Despesa"
                        >
                          <Trash2 size={13} />
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

      {/* Add / Edit Revenue & Boleto Modal */}
      {isRevModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-xs">
            <div className="bg-gradient-dark-purple p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-growie-cyan" />
                <h3 className="font-extrabold text-sm">
                  {editingRevenue ? 'Editar Boleto / Lançamento' : 'Emitir Novo Boleto / Lançar Receita'}
                </h3>
              </div>
              <button onClick={() => setIsRevModalOpen(false)} className="text-slate-300 hover:text-white p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleRevenueSubmit} className="p-6 space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Selecione o Cliente ou Digite o Nome *</label>
                <select
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold mb-1"
                >
                  <option value="">-- Selecionar da Base de Clientes --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.company}>{c.company} ({c.contactName})</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ou digite o nome do cliente..."
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Serviço / Contrato *</label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="Ex: Licença SaaS CRM + Atendimento WhatsApp API"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor a Cobrar (R$) *</label>
                  <input
                    type="number"
                    value={revAmount}
                    onChange={(e) => setRevAmount(e.target.value)}
                    className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono font-extrabold text-emerald-700"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Formato de Cobrança</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="Boleto">Boleto Bancário</option>
                    <option value="Pix">Pix</option>
                    <option value="Cartão">Cartão de Crédito</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>
              </div>

              {/* BOLETO EXPANDABLE DETAILS */}
              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 space-y-3">
                <h4 className="font-extrabold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard size={14} className="text-amber-700" /> Dados do Boleto & Cobrança
                </h4>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Vencimento do Boleto</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Linha Digitável / Código de Barras</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="34191.09008 61234.567890 12345.678901 8 98760000150000"
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Instruções de Pagamento</label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Ex: Não receber após o vencimento. Multa de 2% + Juros."
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status do Boleto / Pagamento</label>
                <select
                  value={revStatus}
                  onChange={(e) => setRevStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Em Espera">Em Espera / Boleto Pendente</option>
                  <option value="Pago">Pago ✅</option>
                  <option value="Atrasado">Atrasado / Vencido</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-glow-lilac transition-colors flex items-center justify-center gap-1.5 mt-2"
              >
                <Save size={15} /> {editingRevenue ? 'Salvar Alterações no Boleto' : 'Emitir & Salvar Boleto'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-dark-purple p-5 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm">
                {editingExpense ? 'Editar Despesa' : 'Lançar Nova Despesa'}
              </h3>
              <button onClick={() => setIsExpModalOpen(false)} className="text-slate-300 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Categoria da Despesa</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: Servidores / Ferramentas"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Assinatura mensal SendGrid + Google Cloud"
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={expStatus}
                  onChange={(e) => setExpStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Pago">Pago ✅</option>
                  <option value="Em Espera">Em Espera</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs shadow hover:bg-rose-700 mt-2"
              >
                <Save size={14} className="inline mr-1" /> {editingExpense ? 'Salvar Alterações' : 'Confirmar Lançamento de Despesa'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Partner Profit Split Modal */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-xs">
            <div className="bg-gradient-dark-purple p-5 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm">Editar Cadastro & Pro-labore das Sócias</h3>
              <button onClick={() => setIsPartnerModalOpen(false)} className="text-slate-300 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleSavePartners} className="p-6 space-y-4">
              <div className="space-y-3 p-3 bg-purple-50/60 rounded-xl border border-purple-200">
                <h4 className="font-extrabold text-growie-purple uppercase text-[10px]">Sócia 1</h4>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome Completo da Sócia 1</label>
                  <input
                    type="text"
                    value={partner1Name}
                    onChange={(e) => setPartner1Name(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Percentual de Divisão (%)</label>
                  <input
                    type="number"
                    value={partner1Percentage}
                    onChange={(e) => setPartner1Percentage(parseFloat(e.target.value) || 50)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-growie-purple"
                  />
                </div>
              </div>

              <div className="space-y-3 p-3 bg-cyan-50/60 rounded-xl border border-cyan-200">
                <h4 className="font-extrabold text-cyan-900 uppercase text-[10px]">Sócia 2</h4>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome Completo da Sócia 2</label>
                  <input
                    type="text"
                    value={partner2Name}
                    onChange={(e) => setPartner2Name(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Percentual de Divisão (%)</label>
                  <input
                    type="number"
                    value={partner2Percentage}
                    onChange={(e) => setPartner2Percentage(parseFloat(e.target.value) || 50)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold text-cyan-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Data Estimada da Retirada</label>
                <input
                  type="text"
                  value={withdrawalDate}
                  onChange={(e) => setWithdrawalDate(e.target.value)}
                  placeholder="Ex: 28/08/2026"
                  className="w-full p-2 bg-growie-bg border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-growie-purple text-white font-extrabold text-xs shadow hover:bg-purple-800"
              >
                Salvar Dados das Sócias
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
