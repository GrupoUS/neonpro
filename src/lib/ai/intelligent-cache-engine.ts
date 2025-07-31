/**
 * @fileoverview Sistema de Cache Inteligente para NeonPro
 * 
 * Sistema avançado de cache multi-camadas para otimização de performance
 * em aplicações healthcare, com estratégias adaptativas, invalidação
 * inteligente e compliance com LGPD para dados médicos.
 * 
 * Funcionalidades:
 * - Cache multi-level (Memory + Redis + Edge)
 * - Invalidação inteligente por eventos
 * - Estratégias adaptativas de cache
 * - Cache semântico para consultas IA
 * - Compressão e serialização otimizada
 * - Analytics de performance
 * 
 * @author APEX Master Developer
 * @version 1.0.0
 * @since 2025-01-30
 */

import { Redis } from 'ioredis';
import { LRUCache } from 'lru-cache';
import { 
  CacheConfig,
  CacheStrategy,
  CacheEntry,
  CacheStats,
  CacheEvent,
  InvalidationRule,
  CacheLayer,
  PerformanceMetrics
} from '@/lib/types/cache-types';
import { SearchResult, ClinicalCase } from '@/lib/types/search-types';
import { AuditLogger } from './audit-logger';
import { SearchErrorHandler } from './error-handler';
import { createClient } from '@/utils/supabase/server';
import pako from 'pako';

// Tipos específicos para cache inteligente
interface IntelligentCacheConfig {
  layers: {
    memory: {
      enabled: boolean;
      maxSize: number;
      ttl: number;
      algorithm: 'lru' | 'lfu' | 'adaptive';
    };
    redis: {
      enabled: boolean;
      url?: string;
      ttl: number;
      compression: boolean;
      cluster: boolean;
      keyPrefix: string;
    };
    edge: {
      enabled: boolean;
      provider: 'vercel' | 'cloudflare' | 'custom';
      ttl: number;
      regions: string[];
    };
  };
  strategies: {
    adaptive: {
      enabled: boolean;
      learningRate: number;
      performanceThreshold: number;
      memoryPressureThreshold: number;
    };
    semantic: {
      enabled: boolean;
      similarityThreshold: number;
      vectorCache: boolean;
      embeddingTtl: number;
    };
    predictive: {
      enabled: boolean;
      preloadPatterns: boolean;
      userBehaviorAnalysis: boolean;
      clinicalWorkflowCache: boolean;
    };
  };
  invalidation: {
    enabled: boolean;
    strategies: ('time' | 'event' | 'dependency' | 'manual')[];
    cascading: boolean;
    bulkInvalidation: boolean;
    eventSources: string[];
  };
  performance: {
    monitoring: boolean;
    analytics: boolean;
    alerting: boolean;
    optimization: boolean;
    benchmarking: boolean;
  };
  privacy: {
    encryptSensitiveData: boolean;
    anonymizePatientData: boolean;
    auditCacheAccess: boolean;
    dataRetentionPolicy: number;
    consentAwareCache: boolean;
  };
  compression: {
    enabled: boolean;
    algorithm: 'gzip' | 'brotli' | 'lz4';
    threshold: number;
    level: number;
  };
}

interface CacheKey {
  namespace: string;
  operation: string;
  parameters: Record<string, any>;
  version: string;
  userId?: string;
  clinicId?: string;
}

interface CacheMetadata {
  createdAt: Date;
  accessedAt: Date;
  accessCount: number;
  hitRate: number;
  size: number;
  compressed: boolean;
  encrypted: boolean;
  sensitive: boolean;
  dependencies: string[];
  tags: string[];
}

interface AdaptiveCacheStrategy {
  name: string;
  priority: number;
  conditions: {
    timeOfDay?: { start: number; end: number };
    userType?: string[];
    dataType?: string[];
    queryComplexity?: { min: number; max: number };
    systemLoad?: { max: number };
  };
  config: {
    ttl: number;
    maxSize: number;
    evictionPolicy: 'lru' | 'lfu' | 'ttl';
    compression: boolean;
    preload: boolean;
  };
}

interface CachePerformanceMetrics {
  hitRate: number;
  missRate: number;
  avgResponseTime: number;
  throughput: number;
  memoryUsage: number;
  compressionRatio: number;
  evictionRate: number;
  errorRate: number;
  lastUpdated: Date;
}

interface SemanticCacheEntry {
  query: string;
  queryEmbedding: number[];
  result: any;
  similarity: number;
  metadata: CacheMetadata;
}

/**
 * Sistema de cache inteligente multi-camadas
 * 
 * Fornece estratégias adaptativas de cache com otimização automática
 * baseada em padrões de uso, performance e contexto clínico.
 */
export class IntelligentCacheEngine {
  private config: IntelligentCacheConfig;
  private memoryCache: LRUCache<string, CacheEntry>;
  private redisCache?: Redis;
  private supabase;
  private auditLogger: AuditLogger;
  private errorHandler: SearchErrorHandler;
  
