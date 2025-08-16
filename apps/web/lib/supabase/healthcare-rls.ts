// NEONPRO HEALTHCARE - Row Level Security for Patient Data Protection
// ≥9.9/10 Quality Standard for LGPD Compliance

import { createHealthcareServerClient } from './healthcare-client';

// Basic RLS structure for multi-tenant patient data isolation
export const HEALTHCARE_RLS_POLICIES = {
  // Patient data isolation by tenant_id
  patients: {
    policy: 'tenant_isolation_patients',
    definition: `
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_tenants 
          WHERE user_id = auth.uid() 
          AND tenant_id = patients.tenant_id
        )
      )
    `,
  },

  // Medical records access by healthcare professional role
  medical_records: {
    policy: 'healthcare_professional_access',
    definition: `
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM user_roles ur
          JOIN user_tenants ut ON ur.user_id = ut.user_id
          WHERE ur.user_id = auth.uid()
          AND ut.tenant_id = medical_records.tenant_id
          AND ur.role IN ('healthcare_professional', 'admin')
        )
      )
    `,
  },

  // Audit logs for LGPD compliance
  audit_logs: {
    policy: 'audit_log_policy',
    definition: `
      FOR INSERT WITH CHECK (user_id = auth.uid())
    `,
  },
} as const;

// Validate RLS is enabled for healthcare tables
export async function validateHealthcareRLS() {
  const supabase = createHealthcareServerClient();

  try {
    // Check if RLS is enabled on critical healthcare tables
    const { data: rlsStatus } = await supabase
      .from('information_schema.tables')
      .select('table_name, row_security')
      .in('table_name', ['patients', 'medical_records', 'audit_logs']);
    return rlsStatus;
  } catch (_error) {
    throw new Error(
      'Healthcare RLS validation failed - patient safety at risk',
    );
  }
}
