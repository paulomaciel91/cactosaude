import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MaskedInput } from "@/components/ui/masked-input";
import { validateCPF, validateEmail, validatePhone, validateDate, validateDateNotFuture } from "@/lib/masks";
import { StandardPagination } from "@/components/ui/standard-pagination";
import { 
  Plus, 
  Search, 
  Edit,
  X, 
  Trash2, 
  Mail, 
  Phone, 
  UserCog, 
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Star,
  Activity,
  Briefcase,
  MapPin,
  Award,
  Users,
  Camera,
  FileText,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { appointmentService, BlockedSlot } from "@/lib/appointmentService";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  specialty: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  consultations: number;
  photo?: string;
  crm?: string;
  commission?: number;
  receivesCommission?: boolean;
  cpf?: string;
  birthDate?: string;
  address?: string;
  permissionLevel?: "admin" | "medico" | "recepcionista" | "financeiro";
  workSchedule?: {
    monday: { start: string; end: string; enabled: boolean; lunchBreak?: { start: string; end: string; enabled: boolean } };
    tuesday: { start: string; end: string; enabled: boolean; lunchBreak?: { start: string; end: string; enabled: boolean } };
    wednesday: { start: string; end: string; enabled: boolean; lunchBreak?: { start: string; end: string; enabled: boolean } };
    thursday: { start: string; end: string; enabled: boolean; lunchBreak?: { start: string; end: string; enabled: boolean } };
    friday: { start: string; end: string; enabled: boolean; lunchBreak?: { start: string; end: string; enabled: boolean } };
    saturday: { start: string; end: string; enabled: boolean; lunchBreak?: { start: string; end: string; enabled: boolean } };
    sunday: { start: string; end: string; enabled: boolean; lunchBreak?: { start: string; end: string; enabled: boolean } };
  };
  procedures?: string[];
  monthlyRevenue?: number;
  performance?: {
    consultations: number;
    revenue: number;
  };
}

