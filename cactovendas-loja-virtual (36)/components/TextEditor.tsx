
import React, { useState } from 'react';
import { ArrowRight, Eraser, Copy, Check, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const TextEditor: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [formattedText, setFormattedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFormat = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      // Funcionalidade desativada
      await new Promise(resolve => setTimeout(resolve, 500));
      setFormattedText("A formatação automática via IA foi desativada neste ambiente.");
    } catch (error) {
      console.error(error);
      setFormattedText("Erro ao formatar o texto.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (formattedText) {
      navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearAll = () => {
    setInputText('');
    setFormattedText('');
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-200px)] min-h-[600px] flex flex-col animate-fade-in-up">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
           <Sparkles className="text-primary" size={24} />
           Editor Instantâneo
        </h2>
        <div className="flex gap-2">
            <button 
                onClick={clearAll}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
                <Eraser size={16} /> Limpar
            </button>
            <button
                onClick={handleFormat}
                disabled={isLoading || !inputText.trim()}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium text-white transition-all shadow-sm
                    ${isLoading || !inputText.trim() 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-primary hover:bg-blue-800'}`}
            >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                Formatar ABNT
            </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Input Column */}
        <div className="flex flex-col h-full">
            <div className="bg-gray-100 text-gray-500 text-xs uppercase font-bold px-4 py-2 rounded-t-lg border border-b-0 border-gray-300">
                Texto Original
            </div>
            <textarea
                className="flex-1 w-full p-6 resize-none border border-gray-300 rounded-b-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-sans text-gray-700 leading-relaxed shadow-inner"
                placeholder="Cole seu texto aqui..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
            />
        </div>

        {/* Output Column */}
        <div className="flex flex-col h-full relative group">
             <div className="bg-blue-50 text-blue-700 text-xs uppercase font-bold px-4 py-2 rounded-t-lg border border-b-0 border-blue-100 flex justify-between items-center">
                <span>Resultado ABNT</span>
                {formattedText && (
                    <button 
                        onClick={handleCopy}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Copiar resultado"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                )}
            </div>
            <div className="flex-1 w-full bg-white border border-gray-200 rounded-b-lg shadow-sm overflow-hidden relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                        <Loader2 size={40} className="text-primary animate-spin mb-3" />
                        <p className="text-gray-500 font-medium">Processando...</p>
                    </div>
                ) : formattedText ? (
                    <div className="h-full overflow-y-auto p-8 prose prose-slate max-w-none font-serif text-justify leading-relaxed">
                        <style>{`
                            .abnt-preview p { text-indent: 1.25cm; margin-bottom: 1rem; }
                            .abnt-preview h1, .abnt-preview h2, .abnt-preview h3 { color: #000; }
                        `}</style>
                        <div className="abnt-preview">
                            <ReactMarkdown>{formattedText}</ReactMarkdown>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 p-8 text-center border-dashed border-2 border-gray-100 m-4 rounded-lg">
                        <p>O texto processado aparecerá aqui.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
    