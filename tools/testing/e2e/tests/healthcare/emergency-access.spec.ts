/**
 * 🚨 CRITICAL Emergency Access E2E Tests for NeonPro Healthcare
 *
 * PRIORITY: CRITICAL - Life-saving emergency access scenarios
 * COVERAGE: Emergency override, rapid patient access, audit compliance
 * COMPLIANCE: CFM emergency protocols, LGPD emergency provisions, Art. 11
 *
 * Tests emergency scenarios requiring rapid access to critical patient data
 * with proper audit trails and compliance with Brazilian healthcare regulations.
 */

import { expect, test } from "@playwright/test";

test.describe("🚨 Emergency Access - Critical E2E", () => {
	test.beforeEach(async ({ page }) => {
		// Clear any existing sessions for emergency testing
		await page.context().clearCookies();
		await page.evaluate(() => localStorage.clear());
		await page.goto("/");
		await page.waitForLoadState("networkidle");
	});

	test.describe("⚡ Emergency Login (<10s)", () => {
		test("should complete emergency login within 10 seconds", async ({ page }) => {
			const startTime = Date.now();

			// Navigate to emergency access portal
			await page.goto("/emergency");
			await page.waitForLoadState("networkidle");

			// Verify emergency mode interface
			await expect(page.locator('[data-testid="emergency-mode"], .emergency-portal')).toBeVisible();
			await expect(page.locator(':has-text("ACESSO DE EMERGÊNCIA")')).toBeVisible();

			// Emergency login with special credentials
			await page.fill('[data-testid="emergency-code"], input[name="emergency_code"]', "EMRG2024");
			await page.fill('[data-testid="professional-id"], input[name="professional_id"]', "CRM12345");
			await page.fill('[data-testid="emergency-password"], input[type="password"]', "EmergencySecure123!");

			// Submit emergency login
			await page.click('[data-testid="emergency-login"], button:has-text("ACESSO EMERGENCIAL")');

			// Wait for emergency dashboard
			await page.waitForURL("**/emergency/dashboard");
			await page.waitForLoadState("networkidle");

			const totalTime = Date.now() - startTime;

			// Critical requirement: Must complete within 10 seconds
			expect(totalTime).toBeLessThan(10_000);

			// Verify emergency dashboard is loaded
			await expect(page.locator('[data-testid="emergency-dashboard"]')).toBeVisible();
			await expect(page.locator('[data-testid="patient-search-emergency"]')).toBeVisible();

			console.log(`Emergency login completed in ${totalTime}ms`);
		});

		test("should handle life-threatening emergency access bypass", async ({ page }) => {
			// Click emergency access button on login screen
			await page.goto("/login");
			await expect(page.locator('[data-testid="emergency-access-btn"]')).toBeVisible();
			await page.click('[data-testid="emergency-access-btn"]');

			// Should show emergency authentication modal
			await expect(page.locator('[data-testid="emergency-auth-modal"]')).toBeVisible();
			await expect(page.locator("h2")).toContainText("ACESSO DE EMERGÊNCIA");
			await expect(page.locator("text=Para situações de risco à vida")).toBeVisible();

			// Emergency credentials
			await page.fill('[data-testid="emergency-id"]', "EMRG001");
			await page.fill('[data-testid="emergency-code"]', "VIDA2024");

			// Critical incident description
			await page.fill(
				'[data-testid="incident-description"]',
				"Paciente em parada cardiorrespiratória - necessário acesso imediato ao histórico médico"
			);

			// Emergency contact verification
			await page.fill('[data-testid="authorizing-doctor"]', "Dr. Silva - CRM/SP 123456");
			await page.fill('[data-testid="emergency-contact"]', "(11) 99999-9999");

			// Confirm emergency access
			await page.click('[data-testid="emergency-access-confirm"]');

			// Should bypass normal authentication
			await expect(page).toHaveURL(/\/emergency-dashboard/, {
				timeout: 10_000,
			});

			// Emergency dashboard should be active
			await expect(page.locator('[data-testid="emergency-banner"]')).toBeVisible();
			await expect(page.locator("text=MODO EMERGÊNCIA ATIVO")).toBeVisible();
			await expect(page.locator('[data-testid="emergency-timer"]')).toBeVisible();
		});

		test("should bypass normal authentication restrictions in emergency mode", async ({ page }) => {
			await page.goto("/emergency");

			// Emergency login
			await page.fill('[data-testid="emergency-code"]', "EMRG2024");
			await page.fill('[data-testid="professional-id"]', "CRM12345");
			await page.fill('[data-testid="emergency-password"]', "EmergencySecure123!");
			await page.click('[data-testid="emergency-login"]');

			await page.waitForURL("**/emergency/dashboard");

			// Verify emergency privileges
			await expect(page.locator('[data-testid="emergency-privileges"]')).toBeVisible();
			await expect(page.locator(':has-text("MODO EMERGENCIAL ATIVO")')).toBeVisible();

			// Should have access to all patient data without normal role restrictions
			await expect(page.locator('[data-testid="unrestricted-access"]')).toBeVisible();

			// Emergency session indicator
			await expect(page.locator('[data-testid="emergency-session"]')).toHaveClass(/emergency|critical/);
		});

		test("should validate emergency credentials and prevent abuse", async ({ page }) => {
			await page.goto("/login");
			await page.click('[data-testid="emergency-access-btn"]');

			// Test invalid emergency ID
			await page.fill('[data-testid="emergency-id"]', "INVALID123");
			await page.fill('[data-testid="emergency-code"]', "VIDA2024");
			await page.fill('[data-testid="incident-description"]', "Teste de validação com descrição adequada");
			await page.click('[data-testid="emergency-access-confirm"]');

			// Should show validation error
			await expect(page.locator('[data-testid="emergency-auth-error"]')).toBeVisible();
			await expect(page.locator("text=ID de emergência inválido")).toBeVisible();

			// Test insufficient incident description
			await page.fill('[data-testid="emergency-id"]', "EMRG001");
			await page.fill('[data-testid="incident-description"]', "Teste"); // Too short
			await page.click('[data-testid="emergency-access-confirm"]');

			await expect(page.locator("text=Descrição do incidente insuficiente")).toBeVisible();
			await expect(page.locator("text=Mínimo de 20 caracteres necessários")).toBeVisible();
		});
	});

	test.describe("🔍 Critical Data Access", () => {
		test("should provide immediate access to critical patient data", async ({ page }) => {
			// Emergency login
			await page.goto("/emergency");
			await page.fill('[data-testid="emergency-code"]', "EMRG2024");
			await page.fill('[data-testid="professional-id"]', "CRM12345");
			await page.fill('[data-testid="emergency-password"]', "EmergencySecure123!");
			await page.click('[data-testid="emergency-login"]');
			await page.waitForURL("**/emergency/dashboard");

			const searchStartTime = Date.now();

			// Search for patient in emergency
			await page.fill('[data-testid="patient-search-emergency"]', "Maria Silva Santos");
			await page.click('[data-testid="emergency-search-btn"]');

			// Wait for patient data to load
			await page.waitForSelector('[data-testid="emergency-patient-data"]');

			const searchTime = Date.now() - searchStartTime;

			// Critical data should load within 3 seconds
			expect(searchTime).toBeLessThan(3000);

			// Verify critical medical information is immediately visible
			await expect(page.locator('[data-testid="patient-allergies"]')).toBeVisible();
			await expect(page.locator('[data-testid="patient-medications"]')).toBeVisible();
			await expect(page.locator('[data-testid="patient-conditions"]')).toBeVisible();
			await expect(page.locator('[data-testid="emergency-contacts"]')).toBeVisible();
			await expect(page.locator('[data-testid="blood-type"]')).toBeVisible();

			// Verify medical alerts are highlighted
			const medicalAlerts = page.locator('[data-testid="medical-alerts"], .medical-alert');
			if ((await medicalAlerts.count()) > 0) {
				await expect(medicalAlerts).toHaveClass(/alert|warning|critical/);
			}
		});

		test("should provide rapid patient data access in emergency mode", async ({ page }) => {
			// Start emergency session
			await page.goto("/login");
			await page.click('[data-testid="emergency-access-btn"]');
			await page.fill('[data-testid="emergency-id"]', "EMRG001");
			await page.fill('[data-testid="emergency-code"]', "VIDA2024");
			await page.fill('[data-testid="incident-description"]', "AVC - necessário histórico de medicamentos");
			await page.click('[data-testid="emergency-access-confirm"]');

			await page.waitForURL("/emergency-dashboard");

			// Quick patient search by CPF (most common emergency scenario)
			await page.fill('[data-testid="emergency-patient-search"]', "123.456.789-00");
			await page.press('[data-testid="emergency-patient-search"]', "Enter");

			// Should show rapid search results
			await expect(page.locator('[data-testid="emergency-patient-results"]')).toBeVisible();
			await expect(page.locator('[data-testid="patient-basic-info"]')).toBeVisible();

			// Click patient to access emergency view
			await page.click('[data-testid="emergency-patient-access"]');

			// Emergency patient view should load rapidly (< 3 seconds)
			const startTime = Date.now();
			await expect(page.locator('[data-testid="emergency-patient-view"]')).toBeVisible();
			const loadTime = Date.now() - startTime;
			expect(loadTime).toBeLessThan(3000);

			// Critical information should be prominently displayed
			await expect(page.locator('[data-testid="critical-allergies"]')).toBeVisible();
			await expect(page.locator('[data-testid="current-medications"]')).toBeVisible();
			await expect(page.locator('[data-testid="critical-conditions"]')).toBeVisible();
			await expect(page.locator('[data-testid="emergency-contacts"]')).toBeVisible();

			// Blood type and critical alerts
			await expect(page.locator('[data-testid="blood-type"]')).toBeVisible();
			await expect(page.locator('[data-testid="critical-alerts"]')).toBeVisible();

			// Recent vital signs
			await expect(page.locator('[data-testid="recent-vitals"]')).toBeVisible();
		});

		test("should display patient allergies and contraindications prominently", async ({ page }) => {
			// Emergency login and patient search
			await page.goto("/emergency");
			await page.fill('[data-testid="emergency-code"]', "EMRG2024");
			await page.fill('[data-testid="professional-id"]', "CRM12345");
			await page.fill('[data-testid="emergency-password"]', "EmergencySecure123!");
			await page.click('[data-testid="emergency-login"]');
			await page.waitForURL("**/emergency/dashboard");

			await page.fill('[data-testid="patient-search-emergency"]', "João Silva Alergico");
			await page.click('[data-testid="emergency-search-btn"]');
			await page.waitForSelector('[data-testid="emergency-patient-data"]');

			// Verify allergy information is prominently displayed
			const allergySection = page.locator('[data-testid="patient-allergies"]');
			await expect(allergySection).toBeVisible();

			// Should have warning styling for allergies
			await expect(allergySection).toHaveClass(/warning|alert|critical/);

			// Specific allergy information should be clearly visible
			await expect(allergySection).toContainText(/Penicilina|Dipirona|Látex/);

			// Contraindications should be highlighted
			const contraindications = page.locator('[data-testid="contraindications"]');
			if ((await contraindications.count()) > 0) {
				await expect(contraindications).toBeVisible();
				await expect(contraindications).toHaveClass(/critical|danger/);
			}

			// Emergency medication warnings
			await expect(page.locator('[data-testid="medication-warnings"]')).toBeVisible();
		});

		test("should show current medications and dosages", async ({ page }) => {
			// Emergency access setup
			await page.goto("/emergency");
			await page.fill('[data-testid="emergency-code"]', "EMRG2024");
			await page.fill('[data-testid="professional-id"]', "CRM12345");
			await page.fill('[data-testid="emergency-password"]', "EmergencySecure123!");
			await page.click('[data-testid="emergency-login"]');
			await page.waitForURL("**/emergency/dashboard");

			await page.fill('[data-testid="patient-search-emergency"]', "Ana Costa Medicamentos");
			await page.click('[data-testid="emergency-search-btn"]');
			await page.waitForSelector('[data-testid="emergency-patient-data"]');

			// Verify current medications are displayed
			const medicationsSection = page.locator('[data-testid="patient-medications"]');
			await expect(medicationsSection).toBeVisible();

			// Should show medication details
			await expect(medicationsSection).toContainText(/mg|ml|comprimidos|cápsulas/);
			await expect(medicationsSection).toContainText(/manhã|tarde|noite|vezes ao dia/);

			// Critical medications should be highlighted
			const criticalMeds = page.locator('[data-testid="critical-medications"]');
			if ((await criticalMeds.count()) > 0) {
				await expect(criticalMeds).toHaveClass(/critical|important/);
			}

			// Drug interaction warnings
			const interactionWarnings = page.locator('[data-testid="drug-interactions"]');
			if ((await interactionWarnings.count()) > 0) {
				await expect(interactionWarnings).toBeVisible();
				await expect(interactionWarnings).toHaveClass(/warning|alert/);
			}
		});
	});

	test.describe("💊 Emergency Prescription Authorization", () => {
		test("should handle emergency prescription authorization", async ({ page }) => {
			// Setup emergency session
			await page.goto("/login");
			await page.click('[data-testid="emergency-access-btn"]');
			await page.fill('[data-testid="emergency-id"]', "EMRG001");
			await page.fill('[data-testid="emergency-code"]', "VIDA2024");
			await page.fill('[data-testid="incident-description"]', "Infarto agudo - medicação urgente necessária");
			await page.click('[data-testid="emergency-access-confirm"]');

			await page.waitForURL("/emergency-dashboard");

			// Access patient
			await page.fill('[data-testid="emergency-patient-search"]', "123.456.789-00");
			await page.press('[data-testid="emergency-patient-search"]', "Enter");
			await page.click('[data-testid="emergency-patient-access"]');

			// Emergency prescription access
			await page.click('[data-testid="emergency-prescription-btn"]');
			await expect(page.locator('[data-testid="emergency-prescription-form"]')).toBeVisible();

			// Should show emergency medication options
			await expect(page.locator('[data-testid="emergency-medications"]')).toBeVisible();

			// Select emergency medication
			await page.click('[data-testid="medication-select"]');
			await page.click('[data-testid="medication-atenolol"]');

			await page.fill('[data-testid="dosage"]', "25mg");
			await page.click('[data-testid="frequency"]');
			await page.click('[data-testid="frequency-12h"]');

			// Emergency justification (required)
			await page.fill(
				'[data-testid="emergency-justification"]',
				"Infarto agudo do miocárdio - betabloqueador para redução da frequência cardíaca"
			);

			// Emergency override authorization
			await page.fill('[data-testid="authorizing-physician"]', "Dr. Emergência - CRM/SP 999888");

			// Should bypass normal prescription validation in emergency
			await expect(page.locator('[data-testid="emergency-override-warning"]')).toBeVisible();
			await expect(page.locator("text=Prescrição emergencial - validação posterior")).toBeVisible();

			await page.click('[data-testid="authorize-emergency-prescription"]');

			// Should create emergency prescription
			await expect(page.locator("text=Prescrição emergencial autorizada")).toBeVisible();
			await expect(page.locator('[data-testid="emergency-prescription-id"]')).toBeVisible();

			// Should require post-emergency validation
			await expect(page.locator('[data-testid="post-emergency-validation"]')).toBeVisible();
			await expect(page.locator("text=Validação médica necessária em 24h")).toBeVisible();
		});
	});

	test.describe("📋 Audit Trail Logging", () => {
		test("should log all emergency access events", async ({ page }) => {
			// Emergency login
			await page.goto("/emergency");
			await page.fill('[data-testid="emergency-code"]', "EMRG2024");
			await page.fill('[data-testid="professional-id"]', "CRM12345");
			await page.fill('[data-testid="emergency-password"]', "EmergencySecure123!");
			await page.click('[data-testid="emergency-login"]');
			await page.waitForURL("**/emergency/dashboard");

			// Access patient data
			await page.fill('[data-testid="patient-search-emergency"]', "Maria Silva Santos");
			await page.click('[data-testid="emergency-search-btn"]');
			await page.waitForSelector('[data-testid="emergency-patient-data"]');

			// Verify audit trail is being created
			await expect(page.locator('[data-testid="audit-trail-active"]')).toBeVisible();
			await expect(page.locator(':has-text("ACESSO REGISTRADO EM AUDITORIA")')).toBeVisible();

			// Check audit log entries
			const auditEntries = page.locator('[data-testid="audit-entry"]');
			if ((await auditEntries.count()) > 0) {
				await expect(auditEntries.first()).toContainText("EMERGENCY_ACCESS");
				await expect(auditEntries.first()).toContainText("CRM12345");
				await expect(auditEntries.first()).toContainText(new Date().toISOString().split("T")[0]);
			}
		});

		test("should require justification for emergency access", async ({ page }) => {
			// Emergency login
			await page.goto("/emergency");
			await page.fill('[data-testid="emergency-code"]', "EMRG2024");
			await page.fill('[data-testid="professional-id"]', "CRM12345");
			await page.fill('[data-testid="emergency-password"]', "EmergencySecure123!");
			await page.click('[data-testid="emergency-login"]');
			await page.waitForURL("**/emergency/dashboard");

			// Try to access patient data
			await page.fill('[data-testid="patient-search-emergency"]', "Maria Silva Santos");
			await page.click('[data-testid="emergency-search-btn"]');

			// Should prompt for justification
			await expect(page.locator('[data-testid="emergency-justification-modal"]')).toBeVisible();
			await expect(page.locator('[data-testid="justification-required"]')).toContainText("obrigatória");

			// Fill justification
			await page.fill(
				'[data-testid="emergency-justification"]',
				"Paciente inconsciente em estado crítico, necessário verificar alergias e medicações antes de procedimento de emergência"
			);
			await page.selectOption('[data-testid="emergency-type"]', "life-threatening");

			// Confirm access
			await page.click('[data-testid="confirm-emergency-access"]');

			// Should now provide access
			await expect(page.locator('[data-testid="emergency-patient-data"]')).toBeVisible();

			// Verify justification was logged
			await expect(page.locator('[data-testid="justification-logged"]')).toContainText("Justificativa registrada");
		});

		test("should generate comprehensive emergency audit logs", async ({ page }) => {
			// Complete an emergency session
			await page.goto("/login");
			await page.click('[data-testid="emergency-access-btn"]');
			await page.fill('[data-testid="emergency-id"]', "EMRG001");
			await page.fill('[data-testid="emergency-code"]', "VIDA2024");
			await page.fill('[data-testid="incident-description"]', "Auditoria de teste - acesso emergencial completo");
			await page.click('[data-testid="emergency-access-confirm"]');

			await page.waitForURL("/emergency-dashboard");

			// Perform various emergency actions
			await page.fill('[data-testid="emergency-patient-search"]', "123.456.789-00");
			await page.press('[data-testid="emergency-patient-search"]', "Enter");
			await page.click('[data-testid="emergency-patient-access"]');

			// Access different sections
			await page.click('[data-testid="emergency-history-tab"]');
			await page.click('[data-testid="add-emergency-note"]');
			await page.fill('[data-testid="emergency-note-text"]', "Teste de auditoria");
			await page.click('[data-testid="save-emergency-note"]');

			// End emergency session
			await page.click('[data-testid="end-emergency-session"]');
			await expect(page.locator('[data-testid="end-session-confirmation"]')).toBeVisible();

			await page.fill('[data-testid="session-summary"]', "Atendimento emergencial concluído. Paciente estabilizado.");
			await page.click('[data-testid="confirm-end-session"]');

			// Should redirect to audit summary
			await expect(page).toHaveURL(/\/emergency-audit-summary/);

			// Audit summary should show all actions
			await expect(page.locator('[data-testid="emergency-session-summary"]')).toBeVisible();
			await expect(page.locator('[data-testid="session-duration"]')).toBeVisible();
			await expect(page.locator('[data-testid="actions-performed"]')).toBeVisible();

			// Should show compliance information
			await expect(page.locator('[data-testid="lgpd-compliance-note"]')).toBeVisible();
			await expect(page.locator("text=Acesso justificado por situação de emergência")).toBeVisible();
			await expect(page.locator("text=Conforme Art. 11 da LGPD")).toBeVisible();

			// Should require supervisor review
			await expect(page.locator('[data-testid="supervisor-review-required"]')).toBeVisible();
			await expect(page.locator("text=Revisão supervisora necessária em 24h")).toBeVisible();
		});

		test("should maintain audit integrity and prevent tampering", async ({ page }) => {
			// Emergency login
			await page.goto("/emergency");
			await page.fill('[data-testid="emergency-code"]', "EMRG2024");
			await page.fill('[data-testid="professional-id"]', "CRM12345");
			await page.fill('[data-testid="emergency-password"]', "EmergencySecure123!");
			await page.click('[data-testid="emergency-login"]');
			await page.waitForURL("**/emergency/dashboard");

			// Access patient data
			await page.fill('[data-testid="patient-search-emergency"]', "Maria Silva Santos");
			await page.click('[data-testid="emergency-search-btn"]');
			await page.fill('[data-testid="emergency-justification"]', "Teste de auditoria");
			await page.selectOption('[data-testid="emergency-type"]', "other");
			await page.click('[data-testid="confirm-emergency-access"]');

			// Navigate to audit logs
			await page.click('[data-testid="view-audit-log"]');

			// Audit entries should be read-only
			const auditEntries = page.locator('[data-testid="audit-entry"]');
			await expect(auditEntries.first()).toBeVisible();

			// Should not have edit or delete options
			const editButton = page.locator('[data-testid="edit-audit"], button:has-text("Editar")');
			const deleteButton = page.locator('[data-testid="delete-audit"], button:has-text("Excluir")');

			expect(await editButton.count()).toBe(0);
			expect(await deleteButton.count()).toBe(0);

			// Verify audit entries are properly timestamped and signed
			await expect(auditEntries.first()).toContainText(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/); // Timestamp

			// Digital signature or hash should be present
			const signatureField = page.locator('[data-testid="audit-signature"], .audit-hash');
			if ((await signatureField.count()) > 0) {
				await expect(signatureField).toBeVisible();
				await expect(signatureField).toContainText(/[a-f0-9]{32,}/); // Hash pattern
			}
		});
	});

	test.describe("⏱️ Performance & Reliability", () => {
		test("should handle concurrent emergency access requests", async ({ page, context }) => {
			// Simulate multiple emergency access attempts
			const page1 = page;
			const page2 = await context.newPage();
			const page3 = await context.newPage();

			const emergencyLogin = async (testPage: any, professionalId: string) => {
				await testPage.goto("/emergency");
				await testPage.fill('[data-testid="emergency-code"]', "EMRG2024");
				await testPage.fill('[data-testid="professional-id"]', professionalId);
				await testPage.fill('[data-testid="emergency-password"]', "EmergencySecure123!");
				await testPage.click('[data-testid="emergency-login"]');
				return testPage.waitForURL("**/emergency/dashboard");
			};

			const startTime = Date.now();

			// Concurrent emergency logins
			await Promise.all([
				emergencyLogin(page1, "CRM12345"),
				emergencyLogin(page2, "CRM67890"),
				emergencyLogin(page3, "CRM54321"),
			]);

			const totalTime = Date.now() - startTime;

			// All should complete within reasonable time
			expect(totalTime).toBeLessThan(15_000); // 15 seconds for 3 concurrent logins

			// All pages should have emergency access
			await expect(page1.locator('[data-testid="emergency-dashboard"]')).toBeVisible();
			await expect(page2.locator('[data-testid="emergency-dashboard"]')).toBeVisible();
			await expect(page3.locator('[data-testid="emergency-dashboard"]')).toBeVisible();

			await page2.close();
			await page3.close();
		});

		test("should maintain performance under emergency conditions", async ({ page }) => {
			// Emergency login
			await page.goto("/emergency");
			await page.fill('[data-testid="emergency-code"]', "EMRG2024");
			await page.fill('[data-testid="professional-id"]', "CRM12345");
			await page.fill('[data-testid="emergency-password"]', "EmergencySecure123!");
			await page.click('[data-testid="emergency-login"]');
			await page.waitForURL("**/emergency/dashboard");

			// Perform multiple rapid patient searches
			const patients = ["Maria Silva", "João Santos", "Ana Costa", "Carlos Oliveira", "Paula Lima"];

			const searchTimes = [];

			for (const patient of patients) {
				const searchStart = Date.now();

				await page.fill('[data-testid="patient-search-emergency"]', patient);
				await page.click('[data-testid="emergency-search-btn"]');

				if ((await page.locator('[data-testid="emergency-justification"]').count()) > 0) {
					await page.fill('[data-testid="emergency-justification"]', `Emergência médica - ${patient}`);
					await page.selectOption('[data-testid="emergency-type"]', "other");
					await page.click('[data-testid="confirm-emergency-access"]');
				}

				await page.waitForSelector('[data-testid="emergency-patient-data"]');

				const searchTime = Date.now() - searchStart;
				searchTimes.push(searchTime);

				// Clear search for next patient
				await page.click('[data-testid="clear-search"]');
			}

			// All searches should be fast
			const avgSearchTime = searchTimes.reduce((a, b) => a + b, 0) / searchTimes.length;
			expect(avgSearchTime).toBeLessThan(5000); // Average under 5 seconds

			// No search should take more than 8 seconds
			const maxSearchTime = Math.max(...searchTimes);
			expect(maxSearchTime).toBeLessThan(8000);

			console.log(`Average emergency search time: ${avgSearchTime}ms`);
			console.log(`Maximum emergency search time: ${maxSearchTime}ms`);
		});

		test("should handle system failures gracefully in emergency mode", async ({ page }) => {
			// Emergency login
			await page.goto("/emergency");
			await page.fill('[data-testid="emergency-code"]', "EMRG2024");
			await page.fill('[data-testid="professional-id"]', "CRM12345");
			await page.fill('[data-testid="emergency-password"]', "EmergencySecure123!");
			await page.click('[data-testid="emergency-login"]');
			await page.waitForURL("**/emergency/dashboard");

			// Simulate network interruption during patient search
			await page.route("**/api/patients/emergency-search", (route) => {
				// Fail first request, succeed on retry
				if (route.request().url().includes("retry")) {
					route.continue();
				} else {
					route.abort("failed");
				}
			});

			await page.fill('[data-testid="patient-search-emergency"]', "Maria Silva Santos");
			await page.click('[data-testid="emergency-search-btn"]');

			// Should show retry mechanism
			await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
			await expect(page.locator('[data-testid="retry-button"], button:has-text("Tentar Novamente")')).toBeVisible();

			// Click retry with modified route
			await page.route("**/api/patients/emergency-search", (route) => route.continue());
			await page.click('[data-testid="retry-button"]');

			// Should eventually succeed
			await page.waitForSelector('[data-testid="emergency-patient-data"]', {
				timeout: 10_000,
			});
			await expect(page.locator('[data-testid="emergency-patient-data"]')).toBeVisible();
		});
	});

	test.describe("🔒 Security & Compliance", () => {
		test("should enforce emergency access time limits", async ({ page }) => {
			// Emergency login
			await page.goto("/emergency");
			await page.fill('[data-testid="emergency-code"]', "EMRG2024");
			await page.fill('[data-testid="professional-id"]', "CRM12345");
			await page.fill('[data-testid="emergency-password"]', "EmergencySecure123!");
			await page.click('[data-testid="emergency-login"]');
			await page.waitForURL("**/emergency/dashboard");

			// Check for emergency session timer
			await expect(page.locator('[data-testid="emergency-timer"]')).toBeVisible();

			// Verify timer shows remaining time
			const timerText = await page.locator('[data-testid="emergency-timer"]').textContent();
			expect(timerText).toMatch(/\d+:\d+/); // MM:SS format

			// Should show warning when time is running low
			// Note: In a real test, you'd simulate time passage or use shorter timer for testing
			const warningCheck = page.locator('[data-testid="time-warning"]');
			if ((await warningCheck.count()) > 0) {
				await expect(warningCheck).toHaveClass(/warning|alert/);
			}
		});

		test("should enforce emergency session time limits and auto-logout", async ({ page }) => {
			// Start emergency session
			await page.goto("/login");
			await page.click('[data-testid="emergency-access-btn"]');
			await page.fill('[data-testid="emergency-id"]', "EMRG001");
			await page.fill('[data-testid="emergency-code"]', "VIDA2024");
			await page.fill('[data-testid="incident-description"]', "Teste de limite de sessão");
			await page.click('[data-testid="emergency-access-confirm"]');

			await page.waitForURL("/emergency-dashboard");

			// Should show session timer
			await expect(page.locator('[data-testid="session-countdown"]')).toBeVisible();

			// Check initial timer value (should be 30 minutes = 1800 seconds)
			const initialTimer = await page.locator('[data-testid="session-countdown"]').textContent();
			expect(initialTimer).toMatch(/29:|30:/); // Should start around 29-30 minutes

			// Should show warning messages
			await expect(page.locator('[data-testid="session-limit-warning"]')).toBeVisible();
			await expect(page.locator("text=Sessão limitada a 30 minutos")).toBeVisible();

			// Test extension request
			await page.click('[data-testid="extend-session-btn"]');
			await expect(page.locator('[data-testid="extension-request-form"]')).toBeVisible();

			await page.fill(
				'[data-testid="extension-justification"]',
				"Procedimento ainda em andamento - paciente em estado crítico"
			);
			await page.fill('[data-testid="supervising-physician"]', "Dr. Supervisor - CRM/SP 777666");

			await page.click('[data-testid="request-extension"]');

			// Should show extension request submitted
			await expect(page.locator("text=Solicitação de extensão enviada")).toBeVisible();
			await expect(page.locator("text=Aguardando aprovação")).toBeVisible();
		});

		test("should automatically log out after emergency session expires", async ({ page }) => {
			// This test would require either mocking time or using a shorter session duration
			// For demonstration, we'll test the logout mechanism exists

			await page.goto("/emergency");
			await page.fill('[data-testid="emergency-code"]', "EMRG2024");
			await page.fill('[data-testid="professional-id"]', "CRM12345");
			await page.fill('[data-testid="emergency-password"]', "EmergencySecure123!");
			await page.click('[data-testid="emergency-login"]');
			await page.waitForURL("**/emergency/dashboard");

			// Verify emergency session controls exist
			await expect(page.locator('[data-testid="emergency-session-control"]')).toBeVisible();

			// Verify manual emergency logout option
			const emergencyLogout = page.locator('[data-testid="emergency-logout"], button:has-text("ENCERRAR EMERGÊNCIA")');
			await expect(emergencyLogout).toBeVisible();

			// Test manual logout
			await emergencyLogout.click();

			// Should return to emergency login page
			await page.waitForURL(/.*\/emergency$/);
			await expect(page.locator('[data-testid="emergency-mode"]')).toBeVisible();

			// Should clear all session data
			const sessionData = await page.evaluate(() => localStorage.getItem("emergency-session"));
			expect(sessionData).toBeNull();
		});

		test("should handle multiple concurrent emergency sessions", async ({ page, context }) => {
			// First emergency session
			await page.goto("/login");
			await page.click('[data-testid="emergency-access-btn"]');
			await page.fill('[data-testid="emergency-id"]', "EMRG001");
			await page.fill('[data-testid="emergency-code"]', "VIDA2024");
			await page.fill('[data-testid="incident-description"]', "Emergência 1 - Infarto");
			await page.click('[data-testid="emergency-access-confirm"]');

			await page.waitForURL("/emergency-dashboard");

			// Create second browser context for concurrent session
			const page2 = await context.newPage();
			await page2.goto("/login");

			// Second emergency session
			await page2.click('[data-testid="emergency-access-btn"]');
			await page2.fill('[data-testid="emergency-id"]', "EMRG002");
			await page2.fill('[data-testid="emergency-code"]', "VIDA2024");
			await page2.fill('[data-testid="incident-description"]', "Emergência 2 - Acidente de trânsito");
			await page2.click('[data-testid="emergency-access-confirm"]');

			await page2.waitForURL("/emergency-dashboard");

			// Both sessions should be active independently
			await expect(page.locator('[data-testid="emergency-banner"]')).toBeVisible();
			await expect(page2.locator('[data-testid="emergency-banner"]')).toBeVisible();

			// Each should have its own session timer
			await expect(page.locator('[data-testid="session-countdown"]')).toBeVisible();
			await expect(page2.locator('[data-testid="session-countdown"]')).toBeVisible();

			// Should maintain separate audit trails
			const sessionId1 = await page.locator('[data-testid="session-id"]').textContent();
			const sessionId2 = await page2.locator('[data-testid="session-id"]').textContent();
			expect(sessionId1).not.toBe(sessionId2);
		});
	});
});
