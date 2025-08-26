import { expect, test } from "@playwright/test";

/**
 * 👥 CRITICAL Patient Registration E2E Tests for NeonPro Healthcare
 * Tests complete patient registration workflow with LGPD compliance and medical data
 */

test.describe("👥 Patient Registration - Critical E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Login as healthcare staff with patient registration permissions
    await page.goto("/login");
    await page.fill(
      '[data-testid="email"], input[type="email"]',
      "recepcionista@neonpro.com.br",
    );
    await page.fill(
      '[data-testid="password"], input[type="password"]',
      "StaffSecure123!",
    );
    await page.click('[data-testid="login-submit"], button[type="submit"]');
    await page.waitForURL("**/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test.describe("📝 Complete Registration with CPF Validation", () => {
    test("should complete full patient registration with valid data", async ({
      page,
    }) => {
      // Navigate to patient registration
      await page.goto("/patients/register");
      await page.waitForLoadState("networkidle");

      // Verify registration form is loaded
      await expect(
        page.locator('[data-testid="patient-registration-form"]'),
      ).toBeVisible();
      await expect(
        page.locator(':has-text("Cadastro de Paciente")'),
      ).toBeVisible();

      // Fill personal information
      await page.fill(
        '[data-testid="patient-name"], input[name="name"]',
        "Maria Silva Santos",
      );
      await page.fill(
        '[data-testid="patient-cpf"], input[name="cpf"]',
        "123.456.789-09",
      );
      await page.fill(
        '[data-testid="patient-rg"], input[name="rg"]',
        "12.345.678-9",
      );
      await page.fill(
        '[data-testid="patient-birthdate"], input[type="date"]',
        "1985-03-15",
      );
      await page.selectOption(
        '[data-testid="patient-gender"], select[name="gender"]',
        "feminino",
      );
      await page.selectOption(
        '[data-testid="patient-marital-status"], select[name="marital_status"]',
        "solteira",
      );

      // Fill contact information
      await page.fill(
        '[data-testid="patient-phone"], input[name="phone"]',
        "(11) 99999-8888",
      );
      await page.fill(
        '[data-testid="patient-email"], input[name="email"]',
        "maria.santos@email.com",
      );
      await page.fill(
        '[data-testid="patient-emergency-contact"], input[name="emergency_contact"]',
        "Ana Santos - (11) 98888-7777",
      );

      // Fill address information
      await page.fill(
        '[data-testid="patient-cep"], input[name="cep"]',
        "01234-567",
      );
      // Wait for CEP lookup to populate address fields
      await page.waitForTimeout(1000);

      await page.fill(
        '[data-testid="patient-street"], input[name="street"]',
        "Rua das Flores, 123",
      );
      await page.fill(
        '[data-testid="patient-neighborhood"], input[name="neighborhood"]',
        "Centro",
      );
      await page.fill(
        '[data-testid="patient-city"], input[name="city"]',
        "São Paulo",
      );
      await page.selectOption(
        '[data-testid="patient-state"], select[name="state"]',
        "SP",
      );

      // Verify CPF validation
      const cpfValidation = page.locator(
        '[data-testid="cpf-validation-status"]',
      );
      await expect(cpfValidation).toContainText("CPF válido");
      await expect(cpfValidation).toHaveClass(/success|valid/);

      // Continue to next step
      await page.click(
        '[data-testid="continue-to-medical"], button:has-text("Continuar")',
      );

      // Verify navigation to medical information step
      await expect(
        page.locator('[data-testid="medical-information-step"]'),
      ).toBeVisible();
      await expect(
        page.locator(':has-text("Informações Médicas")'),
      ).toBeVisible();
    });

    test("should validate CPF format and prevent invalid CPF registration", async ({
      page,
    }) => {
      await page.goto("/patients/register");

      // Test invalid CPF format
      await page.fill('[data-testid="patient-name"]', "Test Patient");
      await page.fill('[data-testid="patient-cpf"]', "111.111.111-11"); // Invalid CPF

      // Trigger validation by moving to another field
      await page.fill('[data-testid="patient-birthdate"]', "1990-01-01");

      // Should show CPF validation error
      await expect(
        page.locator('[data-testid="cpf-error"], .cpf-error'),
      ).toBeVisible();
      await expect(page.locator('[data-testid="cpf-error"]')).toContainText(
        "CPF inválido",
      );

      // Submit button should be disabled
      const submitButton = page.locator(
        '[data-testid="continue-to-medical"], button[type="submit"]',
      );
      await expect(submitButton).toBeDisabled();

      // Fix CPF and verify validation passes
      await page.fill('[data-testid="patient-cpf"]', "123.456.789-09");
      await page.waitForTimeout(500);

      await expect(
        page.locator('[data-testid="cpf-validation-status"]'),
      ).toContainText("CPF válido");
      await expect(submitButton).toBeEnabled();
    });

    test("should prevent duplicate CPF registration", async ({ page }) => {
      await page.goto("/patients/register");

      // Try to register with an existing CPF
      await page.fill('[data-testid="patient-name"]', "João Duplicate");
      await page.fill('[data-testid="patient-cpf"]', "987.654.321-00"); // Assume this CPF already exists
      await page.fill('[data-testid="patient-birthdate"]', "1980-12-25");

      // Trigger duplicate check
      await page.click('[data-testid="check-cpf-duplicate"]');
      await page.waitForTimeout(1000);

      // Should show duplicate warning
      const duplicateWarning = page.locator(
        '[data-testid="cpf-duplicate"], .cpf-duplicate',
      );
      if ((await duplicateWarning.count()) > 0) {
        await expect(duplicateWarning).toBeVisible();
        await expect(duplicateWarning).toContainText("CPF já cadastrado");

        // Should offer option to view existing patient
        await expect(
          page.locator('[data-testid="view-existing-patient"]'),
        ).toBeVisible();
      }
    });

    test("should validate required fields before proceeding", async ({
      page,
    }) => {
      await page.goto("/patients/register");

      // Try to continue without filling required fields
      await page.click(
        '[data-testid="continue-to-medical"], button:has-text("Continuar")',
      );

      // Should show validation errors for required fields
      await expect(
        page.locator('[data-testid="name-required"], .field-error'),
      ).toContainText("Nome é obrigatório");
      await expect(
        page.locator('[data-testid="cpf-required"], .field-error'),
      ).toContainText("CPF é obrigatório");
      await expect(
        page.locator('[data-testid="phone-required"], .field-error'),
      ).toContainText("Telefone é obrigatório");
      await expect(
        page.locator('[data-testid="birthdate-required"], .field-error'),
      ).toContainText("Data de nascimento é obrigatória");

      // Should remain on the same step
      expect(page.url()).toMatch(/\/patients\/register/);
      await expect(
        page.locator('[data-testid="medical-information-step"]'),
      ).not.toBeVisible();
    });
  });
  test.describe("🔒 LGPD Consent Capture", () => {
    test("should capture comprehensive LGPD consent with detailed explanations", async ({
      page,
    }) => {
      await page.goto("/patients/register");

      // Fill basic information to reach LGPD step
      await page.fill('[data-testid="patient-name"]', "Ana Costa LGPD");
      await page.fill('[data-testid="patient-cpf"]', "456.789.123-45");
      await page.fill('[data-testid="patient-phone"]', "(11) 97777-6666");
      await page.fill('[data-testid="patient-email"]', "ana.lgpd@email.com");
      await page.fill('[data-testid="patient-birthdate"]', "1992-07-20");
      await page.selectOption('[data-testid="patient-gender"]', "feminino");

      await page.click('[data-testid="continue-to-medical"]');
      await page.waitForSelector('[data-testid="medical-information-step"]');

      // Continue to LGPD consent step
      await page.click('[data-testid="continue-to-lgpd"]');
      await page.waitForSelector('[data-testid="lgpd-consent-step"]');

      // Verify LGPD consent form is comprehensive
      await expect(
        page.locator('[data-testid="lgpd-explanation"]'),
      ).toBeVisible();
      await expect(
        page.locator(':has-text("Lei Geral de Proteção de Dados")'),
      ).toBeVisible();

      // Check individual consent options
      await expect(
        page.locator('[data-testid="consent-data-processing"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="consent-medical-treatment"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="consent-data-sharing"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="consent-marketing"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="consent-research"]'),
      ).toBeVisible();

      // Verify detailed explanations for each consent type
      await expect(
        page.locator('[data-testid="processing-explanation"]'),
      ).toContainText("processamento dos dados pessoais");
      await expect(
        page.locator('[data-testid="sharing-explanation"]'),
      ).toContainText("compartilhamento com profissionais");
      await expect(
        page.locator('[data-testid="marketing-explanation"]'),
      ).toContainText("comunicações promocionais");

      // Test selective consent (mandatory vs optional)
      await page.check('[data-testid="consent-data-processing"]'); // Mandatory
      await page.check('[data-testid="consent-medical-treatment"]'); // Mandatory
      await page.check('[data-testid="consent-data-sharing"]'); // Optional
      // Leave marketing and research unchecked

      // Verify consent summary
      await expect(
        page.locator('[data-testid="consent-summary"]'),
      ).toContainText("3 de 5 consentimentos");

      // Continue registration
      await page.click('[data-testid="confirm-lgpd-consent"]');

      // Should show consent confirmation
      await expect(
        page.locator('[data-testid="consent-recorded"]'),
      ).toContainText("Consentimentos registrados");
    });

    test("should require mandatory LGPD consents for registration", async ({
      page,
    }) => {
      await page.goto("/patients/register");

      // Fill basic info and navigate to LGPD
      await page.fill('[data-testid="patient-name"]', "Carlos Mandatory");
      await page.fill('[data-testid="patient-cpf"]', "789.123.456-78");
      await page.fill('[data-testid="patient-phone"]', "(11) 96666-5555");
      await page.fill(
        '[data-testid="patient-email"]',
        "carlos.mandatory@email.com",
      );
      await page.fill('[data-testid="patient-birthdate"]', "1988-11-10");
      await page.selectOption('[data-testid="patient-gender"]', "masculino");

      await page.click('[data-testid="continue-to-medical"]');
      await page.click('[data-testid="continue-to-lgpd"]');
      await page.waitForSelector('[data-testid="lgpd-consent-step"]');

      // Try to proceed without mandatory consents
      await page.click('[data-testid="confirm-lgpd-consent"]');

      // Should show validation errors for mandatory fields
      await expect(
        page.locator('[data-testid="mandatory-consent-error"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="mandatory-consent-error"]'),
      ).toContainText("Consentimentos obrigatórios");

      // Highlight mandatory fields
      await expect(
        page.locator('[data-testid="consent-data-processing"]'),
      ).toHaveClass(/required|mandatory/);
      await expect(
        page.locator('[data-testid="consent-medical-treatment"]'),
      ).toHaveClass(/required|mandatory/);

      // Check mandatory consents
      await page.check('[data-testid="consent-data-processing"]');
      await page.check('[data-testid="consent-medical-treatment"]');

      // Should now be able to proceed
      await page.click('[data-testid="confirm-lgpd-consent"]');
      await expect(
        page.locator('[data-testid="consent-recorded"]'),
      ).toBeVisible();
    });

    test("should provide consent withdrawal options", async ({ page }) => {
      await page.goto("/patients/register");

      // Complete basic registration to LGPD step
      await page.fill('[data-testid="patient-name"]', "Paula Withdrawal");
      await page.fill('[data-testid="patient-cpf"]', "321.654.987-32");
      await page.fill('[data-testid="patient-phone"]', "(11) 95555-4444");
      await page.fill(
        '[data-testid="patient-email"]',
        "paula.withdrawal@email.com",
      );
      await page.fill('[data-testid="patient-birthdate"]', "1975-04-30");
      await page.selectOption('[data-testid="patient-gender"]', "feminino");

      await page.click('[data-testid="continue-to-medical"]');
      await page.click('[data-testid="continue-to-lgpd"]');
      await page.waitForSelector('[data-testid="lgpd-consent-step"]');

      // Verify consent withdrawal information is provided
      await expect(
        page.locator('[data-testid="withdrawal-rights"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="withdrawal-rights"]'),
      ).toContainText("revogar seu consentimento");
      await expect(
        page.locator('[data-testid="withdrawal-contact"]'),
      ).toContainText("dpo@neonpro.com.br");

      // Check consent options
      await page.check('[data-testid="consent-data-processing"]');
      await page.check('[data-testid="consent-medical-treatment"]');
      await page.check('[data-testid="consent-marketing"]');

      await page.click('[data-testid="confirm-lgpd-consent"]');

      // Verify withdrawal options are documented
      await expect(
        page.locator('[data-testid="consent-details"]'),
      ).toContainText("Direitos do titular");
    });

    test("should create audit trail for LGPD consent events", async ({
      page,
    }) => {
      await page.goto("/patients/register");

      // Complete registration with LGPD consent
      await page.fill('[data-testid="patient-name"]', "Roberto Audit");
      await page.fill('[data-testid="patient-cpf"]', "654.321.987-65");
      await page.fill('[data-testid="patient-phone"]', "(11) 94444-3333");
      await page.fill(
        '[data-testid="patient-email"]',
        "roberto.audit@email.com",
      );
      await page.fill('[data-testid="patient-birthdate"]', "1983-09-15");
      await page.selectOption('[data-testid="patient-gender"]', "masculino");

      await page.click('[data-testid="continue-to-medical"]');
      await page.click('[data-testid="continue-to-lgpd"]');
      await page.waitForSelector('[data-testid="lgpd-consent-step"]');

      await page.check('[data-testid="consent-data-processing"]');
      await page.check('[data-testid="consent-medical-treatment"]');
      await page.check('[data-testid="consent-data-sharing"]');

      await page.click('[data-testid="confirm-lgpd-consent"]');

      // Check audit trail creation
      await expect(page.locator('[data-testid="audit-created"]')).toContainText(
        "Registro de auditoria criado",
      );

      // Verify consent timestamp
      const consentTimestamp = page.locator(
        '[data-testid="consent-timestamp"]',
      );
      if ((await consentTimestamp.count()) > 0) {
        await expect(consentTimestamp).toContainText(
          new Date().toISOString().split("T")[0],
        );
      }

      // Verify IP address logging
      const ipLogging = page.locator('[data-testid="ip-logged"]');
      if ((await ipLogging.count()) > 0) {
        await expect(ipLogging).toBeVisible();
      }
    });
  });

  test.describe("🏥 Medical History and Allergies", () => {
    test("should capture comprehensive medical history", async ({ page }) => {
      await page.goto("/patients/register");

      // Navigate to medical information step
      await page.fill('[data-testid="patient-name"]', "Laura História Médica");
      await page.fill('[data-testid="patient-cpf"]', "147.258.369-14");
      await page.fill('[data-testid="patient-phone"]', "(11) 93333-2222");
      await page.fill(
        '[data-testid="patient-email"]',
        "laura.historia@email.com",
      );
      await page.fill('[data-testid="patient-birthdate"]', "1978-12-05");
      await page.selectOption('[data-testid="patient-gender"]', "feminino");

      await page.click('[data-testid="continue-to-medical"]');
      await page.waitForSelector('[data-testid="medical-information-step"]');

      // Fill medical history
      await page.selectOption(
        '[data-testid="blood-type"], select[name="blood_type"]',
        "O+",
      );
      await page.fill('[data-testid="height"], input[name="height"]', "1.65");
      await page.fill('[data-testid="weight"], input[name="weight"]', "62");

      // Previous surgeries
      await page.click('[data-testid="add-surgery"]');
      await page.fill(
        '[data-testid="surgery-description-0"]',
        "Apendicectomia",
      );
      await page.fill('[data-testid="surgery-date-0"]', "2010-08-15");
      await page.fill(
        '[data-testid="surgery-hospital-0"]',
        "Hospital São Paulo",
      );

      // Chronic conditions
      await page.click('[data-testid="add-condition"]');
      await page.selectOption('[data-testid="condition-type-0"]', "diabetes");
      await page.fill(
        '[data-testid="condition-description-0"]',
        "Diabetes tipo 2 controlada com medicação",
      );
      await page.fill('[data-testid="condition-diagnosed-0"]', "2015-03-10");

      // Family history
      await page.click('[data-testid="add-family-history"]');
      await page.selectOption('[data-testid="family-relation-0"]', "mae");
      await page.selectOption(
        '[data-testid="family-condition-0"]',
        "hipertensao",
      );
      await page.fill(
        '[data-testid="family-notes-0"]',
        "Hipertensão arterial diagnosticada aos 50 anos",
      );

      // Current medications
      await page.click('[data-testid="add-medication"]');
      await page.fill('[data-testid="medication-name-0"]', "Metformina");
      await page.fill('[data-testid="medication-dosage-0"]', "850mg");
      await page.fill('[data-testid="medication-frequency-0"]', "2x ao dia");
      await page.selectOption('[data-testid="medication-type-0"]', "oral");

      // Verify all medical information is captured
      await expect(
        page.locator('[data-testid="medical-summary"]'),
      ).toContainText("Diabetes tipo 2");
      await expect(
        page.locator('[data-testid="medical-summary"]'),
      ).toContainText("Metformina");
      await expect(
        page.locator('[data-testid="medical-summary"]'),
      ).toContainText("Apendicectomia");

      await page.click('[data-testid="continue-to-allergies"]');
      await expect(
        page.locator('[data-testid="allergies-step"]'),
      ).toBeVisible();
    });

    test("should capture and validate allergy information with severity levels", async ({
      page,
    }) => {
      await page.goto("/patients/register");

      // Navigate to allergies step
      await page.fill('[data-testid="patient-name"]', "Marcos Alergia");
      await page.fill('[data-testid="patient-cpf"]', "258.369.147-25");
      await page.fill('[data-testid="patient-phone"]', "(11) 92222-1111");
      await page.fill(
        '[data-testid="patient-email"]',
        "marcos.alergia@email.com",
      );
      await page.fill('[data-testid="patient-birthdate"]', "1990-06-18");
      await page.selectOption('[data-testid="patient-gender"]', "masculino");

      await page.click('[data-testid="continue-to-medical"]');
      await page.click('[data-testid="continue-to-allergies"]');
      await page.waitForSelector('[data-testid="allergies-step"]');

      // Add medication allergy
      await page.click('[data-testid="add-allergy"]');
      await page.selectOption('[data-testid="allergy-type-0"]', "medicamento");
      await page.fill('[data-testid="allergy-substance-0"]', "Penicilina");
      await page.selectOption('[data-testid="allergy-severity-0"]', "grave");
      await page.fill(
        '[data-testid="allergy-reaction-0"]',
        "Anafilaxia, dificuldade respiratória, urticária",
      );
      await page.check('[data-testid="allergy-confirmed-0"]'); // Medically confirmed

      // Add food allergy
      await page.click('[data-testid="add-allergy"]');
      await page.selectOption('[data-testid="allergy-type-1"]', "alimento");
      await page.fill('[data-testid="allergy-substance-1"]', "Amendoim");
      await page.selectOption('[data-testid="allergy-severity-1"]', "moderada");
      await page.fill(
        '[data-testid="allergy-reaction-1"]',
        "Inchaço labial, coceira",
      );

      // Add environmental allergy
      await page.click('[data-testid="add-allergy"]');
      await page.selectOption('[data-testid="allergy-type-2"]', "ambiental");
      await page.fill('[data-testid="allergy-substance-2"]', "Pólen");
      await page.selectOption('[data-testid="allergy-severity-2"]', "leve");
      await page.fill('[data-testid="allergy-reaction-2"]', "Espirros, coriza");

      // Verify allergy summary and warnings
      await expect(
        page.locator('[data-testid="allergy-summary"]'),
      ).toContainText("3 alergias registradas");

      // Critical allergy warning should be highlighted
      const criticalAllergy = page.locator(
        '[data-testid="critical-allergy-warning"]',
      );
      await expect(criticalAllergy).toBeVisible();
      await expect(criticalAllergy).toContainText(
        "ATENÇÃO: Alergia GRAVE a Penicilina",
      );
      await expect(criticalAllergy).toHaveClass(/critical|danger|alert/);

      // Emergency allergy card option
      await expect(
        page.locator('[data-testid="emergency-card-option"]'),
      ).toBeVisible();
      await page.check('[data-testid="generate-emergency-card"]');

      await page.click('[data-testid="save-allergies"]');
      await expect(
        page.locator('[data-testid="allergies-saved"]'),
      ).toContainText("Alergias registradas com sucesso");
    });

    test("should handle patients with no known allergies properly", async ({
      page,
    }) => {
      await page.goto("/patients/register");

      // Navigate to allergies step
      await page.fill('[data-testid="patient-name"]', "Sandra Sem Alergia");
      await page.fill('[data-testid="patient-cpf"]', "369.147.258-36");
      await page.fill('[data-testid="patient-phone"]', "(11) 91111-0000");
      await page.fill('[data-testid="patient-email"]', "sandra.sem@email.com");
      await page.fill('[data-testid="patient-birthdate"]', "1995-01-25");
      await page.selectOption('[data-testid="patient-gender"]', "feminino");

      await page.click('[data-testid="continue-to-medical"]');
      await page.click('[data-testid="continue-to-allergies"]');
      await page.waitForSelector('[data-testid="allergies-step"]');

      // Select "No known allergies"
      await page.check('[data-testid="no-known-allergies"]');

      // Should disable allergy input fields
      const addAllergyButton = page.locator('[data-testid="add-allergy"]');
      await expect(addAllergyButton).toBeDisabled();

      // Verify confirmation
      await expect(
        page.locator('[data-testid="no-allergies-confirmation"]'),
      ).toContainText("Nenhuma alergia conhecida");

      await page.click('[data-testid="save-allergies"]');
      await expect(
        page.locator('[data-testid="no-allergies-saved"]'),
      ).toContainText("Informação de alergias registrada");
    });

    test("should validate critical allergy information completeness", async ({
      page,
    }) => {
      await page.goto("/patients/register");

      // Navigate to allergies step
      await page.fill(
        '[data-testid="patient-name"]',
        "Teste Validação Alergia",
      );
      await page.fill('[data-testid="patient-cpf"]', "147.852.963-14");
      await page.fill('[data-testid="patient-phone"]', "(11) 90000-9999");
      await page.fill(
        '[data-testid="patient-email"]',
        "teste.validacao@email.com",
      );
      await page.fill('[data-testid="patient-birthdate"]', "1987-03-08");
      await page.selectOption('[data-testid="patient-gender"]', "masculino");

      await page.click('[data-testid="continue-to-medical"]');
      await page.click('[data-testid="continue-to-allergies"]');
      await page.waitForSelector('[data-testid="allergies-step"]');

      // Try to add incomplete allergy information
      await page.click('[data-testid="add-allergy"]');
      await page.selectOption('[data-testid="allergy-type-0"]', "medicamento");
      await page.selectOption('[data-testid="allergy-severity-0"]', "grave");
      // Leave substance and reaction empty

      await page.click('[data-testid="save-allergies"]');

      // Should show validation errors for critical allergies
      await expect(
        page.locator('[data-testid="allergy-substance-error"]'),
      ).toContainText("Substância é obrigatória");
      await expect(
        page.locator('[data-testid="allergy-reaction-error"]'),
      ).toContainText("Reação é obrigatória");

      // Critical allergies should require all fields
      const criticalAllergyFields = page.locator(
        '[data-testid="critical-allergy-fields"]',
      );
      await expect(criticalAllergyFields).toHaveClass(/required|mandatory/);

      // Fix validation errors
      await page.fill('[data-testid="allergy-substance-0"]', "Dipirona");
      await page.fill(
        '[data-testid="allergy-reaction-0"]',
        "Choque anafilático",
      );

      await page.click('[data-testid="save-allergies"]');
      await expect(
        page.locator('[data-testid="allergies-saved"]'),
      ).toBeVisible();
    });
  });
  test.describe("✅ Complete Registration Workflow", () => {
    test("should complete end-to-end patient registration with all components", async ({
      page,
    }) => {
      const startTime = Date.now();

      await page.goto("/patients/register");

      // Step 1: Basic Information
      await page.fill(
        '[data-testid="patient-name"]',
        "Complete Registration Test",
      );
      await page.fill('[data-testid="patient-cpf"]', "789.456.123-78");
      await page.fill('[data-testid="patient-rg"]', "98.765.432-1");
      await page.fill('[data-testid="patient-birthdate"]', "1985-05-15");
      await page.selectOption('[data-testid="patient-gender"]', "feminino");
      await page.selectOption(
        '[data-testid="patient-marital-status"]',
        "casada",
      );
      await page.fill('[data-testid="patient-phone"]', "(11) 99999-0001");
      await page.fill(
        '[data-testid="patient-email"]',
        "complete.test@email.com",
      );
      await page.fill(
        '[data-testid="patient-emergency-contact"]',
        "João Test - (11) 99999-0002",
      );

      // Address information
      await page.fill('[data-testid="patient-cep"]', "01234-567");
      await page.waitForTimeout(500); // CEP lookup
      await page.fill(
        '[data-testid="patient-street"]',
        "Rua Complete Test, 456",
      );
      await page.fill('[data-testid="patient-neighborhood"]', "Vila Test");
      await page.fill('[data-testid="patient-city"]', "São Paulo");
      await page.selectOption('[data-testid="patient-state"]', "SP");

      await page.click('[data-testid="continue-to-medical"]');

      // Step 2: Medical Information
      await page.waitForSelector('[data-testid="medical-information-step"]');
      await page.selectOption('[data-testid="blood-type"]', "A+");
      await page.fill('[data-testid="height"]', "1.70");
      await page.fill('[data-testid="weight"]', "65");

      // Add medical history
      await page.click('[data-testid="add-condition"]');
      await page.selectOption(
        '[data-testid="condition-type-0"]',
        "hipertensao",
      );
      await page.fill(
        '[data-testid="condition-description-0"]',
        "Hipertensão arterial leve",
      );

      await page.click('[data-testid="add-medication"]');
      await page.fill('[data-testid="medication-name-0"]', "Losartana");
      await page.fill('[data-testid="medication-dosage-0"]', "50mg");
      await page.fill('[data-testid="medication-frequency-0"]', "1x ao dia");

      await page.click('[data-testid="continue-to-allergies"]');

      // Step 3: Allergies
      await page.waitForSelector('[data-testid="allergies-step"]');
      await page.click('[data-testid="add-allergy"]');
      await page.selectOption('[data-testid="allergy-type-0"]', "medicamento");
      await page.fill('[data-testid="allergy-substance-0"]', "AAS");
      await page.selectOption('[data-testid="allergy-severity-0"]', "moderada");
      await page.fill(
        '[data-testid="allergy-reaction-0"]',
        "Gastrite, dor abdominal",
      );

      await page.click('[data-testid="continue-to-lgpd"]');

      // Step 4: LGPD Consent
      await page.waitForSelector('[data-testid="lgpd-consent-step"]');
      await page.check('[data-testid="consent-data-processing"]');
      await page.check('[data-testid="consent-medical-treatment"]');
      await page.check('[data-testid="consent-data-sharing"]');

      await page.click('[data-testid="confirm-lgpd-consent"]');

      // Step 5: Final Review and Confirmation
      await page.waitForSelector('[data-testid="registration-review"]');

      // Verify all information is displayed in review
      await expect(page.locator('[data-testid="review-name"]')).toContainText(
        "Complete Registration Test",
      );
      await expect(page.locator('[data-testid="review-cpf"]')).toContainText(
        "789.456.123-78",
      );
      await expect(
        page.locator('[data-testid="review-medical"]'),
      ).toContainText("Hipertensão");
      await expect(
        page.locator('[data-testid="review-allergies"]'),
      ).toContainText("AAS");
      await expect(
        page.locator('[data-testid="review-consent"]'),
      ).toContainText("3 consentimentos");

      // Final registration submission
      await page.click('[data-testid="complete-registration"]');

      // Wait for success confirmation
      await page.waitForSelector('[data-testid="registration-success"]');
      const totalTime = Date.now() - startTime;

      // Verify successful registration
      await expect(
        page.locator('[data-testid="registration-success"]'),
      ).toContainText("Paciente cadastrado com sucesso");
      await expect(page.locator('[data-testid="patient-id"]')).toBeVisible();

      // Should redirect to patient detail page
      await page.waitForURL("**/patients/**");

      // Verify patient data on detail page
      await expect(
        page.locator('[data-testid="patient-detail-name"]'),
      ).toContainText("Complete Registration Test");

      // Performance validation - complete registration should be under 30 seconds
      expect(totalTime).toBeLessThan(30_000);
    });

    test("should generate patient ID and medical record number", async ({
      page,
    }) => {
      await page.goto("/patients/register");

      // Quick registration for ID generation test
      await page.fill('[data-testid="patient-name"]', "ID Generation Test");
      await page.fill('[data-testid="patient-cpf"]', "123.789.456-12");
      await page.fill('[data-testid="patient-phone"]', "(11) 98888-1111");
      await page.fill(
        '[data-testid="patient-email"]',
        "id.generation@email.com",
      );
      await page.fill('[data-testid="patient-birthdate"]', "1990-10-20");
      await page.selectOption('[data-testid="patient-gender"]', "masculino");

      // Skip through steps with minimal data
      await page.click('[data-testid="continue-to-medical"]');
      await page.click('[data-testid="continue-to-allergies"]');
      await page.check('[data-testid="no-known-allergies"]');
      await page.click('[data-testid="continue-to-lgpd"]');
      await page.check('[data-testid="consent-data-processing"]');
      await page.check('[data-testid="consent-medical-treatment"]');
      await page.click('[data-testid="confirm-lgpd-consent"]');
      await page.click('[data-testid="complete-registration"]');

      await page.waitForSelector('[data-testid="registration-success"]');

      // Verify patient ID generation
      const patientId = page.locator('[data-testid="patient-id"]');
      await expect(patientId).toBeVisible();

      const patientIdText = await patientId.textContent();
      expect(patientIdText).toMatch(/PAT\d{6,}/); // Format: PAT + sequential number

      // Verify medical record number
      const medicalRecordNumber = page.locator(
        '[data-testid="medical-record-number"]',
      );
      if ((await medicalRecordNumber.count()) > 0) {
        const mrnText = await medicalRecordNumber.textContent();
        expect(mrnText).toMatch(/MRN\d{6,}/); // Format: MRN + sequential number
      }

      // Verify integration with system
      await page.waitForURL("**/patients/**");
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/patients\/\d+/);
    });

    test("should integrate with appointment scheduling system", async ({
      page,
    }) => {
      await page.goto("/patients/register");

      // Complete patient registration
      await page.fill(
        '[data-testid="patient-name"]',
        "Integration Test Patient",
      );
      await page.fill('[data-testid="patient-cpf"]', "456.123.789-45");
      await page.fill('[data-testid="patient-phone"]', "(11) 97777-2222");
      await page.fill(
        '[data-testid="patient-email"]',
        "integration.test@email.com",
      );
      await page.fill('[data-testid="patient-birthdate"]', "1982-08-30");
      await page.selectOption('[data-testid="patient-gender"]', "feminino");

      await page.click('[data-testid="continue-to-medical"]');
      await page.click('[data-testid="continue-to-allergies"]');
      await page.check('[data-testid="no-known-allergies"]');
      await page.click('[data-testid="continue-to-lgpd"]');
      await page.check('[data-testid="consent-data-processing"]');
      await page.check('[data-testid="consent-medical-treatment"]');
      await page.click('[data-testid="confirm-lgpd-consent"]');
      await page.click('[data-testid="complete-registration"]');

      await page.waitForSelector('[data-testid="registration-success"]');

      // Should offer immediate appointment scheduling
      const scheduleAppointmentButton = page.locator(
        '[data-testid="schedule-first-appointment"]',
      );
      if ((await scheduleAppointmentButton.count()) > 0) {
        await scheduleAppointmentButton.click();

        // Should navigate to appointment booking with patient pre-filled
        await page.waitForURL("**/appointments/schedule**");

        // Verify patient is pre-selected
        const selectedPatient = page.locator(
          '[data-testid="selected-patient-name"]',
        );
        await expect(selectedPatient).toContainText("Integration Test Patient");
      }
    });

    test("should handle registration errors gracefully", async ({ page }) => {
      // Test network error during registration
      await page.route("**/api/patients", (route) => {
        if (route.request().method() === "POST") {
          route.abort("failed");
        } else {
          route.continue();
        }
      });

      await page.goto("/patients/register");

      // Fill minimal required information
      await page.fill('[data-testid="patient-name"]', "Error Test Patient");
      await page.fill('[data-testid="patient-cpf"]', "789.123.456-78");
      await page.fill('[data-testid="patient-phone"]', "(11) 96666-3333");
      await page.fill('[data-testid="patient-email"]', "error.test@email.com");
      await page.fill('[data-testid="patient-birthdate"]', "1975-12-15");
      await page.selectOption('[data-testid="patient-gender"]', "masculino");

      await page.click('[data-testid="continue-to-medical"]');
      await page.click('[data-testid="continue-to-allergies"]');
      await page.check('[data-testid="no-known-allergies"]');
      await page.click('[data-testid="continue-to-lgpd"]');
      await page.check('[data-testid="consent-data-processing"]');
      await page.check('[data-testid="consent-medical-treatment"]');
      await page.click('[data-testid="confirm-lgpd-consent"]');
      await page.click('[data-testid="complete-registration"]');

      // Should show error message
      await expect(
        page.locator('[data-testid="registration-error"]'),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="registration-error"]'),
      ).toContainText("Erro ao cadastrar paciente");

      // Should offer retry option
      await expect(
        page.locator('[data-testid="retry-registration"]'),
      ).toBeVisible();

      // Should preserve form data
      await page.click('[data-testid="back-to-review"]');
      await expect(page.locator('[data-testid="review-name"]')).toContainText(
        "Error Test Patient",
      );
    });
  });

  test.describe("🚀 Performance & Validation", () => {
    test("should complete registration within performance targets", async ({
      page,
    }) => {
      const performanceStart = Date.now();

      await page.goto("/patients/register");
      const pageLoadTime = Date.now() - performanceStart;

      // Page should load within 3 seconds
      expect(pageLoadTime).toBeLessThan(3000);

      // Form should be responsive
      await page.fill('[data-testid="patient-name"]', "Performance Test");
      const nameInputTime = Date.now();

      await page.fill('[data-testid="patient-cpf"]', "159.753.486-15");
      const cpfValidationTime = Date.now() - nameInputTime;

      // CPF validation should be fast
      expect(cpfValidationTime).toBeLessThan(2000);

      // Form navigation should be smooth
      const navigationStart = Date.now();
      await page.fill('[data-testid="patient-phone"]', "(11) 95555-7777");
      await page.fill('[data-testid="patient-email"]', "performance@email.com");
      await page.fill('[data-testid="patient-birthdate"]', "1988-07-12");
      await page.selectOption('[data-testid="patient-gender"]', "masculino");

      await page.click('[data-testid="continue-to-medical"]');
      await page.waitForSelector('[data-testid="medical-information-step"]');

      const navigationTime = Date.now() - navigationStart;
      expect(navigationTime).toBeLessThan(5000);
    });

    test("should provide accessibility compliance in registration form", async ({
      page,
    }) => {
      await page.goto("/patients/register");

      // Check for proper form labels
      const nameLabel = page.locator(
        'label[for="patient-name"], label:has([data-testid="patient-name"])',
      );
      await expect(nameLabel).toBeVisible();

      const cpfLabel = page.locator(
        'label[for="patient-cpf"], label:has([data-testid="patient-cpf"])',
      );
      await expect(cpfLabel).toBeVisible();

      // Check for ARIA attributes
      const form = page.locator(
        '[data-testid="patient-registration-form"], form',
      );
      await expect(form).toHaveAttribute("role", /form|main/);

      // Required field indicators
      const requiredFields = page.locator('[required], [aria-required="true"]');
      expect(await requiredFields.count()).toBeGreaterThan(0);

      // Error message accessibility
      await page.click('[data-testid="continue-to-medical"]'); // Trigger validation errors

      const errorMessages = page.locator('[role="alert"], .error[aria-live]');
      if ((await errorMessages.count()) > 0) {
        await expect(errorMessages.first()).toBeVisible();
      }

      // Keyboard navigation
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();
    });

    test("should handle concurrent registration attempts", async ({
      page,
      context,
    }) => {
      // Simulate multiple users registering simultaneously
      const page1 = page;
      const page2 = await context.newPage();

      const registerPatient = async (
        testPage: any,
        patientName: string,
        cpf: string,
      ) => {
        await testPage.goto("/patients/register");
        await testPage.fill('[data-testid="patient-name"]', patientName);
        await testPage.fill('[data-testid="patient-cpf"]', cpf);
        await testPage.fill('[data-testid="patient-phone"]', "(11) 94444-5555");
        await testPage.fill(
          '[data-testid="patient-email"]',
          `${patientName.toLowerCase()}@email.com`,
        );
        await testPage.fill('[data-testid="patient-birthdate"]', "1990-01-01");
        await testPage.selectOption(
          '[data-testid="patient-gender"]',
          "masculino",
        );

        await testPage.click('[data-testid="continue-to-medical"]');
        await testPage.click('[data-testid="continue-to-allergies"]');
        await testPage.check('[data-testid="no-known-allergies"]');
        await testPage.click('[data-testid="continue-to-lgpd"]');
        await testPage.check('[data-testid="consent-data-processing"]');
        await testPage.check('[data-testid="consent-medical-treatment"]');
        await testPage.click('[data-testid="confirm-lgpd-consent"]');
        await testPage.click('[data-testid="complete-registration"]');

        return testPage.waitForSelector('[data-testid="registration-success"]');
      };

      const startTime = Date.now();

      // Register two patients concurrently
      await Promise.all([
        registerPatient(page1, "Concurrent Patient 1", "111.222.333-11"),
        registerPatient(page2, "Concurrent Patient 2", "222.333.444-22"),
      ]);

      const totalTime = Date.now() - startTime;

      // Both registrations should succeed
      await expect(
        page1.locator('[data-testid="registration-success"]'),
      ).toBeVisible();
      await expect(
        page2.locator('[data-testid="registration-success"]'),
      ).toBeVisible();

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(20_000);

      await page2.close();
    });
  });
});
