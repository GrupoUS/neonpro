/**
 * Performance Test Runner for NeonPro Healthcare
 *
 * Orchestrates all performance tests and generates comprehensive reports
 */

import fs from "fs/promises";
import path from "path";
import { ApiPerformanceTester } from "./analysis/api-performance";
import { BundleOptimizer } from "./analysis/bundle-optimizer";
import { DatabasePerformanceTester } from "./analysis/database-performance";
import { FrontendPerformanceTester } from "./analysis/frontend-performance";
import { PerformanceAuditor } from "./analysis/performance-audit";

export interface PerformanceTestConfig {
	baseUrl: string;
	apiUrl: string;
	buildPath: string;
	outputPath: string;
	testDuration: number;
	concurrentUsers: number;
}

export interface ComprehensivePerformanceReport {
	timestamp: string;
	testConfig: PerformanceTestConfig;
	lighthouse: any;
	healthcare: any;
	database: any;
	api: any;
	frontend: any;
	bundle: any;
	summary: PerformanceSummary;
	recommendations: string[];
	passedTests: string[];
	failedTests: string[];
}

export interface PerformanceSummary {
	overallScore: number;
	criticalIssues: number;
	warnings: number;
	passedTargets: number;
	totalTargets: number;
}

export class PerformanceTestRunner {
	private config: PerformanceTestConfig;
	private outputDir: string;

	constructor(config: PerformanceTestConfig) {
		this.config = config;
		this.outputDir = config.outputPath;
	}

	/**
	 * Run comprehensive performance test suite
	 */
	async runAll(): Promise<ComprehensivePerformanceReport> {
		console.log("🚀 Starting NeonPro Healthcare Performance Test Suite...\n");

		await fs.mkdir(this.outputDir, { recursive: true });

		const report: ComprehensivePerformanceReport = {
			timestamp: new Date().toISOString(),
			testConfig: this.config,
			lighthouse: null,
			healthcare: null,
			database: null,
			api: null,
			frontend: null,
			bundle: null,
			summary: {
				overallScore: 0,
				criticalIssues: 0,
				warnings: 0,
				passedTargets: 0,
				totalTargets: 0,
			},
			recommendations: [],
			passedTests: [],
			failedTests: [],
		};

		try {
			// 1. Lighthouse Performance Audit
			console.log("📊 Running Lighthouse Performance Audit...");
			report.lighthouse = await this.runLighthouseTests();

			// 2. Database Performance Tests
			console.log("💾 Testing Database Performance...");
			report.database = await this.runDatabaseTests();

			// 3. API Performance Tests
			console.log("🌐 Testing API Performance...");
			report.api = await this.runApiTests();

			// 4. Frontend Performance Tests
			console.log("⚛️ Testing Frontend Performance...");
			report.frontend = await this.runFrontendTests();

			// 5. Bundle Analysis
			console.log("📦 Analyzing Bundle Performance...");
			report.bundle = await this.runBundleAnalysis();

			// 6. Healthcare-Specific Tests
			console.log("🏥 Testing Healthcare-Specific Performance...");
			report.healthcare = await this.runHealthcareTests();

			// Generate summary and recommendations
			report.summary = this.generateSummary(report);
			report.recommendations = this.generateRecommendations(report);

			// Save comprehensive report
			await this.saveReport(report);

			console.log("\n✅ Performance test suite completed!");
			console.log(`📋 Report saved to: ${this.outputDir}/performance-report.json`);

			return report;
		} catch (error) {
			console.error("❌ Performance test suite failed:", error);
			throw error;
		}
	}
	private async runLighthouseTests(): Promise<any> {
		const auditor = new PerformanceAuditor();
		await auditor.initialize();

		try {
			const result = await auditor.runLighthouseAudit(this.config.baseUrl);

			// Check performance targets
			if (result.performance >= 90) {
				this.addPassedTest("Lighthouse Performance Score ≥90");
			} else {
				this.addFailedTest(`Lighthouse Performance Score: ${result.performance}/100 (target: ≥90)`);
			}

			return result;
		} finally {
			await auditor.cleanup();
		}
	}

