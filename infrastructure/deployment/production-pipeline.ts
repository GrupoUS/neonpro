import { exec } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

interface DeploymentConfig {
	environment: "staging" | "production";
	version: string;
	deployment_strategy: "blue-green" | "rolling" | "canary";
	health_check_timeout_ms: number;
	rollback_threshold_error_rate: number;
	validation_steps: string[];
	post_deployment_tests: string[];
}

interface HealthCheckResult {
	service: string;
	endpoint: string;
	status: "healthy" | "degraded" | "unhealthy";
	response_time_ms: number;
	details: any;
	timestamp: string;
}

interface DeploymentStatus {
	deployment_id: string;
	environment: string;
	version: string;
	status: "pending" | "in-progress" | "completed" | "failed" | "rolled-back";
	started_at: string;
	completed_at?: string;
	health_checks: HealthCheckResult[];
	rollback_triggered: boolean;
	error_rate: number;
	performance_metrics: {
		avg_response_time_ms: number;
		requests_per_second: number;
		error_count: number;
		success_rate: number;
	};
}

class ProductionDeploymentPipeline {
	private config: DeploymentConfig;
	private deploymentStatus: DeploymentStatus;
	private healthCheckEndpoints: Map<string, string>;
	private rollbackCommit: string | null = null;

	constructor(config: DeploymentConfig) {
		this.config = config;
		this.healthCheckEndpoints = new Map([
			["api-gateway", "/api/health"],
			["universal-chat", "/api/ai/universal-chat/health"],
			["feature-flags", "/api/ai/feature-flags/health"],
			["cache-management", "/api/ai/cache/health"],
			["monitoring", "/api/ai/monitoring/health"],
			["no-show-prediction", "/api/ai/no-show-prediction/health"],
			["appointment-optimization", "/api/ai/appointment-optimization/health"],
			["compliance-automation", "/api/ai/compliance/health"],
			["database", "/api/db/health"],
			["supabase", "/api/supabase/health"],
		]);

		this.deploymentStatus = {
			deployment_id: `deploy-${Date.now()}`,
			environment: config.environment,
			version: config.version,
			status: "pending",
			started_at: new Date().toISOString(),
			health_checks: [],
			rollback_triggered: false,
			error_rate: 0,
			performance_metrics: {
				avg_response_time_ms: 0,
				requests_per_second: 0,
				error_count: 0,
				success_rate: 0,
			},
		};
	}

	async executeDeployment(): Promise<DeploymentStatus> {
		try {
			console.log(`🚀 Starting ${this.config.environment} deployment v${this.config.version}`);
			this.deploymentStatus.status = "in-progress";

			// Step 1: Pre-deployment validation
			await this.runPreDeploymentValidation();

			// Step 2: Backup current state
			await this.backupCurrentState();

			// Step 3: Execute deployment strategy
			await this.executeDeploymentStrategy();

			// Step 4: Run health checks
			await this.runComprehensiveHealthChecks();

			// Step 5: Validate performance metrics
			await this.validatePerformanceMetrics();

			// Step 6: Run post-deployment tests
			await this.runPostDeploymentTests();

			// Step 7: Monitor for issues and potential rollback
			await this.monitorDeploymentHealth();

			this.deploymentStatus.status = "completed";
			this.deploymentStatus.completed_at = new Date().toISOString();

			console.log("✅ Deployment completed successfully");
			await this.sendDeploymentNotification("success");
		} catch (error) {
			console.error("❌ Deployment failed:", error);
			this.deploymentStatus.status = "failed";
			await this.handleDeploymentFailure(error as Error);
			throw error;
		}

		return this.deploymentStatus;
	}

	private async runPreDeploymentValidation(): Promise<void> {
		console.log("📋 Running pre-deployment validation...");

		const validationSteps = [
			() => this.validateEnvironmentVariables(),
			() => this.validateDatabaseConnectivity(),
			() => this.validateSupabaseConfiguration(),
			() => this.runSecurityScans(),
			() => this.validateAIServicesConfiguration(),
			() => this.checkDiskSpaceAndResources(),
		];

		for (let i = 0; i < validationSteps.length; i++) {
			const step = validationSteps[i];
			try {
				console.log(`  ▶️ Step ${i + 1}/${validationSteps.length}: ${step.name}`);
				await step();
				console.log(`  ✅ Step ${i + 1} completed`);
			} catch (error) {
				console.error(`  ❌ Step ${i + 1} failed:`, error);
				throw new Error(`Pre-deployment validation failed at step ${i + 1}: ${error}`);
			}
		}
	}

