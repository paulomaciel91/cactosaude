import { supabase } from './supabase';

export interface TeamMember {
    id: string;
    clinic_id: string;
    full_name: string;
    email: string;
    role: 'admin' | 'medico' | 'recepcionista' | 'financeiro';
    specialty?: string;
    phone?: string;
    crm?: string;
    status: 'active' | 'inactive';
    created_at?: string;
}

export const teamService = {
    getMembers: async (clinicId: string): Promise<TeamMember[]> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('clinic_id', clinicId)
            .order('full_name');

        if (error) {
            console.error('Erro ao buscar membros da equipe:', error);
            return [];
        }

        return data || [];
    },

    updateMember: async (id: string, updates: Partial<TeamMember>): Promise<boolean> => {
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Erro ao atualizar membro:', error);
            return false;
        }

        return true;
    },

    // Nota: Criar um login real (Auth User) exige que o usuário se cadastre 
    // ou use uma Edge Function. Aqui apenas preparamos o perfil.
    createProfile: async (profile: Omit<TeamMember, 'id' | 'created_at' | 'status'>): Promise<boolean> => {
        // Como não temos o ID do Auth.User ainda, esse perfil ficaria "órfão"
        // até o usuário se cadastrar. Em um sistema real, usaríamos uma Edge Function
        // para criar o usuário no Auth e no Profiles ao mesmo tempo.

        // Por enquanto, vamos permitir apenas a edição de quem já existe ou
        // sugerir o cadastro via convite.
        console.warn("Para criar um novo login, o usuário deve se cadastrar com o email fornecido.");
        return false;
    }
};
