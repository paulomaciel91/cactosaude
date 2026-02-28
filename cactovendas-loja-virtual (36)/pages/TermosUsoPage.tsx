import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/icons';

const TermosUsoPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center text-primary font-medium hover:underline">
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Voltar para o início
                    </Link>
                </div>

                <h1 className="text-4xl font-bold mb-8 text-gray-900">Termos de Uso</h1>

                <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                    <p>
                        Bem-vindo ao <strong>CactoVendas</strong>. Ao utilizar nossa plataforma, você concorda com os seguintes termos e condições.
                        Por favor, leia atentamente.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">1. Aceitação dos Termos</h3>
                    <p>
                        Ao criar uma conta ou utilizar os serviços do CactoVendas, você confirma que leu, entendeu e concorda em cumprir estes Termos de Uso.
                        Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">2. Descrição do Serviço</h3>
                    <p>
                        O CactoVendas fornece uma plataforma de e-commerce que permite aos usuários criar e gerenciar lojas virtuais,
                        processar pedidos e gerenciar produtos ("Serviço"). Nós nos reservamos o direito de modificar, suspender ou
                        descontinuar o Serviço a qualquer momento, com ou sem aviso prévio.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">3. Conta do Usuário</h3>
                    <p>
                        Para utilizar o Serviço, você deve criar uma conta fornecendo informações precisas e completas.
                        Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorrem em sua conta.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">4. Planos e Pagamentos</h3>
                    <p>
                        O uso continuado do serviço requer a assinatura de um plano pago (Start ou Pro).
                        O não pagamento das mensalidades pode resultar na suspensão ou cancelamento da sua loja.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">5. Uso Aceitável</h3>
                    <p>
                        Você concorda em não usar o Serviço para qualquer finalidade ilegal ou proibida por estes termos.
                        É estritamente proibida a venda de produtos ilícitos, falsificados ou que violem direitos de terceiros na plataforma CactoVendas.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">6. Limitação de Responsabilidade</h3>
                    <p>
                        O CactoVendas não se responsabiliza por lucros cessantes, perdas de dados, erros financeiros decorrentes de má configuração
                        da loja pelo usuário, ou interrupções de serviço fora de nosso controle razoável.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">7. Alterações nos Termos</h3>
                    <p>
                        Podemos revisar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação.
                        O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.
                    </p>

                    <div className="pt-8 border-t border-gray-200 mt-12">
                        <p className="text-sm text-gray-500">Última atualização: Fevereiro de 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermosUsoPage;