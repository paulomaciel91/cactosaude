
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/icons';

const PrivacidadePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center text-primary font-medium hover:underline">
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Voltar para o início
                    </Link>
                </div>

                <h1 className="text-4xl font-bold mb-8 text-gray-900">Política de Privacidade</h1>

                <div className="prose prose-lg text-gray-600 max-w-none space-y-6">
                    <p>
                        A sua privacidade é importante para nós. É política do <strong>CactoVendas</strong> respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site CactoVendas, e outros sites que possuímos e operamos.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">1. Informações que Coletamos</h3>
                    <p>
                        Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
                    </p>
                    <p>
                        Os tipos de dados coletados podem incluir: Nome, E-mail, Telefone, Endereço e Dados de Pagamento (processados de forma segura por gateways parceiros).
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">2. Uso das Informações</h3>
                    <p>
                        Utilizamos as informações coletadas para:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Operar e manter a sua loja virtual;</li>
                        <li>Processar transações e pedidos;</li>
                        <li>Melhorar a experiência do usuário em nossa plataforma;</li>
                        <li>Enviar comunicações importantes sobre sua conta ou atualizações do serviço.</li>
                    </ul>

                    <h3 className="text-2xl font-semibold text-gray-800">3. Retenção de Dados</h3>
                    <p>
                        Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">4. Compartilhamento de Dados</h3>
                    <p>
                        Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei ou para a prestação de serviços essenciais (ex: processamento de pagamentos e logística).
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">5. Cookies</h3>
                    <p>
                        O CactoVendas utiliza cookies para melhorar a funcionalidade e o desempenho do site. Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-800">6. Compromisso do Usuário</h3>
                    <p>
                        O usuário se compromete a fazer uso adequado dos conteúdos e da informação que o CactoVendas oferece no site e com caráter enunciativo, mas não limitativo:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Não se envolver em atividades que sejam ilegais ou contrárias à boa fé a à ordem pública;</li>
                        <li>Não difundir propaganda ou conteúdo de natureza racista, xenofóbica, ou azar, qualquer tipo de pornografia ilegal, de apologia ao terrorismo ou contra os direitos humanos;</li>
                        <li>Não causar danos aos sistemas físicos (hardwares) e lógicos (softwares) do CactoVendas, de seus fornecedores ou terceiros.</li>
                    </ul>

                    <div className="pt-8 border-t border-gray-200 mt-12">
                        <p className="text-sm text-gray-500">Esta política é efetiva a partir de Fevereiro de 2026.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacidadePage;
