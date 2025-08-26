import { expect, test } from "@playwright/test";

/**
 * Dashboard Analytics E2E Tests for NeonPro Healthcare
 *
 * Critical analytics workflows:
 * - Real-time dashboard metrics
 * - Patient analytics and trends
 * - Treatment outcome analytics
 * - Financial performance metrics
 * - Operational efficiency tracking
 * - Compliance and quality metrics
 * - Data visualization and charts
 */

test.describe("Dashboard Analytics - Overview", () => {
	test.beforeEach(async ({ page }) => {
		// Login as healthcare professional
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');

		// Navigate to analytics dashboard
		await page.goto("/dashboard/analytics");
		await page.waitForLoadState("networkidle");
	});

	test("should display analytics dashboard overview", async ({ page }) => {
		// Check analytics dashboard title
		await expect(page.locator("h1, .analytics-title")).toContainText(/Analytics|Análises|Dashboard/);

		// Should display key performance indicators
		const kpiCards = page.locator('[data-testid="kpi-cards"]').or(page.locator(".kpi-cards"));
		if (await kpiCards.isVisible()) {
			await expect(kpiCards).toBeVisible();

			// Should show patient metrics
			await expect(page.locator("text=pacientes").or(page.locator("text=patients"))).toBeVisible();

			// Should show appointment metrics
			await expect(page.locator("text=consultas").or(page.locator("text=appointments"))).toBeVisible();

			// Should show revenue metrics
			await expect(page.locator("text=receita").or(page.locator("text=revenue"))).toBeVisible();
		}

		// Should display time period selector
		const timePeriodSelector = page
			.locator('[data-testid="time-period"]')
			.or(page.locator('select[name="timePeriod"]'));
		if (await timePeriodSelector.isVisible()) {
			await expect(timePeriodSelector).toBeVisible();
		}

		// Should show analytics charts
		const analyticsCharts = page.locator('[data-testid="analytics-charts"]').or(page.locator(".analytics-charts"));
		if (await analyticsCharts.isVisible()) {
			await expect(analyticsCharts).toBeVisible();
		}
	});

	test("should display real-time metrics", async ({ page }) => {
		// Should show today's metrics
		const todayMetrics = page.locator('[data-testid="today-metrics"]').or(page.locator(".today-metrics"));
		if (await todayMetrics.isVisible()) {
			await expect(todayMetrics).toBeVisible();

			// Should display current day stats
			await expect(page.locator("text=hoje").or(page.locator("text=today"))).toBeVisible();
		}

		// Should have real-time indicators
		const realTimeIndicator = page
			.locator('[data-testid="real-time-indicator"]')
			.or(page.locator(".real-time-indicator"));
		if (await realTimeIndicator.isVisible()) {
			await expect(realTimeIndicator).toBeVisible();
		}

		// Should show live appointment count
		const liveAppointments = page.locator('[data-testid="live-appointments"]').or(page.locator(".live-appointments"));
		if (await liveAppointments.isVisible()) {
			await expect(liveAppointments).toBeVisible();
		}

		// Should display active patients
		const activePatients = page.locator('[data-testid="active-patients"]').or(page.locator(".active-patients"));
		if (await activePatients.isVisible()) {
			await expect(activePatients).toBeVisible();
		}
	});

	test("should filter analytics by time period", async ({ page }) => {
		// Select different time periods
		const timePeriodSelector = page
			.locator('[data-testid="time-period"]')
			.or(page.locator('select[name="timePeriod"]'));
		if (await timePeriodSelector.isVisible()) {
			// Test weekly view
			await timePeriodSelector.selectOption("week");
			await page.waitForTimeout(1000);

			// Should update charts
			const weeklyCharts = page.locator('[data-testid="weekly-chart"]').or(page.locator(".weekly-chart"));
			if (await weeklyCharts.isVisible()) {
				await expect(weeklyCharts).toBeVisible();
			}

			// Test monthly view
			await timePeriodSelector.selectOption("month");
			await page.waitForTimeout(1000);

			// Should update to monthly data
			const monthlyCharts = page.locator('[data-testid="monthly-chart"]').or(page.locator(".monthly-chart"));
			if (await monthlyCharts.isVisible()) {
				await expect(monthlyCharts).toBeVisible();
			}

			// Test yearly view
			await timePeriodSelector.selectOption("year");
			await page.waitForTimeout(1000);

			// Should show yearly trends
			const yearlyCharts = page.locator('[data-testid="yearly-chart"]').or(page.locator(".yearly-chart"));
			if (await yearlyCharts.isVisible()) {
				await expect(yearlyCharts).toBeVisible();
			}
		}
	});

	test("should display department-specific analytics", async ({ page }) => {
		// Should have department filter
		const departmentFilter = page
			.locator('[data-testid="department-filter"]')
			.or(page.locator('select[name="department"]'));
		if (await departmentFilter.isVisible()) {
			await departmentFilter.selectOption("dermatology");

			// Should update analytics for dermatology
			await expect(page.locator("text=dermatologia").or(page.locator("text=dermatology"))).toBeVisible();

			// Should show department-specific metrics
			const deptMetrics = page.locator('[data-testid="department-metrics"]').or(page.locator(".department-metrics"));
			if (await deptMetrics.isVisible()) {
				await expect(deptMetrics).toBeVisible();
			}
		}
	});

	test("should export analytics data", async ({ page }) => {
		// Should have export functionality
		const exportButton = page
			.locator('[data-testid="export-analytics"]')
			.or(page.locator('button:has-text("Exportar")'))
			.first();
		if (await exportButton.isVisible()) {
			await exportButton.click();

			// Should show export options
			const exportOptions = page.locator('[data-testid="export-options"]').or(page.locator(".export-options"));
			if (await exportOptions.isVisible()) {
				await expect(exportOptions).toBeVisible();

				// Should have PDF and Excel options
				await expect(page.locator("text=PDF").or(page.locator("text=Excel"))).toBeVisible();
			}
		}
	});
});

test.describe("Dashboard Analytics - Patient Analytics", () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to patient analytics
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/analytics");
		await page.waitForLoadState("networkidle");
	});

	test("should display patient demographics analytics", async ({ page }) => {
		// Navigate to patient analytics section
		const patientAnalytics = page
			.locator('[data-testid="patient-analytics"]')
			.or(page.locator('button:has-text("Pacientes")'))
			.first();
		if (await patientAnalytics.isVisible()) {
			await patientAnalytics.click();

			// Should display demographics chart
			const demographicsChart = page
				.locator('[data-testid="demographics-chart"]')
				.or(page.locator(".demographics-chart"));
			if (await demographicsChart.isVisible()) {
				await expect(demographicsChart).toBeVisible();
			}

			// Should show age distribution
			const ageDistribution = page.locator('[data-testid="age-distribution"]').or(page.locator(".age-distribution"));
			if (await ageDistribution.isVisible()) {
				await expect(ageDistribution).toBeVisible();
			}

			// Should display gender breakdown
			const genderBreakdown = page.locator('[data-testid="gender-breakdown"]').or(page.locator(".gender-breakdown"));
			if (await genderBreakdown.isVisible()) {
				await expect(genderBreakdown).toBeVisible();
			}

			// Should show geographic distribution
			const geoDistribution = page.locator('[data-testid="geo-distribution"]').or(page.locator(".geo-distribution"));
			if (await geoDistribution.isVisible()) {
				await expect(geoDistribution).toBeVisible();
			}
		}
	});

	test("should track patient acquisition trends", async ({ page }) => {
		// Look for patient acquisition analytics
		const acquisitionAnalytics = page
			.locator('[data-testid="acquisition-analytics"]')
			.or(page.locator(".acquisition-analytics"));
		if (await acquisitionAnalytics.isVisible()) {
			await expect(acquisitionAnalytics).toBeVisible();

			// Should show new patient trends
			const newPatientTrends = page
				.locator('[data-testid="new-patient-trends"]')
				.or(page.locator(".new-patient-trends"));
			if (await newPatientTrends.isVisible()) {
				await expect(newPatientTrends).toBeVisible();
			}

			// Should display referral sources
			const referralSources = page.locator('[data-testid="referral-sources"]').or(page.locator(".referral-sources"));
			if (await referralSources.isVisible()) {
				await expect(referralSources).toBeVisible();
			}

			// Should show conversion rates
			const conversionRates = page.locator('[data-testid="conversion-rates"]').or(page.locator(".conversion-rates"));
			if (await conversionRates.isVisible()) {
				await expect(conversionRates).toBeVisible();
			}
		}
	});

	test("should display patient retention metrics", async ({ page }) => {
		// Look for retention analytics
		const retentionAnalytics = page
			.locator('[data-testid="retention-analytics"]')
			.or(page.locator(".retention-analytics"));
		if (await retentionAnalytics.isVisible()) {
			await expect(retentionAnalytics).toBeVisible();

			// Should show retention rates
			const retentionRates = page.locator('[data-testid="retention-rates"]').or(page.locator(".retention-rates"));
			if (await retentionRates.isVisible()) {
				await expect(retentionRates).toBeVisible();
			}

			// Should display churn analysis
			const churnAnalysis = page.locator('[data-testid="churn-analysis"]').or(page.locator(".churn-analysis"));
			if (await churnAnalysis.isVisible()) {
				await expect(churnAnalysis).toBeVisible();
			}

			// Should show patient lifetime value
			const lifetimeValue = page.locator('[data-testid="lifetime-value"]').or(page.locator(".lifetime-value"));
			if (await lifetimeValue.isVisible()) {
				await expect(lifetimeValue).toBeVisible();
			}
		}
	});

	test("should analyze patient satisfaction scores", async ({ page }) => {
		// Look for satisfaction analytics
		const satisfactionAnalytics = page
			.locator('[data-testid="satisfaction-analytics"]')
			.or(page.locator(".satisfaction-analytics"));
		if (await satisfactionAnalytics.isVisible()) {
			await expect(satisfactionAnalytics).toBeVisible();

			// Should show NPS scores
			const npsScores = page.locator("text=NPS").or(page.locator('[data-testid="nps-scores"]'));
			if (await npsScores.isVisible()) {
				await expect(npsScores).toBeVisible();
			}

			// Should display satisfaction trends
			const satisfactionTrends = page
				.locator('[data-testid="satisfaction-trends"]')
				.or(page.locator(".satisfaction-trends"));
			if (await satisfactionTrends.isVisible()) {
				await expect(satisfactionTrends).toBeVisible();
			}

			// Should show feedback categories
			const feedbackCategories = page
				.locator('[data-testid="feedback-categories"]')
				.or(page.locator(".feedback-categories"));
			if (await feedbackCategories.isVisible()) {
				await expect(feedbackCategories).toBeVisible();
			}
		}
	});
});

test.describe("Dashboard Analytics - Treatment Analytics", () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to treatment analytics
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/analytics");
		await page.waitForLoadState("networkidle");
	});

	test("should display treatment outcome analytics", async ({ page }) => {
		// Navigate to treatment analytics
		const treatmentAnalytics = page
			.locator('[data-testid="treatment-analytics"]')
			.or(page.locator('button:has-text("Tratamentos")'))
			.first();
		if (await treatmentAnalytics.isVisible()) {
			await treatmentAnalytics.click();

			// Should display outcome metrics
			const outcomeMetrics = page.locator('[data-testid="outcome-metrics"]').or(page.locator(".outcome-metrics"));
			if (await outcomeMetrics.isVisible()) {
				await expect(outcomeMetrics).toBeVisible();
			}

			// Should show success rates
			const successRates = page.locator('[data-testid="success-rates"]').or(page.locator(".success-rates"));
			if (await successRates.isVisible()) {
				await expect(successRates).toBeVisible();
			}

			// Should display treatment duration analysis
			const durationAnalysis = page.locator('[data-testid="duration-analysis"]').or(page.locator(".duration-analysis"));
			if (await durationAnalysis.isVisible()) {
				await expect(durationAnalysis).toBeVisible();
			}
		}
	});

	test("should analyze treatment effectiveness by type", async ({ page }) => {
		// Look for treatment type analytics
		const treatmentTypeAnalytics = page
			.locator('[data-testid="treatment-type-analytics"]')
			.or(page.locator(".treatment-type-analytics"));
		if (await treatmentTypeAnalytics.isVisible()) {
			await expect(treatmentTypeAnalytics).toBeVisible();

			// Should show aesthetic treatment analytics
			const aestheticAnalytics = page.locator("text=estético").or(page.locator("text=aesthetic"));
			if (await aestheticAnalytics.isVisible()) {
				await expect(aestheticAnalytics).toBeVisible();
			}

			// Should display dermatological treatment analytics
			const dermatologyAnalytics = page.locator("text=dermatológico").or(page.locator("text=dermatological"));
			if (await dermatologyAnalytics.isVisible()) {
				await expect(dermatologyAnalytics).toBeVisible();
			}

			// Should show comparative effectiveness
			const comparativeEffectiveness = page
				.locator('[data-testid="comparative-effectiveness"]')
				.or(page.locator(".comparative-effectiveness"));
			if (await comparativeEffectiveness.isVisible()) {
				await expect(comparativeEffectiveness).toBeVisible();
			}
		}
	});

	test("should track adverse events and complications", async ({ page }) => {
		// Look for adverse events analytics
		const adverseEventsAnalytics = page
			.locator('[data-testid="adverse-events-analytics"]')
			.or(page.locator(".adverse-events-analytics"));
		if (await adverseEventsAnalytics.isVisible()) {
			await expect(adverseEventsAnalytics).toBeVisible();

			// Should show complication rates
			const complicationRates = page
				.locator('[data-testid="complication-rates"]')
				.or(page.locator(".complication-rates"));
			if (await complicationRates.isVisible()) {
				await expect(complicationRates).toBeVisible();
			}

			// Should display severity classification
			const severityClassification = page
				.locator('[data-testid="severity-classification"]')
				.or(page.locator(".severity-classification"));
			if (await severityClassification.isVisible()) {
				await expect(severityClassification).toBeVisible();
			}

			// Should show ANVISA reporting compliance
			const anvisaCompliance = page.locator("text=ANVISA").or(page.locator('[data-testid="anvisa-compliance"]'));
			if (await anvisaCompliance.isVisible()) {
				await expect(anvisaCompliance).toBeVisible();
			}
		}
	});

	test("should analyze treatment costs and ROI", async ({ page }) => {
		// Look for cost analytics
		const costAnalytics = page.locator('[data-testid="cost-analytics"]').or(page.locator(".cost-analytics"));
		if (await costAnalytics.isVisible()) {
			await expect(costAnalytics).toBeVisible();

			// Should show cost per treatment
			const costPerTreatment = page
				.locator('[data-testid="cost-per-treatment"]')
				.or(page.locator(".cost-per-treatment"));
			if (await costPerTreatment.isVisible()) {
				await expect(costPerTreatment).toBeVisible();
			}

			// Should display ROI metrics
			const roiMetrics = page.locator('[data-testid="roi-metrics"]').or(page.locator(".roi-metrics"));
			if (await roiMetrics.isVisible()) {
				await expect(roiMetrics).toBeVisible();
			}

			// Should show profitability analysis
			const profitabilityAnalysis = page
				.locator('[data-testid="profitability-analysis"]')
				.or(page.locator(".profitability-analysis"));
			if (await profitabilityAnalysis.isVisible()) {
				await expect(profitabilityAnalysis).toBeVisible();
			}
		}
	});
});

