import type { CacheOperation, CacheStats } from "./types";

export class DatabaseCacheLayer implements CacheOperation {
	private cache = new Map<string, any>();
	private stats: CacheStats = {
		hits: 0,
		misses: 0,
		hitRate: 0,
		totalRequests: 0,
		averageResponseTime: 0,
	};
	private responseTimeBuffer: number[] = [];
	private queryBuffer = new Map<string, Promise<any>>();

	constructor(
		private config = {
			defaultTTL: 30 * 1000, // 30 seconds
			maxTTL: 5 * 60 * 1000, // 5 minutes
			maxSize: 500,
			dedupeConcurrentQueries: true,
			auditTrail: true,
		}
	) {}

	async get<T>(key: string): Promise<T | null> {
		const startTime = performance.now();
		this.stats.totalRequests++;

		// Check if we have ongoing query for this key (deduplication)
		if (this.config.dedupeConcurrentQueries && this.queryBuffer.has(key)) {
			try {
				const result = await this.queryBuffer.get(key);
				this.stats.hits++;
				this.updateStats(startTime);
				return result;
			} catch (error) {
				this.queryBuffer.delete(key);
				this.stats.misses++;
				this.updateStats(startTime);
				return null;
			}
		}
		const entry = this.cache.get(key);
		if (!entry) {
			this.stats.misses++;
			this.updateStats(startTime);
			return null;
		}

		// Check TTL expiration
		if (Date.now() > entry.timestamp + entry.ttl) {
			this.cache.delete(key);
			this.stats.misses++;
			this.updateStats(startTime);
			return null;
		}

		// Healthcare audit trail
		if (this.config.auditTrail && entry.healthcareData) {
			this.logHealthcareAccess(key, "CACHE_HIT");
		}

		this.stats.hits++;
		this.updateStats(startTime);
		return entry.value;
	}

	async set<T>(
		key: string,
		value: T,
		ttl?: number,
		options?: {
			healthcareData?: boolean;
			patientId?: string;
			auditContext?: string;
		}
	): Promise<void> {
		// Evict if cache is full
		if (this.cache.size >= this.config.maxSize) {
			this.evictLRU();
		}

		const effectiveTTL = Math.min(ttl || this.config.defaultTTL, this.config.maxTTL);

		const entry = {
			value,
			timestamp: Date.now(),
			ttl: effectiveTTL,
			healthcareData: options?.healthcareData,
			patientId: options?.patientId,
			auditContext: options?.auditContext,
			lastAccessed: Date.now(),
		};

		this.cache.set(key, entry);

		// Healthcare audit trail
		if (this.config.auditTrail && entry.healthcareData) {
			this.logHealthcareAccess(key, "CACHE_SET", options?.auditContext);
		}
	}
	async delete(key: string): Promise<void> {
		const entry = this.cache.get(key);
		this.cache.delete(key);

		// Healthcare audit trail
		if (this.config.auditTrail && entry?.healthcareData) {
			this.logHealthcareAccess(key, "CACHE_DELETE");
		}
	}

	async clear(): Promise<void> {
		this.cache.clear();
		this.queryBuffer.clear();
		this.resetStats();
	}

	async getStats(): Promise<CacheStats> {
		this.stats.hitRate = this.stats.totalRequests > 0 ? (this.stats.hits / this.stats.totalRequests) * 100 : 0;
		return { ...this.stats };
	}

	async invalidateByTags(tags: string[]): Promise<void> {
		for (const [key, entry] of this.cache.entries()) {
			if (entry.tags && entry.tags.some((tag: string) => tags.includes(tag))) {
				await this.delete(key);
			}
		}
	}

	// Query deduplication for database operations
	async executeWithDedup<T>(key: string, queryFn: () => Promise<T>): Promise<T> {
		if (this.queryBuffer.has(key)) {
			return await this.queryBuffer.get(key);
		}

		const queryPromise = queryFn();
		this.queryBuffer.set(key, queryPromise);

		try {
			const result = await queryPromise;
			this.queryBuffer.delete(key);
			return result;
		} catch (error) {
			this.queryBuffer.delete(key);
			throw error;
		}
	}
	private evictLRU(): void {
		let oldestKey = "";
		let oldestTime = Date.now();

		for (const [key, entry] of this.cache.entries()) {
			if (entry.lastAccessed < oldestTime) {
				oldestTime = entry.lastAccessed;
				oldestKey = key;
			}
		}

		if (oldestKey) {
			this.cache.delete(oldestKey);
		}
	}

	private logHealthcareAccess(key: string, operation: string, context?: string): void {
		// Healthcare audit trail - integration with audit system
		console.log(
			`[HEALTHCARE AUDIT] ${new Date().toISOString()} - ${operation} - Key: ${key} - Context: ${context || "N/A"}`
		);
	}

	private updateStats(startTime: number): void {
		const responseTime = performance.now() - startTime;
		this.responseTimeBuffer.push(responseTime);

		if (this.responseTimeBuffer.length > 100) {
			this.responseTimeBuffer.shift();
		}

		this.stats.averageResponseTime =
			this.responseTimeBuffer.reduce((a, b) => a + b, 0) / this.responseTimeBuffer.length;
	}

	private resetStats(): void {
		this.stats = { hits: 0, misses: 0, hitRate: 0, totalRequests: 0, averageResponseTime: 0 };
		this.responseTimeBuffer = [];
	}
}
