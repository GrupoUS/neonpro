/**
 * Row Level Security (RLS) Policies for NeonPro RBAC
 * Story 1.2: Role-Based Access Control Implementation
 *
 * This module contains SQL policies for Supabase RLS integration
 */

/**
 * RLS Policy Definitions for NeonPro Tables
 * These policies enforce role-based access at the database level
 */

export const RLS_POLICIES = {
  // Users table policies
  users: {
    // Users can read their own profile and clinic members (if manager+)
    select: `
      CREATE POLICY "users_select_policy" ON users
      FOR SELECT USING (
        auth.uid() = id OR
        (
          auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND
          clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
        )
      );
    `,

    // Only owners and managers can insert new users
    insert: `
      CREATE POLICY "users_insert_policy" ON users
      FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
      );
    `,

    // Users can update their own profile, managers can update clinic users
    update: `
      CREATE POLICY "users_update_policy" ON users
      FOR UPDATE USING (
        auth.uid() = id OR
        (
          auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND
          clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
        )
      );
    `,

    // Only owners can delete users
    delete: `
      CREATE POLICY "users_delete_policy" ON users
      FOR DELETE USING (
        auth.jwt() ->> 'role' = 'owner' AND
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
      );
    `,
  },

  // Patients table policies
  patients: {
    // Staff+ can read patients from their clinic
    select: `
      CREATE POLICY "patients_select_policy" ON patients
      FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('owner', 'manager', 'staff', 'admin') AND
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
      );
    `,

    // Staff+ can create patients in their clinic
    insert: `
      CREATE POLICY "patients_insert_policy" ON patients
      FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' IN ('owner', 'manager', 'staff', 'admin') AND
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
      );
    `,

    // Staff+ can update patients in their clinic
    update: `
      CREATE POLICY "patients_update_policy" ON patients
      FOR UPDATE USING (
        auth.jwt() ->> 'role' IN ('owner', 'manager', 'staff', 'admin') AND
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
      );
    `,

    // Only managers+ can delete patients
    delete: `
      CREATE POLICY "patients_delete_policy" ON patients
      FOR DELETE USING (
        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
      );
    `,
  },

  // Appointments table policies
  appointments: {
    // Staff can see their own appointments, managers+ see all clinic appointments
    select: `
      CREATE POLICY "appointments_select_policy" ON appointments
      FOR SELECT USING (
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid AND
        (
          auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') OR
          (
            auth.jwt() ->> 'role' = 'staff' AND
            staff_id = auth.uid()
          )
        )
      );
    `,

    // Staff+ can create appointments in their clinic
    insert: `
      CREATE POLICY "appointments_insert_policy" ON appointments
      FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' IN ('owner', 'manager', 'staff', 'admin') AND
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
      );
    `,

    // Staff can update their own appointments, managers+ can update all
    update: `
      CREATE POLICY "appointments_update_policy" ON appointments
      FOR UPDATE USING (
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid AND
        (
          auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') OR
          (
            auth.jwt() ->> 'role' = 'staff' AND
            staff_id = auth.uid()
          )
        )
      );
    `,

    // Managers+ can delete appointments
    delete: `
      CREATE POLICY "appointments_delete_policy" ON appointments
      FOR DELETE USING (
        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
      );
    `,
  },

  // Billing table policies (financial data)
  billing: {
    // Only managers+ can access billing data
    select: `
      CREATE POLICY "billing_select_policy" ON billing
      FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
      );
    `,

    insert: `
      CREATE POLICY "billing_insert_policy" ON billing
      FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
      );
    `,

    update: `
      CREATE POLICY "billing_update_policy" ON billing
      FOR UPDATE USING (
        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
      );
    `,

    // Only owners can delete billing records
    delete: `
      CREATE POLICY "billing_delete_policy" ON billing
      FOR DELETE USING (
        auth.jwt() ->> 'role' = 'owner' AND
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
      );
    `,
  },

  // Payments table policies
  payments: {
    // Only managers+ can access payment data
    select: `
      CREATE POLICY "payments_select_policy" ON payments
      FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
      );
    `,

    insert: `
      CREATE POLICY "payments_insert_policy" ON payments
      FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
      );
    `,

    update: `
      CREATE POLICY "payments_update_policy" ON payments
      FOR UPDATE USING (
        auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
      );
    `,

    delete: `
      CREATE POLICY "payments_delete_policy" ON payments
      FOR DELETE USING (
        auth.jwt() ->> 'role' = 'owner' AND
        clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
      );
    `,
  },

  // Clinics table policies
  clinics: {
    // Users can only see their own clinic
    select: `
      CREATE POLICY "clinics_select_policy" ON clinics
      FOR SELECT USING (
        id = (auth.jwt() ->> 'clinic_id')::uuid OR
        auth.jwt() ->> 'role' = 'admin'
      );
    `,

    // Only admins can create new clinics
    insert: `
      CREATE POLICY "clinics_insert_policy" ON clinics
      FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
      );
    `,

    // Only owners and admins can update clinic info
    update: `
      CREATE POLICY "clinics_update_policy" ON clinics
      FOR UPDATE USING (
        (
          auth.jwt() ->> 'role' = 'owner' AND
          id = (auth.jwt() ->> 'clinic_id')::uuid
        ) OR
        auth.jwt() ->> 'role' = 'admin'
      );
    `,

    // Only admins can delete clinics
    delete: `
      CREATE POLICY "clinics_delete_policy" ON clinics
      FOR DELETE USING (
        auth.jwt() ->> 'role' = 'admin'
      );
    `,
  },

  // Permission audit log policies
  permission_audit_log: {
    // Users can only see their own audit logs, managers+ see clinic logs
    select: `
      CREATE POLICY "audit_log_select_policy" ON permission_audit_log
      FOR SELECT USING (
        user_id = auth.uid() OR
        (
          auth.jwt() ->> 'role' IN ('owner', 'manager', 'admin') AND
          clinic_id = (auth.jwt() ->> 'clinic_id')::uuid
        )
      );
    `,

    // System can insert audit logs
    insert: `
      CREATE POLICY "audit_log_insert_policy" ON permission_audit_log
      FOR INSERT WITH CHECK (true);
    `,

    // No updates allowed on audit logs
    update: `
      CREATE POLICY "audit_log_update_policy" ON permission_audit_log
      FOR UPDATE USING (false);
    `,

    // Only admins can delete audit logs (for cleanup)
    delete: `
      CREATE POLICY "audit_log_delete_policy" ON permission_audit_log
      FOR DELETE USING (
        auth.jwt() ->> 'role' = 'admin'
      );
    `,
  },
};

