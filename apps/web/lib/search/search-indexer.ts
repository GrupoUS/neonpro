/**
 * Real-time Search Indexer
 * Story 3.4: Smart Search + NLP Integration
 * Handles real-time indexing of all clinic content for fast search
 */

import { createClient } from '@supabase/supabase-js';
import { nlpEngine, type SupportedLanguage } from './nlp-engine';

// Types
export type IndexableContent = {
  contentType:
    | 'patient'
    | 'appointment'
    | 'treatment'
    | 'note'
    | 'file'
    | 'provider';
  contentId: string;
  searchableText: string;
  metadata?: Record<string, any>;
  keywords?: string[];
  language?: SupportedLanguage;
};

export type SearchIndexEntry = {
  id: string;
  contentType: string;
  contentId: string;
  searchableText: string;
  metadataJson: Record<string, any>;
  keywords: string[];
  language: string;
  relevanceScore: number;
  lastUpdated: string;
};

export type IndexingStats = {
  totalEntries: number;
  lastIndexed: string;
  indexingSpeed: number; // entries per second
  errorCount: number;
};

/**
 * Real-time Search Indexer
 * Maintains up-to-date search index for all clinic content
 */
export class SearchIndexer {
  private readonly supabase: any;
  private readonly indexingQueue: IndexableContent[] = [];
  private isProcessing = false;
  private readonly batchSize = 50;
  private readonly processingInterval = 1000; // 1 second
  private readonly stats: IndexingStats = {
    totalEntries: 0,
    lastIndexed: new Date().toISOString(),
    indexingSpeed: 0,
    errorCount: 0,
  };

  constructor(supabaseUrl?: string, supabaseKey?: string) {
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    // Start processing queue
    this.startProcessing();
  }

  /**
   * Add content to indexing queue
   */
  async indexContent(content: IndexableContent): Promise<void> {
    try {
      // Add to queue for batch processing
      this.indexingQueue.push(content);

      // If queue is getting large, process immediately
      if (this.indexingQueue.length >= this.batchSize) {
        await this.processQueue();
      }
    } catch (_error) {
      this.stats.errorCount++;
    }
  }

  /**
   * Remove content from index
   */
  async removeFromIndex(contentType: string, contentId: string): Promise<void> {
    try {
      if (!this.supabase) {
        return;
      }

      const { error } = await this.supabase
        .from('search_index')
        .delete()
        .eq('content_type', contentType)
        .eq('content_id', contentId);

      if (error) {
        throw error;
      }
    } catch (_error) {
      this.stats.errorCount++;
    }
  }

  /**
   * Update existing index entry
   */
  async updateIndex(content: IndexableContent): Promise<void> {
    await this.indexContent(content);
  }

  /**
   * Bulk index multiple content items
   */
  async bulkIndex(contents: IndexableContent[]): Promise<void> {
    try {
      const startTime = Date.now();

      for (const content of contents) {
        this.indexingQueue.push(content);
      }

      await this.processQueue();

      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;
      this.stats.indexingSpeed = contents.length / processingTime;
    } catch (_error) {
      this.stats.errorCount++;
    }
  }

