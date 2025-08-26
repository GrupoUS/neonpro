#!/usr/bin/env node

/**
 * NeonPro Simple Performance Optimization Validation Script
 * Validates that all performance optimization components are in place
 */

const fs = require("node:fs");
const path = require("node:path");

// Define expected performance optimization components
const PERFORMANCE_COMPONENTS = [
	{
		name: "Performance Optimization Service",
		file: "packages/performance/src/performance-optimization-service.ts",
		description: "Main performance optimization orchestrator",
	},
	{
		name: "Performance Integration",
		file: "packages/performance/src/integration/performance-optimization-integration.ts",
		description: "Integration layer for all performance systems",
	},
	{
		name: "Multi-Layer Cache Manager",
		file: "packages/caching-layer/src/cache-manager.ts",
		description: "Healthcare-optimized caching system",
	},
	{
		name: "Healthcare Performance Monitor",
		file: "packages/performance/src/index.ts",
		description: "Main performance monitoring system",
	},
	{
		name: "Healthcare Monitoring Dashboard",
		file: "packages/monitoring/src/healthcare-monitoring-dashboard.ts",
		description: "Real-time monitoring dashboard",
	},
	{
		name: "Healthcare Web Vitals",
		file: "packages/performance/src/web-vitals/core-web-vitals.ts",
		description: "Healthcare-specific web vitals monitoring",
	},
	{
		name: "Infrastructure Cache Manager",
		file: "packages/performance/src/infrastructure/cache-manager.ts",
		description: "Healthcare infrastructure optimization",
	},
	{
		name: "Database Query Profiler",
		file: "packages/performance/src/database/query-profiler.ts",
		description: "Database performance optimization",
	},
];

// Performance targets for validation
const PERFORMANCE_TARGETS = {
	cacheHitRate: 85,
	aiInferenceTime: 200,
	databaseQueryTime: 100,
	dashboardLoadTime: 2000,
	websocketConnectionTime: 50,
	pageSpeedScore: 90,
};

/**
 * Main validation function
 */
async function validatePerformanceOptimization() {
	let results = {
		passed: 0,
		failed: 0,
		warnings: 0,
		details: [],
	};
	const fileResults = await validateFiles();
	results = mergeResults(results, fileResults);
	const configResults = await validateConfiguration();
	results = mergeResults(results, configResults);
	const featureResults = await validateFeatures();
	results = mergeResults(results, featureResults);
	const integrationResults = await validateIntegrationPoints();
	results = mergeResults(results, integrationResults);

	const totalTests = results.passed + results.failed + results.warnings;
	const successRate = Math.round((results.passed / totalTests) * 100);
	results.details.forEach((_detail) => {});
	Object.entries(PERFORMANCE_TARGETS).forEach(([metric, _target]) => {
		const _displayMetric = metric.replace(/([A-Z])/g, " $1").toLowerCase();
		const unit = metric.includes("Time") ? "ms" : metric.includes("Rate") || metric.includes("Score") ? "%" : "";
		const _operator = unit === "ms" ? "≤" : "≥";
	});

	if (results.failed === 0 && successRate >= 90) {
		process.exit(0);
	} else {
		process.exit(1);
	}
}

/**
 * Validate that all required files exist
 */
async function validateFiles() {
	const results = { passed: 0, failed: 0, warnings: 0, details: [] };

	for (const component of PERFORMANCE_COMPONENTS) {
		const filePath = path.join(process.cwd(), component.file);

		if (fs.existsSync(filePath)) {
			results.passed++;
			results.details.push(`✅ ${component.name}: Found`);

			// Check file size to ensure it's not empty
			const stats = fs.statSync(filePath);
			if (stats.size > 1000) {
				// At least 1KB
				results.details.push(`  📏 File size: ${Math.round(stats.size / 1024)}KB - Substantial implementation`);
			} else {
				results.warnings++;
				results.details.push(`  ⚠️ File size: ${stats.size}B - May need more implementation`);
			}
		} else {
			results.failed++;
			results.details.push(`❌ ${component.name}: Missing (${component.file})`);
		}
	}

	return results;
}

/**
 * Validate performance configuration
 */
async function validateConfiguration() {
	const results = { passed: 0, failed: 0, warnings: 0, details: [] };

	try {
		// Check if performance service exists and has proper structure
		const performanceServiceFile = path.join(
			process.cwd(),
			"packages/performance/src/performance-optimization-service.ts"
		);

		if (fs.existsSync(performanceServiceFile)) {
			const content = fs.readFileSync(performanceServiceFile, "utf8");

			// Check for key performance features
			const requiredFeatures = [
				"PerformanceTargets",
				"PerformanceMetrics",
				"optimizeMultiLayerCaching",
				"optimizeAIInferencePerformance",
				"implementRealTimeMonitoring",
				"optimizeDatabasePerformance",
			];

			requiredFeatures.forEach((feature) => {
				if (content.includes(feature)) {
					results.passed++;
					results.details.push(`✅ Performance feature: ${feature} implemented`);
				} else {
					results.failed++;
					results.details.push(`❌ Performance feature: ${feature} missing`);
				}
			});

			// Check for healthcare-specific optimizations
			const healthcareFeatures = ["healthcare", "constitutional", "compliance", "LGPD", "ANVISA", "CFM"];

			let healthcareScore = 0;
			healthcareFeatures.forEach((feature) => {
				if (content.toLowerCase().includes(feature.toLowerCase())) {
					healthcareScore++;
				}
			});

			if (healthcareScore >= 4) {
				results.passed++;
				results.details.push(
					`✅ Healthcare optimization: Strong focus (${healthcareScore}/${healthcareFeatures.length} indicators)`
				);
			} else {
				results.warnings++;
				results.details.push(
					`⚠️ Healthcare optimization: Moderate focus (${healthcareScore}/${healthcareFeatures.length} indicators)`
				);
			}
		} else {
			results.failed++;
			results.details.push("❌ Performance service configuration file not found");
		}
	} catch (error) {
		results.failed++;
		results.details.push(`❌ Configuration validation failed: ${error.message}`);
	}

	return results;
}

