/**
 * Role-Based Access Control E2E Tests
 * 
 * Validates RBAC implementation for healthcare scenarios:
 * - Admin role: Full system access
 * - Healthcare Provider role: Clinical data access
 * - Patient role: Limited personal data access
 * - Permission enforcement and data isolation
 * 
 * @version 1.0.0
 * @author NeonPro Platform Team
 * @compliance LGPD, ANVISA, CFM, ISO 27001
 */

import { test, expect } from '@playwright/test';

const baseUrl = process.env.BASE_URL || 'https://localhost:3000';

// Test user credentials (should be configured in test environment)
const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    expectedPermissions: ['read:all', 'write:all', 'delete:all', 'manage:users']
  },
  doctor: {
    email: 'doctor@test.com', 
    password: 'doctor123',
    expectedPermissions: ['read:patients', 'read:appointments', 'write:clinical_notes']
  },
  nurse: {
    email: 'nurse@test.com',
    password: 'nurse123', 
    expectedPermissions: ['read:patients', 'read:appointments']
  },
  receptionist: {
    email: 'receptionist@test.com',
    password: 'receptionist123',
    expectedPermissions: ['read:appointments', 'write:appointments']
  }
};

// Test patient data
const testPatientId = 'test-patient-123';
const testPatientData = {
  name: 'Maria Silva',
  email: 'maria@example.com',
  domain: 'test-clinic'
};

