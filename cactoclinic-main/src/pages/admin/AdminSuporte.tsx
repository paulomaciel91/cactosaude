import { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  X,
  Eye,
  Reply,
  Archive,
  Filter,
  User,
  Download,
  Send
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { chatService } from "@/lib/chatService";
import { StandardPagination } from "@/components/ui/standard-pagination";

interface Ticket {
  id: string;
  clinic: string;
  clinicId: number;
  subject: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "closed";
  createdAt: string;
  lastUpdate: string;
  assignedTo?: string;
  messages: Array<{
    author: string;
    message: string;
    timestamp: string;
    isAdmin?: boolean;
  }>;
}

const AdminSuporte = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Estados de paginação para cada aba
  const [currentPageAll, setCurrentPageAll] = useState(1);
  const [currentPageOpen, setCurrentPageOpen] = useState(1);
  const [currentPageInProgress, setCurrentPageInProgress] = useState(1);
  const [currentPageClosed, setCurrentPageClosed] = useState(1);
  const itemsPerPage = 10;

  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "TKT-001",
      clinic: "Clínica Vida Saudável",
      clinicId: 1,
      subject: "Problema ao gerar relatório",
      priority: "high",
      status: "open",
      createdAt: "2024-01-20 10:30:00",
      lastUpdate: "2024-01-20 14:00:00",
      assignedTo: "Suporte CactoSaude",
      messages: [
        { author: "Clínica Vida Saudável", message: "Não consigo gerar o relatório de consultas do mês passado.", timestamp: "2024-01-20 10:30:00", isAdmin: false },
        { author: "Suporte CactoSaude", message: "Olá! Vamos verificar isso para você. Pode nos enviar mais detalhes?", timestamp: "2024-01-20 11:00:00", isAdmin: true },
      ],
    },
    {
      id: "TKT-002",
      clinic: "Centro Médico São Lucas",
      clinicId: 2,
      subject: "Dúvida sobre integração",
      priority: "medium",
      status: "in_progress",
      createdAt: "2024-01-19 15:20:00",
      lastUpdate: "2024-01-20 09:15:00",
      assignedTo: "Suporte CactoSaude",
      messages: [
        { author: "Centro Médico São Lucas", message: "Como funciona a integração com planos de saúde?", timestamp: "2024-01-19 15:20:00", isAdmin: false },
        { author: "Suporte CactoSaude", message: "A integração permite sincronizar dados dos pacientes com os planos de saúde cadastrados.", timestamp: "2024-01-19 16:00:00", isAdmin: true },
      ],
    },
    {
      id: "TKT-003",
      clinic: "Odonto Excellence",
      clinicId: 3,
      subject: "Solicitação de treinamento",
      priority: "low",
      status: "closed",
      createdAt: "2024-01-18 08:00:00",
      lastUpdate: "2024-01-19 16:30:00",
      assignedTo: "Suporte CactoSaude",
      messages: [
        { author: "Odonto Excellence", message: "Gostaríamos de agendar um treinamento para nossa equipe.", timestamp: "2024-01-18 08:00:00", isAdmin: false },
        { author: "Suporte CactoSaude", message: "Claro! Vamos agendar para a próxima semana.", timestamp: "2024-01-19 16:30:00", isAdmin: true },
      ],
    },
    {
      id: "TKT-004",
      clinic: "NutriCare",
      clinicId: 4,
      subject: "Erro ao acessar sistema",
      priority: "high",
      status: "open",
      createdAt: "2024-01-20 08:00:00",
      lastUpdate: "2024-01-20 08:00:00",
      messages: [
        { author: "NutriCare", message: "Não consigo fazer login no sistema desde ontem.", timestamp: "2024-01-20 08:00:00", isAdmin: false },
      ],
    },
  ]);

  // Carregar tickets iniciais do chatService
  useEffect(() => {
    const loadInitialTickets = () => {
      const chatTicketsFromService = chatService.getAllChatTickets();
      if (chatTicketsFromService.length > 0) {
        setTickets((prev) => {
          // Combinar tickets existentes com tickets de chat, evitando duplicatas
          const existingIds = new Set(prev.map(t => t.id));
          const newChatTickets = chatTicketsFromService.filter(t => !existingIds.has(t.id));
          return [...newChatTickets, ...prev];
        });
      }
    };
    
    loadInitialTickets();
  }, []);

  // Escutar novos tickets de chat e atualizações
  useEffect(() => {
    const handleNewChatTicket = (event: CustomEvent) => {
      const ticket = event.detail as Ticket;
      setTickets((prev) => {
        // Evitar duplicatas
        if (prev.find(t => t.id === ticket.id)) return prev;
        toast.info(`Novo chat iniciado: ${ticket.clinic}`);
        return [ticket, ...prev];
      });
    };

    const handleChatMessageUpdate = (event: CustomEvent) => {
      const { ticketId, ticket } = event.detail;
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? ticket : t))
      );
      // Atualizar ticket selecionado se for o mesmo
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(ticket);
      }
    };

    const handleChatTicketsUpdated = (event: CustomEvent) => {
      const updatedTickets = event.detail as Ticket[];
      setTickets((prev) => {
        // Criar mapa de tickets atualizados para busca rápida
        const updatedMap = new Map(updatedTickets.map(t => [t.id, t]));
        
        // Atualizar tickets existentes e adicionar novos
        const updated = prev.map(t => updatedMap.get(t.id) || t);
        const existingIds = new Set(prev.map(t => t.id));
        const newTickets = updatedTickets.filter(t => !existingIds.has(t.id));
        
        return newTickets.length > 0 ? [...newTickets, ...updated] : updated;
      });
      
      // Atualizar ticket selecionado se necessário
      if (selectedTicket) {
        const updatedTicket = updatedTickets.find(t => t.id === selectedTicket.id);
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
        }
      }
    };

    // Escutar eventos de atualização de tickets
    window.addEventListener('newChatTicket' as any, handleNewChatTicket as EventListener);
    window.addEventListener('chatMessageUpdate' as any, handleChatMessageUpdate as EventListener);
    window.addEventListener('chatTicketsUpdated' as any, handleChatTicketsUpdated as EventListener);
    
    // Escutar mudanças no localStorage de outras abas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cactoChatTickets' && e.newValue) {
        try {
          const updatedTickets = JSON.parse(e.newValue) as Ticket[];
          handleChatTicketsUpdated(new CustomEvent('chatTicketsUpdated', { detail: updatedTickets }));
        } catch (err) {
          console.error('Erro ao processar atualização de storage:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Polling para atualizar tickets periodicamente (simula WebSocket)
    const intervalId = setInterval(() => {
      const allChatTickets = chatService.getAllChatTickets();
      if (allChatTickets.length > 0) {
        setTickets((prev) => {
          const updatedMap = new Map(allChatTickets.map(t => [t.id, t]));
          let hasChanges = false;
          
          const updated = prev.map(t => {
            const chatTicket = updatedMap.get(t.id);
            if (chatTicket) {
              // Verificar se houve mudanças
              if (t.lastUpdate !== chatTicket.lastUpdate || 
                  t.messages.length !== chatTicket.messages.length ||
                  t.status !== chatTicket.status) {
                hasChanges = true;
                return chatTicket;
              }
            }
            return t;
          });
          
          // Adicionar novos tickets
          const existingIds = new Set(prev.map(t => t.id));
          const newTickets = allChatTickets.filter(t => !existingIds.has(t.id));
          if (newTickets.length > 0) {
            hasChanges = true;
            return [...newTickets, ...updated];
          }
          
          return hasChanges ? updated : prev;
        });
        
        // Atualizar ticket selecionado se necessário
        if (selectedTicket) {
          const updatedTicket = allChatTickets.find(t => t.id === selectedTicket.id);
          if (updatedTicket && (
            updatedTicket.lastUpdate !== selectedTicket.lastUpdate ||
            updatedTicket.messages.length !== selectedTicket.messages.length ||
            updatedTicket.status !== selectedTicket.status
          )) {
            setSelectedTicket(updatedTicket);
          }
        }
      }
    }, 2000); // Verificar a cada 2 segundos

    return () => {
      window.removeEventListener('newChatTicket' as any, handleNewChatTicket as EventListener);
      window.removeEventListener('chatMessageUpdate' as any, handleChatMessageUpdate as EventListener);
      window.removeEventListener('chatTicketsUpdated' as any, handleChatTicketsUpdated as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [selectedTicket]);

  const stats = useMemo(() => {
    const open = tickets.filter(t => t.status === "open").length;
    const inProgress = tickets.filter(t => t.status === "in_progress").length;
    const closed = tickets.filter(t => t.status === "closed").length;
    const highPriority = tickets.filter(t => t.priority === "high" && t.status !== "closed").length;
    
    return { open, inProgress, closed, highPriority };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.clinic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter]);

  // Tickets filtrados por status para cada aba
  const openTickets = useMemo(() => {
    return tickets.filter(t => t.status === "open");
  }, [tickets]);

  const inProgressTickets = useMemo(() => {
    return tickets.filter(t => t.status === "in_progress");
  }, [tickets]);

  const closedTickets = useMemo(() => {
    return tickets.filter(t => t.status === "closed");
  }, [tickets]);

  // Paginação para cada aba
  const paginatedAllTickets = useMemo(() => {
    const start = (currentPageAll - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredTickets.slice(start, end);
  }, [filteredTickets, currentPageAll, itemsPerPage]);

  const paginatedOpenTickets = useMemo(() => {
    const start = (currentPageOpen - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return openTickets.slice(start, end);
  }, [openTickets, currentPageOpen, itemsPerPage]);

  const paginatedInProgressTickets = useMemo(() => {
    const start = (currentPageInProgress - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return inProgressTickets.slice(start, end);
  }, [inProgressTickets, currentPageInProgress, itemsPerPage]);

  const paginatedClosedTickets = useMemo(() => {
    const start = (currentPageClosed - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return closedTickets.slice(start, end);
  }, [closedTickets, currentPageClosed, itemsPerPage]);

  // Calcular total de páginas para cada aba
  const totalPagesAll = Math.ceil(filteredTickets.length / itemsPerPage);
  const totalPagesOpen = Math.ceil(openTickets.length / itemsPerPage);
  const totalPagesInProgress = Math.ceil(inProgressTickets.length / itemsPerPage);
  const totalPagesClosed = Math.ceil(closedTickets.length / itemsPerPage);

  // Resetar página quando mudar filtros
  useEffect(() => {
    setCurrentPageAll(1);
  }, [searchTerm, statusFilter, priorityFilter]);

  // Tickets de chat para a aba Chat Interno (com filtro de busca)
  const chatTickets = useMemo(() => {
    const chatOnly = tickets.filter(t => t.id.startsWith('CHAT-'));
    const filtered = searchTerm 
      ? chatOnly.filter(t => 
          t.clinic.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.messages.some(m => m.message.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : chatOnly;
    return filtered.sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
  }, [tickets, searchTerm]);
  
  // Debug: log para verificar tickets de chat (apenas em desenvolvimento)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Chat tickets:', chatTickets);
      console.log('All tickets:', tickets);
      console.log('ChatService tickets:', chatService.getAllChatTickets());
    }
  }, [chatTickets, tickets]);

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketDialogOpen(true);
  };

  // Scroll automático para o final das mensagens
  useEffect(() => {
    if (messagesEndRef.current && selectedTicket) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedTicket?.messages.length, selectedTicket?.id, replyText]);

  const handleReply = () => {
    if (!replyText.trim() || !selectedTicket) {
      toast.error("Digite uma mensagem");
      return;
    }

    const messageText = replyText.trim();
    setReplyText("");

    // Enviar mensagem via chatService se for um ticket de chat
    if (selectedTicket.id.startsWith('CHAT-')) {
      const adminName = "Suporte CactoSaude";
      chatService.sendAdminMessage(selectedTicket.id, messageText, adminName);
      
      // Recarregar do chatService para garantir sincronização
      setTimeout(() => {
        const allChatTickets = chatService.getAllChatTickets();
        const updatedTicket = allChatTickets.find(t => t.id === selectedTicket.id);
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
          setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
        }
      }, 100);
    } else {
      // Para tickets não-chat, atualizar localmente
      const updatedTickets = tickets.map(ticket =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              messages: [
                ...ticket.messages,
                {
                  author: "Suporte CactoSaude",
                  message: messageText,
                  timestamp: new Date().toISOString(),
                  isAdmin: true,
                },
              ],
              lastUpdate: new Date().toISOString(),
              status: ticket.status === "open" ? "in_progress" : ticket.status,
            }
          : ticket
      );

      setTickets(updatedTickets);
      setSelectedTicket(updatedTickets.find(t => t.id === selectedTicket.id) || null);
    }
    
    toast.success("Mensagem enviada!");
  };

  const handleCloseTicket = (ticket: Ticket) => {
    // Se for ticket de chat, usar o chatService
    if (ticket.id.startsWith('CHAT-')) {
      chatService.closeTicket(ticket.id);
      const updatedTicket = chatService.getTicket(ticket.id);
      if (updatedTicket) {
        setTickets(prev => prev.map(t => t.id === ticket.id ? updatedTicket : t));
        if (selectedTicket?.id === ticket.id) {
          setSelectedTicket(updatedTicket);
        }
      }
    } else {
      // Para tickets não-chat, atualizar localmente
      const updatedTickets = tickets.map(t =>
        t.id === ticket.id ? { ...t, status: "closed" as const } : t
      );
      setTickets(updatedTickets);
      if (selectedTicket?.id === ticket.id) {
        setSelectedTicket(updatedTickets.find(t => t.id === ticket.id) || null);
      }
    }
    toast.success(`Ticket ${ticket.id} fechado!`);
  };

  const handleAssignTicket = (ticketId: string, assignee: string) => {
    const updatedTickets = tickets.map(t =>
      t.id === ticketId ? { ...t, assignedTo: assignee, status: "in_progress" as const } : t
    );
    setTickets(updatedTickets);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(updatedTickets.find(t => t.id === ticketId) || null);
    }
    toast.success(`Ticket atribuído para ${assignee}`);
  };

  const handleChangePriority = (ticketId: string, priority: "high" | "medium" | "low") => {
    const updatedTickets = tickets.map(t =>
      t.id === ticketId ? { ...t, priority } : t
    );
    setTickets(updatedTickets);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(updatedTickets.find(t => t.id === ticketId) || null);
    }
    toast.success(`Prioridade alterada`);
  };

  const handleExport = () => {
    toast.success("Exportando relatório de tickets...");
    setTimeout(() => {
      toast.success("Relatório exportado com sucesso!");
    }, 1000);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>;
      case "medium":
        return <Badge variant="default" className="bg-orange-500/10 text-orange-600">Média</Badge>;
      case "low":
        return <Badge variant="secondary">Baixa</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="default">Aberto</Badge>;
      case "in_progress":
        return <Badge variant="default" className="bg-blue-500/10 text-blue-600">Em Atendimento</Badge>;
      case "closed":
        return <Badge variant="secondary">Fechado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Suporte</h1>
            <p className="text-muted-foreground mt-1">
              Atendimento e gestão de tickets das clínicas
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExport} className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Abertos</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.open}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando atendimento</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Em Atendimento</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground mt-1">Sendo resolvidos</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.closed}</div>
            <p className="text-xs text-muted-foreground mt-1">Total resolvidos</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-info hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alta Prioridade</CardTitle>
            <AlertCircle className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats.highPriority}</div>
            <p className="text-xs text-muted-foreground mt-1">Urgentes</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList>
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat Interno
            {stats.open > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.open}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">Todos os Tickets</TabsTrigger>
          <TabsTrigger value="open">
            Abertos
            {stats.open > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.open}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="in_progress">Em Atendimento</TabsTrigger>
          <TabsTrigger value="closed">Fechados</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-0">
          <Card className="h-[calc(100vh-200px)] flex flex-col overflow-hidden">
            <CardHeader className="border-b pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Chat Interno de Suporte</CardTitle>
                  <CardDescription className="text-xs">
                    Comunicação direta com as clínicas
                    {chatTickets.length > 0 && ` • ${chatTickets.length} conversa${chatTickets.length !== 1 ? 's' : ''}`}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allChatTickets = chatService.getAllChatTickets();
                    setTickets((prev) => {
                      const updatedMap = new Map(allChatTickets.map(t => [t.id, t]));
                      const updated = prev.map(t => updatedMap.get(t.id) || t);
                      const existingIds = new Set(prev.map(t => t.id));
                      const newTickets = allChatTickets.filter(t => !existingIds.has(t.id));
                      
                      if (newTickets.length > 0) {
                        toast.info(`${newTickets.length} novo(s) chat(s)`);
                        return [...newTickets, ...updated];
                      }
                      
                      const hasUpdates = updated.some((t, i) => {
                        const original = prev[i];
                        return !original || t.lastUpdate !== original.lastUpdate || 
                               t.messages.length !== original.messages.length;
                      });
                      
                      if (hasUpdates) {
                        toast.info("Chats atualizados");
                      }
                      
                      return updated;
                    });
                    
                    if (selectedTicket && selectedTicket.id.startsWith('CHAT-')) {
                      const updatedTicket = allChatTickets.find(t => t.id === selectedTicket.id);
                      if (updatedTicket) {
                        setSelectedTicket(updatedTicket);
                      }
                    }
                  }}
                  className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 h-8"
                >
                  <MessageSquare className="h-3 w-3 mr-1.5" />
                  <span className="text-xs">Atualizar</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex gap-0 p-0 overflow-hidden">
              {/* Lista de Conversas - Estilo WhatsApp */}
              <div className={`w-full sm:w-80 border-r bg-muted/30 flex flex-col transition-all ${
                selectedTicket ? 'hidden sm:flex' : 'flex'
              }`}>
                <div className="p-3 border-b bg-background">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar conversas..."
                      className="pl-9 h-9 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  {chatTickets.length === 0 ? (
                    <div className="text-center py-12 px-4 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm font-medium">Nenhum chat ativo</p>
                      <p className="text-xs mt-2">Quando clínicas iniciarem conversas, elas aparecerão aqui.</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {chatTickets.map((ticket) => {
                        const lastMessage = ticket.messages[ticket.messages.length - 1];
                        const isUnread = ticket.status === "open" && lastMessage && !lastMessage.isAdmin;
                        const isSelected = selectedTicket?.id === ticket.id;
                        
                        return (
                          <div
                            key={ticket.id}
                            className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                              isSelected ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                            } ${isUnread ? 'bg-primary/5' : ''}`}
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setReplyText("");
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex h-12 w-12 items-center justify-center rounded-full flex-shrink-0 ${
                                isUnread ? 'bg-primary/20' : 'bg-primary/10'
                              }`}>
                                <MessageSquare className={`h-6 w-6 ${isUnread ? 'text-primary' : 'text-primary/70'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="font-semibold text-sm truncate">{ticket.clinic}</p>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                    {new Date(ticket.lastUpdate).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                {lastMessage && (
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-muted-foreground truncate flex-1">
                                      {lastMessage.isAdmin ? 'Você: ' : ''}{lastMessage.message}
                                    </p>
                                    {isUnread && (
                                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0"></div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Área de Chat - Estilo WhatsApp */}
              {selectedTicket ? (
                <div className="flex-1 flex flex-col bg-[#e5ddd5] bg-opacity-30 min-w-0">
                  {/* Header do Chat */}
                  <div className="bg-background border-b p-3 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{selectedTicket.clinic}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedTicket.messages.length} mensagem{selectedTicket.messages.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {selectedTicket.status !== "closed" && (
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedTicket.priority}
                          onValueChange={(value: "high" | "medium" | "low") => handleChangePriority(selectedTicket.id, value)}
                        >
                          <SelectTrigger className="w-[100px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="low">Baixa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Mensagens */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-2">
                      {selectedTicket.messages.map((msg, index) => {
                        const isAdmin = msg.isAdmin;
                        const showDateSeparator = index === 0 || 
                          new Date(msg.timestamp).toDateString() !== 
                          new Date(selectedTicket.messages[index - 1].timestamp).toDateString();
                        
                        return (
                          <div key={index}>
                            {showDateSeparator && (
                              <div className="flex justify-center my-4">
                                <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full">
                                  {new Date(msg.timestamp).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}
                            <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-1`}>
                              <div className={`max-w-[75%] sm:max-w-[60%] ${isAdmin ? 'order-2' : 'order-1'}`}>
                                <div className={`rounded-2xl px-4 py-2 ${
                                  isAdmin 
                                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                                    : 'bg-white text-foreground rounded-tl-sm shadow-sm'
                                }`}>
                                  {!isAdmin && (
                                    <p className="text-xs font-semibold mb-1 opacity-80">{msg.author}</p>
                                  )}
                                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                  <div className={`flex justify-end gap-1 mt-1 ${
                                    isAdmin ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                  }`}>
                                    <span className="text-[10px]">
                                      {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                    {isAdmin && (
                                      <span className="text-[10px]">✓✓</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Input de Mensagem */}
                  {selectedTicket.status !== "closed" && (
                    <div className="bg-background border-t p-3 flex-shrink-0">
                      <div className="flex items-end gap-2">
                        <Textarea
                          placeholder="Digite uma mensagem..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleReply();
                            }
                          }}
                          rows={1}
                          className="resize-none min-h-[40px] max-h-[120px] text-sm"
                        />
                        <Button
                          onClick={handleReply}
                          disabled={!replyText.trim()}
                          className="bg-primary hover:bg-primary/90 h-10 w-10 p-0 flex-shrink-0"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-muted/20">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Selecione uma conversa</p>
                    <p className="text-sm mt-2">Escolha uma conversa da lista para começar a conversar</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tickets de Suporte</CardTitle>
                  <CardDescription>
                    {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} encontrado{filteredTickets.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas Prioridades</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Status</SelectItem>
                      <SelectItem value="open">Abertos</SelectItem>
                      <SelectItem value="in_progress">Em Atendimento</SelectItem>
                      <SelectItem value="closed">Fechados</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar ticket..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Clínica</TableHead>
                    <TableHead className="font-semibold">Assunto</TableHead>
                    <TableHead className="font-semibold">Prioridade</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Atribuído</TableHead>
                    <TableHead className="font-semibold">Criado em</TableHead>
                    <TableHead className="font-semibold text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAllTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhum ticket encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAllTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="hover:bg-muted/30 border-b">
                        <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                        <TableCell className="font-medium">{ticket.clinic}</TableCell>
                        <TableCell>{ticket.subject}</TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell>
                          {ticket.assignedTo ? (
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span className="text-sm">{ticket.assignedTo}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Não atribuído</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewTicket(ticket)}
                              className="h-8 w-8"
                              title="Ver Detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {ticket.status !== "closed" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCloseTicket(ticket)}
                                className="h-8 w-8 text-green-600 hover:text-green-700"
                                title="Fechar Ticket"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {filteredTickets.length > 0 && (
              <div className="px-6 pb-4">
                <StandardPagination
                  currentPage={currentPageAll}
                  totalPages={totalPagesAll}
                  totalItems={filteredTickets.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPageAll}
                  itemLabel="ticket(s)"
                />
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="open" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tickets Abertos</CardTitle>
                  <CardDescription>
                    {openTickets.length} ticket{openTickets.length !== 1 ? 's' : ''} aberto{openTickets.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {openTickets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum ticket aberto
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">ID</TableHead>
                        <TableHead className="font-semibold">Clínica</TableHead>
                        <TableHead className="font-semibold">Assunto</TableHead>
                        <TableHead className="font-semibold">Prioridade</TableHead>
                        <TableHead className="font-semibold">Atribuído</TableHead>
                        <TableHead className="font-semibold">Criado em</TableHead>
                        <TableHead className="font-semibold text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedOpenTickets.map((ticket) => (
                        <TableRow key={ticket.id} className="hover:bg-muted/30 border-b">
                          <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                          <TableCell className="font-medium">{ticket.clinic}</TableCell>
                          <TableCell>{ticket.subject}</TableCell>
                          <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                          <TableCell>
                            {ticket.assignedTo ? (
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                <span className="text-sm">{ticket.assignedTo}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Não atribuído</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewTicket(ticket)}
                                className="h-8 w-8"
                                title="Ver Detalhes"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCloseTicket(ticket)}
                                className="h-8 w-8 text-green-600 hover:text-green-700"
                                title="Fechar Ticket"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="px-6 pb-4 pt-4">
                    <StandardPagination
                      currentPage={currentPageOpen}
                      totalPages={totalPagesOpen}
                      totalItems={openTickets.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPageOpen}
                      itemLabel="ticket(s)"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tickets Em Atendimento</CardTitle>
                  <CardDescription>
                    {inProgressTickets.length} ticket{inProgressTickets.length !== 1 ? 's' : ''} em atendimento
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {inProgressTickets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum ticket em atendimento
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">ID</TableHead>
                        <TableHead className="font-semibold">Clínica</TableHead>
                        <TableHead className="font-semibold">Assunto</TableHead>
                        <TableHead className="font-semibold">Prioridade</TableHead>
                        <TableHead className="font-semibold">Atribuído</TableHead>
                        <TableHead className="font-semibold">Criado em</TableHead>
                        <TableHead className="font-semibold text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedInProgressTickets.map((ticket) => (
                        <TableRow key={ticket.id} className="hover:bg-muted/30 border-b">
                          <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                          <TableCell className="font-medium">{ticket.clinic}</TableCell>
                          <TableCell>{ticket.subject}</TableCell>
                          <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                          <TableCell>
                            {ticket.assignedTo ? (
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                <span className="text-sm">{ticket.assignedTo}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Não atribuído</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewTicket(ticket)}
                                className="h-8 w-8"
                                title="Ver Detalhes"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCloseTicket(ticket)}
                                className="h-8 w-8 text-green-600 hover:text-green-700"
                                title="Fechar Ticket"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="px-6 pb-4 pt-4">
                    <StandardPagination
                      currentPage={currentPageInProgress}
                      totalPages={totalPagesInProgress}
                      totalItems={inProgressTickets.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPageInProgress}
                      itemLabel="ticket(s)"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closed" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tickets Fechados</CardTitle>
                  <CardDescription>
                    {closedTickets.length} ticket{closedTickets.length !== 1 ? 's' : ''} fechado{closedTickets.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {closedTickets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum ticket fechado
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">ID</TableHead>
                        <TableHead className="font-semibold">Clínica</TableHead>
                        <TableHead className="font-semibold">Assunto</TableHead>
                        <TableHead className="font-semibold">Prioridade</TableHead>
                        <TableHead className="font-semibold">Atribuído</TableHead>
                        <TableHead className="font-semibold">Criado em</TableHead>
                        <TableHead className="font-semibold text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedClosedTickets.map((ticket) => (
                        <TableRow key={ticket.id} className="hover:bg-muted/30 border-b">
                          <TableCell className="font-mono text-sm">{ticket.id}</TableCell>
                          <TableCell className="font-medium">{ticket.clinic}</TableCell>
                          <TableCell>{ticket.subject}</TableCell>
                          <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                          <TableCell>
                            {ticket.assignedTo ? (
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                <span className="text-sm">{ticket.assignedTo}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Não atribuído</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewTicket(ticket)}
                                className="h-8 w-8"
                                title="Ver Detalhes"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="px-6 pb-4 pt-4">
                    <StandardPagination
                      currentPage={currentPageClosed}
                      totalPages={totalPagesClosed}
                      totalItems={closedTickets.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPageClosed}
                      itemLabel="ticket(s)"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Details Dialog */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-base sm:text-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="break-words">Ticket {selectedTicket?.id}</span>
              </div>
              {selectedTicket?.clinic && (
                <span className="text-sm sm:text-base text-muted-foreground sm:ml-2">
                  - {selectedTicket.clinic}
                </span>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm mt-1 break-words">
              {selectedTicket?.subject}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-3 sm:space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {getPriorityBadge(selectedTicket.priority)}
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="break-words">
                      Criado em: {new Date(selectedTicket.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  {selectedTicket.assignedTo && (
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="break-words">Atribuído para: {selectedTicket.assignedTo}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Priority and Assignment Controls */}
              {selectedTicket.status !== "closed" && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-2 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Label className="text-xs sm:text-sm whitespace-nowrap">Alterar Prioridade:</Label>
                    <Select
                      value={selectedTicket.priority}
                      onValueChange={(value: "high" | "medium" | "low") => handleChangePriority(selectedTicket.id, value)}
                    >
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {!selectedTicket.assignedTo && (
                    <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-4">
                      <Label className="text-xs sm:text-sm whitespace-nowrap">Atribuir para:</Label>
                      <Select
                        onValueChange={(value) => handleAssignTicket(selectedTicket.id, value)}
                      >
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Suporte CactoSaude">Suporte CactoSaude</SelectItem>
                          <SelectItem value="Admin Sistema">Admin Sistema</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              <ScrollArea className="h-[300px] sm:h-[400px] border rounded-lg p-3 sm:p-4">
                <div className="space-y-3">
                  {selectedTicket.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-2 sm:p-3 rounded-lg ${
                        msg.isAdmin
                          ? "bg-primary/10 sm:ml-8 ml-4 border border-primary/20"
                          : "bg-muted sm:mr-8 mr-4"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 mb-1">
                        <p className={`font-medium text-xs sm:text-sm ${msg.isAdmin ? 'text-primary' : ''}`}>
                          {msg.author}
                        </p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(msg.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {selectedTicket.status !== "closed" && (
                <div className="space-y-2">
                  <Label className="text-sm">Responder</Label>
                  <Textarea
                    placeholder="Digite sua resposta..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    className="text-sm resize-none"
                  />
                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setTicketDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Fechar
                    </Button>
                    <Button 
                      onClick={handleReply} 
                      className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Enviar Resposta
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSuporte;
