import { test, expect } from '@playwright/test';

test.describe('🏥 Healthcare Compliance Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('LGPD Compliance: Data consent management', async ({ page }) => {
    await page.click('[data-testid="patient-registration"]');
    
    const consentModal = page.locator('[data-testid="lgpd-consent-modal"]');
    await expect(consentModal).toBeVisible();
    
    await expect(page.locator('[data-testid="consent-data-processing"]')).toBeVisible();
    await expect(page.locator('[data-testid="consent-data-sharing"]')).toBeVisible();
    await expect(page.locator('[data-testid="consent-marketing"]')).toBeVisible();
    
    await page.click('[data-testid="consent-decline"]');
    await expect(page.locator('[data-testid="consent-required-message"]')).toBeVisible();
    
    await page.check('[data-testid="consent-data-processing"]');
    await page.check('[data-testid="consent-data-sharing"]');
    await page.click('[data-testid="consent-accept"]');
    
    await expect(page.locator('[data-testid="patient-form"]')).toBeVisible();
    
    const auditLog = page.locator('[data-testid="audit-log"]');
    await expect(auditLog).toContainText('LGPD consent recorded');
  });

  test('ANVISA Compliance: Professional registration validation', async ({ page }) => {
    await page.goto('/professionals/register');
    
    await page.fill('[data-testid="professional-name"]', 'Dr. Ana Silva');
    await page.fill('[data-testid="professional-email"]', 'ana.silva@clinic.com');
    await page.fill('[data-testid="professional-crm"]', '12345');
    await page.selectOption('[data-testid="professional-specialty"]', 'dermatology');
    
    await page.click('[data-testid="validate-crm"]');
    
    await expect(page.locator('[data-testid="crm-validation-loading"]')).toBeVisible();
    
    await expect(page.locator('[data-testid="crm-validation-success"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="crm-status"]')).toContainText('Valid');
    
    await page.click('[data-testid="submit-professional"]');
    
    await expect(page.locator('[data-testid="professional-created"]')).toBeVisible();
    await expect(page.locator('[data-testid="anvisa-compliance-verified"]')).toBeVisible();
  });

  test('CFM Compliance: Medical procedure documentation', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'medico@clinic.com');
    await page.fill('[data-testid="password"]', 'SecurePass123');
    await page.click('[data-testid="login-button"]');
    
    await page.goto('/procedures/new');
    
    await page.fill('[data-testid="patient-id"]', 'PAT001');
    await page.selectOption('[data-testid="procedure-type"]', 'aesthetic');
    await page.fill('[data-testid="procedure-description"]', 'Aplicação de botox');
    
    await expect(page.locator('[data-testid="informed-consent"]')).toBeVisible();
    await expect(page.locator('[data-testid="medical-indication"]')).toBeVisible();
    await expect(page.locator('[data-testid="risk-assessment"]')).toBeVisible();
    
    await page.check('[data-testid="informed-consent"]');
    await page.fill('[data-testid="medical-indication"]', 'Rugas de expressão na testa');
    await page.fill('[data-testid="risk-assessment"]', 'Baixo risco, paciente sem contraindicações');
    
    await page.click('[data-testid="submit-procedure"]');
    
    await expect(page.locator('[data-testid="cfm-compliance-verified"]')).toBeVisible();
    await expect(page.locator('[data-testid="procedure-registered"]')).toContainText('CFM guidelines met');
  });

  test('Data Security: Patient data access controls', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'receptionist@clinic.com');
    await page.fill('[data-testid="password"]', 'UserPass123');
    await page.click('[data-testid="login-button"]');
    
    await page.goto('/patients');
    
    const patientRow = page.locator('[data-testid="patient-row"]').first();
    await expect(patientRow.locator('[data-testid="patient-cpf"]')).toContainText('***.**.***.***');
    await expect(patientRow.locator('[data-testid="patient-phone"]')).toContainText('(11) ****-****');
    
    await patientRow.click();
    await expect(page.locator('[data-testid="medical-records-restricted"]')).toBeVisible();
    await expect(page.locator('[data-testid="medical-records-restricted"]')).toContainText('Access restricted');
    
    await expect(page.locator('[data-testid="access-audit"]')).toContainText('Data access logged');
  });

  test('Emergency Access: Override procedures', async ({ page }) => {
    await page.goto('/emergency');
    
    await expect(page.locator('[data-testid="emergency-mode"]')).toBeVisible();
    
    await page.fill('[data-testid="emergency-patient-search"]', 'João Silva');
    await page.click('[data-testid="emergency-search-button"]');
    
    await expect(page.locator('[data-testid="emergency-patient-data"]')).toBeVisible();
    await expect(page.locator('[data-testid="patient-allergies"]')).toBeVisible();
    await expect(page.locator('[data-testid="patient-medications"]')).toBeVisible();
    await expect(page.locator('[data-testid="patient-medical-conditions"]')).toBeVisible();
    
    await expect(page.locator('[data-testid="emergency-access-logged"]')).toBeVisible();
    await expect(page.locator('[data-testid="emergency-justification"]')).toBeVisible();
    
    await page.fill('[data-testid="emergency-justification"]', 'Paciente inconsciente, necessário verificar alergias');
    await page.click('[data-testid="confirm-emergency-access"]');
    
    await expect(page.locator('[data-testid="emergency-audit-created"]')).toBeVisible();
  });

  test('Appointment Workflow: Complete healthcare journey', async ({ page }) => {
    await page.goto('/schedule');
    await page.selectOption('[data-testid="doctor-select"]', 'dr-ana-silva');
    await page.selectOption('[data-testid="procedure-select"]', 'consultation');
    await page.click('[data-testid="date-picker"] >> text=25');
    await page.click('[data-testid="time-slot-14-00"]');
    
    await page.fill('[data-testid="patient-name"]', 'Maria Santos');
    await page.fill('[data-testid="patient-phone"]', '(11) 99999-9999');
    await page.fill('[data-testid="patient-email"]', 'maria@email.com');
    
    await page.click('[data-testid="confirm-appointment"]');
    await expect(page.locator('[data-testid="appointment-confirmed"]')).toBeVisible();
    
    await page.goto('/checkin');
    await page.fill('[data-testid="checkin-phone"]', '(11) 99999-9999');
    await page.click('[data-testid="checkin-button"]');
    
    await expect(page.locator('[data-testid="pre-consultation-form"]')).toBeVisible();
    await page.fill('[data-testid="chief-complaint"]', 'Consulta de rotina');
    await page.click('[data-testid="submit-pre-consultation"]');
    
    await page.goto('/consultation/current');
    await page.fill('[data-testid="medical-notes"]', 'Paciente em bom estado geral');
    await page.fill('[data-testid="prescription"]', 'Protetor solar FPS 60');
    await page.click('[data-testid="complete-consultation"]');
    
    await expect(page.locator('[data-testid="consultation-completed"]')).toBeVisible();
    await expect(page.locator('[data-testid="medical-record-updated"]')).toBeVisible();
    await expect(page.locator('[data-testid="prescription-generated"]')).toBeVisible();
    
    await expect(page.locator('[data-testid="followup-scheduled"]')).toBeVisible();
  });
});