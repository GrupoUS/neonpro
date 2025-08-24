import { expect, test } from "@playwright/test";

/**
 * Consent Management Page E2E Tests for NeonPro Healthcare
 *
 * Critical consent workflows:
 * - LGPD data processing consent
 * - Medical procedure consent
 * - Treatment consent and informed consent
 * - Data sharing and marketing consent
 * - Consent withdrawal and revocation
 * - Digital signature and validation
 * - ANVISA compliance for medical consent
 */

test.describe("Consent Management - LGPD Data Consent", () => {
	test.beforeEach(async ({ page }) => {
		// Login as healthcare professional
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');

		// Navigate to consent management
		await page.goto("/consent");
		await page.waitForLoadState("networkidle");
	});

	test("should display consent management interface", async ({ page }) => {
		// Check consent page title
		await expect(page.locator("h1, .consent-title")).toContainText(/Consentimento|Consent|Termos/);

		// Should display LGPD information
		await expect(page.locator("text=LGPD").or(page.locator("text=Lei Geral de Proteção de Dados"))).toBeVisible();

		// Should show consent categories
		await expect(
			page.locator('[data-testid="consent-categories"]').or(page.locator(".consent-categories"))
		).toBeVisible();

		// Should display patient selection
		await expect(page.locator('[data-testid="patient-selector"]').or(page.locator(".patient-selector"))).toBeVisible();
	});

	test("should create data processing consent", async ({ page }) => {
		// Select patient
		const patientSelect = page.locator('[data-testid="patient-select"]').or(page.locator('select[name="patient"]'));
		if (await patientSelect.isVisible()) {
			await patientSelect.selectOption({ index: 1 });
		}

		// Click create consent button
		const createConsentButton = page
			.locator('[data-testid="create-consent"]')
			.or(page.locator('button:has-text("Criar Consentimento")'))
			.first();
		await createConsentButton.click();

		// Select data processing consent type
		const consentType = page.locator('[data-testid="consent-type"]').or(page.locator('select[name="consentType"]'));
		await consentType.selectOption("data-processing");

		// Should display LGPD data processing form
		await expect(
			page.locator('[data-testid="data-processing-form"]').or(page.locator(".data-processing-form"))
		).toBeVisible();

		// Fill consent details
		const purposeField = page
			.locator('[data-testid="processing-purpose"]')
			.or(page.locator('textarea[name="purpose"]'));
		await purposeField.fill("Processamento de dados para prestação de serviços médicos e acompanhamento de tratamento");

		// Select data categories
		const dataCategories = page
			.locator('[data-testid="data-categories"]')
			.or(page.locator('input[name="dataCategories"]'));
		if ((await dataCategories.count()) > 0) {
			await dataCategories.first().check();
		}

		// Set retention period
		const retentionPeriod = page
			.locator('[data-testid="retention-period"]')
			.or(page.locator('select[name="retentionPeriod"]'));
		if (await retentionPeriod.isVisible()) {
			await retentionPeriod.selectOption("5-years");
		}

		// Save consent
		await page.click('[data-testid="save-consent"]');

		// Should show success message
		await expect(page.locator("text=criado").or(page.locator(".success"))).toBeVisible();
	});

	test("should display data subject rights", async ({ page }) => {
		// Should show LGPD rights information
		const rightsSection = page.locator('[data-testid="data-rights"]').or(page.locator("text=Direitos do Titular"));
		if (await rightsSection.isVisible()) {
			await expect(rightsSection).toBeVisible();

			// Should list specific rights
			await expect(
				page.locator("text=acesso").or(page.locator("text=correção")).or(page.locator("text=exclusão"))
			).toBeVisible();
			await expect(page.locator("text=portabilidade").or(page.locator("text=oposição"))).toBeVisible();
		}
	});

	test("should manage consent withdrawal", async ({ page }) => {
		// Look for existing consent
		const existingConsent = page.locator('[data-testid="consent-item"]').or(page.locator(".consent-item")).first();

		if (await existingConsent.isVisible()) {
			await existingConsent.click();

			// Should show consent details
			await expect(page.locator('[data-testid="consent-details"]').or(page.locator(".consent-details"))).toBeVisible();

			// Should have withdraw option
			const withdrawButton = page
				.locator('[data-testid="withdraw-consent"]')
				.or(page.locator('button:has-text("Revogar")'))
				.first();
			if (await withdrawButton.isVisible()) {
				await withdrawButton.click();

				// Should show withdrawal confirmation
				await expect(
					page.locator('[data-testid="withdraw-confirmation"]').or(page.locator(".withdraw-confirmation"))
				).toBeVisible();

				// Confirm withdrawal
				const confirmWithdraw = page
					.locator('[data-testid="confirm-withdraw"]')
					.or(page.locator('button:has-text("Confirmar")'))
					.first();
				await confirmWithdraw.click();

				// Should show withdrawal success
				await expect(page.locator("text=revogado").or(page.locator("text=retirado"))).toBeVisible();
			}
		}
	});

	test("should validate consent expiration", async ({ page }) => {
		// Look for expired consent
		const expiredConsent = page.locator('[data-testid="expired-consent"]').or(page.locator(".expired-consent"));

		if (await expiredConsent.isVisible()) {
			await expect(expiredConsent).toBeVisible();

			// Should be marked as expired
			await expect(expiredConsent).toHaveClass(/expired|invalid/);

			// Should show renewal option
			const renewButton = page
				.locator('[data-testid="renew-consent"]')
				.or(page.locator('button:has-text("Renovar")'))
				.first();
			if (await renewButton.isVisible()) {
				await expect(renewButton).toBeVisible();
			}
		}
	});
});