	private async validateEnvironmentVariables(): Promise<void> {
		const requiredVars = [
			"DATABASE_URL",
			"SUPABASE_URL",
			"SUPABASE_ANON_KEY",
			"SUPABASE_SERVICE_ROLE_KEY",
			"REDIS_URL",
			"NODE_ENV",
			"API_BASE_URL",
			"OPENAI_API_KEY",
			"ANTHROPIC_API_KEY",
		];

		const missingVars = requiredVars.filter((varName) => !process.env[varName]);

		if (missingVars.length > 0) {
			throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
		}
	}

	private async validateDatabaseConnectivity(): Promise<void> {
		try {
			const result = await execAsync("npm run db:test-connection");
			if (result.stderr) {
				throw new Error(`Database connectivity test failed: ${result.stderr}`);
			}
		} catch (error) {
			throw new Error(`Database connectivity validation failed: ${error}`);
		}
	}

	private async validateSupabaseConfiguration(): Promise<void> {
		try {
			const result = await execAsync("npm run supabase:validate-config");
			if (result.stderr) {
				throw new Error(`Supabase configuration validation failed: ${result.stderr}`);
			}
		} catch (error) {
			throw new Error(`Supabase validation failed: ${error}`);
		}
	}

	private async runSecurityScans(): Promise<void> {
		try {
			// Run security scans on dependencies
			await execAsync("npm audit --audit-level high");

			// Run LGPD/healthcare compliance checks
			await execAsync("npm run compliance:validate");

			// Check for secrets in code
			await execAsync("npm run security:scan-secrets");
		} catch (error) {
			// Security scan failures should be treated seriously in healthcare
			throw new Error(`Security validation failed: ${error}`);
		}
	}

	private async validateAIServicesConfiguration(): Promise<void> {
		// Validate AI service configurations
		const serviceConfigs = [
			"ai-chat-config.json",
			"feature-flags-config.json",
			"monitoring-config.json",
			"compliance-config.json",
		];

		for (const configFile of serviceConfigs) {
			try {
				const configPath = path.join(process.cwd(), "config", configFile);
				const config = JSON.parse(await fs.readFile(configPath, "utf8"));

				// Validate configuration structure and required fields
				if (!this.validateServiceConfig(config, configFile)) {
					throw new Error(`Invalid configuration in ${configFile}`);
				}
			} catch (error) {
				throw new Error(`AI service configuration validation failed for ${configFile}: ${error}`);
			}
		}
	}

	private validateServiceConfig(config: any, fileName: string): boolean {
		const requiredFields = {
			"ai-chat-config.json": ["model_settings", "compliance_rules", "rate_limits"],
			"feature-flags-config.json": ["default_flags", "rollout_strategy"],
			"monitoring-config.json": ["metrics_collection", "alert_rules"],
			"compliance-config.json": ["lgpd_settings", "anvisa_settings", "audit_requirements"],
		};

		const required = requiredFields[fileName];
		if (!required) return true;

		return required.every((field) => Object.hasOwn(config, field));
	}

	private async checkDiskSpaceAndResources(): Promise<void> {
		try {
			const { stdout } = await execAsync("df -h / && free -m");
			console.log("System resources:", stdout);

			// Parse disk space and memory - ensure adequate resources
			if (stdout.includes("100%")) {
				throw new Error("Insufficient disk space for deployment");
			}
		} catch (error) {
			throw new Error(`Resource validation failed: ${error}`);
		}
	}

	private async backupCurrentState(): Promise<void> {
		console.log("💾 Creating deployment backup...");

		try {
			// Backup database
			await execAsync(`npm run db:backup -- --env ${this.config.environment}`);

			// Get current Git commit for potential rollback
			const { stdout } = await execAsync("git rev-parse HEAD");
			this.rollbackCommit = stdout.trim();

			// Backup current configuration files
			await execAsync(`tar -czf backup-${this.deploymentStatus.deployment_id}.tar.gz config/ .env*`);

			console.log(`✅ Backup created with commit: ${this.rollbackCommit}`);
		} catch (error) {
			throw new Error(`Backup creation failed: ${error}`);
		}
	}

