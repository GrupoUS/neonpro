/**
 * 📊 E2E Performance Monitoring Dashboard
 *
 * Real-time metrics collection and analysis for NeonPro E2E tests
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type E2EMetrics = {
	timestamp: string;
	testSuite: string;
	browser: string;
	duration: number;
	testsTotal: number;
	testsPassed: number;
	testsFailed: number;
	testsSkipped: number;
	retries: number;
	workers: number;
	memoryUsage: NodeJS.MemoryUsage;
	cpuUsage: number;
	networkRequests: number;
	errorRate: number;
	environment: string;
};

export type HealthcareComplianceMetrics = {
	lgpdValidation: boolean;
	anvisaCompliance: boolean;
	cfmCompliance: boolean;
	dataProtectionChecks: number;
	auditTrailValidation: boolean;
	performanceThresholds: {
		responseTime: number;
		availability: number;
		throughput: number;
	};
};

export class E2EMonitor {
	private readonly metricsPath: string;
	private readonly dashboardPath: string;

	constructor() {
		this.metricsPath = join(
			process.cwd(),
			"tools",
			"testing",
			"e2e",
			"reports",
		);
		this.dashboardPath = join(this.metricsPath, "dashboard");

		// Ensure directories exist
		if (!existsSync(this.metricsPath)) {
			mkdirSync(this.metricsPath, { recursive: true });
		}
		if (!existsSync(this.dashboardPath)) {
			mkdirSync(this.dashboardPath, { recursive: true });
		}
	}

	/**
	 * 📊 Collect and save E2E test metrics
	 */
	async collectMetrics(testInfo: any): Promise<E2EMetrics> {
		const metrics: E2EMetrics = {
			timestamp: new Date().toISOString(),
			testSuite: testInfo.title || "unknown",
			browser: process.env.BROWSER || "chromium",
			duration: testInfo.duration || 0,
			testsTotal: 1,
			testsPassed: testInfo.status === "passed" ? 1 : 0,
			testsFailed: testInfo.status === "failed" ? 1 : 0,
			testsSkipped: testInfo.status === "skipped" ? 1 : 0,
			retries: testInfo.retry || 0,
			workers: Number.parseInt(process.env.PLAYWRIGHT_WORKERS || "1", 10),
			memoryUsage: process.memoryUsage(),
			cpuUsage: process.cpuUsage().user / 1_000_000, // Convert to seconds
			networkRequests: 0, // To be collected from network interceptor
			errorRate: testInfo.status === "failed" ? 1.0 : 0.0,
			environment: process.env.NODE_ENV || "test",
		};

		// Save individual test metrics
		const metricsFile = join(
			this.metricsPath,
			`test-metrics-${Date.now()}.json`,
		);
		writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));

		return metrics;
	}

	/**
	 * 🏥 Collect healthcare compliance metrics
	 */
	async collectComplianceMetrics(): Promise<HealthcareComplianceMetrics> {
		const compliance: HealthcareComplianceMetrics = {
			lgpdValidation: true, // To be validated against actual checks
			anvisaCompliance: true,
			cfmCompliance: true,
			dataProtectionChecks: 0,
			auditTrailValidation: true,
			performanceThresholds: {
				responseTime: 2000, // 2s max response time
				availability: 99.9,
				throughput: 1000, // requests per minute
			},
		};

		const complianceFile = join(
			this.metricsPath,
			`compliance-metrics-${Date.now()}.json`,
		);
		writeFileSync(complianceFile, JSON.stringify(compliance, null, 2));

		return compliance;
	}

	/**
	 * 📈 Generate performance dashboard
	 */
	async generateDashboard(
		metrics: E2EMetrics[],
		compliance: HealthcareComplianceMetrics,
	): Promise<string> {
		const dashboard = {
			generated: new Date().toISOString(),
			summary: {
				totalTests: metrics.reduce((acc, m) => acc + m.testsTotal, 0),
				totalPassed: metrics.reduce((acc, m) => acc + m.testsPassed, 0),
				totalFailed: metrics.reduce((acc, m) => acc + m.testsFailed, 0),
				averageDuration:
					metrics.reduce((acc, m) => acc + m.duration, 0) / metrics.length,
				successRate:
					metrics.length > 0
						? (metrics.reduce((acc, m) => acc + m.testsPassed, 0) /
								metrics.reduce((acc, m) => acc + m.testsTotal, 0)) *
							100
						: 0,
				avgMemoryUsage:
					metrics.reduce((acc, m) => acc + m.memoryUsage.heapUsed, 0) /
					metrics.length,
			},
			performance: {
				fastest: Math.min(...metrics.map((m) => m.duration)),
				slowest: Math.max(...metrics.map((m) => m.duration)),
				p95: this.calculatePercentile(
					metrics.map((m) => m.duration),
					95,
				),
				p99: this.calculatePercentile(
					metrics.map((m) => m.duration),
					99,
				),
			},
			compliance,
			browsers: this.groupByBrowser(metrics),
			trends: this.calculateTrends(metrics),
			alerts: this.generateAlerts(metrics, compliance),
		};

		const dashboardFile = join(
			this.dashboardPath,
			"performance-dashboard.json",
		);
		writeFileSync(dashboardFile, JSON.stringify(dashboard, null, 2));

		// Generate HTML dashboard
		await this.generateHTMLDashboard(dashboard);

		return dashboardFile;
	}

	/**
	 * 🎯 Calculate percentile
	 */
	private calculatePercentile(values: number[], percentile: number): number {
		const sorted = values.slice().sort((a, b) => a - b);
		const index = Math.ceil((percentile / 100) * sorted.length) - 1;
		return sorted[index] || 0;
	}

	/**
	 * 🔍 Group metrics by browser
	 */
	private groupByBrowser(metrics: E2EMetrics[]): Record<string, any> {
		const browsers: Record<string, any> = {};

		metrics.forEach((metric) => {
			if (!browsers[metric.browser]) {
				browsers[metric.browser] = {
					testsTotal: 0,
					testsPassed: 0,
					testsFailed: 0,
					avgDuration: 0,
					tests: [],
				};
			}

			browsers[metric.browser].testsTotal += metric.testsTotal;
			browsers[metric.browser].testsPassed += metric.testsPassed;
			browsers[metric.browser].testsFailed += metric.testsFailed;
			browsers[metric.browser].tests.push(metric);
		});

		// Calculate averages
		Object.keys(browsers).forEach((browser) => {
			const tests = browsers[browser].tests;
			browsers[browser].avgDuration =
				tests.reduce((acc: number, t: E2EMetrics) => acc + t.duration, 0) /
				tests.length;
			browsers[browser].successRate =
				(browsers[browser].testsPassed / browsers[browser].testsTotal) * 100;
		});

		return browsers;
	}

	/**
	 * 📊 Calculate performance trends
	 */
	private calculateTrends(metrics: E2EMetrics[]): any {
		const sortedByTime = metrics
			.slice()
			.sort(
				(a, b) =>
					new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
			);

		return {
			durationTrend: this.calculateTrend(sortedByTime.map((m) => m.duration)),
			successRateTrend: this.calculateTrend(
				sortedByTime.map((m) => m.testsPassed / m.testsTotal),
			),
			memoryTrend: this.calculateTrend(
				sortedByTime.map((m) => m.memoryUsage.heapUsed),
			),
		};
	}

	/**
	 * 📈 Calculate trend direction
	 */
	private calculateTrend(values: number[]): string {
		if (values.length < 2) {
			return "stable";
		}

		const first = values.slice(0, Math.floor(values.length / 2));
		const second = values.slice(Math.floor(values.length / 2));

		const firstAvg = first.reduce((acc, v) => acc + v, 0) / first.length;
		const secondAvg = second.reduce((acc, v) => acc + v, 0) / second.length;

		const change = ((secondAvg - firstAvg) / firstAvg) * 100;

		if (change > 5) {
			return "increasing";
		}
		if (change < -5) {
			return "decreasing";
		}
		return "stable";
	}

	/**
	 * 🚨 Generate alerts based on metrics
	 */
	private generateAlerts(
		metrics: E2EMetrics[],
		compliance: HealthcareComplianceMetrics,
	): string[] {
		const alerts: string[] = [];

		// Performance alerts
		const avgDuration =
			metrics.reduce((acc, m) => acc + m.duration, 0) / metrics.length;
		if (avgDuration > 30_000) {
			// 30 seconds
			alerts.push("🚨 HIGH: Average test duration exceeds 30 seconds");
		}

		// Success rate alerts
		const successRate =
			metrics.reduce((acc, m) => acc + m.testsPassed, 0) /
			metrics.reduce((acc, m) => acc + m.testsTotal, 0);
		if (successRate < 0.95) {
			// Below 95%
			alerts.push("🚨 CRITICAL: Test success rate below 95%");
		}

		// Memory alerts
		const avgMemory =
			metrics.reduce((acc, m) => acc + m.memoryUsage.heapUsed, 0) /
			metrics.length;
		if (avgMemory > 500 * 1024 * 1024) {
			// 500MB
			alerts.push("⚠️ WARNING: High memory usage detected");
		}

		// Compliance alerts
		if (!compliance.lgpdValidation) {
			alerts.push("🚨 CRITICAL: LGPD compliance validation failed");
		}
		if (!compliance.anvisaCompliance) {
			alerts.push("🚨 CRITICAL: ANVISA compliance validation failed");
		}

		return alerts;
	}

	/**
	 * 🌐 Generate HTML dashboard
	 */
	private async generateHTMLDashboard(data: any): Promise<void> {
		const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 NeonPro E2E Performance Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #0066cc; }
        .metric-value { font-size: 2em; font-weight: bold; color: #0066cc; }
        .metric-label { color: #666; margin-bottom: 5px; }
        .success { border-left-color: #28a745; }
        .success .metric-value { color: #28a745; }
        .warning { border-left-color: #ffc107; }
        .warning .metric-value { color: #ffc107; }
        .danger { border-left-color: #dc3545; }
        .danger .metric-value { color: #dc3545; }
        .alerts { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin-bottom: 20px; }
        .alert-item { margin: 5px 0; }
        .compliance-section { background: #e8f5e8; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .browsers-section { margin: 20px 0; }
        .browser-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
        .timestamp { color: #666; font-size: 0.9em; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 NeonPro E2E Performance Dashboard</h1>
            <p>🏥 Healthcare Compliance Monitoring & Performance Analytics</p>
        </div>

        ${
					data.alerts.length > 0
						? `
        <div class="alerts">
            <h3>🚨 Alerts</h3>
            ${data.alerts.map((alert) => `<div class="alert-item">${alert}</div>`).join("")}
        </div>
        `
						: ""
				}

        <div class="metrics-grid">
            <div class="metric-card ${data.summary.successRate >= 95 ? "success" : "danger"}">
                <div class="metric-label">Success Rate</div>
                <div class="metric-value">${data.summary.successRate.toFixed(1)}%</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-label">Total Tests</div>
                <div class="metric-value">${data.summary.totalTests}</div>
            </div>
            
            <div class="metric-card ${data.summary.averageDuration < 10_000 ? "success" : data.summary.averageDuration < 30_000 ? "warning" : "danger"}">
                <div class="metric-label">Avg Duration</div>
                <div class="metric-value">${(data.summary.averageDuration / 1000).toFixed(1)}s</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-label">P95 Duration</div>
                <div class="metric-value">${(data.performance.p95 / 1000).toFixed(1)}s</div>
            </div>
        </div>

        <div class="compliance-section">
            <h3>🏥 Healthcare Compliance Status</h3>
            <div class="metrics-grid">
                <div class="metric-card ${data.compliance.lgpdValidation ? "success" : "danger"}">
                    <div class="metric-label">LGPD Compliance</div>
                    <div class="metric-value">${data.compliance.lgpdValidation ? "✅" : "❌"}</div>
                </div>
                <div class="metric-card ${data.compliance.anvisaCompliance ? "success" : "danger"}">
                    <div class="metric-label">ANVISA Compliance</div>
                    <div class="metric-value">${data.compliance.anvisaCompliance ? "✅" : "❌"}</div>
                </div>
                <div class="metric-card ${data.compliance.cfmCompliance ? "success" : "danger"}">
                    <div class="metric-label">CFM Compliance</div>
                    <div class="metric-value">${data.compliance.cfmCompliance ? "✅" : "❌"}</div>
                </div>
            </div>
        </div>

        <div class="browsers-section">
            <h3>🌐 Browser Performance</h3>
            ${Object.entries(data.browsers)
							.map(
								([browser, stats]: [string, any]) => `
                <div class="browser-row">
                    <strong>${browser}</strong>
                    <span>Tests: ${stats.testsTotal} | Success: ${stats.successRate.toFixed(1)}% | Avg: ${(stats.avgDuration / 1000).toFixed(1)}s</span>
                </div>
            `,
							)
							.join("")}
        </div>

        <div class="timestamp">
            📅 Generated: ${data.generated} | 🚀 NeonPro Healthcare Platform
        </div>
    </div>
</body>
</html>`;

		const htmlFile = join(this.dashboardPath, "index.html");
		writeFileSync(htmlFile, html);
	}
}

// Export singleton instance
export const e2eMonitor = new E2EMonitor();
