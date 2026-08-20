import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, ArrowRight, Table, AlertCircle, RefreshCw } from 'lucide-react';
import { ColumnMapping, Lead } from '../../types';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (newLeads: Partial<Lead>[]) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([
    { csvHeader: 'Nome Completo / Contato', targetField: 'name' },
    { csvHeader: 'E-mail Comercial', targetField: 'email' },
    { csvHeader: 'Telefone / WhatsApp', targetField: 'phone' },
    { csvHeader: 'Nome da Empresa', targetField: 'company' },
    { csvHeader: 'Cargo / Função', targetField: 'role' },
    { csvHeader: 'Score de Engajamento', targetField: 'score' },
    { csvHeader: 'Tags / Segmento', targetField: 'tags' },
    { csvHeader: 'Canal de Origem', targetField: 'source' },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulateFileSelect = () => {
    setFileName('leads_base_empresa_q3_2026.csv (4.8 MB)');
    setStep(2);
  };

  const handleMappingChange = (index: number, newTarget: keyof Lead | 'ignore') => {
    const updated = [...mappings];
    updated[index].targetField = newTarget;
    setMappings(updated);
  };

  const handleExecuteImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      // Simulated imported leads
      const imported: Partial<Lead>[] = [
        {
          name: 'Gustavo Pinheiro',
          email: 'gustavo@inovacaosaas.com',
          phone: '+55 11 97711-2233',
          company: 'Inovação SaaS',
          role: 'VP Sales',
          tags: ['CSV Import', 'Enterprise'],
          status: 'Novo',
          source: 'Landing Page',
          score: 88,
          scoreLabel: 'Hot',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        },
        {
          name: 'Patricia Lima',
          email: 'patricia@techcloud.io',
          phone: '+55 21 98822-4455',
          company: 'TechCloud Brasil',
          role: 'Head of Growth',
          tags: ['CSV Import'],
          status: 'Qualificado',
          source: 'Meta Ads',
          score: 76,
          scoreLabel: 'Hot',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        }
      ];
      onImportComplete(imported);
      setStep(3);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-dark-purple p-6 text-white flex items-center justify-between border-b border-growie-purple/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-growie-lilac/20 border border-growie-lilac/40 flex items-center justify-center text-growie-cyan">
              <Upload size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">Importação de Leads em Massa</h3>
              <p className="text-xs text-slate-300">Suporte a arquivos CSV e XLSX com Mapeamento de Colunas</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* Wizard Steps Bar */}
        <div className="flex border-b border-slate-100 bg-growie-bg px-6 py-3">
          {[
            { num: 1, label: '1. Selecionar Arquivo' },
            { num: 2, label: '2. Mapear Colunas' },
            { num: 3, label: '3. Validação & Conclusão' },
          ].map((s) => (
            <div key={s.num} className="flex-1 flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                step === s.num
                  ? 'bg-growie-purple text-white'
                  : step > s.num
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {step > s.num ? '✓' : s.num}
              </span>
              <span className={`text-xs font-semibold ${step === s.num ? 'text-growie-dark font-bold' : 'text-slate-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div 
                onClick={handleSimulateFileSelect}
                className="border-2 border-dashed border-growie-purple/40 hover:border-growie-purple rounded-2xl p-8 text-center bg-growie-purple/5 hover:bg-growie-purple/10 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-white shadow-md mx-auto flex items-center justify-center text-growie-purple group-hover:scale-110 transition-transform mb-3">
                  <FileText size={28} />
                </div>
                <p className="text-sm font-bold text-growie-dark">Arraste seu arquivo CSV / XLSX aqui</p>
                <p className="text-xs text-slate-500 mt-1">ou clique para procurar no seu computador (Até 50.000 linhas)</p>
                <span className="inline-block mt-4 px-3 py-1 bg-growie-purple text-white text-xs font-bold rounded-lg shadow-sm">
                  Selecionar Exemplo CSV
                </span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Dica: certifique-se que seu CSV inclua pelo menos as colunas <strong>Nome</strong> e <strong>E-mail</strong> para evitar duplicações na base multi-tenant.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-growie-bg p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-growie-purple" />
                  <span className="text-xs font-bold text-growie-dark">{fileName}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                  520 linhas detectadas
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-600">
                Confirme o de-para entre o cabeçalho do seu arquivo e os campos da plataforma Growie:
              </p>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {mappings.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50">
                    <div className="flex items-center gap-2 w-1/2">
                      <Table size={14} className="text-slate-400" />
                      <span className="text-xs font-medium text-slate-700 truncate">{m.csvHeader}</span>
                    </div>

                    <ArrowRight size={14} className="text-growie-purple shrink-0" />

                    <div className="w-1/2 pl-3">
                      <select
                        value={m.targetField}
                        onChange={(e) => handleMappingChange(idx, e.target.value as any)}
                        className="w-full py-1 px-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-growie-dark bg-white focus:border-growie-purple"
                      >
                        <option value="name">Nome Completo (name)</option>
                        <option value="email">E-mail (email)</option>
                        <option value="phone">Telefone / WhatsApp (phone)</option>
                        <option value="company">Empresa (company)</option>
                        <option value="role">Cargo (role)</option>
                        <option value="score">Score (score)</option>
                        <option value="tags">Tags (tags)</option>
                        <option value="source">Origem (source)</option>
                        <option value="ignore">-- Ignorar Coluna --</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Voltar
                </button>
                <button
                  onClick={handleExecuteImport}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-gradient-cta text-white font-bold text-xs shadow-glow-lilac hover:opacity-95 flex items-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Importando...
                    </>
                  ) : (
                    <>Processar 520 Leads</>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-growie-dark">Importação Concluída com Sucesso!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  520 novos leads foram adicionados e catalogados na base da sua organização. O Gemini Copilot iniciará a pontuação automática.
                </p>
              </div>

              <div className="p-4 bg-growie-bg rounded-xl border border-slate-200 max-w-md mx-auto text-left grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Leads Válidos:</span>
                  <span className="font-extrabold text-emerald-600 text-sm">520 / 520</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Duplicados Removidos:</span>
                  <span className="font-extrabold text-slate-700 text-sm">0</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-growie-purple text-white font-bold text-xs shadow-md hover:bg-purple-800"
              >
                Voltar à Tabela de Leads
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
