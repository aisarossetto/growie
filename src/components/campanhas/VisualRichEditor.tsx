import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify, Type, Palette } from 'lucide-react';

interface VisualRichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label: string;
  showVariables?: boolean;
}

export const VisualRichEditor: React.FC<VisualRichEditorProps> = ({
  value,
  onChange,
  placeholder = 'Escreva sua mensagem aqui...',
  minHeight = '180px',
  label,
  showVariables = true,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState('14px');
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Sync internal HTML with external value prop safely
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        if (value === '' && (editorRef.current.innerHTML === '<br>' || editorRef.current.innerHTML === '<div><br></div>')) {
          return;
        }
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  };

  const execCmd = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    handleInput();
  };

  // Insert image directly with clean HTML inline styles
  const insertImageSrc = (src: string) => {
    if (!src) return;
    const imgHtml = `<img src="${src}" style="max-width: 100%; height: auto; display: block; margin: 10px 0; border: 0; outline: none;" alt="Imagem do E-mail" />`;

    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, imgHtml);
      handleInput();
    }
  };

  // Resize & Compress Image to JPEG/PNG DataUrl under 800px width (prevents Gmail clipping)
  const processAndInsertImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          insertImageSrc(src);
          return;
        }

        const maxWidth = 700;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Compress JPEG to 0.72 quality for ultra compact base64
        const compressed = canvas.toDataURL('image/jpeg', 0.72);
        insertImageSrc(compressed);
      };
      img.onerror = () => insertImageSrc(src);
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Handle Ctrl + V pasting of images from clipboard safely
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            processAndInsertImage(file);
          }
          return;
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processAndInsertImage(files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const applyCustomFontSize = (sizePx: string) => {
    setSelectedFontSize(sizePx);
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      // If no text selected, set font size execCmd mapped command
      const mappedSize = sizePx === '8px' ? '1' : sizePx === '11px' ? '2' : sizePx === '12px' ? '2' : sizePx === '14px' ? '3' : sizePx === '16px' ? '4' : sizePx === '18px' ? '5' : '6';
      execCmd('fontSize', mappedSize);
      return;
    }

    const span = document.createElement('span');
    span.style.fontSize = sizePx;
    span.style.lineHeight = '1.4';
    try {
      range.surroundContents(span);
      handleInput();
    } catch (e) {
      const mappedSize = sizePx === '8px' ? '1' : sizePx === '11px' ? '2' : sizePx === '12px' ? '2' : sizePx === '14px' ? '3' : sizePx === '16px' ? '4' : sizePx === '18px' ? '5' : '6';
      execCmd('fontSize', mappedSize);
    }
  };

  const insertVar = (varName: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, varName);
      handleInput();
    }
  };

  const colors = [
    { label: 'Preto', color: '#1e293b' },
    { label: 'Roxo Growie', color: '#6c5ce7' },
    { label: 'Azul', color: '#2563eb' },
    { label: 'Verde', color: '#10b981' },
    { label: 'Vinho', color: '#e11d48' },
    { label: 'Cinza', color: '#64748b' },
  ];

  return (
    <div className="space-y-1.5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
          <span>{label}</span>
        </label>

        <span className="text-[10px] font-mono font-bold text-growie-purple bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
          <ImageIcon size={11} className="text-growie-purple" /> 📋 Cole imagens diretamente com Ctrl + V!
        </span>
      </div>

      {/* Editor Container */}
      <div className={`bg-white border rounded-2xl overflow-hidden transition-all ${
        isFocused ? 'border-growie-purple ring-2 ring-growie-purple/20 shadow-md' : 'border-slate-200 shadow-card-soft'
      }`}>
        {/* Formatting Toolbar Header */}
        <div className="bg-growie-bg px-3 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
          <div className="flex flex-wrap items-center gap-1">
            {/* Font Style Controls */}
            <button
              type="button"
              onClick={() => execCmd('bold')}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 font-black text-slate-700 border border-slate-200 shadow-2xs"
              title="Negrito (Ctrl+B)"
            >
              <Bold size={13} />
            </button>
            <button
              type="button"
              onClick={() => execCmd('italic')}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 font-serif italic text-slate-700 border border-slate-200 shadow-2xs"
              title="Itálico (Ctrl+I)"
            >
              <Italic size={13} />
            </button>
            <button
              type="button"
              onClick={() => execCmd('underline')}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 underline text-slate-700 border border-slate-200 shadow-2xs"
              title="Sublinhado (Ctrl+U)"
            >
              <Underline size={13} />
            </button>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            {/* Exact Font Size Selector requested by user: 8, 11, 12, 14, 16, 18, 21 */}
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <Type size={12} className="text-slate-400" />
              <select
                value={selectedFontSize}
                onChange={(e) => applyCustomFontSize(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="8px">Fonte 8px</option>
                <option value="11px">Fonte 11px</option>
                <option value="12px">Fonte 12px</option>
                <option value="14px">Fonte 14px (Normal)</option>
                <option value="16px">Fonte 16px</option>
                <option value="18px">Fonte 18px</option>
                <option value="21px">Fonte 21px (Título)</option>
              </select>
            </div>

            {/* Text Alignment */}
            <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => execCmd('justifyLeft')}
                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                title="Alinhar à Esquerda"
              >
                <AlignLeft size={12} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('justifyCenter')}
                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                title="Centralizar"
              >
                <AlignCenter size={12} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('justifyRight')}
                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                title="Alinhar à Direita"
              >
                <AlignRight size={12} />
              </button>
              <button
                type="button"
                onClick={() => execCmd('justifyFull')}
                className="p-1 hover:bg-slate-100 rounded text-slate-600"
                title="Justificar"
              >
                <AlignJustify size={12} />
              </button>
            </div>

            {/* Text Color Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs flex items-center gap-1 text-[11px] font-bold"
                title="Cor do Texto"
              >
                <Palette size={13} className="text-growie-purple" /> Cor
              </button>
              {showColorPicker && (
                <div className="absolute left-0 top-full mt-1 z-30 bg-white p-2 rounded-xl shadow-xl border border-slate-200 flex items-center gap-1.5 animate-in fade-in">
                  {colors.map((c, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        execCmd('foreColor', c.color);
                        setShowColorPicker(false);
                      }}
                      className="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            {/* Upload Image Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-growie-purple/10 text-growie-purple font-extrabold hover:bg-growie-purple hover:text-white transition-colors flex items-center gap-1 border border-growie-purple/20 text-[11px]"
              title="Carregar Imagem de Arquivo"
            >
              <ImageIcon size={13} /> + Inserir Imagem
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {showVariables && (
            <div className="flex flex-wrap items-center gap-1 text-[10px]">
              <span className="text-slate-400 font-bold hidden sm:inline">Variáveis:</span>
              {[
                { label: '+ {primeiro_nome}', tag: '{primeiro_nome}' },
                { label: '+ {nome}', tag: '{nome}' },
                { label: '+ {empresa}', tag: '{empresa}' },
                { label: '+ {cargo}', tag: '{cargo}' },
              ].map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => insertVar(v.tag)}
                  className="px-2 py-0.5 rounded-md bg-white text-growie-purple hover:bg-growie-purple hover:text-white font-mono font-bold transition-all border border-purple-200 shadow-2xs"
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Contenteditable Writing Area with Tight Normal Spacing */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{ minHeight, lineHeight: '1.4' }}
          className="p-3.5 focus:outline-none text-growie-dark text-xs leading-snug font-sans overflow-y-auto min-h-[140px] [&>p]:mb-2 [&>div]:mb-1"
        />
      </div>
    </div>
  );
};
