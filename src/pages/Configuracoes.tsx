import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { MaskedInput } from "@/components/ui/masked-input";
import { validateCNPJ, validateEmail, validatePhone, validateCEP } from "@/lib/masks";
import {
  Settings,
  Bell,
  Lock,
  Building,
  Calendar,
  DollarSign,
  Save,
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  Activity,
  CreditCard,
  Users,
  Shield,
  CheckCircle,
  XCircle,
  X
} from "lucide-react";
import { toast } from "sonner";
import { appointmentService, BlockedSlot } from "@/lib/appointmentService";
import { useClinic } from "@/hooks/useClinic";

interface WorkSchedule {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
  lunchBreak?: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface Sector {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

interface Procedure {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  active: boolean;
}

interface HealthInsurance {
  id: number;
  name: string;
  code: string;
  active: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface RolePermissions {
  role: string;
  permissions: string[];
}

const Configuracoes = () => {
  const navigate = useNavigate();
  const { clinic, loading: clinicLoading } = useClinic();

  // Estados para formulário de dados da clínica
  const [clinicData, setClinicData] = useState({
    name: "",
    cnpj: "",
    address: "",
    city: "",
    state: "sp",
    cep: "",
    phone: "",
    email: "",
    website: "",
  });

  // Atualizar dados da clínica quando carregar
  useEffect(() => {
    if (clinic) {
      setClinicData({
        name: clinic.name || "",
        cnpj: clinic.cnpj || "",
        address: clinic.address || "",
        city: "", // Adicionar se existir na tabela
        state: "sp", // Adicionar se existir na tabela
        cep: "", // Adicionar se existir na tabela
        phone: clinic.phone || "",
        email: clinic.email || "",
        website: "", // Adicionar se existir na tabela
      });
    }
  }, [clinic]);

  // Verificar se o usuário é admin (mock - substituir por verificação real)
  const currentUser = {
    permissionLevel: "admin" as "admin" | "medico" | "recepcionista" | "financeiro",
  };

  useEffect(() => {
    // Redirecionar se não for admin
    if (currentUser.permissionLevel !== "admin") {
      toast.error("Acesso negado. Apenas administradores podem acessar as configurações.");
      navigate("/");
    }
  }, [navigate]);

  // Sincronizar horário de almoço da clínica ao carregar a página
  useEffect(() => {
    // Usar setTimeout para garantir que seja executado após outros componentes
    const timer = setTimeout(() => {
      console.log('Configuracoes: Sincronizando bloqueios de almoço da clínica...');
      syncClinicLunchBreakBlocks();

      // Verificar se os bloqueios foram criados
      const allBlocks = appointmentService.getBlockedSlots();
      const clinicLunchBlocks = allBlocks.filter(b =>
        b.reason?.includes("Horário de Almoço da Clínica")
      );
      console.log(`Configuracoes: Total de bloqueios de almoço da clínica criados: ${clinicLunchBlocks.length}`);
    }, 150);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executar apenas uma vez ao montar o componente

  // Se não for admin, não renderizar nada (será redirecionado)
  if (currentUser.permissionLevel !== "admin") {
    return null;
  }

  // Estados para Horário de Funcionamento
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule[]>([
    { day: "Segunda-feira", enabled: true, start: "08:00", end: "18:00", lunchBreak: { enabled: true, start: "12:00", end: "13:00" } },
    { day: "Terça-feira", enabled: true, start: "08:00", end: "18:00", lunchBreak: { enabled: true, start: "12:00", end: "13:00" } },
    { day: "Quarta-feira", enabled: true, start: "08:00", end: "18:00", lunchBreak: { enabled: true, start: "12:00", end: "13:00" } },
    { day: "Quinta-feira", enabled: true, start: "08:00", end: "18:00", lunchBreak: { enabled: true, start: "12:00", end: "13:00" } },
    { day: "Sexta-feira", enabled: true, start: "08:00", end: "18:00", lunchBreak: { enabled: true, start: "12:00", end: "13:00" } },
    { day: "Sábado", enabled: true, start: "08:00", end: "12:00", lunchBreak: { enabled: false, start: "", end: "" } },
    { day: "Domingo", enabled: false, start: "", end: "", lunchBreak: { enabled: false, start: "", end: "" } },
  ]);

  // Estados para Setores
  const [sectors, setSectors] = useState<Sector[]>([
    { id: 1, name: "Recepção", description: "Área de recepção e atendimento inicial", active: true },
    { id: 2, name: "Consultório 1", description: "Consultório médico principal", active: true },
    { id: 3, name: "Consultório 2", description: "Consultório médico secundário", active: true },
    { id: 4, name: "Sala de Exames", description: "Sala para realização de exames", active: true },
  ]);
  const [sectorDialogOpen, setSectorDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [sectorForm, setSectorForm] = useState({ name: "", description: "" });

  // Estados para Procedimentos
  const [procedures, setProcedures] = useState<Procedure[]>([
    { id: 1, name: "Consulta Geral", description: "Consulta médica geral", duration: 30, price: 150.00, active: true },
    { id: 2, name: "Retorno", description: "Consulta de retorno", duration: 15, price: 100.00, active: true },
    { id: 3, name: "Consulta Especializada", description: "Consulta com especialista", duration: 45, price: 250.00, active: true },
  ]);
  const [procedureDialogOpen, setProcedureDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [procedureForm, setProcedureForm] = useState({ name: "", description: "", duration: "", price: "" });

  // Estados para Planos de Saúde
  const [healthInsurances, setHealthInsurances] = useState<HealthInsurance[]>([
    { id: 1, name: "Unimed", code: "UNI", active: true },
    { id: 2, name: "Bradesco Saúde", code: "BRA", active: true },
    { id: 3, name: "Amil", code: "AMI", active: true },
    { id: 4, name: "SulAmérica", code: "SUL", active: true },
    { id: 5, name: "NotreDame Intermédica", code: "NDI", active: true },
  ]);
  const [insuranceDialogOpen, setInsuranceDialogOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<HealthInsurance | null>(null);
  const [insuranceForm, setInsuranceForm] = useState({ name: "", code: "" });

  // Estados para confirmação de exclusão
  const [deleteSectorDialogOpen, setDeleteSectorDialogOpen] = useState(false);
  const [sectorToDelete, setSectorToDelete] = useState<Sector | null>(null);
  const [deleteProcedureDialogOpen, setDeleteProcedureDialogOpen] = useState(false);
  const [procedureToDelete, setProcedureToDelete] = useState<Procedure | null>(null);
  const [deleteInsuranceDialogOpen, setDeleteInsuranceDialogOpen] = useState(false);
  const [insuranceToDelete, setInsuranceToDelete] = useState<HealthInsurance | null>(null);

  // Estados para Permissões
  const [permissions] = useState<Permission[]>([
    { id: "dashboard_view", name: "Visualizar Dashboard", description: "Acesso ao dashboard principal" },
    { id: "patients_view", name: "Visualizar Pacientes", description: "Visualizar lista de pacientes" },
    { id: "patients_create", name: "Criar Pacientes", description: "Cadastrar novos pacientes" },
    { id: "patients_edit", name: "Editar Pacientes", description: "Editar dados de pacientes" },
    { id: "patients_delete", name: "Excluir Pacientes", description: "Remover pacientes do sistema" },
    { id: "appointments_view", name: "Visualizar Agendamentos", description: "Ver agendamentos" },
    { id: "appointments_create", name: "Criar Agendamentos", description: "Criar novos agendamentos" },
    { id: "appointments_edit", name: "Editar Agendamentos", description: "Editar agendamentos existentes" },
    { id: "appointments_cancel", name: "Cancelar Agendamentos", description: "Cancelar agendamentos" },
    { id: "consultations_view", name: "Visualizar Consultas", description: "Ver consultas realizadas" },
    { id: "consultations_create", name: "Criar Consultas", description: "Registrar novas consultas" },
    { id: "payments_view", name: "Visualizar Pagamentos", description: "Ver pagamentos" },
    { id: "payments_create", name: "Registrar Pagamentos", description: "Registrar novos pagamentos" },
    { id: "payments_confirm", name: "Confirmar Pagamentos", description: "Confirmar recebimento de pagamentos" },
    { id: "team_view", name: "Visualizar Equipe", description: "Ver membros da equipe" },
    { id: "team_create", name: "Adicionar Membros", description: "Adicionar novos membros à equipe" },
    { id: "team_edit", name: "Editar Membros", description: "Editar dados da equipe" },
    { id: "team_delete", name: "Remover Membros", description: "Remover membros da equipe" },
    { id: "settings_view", name: "Visualizar Configurações", description: "Acessar configurações do sistema" },
    { id: "settings_edit", name: "Editar Configurações", description: "Modificar configurações do sistema" },
    { id: "reports_view", name: "Visualizar Relatórios", description: "Acessar relatórios e estatísticas" },
  ]);

  const [rolePermissions, setRolePermissions] = useState<RolePermissions[]>([
    {
      role: "admin",
      permissions: permissions.map(p => p.id), // Admin tem todas as permissões
    },
    {
      role: "medico",
      permissions: [
        "dashboard_view",
        "patients_view",
        "appointments_view",
        "appointments_create",
        "appointments_edit",
        "consultations_view",
        "consultations_create",
        "team_view",
      ],
    },
    {
      role: "recepcionista",
      permissions: [
        "dashboard_view",
        "patients_view",
        "patients_create",
        "patients_edit",
        "appointments_view",
        "appointments_create",
        "appointments_edit",
        "appointments_cancel",
        "payments_view",
        "payments_create",
      ],
    },
    {
      role: "financeiro",
      permissions: [
        "dashboard_view",
        "patients_view",
        "payments_view",
        "payments_create",
        "payments_confirm",
        "reports_view",
      ],
    },
  ]);

  const handleSave = () => {
    // Sincronizar horário de almoço geral da clínica
    syncClinicLunchBreakBlocks();
    toast.success("Configurações salvas com sucesso!");
  };

  const handleWorkScheduleChange = (index: number, field: keyof WorkSchedule, value: any) => {
    const updated = [...workSchedule];
    updated[index] = { ...updated[index], [field]: value };
    setWorkSchedule(updated);
  };

  // Função para sincronizar horário de almoço geral da clínica com bloqueios
  const syncClinicLunchBreakBlocks = () => {
    // Mapear dias da semana
    const dayMap: Record<string, number> = {
      "Segunda-feira": 1,
      "Terça-feira": 2,
      "Quarta-feira": 3,
      "Quinta-feira": 4,
      "Sexta-feira": 5,
      "Sábado": 6,
      "Domingo": 0,
    };

    // Remover bloqueios antigos de almoço geral da clínica
    const existingBlocks = appointmentService.getBlockedSlots();
    existingBlocks.forEach(block => {
      if (block.reason?.includes("Horário de Almoço da Clínica")) {
        appointmentService.removeBlockedSlot(block);
      }
    });

    let blocksCreated = 0;
    // Adicionar novos bloqueios baseados nos horários de almoço configurados
    workSchedule.forEach(schedule => {
      const lunchBreak = schedule.lunchBreak;

      if (schedule.enabled && lunchBreak?.enabled && lunchBreak.start && lunchBreak.end) {
        // Calcular duração em minutos
        const [startHour, startMin] = lunchBreak.start.split(':').map(Number);
        const [endHour, endMin] = lunchBreak.end.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const duration = endMinutes - startMinutes;

        if (duration > 0) {
          const block: BlockedSlot = {
            day: dayMap[schedule.day],
            time: lunchBreak.start,
            duration,
            reason: "Horário de Almoço da Clínica",
            date: "", // Bloqueio recorrente (sem data específica)
            // Não incluir campo professional para bloqueios gerais da clínica
          };
          appointmentService.addBlockedSlot(block);
          blocksCreated++;
          console.log(`Bloqueio de almoço da clínica criado: ${schedule.day} - ${lunchBreak.start} até ${lunchBreak.end}`);
        }
      }
    });
    console.log(`Total de bloqueios de almoço da clínica criados: ${blocksCreated}`);
  };

  const handleSaveSector = () => {
    if (!sectorForm.name.trim()) {
      toast.error("Preencha o nome do setor");
      return;
    }

    if (editingSector) {
      setSectors(sectors.map(s =>
        s.id === editingSector.id
          ? { ...s, name: sectorForm.name, description: sectorForm.description }
          : s
      ));
      toast.success("Setor atualizado com sucesso!");
    } else {
      const newSector: Sector = {
        id: sectors.length + 1,
        name: sectorForm.name,
        description: sectorForm.description,
        active: true,
      };
      setSectors([...sectors, newSector]);
      toast.success("Setor adicionado com sucesso!");
    }

    setSectorDialogOpen(false);
    setEditingSector(null);
    setSectorForm({ name: "", description: "" });
  };

  const handleEditSector = (sector: Sector) => {
    setEditingSector(sector);
    setSectorForm({ name: sector.name, description: sector.description });
    setSectorDialogOpen(true);
  };

  const handleDeleteSector = (sector: Sector) => {
    setSectors(sectors.filter(s => s.id !== sector.id));
    toast.success(`${sector.name} removido com sucesso!`);
    setDeleteSectorDialogOpen(false);
    setSectorToDelete(null);
  };

  const handleToggleSector = (id: number) => {
    setSectors(sectors.map(s =>
      s.id === id ? { ...s, active: !s.active } : s
    ));
  };

  const handleSaveProcedure = () => {
    if (!procedureForm.name.trim() || !procedureForm.duration || !procedureForm.price) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingProcedure) {
      setProcedures(procedures.map(p =>
        p.id === editingProcedure.id
          ? {
            ...p,
            name: procedureForm.name,
            description: procedureForm.description,
            duration: parseInt(procedureForm.duration),
            price: parseFloat(procedureForm.price),
          }
          : p
      ));
      toast.success("Procedimento atualizado com sucesso!");
    } else {
      const newProcedure: Procedure = {
        id: procedures.length + 1,
        name: procedureForm.name,
        description: procedureForm.description,
        duration: parseInt(procedureForm.duration),
        price: parseFloat(procedureForm.price),
        active: true,
      };
      setProcedures([...procedures, newProcedure]);
      toast.success("Procedimento adicionado com sucesso!");
    }

    setProcedureDialogOpen(false);
    setEditingProcedure(null);
    setProcedureForm({ name: "", description: "", duration: "", price: "" });
  };

  const handleEditProcedure = (procedure: Procedure) => {
    setEditingProcedure(procedure);
    setProcedureForm({
      name: procedure.name,
      description: procedure.description,
      duration: procedure.duration.toString(),
      price: procedure.price.toString(),
    });
    setProcedureDialogOpen(true);
  };

  const handleDeleteProcedure = (procedure: Procedure) => {
    setProcedures(procedures.filter(p => p.id !== procedure.id));
    toast.success(`${procedure.name} removido com sucesso!`);
    setDeleteProcedureDialogOpen(false);
    setProcedureToDelete(null);
  };

  const handleToggleProcedure = (id: number) => {
    setProcedures(procedures.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  const handleSaveInsurance = () => {
    if (!insuranceForm.name.trim() || !insuranceForm.code.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editingInsurance) {
      setHealthInsurances(healthInsurances.map(i =>
        i.id === editingInsurance.id
          ? { ...i, name: insuranceForm.name, code: insuranceForm.code }
          : i
      ));
      toast.success("Plano de saúde atualizado com sucesso!");
    } else {
      const newInsurance: HealthInsurance = {
        id: healthInsurances.length + 1,
        name: insuranceForm.name,
        code: insuranceForm.code.toUpperCase(),
        active: true,
      };
      setHealthInsurances([...healthInsurances, newInsurance]);
      toast.success("Plano de saúde adicionado com sucesso!");
    }

    setInsuranceDialogOpen(false);
    setEditingInsurance(null);
    setInsuranceForm({ name: "", code: "" });
  };

  const handleEditInsurance = (insurance: HealthInsurance) => {
    setEditingInsurance(insurance);
    setInsuranceForm({ name: insurance.name, code: insurance.code });
    setInsuranceDialogOpen(true);
  };

  const handleDeleteInsurance = (insurance: HealthInsurance) => {
    setHealthInsurances(healthInsurances.filter(i => i.id !== insurance.id));
    toast.success(`${insurance.name} removido com sucesso!`);
    setDeleteInsuranceDialogOpen(false);
    setInsuranceToDelete(null);
  };

  const handleToggleInsurance = (id: number) => {
    setHealthInsurances(healthInsurances.map(i =>
      i.id === id ? { ...i, active: !i.active } : i
    ));
  };

  const handleTogglePermission = (role: string, permissionId: string) => {
    setRolePermissions(rolePermissions.map(rp => {
      if (rp.role === role) {
        const hasPermission = rp.permissions.includes(permissionId);
        return {
          ...rp,
          permissions: hasPermission
            ? rp.permissions.filter(p => p !== permissionId)
            : [...rp.permissions, permissionId],
        };
      }
      return rp;
    }));
  };

  const getRoleName = (role: string) => {
    const names: Record<string, string> = {
      admin: "Admin da Clínica",
      medico: "Médico/Profissional",
      recepcionista: "Recepcionista",
      financeiro: "Financeiro",
    };
    return names[role] || role;
  };

  const getRoleIcon = (role: string) => {
    if (role === "admin") return Shield;
    if (role === "medico") return Activity;
    if (role === "recepcionista") return Users;
    return DollarSign;
  };

  return (
    <TooltipProvider>
      <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-2 sm:gap-3">
            <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0 mt-1" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Configurações</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Configure o sistema de acordo com suas necessidades
              </p>
            </div>
          </div>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-10 mb-6">
            <TabsTrigger value="general" className="!data-[state=active]:bg-success !data-[state=active]:text-success-foreground">Geral</TabsTrigger>
            <TabsTrigger value="clinic" className="!data-[state=active]:bg-success !data-[state=active]:text-success-foreground">Clínica</TabsTrigger>
            <TabsTrigger value="scheduling" className="!data-[state=active]:bg-success !data-[state=active]:text-success-foreground">Agendamento</TabsTrigger>
            <TabsTrigger value="sectors" className="!data-[state=active]:bg-success !data-[state=active]:text-success-foreground">Setores</TabsTrigger>
            <TabsTrigger value="procedures" className="!data-[state=active]:bg-success !data-[state=active]:text-success-foreground">Procedimentos</TabsTrigger>
            <TabsTrigger value="insurances" className="!data-[state=active]:bg-success !data-[state=active]:text-success-foreground">Planos</TabsTrigger>
            <TabsTrigger value="permissions" className="!data-[state=active]:bg-success !data-[state=active]:text-success-foreground">Permissões</TabsTrigger>
            <TabsTrigger value="notifications" className="!data-[state=active]:bg-success !data-[state=active]:text-success-foreground">Notificações</TabsTrigger>
            <TabsTrigger value="security" className="!data-[state=active]:bg-success !data-[state=active]:text-success-foreground">Segurança</TabsTrigger>
            <TabsTrigger value="subscription" className="!data-[state=active]:bg-success !data-[state=active]:text-success-foreground">Assinatura</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações Gerais
                </CardTitle>
                <CardDescription>Personalize as configurações básicas do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select defaultValue="pt-br">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-br">Português (Brasil)</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Select defaultValue="america-sao-paulo">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="america-sao-paulo">América/São Paulo (GMT-3)</SelectItem>
                        <SelectItem value="america-new-york">América/Nova York (GMT-5)</SelectItem>
                        <SelectItem value="europe-london">Europa/Londres (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="currency">Moeda</Label>
                    <Select defaultValue="brl">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brl">Real (R$)</SelectItem>
                        <SelectItem value="usd">Dólar ($)</SelectItem>
                        <SelectItem value="eur">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clinic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Dados da Clínica
                </CardTitle>
                <CardDescription>Informações e configurações da clínica</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="clinicName">Nome da Clínica *</Label>
                    <Input
                      id="clinicName"
                      value={clinicData.name}
                      onChange={(e) => setClinicData({ ...clinicData, name: e.target.value })}
                      placeholder="Digite o nome da clínica"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <MaskedInput
                      id="cnpj"
                      mask="cnpj"
                      placeholder="00.000.000/0000-00"
                      value={clinicData.cnpj}
                      onChange={(value) => setClinicData({ ...clinicData, cnpj: value })}
                      maxLength={18}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Endereço Completo *</Label>
                  <Input
                    id="address"
                    placeholder="Rua, número, bairro"
                    value={clinicData.address}
                    onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      placeholder="São Paulo"
                      value={clinicData.city}
                      onChange={(e) => setClinicData({ ...clinicData, city: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Select
                      value={clinicData.state}
                      onValueChange={(value) => setClinicData({ ...clinicData, state: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ac">Acre</SelectItem>
                        <SelectItem value="al">Alagoas</SelectItem>
                        <SelectItem value="ap">Amapá</SelectItem>
                        <SelectItem value="am">Amazonas</SelectItem>
                        <SelectItem value="ba">Bahia</SelectItem>
                        <SelectItem value="ce">Ceará</SelectItem>
                        <SelectItem value="df">Distrito Federal</SelectItem>
                        <SelectItem value="es">Espírito Santo</SelectItem>
                        <SelectItem value="go">Goiás</SelectItem>
                        <SelectItem value="ma">Maranhão</SelectItem>
                        <SelectItem value="mt">Mato Grosso</SelectItem>
                        <SelectItem value="ms">Mato Grosso do Sul</SelectItem>
                        <SelectItem value="mg">Minas Gerais</SelectItem>
                        <SelectItem value="pa">Pará</SelectItem>
                        <SelectItem value="pb">Paraíba</SelectItem>
                        <SelectItem value="pr">Paraná</SelectItem>
                        <SelectItem value="pe">Pernambuco</SelectItem>
                        <SelectItem value="pi">Piauí</SelectItem>
                        <SelectItem value="rj">Rio de Janeiro</SelectItem>
                        <SelectItem value="rn">Rio Grande do Norte</SelectItem>
                        <SelectItem value="rs">Rio Grande do Sul</SelectItem>
                        <SelectItem value="ro">Rondônia</SelectItem>
                        <SelectItem value="rr">Roraima</SelectItem>
                        <SelectItem value="sc">Santa Catarina</SelectItem>
                        <SelectItem value="sp">São Paulo</SelectItem>
                        <SelectItem value="se">Sergipe</SelectItem>
                        <SelectItem value="to">Tocantins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <MaskedInput
                      id="cep"
                      mask="cep"
                      placeholder="00000-000"
                      value={clinicData.cep}
                      onChange={(value) => setClinicData({ ...clinicData, cep: value })}
                      maxLength={9}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <MaskedInput
                      id="phone"
                      mask="phone"
                      placeholder="(00) 00000-0000"
                      value={clinicData.phone}
                      onChange={(value) => setClinicData({ ...clinicData, phone: value })}
                      maxLength={15}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contato@CactoSaude.com"
                      value={clinicData.email}
                      onChange={(e) => setClinicData({ ...clinicData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://www.CactoSaude.com"
                    value={clinicData.website}
                    onChange={(e) => setClinicData({ ...clinicData, website: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Validações
                      if (!clinicData.name || !clinicData.name.trim()) {
                        toast.error("Nome da clínica é obrigatório");
                        return;
                      }
                      if (!clinicData.cnpj || !clinicData.cnpj.trim()) {
                        toast.error("CNPJ é obrigatório");
                        return;
                      }
                      if (!validateCNPJ(clinicData.cnpj)) {
                        toast.error("CNPJ inválido");
                        return;
                      }
                      if (!clinicData.address || !clinicData.address.trim()) {
                        toast.error("Endereço é obrigatório");
                        return;
                      }
                      if (!clinicData.city || !clinicData.city.trim()) {
                        toast.error("Cidade é obrigatória");
                        return;
                      }
                      if (!clinicData.cep || !clinicData.cep.trim()) {
                        toast.error("CEP é obrigatório");
                        return;
                      }
                      if (!validateCEP(clinicData.cep)) {
                        toast.error("CEP inválido");
                        return;
                      }
                      if (!clinicData.phone || !clinicData.phone.trim()) {
                        toast.error("Telefone é obrigatório");
                        return;
                      }
                      if (!validatePhone(clinicData.phone)) {
                        toast.error("Telefone inválido. Use o formato (00) 00000-0000");
                        return;
                      }
                      if (!clinicData.email || !clinicData.email.trim()) {
                        toast.error("Email é obrigatório");
                        return;
                      }
                      if (!validateEmail(clinicData.email)) {
                        toast.error("Email inválido");
                        return;
                      }

                      toast.success("Dados da clínica salvos com sucesso!");
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Dados da Clínica
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduling" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Configurações de Agendamento
                </CardTitle>
                <CardDescription>Defina regras para agendamentos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="slotDuration">Duração Padrão (minutos)</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="advanceBooking">Antecedência Máxima (dias)</Label>
                    <Input id="advanceBooking" type="number" defaultValue="30" />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Horário de Funcionamento</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Defina os horários de funcionamento para cada dia da semana
                  </p>
                  <div className="space-y-3">
                    {workSchedule.map((schedule, index) => {
                      const lunchBreak = schedule.lunchBreak || { enabled: false, start: "", end: "" };
                      return (
                        <div key={schedule.day} className="p-4 rounded-lg border bg-muted/30 space-y-3">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={schedule.enabled}
                              onCheckedChange={(checked) => handleWorkScheduleChange(index, "enabled", checked)}
                            />
                            <Label className="font-medium">{schedule.day}</Label>
                          </div>
                          {schedule.enabled && (
                            <>
                              <div className="flex items-center gap-2">
                                <div className="grid gap-1 flex-1">
                                  <Label className="text-xs text-muted-foreground">Horário de Funcionamento</Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="time"
                                      value={schedule.start}
                                      onChange={(e) => handleWorkScheduleChange(index, "start", e.target.value)}
                                      className="w-full"
                                    />
                                    <span className="text-muted-foreground">até</span>
                                    <Input
                                      type="time"
                                      value={schedule.end}
                                      onChange={(e) => handleWorkScheduleChange(index, "end", e.target.value)}
                                      className="w-full"
                                    />
                                  </div>
                                </div>
                              </div>
                              <Separator />
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-xs font-medium">Horário de Almoço da Clínica</Label>
                                  <Switch
                                    checked={lunchBreak.enabled}
                                    onCheckedChange={(checked) => {
                                      setWorkSchedule(prev => prev.map((s, i) =>
                                        i === index ? {
                                          ...s,
                                          lunchBreak: {
                                            enabled: checked,
                                            start: checked ? (s.lunchBreak?.start || "12:00") : "",
                                            end: checked ? (s.lunchBreak?.end || "13:00") : ""
                                          }
                                        } : s
                                      ));
                                    }}
                                  />
                                </div>
                                {lunchBreak.enabled && (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="time"
                                      value={lunchBreak.start}
                                      onChange={(e) => {
                                        setWorkSchedule(prev => prev.map((s, i) =>
                                          i === index ? {
                                            ...s,
                                            lunchBreak: {
                                              ...s.lunchBreak!,
                                              start: e.target.value
                                            }
                                          } : s
                                        ));
                                      }}
                                      className="w-full"
                                    />
                                    <span className="text-muted-foreground">até</span>
                                    <Input
                                      type="time"
                                      value={lunchBreak.end}
                                      onChange={(e) => {
                                        setWorkSchedule(prev => prev.map((s, i) =>
                                          i === index ? {
                                            ...s,
                                            lunchBreak: {
                                              ...s.lunchBreak!,
                                              end: e.target.value
                                            }
                                          } : s
                                        ));
                                      }}
                                      className="w-full"
                                    />
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                          {!schedule.enabled && (
                            <Badge variant="outline" className="w-fit">Fechado</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Permitir Overbooking</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir mais de um agendamento no mesmo horário
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sectors" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Setores da Clínica
                    </CardTitle>
                    <CardDescription>Gerencie os setores e áreas da clínica</CardDescription>
                  </div>
                  <Dialog open={sectorDialogOpen} onOpenChange={(open) => {
                    setSectorDialogOpen(open);
                    if (!open) {
                      setEditingSector(null);
                      setSectorForm({ name: "", description: "" });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Setor
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingSector ? "Editar Setor" : "Novo Setor"}</DialogTitle>
                        <DialogDescription>
                          {editingSector ? "Edite as informações do setor" : "Adicione um novo setor à clínica"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="sectorName">Nome do Setor *</Label>
                          <Input
                            id="sectorName"
                            placeholder="Ex: Recepção, Consultório 1..."
                            value={sectorForm.name}
                            onChange={(e) => setSectorForm({ ...sectorForm, name: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="sectorDescription">Descrição</Label>
                          <Textarea
                            id="sectorDescription"
                            placeholder="Descreva o setor..."
                            value={sectorForm.description}
                            onChange={(e) => setSectorForm({ ...sectorForm, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setSectorDialogOpen(false);
                          setEditingSector(null);
                          setSectorForm({ name: "", description: "" });
                        }}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveSector}>
                          {editingSector ? "Salvar Alterações" : "Adicionar"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Nome</TableHead>
                        <TableHead className="font-semibold">Descrição</TableHead>
                        <TableHead className="text-center font-semibold">Status</TableHead>
                        <TableHead className="text-right font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sectors.map((sector) => (
                        <TableRow key={sector.id} className="hover:bg-muted/30 border-b">
                          <TableCell className="font-medium">{sector.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{sector.description}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={sector.active ? "default" : "secondary"}
                              className="cursor-pointer"
                              onClick={() => handleToggleSector(sector.id)}
                            >
                              {sector.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 bg-info/10 text-info hover:bg-info/20 hover:text-info"
                                    onClick={() => handleEditSector(sector)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Editar setor</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                                    onClick={() => {
                                      setSectorToDelete(sector);
                                      setDeleteSectorDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Remover setor</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="procedures" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Procedimentos
                    </CardTitle>
                    <CardDescription>Cadastre e gerencie os procedimentos oferecidos pela clínica</CardDescription>
                  </div>
                  <Dialog open={procedureDialogOpen} onOpenChange={(open) => {
                    setProcedureDialogOpen(open);
                    if (!open) {
                      setEditingProcedure(null);
                      setProcedureForm({ name: "", description: "", duration: "", price: "" });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Procedimento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>{editingProcedure ? "Editar Procedimento" : "Novo Procedimento"}</DialogTitle>
                        <DialogDescription>
                          {editingProcedure ? "Edite as informações do procedimento" : "Adicione um novo procedimento"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="procedureName">Nome do Procedimento *</Label>
                          <Input
                            id="procedureName"
                            placeholder="Ex: Consulta Geral, Retorno..."
                            value={procedureForm.name}
                            onChange={(e) => setProcedureForm({ ...procedureForm, name: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="procedureDescription">Descrição</Label>
                          <Textarea
                            id="procedureDescription"
                            placeholder="Descreva o procedimento..."
                            value={procedureForm.description}
                            onChange={(e) => setProcedureForm({ ...procedureForm, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="procedureDuration">Duração (min) *</Label>
                            <Input
                              id="procedureDuration"
                              type="number"
                              placeholder="30"
                              value={procedureForm.duration}
                              onChange={(e) => setProcedureForm({ ...procedureForm, duration: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="procedurePrice">Valor (R$) *</Label>
                            <Input
                              id="procedurePrice"
                              type="number"
                              step="0.01"
                              placeholder="150.00"
                              value={procedureForm.price}
                              onChange={(e) => setProcedureForm({ ...procedureForm, price: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setProcedureDialogOpen(false);
                          setEditingProcedure(null);
                          setProcedureForm({ name: "", description: "", duration: "", price: "" });
                        }}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveProcedure}>
                          {editingProcedure ? "Salvar Alterações" : "Adicionar"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Nome</TableHead>
                        <TableHead className="font-semibold">Descrição</TableHead>
                        <TableHead className="text-center font-semibold">Duração</TableHead>
                        <TableHead className="text-center font-semibold">Valor</TableHead>
                        <TableHead className="text-center font-semibold">Status</TableHead>
                        <TableHead className="text-right font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {procedures.map((procedure) => (
                        <TableRow key={procedure.id} className="hover:bg-muted/30 border-b">
                          <TableCell className="font-medium">{procedure.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{procedure.description}</TableCell>
                          <TableCell className="text-center">{procedure.duration} min</TableCell>
                          <TableCell className="text-center font-semibold">
                            R$ {procedure.price.toFixed(2).replace('.', ',')}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={procedure.active ? "default" : "secondary"}
                              className="cursor-pointer"
                              onClick={() => handleToggleProcedure(procedure.id)}
                            >
                              {procedure.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 bg-info/10 text-info hover:bg-info/20 hover:text-info"
                                    onClick={() => handleEditProcedure(procedure)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Editar procedimento</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                                    onClick={() => {
                                      setProcedureToDelete(procedure);
                                      setDeleteProcedureDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Remover procedimento</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insurances" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Planos de Saúde
                    </CardTitle>
                    <CardDescription>Gerencie os convênios aceitos pela clínica</CardDescription>
                  </div>
                  <Dialog open={insuranceDialogOpen} onOpenChange={(open) => {
                    setInsuranceDialogOpen(open);
                    if (!open) {
                      setEditingInsurance(null);
                      setInsuranceForm({ name: "", code: "" });
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Plano
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingInsurance ? "Editar Plano de Saúde" : "Novo Plano de Saúde"}</DialogTitle>
                        <DialogDescription>
                          {editingInsurance ? "Edite as informações do plano" : "Adicione um novo plano de saúde"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="insuranceName">Nome do Plano *</Label>
                          <Input
                            id="insuranceName"
                            placeholder="Ex: Unimed, Bradesco Saúde..."
                            value={insuranceForm.name}
                            onChange={(e) => setInsuranceForm({ ...insuranceForm, name: e.target.value })}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="insuranceCode">Código *</Label>
                          <Input
                            id="insuranceCode"
                            placeholder="Ex: UNI, BRA..."
                            value={insuranceForm.code}
                            onChange={(e) => setInsuranceForm({ ...insuranceForm, code: e.target.value.toUpperCase() })}
                            maxLength={10}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => {
                          setInsuranceDialogOpen(false);
                          setEditingInsurance(null);
                          setInsuranceForm({ name: "", code: "" });
                        }}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSaveInsurance}>
                          {editingInsurance ? "Salvar Alterações" : "Adicionar"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Nome</TableHead>
                        <TableHead className="font-semibold">Código</TableHead>
                        <TableHead className="text-center font-semibold">Status</TableHead>
                        <TableHead className="text-right font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {healthInsurances.map((insurance) => (
                        <TableRow key={insurance.id} className="hover:bg-muted/30 border-b">
                          <TableCell className="font-medium">{insurance.name}</TableCell>
                          <TableCell className="font-mono text-sm">{insurance.code}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={insurance.active ? "default" : "secondary"}
                              className="cursor-pointer"
                              onClick={() => handleToggleInsurance(insurance.id)}
                            >
                              {insurance.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 bg-info/10 text-info hover:bg-info/20 hover:text-info"
                                    onClick={() => handleEditInsurance(insurance)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Editar plano</p>
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                                    onClick={() => {
                                      setInsuranceToDelete(insurance);
                                      setDeleteInsuranceDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Remover plano</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Gestão de Permissões
                </CardTitle>
                <CardDescription>Configure as permissões de acesso por nível de usuário</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {rolePermissions.map((rolePerm) => {
                  const RoleIcon = getRoleIcon(rolePerm.role);
                  return (
                    <Card key={rolePerm.role} className="border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <RoleIcon className="h-5 w-5 text-primary" />
                          {getRoleName(rolePerm.role)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {permissions.map((permission) => {
                            const hasPermission = rolePerm.permissions.includes(permission.id);
                            return (
                              <div
                                key={permission.id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    {hasPermission ? (
                                      <CheckCircle className="h-4 w-4 text-success" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <Label className="font-medium text-sm cursor-pointer">
                                      {permission.name}
                                    </Label>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                                    {permission.description}
                                  </p>
                                </div>
                                <Switch
                                  checked={hasPermission}
                                  onCheckedChange={() => handleTogglePermission(rolePerm.role, permission.id)}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações e Lembretes
                </CardTitle>
                <CardDescription>Configure como deseja receber notificações e lembretes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Novos Agendamentos</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificar sobre novos agendamentos
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cancelamentos</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificar sobre cancelamentos de agendamentos
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Lembretes de Consulta</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar lembretes automáticos antes das consultas
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Pagamentos Recebidos</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificar quando um pagamento for confirmado
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Pagamentos Atrasados</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertar sobre pagamentos em atraso
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Novos Pacientes</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificar sobre cadastro de novos pacientes
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Estoque Baixo</Label>
                      <p className="text-sm text-muted-foreground">
                        Alertar quando itens estiverem com estoque baixo
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Lembretes por Email</Label>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Relatórios Diários</Label>
                        <p className="text-sm text-muted-foreground">
                          Receber relatório diário por email
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Relatórios Semanais</Label>
                        <p className="text-sm text-muted-foreground">
                          Receber relatório semanal por email
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Relatórios Mensais</Label>
                        <p className="text-sm text-muted-foreground">
                          Receber relatório mensal por email
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Segurança
                </CardTitle>
                <CardDescription>Gerencie a segurança da sua conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input id="currentPassword" type="password" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input id="newPassword" type="password" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>

                  <Button className="w-full">Alterar Senha</Button>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Logout Automático</Label>
                      <p className="text-sm text-muted-foreground">
                        Desconectar após 30 minutos de inatividade
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Sessões Ativas</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">Chrome - Windows</p>
                        <p className="text-sm text-muted-foreground">São Paulo, Brasil • Sessão Atual</p>
                      </div>
                      <Badge className="bg-success/10 text-success">Ativo</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Assinatura do Sistema
                </CardTitle>
                <CardDescription>Gerencie o pagamento e informações da sua assinatura</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informações do Plano Atual */}
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Plano Atual</h3>
                        <p className="text-sm text-muted-foreground">Plano Premium - Gestão Completa</p>
                      </div>
                      <Badge className="bg-success/10 text-success border-success/20">Ativo</Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 mt-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Valor Mensal</Label>
                        <p className="text-2xl font-bold text-primary">R$ 299,90</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Próximo Vencimento</Label>
                        <p className="text-lg font-semibold">15/02/2024</p>
                        <p className="text-xs text-muted-foreground">Faltam 12 dias</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Método de Pagamento */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Método de Pagamento</Label>
                        <p className="text-sm text-muted-foreground">Cartão de crédito cadastrado</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Alterar
                      </Button>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 rounded bg-primary/20 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">Cartão de Crédito</p>
                          <p className="text-sm text-muted-foreground">**** **** **** 4242</p>
                          <p className="text-xs text-muted-foreground mt-1">Válido até 12/2025</p>
                        </div>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          Principal
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Histórico de Pagamentos */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Histórico de Pagamentos</Label>
                      <Button variant="ghost" size="sm">
                        Ver Todos
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Pagamento Realizado</p>
                            <p className="text-xs text-muted-foreground">15/01/2024 • R$ 299,90</p>
                          </div>
                        </div>
                        <Badge className="bg-success/10 text-success">Pago</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Pagamento Realizado</p>
                            <p className="text-xs text-muted-foreground">15/12/2023 • R$ 299,90</p>
                          </div>
                        </div>
                        <Badge className="bg-success/10 text-success">Pago</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Pagamento Realizado</p>
                            <p className="text-xs text-muted-foreground">15/11/2023 • R$ 299,90</p>
                          </div>
                        </div>
                        <Badge className="bg-success/10 text-success">Pago</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Informações da Assinatura */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Informações da Assinatura</Label>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Data de Início</Label>
                        <p className="font-medium">15/11/2023</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Ciclo de Cobrança</Label>
                        <p className="font-medium">Mensal</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Status</Label>
                        <Badge className="bg-success/10 text-success">Ativa</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Ações */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="flex-1">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Atualizar Método de Pagamento
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Ver Faturas
                    </Button>
                    <Button variant="outline" className="flex-1 text-destructive hover:text-destructive">
                      Cancelar Assinatura
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* AlertDialog de Confirmação de Exclusão de Setor */}
        <AlertDialog open={deleteSectorDialogOpen} onOpenChange={setDeleteSectorDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o setor <strong>{sectorToDelete?.name}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSectorToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (sectorToDelete) {
                    handleDeleteSector(sectorToDelete);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* AlertDialog de Confirmação de Exclusão de Procedimento */}
        <AlertDialog open={deleteProcedureDialogOpen} onOpenChange={setDeleteProcedureDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o procedimento <strong>{procedureToDelete?.name}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setProcedureToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (procedureToDelete) {
                    handleDeleteProcedure(procedureToDelete);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* AlertDialog de Confirmação de Exclusão de Plano de Saúde */}
        <AlertDialog open={deleteInsuranceDialogOpen} onOpenChange={setDeleteInsuranceDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o plano de saúde <strong>{insuranceToDelete?.name}</strong>?
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setInsuranceToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (insuranceToDelete) {
                    handleDeleteInsurance(insuranceToDelete);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default Configuracoes;
