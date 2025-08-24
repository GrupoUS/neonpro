import { expect, test } from "@playwright/test";

test.describe("Authentication Flow", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the login page
		await page.goto("/login");
	});

	test("should display login page correctly", async ({ page }) => {
		// Check if login page elements are present
		await expect(page.locator("h1")).toContainText("Login");
		await expect(page.locator('input[type="email"]')).toBeVisible();
		await expect(page.locator('input[type="password"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();

		// Check Google login button
		await expect(page.locator("text=Entrar com Google")).toBeVisible();
	});

	test("should show validation errors for invalid inputs", async ({ page }) => {
		// Try to submit empty form
		await page.click('button[type="submit"]');

		// Check for validation errors
		await expect(page.locator("text=Email is required")).toBeVisible();
		await expect(page.locator("text=Password is required")).toBeVisible();

		// Test invalid email format
		await page.fill('input[type="email"]', "invalid-email");
		await page.click('button[type="submit"]');
		await expect(page.locator("text=Invalid email format")).toBeVisible();
	});

	test("should handle login with invalid credentials", async ({ page }) => {
		// Fill form with invalid credentials
		await page.fill('input[type="email"]', "test@example.com");
		await page.fill('input[type="password"]', "wrongpassword");
		await page.click('button[type="submit"]');

		// Should show error message
		await expect(page.locator("text=Invalid credentials")).toBeVisible();

		// Should remain on login page
		await expect(page.url()).toContain("/login");
	});

	test("should redirect to dashboard after successful login", async ({ page }) => {
		// Mock successful login (in real test, you'd use test credentials)
		// For demo purposes, we'll simulate the successful flow

		await page.fill('input[type="email"]', "demo@neonpro.com");
		await page.fill('input[type="password"]', "demopassword");

		// Click login button
		await page.click('button[type="submit"]');

		// Should redirect to dashboard (adjust URL based on your routing)
		await expect(page).toHaveURL(/\/dashboard/);

		// Should see dashboard elements
		await expect(page.locator("text=Dashboard")).toBeVisible();
	});

	test("should navigate to signup page", async ({ page }) => {
		// Click signup link
		await page.click("text=Create account");

		// Should navigate to signup page
		await expect(page).toHaveURL(/\/signup/);
		await expect(page.locator("h1")).toContainText("Sign Up");
	});
});

test.describe("Google OAuth Flow", () => {
	test("should open Google OAuth popup", async ({ page, context }) => {
		await page.goto("/login");

		// Mock popup behavior (real test would handle actual OAuth)
		const [popup] = await Promise.all([context.waitForEvent("page"), page.click("text=Entrar com Google")]);

		// Verify popup opened with correct URL
		expect(popup.url()).toContain("accounts.google.com");

		await popup.close();
	});
});

test.describe("Sign Up Flow", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/signup");
	});

	test("should display signup form correctly", async ({ page }) => {
		await expect(page.locator("h1")).toContainText("Sign Up");
		await expect(page.locator('input[name="name"]')).toBeVisible();
		await expect(page.locator('input[type="email"]')).toBeVisible();
		await expect(page.locator('input[type="password"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();
	});

	test("should validate password requirements", async ({ page }) => {
		await page.fill('input[name="name"]', "Test User");
		await page.fill('input[type="email"]', "test@example.com");
		await page.fill('input[type="password"]', "123"); // Weak password
		await page.click('button[type="submit"]');

		// Should show password validation error
		await expect(page.locator("text=Password must be at least 8 characters")).toBeVisible();
	});

	test("should handle successful signup", async ({ page }) => {
		await page.fill('input[name="name"]', "Test User");
		await page.fill('input[type="email"]', "newuser@example.com");
		await page.fill('input[type="password"]', "securepassword123");

		await page.click('button[type="submit"]');

		// Should show success message or redirect
		await expect(page.locator("text=Account created successfully")).toBeVisible();
	});
});

