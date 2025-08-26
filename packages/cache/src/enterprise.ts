/**
 * Enterprise Cache Integration
 * Enhances existing HealthcareCacheManager with EnterpriseCacheService
 * Maintains backward compatibility while adding enterprise features
 */

import { EnhancedServiceBase } from "@neonpro/core-services";
import { HealthcareCacheManager, healthcareCache } from "./index";

/**
 * Enhanced cache service with enterprise features
 */
export class CacheServiceFactory extends EnhancedServiceBase {
	private readonly healthcareCache: HealthcareCacheManager;

	constructor(options: any = {}) {
		super("cache-service-factory", {
			enableCache: true,
			enableAnalytics: true,
			enableSecurity: true,
			enableAudit: true,
			healthCheck: {
				enabled: true,
				interval: 30_000,
				timeout: 5000,
			},
		});

		this.healthcareCache = new HealthcareCacheManager(options);
	}

	/**
	 * Enhanced set with enterprise features
	 */
	async setEnhanced<T>(
		key: string,
		value: T,
		ttl?: number,
		options: {
			useMultiLayer?: boolean;
			encrypt?: boolean;
			auditLog?: boolean;
			analytics?: boolean;
		} = {}
	): Promise<void> {
		const startTime = this.startTiming("cache_set_enhanced");

		try {
			// Use original healthcare cache for basic functionality
			this.healthcareCache.set(key, value, ttl);

			// Enterprise multi-layer caching
			if (options.useMultiLayer) {
				await this.cache.setMultiLayer(key, value, {
					ttl: ttl || 300_000, // 5 minutes default
					layers: ["memory", "redis"],
					compress: true,
					encrypt: options.encrypt,
				});
			}

			// Enterprise analytics
			if (options.analytics !== false) {
				await this.analytics.trackEvent("cache_set", {
					key: this.sanitizeKey(key),
					ttl,
					multiLayer: options.useMultiLayer,
					encrypted: options.encrypt,
				});
			}

			// Enterprise audit
			if (options.auditLog !== false) {
				await this.audit.logOperation("cache_set", {
					key: this.sanitizeKey(key),
					ttl,
					timestamp: new Date(),
					multiLayer: options.useMultiLayer,
				});
			}

			this.endTiming("cache_set_enhanced", startTime);
		} catch (error) {
			this.endTiming("cache_set_enhanced", startTime, { error: true });
			throw error;
		}
	}

	/**
	 * Enhanced get with enterprise features
	 */
	async getEnhanced<T>(
		key: string,
		options: {
			useMultiLayer?: boolean;
			analytics?: boolean;
			auditLog?: boolean;
		} = {}
	): Promise<T | null> {
		const startTime = this.startTiming("cache_get_enhanced");

		try {
			let result: T | null = null;

			// Try enterprise multi-layer cache first
			if (options.useMultiLayer) {
				result = await this.cache.getMultiLayer<T>(key);
			}

			// Fallback to healthcare cache
			if (!result) {
				result = this.healthcareCache.get<T>(key);
			}

			// Enterprise analytics
			if (options.analytics !== false) {
				await this.analytics.trackEvent("cache_get", {
					key: this.sanitizeKey(key),
					hit: !!result,
					multiLayer: options.useMultiLayer,
				});
			}

			// Enterprise audit for sensitive data access
			if (options.auditLog && result) {
				await this.audit.logOperation("cache_access", {
					key: this.sanitizeKey(key),
					timestamp: new Date(),
					hit: true,
				});
			}

			this.endTiming("cache_get_enhanced", startTime, { hit: !!result });
			return result;
		} catch (_error) {
			this.endTiming("cache_get_enhanced", startTime, { error: true });
			return null;
		}
	}

	/**
	 * Enhanced sensitive data caching with LGPD compliance
	 */
	async setSensitiveEnhanced<T>(
		key: string,
		value: T,
		patientConsent: boolean,
		ttl = 300_000,
		options: {
			auditUserId?: string;
			purpose?: string;
		} = {}
	): Promise<void> {
		const startTime = this.startTiming("cache_set_sensitive");

		try {
			// Use original healthcare cache
			this.healthcareCache.setSensitive(key, value, patientConsent, ttl);

			// Enterprise encryption and audit
			if (patientConsent) {
				await this.cache.setMultiLayer(key, value, {
					ttl,
					layers: ["redis"], // Sensitive data only in Redis, not memory
					encrypt: true,
					compress: true,
				});

				// Mandatory audit for sensitive data
				await this.audit.logOperation("sensitive_cache_set", {
					key: this.sanitizeKey(key),
					patientConsent,
					userId: options.auditUserId,
					purpose: options.purpose || "healthcare_data_access",
					timestamp: new Date(),
					lgpdCompliant: true,
				});

				// Enterprise security monitoring
				await this.security.logSensitiveDataAccess({
					operation: "cache_set",
					dataType: "patient_data",
					userId: options.auditUserId,
					consent: patientConsent,
				});
			}

			this.endTiming("cache_set_sensitive", startTime);
		} catch (error) {
			this.endTiming("cache_set_sensitive", startTime, { error: true });
			throw error;
		}
	}

