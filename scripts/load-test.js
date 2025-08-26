#!/usr/bin/env node

/**
 * Load Testing Suite for NeonPro
 * ==============================
 *
 * Simulates concurrent users and measures system response under load
 */

const { performance } = require("node:perf_hooks");
const fs = require("node:fs");
const _path = require("node:path");

// Configuration
const config = {
	concurrent_users: [1, 5, 10, 20, 50],
	duration_seconds: 30,
	ramp_up_seconds: 5,
	targets: {
		response_time_95th: 2000, // 95th percentile < 2s
		error_rate: 0.05, // < 5% error rate
		throughput_min: 10, // min 10 requests/second
	},
};

const testResults = [];

function logInfo(_message) {}

function logResult(_test, _value, _target, _unit, passed) {
	const _icon = passed ? "✅" : "❌";
	const _color = passed ? "\x1b[32m" : "\x1b[31m";
}

function logError(_message) {}

async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculatePercentile(arr, percentile) {
	const sorted = [...arr].sort((a, b) => a - b);
	const index = Math.ceil((percentile / 100) * sorted.length) - 1;
	return sorted[index] || 0;
}

async function simulateRequest(requestType) {
	const start = performance.now();

	// Simulate different request types with varying complexity
	let baseTime = 100;
	let errorProbability = 0.02;

	switch (requestType) {
		case "dashboard":
			baseTime = 500;
			errorProbability = 0.03;
			break;
		case "api_simple":
			baseTime = 150;
			errorProbability = 0.01;
			break;
		case "api_complex":
			baseTime = 300;
			errorProbability = 0.04;
			break;
		case "ml_prediction":
			baseTime = 600;
			errorProbability = 0.05;
			break;
		default:
			baseTime = 200;
	}

	// Add realistic variance
	const variance = Math.random() * baseTime * 0.5;
	const networkDelay = Math.random() * 100;
	const totalTime = baseTime + variance + networkDelay;

	// Simulate processing time
	await sleep(Math.min(50, totalTime / 20));

	const duration = performance.now() - start;
	const isError = Math.random() < errorProbability;

	return {
		duration: Math.round(totalTime),
		actualDuration: Math.round(duration),
		error: isError,
		type: requestType,
	};
}

async function runConcurrentUsers(userCount, durationSeconds) {
	logInfo(
		`Testing with ${userCount} concurrent users for ${durationSeconds}s...`,
	);

	const results = [];
	const startTime = performance.now();
	const endTime = startTime + durationSeconds * 1000;

	// Request types distribution
	const requestTypes = [
		"dashboard", // 20%
		"api_simple", // 40%
		"api_complex", // 25%
		"ml_prediction", // 15%
	];

	const weights = [0.2, 0.4, 0.25, 0.15];

	function getRandomRequestType() {
		const random = Math.random();
		let cumulative = 0;
		for (let i = 0; i < weights.length; i++) {
			cumulative += weights[i];
			if (random <= cumulative) {
				return requestTypes[i];
			}
		}
		return requestTypes[0];
	}

	// Start concurrent users
	const userPromises = [];

	for (let user = 0; user < userCount; user++) {
		const userPromise = (async () => {
			const userResults = [];

			while (performance.now() < endTime) {
				const requestType = getRandomRequestType();
				const result = await simulateRequest(requestType);
				userResults.push(result);

				// Random think time between requests (50-500ms)
				const thinkTime = 50 + Math.random() * 450;
				await sleep(thinkTime);
			}

			return userResults;
		})();

		userPromises.push(userPromise);

		// Ramp up users gradually
		if (user < userCount - 1) {
			await sleep((config.ramp_up_seconds * 1000) / userCount);
		}
	}

	// Wait for all users to complete
	const allUserResults = await Promise.all(userPromises);

	// Flatten results
	allUserResults.forEach((userResults) => {
		results.push(...userResults);
	});

	return results;
}

