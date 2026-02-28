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
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Agenda", url: "/agenda", icon: CalendarCheck },
  // Itens ocultados temporariamente - arquivos mantidos para uso futuro
  // { title: "Agendamentos", url: "/agendamentos", icon: Calendar },
  // { title: "Agenda Profissional", url: "/agenda-profissional", icon: CalendarCheck },
  { title: "Consulta", url: "/consulta", icon: Stethoscope },
  { title: "Pacientes", url: "/pacientes", icon: Users },
  { title: "CRM", url: "/crm", icon: Target },
  { title: "Convênios", url: "/convenios", icon: Building2 },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
  { title: "Pagamentos", url: "/pagamentos", icon: CreditCard },
  { title: "Equipe", url: "/equipe", icon: UserCog },
  { title: "Estoque", url: "/estoque", icon: Package },
  { title: "Comunicação", url: "/comunicacao", icon: MessageSquare },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
  { title: "Suporte", url: "/suporte", icon: HelpCircle },
  { title: "Configurações", url: "/configuracoes", icon: Settings, adminOnly: true },
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

  const handleLogout = () => {
    toast.success("Saindo do sistema...");
    navigate("/login");
  };

  useEffect(() => {
    const applyStyles = () => {
      const logoBtn = document.querySelector('img[alt="CactoSaude"]')?.closest('button');
      const logoImg = document.querySelector('img[alt="CactoSaude"]');
      if (logoBtn && logoImg) {
        const btn = logoBtn as HTMLButtonElement;
        const img = logoImg as HTMLImageElement;
        
        if (isCollapsed) {
          // Botão: 40x40px, centralizado perfeitamente quando colapsado
          btn.style.setProperty('padding', '0', 'important');
          btn.style.setProperty('height', '40px', 'important');
          btn.style.setProperty('width', '40px', 'important');
          btn.style.setProperty('min-height', '40px', 'important');
          btn.style.setProperty('min-width', '40px', 'important');
          btn.style.setProperty('display', 'flex', 'important');
          btn.style.setProperty('align-items', 'center', 'important');
          btn.style.setProperty('justify-content', 'center', 'important');
          btn.style.setProperty('margin', '0 auto', 'important');
          btn.style.setProperty('flex-shrink', '0', 'important');
          btn.style.setProperty('line-height', '0', 'important');
          btn.style.setProperty('text-align', 'center', 'important');
          
          // Imagem: 24x24px, centralizada perfeitamente dentro do botão quando colapsado
          img.style.setProperty('height', '24px', 'important');
          img.style.setProperty('width', '24px', 'important');
          img.style.setProperty('max-height', '24px', 'important');
          img.style.setProperty('max-width', '24px', 'important');
          img.style.setProperty('display', 'block', 'important');
          img.style.setProperty('margin', '4px auto 0 auto', 'important');
          img.style.setProperty('padding', '0', 'important');
          img.style.setProperty('object-fit', 'contain', 'important');
          img.style.setProperty('vertical-align', 'middle', 'important');
          img.style.setProperty('position', 'relative', 'important');
          img.style.setProperty('top', '4px', 'important');
          img.style.setProperty('left', '0', 'important');
        } else {
          // Quando expandido, garantir alinhamento correto
          const headerImg = document.querySelector('img[alt="CactoSaude"]');
          if (headerImg && !headerImg.closest('button')) {
            // É a imagem do header expandido
            headerImg.style.setProperty('display', 'block', 'important');
            headerImg.style.setProperty('flex-shrink', '0', 'important');
            headerImg.style.setProperty('object-fit', 'contain', 'important');
          }
        }
      }
    };

    // Apply immediately
    applyStyles();
    
    // Also apply after multiple delays to ensure DOM is ready
    const timeoutId1 = setTimeout(applyStyles, 50);
    const timeoutId2 = setTimeout(applyStyles, 100);
    const timeoutId3 = setTimeout(applyStyles, 200);
    
    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
    };
  }, [isCollapsed, open]);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {isCollapsed ? (
        <div className="border-b border-sidebar-border pb-1">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="flex items-center justify-center">
                <SidebarMenuItem className="w-full flex justify-center items-center">
                  <SidebarMenuButton 
                    className="pointer-events-none flex items-center justify-center !items-center"
                  >
                    <img src={logo} alt="CactoSaude" className="h-6 w-6 object-contain shrink-0" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      ) : (
        <SidebarHeader className="border-b border-sidebar-border px-4 pb-2.5 pt-2.5">
          <div className="flex items-center gap-3">
            <img src={logo} alt="CactoSaude" className="h-8 w-8" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-sidebar-primary">CactoSaude</span>
              <span className="text-xs text-sidebar-foreground/70">Sistema de Gestão</span>
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
                      end={item.url === "/"} 
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
