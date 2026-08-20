import React, { useState } from 'react';
import { X, UserPlus, Building2, Mail, Phone, UserCheck, Tag, DollarSign, FileText, Save, Plus, Trash2, Layers, Globe, AlertCircle } from 'lucide-react';
import { Lead, LeadSource, LeadCompanySectorContact, LeadGroup } from '../../types';
import { checkLeadDuplicate } from '../../utils/leadDuplicateDetector';

interface SingleLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: Partial<Lead>) => void;
  currentUser?: any;
  users?: any[];
  availableGroups?: LeadGroup[];
  existingLeads?: Lead[];
}

export const SingleLeadModal: React.FC<SingleLeadModalProps> = ({
  isOpen,
  onClose,
  onAddLead,
  currentUser = 'Isadora Rossetto',
  availableGroups = [
    { id: 'g1', name: '📂 Leads B2B', leadIds: [] },
    { id: 'g2', name: '📂 Campanha Meta Ads', leadIds: [] },
    { id: 'g3', name: '📂 Prospectos VIP', leadIds: [] }
  ],
  existingLeads = [],
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState('');
  const [ramo, setRamo] = useState('Tecnologia / Software');
  const [role, setRole] = useState('Gerente / Decisor');
  const [responsibleName, setResponsibleName] = useState(currentUser || 'Isadora Rossetto');
  const [source, setSource] = useState<LeadSource>('Meta Ads');
  const [interestLevel, setInterestLevel] = useState<Lead['interestLevel']>('Alto');
  const [interestCategory, setInterestCategory] = useState('CRM Enterprise + API WhatsApp');
  const [value, setValue] = useState('15000');
  const [notes, setNotes] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [newFolderInput, setNewFolderInput] = useState('');

  // Live duplicate check
  const duplicateResult = checkLeadDuplicate(
    { name, email, phone, company, city },
    existingLeads
  );

  // Dynamic Sector Contacts
  const [sectorContacts, setSectorContacts] = useState<LeadCompanySectorContact[]>([]);

  const handleAddSectorContact = () => {
    setSectorContacts([
      ...sectorContacts,
      {
        id: 'sec_' + Date.now(),
        sectorName: 'Compras',
        contactName: '',
        email: '',
        phone: '',
        role: ''
      }
    ]);
  };

  const handleRemoveSectorContact = (index: number) => {
    setSectorContacts(sectorContacts.filter((_, i) => i !== index));
  };

  const handleSectorChange = (index: number, field: keyof LeadCompanySectorContact, val: string) => {
    setSectorContacts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) return;

    onAddLead({
      name,
      email: email || 'lead@empresa.com.br',
      phone: phone || '+55 11 99999-0000',
      company,
      city: city || 'São Paulo - SP',
      ramo: ramo || 'Geral / Serviços',
      role,
      responsibleName,
      initiatorName: 'Manual via Formulário',
      source,
      interestLevel,
      interestCategory,
      value: parseFloat(value) || 0,
      notes,
      score: interestLevel === 'Muito Alto' ? 95 : interestLevel === 'Alto' ? 82 : 65,
      tags: [source, interestLevel],
      status: 'Novo',
      isSleeping: false,
      groups: selectedGroups,
      sectorContacts
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in font-sans">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-dark-purple p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-growie-cyan/20 border border-growie-cyan/40 flex items-center justify-center text-growie-cyan">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Cadastrar Novo Lead Comercial</h3>
              <p className="text-[11px] text-slate-300">Adicionar contato individual no funil de vendas</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Live Duplicate Detector Alert */}
          {duplicateResult.isDuplicate && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-2.5 text-amber-900 animate-in fade-in">
              <AlertCircle size={18} className="text-amber-600 shrink-0" />
              <div>
                <strong className="block font-extrabold text-[11px]">⚠️ Alerta Anti-Duplicata (IA Growie)</strong>
                <p className="text-[10px] font-medium">{duplicateResult.reason}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome Completo do Contato *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Roberto Almeida"
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold focus:border-growie-purple"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome da Empresa *</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ex: TechVanguard Ltda"
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold focus:border-growie-purple"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">🏢 Ramo de Atuação / Ramo (Escrito)</label>
              <input
                type="text"
                list="ramo-suggestions"
                value={ramo}
                onChange={(e) => setRamo(e.target.value)}
                placeholder="Ex: Tecnologia / Software, Saúde, Varejo, Logística..."
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold text-purple-900 focus:border-growie-purple"
              />
              <datalist id="ramo-suggestions">
                <option value="Tecnologia / Software" />
                <option value="Saúde & Medicina" />
                <option value="Varejo & E-commerce" />
                <option value="Serviços Financeiros & Fintech" />
                <option value="Indústria & Manufatura" />
                <option value="Logística & Transportes" />
                <option value="Educação & Cursos" />
                <option value="Imobiliário & Construção" />
                <option value="Alimentos & Bebidas" />
                <option value="Marketing & Comunicação" />
                <option value="Consultoria & Serviços Profissionais" />
              </datalist>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cidade / Estado (UF)</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo - SP"
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold focus:border-growie-purple text-cyan-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">E-mail Profissional</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="roberto@techvanguard.com"
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono focus:border-growie-purple"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 11 98888-7777"
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-mono focus:border-growie-purple"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cargo / Função Principal</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: CEO / Diretor Comercial"
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold focus:border-growie-purple"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Responsável Comercial (SDR/Closer)</label>
              <input
                type="text"
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold focus:border-growie-purple"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Origem do Lead</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as any)}
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold focus:border-growie-purple"
              >
                <option value="Meta Ads">Meta Ads (Facebook/Instagram)</option>
                <option value="Google Ads">Google Ads</option>
                <option value="LinkedIn Ads">LinkedIn Ads</option>
                <option value="Prospecção Fria">Prospecção Fria / Outbound</option>
                <option value="Landing Page">Landing Page Inbound</option>
                <option value="Indicação">Indicação de Cliente</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nível de Interesse</label>
              <select
                value={interestLevel}
                onChange={(e) => setInterestLevel(e.target.value as any)}
                className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-semibold focus:border-growie-purple"
              >
                <option value="Muito Alto">🔥 Muito Alto (Hot Lead)</option>
                <option value="Alto">⚡ Alto (Warm Lead)</option>
                <option value="Médio">🌤️ Médio</option>
                <option value="Baixo">❄️ Baixo (Cold)</option>
              </select>
            </div>
          </div>

          {/* MULTI-FOLDER / GROUP ASSIGNMENT SECTION */}
          <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200 space-y-2">
            <label className="block font-bold text-growie-purple text-xs">
              📁 Pastas / Grupos do Lead (Pode selecionar uma ou mais pastas simultaneamente):
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {availableGroups.map((g) => {
                const isSelected = selectedGroups.includes(g.name);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedGroups(selectedGroups.filter((n) => n !== g.name));
                      } else {
                        setSelectedGroups([...selectedGroups, g.name]);
                      }
                    }}
                    className={`px-3 py-1 rounded-xl font-extrabold text-[11px] transition-all flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-growie-purple text-white border-purple-800 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-growie-purple'
                    }`}
                  >
                    <span>{g.name}</span>
                    {isSelected && <span className="text-[10px]">✓</span>}
                  </button>
                );
              })}

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newFolderInput}
                  onChange={(e) => setNewFolderInput(e.target.value)}
                  placeholder="+ Criar Nova Pasta"
                  className="px-2 py-1 bg-white border border-slate-300 rounded-xl text-[11px] font-semibold w-32 focus:border-growie-purple focus:outline-none"
                />
                {newFolderInput.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      const formatted = newFolderInput.startsWith('📂') ? newFolderInput.trim() : `📂 ${newFolderInput.trim()}`;
                      if (!selectedGroups.includes(formatted)) {
                        setSelectedGroups([...selectedGroups, formatted]);
                      }
                      setNewFolderInput('');
                    }}
                    className="p-1.5 rounded-xl bg-growie-purple text-white font-bold text-xs"
                  >
                    <Plus size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* DYNAMIC COMPANY SECTOR CONTACTS SECTION */}
          <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-growie-purple text-xs flex items-center gap-1.5">
                <Layers size={15} /> Contatos por Setores da Empresa (Marketing, RH, Compras, Decisor...)
              </h4>
              <button
                type="button"
                onClick={handleAddSectorContact}
                className="px-3 py-1 bg-growie-purple text-white font-extrabold text-[11px] rounded-xl hover:bg-purple-800 transition-colors flex items-center gap-1"
              >
                <Plus size={13} /> + Adicionar Setor / Contato
              </button>
            </div>

            {sectorContacts.length === 0 ? (
              <p className="text-[11px] text-slate-500 font-medium">
                Nenhum setor adicional cadastrado. Clique no botão acima para adicionar contatos de RH, Compras, TI, Marketing, etc.
              </p>
            ) : (
              <div className="space-y-3">
                {sectorContacts.map((sc, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 relative">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                      <span className="font-extrabold text-growie-dark text-[11px]">Setor #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSectorContact(idx)}
                        className="text-rose-500 hover:text-rose-700 text-[11px] font-bold flex items-center gap-0.5"
                      >
                        <Trash2 size={12} /> Remover Setor
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Nome do Setor</label>
                        <select
                          value={sc.sectorName}
                          onChange={(e) => handleSectorChange(idx, 'sectorName', e.target.value)}
                          className="w-full p-1.5 bg-growie-bg border border-slate-200 rounded-lg text-[11px] font-bold"
                        >
                          <option value="Compras">🛒 Compras</option>
                          <option value="Marketing">📢 Marketing</option>
                          <option value="RH">👥 RH / Recursos Humanos</option>
                          <option value="Decisor / CEO">👔 Decisor / CEO</option>
                          <option value="Proprietário">🏢 Proprietário / Sócio</option>
                          <option value="Financeiro">💰 Financeiro</option>
                          <option value="TI">💻 TI / Tecnologia</option>
                          <option value="Outro">📁 Outro Setor</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Nome do Contato</label>
                        <input
                          type="text"
                          value={sc.contactName}
                          onChange={(e) => handleSectorChange(idx, 'contactName', e.target.value)}
                          placeholder="Ex: Fernando Silva"
                          className="w-full p-1.5 bg-growie-bg border border-slate-200 rounded-lg text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">E-mail do Setor</label>
                        <input
                          type="email"
                          value={sc.email}
                          onChange={(e) => handleSectorChange(idx, 'email', e.target.value)}
                          placeholder="fernando@empresa.com.br"
                          className="w-full p-1.5 bg-growie-bg border border-slate-200 rounded-lg text-[11px] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Telefone / WhatsApp</label>
                        <input
                          type="text"
                          value={sc.phone}
                          onChange={(e) => handleSectorChange(idx, 'phone', e.target.value)}
                          placeholder="+55 11 98888-7777"
                          className="w-full p-1.5 bg-growie-bg border border-slate-200 rounded-lg text-[11px] font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Cargo / Especificação</label>
                        <input
                          type="text"
                          value={sc.role || ''}
                          onChange={(e) => handleSectorChange(idx, 'role', e.target.value)}
                          placeholder="Ex: Gerente de Suprimentos"
                          className="w-full p-1.5 bg-growie-bg border border-slate-200 rounded-lg text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Observações Comerciais</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes adicionais sobre a negociação..."
              className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl font-medium"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-cta text-white font-extrabold shadow-glow-lilac hover:opacity-95 flex items-center gap-1.5 text-xs"
            >
              <Save size={14} /> Salvar Lead & Setores
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
