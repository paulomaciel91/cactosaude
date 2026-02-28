import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Star,
  DollarSign,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  Tag,
  User,
  Award,
  Gift,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Copy,
  Share2,
  Settings,
  FileText,
  MessageSquare,
  Webhook,
  RefreshCw
} from "lucide-react";
import {
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { toast } from "sonner";
import { StandardPagination } from "@/components/ui/standard-pagination";
import { MaskedInput } from "@/components/ui/masked-input";
import { maskPhone, maskCurrency, unmaskPhone, unmaskCurrency, validateEmail, validatePhone } from "@/lib/masks";
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

// Interfaces
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  score: "hot" | "warm" | "cold";
  stage: string;
  source: string;
  responsible: string;
  tags: string[];
  createdAt: string;
  lastInteraction: string;
  notes: string;
  value: number;
}

interface Task {
  id: string;
  title: string;
  leadId: string;
  leadName: string;
  type: "call" | "email" | "meeting" | "follow-up";
  dueDate: string;
  status: "pending" | "completed" | "overdue";
  responsible: string;
}

interface Segment {
  id: string;
  name: string;
  description: string;
  criteria: {
    field: string;
    operator: string;
    value: string;
  }[];
  count: number;
}

interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  referralCode: string;
  referredBy: string;
  referredByName: string;
  status: "pending" | "completed" | "rewarded";
  reward: number;
  createdAt: string;
}

interface LoyaltyLevel {
  id: string;
  name: string;
  minPoints: number;
  benefits: string[];
  color: string;
}

