/**
 * NeonPro Healthcare - Patient Registration E2E Tests
 *
 * PRIORITY: CRITICAL - Core patient onboarding workflows
 * COVERAGE: Complete patient journey from registration to first appointment
 * COMPLIANCE: LGPD consent, CFM regulations, ANVISA requirements
 */

import { expect, test } from '@playwright/test';

test.describe('Complete Patient Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as healthcare professional
    await page.goto('/login');
    await page.fill('input[type="email"]', 'dr.silva@neonpro.com');
    await page.fill('input[type="password"]', 'HealthcareTest2024!');
    await page.fill('[data-testid="crm-number"]', 'CRM/SP 123456');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should complete full patient onboarding with LGPD compliance', async ({
    page,
  }) => {
    // Navigate to patient registration
    await page.click('[data-testid="nav-patients"]');
    await expect(page).toHaveURL(/\/patients/);

    await page.click('[data-testid="add-patient-btn"]');
    await expect(page).toHaveURL(/\/patients\/new/);

    // STEP 1: Personal Information
    await page.fill('[data-testid="patient-name"]', 'João Silva Santos');
    await page.fill('[data-testid="patient-cpf"]', '123.456.789-00');
    await page.fill('[data-testid="patient-rg"]', '12.345.678-9');
    await page.fill('[data-testid="patient-birth-date"]', '15/08/1985');

    // Gender selection
    await page.click('[data-testid="patient-gender"]');
    await page.click('[data-testid="gender-male"]');

    // Nationality and marital status
    await page.click('[data-testid="patient-nationality"]');
    await page.click('[data-testid="nationality-brazilian"]');

    await page.click('[data-testid="patient-marital-status"]');
    await page.click('[data-testid="marital-married"]');

    // Should validate CPF format and uniqueness
    await expect(
      page.locator('[data-testid="cpf-validation-success"]')
    ).toBeVisible();

    // STEP 2: Contact Information
    await page.fill('[data-testid="patient-email"]', 'joao.silva@email.com');
    await page.fill('[data-testid="patient-phone"]', '(11) 99999-9999');
    await page.fill('[data-testid="patient-phone-alt"]', '(11) 3333-3333');

    // Address information
    await page.fill('[data-testid="patient-cep"]', '01234-567');

    // Should auto-fill address from CEP
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="patient-address"]')).toHaveValue(
      /Rua das Flores/
    );
    await expect(page.locator('[data-testid="patient-city"]')).toHaveValue(
      'São Paulo'
    );
    await expect(page.locator('[data-testid="patient-state"]')).toHaveValue(
      'SP'
    );

    // Complete address details
    await page.fill('[data-testid="patient-address-number"]', '123');
    await page.fill('[data-testid="patient-address-complement"]', 'Apto 45');
    await page.fill('[data-testid="patient-neighborhood"]', 'Centro');

    // STEP 3: Emergency Contact
    await page.fill(
      '[data-testid="emergency-contact-name"]',
      'Maria Silva Santos'
    );
    await page.fill('[data-testid="emergency-contact-relationship"]', 'Esposa');
    await page.fill(
      '[data-testid="emergency-contact-phone"]',
      '(11) 88888-8888'
    );

    // STEP 4: Health Insurance Information
    await page.click('[data-testid="insurance-provider"]');
    await page.click('[data-testid="insurance-unimed"]');

    await page.fill('[data-testid="insurance-card-number"]', '123456789012345');
    await page.fill('[data-testid="insurance-validity"]', '12/2025');

    // Should validate insurance card
    await expect(
      page.locator('[data-testid="insurance-validation-success"]')
    ).toBeVisible();

    // STEP 5: Medical History
    await page.fill(
      '[data-testid="patient-allergies"]',
      'Penicilina, Dipirona'
    );
    await page.fill(
      '[data-testid="patient-medications"]',
      'Losartana 50mg - Hipertensão'
    );
    await page.fill(
      '[data-testid="patient-medical-history"]',
      'Hipertensão arterial sistêmica diagnosticada em 2020. Controlada com medicação.'
    );

    // Previous surgeries
    await page.click('[data-testid="add-surgery-btn"]');
    await page.fill('[data-testid="surgery-description"]', 'Apendicectomia');
    await page.fill('[data-testid="surgery-date"]', '15/03/2018');
    await page.fill('[data-testid="surgery-hospital"]', 'Hospital São Paulo');

    // Family medical history
    await page.fill(
      '[data-testid="family-history"]',
      'Pai: Diabetes tipo 2, Mãe: Hipertensão'
    );

    // STEP 6: LGPD Consent Management
    await expect(
      page.locator('[data-testid="lgpd-consent-section"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Consentimento para Tratamento de Dados')
    ).toBeVisible();

    // Essential medical data consent (required)
    await expect(
      page.locator('[data-testid="consent-medical-data"]')
    ).toBeChecked();
    await expect(
      page.locator('[data-testid="consent-medical-data"]')
    ).toBeDisabled();

    // Optional consents
    await page.check('[data-testid="consent-telemedicine"]');
    await page.check('[data-testid="consent-appointment-reminders"]');

    // Marketing consent (optional)
    await page.check('[data-testid="consent-marketing"]');

    // Data sharing consent details
    await page.click('[data-testid="view-data-sharing-details"]');
    await expect(
      page.locator('[data-testid="data-sharing-modal"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Finalidades do tratamento de dados')
    ).toBeVisible();
    await expect(
      page.locator('text=Base legal: Consentimento do titular')
    ).toBeVisible();
    await expect(
      page.locator('text=Prazo de retenção: Conforme legislação médica')
    ).toBeVisible();
    await page.click('[data-testid="close-modal"]');

    // Terms and conditions acceptance
    await page.check('[data-testid="accept-terms"]');
    await page.check('[data-testid="accept-privacy-policy"]');

    // Digital consent signature
    await page.fill('[data-testid="consent-signature"]', 'João Silva Santos');
    await page.fill(
      '[data-testid="consent-cpf-confirmation"]',
      '123.456.789-00'
    );

    // STEP 7: Professional Information Entry
    await page.fill(
      '[data-testid="referring-doctor"]',
      'Dr. Carlos Mendes - CRM/SP 456789'
    );
    await page.click('[data-testid="referral-reason"]');
    await page.click('[data-testid="referral-routine-checkup"]');

    // Save patient registration
    await page.click('[data-testid="save-patient-btn"]');

    // Should show success confirmation
    await expect(
      page.locator('[data-testid="registration-success"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Paciente cadastrado com sucesso')
    ).toBeVisible();
    await expect(page.locator('[data-testid="patient-id"]')).toBeVisible();

    // Should redirect to patient profile
    await expect(page).toHaveURL(/\/patients\/[a-zA-Z0-9-]+$/);

    // Should display registered information correctly
    await expect(
      page.locator('[data-testid="patient-profile-name"]')
    ).toContainText('João Silva Santos');
    await expect(
      page.locator('[data-testid="patient-profile-cpf"]')
    ).toContainText('123.456.789-00');
    await expect(
      page.locator('[data-testid="patient-profile-insurance"]')
    ).toContainText('Unimed');

    // Should show LGPD consent status
    await page.click('[data-testid="privacy-settings-tab"]');
    await expect(
      page.locator('[data-testid="consent-status-active"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="consent-timestamp"]')
    ).toBeVisible();
  });

  test('should handle patient registration with minimal required information', async ({
    page,
  }) => {
    await page.click('[data-testid="nav-patients"]');
    await page.click('[data-testid="add-patient-btn"]');

    // Fill only essential required fields
    await page.fill('[data-testid="patient-name"]', 'Maria Oliveira');
    await page.fill('[data-testid="patient-cpf"]', '987.654.321-00');
    await page.fill('[data-testid="patient-birth-date"]', '22/12/1990');

    await page.click('[data-testid="patient-gender"]');
    await page.click('[data-testid="gender-female"]');

    await page.fill('[data-testid="patient-phone"]', '(11) 77777-7777');

    // Minimal address
    await page.fill('[data-testid="patient-cep"]', '04567-890');
    await page.fill('[data-testid="patient-address-number"]', '456');

    // Essential LGPD consent only
    await expect(
      page.locator('[data-testid="consent-medical-data"]')
    ).toBeChecked();
    await page.check('[data-testid="accept-terms"]');
    await page.fill('[data-testid="consent-signature"]', 'Maria Oliveira');

    await page.click('[data-testid="save-patient-btn"]');

    // Should save successfully with minimal data
    await expect(
      page.locator('text=Paciente cadastrado com sucesso')
    ).toBeVisible();

    // Should prompt to complete profile later
    await expect(
      page.locator('[data-testid="complete-profile-reminder"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Complete o perfil do paciente para melhor atendimento')
    ).toBeVisible();
  });

  test('should validate duplicate CPF and prevent registration', async ({
    page,
  }) => {
    await page.click('[data-testid="nav-patients"]');
    await page.click('[data-testid="add-patient-btn"]');

    // Try to register with existing CPF
    await page.fill('[data-testid="patient-name"]', 'Paciente Duplicado');
    await page.fill('[data-testid="patient-cpf"]', '123.456.789-00'); // Already exists

    // Should show duplicate CPF error
    await expect(
      page.locator('[data-testid="cpf-duplicate-error"]')
    ).toBeVisible();
    await expect(
      page.locator('text=CPF já cadastrado no sistema')
    ).toBeVisible();

    // Should show existing patient information
    await expect(
      page.locator('[data-testid="existing-patient-info"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Paciente existente: João Silva Santos')
    ).toBeVisible();

    // Should offer to update existing record
    await expect(
      page.locator('[data-testid="update-existing-btn"]')
    ).toBeVisible();

    // Save button should be disabled
    await expect(
      page.locator('[data-testid="save-patient-btn"]')
    ).toBeDisabled();
  });

  test('should handle minor patient registration with guardian consent', async ({
    page,
  }) => {
    await page.click('[data-testid="nav-patients"]');
    await page.click('[data-testid="add-patient-btn"]');

    // Register minor patient
    await page.fill('[data-testid="patient-name"]', 'Ana Silva Santos');
    await page.fill('[data-testid="patient-cpf"]', '111.222.333-44');
    await page.fill('[data-testid="patient-birth-date"]', '15/08/2015'); // 8 years old

    // Should detect minor and show guardian section
    await expect(
      page.locator('[data-testid="minor-patient-warning"]')
    ).toBeVisible();
    await expect(page.locator('text=Paciente menor de idade')).toBeVisible();
    await expect(
      page.locator('[data-testid="guardian-section"]')
    ).toBeVisible();

    // Guardian information
    await page.fill('[data-testid="guardian-name"]', 'João Silva Santos');
    await page.fill('[data-testid="guardian-cpf"]', '123.456.789-00');
    await page.fill('[data-testid="guardian-relationship"]', 'Pai');
    await page.fill('[data-testid="guardian-phone"]', '(11) 99999-9999');

    // Legal document validation
    await page.setInputFiles(
      '[data-testid="birth-certificate"]',
      'path/to/birth-certificate.pdf'
    );
    await page.setInputFiles(
      '[data-testid="guardian-id"]',
      'path/to/guardian-id.pdf'
    );

    // Guardian consent for data processing
    await page.check('[data-testid="guardian-consent-medical"]');
    await page.fill('[data-testid="guardian-signature"]', 'João Silva Santos');

    await page.click('[data-testid="save-patient-btn"]');

    // Should save successfully with guardian information
    await expect(
      page.locator('text=Paciente menor cadastrado com sucesso')
    ).toBeVisible();

    // Should show guardian information in profile
    await expect(page.locator('[data-testid="guardian-info"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="guardian-name-display"]')
    ).toContainText('João Silva Santos');
  });

  test('should handle patient registration with special healthcare needs', async ({
    page,
  }) => {
    await page.click('[data-testid="nav-patients"]');
    await page.click('[data-testid="add-patient-btn"]');

    // Basic information
    await page.fill(
      '[data-testid="patient-name"]',
      'Carlos Accessibility Test'
    );
    await page.fill('[data-testid="patient-cpf"]', '555.666.777-88');
    await page.fill('[data-testid="patient-birth-date"]', '10/05/1980');

    // Special needs section
    await page.click('[data-testid="special-needs-section"]');

    // Mobility needs
    await page.check('[data-testid="needs-wheelchair-access"]');
    await page.check('[data-testid="needs-mobility-assistance"]');

    // Communication needs
    await page.check('[data-testid="needs-sign-language"]');
    await page.check('[data-testid="needs-large-print"]');

    // Medical devices
    await page.check('[data-testid="uses-pacemaker"]');
    await page.fill(
      '[data-testid="medical-device-details"]',
      'Marca-passo implantado em 2022'
    );

    // Accessibility preferences
    await page.click('[data-testid="preferred-appointment-time"]');
    await page.click('[data-testid="time-morning"]');

    await page.fill(
      '[data-testid="accessibility-notes"]',
      'Paciente prefere atendimento no térreo devido à dificuldade de locomoção'
    );

    // Standard consent process
    await page.check('[data-testid="accept-terms"]');
    await page.fill(
      '[data-testid="consent-signature"]',
      'Carlos Accessibility Test'
    );

    await page.click('[data-testid="save-patient-btn"]');

    // Should save with accessibility flags
    await expect(
      page.locator('text=Paciente cadastrado com sucesso')
    ).toBeVisible();

    // Should show accessibility indicators
    await expect(
      page.locator('[data-testid="accessibility-indicators"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="wheelchair-indicator"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="communication-needs-indicator"]')
    ).toBeVisible();
  });

  test('should validate required fields and show appropriate error messages', async ({
    page,
  }) => {
    await page.click('[data-testid="nav-patients"]');
    await page.click('[data-testid="add-patient-btn"]');

    // Try to save without required information
    await page.click('[data-testid="save-patient-btn"]');

    // Should show validation errors for required fields
    await expect(
      page.locator('[data-testid="error-patient-name"]')
    ).toContainText('Nome é obrigatório');
    await expect(
      page.locator('[data-testid="error-patient-cpf"]')
    ).toContainText('CPF é obrigatório');
    await expect(
      page.locator('[data-testid="error-birth-date"]')
    ).toContainText('Data de nascimento é obrigatória');
    await expect(page.locator('[data-testid="error-phone"]')).toContainText(
      'Telefone é obrigatório'
    );
    await expect(page.locator('[data-testid="error-consent"]')).toContainText(
      'Consentimento é obrigatório'
    );

    // Test invalid data formats
    await page.fill('[data-testid="patient-cpf"]', '123456789'); // Invalid format
    await page.fill('[data-testid="patient-birth-date"]', '32/13/1990'); // Invalid date
    await page.fill('[data-testid="patient-phone"]', '123'); // Invalid phone

    await page.click('[data-testid="save-patient-btn"]');

    // Should show format validation errors
    await expect(
      page.locator('[data-testid="error-cpf-format"]')
    ).toContainText('CPF deve ter formato 000.000.000-00');
    await expect(
      page.locator('[data-testid="error-date-format"]')
    ).toContainText('Data inválida');
    await expect(
      page.locator('[data-testid="error-phone-format"]')
    ).toContainText('Telefone deve ter formato (00) 00000-0000');
  });

  test('should support patient self-registration with professional validation', async ({
    page,
  }) => {
    // Navigate to self-registration page
    await page.goto('/patient-self-register');

    await expect(page.locator('h1')).toContainText('Cadastro de Paciente');
    await expect(
      page.locator('[data-testid="self-registration-form"]')
    ).toBeVisible();

    // Patient fills own information
    await page.fill('[data-testid="patient-name"]', 'Pedro Auto Cadastro');
    await page.fill('[data-testid="patient-cpf"]', '999.888.777-66');
    await page.fill('[data-testid="patient-email"]', 'pedro@email.com');
    await page.fill('[data-testid="patient-phone"]', '(11) 66666-6666');
    await page.fill('[data-testid="patient-birth-date"]', '25/07/1988');

    // Clinic selection
    await page.click('[data-testid="clinic-select"]');
    await page.click('[data-testid="clinic-neonpro-centro"]');

    // Insurance information
    await page.click('[data-testid="insurance-provider"]');
    await page.click('[data-testid="insurance-sus"]');

    // LGPD consent
    await page.check('[data-testid="accept-terms"]');
    await page.check('[data-testid="consent-telemedicine"]');

    // Digital signature
    await page.fill('[data-testid="consent-signature"]', 'Pedro Auto Cadastro');

    await page.click('[data-testid="submit-registration-btn"]');

    // Should show pending validation message
    await expect(
      page.locator('[data-testid="registration-pending"]')
    ).toBeVisible();
    await expect(
      page.locator('text=Cadastro enviado para validação')
    ).toBeVisible();
    await expect(
      page.locator('text=Você receberá confirmação em até 24 horas')
    ).toBeVisible();

    // Should send notification to clinic
    await expect(
      page.locator('[data-testid="confirmation-email"]')
    ).toContainText('pedro@email.com');
  });
});
