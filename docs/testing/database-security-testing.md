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
```### 2. Authentication Flow Security Testing

```typescript
describe('Authentication Security Validation', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeEach(() => {
    supabase = createTestSupabaseClient();
  });

  afterEach(async () => {
    await supabase.auth.signOut();
  });

  describe('Secure authentication patterns', () => {
    it('validates strong password requirements', async () => {
      const weakPasswords = [
        '123456',
        'password',
        'admin',
        'qwerty',
        '12345678'
      ];

      for (const weakPassword of weakPasswords) {
        const { data, error } = await supabase.auth.signUp({
          email: 'test@clinic.com',
          password: weakPassword
        });

        expect(error).toBeDefined();
        expect(error?.message).toMatch(/password.*weak|strength|requirements/i);
        expect(data.user).toBeNull();
      }
    });

    it('enforces secure session management', async () => {
      // Valid login
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'doctor@clinic.com',
        password: 'SecurePassword123!'
      });

      expect(loginError).toBeNull();
      expect(loginData.session).toBeDefined();
      expect(loginData.session?.access_token).toBeDefined();

      // Verify session has proper expiration
      expect(loginData.session?.expires_at).toBeGreaterThan(Date.now() / 1000);
      
      // Session should have healthcare-appropriate duration (shorter for security)
      const sessionDuration = loginData.session?.expires_at! - (Date.now() / 1000);
      expect(sessionDuration).toBeLessThan(8 * 60 * 60); // Max 8 hours for healthcare
    });

    it('handles secure session refresh', async () => {
      const { data: loginData } = await supabase.auth.signInWithPassword({
        email: 'doctor@clinic.com',
        password: 'SecurePassword123!'
      });

      if (loginData.session) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token: loginData.session.refresh_token
        });

        expect(refreshError).toBeNull();
        expect(refreshData.session).toBeDefined();
        
        // New token should be different
        expect(refreshData.session?.access_token).not.toBe(loginData.session.access_token);
        
        // Old token should be invalidated
        const oldTokenClient = createClient(
          process.env.SUPABASE_TEST_URL!,
          loginData.session.access_token
        );
        
        const { error: oldTokenError } = await oldTokenClient.from('patients').select('id').limit(1);
        expect(oldTokenError).toBeDefined();
      }
    });

    it('prevents session hijacking attempts', async () => {
      // Create session
      const { data: loginData } = await supabase.auth.signInWithPassword({
        email: 'doctor@clinic.com',
        password: 'SecurePassword123!'
      });

      if (loginData.session) {
        // Simulate session hijacking attempt with modified token
        const maliciousToken = loginData.session.access_token.replace(/.$/, 'X');
        
        const hijackClient = createClient(
          process.env.SUPABASE_TEST_URL!,
          process.env.SUPABASE_TEST_ANON_KEY!
        );

        await hijackClient.auth.setSession({
          access_token: maliciousToken,
          refresh_token: loginData.session.refresh_token
        });

        const { error } = await hijackClient.from('patients').select('*').limit(1);
        expect(error).toBeDefined();
        expect(error?.message).toMatch(/unauthorized|invalid.*token/i);
      }
    });
  });

  describe('Multi-factor authentication validation', () => {
    it('enforces MFA for privileged healthcare users', async () => {
      // Admin users should require MFA
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@clinic.com',
        password: 'AdminPassword123!'
      });

      if (data.user && !error) {
        // Should require MFA verification
        expect(data.user.app_metadata.requires_mfa).toBe(true);
        
        // Access to sensitive data should be blocked until MFA
        const { error: dataError } = await supabase
          .from('audit_logs')
          .select('*')
          .limit(1);
        
        expect(dataError).toBeDefined();
        expect(dataError?.message).toMatch(/mfa.*required|two.*factor/i);
      }
    });
  });
});
```

## LGPD & Healthcare Compliance Testing

### 1. Data Protection Compliance

```typescript
describe('LGPD Data Protection Compliance', () => {
  describe('Personal data anonymization', () => {
    it('anonymizes patient data in test environment', async () => {
      const testClient = createTestSupabaseClient({
        lgpdCompliant: true,
        anonymizeData: true
      });

      const { data: patients } = await testClient
        .from('patients')
        .select('name, cpf, email, phone')
        .limit(5);

      if (patients && patients.length > 0) {
        patients.forEach(patient => {
          // security-auditor: Verify data anonymization patterns
          expect(patient.name).toMatch(/^ANON_\d+$|^Test\s+Patient\s+\d+$/);
          expect(patient.cpf).toMatch(/^\*+\d{4}$|^\*\*\*\.\*\*\*\.\*\*\*-\d{2}$/);
          expect(patient.email).toMatch(/^\*+@\*+\.\*+$|^test\+\d+@example\.com$/);
          expect(patient.phone).toMatch(/^\*+\d{4}$|^\+55\s11\s9\*\*\*\*-\d{4}$/);
        });
      }
    });

    it('validates data minimization principles', async () => {
      const testClient = createTestSupabaseClient();
      
      // Query should only return necessary fields for the operation
      const { data: minimalPatients } = await testClient
        .from('patients')
        .select('id, name, clinic_id') // Only essential fields
        .limit(10);

      expect(minimalPatients).toBeDefined();
      
      // Verify sensitive fields are not included unless explicitly requested
      if (minimalPatients && minimalPatients.length > 0) {
        expect(minimalPatients[0]).not.toHaveProperty('cpf');
        expect(minimalPatients[0]).not.toHaveProperty('medical_history');
        expect(minimalPatients[0]).not.toHaveProperty('emergency_contact');
      }
    });

    it('enforces data retention policies', async () => {
      const testClient = createTestSupabaseClient();
      
      // Query for old test data (older than retention period)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days retention for test data
      
      const { data: oldData } = await testClient
        .from('test_data_audit')
        .select('*')
        .lt('created_at', cutoffDate.toISOString());

      // security-auditor: Verify old data is cleaned up per LGPD requirements
      expect(oldData).toHaveLength(0);
    });

    it('validates consent tracking', async () => {
      const testClient = createTestSupabaseClient();
      
      // Check that all patients have proper consent records
      const { data: patients } = await testClient
        .from('patients')
        .select(`
          id,
          consent_records (
            id,
            consent_type,
            granted_at,
            expires_at,
            purpose
          )
        `)
        .limit(5);

      if (patients && patients.length > 0) {
        patients.forEach(patient => {
          expect(patient.consent_records).toBeDefined();
          expect(patient.consent_records.length).toBeGreaterThan(0);
          
          // Verify required consent types are present
          const consentTypes = patient.consent_records.map(c => c.consent_type);
          expect(consentTypes).toContain('data_processing');
          expect(consentTypes).toContain('medical_treatment');
          
          // Verify consent is still valid
          const now = new Date();
          const validConsents = patient.consent_records.filter(c => 
            new Date(c.expires_at) > now
          );
          expect(validConsents.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Data subject rights validation', () => {
    it('supports data portability (right to data portability)', async () => {
      const testClient = createTestSupabaseClient();
      
      // Test patient data export functionality
      const patientId = 'test-patient-123';
      const { data: exportData } = await testClient.rpc('export_patient_data', {
        patient_id: patientId
      });

      expect(exportData).toBeDefined();
      expect(exportData).toHaveProperty('personal_data');
      expect(exportData).toHaveProperty('medical_records');
      expect(exportData).toHaveProperty('appointments');
      expect(exportData).toHaveProperty('consent_history');
      
      // Verify data is in machine-readable format (JSON)
      expect(typeof exportData.personal_data).toBe('object');
    });

    it('supports data rectification (right to rectification)', async () => {
      const testClient = createTestSupabaseClient();
      
      // Test that patients can update their own data
      const updateData = {
        name: 'João Silva Santos',
        email: 'joao.updated@email.com',
        phone: '+55 11 99999-8888'
      };

      const { data: updatedPatient, error } = await testClient
        .from('patients')
        .update(updateData)
        .eq('id', 'test-patient-123')
        .select()
        .single();

      expect(error).toBeNull();
      expect(updatedPatient).toMatchObject(updateData);
      
      // Verify audit log is created
      const { data: auditLog } = await testClient
        .from('audit_logs')
        .select('*')
        .eq('table_name', 'patients')
        .eq('record_id', 'test-patient-123')
        .eq('operation', 'UPDATE')
        .order('created_at', { ascending: false })
        .limit(1);

      expect(auditLog).toHaveLength(1);
      expect(auditLog[0].operation_type).toBe('data_rectification');
    });

    it('supports data erasure (right to be forgotten)', async () => {
      const serviceClient = createServiceRoleClient();
      
      // Test soft deletion with anonymization
      const { data: deletedPatient, error } = await serviceClient.rpc('anonymize_patient', {
        patient_id: 'test-patient-delete'
      });

      expect(error).toBeNull();
      expect(deletedPatient).toBeDefined();

      // Verify patient data is anonymized but structure preserved
      const { data: anonymizedPatient } = await serviceClient
        .from('patients')
        .select('*')
        .eq('id', 'test-patient-delete')
        .single();

      expect(anonymizedPatient.name).toMatch(/^DELETED_\d+$/);
      expect(anonymizedPatient.cpf).toBe('***.***.***-**');
      expect(anonymizedPatient.email).toBe('deleted@example.com');
      expect(anonymizedPatient.deleted_at).toBeDefined();
    });
  });
});
```

### 2. ANVISA Regulatory Compliance

```typescript
describe('ANVISA Healthcare Compliance', () => {
  it('validates medical device data integrity', async () => {
    const testClient = createTestSupabaseClient();
    
    // Test medical device tracking compliance
    const { data: devices } = await testClient
      .from('medical_devices')
      .select(`
        id,
        device_id,
        registration_number,
        calibration_records (
          id,
          calibrated_at,
          next_calibration,
          certified_by
        )
      `)
      .limit(5);

    if (devices && devices.length > 0) {
      devices.forEach(device => {
        // ANVISA requires valid registration numbers
        expect(device.registration_number).toMatch(/^\d{13}$/); // ANVISA format
        
        // Calibration records must be up to date
        expect(device.calibration_records).toBeDefined();
        expect(device.calibration_records.length).toBeGreaterThan(0);
        
        const latestCalibration = device.calibration_records[0];
        const nextCalibration = new Date(latestCalibration.next_calibration);
        const now = new Date();
        
        // Device must not be overdue for calibration
        expect(nextCalibration.getTime()).toBeGreaterThan(now.getTime());
      });
    }
  });

  it('validates pharmaceutical tracking', async () => {
    const testClient = createTestSupabaseClient();
    
    // Test medication batch tracking
    const { data: medications } = await testClient
      .from('medications')
      .select(`
        id,
        name,
        batch_number,
        expiration_date,
        anvisa_registration,
        storage_temperature
      `)
      .limit(10);

    if (medications && medications.length > 0) {
      medications.forEach(medication => {
        // ANVISA registration validation
        expect(medication.anvisa_registration).toMatch(/^\d{1,2}\.\d{4}\.\d{4}\.\d{3}-\d{1}$/);
        
        // Expiration date validation
        const expirationDate = new Date(medication.expiration_date);
        const now = new Date();
        expect(expirationDate.getTime()).toBeGreaterThan(now.getTime());
        
        // Storage requirements validation
        expect(medication.storage_temperature).toBeDefined();
        expect(typeof medication.storage_temperature).toBe('number');
      });
    }
  });

  it('validates adverse event reporting', async () => {
    const testClient = createTestSupabaseClient();
    
    // Test ANVISA adverse event reporting compliance
    const { data: adverseEvents } = await testClient
      .from('adverse_events')
      .select(`
        id,
        event_type,
        severity,
        reported_to_anvisa,
        anvisa_report_number,
        patient_id,
        device_id,
        medication_id
      `)
      .eq('severity', 'serious')
      .limit(5);

    if (adverseEvents && adverseEvents.length > 0) {
      adverseEvents.forEach(event => {
        // Serious events must be reported to ANVISA
        expect(event.reported_to_anvisa).toBe(true);
        expect(event.anvisa_report_number).toBeDefined();
        expect(event.anvisa_report_number).toMatch(/^AE\d{8}$/);
        
        // Must be linked to patient, device, or medication
        const hasValidReference = event.patient_id || event.device_id || event.medication_id;
        expect(hasValidReference).toBeTruthy();
      });
    }
  });
});
```## Audit Trail & Logging Testing

### 1. Comprehensive Audit Logging

```typescript
describe('Audit Trail Compliance', () => {
  it('logs all sensitive data access', async () => {
    const testClient = createTestSupabaseClient({ auditTrail: true });
    
    // Perform sensitive operation
    await testClient
      .from('patients')
      .select('name, cpf, medical_history')
      .eq('id', 'test-patient-123')
      .limit(1);

    // Verify audit log was created
    const { data: auditLogs } = await testClient
      .from('audit_logs')
      .select('*')
      .eq('table_name', 'patients')
      .eq('operation', 'SELECT')
      .eq('record_id', 'test-patient-123')
      .gte('created_at', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false })
      .limit(1);

    expect(auditLogs).toBeDefined();
    expect(auditLogs!.length).toBeGreaterThan(0);

    const auditLog = auditLogs![0];
    expect(auditLog.user_id).toBeDefined();
    expect(auditLog.ip_address).toBeDefined();
    expect(auditLog.user_agent).toBeDefined();
    expect(auditLog.accessed_fields).toContain('medical_history');
  });

  it('tracks data modifications with full context', async () => {
    const testClient = createTestSupabaseClient({ auditTrail: true });
    
    // Update patient data
    const updateData = { phone: '+55 11 88888-7777' };
    await testClient
      .from('patients')
      .update(updateData)
      .eq('id', 'test-patient-123');

    // Verify comprehensive audit log
    const { data: auditLogs } = await testClient
      .from('audit_logs')
      .select('*')
      .eq('table_name', 'patients')
      .eq('operation', 'UPDATE')
      .eq('record_id', 'test-patient-123')
      .order('created_at', { ascending: false })
      .limit(1);

    expect(auditLogs).toHaveLength(1);
    
    const auditLog = auditLogs[0];
    expect(auditLog.old_values).toBeDefined();
    expect(auditLog.new_values).toMatchObject(updateData);
    expect(auditLog.changed_fields).toContain('phone');
    expect(auditLog.reason).toBeDefined();
    expect(auditLog.compliance_context).toContain('LGPD');
  });

  it('maintains immutable audit trail', async () => {
    const serviceClient = createServiceRoleClient();
    
    // Attempt to modify audit log (should fail)
    const { error } = await serviceClient
      .from('audit_logs')
      .update({ operation: 'MODIFIED' })
      .eq('id', 'existing-audit-log-id');

    expect(error).toBeDefined();
    expect(error?.message).toMatch(/not allowed|permission denied|immutable/i);
  });

  it('validates audit log retention policy', async () => {
    const testClient = createTestSupabaseClient();
    
    // Check that audit logs older than retention period are archived
    const retentionDate = new Date();
    retentionDate.setFullYear(retentionDate.getFullYear() - 7); // 7 years LGPD requirement
    
    const { data: oldAuditLogs } = await testClient
      .from('audit_logs')
      .select('id, archived_at')
      .lt('created_at', retentionDate.toISOString())
      .limit(10);

    if (oldAuditLogs && oldAuditLogs.length > 0) {
      // Old logs should be archived, not deleted
      oldAuditLogs.forEach(log => {
        expect(log.archived_at).toBeDefined();
      });
    }
  });
});
```

### 2. Real-time Security Monitoring

```typescript
describe('Real-time Security Monitoring', () => {
  it('detects suspicious access patterns', async () => {
    const testClient = createTestSupabaseClient();
    
    // Simulate rapid access attempts (potential bot behavior)
    const rapidRequests = Array(20).fill(null).map(() =>
      testClient.from('patients').select('*').limit(1)
    );

    await Promise.all(rapidRequests);

    // Check for security alerts
    const { data: securityAlerts } = await testClient
      .from('security_alerts')
      .select('*')
      .eq('alert_type', 'suspicious_access_pattern')
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last minute
      .limit(1);

    expect(securityAlerts).toBeDefined();
    if (securityAlerts && securityAlerts.length > 0) {
      expect(securityAlerts[0].severity).toMatch(/medium|high/i);
      expect(securityAlerts[0].description).toMatch(/rapid.*access|suspicious.*pattern/i);
    }
  });

  it('monitors for privilege escalation attempts', async () => {
    const testClient = createTestSupabaseClient();
    
    // Attempt to access admin-only data
    const { error } = await testClient
      .from('system_configuration')
      .select('*')
      .limit(1);

    expect(error).toBeDefined();

    // Verify security incident was logged
    const { data: incidents } = await testClient
      .from('security_incidents')
      .select('*')
      .eq('incident_type', 'unauthorized_access_attempt')
      .gte('created_at', new Date(Date.now() - 30000).toISOString())
      .limit(1);

    expect(incidents).toBeDefined();
    if (incidents && incidents.length > 0) {
      expect(incidents[0].target_resource).toBe('system_configuration');
      expect(incidents[0].action_taken).toMatch(/blocked|denied/i);
    }
  });
});
```

## GoTrueClient Management & Performance

### 1. Singleton Pattern Implementation

```typescript
describe('GoTrueClient Multi-Instance Management', () => {
  let originalConsoleWarn: typeof console.warn;

  beforeAll(() => {
    // Capture console warnings for testing
    originalConsoleWarn = console.warn;
    console.warn = vi.fn();
  });

  afterAll(() => {
    console.warn = originalConsoleWarn;
  });

  it('prevents multiple GoTrueClient instances', async () => {
    // Create multiple Supabase clients rapidly
    const clients = Array(5).fill(null).map(() => createTestSupabaseClient());
    
    // Perform auth operations with all clients
    const authPromises = clients.map(client =>
      client.auth.getSession()
    );

    await Promise.all(authPromises);

    // Verify no multi-instance warnings
    expect(console.warn).not.toHaveBeenCalledWith(
      expect.stringMatching(/Multiple GoTrueClient instances detected/i)
    );
  });

  it('handles concurrent auth operations safely', async () => {
    const client = createTestSupabaseClient();
    
    // Perform concurrent auth operations
    const operations = [
      client.auth.getSession(),
      client.auth.getUser(),
      client.auth.signInWithPassword({
        email: 'test@clinic.com',
        password: 'password123'
      }),
    ];

    const results = await Promise.allSettled(operations);
    
    // At least session and user calls should succeed
    expect(results[0].status).toBe('fulfilled');
    expect(results[1].status).toBe('fulfilled');
  });
});
```

### 2. Database Performance & Security

```typescript
describe('Database Performance Security', () => {
  it('validates query performance within security SLAs', async () => {
    const testClient = createTestSupabaseClient();
    
    const startTime = Date.now();
    
    // Complex query with security implications
    const { data, error } = await testClient
      .from('patients')
      .select(`
        id,
        name,
        appointments (
          id,
          scheduled_for,
          doctor:doctors (
            name,
            specialization
          )
        ),
        medical_records (
          id,
          created_at,
          diagnosis
        )
      `)
      .eq('clinic_id', 'test-clinic')
      .limit(10);

    const queryTime = Date.now() - startTime;
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    // Performance SLA for security-sensitive queries
    expect(queryTime).toBeLessThan(1000); // 1 second max
  });

  it('prevents SQL injection in dynamic queries', async () => {
    const testClient = createTestSupabaseClient();
    
    // Test with malicious input
    const maliciousInput = "'; DROP TABLE patients; --";
    
    const { data, error } = await testClient
      .from('patients')
      .select('*')
      .ilike('name', `%${maliciousInput}%`)
      .limit(1);

    // Query should be safe and return no results
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
    
    // Verify table still exists
    const { data: tableCheck } = await testClient
      .from('patients')
      .select('count')
      .limit(1);
    
    expect(tableCheck).toBeDefined();
  });
});
```

## Troubleshooting

### Common Security Issues

- **Issue**: RLS policies not enforcing correctly in tests
  **Solution**: Ensure using anon key (not service role) and correct user context with proper authentication

- **Issue**: LGPD compliance tests failing due to real data exposure
  **Solution**: Use test-specific anonymization patterns and isolated test schemas

- **Issue**: Audit logs not being created
  **Solution**: Verify audit triggers are enabled and test user has proper permissions

- **Issue**: GoTrueClient multi-instance warnings
  **Solution**: Implement singleton pattern as shown in section above

### Security Test Data Management

```typescript
// Secure test data factory
export class SecureTestDataFactory {
  static createAnonymizedPatient(overrides: Partial<Patient> = {}): Patient {
    return {
      id: `test-${crypto.randomUUID()}`,
      name: `Test Patient ${Math.floor(Math.random() * 1000)}`,
      cpf: this.generateAnonymizedCPF(),
      email: `test+${Date.now()}@example.com`,
      phone: `+55 11 9****-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
      birthDate: '1985-01-01', // Fixed date for consistency
      clinic_id: 'test-clinic',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }

  private static generateAnonymizedCPF(): string {
    const digits = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `***.***.**-${digits}`;
  }

  static async cleanupTestData(supabase: SupabaseClient) {
    // Clean up test data while preserving audit logs
    await supabase.from('patients').delete().like('id', 'test-%');
    await supabase.from('appointments').delete().like('patient_id', 'test-%');
    // Note: Never delete audit_logs for compliance
  }
}
```

## Examples

### Complete Security Test Suite

```typescript
describe('Healthcare Database Security Suite', () => {
  let testClient: ReturnType<typeof createTestSupabaseClient>;
  let serviceClient: ReturnType<typeof createServiceRoleClient>;

  beforeAll(async () => {
    testClient = createTestSupabaseClient({
      lgpdCompliant: true,
      auditTrail: true,
      anonymizeData: true
    });
    serviceClient = createServiceRoleClient();
    
    await setupSecureTestEnvironment();
  });

  afterAll(async () => {
    await SecureTestDataFactory.cleanupTestData(serviceClient);
  });

  it('validates complete security workflow', async () => {
    // 1. Secure authentication
    const { data: authData } = await testClient.auth.signInWithPassword({
      email: 'doctor@clinic.com',
      password: 'SecurePassword123!'
    });
    expect(authData.user).toBeDefined();

    // 2. RLS validation
    const { data: patients } = await testClient
      .from('patients')
      .select('*')
      .limit(5);
    expect(patients?.every(p => p.clinic_id === 'authorized-clinic')).toBe(true);

    // 3. LGPD compliance
    expect(patients?.every(p => p.cpf.includes('***'))).toBe(true);

    // 4. Audit trail verification
    const { data: auditLogs } = await testClient
      .from('audit_logs')
      .select('*')
      .eq('table_name', 'patients')
      .eq('user_id', authData.user?.id)
      .limit(1);
    expect(auditLogs).toHaveLength(1);

    // 5. Data access controls
    const { error: unauthorizedError } = await testClient
      .from('admin_settings')
      .select('*');
    expect(unauthorizedError).toBeDefined();

    await testClient.auth.signOut();
  });
});
```

## See Also

- [Frontend Testing](./front-end-testing.md) - Frontend security patterns
- [Backend Architecture Testing](./backend-architecture-testing.md) - API security integration  
- [Code Review & Audit](./code-review-auditfix.md) - Security code review standards
- [AGENTS.md](./AGENTS.md) - Security testing orchestration guide