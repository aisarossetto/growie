import React, { useState } from 'react';
import { 
  Smartphone, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Sparkles, 
  Share2, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Copy, 
  Check, 
  Building2 
} from 'lucide-react';
import { ContentPost, BrandGuidelines } from '../../types';

interface VisualPostPreviewProps {
  post: ContentPost;
  brand: BrandGuidelines;
}

export const VisualPostPreview: React.FC<VisualPostPreviewProps> = ({ post, brand }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const slides = post.carouselSlidesVisual || [
    { 
      title: post.headlineText || post.title, 
      subtitle: post.bodyText || post.content, 
      bgGradient: 'from-growie-dark via-growie-purple to-growie-dark' 
    }
  ];

  const handleCopyDesignText = () => {
    const textToCopy = `[CRIATIVO GROWIE - ${post.type.toUpperCase()}]\n\nTítulo: ${post.headlineText || post.title}\n\nLegenda: ${post.content}\n\nCall to Action: ${post.callToAction || 'Link na bio'}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-4">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-growie-lilac to-growie-cyan flex items-center justify-center text-growie-dark font-bold">
            <Zap size={16} />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white">Visualizador Gráfico de Design (Padrão de Marca)</h4>
            <p className="text-[10px] text-slate-400">Layout formatado com paleta Growie e logo oficial</p>
          </div>
        </div>

        <button
          onClick={handleCopyDesignText}
          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5"
        >
          {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          {isCopied ? 'Texto Copiado!' : 'Copiar Texto do Post'}
        </button>
      </div>

      {/* Render Story Graphic Mockup (Mobile Screen) */}
      {post.type === 'story' && (
        <div className="flex justify-center py-4">
          <div className="w-64 h-[440px] rounded-[36px] bg-gradient-to-br from-growie-dark via-growie-purple to-growie-dark border-4 border-slate-700 shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden text-center">
            {/* Background Glow Overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-growie-cyan/20 rounded-full blur-2xl pointer-events-none" />

            {/* Story Top Bar & Logo Header */}
            <div>
              <div className="h-1 w-full bg-white/30 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-growie-cyan w-2/3 rounded-full" />
              </div>

              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white p-1 flex items-center justify-center shadow">
                    <Zap size={14} className="text-growie-purple" />
                  </div>
                  <span className="text-[11px] font-extrabold text-white">Growie.io</span>
                </div>
                <span className="text-[9px] text-slate-300 font-mono">12m</span>
              </div>
            </div>

            {/* Story Middle Headline Visual */}
            <div className="space-y-3 px-2 z-10">
              <span className="inline-block px-2.5 py-1 rounded-full bg-growie-cyan text-growie-dark font-extrabold text-[10px] uppercase tracking-wider shadow">
                Pergunta Interativa
              </span>
              <h3 className="text-base font-extrabold text-white leading-tight font-sans">
                {post.headlineText || post.title}
              </h3>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                {post.bodyText || post.content}
              </p>

              {/* Story Sticker Simulation */}
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 space-y-1.5 text-left">
                <p className="text-[10px] font-bold text-growie-cyan text-center uppercase">Enquete de Vendas:</p>
                <div className="p-2 bg-white/20 rounded-lg text-[11px] font-bold text-white text-center">
                  Sim, totalmente (68%)
                </div>
                <div className="p-2 bg-white/10 rounded-lg text-[11px] font-bold text-slate-300 text-center">
                  Ainda não (32%)
                </div>
              </div>
            </div>

            {/* Story Bottom CTA Box */}
            <div className="z-10 pb-2">
              <div className="w-full py-2 rounded-xl bg-gradient-cta text-white font-extrabold text-xs shadow-glow-lilac flex items-center justify-center gap-1">
                <Sparkles size={13} /> {post.callToAction || 'Toque para testar o Growie'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render Carousel or Feed Post Graphic Mockup */}
      {(post.type === 'carousel' || post.type === 'feed') && (
        <div className="space-y-4">
          <div className="w-full max-w-md mx-auto aspect-square rounded-2xl bg-gradient-to-br from-growie-dark via-growie-purple to-growie-dark border border-growie-purple/40 shadow-2xl p-6 flex flex-col justify-between relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-growie-lilac/30 rounded-full blur-3xl pointer-events-none" />

            {/* Header Brand Overlay */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white text-growie-purple flex items-center justify-center font-bold shadow">
                  <Zap size={18} />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-white tracking-wide block">GROWIE CRM</span>
                  <span className="text-[9px] text-growie-cyan font-mono font-bold uppercase">Automação Comercial</span>
                </div>
              </div>

              {post.type === 'carousel' && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-slate-200">
                  Slide {currentSlideIndex + 1} de {slides.length}
                </span>
              )}
            </div>

            {/* Slide Body Content */}
            <div className="relative z-10 my-auto text-center space-y-3 px-2">
              {slides[currentSlideIndex]?.imageUrl && (
                <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden border-2 border-growie-cyan/60 shadow-lg">
                  <img src={slides[currentSlideIndex].imageUrl} alt="Reference" className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="text-lg font-extrabold text-white font-sans tracking-tight leading-tight">
                {slides[currentSlideIndex]?.title || post.headlineText || post.title}
              </h3>
              <p className="text-xs text-slate-200 font-medium leading-relaxed max-w-sm mx-auto">
                {slides[currentSlideIndex]?.subtitle || post.bodyText || post.content}
              </p>
            </div>

            {/* Slide Bottom Bar */}
            <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-[10px] text-growie-cyan font-bold flex items-center gap-1">
                <Sparkles size={12} /> growie.io/demo
              </span>
              <span className="text-[10px] text-slate-300 font-semibold">
                {post.callToAction || 'Arrraste para o lado'} &rarr;
              </span>
            </div>
          </div>

          {/* Instagram & Facebook Native Mockup Controls Bar */}
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] font-semibold text-slate-300">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-[10px] flex items-center gap-1">
                📸 Instagram Carousel (1080x1080)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-extrabold text-[10px] flex items-center gap-1">
                📘 Facebook Feed & Page
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-400">
              <span className="flex items-center gap-1 text-rose-400 font-bold"><Heart size={14} /> 1.4k</span>
              <span className="flex items-center gap-1 text-sky-400 font-bold"><MessageCircle size={14} /> 328</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold"><Share2 size={14} /> 89</span>
              <Bookmark size={14} className="text-amber-400" />
            </div>
          </div>

          {/* Carousel Slide Navigator Controls */}
          {post.type === 'carousel' && slides.length > 1 && (
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex gap-1.5 items-center">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === currentSlideIndex ? 'bg-growie-cyan w-6' : 'bg-slate-700 w-2.5'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === slides.length - 1}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Render Video / Reels Script Graphic Timeline */}
      {post.type === 'script' && (
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
          <span className="text-growie-cyan font-bold uppercase text-[10px] block">Roteiro de Gravação & Cenas (Reels 30s):</span>

          <div className="space-y-2">
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-2">
              <span className="px-2 py-0.5 bg-growie-purple text-white rounded text-[10px] font-bold">0-5s</span>
              <div>
                <p className="font-bold text-white">Gatilho de Gancho Visual:</p>
                <p className="text-slate-300 font-sans text-[11px] mt-0.5">"Você está perdendo leads quentes porque demora a responder?" (Mostre notificação no celular)</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-2">
              <span className="px-2 py-0.5 bg-growie-purple text-white rounded text-[10px] font-bold">5-15s</span>
              <div>
                <p className="font-bold text-white">Demonstração na Tela:</p>
                <p className="text-slate-300 font-sans text-[11px] mt-0.5">Mostre o Dashboard do Growie e a automação visual disparando o WhatsApp API.</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-2">
              <span className="px-2 py-0.5 bg-growie-cyan text-growie-dark rounded text-[10px] font-bold">15-30s</span>
              <div>
                <p className="font-bold text-white">Chamada para Ação (CTA):</p>
                <p className="text-slate-300 font-sans text-[11px] mt-0.5">"Comente RESULTADO para testar a IA do Growie gratuitamente."</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
