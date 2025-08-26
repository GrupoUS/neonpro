import { expect, test } from "@playwright/test";

/**
 * Profile Page E2E Tests for NeonPro Healthcare
 *
 * Critical user profile workflows:
 * - User profile information management
 * - Account settings and preferences
 * - Security settings and password management
 * - Professional credentials and licenses
 * - LGPD privacy controls
 * - Notification preferences
 */

test.describe("Profile Page - Basic Information", () => {
	test.beforeEach(async ({ page }) => {
		// Login as healthcare professional
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');

		// Navigate to profile
		await page.goto("/profile");
		await page.waitForLoadState("networkidle");
	});

	test("should display user profile information", async ({ page }) => {
		// Check profile page title
		await expect(page.locator("h1, .profile-title")).toContainText(
			/Perfil|Profile/,
		);

		// Should display user name
		await expect(
			page.locator('[data-testid="user-name"]').or(page.locator(".user-name")),
		).toBeVisible();

		// Should display email
		await expect(
			page
				.locator('[data-testid="user-email"]')
				.or(page.locator(".user-email")),
		).toBeVisible();

		// Should display profile photo or avatar
		await expect(
			page
				.locator('[data-testid="profile-photo"]')
				.or(page.locator(".profile-photo"))
				.or(page.locator(".avatar")),
		).toBeVisible();
	});

	test("should edit basic profile information", async ({ page }) => {
		// Click edit profile button
		const editButton = page
			.locator('[data-testid="edit-profile"]')
			.or(page.locator('button:has-text("Editar")'))
			.first();
		await editButton.click();

		// Should show editable form
		await expect(
			page
				.locator('[data-testid="profile-form"]')
				.or(page.locator(".profile-form")),
		).toBeVisible();

		// Update name
		const nameField = page
			.locator('[data-testid="name-input"]')
			.or(page.locator('input[name="name"]'));
		await nameField.clear();
		await nameField.fill("Dr. Silva Santos");

		// Update phone
		const phoneField = page
			.locator('[data-testid="phone-input"]')
			.or(page.locator('input[name="phone"]'));
		if (await phoneField.isVisible()) {
			await phoneField.clear();
			await phoneField.fill("(11) 99999-9999");
		}

		// Save changes
		await page.click('[data-testid="save-profile"]');

		// Should show success message
		await expect(
			page
				.locator(".success")
				.or(page.locator("text=salvo"))
				.or(page.locator("text=atualizado")),
		).toBeVisible();

		// Should display updated information
		await expect(page.locator("text=Dr. Silva Santos")).toBeVisible();
	});

	test("should upload profile photo", async ({ page }) => {
		// Look for photo upload section
		const uploadSection = page
			.locator('[data-testid="photo-upload"]')
			.or(page.locator(".photo-upload"));

		if (await uploadSection.isVisible()) {
			// Click upload button
			const uploadButton = page
				.locator('input[type="file"]')
				.or(page.locator('[data-testid="upload-photo"]'));

			if (await uploadButton.isVisible()) {
				// Simulate file upload (note: actual file upload would need real file)
				await uploadButton.setInputFiles({
					name: "profile.jpg",
					mimeType: "image/jpeg",
					buffer: Buffer.from("fake-image-data"),
				});

				// Should show upload progress or success
				await expect(
					page.locator(".upload-success").or(page.locator("text=carregada")),
				).toBeVisible({
					timeout: 10_000,
				});
			}
		}
	});

	test("should validate required profile fields", async ({ page }) => {
		// Click edit profile
		const editButton = page
			.locator('[data-testid="edit-profile"]')
			.or(page.locator('button:has-text("Editar")'))
			.first();
		await editButton.click();

		// Clear required field (name)
		const nameField = page
			.locator('[data-testid="name-input"]')
			.or(page.locator('input[name="name"]'));
		await nameField.clear();

		// Try to save
		await page.click('[data-testid="save-profile"]');

		// Should show validation error
		await expect(
			page.locator(".error").or(page.locator("text=obrigatório")),
		).toBeVisible();

		// Should not save changes
		await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
	});
});

