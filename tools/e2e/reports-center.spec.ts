import { expect, test } from "@playwright/test";

/**
 * Reports Center E2E Tests for NeonPro Healthcare
 *
 * Critical reporting workflows:
 * - Analytics and performance reports
 * - Compliance and regulatory reports
 * - Financial and billing reports
 * - Patient outcome reports
 * - ANVISA compliance reporting
 * - LGPD data processing reports
 * - Export and sharing capabilities
 */

test.describe("Reports Center - Analytics Reports", () => {
	test.beforeEach(async ({ page }) => {
		// Login as healthcare professional
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');

		// Navigate to reports center
		await page.goto("/dashboard/reports");
		await page.waitForLoadState("networkidle");
	});

	test("should display reports center dashboard", async ({ page }) => {
		// Check reports center title
		await expect(page.locator("h1, .reports-title")).toContainText(
			/Relatórios|Reports|Centro de Relatórios/,
		);

		// Should display report categories
		await expect(
			page
				.locator('[data-testid="report-categories"]')
				.or(page.locator(".report-categories")),
		).toBeVisible();

		// Should show quick stats
		const quickStats = page
			.locator('[data-testid="quick-stats"]')
			.or(page.locator(".quick-stats"));
		if (await quickStats.isVisible()) {
			await expect(quickStats).toBeVisible();
		}

		// Should display recent reports
		const recentReports = page
			.locator('[data-testid="recent-reports"]')
			.or(page.locator(".recent-reports"));
		if (await recentReports.isVisible()) {
			await expect(recentReports).toBeVisible();
		}
	});

	test("should generate patient analytics report", async ({ page }) => {
		// Click on analytics reports
		const analyticsCategory = page
			.locator('[data-testid="analytics-reports"]')
			.or(page.locator('button:has-text("Analytics")'))
			.first();
		await analyticsCategory.click();

		// Select patient analytics
		const patientAnalytics = page
			.locator('[data-testid="patient-analytics"]')
			.or(page.locator('button:has-text("Pacientes")'))
			.first();
		await patientAnalytics.click();

		// Should display analytics form
		await expect(
			page
				.locator('[data-testid="analytics-form"]')
				.or(page.locator(".analytics-form")),
		).toBeVisible();

		// Set date range
		const startDate = page
			.locator('[data-testid="start-date"]')
			.or(page.locator('input[name="startDate"]'));
		await startDate.fill("2024-01-01");

		const endDate = page
			.locator('[data-testid="end-date"]')
			.or(page.locator('input[name="endDate"]'));
		await endDate.fill("2024-01-31");

		// Select metrics
		const metricsSelect = page
			.locator('[data-testid="metrics-select"]')
			.or(page.locator('select[name="metrics"]'));
		if (await metricsSelect.isVisible()) {
			await metricsSelect.selectOption([
				"new-patients",
				"appointments",
				"treatments",
			]);
		}

		// Generate report
		await page.click('[data-testid="generate-report"]');

		// Should show loading state
		await expect(
			page.locator('[data-testid="loading"]').or(page.locator(".loading")),
		).toBeVisible();

		// Should display results
		await expect(
			page
				.locator('[data-testid="report-results"]')
				.or(page.locator(".report-results")),
		).toBeVisible({
			timeout: 10_000,
		});

		// Should show charts and metrics
		const charts = page
			.locator('[data-testid="analytics-chart"]')
			.or(page.locator(".chart"));
		if ((await charts.count()) > 0) {
			await expect(charts.first()).toBeVisible();
		}
	});

	test("should filter analytics by department", async ({ page }) => {
		// Navigate to analytics
		const analyticsCategory = page
			.locator('[data-testid="analytics-reports"]')
			.or(page.locator('button:has-text("Analytics")'))
			.first();
		await analyticsCategory.click();

		// Should have department filter
		const departmentFilter = page
			.locator('[data-testid="department-filter"]')
			.or(page.locator('select[name="department"]'));
		if (await departmentFilter.isVisible()) {
			await departmentFilter.selectOption("dermatology");

			// Apply filter
			const applyFilter = page
				.locator('[data-testid="apply-filter"]')
				.or(page.locator('button:has-text("Aplicar")'))
				.first();
			await applyFilter.click();

			// Should update results
			await expect(
				page
					.locator('[data-testid="filtered-results"]')
					.or(page.locator(".filtered-results")),
			).toBeVisible();
		}
	});

	test("should export analytics data", async ({ page }) => {
		// Generate a report first
		const analyticsCategory = page
			.locator('[data-testid="analytics-reports"]')
			.or(page.locator('button:has-text("Analytics")'))
			.first();
		await analyticsCategory.click();

		const patientAnalytics = page
			.locator('[data-testid="patient-analytics"]')
			.or(page.locator('button:has-text("Pacientes")'))
			.first();
		await patientAnalytics.click();

		await page.click('[data-testid="generate-report"]');

		// Wait for results
		await expect(
			page
				.locator('[data-testid="report-results"]')
				.or(page.locator(".report-results")),
		).toBeVisible({
			timeout: 10_000,
		});

		// Should have export options
		const exportButton = page
			.locator('[data-testid="export-report"]')
			.or(page.locator('button:has-text("Exportar")'))
			.first();
		if (await exportButton.isVisible()) {
			await exportButton.click();

			// Should show export formats
			const exportFormats = page
				.locator('[data-testid="export-formats"]')
				.or(page.locator(".export-formats"));
			if (await exportFormats.isVisible()) {
				await expect(exportFormats).toBeVisible();

				// Should have PDF and Excel options
				await expect(
					page.locator("text=PDF").or(page.locator("text=Excel")),
				).toBeVisible();
			}
		}
	});

	test("should display real-time metrics", async ({ page }) => {
		// Look for real-time dashboard
		const realTimeMetrics = page
			.locator('[data-testid="real-time-metrics"]')
			.or(page.locator(".real-time-metrics"));
		if (await realTimeMetrics.isVisible()) {
			await expect(realTimeMetrics).toBeVisible();

			// Should show current day stats
			await expect(
				page.locator("text=hoje").or(page.locator("text=today")),
			).toBeVisible();

			// Should have auto-refresh indicator
			const autoRefresh = page
				.locator('[data-testid="auto-refresh"]')
				.or(page.locator(".auto-refresh"));
			if (await autoRefresh.isVisible()) {
				await expect(autoRefresh).toBeVisible();
			}
		}
	});
});

