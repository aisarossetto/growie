import React, { useState } from 'react';
import { Megaphone, DollarSign, Target, TrendingUp, Sparkles, Pause, Play, ArrowUpRight, BarChart2, MessageSquare, Sliders, Check } from 'lucide-react';
import { MetaAdCampaign } from '../../types';

interface MetaAdsPanelProps {
  metaCampaigns: MetaAdCampaign[];
  onToggleCampaignStatus: (id: string) => void;
  onUpdateCampaignPrompt: (id: string, newPrompt: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const MetaAdsPanel: React.FC<MetaAdsPanelProps> = ({
  metaCampaigns,
  onToggleCampaignStatus,
  onUpdateCampaignPrompt,
  onNavigateTab
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState<MetaAdCampaign>(metaCampaigns[0]);
  const [promptInput, setPromptInput] = useState<string>(metaCampaigns[0]?.customPrompt || '');
  const [notification, setNotification] = useState<string | null>(null);

  const totalSpent = metaCampaigns.reduce((acc, c) => acc + c.spent, 0);
  const totalLeads = metaCampaigns.reduce((acc, c) => acc + c.leadsGenerated, 0);
  const avgCpl = totalLeads > 0 ? (totalSpent / totalLeads).toFixed(2) : '0.00';

  const handleSavePrompt = () => {
    onUpdateCampaignPrompt(selectedCampaign.id, promptInput);
    setNotification('Prompt de público ideal salvo com sucesso! O Gemini recalibrou a segmentação no Meta Graph API.');
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className="bg-growie-dark text-white p-4 rounded-xl border border-growie-cyan shadow-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-growie-cyan animate-pulse" />
            <span className="text-xs font-semibold">{notification}</span>
          </div>
        </div>
      )}

      {/* Overview Metric Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Investimento Total Meta</span>
          <span className="text-xl font-extrabold text-growie-dark font-sans mt-1 block">R$ {totalSpent.toLocaleString('pt-BR')}</span>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            <ArrowUpRight size={12} /> +14.2% este mês
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">CPL Médio (Custo/Lead)</span>
          <span className="text-xl font-extrabold text-growie-purple font-sans mt-1 block">R$ {avgCpl}</span>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
            <ArrowUpRight size={12} /> 18% abaixo da meta B2B
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Leads Qualificados Gerados</span>
          <span className="text-xl font-extrabold text-growie-cyan font-sans mt-1 block">{totalLeads} Leads</span>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">Sincronizados via Graph API</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Qualidade Média dos Leads</span>
          <span className="text-xl font-extrabold text-emerald-600 font-sans mt-1 block">90 / 100</span>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Foco em Alta Performance</span>
        </div>
      </div>

      {/* Campaign Selector & Custom Prompt per Campaign */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-growie-dark flex items-center gap-2">
              <Sliders size={16} className="text-growie-purple" /> Definir Prompt de Público Ideal para a Campanha
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Defina as características do público de alta conversão para calibrar o algoritmo do Meta Ads via Gemini.
            </p>
          </div>

          <select
            value={selectedCampaign.id}
            onChange={(e) => {
              const camp = metaCampaigns.find(c => c.id === e.target.value) || metaCampaigns[0];
              setSelectedCampaign(camp);
              setPromptInput(camp.customPrompt || '');
            }}
            className="p-2 bg-growie-bg border border-slate-200 rounded-xl text-xs font-bold text-growie-purple focus:border-growie-purple"
          >
            {metaCampaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            Prompt Customizado de Público (Instruções para a IA):
          </label>
          <textarea
            rows={3}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Ex: Público focado em diretores de vendas e CEOs com faturamento > R$ 1MM, interessados em automação..."
            className="w-full p-3 bg-growie-bg border border-slate-200 rounded-xl text-xs text-growie-dark font-mono leading-relaxed focus:outline-none focus:border-growie-purple"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSavePrompt}
              className="px-4 py-2 rounded-xl bg-gradient-cta text-white font-extrabold text-xs shadow-glow-lilac hover:opacity-95 flex items-center gap-1.5"
            >
              <Sparkles size={14} /> Aplicar Prompt no Meta Ads
            </button>
          </div>
        </div>
      </div>

      {/* Deep Performance Analysis Box: Criativos, Descrição, Título, Público */}
      <div className="bg-growie-bg p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-extrabold text-growie-dark flex items-center gap-2">
          <Sparkles size={16} className="text-growie-cyan" /> Relatório Preditivo de Criativos & Performance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="font-bold text-growie-purple block uppercase text-[10px]">Análise de Criativo (Visual)</span>
            <p className="text-slate-700 font-medium leading-relaxed">
              {selectedCampaign.creativeAnalysis || 'Vídeos demonstrativos curtos apresentam CTR 45% superior a imagens estáticas.'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="font-bold text-growie-cyan block uppercase text-[10px]">Análise de Descrição & Copy</span>
            <p className="text-slate-700 font-medium leading-relaxed">
              {selectedCampaign.descriptionAnalysis || 'Textos que enfatizam redução de tempo e retorno sobre investimento possuem maior qualificação.'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="font-bold text-amber-600 block uppercase text-[10px]">Análise de Título / Headline</span>
            <p className="text-slate-700 font-medium leading-relaxed">
              {selectedCampaign.headlineAnalysis || 'Headlines diretas com a palavra "IA" geram a maior taxa de conversão em leads quentes.'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
            <span className="font-bold text-emerald-600 block uppercase text-[10px]">Análise de Público & Qualidade</span>
            <p className="text-slate-700 font-medium leading-relaxed">
              {selectedCampaign.audienceAnalysis || 'Público Lookalike 1% de clientes fechados garante Score de Qualidade de 92/100.'}
            </p>
          </div>
        </div>
      </div>

      {/* Active Campaigns Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card-soft overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-growie-dark flex items-center gap-2">
            <Megaphone size={16} className="text-growie-purple" /> Campanhas no Meta Ads Graph API
          </h3>
          <button 
            onClick={() => onNavigateTab('copilot')}
            className="text-xs text-growie-purple font-bold hover:underline"
          >
            Pedir Dicas à IA
          </button>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-growie-bg border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase">
              <th className="py-3 px-4">Nome da Campanha</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Orçamento Mensal</th>
              <th className="py-3 px-4">Gasto Atual</th>
              <th className="py-3 px-4">Leads</th>
              <th className="py-3 px-4">CPL (R$)</th>
              <th className="py-3 px-4">Qualidade</th>
              <th className="py-3 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {metaCampaigns.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-bold text-growie-dark">{c.name}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status === 'Ativa' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono">R$ {c.budget.toLocaleString('pt-BR')}</td>
                <td className="py-3.5 px-4 font-mono text-slate-600">R$ {c.spent.toLocaleString('pt-BR')}</td>
                <td className="py-3.5 px-4 font-bold text-growie-purple">{c.leadsGenerated}</td>
                <td className="py-3.5 px-4 font-bold text-growie-cyan">R$ {c.cpl.toFixed(2)}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200">
                    {c.leadQualityScore || 90} / 100
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => onToggleCampaignStatus(c.id)}
                    className="p-1.5 rounded-lg bg-growie-bg hover:bg-slate-200 text-slate-700 transition-colors"
                    title={c.status === 'Ativa' ? 'Pausar Campanha' : 'Ativar Campanha'}
                  >
                    {c.status === 'Ativa' ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
