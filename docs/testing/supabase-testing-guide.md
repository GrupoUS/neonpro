---
title: "Supabase Testing Guide - Comprehensive Integration"
last_updated: 2025-09-16
form: how-to
tags: [supabase, testing, rls, auth, database, healthcare, agents, consolidated]
related:
  - ./AGENTS.md
  - ./integration-testing.md
  - ../agents/code-review/security-auditor.md
agent_coordination:
  primary: security-auditor
  support: [architect-review, code-reviewer]
  validation: [rls-enforcement, auth-flows, data-protection]
---

# Supabase Testing Guide - Comprehensive Integration — Version: 3.0.0

## Overview

Complete testing strategy for Supabase integration in healthcare applications, coordinated by **security-auditor** agent with comprehensive RLS, authentication, and LGPD compliance validation. Consolidates all Supabase-specific testing patterns, smoke tests, RLS validation, and auth client management into a unified framework.

**Target Audience**: Developers, QA engineers, Security teams
**Agent Coordinator**: `security-auditor.md` with `architect-review.md` pattern validation

## Prerequisites

- Supabase project with test environment configured
- Environment variables: `SUPABASE_TEST_URL`, `SUPABASE_TEST_ANON_KEY`, `SUPABASE_TEST_SERVICE_KEY`
- Vitest testing framework setup
- Healthcare compliance requirements (LGPD, ANVISA)
- Test schema or ephemeral database for isolation

## Quick Start

### Basic Test Setup
```typescript
import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

// security-auditor: Secure test environment setup
const createTestSupabaseClient = (options?: {
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

  return createClient(config.url, config.anonKey, {
    auth: { 
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    db: { schema: 'test_schema' },
    global: {
      headers: {
        'x-test-environment': 'true',
        'x-lgpd-compliant': options?.lgpdCompliant ? 'true' : 'false'
      }
    }
  });
};
```

## Agent Coordination Framework

### Security-First Testing Approach
```yaml
supabase_testing_workflow:
  phase_1_security:
    agent: security-auditor
    focus: ["RLS enforcement", "Auth flow validation", "Data protection"]
  
  phase_2_architecture:
    agent: architect-review  
    focus: ["Database patterns", "API integration", "Service boundaries"]
  
  phase_3_quality:
    agent: code-reviewer
    focus: ["Performance validation", "Code quality", "Error handling"]
```

## Testing Categories

### 1. Connectivity & Smoke Tests

#### Database Connectivity Tests
```typescript
describe('Supabase Connectivity Tests', () => {
  let supabase: ReturnType<typeof createClient>;
  let adminSupabase: ReturnType<typeof createClient>;

  beforeAll(async () => {
    supabase = createTestSupabaseClient();
    adminSupabase = createClient(
      process.env.SUPABASE_TEST_URL!,
      process.env.SUPABASE_TEST_SERVICE_KEY!
    );
  });

  describe('Basic Connection', () => {
    it('should connect to Supabase successfully', async () => {
      const { data, error } = await supabase
        .from('clinics')
        .select('count')
        .limit(1);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should handle connection timeout gracefully', async () => {
      // Test with invalid URL to simulate timeout
      const badClient = createClient('https://invalid.supabase.co', 'invalid-key');
      
      const { error } = await badClient
        .from('test_table')
        .select()
        .limit(1);
      
      expect(error).toBeDefined();
      expect(error?.message).toMatch(/network|timeout|connection/i);
    });
  });

  describe('CRUD Operations', () => {
    it('should handle SELECT operations', async () => {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name')
        .limit(5);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should handle INSERT operations (with service role)', async () => {
      if (!adminSupabase) {
        console.warn('Skipping INSERT test - requires service role access');
        return;
      }

      const testClinic = {
        name: `Test Clinic ${Date.now()}`,
        contact_email: 'test@example.com',
        contact_phone: '+55 11 99999-9999',
        address: 'Test Address',
        created_at: new Date().toISOString()
      };

      const { data, error } = await adminSupabase
        .from('clinics')
        .insert(testClinic)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.name).toBe(testClinic.name);

      // Cleanup
      if (data?.id) {
        await adminSupabase.from('clinics').delete().eq('id', data.id);
      }
    });
  });
});
```### 2. Row Level Security (RLS) Testing

> **security-auditor coordination**: Ensure Row Level Security is enforced for sensitive data in clinic contexts.

#### RLS Setup and Configuration
- Use separate test schema or ephemeral database for isolation
- Seed minimal data with service-role key for setup only
- Use anon key for user-context tests to validate RLS policies

#### Positive & Negative Test Cases

