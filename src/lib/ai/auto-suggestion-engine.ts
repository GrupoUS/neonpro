/**
 * @fileoverview Sistema de Sugestões Automáticas para NeonPro
 * 
 * Sistema inteligente de sugestões que aprende com padrões de busca,
 * oferece autocompletar contextual e sugere consultas relacionadas
 * para melhorar a experiência de busca clínica.
 * 
 * Funcionalidades:
 * - Autocompletar inteligente baseado em contexto clínico
 * - Sugestões de queries baseadas em histórico
 * - Correção ortográfica para termos médicos
 * - Sugestões de filtros contextuais
 * - Analytics de padrões de busca
 * 
 * @author APEX Master Developer
 * @version 1.0.0
 * @since 2025-01-30
 */

import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types/supabase';
import { 
  SearchSuggestion, 
  AutocompleteSuggestion,
  SearchQuery,
  SuggestionContext,
  SuggestionMetrics,
  SuggestionConfig,
  QueryCorrection,
  ContextualFilter
} from '@/lib/types/search-types';
import { NLPService } from './nlp-service';
import { AuditLogger } from './audit-logger';
import { SearchErrorHandler } from './error-handler';
import { Redis } from 'ioredis';

// Tipos específicos para sistema de sugestões
interface SuggestionEngineConfig {
  autocomplete: {
    enabled: boolean;
    maxSuggestions: number;
    minQueryLength: number;
    fuzzyMatchThreshold: number;
    contextualBoost: number;
  };
  queryCorrection: {
    enabled: boolean;
    medicalTermsDict: string[];
    maxEditDistance: number;
    confidenceThreshold: number;
  };
  historicalSuggestions: {
    enabled: boolean;
    personalizedWeight: number;
    popularityWeight: number;
    recencyWeight: number;
    minFrequency: number;
  };
  contextualFilters: {
    enabled: boolean;
    adaptiveFilters: boolean;
    userPreferenceLearning: boolean;
    filterRelevanceThreshold: number;
  };
  cache: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
    warmupQueries: string[];
  };
}

interface SuggestionPattern {
  id: string;
  pattern: string;
  category: 'medical_term' | 'procedure' | 'symptom' | 'condition' | 'general';
  frequency: number;
  context: string[];
  lastUsed: Date;
  userSpecific: boolean;
  confidence: number;
}

interface SearchSession {
  sessionId: string;
  userId?: string;
  queries: SearchQuery[];
  patterns: SuggestionPattern[];
  context: SuggestionContext;
  startTime: Date;
  lastActivity: Date;
  learningData: Record<string, any>;
}

interface SuggestionAnalytics {
  totalSuggestions: number;
  acceptedSuggestions: number;
  rejectedSuggestions: number;
  averageConfidence: number;
  topPatterns: SuggestionPattern[];
  userEngagement: {
    clickThroughRate: number;
    averageSessionLength: number;
    queryRefinements: number;
  };
}

/**
 * Sistema avançado de sugestões automáticas para busca clínica
 * 
 * Oferece autocompletar inteligente, correção de queries e sugestões
 * contextuais baseadas em aprendizado de padrões de uso.
 */
export class AutoSuggestionEngine {
  private supabase;
  private config: SuggestionEngineConfig;
  private nlpService: NLPService;
  private auditLogger: AuditLogger;
  private errorHandler: SearchErrorHandler;
  private redis?: Redis;
  private patternCache: Map<string, SuggestionPattern[]>;
  private activeSessions: Map<string, SearchSession>;
  private medicalTermsIndex: Map<string, string[]>;

  constructor(config: SuggestionEngineConfig) {
    this.supabase = createClient();
    this.config = config;
    this.nlpService = new NLPService();
    this.auditLogger = new AuditLogger();
    this.errorHandler = new SearchErrorHandler();
    this.patternCache = new Map();
    this.activeSessions = new Map();
    this.medicalTermsIndex = new Map();

    // Inicializar Redis se configurado
    if (this.config.cache.enabled && process.env.REDIS_URL) {
      this.redis = new Redis(process.env.REDIS_URL);
    }

    // Inicializar índice de termos médicos
    this.initializeMedicalTermsIndex();
  }

