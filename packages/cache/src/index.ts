import { LRUCache } from "lru-cache";

// Healthcare-compliant cache configuration
type CacheOptions = {
	maxItems?: number;
	ttl?: number; // Time to live in milliseconds
	updateAgeOnGet?: boolean;
	allowStale?: boolean;
	encryptSensitiveData?: boolean;
};

// Generic cache data structure
type CacheData<T = unknown> = {
	data: T;
	timestamp: number;
	auditLog: string[];
};

// LGPD-compliant cache for patient data
type SensitiveDataCache<T = unknown> = {
	data: T;
	encrypted: boolean;
	patientConsent: boolean;
	expiresAt: number;
	auditLog: string[];
};

class HealthcareCacheManager {
	private readonly memoryCache: LRUCache<string, CacheData>;
	private readonly sensitiveCache: LRUCache<string, SensitiveDataCache>;

	constructor(options: CacheOptions = {}) {
		// Memory cache for non-sensitive data
		this.memoryCache = new LRUCache({
			max: options.maxItems || 1000,
			ttl: options.ttl || 1000 * 60 * 15, // 15 minutes default
			updateAgeOnGet: options.updateAgeOnGet ?? true,
			allowStale: options.allowStale ?? false,
		});

		// Separate cache for sensitive healthcare data
		this.sensitiveCache = new LRUCache({
			max: 100, // Limited sensitive data cache
			ttl: 1000 * 60 * 5, // 5 minutes for sensitive data
			updateAgeOnGet: false, // No age update for security
			allowStale: false, // Never allow stale sensitive data
		});
	}

	// Cache non-sensitive data (appointments, general info)
	set<T>(key: string, value: T, ttl?: number): void {
		this.memoryCache.set(
			key,
			{
				data: value,
				timestamp: Date.now(),
				auditLog: [`Cache set: ${new Date().toISOString()}`],
			},
			{ ttl },
		);
	}

	// Get non-sensitive data
	get<T>(key: string): T | null {
		const cached = this.memoryCache.get(key);
		if (cached) {
			cached.auditLog.push(`Cache access: ${new Date().toISOString()}`);
			return cached.data as T;
		}
		return null;
	}

	// Cache sensitive patient data with LGPD compliance
	setSensitive<T>(
		key: string,
		value: T,
		patientConsent = false,
		ttl: number = 1000 * 60 * 5, // 5 minutes default
	): void {
		if (!patientConsent) {
			return;
		}

		const sensitiveData: SensitiveDataCache<T> = {
			data: value,
			encrypted: true, // Mark as requiring encryption
			patientConsent,
			expiresAt: Date.now() + ttl,
			auditLog: [
				`Sensitive cache set: ${new Date().toISOString()}`,
				`Patient consent: ${patientConsent}`,
				`TTL: ${ttl}ms`,
			],
		};

		this.sensitiveCache.set(key, sensitiveData, { ttl });
	}

	// Get sensitive data with LGPD audit
	getSensitive<T>(key: string, auditUserId?: string): T | null {
		const cached = this.sensitiveCache.get(key);

		if (cached) {
			// LGPD audit logging
			cached.auditLog.push(
				`Sensitive access: ${new Date().toISOString()}`,
				`User: ${auditUserId || "anonymous"}`,
				`Consent verified: ${cached.patientConsent}`,
			);

			// Check expiration (extra security layer)
			if (Date.now() > cached.expiresAt) {
				this.sensitiveCache.delete(key);
				return null;
			}

			return cached.data as T;
		}

		return null;
	}

	// Clear all sensitive data (LGPD compliance)
	clearSensitiveData(): void {
		this.sensitiveCache.clear();
	}

	// Get cache statistics for monitoring
	getStats() {
		return {
			memoryCache: {
				size: this.memoryCache.size,
				max: this.memoryCache.max,
				calculatedSize: this.memoryCache.calculatedSize,
			},
			sensitiveCache: {
				size: this.sensitiveCache.size,
				max: this.sensitiveCache.max,
				calculatedSize: this.sensitiveCache.calculatedSize,
			},
			timestamp: new Date().toISOString(),
		};
	}

	// Healthcare-specific cache invalidation
	invalidatePatientData(patientId: string): void {
		const keys = Array.from(this.memoryCache.keys()).filter((key) =>
			key.includes(`patient_${patientId}`),
		);

		for (const key of keys) {
			this.memoryCache.delete(key);
			this.sensitiveCache.delete(key);
		}
	}

	// ANVISA compliance: Clear cache on audit request
	auditClearance(): void {
		this.memoryCache.clear();
		this.sensitiveCache.clear();
	}
}

// Singleton instance for app-wide use
export const healthcareCache = new HealthcareCacheManager({
	maxItems: 2000,
	ttl: 1000 * 60 * 10, // 10 minutes default
	encryptSensitiveData: true,
});

// Export for custom instances
export { HealthcareCacheManager };

// Export enterprise cache service
export * from "./enterprise";

// Utility functions
export const cacheKeys = {
	patient: (id: string) => `patient_${id}`,
	appointment: (id: string) => `appointment_${id}`,
	compliance: (type: string) => `compliance_${type}`,
	report: (type: string, date: string) => `report_${type}_${date}`,
} as const;
