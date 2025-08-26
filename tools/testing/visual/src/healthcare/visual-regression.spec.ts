/**
 * Healthcare Visual Regression Tests
 *
 * Validates visual consistency of healthcare interfaces
 * across devices and accessibility modes.
 */

import { expect, test } from "@playwright/test";

test.describe("Healthcare Dashboard Visuals", () => {
	test.beforeEach(async ({ page }) => {
		// Disable animations for consistent captures
		await page.addStyleTag({
			content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
		});
	});

	test("Patient Dashboard - Full Page", async ({ page }) => {
		await page.goto("/dashboard/patient");

		// Wait for content to load
		await page.waitForSelector('[data-testid="patient-dashboard"]');
		await page.waitForLoadState("networkidle");

		// Hide dynamic content
		await page.locator('[data-testid="current-time"]').evaluate((el) => {
			el.textContent = "14:30 - 17 Aug 2025";
		});

		await page.locator('[data-testid="last-update"]').evaluate((el) => {
			el.textContent = "Atualizado há 2 minutos";
		});

		// Take full page screenshot
		await expect(page).toHaveScreenshot("patient-dashboard-full.png", {
			fullPage: true,
			clip: { x: 0, y: 0, width: 1920, height: 1080 },
		});
	});

	test("Patient Registration Form", async ({ page }) => {
		await page.goto("/patient/register");

		await page.waitForSelector('[data-testid="patient-registration-form"]');

		// Empty form state
		await expect(
			page.locator('[data-testid="patient-registration-form"]'),
		).toHaveScreenshot("registration-form-empty.png");

		// Filled form state
		await page.fill('[data-testid="patient-name"]', "Maria Silva Santos");
		await page.fill('[data-testid="patient-cpf"]', "123.456.789-00");
		await page.fill('[data-testid="patient-email"]', "maria.silva@email.com");
		await page.fill('[data-testid="patient-phone"]', "(11) 99999-9999");
		await page.fill('[data-testid="patient-birthdate"]', "1990-01-15");

		await expect(
			page.locator('[data-testid="patient-registration-form"]'),
		).toHaveScreenshot("registration-form-filled.png");

		// Error state
		await page.fill('[data-testid="patient-cpf"]', "123.456.789-99"); // Invalid CPF
		await page.click('[data-testid="validate-form"]');
		await page.waitForSelector('[data-testid="cpf-error"]');

		await expect(
			page.locator('[data-testid="patient-registration-form"]'),
		).toHaveScreenshot("registration-form-error.png");
	});

	test("Medical Appointment Calendar", async ({ page }) => {
		await page.goto("/appointments/calendar");

		await page.waitForSelector('[data-testid="appointment-calendar"]');

		// Set specific date for consistency
		await page.evaluate(() => {
			const today = new Date("2025-08-17");
			window.__TEST_DATE__ = today;
		});

		await expect(
			page.locator('[data-testid="appointment-calendar"]'),
		).toHaveScreenshot("appointment-calendar.png");

		// Day view
		await page.click('[data-testid="calendar-day-view"]');
		await page.waitForSelector('[data-testid="day-view-container"]');

		await expect(
			page.locator('[data-testid="day-view-container"]'),
		).toHaveScreenshot("appointment-day-view.png");

		// Week view
		await page.click('[data-testid="calendar-week-view"]');
		await page.waitForSelector('[data-testid="week-view-container"]');

		await expect(
			page.locator('[data-testid="week-view-container"]'),
		).toHaveScreenshot("appointment-week-view.png");
	});

	test("Medical Records Interface", async ({ page }) => {
		await page.goto("/medical-records/patient/123");

		await page.waitForSelector('[data-testid="medical-records-container"]');

		// Records list view
		await expect(
			page.locator('[data-testid="medical-records-list"]'),
		).toHaveScreenshot("medical-records-list.png");

		// Individual record view
		await page.click('[data-testid="record-item-1"]');
		await page.waitForSelector('[data-testid="record-detail-view"]');

		await expect(
			page.locator('[data-testid="record-detail-view"]'),
		).toHaveScreenshot("medical-record-detail.png");

		// Prescription view
		await page.click('[data-testid="view-prescription"]');
		await page.waitForSelector('[data-testid="prescription-viewer"]');

		await expect(
			page.locator('[data-testid="prescription-viewer"]'),
		).toHaveScreenshot("prescription-detail.png");
	});

	test("Professional Dashboard", async ({ page }) => {
		// Login as healthcare professional
		await page.goto("/auth/professional-login");
		await page.fill('[data-testid="professional-registration"]', "123456-SP");
		await page.fill('[data-testid="professional-password"]', "SecurePass123!");
		await page.click('[data-testid="login-button"]');

		await page.waitForSelector('[data-testid="professional-dashboard"]');

		// Hide dynamic content
		await page
			.locator('[data-testid="current-patients-count"]')
			.evaluate((el) => {
				el.textContent = "12";
			});

		await page.locator('[data-testid="todays-appointments"]').evaluate((el) => {
			el.textContent = "8";
		});

		await expect(page).toHaveScreenshot("professional-dashboard-full.png", {
			fullPage: true,
		});

		// Sidebar navigation
		await expect(
			page.locator('[data-testid="professional-sidebar"]'),
		).toHaveScreenshot("professional-sidebar.png");

		// Patient queue
		await expect(
			page.locator('[data-testid="patient-queue"]'),
		).toHaveScreenshot("patient-queue.png");
	});
});

