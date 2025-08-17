-- ========================================
-- NEONPRO CRM TEST DATA - Local Development
-- Created: 2025-07-21
-- Purpose: Sample data for testing CRM functionality locally
-- ========================================

-- Insert test customers
INSERT INTO customers (id, full_name, email, phone, customer_since, total_visits, lifetime_value, status) VALUES 
(
    '123e4567-e89b-12d3-a456-426614174001',
    'Maria Silva Santos',
    'maria.silva@email.com',
    '(11) 99999-1234',
    '2024-01-15 10:00:00+00',
    5,
    850.00,
    'active'
),
(
    '123e4567-e89b-12d3-a456-426614174002', 
    'João Pedro Oliveira',
    'joao.pedro@email.com',
    '(11) 98888-5678',
    '2024-03-20 14:30:00+00',
    3,
    450.00,
    'active'
),
(
    '123e4567-e89b-12d3-a456-426614174003',
    'Ana Carolina Ferreira', 
    'ana.carolina@email.com',
    '(11) 97777-9012',
    '2024-02-10 09:15:00+00',
    8,
    1200.00,
    'active'
),
(
    '123e4567-e89b-12d3-a456-426614174004',
    'Carlos Alberto Lima',
    'carlos.lima@email.com', 
    '(11) 96666-3456',
    '2023-11-05 16:45:00+00',
    12,
    2100.00,
    'active'
),
(
    '123e4567-e89b-12d3-a456-426614174005',
    'Fernanda Costa Silva',
    'fernanda.costa@email.com',
    '(11) 95555-7890',
    '2024-01-30 11:20:00+00',
    1,
    150.00,
    'inactive'
);

-- Insert customer segments
INSERT INTO customer_segments (id, name, description, criteria, customer_count, is_active) VALUES
(
    '223e4567-e89b-12d3-a456-426614174001',
    'Clientes VIP',
    'Clientes com alto valor de vida útil (lifetime value > R$ 1000)',
    '{"lifetime_value": {"min": 1000}}',
    2,
    true
),
(
    '223e4567-e89b-12d3-a456-426614174002',
    'Novos Clientes',
    'Clientes cadastrados nos últimos 3 meses',
    '{"customer_since": {"days_ago": 90}}',
    3,
    true
),
(
    '223e4567-e89b-12d3-a456-426614174003',
    'Clientes Inativos',
    'Clientes que não visitam há mais de 6 meses',
    '{"last_visit": {"days_ago": 180}}',
    1,
    true
);

-- Insert segment memberships
INSERT INTO customer_segment_memberships (customer_id, segment_id, added_date) VALUES
-- VIP customers
('123e4567-e89b-12d3-a456-426614174003', '223e4567-e89b-12d3-a456-426614174001', NOW()),
('123e4567-e89b-12d3-a456-426614174004', '223e4567-e89b-12d3-a456-426614174001', NOW()),
-- New customers  
('123e4567-e89b-12d3-a456-426614174001', '223e4567-e89b-12d3-a456-426614174002', NOW()),
('123e4567-e89b-12d3-a456-426614174002', '223e4567-e89b-12d3-a456-426614174002', NOW()),
('123e4567-e89b-12d3-a456-426614174005', '223e4567-e89b-12d3-a456-426614174002', NOW()),
-- Inactive customers
('123e4567-e89b-12d3-a456-426614174005', '223e4567-e89b-12d3-a456-426614174003', NOW());

-- Insert sample marketing campaigns
INSERT INTO marketing_campaigns (id, name, description, campaign_type, subject, message_template, status, total_recipients) VALUES
(
    '323e4567-e89b-12d3-a456-426614174001',
    'Campanha Verão 2025',
    'Promoção especial de tratamentos para o verão',
    'email',
    'Prepare-se para o Verão! Tratamentos especiais com 20% OFF',
    'Olá {{customer_name}}, ofertas especiais de verão estão esperando por você! Venha conhecer nossos tratamentos exclusivos.',
    'draft',
    0
),
(
    '323e4567-e89b-12d3-a456-426614174002',
    'Reativação de Clientes',
    'Campanha para reativar clientes inativos',
    'email', 
    'Sentimos sua falta! Oferta especial para seu retorno',
    'Oi {{customer_name}}, que tal voltar a cuidar de você? Temos uma oferta especial para o seu retorno!',
    'scheduled',
    1
);

-- Insert customer interactions (treatment history)
INSERT INTO customer_interactions (customer_id, interaction_type, title, description, outcome) VALUES
(
    '123e4567-e89b-12d3-a456-426614174001',
    'treatment',
    'Limpeza de Pele Profunda',
    'Tratamento completo de limpeza de pele com extração de cravos e hidratação',
    'Cliente satisfeita, agendou retorno'
),
(
    '123e4567-e89b-12d3-a456-426614174001',
    'consultation',
    'Consulta Dermatológica',
    'Avaliação para tratamento de manchas solares',
    'Indicado protocolo de despigmentação'
),
(
    '123e4567-e89b-12d3-a456-426614174002',
    'treatment',
    'Botox Facial',
    'Aplicação de toxina botulínica em região frontal e periorbital',
    'Resultado excelente, cliente muito satisfeito'
),
(
    '123e4567-e89b-12d3-a456-426614174003',
    'treatment', 
    'Preenchimento Labial',
    'Preenchimento com ácido hialurônico para aumento labial',
    'Resultado natural, dentro do esperado'
),
(
    '123e4567-e89b-12d3-a456-426614174004',
    'treatment',
    'Harmonização Facial',
    'Tratamento completo com botox e preenchimento',
    'Excelente resultado, cliente fidelizado'
);

-- Update customer statistics based on interactions
UPDATE customers SET 
    last_visit = '2025-07-01 14:00:00+00',
    last_treatment = '2025-07-01 14:00:00+00'
WHERE id = '123e4567-e89b-12d3-a456-426614174001';

UPDATE customers SET
    last_visit = '2025-06-15 10:30:00+00', 
    last_treatment = '2025-06-15 10:30:00+00'
WHERE id = '123e4567-e89b-12d3-a456-426614174002';

UPDATE customers SET
    last_visit = '2025-07-10 16:20:00+00',
    last_treatment = '2025-07-10 16:20:00+00' 
WHERE id = '123e4567-e89b-12d3-a456-426614174003';

UPDATE customers SET
    last_visit = '2025-07-15 11:45:00+00',
    last_treatment = '2025-07-15 11:45:00+00'
WHERE id = '123e4567-e89b-12d3-a456-426614174004';

-- Cliente inativo (última visita há muito tempo)
UPDATE customers SET
    last_visit = '2024-01-30 11:20:00+00',
    last_treatment = '2024-01-30 11:20:00+00'
WHERE id = '123e4567-e89b-12d3-a456-426614174005';