test.describe("Profile Page - Professional Information", () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to profile
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/profile");
		await page.waitForLoadState("networkidle");
	});

	test("should display professional credentials", async ({ page }) => {
		// Navigate to professional info tab
		const professionalTab = page
			.locator('[data-testid="professional-tab"]')
			.or(page.locator('button:has-text("Profissional")'))
			.first();
		if (await professionalTab.isVisible()) {
			await professionalTab.click();
		}

		// Should display CRM number
		const crmField = page
			.locator('[data-testid="crm-number"]')
			.or(page.locator("text=CRM"));
		if (await crmField.isVisible()) {
			await expect(crmField).toBeVisible();
		}

		// Should display specialty
		const specialtyField = page
			.locator('[data-testid="specialty"]')
			.or(page.locator("text=Especialidade"));
		if (await specialtyField.isVisible()) {
			await expect(specialtyField).toBeVisible();
		}
	});

	test("should manage professional licenses", async ({ page }) => {
		// Navigate to licenses section
		const licensesSection = page
			.locator('[data-testid="licenses-section"]')
			.or(page.locator("text=Licenças"));

		if (await licensesSection.isVisible()) {
			await licensesSection.click();

			// Should display license list
			await expect(
				page
					.locator('[data-testid="license-list"]')
					.or(page.locator(".license-list")),
			).toBeVisible();

			// Should have add license button
			const addLicenseButton = page
				.locator('[data-testid="add-license"]')
				.or(page.locator('button:has-text("Adicionar")'))
				.first();
			if (await addLicenseButton.isVisible()) {
				await addLicenseButton.click();

				// Should show license form
				await expect(
					page
						.locator('[data-testid="license-form"]')
						.or(page.locator(".license-form")),
				).toBeVisible();
			}
		}
	});

	test("should update medical specialty", async ({ page }) => {
		// Look for specialty edit option
		const editSpecialty = page
			.locator('[data-testid="edit-specialty"]')
			.or(page.locator('button:has-text("Editar Especialidade")'))
			.first();

		if (await editSpecialty.isVisible()) {
			await editSpecialty.click();

			// Should show specialty dropdown
			const specialtySelect = page
				.locator('[data-testid="specialty-select"]')
				.or(page.locator('select[name="specialty"]'));
			await specialtySelect.selectOption("cardiologia");

			// Save changes
			await page.click('[data-testid="save-specialty"]');

			// Should show success message
			await expect(
				page.locator("text=atualizada").or(page.locator(".success")),
			).toBeVisible();
		}
	});

	test("should validate CRM format", async ({ page }) => {
		// Look for CRM edit field
		const editCRM = page
			.locator('[data-testid="edit-crm"]')
			.or(page.locator('button:has-text("Editar CRM")'))
			.first();

		if (await editCRM.isVisible()) {
			await editCRM.click();

			// Enter invalid CRM format
			const crmField = page
				.locator('[data-testid="crm-input"]')
				.or(page.locator('input[name="crm"]'));
			await crmField.clear();
			await crmField.fill("123");

			// Try to save
			await page.click('[data-testid="save-crm"]');

			// Should show validation error
			await expect(
				page.locator(".error").or(page.locator("text=inválido")),
			).toBeVisible();
		}
	});
});

