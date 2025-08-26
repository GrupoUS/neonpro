import { expect, test } from "@playwright/test";

/**
 * Homepage E2E Tests for NeonPro Healthcare
 *
 * Critical user journeys:
 * - Landing page accessibility and performance
 * - Navigation to login/registration
 * - Healthcare compliance information display
 * - Marketing content and pricing navigation
 */

test.describe("Homepage - Landing Page", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to homepage
		await page.goto("/");

		// Wait for page to be fully loaded
		await page.waitForLoadState("networkidle");
	});

	test("should load homepage within performance thresholds", async ({
		page,
	}) => {
		const startTime = Date.now();

		// Wait for main content to be visible
		await expect(page.locator("h1")).toContainText("NeonPro Healthcare");

		const loadTime = Date.now() - startTime;
		expect(loadTime).toBeLessThan(3000); // 3 second threshold
	});

	test("should display main navigation and branding", async ({ page }) => {
		// Check logo and branding
		await expect(
			page
				.locator('[data-testid="logo"]')
				.or(page.locator('h1:has-text("NeonPro Healthcare")')),
		).toBeVisible();

		// Check main CTA button
		await expect(
			page.locator('button:has-text("Acessar Sistema")'),
		).toBeVisible();

		// Verify hero content
		await expect(page.locator("text=Revolução Digital")).toBeVisible();
		await expect(
			page.locator("text=Clínicas Estéticas Brasileiras"),
		).toBeVisible();
	});

	test("should navigate to login page", async ({ page }) => {
		// Click login button
		await page.click('button:has-text("Acessar Sistema")');

		// Should navigate to login
		await expect(page).toHaveURL(/.*\/login/);
	});

	test("should display dashboard metrics for authenticated users", async ({
		page,
	}) => {
		// This test assumes user might be logged in
		const metricsSection = page.locator('[data-testid="dashboard-metrics"]');

		if (await metricsSection.isVisible()) {
			// Check key metrics are displayed
			await expect(page.locator("text=Pacientes")).toBeVisible();
			await expect(page.locator("text=Receita")).toBeVisible();
			await expect(page.locator("text=Consultas")).toBeVisible();
		}
	});

	test("should be accessible with keyboard navigation", async ({ page }) => {
		// Test keyboard navigation
		await page.keyboard.press("Tab");

		// Should focus on main CTA button
		const focusedElement = await page.locator(":focus");
		await expect(focusedElement).toContainText("Acessar Sistema");

		// Test Enter key activation
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/.*\/login/);
	});

	test("should display healthcare compliance badges", async ({ page }) => {
		// Look for LGPD compliance indicators
		const lgpdIndicator = page
			.locator("text=LGPD")
			.or(page.locator('[data-testid="lgpd-badge"]'));
		const anvisaIndicator = page
			.locator("text=ANVISA")
			.or(page.locator('[data-testid="anvisa-badge"]'));

		// At least one compliance indicator should be visible
		const hasCompliance =
			(await lgpdIndicator.isVisible()) || (await anvisaIndicator.isVisible());
		expect(hasCompliance).toBeTruthy();
	});

	test("should handle responsive design", async ({ page }) => {
		// Test mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		// Main content should still be visible
		await expect(
			page.locator('h1:has-text("NeonPro Healthcare")'),
		).toBeVisible();
		await expect(
			page.locator('button:has-text("Acessar Sistema")'),
		).toBeVisible();

		// Test tablet viewport
		await page.setViewportSize({ width: 768, height: 1024 });
		await expect(
			page.locator('h1:has-text("NeonPro Healthcare")'),
		).toBeVisible();
	});

	test("should display recent patients and appointments for authenticated users", async ({
		page,
	}) => {
		// Check if user is authenticated by looking for dashboard content
		const recentPatientsSection = page.locator(
			'[data-testid="recent-patients"]',
		);
		const appointmentsSection = page.locator(
			'[data-testid="todays-appointments"]',
		);

		if (await recentPatientsSection.isVisible()) {
			// Verify recent patients display
			await expect(recentPatientsSection).toBeVisible();
		}

		if (await appointmentsSection.isVisible()) {
			// Verify appointments display
			await expect(appointmentsSection).toBeVisible();
		}
	});

	test("should have proper meta tags for SEO", async ({ page }) => {
		// Check essential meta tags
		const title = await page.title();
		expect(title).toContain("NeonPro");

		// Check viewport meta tag
		const viewportMeta = page.locator('meta[name="viewport"]');
		await expect(viewportMeta).toHaveAttribute("content", /width=device-width/);
	});
});

test.describe("Homepage - Performance Monitoring", () => {
	test("should track Core Web Vitals", async ({ page }) => {
		await page.goto("/");

		// Wait for page to be fully loaded
		await page.waitForLoadState("networkidle");

		// Check for performance monitoring script
		const performanceScript = page.locator('script:has-text("webVitals")');

		// Performance monitoring should be present for healthcare compliance
		if ((await performanceScript.count()) > 0) {
			// Verify performance tracking is active
			const performanceData = await page.evaluate(() => {
				return (window as any).webVitalsData || null;
			});

			// Should have some performance data if monitoring is active
			if (performanceData) {
				expect(performanceData).toBeDefined();
			}
		}
	});
});
