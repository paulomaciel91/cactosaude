
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    CactoStoreLogo,
    WhatsAppIcon,
    PhotoIcon,
    SiteSeguroIcon,
    StarIcon,
    CreditCardIcon,
    ChartBarIcon,
    RocketLaunchIcon,
    TruckIcon,
    UserGroupIcon,
    MapPinIcon,
    Bars3Icon,
    XMarkIcon,
    ComputerDesktopIcon,
    SwatchIcon,
    CurrencyDollarIcon,
    QrCodeIcon,
    ShoppingBagIcon,
    FunnelIcon,
    CheckIcon
} from '../components/icons';
import { LANDING_PAGE_CONFIG } from '../utils/landingPageConfig';

const FeaturesPage: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Navbar */}
            <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2">
                        {LANDING_PAGE_CONFIG.logoUrl ? (
                            <img
                                src={LANDING_PAGE_CONFIG.logoUrl}
                                alt={LANDING_PAGE_CONFIG.companyName}
                                className="h-10 w-auto object-contain"
                            />
                        ) : (
                            <CactoStoreLogo className="w-8 h-8 text-primary" />
                        )}
                        <span className="text-xl font-bold tracking-tight text-gray-900">{LANDING_PAGE_CONFIG.companyName}</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                        <Link to="/funcionalidades" className="text-primary font-bold transition-colors">Funcionalidades</Link>
                        <Link to="/planos" className="hover:text-primary transition-colors">Planos</Link>
                        <Link
                            to="/cactomodas"
                            className="hover:text-primary transition-colors"
                        >
                            Demonstração
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3 sm:gap-6">
                        <a
                            href="https://painel.cactoai.com.br/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:block text-sm font-semibold text-gray-700 hover:text-primary transition-colors"
                        >
                            Entrar
                        </a>
                        <Link
                            to="/planos"
                            className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-black transition-transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-gray-900/20"
                        >
                            <RocketLaunchIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Contratar Agora</span>
                            <span className="sm:hidden">Contratar</span>
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Menu principal"
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="w-6 h-6" />
                            ) : (
                                <Bars3Icon className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl p-4 flex flex-col gap-4 animate-fadeIn">
                        <Link
                            to="/"
                            className="text-gray-600 font-medium py-3 border-b border-gray-50 hover:text-primary transition-colors flex items-center justify-between"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Início
                        </Link>
                        <Link
                            to="/funcionalidades"
                            className="text-primary font-medium py-3 border-b border-gray-50 transition-colors flex items-center justify-between"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Funcionalidades
                        </Link>
                        <Link
                            to="/planos"
                            className="text-gray-600 font-medium py-3 border-b border-gray-50 hover:text-primary transition-colors flex items-center justify-between"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Planos
                        </Link>
                        <Link
                            to="/cactomodas"
                            className="text-gray-600 font-medium py-3 border-b border-gray-50 hover:text-primary transition-colors flex items-center justify-between"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Demonstração
                        </Link>
                        <a
                            href="https://painel.cactoai.com.br/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-bold py-3 hover:text-primary-dark transition-colors flex items-center justify-between"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Painel do Gerente
                        </a>
                    </div>
                )}
            </nav>

            {/* Header */}
            <header className="py-20 md:py-28 bg-gray-50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-40">
                    <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/20 rounded-full blur-3xl mix-blend-multiply"></div>
                    <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-200/40 rounded-full blur-3xl mix-blend-multiply"></div>
                </div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Potência do Painel. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Simplicidade da Loja.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Descubra todos os recursos que fazem da CactoVendas a plataforma favorita dos lojistas que querem crescer.
                        Do controle de estoque à entrega final.
                    </p>

                    {/* Highlights Grid (Blocos de Destaque) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-12">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow">
                            <ChartBarIcon className="w-8 h-8 text-primary mb-3" />
                            <h3 className="font-bold text-gray-900 mb-1">Controle Total</h3>
                            <p className="text-xs text-gray-500 text-center">Gestão de estoque e variações</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow">
                            <TruckIcon className="w-8 h-8 text-blue-600 mb-3" />
                            <h3 className="font-bold text-gray-900 mb-1">Logística Pro</h3>
                            <p className="text-xs text-gray-500 text-center">Cálculo de frete e gestão de motoboys</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow">
                            <RocketLaunchIcon className="w-8 h-8 text-orange-600 mb-3" />
                            <h3 className="font-bold text-gray-900 mb-1">Marketing</h3>
                            <p className="text-xs text-gray-500 text-center">Cupons e campanhas automáticas</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-md transition-shadow">
                            <SwatchIcon className="w-8 h-8 text-purple-600 mb-3" />
                            <h3 className="font-bold text-gray-900 mb-1">Identidade</h3>
                            <p className="text-xs text-gray-500 text-center">Sua marca, suas cores</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Features Sections */}
            <div className="py-20 bg-white space-y-32">
                <div className="container mx-auto px-4">

                    {/* 1. Gestão de Produtos e Estoque Inteligente */}
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                        <div className="lg:w-1/2 order-2 lg:order-1">
                            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                                {/* Abstract Inventory UI */}
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative z-10">
                                    <div className="border-b px-4 py-3 flex justify-between items-center bg-gray-50">
                                        <span className="font-bold text-sm text-gray-700">Editor de Produto</span>
                                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Salvo</span>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="space-y-1">
                                            <div className="h-2 w-1/4 bg-gray-200 rounded"></div>
                                            <div className="h-8 w-full bg-gray-100 rounded border border-gray-200"></div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-1/3 flex flex-col gap-2">
                                                <div className="h-20 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                                    <PhotoIcon className="w-6 h-6 text-gray-300" />
                                                </div>
                                                <div className="h-2 w-1/2 bg-gray-200 rounded mx-auto"></div>
                                            </div>
                                            <div className="w-2/3 space-y-3">
                                                <div className="h-2 w-1/3 bg-gray-200 rounded"></div>
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">P / Azul</span>
                                                    <span className="px-3 py-1 bg-gray-50 text-gray-500 text-xs rounded border border-gray-200">M / Azul</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-2">
                                                    <span className="text-xs text-red-500 font-medium">Estoque Crítico: 2 un</span>
                                                    <div className="w-8 h-4 bg-green-500 rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide mb-6">
                                <ChartBarIcon className="w-4 h-4" />
                                <span>Gestão Completa</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Cadastre, Controle e Venda Mais.</h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Chega de planilhas confusas. Tenha um cadastro profissional com variações complexas e controle de estoque que avisa você antes de acabar.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-4 items-start">
                                    <div className="bg-blue-100 p-2 rounded-lg mt-1"><PhotoIcon className="w-4 h-4 text-blue-600" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Variações Ilimitadas</h4>
                                        <p className="text-sm text-gray-600">Venda produtos complexos (ex: Camiseta P/M/G nas cores Azul/Vermelho) com estoque individual.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="bg-red-100 p-2 rounded-lg mt-1"><StarIcon className="w-4 h-4 text-red-600" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Alertas de Estoque</h4>
                                        <p className="text-sm text-gray-600">Nunca mais perca vendas. Receba alertas automáticos quando um produto atingir a quantidade mínima.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="bg-purple-100 p-2 rounded-lg mt-1"><PhotoIcon className="w-4 h-4 text-purple-600" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Galeria de Fotos</h4>
                                        <p className="text-sm text-gray-600">Vitrine rica com múltiplas fotos por produto e organização inteligente por categorias personalizáveis.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* NEW: Loja Virtual / Customer Experience Section */}
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 pt-20">
                        <div className="lg:w-1/2 order-2 lg:order-1">
                            <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
                                {/* Abstract Mobile Store UI */}
                                <div className="flex gap-4 justify-center">
                                    <div className="w-64 bg-white rounded-2xl overflow-hidden shadow-2xl border-4 border-gray-800 transform rotate-[-2deg] transition-transform hover:rotate-0">
                                        {/* Header */}
                                        <div className="bg-primary h-12 flex items-center justify-center">
                                            <div className="w-20 h-4 bg-white/20 rounded-full"></div>
                                        </div>
                                        {/* Banners */}
                                        <div className="h-24 bg-gray-100 m-2 rounded-lg"></div>
                                        {/* Categories */}
                                        <div className="flex gap-2 px-2 overflow-x-hidden">
                                            <div className="w-16 h-6 bg-gray-100 rounded-full flex-shrink-0"></div>
                                            <div className="w-16 h-6 bg-gray-100 rounded-full flex-shrink-0"></div>
                                            <div className="w-16 h-6 bg-gray-100 rounded-full flex-shrink-0"></div>
                                        </div>
                                        {/* Product Grid */}
                                        <div className="grid grid-cols-2 gap-2 p-2">
                                            <div className="aspect-square bg-gray-100 rounded-lg"></div>
                                            <div className="aspect-square bg-gray-100 rounded-lg"></div>
                                            <div className="aspect-square bg-gray-100 rounded-lg"></div>
                                            <div className="aspect-square bg-gray-100 rounded-lg"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-0 right-0 text-center">
                                    <span className="text-gray-500 text-xs font-mono">Mobile First Design</span>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-bold uppercase tracking-wide mb-6">
                                <ShoppingBagIcon className="w-4 h-4" />
                                <span>Loja Virtual Premium</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Uma experiência de compra incrível.</h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Não basta ter recursos, sua loja precisa ser linda e rápida. Entregue um site profissional que passa confiança e converte visitantes em clientes.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-4 items-start">
                                    <div className="bg-pink-100 p-2 rounded-lg mt-1"><RocketLaunchIcon className="w-4 h-4 text-pink-600" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Performance Extrema</h4>
                                        <p className="text-sm text-gray-600">Site ultra-rápido, otimizado para carregar instantaneamente no 4G e WiFi.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="bg-indigo-100 p-2 rounded-lg mt-1"><FunnelIcon className="w-4 h-4 text-indigo-600" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Filtros Inteligentes</h4>
                                        <p className="text-sm text-gray-600">Busca instantânea e filtros por preço, categoria e variações para o cliente achar o que quer.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="bg-teal-100 p-2 rounded-lg mt-1"><CheckIcon className="w-4 h-4 text-teal-600" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Design Limpo</h4>
                                        <p className="text-sm text-gray-600">Interface "clean" que valoriza seus produtos, sem poluição visual.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 2. Logística e Entregas Flexíveis */}
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 pt-20">
                        <div className="lg:w-1/2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wide mb-6">
                                <TruckIcon className="w-4 h-4" />
                                <span>Logística Avançada</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Entregas sem dor de cabeça.</h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Sistema avançado de cálculo de frete automática por distância ou região. Gerencie seus entregadores em tempo real.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-4 items-start">
                                    <div className="bg-green-100 p-2 rounded-lg mt-1"><MapPinIcon className="w-4 h-4 text-green-600" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Cálculo Automático (KM)</h4>
                                        <p className="text-sm text-gray-600">O sistema calcula a distância exata cliente-loja e cobra o valor por KM configurado. Ou use taxas fixas por bairro.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="bg-yellow-100 p-2 rounded-lg mt-1"><TruckIcon className="w-4 h-4 text-yellow-600" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Gestão de Motoboys</h4>
                                        <p className="text-sm text-gray-600">Cadastre entregadores, atribua pedidos e saiba exatamente quem está levando cada pacote.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="bg-blue-100 p-2 rounded-lg mt-1"><RocketLaunchIcon className="w-4 h-4 text-blue-600" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Rastreio em Tempo Real</h4>
                                        <p className="text-sm text-gray-600">Status transparente: Preparando {'>'} Em Rota {'>'} Entregue.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="lg:w-1/2">
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 relative">
                                {/* Map / Logistics Abstract UI */}
                                <div className="aspect-video bg-gray-100 rounded-lg relative overflow-hidden mb-4">
                                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                    {/* Route Line */}
                                    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100,200 Q250,150 400,100" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="8 4" className="animate-pulse" />
                                        <circle cx="100" cy="200" r="8" fill="#3b82f6" />
                                        <circle cx="400" cy="100" r="8" fill="#ef4444" />
                                    </svg>
                                    {/* Courier Label */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-full shadow-md text-xs font-bold flex items-center gap-1">
                                        <TruckIcon className="w-3 h-3 text-green-600" />
                                        <span>Entregador a 2km</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="font-bold text-gray-800">Pedido #9921</div>
                                    <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">Em Rota</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Marketing e Recuperação */}
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 pt-20">
                        <div className="lg:w-1/2 order-2 lg:order-1">
                            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 text-white relative shadow-2xl">
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <RocketLaunchIcon className="w-24 h-24" />
                                </div>
                                <h3 className="text-2xl font-bold mb-6">Painel de Campanhas</h3>
                                <div className="space-y-4">
                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-sm">Cupom: PRIMEIRACOMPRA</span>
                                            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">Ativo</span>
                                        </div>
                                        <div className="text-xs text-white/70">10% OFF • Primeiro Pedido</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-sm">Carrinhos Recuperados</span>
                                            <span className="text-xl font-bold">R$ 1.450,00</span>
                                        </div>
                                        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-green-400 h-full w-[70%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wide mb-6">
                                <RocketLaunchIcon className="w-4 h-4" />
                                <span>Marketing Automático</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Venda mais para quem já conhece você.</h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Ferramentas poderosas para fidelizar clientes. De cupons flexíveis a recuperação de carrinhos perdidos.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-4 items-start">
                                    <div className="bg-purple-100 p-2 rounded-lg mt-1"><StarIcon className="w-4 h-4 text-purple-600" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Motor de Promoções</h4>
                                        <p className="text-sm text-gray-600">Crie cupons (fixo ou %), ofertas automáticas, frete grátis e regras como "Valor Mínimo".</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="bg-green-100 p-2 rounded-lg mt-1"><WhatsAppIcon className="w-4 h-4 text-green-600" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Recuperação de Carrinho</h4>
                                        <p className="text-sm text-gray-600">Veja quem desistiu da compra e entre em contato para fechar a venda com um clique.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="bg-indigo-100 p-2 rounded-lg mt-1"><UserGroupIcon className="w-4 h-4 text-indigo-600" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">CRM WhatsApp (Pro)</h4>
                                        <p className="text-sm text-gray-600">Dispare novidades e ofertas para sua base de clientes diretamente.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* 4. PDV e Gestão de Pedidos */}
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-24 pt-20">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold uppercase tracking-wide mb-6">
                                <ComputerDesktopIcon className="w-4 h-4" />
                                <span>PDV Unificado</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Online e Balcão em um só lugar.</h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Unifique seu estoque físico e virtual. Lance vendas de balcão ou WhatsApp manualmente e acompanhe tudo num painel Kanban intuitivo.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-4 items-start">
                                    <div className="bg-orange-100 p-2 rounded-lg mt-1"><ComputerDesktopIcon className="w-4 h-4 text-orange-600" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Venda no Balcão</h4>
                                        <p className="text-sm text-gray-600">PDV ágil para lançar vendas manuais selecionando cliente e produtos rapidamente.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="bg-blue-100 p-2 rounded-lg mt-1"><ChartBarIcon className="w-4 h-4 text-blue-600" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Fluxo de Caixa</h4>
                                        <p className="text-sm text-gray-600">Controle pagamentos pendentes, confirmados e receitas totais do dia.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="bg-red-100 p-2 rounded-lg mt-1"><StarIcon className="w-4 h-4 text-red-600" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Notificações em Tempo Real</h4>
                                        <p className="text-sm text-gray-600">Alertas sonoros e notificações no WhatsApp sempre que cair um pedido novo.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 flex flex-col justify-center">
                            {/* Kanban Abstract UI */}
                            <div className="flex gap-4 mb-6 overflow-x-auto pb-4 custom-scrollbar">
                                <div className="min-w-[140px] bg-gray-800 rounded-lg p-3">
                                    <div className="text-xs font-bold text-gray-400 mb-2 uppercase">Novo</div>
                                    <div className="bg-gray-700 p-2 rounded mb-2 border-l-4 border-blue-500">
                                        <div className="h-2 w-12 bg-gray-600 rounded mb-1"></div>
                                        <div className="h-2 w-8 bg-gray-600 rounded"></div>
                                    </div>
                                    <div className="bg-gray-700 p-2 rounded mb-2 border-l-4 border-blue-500">
                                        <div className="h-2 w-12 bg-gray-600 rounded mb-1"></div>
                                    </div>
                                </div>
                                <div className="min-w-[140px] bg-gray-800 rounded-lg p-3">
                                    <div className="text-xs font-bold text-gray-400 mb-2 uppercase">Preparando</div>
                                    <div className="bg-gray-700 p-2 rounded mb-2 border-l-4 border-yellow-500">
                                        <div className="h-2 w-14 bg-gray-600 rounded mb-1"></div>
                                        <div className="h-2 w-10 bg-gray-600 rounded"></div>
                                    </div>
                                </div>
                                <div className="min-w-[140px] bg-gray-800 rounded-lg p-3">
                                    <div className="text-xs font-bold text-gray-400 mb-2 uppercase">Em Rota</div>
                                    <div className="bg-gray-700 p-2 rounded mb-2 border-l-4 border-purple-500">
                                        <div className="h-2 w-10 bg-gray-600 rounded mb-1"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-400 text-sm">Organização visual de pedidos (Kanban)</p>
                            </div>
                        </div>
                    </div>

                    {/* 5 e 6. Identidade e Pagamentos (Grid Layout) */}
                    <div className="grid md:grid-cols-2 gap-8 pt-20">
                        {/* Identidade Visual */}
                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-3xl border border-pink-100">
                            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 mb-6">
                                <SwatchIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Sua Loja, Sua Marca</h3>
                            <p className="text-gray-600 mb-6">
                                Personalização completa. Defina cores primárias/secundárias, logotipo e banners rotativos. Adicione seus links de Instagram e TikTok.
                            </p>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500 shadow-sm border-2 border-white ring-1 ring-gray-200"></div>
                                <div className="w-8 h-8 rounded-full bg-purple-500 shadow-sm border-2 border-white ring-1 ring-gray-200"></div>
                                <div className="w-8 h-8 rounded-full bg-green-500 shadow-sm border-2 border-white ring-1 ring-gray-200"></div>
                                <div className="w-8 h-8 rounded-full bg-gray-900 shadow-sm border-2 border-white ring-1 ring-gray-200"></div>
                            </div>
                        </div>

                        {/* Pagamentos */}
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-3xl border border-blue-100">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                                <CreditCardIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Pagamentos Integrados</h3>
                            <p className="text-gray-600 mb-6">
                                Integração nativa com <strong>Mercado Pago</strong> (Checkout Pro). O dinheiro cai direto na sua conta, sem intermediários.
                            </p>
                            <div className="flex gap-4 items-center">
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-blue-100">
                                    <QrCodeIcon className="w-5 h-5 text-teal-600" />
                                    <span className="font-bold text-gray-700 text-sm">PIX</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-blue-100">
                                    <CreditCardIcon className="w-5 h-5 text-blue-600" />
                                    <span className="font-bold text-gray-700 text-sm">Cartão</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer Call to Action */}
            <section className="py-20 bg-gray-900 text-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Sua loja profissional espera por você</h2>
                    <p className="text-gray-300 text-xl mb-10 max-w-2xl mx-auto">
                        Não perca mais tempo com ferramentas limitadas. Tenha o poder do CactoVendas agora.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/planos"
                            className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-primary-dark transition-all transform hover:scale-105 shadow-xl"
                        >
                            <RocketLaunchIcon className="w-5 h-5" />
                            Ver Planos e Preços
                        </Link>
                        <a
                            href="https://vendas.cactoai.com.br/#/cactomodas"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 font-bold py-4 px-10 rounded-full text-lg hover:bg-white/20 transition-all"
                        >
                            Ver Demonstração
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 py-12">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        {LANDING_PAGE_CONFIG.logoUrl ? (
                            <img
                                src={LANDING_PAGE_CONFIG.logoUrl}
                                alt={LANDING_PAGE_CONFIG.companyName}
                                className="h-8 w-auto grayscale opacity-50 hover:opacity-100 transition-opacity"
                            />
                        ) : (
                            <CactoStoreLogo className="w-6 h-6 text-gray-400" />
                        )}
                        <span className="text-lg font-bold text-gray-600">{LANDING_PAGE_CONFIG.companyName}</span>
                    </div>
                    <div className="flex flex-col md:items-end gap-2 text-sm text-gray-500 text-center md:text-right">
                        <div className="flex gap-4 justify-center md:justify-end mb-1">
                            <Link to="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link>
                            <Link to="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link>
                        </div>
                        <p>&copy; {new Date().getFullYear()} {LANDING_PAGE_CONFIG.companyName}. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FeaturesPage;