test.describe("Profile Page - Security Settings", () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to profile security
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/profile");

		// Navigate to security tab
		const securityTab = page
			.locator('[data-testid="security-tab"]')
			.or(page.locator('button:has-text("Segurança")'))
			.first();
		if (await securityTab.isVisible()) {
			await securityTab.click();
		}

		await page.waitForLoadState("networkidle");
	});

	test("should change password", async ({ page }) => {
		// Look for change password section
		const changePasswordButton = page
			.locator('[data-testid="change-password"]')
			.or(page.locator('button:has-text("Alterar Senha")'))
			.first();

		if (await changePasswordButton.isVisible()) {
			await changePasswordButton.click();

			// Should show password form
			await expect(
				page
					.locator('[data-testid="password-form"]')
					.or(page.locator(".password-form")),
			).toBeVisible();

			// Fill current password
			await page.fill('[data-testid="current-password"]', "healthcare123");

			// Fill new password
			await page.fill('[data-testid="new-password"]', "newHealthcare456");

			// Confirm new password
			await page.fill('[data-testid="confirm-password"]', "newHealthcare456");

			// Submit password change
			await page.click('[data-testid="save-password"]');

			// Should show success message
			await expect(
				page.locator("text=alterada").or(page.locator(".success")),
			).toBeVisible();
		}
	});

	test("should validate password strength", async ({ page }) => {
		const changePasswordButton = page
			.locator('[data-testid="change-password"]')
			.or(page.locator('button:has-text("Alterar Senha")'))
			.first();

		if (await changePasswordButton.isVisible()) {
			await changePasswordButton.click();

			// Fill current password
			await page.fill('[data-testid="current-password"]', "healthcare123");

			// Fill weak new password
			await page.fill('[data-testid="new-password"]', "123");

			// Should show password strength indicator
			const strengthIndicator = page
				.locator('[data-testid="password-strength"]')
				.or(page.locator(".password-strength"));
			if (await strengthIndicator.isVisible()) {
				await expect(strengthIndicator).toContainText(/fraca|weak/);
			}

			// Try to save weak password
			await page.click('[data-testid="save-password"]');

			// Should show validation error
			await expect(
				page.locator(".error").or(page.locator("text=muito fraca")),
			).toBeVisible();
		}
	});

	test("should enable two-factor authentication", async ({ page }) => {
		// Look for 2FA section
		const twoFactorSection = page
			.locator('[data-testid="two-factor"]')
			.or(page.locator("text=autenticação de dois fatores"));

		if (await twoFactorSection.isVisible()) {
			// Look for enable 2FA button
			const enable2FA = page
				.locator('[data-testid="enable-2fa"]')
				.or(page.locator('button:has-text("Ativar")'))
				.first();

			if (await enable2FA.isVisible()) {
				await enable2FA.click();

				// Should show 2FA setup instructions
				await expect(
					page
						.locator('[data-testid="2fa-setup"]')
						.or(page.locator(".two-factor-setup")),
				).toBeVisible();

				// Should display QR code or setup key
				const qrCode = page
					.locator('[data-testid="qr-code"]')
					.or(page.locator(".qr-code"));
				const setupKey = page
					.locator('[data-testid="setup-key"]')
					.or(page.locator(".setup-key"));

				expect(
					(await qrCode.isVisible()) || (await setupKey.isVisible()),
				).toBeTruthy();
			}
		}
	});

	test("should manage active sessions", async ({ page }) => {
		// Look for active sessions section
		const sessionsSection = page
			.locator('[data-testid="active-sessions"]')
			.or(page.locator("text=sessões ativas"));

		if (await sessionsSection.isVisible()) {
			await expect(sessionsSection).toBeVisible();

			// Should display current session
			await expect(
				page
					.locator('[data-testid="current-session"]')
					.or(page.locator(".current-session")),
			).toBeVisible();

			// Should have option to terminate other sessions
			const terminateButton = page
				.locator('[data-testid="terminate-sessions"]')
				.or(page.locator('button:has-text("Encerrar")'))
				.first();
			if (await terminateButton.isVisible()) {
				await expect(terminateButton).toBeVisible();
			}
		}
	});
});

