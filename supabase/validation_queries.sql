-- =====================================================
-- VALIDAÇÃO COMPLETA DO SCHEMA SUPABASE NEONPRO
-- Projeto: ownkoxryswokcdanrdgj
-- Data: 2025-08-18
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DAS TABELAS
-- =====================================================

-- Verificar se todas as tabelas existem
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('patients', 'appointments', 'financial_transactions', 'staff_members', 'services')
ORDER BY tablename;

-- Verificar colunas da tabela patients
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'patients' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar colunas da tabela appointments
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'appointments' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar colunas da tabela financial_transactions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'financial_transactions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar colunas da tabela staff_members
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'staff_members' 
  AND table_schema = 'public'
ORDER BY ordinal_position;-- Verificar colunas da tabela services
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'services' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. VERIFICAR FOREIGN KEYS E RELAÇÕES
-- =====================================================

-- Verificar todas as foreign keys existentes
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('appointments', 'financial_transactions')
ORDER BY tc.table_name;

-- 3. INSERÇÃO DE DADOS DE TESTE
-- =====================================================
-- IMPORTANTE: Execute estas queries uma por vez no Supabase SQL Editor

-- Inserir dados de equipe médica
INSERT INTO staff_members (name, role, email, specialization, is_active, created_at)
VALUES 
    ('Dr. Ana Silva', 'dermatologista', 'ana.silva@neonpro.com', 'Dermatologia Estética', true, NOW()),
    ('Enf. Carlos Santos', 'enfermeiro', 'carlos.santos@neonpro.com', 'Procedimentos Estéticos', true, NOW())
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    specialization = EXCLUDED.specialization,
    is_active = EXCLUDED.is_active;

-- Inserir serviços oferecidos
INSERT INTO services (name, description, price, duration_minutes, is_active, created_at)
VALUES 
    ('Botox', 'Aplicação de toxina botulínica para rugas', 800.00, 30, true, NOW()),
    ('Preenchimento Labial', 'Preenchimento com ácido hialurônico', 1200.00, 45, true, NOW()),
    ('Limpeza de Pele', 'Limpeza facial profunda com extração', 150.00, 60, true, NOW())
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    duration_minutes = EXCLUDED.duration_minutes,
    is_active = EXCLUDED.is_active;

-- Inserir pacientes de teste
INSERT INTO patients (name, email, phone, cpf, birth_date, is_active, created_at)
VALUES 
    ('Maria Oliveira', 'maria.oliveira@email.com', '(11) 99999-1111', '111.222.333-44', '1985-03-15', true, NOW()),
    ('João Silva', 'joao.silva@email.com', '(11) 99999-2222', '222.333.444-55', '1990-07-22', true, NOW()),
    ('Paula Santos', 'paula.santos@email.com', '(11) 99999-3333', '333.444.555-66', '1988-12-08', true, NOW())
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    cpf = EXCLUDED.cpf,
    birth_date = EXCLUDED.birth_date,
    is_active = EXCLUDED.is_active;-- Inserir agendamentos de teste (usando IDs dos registros inseridos)
INSERT INTO appointments (patient_id, staff_member_id, service_id, appointment_date, status, notes, created_at)
VALUES 
    (
        (SELECT id FROM patients WHERE email = 'maria.oliveira@email.com' LIMIT 1),
        (SELECT id FROM staff_members WHERE email = 'ana.silva@neonpro.com' LIMIT 1),
        (SELECT id FROM services WHERE name = 'Botox' LIMIT 1),
        NOW() + INTERVAL '7 days',
        'scheduled',
        'Primeira consulta para botox',
        NOW()
    ),
    (
        (SELECT id FROM patients WHERE email = 'joao.silva@email.com' LIMIT 1),
        (SELECT id FROM staff_members WHERE email = 'ana.silva@neonpro.com' LIMIT 1),
        (SELECT id FROM services WHERE name = 'Preenchimento Labial' LIMIT 1),
        NOW() + INTERVAL '14 days',
        'scheduled',
        'Preenchimento labial - consulta de retorno',
        NOW()
    ),
    (
        (SELECT id FROM patients WHERE email = 'paula.santos@email.com' LIMIT 1),
        (SELECT id FROM staff_members WHERE email = 'carlos.santos@neonpro.com' LIMIT 1),
        (SELECT id FROM services WHERE name = 'Limpeza de Pele' LIMIT 1),
        NOW() - INTERVAL '2 days',
        'completed',
        'Limpeza de pele realizada com sucesso',
        NOW()
    );

