-- ========================================
-- NEONPRO CRM TEST DATA - Using Existing Profiles
-- Created: 2025-01-28
-- Purpose: Insert test data using existing profile IDs
-- ========================================

-- Insert test customers using existing profile IDs
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
  ('62670c99-900e-4e6c-93a8-a101e47d5a0f', '2023-01-15', 15, '2025-01-20', '2025-01-20', 2500.00, true, true, true, true, 'active'),
  ('7fdc8f65-4d50-461d-be8f-677b8cc1ba4e', '2023-06-10', 8, '2024-12-15', '2024-12-15', 1200.00, true, false, true, true, 'active'),
  ('9b9d8940-167f-47cb-a65c-57dd5246a700', '2024-03-22', 3, '2024-08-10', '2024-08-10', 450.00, false, true, false, false, 'inactive'),
  ('c1f73124-7246-4163-b70d-2257caef68b4', '2024-11-05', 1, '2024-11-05', '2024-11-05', 180.00, true, true, true, true, 'active'),
  ('d0acbddd-a7d4-4240-8ee0-cb1a65375f2b', '2022-08-30', 25, '2025-01-18', '2025-01-18', 4200.00, true, true, true, true, 'active')
ON CONFLICT (profile_id) DO UPDATE SET
  total_visits = EXCLUDED.total_visits,
  last_visit = EXCLUDED.last_visit,
  lifetime_value = EXCLUDED.lifetime_value,
  updated_at = NOW();

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
