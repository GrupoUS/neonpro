-- ========================================
-- NEONPRO CRM TEST DATA
-- Created: 2025-01-28
-- Purpose: Insert test data for CRM system
-- ========================================

-- Insert test profiles first (if they don't exist)
INSERT INTO profiles (id, name, email, phone, role) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Ana Silva', 'ana.silva@email.com', '(11) 99999-0001', 'paciente_modelo'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Bruno Santos', 'bruno.santos@email.com', '(11) 99999-0002', 'paciente_modelo'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Carla Oliveira', 'carla.oliveira@email.com', '(11) 99999-0003', 'paciente_modelo'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Diego Costa', 'diego.costa@email.com', '(11) 99999-0004', 'paciente_modelo'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Elena Ferreira', 'elena.ferreira@email.com', '(11) 99999-0005', 'paciente_modelo')
ON CONFLICT (id) DO NOTHING;

-- Insert test customers
INSERT INTO customers (
  profile_id, 
  customer_since, 
  total_visits, 
  last_visit, 
  last_treatment, 
  lifetime_value,
  email_opt_in,
  sms_opt_in,
  whatsapp_opt_in,
  marketing_opt_in,
  status
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', '2023-01-15', 15, '2025-01-20', '2025-01-20', 2500.00, true, true, true, true, 'active'),
  ('550e8400-e29b-41d4-a716-446655440002', '2023-06-10', 8, '2024-12-15', '2024-12-15', 1200.00, true, false, true, true, 'active'),
  ('550e8400-e29b-41d4-a716-446655440003', '2024-03-22', 3, '2024-08-10', '2024-08-10', 450.00, false, true, false, false, 'inactive'),
  ('550e8400-e29b-41d4-a716-446655440004', '2024-11-05', 1, '2024-11-05', '2024-11-05', 180.00, true, true, true, true, 'active'),
  ('550e8400-e29b-41d4-a716-446655440005', '2022-08-30', 25, '2025-01-18', '2025-01-18', 4200.00, true, true, true, true, 'active')
ON CONFLICT (profile_id) DO NOTHING;

-- Insert some customer interactions
INSERT INTO customer_interactions (
  customer_id,
  interaction_type,
  interaction_date,
  title,
  description,
  metadata
) SELECT 
  c.id,
  'visit',
  c.last_visit,
  'Consulta de retorno',
  'Cliente retornou para avaliação do tratamento',
  '{"satisfaction": "high", "next_appointment": "2025-02-15"}'
FROM customers c
WHERE c.last_visit IS NOT NULL
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Test data inserted successfully! 🎉' as status;
