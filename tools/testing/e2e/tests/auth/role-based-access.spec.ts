/**
 * NeonPro Healthcare - Role-Based Access Control E2E Tests
 *
 * PRIORITY: CRITICAL - Healthcare role permissions and access control
 * COVERAGE: Doctor, Nurse, Admin, Secretary roles
 * COMPLIANCE: HIPAA, LGPD role-based data access
 */

import { expect, test } from '@playwright/test';

// Test user credentials for different roles
const testUsers = {
  doctor: {
    email: 'dr.cardiologista@neonpro.com',
    password: 'DoctorTest2024!',
    crm: 'CRM/SP 123456',
    role: 'Médico Cardiologista',
  },
  nurse: {
    email: 'enfermeira.chefe@neonpro.com',
    password: 'NurseTest2024!',
    coren: 'COREN/SP 654321',
    role: 'Enfermeira',
  },
  admin: {
    email: 'admin.clinica@neonpro.com',
    password: 'AdminTest2024!',
    role: 'Administrador',
  },
  secretary: {
    email: 'secretaria@neonpro.com',
    password: 'SecretaryTest2024!',
    role: 'Secretária',
  },
};

test.describe('Doctor Role Access Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');

    // Login as doctor
    await page.fill('input[type="email"]', testUsers.doctor.email);
    await page.fill('input[type="password"]', testUsers.doctor.password);
    await page.fill('[data-testid="crm-number"]', testUsers.doctor.crm);
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard');
  });

  test('should have full access to patient medical records', async ({ page }) => {
    await page.click('[data-testid="nav-patients"]');
    await page.click('[data-testid="patient-item-first"]');

    // Should access full medical history
    await expect(
      page.locator('[data-testid="medical-records-tab"]'),
    ).toBeVisible();
    await page.click('[data-testid="medical-records-tab"]');

    await expect(
      page.locator('[data-testid="complete-medical-history"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="add-diagnosis-btn"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="prescribe-medication-btn"]'),
    ).toBeVisible();

    // Should see sensitive medical information
    await expect(
      page.locator('[data-testid="patient-allergies"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="patient-medications"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="patient-conditions"]'),
    ).toBeVisible();
  });

  test('should be able to create and modify prescriptions', async ({ page }) => {
    await page.click('[data-testid="nav-prescriptions"]');

    // Should access prescription management
    await expect(
      page.locator('[data-testid="create-prescription-btn"]'),
    ).toBeVisible();
    await page.click('[data-testid="create-prescription-btn"]');

    // Should have full prescription form access
    await expect(
      page.locator('[data-testid="medication-select"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="dosage-input"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="frequency-select"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="digital-signature"]'),
    ).toBeVisible();

    // Fill prescription
    await page.click('[data-testid="medication-select"]');
    await page.click('[data-testid="medication-losartan"]');
    await page.fill('[data-testid="dosage-input"]', '50mg');
    await page.click('[data-testid="frequency-select"]');
    await page.click('[data-testid="frequency-daily"]');

    await page.click('[data-testid="save-prescription-btn"]');

    // Should save successfully with doctor's digital signature
    await expect(page.locator('text=Receita criada com sucesso')).toBeVisible();
    await expect(
      page.locator('[data-testid="prescription-signature"]'),
    ).toContainText(testUsers.doctor.crm);
  });

  test('should access administrative functions for their patients', async ({ page }) => {
    await page.click('[data-testid="nav-reports"]');

    // Should see doctor-specific reports
    await expect(
      page.locator('[data-testid="my-patients-report"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="prescription-summary"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="consultation-statistics"]'),
    ).toBeVisible();

    // Should NOT see system-wide admin reports
    await expect(
      page.locator('[data-testid="all-users-report"]'),
    ).not.toBeVisible();
    await expect(
      page.locator('[data-testid="system-configuration"]'),
    ).not.toBeVisible();
    await expect(
      page.locator('[data-testid="user-management"]'),
    ).not.toBeVisible();
  });

  test('should have emergency override capabilities', async ({ page }) => {
    await page.click('[data-testid="nav-patients"]');
    await page.click('[data-testid="patient-item-first"]');

    // Should have emergency access button
    await expect(
      page.locator('[data-testid="emergency-override-btn"]'),
    ).toBeVisible();
    await page.click('[data-testid="emergency-override-btn"]');

    // Should bypass normal consent requirements in emergency
    await expect(
      page.locator('[data-testid="emergency-access-modal"]'),
    ).toBeVisible();
    await page.fill(
      '[data-testid="emergency-justification"]',
      'Paciente inconsciente - decisão médica urgente',
    );
    await page.click('[data-testid="confirm-emergency-access"]');

    // Should grant full access and log the override
    await expect(
      page.locator('[data-testid="emergency-access-active"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="audit-log-entry"]')).toContainText(
      'Acesso emergencial autorizado',
    );
  });
});

