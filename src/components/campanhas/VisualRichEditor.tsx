import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, Image as ImageIcon, Sparkles } from 'lucide-react';

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

  const insertImageSrc = (src: string) => {
    if (!src) return;
    const imgHtml = `<img src="${src}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; display: block; shadow: 0 2px 8px rgba(0,0,0,0.1);" alt="Imagem do E-mail" />`;

    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, imgHtml);
      handleInput();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64Data = event.target?.result as string;
              insertImageSrc(base64Data);
            };
            reader.readAsDataURL(file);
          }
          return;
        }
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        insertImageSrc(base64Data);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const insertVar = (varName: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, varName);
      handleInput();
    }
  };

  return (
    <div className="space-y-1.5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
          <span>{label}</span>
        </label>

        <span className="text-[10px] font-mono font-bold text-growie-purple bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
          <ImageIcon size={11} className="text-growie-purple" /> 📋 Copie e cole (Ctrl + V) qualquer imagem diretamente aqui!
        </span>
      </div>

      {/* Editor Container */}
      <div className={`bg-white border rounded-2xl overflow-hidden transition-all ${
        isFocused ? 'border-growie-purple ring-2 ring-growie-purple/20 shadow-md' : 'border-slate-200 shadow-card-soft'
      }`}>
        {/* Toolbar Header */}
        <div className="bg-growie-bg px-3 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
          <div className="flex items-center gap-1">
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

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-growie-purple/10 text-growie-purple font-extrabold hover:bg-growie-purple hover:text-white transition-colors flex items-center gap-1 border border-growie-purple/20 text-[11px]"
              title="Carregar Imagem de Arquivo"
            >
              <ImageIcon size={13} /> + Carregar Imagem
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

        {/* Contenteditable Writing Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{ minHeight }}
          className="p-3.5 focus:outline-none text-growie-dark text-xs leading-relaxed font-sans overflow-y-auto min-h-[140px]"
        />
      </div>
    </div>
  );
};
