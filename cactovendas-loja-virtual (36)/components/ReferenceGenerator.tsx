
import React, { useState } from 'react';
import { Book, Copy, Check, Loader2, ArrowRight, Eraser } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ReferenceGenerator: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setResult(null);
    setCopied(false);

    try {
      // Funcionalidade desativada
      await new Promise(resolve => setTimeout(resolve, 500));
      setResult("A geração automática de referências foi desativada.");
    } catch (error) {
      console.error(error);
      setResult("Erro ao gerar referência.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      const cleanText = result.replace(/\*\*/g, '');
      navigator.clipboard.writeText(cleanText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
    setCopied(false);
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md">
              <Book size={18} />
            </div>
            Gerador de Referências
          </div>
          <button 
            onClick={handleClear} 
            className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
            title="Limpar campos"
          >
            <Eraser size={14} /> Limpar
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleGenerate}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descreva a obra (Livro, Artigo, Site...)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: Livro 'Dom Casmurro' de Machado de Assis, Editora Garnier, 1899"
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all text-gray-700 placeholder-gray-400"
              disabled={loading}
            />
            
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all
                  ${!input.trim() || loading 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-primary hover:bg-blue-800 shadow-md hover:shadow-lg'}
                `}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    Gerar Referência
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          {result && (
            <div className="mt-8 pt-6 border-t border-gray-100 animate-fade-in">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Resultado
              </h4>
              
              <div className="relative group bg-gray-50 border border-gray-200 rounded-lg p-5 pr-12 transition-all hover:border-blue-200 hover:shadow-sm">
                <div className="prose prose-sm max-w-none text-gray-800 font-serif text-lg leading-relaxed">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
                
                <button
                  onClick={handleCopy}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-md transition-all"
                  title="Copiar texto"
                >
                  {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferenceGenerator;
    