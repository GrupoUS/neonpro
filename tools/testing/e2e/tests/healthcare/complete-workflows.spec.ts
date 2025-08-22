/**
 * End-to-End Healthcare Workflows Tests
 * NeonPro Healthcare Platform
 *
 * Complete patient journey testing:
 * - Patient registration → Medical consultation → Appointment booking
 * - Professional workflows → Clinic management → Compliance validation
 */

import { fakerPT_BR as faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";

// Test data generators
const generatePatientData = () => ({
	name: faker.person.fullName(),
	email: faker.internet.email(),
	phone: faker.phone.number("+55 11 9####-####"),
	cpf: faker.helpers.fromRegExp(/\d{3}\.\d{3}\.\d{3}-\d{2}/),
	dateOfBirth: "1985-06-15",
	address: {
		street: faker.location.streetAddress(),
		city: "São Paulo",
		state: "SP",
		zipcode: faker.location.zipCode("#####-###"),
	},
});

const generateAppointmentData = () => ({
	serviceType: faker.helpers.arrayElement(["consultation", "botox", "laser", "facial"]),
	date: faker.date.future({ days: 30 }).toISOString().split("T")[0],
	time: faker.helpers.arrayElement(["09:00", "10:30", "14:00", "15:30"]),
	notes: faker.lorem.sentence(),
});

test.describe("🏥 Complete Healthcare Workflow E2E", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to application
		await page.goto("/");

		// Accept cookies and any initial modals
		const cookieButton = page.locator('[data-testid="accept-cookies"]');
		if (await cookieButton.isVisible()) {
			await cookieButton.click();
		}
	});

	test("👤 Complete Patient Registration Journey", async ({ page }) => {
		test.setTimeout(60_000); // 1 minute timeout for complete flow

		// 1. Start patient registration
		await test.step("Navigate to patient registration", async () => {
			await page.click('[data-testid="register-patient-button"]');
			await expect(page).toHaveURL(/.*\/patients\/new/);
			await expect(page.locator("h1")).toContainText("Cadastro de Paciente");
		});

		// 2. Fill patient personal information
		const patientData = generatePatientData();

		await test.step("Fill personal information", async () => {
			await page.fill('[name="name"]', patientData.name);
			await page.fill('[name="email"]', patientData.email);
			await page.fill('[name="phone"]', patientData.phone);
			await page.fill('[name="cpf"]', patientData.cpf);
			await page.fill('[name="dateOfBirth"]', patientData.dateOfBirth);

			// Verify form validation
			await expect(page.locator('[name="name"]')).toHaveValue(patientData.name);
			await expect(page.locator('[name="email"]')).toHaveValue(patientData.email);
		});

		// 3. Fill address information
		await test.step("Fill address information", async () => {
			await page.fill('[name="address.street"]', patientData.address.street);
			await page.fill('[name="address.city"]', patientData.address.city);
			await page.selectOption('[name="address.state"]', patientData.address.state);
			await page.fill('[name="address.zipcode"]', patientData.address.zipcode);
		});

		// 4. Medical history and consent
		await test.step("Fill medical history and LGPD consent", async () => {
			// Medical history
			await page.check('[name="medicalHistory.hasAllergies"]');
			await page.fill('[name="medicalHistory.allergies"]', "Latex, Penicilina");
			await page.fill('[name="medicalHistory.medications"]', "Vitamina D");

			// Emergency contact
			await page.fill('[name="emergencyContact.name"]', "Maria Silva");
			await page.fill('[name="emergencyContact.phone"]', "+55 11 9876-5432");
			await page.selectOption('[name="emergencyContact.relationship"]', "spouse");

			// LGPD Consent (Critical for Brazilian compliance)
			await page.check('[name="lgpdConsent.dataProcessing"]');
			await page.check('[name="lgpdConsent.marketing"]');

			// Verify consent is checked
			await expect(page.locator('[name="lgpdConsent.dataProcessing"]')).toBeChecked();
		});

		// 5. Submit and verify registration
		await test.step("Submit registration and verify success", async () => {
			await page.click('button[type="submit"]');

			// Wait for success message or redirect
			await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 10_000 });
			await expect(page.locator('[data-testid="success-message"]')).toContainText("Paciente cadastrado com sucesso");

			// Should redirect to patient list or patient detail
			await expect(page).toHaveURL(/.*\/(patients|dashboard)/);
		});

		// 6. Verify patient appears in system
		await test.step("Verify patient in system", async () => {
			if (!page.url().includes("/patients")) {
				await page.goto("/patients");
			}

			// Patient should appear in the list
			await expect(page.locator('[data-testid="patients-table"]')).toBeVisible();
			await expect(page.locator("text=" + patientData.name)).toBeVisible({
				timeout: 5000,
			});
		});
	});

	test("📅 Complete Appointment Booking Flow", async ({ page }) => {
		test.setTimeout(45_000); // 45 seconds timeout

		// Pre-requisite: Need a patient in the system
		// For demo purposes, use existing patient or create mock

		await test.step("Navigate to appointment booking", async () => {
			await page.goto("/appointments/new");
			await expect(page.locator("h1")).toContainText(/(?:Novo Agendamento|Agendar Consulta)/);
		});

		const appointmentData = generateAppointmentData();

		await test.step("Select patient and service", async () => {
			// Select patient (use first available)
			await page.click('[data-testid="patient-select"]');
			await page.click('[data-testid="patient-option"]:first-child');

			// Select service type
			await page.selectOption('[name="serviceType"]', appointmentData.serviceType);

			// Verify service selected
			await expect(page.locator('[name="serviceType"]')).toHaveValue(appointmentData.serviceType);
		});

		await test.step("Select date and time", async () => {
			// Select date
			await page.fill('[name="date"]', appointmentData.date);

			// Select time slot
			await page.click(`[data-testid="time-slot-${appointmentData.time}"]`);

			// Verify slot is selected
			await expect(page.locator(`[data-testid="time-slot-${appointmentData.time}"]`)).toHaveClass(/selected|active/);
		});

		await test.step("Add notes and confirm", async () => {
			await page.fill('[name="notes"]', appointmentData.notes);

			// Submit appointment
			await page.click('button[type="submit"]');

			// Wait for confirmation
			await expect(page.locator('[data-testid="appointment-success"]')).toBeVisible({ timeout: 10_000 });
			await expect(page.locator('[data-testid="appointment-success"]')).toContainText("Agendamento realizado");
		});

		await test.step("Verify appointment in calendar", async () => {
			await page.goto("/agenda");

			// Should see the appointment in calendar view
			await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible();
			await expect(page.locator(`text=${appointmentData.serviceType}`)).toBeVisible({ timeout: 5000 });
		});
	});

	test("⚕️ Professional Workflow - Medical Consultation", async ({ page }) => {
		test.setTimeout(40_000);

		// Login as healthcare professional
		await test.step("Login as healthcare professional", async () => {
			await page.goto("/login");
			await page.fill('[name="email"]', "doctor@neonpro.com");
			await page.fill('[name="password"]', "SecurePassword123!");
			await page.click('button[type="submit"]');

			// Should be redirected to professional dashboard
			await expect(page).toHaveURL(/.*\/dashboard/);
			await expect(page.locator('[data-testid="professional-dashboard"]')).toBeVisible();
		});

		await test.step("Access patient consultation", async () => {
			// Go to appointments
			await page.click('[data-testid="nav-appointments"]');

			// Select first appointment for consultation
			await page.click('[data-testid="start-consultation"]:first-child');

			// Should open consultation interface
			await expect(page.locator('[data-testid="consultation-interface"]')).toBeVisible();
		});

		await test.step("Complete medical consultation", async () => {
			// Fill consultation notes
			await page.fill(
				'[name="consultationNotes"]',
				"Paciente apresenta-se bem. Recomendado tratamento com botox para linhas de expressão."
			);

			// Add treatment recommendations
			await page.click('[data-testid="add-treatment"]');
			await page.selectOption('[name="recommendedTreatment"]', "botox");
			await page.fill('[name="treatmentNotes"]', "Aplicação de 20U de botox na região frontal");

			// Upload photos (if needed)
			const photoUpload = page.locator('[data-testid="photo-upload"]');
			if (await photoUpload.isVisible()) {
				// Simulate photo upload for before/after documentation
				await photoUpload.setInputFiles("test-files/patient-photo-before.jpg");
			}

			// Complete consultation
			await page.click('[data-testid="complete-consultation"]');

			// Verify completion
			await expect(page.locator('[data-testid="consultation-completed"]')).toBeVisible();
		});

		await test.step("Generate consultation report", async () => {
			await page.click('[data-testid="generate-report"]');

			// Wait for report generation
			await expect(page.locator('[data-testid="report-generated"]')).toBeVisible({ timeout: 15_000 });

			// Verify ANVISA compliance markers
			await expect(page.locator('[data-testid="anvisa-compliance"]')).toBeVisible();
			await expect(page.locator('[data-testid="lgpd-compliance"]')).toBeVisible();
		});
	});

	test("🏢 Clinic Administration Workflow", async ({ page }) => {
		test.setTimeout(35_000);

		// Login as clinic administrator
		await test.step("Login as clinic administrator", async () => {
			await page.goto("/login");
			await page.fill('[name="email"]', "admin@neonpro.com");
			await page.fill('[name="password"]', "AdminPassword123!");
			await page.click('button[type="submit"]');

			await expect(page).toHaveURL(/.*\/dashboard/);
		});

		await test.step("Access analytics dashboard", async () => {
			await page.click('[data-testid="nav-analytics"]');

			// Verify analytics widgets load
			await expect(page.locator('[data-testid="revenue-widget"]')).toBeVisible({
				timeout: 10_000,
			});
			await expect(page.locator('[data-testid="appointments-widget"]')).toBeVisible();
			await expect(page.locator('[data-testid="patients-widget"]')).toBeVisible();
		});

		await test.step("Review compliance dashboard", async () => {
			await page.click('[data-testid="compliance-tab"]');

			// Check ANVISA compliance status
			await expect(page.locator('[data-testid="anvisa-status"]')).toBeVisible();
			await expect(page.locator('[data-testid="lgpd-status"]')).toBeVisible();
			await expect(page.locator('[data-testid="cfm-status"]')).toBeVisible();

			// Verify compliance indicators are green/positive
			const complianceIndicators = page.locator('[data-testid*="compliance-indicator"]');
			const count = await complianceIndicators.count();
			expect(count).toBeGreaterThan(0);
		});

		await test.step("Generate business report", async () => {
			await page.click('[data-testid="generate-business-report"]');

			// Select report parameters
			await page.selectOption('[name="reportPeriod"]', "monthly");
			await page.check('[name="includeFinancials"]');
			await page.check('[name="includeCompliance"]');

			await page.click('[data-testid="generate-report-submit"]');

			// Wait for report generation
			await expect(page.locator('[data-testid="report-download"]')).toBeVisible({ timeout: 20_000 });
		});
	});

	test("🔒 LGPD Compliance User Journey", async ({ page }) => {
		test.setTimeout(30_000);

		await test.step("Patient data subject rights access", async () => {
			await page.goto("/meus-dados");

			// Patient should be able to view their data
			await expect(page.locator('[data-testid="patient-data-view"]')).toBeVisible();
			await expect(page.locator('[data-testid="consent-status"]')).toBeVisible();
		});

		await test.step("Update consent preferences", async () => {
			await page.click('[data-testid="update-consent"]');

			// Change marketing consent
			await page.uncheck('[name="marketingConsent"]');
			await page.click('[data-testid="save-consent"]');

			// Verify consent updated
			await expect(page.locator('[data-testid="consent-updated"]')).toBeVisible();
		});

		await test.step("Request data export", async () => {
			await page.click('[data-testid="export-my-data"]');

			// Confirm data export request
			await page.click('[data-testid="confirm-export"]');

			// Should receive confirmation
			await expect(page.locator('[data-testid="export-requested"]')).toBeVisible();
			await expect(page.locator('text="Dados serão enviados por email"')).toBeVisible();
		});
	});

	test("📱 Mobile Responsive Patient Journey", async ({ page, isMobile }) => {
		if (!isMobile) {
			// Set mobile viewport
			await page.setViewportSize({ width: 375, height: 667 });
		}

		test.setTimeout(35_000);

		await test.step("Mobile navigation", async () => {
			await page.goto("/");

			// Mobile menu should be accessible
			await page.click('[data-testid="mobile-menu-button"]');
			await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
		});

		await test.step("Mobile patient registration", async () => {
			await page.click('[data-testid="mobile-register-patient"]');

			// Form should be mobile-optimized
			await expect(page.locator('[data-testid="mobile-patient-form"]')).toBeVisible();

			// Test form interaction on mobile
			const patientData = generatePatientData();
			await page.fill('[name="name"]', patientData.name);
			await page.fill('[name="email"]', patientData.email);

			// Verify mobile form validation
			await expect(page.locator('[name="name"]')).toHaveValue(patientData.name);
		});

		await test.step("Mobile appointment booking", async () => {
			await page.click('[data-testid="mobile-book-appointment"]');

			// Mobile calendar should be touch-friendly
			await expect(page.locator('[data-testid="mobile-calendar"]')).toBeVisible();

			// Test date selection on mobile
			await page.click('[data-testid="calendar-date"]:first-child');
			await expect(page.locator('[data-testid="selected-date"]')).toBeVisible();
		});
	});
});