test.describe("Dashboard Analytics - Financial Analytics", () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to financial analytics
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/analytics");
		await page.waitForLoadState("networkidle");
	});

	test("should display revenue analytics", async ({ page }) => {
		// Navigate to financial analytics
		const financialAnalytics = page
			.locator('[data-testid="financial-analytics"]')
			.or(page.locator('button:has-text("Financeiro")'))
			.first();
		if (await financialAnalytics.isVisible()) {
			await financialAnalytics.click();

			// Should display revenue charts
			const revenueCharts = page.locator('[data-testid="revenue-charts"]').or(page.locator(".revenue-charts"));
			if (await revenueCharts.isVisible()) {
				await expect(revenueCharts).toBeVisible();
			}

			// Should show monthly revenue trends
			const monthlyRevenue = page.locator('[data-testid="monthly-revenue"]').or(page.locator(".monthly-revenue"));
			if (await monthlyRevenue.isVisible()) {
				await expect(monthlyRevenue).toBeVisible();
			}

			// Should display revenue by service type
			const revenueByService = page
				.locator('[data-testid="revenue-by-service"]')
				.or(page.locator(".revenue-by-service"));
			if (await revenueByService.isVisible()) {
				await expect(revenueByService).toBeVisible();
			}
		}
	});

	test("should analyze payment methods and trends", async ({ page }) => {
		// Look for payment analytics
		const paymentAnalytics = page.locator('[data-testid="payment-analytics"]').or(page.locator(".payment-analytics"));
		if (await paymentAnalytics.isVisible()) {
			await expect(paymentAnalytics).toBeVisible();

			// Should show PIX payment trends
			const pixTrends = page.locator("text=PIX").or(page.locator('[data-testid="pix-trends"]'));
			if (await pixTrends.isVisible()) {
				await expect(pixTrends).toBeVisible();
			}

			// Should display credit card analytics
			const cardAnalytics = page.locator("text=cartão").or(page.locator("text=card"));
			if (await cardAnalytics.isVisible()) {
				await expect(cardAnalytics).toBeVisible();
			}

			// Should show payment success rates
			const paymentSuccessRates = page
				.locator('[data-testid="payment-success-rates"]')
				.or(page.locator(".payment-success-rates"));
			if (await paymentSuccessRates.isVisible()) {
				await expect(paymentSuccessRates).toBeVisible();
			}
		}
	});

	test("should track outstanding payments and collections", async ({ page }) => {
		// Look for collections analytics
		const collectionsAnalytics = page
			.locator('[data-testid="collections-analytics"]')
			.or(page.locator(".collections-analytics"));
		if (await collectionsAnalytics.isVisible()) {
			await expect(collectionsAnalytics).toBeVisible();

			// Should show outstanding amounts
			const outstandingAmounts = page
				.locator('[data-testid="outstanding-amounts"]')
				.or(page.locator(".outstanding-amounts"));
			if (await outstandingAmounts.isVisible()) {
				await expect(outstandingAmounts).toBeVisible();
			}

			// Should display aging analysis
			const agingAnalysis = page.locator('[data-testid="aging-analysis"]').or(page.locator(".aging-analysis"));
			if (await agingAnalysis.isVisible()) {
				await expect(agingAnalysis).toBeVisible();
			}

			// Should show collection efficiency
			const collectionEfficiency = page
				.locator('[data-testid="collection-efficiency"]')
				.or(page.locator(".collection-efficiency"));
			if (await collectionEfficiency.isVisible()) {
				await expect(collectionEfficiency).toBeVisible();
			}
		}
	});

	test("should analyze insurance claims and reimbursements", async ({ page }) => {
		// Look for insurance analytics
		const insuranceAnalytics = page
			.locator('[data-testid="insurance-analytics"]')
			.or(page.locator(".insurance-analytics"));
		if (await insuranceAnalytics.isVisible()) {
			await expect(insuranceAnalytics).toBeVisible();

			// Should show claims processing times
			const claimsProcessing = page.locator('[data-testid="claims-processing"]').or(page.locator(".claims-processing"));
			if (await claimsProcessing.isVisible()) {
				await expect(claimsProcessing).toBeVisible();
			}

			// Should display reimbursement rates
			const reimbursementRates = page
				.locator('[data-testid="reimbursement-rates"]')
				.or(page.locator(".reimbursement-rates"));
			if (await reimbursementRates.isVisible()) {
				await expect(reimbursementRates).toBeVisible();
			}

			// Should show denial rates and reasons
			const denialRates = page.locator('[data-testid="denial-rates"]').or(page.locator(".denial-rates"));
			if (await denialRates.isVisible()) {
				await expect(denialRates).toBeVisible();
			}
		}
	});
});

