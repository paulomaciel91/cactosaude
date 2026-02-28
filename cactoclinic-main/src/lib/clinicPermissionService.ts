// Serviço para gerenciar módulos habilitados por clínica

export interface ClinicEnabledModules {
  Dashboard: boolean;
  Agenda: boolean;
  Consulta: boolean;
  Pacientes: boolean;
  CRM: boolean;
  Financeiro: boolean;
  Pagamentos: boolean;
  Equipe: boolean;
  Estoque: boolean;
  Comunicação: boolean;
  Relatórios: boolean;
  Suporte: boolean;
  Configurações: boolean;
  Convênios: boolean;
}

const STORAGE_KEY = 'CactoSaude_clinic_modules';
const CURRENT_CLINIC_ID_KEY = 'CactoSaude_current_clinic_id';

// Módulos padrão habilitados para novas clínicas
const getDefaultEnabledModules = (): ClinicEnabledModules => ({
  Dashboard: true,
  Agenda: true,
  Consulta: true,
  Pacientes: true,
  CRM: true,
  Financeiro: true,
  Pagamentos: true,
  Equipe: true,
  Estoque: true,
  Comunicação: true,
  Relatórios: true,
  Suporte: true,
  Configurações: true,
  Convênios: true,
});

// Carregar módulos habilitados de uma clínica
export const getClinicEnabledModules = (clinicId: number): ClinicEnabledModules => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const allClinicModules = JSON.parse(stored);
      if (allClinicModules[clinicId]) {
        return allClinicModules[clinicId];
      }
    }
  } catch (e) {
    console.error('Erro ao carregar módulos da clínica:', e);
  }
  
  // Retornar padrão se não encontrar
  return getDefaultEnabledModules();
};

// Salvar módulos habilitados de uma clínica
export const saveClinicEnabledModules = (clinicId: number, modules: ClinicEnabledModules): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let allClinicModules: Record<number, ClinicEnabledModules> = {};
    
    if (stored) {
      allClinicModules = JSON.parse(stored);
    }
    
    allClinicModules[clinicId] = modules;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allClinicModules));
    
    // Disparar evento para atualizar outros componentes
    window.dispatchEvent(new CustomEvent('clinicModulesUpdated', { detail: { clinicId } }));
  } catch (e) {
    console.error('Erro ao salvar módulos da clínica:', e);
  }
};

// Obter módulos da clínica atual (do contexto)
export const getCurrentClinicEnabledModules = (): ClinicEnabledModules => {
  try {
    const clinicId = localStorage.getItem(CURRENT_CLINIC_ID_KEY);
    if (clinicId) {
      return getClinicEnabledModules(parseInt(clinicId));
    }
  } catch (e) {
    console.error('Erro ao obter módulos da clínica atual:', e);
  }
  
  // Se não houver clínica definida, retornar todos habilitados (comportamento padrão)
  return getDefaultEnabledModules();
};

// Definir clínica atual
export const setCurrentClinicId = (clinicId: number): void => {
  try {
    localStorage.setItem(CURRENT_CLINIC_ID_KEY, clinicId.toString());
  } catch (e) {
    console.error('Erro ao salvar ID da clínica atual:', e);
  }
};

// Verificar se um módulo está habilitado para a clínica atual
export const isModuleEnabledForClinic = (module: string, clinicId?: number): boolean => {
  const modules = clinicId 
    ? getClinicEnabledModules(clinicId)
    : getCurrentClinicEnabledModules();
  
  // Se o módulo não existir na lista, retornar true (compatibilidade)
  return (modules as any)[module] !== false;
};

