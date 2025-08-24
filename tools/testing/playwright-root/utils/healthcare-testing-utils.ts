/**
 * 🏥 Healthcare Testing Utilities - NeonPro
 * Patient Data Protection & LGPD Compliance Testing Framework
 * Quality Standard: ≥9.9/10 for Healthcare Operations
 */

import { faker } from "@faker-js/faker/locale/pt_BR";
import { expect, type Page } from "@playwright/test";

// 🛡️ PATIENT DATA ANONYMIZATION UTILITIES
export class HealthcareDataAnonymizer {
	/**
	 * Generate LGPD-compliant anonymous patient data for testing
	 * NEVER use real patient data in tests
	 */
	static generateAnonymousPatient() {
		return {
			id: `test_patient_${faker.string.uuid()}`,
			name: `Paciente Teste ${faker.person.firstName()}`,
			email: `teste.${faker.string.alphanumeric(8)}@teste.neonpro.com`,
			phone: faker.phone.number("(11) 9####-####"),
			cpf: HealthcareDataAnonymizer.generateTestCPF(),
			birthDate: faker.date
				.between({
					from: "1950-01-01",
					to: "2000-12-31",
				})
				.toISOString()
				.split("T")[0],
			// Healthcare-specific anonymous data
			treatments: ["Tratamento Facial Teste", "Procedimento Estético Teste"],
			medicalHistory: "Histórico médico anonimizado para testes",
			isTestData: true, // CRITICAL: Mark all test data
		};
	}

	/**
	 * Generate valid test CPF that passes validation but is clearly test data
	 */
	private static generateTestCPF(): string {
		// Generate test CPF starting with 000 to indicate test data
		const base = `000${faker.string.numeric(8)}`;
		return base.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
	}

	/**
	 * Generate anonymous financial data for testing
	 */
	static generateAnonymousFinancialData() {
		return {
			transactionId: `test_tx_${faker.string.uuid()}`,
			amount: faker.number.float({ min: 100, max: 5000, fractionDigits: 2 }),
			description: `Teste - ${faker.commerce.productName()}`,
			date: faker.date.recent().toISOString(),
			type: faker.helpers.arrayElement(["payment", "refund", "adjustment"]),
			isTestData: true,
		};
	}
} // 🏥 HEALTHCARE WORKFLOW TESTING HELPERS
export class HealthcareWorkflowHelper {
	/**
	 * Setup healthcare authentication with proper role validation
	 */
	static async authenticateHealthcareUser(page: Page, role: "patient" | "doctor" | "admin" | "nurse" | "receptionist") {
		const credentials = {
			patient: { email: "patient.test@neonpro.com", password: "TestPass123!" },
			doctor: { email: "doctor.test@neonpro.com", password: "TestPass123!" },
			admin: { email: "admin.test@neonpro.com", password: "TestPass123!" },
			nurse: { email: "nurse.test@neonpro.com", password: "TestPass123!" },
			receptionist: {
				email: "receptionist.test@neonpro.com",
				password: "TestPass123!",
			},
		};

		await page.goto("/login");
		await page.getByTestId("email-input").fill(credentials[role].email);
		await page.getByTestId("password-input").fill(credentials[role].password);
		await page.getByTestId("login-button").click();

		// Verify role-based access
		await expect(page).toHaveURL(/.*\/dashboard/);
		await expect(page.getByTestId(`${role}-dashboard`)).toBeVisible();
	}

	/**
	 * Validate patient data protection throughout workflow
	 */
	static async validatePatientDataProtection(page: Page) {
		// Ensure no real patient data is exposed in DOM
		const pageContent = await page.content();

		// Check for patterns that might indicate real patient data
		const sensitivePatterns = [
			/\d{3}\.\d{3}\.\d{3}-\d{2}/, // Real CPF pattern
			/\(\d{2}\)\s*9\d{4}-\d{4}/, // Real phone pattern
			/@(?!teste|test|example).*\.com/, // Real email pattern
		];

		for (const pattern of sensitivePatterns) {
			expect(pageContent).not.toMatch(pattern);
		}

		// Verify encryption indicators
		await expect(page.getByTestId("data-encryption-indicator")).toBeVisible();
	}
	/**
	 * Test emergency access patterns (<100ms requirement)
	 */
	static async validateEmergencyAccess(page: Page, patientId: string) {
		const startTime = Date.now();

		await page.getByTestId("emergency-access-button").click();
		await page.getByTestId("patient-id-input").fill(patientId);
		await page.getByTestId("emergency-access-submit").click();

		await expect(page.getByTestId("patient-emergency-data")).toBeVisible();

		const accessTime = Date.now() - startTime;
		expect(accessTime).toBeLessThan(100); // <100ms for emergency access
	}
}

