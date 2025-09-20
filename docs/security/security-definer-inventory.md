# SECURITY DEFINER Inventory & Conversion Plan

## Executive Summary

**Status**: 6 SECURITY DEFINER functions identified requiring immediate conversion
**Risk Level**: HIGH - Functions execute with elevated privileges potentially bypassing RLS
**Conversion Target**: Convert to SECURITY INVOKER with explicit permission checks

## Identified SECURITY DEFINER Functions

### 🔴 CRITICAL - AI Audit Functions

**File**: `supabase/migrations/001_ai_chat_audit_tables.sql`

1. **create_audit_log()** (Line 243-262)
   - **Purpose**: Creates audit log entries for all table changes
   - **Risk**: HIGH - Bypasses RLS on audit_logs table
   - **Conversion Strategy**: Convert to SECURITY INVOKER + explicit clinic_id validation

2. **validate_lgpd_consent_for_ai(p_user_id, p_clinic_id)** (Line 296-314)
   - **Purpose**: Validates LGPD consent for AI interactions
   - **Risk**: MEDIUM - Reads consent_records and patients tables
   - **Conversion Strategy**: Convert to SECURITY INVOKER + row-level permissions

3. **sanitize_for_ai(input_text)** (Line 318-334)
   - **Purpose**: Removes PHI from text for AI processing
   - **Risk**: LOW - Pure function, no data access
   - **Conversion Strategy**: Safe to convert to SECURITY INVOKER

### 🔴 CRITICAL - Telemedicine Audit Functions

**File**: `supabase/migrations/002_telemedicine_lgpd_audit.sql`

4. **create_webrtc_audit_log(...)** (Line 150-192)
   - **Purpose**: Creates audit logs for WebRTC telemedicine sessions
   - **Risk**: HIGH - Bypasses RLS on webrtc_audit_logs table
   - **Conversion Strategy**: Convert to SECURITY INVOKER + explicit clinic_id validation

5. **validate_webrtc_consent(...)** (Line 196-231)
   - **Purpose**: Validates consent for WebRTC sessions
   - **Risk**: MEDIUM - Reads consent_records and patient data
   - **Conversion Strategy**: Convert to SECURITY INVOKER + row-level permissions

6. **request_webrtc_consent(...)** (Line 235-266)
   - **Purpose**: Creates consent requests for WebRTC sessions
   - **Risk**: MEDIUM - Inserts into consent_records table
   - **Conversion Strategy**: Convert to SECURITY INVOKER + explicit validation

## Views Requiring Review

**Note**: Supabase advisors mentioned these views, but they were not found in current migration files:

- ml_model_performance
- drift_detection_summary
- ab_test_summary

**Action Required**: Check if these exist in live database or other migration files.

## Conversion Priority Matrix

| Function                     | Risk Level | Conversion Priority | Estimated Effort | Impact                           |
| ---------------------------- | ---------- | ------------------- | ---------------- | -------------------------------- |
| create_audit_log             | CRITICAL   | P0                  | Medium           | High - affects all audit logging |
| create_webrtc_audit_log      | CRITICAL   | P0                  | Medium           | High - telemedicine compliance   |
| validate_lgpd_consent_for_ai | HIGH       | P1                  | Low              | Medium - AI feature access       |
| validate_webrtc_consent      | HIGH       | P1                  | Low              | Medium - telemedicine access     |
| request_webrtc_consent       | MEDIUM     | P2                  | Low              | Low - consent workflow           |
| sanitize_for_ai              | LOW        | P3                  | Low              | Low - pure function              |

## Implementation Plan

### Phase 1: Critical Audit Functions (P0)

1. **create_audit_log()**: Add explicit clinic_id checks and user permission validation
2. **create_webrtc_audit_log()**: Add clinic access validation and role checks

### Phase 2: Consent Validation Functions (P1)

3. **validate_lgpd_consent_for_ai()**: Add user-to-clinic relationship validation
4. **validate_webrtc_consent()**: Add patient access permission checks

### Phase 3: Lower Risk Functions (P2-P3)

5. **request_webrtc_consent()**: Add consent creation permission validation
6. **sanitize_for_ai()**: Simple conversion (no data access)

## Conversion Template

```sql
-- BEFORE (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION example_function()
RETURNS void AS $$
BEGIN
  -- Function logic
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- AFTER (SECURITY INVOKER with explicit checks)
CREATE OR REPLACE FUNCTION example_function()
RETURNS void AS $$
BEGIN
  -- Explicit permission check
  IF NOT (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM professionals p
      WHERE p.user_id = auth.uid()
      AND p.clinic_id = clinic_context()
      AND p.is_active = true
    )
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions for function execution';
  END IF;

  -- Function logic with explicit schema qualification
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
```

## Testing Strategy

1. **Unit Tests**: Verify each converted function maintains functionality
2. **Permission Tests**: Ensure proper access control enforcement
3. **Integration Tests**: Validate audit logging still works correctly
4. **Performance Tests**: Monitor for any performance degradation

## Rollback Plan

- Keep SECURITY DEFINER versions in separate migration
- Test in development branch first
- Monitor for 24h before marking as complete
- Immediate rollback available if issues detected

## Next Steps

1. ✅ Complete inventory (this document)
2. 🔄 Create conversion migration for P0 functions
3. ⏳ Test in development environment
4. ⏳ Execute in production with monitoring
5. ⏳ Validate with security advisors
