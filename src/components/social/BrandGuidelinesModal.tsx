import React, { useState } from 'react';
import { X, Sliders, Save, Upload, AlertCircle, CheckCircle2, ShieldAlert, Tag, Zap, Copy, BookOpen, Plus, Trash2, Award } from 'lucide-react';
import { BrandGuidelines, ReferenceTemplate } from '../../types';

interface BrandGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  guidelines: BrandGuidelines;
  onSaveGuidelines: (updated: BrandGuidelines) => void;
}

export const BrandGuidelinesModal: React.FC<BrandGuidelinesModalProps> = ({
  isOpen,
  onClose,
  guidelines,
  onSaveGuidelines,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'prompt' | 'templates'>('prompt');
  const [formData, setFormData] = useState<BrandGuidelines>({ ...guidelines });
  const [newForbiddenWord, setNewForbiddenWord] = useState('');
  const [newMandatoryWord, setNewMandatoryWord] = useState('');

  // Template Form State
  const [newTplTitle, setNewTplTitle] = useState('');
  const [newTplFormat, setNewTplFormat] = useState<ReferenceTemplate['format']>('carousel');
  const [newTplSample, setNewTplSample] = useState('');
  const [newTplDesc, setNewTplDesc] = useState('');
  const [newTplScriptStyle, setNewTplScriptStyle] = useState('Dramático & Persuasivo (Storytelling)');
  const [newTplScriptGuidelines, setNewTplScriptGuidelines] = useState('1. Gancho nos primeiros 3 segundos\n2. Problema real do cliente\n3. Revelação da solução Growie\n4. CTA direto');
  const [newTplSlidesCount, setNewTplSlidesCount] = useState<number>(10);
  const [newTplBadge, setNewTplBadge] = useState('+250% Conversão');
  const [newTplReferenceImages, setNewTplReferenceImages] = useState<string[]>([]);

  const [isSaved, setIsSaved] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setNewTplReferenceImages((prev) => [...prev, evt.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTplTitle.trim()) return;

    const created: ReferenceTemplate = {
      id: 'rt_' + Date.now(),
      title: newTplTitle,
      format: newTplFormat,
      sampleText: newTplSample || 'Estrutura padrão de alta conversão.',
      structureDescription: newTplDesc || 'Modelo personalizado com diretrizes visuais e escritas.',
      scriptStyle: newTplScriptStyle,
      scriptGuidelines: newTplScriptGuidelines,
      defaultSlidesCount: newTplSlidesCount,
      referenceImages: newTplReferenceImages,
      performanceBadge: newTplBadge
    };

    setFormData((prev) => ({
      ...prev,
      referenceTemplates: [...prev.referenceTemplates, created]
    }));

    setNewTplTitle('');
    setNewTplSample('');
    setNewTplDesc('');
    setNewTplReferenceImages([]);
  };

  const handleRemoveTemplate = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      referenceTemplates: prev.referenceTemplates.filter((t) => t.id !== id)
    }));
  };

  const handleAddForbidden = () => {
    if (!newForbiddenWord.trim()) return;
    setFormData((prev) => ({
      ...prev,
      forbiddenWords: [...prev.forbiddenWords, newForbiddenWord.trim()]
    }));
    setNewForbiddenWord('');
  };

  const handleRemoveForbidden = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      forbiddenWords: prev.forbiddenWords.filter((_, i) => i !== index)
    }));
  };

  const handleAddMandatory = () => {
    if (!newMandatoryWord.trim()) return;
    setFormData((prev) => ({
      ...prev,
      mandatoryWords: [...prev.mandatoryWords, newMandatoryWord.trim()]
    }));
    setNewMandatoryWord('');
  };

  const handleRemoveMandatory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      mandatoryWords: prev.mandatoryWords.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGuidelines(formData);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative">
        {/* Modal Header */}
        <div className="bg-gradient-dark-purple p-6 text-white flex items-center justify-between border-b border-growie-purple/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-growie-cyan/20 border border-growie-cyan/40 flex items-center justify-center text-growie-cyan">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">Diretrizes de Marca & Master Prompt de Criativos</h3>
              <p className="text-xs text-slate-300">Configure regras da IA, Master Prompt Mestre e Modelos de Referência ("Fazer Parecido")</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 bg-growie-bg">
          <button
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`flex-1 py-3 text-xs font-bold transition-colors ${
              activeTab === 'prompt'
                ? 'border-b-2 border-growie-purple text-growie-purple bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Regras de Marca & Master Prompt Mestre
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-3 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'templates'
                ? 'border-b-2 border-growie-purple text-growie-purple bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen size={14} /> Biblioteca de Modelos ("Fazer Parecido") ({formData.referenceTemplates.length})
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[520px] overflow-y-auto">
          {isSaved && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 font-bold flex items-center gap-2">
              <CheckCircle2 size={16} /> Diretrizes de marca e modelos salvos com sucesso!
            </div>
          )}

          {activeTab === 'prompt' && (
            <div className="space-y-4">
              {/* Logo & Tone Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-growie-bg p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Logo Oficial da Marca (Upload de Imagem)</label>
                  <div className="flex items-center gap-3">
                    <img src={formData.logoUrl} alt="Logo Preview" className="w-12 h-12 rounded-xl object-contain border border-slate-300 bg-white p-1" />
                    <label className="px-3.5 py-2 rounded-xl bg-growie-purple text-white font-bold text-xs hover:bg-purple-800 cursor-pointer flex items-center gap-1.5 shadow-sm">
                      <Upload size={14} /> Carregar Nova Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              const dataUrl = evt.target?.result as string;
                              setFormData(prev => ({ ...prev, logoUrl: dataUrl }));
                              localStorage.setItem('growie_brand_logo_url', dataUrl);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tom de Voz / Estilo de Escrita</label>
                  <select
                    value={formData.toneOfVoice}
                    onChange={(e) => setFormData(prev => ({ ...prev, toneOfVoice: e.target.value as any }))}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:border-growie-purple"
                  >
                    <option value="Profissional & Persuasivo B2B">Profissional & Persuasivo B2B</option>
                    <option value="Descontraído & Educativo">Descontraído & Educativo</option>
                    <option value="Direto & Focado em ROI">Direto & Focado em ROI</option>
                    <option value="Técnico Especialista">Técnico Especialista</option>
                  </select>
                </div>
              </div>

              {/* Master System Prompt Multi-line */}
              <div>
                <label className="block font-bold text-growie-purple mb-1 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Zap size={14} className="text-growie-cyan" /> Master Prompt Completo de Criativos (Instrução Mestre da IA)
                </label>
                <textarea
                  rows={4}
                  value={formData.masterCreativePrompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, masterCreativePrompt: e.target.value }))}
                  placeholder="Insira o prompt completo de sistema com todas as diretrizes de escrita, formatação e estilo..."
                  className="w-full p-3 bg-growie-bg border border-slate-200 rounded-xl font-mono text-growie-dark text-xs leading-relaxed focus:border-growie-purple"
                />
              </div>

              {/* Forbidden Words (Blacklist) */}
              <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-2">
                <label className="block font-bold text-rose-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-rose-600" /> Palavras Proibidas / Vetadas (A IA nunca usará)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newForbiddenWord}
                    onChange={(e) => setNewForbiddenWord(e.target.value)}
                    placeholder="Ex: milagre, garantido 100%, barato..."
                    className="flex-1 p-2 bg-white border border-rose-200 rounded-xl font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddForbidden}
                    className="px-3 py-2 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700"
                  >
                    + Vetar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.forbiddenWords.map((word, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold text-[11px] flex items-center gap-1 border border-rose-200">
                      🚫 {word}
                      <button type="button" onClick={() => handleRemoveForbidden(idx)} className="hover:text-rose-950 font-bold ml-1">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Mandatory Words (Whitelist) */}
              <div className="bg-growie-purple/5 p-4 rounded-2xl border border-growie-purple/20 space-y-2">
                <label className="block font-bold text-growie-purple uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Zap size={14} className="text-growie-cyan" /> Palavras & Jargões Obrigatórios
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMandatoryWord}
                    onChange={(e) => setNewMandatoryWord(e.target.value)}
                    placeholder="Ex: Growie CRM, IA Preditiva..."
                    className="flex-1 p-2 bg-white border border-growie-purple/30 rounded-xl font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddMandatory}
                    className="px-3 py-2 bg-growie-purple text-white font-bold rounded-xl hover:bg-purple-800"
                  >
                    + Incluir
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.mandatoryWords.map((word, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-growie-purple text-white font-semibold text-[11px] flex items-center gap-1">
                      ✓ {word}
                      <button type="button" onClick={() => handleRemoveMandatory(idx)} className="hover:text-slate-300 font-bold ml-1">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="bg-growie-bg p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-growie-dark uppercase text-[11px] flex items-center gap-1.5">
                  <Plus size={14} className="text-growie-purple" /> Cadastrar Pasta de Modelo de Design (Com Imagens de Referência)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Título do Modelo de Design</label>
                    <input
                      type="text"
                      value={newTplTitle}
                      onChange={(e) => setNewTplTitle(e.target.value)}
                      placeholder="Ex: Carrossel B2B Dark Mode"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Formato de Design</label>
                    <select
                      value={newTplFormat}
                      onChange={(e) => setNewTplFormat(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="carousel">Carrossel (Feed)</option>
                      <option value="story">Story / Reels</option>
                      <option value="feed">Post Quadrado Feed</option>
                      <option value="script">Roteiro de Vídeo</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">Prompt Especial para este Modelo</label>
                    <textarea
                      rows={2}
                      value={newTplDesc}
                      onChange={(e) => setNewTplDesc(e.target.value)}
                      placeholder="Ex: Gere o carrossel com gradiente dark purple, cards em vidro fosco e fonte sans-serif arrojada..."
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">🎭 Estilo do Roteiro / Tom Narrativo</label>
                    <input
                      type="text"
                      value={newTplScriptStyle}
                      onChange={(e) => setNewTplScriptStyle(e.target.value)}
                      placeholder="Ex: Dramático, Educativo, Direto ao Ponto..."
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-[11px] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">📑 Qtd Padrão de Lâminas / Slides</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newTplSlidesCount}
                      onChange={(e) => setNewTplSlidesCount(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-growie-purple"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">📋 Diretrizes do Roteiro (Passo a Passo da IA)</label>
                    <textarea
                      rows={2}
                      value={newTplScriptGuidelines}
                      onChange={(e) => setNewTplScriptGuidelines(e.target.value)}
                      placeholder="Ex: 1. Hook impactante de 3s | 2. Apresentação do problema | 3. Solução | 4. Call to Action..."
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">Exemplo de Estrutura do Texto / Copy</label>
                    <textarea
                      rows={2}
                      value={newTplSample}
                      onChange={(e) => setNewTplSample(e.target.value)}
                      placeholder="Cole aqui o exemplo de estrutura de copy que a IA deve replicar..."
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
                    />
                  </div>

                  {/* Upload de Imagens de Referência ("Fazer Parecido") */}
                  <div className="col-span-2 p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
                    <label className="block font-bold text-purple-900 text-[11px] flex items-center gap-1.5">
                      <Upload size={14} className="text-growie-purple" /> 📸 Imagens de Referência de Design ("Fazer Parecido")
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="block w-full text-[11px] text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-extrabold file:bg-growie-purple file:text-white hover:file:bg-purple-800 cursor-pointer"
                    />

                    {newTplReferenceImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {newTplReferenceImages.map((imgSrc, imgIdx) => (
                          <div key={imgIdx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-purple-300 shadow-xs">
                            <img src={imgSrc} alt="Ref" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setNewTplReferenceImages((prev) => prev.filter((_, i) => i !== imgIdx))}
                              className="absolute top-0 right-0 bg-rose-600 text-white w-4 h-4 rounded-bl flex items-center justify-center text-[10px] font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleAddTemplate}
                    className="px-4 py-2 bg-growie-purple text-white font-bold rounded-xl hover:bg-purple-800 flex items-center gap-1"
                  >
                    + Adicionar Modelo na Biblioteca
                  </button>
                </div>
              </div>

              {/* Templates List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 uppercase text-[11px]">Pastas de Modelos Cadastradas:</h4>
                {formData.referenceTemplates.map((tpl) => (
                  <div key={tpl.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-growie-dark text-xs">{tpl.title}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-growie-purple/10 text-growie-purple">
                          {tpl.format}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTemplate(tpl.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Excluir Modelo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-600 font-mono bg-growie-bg p-2 rounded-xl border border-slate-100">
                      {tpl.sampleText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-cta text-white font-extrabold shadow-glow-lilac hover:opacity-95 flex items-center gap-1.5"
            >
              <Save size={14} /> Salvar Diretrizes & Modelos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