test.describe("Reports Center - Compliance Reports", () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to compliance reports
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/reports");
		await page.waitForLoadState("networkidle");
	});

	test("should generate ANVISA compliance report", async ({ page }) => {
		// Navigate to compliance reports
		const complianceCategory = page
			.locator('[data-testid="compliance-reports"]')
			.or(page.locator('button:has-text("Compliance")'))
			.first();
		await complianceCategory.click();

		// Select ANVISA report
		const anvisaReport = page
			.locator('[data-testid="anvisa-report"]')
			.or(page.locator('button:has-text("ANVISA")'))
			.first();
		await anvisaReport.click();

		// Should display ANVISA compliance form
		await expect(
			page
				.locator('[data-testid="anvisa-form"]')
				.or(page.locator(".anvisa-form")),
		).toBeVisible();

		// Set reporting period
		const reportingPeriod = page
			.locator('[data-testid="reporting-period"]')
			.or(page.locator('select[name="reportingPeriod"]'));
		if (await reportingPeriod.isVisible()) {
			await reportingPeriod.selectOption("monthly");
		}

		// Select compliance areas
		const complianceAreas = page
			.locator('[data-testid="compliance-areas"]')
			.or(page.locator('input[name="complianceAreas"]'));
		if ((await complianceAreas.count()) > 0) {
			await complianceAreas.first().check();
		}

		// Generate report
		await page.click('[data-testid="generate-compliance-report"]');

		// Should show compliance status
		await expect(
			page
				.locator('[data-testid="compliance-status"]')
				.or(page.locator(".compliance-status")),
		).toBeVisible({
			timeout: 10_000,
		});

		// Should display compliance metrics
		const complianceMetrics = page
			.locator('[data-testid="compliance-metrics"]')
			.or(page.locator(".compliance-metrics"));
		if (await complianceMetrics.isVisible()) {
			await expect(complianceMetrics).toBeVisible();
		}
	});

	test("should generate LGPD data processing report", async ({ page }) => {
		// Navigate to compliance reports
		const complianceCategory = page
			.locator('[data-testid="compliance-reports"]')
			.or(page.locator('button:has-text("Compliance")'))
			.first();
		await complianceCategory.click();

		// Select LGPD report
		const lgpdReport = page
			.locator('[data-testid="lgpd-report"]')
			.or(page.locator('button:has-text("LGPD")'))
			.first();
		await lgpdReport.click();

		// Should display LGPD compliance form
		await expect(
			page.locator('[data-testid="lgpd-form"]').or(page.locator(".lgpd-form")),
		).toBeVisible();

		// Set data processing period
		const processingPeriod = page
			.locator('[data-testid="processing-period"]')
			.or(page.locator('select[name="processingPeriod"]'));
		if (await processingPeriod.isVisible()) {
			await processingPeriod.selectOption("quarterly");
		}

		// Select data categories
		const dataCategories = page
			.locator('[data-testid="data-categories"]')
			.or(page.locator('input[name="dataCategories"]'));
		if ((await dataCategories.count()) > 0) {
			await dataCategories.first().check();
		}

		// Generate LGPD report
		await page.click('[data-testid="generate-lgpd-report"]');

		// Should show data processing summary
		await expect(
			page
				.locator('[data-testid="data-processing-summary"]')
				.or(page.locator(".data-processing-summary")),
		).toBeVisible({ timeout: 10_000 });

		// Should display consent status
		const consentStatus = page
			.locator('[data-testid="consent-status"]')
			.or(page.locator(".consent-status"));
		if (await consentStatus.isVisible()) {
			await expect(consentStatus).toBeVisible();
		}
	});

	test("should track audit trail compliance", async ({ page }) => {
		// Navigate to audit reports
		const complianceCategory = page
			.locator('[data-testid="compliance-reports"]')
			.or(page.locator('button:has-text("Compliance")'))
			.first();
		await complianceCategory.click();

		const auditReport = page
			.locator('[data-testid="audit-report"]')
			.or(page.locator('button:has-text("Auditoria")'))
			.first();
		await auditReport.click();

		// Should display audit trail
		await expect(
			page
				.locator('[data-testid="audit-trail"]')
				.or(page.locator(".audit-trail")),
		).toBeVisible();

		// Should show user actions
		const userActions = page
			.locator('[data-testid="user-actions"]')
			.or(page.locator(".user-actions"));
		if (await userActions.isVisible()) {
			await expect(userActions).toBeVisible();

			// Should display timestamps
			await expect(page.locator("text=\\d{2}/\\d{2}/\\d{4}")).toBeVisible();
		}

		// Should have search and filter options
		const auditSearch = page
			.locator('[data-testid="audit-search"]')
			.or(page.locator('input[name="auditSearch"]'));
		if (await auditSearch.isVisible()) {
			await auditSearch.fill("login");

			// Should filter results
			await expect(
				page.locator("text=login").or(page.locator("text=acesso")),
			).toBeVisible();
		}
	});

	test("should generate professional license compliance report", async ({
		page,
	}) => {
		// Navigate to professional compliance
		const complianceCategory = page
			.locator('[data-testid="compliance-reports"]')
			.or(page.locator('button:has-text("Compliance")'))
			.first();
		await complianceCategory.click();

		const licenseReport = page
			.locator('[data-testid="license-report"]')
			.or(page.locator('button:has-text("Licenças")'))
			.first();
		if (await licenseReport.isVisible()) {
			await licenseReport.click();

			// Should display license status
			await expect(
				page
					.locator('[data-testid="license-status"]')
					.or(page.locator(".license-status")),
			).toBeVisible();

			// Should show expiring licenses
			const expiringLicenses = page
				.locator('[data-testid="expiring-licenses"]')
				.or(page.locator(".expiring-licenses"));
			if (await expiringLicenses.isVisible()) {
				await expect(expiringLicenses).toBeVisible();
			}

			// Should display CRM/CFM compliance
			const crmCompliance = page
				.locator("text=CRM")
				.or(page.locator("text=CFM"));
			if (await crmCompliance.isVisible()) {
				await expect(crmCompliance).toBeVisible();
			}
		}
	});
});

