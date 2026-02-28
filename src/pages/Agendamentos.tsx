import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Plus, Search, Filter, Edit, Trash2, CheckCircle, XCircle, CalendarClock, Video, User, Camera, Building2, Monitor, X } from "lucide-react";
import { toast } from "sonner";
import { appointmentService, Appointment } from "@/lib/appointmentService";

const Agendamentos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProfessional, setFilterProfessional] = useState("all");
  const [filterModality, setFilterModality] = useState("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editFormData, setEditFormData] = useState({
    patient: "",
    professional: "",
    date: "",
    time: "",
    type: "",
    modality: "presencial" as "presencial" | "online",
    duration: 60,
  });
  const [rescheduleFormData, setRescheduleFormData] = useState({
    date: "",
    time: "",
  });
  const [timeConflictError, setTimeConflictError] = useState("");
  const [rescheduleTimeConflictError, setRescheduleTimeConflictError] = useState("");

  // Gerar horários disponíveis (igual AgendaProfissional - intervalos de 15 minutos)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      for (let min = 0; min < 60; min += 15) {
        slots.push({ hour, minute: min, display: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}` });
      }
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();

  // Verificar se um horário está disponível (similar a AgendaProfissional)
  const isTimeSlotAvailable = (time: string, date: string, duration: number, excludeId?: number) => {
    if (!date) return true;
    
    // Verificar se é horário passado (apenas para hoje)
    const isToday = date === new Date().toISOString().split('T')[0];
    if (isToday && appointmentService.isPastTime(date, time)) {
      return false;
    }
    
    // Verificar conflito usando o serviço
    return !appointmentService.checkTimeConflict(date, time, duration, excludeId);
  };

  // Carregar agendamentos do serviço
  useEffect(() => {
    const loadAppointments = () => {
      setAppointments(appointmentService.getAllAppointments());
    };
    
    loadAppointments();
    
    // Escutar mudanças
    const unsubscribe = appointmentService.onAppointmentsChange(loadAppointments);
    return unsubscribe;
  }, []);

  // Aplicar filtro da URL ao carregar a página
  useEffect(() => {
    const statusFilter = searchParams.get('status');
    if (statusFilter) {
      setFilterStatus(statusFilter);
    }
  }, [searchParams]);
  
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionAppointmentId, setActionAppointmentId] = useState<number | null>(null);

  // Form state for new appointment
  const [newFormData, setNewFormData] = useState({
    patient: "",
    professional: "",
    date: "",
    time: "",
      type: "Consulta",
    modality: "presencial" as "presencial" | "online",
    duration: 60,
  });

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = appointment.patient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
    const matchesProfessional = filterProfessional === "all" || appointment.professional === filterProfessional;
    const matchesModality = filterModality === "all" || appointment.modality === filterModality;
    return matchesSearch && matchesStatus && matchesProfessional && matchesModality;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: { label: "Confirmado", className: "bg-success/10 text-success hover:bg-success/20" },
      pending: { label: "Pendente", className: "bg-warning/10 text-warning hover:bg-warning/20" },
      cancelled: { label: "Cancelado", className: "bg-destructive/10 text-destructive hover:bg-destructive/20" },
    };
    const variant = variants[status as keyof typeof variants];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const handleConfirm = () => {
    if (actionAppointmentId) {
      const updated = appointmentService.confirmAppointment(actionAppointmentId);
      if (updated) {
      toast.success("Agendamento confirmado com sucesso!");
      setConfirmDialogOpen(false);
      setActionAppointmentId(null);
      } else {
        toast.error("Erro ao confirmar agendamento");
      }
    }
  };

  const handleCancel = () => {
    if (actionAppointmentId) {
      const updated = appointmentService.cancelAppointment(actionAppointmentId);
      if (updated) {
        toast.success("Agendamento cancelado");
      setCancelDialogOpen(false);
      setActionAppointmentId(null);
      } else {
        toast.error("Erro ao cancelar agendamento");
      }
    }
  };

  const handleDelete = () => {
    if (actionAppointmentId) {
      const deleted = appointmentService.deleteAppointment(actionAppointmentId);
      if (deleted) {
      toast.success("Agendamento excluído");
      setDeleteDialogOpen(false);
      setActionAppointmentId(null);
      } else {
        toast.error("Erro ao excluir agendamento");
      }
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setEditFormData({
      patient: appointment.patient,
      professional: appointment.professional,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      modality: appointment.modality,
      duration: appointment.duration,
    });
    setEditOpen(true);
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleFormData({
      date: appointment.date,
      time: appointment.time,
    });
    setRescheduleOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedAppointment) return;

    // Validações
    if (!editFormData.patient.trim()) {
      toast.error("Nome do paciente é obrigatório");
      return;
    }
    if (!editFormData.date) {
      toast.error("Data é obrigatória");
      return;
    }
    if (!editFormData.time) {
      toast.error("Horário é obrigatório");
      return;
    }
    if (appointmentService.isPastDate(editFormData.date)) {
      toast.error("Não é possível agendar em datas passadas");
      return;
    }
    if (!appointmentService.isPastDate(editFormData.date) && appointmentService.isPastTime(editFormData.date, editFormData.time)) {
      toast.error("Não é possível agendar em horários já passados");
      return;
    }
    
    // Verificar conflito (exceto o próprio agendamento)
    if (appointmentService.checkTimeConflict(editFormData.date, editFormData.time, editFormData.duration, selectedAppointment.id)) {
      toast.error("Já existe um agendamento ou bloqueio neste horário. Escolha outro horário.");
      return;
    }

    const updated = appointmentService.updateAppointment(selectedAppointment.id, {
      patient: editFormData.patient,
      professional: editFormData.professional,
      date: editFormData.date,
      time: editFormData.time,
      type: editFormData.type,
      modality: editFormData.modality,
      duration: editFormData.duration,
    });

    if (updated) {
      toast.success("Agendamento atualizado com sucesso!");
      setEditOpen(false);
      setSelectedAppointment(null);
    } else {
      toast.error("Erro ao atualizar agendamento");
    }
  };

  const handleSaveReschedule = () => {
    if (!selectedAppointment) return;

    // Validações
    if (!rescheduleFormData.date) {
      toast.error("Data é obrigatória");
      return;
    }
    if (!rescheduleFormData.time) {
      toast.error("Horário é obrigatório");
      return;
    }
    if (appointmentService.isPastDate(rescheduleFormData.date)) {
      toast.error("Não é possível agendar em datas passadas");
      return;
    }
    if (!appointmentService.isPastDate(rescheduleFormData.date) && appointmentService.isPastTime(rescheduleFormData.date, rescheduleFormData.time)) {
      toast.error("Não é possível agendar em horários já passados");
      return;
    }
    
    // Verificar conflito (exceto o próprio agendamento)
    if (appointmentService.checkTimeConflict(rescheduleFormData.date, rescheduleFormData.time, selectedAppointment.duration, selectedAppointment.id)) {
      toast.error("Já existe um agendamento ou bloqueio neste horário. Escolha outro horário.");
      return;
    }

    const updated = appointmentService.rescheduleAppointment(
      selectedAppointment.id,
      rescheduleFormData.date,
      rescheduleFormData.time
    );

    if (updated) {
      toast.success("Agendamento remarcado com sucesso!");
      setRescheduleOpen(false);
      setSelectedAppointment(null);
    } else {
      toast.error("Erro ao remarcar agendamento");
    }
  };

  const handleCreateAppointment = () => {
    // Validações
    if (!newFormData.patient.trim()) {
      toast.error("Nome do paciente é obrigatório");
      return;
    }
    if (!newFormData.professional) {
      toast.error("Profissional é obrigatório");
      return;
    }
    if (!newFormData.date) {
      toast.error("Data é obrigatória");
      return;
    }
    if (!newFormData.time) {
      toast.error("Horário é obrigatório");
      return;
    }
    if (appointmentService.isPastDate(newFormData.date)) {
      toast.error("Não é possível agendar em datas passadas");
      return;
    }
    if (!appointmentService.isPastDate(newFormData.date) && appointmentService.isPastTime(newFormData.date, newFormData.time)) {
      toast.error("Não é possível agendar em horários já passados");
      return;
    }
    
    // Verificar conflito
    if (appointmentService.checkTimeConflict(newFormData.date, newFormData.time, newFormData.duration)) {
      toast.error("Já existe um agendamento ou bloqueio neste horário. Escolha outro horário.");
      return;
    }

    const newApt = appointmentService.createAppointment({
      patient: newFormData.patient,
      professional: newFormData.professional,
      date: newFormData.date,
      time: newFormData.time,
      type: newFormData.type,
      modality: newFormData.modality,
      status: "pending",
      duration: newFormData.duration,
    });

    if (newApt) {
      toast.success(`Agendamento criado: ${newFormData.patient} - ${new Date(newFormData.date).toLocaleDateString('pt-BR')} às ${newFormData.time}`);
      setNewAppointmentOpen(false);
      setNewFormData({
        patient: "",
        professional: "",
        date: "",
        time: "",
        type: "Consulta",
        modality: "presencial",
        duration: 60,
      });
    } else {
      toast.error("Erro ao criar agendamento");
    }
  };

  return (
    <TooltipProvider>
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-baseline gap-3">
          <Calendar className="h-8 w-8 text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Agendamentos</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Gerencie todos os agendamentos da clínica
            </p>
          </div>
        </div>
          <Button 
            className="bg-primary hover:bg-primary/90 w-full md:w-auto" 
            onClick={() => setNewAppointmentOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Total Hoje
                <Calendar className="h-4 w-4 text-primary" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">24</div>
              <p className="text-xs text-muted-foreground mt-1">
                Agendamentos para hoje
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Confirmados
                <CheckCircle className="h-4 w-4 text-success" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">18</div>
              <p className="text-xs text-muted-foreground mt-1">
                Consultas confirmadas
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Pendentes
                <Clock className="h-4 w-4 text-warning" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">4</div>
              <p className="text-xs text-muted-foreground mt-1">
                Aguardando confirmação
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-destructive">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                Cancelados
                <XCircle className="h-4 w-4 text-destructive" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">2</div>
              <p className="text-xs text-muted-foreground mt-1">
                Consultas canceladas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto flex-wrap">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="confirmed">Confirmados</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterProfessional} onValueChange={setFilterProfessional}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <User className="mr-2 h-4 w-4 flex-shrink-0" />
                    <SelectValue placeholder="Profissional">
                      {filterProfessional === "all" ? (
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          Todos Profissionais
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          {filterProfessional}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Profissionais</SelectItem>
                    <SelectItem value="Dr. João Silva">Dr. João Silva</SelectItem>
                    <SelectItem value="Dra. Maria Costa">Dra. Maria Costa</SelectItem>
                    <SelectItem value="Dr. Pedro Santos">Dr. Pedro Santos</SelectItem>
                    <SelectItem value="Dra. Ana Lima">Dra. Ana Lima</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterModality} onValueChange={setFilterModality}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Monitor className="mr-2 h-4 w-4 flex-shrink-0" />
                    <SelectValue placeholder="Modalidade">
                      {filterModality === "all" ? (
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          Todas Modalidades
                        </span>
                      ) : filterModality === "presencial" ? (
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          Presencial
                        </span>
                      ) : filterModality === "online" ? (
                        <span className="flex items-center gap-2 whitespace-nowrap">
                          Online
                        </span>
                      ) : (
                        "Modalidade"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Todas Modalidades
                      </div>
                    </SelectItem>
                    <SelectItem value="presencial">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Presencial
                      </div>
                    </SelectItem>
                    <SelectItem value="online">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Online
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="scrollbar-hide-x">
            <div className="min-w-[500px] sm:min-w-[600px] md:min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="whitespace-nowrap font-semibold">Paciente</TableHead>
                  <TableHead className="whitespace-nowrap font-semibold">Profissional</TableHead>
                  <TableHead className="whitespace-nowrap font-semibold">Data</TableHead>
                  <TableHead className="whitespace-nowrap font-semibold">Horário</TableHead>
                  <TableHead className="whitespace-nowrap font-semibold">Tipo</TableHead>
                  <TableHead className="whitespace-nowrap font-semibold">Modalidade</TableHead>
                  <TableHead className="whitespace-nowrap font-semibold">Status</TableHead>
                  <TableHead className="whitespace-nowrap font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id} className="hover:bg-muted/30 border-b">
                    <TableCell className="font-medium">{appointment.patient}</TableCell>
                    <TableCell>{appointment.professional}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(appointment.date + 'T00:00:00').toLocaleDateString("pt-BR")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {appointment.time}
                      </div>
                    </TableCell>
                    <TableCell>{appointment.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={appointment.modality === "presencial" ? "bg-info/10 text-info" : "bg-primary/10 text-primary"}>
                        {appointment.modality === "presencial" ? "Presencial" : "Online"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {appointment.status === "pending" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setActionAppointmentId(appointment.id);
                                  setConfirmDialogOpen(true);
                                }}
                                className="h-8 w-8 bg-success/10 text-success hover:bg-success/20 hover:text-success"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Confirmar agendamento</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(appointment)}
                              className="h-8 w-8 bg-info/10 text-info hover:bg-info/20 hover:text-info"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar agendamento</p>
                          </TooltipContent>
                        </Tooltip>
                        {appointment.status !== "cancelled" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReschedule(appointment)}
                                className="h-8 w-8 bg-warning/10 text-warning hover:bg-warning/20 hover:text-warning"
                              >
                                <CalendarClock className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Remarcar agendamento</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {appointment.status !== "cancelled" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setActionAppointmentId(appointment.id);
                                  setCancelDialogOpen(true);
                                }}
                                className="h-8 w-8 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 hover:text-orange-600"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cancelar agendamento</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setActionAppointmentId(appointment.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="h-8 w-8 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir agendamento</p>
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
          <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Agendamento</DialogTitle>
              <DialogDescription>
                Atualize os dados do agendamento
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-patient">Paciente *</Label>
                <Input
                  id="edit-patient"
                  value={editFormData.patient}
                  onChange={(e) => setEditFormData({ ...editFormData, patient: e.target.value })}
                  placeholder="Nome do paciente"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-professional">Profissional *</Label>
                <Select 
                  value={editFormData.professional} 
                  onValueChange={(value) => setEditFormData({ ...editFormData, professional: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. João Silva">Dr. João Silva</SelectItem>
                    <SelectItem value="Dra. Maria Costa">Dra. Maria Costa</SelectItem>
                    <SelectItem value="Dr. Pedro Santos">Dr. Pedro Santos</SelectItem>
                    <SelectItem value="Dra. Ana Lima">Dra. Ana Lima</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Data *</Label>
                <Input 
                  id="edit-date" 
                  type="date" 
                  value={editFormData.date}
                  onChange={(e) => {
                    setEditFormData({ ...editFormData, date: e.target.value, time: "" });
                    setTimeConflictError("");
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-time">Horário *</Label>
                <Select 
                  value={editFormData.time} 
                  onValueChange={(value) => {
                    setEditFormData({ ...editFormData, time: value });
                    setTimeConflictError("");
                  }}
                  disabled={!editFormData.date}
                  key={`edit-time-select-${editFormData.date}-${editFormData.duration}`}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => {
                      const available = editFormData.date 
                        ? isTimeSlotAvailable(slot.display, editFormData.date, editFormData.duration, selectedAppointment?.id)
                        : true;
                      return (
                        <SelectItem 
                          key={`${slot.display}-${editFormData.date}-${editFormData.duration}`} 
                          value={slot.display}
                          disabled={!available}
                        >
                          {slot.display} {!available && "(Ocupado)"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {timeConflictError && (
                  <p className="text-sm text-destructive">{timeConflictError}</p>
                )}
              </div>
                <div className="grid gap-2">
                <Label htmlFor="edit-type">Tipo de Consulta *</Label>
                <Select 
                  value={editFormData.type} 
                  onValueChange={(value) => setEditFormData({ ...editFormData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consulta">Consulta</SelectItem>
                    <SelectItem value="Retorno">Retorno</SelectItem>
                    <SelectItem value="Primeira Consulta">Primeira Consulta</SelectItem>
                    <SelectItem value="Exame">Exame</SelectItem>
                  </SelectContent>
                </Select>
                </div>
                <div className="grid gap-2">
                <Label htmlFor="edit-modality">Modalidade *</Label>
                <Select 
                  value={editFormData.modality} 
                  onValueChange={(value: "presencial" | "online") => setEditFormData({ ...editFormData, modality: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
                </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-duration">Duração (minutos) *</Label>
                <Select 
                  value={editFormData.duration.toString()} 
                  onValueChange={(value) => {
                    const newDuration = parseInt(value);
                    setEditFormData({ ...editFormData, duration: newDuration, time: "" });
                    setTimeConflictError("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                    <SelectItem value="120">120 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setEditOpen(false);
                setSelectedAppointment(null);
                setTimeConflictError("");
              }}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={!!timeConflictError || !editFormData.date || !editFormData.time}>
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Appointment Dialog */}
        <Dialog open={newAppointmentOpen} onOpenChange={(open) => {
          setNewAppointmentOpen(open);
          if (!open) {
            setNewFormData({
              patient: "",
              professional: "",
              date: "",
              time: "",
              type: "Consulta",
              modality: "presencial",
              duration: 60,
            });
          }
        }}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
              <DialogDescription>
                Crie um novo agendamento para um paciente
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="new-patient">Paciente *</Label>
                <Input
                  id="new-patient"
                  placeholder="Nome do paciente"
                  value={newFormData.patient}
                  onChange={(e) => setNewFormData({ ...newFormData, patient: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="new-professional">Profissional *</Label>
                <Select 
                  value={newFormData.professional} 
                  onValueChange={(value) => setNewFormData({ ...newFormData, professional: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. João Silva">Dr. João Silva</SelectItem>
                    <SelectItem value="Dra. Maria Costa">Dra. Maria Costa</SelectItem>
                    <SelectItem value="Dr. Pedro Santos">Dr. Pedro Santos</SelectItem>
                    <SelectItem value="Dra. Ana Lima">Dra. Ana Lima</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new-type">Tipo de Consulta *</Label>
                <Select 
                  value={newFormData.type} 
                  onValueChange={(value) => setNewFormData({ ...newFormData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consulta">Consulta</SelectItem>
                    <SelectItem value="Retorno">Retorno</SelectItem>
                    <SelectItem value="Primeira Consulta">Primeira Consulta</SelectItem>
                    <SelectItem value="Exame">Exame</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new-modality">Modalidade *</Label>
                <Select 
                  value={newFormData.modality} 
                  onValueChange={(value: "presencial" | "online") => setNewFormData({ ...newFormData, modality: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new-duration">Duração (minutos) *</Label>
                <Select 
                  value={newFormData.duration.toString()} 
                  onValueChange={(value) => {
                    setNewFormData({ ...newFormData, duration: parseInt(value), time: "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                    <SelectItem value="120">120 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new-date">Data *</Label>
                <Input 
                  id="new-date" 
                  type="date" 
                  value={newFormData.date}
                  onChange={(e) => {
                    setNewFormData({ ...newFormData, date: e.target.value, time: "" });
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              {newFormData.date && (
                <div className="grid gap-2">
                  <Label htmlFor="new-time">Horário *</Label>
                  <Select 
                    value={newFormData.time} 
                    onValueChange={(value) => setNewFormData({ ...newFormData, time: value })}
                    disabled={!newFormData.date}
                    key={`new-time-select-${newFormData.date}-${newFormData.duration}`}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => {
                        const available = isTimeSlotAvailable(slot.display, newFormData.date, newFormData.duration);
                        return (
                          <SelectItem 
                            key={`${slot.display}-${newFormData.date}-${newFormData.duration}`} 
                            value={slot.display}
                            disabled={!available}
                          >
                            {slot.display} {!available && "(Ocupado)"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setNewAppointmentOpen(false);
                setNewFormData({
                  patient: "",
                  professional: "",
                  date: "",
                  time: "",
                  type: "Consulta",
                  modality: "presencial",
                  duration: 60,
                });
              }}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAppointment} disabled={!newFormData.patient || !newFormData.professional || !newFormData.date || !newFormData.time}>
                Criar Agendamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reschedule Dialog */}
        <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Remarcar Agendamento</DialogTitle>
              <DialogDescription>
                Escolha nova data e horário para o agendamento
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Paciente</Label>
                <Input value={selectedAppointment?.patient} disabled />
              </div>
              <div className="grid gap-2">
                <Label>Profissional</Label>
                <Input value={selectedAppointment?.professional} disabled />
              </div>
                <div className="grid gap-2">
                <Label htmlFor="reschedule-date">Nova Data *</Label>
                <Input 
                  id="reschedule-date" 
                  type="date" 
                  value={rescheduleFormData.date}
                  onChange={(e) => {
                    setRescheduleFormData({ ...rescheduleFormData, date: e.target.value, time: "" });
                    setRescheduleTimeConflictError("");
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
                </div>
              
              {rescheduleFormData.date && selectedAppointment && (
                <div className="grid gap-2">
                  <Label htmlFor="reschedule-time">Novo Horário *</Label>
                  <Select 
                    value={rescheduleFormData.time} 
                    onValueChange={(value) => {
                      setRescheduleFormData({ ...rescheduleFormData, time: value });
                      setRescheduleTimeConflictError("");
                    }}
                    key={`reschedule-time-select-${rescheduleFormData.date}-${selectedAppointment.duration}`}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => {
                        const available = isTimeSlotAvailable(
                          slot.display, 
                          rescheduleFormData.date, 
                          selectedAppointment.duration, 
                          selectedAppointment.id
                        );
                        return (
                          <SelectItem 
                            key={`${slot.display}-${rescheduleFormData.date}-${selectedAppointment.duration}`} 
                            value={slot.display}
                            disabled={!available}
                          >
                            {slot.display} {!available && "(Ocupado)"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {rescheduleTimeConflictError && (
                    <p className="text-sm text-destructive">{rescheduleTimeConflictError}</p>
                  )}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setRescheduleOpen(false);
                setSelectedAppointment(null);
                setRescheduleTimeConflictError("");
              }}>
                Cancelar
              </Button>
              <Button onClick={handleSaveReschedule} disabled={!!rescheduleTimeConflictError || !rescheduleFormData.date || !rescheduleFormData.time}>
                Remarcar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Dialog */}
        <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Agendamento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja confirmar este agendamento? O paciente será notificado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancel Dialog */}
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Voltar</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Cancelar Agendamento
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Agendamento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir permanentemente este agendamento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
};

export default Agendamentos;