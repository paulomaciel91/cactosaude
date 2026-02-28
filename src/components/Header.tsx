import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, UserCircle, Settings, LogOut, Calendar, Users, FileText, Package, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useClinic } from "@/hooks/useClinic";

export function Header() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);

  const { clinic, loading: clinicLoading } = useClinic();

  // Mock de notificações
  const notifications = [
    {
      id: 1,
      title: "Nova consulta agendada",
      message: "Maria Silva agendou uma consulta para amanhã às 14:00",
      time: "Há 5 minutos",
      type: "appointment",
      read: false,
      icon: Calendar,
    },
    {
      id: 2,
      title: "Pagamento recebido",
      message: "Pagamento de R$ 150,00 recebido de Pedro Costa",
      time: "Há 1 hora",
      type: "payment",
      read: false,
      icon: CreditCard,
    },
    {
      id: 3,
      title: "Estoque baixo",
      message: "O item 'Seringa 5ml' está com estoque abaixo do mínimo",
      time: "Há 2 horas",
      type: "stock",
      read: true,
      icon: Package,
    },
    {
      id: 4,
      title: "Novo paciente cadastrado",
      message: "Julia Oliveira foi cadastrada no sistema",
      time: "Há 3 horas",
      type: "patient",
      read: true,
      icon: Users,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      return;
    }

    // Buscar apenas pacientes
    navigate(`/app/pacientes?search=${encodeURIComponent(query)}`);
    toast.success(`Buscando pacientes por: ${query}`);
  };

  const handleNotificationClick = (e: React.MouseEvent, notification: typeof notifications[0]) => {
    e.preventDefault();
    e.stopPropagation();

    // Marcar como selecionada imediatamente
    setSelectedNotificationId(notification.id);

    // Forçar re-renderização
    setTimeout(() => {
      // Navegar baseado no tipo de notificação após mostrar a seleção
      setTimeout(() => {
        switch (notification.type) {
          case "appointment":
            navigate("/app/agenda");
            break;
          case "payment":
            navigate("/app/pagamentos");
            break;
          case "stock":
            navigate("/estoque");
            break;
          case "patient":
            navigate("/app/pacientes");
            break;
          default:
            break;
        }
        // Fechar o popover após navegar
        setTimeout(() => {
          setNotificationsOpen(false);
        }, 100);
      }, 400);
    }, 0);
  };

  const { session, signOut } = useAuth();

  // Dados do usuário atual (carregados do localStorage/session)
  const currentUser = {
    name: localStorage.getItem('cactosaude_user_name') || session?.user?.user_metadata?.full_name || "Usuário",
    role: localStorage.getItem('CactoSaude_user_role') || "Médico",
    email: localStorage.getItem('cactosaude_user_email') || session?.user?.email || "",
    roleKey: (localStorage.getItem('CactoSaude_user_role') || "medico") as "admin" | "medico" | "recepcionista" | "financeiro",
    photo: "",
  };

  const isAdmin = currentUser.roleKey === "admin";

  const handleProfileClick = () => {
    navigate("/app/perfil-usuario");
  };

  const handleSettingsClick = () => {
    if (!isAdmin) {
      toast.error("Acesso negado. Apenas administradores podem acessar as configurações.");
      return;
    }
    navigate("/app/configuracoes");
  };

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
    <header className="sticky top-0 z-10 flex h-14 sm:h-16 items-center border-b border-border bg-card">
      <div className="flex items-center h-full w-full px-4 sm:px-6 gap-2 sm:gap-4">
        <div className="shrink-0 flex-shrink-0">
          <SidebarTrigger className="text-foreground hover:bg-primary hover:text-white transition-colors !h-9 !w-9 flex-shrink-0" />
        </div>

        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
          <span className="font-semibold text-foreground text-xs sm:text-sm md:text-base truncate">
            {clinicLoading ? "Carregando..." : (clinic?.name || "Clínica")}
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-1 sm:px-2 md:px-8 min-w-0">
          <div className="w-full max-w-xs sm:max-w-md md:max-w-2xl">
            <SearchBar
              placeholder="Buscar pacientes por nome ou CPF..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 sm:right-2 sm:top-2 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-primary" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 p-0" align="end">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Notificações</h4>
                  {unreadCount > 0 && (
                    <Badge variant="default" className="text-xs">
                      {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
              <ScrollArea className="h-[400px]">
                <div className="p-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma notificação</p>
                    </div>
                  ) : (
                    notifications.map((notification, index) => {
                      const Icon = notification.icon;
                      return (
                        <div key={notification.id}>
                          <div
                            onClick={(e) => handleNotificationClick(e, notification)}
                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedNotificationId === notification.id
                              ? 'bg-primary/20 border-2 border-primary shadow-md ring-2 ring-primary/20'
                              : 'hover:bg-muted/50 border-2 border-transparent'
                              } ${!notification.read && selectedNotificationId !== notification.id ? 'bg-primary/5' : ''
                              }`}
                            style={{
                              ...(selectedNotificationId === notification.id && {
                                backgroundColor: 'rgba(34, 197, 94, 0.25)',
                                borderColor: 'rgb(34, 197, 94)',
                                borderWidth: '2px',
                                borderStyle: 'solid',
                              }),
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 p-1.5 rounded-full ${notification.type === 'appointment' ? 'bg-blue-500/10 text-blue-600' :
                                notification.type === 'payment' ? 'bg-green-500/10 text-green-600' :
                                  notification.type === 'stock' ? 'bg-orange-500/10 text-orange-600' :
                                    'bg-purple-500/10 text-purple-600'
                                }`}>
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm font-medium ${selectedNotificationId === notification.id
                                    ? 'text-primary font-semibold'
                                    : !notification.read
                                      ? 'text-foreground'
                                      : 'text-muted-foreground'
                                    }`}>
                                    {notification.title}
                                  </p>
                                  {!notification.read && selectedNotificationId !== notification.id && (
                                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                                  )}
                                </div>
                                <p className={`text-xs mt-0.5 line-clamp-2 ${selectedNotificationId === notification.id
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                                  }`}>
                                  {notification.message}
                                </p>
                                <p className={`text-xs mt-1 ${selectedNotificationId === notification.id
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                                  }`}>
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                          {index < notifications.length - 1 && <Separator className="my-1" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full h-8 w-8 sm:h-10 sm:w-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:opacity-80 transition-opacity">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                  <AvatarImage src={currentUser.photo} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <div className="p-3 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={currentUser.photo} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentUser.role}</p>
                    <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                  </div>
                </div>
              </div>
              <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                Meu Perfil
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <div className="p-1">
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;
