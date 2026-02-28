
import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import supabaseService from '../services/supabaseService';
import { createSubscription } from '../services/paymentService';
import {
    CactoStoreLogo,
    CheckIcon,
    RocketLaunchIcon,
    CreditCardIcon,
    LockClosedIcon,
    ShieldCheckIcon,
    ArrowLeftIcon
} from '../components/icons';
import { LANDING_PAGE_CONFIG } from '../utils/landingPageConfig';

// Simple icons for payment methods
const PixIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg"><path d="M7.11 15.659L12 10.749l4.89 4.91 2.38-2.39-7.27-7.3-7.27 7.3 2.38 2.39z" fill="currentColor" /><path d="M12 18.069l-4.89-4.91-2.38 2.39 7.27 7.3 7.27-7.3-2.38-2.39L12 18.069z" fill="currentColor" /></svg>
);

interface Plan {
    id: string;
    name: string;
    price: number;
    priceDisplay: string;
    period: string;
    features: string[];
}

const plansData: Record<string, Plan> = {
    'start': {
        id: 'start',
        name: 'Plano Start',
        price: 147,
        priceDisplay: 'R$ 147,00',
        period: 'mensal',
        features: [
            'Loja Virtual Personalizável (Cores, Banners)',
            'Gestão de Estoque com Variações e Alertas',
            'Logística Básica (Taxa Fixa por Bairro)',
            'Gestão de Motoboys e Rotas',
            'PDV de Balcão Integrado',
            'Pagamentos via Mercado Pago (Pix/Cartão)',
            'Cupons de Desconto Básicos'
        ]
    },
    'pro': {
        id: 'pro',
        name: 'Plano Pro (Recomendado)',
        price: 247,
        priceDisplay: 'R$ 247,00',
        period: 'mensal',
        features: [
            'Tudo do Plano Start',
            'Logística Avançada (Cálculo Automático por KM)',
            'Recuperação de Carrinho Automática',
            'Campanhas de Marketing no WhatsApp (CRM)',
            'Agente de IA Completo 24h',
            'Motor de Promoções Avançado',
            'Notificações de Pedidos no WhatsApp Pessoal'
        ]
    }
};

type BillingType = 'PIX' | 'CREDIT_CARD';

const PlansPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [selectedPlanId, setSelectedPlanId] = useState<string>('pro');

    const [formData, setFormData] = useState({
        name: '',
        document: '', // CPF/CNPJ
        email: '',
        storeName: '',
        slug: '',
        phone: '',
        billingType: 'PIX' as BillingType
    });

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

    // Slug verification states
    const [slugError, setSlugError] = useState<string | null>(null);
    const [slugSuggestion, setSlugSuggestion] = useState<string | null>(null);
    const [isCheckingSlug, setIsCheckingSlug] = useState(false);

    useEffect(() => {
        const planParam = searchParams.get('selected');
        if (planParam && plansData[planParam]) {
            setSelectedPlanId(planParam);
        }
    }, [searchParams]);

    const selectedPlan = plansData[selectedPlanId] || plansData['pro'];

    // Debounce check for slug availability
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!formData.slug || formData.slug.length < 3) {
                setSlugError(null);
                setSlugSuggestion(null);
                return;
            }

            // Check for reserved words to prevent routing conflicts
            const reservedWords = ['planos', 'funcionalidades', 'termos', 'privacidade', 'contrato', 'obrigado', 'admin', 'login', 'loja'];
            if (reservedWords.includes(formData.slug.toLowerCase())) {
                setSlugError('Este endereço é reservado pelo sistema.');
                return;
            }

            setIsCheckingSlug(true);
            const isAvailable = await supabaseService.checkSlugAvailability(formData.slug);
            setIsCheckingSlug(false);

            if (!isAvailable) {
                setSlugError('Este endereço já está em uso.');
                const randomSuffix = Math.floor(100 + Math.random() * 900);
                setSlugSuggestion(`${formData.slug}-${randomSuffix}`);
            } else {
                setSlugError(null);
                setSlugSuggestion(null);
            }
        }, 800);

        return () => clearTimeout(timer);
    }, [formData.slug]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else if (value.length > 5) {
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2');
        } else if (value.length > 0) {
            value = value.replace(/^(\d{0,2})/, '($1');
        }

        setFormData(prev => ({ ...prev, phone: value }));
    };

    const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 14) value = value.slice(0, 14);

        if (value.length <= 11) {
            // CPF: 000.000.000-00
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        } else {
            // CNPJ: 00.000.000/0000-00
            value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
        }

        setFormData(prev => ({ ...prev, document: value }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'storeName') {
            const slug = value
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '_');

            setFormData(prev => ({ ...prev, storeName: value, slug }));
        } else if (name === 'slug') {
            const newValue = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
            setFormData(prev => ({ ...prev, [name]: newValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const applySuggestion = () => {
        if (slugSuggestion) {
            setFormData(prev => ({ ...prev, slug: slugSuggestion }));
            setSlugError(null);
            setSlugSuggestion(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!termsAccepted) {
            alert("Você precisa aceitar os Termos de Uso e Contrato.");
            return;
        }
        if (slugError || isCheckingSlug) {
            alert("Por favor, escolha um endereço de loja válido e único.");
            return;
        }

        setLoading(true);

        const payload = {
            plan: selectedPlan.id,
            name: formData.name,
            document: formData.document,
            email: formData.email,
            nome_loja: formData.storeName,
            slug: formData.slug,
            phone: formData.phone.replace(/\D/g, ''),
            billingType: formData.billingType
        };

        try {
            // Chamada segura via RPC do Supabase
            const data = await createSubscription(payload);

            if (data) {
                try {
                    // Tratamento de resposta flexível (array ou objeto) para pegar a URL de pagamento
                    let urlToRedirect = null;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const getUrl = (obj: any) => obj?.invoiceUrl || obj?.paymentLink;

                    if (Array.isArray(data) && data.length > 0) {
                        const firstItem = data[0];
                        if (firstItem.data && Array.isArray(firstItem.data) && firstItem.data.length > 0) {
                            urlToRedirect = getUrl(firstItem.data[0]);
                        } else {
                            urlToRedirect = getUrl(firstItem);
                        }
                    } else if (data && typeof data === 'object') {
                        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                            urlToRedirect = getUrl(data.data[0]);
                        } else {
                            urlToRedirect = getUrl(data);
                        }
                    }
                    if (urlToRedirect) setPaymentUrl(urlToRedirect);
                } catch (error) {
                    console.error("Erro ao processar resposta da assinatura:", error);
                }
                setSuccess(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert('Ocorreu um erro ao processar sua solicitação. Tente novamente.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Erro de conexão. Verifique sua internet.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col items-center justify-center p-4">
                <div className="text-center max-w-lg">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckIcon className="w-10 h-10 text-green-600" />
                    </div>

                    {paymentUrl ? (
                        <>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quase lá!</h1>
                            <p className="text-lg text-gray-600 mb-8">
                                Sua conta foi criada. Para ativar sua loja, realize o pagamento da primeira mensalidade.
                            </p>
                            <a
                                href={paymentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-primary text-white font-bold py-4 px-10 rounded-full hover:bg-primary-dark transition-colors mb-6 shadow-xl text-lg animate-pulse"
                            >
                                Pagar Agora
                            </a>
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Solicitação Realizada!</h1>
                            <p className="text-lg text-gray-600 mb-4">
                                Sua solicitação foi enviada com sucesso.
                            </p>
                            <p className="text-gray-500 mb-8">
                                Aguarde nosso contato no email <strong>{formData.email}</strong> com as instruções de acesso.
                            </p>
                        </>
                    )}
                    <Link to="/" className="text-primary font-bold hover:underline">Voltar para o início</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
            {/* Checkout Navbar */}
            <nav className="bg-white border-b border-gray-200 py-4">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <ArrowLeftIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Voltar</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <LockClosedIcon className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Ambiente Seguro</span>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="flex flex-col items-center mb-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Finalizar Contratação</h1>
                    <p className="text-gray-500 text-center">Preencha seus dados para criar sua loja agora mesmo.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

                    {/* Left Column: Form Fields */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Dados Pessoais */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                                <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">1</div>
                                <h2 className="text-lg font-bold text-gray-800">Dados do Responsável</h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                    <input
                                        required
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                        placeholder="Seu nome completo"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CPF ou CNPJ</label>
                                    <input
                                        required
                                        type="text"
                                        name="document"
                                        value={formData.document}
                                        onChange={handleDocumentChange}
                                        className="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                        placeholder="000.000.000-00 ou 00.000.000/0000-00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                                    <input
                                        required
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        className="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Dados da Loja */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                                <div className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">2</div>
                                <h2 className="text-lg font-bold text-gray-800">Dados da Loja</h2>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
                                    <input
                                        required
                                        type="text"
                                        name="storeName"
                                        value={formData.storeName}
                                        onChange={handleInputChange}
                                        className="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                        placeholder="Ex: Minha Loja Incrível"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link da Loja (Slug)</label>
                                    <div className="flex rounded-lg shadow-sm">
                                        <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-sm">
                                            vendas.cactoai.com.br/
                                        </span>
                                        <input
                                            required
                                            type="text"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleInputChange}
                                            className={`flex-1 block w-full px-4 py-3 rounded-none rounded-r-lg border bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all ${slugError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                                            placeholder="minha_loja"
                                        />
                                    </div>
                                    {isCheckingSlug && <p className="text-xs text-primary mt-1 animate-pulse">Verificando disponibilidade...</p>}
                                    {slugError && (
                                        <div className="mt-2 text-sm text-red-600">
                                            {slugError}
                                            {slugSuggestion && (
                                                <div className="mt-1 text-gray-600">
                                                    Sugestão: <button type="button" onClick={applySuggestion} className="text-primary font-bold hover:underline">{slugSuggestion}</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {!slugError && !isCheckingSlug && formData.slug.length > 3 && (
                                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                            <CheckIcon className="w-3 h-3" /> Endereço disponível
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3. Pagamento */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                                <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">3</div>
                                <h2 className="text-lg font-bold text-gray-800">Pagamento</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, billingType: 'PIX' }))}
                                    className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all h-24 ${formData.billingType === 'PIX'
                                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <PixIcon />
                                    <span className="font-bold text-sm">PIX</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, billingType: 'CREDIT_CARD' }))}
                                    className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all h-24 ${formData.billingType === 'CREDIT_CARD'
                                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <CreditCardIcon className="w-6 h-6" />
                                    <span className="font-bold text-sm">Cartão de Crédito</span>
                                </button>
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-4">
                                Ambiente 100% seguro. Seus dados são criptografados.
                            </p>
                        </div>

                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo do Pedido</h3>

                            <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                                <div>
                                    <p className="font-bold text-gray-800">{selectedPlan.name}</p>
                                    <p className="text-sm text-gray-500">Cobrança {selectedPlan.period}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{selectedPlan.priceDisplay}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                {selectedPlan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                        <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center mb-6 pt-2">
                                <span className="text-lg font-bold text-gray-900">Total Hoje</span>
                                <span className="text-2xl font-extrabold text-primary">{selectedPlan.priceDisplay}</span>
                            </div>

                            {/* Contract Checkbox */}
                            <div className="mb-6">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 shadow-sm transition-all checked:border-primary checked:bg-primary hover:border-primary"
                                        />
                                        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                                        Li e concordo com os <a href="#/termos" target="_blank" className="underline text-gray-900 hover:text-primary">Termos de Uso</a> e o <a href="#/contrato" target="_blank" className="underline text-gray-900 hover:text-primary">Contrato de Assinatura</a> da CactoVendas.
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !!slugError}
                                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <span>Confirmar e Pagar</span>
                                        <RocketLaunchIcon className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <div className="mt-6 flex justify-center items-center gap-2 text-xs text-gray-400">
                                <ShieldCheckIcon className="w-4 h-4" />
                                <span>Garantia de 7 dias ou seu dinheiro de volta.</span>
                            </div>

                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default PlansPage;
