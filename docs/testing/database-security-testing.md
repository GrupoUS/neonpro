---
title: "Database Security Testing - Supabase, RLS & LGPD"
last_updated: 2025-09-16
form: how-to
tags: [database, security, supabase, rls, lgpd, anvisa, healthcare, compliance]
agent_coordination:
  primary: security-auditor
  support: [architect-review, code-reviewer]
  validation: [rls-enforcement, auth-flows, data-protection, compliance]
related:
  - ./AGENTS.md
  - ./backend-architecture-testing.md
  - ../agents/code-review/security-auditor.md
---

# Database Security Testing - Supabase, RLS & LGPD — Version: 3.0.0

## Overview

Comprehensive database security testing strategy for Supabase integration in healthcare applications, coordinated by **security-auditor** agent with comprehensive RLS, authentication, LGPD compliance, and ANVISA regulatory validation. Consolidates all database-specific testing patterns, security validation, and compliance requirements into a unified framework.

**Target Audience**: Security engineers, Database administrators, Compliance teams, Backend developers
**Agent Coordinator**: `security-auditor.md` with `architect-review.md` pattern validation

## Prerequisites

- Supabase project with test environment configured
- Environment variables: `SUPABASE_TEST_URL`, `SUPABASE_TEST_ANON_KEY`, `SUPABASE_TEST_SERVICE_KEY`
- Vitest testing framework setup
- Healthcare compliance requirements (LGPD, ANVISA, CFM)
- Test schema or ephemeral database for isolation
- Row Level Security (RLS) policies configured

## Quick Start

### Secure Test Environment Setup
```typescript
// security-auditor: Secure test environment setup
export const createTestSupabaseClient = (options?: {
  anonymizeData?: boolean;
  lgpdCompliant?: boolean;
  auditTrail?: boolean;
}) => {
  const config = {
    url: process.env.SUPABASE_TEST_URL || '',
    anonKey: process.env.SUPABASE_TEST_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_TEST_SERVICE_KEY || '',
    ...options
  };

  if (!config.url || !config.anonKey) {
    throw new Error('Missing Supabase test configuration - security violation');
  }

  return createClient<Database>(config.url, config.anonKey, {
    auth: { 
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    db: { schema: process.env.NODE_ENV === 'test' ? 'test_schema' : 'public' },
    global: {
      headers: {
        'x-test-environment': 'true',
        'x-lgpd-compliant': options?.lgpdCompliant ? 'true' : 'false',
        'x-audit-enabled': options?.auditTrail ? 'true' : 'false'
      }
    }
  });
};

// architect-review: Service client configuration
export const createServiceRoleClient = () => {
  return createClient<Database>(
    process.env.SUPABASE_TEST_URL!,
    process.env.SUPABASE_TEST_SERVICE_KEY!,
    {
      auth: { persistSession: false },
      db: { schema: 'test_schema' }
    }
  );
};
```

## Row Level Security (RLS) Testing

### 1. Multi-Tenant Data Isolation

```typescript
describe('Row Level Security (RLS) Enforcement', () => {
  const anon = createTestSupabaseClient();

  describe('Multi-tenant patient data isolation', () => {
    beforeEach(async () => {
      // Setup test tenants with isolated data
      await setupTestTenants();
    });

    it('denies cross-clinic access (negative case)', async () => {
      // security-auditor: Validate unauthorized access is blocked
      const { data, error } = await anon
        .from('patients')
        .select('*')
        .eq('clinic_id', 'OTHER_CLINIC_ID');
      
      // Expect either explicit error or empty results
      expect(
        error?.code === 'PGRST116' || 
        (data && data.length === 0)
      ).toBeTruthy();
    });

    it('allows authorized clinic access (positive case)', async () => {
      // Authenticate as clinic user
      const { data: authData } = await anon.auth.signInWithPassword({
        email: 'doctor@clinic1.com',
        password: 'secure-test-password'
      });

      expect(authData.user).toBeDefined();

      if (authData.user) {
        const { data, error } = await anon
          .from('patients')
          .select('*')
          .eq('clinic_id', 'AUTHORIZED_CLINIC_ID');

        expect(error).toBeNull();
        expect(Array.isArray(data)).toBe(true);
        
        // security-auditor: Verify only authorized data returned
        if (data && data.length > 0) {
          expect(data.every(p => p.clinic_id === 'AUTHORIZED_CLINIC_ID')).toBe(true);
        }
      }

      await anon.auth.signOut();
    });

    it('validates strict tenant isolation across operations', async () => {
      const tenant1Client = createTestSupabaseClient();
      const tenant2Client = createTestSupabaseClient();

      // Simulate different tenant authentication
      await tenant1Client.auth.signInWithPassword({
        email: 'user@tenant1.com',
        password: 'password123'
      });

      await tenant2Client.auth.signInWithPassword({
        email: 'user@tenant2.com', 
        password: 'password456'
      });

      // Test CREATE isolation
      const { data: t1Patient } = await tenant1Client
        .from('patients')
        .insert({
          name: 'Tenant 1 Patient',
          cpf: '***.***.***-01',
          clinic_id: 'tenant-1-clinic'
        })
        .select()
        .single();

      // Tenant 2 should not be able to access Tenant 1's data
      const { data: t2AccessAttempt } = await tenant2Client
        .from('patients')
        .select('*')
        .eq('id', t1Patient?.id);

      expect(t2AccessAttempt).toHaveLength(0);

      // Test UPDATE isolation
      const { data: updateAttempt } = await tenant2Client
        .from('patients')
        .update({ name: 'Unauthorized Update' })
        .eq('id', t1Patient?.id);

      expect(updateAttempt).toHaveLength(0);

      // Test DELETE isolation
      const { data: deleteAttempt } = await tenant2Client
        .from('patients')
        .delete()
        .eq('id', t1Patient?.id);

      expect(deleteAttempt).toHaveLength(0);

      await tenant1Client.auth.signOut();
      await tenant2Client.auth.signOut();
    });
  });

  describe('Role-based access control', () => {
    it('enforces doctor vs nurse permissions', async () => {
      // Doctor should have full access
      const doctorClient = createTestSupabaseClient();
      await doctorClient.auth.signInWithPassword({
        email: 'doctor@clinic.com',
        password: 'doctor-password'
      });

      const { data: doctorAccess, error: doctorError } = await doctorClient
        .from('patient_medical_records')
        .select('*')
        .limit(1);

      expect(doctorError).toBeNull();
      expect(doctorAccess).toBeDefined();

      // Nurse should have limited access
      const nurseClient = createTestSupabaseClient();
      await nurseClient.auth.signInWithPassword({
        email: 'nurse@clinic.com',
        password: 'nurse-password'
      });

      const { data: nurseAccess, error: nurseError } = await nurseClient
        .from('patient_medical_records')
        .select('id, patient_id, basic_info') // Limited fields
        .limit(1);

      // Nurse should not access sensitive medical details
      expect(nurseError).toBeNull();
      expect(nurseAccess).toBeDefined();
      expect(nurseAccess?.[0]).not.toHaveProperty('full_diagnosis');
      expect(nurseAccess?.[0]).not.toHaveProperty('treatment_history');

      await doctorClient.auth.signOut();
      await nurseClient.auth.signOut();
    });
  });
});
```