test.describe("Healthcare Forms and Components", () => {
	test("LGPD Consent Forms", async ({ page }) => {
		await page.goto("/compliance/lgpd-consent");

		await page.waitForSelector('[data-testid="lgpd-consent-form"]');

		// Initial consent form
		await expect(
			page.locator('[data-testid="lgpd-consent-form"]'),
		).toHaveScreenshot("lgpd-consent-initial.png");

		// Data processing details
		await page.click('[data-testid="show-data-processing-details"]');
		await page.waitForSelector('[data-testid="data-processing-details"]');

		await expect(
			page.locator('[data-testid="lgpd-consent-form"]'),
		).toHaveScreenshot("lgpd-consent-details.png");

		// Consent granted state
		await page.check('[data-testid="consent-data-processing"]');
		await page.check('[data-testid="consent-marketing"]');

		await expect(
			page.locator('[data-testid="lgpd-consent-form"]'),
		).toHaveScreenshot("lgpd-consent-granted.png");
	});

	test("Medical Procedure Forms", async ({ page }) => {
		await page.goto("/procedures/botox-form");

		await page.waitForSelector('[data-testid="procedure-form"]');

		// Empty procedure form
		await expect(
			page.locator('[data-testid="procedure-form"]'),
		).toHaveScreenshot("procedure-form-empty.png");

		// Filled procedure form
		await page.selectOption('[data-testid="procedure-type"]', "botox_facial");
		await page.fill(
			'[data-testid="treatment-area"]',
			"Região frontal e glabelar",
		);
		await page.fill('[data-testid="dosage"]', "20 unidades");
		await page.check('[data-testid="patient-consent"]');

		await expect(
			page.locator('[data-testid="procedure-form"]'),
		).toHaveScreenshot("procedure-form-filled.png");

		// Risk assessment section
		await page.click('[data-testid="show-risk-assessment"]');
		await page.waitForSelector('[data-testid="risk-assessment-section"]');

		await expect(
			page.locator('[data-testid="procedure-form"]'),
		).toHaveScreenshot("procedure-form-with-risks.png");
	});

	test("Medication Management", async ({ page }) => {
		await page.goto("/medications/patient/123");

		await page.waitForSelector('[data-testid="medication-management"]');

		// Current medications list
		await expect(
			page.locator('[data-testid="current-medications"]'),
		).toHaveScreenshot("current-medications.png");

		// Add new medication form
		await page.click('[data-testid="add-medication-btn"]');
		await page.waitForSelector('[data-testid="add-medication-form"]');

		await expect(
			page.locator('[data-testid="add-medication-form"]'),
		).toHaveScreenshot("add-medication-form.png");

		// Drug interaction warning
		await page.fill('[data-testid="medication-name"]', "Warfarina");
		await page.fill('[data-testid="medication-dosage"]', "5mg");
		await page.click('[data-testid="check-interactions"]');
		await page.waitForSelector('[data-testid="interaction-warning"]');

		await expect(
			page.locator('[data-testid="medication-management"]'),
		).toHaveScreenshot("medication-interaction-warning.png");
	});
});

test.describe("Accessibility Visual Validation", () => {
	test("High Contrast Mode", async ({ page }) => {
		await page.goto("/dashboard/patient");

		// Enable high contrast mode
		await page.evaluate(() => {
			document.documentElement.setAttribute("data-theme", "high-contrast");
		});

		await page.waitForSelector('[data-testid="patient-dashboard"]');

		await expect(page).toHaveScreenshot("dashboard-high-contrast.png", {
			fullPage: true,
		});
	});

	test("Large Text Mode", async ({ page }) => {
		await page.goto("/dashboard/patient");

		// Enable large text mode
		await page.evaluate(() => {
			document.documentElement.style.fontSize = "120%";
			document.documentElement.setAttribute("data-accessibility", "large-text");
		});

		await page.waitForSelector('[data-testid="patient-dashboard"]');

		await expect(page).toHaveScreenshot("dashboard-large-text.png", {
			fullPage: true,
		});
	});

	test("Focus States", async ({ page }) => {
		await page.goto("/patient/register");

		await page.waitForSelector('[data-testid="patient-registration-form"]');

		// Focus on form elements
		await page.focus('[data-testid="patient-name"]');
		await expect(page.locator('[data-testid="patient-name"]')).toHaveScreenshot(
			"input-focus-state.png",
		);

		await page.focus('[data-testid="submit-registration"]');
		await expect(
			page.locator('[data-testid="submit-registration"]'),
		).toHaveScreenshot("button-focus-state.png");
	});
});

test.describe("Responsive Design Validation", () => {
	test("Mobile Patient Dashboard", async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto("/dashboard/patient");

		await page.waitForSelector('[data-testid="patient-dashboard"]');

		await expect(page).toHaveScreenshot("mobile-patient-dashboard.png", {
			fullPage: true,
		});
	});

	test("Tablet Professional Interface", async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto("/dashboard/professional");

		await page.waitForSelector('[data-testid="professional-dashboard"]');

		await expect(page).toHaveScreenshot("tablet-professional-dashboard.png", {
			fullPage: true,
		});
	});

	test("Desktop Wide Screen", async ({ page }) => {
		await page.setViewportSize({ width: 2560, height: 1440 });
		await page.goto("/dashboard/patient");

		await page.waitForSelector('[data-testid="patient-dashboard"]');

		await expect(page).toHaveScreenshot("desktop-wide-dashboard.png", {
			fullPage: true,
		});
	});
});
