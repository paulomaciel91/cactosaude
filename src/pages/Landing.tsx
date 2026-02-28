import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  CalendarCheck,
  ShieldCheck,
  Stethoscope,
  Users,
  Wallet,
  Sparkles,
  CheckCircle2,
  Menu,
  X
} from "lucide-react";
import cactoIcon from "@/assets/cacto-icon.png";

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden">
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img src={cactoIcon} alt="CactoSaude" className="h-9 w-9 object-contain" />
            <span className="text-xl font-bold tracking-tight">CactoSaude</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <button onClick={() => scrollTo("funcionalidades")} className="hover:text-primary transition-colors">Funcionalidades</button>
            <button onClick={() => scrollTo("planos")} className="hover:text-primary transition-colors">Planos</button>
            <button onClick={() => scrollTo("faq")} className="hover:text-primary transition-colors">FAQ</button>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden md:block text-sm font-semibold text-gray-700 hover:text-primary transition-colors">
              Entrar
            </Link>
            <button
              onClick={() => navigate("/assinatura")}
              className="hidden md:flex bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-black transition-all hover:scale-105"
            >
              Comecar Agora
            </button>
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white shadow-xl p-4 flex flex-col gap-3">
            <button onClick={() => scrollTo("funcionalidades")} className="text-gray-700 py-2 text-left">Funcionalidades</button>
            <button onClick={() => scrollTo("planos")} className="text-gray-700 py-2 text-left">Planos</button>
            <button onClick={() => scrollTo("faq")} className="text-gray-700 py-2 text-left">FAQ</button>
            <Link to="/login" className="text-primary font-bold py-2">Entrar</Link>
            <button
              onClick={() => navigate("/assinatura")}
              className="bg-gray-900 text-white font-bold py-3 px-4 rounded-xl"
            >
              Comecar Agora
            </button>
          </div>
        )}
      </nav>

      <header className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute -top-16 right-0 w-[30rem] h-[30rem] bg-emerald-100 rounded-full blur-3xl opacity-70" />
        <div className="absolute -bottom-20 left-0 w-[26rem] h-[26rem] bg-blue-100 rounded-full blur-3xl opacity-60" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wide mb-6 border border-emerald-100"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gestao de clinicas com IA e automacao</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 max-w-5xl mx-auto leading-[1.1]"
          >
            Sua clinica organizada,
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">agenda cheia e equipe alinhada</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Controle total de pacientes, agenda, equipe e financeiro em um unico painel. Simples para sua recepcao, poderoso para voce.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-md mx-auto sm:max-w-none"
          >
            <button
              onClick={() => navigate("/assinatura")}
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white text-lg font-bold rounded-xl hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3"
            >
              Criar minha clinica
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollTo("planos")}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              Ver planos
            </button>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-14">
            {[
              { icon: CalendarCheck, title: "Agenda Inteligente", desc: "Confirme e reagende em segundos" },
              { icon: Users, title: "Equipe Alinhada", desc: "Permissoes e perfis por funcao" },
              { icon: Wallet, title: "Financeiro Claro", desc: "Fluxo de caixa e recebimentos" },
              { icon: ShieldCheck, title: "Dados Seguros", desc: "Controle por clinica e auditoria" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-lg transition-all"
              >
                <div className="p-3 bg-emerald-50 rounded-full mb-3">
                  <item.icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-center">{item.title}</h3>
                <p className="text-xs text-gray-500 text-center">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </header>

      <section id="funcionalidades" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide border border-blue-100">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Operacao clinica completa</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Da recepcao ao consultorio, tudo integrado</h2>
            <p className="text-gray-600 text-lg">
              Cadastre pacientes, organize prontuarios, controle convênios, mantenha sua equipe sincronizada e acompanhe indicadores.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Agenda compartilhada por profissionais",
                "Cadastro rapido de pacientes",
                "Controle de bloqueios e horarios",
                "Relatorios de atendimento"
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-8 rounded-3xl border border-emerald-100">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: CalendarCheck, title: "Agenda", desc: "Agendamentos e retornos" },
                { icon: Users, title: "Equipe", desc: "Perfis por funcao" },
                { icon: Wallet, title: "Financeiro", desc: "Pagamentos e fluxo" },
                { icon: ShieldCheck, title: "Seguranca", desc: "RLS e auditoria" }
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <item.icon className="w-6 h-6 text-emerald-600 mb-2" />
                  <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="planos" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Planos para cada fase da sua clinica</h2>
            <p className="text-gray-400 text-lg">Comece enxuto e evolua sem trocar de sistema.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-emerald-500 transition-all duration-300 hover:-translate-y-1">
              <h3 className="text-2xl font-bold mb-2">Clinica Start</h3>
              <p className="text-gray-400 mb-6 text-sm">Ideal para clinicas em inicio de operacao.</p>
              <div className="mb-8">
                <span className="text-5xl font-bold">R$ 147</span>
                <span className="text-gray-500 font-medium">/mes</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-gray-300">
                {[
                  "Agenda e pacientes ilimitados",
                  "Equipe com permissoes basicas",
                  "Dashboard com indicadores principais",
                  "Suporte por chat"
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/assinatura?plano=start")}
                className="w-full py-4 rounded-xl font-bold bg-gray-700 hover:bg-gray-600 transition-all"
              >
                Selecionar Start
              </button>
            </div>

            <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-8 border-2 border-emerald-500 relative shadow-2xl">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                MAIS POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Clinica Pro</h3>
              <p className="text-gray-400 mb-6 text-sm">Perfeito para clinicas com maior volume.</p>
              <div className="mb-8">
                <span className="text-5xl font-bold">R$ 247</span>
                <span className="text-gray-500 font-medium">/mes</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-white">
                {[
                  "Tudo do Start",
                  "Relatorios avancados",
                  "Fluxo de caixa e recebimentos",
                  "Suporte prioritario"
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/assinatura?plano=pro")}
                className="w-full py-4 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 transition-all shadow-lg"
              >
                Selecionar Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">Perguntas frequentes</h2>
          <div className="space-y-4">
            {[
              { q: "Posso testar antes?", a: "Sim. Voce pode criar sua conta e explorar o sistema antes de escolher o plano definitivo." },
              { q: "Consigo migrar pacientes depois?", a: "Sim. Importamos seus dados com apoio da nossa equipe." },
              { q: "Posso mudar de plano?", a: "Pode. O upgrade ou downgrade e imediato e sem burocracia." }
            ].map((item) => (
              <div key={item.q} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-900">{item.q}</h3>
                <p className="text-gray-600 mt-2">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-50 border-t border-gray-200 py-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <img src={cactoIcon} alt="CactoSaude" className="h-7 w-7 object-contain opacity-70" />
            <span className="font-semibold">CactoSaude</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-primary">Entrar</Link>
            <Link to="/assinatura" className="hover:text-primary">Assinatura</Link>
          </div>
          <div>© {new Date().getFullYear()} CactoSaude. Todos os direitos reservados.</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
