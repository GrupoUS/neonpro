// Cache Management Service for AI Services
// High-performance caching with TTL, tagging, invalidation, and analytics

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Redis from "ioredis";
import {
	type AIServiceInput,
	type AIServiceOutput,
	EnhancedAIService,
} from "./enhanced-service-base";

// Cache Types and Interfaces
export type CacheEntry = {
	id: string;
	key: string;
	value: string; // JSON stringified value
	namespace: string;
	ttl_seconds: number;
	tags: string[];
	metadata: CacheMetadata;
	created_at: string;
	expires_at: string;
	last_accessed?: string;
	access_count?: number;
};

export type CacheMetadata = {
	size_bytes: number;
	compression?: string;
	content_type?: string;
	source_service?: string;
	version?: string;
	dependencies?: string[];
	invalidation_rules?: string[];
};

export interface CacheInput extends AIServiceInput {
	action:
		| "get"
		| "set"
		| "delete"
		| "exists"
		| "invalidate"
		| "stats"
		| "cleanup"
		| "bulk_get"
		| "bulk_set";
	key?: string;
	keys?: string[];
	value?: any;
	namespace?: string;
	ttl_seconds?: number;
	tags?: string[];
	metadata?: Partial<CacheMetadata>;
	invalidation_pattern?: string;
	cleanup_options?: CacheCleanupOptions;
	bulk_data?: Array<{
		key: string;
		value: any;
		ttl_seconds?: number;
		tags?: string[];
	}>;
}

export interface CacheOutput extends AIServiceOutput {
	value?: any;
	values?: Record<string, any>;
	exists?: boolean;
	cache_stats?: CacheStats;
	entries_affected?: number;
	cache_hit?: boolean;
	response_time_ms?: number;
	size_bytes?: number;
	bulk_results?: Array<{ key: string; success: boolean; error?: string }>;
}

export type CacheCleanupOptions = {
	expired_only?: boolean;
	namespace?: string;
	tags?: string[];
	older_than_hours?: number;
	max_entries_to_remove?: number;
	dry_run?: boolean;
};

export type CacheStats = {
	total_entries: number;
	total_size_bytes: number;
	hit_rate_percent: number;
	miss_rate_percent: number;
	average_ttl_seconds: number;
	expired_entries: number;
	namespace_breakdown: Record<string, number>;
	tag_breakdown: Record<string, number>;
	recent_activity: {
		hits_last_hour: number;
		misses_last_hour: number;
		sets_last_hour: number;
		deletes_last_hour: number;
	};
	memory_usage: {
		redis_used_memory: number;
		redis_peak_memory: number;
		database_cache_size: number;
	};
};

// Cache Management Service Implementation
export class CacheManagementService extends EnhancedAIService<
	CacheInput,
	CacheOutput
