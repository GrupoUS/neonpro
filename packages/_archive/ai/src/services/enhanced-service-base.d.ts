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
export interface AIServiceMetrics {
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
}
export interface AIServiceConfig {
    enableCaching: boolean;
    cacheTTL: number;
    enableMetrics: boolean;
    enableAuditTrail: boolean;
    performanceThreshold: number;
    errorRetryCount: number;
}
export interface CacheService {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    invalidate(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
}
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
export declare abstract class EnhancedAIService<TInput, TOutput> {
    protected cache: CacheService;
    protected logger: LoggerService;
    protected metrics: MetricsService;
    protected config: AIServiceConfig;
    constructor(cache: CacheService, logger: LoggerService, metrics: MetricsService, config?: Partial<AIServiceConfig>);
    /**
     * Abstract execute method that each service must implement
     */
    abstract execute(input: TInput): Promise<TOutput>;
    /**
     * Get service name for logging and metrics
     */
    protected get serviceName(): string;
    /**
     * Execute with comprehensive monitoring, caching, and error handling
     */
    executeWithMetrics(input: TInput, context?: {
        userId?: string;
        clinicId?: string;
    }): Promise<TOutput>;
    /**
     * Execute with retry logic for transient failures
     */
    private executeWithRetry;
    /**
     * Generate cache key for input
     */
    protected generateCacheKey(input: TInput): string;
    /**
     * Generate unique operation ID
     */
    protected generateOperationId(): string;
    /**
     * Hash input for cache key generation
     */
    protected hashInput(input: TInput): string;
    /**
     * Extract confidence score from result (override in subclasses)
     */
    protected extractConfidence(result: TOutput): number | undefined;
    /**
     * Sanitize result for audit trail (remove sensitive data)
     */
    protected sanitizeForAudit(result: TOutput): unknown;
    /**
     * Determine if error should trigger retry
     */
    protected shouldRetry(error: unknown): boolean;
    /**
     * Record success metrics
     */
    protected recordSuccessMetrics(metrics: AIServiceMetrics): Promise<void>;
    /**
     * Record error metrics
     */
    protected recordErrorMetrics(metrics: AIServiceMetrics): Promise<void>;
    /**
     * Create audit trail entry for compliance
     */
    protected createAuditTrailEntry(operationId: string, status: "started" | "completed" | "failed", data: unknown): Promise<void>;
    /**
     * Sleep utility for retry delays
     */
    protected sleep(ms: number): Promise<void>;
    /**
     * Performance monitoring helper
     */
    protected recordPerformanceMetric(type: string, value: number, metadata?: unknown): Promise<void>;
    /**
     * Health check for AI service
     */
    healthCheck(): Promise<{
        healthy: boolean;
        details: unknown;
    }>;
    /**
     * Check cache connection
     */
    private checkCacheConnection;
    /**
     * Validate service configuration
     */
    private validateConfiguration;
}
//# sourceMappingURL=enhanced-service-base.d.ts.map