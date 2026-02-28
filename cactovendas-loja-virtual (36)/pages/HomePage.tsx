
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { isSupabaseConfigured } from '../services/supabaseClient';
import {
    CactoStoreLogo,
    WhatsAppIcon,
    ShoppingCartIcon,
    SiteSeguroIcon,
    RocketLaunchIcon,
    StarIcon,
    Bars3Icon,
    XMarkIcon,
    ChartBarIcon,
    TruckIcon,
    SwatchIcon,
    PhotoIcon,
    MapPinIcon,
    UserGroupIcon,
    ComputerDesktopIcon,
    CreditCardIcon,
    QrCodeIcon,
    ShoppingBagIcon,
    FunnelIcon,
    CheckIcon,
    SunIcon,
    MoonIcon
} from '../components/icons';
import { useTheme } from '../contexts/ThemeContext';
import { LANDING_PAGE_CONFIG } from '../utils/landingPageConfig';
import ImageZoomModal from '../components/ImageZoomModal';
import FAQ from '../components/FAQ';

const HomePage: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const navigate = useNavigate();

    const scrollToSection = (id: string) => {
        setIsMobileMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handlePlanSelect = (planId: string) => {
        navigate(`/planos?selected=${planId}`);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 overflow-x-hidden transition-colors duration-300">
            {/* Navbar */}
            <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        {LANDING_PAGE_CONFIG.logoUrl ? (
                            <img
                                src={LANDING_PAGE_CONFIG.logoUrl}
                                alt={LANDING_PAGE_CONFIG.companyName}
                                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <CactoStoreLogo className="w-8 h-8 text-primary transition-transform duration-300 group-hover:rotate-12" />
                        )}
                        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{LANDING_PAGE_CONFIG.companyName}</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
                        <button onClick={() => scrollToSection('funcionalidades')} className="hover:text-primary transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">Funcionalidades</button>
                        <button onClick={() => scrollToSection('planos')} className="hover:text-primary transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">Planos</button>
                        <button onClick={() => scrollToSection('faq')} className="hover:text-primary transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">FAQ</button>
                        <Link
                            to="/cactomodas"
                            className="hover:text-primary transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                        >
                            Demonstração
                        </Link>
                    </div>

                    {/* Right Side: CTA & Mobile Button */}
                    <div className="flex items-center gap-3 sm:gap-6">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                            aria-label="Alternar tema"
                        >
                            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                        </button>

                        <a
                            href="https://painel.cactoai.com.br/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:block text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                        >
                            Entrar
                        </a>
                        <button
                            onClick={() => scrollToSection('planos')}
                            className="hidden md:flex bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-black transition-all hover:scale-105 hover:shadow-lg active:scale-95 items-center gap-2 shadow-gray-900/20"
                        >
                            <RocketLaunchIcon className="w-4 h-4 animate-pulse" />
                            <span>Começar Agora</span>
                        </button>

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
                    <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-xl p-4 flex flex-col gap-4 animate-fadeIn">
                        <button
                            onClick={() => scrollToSection('funcionalidades')}
                            className="text-gray-600 dark:text-gray-400 font-medium py-3 border-b border-gray-50 dark:border-gray-800 hover:text-primary transition-colors flex items-center justify-between text-left"
                        >
                            Funcionalidades
                        </button>
                        <button
                            onClick={() => scrollToSection('planos')}
                            className="text-gray-600 dark:text-gray-400 font-medium py-3 border-b border-gray-50 dark:border-gray-800 hover:text-primary transition-colors flex items-center justify-between text-left"
                        >
                            Planos
                        </button>
                        <button
                            onClick={() => scrollToSection('faq')}
                            className="text-gray-600 dark:text-gray-400 font-medium py-3 border-b border-gray-50 dark:border-gray-800 hover:text-primary transition-colors flex items-center justify-between text-left"
                        >
                            FAQ
                        </button>
                        <Link
                            to="/cactomodas"
                            className="text-gray-600 dark:text-gray-400 font-medium py-3 border-b border-gray-50 dark:border-gray-800 hover:text-primary transition-colors flex items-center justify-between"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Demonstração
                        </Link>

                        <a
                            href="https://painel.cactoai.com.br/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-bold py-3 hover:text-primary-dark transition-colors flex items-center justify-between border-t border-gray-100 dark:border-gray-800 mt-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Painel do Gerente
                        </a>

                        {/* Mobile 'Começar' Button */}
                        <button
                            onClick={() => scrollToSection('planos')}
                            className="bg-gray-900 dark:bg-primary text-white font-bold py-3 px-4 rounded-xl hover:bg-black dark:hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-lg mt-2"
                        >
                            <RocketLaunchIcon className="w-4 h-4" />
                            Começar Agora
                        </button>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <header className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        className="absolute top-20 left-10 w-96 h-96 bg-primary/20 dark:bg-primary/10 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl"
                    ></motion.div>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
                        className="absolute top-20 right-10 w-96 h-96 bg-emerald-200 dark:bg-emerald-900/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl"
                    ></motion.div>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                        className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-100/30 dark:bg-blue-900/10 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl"
                    ></motion.div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wide mb-6 border border-green-100 dark:border-green-900/30 shadow-sm transition-transform hover:scale-105 cursor-default"
                    >
                        <StarIcon className="w-3.5 h-3.5 fill-current text-green-500" />
                        <span>Plataforma completa com IA e Automação</span>
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 max-w-5xl mx-auto leading-[1.1]"
                    >
                        Sua Loja Virtual <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Profissional e Inteligente</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                    >
                        Venda pelo WhatsApp com IA, aceite pagamentos online e gerencie tudo em um só lugar. Simples, rápido e poderoso.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-md mx-auto sm:max-w-none mb-16"
                    >
                        <motion.a
                            href="https://vendas.cactoai.com.br/#/cactomodas"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-primary-dark transition-all transform shadow-xl shadow-primary/25 flex items-center justify-center gap-3 hover:shadow-2xl"
                            whileHover={{ scale: 1.05, y: -4 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>Ver Loja de Exemplo</span>
                            <ShoppingCartIcon className="w-5 h-5 opacity-80" />
                        </motion.a>
                        <motion.button
                            onClick={() => scrollToSection('planos')}
                            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 text-lg font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all shadow-sm hover:shadow-md text-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Ver Planos
                        </motion.button>
                    </motion.div>

                    {/* Highlights Grid (Blocos de Destaque) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                        {[
                            { icon: ChartBarIcon, title: "Controle Total", desc: "Gestão de estoque e variações", color: "green" },
                            { icon: TruckIcon, title: "Logística Pro", desc: "Cálculo de frete e gestão de motoboys", color: "blue" },
                            { icon: RocketLaunchIcon, title: "Marketing", desc: "Cupons e campanhas automáticas", color: "orange" },
                            { icon: SwatchIcon, title: "Identidade", desc: "Sua marca, suas cores", color: "purple" }
                        ].map((item, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.1 * index }}
                                className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center hover:shadow-lg transition-all duration-300 group"
                                whileHover={{ y: -8 }}
                            >
                                <div className={`p-3 bg-${item.color}-50 dark:bg-${item.color}-900/20 rounded-full mb-3 group-hover:bg-${item.color}-100 dark:group-hover:bg-${item.color}-900/40 transition-colors`}>
                                    <item.icon className={`w-8 h-8 text-${item.color}-600 dark:text-${item.color}-400 flex-shrink-0`} />
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Features Sections */}
            <div id="funcionalidades" className="py-20 bg-white dark:bg-gray-950 space-y-32 transition-colors duration-300">
                <div className="container mx-auto px-4">

                    {/* 1. Gestão de Produtos e Estoque Inteligente */}
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="lg:w-1/2 order-2 lg:order-2"
                        >
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-800 relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                <img 
                                    src={LANDING_PAGE_CONFIG.screenshots.inventory} 
                                    alt="Interface de gestão de estoque" 
                                    className="w-full h-auto rounded-lg object-cover cursor-zoom-in transition-transform duration-700 group-hover:scale-105"
                                    onClick={() => setZoomedImage(LANDING_PAGE_CONFIG.screenshots.inventory)}
                                />
                            </div>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="lg:w-1/2 order-1 lg:order-1"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wide mb-6">
                                <ChartBarIcon className="w-4 h-4" />
                                <span>Gestão Completa</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">Cadastre, Controle e Venda Mais.</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                Chega de planilhas confusas. Tenha um cadastro profissional com variações complexas e controle de estoque que avisa você antes de acabar.
                            </p>
                            <ul className="space-y-6">
                                {[
                                    { icon: PhotoIcon, title: "Variações Ilimitadas", desc: "Venda produtos complexos (ex: Camiseta P/M/G nas cores Azul/Vermelho) com estoque individual.", color: "blue" },
                                    { icon: StarIcon, title: "Alertas de Estoque", desc: "Nunca mais perca vendas. Receba alertas automáticos quando um produto atingir a quantidade mínima.", color: "red" },
                                    { icon: PhotoIcon, title: "Galeria de Fotos", desc: "Vitrine rica com múltiplas fotos por produto e organização inteligente por categorias personalizáveis.", color: "purple" }
                                ].map((item, i) => (
                                    <motion.li 
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.4 + (i * 0.1) }}
                                        className="flex gap-4 items-start group"
                                    >
                                        <div className={`bg-${item.color}-100 dark:bg-${item.color}-900/30 p-2.5 rounded-xl mt-1 group-hover:scale-110 transition-transform duration-300`}>
                                            <item.icon className={`w-5 h-5 text-${item.color}-600 dark:text-${item.color}-400`} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{item.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>

                    {/* NEW: Loja Virtual / Customer Experience Section */}
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 pt-20">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="lg:w-1/2 order-2 lg:order-1 flex justify-center"
                        >
                            <div className="relative group">
                                <div className="absolute inset-0 bg-pink-500/20 dark:bg-pink-900/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                <img 
                                    src={LANDING_PAGE_CONFIG.screenshots.storeMobile} 
                                    alt="Loja virtual no mobile" 
                                    className="relative w-64 h-auto rounded-2xl shadow-2xl object-cover cursor-zoom-in transform rotate-[-2deg] transition-all duration-500 group-hover:rotate-0 group-hover:scale-105 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                                    onClick={() => setZoomedImage(LANDING_PAGE_CONFIG.screenshots.storeMobile)}
                                />
                            </div>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="lg:w-1/2 order-1 lg:order-2"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 text-xs font-bold uppercase tracking-wide mb-6">
                                <ShoppingBagIcon className="w-4 h-4" />
                                <span>Loja Virtual Premium</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">Uma experiência de compra incrível.</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                Não basta ter recursos, sua loja precisa ser linda e rápida. Entregue um site profissional que passa confiança e converte visitantes em clientes.
                            </p>
                            <ul className="space-y-6">
                                {[
                                    { icon: RocketLaunchIcon, title: "Performance Extrema", desc: "Site ultra-rápido, otimizado para carregar instantaneamente no 4G e WiFi.", color: "pink" },
                                    { icon: FunnelIcon, title: "Filtros Inteligentes", desc: "Busca instantânea e filtros por preço, categoria e variações para o cliente achar o que quer.", color: "indigo" },
                                    { icon: CheckIcon, title: "Design Limpo", desc: "Interface \"clean\" que valoriza seus produtos, sem poluição visual.", color: "teal" }
                                ].map((item, i) => (
                                    <motion.li 
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.4 + (i * 0.1) }}
                                        className="flex gap-4 items-start group"
                                    >
                                        <div className={`bg-${item.color}-100 dark:bg-${item.color}-900/30 p-2.5 rounded-xl mt-1 group-hover:scale-110 transition-transform duration-300`}>
                                            <item.icon className={`w-5 h-5 text-${item.color}-600 dark:text-${item.color}-400`} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{item.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>

                    {/* 2. Logística e Entregas Flexíveis */}
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 pt-20">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="lg:w-1/2"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wide mb-6">
                                <TruckIcon className="w-4 h-4" />
                                <span>Logística Avançada</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Entregas sem dor de cabeça.</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                Sistema avançado de cálculo de frete automática por distância ou região. Gerencie seus entregadores em tempo real.
                            </p>
                            <ul className="space-y-6">
                                {[
                                    { icon: MapPinIcon, title: "Cálculo Automático (KM)", desc: "O sistema calcula a distância exata cliente-loja e cobra o valor por KM configurado. Ou use taxas fixas por bairro.", color: "green" },
                                    { icon: TruckIcon, title: "Gestão de Motoboys", desc: "Cadastre entregadores, atribua pedidos e saiba exatamente quem está levando cada pacote.", color: "yellow" },
                                    { icon: RocketLaunchIcon, title: "Rastreio em Tempo Real", desc: "Status transparente: Preparando > Em Rota > Entregue.", color: "blue" }
                                ].map((item, i) => (
                                    <motion.li 
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.4 + (i * 0.1) }}
                                        className="flex gap-4 items-start group"
                                    >
                                        <div className={`bg-${item.color}-100 dark:bg-${item.color}-900/30 p-2.5 rounded-xl mt-1 group-hover:scale-110 transition-transform duration-300`}>
                                            <item.icon className={`w-5 h-5 text-${item.color}-600 dark:text-${item.color}-400`} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{item.title}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="lg:w-1/2"
                        >
                            <div className="bg-white dark:bg-gray-900 p-1 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                                <img 
                                    src={LANDING_PAGE_CONFIG.screenshots.logistics} 
                                    alt="Configuração de logística" 
                                    className="w-full h-auto rounded-lg object-cover cursor-zoom-in"
                                    onClick={() => setZoomedImage(LANDING_PAGE_CONFIG.screenshots.logistics)}
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* 3. Marketing e Recuperação */}
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 pt-20">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="lg:w-1/2 order-2 lg:order-1"
                        >
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-1 border border-gray-200 dark:border-gray-800 relative shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-2">
                                <img 
                                    src={LANDING_PAGE_CONFIG.screenshots.marketing} 
                                    alt="Painel de Marketing" 
                                    className="w-full h-auto rounded-lg object-cover cursor-zoom-in"
                                    onClick={() => setZoomedImage(LANDING_PAGE_CONFIG.screenshots.marketing)}
                                />
                            </div>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="lg:w-1/2 order-1 lg:order-2"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-xs font-bold uppercase tracking-wide mb-6">
                                <RocketLaunchIcon className="w-4 h-4" />
                                <span>Marketing Automático</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Venda mais para quem já conhece você.</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                Ferramentas poderosas para fidelizar clientes. De cupons flexíveis a recuperação de carrinhos perdidos.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-4 items-start">
                                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg mt-1"><StarIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Motor de Promoções</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Crie cupons (fixo ou %), ofertas automáticas, frete grátis e regras como "Valor Mínimo".</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mt-1"><WhatsAppIcon className="w-4 h-4 text-green-600 dark:text-green-400" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Recuperação de Carrinho</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Veja quem desistiu da compra e entre em contato para fechar a venda com um clique.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mt-1"><UserGroupIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">CRM WhatsApp (Pro)</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Dispare novidades e ofertas para sua base de clientes diretamente.</p>
                                    </div>
                                </li>
                            </ul>
                        </motion.div>
                    </div>

                    {/* 4. PDV e Gestão de Pedidos */}
                    <div className="grid md:grid-cols-2 gap-12 lg:gap-24 pt-20">
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs font-bold uppercase tracking-wide mb-6">
                                <ComputerDesktopIcon className="w-4 h-4" />
                                <span>PDV Unificado</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Online e Balcão em um só lugar.</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                Unifique seu estoque físico e virtual. Lance vendas de balcão ou WhatsApp manualmente e acompanhe tudo num painel de pedidos intuitivo.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex gap-4 items-start">
                                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg mt-1"><ComputerDesktopIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Venda no Balcão</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">PDV ágil para lançar vendas manuais selecionando cliente e produtos rapidamente.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mt-1"><ChartBarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Fluxo de Caixa</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Controle pagamentos pendentes, confirmados e receitas totais do dia.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4 items-start">
                                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg mt-1"><StarIcon className="w-4 h-4 text-red-600 dark:text-red-400" /></div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Notificações em Tempo Real</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Alertas sonoros e notificações no WhatsApp sempre que cair um pedido novo.</p>
                                    </div>
                                </li>
                            </ul>
                        </motion.div>
                        <motion.div 
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col justify-center"
                        >
                            <img 
                                src={LANDING_PAGE_CONFIG.screenshots.orders} 
                                alt="Lista de Pedidos" 
                                className="w-full h-auto rounded-xl shadow-2xl object-cover cursor-zoom-in transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-none dark:border dark:border-gray-800"
                                onClick={() => setZoomedImage(LANDING_PAGE_CONFIG.screenshots.orders)}
                            />
                        </motion.div>
                    </div>

                    {/* 5 e 6. Identidade e Pagamentos (Grid Layout) */}
                    <div className="grid md:grid-cols-2 gap-8 pt-20 pb-20">
                        {/* Identidade Visual */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10 p-8 rounded-3xl border border-pink-100 dark:border-pink-900/20 hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center text-pink-600 dark:text-pink-400 mb-6">
                                <SwatchIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sua Loja, Sua Marca</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Personalização completa. Defina cores primárias/secundárias, logotipo e banners rotativos. Adicione seus links de Instagram e TikTok.
                            </p>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500 shadow-sm border-2 border-white dark:border-gray-800 ring-1 ring-gray-200 dark:ring-gray-700"></div>
                                <div className="w-8 h-8 rounded-full bg-purple-500 shadow-sm border-2 border-white dark:border-gray-800 ring-1 ring-gray-200 dark:ring-gray-700"></div>
                                <div className="w-8 h-8 rounded-full bg-green-500 shadow-sm border-2 border-white dark:border-gray-800 ring-1 ring-gray-200 dark:ring-gray-700"></div>
                                <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-white shadow-sm border-2 border-white dark:border-gray-800 ring-1 ring-gray-200 dark:ring-gray-700"></div>
                            </div>
                        </motion.div>

                        {/* Pagamentos */}
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 p-8 rounded-3xl border border-blue-100 dark:border-blue-900/20 hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                                <CreditCardIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pagamentos Integrados</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Integração nativa com <strong>Mercado Pago</strong> (Checkout Pro). O dinheiro cai direto na sua conta, sem intermediários.
                            </p>
                            <div className="flex gap-4 items-center">
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm border border-blue-100 dark:border-blue-900/30">
                                    <QrCodeIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                    <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">PIX</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm border border-blue-100 dark:border-blue-900/30">
                                    <CreditCardIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">Cartão</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>

            {/* Plans Showcase Section */}
            <motion.section 
                id="planos" 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="py-20 bg-gray-900 text-white"
            >
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-3xl md:text-5xl font-bold mb-6"
                        >
                            Escolha o plano ideal
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-gray-400 text-xl"
                        >
                            Comece pequeno e cresça rápido. Cancele quando quiser.
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Start Plan */}
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-primary transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
                        >
                            <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-primary transition-colors">Plano Start</h3>
                            <p className="text-gray-400 mb-6 text-sm">Ideal para começar a vender online com profissionalismo.</p>
                            <div className="mb-8">
                                <span className="text-5xl font-bold text-white">R$ 147</span>
                                <span className="text-gray-500 font-medium">/mês</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {[
                                    { title: "Loja Virtual Completa", desc: "com personalização de cores e banners" },
                                    { title: "Gestão Inteligente", desc: "Estoque, variações e alertas automáticos" },
                                    { title: "Logística Básica", desc: "Taxa fixa por bairro e gestão de motoboys" },
                                    { title: "PDV Unificado", desc: "Venda no balcão e online no mesmo lugar" },
                                    { title: "Pagamentos", desc: "Mercado Pago integrado (Pix e Cartão)" }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                        <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                                        <span><strong>{item.title}</strong> {item.desc}</span>
                                    </li>
                                ))}
                            </ul>
                            <motion.button
                                onClick={() => handlePlanSelect('start')}
                                className="w-full py-4 rounded-xl font-bold bg-gray-700 text-white hover:bg-gray-600 transition-all border border-gray-600 hover:border-gray-500"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Selecionar Start
                            </motion.button>
                        </motion.div>

                        {/* Pro Plan */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-primary relative transform md:scale-105 shadow-2xl transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-4"
                        >
                            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                MAIS POPULAR
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-white">Plano Pro</h3>
                            <p className="text-gray-400 mb-6 text-sm">Venda automaticamente no WhatsApp 24h por dia com IA.</p>
                            <div className="mb-8">
                                <span className="text-5xl font-bold text-white">R$ 247</span>
                                <span className="text-gray-500 font-medium">/mês</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {[
                                    { title: "Tudo do Plano Start", desc: "" },
                                    { title: "Logística Avançada", desc: "Cálculo automático de frete por KM" },
                                    { title: "Recuperação de Carrinho", desc: "Converta vendas perdidas automaticamente" },
                                    { title: "Marketing no WhatsApp (CRM)", desc: "Dispare ofertas para seus clientes" },
                                    { title: "Agente de IA Completo", desc: "Atendimento automático 24h" },
                                    { title: "Promoções Avançadas", desc: "Regras de frete grátis e descontos" }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-white">
                                        <CheckIcon className="w-5 h-5 text-primary flex-shrink-0" />
                                        <span><strong>{item.title}</strong>{item.desc ? `: ${item.desc}` : ''}</span>
                                    </li>
                                ))}
                            </ul>
                            <motion.button
                                onClick={() => handlePlanSelect('pro')}
                                className="w-full py-4 rounded-xl font-bold bg-primary text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/25"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Selecionar Pro
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* FAQ Section */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <FAQ />
            </motion.div>

            {/* Demo Callout */}
            <motion.section 
                id="demo" 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="py-20 lg:py-28 bg-white dark:bg-gray-950 overflow-hidden border-t border-gray-100 dark:border-gray-800 transition-colors duration-300"
            >
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl flex flex-col lg:flex-row relative isolate overflow-hidden border border-gray-200 dark:border-gray-800">

                        <div className="p-8 md:p-12 lg:p-16 lg:w-1/2 flex flex-col justify-center relative z-10">
                            <div className="inline-block px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold tracking-wider mb-6 w-fit">
                                EXPERIMENTE AGORA
                            </div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                                Veja sua futura loja em ação
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed max-w-lg">
                                Criamos uma loja de demonstração completa para você sentir a experiência de compra fluida que seus clientes terão.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href="https://vendas.cactoai.com.br/#/cactomodas"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 bg-gray-900 dark:bg-primary text-white font-bold py-4 px-8 rounded-xl text-lg hover:bg-black dark:hover:bg-primary-dark transition-all transform hover:scale-105 shadow-lg active:scale-95"
                                >
                                    Acessar Demonstração
                                </a>
                            </div>

                            {!isSupabaseConfigured && (
                                <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-sm rounded-lg flex items-start gap-3">
                                    <div className="mt-0.5 text-yellow-600 dark:text-yellow-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold mb-1">Modo Desenvolvedor:</p>
                                        <p>Configure o Supabase no arquivo <code>config.ts</code> para ver os dados reais da loja.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="lg:w-1/2 bg-gray-100 dark:bg-gray-800 relative min-h-[300px] lg:min-h-0 flex items-center justify-center p-8 lg:p-0 overflow-hidden">
                            {/* Abstract Phone Mockup */}
                            <div className="relative w-64 md:w-72 bg-gray-900 rounded-[2.5rem] shadow-2xl border-[8px] border-gray-900 overflow-hidden transform lg:translate-y-12 lg:-translate-x-8 lg:rotate-[-6deg] transition-all duration-700 hover:rotate-0 hover:translate-y-4">
                                {/* Phone Content */}
                                <div className="bg-gray-800 h-[35rem] overflow-hidden relative rounded-[2rem]">
                                    {LANDING_PAGE_CONFIG.screenshots.storeMobile ? (
                                        <img
                                            src={LANDING_PAGE_CONFIG.screenshots.storeMobile}
                                            alt="Demonstração da loja no celular"
                                            className="w-full h-full object-cover cursor-zoom-in"
                                            onClick={() => setZoomedImage(LANDING_PAGE_CONFIG.screenshots.storeMobile)}
                                        />
                                    ) : (
                                        <div className="p-4 space-y-4 bg-white dark:bg-gray-900 h-full">
                                            <div className="flex gap-3 overflow-x-auto pb-2">
                                                <div className="w-16 h-16 rounded-full bg-primary/20 flex-shrink-0"></div>
                                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0"></div>
                                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0"></div>
                                            </div>
                                            <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl w-full"></div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                                                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Phone Bottom Bar */}
                                <div className="absolute bottom-2 left-0 right-0 h-1 bg-white mx-auto w-1/3 mb-2 rounded-full opacity-20"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>


            {/* Footer */}
            <footer className="bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 py-12 transition-colors duration-300">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        {LANDING_PAGE_CONFIG.logoUrl ? (
                            <img
                                src={LANDING_PAGE_CONFIG.logoUrl}
                                alt={LANDING_PAGE_CONFIG.companyName}
                                className="h-8 w-auto grayscale opacity-50 hover:opacity-100 dark:opacity-30 dark:hover:opacity-100 transition-all group-hover:scale-110"
                            />
                        ) : (
                            <CactoStoreLogo className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                        )}
                        <span className="text-lg font-bold text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{LANDING_PAGE_CONFIG.companyName}</span>
                    </div>
                    <div className="flex flex-col md:items-end gap-2 text-sm text-gray-500 dark:text-gray-400 text-center md:text-right">
                        <div className="flex gap-4 justify-center md:justify-end mb-1">
                            <a href="https://cactoai.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-medium">
                                Visite CactoAI
                            </a>
                            <Link to="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link>
                            <Link to="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link>
                        </div>
                        <p>&copy; {new Date().getFullYear()} {LANDING_PAGE_CONFIG.companyName}. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>

            {/* Image Zoom Modal */}
            {zoomedImage && (
                <ImageZoomModal
                    imageUrl={zoomedImage}
                    onClose={() => setZoomedImage(null)}
                />
            )}

            {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/5583988371737"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white rounded-full p-4 shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center group animate-bounce"
                aria-label="Fale conosco no WhatsApp"
            >
                <WhatsAppIcon className="w-8 h-8" />
            </a>
        </div>
    );
};

export default HomePage;
