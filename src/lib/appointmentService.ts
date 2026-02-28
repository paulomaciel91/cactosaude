import { supabase } from './supabase';

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
  clinic_id?: string;
}

export interface BlockedSlot {
  id?: number;
  day: number;
  time: string;
  duration: number;
  reason: string;
  date: string; // YYYY-MM-DD ou vazio para bloqueios recorrentes
  professional?: string; // Profissional que realizou o bloqueio
  professional_name?: string;
  clinic_id?: string;
}

// Armazenamento em memória (cache e fallback)
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
  // Obter todos os agendamentos (do cache)
  getAllAppointments: (): Appointment[] => {
    return [...appointments];
  },

  // Obter agendamentos direto do Supabase
  fetchAppointments: async (clinicId: string): Promise<Appointment[]> => {
    if (!clinicId || clinicId === '00000000-0000-0000-0000-000000000000') {
      console.warn('fetchAppointments: clinicId inválido', clinicId);
      return [];
    }

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('clinic_id', clinicId);

    if (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return [];
    }

    // Mapear campos do Supabase para o formato da interface
    const mapped: Appointment[] = (data || []).map(apt => ({
      id: apt.id,
      patient: apt.patient_name || 'Paciente sem nome',
      professional: apt.professional_name || 'Profissional',
      date: apt.date,
      time: apt.time,
      type: apt.type || 'Consulta',
      modality: (apt.modality as any) || 'presencial',
      status: (apt.status as any) || 'pending',
      duration: apt.duration || 30,
      phone: apt.phone || '',
      day: getDayOfWeek(apt.date),
      clinic_id: apt.clinic_id
    }));

    appointments = mapped;
    appointmentListeners.forEach(listener => listener());
    return mapped;
  },

  // Obter bloqueios direto do Supabase
  fetchBlockedSlots: async (clinicId: string): Promise<BlockedSlot[]> => {
    if (!clinicId || clinicId === '00000000-0000-0000-0000-000000000000') return [];

    const { data, error } = await supabase
      .from('blocked_slots')
      .select('*')
      .eq('clinic_id', clinicId);

    if (error) {
      console.error('Erro ao buscar bloqueios:', error);
      return [];
    }

    const mapped: BlockedSlot[] = (data || []).map(slot => ({
      id: slot.id,
      day: slot.day,
      time: slot.time,
      duration: slot.duration,
      reason: slot.reason,
      date: slot.date || '',
      professional: slot.professional_name,
      professional_name: slot.professional_name,
      clinic_id: slot.clinic_id
    }));

    blockedSlots = mapped;
    blockedSlotListeners.forEach(listener => listener());
    return mapped;
  },

  // Obter agendamentos em formato da AgendaProfissional
  getAppointmentsForAgenda: () => {
    return appointments.map(convertToAgendaFormat);
  },

  // Obter bloqueios (do cache)
  getBlockedSlots: (): BlockedSlot[] => {
    return [...blockedSlots];
  },

  // Criar agendamento (agora com opção de persistência no Supabase)
  createAppointment: async (appointment: Omit<Appointment, 'id' | 'day'>, clinicId?: string): Promise<Appointment | null> => {
    const day = getDayOfWeek(appointment.date);

    if (clinicId) {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          clinic_id: clinicId,
          patient_name: appointment.patient,
          professional_name: appointment.professional,
          date: appointment.date,
          time: appointment.time,
          type: appointment.type,
          modality: appointment.modality,
          status: appointment.status,
          duration: appointment.duration,
          phone: appointment.phone || null
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar agendamento no Supabase:', error);
        return null;
      }

      const newAppt: Appointment = {
        ...appointment,
        id: data.id,
        day,
        clinic_id: clinicId
      };
      // Adicionar ao cache local também
      appointments.push(newAppt);
      appointmentListeners.forEach(listener => listener());
      return newAppt;
    }

    // Fallback para memória se não houver clinicId
    const newAppointment: Appointment = {
      ...appointment,
      id: Math.max(...appointments.map(a => a.id), 0) + 1,
      day,
    };
    appointments.push(newAppointment);
    appointmentListeners.forEach(listener => listener());
    return newAppointment;
  },

  updateAppointment: (id: number, updates: Partial<Appointment>): Appointment | null => {
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) return null;
    const updated = { ...appointments[index], ...updates };
    if (updates.date) updated.day = getDayOfWeek(updates.date);
    appointments[index] = updated;
    appointmentListeners.forEach(listener => listener());

    void supabase
      .from('appointments')
      .update({
        patient_name: updated.patient,
        professional_name: updated.professional,
        date: updated.date,
        time: updated.time,
        type: updated.type,
        modality: updated.modality,
        status: updated.status,
        duration: updated.duration,
        phone: updated.phone || null
      })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Erro ao atualizar agendamento no Supabase:', error);
      });

    return updated;
  },

  rescheduleAppointment: (id: number, newDate: string, newTime: string): Appointment | null => {
    return appointmentService.updateAppointment(id, {
      date: newDate,
      time: newTime,
    });
  },

  confirmAppointment: (id: number): Appointment | null => {
    return appointmentService.updateAppointment(id, {
      status: 'confirmed',
    });
  },

  cancelAppointment: (id: number): Appointment | null => {
    return appointmentService.updateAppointment(id, {
      status: 'cancelled',
    });
  },

  deleteAppointment: (id: number): boolean => {
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) return false;
    appointments.splice(index, 1);
    appointmentListeners.forEach(listener => listener());

    void supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('Erro ao deletar agendamento no Supabase:', error);
      });

    return true;
  },

  addBlockedSlot: (block: BlockedSlot): void => {
    blockedSlots.push(block);
    blockedSlotListeners.forEach(listener => listener());

    if (!block.clinic_id) return;

    void supabase
      .from('blocked_slots')
      .insert({
        clinic_id: block.clinic_id,
        day: block.day,
        date: block.date || null,
        time: block.time,
        duration: block.duration,
        reason: block.reason,
        professional_name: block.professional_name || block.professional || null
      })
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Erro ao criar bloqueio no Supabase:', error);
          return;
        }
        if (data?.id) {
          const idx = blockedSlots.findIndex(b => b === block);
          if (idx >= 0) blockedSlots[idx] = { ...blockedSlots[idx], id: data.id };
          blockedSlotListeners.forEach(listener => listener());
        }
      });
  },

  removeBlockedSlot: (block: BlockedSlot): void => {
    blockedSlots = blockedSlots.filter(b => {
      if (!block.date && !b.date) {
        return !(b.day === block.day && b.time === block.time && b.professional === block.professional);
      }
      return !(b.date === block.date && b.time === block.time && b.professional === block.professional);
    });
    blockedSlotListeners.forEach(listener => listener());

    if (!block.clinic_id) return;

    const query = supabase.from('blocked_slots').delete();
    if (block.id) {
      void query.eq('id', block.id).then(({ error }) => {
        if (error) console.error('Erro ao remover bloqueio no Supabase:', error);
      });
      return;
    }

    void query
      .eq('clinic_id', block.clinic_id)
      .eq('day', block.day)
      .eq('time', block.time)
      .eq('duration', block.duration)
      .then(({ error }) => {
        if (error) console.error('Erro ao remover bloqueio no Supabase:', error);
      });
  },

  checkTimeConflict: (date: string, time: string, duration: number, excludeId?: number, professional?: string): boolean => {
    const [hours, minutes] = time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;

    const hasAppointmentConflict = appointments.some(apt => {
      if (apt.id === excludeId) return false;
      if (apt.date !== date) return false;
      if (professional && apt.professional !== professional) return false;
      const [aptHours, aptMinutes] = apt.time.split(':').map(Number);
      const aptStart = aptHours * 60 + aptMinutes;
      const aptEnd = aptStart + apt.duration;
      return (startMinutes < aptEnd && endMinutes > aptStart);
    });

    const hasBlockConflict = blockedSlots.some(block => {
      const day = getDayOfWeek(date);
      if (block.date && block.date !== date) return false;
      if (!block.date && block.day !== day) return false;
      if (professional && block.professional && block.professional !== professional) return false;
      if (!professional && block.professional) return false;
      const [blockHours, blockMinutes] = block.time.split(':').map(Number);
      const blockStart = blockHours * 60 + blockMinutes;
      const blockEnd = blockStart + block.duration;
      return (startMinutes < blockEnd && endMinutes > blockStart);
    });

    return hasAppointmentConflict || hasBlockConflict;
  },

  isPastDate: (dateStr: string): boolean => {
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const todayStr = brazilTime.getFullYear() + '-' + String(brazilTime.getMonth() + 1).padStart(2, '0') + '-' + String(brazilTime.getDate()).padStart(2, '0');
    return dateStr < todayStr;
  },

  isPastTime: (dateStr: string, timeStr: string): boolean => {
    const now = new Date();
    const brazilNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    const todayStr = brazilNow.getFullYear() + '-' + String(brazilNow.getMonth() + 1).padStart(2, '0') + '-' + String(brazilNow.getDate()).padStart(2, '0');
    if (dateStr < todayStr) return true;
    if (dateStr === todayStr) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (hours < brazilNow.getHours()) return true;
      if (hours === brazilNow.getHours() && minutes < brazilNow.getMinutes()) return true;
    }
    return false;
  },

  onAppointmentsChange: (callback: () => void): (() => void) => {
    appointmentListeners.add(callback);
    return () => { appointmentListeners.delete(callback); };
  },

  onBlockedSlotsChange: (callback: () => void): (() => void) => {
    blockedSlotListeners.add(callback);
    return () => { blockedSlotListeners.delete(callback); };
  },

  initialize: (initialAppointments: Appointment[], initialBlocks: BlockedSlot[] = []) => {
    appointments = initialAppointments.map(apt => ({
      ...apt,
      day: apt.day ?? getDayOfWeek(apt.date),
    }));
    blockedSlots = initialBlocks;
  },
};
