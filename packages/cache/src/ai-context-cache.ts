import type { CacheEntry, CacheOperation, CacheStats } from "./types";

export interface AIContextMetadata {
  contextType: "conversation" | "knowledge" | "embedding" | "reasoning";
  importance: "low" | "medium" | "high" | "critical";
  userId?: string;
  sessionId?: string;
  modelId?: string;
  tokenCount?: number;
  parentContext?: string;
  childContexts?: string[];
}

type AIContextEntry = CacheEntry<string> & {
  importance: AIContextMetadata["importance"];
  contextType: AIContextMetadata["contextType"];
};

export class AIContextCacheLayer implements CacheOperation {
  private cache = new Map<string, AIContextEntry>();
  private contextMap = new Map<string, AIContextMetadata>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalRequests: 0,
    averageResponseTime: 0,
  };
  private responseTimeBuffer: number[] = [];

  constructor(
    private readonly config = {
      maxContextSize: 50_000, // 50k contexts
      defaultTTL: 24 * 60 * 60, // 24 hours in seconds
      maxTTL: 7 * 24 * 60 * 60, // 7 days in seconds
      compressionEnabled: true,
      targetHitRate: 95, // 95%+ target
      contextRetention: true,
      maxTokensPerContext: 8000,
    },
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    this.stats.totalRequests++;

    try {
      const entry = this.cache.get(this.buildKey(key));
      if (!entry) {
        this.stats.misses++;
        this.updateStats(startTime);
        return null;
      }

      // Check TTL expiration
      if (Date.now() > entry.timestamp + entry.ttl * 1000) {
        this.cache.delete(this.buildKey(key));
        this.contextMap.delete(key);
        this.stats.misses++;
        this.updateStats(startTime);
        return null;
      }

      // Update access patterns for AI optimization
      entry.accessCount = (entry.accessCount || 0) + 1;
      entry.lastAccessed = Date.now();
      this.cache.set(this.buildKey(key), entry);

      this.stats.hits++;
      this.updateStats(startTime);

      return (
        this.config.compressionEnabled
          ? this.decompress(entry.value)
          : entry.value
      ) as unknown as T;
    } catch (error) {
      this.stats.misses++;
      this.updateStats(startTime);
      console.error("AI context cache get error:", error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    metadata?: AIContextMetadata,
  ): Promise<void> {
    // Evict if cache is full
    if (this.cache.size >= this.config.maxContextSize) {
      await this.intelligentEviction();
    }

    const effectiveTTL = Math.min(
      ttl || this.config.defaultTTL,
      this.config.maxTTL,
    );

    const serialized = JSON.stringify(value);

    // Validate token count
    if (
      metadata?.tokenCount
      && metadata.tokenCount > this.config.maxTokensPerContext
    ) {
      console.warn(
        `Context ${key} exceeds max token count: ${metadata.tokenCount}`,
      );
    }

    const entry: AIContextEntry = {
      value: this.config.compressionEnabled
        ? this.compress(serialized)
        : serialized,
      timestamp: Date.now(),
      ttl: effectiveTTL,
      compressed: this.config.compressionEnabled,
      accessCount: 0,
      lastAccessed: Date.now(),
      importance: metadata?.importance || "medium",
      contextType: metadata?.contextType || "conversation",
    };

    this.cache.set(this.buildKey(key), entry);

    if (metadata) {
      this.contextMap.set(key, metadata);
    }
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(this.buildKey(key));
    this.contextMap.delete(key);

    // Clean up related contexts
    const metadata = this.contextMap.get(key);
    if (metadata?.childContexts) {
      for (const childKey of metadata.childContexts) {
        await this.delete(childKey);
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.contextMap.clear();
    this.resetStats();
  }

  async getStats(): Promise<CacheStats> {
    this.stats.hitRate = this.stats.totalRequests > 0
      ? (this.stats.hits / this.stats.totalRequests) * 100
      : 0;
    return { ...this.stats };
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.some((tag) => tags.includes(tag))) {
        await this.delete(key.replace(this.buildKey(""), ""));
      }
    }
  }

  // AI-specific methods
  async setConversationContext(
    conversationId: string,
    context: Record<string, unknown>,
    metadata: AIContextMetadata,
  ): Promise<void> {
    const key = `conversation:${conversationId}`;
    await this.set(key, context, undefined, {
      ...metadata,
      contextType: "conversation",
    });
  }

  async getConversationContext(conversationId: string): Promise<unknown> {
    return await this.get(`conversation:${conversationId}`);
  }

  async setKnowledgeContext(
    knowledgeId: string,
    knowledge: Record<string, unknown>,
    metadata: AIContextMetadata,
  ): Promise<void> {
    const key = `knowledge:${knowledgeId}`;
    await this.set(key, knowledge, this.config.maxTTL, {
      // Longer TTL for knowledge
      ...metadata,
      contextType: "knowledge",
    });
  }

  async getKnowledgeContext(knowledgeId: string): Promise<unknown> {
    return await this.get(`knowledge:${knowledgeId}`);
  }

  async setEmbedding(
    embeddingId: string,
    embedding: number[],
    metadata: AIContextMetadata,
  ): Promise<void> {
    const key = `embedding:${embeddingId}`;
    await this.set(key, embedding, this.config.maxTTL, {
      ...metadata,
      contextType: "embedding",
    });
  }

  async getEmbedding(embeddingId: string): Promise<number[] | null> {
    return await this.get(`embedding:${embeddingId}`);
  }

  async linkContexts(parentKey: string, childKey: string): Promise<void> {
    const parentMetadata = this.contextMap.get(parentKey);
    const childMetadata = this.contextMap.get(childKey);

    if (parentMetadata) {
      parentMetadata.childContexts = parentMetadata.childContexts || [];
      parentMetadata.childContexts.push(childKey);
      this.contextMap.set(parentKey, parentMetadata);
    }

    if (childMetadata) {
      childMetadata.parentContext = parentKey;
      this.contextMap.set(childKey, childMetadata);
    }
  }

  async getContextChain(key: string): Promise<string[]> {
    const chain: string[] = [key];
    const metadata = this.contextMap.get(key);

    // Get parent chain
    let current = metadata?.parentContext;
    while (current) {
      chain.unshift(current);
      const currentMetadata = this.contextMap.get(current);
      current = currentMetadata?.parentContext;
    }

    // Get child chains
    const addChildren = (parentKey: string) => {
      const parentMeta = this.contextMap.get(parentKey);
      if (parentMeta?.childContexts) {
        for (const childKey of parentMeta.childContexts) {
          chain.push(childKey);
          addChildren(childKey); // Recursive for nested children
        }
      }
    };
    addChildren(key);

    return chain;
  }

  async getContextsByUser(userId: string): Promise<string[]> {
    const userContexts: string[] = [];

    for (const [key, metadata] of this.contextMap.entries()) {
      if (metadata.userId === userId) {
        userContexts.push(key);
      }
    }

    return userContexts;
  }

  async getContextsBySession(sessionId: string): Promise<string[]> {
    const sessionContexts: string[] = [];

    for (const [key, metadata] of this.contextMap.entries()) {
      if (metadata.sessionId === sessionId) {
        sessionContexts.push(key);
      }
    }

    return sessionContexts;
  }

  async getContextAnalytics(): Promise<{
    totalContexts: number;
    byType: Record<string, number>;
    byImportance: Record<string, number>;
    averageTokenCount: number;
    hitRate: number;
    topUsers: { userId: string; contextCount: number; }[];
  }> {
    const byType: Record<string, number> = {};
    const byImportance: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    let totalTokens = 0;
    let tokenContexts = 0;

    for (const metadata of this.contextMap.values()) {
      // Count by type
      byType[metadata.contextType] = (byType[metadata.contextType] || 0) + 1;

      // Count by importance
      byImportance[metadata.importance] = (byImportance[metadata.importance] || 0) + 1;

      // Count by user
      if (metadata.userId) {
        userCounts[metadata.userId] = (userCounts[metadata.userId] || 0) + 1;
      }

      // Token stats
      if (metadata.tokenCount) {
        totalTokens += metadata.tokenCount;
        tokenContexts++;
      }
    }

    const topUsers = Object.entries(userCounts)
      .map(([userId, contextCount]) => ({ userId, contextCount }))
      .sort((a, b) => b.contextCount - a.contextCount)
      .slice(0, 10);

    return {
      totalContexts: this.contextMap.size,
      byType,
      byImportance,
      averageTokenCount: tokenContexts > 0 ? totalTokens / tokenContexts : 0,
      hitRate: this.stats.hitRate,
      topUsers,
    };
  }

  private buildKey(key: string): string {
    return `ai_context:${key}`;
  }

  private compress(data: string): string {
    // Simple compression placeholder
    return data;
  }

  private decompress(data: string): unknown {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }

  private async intelligentEviction(): Promise<void> {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      entry,
      score: this.calculateEvictionScore(entry),
    }));

    // Sort by eviction score (lowest score = first to evict)
    entries.sort((a, b) => a.score - b.score);

    // Evict bottom 10%
    const evictCount = Math.floor(entries.length * 0.1);
    for (let i = 0; i < evictCount; i++) {
      const entry = entries[i];
      if (entry) {
        const key = entry.key.replace(this.buildKey(""), "");
        await this.delete(key);
      }
    }
  }

  private calculateEvictionScore(entry: AIContextEntry): number {
    const now = Date.now();
    const age = now - entry.timestamp;
    const accessRecency = now - (entry.lastAccessed ?? entry.timestamp);
    const accessFrequency = entry.accessCount ?? 0;

    // Importance weights
    const importanceWeights = {
      low: 1,
      medium: 2,
      high: 4,
      critical: 8,
    } as const;

    const importanceWeight = importanceWeights[entry.importance] ?? 2;

    // Lower score = more likely to be evicted
    return (
      age / 1000 + accessRecency / 1000 - accessFrequency * 1000 - importanceWeight * 10_000
    );
  }

  private updateStats(startTime: number): void {
    const responseTime = performance.now() - startTime;
    this.responseTimeBuffer.push(responseTime);

    if (this.responseTimeBuffer.length > 100) {
      this.responseTimeBuffer.shift();
    }

    this.stats.averageResponseTime = this.responseTimeBuffer.reduce((a, b) => a + b, 0)
      / this.responseTimeBuffer.length;
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      averageResponseTime: 0,
    };
    this.responseTimeBuffer = [];
  }
}
