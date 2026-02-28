import {
  LayoutDashboard,
  Calendar,
  CalendarCheck,
  Stethoscope,
  Users,
  DollarSign,
  CreditCard,
  UserCog,
  Package,
  MessageSquare,
  FileText,
  HelpCircle,
  Settings,
  LogOut,
  Target,
  Building2
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";
import { toast } from "sonner";
import { canViewModule } from "@/lib/permissionService";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const allMenuItems: Array<{
  title: string;
  url: string;
  icon: any;
  adminOnly?: boolean;
}> = [
    { title: "Dashboard", url: "/app", icon: LayoutDashboard },
    { title: "Agenda", url: "/app/agenda", icon: CalendarCheck },
    // Itens ocultados temporariamente - arquivos mantidos para uso futuro
    // { title: "Agendamentos", url: "/agendamentos", icon: Calendar },
    // { title: "Agenda Profissional", url: "/agenda-profissional", icon: CalendarCheck },
    { title: "Consulta", url: "/app/consulta", icon: Stethoscope },
    { title: "Pacientes", url: "/app/pacientes", icon: Users },
    { title: "CRM", url: "/app/crm", icon: Target },
    { title: "Convênios", url: "/app/convenios", icon: Building2 },
    { title: "Financeiro", url: "/app/financeiro", icon: DollarSign },
    { title: "Pagamentos", url: "/app/pagamentos", icon: CreditCard },
    { title: "Equipe", url: "/app/equipe", icon: UserCog },
    { title: "Estoque", url: "/app/estoque", icon: Package },
    { title: "Comunicação", url: "/app/comunicacao", icon: MessageSquare },
    { title: "Relatórios", url: "/app/relatorios", icon: FileText },
    { title: "Suporte", url: "/app/suporte", icon: HelpCircle },
    { title: "Configurações", url: "/app/configuracoes", icon: Settings, adminOnly: true },
  ];

export function AppSidebar() {
  const { open, state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  // Verificar permissões de módulos
  const [menuItems, setMenuItems] = useState(allMenuItems);

  useEffect(() => {
    // Filtrar itens do menu baseado nas permissões (clínica + usuário)
    const filtered = allMenuItems.filter(item => {
      // Se é adminOnly, verificar se é admin
      if (item.adminOnly) {
        return canViewModule("Configurações"); // Admin sempre pode ver Configurações
      }

      // Mapear título do menu para nome do módulo
      const moduleMap: Record<string, string> = {
        "Dashboard": "Dashboard",
        "Agenda": "Agenda",
        "Consulta": "Consulta",
        "Pacientes": "Pacientes",
        "CRM": "CRM",
        "Convênios": "Convênios",
        "Financeiro": "Financeiro",
        "Pagamentos": "Pagamentos",
        "Equipe": "Equipe",
        "Estoque": "Estoque",
        "Comunicação": "Comunicação",
        "Relatórios": "Relatórios",
        "Suporte": "Suporte",
        "Configurações": "Configurações",
      };

      const moduleName = moduleMap[item.title];
      if (moduleName) {
        return canViewModule(moduleName); // Verifica módulo da clínica + permissão do usuário
      }

      // Se não mapeado, manter visível (compatibilidade)
      return true;
    });

    setMenuItems(filtered);

    // Listener para atualizações de permissões e módulos da clínica
    const handlePermissionsUpdate = () => {
      const updated = allMenuItems.filter(item => {
        if (item.adminOnly) {
          return canViewModule("Configurações");
        }

        const moduleMap: Record<string, string> = {
          "Dashboard": "Dashboard",
          "Agenda": "Agenda",
          "Consulta": "Consulta",
          "Pacientes": "Pacientes",
          "CRM": "CRM",
          "Convênios": "Convênios",
          "Financeiro": "Financeiro",
          "Pagamentos": "Pagamentos",
          "Equipe": "Equipe",
          "Estoque": "Estoque",
          "Comunicação": "Comunicação",
          "Relatórios": "Relatórios",
          "Suporte": "Suporte",
          "Configurações": "Configurações",
        };

        const moduleName = moduleMap[item.title];
        if (moduleName) {
          return canViewModule(moduleName);
        }
        return true;
      });
      setMenuItems(updated);
    };

    window.addEventListener('rolesUpdated', handlePermissionsUpdate);
    window.addEventListener('clinicModulesUpdated', handlePermissionsUpdate);
    return () => {
      window.removeEventListener('rolesUpdated', handlePermissionsUpdate);
      window.removeEventListener('clinicModulesUpdated', handlePermissionsUpdate);
    };
  }, []);

  const { session, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      toast.success("Saindo do sistema...");
      await signOut();
      localStorage.removeItem('cactosaude_user_name');
      localStorage.removeItem('cactosaude_user_email');
      localStorage.removeItem('CactoSaude_user_role');
      localStorage.removeItem('cactosaude_current_clinic_id');
      navigate("/login");
    } catch (error) {
      console.error("Erro ao sair:", error);
      navigate("/login");
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {isCollapsed ? (
        <div className="border-b border-sidebar-border py-2 flex items-center justify-center">
          <img src={logo} alt="CactoSaude" className="h-8 w-8 object-contain" />
        </div>
      ) : (
        <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="CactoSaude" className="h-8 w-8 object-contain" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary tracking-tight">CactoSaude</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Sistema de Gestão</span>
            </div>
          </div>
        </SidebarHeader>
      )}


      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={open ? "px-4" : "px-2"}>
            {open ? "Menu Principal" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="transition-colors"
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/app"}
                      className="flex items-center gap-3 hover:bg-sidebar-accent pl-2"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium border-l-4 border-sidebar-primary pl-[calc(0.5rem-4px)]"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  tooltip="Sair"
                  className="transition-colors hover:bg-destructive/10 hover:text-destructive active:bg-destructive/20 active:text-destructive text-white hover:text-destructive"
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span className="font-medium">Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