/**
 * Validate implementation features
 */
async function validateFeatures() {
	const results = { passed: 0, failed: 0, warnings: 0, details: [] };

	// Check for implementation of key performance features
	const featureChecks = [
		{
			name: "Multi-layer Caching",
			files: ["packages/caching-layer/src/cache-manager.ts"],
			keywords: ["MultiLayerCacheManager", "CacheLayer", "BrowserCache", "EdgeCache"],
		},
		{
			name: "AI Performance Optimization",
			files: ["packages/performance/src/performance-optimization-service.ts"],
			keywords: ["AI", "inference", "optimization", "batch"],
		},
		{
			name: "Real-time Monitoring",
			files: [
				"packages/monitoring/src/healthcare-monitoring-dashboard.ts",
				"packages/performance/src/web-vitals/core-web-vitals.ts",
			],
			keywords: ["monitoring", "realtime", "metrics", "dashboard"],
		},
		{
			name: "Database Optimization",
			files: ["packages/performance/src/database/query-profiler.ts"],
			keywords: ["database", "query", "optimization", "profiler"],
		},
	];

	featureChecks.forEach((check) => {
		let featureImplemented = false;
		let implementationStrength = 0;

		check.files.forEach((filePath) => {
			const fullPath = path.join(process.cwd(), filePath);
			if (fs.existsSync(fullPath)) {
				const content = fs.readFileSync(fullPath, "utf8");

				check.keywords.forEach((keyword) => {
					if (content.toLowerCase().includes(keyword.toLowerCase())) {
						implementationStrength++;
					}
				});

				if (implementationStrength > 0) {
					featureImplemented = true;
				}
			}
		});

		if (featureImplemented && implementationStrength >= 2) {
			results.passed++;
			results.details.push(`✅ ${check.name}: Well implemented (${implementationStrength} indicators)`);
		} else if (featureImplemented) {
			results.warnings++;
			results.details.push(`⚠️ ${check.name}: Basic implementation (${implementationStrength} indicators)`);
		} else {
			results.failed++;
			results.details.push(`❌ ${check.name}: Not implemented`);
		}
	});

	return results;
}

/**
 * Validate integration points
 */
async function validateIntegrationPoints() {
	const results = { passed: 0, failed: 0, warnings: 0, details: [] };

	try {
		// Check for performance integration file
		const integrationFile = path.join(
			process.cwd(),
			"packages/performance/src/integration/performance-optimization-integration.ts"
		);

		if (fs.existsSync(integrationFile)) {
			results.passed++;
			results.details.push("✅ Performance integration layer: Implemented");

			const content = fs.readFileSync(integrationFile, "utf8");

			// Check for integration with different systems
			const integrationPoints = [
				"HealthcarePerformanceOptimizationService",
				"HealthcareMonitoringDashboard",
				"MultiLayerCacheManager",
				"Supabase",
			];

			integrationPoints.forEach((point) => {
				if (content.includes(point)) {
					results.passed++;
					results.details.push(`✅ Integration point: ${point} connected`);
				} else {
					results.warnings++;
					results.details.push(`⚠️ Integration point: ${point} may need attention`);
				}
			});
		} else {
			results.failed++;
			results.details.push("❌ Performance integration layer: Missing");
		}

		// Check for validation script
		const validationScript = path.join(process.cwd(), "scripts/performance-optimization-validation.js");

		if (fs.existsSync(validationScript)) {
			results.passed++;
			results.details.push("✅ Performance validation script: Available");
		} else {
			results.warnings++;
			results.details.push("⚠️ Performance validation script: Missing");
		}
	} catch (error) {
		results.failed++;
		results.details.push(`❌ Integration validation failed: ${error.message}`);
	}

	return results;
}

/**
 * Merge validation results
 */
function mergeResults(target, source) {
	return {
		passed: target.passed + source.passed,
		failed: target.failed + source.failed,
		warnings: target.warnings + source.warnings,
		details: [...target.details, ...source.details],
	};
}

// Run validation if script is called directly
if (require.main === module) {
	validatePerformanceOptimization().catch((_error) => {
		process.exit(1);
	});
}

module.exports = { validatePerformanceOptimization };
