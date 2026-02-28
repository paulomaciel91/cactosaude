// Serviço de gerenciamento de prescrições digitais

export interface PrescriptionMedication {
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string; // ex: "1x ao dia"
  duration: string; // ex: "30 dias"
  quantity: number;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: number;
  patientName: string;
  patientCpf: string;
  doctorName: string;
  doctorCrm: string;
  doctorCrmState: string;
  date: string;
  medications: PrescriptionMedication[];
  signature?: string; // assinatura digital (base64)
  qrCode?: string; // código único para validação
  status: 'draft' | 'signed' | 'cancelled';
  createdAt: string;
  notes?: string;
}

// Chave de armazenamento no localStorage
const PRESCRIPTIONS_STORAGE_KEY = 'CactoSaude_prescriptions';

// Função auxiliar para gerar ID único
const generatePrescriptionId = (): string => {
  return `PRES-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

// Função auxiliar para gerar código de validação
const generateValidationCode = (prescription: Omit<Prescription, 'id' | 'createdAt' | 'qrCode'>): string => {
  const data = `${prescription.patientCpf}-${prescription.date}-${prescription.doctorCrm}-${Date.now()}`;
  // Em produção, usar hash criptográfico (ex: SHA-256)
  return btoa(data).substr(0, 20).toUpperCase();
};

export const prescriptionService = {
  // Criar nova prescrição
  createPrescription: (prescription: Omit<Prescription, 'id' | 'createdAt' | 'qrCode' | 'status'>): Prescription => {
    const prescriptions = prescriptionService.getAllPrescriptions();
    
    const newPrescription: Prescription = {
      ...prescription,
      id: generatePrescriptionId(),
      createdAt: new Date().toISOString(),
      qrCode: generateValidationCode(prescription),
      status: 'draft'
    };
    
    prescriptions.push(newPrescription);
    localStorage.setItem(PRESCRIPTIONS_STORAGE_KEY, JSON.stringify(prescriptions));
    
    // Disparar evento customizado para notificar outros componentes
    window.dispatchEvent(new CustomEvent('prescriptionCreated', { detail: newPrescription }));
    
    return newPrescription;
  },

  // Obter todas as prescrições
  getAllPrescriptions: (): Prescription[] => {
    try {
      const stored = localStorage.getItem(PRESCRIPTIONS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao carregar prescrições:', error);
      return [];
    }
  },

  // Obter prescrição por ID
  getPrescriptionById: (id: string): Prescription | undefined => {
    const prescriptions = prescriptionService.getAllPrescriptions();
    return prescriptions.find(p => p.id === id);
  },

  // Obter prescrições do paciente
  getPatientPrescriptions: (patientCpf: string): Prescription[] => {
    return prescriptionService.getAllPrescriptions()
      .filter(p => p.patientCpf === patientCpf)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // Obter prescrições do médico
  getDoctorPrescriptions: (doctorCrm: string): Prescription[] => {
    return prescriptionService.getAllPrescriptions()
      .filter(p => p.doctorCrm === doctorCrm)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // Assinar prescrição
  signPrescription: (prescriptionId: string, signature: string): Prescription | null => {
    const prescriptions = prescriptionService.getAllPrescriptions();
    const index = prescriptions.findIndex(p => p.id === prescriptionId);
    
    if (index === -1) return null;
    
    prescriptions[index].signature = signature;
    prescriptions[index].status = 'signed';
    
    localStorage.setItem(PRESCRIPTIONS_STORAGE_KEY, JSON.stringify(prescriptions));
    
    // Disparar evento customizado
    window.dispatchEvent(new CustomEvent('prescriptionSigned', { detail: prescriptions[index] }));
    
    return prescriptions[index];
  },

  // Atualizar prescrição
  updatePrescription: (prescriptionId: string, updates: Partial<Prescription>): Prescription | null => {
    const prescriptions = prescriptionService.getAllPrescriptions();
    const index = prescriptions.findIndex(p => p.id === prescriptionId);
    
    if (index === -1) return null;
    
    prescriptions[index] = {
      ...prescriptions[index],
      ...updates
    };
    
    localStorage.setItem(PRESCRIPTIONS_STORAGE_KEY, JSON.stringify(prescriptions));
    
    return prescriptions[index];
  },

  // Cancelar prescrição
  cancelPrescription: (prescriptionId: string): Prescription | null => {
    return prescriptionService.updatePrescription(prescriptionId, { status: 'cancelled' });
  },

  // Validar prescrição pelo QR Code
  validatePrescription: (qrCode: string): Prescription | null => {
    const prescriptions = prescriptionService.getAllPrescriptions();
    return prescriptions.find(p => p.qrCode === qrCode && p.status === 'signed') || null;
  },

  // Deletar prescrição
  deletePrescription: (prescriptionId: string): boolean => {
    const prescriptions = prescriptionService.getAllPrescriptions();
    const filtered = prescriptions.filter(p => p.id !== prescriptionId);
    
    if (filtered.length === prescriptions.length) return false;
    
    localStorage.setItem(PRESCRIPTIONS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Obter estatísticas
  getStatistics: () => {
    const prescriptions = prescriptionService.getAllPrescriptions();
    
    return {
      total: prescriptions.length,
      signed: prescriptions.filter(p => p.status === 'signed').length,
      draft: prescriptions.filter(p => p.status === 'draft').length,
      cancelled: prescriptions.filter(p => p.status === 'cancelled').length,
      thisMonth: prescriptions.filter(p => {
        const date = new Date(p.createdAt);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length
    };
  }
};

