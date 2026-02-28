// Serviço compartilhado para gerenciar pacientes

export interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: string;
  photo: string;
  healthInsurance: string;
  consultations: number;
  lastConsultation: string;
  procedures: string[];
  balance: number;
  documents: number;
  allergies: string;
  chronicDiseases: string;
  // Dados do Convênio TISS
  convenioId?: number;
  convenioNome?: string;
  carteirinha?: string;
  validadeCarteirinha?: string;
  plano?: string;
  carencia?: string;
  titular?: string; // CPF do titular se for dependente
}

// Armazenamento em memória (em produção viria de uma API)
let patients: Patient[] = [
  {
    id: 1,
    name: "Maria Silva",
    email: "maria.silva@email.com",
    phone: "(11) 98765-4321",
    cpf: "123.456.789-00",
    birthDate: "15/03/1985",
    address: "Rua das Flores, 123 - São Paulo/SP",
    photo: "",
    healthInsurance: "Unimed",
    consultations: 12,
    lastConsultation: "15/01/2024",
    procedures: ["Consulta Geral", "Exames de Rotina"],
    balance: -150.00,
    documents: 5,
    allergies: "Penicilina",
    chronicDiseases: "Hipertensão",
  },
  {
    id: 2,
    name: "Pedro Costa",
    email: "pedro.costa@email.com",
    phone: "(11) 91234-5678",
    cpf: "987.654.321-00",
    birthDate: "22/08/1990",
    address: "Av. Paulista, 456 - São Paulo/SP",
    photo: "",
    healthInsurance: "Particular",
    consultations: 8,
    lastConsultation: "10/01/2024",
    procedures: ["Consulta de Retorno"],
    balance: 0,
    documents: 3,
    allergies: "Nenhuma",
    chronicDiseases: "Nenhuma",
  },
  {
    id: 3,
    name: "Julia Oliveira",
    email: "julia.oliveira@email.com",
    phone: "(11) 99999-8888",
    cpf: "456.789.123-00",
    birthDate: "10/05/1978",
    address: "Rua Augusta, 789 - São Paulo/SP",
    photo: "",
    healthInsurance: "Bradesco Saúde",
    consultations: 20,
    lastConsultation: "18/01/2024",
    procedures: ["Consulta Especializada", "Procedimento Estético"],
    balance: 300.00,
    documents: 8,
    allergies: "Lactose",
    chronicDiseases: "Diabetes",
  },
];

const patientListeners = new Set<() => void>();

export const patientService = {
  // Obter todos os pacientes
  getAllPatients: (): Patient[] => {
    return [...patients];
  },

  // Obter paciente por ID
  getPatientById: (id: number): Patient | undefined => {
    return patients.find(p => p.id === id);
  },

  // Obter paciente por nome (busca parcial)
  getPatientByName: (name: string): Patient | undefined => {
    const searchName = name.toLowerCase().trim();
    return patients.find(p => 
      p.name.toLowerCase().includes(searchName) || 
      searchName.includes(p.name.toLowerCase())
    );
  },

  // Verificar se paciente existe
  patientExists: (name: string): boolean => {
    const searchName = name.toLowerCase().trim();
    return patients.some(p => 
      p.name.toLowerCase() === searchName ||
      p.name.toLowerCase().includes(searchName) ||
      searchName.includes(p.name.toLowerCase())
    );
  },

  // Criar paciente
  createPatient: (patient: Omit<Patient, 'id'>): Patient => {
    const newPatient: Patient = {
      ...patient,
      id: Math.max(...patients.map(p => p.id), 0) + 1,
    };
    patients.push(newPatient);
    patientListeners.forEach(listener => listener());
    return newPatient;
  },

  // Atualizar paciente
  updatePatient: (id: number, updates: Partial<Patient>): Patient | null => {
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    patients[index] = { ...patients[index], ...updates };
    patientListeners.forEach(listener => listener());
    return patients[index];
  },

  // Deletar paciente
  deletePatient: (id: number): boolean => {
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    patients.splice(index, 1);
    patientListeners.forEach(listener => listener());
    return true;
  },

  // Registrar listener para mudanças em pacientes
  onPatientsChange: (callback: () => void): (() => void) => {
    patientListeners.add(callback);
    return () => {
      patientListeners.delete(callback);
    };
  },

  // Inicializar com dados mock
  initialize: (initialPatients: Patient[]) => {
    patients = initialPatients;
  },
};

