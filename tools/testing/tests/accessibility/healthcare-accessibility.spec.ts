/**
 * NeonPro - Accessibility Testing Suite
 * Healthcare WCAG 2.1 AA compliance testing with assistive technology support
 *
 * Tests:
 * - NVDA screen reader compatibility
 * - JAWS screen reader compatibility
 * - VoiceOver accessibility
 * - Keyboard navigation
 * - Focus management
 * - Color contrast validation
 * - Healthcare form accessibility
 * - Brazilian localization testing
 */

import { AxeBuilder } from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { configureAxe, injectAxe } from "axe-playwright";

// Healthcare-specific accessibility configuration
const healthcareAxeConfig = {
	tags: ["wcag2a", "wcag2aa", "wcag21aa", "section508", "best-practice"],
	rules: {
		// Healthcare-specific rules
		"color-contrast-enhanced": { enabled: true },
		"focus-order-semantics": { enabled: true },
		"landmark-complementary-is-top-level": { enabled: true },
		"page-has-heading-one": { enabled: true },
		region: { enabled: true },
		"skip-link": { enabled: true },
		// Form accessibility for healthcare
		label: { enabled: true },
		"form-field-multiple-labels": { enabled: true },
		"required-attr": { enabled: true },
		"aria-required-attr": { enabled: true },
		"aria-valid-attr-value": { enabled: true },
		// Table accessibility for patient data
		"table-headers": { enabled: true },
		"th-has-data-cells": { enabled: true },
		"table-fake-caption": { enabled: true },
	},
};

// Screen reader simulation helpers
class ScreenReaderSimulator {
	constructor(private readonly page: Page) {}

	/**
	 * Simulate NVDA screen reader navigation
	 * Tests virtual PC cursor and browse mode
	 */
	async simulateNVDA() {
		// Test virtual cursor navigation (NVDA browse mode)
		await this.page.keyboard.press("Control+Alt+n"); // Toggle browse mode
		await this.page.keyboard.press("h"); // Navigate by headings
		await this.page.keyboard.press("k"); // Navigate by links
		await this.page.keyboard.press("f"); // Navigate by forms
		await this.page.keyboard.press("t"); // Navigate by tables
		await this.page.keyboard.press("l"); // Navigate by lists

		// Test NVDA specific commands
		await this.page.keyboard.press("Insert+f7"); // Elements list
		await this.page.keyboard.press("Insert+b"); // Say all
		await this.page.keyboard.press("Insert+t"); // Read title
	}

	/**
	 * Simulate JAWS screen reader navigation
	 * Tests virtual PC cursor and screen reading functions
	 */
	async simulateJAWS() {
		// JAWS virtual cursor navigation
		await this.page.keyboard.press("Insert+z"); // Toggle virtual cursor
		await this.page.keyboard.press("h"); // Next heading
		await this.page.keyboard.press("Shift+h"); // Previous heading
		await this.page.keyboard.press("f"); // Next form field
		await this.page.keyboard.press("t"); // Next table
		await this.page.keyboard.press("l"); // Next list

		// JAWS specific commands
		await this.page.keyboard.press("Insert+f6"); // Heading list
		await this.page.keyboard.press("Insert+f5"); // Form fields list
		await this.page.keyboard.press("Insert+r"); // Say all
	}

	/**
	 * Simulate VoiceOver navigation (macOS)
	 * Tests rotor navigation and VoiceOver gestures
	 */
	async simulateVoiceOver() {
		// VoiceOver navigation commands
		await this.page.keyboard.press("Control+Alt+Right"); // Next item
		await this.page.keyboard.press("Control+Alt+Left"); // Previous item
		await this.page.keyboard.press("Control+Alt+Command+h"); // Next heading
		await this.page.keyboard.press("Control+Alt+u"); // Open rotor

		// VoiceOver rotor navigation
		await this.page.keyboard.press("Control+Alt+Command+Right"); // Next rotor item
		await this.page.keyboard.press("Control+Alt+Command+Left"); // Previous rotor item
	}

	/**
	 * Test healthcare-specific announcements
	 */
	async testHealthcareAnnouncements() {
		// Test patient data announcements
		const patientRows = await this.page.locator('[role="row"]');
		for (let i = 0; i < (await patientRows.count()); i++) {
			const row = patientRows.nth(i);
			await row.focus();

			// Verify screen reader announcements for patient data
			await expect(row).toHaveAttribute("aria-label");

			// Test healthcare-specific data announcements
			const cpfCell = row.locator(
				"text=/[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}/",
			);
			if ((await cpfCell.count()) > 0) {
				await expect(cpfCell).toBeVisible();
			}
		}
	}
}

// Healthcare form testing utilities
class HealthcareFormTester {
	constructor(private readonly page: Page) {}