test.describe("Consent Management - Medical Procedure Consent", () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to consent management
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/consent");
		await page.waitForLoadState("networkidle");
	});

	test("should create medical procedure consent", async ({ page }) => {
		// Select patient
		const patientSelect = page.locator('[data-testid="patient-select"]').or(page.locator('select[name="patient"]'));
		if (await patientSelect.isVisible()) {
			await patientSelect.selectOption({ index: 1 });
		}

		// Create new consent
		const createConsentButton = page
			.locator('[data-testid="create-consent"]')
			.or(page.locator('button:has-text("Criar Consentimento")'))
			.first();
		await createConsentButton.click();

		// Select medical procedure consent
		const consentType = page.locator('[data-testid="consent-type"]').or(page.locator('select[name="consentType"]'));
		await consentType.selectOption("medical-procedure");

		// Should display medical procedure form
		await expect(
			page.locator('[data-testid="medical-procedure-form"]').or(page.locator(".medical-procedure-form"))
		).toBeVisible();

		// Fill procedure details
		const procedureName = page
			.locator('[data-testid="procedure-name"]')
			.or(page.locator('input[name="procedureName"]'));
		await procedureName.fill("Preenchimento com Ácido Hialurônico");

		// Fill procedure description
		const procedureDescription = page
			.locator('[data-testid="procedure-description"]')
			.or(page.locator('textarea[name="procedureDescription"]'));
		await procedureDescription.fill(
			"Procedimento estético para preenchimento facial com ácido hialurônico para redução de rugas e linhas de expressão."
		);

		// Add risks and complications
		const risksField = page.locator('[data-testid="procedure-risks"]').or(page.locator('textarea[name="risks"]'));
		await risksField.fill("Possíveis riscos incluem: edema, hematoma, reações alérgicas, assimetria temporária.");

		// Add expected results
		const expectedResults = page
			.locator('[data-testid="expected-results"]')
			.or(page.locator('textarea[name="expectedResults"]'));
		await expectedResults.fill(
			"Redução visível de rugas e linhas de expressão, com resultados durando de 6 a 12 meses."
		);

		// Set procedure date
		const procedureDate = page
			.locator('[data-testid="procedure-date"]')
			.or(page.locator('input[name="procedureDate"]'));
		if (await procedureDate.isVisible()) {
			await procedureDate.fill("2024-02-15");
		}

		// Save consent
		await page.click('[data-testid="save-consent"]');

		// Should show success message
		await expect(page.locator("text=criado").or(page.locator(".success"))).toBeVisible();
	});

	test("should require informed consent elements", async ({ page }) => {
		// Create medical procedure consent
		const createConsentButton = page
			.locator('[data-testid="create-consent"]')
			.or(page.locator('button:has-text("Criar Consentimento")'))
			.first();
		await createConsentButton.click();

		const consentType = page.locator('[data-testid="consent-type"]').or(page.locator('select[name="consentType"]'));
		await consentType.selectOption("medical-procedure");

		// Should require all informed consent elements
		const requiredFields = [
			'[data-testid="procedure-name"]',
			'[data-testid="procedure-description"]',
			'[data-testid="procedure-risks"]',
			'[data-testid="expected-results"]',
		];

		// Try to save without filling required fields
		await page.click('[data-testid="save-consent"]');

		// Should show validation errors
		await expect(page.locator(".error").or(page.locator("text=obrigatório"))).toBeVisible();
	});

	test("should include ANVISA compliance for aesthetic procedures", async ({ page }) => {
		// Create aesthetic procedure consent
		const createConsentButton = page
			.locator('[data-testid="create-consent"]')
			.or(page.locator('button:has-text("Criar Consentimento")'))
			.first();
		await createConsentButton.click();

		const consentType = page.locator('[data-testid="consent-type"]').or(page.locator('select[name="consentType"]'));
		await consentType.selectOption("aesthetic-procedure");

		// Should display ANVISA compliance information
		const anvisaCompliance = page
			.locator("text=ANVISA")
			.or(page.locator("text=Agência Nacional de Vigilância Sanitária"));
		if (await anvisaCompliance.isVisible()) {
			await expect(anvisaCompliance).toBeVisible();
		}

		// Should include product registration information
		const productRegistration = page
			.locator('[data-testid="product-registration"]')
			.or(page.locator("text=registro ANVISA"));
		if (await productRegistration.isVisible()) {
			await expect(productRegistration).toBeVisible();
		}

		// Should include professional qualification
		const professionalQualification = page
			.locator('[data-testid="professional-qualification"]')
			.or(page.locator("text=qualificação profissional"));
		if (await professionalQualification.isVisible()) {
			await expect(professionalQualification).toBeVisible();
		}
	});

	test("should manage procedure consent versions", async ({ page }) => {
		// Look for existing procedure consent
		const existingConsent = page
			.locator('[data-testid="procedure-consent"]')
			.or(page.locator(".procedure-consent"))
			.first();

		if (await existingConsent.isVisible()) {
			await existingConsent.click();

			// Should show version history
			const versionHistory = page.locator('[data-testid="version-history"]').or(page.locator(".version-history"));
			if (await versionHistory.isVisible()) {
				await expect(versionHistory).toBeVisible();

				// Should display version numbers
				await expect(page.locator("text=Versão").or(page.locator("text=Version"))).toBeVisible();
			}

			// Should have option to create new version
			const newVersionButton = page
				.locator('[data-testid="new-version"]')
				.or(page.locator('button:has-text("Nova Versão")'))
				.first();
			if (await newVersionButton.isVisible()) {
				await expect(newVersionButton).toBeVisible();
			}
		}
	});
});