> {
	private readonly supabase: SupabaseClient;
	private readonly redis: Redis | null = null;
	private readonly cacheStats: Map<string, number> = new Map();
	private readonly DEFAULT_TTL = 3600; // 1 hour
	private readonly MAX_VALUE_SIZE = 1024 * 1024; // 1MB
	private readonly REDIS_KEY_PREFIX = "neonpro:ai:";

	constructor() {
		super("cache_management_service");

		this.supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.SUPABASE_SERVICE_ROLE_KEY!,
		);

		// Initialize Redis if available
		this.initializeRedis();

		// Start cleanup interval
		this.startCleanupInterval();
	}

	private async initializeRedis(): Promise<void> {
		try {
			if (process.env.REDIS_URL) {
				this.redis = new Redis(process.env.REDIS_URL, {
					retryDelayOnFailover: 100,
					maxRetriesPerRequest: 3,
					lazyConnect: true,
				});

				await this.redis.ping();

				// Set up Redis event handlers
				this.redis.on("error", (error) => {
					this.recordMetric("redis_error", { error: error.message });
				});

				this.redis.on("ready", () => {});
			}
		} catch (_error) {
			this.redis = null;
		}
	}

	protected async executeCore(input: CacheInput): Promise<CacheOutput> {
		const startTime = performance.now();

		try {
			switch (input.action) {
				case "get":
					return await this.getCacheEntry(input);
				case "set":
					return await this.setCacheEntry(input);
				case "delete":
					return await this.deleteCacheEntry(input);
				case "exists":
					return await this.checkCacheExists(input);
				case "invalidate":
					return await this.invalidateCache(input);
				case "stats":
					return await this.getCacheStats();
				case "cleanup":
					return await this.cleanupCache(input);
				case "bulk_get":
					return await this.bulkGetCacheEntries(input);
				case "bulk_set":
					return await this.bulkSetCacheEntries(input);
				default:
					throw new Error(`Unsupported cache action: ${input.action}`);
			}
		} finally {
			const duration = performance.now() - startTime;
			await this.recordMetric("cache_operation", {
				action: input.action,
				duration_ms: duration,
				redis_available: !!this.redis,
			});
		}
	}

	private async getCacheEntry(input: CacheInput): Promise<CacheOutput> {
		if (!input.key) {
			throw new Error("Key is required for get operation");
		}

		const namespace = input.namespace || "default";
		const fullKey = `${namespace}:${input.key}`;
		const startTime = performance.now();

		// Try Redis first if available
		if (this.redis) {
			try {
				const redisKey = `${this.REDIS_KEY_PREFIX}${fullKey}`;
				const value = await this.redis.get(redisKey);

				if (value !== null) {
					this.incrementStat("redis_hits");

					// Update access statistics in database asynchronously
					this.updateAccessStats(fullKey).catch(console.error);

					return {
						success: true,
						value: JSON.parse(value),
						cache_hit: true,
						response_time_ms: performance.now() - startTime,
					};
				}
			} catch (_error) {
				// Fall through to database cache
			}
		}

		// Check database cache
		const { data, error } = await this.supabase
			.from("ai_service_cache")
			.select("*")
			.eq("key", fullKey)
			.gt("expires_at", new Date().toISOString())
			.single();

		if (error || !data) {
			this.incrementStat("cache_misses");
			return {
				success: true,
				value: null,
				cache_hit: false,
				response_time_ms: performance.now() - startTime,
			};
		}

		this.incrementStat("db_cache_hits");

		// Update Redis cache if available
		if (this.redis && data.value) {
			try {
				const redisKey = `${this.REDIS_KEY_PREFIX}${fullKey}`;
				const ttlSeconds = Math.max(
					0,
					Math.floor((new Date(data.expires_at).getTime() - Date.now()) / 1000),
				);

				await this.redis.setex(redisKey, ttlSeconds, data.value);
			} catch (_error) {}
		}

		// Update access statistics
		this.updateAccessStats(fullKey).catch(console.error);

		return {
			success: true,
			value: JSON.parse(data.value),
			cache_hit: true,
			response_time_ms: performance.now() - startTime,
			size_bytes: data.metadata?.size_bytes || 0,
		};
	}

	private async setCacheEntry(input: CacheInput): Promise<CacheOutput> {
		if (!input.key || input.value === undefined) {
			throw new Error("Key and value are required for set operation");
		}

		const namespace = input.namespace || "default";
		const fullKey = `${namespace}:${input.key}`;
		const ttlSeconds = input.ttl_seconds || this.DEFAULT_TTL;
		const serializedValue = JSON.stringify(input.value);
		const sizeBytes = Buffer.byteLength(serializedValue, "utf8");

		// Check size limit
		if (sizeBytes > this.MAX_VALUE_SIZE) {
			throw new Error(
				`Cache value too large: ${sizeBytes} bytes (max: ${this.MAX_VALUE_SIZE})`,
			);
		}

		const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

		// Store in Redis if available
		if (this.redis) {
			try {
				const redisKey = `${this.REDIS_KEY_PREFIX}${fullKey}`;
				await this.redis.setex(redisKey, ttlSeconds, serializedValue);
			} catch (_error) {}
		}

		// Store in database
		const cacheEntry: Partial<CacheEntry> = {
			key: fullKey,
			value: serializedValue,
			namespace,
			ttl_seconds: ttlSeconds,
			tags: input.tags || [],
			metadata: {
				size_bytes: sizeBytes,
				content_type: typeof input.value,
				source_service: "cache_management_service",
				...input.metadata,
			},
			created_at: new Date().toISOString(),
			expires_at: expiresAt,
		};

		const { error } = await this.supabase
			.from("ai_service_cache")
			.upsert(cacheEntry, {
				onConflict: "key",
			});

		if (error) {
			throw new Error(`Failed to store cache entry: ${error.message}`);
		}

		this.incrementStat("cache_sets");

		return {
			success: true,
			size_bytes: sizeBytes,
		};
	}

	private async deleteCacheEntry(input: CacheInput): Promise<CacheOutput> {
		if (!input.key) {
			throw new Error("Key is required for delete operation");
		}

		const namespace = input.namespace || "default";
		const fullKey = `${namespace}:${input.key}`;

		// Delete from Redis
		if (this.redis) {
			try {
				const redisKey = `${this.REDIS_KEY_PREFIX}${fullKey}`;
				await this.redis.del(redisKey);
			} catch (_error) {}
		}

		// Delete from database
		const { error } = await this.supabase
			.from("ai_service_cache")
			.delete()
			.eq("key", fullKey);

		if (error) {
			throw new Error(`Failed to delete cache entry: ${error.message}`);
		}

		this.incrementStat("cache_deletes");

		return {
			success: true,
		};
	}

	private async checkCacheExists(input: CacheInput): Promise<CacheOutput> {
		if (!input.key) {
			throw new Error("Key is required for exists operation");
		}

		const namespace = input.namespace || "default";
		const fullKey = `${namespace}:${input.key}`;

		// Check Redis first
		if (this.redis) {
			try {
				const redisKey = `${this.REDIS_KEY_PREFIX}${fullKey}`;
				const exists = await this.redis.exists(redisKey);

				if (exists) {
					return {
						success: true,
						exists: true,
					};
				}
			} catch (_error) {}
		}

		// Check database
		const { data, error } = await this.supabase
			.from("ai_service_cache")
			.select("id")
			.eq("key", fullKey)
			.gt("expires_at", new Date().toISOString())
			.single();

		return {
			success: true,
			exists: !error && !!data,
		};
	}

	private async invalidateCache(input: CacheInput): Promise<CacheOutput> {
		let deletedCount = 0;

		if (input.invalidation_pattern) {
			// Pattern-based invalidation
			const pattern = input.invalidation_pattern.replace("*", "%");

			// Delete from database
			const { data, error } = await this.supabase
				.from("ai_service_cache")
				.delete()
				.like("key", pattern)
				.select("key");

			if (!error && data) {
				deletedCount = data.length;

				// Delete from Redis
				if (this.redis && data.length > 0) {
					try {
						const redisKeys = data.map(
							(item) => `${this.REDIS_KEY_PREFIX}${item.key}`,
						);
						await this.redis.del(...redisKeys);
					} catch (_error) {}
				}
			}
		} else if (input.tags && input.tags.length > 0) {
			// Tag-based invalidation
			const { data, error } = await this.supabase
				.from("ai_service_cache")
				.select("key")
				.overlaps("tags", input.tags);

			if (!error && data) {
				const keys = data.map((item) => item.key);

				// Delete from database
				const { error: deleteError } = await this.supabase
					.from("ai_service_cache")
					.delete()
					.in("key", keys);

				if (!deleteError) {
					deletedCount = keys.length;

					// Delete from Redis
					if (this.redis && keys.length > 0) {
						try {
							const redisKeys = keys.map(
								(key) => `${this.REDIS_KEY_PREFIX}${key}`,
							);
							await this.redis.del(...redisKeys);
						} catch (_error) {}
					}
				}
			}
		} else if (input.namespace) {
			// Namespace-based invalidation
			const { data, error } = await this.supabase
				.from("ai_service_cache")
				.delete()
				.eq("namespace", input.namespace)
				.select("key");

			if (!error && data) {
				deletedCount = data.length;

				// Delete from Redis
				if (this.redis && data.length > 0) {
					try {
						const redisKeys = data.map(
							(item) => `${this.REDIS_KEY_PREFIX}${item.key}`,
						);
						await this.redis.del(...redisKeys);
					} catch (_error) {}
				}
			}
		}

		this.incrementStat("cache_invalidations", deletedCount);

		return {
			success: true,
			entries_affected: deletedCount,
		};
	}

	private async getCacheStats(): Promise<CacheOutput> {
		// Get database statistics
		const [totalResult, expiredResult, sizeResult, namespaceResult] =
			await Promise.all([
				this.supabase
					.from("ai_service_cache")
					.select("count", { count: "exact" }),

				this.supabase
					.from("ai_service_cache")
					.select("count", { count: "exact" })
					.lt("expires_at", new Date().toISOString()),

				this.supabase.from("ai_service_cache").select("metadata"),

				this.supabase.from("ai_service_cache").select("namespace"),
			]);

		const totalEntries = totalResult.count || 0;
		const expiredEntries = expiredResult.count || 0;

		// Calculate total size
		let totalSizeBytes = 0;
		if (sizeResult.data) {
			totalSizeBytes = sizeResult.data.reduce((sum, entry) => {
				return sum + (entry.metadata?.size_bytes || 0);
			}, 0);
		}

		// Calculate namespace breakdown
		const namespaceBreakdown: Record<string, number> = {};
		if (namespaceResult.data) {
			namespaceResult.data.forEach((entry) => {
				const namespace = entry.namespace || "unknown";
				namespaceBreakdown[namespace] =
					(namespaceBreakdown[namespace] || 0) + 1;
			});
		}

		// Get runtime statistics
		const hitCount =
			this.getStat("cache_hits") +
			this.getStat("redis_hits") +
			this.getStat("db_cache_hits");
		const missCount = this.getStat("cache_misses");
		const totalRequests = hitCount + missCount;
		const hitRate = totalRequests > 0 ? (hitCount / totalRequests) * 100 : 0;
		const missRate = 100 - hitRate;

		// Get Redis memory info if available
		const redisMemory = { used: 0, peak: 0 };
		if (this.redis) {
			try {
				const info = await this.redis.info("memory");
				const usedMatch = info.match(/used_memory:(\d+)/);
				const peakMatch = info.match(/used_memory_peak:(\d+)/);

				redisMemory.used = usedMatch ? Number.parseInt(usedMatch[1], 10) : 0;
				redisMemory.peak = peakMatch ? Number.parseInt(peakMatch[1], 10) : 0;
			} catch (_error) {}
		}

		const stats: CacheStats = {
			total_entries: totalEntries,
			total_size_bytes: totalSizeBytes,
			hit_rate_percent: hitRate,
			miss_rate_percent: missRate,
			average_ttl_seconds: this.DEFAULT_TTL,
			expired_entries: expiredEntries,
			namespace_breakdown: namespaceBreakdown,
			tag_breakdown: {}, // Could be implemented with additional queries
			recent_activity: {
				hits_last_hour: this.getStat("cache_hits"),
				misses_last_hour: this.getStat("cache_misses"),
				sets_last_hour: this.getStat("cache_sets"),
				deletes_last_hour: this.getStat("cache_deletes"),
			},
			memory_usage: {
				redis_used_memory: redisMemory.used,
				redis_peak_memory: redisMemory.peak,
				database_cache_size: totalSizeBytes,
			},
		};

		return {
			success: true,
			cache_stats: stats,
		};
	}

	private async cleanupCache(input: CacheInput): Promise<CacheOutput> {
		const options = input.cleanup_options || {};
		let query = this.supabase.from("ai_service_cache");

		if (options.expired_only !== false) {
			query = query.lt("expires_at", new Date().toISOString());
		}

		if (options.namespace) {
			query = query.eq("namespace", options.namespace);
		}

		if (options.tags && options.tags.length > 0) {
			query = query.overlaps("tags", options.tags);
		}

		if (options.older_than_hours) {
			const cutoffTime = new Date(
				Date.now() - options.older_than_hours * 60 * 60 * 1000,
			);
			query = query.lt("created_at", cutoffTime.toISOString());
		}

		if (options.max_entries_to_remove) {
			query = query.limit(options.max_entries_to_remove);
		}

		if (options.dry_run) {
			const { count, error } = await query.select("count", { count: "exact" });

			return {
				success: true,
				entries_affected: count || 0,
			};
		}

		const { data, error } = await query.delete().select("key");

		if (error) {
			throw new Error(`Cache cleanup failed: ${error.message}`);
		}

		let cleanedCount = 0;
		if (data && data.length > 0) {
			cleanedCount = data.length;

			// Clean up Redis entries
			if (this.redis) {
				try {
					const redisKeys = data.map(
						(item) => `${this.REDIS_KEY_PREFIX}${item.key}`,
					);
					await this.redis.del(...redisKeys);
				} catch (_error) {}
			}
		}

		return {
			success: true,
			entries_affected: cleanedCount,
		};
	}

	private async bulkGetCacheEntries(input: CacheInput): Promise<CacheOutput> {
		if (!input.keys || input.keys.length === 0) {
			throw new Error("Keys are required for bulk_get operation");
		}

		const namespace = input.namespace || "default";
		const fullKeys = input.keys.map((key) => `${namespace}:${key}`);
		const values: Record<string, any> = {};

		// Try Redis first for all keys
		if (this.redis) {
			try {
				const redisKeys = fullKeys.map(
					(key) => `${this.REDIS_KEY_PREFIX}${key}`,
				);
				const redisValues = await this.redis.mget(...redisKeys);

				redisValues.forEach((value, index) => {
					if (value !== null) {
						const originalKey = input.keys?.[index];
						values[originalKey] = JSON.parse(value);
					}
				});
			} catch (_error) {}
		}

		// Get remaining keys from database
		const missingKeys = fullKeys.filter(
			(_, index) => !(input.keys?.[index] in values),
		);

		if (missingKeys.length > 0) {
			const { data, error } = await this.supabase
				.from("ai_service_cache")
				.select("key, value")
				.in("key", missingKeys)
				.gt("expires_at", new Date().toISOString());

			if (!error && data) {
				data.forEach((entry) => {
					const originalKey = entry.key.replace(`${namespace}:`, "");
					values[originalKey] = JSON.parse(entry.value);
				});
			}
		}

		return {
			success: true,
			values,
		};
	}

	private async bulkSetCacheEntries(input: CacheInput): Promise<CacheOutput> {
		if (!input.bulk_data || input.bulk_data.length === 0) {
			throw new Error("bulk_data is required for bulk_set operation");
		}

		const namespace = input.namespace || "default";
		const results: Array<{ key: string; success: boolean; error?: string }> =
			[];

		const cacheEntries: Partial<CacheEntry>[] = [];
		const redisOperations: [string, string, number][] = [];

		for (const item of input.bulk_data) {
			try {
				const fullKey = `${namespace}:${item.key}`;
				const serializedValue = JSON.stringify(item.value);
				const sizeBytes = Buffer.byteLength(serializedValue, "utf8");
				const ttlSeconds = item.ttl_seconds || this.DEFAULT_TTL;
				const expiresAt = new Date(
					Date.now() + ttlSeconds * 1000,
				).toISOString();

				if (sizeBytes > this.MAX_VALUE_SIZE) {
					results.push({
						key: item.key,
						success: false,
						error: `Value too large: ${sizeBytes} bytes`,
					});
					continue;
				}

				cacheEntries.push({
					key: fullKey,
					value: serializedValue,
					namespace,
					ttl_seconds: ttlSeconds,
					tags: item.tags || [],
					metadata: {
						size_bytes: sizeBytes,
						content_type: typeof item.value,
						source_service: "cache_management_service",
					},
					created_at: new Date().toISOString(),
					expires_at: expiresAt,
				});

				if (this.redis) {
					redisOperations.push([
						`${this.REDIS_KEY_PREFIX}${fullKey}`,
						serializedValue,
						ttlSeconds,
					]);
				}

				results.push({ key: item.key, success: true });
			} catch (error) {
				results.push({
					key: item.key,
					success: false,
					error: (error as Error).message,
				});
			}
		}

		// Bulk insert to database
		if (cacheEntries.length > 0) {
			const { error } = await this.supabase
				.from("ai_service_cache")
				.upsert(cacheEntries, {
					onConflict: "key",
				});

			if (error) {
			}
		}

		// Bulk set in Redis
		if (this.redis && redisOperations.length > 0) {
			try {
				const pipeline = this.redis.pipeline();
				redisOperations.forEach(([key, value, ttl]) => {
					pipeline.setex(key, ttl, value);
				});
				await pipeline.exec();
			} catch (_error) {}
		}

		this.incrementStat("cache_sets", cacheEntries.length);

		return {
			success: true,
			bulk_results: results,
		};
	}

	private async updateAccessStats(key: string): Promise<void> {
		try {
			await this.supabase
				.from("ai_service_cache")
				.update({
					last_accessed: new Date().toISOString(),
					access_count: this.supabase.rpc("increment_access_count"),
				})
				.eq("key", key);
		} catch (_error) {}
	}

	private incrementStat(statName: string, count = 1): void {
		const currentValue = this.cacheStats.get(statName) || 0;
		this.cacheStats.set(statName, currentValue + count);
	}

	private getStat(statName: string): number {
		return this.cacheStats.get(statName) || 0;
	}

	private startCleanupInterval(): void {
		// Run cleanup every 30 minutes
		setInterval(
			async () => {
				try {
					await this.execute({
						action: "cleanup",
						cleanup_options: {
							expired_only: true,
							max_entries_to_remove: 1000,
						},
					});
				} catch (_error) {}
			},
			30 * 60 * 1000,
		);
	}

	// Helper methods for easy cache operations
	public async get<T = any>(
		key: string,
		namespace = "default",
	): Promise<T | null> {
		const result = await this.execute({
			action: "get",
			key,
			namespace,
		});

		return result.value || null;
	}

	public async set(
		key: string,
		value: any,
		options: {
			namespace?: string;
			ttl_seconds?: number;
			tags?: string[];
		} = {},
	): Promise<boolean> {
		const result = await this.execute({
			action: "set",
			key,
			value,
			namespace: options.namespace || "default",
			ttl_seconds: options.ttl_seconds,
			tags: options.tags,
		});

		return result.success;
	}

	public async delete(key: string, namespace = "default"): Promise<boolean> {
		const result = await this.execute({
			action: "delete",
			key,
			namespace,
		});

		return result.success;
	}

	public async invalidateByTags(tags: string[]): Promise<number> {
		const result = await this.execute({
			action: "invalidate",
			tags,
		});

		return result.entries_affected || 0;
	}
}

// Export singleton instance
export const cacheManagementService = new CacheManagementService();