test.describe('Nurse Role Access Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');

    // Login as nurse
    await page.fill('input[type="email"]', testUsers.nurse.email);
    await page.fill('input[type="password"]', testUsers.nurse.password);
    await page.fill('[data-testid="coren-number"]', testUsers.nurse.coren);
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard');
  });

  test('should have limited access to patient medical records', async ({ page }) => {
    await page.click('[data-testid="nav-patients"]');
    await page.click('[data-testid="patient-item-first"]');

    // Should see basic patient information
    await expect(
      page.locator('[data-testid="patient-basic-info"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="current-medications"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="vital-signs-tab"]')).toBeVisible();

    // Should NOT see sensitive diagnostic information
    await expect(
      page.locator('[data-testid="diagnosis-history"]'),
    ).not.toBeVisible();
    await expect(
      page.locator('[data-testid="psychiatric-records"]'),
    ).not.toBeVisible();

    // Should be able to add nursing notes
    await expect(
      page.locator('[data-testid="add-nursing-note-btn"]'),
    ).toBeVisible();
  });

  test('should be able to manage vital signs and nursing care', async ({ page }) => {
    await page.click('[data-testid="nav-patients"]');
    await page.click('[data-testid="patient-item-first"]');
    await page.click('[data-testid="vital-signs-tab"]');

    // Should add vital signs
    await page.click('[data-testid="add-vital-signs-btn"]');

    await page.fill('[data-testid="blood-pressure-systolic"]', '120');
    await page.fill('[data-testid="blood-pressure-diastolic"]', '80');
    await page.fill('[data-testid="temperature"]', '36.5');
    await page.fill('[data-testid="heart-rate"]', '72');
    await page.fill('[data-testid="respiratory-rate"]', '16');

    await page.click('[data-testid="save-vital-signs-btn"]');

    // Should save successfully
    await expect(page.locator('text=Sinais vitais registrados')).toBeVisible();
    await expect(
      page.locator('[data-testid="vital-signs-history"]'),
    ).toContainText('120/80');
  });

  test('should NOT be able to create prescriptions', async ({ page }) => {
    // Navigation to prescriptions should be restricted or limited
    await expect(
      page.locator('[data-testid="nav-prescriptions"]'),
    ).not.toBeVisible();

    // If accessed directly, should show permission error
    await page.goto('/prescriptions');
    await expect(page.locator('text=Acesso negado')).toBeVisible();
    await expect(
      page.locator('text=Apenas médicos podem prescrever medicamentos'),
    ).toBeVisible();
  });

  test('should be able to schedule appointments', async ({ page }) => {
    await page.click('[data-testid="nav-appointments"]');

    // Should see appointment scheduling interface
    await expect(
      page.locator('[data-testid="schedule-appointment-btn"]'),
    ).toBeVisible();
    await page.click('[data-testid="schedule-appointment-btn"]');

    // Should be able to create appointments
    await page.click('[data-testid="patient-search"]');
    await page.fill('[data-testid="patient-search"]', 'João Silva');
    await page.click('[data-testid="patient-option-first"]');

    await page.click('[data-testid="doctor-select"]');
    await page.click('[data-testid="doctor-option-first"]');

    await page.fill('[data-testid="appointment-date"]', '2025-01-15');
    await page.fill('[data-testid="appointment-time"]', '14:00');

    await page.click('[data-testid="save-appointment-btn"]');

    // Should save successfully
    await expect(
      page.locator('text=Consulta agendada com sucesso'),
    ).toBeVisible();
  });
});

