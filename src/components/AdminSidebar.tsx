import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  Settings,
  Shield,
  BarChart3,
  CreditCard,
  Users,
  LogOut,
  HelpCircle,
  UserCog,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import cactoIcon from "@/assets/cacto-icon.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/contexts/AdminContext";
import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "sonner";

const adminMenuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Clínicas",
    url: "/admin/clinicas",
    icon: Building2,
  },
  {
    title: "Usuários",
    url: "/admin/usuarios",
    icon: Users,
  },
  {
    title: "Assinaturas",
    url: "/admin/assinaturas",
    icon: CreditCard,
  },
  {
    title: "Relatórios",
    url: "/admin/relatorios",
    icon: BarChart3,
  },
  {
    title: "Permissões",
    url: "/admin/permissoes",
    icon: Shield,
  },
  {
    title: "Equipe CactoAI",
    url: "/admin/equipe-cactoai",
    icon: UserCog,
  },
  {
    title: "Suporte",
    url: "/admin/suporte",
    icon: HelpCircle,
  },
  {
    title: "Configurações",
    url: "/admin/configuracoes",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { open, state } = useSidebar();
  const { selectedClinic } = useAdmin();

  const handleLogout = () => {
    toast.success("Saindo do painel admin...");
    navigate("/login");
  };

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {isCollapsed ? (
        <div className="border-b border-sidebar-border py-2 flex items-center justify-center">
          <img src={cactoIcon} alt="CactoSaude" className="h-8 w-8 object-contain" />
        </div>
      ) : (
        <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={cactoIcon} alt="CactoSaude" className="h-10 w-10 object-contain shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xl font-bold text-primary tracking-tight">CactoSaude</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Painel Admin</span>
              {selectedClinic && (
                <span className="text-xs text-primary mt-1 font-medium truncate max-w-[200px]">
                  {selectedClinic.name}
                </span>
              )}
            </div>
          </div>
        </SidebarHeader>
      )}


      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className="transition-colors"
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="flex items-center gap-3 hover:bg-sidebar-accent pl-2"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium border-l-4 border-sidebar-primary pl-[calc(0.5rem-4px)]"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.title}</span>
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