  /**
   * Obter sugestões de autocompletar para query parcial
   */
  async getAutocompleteSuggestions(
    partialQuery: string,
    context: SuggestionContext = {},
    userId?: string
  ): Promise<AutocompleteSuggestion[]> {
    try {
      if (partialQuery.length < this.config.autocomplete.minQueryLength) {
        return [];
      }

      const startTime = Date.now();

      // Verificar cache primeiro
      const cacheKey = this.generateAutocompleteCacheKey(partialQuery, context, userId);
      const cached = await this.getCachedSuggestions(cacheKey);
      
      if (cached) {
        await this.logSuggestionActivity('autocomplete_cache_hit', {
          partialQuery,
          context: context.type,
          suggestionsCount: cached.length
        });
        return cached;
      }

      // Gerar sugestões de múltiplas fontes
      const [
        nlpSuggestions,
        historicalSuggestions,
        medicalTermSuggestions,
        contextualSuggestions
      ] = await Promise.all([
        this.generateNLPSuggestions(partialQuery, context),
        this.generateHistoricalSuggestions(partialQuery, context, userId),
        this.generateMedicalTermSuggestions(partialQuery),
        this.generateContextualSuggestions(partialQuery, context)
      ]);

      // Combinar e ranquear sugestões
      const allSuggestions = [
        ...nlpSuggestions,
        ...historicalSuggestions,
        ...medicalTermSuggestions,
        ...contextualSuggestions
      ];

      const uniqueSuggestions = this.deduplicateSuggestions(allSuggestions);
      const rankedSuggestions = this.rankAutocompleteSuggestions(
        uniqueSuggestions,
        partialQuery,
        context,
        userId
      );

      const finalSuggestions = rankedSuggestions.slice(0, this.config.autocomplete.maxSuggestions);

      // Aplicar boost contextual
      const boostedSuggestions = this.applyContextualBoost(finalSuggestions, context);

      // Salvar no cache
      await this.setCachedSuggestions(cacheKey, boostedSuggestions);

      const executionTime = Date.now() - startTime;

      await this.logSuggestionActivity('autocomplete_generated', {
        partialQuery,
        context: context.type,
        suggestionsCount: boostedSuggestions.length,
        executionTime,
        sources: {
          nlp: nlpSuggestions.length,
          historical: historicalSuggestions.length,
          medical: medicalTermSuggestions.length,
          contextual: contextualSuggestions.length
        }
      });

      return boostedSuggestions;

    } catch (error) {
      const handledError = await this.errorHandler.handleSuggestionError(error, {
        operation: 'autocomplete',
        partialQuery,
        context
      });
      
      // Em caso de erro, retornar array vazio para não quebrar UX
      console.warn('Erro em autocompletar:', handledError);
      return [];
    }
  }

  /**
   * Obter sugestões de queries relacionadas
   */
  async getRelatedQueries(
    currentQuery: string,
    context: SuggestionContext = {},
    userId?: string,
    maxSuggestions: number = 5
  ): Promise<SearchSuggestion[]> {
    try {
      const startTime = Date.now();

      // Analisar query atual para extrair entidades e conceitos
      const queryAnalysis = await this.nlpService.analyzeQuery(currentQuery, {
        extractEntities: true,
        identifyIntent: true,
        contextType: context.type
      });

      // Gerar queries relacionadas baseadas em:
      // 1. Entidades similares
      // 2. Sinônimos médicos
      // 3. Histórico de usuários similares
      // 4. Progressão natural de consultas clínicas

      const [
        entityBasedQueries,
        synonymBasedQueries,
        historicalPatterns,
        clinicalProgression
      ] = await Promise.all([
        this.generateEntityBasedQueries(queryAnalysis.entities, context),
        this.generateSynonymBasedQueries(queryAnalysis.medicalTerms, context),
        this.getHistoricalQueryPatterns(currentQuery, userId),
        this.getClinicalProgressionQueries(queryAnalysis.intent, context)
      ]);

      const allRelatedQueries = [
        ...entityBasedQueries,
        ...synonymBasedQueries,
        ...historicalPatterns,
        ...clinicalProgression
      ];

      const uniqueQueries = this.deduplicateSearchSuggestions(allRelatedQueries);
      const rankedQueries = this.rankRelatedQueries(uniqueQueries, currentQuery, context);

      const finalSuggestions = rankedQueries.slice(0, maxSuggestions);

      const executionTime = Date.now() - startTime;

      await this.logSuggestionActivity('related_queries_generated', {
        currentQuery,
        context: context.type,
        suggestionsCount: finalSuggestions.length,
        executionTime,
        sources: {
          entity: entityBasedQueries.length,
          synonym: synonymBasedQueries.length,
          historical: historicalPatterns.length,
          clinical: clinicalProgression.length
        }
      });

      return finalSuggestions;

    } catch (error) {
      const handledError = await this.errorHandler.handleSuggestionError(error, {
        operation: 'related_queries',
        query: currentQuery,
        context
      });
      
      console.warn('Erro em queries relacionadas:', handledError);
      return [];
    }
  }

  /**
   * Correção automática de queries com termos médicos
   */
  async correctQuery(
    query: string,
    context: SuggestionContext = {}
  ): Promise<QueryCorrection | null> {
    try {
      if (!this.config.queryCorrection.enabled) {
        return null;
      }

      const queryTerms = query.toLowerCase().split(/\s+/);
      const corrections: Array<{ original: string; corrected: string; confidence: number }> = [];

      // Verificar cada termo contra dicionário médico
      for (const term of queryTerms) {
        const correction = await this.findMedicalTermCorrection(term);
        if (correction && correction.confidence >= this.config.queryCorrection.confidenceThreshold) {
          corrections.push({
            original: term,
            corrected: correction.suggestion,
            confidence: correction.confidence
          });
        }
      }

      if (corrections.length === 0) {
        return null;
      }

      // Construir query corrigida
      let correctedQuery = query;
      let totalConfidence = 0;

      for (const correction of corrections) {
        correctedQuery = correctedQuery.replace(
          new RegExp(`\\b${correction.original}\\b`, 'gi'),
          correction.corrected
        );
        totalConfidence += correction.confidence;
      }

      const averageConfidence = totalConfidence / corrections.length;

      await this.logSuggestionActivity('query_correction', {
        originalQuery: query,
        correctedQuery,
        corrections: corrections.length,
        confidence: averageConfidence
      });

      return {
        originalQuery: query,
        correctedQuery,
        corrections,
        confidence: averageConfidence,
        suggestion: correctedQuery !== query ? correctedQuery : null
      };

    } catch (error) {
      const handledError = await this.errorHandler.handleSuggestionError(error, {
        operation: 'query_correction',
        query
      });
      
      console.warn('Erro em correção de query:', handledError);
      return null;
    }
  }

  /**
   * Sugerir filtros contextuais baseados na query
   */
  async suggestContextualFilters(
    query: string,
    context: SuggestionContext = {},
    userId?: string
  ): Promise<ContextualFilter[]> {
    try {
      if (!this.config.contextualFilters.enabled) {
        return [];
      }

      const startTime = Date.now();

      // Analisar query para identificar filtros relevantes
      const queryAnalysis = await this.nlpService.analyzeQuery(query, {
        extractEntities: true,
        identifyFilters: true,
        contextType: context.type
      });

      // Gerar filtros baseados em:
      // 1. Entidades identificadas na query
      // 2. Contexto da busca (tipo de dados)
      // 3. Preferências históricas do usuário
      // 4. Padrões de filtros mais utilizados

      const [
        entityFilters,
        contextFilters,
        userPreferenceFilters,
        popularFilters
      ] = await Promise.all([
        this.generateEntityBasedFilters(queryAnalysis.entities),
        this.generateContextBasedFilters(context),
        this.getUserPreferenceFilters(userId, context),
        this.getPopularFilters(query, context)
      ]);

      const allFilters = [
        ...entityFilters,
        ...contextFilters,
        ...userPreferenceFilters,
        ...popularFilters
      ];

      const uniqueFilters = this.deduplicateFilters(allFilters);
      const rankedFilters = this.rankContextualFilters(uniqueFilters, query, context);

      // Aplicar threshold de relevância
      const relevantFilters = rankedFilters.filter(
        filter => filter.relevance >= this.config.contextualFilters.filterRelevanceThreshold
      );

      const executionTime = Date.now() - startTime;

      await this.logSuggestionActivity('contextual_filters_suggested', {
        query,
        context: context.type,
        filtersCount: relevantFilters.length,
        executionTime,
        sources: {
          entity: entityFilters.length,
          context: contextFilters.length,
          userPreference: userPreferenceFilters.length,
          popular: popularFilters.length
        }
      });

      return relevantFilters;

    } catch (error) {
      const handledError = await this.errorHandler.handleSuggestionError(error, {
        operation: 'contextual_filters',
        query,
        context
      });
      
      console.warn('Erro em filtros contextuais:', handledError);
      return [];
    }
  }

