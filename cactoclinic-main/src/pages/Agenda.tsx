import { useState, useEffect, useMemo, Fragment } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  CalendarClock,
  Video,
  Building2,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Lock,
  Maximize2,
  Minimize2,
  CalendarCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { appointmentService, Appointment, BlockedSlot } from "@/lib/appointmentService";
import { patientService } from "@/lib/patientService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaskedInput } from "@/components/ui/masked-input";
import { validateEmail, validatePhone, validateCPF } from "@/lib/masks";
import { SearchBar } from "@/components/SearchBar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Agenda = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [patients, setPatients] = useState(patientService.getAllPatients());
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [blockTimeOpen, setBlockTimeOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "all");
  const [filterProfessional, setFilterProfessional] = useState("all");
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [editAppointmentOpen, setEditAppointmentOpen] = useState(false);
  const [rescheduleAppointmentOpen, setRescheduleAppointmentOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteBlockDialogOpen, setDeleteBlockDialogOpen] = useState(false);
  const [quickRegisterOpen, setQuickRegisterOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<BlockedSlot | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [dropPreviewTime, setDropPreviewTime] = useState<string | null>(null);
  const [dropPreviewDate, setDropPreviewDate] = useState<string | null>(null);
  
  // Block time form state
  const [blockDate, setBlockDate] = useState("");
  const [blockTime, setBlockTime] = useState("");
  const [blockDuration, setBlockDuration] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blockProfessional, setBlockProfessional] = useState("");
  
  // Form states
  const [newFormData, setNewFormData] = useState({
    patient: "",
    professional: "",
    date: "",
    time: "",
    type: "Consulta",
    modality: "presencial" as "presencial" | "online",
    duration: 60,
  });
  
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

  // Estado para cadastro rápido de paciente
  const [quickRegisterData, setQuickRegisterData] = useState({
    name: "",
    phone: "",
    email: "",
    cpf: "",
    healthInsurance: "Particular",
  });

  // Filtrar pacientes baseado na busca (apenas nome ou CPF)
  const filteredPatients = useMemo(() => {
    if (!patientSearchQuery) return patients;
    const searchLower = patientSearchQuery.toLowerCase();
    // Verificar se é CPF (contém apenas números ou formato de CPF)
    const isCPF = /^[\d.\- ]+$/.test(patientSearchQuery);
    
    return patients.filter(patient => {
      if (isCPF) {
        // Buscar por CPF (comparar com e sem formatação)
        const searchCPF = patientSearchQuery.replace(/\D/g, '');
        const patientCPF = patient.cpf.replace(/\D/g, '');
        return patientCPF.includes(searchCPF);
      } else {
        // Buscar por nome
        return patient.name.toLowerCase().includes(searchLower);
      }
    });
  }, [patientSearchQuery, patients]);

  // Lista de profissionais sincronizada com Equipe.tsx (apenas médicos)
  const professionals = [
    "Dr. João Santos",
    "Dra. Ana Lima",
    "Dr. Carlos Souza",
  ];

  const procedureTypes = {
    "Consulta": { color: "bg-[#d1f4e8] text-[#065f46] border-primary", borderColor: "#10b77f" },
    "Retorno": { color: "bg-[#dbeafe] text-[#1e40af] border-info", borderColor: "#3b82f6" },
    "Primeira Consulta": { color: "bg-[#ede9fe] text-[#6b21a8] border-purple-600", borderColor: "#9333ea" },
    "Cirurgia": { color: "bg-[#fee2e2] text-[#991b1b] border-destructive", borderColor: "#ef4444" },
    "Exame": { color: "bg-[#fef3c7] text-[#92400e] border-warning", borderColor: "#f59e0b" },
  };

  // Gerar horários disponíveis (intervalos de 15 minutos)
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
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8h às 18h

  // Get current time in Brazil timezone
  const getCurrentTimeInMinutes = () => {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    return now.getHours() * 60 + now.getMinutes();
  };

  const isCurrentDay = (dateStr: string) => {
    // Obter data de hoje no formato YYYY-MM-DD usando timezone do Brasil
    const now = new Date();
    // Converter para timezone do Brasil (America/Sao_Paulo)
    const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const todayStr = brazilTime.getFullYear() + '-' + 
                     String(brazilTime.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(brazilTime.getDate()).padStart(2, '0');
    
    // Comparar strings diretamente (formato YYYY-MM-DD)
    return dateStr === todayStr;
  };

  // Usar funções do serviço para validações
  const isPastDate = (dateStr: string) => appointmentService.isPastDate(dateStr);
  const isPastTime = (dateStr: string, timeStr: string) => appointmentService.isPastTime(dateStr, timeStr);
  const checkTimeConflict = (dateStr: string, time: string, duration: number, excludeId?: number, professional?: string) => {
    return appointmentService.checkTimeConflict(dateStr, time, duration, excludeId, professional);
  };

  // Mapeamento de profissionais da Equipe para profissionais da Agenda (agora não é mais necessário, mas mantido para compatibilidade)
  const professionalMapping: Record<string, string> = {
    "Dr. João Santos": "Dr. João Santos",
    "Dra. Ana Lima": "Dra. Ana Lima",
    "Dr. Carlos Souza": "Dr. Carlos Souza",
  };

  // Dados padrão dos profissionais (mesmos da Equipe.tsx - apenas médicos)
  const defaultTeamMembers = [
    {
      name: "Dr. João Santos",
      workSchedule: {
        monday: { start: "08:00", end: "18:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        tuesday: { start: "08:00", end: "18:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        wednesday: { start: "08:00", end: "18:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        thursday: { start: "08:00", end: "18:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        friday: { start: "08:00", end: "18:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        saturday: { start: "08:00", end: "12:00", enabled: true, lunchBreak: { start: "", end: "", enabled: false } },
        sunday: { start: "", end: "", enabled: false, lunchBreak: { start: "", end: "", enabled: false } },
      },
    },
    {
      name: "Dra. Ana Lima",
      workSchedule: {
        monday: { start: "09:00", end: "17:00", enabled: true, lunchBreak: { start: "12:30", end: "13:30", enabled: true } },
        tuesday: { start: "09:00", end: "17:00", enabled: true, lunchBreak: { start: "12:30", end: "13:30", enabled: true } },
        wednesday: { start: "", end: "", enabled: false, lunchBreak: { start: "", end: "", enabled: false } },
        thursday: { start: "09:00", end: "17:00", enabled: true, lunchBreak: { start: "12:30", end: "13:30", enabled: true } },
        friday: { start: "09:00", end: "17:00", enabled: true, lunchBreak: { start: "12:30", end: "13:30", enabled: true } },
        saturday: { start: "", end: "", enabled: false, lunchBreak: { start: "", end: "", enabled: false } },
        sunday: { start: "", end: "", enabled: false, lunchBreak: { start: "", end: "", enabled: false } },
      },
    },
    {
      name: "Dr. Carlos Souza",
      workSchedule: {
        monday: { start: "08:00", end: "19:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        tuesday: { start: "08:00", end: "19:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        wednesday: { start: "08:00", end: "19:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        thursday: { start: "08:00", end: "19:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        friday: { start: "08:00", end: "19:00", enabled: true, lunchBreak: { start: "12:00", end: "13:00", enabled: true } },
        saturday: { start: "08:00", end: "14:00", enabled: true, lunchBreak: { start: "", end: "", enabled: false } },
        sunday: { start: "", end: "", enabled: false, lunchBreak: { start: "", end: "", enabled: false } },
      },
    },
  ];

  const weekDaysForSync = [
    { key: "monday", label: "Segunda-feira", dayOfWeek: 1 },
    { key: "tuesday", label: "Terça-feira", dayOfWeek: 2 },
    { key: "wednesday", label: "Quarta-feira", dayOfWeek: 3 },
    { key: "thursday", label: "Quinta-feira", dayOfWeek: 4 },
    { key: "friday", label: "Sexta-feira", dayOfWeek: 5 },
    { key: "saturday", label: "Sábado", dayOfWeek: 6 },
    { key: "sunday", label: "Domingo", dayOfWeek: 0 },
  ] as const;

  // Função para sincronizar bloqueios de almoço dos profissionais
  const syncProfessionalLunchBreakBlocks = () => {
    defaultTeamMembers.forEach(member => {
      if (!member.workSchedule) return;

      // Usar o nome do profissional diretamente (agora os nomes estão sincronizados)
      const agendaProfessionalName = member.name;

      // Remover bloqueios antigos de almoço deste profissional
      const existingBlocks = appointmentService.getBlockedSlots();
      existingBlocks.forEach(block => {
        if ((block.professional === member.name || block.professional === agendaProfessionalName) && 
            block.reason?.includes("Horário de Almoço")) {
          appointmentService.removeBlockedSlot(block);
        }
      });

      // Adicionar novos bloqueios baseados nos horários de almoço configurados
      weekDaysForSync.forEach(day => {
        const schedule = member.workSchedule?.[day.key];
        const lunchBreak = schedule?.lunchBreak;

        if (schedule?.enabled && lunchBreak?.enabled && lunchBreak.start && lunchBreak.end) {
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
              reason: `Horário de Almoço - ${agendaProfessionalName}`,
              date: "", // Bloqueio recorrente (sem data específica)
              professional: agendaProfessionalName, // Usar o nome da Agenda
            };
            appointmentService.addBlockedSlot(block);
            console.log(`Agenda: Bloqueio de almoço criado para ${agendaProfessionalName} - ${day.label}: ${lunchBreak.start} até ${lunchBreak.end}`);
          }
        }
      });
    });
  };

  // Função para inicializar bloqueios de almoço (caso não existam)
  const initializeLunchBreakBlocks = () => {
    const existingBlocks = appointmentService.getBlockedSlots();
    const hasClinicLunchBlocks = existingBlocks.some(b => b.reason?.includes("Horário de Almoço da Clínica"));
    const hasProfessionalLunchBlocks = existingBlocks.some(b => 
      b.reason?.includes("Horário de Almoço") && b.professional && professionals.includes(b.professional)
    );
    
    // Se não há bloqueios de almoço da clínica, criar bloqueios padrão
    if (!hasClinicLunchBlocks) {
      const dayMap: Record<string, number> = {
        "Segunda-feira": 1,
        "Terça-feira": 2,
        "Quarta-feira": 3,
        "Quinta-feira": 4,
        "Sexta-feira": 5,
        "Sábado": 6,
        "Domingo": 0,
      };
      
      // Criar bloqueios padrão de almoço da clínica (12:00-13:00 de segunda a sexta)
      const defaultSchedule = [
        { day: "Segunda-feira", dayOfWeek: 1 },
        { day: "Terça-feira", dayOfWeek: 2 },
        { day: "Quarta-feira", dayOfWeek: 3 },
        { day: "Quinta-feira", dayOfWeek: 4 },
        { day: "Sexta-feira", dayOfWeek: 5 },
      ];
      
      defaultSchedule.forEach(({ dayOfWeek }) => {
        const block: BlockedSlot = {
          day: dayOfWeek,
          time: "12:00",
          duration: 60, // 1 hora
          reason: "Horário de Almoço da Clínica",
          date: "", // Bloqueio recorrente
        };
        appointmentService.addBlockedSlot(block);
        console.log(`Agenda: Bloqueio padrão de almoço da clínica criado para dia ${dayOfWeek}`);
      });
    }

    // Se não há bloqueios de almoço dos profissionais, criar bloqueios padrão
    if (!hasProfessionalLunchBlocks) {
      console.log('Agenda: Sincronizando bloqueios de almoço dos profissionais...');
      syncProfessionalLunchBreakBlocks();
    }
  };

  // Atualizar lista de pacientes quando houver mudanças
  useEffect(() => {
    const unsubscribe = patientService.onPatientsChange(() => {
      setPatients(patientService.getAllPatients());
    });
    return unsubscribe;
  }, []);

  // Carregar agendamentos e bloqueios
  useEffect(() => {
    // Inicializar bloqueios de almoço se necessário
    initializeLunchBreakBlocks();
    
    const loadData = () => {
      const allAppointments = appointmentService.getAllAppointments();
      const allBlockedSlots = appointmentService.getBlockedSlots();
      setAppointments(allAppointments);
      setBlockedSlots(allBlockedSlots);
      
      // Log para debug: verificar bloqueios de almoço
      const lunchBlocks = allBlockedSlots.filter(b => 
        b.reason?.includes("Horário de Almoço")
      );
      console.log(`Agenda: Total de bloqueios carregados: ${allBlockedSlots.length}`);
      console.log(`Agenda: Bloqueios de almoço encontrados: ${lunchBlocks.length}`);
      lunchBlocks.forEach(block => {
        console.log(`  - ${block.reason}: ${block.time} (${block.duration} min) - Dia ${block.day} - Profissional: ${block.professional || 'Clínica'}`);
      });
      
      // Log detalhado dos dias da semana atual
      const weekDays = getWeekDays();
      console.log('Agenda: Dias da semana atual:', weekDays.map(d => ({ 
        dayIndex: d.dayIndex, 
        day: d.day, 
        dayOfWeek: d.dayOfWeek, 
        full: d.full 
      })));
    };
    
    // Aguardar um pouco para garantir que os bloqueios sejam criados
    const timer = setTimeout(() => {
      loadData();
    }, 100);
    
    const unsubscribeAppointments = appointmentService.onAppointmentsChange(loadData);
    const unsubscribeBlocks = appointmentService.onBlockedSlotsChange(loadData);
    
    return () => {
      clearTimeout(timer);
      unsubscribeAppointments();
      unsubscribeBlocks();
    };
  }, []);

  // Aplicar filtro de status da URL ao carregar a página
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      setFilterStatus(statusParam);
      // Limpar o parâmetro da URL após aplicar o filtro
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("status");
        return newParams;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Aplicar filtro de profissional da URL ao carregar a página
  useEffect(() => {
    const professionalParam = searchParams.get("professional");
    const nameParam = searchParams.get("name");
    
    if (professionalParam && nameParam) {
      // Tentar encontrar o profissional pelo nome (decodificado)
      const decodedName = decodeURIComponent(nameParam);
      const professionalMatch = professionals.find(prof => {
        const profName = prof.toLowerCase();
        const searchName = decodedName.toLowerCase();
        // Verificar correspondência exata ou parcial
        return profName === searchName || 
               profName.includes(searchName) || 
               searchName.includes(profName) ||
               // Verificar correspondência por partes do nome
               profName.split(' ').some(part => searchName.includes(part)) ||
               searchName.split(' ').some(part => profName.includes(part));
      });
      
      if (professionalMatch) {
        setFilterProfessional(professionalMatch);
        // Limpar os parâmetros da URL após aplicar o filtro
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.delete("professional");
          newParams.delete("name");
          return newParams;
        }, { replace: true });
      }
    }
  }, [searchParams, setSearchParams, professionals]);

  // Aplicar modo de visualização e data da URL ao carregar a página
  useEffect(() => {
    const viewParam = searchParams.get("view");
    const dateParam = searchParams.get("date");
    
    // Se há parâmetro de visualização, definir o modo
    if (viewParam === "day" || viewParam === "week" || viewParam === "month") {
      setViewMode(viewParam);
      
      // Limpar o parâmetro da URL após aplicar
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete("view");
        return newParams;
      }, { replace: true });
    }
    
    // Se há parâmetro de data, definir a data selecionada
    if (dateParam) {
      const parsedDate = new Date(dateParam + 'T00:00:00');
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
        
        // Limpar o parâmetro da URL após aplicar
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.delete("date");
          return newParams;
        }, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]);

  // Obter dias da semana
  const getWeekDays = () => {
    // Usar timezone do Brasil para calcular as datas
    const date = new Date(selectedDate);
    const brazilDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    
    const currentDay = brazilDate.getDay();
    const sunday = new Date(brazilDate);
    sunday.setDate(brazilDate.getDate() - currentDay);
    
    const days = [];
    const dayNames = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(sunday);
      dayDate.setDate(sunday.getDate() + i);
      
      // Converter para timezone do Brasil e formatar como YYYY-MM-DD
      const brazilDayDate = new Date(dayDate.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
      const dateStr = brazilDayDate.getFullYear() + '-' + 
                      String(brazilDayDate.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(brazilDayDate.getDate()).padStart(2, '0');
      
      // Calcular o dia da semana real (0=Domingo, 1=Segunda, etc.)
      const dayOfWeek = brazilDayDate.getDay();
      
      days.push({
        dayIndex: i,
        day: dayNames[i],
        dayOfWeek: dayOfWeek, // Dia da semana real (0-6)
        date: brazilDayDate.getDate(),
        full: dateStr,
        dateObj: dayDate,
      });
    }
    
    return days;
  };

  const weekDays = getWeekDays();

  // Filtrar agendamentos por profissional (para uso no calendário)
  const getFilteredAppointmentsForCalendar = () => {
    return appointments.filter(apt => {
      return filterProfessional === "all" || apt.professional === filterProfessional;
    });
  };

  // Obter agendamentos de um slot específico
  const hasSpaceInSlot = (dayIndex: number, hour: number, dateStr: string) => {
    const day = weekDays[dayIndex];
    if (!day) return [];
    
    const filteredAppts = getFilteredAppointmentsForCalendar();
    
    return filteredAppts.filter(apt => {
      const aptDate = new Date(apt.date + 'T00:00:00');
      const dayDate = day.dateObj;
      if (aptDate.getDate() !== dayDate.getDate() || 
          aptDate.getMonth() !== dayDate.getMonth() || 
          aptDate.getFullYear() !== dayDate.getFullYear()) {
        return false;
      }
      
      const [aptHour, aptMinute] = apt.time.split(':').map(Number);
      const aptStartMinutes = aptHour * 60 + aptMinute;
      const aptEndMinutes = aptStartMinutes + apt.duration;
      const slotStartMinutes = hour * 60;
      const slotEndMinutes = (hour + 1) * 60;
      
      return (aptStartMinutes < slotEndMinutes && aptEndMinutes > slotStartMinutes);
    });
  };

  // Verificar se um slot está bloqueado (considerando filtro de profissional)
  const isSlotBlocked = (dayIndex: number, hour: number, dateStr: string) => {
    const day = weekDays[dayIndex];
    if (!day) return false;
    
    return blockedSlots.some(slot => {
      // Filtrar por profissional: 
      // - Se "all" está selecionado: mostrar apenas bloqueios gerais da clínica (sem professional)
      // - Se um profissional específico está selecionado: mostrar bloqueios gerais (sem professional) + bloqueios desse profissional específico
      if (filterProfessional === "all") {
        // Quando "Todos Profissionais" está selecionado, mostrar apenas bloqueios gerais da clínica
        if (slot.professional) {
          return false; // Não mostrar bloqueios específicos de profissionais
        }
      } else {
        // Quando um profissional específico está selecionado, exibir:
        // 1. Bloqueios gerais da clínica (sem campo professional) - ex: "Horário de Almoço da Clínica"
        // 2. Bloqueios de almoço do profissional selecionado (professional === filterProfessional e reason contém "Horário de Almoço")
        // 3. Bloqueios manuais do profissional selecionado (professional === filterProfessional e reason não contém "Horário de Almoço")
        
        // Se o bloqueio tem um profissional específico e não é o profissional selecionado, não mostrar
        if (slot.professional && slot.professional !== filterProfessional) {
          return false;
        }
        // Bloqueios sem professional (gerais da clínica) sempre são exibidos
        // Bloqueios com professional igual ao selecionado também são exibidos (inclui almoço e bloqueios manuais)
      }
      
      if (slot.date && slot.date !== dateStr) return false;
      // Para bloqueios recorrentes (sem data), comparar com o dia da semana real (day.dayOfWeek)
      if (!slot.date && slot.day !== day.dayOfWeek) return false;
      
      const [blockHour, blockMinute] = slot.time.split(':').map(Number);
      const blockStart = blockHour * 60 + blockMinute;
      const blockEnd = blockStart + slot.duration;
      const slotStart = hour * 60;
      const slotEnd = (hour + 1) * 60;
      
      return (blockStart < slotEnd && blockEnd > slotStart);
    });
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  // Drag and Drop handlers (Google Calendar style)
  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    e.stopPropagation();
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", appointment.id.toString());
    e.dataTransfer.setData("application/json", JSON.stringify({
      id: appointment.id,
      date: appointment.date,
      time: appointment.time
    }));
    console.log("handleDragStart: iniciando drag", appointment);
  };

  const handleBlockDragStart = (e: React.DragEvent, blockedSlot: BlockedSlot) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `block-${blockedSlot.date || blockedSlot.day}-${blockedSlot.time}`);
  };

  const handleDragOver = (e: React.DragEvent, dayIndex: number, hour: number, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    if (e.currentTarget instanceof HTMLElement && draggedAppointment) {
      e.currentTarget.classList.add("bg-blue-50");
      
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseY = e.clientY;
      const slotTop = rect.top;
      const slotHeight = rect.height || 60;
      
      // Calcular a posição Y relativa ao slot
      const relativeY = mouseY - slotTop;
      
      // Calcular minutos baseado na posição Y dentro do slot (0-60 minutos)
      const minutesPercent = Math.max(0, Math.min(1, relativeY / slotHeight));
      let calculatedMinutes = Math.round(minutesPercent * 60);
      
      // Arredondar para múltiplos de 15 minutos
      calculatedMinutes = Math.round(calculatedMinutes / 15) * 15;
      
      // Se os minutos ultrapassarem 60, mover para a próxima hora
      let calculatedHour = hour;
      if (calculatedMinutes >= 60) {
        calculatedHour = hour + 1;
        calculatedMinutes = 0;
      }
      
      // Garantir que o horário está dentro dos limites permitidos
      if (calculatedHour >= hours[0] && calculatedHour <= hours[hours.length - 1]) {
        const previewTime = `${calculatedHour.toString().padStart(2, '0')}:${calculatedMinutes.toString().padStart(2, '0')}`;
        setDropPreviewTime(previewTime);
        setDropPreviewDate(dateStr);
        
        // Remover preview existente
        const existingPreview = e.currentTarget.querySelector('.drop-preview-line');
        if (existingPreview) {
          existingPreview.remove();
        }
        
        // Criar linha de preview - estilo Google Calendar
        const previewLine = document.createElement('div');
        previewLine.className = 'drop-preview-line absolute left-0 right-0 z-[20] pointer-events-none';
        previewLine.style.top = `${relativeY}px`;
        previewLine.style.height = '2px';
        previewLine.style.backgroundColor = '#1a73e8';
        previewLine.style.boxShadow = '0 0 4px rgba(26, 115, 232, 0.4)';
        
        // Adicionar indicador de horário à esquerda (estilo Google Calendar)
        const timeIndicator = document.createElement('div');
        timeIndicator.className = 'absolute left-0 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-[#1a73e8] text-white text-[10px] font-medium rounded whitespace-nowrap';
        timeIndicator.style.transform = 'translateY(-50%) translateX(-100%)';
        timeIndicator.style.marginLeft = '-8px';
        timeIndicator.style.zIndex = '21';
        timeIndicator.textContent = previewTime;
        previewLine.appendChild(timeIndicator);
        
        e.currentTarget.appendChild(previewLine);
      }
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("bg-blue-50");
      const previewLine = e.currentTarget.querySelector('.drop-preview-line');
      if (previewLine) {
        previewLine.remove();
      }
    }
    // Limpar preview quando sair do slot
    setDropPreviewTime(null);
    setDropPreviewDate(null);
  };

  const handleDrop = (e: React.DragEvent, dayIndex: number, hour: number, dateStr: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Limpar preview de todos os slots
    const allSlots = document.querySelectorAll('[data-hour]');
    allSlots.forEach(slot => {
      if (slot instanceof HTMLElement) {
        slot.classList.remove("bg-blue-50");
        const previewLine = slot.querySelector('.drop-preview-line');
        if (previewLine) {
          previewLine.remove();
        }
      }
    });
    
    // Limpar estados de preview
    setDropPreviewTime(null);
    setDropPreviewDate(null);
    
    if (!draggedAppointment) {
      console.warn("handleDrop: draggedAppointment is null");
      return;
    }
    
    // IMPORTANTE: Validar data passada ANTES de processar
    if (isPastDate(dateStr)) {
      toast.error("Não é possível mover para datas passadas");
      setDraggedAppointment(null);
      return;
    }
    
    // Usar diretamente os parâmetros do slot onde o drop foi configurado
    // Esses parâmetros já são do slot correto (dayIndex, hour, dateStr)
    const slotElement = e.currentTarget as HTMLElement;
    const rect = slotElement.getBoundingClientRect();
    const mouseY = e.clientY;
    const slotTop = rect.top;
    const slotHeight = rect.height || 60;
    
    // Calcular a posição Y relativa ao slot usando a posição do mouse
    const relativeY = mouseY - slotTop;
    
    // Calcular minutos baseado na posição Y dentro do slot (0-60 minutos)
    const minutesPercent = Math.max(0, Math.min(1, relativeY / slotHeight));
    let calculatedMinutes = Math.round(minutesPercent * 60);
    
    // Arredondar para múltiplos de 15 minutos
    calculatedMinutes = Math.round(calculatedMinutes / 15) * 15;
    
    // Se os minutos ultrapassarem 60, mover para a próxima hora
    let calculatedHour = hour;
    if (calculatedMinutes >= 60) {
      calculatedHour = hour + 1;
      calculatedMinutes = 0;
    }
    
    // Garantir que o horário está dentro dos limites permitidos
    if (calculatedHour < hours[0] || calculatedHour > hours[hours.length - 1]) {
      toast.error("Horário fora dos limites permitidos");
      setDraggedAppointment(null);
      return;
    }
    
    // Formatar o novo horário
    const newTime = `${calculatedHour.toString().padStart(2, '0')}:${calculatedMinutes.toString().padStart(2, '0')}`;
    
    // IMPORTANTE: Validar horário passado ANTES de processar
    if (isPastTime(dateStr, newTime)) {
      toast.error("Não é possível mover para horários já passados");
      setDraggedAppointment(null);
      return;
    }
    
    // Debug: verificar valores antes de processar
    console.log("handleDrop - valores finais:", {
      draggedAppointmentId: draggedAppointment.id,
      oldDate: draggedAppointment.date,
      oldTime: draggedAppointment.time,
      newDate: dateStr,
      newTime: newTime,
      dayIndex: dayIndex,
      hour: hour,
      calculatedHour,
      calculatedMinutes,
      dateStrFromParam: dateStr
    });
    
    // CRÍTICO: Garantir que estamos usando dateStr do parâmetro, não do elemento
    // O dateStr já vem correto do slot onde o onDrop foi configurado
    const finalDateStr = dateStr; // Usar diretamente o parâmetro
    
    console.log("handleDrop: chamando processDrop com:", {
      dateStr: finalDateStr,
      newTime: newTime,
      dayIndex: dayIndex
    });
    
    processDrop(finalDateStr, newTime, dayIndex);
  };
  
  const processDrop = (dateStr: string, newTime: string, dayIndex: number) => {
    if (!draggedAppointment) {
      console.error("processDrop: draggedAppointment is null");
      return;
    }
    
    // Salvar referência ao agendamento antes de atualizar
    const appointmentToUpdate = draggedAppointment;
    
    // Debug: verificar antes de atualizar
    console.log("processDrop: atualizando agendamento", {
      id: appointmentToUpdate.id,
      oldDate: appointmentToUpdate.date,
      oldTime: appointmentToUpdate.time,
      newDate: dateStr,
      newTime: newTime,
      dayIndex: dayIndex
    });
    
    // Validar conflito de horário
    if (checkTimeConflict(dateStr, newTime, appointmentToUpdate.duration, appointmentToUpdate.id, appointmentToUpdate.professional)) {
      toast.error("Já existe um agendamento neste horário. Escolha outro horário.");
      setDraggedAppointment(null);
      return;
    }
    
    // Validar data passada (já validado em handleDrop, mas validar novamente por segurança)
    if (isPastDate(dateStr)) {
      toast.error("Não é possível mover para datas passadas");
      setDraggedAppointment(null);
      return;
    }
    
    // Validar horário passado (já validado em handleDrop, mas validar novamente por segurança)
    if (isPastTime(dateStr, newTime)) {
      toast.error("Não é possível mover para horários já passados");
      setDraggedAppointment(null);
      return;
    }
    
    // Limpar draggedAppointment ANTES de atualizar para evitar problemas de estado
    setDraggedAppointment(null);
    
    // Atualizar o agendamento com a nova data e horário
    // IMPORTANTE: Garantir que estamos passando dateStr corretamente
    console.log("processDrop: chamando rescheduleAppointment com:", {
      id: appointmentToUpdate.id,
      oldDate: appointmentToUpdate.date,
      oldTime: appointmentToUpdate.time,
      newDate: dateStr,
      newTime: newTime,
      dateStrValue: dateStr,
      dateStrType: typeof dateStr
    });
    
    // CRÍTICO: Garantir que estamos passando a data correta
    // Usar dateStr diretamente do parâmetro
    const finalDateToUpdate = dateStr;
    
    const updated = appointmentService.rescheduleAppointment(appointmentToUpdate.id, finalDateToUpdate, newTime);
    
    // Debug: verificar o resultado
    console.log("processDrop: resultado da atualização", {
      updated: updated ? {
        id: updated.id,
        date: updated.date,
        time: updated.time,
        day: updated.day
      } : null,
      expectedDate: dateStr,
      expectedTime: newTime
    });
    
    if (updated) {
      // Verificar se a data foi realmente atualizada
      if (updated.date !== dateStr) {
        console.error("ERRO: A data não foi atualizada corretamente!", {
          expected: dateStr,
          actual: updated.date,
          appointmentId: updated.id
        });
        toast.error(`Erro: A data não foi atualizada. Esperado: ${dateStr}, Recebido: ${updated.date}`);
        // Tentar atualizar novamente
        const retryUpdated = appointmentService.updateAppointment(appointmentToUpdate.id, { date: dateStr, time: newTime });
        if (retryUpdated && retryUpdated.date === dateStr) {
          toast.success(`Consulta de ${appointmentToUpdate.patient} remarcada com sucesso`);
        }
      } else {
        const dayName = weekDays[dayIndex]?.day || 'dia';
        const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
        toast.success(`Consulta de ${appointmentToUpdate.patient} remarcada para ${dayName} (${formattedDate}) às ${newTime}`);
        console.log("processDrop: agendamento atualizado com sucesso", updated);
        // Os listeners do appointmentService já vão atualizar o estado automaticamente
      }
    } else {
      console.error("processDrop: erro ao atualizar agendamento");
      toast.error("Erro ao remarcar agendamento");
    }
  };

  // Filtrar agendamentos
  const filteredAppointments = appointments.filter((appointment) => {
    if (!searchTerm) {
      const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
      const matchesProfessional = filterProfessional === "all" || appointment.professional === filterProfessional;
      return matchesStatus && matchesProfessional;
    }
    
    const searchLower = searchTerm.toLowerCase();
    // Verificar se é CPF (contém apenas números ou formato de CPF)
    const isCPF = /^[\d.\- ]+$/.test(searchTerm);
    
    let matchesSearch = false;
    if (isCPF) {
      // Buscar por CPF - precisamos buscar o paciente pelo CPF
      const patient = patients.find(p => {
        const patientCPF = p.cpf ? p.cpf.replace(/\D/g, '') : '';
        const searchCPF = searchTerm.replace(/\D/g, '');
        return patientCPF.includes(searchCPF);
      });
      matchesSearch = patient ? appointment.patient.toLowerCase() === patient.name.toLowerCase() : false;
    } else {
      // Buscar por nome
      matchesSearch = appointment.patient.toLowerCase().includes(searchLower);
    }
    
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
    const matchesProfessional = filterProfessional === "all" || appointment.professional === filterProfessional;
    return matchesSearch && matchesStatus && matchesProfessional;
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

  // Navegação de semana/mês/dia
  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (viewMode === "month") {
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
    } else if (viewMode === "week") {
      if (direction === "prev") {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
    } else {
      if (direction === "prev") {
        newDate.setDate(newDate.getDate() - 1);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
    }
    setSelectedDate(newDate);
  };

  // Obter texto do mês/ano atual
  const getCurrentMonthYear = () => {
    const months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
    return `${months[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  };

  // Handler para bloquear horário
  const handleBlockTime = () => {
    if (!blockDate || !blockTime || !blockDuration || !blockReason.trim() || !blockProfessional) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    if (isPastDate(blockDate)) {
      toast.error("Não é possível bloquear datas passadas");
      return;
    }
    
    if (isPastTime(blockDate, blockTime)) {
      toast.error("Não é possível bloquear horários já passados");
      return;
    }
    
    // Se estiver editando um bloqueio existente, remover o bloqueio antigo primeiro
    if (selectedBlock) {
      appointmentService.removeBlockedSlot(selectedBlock);
    }
    
    if (checkTimeConflict(blockDate, blockTime, parseInt(blockDuration), undefined, blockProfessional || undefined)) {
      // Se houver conflito e estiver editando, restaurar o bloqueio antigo
      if (selectedBlock) {
        appointmentService.addBlockedSlot(selectedBlock);
      }
      toast.error("Já existe um agendamento neste horário");
      return;
    }
    
    const blockDay = new Date(blockDate + 'T00:00:00').getDay();
    const newBlock: BlockedSlot = {
      day: blockDay,
      date: blockDate,
      time: blockTime,
      duration: parseInt(blockDuration),
      professional: blockProfessional,
      reason: blockReason,
    };
    
    // Adicionar o novo bloqueio (ou atualizado se estava editando)
    appointmentService.addBlockedSlot(newBlock);
    toast.success(selectedBlock ? "Bloqueio atualizado com sucesso!" : "Horário bloqueado com sucesso!");
    setBlockTimeOpen(false);
    setBlockDate("");
    setBlockTime("");
    setBlockDuration("");
    setBlockReason("");
    setBlockProfessional("");
    setSelectedBlock(null);
  };

  // Função para capitalizar nome
  const capitalizeName = (name: string): string => {
    if (!name || name.trim() === '') return '';
    return name
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ')
      .trim();
  };

  // Cadastro rápido de paciente
  const handleQuickRegister = () => {
    // Validações
    if (!quickRegisterData.name || !quickRegisterData.name.trim()) {
      toast.error("Nome completo é obrigatório");
      return;
    }
    if (!quickRegisterData.phone || !quickRegisterData.phone.trim()) {
      toast.error("Telefone é obrigatório");
      return;
    }
    if (!validatePhone(quickRegisterData.phone)) {
      toast.error("Telefone inválido. Use o formato (00) 00000-0000");
      return;
    }
    if (!quickRegisterData.email || !quickRegisterData.email.trim()) {
      toast.error("Email é obrigatório");
      return;
    }
    if (!validateEmail(quickRegisterData.email)) {
      toast.error("Email inválido");
      return;
    }
    if (!quickRegisterData.cpf || !quickRegisterData.cpf.trim()) {
      toast.error("CPF é obrigatório");
      return;
    }
    if (!validateCPF(quickRegisterData.cpf)) {
      toast.error("CPF inválido");
      return;
    }

    // Verificar se o paciente já existe
    const capitalizedName = capitalizeName(quickRegisterData.name.trim());
    if (patientService.patientExists(capitalizedName)) {
      toast.error("Paciente já cadastrado. Selecione-o na lista.");
      return;
    }

    // Criar paciente
    const newPatient = patientService.createPatient({
      name: capitalizedName,
      email: quickRegisterData.email.trim(),
      phone: quickRegisterData.phone.trim(),
      cpf: quickRegisterData.cpf.trim(),
      birthDate: "",
      address: "",
      photo: "",
      healthInsurance: quickRegisterData.healthInsurance,
      consultations: 0,
      lastConsultation: "",
      procedures: [],
      balance: 0,
      documents: 0,
      allergies: "",
      chronicDiseases: "",
    });

    // Selecionar o paciente recém-cadastrado no formulário de agendamento
    // Verificar se está editando ou criando novo agendamento
    if (editAppointmentOpen && editFormData.patient) {
      // Se estiver editando, atualizar o formulário de edição
      setEditFormData({ ...editFormData, patient: newPatient.name });
    } else {
      // Se estiver criando novo, atualizar o formulário de novo agendamento
      setNewFormData({ ...newFormData, patient: newPatient.name });
    }
    setQuickRegisterOpen(false);
    setQuickRegisterData({ name: "", phone: "", email: "", cpf: "", healthInsurance: "Particular" });
    toast.success("Paciente cadastrado com sucesso! Continue com o agendamento.");
  };

  // Criar agendamento
  const handleCreateAppointment = () => {
    if (!newFormData.patient.trim()) {
      toast.error("Nome do paciente é obrigatório");
      return;
    }
    
    // Verificar se o paciente está cadastrado no sistema
    if (!patientService.patientExists(newFormData.patient.trim())) {
      // Se não estiver cadastrado, oferecer cadastro rápido
      setQuickRegisterData({
        name: newFormData.patient.trim(),
        phone: "",
        email: "",
        cpf: "",
        healthInsurance: "Particular",
      });
      setQuickRegisterOpen(true);
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
    if (isPastDate(newFormData.date)) {
      toast.error("Não é possível agendar em datas passadas");
      return;
    }
    if (isPastTime(newFormData.date, newFormData.time)) {
      toast.error("Não é possível agendar em horários já passados");
      return;
    }
    if (checkTimeConflict(newFormData.date, newFormData.time, newFormData.duration, undefined, newFormData.professional)) {
      toast.error("Já existe um agendamento neste horário");
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
    }
  };

  // Abrir diálogo de novo agendamento com slot selecionado
  const handleSlotClick = (dayIndex: number, hour: number, dateStr: string) => {
    const day = weekDays[dayIndex];
    if (!day) return;
    
    if (isPastDate(day.full)) {
      toast.error("Não é possível agendar em datas passadas");
      return;
    }
    
    const slotTime = `${hour.toString().padStart(2, '0')}:00`;
    if (isPastTime(day.full, slotTime)) {
      toast.error("Não é possível agendar em horários já passados");
      return;
    }
    
    setNewFormData({
      ...newFormData,
      date: day.full,
      time: slotTime,
    });
    setNewAppointmentOpen(true);
  };

  const handleBlockClick = (blockedSlot: BlockedSlot) => {
    setSelectedBlock(blockedSlot);
    setBlockTimeOpen(true);
    setBlockDate(blockedSlot.date || "");
    setBlockTime(blockedSlot.time);
    setBlockDuration(blockedSlot.duration.toString());
    setBlockReason(blockedSlot.reason);
    setBlockProfessional(blockedSlot.professional || "");
  };

  // Excluir bloqueio
  const handleDeleteBlock = () => {
    if (selectedBlock) {
      appointmentService.removeBlockedSlot(selectedBlock);
      toast.success("Bloqueio removido com sucesso!");
      setDeleteBlockDialogOpen(false);
      setBlockTimeOpen(false);
      setSelectedBlock(null);
      setBlockDate("");
      setBlockTime("");
      setBlockDuration("");
      setBlockReason("");
      setBlockProfessional("");
    }
  };

  // Editar agendamento
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
    setEditAppointmentOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedAppointment) return;
    
    if (!editFormData.patient.trim()) {
      toast.error("Nome do paciente é obrigatório");
      return;
    }
    if (!editFormData.date || !editFormData.time) {
      toast.error("Data e horário são obrigatórios");
      return;
    }
    if (isPastDate(editFormData.date)) {
      toast.error("Não é possível agendar em datas passadas");
      return;
    }
    if (isPastTime(editFormData.date, editFormData.time)) {
      toast.error("Não é possível agendar em horários já passados");
      return;
    }
    if (checkTimeConflict(editFormData.date, editFormData.time, editFormData.duration, selectedAppointment.id, editFormData.professional)) {
      toast.error("Já existe um agendamento neste horário");
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
      setEditAppointmentOpen(false);
      setSelectedAppointment(null);
      setSelectedCardId(null);
    }
  };

  // Remarcar agendamento
  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleFormData({
      date: appointment.date,
      time: appointment.time,
    });
    setRescheduleAppointmentOpen(true);
  };

  const handleSaveReschedule = () => {
    if (!selectedAppointment) return;
    
    if (!rescheduleFormData.date || !rescheduleFormData.time) {
      toast.error("Data e horário são obrigatórios");
      return;
    }
    if (isPastDate(rescheduleFormData.date)) {
      toast.error("Não é possível agendar em datas passadas");
      return;
    }
    if (isPastTime(rescheduleFormData.date, rescheduleFormData.time)) {
      toast.error("Não é possível agendar em horários já passados");
      return;
    }
    if (checkTimeConflict(rescheduleFormData.date, rescheduleFormData.time, selectedAppointment.duration, selectedAppointment.id, selectedAppointment.professional)) {
      toast.error("Já existe um agendamento neste horário");
      return;
    }

    const updated = appointmentService.rescheduleAppointment(
      selectedAppointment.id,
      rescheduleFormData.date,
      rescheduleFormData.time
    );

    if (updated) {
      toast.success("Agendamento remarcado com sucesso!");
      setRescheduleAppointmentOpen(false);
      setSelectedAppointment(null);
      setSelectedCardId(null);
    }
  };

  // Confirmar agendamento
  const handleConfirm = () => {
    if (selectedAppointment) {
      const updated = appointmentService.confirmAppointment(selectedAppointment.id);
      if (updated) {
        toast.success("Agendamento confirmado!");
        setConfirmDialogOpen(false);
        setSelectedAppointment(null);
        setSelectedCardId(null);
      }
    }
  };

  // Cancelar agendamento
  const handleCancel = () => {
    if (selectedAppointment) {
      const updated = appointmentService.cancelAppointment(selectedAppointment.id);
      if (updated) {
        toast.success("Agendamento cancelado");
        setCancelDialogOpen(false);
        setSelectedAppointment(null);
        setSelectedCardId(null);
      }
    }
  };

  // Excluir agendamento
  const handleDelete = () => {
    if (selectedAppointment) {
      const deleted = appointmentService.deleteAppointment(selectedAppointment.id);
      if (deleted) {
        toast.success("Agendamento excluído");
        setDeleteDialogOpen(false);
        setSelectedAppointment(null);
        setSelectedCardId(null);
      }
    }
  };

  // Renderizar visualização diária
  const renderDayView = () => {
    const dayFull = selectedDate.toISOString().split('T')[0];
    const dayIndex = selectedDate.getDay();
    const dateIsPast = isPastDate(dayFull);
    
    // Obter nome do dia da semana
    const dayNames = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    const dayName = dayNames[dayIndex];
    const formattedDate = selectedDate.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    return (
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="mb-4 pb-4 border-b">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground capitalize">{formattedDate}</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">{dayName}</p>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {hours.map((hour) => {
            const slotTime = `${hour.toString().padStart(2, '0')}:00`;
            const timeIsPast = isPastTime(dayFull, slotTime);
            const isPast = dateIsPast || timeIsPast;
            
            // Filtrar agendamentos para este slot
            const filteredAppts = getFilteredAppointmentsForCalendar();
            const appointmentsInSlot = filteredAppts
              .filter(apt => {
                const aptDate = new Date(apt.date + 'T00:00:00');
                const selectedDateObj = new Date(dayFull + 'T00:00:00');
                if (aptDate.getDate() !== selectedDateObj.getDate() || 
                    aptDate.getMonth() !== selectedDateObj.getMonth() || 
                    aptDate.getFullYear() !== selectedDateObj.getFullYear()) {
                  return false;
                }
                
                const [aptHour, aptMinute] = apt.time.split(':').map(Number);
                const aptStart = aptHour * 60 + aptMinute;
                const slotStart = hour * 60;
                const slotEnd = (hour + 1) * 60;
                
                return aptStart >= slotStart && aptStart < slotEnd;
              })
              .sort((a, b) => {
                const aTime = a.time.split(':').map(Number);
                const bTime = b.time.split(':').map(Number);
                const aMinutes = aTime[0] * 60 + aTime[1];
                const bMinutes = bTime[0] * 60 + bTime[1];
                return aMinutes - bMinutes;
              });
            
            // Filtrar bloqueios para este slot (considerando filtro de profissional)
            const blockedSlotsInHour = blockedSlots.filter(slot => {
              // Filtrar por profissional: 
              // - Se "all" está selecionado: mostrar apenas bloqueios gerais da clínica (sem professional)
              // - Se um profissional específico está selecionado: mostrar bloqueios gerais (sem professional) + bloqueios desse profissional específico
              if (filterProfessional === "all") {
                // Quando "Todos Profissionais" está selecionado, mostrar apenas bloqueios gerais da clínica
                if (slot.professional) {
                  return false; // Não mostrar bloqueios específicos de profissionais
                }
              } else {
                // Quando um profissional específico está selecionado, exibir:
                // 1. Bloqueios gerais da clínica (sem campo professional) - ex: "Horário de Almoço da Clínica"
                // 2. Bloqueios de almoço do profissional selecionado (professional === filterProfessional e reason contém "Horário de Almoço")
                // 3. Bloqueios manuais do profissional selecionado (professional === filterProfessional e reason não contém "Horário de Almoço")
                
                // Se o bloqueio tem um profissional específico e não é o profissional selecionado, não mostrar
                if (slot.professional && slot.professional !== filterProfessional) {
                  return false;
                }
                // Bloqueios sem professional (gerais da clínica) sempre são exibidos
                // Bloqueios com professional igual ao selecionado também são exibidos (inclui almoço e bloqueios manuais)
              }
              
              if (slot.date && slot.date !== dayFull) return false;
              if (!slot.date && slot.day !== dayIndex) return false;
              
              const [blockHour, blockMinute] = slot.time.split(':').map(Number);
              const blockStart = blockHour * 60 + blockMinute;
              const blockEnd = blockStart + slot.duration;
              const slotStart = hour * 60;
              const slotEnd = (hour + 1) * 60;
              
              return (blockStart < slotEnd && blockEnd > slotStart);
            });
            
            const totalItems = appointmentsInSlot.length + blockedSlotsInHour.length;
            const minSlotHeight = Math.max(80, totalItems * 85 + (totalItems > 0 ? 30 : 0));
            
            return (
              <div key={hour} className="flex gap-2 sm:gap-4 items-start">
                <div className="w-12 sm:w-16 lg:w-20 text-xs sm:text-sm text-muted-foreground font-medium pt-2 flex-shrink-0">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                <div 
                  className={`flex-1 border rounded-lg p-2 sm:p-3 space-y-2 ${isPast ? 'bg-gray-300/60 cursor-not-allowed' : 'hover:bg-muted/30 cursor-pointer'}`}
                  style={{ minHeight: `${minSlotHeight}px`, cursor: isPast ? 'not-allowed' : 'pointer' }}
                  onClick={() => !isPast && handleSlotClick(dayIndex, hour, dayFull)}
                >
                  {/* Bloqueios */}
                  {blockedSlotsInHour.map((blockedSlot) => {
                    const endTime = calculateEndTime(blockedSlot.time, blockedSlot.duration);
                    const tooltipContent = (
                      <div className="space-y-1.5 min-w-[200px]">
                        <div className="font-semibold text-sm whitespace-nowrap">Horário Bloqueado</div>
                        <div className="text-xs space-y-0.5">
                          <div className="whitespace-nowrap"><strong>Horário:</strong> {blockedSlot.time} - {endTime}</div>
                          <div className="whitespace-nowrap"><strong>Duração:</strong> {blockedSlot.duration} minutos</div>
                          <div className="break-words"><strong>Motivo:</strong> {blockedSlot.reason}</div>
                          <div className="whitespace-nowrap"><strong>Profissional:</strong> {blockedSlot.professional || "Sistema"}</div>
                          {blockedSlot.date && <div className="whitespace-nowrap"><strong>Data:</strong> {new Date(blockedSlot.date + 'T00:00:00').toLocaleDateString('pt-BR')}</div>}
                        </div>
                      </div>
                    );
                    return (
                      <Tooltip key={`tooltip-block-day-${blockedSlot.date}-${blockedSlot.time}`}>
                        <TooltipTrigger asChild>
                          <div
                            className="p-3 rounded-lg border-l-[5px] border border-gray-300/20 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
                            style={{
                              background: 'linear-gradient(135deg, #4b5563 0%, #6b7280 100%)',
                              borderLeftColor: '#1f2937',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <div className="flex items-start gap-2 w-full">
                              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Lock className="h-3.5 w-3.5 flex-shrink-0 text-white" />
                                  <span className="text-xs font-semibold text-white whitespace-nowrap">
                                    {blockedSlot.time} - {endTime}
                                  </span>
                                  <span className="text-xs font-semibold text-white/80 bg-white/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                    {blockedSlot.duration} min
                                  </span>
                                </div>
                                <div className="text-sm font-semibold text-white break-words">{blockedSlot.reason}</div>
                              </div>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-sm" sideOffset={8}>
                          {tooltipContent}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  
                  {/* Agendamentos */}
                  {appointmentsInSlot.length > 0 ? (
                    <>
                      {appointmentsInSlot.map((appointment) => {
                        const style = procedureTypes[appointment.type as keyof typeof procedureTypes] || procedureTypes["Consulta"];
                        const endTime = calculateEndTime(appointment.time, appointment.duration);
                        const tooltipContent = (
                          <div className="space-y-1.5 min-w-[200px]">
                            <div className="font-semibold text-sm whitespace-nowrap flex items-center gap-2">
                              {appointment.patient}
                              {(() => {
                                const patient = patients.find(p => p.name === appointment.patient);
                                if (patient && patient.convenioId && patient.healthInsurance !== "Particular") {
                                  return (
                                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary bg-primary/10 text-primary flex items-center gap-1">
                                      <Building2 className="h-2.5 w-2.5" />
                                      {patient.convenioNome || patient.healthInsurance}
                                    </Badge>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                            <div className="text-xs space-y-0.5">
                              <div className="whitespace-nowrap"><strong>Tipo:</strong> {appointment.type}</div>
                              <div className="whitespace-nowrap"><strong>Horário:</strong> {appointment.time} - {endTime}</div>
                              <div className="whitespace-nowrap"><strong>Duração:</strong> {appointment.duration} minutos</div>
                              <div className="whitespace-nowrap"><strong>Profissional:</strong> {appointment.professional}</div>
                              <div className="whitespace-nowrap"><strong>Modalidade:</strong> {appointment.modality === "online" ? "Online" : "Presencial"}</div>
                              <div className="whitespace-nowrap"><strong>Data:</strong> {new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                              <div className="whitespace-nowrap"><strong>Status:</strong> {appointment.status === "confirmed" ? "Confirmado" : appointment.status === "pending" ? "Pendente" : "Cancelado"}</div>
                            </div>
                          </div>
                        );
                        return (
                          <Tooltip key={`tooltip-apt-day-${appointment.id}`}>
                            <TooltipTrigger asChild>
                              <div 
                                className="p-3 rounded-lg border-l-[5px] cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all border border-gray-200/50"
                                style={{ 
                                  background: style.borderColor === "#10b77f" ? "linear-gradient(135deg, #d1f4e8 0%, #ecfdf5 100%)" : 
                                             style.borderColor === "#3b82f6" ? "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)" :
                                             style.borderColor === "#9333ea" ? "linear-gradient(135deg, #ede9fe 0%, #faf5ff 100%)" :
                                             style.borderColor === "#ef4444" ? "linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)" :
                                             "linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)",
                                  borderLeftColor: style?.borderColor,
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(appointment);
                                }}
                              >
                                <div className="flex items-start gap-2 w-full">
                                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                                        {appointment.time}
                                      </span>
                                      <span className="text-xs text-gray-500">-</span>
                                      <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                                        {endTime}
                                      </span>
                                    </div>
                                    <div className="text-sm font-semibold text-gray-900 break-words min-h-[18px] flex items-center gap-2 flex-wrap">
                                      {appointment.patient}
                                      {(() => {
                                        const patient = patients.find(p => p.name === appointment.patient);
                                        if (patient && patient.convenioId && patient.healthInsurance !== "Particular") {
                                          return (
                                            <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary bg-primary/10 text-primary flex items-center gap-1">
                                              <Building2 className="h-2.5 w-2.5" />
                                              {patient.convenioNome || patient.healthInsurance}
                                            </Badge>
                                          );
                                        }
                                        return null;
                                      })()}
                                    </div>
                                    <div className="text-xs font-medium text-gray-600 flex items-start gap-1 min-h-[16px]">
                                      <User className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                      <span className="break-words flex-1">{appointment.professional}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-sm" sideOffset={8}>
                              {tooltipContent}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                      {!isPast && (
                        <div 
                          className="text-sm text-muted-foreground hover:text-primary transition-colors pt-2 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSlotClick(dayIndex, hour, dayFull);
                          }}
                        >
                          + Novo agendamento
                        </div>
                      )}
                    </>
                  ) : (
                    !isPast && blockedSlotsInHour.length === 0 && (
                      <div 
                        className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSlotClick(dayIndex, hour, dayFull);
                        }}
                      >
                        + Novo agendamento
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar visualização mensal
  const renderMonthView = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const days = [];
    
    // Adicionar células vazias para dias antes do primeiro dia do mês
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Adicionar todos os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Filtrar agendamentos para este dia específico
      const filteredAppts = getFilteredAppointmentsForCalendar();
      const dayAppointments = filteredAppts.filter(apt => {
        const aptDate = new Date(apt.date + 'T00:00:00');
        return aptDate.getDate() === day && 
               aptDate.getMonth() === month && 
               aptDate.getFullYear() === year;
      });
      
      days.push({
        day,
        dateStr,
        appointments: dayAppointments,
        isToday: isCurrentDay(dateStr)
      });
    }
    
    // Preencher células restantes para completar o grid (6 semanas = 42 células)
    while (days.length < 42) {
      days.push(null);
    }
    
    return (
      <div className="p-2 sm:p-4 lg:p-6">
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(day => (
            <div key={day} className="text-center text-xs sm:text-sm font-semibold text-muted-foreground p-1 sm:p-2">
              {day}
            </div>
          ))}
          
          {days.map((dayData, i) => {
            if (!dayData) {
              return (
                <div
                  key={i}
                  className="border rounded-lg p-1 sm:p-2 min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] bg-muted/20"
                />
              );
            }
            
            const { day, dateStr, appointments, isToday } = dayData;
            const appointmentCount = appointments.length;
            const dateIsPast = isPastDate(dateStr);
            
            return (
              <div
                key={i}
                className={`border rounded-lg p-1 sm:p-2 min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] transition-colors ${
                  isToday ? 'bg-primary/10 border-primary' : ''
                } ${dateIsPast ? 'bg-gray-300/60 cursor-not-allowed' : 'hover:bg-muted/30 cursor-pointer'}`}
                style={{ cursor: dateIsPast ? 'not-allowed' : 'pointer' }}
                onClick={() => {
                  if (!dateIsPast) {
                    const newDate = new Date(year, month, day);
                    setSelectedDate(newDate);
                    setViewMode("day");
                  }
                }}
              >
                <div className={`flex items-center justify-between mb-1 sm:mb-2 ${isToday ? 'text-primary' : ''}`}>
                  <span className={`text-xs sm:text-sm font-semibold ${isToday ? 'text-primary' : ''}`}>
                    {day}
                  </span>
                  {appointmentCount > 0 && (
                    <span className="text-[10px] sm:text-xs font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                      {appointmentCount}
                    </span>
                  )}
                </div>
                {appointmentCount > 0 && (
                  <div className="space-y-0.5 sm:space-y-1 flex flex-col">
                    {appointments.slice(0, 3).map((apt, idx) => {
                      const style = procedureTypes[apt.type as keyof typeof procedureTypes] || procedureTypes["Consulta"];
                      return (
                        <div
                          key={idx}
                          className="w-full h-1.5 sm:h-2 rounded"
                          style={{ 
                            backgroundColor: style.borderColor
                          }}
                          title={`${apt.time} - ${apt.patient} - ${apt.type}`}
                        />
                      );
                    })}
                    {appointmentCount > 3 && (
                      <div className="text-[10px] text-muted-foreground">
                        +{appointmentCount - 3} mais
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar calendário semanal - Design simples e fluido (Google Calendar style)
  const renderWeekCalendar = (isExpanded: boolean = false) => {
    return (
      <div className={`relative bg-white h-full w-full overflow-hidden`} style={{ paddingBottom: 0, marginBottom: 0 }}>
        <div className="h-full overflow-y-auto overflow-x-auto scrollbar-hide-x" style={{ paddingBottom: 0, marginBottom: 0 }}>
          <div 
            className="w-full calendar-grid relative" 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '60px repeat(7, minmax(0, 1fr))',
              gap: 0,
              minWidth: 'max(100%, calc(60px + 7 * 100px))',
              paddingBottom: 0,
              marginBottom: 0,
              width: '100%'
            }}
          >
            {/* Header - Horário */}
            <div className="sticky left-0 top-0 z-50 bg-white border-r border-b border-gray-200 p-2 flex items-center justify-center shadow-sm" style={{ minWidth: '60px', maxWidth: '60px', position: 'sticky' }}>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide text-center">Horário</div>
            </div>
            
            {/* Header - Dias */}
            {weekDays.map((day, idx) => {
              const isToday = isCurrentDay(day.full);
              return (
                <div key={`day-header-${day.full}-${idx}`} className={`sticky top-0 z-40 border-r border-b border-gray-200 p-2 text-center bg-white shadow-sm ${isToday ? 'bg-primary/5' : ''}`} style={{ position: 'sticky', top: 0 }}>
                  <div className="text-xs font-medium text-gray-600 uppercase mb-1">{day.day}</div>
                  {isToday ? (
                    <div className="text-white bg-primary rounded-full w-7 h-7 flex items-center justify-center mx-auto text-sm font-semibold">
                      {day.date}
                    </div>
                  ) : (
                    <div className="text-lg font-semibold text-gray-900">
                      {day.date}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Grid de Horários */}
            {hours.map((hour, hourIdx) => {
              const isLastHour = hourIdx === hours.length - 1;
              return (
              <Fragment key={`hour-row-${hour}`}>
                <div className={`sticky left-0 z-30 bg-white border-r ${isLastHour ? 'border-b' : ''} border-gray-200 p-2 flex items-start justify-center`} data-hour={hour} style={{ minWidth: '60px', maxWidth: '60px', position: 'sticky', left: 0 }}>
                  <span className="text-xs text-gray-500 font-normal whitespace-nowrap">
                    {hour.toString().padStart(2, "0")}:00
                  </span>
                </div>
                
                {weekDays.map((day, dayIndex) => {
                  const appointmentsInSlot = hasSpaceInSlot(dayIndex, hour, day.full);
                  const dateIsPast = isPastDate(day.full);
                  const isToday = isCurrentDay(day.full);
                  const currentTimeMinutes = getCurrentTimeInMinutes();
                  const slotTime = `${hour.toString().padStart(2, '0')}:00`;
                  const timeIsPast = isPastTime(day.full, slotTime);
                  const isPast = dateIsPast || timeIsPast;
                  const showCurrentTimeLine = isToday && hour * 60 <= currentTimeMinutes && currentTimeMinutes < (hour + 1) * 60;
                  const slotIsBlocked = isSlotBlocked(dayIndex, hour, day.full);
                  
                  const blockedSlotsInHour = blockedSlots.filter(slot => {
                    // Filtrar por profissional: 
                    // - Se "all" está selecionado: mostrar apenas bloqueios gerais da clínica (sem professional)
                    // - Se um profissional específico está selecionado: mostrar bloqueios gerais (sem professional) + bloqueios desse profissional específico
                    if (filterProfessional === "all") {
                      // Quando "Todos Profissionais" está selecionado, mostrar apenas bloqueios gerais da clínica
                      if (slot.professional) {
                        return false; // Não mostrar bloqueios específicos de profissionais
                      }
                    } else {
                      // Quando um profissional específico está selecionado, exibir:
                      // 1. Bloqueios gerais da clínica (sem campo professional) - ex: "Horário de Almoço da Clínica"
                      // 2. Bloqueios de almoço do profissional selecionado (professional === filterProfessional e reason contém "Horário de Almoço")
                      // 3. Bloqueios manuais do profissional selecionado (professional === filterProfessional e reason não contém "Horário de Almoço")
                      
                      // Se o bloqueio tem um profissional específico e não é o profissional selecionado, não mostrar
                      if (slot.professional && slot.professional !== filterProfessional) {
                        return false;
                      }
                      // Bloqueios sem professional (gerais da clínica) sempre são exibidos
                      // Bloqueios com professional igual ao selecionado também são exibidos (inclui almoço e bloqueios manuais)
                    }
                    
                    // Verificar se o bloqueio corresponde ao dia correto
                    if (slot.date && slot.date !== day.full) return false;
                    // Para bloqueios recorrentes (sem data), comparar com o dia da semana real (day.dayOfWeek)
                    if (!slot.date && slot.day !== day.dayOfWeek) {
                      // Log para debug quando bloqueio não corresponde ao dia
                      if (slot.reason?.includes("Horário de Almoço") && hour === 12) {
                        console.log(`Agenda: Bloqueio de almoço não corresponde ao dia - Bloqueio dia: ${slot.day}, Dia da semana: ${day.dayOfWeek}, Dia index: ${dayIndex}`);
                      }
                      return false;
                    }
                    
                    // Verificar se o bloqueio está dentro do horário do slot
                    const [blockHour, blockMinute] = slot.time.split(':').map(Number);
                    const blockStart = blockHour * 60 + blockMinute;
                    const blockEnd = blockStart + slot.duration;
                    const slotStart = hour * 60;
                    const slotEnd = (hour + 1) * 60;
                    
                    const overlaps = (blockStart < slotEnd && blockEnd > slotStart);
                    
                    // Log para debug de bloqueios de almoço
                    if (slot.reason?.includes("Horário de Almoço")) {
                      if (overlaps) {
                        console.log(`Agenda: Bloqueio de almoço encontrado no slot ${hour}:00 - ${slot.reason} - Dia ${dayIndex} (dia da semana: ${day.dayOfWeek}) - Profissional: ${slot.professional || 'Clínica'} - Filtro: ${filterProfessional} - Será exibido: ${overlaps}`);
                      } else if (hour === 12) {
                        console.log(`Agenda: Bloqueio de almoço não sobrepõe slot ${hour}:00 - ${slot.reason} - Bloqueio: ${slot.time} (${slot.duration} min) - Dia ${day.dayOfWeek}`);
                      }
                    }
                    
                    // Log adicional quando filtro não corresponde
                    if (slot.reason?.includes("Horário de Almoço") && hour === 12 && overlaps) {
                      if (filterProfessional !== "all" && slot.professional && slot.professional !== filterProfessional) {
                        console.log(`Agenda: ATENÇÃO - Bloqueio de almoço do profissional ${slot.professional} não será exibido porque o filtro está em ${filterProfessional}`);
                      }
                    }
                    
                    return overlaps;
                  });
                  
                  // Calcular altura mínima do slot baseado em 60px por hora
                  const minSlotHeight = 60;
                  
                  return (
                    <div
                      key={`slot-${day.full}-${hour}-${dayIndex}`}
                      data-day-index={day.dayIndex}
                      data-hour={hour}
                      data-date={day.full}
                      className={`relative border-r border-l ${isLastHour ? 'border-b' : ''} border-t border-gray-200 ${isPast ? 'bg-gray-300/60' : 'bg-white'} transition-colors`}
                      style={{ 
                        minHeight: `${minSlotHeight}px`, 
                        padding: '2px',
                        marginBottom: 0,
                        paddingBottom: isLastHour ? '2px' : undefined,
                        position: 'relative',
                        cursor: isPast ? 'not-allowed' : 'default'
                      }}
                      onDragOver={(e) => {
                        // Não permitir drag over em slots passados
                        if (draggedAppointment && !isPast) {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDragOver(e, dayIndex, hour, day.full);
                        } else if (isPast) {
                          e.preventDefault();
                          e.stopPropagation();
                          e.dataTransfer.dropEffect = "none";
                        }
                      }}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDragLeave(e);
                        
                        // NÃO permitir drop em slots passados
                        if (isPast) {
                          toast.error("Não é possível mover para datas ou horários passados");
                          setDraggedAppointment(null);
                          return;
                        }
                        
                        // IMPORTANTE: Usar dayIndex do map e day.full diretamente
                        // Esses valores já são do slot correto onde o onDrop foi configurado
                        console.log("onDrop chamado no slot:", {
                          dayIndex: dayIndex,
                          hour: hour,
                          dateStr: day.full,
                          dayDayIndex: day.dayIndex,
                          isPast: isPast
                        });
                        handleDrop(e, dayIndex, hour, day.full);
                      }}
                      onClick={() => !isPast && !slotIsBlocked && blockedSlotsInHour.length === 0 && handleSlotClick(day.dayIndex, hour, day.full)}
                    >
                      {showCurrentTimeLine && (
                        <div 
                          className="absolute left-0 right-0 z-[15] flex items-center pointer-events-none"
                          style={{ top: `${((currentTimeMinutes - hour * 60) / 60) * 100}%` }}
                        >
                          <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 border-2 border-white"></div>
                          <div className="flex-1 h-0.5 bg-red-500"></div>
                        </div>
                      )}
                      
                      {/* Bloqueios */}
                      {blockedSlotsInHour.map((blockedSlot, blockIdx) => {
                        const [blockHour, blockMinute] = blockedSlot.time.split(':').map(Number);
                        const blockStartMinutes = blockHour * 60 + blockMinute;
                        const blockEndMinutes = blockStartMinutes + blockedSlot.duration;
                        const endTime = calculateEndTime(blockedSlot.time, blockedSlot.duration);
                        const slotStartMinutes = hour * 60;
                        const slotEndMinutes = (hour + 1) * 60;
                        
                        // Verificar se o bloqueio está neste slot ou passa por ele
                        if (blockEndMinutes <= slotStartMinutes || blockStartMinutes >= slotEndMinutes) return null;
                        
                        // Calcular posição e altura do bloqueio neste slot específico
                        const blockStartInSlot = Math.max(0, blockStartMinutes - slotStartMinutes);
                        const blockEndInSlot = Math.min(60, blockEndMinutes - slotStartMinutes);
                        const blockHeightInSlot = blockEndInSlot - blockStartInSlot;
                        const blockTopPercent = (blockStartInSlot / 60) * 100;
                        const blockHeightPercent = (blockHeightInSlot / 60) * 100;
                        
                        // Se o bloqueio começa em um slot anterior, mostrar apenas a parte que está neste slot
                        const isContinuation = blockStartMinutes < slotStartMinutes;
                        
                        const tooltipContent = (
                          <div className="space-y-1.5 min-w-[200px]">
                            <div className="font-semibold text-sm whitespace-nowrap">Horário Bloqueado</div>
                            <div className="text-xs space-y-0.5">
                              <div className="whitespace-nowrap"><strong>Horário:</strong> {blockedSlot.time} - {endTime}</div>
                              <div className="whitespace-nowrap"><strong>Duração:</strong> {blockedSlot.duration} minutos</div>
                              <div className="break-words"><strong>Motivo:</strong> {blockedSlot.reason}</div>
                              <div className="whitespace-nowrap"><strong>Profissional:</strong> {blockedSlot.professional || "Sistema"}</div>
                              {blockedSlot.date && <div className="whitespace-nowrap"><strong>Data:</strong> {new Date(blockedSlot.date + 'T00:00:00').toLocaleDateString('pt-BR')}</div>}
                            </div>
                          </div>
                        );
                        
                        return (
                          <Tooltip key={`tooltip-block-${blockedSlot.date}-${blockedSlot.time}-${blockIdx}`}>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute rounded cursor-grab active:cursor-grabbing hover:opacity-90 transition-opacity z-[5]"
                                draggable
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  handleBlockDragStart(e, blockedSlot);
                                }}
                                onDragEnd={() => {
                                  // Não limpar aqui, deixar handleDrop fazer isso após processar
                                  console.log("onDragEnd: drag finalizado (bloqueio)");
                                }}
                                onMouseEnter={(e) => e.stopPropagation()}
                                onMouseLeave={(e) => e.stopPropagation()}
                                style={{
                                  top: `${Math.max(0, Math.min(100, blockTopPercent))}%`,
                                  left: '2px',
                                  right: '2px',
                                  height: `${Math.max(0, Math.min(100, blockHeightPercent))}%`,
                                  minHeight: isContinuation ? '24px' : '32px',
                                  maxHeight: 'calc(100% - 4px)',
                                  maxWidth: 'calc(100% - 4px)',
                                  backgroundColor: '#6b7280',
                                  borderLeft: '3px solid #374151',
                                  borderRadius: '4px',
                                  boxSizing: 'border-box',
                                  position: 'absolute',
                                  overflow: 'hidden',
                                  zIndex: 5,
                                  pointerEvents: 'auto'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBlockClick(blockedSlot);
                                }}
                              >
                                <div className="h-full w-full px-2 py-1 flex flex-col justify-between gap-0.5 overflow-hidden">
                                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                                    {!isContinuation && (
                                      <div className="flex items-center gap-1.5">
                                        <Lock className="h-2.5 w-2.5 text-white flex-shrink-0" />
                                        <div className="text-[10px] font-semibold text-white leading-tight whitespace-nowrap">
                                          {blockedSlot.time} - {endTime}
                                        </div>
                                      </div>
                                    )}
                                    <div className={`text-[11px] text-white/90 leading-tight ${isContinuation ? 'line-clamp-2' : 'truncate'}`}>
                                      {blockedSlot.reason}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs" sideOffset={8}>
                              {tooltipContent}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                      
                      {/* Agendamentos */}
                      {appointmentsInSlot.map((appointment, aptIndex) => {
                        const style = procedureTypes[appointment.type as keyof typeof procedureTypes] || procedureTypes["Consulta"];
                        const [aptHour, aptMinute] = appointment.time.split(':').map(Number);
                        const aptStartMinutes = aptHour * 60 + aptMinute;
                        const aptEndMinutes = aptStartMinutes + appointment.duration;
                        const endTime = calculateEndTime(appointment.time, appointment.duration);
                        const slotStartMinutes = hour * 60;
                        const slotEndMinutes = (hour + 1) * 60;
                        
                        // Verificar se o agendamento está neste slot ou passa por ele
                        if (aptEndMinutes <= slotStartMinutes || aptStartMinutes >= slotEndMinutes) return null;
                        
                        // Renderizar o card apenas no slot onde ele começa
                        const cardStartsInThisSlot = aptStartMinutes >= slotStartMinutes && aptStartMinutes < slotEndMinutes;
                        if (!cardStartsInThisSlot) return null;
                        
                        // Calcular posição e altura do card (igual ao AgendaProfissional.tsx)
                        // Calcular altura total somando as alturas de cada slot sobreposto
                        const hoursSpanned = Math.ceil(appointment.duration / 60);
                        let totalHeight = 0;
                        
                        for (let h = 0; h < hoursSpanned; h++) {
                          const currentHourSlot = hour + h;
                          const currentSlotStartMinutes = currentHourSlot * 60;
                          const currentSlotEndMinutes = (currentHourSlot + 1) * 60;
                          const overlapStart = Math.max(aptStartMinutes, currentSlotStartMinutes);
                          const overlapEnd = Math.min(aptEndMinutes, currentSlotEndMinutes);
                          const overlapDuration = overlapEnd - overlapStart;
                          
                          if (overlapDuration > 0) {
                            const slotHeightPercent = (overlapDuration / 60) * 100;
                            totalHeight += (slotHeightPercent / 100) * minSlotHeight;
                          }
                        }
                        
                        if (totalHeight === 0) {
                          totalHeight = (appointment.duration / 60) * minSlotHeight;
                        }
                        totalHeight = Math.max(totalHeight, 60);
                        
                        // Calcular posição top em porcentagem
                        const cardStartInSlot = aptStartMinutes - slotStartMinutes; // minutos dentro do slot
                        const cardTopPercent = (cardStartInSlot / 60) * 100;
                        
                        // Se o card começa em um slot anterior, não renderizar aqui
                        const isContinuation = false; // Sempre false pois só renderizamos no slot inicial
                        
                        // Calcular sobreposições para empilhar horizontalmente
                        const overlappingAppointments = appointmentsInSlot.filter((otherApt, otherIndex) => {
                          if (otherIndex === aptIndex) return false;
                          const [otherHour, otherMinute] = otherApt.time.split(':').map(Number);
                          if (otherHour !== hour) return false;
                          const otherStartMinutes = otherHour * 60 + otherMinute;
                          const otherEndMinutes = otherStartMinutes + otherApt.duration;
                          return (aptStartMinutes < otherEndMinutes && aptEndMinutes > otherStartMinutes);
                        });
                        
                        const totalOverlapping = Math.max(1, overlappingAppointments.length + 1);
                        const widthPercent = Math.max(10, Math.min(100, 100 / totalOverlapping));
                        const leftOffset = overlappingAppointments.filter((otherApt) => {
                          const [otherHour, otherMinute] = otherApt.time.split(':').map(Number);
                          const otherStartMinutes = otherHour * 60 + otherMinute;
                          return otherStartMinutes < aptStartMinutes;
                        }).length;
                        
                        // Usar posição e altura calculadas
                        const aptTopPercent = cardTopPercent;
                        const aptHeightPx = totalHeight;
                        
                        const tooltipContent = (
                          <div className="space-y-1.5 min-w-[200px]">
                            <div className="font-semibold text-sm whitespace-nowrap flex items-center gap-2">
                              {appointment.patient}
                              {(() => {
                                const patient = patients.find(p => p.name === appointment.patient);
                                if (patient && patient.convenioId && patient.healthInsurance !== "Particular") {
                                  return (
                                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary bg-primary/10 text-primary flex items-center gap-1">
                                      <Building2 className="h-2.5 w-2.5" />
                                      {patient.convenioNome || patient.healthInsurance}
                                    </Badge>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                            <div className="text-xs space-y-0.5">
                              <div className="whitespace-nowrap"><strong>Tipo:</strong> {appointment.type}</div>
                              <div className="whitespace-nowrap"><strong>Horário:</strong> {appointment.time} - {endTime}</div>
                              <div className="whitespace-nowrap"><strong>Duração:</strong> {appointment.duration} minutos</div>
                              <div className="whitespace-nowrap"><strong>Profissional:</strong> {appointment.professional}</div>
                              <div className="whitespace-nowrap"><strong>Modalidade:</strong> {appointment.modality === "online" ? "Online" : "Presencial"}</div>
                              <div className="whitespace-nowrap"><strong>Data:</strong> {new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                            </div>
                          </div>
                        );
                        
                        return (
                          <Tooltip key={`tooltip-apt-${appointment.id}`}>
                            <TooltipTrigger asChild>
                              <div
                                className={`absolute rounded cursor-grab active:cursor-grabbing hover:opacity-90 transition-all z-[10] ${
                                  draggedAppointment?.id === appointment.id ? 'opacity-50' : 'opacity-100'
                                }`}
                                draggable={true}
                                onMouseEnter={(e) => e.stopPropagation()}
                                onMouseLeave={(e) => e.stopPropagation()}
                                style={{
                                  top: `${Math.max(0, Math.min(100, aptTopPercent))}%`,
                                  left: `${leftOffset * widthPercent + 2}%`,
                                  width: `calc(${widthPercent}% - 4px)`,
                                  height: `${aptHeightPx}px`,
                                  minHeight: '32px',
                                  maxWidth: 'calc(100% - 4px)',
                                  backgroundColor: style.borderColor === "#10b77f" ? '#d1fae5' :
                                                 style.borderColor === "#3b82f6" ? '#dbeafe' :
                                                 style.borderColor === "#9333ea" ? '#ede9fe' :
                                                 style.borderColor === "#ef4444" ? '#fee2e2' :
                                                 '#fef3c7',
                                  borderLeft: `3px solid ${style.borderColor}`,
                                  borderRadius: '4px',
                                  padding: '4px 6px',
                                  boxSizing: 'border-box',
                                  position: 'absolute',
                                  zIndex: 10,
                                  pointerEvents: 'auto',
                                  cursor: 'grab'
                                }}
                                onDragStart={(e) => {
                                  e.stopPropagation();
                                  e.dataTransfer.effectAllowed = "move";
                                  handleDragStart(e, appointment);
                                }}
                                onDragEnd={(e) => {
                                  e.stopPropagation();
                                  // Não limpar aqui, deixar handleDrop fazer isso após processar
                                  console.log("onDragEnd: drag finalizado (agendamento)");
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(appointment);
                                }}
                              >
                                <div className="h-full w-full flex flex-col justify-start gap-1 overflow-hidden">
                                  <div className="text-[10px] font-semibold text-gray-700 leading-tight whitespace-nowrap">
                                    {appointment.time} - {endTime}
                                  </div>
                                  <div className="text-[11px] font-medium text-gray-900 leading-tight line-clamp-1 flex-1">
                                    {appointment.patient}
                                  </div>
                                  <div className="text-[10px] font-medium text-gray-600 leading-tight line-clamp-1">
                                    {appointment.professional}
                                  </div>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-sm" sideOffset={8}>
                              {tooltipContent}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                      
                      {/* Link para novo agendamento */}
                      {!slotIsBlocked && blockedSlotsInHour.length === 0 && appointmentsInSlot.length === 0 && !isPast && (
                        <div 
                          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer z-[1]"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSlotClick(day.dayIndex, hour, day.full);
                          }}
                        >
                          <span className="text-xs text-gray-400 font-medium">+ Novo agendamento</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={50}>
      <div className="flex-1 flex flex-col space-y-4 sm:space-y-6 p-4 sm:p-6" style={{ minHeight: 0, height: '100%', overflow: 'hidden' }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
        <div className="flex items-baseline gap-2 sm:gap-3">
          <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Agenda</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Visualização unificada de agendamentos
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
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 flex-shrink-0">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total Hoje
              <Calendar className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {appointments.filter(apt => {
                const today = new Date().toISOString().split('T')[0];
                return apt.date === today;
              }).length}
            </div>
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
            <div className="text-2xl font-bold text-success">
              {appointments.filter(apt => apt.status === 'confirmed').length}
            </div>
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
            <div className="text-2xl font-bold text-warning">
              {appointments.filter(apt => apt.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Aguardando confirmação
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-info">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Próxima Consulta
              <CalendarCheck className="h-4 w-4 text-info" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              // Obter data/hora atual no timezone do Brasil
              const now = new Date();
              const brazilNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
              
              // Obter data de hoje no formato YYYY-MM-DD
              const today = brazilNow.getFullYear() + '-' + 
                           String(brazilNow.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(brazilNow.getDate()).padStart(2, '0');
              
              const [currentHour, currentMinute] = [brazilNow.getHours(), brazilNow.getMinutes()];
              const currentTimeMinutes = currentHour * 60 + currentMinute;
              
              const upcomingAppointments = appointments
                .filter(apt => {
                  if (apt.status === 'cancelled') return false;
                  
                  const aptDate = apt.date;
                  if (aptDate > today) return true;
                  if (aptDate === today) {
                    const [aptHour, aptMinute] = apt.time.split(':').map(Number);
                    const aptTimeMinutes = aptHour * 60 + aptMinute;
                    return aptTimeMinutes >= currentTimeMinutes;
                  }
                  return false;
                })
                .sort((a, b) => {
                  if (a.date !== b.date) return a.date.localeCompare(b.date);
                  return a.time.localeCompare(b.time);
                });
              
              if (upcomingAppointments.length > 0) {
                const next = upcomingAppointments[0];
                const [nextHour, nextMinute] = next.time.split(':').map(Number);
                
                // Criar data/hora da próxima consulta no timezone do Brasil
                const nextDateStr = next.date + 'T' + next.time + ':00';
                const nextDate = new Date(nextDateStr);
                
                // Calcular diferença em minutos
                const nextTimeMinutes = nextHour * 60 + nextMinute;
                let diffMins = 0;
                
                if (next.date === today) {
                  // Se for hoje, calcular diferença apenas do horário
                  diffMins = nextTimeMinutes - currentTimeMinutes;
                } else {
                  // Se for outro dia, calcular diferença completa
                  const todayStart = new Date(today + 'T00:00:00');
                  const daysDiff = Math.floor((nextDate.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24));
                  diffMins = (daysDiff * 24 * 60) + (nextTimeMinutes - currentTimeMinutes);
                }
                
                let timeText = '';
                if (diffMins < 0) {
                  timeText = 'Agora';
                } else if (diffMins < 60) {
                  timeText = `Em ${diffMins} minutos`;
                } else if (diffMins < 1440) {
                  const hours = Math.floor(diffMins / 60);
                  timeText = `Em ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
                } else {
                  const days = Math.floor(diffMins / 1440);
                  timeText = `Em ${days} ${days === 1 ? 'dia' : 'dias'}`;
                }
                
                return (
                  <>
                    <div className="text-2xl font-bold text-info">{next.time}</div>
                    <p className="text-xs text-muted-foreground mt-1">{timeText}</p>
                  </>
                );
              }
              
              return (
                <>
                  <div className="text-2xl font-bold text-info">--:--</div>
                  <p className="text-xs text-muted-foreground mt-1">Nenhuma consulta agendada</p>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 flex-1" style={{ minHeight: 0, height: '100%', overflow: 'hidden' }}>
        {/* Calendário Semanal */}
        <Card className="lg:col-span-2 flex flex-col" style={{ minHeight: 0, height: '100%', overflow: 'visible' }}>
          <CardHeader className="flex-shrink-0">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="flex items-center gap-2">
                    Calendário Semanal
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="icon" onClick={() => navigateDate("prev")}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-medium text-foreground min-w-[120px] text-center">
                    {viewMode === "week" 
                      ? `${weekDays[0]?.dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })} - ${weekDays[6]?.dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                      : getCurrentMonthYear()}
                  </div>
                  <Button variant="outline" size="icon" onClick={() => navigateDate("next")}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Tabs 
                  value={viewMode} 
                  onValueChange={(v: any) => {
                    setViewMode(v);
                    setSelectedDate(new Date());
                  }} 
                  className="w-full sm:w-auto"
                >
                  <TabsList>
                    <TabsTrigger value="day" className="text-xs sm:text-sm">Dia</TabsTrigger>
                    <TabsTrigger value="week" className="text-xs sm:text-sm">Semana</TabsTrigger>
                    <TabsTrigger value="month" className="text-xs sm:text-sm">Mês</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setBlockTimeOpen(true)} className="w-full sm:w-auto h-9 sm:h-10">
                    <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <span className="text-xs sm:text-sm">Bloquear</span>
                  </Button>
                  
                  <Button variant="outline" onClick={() => setCalendarExpanded(true)} className="w-full sm:w-auto h-9 sm:h-10">
                    <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <span className="text-xs sm:text-sm">Expandir</span>
                  </Button>
                </div>
              </div>

              {/* Legenda */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-2">
                <div className="font-semibold text-xs sm:text-sm text-foreground">Legenda:</div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2" style={{ borderColor: "#10b77f", backgroundColor: "hsl(var(--primary) / 0.2)" }}></div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Consulta</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2" style={{ borderColor: "#3b82f6", backgroundColor: "hsl(var(--info) / 0.2)" }}></div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Retorno</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2" style={{ borderColor: "#9333ea", backgroundColor: "#ede9fe" }}></div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Primeira Consulta</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2" style={{ borderColor: "#ef4444", backgroundColor: "hsl(var(--destructive) / 0.2)" }}></div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Cirurgia</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2" style={{ borderColor: "#f59e0b", backgroundColor: "hsl(var(--warning) / 0.2)" }}></div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Exame</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="h-3 w-3 sm:h-4 sm:w-4 rounded border-2 border-blue-600 bg-blue-50"></div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Online</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Presencial</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Bloqueado</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col flex-1 min-h-0" style={{ paddingBottom: 0, marginBottom: 0, height: '100%', overflow: 'hidden' }}>
            <div className="flex-1 min-h-0 h-full w-full overflow-hidden">
              {viewMode === "week" && renderWeekCalendar(false)}
              {viewMode === "day" && renderDayView()}
              {viewMode === "month" && renderMonthView()}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Agendamentos */}
        <Card className="flex flex-col" style={{ minHeight: 0 }}>
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Agendamentos
            </CardTitle>
            <div className="flex flex-col gap-2 mt-4">
              <SearchBar
                placeholder="Buscar paciente por nome ou CPF..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="w-full"
              />
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="flex-1">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="confirmed">Confirmados</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterProfessional} onValueChange={setFilterProfessional}>
                  <SelectTrigger className="flex-1">
                    <User className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Todos Profissionais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Profissionais</SelectItem>
                    {professionals.map((prof) => (
                      <SelectItem key={prof} value={prof}>
                        {prof}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 min-h-0 p-6">
            <ScrollArea className="flex-1" style={{ maxHeight: '660px', height: '660px' }}>
              <div className="space-y-2 pr-4">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum agendamento encontrado</p>
                  </div>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-3 sm:p-4 rounded-lg border transition-colors cursor-pointer ${
                        selectedCardId === appointment.id 
                          ? 'bg-primary/10 border-primary/30 shadow-sm' 
                          : 'hover:bg-muted/50 border-border'
                      }`}
                      onClick={() => {
                        setSelectedCardId(appointment.id);
                        handleEdit(appointment);
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm sm:text-base truncate">{appointment.patient}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">{appointment.professional}</div>
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(appointment.status)}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground mb-2 sm:mb-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{appointment.time}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {(() => {
                          const typeStyle = procedureTypes[appointment.type as keyof typeof procedureTypes] || procedureTypes["Consulta"];
                          return (
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] px-1.5 py-0.5 ${typeStyle.color}`}
                              style={{ borderColor: typeStyle.borderColor }}
                            >
                              {appointment.type}
                            </Badge>
                          );
                        })()}
                        {appointment.modality === "presencial" ? (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-green-600 bg-green-50 text-green-700">
                            <MapPin className="h-2.5 w-2.5 mr-1" />
                            Presencial
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 border-blue-600 bg-blue-50 text-blue-700">
                            Online
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {appointment.status === "pending" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 bg-success/10 text-success hover:bg-success/20 hover:text-success border-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAppointment(appointment);
                                  setConfirmDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Confirmar</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 bg-info/10 text-info hover:bg-info/20 hover:text-info border-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReschedule(appointment);
                              }}
                            >
                              <CalendarClock className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Remarcar</p>
                          </TooltipContent>
                        </Tooltip>
                        {appointment.status !== "cancelled" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 bg-warning/10 text-warning hover:bg-warning/20 hover:text-warning border-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAppointment(appointment);
                                  setCancelDialogOpen(true);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cancelar</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive border-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAppointment(appointment);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir</p>
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
      </div>

      {/* Diálogo Novo Agendamento */}
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
          setPatientSearchQuery("");
        }
      }}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] p-0 flex flex-col" style={{ height: '90vh', maxHeight: '90vh' }}>
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 flex-shrink-0 border-b">
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>Crie um novo agendamento</DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 px-4 sm:px-6 overflow-y-auto">
            <div className="grid gap-4 py-4 pr-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="new-patient">Paciente *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setQuickRegisterData({ name: "", phone: "", email: "", cpf: "", healthInsurance: "Particular" });
                      setQuickRegisterOpen(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Cadastro Rápido
                  </Button>
                </div>
                <div className="relative">
                  <SearchBar
                    placeholder="Buscar paciente por nome ou CPF..."
                    value={patientSearchQuery}
                    onChange={setPatientSearchQuery}
                    inputHeight="large"
                    className="w-full"
                  />
                  {patientSearchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-[100] max-h-[400px] overflow-auto">
                      {filteredPatients.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                          Nenhum paciente encontrado.
                        </div>
                      ) : (
                        <div className="py-2">
                          {filteredPatients.map((patient) => (
                            <div
                              key={patient.id}
                              onClick={() => {
                                setNewFormData({ ...newFormData, patient: patient.name });
                                setPatientSearchQuery("");
                                toast.success(`Paciente ${patient.name} selecionado`);
                              }}
                              className="cursor-pointer hover:bg-accent/20 transition-all p-4 border-b last:border-b-0"
                            >
                              <div className="flex items-center gap-4 w-full">
                                <Avatar className="h-12 w-12 border">
                                  <AvatarImage src={patient.photo} />
                                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {patient.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm">{patient.name}</p>
                                  <div className="flex items-center gap-3 mt-1.5">
                                    <Badge variant="secondary" className="text-xs font-medium">
                                      {patient.healthInsurance}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {patient.cpf}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {patient.phone}
                                    </span>
                                  </div>
                                </div>
                                {newFormData.patient === patient.name && (
                                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {newFormData.patient && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Paciente selecionado: {newFormData.patient}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNewFormData({ ...newFormData, patient: "" });
                        setPatientSearchQuery("");
                      }}
                      className="ml-auto h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Digite o nome, CPF ou telefone do paciente para buscar, ou use "Cadastro Rápido" para cadastrar novo paciente
                </p>
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
                    {professionals.map((prof) => (
                      <SelectItem key={prof} value={prof}>
                        {prof}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-type">Tipo *</Label>
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
                    const selectedDate = e.target.value;
                    // Validar se a data selecionada é passada
                    if (selectedDate && isPastDate(selectedDate)) {
                      toast.error("Não é possível agendar em datas passadas");
                      return;
                    }
                    setNewFormData({ ...newFormData, date: selectedDate, time: "" });
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
                    key={`new-time-${newFormData.date}-${newFormData.duration}`}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => {
                        const isPast = isPastTime(newFormData.date, slot.display);
                        const hasConflict = checkTimeConflict(newFormData.date, slot.display, newFormData.duration, undefined, newFormData.professional);
                        const available = !isPast && !hasConflict;
                        return (
                          <SelectItem 
                            key={`${slot.display}-${newFormData.date}-${newFormData.duration}`} 
                            value={slot.display}
                            disabled={!available}
                          >
                            {slot.display} {isPast && "(Passado)"} {!isPast && hasConflict && "(Ocupado)"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 flex-shrink-0 flex-col sm:flex-row gap-2 sm:gap-0 border-t">
            <Button variant="outline" onClick={() => setNewAppointmentOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleCreateAppointment} disabled={!newFormData.patient || !newFormData.professional || !newFormData.date || !newFormData.time} className="w-full sm:w-auto">
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Editar Agendamento */}
      <Dialog open={editAppointmentOpen} onOpenChange={setEditAppointmentOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] p-0 flex flex-col" style={{ height: '90vh', maxHeight: '90vh' }}>
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 flex-shrink-0 border-b">
            <DialogTitle>Editar Agendamento</DialogTitle>
            <DialogDescription>Edite as informações do agendamento</DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 px-4 sm:px-6 overflow-y-auto">
            <div className="grid gap-4 py-4 pr-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-patient">Paciente *</Label>
                <Input
                  id="edit-patient"
                  value={editFormData.patient}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  O nome do paciente não pode ser alterado
                </p>
              </div>
              {selectedAppointment && (
                <div className="grid gap-2">
                  <Label>Profissional Original</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-border">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {selectedAppointment.professional}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Profissional que realizou o agendamento original
                  </p>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="edit-professional">Profissional *</Label>
                <Select 
                  value={editFormData.professional} 
                  onValueChange={(value) => setEditFormData({ ...editFormData, professional: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {professionals.map((prof) => (
                      <SelectItem key={prof} value={prof}>
                        {prof}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Tipo *</Label>
                <Select 
                  value={editFormData.type} 
                  onValueChange={(value) => setEditFormData({ ...editFormData, type: value })}
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
                    setEditFormData({ ...editFormData, duration: parseInt(value), time: "" });
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
                <Label htmlFor="edit-date">Data *</Label>
                <Input 
                  id="edit-date" 
                  type="date" 
                  value={editFormData.date}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    // Validar se a data selecionada é passada
                    if (selectedDate && isPastDate(selectedDate)) {
                      toast.error("Não é possível agendar em datas passadas");
                      return;
                    }
                    setEditFormData({ ...editFormData, date: selectedDate, time: "" });
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              {editFormData.date && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-time">Horário *</Label>
                  <Select 
                    value={editFormData.time} 
                    onValueChange={(value) => setEditFormData({ ...editFormData, time: value })}
                    key={`edit-time-${editFormData.date}-${editFormData.duration}`}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => {
                        const isPast = isPastTime(editFormData.date, slot.display);
                        const hasConflict = checkTimeConflict(editFormData.date, slot.display, editFormData.duration, selectedAppointment?.id, editFormData.professional);
                        const available = !isPast && !hasConflict;
                        return (
                          <SelectItem 
                            key={`${slot.display}-${editFormData.date}-${editFormData.duration}`} 
                            value={slot.display}
                            disabled={!available}
                          >
                            {slot.display} {isPast && "(Passado)"} {!isPast && hasConflict && "(Ocupado)"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 flex-shrink-0 flex-col sm:flex-row gap-2 sm:gap-0 border-t">
            <Button variant="outline" onClick={() => setEditAppointmentOpen(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="w-full sm:w-auto">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Remarcar Agendamento */}
      <Dialog open={rescheduleAppointmentOpen} onOpenChange={setRescheduleAppointmentOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Remarcar Agendamento</DialogTitle>
            <DialogDescription>Escolha nova data e horário</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Paciente</Label>
              <Input value={selectedAppointment?.patient} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reschedule-date">Nova Data *</Label>
              <Input 
                id="reschedule-date" 
                type="date" 
                value={rescheduleFormData.date}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  // Validar se a data selecionada é passada
                  if (selectedDate && isPastDate(selectedDate)) {
                    toast.error("Não é possível agendar em datas passadas");
                    return;
                  }
                  setRescheduleFormData({ ...rescheduleFormData, date: selectedDate, time: "" });
                }}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {rescheduleFormData.date && selectedAppointment && (
              <div className="grid gap-2">
                <Label htmlFor="reschedule-time">Novo Horário *</Label>
                <Select 
                  value={rescheduleFormData.time} 
                  onValueChange={(value) => setRescheduleFormData({ ...rescheduleFormData, time: value })}
                  key={`reschedule-time-${rescheduleFormData.date}-${selectedAppointment.duration}`}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                      {timeSlots.map((slot) => {
                        const isPast = isPastTime(rescheduleFormData.date, slot.display);
                        const hasConflict = checkTimeConflict(rescheduleFormData.date, slot.display, selectedAppointment.duration, selectedAppointment.id, selectedAppointment.professional);
                        const available = !isPast && !hasConflict;
                        return (
                          <SelectItem 
                            key={`${slot.display}-${rescheduleFormData.date}-${selectedAppointment.duration}`} 
                            value={slot.display}
                            disabled={!available}
                          >
                            {slot.display} {isPast && "(Passado)"} {!isPast && hasConflict && "(Ocupado)"}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleAppointmentOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveReschedule} disabled={!rescheduleFormData.date || !rescheduleFormData.time}>
              Remarcar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Confirmar */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja confirmar este agendamento?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo Cancelar */}
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

      {/* Diálogo Excluir */}
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

      {/* Diálogo Excluir Bloqueio */}
      <AlertDialog open={deleteBlockDialogOpen} onOpenChange={setDeleteBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Bloqueio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente este bloqueio? Esta ação não pode ser desfeita.
              {selectedBlock && (
                <div className="mt-2 p-2 bg-muted rounded text-sm">
                  <div><strong>Horário:</strong> {selectedBlock.time} - {calculateEndTime(selectedBlock.time, selectedBlock.duration)}</div>
                  <div><strong>Motivo:</strong> {selectedBlock.reason}</div>
                  {selectedBlock.professional && <div><strong>Profissional:</strong> {selectedBlock.professional}</div>}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBlock} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo Bloquear Horário */}
      <Dialog open={blockTimeOpen} onOpenChange={(open) => {
        setBlockTimeOpen(open);
        if (!open) {
          setBlockDate("");
          setBlockTime("");
          setBlockDuration("");
          setBlockReason("");
          setBlockProfessional("");
          setSelectedBlock(null);
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedBlock ? "Editar Bloqueio" : "Bloquear Horário"}</DialogTitle>
            <DialogDescription>
              {selectedBlock 
                ? "Edite ou exclua o bloqueio de horário"
                : "Bloqueie um horário para que não seja possível agendar consultas neste período"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="block-date">Data *</Label>
              <Input 
                id="block-date" 
                type="date" 
                value={blockDate}
                onChange={(e) => {
                  setBlockDate(e.target.value);
                  setBlockTime(""); // Resetar horário quando a data mudar
                }}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="block-professional">Profissional *</Label>
              <Select 
                value={blockProfessional} 
                onValueChange={setBlockProfessional}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((prof) => (
                    <SelectItem key={prof} value={prof}>
                      {prof}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="block-duration">Duração (minutos) *</Label>
              <Select 
                value={blockDuration} 
                onValueChange={(value) => {
                  setBlockDuration(value);
                  setBlockTime(""); // Resetar horário quando a duração mudar
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a duração" />
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
            {blockDate && blockDuration && (
              <div className="grid gap-2">
                <Label htmlFor="block-time">Horário *</Label>
                <Select 
                  value={blockTime} 
                  onValueChange={setBlockTime}
                  key={`block-time-${blockDate}-${blockDuration}`}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => {
                      const isPast = isPastTime(blockDate, slot.display);
                      const hasConflict = checkTimeConflict(blockDate, slot.display, parseInt(blockDuration), undefined, blockProfessional || undefined);
                      const available = !isPast && !hasConflict;
                      return (
                        <SelectItem 
                          key={`${slot.display}-${blockDate}-${blockDuration}`} 
                          value={slot.display}
                          disabled={!available}
                        >
                          {slot.display} {isPast && "(Passado)"} {!isPast && hasConflict && "(Ocupado)"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="block-reason">Motivo do Bloqueio *</Label>
              <Input 
                id="block-reason" 
                placeholder="Ex: Reunião, Folga, etc."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {selectedBlock && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeleteBlockDialogOpen(true);
                }}
                className="w-full sm:w-auto bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive border-destructive/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Bloqueio
              </Button>
            )}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={() => {
                  setBlockTimeOpen(false);
                  setBlockDate("");
                  setBlockTime("");
                  setBlockDuration("");
                  setBlockReason("");
                  setBlockProfessional("");
                  setSelectedBlock(null);
                }}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleBlockTime} 
                disabled={!blockDate || !blockTime || !blockDuration || !blockReason.trim() || !blockProfessional}
                className="flex-1 sm:flex-none"
              >
                {selectedBlock ? "Salvar Alterações" : "Bloquear"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo Calendário Expandido */}
      <Dialog open={calendarExpanded} onOpenChange={setCalendarExpanded}>
        <DialogContent className="max-w-[98vw] w-[98vw] h-[98vh] max-h-[98vh] sm:max-w-[95vw] sm:w-[95vw] sm:h-[95vh] sm:max-h-[95vh] p-0 flex flex-col gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <DialogTitle className="text-xl sm:text-2xl">Calendário Expandido</DialogTitle>
                <DialogDescription className="mt-1">
                  Visualização ampliada da agenda
                </DialogDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setCalendarExpanded(false)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateDate("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium text-foreground min-w-[120px] text-center">
                  {viewMode === "week" 
                    ? `${weekDays[0]?.dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })} - ${weekDays[6]?.dateObj.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    : getCurrentMonthYear()}
                </div>
                <Button variant="outline" size="icon" onClick={() => navigateDate("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Tabs 
                  value={viewMode} 
                  onValueChange={(v: any) => {
                    setViewMode(v);
                    setSelectedDate(new Date());
                  }} 
                  className="w-auto"
                >
                  <TabsList>
                    <TabsTrigger value="day" className="text-xs sm:text-sm">Dia</TabsTrigger>
                    <TabsTrigger value="week" className="text-xs sm:text-sm">Semana</TabsTrigger>
                    <TabsTrigger value="month" className="text-xs sm:text-sm">Mês</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Button variant="outline" onClick={() => setBlockTimeOpen(true)} className="h-9 sm:h-10">
                  <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  <span className="text-xs sm:text-sm">Bloquear</span>
                </Button>
              </div>
            </div>
            
            {/* Legenda */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
              <div className="font-semibold text-xs sm:text-sm text-foreground">Legenda:</div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2" style={{ borderColor: "#10b77f", backgroundColor: "hsl(var(--primary) / 0.2)" }}></div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Consulta</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2" style={{ borderColor: "#3b82f6", backgroundColor: "hsl(var(--info) / 0.2)" }}></div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Retorno</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2" style={{ borderColor: "#9333ea", backgroundColor: "hsl(var(--purple) / 0.2)" }}></div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Primeira Consulta</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2" style={{ borderColor: "#ef4444", backgroundColor: "hsl(var(--destructive) / 0.2)" }}></div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Cirurgia</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2" style={{ borderColor: "#f59e0b", backgroundColor: "hsl(var(--warning) / 0.2)" }}></div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Exame</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="h-3 w-3 sm:h-4 sm:w-4 rounded border-2 border-blue-600 bg-blue-50"></div>
                <span className="text-[10px] sm:text-xs text-muted-foreground">Online</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <span className="text-[10px] sm:text-xs text-muted-foreground">Presencial</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                <span className="text-[10px] sm:text-xs text-muted-foreground">Bloqueado</span>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden p-6">
            {viewMode === "week" && renderWeekCalendar(true)}
            {viewMode === "day" && (
              <div className="h-full overflow-y-auto">
                {renderDayView()}
              </div>
            )}
            {viewMode === "month" && (
              <div className="h-full overflow-y-auto">
                {renderMonthView()}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo Cadastro Rápido de Paciente */}
      <Dialog open={quickRegisterOpen} onOpenChange={(open) => {
        setQuickRegisterOpen(open);
        if (!open) {
          setQuickRegisterData({ name: "", phone: "", email: "", cpf: "", healthInsurance: "Particular" });
        }
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Cadastro Rápido de Paciente</DialogTitle>
            <DialogDescription>
              Cadastre rapidamente um novo paciente para continuar com o agendamento
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quick-name">Nome Completo *</Label>
              <Input
                id="quick-name"
                placeholder="Digite o nome completo"
                value={quickRegisterData.name}
                onChange={(e) => {
                  // Permitir digitação livre, capitalizar apenas ao perder o foco
                  setQuickRegisterData({ ...quickRegisterData, name: e.target.value });
                }}
                onBlur={(e) => {
                  const capitalizedName = capitalizeName(e.target.value);
                  setQuickRegisterData({ ...quickRegisterData, name: capitalizedName });
                }}
                maxLength={100}
                className="w-full min-w-0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quick-phone">Telefone *</Label>
              <MaskedInput
                id="quick-phone"
                mask="phone"
                placeholder="(00) 00000-0000"
                value={quickRegisterData.phone}
                onChange={(value) => setQuickRegisterData({ ...quickRegisterData, phone: value })}
                maxLength={15}
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quick-email">Email *</Label>
              <Input
                id="quick-email"
                type="email"
                placeholder="email@exemplo.com"
                value={quickRegisterData.email}
                onChange={(e) => setQuickRegisterData({ ...quickRegisterData, email: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quick-cpf">CPF *</Label>
              <MaskedInput
                id="quick-cpf"
                mask="cpf"
                placeholder="000.000.000-00"
                value={quickRegisterData.cpf}
                onChange={(value) => setQuickRegisterData({ ...quickRegisterData, cpf: value })}
                maxLength={14}
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quick-healthInsurance">Plano de Saúde</Label>
              <Select
                value={quickRegisterData.healthInsurance}
                onValueChange={(value) => setQuickRegisterData({ ...quickRegisterData, healthInsurance: value })}
              >
                <SelectTrigger id="quick-healthInsurance">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Particular">Particular</SelectItem>
                  <SelectItem value="Unimed">Unimed</SelectItem>
                  <SelectItem value="Bradesco Saúde">Bradesco Saúde</SelectItem>
                  <SelectItem value="Amil">Amil</SelectItem>
                  <SelectItem value="SulAmérica">SulAmérica</SelectItem>
                  <SelectItem value="NotreDame Intermédica">NotreDame Intermédica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setQuickRegisterOpen(false);
                setQuickRegisterData({ name: "", phone: "", email: "", cpf: "", healthInsurance: "Particular" });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleQuickRegister}
              disabled={!quickRegisterData.name.trim() || !quickRegisterData.phone.trim() || !quickRegisterData.email.trim() || !quickRegisterData.cpf.trim()}
            >
              Cadastrar e Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
};

export default Agenda;