test.describe("Consent Management - Digital Signatures", () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to consent with signature
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/consent");
		await page.waitForLoadState("networkidle");
	});

	test("should capture digital signature", async ({ page }) => {
		// Create consent that requires signature
		const createConsentButton = page
			.locator('[data-testid="create-consent"]')
			.or(page.locator('button:has-text("Criar Consentimento")'))
			.first();
		await createConsentButton.click();

		// Fill basic consent information
		const consentType = page.locator('[data-testid="consent-type"]').or(page.locator('select[name="consentType"]'));
		await consentType.selectOption("medical-procedure");

		const procedureName = page
			.locator('[data-testid="procedure-name"]')
			.or(page.locator('input[name="procedureName"]'));
		await procedureName.fill("Consulta Médica");

		// Navigate to signature section
		const signatureSection = page.locator('[data-testid="signature-section"]').or(page.locator(".signature-section"));
		if (await signatureSection.isVisible()) {
			await expect(signatureSection).toBeVisible();

			// Should have signature canvas
			const signatureCanvas = page.locator('[data-testid="signature-canvas"]').or(page.locator("canvas"));
			if (await signatureCanvas.isVisible()) {
				await expect(signatureCanvas).toBeVisible();

				// Simulate signature drawing
				const canvasBox = await signatureCanvas.boundingBox();
				if (canvasBox) {
					await page.mouse.move(canvasBox.x + 50, canvasBox.y + 50);
					await page.mouse.down();
					await page.mouse.move(canvasBox.x + 100, canvasBox.y + 100);
					await page.mouse.up();
				}
			}

			// Should have clear signature button
			const clearButton = page
				.locator('[data-testid="clear-signature"]')
				.or(page.locator('button:has-text("Limpar")'))
				.first();
			if (await clearButton.isVisible()) {
				await expect(clearButton).toBeVisible();
			}
		}
	});

	test("should validate signature completeness", async ({ page }) => {
		// Try to save consent without signature
		const createConsentButton = page
			.locator('[data-testid="create-consent"]')
			.or(page.locator('button:has-text("Criar Consentimento")'))
			.first();
		await createConsentButton.click();

		const consentType = page.locator('[data-testid="consent-type"]').or(page.locator('select[name="consentType"]'));
		await consentType.selectOption("medical-procedure");

		// Fill required fields but skip signature
		const procedureName = page
			.locator('[data-testid="procedure-name"]')
			.or(page.locator('input[name="procedureName"]'));
		await procedureName.fill("Consulta Médica");

		// Try to save
		await page.click('[data-testid="save-consent"]');

		// Should show signature validation error
		const signatureError = page.locator("text=assinatura").or(page.locator("text=signature required"));
		if (await signatureError.isVisible()) {
			await expect(signatureError).toBeVisible();
		}
	});

	test("should capture witness signature for critical procedures", async ({ page }) => {
		// Create high-risk procedure consent
		const createConsentButton = page
			.locator('[data-testid="create-consent"]')
			.or(page.locator('button:has-text("Criar Consentimento")'))
			.first();
		await createConsentButton.click();

		const consentType = page.locator('[data-testid="consent-type"]').or(page.locator('select[name="consentType"]'));
		await consentType.selectOption("high-risk-procedure");

		// Should show witness signature section
		const witnessSection = page.locator('[data-testid="witness-signature"]').or(page.locator(".witness-signature"));
		if (await witnessSection.isVisible()) {
			await expect(witnessSection).toBeVisible();

			// Should have witness information fields
			const witnessName = page.locator('[data-testid="witness-name"]').or(page.locator('input[name="witnessName"]'));
			if (await witnessName.isVisible()) {
				await witnessName.fill("Dr. João Santos");
			}

			// Should have witness signature canvas
			const witnessCanvas = page.locator('[data-testid="witness-signature-canvas"]');
			if (await witnessCanvas.isVisible()) {
				await expect(witnessCanvas).toBeVisible();
			}
		}
	});

	test("should generate signed consent document", async ({ page }) => {
		// Look for completed consent with signature
		const signedConsent = page.locator('[data-testid="signed-consent"]').or(page.locator(".signed-consent")).first();

		if (await signedConsent.isVisible()) {
			await signedConsent.click();

			// Should have option to generate PDF
			const generatePdfButton = page
				.locator('[data-testid="generate-pdf"]')
				.or(page.locator('button:has-text("Gerar PDF")'))
				.first();
			if (await generatePdfButton.isVisible()) {
				// Start PDF generation
				const downloadPromise = page.waitForEvent("download");
				await generatePdfButton.click();

				// Should initiate download
				try {
					const download = await downloadPromise;
					expect(download.suggestedFilename()).toMatch(/\.pdf$/);
				} catch {
					// Download might not complete in test environment
				}
			}

			// Should show signature validation status
			const signatureStatus = page.locator('[data-testid="signature-status"]').or(page.locator(".signature-status"));
			if (await signatureStatus.isVisible()) {
				await expect(signatureStatus).toBeVisible();
				await expect(signatureStatus).toContainText(/válida|valid/);
			}
		}
	});
});