  /**
   * Aprender padrões de busca do usuário
   */
  async learnSearchPattern(
    sessionId: string,
    query: SearchQuery,
    userInteraction: {
      suggestionUsed?: boolean;
      selectedSuggestion?: string;
      queryRefined?: boolean;
      filtersApplied?: string[];
      resultClicked?: boolean;
      sessionDuration?: number;
    },
    userId?: string
  ): Promise<void> {
    try {
      let session = this.activeSessions.get(sessionId);
      
      if (!session) {
        session = {
          sessionId,
          userId,
          queries: [],
          patterns: [],
          context: { type: query.contextType },
          startTime: new Date(),
          lastActivity: new Date(),
          learningData: {}
        };
        this.activeSessions.set(sessionId, session);
      }

      // Adicionar query à sessão
      session.queries.push(query);
      session.lastActivity = new Date();

      // Extrair padrões da interação
      const pattern: SuggestionPattern = {
        id: crypto.randomUUID(),
        pattern: query.text,
        category: this.categorizeQuery(query.text),
        frequency: 1,
        context: [query.contextType || 'general'],
        lastUsed: new Date(),
        userSpecific: !!userId,
        confidence: this.calculatePatternConfidence(userInteraction)
      };

      session.patterns.push(pattern);

      // Salvar padrão aprendido no banco
      await this.saveLearnedPattern(pattern, userId);

      // Atualizar métricas de engajamento
      await this.updateEngagementMetrics(sessionId, userInteraction);

      await this.logSuggestionActivity('pattern_learned', {
        sessionId,
        userId,
        pattern: pattern.pattern,
        category: pattern.category,
        confidence: pattern.confidence,
        interaction: userInteraction
      });

    } catch (error) {
      const handledError = await this.errorHandler.handleSuggestionError(error, {
        operation: 'learn_pattern',
        sessionId,
        query: query.text
      });
      
      console.warn('Erro ao aprender padrão:', handledError);
    }
  }

  /**
   * Obter analytics do sistema de sugestões
   */
  async getSuggestionAnalytics(
    timeframe: 'hour' | 'day' | 'week' | 'month' = 'day',
    userId?: string
  ): Promise<SuggestionAnalytics> {
    try {
      const timeframeStart = this.getTimeframeStart(timeframe);
      
      const { data: analytics, error } = await this.supabase
        .rpc('get_suggestion_analytics', {
          start_date: timeframeStart.toISOString(),
          end_date: new Date().toISOString(),
          user_id: userId
        });

      if (error) throw error;

      return analytics;

    } catch (error) {
      const handledError = await this.errorHandler.handleSuggestionError(error, {
        operation: 'get_analytics',
        timeframe,
        userId
      });
      
      throw handledError;
    }
  }

  // Métodos privados auxiliares

  private async initializeMedicalTermsIndex(): Promise<void> {
    try {
      // Carregar dicionário de termos médicos
      const medicalTerms = this.config.queryCorrection.medicalTermsDict;
      
      for (const term of medicalTerms) {
        const variations = this.generateTermVariations(term);
        this.medicalTermsIndex.set(term.toLowerCase(), variations);
      }

      console.log(`Índice médico inicializado com ${medicalTerms.length} termos`);
    } catch (error) {
      console.warn('Erro ao inicializar índice médico:', error);
    }
  }

  private generateTermVariations(term: string): string[] {
    // Gerar variações comuns de termos médicos
    const variations = [term.toLowerCase()];
    
    // Remover acentos
    const normalized = term.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalized !== term) {
      variations.push(normalized.toLowerCase());
    }

