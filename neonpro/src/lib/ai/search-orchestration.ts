/**
 * @fileoverview Search Orchestration Service para NeonPro
 * 
 * Serviço central de orquestração que coordena todas as funcionalidades de busca
 * inteligente, incluindo NLP, busca vetorial, filtros contextuais e caching.
 * 
 * Funcionalidades:
 * - Coordenação de múltiplos engines de busca
 * - Fusão de resultados de diferentes fontes
 * - Cache inteligente e otimização de performance
 * - Fallback automático entre providers
 * - Compliance LGPD em todas as operações
 * 
 * @author APEX Master Developer
 * @version 1.0.0
 * @since 2025-01-30
 */

import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types/supabase';
import { 
  SearchQuery, 
  SearchResult, 
  VectorSearchQuery,
  VectorSearchResult,
  SearchConfig,
  SearchFilters,
  SearchSuggestion,
  SearchOptions,
  SearchMetrics,
  SearchProvider
} from '@/lib/types/search-types';
import { NLPService } from './nlp-service';
import { VectorDatabase } from './vector-database';
import { QueryParser } from './query-parser';
import { SearchErrorHandler } from './error-handler';
import { AuditLogger } from './audit-logger';
import { SearchConfigManager } from './search-config';
import { Redis } from 'ioredis';

// Tipos específicos para orquestração
interface SearchOrchestrationConfig {
  providers: {
    nlp: boolean;
    vector: boolean;
    traditional: boolean;
    elasticsearch: boolean;
    algolia: boolean;
  };
  fusion: {
    enabled: boolean;
    algorithm: 'rrf' | 'weighted' | 'neural'; // Reciprocal Rank Fusion, Weighted, Neural
    weights: {
      nlp: number;
      vector: number;
      traditional: number;
      relevance: number;
      recency: number;
    };
  };
  cache: {
    enabled: boolean;
    strategy: 'lru' | 'lfu' | 'ttl';
    ttl: number;
    maxSize: number;
    prefetch: boolean;
  };
  performance: {
    timeoutMs: number;
    parallelQueries: boolean;
    maxConcurrent: number;
    retryAttempts: number;
  };
}

interface SearchExecution {
  id: string;
  query: SearchQuery;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  providers: SearchProvider[];
  results: SearchResult[];
  metrics: SearchMetrics;
  cached: boolean;
  userId?: string;
  success: boolean;
  error?: string;
}

interface ResultFusion {
  algorithm: 'rrf' | 'weighted' | 'neural';
  sources: Array<{
    provider: SearchProvider;
    results: SearchResult[];
    weight: number;
    score: number;
  }>;
  fusedResults: SearchResult[];
  confidence: number;
  executionTime: number;
}

/**
 * Serviço central de orquestração de busca inteligente
 * 
 * Coordena múltiplos engines de busca, aplica fusão de resultados
 * e otimiza performance através de caching inteligente.
 */
export class SearchOrchestrationService {
  private supabase;
  private config: SearchOrchestrationConfig;
  private nlpService: NLPService;
  private vectorDatabase: VectorDatabase;
  private queryParser: QueryParser;
  private errorHandler: SearchErrorHandler;
  private auditLogger: AuditLogger;
  private configManager: SearchConfigManager;
  private redis?: Redis;
  private searchCache: Map<string, { results: SearchResult[]; timestamp: Date }>;
  private activeSearches: Map<string, SearchExecution>;

  constructor(config: SearchOrchestrationConfig) {
    this.supabase = createClient();
    this.config = config;
    this.nlpService = new NLPService();
    this.vectorDatabase = new VectorDatabase(this.getVectorConfig());
    this.queryParser = new QueryParser();
    this.errorHandler = new SearchErrorHandler();
    this.auditLogger = new AuditLogger();
    this.configManager = new SearchConfigManager();
    this.searchCache = new Map();
    this.activeSearches = new Map();

    // Inicializar Redis se configurado
    if (this.config.cache.enabled && process.env.REDIS_URL) {
      this.redis = new Redis(process.env.REDIS_URL);
    }
  }

