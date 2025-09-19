# Supabase Security & RLS Remediation

Scope: Address advisor findings (mutable search_path functions, FK index gaps, permissive RLS, potential SECURITY DEFINER) while preserving behavior. This iteration focuses on search_path hardening and FK index coverage; RLS consolidation will follow a dedicated policy review.

## Advisors Summary (main project)
- Functions with mutable search_path → risk of function shadowing.
- Multiple unindexed foreign keys across high-traffic tables (patients, medical_records, appointments, audit_logs, profiles, payment_transactions).
- RLS: multiple permissive/overlapping policies (requires review).
- Views flagged for SECURITY DEFINER – verified currently not SECURITY DEFINER.

## Changes in this iteration
1. Function search_path hardening
   - Set search_path to `pg_catalog, public` for critical functions:
     - check_emergency_access_expiration, current_user_is_admin, disable_emergency_access, enable_emergency_access, enforce_patient_documents_update_columns, get_patient_stats, get_service_templates_with_items, get_services_by_professional, move_services_to_category, reorder_service_categories, set_lgpd_clinic_context, set_updated_at_timestamp, update_professional_services_updated_at, update_service_templates_updated_at, validate_patient_consent, verify_clinic_access.
2. Add covering indexes for FK columns
   - appointments: patient_id, professional_id, service_type_id
   - audit_logs: clinic_id
   - medical_records: appointment_id, clinic_id, patient_id, provider_id
   - patients: clinic_id, created_by, updated_by
   - payment_transactions: clinic_id, gateway_id, patient_id, payment_method_id
   - profiles: clinic_id, id, tenant_id

Migration file: `supabase/migrations/20250919T2035_search_path_fk_indexes.sql`

## Validation Plan
- Create Supabase dev branch and apply migration.
- Re-run advisors (security + performance) – expect reduced findings for search_path and FK indexes.
- RLS smoke tests (roles: service_role, authenticated, anon, dashboard_user):
  - SELECT on patients, medical_records, appointments should respect tenant/clinic scoping and user ownership.
  - Ensure no cross-tenant leakage.

## Next Iteration (RLS consolidation)
- Merge overlapping policies into single per-role policies with explicit predicates.
- Replace per-row auth.* calls with `(SELECT auth.*)` subqueries to avoid initplans per row.
- Add USING/WITH CHECK minimizing data (LGPD).

## Rollback Considerations
- search_path changes are reversible via RESET or setting to `public` only.
- Indexes are IF NOT EXISTS; dropping requires `DROP INDEX CONCURRENTLY` in off-peak windows.

## Notes
- No SECURITY DEFINER changes needed now (confirmed not set on flagged views/functions).
- Keep policies changes in a separate migration to allow staged rollout.