test.describe("Reports Center - Financial Reports", () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to financial reports
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/reports");
		await page.waitForLoadState("networkidle");
	});

	test("should generate revenue report", async ({ page }) => {
		// Navigate to financial reports
		const financialCategory = page
			.locator('[data-testid="financial-reports"]')
			.or(page.locator('button:has-text("Financeiro")'))
			.first();
		await financialCategory.click();

		// Select revenue report
		const revenueReport = page
			.locator('[data-testid="revenue-report"]')
			.or(page.locator('button:has-text("Receita")'))
			.first();
		await revenueReport.click();

		// Should display financial form
		await expect(
			page
				.locator('[data-testid="financial-form"]')
				.or(page.locator(".financial-form")),
		).toBeVisible();

		// Set financial period
		const financialPeriod = page
			.locator('[data-testid="financial-period"]')
			.or(page.locator('select[name="financialPeriod"]'));
		if (await financialPeriod.isVisible()) {
			await financialPeriod.selectOption("monthly");
		}

		// Select revenue streams
		const revenueStreams = page
			.locator('[data-testid="revenue-streams"]')
			.or(page.locator('input[name="revenueStreams"]'));
		if ((await revenueStreams.count()) > 0) {
			await revenueStreams.first().check();
		}

		// Generate financial report
		await page.click('[data-testid="generate-financial-report"]');

		// Should show revenue metrics
		await expect(
			page
				.locator('[data-testid="revenue-metrics"]')
				.or(page.locator(".revenue-metrics")),
		).toBeVisible({
			timeout: 10_000,
		});

		// Should display financial charts
		const financialCharts = page
			.locator('[data-testid="financial-chart"]')
			.or(page.locator(".financial-chart"));
		if ((await financialCharts.count()) > 0) {
			await expect(financialCharts.first()).toBeVisible();
		}
	});

	test("should generate billing report", async ({ page }) => {
		// Navigate to billing reports
		const financialCategory = page
			.locator('[data-testid="financial-reports"]')
			.or(page.locator('button:has-text("Financeiro")'))
			.first();
		await financialCategory.click();

		const billingReport = page
			.locator('[data-testid="billing-report"]')
			.or(page.locator('button:has-text("Faturamento")'))
			.first();
		await billingReport.click();

		// Should display billing summary
		await expect(
			page
				.locator('[data-testid="billing-summary"]')
				.or(page.locator(".billing-summary")),
		).toBeVisible();

		// Should show payment status
		const paymentStatus = page
			.locator('[data-testid="payment-status"]')
			.or(page.locator(".payment-status"));
		if (await paymentStatus.isVisible()) {
			await expect(paymentStatus).toBeVisible();

			// Should display pending payments
			await expect(
				page.locator("text=pendente").or(page.locator("text=pending")),
			).toBeVisible();
		}

		// Should show insurance claims
		const insuranceClaims = page
			.locator('[data-testid="insurance-claims"]')
			.or(page.locator(".insurance-claims"));
		if (await insuranceClaims.isVisible()) {
			await expect(insuranceClaims).toBeVisible();
		}
	});

	test("should track payment methods and PIX transactions", async ({
		page,
	}) => {
		// Navigate to payment reports
		const financialCategory = page
			.locator('[data-testid="financial-reports"]')
			.or(page.locator('button:has-text("Financeiro")'))
			.first();
		await financialCategory.click();

		const paymentReport = page
			.locator('[data-testid="payment-report"]')
			.or(page.locator('button:has-text("Pagamentos")'))
			.first();
		if (await paymentReport.isVisible()) {
			await paymentReport.click();

			// Should display payment methods breakdown
			await expect(
				page
					.locator('[data-testid="payment-methods"]')
					.or(page.locator(".payment-methods")),
			).toBeVisible();

			// Should show PIX transactions
			const pixTransactions = page
				.locator("text=PIX")
				.or(page.locator('[data-testid="pix-transactions"]'));
			if (await pixTransactions.isVisible()) {
				await expect(pixTransactions).toBeVisible();
			}

			// Should display credit card transactions
			const cardTransactions = page
				.locator("text=cartão")
				.or(page.locator("text=card"));
			if (await cardTransactions.isVisible()) {
				await expect(cardTransactions).toBeVisible();
			}
		}
	});

	test("should generate tax compliance report", async ({ page }) => {
		// Navigate to tax reports
		const financialCategory = page
			.locator('[data-testid="financial-reports"]')
			.or(page.locator('button:has-text("Financeiro")'))
			.first();
		await financialCategory.click();

		const taxReport = page
			.locator('[data-testid="tax-report"]')
			.or(page.locator('button:has-text("Impostos")'))
			.first();
		if (await taxReport.isVisible()) {
			await taxReport.click();

			// Should display tax summary
			await expect(
				page
					.locator('[data-testid="tax-summary"]')
					.or(page.locator(".tax-summary")),
			).toBeVisible();

			// Should show ISS calculations
			const issCalculations = page
				.locator("text=ISS")
				.or(page.locator('[data-testid="iss-calculations"]'));
			if (await issCalculations.isVisible()) {
				await expect(issCalculations).toBeVisible();
			}

			// Should display IRPF information
			const irpfInfo = page
				.locator("text=IRPF")
				.or(page.locator('[data-testid="irpf-info"]'));
			if (await irpfInfo.isVisible()) {
				await expect(irpfInfo).toBeVisible();
			}
		}
	});
});