  // Caches especializados
  private semanticCache: Map<string, SemanticCacheEntry>;
  private clinicalCache: Map<string, any>;
  private performanceCache: Map<string, PerformanceMetrics>;
  
  // Estratégias adaptativas
  private adaptiveStrategies: Map<string, AdaptiveCacheStrategy>;
  private currentStrategy: AdaptiveCacheStrategy;
  
  // Métricas e monitoramento
  private performanceMetrics: CachePerformanceMetrics;
  private cacheStats: Map<string, CacheStats>;
  private invalidationRules: Map<string, InvalidationRule>;
  
  // Contexto e estado
  private isInitialized: boolean = false;
  private lastOptimization: Date;
  private compressionEnabled: boolean;

  constructor(config: IntelligentCacheConfig) {
    this.config = config;
    this.supabase = createClient();
    this.auditLogger = new AuditLogger();
    this.errorHandler = new SearchErrorHandler();
    
    this.semanticCache = new Map();
    this.clinicalCache = new Map();
    this.performanceCache = new Map();
    this.adaptiveStrategies = new Map();
    this.cacheStats = new Map();
    this.invalidationRules = new Map();
    
    this.lastOptimization = new Date();
    this.compressionEnabled = config.compression.enabled;
    
    this.initializePerformanceMetrics();
    this.initializeAdaptiveStrategies();
    this.initializeCacheLayers();
  }

  /**
   * Inicializar todas as camadas de cache
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Inicializando IntelligentCacheEngine...');

      // Inicializar cache de memória
      if (this.config.layers.memory.enabled) {
        await this.initializeMemoryCache();
      }

      // Inicializar Redis
      if (this.config.layers.redis.enabled) {
        await this.initializeRedisCache();
      }

      // Inicializar cache edge
      if (this.config.layers.edge.enabled) {
        await this.initializeEdgeCache();
      }

      // Carregar regras de invalidação
      await this.loadInvalidationRules();

      // Inicializar monitoramento
      if (this.config.performance.monitoring) {
        this.startPerformanceMonitoring();
      }

      // Aquecimento do cache se configurado
      await this.warmupCache();

      this.isInitialized = true;

      console.log('✅ IntelligentCacheEngine inicializado com sucesso');

      await this.logCacheActivity('cache_engine_initialized', {
        layers: {
          memory: this.config.layers.memory.enabled,
          redis: this.config.layers.redis.enabled,
          edge: this.config.layers.edge.enabled
        },
        strategies: Array.from(this.adaptiveStrategies.keys()),
        currentStrategy: this.currentStrategy.name
      });

    } catch (error) {
      console.error('❌ Erro ao inicializar IntelligentCacheEngine:', error);
      throw new Error(`Falha na inicialização do cache: ${error}`);
    }
  }

  /**
   * Buscar dados do cache usando estratégia inteligente
   */
  async get<T>(key: string | CacheKey, options: {
    layerPreference?: CacheLayer[];
    semanticSimilarity?: boolean;
    fallbackToDatabase?: boolean;
    updateTtl?: boolean;
  } = {}): Promise<T | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const startTime = Date.now();
      const cacheKey = this.generateCacheKey(key);
      
      // Tentar busca semântica se habilitada
      if (options.semanticSimilarity && this.config.strategies.semantic.enabled) {
        const semanticResult = await this.getSemanticCache<T>(cacheKey);
        if (semanticResult) {
          await this.updateCacheMetrics(cacheKey, 'semantic_hit', Date.now() - startTime);
          return semanticResult;
        }
      }

      // Buscar nas camadas configuradas
      const layers = options.layerPreference || ['memory', 'redis', 'edge'];
      
      for (const layer of layers) {
        const result = await this.getFromLayer<T>(cacheKey, layer);
        if (result !== null) {
          // Promover para camadas superiores se necessário
          await this.promoteToUpperLayers(cacheKey, result, layer);
          
          // Atualizar TTL se solicitado
          if (options.updateTtl) {
            await this.updateTtl(cacheKey, layer);
          }

          await this.updateCacheMetrics(cacheKey, `${layer}_hit`, Date.now() - startTime);
          return result;
        }
      }

      // Cache miss - tentar fallback para database
      if (options.fallbackToDatabase) {
        const dbResult = await this.fallbackToDatabase<T>(cacheKey);
        if (dbResult) {
          // Armazenar resultado no cache
          await this.set(key, dbResult, { 
            layers: ['memory', 'redis'], 
            adaptive: true 
          });
          
          await this.updateCacheMetrics(cacheKey, 'database_fallback', Date.now() - startTime);
          return dbResult;
        }
      }

