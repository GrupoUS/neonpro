import { expect, test } from "@playwright/test";

test.describe("Regulatory Documents Dashboard Integration", () => {
	test.beforeEach(async ({ page }) => {
		// Setup authentication session
		await page.goto("/login");
		await page.getByTestId("email-input").fill("admin@neonpro.com");
		await page.getByTestId("password-input").fill("password123");
		await page.getByTestId("login-button").click();
		await expect(page).toHaveURL(/.*\/dashboard/);
	});

	test("should navigate to regulatory documents from dashboard", async ({
		page,
	}) => {
		// Test dashboard navigation
		await page.getByTestId("nav-regulatory-documents").click();
		await expect(page).toHaveURL(/.*\/dashboard\/regulatory-documents/);

		// Verify breadcrumb navigation
		await expect(page.getByTestId("breadcrumb")).toContainText(
			"Regulatory Documents",
		);

		// Verify page loads with proper components
		await expect(page.getByTestId("regulatory-documents-list")).toBeVisible();
		await expect(page.getByTestId("add-document-button")).toBeVisible();
	});

	test("should complete full document management flow", async ({ page }) => {
		await page.goto("/dashboard/regulatory-documents");

		// Add new document
		await page.getByTestId("add-document-button").click();
		await page
			.getByTestId("document-title-input")
			.fill("ANVISA Compliance Document");
		await page.getByTestId("document-category-select").selectOption("ANVISA");
		await page.getByTestId("document-type-select").selectOption("regulamento");

		// Test file upload
		await page
			.getByTestId("file-upload-input")
			.setInputFiles("playwright/fixtures/test-document.pdf");
		await expect(page.getByTestId("upload-progress")).toBeVisible();

		// Set expiration date
		await page.getByTestId("expiration-date-input").fill("2025-12-31");

		// Submit form
		await page.getByTestId("submit-document-button").click();

		// Verify success
		await expect(page.getByTestId("success-message")).toContainText(
			"Document created successfully",
		);
		await expect(page.getByTestId("regulatory-documents-list")).toContainText(
			"ANVISA Compliance Document",
		);
	});

	test("should display expiration alerts", async ({ page }) => {
		await page.goto("/dashboard/regulatory-documents");

		// Check alerts section
		await expect(page.getByTestId("expiration-alerts")).toBeVisible();

		// Verify alert functionality - check if alerts exist
		const alertItems = page.getByTestId("alert-item");
		await expect(alertItems).toHaveCount(0); // Adjust based on expected alerts
	});

	test("should handle errors gracefully", async ({ page }) => {
		await page.goto("/dashboard/regulatory-documents");

		// Test error handling for invalid form submission
		await page.getByTestId("add-document-button").click();
		await page.getByTestId("submit-document-button").click();

		// Verify validation errors
		await expect(page.getByTestId("title-error")).toContainText(
			"Title is required",
		);
		await expect(page.getByTestId("category-error")).toContainText(
			"Category is required",
		);
	});
});