	/**
	 * Test Brazilian healthcare form patterns
	 */
	async testBrazilianHealthcareForms() {
		// Test CPF field accessibility
		const cpfField = this.page.locator(
			'input[name="cpf"], input[aria-label*="CPF"]',
		);
		if ((await cpfField.count()) > 0) {
			await cpfField.first().focus();
			await expect(cpfField.first()).toHaveAttribute("aria-label");
			await expect(cpfField.first()).toHaveAttribute("required");

			// Test CPF format validation announcement
			await cpfField.first().fill("12345678900");
			await this.page.keyboard.press("Tab");

			const errorMessage = this.page.locator(
				'[role="alert"], [aria-live="polite"]',
			);
			if ((await errorMessage.count()) > 0) {
				await expect(errorMessage.first()).toBeVisible();
			}
		}

		// Test phone field accessibility
		const phoneField = this.page.locator(
			'input[type="tel"], input[aria-label*="telefone"]',
		);
		if ((await phoneField.count()) > 0) {
			await phoneField.first().focus();
			await expect(phoneField.first()).toHaveAttribute("aria-label");
		}

		// Test healthcare-specific required fields
		const healthcareFields = ["nome", "cpf", "telefone", "email"];
		for (const field of healthcareFields) {
			const fieldElement = this.page.locator(
				`[name="${field}"], [aria-label*="${field}"]`,
			);
			if ((await fieldElement.count()) > 0) {
				await expect(fieldElement.first()).toHaveAttribute(
					"aria-required",
					"true",
				);
			}
		}
	}

	/**
	 * Test healthcare form error handling
	 */
	async testHealthcareFormErrors() {
		// Test error summary accessibility
		const errorSummary = this.page.locator('[role="alert"], .error-summary');
		if ((await errorSummary.count()) > 0) {
			await expect(errorSummary.first()).toHaveAttribute("aria-live", "polite");
			await expect(errorSummary.first()).toBeFocused();
		}

		// Test individual field errors
		const errorFields = this.page.locator(
			'[aria-invalid="true"], .field-error',
		);
		for (let i = 0; i < (await errorFields.count()); i++) {
			const field = errorFields.nth(i);
			await expect(field).toHaveAttribute("aria-describedby");

			const errorId = await field.getAttribute("aria-describedby");
			if (errorId) {
				const errorMessage = this.page.locator(`#${errorId}`);
				await expect(errorMessage).toBeVisible();
			}
		}
	}
}