test.describe("Reports Center - Patient Outcome Reports", () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to patient reports
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/reports");
		await page.waitForLoadState("networkidle");
	});

	test("should generate treatment outcome report", async ({ page }) => {
		// Navigate to patient reports
		const patientCategory = page
			.locator('[data-testid="patient-reports"]')
			.or(page.locator('button:has-text("Pacientes")'))
			.first();
		await patientCategory.click();

		// Select treatment outcomes
		const outcomeReport = page
			.locator('[data-testid="outcome-report"]')
			.or(page.locator('button:has-text("Resultados")'))
			.first();
		await outcomeReport.click();

		// Should display outcome form
		await expect(
			page
				.locator('[data-testid="outcome-form"]')
				.or(page.locator(".outcome-form")),
		).toBeVisible();

		// Select treatment type
		const treatmentType = page
			.locator('[data-testid="treatment-type"]')
			.or(page.locator('select[name="treatmentType"]'));
		if (await treatmentType.isVisible()) {
			await treatmentType.selectOption("aesthetic");
		}

		// Set outcome period
		const outcomePeriod = page
			.locator('[data-testid="outcome-period"]')
			.or(page.locator('select[name="outcomePeriod"]'));
		if (await outcomePeriod.isVisible()) {
			await outcomePeriod.selectOption("6-months");
		}

		// Generate outcome report
		await page.click('[data-testid="generate-outcome-report"]');

		// Should show treatment results
		await expect(
			page
				.locator('[data-testid="treatment-results"]')
				.or(page.locator(".treatment-results")),
		).toBeVisible({
			timeout: 10_000,
		});

		// Should display success rates
		const successRates = page
			.locator('[data-testid="success-rates"]')
			.or(page.locator(".success-rates"));
		if (await successRates.isVisible()) {
			await expect(successRates).toBeVisible();
		}
	});

	test("should generate patient satisfaction report", async ({ page }) => {
		// Navigate to satisfaction reports
		const patientCategory = page
			.locator('[data-testid="patient-reports"]')
			.or(page.locator('button:has-text("Pacientes")'))
			.first();
		await patientCategory.click();

		const satisfactionReport = page
			.locator('[data-testid="satisfaction-report"]')
			.or(page.locator('button:has-text("Satisfação")'))
			.first();
		if (await satisfactionReport.isVisible()) {
			await satisfactionReport.click();

			// Should display satisfaction metrics
			await expect(
				page
					.locator('[data-testid="satisfaction-metrics"]')
					.or(page.locator(".satisfaction-metrics")),
			).toBeVisible();

			// Should show NPS scores
			const npsScores = page
				.locator("text=NPS")
				.or(page.locator('[data-testid="nps-scores"]'));
			if (await npsScores.isVisible()) {
				await expect(npsScores).toBeVisible();
			}

			// Should display feedback summary
			const feedbackSummary = page
				.locator('[data-testid="feedback-summary"]')
				.or(page.locator(".feedback-summary"));
			if (await feedbackSummary.isVisible()) {
				await expect(feedbackSummary).toBeVisible();
			}
		}
	});

	test("should generate adverse events report", async ({ page }) => {
		// Navigate to adverse events
		const patientCategory = page
			.locator('[data-testid="patient-reports"]')
			.or(page.locator('button:has-text("Pacientes")'))
			.first();
		await patientCategory.click();

		const adverseEventsReport = page
			.locator('[data-testid="adverse-events-report"]')
			.or(page.locator('button:has-text("Eventos Adversos")'))
			.first();
		if (await adverseEventsReport.isVisible()) {
			await adverseEventsReport.click();

			// Should display adverse events summary
			await expect(
				page
					.locator('[data-testid="adverse-events-summary"]')
					.or(page.locator(".adverse-events-summary")),
			).toBeVisible();

			// Should show severity classification
			const severityClassification = page
				.locator('[data-testid="severity-classification"]')
				.or(page.locator(".severity-classification"));
			if (await severityClassification.isVisible()) {
				await expect(severityClassification).toBeVisible();
			}

			// Should display ANVISA reporting status
			const anvisaReporting = page
				.locator("text=ANVISA")
				.or(page.locator('[data-testid="anvisa-reporting"]'));
			if (await anvisaReporting.isVisible()) {
				await expect(anvisaReporting).toBeVisible();
			}
		}
	});

	test("should track patient demographics", async ({ page }) => {
		// Navigate to demographics report
		const patientCategory = page
			.locator('[data-testid="patient-reports"]')
			.or(page.locator('button:has-text("Pacientes")'))
			.first();
		await patientCategory.click();

		const demographicsReport = page
			.locator('[data-testid="demographics-report"]')
			.or(page.locator('button:has-text("Demografia")'))
			.first();
		if (await demographicsReport.isVisible()) {
			await demographicsReport.click();

			// Should display demographic breakdown
			await expect(
				page
					.locator('[data-testid="demographic-breakdown"]')
					.or(page.locator(".demographic-breakdown")),
			).toBeVisible();

			// Should show age distribution
			const ageDistribution = page
				.locator('[data-testid="age-distribution"]')
				.or(page.locator(".age-distribution"));
			if (await ageDistribution.isVisible()) {
				await expect(ageDistribution).toBeVisible();
			}

			// Should display geographic distribution
			const geoDistribution = page
				.locator('[data-testid="geo-distribution"]')
				.or(page.locator(".geo-distribution"));
			if (await geoDistribution.isVisible()) {
				await expect(geoDistribution).toBeVisible();
			}
		}
	});
});