test.describe("Authentication State Persistence", () => {
	test("should maintain login state across page refreshes", async ({ page }) => {
		// Login first
		await page.goto("/login");
		await page.fill('input[type="email"]', "demo@neonpro.com");
		await page.fill('input[type="password"]', "demopassword");
		await page.click('button[type="submit"]');

		await expect(page).toHaveURL(/\/dashboard/);

		// Refresh page
		await page.reload();

		// Should still be logged in
		await expect(page).toHaveURL(/\/dashboard/);
		await expect(page.locator("text=Dashboard")).toBeVisible();
	});

	test("should redirect to login when accessing protected route", async ({ page }) => {
		// Try to access dashboard without being logged in
		await page.goto("/dashboard");

		// Should redirect to login
		await expect(page).toHaveURL(/\/login/);
	});
});

test.describe("Logout Flow", () => {
	test.beforeEach(async ({ page }) => {
		// Login first
		await page.goto("/login");
		await page.fill('input[type="email"]', "demo@neonpro.com");
		await page.fill('input[type="password"]', "demopassword");
		await page.click('button[type="submit"]');
		await expect(page).toHaveURL(/\/dashboard/);
	});

	test("should logout successfully", async ({ page }) => {
		// Click logout button (adjust selector based on your UI)
		await page.click('[data-testid="logout-button"]');

		// Should redirect to login page
		await expect(page).toHaveURL(/\/login/);

		// Try to access dashboard again
		await page.goto("/dashboard");

		// Should redirect back to login
		await expect(page).toHaveURL(/\/login/);
	});
});

test.describe("Error Boundaries", () => {
	test("should display error boundary when authentication fails critically", async ({ page }) => {
		// Simulate a critical auth error (you might need to mock this)
		await page.goto("/login");

		// Inject script to simulate error
		await page.evaluate(() => {
			// Simulate critical error in auth context
			window.dispatchEvent(new Event("auth-critical-error"));
		});

		// Should show error boundary
		await expect(page.locator("text=Oops! Algo deu errado")).toBeVisible();
		await expect(page.locator('button:has-text("Tentar novamente")')).toBeVisible();
	});

	test("should recover from error boundary", async ({ page }) => {
		await page.goto("/login");

		// Trigger error
		await page.evaluate(() => {
			window.dispatchEvent(new Event("auth-critical-error"));
		});

		await expect(page.locator("text=Oops! Algo deu errado")).toBeVisible();

		// Click retry button
		await page.click('button:has-text("Tentar novamente")');

		// Should recover and show login form again
		await expect(page.locator('input[type="email"]')).toBeVisible();
	});
});

test.describe("Accessibility", () => {
	test("should be keyboard navigable", async ({ page }) => {
		await page.goto("/login");

		// Tab through form elements
		await page.keyboard.press("Tab");
		await expect(page.locator('input[type="email"]')).toBeFocused();

		await page.keyboard.press("Tab");
		await expect(page.locator('input[type="password"]')).toBeFocused();

		await page.keyboard.press("Tab");
		await expect(page.locator('button[type="submit"]')).toBeFocused();
	});

	test("should have proper ARIA labels", async ({ page }) => {
		await page.goto("/login");

		// Check for proper ARIA labels
		await expect(page.locator('input[type="email"]')).toHaveAttribute("aria-label", /email/i);
		await expect(page.locator('input[type="password"]')).toHaveAttribute("aria-label", /password/i);
		await expect(page.locator('button[type="submit"]')).toHaveAttribute("aria-label", /login|sign in/i);
	});
});

test.describe("Performance", () => {
	test("should load login page within performance budget", async ({ page }) => {
		const startTime = Date.now();

		await page.goto("/login");
		await page.waitForLoadState("networkidle");

		const loadTime = Date.now() - startTime;

		// Should load within 3 seconds (adjust based on your requirements)
		expect(loadTime).toBeLessThan(3000);
	});

	test("should have good Core Web Vitals", async ({ page }) => {
		await page.goto("/login");

		// Measure Largest Contentful Paint (LCP)
		const lcp = await page.evaluate(() => {
			return new Promise((resolve) => {
				new PerformanceObserver((list) => {
					const entries = list.getEntries();
					const lastEntry = entries.at(-1);
					resolve(lastEntry.startTime);
				}).observe({ entryTypes: ["largest-contentful-paint"] });
			});
		});

		// LCP should be under 2.5 seconds
		expect(lcp).toBeLessThan(2500);
	});
});