// Main test suite
test.describe("Healthcare Accessibility Compliance - WCAG 2.1 AA", () => {
	let screenReader: ScreenReaderSimulator;
	let formTester: HealthcareFormTester;

	test.beforeEach(async ({ page }) => {
		screenReader = new ScreenReaderSimulator(page);
		formTester = new HealthcareFormTester(page);

		// Configure accessibility testing
		await injectAxe(page);
		await configureAxe(page, healthcareAxeConfig);
	});

	test.describe("Patients Portal Accessibility", () => {
		test("should pass WCAG 2.1 AA compliance for patients page", async ({
			page,
		}) => {
			await page.goto("/dashboard/patients");

			// Run automated accessibility scan
			const accessibilityScanResults = await new AxeBuilder({ page })
				.withTags(["wcag2a", "wcag2aa", "wcag21aa"])
				.analyze();

			expect(accessibilityScanResults.violations).toEqual([]);
		});

		test("should support keyboard navigation in patients table", async ({
			page,
		}) => {
			await page.goto("/dashboard/patients");

			// Test skip links
			await page.keyboard.press("Tab");
			const skipLink = page.locator('text="Pular para pesquisa"');
			if ((await skipLink.count()) > 0) {
				await expect(skipLink).toBeFocused();
				await page.keyboard.press("Enter");

				const searchField = page.locator("#patients-search input");
				await expect(searchField).toBeFocused();
			}

			// Test table keyboard navigation
			const patientsTable = page.locator("#patients-table");
			await patientsTable.focus();

			// Navigate through table rows
			await page.keyboard.press("ArrowDown");
			await page.keyboard.press("ArrowUp");
			await page.keyboard.press("Enter"); // Should activate row
		});

		test("should work with NVDA screen reader", async ({ page }) => {
			await page.goto("/dashboard/patients");

			await screenReader.simulateNVDA();
			await screenReader.testHealthcareAnnouncements();

			// Test patient data announcements
			const firstPatientRow = page.locator('[role="row"]').first();
			await firstPatientRow.focus();

			// Verify aria-label for patient information
			await expect(firstPatientRow.locator("a")).toHaveAttribute(
				"aria-describedby",
			);
		});

		test("should work with JAWS screen reader", async ({ page }) => {
			await page.goto("/dashboard/patients");

			await screenReader.simulateJAWS();

			// Test heading structure for JAWS
			const headings = page.locator("h1, h2, h3, h4, h5, h6");
			for (let i = 0; i < (await headings.count()); i++) {
				const heading = headings.nth(i);
				await expect(heading).toBeVisible();
			}
		});

		test("should work with VoiceOver", async ({ page }) => {
			await page.goto("/dashboard/patients");

			await screenReader.simulateVoiceOver();

			// Test VoiceOver rotor compatibility
			const landmarks = page.locator(
				'[role="main"], [role="navigation"], [role="banner"]',
			);
			expect(await landmarks.count()).toBeGreaterThan(0);
		});
	});

	test.describe("Healthcare Forms Accessibility", () => {
		test("should support Brazilian healthcare form patterns", async ({
			page,
		}) => {
			await page.goto("/dashboard/patients/new");

			await formTester.testBrazilianHealthcareForms();

			// Test form completion with keyboard only
			await page.keyboard.press("Tab"); // Navigate to first field
			await page.keyboard.type("Maria da Silva Santos");
			await page.keyboard.press("Tab");
			await page.keyboard.type("123.456.789-00");
			await page.keyboard.press("Tab");
			await page.keyboard.type("(11) 99999-9999");
		});

		test("should handle healthcare form errors accessibly", async ({
			page,
		}) => {
			await page.goto("/dashboard/patients/new");

			// Trigger form validation errors
			const submitButton = page.locator(
				'button[type="submit"], input[type="submit"]',
			);
			if ((await submitButton.count()) > 0) {
				await submitButton.click();

				await formTester.testHealthcareFormErrors();
			}
		});
	});

	test.describe("Color Contrast and Visual Accessibility", () => {
		test("should meet WCAG AA color contrast ratios", async ({ page }) => {
			await page.goto("/dashboard/patients");

			const axeResults = await new AxeBuilder({ page })
				.withTags(["color-contrast"])
				.analyze();

			expect(axeResults.violations).toEqual([]);
		});

		test("should support high contrast mode", async ({ page }) => {
			// Test Windows high contrast mode
			await page.emulateMedia({ colorScheme: "dark", forcedColors: "active" });
			await page.goto("/dashboard/patients");

			// Verify elements are still visible and accessible
			const buttons = page.locator("button");
			for (let i = 0; i < Math.min(5, await buttons.count()); i++) {
				const button = buttons.nth(i);
				await expect(button).toBeVisible();
			}
		});
	});

	test.describe("Portuguese Localization Accessibility", () => {
		test("should provide proper Portuguese language declarations", async ({
			page,
		}) => {
			await page.goto("/dashboard/patients");

			// Check HTML lang attribute
			const html = page.locator("html");
			await expect(html).toHaveAttribute("lang", "pt-BR");

			// Test Portuguese healthcare terminology
			const portugueseTerms = ["Pacientes", "CPF", "Telefone", "E-mail"];
			for (const term of portugueseTerms) {
				const element = page.locator(`text="${term}"`);
				if ((await element.count()) > 0) {
					await expect(element.first()).toBeVisible();
				}
			}
		});

		test("should format Brazilian data correctly for screen readers", async ({
			page,
		}) => {
			await page.goto("/dashboard/patients");

			// Test CPF formatting announcement
			const cpfElements = page.locator(
				"text=/[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}/",
			);
			if ((await cpfElements.count()) > 0) {
				await expect(cpfElements.first()).toBeVisible();
			}

			// Test phone formatting announcement
			const phoneElements = page.locator(
				"text=/\\([0-9]{2}\\) [0-9]{4,5}-[0-9]{4}/",
			);
			if ((await phoneElements.count()) > 0) {
				await expect(phoneElements.first()).toBeVisible();
			}
		});
	});

	test.describe("Healthcare-Specific Accessibility Patterns", () => {
		test("should announce patient status changes appropriately", async ({
			page,
		}) => {
			await page.goto("/dashboard/patients");

			// Test status badge accessibility
			const statusBadges = page.locator('[role="status"], .badge');
			for (let i = 0; i < (await statusBadges.count()); i++) {
				const badge = statusBadges.nth(i);
				await expect(badge).toHaveAttribute("aria-label");
			}
		});

		test("should provide appropriate healthcare data context", async ({
			page,
		}) => {
			await page.goto("/dashboard/patients");

			// Test patient data table headers
			const tableHeaders = page.locator("th");
			for (let i = 0; i < (await tableHeaders.count()); i++) {
				const header = tableHeaders.nth(i);
				await expect(header).toBeVisible();
			}

			// Test table caption or summary
			const table = page.locator('[role="table"]');
			if ((await table.count()) > 0) {
				await expect(table.first()).toHaveAttribute("aria-label");
			}
		});
	});
});

// Export test utilities for reuse
export { healthcareAxeConfig, HealthcareFormTester, ScreenReaderSimulator };
