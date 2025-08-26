import { expect, test } from "@playwright/test";

test.describe("Complete Patient Management Flow", () => {
	test.beforeEach(async ({ page }) => {
		// Login as healthcare professional first
		await page.goto("/login");
		await page.fill('input[type="email"]', "doctor@neonpro.com");
		await page.fill('input[type="password"]', "doctorpassword");
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/dashboard/);
	});

	test("should complete full patient registration flow", async ({ page }) => {
		// Navigate to patients section
		await page.click('[data-testid="nav-patients"]');
		await expect(page).toHaveURL(/\/patients/);

		// Click add new patient
		await page.click('[data-testid="add-patient-btn"]');
		await expect(page).toHaveURL(/\/patients\/new/);

		// Fill patient registration form
		await page.fill('[data-testid="patient-name"]', "João Silva Santos");
		await page.fill('[data-testid="patient-cpf"]', "123.456.789-00");
		await page.fill('[data-testid="patient-email"]', "joao.silva@email.com");
		await page.fill('[data-testid="patient-phone"]', "(11) 99999-9999");
		await page.fill('[data-testid="patient-birth-date"]', "15/08/1985");

		// Select gender
		await page.click('[data-testid="patient-gender"]');
		await page.click('[data-testid="gender-male"]');

		// Fill address information
		await page.fill('[data-testid="patient-address"]', "Rua das Flores, 123");
		await page.fill('[data-testid="patient-city"]', "São Paulo");
		await page.fill('[data-testid="patient-state"]', "SP");
		await page.fill('[data-testid="patient-cep"]', "01234-567");

		// Medical information
		await page.fill(
			'[data-testid="patient-allergies"]',
			"Nenhuma alergia conhecida",
		);
		await page.fill('[data-testid="patient-medications"]', "Losartana 50mg");
		await page.fill(
			'[data-testid="patient-medical-history"]',
			"Hipertensão arterial controlada",
		);

		// LGPD consent
		await page.check('[data-testid="lgpd-consent-checkbox"]');
		await expect(
			page.locator('[data-testid="lgpd-consent-checkbox"]'),
		).toBeChecked();

		// Save patient
		await page.click('[data-testid="save-patient-btn"]');

		// Should show success message
		await expect(
			page.locator("text=Paciente cadastrado com sucesso"),
		).toBeVisible();

		// Should redirect to patient list
		await expect(page).toHaveURL(/\/patients/);

		// Should see the new patient in the list
		await expect(page.locator("text=João Silva Santos")).toBeVisible();
		await expect(page.locator("text=123.456.789-00")).toBeVisible();
	});

	test("should handle patient search and filtering", async ({ page }) => {
		await page.goto("/patients");

		// Search for specific patient
		await page.fill('[data-testid="patient-search"]', "João Silva");
		await page.keyboard.press("Enter");

		// Should filter results
		await expect(page.locator('[data-testid="patient-list-item"]')).toHaveCount(
			1,
		);
		await expect(page.locator("text=João Silva Santos")).toBeVisible();

		// Clear search
		await page.fill('[data-testid="patient-search"]', "");
		await page.keyboard.press("Enter");

		// Should show all patients again
		await expect(
			page.locator('[data-testid="patient-list-item"]').first(),
		).toBeVisible();

		// Test CPF search
		await page.fill('[data-testid="patient-search"]', "123.456.789-00");
		await page.keyboard.press("Enter");
		await expect(page.locator("text=João Silva Santos")).toBeVisible();
	});

	test("should complete patient profile management", async ({ page }) => {
		await page.goto("/patients");

		// Click on patient to view profile
		await page.click('[data-testid="patient-item-123.456.789-00"]');
		await expect(page).toHaveURL(/\/patients\/[a-zA-Z0-9-]+/);

		// Verify patient information is displayed
		await expect(
			page.locator('[data-testid="patient-profile-name"]'),
		).toContainText("João Silva Santos");
		await expect(
			page.locator('[data-testid="patient-profile-cpf"]'),
		).toContainText("123.456.789-00");

		// Edit patient information
		await page.click('[data-testid="edit-patient-btn"]');

		// Update phone number
		await page.fill('[data-testid="patient-phone"]', "(11) 88888-8888");

		// Add emergency contact
		await page.fill(
			'[data-testid="emergency-contact-name"]',
			"Maria Silva Santos",
		);
		await page.fill(
			'[data-testid="emergency-contact-phone"]',
			"(11) 77777-7777",
		);

		// Save changes
		await page.click('[data-testid="save-changes-btn"]');

		// Should show success message
		await expect(
			page.locator("text=Dados atualizados com sucesso"),
		).toBeVisible();

		// Verify changes are saved
		await expect(
			page.locator('[data-testid="patient-phone-display"]'),
		).toContainText("(11) 88888-8888");
	});

	test("should handle medical record management", async ({ page }) => {
		await page.goto("/patients");
		await page.click('[data-testid="patient-item-123.456.789-00"]');

		// Navigate to medical records
		await page.click('[data-testid="medical-records-tab"]');

		// Add new medical record
		await page.click('[data-testid="add-medical-record-btn"]');

		// Fill medical record form
		await page.fill('[data-testid="record-date"]', "20/12/2024");
		await page.fill(
			'[data-testid="record-diagnosis"]',
			"Consulta de rotina - Hipertensão controlada",
		);
		await page.fill(
			'[data-testid="record-treatment"]',
			"Manter medicação atual. Retorno em 3 meses.",
		);
		await page.fill(
			'[data-testid="record-observations"]',
			"Pressão arterial: 130/80 mmHg. Paciente sem queixas.",
		);

		// Add prescription
		await page.click('[data-testid="add-prescription-btn"]');
		await page.fill(
			'[data-testid="prescription-medication"]',
			"Losartana Potássica",
		);
		await page.fill('[data-testid="prescription-dosage"]', "50mg");
		await page.fill('[data-testid="prescription-frequency"]', "1x ao dia");
		await page.fill('[data-testid="prescription-duration"]', "90 dias");

		// Save medical record
		await page.click('[data-testid="save-medical-record-btn"]');

		// Should show success message
		await expect(
			page.locator("text=Prontuário salvo com sucesso"),
		).toBeVisible();

		// Verify record appears in history
		await expect(
			page.locator('[data-testid="medical-record-item"]').first(),
		).toContainText("Consulta de rotina");
	});

	test("should handle LGPD data access and privacy", async ({ page }) => {
		await page.goto("/patients");
		await page.click('[data-testid="patient-item-123.456.789-00"]');

		// Navigate to privacy settings
		await page.click('[data-testid="privacy-settings-tab"]');

		// Should display LGPD information
		await expect(
			page.locator('[data-testid="lgpd-info-section"]'),
		).toBeVisible();
		await expect(
			page.locator("text=Dados pessoais protegidos pela LGPD"),
		).toBeVisible();

		// Check consent status
		await expect(page.locator('[data-testid="consent-status"]')).toContainText(
			"Consentimento ativo",
		);

		// Test data export (patient's right to data portability)
		await page.click('[data-testid="export-patient-data-btn"]');

		// Should show export confirmation dialog
		await expect(
			page.locator('[data-testid="export-confirmation-dialog"]'),
		).toBeVisible();
		await expect(page.locator("text=Exportar dados do paciente")).toBeVisible();

		// Confirm export
		await page.click('[data-testid="confirm-export-btn"]');

		// Should show success message and download link
		await expect(
			page.locator("text=Dados exportados com sucesso"),
		).toBeVisible();

		// Test data anonymization option
		await page.click('[data-testid="anonymize-data-btn"]');
		await expect(
			page.locator('[data-testid="anonymization-dialog"]'),
		).toBeVisible();

		// Cancel for now (in real scenario, would complete the process)
		await page.click('[data-testid="cancel-anonymization-btn"]');
	});

	test("should handle patient data deletion (LGPD right to erasure)", async ({
		page,
	}) => {
		await page.goto("/patients");
		await page.click('[data-testid="patient-item-123.456.789-00"]');

		// Navigate to privacy settings
		await page.click('[data-testid="privacy-settings-tab"]');

		// Click delete patient data
		await page.click('[data-testid="delete-patient-data-btn"]');

		// Should show deletion confirmation dialog with LGPD warnings
		await expect(
			page.locator('[data-testid="deletion-confirmation-dialog"]'),
		).toBeVisible();
		await expect(
			page.locator("text=Esta ação removerá permanentemente todos os dados"),
		).toBeVisible();
		await expect(page.locator("text=Conforme direitos da LGPD")).toBeVisible();

		// Required confirmation steps
		await page.check('[data-testid="confirm-legal-requirements"]');
		await page.fill(
			'[data-testid="deletion-reason"]',
			"Solicitação do titular dos dados conforme LGPD",
		);

		// Cancel for test purposes (to preserve test data)
		await page.click('[data-testid="cancel-deletion-btn"]');

		// Should close dialog and remain on patient profile
		await expect(
			page.locator('[data-testid="deletion-confirmation-dialog"]'),
		).toBeHidden();
	});
});
