
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckIcon, HomeIcon, WhatsAppIcon, RocketLaunchIcon } from '../components/icons';

const ThankYouPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-gray-100 animate-scaleIn relative overflow-hidden">
        
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-primary"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

        {/* Success Icon */}
        <div className="relative mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner z-10 relative">
                <CheckIcon className="w-12 h-12 text-green-600" strokeWidth={2.5} />
            </div>
            {/* Confetti-ish dots */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 z-0">
                <div className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <div className="absolute top-4 right-0 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75"></div>
                <div className="absolute bottom-4 left-0 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                <div className="absolute bottom-2 right-4 w-2 h-2 bg-red-400 rounded-full animate-pulse delay-300"></div>
            </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Assinatura Confirmada!
        </h1>

        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Obrigado por confiar no <strong>CactoVendas</strong>. <br/>
          Seu pagamento foi recebido e sua loja está sendo preparada para decolar! 🚀
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <RocketLaunchIcon className="w-5 h-5 text-primary" />
            O que acontece agora?
          </h3>
          <ul className="text-sm text-gray-600 space-y-3">
            <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Você receberá seus dados de acesso ao Painel do Gerente via WhatsApp.</span>
            </li>
            <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Nossa equipe entrará em contato para dar as boas-vindas.</span>
            </li>
            <li className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>Sua loja estará online em instantes.</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="w-full inline-flex justify-center items-center gap-2 bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all transform hover:-translate-y-1 shadow-lg shadow-gray-900/10"
          >
            <HomeIcon className="w-5 h-5" />
            Voltar para o Início
          </Link>

          <a
            href="https://wa.me/5583988371737"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex justify-center items-center gap-2 text-gray-500 hover:text-primary font-medium py-2 transition-colors"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Falar com Suporte
          </a>
        </div>
      </div>
      <p className="mt-8 text-gray-400 text-sm">
        CactoVendas © {new Date().getFullYear()}
      </p>
    </div>
  );
};

export default ThankYouPage;