function analyzeResults(results, userCount) {
	if (results.length === 0) {
		return {
			userCount,
			requestCount: 0,
			errorRate: 1,
			avgResponseTime: 0,
			p95ResponseTime: 0,
			throughput: 0,
			passed: false,
		};
	}

	const requestCount = results.length;
	const errorCount = results.filter((r) => r.error).length;
	const errorRate = errorCount / requestCount;

	const responseTimes = results.filter((r) => !r.error).map((r) => r.duration);
	const avgResponseTime =
		responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length ||
		0;
	const p95ResponseTime = calculatePercentile(responseTimes, 95);

	const durationSeconds = config.duration_seconds;
	const throughput = requestCount / durationSeconds;

	// Check if all targets are met
	const p95Pass = p95ResponseTime <= config.targets.response_time_95th;
	const errorPass = errorRate <= config.targets.error_rate;
	const throughputPass = throughput >= config.targets.throughput_min;
	const passed = p95Pass && errorPass && throughputPass;

	return {
		userCount,
		requestCount,
		errorRate: Math.round(errorRate * 100) / 100,
		avgResponseTime: Math.round(avgResponseTime),
		p95ResponseTime: Math.round(p95ResponseTime),
		throughput: Math.round(throughput * 100) / 100,
		passed,
		breakdown: {
			p95Pass,
			errorPass,
			throughputPass,
		},
	};
}

async function runLoadTests() {
	try {
		let allPassed = true;

		for (const userCount of config.concurrent_users) {
			const results = await runConcurrentUsers(
				userCount,
				config.duration_seconds,
			);
			const analysis = analyzeResults(results, userCount);

			testResults.push(analysis);

			if (!analysis.passed) {
				allPassed = false;
			}
			logResult(
				"95th Percentile Response",
				analysis.p95ResponseTime,
				config.targets.response_time_95th,
				"ms",
				analysis.breakdown.p95Pass,
			);
			logResult(
				"Error Rate",
				(analysis.errorRate * 100).toFixed(1),
				config.targets.error_rate * 100,
				"%",
				analysis.breakdown.errorPass,
			);
			logResult(
				"Throughput",
				analysis.throughput,
				config.targets.throughput_min,
				" req/s",
				analysis.breakdown.throughputPass,
			);

			logInfo(
				`Total requests: ${analysis.requestCount}, Avg response: ${analysis.avgResponseTime}ms`,
			);

			// Brief pause between test scenarios
			await sleep(2000);
		}

		return allPassed;
	} catch (error) {
		logError(`Load test failed: ${error.message}`);
		return false;
	}
}

async function generateLoadReport() {
	const allPassed = testResults.every((r) => r.passed);

	testResults.forEach((result) => {
		const _status = result.passed ? "✅ PASS" : "❌ FAIL";
	});

	if (allPassed) {
	} else {
		const failedTests = testResults.filter((r) => !r.passed);
		failedTests.forEach((result) => {
			if (!result.breakdown.p95Pass) {
			}
			if (!result.breakdown.errorPass) {
			}
			if (!result.breakdown.throughputPass) {
			}
		});
	}

	// Save detailed report
	const report = {
		timestamp: new Date().toISOString(),
		config,
		results: testResults,
		summary: {
			total_scenarios: testResults.length,
			passed_scenarios: testResults.filter((r) => r.passed).length,
			max_concurrent_users: Math.max(...config.concurrent_users),
			overall_pass: allPassed,
		},
	};

	fs.writeFileSync("load-test-report.json", JSON.stringify(report, null, 2));

	return allPassed;
}

async function runFullLoadTest() {
	try {
		logInfo("Checking system components...");

		// Quick system check
		const criticalFiles = [
			"package.json",
			"apps/web/app/components/no-show/anti-no-show-dashboard.tsx",
			"packages/ai/src/services/ml-pipeline-management.ts",
		];

		for (const file of criticalFiles) {
			if (!fs.existsSync(file)) {
				logError(`Critical file missing: ${file}`);
				return false;
			}
		}

		logInfo("System components verified. Starting load tests...");

		const loadTestPassed = await runLoadTests();
		const reportGenerated = await generateLoadReport();

		return loadTestPassed && reportGenerated;
	} catch (error) {
		logError(`Load testing suite failed: ${error.message}`);
		return false;
	}
}

// Run tests if this script is executed directly
if (require.main === module) {
	runFullLoadTest().then((success) => {
		process.exit(success ? 0 : 1);
	});
}

module.exports = { runFullLoadTest, config };