	private async executeDeploymentStrategy(): Promise<void> {
		console.log(`🔄 Executing ${this.config.deployment_strategy} deployment...`);

		switch (this.config.deployment_strategy) {
			case "blue-green":
				await this.executeBlueGreenDeployment();
				break;
			case "rolling":
				await this.executeRollingDeployment();
				break;
			case "canary":
				await this.executeCanaryDeployment();
				break;
			default:
				throw new Error(`Unknown deployment strategy: ${this.config.deployment_strategy}`);
		}
	}

	private async executeBlueGreenDeployment(): Promise<void> {
		console.log("🔵 Starting Blue-Green deployment...");

		try {
			// Deploy to green environment
			await execAsync(`npm run deploy:green -- --version ${this.config.version}`);

			// Run health checks on green environment
			await this.runHealthChecksOnEnvironment("green");

			// If health checks pass, switch traffic to green
			await execAsync("npm run traffic:switch-to-green");

			console.log("✅ Blue-Green deployment completed");
		} catch (error) {
			// Keep blue environment active
			await execAsync("npm run traffic:ensure-blue");
			throw error;
		}
	}

	private async executeRollingDeployment(): Promise<void> {
		console.log("🔄 Starting Rolling deployment...");

		const instances = await this.getActiveInstances();
		const batchSize = Math.ceil(instances.length / 3); // Deploy in 3 batches

		for (let i = 0; i < instances.length; i += batchSize) {
			const batch = instances.slice(i, i + batchSize);

			console.log(`  Deploying batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(instances.length / batchSize)}`);

			for (const instance of batch) {
				await execAsync(`npm run deploy:instance -- ${instance} --version ${this.config.version}`);
				await this.runHealthCheckOnInstance(instance);
			}

			// Brief pause between batches
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
	}

	private async executeCanaryDeployment(): Promise<void> {
		console.log("🐤 Starting Canary deployment...");

		try {
			// Deploy to 10% of traffic initially
			await execAsync(`npm run deploy:canary -- --version ${this.config.version} --traffic-percent 10`);

			// Monitor for 5 minutes
			await this.monitorCanaryDeployment(5 * 60 * 1000);

			// If metrics look good, increase to 50%
			await execAsync("npm run canary:increase-traffic -- --traffic-percent 50");
			await this.monitorCanaryDeployment(5 * 60 * 1000);

			// If still good, go to 100%
			await execAsync("npm run canary:promote -- --traffic-percent 100");
		} catch (error) {
			await execAsync("npm run canary:rollback");
			throw error;
		}
	}

	private async monitorCanaryDeployment(durationMs: number): Promise<void> {
		const endTime = Date.now() + durationMs;

		while (Date.now() < endTime) {
			const metrics = await this.collectCurrentMetrics();

			if (metrics.error_rate > this.config.rollback_threshold_error_rate) {
				throw new Error(
					`Error rate ${metrics.error_rate}% exceeds threshold ${this.config.rollback_threshold_error_rate}%`
				);
			}

			await new Promise((resolve) => setTimeout(resolve, 30_000)); // Check every 30 seconds
		}
	}

	private async runComprehensiveHealthChecks(): Promise<void> {
		console.log("🏥 Running comprehensive health checks...");

		const healthCheckPromises = Array.from(this.healthCheckEndpoints.entries()).map(([service, endpoint]) =>
			this.runHealthCheck(service, endpoint)
		);

		const results = await Promise.allSettled(healthCheckPromises);
		const healthChecks: HealthCheckResult[] = [];
		let unhealthyServices = 0;

		results.forEach((result, index) => {
			const [service] = Array.from(this.healthCheckEndpoints.entries())[index];

			if (result.status === "fulfilled") {
				healthChecks.push(result.value);
				if (result.value.status === "unhealthy") {
					unhealthyServices++;
				}
			} else {
				healthChecks.push({
					service,
					endpoint: this.healthCheckEndpoints.get(service)!,
					status: "unhealthy",
					response_time_ms: 0,
					details: { error: result.reason?.message || "Unknown error" },
					timestamp: new Date().toISOString(),
				});
				unhealthyServices++;
			}
		});

		this.deploymentStatus.health_checks = healthChecks;

		if (unhealthyServices > 0) {
			throw new Error(`${unhealthyServices} services are unhealthy after deployment`);
		}

		console.log("✅ All health checks passed");
	}

	private async runHealthCheck(service: string, endpoint: string): Promise<HealthCheckResult> {
		const startTime = Date.now();
		const baseUrl = this.getBaseUrlForEnvironment();
		const fullUrl = `${baseUrl}${endpoint}`;

		try {
			const response = await fetch(fullUrl, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${process.env.HEALTH_CHECK_TOKEN}`,
					"User-Agent": "NeonPro-Health-Check/1.0",
				},
				signal: AbortSignal.timeout(this.config.health_check_timeout_ms),
			});

			const responseTime = Date.now() - startTime;
			const responseData = await response.json();

			const status = response.ok && responseData.healthy ? "healthy" : response.ok ? "degraded" : "unhealthy";

			return {
				service,
				endpoint,
				status,
				response_time_ms: responseTime,
				details: responseData,
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			return {
				service,
				endpoint,
				status: "unhealthy",
				response_time_ms: Date.now() - startTime,
				details: { error: error.message },
				timestamp: new Date().toISOString(),
			};
		}
	}

	private async runHealthChecksOnEnvironment(environment: string): Promise<void> {
		// Temporarily adjust base URL for specific environment
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = environment;

		try {
			await this.runComprehensiveHealthChecks();
		} finally {
			process.env.NODE_ENV = originalEnv;
		}
	}

	private async runHealthCheckOnInstance(instanceId: string): Promise<void> {
		const instanceUrl = `${this.getBaseUrlForEnvironment()}/instance/${instanceId}`;
		const healthCheck = await this.runHealthCheck(`instance-${instanceId}`, "/health");

		if (healthCheck.status === "unhealthy") {
			throw new Error(`Instance ${instanceId} failed health check`);
		}
	}

	private async validatePerformanceMetrics(): Promise<void> {
		console.log("📊 Validating performance metrics...");

		const metrics = await this.collectCurrentMetrics();
		this.deploymentStatus.performance_metrics = metrics;

		// Performance validation thresholds for healthcare applications
		const thresholds = {
			max_avg_response_time_ms: 2000, // Critical for patient care
			min_success_rate: 99.5, // High reliability required
			max_error_rate: 0.5, // Very low tolerance for errors
		};

		const failures: string[] = [];

		if (metrics.avg_response_time_ms > thresholds.max_avg_response_time_ms) {
			failures.push(
				`Average response time ${metrics.avg_response_time_ms}ms exceeds threshold ${thresholds.max_avg_response_time_ms}ms`
			);
		}

		if (metrics.success_rate < thresholds.min_success_rate) {
			failures.push(`Success rate ${metrics.success_rate}% below threshold ${thresholds.min_success_rate}%`);
		}

		if (this.deploymentStatus.error_rate > thresholds.max_error_rate) {
			failures.push(`Error rate ${this.deploymentStatus.error_rate}% exceeds threshold ${thresholds.max_error_rate}%`);
		}

		if (failures.length > 0) {
			throw new Error(`Performance validation failed:\n- ${failures.join("\n- ")}`);
		}

		console.log("✅ Performance metrics validation passed");
	}

	private async collectCurrentMetrics(): Promise<any> {
		try {
			const response = await fetch(`${this.getBaseUrlForEnvironment()}/api/ai/monitoring/aggregated-metrics`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.HEALTH_CHECK_TOKEN}`,
				},
				body: JSON.stringify({
					time_range_minutes: 5,
					services: Array.from(this.healthCheckEndpoints.keys()),
					aggregation_type: "avg",
				}),
			});

			if (!response.ok) {
				throw new Error(`Failed to collect metrics: ${response.statusText}`);
			}

			const data = await response.json();
			return (
				data.data?.aggregated_metrics || {
					avg_response_time_ms: 0,
					requests_per_second: 0,
					error_count: 0,
					success_rate: 100,
				}
			);
		} catch (error) {
			console.warn("Failed to collect current metrics:", error);
			return {
				avg_response_time_ms: 0,
				requests_per_second: 0,
				error_count: 0,
				success_rate: 100,
			};
		}
	}

	private async runPostDeploymentTests(): Promise<void> {
		console.log("🧪 Running post-deployment tests...");

		const testCommands = [
			"npm run test:api-integration",
			"npm run test:ai-services-integration",
			"npm run test:compliance-validation",
			"npm run test:performance-smoke",
		];

		for (const command of testCommands) {
			try {
				console.log(`  Running: ${command}`);
				await execAsync(command);
				console.log(`  ✅ ${command} passed`);
			} catch (error) {
				console.error(`  ❌ ${command} failed:`, error);
				throw new Error(`Post-deployment test failed: ${command}`);
			}
		}
	}

	private async monitorDeploymentHealth(): Promise<void> {
		console.log("👁️ Starting post-deployment monitoring...");

		const monitoringDuration = 10 * 60 * 1000; // 10 minutes
		const checkInterval = 30 * 1000; // 30 seconds
		const startTime = Date.now();

		while (Date.now() - startTime < monitoringDuration) {
			try {
				const metrics = await this.collectCurrentMetrics();
				this.deploymentStatus.error_rate =
					(metrics.error_count / (metrics.error_count + metrics.success_count || 1)) * 100;

				if (this.deploymentStatus.error_rate > this.config.rollback_threshold_error_rate) {
					console.error(`🚨 Error rate ${this.deploymentStatus.error_rate}% exceeds threshold`);
					await this.triggerAutomaticRollback("High error rate detected");
					return;
				}

				// Check if any critical services become unhealthy
				await this.runHealthCheck("api-gateway", "/api/health");
			} catch (error) {
				console.error("Health monitoring check failed:", error);
				// Don't trigger rollback on monitoring failures unless critical
			}

			await new Promise((resolve) => setTimeout(resolve, checkInterval));
		}

		console.log("✅ Post-deployment monitoring completed successfully");
	}

	private async triggerAutomaticRollback(reason: string): Promise<void> {
		console.error(`🔄 Triggering automatic rollback: ${reason}`);
		this.deploymentStatus.rollback_triggered = true;

		try {
			await this.executeRollback();
			await this.sendDeploymentNotification("rollback", reason);
		} catch (rollbackError) {
			console.error("❌ Rollback failed:", rollbackError);
			await this.sendDeploymentNotification("rollback-failed", `${reason}. Rollback also failed: ${rollbackError}`);
			throw rollbackError;
		}
	}

	private async executeRollback(): Promise<void> {
		console.log("⏪ Executing rollback procedure...");

		if (!this.rollbackCommit) {
			throw new Error("No rollback commit available");
		}

		try {
			// Revert to previous commit
			await execAsync(`git checkout ${this.rollbackCommit}`);

			// Restore database backup if needed
			await execAsync(`npm run db:restore -- backup-${this.deploymentStatus.deployment_id}`);

			// Redeploy previous version
			await execAsync("npm run deploy:rollback");

			// Validate rollback success
			await this.runComprehensiveHealthChecks();

			console.log("✅ Rollback completed successfully");
		} catch (error) {
			throw new Error(`Rollback execution failed: ${error}`);
		}
	}

	private async handleDeploymentFailure(error: Error): Promise<void> {
		console.error("🚨 Handling deployment failure...");

		// Attempt automatic rollback if we have a rollback point
		if (this.rollbackCommit && !this.deploymentStatus.rollback_triggered) {
			try {
				await this.triggerAutomaticRollback(`Deployment failed: ${error.message}`);
			} catch (rollbackError) {
				console.error("Rollback also failed:", rollbackError);
			}
		}

		await this.sendDeploymentNotification("failed", error.message);

		// Save deployment status for post-mortem
		await this.saveDeploymentReport();
	}

	private async sendDeploymentNotification(
		status: "success" | "failed" | "rollback" | "rollback-failed",
		details?: string
	): Promise<void> {
		const notification = {
			deployment_id: this.deploymentStatus.deployment_id,
			environment: this.config.environment,
			version: this.config.version,
			status,
			details,
			timestamp: new Date().toISOString(),
			health_checks: this.deploymentStatus.health_checks,
			performance_metrics: this.deploymentStatus.performance_metrics,
		};

		// In a real implementation, this would send to Slack, PagerDuty, etc.
		console.log("📢 Deployment notification:", JSON.stringify(notification, null, 2));
	}

	private async saveDeploymentReport(): Promise<void> {
		const reportPath = `deployment-reports/deployment-${this.deploymentStatus.deployment_id}.json`;
		await fs.mkdir(path.dirname(reportPath), { recursive: true });
		await fs.writeFile(reportPath, JSON.stringify(this.deploymentStatus, null, 2));
	}

	private getBaseUrlForEnvironment(): string {
		return this.config.environment === "production"
			? process.env.PRODUCTION_API_URL || "https://api.neonpro.healthcare"
			: process.env.STAGING_API_URL || "https://staging-api.neonpro.healthcare";
	}

	private async getActiveInstances(): Promise<string[]> {
		// In a real implementation, this would query the infrastructure provider
		return ["instance-1", "instance-2", "instance-3"];
	}
}

export default ProductionDeploymentPipeline;
export type { DeploymentConfig, DeploymentStatus, HealthCheckResult };
