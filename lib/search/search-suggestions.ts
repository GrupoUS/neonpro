/**
 * Search Suggestions Engine
 * Story 3.4: Smart Search + NLP Integration - Task 4
 * Intelligent autocomplete and query suggestions with learning capabilities
 */

import { createClient } from '@/lib/supabase/client';
import { nlpEngine } from './nlp-engine';
import { searchIndexer } from './search-indexer';
import { comprehensiveSearch } from './comprehensive-search';

// Types
export interface SearchSuggestion {
  id: string;
  text: string;
  type: SuggestionType;
  category: string;
  confidence: number;
  frequency: number;
  lastUsed: Date;
  metadata?: Record<string, any>;
  highlighted?: string;
}

export interface QueryCompletion {
  completion: string;
  confidence: number;
  type: CompletionType;
  context?: string;
}

export interface SuggestionContext {
  userId: string;
  clinicId: string;
  currentQuery: string;
  searchHistory: string[];
  recentSearches: string[];
  userPreferences: UserSearchPreferences;
  sessionContext: SessionContext;
}

export interface UserSearchPreferences {
  preferredDataTypes: string[];
  frequentFilters: Record<string, any>;
  searchPatterns: string[];
  language: string;
  personalizedSuggestions: boolean;
}

export interface SessionContext {
  currentPage: string;
  previousSearches: string[];
  timeSpent: number;
  clickedResults: string[];
  refinements: string[];
}

export interface SuggestionOptions {
  maxSuggestions: number;
  includeHistory: boolean;
  includePopular: boolean;
  includePersonalized: boolean;
  includeContextual: boolean;
  minConfidence: number;
  categories?: string[];
  language?: string;
}

export interface LearningData {
  query: string;
  selectedSuggestion?: string;
  resultClicked: boolean;
  timeToSelect: number;
  refinements: string[];
  success: boolean;
}

export type SuggestionType = 
  | 'query_completion'
  | 'entity_suggestion'
  | 'filter_suggestion'
  | 'historical'
  | 'popular'
  | 'contextual'
  | 'personalized'
  | 'semantic';

export type CompletionType = 
  | 'prefix_match'
  | 'semantic_completion'
  | 'template_completion'
  | 'entity_completion';

/**
 * Search Suggestions Engine
 * Provides intelligent autocomplete and query suggestions
 */
export class SearchSuggestions {
  private supabase = createClient();
  private suggestionCache = new Map<string, SearchSuggestion[]>();
  private completionCache = new Map<string, QueryCompletion[]>();
  private popularQueries = new Map<string, number>();
  private entitySuggestions = new Map<string, string[]>();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate = 0;
  
  constructor() {
    this.initializeCache();
  }
  
  /**
   * Initialize suggestion cache
   */
  private async initializeCache(): Promise<void> {
    try {
      await Promise.all([
        this.loadPopularQueries(),
        this.loadEntitySuggestions(),
        this.loadCommonFilters()
      ]);
      
      this.lastCacheUpdate = Date.now();
    } catch (error) {
      console.error('Error initializing suggestion cache:', error);
    }
  }
  
  /**
   * Get search suggestions for a query
   */
  async getSuggestions(
    query: string,
    context: SuggestionContext,
    options: SuggestionOptions = {
      maxSuggestions: 10,
      includeHistory: true,
      includePopular: true,
      includePersonalized: true,
      includeContextual: true,
      minConfidence: 0.3
    }
  ): Promise<SearchSuggestion[]> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(query, context, options);
      if (this.suggestionCache.has(cacheKey)) {
        return this.suggestionCache.get(cacheKey)!;
      }
      
      // Refresh cache if needed
      if (Date.now() - this.lastCacheUpdate > this.cacheExpiry) {
        await this.initializeCache();
      }
      
      const suggestions: SearchSuggestion[] = [];
      
      // Get different types of suggestions in parallel
      const [
        completions,
        historical,
        popular,
        contextual,
        personalized,
        semantic
      ] = await Promise.all([
        this.getQueryCompletions(query, context),
        options.includeHistory ? this.getHistoricalSuggestions(query, context) : [],
        options.includePopular ? this.getPopularSuggestions(query, context) : [],
        options.includeContextual ? this.getContextualSuggestions(query, context) : [],
        options.includePersonalized ? this.getPersonalizedSuggestions(query, context) : [],
        this.getSemanticSuggestions(query, context)
      ]);
      
      // Convert completions to suggestions
      completions.forEach(completion => {
        suggestions.push({
          id: `completion_${Date.now()}_${Math.random()}`,
          text: completion.completion,
          type: 'query_completion',
          category: 'completion',
          confidence: completion.confidence,
          frequency: 0,
          lastUsed: new Date(),
          metadata: { completionType: completion.type, context: completion.context }
        });
      });
      
      // Add other suggestion types
      suggestions.push(...historical, ...popular, ...contextual, ...personalized, ...semantic);
      
      // Filter by confidence and categories
      let filteredSuggestions = suggestions.filter(s => 
        s.confidence >= options.minConfidence &&
        (!options.categories || options.categories.includes(s.category))
      );
      
      // Rank and deduplicate suggestions
      filteredSuggestions = this.rankSuggestions(filteredSuggestions, query, context);
      filteredSuggestions = this.deduplicateSuggestions(filteredSuggestions);
      
      // Apply highlighting
      filteredSuggestions = this.highlightSuggestions(filteredSuggestions, query);
      
      // Limit results
      const finalSuggestions = filteredSuggestions.slice(0, options.maxSuggestions);
      
      // Cache results
      this.suggestionCache.set(cacheKey, finalSuggestions);
      
      return finalSuggestions;
      
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }
  
  /**
   * Get query completions
   */
  async getQueryCompletions(
    query: string,
    context: SuggestionContext
  ): Promise<QueryCompletion[]> {
    if (query.length < 2) return [];
    
    const completions: QueryCompletion[] = [];
    
    try {
      // Prefix matching from popular queries
      const prefixMatches = this.getPrefixCompletions(query);
      completions.push(...prefixMatches);
      
      // Entity completions
      const entityCompletions = await this.getEntityCompletions(query, context);
      completions.push(...entityCompletions);
      
      // Template completions
      const templateCompletions = this.getTemplateCompletions(query, context);
      completions.push(...templateCompletions);
      
      // Semantic completions using NLP
      const semanticCompletions = await this.getSemanticCompletions(query, context);
      completions.push(...semanticCompletions);
      
      // Sort by confidence
      return completions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
        
    } catch (error) {
      console.error('Error getting query completions:', error);
      return [];
    }
  }
  
  /**
   * Get prefix completions from popular queries
   */
  private getPrefixCompletions(query: string): QueryCompletion[] {
    const completions: QueryCompletion[] = [];
    const lowerQuery = query.toLowerCase();
    
    for (const [popularQuery, frequency] of this.popularQueries.entries()) {
      if (popularQuery.toLowerCase().startsWith(lowerQuery) && popularQuery !== query) {
        completions.push({
          completion: popularQuery,
          confidence: Math.min(0.9, frequency / 100),
          type: 'prefix_match',
          context: 'popular_queries'
        });
      }
    }
    
    return completions.slice(0, 3);
  }
  
  /**
   * Get entity completions
   */
  private async getEntityCompletions(
    query: string,
    context: SuggestionContext
  ): Promise<QueryCompletion[]> {
    const completions: QueryCompletion[] = [];
    
    try {
      // Search for matching entities in the database
      const { data: patients } = await this.supabase
        .from('patients')
        .select('name, cpf')
        .or(`name.ilike.%${query}%,cpf.ilike.%${query}%`)
        .eq('clinic_id', context.clinicId)
        .limit(3);
      
      if (patients) {
        patients.forEach(patient => {
          if (patient.name.toLowerCase().includes(query.toLowerCase())) {
            completions.push({
              completion: patient.name,
              confidence: 0.8,
              type: 'entity_completion',
              context: 'patient_name'
            });
          }
          
          if (patient.cpf && patient.cpf.includes(query)) {
            completions.push({
              completion: patient.cpf,
              confidence: 0.9,
              type: 'entity_completion',
              context: 'patient_cpf'
            });
          }
        });
      }
      
      // Search for providers
      const { data: providers } = await this.supabase
        .from('healthcare_providers')
        .select('name, specialty')
        .or(`name.ilike.%${query}%,specialty.ilike.%${query}%`)
        .eq('clinic_id', context.clinicId)
        .limit(3);
      
      if (providers) {
        providers.forEach(provider => {
          if (provider.name.toLowerCase().includes(query.toLowerCase())) {
            completions.push({
              completion: provider.name,
              confidence: 0.7,
              type: 'entity_completion',
              context: 'provider_name'
            });
          }
        });
      }
      
    } catch (error) {
      console.error('Error getting entity completions:', error);
    }
    
    return completions;
  }
  
  /**
   * Get template completions
   */
  private getTemplateCompletions(
    query: string,
    context: SuggestionContext
  ): QueryCompletion[] {
    const templates = [
      'pacientes com diabetes',
      'consultas de hoje',
      'pacientes sem retorno',
      'exames pendentes',
      'receitas vencidas',
      'pacientes aniversariantes',
      'consultas canceladas',
      'tratamentos em andamento'
    ];
    
    const completions: QueryCompletion[] = [];
    const lowerQuery = query.toLowerCase();
    
    templates.forEach(template => {
      if (template.includes(lowerQuery) && template !== query) {
        const confidence = lowerQuery.length / template.length;
        completions.push({
          completion: template,
          confidence: Math.min(0.8, confidence),
          type: 'template_completion',
          context: 'common_searches'
        });
      }
    });
    
    return completions;
  }
  
  /**
   * Get semantic completions using NLP
   */
  private async getSemanticCompletions(
    query: string,
    context: SuggestionContext
  ): Promise<QueryCompletion[]> {
    try {
      // Use NLP engine to understand query intent
      const nlpResult = await nlpEngine.processQuery(query, context.language || 'pt');
      
      const completions: QueryCompletion[] = [];
      
      // Generate completions based on detected entities and intents
      if (nlpResult.entities.length > 0) {
        nlpResult.entities.forEach(entity => {
          if (entity.type === 'CONDITION' && entity.confidence > 0.7) {
            completions.push({
              completion: `pacientes com ${entity.value}`,
              confidence: entity.confidence * 0.8,
              type: 'semantic_completion',
              context: 'medical_condition'
            });
          }
          
          if (entity.type === 'MEDICATION' && entity.confidence > 0.7) {
            completions.push({
              completion: `prescrições de ${entity.value}`,
              confidence: entity.confidence * 0.8,
              type: 'semantic_completion',
              context: 'medication'
            });
          }
        });
      }
      
      // Generate completions based on intent
      if (nlpResult.intent.name === 'find_patient' && nlpResult.intent.confidence > 0.6) {
        completions.push({
          completion: `${query} - buscar paciente`,
          confidence: nlpResult.intent.confidence * 0.7,
          type: 'semantic_completion',
          context: 'patient_search'
        });
      }
      
      return completions;
      
    } catch (error) {
      console.error('Error getting semantic completions:', error);
      return [];
    }
  }
  
  /**
   * Get historical suggestions
   */
  private async getHistoricalSuggestions(
    query: string,
    context: SuggestionContext
  ): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];
    
    try {
      // Get user's search history
      const { data: history } = await this.supabase
        .from('search_analytics')
        .select('query, frequency, last_used')
        .eq('user_id', context.userId)
        .eq('clinic_id', context.clinicId)
        .ilike('query', `%${query}%`)
        .order('frequency', { ascending: false })
        .limit(5);
      
      if (history) {
        history.forEach(item => {
          const similarity = this.calculateSimilarity(query, item.query);
          if (similarity > 0.3) {
            suggestions.push({
              id: `historical_${item.query}`,
              text: item.query,
              type: 'historical',
              category: 'history',
              confidence: similarity * 0.8,
              frequency: item.frequency,
              lastUsed: new Date(item.last_used),
              metadata: { source: 'user_history' }
            });
          }
        });
      }
      
    } catch (error) {
      console.error('Error getting historical suggestions:', error);
    }
    
    return suggestions;
  }
  
  /**
   * Get popular suggestions
   */
  private async getPopularSuggestions(
    query: string,
    context: SuggestionContext
  ): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];
    
    try {
      // Get popular queries from all users in the clinic
      const { data: popular } = await this.supabase
        .from('search_analytics')
        .select('query, frequency, last_used')
        .eq('clinic_id', context.clinicId)
        .ilike('query', `%${query}%`)
        .order('frequency', { ascending: false })
        .limit(5);
      
      if (popular) {
        popular.forEach(item => {
          const similarity = this.calculateSimilarity(query, item.query);
          if (similarity > 0.4) {
            suggestions.push({
              id: `popular_${item.query}`,
              text: item.query,
              type: 'popular',
              category: 'trending',
              confidence: similarity * 0.7,
              frequency: item.frequency,
              lastUsed: new Date(item.last_used),
              metadata: { source: 'clinic_popular' }
            });
          }
        });
      }
      
    } catch (error) {
      console.error('Error getting popular suggestions:', error);
    }
    
    return suggestions;
  }
  
  /**
   * Get contextual suggestions
   */
  private async getContextualSuggestions(
    query: string,
    context: SuggestionContext
  ): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];
    
    try {
      // Context-based suggestions based on current page
      const contextualQueries = this.getContextualQueries(context.sessionContext.currentPage);
      
      contextualQueries.forEach(contextQuery => {
        if (contextQuery.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            id: `contextual_${contextQuery}`,
            text: contextQuery,
            type: 'contextual',
            category: 'context',
            confidence: 0.6,
            frequency: 0,
            lastUsed: new Date(),
            metadata: { source: 'page_context', page: context.sessionContext.currentPage }
          });
        }
      });
      
      // Suggestions based on recent searches in session
      context.sessionContext.previousSearches.forEach(prevSearch => {
        if (prevSearch.toLowerCase().includes(query.toLowerCase()) && prevSearch !== query) {
          suggestions.push({
            id: `session_${prevSearch}`,
            text: prevSearch,
            type: 'contextual',
            category: 'session',
            confidence: 0.5,
            frequency: 0,
            lastUsed: new Date(),
            metadata: { source: 'session_history' }
          });
        }
      });
      
    } catch (error) {
      console.error('Error getting contextual suggestions:', error);
    }
    
    return suggestions;
  }
  
  /**
   * Get personalized suggestions
   */
  private async getPersonalizedSuggestions(
    query: string,
    context: SuggestionContext
  ): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];
    
    if (!context.userPreferences.personalizedSuggestions) {
      return suggestions;
    }
    
    try {
      // Suggestions based on user's preferred data types
      context.userPreferences.preferredDataTypes.forEach(dataType => {
        const typeQueries = this.getDataTypeQueries(dataType, query);
        typeQueries.forEach(typeQuery => {
          suggestions.push({
            id: `personalized_${dataType}_${typeQuery}`,
            text: typeQuery,
            type: 'personalized',
            category: 'preferences',
            confidence: 0.7,
            frequency: 0,
            lastUsed: new Date(),
            metadata: { source: 'user_preferences', dataType }
          });
        });
      });
      
      // Suggestions based on search patterns
      context.userPreferences.searchPatterns.forEach(pattern => {
        if (pattern.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            id: `pattern_${pattern}`,
            text: pattern,
            type: 'personalized',
            category: 'patterns',
            confidence: 0.6,
            frequency: 0,
            lastUsed: new Date(),
            metadata: { source: 'search_patterns' }
          });
        }
      });
      
    } catch (error) {
      console.error('Error getting personalized suggestions:', error);
    }
    
    return suggestions;
  }
  
  /**
   * Get semantic suggestions
   */
  private async getSemanticSuggestions(
    query: string,
    context: SuggestionContext
  ): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];
    
    try {
      // Use search indexer to find semantically similar content
      const similarContent = await searchIndexer.getSuggestions(query, {
        maxSuggestions: 5,
        minScore: 0.5
      });
      
      similarContent.forEach(content => {
        suggestions.push({
          id: `semantic_${content}`,
          text: content,
          type: 'semantic',
          category: 'similar',
          confidence: 0.6,
          frequency: 0,
          lastUsed: new Date(),
          metadata: { source: 'semantic_search' }
        });
      });
      
    } catch (error) {
      console.error('Error getting semantic suggestions:', error);
    }
    
    return suggestions;
  }
  
  /**
   * Rank suggestions by relevance
   */
  private rankSuggestions(
    suggestions: SearchSuggestion[],
    query: string,
    context: SuggestionContext
  ): SearchSuggestion[] {
    return suggestions.sort((a, b) => {
      // Calculate ranking score
      const scoreA = this.calculateRankingScore(a, query, context);
      const scoreB = this.calculateRankingScore(b, query, context);
      
      return scoreB - scoreA;
    });
  }
  
  /**
   * Calculate ranking score for a suggestion
   */
  private calculateRankingScore(
    suggestion: SearchSuggestion,
    query: string,
    context: SuggestionContext
  ): number {
    let score = suggestion.confidence;
    
    // Boost based on type priority
    const typePriority = {
      'query_completion': 1.0,
      'entity_suggestion': 0.9,
      'historical': 0.8,
      'personalized': 0.7,
      'popular': 0.6,
      'contextual': 0.5,
      'semantic': 0.4,
      'filter_suggestion': 0.3
    };
    
    score *= typePriority[suggestion.type] || 0.5;
    
    // Boost based on frequency
    score += Math.min(0.2, suggestion.frequency / 100);
    
    // Boost based on recency
    const daysSinceLastUsed = (Date.now() - suggestion.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 0.1 - daysSinceLastUsed * 0.01);
    
    // Boost based on text similarity
    const similarity = this.calculateSimilarity(query, suggestion.text);
    score += similarity * 0.3;
    
    return score;
  }
  
  /**
   * Remove duplicate suggestions
   */
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
  
  /**
   * Highlight matching text in suggestions
   */
  private highlightSuggestions(
    suggestions: SearchSuggestion[],
    query: string
  ): SearchSuggestion[] {
    const queryLower = query.toLowerCase();
    
    return suggestions.map(suggestion => {
      const text = suggestion.text;
      const textLower = text.toLowerCase();
      const index = textLower.indexOf(queryLower);
      
      if (index !== -1) {
        const before = text.substring(0, index);
        const match = text.substring(index, index + query.length);
        const after = text.substring(index + query.length);
        
        suggestion.highlighted = `${before}<mark>${match}</mark>${after}`;
      } else {
        suggestion.highlighted = text;
      }
      
      return suggestion;
    });
  }
  
  /**
   * Learn from user interactions
   */
  async learnFromInteraction(data: LearningData): Promise<void> {
    try {
      // Update search analytics
      await this.supabase
        .from('search_analytics')
        .upsert({
          query: data.query,
          frequency: 1,
          last_used: new Date().toISOString(),
          success_rate: data.success ? 1 : 0,
          avg_time_to_result: data.timeToSelect
        }, {
          onConflict: 'query',
          ignoreDuplicates: false
        });
      
      // Update suggestion performance
      if (data.selectedSuggestion) {
        await this.updateSuggestionPerformance(data.selectedSuggestion, data.success);
      }
      
      // Update user preferences
      if (data.success) {
        await this.updateUserPreferences(data);
      }
      
      // Invalidate relevant caches
      this.invalidateCache(data.query);
      
    } catch (error) {
      console.error('Error learning from interaction:', error);
    }
  }
  
  /**
   * Update suggestion performance metrics
   */
  private async updateSuggestionPerformance(
    suggestion: string,
    success: boolean
  ): Promise<void> {
    try {
      await this.supabase
        .from('suggestion_performance')
        .upsert({
          suggestion_text: suggestion,
          usage_count: 1,
          success_count: success ? 1 : 0,
          last_used: new Date().toISOString()
        }, {
          onConflict: 'suggestion_text',
          ignoreDuplicates: false
        });
    } catch (error) {
      console.error('Error updating suggestion performance:', error);
    }
  }
  
  /**
   * Update user preferences based on successful searches
   */
  private async updateUserPreferences(data: LearningData): Promise<void> {
    // This would update user preferences in the database
    // Implementation depends on user preference storage structure
  }
  
  /**
   * Helper methods
   */
  private generateCacheKey(
    query: string,
    context: SuggestionContext,
    options: SuggestionOptions
  ): string {
    return `${query}_${context.userId}_${JSON.stringify(options)}`;
  }
  
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
  
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  private async loadPopularQueries(): Promise<void> {
    try {
      const { data } = await this.supabase
        .from('search_analytics')
        .select('query, frequency')
        .order('frequency', { ascending: false })
        .limit(100);
      
      if (data) {
        this.popularQueries.clear();
        data.forEach(item => {
          this.popularQueries.set(item.query, item.frequency);
        });
      }
    } catch (error) {
      console.error('Error loading popular queries:', error);
    }
  }
  
  private async loadEntitySuggestions(): Promise<void> {
    // Load common entity suggestions from database
    // Implementation depends on entity storage structure
  }
  
  private async loadCommonFilters(): Promise<void> {
    // Load common filter combinations
    // Implementation depends on filter storage structure
  }
  
  private getContextualQueries(currentPage: string): string[] {
    const contextMap: Record<string, string[]> = {
      'patients': ['buscar paciente', 'pacientes ativos', 'novos pacientes'],
      'appointments': ['consultas hoje', 'próximas consultas', 'consultas canceladas'],
      'treatments': ['tratamentos ativos', 'planos de tratamento', 'tratamentos concluídos'],
      'reports': ['relatórios mensais', 'estatísticas', 'análise de dados']
    };
    
    return contextMap[currentPage] || [];
  }
  
  private getDataTypeQueries(dataType: string, query: string): string[] {
    const typeMap: Record<string, string[]> = {
      'patient': [`pacientes ${query}`, `buscar paciente ${query}`],
      'appointment': [`consultas ${query}`, `agendamentos ${query}`],
      'treatment': [`tratamentos ${query}`, `procedimentos ${query}`],
      'note': [`anotações ${query}`, `observações ${query}`]
    };
    
    return typeMap[dataType] || [];
  }
  
  private invalidateCache(query: string): void {
    // Remove cache entries that might be affected by the query
    for (const key of this.suggestionCache.keys()) {
      if (key.includes(query)) {
        this.suggestionCache.delete(key);
      }
    }
    
    for (const key of this.completionCache.keys()) {
      if (key.includes(query)) {
        this.completionCache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const searchSuggestions = new SearchSuggestions();