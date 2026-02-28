-- SQL para inserir dados de teste no CactoSaude (VERSÃO CORRIGIDA)

-- INSTRUÇÃO: 
-- Este script usa o seu perfil já criado para evitar o erro de chave estrangeira com o auth.users.
-- Execute este script no SQL Editor do Supabase.

DO $$
DECLARE
    v_clinic_id uuid;
    v_my_id uuid;
    v_patient_id_1 bigint;
    v_patient_id_2 bigint;
    v_patient_id_3 bigint;
BEGIN
    -- 1. Tenta encontrar o seu perfil e sua clínica (já devem existir após o primeiro login)
    SELECT id, clinic_id INTO v_my_id, v_clinic_id FROM public.profiles LIMIT 1;
    
    -- Se não encontrar, avisa que é preciso ter logado pelo menos uma vez
    IF v_my_id IS NULL OR v_clinic_id IS NULL THEN
        RAISE EXCEPTION 'Nenhum perfil encontrado. Por favor, faça login no sistema pelo menos uma vez antes de rodar este script para que seu perfil e clínica sejam criados automaticamente.';
    END IF;

    -- 2. Inserir Pacientes
    -- Vamos usar o v_clinic_id encontrado para vincular os pacientes à sua conta real
    INSERT INTO public.patients (clinic_id, name, email, phone, cpf, birth_date, address, health_insurance, consultations_count, balance, allergies, chronic_diseases)
    VALUES 
      (v_clinic_id, 'Ricardo Oliveira', 'ricardo@email.com', '(11) 98888-1111', '123.456.789-00', '1985-05-15', 'Rua das Flores, 123', 'Bradesco Saúde', 5, 0.00, 'Dipirona', 'Rinite'),
      (v_clinic_id, 'Fernanda Souza', 'fernanda@email.com', '(11) 98888-2222', '234.567.890-11', '1992-10-20', 'Av. Central, 456', 'Unimed', 2, -150.00, 'Nenhuma', 'Asma'),
      (v_clinic_id, 'Carlos Alberto', 'carlos@email.com', '(11) 98888-3333', '345.678.901-22', '1970-03-12', 'Rua B, 789', 'Particular', 10, 50.00, 'Penicilina', 'Hipertensão'),
      (v_clinic_id, 'Juliana Lima', 'juliana@email.com', '(11) 98888-4444', '456.789.012-33', '2000-01-25', 'Rua C, 101', 'Amil', 1, 0.00, 'Nenhuma', 'Diabetes'),
      (v_clinic_id, 'Roberto Santos', 'roberto@email.com', '(11) 98888-5555', '567.890.123-44', '1965-08-30', 'Av. Brasil, 202', 'Particular', 0, 0.00, 'Pó, Ácaro', 'Nenhuma')
    ON CONFLICT DO NOTHING;

    -- 3. Inserir Agendamentos
    -- Pegar os novos IDs dos pacientes vinculados à sua clínica
    SELECT id INTO v_patient_id_1 FROM public.patients WHERE name = 'Ricardo Oliveira' AND clinic_id = v_clinic_id LIMIT 1;
    SELECT id INTO v_patient_id_2 FROM public.patients WHERE name = 'Fernanda Souza' AND clinic_id = v_clinic_id LIMIT 1;
    SELECT id INTO v_patient_id_3 FROM public.patients WHERE name = 'Carlos Alberto' AND clinic_id = v_clinic_id LIMIT 1;

    INSERT INTO public.appointments (clinic_id, patient_id, patient_name, professional_id, professional_name, date, time, type, modality, status, duration)
    VALUES 
      -- Agendamento para VOCÊ (vai aparecer na sua agenda)
      (v_clinic_id, v_patient_id_1, 'Ricardo Oliveira', v_my_id, 'Você (Médico)', CURRENT_DATE, '09:00', 'Consulta', 'presencial', 'confirmed', 60),
      (v_clinic_id, v_patient_id_2, 'Fernanda Souza', v_my_id, 'Você (Médico)', CURRENT_DATE, '10:30', 'Retorno', 'online', 'pending', 30),
      
      -- Agendamentos "Mock" (não vinculados a um ID real de médico, apenas nome)
      (v_clinic_id, v_patient_id_3, 'Carlos Alberto', NULL, 'Dr. João Silva (Exemplo)', CURRENT_DATE + interval '1 day', '14:00', 'Primeira Consulta', 'presencial', 'confirmed', 60),
      (v_clinic_id, v_patient_id_1, 'Ricardo Oliveira', NULL, 'Dra. Maria Costa (Exemplo)', CURRENT_DATE + interval '2 days', '15:30', 'Check-up', 'online', 'pending', 45);

    -- 4. Inserir Bloqueios de Horário
    INSERT INTO public.blocked_slots (clinic_id, day, time, duration, reason, professional_id)
    VALUES 
      (v_clinic_id, 1, '12:00', 60, 'Almoço Equipe', NULL),
      (v_clinic_id, 3, '13:00', 30, 'Reunião Clínica', v_my_id);

    RAISE NOTICE 'Dados de teste inseridos com sucesso na clínica ID: %', v_clinic_id;
END $$;