const Equipe = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState("gestao");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [formRole, setFormRole] = useState("");
  const [memberPhoto, setMemberPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [editingCommission, setEditingCommission] = useState<number | null>(null);
  const [editingRevenue, setEditingRevenue] = useState<number | null>(null);
  const [tempCommission, setTempCommission] = useState<number>(0);
  const [tempRevenue, setTempRevenue] = useState<number>(0);
  const [editingSchedule, setEditingSchedule] = useState<number | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    specialty: "",
    email: "",
    phone: "",
    crm: "",
    cpf: "",
    birthDate: "",
    address: "",
    permissionLevel: "" as "admin" | "medico" | "recepcionista" | "financeiro" | "",
  });

  const [team, setTeam] = useState<TeamMember[]>([
    {
      id: 1,
      name: "Dr. João Santos",
      role: "Médico",
      specialty: "Clínico Geral",
      email: "joao.santos@CactoSaude.com",
      phone: "(11) 99999-0001",
      status: "active",
      consultations: 245,
      photo: "",
      crm: "CRM 123456 - SP",
      commission: 30,
      receivesCommission: true,
      monthlyRevenue: 61250,
      cpf: "123.456.789-00",
      birthDate: "15/03/1980",
      address: "Rua das Flores, 123 - São Paulo/SP",
      permissionLevel: "medico",
      workSchedule: {
        monday: { start: "08:00", end: "18:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        tuesday: { start: "08:00", end: "18:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        wednesday: { start: "08:00", end: "18:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        thursday: { start: "08:00", end: "18:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        friday: { start: "08:00", end: "18:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        saturday: { start: "08:00", end: "12:00", enabled: true, lunchBreak: { start: "", end: "", enabled: false } },
        sunday: { start: "", end: "", enabled: false, lunchBreak: { start: "", end: "", enabled: false } },
      },
      procedures: ["Consulta Geral", "Retorno", "Avaliação Pré-Operatória"],
      performance: {
        consultations: 245,
        revenue: 61250,
      },
    },
    {
      id: 2,
      name: "Dra. Ana Lima",
      role: "Médica",
      specialty: "Dermatologia",
      email: "ana.lima@CactoSaude.com",
      phone: "(11) 99999-0002",
      status: "active",
      consultations: 189,
      photo: "",
      crm: "CRM 234567 - SP",
      commission: 35,
      receivesCommission: true,
      monthlyRevenue: 94500,
      cpf: "234.567.890-11",
      birthDate: "22/05/1985",
      address: "Av. Paulista, 456 - São Paulo/SP",
      permissionLevel: "medico",
      workSchedule: {
        monday: { start: "09:00", end: "17:00", enabled: true, lunchBreak: { start: "12:30", end: "13:30", enabled: true } },
        tuesday: { start: "09:00", end: "17:00", enabled: true, lunchBreak: { start: "12:30", end: "13:30", enabled: true } },
        wednesday: { start: "", end: "", enabled: false, lunchBreak: { start: "", end: "", enabled: false } },
        thursday: { start: "09:00", end: "17:00", enabled: true, lunchBreak: { start: "12:30", end: "13:30", enabled: true } },
        friday: { start: "09:00", end: "17:00", enabled: true, lunchBreak: { start: "12:30", end: "13:30", enabled: true } },
        saturday: { start: "", end: "", enabled: false, lunchBreak: { start: "", end: "", enabled: false } },
        sunday: { start: "", end: "", enabled: false, lunchBreak: { start: "", end: "", enabled: false } },
      },
      procedures: ["Consulta Dermatológica", "Procedimento Estético", "Biópsia"],
      performance: {
        consultations: 189,
        revenue: 94500,
      },
    },
    {
      id: 3,
      name: "Dr. Carlos Souza",
      role: "Dentista",
      specialty: "Odontologia",
      email: "carlos.souza@CactoSaude.com",
      phone: "(11) 99999-0003",
      status: "active",
      consultations: 312,
      photo: "",
      crm: "CRO 345678 - SP",
      commission: 40,
      receivesCommission: true,
      monthlyRevenue: 156000,
      cpf: "345.678.901-22",
      birthDate: "10/08/1978",
      address: "Rua Augusta, 789 - São Paulo/SP",
      permissionLevel: "medico",
      workSchedule: {
        monday: { start: "08:00", end: "19:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        tuesday: { start: "08:00", end: "19:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        wednesday: { start: "08:00", end: "19:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        thursday: { start: "08:00", end: "19:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        friday: { start: "08:00", end: "19:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        saturday: { start: "08:00", end: "14:00", enabled: true, lunchBreak: { start: "", end: "", enabled: false } },
        sunday: { start: "", end: "", enabled: false, lunchBreak: { start: "", end: "", enabled: false } },
      },
      procedures: ["Consulta Odontológica", "Limpeza", "Restauração", "Extração"],
      performance: {
        consultations: 312,
        revenue: 156000,
      },
    },
    {
      id: 4,
      name: "Fernanda Costa",
      role: "Recepcionista",
      specialty: "Atendimento",
      email: "fernanda.costa@CactoSaude.com",
      phone: "(11) 99999-0004",
      status: "active",
      consultations: 0,
      photo: "",
      commission: 0,
      receivesCommission: false,
      monthlyRevenue: 0,
      cpf: "456.789.012-33",
      birthDate: "05/12/1990",
      address: "Rua Consolação, 321 - São Paulo/SP",
      permissionLevel: "recepcionista",
      workSchedule: {
        monday: { start: "07:00", end: "19:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        tuesday: { start: "07:00", end: "19:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        wednesday: { start: "07:00", end: "19:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        thursday: { start: "07:00", end: "19:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        friday: { start: "07:00", end: "19:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        saturday: { start: "08:00", end: "14:00", enabled: true, lunchBreak: { start: "", end: "", enabled: false } },
        sunday: { start: "", end: "", enabled: false, lunchBreak: { start: "", end: "", enabled: false } },
      },
      procedures: [],
      performance: {
        consultations: 0,
        revenue: 0,
      },
    },
  ]);

  const filteredTeam = team.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginação
  const totalPages = Math.ceil(filteredTeam.length / itemsPerPage);
  const paginatedTeam = filteredTeam.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Resetar paginação quando o termo de busca mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const stats = {
    total: team.length,
    doctors: team.filter(m => m.role === "Médico" || m.role === "Médica").length,
    active: team.filter(m => m.status === "active").length,
    totalRevenue: team.reduce((sum, m) => sum + (m.monthlyRevenue || 0), 0),
    totalConsultations: team.reduce((sum, m) => sum + m.consultations, 0),
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-success/10 text-success hover:bg-success/20">Ativo</Badge>
    ) : (
      <Badge className="bg-muted text-muted-foreground hover:bg-muted">Inativo</Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      "Médico": "bg-primary/10 text-primary",
      "Médica": "bg-primary/10 text-primary",
      "Dentista": "bg-info/10 text-info",
      "Recepcionista": "bg-purple-500/10 text-purple-600",
    };
    return <Badge className={colors[role] || "bg-muted"}>{role}</Badge>;
  };

  const weekDays = [
    { key: "monday", label: "Segunda-feira", dayOfWeek: 1 },
    { key: "tuesday", label: "Terça-feira", dayOfWeek: 2 },
    { key: "wednesday", label: "Quarta-feira", dayOfWeek: 3 },
    { key: "thursday", label: "Quinta-feira", dayOfWeek: 4 },
    { key: "friday", label: "Sexta-feira", dayOfWeek: 5 },
    { key: "saturday", label: "Sábado", dayOfWeek: 6 },
    { key: "sunday", label: "Domingo", dayOfWeek: 0 },
  ] as const;

  // Função para sincronizar horários de trabalho com bloqueios na agenda
  const syncWorkScheduleBlocks = (member: TeamMember) => {
    if (!member.workSchedule) return;

    // Remover bloqueios antigos de horário de trabalho deste profissional
    const existingBlocks = appointmentService.getBlockedSlots();
    existingBlocks.forEach(block => {
      if (block.professional === member.name && 
          (block.reason?.includes("Fora do Horário de Trabalho") || 
           block.reason?.includes("Dia não trabalhado"))) {
        appointmentService.removeBlockedSlot(block);
      }
    });

    // Adicionar novos bloqueios baseados nos horários de trabalho configurados
    weekDays.forEach(day => {
      const schedule = member.workSchedule?.[day.key];

      if (!schedule?.enabled) {
        // Se o dia não está habilitado, bloquear o dia inteiro (00:00 até 23:59)
        const block: BlockedSlot = {
          day: day.dayOfWeek,
          time: "00:00",
          duration: 24 * 60, // 24 horas em minutos
          reason: `Dia não trabalhado - ${member.name}`,
          date: "", // Bloqueio recorrente (sem data específica)
          professional: member.name,
        };
        appointmentService.addBlockedSlot(block);
      } else if (schedule.start && schedule.end) {
        // Se o dia está habilitado, bloquear períodos fora do horário de trabalho
        const [startHour, startMin] = schedule.start.split(':').map(Number);
        const [endHour, endMin] = schedule.end.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        // Bloquear período antes do horário de início (00:00 até start)
        if (startMinutes > 0) {
          const beforeBlock: BlockedSlot = {
            day: day.dayOfWeek,
            time: "00:00",
            duration: startMinutes,
            reason: `Fora do Horário de Trabalho - ${member.name}`,
            date: "",
            professional: member.name,
          };
          appointmentService.addBlockedSlot(beforeBlock);
        }

        // Bloquear período depois do horário de fim (end até 23:59)
        const endOfDayMinutes = 24 * 60; // 1440 minutos (24 horas)
        if (endMinutes < endOfDayMinutes) {
          const afterBlock: BlockedSlot = {
            day: day.dayOfWeek,
            time: schedule.end,
            duration: endOfDayMinutes - endMinutes,
            reason: `Fora do Horário de Trabalho - ${member.name}`,
            date: "",
            professional: member.name,
          };
          appointmentService.addBlockedSlot(afterBlock);
        }
      }
    });
  };

  // Função para sincronizar horários de almoço com bloqueios na agenda
  const syncLunchBreakBlocks = (member: TeamMember) => {
    if (!member.workSchedule) return;

    // Remover bloqueios antigos de almoço deste profissional
    const existingBlocks = appointmentService.getBlockedSlots();
    existingBlocks.forEach(block => {
      if (block.professional === member.name && block.reason?.includes("Horário de Almoço")) {
        appointmentService.removeBlockedSlot(block);
      }
    });

    // Adicionar novos bloqueios baseados nos horários de almoço configurados
    weekDays.forEach(day => {
      const schedule = member.workSchedule?.[day.key];
      const lunchBreak = schedule?.lunchBreak;

      if (schedule?.enabled && lunchBreak?.enabled && lunchBreak.start && lunchBreak.end) {
        // Calcular duração em minutos
        const [startHour, startMin] = lunchBreak.start.split(':').map(Number);
        const [endHour, endMin] = lunchBreak.end.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const duration = endMinutes - startMinutes;

        if (duration > 0) {
          const block: BlockedSlot = {
            day: day.dayOfWeek,
            time: lunchBreak.start,
            duration,
            reason: `Horário de Almoço - ${member.name}`,
            date: "", // Bloqueio recorrente (sem data específica)
            professional: member.name,
          };
          appointmentService.addBlockedSlot(block);
          console.log(`Bloqueio de almoço criado para ${member.name} - ${day.label}: ${lunchBreak.start} até ${lunchBreak.end}`);
        }
      }
    });
  };

  // Sincronizar horários de trabalho e almoço de todos os membros ao carregar a página
  useEffect(() => {
    // IMPORTANTE: Sincronizar almoço DEPOIS do horário de trabalho para garantir que os bloqueios de almoço sejam criados corretamente
    // Usar setTimeout para garantir que os bloqueios sejam criados na ordem correta e após outros componentes carregarem
    const timer = setTimeout(() => {
      console.log('Equipe: Iniciando sincronização de horários...');
      let totalWorkBlocks = 0;
      let totalLunchBlocks = 0;
      
      team.forEach(member => {
        if (member.workSchedule) {
          // Primeiro sincronizar horários de trabalho
          syncWorkScheduleBlocks(member);
          
          // Contar bloqueios de trabalho criados
          const workBlocks = appointmentService.getBlockedSlots().filter(b => 
            b.professional === member.name && 
            (b.reason?.includes("Fora do Horário de Trabalho") || b.reason?.includes("Dia não trabalhado"))
          );
          totalWorkBlocks += workBlocks.length;
          
          // Depois sincronizar horários de almoço (isso garante que os bloqueios de almoço sejam criados por último)
          syncLunchBreakBlocks(member);
          
          // Contar bloqueios de almoço criados
          const lunchBlocks = appointmentService.getBlockedSlots().filter(b => 
            b.professional === member.name && 
            b.reason?.includes("Horário de Almoço")
          );
          totalLunchBlocks += lunchBlocks.length;
        }
      });
      
      console.log(`Equipe: Horários sincronizados - Bloqueios de trabalho: ${totalWorkBlocks}, Bloqueios de almoço: ${totalLunchBlocks}`);
    }, 200); // Delay para garantir que outros componentes tenham carregado
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas uma vez ao montar o componente

  return (
    <TooltipProvider>
    <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-baseline gap-3">
          <UserCog className="h-8 w-8 text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Equipe</h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm md:text-base">
              Gerencie profissionais e colaboradores
            </p>
          </div>
        </div>
        <Dialog open={open || editMode} onOpenChange={(isOpen) => {
          if (!isOpen) {
            setOpen(false);
            setEditMode(false);
            setFormData({
              name: "",
              role: "",
              specialty: "",
              email: "",
              phone: "",
              crm: "",
              cpf: "",
              birthDate: "",
              address: "",
            });
            setFormRole("");
            setMemberPhoto(null);
            setPhotoFile(null);
          } else if (!editMode) {
            setOpen(true);
          }
        }}>
          <DialogTrigger asChild>
            <Button 
              className="bg-primary hover:bg-primary/90 w-full md:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Membro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? "Editar Membro da Equipe" : "Novo Membro da Equipe"}</DialogTitle>
              <DialogDescription>
                {editMode ? "Edite as informações do profissional" : "Adicione um novo profissional à equipe"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Foto do Membro */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-2 border-primary/20">
                    <AvatarImage src={memberPhoto || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {formData.name ? formData.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : "MB"}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("A imagem deve ter no máximo 5MB");
                          return;
                        }
                        setPhotoFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setMemberPhoto(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {memberPhoto ? "Alterar Foto" : "Adicionar Foto"}
                  </Button>
                  {memberPhoto && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMemberPhoto(null);
                        setPhotoFile(null);
                        if (photoInputRef.current) {
                          photoInputRef.current.value = '';
                        }
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid gap-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input 
                  id="name" 
                  placeholder="Digite o nome completo" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="role">Função *</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => {
                      setFormData({ ...formData, role: value });
                      setFormRole(value);
                      setFormData(prev => ({ ...prev, crm: "" }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medico">Médico</SelectItem>
                      <SelectItem value="dentista">Dentista</SelectItem>
                      <SelectItem value="nutricionista">Nutricionista</SelectItem>
                      <SelectItem value="recepcionista">Recepcionista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input 
                    id="specialty" 
                    placeholder="Ex: Cardiologia" 
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email@exemplo.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <MaskedInput
                    id="phone"
                    mask="phone"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(value) => setFormData({ ...formData, phone: value })}
                    maxLength={15}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <MaskedInput
                    id="cpf"
                    mask="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(value) => setFormData({ ...formData, cpf: value })}
                    maxLength={14}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input 
                  id="birthDate" 
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Endereço</Label>
                <Input 
                  id="address" 
                  placeholder="Rua, número, bairro, cidade/UF" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="crm">
                  {formRole === "medico" ? "CRM" : 
                   formRole === "dentista" ? "CRO" : 
                   formRole === "nutricionista" ? "CRN" : 
                   "Registro Profissional"}
                </Label>
                <Input 
                  id="crm" 
                  placeholder={
                    formRole === "medico" ? "Digite o CRM (ex: CRM 123456 - SP)" :
                    formRole === "dentista" ? "Digite o CRO (ex: CRO 123456 - SP)" :
                    formRole === "nutricionista" ? "Digite o CRN (ex: CRN 123456)" :
                    "Digite o número de registro"
                  }
                  value={formData.crm}
                  onChange={(e) => setFormData({ ...formData, crm: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="permissionLevel" className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Nível de Permissão *
                </Label>
                <Select 
                  value={formData.permissionLevel} 
                  onValueChange={(value) => setFormData({ ...formData, permissionLevel: value as "admin" | "medico" | "recepcionista" | "financeiro" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível de permissão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin da Clínica</SelectItem>
                    <SelectItem value="medico">Médico/Profissional</SelectItem>
                    <SelectItem value="recepcionista">Recepcionista</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  O nível de permissão define quais funcionalidades o membro pode acessar no sistema
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setOpen(false);
                setEditMode(false);
                setFormData({
                  name: "",
                  role: "",
                  specialty: "",
                  email: "",
                  phone: "",
                  crm: "",
                  cpf: "",
                  birthDate: "",
                  address: "",
                  permissionLevel: "",
                });
                setFormRole("");
                setMemberPhoto(null);
                setPhotoFile(null);
              }}>
                Cancelar
              </Button>
              <Button onClick={() => {
                // Validações
                if (!formData.name || !formData.name.trim()) {
                  toast.error("Nome completo é obrigatório");
                  return;
                }
                if (!formData.email || !formData.email.trim()) {
                  toast.error("Email é obrigatório");
                  return;
                }
                if (!validateEmail(formData.email)) {
                  toast.error("Email inválido");
                  return;
                }
                if (!formData.phone || !formData.phone.trim()) {
                  toast.error("Telefone é obrigatório");
                  return;
                }
                if (!validatePhone(formData.phone)) {
                  toast.error("Telefone inválido. Use o formato (00) 00000-0000");
                  return;
                }
                if (!formData.cpf || !formData.cpf.trim()) {
                  toast.error("CPF é obrigatório");
                  return;
                }
                if (!validateCPF(formData.cpf)) {
                  toast.error("CPF inválido");
                  return;
                }
                if (!formData.birthDate) {
                  toast.error("Data de nascimento é obrigatória");
                  return;
                }
                if (!validateDate(formData.birthDate)) {
                  toast.error("Data de nascimento inválida");
                  return;
                }
                if (!validateDateNotFuture(formData.birthDate)) {
                  toast.error("Data de nascimento não pode ser no futuro");
                  return;
                }
                if (!formData.role) {
                  toast.error("Função é obrigatória");
                  return;
                }
                if (!formData.permissionLevel) {
                  toast.error("Nível de permissão é obrigatório");
                  return;
                }

                if (editMode) {
                  toast.success("Membro atualizado com sucesso!");
                } else {
                  toast.success("Membro adicionado com sucesso!");
                }
                setOpen(false);
                setEditMode(false);
                setFormData({
                  name: "",
                  role: "",
                  specialty: "",
                  email: "",
                  phone: "",
                  crm: "",
                  cpf: "",
                  birthDate: "",
                  address: "",
                  permissionLevel: "",
                });
                setFormRole("");
                setMemberPhoto(null);
                setPhotoFile(null);
              }}>
                {editMode ? "Salvar Alterações" : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total de Membros
              <Users className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-info">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Médicos
              <Briefcase className="h-4 w-4 text-info" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{stats.doctors}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Ativos Hoje
              <Activity className="h-4 w-4 text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Desempenho Médio
              <TrendingUp className="h-4 w-4 text-warning" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {stats.totalConsultations}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total de consultas</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Gestão de Equipe</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou função..."
                className="pl-10 pr-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-6 gap-1">
              <TabsTrigger value="gestao">Gestão</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="especialidades">Especialidades</TabsTrigger>
              <TabsTrigger value="comissoes">Comissões</TabsTrigger>
              <TabsTrigger value="horarios">Horários</TabsTrigger>
            </TabsList>

            {/* Tab: Gestão de Profissionais */}
            <TabsContent value="gestao" className="space-y-4">
              <div className="scrollbar-hide-x">
                <div className="min-w-[500px] sm:min-w-[600px] md:min-w-[800px] lg:min-w-[1000px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Profissional</TableHead>
                        <TableHead className="font-semibold">Função</TableHead>
                        <TableHead className="font-semibold">Especialidade</TableHead>
                        <TableHead className="font-semibold">Contato</TableHead>
                        <TableHead className="text-center font-semibold">Consultas</TableHead>
                        <TableHead className="font-semibold">Permissão</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="whitespace-nowrap font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTeam.map((member) => (
                        <TableRow key={member.id} className="hover:bg-muted/30 border-b">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={member.photo} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {member.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                {member.crm && (
                                  <p className="text-xs text-muted-foreground">{member.crm}</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getRoleBadge(member.role)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{member.specialty}</span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                {member.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {member.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-semibold">{member.consultations}</span>
                          </TableCell>
                          <TableCell>
                            {member.permissionLevel ? (
                              <Badge 
                                variant="outline" 
                                className={
                                  member.permissionLevel === "admin" 
                                    ? "bg-purple-500/10 text-purple-700 border-purple-500/20" 
                                    : member.permissionLevel === "medico"
                                    ? "bg-blue-500/10 text-blue-700 border-blue-500/20"
                                    : member.permissionLevel === "recepcionista"
                                    ? "bg-green-500/10 text-green-700 border-green-500/20"
                                    : "bg-orange-500/10 text-orange-700 border-orange-500/20"
                                }
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                {member.permissionLevel === "admin" ? "Admin" :
                                 member.permissionLevel === "medico" ? "Médico" :
                                 member.permissionLevel === "recepcionista" ? "Recepcionista" :
                                 "Financeiro"}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Não definido</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(member.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 min-h-[44px] min-w-[44px] bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 hover:text-purple-700"
                                    onClick={() => {
                                      setSelectedMember(member);
                                      setDetailsOpen(true);
                                    }}
                                  >
                                    <FileText className="h-4 w-4 text-purple-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ver detalhes</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 min-h-[44px] min-w-[44px] bg-info/10 text-info hover:bg-info/20 hover:text-info"
                                    onClick={() => {
                                      const roleMap: Record<string, string> = {
                                        "Médico": "medico",
                                        "Médica": "medico",
                                        "Dentista": "dentista",
                                        "Nutricionista": "nutricionista",
                                        "Recepcionista": "recepcionista",
                                      };
                                      const roleValue = roleMap[member.role] || member.role.toLowerCase();
                                      setEditMode(true);
                                      setFormData({
                                        name: member.name,
                                        role: roleValue,
                                        specialty: member.specialty,
                                        email: member.email,
                                        phone: member.phone,
                                        crm: member.crm || "",
                                        cpf: member.cpf || "",
                                        birthDate: member.birthDate || "",
                                        address: member.address || "",
                                        permissionLevel: member.permissionLevel || "",
                                      });
                                      setFormRole(roleValue);
                                      setMemberPhoto(member.photo || null);
                                      setOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Editar profissional</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 min-h-[44px] min-w-[44px] bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                                    onClick={() => {
                                      setMemberToDelete(member);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Remover profissional</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <StandardPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredTeam.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                itemLabel="profissional(is)"
              />
            </TabsContent>

            {/* Tab: Agenda Individual */}
            <TabsContent value="agenda" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTeam.map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.photo} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-base">{member.name}</CardTitle>
                          <CardDescription className="text-xs">{member.specialty}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Consultas hoje</span>
                          <span className="font-semibold">{Math.floor(member.consultations / 30)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Próxima consulta</span>
                          <span className="text-sm font-medium">14:30</span>
                        </div>
                        <Separator />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full bg-success/10 text-success hover:bg-success/20 hover:text-success" 
                          onClick={() => {
                            const encodedName = encodeURIComponent(member.name);
                            navigate(`/agenda?professional=${member.id}&name=${encodedName}`);
                          }}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Ver Agenda Completa
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tab: Especialidades e Procedimentos */}
            <TabsContent value="especialidades" className="space-y-4">
              <div className="grid gap-4">
                {filteredTeam.filter(m => m.procedures && m.procedures.length > 0).map((member) => (
                  <Card key={member.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.photo} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{member.name}</CardTitle>
                          <CardDescription>{member.specialty}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Procedimentos Realizados</Label>
                        <div className="flex flex-wrap gap-2">
                          {member.procedures?.map((procedure, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {procedure}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tab: Comissões e Desempenho */}
            <TabsContent value="comissoes" className="space-y-4">
              <div className="scrollbar-hide-x">
                <div className="min-w-[500px] sm:min-w-[600px] md:min-w-[700px] lg:min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Profissional</TableHead>
                        <TableHead className="text-center font-semibold">Consultas</TableHead>
                        <TableHead className="text-center font-semibold">Receita Mensal</TableHead>
                        <TableHead className="text-center font-semibold">Recebe Comissão</TableHead>
                        <TableHead className="text-center font-semibold">Comissão (%)</TableHead>
                        <TableHead className="text-center font-semibold">Comissão (R$)</TableHead>
                        <TableHead className="whitespace-nowrap font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeam.filter(m => m.role !== "Recepcionista").slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                      ).map((member) => {
                        const receivesCommission = member.receivesCommission ?? true;
                        const commissionAmount = receivesCommission && member.monthlyRevenue && member.commission
                          ? (member.monthlyRevenue * member.commission) / 100
                          : 0;
                        const isEditingCommission = editingCommission === member.id;
                        const isEditingRevenue = editingRevenue === member.id;
                        return (
                          <TableRow key={member.id} className="hover:bg-muted/30 border-b">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={member.photo} />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {member.name.split(" ").map(n => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">{member.specialty}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-semibold">{member.consultations}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              {isEditingRevenue ? (
                                <div className="flex items-center gap-2 justify-center">
                                  <Input
                                    type="number"
                                    value={tempRevenue}
                                    onChange={(e) => setTempRevenue(Number(e.target.value))}
                                    className="w-24 h-8 text-sm"
                                    step="0.01"
                                    min="0"
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      setEditingRevenue(null);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-success"
                                    onClick={() => {
                                      setTeam(prev => prev.map(m => 
                                        m.id === member.id ? { ...m, monthlyRevenue: tempRevenue } : m
                                      ));
                                      setEditingRevenue(null);
                                      toast.success("Receita atualizada!");
                                    }}
                                  >
                                    ✓
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 justify-center">
                                  <span className="font-semibold text-success">
                                    R$ {member.monthlyRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || "0,00"}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                      setEditingRevenue(member.id);
                                      setTempRevenue(member.monthlyRevenue || 0);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center">
                                <Switch
                                  checked={receivesCommission}
                                  onCheckedChange={(checked) => {
                                    setTeam(prev => prev.map(m => 
                                      m.id === member.id ? { 
                                        ...m, 
                                        receivesCommission: checked,
                                        commission: checked ? (m.commission || 0) : 0
                                      } : m
                                    ));
                                    toast.success(`Comissão ${checked ? 'ativada' : 'desativada'} para ${member.name}`);
                                  }}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {!receivesCommission ? (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Não recebe
                                </Badge>
                              ) : isEditingCommission ? (
                                <div className="flex items-center gap-2 justify-center">
                                  <Input
                                    type="number"
                                    value={tempCommission}
                                    onChange={(e) => setTempCommission(Number(e.target.value))}
                                    className="w-20 h-8 text-sm"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                  />
                                  <span className="text-sm">%</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      setEditingCommission(null);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-success"
                                    onClick={() => {
                                      setTeam(prev => prev.map(m => 
                                        m.id === member.id ? { ...m, commission: tempCommission } : m
                                      ));
                                      setEditingCommission(null);
                                      toast.success("Comissão atualizada!");
                                    }}
                                  >
                                    ✓
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 justify-center">
                                  <Badge variant="outline">{member.commission || 0}%</Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                      setEditingCommission(member.id);
                                      setTempCommission(member.commission || 0);
                                    }}
                                    disabled={!receivesCommission}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {receivesCommission ? (
                                <span className="font-semibold text-primary">
                                  R$ {commissionAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 min-h-[44px] min-w-[44px] bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 hover:text-purple-700"
                                    onClick={() => {
                                      setSelectedMember(member);
                                      setDetailsOpen(true);
                                    }}
                                  >
                                    <FileText className="h-4 w-4 text-purple-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ver detalhes</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <StandardPagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredTeam.filter(m => m.role !== "Recepcionista").length / itemsPerPage)}
                totalItems={filteredTeam.filter(m => m.role !== "Recepcionista").length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                itemLabel="profissional(is)"
              />
            </TabsContent>

            {/* Tab: Horários de Trabalho */}
            <TabsContent value="horarios" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Horários de Trabalho</h3>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTeam.map((member) => {
                  const enabledDays = weekDays.filter(day => member.workSchedule?.[day.key]?.enabled).length;
                  return (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.photo} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {member.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <CardTitle className="text-base">{member.name}</CardTitle>
                            <CardDescription className="text-xs">{member.specialty}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                            <span className="text-sm text-muted-foreground">Dias trabalhados</span>
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              {enabledDays} dias
                            </Badge>
                          </div>
                          {enabledDays > 0 && (
                            <div className="space-y-1">
                              {weekDays.filter(day => member.workSchedule?.[day.key]?.enabled).slice(0, 3).map((day) => {
                                const schedule = member.workSchedule?.[day.key];
                                return (
                                  <div key={day.key} className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">{day.label.substring(0, 3)}</span>
                                    <span className="font-medium">{schedule?.start} - {schedule?.end}</span>
                                  </div>
                                );
                              })}
                              {enabledDays > 3 && (
                                <p className="text-xs text-muted-foreground text-center pt-1">
                                  +{enabledDays - 3} mais
                                </p>
                              )}
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full bg-info/10 text-info hover:bg-info/20 hover:text-info"
                            onClick={() => {
                              setSelectedMember(member);
                              setEditingSchedule(member.id);
                              setScheduleDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Horários
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={selectedMember?.photo} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedMember?.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xl font-bold">{selectedMember?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedMember?.specialty}</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Informações completas do profissional
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
                <TabsTrigger value="comissao">Comissão</TabsTrigger>
                <TabsTrigger value="horarios">Horários</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Email</Label>
                    <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Telefone</Label>
                    <p className="text-sm text-muted-foreground">{selectedMember.phone}</p>
                  </div>
                  {selectedMember.crm && (
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold">Registro Profissional</Label>
                      <p className="text-sm text-muted-foreground">{selectedMember.crm}</p>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label className="text-sm font-semibold">Status</Label>
                    <div>{getStatusBadge(selectedMember.status)}</div>
                  </div>
                  {selectedMember.cpf && (
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold">CPF</Label>
                      <p className="text-sm text-muted-foreground">{selectedMember.cpf}</p>
                    </div>
                  )}
                  {selectedMember.birthDate && (
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold">Data de Nascimento</Label>
                      <p className="text-sm text-muted-foreground">{selectedMember.birthDate}</p>
                    </div>
                  )}
                  {selectedMember.address && (
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold">Endereço</Label>
                      <p className="text-sm text-muted-foreground">{selectedMember.address}</p>
                    </div>
                  )}
                  {selectedMember.permissionLevel && (
                    <div className="grid gap-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Nível de Permissão
                      </Label>
                      <Badge 
                        variant="outline" 
                        className={
                          selectedMember.permissionLevel === "admin" 
                            ? "bg-purple-500/10 text-purple-700 border-purple-500/20 w-fit" 
                            : selectedMember.permissionLevel === "medico"
                            ? "bg-blue-500/10 text-blue-700 border-blue-500/20 w-fit"
                            : selectedMember.permissionLevel === "recepcionista"
                            ? "bg-green-500/10 text-green-700 border-green-500/20 w-fit"
                            : "bg-orange-500/10 text-orange-700 border-orange-500/20 w-fit"
                        }
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {selectedMember.permissionLevel === "admin" ? "Admin da Clínica" :
                         selectedMember.permissionLevel === "medico" ? "Médico/Profissional" :
                         selectedMember.permissionLevel === "recepcionista" ? "Recepcionista" :
                         "Financeiro"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Este nível define quais funcionalidades o membro pode acessar no sistema
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="agenda" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                    <div>
                      <p className="font-semibold text-sm">Consultas do Mês</p>
                      <p className="text-xs text-muted-foreground mt-1">Total de consultas realizadas</p>
                    </div>
                    <div className="text-2xl font-bold text-primary">{selectedMember.consultations}</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full bg-success/10 text-success hover:bg-success/20 hover:text-success"
                    onClick={() => {
                      if (selectedMember) {
                        const encodedName = encodeURIComponent(selectedMember.name);
                        navigate(`/agenda?professional=${selectedMember.id}&name=${encodedName}`);
                      }
                    }}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Ver Agenda Completa
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="comissao" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-muted/30 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs text-muted-foreground">Recebe Comissão</Label>
                        <p className="text-sm font-medium mt-1">
                          {selectedMember.receivesCommission ?? true ? "Sim" : "Não"}
                        </p>
                      </div>
                      <Switch
                        checked={selectedMember.receivesCommission ?? true}
                        onCheckedChange={(checked) => {
                          setTeam(prev => prev.map(m => 
                            m.id === selectedMember.id ? { 
                              ...m, 
                              receivesCommission: checked,
                              commission: checked ? (m.commission || 0) : 0
                            } : m
                          ));
                          setSelectedMember(prev => prev ? {
                            ...prev,
                            receivesCommission: checked,
                            commission: checked ? (prev.commission || 0) : 0
                          } : null);
                          toast.success(`Comissão ${checked ? 'ativada' : 'desativada'} para ${selectedMember.name}`);
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30 border">
                      <Label className="text-xs text-muted-foreground">Receita Mensal</Label>
                      <p className="text-xl font-bold text-success mt-1">
                        R$ {selectedMember.monthlyRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || "0,00"}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border">
                      <Label className="text-xs text-muted-foreground">Comissão</Label>
                      <p className="text-xl font-bold text-primary mt-1">
                        {selectedMember.commission || 0}%
                      </p>
                    </div>
                  </div>
                  {(selectedMember.receivesCommission ?? true) && (
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <Label className="text-xs text-muted-foreground">Valor da Comissão</Label>
                      <p className="text-2xl font-bold text-primary mt-1">
                        R$ {selectedMember.monthlyRevenue && selectedMember.commission
                          ? ((selectedMember.monthlyRevenue * selectedMember.commission) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                          : "0,00"}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="horarios" className="space-y-4 mt-4">
                <div className="space-y-2">
                  {weekDays.map((day) => {
                    const schedule = selectedMember.workSchedule?.[day.key];
                    return (
                      <div key={day.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                        <span className="text-sm font-medium">{day.label}</span>
                        {schedule?.enabled ? (
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            {schedule.start} - {schedule.end}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            Não trabalha
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              toast.success("Informações atualizadas com sucesso!");
              setDetailsOpen(false);
            }}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição de Horários */}
      <Dialog open={scheduleDialogOpen} onOpenChange={(open) => {
        setScheduleDialogOpen(open);
        if (!open) {
          // Ao fechar o diálogo, restaurar selectedMember do estado atualizado do team
          if (selectedMember) {
            const updatedMember = team.find(m => m.id === selectedMember.id);
            if (updatedMember) {
              setSelectedMember(updatedMember);
            }
          }
          setEditingSchedule(null);
        }
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedMember?.photo} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedMember?.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-bold">{selectedMember?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedMember?.specialty}</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Configure os horários de trabalho do profissional
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4 mt-4">
              {weekDays.map((day) => {
                const schedule = selectedMember.workSchedule?.[day.key];
                const lunchBreak = schedule?.lunchBreak || { start: "", end: "", enabled: false };
                return (
                  <div key={day.key} className="p-4 rounded-lg bg-muted/30 border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{day.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={schedule?.enabled || false}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          setTeam(prev => prev.map(m => 
                            m.id === selectedMember.id ? {
                              ...m,
                              workSchedule: {
                                ...m.workSchedule!,
                                [day.key]: {
                                  ...m.workSchedule![day.key],
                                  enabled,
                                  lunchBreak: enabled ? (m.workSchedule![day.key].lunchBreak || { start: "", end: "", enabled: false }) : { start: "", end: "", enabled: false }
                                }
                              }
                            } : m
                          ));
                          setSelectedMember(prev => prev ? {
                            ...prev,
                            workSchedule: {
                              ...prev.workSchedule!,
                              [day.key]: {
                                ...prev.workSchedule![day.key],
                                enabled,
                                lunchBreak: enabled ? (prev.workSchedule![day.key].lunchBreak || { start: "", end: "", enabled: false }) : { start: "", end: "", enabled: false }
                              }
                            }
                          } : null);
                        }}
                        className="h-4 w-4"
                      />
                    </div>
                    {schedule?.enabled && (
                      <>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs w-20">Horário:</Label>
                          <Input
                            type="time"
                            value={schedule.start || ""}
                            onChange={(e) => {
                              setTeam(prev => prev.map(m => 
                                m.id === selectedMember.id ? {
                                  ...m,
                                  workSchedule: {
                                    ...m.workSchedule!,
                                    [day.key]: {
                                      ...m.workSchedule![day.key],
                                      start: e.target.value
                                    }
                                  }
                                } : m
                              ));
                              setSelectedMember(prev => prev ? {
                                ...prev,
                                workSchedule: {
                                  ...prev.workSchedule!,
                                  [day.key]: {
                                    ...prev.workSchedule![day.key],
                                    start: e.target.value
                                  }
                                }
                              } : null);
                            }}
                            className="w-24 h-8 text-sm"
                          />
                          <span className="text-sm">até</span>
                          <Input
                            type="time"
                            value={schedule.end || ""}
                            onChange={(e) => {
                              setTeam(prev => prev.map(m => 
                                m.id === selectedMember.id ? {
                                  ...m,
                                  workSchedule: {
                                    ...m.workSchedule!,
                                    [day.key]: {
                                      ...m.workSchedule![day.key],
                                      end: e.target.value
                                    }
                                  }
                                } : m
                              ));
                              setSelectedMember(prev => prev ? {
                                ...prev,
                                workSchedule: {
                                  ...prev.workSchedule!,
                                  [day.key]: {
                                    ...prev.workSchedule![day.key],
                                    end: e.target.value
                                  }
                                }
                              } : null);
                            }}
                            className="w-24 h-8 text-sm"
                          />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Horário de Almoço</Label>
                            <input
                              type="checkbox"
                              checked={lunchBreak.enabled || false}
                              onChange={(e) => {
                                const lunchEnabled = e.target.checked;
                                setTeam(prev => prev.map(m => 
                                  m.id === selectedMember.id ? {
                                    ...m,
                                    workSchedule: {
                                      ...m.workSchedule!,
                                      [day.key]: {
                                        ...m.workSchedule![day.key],
                                        lunchBreak: {
                                          ...m.workSchedule![day.key].lunchBreak,
                                          enabled: lunchEnabled,
                                          start: lunchEnabled ? (m.workSchedule![day.key].lunchBreak?.start || "12:00") : "",
                                          end: lunchEnabled ? (m.workSchedule![day.key].lunchBreak?.end || "13:00") : ""
                                        }
                                      }
                                    }
                                  } : m
                                ));
                                setSelectedMember(prev => prev ? {
                                  ...prev,
                                  workSchedule: {
                                    ...prev.workSchedule!,
                                    [day.key]: {
                                      ...prev.workSchedule![day.key],
                                      lunchBreak: {
                                        ...prev.workSchedule![day.key].lunchBreak,
                                        enabled: lunchEnabled,
                                        start: lunchEnabled ? (prev.workSchedule![day.key].lunchBreak?.start || "12:00") : "",
                                        end: lunchEnabled ? (prev.workSchedule![day.key].lunchBreak?.end || "13:00") : ""
                                      }
                                    }
                                  }
                                } : null);
                              }}
                              className="h-4 w-4"
                            />
                          </div>
                          {lunchBreak.enabled && (
                            <div className="flex items-center gap-2">
                              <Label className="text-xs w-20">Almoço:</Label>
                              <Input
                                type="time"
                                value={lunchBreak.start || ""}
                                onChange={(e) => {
                                  setTeam(prev => prev.map(m => 
                                    m.id === selectedMember.id ? {
                                      ...m,
                                      workSchedule: {
                                        ...m.workSchedule!,
                                        [day.key]: {
                                          ...m.workSchedule![day.key],
                                          lunchBreak: {
                                            ...m.workSchedule![day.key].lunchBreak!,
                                            start: e.target.value
                                          }
                                        }
                                      }
                                    } : m
                                  ));
                                  setSelectedMember(prev => prev ? {
                                    ...prev,
                                    workSchedule: {
                                      ...prev.workSchedule!,
                                      [day.key]: {
                                        ...prev.workSchedule![day.key],
                                        lunchBreak: {
                                          ...prev.workSchedule![day.key].lunchBreak!,
                                          start: e.target.value
                                        }
                                      }
                                    }
                                  } : null);
                                }}
                                className="w-24 h-8 text-sm"
                              />
                              <span className="text-sm">até</span>
                              <Input
                                type="time"
                                value={lunchBreak.end || ""}
                                onChange={(e) => {
                                  setTeam(prev => prev.map(m => 
                                    m.id === selectedMember.id ? {
                                      ...m,
                                      workSchedule: {
                                        ...m.workSchedule!,
                                        [day.key]: {
                                          ...m.workSchedule![day.key],
                                          lunchBreak: {
                                            ...m.workSchedule![day.key].lunchBreak!,
                                            end: e.target.value
                                          }
                                        }
                                      }
                                    } : m
                                  ));
                                  setSelectedMember(prev => prev ? {
                                    ...prev,
                                    workSchedule: {
                                      ...prev.workSchedule!,
                                      [day.key]: {
                                        ...prev.workSchedule![day.key],
                                        lunchBreak: {
                                          ...prev.workSchedule![day.key].lunchBreak!,
                                          end: e.target.value
                                        }
                                      }
                                    }
                                  } : null);
                                }}
                                className="w-24 h-8 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              // Ao cancelar, restaurar selectedMember do estado atualizado do team
              // Isso descarta as alterações não salvas
              if (selectedMember) {
                setTeam(currentTeam => {
                  const originalMember = currentTeam.find(m => m.id === selectedMember.id);
                  if (originalMember) {
                    setSelectedMember(originalMember);
                  }
                  return currentTeam;
                });
              }
              setScheduleDialogOpen(false);
              setEditingSchedule(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={() => {
              if (selectedMember) {
                // Usar uma função de callback para garantir que temos os dados mais recentes do estado
                setTeam(currentTeam => {
                  const updatedMember = currentTeam.find(m => m.id === selectedMember.id);
                  if (updatedMember && updatedMember.workSchedule) {
                    console.log(`Sincronizando horários para ${updatedMember.name}`);
                    
                    // IMPORTANTE: Sincronizar na ordem correta
                    // 1. Primeiro remover e recriar bloqueios de horário de trabalho
                    syncWorkScheduleBlocks(updatedMember);
                    
                    // 2. Depois remover e recriar bloqueios de almoço (isso garante que os bloqueios de almoço sejam criados por último)
                    syncLunchBreakBlocks(updatedMember);
                    
                    console.log(`Bloqueios sincronizados para ${updatedMember.name}`);
                    
                    // Verificar se os bloqueios foram criados corretamente
                    setTimeout(() => {
                      const allBlocks = appointmentService.getBlockedSlots();
                      const lunchBlocks = allBlocks.filter(b => 
                        b.professional === updatedMember.name && 
                        b.reason?.includes("Horário de Almoço")
                      );
                      const workBlocks = allBlocks.filter(b => 
                        b.professional === updatedMember.name && 
                        (b.reason?.includes("Fora do Horário de Trabalho") || b.reason?.includes("Dia não trabalhado"))
                      );
                      console.log(`Total de bloqueios criados para ${updatedMember.name}:`);
                      console.log(`  - Horário de trabalho: ${workBlocks.length}`);
                      console.log(`  - Horário de almoço: ${lunchBlocks.length}`);
                      lunchBlocks.forEach(block => {
                        console.log(`  - Almoço: ${block.reason}: ${block.time} (${block.duration} min) - Dia ${block.day}`);
                      });
                      
                      if (lunchBlocks.length === 0) {
                        console.warn(`ATENÇÃO: Nenhum bloqueio de almoço foi criado para ${updatedMember.name}!`);
                        console.log('Horários de almoço configurados:', updatedMember.workSchedule);
                      }
                    }, 100);
                    
                    // Atualizar selectedMember com os dados mais recentes
                    setSelectedMember(updatedMember);
                  }
                  
                  // Retornar o estado atualizado (sem mudanças, apenas para garantir que temos os dados mais recentes)
                  return currentTeam;
                });
              }
              toast.success("Horários atualizados com sucesso!");
              setScheduleDialogOpen(false);
              setEditingSchedule(null);
            }}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{memberToDelete?.name}</strong> da equipe? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (memberToDelete) {
                  setTeam(prev => prev.filter(m => m.id !== memberToDelete.id));
                  toast.success(`${memberToDelete.name} removido da equipe com sucesso!`);
                  setMemberToDelete(null);
                  setDeleteDialogOpen(false);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover Profissional
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </TooltipProvider>
  );
};

export default Equipe;
