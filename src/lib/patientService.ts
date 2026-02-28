import { supabase } from './supabase';

export interface Patient {
  id: number;
  clinic_id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birth_date: string;
  address: string;
  photo: string;
  health_insurance: string;
  consultations_count: number;
  last_consultation: string | null;
  balance: number;
  allergies: string;
  chronic_diseases: string;
  convenio_id?: number;
  convenio_nome?: string;
  carteirinha?: string;
  validade_carteirinha?: string;
  plano?: string;
  carencia?: string;
  titular?: string;
}

// Helper to get current clinic ID from localStorage
const getClinicId = () => {
  const id = localStorage.getItem('cactosaude_current_clinic_id');
  return (id && id !== '00000000-0000-0000-0000-000000000000') ? id : null;
};

const patientListeners = new Set<() => void>();

export const patientService = {
  // Obter todos os pacientes da clínica atual
  getAllPatients: async (): Promise<Patient[]> => {
    const clinicId = getClinicId();
    if (!clinicId) return [];

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar pacientes:', error);
      return [];
    }

    return data || [];
  },

  // Obter paciente por ID
  getPatientById: async (id: number): Promise<Patient | null> => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar paciente:', error);
      return null;
    }

    return data;
  },

  // Criar paciente
  createPatient: async (patient: Omit<Patient, 'id' | 'clinic_id'>): Promise<Patient | null> => {
    const clinicId = getClinicId();
    if (!clinicId) {
      console.error('Sem clinic_id ao criar paciente');
      return null;
    }

    const { data, error } = await supabase
      .from('patients')
      .insert([
        {
          ...patient,
          clinic_id: clinicId,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar paciente:', error);
      return null;
    }

    patientListeners.forEach(listener => listener());
    return data;
  },

  // Atualizar paciente
  updatePatient: async (id: number, updates: Partial<Patient>): Promise<Patient | null> => {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar paciente:', error);
      return null;
    }

    patientListeners.forEach(listener => listener());
    return data;
  },

  // Deletar paciente
  deletePatient: async (id: number): Promise<boolean> => {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar paciente:', error);
      return false;
    }

    patientListeners.forEach(listener => listener());
    return true;
  },

  // Registrar listener para mudanças em pacientes (opcional, já que agora é async)
  onPatientsChange: (callback: () => void): (() => void) => {
    patientListeners.add(callback);
    return () => {
      patientListeners.delete(callback);
    };
  },
};
