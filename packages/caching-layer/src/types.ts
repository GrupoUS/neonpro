export interface CacheEntry<T = any> {
	value: T;
	timestamp: number;
	ttl: number;
	version?: string;
	tags?: string[];
	sensitive?: boolean;
	lgpdConsent?: boolean;
}

export interface CacheStats {
	hits: number;
	misses: number;
	hitRate: number;
	totalRequests: number;
	averageResponseTime: number;
}

export interface CacheLayerConfig {
	ttl: number;
	maxSize?: number;
	compressionEnabled?: boolean;
	encryptionEnabled?: boolean;
	lgpdCompliant?: boolean;
}

export interface CacheKey {
	layer: CacheLayer;
	namespace: string;
	key: string;
	tags?: string[];
}

export enum CacheLayer {
	BROWSER = "browser",
	EDGE = "edge",
	DATABASE = "database",
	AI_CONTEXT = "ai_context",
}

export interface CacheOperation<T = any> {
	get(key: string): Promise<T | null>;
	set(key: string, value: T, ttl?: number): Promise<void>;
	delete(key: string): Promise<void>;
	clear(): Promise<void>;
	getStats(): Promise<CacheStats>;
	invalidateByTags(tags: string[]): Promise<void>;
}

export interface HealthcareDataPolicy {
	requiresConsent: boolean;
	dataClassification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
	retentionPeriod?: number;
	auditRequired: boolean;
}
