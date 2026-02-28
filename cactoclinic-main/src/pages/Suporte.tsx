import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HelpCircle, MessageSquare, Phone, Mail, Send, Book, Video, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ChatWidget } from "@/components/ChatWidget";
import { useChat } from "@/contexts/ChatContext";

const Suporte = () => {
  const [open, setOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketDetailsOpen, setTicketDetailsOpen] = useState(false);
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const [deleteTicketDialogOpen, setDeleteTicketDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [selectedFaq, setSelectedFaq] = useState<string | null>(null);
  const { openChat } = useChat();

  const faqs = [
    {
      question: "Como faço para agendar uma consulta?",
      answer: "Acesse o menu 'Agendamentos', clique em 'Novo Agendamento', selecione o paciente, profissional, data e horário desejados. O sistema automaticamente notificará o paciente via SMS/email."
    },
    {
      question: "Como adicionar um novo paciente ao sistema?",
      answer: "Vá até o menu 'Pacientes', clique em 'Novo Paciente' e preencha os dados pessoais, de contato e informações médicas necessárias. O sistema oferece abas para organizar melhor as informações: Dados Pessoais, Histórico, Financeiro e Documentos."
    },
    {
      question: "Como fazer uma consulta online?",
      answer: "Na tela de 'Consulta', selecione o tipo 'Online', escolha um paciente e clique em 'Videochamada'. O sistema oferece opções de modal ou inline, permitindo navegar pelas abas durante a consulta."
    },
    {
      question: "Como registrar um pagamento?",
      answer: "Acesse o menu 'Pagamentos', clique em 'Registrar Pagamento', selecione o paciente e serviço, informe o valor e forma de pagamento. O sistema permite parcelamento e geração automática de recibos."
    },
    {
      question: "Como controlar o estoque de materiais?",
      answer: "No menu 'Estoque', você pode adicionar itens, definir quantidades mínimas e registrar entradas/saídas. O sistema alertará automaticamente quando o estoque estiver baixo ou crítico."
    },
    {
      question: "Como assinar documentos digitalmente?",
      answer: "Na aba 'Prescrição', clique em 'Assinar Documento', desenhe sua assinatura no campo fornecido usando o mouse ou o dedo (em dispositivos touch) e confirme. A assinatura será salva automaticamente."
    },
    {
      question: "Como configurar permissões de usuários?",
      answer: "No menu 'Configurações', acesse a aba 'Gestão de Permissões' e selecione o nível de acesso (Admin, Médico, Recepcionista ou Financeiro). Cada nível possui permissões específicas pré-configuradas."
    },
    {
      question: "Como usar a transcrição de áudio durante a consulta?",
      answer: "Durante o preenchimento dos campos de texto na consulta, clique no botão 'Transcrever Áudio' ao lado do campo. Permita o acesso ao microfone quando solicitado pelo navegador. O texto será automaticamente inserido no campo selecionado conforme você fala."
    },
    {
      question: "Como baixar o prontuário em PDF?",
      answer: "Na aba 'Histórico' da consulta, clique em 'Ver Prontuário' na consulta desejada. No dialog que abrir, clique no botão 'Baixar Prontuário (PDF)' no rodapé. O arquivo PDF será gerado e baixado automaticamente com todas as informações da consulta."
    },
    {
      question: "Como remarcar um agendamento?",
      answer: "Acesse o menu 'Agendamentos', encontre o agendamento desejado e clique no botão 'Remarcar Agendamento'. Selecione a nova data e horário disponíveis. O sistema enviará uma notificação ao paciente sobre a remarcação."
    },
  ];

  const [tickets, setTickets] = useState([
    { id: "#TK-001", title: "Problema no agendamento", status: "open", priority: "high", date: "15/01/2024" },
    { id: "#TK-002", title: "Dúvida sobre relatórios", status: "pending", priority: "medium", date: "14/01/2024" },
    { id: "#TK-003", title: "Erro ao imprimir receita", status: "closed", priority: "low", date: "12/01/2024" },
    { id: "#TK-004", title: "Dificuldade ao cadastrar paciente", status: "closed", priority: "medium", date: "10/01/2024" },
    { id: "#TK-005", title: "Consulta online não está funcionando", status: "open", priority: "high", date: "08/01/2024" },
    { id: "#TK-006", title: "Como configurar permissões de usuário", status: "closed", priority: "low", date: "05/01/2024" },
    { id: "#TK-007", title: "Erro ao gerar relatório financeiro", status: "pending", priority: "medium", date: "03/01/2024" },
    { id: "#TK-008", title: "Dúvida sobre controle de estoque", status: "closed", priority: "low", date: "28/12/2023" },
    { id: "#TK-009", title: "Problema com assinatura digital", status: "closed", priority: "medium", date: "25/12/2023" },
    { id: "#TK-010", title: "Sistema lento ao carregar pacientes", status: "open", priority: "high", date: "20/12/2023" },
    { id: "#TK-011", title: "Como exportar dados para Excel", status: "closed", priority: "low", date: "18/12/2023" },
    { id: "#TK-012", title: "Erro ao anexar documentos", status: "closed", priority: "medium", date: "15/12/2023" },
  ]);

  const handleDeleteTicket = (ticketId: string) => {
    setTicketToDelete(ticketId);
    setDeleteTicketDialogOpen(true);
  };

  const handleConfirmDeleteTicket = () => {
    if (ticketToDelete) {
      setTickets(prev => prev.filter(ticket => ticket.id !== ticketToDelete));
      setDeleteTicketDialogOpen(false);
      setTicketToDelete(null);
      toast.success("Chamado excluído com sucesso!");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      open: { label: "Aberto", className: "bg-success/10 text-success" },
      pending: { label: "Pendente", className: "bg-warning/10 text-warning" },
      closed: { label: "Fechado", className: "bg-muted text-muted-foreground" },
    };
    const variant = variants[status as keyof typeof variants];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: { label: "Alta", className: "bg-destructive/10 text-destructive" },
      medium: { label: "Média", className: "bg-warning/10 text-warning" },
      low: { label: "Baixa", className: "bg-info/10 text-info" },
    };
    const variant = variants[priority as keyof typeof variants];
    return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <TooltipProvider>
    <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2 sm:gap-3">
          <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Suporte</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Central de ajuda e suporte técnico
            </p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <MessageSquare className="mr-2 h-4 w-4" />
              Abrir Chamado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Novo Chamado de Suporte</DialogTitle>
              <DialogDescription>
                Descreva seu problema ou dúvida que entraremos em contato
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input id="subject" placeholder="Título do problema" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Problema Técnico</SelectItem>
                    <SelectItem value="doubt">Dúvida</SelectItem>
                    <SelectItem value="suggestion">Sugestão</SelectItem>
                    <SelectItem value="billing">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta - Urgente</SelectItem>
                    <SelectItem value="medium">Média - Normal</SelectItem>
                    <SelectItem value="low">Baixa - Pode aguardar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva detalhadamente o problema..."
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                toast.success("Chamado aberto com sucesso! Nossa equipe entrará em contato em breve.");
                setOpen(false);
              }}>
                <Send className="mr-2 h-4 w-4" />
                Enviar Chamado
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Telefone</h3>
            <p className="text-muted-foreground mb-3">Ligue para nossa central</p>
            <p className="font-semibold text-primary">(11) 4000-0000</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Email</h3>
            <p className="text-muted-foreground mb-3">Envie sua mensagem</p>
            <p className="font-semibold text-primary">suporte@CactoSaude.com</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Chat Online</h3>
            <p className="text-muted-foreground mb-3">Fale com nosso time</p>
            <Button 
              variant="default"
              size="sm" 
              className="mt-1 bg-primary hover:bg-primary/90 text-white"
              onClick={() => {
                openChat();
                toast.info("Chat de suporte aberto!");
              }}
            >
              Iniciar Chat
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Perguntas Frequentes
            </CardTitle>
            <CardDescription>Respostas rápidas para dúvidas comuns</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion 
              type="single" 
              collapsible 
              className="w-full"
              value={selectedFaq ?? undefined}
              onValueChange={(value) => {
                setSelectedFaq(value ?? null);
              }}
            >
              {faqs.map((faq, index) => {
                const itemValue = `item-${index}`;
                const isSelected = selectedFaq === itemValue;
                return (
                  <AccordionItem 
                    key={index} 
                    value={itemValue}
                    className={isSelected ? "bg-primary/5 rounded-lg px-3" : ""}
                  >
                    <AccordionTrigger 
                      className={`text-left ${isSelected ? "text-primary font-semibold" : ""}`}
                    >
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meus Chamados</CardTitle>
              <CardDescription>Acompanhe seus tickets de suporte</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {tickets.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-16 w-16 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">Nenhum chamado encontrado</p>
                      <p className="text-xs mt-1">Seus chamados de suporte aparecerão aqui</p>
                    </div>
                  ) : (
                    tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-semibold">{ticket.id}</span>
                            {getStatusBadge(ticket.status)}
                            {getPriorityBadge(ticket.priority)}
                          </div>
                          <p className="font-medium">{ticket.title}</p>
                          <p className="text-sm text-muted-foreground">{ticket.date}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 hover:text-purple-600 border-purple-500/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicket(ticket);
                              setTicketDetailsOpen(true);
                            }}
                          >
                            Ver Detalhes
                          </Button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 w-8 p-0 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTicket(ticket.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir chamado</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                Recursos Úteis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  window.open("https://www.youtube.com/@CactoSaude", "_blank");
                  toast.info("Abrindo tutoriais em vídeo...");
                }}
              >
                <Video className="mr-2 h-4 w-4" />
                Tutoriais em Vídeo
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  window.open("https://docs.CactoSaude.com", "_blank");
                  toast.info("Abrindo documentação completa...");
                }}
              >
                <Book className="mr-2 h-4 w-4" />
                Documentação Completa
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  setQuickStartOpen(true);
                }}
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Guia de Início Rápido
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Detalhes do Ticket */}
      <Dialog open={ticketDetailsOpen} onOpenChange={setTicketDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Detalhes do Chamado
            </DialogTitle>
            <DialogDescription>
              Informações completas sobre o ticket de suporte
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <Label className="text-xs text-muted-foreground">ID do Chamado</Label>
                    <p className="font-mono font-semibold text-sm mt-1">{selectedTicket.id}</p>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(selectedTicket.status)}
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs text-muted-foreground">Título</Label>
                  <p className="font-semibold text-sm">{selectedTicket.title}</p>
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs text-muted-foreground">Data de Abertura</Label>
                  <p className="text-sm">{selectedTicket.date}</p>
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedTicket.status)}
                    <span className="text-xs text-muted-foreground">
                      {selectedTicket.status === 'open' && 'Chamado em andamento'}
                      {selectedTicket.status === 'pending' && 'Aguardando resposta'}
                      {selectedTicket.status === 'closed' && 'Chamado finalizado'}
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs text-muted-foreground">Prioridade</Label>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(selectedTicket.priority)}
                    <span className="text-xs text-muted-foreground">
                      {selectedTicket.priority === 'high' && 'Resposta urgente necessária'}
                      {selectedTicket.priority === 'medium' && 'Resposta em até 24h'}
                      {selectedTicket.priority === 'low' && 'Resposta em até 48h'}
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs text-muted-foreground">Descrição</Label>
                  <div className="p-3 rounded-lg bg-muted/30 border">
                    <p className="text-sm text-muted-foreground">
                      {selectedTicket.id === '#TK-001' && 'Estou tendo dificuldades para agendar uma consulta. O sistema não está permitindo selecionar alguns horários disponíveis.'}
                      {selectedTicket.id === '#TK-002' && 'Gostaria de saber como gerar relatórios financeiros detalhados para o mês anterior.'}
                      {selectedTicket.id === '#TK-003' && 'Ao tentar imprimir uma receita, o sistema está gerando um documento em branco. Preciso de ajuda urgente.'}
                      {selectedTicket.id === '#TK-004' && 'Encontrei problemas ao tentar cadastrar um novo paciente. Os campos não estão salvando corretamente.'}
                      {selectedTicket.id === '#TK-005' && 'A videochamada não está iniciando quando seleciono a opção online. O sistema fica carregando indefinidamente.'}
                      {selectedTicket.id === '#TK-006' && 'Preciso de orientação sobre como configurar os níveis de permissão para diferentes usuários do sistema.'}
                      {selectedTicket.id === '#TK-007' && 'Ao tentar gerar um relatório financeiro, o sistema apresenta erro e não consegue finalizar a exportação.'}
                      {selectedTicket.id === '#TK-008' && 'Tenho dúvidas sobre como registrar entradas e saídas de estoque corretamente.'}
                      {selectedTicket.id === '#TK-009' && 'A assinatura digital não está sendo salva após eu desenhar e confirmar.'}
                      {selectedTicket.id === '#TK-010' && 'O sistema está muito lento ao carregar a lista de pacientes, especialmente quando há muitos registros.'}
                      {selectedTicket.id === '#TK-011' && 'Gostaria de saber como exportar os dados dos pacientes para um arquivo Excel.'}
                      {selectedTicket.id === '#TK-012' && 'Não consigo anexar documentos aos pacientes. O upload fica travado em 0%.'}
                      {!['#TK-001', '#TK-002', '#TK-003', '#TK-004', '#TK-005', '#TK-006', '#TK-007', '#TK-008', '#TK-009', '#TK-010', '#TK-011', '#TK-012'].includes(selectedTicket.id) && 'Descrição do chamado não disponível.'}
                    </p>
                  </div>
                </div>

                {selectedTicket.status === 'open' && (
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
                      <p className="text-xs font-semibold text-success">Chamado em atendimento</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Nossa equipe está analisando seu chamado e entrará em contato em breve.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTicketDetailsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Guia de Início Rápido */}
      <Dialog open={quickStartOpen} onOpenChange={setQuickStartOpen}>
        <DialogContent className="sm:max-w-[700px] w-[95vw] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <HelpCircle className="h-5 w-5 text-primary" />
              Guia de Início Rápido
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Passos essenciais para começar a usar o sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex gap-3 sm:gap-4">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs sm:text-sm flex-shrink-0">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm mb-1">Cadastre seus Pacientes</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Acesse o menu <strong>Pacientes</strong> e clique em <strong>Novo Paciente</strong>. 
                    Preencha os dados pessoais, informações médicas e anexe documentos importantes.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs sm:text-sm flex-shrink-0">
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm mb-1">Configure sua Agenda</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Vá até <strong>Agenda Profissional</strong> e defina seus horários de atendimento, 
                    dias da semana e intervalos. Isso sincronizará automaticamente com os agendamentos.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs sm:text-sm flex-shrink-0">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm mb-1">Agende Consultas</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    No menu <strong>Agendamentos</strong>, clique em <strong>Novo Agendamento</strong> e 
                    selecione paciente, profissional, data e horário. O sistema enviará notificações automaticamente.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs sm:text-sm flex-shrink-0">
                  4
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm mb-1">Realize Consultas</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Na tela de <strong>Consulta</strong>, selecione o paciente e preencha os dados clínicos. 
                    Use a transcrição de áudio para agilizar o preenchimento e assine documentos digitalmente.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs sm:text-sm flex-shrink-0">
                  5
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm mb-1">Registre Pagamentos</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Acesse <strong>Pagamentos</strong> e registre os valores recebidos. O sistema permite 
                    parcelamento, múltiplas formas de pagamento e geração automática de recibos.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs sm:text-sm flex-shrink-0">
                  6
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm mb-1">Gerencie Estoque</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    No menu <strong>Estoque</strong>, cadastre produtos, defina quantidades mínimas e 
                    registre entradas/saídas. O sistema alertará quando o estoque estiver baixo.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-2 sm:gap-3">
                <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs sm:text-sm mb-1">Dica Importante</p>
                  <p className="text-xs text-muted-foreground">
                    Use a barra de busca no topo de cada tela para encontrar rapidamente pacientes, 
                    agendamentos ou itens. O sistema também oferece filtros avançados para facilitar sua navegação.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão de Chamado */}
      <AlertDialog open={deleteTicketDialogOpen} onOpenChange={setDeleteTicketDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o chamado "{tickets.find(t => t.id === ticketToDelete)?.title}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTicketToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeleteTicket}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Chamado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Chat Widget - sempre renderizado, controlado pelo contexto global */}
    </div>
    </TooltipProvider>
  );
};

export default Suporte;
