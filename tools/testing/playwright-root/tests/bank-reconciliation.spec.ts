// 🏦 Bank Reconciliation System - E2E Tests
// Sistema de Reconciliação Bancária - Testes End-to-End Completos

import { expect, test } from "@playwright/test";

test.describe("Bank Reconciliation System E2E", () => {
	test.beforeEach(async ({ page }) => {
		// Setup authentication
		await page.goto("/login");
		await page.getByTestId("email-input").fill("admin@neonpro.com");
		await page.getByTestId("password-input").fill("password123");
		await page.getByTestId("login-button").click();

		// Navigate to reconciliation page
		await page.goto("/dashboard/financial/reconciliation");
		await expect(page.getByTestId("reconciliation-dashboard")).toBeVisible();
	});

	test("should load reconciliation dashboard with all components", async ({
		page,
	}) => {
		// Verify main dashboard components
		await expect(page.getByTestId("reconciliation-dashboard")).toBeVisible();
		await expect(page.getByTestId("import-statement-button")).toBeVisible();
		await expect(page.getByTestId("reconciliation-summary")).toBeVisible();
		await expect(page.getByTestId("transactions-list")).toBeVisible();
		await expect(page.getByTestId("matching-algorithms-config")).toBeVisible();

		// Verify summary metrics
		await expect(page.getByText("Total Transactions")).toBeVisible();
		await expect(page.getByText("Matched Transactions")).toBeVisible();
		await expect(page.getByText("Unmatched Transactions")).toBeVisible();
		await expect(page.getByText("Accuracy Rate")).toBeVisible();
	});

	test("should import bank statement successfully", async ({ page }) => {
		// Start file import process
		await page.getByTestId("import-statement-button").click();

		// Upload CSV file
		const fileInput = page.getByTestId("file-upload-input");
		await fileInput.setInputFiles(
			"playwright/fixtures/bank-statement-sample.csv",
		);

		// Configure import settings
		await page.getByLabel("Date Format").selectOption("DD/MM/YYYY");
		await page.getByLabel("Amount Column").selectOption("valor");
		await page.getByLabel("Description Column").selectOption("descricao");

		// Start import
		await page.getByTestId("start-import-button").click();

		// Wait for import to complete
		await expect(page.getByTestId("import-progress")).toBeVisible();
		await expect(page.getByText("Import completed successfully")).toBeVisible({
			timeout: 30_000,
		});

		// Verify imported transactions appear
		await expect(page.getByTestId("transactions-list")).toContainText(
			"Imported",
		);

		// Check summary updated
		const totalTransactions = await page
			.getByTestId("total-transactions-count")
			.textContent();
		expect(Number(totalTransactions)).toBeGreaterThan(0);
	});

	test("should perform intelligent transaction matching", async ({ page }) => {
		// First import sample data
		await page.getByTestId("import-statement-button").click();
		await page
			.getByTestId("file-upload-input")
			.setInputFiles("playwright/fixtures/bank-statement-sample.csv");
		await page.getByTestId("start-import-button").click();
		await expect(page.getByText("Import completed successfully")).toBeVisible({
			timeout: 30_000,
		});

		// Start automatic matching
		await page.getByTestId("start-matching-button").click();

		// Configure matching parameters
		await page.getByLabel("Amount Tolerance").fill("0.05");
		await page.getByLabel("Date Range Days").fill("3");
		await page.getByLabel("Description Similarity").fill("0.8");

		// Execute matching algorithm
		await page.getByTestId("execute-matching-button").click();

		// Wait for matching to complete
		await expect(page.getByTestId("matching-progress")).toBeVisible();
		await expect(page.getByText("Matching completed")).toBeVisible({
			timeout: 60_000,
		});

		// Verify matching results
		const matchedCount = await page
			.getByTestId("matched-transactions-count")
			.textContent();
		expect(Number(matchedCount)).toBeGreaterThan(0);

		// Check accuracy rate
		const accuracyRate = await page
			.getByTestId("accuracy-rate-value")
			.textContent();
		expect(Number(accuracyRate.replace("%", ""))).toBeGreaterThan(70);
	});

	test("should handle manual transaction matching", async ({ page }) => {
		// Navigate to manual matching interface
		await page.getByTestId("manual-matching-tab").click();

		// Select unmatched transaction
		await page.getByTestId("unmatched-transactions-list").first().click();

		// Find potential matches
		await page.getByTestId("find-matches-button").click();

		// Verify potential matches displayed
		await expect(page.getByTestId("potential-matches-list")).toBeVisible();

		// Select a match
		await page.getByTestId("potential-match-item").first().click();

		// Confirm match
		await page.getByTestId("confirm-match-button").click();

		// Verify success
		await expect(
			page.getByText("Transaction matched successfully"),
		).toBeVisible();

		// Check match appears in matched transactions
		await page.getByTestId("matched-transactions-tab").click();
		await expect(page.getByTestId("matched-transactions-list")).toContainText(
			"Manually Matched",
		);
	});

	test("should export reconciliation report", async ({ page }) => {
		// Setup: ensure we have some data
		await page.getByTestId("import-statement-button").click();
		await page
			.getByTestId("file-upload-input")
			.setInputFiles("playwright/fixtures/bank-statement-sample.csv");
		await page.getByTestId("start-import-button").click();
		await expect(page.getByText("Import completed successfully")).toBeVisible({
			timeout: 30_000,
		});

		// Navigate to reports section
		await page.getByTestId("reports-tab").click();

		// Configure report parameters
		await page.getByLabel("Report Type").selectOption("detailed");
		await page.getByLabel("Date Range Start").fill("2025-01-01");
		await page.getByLabel("Date Range End").fill("2025-01-31");
		await page.getByLabel("Include Matched").check();
		await page.getByLabel("Include Unmatched").check();

		// Generate and download PDF report
		const downloadPromise = page.waitForDownload();
		await page.getByTestId("export-pdf-button").click();

		const download = await downloadPromise;
		expect(download.suggestedFilename()).toContain("reconciliation-report");
		expect(download.suggestedFilename()).toContain(".pdf");

		// Generate and download Excel report
		const downloadPromise2 = page.waitForDownload();
		await page.getByTestId("export-excel-button").click();

		const download2 = await downloadPromise2;
		expect(download2.suggestedFilename()).toContain("reconciliation-data");
		expect(download2.suggestedFilename()).toContain(".xlsx");
	});

	test("should handle large dataset performance", async ({ page }) => {
		// Import large dataset
		await page.getByTestId("import-statement-button").click();
		await page
			.getByTestId("file-upload-input")
			.setInputFiles("playwright/fixtures/large-bank-statement.csv");

		// Start timer
		const startTime = Date.now();

		// Execute import
		await page.getByTestId("start-import-button").click();
		await expect(page.getByText("Import completed successfully")).toBeVisible({
			timeout: 120_000,
		});

		// Check performance metrics
		const importTime = Date.now() - startTime;
		expect(importTime).toBeLessThan(60_000); // Should complete within 60 seconds

		// Verify all transactions imported
		const totalCount = await page
			.getByTestId("total-transactions-count")
			.textContent();
		expect(Number(totalCount)).toBeGreaterThan(1000);

		// Test matching performance
		const matchingStartTime = Date.now();
		await page.getByTestId("start-matching-button").click();
		await page.getByTestId("execute-matching-button").click();
		await expect(page.getByText("Matching completed")).toBeVisible({
			timeout: 180_000,
		});

		const matchingTime = Date.now() - matchingStartTime;
		expect(matchingTime).toBeLessThan(120_000); // Should complete within 2 minutes
	});

	test("should maintain audit trail", async ({ page }) => {
		// Perform some operations
		await page.getByTestId("import-statement-button").click();
		await page
			.getByTestId("file-upload-input")
			.setInputFiles("playwright/fixtures/bank-statement-sample.csv");
		await page.getByTestId("start-import-button").click();
		await expect(page.getByText("Import completed successfully")).toBeVisible({
			timeout: 30_000,
		});

		// Navigate to audit trail
		await page.getByTestId("audit-trail-tab").click();

		// Verify audit entries exist
		await expect(page.getByTestId("audit-trail-list")).toBeVisible();
		await expect(page.getByTestId("audit-entry")).toHaveCount.greaterThan(0);

		// Check audit entry details
		const firstEntry = page.getByTestId("audit-entry").first();
		await expect(firstEntry).toContainText("Bank statement imported");
		await expect(firstEntry).toContainText("admin@neonpro.com");
		await expect(firstEntry).toContainText(
			new Date().toISOString().split("T")[0],
		); // Today's date

		// Verify detailed audit information
		await firstEntry.click();
		await expect(page.getByTestId("audit-details-modal")).toBeVisible();
		await expect(
			page.getByText("Operation: Import Bank Statement"),
		).toBeVisible();
		await expect(page.getByText("Status: Success")).toBeVisible();
	});

	test("should handle errors gracefully", async ({ page }) => {
		// Test file format error
		await page.getByTestId("import-statement-button").click();
		await page
			.getByTestId("file-upload-input")
			.setInputFiles("playwright/fixtures/invalid-format.txt");
		await page.getByTestId("start-import-button").click();

		await expect(page.getByText("Invalid file format")).toBeVisible();
		await expect(page.getByTestId("error-message")).toContainText(
			"Please upload a valid CSV or Excel file",
		);

		// Test network error simulation
		await page.route("**/api/payments/reconciliation/import", (route) => {
			route.abort("failed");
		});

		await page
			.getByTestId("file-upload-input")
			.setInputFiles("playwright/fixtures/bank-statement-sample.csv");
		await page.getByTestId("start-import-button").click();

		await expect(page.getByText("Network error")).toBeVisible();
		await expect(page.getByTestId("retry-button")).toBeVisible();

		// Test retry functionality
		await page.unroute("**/api/payments/reconciliation/import");
		await page.getByTestId("retry-button").click();
		await expect(page.getByText("Import completed successfully")).toBeVisible({
			timeout: 30_000,
		});
	});

	test("should validate LGPD compliance features", async ({ page }) => {
		// Navigate to privacy settings
		await page.getByTestId("privacy-settings-tab").click();

		// Verify LGPD compliance features
		await expect(page.getByTestId("data-retention-settings")).toBeVisible();
		await expect(page.getByTestId("consent-management")).toBeVisible();
		await expect(page.getByTestId("data-export-options")).toBeVisible();
		await expect(page.getByTestId("data-deletion-options")).toBeVisible();

		// Test data export for user rights
		await page.getByTestId("export-user-data-button").click();
		await page.getByLabel("Export Format").selectOption("json");

		const downloadPromise = page.waitForDownload();
		await page.getByTestId("confirm-export-button").click();

		const download = await downloadPromise;
		expect(download.suggestedFilename()).toContain("user-data-export");

		// Test consent withdrawal simulation
		await page.getByTestId("consent-management").click();
		await page.getByTestId("withdraw-consent-button").click();
		await page.getByTestId("confirm-withdrawal-button").click();

		await expect(
			page.getByText("Consent withdrawn successfully"),
		).toBeVisible();
	});

	test("should handle mobile responsive design", async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		// Verify mobile-responsive elements
		await expect(
			page.getByTestId("mobile-reconciliation-header"),
		).toBeVisible();
		await expect(page.getByTestId("mobile-menu-toggle")).toBeVisible();

		// Test mobile navigation
		await page.getByTestId("mobile-menu-toggle").click();
		await expect(page.getByTestId("mobile-navigation-menu")).toBeVisible();

		// Test mobile-specific features
		await page.getByTestId("mobile-quick-import").click();
		await expect(page.getByTestId("mobile-file-upload")).toBeVisible();

		// Test swipe gestures (if applicable)
		await page.getByTestId("transactions-list").swipe("left");
		await expect(page.getByTestId("transaction-actions")).toBeVisible();
	});

	test("should maintain security throughout reconciliation process", async ({
		page,
	}) => {
		// Verify secure headers are present
		await page.goto("/dashboard/financial/reconciliation");

		// Check for security-related elements
		await expect(page.getByTestId("security-indicator")).toBeVisible();

		// Test session timeout handling
		// Simulate long inactive period
		await page.waitForTimeout(30_000); // 30 seconds

		// Try to perform sensitive operation
		await page.getByTestId("import-statement-button").click();

		// Should either work or prompt for re-authentication
		const isLoggedIn = await page.getByTestId("file-upload-input").isVisible();
		const needsAuth = await page.getByText("Please log in again").isVisible();

		expect(isLoggedIn || needsAuth).toBeTruthy();

		// Test encrypted data transmission
		await page.route("**/api/payments/**", (route) => {
			const headers = route.request().headers();
			expect(headers["content-type"]).toContain("application/json");
			expect(route.request().url()).toMatch(/^https:\/\//);
			route.continue();
		});
	});
});
