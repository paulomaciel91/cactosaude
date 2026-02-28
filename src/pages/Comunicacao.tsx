import { useState, useMemo } from "react";
import { MessageSquare, ExternalLink, Megaphone, Send, Users, Calendar, CheckCircle2, FileText, Clock, Search, Filter, Eye, X, Sparkles, Target, TrendingUp, Mail, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Campaign {
  id: string;
  title: string;
  message: string;
  recipients: string[];
  sentAt: string;
  scheduledFor?: string;
  status: "enviada" | "agendada";
  templateId?: string;
  channel?: "email" | "sms" | "whatsapp" | "todos";
}

interface CampaignTemplate {
  id: string;
  name: string;
  category: string;
  title: string;
  message: string;
  icon: React.ReactNode;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  healthInsurance?: string;
  lastConsultation?: string;
}

const Comunicacao = () => {
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [patientFilter, setPatientFilter] = useState<string>("todos");
  const [searchPatient, setSearchPatient] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [campaignChannel, setCampaignChannel] = useState<"email" | "sms" | "whatsapp" | "todos">("todos");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [campaignFilter, setCampaignFilter] = useState<string>("todos");
  const [searchCampaign, setSearchCampaign] = useState("");

  // Templates de campanhas
  const campaignTemplates: CampaignTemplate[] = [
    {
      id: "checkup-anual",
      name: "Check-up Anual",
      category: "Preventivo",
      title: "Promoção: Check-up Anual Completo",
      message: `Olá {{nome}},

Estamos com uma promoção especial para o seu check-up anual!

📅 Agende sua consulta e garanta:
✅ Exames completos com desconto
✅ Avaliação médica detalhada
✅ Plano de saúde personalizado

Entre em contato conosco para agendar:
📞 (11) 1234-5678
📧 contato@clinica.com.br

Não deixe sua saúde para depois!`,
      icon: <Target className="h-4 w-4" />
    },
    {
      id: "lembrete-consulta",
      name: "Lembrete de Consulta",
      category: "Lembretes",
      title: "Lembrete: Sua consulta está agendada",
      message: `Olá {{nome}},

Este é um lembrete de que você tem uma consulta agendada conosco.

📅 Data: {{data}}
🕐 Horário: {{hora}}
👨‍⚕️ Profissional: {{profissional}}

Por favor, confirme sua presença ou entre em contato caso precise reagendar.

Aguardamos você!`,
      icon: <Calendar className="h-4 w-4" />
    },
    {
      id: "promocao-exames",
      name: "Promoção de Exames",
      category: "Promoções",
      title: "Promoção Especial: Pacote de Exames",
      message: `Olá {{nome}},

Temos uma promoção imperdível para você!

🎉 Pacote de Exames com até 30% de desconto
📋 Inclui: Hemograma, Glicemia, Colesterol e mais

Válido até o final do mês. Agende já!

📞 (11) 1234-5678
💻 www.clinica.com.br/agendamento

Cuide da sua saúde com economia!`,
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      id: "promocao-consulta-desconto",
      name: "Desconto em Consultas",
      category: "Promoções",
      title: "Promoção: 20% OFF em Consultas",
      message: `Olá {{nome}},

Que tal cuidar da sua saúde com economia?

🎯 Promoção Especial: 20% de desconto em consultas
📅 Válido para agendamentos até o final do mês
👨‍⚕️ Válido para todas as especialidades

Não perca essa oportunidade! Agende sua consulta:

📞 (11) 1234-5678
💻 www.clinica.com.br/agendamento
📧 contato@clinica.com.br

Sua saúde em primeiro lugar! 💚`,
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      id: "promocao-pacote-anual",
      name: "Pacote Anual de Saúde",
      category: "Promoções",
      title: "Pacote Anual de Saúde - Economia Garantida!",
      message: `Olá {{nome}},

Invista na sua saúde com nosso Pacote Anual!

💎 Benefícios do Pacote:
✅ 4 consultas por ano com desconto
✅ 2 check-ups completos incluídos
✅ Desconto em exames laboratoriais
✅ Acompanhamento personalizado

💰 Economia de até R$ 1.500,00 por ano!

Agende uma consulta para conhecer o pacote:
📞 (11) 1234-5678

Cuide da sua saúde o ano todo! 💚`,
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      id: "promocao-procedimentos-esteticos",
      name: "Promoção Procedimentos Estéticos",
      category: "Promoções",
      title: "Promoção: Procedimentos Estéticos",
      message: `Olá {{nome}},

Cuide da sua beleza e autoestima!

✨ Promoção Especial em Procedimentos Estéticos:
- Toxina Botulínica: 15% OFF
- Preenchimento Facial: 20% OFF
- Limpeza de Pele: 30% OFF
- Tratamentos Faciais: Pacotes com desconto

🎁 Agendando 2 procedimentos, ganhe 1 sessão de hidratação!

Agende sua avaliação:
📞 (11) 1234-5678
💻 www.clinica.com.br/estetica

Realce sua beleza natural! ✨`,
      icon: <Sparkles className="h-4 w-4" />
    },
    {
      id: "promocao-familia",
      name: "Promoção Família",
      category: "Promoções",
      title: "Promoção Família: Desconto Especial",
      message: `Olá {{nome}},

Pensando na saúde de toda sua família!

👨‍👩‍👧‍👦 Promoção Família:
✅ Desconto progressivo por membro da família
✅ 2ª pessoa: 10% OFF
✅ 3ª pessoa: 15% OFF
✅ 4ª pessoa ou mais: 20% OFF

Válido para consultas e exames agendados juntos.

Traga sua família e cuide da saúde de quem você ama!

📞 (11) 1234-5678
💻 www.clinica.com.br/agendamento

Sua família merece o melhor cuidado! 💚`,
      icon: <Users className="h-4 w-4" />
    },
    {
      id: "promocao-black-friday",
      name: "Black Friday Saúde",
      category: "Promoções",
      title: "Black Friday: Ofertas Imperdíveis!",
      message: `Olá {{nome}},

Black Friday chegou! Aproveite ofertas exclusivas!

🛍️ OFERTAS ESPECIAIS:
🔥 Consultas: 30% OFF
🔥 Check-up Completo: 40% OFF
🔥 Pacote de Exames: 35% OFF
🔥 Procedimentos Estéticos: 25% OFF

⚡ Válido apenas nos dias 24, 25 e 26 de novembro!

Não perca essa oportunidade única de cuidar da sua saúde com economia!

📞 (11) 1234-5678
💻 www.clinica.com.br/blackfriday

Corra e garante já sua promoção! 🎉`,
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      id: "promocao-fim-ano",
      name: "Promoção Fim de Ano",
      category: "Promoções",
      title: "Encerre o Ano Cuidando da Sua Saúde!",
      message: `Olá {{nome}},

Que tal começar o próximo ano com saúde em dia?

🎄 Promoção Fim de Ano:
✅ Check-up Completo: 25% OFF
✅ Consultas de Especialidades: 20% OFF
✅ Pacote Preventivo: 30% OFF

📅 Válido até 31 de dezembro

Faça seus exames de rotina e garanta um ano novo saudável!

📞 (11) 1234-5678
💻 www.clinica.com.br/agendamento

Cuide da sua saúde antes das festas! 🎉`,
      icon: <Calendar className="h-4 w-4" />
    },
    {
      id: "promocao-indicacao",
      name: "Indique e Ganhe",
      category: "Promoções",
      title: "Indique um Amigo e Ganhe Desconto!",
      message: `Olá {{nome}},

Indique nossa clínica para um amigo e ganhe benefícios!

🎁 Programa de Indicação:
✅ Você ganha: 15% OFF na próxima consulta
✅ Seu amigo ganha: 10% OFF na primeira consulta

Como funciona:
1. Indique um amigo ou familiar
2. Ele agenda uma consulta mencionando seu nome
3. Ambos ganham descontos!

Compartilhe saúde e economia com quem você ama!

📞 (11) 1234-5678
💻 www.clinica.com.br/indicacao

Indique e economize! 💚`,
      icon: <Users className="h-4 w-4" />
    },
    {
      id: "campanha-vacinacao",
      name: "Campanha de Vacinação",
      category: "Preventivo",
      title: "Campanha de Vacinação - Proteja-se!",
      message: `Olá {{nome}},

Estamos realizando uma campanha de vacinação!

💉 Vacinas disponíveis:
- Gripe (Influenza)
- COVID-19
- Hepatite B
- Outras vacinas do calendário

Agende sua vacinação e proteja sua saúde e da sua família.

📞 (11) 1234-5678

Vacinar é um ato de amor! 💚`,
      icon: <Target className="h-4 w-4" />
    },
    {
      id: "aniversario",
      name: "Feliz Aniversário",
      category: "Relacionamento",
      title: "Feliz Aniversário! 🎉",
      message: `Olá {{nome}},

Feliz aniversário! 🎂🎉

Desejamos um dia especial repleto de alegria e saúde!

Como presente, oferecemos um desconto especial em qualquer serviço da clínica.

Aproveite e agende sua consulta:
📞 (11) 1234-5678

Muitos anos de vida e saúde! 💚`,
      icon: <Sparkles className="h-4 w-4" />
    },
    {
      id: "retorno-consulta",
      name: "Lembrete de Retorno",
      category: "Lembretes",
      title: "É hora do seu retorno!",
      message: `Olá {{nome}},

É hora de agendar seu retorno!

📅 Sua última consulta foi em: {{ultima_consulta}}
👨‍⚕️ Recomendamos um retorno para acompanhamento

Agende seu retorno e mantenha sua saúde em dia:
📞 (11) 1234-5678

Sua saúde é nossa prioridade! 💚`,
      icon: <Clock className="h-4 w-4" />
    }
  ];

  // Planos de saúde configurados - em produção, isso viria de uma API
  const healthInsurancePlans = [
    "Todos",
    "Particular",
    "Unimed",
    "Bradesco Saúde",
    "SulAmérica",
    "Amil",
    "NotreDame Intermédica",
    "Hapvida",
    "Prevent Senior",
    "Outros"
  ];

  // Mock de pacientes - em produção, isso viria de uma API
  const patients: Patient[] = [
    { id: "1", name: "Maria Silva", email: "maria.silva@email.com", phone: "(11) 98765-4321", healthInsurance: "Unimed", lastConsultation: "2024-01-15" },
    { id: "2", name: "Pedro Costa", email: "pedro.costa@email.com", phone: "(11) 91234-5678", healthInsurance: "Particular", lastConsultation: "2024-01-10" },
    { id: "3", name: "Julia Oliveira", email: "julia.oliveira@email.com", phone: "(11) 99999-8888", healthInsurance: "Bradesco Saúde", lastConsultation: "2024-01-20" },
    { id: "4", name: "Roberto Alves", email: "roberto.alves@email.com", phone: "(11) 98888-7777", healthInsurance: "Unimed", lastConsultation: "2023-12-20" },
    { id: "5", name: "Fernanda Martins", email: "fernanda.martins@email.com", phone: "(11) 97777-6666", healthInsurance: "Particular", lastConsultation: "2024-01-18" },
    { id: "6", name: "Carlos Mendes", email: "carlos.mendes@email.com", phone: "(11) 96666-5555", healthInsurance: "SulAmérica", lastConsultation: "2024-01-12" },
    { id: "7", name: "Ana Paula", email: "ana.paula@email.com", phone: "(11) 95555-4444", healthInsurance: "Amil", lastConsultation: "2024-01-08" },
    { id: "8", name: "Lucas Santos", email: "lucas.santos@email.com", phone: "(11) 94444-3333", healthInsurance: "NotreDame Intermédica", lastConsultation: "2023-12-15" },
  ];

  // Filtrar pacientes
  const filteredPatients = useMemo(() => {
    let filtered = patients;

    // Filtro por plano de saúde
    if (patientFilter && patientFilter !== "todos" && patientFilter !== "sem-consulta-30dias") {
      if (patientFilter === "Outros") {
        // Filtrar planos que não estão na lista principal
        const mainPlans = ["Unimed", "Bradesco Saúde", "SulAmérica", "Amil", "NotreDame Intermédica", "Hapvida", "Prevent Senior", "Particular"];
        filtered = filtered.filter(p => p.healthInsurance && !mainPlans.includes(p.healthInsurance));
      } else {
        filtered = filtered.filter(p => p.healthInsurance === patientFilter);
      }
    } else if (patientFilter === "sem-consulta-30dias") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(p => {
        if (!p.lastConsultation) return true;
        return new Date(p.lastConsultation) < thirtyDaysAgo;
      });
    }

    // Busca por nome/email/telefone
    if (searchPatient) {
      const searchLower = searchPatient.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.email.toLowerCase().includes(searchLower) ||
        p.phone.includes(searchPatient)
      );
    }

    return filtered;
  }, [patientFilter, searchPatient]);

  // Filtrar campanhas
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;

    if (campaignFilter === "enviadas") {
      filtered = filtered.filter(c => c.status === "enviada");
    } else if (campaignFilter === "agendadas") {
      filtered = filtered.filter(c => c.status === "agendada");
    }

    if (searchCampaign) {
      const searchLower = searchCampaign.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchLower) ||
        c.message.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [campaigns, campaignFilter, searchCampaign]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = campaigns.length;
    const enviadas = campaigns.filter(c => c.status === "enviada").length;
    const agendadas = campaigns.filter(c => c.status === "agendada").length;
    const totalRecipients = campaigns.reduce((sum, c) => sum + c.recipients.length, 0);

    return { total, enviadas, agendadas, totalRecipients };
  }, [campaigns]);

  const handleTemplateSelect = (templateId: string) => {
    const template = campaignTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setCampaignTitle(template.title);
      setCampaignMessage(template.message);
      toast.success(`Template "${template.name}" aplicado!`);
    }
  };

  const handlePatientToggle = (patientId: string) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === filteredPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(filteredPatients.map((p) => p.id));
    }
  };

  const handleFilterSelect = (filter: string) => {
    setPatientFilter(filter);
    setSelectedPatients([]);
  };

  const handleSendCampaign = () => {
    if (!campaignTitle.trim()) {
      toast.error("Por favor, preencha o título da campanha");
      return;
    }

    if (!campaignMessage.trim()) {
      toast.error("Por favor, preencha a mensagem da campanha");
      return;
    }

    if (selectedPatients.length === 0) {
      toast.error("Por favor, selecione pelo menos um paciente");
      return;
    }

    const isScheduled = scheduledDate && scheduledTime;
    const scheduledDateTime = isScheduled ? `${scheduledDate} ${scheduledTime}` : undefined;

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      title: campaignTitle,
      message: campaignMessage,
      recipients: selectedPatients,
      sentAt: isScheduled ? "" : new Date().toLocaleString("pt-BR"),
      scheduledFor: scheduledDateTime,
      status: isScheduled ? "agendada" : "enviada",
      templateId: selectedTemplate || undefined,
      channel: campaignChannel,
    };

    setCampaigns([newCampaign, ...campaigns]);
    setCampaignTitle("");
    setCampaignMessage("");
    setSelectedPatients([]);
    setSelectedTemplate("");
    setScheduledDate("");
    setScheduledTime("");
    setCampaignChannel("todos");

    if (isScheduled) {
      toast.success(`Campanha agendada para ${scheduledDateTime} - ${selectedPatients.length} paciente(s)!`);
    } else {
      toast.success(`Campanha enviada para ${selectedPatients.length} paciente(s)!`);
    }
  };

  const getPatientName = (patientId: string) => {
    return patients.find((p) => p.id === patientId)?.name || "Desconhecido";
  };

  const getTemplateName = (templateId?: string) => {
    if (!templateId) return null;
    return campaignTemplates.find(t => t.id === templateId)?.name;
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-baseline gap-3">
          <MessageSquare className="h-8 w-8 text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Comunicação</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Sistema de comunicação integrado
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="cactochat" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="cactochat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            CactoChat
          </TabsTrigger>
          <TabsTrigger value="campanhas" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Campanhas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cactochat" className="space-y-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => window.open("https://chat.cactoai.com", "_blank")}
              size="sm"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir em Nova Aba
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="h-[calc(100vh-300px)] min-h-[600px] rounded-lg overflow-hidden border border-border">
                <iframe
                  src="https://chat.cactoai.com"
                  className="w-full h-full border-0"
                  title="CactoAI Chat"
                  allow="camera; microphone; fullscreen"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campanhas" className="space-y-4">
          {/* Estatísticas */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Total de Campanhas
                  <Megaphone className="h-4 w-4 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Campanhas criadas</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-success">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Enviadas
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{stats.enviadas}</div>
                <p className="text-xs text-muted-foreground mt-1">Campanhas enviadas</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-warning">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Agendadas
                  <Clock className="h-4 w-4 text-warning" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.agendadas}</div>
                <p className="text-xs text-muted-foreground mt-1">Campanhas agendadas</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-info">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Destinatários
                  <Users className="h-4 w-4 text-info" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-info">{stats.totalRecipients}</div>
                <p className="text-xs text-muted-foreground mt-1">Total de envios</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Formulário de Campanha */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Nova Campanha
                </CardTitle>
                <CardDescription>
                  Crie e envie campanhas para seus pacientes de forma rápida e fácil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Templates */}
                <div className="space-y-2">
                  <Label>Usar Template (Opcional)</Label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(
                        campaignTemplates.reduce((acc, template) => {
                          if (!acc[template.category]) acc[template.category] = [];
                          acc[template.category].push(template);
                          return acc;
                        }, {} as Record<string, CampaignTemplate[]>)
                      ).map(([category, templates]) => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{category}</div>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex items-center gap-2">
                                {template.icon}
                                {template.name}
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTemplate("");
                        setCampaignTitle("");
                        setCampaignMessage("");
                      }}
                      className="text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Remover template
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título da Campanha *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Promoção de Check-up Anual"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    placeholder="Digite a mensagem da campanha..."
                    value={campaignMessage}
                    onChange={(e) => setCampaignMessage(e.target.value)}
                    className="min-h-[150px] resize-none"
                  />
                </div>

                {/* Canal de Envio */}
                <div className="space-y-2">
                  <Label>Canal de Envio</Label>
                  <Select value={campaignChannel} onValueChange={(value: any) => setCampaignChannel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          Todos os canais
                        </div>
                      </SelectItem>
                      <SelectItem value="email">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          E-mail
                        </div>
                      </SelectItem>
                      <SelectItem value="whatsapp">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Agendamento */}
                <div className="space-y-2">
                  <Label>Agendar Envio (Opcional)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Seleção de Pacientes */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Selecionar Pacientes *</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAll}
                    >
                      {selectedPatients.length === filteredPatients.length ? "Desmarcar Todos" : "Selecionar Todos"}
                    </Button>
                  </div>
                  
                  {/* Filtro por Plano de Saúde */}
                  <div className="space-y-2">
                    <Label>Filtrar por Plano de Saúde</Label>
                    <Select value={patientFilter} onValueChange={handleFilterSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os pacientes</SelectItem>
                        <SelectItem value="Particular">Particular</SelectItem>
                        {healthInsurancePlans
                          .filter(plan => plan !== "Todos" && plan !== "Particular" && plan !== "Outros")
                          .map((plan) => (
                            <SelectItem key={plan} value={plan}>
                              {plan}
                            </SelectItem>
                          ))}
                        <SelectItem value="Outros">Outros Planos</SelectItem>
                        <SelectItem value="sem-consulta-30dias">Sem consulta há 30 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Busca */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar paciente..."
                      value={searchPatient}
                      onChange={(e) => setSearchPatient(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <ScrollArea className="h-[250px] border rounded-md p-3">
                    <div className="space-y-2">
                      {filteredPatients.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum paciente encontrado
                        </p>
                      ) : (
                        filteredPatients.map((patient) => (
                          <div
                            key={patient.id}
                            className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                          >
                            <Checkbox
                              id={`patient-${patient.id}`}
                              checked={selectedPatients.includes(patient.id)}
                              onCheckedChange={() => handlePatientToggle(patient.id)}
                            />
                            <Label
                              htmlFor={`patient-${patient.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-medium">{patient.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {patient.email} • {patient.phone}
                                {patient.healthInsurance && ` • ${patient.healthInsurance}`}
                              </div>
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                  {selectedPatients.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {selectedPatients.length} paciente(s) selecionado(s)
                    </p>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2">
                  <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1"
                        disabled={!campaignTitle.trim() || !campaignMessage.trim()}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Preview da Campanha</DialogTitle>
                        <DialogDescription>
                          Visualize como a campanha será enviada
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold">Título:</Label>
                          <p className="text-sm mt-1">{campaignTitle || "(Sem título)"}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Mensagem:</Label>
                          <div className="mt-2 p-4 border rounded-md bg-muted/50">
                            <p className="text-sm whitespace-pre-wrap">{campaignMessage || "(Sem mensagem)"}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">Destinatários:</Label>
                          <p className="text-sm mt-1">{selectedPatients.length} paciente(s)</p>
                        </div>
                        {scheduledDate && scheduledTime && (
                          <div>
                            <Label className="text-sm font-semibold">Agendado para:</Label>
                            <p className="text-sm mt-1">{scheduledDate} às {scheduledTime}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    onClick={handleSendCampaign}
                    className="flex-1"
                    disabled={!campaignTitle.trim() || !campaignMessage.trim() || selectedPatients.length === 0}
                  >
                    {scheduledDate && scheduledTime ? (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Agendar
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Agora
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Campanhas */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Histórico de Campanhas
                    </CardTitle>
                    <CardDescription>
                      Visualize e gerencie suas campanhas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filtros e Busca */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar campanha..."
                        value={searchCampaign}
                        onChange={(e) => setSearchCampaign(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                      <SelectTrigger className="w-[150px]">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todas</SelectItem>
                        <SelectItem value="enviadas">Enviadas</SelectItem>
                        <SelectItem value="agendadas">Agendadas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <ScrollArea className="h-[calc(100vh-500px)] min-h-[500px]">
                  {filteredCampaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                      <Megaphone className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                      <p className="text-sm font-medium text-muted-foreground">
                        {campaigns.length === 0 
                          ? "Nenhuma campanha criada ainda"
                          : "Nenhuma campanha encontrada"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {campaigns.length === 0
                          ? "Crie sua primeira campanha usando o formulário ao lado"
                          : "Tente ajustar os filtros de busca"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 pr-2">
                      {filteredCampaigns.map((campaign) => (
                        <Card key={campaign.id} className={`border-l-4 ${campaign.status === "agendada" ? "border-l-warning" : "border-l-primary"}`}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold">{campaign.title}</h4>
                                {getTemplateName(campaign.templateId) && (
                                  <Badge variant="secondary" className="mt-1 text-xs">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {getTemplateName(campaign.templateId)}
                                  </Badge>
                                )}
                              </div>
                              <Badge variant={campaign.status === "agendada" ? "outline" : "default"}>
                                {campaign.status === "agendada" ? (
                                  <>
                                    <Clock className="h-3 w-3 mr-1" />
                                    Agendada
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Enviada
                                  </>
                                )}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap line-clamp-3">
                              {campaign.message}
                            </p>
                            <Separator className="my-2" />
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{campaign.recipients.length} destinatário(s)</span>
                                </div>
                                {campaign.channel && campaign.channel !== "todos" && (
                                  <Badge variant="outline" className="text-xs">
                                    {campaign.channel === "email" && <Mail className="h-3 w-3 mr-1" />}
                                    {campaign.channel === "whatsapp" && <MessageCircle className="h-3 w-3 mr-1" />}
                                    {campaign.channel === "email" ? "E-mail" : campaign.channel === "whatsapp" ? "WhatsApp" : campaign.channel}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {campaign.status === "agendada" && campaign.scheduledFor
                                    ? `Agendada para ${campaign.scheduledFor}`
                                    : campaign.sentAt}
                                </span>
                              </div>
                            </div>
                            {campaign.recipients.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm font-medium text-muted-foreground mb-2">Destinatários:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {campaign.recipients.slice(0, 5).map((patientId) => (
                                    <Badge key={patientId} variant="secondary" className="text-xs">
                                      {getPatientName(patientId)}
                                    </Badge>
                                  ))}
                                  {campaign.recipients.length > 5 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{campaign.recipients.length - 5} mais
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Comunicacao;
