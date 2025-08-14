-- Migration: Setup RBAC Policies
-- Story 1.2: Role-Based Access Control Implementation
-- Date: 2025-01-27
-- Description: Configure Row Level Security policies for RBAC system

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

DROP POLICY IF EXISTS "patients_select_policy" ON patients;
DROP POLICY IF EXISTS "patients_insert_policy" ON patients;
DROP POLICY IF EXISTS "patients_update_policy" ON patients;
DROP POLICY IF EXISTS "patients_delete_policy" ON patients;

DROP POLICY IF EXISTS "appointments_select_policy" ON appointments;
DROP POLICY IF EXISTS "appointments_insert_policy" ON appointments;
DROP POLICY IF EXISTS "appointments_update_policy" ON appointments;
DROP POLICY IF EXISTS "appointments_delete_policy" ON appointments;

DROP POLICY IF EXISTS "billing_select_policy" ON billing;
DROP POLICY IF EXISTS "billing_insert_policy" ON billing;
DROP POLICY IF EXISTS "billing_update_policy" ON billing;
DROP POLICY IF EXISTS "billing_delete_policy" ON billing;

DROP POLICY IF EXISTS "payments_select_policy" ON payments;
DROP POLICY IF EXISTS "payments_insert_policy" ON payments;
DROP POLICY IF EXISTS "payments_update_policy" ON payments;
DROP POLICY IF EXISTS "payments_delete_policy" ON payments;

DROP POLICY IF EXISTS "clinics_select_policy" ON clinics;
DROP POLICY IF EXISTS "clinics_insert_policy" ON clinics;
DROP POLICY IF EXISTS "clinics_update_policy" ON clinics;
DROP POLICY IF EXISTS "clinics_delete_policy" ON clinics;

DROP POLICY IF EXISTS "audit_select_policy" ON permission_audit_log;
DROP POLICY IF EXISTS "audit_insert_policy" ON permission_audit_log;

-- =============================================================================
-- USERS TABLE POLICIES
-- =============================================================================

-- Users can view their own profile and managers+ can view clinic users
CREATE POLICY "users_select_policy" ON users
  FOR SELECT
  USING (
    auth.uid()::text = id::text OR
    (
      auth.uid() IN (
        SELECT id FROM users 
        WHERE role IN ('owner', 'manager') 
        AND (role = 'owner' OR clinic_id = (
          SELECT clinic_id FROM users WHERE id = auth.uid()
        ))
      )
    )
  );

-- Only owners can create new users
CREATE POLICY "users_insert_policy" ON users
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'owner'
    )
  );

-- Users can update their own profile, managers+ can update clinic users (with restrictions)
CREATE POLICY "users_update_policy" ON users
  FOR UPDATE
  USING (
    auth.uid()::text = id::text OR
    (
      auth.uid() IN (
        SELECT u.id FROM users u
        WHERE u.role IN ('owner', 'manager')
        AND (
          u.role = 'owner' OR 
          (u.clinic_id = clinic_id AND role NOT IN ('owner', 'manager'))
        )
      )
    )
  );

-- Only owners can delete users
CREATE POLICY "users_delete_policy" ON users
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'owner'
    )
  );

-- =============================================================================
-- PATIENTS TABLE POLICIES
-- =============================================================================

-- Patients can view their own data, staff+ can view clinic patients
CREATE POLICY "patients_select_policy" ON patients
  FOR SELECT
  USING (
    auth.uid()::text = user_id::text OR
    (
      auth.uid() IN (
        SELECT id FROM users 
        WHERE role IN ('owner', 'manager', 'staff')
        AND (role = 'owner' OR clinic_id = (
          SELECT clinic_id FROM patients WHERE id = patients.id
        ))
      )
    )
  );

-- Staff+ can create patient records
CREATE POLICY "patients_insert_policy" ON patients
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('owner', 'manager', 'staff')
    )
  );

-- Patients can update their own data, staff+ can update clinic patients
CREATE POLICY "patients_update_policy" ON patients
  FOR UPDATE
  USING (
    auth.uid()::text = user_id::text OR
    (
      auth.uid() IN (
        SELECT u.id FROM users u
        WHERE u.role IN ('owner', 'manager', 'staff')
        AND (u.role = 'owner' OR u.clinic_id = clinic_id)
      )
    )
  );

-- Only managers+ can delete patient records
CREATE POLICY "patients_delete_policy" ON patients
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u
      WHERE u.role IN ('owner', 'manager')
      AND (u.role = 'owner' OR u.clinic_id = clinic_id)
    )
  );

-- =============================================================================
-- APPOINTMENTS TABLE POLICIES
-- =============================================================================

-- Patients can view their appointments, staff+ can view clinic appointments
CREATE POLICY "appointments_select_policy" ON appointments
  FOR SELECT
  USING (
    auth.uid()::text = patient_id::text OR
    (
      auth.uid() IN (
        SELECT id FROM users 
        WHERE role IN ('owner', 'manager', 'staff')
        AND (role = 'owner' OR clinic_id = (
          SELECT clinic_id FROM appointments WHERE id = appointments.id
        ))
      )
    )
  );

-- Staff+ can create appointments
CREATE POLICY "appointments_insert_policy" ON appointments
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('owner', 'manager', 'staff')
    )
  );

-- Patients can update their own appointments, staff+ can update clinic appointments
CREATE POLICY "appointments_update_policy" ON appointments
  FOR UPDATE
  USING (
    auth.uid()::text = patient_id::text OR
    (
      auth.uid() IN (
        SELECT u.id FROM users u
        WHERE u.role IN ('owner', 'manager', 'staff')
        AND (u.role = 'owner' OR u.clinic_id = clinic_id)
      )
    )
  );