  /**
   * Executar busca inteligente orquestrada
   */
  async search(
    query: SearchQuery,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    const execution: SearchExecution = {
      id: crypto.randomUUID(),
      query,
      startTime: new Date(),
      providers: [],
      results: [],
      metrics: {
        totalResults: 0,
        executionTime: 0,
        cacheHit: false,
        providersUsed: [],
        confidence: 0,
        nlpProcessingTime: 0,
        vectorSearchTime: 0,
        traditionalSearchTime: 0
      },
      cached: false,
      userId: options.userId,
      success: false
    };

    try {
      this.activeSearches.set(execution.id, execution);

      // Verificar cache primeiro
      const cacheKey = this.generateCacheKey(query, options);
      const cachedResults = await this.getCachedResults(cacheKey);
      
      if (cachedResults && !options.bypassCache) {
        execution.cached = true;
        execution.results = cachedResults;
        execution.metrics.cacheHit = true;
        execution.success = true;
        
        await this.completeExecution(execution);
        return cachedResults;
      }

      // Parse da query para extrair intenção e parâmetros
      const parsedQuery = await this.queryParser.parseQuery(query.text, {
        contextType: query.contextType,
        userPreferences: options.userPreferences
      });

      execution.metrics.nlpProcessingTime = parsedQuery.processingTime || 0;

      // Determinar providers a serem usados
      const providers = this.selectProviders(parsedQuery, options);
      execution.providers = providers;

      // Executar buscas em paralelo se habilitado
      const searchPromises: Promise<SearchResult[]>[] = [];

      if (this.config.performance.parallelQueries) {
        // Busca paralela
        for (const provider of providers) {
          searchPromises.push(this.executeProviderSearch(provider, parsedQuery, options));
        }
      } else {
        // Busca sequencial
        for (const provider of providers) {
          const results = await this.executeProviderSearch(provider, parsedQuery, options);
          searchPromises.push(Promise.resolve(results));
        }
      }

      // Aguardar todos os resultados
      const providerResults = await Promise.allSettled(searchPromises);
      
      // Processar resultados de cada provider
      const allResults: Array<{ provider: SearchProvider; results: SearchResult[] }> = [];
      
      providerResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allResults.push({
            provider: providers[index],
            results: result.value
          });
        } else {
          console.warn(`Provider ${providers[index]} falhou:`, result.reason);
        }
      });

      // Aplicar fusão de resultados se múltiplos providers
      let finalResults: SearchResult[];
      
      if (allResults.length > 1 && this.config.fusion.enabled) {
        const fusion = await this.fuseResults(allResults, parsedQuery);
        finalResults = fusion.fusedResults;
        execution.metrics.confidence = fusion.confidence;
      } else if (allResults.length > 0) {
        finalResults = allResults[0].results;
        execution.metrics.confidence = 0.85; // Confiança padrão para provider único
      } else {
        finalResults = [];
        execution.metrics.confidence = 0;
      }

      // Aplicar filtros adicionais
      if (query.filters && Object.keys(query.filters).length > 0) {
        finalResults = this.applyFilters(finalResults, query.filters);
      }

      // Aplicar ordenação
      finalResults = this.sortResults(finalResults, query.sortBy, query.sortOrder);

      // Aplicar paginação
      const paginatedResults = this.paginateResults(finalResults, options);

      execution.results = paginatedResults;
      execution.metrics.totalResults = paginatedResults.length;
      execution.metrics.providersUsed = providers;
      execution.success = true;

      // Salvar no cache
      await this.setCachedResults(cacheKey, paginatedResults);

      // Completar execução
      await this.completeExecution(execution);

      return paginatedResults;

    } catch (error) {
      execution.error = error instanceof Error ? error.message : 'Erro desconhecido';
      execution.success = false;
      
      await this.completeExecution(execution);
      
      const handledError = await this.errorHandler.handleSearchError(error, {
        query: query.text,
        providers: execution.providers,
        options
      });
      
      throw handledError;
    } finally {
      this.activeSearches.delete(execution.id);
    }
  }

  /**
   * Busca com sugestões automáticas
   */
  async searchWithSuggestions(
    query: SearchQuery,
    options: SearchOptions = {}
  ): Promise<{
    results: SearchResult[];
    suggestions: SearchSuggestion[];
    correctedQuery?: string;
  }> {
    try {
      // Gerar sugestões baseadas na query
      const suggestions = await this.generateSuggestions(query.text, {
        contextType: query.contextType,
        maxSuggestions: options.maxSuggestions || 5,
        includeAutoComplete: true
      });

      // Verificar se a query precisa de correção
      const correctedQuery = await this.getCorrectedQuery(query.text);

      // Executar busca principal
      const searchQuery = correctedQuery ? { ...query, text: correctedQuery } : query;
      const results = await this.search(searchQuery, options);

      await this.auditLogger.logSearchActivity('search_with_suggestions', {
        originalQuery: query.text,
        correctedQuery: correctedQuery || query.text,
        resultsCount: results.length,
        suggestionsCount: suggestions.length
      });

      return {
        results,
        suggestions,
        correctedQuery
      };

    } catch (error) {
      const handledError = await this.errorHandler.handleSearchError(error, {
        query: query.text,
        operation: 'search_with_suggestions',
        options
      });
      
      throw handledError;
    }
  }

  /**
   * Busca de documentos similares
   */
  async findSimilarContent(
    referenceContent: string,
    contentType: 'patient' | 'consultation' | 'medical_record',
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      const query: VectorSearchQuery = {
        text: referenceContent,
        type: 'similarity',
        documentTypes: [contentType],
        filters: options.filters
      };

      const vectorResults = await this.vectorDatabase.searchSimilar(query, {
        limit: options.limit || 10,
        threshold: options.similarityThreshold || 0.7,
        includeMetadata: true
      });

      // Converter VectorSearchResult para SearchResult
      const results: SearchResult[] = vectorResults.map(vResult => ({
        id: vResult.id,
        title: this.extractTitle(vResult.content, contentType),
        content: vResult.content,
        type: 'document',
        source: 'vector_similarity',
        score: vResult.score,
        url: this.generateDocumentUrl(vResult.documentId, contentType),
        metadata: {
          ...vResult.metadata,
          documentId: vResult.documentId,
          documentType: vResult.documentType,
          similarityScore: vResult.score
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await this.auditLogger.logSearchActivity('similar_content_search', {
        referenceContent: referenceContent.substring(0, 100),
        contentType,
        resultsCount: results.length,
        averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length
      });

      return results;

    } catch (error) {
      const handledError = await this.errorHandler.handleSearchError(error, {
        query: referenceContent.substring(0, 100),
        operation: 'find_similar_content',
        contentType
      });
      
      throw handledError;
    }
  }

  /**
   * Autocomplete inteligente
   */
  async getAutocompleteSuggestions(
    partialQuery: string,
    contextType?: string,
    maxSuggestions: number = 8
  ): Promise<SearchSuggestion[]> {
    try {
      // Buscar sugestões do cache primeiro
      const cacheKey = `autocomplete:${contextType || 'general'}:${partialQuery.toLowerCase()}`;
      const cached = await this.getCachedSuggestions(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Gerar sugestões usando NLP
      const nlpSuggestions = await this.nlpService.generateAutocompleteSuggestions(
        partialQuery,
        {
          contextType,
          maxSuggestions,
          includeSemanticSimilar: true
        }
      );

      // Buscar sugestões baseadas em histórico
      const historicalSuggestions = await this.getHistoricalSuggestions(
        partialQuery,
        contextType,
        Math.ceil(maxSuggestions / 2)
      );

      // Combinar e ranquear sugestões
      const allSuggestions = [...nlpSuggestions, ...historicalSuggestions];
      const uniqueSuggestions = this.deduplicateSuggestions(allSuggestions);
      const rankedSuggestions = this.rankSuggestions(uniqueSuggestions, partialQuery);

      const finalSuggestions = rankedSuggestions.slice(0, maxSuggestions);

      // Salvar no cache
      await this.setCachedSuggestions(cacheKey, finalSuggestions);

      await this.auditLogger.logSearchActivity('autocomplete_suggestions', {
        partialQuery,
        contextType,
        suggestionsCount: finalSuggestions.length
      });

      return finalSuggestions;

    } catch (error) {
      const handledError = await this.errorHandler.handleSearchError(error, {
        query: partialQuery,
        operation: 'autocomplete_suggestions',
        contextType
      });
      
      // Em caso de erro, retornar array vazio para não quebrar UX
      console.warn('Erro em autocomplete:', handledError);
      return [];
    }
  }

  /**
   * Obter métricas de performance
   */
  async getSearchMetrics(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<{
    totalSearches: number;
    averageResponseTime: number;
    cacheHitRate: number;
    popularQueries: Array<{ query: string; count: number }>;
    providerPerformance: Array<{ provider: SearchProvider; avgTime: number; successRate: number }>;
    errorRate: number;
  }> {
    try {
      const timeframeStart = this.getTimeframeStart(timeframe);
      
      const { data: metrics, error } = await this.supabase
        .rpc('get_search_metrics', {
          start_date: timeframeStart.toISOString(),
          end_date: new Date().toISOString()
        });

      if (error) throw error;

      return metrics;

    } catch (error) {
      const handledError = await this.errorHandler.handleSearchError(error, {
        operation: 'get_search_metrics',
        timeframe
      });
      
      throw handledError;
    }
  }

  // Métodos privados

  private getVectorConfig() {
    return {
      provider: 'supabase' as const,
      supabase: {
        embeddingTable: 'vector_embeddings',
        vectorColumn: 'embedding',
        metadataColumn: 'metadata',
        similarityFunction: 'cosine' as const,
        threshold: 0.7
      },
      cache: {
        enabled: true,
        ttl: 3600,
        maxSize: 1000
      }
    };
  }

  private selectProviders(
    parsedQuery: any,
    options: SearchOptions
  ): SearchProvider[] {
    const providers: SearchProvider[] = [];

    // Lógica para selecionar providers baseada na query e configuração
    if (this.config.providers.nlp && parsedQuery.requiresNLP) {
      providers.push('nlp');
    }

    if (this.config.providers.vector && (parsedQuery.isSemanticQuery || options.includeSemanticSearch)) {
      providers.push('vector');
    }

    if (this.config.providers.traditional) {
      providers.push('traditional');
    }

    // Garantir pelo menos um provider
    if (providers.length === 0) {
      providers.push('traditional');
    }

    return providers;
  }

  private async executeProviderSearch(
    provider: SearchProvider,
    parsedQuery: any,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    const startTime = Date.now();

    try {
      switch (provider) {
        case 'nlp':
          return await this.executeNLPSearch(parsedQuery, options);
        case 'vector':
          return await this.executeVectorSearch(parsedQuery, options);
        case 'traditional':
          return await this.executeTraditionalSearch(parsedQuery, options);
        default:
          return [];
      }
    } finally {
      const duration = Date.now() - startTime;
      this.updateProviderMetrics(provider, duration);
    }
  }

  private async executeNLPSearch(parsedQuery: any, options: SearchOptions): Promise<SearchResult[]> {
    // Implementar busca via NLP
    const nlpResults = await this.nlpService.enhancedSearch(parsedQuery.original, {
      contextType: parsedQuery.contextType,
      maxResults: options.limit || 20
    });

    return nlpResults.map(result => ({
      id: result.id,
      title: result.title,
      content: result.content,
      type: 'nlp_result',
      source: 'nlp',
      score: result.confidence,
      url: result.url,
      metadata: result.metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  private async executeVectorSearch(parsedQuery: any, options: SearchOptions): Promise<SearchResult[]> {
    const vectorQuery: VectorSearchQuery = {
      text: parsedQuery.original,
      type: 'semantic',
      documentTypes: parsedQuery.documentTypes || ['patient', 'consultation', 'medical_record']
    };

    const vectorResults = await this.vectorDatabase.searchSimilar(vectorQuery, {
      limit: options.limit || 20,
      threshold: options.similarityThreshold || 0.7
    });

    return vectorResults.map(result => ({
      id: result.id,
      title: this.extractTitle(result.content, result.documentType),
      content: result.content,
      type: 'vector_result',
      source: 'vector',
      score: result.score,
      url: this.generateDocumentUrl(result.documentId, result.documentType),
      metadata: result.metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  private async executeTraditionalSearch(parsedQuery: any, options: SearchOptions): Promise<SearchResult[]> {
    // Implementar busca tradicional no Supabase
    const { data, error } = await this.supabase
      .rpc('traditional_search', {
        search_query: parsedQuery.original,
        search_options: {
          limit: options.limit || 20,
          filters: options.filters || {},
          sort_by: options.sortBy || 'relevance'
        }
      });

    if (error) throw error;

    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      type: 'traditional_result',
      source: 'database',
      score: item.rank,
      url: item.url,
      metadata: item.metadata,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  }

  private async fuseResults(
    allResults: Array<{ provider: SearchProvider; results: SearchResult[] }>,
    parsedQuery: any
  ): Promise<ResultFusion> {
    const startTime = Date.now();

    // Implementar algoritmo de fusão baseado na configuração
    let fusedResults: SearchResult[];
    let confidence: number;

    switch (this.config.fusion.algorithm) {
      case 'rrf':
        fusedResults = this.reciprocalRankFusion(allResults);
        confidence = 0.85;
        break;
      case 'weighted':
        fusedResults = this.weightedFusion(allResults);
        confidence = 0.80;
        break;
      case 'neural':
        fusedResults = await this.neuralFusion(allResults, parsedQuery);
        confidence = 0.90;
        break;
      default:
        fusedResults = allResults[0]?.results || [];
        confidence = 0.75;
    }

    const executionTime = Date.now() - startTime;

    return {
      algorithm: this.config.fusion.algorithm,
      sources: allResults.map(r => ({
        provider: r.provider,
        results: r.results,
        weight: this.config.fusion.weights[r.provider] || 1,
        score: r.results.reduce((sum, res) => sum + res.score, 0) / r.results.length
      })),
      fusedResults,
      confidence,
      executionTime
    };
  }

  private reciprocalRankFusion(
    allResults: Array<{ provider: SearchProvider; results: SearchResult[] }>
  ): SearchResult[] {
    const k = 60; // Constante RRF típica
    const documentScores = new Map<string, { result: SearchResult; score: number }>();

    allResults.forEach(({ provider, results }) => {
      const weight = this.config.fusion.weights[provider] || 1;
      
      results.forEach((result, rank) => {
        const rrf_score = weight / (k + rank + 1);
        const existing = documentScores.get(result.id);
        
        if (existing) {
          existing.score += rrf_score;
        } else {
          documentScores.set(result.id, {
            result: { ...result, source: 'fused' },
            score: rrf_score
          });
        }
      });
    });

    return Array.from(documentScores.values())
      .sort((a, b) => b.score - a.score)
      .map(item => ({ ...item.result, score: item.score }));
  }

  private weightedFusion(
    allResults: Array<{ provider: SearchProvider; results: SearchResult[] }>
  ): SearchResult[] {
    const documentScores = new Map<string, { result: SearchResult; score: number }>();

    allResults.forEach(({ provider, results }) => {
      const weight = this.config.fusion.weights[provider] || 1;
      
      results.forEach(result => {
        const weighted_score = result.score * weight;
        const existing = documentScores.get(result.id);
        
        if (existing) {
          existing.score = Math.max(existing.score, weighted_score);
        } else {
          documentScores.set(result.id, {
            result: { ...result, source: 'fused' },
            score: weighted_score
          });
        }
      });
    });

    return Array.from(documentScores.values())
      .sort((a, b) => b.score - a.score)
      .map(item => ({ ...item.result, score: item.score }));
  }

  private async neuralFusion(
    allResults: Array<{ provider: SearchProvider; results: SearchResult[] }>,
    parsedQuery: any
  ): Promise<SearchResult[]> {
    // Implementação simplificada de fusão neural
    // Em produção, isso usaria um modelo treinado para ranking
    
    const allDocuments = allResults.flatMap(({ provider, results }) => 
      results.map(result => ({
        ...result,
        provider,
        providerWeight: this.config.fusion.weights[provider] || 1
      }))
    );

    // Calcular score neural baseado em múltiplos fatores
    const neuralScored = allDocuments.map(doc => {
      const baseScore = doc.score * doc.providerWeight;
      const recencyScore = this.calculateRecencyScore(doc.createdAt);
      const relevanceScore = this.calculateRelevanceScore(doc.content, parsedQuery.original);
      
      const neuralScore = (baseScore * 0.5) + (recencyScore * 0.2) + (relevanceScore * 0.3);
      
      return {
        ...doc,
        score: neuralScore,
        source: 'neural_fusion'
      };
    });

    // Remover duplicatas e ordenar
    const uniqueResults = this.deduplicateResults(neuralScored);
    return uniqueResults.sort((a, b) => b.score - a.score);
  }

  private calculateRecencyScore(createdAt: Date): number {
    const now = new Date();
    const ageInDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    
    // Score de recência que decai exponencialmente
    return Math.exp(-ageInDays / 30); // Decai pela metade a cada 30 dias
  }

  private calculateRelevanceScore(content: string, query: string): number {
    // Implementação simples de relevância baseada em match de termos
    const queryTerms = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    const matches = queryTerms.filter(term => contentLower.includes(term));
    return matches.length / queryTerms.length;
  }

  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      if (seen.has(result.id)) {
        return false;
      }
      seen.add(result.id);
      return true;
    });
  }

  private applyFilters(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    return results.filter(result => {
      return Object.entries(filters).every(([key, value]) => {
        if (result.metadata && result.metadata[key]) {
          if (Array.isArray(value)) {
            return value.includes(result.metadata[key]);
          }
          return result.metadata[key] === value;
        }
        return false;
      });
    });
  }

  private sortResults(
    results: SearchResult[],
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc'
  ): SearchResult[] {
    if (!sortBy) return results;

    return [...results].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'date':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'relevance':
          aValue = a.score;
          bValue = b.score;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }

  private paginateResults(results: SearchResult[], options: SearchOptions): SearchResult[] {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return results.slice(startIndex, endIndex);
  }

  private generateCacheKey(query: SearchQuery, options: SearchOptions): string {
    const keyData = {
      text: query.text,
      type: query.type,
      filters: query.filters,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      limit: options.limit,
      page: options.page
    };
    
    return `search:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
  }

  private async getCachedResults(key: string): Promise<SearchResult[] | null> {
    try {
      if (this.redis) {
        const cached = await this.redis.get(key);
        return cached ? JSON.parse(cached) : null;
      }

      const memCached = this.searchCache.get(key);
      if (memCached && (Date.now() - memCached.timestamp.getTime()) < (this.config.cache.ttl * 1000)) {
        return memCached.results;
      }

      return null;
    } catch (error) {
      console.warn('Erro ao acessar cache de busca:', error);
      return null;
    }
  }

  private async setCachedResults(key: string, results: SearchResult[]): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.setex(key, this.config.cache.ttl, JSON.stringify(results));
      }

      this.searchCache.set(key, {
        results,
        timestamp: new Date()
      });

      if (this.searchCache.size > this.config.cache.maxSize) {
        const firstKey = this.searchCache.keys().next().value;
        this.searchCache.delete(firstKey);
      }
    } catch (error) {
      console.warn('Erro ao salvar cache de busca:', error);
    }
  }

  private async getCachedSuggestions(key: string): Promise<SearchSuggestion[] | null> {
    try {
      if (this.redis) {
        const cached = await this.redis.get(key);
        return cached ? JSON.parse(cached) : null;
      }
      return null;
    } catch (error) {
      console.warn('Erro ao acessar cache de sugestões:', error);
      return null;
    }
  }

  private async setCachedSuggestions(key: string, suggestions: SearchSuggestion[]): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.setex(key, 300, JSON.stringify(suggestions)); // 5 minutos
      }
    } catch (error) {
      console.warn('Erro ao salvar cache de sugestões:', error);
    }
  }

  private async generateSuggestions(
    query: string,
    options: {
      contextType?: string;
      maxSuggestions: number;
      includeAutoComplete: boolean;
    }
  ): Promise<SearchSuggestion[]> {
    // Implementar geração de sugestões
    return [];
  }

  private async getCorrectedQuery(query: string): Promise<string | null> {
    // Implementar correção ortográfica
    return null;
  }

  private async getHistoricalSuggestions(
    partialQuery: string,
    contextType?: string,
    maxSuggestions: number = 5
  ): Promise<SearchSuggestion[]> {
    // Implementar sugestões baseadas em histórico
    return [];
  }

  private deduplicateSuggestions(suggestions: SearchSuggestion[]): SearchSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {
      const key = suggestion.text.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private rankSuggestions(suggestions: SearchSuggestion[], partialQuery: string): SearchSuggestion[] {
    const queryLower = partialQuery.toLowerCase();
    
    return suggestions
      .map(suggestion => ({
        ...suggestion,
        score: this.calculateSuggestionScore(suggestion, queryLower)
      }))
      .sort((a, b) => b.score - a.score);
  }

  private calculateSuggestionScore(suggestion: SearchSuggestion, queryLower: string): number {
    const textLower = suggestion.text.toLowerCase();
    
    // Pontuação baseada em:
    // 1. Match exato no início
    // 2. Contém a query
    // 3. Popularidade/frequência
    
    let score = 0;
    
    if (textLower.startsWith(queryLower)) {
      score += 100;
    } else if (textLower.includes(queryLower)) {
      score += 50;
    }
    
    score += (suggestion.frequency || 0) * 10;
    
    return score;
  }

  private extractTitle(content: string, documentType: string): string {
    // Extrair título baseado no tipo de documento
    const firstLine = content.split('\n')[0];
    return firstLine.substring(0, 100) + (firstLine.length > 100 ? '...' : '');
  }

  private generateDocumentUrl(documentId: string, documentType: string): string {
    // Gerar URL baseada no tipo de documento
    const baseUrl = '/dashboard';
    switch (documentType) {
      case 'patient':
        return `${baseUrl}/patients/${documentId}`;
      case 'consultation':
        return `${baseUrl}/consultations/${documentId}`;
      case 'medical_record':
        return `${baseUrl}/records/${documentId}`;
      default:
        return `${baseUrl}/documents/${documentId}`;
    }
  }

  private updateProviderMetrics(provider: SearchProvider, duration: number): void {
    // Implementar atualização de métricas de provider
    console.log(`Provider ${provider} executado em ${duration}ms`);
  }

  private getTimeframeStart(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case 'hour':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  private async completeExecution(execution: SearchExecution): Promise<void> {
    execution.endTime = new Date();
    execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
    execution.metrics.executionTime = execution.duration;

    await this.auditLogger.logSearchActivity('search_execution', {
      executionId: execution.id,
      query: execution.query.text,
      duration: execution.duration,
      resultsCount: execution.results.length,
      providers: execution.providers,
      cached: execution.cached,
      success: execution.success,
      error: execution.error
    });
  }
}

/**
 * Factory para criar instância configurada do SearchOrchestrationService
 */
export function createSearchOrchestrationService(): SearchOrchestrationService {
  const config: SearchOrchestrationConfig = {
    providers: {
      nlp: process.env.ENABLE_NLP_SEARCH === 'true',
      vector: process.env.ENABLE_VECTOR_SEARCH === 'true',
      traditional: true,
      elasticsearch: process.env.ENABLE_ELASTICSEARCH === 'true',
      algolia: process.env.ENABLE_ALGOLIA === 'true'
    },
    fusion: {
      enabled: process.env.ENABLE_RESULT_FUSION === 'true',
      algorithm: (process.env.FUSION_ALGORITHM as 'rrf' | 'weighted' | 'neural') || 'rrf',
      weights: {
        nlp: parseFloat(process.env.NLP_WEIGHT || '0.4'),
        vector: parseFloat(process.env.VECTOR_WEIGHT || '0.4'),
        traditional: parseFloat(process.env.TRADITIONAL_WEIGHT || '0.2'),
        relevance: parseFloat(process.env.RELEVANCE_WEIGHT || '0.6'),
        recency: parseFloat(process.env.RECENCY_WEIGHT || '0.4')
      }
    },
    cache: {
      enabled: process.env.ENABLE_SEARCH_CACHE === 'true',
      strategy: (process.env.CACHE_STRATEGY as 'lru' | 'lfu' | 'ttl') || 'ttl',
      ttl: parseInt(process.env.SEARCH_CACHE_TTL || '3600'),
      maxSize: parseInt(process.env.SEARCH_CACHE_MAX_SIZE || '10000'),
      prefetch: process.env.ENABLE_CACHE_PREFETCH === 'true'
    },
    performance: {
      timeoutMs: parseInt(process.env.SEARCH_TIMEOUT_MS || '10000'),
      parallelQueries: process.env.ENABLE_PARALLEL_SEARCH === 'true',
      maxConcurrent: parseInt(process.env.MAX_CONCURRENT_SEARCHES || '3'),
      retryAttempts: parseInt(process.env.SEARCH_RETRY_ATTEMPTS || '2')
    }
  };

  return new SearchOrchestrationService(config);
}

/**
 * Instância global do SearchOrchestrationService (singleton)
 */
export const searchOrchestrationService = createSearchOrchestrationService();

/**
 * Hook para acessar SearchOrchestrationService em componentes React
 */
export function useSearchOrchestration() {
  return searchOrchestrationService;
}