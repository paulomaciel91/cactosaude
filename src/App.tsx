import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Header } from "@/components/Header";
import { AdminHeader } from "@/components/AdminHeader";
import { AdminProvider } from "@/contexts/AdminContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ChatWidget } from "@/components/ChatWidget";
import { ScrollToTop } from "@/components/ScrollToTop";
import Dashboard from "./pages/Dashboard";
import Agendamentos from "./pages/Agendamentos";
import AgendaProfissional from "./pages/AgendaProfissional";
import Agenda from "./pages/Agenda";
import Consulta from "./pages/Consulta";
import Pacientes from "./pages/Pacientes";
import CRM from "./pages/CRM";
import Convenios from "./pages/Convenios";
import Financeiro from "./pages/Financeiro";
import Pagamentos from "./pages/Pagamentos";
import Equipe from "./pages/Equipe";
import Estoque from "./pages/Estoque";
import Comunicacao from "./pages/Comunicacao";
import Relatorios from "./pages/Relatorios";
import Suporte from "./pages/Suporte";
import Configuracoes from "./pages/Configuracoes";
import PerfilUsuario from "./pages/PerfilUsuario";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import EsqueceuSenha from "./pages/EsqueceuSenha";
import Landing from "./pages/Landing";
import Assinatura from "./pages/Assinatura";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClinicas from "./pages/admin/AdminClinicas";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminAssinaturas from "./pages/admin/AdminAssinaturas";
import AdminRelatorios from "./pages/admin/AdminRelatorios";
import AdminPermissoes from "./pages/admin/AdminPermissoes";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";
import AdminSuporte from "./pages/admin/AdminSuporte";
import AdminEquipeCactoAI from "./pages/admin/AdminEquipeCactoAI";
import AdminPerfil from "./pages/admin/AdminPerfil";
import VideoCallJoin from "./pages/VideoCallJoin";
import TelemedicinaJoin from "./pages/TelemedicinaJoin";
import ConsultaFinalizada from "./pages/ConsultaFinalizada";
import NotFound from "./pages/NotFound";

import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

// Componente para condicionar renderização do ChatWidget
const ConditionalChatWidget = () => {
  const location = useLocation();

  // Não exibir ChatWidget nas rotas de telemedicina (tela do paciente)
  const hideChatRoutes = ['/telemedicina/', '/video/', '/consulta-finalizada'];
  const shouldHideChat = hideChatRoutes.some(route => location.pathname.startsWith(route));

  if (shouldHideChat) {
    return null;
  }
  return <ChatWidget />;
};

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const userRole = localStorage.getItem('CactoSaude_user_role');
  if (userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ChatProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Login/Cadastro Routes - No Sidebar */}
              <Route path="/" element={<Landing />} />
              <Route path="/assinatura" element={<Assinatura />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />

              {/* Public Video Call Route - No Sidebar */}
              <Route path="/video/:roomId" element={<VideoCallJoin />} />

              {/* Public Telemedicina Route - No Sidebar */}
              <Route path="/telemedicina/:roomId" element={<TelemedicinaJoin />} />

              {/* Public Consulta Finalizada Route - No Sidebar */}
              <Route path="/consulta-finalizada" element={<ConsultaFinalizada />} />

              {/* Admin Routes - Admin Sidebar (Independente do painel clínica) */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <AdminGuard>
                      <AdminProvider>
                        <SidebarProvider defaultOpen={false}>
                          <div className="flex min-h-screen w-full bg-background">
                            <AdminSidebar />
                            <div className="flex flex-1 flex-col">
                              <AdminHeader />
                              <Routes>
                                <Route path="/" element={<AdminDashboard />} />
                                <Route path="/clinicas" element={<AdminClinicas />} />
                                <Route path="/usuarios" element={<AdminUsuarios />} />
                                <Route path="/assinaturas" element={<AdminAssinaturas />} />
                                <Route path="/relatorios" element={<AdminRelatorios />} />
                                <Route path="/permissoes" element={<AdminPermissoes />} />
                                <Route path="/suporte" element={<AdminSuporte />} />
                                <Route path="/equipe-cactoai" element={<AdminEquipeCactoAI />} />
                                <Route path="/perfil" element={<AdminPerfil />} />
                                <Route path="/configuracoes" element={<AdminConfiguracoes />} />
                              </Routes>
                            </div>
                          </div>
                        </SidebarProvider>
                      </AdminProvider>
                    </AdminGuard>
                  </ProtectedRoute>
                }
              />

              {/* Clinic Routes - Clinic Sidebar */}
              <Route
                path="/app/*"
                element={
                  <ProtectedRoute>
                    <SidebarProvider defaultOpen={false}>
                      <div className="flex min-h-screen w-full bg-background">
                        <AppSidebar />
                        <div className="flex flex-1 flex-col">
                          <Header />
                          <Routes>
                            <Route path="" element={<Dashboard />} />
                            <Route path="agenda" element={<Agenda />} />
                            {/* Rotas ocultadas temporariamente - arquivos mantidos para uso futuro */}
                            {/* <Route path="agendamentos" element={<Agendamentos />} /> */}
                            {/* <Route path="agenda-profissional" element={<AgendaProfissional />} /> */}
                            <Route path="consulta" element={<Consulta />} />
                            <Route path="pacientes" element={<Pacientes />} />
                            <Route path="crm" element={<CRM />} />
                            <Route path="convenios" element={<Convenios />} />
                            <Route path="financeiro" element={<Financeiro />} />
                            <Route path="pagamentos" element={<Pagamentos />} />
                            <Route path="equipe" element={<Equipe />} />
                            <Route path="estoque" element={<Estoque />} />
                            <Route path="comunicacao" element={<Comunicacao />} />
                            <Route path="relatorios" element={<Relatorios />} />
                            <Route path="suporte" element={<Suporte />} />
                            <Route path="configuracoes" element={<Configuracoes />} />
                            <Route path="perfil-usuario" element={<PerfilUsuario />} />
                            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </div>
                      </div>
                    </SidebarProvider>
                  </ProtectedRoute>
                }
              />
            </Routes>
            {/* Chat Widget global - aparece em todas as páginas exceto telemedicina */}
            <ConditionalChatWidget />
          </BrowserRouter>
        </AuthProvider>
      </ChatProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