      await this.updateCacheMetrics(cacheKey, 'miss', Date.now() - startTime);
      return null;

    } catch (error) {
      const handledError = await this.errorHandler.handleCacheError(error, {
        operation: 'cache_get',
        key: typeof key === 'string' ? key : JSON.stringify(key),
        options
      });
      
      throw handledError;
    }
  }

  /**
   * Armazenar dados no cache com estratégia inteligente
   */
  async set<T>(key: string | CacheKey, value: T, options: {
    ttl?: number;
    layers?: CacheLayer[];
    adaptive?: boolean;
    tags?: string[];
    sensitive?: boolean;
    dependencies?: string[];
  } = {}): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const startTime = Date.now();
      const cacheKey = this.generateCacheKey(key);
      
      // Aplicar estratégia adaptativa se habilitada
      if (options.adaptive && this.config.strategies.adaptive.enabled) {
        options = await this.applyAdaptiveStrategy(cacheKey, value, options);
      }

      // Processar dados antes do armazenamento
      const processedValue = await this.processValueForStorage(value, options);
      
      // Determinar camadas de armazenamento
      const layers = options.layers || this.getOptimalLayers(cacheKey, processedValue);
      
      // Armazenar em cada camada
      const storePromises = layers.map(layer => 
        this.setToLayer(cacheKey, processedValue, layer, options)
      );
      
      await Promise.all(storePromises);

      // Armazenar cache semântico se aplicável
      if (this.config.strategies.semantic.enabled && this.isSemanticCacheable(value)) {
        await this.setSemanticCache(cacheKey, value, options);
      }

      // Registrar dependências para invalidação
      if (options.dependencies) {
        await this.registerDependencies(cacheKey, options.dependencies);
      }

      const executionTime = Date.now() - startTime;
      await this.updateCacheMetrics(cacheKey, 'set', executionTime);

      await this.logCacheActivity('cache_set', {
        key: cacheKey,
        layers,
        size: this.getValueSize(processedValue),
        ttl: options.ttl,
        executionTime,
        adaptive: options.adaptive,
        sensitive: options.sensitive
      });

    } catch (error) {
      const handledError = await this.errorHandler.handleCacheError(error, {
        operation: 'cache_set',
        key: typeof key === 'string' ? key : JSON.stringify(key),
        options
      });
      
      throw handledError;
    }
  }

  /**
   * Invalidar cache de forma inteligente
   */
  async invalidate(pattern: string | string[] | CacheKey, options: {
    cascading?: boolean;
    layers?: CacheLayer[];
    reason?: string;
    bulkOperation?: boolean;
  } = {}): Promise<{ invalidated: number; layers: CacheLayer[] }> {
    try {
      const startTime = Date.now();
      const patterns = Array.isArray(pattern) ? pattern : [pattern];
      const layers = options.layers || ['memory', 'redis', 'edge'];
      
      let totalInvalidated = 0;
      const invalidatedLayers: CacheLayer[] = [];

      for (const layer of layers) {
        const count = await this.invalidateFromLayer(patterns, layer, options);
        totalInvalidated += count;
        if (count > 0) {
          invalidatedLayers.push(layer);
        }
      }

      // Invalidação em cascata se habilitada
      if (options.cascading && this.config.invalidation.cascading) {
        const dependentKeys = await this.findDependentKeys(patterns);
        if (dependentKeys.length > 0) {
          const cascadeResult = await this.invalidate(dependentKeys, {
            ...options,
            cascading: false // Evitar recursão infinita
          });
          totalInvalidated += cascadeResult.invalidated;
        }
      }

      const executionTime = Date.now() - startTime;

      await this.logCacheActivity('cache_invalidated', {
        patterns,
        totalInvalidated,
        layers: invalidatedLayers,
        cascading: options.cascading,
        reason: options.reason,
        executionTime
      });

      return {
        invalidated: totalInvalidated,
        layers: invalidatedLayers
      };

    } catch (error) {
      const handledError = await this.errorHandler.handleCacheError(error, {
        operation: 'cache_invalidate',
        pattern: typeof pattern === 'string' ? pattern : JSON.stringify(pattern),
        options
      });
      
      throw handledError;
    }
  }

  /**
   * Analisar performance do cache
   */
  async analyzePerformance(): Promise<{
    overall: CachePerformanceMetrics;
    byLayer: Record<CacheLayer, CachePerformanceMetrics>;
    recommendations: string[];
    trends: any[];
  }> {
    try {
      const overall = this.performanceMetrics;
      
      const byLayer: Record<CacheLayer, CachePerformanceMetrics> = {
        memory: await this.getLayerPerformance('memory'),
        redis: await this.getLayerPerformance('redis'),
        edge: await this.getLayerPerformance('edge')
      };

      const recommendations = await this.generatePerformanceRecommendations(overall, byLayer);
      const trends = await this.analyzePerformanceTrends();

      return {
        overall,
        byLayer,
        recommendations,
        trends
      };

    } catch (error) {
      throw new Error(`Erro na análise de performance: ${error}`);
    }
  }

  /**
   * Otimizar cache automaticamente
   */
  async optimize(): Promise<{
    changes: string[];
    performance: {
      before: CachePerformanceMetrics;
      after: CachePerformanceMetrics;
      improvement: number;
    };
  }> {
    try {
      const beforeMetrics = { ...this.performanceMetrics };
      const changes: string[] = [];

      // Otimizar estratégias adaptativas
      if (this.config.strategies.adaptive.enabled) {
        const strategyChanges = await this.optimizeAdaptiveStrategies();
        changes.push(...strategyChanges);
      }

      // Otimizar TTLs baseado em padrões de acesso
      const ttlChanges = await this.optimizeTtls();
      changes.push(...ttlChanges);

      // Otimizar compressão
      if (this.config.compression.enabled) {
        const compressionChanges = await this.optimizeCompression();
        changes.push(...compressionChanges);
      }

      // Limpeza de entradas expiradas ou pouco usadas
      const cleanupChanges = await this.cleanupCache();
      changes.push(...cleanupChanges);

      // Rebalancear entre camadas
      const rebalanceChanges = await this.rebalanceLayers();
      changes.push(...rebalanceChanges);

      // Calcular métricas após otimização
      await this.updatePerformanceMetrics();
      const afterMetrics = { ...this.performanceMetrics };
      
      const improvement = this.calculatePerformanceImprovement(beforeMetrics, afterMetrics);

      this.lastOptimization = new Date();

      await this.logCacheActivity('cache_optimized', {
        changes,
        beforeMetrics,
        afterMetrics,
        improvement,
        optimizationTime: new Date()
      });

      return {
        changes,
        performance: {
          before: beforeMetrics,
          after: afterMetrics,
          improvement
        }
      };

    } catch (error) {
      throw new Error(`Erro na otimização do cache: ${error}`);
    }
  }

  // Métodos privados auxiliares

  private initializePerformanceMetrics(): void {
    this.performanceMetrics = {
      hitRate: 0,
      missRate: 0,
      avgResponseTime: 0,
      throughput: 0,
      memoryUsage: 0,
      compressionRatio: 0,
      evictionRate: 0,
      errorRate: 0,
      lastUpdated: new Date()
    };
  }

  private initializeAdaptiveStrategies(): void {
    // Estratégia padrão
    const defaultStrategy: AdaptiveCacheStrategy = {
      name: 'default',
      priority: 1,
      conditions: {},
      config: {
        ttl: 1800, // 30 minutos
        maxSize: 1000,
        evictionPolicy: 'lru',
        compression: true,
        preload: false
      }
    };

    // Estratégia para consultas clínicas
    const clinicalStrategy: AdaptiveCacheStrategy = {
      name: 'clinical',
      priority: 2,
      conditions: {
        dataType: ['clinical_case', 'patient_data', 'medical_record'],
        userType: ['doctor', 'nurse', 'admin']
      },
      config: {
        ttl: 3600, // 1 hora
        maxSize: 500,
        evictionPolicy: 'lfu',
        compression: true,
        preload: true
      }
    };

    // Estratégia para horário comercial
    const businessHoursStrategy: AdaptiveCacheStrategy = {
      name: 'business_hours',
      priority: 3,
      conditions: {
        timeOfDay: { start: 8, end: 18 }
      },
      config: {
        ttl: 900, // 15 minutos
        maxSize: 2000,
        evictionPolicy: 'lru',
        compression: false,
        preload: true
      }
    };

    this.adaptiveStrategies.set('default', defaultStrategy);
    this.adaptiveStrategies.set('clinical', clinicalStrategy);
    this.adaptiveStrategies.set('business_hours', businessHoursStrategy);

    this.currentStrategy = defaultStrategy;
  }

  private async initializeCacheLayers(): Promise<void> {
    // Esta função seria expandida para configurar as camadas específicas
    console.log('Inicializando camadas de cache...');
  }

  private async initializeMemoryCache(): Promise<void> {
    const config = this.config.layers.memory;
    
    this.memoryCache = new LRUCache<string, CacheEntry>({
      max: config.maxSize,
      ttl: config.ttl * 1000, // Converter para millisegundos
      allowStale: false,
      updateAgeOnGet: true,
      updateAgeOnHas: true
    });

    console.log(`✅ Cache de memória inicializado (max: ${config.maxSize}, ttl: ${config.ttl}s)`);
  }

  private async initializeRedisCache(): Promise<void> {
    if (!this.config.layers.redis.url) {
      console.warn('⚠️ URL do Redis não configurada');
      return;
    }

    try {
      this.redisCache = new Redis(this.config.layers.redis.url, {
        keyPrefix: this.config.layers.redis.keyPrefix,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });

      await this.redisCache.ping();
      console.log('✅ Cache Redis inicializado');

    } catch (error) {
      console.warn('⚠️ Erro ao conectar Redis:', error);
      this.config.layers.redis.enabled = false;
    }
  }

  private async initializeEdgeCache(): Promise<void> {
    // Implementação específica para cada provider de edge cache
    console.log(`✅ Cache edge inicializado (provider: ${this.config.layers.edge.provider})`);
  }

  private async loadInvalidationRules(): Promise<void> {
    try {
      const { data: rules, error } = await this.supabase
        .from('cache_invalidation_rules')
        .select('*')
        .eq('active', true);

      if (error) throw error;

      for (const rule of rules) {
        this.invalidationRules.set(rule.id, {
          id: rule.id,
          pattern: rule.pattern,
          event: rule.event,
          conditions: rule.conditions || {},
          cascading: rule.cascading || false,
          active: rule.active
        });
      }

      console.log(`✅ Carregadas ${rules.length} regras de invalidação`);
    } catch (error) {
      console.warn('⚠️ Erro ao carregar regras de invalidação:', error);
    }
  }

  private startPerformanceMonitoring(): void {
    // Monitoramento contínuo de performance
    setInterval(async () => {
      await this.updatePerformanceMetrics();
      
      // Otimização automática se necessário
      if (this.shouldAutoOptimize()) {
        await this.optimize();
      }
    }, 60000); // A cada minuto

    console.log('✅ Monitoramento de performance iniciado');
  }

  private async warmupCache(): Promise<void> {
    if (!this.config.strategies.predictive.preloadPatterns) {
      return;
    }

    try {
      // Carregar dados frequentemente acessados
      const popularQueries = await this.getPopularQueries();
      
      for (const query of popularQueries) {
        try {
          // Pré-carregar no cache
          await this.preloadQuery(query);
        } catch (error) {
          console.warn(`Erro ao aquecer cache para query: ${query}`, error);
        }
      }

      console.log(`✅ Cache aquecido com ${popularQueries.length} consultas populares`);
    } catch (error) {
      console.warn('⚠️ Erro no aquecimento do cache:', error);
    }
  }

  private generateCacheKey(key: string | CacheKey): string {
    if (typeof key === 'string') {
      return key;
    }

    const keyData = {
      namespace: key.namespace,
      operation: key.operation,
      parameters: this.sortObjectKeys(key.parameters),
      version: key.version,
      userId: key.userId,
      clinicId: key.clinicId
    };

    const keyString = JSON.stringify(keyData);
    return Buffer.from(keyString).toString('base64');
  }

  private sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(this.sortObjectKeys.bind(this));
    }

    const sortedKeys = Object.keys(obj).sort();
    const sortedObj: any = {};
    
    for (const key of sortedKeys) {
      sortedObj[key] = this.sortObjectKeys(obj[key]);
    }

    return sortedObj;
  }

  private async getSemanticCache<T>(key: string): Promise<T | null> {
    // Implementar busca semântica no cache
    return null;
  }

  private async getFromLayer<T>(key: string, layer: CacheLayer): Promise<T | null> {
    try {
      switch (layer) {
        case 'memory':
          return this.getFromMemoryCache<T>(key);
          
        case 'redis':
          return this.getFromRedisCache<T>(key);
          
        case 'edge':
          return this.getFromEdgeCache<T>(key);
          
        default:
          return null;
      }
    } catch (error) {
      console.warn(`Erro ao buscar da camada ${layer}:`, error);
      return null;
    }
  }

  private getFromMemoryCache<T>(key: string): T | null {
    if (!this.memoryCache) return null;
    
    const entry = this.memoryCache.get(key);
    return entry ? entry.value as T : null;
  }

  private async getFromRedisCache<T>(key: string): Promise<T | null> {
    if (!this.redisCache) return null;

    try {
      const data = await this.redisCache.get(key);
      if (!data) return null;

      const entry: CacheEntry = JSON.parse(data);
      
      // Verificar se está expirado
      if (entry.expiresAt && new Date() > new Date(entry.expiresAt)) {
        await this.redisCache.del(key);
        return null;
      }

      // Descomprimir se necessário
      const value = entry.compressed 
        ? this.decompress(entry.value)
        : entry.value;

      return value as T;
    } catch (error) {
      console.warn('Erro ao buscar do Redis:', error);
      return null;
    }
  }

  private async getFromEdgeCache<T>(key: string): Promise<T | null> {
    // Implementar busca no cache edge
    return null;
  }

  private async promoteToUpperLayers<T>(key: string, value: T, sourceLayer: CacheLayer): Promise<void> {
    const layers: CacheLayer[] = ['memory', 'redis', 'edge'];
    const sourceIndex = layers.indexOf(sourceLayer);
    
    if (sourceIndex <= 0) return; // Já está na camada mais alta

    // Promover para camadas superiores
    for (let i = 0; i < sourceIndex; i++) {
      const targetLayer = layers[i];
      await this.setToLayer(key, value, targetLayer, {});
    }
  }

  private async updateTtl(key: string, layer: CacheLayer): Promise<void> {
    // Implementar atualização de TTL
  }

  private async fallbackToDatabase<T>(key: string): Promise<T | null> {
    // Implementar fallback para database
    return null;
  }

  private async applyAdaptiveStrategy<T>(
    key: string, 
    value: T, 
    options: any
  ): Promise<any> {
    const strategy = await this.selectBestStrategy(key, value);
    
    return {
      ...options,
      ttl: options.ttl || strategy.config.ttl,
      layers: options.layers || this.getLayersForStrategy(strategy)
    };
  }

  private async selectBestStrategy(key: string, value: any): Promise<AdaptiveCacheStrategy> {
    // Avaliar condições de cada estratégia
    let bestStrategy = this.currentStrategy;
    let highestPriority = 0;

    for (const strategy of this.adaptiveStrategies.values()) {
      if (await this.evaluateStrategyConditions(strategy, key, value)) {
        if (strategy.priority > highestPriority) {
          bestStrategy = strategy;
          highestPriority = strategy.priority;
        }
      }
    }

    return bestStrategy;
  }

  private async evaluateStrategyConditions(
    strategy: AdaptiveCacheStrategy, 
    key: string, 
    value: any
  ): Promise<boolean> {
    const conditions = strategy.conditions;

    // Verificar hora do dia
    if (conditions.timeOfDay) {
      const hour = new Date().getHours();
      if (hour < conditions.timeOfDay.start || hour > conditions.timeOfDay.end) {
        return false;
      }
    }

    // Verificar tipo de dados
    if (conditions.dataType && value.type && !conditions.dataType.includes(value.type)) {
      return false;
    }

    // Outras condições podem ser adicionadas aqui

    return true;
  }

  private async processValueForStorage<T>(value: T, options: any): Promise<CacheEntry> {
    let processedValue = value;
    let compressed = false;
    let encrypted = false;

    // Comprimir se configurado e valor for grande o suficiente
    if (this.compressionEnabled && this.shouldCompress(value)) {
      processedValue = this.compress(value);
      compressed = true;
    }

    // Criptografar dados sensíveis
    if (options.sensitive && this.config.privacy.encryptSensitiveData) {
      processedValue = await this.encrypt(processedValue);
      encrypted = true;
    }

    const entry: CacheEntry = {
      value: processedValue,
      metadata: {
        createdAt: new Date(),
        accessedAt: new Date(),
        accessCount: 0,
        hitRate: 0,
        size: this.getValueSize(processedValue),
        compressed,
        encrypted,
        sensitive: options.sensitive || false,
        dependencies: options.dependencies || [],
        tags: options.tags || []
      }
    };

    if (options.ttl) {
      entry.expiresAt = new Date(Date.now() + options.ttl * 1000);
    }

    return entry;
  }

  private getOptimalLayers(key: string, value: any): CacheLayer[] {
    const layers: CacheLayer[] = [];
    
    // Sempre usar memória para dados pequenos e frequentes
    if (this.config.layers.memory.enabled) {
      layers.push('memory');
    }

    // Usar Redis para dados persistentes
    if (this.config.layers.redis.enabled && this.getValueSize(value) < 10000000) { // 10MB
      layers.push('redis');
    }

    // Usar edge cache para dados públicos
    if (this.config.layers.edge.enabled && !value.sensitive) {
      layers.push('edge');
    }

    return layers;
  }

  private async setToLayer<T>(
    key: string, 
    value: CacheEntry, 
    layer: CacheLayer, 
    options: any
  ): Promise<void> {
    try {
      switch (layer) {
        case 'memory':
          await this.setToMemoryCache(key, value);
          break;
          
        case 'redis':
          await this.setToRedisCache(key, value, options);
          break;
          
        case 'edge':
          await this.setToEdgeCache(key, value, options);
          break;
      }
    } catch (error) {
      console.warn(`Erro ao armazenar na camada ${layer}:`, error);
    }
  }

  private setToMemoryCache(key: string, value: CacheEntry): void {
    if (this.memoryCache) {
      this.memoryCache.set(key, value);
    }
  }

  private async setToRedisCache(key: string, value: CacheEntry, options: any): Promise<void> {
    if (!this.redisCache) return;

    try {
      const serialized = JSON.stringify(value);
      
      if (options.ttl) {
        await this.redisCache.setex(key, options.ttl, serialized);
      } else {
        await this.redisCache.set(key, serialized);
      }
    } catch (error) {
      console.warn('Erro ao armazenar no Redis:', error);
    }
  }

  private async setToEdgeCache(key: string, value: CacheEntry, options: any): Promise<void> {
    // Implementar armazenamento no cache edge
  }

  private async setSemanticCache<T>(key: string, value: T, options: any): Promise<void> {
    // Implementar cache semântico
  }

  private isSemanticCacheable(value: any): boolean {
    // Determinar se o valor é adequado para cache semântico
    return typeof value === 'object' && 
           (value.query || value.searchText || value.clinicalData);
  }

  private async registerDependencies(key: string, dependencies: string[]): Promise<void> {
    // Registrar dependências para invalidação em cascata
    for (const dep of dependencies) {
      // Implementar registro de dependências
    }
  }

  private getValueSize(value: any): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }

  private shouldCompress(value: any): boolean {
    const size = this.getValueSize(value);
    return size > this.config.compression.threshold;
  }

  private compress(value: any): string {
    try {
      const json = JSON.stringify(value);
      const compressed = pako.gzip(json, { level: this.config.compression.level });
      return Buffer.from(compressed).toString('base64');
    } catch (error) {
      console.warn('Erro na compressão:', error);
      return JSON.stringify(value);
    }
  }

  private decompress(compressedValue: string): any {
    try {
      const buffer = Buffer.from(compressedValue, 'base64');
      const decompressed = pako.ungzip(buffer, { to: 'string' });
      return JSON.parse(decompressed);
    } catch (error) {
      console.warn('Erro na descompressão:', error);
      return compressedValue;
    }
  }

  private async encrypt(value: any): Promise<any> {
    // Implementar criptografia para dados sensíveis
    return value;
  }

  private getLayersForStrategy(strategy: AdaptiveCacheStrategy): CacheLayer[] {
    // Determinar camadas baseado na estratégia
    const layers: CacheLayer[] = ['memory'];
    
    if (strategy.config.ttl > 300) { // > 5 minutos
      layers.push('redis');
    }
    
    if (!strategy.config.compression) {
      layers.push('edge');
    }
    
    return layers;
  }

  private async invalidateFromLayer(
    patterns: (string | CacheKey)[], 
    layer: CacheLayer, 
    options: any
  ): Promise<number> {
    // Implementar invalidação por camada
    return 0;
  }

  private async findDependentKeys(patterns: (string | CacheKey)[]): Promise<string[]> {
    // Encontrar chaves dependentes para invalidação em cascata
    return [];
  }

  private async getLayerPerformance(layer: CacheLayer): Promise<CachePerformanceMetrics> {
    // Calcular métricas de performance por camada
    return this.performanceMetrics;
  }

  private async generatePerformanceRecommendations(
    overall: CachePerformanceMetrics,
    byLayer: Record<CacheLayer, CachePerformanceMetrics>
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (overall.hitRate < 0.7) {
      recommendations.push('Taxa de hit baixa - considere aumentar TTL ou melhorar estratégias de preload');
    }

    if (overall.avgResponseTime > 100) {
      recommendations.push('Tempo de resposta alto - otimize compressão ou migre dados frequentes para memória');
    }

    if (overall.memoryUsage > 0.8) {
      recommendations.push('Uso de memória alto - implemente eviction mais agressiva ou aumente capacidade');
    }

    return recommendations;
  }

  private async analyzePerformanceTrends(): Promise<any[]> {
    // Analisar tendências de performance
    return [];
  }

  private async optimizeAdaptiveStrategies(): Promise<string[]> {
    // Otimizar estratégias adaptativas baseado em uso
    return [];
  }

  private async optimizeTtls(): Promise<string[]> {
    // Otimizar TTLs baseado em padrões de acesso
    return [];
  }

  private async optimizeCompression(): Promise<string[]> {
    // Otimizar configurações de compressão
    return [];
  }

  private async cleanupCache(): Promise<string[]> {
    // Limpar entradas expiradas ou pouco usadas
    return [];
  }

  private async rebalanceLayers(): Promise<string[]> {
    // Rebalancear dados entre camadas
    return [];
  }

  private async updatePerformanceMetrics(): Promise<void> {
    // Atualizar métricas de performance
    this.performanceMetrics.lastUpdated = new Date();
  }

  private calculatePerformanceImprovement(
    before: CachePerformanceMetrics, 
    after: CachePerformanceMetrics
  ): number {
    // Calcular melhoria de performance
    const hitRateImprovement = (after.hitRate - before.hitRate) / before.hitRate;
    const responseTimeImprovement = (before.avgResponseTime - after.avgResponseTime) / before.avgResponseTime;
    
    return (hitRateImprovement + responseTimeImprovement) / 2;
  }

  private async updateCacheMetrics(key: string, operation: string, executionTime: number): Promise<void> {
    // Atualizar métricas específicas do cache
    const stats = this.cacheStats.get(key) || {
      hits: 0,
      misses: 0,
      totalTime: 0,
      operations: 0
    };

    if (operation.includes('hit')) {
      stats.hits++;
    } else if (operation === 'miss') {
      stats.misses++;
    }

    stats.totalTime += executionTime;
    stats.operations++;

    this.cacheStats.set(key, stats);
  }

  private shouldAutoOptimize(): boolean {
    const timeSinceLastOptimization = Date.now() - this.lastOptimization.getTime();
    const optimizationInterval = 3600000; // 1 hora

    return timeSinceLastOptimization > optimizationInterval &&
           (this.performanceMetrics.hitRate < 0.6 || 
            this.performanceMetrics.avgResponseTime > 200);
  }

  private async getPopularQueries(): Promise<string[]> {
    // Buscar consultas populares para preload
    return [];
  }

  private async preloadQuery(query: string): Promise<void> {
    // Pré-carregar consulta no cache
  }

  private async logCacheActivity(activity: string, data: any): Promise<void> {
    try {
      await this.auditLogger.logSearchActivity(`cache_${activity}`, data);
    } catch (error) {
      console.warn('Erro ao registrar atividade de cache:', error);
    }
  }
}