-- Inserir transações financeiras de teste
INSERT INTO financial_transactions (patient_id, appointment_id, amount, transaction_type, status, payment_method, description, created_at)
VALUES 
    (
        (SELECT id FROM patients WHERE email = 'maria.oliveira@email.com' LIMIT 1),
        (SELECT id FROM appointments WHERE notes = 'Primeira consulta para botox' LIMIT 1),
        800.00,
        'payment',
        'pending',
        'credit_card',
        'Pagamento - Botox (Agendado)',
        NOW()
    ),
    (
        (SELECT id FROM patients WHERE email = 'joao.silva@email.com' LIMIT 1),
        (SELECT id FROM appointments WHERE notes = 'Preenchimento labial - consulta de retorno' LIMIT 1),
        600.00,
        'payment',
        'completed',
        'pix',
        'Entrada - Preenchimento Labial (50%)',
        NOW()
    ),
    (
        (SELECT id FROM patients WHERE email = 'paula.santos@email.com' LIMIT 1),
        (SELECT id FROM appointments WHERE notes = 'Limpeza de pele realizada com sucesso' LIMIT 1),
        150.00,
        'payment',
        'completed',
        'cash',
        'Pagamento - Limpeza de Pele',
        NOW()
    );-- 4. QUERIES DE VALIDAÇÃO DE MÉTRICAS
-- =====================================================
-- Execute estas queries para validar que o schema está funcionando

-- Métrica 1: Total de pacientes ativos
SELECT COUNT(*) as total_active_patients 
FROM patients 
WHERE is_active = true;

-- Métrica 2: Receita mensal atual
SELECT 
    COALESCE(SUM(amount), 0) as monthly_revenue,
    COUNT(*) as completed_transactions
FROM financial_transactions 
WHERE transaction_type = 'payment' 
  AND status = 'completed'
  AND created_at >= date_trunc('month', CURRENT_DATE);

-- Métrica 3: Agendamentos futuros
SELECT 
    COUNT(*) as future_appointments,
    COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_appointments,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_appointments
FROM appointments 
WHERE appointment_date > NOW()
  AND status NOT IN ('cancelled', 'completed');

-- Métrica 4: Membros da equipe ativa
SELECT 
    COUNT(*) as active_staff,
    COUNT(CASE WHEN role = 'dermatologista' THEN 1 END) as doctors,
    COUNT(CASE WHEN role = 'enfermeiro' THEN 1 END) as nurses
FROM staff_members 
WHERE is_active = true;

-- Métrica 5: Receita por serviço (breakdown)
SELECT 
    s.name as service_name,
    s.price as service_price,
    COUNT(ft.id) as total_transactions,
    SUM(ft.amount) as total_revenue,
    AVG(ft.amount) as avg_transaction_amount
FROM financial_transactions ft
JOIN appointments a ON ft.appointment_id = a.id
JOIN services s ON a.service_id = s.id
WHERE ft.status = 'completed'
GROUP BY s.id, s.name, s.price
ORDER BY total_revenue DESC;

-- 5. QUERIES DO DASHBOARD PRINCIPAL
-- =====================================================
-- Query principal para o dashboard - combina todas as métricas

