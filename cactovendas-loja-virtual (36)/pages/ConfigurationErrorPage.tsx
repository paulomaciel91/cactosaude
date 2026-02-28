
import React from 'react';

const ConfigurationErrorPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-red-50 flex flex-col justify-center items-center text-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl border-l-4 border-red-500">
        <h1 className="text-3xl font-extrabold text-red-600 mb-4">Erro de Configuração</h1>
        <p className="text-lg text-gray-700 mb-6">
          As credenciais do Supabase não foram configuradas corretamente.
        </p>
        <div className="text-left bg-gray-50 p-6 rounded-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Como resolver?</h2>
          <p className="text-gray-600 mb-4">
            Para que o catálogo funcione, você precisa adicionar suas credenciais do Supabase no seguinte arquivo do projeto:
          </p>
          <ul className="list-none space-y-2">
            <li><code className="bg-gray-200 text-gray-800 font-mono py-1 px-2 rounded-md">config.ts</code></li>
          </ul>
          <p className="text-gray-600 mt-4">
            Abra este arquivo e substitua os valores de placeholder pelas suas chaves reais, que você pode encontrar no painel do seu projeto no Supabase, em <span className="font-semibold">Project Settings &gt; API</span>.
          </p>
           <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm">
            <strong>Importante:</strong> Nunca envie o arquivo <code>config.ts</code> para um repositório público (como o GitHub) pois ele contém suas chaves secretas.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationErrorPage;
