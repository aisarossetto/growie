import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Send, 
  Plus, 
  Layout, 
  FileText, 
  Video, 
  ImageIcon, 
  Sliders, 
  Eye, 
  Check, 
  X,
  Calendar,
  Palette,
  ShieldAlert,
  Zap,
  BookOpen,
  Copy
} from 'lucide-react';
import { ContentPost, BrandGuidelines, ReferenceTemplate } from '../../types';
import { VisualPostPreview } from './VisualPostPreview';
import { BrandGuidelinesModal } from './BrandGuidelinesModal';

interface ContentStudioViewProps {
  posts: ContentPost[];
  brandGuidelines: BrandGuidelines;
  onSaveBrandGuidelines: (updated: BrandGuidelines) => void;
  onAddPost: (post: ContentPost) => void;
  onUpdatePostStatus: (id: string, status: ContentPost['status']) => void;
}

export const ContentStudioView: React.FC<ContentStudioViewProps> = ({
  posts,
  brandGuidelines,
  onSaveBrandGuidelines,
  onAddPost,
  onUpdatePostStatus,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'approved' | 'drafts'>('pending');
  const [viewMode, setViewMode] = useState<'design' | 'text'>('design');
  const [formatType, setFormatType] = useState<'carousel' | 'story' | 'feed' | 'script'>('carousel');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [autoIntervalDays, setAutoIntervalDays] = useState<number>(3);
  const [topicPrompt, setTopicPrompt] = useState('Como reduzir o CAC com automação de WhatsApp e IA preditiva');
  const [targetAudience, setTargetAudience] = useState('CEOs, CMOs e diretores comerciais B2B');
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoApprove, setAutoApprove] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [batchQuantityCount, setBatchQuantityCount] = useState<number>(5);
  const [slidesPerCarousel, setSlidesPerCarousel] = useState<number>(10);
  const [scriptStyleInput, setScriptStyleInput] = useState<string>('Dramático & Persuasivo (Storytelling)');
  const [scriptGuidelinesInput, setScriptGuidelinesInput] = useState<string>('1. Gancho 3s | 2. Problema | 3. Solução Growie | 4. CTA');
  const [directReferenceImages, setDirectReferenceImages] = useState<string[]>([]);
  const [creativeInspirationNotes, setCreativeInspirationNotes] = useState<string>('Ideias: mostrar automação de vendas, comparativo antes x depois e depoimento de cliente');

  const selectedTemplate = brandGuidelines.referenceTemplates.find(t => t.id === selectedTemplateId);

  const handleDirectImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setDirectReferenceImages((prev) => [...prev, evt.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePublishToMetaManus = (post: ContentPost) => {
    onUpdatePostStatus(post.id, 'publicado');
    setNotification(`🚀 Publicado com sucesso no Feed & Stories do Instagram e Facebook via Manus / Meta Publisher API!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleGenerateContent = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);

      const isBatchMode = batchQuantityCount > 1;
      const countToGenerate = isBatchMode ? batchQuantityCount : 1;

      for (let itemIdx = 0; itemIdx < countToGenerate; itemIdx++) {
        let headline = '';
        let body = '';
        let cta = 'Agende uma demonstração no link da bio';
        let slidesText: string[] = [];
        let slidesVisual: any[] = [];

        const targetFormat = selectedTemplate ? selectedTemplate.format : formatType;
        const totalSlides = selectedTemplate?.defaultSlidesCount || slidesPerCarousel;
        const activeScriptStyle = selectedTemplate?.scriptStyle || scriptStyleInput;
        const activeScriptGuidelines = selectedTemplate?.scriptGuidelines || scriptGuidelinesInput;

        if (selectedTemplate) {
          headline = isBatchMode
            ? `[Carrossel ${itemIdx + 1}/${countToGenerate} - ${selectedTemplate.title}] - ${topicPrompt.slice(0, 25)} #${itemIdx + 1}`
            : `[Baseado no Modelo: ${selectedTemplate.title}] - ${topicPrompt.slice(0, 30)}`;
          body = `Clonando estrutura do modelo campeão: ${selectedTemplate.sampleText}\n\n🎭 Estilo de Roteiro: ${activeScriptStyle}\n📋 Diretrizes: ${activeScriptGuidelines}`;

          slidesText = Array.from({ length: totalSlides }, (_, sIdx) => {
            if (sIdx === 0) return `Slide 1: Capa (Modelo ${selectedTemplate.title}) - ${topicPrompt}`;
            if (sIdx === totalSlides - 1) return `Slide ${totalSlides}: Conclusão & CTA para demonstração no link da bio`;
            return `Slide ${sIdx + 1}: Lâmina ${sIdx + 1} desenvolvendo diretrizes do roteiro (${activeScriptStyle})`;
          });

          const activeReferenceImages: string[] = directReferenceImages.length > 0
            ? directReferenceImages
            : (selectedTemplate?.referenceImages || []);

          slidesVisual = Array.from({ length: totalSlides }, (_, sIdx) => {
            const hasImg = activeReferenceImages.length > 0;
            const chosenImg = hasImg ? activeReferenceImages[sIdx % activeReferenceImages.length] : undefined;

            if (sIdx === 0) {
              return {
                title: selectedTemplate ? `${selectedTemplate.title} #${itemIdx + 1}` : `Arte Gerada por IA #${itemIdx + 1}`,
                subtitle: `Design baseado em foto modelo (${totalSlides} Lâminas)`,
                bgGradient: 'from-growie-dark via-growie-purple to-slate-900',
                imageUrl: chosenImg
              };
            }
            return {
              title: `Lâmina ${sIdx + 1} de ${totalSlides}`,
              subtitle: `Subtítulo automático criado pela IA Gemini`,
              bgGradient: sIdx % 2 === 0 ? 'from-growie-purple to-indigo-900' : 'from-slate-900 to-growie-purple',
              imageUrl: chosenImg
            };
          });
        } else if (targetFormat === 'carousel') {
          headline = isBatchMode
            ? `Carrossel ${itemIdx + 1}/${countToGenerate}: ${topicPrompt} (Edição ${itemIdx + 1})`
            : `Como Reduzir seu CAC em 40% com IA Preditiva no Growie`;
          body = `Material gerado em massa (${totalSlides} lâminas com artes geradas por IA).\nEstilo de Roteiro: ${activeScriptStyle}\nInspiração: ${creativeInspirationNotes}`;

          slidesText = Array.from({ length: totalSlides }, (_, sIdx) => {
            if (sIdx === 0) return `Slide 1: Capa - ${topicPrompt} (Lâmina 1 de ${totalSlides})`;
            if (sIdx === totalSlides - 1) return `Slide ${totalSlides}: CTA Final para agendamento no Zap`;
            return `Slide ${sIdx + 1}: Lâmina ${sIdx + 1} de ${totalSlides} - Passo prático gerado pela IA`;
          });

          const activeReferenceImages: string[] = directReferenceImages;

          slidesVisual = Array.from({ length: totalSlides }, (_, sIdx) => {
            const hasImg = activeReferenceImages.length > 0;
            const chosenImg = hasImg ? activeReferenceImages[sIdx % activeReferenceImages.length] : undefined;

            return {
              title: `Lâmina ${sIdx + 1}/${totalSlides} (Carrossel ${itemIdx + 1})`,
              subtitle: `Subtítulo automático gerado via IA Gemini`,
              bgGradient: sIdx % 2 === 0 ? 'from-growie-dark to-growie-purple' : 'from-growie-purple to-indigo-950',
              imageUrl: chosenImg
            };
          });
        } else if (targetFormat === 'story') {
          headline = `Story ${itemIdx + 1}/${countToGenerate}: ${topicPrompt}`;
          body = `Roteiro Story (${activeScriptStyle}):\n${activeScriptGuidelines}`;
          cta = 'Toque aqui para testar o Growie IA';
        } else if (targetFormat === 'script') {
          headline = `Roteiro Reels/Vídeo ${itemIdx + 1}/${countToGenerate}: ${topicPrompt}`;
          body = `[ESTILO: ${activeScriptStyle}]\n[DIRETRIZES DA IA]:\n${activeScriptGuidelines}\n\n[ROTEIRO COMPLETO DE FALA]:\n0-5s: ${topicPrompt}\n5-20s: Explicação passo a passo\n20-30s: ${cta}`;
        } else {
          headline = `Post Feed ${itemIdx + 1}/${countToGenerate}: ${topicPrompt}`;
          body = `Conteúdo estático para feed gerado em massa.\nEstilo: ${activeScriptStyle}`;
        }

        const postStatus: ContentPost['status'] = autoApprove ? 'aprovado' : 'pendente_aprovacao';

        const created: ContentPost = {
          id: `cp_${Date.now()}_${itemIdx}`,
          type: targetFormat,
          title: headline,
          content: body,
          headlineText: headline,
          bodyText: body,
          callToAction: cta,
          carouselSlides: slidesText.length > 0 ? slidesText : undefined,
          carouselSlidesVisual: slidesVisual.length > 0 ? slidesVisual : undefined,
          status: postStatus,
          scheduledFor: `2026-08-${16 + itemIdx} 10:00`,
          targetAudiencePrompt: targetAudience,
          scriptStyle: activeScriptStyle,
          scriptGuidelines: activeScriptGuidelines,
          slidesCount: totalSlides,
          batchIndex: itemIdx + 1,
          batchTotal: countToGenerate
        };

        onAddPost(created);
      }

      setNotification(
        batchQuantityCount > 1
          ? `🚀 Sucesso! ${batchQuantityCount} materiais (${selectedTemplate ? selectedTemplate.format : formatType}) foram GERADOS EM MASSA separadamente com ${selectedTemplate?.defaultSlidesCount || slidesPerCarousel} lâminas cada!`
          : selectedTemplate 
            ? `Criativo gerado com sucesso CLONANDO O PADRÃO do modelo "${selectedTemplate.title}" com imagens de referência!`
            : 'Conteúdo gerado com sucesso respeitando o padrão de marca!'
      );
      setTimeout(() => setNotification(null), 4500);
    }, 1200);
  };

  const filteredPosts = posts.filter((p) => {
    if (activeSubTab === 'pending') return p.status === 'pendente_aprovacao';
    if (activeSubTab === 'approved') return p.status === 'aprovado' || p.status === 'publicado';
    return p.status === 'rascunho';
  });

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

      {/* Top Header & Brand Guidelines Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-growie-dark font-sans tracking-tight flex items-center gap-2">
            <Layout className="text-growie-purple" /> Content Studio & Design Social IA
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualização gráfica dos conteúdos com diretrizes de marca, Master Prompt e replicação de modelos campeões.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBrandModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-growie-bg hover:bg-slate-200 border border-slate-200 text-growie-purple text-xs font-extrabold shadow-sm transition-colors"
          >
            <Sliders size={15} /> Diretrizes & Modelos ({brandGuidelines.referenceTemplates.length} templates)
          </button>

          <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer shadow-sm">
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              className="rounded border-slate-300 text-growie-purple focus:ring-growie-purple"
            />
            <span>Aprovação Automática</span>
          </label>
        </div>
      </div>

      {/* Brand Guidelines & Templates Quick Banner */}
      <div className="p-3.5 bg-growie-purple/10 rounded-2xl border border-growie-purple/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <img src={brandGuidelines.logoUrl} alt="Brand Logo" className="w-7 h-7 rounded-lg object-cover border border-growie-purple/30 bg-white" />
          <div>
            <span className="font-extrabold text-growie-purple">Tom de Voz:</span> <span className="font-semibold text-slate-800">{brandGuidelines.toneOfVoice}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-500 font-bold flex items-center gap-1">
            <BookOpen size={13} className="text-growie-purple" /> {brandGuidelines.referenceTemplates.length} Modelo(s) Campeão(ões) disponível(is) para clonar
          </span>
        </div>
      </div>

      {/* Generator Form Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-card-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-extrabold text-growie-dark flex items-center gap-2">
            <Sparkles size={16} className="text-growie-purple" /> Criador por Pasta de Modelo ("Fazer Parecido Baseado em Imagens & Prompts")
          </h3>
          <span className="text-[11px] font-bold text-growie-purple font-mono bg-growie-purple/10 px-2.5 py-1 rounded-lg">
            ⚡ Automação Ativa: Criando novo post a cada {autoIntervalDays} dia(s)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pasta de Modelo de Design</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl text-xs font-bold text-growie-purple focus:border-growie-purple"
            >
              <option value="">-- Padrão Geral da Marca --</option>
              {brandGuidelines.referenceTemplates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  📂 {tpl.title} ({tpl.format})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Formato de Design</label>
            <select
              value={formatType}
              onChange={(e) => setFormatType(e.target.value as any)}
              className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl text-xs font-bold text-growie-purple focus:border-growie-purple"
            >
              <option value="carousel">Carrossel Slide a Slide (Feed)</option>
              <option value="story">Story / Reels Interativo</option>
              <option value="feed">Post Estático Feed</option>
              <option value="script">Roteiro de Vídeo / Reels</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-900 mb-1">🔢 Qtd Materiais em Massa</label>
            <input
              type="number"
              min={1}
              max={20}
              value={batchQuantityCount}
              onChange={(e) => setBatchQuantityCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs font-extrabold text-center text-growie-purple focus:border-growie-purple"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-900 mb-1">📑 Lâminas p/ Carrossel</label>
            <input
              type="number"
              min={1}
              max={20}
              value={slidesPerCarousel}
              onChange={(e) => setSlidesPerCarousel(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs font-extrabold text-center text-growie-purple focus:border-growie-purple"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Público-Alvo / Perfil</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Ex: CEOs e diretores comerciais"
              className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl text-xs font-medium focus:border-growie-purple"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tema Principal do Novo Post</label>
            <input
              type="text"
              value={topicPrompt}
              onChange={(e) => setTopicPrompt(e.target.value)}
              placeholder="Ex: Como reduzir o CAC com automação"
              className="w-full p-2.5 bg-growie-bg border border-slate-200 rounded-xl text-xs font-medium focus:border-growie-purple"
            />
          </div>
        </div>

        {/* Script & Guidelines custom inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">🎭 Estilo do Roteiro / Tom Narrativo</label>
            <input
              type="text"
              value={scriptStyleInput}
              onChange={(e) => setScriptStyleInput(e.target.value)}
              placeholder="Ex: Dramático, Educativo, Direto..."
              className="w-full p-2 bg-growie-bg border border-slate-200 rounded-xl text-xs font-medium focus:border-growie-purple"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">📋 Diretrizes Gerais de Conteúdo & Ideias</label>
            <input
              type="text"
              value={creativeInspirationNotes}
              onChange={(e) => setCreativeInspirationNotes(e.target.value)}
              placeholder="Ex: Mostre automação de vendas, comparativo antes x depois e depoimento..."
              className="w-full p-2 bg-growie-bg border border-slate-200 rounded-xl text-xs font-medium focus:border-growie-purple"
            />
          </div>
        </div>

        {/* Direct Photo Model Upload Area for Instant Design Replication */}
        <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-extrabold text-purple-900 text-xs flex items-center gap-1.5">
                <ImageIcon size={16} className="text-growie-purple" /> 🖼️ Carregar Foto Modelo para Design Parecido (Inspiração Instantânea)
              </h4>
              <p className="text-[11px] text-purple-700">Suba imagens de referência e a IA Gemini criará a arte, título, subtítulo e lâminas baseadas nesta estética.</p>
            </div>

            <label className="px-3.5 py-1.5 rounded-xl bg-growie-purple hover:bg-purple-800 text-white font-extrabold text-xs shadow-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1">
              <Plus size={14} /> + Foto Modelo / Design
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleDirectImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {directReferenceImages.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-purple-200/60">
              {directReferenceImages.map((imgSrc, imgIdx) => (
                <div key={imgIdx} className="relative group w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-400 shadow-xs">
                  <img src={imgSrc} alt="Modelo" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setDirectReferenceImages((prev) => prev.filter((_, i) => i !== imgIdx))}
                    className="absolute top-0 right-0 bg-rose-600 text-white w-4 h-4 rounded-bl flex items-center justify-center text-[10px] font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box if template selected */}
        {selectedTemplate && (
          <div className="p-3.5 bg-growie-purple/10 rounded-xl border border-growie-purple/30 text-xs font-mono space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-growie-purple font-extrabold">
                Pasta de Modelo Ativa: {selectedTemplate.title} ({selectedTemplate.format})
              </span>
              <span className="text-slate-600 text-[11px] font-bold">
                Intervalo: {autoIntervalDays} dia(s)
              </span>
            </div>
            <p className="text-[11px] text-slate-700">
              Prompt Especial: <span className="italic">{selectedTemplate.structureDescription || selectedTemplate.sampleText}</span>
            </p>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            onClick={handleGenerateContent}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl bg-gradient-cta text-white font-extrabold text-xs shadow-glow-lilac hover:opacity-95 flex items-center gap-2"
          >
            <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? 'Analisando Modelo e Gerando Criativo...' : selectedTemplate ? 'Gerar Conteúdo com IA Baseado na Pasta do Modelo' : 'Gerar Design com IA Gemini'}
          </button>
        </div>
      </div>

      {/* Sub Tabs: Fila de Aprovação vs Aprovados + Visual Switcher Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-2 ${
              activeSubTab === 'pending'
                ? 'bg-growie-purple text-white shadow-glow-lilac'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Clock size={15} /> Fila de Aprovação Manual ({posts.filter(p => p.status === 'pendente_aprovacao').length})
          </button>

          <button
            onClick={() => setActiveSubTab('approved')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-2 ${
              activeSubTab === 'approved'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <CheckCircle2 size={15} /> Aprovados & Agendados ({posts.filter(p => p.status === 'aprovado' || p.status === 'publicado').length})
          </button>
        </div>

        {/* Mode Switcher: Design Gráfico vs Texto */}
        <div className="flex bg-slate-200 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('design')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              viewMode === 'design' ? 'bg-white text-growie-purple shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette size={14} /> Modo Design Gráfico
          </button>
          <button
            onClick={() => setViewMode('text')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              viewMode === 'text' ? 'bg-white text-growie-purple shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText size={14} /> Modo Apenas Texto
          </button>
        </div>
      </div>

      {/* Posts Content Cards Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPosts.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-semibold">
            Nenhum conteúdo nesta fila. Use o gerador acima para criar novos posts.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card-soft space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-growie-purple/10 text-growie-purple font-mono">
                    Formato: {post.type}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    post.status === 'aprovado'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : post.status === 'pendente_aprovacao'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {post.status === 'aprovado' ? 'Aprovado' : post.status === 'pendente_aprovacao' ? 'Pendente Aprovação' : 'Rascunho'}
                  </span>
                </div>

                {viewMode === 'design' ? (
                  <VisualPostPreview post={post} brand={brandGuidelines} />
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-sm font-extrabold text-growie-dark">{post.title}</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>

                    {post.carouselSlides && (
                      <div className="p-3 bg-growie-bg rounded-xl border border-slate-200 space-y-1.5 text-xs font-mono text-slate-700">
                        <span className="text-[10px] font-bold text-growie-purple uppercase block">Estrutura do Carrossel ({post.carouselSlides.length} slides):</span>
                        {post.carouselSlides.map((slide, sIdx) => (
                          <p key={sIdx} className="text-[11px] truncate">• {slide}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions & Schedule Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Calendar size={12} /> Agendado: {post.scheduledFor || 'Imediato'}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {post.status === 'pendente_aprovacao' && (
                    <>
                      <button
                        onClick={() => {
                          onUpdatePostStatus(post.id, 'aprovado');
                          setNotification(`Post "${post.title.slice(0, 20)}..." APROVADO!`);
                          setTimeout(() => setNotification(null), 3000);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1"
                      >
                        <Check size={14} /> Aprovar Post
                      </button>
                      <button
                        onClick={() => {
                          onUpdatePostStatus(post.id, 'rascunho');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs hover:bg-slate-200"
                      >
                        Recusar
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handlePublishToMetaManus(post)}
                    className="px-3 py-1.5 rounded-lg bg-growie-purple text-white font-bold text-xs hover:bg-purple-800 transition-colors flex items-center gap-1 shadow-glow-lilac"
                  >
                    <Send size={13} /> Publicar no Instagram & Facebook via Manus
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Brand Guidelines Modal */}
      <BrandGuidelinesModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        guidelines={brandGuidelines}
        onSaveGuidelines={(updated) => {
          onSaveBrandGuidelines(updated);
          setNotification('Diretrizes de marca e modelos salvos!');
          setTimeout(() => setNotification(null), 3000);
        }}
      />
    </div>
  );
};