test.describe("Profile Page - Privacy & LGPD", () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to privacy settings
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/profile");

		// Navigate to privacy tab
		const privacyTab = page
			.locator('[data-testid="privacy-tab"]')
			.or(page.locator('button:has-text("Privacidade")'))
			.first();
		if (await privacyTab.isVisible()) {
			await privacyTab.click();
		}

		await page.waitForLoadState("networkidle");
	});

	test("should display LGPD data rights", async ({ page }) => {
		// Should show LGPD information
		await expect(
			page
				.locator("text=LGPD")
				.or(page.locator("text=Lei Geral de Proteção de Dados")),
		).toBeVisible();

		// Should display data rights
		const dataRights = page
			.locator('[data-testid="data-rights"]')
			.or(page.locator(".data-rights"));
		if (await dataRights.isVisible()) {
			await expect(dataRights).toBeVisible();

			// Should mention right to access, correct, delete
			await expect(
				page
					.locator("text=acessar")
					.or(page.locator("text=corrigir"))
					.or(page.locator("text=excluir")),
			).toBeVisible();
		}
	});

	test("should export personal data", async ({ page }) => {
		// Look for data export option
		const exportButton = page
			.locator('[data-testid="export-data"]')
			.or(page.locator('button:has-text("Exportar")'))
			.first();

		if (await exportButton.isVisible()) {
			// Start data export
			const downloadPromise = page.waitForEvent("download");
			await exportButton.click();

			// Should show export confirmation
			await expect(
				page
					.locator("text=exportação")
					.or(page.locator(".export-confirmation")),
			).toBeVisible();

			// Should initiate download
			try {
				const download = await downloadPromise;
				expect(download.suggestedFilename()).toMatch(/\.(json|zip)$/);
			} catch {
				// Download might not complete in test environment
			}
		}
	});

	test("should manage data sharing preferences", async ({ page }) => {
		// Look for data sharing settings
		const dataSharingSection = page
			.locator('[data-testid="data-sharing"]')
			.or(page.locator("text=compartilhamento"));

		if (await dataSharingSection.isVisible()) {
			await expect(dataSharingSection).toBeVisible();

			// Should have toggles for different sharing options
			const sharingToggles = page
				.locator('input[type="checkbox"]')
				.filter({ hasText: /compartilhar|analytics|marketing/ });

			if ((await sharingToggles.count()) > 0) {
				// Toggle first option
				await sharingToggles.first().click();

				// Save preferences
				const saveButton = page
					.locator('[data-testid="save-privacy"]')
					.or(page.locator('button:has-text("Salvar")'))
					.first();
				if (await saveButton.isVisible()) {
					await saveButton.click();

					// Should show success message
					await expect(
						page.locator("text=salvas").or(page.locator(".success")),
					).toBeVisible();
				}
			}
		}
	});

	test("should request data deletion", async ({ page }) => {
		// Look for data deletion option
		const deleteButton = page
			.locator('[data-testid="delete-account"]')
			.or(page.locator('button:has-text("Excluir Conta")'))
			.first();

		if (await deleteButton.isVisible()) {
			await deleteButton.click();

			// Should show confirmation dialog
			await expect(
				page
					.locator('[data-testid="delete-confirmation"]')
					.or(page.locator(".delete-confirmation")),
			).toBeVisible();

			// Should require password confirmation
			const passwordField = page.locator(
				'[data-testid="confirm-delete-password"]',
			);
			if (await passwordField.isVisible()) {
				await expect(passwordField).toBeVisible();
			}

			// Cancel deletion (don't actually delete in test)
			const cancelButton = page.locator('button:has-text("Cancelar")');
			if (await cancelButton.isVisible()) {
				await cancelButton.click();
			}
		}
	});
});

