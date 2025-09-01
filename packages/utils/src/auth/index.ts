/**
 * @file Healthcare Authentication Utilities
 * RBAC and Supabase authentication helpers for NeonPro Healthcare
 *
 * @see LGPD + ANVISA + CFM compliance requirements
 * @deprecated Auth utilities have been consolidated into @neonpro/shared/auth
 * @migration Use `import { HealthcareRBAC, HealthcareAuth } from "@neonpro/shared/auth"` instead
 */

// Auth utilities have been moved to @neonpro/shared/auth for better consolidation
// This file is kept for backward compatibility but will be removed in future versions
export {
  type AuthConfig,
  createSupabaseAdminClient,
  createSupabaseClient,
  HealthcareAuth,
  HealthcareRBAC,
  type HealthcareUser,
  type Permission,
  type Role,
} from "@neonpro/shared/auth";