SELECT 
    -- Pacientes
    (SELECT COUNT(*) FROM patients WHERE is_active = true) as active_patients,
    (SELECT COUNT(*) FROM patients WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_patients_month,
    
    -- Agendamentos
    (SELECT COUNT(*) FROM appointments WHERE appointment_date > NOW() AND status NOT IN ('cancelled', 'completed')) as future_appointments,
    (SELECT COUNT(*) FROM appointments WHERE DATE(appointment_date) = CURRENT_DATE) as appointments_today,
    
    -- Financeiro
    (SELECT COALESCE(SUM(amount), 0) FROM financial_transactions WHERE status = 'completed' AND created_at >= date_trunc('month', CURRENT_DATE)) as monthly_revenue,
    (SELECT COALESCE(SUM(amount), 0) FROM financial_transactions WHERE status = 'completed' AND DATE(created_at) = CURRENT_DATE) as daily_revenue,
    
    -- Equipe
    (SELECT COUNT(*) FROM staff_members WHERE is_active = true) as active_staff;-- 6. QUERIES PARA LISTAGENS NO FRONTEND
-- =====================================================

-- Listagem de agendamentos recentes com informações completas
SELECT 
    a.id,
    a.appointment_date,
    a.status,
    a.notes,
    p.name as patient_name,
    p.phone as patient_phone,
    p.email as patient_email,
    s.name as service_name,
    s.price as service_price,
    s.duration_minutes,
    sm.name as staff_name,
    sm.role as staff_role
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN services s ON a.service_id = s.id  
JOIN staff_members sm ON a.staff_member_id = sm.id
ORDER BY a.appointment_date DESC
LIMIT 20;

-- Histórico completo de um paciente específico
SELECT 
    p.name,
    p.email,
    p.phone,
    a.appointment_date,
    a.status as appointment_status,
    a.notes,
    s.name as service,
    s.price as service_price,
    sm.name as staff_member,
    ft.amount as paid_amount,
    ft.status as payment_status,
    ft.payment_method,
    ft.created_at as payment_date
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
LEFT JOIN services s ON a.service_id = s.id
LEFT JOIN staff_members sm ON a.staff_member_id = sm.id
LEFT JOIN financial_transactions ft ON a.id = ft.appointment_id
WHERE p.email = 'maria.oliveira@email.com'  -- Substitua pelo email do paciente
ORDER BY a.appointment_date DESC;

-- Resumo financeiro diário dos últimos 30 dias
SELECT 
    DATE(created_at) as transaction_date,
    SUM(CASE WHEN transaction_type = 'payment' AND status = 'completed' THEN amount ELSE 0 END) as daily_revenue,
    COUNT(CASE WHEN transaction_type = 'payment' AND status = 'completed' THEN 1 END) as completed_payments,
    COUNT(CASE WHEN transaction_type = 'payment' AND status = 'pending' THEN 1 END) as pending_payments
FROM financial_transactions 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY transaction_date DESC;

-- Lista de pacientes com última consulta
SELECT 
    p.id,
    p.name,
    p.email,
    p.phone,
    p.created_at as patient_since,
    COUNT(a.id) as total_appointments,
    MAX(a.appointment_date) as last_appointment,
    SUM(ft.amount) as total_spent
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
LEFT JOIN financial_transactions ft ON a.id = ft.appointment_id AND ft.status = 'completed'
WHERE p.is_active = true
GROUP BY p.id, p.name, p.email, p.phone, p.created_at
ORDER BY last_appointment DESC NULLS LAST;

-- 7. QUERIES DE VALIDAÇÃO FINAL
-- =====================================================

-- Verificar integridade dos dados inseridos
SELECT 
    'patients' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_records
FROM patients
UNION ALL
SELECT 
    'staff_members' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_records
FROM staff_members
UNION ALL
SELECT 
    'services' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_records
FROM services
UNION ALL
SELECT 
    'appointments' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN status != 'cancelled' THEN 1 END) as active_records
FROM appointments
UNION ALL
SELECT 
    'financial_transactions' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as active_records
FROM financial_transactions;

-- Verificar consistência das relações
SELECT 
    'Appointments without valid patient' as validation_check,
    COUNT(*) as issue_count
FROM appointments a
LEFT JOIN patients p ON a.patient_id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 
    'Appointments without valid staff' as validation_check,
    COUNT(*) as issue_count
FROM appointments a
LEFT JOIN staff_members sm ON a.staff_member_id = sm.id
WHERE sm.id IS NULL
UNION ALL
SELECT 
    'Appointments without valid service' as validation_check,
    COUNT(*) as issue_count
FROM appointments a
LEFT JOIN services s ON a.service_id = s.id
WHERE s.id IS NULL
UNION ALL
SELECT 
    'Transactions without valid appointment' as validation_check,
    COUNT(*) as issue_count
FROM financial_transactions ft
LEFT JOIN appointments a ON ft.appointment_id = a.id
WHERE a.id IS NULL AND ft.appointment_id IS NOT NULL;

-- =====================================================
-- FIM DAS QUERIES DE VALIDAÇÃO
-- =====================================================
-- 
-- Para usar este arquivo:
-- 1. Abra o Supabase SQL Editor
-- 2. Execute as queries uma seção por vez
-- 3. Verifique os resultados de cada validação
-- 4. Os dados de teste serão inseridos automaticamente
-- 5. Use as queries do dashboard no seu frontend
-- =====================================================