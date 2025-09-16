---
title: "Supabase Testing Guide - Comprehensive Integration"
last_updated: 2025-09-16
form: how-to
tags: [supabase, testing, rls, auth, database, healthcare, agents]
related:
  - ./AGENTS.md
  - ./integration-testing.md
  - ../agents/code-review/security-auditor.md
agent_coordination:
  primary: security-auditor
  support: [architect-review, code-reviewer]
  validation: [rls-enforcement, auth-flows, data-protection]
---

# Supabase Testing Guide - Comprehensive Integration — Version: 2.0.0

## Overview

Complete testing strategy for Supabase integration in healthcare applications, coordinated by **security-auditor** agent with comprehensive RLS, authentication, and LGPD compliance validation. Consolidates all Supabase-specific testing patterns into a unified framework.

**Target Audience**: Developers, QA engineers, Security teams
**Agent Coordinator**: `security-auditor.md` with `architect-review.md` pattern validation

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

## Test Environment Setup (Security-Auditor Coordinated)

### Secure Test Configuration
```typescript
// security-auditor: Secure test environment setup
export const createTestSupabaseClient = (options?: {
  anonymizeData?: boolean;
  lgpdCompliant?: boolean;
  auditTrail?: boolean;
}) => {
  const config = {
    url: process.env.SUPABASE_TEST_URL || process.env.VITE_SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_TEST_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
    serviceKey: process.env.SUPABASE_TEST_SERVICE_KEY || '', // For setup only
    ...options
  };

  if (!config.url || !config.anonKey) {
    throw new Error('Missing Supabase test configuration');
  }

  // security-auditor: Ensure test isolation
  return createClient<Database>(config.url, config.anonKey, {
    auth: { 
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    db: {
      schema: process.env.NODE_ENV === 'test' ? 'test_schema' : 'public'
    },
    global: {
      headers: {
        'x-test-environment': 'true',
        'x-lgpd-compliant': options?.lgpdCompliant ? 'true' : 'false'
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

### Test Data Management (LGPD Compliant)
```typescript
// security-auditor: LGPD-compliant test data generation
export class HealthcareTestDataGenerator {
  private serviceClient: SupabaseClient<Database>;
  
  constructor() {
    this.serviceClient = createServiceRoleClient();
  }