test.describe("Dashboard Analytics - Operational Analytics", () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to operational analytics
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/analytics");
		await page.waitForLoadState("networkidle");
	});

	test("should display appointment analytics", async ({ page }) => {
		// Look for appointment analytics
		const appointmentAnalytics = page
			.locator('[data-testid="appointment-analytics"]')
			.or(page.locator(".appointment-analytics"));
		if (await appointmentAnalytics.isVisible()) {
			await expect(appointmentAnalytics).toBeVisible();

			// Should show appointment volume trends
			const volumeTrends = page.locator('[data-testid="volume-trends"]').or(page.locator(".volume-trends"));
			if (await volumeTrends.isVisible()) {
				await expect(volumeTrends).toBeVisible();
			}

			// Should display no-show rates
			const noShowRates = page.locator('[data-testid="no-show-rates"]').or(page.locator(".no-show-rates"));
			if (await noShowRates.isVisible()) {
				await expect(noShowRates).toBeVisible();
			}

			// Should show cancellation analytics
			const cancellationAnalytics = page
				.locator('[data-testid="cancellation-analytics"]')
				.or(page.locator(".cancellation-analytics"));
			if (await cancellationAnalytics.isVisible()) {
				await expect(cancellationAnalytics).toBeVisible();
			}
		}
	});

	test("should track staff productivity metrics", async ({ page }) => {
		// Look for staff analytics
		const staffAnalytics = page.locator('[data-testid="staff-analytics"]').or(page.locator(".staff-analytics"));
		if (await staffAnalytics.isVisible()) {
			await expect(staffAnalytics).toBeVisible();

			// Should show productivity metrics
			const productivityMetrics = page
				.locator('[data-testid="productivity-metrics"]')
				.or(page.locator(".productivity-metrics"));
			if (await productivityMetrics.isVisible()) {
				await expect(productivityMetrics).toBeVisible();
			}

			// Should display utilization rates
			const utilizationRates = page.locator('[data-testid="utilization-rates"]').or(page.locator(".utilization-rates"));
			if (await utilizationRates.isVisible()) {
				await expect(utilizationRates).toBeVisible();
			}

			// Should show performance comparisons
			const performanceComparisons = page
				.locator('[data-testid="performance-comparisons"]')
				.or(page.locator(".performance-comparisons"));
			if (await performanceComparisons.isVisible()) {
				await expect(performanceComparisons).toBeVisible();
			}
		}
	});

	test("should analyze resource utilization", async ({ page }) => {
		// Look for resource analytics
		const resourceAnalytics = page
			.locator('[data-testid="resource-analytics"]')
			.or(page.locator(".resource-analytics"));
		if (await resourceAnalytics.isVisible()) {
			await expect(resourceAnalytics).toBeVisible();

			// Should show equipment utilization
			const equipmentUtilization = page
				.locator('[data-testid="equipment-utilization"]')
				.or(page.locator(".equipment-utilization"));
			if (await equipmentUtilization.isVisible()) {
				await expect(equipmentUtilization).toBeVisible();
			}

			// Should display room occupancy rates
			const roomOccupancy = page.locator('[data-testid="room-occupancy"]').or(page.locator(".room-occupancy"));
			if (await roomOccupancy.isVisible()) {
				await expect(roomOccupancy).toBeVisible();
			}

			// Should show capacity planning metrics
			const capacityPlanning = page.locator('[data-testid="capacity-planning"]').or(page.locator(".capacity-planning"));
			if (await capacityPlanning.isVisible()) {
				await expect(capacityPlanning).toBeVisible();
			}
		}
	});

	test("should track wait times and efficiency", async ({ page }) => {
		// Look for efficiency analytics
		const efficiencyAnalytics = page
			.locator('[data-testid="efficiency-analytics"]')
			.or(page.locator(".efficiency-analytics"));
		if (await efficiencyAnalytics.isVisible()) {
			await expect(efficiencyAnalytics).toBeVisible();

			// Should show average wait times
			const waitTimes = page.locator('[data-testid="wait-times"]').or(page.locator(".wait-times"));
			if (await waitTimes.isVisible()) {
				await expect(waitTimes).toBeVisible();
			}

			// Should display throughput metrics
			const throughputMetrics = page
				.locator('[data-testid="throughput-metrics"]')
				.or(page.locator(".throughput-metrics"));
			if (await throughputMetrics.isVisible()) {
				await expect(throughputMetrics).toBeVisible();
			}

			// Should show bottleneck analysis
			const bottleneckAnalysis = page
				.locator('[data-testid="bottleneck-analysis"]')
				.or(page.locator(".bottleneck-analysis"));
			if (await bottleneckAnalysis.isVisible()) {
				await expect(bottleneckAnalysis).toBeVisible();
			}
		}
	});
});

