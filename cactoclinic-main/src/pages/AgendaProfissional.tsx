import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarCheck, Clock, User, Filter, Video, MapPin, Lock, Users, Play, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { toast } from "sonner";
import { appointmentService, BlockedSlot } from "@/lib/appointmentService";

const AgendaProfissional = () => {
  const [searchParams] = useSearchParams();
  const [selectedProfessional, setSelectedProfessional] = useState("all");
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [blockTimeOpen, setBlockTimeOpen] = useState(false);
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; hour: number } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [draggedAppointment, setDraggedAppointment] = useState<any>(null);
  const [draggedBlock, setDraggedBlock] = useState<any>(null);
  const [editAppointmentOpen, setEditAppointmentOpen] = useState(false);
  const [editBlockOpen, setEditBlockOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockedSlot | null>(null);
  const [deleteAppointmentOpen, setDeleteAppointmentOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<any>(null);
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [appointmentsList, setAppointmentsList] = useState<any[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  
  // Form state for new appointment
  const [newPatientName, setNewPatientName] = useState("");
  const [newProfessionalId, setNewProfessionalId] = useState("1");
  const [newConsultType, setNewConsultType] = useState("Consulta");
  const [newModality, setNewModality] = useState("presencial");
  const [newTime, setNewTime] = useState("");
  const [newDuration, setNewDuration] = useState("60");
  const [editSelectedDay, setEditSelectedDay] = useState<number | null>(null);
  
  // Block time form state
  const [blockProfessional, setBlockProfessional] = useState("");
  const [blockDate, setBlockDate] = useState("");
  const [blockTime, setBlockTime] = useState("");
  const [blockDuration, setBlockDuration] = useState("");
  const [blockReason, setBlockReason] = useState("");

  // Carregar agendamentos e bloqueios do serviço
  useEffect(() => {
    const loadData = () => {
      setAppointmentsList(appointmentService.getAppointmentsForAgenda());
      setBlockedSlots(appointmentService.getBlockedSlots());
    };
    
    loadData();
    
    // Escutar mudanças
    const unsubscribeAppointments = appointmentService.onAppointmentsChange(loadData);
    const unsubscribeBlocks = appointmentService.onBlockedSlotsChange(loadData);
    
    return () => {
      unsubscribeAppointments();
      unsubscribeBlocks();
    };
  }, []);
  
  const professionals = [
    { id: "all", name: "Todos os Profissionais" },
    { id: "1", name: "Dr. João Silva", color: "#10b77f" },
    { id: "2", name: "Dra. Maria Costa", color: "#3b82f6" },
    { id: "3", name: "Dr. Pedro Santos", color: "#8b5cf6" },
    { id: "4", name: "Dra. Ana Lima", color: "#f97316" },
  ];

  // Aplicar filtro automático baseado na URL
  useEffect(() => {
    const professionalParam = searchParams.get('professional');
    const nameParam = searchParams.get('name');
    
    if (professionalParam) {
      // Primeiro tentar encontrar pelo ID
      const professional = professionals.find(p => p.id === professionalParam);
      if (professional) {
        setSelectedProfessional(professionalParam);
      } else if (nameParam) {
        // Tentar encontrar pelo nome
        const decodedName = decodeURIComponent(nameParam);
        const professionalByName = professionals.find(p => {
          const professionalName = p.name.toLowerCase();
          const searchName = decodedName.toLowerCase();
          // Verificar se o nome do profissional contém partes do nome pesquisado
          // Ex: "Dr. João Santos" pode corresponder a "Dr. João Silva"
          const professionalParts = professionalName.split(' ');
          const searchParts = searchName.split(' ');
          // Verificar se há correspondência parcial (pelo menos 2 palavras em comum)
          const commonParts = professionalParts.filter(part => 
            searchParts.some(sp => part.includes(sp) || sp.includes(part))
          );
          return commonParts.length >= 2 || professionalName.includes(searchName) || searchName.includes(professionalName);
        });
        if (professionalByName) {
          setSelectedProfessional(professionalByName.id);
        } else {
          // Mapeamento direto por ID da equipe para ID da agenda
          // Dr. João Santos (id: 1) -> Dr. João Silva (id: 1)
          // Dra. Ana Lima (id: 2) -> Dra. Ana Lima (id: 4)
          // Dr. Carlos Souza (id: 3) -> Dr. Pedro Santos (id: 3)
          const idMapping: Record<string, string> = {
            "1": "1", // Dr. João Santos -> Dr. João Silva
            "2": "4", // Dra. Ana Lima -> Dra. Ana Lima
            "3": "3", // Dr. Carlos Souza -> Dr. Pedro Santos
          };
          const mappedId = idMapping[professionalParam];
          if (mappedId) {
            setSelectedProfessional(mappedId);
          }
        }
      } else {
        // Se não tiver nameParam, tentar mapear diretamente pelo ID
        const idMapping: Record<string, string> = {
          "1": "1",
          "2": "4",
          "3": "3",
        };
        const mappedId = idMapping[professionalParam];
        if (mappedId) {
          setSelectedProfessional(mappedId);
        }
      }
    }
  }, [searchParams]);

  const procedureTypes = {
    "Consulta": { color: "bg-[#d1f4e8] text-[#065f46] border-primary", borderColor: "#10b77f" },
    "Retorno": { color: "bg-[#dbeafe] text-[#1e40af] border-info", borderColor: "#3b82f6" },
    "Primeira Consulta": { color: "bg-[#ede9fe] text-[#6b21a8] border-purple-600", borderColor: "#9333ea" },
    "Cirurgia": { color: "bg-[#fee2e2] text-[#991b1b] border-destructive", borderColor: "#ef4444" },
    "Exame": { color: "bg-[#fef3c7] text-[#92400e] border-warning", borderColor: "#f59e0b" },
  };

  // Gera horários com intervalos de 15 minutos (como Google Calendar)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour <= 23; hour++) {
      for (let min = 0; min < 60; min += 15) {
        slots.push({ hour, minute: min, display: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}` });
      }
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  const hours = Array.from({ length: 24 }, (_, i) => i); // 00h às 23h - todos os horários como Google Calendar


  // Get current time in Brazil timezone
  const getCurrentTimeInMinutes = () => {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    return now.getHours() * 60 + now.getMinutes();
  };

  const isCurrentDay = (dateStr: string) => {
    const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const checkDate = new Date(dateStr + 'T00:00:00');
    return today.toDateString() === checkDate.toDateString();
  };

  // Usar funções do serviço para validações
  const isPastDate = (dateStr: string) => appointmentService.isPastDate(dateStr);
  const isPastTime = (dateStr: string, timeStr: string) => appointmentService.isPastTime(dateStr, timeStr);
  const checkTimeConflict = (day: number, time: string, duration: number, excludeId?: number, checkDate?: string) => {
    if (!checkDate) return false;
    return appointmentService.checkTimeConflict(checkDate, time, duration, excludeId);
  };

  // Gera os dias da semana baseado na data selecionada
  const getWeekDays = () => {
    const date = new Date(selectedDate);
    const currentDay = date.getDay(); // 0 = Domingo, 1 = Segunda, etc
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - currentDay);
    
    const days = [];
    const dayNames = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(sunday);
      dayDate.setDate(sunday.getDate() + i);
      days.push({
        day: dayNames[dayDate.getDay()],
        date: dayDate.getDate().toString().padStart(2, "0"),
        full: dayDate.toISOString().split('T')[0],
        dayIndex: dayDate.getDay()
      });
    }
    return days;
  };

  const getCurrentMonthYear = () => {
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    
    if (viewMode === "day") {
      return `${dayNames[selectedDate.getDay()]}, ${selectedDate.getDate()} de ${months[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
    }
    
    return `${months[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  };

  const weekDays = getWeekDays();

  const filteredAppointments = selectedProfessional === "all" 
    ? appointmentsList 
    : appointmentsList.filter(apt => apt.professional === professionals.find(p => p.id === selectedProfessional)?.name);

  // Helper function to check if a time slot has space for a new appointment
  const hasSpaceInSlot = (dayIndex: number, hour: number, dateStr?: string) => {
    const appointmentsInSlot = filteredAppointments.filter(apt => {
      const aptHour = parseInt(apt.time.split(':')[0]);
      const aptMinute = parseInt(apt.time.split(':')[1]);
      const slotStart = hour * 60; // Convert hour to minutes
      const slotEnd = (hour + 1) * 60;
      const aptStart = aptHour * 60 + aptMinute;
      const aptEnd = aptStart + apt.duration;
      
      // Check if appointment overlaps with this hour slot
      return apt.day === dayIndex && (
        (aptStart >= slotStart && aptStart < slotEnd) || 
        (aptEnd > slotStart && aptEnd <= slotEnd) ||
        (aptStart <= slotStart && aptEnd >= slotEnd)
      );
    });
    
    return appointmentsInSlot;
  };

  // Helper function to check if a time slot is blocked
  const isSlotBlocked = (dayIndex: number, hour: number, dateStr: string) => {
    return blockedSlots.some(block => {
      // Check day match
      if (block.day !== dayIndex) return false;
      
      // If block has a specific date, it must match exactly
      if (block.date && block.date !== dateStr) return false;
      
      // If block doesn't have a date but we're checking a specific date, skip it
      // (blocks without date are recurring weekly)
      if (!block.date && dateStr) {
        // For recurring blocks, check if the day of week matches
        const checkDate = new Date(dateStr + 'T00:00:00');
        if (checkDate.getDay() !== dayIndex) return false;
      }
      
      const [blockHour, blockMinute] = block.time.split(':').map(Number);
      const blockStart = blockHour * 60 + blockMinute;
      const blockEnd = blockStart + block.duration;
      const slotStart = hour * 60;
      const slotEnd = (hour + 1) * 60;
      
      // Check if block overlaps with this hour slot
      return (blockStart < slotEnd && blockEnd > slotStart);
    });
  };

  const handleDragStart = (e: React.DragEvent, appointment: any) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = "move";
    // Add data to transfer for better drag experience
    e.dataTransfer.setData("text/plain", appointment.id.toString());
  };

  const handleBlockDragStart = (e: React.DragEvent, block: any) => {
    setDraggedBlock(block);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    // Add visual feedback on drag over - Google Calendar style
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add("bg-blue-50");
      
      // Show preview line where the appointment will be dropped (like Google Calendar)
      if (draggedAppointment) {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const slotHeight = rect.height;
        
        // Remove existing preview line if any
        const existingPreview = e.currentTarget.querySelector('.drop-preview-line');
        if (existingPreview) {
          existingPreview.remove();
        }
        
        // Create preview line - Google Calendar style
        const previewLine = document.createElement('div');
        previewLine.className = 'drop-preview-line absolute left-0 right-0 z-[20] pointer-events-none';
        previewLine.style.top = `${y}px`;
        previewLine.style.height = '2px';
        previewLine.style.backgroundColor = '#1a73e8';
        previewLine.style.boxShadow = 'none';
        e.currentTarget.appendChild(previewLine);
      }
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    // Remove visual feedback on drag leave - Google Calendar style
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("bg-blue-50");
      
      // Remove preview line
      const previewLine = e.currentTarget.querySelector('.drop-preview-line');
      if (previewLine) {
        previewLine.remove();
      }
    }
  };

  const handleDrop = (e: React.DragEvent, day: number, hour: number, dateStr: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Remove visual feedback and preview line - Google Calendar style
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.remove("bg-blue-50");
      const previewLine = e.currentTarget.querySelector('.drop-preview-line');
      if (previewLine) {
        previewLine.remove();
      }
    }
    
    if (draggedAppointment) {
      // Calculate exact time based on absolute position in the calendar grid
      const slotElement = e.currentTarget as HTMLElement;
      const gridContainer = slotElement.closest('.grid.grid-cols-8') as HTMLElement;
      
      let calculatedHour = hour;
      let calculatedMinutes = 0;
      
      if (gridContainer) {
        // Find all slots for this day column, sorted by hour
        const allSlots = Array.from(gridContainer.querySelectorAll(`[data-day-index="${day}"]`)) as HTMLElement[];
        
        // Sort slots by hour attribute
        allSlots.sort((a, b) => {
          const hourA = parseInt(a.getAttribute('data-hour') || '0');
          const hourB = parseInt(b.getAttribute('data-hour') || '0');
          return hourA - hourB;
        });
        
        if (allSlots.length > 0) {
          const gridRect = gridContainer.getBoundingClientRect();
          const y = e.clientY - gridRect.top;
          
          // Find which slot contains the Y position
          let foundSlot = null;
          let slotHour = hour;
          
          for (let i = 0; i < allSlots.length; i++) {
            const slot = allSlots[i];
            const slotRect = slot.getBoundingClientRect();
            const slotTop = slotRect.top - gridRect.top;
            const slotHeight = slotRect.height;
            const slotBottom = slotTop + slotHeight;
            
            if (y >= slotTop && y <= slotBottom) {
              foundSlot = slot;
              slotHour = parseInt(slot.getAttribute('data-hour') || hour.toString());
              
              // Calculate minutes within the slot
              const relativeY = y - slotTop;
              const minutesPercent = Math.max(0, Math.min(1, relativeY / slotHeight));
              let minutes = Math.round(minutesPercent * 60);
              
              // Round to nearest 15-minute interval
              minutes = Math.round(minutes / 15) * 15;
              
              calculatedHour = slotHour;
              calculatedMinutes = minutes;
              
              // If minutes exceed 60, move to next hour
              if (minutes >= 60 && i < allSlots.length - 1) {
                const nextSlot = allSlots[i + 1];
                calculatedHour = parseInt(nextSlot.getAttribute('data-hour') || (slotHour + 1).toString());
                calculatedMinutes = 0;
              }
              
              break;
            } else if (y < slotTop && i === 0) {
              // Before first slot, use first slot
              foundSlot = slot;
              slotHour = parseInt(slot.getAttribute('data-hour') || hour.toString());
              calculatedHour = slotHour;
              calculatedMinutes = 0;
              break;
            } else if (y > slotBottom && i === allSlots.length - 1) {
              // After last slot, use last slot
              foundSlot = slot;
              slotHour = parseInt(slot.getAttribute('data-hour') || hour.toString());
              calculatedHour = slotHour;
              calculatedMinutes = 45; // Max minutes in a slot
              break;
            }
          }
        }
      }
      
      // Fallback: calculate within the current slot
      if (calculatedHour === hour && calculatedMinutes === 0 && !gridContainer) {
        const rect = slotElement.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const slotHeight = rect.height;
        
        const minutesPercent = Math.max(0, Math.min(1, y / slotHeight));
        let minutes = Math.round(minutesPercent * 60);
        minutes = Math.round(minutes / 15) * 15;
        
        calculatedHour = hour;
        calculatedMinutes = minutes;
        
        if (minutes >= 60) {
          calculatedHour = hour + 1;
          calculatedMinutes = 0;
        }
      }
      
      // Round to nearest 15-minute interval (like Google Calendar)
      calculatedMinutes = Math.round(calculatedMinutes / 15) * 15;
      if (calculatedMinutes >= 60) {
        calculatedHour += 1;
        calculatedMinutes = 0;
      }
      
      // Ensure hour is within valid range
      calculatedHour = Math.max(hours[0], Math.min(hours[hours.length - 1], calculatedHour));
      
      const newTime = `${calculatedHour.toString().padStart(2, '0')}:${calculatedMinutes.toString().padStart(2, '0')}`;
      
      // Verificar conflito antes de mover
      if (checkTimeConflict(day, newTime, draggedAppointment.duration, draggedAppointment.id, dateStr)) {
        toast.error("Já existe um agendamento ou bloqueio neste horário. Escolha outro horário.");
        setDraggedAppointment(null);
        return;
      }
      
      // Verificar se não é data passada
      if (isPastDate(dateStr)) {
        toast.error("Não é possível mover para datas passadas");
        setDraggedAppointment(null);
        return;
      }
      
      // Verificar se não é horário passado
      if (isPastTime(dateStr, newTime)) {
        toast.error("Não é possível mover para horários já passados");
        setDraggedAppointment(null);
        return;
      }
      
      // Atualizar agendamento via serviço
      const appointment = appointmentsList.find(apt => apt.id === draggedAppointment.id);
      if (appointment) {
        // Encontrar o agendamento completo no serviço
        const fullAppointment = appointmentService.getAllAppointments().find(apt => apt.id === draggedAppointment.id);
        if (fullAppointment) {
          const updated = appointmentService.rescheduleAppointment(fullAppointment.id, dateStr, newTime);
          if (updated) {
            toast.success(`Consulta de ${draggedAppointment.patient} remarcada para ${weekDays[day].day} às ${newTime}`);
          } else {
            toast.error("Erro ao remarcar agendamento");
          }
        }
      }
      setDraggedAppointment(null);
    } else if (draggedBlock) {
      // Calculate exact time based on mouse position within the slot (like Google Calendar)
      const slotElement = e.currentTarget as HTMLElement;
      const rect = slotElement.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const slotHeight = rect.height;
      
      // Calculate minutes within the hour based on position (0-60 minutes)
      const minutesPercent = Math.max(0, Math.min(1, y / slotHeight));
      let minutes = Math.round(minutesPercent * 60);
      
      // Round to nearest 15-minute interval (like Google Calendar)
      minutes = Math.round(minutes / 15) * 15;
      
      // Allow dropping at the end of the slot (60 minutes = next hour)
      let finalHour = hour;
      let finalMinutes = minutes;
      
      if (minutes >= 60) {
        finalHour = hour + 1;
        finalMinutes = 0;
      } else {
        finalMinutes = minutes;
      }
      
      const newTime = `${finalHour.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
      
      // Verificar conflito antes de mover bloqueio
      const [oldBlockHour, oldBlockMinute] = draggedBlock.time.split(':').map(Number);
      const oldBlockStart = oldBlockHour * 60 + oldBlockMinute;
      
      // Verificar se há agendamentos no novo horário
      const hasConflict = appointmentsList.some(apt => {
        if (apt.day !== day) return false;
        
        const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
        const aptStart = aptHours * 60 + aptMinutes;
        const aptEnd = aptStart + apt.duration;
        
        const [newHours, newMinutes] = newTime.split(':').map(Number);
        const newStart = newHours * 60 + newMinutes;
        const newEnd = newStart + draggedBlock.duration;
        
        return (newStart < aptEnd && newEnd > aptStart);
      });
      
      if (hasConflict) {
        toast.error("Já existe um agendamento neste horário. Escolha outro horário para o bloqueio.");
        setDraggedBlock(null);
        return;
      }
      
      // Atualizar bloqueio via serviço
      const updatedBlock: BlockedSlot = {
        ...draggedBlock,
        day,
        time: newTime,
        date: dateStr,
      };
      appointmentService.updateBlockedSlot(draggedBlock, updatedBlock);
      toast.success(`Bloqueio remarcado para ${weekDays[day].day} às ${newTime}`);
      setDraggedBlock(null);
    }
  };

  const handleBlockTime = () => {
    if (!blockProfessional || !blockDate || !blockTime || !blockDuration || !blockReason) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    // Parse the date correctly to get the day of week
    const selectedDateObj = new Date(blockDate + 'T00:00:00');
    const dayOfWeek = selectedDateObj.getDay();
    
    // Verificar conflito usando o serviço
    if (appointmentService.checkTimeConflict(blockDate, blockTime, parseInt(blockDuration))) {
      toast.error("Já existe um agendamento ou bloqueio neste horário. Escolha outro horário.");
      return;
    }
    
    // Create new block with exact date for proper matching
    const newBlock: BlockedSlot = { 
      day: dayOfWeek, 
      time: blockTime, 
      duration: parseInt(blockDuration), 
      reason: blockReason,
      date: blockDate // Store the exact date for accurate matching
    };
    
    appointmentService.addBlockedSlot(newBlock);
    
    toast.success("Horário bloqueado com sucesso!");
    setBlockTimeOpen(false);
    
    // Reset form
    setBlockProfessional("");
    setBlockDate("");
    setBlockTime("");
    setBlockDuration("");
    setBlockReason("");
  };

  const handleDeleteBlock = () => {
    if (selectedBlock) {
      appointmentService.removeBlockedSlot(selectedBlock);
      toast.success("Bloqueio removido com sucesso!");
      setEditBlockOpen(false);
      setSelectedBlock(null);
    }
  };

  const handleBlockClick = (block: any) => {
    setSelectedBlock(block);
    setBlockProfessional("1");
    setBlockDate(block.date);
    setBlockTime(block.time);
    setBlockDuration(block.duration.toString());
    setBlockReason(block.reason);
    setEditBlockOpen(true);
  };

  const handleEditBlock = () => {
    if (!selectedBlock || !blockProfessional || !blockDate || !blockTime || !blockDuration || !blockReason) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    const selectedDateObj = new Date(blockDate + 'T00:00:00');
    const dayOfWeek = selectedDateObj.getDay();
    
    // Verificar conflito usando o serviço
    if (appointmentService.checkTimeConflict(blockDate, blockTime, parseInt(blockDuration))) {
      toast.error("Já existe um agendamento ou bloqueio neste horário. Escolha outro horário.");
      return;
    }

    const updatedBlock: BlockedSlot = {
      day: dayOfWeek,
      time: blockTime,
      duration: parseInt(blockDuration),
      reason: blockReason,
      date: blockDate,
    };

    appointmentService.updateBlockedSlot(selectedBlock, updatedBlock);

    toast.success("Bloqueio atualizado com sucesso!");
    setEditBlockOpen(false);
    setSelectedBlock(null);
  };

  const handleDeleteAppointment = () => {
    if (appointmentToDelete) {
      const deleted = appointmentService.deleteAppointment(appointmentToDelete.id);
      if (deleted) {
        toast.success(`Agendamento de ${appointmentToDelete.patient} excluído com sucesso!`);
        setDeleteAppointmentOpen(false);
        setAppointmentToDelete(null);
        setEditAppointmentOpen(false);
      } else {
        toast.error("Erro ao excluir agendamento");
      }
    }
  };

  const handleStartOnlineConsultation = (appointment: any) => {
    toast.success(`Iniciando consulta online com ${appointment.patient}...`);
    // Aqui abriria a interface de vídeo chamada
  };

  const handleSlotClick = (day: number, hour: number, dateStr: string) => {
    // Check if date is in the past
    if (isPastDate(dateStr)) {
      toast.error("Não é possível agendar em datas passadas");
      return;
    }
    
    // Check if time is in the past (for today's date)
    const slotTime = `${hour.toString().padStart(2, '0')}:00`;
    if (isPastTime(dateStr, slotTime)) {
      toast.error("Não é possível agendar em horários já passados");
      return;
    }
    
    // Check if slot is blocked
    if (isSlotBlocked(day, hour, dateStr)) {
      toast.error("Este horário está bloqueado. Escolha outro horário.");
      return;
    }
    
    setSelectedSlot({ day, hour });
    setNewTime(slotTime);
    setNewPatientName("");
    setNewProfessionalId("1");
    setNewConsultType("Consulta");
    setNewModality("presencial");
    setNewDuration("60");
    setNewAppointmentOpen(true);
  };

  
  
  // Calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const handleCreateAppointment = () => {
    if (!selectedSlot || !newPatientName.trim() || !newProfessionalId || !newConsultType || !newModality || !newTime || !newDuration) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    const selectedDate = weekDays[selectedSlot.day].full;
    
    // Check if date is in the past
    if (isPastDate(selectedDate)) {
      toast.error("Não é possível agendar em datas passadas");
      return;
    }
    
    // Check if time is in the past (for today's date)
    if (isPastTime(selectedDate, newTime)) {
      toast.error("Não é possível agendar em horários já passados");
      return;
    }
    
    // Check for time conflicts
    if (checkTimeConflict(selectedSlot.day, newTime, parseInt(newDuration), undefined, selectedDate)) {
      toast.error("Já existe um agendamento ou bloqueio neste horário. Por favor, escolha outro horário.");
      return;
    }
    
    const selectedProf = professionals.find(p => p.id === newProfessionalId);
    
    const newApt = appointmentService.createAppointment({
      patient: newPatientName,
      professional: selectedProf?.name || professionals[1].name,
      date: selectedDate,
      time: newTime,
      type: newConsultType,
      modality: newModality,
      status: "pending",
      duration: parseInt(newDuration),
    });
    
    toast.success(`Agendamento criado: ${newPatientName} - ${weekDays[selectedSlot.day].day} às ${newTime}`);
    setNewAppointmentOpen(false);
    setSelectedSlot(null);
  };

  const handleEditAppointment = () => {
    if (!selectedAppointment || !newPatientName.trim() || !newProfessionalId || !newConsultType || !newModality || !newTime || !newDuration || editSelectedDay === null) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    const selectedDate = weekDays[editSelectedDay].full;
    
    // Check if date is in the past (only for new dates, allow editing past appointments)
    if (editSelectedDay !== selectedAppointment.day && isPastDate(selectedDate)) {
      toast.error("Não é possível agendar em datas passadas");
      return;
    }
    
    // Check if time is in the past (for today's date or future dates)
    if (!isPastDate(selectedDate) && isPastTime(selectedDate, newTime)) {
      toast.error("Não é possível agendar em horários já passados");
      return;
    }
    
    // Check for time conflicts (excluding the current appointment)
    if (checkTimeConflict(editSelectedDay, newTime, parseInt(newDuration), selectedAppointment.id, selectedDate)) {
      toast.error("Já existe um agendamento ou bloqueio neste horário. Por favor, escolha outro horário.");
      return;
    }
    
    const selectedProf = professionals.find(p => p.id === newProfessionalId);
    const updated = appointmentService.updateAppointment(selectedAppointment.id, {
      patient: newPatientName,
      professional: selectedProf?.name || selectedAppointment.professional,
      date: selectedDate,
      time: newTime,
      type: newConsultType,
      modality: newModality,
      duration: parseInt(newDuration),
    });
    
    if (updated) {
      toast.success(`Agendamento atualizado: ${newPatientName} - ${weekDays[editSelectedDay].day} às ${newTime}`);
      setEditAppointmentOpen(false);
      setSelectedAppointment(null);
      setEditSelectedDay(null);
    } else {
      toast.error("Erro ao atualizar agendamento");
    }
  };

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setNewPatientName(appointment.patient);
    setNewProfessionalId(professionals.find(p => p.name === appointment.professional)?.id || "1");
    setNewConsultType(appointment.type);
    setNewModality(appointment.modality);
    setNewTime(appointment.time);
    setNewDuration(appointment.duration.toString());
    setEditSelectedDay(appointment.day);
    setEditAppointmentOpen(true);
  };

  // Check if a time slot is available (not occupied by another appointment or blocked)
  const isTimeSlotAvailable = (time: string, excludeId?: number) => {
    if (!selectedSlot && !selectedAppointment) return true;
    
    // Use editSelectedDay if editing, otherwise use selectedSlot or selectedAppointment day
    const day = selectedSlot ? selectedSlot.day : (editSelectedDay !== null ? editSelectedDay : selectedAppointment?.day);
    const dateStr = selectedSlot ? weekDays[selectedSlot.day]?.full : (editSelectedDay !== null ? weekDays[editSelectedDay]?.full : weekDays[selectedAppointment?.day]?.full);
    
    // Check if date is in the past
    if (dateStr && isPastDate(dateStr)) {
      return false;
    }
    
    // Check if time is in the past (for today or future dates)
    if (dateStr && isPastTime(dateStr, time)) {
      return false;
    }
    
    // Use the selected duration, default to 60 if not set
    const duration = parseInt(newDuration) || 60;
    
    const [hours, minutes] = time.split(':').map(Number);
    const checkStart = hours * 60 + minutes;
    const checkEnd = checkStart + duration;
    
    // Check appointments
    const hasAppointmentConflict = appointmentsList.some(apt => {
      if (apt.id === excludeId) return false;
      if (apt.day !== day) return false;
      
      const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
      const aptStart = aptHours * 60 + aptMinutes;
      const aptEnd = aptStart + apt.duration;
      
      // Check if there's any overlap
      return (checkStart < aptEnd && checkEnd > aptStart);
    });
    
    if (hasAppointmentConflict) return false;
    
    // Check blocked slots
    const hasBlockConflict = blockedSlots.some(block => {
      // If block has a specific date, it must match exactly
      if (dateStr && block.date && block.date !== dateStr) return false;
      
      // If block doesn't have a date, check if day of week matches
      if (!block.date && block.day !== day) return false;
      
      // If we're checking a specific date and block has no date, verify day of week matches
      if (dateStr && !block.date) {
        const checkDateObj = new Date(dateStr + 'T00:00:00');
        if (checkDateObj.getDay() !== block.day) return false;
      }
      
      const [blockHours, blockMinutes] = block.time.split(':').map(Number);
      const blockStart = blockHours * 60 + blockMinutes;
      const blockEnd = blockStart + block.duration;
      
      // Check if there's any overlap - the appointment must not overlap with the block at all
      // Two time ranges overlap if: start1 < end2 && end1 > start2
      // This means the appointment overlaps if it starts before the block ends AND ends after the block starts
      const overlaps = checkStart < blockEnd && checkEnd > blockStart;
      
      return overlaps;
    });
    
    return !hasBlockConflict;
  };

  // Função para renderizar o calendário da semana (reutilizável)
  const renderWeekCalendar = (isExpanded: boolean = false) => {
    const containerHeight = isExpanded 
      ? 'h-full' 
      : 'h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] md:h-[calc(100vh-220px)] lg:h-[calc(100vh-240px)]';
    
    return (
      <div className={`relative bg-white ${containerHeight} overflow-hidden`}>
        <div className="h-full overflow-y-auto scrollbar-hide-x">
          <div className="w-full min-w-[280px] xs:min-w-[360px] sm:min-w-[480px] md:min-w-[640px] lg:min-w-[800px] xl:min-w-[1000px] 2xl:min-w-[1200px] grid grid-cols-8 relative">
          {/* Header - Horário */}
          <div className="sticky left-0 top-0 z-50 bg-white border-r border-b border-gray-200 p-1.5 sm:p-2 md:p-3 flex items-center justify-center">
            <div className="text-[10px] sm:text-xs md:text-sm font-normal text-gray-500 uppercase tracking-wide">Horário</div>
          </div>
          
          {/* Header - Dias */}
          {weekDays.map((day) => {
            const isToday = isCurrentDay(day.full);
            return (
              <div key={day.date} className={`sticky top-0 z-40 border-r border-b border-gray-200 p-1.5 sm:p-2 md:p-3 text-center bg-white ${isToday ? 'bg-primary/10' : ''}`}>
                <div className="text-[10px] sm:text-xs md:text-sm font-normal text-gray-500 uppercase tracking-wide mb-0.5 sm:mb-1 md:mb-2">{day.day}</div>
                {isToday ? (
                  <div className="text-white bg-primary rounded-full w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center mx-auto text-xs sm:text-sm md:text-base font-medium">
                    {day.date}
                  </div>
                ) : (
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-normal text-gray-900">
                    {day.date}
                  </div>
                )}
              </div>
            );
          })}

          {/* Grid de Horários */}
          {hours.map((hour) => (
            <>
              <div className="sticky left-0 z-30 bg-white border-r border-gray-200 p-1.5 sm:p-2 md:p-3 flex items-center justify-center">
                <span className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-normal">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
              
              {weekDays.map((day, dayIndex) => {
                const appointmentsInSlot = hasSpaceInSlot(day.dayIndex, hour, day.full);
                const dateIsPast = isPastDate(day.full);
                const isToday = isCurrentDay(day.full);
                const currentTimeMinutes = getCurrentTimeInMinutes();
                const slotTime = `${hour.toString().padStart(2, '0')}:00`;
                const timeIsPast = isPastTime(day.full, slotTime);
                const isPast = dateIsPast || timeIsPast;
                const showCurrentTimeLine = isToday && hour * 60 <= currentTimeMinutes && currentTimeMinutes < (hour + 1) * 60;
                const slotIsBlocked = isSlotBlocked(day.dayIndex, hour, day.full);
                
                const blockedSlotsInHour = blockedSlots.filter(slot => {
                  if (slot.date && slot.date !== day.full) return false;
                  if (!slot.date && slot.day !== day.dayIndex) return false;
                  
                  const [blockHour, blockMinute] = slot.time.split(':').map(Number);
                  const blockStart = blockHour * 60 + blockMinute;
                  const blockEnd = blockStart + slot.duration;
                  const slotStart = hour * 60;
                  const slotEnd = (hour + 1) * 60;
                  
                  return (blockStart < slotEnd && blockEnd > slotStart);
                });
                
                const totalItems = appointmentsInSlot.length + blockedSlotsInHour.length;
                const minSlotHeight = Math.max(64, totalItems * 70 + (totalItems > 0 ? 20 : 0));
                
                return (
                  <div
                    key={`${day.date}-${hour}`}
                    data-day-index={day.dayIndex}
                    data-hour={hour}
                    className={`relative border-r border-t border-gray-100 transition-colors flex flex-col p-1 sm:p-1.5 ${isPast ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:bg-gray-50 cursor-pointer'}`}
                    style={{ minHeight: `${minSlotHeight}px` }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => {
                      handleDragLeave(e);
                      handleDrop(e, day.dayIndex, hour, day.full);
                    }}
                    onClick={() => !isPast && handleSlotClick(day.dayIndex, hour, day.full)}
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
                    
                    {blockedSlotsInHour.map((blockedSlot) => {
                      const [blockHour, blockMinute] = blockedSlot.time.split(':').map(Number);
                      const blockStartMinutes = blockHour * 60 + blockMinute;
                      const blockEndMinutes = blockStartMinutes + blockedSlot.duration;
                      const endTime = calculateEndTime(blockedSlot.time, blockedSlot.duration);
                      
                      if (blockHour === hour) {
                        const hoursSpanned = Math.ceil(blockedSlot.duration / 60);
                        let totalHeight = 0;
                        
                        for (let h = 0; h < hoursSpanned; h++) {
                          const currentHourSlot = hour + h;
                          const slotStartMinutes = currentHourSlot * 60;
                          const slotEndMinutes = (currentHourSlot + 1) * 60;
                          const overlapStart = Math.max(blockStartMinutes, slotStartMinutes);
                          const overlapEnd = Math.min(blockEndMinutes, slotEndMinutes);
                          const overlapDuration = overlapEnd - overlapStart;
                          
                          if (overlapDuration > 0) {
                            const slotHeightPercent = (overlapDuration / 60) * 100;
                            totalHeight += (slotHeightPercent / 100) * minSlotHeight;
                          }
                        }
                        
                        if (totalHeight === 0) {
                          totalHeight = (blockedSlot.duration / 60) * minSlotHeight;
                        }
                        
                        return (
                          <div
                            key={`block-${isExpanded ? 'expanded-' : ''}${blockedSlot.date}-${blockedSlot.time}-${blockedSlot.reason}`}
                            className="absolute left-2 right-2 rounded-lg cursor-grab active:cursor-grabbing hover:shadow-lg hover:scale-[1.02] transition-all z-[5] overflow-hidden border border-gray-300/20"
                            draggable
                            style={{
                              top: `${(blockMinute / 60) * 100}%`,
                              height: `${totalHeight}px`,
                              minHeight: '50px',
                              background: 'linear-gradient(135deg, #4b5563 0%, #6b7280 100%)',
                              borderLeft: '4px solid #1f2937',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.05) inset'
                            }}
                            onDragStart={(e) => {
                              e.stopPropagation();
                              handleBlockDragStart(e, blockedSlot);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBlockClick(blockedSlot);
                            }}
                          >
                            <div className="flex items-start gap-1.5 sm:gap-2 h-full px-2 sm:px-2.5 py-1.5 sm:py-2 overflow-hidden">
                              <div className="flex-shrink-0 mt-0.5">
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/10 flex items-center justify-center backdrop-blur-sm">
                                  <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-start gap-0.5 sm:gap-1 overflow-hidden">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="text-[10px] sm:text-xs font-bold text-white leading-tight whitespace-nowrap">
                                    {blockedSlot.time} - {endTime}
                                  </span>
                                  <span className="text-[9px] sm:text-[10px] font-semibold text-white/80 bg-white/10 px-1 sm:px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                    {blockedSlot.duration} min
                                  </span>
                                </div>
                                <div className="text-[10px] sm:text-xs font-semibold text-white leading-tight break-words overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', maxHeight: '2.4em' }}>{blockedSlot.reason}</div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                    
                    <div className="flex-1 relative">
                    {appointmentsInSlot.length > 0 ? (
                      <>
                        {appointmentsInSlot.map((appointment) => {
                          const style = procedureTypes[appointment.type as keyof typeof procedureTypes];
                          const [aptHour, aptMinute] = appointment.time.split(':').map(Number);
                          const aptStartMinutes = aptHour * 60 + aptMinute;
                          const aptEndMinutes = aptStartMinutes + appointment.duration;
                          const endTime = calculateEndTime(appointment.time, appointment.duration);
                          
                          if (aptHour !== hour) return null;
                          
                          const hoursSpanned = Math.ceil(appointment.duration / 60);
                          let totalHeight = 0;
                          
                          for (let h = 0; h < hoursSpanned; h++) {
                            const currentHourSlot = hour + h;
                            const slotStartMinutes = currentHourSlot * 60;
                            const slotEndMinutes = (currentHourSlot + 1) * 60;
                            const overlapStart = Math.max(aptStartMinutes, slotStartMinutes);
                            const overlapEnd = Math.min(aptEndMinutes, slotEndMinutes);
                            const overlapDuration = overlapEnd - overlapStart;
                            
                            if (overlapDuration > 0) {
                              const slotHeightPercent = (overlapDuration / 60) * 100;
                              totalHeight += (slotHeightPercent / 100) * minSlotHeight;
                            }
                          }
                          
                          if (totalHeight === 0) {
                            totalHeight = (appointment.duration / 60) * minSlotHeight;
                          }
                          totalHeight = Math.max(totalHeight, 75);
                        
                          return (
                            <div
                              key={`${isExpanded ? 'expanded-' : ''}${appointment.id}`}
                              className={`absolute left-2 right-2 cursor-grab active:cursor-grabbing z-[10] transition-all ${
                                draggedAppointment?.id === appointment.id ? 'opacity-50 scale-95' : 'opacity-100'
                              }`}
                              draggable
                              style={{
                                top: `${(aptMinute / 60) * 100}%`,
                                height: `${totalHeight}px`,
                                minHeight: '60px'
                              }}
                              onDragStart={(e) => {
                                e.stopPropagation();
                                handleDragStart(e, appointment);
                              }}
                              onDragEnd={() => {
                                setDraggedAppointment(null);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAppointmentClick(appointment);
                              }}
                            >
                              <div 
                                className="h-full px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all flex flex-col justify-start overflow-hidden relative border border-gray-200/50"
                                style={{ 
                                  background: style.borderColor === "#10b77f" ? "linear-gradient(135deg, #d1f4e8 0%, #ecfdf5 100%)" : 
                                             style.borderColor === "#3b82f6" ? "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)" :
                                             style.borderColor === "#9333ea" ? "linear-gradient(135deg, #ede9fe 0%, #faf5ff 100%)" :
                                             style.borderColor === "#ef4444" ? "linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)" :
                                             "linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)",
                                  borderLeft: `4px solid ${style.borderColor}`,
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                }}
                              >
                                <div className="w-full min-w-0 flex flex-col gap-1 overflow-hidden">
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span className="text-[10px] sm:text-xs font-semibold text-gray-700 leading-tight whitespace-nowrap">
                                      {appointment.time}
                                    </span>
                                    <span className="text-[10px] sm:text-xs text-gray-500">-</span>
                                    <span className="text-[10px] sm:text-xs font-semibold text-gray-700 leading-tight whitespace-nowrap">
                                      {endTime}
                                    </span>
                                    {appointment.modality === "online" ? (
                                      <Video className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0 text-blue-600" />
                                    ) : (
                                      <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0 text-green-600" />
                                    )}
                                  </div>
                                  <div className="text-[11px] sm:text-xs font-semibold text-gray-900 leading-tight break-words overflow-hidden truncate">{appointment.patient}</div>
                                  <div className="text-[9px] sm:text-[10px] font-medium text-gray-600 leading-tight flex items-start gap-1">
                                    <User className="h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0 mt-0.5" />
                                    <span className="break-words flex-1 overflow-hidden truncate">{appointment.professional}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : null}
                    </div>
                    
                    {!slotIsBlocked && blockedSlotsInHour.length === 0 && !isPast && (
                      <div 
                        className="text-xs sm:text-sm text-gray-400 hover:text-gray-600 transition-colors mt-auto pt-2 px-2 cursor-pointer opacity-60 hover:opacity-100 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSlotClick(day.dayIndex, hour, day.full);
                        }}
                      >
                        + Novo agendamento
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-2 sm:gap-3">
          <CalendarCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0 mt-1" />
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Agenda Profissional</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Visualize e gerencie sua agenda pessoal
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Filtrar por profissional" />
            </SelectTrigger>
            <SelectContent>
              {professionals.map((prof) => (
                <SelectItem key={prof.id} value={prof.id}>
                  {prof.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Consultas Hoje
              <Clock className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{filteredAppointments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Agendadas para hoje</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Próxima Consulta
              <CalendarCheck className="h-4 w-4 text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">09:00</div>
            <p className="text-xs text-muted-foreground mt-1">Em 15 minutos</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-info">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Horários Livres
              <Clock className="h-4 w-4 text-info" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">6</div>
            <p className="text-xs text-muted-foreground mt-1">Disponíveis hoje</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Taxa de Ocupação
              <User className="h-4 w-4 text-warning" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">67%</div>
            <p className="text-xs text-muted-foreground mt-1">Da agenda total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    if (viewMode === "month") {
                      newDate.setMonth(newDate.getMonth() - 1);
                    } else if (viewMode === "week") {
                      newDate.setDate(newDate.getDate() - 7);
                    } else {
                      newDate.setDate(newDate.getDate() - 1);
                    }
                    setSelectedDate(newDate);
                  }}
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <CardTitle className="min-w-[120px] sm:min-w-[200px] text-center text-sm sm:text-base lg:text-lg">{getCurrentMonthYear()}</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    if (viewMode === "month") {
                      newDate.setMonth(newDate.getMonth() + 1);
                    } else if (viewMode === "week") {
                      newDate.setDate(newDate.getDate() + 7);
                    } else {
                      newDate.setDate(newDate.getDate() + 1);
                    }
                    setSelectedDate(newDate);
                  }}
                >
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
              <Tabs 
                value={viewMode} 
                onValueChange={(v: any) => {
                  setViewMode(v);
                  setSelectedDate(new Date());
                }} 
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-3 h-9 sm:h-10">
                  <TabsTrigger value="day" className="text-xs sm:text-sm">Dia</TabsTrigger>
                  <TabsTrigger value="week" className="text-xs sm:text-sm">Semana</TabsTrigger>
                  <TabsTrigger value="month" className="text-xs sm:text-sm">Mês</TabsTrigger>
                </TabsList>
              </Tabs>

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

          <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4">
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
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2" style={{ borderColor: "#9333ea", backgroundColor: "rgb(243 232 255)" }}></div>
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
            <div className="h-3 sm:h-4 w-px bg-border mx-0.5 sm:mx-1"></div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Video className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Online</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-info" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Presencial</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Bloqueado</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {viewMode === "week" && renderWeekCalendar(false)}

          {viewMode === "day" && (
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="space-y-2 sm:space-y-3">
                {hours.map((hour) => {
                  const dayIndex = selectedDate.getDay();
                  const dayFull = selectedDate.toISOString().split('T')[0];
                  const appointmentsInSlot = filteredAppointments
                    .filter(apt => {
                      const aptHour = parseInt(apt.time.split(':')[0]);
                      const aptMinute = parseInt(apt.time.split(':')[1]);
                      const slotStart = hour * 60;
                      const slotEnd = (hour + 1) * 60;
                      const aptStart = aptHour * 60 + aptMinute;
                      
                      // Mostrar apenas agendamentos que começam neste slot para evitar duplicação
                      return apt.day === dayIndex && aptStart >= slotStart && aptStart < slotEnd;
                    })
                    .sort((a, b) => {
                      // Ordenar por horário de início
                      const aTime = a.time.split(':').map(Number);
                      const bTime = b.time.split(':').map(Number);
                      const aMinutes = aTime[0] * 60 + aTime[1];
                      const bMinutes = bTime[0] * 60 + bTime[1];
                      return aMinutes - bMinutes;
                    });
                  
                  const minSlotHeight = Math.max(
                    80,
                    appointmentsInSlot.length * 85 + (appointmentsInSlot.length > 0 ? 30 : 0)
                  );
                  
                  const dateIsPast = isPastDate(dayFull);
                  const slotTime = `${hour.toString().padStart(2, '0')}:00`;
                  const timeIsPast = isPastTime(dayFull, slotTime);
                  const isPast = dateIsPast || timeIsPast;
                  
                  return (
                    <div key={hour} className="flex gap-2 sm:gap-4 items-start">
                      <div className="w-12 sm:w-16 lg:w-20 text-xs sm:text-sm text-muted-foreground font-medium pt-2 flex-shrink-0">
                        {hour.toString().padStart(2, "0")}:00
                      </div>
                      <div 
                        className={`flex-1 border rounded-lg p-2 sm:p-3 space-y-2 ${isPast ? 'bg-muted/50 cursor-not-allowed' : 'hover:bg-muted/30 cursor-pointer'}`}
                        style={{ minHeight: `${minSlotHeight}px` }}
                        onClick={() => !isPast && handleSlotClick(dayIndex, hour, dayFull)}
                      >
                        {appointmentsInSlot.length > 0 ? (
                          <>
                            {appointmentsInSlot.map((appointment) => {
                              const style = procedureTypes[appointment.type as keyof typeof procedureTypes];
                              const endTime = calculateEndTime(appointment.time, appointment.duration);
                              return (
                                <div 
                                  key={appointment.id}
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
                                    handleAppointmentClick(appointment);
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
                                         {appointment.modality === "online" ? (
                                           <Video className="h-3.5 w-3.5 flex-shrink-0 text-blue-600" />
                                         ) : (
                                           <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-green-600" />
                                         )}
                                       </div>
                                       <div className="text-sm font-semibold text-gray-900 break-words min-h-[18px]">{appointment.patient}</div>
                                       <div className="text-xs font-medium text-gray-600 flex items-start gap-1 min-h-[16px]">
                                         <User className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                         <span className="break-words flex-1">{appointment.professional}</span>
                                       </div>
                                     </div>
                                   </div>
                                </div>
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
                          !isPast && (
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
          )}

          {viewMode === "month" && (() => {
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const firstDayOfWeek = firstDay.getDay();
            const daysInMonth = lastDay.getDate();
            const days = [];
            
            // Add empty cells for days before the first day of the month
            for (let i = 0; i < firstDayOfWeek; i++) {
              days.push(null);
            }
            
            // Add all days of the month
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(year, month, day);
              const dateStr = date.toISOString().split('T')[0];
              const dayOfWeek = date.getDay();
              
              // Filter appointments that match this day of week
              const dayAppointments = filteredAppointments.filter(apt => {
                return apt.day === dayOfWeek;
              });
              
              days.push({
                day,
                dateStr,
                appointments: dayAppointments,
                isToday: isCurrentDay(dateStr)
              });
            }
            
            // Fill remaining cells to complete the grid (6 weeks = 42 cells)
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
                  
                  return (
                    <div
                      key={i}
                        className={`border rounded-lg p-1 sm:p-2 min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] hover:bg-muted/30 cursor-pointer transition-colors ${
                        isToday ? 'bg-primary/10 border-primary' : ''
                        }`}
                      onClick={() => {
                          const newDate = new Date(year, month, day);
                          setSelectedDate(newDate);
                          setViewMode("day");
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
                            {appointments.map((apt, idx) => {
                              const style = procedureTypes[apt.type as keyof typeof procedureTypes];
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
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Expanded Calendar Dialog */}
      <Dialog open={calendarExpanded} onOpenChange={setCalendarExpanded}>
        <DialogContent className="max-w-[98vw] w-[98vw] h-[98vh] max-h-[98vh] sm:max-w-[95vw] sm:w-[95vw] sm:h-[95vh] sm:max-h-[95vh] p-0 flex flex-col gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl sm:text-2xl">Calendário Expandido</DialogTitle>
                <DialogDescription className="mt-1">
                  Visualização ampliada da agenda profissional
                </DialogDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setCalendarExpanded(false)}
                className="h-9 w-9"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Navigation and Tabs */}
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9"
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      if (viewMode === "month") {
                        newDate.setMonth(newDate.getMonth() - 1);
                      } else if (viewMode === "week") {
                        newDate.setDate(newDate.getDate() - 7);
                      } else {
                        newDate.setDate(newDate.getDate() - 1);
                      }
                      setSelectedDate(newDate);
                    }}
                  >
                    <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <CardTitle className="min-w-[120px] sm:min-w-[200px] text-center text-sm sm:text-base lg:text-lg">{getCurrentMonthYear()}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9"
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      if (viewMode === "month") {
                        newDate.setMonth(newDate.getMonth() + 1);
                      } else if (viewMode === "week") {
                        newDate.setDate(newDate.getDate() + 7);
                      } else {
                        newDate.setDate(newDate.getDate() + 1);
                      }
                      setSelectedDate(newDate);
                    }}
                  >
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
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
                    <TabsList className="grid grid-cols-3 h-9 sm:h-10">
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
              
              {/* Legend */}
              <div className="flex flex-wrap gap-2 sm:gap-3">
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
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border-2" style={{ borderColor: "#9333ea", backgroundColor: "rgb(243 232 255)" }}></div>
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
                <div className="h-3 sm:h-4 w-px bg-border mx-0.5 sm:mx-1"></div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Video className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Online</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-info" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Presencial</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">Bloqueado</span>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden p-6">
            {viewMode === "week" && renderWeekCalendar(true)}
            {viewMode === "day" && (
              <div className="h-full overflow-y-auto">
                <div className="space-y-2 sm:space-y-3">
                  {hours.map((hour) => {
                    const dayIndex = selectedDate.getDay();
                    const dayFull = selectedDate.toISOString().split('T')[0];
                    const appointmentsInSlot = filteredAppointments
                      .filter(apt => {
                        const aptHour = parseInt(apt.time.split(':')[0]);
                        const aptMinute = parseInt(apt.time.split(':')[1]);
                        const slotStart = hour * 60;
                        const slotEnd = (hour + 1) * 60;
                        const aptStart = aptHour * 60 + aptMinute;
                        
                        return apt.day === dayIndex && aptStart >= slotStart && aptStart < slotEnd;
                      })
                      .sort((a, b) => {
                        const aTime = a.time.split(':').map(Number);
                        const bTime = b.time.split(':').map(Number);
                        const aMinutes = aTime[0] * 60 + aTime[1];
                        const bMinutes = bTime[0] * 60 + bTime[1];
                        return aMinutes - bMinutes;
                      });
                    
                    const minSlotHeight = Math.max(
                      80,
                      appointmentsInSlot.length * 85 + (appointmentsInSlot.length > 0 ? 30 : 0)
                    );
                    
                    const dateIsPast = isPastDate(dayFull);
                    const slotTime = `${hour.toString().padStart(2, '0')}:00`;
                    const timeIsPast = isPastTime(dayFull, slotTime);
                    const isPast = dateIsPast || timeIsPast;
                    
                    return (
                      <div key={hour} className="flex gap-2 sm:gap-4 items-start">
                        <div className="w-12 sm:w-16 lg:w-20 text-xs sm:text-sm text-muted-foreground font-medium pt-2 flex-shrink-0">
                          {hour.toString().padStart(2, "0")}:00
                        </div>
                        <div 
                          className={`flex-1 border rounded-lg p-2 sm:p-3 space-y-2 ${isPast ? 'bg-muted/50 cursor-not-allowed' : 'hover:bg-muted/30 cursor-pointer'}`}
                          style={{ minHeight: `${minSlotHeight}px` }}
                          onClick={() => !isPast && handleSlotClick(dayIndex, hour, dayFull)}
                        >
                          {appointmentsInSlot.length > 0 ? (
                            <>
                              {appointmentsInSlot.map((appointment) => {
                                const style = procedureTypes[appointment.type as keyof typeof procedureTypes];
                                const endTime = calculateEndTime(appointment.time, appointment.duration);
                                return (
                                  <div 
                                    key={appointment.id}
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
                                      handleAppointmentClick(appointment);
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
                                           {appointment.modality === "online" ? (
                                             <Video className="h-3.5 w-3.5 flex-shrink-0 text-blue-600" />
                                           ) : (
                                             <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-green-600" />
                                           )}
                                         </div>
                                         <div className="text-sm font-semibold text-gray-900 break-words min-h-[18px]">{appointment.patient}</div>
                                         <div className="text-xs font-medium text-gray-600 flex items-start gap-1 min-h-[16px]">
                                           <User className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                           <span className="break-words flex-1">{appointment.professional}</span>
                                         </div>
                                       </div>
                                     </div>
                                  </div>
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
                            !isPast && (
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
            )}
            {viewMode === "month" && (() => {
              const year = selectedDate.getFullYear();
              const month = selectedDate.getMonth();
              const firstDay = new Date(year, month, 1);
              const lastDay = new Date(year, month + 1, 0);
              const firstDayOfWeek = firstDay.getDay();
              const daysInMonth = lastDay.getDate();
              const days = [];
              
              for (let i = 0; i < firstDayOfWeek; i++) {
                days.push(null);
              }
              
              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateStr = date.toISOString().split('T')[0];
                const dayOfWeek = date.getDay();
                
                const dayAppointments = filteredAppointments.filter(apt => {
                  return apt.day === dayOfWeek;
                });
                
                days.push({
                  day,
                  dateStr,
                  appointments: dayAppointments,
                  isToday: isCurrentDay(dateStr)
                });
              }
              
              while (days.length < 42) {
                days.push(null);
              }
              
              return (
                <div className="h-full overflow-y-auto">
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
                              key={`empty-${i}`}
                              className="min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] border border-gray-100 rounded-lg bg-gray-50/50"
                            />
                          );
                        }
                        
                        const appointmentCount = dayData.appointments.length;
                        const appointmentBars = dayData.appointments.slice(0, 3);
                        
                        return (
                          <div
                            key={dayData.dateStr}
                            className={`min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] border rounded-lg p-1 sm:p-2 flex flex-col ${
                              dayData.isToday 
                                ? 'bg-primary/10 border-primary' 
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs sm:text-sm font-medium ${
                                dayData.isToday ? 'text-primary font-bold' : 'text-gray-700'
                              }`}>
                                {dayData.day}
                              </span>
                              {appointmentCount > 0 && (
                                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold">
                                  {appointmentCount}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 flex flex-col gap-0.5 sm:gap-1">
                              {appointmentBars.map((appointment, idx) => {
                                const style = procedureTypes[appointment.type as keyof typeof procedureTypes];
                                return (
                                  <div
                                    key={`${appointment.id}-${idx}`}
                                    className="h-1.5 sm:h-2 rounded"
                                    style={{
                                      backgroundColor: style.borderColor
                                    }}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Block Time Dialog */}
      <Dialog open={blockTimeOpen} onOpenChange={setBlockTimeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear Horário</DialogTitle>
            <DialogDescription>
              Defina um período para bloquear na agenda
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Profissional *</Label>
              <Select value={blockProfessional} onValueChange={setBlockProfessional}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.filter(p => p.id !== "all").map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Data *</Label>
                <Input 
                  type="date" 
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Hora Início *</Label>
                <Select value={blockTime} onValueChange={setBlockTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.display} value={slot.display}>
                        {slot.display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Duração (minutos) *</Label>
              <Input 
                type="number" 
                placeholder="60" 
                value={blockDuration}
                onChange={(e) => setBlockDuration(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Motivo *</Label>
              <Input 
                placeholder="Ex: Almoço, Reunião, etc." 
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockTimeOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleBlockTime}>Bloquear Horário</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Appointment Dialog */}
      <Dialog open={newAppointmentOpen} onOpenChange={setNewAppointmentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>
              Criar novo agendamento para {selectedSlot && `${weekDays[selectedSlot.day].day} às ${selectedSlot.hour}:00`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-patient">Paciente *</Label>
              <Input 
                id="new-patient" 
                placeholder="Nome do paciente" 
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-professional">Profissional *</Label>
              <Select value={newProfessionalId} onValueChange={setNewProfessionalId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.slice(1).map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-type">Tipo de Consulta *</Label>
              <Select value={newConsultType} onValueChange={setNewConsultType} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(procedureTypes).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-modality">Modalidade *</Label>
              <Select value={newModality} onValueChange={setNewModality} required>
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
              <Select value={newDuration} onValueChange={setNewDuration} required>
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
              <Label htmlFor="new-time">Horário *</Label>
              <Select value={newTime} onValueChange={setNewTime} required key={`time-select-${newDuration}`}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => {
                    // Recalculate availability when duration changes
                    const available = isTimeSlotAvailable(slot.display);
                    return (
                      <SelectItem 
                        key={`${slot.display}-${newDuration}`} 
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
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewAppointmentOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAppointment}>Criar Agendamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Appointment Dialog */}
      <Dialog open={editAppointmentOpen} onOpenChange={(open) => {
        setEditAppointmentOpen(open);
        if (!open) {
          setEditSelectedDay(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Agendamento</DialogTitle>
            <DialogDescription>
              Editar agendamento de {selectedAppointment?.patient}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-patient">Paciente *</Label>
              <Input 
                id="edit-patient" 
                placeholder="Nome do paciente" 
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-professional">Profissional *</Label>
              <Select value={newProfessionalId} onValueChange={setNewProfessionalId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.slice(1).map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-type">Tipo de Consulta *</Label>
              <Select value={newConsultType} onValueChange={setNewConsultType} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(procedureTypes).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-modality">Modalidade *</Label>
              <Select value={newModality} onValueChange={setNewModality} required>
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
              <Label htmlFor="edit-day">Dia da Semana *</Label>
              <Select 
                value={editSelectedDay !== null ? editSelectedDay.toString() : ""} 
                onValueChange={(value) => setEditSelectedDay(parseInt(value))} 
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o dia" />
                </SelectTrigger>
                <SelectContent>
                  {weekDays.map((day, index) => {
                    const isPast = isPastDate(day.full);
                    // Allow keeping the current day if it's past, but disable other past days
                    const isDisabled = isPast && (editSelectedDay === null || editSelectedDay !== index);
                    const isCurrentDay = selectedAppointment && selectedAppointment.day === index;
                    return (
                      <SelectItem 
                        key={index} 
                        value={index.toString()}
                        disabled={isDisabled}
                      >
                        {day.day} - {day.date}/{new Date(day.full).getMonth() + 1} {isPast && isCurrentDay ? "(Data atual)" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-duration">Duração (minutos) *</Label>
              <Select value={newDuration} onValueChange={setNewDuration} required>
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
              <Label htmlFor="edit-time">Horário *</Label>
              <Select value={newTime} onValueChange={setNewTime} required key={`edit-time-select-${editSelectedDay}-${newDuration}`}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => {
                    const available = isTimeSlotAvailable(slot.display, selectedAppointment?.id);
                    return (
                      <SelectItem 
                        key={`${slot.display}-${editSelectedDay}-${newDuration}`} 
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
          </div>
          
          <DialogFooter>
            <Button 
              variant="destructive" 
              onClick={() => {
                setAppointmentToDelete(selectedAppointment);
                setDeleteAppointmentOpen(true);
              }}
            >
              Excluir
            </Button>
            <Button variant="outline" onClick={() => {
              setEditAppointmentOpen(false);
              setEditSelectedDay(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleEditAppointment}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Block Dialog */}
      <Dialog open={editBlockOpen} onOpenChange={setEditBlockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Bloqueio</DialogTitle>
            <DialogDescription>
              Editar bloqueio de horário
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Profissional *</Label>
              <Select value={blockProfessional} onValueChange={setBlockProfessional}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.filter(p => p.id !== "all").map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Data *</Label>
                <Input 
                  type="date" 
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Hora Início *</Label>
                <Select value={blockTime} onValueChange={setBlockTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.display} value={slot.display}>
                        {slot.display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Duração (minutos) *</Label>
              <Input 
                type="number" 
                placeholder="60" 
                value={blockDuration}
                onChange={(e) => setBlockDuration(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Motivo *</Label>
              <Input 
                placeholder="Ex: Almoço, Reunião, etc." 
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="destructive" 
              onClick={handleDeleteBlock}
            >
              Excluir Bloqueio
            </Button>
            <Button variant="outline" onClick={() => setEditBlockOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditBlock}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Appointment Confirmation Dialog */}
      <AlertDialog open={deleteAppointmentOpen} onOpenChange={setDeleteAppointmentOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o agendamento de {appointmentToDelete?.patient}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAppointment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AgendaProfissional;

