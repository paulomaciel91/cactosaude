import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/icons';

const ContratoAssinaturaPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center text-primary font-medium hover:underline">
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Voltar para o início
                    </Link>
                </div>

                <h1 className="text-4xl font-bold mb-8 text-gray-900">Contrato de Assinatura</h1>

                <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                    <p className="lead">
                        Este Contrato de Assinatura ("Contrato") estabelece os termos legais que regem a assinatura dos serviços da
                        plataforma <strong>CactoVendas</strong>.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">1. Objeto</h3>
                    <p>
                        O presente contrato tem por objeto o licenciamento de uso de software (SaaS) da plataforma CactoVendas
                        para criação e gestão de loja virtual.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">2. Vigência e Renovação</h3>
                    <p>
                        A assinatura é mensal e renovada automaticamente a cada período de 30 dias, mediante pagamento.
                        Não há fidelidade mínima, podendo o cancelamento ser solicitado a qualquer momento antes da próxima renovação.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">3. Valores e Reajustes</h3>
                    <p>
                        O valor da mensalidade é definido no momento da contratação (Plano Start ou Plano Pro).
                        O CactoVendas se reserva o direito de reajustar os valores anualmente, mediante aviso prévio de 30 dias.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">4. Pagamento</h3>
                    <p>
                        Os pagamentos devem ser realizados via cartão de crédito ou PIX conforme selecionado no checkout.
                        O atraso superior a 5 dias poderá acarretar na suspensão temporária do acesso à plataforma.
                        O atraso superior a 30 dias poderá resultar no cancelamento da conta e exclusão dos dados.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">5. Cancelamento e Reembolso</h3>
                    <p>
                        <strong>Garantia de 7 dias:</strong> Conforme o Código de Defesa do Consumidor, você tem o direito de se arrepender
                        da contratação em até 7 dias corridos após a assinatura inicial, recebendo o reembolso integral do valor pago.
                        Após este período, o cancelamento interromperá cobranças futuras, mas não haverá reembolso proporcional do mês vigente.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">6. Suporte Técnico</h3>
                    <p>
                        O suporte técnico é oferecido via WhatsApp e E-mail em horário comercial (09h às 18h, dias úteis).
                        O tempo de resposta pode variar conforme a demanda, mas nos esforçamos para responder em até 4 horas úteis.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">7. Proteção de Dados</h3>
                    <p>
                        Ambas as partes se comprometem a cumprir a Lei Geral de Proteção de Dados (LGPD).
                        O CactoVendas atua como operador dos dados de seus clientes finais, garantindo segurança e sigilo.
                    </p>

                    <div className="pt-8 border-t border-gray-200 mt-12">
                        <p className="text-sm text-gray-500">Documento registrado em: Fevereiro de 2026</p>
                        <button className="mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors" onClick={() => window.print()}>
                            Imprimir Contrato
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContratoAssinaturaPage;