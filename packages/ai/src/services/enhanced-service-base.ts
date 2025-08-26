/**
 * @fileoverview Enhanced Service Base Class for AI Services
 * @description Provides consistent performance monitoring, caching, and logging for all AI services
 * @author NeonPro AI Development Team
 * @version 1.0.0
 *
 * Constitutional Healthcare Compliance:
 * - LGPD: Audit trails and performance monitoring for data processing
 * - ANVISA: Performance metrics for medical AI systems
 * - CFM: Professional AI service monitoring and quality assurance
 */

import type { LoggerService, MetricsService } from "@neonpro/core-services";

// AI Service Types
export type AIServiceMetrics = {
	operationId: string;
	serviceName: string;
	duration: number;
	success: boolean;
	errorType?: string;
	inputSize?: number;
	outputSize?: number;
	cacheHit?: boolean;
	confidence?: number;
	userId?: string;
	clinicId?: string;
};

export type AIServiceConfig = {
	enableCaching: boolean;
	cacheTTL: number;
	enableMetrics: boolean;
	enableAuditTrail: boolean;
	performanceThreshold: number;
	errorRetryCount: number;
};

export type CacheService = {
	get<T>(key: string): Promise<T | null>;
	set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
	invalidate(key: string): Promise<void>;
	exists(key: string): Promise<boolean>;
};

/**
 * Enhanced Service Base Class for AI Operations
 *
 * Provides consistent patterns for:
 * - Performance monitoring and metrics collection
 * - Caching with configurable TTL
 * - Comprehensive logging and audit trails
 * - Error handling and retry logic
 * - LGPD compliance tracking
 */
export abstract class EnhancedAIService<TInput, TOutput> {
	protected cache: CacheService;
	protected logger: LoggerService;
	protected metrics: MetricsService;
	protected config: AIServiceConfig;

	constructor(cache: CacheService, logger: LoggerService, metrics: MetricsService, config?: Partial<AIServiceConfig>) {
		this.cache = cache;
		this.logger = logger;
		this.metrics = metrics;
		this.config = {
			enableCaching: true,
			cacheTTL: 3600, // 1 hour default
			enableMetrics: true,
			enableAuditTrail: true,
			performanceThreshold: 2000, // 2 seconds
			errorRetryCount: 2,
			...config,
		};
	}

	/**
	 * Abstract execute method that each service must implement
	 */
	abstract execute(input: TInput): Promise<TOutput>;

	/**
	 * Get service name for logging and metrics
	 */
	protected get serviceName(): string {
		return this.constructor.name;
	}

	/**
	 * Execute with comprehensive monitoring, caching, and error handling
	 */
	async executeWithMetrics(input: TInput, context?: { userId?: string; clinicId?: string }): Promise<TOutput> {
		const startTime = Date.now();
		const operationId = this.generateOperationId();

		// Create audit trail entry
		if (this.config.enableAuditTrail) {
			await this.createAuditTrailEntry(operationId, "started", { input, context });
		}

		try {
			// Check cache first
			let result: TOutput | null = null;
			let cacheHit = false;

			if (this.config.enableCaching) {
				const cacheKey = this.generateCacheKey(input);
				result = await this.cache.get<TOutput>(cacheKey);
				cacheHit = result !== null;

				if (result) {
					this.logger.debug("Cache hit for AI operation", {
						operationId,
						serviceName: this.serviceName,
						cacheKey,
					});
				}
			}

			// Execute if not cached
			if (!result) {
				this.logger.info("Starting AI operation", {
					operationId,
					serviceName: this.serviceName,
					inputSize: JSON.stringify(input).length,
				});

				result = await this.executeWithRetry(input);

				// Cache successful results
				if (this.config.enableCaching && result) {
					const cacheKey = this.generateCacheKey(input);
					await this.cache.set(cacheKey, result, this.config.cacheTTL);
				}
			}

			const duration = Date.now() - startTime;

			// Record success metrics
			if (this.config.enableMetrics) {
				await this.recordSuccessMetrics({
					operationId,
					serviceName: this.serviceName,
					duration,
					success: true,
					inputSize: JSON.stringify(input).length,
					outputSize: JSON.stringify(result).length,
					cacheHit,
					confidence: this.extractConfidence(result),
					userId: context?.userId,
					clinicId: context?.clinicId,
				});
			}

			// Log success
			this.logger.info("AI operation completed successfully", {
				operationId,
				serviceName: this.serviceName,
				duration,
				cacheHit,
				performanceOk: duration <= this.config.performanceThreshold,
			});

			// Update audit trail
			if (this.config.enableAuditTrail) {
				await this.createAuditTrailEntry(operationId, "completed", {
					result: this.sanitizeForAudit(result),
					duration,
					cacheHit,
				});
			}

			// Performance warning
			if (duration > this.config.performanceThreshold) {
				this.logger.warn("AI operation exceeded performance threshold", {
					operationId,
					serviceName: this.serviceName,
					duration,
					threshold: this.config.performanceThreshold,
				});
			}

			return result;
		} catch (error) {
			const duration = Date.now() - startTime;

			// Record error metrics
			if (this.config.enableMetrics) {
				await this.recordErrorMetrics({
					operationId,
					serviceName: this.serviceName,
					duration,
					success: false,
					errorType: error.name || "UnknownError",
					userId: context?.userId,
					clinicId: context?.clinicId,
				});
			}

			// Log error
			this.logger.error("AI operation failed", {
				operationId,
				serviceName: this.serviceName,
				error: error.message,
				stack: error.stack,
				duration,
			});

			// Update audit trail
			if (this.config.enableAuditTrail) {
				await this.createAuditTrailEntry(operationId, "failed", {
					error: error.message,
					duration,
				});
			}

			throw error;
		}
	}

	/**
	 * Execute with retry logic for transient failures
	 */
	private async executeWithRetry(input: TInput, retryCount = 0): Promise<TOutput> {
		try {
			return await this.execute(input);
		} catch (error) {
			// Retry for specific error types
			if (this.shouldRetry(error) && retryCount < this.config.errorRetryCount) {
				this.logger.warn("Retrying AI operation after error", {
					serviceName: this.serviceName,
					error: error.message,
					retryCount: retryCount + 1,
					maxRetries: this.config.errorRetryCount,
				});

				// Exponential backoff
				const delay = 2 ** retryCount * 1000;
				await this.sleep(delay);

				return await this.executeWithRetry(input, retryCount + 1);
			}

			throw error;
		}
	}

	/**
	 * Generate cache key for input
	 */
	protected generateCacheKey(input: TInput): string {
		const inputHash = this.hashInput(input);
		return `ai:${this.serviceName.toLowerCase()}:${inputHash}`;
	}

	/**
	 * Generate unique operation ID
	 */
	protected generateOperationId(): string {
		return `${this.serviceName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Hash input for cache key generation
	 */
	protected hashInput(input: TInput): string {
		const inputString = JSON.stringify(input, Object.keys(input).sort());
		return Buffer.from(inputString).toString("base64").replace(/[+/=]/g, "").substr(0, 32);
	}

	/**
	 * Extract confidence score from result (override in subclasses)
	 */
	protected extractConfidence(result: TOutput): number | undefined {
		if (typeof result === "object" && result !== null && "confidence" in result) {
			return (result as any).confidence;
		}
		return;
	}

	/**
	 * Sanitize result for audit trail (remove sensitive data)
	 */
	protected sanitizeForAudit(result: TOutput): any {
		// Default implementation - override in subclasses for specific sanitization
		if (typeof result === "object" && result !== null) {
			const sanitized = { ...(result as any) };

			// Remove common sensitive fields
			sanitized.apiKey = undefined;
			sanitized.token = undefined;
			sanitized.password = undefined;
			sanitized.personalData = undefined;

			return sanitized;
		}

		return result;
	}

	/**
	 * Determine if error should trigger retry
	 */
	protected shouldRetry(error: any): boolean {
		// Retry for network errors, rate limits, and temporary service issues
		const retryableErrors = [
			"NetworkError",
			"TimeoutError",
			"RateLimitError",
			"ServiceUnavailable",
			"InternalServerError",
		];

		return retryableErrors.some(
			(errorType) => error.name?.includes(errorType) || error.message?.includes(errorType.toLowerCase())
		);
	}

	/**
	 * Record success metrics
	 */
	protected async recordSuccessMetrics(metrics: AIServiceMetrics): Promise<void> {
		try {
			await this.metrics.record("ai_operation_success", {
				value: metrics.duration,
				tags: {
					service: metrics.serviceName,
					operation_id: metrics.operationId,
					cache_hit: metrics.cacheHit,
					user_id: metrics.userId,
					clinic_id: metrics.clinicId,
				},
				fields: {
					duration: metrics.duration,
					input_size: metrics.inputSize,
					output_size: metrics.outputSize,
					confidence: metrics.confidence,
				},
			});

			// Record separate confidence metric if available
			if (metrics.confidence !== undefined) {
				await this.metrics.record("ai_confidence_score", {
					value: metrics.confidence,
					tags: {
						service: metrics.serviceName,
						operation_id: metrics.operationId,
					},
				});
			}
		} catch (error) {
			this.logger.error("Failed to record success metrics", { error: error.message });
		}
	}

	/**
	 * Record error metrics
	 */
	protected async recordErrorMetrics(metrics: AIServiceMetrics): Promise<void> {
		try {
			await this.metrics.record("ai_operation_error", {
				value: 1,
				tags: {
					service: metrics.serviceName,
					operation_id: metrics.operationId,
					error_type: metrics.errorType,
					user_id: metrics.userId,
					clinic_id: metrics.clinicId,
				},
				fields: {
					duration: metrics.duration,
				},
			});
		} catch (error) {
			this.logger.error("Failed to record error metrics", { error: error.message });
		}
	}

	/**
	 * Create audit trail entry for compliance
	 */
	protected async createAuditTrailEntry(
		operationId: string,
		status: "started" | "completed" | "failed",
		data: any
	): Promise<void> {
		try {
			// This would integrate with your existing audit system
			const auditEntry = {
				operation_id: operationId,
				service_name: this.serviceName,
				status,
				timestamp: new Date().toISOString(),
				data: this.sanitizeForAudit(data),
			};

			// Store in audit log (implementation depends on your audit system)
			this.logger.info("Audit trail entry", auditEntry);
		} catch (error) {
			this.logger.error("Failed to create audit trail entry", { error: error.message });
		}
	}

	/**
	 * Sleep utility for retry delays
	 */
	protected sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Performance monitoring helper
	 */
	protected async recordPerformanceMetric(type: string, value: number, metadata?: any): Promise<void> {
		if (!this.config.enableMetrics) {
			return;
		}

		try {
			await this.metrics.record(`ai_${type}`, {
				value,
				tags: {
					service: this.serviceName,
					metric_type: type,
				},
				fields: {
					...metadata,
				},
			});
		} catch (error) {
			this.logger.error("Failed to record performance metric", {
				error: error.message,
				type,
				value,
			});
		}
	}

	/**
	 * Health check for AI service
	 */
	async healthCheck(): Promise<{ healthy: boolean; details: any }> {
		try {
			// Basic connectivity and configuration check
			const checks = {
				cache_connection: await this.checkCacheConnection(),
				configuration_valid: this.validateConfiguration(),
				performance_ok: true, // Will be updated based on recent metrics
			};

			const healthy = Object.values(checks).every((check) => check === true);

			return {
				healthy,
				details: {
					service: this.serviceName,
					checks,
					last_check: new Date().toISOString(),
				},
			};
		} catch (error) {
			return {
				healthy: false,
				details: {
					service: this.serviceName,
					error: error.message,
					last_check: new Date().toISOString(),
				},
			};
		}
	}

	/**
	 * Check cache connection
	 */
	private async checkCacheConnection(): Promise<boolean> {
		try {
			const testKey = `healthcheck:${this.serviceName}:${Date.now()}`;
			await this.cache.set(testKey, "test", 10);
			const result = await this.cache.get(testKey);
			await this.cache.invalidate(testKey);
			return result === "test";
		} catch (_error) {
			return false;
		}
	}

	/**
	 * Validate service configuration
	 */
	private validateConfiguration(): boolean {
		return this.config.cacheTTL > 0 && this.config.performanceThreshold > 0 && this.config.errorRetryCount >= 0;
	}
}
