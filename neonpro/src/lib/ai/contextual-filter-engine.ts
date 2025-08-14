/**
 * @fileoverview Sistema de Filtros Contextuais Inteligentes para NeonPro
 * 
 * Sistema avançado que sugere e aplica filtros baseados no contexto da busca,
 * aprendendo padrões de uso e adaptando-se às necessidades clínicas específicas.
 * 
 * Funcionalidades:
 * - Filtros adaptativos baseados em contexto clínico
 * - Aprendizado de preferências do usuário
 * - Sugestões automáticas de filtros relevantes
 * - Filtros temporais inteligentes
 * - Combinações de filtros otimizadas
 * 
 * @author APEX Master Developer
 * @version 1.0.0
 * @since 2025-01-30
 */

import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types/supabase';
import { 
  SearchFilters,
  ContextualFilter,
  FilterSuggestion,
  FilterCombination,
  FilterAnalytics,
  AdaptiveFilter,
  TemporalFilter,
  SuggestionContext
} from '@/lib/types/search-types';
import { NLPService } from './nlp-service';
import { AuditLogger } from './audit-logger';
import { SearchErrorHandler } from './error-handler';
import { Redis } from 'ioredis';

// Tipos específicos para filtros contextuais
interface ContextualFilterConfig {
  adaptive: {
    enabled: boolean;
    learningRate: number;
    adaptationThreshold: number;
    maxUserFilters: number;
    decayFactor: number;
  };
  temporal: {
    enabled: boolean;
    smartRanges: boolean;
    recentBias: number;
    seasonalPatterns: boolean;
  };
  contextual: {
    enabled: boolean;
    patientContextFilters: string[];
    consultationContextFilters: string[];
    medicalRecordContextFilters: string[];
    autoSuggestThreshold: number;
  };
  combinations: {
    enabled: boolean;
    maxCombinations: number;
    popularityWeight: number;
    effectivenessWeight: number;
    learningEnabled: boolean;
  };
  cache: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
    precomputePopular: boolean;
  };
}

interface FilterUsagePattern {
  id: string;
  userId?: string;
  filterId: string;
  filterField: string;
  filterValue: any;
  contextType: string;
  frequency: number;
  lastUsed: Date;
  effectiveness: number; // 0-1 baseado em CTR e satisfação
  combinations: string[]; // IDs de outros filtros usados junto
  metadata: Record<string, any>;
}

interface FilterEffectiveness {
  filterId: string;
  totalUses: number;
  successfulSearches: number;
  averageResultsCount: number;
  userSatisfactionScore: number;
  clickThroughRate: number;
  conversionRate: number;
  effectiveness: number;
}

interface SmartFilterSuggestion {
  filter: ContextualFilter;
  reason: 'popular' | 'personalized' | 'contextual' | 'temporal' | 'combination';
  confidence: number;
  expectedImprovement: number;
  usage: {
    frequency: number;
    recentUses: number;
    effectiveness: number;
  };
  metadata: Record<string, any>;
}

interface FilterCombinationPattern {
  id: string;
  filters: ContextualFilter[];
  contextType: string;
  frequency: number;
  effectiveness: number;
  userTypes: string[];
  scenarios: string[];
  lastSeen: Date;
  confidence: number;
}

/**
 * Sistema avançado de filtros contextuais inteligentes
 * 
 * Aprende padrões de uso, sugere filtros relevantes e otimiza
 * a experiência de busca baseada no contexto clínico.
 */
export class ContextualFilterEngine {
  private supabase;
  private config: ContextualFilterConfig;
  private nlpService: NLPService;
  private auditLogger: AuditLogger;
  private errorHandler: SearchErrorHandler;
  private redis?: Redis;
  private filterPatterns: Map<string, FilterUsagePattern>;
  private filterCombinations: Map<string, FilterCombinationPattern>;
  private userPreferences: Map<string, Record<string, any>>;

  constructor(config: ContextualFilterConfig) {
    this.supabase = createClient();
    this.config = config;
    this.nlpService = new NLPService();
    this.auditLogger = new AuditLogger();
    this.errorHandler = new SearchErrorHandler();
    this.filterPatterns = new Map();
    this.filterCombinations = new Map();
    this.userPreferences = new Map();

    // Inicializar Redis se configurado
    if (this.config.cache.enabled && process.env.REDIS_URL) {
      this.redis = new Redis(process.env.REDIS_URL);
    }

    // Carregar padrões existentes
    this.loadExistingPatterns();
  }

