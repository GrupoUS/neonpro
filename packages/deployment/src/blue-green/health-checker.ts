/**
 * @fileoverview Health Checker
 * Monitors application health during blue-green deployments for NeonPro healthcare platform
 */

export type HealthCheckConfig = {
	url: string;
	timeout: number;
	retries: number;
	interval: number;
	expectedStatus?: number;
	expectedBody?: string;
};

export type HealthCheckResult = {
	healthy: boolean;
	responseTime: number;
	statusCode?: number;
	error?: string;
	timestamp: Date;
};

export type HealthStatus = {
	environment: string;
	checks: HealthCheckResult[];
	overallHealth: boolean;
	lastCheck: Date;
};

export class HealthChecker {
	private readonly healthHistory: Map<string, HealthCheckResult[]> = new Map();

	constructor(private readonly config: { maxHistoryPerEndpoint: number; baseUrl: string }) {}

	/**
	 * Perform health check on a single endpoint
	 */
	async checkHealth(config: HealthCheckConfig): Promise<HealthCheckResult> {
		const startTime = Date.now();

		try {
			const result = await this.performHealthCheck(config);
			const responseTime = Date.now() - startTime;

			const healthResult: HealthCheckResult = {
				healthy: result.healthy,
				responseTime,
				statusCode: result.statusCode,
				timestamp: new Date(),
			};

			// Store in history
			this.addToHistory(config.url, healthResult);

			return healthResult;
		} catch (error) {
			const healthResult: HealthCheckResult = {
				healthy: false,
				responseTime: Date.now() - startTime,
				error: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date(),
			};

			this.addToHistory(config.url, healthResult);
			return healthResult;
		}
	}

	/**
	 * Perform continuous health monitoring
	 */
	async monitorHealth(config: HealthCheckConfig, duration: number): Promise<HealthCheckResult[]> {
		const results: HealthCheckResult[] = [];
		const endTime = Date.now() + duration;

		while (Date.now() < endTime) {
			const result = await this.checkHealth(config);
			results.push(result);

			if (!result.healthy && config.retries > 0) {
				// Retry logic
				for (let i = 0; i < config.retries; i++) {
					await new Promise((resolve) => setTimeout(resolve, 1000));
					const retryResult = await this.checkHealth(config);
					results.push(retryResult);

					if (retryResult.healthy) {
						break;
					}
				}
			}

			await new Promise((resolve) => setTimeout(resolve, config.interval));
		}

		return results;
	}

	/**
	 * Check if environment is healthy based on recent checks
	 */
	isEnvironmentHealthy(url: string, lookbackMinutes = 5): boolean {
		const history = this.healthHistory.get(url) || [];
		const cutoff = new Date(Date.now() - lookbackMinutes * 60 * 1000);

		const recentChecks = history.filter((check) => check.timestamp > cutoff);

		if (recentChecks.length === 0) {
			return false;
		}

		const healthyChecks = recentChecks.filter((check) => check.healthy);
		const healthRatio = healthyChecks.length / recentChecks.length;

		return healthRatio >= 0.8; // 80% success rate
	}

	/**
	 * Get health history for an endpoint
	 */
	getHealthHistory(url: string): HealthCheckResult[] {
		return [...(this.healthHistory.get(url) || [])];
	}

	/**
	 * Check compliance services
	 */
	async checkComplianceServices(): Promise<boolean> {
		try {
			// Check LGPD compliance service
			const lgpdResponse = await fetch(`${this.config.baseUrl}/compliance/lgpd/status`);
			if (!lgpdResponse.ok) {
				return false;
			}

			// Check ANVISA compliance service
			const anvisaResponse = await fetch(`${this.config.baseUrl}/compliance/anvisa/status`);
			if (!anvisaResponse.ok) {
				return false;
			}

			// Check audit compliance
			const auditResponse = await fetch(`${this.config.baseUrl}/compliance/audit/status`);
			if (!auditResponse.ok) {
				return false;
			}

			return true;
		} catch (_error) {
			return false;
		}
	}

	/**
	 * Check encryption service
	 */
	async checkEncryptionService(): Promise<boolean> {
		try {
			const response = await fetch(`${this.config.baseUrl}/api/security/encryption/status`);
			return response.ok;
		} catch (_error) {
			return false;
		}
	}

	/**
	 * Check audit logging service
	 */
	async checkAuditLogging(): Promise<boolean> {
		try {
			const response = await fetch(`${this.config.baseUrl}/api/audit/logging/status`);
			return response.ok;
		} catch (_error) {
			return false;
		}
	}

	/**
	 * Check specific endpoint health
	 */
	async checkEndpoint(url: string): Promise<boolean> {
		try {
			const response = await fetch(url);
			return response.ok;
		} catch (_error) {
			return false;
		}
	}

	/**
	 * Check database health
	 */
	async checkDatabaseHealth(): Promise<boolean> {
		try {
			const response = await fetch(`${this.config.baseUrl}/api/health/database`);
			return response.ok;
		} catch (_error) {
			return false;
		}
	}

	/**
	 * Check authentication service
	 */
	async checkAuthenticationService(): Promise<boolean> {
		try {
			const response = await fetch(`${this.config.baseUrl}/api/auth/health`);
			return response.ok;
		} catch (_error) {
			return false;
		}
	}

	/**
	 * Get overall health status for multiple URLs
	 */
	getOverallStatus(urls: string[]): HealthStatus {
		const allChecks: HealthCheckResult[] = [];
		let lastCheck = new Date(0);

		for (const url of urls) {
			const history = this.healthHistory.get(url) || [];
			allChecks.push(...history);

			if (history.length > 0) {
				const lastResult = history.at(-1);
				if (lastResult && lastResult.timestamp > lastCheck) {
					lastCheck = lastResult.timestamp;
				}
			}
		}

		const overallHealth = urls.every((url) => this.isEnvironmentHealthy(url));

		return {
			environment: "mixed",
			checks: allChecks,
			overallHealth,
			lastCheck,
		};
	}

	private async performHealthCheck(_config: HealthCheckConfig): Promise<{
		healthy: boolean;
		statusCode?: number;
	}> {
		// Simulate health check - in real implementation, this would make HTTP requests
		await new Promise((resolve) => setTimeout(resolve, Math.random() * 100));

		// Simulate occasional failures
		const isHealthy = Math.random() > 0.1; // 90% success rate

		return {
			healthy: isHealthy,
			statusCode: isHealthy ? 200 : 500,
		};
	}

	private addToHistory(url: string, result: HealthCheckResult): void {
		if (!this.healthHistory.has(url)) {
			this.healthHistory.set(url, []);
		}

		const history = this.healthHistory.get(url)!;
		history.push(result);

		// Limit history size
		if (history.length > this.config.maxHistoryPerEndpoint) {
			history.shift();
		}
	}
}
