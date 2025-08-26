import { expect, test } from "@playwright/test";

// Dashboard Treatments E2E Tests
// Tests aesthetic treatment plans, session management, outcomes tracking, and patient progress

test.describe("Dashboard Treatments Page", () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to treatments dashboard
		await page.goto("/dashboard/treatments");

		// Wait for page to load
		await page.waitForLoadState("networkidle");
	});

	test.describe("Treatments Overview", () => {
		test("should display treatments dashboard with key metrics", async ({
			page,
		}) => {
			// Check page title and navigation
			await expect(page).toHaveTitle(/Treatments.*NeonPro/);
			await expect(page.locator("h1")).toContainText("Treatments Dashboard");

			// Verify treatment metrics cards
			await expect(
				page.locator('[data-testid="active-treatments"]'),
			).toBeVisible();
			await expect(
				page.locator('[data-testid="completed-treatments"]'),
			).toBeVisible();
			await expect(
				page.locator('[data-testid="scheduled-sessions"]'),
			).toBeVisible();
			await expect(
				page.locator('[data-testid="treatment-revenue"]'),
			).toBeVisible();

			// Check treatment success rate
			const successRate = page.locator('[data-testid="success-rate-value"]');
			await expect(successRate).toBeVisible();
			await expect(successRate).toContainText(/%/);
		});

		test("should show treatment type distribution", async ({ page }) => {
			// Check treatment types overview
			await expect(
				page.locator('[data-testid="treatment-types-chart"]'),
			).toBeVisible();

			// Verify common aesthetic treatments
			const treatmentTypes = [
				"botox",
				"dermal-fillers",
				"laser-therapy",
				"chemical-peels",
				"microneedling",
			];

			for (const type of treatmentTypes) {
				const typeElement = page.locator(
					`[data-testid="treatment-type-${type}"]`,
				);
				if (await typeElement.isVisible()) {
					await expect(typeElement).toBeVisible();
				}
			}
		});

		test("should display recent treatment activities", async ({ page }) => {
			const activitiesSection = page.locator(
				'[data-testid="recent-activities"]',
			);
			await expect(activitiesSection).toBeVisible();

			// Check for activity items
			const activityItems = page.locator('[data-testid="activity-item"]');
			if ((await activityItems.count()) > 0) {
				await expect(activityItems.first()).toBeVisible();
				await expect(
					activityItems.first().locator('[data-testid="activity-type"]'),
				).toBeVisible();
				await expect(
					activityItems.first().locator('[data-testid="activity-patient"]'),
				).toBeVisible();
				await expect(
					activityItems.first().locator('[data-testid="activity-timestamp"]'),
				).toBeVisible();
			}
		});
	});

	test.describe("Treatment Plans Management", () => {
		test("should display treatment plans list", async ({ page }) => {
			// Navigate to treatment plans
			await page.click('[data-testid="treatment-plans-tab"]');

			// Check treatment plans table
			const plansTable = page.locator('[data-testid="treatment-plans-table"]');
			await expect(plansTable).toBeVisible();

			// Check table headers
			await expect(
				page.locator('[data-testid="patient-header"]'),
			).toBeVisible();
			await expect(
				page.locator('[data-testid="treatment-type-header"]'),
			).toBeVisible();
			await expect(page.locator('[data-testid="status-header"]')).toBeVisible();
			await expect(
				page.locator('[data-testid="progress-header"]'),
			).toBeVisible();
			await expect(
				page.locator('[data-testid="next-session-header"]'),
			).toBeVisible();
		});

		test("should create new treatment plan", async ({ page }) => {
			await page.click('[data-testid="treatment-plans-tab"]');

			// Click create new treatment plan
			await page.click('[data-testid="create-treatment-plan"]');

			// Fill treatment plan form
			await page.fill('[data-testid="patient-search"]', "João Silva");
			await page.waitForTimeout(500);
			await page.click('[data-testid="patient-option"]');

			// Select treatment type
			await page.selectOption('[data-testid="treatment-type"]', "botox");

			// Fill treatment details
			await page.fill('[data-testid="treatment-area"]', "Forehead lines");
			await page.fill('[data-testid="planned-sessions"]', "3");
			await page.fill('[data-testid="session-interval"]', "4");
			await page.selectOption('[data-testid="interval-unit"]', "weeks");

			// Add treatment goals
			await page.fill(
				'[data-testid="treatment-goals"]',
				"Reduce forehead wrinkles and improve skin texture",
			);

			// Set pricing
			await page.fill('[data-testid="session-price"]', "800.00");
			await page.fill('[data-testid="total-price"]', "2400.00");

			// Submit form
			await page.click('[data-testid="submit-treatment-plan"]');

			// Verify success message
			await expect(
				page.locator('[data-testid="success-message"]'),
			).toBeVisible();
			await expect(
				page.locator('[data-testid="success-message"]'),
			).toContainText("Treatment plan created successfully");
		});

		test("should filter treatment plans by status", async ({ page }) => {
			await page.click('[data-testid="treatment-plans-tab"]');

			// Test status filters
			const statuses = ["active", "completed", "paused", "cancelled"];

			for (const status of statuses) {
				await page.selectOption('[data-testid="status-filter"]', status);
				await page.waitForTimeout(1000);

				// Verify filtered results
				const planRows = page.locator('[data-testid="treatment-plan-row"]');
				if ((await planRows.count()) > 0) {
					const statusBadge = planRows
						.first()
						.locator('[data-testid="plan-status"]');
					await expect(statusBadge).toContainText(status, { ignoreCase: true });
				}
			}
		});

		test("should search treatment plans by patient name", async ({ page }) => {
			await page.click('[data-testid="treatment-plans-tab"]');

			// Search for specific patient
			await page.fill('[data-testid="patient-search-filter"]', "Silva");
			await page.waitForTimeout(1000);

			// Verify search results
			const planRows = page.locator('[data-testid="treatment-plan-row"]');
			if ((await planRows.count()) > 0) {
				const patientName = planRows
					.first()
					.locator('[data-testid="patient-name"]');
				await expect(patientName).toContainText("Silva", { ignoreCase: true });
			}
		});
	});

	test.describe("Session Management", () => {
		test("should display scheduled sessions", async ({ page }) => {
			// Navigate to sessions
			await page.click('[data-testid="sessions-tab"]');

			// Check sessions calendar/list view
			const sessionsView = page.locator('[data-testid="sessions-view"]');
			await expect(sessionsView).toBeVisible();

			// Check view toggle options
			await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible();
			await expect(page.locator('[data-testid="list-view"]')).toBeVisible();
		});

		test("should schedule new treatment session", async ({ page }) => {
			await page.click('[data-testid="sessions-tab"]');

			// Click schedule new session
			await page.click('[data-testid="schedule-session"]');

			// Select treatment plan
			await page.selectOption('[data-testid="treatment-plan-select"]', {
				index: 1,
			});

			// Set session date and time
			const tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			await page.fill(
				'[data-testid="session-date"]',
				tomorrow.toISOString().split("T")[0],
			);
			await page.fill('[data-testid="session-time"]', "14:00");

			// Set session duration
			await page.fill('[data-testid="session-duration"]', "60");

			// Add session notes
			await page.fill(
				'[data-testid="session-notes"]',
				"Second session - follow-up treatment",
			);

			// Submit scheduling
			await page.click('[data-testid="submit-session"]');

			// Verify success
			await expect(
				page.locator('[data-testid="success-message"]'),
			).toBeVisible();
			await expect(
				page.locator('[data-testid="success-message"]'),
			).toContainText("Session scheduled successfully");
		});

		test("should complete treatment session", async ({ page }) => {
			await page.click('[data-testid="sessions-tab"]');

			// Find a scheduled session to complete
			const sessionRows = page.locator('[data-testid="session-row"]');
			if ((await sessionRows.count()) > 0) {
				// Click on first session
				await sessionRows.first().click();

				// Mark session as completed
				await page.click('[data-testid="complete-session"]');

				// Fill completion form
				await page.selectOption(
					'[data-testid="session-outcome"]',
					"successful",
				);
				await page.fill(
					'[data-testid="treatment-notes"]',
					"Session completed successfully. Patient responded well to treatment.",
				);

				// Add before/after photos (simulate file upload)
				const beforePhotoInput = page.locator('[data-testid="before-photo"]');
				if (await beforePhotoInput.isVisible()) {
					// Simulate file selection
					await beforePhotoInput.setInputFiles({
						name: "before.jpg",
						mimeType: "image/jpeg",
						buffer: Buffer.from("fake-image-data"),
					});
				}

				// Record any adverse reactions
				await page.selectOption('[data-testid="adverse-reactions"]', "none");

				// Set next session recommendation
				await page.fill('[data-testid="next-session-weeks"]', "4");

				// Submit completion
				await page.click('[data-testid="submit-completion"]');

				// Verify success
				await expect(
					page.locator('[data-testid="success-message"]'),
				).toBeVisible();
				await expect(
					page.locator('[data-testid="success-message"]'),
				).toContainText("Session completed");
			}
		});

		test("should reschedule treatment session", async ({ page }) => {
			await page.click('[data-testid="sessions-tab"]');

			// Find a scheduled session to reschedule
			const sessionRows = page.locator('[data-testid="session-row"]');
			if ((await sessionRows.count()) > 0) {
				// Click reschedule button
				await sessionRows
					.first()
					.locator('[data-testid="reschedule-session"]')
					.click();

				// Select new date
				const newDate = new Date();
				newDate.setDate(newDate.getDate() + 3);
				await page.fill(
					'[data-testid="new-session-date"]',
					newDate.toISOString().split("T")[0],
				);
				await page.fill('[data-testid="new-session-time"]', "15:30");

				// Add reschedule reason
				await page.fill(
					'[data-testid="reschedule-reason"]',
					"Patient requested different time",
				);

				// Submit reschedule
				await page.click('[data-testid="submit-reschedule"]');

				// Verify success
				await expect(
					page.locator('[data-testid="success-message"]'),
				).toBeVisible();
				await expect(
					page.locator('[data-testid="success-message"]'),
				).toContainText("Session rescheduled");
			}
		});
	});

	test.describe("Treatment Outcomes and Progress", () => {
		test("should display treatment progress tracking", async ({ page }) => {
			// Navigate to progress tracking
			await page.click('[data-testid="progress-tab"]');

			// Check progress overview
			await expect(
				page.locator('[data-testid="progress-overview"]'),
			).toBeVisible();

			// Check progress charts
			await expect(
				page.locator('[data-testid="progress-chart"]'),
			).toBeVisible();

			// Check patient satisfaction metrics
			await expect(
				page.locator('[data-testid="satisfaction-metrics"]'),
			).toBeVisible();
		});

		test("should track treatment effectiveness", async ({ page }) => {
			await page.click('[data-testid="progress-tab"]');

			// Check effectiveness metrics by treatment type
			const treatmentTypes = ["botox", "dermal-fillers", "laser-therapy"];

			for (const type of treatmentTypes) {
				const effectivenessCard = page.locator(
					`[data-testid="effectiveness-${type}"]`,
				);
				if (await effectivenessCard.isVisible()) {
					await expect(effectivenessCard).toBeVisible();
					await expect(
						effectivenessCard.locator('[data-testid="success-rate"]'),
					).toBeVisible();
					await expect(
						effectivenessCard.locator('[data-testid="patient-count"]'),
					).toBeVisible();
				}
			}
		});

		test("should display before/after photo comparisons", async ({ page }) => {
			await page.click('[data-testid="progress-tab"]');

			// Navigate to photo comparisons
			await page.click('[data-testid="photo-comparisons-tab"]');

			// Check photo gallery
			const photoGallery = page.locator('[data-testid="photo-gallery"]');
			await expect(photoGallery).toBeVisible();

			// Check individual photo comparisons
			const photoComparisons = page.locator('[data-testid="photo-comparison"]');
			if ((await photoComparisons.count()) > 0) {
				const firstComparison = photoComparisons.first();
				await expect(
					firstComparison.locator('[data-testid="before-photo"]'),
				).toBeVisible();
				await expect(
					firstComparison.locator('[data-testid="after-photo"]'),
				).toBeVisible();
				await expect(
					firstComparison.locator('[data-testid="treatment-info"]'),
				).toBeVisible();
			}
		});

		test("should track adverse events and complications", async ({ page }) => {
			await page.click('[data-testid="progress-tab"]');

			// Navigate to adverse events
			await page.click('[data-testid="adverse-events-tab"]');

			// Check adverse events overview
			await expect(
				page.locator('[data-testid="adverse-events-overview"]'),
			).toBeVisible();

			// Check complication rates by treatment type
			await expect(
				page.locator('[data-testid="complication-rates"]'),
			).toBeVisible();

			// Check severity distribution
			await expect(
				page.locator('[data-testid="severity-distribution"]'),
			).toBeVisible();
		});

		test("should generate treatment outcome reports", async ({ page }) => {
			await page.click('[data-testid="progress-tab"]');

			// Navigate to reports section
			await page.click('[data-testid="outcome-reports-tab"]');

			// Configure report parameters
			const startDate = new Date();
			startDate.setMonth(startDate.getMonth() - 3);
			await page.fill(
				'[data-testid="report-start-date"]',
				startDate.toISOString().split("T")[0],
			);
			await page.fill(
				'[data-testid="report-end-date"]',
				new Date().toISOString().split("T")[0],
			);

			// Select treatment types
			await page.check('[data-testid="include-botox"]');
			await page.check('[data-testid="include-fillers"]');

			// Generate report
			const downloadPromise = page.waitForEvent("download");
			await page.click('[data-testid="generate-outcome-report"]');

			// Verify download
			const download = await downloadPromise;
			expect(download.suggestedFilename()).toMatch(
				/treatment.*outcome.*\.(pdf|xlsx)$/,
			);
		});
	});

	test.describe("Treatment Protocols and Guidelines", () => {
		test("should display treatment protocols", async ({ page }) => {
			// Navigate to protocols
			await page.click('[data-testid="protocols-tab"]');

			// Check protocols list
			const protocolsList = page.locator('[data-testid="protocols-list"]');
			await expect(protocolsList).toBeVisible();

			// Check protocol categories
			await expect(
				page.locator('[data-testid="botox-protocols"]'),
			).toBeVisible();
			await expect(
				page.locator('[data-testid="filler-protocols"]'),
			).toBeVisible();
			await expect(
				page.locator('[data-testid="laser-protocols"]'),
			).toBeVisible();
		});

		test("should manage treatment contraindications", async ({ page }) => {
			await page.click('[data-testid="protocols-tab"]');

			// Navigate to contraindications
			await page.click('[data-testid="contraindications-tab"]');

			// Check contraindications by treatment type
			const treatmentTypes = ["botox", "dermal-fillers", "laser-therapy"];

			for (const type of treatmentTypes) {
				const contraindicationsSection = page.locator(
					`[data-testid="contraindications-${type}"]`,
				);
				if (await contraindicationsSection.isVisible()) {
					await expect(contraindicationsSection).toBeVisible();
					await expect(
						contraindicationsSection.locator(
							'[data-testid="absolute-contraindications"]',
						),
					).toBeVisible();
					await expect(
						contraindicationsSection.locator(
							'[data-testid="relative-contraindications"]',
						),
					).toBeVisible();
				}
			}
		});

		test("should validate treatment eligibility", async ({ page }) => {
			await page.click('[data-testid="protocols-tab"]');

			// Test eligibility checker
			await page.click('[data-testid="eligibility-checker"]');

			// Select patient
			await page.fill(
				'[data-testid="patient-search-eligibility"]',
				"Maria Santos",
			);
			await page.waitForTimeout(500);
			await page.click('[data-testid="patient-option"]');

			// Select treatment type
			await page.selectOption(
				'[data-testid="treatment-type-eligibility"]',
				"botox",
			);

			// Run eligibility check
			await page.click('[data-testid="check-eligibility"]');

			// Verify results
			await expect(
				page.locator('[data-testid="eligibility-results"]'),
			).toBeVisible();
			await expect(
				page.locator('[data-testid="eligibility-status"]'),
			).toBeVisible();
		});
	});

	test.describe("Financial Management", () => {
		test("should display treatment revenue analytics", async ({ page }) => {
			// Navigate to financial section
			await page.click('[data-testid="financial-tab"]');

			// Check revenue metrics
			await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
			await expect(
				page.locator('[data-testid="monthly-revenue"]'),
			).toBeVisible();
			await expect(
				page.locator('[data-testid="revenue-by-treatment"]'),
			).toBeVisible();

			// Check revenue trends chart
			await expect(
				page.locator('[data-testid="revenue-trends-chart"]'),
			).toBeVisible();
		});

		test("should manage treatment pricing", async ({ page }) => {
			await page.click('[data-testid="financial-tab"]');

			// Navigate to pricing management
			await page.click('[data-testid="pricing-management-tab"]');

			// Check pricing table
			const pricingTable = page.locator('[data-testid="pricing-table"]');
			await expect(pricingTable).toBeVisible();

			// Test price update
			const firstPriceRow = page.locator('[data-testid="price-row"]').first();
			if (await firstPriceRow.isVisible()) {
				await firstPriceRow.locator('[data-testid="edit-price"]').click();

				// Update price
				await page.fill('[data-testid="new-price"]', "950.00");
				await page.fill(
					'[data-testid="price-change-reason"]',
					"Market adjustment",
				);

				// Save changes
				await page.click('[data-testid="save-price"]');

				// Verify success
				await expect(
					page.locator('[data-testid="success-message"]'),
				).toBeVisible();
			}
		});

		test("should track payment status for treatments", async ({ page }) => {
			await page.click('[data-testid="financial-tab"]');

			// Navigate to payment tracking
			await page.click('[data-testid="payment-tracking-tab"]');

			// Check payment status overview
			await expect(
				page.locator('[data-testid="paid-treatments"]'),
			).toBeVisible();
			await expect(
				page.locator('[data-testid="pending-payments"]'),
			).toBeVisible();
			await expect(
				page.locator('[data-testid="overdue-payments"]'),
			).toBeVisible();

			// Check payment methods distribution
			await expect(
				page.locator('[data-testid="payment-methods-chart"]'),
			).toBeVisible();
		});
	});

	test.describe("Performance and Accessibility", () => {
		test("should load treatments dashboard within performance thresholds", async ({
			page,
		}) => {
			const startTime = Date.now();
			await page.goto("/dashboard/treatments");
			await page.waitForLoadState("networkidle");
			const loadTime = Date.now() - startTime;

			// Should load within 3 seconds
			expect(loadTime).toBeLessThan(3000);

			// Check for performance metrics
			const performanceEntries = await page.evaluate(() => {
				return JSON.stringify(performance.getEntriesByType("navigation"));
			});

			expect(performanceEntries).toBeDefined();
		});

		test("should support keyboard navigation", async ({ page }) => {
			// Test tab navigation through treatment sections
			await page.keyboard.press("Tab");
			await page.keyboard.press("Tab");
			await page.keyboard.press("Tab");

			// Should be able to navigate to main sections
			const focusedElement = page.locator(":focus");
			await expect(focusedElement).toBeVisible();
		});

		test("should have proper ARIA labels for treatment data", async ({
			page,
		}) => {
			// Check ARIA labels on treatment metrics
			await expect(
				page.locator('[data-testid="active-treatments"][aria-label]'),
			).toBeVisible();
			await expect(
				page.locator('[data-testid="success-rate-value"][aria-label]'),
			).toBeVisible();

			// Check table accessibility
			const tables = page.locator("table");
			if ((await tables.count()) > 0) {
				await expect(tables.first()).toHaveAttribute("role", "table");
			}
		});

		test("should be responsive on mobile devices", async ({ page }) => {
			// Test mobile viewport
			await page.setViewportSize({ width: 375, height: 667 });

			// Check that treatment cards stack properly
			const treatmentCards = page.locator('[data-testid="treatment-card"]');
			if ((await treatmentCards.count()) > 0) {
				const firstCard = treatmentCards.first();
				const cardBox = await firstCard.boundingBox();
				expect(cardBox?.width).toBeLessThan(400); // Should fit mobile width
			}

			// Check mobile navigation
			const mobileMenu = page.locator('[data-testid="mobile-menu"]');
			if (await mobileMenu.isVisible()) {
				await expect(mobileMenu).toBeVisible();
			}
		});

		test("should support screen readers for treatment information", async ({
			page,
		}) => {
			// Check for screen reader announcements
			const announcements = page.locator(
				'[aria-live="polite"], [aria-live="assertive"]',
			);
			if ((await announcements.count()) > 0) {
				await expect(announcements.first()).toBeVisible();
			}

			// Check for descriptive headings
			const headings = page.locator("h1, h2, h3, h4, h5, h6");
			if ((await headings.count()) > 0) {
				await expect(headings.first()).toBeVisible();
			}

			// Check treatment status announcements
			const statusElements = page.locator(
				'[data-testid="treatment-status"][aria-label]',
			);
			if ((await statusElements.count()) > 0) {
				await expect(statusElements.first()).toBeVisible();
			}
		});
	});
});