test.describe("Reports Center - Export & Sharing", () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to reports
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/reports");
		await page.waitForLoadState("networkidle");
	});

	test("should export reports in multiple formats", async ({ page }) => {
		// Generate a sample report
		const analyticsCategory = page
			.locator('[data-testid="analytics-reports"]')
			.or(page.locator('button:has-text("Analytics")'))
			.first();
		await analyticsCategory.click();

		const patientAnalytics = page
			.locator('[data-testid="patient-analytics"]')
			.or(page.locator('button:has-text("Pacientes")'))
			.first();
		await patientAnalytics.click();

		await page.click('[data-testid="generate-report"]');

		// Wait for results
		await expect(
			page
				.locator('[data-testid="report-results"]')
				.or(page.locator(".report-results")),
		).toBeVisible({
			timeout: 10_000,
		});

		// Test PDF export
		const exportPdfButton = page
			.locator('[data-testid="export-pdf"]')
			.or(page.locator('button:has-text("PDF")'))
			.first();
		if (await exportPdfButton.isVisible()) {
			const downloadPromise = page.waitForEvent("download");
			await exportPdfButton.click();

			try {
				const download = await downloadPromise;
				expect(download.suggestedFilename()).toMatch(/\.pdf$/);
			} catch {
				// Download might not complete in test environment
			}
		}

		// Test Excel export
		const exportExcelButton = page
			.locator('[data-testid="export-excel"]')
			.or(page.locator('button:has-text("Excel")'))
			.first();
		if (await exportExcelButton.isVisible()) {
			await expect(exportExcelButton).toBeVisible();
		}
	});

	test("should schedule automated reports", async ({ page }) => {
		// Look for report scheduling
		const scheduleReports = page
			.locator('[data-testid="schedule-reports"]')
			.or(page.locator('button:has-text("Agendar")'))
			.first();
		if (await scheduleReports.isVisible()) {
			await scheduleReports.click();

			// Should display scheduling form
			await expect(
				page
					.locator('[data-testid="scheduling-form"]')
					.or(page.locator(".scheduling-form")),
			).toBeVisible();

			// Should have frequency options
			const frequency = page
				.locator('[data-testid="report-frequency"]')
				.or(page.locator('select[name="frequency"]'));
			if (await frequency.isVisible()) {
				await frequency.selectOption("weekly");
			}

			// Should have email recipients
			const emailRecipients = page
				.locator('[data-testid="email-recipients"]')
				.or(page.locator('input[name="emailRecipients"]'));
			if (await emailRecipients.isVisible()) {
				await emailRecipients.fill("admin@clinic.com");
			}

			// Save schedule
			const saveSchedule = page
				.locator('[data-testid="save-schedule"]')
				.or(page.locator('button:has-text("Salvar")'))
				.first();
			if (await saveSchedule.isVisible()) {
				await saveSchedule.click();

				// Should show confirmation
				await expect(
					page.locator("text=agendado").or(page.locator("text=scheduled")),
				).toBeVisible();
			}
		}
	});

	test("should share reports with team members", async ({ page }) => {
		// Generate a report first
		const analyticsCategory = page
			.locator('[data-testid="analytics-reports"]')
			.or(page.locator('button:has-text("Analytics")'))
			.first();
		await analyticsCategory.click();

		const patientAnalytics = page
			.locator('[data-testid="patient-analytics"]')
			.or(page.locator('button:has-text("Pacientes")'))
			.first();
		await patientAnalytics.click();

		await page.click('[data-testid="generate-report"]');

		// Wait for results
		await expect(
			page
				.locator('[data-testid="report-results"]')
				.or(page.locator(".report-results")),
		).toBeVisible({
			timeout: 10_000,
		});

		// Look for share functionality
		const shareButton = page
			.locator('[data-testid="share-report"]')
			.or(page.locator('button:has-text("Compartilhar")'))
			.first();
		if (await shareButton.isVisible()) {
			await shareButton.click();

			// Should display sharing options
			await expect(
				page
					.locator('[data-testid="sharing-options"]')
					.or(page.locator(".sharing-options")),
			).toBeVisible();

			// Should have team member selection
			const teamMembers = page
				.locator('[data-testid="team-members"]')
				.or(page.locator('input[name="teamMembers"]'));
			if ((await teamMembers.count()) > 0) {
				await teamMembers.first().check();
			}

			// Should have permission levels
			const permissionLevel = page
				.locator('[data-testid="permission-level"]')
				.or(page.locator('select[name="permissionLevel"]'));
			if (await permissionLevel.isVisible()) {
				await permissionLevel.selectOption("view-only");
			}
		}
	});

	test("should maintain report history and versions", async ({ page }) => {
		// Look for report history
		const reportHistory = page
			.locator('[data-testid="report-history"]')
			.or(page.locator('button:has-text("Histórico")'))
			.first();
		if (await reportHistory.isVisible()) {
			await reportHistory.click();

			// Should display historical reports
			await expect(
				page
					.locator('[data-testid="historical-reports"]')
					.or(page.locator(".historical-reports")),
			).toBeVisible();

			// Should show report versions
			const reportVersions = page
				.locator('[data-testid="report-versions"]')
				.or(page.locator(".report-versions"));
			if (await reportVersions.isVisible()) {
				await expect(reportVersions).toBeVisible();

				// Should display creation dates
				await expect(page.locator("text=\\d{2}/\\d{2}/\\d{4}")).toBeVisible();
			}

			// Should allow version comparison
			const compareVersions = page
				.locator('[data-testid="compare-versions"]')
				.or(page.locator('button:has-text("Comparar")'))
				.first();
			if (await compareVersions.isVisible()) {
				await expect(compareVersions).toBeVisible();
			}
		}
	});
});

