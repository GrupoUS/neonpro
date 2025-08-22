/**
 * Security Testing Suite for Healthcare Platform
 * NeonPro Security Validation
 *
 * Tests for:
 * - Authentication security
 * - Authorization enforcement
 * - LGPD compliance protection
 * - API security headers
 * - Input validation
 * - SQL injection prevention
 */

import { expect, test } from "@playwright/test";

test.describe("🔒 Security & Compliance Testing", () => {
	test("🛡️ Authentication Security Tests", async ({ page }) => {
		test.setTimeout(30_000);

		await test.step("Verify redirect to login for protected routes", async () => {
			// Try to access protected route without authentication
			await page.goto("/dashboard");

			// Should redirect to login
			await expect(page).toHaveURL(/.*\/login/);

			// Should show login form
			await expect(page.locator("form")).toBeVisible();
			await expect(page.locator('[name="email"]')).toBeVisible();
			await expect(page.locator('[name="password"]')).toBeVisible();
		});

		await test.step("Test invalid login attempts", async () => {
			await page.goto("/login");

			// Test with invalid credentials
			await page.fill('[name="email"]', "invalid@test.com");
			await page.fill('[name="password"]', "wrongpassword");
			await page.click('button[type="submit"]');

			// Should show error message
			await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
			await expect(page.locator('[data-testid="error-message"]')).toContainText(/(?:inválido|incorreto|erro)/i);
		});

		await test.step("Test rate limiting on login attempts", async () => {
			await page.goto("/login");

			// Make multiple failed login attempts
			for (let i = 0; i < 5; i++) {
				await page.fill('[name="email"]', "test@test.com");
				await page.fill('[name="password"]', "wrong" + i);
				await page.click('button[type="submit"]');
				await page.waitForTimeout(1000);
			}

			// Should trigger rate limiting
			await expect(page.locator('[data-testid="rate-limit-message"]')).toBeVisible({ timeout: 10_000 });
		});
	});

	test("🔐 Authorization Enforcement Tests", async ({ page }) => {
		test.setTimeout(25_000);

		await test.step("Test API endpoint authorization", async () => {
			// Test unauthorized API access
			const response = await page.request.get("/api/v1/patients");
			expect(response.status()).toBe(401);

			const responseBody = await response.json();
			expect(responseBody.error).toContain("Unauthorized");
		});

		await test.step("Test role-based access control", async () => {
			// Login as regular user
			await page.goto("/login");
			await page.fill('[name="email"]', "user@neonpro.com");
			await page.fill('[name="password"]', "UserPassword123!");
			await page.click('button[type="submit"]');

			// Try to access admin-only route
			await page.goto("/admin/settings");

			// Should be denied or redirected
			await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
		});
	});

	test("📋 LGPD Compliance Tests", async ({ page }) => {
		test.setTimeout(20_000);

		await test.step("Verify consent collection", async () => {
			await page.goto("/patients/new");

			// LGPD consent should be required
			await expect(page.locator('[name="lgpdConsent.dataProcessing"]')).toBeVisible();
			await expect(page.locator('[name="lgpdConsent.marketing"]')).toBeVisible();

			// Should not be able to submit without consent
			await page.fill('[name="name"]', "Test Patient");
			await page.fill('[name="email"]', "test@patient.com");
			await page.click('button[type="submit"]');

			// Should show validation error
			await expect(page.locator('[data-testid="consent-required-error"]')).toBeVisible();
		});

		await test.step("Test data subject rights access", async () => {
			await page.goto("/meus-dados");

			// Should show data access portal
			await expect(page.locator('[data-testid="data-portal"]')).toBeVisible();

			// Should have options for data export, correction, deletion
			await expect(page.locator('[data-testid="export-data-button"]')).toBeVisible();
			await expect(page.locator('[data-testid="correct-data-button"]')).toBeVisible();
			await expect(page.locator('[data-testid="delete-account-button"]')).toBeVisible();
		});
	});

	test("🌐 Security Headers Tests", async ({ page }) => {
		test.setTimeout(15_000);

		await test.step("Verify security headers presence", async () => {
			const response = await page.request.get("/");

			// Check for critical security headers
			expect(response.headers()["x-frame-options"]).toBeTruthy();
			expect(response.headers()["x-content-type-options"]).toBe("nosniff");
			expect(response.headers()["x-xss-protection"]).toBeTruthy();
			expect(response.headers()["strict-transport-security"]).toBeTruthy();

			// Check Content Security Policy
			expect(response.headers()["content-security-policy"]).toBeTruthy();
		});

		await test.step("Test CORS configuration", async () => {
			// Test preflight request
			const response = await page.request.fetch("/api/v1/health", {
				method: "OPTIONS",
				headers: {
					Origin: "https://malicious.com",
					"Access-Control-Request-Method": "GET",
				},
			});

			// Should not allow arbitrary origins
			const corsHeader = response.headers()["access-control-allow-origin"];
			expect(corsHeader).not.toBe("*");
			expect(corsHeader).not.toBe("https://malicious.com");
		});
	});

	test("💉 Input Validation & Injection Tests", async ({ page }) => {
		test.setTimeout(20_000);

		await test.step("Test SQL injection prevention", async () => {
			await page.goto("/login");

			// Try SQL injection in login form
			await page.fill('[name="email"]', "admin'; DROP TABLE users; --");
			await page.fill('[name="password"]', "password");
			await page.click('button[type="submit"]');

			// Should handle safely without SQL injection
			await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
			await expect(page.locator('[data-testid="error-message"]')).not.toContainText("syntax error");
		});

		await test.step("Test XSS prevention", async () => {
			await page.goto("/patients/new");

			// Try XSS in patient name field
			const xssPayload = '<script>alert("XSS")</script>';
			await page.fill('[name="name"]', xssPayload);

			// Should be properly escaped
			const nameValue = await page.locator('[name="name"]').inputValue();
			expect(nameValue).toBe(xssPayload); // Should contain the raw text, not execute

			// Check if any alert dialogs appear (they shouldn't)
			const dialogs: string[] = [];
			page.on("dialog", (dialog) => {
				dialogs.push(dialog.message());
				dialog.dismiss();
			});

			await page.click('button[type="submit"]');
			await page.waitForTimeout(2000);

			expect(dialogs).toHaveLength(0); // No XSS alerts should trigger
		});

		await test.step("Test file upload security", async () => {
			// Navigate to a page with file upload
			await page.goto("/patients/new");

			const fileInput = page.locator('[data-testid="photo-upload"]');
			if (await fileInput.isVisible()) {
				// Try to upload a potentially malicious file
				await fileInput.setInputFiles({
					name: "malicious.php",
					mimeType: "application/x-php",
					buffer: Buffer.from('<?php echo "This should not execute"; ?>'),
				});

				// Should reject or sanitize the file
				await expect(page.locator('[data-testid="file-upload-error"]')).toBeVisible();
			}
		});
	});

	test("🏥 Healthcare-Specific Security Tests", async ({ page }) => {
		test.setTimeout(25_000);

		await test.step("Test patient data access controls", async () => {
			// Login as healthcare professional
			await page.goto("/login");
			await page.fill('[name="email"]', "doctor@neonpro.com");
			await page.fill('[name="password"]', "SecurePassword123!");
			await page.click('button[type="submit"]');

			// Should only see patients assigned to this professional
			await page.goto("/patients");
			await expect(page.locator('[data-testid="patients-table"]')).toBeVisible();

			// Try to access specific patient directly via URL manipulation
			await page.goto("/patients/999999/edit"); // Non-existent or unauthorized patient

			// Should be denied or show appropriate error
			await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
		});

		await test.step("Test audit logging for sensitive operations", async () => {
			await page.goto("/patients");

			// Access patient record (should be logged)
			await page.click('[data-testid="view-patient"]:first-child');

			// Edit patient information (should be logged)
			await page.click('[data-testid="edit-patient-button"]');
			await page.fill('[name="notes"]', "Updated medical notes");
			await page.click('button[type="submit"]');

			// These operations should generate audit logs
			// Note: Actual audit log verification would require backend API testing
		});

		await test.step("Test session management security", async () => {
			// Login and get session
			await page.goto("/login");
			await page.fill('[name="email"]', "doctor@neonpro.com");
			await page.fill('[name="password"]', "SecurePassword123!");
			await page.click('button[type="submit"]');

			// Should be logged in
			await expect(page).toHaveURL(/.*\/dashboard/);

			// Test session timeout (simulate)
			await page.goto("/logout");
			await expect(page).toHaveURL(/.*\/login/);

			// Try to access protected route after logout
			await page.goto("/patients");
			await expect(page).toHaveURL(/.*\/login/);
		});
	});

	test("🔍 API Security Testing", async ({ page }) => {
		test.setTimeout(20_000);

		await test.step("Test API rate limiting", async () => {
			// Make rapid requests to API endpoint
			const requests = [];
			for (let i = 0; i < 10; i++) {
				requests.push(page.request.get("/api/v1/health"));
			}

			const responses = await Promise.all(requests);

			// Should have some rate limiting responses
			const rateLimitedResponses = responses.filter((r) => r.status() === 429);
			expect(rateLimitedResponses.length).toBeGreaterThan(0);
		});

		await test.step("Test API input validation", async () => {
			// Test with malformed JSON
			const response = await page.request.post("/api/v1/patients", {
				data: '{"name": "Test", "email": "invalid-email"', // Malformed JSON
				headers: {
					"Content-Type": "application/json",
				},
			});

			expect(response.status()).toBe(400);
		});

		await test.step("Test API authentication requirement", async () => {
			// Test all protected endpoints require authentication
			const protectedEndpoints = ["/api/v1/patients", "/api/v1/appointments", "/api/v1/clinics"];

			for (const endpoint of protectedEndpoints) {
				const response = await page.request.get(endpoint);
				expect(response.status()).toBe(401);
			}
		});
	});
});
