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

  useEffect(() => {
    const applyStyles = () => {
      const cactusBtn = document.querySelector('img[alt="CactoSaude"]')?.closest('button');
      const cactusImg = document.querySelector('img[alt="CactoSaude"]');
      if (cactusBtn && cactusImg) {
        const btn = cactusBtn as HTMLButtonElement;
        const img = cactusImg as HTMLImageElement;
        
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
            headerImg.style.setProperty('align-self', 'center', 'important');
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
                    <img src={cactoIcon} alt="CactoSaude" className="h-6 w-6 object-contain shrink-0" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      ) : (
        <SidebarHeader className="border-b border-sidebar-border pb-2.5 pt-2.5">
          <div className="flex items-center gap-3">
            <img src={cactoIcon} alt="CactoSaude" className="h-10 w-10 object-contain shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-lg font-bold text-primary">CactoSaude</span>
              <span className="text-xs text-muted-foreground">Painel Admin</span>
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