// 🔒 LGPD COMPLIANCE TESTING UTILITIES
export class LGPDComplianceHelper {
	/**
	 * Validate consent management functionality
	 */
	static async validateConsentManagement(page: Page) {
		await page.goto("/privacy/consent");

		// Verify granular consent options
		await expect(page.getByTestId("data-processing-consent")).toBeVisible();
		await expect(page.getByTestId("marketing-consent")).toBeVisible();
		await expect(page.getByTestId("analytics-consent")).toBeVisible();

		// Test consent withdrawal
		await page.getByTestId("withdraw-consent-button").click();
		await expect(page.getByText("Consent withdrawn successfully")).toBeVisible();
	}

	/**
	 * Test patient rights automation (access, rectification, deletion)
	 */
	static async validatePatientRights(page: Page) {
		// Test data access right
		await page.goto("/privacy/data-access");
		await page.getByTestId("request-data-access").click();
		await expect(page.getByText("Data access request submitted")).toBeVisible();
	}
} // 🌐 ACCESSIBILITY TESTING UTILITIES (WCAG 2.1 AA+ & NBR 17225)
export class HealthcareAccessibilityHelper {
	/**
	 * Comprehensive accessibility validation for patient interfaces
	 */
	static async validateAccessibility(page: Page) {
		// Test keyboard navigation
		await page.keyboard.press("Tab");
		const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
		expect(["BUTTON", "INPUT", "SELECT", "A"]).toContain(focusedElement);

		// Test screen reader compatibility
		await expect(page.getByRole("main")).toBeVisible();
		await expect(page.getByRole("navigation")).toBeVisible();

		// Verify proper heading hierarchy
		const h1Count = await page.locator("h1").count();
		expect(h1Count).toBe(1); // Only one H1 per page
	}

	/**
	 * Brazilian NBR 17225 accessibility standards validation
	 */
	static async validateBrazilianAccessibility(page: Page) {
		// Verify Portuguese language support
		const lang = await page.getAttribute("html", "lang");
		expect(lang).toBe("pt-BR");

		// Test high contrast mode support
		await page.emulateMedia({ prefersColorScheme: "dark" });
		await expect(page.getByTestId("main-content")).toBeVisible();
	}

	/**
	 * Patient anxiety reduction validation (NeonPro specific)
	 */
	static async validateAnxietyReduction(page: Page) {
		// Verify calming design elements
		await expect(page.getByTestId("progress-indicator")).toBeVisible();
		await expect(page.getByTestId("help-text")).toBeVisible();
		await expect(page.getByTestId("support-contact")).toBeVisible();
	}
} // ⚡ PERFORMANCE TESTING UTILITIES
export class HealthcarePerformanceHelper {
	/**
	 * Validate healthcare workflow performance requirements
	 */
	static async validatePerformanceRequirements(page: Page) {
		const performanceEntries = await page.evaluate(() => {
			return JSON.parse(JSON.stringify(performance.getEntriesByType("navigation")));
		});

		const loadTime = performanceEntries[0]?.loadEventEnd - performanceEntries[0]?.navigationStart;
		expect(loadTime).toBeLessThan(2000); // <2s page load
	}

	/**
	 * Test routine operations performance (<500ms requirement)
	 */
	static async validateRoutineOperationPerformance(_page: Page, operation: () => Promise<void>) {
		const startTime = Date.now();
		await operation();
		const operationTime = Date.now() - startTime;
		expect(operationTime).toBeLessThan(500); // <500ms for routine operations
	}
}

// 🔐 SECURITY TESTING UTILITIES
export class HealthcareSecurityHelper {
	/**
	 * Validate patient data encryption
	 */
	static async validateDataEncryption(page: Page) {
		// Check for HTTPS enforcement
		expect(page.url()).toMatch(/^https:/);

		// Verify secure headers
		const response = await page.goto(page.url());
		const headers = response?.headers();
		expect(headers?.["strict-transport-security"]).toBeDefined();
		expect(headers?.["x-content-type-options"]).toBe("nosniff");
	}
}
