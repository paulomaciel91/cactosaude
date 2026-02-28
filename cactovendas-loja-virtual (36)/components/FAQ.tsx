
import React, { useState } from 'react';
import { ChevronDownIcon } from './icons';

const faqs = [
  {
    question: "Preciso de conhecimentos técnicos para criar minha loja?",
    answer: "Não! A CactoVendas foi desenhada para ser extremamente intuitiva. Você consegue configurar sua loja, adicionar produtos e começar a vender em poucos minutos, sem precisar escrever uma linha de código."
  },
  {
    question: "Como funcionam os pagamentos das minhas vendas?",
    answer: "Nós integramos nativamente com o Mercado Pago. O dinheiro das suas vendas cai direto na sua conta do Mercado Pago, sem intermediários e com total segurança."
  },
  {
    question: "Posso usar meu próprio domínio?",
    answer: "No momento, sua loja terá um endereço exclusivo 'vendas.cactoai.com.br/sua-loja'. Estamos trabalhando na funcionalidade de domínio próprio para o futuro breve."
  },
  {
    question: "Existe fidelidade ou multa de cancelamento?",
    answer: "Nenhuma. Você pode cancelar sua assinatura a qualquer momento diretamente pelo painel ou entrando em contato com o suporte. Sem letras miúdas ou taxas surpresa."
  },
  {
    question: "O sistema cobra comissão sobre minhas vendas?",
    answer: "Não cobramos comissão sobre suas vendas. Você paga apenas a mensalidade fixa do plano escolhido e as taxas padrão do meio de pagamento (Mercado Pago)."
  },
  {
    question: "Consigo gerenciar minha loja pelo celular?",
    answer: "Sim! O painel administrativo é 100% responsivo, permitindo que você cadastre produtos, acompanhe pedidos e gerencie sua loja de qualquer lugar usando seu smartphone."
  }
];

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button
        className="flex justify-between items-center w-full py-5 text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-lg font-medium transition-colors duration-200 ${isOpen ? 'text-primary' : 'text-gray-800 dark:text-gray-200 group-hover:text-primary'}`}>
          {question}
        </span>
        <div className={`ml-4 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 ${isOpen ? 'bg-primary border-primary text-white rotate-180' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 group-hover:border-primary group-hover:text-primary'}`}>
             <ChevronDownIcon className="w-5 h-5" />
        </div>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed pr-12 text-base">
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  return (
    <section id="faq" className="py-20 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold tracking-wider mb-4">
             TIRA-DÚVIDAS
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Perguntas Frequentes</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Separamos as dúvidas mais comuns de nossos lojistas para te ajudar a decidir.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
        
        <div className="text-center mt-12 bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 max-w-xl mx-auto">
            <p className="text-gray-600 dark:text-gray-400 mb-2">Ainda tem dúvidas?</p>
            <a href="https://wa.me/5583988371737" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:text-primary-dark transition-colors inline-flex items-center gap-2">
                Fale com nosso suporte no WhatsApp
            </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