  /**
   * Search the index
   */
  async search(
    query: string,
    options: {
      language?: SupportedLanguage;
      contentTypes?: string[];
      limit?: number;
      offset?: number;
      filters?: Record<string, any>;
    } = {}
  ): Promise<{
    results: SearchIndexEntry[];
    totalCount: number;
    processingTime: number;
  }> {
    const startTime = Date.now();

    try {
      if (!this.supabase) {
        throw new Error('Supabase client not initialized');
      }

      const {
        language = 'pt',
        contentTypes,
        limit = 20,
        offset = 0,
        filters = {},
      } = options;

      // Process query with NLP
      const nlpResult = await nlpEngine.processQuery(query, language);

      // Build search query
      let searchQuery = this.supabase.rpc('search_with_nlp', {
        p_query: nlpResult.normalized,
        p_language: language,
        p_limit: limit,
        p_offset: offset,
        p_content_types: contentTypes,
      });

      // Apply additional filters
      if (Object.keys(filters).length > 0) {
        for (const [key, value] of Object.entries(filters)) {
          searchQuery = searchQuery.contains('metadata_json', { [key]: value });
        }
      }

      const { data, error, count } = await searchQuery;

      if (error) {
        throw error;
      }

      const processingTime = Date.now() - startTime;

      // Log search analytics
      await this.logSearchAnalytics(
        query,
        nlpResult,
        data?.length || 0,
        processingTime
      );

      return {
        results: data || [],
        totalCount: count || 0,
        processingTime,
      };
    } catch (_error) {
      this.stats.errorCount++;

      return {
        results: [],
        totalCount: 0,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(
    partialQuery: string,
    language: SupportedLanguage = 'pt',
    limit = 10
  ): Promise<string[]> {
    try {
      if (!this.supabase) {
        // Fallback to NLP engine suggestions
        return nlpEngine.getSuggestions(partialQuery, language);
      }

      const { data, error } = await this.supabase
        .from('search_suggestions')
        .select('suggestion_text')
        .ilike('suggestion_text', `${partialQuery}%`)
        .eq('language', language)
        .order('usage_count', { ascending: false })
        .order('relevance_score', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      const suggestions = data?.map((item) => item.suggestion_text) || [];

      // Combine with NLP suggestions if we have fewer than requested
      if (suggestions.length < limit) {
        const nlpSuggestions = nlpEngine.getSuggestions(partialQuery, language);
        const combined = [...suggestions, ...nlpSuggestions];
        return [...new Set(combined)].slice(0, limit);
      }

      return suggestions;
    } catch (_error) {
      return nlpEngine.getSuggestions(partialQuery, language);
    }
  }

  /**
   * Process indexing queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.indexingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const startTime = Date.now();

    try {
      const batch = this.indexingQueue.splice(0, this.batchSize);
      const indexEntries = await Promise.all(
        batch.map((content) => this.prepareIndexEntry(content))
      );

      if (this.supabase) {
        const { error } = await this.supabase
          .from('search_index')
          .upsert(indexEntries, {
            onConflict: 'content_type,content_id',
          });

        if (error) {
          throw error;
        }
      }

      this.stats.totalEntries += batch.length;
      this.stats.lastIndexed = new Date().toISOString();

      const processingTime = (Date.now() - startTime) / 1000;
      this.stats.indexingSpeed = batch.length / processingTime;
    } catch (_error) {
      this.stats.errorCount++;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Prepare content for indexing
   */
  private async prepareIndexEntry(content: IndexableContent): Promise<any> {
    const language = content.language || 'pt';

    // Process with NLP to extract keywords and improve searchability
    const nlpResult = await nlpEngine.processQuery(
      content.searchableText,
      language
    );

    // Extract keywords from NLP tokens and entities
    const keywords = [
      ...nlpResult.tokens,
      ...nlpResult.entities.map((e) => e.value),
      ...(content.keywords || []),
    ];

    // Calculate relevance score based on content type and NLP confidence
    const relevanceScore = this.calculateRelevanceScore(
      content,
      nlpResult.confidence
    );

    return {
      content_type: content.contentType,
      content_id: content.contentId,
      searchable_text: content.searchableText,
      metadata_json: content.metadata || {},
      keywords: [...new Set(keywords)],
      language,
      relevance_score: relevanceScore,
      last_updated: new Date().toISOString(),
    };
  }

  /**
   * Calculate relevance score for content
   */
  private calculateRelevanceScore(
    content: IndexableContent,
    nlpConfidence: number
  ): number {
    let score = 1.0;

    // Boost score based on content type importance
    switch (content.contentType) {
      case 'patient':
        score *= 1.5;
        break;
      case 'appointment':
        score *= 1.3;
        break;
      case 'treatment':
        score *= 1.2;
        break;
      case 'note':
        score *= 1.1;
        break;
      default:
        score *= 1.0;
    }

    // Factor in NLP confidence
    score *= 0.5 + nlpConfidence * 0.5;

    // Boost for longer, more detailed content
    const textLength = content.searchableText.length;
    if (textLength > 500) {
      score *= 1.2;
    } else if (textLength > 100) {
      score *= 1.1;
    }

    return Math.round(score * 100) / 100;
  }

  /**
   * Log search analytics
   */
  private async logSearchAnalytics(
    query: string,
    nlpResult: any,
    resultCount: number,
    responseTime: number
  ): Promise<void> {
    try {
      if (!this.supabase) {
        return;
      }

      const { error } = await this.supabase.from('search_analytics').insert({
        query,
        normalized_query: nlpResult.normalized,
        query_intent: nlpResult.intent.primary,
        results_count: resultCount,
        response_time_ms: responseTime,
        language: nlpResult.language,
        search_filters: {},
        timestamp: new Date().toISOString(),
      });

      if (error) {
      }
    } catch (_error) {}
  }

  /**
   * Start background processing
   */
  private startProcessing(): void {
    setInterval(async () => {
      if (this.indexingQueue.length > 0) {
        await this.processQueue();
      }
    }, this.processingInterval);
  }

  /**
   * Get indexing statistics
   */
  getStats(): IndexingStats {
    return { ...this.stats };
  }

  /**
   * Clear index for content type
   */
  async clearIndex(contentType?: string): Promise<void> {
    try {
      if (!this.supabase) {
        return;
      }

      let query = this.supabase.from('search_index').delete();

      if (contentType) {
        query = query.eq('content_type', contentType);
      } else {
        query = query.neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      }

      const { error } = await query;

      if (error) {
        throw error;
      }
    } catch (_error) {
      this.stats.errorCount++;
    }
  }

  /**
   * Rebuild entire index
   */
  async rebuildIndex(): Promise<void> {
    try {
      // Clear existing index
      await this.clearIndex();
    } catch (_error) {
      this.stats.errorCount++;
    }
  }
}

// Export singleton instance
export const searchIndexer = new SearchIndexer(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
