// Serviço compartilhado para gerenciar agendamentos entre Agendamentos.tsx e AgendaProfissional.tsx

export interface Appointment {
  id: number;
  patient: string;
  professional: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: string;
  modality: "presencial" | "online";
  status: "confirmed" | "pending" | "cancelled";
  phone?: string;
  duration: number; // em minutos
  day?: number; // 0-6 (Domingo-Sábado) - calculado a partir da data
}

export interface BlockedSlot {
  day: number;
  time: string;
  duration: number;
  reason: string;
  date: string; // YYYY-MM-DD ou vazio para bloqueios recorrentes
  professional?: string; // Profissional que realizou o bloqueio
}

// Armazenamento em memória (em produção viria de uma API)
let appointments: Appointment[] = [];
let blockedSlots: BlockedSlot[] = [];

// Listeners para notificar mudanças
const appointmentListeners: Set<() => void> = new Set();
const blockedSlotListeners: Set<() => void> = new Set();

// Função auxiliar para calcular o dia da semana a partir de uma data
const getDayOfWeek = (dateStr: string): number => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.getDay(); // 0 = Domingo, 1 = Segunda, etc.
};

// Função auxiliar para converter Appointment para formato da AgendaProfissional
const convertToAgendaFormat = (apt: Appointment) => {
  return {
    id: apt.id,
    time: apt.time,
    patient: apt.patient,
    type: apt.type,
    duration: apt.duration,
    professional: apt.professional,
    modality: apt.modality,
    day: apt.day ?? getDayOfWeek(apt.date),
    status: apt.status,
  };
};

