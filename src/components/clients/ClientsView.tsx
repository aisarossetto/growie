import React, { useState } from 'react';
import { Building2, UserPlus, Search, Edit2, Trash2, Save, X, CheckCircle2, Phone, Mail, FileText, CreditCard, ShieldCheck } from 'lucide-react';
import { ClientItem } from '../../types';

interface ClientsViewProps {
  clients: ClientItem[];
  onAddClient: (client: ClientItem) => void;
  onUpdateClient: (client: ClientItem) => void;
  onDeleteClient: (id: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);

  // Form State
  const [company, setCompany] = useState('');
  const [document, setDocument] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [monthlyValue, setMonthlyValue] = useState('15000');
  const [status, setStatus] = useState<ClientItem['status']>('Ativo');
  const [billingFrequency, setBillingFrequency] = useState<'mensal' | 'anual' | 'semestral' | 'pontual'>('mensal');
  const [paymentDay, setPaymentDay] = useState<number>(20);
  const [exactPaymentDate, setExactPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notification, setNotification] = useState<string | null>(null);

  const startEdit = (c: ClientItem) => {
    setEditingClient(c);
    setCompany(c.company);
    setDocument(c.document);
    setContactName(c.contactName);
    setEmail(c.email);
    setPhone(c.phone);
    setService(c.service);
    setMonthlyValue(c.monthlyValue.toString());
    setStatus(c.status);
    setBillingFrequency(c.billingFrequency || 'mensal');
    setPaymentDay(c.paymentDay || 20);
    setExactPaymentDate(c.exactPaymentDate || new Date().toISOString().split('T')[0]);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setEditingClient(null);
    setCompany('');
    setDocument('');
    setContactName('');
    setEmail('');
    setPhone('');
    setService('');
    setMonthlyValue('15000');
    setStatus('Ativo');
    setBillingFrequency('mensal');
    setPaymentDay(20);
    setExactPaymentDate(new Date().toISOString().split('T')[0]);
    setIsFormOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !contactName.trim()) return;

    if (editingClient) {
      onUpdateClient({
        ...editingClient,
        company,
        document,
        contactName,
        email,
        phone,
        service,
        monthlyValue: parseFloat(monthlyValue) || 0,
        status,
        billingFrequency,
        paymentDay: Number(paymentDay) || 20,
        exactPaymentDate
      });
      setNotification(`Dados do cliente "${company}" atualizados e faturamento sincronizado no Financeiro!`);
    } else {
      const newClient: ClientItem = {
        id: 'cli_' + Date.now(),
        company,
        document: document || '00.000.000/0001-00',
        contactName,
        email,
        phone: phone || '+55 11 99999-0000',
        service: service || 'Contrato SaaS Enterprise',
        monthlyValue: parseFloat(monthlyValue) || 0,
        status,
        startDate: new Date().toISOString().split('T')[0],
        billingFrequency,
        paymentDay: Number(paymentDay) || 20,
        exactPaymentDate
      };
      onAddClient(newClient);
      setNotification(`Cliente "${company}" cadastrado e faturamento lançado automaticamente no Financeiro!`);
    }