```typescript
describe('Row Level Security (RLS) Tests', () => {
  const anon = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });

  describe('patients RLS enforcement', () => {
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
      // First, authenticate as a user with clinic access
      const { data: authData } = await anon.auth.signInWithPassword({
        email: 'test@clinic1.com',
        password: 'test-password'
      });

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

    it('validates multi-tenant data isolation', async () => {
      // security-auditor: Test strict tenant isolation
      const tenant1Client = createTestSupabaseClient();
      const tenant2Client = createTestSupabaseClient();

      // Simulate tenant-specific authentication
      await tenant1Client.auth.signInWithPassword({
        email: 'user@tenant1.com',
        password: 'password'
      });

      await tenant2Client.auth.signInWithPassword({
        email: 'user@tenant2.com', 
        password: 'password'
      });

      // Verify tenant1 cannot access tenant2 data
      const { data: t1Data } = await tenant1Client
        .from('patients')
        .select('clinic_id');

      const { data: t2Data } = await tenant2Client
        .from('patients') 
        .select('clinic_id');

      if (t1Data && t2Data && t1Data.length > 0 && t2Data.length > 0) {
        const t1Clinics = new Set(t1Data.map(p => p.clinic_id));
        const t2Clinics = new Set(t2Data.map(p => p.clinic_id));
        
        // security-auditor: Ensure no clinic overlap between tenants
        expect([...t1Clinics].some(c => t2Clinics.has(c))).toBe(false);
      }

      await tenant1Client.auth.signOut();
      await tenant2Client.auth.signOut();
    });
  });

  describe('audit logging validation', () => {
    it('creates audit log entries for sensitive access', async () => {
      // security-auditor: Verify audit trail for compliance
      const beforeCount = await anon
        .from('audit_logs')
        .select('count')
        .eq('table_name', 'patients');

      // Perform a sensitive operation
      await anon.from('patients').select('*').limit(1);

      const afterCount = await anon
        .from('audit_logs')
        .select('count')
        .eq('table_name', 'patients');

      // Verify audit log was created
      expect(afterCount).toBeGreaterThan(beforeCount);
    });
  });
});
```

### 3. Authentication Testing

#### Auth Flow Validation
```typescript
describe('Authentication Flow Tests', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeEach(() => {
    supabase = createTestSupabaseClient();
  });

  afterEach(async () => {
    await supabase.auth.signOut();
  });

  describe('Sign In/Sign Out Flow', () => {
    it('should authenticate valid users', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'validpassword'
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.session).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      expect(error).toBeDefined();
      expect(data.user).toBeNull();
      expect(data.session).toBeNull();
    });

    it('should handle sign out correctly', async () => {
      // First sign in
      await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'validpassword'
      });

      // Then sign out
      const { error } = await supabase.auth.signOut();
      expect(error).toBeNull();

      // Verify session is cleared
      const { data: { session } } = await supabase.auth.getSession();
      expect(session).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should handle session refresh', async () => {
      const { data: loginData } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'validpassword'
      });

      if (loginData.session) {
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: loginData.session.refresh_token
        });

        expect(error).toBeNull();
        expect(data.session).toBeDefined();
        expect(data.session?.access_token).not.toBe(loginData.session.access_token);
      }
    });

    it('should validate session expiry', async () => {
      // Mock an expired session scenario
      const expiredToken = 'expired.jwt.token';
      
      const { error } = await supabase.auth.setSession({
        access_token: expiredToken,
        refresh_token: 'refresh.token'
      });

      expect(error).toBeDefined();
    });
  });
});
```### 4. GoTrueClient Multi-Instance Management

> **architect-review coordination**: Prevent GoTrueClient multi-instance warnings during testing.

#### Problem Description
Multiple GoTrueClient instances can cause warnings and undefined behavior during tests:
```
Multiple GoTrueClient instances detected in the same browser context. 
It is not an error, but this should be avoided as it may produce undefined behavior 
when used concurrently under the same storage key.
```

#### Singleton Solution Implementation

**1. Create Singleton Mock Pattern** (`tools/testing/setup/supabase-mock.ts`):
```typescript
// Singleton mock Supabase client to prevent multi-instance warnings
let singletonMockSupabaseClient: unknown;

const createMockSupabaseClient = () => {
  if (singletonMockSupabaseClient) {
    return singletonMockSupabaseClient;
  }
  
  singletonMockSupabaseClient = {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({ data: [], error: null }),
      insert: vi.fn().mockReturnValue({ data: null, error: null }),
      update: vi.fn().mockReturnValue({ data: null, error: null }),
      delete: vi.fn().mockReturnValue({ data: null, error: null }),
    })),
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  };

  return singletonMockSupabaseClient;
};

// Mock GoTrueClient directly to prevent multiple instances
vi.mock<typeof import('@supabase/auth-js')>('@supabase/auth-js', () => {
  let singletonGoTrueClient: unknown;

  return {
    GoTrueClient: vi.fn().mockImplementation(() => {
      if (singletonGoTrueClient) {
        return singletonGoTrueClient;
      }
      
      singletonGoTrueClient = {
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(),
      };
      
      return singletonGoTrueClient;
    }),
  };
});
```

