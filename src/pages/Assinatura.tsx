import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle2,
  Lock,
  ArrowLeft,
  CreditCard,
  QrCode
} from "lucide-react";
import cactoIcon from "@/assets/cacto-icon.png";

type BillingType = "PIX" | "CREDIT_CARD";

const plans = {
  start: {
    id: "start",
    name: "Clinica Start",
    priceDisplay: "R$ 147,00",
    period: "mensal",
    features: [
      "Agenda e pacientes ilimitados",
      "Equipe com permissoes basicas",
      "Dashboard principal",
      "Suporte por chat"
    ]
  },
  pro: {
    id: "pro",
    name: "Clinica Pro",
    priceDisplay: "R$ 247,00",
    period: "mensal",
    features: [
      "Tudo do Start",
      "Relatorios avancados",
      "Fluxo de caixa e recebimentos",
      "Suporte prioritario"
    ]
  }
};

const Assinatura = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState<"start" | "pro">("pro");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    document: "",
    email: "",
    phone: "",
    clinicName: "",
    cnpj: "",
    password: "",
    billingType: "PIX" as BillingType
  });

  useEffect(() => {
    const planParam = searchParams.get("plano");
    if (planParam === "start" || planParam === "pro") {
      setSelectedPlanId(planParam);
    }
  }, [searchParams]);

  const selectedPlan = plans[selectedPlanId];

  const handlePhoneChange = (value: string) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    else if (v.length > 5) v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
    else if (v.length > 0) v = v.replace(/^(\d{0,2})/, "($1");
    setFormData(prev => ({ ...prev, phone: v }));
  };

  const handleDocumentChange = (value: string) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 14) v = v.slice(0, 14);
    if (v.length <= 11) {
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d)/, "$1.$2");
      v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      v = v.replace(/^(\d{2})(\d)/, "$1.$2");
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
      v = v.replace(/(\d{4})(\d)/, "$1-$2");
    }
    setFormData(prev => ({ ...prev, document: v }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
            clinic_name: formData.clinicName,
            clinic_cnpj: formData.cnpj,
            plan: selectedPlan.id,
            billing_type: formData.billingType
          }
        }
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (data.user) {
        setSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cadastro concluido</h1>
          <p className="text-lg text-gray-600 mb-6">
            Verifique seu e-mail para confirmar o acesso. Assim que confirmar, sua clinica estara pronta.
          </p>
          <Link to="/login" className="text-primary font-bold hover:underline">Ir para o login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      <nav className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Voltar</span>
          </Link>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Ambiente Seguro</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col items-center mb-10">
          <img src={cactoIcon} alt="CactoSaude" className="h-10 w-10 mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Finalizar Assinatura</h1>
          <p className="text-gray-500 text-center">Preencha seus dados para criar sua clinica.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">1</div>
                <h2 className="text-lg font-bold text-gray-800">Dados do responsavel</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF ou CNPJ</label>
                  <input
                    required
                    type="text"
                    value={formData.document}
                    onChange={(e) => handleDocumentChange(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha de acesso</label>
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Minimo 6 caracteres"
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">2</div>
                <h2 className="text-lg font-bold text-gray-800">Dados da clinica</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da clinica</label>
                  <input
                    required
                    type="text"
                    value={formData.clinicName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clinicName: e.target.value }))}
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Ex: Clinica Santa Maria"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ da clinica</label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="bg-emerald-100 w-8 h-8 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">3</div>
                <h2 className="text-lg font-bold text-gray-800">Pagamento</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, billingType: "PIX" }))}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all h-24 ${
                    formData.billingType === "PIX"
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <QrCode className="w-6 h-6" />
                  <span className="font-bold text-sm">PIX</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, billingType: "CREDIT_CARD" }))}
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all h-24 ${
                    formData.billingType === "CREDIT_CARD"
                      ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="font-bold text-sm">Cartao</span>
                </button>
              </div>
              <p className="text-xs text-center text-gray-400 mt-4">Ambiente 100% seguro. Seus dados sao criptografados.</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Resumo do plano</h3>
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-gray-100">
                <div>
                  <p className="font-bold text-gray-800">{selectedPlan.name}</p>
                  <p className="text-sm text-gray-500">Cobranca {selectedPlan.period}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{selectedPlan.priceDisplay}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {selectedPlan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mb-6 pt-2">
                <span className="text-lg font-bold text-gray-900">Total hoje</span>
                <span className="text-2xl font-extrabold text-primary">{selectedPlan.priceDisplay}</span>
              </div>

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
                    Li e concordo com os termos de uso e contrato de assinatura do CactoSaude.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !termsAccepted}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Processando..." : "Confirmar assinatura"}
              </button>

              <div className="mt-6 text-center text-xs text-gray-400">
                Garantia de 7 dias ou seu dinheiro de volta.
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Assinatura;