  /**
   * Sugerir filtros contextuais inteligentes
   */
  async suggestContextualFilters(
    query: string,
    currentFilters: SearchFilters = {},
    context: SuggestionContext = {},
    userId?: string
  ): Promise<SmartFilterSuggestion[]> {
    try {
      const startTime = Date.now();

      // Verificar cache primeiro
      const cacheKey = this.generateFilterCacheKey(query, currentFilters, context, userId);
      const cached = await this.getCachedFilterSuggestions(cacheKey);
      
      if (cached) {
        await this.logFilterActivity('filter_suggestions_cache_hit', {
          query,
          context: context.type,
          currentFilters: Object.keys(currentFilters).length,
          suggestionsCount: cached.length
        });
        return cached;
      }

      // Analisar query para extrair contexto semântico
      const queryAnalysis = await this.nlpService.analyzeQuery(query, {
        extractEntities: true,
        identifyFilters: true,
        contextType: context.type
      });

      // Gerar sugestões de múltiplas fontes
      const [
        popularFilters,
        personalizedFilters,
        contextualFilters,
        temporalFilters,
        combinationFilters
      ] = await Promise.all([
        this.getPopularFilters(query, context, currentFilters),
        this.getPersonalizedFilters(userId, query, context, currentFilters),
        this.getContextualFilters(queryAnalysis, context, currentFilters),
        this.getTemporalFilters(query, context, currentFilters),
        this.getCombinationFilters(currentFilters, context, userId)
      ]);

      // Combinar e ranquear sugestões
      const allSuggestions = [
        ...popularFilters,
        ...personalizedFilters,
        ...contextualFilters,
        ...temporalFilters,
        ...combinationFilters
      ];

      const uniqueSuggestions = this.deduplicateFilterSuggestions(allSuggestions);
      const rankedSuggestions = this.rankFilterSuggestions(
        uniqueSuggestions,
        query,
        context,
        currentFilters,
        userId
      );

      // Aplicar threshold de auto-sugestão
      const qualifiedSuggestions = rankedSuggestions.filter(
        suggestion => suggestion.confidence >= this.config.contextual.autoSuggestThreshold
      );

      const finalSuggestions = qualifiedSuggestions.slice(0, 8); // Max 8 sugestões

      // Salvar no cache
      await this.setCachedFilterSuggestions(cacheKey, finalSuggestions);

      const executionTime = Date.now() - startTime;

      await this.logFilterActivity('filter_suggestions_generated', {
        query,
        context: context.type,
        currentFilters: Object.keys(currentFilters).length,
        suggestionsCount: finalSuggestions.length,
        executionTime,
        sources: {
          popular: popularFilters.length,
          personalized: personalizedFilters.length,
          contextual: contextualFilters.length,
          temporal: temporalFilters.length,
          combination: combinationFilters.length
        }
      });

      return finalSuggestions;

    } catch (error) {
      const handledError = await this.errorHandler.handleFilterError(error, {
        operation: 'suggest_contextual_filters',
        query,
        context
      });
      
      console.warn('Erro em sugestões de filtros:', handledError);
      return [];
    }
  }

  /**
   * Aplicar filtros adaptativos baseados em aprendizado
   */
  async applyAdaptiveFilters(
    query: string,
    baseFilters: SearchFilters,
    context: SuggestionContext = {},
    userId?: string
  ): Promise<SearchFilters> {
    try {
      if (!this.config.adaptive.enabled) {
        return baseFilters;
      }

      const userPrefs = await this.getUserFilterPreferences(userId);
      const contextPatterns = await this.getContextFilterPatterns(context.type);
      
      const adaptiveFilters: SearchFilters = { ...baseFilters };

      // Aplicar filtros adaptativos baseados em preferências do usuário
      if (userPrefs && Object.keys(userPrefs).length > 0) {
        for (const [field, value] of Object.entries(userPrefs)) {
          if (!adaptiveFilters[field] && this.shouldApplyAdaptiveFilter(field, value, context)) {
            adaptiveFilters[field] = value;
          }
        }
      }

      // Aplicar filtros contextuais automáticos
      const autoFilters = await this.getAutoContextFilters(query, context);
      for (const [field, value] of Object.entries(autoFilters)) {
        if (!adaptiveFilters[field]) {
          adaptiveFilters[field] = value;
        }
      }

      await this.logFilterActivity('adaptive_filters_applied', {
        query,
        context: context.type,
        originalFilters: Object.keys(baseFilters).length,
        adaptiveFilters: Object.keys(adaptiveFilters).length,
        addedFilters: Object.keys(adaptiveFilters).length - Object.keys(baseFilters).length
      });

      return adaptiveFilters;

    } catch (error) {
      const handledError = await this.errorHandler.handleFilterError(error, {
        operation: 'apply_adaptive_filters',
        query,
        context
      });
      
      console.warn('Erro em filtros adaptativos:', handledError);
      return baseFilters;
    }
  }

  /**
   * Gerar filtros temporais inteligentes
   */
  async generateTemporalFilters(
    context: SuggestionContext = {},
    userIntent?: string
  ): Promise<TemporalFilter[]> {
    try {
      if (!this.config.temporal.enabled) {
        return [];
      }

      const temporalFilters: TemporalFilter[] = [];
      const now = new Date();

      // Filtros baseados em contexto clínico
      switch (context.type) {
        case 'consultation':
          temporalFilters.push(
            ...this.getConsultationTemporalFilters(now, userIntent)
          );
          break;
        case 'patient':
          temporalFilters.push(
            ...this.getPatientTemporalFilters(now, userIntent)
          );
          break;
        case 'medical_record':
          temporalFilters.push(
            ...this.getMedicalRecordTemporalFilters(now, userIntent)
          );
          break;
        default:
          temporalFilters.push(
            ...this.getGeneralTemporalFilters(now)
          );
      }

      // Aplicar bias para dados recentes se configurado
      if (this.config.temporal.recentBias > 0) {
        temporalFilters.forEach(filter => {
          if (filter.type === 'date_range' && filter.range.end) {
            const daysSinceEnd = Math.floor(
              (now.getTime() - filter.range.end.getTime()) / (1000 * 60 * 60 * 24)
            );
            filter.relevance *= Math.exp(-daysSinceEnd * this.config.temporal.recentBias);
          }
        });
      }

      // Ordenar por relevância
      temporalFilters.sort((a, b) => b.relevance - a.relevance);

      await this.logFilterActivity('temporal_filters_generated', {
        context: context.type,
        userIntent,
        filtersCount: temporalFilters.length
      });

      return temporalFilters;

    } catch (error) {
      const handledError = await this.errorHandler.handleFilterError(error, {
        operation: 'generate_temporal_filters',
        context
      });
      
      console.warn('Erro em filtros temporais:', handledError);
      return [];
    }
  }

  /**
   * Aprender padrão de uso de filtros
   */
  async learnFilterUsage(
    filters: SearchFilters,
    query: string,
    context: SuggestionContext,
    interaction: {
      resultsCount: number;
      userSatisfied: boolean;
      clickedResults: number;
      sessionDuration: number;
      refinedQuery: boolean;
    },
    userId?: string
  ): Promise<void> {
    try {
      if (!this.config.adaptive.enabled) {
        return;
      }

      const timestamp = new Date();
      const effectiveness = this.calculateFilterEffectiveness(interaction);

      // Aprender padrões individuais de cada filtro
      for (const [field, value] of Object.entries(filters)) {
        const filterId = `${field}:${JSON.stringify(value)}`;
        
        let pattern = this.filterPatterns.get(filterId);
        if (!pattern) {
          pattern = {
            id: crypto.randomUUID(),
            userId,
            filterId,
            filterField: field,
            filterValue: value,
            contextType: context.type || 'general',
            frequency: 0,
            lastUsed: timestamp,
            effectiveness: 0,
            combinations: [],
            metadata: {}
          };
        }

        // Atualizar padrão com nova interação
        pattern.frequency += 1;
        pattern.lastUsed = timestamp;
        pattern.effectiveness = this.updateEffectiveness(pattern.effectiveness, effectiveness);
        
        // Registrar combinações com outros filtros
        pattern.combinations = Object.keys(filters)
          .filter(f => f !== field)
          .map(f => `${f}:${JSON.stringify(filters[f])}`);

        this.filterPatterns.set(filterId, pattern);

        // Salvar no banco de dados
        await this.saveFilterPattern(pattern);
      }

      // Aprender combinações de filtros
      if (Object.keys(filters).length > 1) {
        await this.learnFilterCombination(filters, context, effectiveness, userId);
      }

      // Atualizar preferências do usuário se aplicável
      if (userId && effectiveness > 0.7) {
        await this.updateUserFilterPreferences(userId, filters, context, effectiveness);
      }

      await this.logFilterActivity('filter_usage_learned', {
        filtersCount: Object.keys(filters).length,
        query,
        context: context.type,
        effectiveness,
        userId: userId || 'anonymous',
        interaction
      });

    } catch (error) {
      const handledError = await this.errorHandler.handleFilterError(error, {
        operation: 'learn_filter_usage',
        query,
        filters: Object.keys(filters)
      });
      
      console.warn('Erro ao aprender uso de filtros:', handledError);
    }
  }

  /**
   * Obter analytics de filtros
   */
  async getFilterAnalytics(
    timeframe: 'hour' | 'day' | 'week' | 'month' = 'day',
    contextType?: string,
    userId?: string
  ): Promise<FilterAnalytics> {
    try {
      const timeframeStart = this.getTimeframeStart(timeframe);
      
      const { data: analytics, error } = await this.supabase
        .rpc('get_filter_analytics', {
          start_date: timeframeStart.toISOString(),
          end_date: new Date().toISOString(),
          context_type: contextType,
          user_id: userId
        });

      if (error) throw error;

      return analytics;

    } catch (error) {
      const handledError = await this.errorHandler.handleFilterError(error, {
        operation: 'get_filter_analytics',
        timeframe,
        contextType
      });
      
      throw handledError;
    }
  }

  /**
   * Otimizar combinações de filtros
   */
  async optimizeFilterCombinations(
    context: SuggestionContext = {},
    userId?: string
  ): Promise<FilterCombinationPattern[]> {
    try {
      const popularCombinations = await this.getPopularFilterCombinations(context, userId);
      const effectiveCombinations = await this.getEffectiveFilterCombinations(context, userId);
      
      // Combinar e ranquear por efetividade
      const allCombinations = [...popularCombinations, ...effectiveCombinations];
      const uniqueCombinations = this.deduplicateCombinations(allCombinations);
      
      const optimizedCombinations = uniqueCombinations
        .filter(combo => combo.effectiveness >= 0.6)
        .sort((a, b) => b.effectiveness - a.effectiveness)
        .slice(0, this.config.combinations.maxCombinations);

      await this.logFilterActivity('filter_combinations_optimized', {
        context: context.type,
        userId: userId || 'anonymous',
        totalCombinations: allCombinations.length,
        optimizedCombinations: optimizedCombinations.length
      });

      return optimizedCombinations;

    } catch (error) {
      const handledError = await this.errorHandler.handleFilterError(error, {
        operation: 'optimize_filter_combinations',
        context
      });
      
      throw handledError;
    }
  }