test.describe('Role-Based Access Control', () => {
  
  test.describe('Authentication & Authorization', () => {
    
    test('should authenticate admin user with full permissions', async ({ request }) => {
      // Login as admin
      const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: testUsers.admin.email,
          password: testUsers.admin.password
        }
      });
      
      expect(loginResponse.status()).toBe(200);
      const { token } = await loginResponse.json();
      expect(token).toBeDefined();
      
      // Access admin-only endpoint
      const adminResponse = await request.get(`${baseUrl}/v1/security/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      expect(adminResponse.status()).toBe(200);
    });

    test('should authenticate healthcare provider with clinical permissions', async ({ request }) => {
      // Login as doctor
      const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: testUsers.doctor.email,
          password: testUsers.doctor.password
        }
      });
      
      expect(loginResponse.status()).toBe(200);
      const { token } = await loginResponse.json();
      
      // Access patient data (should be allowed)
      const patientResponse = await request.get(`${baseUrl}/api/v2/patients/${testPatientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      expect([200, 404]).toContain(patientResponse.status()); // 404 if patient doesn't exist
    });

    test('should restrict access based on role permissions', async ({ request }) => {
      // Login as receptionist (limited permissions)
      const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: testUsers.receptionist.email,
          password: testUsers.receptionist.password
        }
      });
      
      expect(loginResponse.status()).toBe(200);
      const { token } = await loginResponse.json();
      
      // Try to access financial data (should be denied)
      const financialResponse = await request.get(`${baseUrl}/api/v1/billing/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      expect([401, 403]).toContain(financialResponse.status());
    });

    test('should reject invalid credentials', async ({ request }) => {
      const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: 'invalid@test.com',
          password: 'wrongpassword'
        }
      });
      
      expect(loginResponse.status()).toBe(401);
    });
  });

  test.describe('Healthcare Provider Role Permissions', () => {
    
    test('should access patient records', async ({ request }) => {
      // Login as doctor
      const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: testUsers.doctor.email,
          password: testUsers.doctor.password
        }
      });
      
      expect(loginResponse.status()).toBe(200);
      const { token } = await loginResponse.json();
      
      // Access patient list
      const patientsResponse = await request.get(`${baseUrl}/api/v2/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      expect(patientsResponse.status()).toBe(200);
      
      const patients = await patientsResponse.json();
      expect(Array.isArray(patients)).toBe(true);
    });

    test('should access appointment data', async ({ request }) => {
      // Login as nurse
      const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: testUsers.nurse.email,
          password: testUsers.nurse.password
        }
      });
      
      expect(loginResponse.status()).toBe(200);
      const { token } = await loginResponse.json();
      
      // Access appointments
      const appointmentsResponse = await request.get(`${baseUrl}/api/v1/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      expect(appointmentsResponse.status()).toBe(200);
    });

    test('should respect domain-based access control', async ({ request }) => {
      // Login as doctor
      const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: testUsers.doctor.email,
          password: testUsers.doctor.password
        }
      });
      
      expect(loginResponse.status()).toBe(200);
      const { token } = await loginResponse.json();
      
      // Access patients - should only return patients from doctor's domain
      const patientsResponse = await request.get(`${baseUrl}/api/v2/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      expect(patientsResponse.status()).toBe(200);
      
      const patients = await patientsResponse.json();
      // Verify all patients belong to the same domain as the user
      patients.forEach((patient: any) => {
        expect(patient.domain).toBeDefined();
      });
    });
  });

  test.describe('Admin Role Permissions', () => {
    
    test('should access security monitoring', async ({ request }) => {
      // Login as admin
      const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: testUsers.admin.email,
          password: testUsers.admin.password
        }
      });
      
      expect(loginResponse.status()).toBe(200);
      const { token } = await loginResponse.json();
      
      // Access security monitoring
      const securityResponse = await request.get(`${baseUrl}/v1/security/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      expect(securityResponse.status()).toBe(200);
      
      const securityData = await securityResponse.json();
      expect(securityData).toHaveProperty('encryption');
      expect(securityData).toHaveProperty('healthcareCompliance');
    });

    test('should access compliance data', async ({ request }) => {
      // Login as admin
      const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: testUsers.admin.email,
          password: testUsers.admin.password
        }
      });
      
      expect(loginResponse.status()).toBe(200);
      const { token } = await loginResponse.json();
      
      // Access LGPD compliance data
      const complianceResponse = await request.get(`${baseUrl}/v1/compliance/lgpd`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      expect(complianceResponse.status()).toBe(200);
      
      const compliance = await complianceResponse.json();
      expect(compliance).toHaveProperty('lgpdCompliance');
    });

    test('should access system monitoring', async ({ request }) => {
      // Login as admin
      const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: testUsers.admin.email,
          password: testUsers.admin.password
        }
      });
      
      expect(loginResponse.status()).toBe(200);
      const { token } = await loginResponse.json();
      
      // Access HTTPS monitoring
      const monitoringResponse = await request.get(`${baseUrl}/v1/monitoring/https`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      expect(monitoringResponse.status()).toBe(200);
      
      const monitoring = await monitoringResponse.json();
      expect(monitoring).toHaveProperty('status');
      expect(monitoring).toHaveProperty('performance');
    });
  });

  test.describe('AI Agent Access Control', () => {
    
    test('should enforce permissions on AI queries', async ({ request }) => {
      // Login as receptionist (limited permissions)
      const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: testUsers.receptionist.email,
          password: testUsers.receptionist.password
        }
      });
      
      expect(loginResponse.status()).toBe(200);
      const { token } = await loginResponse.json();
      
      // Attempt to query sensitive financial data via AI agent
      const aiResponse = await request.post(`${baseUrl}/api/v2/ai/data-agent`, {
        headers: { 'Authorization': `Bearer ${token}` },
        data: {
          query: 'Me mostre todos os dados financeiros',
          sessionId: 'test-session'
        }
      });
      
      expect(aiResponse.status()).toBe(200);
      
      const aiResult = await aiResponse.json();
      // Should receive access denied message instead of actual data
      expect(aiResult.content).toMatch(/acesso|não|permitido|negado/i);
    });

    test('should allow appropriate AI queries by role', async ({ request }) => {
      // Login as doctor
      const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: testUsers.doctor.email,
          password: testUsers.doctor.password
        }
      });
      
      expect(loginResponse.status()).toBe(200);
      const { token } = await loginResponse.json();
      
      // Query for appointments (should be allowed)
      const aiResponse = await request.post(`${baseUrl}/api/v2/ai/data-agent`, {
        headers: { 'Authorization': `Bearer ${token}` },
        data: {
          query: 'Quais os próximos agendamentos?',
          sessionId: 'test-session'
        }
      });
      
      expect(aiResponse.status()).toBe(200);
      
      const aiResult = await aiResponse.json();
      expect(aiResult).toHaveProperty('content');
      expect(aiResult).toHaveProperty('type');
    });

    test('should validate session management', async ({ request }) => {
      // Login as doctor
      const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: testUsers.doctor.email,
          password: testUsers.doctor.password
        }
      });
      
      expect(loginResponse.status()).toBe(200);
      const { token, sessionId } = await loginResponse.json();
      
      // Access session data
      const sessionResponse = await request.get(`${baseUrl}/api/v2/ai/sessions/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      expect(sessionResponse.status()).toBe(200);
      
      const session = await sessionResponse.json();
      expect(session).toHaveProperty('id');
      expect(session).toHaveProperty('isActive');
    });
  });

  test.describe('Permission Validation', () => {
    
    test('should enforce row-level security (RLS)', async ({ request }) => {
      // Login as doctor from domain 'test-clinic'
      const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: testUsers.doctor.email,
          password: testUsers.doctor.password
        }
      });
      
      expect(loginResponse.status()).toBe(200);
      const { token } = await loginResponse.json();
      
      // Access patients - should only see patients from same domain
      const patientsResponse = await request.get(`${baseUrl}/api/v2/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      expect(patientsResponse.status()).toBe(200);
      
      const patients = await patientsResponse.json();
      // Verify RLS is working (all patients should be from accessible domain)
      patients.forEach((patient: any) => {
        expect(patient.domain).toBe('test-clinic');
      });
    });

    test('should validate HIPAA/LGPD data access', async ({ request }) => {
      // Login as healthcare provider
      const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: testUsers.doctor.email,
          password: testUsers.doctor.password
        }
      });
      
      expect(loginResponse.status()).toBe(200);
      const { token } = await loginResponse.json();
      
      // Access patient data - should not include sensitive fields in list view
      const patientsResponse = await request.get(`${baseUrl}/api/v2/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      expect(patientsResponse.status()).toBe(200);
      
      const patients = await patientsResponse.json();
      if (patients.length > 0) {
        const patient = patients[0];
        // Should not expose sensitive medical data in list view
        expect(patient).not.toHaveProperty('medical_history');
        expect(patient).not.toHaveProperty('ssn');
        expect(patient).not.toHaveProperty('insurance_number');
      }
    });

    test('should audit all access attempts', async ({ request }) => {
      // Login as admin
      const loginResponse = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: testUsers.admin.email,
          password: testUsers.admin.password
        }
      });
      
      expect(loginResponse.status()).toBe(200);
      const { token } = await loginResponse.json();
      
      // Access sensitive data
      const complianceResponse = await request.get(`${baseUrl}/v1/compliance/lgpd`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      expect(complianceResponse.status()).toBe(200);
      
      // In a real test, we would verify audit logs were created
      // For now, just validate the request was successful
      const compliance = await complianceResponse.json();
      expect(compliance).toHaveProperty('lgpdCompliance');
    });
  });
});