    setTimeout(() => setNotification(null), 4000);
    resetForm();
  };

  const filteredClients = clients.filter(c => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return c.company.toLowerCase().includes(q) || c.contactName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  const totalMRR = clients.filter(c => c.status === 'Ativo').reduce((sum, c) => sum + c.monthlyValue, 0);

  return (
    <div className="space-y-6">
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
          <h2 className="text-2xl font-extrabold text-growie-dark font-sans tracking-tight flex items-center gap-2">
            <Building2 className="text-growie-purple" /> Carteira de Clientes Ativos (Contratos Fechados)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestão da base de clientes recorrentes, CNPJs, serviços contratados e faturamento mensal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-growie-purple/10 border border-growie-purple/20 text-xs">
            <span className="text-slate-500 font-bold">MRR Ativo:</span>{' '}
            <strong className="text-growie-purple font-extrabold font-sans">
              R$ {totalMRR.toLocaleString('pt-BR')} /mês
            </strong>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(!isFormOpen);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-cta text-white font-extrabold text-xs shadow-glow-lilac hover:opacity-95 transition-opacity flex items-center gap-1.5 shrink-0"
          >
            <UserPlus size={15} /> {isFormOpen ? 'Fechar Form' : '+ Adicionar Novo Cliente'}
          </button>
        </div>
      </div>

      {/* Add / Edit Form Panel */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card-soft space-y-4 animate-in fade-in text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-growie-dark text-sm">
              {editingClient ? `Editar Dados do Cliente: ${editingClient.company}` : 'Cadastrar Novo Cliente na Carteira'}
            </h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-700">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome da Empresa / Razão Social *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ex: FintechX Brasil Ltda"
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">CNPJ / CPF do Cliente</label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="Ex: 34.892.104/0001-92"
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Contato Principal *</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Ex: Carolina Mendes"
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">E-mail Comercial</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@fintechx.com.br"
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 11 98877-6655"
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark focus:border-growie-purple"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Serviço Contratado</label>
              <input
                type="text"
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="Ex: Licença CRM + Automação Zap"
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Valor do Contrato (R$)</label>
              <input
                type="number"
                value={monthlyValue}
                onChange={(e) => setMonthlyValue(e.target.value)}
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono font-bold text-growie-purple focus:border-growie-purple"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Frequência do Contrato</label>
              <select
                value={billingFrequency}
                onChange={(e) => setBillingFrequency(e.target.value as any)}
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
              >
                <option value="mensal">📅 Mensal (Recorrente Todo Mês)</option>
                <option value="anual">🗓️ Anual (Recorrente Todo Ano)</option>
                <option value="semestral">🔄 Semestral (A Cada 6 Meses)</option>
                <option value="pontual">⚡ Pontual / Avulso</option>
              </select>
            </div>

            {billingFrequency === 'mensal' ? (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dia do Pagamento no Mês</label>
                <select
                  value={paymentDay}
                  onChange={(e) => setPaymentDay(Number(e.target.value))}
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-purple focus:border-growie-purple"
                >
                  <option value={5}>Todo dia 5</option>
                  <option value={10}>Todo dia 10</option>
                  <option value={15}>Todo dia 15</option>
                  <option value={20}>Todo dia 20</option>
                  <option value={25}>Todo dia 25</option>
                  <option value={30}>Todo dia 30</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1)
                    .filter((d) => ![5, 10, 15, 20, 25, 30].includes(d))
                    .map((d) => (
                      <option key={d} value={d}>Todo dia {d}</option>
                    ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Data Exata do Pagamento</label>
                <input
                  type="date"
                  value={exactPaymentDate}
                  onChange={(e) => setExactPaymentDate(e.target.value)}
                  className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-purple focus:border-growie-purple"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status do Contrato</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-growie-dark focus:border-growie-purple"
              >
                <option value="Ativo">Contrato Ativo</option>
                <option value="Em Pausa">Em Pausa</option>
                <option value="Inativo">Inativo / Encerrado</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
              <CreditCard size={13} className="text-growie-purple" />
              <span>Ao salvar, este faturamento é lançado <strong>automaticamente</strong> na página do Financeiro!</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl text-slate-600 font-semibold hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-growie-purple text-white font-extrabold shadow hover:bg-purple-800 flex items-center gap-1.5"
              >
                <Save size={14} /> {editingClient ? 'Salvar Dados do Cliente' : 'Cadastrar Cliente'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar cliente por empresa, contato ou e-mail..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:border-growie-purple shadow-xs"
        />
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card-soft overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-growie-bg border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Empresa / Cliente</th>
              <th className="py-3.5 px-4">CNPJ / CPF</th>
              <th className="py-3.5 px-4">Contato Principal</th>
              <th className="py-3.5 px-4">Serviço Contratado</th>
              <th className="py-3.5 px-4">Cobrança & Vencimento</th>
              <th className="py-3.5 px-4 font-mono">Valor (R$)</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 text-xs font-semibold">
                  Nenhum cliente cadastrado na carteira. Clique em "+ Adicionar Novo Cliente" para cadastrar seus contratos.
                </td>
              </tr>
            ) : (
              filteredClients.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-extrabold text-growie-dark text-xs">{c.company}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Início: {c.startDate}</p>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                    {c.document}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{c.contactName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{c.email}</p>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-growie-purple">
                    {c.service}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-700 block">
                        {(!c.billingFrequency || c.billingFrequency === 'mensal')
                          ? `📅 Mensal (Todo dia ${c.paymentDay || 20})`
                          : c.billingFrequency === 'anual'
                          ? `🗓️ Anual (${c.exactPaymentDate || 'Data exata'})`
                          : c.billingFrequency === 'semestral'
                          ? `🔄 Semestral (${c.exactPaymentDate || 'Data exata'})`
                          : `⚡ Pontual (${c.exactPaymentDate || 'Data exata'})`}
                      </span>
                      <span className="inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-50 text-growie-purple border border-purple-100">
                        ⚡ Lançado no Financeiro
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-600">
                    R$ {c.monthlyValue.toLocaleString('pt-BR')}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded ${
                      c.status === 'Ativo'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : c.status === 'Em Pausa'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {c.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(c)}
                        className="px-3 py-1 rounded-lg bg-growie-purple/10 text-growie-purple font-extrabold text-xs hover:bg-growie-purple hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Edit2 size={13} /> Editar
                      </button>

                      <button
                        onClick={() => onDeleteClient(c.id)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white font-bold text-xs transition-colors"
                        title="Excluir Cliente"
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
    </div>
  );
};