  // security-auditor: Synthetic data generation
  async createTestOrganization(): Promise<TestOrganization> {
    const orgData = {
      id: faker.datatype.uuid(),
      name: faker.company.name() + ' - TEST',
      cnpj: generateTestCNPJ(), // Synthetic CNPJ
      created_at: new Date().toISOString(),
      _test_data: true,
      _lgpd_compliant: true
    };

    const { data, error } = await this.serviceClient
      .from('organizations')
      .insert(orgData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // security-auditor: Patient data with anonymization
  async createTestPatient(orgId: string): Promise<TestPatient> {
    const patientData = {
      id: faker.datatype.uuid(),
      organization_id: orgId,
      full_name: faker.name.fullName() + ' - TEST',
      cpf: generateTestCPF(), // Synthetic CPF - not real
      email: faker.internet.email(),
      birth_date: faker.date.birthdate().toISOString(),
      created_at: new Date().toISOString(),
      _test_data: true,
      _synthetic: true,
      _lgpd_safe: true
    };

    const { data, error } = await this.serviceClient
      .from('patients')
      .insert(patientData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // security-auditor: Cleanup test data
  async cleanupTestData(): Promise<void> {
    // Remove all test data marked with _test_data: true
    await Promise.all([
      this.serviceClient.from('patients').delete().eq('_test_data', true),
      this.serviceClient.from('organizations').delete().eq('_test_data', true),
      this.serviceClient.from('consultations').delete().eq('_test_data', true)
    ]);
  }
}
```

## Row Level Security (RLS) Testing (Security-Auditor Primary)

### RLS Policy Validation
```typescript
describe('Supabase RLS - Security Auditor Coordinated', () => {
  let testClient: SupabaseClient<Database>;
  let testDataGenerator: HealthcareTestDataGenerator;
  let testOrg: TestOrganization;
  let testPatient: TestPatient;

  beforeAll(async () => {
    // security-auditor: Initialize secure test environment
    testClient = createTestSupabaseClient({
      lgpdCompliant: true,
      auditTrail: true
    });
    
    testDataGenerator = new HealthcareTestDataGenerator();
    testOrg = await testDataGenerator.createTestOrganization();
    testPatient = await testDataGenerator.createTestPatient(testOrg.id);
  });

  afterAll(async () => {
    // security-auditor: Mandatory cleanup
    await testDataGenerator.cleanupTestData();
  });

  describe('Patient Data RLS Enforcement', () => {
    it('should enforce organization-level data isolation', async () => {
      // security-auditor: Test data isolation
      const { data, error } = await testClient
        .from('patients')
        .select('*')
        .eq('organization_id', testOrg.id);

      expect(error).toBeNull();
      expect(data).toBeInstanceOf(Array);
      
      // security-auditor: Validate data boundaries
      if (data && data.length > 0) {
        data.forEach(patient => {
          expect(patient.organization_id).toBe(testOrg.id);
          expect(patient._test_data).toBe(true);
        });
      }
    });

    it('should deny cross-organization access', async () => {
      // security-auditor: Test unauthorized access prevention
      const { data, error } = await testClient
        .from('patients')
        .select('*')
        .eq('organization_id', 'unauthorized-org-id');

      // Should either return error or empty results
      const isAccessDenied = error?.code === 'PGRST116' || (data && data.length === 0);
      expect(isAccessDenied).toBeTruthy();
    });

    it('should deny access without authentication', async () => {
      // security-auditor: Unauthenticated access test
      const unauthenticatedClient = createClient<Database>(
        process.env.SUPABASE_TEST_URL!,
        process.env.SUPABASE_TEST_ANON_KEY!
      );

      const { data, error } = await unauthenticatedClient
        .from('patients')
        .select('*');

      expect(error).toBeTruthy();
      expect(data).toBeNull();
    });
  });

  describe('Healthcare-Specific RLS Policies', () => {
    it('should enforce doctor-patient relationship access', async () => {
      // security-auditor: Role-based access validation
      const doctorUser = await createTestUser({
        role: 'doctor',
        organization_id: testOrg.id,
        permissions: ['read_patients', 'write_consultations']
      });

      // Authenticate as doctor
      await testClient.auth.signInWithPassword({
        email: doctorUser.email,
        password: doctorUser.password
      });

      const { data, error } = await testClient
        .from('patients')
        .select('*')
        .eq('assigned_doctor_id', doctorUser.id);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should restrict patient access to own records only', async () => {
      // security-auditor: Patient self-access validation
      const patientUser = await createTestUser({
        role: 'patient',
        patient_id: testPatient.id
      });

      await testClient.auth.signInWithPassword({
        email: patientUser.email,
        password: patientUser.password
      });

      const { data, error } = await testClient
        .from('patients')
        .select('*')
        .eq('id', testPatient.id);

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data?.[0].id).toBe(testPatient.id);
    });
  });
});
```

## Authentication Flow Testing (Security-Auditor Coordinated)

### LGPD-Compliant Authentication
```typescript
describe('Supabase Authentication - LGPD Compliant', () => {
  let testClient: SupabaseClient<Database>;

  beforeAll(() => {
    testClient = createTestSupabaseClient({
      lgpdCompliant: true
    });
  });

  describe('User Registration with Consent', () => {
    it('should register user with LGPD consent tracking', async () => {
      const testUserData = {
        email: `test-${Date.now()}@neonpro-test.com`,
        password: 'SecureTestPassword123!',
        userData: {
          full_name: 'João Silva - TEST',
          consent: {
            data_processing: true,
            marketing_communications: false,
            cookies_analytics: true,
            lgpd_acknowledged: true,
            consent_date: new Date().toISOString(),
            consent_version: '2.0',
            ip_address: '127.0.0.1', // Test IP
            user_agent: 'test-agent'
          }
        }
      };

      // security-auditor: Registration with consent validation
      const { data, error } = await testClient.auth.signUp({
        email: testUserData.email,
        password: testUserData.password,
        options: {
          data: testUserData.userData
        }
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.user_metadata).toHaveProperty('consent');
      expect(data.user?.user_metadata.consent.lgpd_acknowledged).toBe(true);
    });

    it('should handle consent withdrawal', async () => {
      // security-auditor: Consent withdrawal process
      const testUser = await createAuthenticatedTestUser();
      
      const consentUpdate = {
        data_processing: false,
        marketing_communications: false,
        withdrawal_date: new Date().toISOString(),
        withdrawal_reason: 'user_request'
      };

      const { data, error } = await testClient.auth.updateUser({
        data: {
          consent: consentUpdate
        }
      });

      expect(error).toBeNull();
      expect(data.user?.user_metadata.consent.data_processing).toBe(false);
    });
  });

  describe('Session Management', () => {
    it('should handle secure session lifecycle', async () => {
      const testUser = await createAuthenticatedTestUser();

      // security-auditor: Session validation
      const { data: session, error } = await testClient.auth.getSession();
      
      expect(error).toBeNull();
      expect(session.session).toBeDefined();
      expect(session.session?.access_token).toBeDefined();

      // Test session expiration handling
      await testClient.auth.signOut();
      
      const { data: postLogoutSession } = await testClient.auth.getSession();
      expect(postLogoutSession.session).toBeNull();
    });

    it('should enforce session security policies', async () => {
      // security-auditor: Session security validation
      const testUser = await createAuthenticatedTestUser();
      
      // Verify JWT claims
      const { data: { user } } = await testClient.auth.getUser();
      
      expect(user).toBeDefined();
      expect(user?.aud).toBe('authenticated');
      expect(user?.role).toBe('authenticated');
    });
  });
});
```

## Database Integration Testing (Architect-Review Coordinated)

### Schema and Migration Testing
```typescript
describe('Supabase Database Integration - Architect Review', () => {
  let serviceClient: SupabaseClient<Database>;

  beforeAll(() => {
    serviceClient = createServiceRoleClient();
  });

  describe('Schema Validation', () => {
    it('should validate healthcare-specific table structures', async () => {
      // architect-review: Schema pattern validation
      const { data: patients, error: patientsError } = await serviceClient
        .from('patients')
        .select('*')
        .limit(1);

      expect(patientsError).toBeNull();
      
      // Validate required healthcare fields
      if (patients && patients.length > 0) {
        const patient = patients[0];
        expect(patient).toHaveProperty('id');
        expect(patient).toHaveProperty('full_name');
        expect(patient).toHaveProperty('cpf');
        expect(patient).toHaveProperty('organization_id');
        expect(patient).toHaveProperty('created_at');
        expect(patient).toHaveProperty('updated_at');
      }
    });

    it('should validate RLS policies are enabled', async () => {
      // architect-review: RLS policy validation
      const { data: policies, error } = await serviceClient
        .rpc('get_rls_policies', { table_name: 'patients' });

      expect(error).toBeNull();
      expect(policies).toBeInstanceOf(Array);
      expect(policies?.length).toBeGreaterThan(0);

      // Validate specific healthcare policies
      const hasOrganizationPolicy = policies?.some(
        policy => policy.policyname?.includes('organization')
      );
      expect(hasOrganizationPolicy).toBe(true);
    });
  });

  describe('Data Integrity and Constraints', () => {
    it('should enforce healthcare data constraints', async () => {
      // architect-review: Data validation patterns
      const invalidPatientData = {
        full_name: '', // Empty name should be rejected
        cpf: '123', // Invalid CPF format
        organization_id: null // Required field
      };

      const { data, error } = await serviceClient
        .from('patients')
        .insert(invalidPatientData);

      expect(error).toBeTruthy();
      expect(data).toBeNull();
    });

    it('should maintain referential integrity', async () => {
      // architect-review: Foreign key validation
      const invalidConsultation = {
        patient_id: 'non-existent-patient-id',
        doctor_id: 'non-existent-doctor-id',
        consultation_date: new Date().toISOString()
      };

      const { data, error } = await serviceClient
        .from('consultations')
        .insert(invalidConsultation);

      expect(error).toBeTruthy();
      expect(error?.code).toMatch(/foreign_key_violation|23503/);
    });
  });
});
```

## Realtime Integration Testing (Code-Reviewer Coordinated)

### Performance and Reliability
```typescript
describe('Supabase Realtime - Performance Validated', () => {
  let testClient: SupabaseClient<Database>;
  let testDataGenerator: HealthcareTestDataGenerator;

  beforeAll(async () => {
    testClient = createTestSupabaseClient();
    testDataGenerator = new HealthcareTestDataGenerator();
  });

  describe('Realtime Subscriptions', () => {
    it('should handle patient updates in real-time', async () => {
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Realtime test timeout'));
        }, 5000);

        // code-reviewer: Performance monitoring
        const startTime = performance.now();
        
        // Subscribe to patient updates
        const subscription = testClient
          .channel('patient-updates')
          .on('postgres_changes', 
            { event: 'UPDATE', schema: 'public', table: 'patients' },
            (payload) => {
              const endTime = performance.now();
              const responseTime = endTime - startTime;

              // code-reviewer: Validate realtime performance
              expect(responseTime).toBeLessThan(1000); // < 1s for realtime
              expect(payload.new).toBeDefined();
              
              clearTimeout(timeout);
              subscription.unsubscribe();
              resolve();
            }
          )
          .subscribe();

        // Trigger an update after subscription is ready
        setTimeout(async () => {
          const testPatient = await testDataGenerator.createTestPatient('test-org');
          
          await testClient
            .from('patients')
            .update({ full_name: 'Updated Name - TEST' })
            .eq('id', testPatient.id);
        }, 100);
      });
    });

    it('should handle connection failures gracefully', async () => {
      // code-reviewer: Error handling validation
      const subscription = testClient
        .channel('test-connection')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'non_existent_table' },
          () => {}
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            expect(true).toBe(true); // Connection successful
          } else if (status === 'CHANNEL_ERROR') {
            expect(err).toBeDefined();
          }
        });

      // Cleanup
      setTimeout(() => {
        subscription.unsubscribe();
      }, 1000);
    });
  });
});
```

## Performance Testing (Code-Reviewer Coordinated)

### Healthcare Performance Requirements
```typescript
describe('Supabase Performance - Healthcare Requirements', () => {
  let testClient: SupabaseClient<Database>;
  let serviceClient: SupabaseClient<Database>;
  let testDataGenerator: HealthcareTestDataGenerator;

  beforeAll(async () => {
    testClient = createTestSupabaseClient();
    serviceClient = createServiceRoleClient();
    testDataGenerator = new HealthcareTestDataGenerator();

    // Generate test dataset
    const testOrg = await testDataGenerator.createTestOrganization();
    await Promise.all(
      Array.from({ length: 100 }, () => 
        testDataGenerator.createTestPatient(testOrg.id)
      )
    );
  });

  afterAll(async () => {
    await testDataGenerator.cleanupTestData();
  });

  describe('Query Performance', () => {
    it('should meet healthcare data access requirements (≤100ms)', async () => {
      // code-reviewer: Performance benchmark validation
      const performanceTests = [
        () => testClient.from('patients').select('*').limit(10),
        () => testClient.from('patients').select('id, full_name, cpf').limit(50),
        () => testClient.from('consultations').select(`
          *,
          patients(full_name),
          doctors(full_name)
        `).limit(20)
      ];

      for (const test of performanceTests) {
        const startTime = performance.now();
        const { data, error } = await test();
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        expect(error).toBeNull();
        expect(data).toBeDefined();
        // Healthcare requirement: ≤100ms for patient data operations
        expect(responseTime).toBeLessThan(100);
      }
    });

    it('should handle concurrent operations efficiently', async () => {
      // code-reviewer: Concurrent load validation
      const concurrentQueries = Array.from({ length: 50 }, (_, i) => 
        testClient
          .from('patients')
          .select('*')
          .eq('organization_id', `test-org-${i % 5}`)
          .limit(10)
      );

      const startTime = performance.now();
      const results = await Promise.allSettled(concurrentQueries);
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      const successfulQueries = results.filter(
        result => result.status === 'fulfilled'
      );

      expect(successfulQueries.length).toBeGreaterThan(45); // 90% success rate
      expect(totalTime).toBeLessThan(5000); // Complete within 5 seconds
    });
  });

  describe('Scalability Testing', () => {
    it('should maintain performance under load', async () => {
      // code-reviewer: Scalability validation
      const loadTest = async (iterations: number) => {
        const startTime = performance.now();
        
        const promises = Array.from({ length: iterations }, () =>
          testClient
            .from('patients')
            .select('id, full_name')
            .limit(5)
        );

        await Promise.all(promises);
        
        const endTime = performance.now();
        return endTime - startTime;
      };

      // Test different load levels
      const lowLoad = await loadTest(10);
      const mediumLoad = await loadTest(50);
      const highLoad = await loadTest(100);

      // Performance should scale linearly (not exponentially)
      const lowLoadPerQuery = lowLoad / 10;
      const highLoadPerQuery = highLoad / 100;
      
      // High load per-query time should be less than 2x low load
      expect(highLoadPerQuery).toBeLessThan(lowLoadPerQuery * 2);
    });
  });
});
```

## Edge Functions Testing (Architect-Review Coordinated)

### Healthcare API Edge Functions
```typescript
describe('Supabase Edge Functions - Healthcare APIs', () => {
  let testClient: SupabaseClient<Database>;

  beforeAll(() => {
    testClient = createTestSupabaseClient();
  });

  describe('Patient Processing Functions', () => {
    it('should validate patient data through edge function', async () => {
      // architect-review: API contract validation
      const patientData = {
        full_name: 'Maria Silva - TEST',
        cpf: '12345678901',
        email: 'maria.test@neonpro.com',
        birth_date: '1990-01-01'
      };

      const { data, error } = await testClient.functions.invoke(
        'validate-patient-data',
        {
          body: patientData,
          headers: {
            'Content-Type': 'application/json',
            'X-Test-Mode': 'true'
          }
        }
      );

      expect(error).toBeNull();
      expect(data).toHaveProperty('valid');
      expect(data).toHaveProperty('sanitized_data');
      
      // architect-review: Validate data sanitization
      if (data.sanitized_data) {
        expect(data.sanitized_data.cpf).toMatch(/^\*\*\*\.\*\*\*\.\*\*\*-\d{2}$/);
      }
    });

    it('should handle LGPD data subject requests', async () => {
      // security-auditor: LGPD compliance validation
      const dataRequest = {
        patient_id: 'test-patient-id',
        request_type: 'access',
        requested_by: 'patient'
      };

      const { data, error } = await testClient.functions.invoke(
        'lgpd-data-request',
        {
          body: dataRequest,
          headers: {
            'Authorization': `Bearer ${await getTestAuthToken()}`,
            'X-Test-Mode': 'true'
          }
        }
      );

      expect(error).toBeNull();
      expect(data).toHaveProperty('request_id');
      expect(data).toHaveProperty('estimated_completion');
      expect(data).toHaveProperty('compliance_verified');
    });
  });
});
```

## Audit Trail Testing (Security-Auditor Coordinated)

### Healthcare Audit Requirements
```typescript
describe('Supabase Audit Trail - Healthcare Compliance', () => {
  let testClient: SupabaseClient<Database>;
  let serviceClient: SupabaseClient<Database>;

  beforeAll(() => {
    testClient = createTestSupabaseClient({ auditTrail: true });
    serviceClient = createServiceRoleClient();
  });

  describe('Data Access Auditing', () => {
    it('should log patient data access', async () => {
      // security-auditor: Audit trail validation
      const testUser = await createAuthenticatedTestUser();
      
      // Perform a patient data query
      const { data: patientData } = await testClient
        .from('patients')
        .select('*')
        .eq('id', 'test-patient-id')
        .limit(1);

      // Verify audit log entry was created
      const { data: auditLogs } = await serviceClient
        .from('audit_logs')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('table_name', 'patients')
        .eq('action', 'SELECT')
        .order('created_at', { ascending: false })
        .limit(1);

      expect(auditLogs).toHaveLength(1);
      expect(auditLogs?.[0]).toHaveProperty('timestamp');
      expect(auditLogs?.[0]).toHaveProperty('user_id', testUser.id);
      expect(auditLogs?.[0]).toHaveProperty('action', 'SELECT');
    });

    it('should log data modifications with details', async () => {
      // security-auditor: Modification audit validation
      const testUser = await createAuthenticatedTestUser();
      const testPatient = await createTestPatient();

      // Perform patient data update
      const { data: updateResult } = await testClient
        .from('patients')
        .update({ 
          full_name: 'Updated Name - TEST',
          updated_at: new Date().toISOString()
        })
        .eq('id', testPatient.id);

      // Verify detailed audit log
      const { data: auditLogs } = await serviceClient
        .from('audit_logs')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('table_name', 'patients')
        .eq('action', 'UPDATE')
        .eq('record_id', testPatient.id)
        .order('created_at', { ascending: false })
        .limit(1);

      expect(auditLogs).toHaveLength(1);
      expect(auditLogs?.[0]).toHaveProperty('old_values');
      expect(auditLogs?.[0]).toHaveProperty('new_values');
      expect(auditLogs?.[0].new_values).toMatchObject({
        full_name: 'Updated Name - TEST'
      });
    });
  });
});
```

## CI/CD Integration

### GitHub Actions Supabase Testing
```yaml
# .github/workflows/supabase-tests.yml
name: Supabase Integration Tests

