// 🛡️ Error Handling & Fallback System - Smart Search + NLP Integration
// NeonPro - Sistema de Tratamento de Erros e Fallbacks
// Quality Standard: ≥9.5/10 (BMad Enhanced)

import { 
  SearchError, 
  NLPProcessingError, 
  SearchIndexError, 
  VectorSearchError, 
  SearchPermissionError,
  SearchQuery,
  SearchResponse,
  SearchResult,
  SearchMode,
  SearchIntent 
} from '@/lib/types/search-types';

export interface ErrorContext {
  userId: string;
  sessionId: string;
  query: string;
  searchMode: SearchMode;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  previousErrors?: ErrorEvent[];
  retryCount: number;
  maxRetries: number;
}

export interface ErrorEvent {
  id: string;
  type: string;
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  resolutionStrategy?: string;
  fallbackUsed?: string;
}

export interface FallbackStrategy {
  name: string;
  priority: number;
  applicableErrors: string[];
  condition: (error: Error, context: ErrorContext) => boolean;
  execute: (error: Error, context: ErrorContext) => Promise<SearchResponse | null>;
  description: string;
  estimatedQuality: number; // 0-1 scale
}

export interface RecoveryAction {
  type: 'retry' | 'fallback' | 'simplify' | 'cache' | 'manual';
  description: string;
  automated: boolean;
  priority: number;
  execute: (context: ErrorContext) => Promise<boolean>;
}

export class SearchErrorHandler {
  private fallbackStrategies: Map<string, FallbackStrategy> = new Map();
  private errorHistory: Map<string, ErrorEvent[]> = new Map();
  private recoveryActions: Map<string, RecoveryAction> = new Map();
  private circuitBreaker: CircuitBreaker;
  private retryPolicy: RetryPolicy;
  private logger: SearchLogger;