	private async runDatabaseTests(): Promise<any> {
		const dbTester = new DatabasePerformanceTester();

		const connectionTime = await dbTester.testConnectionPerformance();
		const healthcareMetrics = await dbTester.testHealthcareQueries();

		// Check database performance targets
		if (connectionTime < 100) {
			this.addPassedTest("Database Connection Time <100ms");
		} else {
			this.addFailedTest(`Database Connection Time: ${connectionTime}ms (target: <100ms)`);
		}

		if (healthcareMetrics.emergencyDataAccessTime < 10_000) {
			this.addPassedTest("Emergency Data Access <10s");
		} else {
			this.addFailedTest(`Emergency Data Access: ${healthcareMetrics.emergencyDataAccessTime}ms (target: <10s)`);
		}

		return {
			connectionTime,
			healthcareMetrics,
		};
	}

	private async runApiTests(): Promise<any> {
		const apiTester = new ApiPerformanceTester(this.config.apiUrl);

		const healthcareEndpoints = await apiTester.testHealthcareEndpoints();
		const loadTestResults = await apiTester.runLoadTest({
			baseUrl: this.config.apiUrl,
			concurrentUsers: this.config.concurrentUsers,
			duration: this.config.testDuration,
			rampUpTime: 30,
		});

		// Check API performance targets
		if (loadTestResults.responseTime.p95 < 100) {
			this.addPassedTest("API P95 Response Time <100ms");
		} else {
			this.addFailedTest(`API P95 Response Time: ${loadTestResults.responseTime.p95}ms (target: <100ms)`);
		}

		return {
			healthcareEndpoints,
			loadTestResults,
		};
	}
	private async runFrontendTests(): Promise<any> {
		const frontendTester = new FrontendPerformanceTester();
		await frontendTester.initialize();

		try {
			const webVitals = await frontendTester.measureCoreWebVitals(this.config.baseUrl);

			// Check Core Web Vitals targets
			if (webVitals.lcp < 2500) {
				this.addPassedTest("LCP <2.5s");
			} else {
				this.addFailedTest(`LCP: ${webVitals.lcp}ms (target: <2.5s)`);
			}

			if (webVitals.cls < 0.1) {
				this.addPassedTest("CLS <0.1");
			} else {
				this.addFailedTest(`CLS: ${webVitals.cls} (target: <0.1)`);
			}

			return { webVitals };
		} finally {
			await frontendTester.cleanup();
		}
	}

	private async runBundleAnalysis(): Promise<any> {
		const bundleOptimizer = new BundleOptimizer(this.config.buildPath, this.outputDir);
		const analysis = await bundleOptimizer.analyzeBundles();

		// Check bundle size targets
		if (analysis.gzippedSize < 500 * 1024) {
			// 500KB
			this.addPassedTest("Bundle Size <500KB (gzipped)");
		} else {
			this.addFailedTest(`Bundle Size: ${Math.round(analysis.gzippedSize / 1024)}KB (target: <500KB)`);
		}

		await bundleOptimizer.generateReport(analysis);
		return analysis;
	}

	private async runHealthcareTests(): Promise<any> {
		const auditor = new PerformanceAuditor();
		await auditor.initialize();

		try {
			const healthcareMetrics = await auditor.testHealthcareMetrics(this.config.baseUrl);

			// Check healthcare-specific targets
			if (healthcareMetrics.emergencyAccessTime < 10_000) {
				this.addPassedTest("Emergency Access <10s");
			} else {
				this.addFailedTest(`Emergency Access: ${healthcareMetrics.emergencyAccessTime}ms (target: <10s)`);
			}

			if (healthcareMetrics.patientDataLoadTime < 2000) {
				this.addPassedTest("Patient Data Loading <2s");
			} else {
				this.addFailedTest(`Patient Data Loading: ${healthcareMetrics.patientDataLoadTime}ms (target: <2s)`);
			}

			return healthcareMetrics;
		} finally {
			await auditor.cleanup();
		}
	}
	private passedTests: string[] = [];
	private failedTests: string[] = [];

	private addPassedTest(test: string): void {
		this.passedTests.push(test);
	}

	private addFailedTest(test: string): void {
		this.failedTests.push(test);
	}