export const appointmentService = {
  // Obter todos os agendamentos
  getAllAppointments: (): Appointment[] => {
    return [...appointments];
  },

  // Obter agendamentos em formato da AgendaProfissional
  getAppointmentsForAgenda: () => {
    return appointments.map(convertToAgendaFormat);
  },

  // Obter bloqueios
  getBlockedSlots: (): BlockedSlot[] => {
    return [...blockedSlots];
  },

  // Criar agendamento
  createAppointment: (appointment: Omit<Appointment, 'id' | 'day'>): Appointment => {
    const day = getDayOfWeek(appointment.date);
    const newAppointment: Appointment = {
      ...appointment,
      id: Math.max(...appointments.map(a => a.id), 0) + 1,
      day,
    };
    appointments.push(newAppointment);
    appointmentListeners.forEach(listener => listener());
    return newAppointment;
  },

  // Atualizar agendamento
  updateAppointment: (id: number, updates: Partial<Appointment>): Appointment | null => {
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) {
      console.error("updateAppointment: agendamento não encontrado", { id });
      return null;
    }

    const oldAppointment = appointments[index];
    
    console.log("updateAppointment: atualizando", {
      id: id,
      oldDate: oldAppointment.date,
      oldTime: oldAppointment.time,
      updates: updates,
      newDate: updates.date,
      newTime: updates.time
    });

    const updated = {
      ...appointments[index],
      ...updates,
      id, // Garantir que o ID não seja alterado
    };

    // Recalcular day se date foi alterado
    if (updates.date) {
      updated.day = getDayOfWeek(updates.date);
      console.log("updateAppointment: recalculando day", {
        newDate: updates.date,
        newDay: updated.day
      });
    }

    appointments[index] = updated;
    
    console.log("updateAppointment: resultado", {
      id: updated.id,
      date: updated.date,
      time: updated.time,
      day: updated.day
    });
    
    appointmentListeners.forEach(listener => listener());
    return updated;
  },

  // Remarcar agendamento (atualiza data e horário)
  rescheduleAppointment: (id: number, newDate: string, newTime: string): Appointment | null => {
    return appointmentService.updateAppointment(id, {
      date: newDate,
      time: newTime,
    });
  },

  // Confirmar agendamento
  confirmAppointment: (id: number): Appointment | null => {
    return appointmentService.updateAppointment(id, {
      status: 'confirmed',
    });
  },

  // Cancelar agendamento
  cancelAppointment: (id: number): Appointment | null => {
    return appointmentService.updateAppointment(id, {
      status: 'cancelled',
    });
  },

  // Excluir agendamento
  deleteAppointment: (id: number): boolean => {
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) return false;
    appointments.splice(index, 1);
    appointmentListeners.forEach(listener => listener());
    return true;
  },

  // Adicionar bloqueio
  addBlockedSlot: (block: BlockedSlot): void => {
    blockedSlots.push(block);
    blockedSlotListeners.forEach(listener => listener());
  },

  // Atualizar bloqueio
  updateBlockedSlot: (oldBlock: BlockedSlot, newBlock: BlockedSlot): void => {
    const index = blockedSlots.findIndex(b => 
      b.date === oldBlock.date &&
      b.time === oldBlock.time &&
      b.reason === oldBlock.reason
    );
    if (index !== -1) {
      blockedSlots[index] = newBlock;
      blockedSlotListeners.forEach(listener => listener());
    }
  },

  // Remover bloqueio
  removeBlockedSlot: (block: BlockedSlot): void => {
    blockedSlots = blockedSlots.filter(b => {
      // Para bloqueios recorrentes (sem data específica), comparar day, time, reason e professional
      if (!block.date && !b.date) {
        return !(b.day === block.day &&
                 b.time === block.time &&
                 b.reason === block.reason &&
                 b.professional === block.professional);
      }
      // Para bloqueios com data específica, comparar date, time e reason
      return !(b.date === block.date &&
               b.time === block.time &&
               b.reason === block.reason &&
               b.professional === block.professional);
    });
    blockedSlotListeners.forEach(listener => listener());
  },

  // Verificar conflito de horário
  checkTimeConflict: (
    date: string,
    time: string,
    duration: number,
    excludeId?: number,
    professional?: string
  ): boolean => {
    const day = getDayOfWeek(date);
    const [hours, minutes] = time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;

    // Verificar conflitos com agendamentos
    const hasAppointmentConflict = appointments.some(apt => {
      if (apt.id === excludeId) return false;
      if (apt.date !== date) return false;
      // Se um profissional foi especificado, verificar apenas agendamentos desse profissional
      if (professional && apt.professional !== professional) return false;

      const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
      const aptStart = aptHours * 60 + aptMinutes;
      const aptEnd = aptStart + apt.duration;

      return (startMinutes < aptEnd && endMinutes > aptStart);
    });

    // Verificar conflitos com bloqueios
    const hasBlockConflict = blockedSlots.some(block => {
      if (block.date && block.date !== date) return false;
      if (!block.date && block.day !== day) return false;

      // Filtrar bloqueios por profissional:
      // - Se um profissional foi especificado:
      //   * Incluir bloqueios gerais da clínica (sem professional)
      //   * Incluir bloqueios específicos desse profissional (professional === professional)
      //   * Excluir bloqueios de outros profissionais
      // - Se nenhum profissional foi especificado:
      //   * Incluir apenas bloqueios gerais da clínica (sem professional)
      if (professional) {
        // Se o bloqueio tem um profissional específico e não é o profissional selecionado, ignorar
        if (block.professional && block.professional !== professional) return false;
        // Bloqueios sem professional (gerais da clínica) sempre são considerados
        // Bloqueios com professional igual ao selecionado também são considerados
      } else {
        // Se nenhum profissional foi especificado, considerar apenas bloqueios gerais da clínica
        if (block.professional) return false;
      }

      const [blockHours, blockMinutes] = block.time.split(':').map(Number);
      const blockStart = blockHours * 60 + blockMinutes;
      const blockEnd = blockStart + block.duration;

      return (startMinutes < blockEnd && endMinutes > blockStart);
    });

    return hasAppointmentConflict || hasBlockConflict;
  },

  // Verificar se data está no passado
  isPastDate: (dateStr: string): boolean => {
    // Obter data de hoje no formato YYYY-MM-DD usando timezone do Brasil
    const now = new Date();
    // Converter para timezone do Brasil (America/Sao_Paulo)
    const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const todayStr = brazilTime.getFullYear() + '-' + 
                     String(brazilTime.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(brazilTime.getDate()).padStart(2, '0');
    
    // Comparar strings diretamente (formato YYYY-MM-DD)
    return dateStr < todayStr;
  },

  // Verificar se horário está no passado
  isPastTime: (dateStr: string, timeStr: string): boolean => {
    // Obter data/hora atual no timezone do Brasil
    const now = new Date();
    const brazilNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    
    // Obter data de hoje no formato YYYY-MM-DD
    const todayStr = brazilNow.getFullYear() + '-' + 
                     String(brazilNow.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(brazilNow.getDate()).padStart(2, '0');
    
    // Se a data for passada, o horário também é passado
    if (dateStr < todayStr) {
      return true;
    }
    
    // Se for hoje, verificar se o horário já passou
    if (dateStr === todayStr) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const currentHour = brazilNow.getHours();
      const currentMinute = brazilNow.getMinutes();
      
      if (hours < currentHour) return true;
      if (hours === currentHour && minutes < currentMinute) return true;
    }
    
    return false;
  },

  // Registrar listener para mudanças em agendamentos
  onAppointmentsChange: (callback: () => void): (() => void) => {
    appointmentListeners.add(callback);
    return () => {
      appointmentListeners.delete(callback);
    };
  },

  // Registrar listener para mudanças em bloqueios
  onBlockedSlotsChange: (callback: () => void): (() => void) => {
    blockedSlotListeners.add(callback);
    return () => {
      blockedSlotListeners.delete(callback);
    };
  },

  // Inicializar com dados mock
  initialize: (initialAppointments: Appointment[], initialBlocks: BlockedSlot[] = []) => {
    appointments = initialAppointments.map(apt => ({
      ...apt,
      day: apt.day ?? getDayOfWeek(apt.date),
    }));
    blockedSlots = initialBlocks;
  },
};