on:
  pull_request:
    paths: ['**/*.sql', 'supabase/**', 'apps/**', 'packages/**']

jobs:
  supabase-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: supabase/postgres:15.1.0.117
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
      
      # security-auditor: Secure test environment
      - name: Start Supabase local development
        run: |
          supabase start
          supabase db reset --local
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      
      # architect-review: Schema validation
      - name: Run Database Schema Tests
        run: npm run test:supabase:schema
        env:
          SUPABASE_TEST_URL: http://localhost:54321
          SUPABASE_TEST_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
      
      # security-auditor: RLS and security validation
      - name: Run RLS Security Tests
        run: npm run test:supabase:rls
        env:
          SUPABASE_TEST_URL: http://localhost:54321
          SUPABASE_TEST_SERVICE_KEY: ${{ secrets.SUPABASE_TEST_SERVICE_KEY }}
      
      # code-reviewer: Performance validation
      - name: Run Performance Tests
        run: npm run test:supabase:performance
        env:
          PERFORMANCE_THRESHOLD: 100
      
      # Multi-agent: Comprehensive Supabase testing
      - name: Run Full Supabase Test Suite
        run: npm run test:supabase
        env:
          HEALTHCARE_MODE: true
          LGPD_COMPLIANCE: true
```

## Test Scripts and Configuration

### Package.json Scripts
```json
{
  "scripts": {
    "test:supabase": "vitest run --config vitest.supabase.config.ts",
    "test:supabase:rls": "vitest run tests/supabase/rls --reporter=verbose",
    "test:supabase:auth": "vitest run tests/supabase/auth --reporter=verbose",
    "test:supabase:performance": "vitest run tests/supabase/performance --reporter=verbose",
    "test:supabase:schema": "vitest run tests/supabase/schema --reporter=verbose",
    "test:supabase:audit": "vitest run tests/supabase/audit --reporter=verbose",
    "test:supabase:watch": "vitest --config vitest.supabase.config.ts",
    "test:supabase:coverage": "vitest run --coverage --config vitest.supabase.config.ts"
  }
}
```

### Vitest Configuration
```typescript
// vitest.supabase.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'tests/supabase/**/*.test.ts',
      'apps/**/src/**/*.supabase.test.ts'
    ],
    environment: 'node',
    setupFiles: ['./tests/supabase/setup.ts'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    }
  }
});
```

## Best Practices Summary (Multi-Agent Enforced)

### Security-Auditor Enforced
- ✅ Use synthetic data for all test scenarios
- ✅ Implement LGPD-compliant test data management
- ✅ Validate RLS policies in all data access tests
- ✅ Maintain comprehensive audit trails
- ✅ Test authentication and authorization flows

### Architect-Review Enforced
- ✅ Validate database schema and migration patterns
- ✅ Test API contracts and service boundaries
- ✅ Ensure proper error handling and recovery
- ✅ Validate data consistency and integrity

### Code-Reviewer Enforced
- ✅ Monitor performance and response times (≤100ms healthcare requirement)
- ✅ Validate code quality in database operations
- ✅ Test concurrent operations and scalability
- ✅ Implement comprehensive error scenario testing

## Quality Gates & Metrics

### Supabase-Specific Quality Gates
```yaml
SUPABASE_QUALITY_GATES:
  security_auditor:
    - "RLS policy coverage ≥100%"
    - "LGPD compliance validation ≥100%"
    - "Authentication flow coverage ≥95%"
    - "Audit trail verification ≥100%"
  
  architect_review:
    - "Database schema validation ≥100%"
    - "API contract compliance ≥95%"
    - "Data integrity constraints ≥100%"
    - "Migration success rate ≥100%"
  
  code_reviewer:
    - "Query performance ≤100ms"
    - "Concurrent operation success ≥95%"
    - "Error handling coverage ≥85%"
    - "Code quality metrics ≥85%"
```

## See Also

- **[AGENTS.md](./AGENTS.md)** - Testing orchestration framework
- **[Integration Testing](./integration-testing.md)** - Comprehensive integration patterns
- **[Security Auditor Agent](../agents/code-review/security-auditor.md)** - Security validation
- **[Coverage Policy](./coverage-policy.md)** - Coverage requirements and thresholds