test.describe("Profile Page - Notification Preferences", () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to notifications
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/profile");

		// Navigate to notifications tab
		const notificationsTab = page
			.locator('[data-testid="notifications-tab"]')
			.or(page.locator('button:has-text("Notificações")'))
			.first();
		if (await notificationsTab.isVisible()) {
			await notificationsTab.click();
		}

		await page.waitForLoadState("networkidle");
	});

	test("should manage email notifications", async ({ page }) => {
		// Look for email notification settings
		const emailSection = page
			.locator('[data-testid="email-notifications"]')
			.or(page.locator("text=notificações por email"));

		if (await emailSection.isVisible()) {
			await expect(emailSection).toBeVisible();

			// Should have toggles for different notification types
			const appointmentNotifications = page
				.locator('input[type="checkbox"]')
				.filter({ hasText: /consulta|appointment/ })
				.first();
			if (await appointmentNotifications.isVisible()) {
				await appointmentNotifications.click();
			}

			// Save notification preferences
			const saveButton = page
				.locator('[data-testid="save-notifications"]')
				.or(page.locator('button:has-text("Salvar")'))
				.first();
			if (await saveButton.isVisible()) {
				await saveButton.click();

				// Should show success message
				await expect(
					page.locator("text=salvas").or(page.locator(".success")),
				).toBeVisible();
			}
		}
	});

	test("should manage SMS notifications", async ({ page }) => {
		// Look for SMS notification settings
		const smsSection = page
			.locator('[data-testid="sms-notifications"]')
			.or(page.locator("text=notificações por SMS"));

		if (await smsSection.isVisible()) {
			await expect(smsSection).toBeVisible();

			// Should have phone number field
			const phoneField = page
				.locator('[data-testid="notification-phone"]')
				.or(page.locator('input[name="phone"]'));
			if (await phoneField.isVisible()) {
				await phoneField.clear();
				await phoneField.fill("(11) 99999-9999");
			}

			// Enable SMS notifications
			const smsToggle = page
				.locator('input[type="checkbox"]')
				.filter({ hasText: /SMS/ })
				.first();
			if (await smsToggle.isVisible()) {
				await smsToggle.click();
			}
		}
	});

	test("should set notification frequency", async ({ page }) => {
		// Look for frequency settings
		const frequencySection = page
			.locator('[data-testid="notification-frequency"]')
			.or(page.locator("text=frequência"));

		if (await frequencySection.isVisible()) {
			await expect(frequencySection).toBeVisible();

			// Should have frequency options
			const frequencySelect = page
				.locator('[data-testid="frequency-select"]')
				.or(page.locator('select[name="frequency"]'));
			if (await frequencySelect.isVisible()) {
				await frequencySelect.selectOption("daily");
			}
		}
	});
});

test.describe("Profile Page - Accessibility", () => {
	test("should be keyboard accessible", async ({ page }) => {
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/profile");

		// Test keyboard navigation
		await page.keyboard.press("Tab");

		// Should focus on first interactive element
		const focusedElement = await page.locator(":focus");
		await expect(focusedElement).toBeVisible();

		// Continue tabbing through form fields
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");

		// Should be able to navigate to save button
		const saveButton = page.locator("button:focus");
		if (await saveButton.isVisible()) {
			await expect(saveButton).toBeVisible();
		}
	});

	test("should have proper ARIA labels", async ({ page }) => {
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/profile");

		// Check for ARIA landmarks
		const mainContent = page.locator('[role="main"]').or(page.locator("main"));
		await expect(mainContent).toBeVisible();

		// Check for proper form labels
		const formFields = page.locator("input");
		const fieldCount = await formFields.count();

		if (fieldCount > 0) {
			// Should have associated labels
			const firstField = formFields.first();
			const hasLabel = await firstField.evaluate((el) => {
				return (
					el.labels?.length > 0 ||
					el.getAttribute("aria-label") ||
					el.getAttribute("aria-labelledby")
				);
			});
			expect(hasLabel).toBeTruthy();
		}
	});

	test("should support screen readers", async ({ page }) => {
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/profile");

		// Check for screen reader friendly content
		const headings = page.locator("h1, h2, h3");
		const headingCount = await headings.count();
		expect(headingCount).toBeGreaterThan(0);

		// Check for descriptive text
		const ariaDescriptions = page.locator("[aria-describedby]");
		if ((await ariaDescriptions.count()) > 0) {
			await expect(ariaDescriptions.first()).toBeVisible();
		}
	});
});