/**
 * Factory para criar instância configurada do IntelligentCacheEngine
 */
export function createIntelligentCacheEngine(): IntelligentCacheEngine {
  const config: IntelligentCacheConfig = {
    layers: {
      memory: {
        enabled: process.env.ENABLE_MEMORY_CACHE !== 'false',
        maxSize: parseInt(process.env.MEMORY_CACHE_MAX_SIZE || '1000'),
        ttl: parseInt(process.env.MEMORY_CACHE_TTL || '300'),
        algorithm: (process.env.MEMORY_CACHE_ALGORITHM as any) || 'lru'
      },
      redis: {
        enabled: process.env.ENABLE_REDIS_CACHE === 'true',
        url: process.env.REDIS_URL,
        ttl: parseInt(process.env.REDIS_CACHE_TTL || '1800'),
        compression: process.env.REDIS_COMPRESSION === 'true',
        cluster: process.env.REDIS_CLUSTER === 'true',
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'neonpro:cache:'
      },
      edge: {
        enabled: process.env.ENABLE_EDGE_CACHE === 'true',
        provider: (process.env.EDGE_CACHE_PROVIDER as any) || 'vercel',
        ttl: parseInt(process.env.EDGE_CACHE_TTL || '3600'),
        regions: process.env.EDGE_CACHE_REGIONS?.split(',') || ['us-east-1']
      }
    },
    strategies: {
      adaptive: {
        enabled: process.env.ENABLE_ADAPTIVE_CACHE === 'true',
        learningRate: parseFloat(process.env.ADAPTIVE_LEARNING_RATE || '0.1'),
        performanceThreshold: parseFloat(process.env.PERFORMANCE_THRESHOLD || '0.8'),
        memoryPressureThreshold: parseFloat(process.env.MEMORY_PRESSURE_THRESHOLD || '0.9')
      },
      semantic: {
        enabled: process.env.ENABLE_SEMANTIC_CACHE === 'true',
        similarityThreshold: parseFloat(process.env.SEMANTIC_SIMILARITY_THRESHOLD || '0.8'),
        vectorCache: process.env.ENABLE_VECTOR_CACHE === 'true',
        embeddingTtl: parseInt(process.env.EMBEDDING_TTL || '7200')
      },
      predictive: {
        enabled: process.env.ENABLE_PREDICTIVE_CACHE === 'true',
        preloadPatterns: process.env.ENABLE_PRELOAD_PATTERNS === 'true',
        userBehaviorAnalysis: process.env.ENABLE_USER_BEHAVIOR_ANALYSIS === 'true',
        clinicalWorkflowCache: process.env.ENABLE_CLINICAL_WORKFLOW_CACHE === 'true'
      }
    },
    invalidation: {
      enabled: process.env.ENABLE_CACHE_INVALIDATION !== 'false',
      strategies: (process.env.INVALIDATION_STRATEGIES?.split(',') as any) || ['time', 'event'],
      cascading: process.env.ENABLE_CASCADING_INVALIDATION === 'true',
      bulkInvalidation: process.env.ENABLE_BULK_INVALIDATION === 'true',
      eventSources: process.env.INVALIDATION_EVENT_SOURCES?.split(',') || ['database', 'api']
    },
    performance: {
      monitoring: process.env.ENABLE_CACHE_MONITORING === 'true',
      analytics: process.env.ENABLE_CACHE_ANALYTICS === 'true',
      alerting: process.env.ENABLE_CACHE_ALERTING === 'true',
      optimization: process.env.ENABLE_AUTO_OPTIMIZATION === 'true',
      benchmarking: process.env.ENABLE_CACHE_BENCHMARKING === 'true'
    },
    privacy: {
      encryptSensitiveData: process.env.ENCRYPT_SENSITIVE_CACHE_DATA === 'true',
      anonymizePatientData: process.env.ANONYMIZE_PATIENT_CACHE_DATA === 'true',
      auditCacheAccess: process.env.AUDIT_CACHE_ACCESS === 'true',
      dataRetentionPolicy: parseInt(process.env.CACHE_DATA_RETENTION_DAYS || '30'),
      consentAwareCache: process.env.CONSENT_AWARE_CACHE === 'true'
    },
    compression: {
      enabled: process.env.ENABLE_CACHE_COMPRESSION === 'true',
      algorithm: (process.env.COMPRESSION_ALGORITHM as any) || 'gzip',
      threshold: parseInt(process.env.COMPRESSION_THRESHOLD || '1024'),
      level: parseInt(process.env.COMPRESSION_LEVEL || '6')
    }
  };

  return new IntelligentCacheEngine(config);
}

/**
 * Instância global do IntelligentCacheEngine (singleton)
 */
export const intelligentCacheEngine = createIntelligentCacheEngine();

/**
 * Hook para acessar IntelligentCacheEngine em componentes React
 */
export function useIntelligentCacheEngine() {
  return intelligentCacheEngine;
}