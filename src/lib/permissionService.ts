// Serviço para verificar permissões de módulos do usuário
import { isModuleEnabledForClinic } from './clinicPermissionService';

interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface Role {
  id: string;
  name: string;
  modulePermissions?: Record<string, ModulePermission>;
}

const STORAGE_KEY = 'CactoSaude_roles';
const USER_ROLE_KEY = 'CactoSaude_user_role';

// Carregar roles do localStorage ou usar padrão
const loadRoles = (): Role[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Erro ao carregar roles:', e);
  }
  
  // Roles padrão
  return [
    {
      id: "admin",
      name: "Administrador",
      modulePermissions: {
        Dashboard: { view: true, create: true, edit: true, delete: true },
        Agenda: { view: true, create: true, edit: true, delete: true },
        Consulta: { view: true, create: true, edit: true, delete: true },
        Pacientes: { view: true, create: true, edit: true, delete: true },
        CRM: { view: true, create: true, edit: true, delete: true },
        Financeiro: { view: true, create: true, edit: true, delete: true },
        Pagamentos: { view: true, create: true, edit: true, delete: true },
        Equipe: { view: true, create: true, edit: true, delete: true },
        Estoque: { view: true, create: true, edit: true, delete: true },
        Comunicação: { view: true, create: true, edit: true, delete: true },
        Relatórios: { view: true, create: true, edit: true, delete: true },
        Suporte: { view: true, create: true, edit: true, delete: true },
        Configurações: { view: true, create: true, edit: true, delete: true },
        Convênios: { view: true, create: true, edit: true, delete: true },
      },
    },
    {
      id: "medico",
      name: "Médico",
      modulePermissions: {
        Dashboard: { view: true, create: false, edit: false, delete: false },
        Agenda: { view: true, create: true, edit: true, delete: false },
        Consulta: { view: true, create: true, edit: true, delete: false },
        Pacientes: { view: true, create: false, edit: false, delete: false },
        CRM: { view: false, create: false, edit: false, delete: false },
        Financeiro: { view: false, create: false, edit: false, delete: false },
        Pagamentos: { view: false, create: false, edit: false, delete: false },
        Equipe: { view: false, create: false, edit: false, delete: false },
        Estoque: { view: false, create: false, edit: false, delete: false },
        Comunicação: { view: false, create: false, edit: false, delete: false },
        Relatórios: { view: true, create: false, edit: false, delete: false },
        Suporte: { view: true, create: true, edit: false, delete: false },
        Configurações: { view: false, create: false, edit: false, delete: false },
        Convênios: { view: false, create: false, edit: false, delete: false },
      },
    },
    {
      id: "recepcionista",
      name: "Recepcionista",
      modulePermissions: {
        Dashboard: { view: true, create: false, edit: false, delete: false },
        Agenda: { view: true, create: true, edit: true, delete: false },
        Consulta: { view: false, create: false, edit: false, delete: false },
        Pacientes: { view: true, create: true, edit: true, delete: false },
        CRM: { view: false, create: false, edit: false, delete: false },
        Financeiro: { view: false, create: false, edit: false, delete: false },
        Pagamentos: { view: true, create: true, edit: false, delete: false },
        Equipe: { view: false, create: false, edit: false, delete: false },
        Estoque: { view: false, create: false, edit: false, delete: false },
        Comunicação: { view: false, create: false, edit: false, delete: false },
        Relatórios: { view: false, create: false, edit: false, delete: false },
        Suporte: { view: true, create: true, edit: false, delete: false },
        Configurações: { view: false, create: false, edit: false, delete: false },
        Convênios: { view: false, create: false, edit: false, delete: false },
      },
    },
    {
      id: "financeiro",
      name: "Financeiro",
      modulePermissions: {
        Dashboard: { view: true, create: false, edit: false, delete: false },
        Agenda: { view: false, create: false, edit: false, delete: false },
        Consulta: { view: false, create: false, edit: false, delete: false },
        Pacientes: { view: true, create: false, edit: false, delete: false },
        CRM: { view: false, create: false, edit: false, delete: false },
        Financeiro: { view: true, create: true, edit: true, delete: true },
        Pagamentos: { view: true, create: true, edit: true, delete: true },
        Equipe: { view: false, create: false, edit: false, delete: false },
        Estoque: { view: false, create: false, edit: false, delete: false },
        Comunicação: { view: false, create: false, edit: false, delete: false },
        Relatórios: { view: true, create: true, edit: false, delete: false },
        Suporte: { view: false, create: false, edit: false, delete: false },
        Configurações: { view: false, create: false, edit: false, delete: false },
        Convênios: { view: true, create: true, edit: true, delete: true },
      },
    },
  ];
};

// Obter role do usuário atual
const getUserRole = (): string => {
  try {
    const stored = localStorage.getItem(USER_ROLE_KEY);
    if (stored) {
      return stored;
    }
  } catch (e) {
    console.error('Erro ao carregar role do usuário:', e);
  }
  
  // Padrão: admin (em produção viria da API de autenticação)
  return "admin";
};

// Verificar se o usuário tem permissão para um módulo
export const hasModulePermission = (
  module: string,
  permission: 'view' | 'create' | 'edit' | 'delete' = 'view',
  clinicId?: number
): boolean => {
  // 1. Primeiro verificar se o módulo está habilitado para a clínica
  if (!isModuleEnabledForClinic(module, clinicId)) {
    return false; // Módulo desabilitado para a clínica
  }
  
  const userRoleId = getUserRole();
  const roles = loadRoles();
  const userRole = roles.find(r => r.id === userRoleId);
  
  if (!userRole) {
    return false;
  }
  
  // Admin sempre tem todas as permissões (mas ainda precisa do módulo estar habilitado)
  if (userRoleId === 'admin') {
    return true;
  }
  
  const modulePerms = userRole.modulePermissions?.[module];
  if (!modulePerms) {
    return false;
  }
  
  return modulePerms[permission] === true;
};

// Verificar se o usuário pode visualizar um módulo
export const canViewModule = (module: string, clinicId?: number): boolean => {
  return hasModulePermission(module, 'view', clinicId);
};

// Verificar se o usuário pode criar em um módulo
export const canCreateInModule = (module: string): boolean => {
  return hasModulePermission(module, 'create');
};

// Verificar se o usuário pode editar em um módulo
export const canEditInModule = (module: string): boolean => {
  return hasModulePermission(module, 'edit');
};

// Verificar se o usuário pode deletar em um módulo
export const canDeleteInModule = (module: string): boolean => {
  return hasModulePermission(module, 'delete');
};

// Salvar role do usuário (chamado após login)
export const setUserRole = (roleId: string): void => {
  try {
    localStorage.setItem(USER_ROLE_KEY, roleId);
  } catch (e) {
    console.error('Erro ao salvar role do usuário:', e);
  }
};

// Salvar roles atualizados (chamado de AdminPermissoes)
export const saveRoles = (roles: Role[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
    // Disparar evento para atualizar outros componentes
    window.dispatchEvent(new CustomEvent('rolesUpdated'));
  } catch (e) {
    console.error('Erro ao salvar roles:', e);
  }
};

// Obter todas as roles
export const getAllRoles = (): Role[] => {
  return loadRoles();
};

// Obter role do usuário atual
export const getCurrentUserRole = (): string => {
  return getUserRole();
};