	private generateSummary(report: ComprehensivePerformanceReport): PerformanceSummary {
		const totalTargets = this.passedTests.length + this.failedTests.length;
		const passedTargets = this.passedTests.length;
		const overallScore = totalTargets > 0 ? Math.round((passedTargets / totalTargets) * 100) : 0;

		let criticalIssues = 0;
		let warnings = 0;

		// Analyze for critical issues
		if (report.lighthouse?.performance < 90) criticalIssues++;
		if (report.healthcare?.emergencyAccessTime > 10_000) criticalIssues++;
		if (report.api?.loadTestResults?.errorRate > 0.05) criticalIssues++;

		// Analyze for warnings
		if (report.bundle?.gzippedSize > 400 * 1024) warnings++;
		if (report.frontend?.webVitals?.lcp > 2000) warnings++;
		if (report.database?.connectionTime > 50) warnings++;

		return {
			overallScore,
			criticalIssues,
			warnings,
			passedTargets,
			totalTargets,
		};
	}

	private generateRecommendations(report: ComprehensivePerformanceReport): string[] {
		const recommendations: string[] = [];

		// Performance recommendations
		if (report.lighthouse?.performance < 90) {
			recommendations.push("Improve Lighthouse performance score through image optimization and code splitting");
		}

		if (report.bundle?.gzippedSize > 500 * 1024) {
			recommendations.push("Reduce bundle size through tree shaking and lazy loading");
		}

		if (report.api?.loadTestResults?.responseTime?.p95 > 100) {
			recommendations.push("Optimize API endpoints to achieve <100ms P95 response time");
		}

		if (report.database?.healthcareMetrics?.emergencyDataAccessTime > 5000) {
			recommendations.push("Critical: Optimize emergency data access queries for patient safety");
		}

		// Healthcare-specific recommendations
		if (report.healthcare?.patientDataLoadTime > 2000) {
			recommendations.push("Optimize patient data loading with caching and query optimization");
		}

		return recommendations;
	}

	private async saveReport(report: ComprehensivePerformanceReport): Promise<void> {
		// Save JSON report
		const jsonPath = path.join(this.outputDir, "performance-report.json");
		await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));

		// Save human-readable report
		const markdownPath = path.join(this.outputDir, "performance-report.md");
		const markdown = this.generateMarkdownReport(report);
		await fs.writeFile(markdownPath, markdown);

		// Save CSV summary for tracking
		const csvPath = path.join(this.outputDir, "performance-metrics.csv");
		const csv = this.generateCsvReport(report);
		await fs.writeFile(csvPath, csv);
	}

	private generateMarkdownReport(report: ComprehensivePerformanceReport): string {
		const { summary, passedTests, failedTests, recommendations } = report;

		let markdown = "# NeonPro Healthcare Performance Report\n\n";
		markdown += `**Generated:** ${report.timestamp}\n`;
		markdown += `**Overall Score:** ${summary.overallScore}/100\n\n`;

		markdown += "## Summary\n";
		markdown += `- ✅ Passed Tests: ${summary.passedTargets}/${summary.totalTargets}\n`;
		markdown += `- 🚨 Critical Issues: ${summary.criticalIssues}\n`;
		markdown += `- ⚠️ Warnings: ${summary.warnings}\n\n`;

		if (passedTests.length > 0) {
			markdown += "## ✅ Passed Tests\n";
			passedTests.forEach((test) => (markdown += `- ${test}\n`));
			markdown += "\n";
		}

		if (failedTests.length > 0) {
			markdown += "## ❌ Failed Tests\n";
			failedTests.forEach((test) => (markdown += `- ${test}\n`));
			markdown += "\n";
		}

		if (recommendations.length > 0) {
			markdown += "## 📋 Recommendations\n";
			recommendations.forEach((rec) => (markdown += `- ${rec}\n`));
		}

		return markdown;
	}

	private generateCsvReport(report: ComprehensivePerformanceReport): string {
		const csv = [
			"Metric,Value,Target,Status",
			`Lighthouse Performance,${report.lighthouse?.performance || 0},90,${report.lighthouse?.performance >= 90 ? "PASS" : "FAIL"}`,
			`Bundle Size (KB),${Math.round((report.bundle?.gzippedSize || 0) / 1024)},500,${(report.bundle?.gzippedSize || 0) < 500 * 1024 ? "PASS" : "FAIL"}`,
			`API P95 (ms),${report.api?.loadTestResults?.responseTime?.p95 || 0},100,${(report.api?.loadTestResults?.responseTime?.p95 || 0) < 100 ? "PASS" : "FAIL"}`,
			`Emergency Access (ms),${report.healthcare?.emergencyAccessTime || 0},10000,${(report.healthcare?.emergencyAccessTime || 0) < 10_000 ? "PASS" : "FAIL"}`,
		];

		return csv.join("\n");
	}
}