-- Staff+ can delete appointments
CREATE POLICY "appointments_delete_policy" ON appointments
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u
      WHERE u.role IN ('owner', 'manager', 'staff')
      AND (u.role = 'owner' OR u.clinic_id = clinic_id)
    )
  );

-- =============================================================================
-- BILLING TABLE POLICIES
-- =============================================================================

-- Patients can view their billing, managers+ can view clinic billing
CREATE POLICY "billing_select_policy" ON billing
  FOR SELECT
  USING (
    auth.uid()::text = patient_id::text OR
    (
      auth.uid() IN (
        SELECT id FROM users 
        WHERE role IN ('owner', 'manager')
        AND (role = 'owner' OR clinic_id = (
          SELECT clinic_id FROM billing WHERE id = billing.id
        ))
      )
    )
  );

-- Only managers+ can create billing records
CREATE POLICY "billing_insert_policy" ON billing
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('owner', 'manager')
    )
  );

-- Only managers+ can update billing records
CREATE POLICY "billing_update_policy" ON billing
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u
      WHERE u.role IN ('owner', 'manager')
      AND (u.role = 'owner' OR u.clinic_id = clinic_id)
    )
  );

-- Only owners can delete billing records
CREATE POLICY "billing_delete_policy" ON billing
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'owner'
    )
  );

-- =============================================================================
-- PAYMENTS TABLE POLICIES
-- =============================================================================

-- Patients can view their payments, managers+ can view clinic payments
CREATE POLICY "payments_select_policy" ON payments
  FOR SELECT
  USING (
    auth.uid()::text = patient_id::text OR
    (
      auth.uid() IN (
        SELECT id FROM users 
        WHERE role IN ('owner', 'manager')
        AND (role = 'owner' OR clinic_id = (
          SELECT clinic_id FROM payments WHERE id = payments.id
        ))
      )
    )
  );

-- Only managers+ can create payment records
CREATE POLICY "payments_insert_policy" ON payments
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('owner', 'manager')
    )
  );

-- Only managers+ can update payment records
CREATE POLICY "payments_update_policy" ON payments
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u
      WHERE u.role IN ('owner', 'manager')
      AND (u.role = 'owner' OR u.clinic_id = clinic_id)
    )
  );

-- Only owners can delete payment records
CREATE POLICY "payments_delete_policy" ON payments
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'owner'
    )
  );

-- =============================================================================
-- CLINICS TABLE POLICIES
-- =============================================================================

-- Users can view their own clinic, owners can view all clinics
CREATE POLICY "clinics_select_policy" ON clinics
  FOR SELECT
  USING (
    id IN (
      SELECT clinic_id FROM users WHERE id = auth.uid()
    ) OR
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'owner'
    )
  );

-- Only owners can create clinics
CREATE POLICY "clinics_insert_policy" ON clinics
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'owner'
    )
  );

-- Clinic owners and managers can update their clinic
CREATE POLICY "clinics_update_policy" ON clinics
  FOR UPDATE
  USING (
    id IN (
      SELECT clinic_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- Only owners can delete clinics
CREATE POLICY "clinics_delete_policy" ON clinics
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'owner'
    )
  );

-- =============================================================================
-- PERMISSION AUDIT LOG POLICIES
-- =============================================================================

-- Managers+ can view audit logs for their clinic
CREATE POLICY "audit_select_policy" ON permission_audit_log
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE role IN ('owner', 'manager')
      AND (
        role = 'owner' OR 
        clinic_id = (
          SELECT clinic_id FROM users WHERE id = permission_audit_log.user_id
        )
      )
    )
  );

-- All authenticated users can insert audit logs (system generated)
CREATE POLICY "audit_insert_policy" ON permission_audit_log
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- =============================================================================
-- FUNCTIONS FOR RBAC SUPPORT
-- =============================================================================

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION has_role(required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = required_role
  );
END;
$$;

-- Function to check if user has minimum role level
CREATE OR REPLACE FUNCTION has_minimum_role(required_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
  role_levels jsonb := '{
    "patient": 1,
    "staff": 2,
    "manager": 3,
    "owner": 4
  }';
BEGIN
  SELECT role INTO user_role FROM users WHERE id = auth.uid();
  
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN (role_levels->>user_role)::int >= (role_levels->>required_role)::int;
END;
$$;

-- Function to get user's clinic ID
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  clinic_id uuid;
BEGIN
  SELECT u.clinic_id INTO clinic_id FROM users u WHERE u.id = auth.uid();
  RETURN clinic_id;
END;
$$;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Indexes for RLS policy performance
CREATE INDEX IF NOT EXISTS idx_users_role_clinic ON users(role, clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_user ON patients(clinic_id, user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_patient ON appointments(clinic_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_billing_clinic_patient ON billing(clinic_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_clinic_patient ON payments(clinic_id, patient_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_created ON permission_audit_log(user_id, created_at);

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant usage on functions to authenticated users
GRANT EXECUTE ON FUNCTION has_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION has_minimum_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_clinic_id() TO authenticated;

-- Grant access to tables for authenticated users (RLS will control access)
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON patients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON appointments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON billing TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON clinics TO authenticated;
GRANT SELECT, INSERT ON permission_audit_log TO authenticated;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'patients', 'appointments', 'billing', 'payments', 'clinics', 'permission_audit_log');

-- Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Migration completed successfully
SELECT 'RBAC RLS Policies migration completed successfully' as status;