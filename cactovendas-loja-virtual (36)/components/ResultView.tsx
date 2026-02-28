import React from 'react';
import { Download, FileText, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ProcessedDocument } from '../types';

interface ResultViewProps {
  document: ProcessedDocument;
  onDownloadPDF: () => void;
  onDownloadDOCX: () => void;
  reset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ document, onDownloadPDF, onDownloadDOCX, reset }) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      
      {/* Success Header */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Documento Formatado com Sucesso!</h3>
            <p className="text-sm text-gray-600">O arquivo <span className="font-medium">{document.fileName}</span> foi revisado nas normas ABNT.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onDownloadDOCX}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm transition-colors text-sm font-medium"
          >
            <Download size={16} />
            Baixar DOCX
          </button>
          <button 
            onClick={onDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm transition-colors text-sm font-medium"
          >
            <Download size={16} />
            Baixar PDF
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
          <h4 className="font-serif text-gray-700 font-semibold flex items-center gap-2">
            <FileText size={18} />
            Prévia do Conteúdo
          </h4>
          <span className="text-xs text-gray-500 uppercase tracking-wide">Formatação ABNT Aplicada</span>
        </div>
        <div className="p-8 max-h-[600px] overflow-y-auto prose prose-slate max-w-none font-serif leading-relaxed text-justify">
           {/* Custom styling for the markdown to mimic ABNT roughly in HTML */}
           <style>{`
             .abnt-preview h1 { font-size: 1.5rem; text-transform: uppercase; margin-bottom: 1.5rem; }
             .abnt-preview h2 { font-size: 1.25rem; margin-bottom: 1.25rem; }
             .abnt-preview p { text-indent: 1.25cm; margin-bottom: 1rem; line-height: 1.5; }
             .abnt-preview blockquote { border-left: 4px solid #e5e7eb; padding-left: 1rem; font-style: italic; font-size: 0.9em; }
           `}</style>
           <div className="abnt-preview">
            <ReactMarkdown>{document.formattedText}</ReactMarkdown>
           </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button 
            onClick={reset}
            className="text-gray-500 hover:text-primary underline text-sm transition-colors"
        >
            Processar outro documento
        </button>
      </div>
    </div>
  );
};

export default ResultView;