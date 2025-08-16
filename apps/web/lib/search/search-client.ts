// lib/search/search-client.ts
'use client';

import type {
  GlobalSearchStats,
  SearchQuery,
  SearchResponse,
} from './unified-search';

export class SearchClient {
  /**
   * Executa busca através da API
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('q', query.term);

    if (query.filters?.types) {
      searchParams.set('types', query.filters.types.join(','));
    }

    if (query.filters?.dateRange) {
      searchParams.set('dateFrom', query.filters.dateRange.start.toISOString());
      searchParams.set('dateTo', query.filters.dateRange.end.toISOString());
    }

    if (query.filters?.patientId) {
      searchParams.set('patientId', query.filters.patientId);
    }

    if (query.options?.limit) {
      searchParams.set('limit', query.options.limit.toString());
    }

    if (query.options?.offset) {
      searchParams.set('offset', query.options.offset.toString());
    }

    if (query.options?.sortBy) {
      searchParams.set('sortBy', query.options.sortBy);
    }

    if (query.options?.sortOrder) {
      searchParams.set('sortOrder', query.options.sortOrder);
    }

    if (query.options?.fuzzy) {
      searchParams.set('fuzzy', 'true');
    }

    if (query.options?.highlight) {
      searchParams.set('highlight', 'true');
    }

    const response = await fetch(`/api/search?${searchParams.toString()}`);

    if (!response.ok) {
      throw new Error('Erro na busca');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Erro na busca');
    }

    return result.data;
  }

  /**
   * Busca avançada através da API
   */
  async advancedSearch(criteria: {
    patientName?: string;
    dateRange?: { start: Date; end: Date };
    eventTypes?: string[];
    providers?: string[];
    keywords?: string[];
  }): Promise<SearchResponse> {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'advanced_search',
        criteria,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro na busca avançada');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Erro na busca avançada');
    }

    return result.data;
  }

  /**
   * Salva uma busca através da API
   */
  async saveSearch(
    name: string,
    query: SearchQuery,
    userId: string
  ): Promise<string> {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'save_search',
        name,
        query,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar busca');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Erro ao salvar busca');
    }

    return result.data.id;
  }

  /**
   * Obtém estatísticas através da API
   */
  async getStatistics(timeframe = '30days'): Promise<GlobalSearchStats> {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'get_statistics',
        timeframe,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao obter estatísticas');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Erro ao obter estatísticas');
    }

    return result.data;
  }
}

export const searchClient = new SearchClient();
