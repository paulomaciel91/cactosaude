import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, User, UserCircle, Settings, X, LogOut, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { useAdmin } from "@/contexts/AdminContext";
import { useAuth } from "@/contexts/AuthContext";

export function AdminHeader() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedClinic, setSelectedClinic, clinics } = useAdmin();
  const { profile, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);

  const isAdminRoute = location.pathname.startsWith("/admin");

  // Mock de notificações admin
  const notifications = [
    {
      id: 1,
      title: "Nova clínica cadastrada",
      message: "Clínica Saúde Total foi cadastrada no sistema",
      time: "Há 10 minutos",
      type: "clinic",
      read: false,
      icon: Building2,
    },
    {
      id: 2,
      title: "Pagamento pendente",
      message: "Clínica Vida Saudável possui pagamento pendente",
      time: "Há 2 horas",
      type: "payment",
      read: false,
      icon: Building2,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.info("Digite algo para buscar");
      return;
    }
    // Buscar clínicas
    toast.success(`Buscando clínicas por: ${searchQuery}`);
  };

  const handleNotificationClick = (e: React.MouseEvent, notification: typeof notifications[0]) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNotificationId(notification.id);
    setTimeout(() => {
      if (notification.type === "clinic") {
        navigate("/admin/clinicas");
      } else if (notification.type === "payment") {
        navigate("/admin/faturamento");
      }
      setTimeout(() => {
        setNotificationsOpen(false);
      }, 100);
    }, 500);
  };

  const currentUser = {
    name: profile?.full_name || "Admin Sistema",
    role: profile?.role || "Administrador",
    email: profile?.email || "admin@cactosaude.com",
    photo: "",
  };

  const handleProfileClick = () => {
    navigate("/admin/perfil");
  };

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminProfile");
      navigate("/login");
      toast.success("Logout realizado com sucesso!");
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

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-foreground text-xs sm:text-sm md:text-base truncate">
              CactoSaude Admin
            </span>
            {selectedClinic && (
              <span className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-none">
                {selectedClinic.name}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-1 sm:px-2 md:px-4 lg:px-8 min-w-0">
          <form onSubmit={handleSearch} className="relative w-full max-w-xs sm:max-w-md lg:max-w-xl">
            <Search className="absolute left-2 sm:left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              type="text"
              placeholder={selectedClinic ? `Buscar em ${selectedClinic.name}...` : "Buscar clínicas, usuários..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 sm:pl-10 pr-8 sm:pr-10 h-8 sm:h-10 text-xs sm:text-sm bg-background border-muted-foreground/20 hover:border-primary/30 focus:border-primary [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10 rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            )}
          </form>
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
                              ? 'bg-primary/20 border-2 border-primary shadow-md'
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
                              <div className="mt-0.5 p-1.5 rounded-full bg-blue-500/10 text-blue-600">
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
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/admin/configuracoes")} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configurações Admin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem("adminToken");
                  localStorage.removeItem("adminProfile");
                  navigate("/login");
                  toast.success("Logout realizado com sucesso!");
                }}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;