test.describe('Administrator Role Access Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');

    // Login as admin
    await page.fill('input[type="email"]', testUsers.admin.email);
    await page.fill('input[type="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard');
  });

  test('should have full system administration access', async ({ page }) => {
    // Should see admin navigation options
    await expect(page.locator('[data-testid="nav-admin"]')).toBeVisible();
    await page.click('[data-testid="nav-admin"]');

    // Should access user management
    await expect(page.locator('[data-testid="user-management"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="system-configuration"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="audit-logs"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="backup-management"]'),
    ).toBeVisible();
  });

  test('should manage healthcare professional accounts', async ({ page }) => {
    await page.click('[data-testid="nav-admin"]');
    await page.click('[data-testid="user-management"]');

    // Should see all user accounts
    await expect(page.locator('[data-testid="user-list"]')).toBeVisible();

    // Should be able to add new professional
    await page.click('[data-testid="add-user-btn"]');

    await page.fill('[data-testid="professional-name"]', 'Dr. Novo Médico');
    await page.fill(
      '[data-testid="professional-email"]',
      'novo.medico@neonpro.com',
    );
    await page.fill('[data-testid="professional-crm"]', 'CRM/RJ 789012');

    await page.click('[data-testid="role-select"]');
    await page.click('[data-testid="role-doctor"]');

    await page.click('[data-testid="save-user-btn"]');

    // Should create account successfully
    await expect(
      page.locator('text=Profissional cadastrado com sucesso'),
    ).toBeVisible();
  });

  test('should access comprehensive audit logs', async ({ page }) => {
    await page.click('[data-testid="nav-admin"]');
    await page.click('[data-testid="audit-logs"]');

    // Should see all system activities
    await expect(page.locator('[data-testid="audit-log-table"]')).toBeVisible();

    // Should be able to filter logs
    await page.click('[data-testid="log-filter"]');
    await page.click('[data-testid="filter-patient-access"]');

    // Should see filtered results
    await expect(page.locator('[data-testid="audit-entry"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-timestamp"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-user"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-action"]')).toBeVisible();

    // Should export audit reports
    await page.click('[data-testid="export-audit-btn"]');
    await expect(
      page.locator('text=Relatório de auditoria gerado'),
    ).toBeVisible();
  });

  test('should NOT access patient medical records directly', async ({ page }) => {
    // Admin should not see patient navigation by default
    await expect(
      page.locator('[data-testid="nav-patients"]'),
    ).not.toBeVisible();

    // If accessed directly, should require justification
    await page.goto('/patients');

    await expect(
      page.locator('[data-testid="admin-access-justification"]'),
    ).toBeVisible();
    await expect(
      page.locator('text=Justifique o acesso administrativo aos dados'),
    ).toBeVisible();
  });
});

test.describe('Secretary Role Access Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');

    // Login as secretary
    await page.fill('input[type="email"]', testUsers.secretary.email);
    await page.fill('input[type="password"]', testUsers.secretary.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard');
  });

  test('should manage appointments and scheduling', async ({ page }) => {
    await page.click('[data-testid="nav-appointments"]');

    // Should have full appointment management access
    await expect(
      page.locator('[data-testid="appointment-calendar"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="schedule-appointment-btn"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="reschedule-appointment-btn"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="cancel-appointment-btn"]'),
    ).toBeVisible();

    // Should see appointment conflicts and availability
    await expect(
      page.locator('[data-testid="doctor-availability"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="appointment-conflicts"]'),
    ).toBeVisible();
  });

  test('should access basic patient contact information only', async ({ page }) => {
    await page.click('[data-testid="nav-patients"]');

    // Should see patient list for appointment purposes
    await expect(page.locator('[data-testid="patient-list"]')).toBeVisible();

    await page.click('[data-testid="patient-item-first"]');

    // Should see only contact information
    await expect(page.locator('[data-testid="patient-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="patient-phone"]')).toBeVisible();
    await expect(page.locator('[data-testid="patient-email"]')).toBeVisible();

    // Should NOT see medical information
    await expect(
      page.locator('[data-testid="medical-records-tab"]'),
    ).not.toBeVisible();
    await expect(
      page.locator('[data-testid="patient-allergies"]'),
    ).not.toBeVisible();
    await expect(
      page.locator('[data-testid="patient-medications"]'),
    ).not.toBeVisible();
  });

  test('should manage financial and billing information', async ({ page }) => {
    await page.click('[data-testid="nav-billing"]');

    // Should access billing dashboard
    await expect(
      page.locator('[data-testid="billing-dashboard"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="invoice-management"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="payment-processing"]'),
    ).toBeVisible();

    // Should generate financial reports
    await page.click('[data-testid="generate-report-btn"]');
    await page.click('[data-testid="report-type-financial"]');
    await page.click('[data-testid="generate-btn"]');

    await expect(
      page.locator('text=Relatório financeiro gerado'),
    ).toBeVisible();
  });

  test('should NOT access prescription or medical diagnosis features', async ({ page }) => {
    // Should not see medical navigation
    await expect(
      page.locator('[data-testid="nav-prescriptions"]'),
    ).not.toBeVisible();
    await expect(
      page.locator('[data-testid="nav-diagnosis"]'),
    ).not.toBeVisible();

    // Direct access should be denied
    await page.goto('/prescriptions');
    await expect(page.locator('text=Acesso negado')).toBeVisible();
    await expect(
      page.locator('text=Função não autorizada para secretários'),
    ).toBeVisible();
  });
});