// Inicializar com dados mock (usando datas dinâmicas)
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

appointmentService.initialize([
  {
    id: 1,
    patient: "Maria Silva",
    professional: "Dr. João Silva",
    date: today.toISOString().split('T')[0],
    time: "09:00",
    type: "Consulta",
    modality: "presencial",
    status: "confirmed",
    phone: "(11) 98765-4321",
    duration: 60,
  },
  {
    id: 2,
    patient: "Pedro Costa",
    professional: "Dr. João Silva",
    date: today.toISOString().split('T')[0],
    time: "10:30",
    type: "Retorno",
    modality: "online",
    status: "pending",
    phone: "(11) 91234-5678",
    duration: 30,
  },
  {
    id: 3,
    patient: "Julia Oliveira",
    professional: "Dra. Maria Costa",
    date: tomorrow.toISOString().split('T')[0],
    time: "14:00",
    type: "Primeira Consulta",
    modality: "presencial",
    status: "confirmed",
    phone: "(11) 99876-5432",
    duration: 60,
  },
  {
    id: 4,
    patient: "Roberto Alves",
    professional: "Dr. João Silva",
    date: dayAfterTomorrow.toISOString().split('T')[0],
    time: "15:30",
    type: "Consulta",
    modality: "online",
    status: "pending",
    phone: "(11) 97654-3210",
    duration: 45,
  },
  {
    id: 5,
    patient: "Fernanda Martins",
    professional: "Dr. João Silva",
    date: tomorrow.toISOString().split('T')[0],
    time: "09:30",
    type: "Retorno",
    modality: "presencial",
    status: "pending",
    phone: "(11) 96543-2109",
    duration: 30,
  },
], [
  { day: 0, time: "12:00", duration: 60, reason: "Almoço", date: "" },
  { day: 1, time: "13:00", duration: 60, reason: "Reunião", date: "" },
]);

