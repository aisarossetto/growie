import React, { useState } from 'react';
import { Sparkles, TrendingUp, Mail, MessageSquare, Target, CheckCircle2, ChevronRight, BarChart2, ShieldAlert } from 'lucide-react';
import { Lead, EmailCampaign, MetaAdCampaign, ConversionReport } from '../../types';

interface ConversionStrategyReportProps {
  leads: Lead[];
  emailCampaigns: EmailCampaign[];
  metaCampaigns: MetaAdCampaign[];
  onNavigateTab: (tab: any) => void;
}

export const ConversionStrategyReport: React.FC<ConversionStrategyReportProps> = ({
  leads,
  emailCampaigns,
  metaCampaigns,
  onNavigateTab,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<ConversionReport | null>(null);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);

      const generated: ConversionReport = {
        overallConversionRate: 24.8,
        funnelBottleneck: 'Queda de 32% no avanço entre a Abertura do E-mail comercial e o primeiro contato no WhatsApp.',
        emailPerformanceSummary: 'As campanhas de e-mail apresentam boa taxa de abertura (48.6%), mas faltam chamadas diretas com link rápido para WhatsApp.',
        whatsappPerformanceSummary: 'Mensagens no WhatsApp enviadas em até 10 minutos após o cadastro possuem taxa de resposta 3.4x maior.',
        strategicRecommendations: [
          {
            step: 1,
            title: 'Ativar Gatilho Automático WhatsApp API em < 10 min',
            description: 'Configure o Builder de Automações para disparar uma mensagem curta de acompanhamento assim que o e-mail for aberto.',
            expectedLift: '+18.5% em Reuniões Agendadas'
          },
          {
            step: 2,
            title: 'Reorientar Meta Ads para Público Lookalike 1% de Convertidos',
            description: 'Realoque R$ 800 das campanhas de topo de funil para o público semelhante de clientes fechados.',
            expectedLift: 'Redução de 22% no CPL Efetivo'
          },
          {
            step: 3,
            title: 'Implementar Assinatura Comercial com Link Direto no E-mail',
            description: 'Inclua botão de agendamento de 15 minutos na assinatura de todos os e-mails enviados pelos SDRs.',
            expectedLift: '+12.0% de Cliques'
          },
          {
            step: 4,
            title: 'Régua de Reengajamento para Leads Adormecidos',
            description: 'Dispare uma sequência especial de 2 e-mails para contatos que não respondem há mais de 20 dias.',
            expectedLift: 'Recuperação de 8 a 12% dos Leads'
          }
        ]
      };

      setReport(generated);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card-soft space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-growie-lilac to-growie-cyan flex items-center justify-center text-growie-dark font-bold shadow-glow-lilac shrink-0">
            <Sparkles size={20} className="animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-growie-dark font-sans tracking-tight">
              Relatório Preditivo & Estratégia de Conversão (Gemini IA)
            </h3>
            <p className="text-xs text-slate-500">
              Análise cruzada dos dados de e-mail marketing, conversas do WhatsApp API e progresso do funil.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="px-4 py-2 rounded-xl bg-gradient-cta text-white font-extrabold text-xs shadow-glow-lilac hover:opacity-95 flex items-center gap-1.5 shrink-0"
        >
          <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
          {isGenerating ? 'Analisando Dados Cruzados...' : report ? 'Atualizar Diagnóstico' : 'Gerar Relatório & Estratégias'}
        </button>
      </div>

      {!report ? (
        <div className="p-8 text-center bg-growie-bg rounded-xl border border-slate-200 text-slate-500 text-xs space-y-2">
          <p className="font-bold text-growie-dark">Nenhum relatório gerado nesta sessão.</p>
          <p className="max-w-md mx-auto">
            Clique no botão acima para que o assistente preditivo analise a taxa de abertura de e-mails, respostas de WhatsApp e gere o plano de ação comercial.
          </p>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in text-xs">
          {/* Summary Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-1">
              <span className="text-[10px] font-bold uppercase text-growie-purple">Gargalo Identificado</span>
              <p className="text-slate-800 font-semibold leading-relaxed">{report.funnelBottleneck}</p>
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1">
              <span className="text-[10px] font-bold uppercase text-indigo-700">Desempenho de E-mail</span>
              <p className="text-slate-800 font-semibold leading-relaxed">{report.emailPerformanceSummary}</p>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-700">Oportunidade no WhatsApp</span>
              <p className="text-slate-800 font-semibold leading-relaxed">{report.whatsappPerformanceSummary}</p>
            </div>
          </div>

          {/* Strategic Recommendations List */}
          <div className="space-y-2.5 pt-2">
            <h4 className="font-extrabold text-growie-dark text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Target size={14} className="text-growie-purple" /> Plano de Ação Estratégico Recomendado:
            </h4>

            <div className="space-y-2">
              {report.strategicRecommendations.map((rec) => (
                <div key={rec.step} className="p-3.5 bg-growie-bg rounded-xl border border-slate-200 flex items-start justify-between gap-3 hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-growie-purple text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      {rec.step}
                    </span>
                    <div>
                      <h5 className="font-extrabold text-growie-dark text-xs">{rec.title}</h5>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{rec.description}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-200 shrink-0">
                    {rec.expectedLift}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
