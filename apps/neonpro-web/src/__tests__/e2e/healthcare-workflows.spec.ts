/**
 * Healthcare E2E Tests - Critical Patient Workflows
 * Tests using synthetic data for LGPD compliance
 */

import { test, expect } from '@playwright/test';

// Synthetic test data (LGPD compliant)
const TEST_PATIENT = {
  name: 'João Silva Test',
  email: 'joao.test@example.com',
  phone: '11999999999',
  cpf: '12345678901', // Synthetic CPF
  birth_date: '1980-01-01',
};

const TEST_DOCTOR = {
  name: 'Dr. Maria Santos Test',
  email: 'dra.maria.test@hospital.com',
  crm: 'CRM12345',
  specialty: 'Cardiologia',
};

test.describe('Healthcare Critical Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await page.goto('/login');
    await page.fill('[data-testid=email]', 'admin.test@neonpro.com');
    await page.fill('[data-testid=password]', 'test123456');
    await page.click('[data-testid=login-button]');
    
    // Wait for dashboard to load
    await expect(page.locator('[data-testid=dashboard]')).toBeVisible();
  });

  test('Patient Registration and Management', async ({ page }) => {
    // Navigate to patients
    await page.click('[data-testid=nav-patients]');
    await expect(page.locator('h1')).toContainText('Pacientes');

    // Create new patient
    await page.click('[data-testid=new-patient-button]');
    
    // Fill patient form
    await page.fill('[data-testid=patient-name]', TEST_PATIENT.name);
    await page.fill('[data-testid=patient-email]', TEST_PATIENT.email);
    await page.fill('[data-testid=patient-phone]', TEST_PATIENT.phone);
    await page.fill('[data-testid=patient-cpf]', TEST_PATIENT.cpf);
    await page.fill('[data-testid=patient-birth-date]', TEST_PATIENT.birth_date);
    
    // Submit form
    await page.click('[data-testid=save-patient-button]');
    
    // Verify patient was created
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    await expect(page.locator(`text=${TEST_PATIENT.name}`)).toBeVisible();

    // Search for patient
    await page.fill('[data-testid=patient-search]', TEST_PATIENT.name);
    await page.keyboard.press('Enter');
    await expect(page.locator(`text=${TEST_PATIENT.name}`)).toBeVisible();

    // View patient details
    await page.click(`[data-testid=patient-${TEST_PATIENT.name.replace(/\s+/g, '-')}]`);
    await expect(page.locator('h1')).toContainText(TEST_PATIENT.name);
  });

  test('Appointment Scheduling Workflow', async ({ page }) => {
    // Navigate to appointments
    await page.click('[data-testid=nav-appointments]');
    await expect(page.locator('h1')).toContainText('Agendamentos');

    // Create new appointment
    await page.click('[data-testid=new-appointment-button]');
    
    // Select patient (assuming TEST_PATIENT exists)
    await page.click('[data-testid=patient-select]');
    await page.fill('[data-testid=patient-search-input]', TEST_PATIENT.name);
    await page.click(`[data-testid=patient-option-${TEST_PATIENT.name}]`);
    
    // Select doctor
    await page.click('[data-testid=doctor-select]');
    await page.click(`[data-testid=doctor-option-${TEST_DOCTOR.name}]`);
    
    // Select date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    await page.fill('[data-testid=appointment-date]', dateString);
    await page.selectOption('[data-testid=appointment-time]', '09:00');
    await page.selectOption('[data-testid=appointment-type]', 'consultation');
    
    // Submit appointment
    await page.click('[data-testid=save-appointment-button]');
    
    // Verify appointment was created
    await expect(page.locator('[data-testid=success-message]')).toBeVisible();
    
    // Check appointment appears in calendar
    await expect(page.locator(`text=${TEST_PATIENT.name}`)).toBeVisible();
    await expect(page.locator(`text=${TEST_DOCTOR.name}`)).toBeVisible();
  });

  test('Dashboard Healthcare Metrics', async ({ page }) => {
    // Navigate to dashboard
    await page.click('[data-testid=nav-dashboard]');
    
    // Check key healthcare metrics are displayed
    await expect(page.locator('[data-testid=total-patients]')).toBeVisible();
    await expect(page.locator('[data-testid=today-appointments]')).toBeVisible();
    await expect(page.locator('[data-testid=pending-results]')).toBeVisible();
    
    // Check performance metrics load within healthcare standards
    const metricsLoadTime = await page.evaluate(() => {
      return performance.now();
    });
    
    await page.waitForSelector('[data-testid=dashboard-metrics]');
    
    const finalLoadTime = await page.evaluate(() => {
      return performance.now();
    });
    
    // Healthcare systems should load within 2 seconds
    expect(finalLoadTime - metricsLoadTime).toBeLessThan(2000);
  });

  test('Patient Portal Access', async ({ page }) => {
    // Test patient portal functionality
    await page.goto('/patient-portal');
    
    // Login as patient
    await page.fill('[data-testid=patient-email]', TEST_PATIENT.email);
    await page.fill('[data-testid=patient-cpf]', TEST_PATIENT.cpf);
    await page.click('[data-testid=patient-login-button]');
    
    // Verify patient can see their appointments
    await expect(page.locator('[data-testid=patient-appointments]')).toBeVisible();
    
    // Verify patient can see their medical history
    await page.click('[data-testid=medical-history-tab]');
    await expect(page.locator('[data-testid=medical-history-list]')).toBeVisible();
    
    // Test appointment rescheduling
    await page.click('[data-testid=reschedule-appointment]');
    await expect(page.locator('[data-testid=reschedule-modal]')).toBeVisible();
  });

  test('Healthcare Compliance Features', async ({ page }) => {
    // Test LGPD compliance features
    await page.goto('/privacy');
    await expect(page.locator('text=LGPD')).toBeVisible();
    await expect(page.locator('text=Consentimento')).toBeVisible();
    
    // Test audit log access (admin only)
    await page.goto('/admin/audit-logs');
    await expect(page.locator('[data-testid=audit-logs-table]')).toBeVisible();
    
    // Verify sensitive data is masked
    await expect(page.locator('text=***')).toBeVisible(); // CPF should be masked
  });

  test('System Performance and Health', async ({ page }) => {
    // Test health check endpoint
    const response = await page.request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    
    const health = await response.json();
    expect(health.status).toBe('healthy');
    expect(health.services.database.status).toBe('healthy');
    
    // Test API response times
    const apiStart = Date.now();
    const apiResponse = await page.request.get('/api/trpc/patients.list');
    const apiTime = Date.now() - apiStart;
    
    expect(apiResponse.ok()).toBeTruthy();
    expect(apiTime).toBeLessThan(1000); // API should respond within 1 second
  });

  test('Mobile Responsiveness - Patient Portal', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test mobile patient portal
    await page.goto('/patient-portal');
    
    // Verify mobile navigation works
    await page.click('[data-testid=mobile-menu-button]');
    await expect(page.locator('[data-testid=mobile-menu]')).toBeVisible();
    
    // Test appointment booking on mobile
    await page.click('[data-testid=book-appointment-mobile]');
    await expect(page.locator('[data-testid=appointment-form]')).toBeVisible();
    
    // Verify form is mobile-friendly
    const appointmentForm = page.locator('[data-testid=appointment-form]');
    await expect(appointmentForm).toBeVisible();
  });
});