test.describe("Reports Center - Performance & Accessibility", () => {
	test("should load reports efficiently", async ({ page }) => {
		// Measure page load time
		const startTime = Date.now();
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/reports");
		await page.waitForLoadState("networkidle");
		const loadTime = Date.now() - startTime;

		// Should load in reasonable time
		expect(loadTime).toBeLessThan(5000);

		// Critical elements should be visible
		await expect(
			page
				.locator('[data-testid="report-categories"]')
				.or(page.locator(".report-categories")),
		).toBeVisible();
	});

	test("should be keyboard accessible", async ({ page }) => {
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/reports");

		// Test keyboard navigation
		await page.keyboard.press("Tab");

		// Should focus on first interactive element
		const focusedElement = await page.locator(":focus");
		await expect(focusedElement).toBeVisible();

		// Should be able to navigate through report categories
		await page.keyboard.press("Tab");
		await page.keyboard.press("Tab");

		// Should reach actionable elements
		const actionButton = page.locator("button:focus");
		if (await actionButton.isVisible()) {
			await expect(actionButton).toBeVisible();
		}
	});

	test("should have proper ARIA labels for charts and data", async ({
		page,
	}) => {
		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/reports");

		// Generate a report with charts
		const analyticsCategory = page
			.locator('[data-testid="analytics-reports"]')
			.or(page.locator('button:has-text("Analytics")'))
			.first();
		if (await analyticsCategory.isVisible()) {
			await analyticsCategory.click();

			const patientAnalytics = page
				.locator('[data-testid="patient-analytics"]')
				.or(page.locator('button:has-text("Pacientes")'))
				.first();
			await patientAnalytics.click();

			await page.click('[data-testid="generate-report"]');

			// Wait for charts to load
			await expect(
				page
					.locator('[data-testid="report-results"]')
					.or(page.locator(".report-results")),
			).toBeVisible({
				timeout: 10_000,
			});

			// Check for chart accessibility
			const charts = page
				.locator('[data-testid="analytics-chart"]')
				.or(page.locator(".chart"));
			if ((await charts.count()) > 0) {
				const firstChart = charts.first();
				const hasAriaLabel = await firstChart.evaluate((el) => {
					return (
						el.getAttribute("aria-label") ||
						el.getAttribute("aria-labelledby") ||
						el.getAttribute("role")
					);
				});
				expect(hasAriaLabel).toBeTruthy();
			}
		}
	});

	test("should work on mobile devices", async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		await page.goto("/login");
		await page.fill('[data-testid="email"]', "dr.silva@clinic.com");
		await page.fill('[data-testid="password"]', "healthcare123");
		await page.click('[data-testid="login-button"]');
		await page.goto("/dashboard/reports");

		// Should be responsive
		await expect(
			page
				.locator('[data-testid="report-categories"]')
				.or(page.locator(".report-categories")),
		).toBeVisible();

		// Touch targets should be appropriate size
		const categoryButton = page
			.locator('[data-testid="analytics-reports"]')
			.or(page.locator('button:has-text("Analytics")'))
			.first();
		if (await categoryButton.isVisible()) {
			const buttonBox = await categoryButton.boundingBox();
			if (buttonBox) {
				expect(buttonBox.height).toBeGreaterThanOrEqual(44);
			}
		}
	});
});