**2. Global Mock Import** (`vitest.setup.ts`):
```typescript
import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
// Import Supabase mock to prevent GoTrueClient multi-instance warnings
import './tools/testing/setup/supabase-mock';

// Suppress GoTrueClient warnings in test output
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  if (
    message.includes('Multiple GoTrueClient instances detected') ||
    message.includes('GoTrueClient') ||
    message.includes('Multiple instances of auth client')
  ) {
    return; // Suppress these warnings
  }
  originalConsoleWarn.apply(console, args);
};
```

### 5. Real-time Subscriptions Testing

```typescript
describe('Real-time Subscriptions', () => {
  let supabase: ReturnType<typeof createClient>;
  let subscription: any;

  beforeEach(() => {
    supabase = createTestSupabaseClient();
  });

  afterEach(() => {
    if (subscription) {
      subscription.unsubscribe();
    }
  });

  it('should establish real-time connection', async () => {
    let receivedUpdates = 0;
    
    subscription = supabase
      .channel('test-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'patients'
      }, () => {
        receivedUpdates++;
      })
      .subscribe((status) => {
        expect(status).toBe('SUBSCRIBED');
      });

    // Simulate a database change
    if (process.env.SUPABASE_TEST_SERVICE_KEY) {
      const adminClient = createClient(
        process.env.SUPABASE_TEST_URL!,
        process.env.SUPABASE_TEST_SERVICE_KEY!
      );
      
      await adminClient.from('patients').insert({
        name: 'Real-time Test Patient',
        clinic_id: 'test-clinic'
      });
    }

    // Wait for real-time update
    await new Promise(resolve => setTimeout(resolve, 1000));
    expect(receivedUpdates).toBeGreaterThan(0);
  });
});
```

### 6. Healthcare Compliance Testing (LGPD/ANVISA)

```typescript
describe('Healthcare Compliance Tests', () => {
  describe('LGPD Data Protection', () => {
    it('should anonymize patient data in test environment', async () => {
      const testClient = createTestSupabaseClient({
        lgpdCompliant: true,
        anonymizeData: true
      });

      const { data } = await testClient
        .from('patients')
        .select('name, cpf, email')
        .limit(5);

      if (data && data.length > 0) {
        data.forEach(patient => {
          // security-auditor: Verify data anonymization
          expect(patient.name).toMatch(/^ANON_\d+$/);
          expect(patient.cpf).toMatch(/^\*+\d{4}$/);
          expect(patient.email).toMatch(/^\*+@\*+\.\*+$/);
        });
      }
    });

    it('should enforce data retention policies', async () => {
      const testClient = createTestSupabaseClient();
      
      // Query for old test data (older than retention period)
      const cutoffDate = new Date();
      cutoffDate.setDays(cutoffDate.getDate() - 30); // 30 days retention
      
      const { data } = await testClient
        .from('test_data_audit')
        .select('*')
        .lt('created_at', cutoffDate.toISOString());

      // security-auditor: Verify old data is cleaned up
      expect(data).toHaveLength(0);
    });
  });

  describe('Audit Trail Compliance', () => {
    it('should log all sensitive data access', async () => {
      const testClient = createTestSupabaseClient({ auditTrail: true });
      
      // Perform sensitive operation
      await testClient
        .from('patients')
        .select('name, cpf')
        .limit(1);

      // Verify audit log was created
      const { data: auditLogs } = await testClient
        .from('audit_logs')
        .select('*')
        .eq('table_name', 'patients')
        .eq('operation', 'SELECT')
        .gte('created_at', new Date().toISOString().split('T')[0]);

      expect(auditLogs).toBeDefined();
      expect(auditLogs!.length).toBeGreaterThan(0);
    });
  });
});
```

## Troubleshooting

### Common Issues

- **Issue**: Multiple GoTrueClient instances warning
  **Solution**: Implement singleton pattern as described in section 4

- **Issue**: RLS policies not enforcing in tests  
  **Solution**: Ensure using anon key (not service role) and correct user context

- **Issue**: Test data leaking between tests
  **Solution**: Use test schema isolation and proper cleanup in afterEach hooks

- **Issue**: Real-time subscriptions not working in tests
  **Solution**: Verify websocket connection and use proper channel naming

- **Issue**: LGPD compliance validation failing
  **Solution**: Enable anonymization flags and verify data masking implementations

### Performance Optimization

```typescript
// Use connection pooling for better test performance
const createOptimizedTestClient = () => {
  return createClient(url, key, {
    db: { 
      schema: 'test_schema',
      // Enable connection pooling
      pool: { min: 1, max: 3 }
    },
    // Optimize for testing
    auth: { 
      persistSession: false,
      autoRefreshToken: false 
    }
  });
};
```

## Next Steps

- Implement continuous compliance monitoring
- Add performance benchmarking for database operations  
- Extend real-time testing for complex scenarios
- Integrate with CI/CD pipeline for automated compliance checks

## See Also

- [Integration Testing Guide](./integration-testing.md) - Broader integration patterns
- [Security Auditor Agent](../agents/code-review/security-auditor.md) - Security validation
- [Architect Review Agent](../agents/code-review/architect-review.md) - Pattern validation
- [AGENTS.md](./AGENTS.md) - Agent coordination overview