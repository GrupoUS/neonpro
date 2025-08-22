/**
 * Stress Testing Suite for NeonPro API
 * High-Load and Edge Case Performance Validation
 *
 * Tests for:
 * - High concurrent user load
 * - Database connection pooling under stress
 * - Memory leak detection
 * - API rate limiting behavior
 * - Error rate monitoring under load
 * - Recovery from overload scenarios
 */

import { expect, test } from "@playwright/test";

const STRESS_TEST_CONFIG = {
	MAX_CONCURRENT_USERS: 100,
	STRESS_DURATION_MS: 30_000, // 30 seconds
	HIGH_LOAD_REQUESTS: 200,
	MEMORY_LEAK_ITERATIONS: 50,
	ERROR_RATE_THRESHOLD: 0.05, // 5% maximum error rate under stress
	RECOVERY_TIME_MS: 5000, // Time allowed for system recovery
};

test.describe("🔥 Stress Testing Suite", () => {
	test("💥 High Concurrent User Load", async ({ page }) => {
		test.setTimeout(120_000); // 2 minutes

		await test.step("Simulate maximum concurrent users", async () => {
			const concurrentUsers = STRESS_TEST_CONFIG.MAX_CONCURRENT_USERS;
			console.log(`🔥 Stress testing with ${concurrentUsers} concurrent users`);

			const userRequests = Array.from({ length: concurrentUsers }, async (_, userIndex) => {
				// Each "user" performs multiple actions
				const userActions = [
					page.request.get("/api/v1/health"),
					page.request.get("/api/v1/patients"),
					page.request.get("/api/v1/appointments"),
					page.request.get("/api/v1/clinics"),
				];

				try {
					const userResults = await Promise.all(userActions);
					return {
						userId: userIndex,
						success: userResults.every((r) => r.status() < 500),
						responses: userResults.map((r) => r.status()),
					};
				} catch (error) {
					return {
						userId: userIndex,
						success: false,
						error: error.message,
					};
				}
			});

			const startTime = Date.now();
			const results = await Promise.all(userRequests);
			const endTime = Date.now();

			// Analyze results
			const successfulUsers = results.filter((r) => r.success).length;
			const failedUsers = results.filter((r) => !r.success).length;
			const successRate = successfulUsers / results.length;
			const totalTime = endTime - startTime;
			const userThroughput = results.length / (totalTime / 1000);

			console.log("🔥 High Load Stress Test Results:");
			console.log(`  Concurrent users: ${concurrentUsers}`);
			console.log(`  Successful users: ${successfulUsers}`);
			console.log(`  Failed users: ${failedUsers}`);
			console.log(`  Success rate: ${(successRate * 100).toFixed(2)}%`);
			console.log(`  Total time: ${totalTime}ms`);
			console.log(`  User throughput: ${userThroughput.toFixed(2)} users/s`);

			// Under extreme load, we still expect reasonable performance
			expect(successRate, "System should handle high concurrent load with acceptable success rate").toBeGreaterThan(
				0.8
			);
			expect(totalTime, "High load test should complete in reasonable time").toBeLessThan(60_000);
		});
	});

	test("⛈️ Sustained Load Test", async ({ page }) => {
		test.setTimeout(180_000); // 3 minutes

		await test.step("Apply sustained load over time", async () => {
			const duration = STRESS_TEST_CONFIG.STRESS_DURATION_MS;
			const requestInterval = 100; // Request every 100ms
			const endpoint = "/api/v1/health";

			console.log(`⛈️ Applying sustained load for ${duration / 1000} seconds`);

			const results: Array<{
				time: number;
				status: number;
				responseTime: number;
			}> = [];
			const startTime = Date.now();

			while (Date.now() - startTime < duration) {
				const requestStart = performance.now();

				try {
					const response = await page.request.get(endpoint);
					const requestEnd = performance.now();

					results.push({
						time: Date.now() - startTime,
						status: response.status(),
						responseTime: requestEnd - requestStart,
					});
				} catch (error) {
					results.push({
						time: Date.now() - startTime,
						status: 0, // Failed request
						responseTime: -1,
					});
				}

				// Wait for next interval
				await new Promise((resolve) => setTimeout(resolve, requestInterval));
			}

			// Analyze sustained load results
			const successfulRequests = results.filter((r) => r.status >= 200 && r.status < 300);
			const failedRequests = results.filter((r) => r.status === 0 || r.status >= 500);
			const successRate = successfulRequests.length / results.length;

			// Calculate response time trends
			const avgResponseTime =
				successfulRequests.reduce((sum, r) => sum + r.responseTime, 0) / successfulRequests.length;
			const maxResponseTime = Math.max(...successfulRequests.map((r) => r.responseTime));

			// Check for performance degradation over time
			const firstHalf = successfulRequests.slice(0, Math.floor(successfulRequests.length / 2));
			const secondHalf = successfulRequests.slice(Math.floor(successfulRequests.length / 2));

			const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.responseTime, 0) / firstHalf.length;
			const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.responseTime, 0) / secondHalf.length;
			const performanceDegradation = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;

			console.log("⛈️ Sustained Load Test Results:");
			console.log(`  Duration: ${duration / 1000} seconds`);
			console.log(`  Total requests: ${results.length}`);
			console.log(`  Successful: ${successfulRequests.length}`);
			console.log(`  Failed: ${failedRequests.length}`);
			console.log(`  Success rate: ${(successRate * 100).toFixed(2)}%`);
			console.log(`  Average response time: ${avgResponseTime.toFixed(2)}ms`);
			console.log(`  Max response time: ${maxResponseTime.toFixed(2)}ms`);
			console.log(`  Performance degradation: ${(performanceDegradation * 100).toFixed(2)}%`);

			// Assertions for sustained load
			expect(successRate, "System should maintain good success rate under sustained load").toBeGreaterThan(0.9);
			expect(avgResponseTime, "Average response time should remain reasonable").toBeLessThan(500);
			expect(performanceDegradation, "Performance should not degrade significantly over time").toBeLessThan(0.5); // Max 50% degradation
		});
	});

	test("🧠 Memory Leak Detection", async ({ page }) => {
		test.setTimeout(120_000);

		await test.step("Monitor memory usage over repeated requests", async () => {
			const iterations = STRESS_TEST_CONFIG.MEMORY_LEAK_ITERATIONS;
			const endpoint = "/api/v1/patients";

			console.log(`🧠 Testing for memory leaks over ${iterations} iterations`);

			// Navigate to application to initialize memory baseline
			await page.goto("/");

			const memoryMeasurements: Array<{
				iteration: number;
				usedMemory: number;
				totalMemory: number;
			}> = [];

			for (let i = 0; i < iterations; i++) {
				// Make API request
				await page.request.get(endpoint);

				// Force garbage collection if possible and get memory stats
				const memoryInfo = await page.evaluate(() => {
					// Force garbage collection if available
					if ((window as any).gc) {
						(window as any).gc();
					}

					return {
						usedJSMemory: (performance as any).memory?.usedJSMemory || 0,
						totalJSMemory: (performance as any).memory?.totalJSMemory || 0,
						jsHeapSizeLimit: (performance as any).memory?.jsHeapSizeLimit || 0,
					};
				});

				if (memoryInfo.usedJSMemory > 0) {
					memoryMeasurements.push({
						iteration: i + 1,
						usedMemory: memoryInfo.usedJSMemory,
						totalMemory: memoryInfo.totalJSMemory,
					});
				}

				// Small delay between iterations
				await new Promise((resolve) => setTimeout(resolve, 50));
			}

			if (memoryMeasurements.length > 0) {
				// Analyze memory trend
				const startMemory = memoryMeasurements[0].usedMemory;
				const endMemory = memoryMeasurements[memoryMeasurements.length - 1].usedMemory;
				const memoryIncrease = endMemory - startMemory;
				const memoryIncreasePercent = (memoryIncrease / startMemory) * 100;

				// Calculate memory growth rate
				const memoryGrowthPerIteration = memoryIncrease / iterations;

				console.log("🧠 Memory Leak Analysis:");
				console.log(`  Iterations: ${iterations}`);
				console.log(`  Start memory: ${(startMemory / 1024 / 1024).toFixed(2)} MB`);
				console.log(`  End memory: ${(endMemory / 1024 / 1024).toFixed(2)} MB`);
				console.log(`  Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
				console.log(`  Memory increase: ${memoryIncreasePercent.toFixed(2)}%`);
				console.log(`  Growth per iteration: ${(memoryGrowthPerIteration / 1024).toFixed(2)} KB`);

				// Memory leak detection thresholds
				expect(memoryIncreasePercent, "Memory usage should not increase excessively").toBeLessThan(200); // Max 200% increase
				expect(memoryGrowthPerIteration / 1024, "Memory growth per iteration should be minimal").toBeLessThan(100); // Max 100KB per iteration
			} else {
				console.log("🧠 Memory monitoring not available in this environment");
			}
		});
	});

	test("📊 Database Connection Pool Stress", async ({ page }) => {
		test.setTimeout(90_000);

		await test.step("Test database connection pool under stress", async () => {
			const simultaneousConnections = 25;
			const dbEndpoint = "/api/v1/patients"; // Endpoint that queries database

			console.log(`📊 Testing database connection pool with ${simultaneousConnections} simultaneous connections`);

			// Create multiple simultaneous database requests
			const connectionRequests = Array.from({ length: simultaneousConnections }, async (_, index) => {
				try {
					const startTime = performance.now();
					const response = await page.request.get(dbEndpoint);
					const endTime = performance.now();

					return {
						connectionId: index,
						status: response.status(),
						responseTime: endTime - startTime,
						success: response.status() < 400,
					};
				} catch (error) {
					return {
						connectionId: index,
						status: 0,
						responseTime: -1,
						success: false,
						error: error.message,
					};
				}
			});

			const startTime = Date.now();
			const results = await Promise.all(connectionRequests);
			const endTime = Date.now();

			// Analyze database connection results
			const successfulConnections = results.filter((r) => r.success);
			const failedConnections = results.filter((r) => !r.success);
			const successRate = successfulConnections.length / results.length;
			const avgResponseTime =
				successfulConnections.reduce((sum, r) => sum + r.responseTime, 0) / successfulConnections.length;
			const totalTime = endTime - startTime;

			console.log("📊 Database Connection Pool Results:");
			console.log(`  Simultaneous connections: ${simultaneousConnections}`);
			console.log(`  Successful connections: ${successfulConnections.length}`);
			console.log(`  Failed connections: ${failedConnections.length}`);
			console.log(`  Success rate: ${(successRate * 100).toFixed(2)}%`);
			console.log(`  Average response time: ${avgResponseTime.toFixed(2)}ms`);
			console.log(`  Total completion time: ${totalTime}ms`);

			// Database connection pool should handle reasonable concurrent load
			expect(successRate, "Database connection pool should handle concurrent connections").toBeGreaterThan(0.8);
			expect(avgResponseTime, "Database queries should remain reasonably fast under load").toBeLessThan(1000);

			// Check for connection timeout errors
			const timeoutErrors = failedConnections.filter((r) => r.error && r.error.includes("timeout"));
			expect(timeoutErrors.length, "Should not have excessive connection timeouts").toBeLessThan(
				simultaneousConnections * 0.1
			);
		});
	});

	test("🔄 Recovery from Overload", async ({ page }) => {
		test.setTimeout(180_000);

		await test.step("Test system recovery after overload", async () => {
			const overloadRequests = STRESS_TEST_CONFIG.HIGH_LOAD_REQUESTS;
			const endpoint = "/api/v1/health";

			console.log(`🔄 Testing system recovery: applying ${overloadRequests} requests then monitoring recovery`);

			// Phase 1: Apply overload
			console.log("Phase 1: Applying overload...");
			const overloadPromises = Array.from({ length: overloadRequests }, () =>
				page.request.get(endpoint).catch(() => ({ status: () => 0 }))
			);

			const overloadStart = Date.now();
			const overloadResults = await Promise.all(overloadPromises);
			const overloadEnd = Date.now();

			const overloadSuccessRate =
				overloadResults.filter((r) => r.status() >= 200 && r.status() < 300).length / overloadResults.length;

			console.log(
				`Overload phase: ${(overloadSuccessRate * 100).toFixed(2)}% success rate in ${overloadEnd - overloadStart}ms`
			);

			// Phase 2: Wait for system recovery
			console.log("Phase 2: Allowing system recovery...");
			await new Promise((resolve) => setTimeout(resolve, STRESS_TEST_CONFIG.RECOVERY_TIME_MS));

			// Phase 3: Test recovery with normal load
			console.log("Phase 3: Testing recovery with normal requests...");
			const recoveryTests = 10;
			const recoveryResults: Array<{ status: number; responseTime: number }> = [];

			for (let i = 0; i < recoveryTests; i++) {
				const requestStart = performance.now();
				const response = await page.request.get(endpoint);
				const requestEnd = performance.now();

				recoveryResults.push({
					status: response.status(),
					responseTime: requestEnd - requestStart,
				});

				await new Promise((resolve) => setTimeout(resolve, 200)); // Normal request interval
			}

			// Analyze recovery
			const recoverySuccessRate =
				recoveryResults.filter((r) => r.status >= 200 && r.status < 300).length / recoveryResults.length;
			const avgRecoveryResponseTime =
				recoveryResults.reduce((sum, r) => sum + r.responseTime, 0) / recoveryResults.length;

			console.log("🔄 Recovery Test Results:");
			console.log(`  Overload requests: ${overloadRequests}`);
			console.log(`  Overload success rate: ${(overloadSuccessRate * 100).toFixed(2)}%`);
			console.log(`  Recovery time allowed: ${STRESS_TEST_CONFIG.RECOVERY_TIME_MS}ms`);
			console.log(`  Post-recovery success rate: ${(recoverySuccessRate * 100).toFixed(2)}%`);
			console.log(`  Post-recovery avg response time: ${avgRecoveryResponseTime.toFixed(2)}ms`);

			// Recovery assertions
			expect(recoverySuccessRate, "System should recover to high success rate after overload").toBeGreaterThan(0.9);
			expect(avgRecoveryResponseTime, "Response times should return to normal after recovery").toBeLessThan(300);
		});
	});

	test("⚠️ Error Rate Monitoring Under Stress", async ({ page }) => {
		test.setTimeout(120_000);

		await test.step("Monitor error rates under various stress conditions", async () => {
			const stressScenarios = [
				{ name: "Light Load", concurrent: 5, iterations: 20 },
				{ name: "Medium Load", concurrent: 15, iterations: 30 },
				{ name: "Heavy Load", concurrent: 30, iterations: 40 },
				{ name: "Extreme Load", concurrent: 50, iterations: 20 },
			];

			const endpoint = "/api/v1/health";
			const scenarioResults = [];

			for (const scenario of stressScenarios) {
				console.log(
					`⚠️ Testing error rates: ${scenario.name} (${scenario.concurrent} concurrent × ${scenario.iterations} iterations)`
				);

				const scenarioStart = Date.now();
				const allRequests: Promise<any>[] = [];

				// Generate all requests for this scenario
				for (let i = 0; i < scenario.iterations; i++) {
					const batchRequests = Array.from({ length: scenario.concurrent }, () =>
						page.request
							.get(endpoint)
							.then((response) => ({
								status: response.status(),
								timestamp: Date.now(),
							}))
							.catch(() => ({ status: 0, timestamp: Date.now() }))
					);

					allRequests.push(...batchRequests);

					// Small delay between batches
					if (i < scenario.iterations - 1) {
						await new Promise((resolve) => setTimeout(resolve, 50));
					}
				}

				const responses = await Promise.all(allRequests);
				const scenarioEnd = Date.now();

				// Analyze scenario results
				const totalRequests = responses.length;
				const successfulRequests = responses.filter((r) => r.status >= 200 && r.status < 300).length;
				const clientErrors = responses.filter((r) => r.status >= 400 && r.status < 500).length;
				const serverErrors = responses.filter((r) => r.status >= 500).length;
				const networkErrors = responses.filter((r) => r.status === 0).length;

				const successRate = successfulRequests / totalRequests;
				const errorRate = (clientErrors + serverErrors + networkErrors) / totalRequests;
				const serverErrorRate = serverErrors / totalRequests;

				const scenarioResult = {
					scenario: scenario.name,
					totalRequests,
					successfulRequests,
					clientErrors,
					serverErrors,
					networkErrors,
					successRate,
					errorRate,
					serverErrorRate,
					duration: scenarioEnd - scenarioStart,
				};

				scenarioResults.push(scenarioResult);

				console.log(`  ${scenario.name} Results:`);
				console.log(`    Total requests: ${totalRequests}`);
				console.log(`    Success rate: ${(successRate * 100).toFixed(2)}%`);
				console.log(`    Error rate: ${(errorRate * 100).toFixed(2)}%`);
				console.log(`    Server error rate: ${(serverErrorRate * 100).toFixed(2)}%`);
				console.log(`    Duration: ${scenarioResult.duration}ms`);

				// Allow system to stabilize between scenarios
				await new Promise((resolve) => setTimeout(resolve, 2000));
			}

			// Overall error rate analysis
			console.log("⚠️ Overall Error Rate Analysis:");
			scenarioResults.forEach((result) => {
				console.log(`  ${result.scenario}: ${(result.errorRate * 100).toFixed(2)}% error rate`);

				// Error rate assertions based on load level
				if (result.scenario === "Light Load" || result.scenario === "Medium Load") {
					expect(result.errorRate, `${result.scenario} should have very low error rate`).toBeLessThan(0.02); // <2%
				} else if (result.scenario === "Heavy Load") {
					expect(result.errorRate, `${result.scenario} should have acceptable error rate`).toBeLessThan(0.1); // <10%
				} else {
					expect(
						result.errorRate,
						`${result.scenario} may have higher error rate but should not be excessive`
					).toBeLessThan(0.3); // <30%
				}

				// Server error rate should always be low
				expect(result.serverErrorRate, `${result.scenario} should have low server error rate`).toBeLessThan(0.05); // <5%
			});
		});
	});
});