  // Métodos privados auxiliares

  private async loadExistingPatterns(): Promise<void> {
    try {
      const { data: patterns, error } = await this.supabase
        .from('filter_usage_patterns')
        .select('*')
        .order('frequency', { ascending: false })
        .limit(1000);

      if (error) throw error;

      for (const pattern of patterns) {
        this.filterPatterns.set(pattern.filter_id, {
          id: pattern.id,
          userId: pattern.user_id,
          filterId: pattern.filter_id,
          filterField: pattern.filter_field,
          filterValue: pattern.filter_value,
          contextType: pattern.context_type,
          frequency: pattern.frequency,
          lastUsed: new Date(pattern.last_used),
          effectiveness: pattern.effectiveness,
          combinations: pattern.combinations || [],
          metadata: pattern.metadata || {}
        });
      }

      console.log(`Carregados ${patterns.length} padrões de filtros`);
    } catch (error) {
      console.warn('Erro ao carregar padrões existentes:', error);
    }
  }

  private async getPopularFilters(
    query: string,
    context: SuggestionContext,
    currentFilters: SearchFilters
  ): Promise<SmartFilterSuggestion[]> {
    try {
      const { data: popular, error } = await this.supabase
        .rpc('get_popular_filters', {
          context_type: context.type,
          query_pattern: query.substring(0, 50),
          limit: 5
        });

      if (error) throw error;

      return popular.map((item: any) => ({
        filter: {
          field: item.filter_field,
          value: item.filter_value,
          operator: item.operator || 'equals',
          label: item.label,
          type: item.filter_type,
          relevance: item.relevance
        },
        reason: 'popular',
        confidence: item.confidence,
        expectedImprovement: item.expected_improvement,
        usage: {
          frequency: item.frequency,
          recentUses: item.recent_uses,
          effectiveness: item.effectiveness
        },
        metadata: {
          source: 'popular_filters',
          contextType: context.type
        }
      }));
    } catch (error) {
      console.warn('Erro em filtros populares:', error);
      return [];
    }
  }

  private async getPersonalizedFilters(
    userId: string | undefined,
    query: string,
    context: SuggestionContext,
    currentFilters: SearchFilters
  ): Promise<SmartFilterSuggestion[]> {
    if (!userId) return [];

    try {
      const userPrefs = await this.getUserFilterPreferences(userId);
      const suggestions: SmartFilterSuggestion[] = [];

      for (const [field, value] of Object.entries(userPrefs)) {
        if (!currentFilters[field]) {
          const pattern = this.filterPatterns.get(`${field}:${JSON.stringify(value)}`);
          
          suggestions.push({
            filter: {
              field,
              value,
              operator: 'equals',
              label: this.generateFilterLabel(field, value),
              type: this.inferFilterType(field, value),
              relevance: pattern?.effectiveness || 0.7
            },
            reason: 'personalized',
            confidence: pattern?.effectiveness || 0.7,
            expectedImprovement: 0.15,
            usage: {
              frequency: pattern?.frequency || 0,
              recentUses: this.getRecentUses(pattern),
              effectiveness: pattern?.effectiveness || 0.7
            },
            metadata: {
              source: 'user_preferences',
              userId,
              contextType: context.type
            }
          });
        }
      }

      return suggestions;
    } catch (error) {
      console.warn('Erro em filtros personalizados:', error);
      return [];
    }
  }

  private async getContextualFilters(
    queryAnalysis: any,
    context: SuggestionContext,
    currentFilters: SearchFilters
  ): Promise<SmartFilterSuggestion[]> {
    const suggestions: SmartFilterSuggestion[] = [];

    // Filtros baseados em entidades extraídas da query
    if (queryAnalysis.entities) {
      for (const entity of queryAnalysis.entities) {
        const filterField = this.mapEntityToFilterField(entity.type);
        if (filterField && !currentFilters[filterField]) {
          suggestions.push({
            filter: {
              field: filterField,
              value: entity.value,
              operator: 'contains',
              label: `${entity.type}: ${entity.value}`,
              type: 'text',
              relevance: entity.confidence
            },
            reason: 'contextual',
            confidence: entity.confidence,
            expectedImprovement: 0.2,
            usage: {
              frequency: 0,
              recentUses: 0,
              effectiveness: entity.confidence
            },
            metadata: {
              source: 'entity_extraction',
              entityType: entity.type,
              contextType: context.type
            }
          });
        }
      }
    }

    // Filtros específicos do contexto
    const contextSpecificFilters = this.getContextSpecificFilters(context);
    suggestions.push(...contextSpecificFilters);

    return suggestions;
  }