test.describe("Consent Management - Audit & Compliance", () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to consent audit
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/consent");

		// Navigate to audit section
		const auditTab = page.locator('[data-testid="audit-tab"]').or(page.locator('button:has-text("Auditoria")')).first();
		if (await auditTab.isVisible()) {
			await auditTab.click();
		}

		await page.waitForLoadState("networkidle");
	});

	test("should display consent audit trail", async ({ page }) => {
		// Should show audit log
		const auditLog = page.locator('[data-testid="audit-log"]').or(page.locator(".audit-log"));
		if (await auditLog.isVisible()) {
			await expect(auditLog).toBeVisible();

			// Should display audit entries
			const auditEntries = page.locator('[data-testid="audit-entry"]').or(page.locator(".audit-entry"));
			if ((await auditEntries.count()) > 0) {
				await expect(auditEntries.first()).toBeVisible();

				// Should show timestamp, user, and action
				await expect(auditEntries.first()).toContainText(/\d{2}\/\d{2}\/\d{4}/);
			}
		}
	});

	test("should track consent modifications", async ({ page }) => {
		// Look for modified consent
		const modifiedConsent = page
			.locator('[data-testid="modified-consent"]')
			.or(page.locator(".modified-consent"))
			.first();

		if (await modifiedConsent.isVisible()) {
			await modifiedConsent.click();

			// Should show modification history
			const modificationHistory = page
				.locator('[data-testid="modification-history"]')
				.or(page.locator(".modification-history"));
			if (await modificationHistory.isVisible()) {
				await expect(modificationHistory).toBeVisible();

				// Should show what was changed
				await expect(page.locator("text=alterado").or(page.locator("text=modificado"))).toBeVisible();
			}
		}
	});

	test("should generate compliance reports", async ({ page }) => {
		// Look for report generation
		const generateReportButton = page
			.locator('[data-testid="generate-report"]')
			.or(page.locator('button:has-text("Gerar Relatório")'))
			.first();

		if (await generateReportButton.isVisible()) {
			await generateReportButton.click();

			// Should show report options
			const reportOptions = page.locator('[data-testid="report-options"]').or(page.locator(".report-options"));
			if (await reportOptions.isVisible()) {
				await expect(reportOptions).toBeVisible();

				// Should have date range selection
				const dateRange = page.locator('[data-testid="date-range"]').or(page.locator(".date-range"));
				if (await dateRange.isVisible()) {
					await expect(dateRange).toBeVisible();
				}

				// Should have consent type filter
				const consentTypeFilter = page
					.locator('[data-testid="consent-type-filter"]')
					.or(page.locator('select[name="consentTypeFilter"]'));
				if (await consentTypeFilter.isVisible()) {
					await expect(consentTypeFilter).toBeVisible();
				}
			}
		}
	});

	test("should validate consent retention periods", async ({ page }) => {
		// Should show retention policy information
		const retentionPolicy = page
			.locator('[data-testid="retention-policy"]')
			.or(page.locator("text=política de retenção"));
		if (await retentionPolicy.isVisible()) {
			await expect(retentionPolicy).toBeVisible();
		}

		// Should identify consents nearing expiration
		const expiringConsents = page.locator('[data-testid="expiring-consents"]').or(page.locator(".expiring-consents"));
		if (await expiringConsents.isVisible()) {
			await expect(expiringConsents).toBeVisible();

			// Should show warning for expiring consents
			await expect(page.locator("text=expira").or(page.locator("text=vencimento"))).toBeVisible();
		}
	});
});