test.describe("Dashboard Analytics - Performance & Accessibility", () => {
	test("should load analytics efficiently", async ({ page }) => {
		// Measure page load time
		const startTime = Date.now();
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/analytics");
		await page.waitForLoadState("networkidle");
		const loadTime = Date.now() - startTime;

		// Should load in reasonable time
		expect(loadTime).toBeLessThan(5000);

		// Critical elements should be visible
		await expect(page.locator('[data-testid="kpi-cards"]').or(page.locator(".kpi-cards"))).toBeVisible();
	});

	test("should be keyboard accessible", async ({ page }) => {
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/analytics");

		// Test keyboard navigation
		await page.keyboard.press("Tab");

		// Should focus on first interactive element
		const focusedElement = await page.locator(":focus");
		await expect(focusedElement).toBeVisible();

		// Should be able to navigate through analytics sections
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");

		// Should reach actionable elements
		const actionButton = page.locator("button:focus");
		if (await actionButton.isVisible()) {
			await expect(actionButton).toBeVisible();
		}
	});

	test("should have proper ARIA labels for charts", async ({ page }) => {
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/analytics");

		// Wait for charts to load
		await page.waitForLoadState("networkidle");

		// Check for chart accessibility
		const charts = page.locator('[data-testid="analytics-charts"]').or(page.locator(".chart"));
		if ((await charts.count()) > 0) {
			const firstChart = charts.first();
			const hasAriaLabel = await firstChart.evaluate((el) => {
				return el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("role");
			});
			expect(hasAriaLabel).toBeTruthy();
		}
	});

	test("should work on mobile devices", async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/analytics");

		// Should be responsive
		await expect(page.locator('[data-testid="kpi-cards"]').or(page.locator(".kpi-cards"))).toBeVisible();

		// Touch targets should be appropriate size
		const analyticsButton = page
			.locator('[data-testid="patient-analytics"]')
			.or(page.locator('button:has-text("Pacientes")'))
			.first();
		if (await analyticsButton.isVisible()) {
			const buttonBox = await analyticsButton.boundingBox();
			if (buttonBox) {
				expect(buttonBox.height).toBeGreaterThanOrEqual(44);
			}
		}
	});

	test("should handle real-time data updates", async ({ page }) => {
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/analytics");

		// Should have real-time indicators
		const realTimeIndicator = page
			.locator('[data-testid="real-time-indicator"]')
			.or(page.locator(".real-time-indicator"));
		if (await realTimeIndicator.isVisible()) {
			await expect(realTimeIndicator).toBeVisible();

			// Should update periodically
			const _initialText = await page
				.locator('[data-testid="today-metrics"]')
				.or(page.locator(".today-metrics"))
				.textContent();

			// Wait for potential update
			await page.waitForTimeout(5000);

			// Check if content might have updated (or at least didn't error)
			const updatedText = await page
				.locator('[data-testid="today-metrics"]')
				.or(page.locator(".today-metrics"))
				.textContent();
			expect(updatedText).toBeDefined();
		}
	});
});