    // Variações comuns de grafia
    const commonVariations = {
      'ç': 'c',
      'ph': 'f',
      'th': 't',
      'y': 'i'
    };

    let variant = term.toLowerCase();
    for (const [from, to] of Object.entries(commonVariations)) {
      variant = variant.replace(new RegExp(from, 'g'), to);
    }
    
    if (variant !== term.toLowerCase()) {
      variations.push(variant);
    }

    return variations;
  }

  private async generateNLPSuggestions(
    partialQuery: string,
    context: SuggestionContext
  ): Promise<AutocompleteSuggestion[]> {
    try {
      const nlpSuggestions = await this.nlpService.generateAutocompleteSuggestions(
        partialQuery,
        {
          contextType: context.type,
          maxSuggestions: Math.ceil(this.config.autocomplete.maxSuggestions / 2),
          includeSemanticSimilar: true,
          medicalTermsOnly: context.type === 'medical'
        }
      );

      return nlpSuggestions.map(suggestion => ({
        text: suggestion.text,
        type: 'nlp',
        confidence: suggestion.confidence,
        frequency: 0,
        category: 'ai_generated',
        metadata: {
          source: 'nlp',
          contextType: context.type
        }
      }));
    } catch (error) {
      console.warn('Erro em sugestões NLP:', error);
      return [];
    }
  }

  private async generateHistoricalSuggestions(
    partialQuery: string,
    context: SuggestionContext,
    userId?: string
  ): Promise<AutocompleteSuggestion[]> {
    try {
      const { data: historical, error } = await this.supabase
        .rpc('get_historical_suggestions', {
          partial_query: partialQuery,
          context_type: context.type,
          user_id: userId,
          limit: Math.ceil(this.config.autocomplete.maxSuggestions / 4)
        });

      if (error) throw error;

      return historical.map((item: any) => ({
        text: item.query_text,
        type: 'historical',
        confidence: item.confidence,
        frequency: item.frequency,
        category: 'user_pattern',
        metadata: {
          source: 'historical',
          lastUsed: item.last_used,
          userSpecific: !!userId
        }
      }));
    } catch (error) {
      console.warn('Erro em sugestões históricas:', error);
      return [];
    }
  }

  private async generateMedicalTermSuggestions(
    partialQuery: string
  ): Promise<AutocompleteSuggestion[]> {
    const suggestions: AutocompleteSuggestion[] = [];
    const queryLower = partialQuery.toLowerCase();

    // Buscar termos médicos que começam com a query
    for (const [term, variations] of this.medicalTermsIndex.entries()) {
      if (term.startsWith(queryLower) || variations.some(v => v.startsWith(queryLower))) {
        suggestions.push({
          text: term,
          type: 'medical_term',
          confidence: 0.9,
          frequency: 0,
          category: 'medical_term',
          metadata: {
            source: 'medical_dictionary',
            variations: variations
          }
        });
      }
    }

    return suggestions.slice(0, Math.ceil(this.config.autocomplete.maxSuggestions / 4));
  }

  private async generateContextualSuggestions(
    partialQuery: string,
    context: SuggestionContext
  ): Promise<AutocompleteSuggestion[]> {
    const suggestions: AutocompleteSuggestion[] = [];

    // Sugestões baseadas no contexto específico
    switch (context.type) {
      case 'patient':
        suggestions.push(...this.getPatientContextSuggestions(partialQuery));
        break;
      case 'consultation':
        suggestions.push(...this.getConsultationContextSuggestions(partialQuery));
        break;
      case 'medical_record':
        suggestions.push(...this.getMedicalRecordContextSuggestions(partialQuery));
        break;
      default:
        suggestions.push(...this.getGeneralContextSuggestions(partialQuery));
    }

    return suggestions;
  }

  private getPatientContextSuggestions(partialQuery: string): AutocompleteSuggestion[] {
    const patientSuggestions = [
      'paciente com', 'histórico de', 'tratamento de', 'procedimento',
      'consulta de', 'retorno de', 'primeira consulta'
    ];

    return patientSuggestions
      .filter(suggestion => suggestion.toLowerCase().includes(partialQuery.toLowerCase()))
      .map(text => ({
        text,
        type: 'contextual',
        confidence: 0.8,
        frequency: 0,
        category: 'patient_context',
        metadata: { source: 'contextual', contextType: 'patient' }
      }));
  }

  private getConsultationContextSuggestions(partialQuery: string): AutocompleteSuggestion[] {
    const consultationSuggestions = [
      'consulta de', 'avaliação de', 'procedimento de', 'tratamento de',
      'sessão de', 'retorno', 'primeira consulta', 'consulta de emergência'
    ];

    return consultationSuggestions
      .filter(suggestion => suggestion.toLowerCase().includes(partialQuery.toLowerCase()))
      .map(text => ({
        text,
        type: 'contextual',
        confidence: 0.8,
        frequency: 0,
        category: 'consultation_context',
        metadata: { source: 'contextual', contextType: 'consultation' }
      }));
  }

  private getMedicalRecordContextSuggestions(partialQuery: string): AutocompleteSuggestion[] {
    const recordSuggestions = [
      'prontuário de', 'histórico médico', 'diagnóstico de', 'prescrição de',
      'exame de', 'resultado de', 'laudo de', 'receita médica'
    ];

    return recordSuggestions
      .filter(suggestion => suggestion.toLowerCase().includes(partialQuery.toLowerCase()))
      .map(text => ({
        text,
        type: 'contextual',
        confidence: 0.8,
        frequency: 0,
        category: 'medical_record_context',
        metadata: { source: 'contextual', contextType: 'medical_record' }
      }));
  }

  private getGeneralContextSuggestions(partialQuery: string): AutocompleteSuggestion[] {
    const generalSuggestions = [
      'buscar por', 'encontrar', 'listar', 'filtrar por',
      'mostrar', 'exibir', 'pesquisar'
    ];

    return generalSuggestions
      .filter(suggestion => suggestion.toLowerCase().includes(partialQuery.toLowerCase()))
      .map(text => ({
        text,
        type: 'contextual',
        confidence: 0.7,
        frequency: 0,
        category: 'general_context',
        metadata: { source: 'contextual', contextType: 'general' }
      }));
  }

  private deduplicateSuggestions(suggestions: AutocompleteSuggestion[]): AutocompleteSuggestion[] {
    const seen = new Map<string, AutocompleteSuggestion>();
    
    for (const suggestion of suggestions) {
      const key = suggestion.text.toLowerCase();
      const existing = seen.get(key);
      
      if (!existing || suggestion.confidence > existing.confidence) {
        seen.set(key, suggestion);
      }
    }
    
    return Array.from(seen.values());
  }

  private rankAutocompleteSuggestions(
    suggestions: AutocompleteSuggestion[],
    partialQuery: string,
    context: SuggestionContext,
    userId?: string
  ): AutocompleteSuggestion[] {
    const queryLower = partialQuery.toLowerCase();
    
    return suggestions
      .map(suggestion => ({
        ...suggestion,
        score: this.calculateSuggestionScore(suggestion, queryLower, context, userId)
      }))
      .sort((a, b) => b.score - a.score);
  }

  private calculateSuggestionScore(
    suggestion: AutocompleteSuggestion,
    queryLower: string,
    context: SuggestionContext,
    userId?: string
  ): number {
    let score = suggestion.confidence * 100;
    
    // Boost para match exato no início
    if (suggestion.text.toLowerCase().startsWith(queryLower)) {
      score += 50;
    }
    
    // Boost para frequência de uso
    score += Math.log(suggestion.frequency + 1) * 10;
    
    // Boost para contexto relevante
    if (suggestion.metadata?.contextType === context.type) {
      score += 30;
    }
    
    // Boost para usuário específico
    if (userId && suggestion.metadata?.userSpecific) {
      score += 20;
    }
    
    // Boost para termos médicos
    if (suggestion.category === 'medical_term') {
      score += 25;
    }
    
    return score;
  }

  private applyContextualBoost(
    suggestions: AutocompleteSuggestion[],
    context: SuggestionContext
  ): AutocompleteSuggestion[] {
    const boostFactor = this.config.autocomplete.contextualBoost;
    
    return suggestions.map(suggestion => {
      if (suggestion.metadata?.contextType === context.type) {
        return {
          ...suggestion,
          confidence: Math.min(suggestion.confidence * boostFactor, 1.0)
        };
      }
      return suggestion;
    });
  }

  private generateAutocompleteCacheKey(
    partialQuery: string,
    context: SuggestionContext,
    userId?: string
  ): string {
    const keyData = {
      query: partialQuery.toLowerCase(),
      context: context.type,
      user: userId || 'anonymous'
    };
    
    return `autocomplete:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
  }

  private async getCachedSuggestions(key: string): Promise<AutocompleteSuggestion[] | null> {
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

  private async setCachedSuggestions(key: string, suggestions: AutocompleteSuggestion[]): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.setex(key, this.config.cache.ttl, JSON.stringify(suggestions));
      }
    } catch (error) {
      console.warn('Erro ao salvar cache de sugestões:', error);
    }
  }

  private async findMedicalTermCorrection(term: string): Promise<{ suggestion: string; confidence: number } | null> {
    // Implementar algoritmo de correção (ex: Levenshtein distance)
    const termLower = term.toLowerCase();
    let bestMatch: { suggestion: string; confidence: number } | null = null;
    
    for (const [medicalTerm, variations] of this.medicalTermsIndex.entries()) {
      const allTerms = [medicalTerm, ...variations];
      
      for (const variant of allTerms) {
        const distance = this.calculateEditDistance(termLower, variant);
        const maxLength = Math.max(termLower.length, variant.length);
        const similarity = 1 - (distance / maxLength);
        
        if (similarity >= this.config.queryCorrection.confidenceThreshold &&
            distance <= this.config.queryCorrection.maxEditDistance) {
          if (!bestMatch || similarity > bestMatch.confidence) {
            bestMatch = {
              suggestion: medicalTerm,
              confidence: similarity
            };
          }
        }
      }
    }
    
    return bestMatch;
  }

  private calculateEditDistance(str1: string, str2: string): number {
    // Implementação do algoritmo de Levenshtein
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private async generateEntityBasedQueries(entities: any[], context: SuggestionContext): Promise<SearchSuggestion[]> {
    // Implementar geração de queries baseadas em entidades
    return [];
  }

  private async generateSynonymBasedQueries(medicalTerms: string[], context: SuggestionContext): Promise<SearchSuggestion[]> {
    // Implementar geração de queries baseadas em sinônimos
    return [];
  }

  private async getHistoricalQueryPatterns(query: string, userId?: string): Promise<SearchSuggestion[]> {
    // Implementar busca de padrões históricos
    return [];
  }

  private async getClinicalProgressionQueries(intent: string, context: SuggestionContext): Promise<SearchSuggestion[]> {
    // Implementar progressão clínica de queries
    return [];
  }

  private deduplicateSearchSuggestions(suggestions: SearchSuggestion[]): SearchSuggestion[] {
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

  private rankRelatedQueries(
    queries: SearchSuggestion[],
    currentQuery: string,
    context: SuggestionContext
  ): SearchSuggestion[] {
    return queries.sort((a, b) => b.confidence - a.confidence);
  }

  private async generateEntityBasedFilters(entities: any[]): Promise<ContextualFilter[]> {
    // Implementar filtros baseados em entidades
    return [];
  }

  private async generateContextBasedFilters(context: SuggestionContext): Promise<ContextualFilter[]> {
    // Implementar filtros baseados em contexto
    return [];
  }

  private async getUserPreferenceFilters(userId?: string, context?: SuggestionContext): Promise<ContextualFilter[]> {
    // Implementar filtros baseados em preferências do usuário
    return [];
  }

  private async getPopularFilters(query: string, context: SuggestionContext): Promise<ContextualFilter[]> {
    // Implementar filtros populares
    return [];
  }

  private deduplicateFilters(filters: ContextualFilter[]): ContextualFilter[] {
    const seen = new Set<string>();
    return filters.filter(filter => {
      const key = `${filter.field}:${filter.value}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private rankContextualFilters(
    filters: ContextualFilter[],
    query: string,
    context: SuggestionContext
  ): ContextualFilter[] {
    return filters.sort((a, b) => b.relevance - a.relevance);
  }

  private categorizeQuery(query: string): 'medical_term' | 'procedure' | 'symptom' | 'condition' | 'general' {
    // Implementar categorização de query
    return 'general';
  }

  private calculatePatternConfidence(userInteraction: any): number {
    let confidence = 0.5; // Base confidence
    
    if (userInteraction.suggestionUsed) confidence += 0.3;
    if (userInteraction.resultClicked) confidence += 0.2;
    if (!userInteraction.queryRefined) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private async saveLearnedPattern(pattern: SuggestionPattern, userId?: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('search_patterns')
        .insert({
          id: pattern.id,
          pattern: pattern.pattern,
          category: pattern.category,
          frequency: pattern.frequency,
          context: pattern.context,
          user_id: userId,
          confidence: pattern.confidence,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.warn('Erro ao salvar padrão:', error);
    }
  }

  private async updateEngagementMetrics(sessionId: string, interaction: any): Promise<void> {
    // Implementar atualização de métricas de engajamento
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

  private async logSuggestionActivity(activity: string, data: any): Promise<void> {
    try {
      await this.auditLogger.logSearchActivity(`suggestion_${activity}`, data);
    } catch (error) {
      console.warn('Erro ao registrar atividade de sugestão:', error);
    }
  }
}

/**
 * Factory para criar instância configurada do AutoSuggestionEngine
 */
export function createAutoSuggestionEngine(): AutoSuggestionEngine {
  const config: SuggestionEngineConfig = {
    autocomplete: {
      enabled: process.env.ENABLE_AUTOCOMPLETE === 'true',
      maxSuggestions: parseInt(process.env.MAX_AUTOCOMPLETE_SUGGESTIONS || '8'),
      minQueryLength: parseInt(process.env.MIN_AUTOCOMPLETE_LENGTH || '2'),
      fuzzyMatchThreshold: parseFloat(process.env.FUZZY_MATCH_THRESHOLD || '0.7'),
      contextualBoost: parseFloat(process.env.CONTEXTUAL_BOOST || '1.2')
    },
    queryCorrection: {
      enabled: process.env.ENABLE_QUERY_CORRECTION === 'true',
      medicalTermsDict: process.env.MEDICAL_TERMS_DICT?.split(',') || [],
      maxEditDistance: parseInt(process.env.MAX_EDIT_DISTANCE || '2'),
      confidenceThreshold: parseFloat(process.env.CORRECTION_CONFIDENCE_THRESHOLD || '0.8')
    },
    historicalSuggestions: {
      enabled: process.env.ENABLE_HISTORICAL_SUGGESTIONS === 'true',
      personalizedWeight: parseFloat(process.env.PERSONALIZED_WEIGHT || '0.4'),
      popularityWeight: parseFloat(process.env.POPULARITY_WEIGHT || '0.3'),
      recencyWeight: parseFloat(process.env.RECENCY_WEIGHT || '0.3'),
      minFrequency: parseInt(process.env.MIN_SUGGESTION_FREQUENCY || '2')
    },
    contextualFilters: {
      enabled: process.env.ENABLE_CONTEXTUAL_FILTERS === 'true',
      adaptiveFilters: process.env.ENABLE_ADAPTIVE_FILTERS === 'true',
      userPreferenceLearning: process.env.ENABLE_USER_PREFERENCE_LEARNING === 'true',
      filterRelevanceThreshold: parseFloat(process.env.FILTER_RELEVANCE_THRESHOLD || '0.6')
    },
    cache: {
      enabled: process.env.ENABLE_SUGGESTION_CACHE === 'true',
      ttl: parseInt(process.env.SUGGESTION_CACHE_TTL || '300'), // 5 minutos
      maxSize: parseInt(process.env.SUGGESTION_CACHE_MAX_SIZE || '5000'),
      warmupQueries: process.env.SUGGESTION_WARMUP_QUERIES?.split(',') || []
    }
  };

  return new AutoSuggestionEngine(config);
}

/**
 * Instância global do AutoSuggestionEngine (singleton)
 */
export const autoSuggestionEngine = createAutoSuggestionEngine();

/**
 * Hook para acessar AutoSuggestionEngine em componentes React
 */
export function useAutoSuggestionEngine() {
  return autoSuggestionEngine;
}