/**
 * Function to enable RLS on all tables
 */
export const ENABLE_RLS_COMMANDS = [
  "ALTER TABLE users ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE patients ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE billing ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE payments ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;",
  "ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;",
];

/**
 * Function to create all RLS policies
 */
export function generateAllPolicies(): string[] {
  const policies: string[] = [];

  // Add enable RLS commands
  policies.push(...ENABLE_RLS_COMMANDS);

  // Add all table policies
  Object.entries(RLS_POLICIES).forEach(([table, tablePolicies]) => {
    Object.entries(tablePolicies).forEach(([operation, policy]) => {
      policies.push(policy);
    });
  });

  return policies;
}

/**
 * Function to drop all existing policies (for reset)
 */
export const DROP_POLICIES_COMMANDS = [
  // Users policies
  'DROP POLICY IF EXISTS "users_select_policy" ON users;',
  'DROP POLICY IF EXISTS "users_insert_policy" ON users;',
  'DROP POLICY IF EXISTS "users_update_policy" ON users;',
  'DROP POLICY IF EXISTS "users_delete_policy" ON users;',

  // Patients policies
  'DROP POLICY IF EXISTS "patients_select_policy" ON patients;',
  'DROP POLICY IF EXISTS "patients_insert_policy" ON patients;',
  'DROP POLICY IF EXISTS "patients_update_policy" ON patients;',
  'DROP POLICY IF EXISTS "patients_delete_policy" ON patients;',

  // Appointments policies
  'DROP POLICY IF EXISTS "appointments_select_policy" ON appointments;',
  'DROP POLICY IF EXISTS "appointments_insert_policy" ON appointments;',
  'DROP POLICY IF EXISTS "appointments_update_policy" ON appointments;',
  'DROP POLICY IF EXISTS "appointments_delete_policy" ON appointments;',

  // Billing policies
  'DROP POLICY IF EXISTS "billing_select_policy" ON billing;',
  'DROP POLICY IF EXISTS "billing_insert_policy" ON billing;',
  'DROP POLICY IF EXISTS "billing_update_policy" ON billing;',
  'DROP POLICY IF EXISTS "billing_delete_policy" ON billing;',

  // Payments policies
  'DROP POLICY IF EXISTS "payments_select_policy" ON payments;',
  'DROP POLICY IF EXISTS "payments_insert_policy" ON payments;',
  'DROP POLICY IF EXISTS "payments_update_policy" ON payments;',
  'DROP POLICY IF EXISTS "payments_delete_policy" ON payments;',

  // Clinics policies
  'DROP POLICY IF EXISTS "clinics_select_policy" ON clinics;',
  'DROP POLICY IF EXISTS "clinics_insert_policy" ON clinics;',
  'DROP POLICY IF EXISTS "clinics_update_policy" ON clinics;',
  'DROP POLICY IF EXISTS "clinics_delete_policy" ON clinics;',

  // Audit log policies
  'DROP POLICY IF EXISTS "audit_log_select_policy" ON permission_audit_log;',
  'DROP POLICY IF EXISTS "audit_log_insert_policy" ON permission_audit_log;',
  'DROP POLICY IF EXISTS "audit_log_update_policy" ON permission_audit_log;',
  'DROP POLICY IF EXISTS "audit_log_delete_policy" ON permission_audit_log;',
];

/**
 * Helper function to create a complete RLS setup script
 */
export function createRLSSetupScript(): string {
  const script = [
    "-- NeonPro RBAC Row Level Security Setup",
    "-- Generated automatically - do not edit manually",
    "",
    "-- Drop existing policies",
    ...DROP_POLICIES_COMMANDS,
    "",
    "-- Enable RLS on all tables",
    ...ENABLE_RLS_COMMANDS,
    "",
    "-- Create new policies",
    ...generateAllPolicies().slice(ENABLE_RLS_COMMANDS.length), // Skip enable commands as they're already added
    "",
    "-- Grant necessary permissions",
    "GRANT USAGE ON SCHEMA public TO authenticated;",
    "GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;",
    "GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;",
    "",
  ];

  return script.join("\n");
}