  private async getTemporalFilters(
    query: string,
    context: SuggestionContext,
    currentFilters: SearchFilters
  ): Promise<SmartFilterSuggestion[]> {
    if (!this.config.temporal.enabled || currentFilters.date_range) {
      return [];
    }

    const suggestions: SmartFilterSuggestion[] = [];
    const now = new Date();

    // Sugerir filtros temporais baseados no contexto
    const temporalSuggestions = [
      {
        label: 'Última semana',
        range: { start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: now },
        relevance: 0.8
      },
      {
        label: 'Último mês',
        range: { start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), end: now },
        relevance: 0.7
      },
      {
        label: 'Hoje',
        range: { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()), end: now },
        relevance: 0.9
      }
    ];

    for (const temporal of temporalSuggestions) {
      suggestions.push({
        filter: {
          field: 'date_range',
          value: temporal.range,
          operator: 'between',
          label: temporal.label,
          type: 'date_range',
          relevance: temporal.relevance
        },
        reason: 'temporal',
        confidence: temporal.relevance,
        expectedImprovement: 0.1,
        usage: {
          frequency: 0,
          recentUses: 0,
          effectiveness: temporal.relevance
        },
        metadata: {
          source: 'temporal_filters',
          contextType: context.type
        }
      });
    }

    return suggestions;
  }

  private async getCombinationFilters(
    currentFilters: SearchFilters,
    context: SuggestionContext,
    userId?: string
  ): Promise<SmartFilterSuggestion[]> {
    if (!this.config.combinations.enabled || Object.keys(currentFilters).length === 0) {
      return [];
    }

    try {
      const suggestions: SmartFilterSuggestion[] = [];
      
      // Buscar combinações conhecidas que incluam os filtros atuais
      for (const [comboId, combination] of this.filterCombinations.entries()) {
        if (combination.contextType === context.type) {
          const missingFilters = combination.filters.filter(filter => 
            !currentFilters[filter.field]
          );

          if (missingFilters.length > 0 && missingFilters.length < combination.filters.length) {
            for (const missingFilter of missingFilters) {
              suggestions.push({
                filter: missingFilter,
                reason: 'combination',
                confidence: combination.confidence,
                expectedImprovement: combination.effectiveness * 0.3,
                usage: {
                  frequency: combination.frequency,
                  recentUses: this.getRecentCombinationUses(combination),
                  effectiveness: combination.effectiveness
                },
                metadata: {
                  source: 'filter_combinations',
                  combinationId: comboId,
                  contextType: context.type
                }
              });
            }
          }
        }
      }

      return suggestions;
    } catch (error) {
      console.warn('Erro em filtros de combinação:', error);
      return [];
    }
  }

  private deduplicateFilterSuggestions(suggestions: SmartFilterSuggestion[]): SmartFilterSuggestion[] {
    const seen = new Map<string, SmartFilterSuggestion>();
    
    for (const suggestion of suggestions) {
      const key = `${suggestion.filter.field}:${JSON.stringify(suggestion.filter.value)}`;
      const existing = seen.get(key);
      
      if (!existing || suggestion.confidence > existing.confidence) {
        seen.set(key, suggestion);
      }
    }
    
    return Array.from(seen.values());
  }

  private rankFilterSuggestions(
    suggestions: SmartFilterSuggestion[],
    query: string,
    context: SuggestionContext,
    currentFilters: SearchFilters,
    userId?: string
  ): SmartFilterSuggestion[] {
    return suggestions
      .map(suggestion => ({
        ...suggestion,
        score: this.calculateFilterSuggestionScore(suggestion, query, context, currentFilters, userId)
      }))
      .sort((a, b) => b.score - a.score);
  }

  private calculateFilterSuggestionScore(
    suggestion: SmartFilterSuggestion,
    query: string,
    context: SuggestionContext,
    currentFilters: SearchFilters,
    userId?: string
  ): number {
    let score = suggestion.confidence * 100;

    // Boost para razão da sugestão
    const reasonBoosts = {
      'personalized': 40,
      'contextual': 30,
      'popular': 20,
      'temporal': 15,
      'combination': 25
    };
    score += reasonBoosts[suggestion.reason] || 0;

    // Boost para efetividade
    score += suggestion.usage.effectiveness * 30;

    // Boost para frequência (normalizada)
    score += Math.log(suggestion.usage.frequency + 1) * 10;

    // Boost para melhoria esperada
    score += suggestion.expectedImprovement * 50;

    // Penalidade para filtros muito específicos se não há contexto
    if (!context.type && suggestion.filter.relevance < 0.5) {
      score *= 0.7;
    }

    return score;
  }

  private shouldApplyAdaptiveFilter(field: string, value: any, context: SuggestionContext): boolean {
    // Lógica para determinar se um filtro adaptativo deve ser aplicado
    const pattern = this.filterPatterns.get(`${field}:${JSON.stringify(value)}`);
    
    if (!pattern) return false;
    
    // Aplicar se o filtro tem alta efetividade e foi usado recentemente
    const daysSinceLastUse = Math.floor(
      (Date.now() - pattern.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return pattern.effectiveness >= this.config.adaptive.adaptationThreshold &&
           daysSinceLastUse <= 30 &&
           pattern.frequency >= 3;
  }

  private async getAutoContextFilters(
    query: string,
    context: SuggestionContext
  ): Promise<SearchFilters> {
    const autoFilters: SearchFilters = {};

    // Aplicar filtros automáticos baseados no contexto
    switch (context.type) {
      case 'patient':
        if (query.toLowerCase().includes('ativo')) {
          autoFilters.status = 'active';
        }
        break;
      case 'consultation':
        if (query.toLowerCase().includes('hoje')) {
          const today = new Date();
          autoFilters.date_range = {
            start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            end: today
          };
        }
        break;
    }

    return autoFilters;
  }

  private async getUserFilterPreferences(userId?: string): Promise<Record<string, any>> {
    if (!userId) return {};

    try {
      let prefs = this.userPreferences.get(userId);
      
      if (!prefs) {
        const { data, error } = await this.supabase
          .from('user_filter_preferences')
          .select('preferences')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        prefs = data?.preferences || {};
        this.userPreferences.set(userId, prefs);
      }

      return prefs;
    } catch (error) {
      console.warn('Erro ao buscar preferências do usuário:', error);
      return {};
    }
  }

  private async getContextFilterPatterns(contextType?: string): Promise<FilterUsagePattern[]> {
    if (!contextType) return [];

    const patterns: FilterUsagePattern[] = [];
    
    for (const [_, pattern] of this.filterPatterns.entries()) {
      if (pattern.contextType === contextType) {
        patterns.push(pattern);
      }
    }

    return patterns.sort((a, b) => b.effectiveness - a.effectiveness);
  }

  private getConsultationTemporalFilters(now: Date, userIntent?: string): TemporalFilter[] {
    const filters: TemporalFilter[] = [
      {
        field: 'consultation_date',
        type: 'date_range',
        range: {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          end: now
        },
        label: 'Consultas de hoje',
        relevance: 0.9
      },
      {
        field: 'consultation_date',
        type: 'date_range',
        range: {
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now
        },
        label: 'Última semana',
        relevance: 0.7
      }
    ];

    return filters;
  }

  private getPatientTemporalFilters(now: Date, userIntent?: string): TemporalFilter[] {
    const filters: TemporalFilter[] = [
      {
        field: 'last_consultation',
        type: 'date_range',
        range: {
          start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: now
        },
        label: 'Pacientes ativos (último mês)',
        relevance: 0.8
      },
      {
        field: 'created_at',
        type: 'date_range',
        range: {
          start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
          end: now
        },
        label: 'Novos pacientes (3 meses)',
        relevance: 0.6
      }
    ];

    return filters;
  }

  private getMedicalRecordTemporalFilters(now: Date, userIntent?: string): TemporalFilter[] {
    const filters: TemporalFilter[] = [
      {
        field: 'record_date',
        type: 'date_range',
        range: {
          start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: now
        },
        label: 'Registros recentes',
        relevance: 0.8
      }
    ];

    return filters;
  }

  private getGeneralTemporalFilters(now: Date): TemporalFilter[] {
    const filters: TemporalFilter[] = [
      {
        field: 'updated_at',
        type: 'date_range',
        range: {
          start: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          end: now
        },
        label: 'Últimas 24 horas',
        relevance: 0.7
      }
    ];

    return filters;
  }

  private calculateFilterEffectiveness(interaction: any): number {
    let effectiveness = 0;

    // Componentes da efetividade
    if (interaction.userSatisfied) effectiveness += 0.4;
    if (interaction.clickedResults > 0) effectiveness += 0.3;
    if (interaction.resultsCount > 0) effectiveness += 0.2;
    if (!interaction.refinedQuery) effectiveness += 0.1;

    return Math.min(effectiveness, 1.0);
  }

  private updateEffectiveness(currentEffectiveness: number, newEffectiveness: number): number {
    // Média ponderada com decaimento
    const alpha = this.config.adaptive.learningRate;
    return currentEffectiveness * (1 - alpha) + newEffectiveness * alpha;
  }

  private async saveFilterPattern(pattern: FilterUsagePattern): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('filter_usage_patterns')
        .upsert({
          id: pattern.id,
          user_id: pattern.userId,
          filter_id: pattern.filterId,
          filter_field: pattern.filterField,
          filter_value: pattern.filterValue,
          context_type: pattern.contextType,
          frequency: pattern.frequency,
          last_used: pattern.lastUsed.toISOString(),
          effectiveness: pattern.effectiveness,
          combinations: pattern.combinations,
          metadata: pattern.metadata,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.warn('Erro ao salvar padrão de filtro:', error);
    }
  }

  private async learnFilterCombination(
    filters: SearchFilters,
    context: SuggestionContext,
    effectiveness: number,
    userId?: string
  ): Promise<void> {
    const combinationKey = Object.keys(filters).sort().join('|');
    
    let combination = this.filterCombinations.get(combinationKey);
    if (!combination) {
      combination = {
        id: crypto.randomUUID(),
        filters: Object.entries(filters).map(([field, value]) => ({
          field,
          value,
          operator: 'equals',
          label: this.generateFilterLabel(field, value),
          type: this.inferFilterType(field, value),
          relevance: 0.8
        })),
        contextType: context.type || 'general',
        frequency: 0,
        effectiveness: 0,
        userTypes: [],
        scenarios: [],
        lastSeen: new Date(),
        confidence: 0
      };
    }

    combination.frequency += 1;
    combination.effectiveness = this.updateEffectiveness(combination.effectiveness, effectiveness);
    combination.lastSeen = new Date();
    combination.confidence = Math.min(combination.frequency / 10, 1.0);

    this.filterCombinations.set(combinationKey, combination);

    // Salvar no banco
    await this.saveFilterCombination(combination);
  }

  private async saveFilterCombination(combination: FilterCombinationPattern): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('filter_combinations')
        .upsert({
          id: combination.id,
          filters: combination.filters,
          context_type: combination.contextType,
          frequency: combination.frequency,
          effectiveness: combination.effectiveness,
          user_types: combination.userTypes,
          scenarios: combination.scenarios,
          last_seen: combination.lastSeen.toISOString(),
          confidence: combination.confidence,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.warn('Erro ao salvar combinação de filtros:', error);
    }
  }

  private async updateUserFilterPreferences(
    userId: string,
    filters: SearchFilters,
    context: SuggestionContext,
    effectiveness: number
  ): Promise<void> {
    try {
      const currentPrefs = await this.getUserFilterPreferences(userId);
      const updatedPrefs = { ...currentPrefs };

      // Atualizar preferências baseadas na efetividade
      for (const [field, value] of Object.entries(filters)) {
        if (effectiveness > 0.8) {
          updatedPrefs[field] = value;
        }
      }

      // Limitar número de preferências
      const prefKeys = Object.keys(updatedPrefs);
      if (prefKeys.length > this.config.adaptive.maxUserFilters) {
        // Remover preferências mais antigas/menos efetivas
        const sortedKeys = prefKeys.sort((a, b) => {
          const patternA = this.filterPatterns.get(`${a}:${JSON.stringify(updatedPrefs[a])}`);
          const patternB = this.filterPatterns.get(`${b}:${JSON.stringify(updatedPrefs[b])}`);
          return (patternB?.effectiveness || 0) - (patternA?.effectiveness || 0);
        });

        const filteredPrefs: Record<string, any> = {};
        for (let i = 0; i < this.config.adaptive.maxUserFilters; i++) {
          const key = sortedKeys[i];
          filteredPrefs[key] = updatedPrefs[key];
        }
        Object.assign(updatedPrefs, filteredPrefs);
      }

      // Salvar preferências atualizadas
      const { error } = await this.supabase
        .from('user_filter_preferences')
        .upsert({
          user_id: userId,
          preferences: updatedPrefs,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Atualizar cache
      this.userPreferences.set(userId, updatedPrefs);

    } catch (error) {
      console.warn('Erro ao atualizar preferências do usuário:', error);
    }
  }

  private getContextSpecificFilters(context: SuggestionContext): SmartFilterSuggestion[] {
    const suggestions: SmartFilterSuggestion[] = [];

    const contextFilters = {
      patient: this.config.contextual.patientContextFilters,
      consultation: this.config.contextual.consultationContextFilters,
      medical_record: this.config.contextual.medicalRecordContextFilters
    };

    const filtersForContext = contextFilters[context.type as keyof typeof contextFilters] || [];

    for (const filterConfig of filtersForContext) {
      // Parse filter configuration (field:value format)
      const [field, value] = filterConfig.split(':');
      
      suggestions.push({
        filter: {
          field,
          value,
          operator: 'equals',
          label: this.generateFilterLabel(field, value),
          type: this.inferFilterType(field, value),
          relevance: 0.8
        },
        reason: 'contextual',
        confidence: 0.8,
        expectedImprovement: 0.15,
        usage: {
          frequency: 0,
          recentUses: 0,
          effectiveness: 0.8
        },
        metadata: {
          source: 'context_specific',
          contextType: context.type
        }
      });
    }

    return suggestions;
  }

  private mapEntityToFilterField(entityType: string): string | null {
    const mapping: Record<string, string> = {
      'person': 'patient_name',
      'procedure': 'procedure_type',
      'condition': 'condition',
      'medication': 'medication',
      'date': 'date_range'
    };

    return mapping[entityType] || null;
  }

  private generateFilterLabel(field: string, value: any): string {
    // Gerar label legível para o filtro
    const fieldLabels: Record<string, string> = {
      'status': 'Status',
      'patient_name': 'Paciente',
      'procedure_type': 'Procedimento',
      'condition': 'Condição',
      'date_range': 'Período'
    };

    const fieldLabel = fieldLabels[field] || field;
    
    if (typeof value === 'object' && value.start && value.end) {
      return `${fieldLabel}: ${value.start.toLocaleDateString()} - ${value.end.toLocaleDateString()}`;
    }

    return `${fieldLabel}: ${value}`;
  }

  private inferFilterType(field: string, value: any): string {
    if (typeof value === 'object' && value.start && value.end) {
      return 'date_range';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (typeof value === 'number') {
      return 'number';
    }
    return 'text';
  }

  private getRecentUses(pattern?: FilterUsagePattern): number {
    if (!pattern) return 0;
    
    const daysSinceLastUse = Math.floor(
      (Date.now() - pattern.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Decaimento exponencial para usos recentes
    return Math.floor(pattern.frequency * Math.exp(-daysSinceLastUse / 30));
  }

  private getRecentCombinationUses(combination: FilterCombinationPattern): number {
    const daysSinceLastSeen = Math.floor(
      (Date.now() - combination.lastSeen.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return Math.floor(combination.frequency * Math.exp(-daysSinceLastSeen / 30));
  }

  private async getPopularFilterCombinations(
    context: SuggestionContext,
    userId?: string
  ): Promise<FilterCombinationPattern[]> {
    const combinations: FilterCombinationPattern[] = [];
    
    for (const [_, combination] of this.filterCombinations.entries()) {
      if (combination.contextType === context.type && combination.frequency >= 5) {
        combinations.push(combination);
      }
    }

    return combinations.sort((a, b) => b.frequency - a.frequency);
  }

  private async getEffectiveFilterCombinations(
    context: SuggestionContext,
    userId?: string
  ): Promise<FilterCombinationPattern[]> {
    const combinations: FilterCombinationPattern[] = [];
    
    for (const [_, combination] of this.filterCombinations.entries()) {
      if (combination.contextType === context.type && combination.effectiveness >= 0.7) {
        combinations.push(combination);
      }
    }

    return combinations.sort((a, b) => b.effectiveness - a.effectiveness);
  }

  private deduplicateCombinations(combinations: FilterCombinationPattern[]): FilterCombinationPattern[] {
    const seen = new Set<string>();
    return combinations.filter(combination => {
      const key = combination.filters.map(f => `${f.field}:${JSON.stringify(f.value)}`).sort().join('|');
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private generateFilterCacheKey(
    query: string,
    currentFilters: SearchFilters,
    context: SuggestionContext,
    userId?: string
  ): string {
    const keyData = {
      query: query.substring(0, 50),
      filters: Object.keys(currentFilters).sort(),
      context: context.type,
      user: userId || 'anonymous'
    };
    
    return `filters:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
  }

  private async getCachedFilterSuggestions(key: string): Promise<SmartFilterSuggestion[] | null> {
    try {
      if (this.redis) {
        const cached = await this.redis.get(key);
        return cached ? JSON.parse(cached) : null;
      }
      return null;
    } catch (error) {
      console.warn('Erro ao acessar cache de filtros:', error);
      return null;
    }
  }

  private async setCachedFilterSuggestions(key: string, suggestions: SmartFilterSuggestion[]): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.setex(key, this.config.cache.ttl, JSON.stringify(suggestions));
      }
    } catch (error) {
      console.warn('Erro ao salvar cache de filtros:', error);
    }
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

  private async logFilterActivity(activity: string, data: any): Promise<void> {
    try {
      await this.auditLogger.logSearchActivity(`filter_${activity}`, data);
    } catch (error) {
      console.warn('Erro ao registrar atividade de filtros:', error);
    }
  }
}

/**
 * Factory para criar instância configurada do ContextualFilterEngine
 */
export function createContextualFilterEngine(): ContextualFilterEngine {
  const config: ContextualFilterConfig = {
    adaptive: {
      enabled: process.env.ENABLE_ADAPTIVE_FILTERS === 'true',
      learningRate: parseFloat(process.env.FILTER_LEARNING_RATE || '0.1'),
      adaptationThreshold: parseFloat(process.env.ADAPTATION_THRESHOLD || '0.7'),
      maxUserFilters: parseInt(process.env.MAX_USER_FILTERS || '10'),
      decayFactor: parseFloat(process.env.FILTER_DECAY_FACTOR || '0.1')
    },
    temporal: {
      enabled: process.env.ENABLE_TEMPORAL_FILTERS === 'true',
      smartRanges: process.env.ENABLE_SMART_RANGES === 'true',
      recentBias: parseFloat(process.env.RECENT_BIAS || '0.05'),
      seasonalPatterns: process.env.ENABLE_SEASONAL_PATTERNS === 'true'
    },
    contextual: {
      enabled: process.env.ENABLE_CONTEXTUAL_FILTERS === 'true',
      patientContextFilters: process.env.PATIENT_CONTEXT_FILTERS?.split(',') || ['status:active'],
      consultationContextFilters: process.env.CONSULTATION_CONTEXT_FILTERS?.split(',') || ['status:scheduled'],
      medicalRecordContextFilters: process.env.MEDICAL_RECORD_CONTEXT_FILTERS?.split(',') || ['type:consultation'],
      autoSuggestThreshold: parseFloat(process.env.AUTO_SUGGEST_THRESHOLD || '0.6')
    },
    combinations: {
      enabled: process.env.ENABLE_FILTER_COMBINATIONS === 'true',
      maxCombinations: parseInt(process.env.MAX_FILTER_COMBINATIONS || '20'),
      popularityWeight: parseFloat(process.env.POPULARITY_WEIGHT || '0.4'),
      effectivenessWeight: parseFloat(process.env.EFFECTIVENESS_WEIGHT || '0.6'),
      learningEnabled: process.env.ENABLE_COMBINATION_LEARNING === 'true'
    },
    cache: {
      enabled: process.env.ENABLE_FILTER_CACHE === 'true',
      ttl: parseInt(process.env.FILTER_CACHE_TTL || '600'), // 10 minutos
      maxSize: parseInt(process.env.FILTER_CACHE_MAX_SIZE || '2000'),
      precomputePopular: process.env.PRECOMPUTE_POPULAR_FILTERS === 'true'
    }
  };

  return new ContextualFilterEngine(config);
}

/**
 * Instância global do ContextualFilterEngine (singleton)
 */
export const contextualFilterEngine = createContextualFilterEngine();

/**
 * Hook para acessar ContextualFilterEngine em componentes React
 */
export function useContextualFilterEngine() {
  return contextualFilterEngine;
}