  constructor() {
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 30000,
      monitorTimeout: 10000
    });
    this.retryPolicy = new RetryPolicy({
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2
    });
    this.logger = new SearchLogger();
    this.initializeFallbackStrategies();
    this.initializeRecoveryActions();
  }

  /**
   * Handle search error and attempt recovery
   */
  public async handleError(
    error: Error,
    context: ErrorContext
  ): Promise<SearchResponse | null> {
    const errorEvent = this.createErrorEvent(error, context);
    this.logError(errorEvent, context);

    try {
      // Check circuit breaker
      if (!this.circuitBreaker.canExecute()) {
        return await this.executeEmergencyFallback(context);
      }

      // Try recovery strategies in order of priority
      const strategies = this.selectApplicableStrategies(error, context);
      
      for (const strategy of strategies) {
        try {
          console.log(`Attempting recovery strategy: ${strategy.name}`);
          
          const result = await strategy.execute(error, context);
          
          if (result) {
            // Mark error as resolved
            errorEvent.resolved = true;
            errorEvent.resolutionStrategy = strategy.name;
            this.circuitBreaker.recordSuccess();
            
            // Add fallback indicator to response
            result.debugging = {
              ...result.debugging,
              fallbackUsed: strategy.name,
              originalError: error.message,
              recoveryTime: Date.now() - errorEvent.timestamp.getTime()
            };
            
            return result;
          }
        } catch (strategyError) {
          console.warn(`Strategy ${strategy.name} failed:`, strategyError);
          this.logger.warn(`Fallback strategy failed`, {
            strategy: strategy.name,
            originalError: error.message,
            strategyError: strategyError instanceof Error ? strategyError.message : 'Unknown error'
          });
        }
      }

      // All strategies failed - record failure
      this.circuitBreaker.recordFailure();
      
      // Return minimal fallback response
      return this.createMinimalFallbackResponse(context);

    } catch (handlerError) {
      console.error('Error handler itself failed:', handlerError);
      this.logger.error('Error handler failure', {
        originalError: error.message,
        handlerError: handlerError instanceof Error ? handlerError.message : 'Unknown error',
        context
      });
      
      return this.createEmergencyResponse(context);
    }
  }

  /**
   * Create error event for tracking
   */
  private createErrorEvent(error: Error, context: ErrorContext): ErrorEvent {
    const errorEvent: ErrorEvent = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: error.constructor.name,
      code: error instanceof SearchError ? error.code : 'UNKNOWN_ERROR',
      message: error.message,
      severity: this.determineSeverity(error),
      context: {
        userId: context.userId,
        query: context.query,
        retryCount: context.retryCount,
        timestamp: context.timestamp
      },
      timestamp: new Date(),
      resolved: false
    };

    // Add to error history
    const userErrors = this.errorHistory.get(context.userId) || [];
    userErrors.push(errorEvent);
    
    // Keep only last 50 errors per user
    if (userErrors.length > 50) {
      userErrors.splice(0, userErrors.length - 50);
    }
    
    this.errorHistory.set(context.userId, userErrors);

    return errorEvent;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    if (error instanceof SearchPermissionError) return 'high';
    if (error instanceof VectorSearchError) return 'medium';
    if (error instanceof SearchIndexError) return 'high';
    if (error instanceof NLPProcessingError) return 'low';
    
    // Check error message for indicators
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout') || message.includes('network')) return 'medium';
    if (message.includes('authentication') || message.includes('permission')) return 'high';
    if (message.includes('critical') || message.includes('system')) return 'critical';
    
    return 'low';
  }

  /**
   * Select applicable fallback strategies
   */
  private selectApplicableStrategies(
    error: Error, 
    context: ErrorContext
  ): FallbackStrategy[] {
    const applicableStrategies: FallbackStrategy[] = [];

    for (const strategy of this.fallbackStrategies.values()) {
      // Check if strategy applies to this error type
      const errorType = error.constructor.name;
      const errorCode = error instanceof SearchError ? error.code : 'UNKNOWN_ERROR';
      
      const isApplicable = strategy.applicableErrors.includes(errorType) ||
                          strategy.applicableErrors.includes(errorCode) ||
                          strategy.applicableErrors.includes('*');

      if (isApplicable && strategy.condition(error, context)) {
        applicableStrategies.push(strategy);
      }
    }

    // Sort by priority (higher first)
    return applicableStrategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Initialize fallback strategies
   */
  private initializeFallbackStrategies(): void {
    // Strategy 1: Traditional Text Search Fallback
    this.fallbackStrategies.set('traditional_search', {
      name: 'traditional_search',
      priority: 8,
      applicableErrors: ['NLPProcessingError', 'VectorSearchError', 'AI_PROCESSING_ERROR'],
      condition: (error, context) => {
        return context.searchMode !== 'exact' && context.query.length > 0;
      },
      execute: async (error, context) => {
        try {
          // Simplified traditional search
          const simplifiedQuery = this.simplifyQuery(context.query);
          
          // Mock traditional search (replace with actual implementation)
          const results: SearchResult[] = await this.performTraditionalSearch(
            simplifiedQuery, 
            context
          );

          return {
            query: {
              ...this.createSimpleQuery(simplifiedQuery, context),
              mode: 'exact'
            },
            results,
            totalResults: results.length,
            searchTime: 100,
            suggestions: [],
            analytics: this.createMinimalAnalytics(context),
            filters: { applied: [], available: [], suggested: [] },
            pagination: {
              currentPage: 1,
              totalPages: 1,
              hasNext: false,
              hasPrevious: false
            }
          };
        } catch (fallbackError) {
          console.warn('Traditional search fallback failed:', fallbackError);
          return null;
        }
      },
      description: 'Fall back to traditional text-based search when AI processing fails',
      estimatedQuality: 0.6
    });

    // Strategy 2: Cached Results Fallback
    this.fallbackStrategies.set('cached_results', {
      name: 'cached_results',
      priority: 9,
      applicableErrors: ['*'],
      condition: (error, context) => {
        return this.hasCachedResults(context.query, context.userId);
      },
      execute: async (error, context) => {
        try {
          const cachedResults = await this.getCachedResults(context.query, context.userId);
          
          if (cachedResults) {
            // Update timestamp and add fallback indicator
            return {
              ...cachedResults,
              searchTime: 50,
              debugging: {
                ...cachedResults.debugging,
                cacheHit: true,
                cacheAge: Date.now() - (cachedResults as any).cachedAt
              }
            };
          }
          
          return null;
        } catch (cacheError) {
          console.warn('Cache fallback failed:', cacheError);
          return null;
        }
      },
      description: 'Return cached results from previous successful searches',
      estimatedQuality: 0.8
    });

    // Strategy 3: Query Simplification
    this.fallbackStrategies.set('query_simplification', {
      name: 'query_simplification',
      priority: 7,
      applicableErrors: ['NLPProcessingError', 'QUERY_TOO_COMPLEX'],
      condition: (error, context) => {
        return context.query.length > 10 && context.retryCount < 2;
      },
      execute: async (error, context) => {
        try {
          const simplifiedQuery = this.extractKeywords(context.query);
          
          if (simplifiedQuery !== context.query) {
            // Retry with simplified query
            const newContext = {
              ...context,
              query: simplifiedQuery,
              retryCount: context.retryCount + 1
            };
            
            // Mock simplified search
            const results = await this.performSimplifiedSearch(simplifiedQuery, newContext);
            
            return {
              query: this.createSimpleQuery(simplifiedQuery, newContext),
              results,
              totalResults: results.length,
              searchTime: 200,
              suggestions: [{
                query: context.query,
                type: 'query_expansion',
                score: 0.8,
                reason: 'Original complex query'
              }],
              analytics: this.createMinimalAnalytics(newContext),
              filters: { applied: [], available: [], suggested: [] },
              pagination: {
                currentPage: 1,
                totalPages: 1,
                hasNext: false,
                hasPrevious: false
              }
            };
          }
          
          return null;
        } catch (simplificationError) {
          console.warn('Query simplification failed:', simplificationError);
          return null;
        }
      },
      description: 'Simplify complex queries by extracting key terms',
      estimatedQuality: 0.5
    });

    // Strategy 4: Alternative Search Intent
    this.fallbackStrategies.set('alternative_intent', {
      name: 'alternative_intent',
      priority: 6,
      applicableErrors: ['INTENT_RECOGNITION_FAILED', 'NLPProcessingError'],
      condition: (error, context) => {
        return context.query.length > 3;
      },
      execute: async (error, context) => {
        try {
          // Try general search intent
          const generalResults = await this.performGeneralSearch(context.query, context);
          
          return {
            query: {
              ...this.createSimpleQuery(context.query, context),
              intent: 'general_search'
            },
            results: generalResults,
            totalResults: generalResults.length,
            searchTime: 150,
            suggestions: [],
            analytics: this.createMinimalAnalytics(context),
            filters: { applied: [], available: [], suggested: [] },
            pagination: {
              currentPage: 1,
              totalPages: 1,
              hasNext: false,
              hasPrevious: false
            }
          };
        } catch (generalSearchError) {
          console.warn('Alternative intent search failed:', generalSearchError);
          return null;
        }
      },
      description: 'Use general search when specific intent recognition fails',
      estimatedQuality: 0.4
    });

    // Strategy 5: Empty Results with Suggestions
    this.fallbackStrategies.set('empty_with_suggestions', {
      name: 'empty_with_suggestions',
      priority: 3,
      applicableErrors: ['*'],
      condition: (error, context) => true,
      execute: async (error, context) => {
        const suggestions = this.generateHelpfulSuggestions(context.query);
        
        return {
          query: this.createSimpleQuery(context.query, context),
          results: [],
          totalResults: 0,
          searchTime: 10,
          suggestions,
          analytics: this.createMinimalAnalytics(context),
          filters: { applied: [], available: [], suggested: [] },
          pagination: {
            currentPage: 1,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false
          }
        };
      },
      description: 'Return empty results with helpful suggestions',
      estimatedQuality: 0.2
    });
  }

  /**
   * Initialize recovery actions
   */
  private initializeRecoveryActions(): void {
    this.recoveryActions.set('retry_with_backoff', {
      type: 'retry',
      description: 'Retry the failed operation with exponential backoff',
      automated: true,
      priority: 8,
      execute: async (context) => {
        if (context.retryCount >= context.maxRetries) return false;
        
        const delay = this.retryPolicy.calculateDelay(context.retryCount);
        await this.sleep(delay);
        
        return true;
      }
    });

    this.recoveryActions.set('clear_cache', {
      type: 'cache',
      description: 'Clear relevant caches and retry',
      automated: true,
      priority: 6,
      execute: async (context) => {
        try {
          await this.clearUserCache(context.userId);
          return true;
        } catch (error) {
          return false;
        }
      }
    });

    this.recoveryActions.set('fallback_to_basic', {
      type: 'fallback',
      description: 'Use basic search functionality',
      automated: true,
      priority: 5,
      execute: async (context) => {
        // This is handled by fallback strategies
        return true;
      }
    });
  }

  /**
   * Helper methods for fallback strategies
   */
  private simplifyQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/[^\w\sáàâãéèêíïóôõöúçñ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(word => word.length > 2)
      .slice(0, 5) // Take first 5 meaningful words
      .join(' ');
  }

  private extractKeywords(query: string): string {
    const stopWords = new Set([
      'a', 'o', 'e', 'é', 'de', 'do', 'da', 'em', 'um', 'uma', 'para', 'com', 'se',
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by'
    ]);

    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => !stopWords.has(word) && word.length > 2)
      .slice(0, 3) // Take top 3 keywords
      .join(' ');
  }

  private async performTraditionalSearch(
    query: string, 
    context: ErrorContext
  ): Promise<SearchResult[]> {
    // Mock implementation - replace with actual search logic
    return [
      {
        id: 'fallback_1',
        entityType: 'patient',
        title: `Resultados para: ${query}`,
        description: 'Resultado de busca tradicional (fallback)',
        content: query,
        highlights: [],
        score: 0.5,
        relevanceScore: 0.5,
        metadata: { fallback: true },
        dataCategory: 'public',
        lastModified: new Date(),
        accessLevel: 'public',
        complianceFlags: []
      }
    ];
  }

  private async performSimplifiedSearch(
    query: string, 
    context: ErrorContext
  ): Promise<SearchResult[]> {
    // Mock implementation
    return [];
  }

  private async performGeneralSearch(
    query: string, 
    context: ErrorContext
  ): Promise<SearchResult[]> {
    // Mock implementation
    return [];
  }

  private generateHelpfulSuggestions(query: string) {
    return [
      {
        query: "pacientes",
        type: 'autocomplete' as const,
        score: 0.8,
        reason: "Buscar informações de pacientes"
      },
      {
        query: "agendamentos hoje",
        type: 'related_search' as const,
        score: 0.7,
        reason: "Ver agendamentos de hoje"
      },
      {
        query: "procedimentos",
        type: 'autocomplete' as const,
        score: 0.6,
        reason: "Listar procedimentos disponíveis"
      }
    ];
  }

  private hasCachedResults(query: string, userId: string): boolean {
    // Mock implementation - check if cached results exist
    return false;
  }

  private async getCachedResults(query: string, userId: string): Promise<SearchResponse | null> {
    // Mock implementation - get cached results
    return null;
  }

  private createSimpleQuery(query: string, context: ErrorContext) {
    return {
      query,
      mode: 'natural_language' as SearchMode,
      context: 'general' as const,
      filters: [],
      sortBy: 'relevance',
      sortOrder: 'desc' as const,
      limit: 10,
      offset: 0,
      includeHighlights: false,
      includeSuggestions: true,
      includeAnalytics: false,
      vectorSearchEnabled: false,
      userId: context.userId,
      sessionId: context.sessionId
    };
  }

  private createMinimalAnalytics(context: ErrorContext) {
    return {
      queryId: `fallback_${Date.now()}`,
      userId: context.userId,
      sessionId: context.sessionId,
      timestamp: new Date(),
      query: context.query,
      intent: 'general_search' as SearchIntent,
      context: 'general' as const,
      totalResults: 0,
      clickedResults: [],
      searchTime: 0,
      abandoned: false,
      refinements: []
    };
  }

  private async executeEmergencyFallback(context: ErrorContext): Promise<SearchResponse> {
    return {
      query: this.createSimpleQuery(context.query, context),
      results: [],
      totalResults: 0,
      searchTime: 5,
      suggestions: this.generateHelpfulSuggestions(context.query),
      analytics: this.createMinimalAnalytics(context),
      filters: { applied: [], available: [], suggested: [] },
      pagination: {
        currentPage: 1,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      },
      debugging: {
        emergencyFallback: true,
        circuitBreakerOpen: true
      }
    };
  }

  private createMinimalFallbackResponse(context: ErrorContext): SearchResponse {
    return {
      query: this.createSimpleQuery(context.query, context),
      results: [],
      totalResults: 0,
      searchTime: 10,
      suggestions: this.generateHelpfulSuggestions(context.query),
      analytics: this.createMinimalAnalytics(context),
      filters: { applied: [], available: [], suggested: [] },
      pagination: {
        currentPage: 1,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      },
      debugging: {
        allStrategiesFailed: true,
        fallbackResponse: true
      }
    };
  }

  private createEmergencyResponse(context: ErrorContext): SearchResponse {
    return {
      query: this.createSimpleQuery('', context),
      results: [],
      totalResults: 0,
      searchTime: 1,
      suggestions: [],
      analytics: this.createMinimalAnalytics(context),
      filters: { applied: [], available: [], suggested: [] },
      pagination: {
        currentPage: 1,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      },
      debugging: {
        emergencyResponse: true,
        systemError: true
      }
    };
  }

  private logError(errorEvent: ErrorEvent, context: ErrorContext): void {
    this.logger.error('Search error occurred', {
      errorId: errorEvent.id,
      errorType: errorEvent.type,
      errorCode: errorEvent.code,
      message: errorEvent.message,
      severity: errorEvent.severity,
      userId: context.userId,
      query: context.query,
      retryCount: context.retryCount
    });
  }

  private async clearUserCache(userId: string): Promise<void> {
    // Mock implementation - clear user-specific cache
    console.log(`Clearing cache for user: ${userId}`);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get error statistics for monitoring
   */
  public getErrorStatistics(userId?: string) {
    const userErrors = userId ? this.errorHistory.get(userId) || [] : [];
    const allErrors = Array.from(this.errorHistory.values()).flat();

    return {
      userErrorCount: userErrors.length,
      totalErrorCount: allErrors.length,
      recentErrors: userErrors.slice(-10),
      errorsByType: this.groupErrorsByType(allErrors),
      errorsBySeverity: this.groupErrorsBySeverity(allErrors),
      circuitBreakerState: this.circuitBreaker.getState(),
      fallbackStrategies: Array.from(this.fallbackStrategies.keys())
    };
  }

  private groupErrorsByType(errors: ErrorEvent[]) {
    return errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupErrorsBySeverity(errors: ErrorEvent[]) {
    return errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

/**
 * Circuit Breaker for preventing cascade failures
 */
class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime?: Date;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private config: {
      failureThreshold: number;
      resetTimeout: number;
      monitorTimeout: number;
    }
  ) {}

  canExecute(): boolean {
    if (this.state === 'CLOSED') return true;
    
    if (this.state === 'OPEN') {
      const timeSinceLastFailure = this.lastFailureTime ? 
        Date.now() - this.lastFailureTime.getTime() : 0;
      
      if (timeSinceLastFailure >= this.config.resetTimeout) {
        this.state = 'HALF_OPEN';
        return true;
      }
      
      return false;
    }
    
    // HALF_OPEN state
    return true;
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * Retry Policy for handling transient failures
 */
class RetryPolicy {
  constructor(
    private config: {
      maxRetries: number;
      baseDelay: number;
      maxDelay: number;
      backoffMultiplier: number;
    }
  ) {}

  calculateDelay(retryCount: number): number {
    const delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, retryCount);
    return Math.min(delay, this.config.maxDelay);
  }

  shouldRetry(retryCount: number, error: Error): boolean {
    if (retryCount >= this.config.maxRetries) return false;
    
    // Don't retry permission errors
    if (error instanceof SearchPermissionError) return false;
    
    return true;
  }
}

/**
 * Logger for search operations
 */
class SearchLogger {
  error(message: string, context: any): void {
    console.error(`[SearchError] ${message}`, context);
  }

  warn(message: string, context: any): void {
    console.warn(`[SearchWarn] ${message}`, context);
  }

  info(message: string, context: any): void {
    console.info(`[SearchInfo] ${message}`, context);
  }
}

export { SearchErrorHandler, CircuitBreaker, RetryPolicy, SearchLogger };