	/**
	 * Enhanced sensitive data retrieval with LGPD compliance
	 */
	async getSensitiveEnhanced<T>(
		key: string,
		auditUserId?: string,
		options: {
			purpose?: string;
			emergencyAccess?: boolean;
		} = {}
	): Promise<T | null> {
		const startTime = this.startTiming("cache_get_sensitive");

		try {
			// Use original healthcare cache first
			let result = this.healthcareCache.getSensitive<T>(key, auditUserId);

			// Try enterprise cache if not found
			if (!result) {
				result = await this.cache.getMultiLayer<T>(key);
			}

			if (result) {
				// Mandatory audit for sensitive data access
				await this.audit.logOperation("sensitive_cache_access", {
					key: this.sanitizeKey(key),
					userId: auditUserId,
					purpose: options.purpose || "healthcare_data_access",
					emergencyAccess: options.emergencyAccess,
					timestamp: new Date(),
					lgpdCompliant: true,
				});

				// Enterprise security monitoring
				await this.security.logSensitiveDataAccess({
					operation: "cache_get",
					dataType: "patient_data",
					userId: auditUserId,
					emergencyAccess: options.emergencyAccess,
				});

				// Analytics for access patterns
				await this.analytics.trackEvent("sensitive_data_access", {
					dataType: "cached_patient_data",
					userId: auditUserId,
					emergencyAccess: options.emergencyAccess,
				});
			}

			this.endTiming("cache_get_sensitive", startTime, { hit: !!result });
			return result;
		} catch (_error) {
			this.endTiming("cache_get_sensitive", startTime, { error: true });
			return null;
		}
	}

	/**
	 * Enterprise cache statistics with health monitoring
	 */
	async getEnhancedStats() {
		try {
			// Get original healthcare cache stats
			const healthcareStats = this.healthcareCache.getStats();

			// Get enterprise cache stats
			const enterpriseStats = await this.cache.getStats();

			// Get enterprise health status
			const healthStatus = await this.getHealth();

			return {
				healthcare: healthcareStats,
				enterprise: enterpriseStats,
				health: healthStatus,
				timestamp: new Date().toISOString(),
				performance: {
					avgSetTime: await this.analytics.getMetric("cache_set_enhanced", "avg_duration"),
					avgGetTime: await this.analytics.getMetric("cache_get_enhanced", "avg_duration"),
					hitRate: await this.analytics.getMetric("cache_get_enhanced", "hit_rate"),
				},
			};
		} catch (_error) {
			return {
				error: "Failed to retrieve cache statistics",
				timestamp: new Date().toISOString(),
			};
		}
	}

	/**
	 * LGPD compliance: Clear patient data
	 */
	async clearPatientDataLGPD(patientId: string, auditUserId: string): Promise<void> {
		try {
			// Use original healthcare cache method
			this.healthcareCache.invalidatePatientData(patientId);

			// Clear from enterprise cache layers
			await this.cache.invalidatePattern(`patient_${patientId}*`);

			// Mandatory audit for LGPD compliance
			await this.audit.logOperation("lgpd_patient_data_clear", {
				patientId,
				auditUserId,
				timestamp: new Date(),
				compliance: "LGPD_ARTICLE_17", // Right to erasure
				scope: "all_cache_layers",
			});

			// Enterprise analytics
			await this.analytics.trackEvent("lgpd_data_erasure", {
				dataType: "patient_cache",
				patientId,
				auditUserId,
			});
		} catch (error) {
			await this.audit.logOperation("lgpd_clear_error", {
				patientId,
				auditUserId,
				error: error.message,
				timestamp: new Date(),
			});
			throw error;
		}
	}

	/**
	 * ANVISA compliance: Audit clearance
	 */
	async anvisaAuditClearance(auditId: string, auditUserId: string): Promise<void> {
		try {
			// Use original healthcare cache method
			this.healthcareCache.auditClearance();

			// Clear enterprise cache layers
			await this.cache.clearAll();

			// Mandatory audit for ANVISA compliance
			await this.audit.logOperation("anvisa_audit_clearance", {
				auditId,
				auditUserId,
				timestamp: new Date(),
				compliance: "ANVISA_RDC_301",
				scope: "all_cache_systems",
			});

			// Enterprise analytics
			await this.analytics.trackEvent("anvisa_audit_clearance", {
				auditId,
				auditUserId,
				cacheSystemsCleared: ["memory", "redis", "enterprise"],
			});
		} catch (error) {
			await this.audit.logOperation("anvisa_clearance_error", {
				auditId,
				auditUserId,
				error: error.message,
				timestamp: new Date(),
			});
			throw error;
		}
	}

	// Private helper methods
	private sanitizeKey(key: string): string {
		// Remove sensitive information from keys for logging
		return key
			.replace(/\b\d{11}\b/g, "[CPF]")
			.replace(/\b\d{15}\b/g, "[CNS]")
			.replace(/patient_\d+/g, "patient_[ID]");
	}

	// Backward compatibility methods - delegate to original implementation
	set<T>(key: string, value: T, ttl?: number): void {
		this.healthcareCache.set(key, value, ttl);
	}

	get<T>(key: string): T | null {
		return this.healthcareCache.get<T>(key);
	}

	setSensitive<T>(key: string, value: T, patientConsent = false, ttl = 300_000): void {
		this.healthcareCache.setSensitive(key, value, patientConsent, ttl);
	}

	getSensitive<T>(key: string, auditUserId?: string): T | null {
		return this.healthcareCache.getSensitive<T>(key, auditUserId);
	}

	clearSensitiveData(): void {
		this.healthcareCache.clearSensitiveData();
	}

	getStats() {
		return this.healthcareCache.getStats();
	}

	invalidatePatientData(patientId: string): void {
		this.healthcareCache.invalidatePatientData(patientId);
	}

	auditClearance(): void {
		this.healthcareCache.auditClearance();
	}
}

// Enhanced singleton instance
export const enhancedHealthcareCache = new CacheServiceFactory({
	maxItems: 2000,
	ttl: 1000 * 60 * 10, // 10 minutes default
	encryptSensitiveData: true,
});

// Export original for backward compatibility
export { healthcareCache, HealthcareCacheManager };