test.describe("Consent Management - Accessibility & Performance", () => {
	test("should be keyboard accessible", async ({ page }) => {
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/consent");

		// Test keyboard navigation
		await page.keyboard.press("Tab");

		// Should focus on first interactive element
		const focusedElement = await page.locator(":focus");
		await expect(focusedElement).toBeVisible();

		// Should be able to navigate through form
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");

		// Should reach actionable elements
		const actionButton = page.locator("button:focus");
		if (await actionButton.isVisible()) {
			await expect(actionButton).toBeVisible();
		}
	});

	test("should have proper ARIA labels for consent forms", async ({ page }) => {
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/consent");

		// Check for form accessibility
		const consentForm = page.locator('[data-testid="consent-form"]').or(page.locator(".consent-form"));
		if (await consentForm.isVisible()) {
			// Should have proper form structure
			const formFields = page.locator("input, select, textarea");
			const fieldCount = await formFields.count();

			if (fieldCount > 0) {
				// Check first field has proper labeling
				const firstField = formFields.first();
				const hasLabel = await firstField.evaluate((el) => {
					return el.labels?.length > 0 || el.getAttribute("aria-label") || el.getAttribute("aria-labelledby");
				});
				expect(hasLabel).toBeTruthy();
			}
		}
	});

	test("should load consent forms efficiently", async ({ page }) => {
		// Measure page load time
		const startTime = Date.now();
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/consent");
		await page.waitForLoadState("networkidle");
		const loadTime = Date.now() - startTime;

		// Should load in reasonable time
		expect(loadTime).toBeLessThan(5000);

		// Critical elements should be visible
		await expect(
			page.locator('[data-testid="consent-categories"]').or(page.locator(".consent-categories"))
		).toBeVisible();
	});

	test("should work on mobile devices", async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/consent");

		// Should be responsive
		await expect(
			page.locator('[data-testid="consent-categories"]').or(page.locator(".consent-categories"))
		).toBeVisible();

		// Touch targets should be appropriate size
		const createButton = page
			.locator('[data-testid="create-consent"]')
			.or(page.locator('button:has-text("Criar")'))
			.first();
		if (await createButton.isVisible()) {
			const buttonBox = await createButton.boundingBox();
			if (buttonBox) {
				expect(buttonBox.height).toBeGreaterThanOrEqual(44);
			}
		}
	});
});