const CRM = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [editLeadOpen, setEditLeadOpen] = useState(false);
  const [deleteLeadOpen, setDeleteLeadOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [newSegmentOpen, setNewSegmentOpen] = useState(false);
  const [editSegmentOpen, setEditSegmentOpen] = useState(false);
  const [segmentToEdit, setSegmentToEdit] = useState<Segment | null>(null);
  const [viewSegmentLeadsOpen, setViewSegmentLeadsOpen] = useState(false);
  const [segmentToView, setSegmentToView] = useState<Segment | null>(null);
  const itemsPerPage = 10;

  // Form data para novo lead
  const [newLeadData, setNewLeadData] = useState({
    name: "",
    email: "",
    phone: "",
    score: "warm" as "hot" | "warm" | "cold",
    stage: "lead",
    source: "",
    responsible: "",
    tags: [] as string[],
    notes: "",
    value: "0,00"
  });

  // Form data para editar lead
  const [editLeadData, setEditLeadData] = useState({
    name: "",
    email: "",
    phone: "",
    score: "warm" as "hot" | "warm" | "cold",
    stage: "lead",
    source: "",
    responsible: "",
    tags: [] as string[],
    notes: "",
    value: "0,00"
  });

  // Pipeline stages
  const stages = [
    { id: "lead", name: "Lead", color: "bg-gray-100", textColor: "text-gray-700" },
    { id: "qualificado", name: "Qualificado", color: "bg-blue-100", textColor: "text-blue-700" },
    { id: "proposta", name: "Proposta", color: "bg-yellow-100", textColor: "text-yellow-700" },
    { id: "negociacao", name: "Negociação", color: "bg-orange-100", textColor: "text-orange-700" },
    { id: "fechado", name: "Fechado", color: "bg-green-100", textColor: "text-green-700" },
    { id: "perdido", name: "Perdido", color: "bg-red-100", textColor: "text-red-700" },
  ];

  // Mock data
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "1",
      name: "Maria Silva",
      email: "maria.silva@email.com",
      phone: "(11) 99999-1111",
      score: "hot",
      stage: "qualificado",
      source: "Website",
      responsible: "Dr. João Silva",
      tags: ["Consulta", "Urgente"],
      createdAt: "2024-01-15",
      lastInteraction: "2024-01-20",
      notes: "Interessada em consulta de retorno",
      value: 500
    },
    {
      id: "2",
      name: "Pedro Costa",
      email: "pedro.costa@email.com",
      phone: "(11) 99999-2222",
      score: "warm",
      stage: "proposta",
      source: "Indicação",
      responsible: "Dra. Ana Lima",
      tags: ["Exame"],
      createdAt: "2024-01-10",
      lastInteraction: "2024-01-18",
      notes: "Aguardando resposta sobre valores",
      value: 800
    },
    {
      id: "3",
      name: "Ana Oliveira",
      email: "ana.oliveira@email.com",
      phone: "(11) 99999-3333",
      score: "cold",
      stage: "lead",
      source: "Redes Sociais",
      responsible: "Dr. João Silva",
      tags: [],
      createdAt: "2024-01-05",
      lastInteraction: "2024-01-05",
      notes: "Primeiro contato",
      value: 300
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Ligar para Maria Silva",
      leadId: "1",
      leadName: "Maria Silva",
      type: "call",
      dueDate: "2024-01-22",
      status: "pending",
      responsible: "Dr. João Silva"
    },
    {
      id: "2",
      title: "Enviar proposta para Pedro Costa",
      leadId: "2",
      leadName: "Pedro Costa",
      type: "email",
      dueDate: "2024-01-21",
      status: "completed",
      responsible: "Dra. Ana Lima"
    },
  ]);

  const [segments, setSegments] = useState<Segment[]>([
    {
      id: "1",
      name: "Leads Quentes",
      description: "Leads com score quente",
      criteria: [{ field: "score", operator: "equals", value: "hot" }],
      count: 15
    },
    {
      id: "2",
      name: "Propostas Pendentes",
      description: "Leads na etapa de proposta",
      criteria: [{ field: "stage", operator: "equals", value: "proposta" }],
      count: 8
    },
  ]);

  const [referrals, setReferrals] = useState<Referral[]>([
    {
      id: "1",
      patientId: "1",
      patientName: "João Santos",
      referralCode: "JOÃO123",
      referredBy: "2",
      referredByName: "Maria Silva",
      status: "completed",
      reward: 50,
      createdAt: "2024-01-15"
    },
  ]);

  const loyaltyLevels: LoyaltyLevel[] = [
    {
      id: "bronze",
      name: "Bronze",
      minPoints: 0,
      benefits: ["Desconto de 5%"],
      color: "bg-amber-500"
    },
    {
      id: "silver",
      name: "Prata",
      minPoints: 100,
      benefits: ["Desconto de 10%", "Prioridade no agendamento"],
      color: "bg-gray-400"
    },
    {
      id: "gold",
      name: "Ouro",
      minPoints: 500,
      benefits: ["Desconto de 15%", "Prioridade no agendamento", "Consulta grátis a cada 10"],
      color: "bg-yellow-500"
    },
  ];

  // Métricas principais
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(l => l.stage === "fechado").length;
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const retentionRate = 85; // Mock
    const nps = 72; // Mock
    const ltv = leads.reduce((sum, l) => sum + l.value, 0) / totalLeads || 0;

    return {
      conversionRate,
      retentionRate,
      nps,
      ltv,
      totalLeads,
      convertedLeads
    };
  }, [leads]);

  // Funil de conversão
  const funnelData = useMemo(() => {
    return stages.map(stage => ({
      name: stage.name,
      value: leads.filter(l => l.stage === stage.id).length,
      conversion: stage.id === "lead" ? 100 : 
        (leads.filter(l => l.stage === stage.id).length / leads.length) * 100
    }));
  }, [leads]);

  // Filtrar leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm)
    );
  }, [leads, searchTerm]);

  // Leads por estágio
  const leadsByStage = useMemo(() => {
    return stages.reduce((acc, stage) => {
      acc[stage.id] = filteredLeads.filter(l => l.stage === stage.id);
      return acc;
    }, {} as Record<string, Lead[]>);
  }, [filteredLeads]);

  // Funções de manipulação de leads
  const handleEditLead = (lead: Lead) => {
    setLeadToEdit(lead);
    setEditLeadData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      score: lead.score,
      stage: lead.stage,
      source: lead.source,
      responsible: lead.responsible,
      tags: lead.tags,
      notes: lead.notes,
      value: lead.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    });
    setEditLeadOpen(true);
  };

  const handleSaveEditLead = () => {
    if (!leadToEdit) return;

    if (!editLeadData.name.trim()) {
      toast.error("O nome é obrigatório");
      return;
    }

    if (!validateEmail(editLeadData.email)) {
      toast.error("Email inválido");
      return;
    }

    if (!validatePhone(editLeadData.phone)) {
      toast.error("Telefone inválido");
      return;
    }

    const updatedLeads = leads.map(lead => 
      lead.id === leadToEdit.id 
        ? {
            ...lead,
            name: editLeadData.name,
            email: editLeadData.email,
            phone: editLeadData.phone,
            score: editLeadData.score,
            stage: editLeadData.stage,
            source: editLeadData.source,
            responsible: editLeadData.responsible,
            tags: editLeadData.tags,
            notes: editLeadData.notes,
            value: unmaskCurrency(editLeadData.value)
          }
        : lead
    );

    setLeads(updatedLeads);
    toast.success("Lead atualizado com sucesso!");
    setEditLeadOpen(false);
    setLeadToEdit(null);
  };

  const handleDeleteLead = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteLeadOpen(true);
  };

  const confirmDeleteLead = () => {
    if (!leadToDelete) return;

    setLeads(leads.filter(lead => lead.id !== leadToDelete.id));
    toast.success("Lead excluído com sucesso!");
    setDeleteLeadOpen(false);
    setLeadToDelete(null);
  };

  // Funções de segmentação
  const handleEditSegment = (segment: Segment) => {
    setSegmentToEdit(segment);
    setEditSegmentOpen(true);
  };

  const handleViewSegmentLeads = (segment: Segment) => {
    setSegmentToView(segment);
    setViewSegmentLeadsOpen(true);
    setActiveTab("leads");
  };

  // Funções de integrações
  const handleTestConnection = () => {
    toast.success("Conexão testada com sucesso!");
  };

  const handleAdvancedSettings = () => {
    toast.info("Configurações avançadas em desenvolvimento");
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    e.dataTransfer.setData("leadId", lead.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    setLeads(prev => prev.map(lead =>
      lead.id === leadId ? { ...lead, stage: targetStage } : lead
    ));
    toast.success("Lead movido com sucesso");
  };

  const getScoreBadge = (score: string) => {
    const variants = {
      hot: { label: "Quente", className: "bg-red-100 text-red-700" },
      warm: { label: "Morno", className: "bg-yellow-100 text-yellow-700" },
      cold: { label: "Frio", className: "bg-blue-100 text-blue-700" },
    };
    return variants[score as keyof typeof variants] || variants.cold;
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 p-4 sm:p-6 overflow-hidden w-full max-w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2 sm:gap-3">
          <Target className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">CRM</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestão de relacionamento com clientes</p>
          </div>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
          onClick={() => setNewLeadOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {/* Métricas Principais */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Taxa de Conversão
              <Target className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {metrics.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.convertedLeads} de {metrics.totalLeads} leads convertidos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Taxa de Retenção
              <TrendingUp className="h-4 w-4 text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {metrics.retentionRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes retidos no período
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              NPS
              <Star className="h-4 w-4 text-warning" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {metrics.nps}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Net Promoter Score
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              LTV Médio
              <DollarSign className="h-4 w-4 text-info" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              R$ {metrics.ltv.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime Value médio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-full overflow-hidden">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-1 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
          <TabsTrigger value="pipeline" className="text-xs sm:text-sm">Funil</TabsTrigger>
          <TabsTrigger value="leads" className="text-xs sm:text-sm">Leads</TabsTrigger>
          <TabsTrigger value="retention" className="text-xs sm:text-sm">Retenção</TabsTrigger>
          <TabsTrigger value="referrals" className="text-xs sm:text-sm">Indicações</TabsTrigger>
          <TabsTrigger value="segments" className="text-xs sm:text-sm">Segmentação</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs sm:text-sm">Relatórios</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs sm:text-sm">Integrações</TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Funil de Conversão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                  <BarChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <PieChart className="h-4 w-4 sm:h-5 sm:w-5" />
                  Leads por Origem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                  <RechartsPieChart>
                    <Pie
                      data={[
                        { name: "Website", value: 45 },
                        { name: "Indicação", value: 30 },
                        { name: "Redes Sociais", value: 15 },
                        { name: "Outros", value: 10 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2, 3].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Funil Kanban */}
        <TabsContent value="pipeline" className="space-y-4 mt-4 w-full max-w-full overflow-hidden">
          <Card className="overflow-hidden w-full max-w-full">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Funil de Vendas</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Arraste os cards entre as etapas</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 overflow-hidden w-full max-w-full">
              {/* Visualização Mobile - Vertical */}
              <div className="block lg:hidden space-y-4">
                {stages.map((stage) => (
                  <div key={stage.id} className="w-full">
                    <div className={`${stage.color} ${stage.textColor} p-3 rounded-t-lg font-semibold text-sm flex items-center justify-between`}>
                      <span>{stage.name}</span>
                      <Badge variant="outline" className="bg-white text-xs">
                        {leadsByStage[stage.id]?.length || 0}
                      </Badge>
                    </div>
                    <div className="border border-t-0 rounded-b-lg p-3 bg-gray-50 min-h-[150px]">
                      {(leadsByStage[stage.id] || []).length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground py-8">
                          Nenhum lead nesta etapa
                        </div>
                      ) : (
                        (leadsByStage[stage.id] || []).map((lead) => (
                          <Card
                            key={lead.id}
                            className="mb-2 cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedLead(lead)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between mb-2 gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm">{lead.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                                </div>
                                <Badge className={`${getScoreBadge(lead.score).className} text-xs shrink-0`}>
                                  {getScoreBadge(lead.score).label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <DollarSign className="h-3 w-3" />
                                <span>R$ {lead.value.toFixed(2)}</span>
                              </div>
                              {lead.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {lead.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {lead.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{lead.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Visualização Desktop - Grid Responsivo */}
              <div className="hidden lg:grid lg:grid-cols-6 gap-2 xl:gap-3 2xl:gap-4 w-full">
                {stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="flex flex-col h-full min-w-0"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.id)}
                  >
                    <div className={`${stage.color} ${stage.textColor} p-2 xl:p-3 rounded-t-lg font-semibold text-xs xl:text-sm flex items-center justify-between`}>
                      <span className="truncate flex-1 min-w-0">{stage.name}</span>
                      <Badge variant="outline" className="bg-white text-xs ml-1 shrink-0">
                        {leadsByStage[stage.id]?.length || 0}
                      </Badge>
                    </div>
                    <div className="border border-t-0 rounded-b-lg p-2 xl:p-3 bg-gray-50 flex-1 min-h-[400px] max-h-[600px] overflow-y-auto overflow-x-hidden">
                      {(leadsByStage[stage.id] || []).length === 0 ? (
                        <div className="text-center text-xs xl:text-sm text-muted-foreground py-8">
                          Nenhum lead
                        </div>
                      ) : (
                        (leadsByStage[stage.id] || []).map((lead) => (
                          <Card
                            key={lead.id}
                            className="mb-2 cursor-move hover:shadow-md transition-shadow w-full max-w-full"
                            draggable
                            onDragStart={(e) => handleDragStart(e, lead)}
                            onClick={() => setSelectedLead(lead)}
                          >
                            <CardContent className="p-2 xl:p-3 w-full max-w-full overflow-hidden">
                              <div className="flex items-start justify-between mb-2 gap-1 xl:gap-2 w-full">
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <p className="font-semibold text-xs xl:text-sm truncate w-full">{lead.name}</p>
                                  <p className="text-[10px] xl:text-xs text-muted-foreground truncate w-full">{lead.email}</p>
                                </div>
                                <Badge className={`${getScoreBadge(lead.score).className} text-[10px] xl:text-xs shrink-0`}>
                                  {getScoreBadge(lead.score).label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 xl:gap-2 text-[10px] xl:text-xs text-muted-foreground mb-2">
                                <DollarSign className="h-2.5 w-2.5 xl:h-3 xl:w-3 shrink-0" />
                                <span className="truncate">R$ {lead.value.toFixed(2)}</span>
                              </div>
                              {lead.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 w-full">
                                  {lead.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-[10px] xl:text-xs truncate max-w-full">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {lead.tags.length > 2 && (
                                    <Badge variant="outline" className="text-[10px] xl:text-xs">
                                      +{lead.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Gestão de Leads */}
        <TabsContent value="leads" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <CardTitle>Gestão de Leads</CardTitle>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filtrar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="hot">Quentes</SelectItem>
                      <SelectItem value="warm">Mornos</SelectItem>
                      <SelectItem value="cold">Frios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-6 sm:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Lead</TableHead>
                        <TableHead className="min-w-[80px]">Score</TableHead>
                        <TableHead className="min-w-[100px]">Etapa</TableHead>
                        <TableHead className="min-w-[100px] hidden sm:table-cell">Origem</TableHead>
                        <TableHead className="min-w-[120px] hidden md:table-cell">Responsável</TableHead>
                        <TableHead className="min-w-[80px]">Valor</TableHead>
                        <TableHead className="min-w-[80px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{lead.name}</p>
                              <p className="text-xs text-muted-foreground">{lead.email}</p>
                              <p className="text-xs text-muted-foreground sm:hidden mt-1">{lead.source}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getScoreBadge(lead.score).className} text-xs`}>
                              {getScoreBadge(lead.score).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {stages.find(s => s.id === lead.stage)?.name || lead.stage}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{lead.source}</TableCell>
                          <TableCell className="hidden md:table-cell">{lead.responsible}</TableCell>
                          <TableCell className="text-sm">R$ {lead.value.toFixed(2)}</TableCell>
                          <TableCell>
                            <TooltipProvider>
                              <div className="flex gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-7 w-7 sm:h-8 sm:w-8 bg-info/10 text-info hover:bg-info/20 hover:text-info"
                                      onClick={() => handleEditLead(lead)}
                                    >
                                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Editar</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-7 w-7 sm:h-8 sm:w-8 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                                      onClick={() => handleDeleteLead(lead)}
                                    >
                                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Excluir</TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="mt-4">
                <StandardPagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredLeads.length / itemsPerPage)}
                  totalItems={filteredLeads.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  itemLabel="lead(s)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tarefas e Follow-up */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Tarefas e Follow-up</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 p-3 border rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className={`p-1.5 sm:p-2 rounded shrink-0 ${
                        task.type === "call" ? "bg-blue-100" :
                        task.type === "email" ? "bg-green-100" :
                        task.type === "meeting" ? "bg-purple-100" :
                        "bg-orange-100"
                      }`}>
                        {task.type === "call" ? <Phone className="h-3 w-3 sm:h-4 sm:w-4" /> :
                         task.type === "email" ? <Mail className="h-3 w-3 sm:h-4 sm:w-4" /> :
                         task.type === "meeting" ? <Calendar className="h-3 w-3 sm:h-4 sm:w-4" /> :
                         <Clock className="h-3 w-3 sm:h-4 sm:w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{task.leadName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <Badge variant={task.status === "completed" ? "default" : "outline"} className="text-xs">
                        {task.status === "completed" ? "Concluída" :
                         task.status === "overdue" ? "Atrasada" : "Pendente"}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                        <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Retenção e Fidelização */}
        <TabsContent value="retention" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Programa de Pontos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold text-sm sm:text-base">Total de Pontos</p>
                      <p className="text-xl sm:text-2xl font-bold text-primary">1.250</p>
                    </div>
                    <Award className="h-8 w-8 sm:h-12 sm:w-12 text-primary shrink-0" />
                  </div>
                  <div className="space-y-2">
                    {loyaltyLevels.map((level) => (
                      <div key={level.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${level.color} shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{level.name}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              A partir de {level.minPoints} pontos
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">{level.benefits.length} benefícios</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pesquisas NPS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 sm:p-6 border rounded-lg">
                    <p className="text-3xl sm:text-4xl font-bold text-primary">{metrics.nps}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">Net Promoter Score</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm">Promotores (9-10)</span>
                      <span className="font-semibold text-sm sm:text-base">65%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm">Neutros (7-8)</span>
                      <span className="font-semibold text-sm sm:text-base">20%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm">Detratores (0-6)</span>
                      <span className="font-semibold text-sm sm:text-base">15%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Sistema de Indicações */}
        <TabsContent value="referrals" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Indicações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xs sm:text-sm">Total de Indicações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl sm:text-2xl font-bold">{referrals.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xs sm:text-sm">Recompensas Pagas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl sm:text-2xl font-bold text-success">
                        R$ {referrals.reduce((sum, r) => sum + r.reward, 0).toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xs sm:text-sm">Taxa de Conversão</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl sm:text-2xl font-bold text-primary">45%</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarFallback className="text-xs sm:text-sm">{referral.patientName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{referral.patientName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            Indicado por {referral.referredByName}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        <div className="text-left sm:text-right">
                          <p className="font-semibold text-xs sm:text-sm">Código: {referral.referralCode}</p>
                          <p className="text-xs text-muted-foreground">
                            Recompensa: R$ {referral.reward.toFixed(2)}
                          </p>
                        </div>
                        <Badge variant={referral.status === "completed" ? "default" : "outline"} className="text-xs shrink-0">
                          {referral.status === "completed" ? "Concluída" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Segmentação Avançada */}
        <TabsContent value="segments" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <CardTitle>Segmentação Avançada</CardTitle>
                <Button 
                  className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                  onClick={() => setNewSegmentOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Segmento
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {segments.map((segment) => (
                  <Card key={segment.id}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <CardTitle className="text-sm sm:text-base">{segment.name}</CardTitle>
                        <Badge variant="outline" className="text-xs shrink-0">{segment.count} leads</Badge>
                      </div>
                      <CardDescription className="text-xs sm:text-sm">{segment.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {segment.criteria.map((criterion, idx) => (
                          <div key={idx} className="text-xs sm:text-sm text-muted-foreground">
                            <span className="font-medium">{criterion.field}</span>{" "}
                            {criterion.operator} {criterion.value}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={() => handleEditSegment(segment)}
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full sm:w-auto"
                          onClick={() => handleViewSegmentLeads(segment)}
                        >
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Ver Leads
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Relatórios */}
        <TabsContent value="reports" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios CRM</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs sm:text-sm">LTV por Origem</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180} className="sm:h-[200px]">
                      <BarChart data={[
                        { name: "Website", value: 450 },
                        { name: "Indicação", value: 680 },
                        { name: "Redes Sociais", value: 320 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs sm:text-sm">Evolução de Conversão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180} className="sm:h-[200px]">
                      <AreaChart data={[
                        { month: "Jan", rate: 25 },
                        { month: "Fev", rate: 28 },
                        { month: "Mar", rate: 32 },
                        { month: "Abr", rate: 30 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="rate" stroke="#3b82f6" fill="#3b82f6" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Integrações n8n */}
        <TabsContent value="integrations" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Integração n8n
              </CardTitle>
              <CardDescription>
                Configure webhooks e automações externas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Status da Integração */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Integração Ativa</p>
                      <p className="text-sm text-muted-foreground">
                        Conectado ao n8n
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                {/* Webhook URL */}
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value="https://n8n.example.com/webhook/crm"
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use esta URL para configurar workflows no n8n
                  </p>
                </div>

                {/* Eventos Disponíveis */}
                <div className="space-y-2">
                  <Label>Eventos Disponíveis</Label>
                  <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                    {[
                      { event: "lead.created", description: "Novo lead criado" },
                      { event: "lead.updated", description: "Lead atualizado" },
                      { event: "lead.stage_changed", description: "Etapa do lead alterada" },
                      { event: "lead.converted", description: "Lead convertido" },
                      { event: "task.created", description: "Nova tarefa criada" },
                      { event: "task.completed", description: "Tarefa concluída" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs sm:text-sm break-words">{item.event}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <Switch className="shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logs de Integração */}
                <div className="space-y-2">
                  <Label>Logs de Integração</Label>
                  <ScrollArea className="h-48 border rounded-lg p-4">
                    <div className="space-y-2">
                      {[
                        { time: "10:30", event: "lead.created", status: "success", data: "Maria Silva" },
                        { time: "10:25", event: "lead.stage_changed", status: "success", data: "Pedro Costa → Qualificado" },
                        { time: "10:20", event: "task.completed", status: "success", data: "Ligar para Ana" },
                        { time: "10:15", event: "lead.created", status: "error", data: "Erro ao processar" },
                      ].map((log, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">{log.time}</span>
                          <Badge variant={log.status === "success" ? "default" : "destructive"}>
                            {log.status}
                          </Badge>
                          <span className="font-mono text-xs">{log.event}</span>
                          <span className="text-muted-foreground">{log.data}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleTestConnection}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Testar Conexão
                  </Button>
                  <Button variant="outline" onClick={handleAdvancedSettings}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações Avançadas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Novo Lead */}
      <Dialog open={newLeadOpen} onOpenChange={setNewLeadOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
            <DialogDescription>Cadastre um novo lead no sistema</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-lead-name">Nome *</Label>
                <Input
                  id="new-lead-name"
                  placeholder="Nome completo"
                  value={newLeadData.name}
                  onChange={(e) => setNewLeadData({ ...newLeadData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-lead-email">Email *</Label>
                <Input
                  id="new-lead-email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={newLeadData.email}
                  onChange={(e) => setNewLeadData({ ...newLeadData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-lead-phone">Telefone *</Label>
                <MaskedInput
                  id="new-lead-phone"
                  mask="phone"
                  placeholder="(11) 99999-9999"
                  value={newLeadData.phone}
                  onChange={(value) => setNewLeadData({ ...newLeadData, phone: value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-lead-score">Score</Label>
                <Select
                  value={newLeadData.score}
                  onValueChange={(value: "hot" | "warm" | "cold") => 
                    setNewLeadData({ ...newLeadData, score: value })
                  }
                >
                  <SelectTrigger id="new-lead-score">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">Quente</SelectItem>
                    <SelectItem value="warm">Morno</SelectItem>
                    <SelectItem value="cold">Frio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-lead-stage">Etapa</Label>
                <Select
                  value={newLeadData.stage}
                  onValueChange={(value) => setNewLeadData({ ...newLeadData, stage: value })}
                >
                  <SelectTrigger id="new-lead-stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-lead-source">Origem</Label>
                <Select
                  value={newLeadData.source}
                  onValueChange={(value) => setNewLeadData({ ...newLeadData, source: value })}
                >
                  <SelectTrigger id="new-lead-source">
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Indicação">Indicação</SelectItem>
                    <SelectItem value="Redes Sociais">Redes Sociais</SelectItem>
                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-lead-responsible">Responsável</Label>
                <Select
                  value={newLeadData.responsible}
                  onValueChange={(value) => setNewLeadData({ ...newLeadData, responsible: value })}
                >
                  <SelectTrigger id="new-lead-responsible">
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. João Silva">Dr. João Silva</SelectItem>
                    <SelectItem value="Dra. Ana Lima">Dra. Ana Lima</SelectItem>
                    <SelectItem value="Dr. Carlos Souza">Dr. Carlos Souza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-lead-value">Valor Estimado (R$)</Label>
                <MaskedInput
                  id="new-lead-value"
                  mask="currency"
                  placeholder="0,00"
                  value={newLeadData.value}
                  onChange={(value) => setNewLeadData({ ...newLeadData, value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-lead-notes">Notas</Label>
              <Textarea
                id="new-lead-notes"
                placeholder="Observações sobre o lead..."
                value={newLeadData.notes}
                onChange={(e) => setNewLeadData({ ...newLeadData, notes: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewLeadOpen(false);
              setNewLeadData({
                name: "",
                email: "",
                phone: "",
                score: "warm",
                stage: "lead",
                source: "",
                responsible: "",
                tags: [],
                notes: "",
                value: "0,00"
              });
            }}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!newLeadData.name.trim()) {
                  toast.error("O nome é obrigatório");
                  return;
                }

                if (!validateEmail(newLeadData.email)) {
                  toast.error("Email inválido");
                  return;
                }

                if (!validatePhone(newLeadData.phone)) {
                  toast.error("Telefone inválido");
                  return;
                }

                const newLead: Lead = {
                  id: Date.now().toString(),
                  name: newLeadData.name,
                  email: newLeadData.email,
                  phone: newLeadData.phone,
                  score: newLeadData.score,
                  stage: newLeadData.stage,
                  source: newLeadData.source,
                  responsible: newLeadData.responsible,
                  tags: newLeadData.tags,
                  createdAt: new Date().toISOString().split('T')[0],
                  lastInteraction: new Date().toISOString().split('T')[0],
                  notes: newLeadData.notes,
                  value: unmaskCurrency(newLeadData.value)
                };

                setLeads([...leads, newLead]);
                toast.success("Lead cadastrado com sucesso!");
                setNewLeadOpen(false);
                setNewLeadData({
                  name: "",
                  email: "",
                  phone: "",
                  score: "warm",
                  stage: "lead",
                  source: "",
                  responsible: "",
                  tags: [],
                  notes: "",
                  value: "0,00"
                });
                setActiveTab("leads");
              }}
            >
              Criar Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Editar Lead */}
      <Dialog open={editLeadOpen} onOpenChange={setEditLeadOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
            <DialogDescription>Atualize as informações do lead</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-lead-name">Nome *</Label>
                <Input
                  id="edit-lead-name"
                  placeholder="Nome completo"
                  value={editLeadData.name}
                  onChange={(e) => setEditLeadData({ ...editLeadData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lead-email">Email *</Label>
                <Input
                  id="edit-lead-email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={editLeadData.email}
                  onChange={(e) => setEditLeadData({ ...editLeadData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lead-phone">Telefone *</Label>
                <MaskedInput
                  id="edit-lead-phone"
                  mask="phone"
                  placeholder="(11) 99999-9999"
                  value={editLeadData.phone}
                  onChange={(value) => setEditLeadData({ ...editLeadData, phone: value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lead-score">Score</Label>
                <Select
                  value={editLeadData.score}
                  onValueChange={(value: "hot" | "warm" | "cold") => 
                    setEditLeadData({ ...editLeadData, score: value })
                  }
                >
                  <SelectTrigger id="edit-lead-score">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">Quente</SelectItem>
                    <SelectItem value="warm">Morno</SelectItem>
                    <SelectItem value="cold">Frio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lead-stage">Etapa</Label>
                <Select
                  value={editLeadData.stage}
                  onValueChange={(value) => setEditLeadData({ ...editLeadData, stage: value })}
                >
                  <SelectTrigger id="edit-lead-stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lead-source">Origem</Label>
                <Select
                  value={editLeadData.source}
                  onValueChange={(value) => setEditLeadData({ ...editLeadData, source: value })}
                >
                  <SelectTrigger id="edit-lead-source">
                    <SelectValue placeholder="Selecione a origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Indicação">Indicação</SelectItem>
                    <SelectItem value="Redes Sociais">Redes Sociais</SelectItem>
                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lead-responsible">Responsável</Label>
                <Select
                  value={editLeadData.responsible}
                  onValueChange={(value) => setEditLeadData({ ...editLeadData, responsible: value })}
                >
                  <SelectTrigger id="edit-lead-responsible">
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. João Silva">Dr. João Silva</SelectItem>
                    <SelectItem value="Dra. Ana Lima">Dra. Ana Lima</SelectItem>
                    <SelectItem value="Dr. Carlos Souza">Dr. Carlos Souza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lead-value">Valor Estimado (R$)</Label>
                <MaskedInput
                  id="edit-lead-value"
                  mask="currency"
                  placeholder="0,00"
                  value={editLeadData.value}
                  onChange={(value) => setEditLeadData({ ...editLeadData, value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-lead-notes">Notas</Label>
              <Textarea
                id="edit-lead-notes"
                placeholder="Observações sobre o lead..."
                value={editLeadData.notes}
                onChange={(e) => setEditLeadData({ ...editLeadData, notes: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditLeadOpen(false);
              setLeadToEdit(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEditLead}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Excluir Lead */}
      <AlertDialog open={deleteLeadOpen} onOpenChange={setDeleteLeadOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o lead <strong>{leadToDelete?.name}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLeadToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteLead}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Detalhes do Lead */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>{selectedLead.name}</DialogTitle>
              <DialogDescription>Detalhes do lead</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{selectedLead.email}</p>
                </div>
                <div>
                  <Label>Telefone</Label>
                  <p className="text-sm">{selectedLead.phone}</p>
                </div>
                <div>
                  <Label>Score</Label>
                  <Badge className={getScoreBadge(selectedLead.score).className}>
                    {getScoreBadge(selectedLead.score).label}
                  </Badge>
                </div>
                <div>
                  <Label>Etapa</Label>
                  <Badge variant="outline">
                    {stages.find(s => s.id === selectedLead.stage)?.name}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Notas</Label>
                <p className="text-sm text-muted-foreground">{selectedLead.notes}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedLead(null)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de Novo Segmento */}
      <Dialog open={newSegmentOpen} onOpenChange={setNewSegmentOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Novo Segmento</DialogTitle>
            <DialogDescription>Crie um novo segmento de leads</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-segment-name">Nome do Segmento *</Label>
              <Input
                id="new-segment-name"
                placeholder="Ex: Leads Quentes"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-segment-description">Descrição</Label>
              <Textarea
                id="new-segment-description"
                placeholder="Descreva o segmento..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewSegmentOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.info("Funcionalidade de criar segmento em desenvolvimento");
              setNewSegmentOpen(false);
            }}>
              Criar Segmento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Editar Segmento */}
      <Dialog open={editSegmentOpen} onOpenChange={setEditSegmentOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Editar Segmento</DialogTitle>
            <DialogDescription>Atualize as informações do segmento</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-segment-name">Nome do Segmento *</Label>
              <Input
                id="edit-segment-name"
                placeholder="Ex: Leads Quentes"
                defaultValue={segmentToEdit?.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-segment-description">Descrição</Label>
              <Textarea
                id="edit-segment-description"
                placeholder="Descreva o segmento..."
                rows={3}
                defaultValue={segmentToEdit?.description}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditSegmentOpen(false);
              setSegmentToEdit(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.info("Funcionalidade de editar segmento em desenvolvimento");
              setEditSegmentOpen(false);
              setSegmentToEdit(null);
            }}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Ver Leads do Segmento */}
      <Dialog open={viewSegmentLeadsOpen} onOpenChange={setViewSegmentLeadsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Leads do Segmento: {segmentToView?.name}</DialogTitle>
            <DialogDescription>{segmentToView?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Total: {segmentToView?.count || 0} leads
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground text-center py-8">
                Lista de leads do segmento será exibida aqui
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setViewSegmentLeadsOpen(false);
              setSegmentToView(null);
            }}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRM;

