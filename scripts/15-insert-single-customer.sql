-- ========================================
-- NEONPRO CRM TEST DATA - Single Customer
-- Created: 2025-01-28  
-- Purpose: Insert single test customer
-- ========================================

-- Insert single test customer using confirmed existing profile ID
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
  ('62670c99-900e-4e6c-93a8-a101e47d5a0f', '2023-01-15', 15, '2025-01-20', '2025-01-20', 2500.00, true, true, true, true, 'active')
ON CONFLICT (profile_id) DO UPDATE SET
  total_visits = EXCLUDED.total_visits,
  last_visit = EXCLUDED.last_visit,
  lifetime_value = EXCLUDED.lifetime_value,
  updated_at = NOW();

-- Success message
SELECT 'Test customer created successfully! 🎉' as status;