test.describe('Cross-Role Permissions and Escalation', () => {
  test('should handle role escalation requests', async ({ page }) => {
    // Login as nurse
    await page.goto('/login');
    await page.fill('input[type="email"]', testUsers.nurse.email);
    await page.fill('input[type="password"]', testUsers.nurse.password);
    await page.fill('[data-testid="coren-number"]', testUsers.nurse.coren);
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard');

    // Try to access restricted area
    await page.goto('/prescriptions');

    // Should show escalation request option
    await expect(
      page.locator('[data-testid="request-temporary-access"]'),
    ).toBeVisible();
    await page.click('[data-testid="request-temporary-access"]');

    // Should show escalation form
    await expect(page.locator('[data-testid="escalation-form"]')).toBeVisible();
    await page.fill(
      '[data-testid="escalation-justification"]',
      'Médico não disponível - paciente crítico necessita medicação',
    );
    await page.click('[data-testid="submit-escalation-request"]');

    // Should show pending approval
    await expect(
      page.locator('text=Solicitação enviada para aprovação'),
    ).toBeVisible();
  });

  test('should audit all role-based access attempts', async ({ page }) => {
    // Login as admin to check audit logs
    await page.goto('/login');
    await page.fill('input[type="email"]', testUsers.admin.email);
    await page.fill('input[type="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard');

    await page.click('[data-testid="nav-admin"]');
    await page.click('[data-testid="audit-logs"]');

    // Filter for access control events
    await page.click('[data-testid="log-filter"]');
    await page.click('[data-testid="filter-access-control"]');

    // Should show role-based access attempts
    await expect(page.locator('[data-testid="audit-entry"]')).toBeVisible();
    await expect(page.locator('text=Access denied')).toBeVisible();
    await expect(page.locator('text=Role escalation requested')).toBeVisible();
    await expect(page.locator('text=Emergency override')).toBeVisible();
  });

  test('should enforce time-based role restrictions', async ({ page }) => {
    // Login as doctor
    await page.goto('/login');
    await page.fill('input[type="email"]', testUsers.doctor.email);
    await page.fill('input[type="password"]', testUsers.doctor.password);
    await page.fill('[data-testid="crm-number"]', testUsers.doctor.crm);
    await page.click('button[type="submit"]');

    await page.waitForURL('/dashboard');

    // Should show working hours restrictions if outside normal hours
    await page.evaluate(() => {
      // Mock current time to be outside working hours
      Date.now = () => new Date('2024-01-01 23:00:00').getTime();
    });

    await page.click('[data-testid="nav-prescriptions"]');

    // Should show time-based warning
    await expect(
      page.locator('[data-testid="after-hours-warning"]'),
    ).toBeVisible();
    await expect(
      page.locator('text=Prescrição fora do horário comercial'),
    ).toBeVisible();
    await expect(page.locator('text=Justificativa necessária')).toBeVisible();

    // Should require additional justification
    await page.click('[data-testid="create-prescription-btn"]');
    await expect(
      page.locator('[data-testid="after-hours-justification"]'),
    ).toBeVisible();
  });
});
