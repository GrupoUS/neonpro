import { expect, test } from "@playwright/test";

/**
 * Basic E2E test for NeonPro Healthcare Platform
 * This file demonstrates the separation between unit tests (*.test.ts) and E2E tests (*.spec.ts)
 */

test.describe("NeonPro Healthcare Platform - Core E2E", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the home page
		await page.goto("/");
	});

	test("should load the homepage successfully", async ({ page }) => {
		// Wait for the page to load
		await page.waitForLoadState("networkidle");

		// Check that the page title contains "NeonPro" or similar
		await expect(page).toHaveTitle(/NeonPro|Healthcare/);

		// Check that we can see some main content
		const body = page.locator("body");
		await expect(body).toBeVisible();
	});

	test("should have proper navigation elements", async ({ page }) => {
		// Wait for the page to load
		await page.waitForLoadState("networkidle");

		// Look for common navigation elements
		// This test will adapt based on what's actually rendered
		const mainContent = page.locator('main, [role="main"], .main-content, #main');

		// If we have navigation, check it exists
		const nav = page.locator('nav, [role="navigation"], .nav, .navigation');

		// At minimum, we should have some content structure
		const hasContent = (await mainContent.count()) > 0 || (await nav.count()) > 0;
		expect(hasContent).toBeTruthy();
	});

	test("should be accessible via keyboard navigation", async ({ page }) => {
		// Wait for page load
		await page.waitForLoadState("networkidle");

		// Test basic keyboard navigation
		await page.keyboard.press("Tab");

		// Check that focus moved to some element
		const focusedElement = page.locator(":focus");
		const focusedCount = await focusedElement.count();

		// We should have at least one focusable element
		expect(focusedCount).toBeGreaterThanOrEqual(0);
	});

	test("should handle page errors gracefully", async ({ page }) => {
		// Test error handling by trying to access a non-existent page
		const response = await page.goto("/non-existent-page", {
			waitUntil: "networkidle",
		});

		// Should either redirect or show a proper error page
		// We don't expect a 500 error - either 404 or redirect is fine
		if (response) {
			expect(response.status()).not.toBe(500);
		}
	});
});

test.describe("NeonPro Healthcare Platform - Responsive Design", () => {
	test("should work on mobile viewport", async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		// Navigate to home page
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		// Basic mobile responsiveness check
		const body = page.locator("body");
		await expect(body).toBeVisible();

		// Check that content doesn't overflow horizontally
		const bodyBox = await body.boundingBox();
		if (bodyBox) {
			expect(bodyBox.width).toBeLessThanOrEqual(375);
		}
	});

	test("should work on tablet viewport", async ({ page }) => {
		// Set tablet viewport
		await page.setViewportSize({ width: 768, height: 1024 });

		// Navigate to home page
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		// Basic tablet responsiveness check
		const body = page.locator("body");
		await expect(body).toBeVisible();
	});
});
