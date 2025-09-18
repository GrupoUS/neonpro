import {
  AIOptimizationConfig,
  AIProvider,
  CacheConfig,
  CacheStats,
  ComplianceLevel,
  HealthcareAIContext,
  SemanticCacheEntry,
  SemanticCacheEntrySchema,
  VectorEmbeddingConfig,
} from '@neonpro/shared';

/**
 * Serviço de Cache Semântico com Vetores Embeddings para Otimização de IA
 *
 * Implementa cache semântico para redução de custos e melhoria de performance
 * em chamadas de IA, com conformidade LGPD para saúde.
 */
export class SemanticCacheService {
  private cache: Map<string, SemanticCacheEntry> = new Map();
  private config: CacheConfig;
  private vectorConfig: VectorEmbeddingConfig;
  private stats: CacheStats;
  private embeddingCache: Map<string, number[]> = new Map();
  private similarityThreshold = 0.85;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      ...config,
      maxEntries: config?.maxEntries ?? 1000,
      ttlMs: config?.ttlMs ?? 3600000, // 1 hora
      cleanupIntervalMs: config?.cleanupIntervalMs ?? 300000, // 5 minutos
      strategy: config?.strategy ?? 'semantic',
      enabled: config?.enabled ?? true,
    } as CacheConfig;

    this.vectorConfig = {
      dimensions: 1536,
      model: 'text-embedding-ada-002',
      provider: AIProvider.OPENAI,
      batchSize: 100,
      cacheKeyPrefix: 'semantic_cache',
      similarityMetric: 'cosine',
    } as VectorEmbeddingConfig;

    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalSavedCost: 0,
      averageResponseTimeMs: 0,
      cacheSize: 0,
      hitRate: 0,
      costEfficiency: 0,
      lastCleanup: new Date(),
    };

    this.initializeCleanup();
  }

  /**
   * Inicializa processo de limpeza periódica
   */
  private initializeCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupIntervalMs);
  }

  /**
   * Gera embedding para texto usando API de embeddings
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Cache de embeddings para evitar recomputação
      const cacheKey = this.generateEmbeddingCacheKey(text);
      if (this.embeddingCache.has(cacheKey)) {
        return this.embeddingCache.get(cacheKey)!;
      }

      // Mock embedding generation - em produção usaria API real
      const embedding = this.generateMockEmbedding(text);

      // Cache o embedding
      this.embeddingCache.set(cacheKey, embedding);

      // Limitar tamanho do cache de embeddings
      if (this.embeddingCache.size > 5000) {
        const oldestKey = this.embeddingCache.keys().next().value;
        this.embeddingCache.delete(oldestKey);
      }

      return embedding;
    } catch (error) {
      console.error('Erro ao gerar embedding:', error);
      // Fallback para embedding aleatório em caso de erro
      return this.generateMockEmbedding(text);
    }
  }

  /**
   * Gera embedding simulado para demonstração
   */
  private generateMockEmbedding(text: string): number[] {
    const dimensions = this.vectorConfig.dimensions;
    const embedding: number[] = [];

    // Gerar embedding baseado no hash do texto para consistência
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converter para 32bit integer
    }

    // Gerar embedding deterministicamente baseado no hash
    for (let i = 0; i < dimensions; i++) {
      embedding.push(Math.sin(hash * (i + 1)) * 0.5 + 0.5);
    }

    // Normalizar embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  /**
   * Calcula similaridade de cosseno entre dois embeddings
   */
  private calculateCosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      return 0;
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Busca entrada no cache semântico baseada em similaridade
   */
  async findSimilarEntry(
    prompt: string,
    context: HealthcareAIContext,
  ): Promise<SemanticCacheEntry | null> {
    if (!this.config.enabled) {
      return null;
    }

    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      const promptEmbedding = await this.generateEmbedding(prompt);

      let bestMatch: SemanticCacheEntry | null = null;
      let bestSimilarity = 0;

      // Buscar por similaridade semântica
      for (const entry of this.cache.values()) {
        // Verificar TTL
        if (entry.ttl && new Date() > entry.ttl) {
          continue;
        }

        // Verificar contexto de saúde
        if (entry.metadata.patientId && entry.metadata.patientId !== context.patientId) {
          continue;
        }

        // Verificar conformidade
        if (!this.hasRequiredCompliance(entry.metadata.compliance, context.requiredCompliance)) {
          continue;
        }

        // Calcular similaridade
        const similarity = this.calculateCosineSimilarity(promptEmbedding, entry.embedding);

        if (similarity > this.similarityThreshold && similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = entry;
        }
      }

      if (bestMatch) {
        // Atualizar estatísticas e acesso
        bestMatch.accessedAt = new Date();
        bestMatch.accessCount++;
        this.cache.set(bestMatch.id, bestMatch);

        this.stats.cacheHits++;
        this.stats.totalSavedCost += bestMatch.metadata.cost;

        console.log(`Cache hit! Similaridade: ${(bestSimilarity * 100).toFixed(2)}%`);
      } else {
        this.stats.cacheMisses++;
      }

      this.updateStats();

      return bestMatch;
    } catch (error) {
      console.error('Erro na busca semântica:', error);
      this.stats.cacheMisses++;
      this.updateStats();
      return null;
    }
  }

  /**
   * Adiciona entrada ao cache semântico
   */
  async addEntry(
    prompt: string,
    response: string,
    metadata: SemanticCacheEntry['metadata'],
  ): Promise<string> {
    try {
      const embedding = await this.generateEmbedding(prompt);
      const id = `cache_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const ttl = metadata.ttlMs ? new Date(Date.now() + metadata.ttlMs) : undefined;

      const entry: SemanticCacheEntry = {
        id,
        prompt,
        response,
        embedding,
        metadata: {
          ...metadata,
          compliance: metadata.compliance || [ComplianceLevel.LGPD_COMPLIANT],
        },
        createdAt: new Date(),
        accessedAt: new Date(),
        accessCount: 1,
        ttl,
        hash: this.generateHash(prompt),
      };

      // Validar entrada
      const validation = SemanticCacheEntrySchema.safeParse(entry);
      if (!validation.success) {
        throw new Error(`Entrada de cache inválida: ${validation.error.message}`);
      }

      this.cache.set(id, entry);

      // Limpar cache se exceder tamanho máximo
      if (this.cache.size > this.config.maxEntries!) {
        this.evictLRU();
      }

      this.stats.cacheSize = this.cache.size;

      console.log(`Entrada adicionada ao cache. ID: ${id}, Tamanho: ${this.cache.size}`);
      return id;
    } catch (error) {
      console.error('Erro ao adicionar entrada ao cache:', error);
      throw error;
    }
  }

  /**
   * Busca entrada por hash exato
   */
  findByHash(hash: string): SemanticCacheEntry | null {
    for (const entry of this.cache.values()) {
      if (entry.hash === hash) {
        // Atualizar acesso
        entry.accessedAt = new Date();
        entry.accessCount++;
        this.cache.set(entry.id, entry);
        return entry;
      }
    }
    return null;
  }

  /**
   * Remove entrada do cache
   */
  removeEntry(id: string): boolean {
    const deleted = this.cache.delete(id);
    if (deleted) {
      this.stats.cacheSize = this.cache.size;
    }
    return deleted;
  }

  /**
   * Limpa entradas expiradas do cache
   */
  cleanup(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [id, entry] of this.cache.entries()) {
      if (entry.ttl && now > entry.ttl) {
        this.cache.delete(id);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.stats.cacheSize = this.cache.size;
      this.stats.lastCleanup = now;
      console.log(`Cache cleanup: ${cleanedCount} entradas removidas`);
    }
  }

  /**
   * Remove entrada menos recentemente usada (LRU)
   */
  private evictLRU(): void {
    let oldestEntry: { id: string; accessedAt: Date } | null = null;

    for (const [id, entry] of this.cache.entries()) {
      if (!oldestEntry || entry.accessedAt < oldestEntry.accessedAt) {
        oldestEntry = { id, accessedAt: entry.accessedAt };
      }
    }

    if (oldestEntry) {
      this.cache.delete(oldestEntry.id);
      console.log(`Cache LRU eviction: entrada ${oldestEntry.id} removida`);
    }
  }

  /**
   * Gera hash para prompt
   */
  private generateHash(prompt: string): string {
    // Simple hash function for demonstration
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      const char = prompt.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Gera chave de cache para embeddings
   */
  private generateEmbeddingCacheKey(text: string): string {
    return `${this.vectorConfig.cacheKeyPrefix}_${this.generateHash(text)}`;
  }

  /**
   * Verifica conformidade necessária
   */
  private hasRequiredCompliance(
    entryCompliance: ComplianceLevel[],
    requiredCompliance?: ComplianceLevel[],
  ): boolean {
    if (!requiredCompliance || requiredCompliance.length === 0) {
      return true;
    }

    return requiredCompliance.every(required => entryCompliance.includes(required));
  }

  /**
   * Atualiza estatísticas
   */
  private updateStats(): void {
    this.stats.hitRate = this.calculateHitRate();
    this.stats.costEfficiency = this.calculateCostEfficiency();
  }

  /**
   * Calcula taxa de acerto
   */
  private calculateHitRate(): number {
    if (this.stats.totalRequests === 0) return 0;
    return this.stats.cacheHits / this.stats.totalRequests;
  }

  /**
   * Calcula eficiência de custo
   */
  private calculateCostEfficiency(): number {
    if (this.stats.totalSavedCost === 0) return 0;

    const totalCost = this.stats.totalSavedCost
      + (this.stats.cacheMisses * 0.01); // Custo estimado por miss
    return this.stats.totalSavedCost / totalCost;
  }

  /**
   * Otimiza consultas de saúde
   */
  optimizeHealthcareQuery(query: {
    prompt: string;
    patientId?: string;
    context: HealthcareAIContext;
    maxAgeMs?: number;
  }): {
    cacheKey: string;
    optimized: boolean;
    strategy: 'semantic' | 'exact' | 'healthcare_context';
  } {
    const { prompt, patientId, context, maxAgeMs } = query;

    // Estratégia baseada no contexto
    let strategy: 'semantic' | 'exact' | 'healthcare_context' = 'semantic';

    if (context.isEmergency || context.containsUrgentSymptoms) {
      strategy = 'exact'; // Não usar cache para emergências
    } else if (context.isSensitiveData || context.requiresPrivacy) {
      strategy = 'healthcare_context'; // Considerar contexto de saúde
    }

    const cacheKey = this.generateHealthcareCacheKey({
      prompt,
      patientId,
      strategy,
      context,
    });

    return {
      cacheKey,
      optimized: strategy !== 'exact',
      strategy,
    };
  }

  /**
   * Gera chave de cache para consultas de saúde
   */
  private generateHealthcareCacheKey(params: {
    prompt: string;
    patientId?: string;
    strategy: string;
    context: HealthcareAIContext;
  }): string {
    const { prompt, patientId, strategy, context } = params;

    let key = `${strategy}_`;

    if (patientId) {
      key += `patient_${patientId}_`;
    }

    if (context.isEmergency) {
      key += 'emergency_';
    }

    if (context.category) {
      key += `${context.category}_`;
    }

    key += this.generateHash(prompt);

    return key;
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
    this.embeddingCache.clear();
    this.stats.cacheSize = 0;
    console.log('Cache semanticamente limpo');
  }

  /**
   * Destrói o serviço e limpa recursos
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }

  /**
   * Obtém tamanho do cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Verifica se cache está habilitado
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Habilita/desabilita cache
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (!enabled) {
      this.clear();
    }
  }

  /**
   * Configura threshold de similaridade
   */
  setSimilarityThreshold(threshold: number): void {
    this.similarityThreshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * Exporta cache para análise
   */
  exportCache(): {
    entries: SemanticCacheEntry[];
    stats: CacheStats;
    config: CacheConfig;
  } {
    return {
      entries: Array.from(this.cache.values()),
      stats: this.getStats(),
      config: this.config,
    };
  }

  /**
   * Importa entradas para o cache
   */
  importCache(entries: SemanticCacheEntry[]): number {
    let imported = 0;

    for (const entry of entries) {
      try {
        const validation = SemanticCacheEntrySchema.safeParse(entry);
        if (validation.success) {
          this.cache.set(entry.id, entry);
          imported++;
        }
      } catch (error) {
        console.warn(`Falha ao importar entrada ${entry.id}:`, error);
      }
    }

    this.stats.cacheSize = this.cache.size;
    return imported;
  }
}
